# Keys

Keys makes your own keyboard layouts and input methods for Luft. It is built with Sabine and SvelteKit and lives at `apps/keys`; run the commands below from that directory unless noted otherwise.

## Layouts

A new layout starts from any layout the computer already has, or from one you made before, and shows every key of the letter block on a keyboard drawn to the shape you pick: ANSI, ISO or JIS. Each key shows what it types alone, with Shift, with AltGr and with Shift and AltGr, with dead keys and the Compose key set apart.

Pick a key with the mouse, or press it while the keyboard has focus. Below the keyboard, each of the four levels can be typed straight into, cleared with Backspace, or chosen from a search over characters and emoji by name. The same search offers the dead keys, the Compose key, and any key by its XKB name, such as `ISO_Level3_Shift`. Escape goes back to the keyboard.

The field under the keyboard types with the layout as it is in the editor, dead keys and compose sequences included, before anything is saved.

Changes are saved as you make them. A layout is written as an ordinary XKB symbols file to `~/.config/xkb/symbols/<name>` and listed in `~/.config/xkb/rules/evdev.xml`, where libxkbcommon, Kestrel, Xwayland and Settings find it. Keys you haven't touched, such as the number pad, keep working like the layout you started from. Add to input sources puts the layout in Settings' list; while it's in use, Kestrel picks up every change right away.

Layouts can be brought in from an XKB symbols file, a complete `.xkb` keymap or a Windows `.klc` file, and exported as a symbols file or a complete keymap.

## Viewing a layout

Any layout can be opened just to look at it, whether it came with the computer or you made it, on the same keyboard drawn to the shape of yours. Pressing a key lights it up and shows what it types at each level; holding Shift or AltGr, or clicking them, brings forward what every key types with them, dead keys and the Compose key included. A layout that came with the computer can be copied into a new one to change, and one of your own opens in the editor.

Show keyboard layout in Kestrel's input source menu opens Keys this way on the layout you're typing with, in a window of its own without the list of your layouts.

## Input methods

An input method changes what you type as you type it, through IBus. It can hold three kinds of entries:

- Replacements turn keys into text as you go, such as `a'` into `á`. The longest match wins, so `a` and `a'` can each have their own, and a replacement can be limited to come only after certain characters, such as `[aeiou]` for vowels or a plain piece of text.
- Words offer choices while you type, such as `ni` giving 你 and 尼. Space takes the highlighted choice and its number takes any other; when nothing matches the whole reading, the longest part that does is offered and the rest stays to be typed. Words you pick often move up, if Learn from your choices is on.
- Sequences start with a key of your choice, such as Compose or `;`, followed by a few keys, such as `a` and `e` for æ.

The Try it field next to the entries types with the input method as it is in the editor, with the same choices Kestrel shows.

Input methods are kept in `~/.config/keys/input-methods/<name>.toml`, a plain file you can share:

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

`compose` is the XKB name of the key that starts a sequence. What you pick is remembered in `~/.local/state/keys/learned`.

Keys can also bring in m17n `.mim` files, including their candidate lists, and IBus table sources (`BEGIN_TABLE` … `END_TABLE`, with their frequencies), and export any input method as its `.toml` file.

Once there is an input method, a small part of Keys keeps them registered with IBus for the session, so they appear in Settings, in Kestrel's input source switcher and in its panel as soon as they're made, without restarting IBus or signing out. It starts with the session from `~/.config/autostart/com.lantharos.keys.input-methods.desktop` and stops when the last input method is removed.

## Links

Keys registers the `kestrel-keys:` link scheme, which Settings and Kestrel use:

- `kestrel-keys:layout/new?from=de%2Bnodeadkeys` starts a new layout from a given layout
- `kestrel-keys:layout/<name>` and `kestrel-keys:method/<name>` open a layout or input method
- `kestrel-keys:view/<layout>` shows any layout without editing it, such as `kestrel-keys:view/us%2Bintl`
- `kestrel-keys:method/new` starts a new input method

Opening a layout or input method file with Keys brings it in.

## Development

Keys shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

## Install

```bash
sabine install --bundle .
```
