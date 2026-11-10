import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const STARLIGHT = dirname(dirname(createRequire(import.meta.url).resolve('@astrojs/starlight/components/ThemeProvider.astro')));
const INLINE_SCRIPT = /<script is:inline[^>]*>([\s\S]*?)<\/script>/g;

const componentsIn = (folder: string) =>
	readdirSync(join(STARLIGHT, folder))
		.filter((name) => name.endsWith('.astro'))
		.map((name) => readFileSync(join(STARLIGHT, folder, name), 'utf8'));

export const starlightScriptHashes = ['components', 'user-components']
	.flatMap(componentsIn)
	.flatMap((source) => [...source.matchAll(INLINE_SCRIPT)])
	.map(([, script]) => `sha256-${createHash('sha256').update(script).digest('base64')}` as const);
