/** Original fictional teaching sentences, written for this repository; no downloaded corpus. */
export const FINANCE_CORPUS = {
	version: 'willow-original-finance-sentences-v1',
	train: [
		'cash received is not always revenue earned.',
		'revenue less cost of goods sold gives gross profit.',
		'gross margin is gross profit divided by revenue.',
		'an invoice records an amount due from a customer.',
		'a payment can settle one invoice or several invoices.',
		'check the period and currency before comparing totals.',
		'the budget is a plan; actual results are recorded outcomes.',
		'a forecast is a prediction with assumptions and uncertainty.',
		'reconcile the opening balance, movements and closing balance.',
		'an accrual records a cost before the cash is paid.',
		'a prepaid cost is paid before the benefit is consumed.',
		'accounts receivable records amounts owed by customers.',
		'accounts payable records amounts owed to suppliers.',
		'a credit note reduces the amount due on an invoice.',
		'a duplicate invoice can overstate expenses and amounts payable.',
		'a matching total does not prove every transaction is correct.',
		'save the source, period and version with the analysis.',
		'missing evidence is not evidence that an amount is zero.',
		'a reviewer checks unusual items before approval.',
		'a policy describes the rule and its effective date.',
		'cash flow differs from profit because timing differs.',
		'an increase in sales can coexist with a lower gross margin.',
		'compare the forecast with a simple baseline on later periods.',
		'use training records to update model parameters.',
		'use validation records to compare model choices.',
		'reveal final test results after committing to a model.',
		'a token is one unit in the input sequence.',
		'a character model predicts the next character from earlier ones.',
		'attention combines information from available positions.',
		'a causal mask hides future positions during training.',
		'training changes weights; generation extends the context.',
		'fluent text can contain an unsupported financial claim.',
		'a calculator checks arithmetic, not the source of the amounts.',
		'the report says what changed, but may not establish why.',
		'an assistant can draft a note for a reviewer to inspect.',
		'write down what is known, what is missing and what to check next.',
		'one percentage point is not the same as one percent.',
		'the sum of a profit bridge must reconcile to the final profit.',
		'a source citation must support the claim beside it.',
		'avoid posting a journal entry without the required approval.'
	],
	validation: [
		'cash collected today may relate to a sale in an earlier month.',
		'check whether both reports cover the same entity and period.',
		'a supplier may issue a credit for a returned purchase.',
		'a forecast error measures the gap between prediction and outcome.',
		'the cost report supports an amount but not every possible cause.',
		'a model can fit training examples and fail on new records.',
		'adding a document changes the context used for a response.',
		'approval should follow the policy that applied on the transaction date.'
	],
	test: [
		'a sale can increase revenue while the customer has yet to pay.',
		'the closing ledger balance must agree with the reconciled report.',
		'pay attention to returns and discounts when comparing sales.',
		'withheld records help assess performance beyond the fitting data.',
		'the reviewer needs a trace from the explanation to its evidence.',
		'a confident sentence is not proof of a correct financial result.',
		'changed prices and volumes may both affect the revenue total.',
		'future observations must not be included in a historical forecast.'
	]
} as const;

/** Fixed before inspecting any split. ID zero is an explicit unknown-character token. */
export const CHARACTER_VOCABULARY = [
	'\uFFFD',
	'\n',
	...Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32))
] as const;
const tokenIds = new Map<string, number>(
	CHARACTER_VOCABULARY.map((piece, index) => [piece, index])
);

export function encodeCharacters(text: string): number[] {
	return Array.from(text, (character) => tokenIds.get(character) ?? 0);
}

export function decodeCharacters(ids: number[]): string {
	return ids
		.map((id) => {
			if (!Number.isInteger(id) || id < 0 || id >= CHARACTER_VOCABULARY.length)
				throw new Error('Unknown token ID.');
			return CHARACTER_VOCABULARY[id];
		})
		.join('');
}

export function characterTokens(text: string) {
	return Array.from(text, (character, position) => ({
		position,
		id: tokenIds.get(character) ?? 0,
		piece: tokenIds.has(character) ? character : '\uFFFD',
		original: character,
		unknown: !tokenIds.has(character)
	}));
}

/** Original general-language sentences; a tiny teaching corpus, not web-scale pretraining. */
export const GENERAL_CORPUS = {
	version: 'willow-original-general-sentences-v1',
	train: [
		'the morning light falls across the quiet garden.',
		'a small bird carries a twig to its nest.',
		'rain forms when water droplets gather in a cloud.',
		'the river flows between the hills toward the sea.',
		'a seed needs water and warmth before it can grow.',
		'the moon reflects light from the sun.',
		'a map shows places and the paths between them.',
		'the train leaves the station after the doors close.',
		'a reader turns the page to continue the story.',
		'the baker mixes flour and water in a bowl.',
		'warm bread rests on a clean wooden board.',
		'the child learns a new word by hearing it in a sentence.',
		'a musician listens to the rhythm before joining the song.',
		'the painter adds a little blue to the green.',
		'a question can have more than one reasonable answer.',
		'the teacher explains an unfamiliar idea with an example.',
		'a good explanation connects each step to the next.',
		'the door opens into a room with a large window.',
		'a coat keeps the traveler warm in cold weather.',
		'the bicycle needs air in both of its tires.',
		'a compass helps the walker choose a direction.',
		'the library lends books to people in the town.',
		'a tree grows slowly while its roots reach deeper.',
		'the ocean changes color as the sunlight fades.',
		'a bridge carries the road across the valley.',
		'the glass contains water with a slice of lemon.',
		'a candle makes a small circle of light.',
		'the dog waits beside the gate for its owner.',
		'a recipe lists the ingredients and the order of the steps.',
		'the wind moves leaves across the empty path.',
		'a telescope gathers light from distant stars.',
		'the earth travels around the sun once each year.',
		'an observer writes down what happened during the experiment.',
		'the result may change when the conditions change.',
		'a careful listener asks before making an assumption.',
		'the puzzle becomes easier when the pieces are sorted.',
		'a mountain trail can be steep near the top.',
		'the kettle whistles when the water begins to boil.',
		'a photograph records one moment from a particular view.',
		'the story ends when the traveler returns home.'
	],
	validation: [
		'the rain stops and a rainbow appears above the fields.',
		'a young tree needs support while its roots become strong.',
		'the visitor follows a narrow path beside the river.',
		'a clear example can make a difficult idea easier to follow.',
		'the cook tastes the soup before adding more salt.',
		'a moving cloud briefly hides the bright moon.',
		'the reader pauses to think about the final sentence.',
		'the experiment is repeated under different conditions.'
	],
	test: [
		'a bright star appears above the dark outline of the hill.',
		'the gardener waters the plants before the afternoon heat.',
		'a passenger looks through the window as the train slows.',
		'the musician practices a short passage until it sounds clear.',
		'a small change in the recipe can alter the taste.',
		'the guide explains why the path turns away from the river.',
		'a quiet room helps the reader concentrate on the story.',
		'the observer compares the new result with an earlier one.'
	]
} as const;
