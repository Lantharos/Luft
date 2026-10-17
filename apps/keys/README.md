# Keys

Keys makes your own keyboard layouts, dead keys and input methods for Luft, and imports and exports them in the usual formats. Using it is described in [the docs](https://docs.luft.computer/apps/keys/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Installing registers the `kestrel-keys:` link scheme.

## Links

Settings and Kestrel open Keys through these links:

| Link | Opens |
|------|-------|
| `kestrel-keys:` | Keys |
| `kestrel-keys:layout/new?from=de%2Bnodeadkeys` | A new layout starting from the given one |
| `kestrel-keys:layout/<name>` | One of your layouts |
| `kestrel-keys:view/<layout>` | Any layout, read-only, such as `kestrel-keys:view/us%2Bintl` |
| `kestrel-keys:method/new` | A new input method |
| `kestrel-keys:method/<name>` | One of your input methods |

Opening a layout or input method file with Keys imports it.

## Files

| Path | Contents |
|------|----------|
| `~/.config/xkb/symbols/<name>` | A layout's XKB symbols |
| `~/.config/xkb/rules/evdev.xml` | The list of your layouts |
| `~/.config/keys/layouts/<name>.toml` | What the symbols file can't hold, such as dead key tables |
| `~/.config/keys/Compose` | Compose sequences for your dead keys |
| `~/.XCompose` | Gets one `include` line for the file above, created with `include "%L"` if missing |
| `~/.config/keys/input-methods/<name>.toml` | Input methods |
| `~/.local/state/keys/learned` | Word choices learned while typing |
| `~/.config/autostart/com.lantharos.keys.input-methods.desktop` | Registers input methods with IBus at sign-in, while any exist |

Your own dead keys type characters from the private use area starting at U+EC40, so their tables hold exactly what you put in them. Most apps pick up dead key changes immediately; apps that compose characters themselves, such as many terminals, need reopening.

## Input method format

```toml
name = "Esperanto"
label = "EO"
language = "eo"
candidates = 9
learn = true
compose = "Multi_key"

rules = [
  { keys = "cx", text = "ĉ" },
  { keys = "u", text = "ŭ", after = "[ae]" },
]

words = [
  { keys = "saluton", text = "Saluton!" },
]

sequences = [
  { keys = "ae", text = "æ" },
]
```

| Key | Meaning |
|-----|---------|
| `label`, `language` | Short name on the panel and language code |
| `candidates` | How many word choices to show |
| `learn` | Move often-picked words up |
| `compose` | XKB name of the key that starts a sequence |
| `rules` | Replacements; the longest match wins, and `after` limits one to follow certain characters |
| `words` | Choices offered while typing; Space takes the highlighted one, a number any other |
| `sequences` | Keys typed after the `compose` key |

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/ui/fonts`.
