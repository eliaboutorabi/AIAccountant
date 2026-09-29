import type { CourseDay } from './types';

export const days: CourseDay[] = [
	{
		day: 1,
		title: 'From accounting questions to learning problems',
		question: 'When should we use rules, statistics, or learned models?',
		image: 'foundations',
		color: 'mint',
		artifact: 'A data contract and a defended model-and-review decision',
		review: [
			{
				prompt:
					'Willow receives a blurred USD 5,000 invoice. Policy requires an extra approver for amounts greater than USD 5,000. Explain the extraction, calculation, and policy tasks, including what remains unknown.',
				answer:
					'Extraction must establish the amount from the source or mark it uncertain. A deterministic calculation can check line/tax totals once fields are reliable. Exactly 5,000 does not trigger a greater-than 5,000 rule, but an uncertain reading cannot justify bypassing the rule. The invoice alone also does not prove delivery or authorization. Evaluate each component using the evidence appropriate to its task.'
			},
			{
				prompt:
					'You predict lateness when an invoice is issued. The dataset contains agreed terms, the final settlement date, and a customer rating revised two months later. Which information belongs in the modeling table?',
				answer:
					'Agreed terms can be included if known at issue. Final settlement date is a future outcome and must not be an input. The later rating requires its historical issue-date version or exclusion. Build past-history features from events available then, wait for target outcomes to mature, and choose a split that resembles future deployment. A current extract is not automatically a historical snapshot.'
			},
			{
				prompt:
					'Actual costs are 30, 50, 70; predictions are 35, 45, 55 in USD. Using prediction minus actual, calculate residuals, MAE, and mean signed error. What would you inspect before training longer?',
				answer:
					'Residuals are +5, −5, −15. MAE is 25/3, about USD 8.33; mean signed error is −15 / 3 = −USD 5. The model underpredicts on average in this sample, while errors do not vanish when signs cancel. Inspect input units, parameter behavior, loss choice, and whether the model can represent the relationship. Longer training does not fix leaked inputs, poor labels, or an unsuitable model form.'
			},
			{
				prompt:
					'Model A has training/validation error 2/11; model B has 5/7. You choose B, inspect a final-test error 9, then change the penalty after looking at those final mistakes. Explain each dataset’s role now.',
				answer:
					'Training fitted parameters; validation favored B despite its higher training error. The first final score 9 was evidence for the frozen selected procedure on that sample. Once the penalty changed in response to final mistakes, those cases influenced development. A better rerun can show a repair but is not a new independent final estimate. Preserve the first result and seek fresh appropriate final cases.'
			},
			{
				prompt:
					'A 100-invoice cohort has 20 actual positives. A queue flags 25 cases, 18 of which are positive. Calculate precision, recall, and accuracy. Explain what the numbers do not yet decide.',
				answer:
					'True positives 18, false positives 7, false negatives 2, true negatives 73. Precision 18/25=72%; recall 18/20=90%; accuracy 91/100=91%. The numbers do not choose a review policy without capacity, review effort, missed-case consequences, label quality, and representative evaluation. A risk score’s calibration is a separate question.'
			},
			{
				prompt:
					'A lower threshold adds 10 reviews costing USD 5 each and avoids one expected USD 30 miss. Recommend a policy under these assumptions, then state one change that could reverse it.',
				answer:
					'The extra reviews cost USD 50 and avoid USD 30 expected cost, so the lower threshold increases modeled cost by USD 20. Prefer the original policy for this simplified objective if other conditions are equal. A higher missed-case consequence, qualitative significance, different review effectiveness, or spare capacity valued differently could change the decision. State the assumptions and assess the selected policy on fresh cases.'
			}
		]
	},
	{
		day: 2,
		title: 'Learning mechanisms and financial analysis',
		question: 'How do models learn, and how do their outputs support finance decisions?',
		image: 'analytics-atelier',
		color: 'peach',
		artifact: 'A reconciled analytical workbook and forecast comparison',
		review: [
			{
				prompt:
					'A hidden unit combines 0.6 with weight 0.5 and 0.4 with weight −0.25, then adds bias −0.3 and applies ReLU. Trace the output and distinguish this from training.',
				answer:
					'Contributions are 0.30 and −0.10; adding the bias gives −0.10. ReLU returns 0. That is a forward computation with fixed parameters. Training would calculate a loss over known targets, propagate sensitivities backward, and use an optimizer to update parameters. Selecting a different customer changes activations but does not ordinarily change those stored parameters.'
			},
			{
				prompt:
					'A supplier-embedding plot groups “hosting subscription” beside “warehouse rent.” A colleague wants to assign both the same account code. What additional reasoning is needed?',
				answer:
					'An embedding represents relationships useful to its training task, and a projection may distort them. Similar language does not establish the accounting category. Use the chart-of-accounts definitions, transaction context, and reviewed examples. Compare actual similarity in the declared representation and evaluate category suggestions on held-out cases, including ambiguous descriptions.'
			},
			{
				prompt:
					'At March month-end, you forecast June collections using actual April sales as a driver. The model’s error is tiny. Diagnose the issue and connect it to day one.',
				answer:
					'June is three months ahead. Actual April sales were not yet available at March month-end unless the task explicitly had that information through a legitimate earlier source. The backtest likely uses future information, the same availability problem as issue-date invoice leakage. Rerun with the driver known or forecast at the origin, fitting preparation only from earlier data and accounting for driver uncertainty.'
			},
			{
				prompt:
					'A forecast has absolute errors 4, 6, 10, 20 in USD thousands. Calculate MAE. A different method has lower one-month MAE but worse three-month MAE; which evidence matters for a three-month liquidity decision?',
				answer:
					'MAE is 40 / 4 = 10, meaning USD 10,000. Use the three-month comparison for the stated decision, on the same origins and targets. Also inspect bias, large exposures, uncertainty coverage, and current business conditions. A favorable one-month score does not establish performance at another horizon.'
			},
			{
				prompt:
					'One USD 150 invoice has three lines and two payments totaling USD 150. A query joins both child tables directly to the header. How many rows result, and why could two matching totals still be wrong?',
				answer:
					'Three lines paired with two payments produce six rows. Each line is repeated twice and each payment three times; the header repeats six times. Depending on which columns are compared, duplicated totals may match or differ without reflecting the original records. Aggregate each child table to the required invoice grain before joining, then reconcile counts and amounts against independent source totals.'
			},
			{
				prompt:
					'A pilot saves four minutes per case across 300 monthly cases. Staff capacity is valued at USD 45/hour; recurring costs are USD 700/month. Calculate the monthly net and describe the benefit honestly.',
				answer:
					'Time released is 1,200 minutes = 20 hours. Capacity-equivalent value is USD 900; net after recurring costs is USD 200/month before setup and omitted effects. It is not automatically USD 200 of cash savings because staff costs may remain unchanged. State how capacity will be used, include setup/review/error consequences, and test a lower-volume or higher-correction scenario.'
			}
		]
	},
	{
		day: 3,
		title: 'Language models from mechanism to evidence',
		question: 'How does a language model produce an answer, and what makes it supportable?',
		image: 'language',
		color: 'lavender',
		artifact: 'An annotated generation trace and an evidence-linked variance memo',
		review: [
			{
				prompt:
					'A tokenizer assigns adjacent IDs to two unrelated pieces of text. An analyst says their meanings must be similar. Correct the explanation from text to contextual representation.',
				answer:
					'Tokenization splits text according to a particular vocabulary and procedure, then assigns IDs used as lookup keys. Numerical proximity of IDs does not encode semantic proximity. Learned embeddings are vectors used in computation; later layers alter representations using position and context. Similarity depends on those representations and a comparison rule, not the ID numbering.'
			},
			{
				prompt:
					'A decoder predicts the next token after “Revenue fell because”. Explain what is fixed, what is recomputed, and what happens after a token is selected.',
				answer:
					'Ordinary inference keeps learned parameters fixed. The supplied sequence is represented with token and position information, transformed through blocks including causally restricted attention and feed-forward processing, and converted to vocabulary scores/probabilities. Sampling or another decoding rule selects a token, which is appended to context for the next step. Activations and temporary attention weights can change; a plausible continuation does not establish the real cause of revenue movement.'
			},
			{
				prompt:
					'A tiny language model’s training loss improves after finance adaptation, but its held-out general-text loss worsens. What does this establish, and what further claim would be unjustified?',
				answer:
					'The parameter update improved the measured training objective on the adaptation examples while degrading the measured general held-out task. That can indicate a tradeoff or forgetting, subject to sampling and evaluation design. It does not establish correct accounting advice, a frontier-model result, or that all adaptation is harmful. Preserve domain and general held-out cases and compare actual outputs as well as losses.'
			},
			{
				prompt:
					'Budget revenue is 1,000 and COGS 600; actual revenue is 1,200 and COGS 780, all USD thousands. Calculate gross profit and margin, then explain how profit can rise while margin falls.',
				answer:
					'Budget gross profit 400 and margin 40%. Actual gross profit 420 and margin 35%. Gross profit rises 20, or 5%, while gross margin falls 5 percentage points. Revenue grew enough to raise the absolute profit despite a lower profit share per revenue dollar. The table gives arithmetic contributions, not the operational causes or cash-flow effect.'
			},
			{
				prompt:
					'A report says freight caused the margin decline but cites only total revenue and total COGS. Would a lower temperature or a citation fix the evidence problem?',
				answer:
					'Neither supplies the missing cost breakdown or causal evidence. Lower temperature changes decoding behavior, not what the records establish. A citation supports a claim only if its source contains relevant evidence. Keep verified calculations, label explanations as hypotheses where appropriate, and request the cost and revenue-driver records needed for the decision.'
			},
			{
				prompt:
					'An invoice image is read as total USD 1,080, but its reviewed lines are USD 600 and USD 400 with USD 80 tax. A generated summary is fluent. What should the system verify, and what if the image total were read as 1,030?',
				answer:
					'The arithmetic 600 + 400 + 80 reconciles to 1,080. Still check units, source text, signs, and document identity; readable OCR is not automatically correct. A 1,030 extraction conflicts with the lines by USD 50 and should create an exception rather than silently changing a field to make totals match. Generation can describe the observed conflict but cannot establish which source reading is correct without review.'
			}
		]
	},
	{
		day: 4,
		title: 'Applications, tools, and agent systems',
		question: 'How do we turn a model into a controlled working application?',
		image: 'agents',
		color: 'mint',
		artifact: 'A retrieval audit, tool contract, skill, and recovery design',
		review: [
			{
				prompt:
					'A travel policy effective October 1 raises a limit from USD 200 to USD 250. An expense occurred September 20. Search returns only the newest policy. Diagnose retrieval and answer support separately.',
				answer:
					'The newest document may be irrelevant to the event date. Retrieval must locate the policy effective for September 20, within the user’s authorized scope. If the answer applies 250 based on the October policy, it uses the wrong version; if it invents 200 without the earlier source, it may be numerically right but unsupported. Retrieve the applicable historical version or state that evidence is missing.'
			},
			{
				prompt:
					'An assistant emits a tool request to add 12,345 and 6,789 in USD minor units, then says the total is USD 191.34 before any result returns. What should the trace and application do?',
				answer:
					'The exact sum is 19,134 cents = USD 191.34, but a proposed request is not evidence of successful execution. The application should validate argument types, currency/units, and permission, execute the allowed operation, then record the actual result or error. The final statement should rely on that result. A coincidentally correct proposed answer does not establish that a required action completed.'
			},
			{
				prompt:
					'A review-item creation times out. The first request used operation key K7. What state and behavior would support a safe retry?',
				answer:
					'Record the intended operation and stable key K7, inspect whether creation actually occurred, and use the receiving service’s documented idempotency/status behavior. If the first write completed but the response was lost, retrying K7 should identify the existing operation when that contract is enforced. Inventing a new key can create a duplicate. Instructions alone cannot enforce this property.'
			},
			{
				prompt:
					'A workflow always validates, reconciles, retrieves a policy, then drafts a note. A second system lets the model choose extra evidence checks. What makes the second more agentic, and when might the first be preferable?',
				answer:
					'The model selects part of the investigation path in the second system; fixed workflow structure determines the first. More autonomy may help variable investigations, but adds evaluation, cost, termination, and recovery complexity. A stable, well-defined process may benefit from the fixed workflow’s repeatability. Both still need valid tool contracts, evidence, and review boundaries.'
			},
			{
				prompt:
					'A versioned skill says “never send customer data outside the approved system.” Is that an enforced security boundary? Explain the skill/harness/tool roles.',
				answer:
					'The skill is procedural instruction and resources. The harness manages execution, context, state, and available capabilities. The tool/application layer must enforce actual permissions and data boundaries. A well-written instruction helps behavior but does not replace code-level access control or restricted tool availability. Versioning supports reproducibility, not automatic enforcement.'
			},
			{
				prompt:
					'You revise a prompt 20 times against the same six policy cases and achieve 6/6. What should the evaluation report say, and what would a strong next experiment include?',
				answer:
					'Those cases are development/validation evidence used to select the prompt. 6/6 describes performance on consulted cases, not independent reliability. Freeze the proposed prompt and surrounding retrieval/tool configuration, then evaluate fresh cases including missing evidence, historical versions, hostile source text, and failures. Preserve raw outputs and use separate checks for arithmetic, support, and actual system outcomes.'
			}
		]
	},
	{
		day: 5,
		title: 'Build, evaluate, and defend',
		question: 'Can you produce and defend a reproducible finance prototype?',
		image: 'systems-atelier',
		color: 'peach',
		artifact: 'A runnable prototype, evaluation report, incident analysis, and portfolio defense',
		review: [
			{
				prompt:
					'A pipeline imports the same payment file twice and outstanding balances become too low. The dashboard total still looks plausible. Diagnose the failure and design a regression case.',
				answer:
					'Investigate ingestion identity and payment-key uniqueness before altering the balance formula. Duplicate events reduce receivables twice. A regression case should import the same source twice and verify that the declared idempotent ingestion behavior preserves unique payment counts and amounts, or visibly rejects the duplicate. Reconcile invoice-level balances and source control totals; a plausible aggregate is insufficient.'
			},
			{
				prompt:
					'A model reports a correct reconciled total, but its trace shows the ledger-read tool failed and it reused an earlier run’s result. Should the case pass?',
				answer:
					'No, unless the task explicitly permits a verified cache with suitable identity, version, and freshness. A correct-looking final number can conceal a wrong system state or unsupported source. Evaluate actual execution and provenance separately from text. Preserve the failure, investigate stale-state handling, and add a test that a failed read cannot silently display previous output as current.'
			},
			{
				prompt:
					'A final suite contains 10 cases and the system passes 8. Repeated trials on one difficult case pass 2 of 5. What can be reported without overstating reliability?',
				answer:
					'Report 8/10 case outcomes under the defined grading procedure and 2/5 observed passes for that repeated case, with configuration and failure categories. These are small-sample observations, not guaranteed production reliability or independent estimates for every future setting. Cases and repeated trials answer different questions. Inspect whether failures are arithmetic, evidence, execution, or boundary problems.'
			},
			{
				prompt:
					'After freezing your capstone, a new case uses an outdated policy and an unfamiliar field name. You repair both failures and rerun the same cases successfully. What has been demonstrated?',
				answer:
					'The rerun demonstrates that the repairs address those regression cases under the tested conditions. It is development evidence after the failures became known, not a renewed independent final score. Preserve the original result, record the changed assumptions/components, add durable regression checks, and obtain fresh cases for another independent assessment.'
			},
			{
				prompt:
					'Your prototype prepares review notes successfully. An interviewer asks whether it can now release payments automatically. Defend the boundary and explain what additional work that change creates.',
				answer:
					'Preparing a reviewed packet and releasing funds have different consequences and authorization requirements. The prototype has not demonstrated payment execution. The change would require explicit authority, secure integrations, robust state and idempotency, failure recovery, segregation of duties, audit evidence, operational monitoring, and substantially broader evaluation. State the current capability precisely rather than extrapolate from drafting success.'
			},
			{
				prompt:
					'Give a two-minute portfolio defense linking one source record to one final decision. Include a changed constraint and one skill you still need to develop for your chosen role.',
				answer:
					'A strong defense identifies the business question and cutoff, follows a stable record through validation, calculation, evidence retrieval, and the review output, and cites an actual evaluation failure and repair. It explains why the selected workflow or agent boundary fits the task. A changed review capacity, policy date, or customer mix should alter the reasoning where relevant. End with a concrete remaining skill—such as SQL window queries, statistical inference, or persistent service deployment—and a practice artifact, rather than a claim of universal interview readiness.'
			}
		]
	}
];
