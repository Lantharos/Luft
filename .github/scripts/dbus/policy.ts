import { readFileSync } from 'node:fs';

import type { Truth } from './compare';

const RULE = /<(?:allow|deny)\b([^>]*?)\/?>/g;
const ATTRIBUTE = /([\w_]+)="([^"]*)"/g;
const STANDARD = 'org.freedesktop.DBus.';

export function policyProblems(files: string[], truths: Map<string, Truth>): string[] {
	const problems: string[] = [];
	for (const file of files.filter((file) => file.endsWith('.conf'))) {
		const text = readFileSync(file, 'utf8');
		if (!text.includes('<busconfig')) continue;
		for (const match of text.matchAll(RULE)) {
			const rule = Object.fromEntries([...match[1].matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]));
			const name = rule.send_interface;
			if (!name || name.startsWith(STANDARD)) continue;
			const where = `${file}:${text.slice(0, match.index).split('\n').length}`;
			const truth = truths.get(name);
			if (!truth) {
				problems.push(`${where}: ${name} isn't an interface anything serves`);
				continue;
			}
			const member = rule.send_member && truth.definition.members.get(rule.send_member);
			if (rule.send_member && member?.kind !== 'method') problems.push(`${where}: ${name}.${rule.send_member} isn't a method in ${truth.source}`);
		}
	}
	return problems;
}
