import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';

import { covers, Graph } from './graph';
import { changedFiles, git, resolveRange } from './range';
import { affectedCrates, buildRust, type Crate } from './rust';
import { buildWeb, touchesInstall } from './web';

process.chdir(git('rev-parse', '--show-toplevel')!);

const RUNS_EVERYTHING = ['.github/workflows/checks.yml', relative(process.cwd(), import.meta.dir)];

const files = git('ls-files')!.split('\n');
const graph = new Graph();
const crates = buildRust(graph, files);
const webTargets = buildWeb(graph, files);

function plan(changed: string[] | undefined): { crates: Crate[]; web: string[] } {
	if (!changed || changed.some((file) => RUNS_EVERYTHING.some((path) => covers(path, file)))) return { crates, web: webTargets };
	const affected = graph.affected(changed);
	return {
		crates: affectedCrates(crates, affected, changed),
		web: touchesInstall(changed) ? webTargets : webTargets.filter((dir) => affected.has(dir)),
	};
}

const runs = plan(changedFiles(resolveRange(process.argv.slice(2))));
const outputs = {
	rust: JSON.stringify(runs.crates.filter((crate) => crate.checksOnLinux).map((crate) => crate.dir)),
	uefi: String(runs.crates.some((crate) => crate.targetsUefi)),
	'meet-windows': String(runs.crates.some((crate) => crate.targetsWindows)),
	web: JSON.stringify(runs.web),
};

const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
