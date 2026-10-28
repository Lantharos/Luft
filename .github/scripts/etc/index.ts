import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { git } from '../affected/range';

process.chdir(git('rev-parse', '--show-toplevel')!);

const ALLOWED = relative(process.cwd(), join(import.meta.dir, 'allowed.json'));
const CODE = /\.(rs|ts|sh|in|service|socket|timer|mount|path|rules|conf)$|\/libexec\/[^/]+$/;
const ELSEWHERE = ['**/vm/**', '**/tests/**', '**/tools/**', '**/fixtures/**', '**/*.d.ts', 'os/image/**', 'os/iso/stages/**', '.github/**', 'web/**', 'docs/**'].map((pattern) => new Bun.Glob(pattern));
const ETC = /(?<![\w.:/-])\/etc(?:\/[\w.@+*%{}$-]+)*\/?/g;
const COMMENT = /^\s*(?:\/\/|#(?!!)|\*)/;
const RUST_TESTS = '#[cfg(test)]';

function mentions(path: string): Set<string> {
	let text = readFileSync(path, 'utf8');
	if (path.endsWith('.rs') && text.includes(RUST_TESTS)) text = text.slice(0, text.indexOf(RUST_TESTS));
	const found = new Set<string>();
	for (const line of text.split('\n').filter((line) => !COMMENT.test(line))) {
		for (const [etc] of line.matchAll(ETC)) found.add(etc);
	}
	return found;
}

const allowed: Record<string, Record<string, string>> = JSON.parse(readFileSync(ALLOWED, 'utf8'));
const problems: string[] = [];
const seen = new Set<string>();

for (const path of git('ls-files')!.split('\n')) {
	if (!CODE.test(path) || ELSEWHERE.some((glob) => glob.match(path))) continue;
	for (const etc of mentions(path)) {
		seen.add(`${path} ${etc}`);
		if (!allowed[path]?.[etc]) problems.push(`${path} uses ${etc}`);
	}
}
for (const [path, paths] of Object.entries(allowed)) {
	for (const etc of Object.keys(paths).filter((etc) => !seen.has(`${path} ${etc}`))) problems.push(`${path} no longer uses ${etc}, which is still allowed in ${ALLOWED}`);
}

if (problems.length > 0) {
	problems.forEach((problem) => console.error(problem));
	console.error(`
Luft keeps what its services write in /var/lib/<service>, since every version of the system has its own /etc
and going back to an earlier one would lose it. Stock tools get their view from /run or a generator. When the
code only reads the path, or it is configuration an administrator chooses, add it to ${ALLOWED} with the reason.
See docs/state.md.`);
	process.exit(1);
}
console.log(`${seen.size} uses of /etc are all reads or configuration an administrator chooses`);
