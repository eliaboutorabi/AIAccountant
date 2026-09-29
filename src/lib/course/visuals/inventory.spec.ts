import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { modules } from '../index';
import { teachingVisuals, visualsAt } from './index';

describe('visual teaching inventory', () => {
	it('places every figure in a real chapter and keeps every module visually supported', () => {
		expect(teachingVisuals).toHaveLength(82);
		expect(new Set(teachingVisuals.map((v) => v.id)).size).toBe(teachingVisuals.length);
		expect(teachingVisuals.filter((v) => v.kind === 'art')).toHaveLength(25);
		expect(teachingVisuals.filter((v) => v.kind === 'diagram')).toHaveLength(50);
		expect(teachingVisuals.filter((v) => v.kind === 'interactive')).toHaveLength(7);
		for (const module of modules) {
			const visuals = teachingVisuals.filter((v) => v.module === module.id);
			expect(visuals.length, module.id).toBeGreaterThanOrEqual(3);
			expect(new Set(visuals.map((v) => v.section)).size, module.id).toBeGreaterThanOrEqual(3);
			expect(
				visuals.filter((v) => v.kind === 'art'),
				module.id
			).toHaveLength(1);
		}
		for (const visual of teachingVisuals) {
			const module = modules.find((m) => m.id === visual.module);
			const section = module?.sections.find((s) => s.id === visual.section);
			expect(section, visual.id).toBeDefined();
			expect(visual.afterBlock ?? 0, visual.id).toBeLessThan(section!.blocks.length);
			expect(visualsAt(visual.module, visual.section, visual.afterBlock ?? 0)).toContain(visual);
			expect(visual.alt.length, visual.id).toBeGreaterThan(30);
			expect(visual.takeaway.length, visual.id).toBeGreaterThan(20);
			expect(visual.answer.length, visual.id).toBeGreaterThan(20);
			if (visual.kind === 'diagram' && visual.layout === 'matrix') {
				expect(visual.cells, visual.id).toHaveLength(visual.rows!.length);
				for (const row of visual.cells!)
					expect(row, visual.id).toHaveLength(visual.columns!.length);
			}
		}
	});
	it('ships readable optimized images with correct dimensions and text companions', async () => {
		let total = 0;
		for (const visual of teachingVisuals) {
			if (visual.kind !== 'art') continue;
			const path = join(process.cwd(), 'static', visual.image.replace(/^\/+/, ''));
			const size = statSync(path).size;
			total += size;
			expect(size, visual.id).toBeLessThan(512_000);
			expect(readFileSync(path).toString('ascii', 8, 12), visual.id).toBe('WEBP');
			const metadata = await sharp(path).metadata();
			expect(metadata.width, visual.id).toBe(visual.width);
			expect(metadata.height, visual.id).toBe(visual.height);
			expect(metadata.width!, visual.id).toBeGreaterThanOrEqual(1400);
			expect(visual.transcript.length, visual.id).toBeGreaterThanOrEqual(3);
		}
		expect(total).toBeLessThan(6_000_000);
	});
});
