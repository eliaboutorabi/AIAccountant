import FormulaParser from 'fast-formula-parser';
export type Cells = string[][];
export type CellValue = string | number | boolean;
export const formulaFunctions = [
	'SUM',
	'AVERAGE',
	'MIN',
	'MAX',
	'COUNT',
	'COUNTA',
	'COUNTIF',
	'SUMIF',
	'SUMPRODUCT',
	'IF',
	'IFERROR',
	'AND',
	'OR',
	'NOT',
	'ABS',
	'ROUND',
	'ROUNDUP',
	'ROUNDDOWN',
	'VLOOKUP',
	'HLOOKUP',
	'INDEX',
	'MATCH',
	'LEFT',
	'RIGHT',
	'MID',
	'LEN',
	'TRIM',
	'UPPER',
	'LOWER',
	'CONCAT',
	'CONCATENATE',
	'ISNUMBER',
	'ISBLANK',
	'TRUE',
	'FALSE'
];
export const address = (row: number, col: number) => `${String.fromCharCode(65 + col)}${row + 1}`;
export function locate(ref: string): [number, number] {
	const m = /^([A-Z])([1-9][0-9]*)$/.exec(ref.toUpperCase());
	if (!m) throw new Error('Invalid cell');
	return [Number(m[2]) - 1, m[1].charCodeAt(0) - 65];
}
/** Bounded, local formula grammar. No evaluation of JavaScript, network functions, macros, or external workbooks. */
export function calculateSheet(cells: Cells): CellValue[][] {
	if (cells.length > 100 || cells.some((row) => row.length > 26))
		throw new Error('Sheet exceeds teaching limits');
	const memo = new Map<string, CellValue | Error>();
	const active = new Set<string>();
	let operations = 0;
	const error = (code: string) => new FormulaParser.FormulaError(code);
	const get = (row: number, col: number, sheet?: string): CellValue | Error => {
		if (sheet && sheet !== 'Sheet1') throw error('#REF!');
		if (row < 0 || col < 0 || row >= cells.length || col >= (cells[row]?.length ?? 0))
			throw error('#REF!');
		const key = address(row, col);
		const cached = memo.get(key);
		if (cached instanceof Error) return cached;
		if (cached !== undefined) return cached;
		if (active.has(key)) return error('#CYCLE!');
		if (++operations > 2000) throw error('#LIMIT!');
		active.add(key);
		try {
			const raw = (cells[row][col] ?? '').trim();
			let result: CellValue;
			if (!raw.startsWith('='))
				result =
					raw === ''
						? 0
						: /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)
							? Number(raw)
							: raw.startsWith("'")
								? raw.slice(1)
								: raw;
			else {
				if (raw.length > 500) throw error('#LIMIT!');
				const syntax = raw.slice(1).replace(/"(?:[^"]|"")*"/g, '""');
				for (const ref of syntax.matchAll(/\$?([A-Z]{1,3})\$?([0-9]+)/gi)) {
					const column = [...ref[1].toUpperCase()].reduce(
						(n, ch) => n * 26 + ch.charCodeAt(0) - 64,
						0
					);
					if (Number(ref[2]) < 1 || Number(ref[2]) > cells.length || column > 26)
						throw error('#REF!');
				}
				for (const name of syntax.matchAll(/([A-Z_][A-Z0-9_.]*)\s*\(/gi))
					if (!formulaFunctions.includes(name[1].toUpperCase())) throw error('#FUNCTION!');
				if (/[[\]{}]/.test(syntax)) throw error('#REF!');
				const parser = new FormulaParser({
					onCell: (ref) => get(ref.row - 1, ref.col - 1, ref.sheet),
					onRange: (ref) => {
						if (
							ref.from.row < 1 ||
							ref.from.col < 1 ||
							ref.to.row > cells.length ||
							ref.to.col > 26 ||
							(ref.to.row - ref.from.row + 1) * (ref.to.col - ref.from.col + 1) > 2600
						)
							throw error('#REF!');
						return Array.from({ length: ref.to.row - ref.from.row + 1 }, (_, r) =>
							Array.from({ length: ref.to.col - ref.from.col + 1 }, (_, c) =>
								get(ref.from.row + r - 1, ref.from.col + c - 1, ref.sheet)
							)
						);
					},
					onVariable: () => {
						throw error('#NAME?');
					}
				});
				const parsed = parser.parse(raw.slice(1), { row: row + 1, col: col + 1, sheet: 'Sheet1' });
				if (parsed instanceof Error) throw parsed;
				if (typeof parsed !== 'number' && typeof parsed !== 'string' && typeof parsed !== 'boolean')
					throw error('#VALUE!');
				if (typeof parsed === 'number' && !Number.isFinite(parsed)) throw error('#NUM!');
				result = parsed;
			}
			memo.set(key, result);
			return result;
		} catch (error) {
			const e = error instanceof Error ? error : new Error('#ERROR!');
			memo.set(key, e);
			return e;
		} finally {
			active.delete(key);
		}
	};
	return cells.map((row, r) =>
		row.map((_, c) => {
			try {
				const value = get(r, c);
				if (value instanceof Error) throw value;
				return value;
			} catch (e) {
				if (e instanceof Error) {
					const code = String(e).match(/#[A-Z0-9/]+[!?]/)?.[0];
					return code ?? '#ERROR!';
				}
				return '#ERROR!';
			}
		})
	);
}
export type Workbook = {
	id: string;
	title: string;
	description: string;
	units: string;
	cells: Cells;
	tasks: { cell: string; instruction: string; formula: string; explanation: string }[];
	perturb: [number, number, string];
};
const pad = (rows: string[][]) =>
	rows.map((row) => [...row, ...Array(Math.max(0, 6 - row.length)).fill('')]);
export const workbooks: Workbook[] = [
	{
		id: 'variance',
		title: 'September variance',
		description:
			'Reconcile Willow’s September 2026 budget and actual results. Enter formulas in the highlighted cells; the lab checks them again after changing a source amount.',
		units: 'USD thousands. Costs are positive expenses; ratios are decimals (0.35 = 35%).',
		cells: pad([
			['Measure', 'Budget', 'Actual', 'Variance', 'Relative change', ''],
			['Revenue', '1200', '1140', '', '', ''],
			['Materials', '600', '618', '', '', ''],
			['Freight', '80', '96', '', '', ''],
			['Warehouse', '40', '27', '', '', ''],
			['Total COGS', '', '', '', '', ''],
			['Gross profit', '', '', '', '', ''],
			['Gross margin', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['Source IDs', 'BUD-SEP-01', 'GL-SEP-01', 'COST-SEP-02', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', '']
		]),
		perturb: [1, 2, '1150'],
		tasks: [
			{
				cell: 'B6',
				instruction: 'Sum budget materials, freight, and warehouse costs.',
				formula: '=SUM(B3:B5)',
				explanation: 'The three cost categories reconcile to budget COGS 720.'
			},
			{
				cell: 'C6',
				instruction: 'Sum actual COGS.',
				formula: '=SUM(C3:C5)',
				explanation: '618 +96 +27 =741, on the same basis as the headline.'
			},
			{
				cell: 'B7',
				instruction: 'Compute budget gross profit.',
				formula: '=B2-B6',
				explanation: 'Gross profit is revenue less COGS:1,200−720=480.'
			},
			{
				cell: 'C7',
				instruction: 'Compute actual gross profit.',
				formula: '=C2-C6',
				explanation: '1,140−741=399. A reference formula updates if revenue changes.'
			},
			{
				cell: 'B8',
				instruction: 'Compute budget gross margin as a decimal ratio.',
				formula: '=B7/B2',
				explanation: '480/1,200=0.4, which is 40%.'
			},
			{
				cell: 'C8',
				instruction: 'Compute actual gross margin.',
				formula: '=C7/C2',
				explanation: '399/1,140=0.35, which is 35%.'
			},
			{
				cell: 'D7',
				instruction: 'Calculate the gross-profit dollar variance (actual minus budget).',
				formula: '=C7-B7',
				explanation: '399−480=−81, in USD thousands.'
			},
			{
				cell: 'E7',
				instruction: 'Calculate the relative gross-profit change from budget.',
				formula: '=D7/B7',
				explanation: '−81/480=−0.16875. This is about −16.9%, not a margin-point change.'
			},
			{
				cell: 'D8',
				instruction: 'Calculate margin difference as a decimal (−0.05 means −5 percentage points).',
				formula: '=C8-B8',
				explanation: '0.35−0.40=−0.05. Multiply by 100 to express a percentage-point difference.'
			}
		]
	},
	{
		id: 'receivables',
		title: 'Receivables & collections',
		description:
			'Use SUMIF to aggregate payments at invoice grain, then calculate outstanding balances. This clean exercise excludes duplicate and unmatched records; Day 5 introduces them.',
		units: 'USD. Each invoice row is one invoice; each payment row is one accepted allocation.',
		cells: pad([
			['Invoice', 'Amount', 'Paid', 'Outstanding', 'Payment invoice', 'Payment amount'],
			['A', '1000', '', '', 'A', '300'],
			['B', '600', '', '', 'A', '200'],
			['C', '400', '', '', 'B', '600'],
			['', '', '', '', '', ''],
			['Total', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['Review count', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', '']
		]),
		perturb: [1, 5, '350'],
		tasks: [
			{
				cell: 'C2',
				instruction: 'Sum payments for invoice A by matching its ID.',
				formula: '=SUMIF(E2:E4,A2,F2:F4)',
				explanation:
					'SUMIF tests the payment invoice IDs and sums corresponding payment amounts:300+200=500.'
			},
			{
				cell: 'C3',
				instruction: 'Sum payments for invoice B.',
				formula: '=SUMIF(E2:E4,A3,F2:F4)',
				explanation: 'Invoice B has one accepted payment of 600.'
			},
			{
				cell: 'C4',
				instruction: 'Sum payments for invoice C.',
				formula: '=SUMIF(E2:E4,A4,F2:F4)',
				explanation: 'No match returns 0. An unpaid invoice remains in the invoice population.'
			},
			{
				cell: 'D2',
				instruction: 'Calculate outstanding for A.',
				formula: '=B2-C2',
				explanation: '1,000−500=500. Compute after aggregation, not once per payment row.'
			},
			{
				cell: 'D3',
				instruction: 'Calculate outstanding for B.',
				formula: '=B3-C3',
				explanation: '600−600=0.'
			},
			{
				cell: 'D4',
				instruction: 'Calculate outstanding for C.',
				formula: '=B4-C4',
				explanation: '400−0=400.'
			},
			{
				cell: 'B6',
				instruction: 'Total the invoice amounts.',
				formula: '=SUM(B2:B4)',
				explanation: 'The invoice population totals 2,000.'
			},
			{
				cell: 'D6',
				instruction: 'Total outstanding balances.',
				formula: '=SUM(D2:D4)',
				explanation: '500+0+400=900.'
			},
			{
				cell: 'B8',
				instruction: 'Count invoices with positive outstanding using COUNTIF.',
				formula: '=COUNTIF(D2:D4,">0")',
				explanation: 'Two invoices remain outstanding. This counts invoices, not payment rows.'
			}
		]
	},
	{
		id: 'customer-ledger',
		title: 'Customer ledger',
		description:
			'M09 worked case: calculate invoice balances, aggregate by customer, and identify review status. Each row is one invoice as of the stated teaching cutoff.',
		units: 'USD. Paid-as-of values are already aggregated from accepted payment allocations.',
		cells: pad([
			['Invoice', 'Customer', 'Amount', 'Paid as of', 'Outstanding', 'Review'],
			['I-201', 'Cedar', '120', '120', '', ''],
			['I-202', 'Cedar', '200', '60', '', ''],
			['I-203', 'Juniper', '80', '0', '', ''],
			['', '', '', '', '', ''],
			['Totals', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['Cedar outstanding', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', ''],
			['', '', '', '', '', '']
		]),
		perturb: [2, 3, '80'],
		tasks: [
			{
				cell: 'E2',
				instruction: 'Compute I-201 outstanding.',
				formula: '=C2-D2',
				explanation: '120−120=0. This invoice is fully collected.'
			},
			{
				cell: 'E3',
				instruction: 'Compute I-202 outstanding.',
				formula: '=C3-D3',
				explanation: '200−60=140. A partial payment reduces but does not clear the receivable.'
			},
			{
				cell: 'E4',
				instruction: 'Compute I-203 outstanding.',
				formula: '=C4-D4',
				explanation: '80−0=80. An unpaid invoice remains in the population.'
			},
			{
				cell: 'C6',
				instruction: 'Total invoice amounts.',
				formula: '=SUM(C2:C4)',
				explanation: '120+200+80=400 at invoice grain.'
			},
			{
				cell: 'D6',
				instruction: 'Total accepted payments as of cutoff.',
				formula: '=SUM(D2:D4)',
				explanation: '120+60+0=180.'
			},
			{
				cell: 'E6',
				instruction: 'Total outstanding balances.',
				formula: '=SUM(E2:E4)',
				explanation: '0+140+80=220, reconciling to 400−180.'
			},
			{
				cell: 'B8',
				instruction: 'Use SUMIF to total Cedar outstanding.',
				formula: '=SUMIF(B2:B4,"Cedar",E2:E4)',
				explanation:
					'The criteria range is customer names; the sum range is outstanding amounts. Cedar outstanding is 140.'
			},
			{
				cell: 'F3',
				instruction: 'Optional: mark positive balances for review with IF.',
				formula: '=IF(E3>0,1,0)',
				explanation:
					'1 means review required;0 means no positive balance. This is a routing flag, not proof of fraud.'
			}
		]
	}
];
export function verifyWorkbook(book: Workbook, cells: Cells) {
	const solution = book.cells.map((r) => [...r]);
	for (const task of book.tasks) {
		const [r, c] = locate(task.cell);
		solution[r][c] = task.formula;
	}
	const actual = calculateSheet(cells),
		expected = calculateSheet(solution);
	const changed = cells.map((r) => [...r]),
		changedSolution = solution.map((r) => [...r]);
	const [r, c, v] = book.perturb;
	changed[r][c] = v;
	changedSolution[r][c] = v;
	const changedActual = calculateSheet(changed),
		changedExpected = calculateSheet(changedSolution);
	return book.tasks.map((task) => {
		const [r, c] = locate(task.cell);
		const equal = (a: CellValue, b: CellValue) =>
			typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-8;
		return {
			...task,
			correct:
				cells[r][c].trim().startsWith('=') &&
				equal(actual[r][c], expected[r][c]) &&
				equal(changedActual[r][c], changedExpected[r][c]),
			value: actual[r][c],
			expected: expected[r][c]
		};
	});
}
