import type { TeachingVisual } from './types';

const artSource =
	'Original generated illustration of the module’s worked example. Authored teaching data, not measured model performance.';
const nativeSource =
	'Original native diagram based on the module’s stated worked example. Values are authored teaching data, not measurements from the live lab.';

export const day1Visuals: TeachingVisual[] = [
	{
		id: 'm01-art-mechanisms',
		module: 'M01',
		section: 'four-mechanisms',
		afterBlock: 0,
		kind: 'art',
		image: '/images/visuals/m01-mechanisms.webp',
		width: 1536,
		height: 1024,
		title: 'Four mechanisms, one invoice',
		lead: 'Follow the same document into four different operations. Each operation needs a different check.',
		alt: 'One invoice branches into calculation, an explicit policy gate, learned prediction, and draft generation. All four paths end in a shared evidence-review tray.',
		transcript: [
			{
				label: 'Calculate',
				explanation:
					'A specified arithmetic procedure produces a total. Reconcile the input lines, tax, and total.'
			},
			{
				label: 'Apply a rule',
				explanation:
					'Explicit policy facts determine a condition such as whether an additional approver is required. Check the boundary and applicable policy.'
			},
			{
				label: 'Predict from examples',
				explanation:
					'Learned parameters help recognize a field across varied document layouts. Compare the extraction with its reviewed source.'
			},
			{
				label: 'Generate a draft',
				explanation:
					'A model can assemble a plausible note. The displayed sample sentence is an illustrative draft, not evidence that an invoice satisfies policy.'
			},
			{
				label: 'Check the evidence',
				explanation:
					'The surrounding process checks each output. These operations can coexist; generation often uses machine learning. None of them alone authorizes payment.'
			}
		],
		takeaway:
			'Choose a mechanism for the uncertainty in the task, then identify the evidence that would establish correctness.',
		question:
			'A supplier changes its invoice layout. Does that automatically change the approval threshold?',
		answer:
			'No. Document extraction needs fresh evaluation; the explicit threshold changes only when the applicable policy changes.',
		sourceNote: artSource
	},
	{
		id: 'm01-history',
		module: 'M01',
		section: 'history',
		afterBlock: 0,
		kind: 'diagram',
		layout: 'timeline',
		title: 'Two traditions growing together',
		lead: 'The dates are landmarks in overlapping lines of research, not a sequence in which each method disappears.',
		nodes: [
			{
				label: '1943',
				detail: 'Simplified computational neurons show how connected units can compute.',
				value: 'Connected computation'
			},
			{
				label: '1956–late 1950s',
				detail:
					'Dartmouth helps name the field; perceptrons explore learning a classifier from examples.',
				value: 'AI and learning'
			},
			{
				label: '1960s–1980s',
				detail:
					'Symbolic programs and expert systems encode representations, rules, and domain knowledge.',
				value: 'Explicit knowledge'
			},
			{
				label: '1980s onward',
				detail:
					'Multilayer learning and backpropagation gain renewed prominence alongside other approaches.',
				value: 'Learned layers'
			},
			{
				label: '2010s onward',
				detail:
					'Data, computing, architecture, and training advances broaden deep-learning applications.',
				value: 'Scale and design'
			}
		],
		alt: 'Five historical landmarks connect early neurons, AI and perceptrons, expert systems, multilayer learning, and broader deep-learning applications.',
		takeaway:
			'A modern finance application can combine learned recognition with explicit policy rules. The history does not imply a clean replacement of one tradition by another.',
		question:
			'Why would an application using a modern neural model still contain an if-then approval rule?',
		answer:
			'A policy rule states an authorized condition. Learning a pattern does not replace the need to implement that explicit policy accurately.',
		sourceNote:
			'Original timeline from the selective historical spine and cited historical sources in M01; dates describe landmarks, not sole-invention claims.'
	},
	{
		id: 'm01-review-process',
		module: 'M01',
		section: 'worked-process',
		kind: 'diagram',
		layout: 'flow',
		title: 'From invoice to a reviewable decision',
		lead: 'Reading an amount, satisfying a rule, and establishing delivery answer different questions.',
		nodes: [
			{
				label: 'Preserve the source',
				detail: 'Keep W-418, W-419, W-420 and their supplier references; retain unclear fields.',
				icon: 'file'
			},
			{
				label: 'Apply the amount rule',
				detail:
					'USD 6,200 exceeds 5,000; USD 420 does not. Exactly 5,000 does not exceed the threshold.',
				icon: 'filter'
			},
			{
				label: 'Check identity and receipt',
				detail:
					'W-418/W-420 may duplicate a supplier reference. W-419 still lacks delivery evidence.',
				icon: 'search'
			},
			{
				label: 'Prepare the review queue',
				detail:
					'Show reasons and source links. A reviewer resolves uncertainty within the permitted authority.',
				icon: 'check'
			}
		],
		alt: 'A four-stage review path preserves source records, applies the amount rule, checks duplicate and delivery evidence, and prepares a review queue.',
		takeaway:
			'A passed amount check does not establish delivery, remove a duplicate concern, or authorize payment.',
		question:
			'W-419 is below the threshold. What prevents you from calling its invoice fully supported?',
		answer:
			'Its goods receipt is missing. The amount rule and evidence of delivery are separate checks.',
		sourceNote: nativeSource
	},
	{
		id: 'm02-art-decision-time',
		module: 'M02',
		section: 'availability',
		kind: 'art',
		image: '/images/visuals/m02-decision-time.webp',
		width: 1536,
		height: 1024,
		title: 'What was known at issue?',
		lead: 'Draw the prediction-time boundary before you choose a feature.',
		alt: 'Earlier history and agreed terms sit before an invoice-issue boundary. Future settlement and a later collection note sit beyond it, with a blocked arrow back to the prediction.',
		transcript: [
			{
				label: 'Earlier history',
				explanation:
					'Only outcomes and records already available in the authorized system by the issue timestamp can contribute to historical features.'
			},
			{
				label: 'Agreed terms',
				explanation:
					'The issued transaction can supply a known payment term. The terms do not need a future settlement result to exist.'
			},
			{
				label: 'Issue date',
				explanation:
					'This is when the model is supposed to predict. A historical evaluation must recreate this information boundary.'
			},
			{
				label: 'Future settlement',
				explanation:
					'The invoice’s final settlement date is unavailable at issue and directly reveals future outcome information.'
			},
			{
				label: 'Later collection note',
				explanation:
					'An administrative-looking field can still leak the answer if staff create it in response to overdue behavior. The blocked arrow represents that prohibited use.'
			}
		],
		takeaway:
			'A column is not a legitimate feature merely because it is present in today’s export. Reconstruct when its value became available.',
		question:
			'A “contact required” flag was set after the invoice became overdue. Can it predict lateness at issue?',
		answer:
			'No. Its creation depends on later trouble. Use a valid historical snapshot or exclude it and repeat evaluation.',
		sourceNote: artSource
	},
	{
		id: 'm02-grain',
		module: 'M02',
		section: 'grain-and-keys',
		kind: 'diagram',
		layout: 'flow',
		title: 'One customer, several invoices, many events',
		lead: 'Read the arrows as changes in record grain; a repeated key does not always mean a duplicate.',
		nodes: [
			{
				label: 'Customer',
				detail: 'C-01 identifies one customer. It is a label, not a measurable quantity.',
				value: 'One customer row'
			},
			{
				label: 'Invoices',
				detail: 'I-101 and I-102 both belong to C-01. Each invoice has its own unique key.',
				value: 'Many invoice rows'
			},
			{
				label: 'Payment events',
				detail:
					'Several receipts can settle one invoice. Their event IDs and dates must remain distinct.',
				value: 'Many event rows'
			},
			{
				label: 'Issue-date modeling row',
				detail:
					'Return to one row per issued invoice, using only history available at that issue time.',
				value: 'Declared output grain'
			}
		],
		alt: 'A customer connects to multiple invoices and payment events; a modeling preparation step returns to one row per issued invoice.',
		takeaway:
			'Declare the output grain before joining. Summing invoice amounts after expanding them across payment events can count an invoice several times.',
		question: 'C-01 appears on two invoice rows. Is that enough evidence to delete one?',
		answer:
			'No. A customer may have many legitimate invoices. Check the invoice key and intended row grain before treating repetition as duplication.',
		sourceNote: nativeSource
	},
	{
		id: 'm02-preparation-boundary',
		module: 'M02',
		section: 'preprocessing',
		kind: 'diagram',
		layout: 'compare',
		title: 'Fit preparation on training only',
		lead: 'Even a replacement value can learn from data it should not see.',
		nodes: [
			{
				label: 'Training-only fit',
				detail:
					'Observed training amounts: 100 and 200. Store their mean, 150, for this teaching preparation rule.',
				value: 'USD 150'
			},
			{
				label: 'Leaked fit',
				detail: 'Including later evaluation amount 900 changes the mean of 100, 200, 900 to 400.',
				value: 'USD 400'
			},
			{
				label: 'Apply the stored rule',
				detail:
					'Transform later rows using the training-fitted value. Do not refit it on evaluation data.',
				value: 'Fit → freeze → apply'
			}
		],
		alt: 'Training-only amounts produce a replacement of USD 150; using a later evaluation amount produces USD 400 and crosses the split boundary.',
		takeaway:
			'This illustrates split isolation, not permission to invent missing invoice amounts. A missing required amount may need rejection or review.',
		question: 'Does leakage require using the later target label?',
		answer:
			'No. The later input amount has already changed the preparation fitted to the training rows. Data-dependent preparation belongs inside the training boundary.',
		sourceNote: nativeSource
	},
	{
		id: 'm03-art-update',
		module: 'M03',
		section: 'one-update',
		kind: 'art',
		image: '/images/visuals/m03-training-cycle.webp',
		width: 1536,
		height: 1024,
		title: 'One training update',
		lead: 'For the same 200 invoices, changing one parameter changes the prediction while the observed cost stays fixed.',
		alt: 'A training loop predicts USD 40, compares it with actual USD 60, raises the variable amount from 10 to 15 per hundred invoices, and predicts USD 50. Fixed daily amount remains 20.',
		transcript: [
			{
				label: 'Predict',
				explanation:
					'Two hundreds of invoices at variable amount 10 plus fixed amount 20 gives USD 40.'
			},
			{
				label: 'Measure error',
				explanation:
					'The actual cost is USD 60. Absolute error is USD 20; under the lesson’s prediction-minus-actual convention, the signed residual is −20.'
			},
			{
				label: 'Adjust parameter',
				explanation:
					'The worked update raises the variable parameter from USD 10 to USD 15 per hundred invoices. The fixed parameter deliberately remains USD 20 per day.'
			},
			{
				label: 'Predict again',
				explanation:
					'The new prediction is 20 plus twice 15, or USD 50. Absolute error is USD 10 and the signed residual is −10. The target remains 60.'
			},
			{
				label: 'Scope',
				explanation:
					'This one-case view is part of the module’s three-row update. It illustrates improved training fit, not proof of performance on a new day.'
			}
		],
		takeaway:
			'Training changes parameters. Recomputing a prediction with those parameters is inference; it does not change the observed target.',
		question: 'Why does a five-unit parameter increase raise this prediction by ten dollars?',
		answer:
			'The input is two hundreds of invoices. Each extra dollar per hundred contributes twice to this case.',
		sourceNote: artSource
	},
	{
		id: 'm03-controls',
		module: 'M03',
		section: 'controls',
		kind: 'diagram',
		layout: 'compare',
		title: 'A model and its training controls',
		lead: 'These values occupy different roles even when one interface displays them together.',
		nodes: [
			{
				label: 'Parameters',
				detail:
					'Fixed amount and variable amount determine the model’s current prediction. Training may change them.',
				value: 'Inside the prediction'
			},
			{
				label: 'Learning rate',
				detail:
					'Controls the size of an optimizer step. It is chosen through development evidence, not fitted like a coefficient.',
				value: 'Controls the update'
			},
			{
				label: 'Batch',
				detail:
					'Examples used for one gradient estimate. Changing its size changes the update process.',
				value: 'Which examples now?'
			},
			{
				label: 'Epoch',
				detail:
					'One pass through the training examples. More passes do not guarantee better new-case performance.',
				value: 'Training progress'
			}
		],
		alt: 'Four panels distinguish fitted prediction parameters, the learning-rate setting, the examples in a batch, and the meaning of one epoch.',
		takeaway:
			'“We changed the model” is ambiguous. Name whether you changed a fitted coefficient, a training procedure, or the amount of training.',
		question:
			'A new customer record produces a different prediction with the same coefficients. Did training occur?',
		answer:
			'No. The inputs changed during inference. Training requires updating parameters using a learning procedure.',
		sourceNote: nativeSource
	},
	{
		id: 'm03-large-miss',
		module: 'M03',
		section: 'loss-and-decision',
		kind: 'diagram',
		layout: 'bars',
		unit: 'USD absolute error per case',
		title: 'A large miss changes the preferred model',
		lead: 'The bar groups have different case counts. Read those counts before comparing the averages.',
		nodes: [
			{
				label: 'A: cases 1–3',
				detail: 'Three cases each miss by USD 2.',
				amount: 2,
				value: '3 × $2'
			},
			{ label: 'A: case 4', detail: 'One case misses by USD 20.', amount: 20, value: '1 × $20' },
			{
				label: 'B: cases 1–4',
				detail: 'Four cases each miss by USD 7.',
				amount: 7,
				value: '4 × $7'
			}
		],
		alt: 'Absolute-error bars show three two-dollar errors and one twenty-dollar error for A, compared with four seven-dollar errors for B.',
		takeaway:
			'A has lower MAE: $6.50 versus $7. B has lower mean squared error: 49 versus 103 squared dollars. Squaring gives the large miss more influence.',
		question: 'Is it a calculation error that MAE and squared error prefer different models?',
		answer:
			'No. MAE averages 26/4 for A and 28/4 for B. MSE averages 412/4 for A and 196/4 for B. The objectives emphasize different consequences.',
		sourceNote: nativeSource
	},
	{
		id: 'm04-art-generalization',
		module: 'M04',
		section: 'three-fits',
		kind: 'art',
		image: '/images/visuals/m04-generalization.webp',
		width: 1536,
		height: 1024,
		title: 'Fit the pattern, not the noise',
		lead: 'The rails are qualitative model shapes. The new-case region asks whether the relationship carries forward.',
		alt: 'Three miniature landscapes contrast an overly rigid rail, a smooth useful curve, and a highly wiggly fit. Each extends from familiar observations toward a shaded new-case region.',
		transcript: [
			{
				label: 'Too rigid',
				explanation:
					'A nearly flat relationship misses the visible rising pattern in both familiar and new observations: a schematic underfitting situation.'
			},
			{
				label: 'Useful flexibility',
				explanation:
					'The smooth curve captures the broad pattern without reproducing every small deviation. In this illustrative situation it continues more plausibly.'
			},
			{
				label: 'Chasing noise',
				explanation:
					'A wiggly model adapts closely to incidental details in the familiar examples; that behavior does not necessarily carry into new cases.'
			},
			{
				label: 'New cases',
				explanation:
					'The shaded region represents the cases we ultimately care about. Rail shapes and pebbles are qualitative illustrations, not experimental measurements or a guarantee that middle complexity wins.'
			}
		],
		takeaway:
			'Excellent training fit is only one observation. Select a procedure using relevant validation evidence, then preserve a separate final assessment.',
		question: 'Does the picture prove that a complex model is always worse?',
		answer:
			'No. Complexity can represent useful structure. The warning is to evaluate generalization, rather than choose from a visual preference or training fit alone.',
		sourceNote: artSource
	},
	{
		id: 'm04-early-stopping',
		module: 'M04',
		section: 'regularization',
		kind: 'diagram',
		layout: 'bars',
		unit: 'Validation loss · lower is better',
		title: 'Keep the best validation snapshot',
		lead: 'Training loss keeps improving, but the selection criterion does not.',
		nodes: [
			{
				label: 'Update 20',
				detail: 'Training loss 12. The model has not reached its best observed validation value.',
				amount: 14,
				value: 'Validation 14'
			},
			{
				label: 'Update 50',
				detail: 'Training loss 6. Retain this snapshot under the declared validation criterion.',
				amount: 9,
				value: 'Validation 9'
			},
			{
				label: 'Update 100',
				detail: 'Training loss 3. Better training fit accompanies worse validation behavior.',
				amount: 13,
				value: 'Validation 13'
			}
		],
		alt: 'Validation loss falls from 14 at update 20 to 9 at update 50, then rises to 13 at update 100 despite falling training loss.',
		takeaway:
			'Early stopping selects a saved model state using validation evidence. The latest state is not automatically the best state.',
		question: 'Why not inspect final-test loss at every update and choose its minimum?',
		answer:
			'That would make final cases influence selection. They would become development evidence, requiring a new independent final assessment.',
		sourceNote: nativeSource
	},
	{
		id: 'm04-evidence-roles',
		module: 'M04',
		section: 'commit',
		kind: 'diagram',
		layout: 'flow',
		title: 'What each split is allowed to influence',
		lead: 'The boundary is defined by use, not by the name of a file.',
		nodes: [
			{
				label: 'Training',
				detail: 'Fit preparation and model parameters using these examples.',
				value: 'Fit'
			},
			{
				label: 'Validation',
				detail: 'Choose model family, settings, and stopping point. Record the selection reason.',
				value: 'Select'
			},
			{
				label: 'Commit',
				detail: 'Freeze the selected procedure and intended claim before viewing final outcomes.',
				value: 'Freeze'
			},
			{
				label: 'Final assessment',
				detail: 'Estimate performance for the relevant held-out conditions. Preserve failures.',
				value: 'Evaluate'
			},
			{
				label: 'If you repair from it',
				detail:
					'The revealed cases become development evidence. Another independent claim needs fresh relevant cases.',
				value: 'Reclassify evidence'
			}
		],
		alt: 'An evidence flow moves from fitting on training data to selecting on validation, committing, final evaluation, and reclassifying consulted cases after a repair.',
		takeaway:
			'A final set loses its selection independence when its results guide your changes, even if you continue to call the file test.csv.',
		question:
			'You repair a feature after reading final-case errors. What can a better rerun establish?',
		answer:
			'That the changed system handles those known cases better. It is useful regression evidence, not a fresh estimate independent of selection.',
		sourceNote: nativeSource
	},
	{
		id: 'm05-art-confusion',
		module: 'M05',
		section: 'four-cells',
		kind: 'art',
		image: '/images/visuals/m05-confusion-map.webp',
		width: 1536,
		height: 1024,
		title: 'One hundred invoices, four outcomes',
		lead: 'The numerals are the counts; the illustrated paper stacks are symbolic, not proportional.',
		alt: 'A two-by-two confusion matrix has duplicate and ordinary rows, flagged and not-flagged columns. The cells contain 8, 2, 12, and 78 respectively.',
		transcript: [
			{
				label: 'Duplicate + flagged: 8',
				explanation:
					'Eight true positives: confirmed duplicates successfully sent to the review queue.'
			},
			{
				label: 'Duplicate + not flagged: 2',
				explanation: 'Two false negatives: confirmed duplicates omitted from the queue.'
			},
			{
				label: 'Ordinary + flagged: 12',
				explanation: 'Twelve false positives: ordinary invoices that consume review work.'
			},
			{
				label: 'Ordinary + not flagged: 78',
				explanation: 'Seventy-eight true negatives. The four cells sum to one hundred invoices.'
			},
			{
				label: 'Choose the denominator',
				explanation:
					'Precision is 8 of the 20 flagged invoices, or 40%. Recall is 8 of the 10 actual duplicates, or 80%. Accuracy is 86 of all 100, or 86%.'
			}
		],
		takeaway:
			'Precision describes queue yield; recall describes capture of actual positives. Their different denominators encode different business questions.',
		question: 'Why can flagging nothing achieve higher accuracy in this example?',
		answer:
			'Ninety invoices are ordinary, so always predicting ordinary gives 90% accuracy but misses all ten duplicates. Recall becomes zero.',
		sourceNote: artSource
	},
	{
		id: 'm05-score-to-action',
		module: 'M05',
		section: 'three-layers',
		kind: 'diagram',
		layout: 'flow',
		title: 'From a score to a feasible action',
		lead: 'A numerical output, a category, and an authorized action are separate steps.',
		nodes: [
			{
				label: 'Model score',
				detail:
					'A score such as 0.8 comes from the fitted model. It is not automatically a calibrated probability.',
				value: 'Prediction'
			},
			{
				label: 'Selection rule',
				detail: 'A threshold or capacity-based ranking determines which cases enter the queue.',
				value: 'Application policy'
			},
			{
				label: 'Review work',
				detail: 'Reviewers need time, source evidence, and a defined way to resolve uncertainty.',
				value: 'Feasible workload'
			},
			{
				label: 'Authorized outcome',
				detail:
					'The review result supports a bounded next action. A high score alone does not approve or reject a payment.',
				value: 'Decision and authority'
			}
		],
		alt: 'A model score passes through a selection policy, a review-capacity step, and an authorized decision rather than directly triggering payment.',
		takeaway:
			'Changing a threshold can change the workload without changing the model. The application still needs a policy for unreviewed and uncertain cases.',
		question:
			'A threshold flags 35 cases, but the team can review only 15. Has the model delivered 35 completed decisions?',
		answer:
			'No. It has produced a queue exceeding capacity. Evaluate a feasible ranking or threshold and explicitly handle the cases left unreviewed.',
		sourceNote: nativeSource
	},
	{
		id: 'm05-cost-tradeoff',
		module: 'M05',
		section: 'cost',
		kind: 'diagram',
		layout: 'bars',
		unit: 'USD modeled total cost',
		title: 'The price of fifteen extra reviews',
		lead: 'Review costs stay $6 per case. Changing the cost of a miss reverses the preferred threshold.',
		nodes: [
			{
				label: '$150 miss · original',
				detail: '20 reviews cost 120; two misses cost 300.',
				amount: 420,
				value: '$420'
			},
			{
				label: '$150 miss · lower threshold',
				detail: '35 reviews cost 210; one miss costs 150.',
				amount: 360,
				value: '$360'
			},
			{
				label: '$30 miss · original',
				detail: '20 reviews cost 120; two misses cost 60.',
				amount: 180,
				value: '$180'
			},
			{
				label: '$30 miss · lower threshold',
				detail: '35 reviews cost 210; one miss costs 30.',
				amount: 240,
				value: '$240'
			}
		],
		alt: 'Four cost bars show original and lower-threshold totals of 420 versus 360 when a miss costs 150, and 180 versus 240 when a miss costs 30.',
		takeaway:
			'At a $150 miss cost, extra review saves an expected $60; at $30 it costs $60 more. Neither result removes the need to check capacity and assumptions.',
		question:
			'Why is a duplicate invoice’s face amount not automatically the expected cost of missing it?',
		answer:
			'A missed flag does not guarantee an incorrect payment or irrecoverable loss. Estimate the relevant probability and consequences instead of substituting face value without justification.',
		sourceNote: nativeSource
	}
];
