import { appendFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { isUnitPath } from '../units/units';
import { covers, Graph } from './graph';
import { changedFiles, git, resolveRange } from './range';
import { buildRust, type Crate, packageArguments, workspaceChanges } from './rust';
import { touchesTranslations } from './translations';
import { buildWeb, touchesInstall } from './web';

process.chdir(git('rev-parse', '--show-toplevel')!);

const RUNS_EVERYTHING = ['.github/workflows/checks.yml', 'os/image/parts/stages/workspace.ts', relative(process.cwd(), import.meta.dir)];
const UNIT_CHECK = relative(process.cwd(), join(import.meta.dir, '../units'));
const COMPOSITOR = ['kestrel/compositor', 'packages/identity/sandbox-cases.ini'];

const files = git('ls-files')!.split('\n');
const graph = new Graph();
const crates = buildRust(graph, files);
const webTargets = buildWeb(graph, files);

function plan(changes: { base: string; files: string[] } | undefined): { crates: Crate[]; web: string[]; units: boolean; weblate: boolean; compositor: boolean } {
	if (!changes || changes.files.some((file) => RUNS_EVERYTHING.some((path) => covers(path, file)))) return { crates, web: webTargets, units: true, weblate: true, compositor: true };
	const affected = graph.affected([...changes.files, ...workspaceChanges(crates, changes.files, changes.base)]);
	return {
		crates: crates.filter((crate) => affected.has(crate.dir)),
		web: touchesInstall(changes.files) ? webTargets : webTargets.filter((dir) => affected.has(dir)),
		units: changes.files.some((file) => isUnitPath(file) || covers(UNIT_CHECK, file)),
		weblate: touchesTranslations(changes.files),
		compositor: changes.files.some((file) => COMPOSITOR.some((path) => covers(path, file))),
	};
}

const runs = plan(changedFiles(resolveRange(process.argv.slice(2))));
const linux = runs.crates.filter((crate) => !crate.targetsUefi);
const groups = [
	{ name: 'apps', packages: packageArguments(linux.filter((crate) => crate.buildsOnSabine)) },
	{ name: 'system', packages: packageArguments(linux.filter((crate) => !crate.buildsOnSabine)) },
].filter((group) => group.packages);
const outputs = {
	rust: JSON.stringify(groups),
	uefi: packageArguments(runs.crates.filter((crate) => crate.targetsUefi)),
	'meet-windows': String(runs.crates.some((crate) => crate.targetsWindows)),
	web: JSON.stringify(runs.web),
	units: String(runs.units),
	weblate: String(runs.weblate),
	compositor: String(runs.compositor),
};

const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
