/** Authored instruction, not generated lesson templates. All amounts identify units in content. */
export type Source = { label: string; url: string; note?: string };
export type Block =
	| { kind: 'prose'; paragraphs: string[] }
	| {
			kind: 'callout';
			tone: 'accounting' | 'mechanism' | 'warning';
			title: string;
			paragraphs: string[];
	  }
	| { kind: 'table'; caption: string; headers: string[]; rows: string[][] }
	| { kind: 'steps'; title: string; steps: { title: string; text: string }[] }
	| { kind: 'worked'; title: string; problem: string; steps: string[]; conclusion: string }
	| { kind: 'compare'; title: string; items: { label: string; text: string }[] }
	| {
			kind: 'lab';
			id: string;
			title: string;
			task: string;
			prediction: string;
			evidence: string[];
			limitation: string;
	  }
	| { kind: 'figure'; image: string; alt: string; caption: string }
	| { kind: 'code'; language: string; title: string; code: string; explanation: string }
	| { kind: 'reflection'; prompt: string; guidance: string; modelAnswer: string };
export type Section = { id: string; title: string; lead: string; blocks: Block[] };
export type Check = {
	id: string;
	prompt: string;
	options: string[];
	answer: number;
	/** Explain every distractor, rather than just restating the right choice. */
	rationales: string[];
	objective: number;
};
export type Assignment = {
	title: string;
	scenario: string;
	tasks: string[];
	deliverable: string;
	rubric: { criterion: string; evidence: string }[];
	workedSolution: string[];
	/** Optional local public download, relative to static/. */
	download?: string;
};
export type CourseModule = {
	id: string;
	day: number;
	title: string;
	subtitle: string;
	minutes: number;
	prerequisites: string[];
	objectives: string[];
	why: string;
	sections: Section[];
	checks: Check[];
	assignment: Assignment;
	interview: {
		question: string;
		strongAnswer: string[];
		followUps: { question: string; answer: string }[];
	};
	sources: Source[];
};
export type CourseDay = {
	day: number;
	title: string;
	question: string;
	image: string;
	color: string;
	artifact: string;
	review: { prompt: string; answer: string }[];
};
