# Rules every language shares

Each language has its own file next to this one, such as `sq.md` or `de.md`, with how Luft addresses people in it, how buttons are phrased, its typography and the words chosen for Luft's features. Its `.tbx` file is the glossary. Fluent variables and plurals are explained on [Translating Luft](https://docs.luft.computer/developers/translating/).

## Tone

Friendly but calm. Short, plain sentences, with no exclamation marks, no marketing words and no "please" in every hint. Say what happens, not how it works inside: "Updates install at the next restart". When English says "you" only out of habit, leave the person out: "No notifications" for "You have no notifications".

## Labels

- Sentence case: only the first word and names take a capital, unless the language's grammar says otherwise.
- Switches and settings are nouns or short phrases, such as Night Light or Show seconds. Headings and page names are nouns.
- When a button clips, look for a shorter word before abbreviating.

## Ellipsis

A message about something in progress, such as "Looking for updates", takes no ellipsis, since a spinner already shows it's going. An ellipsis only ends a menu item or button that asks for more before it acts, such as "Print…". It is the single character …, never three dots.

## Names

- Luft, Kestrel and the apps keep their names: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium, Heft, Soundboard, Flatbed and Convertible. So do Flatpak, Secure Boot, TPM and Bluetooth, and Wi-Fi unless your language file names its own word.
- Settings, Disks and Install Luft describe what they are, so they are translated.
- When a name reads oddly with the language's endings or articles, put the kind of thing first: "the Rover app".

## Variables

Keep every `{ $variable }` and tag exactly as English has it; a translation that adds or drops one fails the check. Dates, times, numbers, sizes and durations arrive formatted for the reader's region, so never write a format into a translation. Build the sentence so the variable needs no case, ending, article or agreement, usually by putting it after a colon: "Last checked: { $date }".

## Keys

Shortcut labels are built from translatable key names. Name keys as they're printed on the keyboards your language uses, such as Strg in German.
