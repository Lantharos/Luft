import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { posix } from 'node:path';
import type { Loader, LoaderContext } from 'astro/loaders';
import { urls } from '@luft/web';

export interface RepoDoc {
	file: string;
	slug: string;
	order: number;
}

const repoRoot = new URL('../../../../', import.meta.url);
const run = promisify(execFile);
const sourceBlob = `${urls.source}/blob/main/`;

function siteLink(target: string, docs: RepoDoc[], image: boolean) {
	const [path, anchor] = target.split('#');
	const resolved = posix.normalize(posix.join('docs', path));
	if (image) return `${urls.source}/raw/main/${resolved}`;
	const doc = docs.find(({ file }) => file === resolved);
	if (doc) return `/reference/${doc.slug}/${anchor ? `#${anchor}` : ''}`;
	return `${sourceBlob}${resolved}${anchor ? `#${anchor}` : ''}`;
}

function rewriteLinks(markdown: string, docs: RepoDoc[]) {
	return markdown.replace(/(!?)(\[[^\]]*\]\()([^)\s]+)\)/g, (match, bang: string, label: string, target: string) => {
		if (target.startsWith(urls.docs)) return `${bang}${label}${target.slice(urls.docs.length)})`;
		if (/^([a-z]+:|#|\/)/.test(target)) return match;
		return `${bang}${label}${siteLink(target, docs, bang === '!')})`;
	});
}

function splitTitle(markdown: string) {
	const heading = markdown.match(/^# (.+)\n+/);
	if (!heading) throw new Error('A repository document needs a "# Title" first line');
	return { title: heading[1].trim(), body: markdown.slice(heading[0].length) };
}

async function lastChanged(file: string) {
	const { stdout } = await run('git', ['log', '-1', '--format=%cI', '--', file], { cwd: repoRoot });
	return stdout.trim() ? new Date(stdout.trim()) : undefined;
}

async function loadDoc(context: LoaderContext, doc: RepoDoc, docs: RepoDoc[]) {
	const source = await readFile(new URL(doc.file, repoRoot), 'utf8');
	const { title, body } = splitTitle(source);
	const id = `reference/${doc.slug}`;
	const data = await context.parseData({
		id,
		data: {
			title,
			sidebar: { order: doc.order },
			editUrl: `${urls.source}/edit/main/${doc.file}`,
			lastUpdated: await lastChanged(doc.file)
		}
	});
	context.store.set({
		id,
		data,
		body,
		filePath: `src/content/docs/${id}.md`,
		digest: context.generateDigest(source),
		rendered: await context.renderMarkdown(rewriteLinks(body, docs), { fileURL: new URL(`web/docs/src/content/docs/${id}.md`, repoRoot) })
	});
}

export function repoDocsLoader(base: Loader, docs: RepoDoc[]): Loader {
	return {
		name: 'luft-repo-docs-loader',
		async load(context) {
			await base.load(context);
			await Promise.all(docs.map((doc) => loadDoc(context, doc, docs)));
			context.watcher?.add(docs.map(({ file }) => new URL(file, repoRoot).pathname));
			context.watcher?.on('change', async (path) => {
				const doc = docs.find(({ file }) => new URL(file, repoRoot).pathname === path);
				if (doc) await loadDoc(context, doc, docs);
			});
		}
	};
}
