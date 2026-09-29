import { error } from '@sveltejs/kit';
import { modules } from '$lib/course';
import { days } from '$lib/course/days';
import { baseDataset, policies, starterSource } from '$lib/engines/workflow';
import { collectionSeries, FORECAST_PROVENANCE } from '$lib/engines/forecast';
import type { EntryGenerator, RequestHandler } from './$types';
export const prerender = true;
const files = [
	'portfolio-guide.md',
	'reviewed-solutions.md',
	'willow-pipeline.mjs',
	'pipeline-data.json',
	'policies.json',
	'collections-72.csv',
	'variance.csv',
	'data-manifest.json',
	...days.map((d) => `day-${d.day}.md`)
];
export const entries: EntryGenerator = () => files.map((file) => ({ file }));
const assignment = (m: (typeof modules)[number], solutions = false) =>
	`## ${m.id} · ${m.assignment.title}\n\n${m.assignment.scenario}\n\n${m.assignment.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nDeliverable: ${m.assignment.deliverable}\n\n### Self-assessment rubric\n\n${m.assignment.rubric.map((r) => `- **${r.criterion}**: ${r.evidence}`).join('\n')}\n\n${solutions ? `### Reviewed solution\n\n${m.assignment.workedSolution.join('\n\n')}` : '### Your evidence\n\nPrediction / assumptions:\n\nSource records and configuration:\n\nCalculation / experiment and observed result:\n\nFailure or limitation:\n\nDecision and next test:\n'}`;
const portfolio = `# AI Accountant · portfolio guide\n\nVersion 2 · original fictional Willow teaching cases. Use the browser laboratories or the supplied local starter. No paid API or real financial data is required. The 30-hour core is an authoring estimate, not a measured completion time.\n\n## Five connected submissions\n\n${days.map((d) => `- Day ${d.day}: ${d.artifact}. Complete the linked day-${d.day}.md case briefs.`).join('\n')}\n\n## Reproduce the starter\n\nInstall a current Node.js LTS runtime from nodejs.org, save willow-pipeline.mjs to a folder, open a terminal in that folder, then run:\n\n\`\`\`sh\nnode willow-pipeline.mjs\n\`\`\`\n\nNo packages, API keys, or network connection are needed for execution. Read the source first. It is a complete original synthetic reconciliation baseline. It prints USD-cent amounts as strings and checks total outstanding of 90000 cents (USD 900). It does not call an LLM or release payments. Inspect the duplicate quarantine and unmatched allocation as separate outputs. The browser capstone supplies retrieval, queue state, and changed-case grading in addition to this starter.\n\n## Ten capstone tasks\n\n1. Define the business decision, cutoff, invoice grain, source version, and permitted output.\n2. Reproduce raw invoice and payment control totals.\n3. Quarantine a repeated payment ID; stop on conflicting duplicates.\n4. Retain invoices with no payments and separately identify unmatched allocations.\n5. Calculate invoice balances with exact minor units and reconcile totals.\n6. Retrieve the entity- and date-appropriate policy and cite the supporting statement.\n7. Validate a tool request; demonstrate a rejected malformed or unauthorized request.\n8. Inject a lost response and recover with a stable operation key without a duplicate item.\n9. Freeze your configuration, export the first changed-case results, then record a repair as development evidence.\n10. Present a two-minute defense of a source-to-decision trace and the scope you have not demonstrated.\n\n## Package your evidence\n\nKeep README.md (question, instructions, versions), data-manifest.json, your formula TSV files, laboratory evidence JSON, a concise evaluation report, a failure-and-repair note, and your final memo. Export your course notebook separately from the progress page. Lab exports contain experiment-specific data that the course notebook does not automatically collect.\n\n## A reviewer's acceptance check\n\nA second person should be able to reproduce a declared result, identify source rows, inspect a failed case, and understand the review boundary. Do not present a self-assessed rubric as independent certification. Do not present template drafting or a tiny teaching model as a production finance assistant.\n\n## Continued practice by role\n\n- Finance transformation (6–8 further hours): map the current and proposed close process; interview a fictional controller using ten explicit questions; specify acceptance criteria; quantify capacity under low/base/high correction rates; write an adoption and benefits-measurement plan. Review whether each benefit has an owner and a measurement source.\n- Analytics advisory (8–12 hours): import pipeline-data.json into Excel Power Query; create invoice and accepted-payment tables; aggregate before merging; reconstruct the control totals. In SQL, reproduce the left join and a customer ranking with a window function. In Power BI, create a customer dimension and measures for invoice amount, matched payments, and collection rate; test Cedar-only and total filter contexts. Inspect each table grain and reconcile totals before designing visuals.\n- Data science (12–20 hours): rebuild the synthetic forecast using Python/pandas and explicit rolling cutoffs; implement a baseline; compare errors at one and three months; retain a frozen final period; diagnose bias and large misses. Add an uncertainty discussion and a proposed representative-data study.\n- AI engineering (12–20 hours): wrap the exact calculation in a local API with a schema, structured errors, fixture tests, and request IDs; build a bounded retrieval endpoint; document authentication and deployment work still needed. Keep credentials out of browser assets.\n- Agent engineering (12–20 hours): persist checkpoints in a local database, simulate lost responses and restarts, enforce stable operation keys, and demonstrate cancellation plus a bounded step budget. Create a regression suite that checks actual state as well as final text.\n\nThese are guided extensions, not completed claims about your skill. Use the official chapter references for tool-specific installation and syntax.\n\n## Revisit your learning\n\nAfter roughly one week, repeat the changed diagnostic without your notes. After several weeks, rebuild one artifact from source records and explain a failure. Choose intervals that fit your use; the course has not experimentally validated a retention schedule.\n`;
export const GET: RequestHandler = ({ params }) => {
	const file = params.file;
	if (!files.includes(file)) error(404, 'Unknown course download');
	let body: string,
		type = 'text/plain; charset=utf-8';
	if (file === 'portfolio-guide.md') body = portfolio;
	else if (file === 'reviewed-solutions.md')
		body =
			'# Reviewed module case solutions\n\nCompare only after your attempt. These are authored worked responses, not independent grading.\n\n' +
			modules.map((m) => assignment(m, true)).join('\n\n');
	else if (file === 'willow-pipeline.mjs') body = starterSource();
	else if (file === 'pipeline-data.json') body = JSON.stringify(baseDataset, null, 2);
	else if (file === 'policies.json') body = JSON.stringify(policies, null, 2);
	else if (file === 'collections-72.csv')
		body =
			'month,collections_usd_thousands\n' +
			collectionSeries(42, 'stable')
				.map((r) => `${r.month},${r.value}`)
				.join('\n');
	else if (file === 'variance.csv')
		body =
			'measure,budget_usd_thousands,actual_usd_thousands\nRevenue,1200,1140\nMaterials,600,618\nFreight,80,96\nWarehouse,40,27\n';
	else if (file === 'data-manifest.json')
		body = JSON.stringify(
			{
				version: 2,
				provenance:
					'Original synthetic teaching data. No real customers or representative population claim.',
				pipeline: {
					id: 'PIPE-01-v1',
					currency: 'USD',
					amounts: 'decimal strings; convert to exact integer cents',
					invoiceTotal: 2000,
					rawPaymentTotal: 1450,
					duplicateQuarantine: 200,
					acceptedPayments: 1250,
					matchedPayments: 1100,
					unmatchedPayments: 150,
					outstanding: 900
				},
				forecast: FORECAST_PROVENANCE,
				variance: {
					id: 'VAR-SEP-2026-v1',
					units: 'USD thousands',
					period: 'September 2026',
					sources: ['BUD-SEP-01', 'GL-SEP-01', 'COST-SEP-02'],
					budgetGrossProfit: 480,
					actualGrossProfit: 399,
					budgetGrossMargin: 0.4,
					actualGrossMargin: 0.35
				},
				evaluation:
					'Public instructional cases. Final commitment is a learning aid, not secure examination.'
			},
			null,
			2
		);
	else {
		const day = Number(file.match(/day-(\d)/)?.[1]);
		const info = days[day - 1];
		body =
			`# Day ${day} · ${info.title}\n\nSubmission: ${info.artifact}\n\n` +
			modules
				.filter((m) => m.day === day)
				.map((m) => assignment(m))
				.join('\n\n');
	}
	if (file.endsWith('.json')) type = 'application/json; charset=utf-8';
	if (file.endsWith('.csv')) type = 'text/csv; charset=utf-8';
	return new Response(body, {
		headers: { 'Content-Type': type, 'Content-Disposition': `attachment; filename="${file}"` }
	});
};
