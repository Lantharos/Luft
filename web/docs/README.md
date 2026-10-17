# Luft docs

The documentation site at [docs.luft.lanth.me](https://docs.luft.lanth.me), built with [Starlight](https://starlight.astro.build) and served from Cloudflare Workers. It shares its colours, fonts and logo with the website through [`web/shared`](../shared).

| Path | Holds |
| --- | --- |
| `src/content/docs` | The pages, one folder per sidebar group |
| `src/repo-docs.ts` | Notes from the repository's [`docs`](../../docs) folder shown under Reference, edited there |
| `src/assets/shots` | Screenshots, with a `-light` twin where there is one |
| `src/components` | The screenshot component, the home page's index and Starlight overrides |
| `src/styles` | Luft's palette mapped onto Starlight |

## Develop

```sh
bun install                # once, from the repository root
bun run dev                # http://localhost:4321
bun run build              # into dist, failing on any broken link
bun run preview            # the build, served by wrangler as Cloudflare will
```

Screenshots come from `kestrel/tools/session.sh capture`. Put them in `src/assets/shots` as WebP; the build makes AVIF and WebP in every size the page needs. `<Shot name="start" />` shows `start.webp`, and `start-light.webp` in the light style.

## Deploy

```sh
bunx wrangler login
bun run deploy             # builds and deploys the luft-docs Worker
```

Then add `docs.luft.lanth.me` as a custom domain on the Worker in the Cloudflare dashboard.
