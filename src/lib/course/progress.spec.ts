import { describe, expect, it, vi } from 'vitest';
import { CourseProgress, emptyEvidence, mergeBook, sanitizeBook } from './progress.svelte';
import { checkGuidance, modules, status } from './index';
import { transferChecks, transferSections } from './transfer';

const module = modules[0];
const check = module.checks[0];
const wrong = (check.answer + 1) % check.options.length;

describe('assessment evidence without mastery claims', () => {
	it('preserves the first submitted answer and assistance through corrections and export/import', () => {
		const book = new CourseProgress();
		book.answer(module.id, check.id, wrong);
		book.hint(module.id, check.id, 1);
		book.hint(module.id, check.id, 1);
		book.revealCheck(module.id, check.id);
		book.answer(module.id, check.id, check.answer);
		const evidence = book.get(module.id);
		expect(evidence.answers[check.id]).toBe(check.answer);
		expect(evidence.checkHistory![check.id].attempts.map((a) => a.answer)).toEqual([
			wrong,
			check.answer
		]);
		expect(evidence.checkHistory![check.id].attempts[0].hints).toEqual([]);
		expect(evidence.checkHistory![check.id].attempts[1]).toMatchObject({
			hints: [1],
			priorFeedback: true,
			priorSolution: true
		});
		expect(evidence.checkHistory![check.id].hints).toHaveLength(1);
		const summary = status(module, evidence);
		expect(summary).toMatchObject({
			checksCorrect: 1,
			firstAttemptTracked: 1,
			firstAttemptCorrect: 0,
			firstAttemptWithoutHelpCorrect: 0,
			checksWithHints: 1,
			checksWithSolutions: 1,
			selfAssessed: false
		});
		const restored = new CourseProgress();
		restored.restore(JSON.parse(JSON.stringify(book.data)));
		expect(restored.get(module.id).checkHistory).toEqual(
			sanitizeBook(book.data).modules[module.id].checkHistory
		);
	});
	it('preserves array order when two attempts share the same device millisecond', () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(1000);
		try {
			const book = new CourseProgress();
			book.answer('M01', 'same-time', 2);
			book.answer('M01', 'same-time', 0);
			const restored = sanitizeBook(book.data);
			expect(restored.modules.M01.checkHistory!['same-time'].attempts.map((a) => a.answer)).toEqual(
				[2, 0]
			);
		} finally {
			clock.mockRestore();
		}
	});
	it('does not rewrite the first attempt when the device clock moves backward', () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(2000);
		try {
			const book = new CourseProgress();
			book.answer('M01', 'clock-change', 2);
			clock.mockReturnValue(1000);
			book.answer('M01', 'clock-change', 0);
			const restored = sanitizeBook(book.data);
			expect(
				restored.modules.M01.checkHistory!['clock-change'].attempts.map((a) => a.answer)
			).toEqual([2, 0]);
		} finally {
			clock.mockRestore();
		}
	});
	it('marks existing v2 answers and drafts as unknown history instead of inventing first attempts', () => {
		const book = new CourseProgress();
		book.restore({
			version: 2,
			lastModule: 'M01',
			modules: {
				M01: {
					answers: { [check.id]: wrong },
					responses: { assignment: 'Previously saved work' },
					read: ['history'],
					rubric: ['0'],
					bookmarked: true
				}
			}
		});
		expect(book.get('M01').checkHistory![check.id]).toMatchObject({
			legacyAnswer: wrong,
			attempts: []
		});
		expect(status(module, book.get('M01'))).toMatchObject({
			firstAttemptTracked: 0,
			historyUnknown: 1
		});
		book.answer('M01', check.id, check.answer);
		book.captureResponse('M01', 'assignment');
		expect(book.get('M01').checkHistory![check.id].attempts[0].priorHistoryUnknown).toBe(true);
		expect(book.get('M01').writtenHistory!.assignment.first?.priorHistoryUnknown).toBe(true);
		expect(status(module, book.get('M01')).firstAttemptWithoutHelpCorrect).toBe(0);
		expect(book.get('M01').responses.assignment).toBe('Previously saved work');
	});
	it('keeps the first meaningful saved writing separate from later edits and solution reveals', () => {
		const book = new CourseProgress();
		book.response('M01', 'assignment', 'My initial reasoning.');
		expect(book.get('M01').writtenHistory!.assignment.first).toBeUndefined();
		book.captureResponse('M01', 'assignment');
		book.response('M01', 'assignment', 'A corrected explanation.');
		book.revealWritten('M01', 'assignment');
		book.captureResponse('M01', 'assignment');
		book.toggle('M01', 'rubric', '0');
		expect(book.get('M01').writtenHistory!.assignment.first).toMatchObject({
			text: 'My initial reasoning.',
			trigger: 'saved',
			priorHistoryUnknown: false
		});
		expect(book.get('M01').responses.assignment).toBe('A corrected explanation.');
		expect(book.get('M01').writtenHistory!.assignment.reveals).toHaveLength(1);
		expect(book.get('M01').rubric).toEqual(['0']);
	});
	it('records opening a worked solution before writing, without retroactively treating copied writing as an initial answer', () => {
		const book = new CourseProgress();
		book.revealWritten('M01', 'interview');
		book.response('M01', 'interview', 'A later answer.');
		book.captureResponse('M01', 'interview');
		expect(book.get('M01').writtenHistory!.interview.first).toMatchObject({
			text: '',
			trigger: 'before-solution'
		});
		expect(book.get('M01').responses.interview).toBe('A later answer.');
		expect(status(module, book.get('M01')).selfAssessed).toBe(false);
	});
	it('does not certify writing from keywords, length, or solution reveals', () => {
		const book = new CourseProgress();
		book.response('M01', 'assignment', 'gradient data AI baseline evidence '.repeat(500));
		book.revealWritten('M01', 'assignment');
		const summary = status(module, book.get('M01'));
		expect(summary).toMatchObject({
			written: true,
			practiced: true,
			selfAssessed: false,
			checksCorrect: 0,
			firstAttemptCorrect: 0
		});
		expect(summary).not.toHaveProperty('mastered');
	});
	it('retains the original observation when bounded attempt storage is exhausted', () => {
		const book = new CourseProgress();
		for (let i = 0; i < 205; i++) book.answer('M01', 'bounded', i % 2);
		const history = book.get('M01').checkHistory!.bounded;
		expect(history.attempts).toHaveLength(200);
		expect(history.attempts[0].answer).toBe(0);
		expect(history.trimmed).toBe(true);
		expect(book.get('M01').answers.bounded).toBe(0);
	});
});

describe('imports and merges', () => {
	it('merges assistance and attempts without replacing current notes, duplicating events, or erasing an earlier failed attempt', () => {
		const old = new CourseProgress();
		old.answer('M01', check.id, wrong);
		old.response('M01', 'assignment', 'Original draft');
		old.captureResponse('M01', 'assignment');
		const local = new CourseProgress();
		local.restore(JSON.parse(JSON.stringify(old.data)));
		local.answer('M01', check.id, check.answer);
		local.response('M01', 'assignment', 'Current local draft');
		old.hint('M01', check.id, 1);
		old.revealCheck('M01', check.id);
		old.revealWritten('M01', 'assignment');
		const merged = mergeBook(local.data, old.data);
		expect(merged.modules.M01.answers[check.id]).toBe(check.answer);
		expect(merged.modules.M01.responses.assignment).toBe('Current local draft');
		expect(merged.modules.M01.checkHistory![check.id].attempts.map((a) => a.answer)).toEqual([
			wrong,
			check.answer
		]);
		expect(merged.modules.M01.checkHistory![check.id].hints).toHaveLength(1);
		expect(
			merged.modules.M01.checkHistory![check.id].reveals.some((r) => r.kind === 'solution')
		).toBe(true);
		expect(merged.modules.M01.writtenHistory!.assignment.first?.text).toBe('Original draft');
		expect(merged.modules.M01.writtenHistory!.assignment.reveals).toHaveLength(1);
		expect(mergeBook(merged, old.data)).toEqual(merged);
	});
	it('rejects malformed histories and unsafe keys without losing valid older fields', () => {
		const raw = JSON.parse(
			'{"version":2,"lastModule":"M99","modules":{"M01":{"responses":{"assignment":"keep me","__proto__":"bad"},"answers":{"ok":2,"bad":-1,"float":0.5},"checkHistory":{"ok":{"attempts":[{"id":"invalid","at":-1,"answer":2}],"reveals":[{"id":"r1","at":100,"kind":"solution"},{"id":"bad","at":100,"kind":"injected"}],"hints":[{"id":"h1","at":101,"level":8}]}},"writtenHistory":{"assignment":{"first":{"text":42},"reveals":[null]}}},"M99":{"answers":{"ok":1}}}}'
		);
		const clean = sanitizeBook(raw);
		expect(Object.keys(clean.modules)).toEqual(['M01']);
		expect(clean.lastModule).toBe('M01');
		expect(clean.modules.M01.answers).toEqual({ ok: 2 });
		expect(clean.modules.M01.responses.assignment).toBe('keep me');
		expect(Object.hasOwn(clean.modules.M01.responses, '__proto__')).toBe(false);
		expect(clean.modules.M01.checkHistory!.ok).toMatchObject({
			attempts: [],
			hints: [],
			legacyAnswer: 2
		});
		expect(clean.modules.M01.checkHistory!.ok.reveals).toHaveLength(1);
		expect(clean.modules.M01.writtenHistory!.assignment.first).toBeUndefined();
	});
	it('keeps changed-case checks separate from the six original check totals', () => {
		const transfer = transferChecks.find((q) => q.moduleId === 'M01')!;
		const book = new CourseProgress();
		book.answer('M01', transfer.id, transfer.answer);
		expect(status(module, book.get('M01')).checksCorrect).toBe(0);
		expect(book.get('M01').checkHistory![transfer.id].attempts[0].answer).toBe(transfer.answer);
	});
	it('links all conceptual and changed-case hints to existing objectives and actual sections', () => {
		for (const module of modules)
			for (const check of [
				...module.checks,
				...transferChecks.filter((q) => q.moduleId === module.id)
			]) {
				const guidance = checkGuidance(
					module,
					check,
					check.id.endsWith('-T1') ? transferSections[module.id] : undefined
				);
				expect(module.objectives).toContain(guidance.objective);
				expect(module.sections).toContain(guidance.section);
				expect(guidance.strategy.length).toBeGreaterThan(0);
			}
		expect(status(module, emptyEvidence())).toMatchObject({
			checksCorrect: 0,
			firstAttemptTracked: 0,
			selfAssessed: false
		});
	});
});
