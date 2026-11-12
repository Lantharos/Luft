import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { YAML } from 'bun';
import GithubSlugger from 'github-slugger';
import { asksSchema, resolveAsks, userSections, type ResolvedAsk } from './schema';

const DOCS = join(import.meta.dir, '../content/docs');
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const HEADING = /^#{2,6}\s+(.+?)\s*$/;
const FENCE = /^\s*(```|~~~)/;

interface Page {
	path: string;
	asks: ResolvedAsk[] | undefined;
	anchors: Set<string>;
}

function anchorsOf(body: string) {
	const slugger = new GithubSlugger();
	const anchors = new Set<string>();
	let fenced = false;
	for (const line of body.split('\n')) {
		if (FENCE.test(line)) fenced = !fenced;
		const heading = !fenced && HEADING.exec(line);
		if (heading) anchors.add(slugger.slug(heading[1]));
	}
	return anchors;
}

function readPage(path: string, problems: string[]): Page {
	const source = readFileSync(path, 'utf8');
	const [frontmatter, yaml] = FRONTMATTER.exec(source) ?? ['', ''];
	const raw = (YAML.parse(yaml) as { asks?: unknown }).asks;
	const name = relative(DOCS, path);
	const parsed = raw === undefined ? undefined : asksSchema.safeParse(raw);
	if (parsed && !parsed.success) problems.push(`${name}: ${parsed.error.issues.map(({ message }) => message).join('; ')}`);
	return { path: name, asks: parsed?.success ? resolveAsks(parsed.data) : undefined, anchors: anchorsOf(source.slice(frontmatter.length)) };
}

const problems: string[] = [];
const pages = userSections.flatMap((section) =>
	readdirSync(join(DOCS, section), { recursive: true, encoding: 'utf8' })
		.filter((file) => /\.mdx?$/.test(file))
		.map((file) => readPage(join(DOCS, section, file), problems))
);

const claims = new Map<string, { page: string; shared: boolean }[]>();
for (const page of pages) {
	if (!page.asks) {
		problems.push(`${page.path}: add the ways people ask for what this page answers under \`asks\``);
		continue;
	}
	for (const { ask, to, shared } of page.asks) {
		if (to && !page.anchors.has(to)) problems.push(`${page.path}: "${ask}" points at #${to}, which isn't a heading on the page`);
		claims.set(ask, [...(claims.get(ask) ?? []), { page: page.path, shared }]);
	}
}

for (const [ask, claimants] of claims) {
	const pagesClaiming = new Set(claimants.map(({ page }) => page));
	if (pagesClaiming.size < claimants.length) problems.push(`"${ask}" is listed twice on ${claimants[0].page}`);
	if (pagesClaiming.size > 1 && claimants.some(({ shared }) => !shared)) {
		problems.push(`"${ask}" is claimed by ${[...pagesClaiming].join(' and ')}: give it to one page, or mark it \`shared: true\` on each`);
	}
	if (pagesClaiming.size === 1 && claimants.some(({ shared }) => shared)) problems.push(`"${ask}" is marked shared, but only ${claimants[0].page} has it`);
}

if (problems.length > 0) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`${claims.size} asks across ${pages.length} pages`);
