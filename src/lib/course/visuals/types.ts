export type VisualNode = {
	label: string;
	detail: string;
	value?: string;
	icon?: string;
	amount?: number;
};
export type VisualBase = {
	id: string;
	module: string;
	section: string;
	/** Insert after this zero-based content block; default is after the first block. */
	afterBlock?: number;
	title: string;
	lead: string;
	alt: string;
	takeaway: string;
	question: string;
	answer: string;
	sourceNote: string;
};
export type TeachingVisual = VisualBase &
	(
		| {
				kind: 'art';
				image: string;
				width?: number;
				height?: number;
				transcript: { label: string; explanation: string }[];
		  }
		| {
				kind: 'diagram';
				layout: 'flow' | 'cycle' | 'compare' | 'timeline' | 'bars' | 'matrix';
				nodes: VisualNode[];
				rows?: string[];
				columns?: string[];
				cells?: number[][];
				unit?: string;
		  }
		| {
				kind: 'interactive';
				interaction:
					'tokenizer' | 'attention' | 'training' | 'forecast' | 'threshold' | 'join' | 'agents';
		  }
	);
