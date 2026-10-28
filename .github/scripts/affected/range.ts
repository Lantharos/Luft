import { readFileSync } from 'node:fs';

type Event = {
	before?: string;
	after?: string;
	repository: { default_branch: string };
	pull_request?: { base: { sha: string }; head: { sha: string } };
};

export type Range = { base: string; head: string };

const NO_COMMIT = /^0+$/;

export function git(...args: string[]): string | undefined {
	const result = Bun.spawnSync(['git', ...args], { stderr: 'ignore' });
	return result.success ? result.stdout.toString().trim() : undefined;
}

const hasCommit = (sha: string) => git('cat-file', '-e', `${sha}^{commit}`) !== undefined || git('fetch', '--quiet', '--no-tags', 'origin', sha) !== undefined;

function eventRange(event: Event): Range {
	if (event.pull_request) return { base: event.pull_request.base.sha, head: event.pull_request.head.sha };
	const head = event.after ?? process.env.GITHUB_SHA!;
	const before = event.before;
	if (before && !NO_COMMIT.test(before) && hasCommit(before)) return { base: before, head };
	return { base: `origin/${event.repository.default_branch}`, head };
}

export function resolveRange(args: string[]): Range {
	if (args.length > 0) return { base: args[0], head: args[1] ?? 'HEAD' };
	return eventRange(JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8')));
}

export function changedFiles({ base, head }: Range): { base: string; files: string[] } | undefined {
	const mergeBase = git('merge-base', base, head);
	if (!mergeBase || mergeBase === git('rev-parse', head)) return undefined;
	return { base: mergeBase, files: git('diff', '--name-only', '--no-renames', mergeBase, head)!.split('\n').filter(Boolean) };
}
