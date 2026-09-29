import { day1Visuals } from './day1';
import { day2Visuals } from './day2';
import { day3Visuals } from './day3';
import { day4Visuals } from './day4';
import { day5Visuals } from './day5';
import { interactiveVisuals } from './interactive';
export type { TeachingVisual } from './types';

export const teachingVisuals = [
	...day1Visuals,
	...day2Visuals,
	...day3Visuals,
	...day4Visuals,
	...day5Visuals,
	...interactiveVisuals
];

export const moduleVisuals = (moduleId: string) =>
	teachingVisuals.filter((v) => v.module === moduleId);
export const visualsAt = (moduleId: string, sectionId: string, blockIndex: number) =>
	teachingVisuals.filter(
		(v) => v.module === moduleId && v.section === sectionId && (v.afterBlock ?? 0) === blockIndex
	);
