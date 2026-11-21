import { t } from '@luft/i18n';

const RISKS: [RegExp, string][] = [
	[/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, 'terminal-paste-control'],
	[/\b(sudo|doas|pkexec|su)\s/, 'terminal-paste-administrator'],
	[/\brm\s+-[a-zA-Z]*[rf]|\bmkfs\b|\bdd\s+[^|]*\bof=|>\s*\/dev\/(sd|nvme|hd|vd)/, 'terminal-paste-destructive'],
	[/\b(curl|wget)\b[^|\n]*\|\s*(sudo\s+)?(ba|z|fi|da)?sh\b/, 'terminal-paste-script']
];

export function pasteRisks(text: string, bracketed: boolean) {
	const risks = RISKS.filter(([pattern]) => pattern.test(text)).map(([, reason]) => t(reason));
	const lines = text.replace(/\r?\n$/, '').split(/\r?\n|\r/).length;
	if (lines > 1 && !bracketed) risks.unshift(t('terminal-paste-lines', { count: lines }));
	return risks;
}

const PLAIN_WORD = /^[\w@%+=:,./-]+$/;

export const shellWords = (words: string[]) =>
	words.map((word) => (PLAIN_WORD.test(word) ? word : `'${word.replaceAll("'", `'\\''`)}'`)).join(' ');
