import { describe, it, expect } from 'vitest';
import { calculateSheet, workbooks, verifyWorkbook, locate } from './spreadsheet';
describe('local finance spreadsheet', () => {
	it('recalculates references, ranges, conditional sums and error handling', () => {
		expect(
			calculateSheet([
				['10', '20', '=SUM(A1:B1)'],
				['A', 'B', '=IF(C1>25,"review","clear")'],
				['5', '7', '=SUMIF(A2:B2,"A",A3:B3)']
			])
		).toEqual([
			[10, 20, 30],
			['A', 'B', 'review'],
			[5, 7, 5]
		]);
		expect(calculateSheet([['=1/0', '=IFERROR(A1,0)']])).toEqual([['#DIV/0!', 0]]);
	});
	it('rejects circular references, oversized ranges and external functions', () => {
		expect(
			calculateSheet([['=B1', '=A1']])[0].every((x) => typeof x === 'string' && x.startsWith('#'))
		).toBe(true);
		expect(calculateSheet([['=SUM(A1:A1048576)']])[0][0]).toBe('#REF!');
		expect(calculateSheet([['=WEBSERVICE("https://example.com")']])[0][0]).toBe('#FUNCTION!');
	});
	it('accepts linked solutions and catches a hard-coded answer under a changed input', () => {
		for (const book of workbooks) {
			const cells = book.cells.map((r) => [...r]);
			for (const t of book.tasks) {
				const [r, c] = locate(t.cell);
				cells[r][c] = t.formula;
			}
			expect(verifyWorkbook(book, cells).every((t) => t.correct)).toBe(true);
		}
		const book = workbooks[0],
			cells = book.cells.map((r) => [...r]);
		for (const t of book.tasks) {
			const [r, c] = locate(t.cell);
			cells[r][c] = t.formula;
		}
		cells[6][2] = '=399';
		expect(verifyWorkbook(book, cells).find((t) => t.cell === 'C7')?.correct).toBe(false);
	});
});
