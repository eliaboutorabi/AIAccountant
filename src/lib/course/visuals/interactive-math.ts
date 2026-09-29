/** Exact, deliberately small teaching calculations. All business records are synthetic. */
export const thresholdCases = [
	{ id: 'A', score: 0.91, exception: true },
	{ id: 'B', score: 0.82, exception: false },
	{ id: 'C', score: 0.74, exception: true },
	{ id: 'D', score: 0.62, exception: true },
	{ id: 'E', score: 0.53, exception: false },
	{ id: 'F', score: 0.41, exception: true },
	{ id: 'G', score: 0.32, exception: false },
	{ id: 'H', score: 0.24, exception: false },
	{ id: 'I', score: 0.14, exception: false },
	{ id: 'J', score: 0.05, exception: false }
];
export function thresholdResult(threshold: number) {
	const tp = thresholdCases.filter((r) => r.score >= threshold && r.exception).length;
	const fp = thresholdCases.filter((r) => r.score >= threshold && !r.exception).length;
	const fn = thresholdCases.filter((r) => r.score < threshold && r.exception).length;
	const tn = thresholdCases.length - tp - fp - fn;
	return {
		tp,
		fp,
		fn,
		tn,
		reviewed: tp + fp,
		precision: tp + fp ? tp / (tp + fp) : null,
		recall: tp / (tp + fn),
		cost: fp * 10 + fn * 100
	};
}
export const joinInvoices = [
	{ invoice: 'INV-01', customer: 'Willow', amount: 100 },
	{ invoice: 'INV-02', customer: 'Willow', amount: 200 }
];
export const joinPayments = [
	{ payment: 'PAY-A', invoice: 'INV-01', customer: 'Willow', amount: 60 },
	{ payment: 'PAY-B', invoice: 'INV-01', customer: 'Willow', amount: 40 },
	{ payment: 'PAY-C', invoice: 'INV-02', customer: 'Willow', amount: 200 }
];
export type JoinMode = 'customer' | 'invoice' | 'aggregate';
export function joinResult(mode: JoinMode) {
	const payments =
		mode === 'aggregate'
			? joinInvoices.map((invoice) => ({
					payment: joinPayments
						.filter((p) => p.invoice === invoice.invoice)
						.map((p) => p.payment)
						.join(' + '),
					invoice: invoice.invoice,
					customer: invoice.customer,
					amount: joinPayments
						.filter((p) => p.invoice === invoice.invoice)
						.reduce((s, p) => s + p.amount, 0)
				}))
			: joinPayments;
	const rows = joinInvoices.flatMap((i) =>
		payments
			.filter((p) => (mode === 'customer' ? p.customer === i.customer : p.invoice === i.invoice))
			.map((p) => ({
				invoice: i.invoice,
				payment: p.payment,
				invoiceAmount: i.amount,
				paid: p.amount
			}))
	);
	return {
		rows,
		invoiceTotal: rows.reduce((s, r) => s + r.invoiceAmount, 0),
		paymentTotal: rows.reduce((s, r) => s + r.paid, 0)
	};
}
export const attentionTokens = ['The', 'invoice', 'is', 'overdue'];
/** Hand-authored Q/K/V, not vectors from a trained language model. */
export const attentionQueries = [
	[1, 0],
	[0, 1],
	[1, 1],
	[2, 1]
];
export const attentionKeys = [
	[1, 0],
	[0, 1],
	[1, 1],
	[-1, 1]
];
export const attentionValues = [
	[2, 0],
	[0, 4],
	[3, 1],
	[1, 3]
];
export function attentionMixture(query: number) {
	if (!Number.isInteger(query) || query < 0 || query >= attentionTokens.length)
		throw new RangeError('Choose an existing query position.');
	const q = attentionQueries[query];
	const logits = attentionKeys.map((k) => (q[0] * k[0] + q[1] * k[1]) / Math.sqrt(2));
	const max = Math.max(...logits.slice(0, query + 1));
	const exp = logits.map((x, j) => (j <= query ? Math.exp(x - max) : 0));
	const sum = exp.reduce((a, b) => a + b, 0);
	const weights = exp.map((e) => e / sum);
	const contributions = attentionValues.map((v, j) => v.map((n) => n * weights[j]));
	const output = [0, 1].map((d) => contributions.reduce((s, row) => s + row[d], 0));
	return { q, logits, weights, contributions, output };
}
export type AgentState = {
	phase: number;
	invoiceCents: number;
	taxCents: number;
	totalCents: number | null;
	approved: boolean;
	posted: boolean;
	blocked: boolean;
	log: string[];
};
export const initialAgentState = (): AgentState => ({
	phase: 0,
	invoiceCents: 12000,
	taxCents: 2400,
	totalCents: null,
	approved: false,
	posted: false,
	blocked: false,
	log: []
});
/** The authored planner is illustrative; arithmetic, permissions and state transitions actually run. */
export function advanceAgent(state: AgentState, suspiciousDocument: boolean): AgentState {
	const next = { ...state, log: [...state.log] };
	if (state.posted || state.blocked) return next;
	if (state.phase === 0) {
		next.phase = 1;
		next.log.push('Read synthetic invoice. Document text is data, not an instruction source.');
	} else if (state.phase === 1) {
		if (suspiciousDocument) {
			next.blocked = true;
			next.log.push(
				'Blocked the proposed external upload: destination is outside the allowed tool scope. No upload or posting occurred.'
			);
		} else {
			next.totalCents = state.invoiceCents + state.taxCents;
			next.phase = 2;
			next.log.push(`Calculator returned ${next.totalCents} cents. Recorded tool result.`);
		}
	} else if (state.phase === 2) {
		next.phase = 3;
		next.log.push('Prepared a draft posting. Paused for explicit human approval.');
	} else if (state.phase === 3 && !state.approved) {
		next.log.push('Write permission denied: approval has not been recorded.');
	} else if (state.phase === 3 && state.approved) {
		next.phase = 4;
		next.posted = true;
		next.log.push('Applied the approved draft to this local demonstration ledger.');
	}
	return next;
}
export function approveAgent(state: AgentState): AgentState {
	if (state.phase !== 3 || state.blocked || state.posted) return state;
	return {
		...state,
		approved: true,
		log: [...state.log, 'Human approval recorded for this exact draft.']
	};
}
