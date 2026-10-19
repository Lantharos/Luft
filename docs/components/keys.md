# Keys files and input methods

Where [Keys](../../apps/keys) keeps layouts, dead keys and input methods, and the format of an input method. Using Keys is described in [the docs](https://docs.luft.computer/apps/keys/), and the links that open it in [Opening Settings and Keys](https://docs.luft.computer/developers/links/).

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
