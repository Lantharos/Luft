import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { puffs } from './cloud.js';
import { flames, logs } from './fire.js';
import { lanterns, tassels } from './lantern.js';
import { sheet } from './picture.js';
import { previews } from './preview.js';
import { comet, glows, ring, small, stars } from './sky.js';

const folder = join(dirname(import.meta.dir), 'sheets');
mkdirSync(folder, { recursive: true });

const write = (name: string, png: Uint8Array) => writeFileSync(join(folder, `${name}.png`), png);

write('lantern', sheet(lanterns(), 3));
write('tassel', sheet(tassels(), 3));
write('cloud', sheet(puffs(), 3));
write('flame', sheet(flames(), 6));
write('logs', sheet([logs()], 1));
write('glow', sheet([...glows(), ring()], 3));
write('star', sheet(stars(), 3));
write('small', sheet(small(), 4));
write('comet', sheet(comet(), 1));
write('preview', sheet(previews(), 8));
