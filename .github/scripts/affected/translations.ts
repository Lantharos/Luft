import { readFileSync } from 'node:fs';

const COMPONENTS = 'packages/i18n/components.json';
const CHECK = 'packages/i18n/tools/weblate.ts';

const masks = (JSON.parse(readFileSync(COMPONENTS, 'utf8')) as { mask: string }[]).map(({ mask }) => new Bun.Glob(mask));

export const touchesTranslations = (changed: string[]) => changed.some((file) => file === COMPONENTS || file === CHECK || masks.some((mask) => mask.match(file)));
