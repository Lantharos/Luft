import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { $ } from 'bun';

const FOLDERS = ['apps', 'extensions'];
const LINUX = 'linux-x86_64 linux-aarch64';
const PLATFORMS: Record<string, string> = { 'com.lantharos.meet': 'windows-x86_64 linux-x86_64' };
const SHARED: Record<Kind, string[]> = {
	app: ['packages/app', 'packages/web', 'packages/i18n'],
	extension: ['extensions/shared', 'extensions/build.ts', 'extensions/pack.sh', 'packages/extension-api'],
};

type Kind = 'app' | 'extension';
type SchelfToml = { id: string; kind: Kind };
type Versioned = { version?: string; app?: { version?: string } };
type Project = { name: string; folder: string; kind: Kind; id: string; manifest: string };

const toml = <T>(text: string) => Bun.TOML.parse(text) as T;

function projects(): Project[] {
	return FOLDERS.flatMap((parent) =>
		readdirSync(parent)
			.map((name) => ({ name, folder: join(parent, name) }))
			.filter(({ folder }) => existsSync(join(folder, 'schelf.toml')))
			.map(({ name, folder }) => {
				const store = toml<SchelfToml>(readFileSync(join(folder, 'schelf.toml'), 'utf8'));
				const manifest = join(folder, store.kind === 'app' ? 'Sabine.toml' : 'extension.toml');
				return { name, folder, kind: store.kind, id: store.id, manifest };
			}),
	);
}

function versionOf(text: string | undefined) {
	if (!text) return undefined;
	const manifest = toml<Versioned>(text);
	return manifest.app?.version ?? manifest.version;
}

const fileAt = async (commit: string, path: string) =>
	(await $`git show ${commit}:${path}`.quiet().nothrow()).stdout.toString() || undefined;

async function versionChanged(before: string) {
	if ((await $`git cat-file -e ${before}^{commit}`.quiet().nothrow()).exitCode !== 0) throw new Error(`${before}, the commit before this push, isn't in the history`);
	const changed: string[] = [];
	for (const project of projects()) {
		const now = versionOf(readFileSync(project.manifest, 'utf8'));
		if (now !== versionOf(await fileAt(before, project.manifest))) changed.push(project.name);
	}
	return changed;
}

async function lastNightlies() {
	const runs = (await $`gh run list --workflow store.yml --event workflow_dispatch --status success --limit 300 --json displayTitle,headSha`.json()) as { displayTitle: string; headSha: string }[];
	const last = new Map<string, string>();
	for (const run of runs) {
		const name = /^Publish (\S+) to nightly$/.exec(run.displayTitle)?.[1];
		if (name && !last.has(name)) last.set(name, run.headSha);
	}
	return last;
}

async function changedSinceNightly() {
	const last = await lastNightlies();
	const changed: string[] = [];
	for (const project of projects()) {
		const since = last.get(project.name);
		if (!since) {
			changed.push(project.name);
			continue;
		}
		const diff = await $`git diff --quiet ${since} HEAD -- ${[project.folder, ...SHARED[project.kind]]}`.quiet().nothrow();
		if (diff.exitCode !== 0) changed.push(project.name);
	}
	return changed;
}

function nightlyVersion(version: string, commit: string, at: Date) {
	const [major, minor] = version.split('.').map(Number);
	const stamp = at.toISOString().slice(0, 16).replace(/\D/g, '');
	return `${major}.${minor! + 1}.0-nightly.${stamp}.g${commit.slice(0, 7)}`;
}

async function build(name: string, channel: string) {
	const project = projects().find((candidate) => candidate.name === name);
	if (!project) throw new Error(`No app or extension called ${name} has a schelf.toml`);
	const version = versionOf(readFileSync(project.manifest, 'utf8'));
	if (!version) throw new Error(`${project.manifest} has no version`);
	const sabine = /^sabine = \{ git = "https:\/\/github\.com\/Lantharos\/Sabine", tag = "([^"]+)" \}$/m.exec(readFileSync('Cargo.toml', 'utf8'))?.[1];
	if (!sabine) throw new Error("Cargo.toml doesn't pin Sabine to a release");
	const commit = (await $`git rev-parse HEAD`.text()).trim();
	return {
		kind: project.kind,
		folder: project.folder,
		sabine,
		platforms: PLATFORMS[project.id] ?? LINUX,
		version: channel === 'nightly' ? nightlyVersion(version, commit, new Date()) : version,
	};
}

const [mode, ...args] = process.argv.slice(2);
const outputs =
	mode === 'build'
		? await build(args[0]!, args[1]!)
		: { apps: JSON.stringify(mode === 'nightly' ? await changedSinceNightly() : await versionChanged(args[0]!)) };
console.log(
	Object.entries(outputs)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n'),
);
