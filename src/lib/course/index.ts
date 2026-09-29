import { day1Modules } from './days/day1';
import { day2Modules } from './days/day2';
import { day3Modules } from './days/day3';
import { day4Modules } from './days/day4';
import { day5Modules } from './days/day5';
import type { CourseModule } from './types';
import type { ModuleEvidence } from './progress.svelte';
export const modules: CourseModule[] = [
	...day1Modules,
	...day2Modules,
	...day3Modules,
	...day4Modules,
	...day5Modules
];
export function status(module: CourseModule, evidence: ModuleEvidence) {
	const studied = module.sections.every((s) => evidence.read.includes(s.id));
	const checksCorrect = module.checks.filter((q) => evidence.answers[q.id] === q.answer).length;
	const firstAttempts = module.checks.map((q) => ({
		question: q,
		history: evidence.checkHistory?.[q.id],
		first: evidence.checkHistory?.[q.id]?.attempts[0]
	}));
	const firstAttemptTracked = firstAttempts.filter(({ first }) => !!first).length;
	const firstAttemptCorrect = firstAttempts.filter(
		({ question, first }) => first?.answer === question.answer
	).length;
	const firstAttemptWithoutHelpCorrect = firstAttempts.filter(
		({ question, history, first }) =>
			first?.answer === question.answer &&
			!first.priorFeedback &&
			!first.priorSolution &&
			!first.hints.length &&
			!first.priorHistoryUnknown &&
			history?.legacyAnswer === undefined &&
			!history?.merged
	).length;
	const checksWithHints = firstAttempts.filter(({ history }) => !!history?.hints.length).length;
	const checksWithSolutions = firstAttempts.filter(({ history }) =>
		history?.reveals.some((event) => event.kind === 'solution')
	).length;
	const historyUnknown = module.checks.filter(
		(q) =>
			evidence.checkHistory?.[q.id]?.legacyAnswer !== undefined ||
			(evidence.answers[q.id] !== undefined && !evidence.checkHistory?.[q.id])
	).length;
	const written = !!evidence.responses.assignment?.trim();
	const selfAssessed =
		written && module.assignment.rubric.every((_, i) => evidence.rubric.includes(String(i)));
	return {
		studied,
		checksCorrect,
		firstAttemptTracked,
		firstAttemptCorrect,
		firstAttemptWithoutHelpCorrect,
		checksWithHints,
		checksWithSolutions,
		historyUnknown,
		written,
		selfAssessed,
		practiced: Object.values(evidence.responses).some((v) => v.trim().length > 0)
	};
}
export const legacyModules: Record<string, string> = {
	foundations: 'M01',
	'machine-learning': 'M03',
	'deep-learning': 'M06',
	llms: 'M11',
	'generative-ai': 'M15',
	tokens: 'M11',
	transformers: 'M12',
	agents: 'M18',
	tools: 'M17',
	skills: 'M19',
	harnesses: 'M19',
	prompting: 'M20'
};

/** Authored navigation and reasoning support; it never scores free text or selects an option. */
const assessmentSupport: Record<string, { sections: string[]; strategy: string }> = {
	M01: {
		sections: ['four-mechanisms', 'history', 'worked-process'],
		strategy:
			'For each option, identify what determines its output: an explicit rule, fitted parameters, supplied evidence, or generated content. Then state the decision the business actually needs.'
	},
	M02: {
		sections: ['grain-and-keys', 'availability', 'splits'],
		strategy:
			'Write the row grain and the decision date first. For each proposed input or split, ask what would really have been available at that moment and which records belong together.'
	},
	M03: {
		sections: ['one-update', 'controls', 'loss-and-decision'],
		strategy:
			'Keep the prediction, observed target, error, loss and update separate. Identify which value was fitted and which setting a person chose; then connect the error measure to the decision.'
	},
	M04: {
		sections: ['new-cases', 'three-fits', 'regularization'],
		strategy:
			'Name which data fitted parameters, which data selected the procedure, and which data stayed unused until commitment. Compare training and validation behavior before diagnosing the cause.'
	},
	M05: {
		sections: ['four-cells', 'three-layers', 'cost'],
		strategy:
			'Write the four confusion counts and the denominator of each rate. Then separate score quality from a threshold, review workload and the consequences of mistakes.'
	},
	M06: {
		sections: ['one-forward-pass', 'backward-pass', 'from-line-to-network'],
		strategy:
			'Trace a single input forward with fixed parameters. Separately trace how a training error could change those parameters; do not treat an activation picture as proof of generalization.'
	},
	M07: {
		sections: ['embedding', 'tasks', 'transfer'],
		strategy:
			'Identify the representation, the learning signal and the evaluation task. Ask which information a projection omits and what exposure differs between a reused model and a fresh one.'
	},
	M08: {
		sections: ['question-and-horizon', 'rolling-origins', 'uncertainty-and-change'],
		strategy:
			'Write the forecast origin and horizon, then list what was known at that origin. Compare the same eligible forecasts and distinguish average error, directional bias and uncertainty coverage.'
	},
	M09: {
		sections: ['spreadsheet', 'join-explosion', 'power-bi'],
		strategy:
			'Declare the row grain before calculating. Trace a small example through references, joins or filters, and reconcile the resulting counts, units and totals to the original records.'
	},
	M10: {
		sections: ['current-use', 'worked-economics', 'pilot'],
		strategy:
			'Separate a documented example from a general claim. Count preparation, review, correction and recurring work, then identify the comparison and stop condition that could change the recommendation.'
	},
	M11: {
		sections: ['prediction', 'tokens', 'embeddings', 'transfer'],
		strategy:
			'Follow the text through characters, token pieces, IDs and vectors. Separate the model’s prediction objective from the evidence needed to establish a financial claim.'
	},
	M12: {
		sections: ['block', 'qkv', 'mask', 'generation', 'generation'],
		strategy:
			'Follow one token through the actual computation. Mark what context it can access, where weighted mixtures occur, and whether the proposed change affects probabilities, token selection or trained parameters.'
	},
	M13: {
		sections: ['learning-signal', 'posttraining', 'adaptation', 'learning-signal', 'deployment'],
		strategy:
			'Ask whether the intervention changes supplied context, executes a tool, or updates parameters. Name the objective and independent evaluation that would support the intended capability.'
	},
	M14: {
		sections: ['reconcile', 'cost-bridge', 'draft', 'context-controls', 'evaluation'],
		strategy:
			'Reconcile the amounts and units first. For each statement, identify its source and distinguish an arithmetic bridge from evidence of cause; preserve what is still unknown.'
	},
	M15: {
		sections: ['family', 'denoising', 'multimodal', 'extraction-case', 'evaluation'],
		strategy:
			'Separate content generation from extraction and verification. Trace the original observation, the model estimate and the checking step; consider which ambiguity cannot be resolved from the supplied evidence.'
	},
	M16: {
		sections: ['answer', 'search', 'evaluate'],
		strategy:
			'Trace source eligibility, retrieved passage and final claim separately. Check the date and permission boundary before deciding whether similarity or a citation actually supplies support.'
	},
	M17: {
		sections: ['boundary', 'contract', 'errors'],
		strategy:
			'Separate a proposed request, validated arguments, permission to execute, the actual tool result and a confirmed outcome. Preserve units and treat missing or ambiguous results explicitly.'
	},
	M18: {
		sections: ['application', 'state', 'choose'],
		strategy:
			'Identify who chooses the next step, what state is carried forward and what causes the run to stop. A persuasive final message cannot substitute for a checked execution trace.'
	},
	M19: {
		sections: ['three-parts', 'write-skill', 'checkpoint'],
		strategy:
			'Separate the reusable procedure from callable capabilities and the surrounding execution controls. Check which identities, versions and unresolved actions must survive a checkpoint.'
	},
	M20: {
		sections: ['contract', 'diagnose', 'evaluate'],
		strategy:
			'Locate the failure before choosing an intervention: task wording, missing evidence, tool behavior or an unenforced boundary. Compare the changed procedure on the same predeclared cases.'
	},
	M21: {
		sections: ['stages', 'review-code', 'verify'],
		strategy:
			'Trace one record through raw, validated, reconciled and reviewed states. Check grain and exact amounts, then construct a small failure case that would expose the proposed defect.'
	},
	M22: {
		sections: ['graders', 'variability', 'monitor'],
		strategy:
			'Name the case, trial, denominator and grader separately. Consider which meaningful failures are absent from the sample and what a release rule would do when one appears.'
	},
	M23: {
		sections: ['architecture', 'worked-case', 'acceptance'],
		strategy:
			'Assign a clear responsibility to each component, then trace the source record to the calculation, evidence packet and reviewer state. Ask how another person could reproduce and challenge the result.'
	},
	M24: {
		sections: ['commit', 'incident-two', 'respond'],
		strategy:
			'Preserve the committed configuration and the failing trace. Distinguish the observed failure from its suspected cause, then name a corrective action and a regression case that tests that mechanism.'
	},
	M25: {
		sections: ['structure', 'classification', 'next'],
		strategy:
			'Lead with the decision, show inspectable evidence and explain the mechanism. When a constraint changes, revisit the calculation or design rather than repeating a definition; state the boundary of what you have demonstrated.'
	}
};
export function checkGuidance(
	module: CourseModule,
	check: CourseModule['checks'][number],
	sectionId?: string
) {
	const support = assessmentSupport[module.id];
	const section =
		module.sections.find(
			(section) => section.id === (sectionId ?? support?.sections[check.objective])
		) ?? module.sections[0];
	return {
		objective:
			module.objectives[check.objective] ?? 'Explain the decision using the stated evidence.',
		section,
		strategy:
			support?.strategy ??
			'For each alternative, state the evidence and assumptions it needs. Check those against the scenario before selecting an answer.'
	};
}
