import { aliases, drawings, icon, NAME } from './build.js';

const [page] = process.argv.slice(2);
if (!page) throw new Error('Usage: bun src/preview.ts PAGE.html');

const drawn = await drawings();
const aliasesOf = Map.groupBy(await aliases(), ([, target]) => target);
const contexts = Map.groupBy(drawn, ([, drawing]) => drawing.context);

const tile = (name: string, svg: string) => {
	const also = (aliasesOf.get(name) ?? []).map(([alias]) => alias);
	const title = also.length ? ` title="Also ${also.join(', ')}"` : '';
	return `<figure${title}><div class="sizes">${[16, 24, 48].map(size => svg.replace('width="16" height="16"', `width="${size}" height="${size}"`)).join('')}</div><figcaption>${name}${also.length ? ` <b>+${also.length}</b>` : ''}</figcaption></figure>`;
};

const sections = [...contexts].sort(([a], [b]) => a.localeCompare(b)).map(([context, entries]) =>
	`<section><h2>${context}</h2><div class="grid">${entries.map(([name, { shapes }]) => tile(name, icon(shapes, false))).join('')}</div></section>`);

await Bun.write(page, `<!doctype html><html data-bg="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${NAME}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
:root{--bg:#16181b;--tile:#1f2226;--text:#e8e6e1;--muted:#8b8e94;--icon:#ecebe7}
[data-bg="light"]{--bg:#f1efea;--tile:#e4e1da;--text:#26282c;--muted:#6f7177;--icon:#26282c}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Bricolage Grotesque",sans-serif;padding:32px 16px 64px}
main{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:32px}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
h1{margin:0;font-size:34px;font-weight:600}
h2{margin:0 0 12px;font-size:17px;font-weight:600;text-transform:capitalize}
.switch{display:flex;padding:4px;border-radius:999px;background:var(--tile)}
.switch button{border:0;background:none;color:var(--muted);font:inherit;font-size:14px;padding:7px 16px;border-radius:999px;cursor:pointer}
.switch button[aria-pressed="true"]{background:var(--text);color:var(--bg)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:8px}
figure{margin:0;padding:16px 10px 12px;border-radius:14px;background:var(--tile);display:flex;flex-direction:column;align-items:center;gap:10px}
.sizes{display:flex;align-items:flex-end;gap:14px;height:48px}
svg{fill:var(--icon)}svg path{fill:inherit}
figcaption{font:11px "JetBrains Mono",monospace;color:var(--muted);text-align:center;overflow-wrap:anywhere}
figcaption b{font-weight:400;color:var(--text)}
</style></head><body><main>
<header><h1>${NAME}</h1><div class="switch"><button aria-pressed="true" data-value="dark">Dark</button><button aria-pressed="false" data-value="light">Light</button></div></header>
${sections.join('\n')}
</main><script>
for (const b of document.querySelectorAll('.switch button')) b.onclick = () => {
  document.documentElement.dataset.bg = b.dataset.value;
  for (const o of document.querySelectorAll('.switch button')) o.setAttribute('aria-pressed', o === b);
};
</script></body></html>`);
