/** Original local teaching service. Node.js 24+. No packages, keys, or model calls.
 * Stores synthetic reconciliation receipts; it does not authorize or move money.
 * Run: node builder-service.mjs   Test: node builder-service.mjs --self-test
 */
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

const sample = {
	operationId: 'reconcile-001',
	invoiceId: 'INV-0012',
	amount: '300.00',
	payments: [
		{ id: 'P1', amount: '80.00' },
		{ id: 'P2', amount: '40.00' },
		{ id: 'P2', amount: '40.00' }
	]
};
const failure = (status, code, message) => Object.assign(new Error(message), { status, code });
const identity = (value) =>
	typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,59}$/.test(value);
function cents(value) {
	if (typeof value !== 'string' || !/^\d{1,12}(\.\d{1,2})?$/.test(value))
		throw failure(
			422,
			'AMOUNT',
			'Amounts must be nonnegative decimal strings with up to two decimal places.'
		);
	const [whole, fraction = ''] = value.split('.');
	return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}
function validate(input) {
	if (
		!input ||
		typeof input !== 'object' ||
		Array.isArray(input) ||
		!identity(input.operationId) ||
		!identity(input.invoiceId) ||
		!Array.isArray(input.payments) ||
		input.payments.length > 100
	)
		throw failure(
			422,
			'SCHEMA',
			'Expected operationId, invoiceId, amount and at most 100 payment records.'
		);
	if (
		Object.keys(input).some(
			(key) => !['operationId', 'invoiceId', 'amount', 'payments'].includes(key)
		)
	)
		throw failure(422, 'SCHEMA', 'Unknown request field.');
	const amountMinor = cents(input.amount).toString();
	const payments = input.payments.map((p) => {
		if (!p || !identity(p.id) || Object.keys(p).some((key) => !['id', 'amount'].includes(key)))
			throw failure(422, 'SCHEMA', 'Each payment needs only an id and amount.');
		return { id: p.id, amountMinor: cents(p.amount).toString() };
	});
	return { operationId: input.operationId, invoiceId: input.invoiceId, amountMinor, payments };
}
function reconcile(input) {
	const seen = new Map(),
		duplicateIds = [];
	for (const p of input.payments) {
		if (seen.has(p.id)) {
			if (seen.get(p.id) !== p.amountMinor)
				throw failure(
					409,
					'CONFLICTING_PAYMENT',
					'The same payment identity has different amounts; resolve the evidence.'
				);
			duplicateIds.push(p.id);
		} else seen.set(p.id, p.amountMinor);
	}
	const paidMinor = [...seen.values()].reduce((sum, n) => sum + BigInt(n), 0n);
	return {
		invoiceId: input.invoiceId,
		amountMinor: input.amountMinor,
		paidMinor: paidMinor.toString(),
		outstandingMinor: (BigInt(input.amountMinor) - paidMinor).toString(),
		duplicateIds,
		currency: 'USD',
		scope: 'Synthetic reconciliation only; no posting or payment'
	};
}
async function readBody(req) {
	if (req.headers['content-type']?.split(';')[0] !== 'application/json')
		throw failure(415, 'CONTENT_TYPE', 'Send application/json.');
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		size += chunk.length;
		if (size > 32768) throw failure(413, 'SIZE', 'Maximum request body is 32 KiB.');
		chunks.push(chunk);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString('utf8'));
	} catch {
		throw failure(400, 'JSON', 'Malformed JSON.');
	}
}
function json(res, status, body) {
	res.writeHead(status, {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-store',
		'X-Content-Type-Options': 'nosniff'
	});
	res.end(JSON.stringify(body, null, 2));
}
export async function createService(directory) {
	await mkdir(directory, { recursive: true });
	const path = join(directory, 'state.json');
	let state = { version: 1, sequence: 0, receipts: {}, events: [] };
	try {
		state = JSON.parse(await readFile(path, 'utf8'));
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	if (
		state.version !== 1 ||
		!Number.isSafeInteger(state.sequence) ||
		state.sequence < 0 ||
		!state.receipts ||
		!Array.isArray(state.events)
	)
		throw Error('Invalid local state; preserve the file and investigate.');
	const clients = new Set();
	let tail = Promise.resolve();
	const send = (res, event) =>
		res.write(`id: ${event.id}\nevent: receipt\ndata: ${JSON.stringify(event)}\n\n`);
	async function commit(input) {
		const { operationId, ...intent } = input;
		const fingerprint = createHash('sha256').update(JSON.stringify(intent)).digest('hex');
		if (Object.hasOwn(state.receipts, operationId)) {
			const receipt = state.receipts[operationId];
			if (receipt.fingerprint !== fingerprint)
				throw failure(409, 'OPERATION_REUSE', 'That operation ID belongs to a different request.');
			return { replayed: true, ...receipt };
		}
		const result = reconcile(input);
		const revision = state.sequence + 1;
		const receipt = { operationId, fingerprint, revision, result };
		const event = {
			id: revision,
			operationId,
			invoiceId: input.invoiceId,
			type: 'receipt_committed'
		};
		const next = {
			version: 1,
			sequence: revision,
			receipts: { ...state.receipts, [operationId]: receipt },
			events: [...state.events, event].slice(-100)
		};
		await writeFile(path + '.next', JSON.stringify(next, null, 2));
		await rename(path + '.next', path);
		state = next;
		for (const res of clients) send(res, event);
		return { replayed: false, ...receipt };
	}
	const server = createServer(async (req, res) => {
		try {
			// One loopback process, no cross-origin browser requests. This is not user authentication.
			if (req.headers.origin)
				throw failure(
					403,
					'ORIGIN',
					'This terminal teaching API does not accept browser-origin requests.'
				);
			const url = new URL(req.url, 'http://127.0.0.1');
			if (req.method === 'GET' && url.pathname === '/api/sample') return json(res, 200, sample);
			if (req.method === 'GET' && url.pathname === '/api/events') {
				const after = Number(req.headers['last-event-id'] ?? url.searchParams.get('after') ?? 0);
				if (!Number.isSafeInteger(after) || after < 0 || after > state.sequence)
					throw failure(400, 'CURSOR', 'Invalid event cursor.');
				res.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					'X-Accel-Buffering': 'no'
				});
				res.write(': connected\n\n');
				if (state.events.length && after < state.events[0].id - 1)
					res.write(
						`id: ${state.sequence}\nevent: resync\ndata: ${JSON.stringify({ sequence: state.sequence, reason: 'Replay window expired; fetch operation status.' })}\n\n`
					);
				else for (const event of state.events.filter((e) => e.id > after)) send(res, event);
				clients.add(res);
				const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000);
				req.on('close', () => {
					clearInterval(heartbeat);
					clients.delete(res);
				});
				return;
			}
			if (req.method === 'GET' && url.pathname.startsWith('/api/operations/')) {
				const id = decodeURIComponent(url.pathname.slice('/api/operations/'.length));
				if (!identity(id)) throw failure(400, 'IDENTITY', 'Invalid operation ID.');
				if (!Object.hasOwn(state.receipts, id))
					throw failure(404, 'UNKNOWN', 'No committed receipt for this identity.');
				return json(res, 200, state.receipts[id]);
			}
			if (req.method === 'POST' && url.pathname === '/api/reconcile') {
				const input = validate(await readBody(req));
				// Serialize the read-check-write transaction within this one process.
				const pending = tail.then(() => commit(input));
				tail = pending.catch(() => {});
				return json(res, 200, await pending);
			}
			throw failure(
				404,
				'ROUTE',
				'Use GET /api/sample, POST /api/reconcile, GET /api/operations/{id}, or GET /api/events.'
			);
		} catch (error) {
			if (!res.headersSent)
				json(res, error.status ?? 500, {
					error: error.code ?? 'INTERNAL',
					message: error.status
						? error.message
						: 'Storage or runtime failure; inspect the local server.'
				});
			else res.end();
		}
	});
	return {
		server,
		close: async () => {
			for (const client of clients) client.end();
			await new Promise((resolve, reject) =>
				server.close((error) => (error ? reject(error) : resolve()))
			);
		}
	};
}
async function start(directory, port) {
	const service = await createService(directory);
	await new Promise((resolve) => service.server.listen(port, '127.0.0.1', resolve));
	return service;
}
async function selfTest() {
	const directory = await mkdtemp(join(tmpdir(), 'ai-accountant-service-'));
	let service = await start(directory, 0);
	const origin = () => `http://127.0.0.1:${service.server.address().port}`;
	const post = (body) =>
		fetch(origin() + '/api/reconcile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	try {
		const pair = await Promise.all([post(sample), post(sample)]);
		const results = await Promise.all(pair.map((r) => r.json()));
		assert.equal(results.filter((r) => r.replayed).length, 1);
		assert.equal(results[0].result.outstandingMinor, '18000');
		assert.equal(results[0].revision, 1);
		assert.equal((await post({ ...sample, amount: '301.00' })).status, 409);
		assert.equal(
			(
				await post({
					...sample,
					operationId: 'bad-payment',
					payments: [
						{ id: 'P1', amount: '1.00' },
						{ id: 'P1', amount: '2.00' }
					]
				})
			).status,
			409
		);
		assert.equal(
			(await post({ ...sample, operationId: 'bad-number', amount: '1.234' })).status,
			422
		);
		assert.equal((await post({ ...sample, operationId: 'constructor' })).status, 200); // Own-property checks avoid inherited-name collisions.
		await service.close();
		service = await start(directory, 0);
		const replay = await (await post(sample)).json();
		assert.equal(replay.replayed, true);
		assert.equal(replay.revision, 1);
		const controller = new AbortController();
		const stream = await fetch(origin() + '/api/events?after=0', {
			signal: AbortSignal.any([controller.signal, AbortSignal.timeout(3000)])
		});
		const reader = stream.body.getReader();
		const decoder = new TextDecoder();
		let text = '';
		// HTTP chunks need not coincide with complete SSE records.
		while (!text.includes('receipt_committed') || !text.includes('\n\n')) {
			const chunk = await reader.read();
			if (chunk.done) break;
			text += decoder.decode(chunk.value, { stream: true });
		}
		assert.match(text, /receipt_committed/);
		assert.match(text, /id: 1/);
		controller.abort();
		console.log(
			'Passed: exact amounts, duplicate handling, concurrent retry, conflicting identities, schema rejection, restart recovery, and event replay.'
		);
	} finally {
		await service.close();
		await rm(directory, { recursive: true, force: true });
	}
}
if (process.argv.includes('--self-test')) await selfTest();
else {
	const service = await start(join(process.cwd(), '.builder-service'), 8787);
	console.log(
		'Synthetic teaching API: http://127.0.0.1:8787/api/sample\nState: .builder-service/state.json\nRead builder-guide.md for requests and explicit limits.'
	);
	process.once('SIGINT', async () => {
		await service.close();
		process.exit(0);
	});
}
