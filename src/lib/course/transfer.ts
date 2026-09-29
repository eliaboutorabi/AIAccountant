import type { Check } from './types';

/** Fresh module-level cases; these are separate from the six concept checks. */
export const transferChecks: (Check & { moduleId: string })[] = [
	{
		moduleId: 'M01',
		id: 'M01-T1',
		objective: 2,
		prompt:
			'A new supplier sends a scanned invoice: goods USD 900, tax USD 180, delivery USD 120. Reviewed policy requires an additional approver when the total is at least USD 1,200. Which design correctly decomposes this case?',
		options: [
			'Ask a language model whether the invoice feels large enough to need approval.',
			'Validate the extracted fields, calculate USD 1,200, apply the inclusive threshold, then prepare the additional-approval request.',
			'Calculate USD 1,200 and skip the additional approval because the amount does not exceed the threshold.'
		],
		answer: 1,
		rationales: [
			'A subjective impression does not implement an explicit amount rule. Extraction may use a model, but the reviewed values and policy need a reproducible calculation and comparison.',
			'900 + 180 + 120 = 1,200. “At least” includes equality, so the extra approver is required. Extraction, arithmetic, policy application, and authorization remain distinct operations; preparing a request does not grant approval.',
			'This substitutes “greater than” for the stated inclusive rule. The boundary case is exactly where a readable, testable policy condition matters.'
		]
	},
	{
		moduleId: 'M02',
		id: 'M02-T1',
		objective: 1,
		prompt:
			'At invoice issue on 2 May, an analyst predicts payment status seven days after the due date. A July export contains the original agreed terms, a dispute opened on 20 May, and the final payment date. Which treatment rehearses the issue-date decision?',
		options: [
			'Use the original agreed terms as an input; exclude the later dispute from inputs; use the final payment date only to construct a mature target.',
			'Use all three fields because they are all present in the July export.',
			'Exclude all payment dates, including from target construction, because any future outcome is leakage.'
		],
		answer: 0,
		rationales: [
			'Terms known on 2 May can be a feature. The dispute did not exist at that decision time. The later payment date can determine the target after sufficient follow-up, provided it is not supplied as a prediction input. Observation time and prediction time play different roles.',
			'An extraction date does not establish historical availability. The later dispute and payment event would give the model information the analyst did not yet possess.',
			'Supervised training needs observed outcomes. The restriction is on information available to make the prediction; it does not forbid using later outcomes to label eligible historical examples.'
		]
	},
	{
		moduleId: 'M03',
		id: 'M03-T1',
		objective: 0,
		prompt:
			'A model predicts cost as a fixed USD 10 plus a variable amount times workload. Workloads are 50 and 100; actual costs are USD 50 and USD 90. Changing the variable amount from 0.4 to 0.8 leaves the fixed amount unchanged. What follows for these two examples?',
		options: [
			'The initial residuals are +20 and +40, so the model initially overpredicts.',
			'The new training MAE is zero, proving future invoices will also have zero error.',
			'Initial predictions are 30 and 50, with MAE 30; new predictions are 50 and 90, with MAE zero on these examples only.'
		],
		answer: 2,
		rationales: [
			'Using prediction minus actual, the residuals are 30 − 50 = −20 and 50 − 90 = −40. These are underpredictions; their absolute sizes average to 30.',
			'The two points fit exactly, but fitting these observations is not independent evidence about a later workload, process, or population.',
			'Initially, 10 + 0.4 × 50 = 30 and 10 + 0.4 × 100 = 50. After the change, the predictions are 50 and 90. The calculation establishes the effect of this parameter change; separate evidence is needed to judge generalization.'
		]
	},
	{
		moduleId: 'M04',
		id: 'M04-T1',
		objective: 0,
		prompt:
			'Two procedures have training/validation errors of 0.4/2.2 and 1.0/1.5 on comparable cases. You select the second, freeze it, and observe a final error of 1.7. After examining its final mistakes, you change the penalty and obtain 1.4 on the same final cases. Which reporting is defensible?',
		options: [
			'Report 1.4 as a new independent final estimate because only a penalty changed.',
			'Preserve 1.7 as the first committed result; describe 1.4 as performance after development on consulted cases and seek fresh final evidence.',
			'Replace the chosen procedure with the first one because 0.4 is the smallest number.'
		],
		answer: 1,
		rationales: [
			'The penalty was selected using information from these final cases. They influenced the revised procedure even if no gradient directly trained on their labels.',
			'The first score assesses the originally frozen choice on that sample. The later score can demonstrate a repair on known cases, but is no longer independent evidence for the revised choice.',
			'The smallest training error is not the model-selection objective. The stated validation comparison favored the second procedure; reversing that decision needs relevant new development evidence.'
		]
	},
	{
		moduleId: 'M05',
		id: 'M05-T1',
		objective: 2,
		prompt:
			'A 120-invoice cohort has 24 actual exceptions. A threshold flags 30 invoices, including 18 actual exceptions. Review capacity is 25 invoices. Which recommendation correctly uses the evidence?',
		options: [
			'Report precision 60% and recall 75%; the 30-case queue exceeds capacity, so evaluate a specified top-25 or revised-threshold policy before claiming its result.',
			'Report precision 75% and recall 60%; discard any five flagged cases because recall will be unchanged.',
			'Report that a top-25 queue must capture 15 exceptions because 25 is five-sixths of 30.'
		],
		answer: 0,
		rationales: [
			'Precision is 18 / 30 = 60%; recall is 18 / 24 = 75%. There are 12 false positives and 6 false negatives. The aggregate counts do not identify which exceptions remain under a smaller queue, so the selected policy needs its own case-level evaluation.',
			'The denominators are reversed. Removing five cases can remove positives, negatives, or both; recall is not protected by dropping records arbitrarily.',
			'Proportional scaling assumes the omitted cases have the same exception mix. A ranked top-25 is not a random proportional sample, and the available totals do not establish its outcome.'
		]
	},
	{
		moduleId: 'M06',
		id: 'M06-T1',
		objective: 2,
		prompt:
			'A hidden unit multiplies inputs 0.6 and 0.4 by weights 0.5 and −0.25, adds bias −0.1, then applies ReLU. You change only the first input from 0.6 to 0.2. What happens?',
		options: [
			'The weights have learned from the new case, so the unit must retrain.',
			'The activation changes from 0.1 to −0.1 because ReLU preserves negative numbers.',
			'The activation changes from 0.1 to zero; this is a changed forward-pass result with unchanged parameters.'
		],
		answer: 2,
		rationales: [
			'Providing a different input is inference. Training would require a loss, computed gradients, and a parameter update; none is described here.',
			'The new pre-activation is −0.1, but ReLU replaces negative values with zero. Separate the weighted total from the value after activation.',
			'Initially, 0.6 × 0.5 + 0.4 × (−0.25) − 0.1 = 0.1. With input 0.2, the total is −0.1 and ReLU returns zero. The computation changed because its input changed, not because its weights learned.'
		]
	},
	{
		moduleId: 'M07',
		id: 'M07-T1',
		objective: 2,
		prompt:
			'A source-trained network and a randomly initialized network receive the same 40 target training examples. On the same 100 held-out printed receipts they classify 80 and 82 correctly, respectively; on ten handwritten receipts both classify three correctly. What is the strongest supported conclusion?',
		options: [
			'Transfer learning always hurts because the source-trained model scored lower.',
			'This trial does not show a target advantage from reuse, and both methods have a substantial handwriting gap; inspect the domain difference and repeat relevant evaluation.',
			'Handwriting is solved because the two methods agree on their score.'
		],
		answer: 1,
		rationales: [
			'One small comparison cannot establish a universal result. The outcome depends on source exposure, task, data budget, initialization, training procedure, and evaluation sample.',
			'Observed ordinary-case accuracy is 80% versus 82%; handwriting accuracy is 30% for both. Report that limited evidence, preserve the common evaluation conditions, and investigate the poorly covered input type before deployment.',
			'Agreement between two weak aggregate scores is not competence. Seven of ten handwritten receipts are wrong for each method, and the reported scores do not even establish that they fail on the same receipts.'
		]
	},
	{
		moduleId: 'M08',
		id: 'M08-T1',
		objective: 1,
		prompt:
			'At April month-end, treasury needs a July collections forecast. Model A has one-month MAE 8 and three-month MAE 18. Model B has one-month MAE 11 and three-month MAE 12 on the same eligible targets. Model C reports three-month MAE 3 but used actual June sales, unavailable in April. Which comparison should lead the recommendation?',
		options: [
			'Prefer B over A on the stated three-month error evidence; repair C’s future-driver leakage before including it, then inspect bias and liquidity consequences.',
			'Prefer A because 8 is smaller than B’s three-month error of 12.',
			'Prefer C because a lower error makes information availability irrelevant.'
		],
		answer: 0,
		rationales: [
			'July is three months after the April origin. On comparable three-month targets, 12 is below 18. C was given unavailable information, so its score answers an easier task. A practical choice still needs uncertainty, timing, and downside assessment.',
			'This compares different forecast horizons. A strong one-month result does not establish the quality of a three-month forecast.',
			'A score obtained with future information does not estimate performance of the April decision. Replace the driver with information known or legitimately forecast at April, and rerun the full comparison.'
		]
	},
	{
		moduleId: 'M09',
		id: 'M09-T1',
		objective: 1,
		prompt:
			'Invoice Z totals USD 240 and has three detail lines. It has two valid payment allocations of USD 60 and USD 40. A query directly joins the header to both child tables. Which repair preserves the stated invoice-level question?',
		options: [
			'Sum the joined header amounts: six rows mean USD 1,440 was invoiced.',
			'Use distinct monetary amounts to remove repetitions; amount equality is a reliable record key.',
			'Aggregate allocations to USD 100 at invoice grain before joining; retain one invoice record and report USD 140 outstanding.'
		],
		answer: 2,
		rationales: [
			'Three lines paired with two payments produce six joined rows, repeating the same header. The join did not create new sales or a larger valid receivable.',
			'Different valid events can have equal amounts. Remove or quarantine duplicates using declared identities and evidence, not a distinct-amount operation that can erase legitimate transactions.',
			'Paid is 60 + 40 = 100 and outstanding is 240 − 100 = 140. Aggregate each child to the requested grain before joining, and reconcile against independent source totals.'
		]
	},
	{
		moduleId: 'M10',
		id: 'M10-T1',
		objective: 1,
		prompt:
			'After including preparation, review, and correction, a pilot saves six minutes per case across 400 monthly cases. Capacity is valued at USD 48/hour; recurring costs are USD 900/month and setup costs USD 3,060. Under a constant-volume assumption, which statement is correct?',
		options: [
			'The project creates USD 1,920 cash savings every month and repays setup immediately.',
			'It releases 40 hours worth USD 1,920 of capacity; illustrative net value is USD 1,020/month and simple payback is three months, without proving cash savings.',
			'It releases 2,400 hours per month, so recurring costs are immaterial.'
		],
		answer: 1,
		rationales: [
			'1,920 is the capacity-equivalent gross benefit before the 900 recurring cost. Staff expenditure may remain unchanged, and setup recovery is not immediate.',
			'400 × 6 = 2,400 minutes = 40 hours; 40 × 48 = 1,920; 1,920 − 900 = 1,020. Setup divided by net monthly value is 3,060 / 1,020 = 3 months. These are conditional screening calculations, not realized cash evidence.',
			'2,400 is minutes, not hours. Unit conversion is part of the business case; a large-looking number cannot justify ignoring operating costs.'
		]
	},
	{
		moduleId: 'M11',
		id: 'M11-T1',
		objective: 3,
		prompt:
			'For a toy text-only request, a named tokenizer measures six document tokens and three instruction tokens. The specified combined input/output limit is 14 tokens, and you reserve five output tokens. Assume no other overhead. Which conclusion is valid?',
		options: [
			'The allocation exactly fits this stated limit, but fitting does not establish that the response will use the document correctly.',
			'The document must contain exactly six words because it has six tokens.',
			'The request proves the same document will fit every model with a fourteen-token limit.'
		],
		answer: 0,
		rationales: [
			'6 + 3 + 5 = 14 under the explicitly simplified accounting. Length eligibility and evidence-use quality are separate checks. A real service may impose additional format, output, or modality constraints.',
			'Tokens may be words, pieces, whitespace, punctuation, or bytes. The measured token count does not specify the visible word count.',
			'Tokenization and context accounting depend on the model and application. This result applies to the named encoding and the stated assumptions only.'
		]
	},
	{
		moduleId: 'M12',
		id: 'M12-T1',
		objective: 1,
		prompt:
			'One attention head assigns shares 0.25 and 0.75 to value vectors [8, 0] and [0, 4]. What is the weighted mixture, and what does it establish?',
		options: [
			'[8, 4]; attention concatenates the two values and proves both sources are true.',
			'[6, 1]; the larger share belongs to the first vector because its first number is larger.',
			'[2, 3]; this is the specified mixing operation, not proof that the second source caused the business outcome.'
		],
		answer: 2,
		rationales: [
			'The operation scales and adds corresponding coordinates; it does not concatenate them. Neither a value vector nor an attention share verifies source truth.',
			'The prompt explicitly assigns the shares in order. The magnitude of a value coordinate does not swap those attention coefficients.',
			'0.25 × [8, 0] = [2, 0] and 0.75 × [0, 4] = [0, 3]; adding gives [2, 3]. Later processing and other paths also affect the output. This computation is not a causal explanation of financial performance.'
		]
	},
	{
		moduleId: 'M13',
		id: 'M13-T1',
		objective: 3,
		prompt:
			'After finance adaptation, held-out finance next-token loss falls from 2.1 to 1.6, while held-out general-text loss rises from 1.8 to 2.5. An expense limit changed yesterday and was absent from both corpora. What should the team conclude?',
		options: [
			'Adaptation must have learned yesterday’s expense limit because the finance loss improved.',
			'The measured tasks show a specialization tradeoff; current policy still needs current evidence, and downstream accounting tests remain necessary.',
			'The general-text score proves all fine-tuning is harmful and can never be useful.'
		],
		answer: 1,
		rationales: [
			'The absent updated fact is not supplied by a lower aggregate prediction loss. Additional information access and applicable-version checks are needed.',
			'The reported held-out finance objective improved while general performance degraded on the measured corpus. Retain the original checkpoint, assess the affected capabilities, and evaluate supported policy answers separately from language loss.',
			'The comparison supports a concern about this adaptation under these conditions. It does not establish a universal claim about every dataset, training method, or intended specialization.'
		]
	},
	{
		moduleId: 'M14',
		id: 'M14-T1',
		objective: 1,
		prompt:
			'In USD thousands, budget revenue is 800 and cost of goods sold 480; actual revenue is 900 and cost of goods sold 585. Which headline is numerically supported without inventing an operational cause?',
		options: [
			'Gross profit fell from 320 to 315 while gross margin fell from 40% to 35%, a five-percentage-point decline; the table does not identify why costs rose.',
			'Gross profit rose by 100 because revenue rose by 100; the margin change is irrelevant.',
			'Gross margin fell by 5% and this proves freight was the cause.'
		],
		answer: 0,
		rationales: [
			'Budget gross profit is 800 − 480 = 320; actual is 900 − 585 = 315. Margins are 320 / 800 = 40% and 315 / 900 = 35%. Revenue adds 100 and costs subtract 105, giving a net −5 profit bridge. Operational causes require further evidence.',
			'Gross profit depends on both revenue and cost. Ignoring the cost increase of 105 reverses the conclusion.',
			'The absolute margin difference is five percentage points; the relative decline is 12.5%. Nothing in the two totals isolates freight or establishes a causal explanation.'
		]
	},
	{
		moduleId: 'M15',
		id: 'M15-T1',
		objective: 3,
		prompt:
			'An extracted invoice shows subtotal USD 475, tax USD 47.50, freight USD 12.50, and total USD 535. The source identifier could read AB-O18 or AB-018 because one character is blurred. What should the reviewed record say?',
		options: [
			'The total matches, so normalize every letter O to zero and approve payment.',
			'Change the total to create an exception because ambiguous identifiers necessarily mean the arithmetic is wrong.',
			'The amounts reconcile, but preserve the ambiguous source string and resolve the identifier before matching; extraction does not authorize payment.'
		],
		answer: 2,
		rationales: [
			'475 + 47.50 + 12.50 = 535 checks the amount relation only. An indiscriminate character replacement can corrupt legitimate identifiers; a matched total does not establish identity or approval.',
			'Uncertainty in one field does not justify falsifying a reconciled amount. Preserve which check passed and which issue remains unresolved.',
			'The arithmetic is valid under the entered values, while record identity remains uncertain. Keep the image reference and candidate readings, obtain sufficient evidence, and then perform matching and policy/approval checks.'
		]
	},
	{
		moduleId: 'M16',
		id: 'M16-T1',
		objective: 2,
		prompt:
			'The approved policy register states that lodging limits were USD 125 through June 30 and USD 160 from July 1. A June 30 claim is USD 145. Search returns only the July policy. How should retrieval and the answer be repaired?',
		options: [
			'Apply the newest limit of 160 because search returned it first.',
			'Retrieve the applicable earlier source; under the supplied register the claim exceeds the June limit by 20, but the answer must cite the relevant policy and preserve any other eligibility conditions.',
			'Increase top-k and declare the claim approved even if the earlier policy remains absent.'
		],
		answer: 1,
		rationales: [
			'Publication recency and retrieval rank do not determine applicability to an earlier event. Applying the July rule changes the question.',
			'145 − 125 = 20. The register makes the expected date selection clear; the application should retrieve and inspect that version rather than use the returned July passage as support. Being within or over a limit is only one policy condition.',
			'More retrieved passages can improve coverage only if the required document is available and retrievable. A setting change is not evidence that the missing applicable source has appeared.'
		]
	},
	{
		moduleId: 'M17',
		id: 'M17-T1',
		objective: 1,
		prompt:
			'A tool accepts integer USD minor units, where 100 cents equals one dollar. You need to add USD 38.70 and USD 6.35. Which request/result interpretation respects the contract?',
		options: [
			'Submit integer inputs 3870 and 635; a successful result of 4505 cents means USD 45.05.',
			'Submit 38.70 and 6.35 as integer cents; a valid JSON document guarantees the tool will accept them.',
			'After submitting 3870 and 635, declare the tool succeeded even if it returned a permission error.'
		],
		answer: 0,
		rationales: [
			'38.70 × 100 = 3,870 and 6.35 × 100 = 635. Their exact integer sum is 4,505 cents, or 45.05 dollars. Report success only after a valid actual result.',
			'The numbers are not integers and the units are wrong for this schema. JSON syntax validity does not imply schema, permission, or business validity.',
			'A proposed calculation and a failed execution are different states. Even if you can calculate the sum independently, you cannot truthfully claim that the denied tool operation succeeded.'
		]
	},
	{
		moduleId: 'M18',
		id: 'M18-T1',
		objective: 2,
		prompt:
			'Thirty weekly cases follow an identical validate–reconcile–draft sequence. Three unusual cases require different evidence lookups. All writes must be approved by a reviewer. Which proposed architecture best fits these facts?',
		options: [
			'Give a model unrestricted write tools for all cases because an agent is necessarily better than a workflow.',
			'Use a fixed workflow and silently guess the missing evidence in the unusual cases.',
			'Use the fixed workflow for stable steps; investigate bounded model-selected read-only lookups for unusual cases, with explicit stop conditions and the same enforced review boundary.'
		],
		answer: 2,
		rationales: [
			'The evidence does not justify broader write authority. Autonomy adds cost and failure modes and does not remove the reviewer requirement.',
			'A workflow can escalate uncertainty. Replacing missing evidence with an invented answer conceals an incomplete task rather than making the process reliable.',
			'The architecture gives flexibility to the variable investigation while preserving predictable stable steps and authority limits. Compare it with a manual escalation baseline using actual outcomes before concluding that the additional model step pays off.'
		]
	},
	{
		moduleId: 'M19',
		id: 'M19-T1',
		objective: 2,
		prompt:
			'A checkpoint records draft request X12 as outcome unknown after a lost response. The receiver supports status lookup and idempotent retries with the same key. A new policy version became effective while the task paused. Which resume action is justified?',
		options: [
			'Use a fresh request key so the system forgets the earlier uncertainty.',
			'Inspect X12’s actual status and preserve its identity; separately check which policy version applies to the event and whether the draft evidence needs revision.',
			'Rerun the skill text from the beginning and assume its “never duplicate” instruction prevents duplicate writes.'
		],
		answer: 1,
		rationales: [
			'If the original write succeeded, a new identity can create duplicate logical work. An unknown outcome calls for reconciliation of state, not erasing identity.',
			'The receiver’s documented status/idempotency contract supports recovery. The policy change needs an applicability check; a new version does not automatically replace the version governing an earlier event. Preserve both execution identity and evidence version.',
			'Procedure text does not enforce idempotency. The harness must interpret checkpoint state and use actual receiver behavior before repeating an effect.'
		]
	},
	{
		moduleId: 'M20',
		id: 'M20-T1',
		objective: 1,
		prompt:
			'A draft passes the JSON schema but labels EUR values as USD and says freight caused a variance without a cost breakdown. Which intervention tests the responsible boundaries?',
		options: [
			'Validate currency against source records, reject unsupported causal claims using evidence criteria, and compare the revised system on declared cases.',
			'Only make the instruction “be accurate” more emphatic; schema validity proves the rest of the application works.',
			'Fine-tune on this one corrected response and report the same case as an independent final test.'
		],
		answer: 0,
		rationales: [
			'The schema checks structure; source-linked currency validation checks financial meaning. Causal support requires relevant evidence, not just a string field. Evaluate the complete interventions and keep their failure categories visible.',
			'Structurally valid output can still be false or use the wrong units. Stronger wording alone neither verifies the records nor supplies the absent breakdown.',
			'One corrected training example does not establish robust behavior, and the consulted case cannot then serve as fresh independent evidence. Compare simpler fixes before parameter adaptation.'
		]
	},
	{
		moduleId: 'M21',
		id: 'M21-T1',
		objective: 1,
		prompt:
			'Invoice K is USD 300. Two valid payment allocations have different unique IDs, P81 and P82, but each is USD 75. A generated cleanup removes “duplicate amounts” and retains one payment. What should the repaired pipeline report?',
		options: [
			'USD 225 outstanding, because equal values establish duplicate events.',
			'USD zero outstanding, because two matching amounts prove the invoice was fully paid.',
			'USD 150 paid and USD 150 outstanding; test identity-based duplicate handling without discarding legitimate equal-amount events.'
		],
		answer: 2,
		rationales: [
			'The prompt establishes two distinct valid identities. Deduplicating by amount alone removes a legitimate event and overstates the outstanding balance.',
			'75 + 75 = 150, not 300. Similarity of values is not a settlement condition.',
			'Both valid events contribute: 150 is paid and 300 − 150 = 150 remains. Add a regression case with two equal amounts but distinct IDs, as well as a separate repeated-ID case, to test the actual intended rule.'
		]
	},
	{
		moduleId: 'M22',
		id: 'M22-T1',
		objective: 1,
		prompt:
			'Three cases each receive three trials under a fixed configuration. A passes 3/3, B passes 2/3, and C passes 0/3. What can the report state?',
		options: [
			'Two of three cases passed at least once, proving 67% production reliability.',
			'Five of nine observed trials passed, and one of three cases passed every trial; report the failures and scope without a production reliability guarantee.',
			'The system passed 5/3 because passing trials and distinct cases are interchangeable units.'
		],
		answer: 1,
		rationales: [
			'“At least once” is a possible descriptive case criterion, but it hides B’s variability and does not establish a general production rate from this small selected suite.',
			'Passing trials total 3 + 2 + 0 = 5 out of 9. Only A passes all three, giving 1 out of 3 cases under that stricter criterion. Preserve case, trial, configuration, and grader identity when interpreting these small-sample results.',
			'The numerator counts trials while the denominator counts cases. A meaningful rate uses comparable units and an explicitly stated aggregation rule.'
		]
	},
	{
		moduleId: 'M23',
		id: 'M23-T1',
		objective: 0,
		prompt:
			'Approved synthetic records show an invoice of USD 600 and valid allocated payments of USD 150. The required current policy cannot be retrieved. What output fits the bounded review-assistant contract?',
		options: [
			'Record USD 450 outstanding with its calculation evidence; mark policy eligibility unresolved and prepare an explicitly held or review-required draft.',
			'Suppress the correct balance because missing policy means every source record is necessarily invalid.',
			'Approve the USD 450 payment because the subtraction is correct.'
		],
		answer: 0,
		rationales: [
			'The financial calculation remains supported by the stated records: 600 − 150 = 450. Policy applicability is a separate unresolved requirement. The system should preserve useful verified evidence while withholding claims or actions that depend on the missing source.',
			'Failure of one evidence dependency does not automatically invalidate independent verified facts. Report the precise scope of what is known and missing.',
			'Outstanding balance is not payment authorization, and this prototype does not execute funds release. The missing policy and reviewer boundary remain material.'
		]
	},
	{
		moduleId: 'M24',
		id: 'M24-T1',
		objective: 2,
		prompt:
			'A frozen prototype initially passes 11 of 16 final cases. You investigate five failures, repair the relevant components, and now pass all 16 of those same cases. What belongs in the incident and release record?',
		options: [
			'Delete the initial result because repaired software makes earlier failures irrelevant.',
			'Report 100% independent final reliability and discontinue monitoring.',
			'Preserve 11/16, document the five mechanisms and repairs, record 16/16 as regression evidence on known cases, and define fresh evaluation plus monitoring.'
		],
		answer: 2,
		rationales: [
			'The initial failures explain the assumptions and component changes. Erasing them loses the evidence needed to assess both the repair and remaining risk.',
			'The revised system was developed using those cases, so the rerun is not a renewed independent estimate. Even fresh 16/16 evidence would not prove universal reliability or remove operational monitoring needs.',
			'The record distinguishes diagnosis, repair verification, and independent evaluation. Include a regression case for each mechanism, a monitoring signal, owner response, and a justified rollback or escalation path.'
		]
	},
	{
		moduleId: 'M25',
		id: 'M25-T1',
		objective: 1,
		prompt:
			'In an interview, you show a threshold that flags 80 of 200 cases and captures 56 of 70 actual exceptions. The interviewer changes available review capacity to 60. Which response best demonstrates transferable judgment?',
		options: [
			'Keep the original threshold because 80% recall is always sufficient.',
			'State current precision 70% and recall 80%, acknowledge the capacity mismatch, and propose evaluating a defined top-60 or revised-threshold policy using case-level evidence and consequences.',
			'Promise that 60 reviews will capture 42 exceptions by scaling the totals proportionally, without checking the scores or labels.'
		],
		answer: 1,
		rationales: [
			'The queue exceeds the newly stated capacity by 20 cases. Recall does not determine whether the workflow can execute or whether its errors have acceptable consequences.',
			'Precision is 56 / 80 = 70% and recall is 56 / 70 = 80%. The changed constraint requires a changed operational design and its own evaluation. Explaining what additional evidence is needed is stronger than inventing a precise result.',
			'The removed cases may have a different positive rate. The aggregates do not determine top-60 performance, so 42 is an unsupported extrapolation rather than an evaluated outcome.'
		]
	}
];

/** Reading targets for context-sensitive hints; keys remain independent of check order. */
export const transferSections: Record<string, string> = {
	M01: 'worked-process',
	M02: 'availability',
	M03: 'error-and-loss',
	M04: 'commit',
	M05: 'threshold',
	M06: 'one-forward-pass',
	M07: 'transfer',
	M08: 'rolling-origins',
	M09: 'join-explosion',
	M10: 'worked-economics',
	M11: 'tokens',
	M12: 'qkv',
	M13: 'adaptation',
	M14: 'reconcile',
	M15: 'extraction-case',
	M16: 'the-question',
	M17: 'money',
	M18: 'choose',
	M19: 'checkpoint',
	M20: 'diagnose',
	M21: 'review-code',
	M22: 'variability',
	M23: 'worked-case',
	M24: 'respond',
	M25: 'classification'
};
