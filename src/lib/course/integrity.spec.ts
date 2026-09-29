import { describe, it, expect } from 'vitest';
import { modules } from './index';
import { days } from './days';
import { labs } from './labs';
import { terms, annotate } from './terms';
import { transferChecks } from './transfer';
import { starterSource } from '../engines/workflow';
import { execFileSync } from 'node:child_process';

describe('the published learning graph', () => {
	it('connects seven complete days, prerequisites, objective checks, and changed cases', () => {
		expect(modules).toHaveLength(35);
		expect(new Set(modules.map((m) => m.id)).size).toBe(35);
		expect(days).toHaveLength(7);
		for (const day of days) {
			const daily = modules.filter((m) => m.day === day.day);
			expect(daily).toHaveLength(5);
			expect(daily.reduce((n, m) => n + m.minutes, 30)).toBe(360);
			expect(day.review).toHaveLength(6);
		}
		for (const [index, m] of modules.entries()) {
			expect(
				m.prerequisites.every((id) => modules.slice(0, index).some((prior) => prior.id === id)),
				m.id + ' prerequisites'
			).toBe(true);
			expect(m.checks).toHaveLength(6);
			expect(new Set(m.sections.map((s) => s.id)).size).toBe(m.sections.length);
			expect(
				m.objectives.every((_, i) => m.checks.some((q) => q.objective === i)),
				m.id + ' objective coverage'
			).toBe(true);
			for (const q of m.checks) {
				expect(q.answer).toBeGreaterThanOrEqual(0);
				expect(q.answer).toBeLessThan(q.options.length);
				expect(q.rationales).toHaveLength(q.options.length);
			}
			for (const b of m.sections.flatMap((s) => s.blocks)) {
				if (b.kind === 'lab')
					expect(
						labs.some((l) => l.id === b.id),
						m.id + ' ' + b.id
					).toBe(true);
			}
			expect(m.assignment.tasks.length).toBeGreaterThan(1);
			expect(m.assignment.rubric.length).toBeGreaterThan(1);
			expect(m.assignment.workedSolution.length).toBeGreaterThan(0);
			expect(m.sources.every((s) => new URL(s.url).protocol === 'https:')).toBe(true);
		}
		expect(transferChecks).toHaveLength(35);
	});
	it('links every defined term to a real chapter and preserves ordinary text', () => {
		expect(new Set(terms.map((t) => t.term.toLowerCase())).size).toBe(terms.length);
		expect(terms.every((t) => modules.some((m) => m.id === t.module))).toBe(true);
		const text = 'A token is not tokenized truth; a context window has limits.';
		const fragments = annotate(text);
		expect(fragments.map((f) => f.text).join('')).toBe(text);
		expect(fragments.filter((f) => f.term).map((f) => f.text)).toContain('context window');
		expect(fragments.filter((f) => f.term).map((f) => f.text)).not.toContain('tokenized');
	});
	it('runs the downloadable HTTP service against independent expected receipts and recovery cases', () => {
		const output = execFileSync(
			process.execPath,
			['course-materials/builder-service.mjs', '--self-test'],
			{ encoding: 'utf8', timeout: 10000 }
		);
		expect(output).toContain('Passed: exact amounts');
		expect(output).toContain('restart recovery');
	});

	it('uses the same original reconciliation population as the portfolio starter', () => {
		const result = JSON.parse(
			execFileSync(process.execPath, ['--input-type=module', '-e', starterSource()], {
				encoding: 'utf8'
			})
		);
		expect(
			result.result.reduce(
				(n: number, r: { outstandingMinor: string }) => n + Number(r.outstandingMinor),
				0
			)
		).toBe(90000);
		expect(result.quarantine).toHaveLength(1);
		expect(result.unmatched).toHaveLength(1);
	});
});
