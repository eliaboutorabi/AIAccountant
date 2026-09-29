import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import Assessment from './Assessment.svelte';
import { BOOK, CourseProgress } from '../progress.svelte';
import { modules } from '../index';
import { transferChecks } from '../transfer';
import '../../../routes/layout.css';

const module = {
	...modules[0],
	checks: modules[0].checks.slice(0, 1),
	interview: { ...modules[0].interview, followUps: modules[0].interview.followUps.slice(0, 1) }
};
const check = module.checks[0];
const wrong = (check.answer + 1) % check.options.length;
const props = (book: CourseProgress) => ({ props: { module }, context: new Map([[BOOK, book]]) });
beforeEach(() => localStorage.removeItem('ai-accountant-course-v2'));

test('draft selection is distinct from a submitted attempt, with progressive help and permanent reveal history', async () => {
	const book = new CourseProgress();
	const screen = await render(Assessment, props(book));
	const group = screen.getByRole('group', { name: `01 ${check.prompt}` });
	await expect
		.element(group.getByRole('button', { name: 'Check my answer', exact: true }))
		.toBeDisabled();
	await group.getByRole('button', { name: 'Hint 1 · locate the idea' }).click();
	await expect.element(group.getByRole('link', { name: /Revisit:/ })).toBeVisible();
	await group.getByRole('button', { name: 'Hint 2 · plan your reasoning' }).click();
	await group.getByRole('radio').nth(wrong).click();
	expect(book.get(module.id).answers[check.id]).toBeUndefined();
	await group.getByRole('button', { name: 'Check my answer', exact: true }).click();
	await expect.element(group.getByText('Revisit the distinction.', { exact: true })).toBeVisible();
	await group
		.getByText('Reason through every option · records a solution reveal', { exact: true })
		.click();
	await expect.element(group.getByText('Solution opened', { exact: true })).toBeVisible();
	await group.getByRole('radio').nth(check.answer).click();
	await group.getByRole('button', { name: 'Check revised answer' }).click();
	expect(book.get(module.id).checkHistory![check.id].attempts.map((a) => a.answer)).toEqual([
		wrong,
		check.answer
	]);
	await expect
		.element(group.getByText('Your submitted answer is correct.', { exact: true }))
		.toBeVisible();
	await expect
		.element(screen.getByText('1 of 1 checks currently correct', { exact: true }))
		.toBeVisible();
	await expect
		.element(screen.getByText(/0 correct across 1 first recorded attempts/))
		.toBeVisible();
	const reload = new CourseProgress();
	reload.load();
	expect(reload.get(module.id).checkHistory![check.id].attempts[1]).toMatchObject({
		hints: [1, 2],
		priorFeedback: true,
		priorSolution: true
	});
});

test('the written first response stays intact when the learner reveals, edits and self-assesses', async () => {
	const book = new CourseProgress();
	const screen = await render(Assessment, props(book));
	await screen
		.getByRole('textbox', { name: 'Your case response', exact: true })
		.fill('Initial case reasoning and evidence.');
	await screen.getByRole('button', { name: 'Save first response for comparison' }).first().click();
	await screen
		.getByText('Study the complete worked solution · records assistance', { exact: true })
		.click();
	await expect
		.element(screen.getByText(/Worked answer opened. This remains assisted practice/))
		.toBeVisible();
	await screen
		.getByRole('textbox', { name: 'Your case response', exact: true })
		.fill('My revised response after reading.');
	await screen.getByRole('checkbox').first().click();
	expect(book.get(module.id).writtenHistory!.assignment.first?.text).toBe(
		'Initial case reasoning and evidence.'
	);
	expect(book.get(module.id).responses.assignment).toBe('My revised response after reading.');
	expect(book.get(module.id).writtenHistory!.assignment.reveals).toHaveLength(1);
	expect(book.get(module.id).rubric).toEqual(['0']);
	await screen.getByText('Compare with your first saved response', { exact: true }).click();
	await expect
		.element(screen.getByText('Initial case reasoning and evidence.', { exact: true }))
		.toBeVisible();
});

test('the changed case records its own first attempt without increasing original-check totals', async () => {
	const book = new CourseProgress();
	const screen = await render(Assessment, props(book));
	const transfer = transferChecks.find((q) => q.moduleId === module.id)!;
	const group = screen.getByRole('group', { name: `T ${transfer.prompt}` });
	await group.getByRole('radio').nth(transfer.answer).click();
	await group.getByRole('button', { name: 'Check my answer', exact: true }).click();
	expect(book.get(module.id).answers[transfer.id]).toBe(transfer.answer);
	await expect
		.element(screen.getByText('0 of 1 checks currently correct', { exact: true }))
		.toBeVisible();
	await expect.element(group.getByText(/First recorded answer:/)).toBeVisible();
});

test('assessment controls, feedback and assisted evidence are accessible on a narrow screen', async () => {
	await page.viewport(390, 844);
	const book = new CourseProgress();
	const screen = await render(Assessment, props(book));
	const group = screen.getByRole('group', { name: `01 ${check.prompt}` });
	await group.getByRole('button', { name: 'Hint 1 · locate the idea' }).click();
	await group.getByRole('radio').nth(wrong).click();
	await group.getByRole('button', { name: 'Check my answer', exact: true }).click();
	const result = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
}, 15000);
