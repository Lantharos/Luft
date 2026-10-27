import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Component {
	name: string;
	mask: string;
}

interface WeblateComponent {
	slug: string;
	filemask: string;
	template: string;
	new_base: string;
	is_glossary: boolean;
}

interface Page {
	next: string | null;
	results: WeblateComponent[];
}

const ROOT = join(import.meta.dir, '../../..');
const API = 'https://hosted.weblate.org/api/projects/luft/components/';
const FIX = 'update it in Weblate › Settings › Files';

const components: Component[] = JSON.parse(readFileSync(join(import.meta.dir, '../components.json'), 'utf8'));
const problems: string[] = [];

async function weblateComponents(): Promise<WeblateComponent[]> {
	const found: WeblateComponent[] = [];
	for (let url: string | null = API; url; ) {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${url} answered ${response.status}`);
		const page = (await response.json()) as Page;
		found.push(...page.results);
		url = page.next;
	}
	return found.filter((component) => !component.is_glossary);
}

const matchesFiles = (mask: string) => !new Bun.Glob(mask).scanSync({ cwd: ROOT }).next().done;

function comparePath(name: string, label: string, actual: string, expected: string) {
	if (actual !== expected) problems.push(`${name}: Weblate's ${label} is ${actual || 'empty'}, expected ${expected}; ${FIX}`);
}

let weblate: WeblateComponent[];
try {
	weblate = await weblateComponents();
} catch (error) {
	console.warn(`${process.env.GITHUB_ACTIONS ? '::warning::' : ''}Couldn't compare Weblate's components with the repository: ${(error as Error).message}`);
	process.exit(0);
}

const bySlug = new Map(weblate.map((component) => [component.slug, component]));
for (const { name, mask } of components) {
	const base = mask.replace('*', 'en');
	if (!matchesFiles(mask)) problems.push(`${name}: components.json's file mask ${mask} matches no files; fix components.json, then ${FIX}`);
	else if (!existsSync(join(ROOT, base))) problems.push(`${name}: the base file ${base} doesn't exist; fix components.json, then ${FIX}`);
	const remote = bySlug.get(name);
	if (!remote) {
		problems.push(`${name}: Weblate has no such component, expected file mask ${mask}; add it, or if it was renamed, ${FIX}`);
		continue;
	}
	comparePath(name, 'file mask', remote.filemask, mask);
	comparePath(name, 'monolingual base language file', remote.template, base);
	if (remote.new_base) comparePath(name, 'template for new translations', remote.new_base, base);
	if (remote.filemask !== mask && !matchesFiles(remote.filemask)) problems.push(`${name}: Weblate's file mask ${remote.filemask} matches no files, expected ${mask}; ${FIX}`);
}

const listed = new Set(components.map((component) => component.name));
for (const remote of weblate) {
	if (!listed.has(remote.slug)) problems.push(`${remote.slug}: Weblate has this component with file mask ${remote.filemask}, but components.json doesn't list it; add it there, remove it from Weblate, or if its files moved, ${FIX}`);
}

if (problems.length) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} differences between Weblate and the repository`);
	process.exit(1);
}
