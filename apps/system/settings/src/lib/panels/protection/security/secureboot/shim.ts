import { t } from '@luft/i18n';

const SCREEN = {
	press: 'Press any key to perform MOK management',
	next: 'Continue',
	yes: 'Yes',
	no: 'No',
	password: 'Password:',
	reboot: 'Reboot',
	wrong: "Password doesn't match",
	ok: 'OK'
};

const ADDING = { option: 'Enroll MOK', question: 'Enroll the key(s)?' };
const REMOVING = { option: 'Delete MOK', question: 'Delete the key(s)?' };

export interface Piece {
	part: string;
	bold: boolean;
}

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function emphasize(text: string, names: string[]): Piece[] {
	return text
		.split(new RegExp(`(?<![\\p{L}\\p{N}])(${names.map(escaped).join('|')})(?![\\p{L}\\p{N}])`, 'u'))
		.filter(Boolean)
		.map((part) => ({ part, bold: names.includes(part) }));
}

export function shimSteps(removing: boolean): Piece[][] {
	const { option, question } = removing ? REMOVING : ADDING;
	const enter = t('settings-security-key-enter');
	const names = [...Object.values(SCREEN), option, question, enter];
	return [
		t('settings-secure-boot-step-press', { screen: SCREEN.press }),
		t('settings-secure-boot-step-choose', { option }),
		t('settings-secure-boot-step-choose', { option: SCREEN.next }),
		t('settings-secure-boot-step-confirm', { question, yes: SCREEN.yes, no: SCREEN.no }),
		t('settings-secure-boot-step-password', { prompt: SCREEN.password, key: enter }),
		t('settings-secure-boot-step-choose', { option: SCREEN.reboot })
	].map((step) => emphasize(step, names));
}

export function wrongCodeNote(): Piece[] {
	return emphasize(t('settings-secure-boot-wrong-code', { error: SCREEN.wrong, ok: SCREEN.ok }), [SCREEN.wrong, SCREEN.ok]);
}
