import { bytes } from '@luft/ui';
import type { OtherSystem, SystemPart, SystemStep } from './bridge/index';

const MEET_PARTS: Record<string, string> = {
	Luft: 'Try Luft, from Meet Luft',
	'Moving box': 'Moving box, from Meet Luft',
	'LUFT-START': 'Meet Luft’s startup'
};

export function shortName(system: OtherSystem) {
	return system.kind === 'windows' ? 'Windows' : system.name;
}

export function partName(system: OtherSystem, part: SystemPart) {
	if (part.role === 'reserved') return 'Reserved for Windows';
	if (part.role === 'recovery') return 'Windows recovery';
	if (part.role === 'meet') return MEET_PARTS[part.label] ?? part.label;
	if (system.kind === 'windows') return part.label && part.label !== 'Windows' ? `Windows, “${part.label}”` : 'Windows';
	return part.label ? `${system.name}, “${part.label}”` : system.name;
}

function deleting(system: OtherSystem, part: SystemPart) {
	if (part.role === 'reserved') return 'Deleting Windows’ reserved partition';
	if (part.role === 'recovery') return 'Deleting Windows’ recovery partition';
	return `Deleting ${partName(system, part)}`;
}

export function startupName(system: OtherSystem) {
	const entries = system.startups.flatMap((startup) => startup.entries);
	const named = entries[0] ?? (system.kind === 'windows' ? 'Windows Boot Manager' : system.name);
	return `${named} and its startup files`;
}

export function summary(system: OtherSystem) {
	if (system.kind === 'old-system') return `Kept when Luft replaced it · ${bytes(system.size)}`;
	if (system.size === 0) return 'Only its startup files are left';
	if (system.bitlocker) return `Encrypted with BitLocker · ${bytes(system.size)}`;
	if (!system.parts.some((part) => part.role === 'system')) return `Only its reserved and recovery partitions are left · ${bytes(system.size)}`;
	const count = system.parts.length;
	return count > 1 ? `${bytes(system.size)} on ${count} partitions` : bytes(system.size);
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
	if (system.startups.length || system.parts.length) steps.push({ key: 'startup', label: 'Taking it out of the startup list' });
	for (const part of orderedParts(system)) steps.push({ key: part.block, label: deleting(system, part) });
	if (system.kind === 'old-system') steps.push({ key: 'old-system', label: `Deleting ${system.name}’s files` });
	return steps;
}

export const GROW_STEP: PlannedStep = { key: 'grow', label: 'Giving Luft the space' };

export function stepKey(step: SystemStep) {
	return step.kind === 'partition' ? step.block : step.kind;
}
