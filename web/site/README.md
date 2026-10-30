# Luft website

The site at [luft.computer](https://luft.computer): the home page and downloads. Built with [Astro](https://astro.build) and Tailwind, as static files for Cloudflare. Colours, fonts and links come from [`web/shared`](../shared/README.md).

## Run it

```sh
bun install          # from the repository root
cd web/site
bun run dev          # http://localhost:4321
bun run build        # static files in dist/
bun run preview      # build, then serve dist/ the way Cloudflare does
bun run check        # type checks the pages and the Worker
```

The ISO links go through the site's Worker ([`worker/index.ts`](worker/index.ts)): `/download/latest` and `/download/nightly`, with `.sha256`, `.sha256.minisig` and `.json` after them, read `1/latest.json` or `nightly/latest.json` from get.luft.computer when someone clicks and redirect to that ISO. `latest` is the newest release, or the newest nightly build until there is one. The download page shows the ISO's name and size from the `.json`, so nothing needs rebuilding when a new ISO is published. `bun run types` regenerates the Worker's types after `wrangler.jsonc` changes; `bun run check` does it too, then type-checks the pages and the Worker.

## Languages

Every page is built once per language, from the Fluent files in `locales/`; English lives at the root and the others under `/de`, `/pt-br` and so on. Copy goes through `t()` from `src/i18n`, and how translations work is in [docs/translations.md](../../docs/translations.md).

## Deploy

The site is a Cloudflare Worker ([`wrangler.jsonc`](wrangler.jsonc)) that serves the files in `dist/`, sends visitors on the home page to their language and resolves the ISO links.

```sh
bunx wrangler login
bun run deploy       # builds, then uploads dist/ to luft.computer
```

## Pictures and clips

Screenshots in `src/assets/shots` and the clip in `src/assets/clips` are captured from headless Kestrel sessions at twice the screen's density: a virtual monitor with a physical size, such as `KESTREL_CAPTURE_SIZE=3840x2400:443x277mm`, starts at 200%. A screenshot with both a `-dark` and a `-light` version follows the visitor's style; one with only `-dark` is shown either way. Astro turns them into AVIF and WebP at several widths when building.

Wallpapers come straight from `os/image/files/usr/share/backgrounds/luft`, with their photographers credited in the footer.
