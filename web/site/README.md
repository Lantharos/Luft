# Luft website

The site at luft.lanth.me: the home page and downloads. Built with [Astro](https://astro.build) and Tailwind, as static files for Cloudflare. Colours, fonts and links come from [`web/shared`](../shared/README.md).

## Run it

```sh
bun install          # from the repository root
cd web/site
bun run dev          # http://localhost:4321
bun run build        # static files in dist/
bun run preview      # build, then serve dist/ the way Cloudflare does
bun run check        # type checks
```

Download sizes on the download page are read from get.luft.lanth.me while building, and the ISO links switch from the nightly builds to `luft-latest*.iso` once a release is published there. Rebuild after a release to pick it up.

## Deploy

The site is a Cloudflare Worker that only serves the files in `dist/` ([`wrangler.jsonc`](wrangler.jsonc)).

```sh
bunx wrangler login
bun run deploy       # builds, then uploads dist/
```

Then add the custom domain in the Cloudflare dashboard under Workers, `luft-site`, Settings, Domains & Routes, or add `"routes": [{ "pattern": "luft.lanth.me", "custom_domain": true }]` to `wrangler.jsonc` and deploy again.

## Pictures and clips

Screenshots in `src/assets/shots` and the clip in `src/assets/clips` are captured from headless Kestrel sessions at twice the screen's density. Each screenshot has a `-dark` and `-light` version, shown to match the visitor's style. Astro turns them into AVIF and WebP at several widths when building.

Wallpapers come straight from `os/image/files/usr/share/backgrounds/luft`, with their photographers credited in the footer.
