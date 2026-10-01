import type { Fix, HostSecurity, Protection } from '../api';

const LEVELS = [
	'Your hardware has few of the protections it could have',
	'Your hardware has the basic protections',
	'Your hardware has the important protections',
	'Your hardware is well protected',
	'Your hardware guards itself while it runs',
	'Your hardware guards itself and can prove it'
];

const WORDS = ['Few protections', 'Basic', 'Good', 'Strong', 'Very strong', 'Highest'];

const FIXES: Record<Fix, [string, string]> = {
	maker: ['Only the maker of your computer can add this, usually with a firmware update', 'Only the maker of your computer can add these, usually with a firmware update'],
	firmware: ['This can be turned on in your computer’s firmware settings', 'These can be turned on in your computer’s firmware settings'],
	system: ['This depends on how the system is set up', 'These depend on how the system is set up'],
	unknown: ['This isn’t available on this computer', 'These aren’t available on this computer']
};

const COUNTS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];

export const levelSentence = ({ level }: HostSecurity) => LEVELS[Math.min(level, LEVELS.length - 1)];
export const levelWord = ({ level }: HostSecurity) => WORDS[Math.min(level, WORDS.length - 1)];

export function nextStep({ level, highest, missing }: HostSecurity) {
	if (level >= highest || !missing.length) return '';
	const count = COUNTS[missing.length] ?? String(missing.length);
	return `${count} more for the next level`;
}

export function byFix(protections: Protection[]) {
	const groups = new Map<Fix, Protection[]>();
	for (const protection of protections) groups.set(protection.fix, [...(groups.get(protection.fix) ?? []), protection]);
	return [...groups].map(([fix, items]) => ({ fix, sentence: FIXES[fix][items.length === 1 ? 0 : 1], items }));
}
