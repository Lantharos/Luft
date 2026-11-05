# Draft

Draft is Luft's text and code editor, built on CodeMirror: syntax highlighting for over a hundred languages, multiple cursors, a command palette and a Markdown preview, with your open files and unsaved changes restored on the next start. Using it is described in [the docs](https://docs.luft.computer/apps/draft/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Opening files needs a build or bundle, since Sabine's local file access only works from the packaged app.

| Path | Contents |
|------|----------|
| `~/.config/draft/settings.json` | Settings |
| `~/.config/draft/session.json`, `files-session.json` | Open folders and tabs |
| `~/.local/state/draft/backups/` | Unsaved changes |

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
