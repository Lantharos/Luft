import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { git } from '../affected/range';
import { exposures } from './exposure';
import { luftUnits } from './units';

process.chdir(git('rev-parse', '--show-toplevel')!);

const RECORD = join(import.meta.dir, 'exposure.json');
const UPDATE = `bun ${relative(process.cwd(), join(import.meta.dir, 'index.ts'))} --update`;

const indent = (text: string) => text.replace(/^/gm, '    ');

const measured = await exposures(luftUnits(git('ls-files')!.split('\n')));
const warnings = [...measured].filter(([, { warnings }]) => warnings).map(([path, { warnings }]) => `${path} has problems systemd reports:\n${indent(warnings)}`);

if (process.argv.includes('--update')) {
	const record = Object.fromEntries([...measured].sort(([a], [b]) => a.localeCompare(b)).map(([path, { exposure }]) => [path, exposure]));
	writeFileSync(RECORD, `${JSON.stringify(record, null, '\t')}\n`);
	warnings.forEach((warning) => console.error(warning));
	console.log(`Recorded the exposure of ${measured.size} units`);
	process.exit(0);
}

const recorded: Record<string, number> = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, 'utf8')) : {};
const problems = [...warnings];
const improved: string[] = [];

for (const [path, { exposure }] of measured) {
	const expected = recorded[path];
	if (expected === undefined) problems.push(`${path} has no recorded exposure yet (it scores ${exposure})`);
	else if (exposure > expected) problems.push(`${path} is less protected than before: ${expected} → ${exposure}`);
	else if (exposure < expected) improved.push(`${path} is better protected: ${expected} → ${exposure}`);
}
for (const path of Object.keys(recorded).filter((path) => !measured.has(path))) problems.push(`${path} is recorded but no longer exists`);

improved.forEach((line) => console.log(line));
if (improved.length > 0) console.log(`The recorded exposure can be lowered with ${UPDATE}\n`);
if (problems.length > 0) {
	problems.forEach((problem) => console.error(problem));
	console.error(`\nHarden the unit, or when the change is intended, record it with ${UPDATE}`);
	process.exit(1);
}
console.log(`${measured.size} units are as protected as recorded`);
