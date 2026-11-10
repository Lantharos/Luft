# Luft website

The site at [luft.computer](https://luft.computer): the home page, downloads and the brand page. Built with [Astro](https://astro.build) and Tailwind, as static files for Cloudflare. Colours, fonts and links come from [`web/shared`](../shared/README.md).

## Run it

```sh
bun install          # from the repository root
cd web/site
bun run dev          # http://localhost:4321
bun run build        # static files in dist/
bun run preview      # build, then serve dist/ the way Cloudflare does
bun run check        # type checks the pages and the Worker
```

The ISO links go through the site's Worker ([`worker/index.ts`](worker/index.ts)): `/download/latest` and `/download/nightly`, with `.sha256`, `.sha256.minisig` and `.json` after them, read `1/latest.json` or `nightly/latest.json` from get.luft.computer when someone clicks and redirect to that ISO. `latest` is the newest release, or the newest nightly build until there is one. The download page shows the ISO's name and size from the `.json`, so nothing needs rebuilding when a new ISO is published. The Worker also answers three addresses for Luft computers, none of which sets a cookie or keeps a log:

- `/connectivity` answers `online`, which NetworkManager fetches over plain HTTP to tell whether the network reaches the internet or sits behind a sign-in page. The zone must not redirect this one address to HTTPS.
- `/api/weather?lat=48.2&lon=16.4` passes the question on to Open-Meteo and answers `{ time, code, temperature, precipitation, wind, sunrise, sunset, day }`. Positions must be rounded to a tenth of a degree, and everyone in the same square shares one answer for a quarter of an hour.
- `/api/rates` answers the day's currency rates as `{ eur: { usd: 1.08, … } }`, shared for an hour.

`bun run types` regenerates the Worker's types after `wrangler.jsonc` changes; `bun run check` does it too, then type-checks the pages and the Worker.

## Languages

Every page is built once per language, from the Fluent files in `locales/`; English lives at the root and the others under `/de`, `/pt-br` and so on. Copy goes through `t()` from `src/i18n`, and how translations work is in [docs/translations.md](../../docs/translations.md).

## Deploy

The site is a Cloudflare Worker ([`wrangler.jsonc`](wrangler.jsonc)) that serves the files in `dist/`, sends visitors on the home page to their language, resolves the ISO links and answers Luft computers.

```sh
bunx wrangler login
bun run deploy       # builds, then uploads dist/ to luft.computer
```

## Pictures and clips

Screenshots in `src/assets/shots` and the clip in `src/assets/clips` are captured from headless Kestrel sessions at twice the screen's density: a virtual monitor with a physical size, such as `KESTREL_CAPTURE_SIZE=3840x2400:443x277mm`, starts at 200%. A screenshot with both a `-dark` and a `-light` version follows the visitor's style; one with only `-dark` is shown either way. Astro turns them into AVIF and WebP at several widths when building.

Wallpapers come straight from `os/image/files/usr/share/backgrounds/luft`, with their photographers credited in the footer.
