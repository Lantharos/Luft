# Flatbed

Flatbed scans documents on Luft, with scanners on the network or plugged in and with the camera, straightens and cleans up every page, and saves searchable PDFs or pictures. Using it is described in [the docs](https://docs.luft.computer/apps/flatbed/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

SANE scanners need `libsane.so.1` and its drivers, and searchable PDFs need `tesseract` with language data; Luft has both. Without them Flatbed still scans with eSCL scanners and the camera, and saves PDFs without text.

| Path | Contents |
|------|----------|
| `~/.local/state/com.lantharos.flatbed/document/` | The pages scanned and not removed yet |
| `~/.local/state/com.lantharos.flatbed/sane/` | The Canon scanners on the network, for SANE |
| `~/.config/com.lantharos.flatbed/settings.json` | Settings and scanners added by address |
| `~/.config/com.lantharos.flatbed/scanners.json` | The certificate each HTTPS scanner showed first |

Installed from the store these are inside `~/.var/app/com.lantharos.flatbed`.

## License

GPL-3.0-or-later, like the rest of Luft. Open Runde is under the SIL Open Font License, in `packages/web/ui/fonts`.
