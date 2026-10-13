const joined = (names: string[]) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

export function changesAtRestart(installing: string[], removing: string[]) {
	const parts = [];
	if (installing.length) parts.push(`${joined(installing)} ${installing.length === 1 ? 'installs' : 'install'}`);
	if (removing.length) parts.push(`${joined(removing)} ${removing.length === 1 ? 'is' : 'are'} removed`);
	return parts.length ? `${parts.join(' and ')} when you restart` : null;
}
