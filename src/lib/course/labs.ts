export type Lab = {
	id: string;
	title: string;
	subtitle: string;
	component: string;
	icon: string;
	category: 'Learning' | 'Language' | 'Finance' | 'Systems';
	provenance: string;
	module: string;
};
export const labs: Lab[] = [
	{
		id: 'training',
		title: 'The learning loop',
		subtitle: 'Trace real slope and intercept updates from collection errors.',
		component: 'RegressionLab',
		icon: 'chart',
		category: 'Learning',
		provenance: 'Actual CPU gradient descent · synthetic customer records',
		module: 'M03'
	},
	{
		id: 'generalization',
		title: 'Commit, then test',
		subtitle: 'Compare capacity, regularization, data size, and independent evidence.',
		component: 'ModelTrainingLab',
		icon: 'target',
		category: 'Learning',
		provenance: 'Actual trained MLP · separate training, validation, and final cases',
		module: 'M04'
	},
	{
		id: 'classification',
		title: 'Scores become decisions',
		subtitle: 'Move a threshold and inspect the real confusion counts.',
		component: 'ModelTrainingLab',
		icon: 'list',
		category: 'Learning',
		provenance: 'Computed predictions and counts · synthetic investigation labels',
		module: 'M05'
	},
	{
		id: 'network',
		title: 'Inside a learning network',
		subtitle: 'See trained weights and activations in a 3D network and exact tables.',
		component: 'ModelTrainingLab',
		icon: 'network',
		category: 'Learning',
		provenance: 'Actual forward pass · Three.js view with numerical alternative',
		module: 'M06'
	},
	{
		id: 'representations',
		title: 'Representations & transfer',
		subtitle: 'Compare four real models and a controlled transfer experiment.',
		component: 'RepresentationLab',
		icon: 'layers',
		category: 'Learning',
		provenance: 'Actual local learning · disclosed abstract synthetic domains',
		module: 'M07'
	},
	{
		id: 'forecast',
		title: 'Forecasting through time',
		subtitle: 'Compare five baselines across rolling origins and changing conditions.',
		component: 'ForecastLab',
		icon: 'chart',
		category: 'Finance',
		provenance: 'Computed forecasts · 72 synthetic months · held-out final period',
		module: 'M08'
	},
	{
		id: 'spreadsheet',
		title: 'The financial workbench',
		subtitle: 'Enter formulas, reconcile balances, and inspect joins and filter context.',
		component: 'SpreadsheetLab',
		icon: 'calculator',
		category: 'Finance',
		provenance: 'Real formula evaluation · original teaching workbooks',
		module: 'M09'
	},
	{
		id: 'value',
		title: 'The complete business case',
		subtitle: 'Measure preparation, review, correction, and operating cost.',
		component: 'ValueLab',
		icon: 'target',
		category: 'Finance',
		provenance: 'Computed scenario analysis · hypothetical assumptions',
		module: 'M10'
	},
	{
		id: 'tokens',
		title: 'The token microscope',
		subtitle: 'Inspect exact pieces and IDs from a named subword tokenizer.',
		component: 'TokenLab',
		icon: 'blocks',
		category: 'Language',
		provenance: 'Actual o200k_base encoding · not a universal billing estimate',
		module: 'M11'
	},
	{
		id: 'transformer',
		title: 'Inside the transformer',
		subtitle: 'Trace measured attention, residuals, representations, and next-token scores.',
		component: 'TransformerLab',
		icon: 'orbit',
		category: 'Language',
		provenance: 'Actual forward-pass inspection · 5,761-parameter CPU transformer',
		module: 'M12'
	},
	{
		id: 'language-training',
		title: 'Train a language model',
		subtitle: 'Watch real loss change, then generate a continuation from learned weights.',
		component: 'TransformerLab',
		icon: 'messages',
		category: 'Language',
		provenance: 'Real next-character training and sampling · original tiny corpus',
		module: 'M13'
	},
	{
		id: 'adaptation',
		title: 'From general language to finance',
		subtitle: 'Adapt the same trained transformer and compare both domains before and after.',
		component: 'AdaptationLab',
		icon: 'layers',
		category: 'Language',
		provenance: 'Actual general-to-finance parameter updates · separate held-out corpora',
		module: 'M13'
	},
	{
		id: 'denoising',
		title: 'Learn to remove noise',
		subtitle: 'Train a denoiser and test what happens as information becomes ambiguous.',
		component: 'DenoisingLab',
		icon: 'sparkles',
		category: 'Learning',
		provenance: 'Real learned denoising on 2D points · not a full image diffusion model',
		module: 'M15'
	},
	{
		id: 'documents',
		title: 'Read the source document',
		subtitle: 'Correct candidate fields and preserve evidence before any decision.',
		component: 'DocumentLab',
		icon: 'file',
		category: 'Finance',
		provenance: 'Authored source/extraction fixtures · actual validation of your entries',
		module: 'M15'
	},
	{
		id: 'retrieval',
		title: 'Find the right evidence',
		subtitle: 'Compare keyword and term-vector search, dates, access, and claim support.',
		component: 'WorkflowLab',
		icon: 'search',
		category: 'Systems',
		provenance: 'Actual local search and grading · original versioned policy documents',
		module: 'M16'
	},
	{
		id: 'tools',
		title: 'The tool contract',
		subtitle: 'Submit JSON, inspect validation, and run a bounded operation.',
		component: 'WorkflowLab',
		icon: 'wrench',
		category: 'Systems',
		provenance: 'Real schema validation and exact integer-cent operations',
		module: 'M17'
	},
	{
		id: 'agents',
		title: 'Follow an execution trace',
		subtitle: 'Separate proposed actions, actual tool results, and authored model decisions.',
		component: 'WorkflowLab',
		icon: 'bot',
		category: 'Systems',
		provenance: 'Actual deterministic workflow + explicitly authored agent trace',
		module: 'M18'
	},
	{
		id: 'local-agent',
		title: 'A model chooses the next step',
		subtitle: 'Optionally download a small model and inspect genuine local tool requests.',
		component: 'LocalAgentLab',
		icon: 'bot',
		category: 'Systems',
		provenance:
			'Optional local model inference · explicit model download · supported hardware required',
		module: 'M18'
	},
	{
		id: 'harness',
		title: 'Recover without duplicating',
		subtitle: 'Inspect checkpoints, permissions, retries, and idempotent effects.',
		component: 'WorkflowLab',
		icon: 'workflow',
		category: 'Systems',
		provenance: 'Actual queue state and injected failure/recovery exercise',
		module: 'M19'
	},
	{
		id: 'evaluation',
		title: 'Evaluate the whole system',
		subtitle: 'Score outputs and resulting state, then investigate failed cases.',
		component: 'WorkflowLab',
		icon: 'shield',
		category: 'Systems',
		provenance: 'Computed workflow graders + clearly labeled authored trial fixtures',
		module: 'M22'
	},
	{
		id: 'pipeline',
		title: 'Build a financial pipeline',
		subtitle: 'Choose controls and reconcile every record through the process.',
		component: 'WorkflowLab',
		icon: 'layers',
		category: 'Systems',
		provenance: 'Actual local pipeline · duplicates and unmatched allocations',
		module: 'M21'
	},
	{
		id: 'capstone',
		title: 'The finance assistant capstone',
		subtitle: 'Commit a design, expose changed cases, and defend the release decision.',
		component: 'WorkflowLab',
		icon: 'graduation',
		category: 'Systems',
		provenance: 'Executable synthetic system · actual state checks · authored draft templates',
		module: 'M23'
	}
];
