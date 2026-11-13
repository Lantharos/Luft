import CircleCheck from '@lucide/svelte/icons/circle-check';
import CircleX from '@lucide/svelte/icons/circle-x';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import type { Component } from 'svelte';
import type { CheckResult } from '../../store';

export const CHECK_ICONS: Record<CheckResult['status'], Component> = { passed: CircleCheck, warning: TriangleAlert, failed: CircleX };

const ORDER: Record<CheckResult['status'], number> = { failed: 0, warning: 1, passed: 2 };

export const byConcern = (checks: CheckResult[]) => [...checks].sort((left, right) => ORDER[left.status] - ORDER[right.status]);

/** A check's detail as label and value pairs, when it's flat enough to read that way. */
export function readable(detail: unknown): [string, string][] | null {
	if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return null;
	const pairs: [string, string][] = [];
	for (const [key, value] of Object.entries(detail)) {
		const flat = Array.isArray(value) ? value : [value];
		if (flat.some((item) => item !== null && typeof item === 'object')) return null;
		pairs.push([key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), flat.join(', ')]);
	}
	return pairs;
}
