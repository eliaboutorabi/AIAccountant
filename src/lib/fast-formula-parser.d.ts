declare module 'fast-formula-parser' {
	type CellRef = { row: number; col: number; sheet?: string };
	type RangeRef = { sheet?: string; from: CellRef; to: CellRef };
	export default class FormulaParser {
		static FormulaError: new (code: string, message?: string) => Error;
		constructor(options: {
			onCell: (ref: CellRef) => unknown;
			onRange: (ref: RangeRef) => unknown[][];
			onVariable?: (name: string) => unknown;
		});
		parse(formula: string, position: CellRef, allowArray?: boolean): unknown;
	}
}
