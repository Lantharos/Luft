import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';

import { covers, Graph } from './graph';
import { changedFiles, git, resolveRange } from './range';
import { buildRust, type Crate, packageArguments, workspaceChanges } from './rust';
import { buildWeb, touchesInstall } from './web';

process.chdir(git('rev-parse', '--show-toplevel')!);

const RUNS_EVERYTHING = ['.github/workflows/checks.yml', 'os/image/parts/stages/workspace.ts', relative(process.cwd(), import.meta.dir)];

const files = git('ls-files')!.split('\n');
const graph = new Graph();
const crates = buildRust(graph, files);
const webTargets = buildWeb(graph, files);

function plan(changes: { base: string; files: string[] } | undefined): { crates: Crate[]; web: string[] } {
	if (!changes || changes.files.some((file) => RUNS_EVERYTHING.some((path) => covers(path, file)))) return { crates, web: webTargets };
	const affected = graph.affected([...changes.files, ...workspaceChanges(crates, changes.files, changes.base)]);
	return {
		crates: crates.filter((crate) => affected.has(crate.dir)),
		web: touchesInstall(changes.files) ? webTargets : webTargets.filter((dir) => affected.has(dir)),
	};
}

const runs = plan(changedFiles(resolveRange(process.argv.slice(2))));
const linux = runs.crates.filter((crate) => !crate.targetsUefi);
const testGroups = [
	{ group: 'apps', packages: packageArguments(linux.filter((crate) => crate.buildsOnSabine)) },
	{ group: 'system', packages: packageArguments(linux.filter((crate) => !crate.buildsOnSabine)) },
].filter((tests) => tests.packages);
const outputs = {
	rust: packageArguments(linux),
	'rust-tests': JSON.stringify(testGroups),
	uefi: packageArguments(runs.crates.filter((crate) => crate.targetsUefi)),
	'meet-windows': String(runs.crates.some((crate) => crate.targetsWindows)),
	web: JSON.stringify(runs.web),
};

const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
