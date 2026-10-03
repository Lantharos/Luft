# Keys

Keys makes your own keyboard layouts and input methods for Luft. It is built with Sabine and Svelte and lives at `apps/keys`; run the commands below from that directory unless noted otherwise.

## Layouts

A new layout starts from any layout the computer already has, or from one you made before. Its page has three parts: Keys, Dead keys and Settings, which Ctrl+1, Ctrl+2 and Ctrl+3 switch between. Every change can be undone and redone with the arrows at the top or Ctrl+Z and Ctrl+Shift+Z, and is saved as you make it.

### Keys

Every key of the letter block is shown on a keyboard drawn to the shape you pick: ANSI, ISO or JIS. Each key shows what it types alone, with Shift, with AltGr and with Shift and AltGr, or just one of these levels when you pick it above the keyboard. Dead keys and the Compose key are set apart.

Pick a key with the mouse, or press it while the keyboard has focus. Below the keyboard, each of the four levels can be typed straight into, cleared with Backspace, or chosen from a search over characters and emoji by name. The same search offers your own dead keys, a new one, the standard dead keys, the Compose key, and any key by its XKB name, such as `ISO_Level3_Shift`. Escape goes back to the keyboard.

The field under the keyboard types with the layout as it is in the editor, dead keys included, before anything is saved. Below it, Keys points out what's worth a second look: keys that type nothing, characters on more than one key, dead keys that aren't on a key, results that can't be reached or clash, and AltGr and Compose sharing a key. Each one opens the place to fix it.

### Dead keys

A dead key types nothing by itself and changes the key that comes after it. Each dead key you make has its own table, the way Windows layouts do it: a goes to ž, z goes to ž, s goes to š, and so on, with any result you like, even several characters. A result can also lead into another dead key, whose table then applies to the next key. Space, or the dead key pressed twice, types the dead key's own character, and a key without a result types that character followed by the key. The symbol it shows on the keyboard and its name are yours to choose.

The table is a searchable grid; Add capitals fills in the capital letter for every small letter that doesn't have one yet, and the Try it field shows what the dead key makes of each key you press, chains included. Put on a key takes you to the keyboard to choose where it goes.

Dead keys that come from the layout you started from, such as the acute accent in English (US, intl.), keep working as before and use the computer's standard table. Keys shows that table, and Make an editable copy turns it into a dead key of your own, on the same keys.

Most apps use changes to dead keys right away, including GTK and X11 apps, apps typing through IBus, Keys' own input methods and Mozc. Apps that compose characters themselves without the input method, such as many terminals, use the changes once they're reopened.

### Settings

Besides the name, the short name on the panel and the language, a layout can move AltGr to another key, put Compose on a key, and change what Caps Lock does. These travel with the layout, so they change when you switch to it.

### Where layouts are kept

A layout is written as an ordinary XKB symbols file to `~/.config/xkb/symbols/<name>` and listed in `~/.config/xkb/rules/evdev.xml`, where libxkbcommon, Kestrel, Xwayland and Settings find it. Keys you haven't touched, such as the number pad, keep working like the layout you started from. Add to input sources puts the layout in Settings' list; while it's in use, Kestrel picks up every change right away. What the symbols file can't hold, such as the dead key tables, is kept next to it in `~/.config/keys/layouts/<name>.toml`.

Each of your dead keys types a character of its own from the private use area, starting at U+EC40, and its table becomes compose sequences in `~/.config/keys/Compose`. These characters are never typed on their own, and unlike the standard `dead_` keys they have no built-in results, so a table holds exactly what you put in it. Keys adds one line to `~/.XCompose` to include that file, creating it with `include "%L"` first when you don't have one, so the computer's own sequences keep working; a `~/.XCompose` you already have is left as it is apart from that line. When the dead keys change, Keys restarts IBus's simple engine so that it reads them again.

Layouts can be brought in from an XKB symbols file, a complete `.xkb` keymap or a Windows `.klc` file, including its dead keys, their names and chained dead keys. They can be exported as a symbols file, a complete keymap, their dead keys as a Compose file, or a Windows `.klc` file.

## Viewing a layout

Any layout can be opened just to look at it, whether it came with the computer or you made it, on the same keyboard drawn to the shape of yours. Pressing a key lights it up and shows what it types at each level; holding Shift or AltGr, or clicking them, brings forward what every key types with them, dead keys and the Compose key included. A layout that came with the computer can be copied into a new one to change, and one of your own opens in the editor.

Show keyboard layout in Kestrel's input source menu opens Keys this way on the layout you're typing with, in a window of its own without the list of your layouts.

## Input methods

An input method changes what you type as you type it, through IBus. Its page has Replacements, Words, Sequences and Settings, which Ctrl+1 to Ctrl+4 switch between, with undo and redo like layouts. It can hold three kinds of entries:

- Replacements turn keys into text as you go, such as `a'` into `á`. The longest match wins, so `a` and `a'` can each have their own, and a replacement can be limited to come only after certain characters, such as `[aeiou]` for vowels or a plain piece of text.
- Words offer choices while you type, such as `ni` giving 你 and 尼. Space takes the highlighted choice and its number takes any other; when nothing matches the whole reading, the longest part that does is offered and the rest stays to be typed. Words you pick often move up, if Learn from your choices is on.
- Sequences start with a key of your choice, such as Compose or `;`, followed by a few keys, such as `a` and `e` for æ.

Entries with the same keys are marked, since only the last one is used. The Try it field next to the entries types with the input method as it is in the editor, with the same choices Kestrel shows. Dead keys and the Compose key work inside an input method too: what they make goes through its replacements and words like any other character.

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
