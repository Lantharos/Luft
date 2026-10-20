import { t } from '@luft/i18n';
import type { Fix, HostSecurity, Protection } from '../api';

const LEVELS = [
	'settings-security-hardware-level-0',
	'settings-security-hardware-level-1',
	'settings-security-hardware-level-2',
	'settings-security-hardware-level-3',
	'settings-security-hardware-level-4',
	'settings-security-hardware-level-5'
];

const FIXES: Record<Fix, string> = {
	maker: 'settings-security-hardware-fix-maker',
	firmware: 'settings-security-hardware-fix-firmware',
	system: 'settings-security-hardware-fix-system',
	unknown: 'settings-security-hardware-fix-unknown'
};

export const levelSentence = ({ level }: HostSecurity) => t(LEVELS[Math.min(level, LEVELS.length - 1)]);

export function byFix(protections: Protection[]) {
	const groups = new Map<Fix, Protection[]>();
	for (const protection of protections) groups.set(protection.fix, [...(groups.get(protection.fix) ?? []), protection]);
	return [...groups].map(([fix, items]) => ({ fix, sentence: t(FIXES[fix], { count: items.length }), items }));
}
