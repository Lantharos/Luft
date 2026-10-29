import { git } from '../affected/range';
import { compare, type Truth } from './compare';
import { policyProblems } from './policy';
import { fetchReferences, references, UNPUBLISHED } from './references';
import { introspectionProblems } from './rust';
import { type Occurrence, occurrences } from './sources';

process.chdir(git('rev-parse', '--show-toplevel')!);

const REFERENCES = process.env.DBUS_REFERENCES ?? 'target/dbus-references';

const files = git('ls-files', '--cached', '--others', '--exclude-standard')!.split('\n').filter(Boolean);
await fetchReferences(REFERENCES);

const { problems, written } = introspectionProblems(files);
const found = occurrences(files);
const located = (occurrence: Occurrence) => (line: number) => written.get(occurrence.file) ?? `${occurrence.file}:${line}`;

const truths = new Map<string, Truth>();
const chosen = new Set<Occurrence>();
for (const { source, definition } of references(REFERENCES)) if (!truths.has(definition.name)) truths.set(definition.name, { source, definition, zbus: false });
const serving = [found.filter(({ role }) => role === 'exported'), found.filter(({ role, tooling, exporting }) => role === 'copy' && !tooling && exporting)];
for (const occurrence of serving.flat()) {
	if (truths.has(occurrence.definition.name)) continue;
	truths.set(occurrence.definition.name, { source: located(occurrence)(occurrence.definition.line), definition: occurrence.definition, zbus: occurrence.role === 'exported' });
	chosen.add(occurrence);
}

const unchecked = new Set<string>();
let compared = 0;
for (const occurrence of found.filter((occurrence) => !chosen.has(occurrence))) {
	const name = occurrence.definition.name;
	const truth = truths.get(name);
	if (!truth) {
		if (!Object.keys(UNPUBLISHED).some((prefix) => name === prefix || name.startsWith(`${prefix}.`))) unchecked.add(`${located(occurrence)(occurrence.definition.line)}: ${name}`);
		continue;
	}
	compared++;
	problems.push(...compare({ where: located(occurrence), definition: occurrence.definition, complete: occurrence.role === 'document', zbus: occurrence.role === 'exported' || occurrence.role === 'proxy' ? occurrence.role : undefined }, truth));
}
for (const occurrence of unchecked) problems.push(`${occurrence} has nothing to check against: no package ships its XML and nothing in Luft serves it`);
problems.push(...policyProblems(files, truths));

if (problems.length > 0) {
	problems.forEach((problem) => console.error(problem));
	console.error(`
Every D-Bus interface has one source of truth: the XML its Fedora package ships, the introspection of the
Rust service kept in packages/dbus/introspection, or the XML Kestrel serves. Interface files, clients,
policies and the stand-ins in kestrel/tools/fixtures must match it. See docs/testing.md.`);
	process.exit(1);
}
console.log(`${compared} interface definitions match ${truths.size} sources of truth`);
