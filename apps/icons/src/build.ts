import { existsSync } from 'node:fs';
import { join } from 'node:path';

import palette from '../palette.json';
import { parseDrawing } from './drawing.js';
import { glyph } from './glyph.js';
import { appIcon } from './icon.js';

const ICONS = join(import.meta.dir, '..');
const ROOT = join(ICONS, '../..');
const GLYPHS = join(ROOT, 'kestrel/engine/data/icons/scalable/apps');
const BRAND_COLOR = /^brand_color = ".*"$/m;
const checking = process.argv.includes('--check');

async function outputs(app: string, colours: typeof palette[keyof typeof palette]): Promise<[string, string][]> {
	const shapes = parseDrawing(`${app}.svg`, await Bun.file(join(ICONS, 'drawings', `${app}.svg`)).text());
	const folder = ['system', 'store'].map(kind => join(ROOT, 'apps', kind, app)).find(existsSync)!;
	const icon = appIcon(shapes, colours);
	const files: [string, string][] = [[join(folder, 'public/favicon.svg'), icon], [join(GLYPHS, `com.lantharos.${app}-symbolic.svg`), glyph(shapes)]];
	const listing = join(folder, 'store/listing.toml');
	if (existsSync(listing)) {
		files.push([join(folder, 'store/icon.svg'), icon]);
		files.push([listing, (await Bun.file(listing).text()).replace(BRAND_COLOR, `brand_color = "${colours.shade}"`)]);
	}
	return files;
}

const files = (await Promise.all(Object.entries(palette).map(([app, colours]) => outputs(app, colours)))).flat();
const stale: string[] = [];
for (const [path, contents] of files) {
	if (await Bun.file(path).exists() && await Bun.file(path).text() === contents) continue;
	if (checking) stale.push(path.slice(ROOT.length + 1));
	else await Bun.write(path, contents);
}
if (stale.length) {
	console.error(`These app icons don't match apps/icons; run \`bun run build\` there:\n${stale.join('\n')}`);
	process.exit(1);
}
