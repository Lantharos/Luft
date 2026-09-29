const RISKS: [RegExp, string][] = [
	[/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, 'It contains hidden control characters.'],
	[/\b(sudo|doas|pkexec|su)\s/, 'It asks for administrator rights.'],
	[/\brm\s+-[a-zA-Z]*[rf]|\bmkfs\b|\bdd\s+[^|]*\bof=|>\s*\/dev\/(sd|nvme|hd|vd)/, 'It can delete or overwrite files.'],
	[/\b(curl|wget)\b[^|\n]*\|\s*(sudo\s+)?(ba|z|fi|da)?sh\b/, 'It runs a script downloaded from the internet.']
];

export function pasteRisks(text: string, bracketed: boolean) {
	const risks = RISKS.filter(([pattern]) => pattern.test(text)).map(([, reason]) => reason);
	const lines = text.replace(/\r?\n$/, '').split(/\r?\n|\r/).length;
	if (lines > 1 && !bracketed) risks.unshift(`It has ${lines} lines, and each one runs as soon as it is pasted.`);
	return risks;
}
