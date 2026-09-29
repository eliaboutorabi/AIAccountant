import { getContext } from 'svelte';
import type { LearningProgress } from '$lib/progress.svelte';
export const PROGRESS = Symbol('learning-progress');
export const useProgress = () => getContext<LearningProgress>(PROGRESS);
