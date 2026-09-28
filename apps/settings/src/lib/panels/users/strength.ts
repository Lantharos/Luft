export interface Strength {
	level: 0 | 1 | 2 | 3;
	label: string;
}

export const MINIMUM_LENGTH = 8;

const COMMON = ['password', 'passw0rd', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon', 'abc123', '123456', '111111'];
const SEQUENCES = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function pool(password: string) {
	let size = 0;
	if (/[a-z]/.test(password)) size += 26;
	if (/[A-Z]/.test(password)) size += 26;
	if (/\d/.test(password)) size += 10;
	if (/[^a-zA-Z\d]/.test(password)) size += 33;
	return size;
}

function predictable(password: string, names: string[]) {
	const lower = password.toLowerCase();
	const run = lower.split('').filter((character, index) => character === lower[index - 1]).length;
	const sequence = SEQUENCES.some((letters) => {
		for (let start = 0; start + 4 <= letters.length; start += 1) if (lower.includes(letters.slice(start, start + 4))) return true;
		return false;
	});
	const personal = names.some((name) => name.length >= 3 && lower.includes(name.toLowerCase()));
	return COMMON.some((word) => lower.includes(word)) || personal || sequence || run > password.length / 3;
}

export function measure(password: string, names: string[]): Strength {
	if (password.length < MINIMUM_LENGTH) return { level: 0, label: `Use at least ${MINIMUM_LENGTH} characters` };
	const bits = password.length * Math.log2(pool(password)) - (predictable(password, names) ? 24 : 0);
	if (bits < 40) return { level: 1, label: 'Weak. Longer passwords with a mix of words are harder to guess.' };
	if (bits < 60) return { level: 2, label: 'Fair. Adding a few more characters makes it stronger.' };
	return { level: 3, label: 'Strong' };
}
