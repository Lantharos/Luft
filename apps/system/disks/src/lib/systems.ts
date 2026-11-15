import { t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { OtherSystem, SystemPart, SystemStep } from './bindings';

const MEET_PARTS: Record<string, string> = {
	Luft: 'disks-system-part-meet-try',
	'Moving box': 'disks-system-part-meet-box',
	'LUFT-START': 'disks-system-part-meet-startup'
};

export function shortName(system: OtherSystem) {
	return system.kind === 'windows' ? 'Windows' : system.name;
}

export function partName(system: OtherSystem, part: SystemPart) {
	if (part.role === 'reserved') return t('disks-system-part-reserved');
	if (part.role === 'recovery') return t('disks-system-part-recovery');
	if (part.role === 'meet') return part.label in MEET_PARTS ? t(MEET_PARTS[part.label]) : part.label;
	if (system.kind === 'windows') return part.label && part.label !== 'Windows' ? t('disks-system-part-labelled', { system: 'Windows', label: part.label }) : 'Windows';
	if (system.kind === 'earlier-luft') return part.filesystem === 'vfat' ? t('disks-system-part-earlier-startup') : t('disks-system-part-earlier-luft');
	return part.label ? t('disks-system-part-labelled', { system: system.name, label: part.label }) : system.name;
}

function deleting(system: OtherSystem, part: SystemPart) {
	if (part.role === 'reserved') return t('disks-system-step-delete-reserved');
	if (part.role === 'recovery') return t('disks-system-step-delete-recovery');
	return t('disks-system-step-delete', { name: partName(system, part) });
}

export function startupName(system: OtherSystem) {
	const entries = system.startups.flatMap((startup) => startup.entries);
	const named = entries[0] ?? (system.kind === 'windows' ? 'Windows Boot Manager' : system.name);
	return t('disks-system-startup-files', { name: named });
}

export function summary(system: OtherSystem) {
	const size = bytes(system.size);
	if (system.kind === 'old-system') return t('disks-system-summary-old', { size });
	if (system.kind === 'earlier-luft') return t('disks-system-summary-earlier-luft', { size });
	if (system.size === 0) return t('disks-system-summary-startup-only');
	if (system.bitlocker) return t('disks-system-summary-bitlocker', { size });
	if (!system.parts.some((part) => part.role === 'system')) return t('disks-system-summary-leftovers', { size });
	const count = system.parts.length;
	return count > 1 ? t('disks-system-summary-partitions', { size, count }) : size;
}

export function orderedParts(system: OtherSystem) {
	return [...system.parts].sort((a, b) => Number(a.role === 'system') - Number(b.role === 'system'));
}

export interface PlannedStep {
	key: string;
	label: string;
}

export function plannedSteps(system: OtherSystem): PlannedStep[] {
	const steps: PlannedStep[] = [];
	if (system.startups.length || system.parts.length) steps.push({ key: 'startup', label: t('disks-system-step-startup') });
	for (const part of orderedParts(system)) steps.push({ key: part.block, label: deleting(system, part) });
	if (system.kind === 'old-system') steps.push({ key: 'old-system', label: t('disks-system-step-delete-files', { name: system.name }) });
	return steps;
}

export const growStep = (): PlannedStep => ({ key: 'grow', label: t('disks-system-step-grow') });

export function stepKey(step: SystemStep) {
	return step.kind === 'partition' ? step.block : step.kind;
}
