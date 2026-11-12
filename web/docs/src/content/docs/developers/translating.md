---
title: Translating Luft
description: How Luft is translated, how it picks a language, and how to write code that can be translated.
sidebar:
  order: 14
---

Luft speaks English, Albanian, Bosnian, Bulgarian, Catalan, Croatian, Czech, Danish, Dutch, Estonian, Finnish, French, German, Greek, Hungarian, Icelandic, Irish, Italian, Latvian, Lithuanian, Macedonian, Maltese, Norwegian (Bokmål and Nynorsk), Polish, Portuguese (Portugal and Brazil), Romanian, Russian, Serbian in Cyrillic and in Latin script, Slovak, Slovenian, Spanish, Swedish, Turkish and Ukrainian. Its text is written in English as [Fluent](https://projectfluent.org) messages, in `.ftl` files next to the code that shows them, one folder per language. Translations are licensed GPL-3.0-or-later, like the rest of Luft.

## Translating on Babblebird

Translating needs no programming and no copy of the repository. It happens on [Babblebird](https://babblebird.dev):

1. Sign in at babblebird.dev and open Luft.
2. Pick your language, then an area, such as Start and quick settings or one part of Settings.
3. Translate string by string. Babblebird checks each translation, shows the glossary's agreed term for every word it knows, and offers earlier translations of similar strings.

Babblebird collects the changes into one pull request, and they reach the nightly builds once it's merged. Serbian is translated in Cyrillic only: Babblebird writes the Latin script version from it.

Problems with the English text itself, such as a string that could mean two things, are best reported in [the issues](https://github.com/Lantharos/Luft/issues).

## Style and terms

Every language follows [the rules all languages share](https://github.com/Lantharos/Luft/blob/main/packages/i18n/glossary/common.md), and its own style file next to its glossary: [Albanian](https://github.com/Lantharos/Luft/blob/main/packages/i18n/glossary/sq.md), [German](https://github.com/Lantharos/Luft/blob/main/packages/i18n/glossary/de.md), [Croatian](https://github.com/Lantharos/Luft/blob/main/packages/i18n/glossary/hr.md) and [the others](https://github.com/Lantharos/Luft/tree/main/packages/i18n/glossary), each named by its language tag. The style file says how Luft addresses people in that language, how buttons are phrased, which quotation marks it uses, and why each of Luft's own words was chosen. The glossary, `packages/i18n/glossary/<tag>.tbx`, holds the agreed terms Babblebird shows.

## The format

Most messages are plain text. A few have parts to keep as they are:

- **Variables** like `{ $name }` or `{ $count }` are filled in by Luft. Keep them, and move them wherever the sentence needs them.
- **Plurals** choose a form by number. A language may need more forms than English: Croatian, Bosnian and Serbian use `one`, `few` and `other`. Keep `{ $count }` in every form and `*[other]` as the default, and translate an exact `[0]` form when English has one.

  ```ftl
  notifications-count = { $count ->
      [one] { $count } obavijest
      [few] { $count } obavijesti
     *[other] { $count } obavijesti
  }
  ```

- **Dates, times, numbers and units** arrive already formatted for the reader, so they're variables too.
- **Tags** such as `<a>` in a message stay exactly as English has them.

Comments above a message say where it appears, and what it means when the English alone could mean two things.

## Seeing a translation

`LUFT_LOCALE` sets the language everywhere, along with the formats of dates, numbers and units, and nothing changes it while it's set. Set to `en-XA`, it shows English with accented letters and every vowel doubled, about a third longer, which shows clipped text and strings that are still written into the code:

```sh
LUFT_LOCALE=sq kestrel/tools/session.sh nested
LUFT_LOCALE=en-XA kestrel/tools/session.sh capture --only system:translations
```

The desktop and every app opened from it use that language. [Building Luft](/developers/building/) covers setting up a session.

## How a language is picked

- Kestrel follows the account's language from AccountsService and switches as soon as it changes. Before anyone signs in, the login screen uses the system language from `/etc/locale.conf`. Settings, under Language and time, sets the account's language the same way setup does.
- Apps get the session's languages with their first state from `luft-app`, so a translation loads with no extra round trip. Apps already open keep their language until they restart.
- Rust services read `LANGUAGE`, `LC_ALL`, `LC_MESSAGES` and `LANG`, in that order.
- The website has a copy of every page per language: English at the root of luft.computer, the others under their tag in lower case, such as `/de` or `/pt-br`. On a first visit, its Worker sends the visitor to the language their browser asks for and remembers it in a `lang` cookie, which picking a language in the footer replaces.
- A message that isn't translated yet shows in English, and the rest of the screen stays translated.
- `sr` is Serbian in Cyrillic and `sr-Latn` in Latin script. The locale `sr_RS.UTF-8@latin` picks Latin, and any other Serbian locale Cyrillic.
- Dates, numbers and units follow the region chosen in Settings, or else the account's language. The session applies it as `LC_TIME`, `LC_NUMERIC`, `LC_MONETARY`, `LC_MEASUREMENT` and `LC_PAPER`. Setup only picks the time zone's country's formats when they come in the person's language and script, so English in Serbia keeps English formats.

## Writing translatable code

Message IDs are stable and name what the message is for, starting with its feature: `quick-settings-wifi-off`. They never come from the English text, and they always appear literally in the code, so the checker can find them.

| Where | How |
| --- | --- |
| Svelte apps | `import { t, i18n } from '@luft/i18n'`, then `t('id', { count })`. `t` is reactive. Use `i18n.formats` as the locale of every `Intl` formatter |
| Kestrel | `t`, `bindText(label, id)` and `localized(actor, apply)` from `kestrel/ui/src/shared/i18n`. Widgets that live all session use `bindText` or `localized` so they follow a change of language, and `formatsLocale()` is the locale for `Intl` |
| Website | `const { t } = localize(Astro)` from `web/site/src/i18n/pages`, then `t('id')`. A message with a link holds the `<a>` itself, with its address as a variable, and goes into the page with `set:html` |
| Rust | `static L10N: Localizer = luft_i18n::localizer!("locales", ["desktop"]);` once per crate, then `t!(L10N, "id", count = n)` |

- One sentence is one message, never pieces joined in code. What changes goes in a variable: `files-copied = Copied { $name } to { $folder }`.
- Anything counted gets a plural selector, even when English reads the same either way. Pass numbers as numbers, and name variables in camelCase.
- Add a comment above a message whose English is ambiguous: whether "Open" is a verb, where the text shows, what a variable holds.
- A message about something in progress, such as `Looking for updates`, has no ellipsis, since a spinner beside it already says it's still going. An ellipsis only ends a menu item or button that asks for more before it acts, such as `Print…`.
- Shortcut labels are built from translatable key names, since German writes Strg for Ctrl.
- Log messages and errors meant for developers stay in English.

New strings go into the English file only; translators add the rest.

`bun run check` in `packages/i18n` runs the checker, and the checks workflow runs it on every pull request. It fails on messages that don't parse, IDs the code uses that English doesn't define, English messages nothing uses, translations of messages English no longer has, variables or tags a translation adds or drops, Latin Serbian files that aren't the transliteration of the Cyrillic ones (`bun run transliterate` rewrites them), and interface text written straight into the code. Text that looks like interface text but has to stay as it is, such as a font name, goes in `packages/i18n/allowed/<component>.txt`: the path, a tab and the string, one per line. Removing an English message therefore means removing it from every language in the same change.

Builds give each language its own file: apps load one chunk per language on demand, with English filling the gaps, and Kestrel compiles one file per language into its resources and reads only the one in use.

## Adding a language

1. Add it to `LANGUAGES` in `packages/i18n/src/locales.ts`, which Settings offers, sorted by the language's own name with English first; to `LOCALES` in `packages/i18n/rust/locales.rs`; and to the `localizer!` macro in `packages/i18n/rust/lib.rs`.
2. Add its locales, with the country each is spoken in, to `LOCALES` in `apps/system/setup/src/lib/regional/languages.ts` for Install Luft, and to `FORMATS` in `apps/system/settings/src/lib/panels/system/language/region/formats.ts`.
3. Add its file to the outputs of `kestrel-locales` in `kestrel/engine/ui/meson.build` and to `kestrel/engine/ui/kestrel.gresource.xml`.
4. Add its CEF locale to `languages` in `os/image/parts/stages/runtime.sh` if CEF ships one.
5. Create its folder with an empty file for every component, and its glossary and style file in `packages/i18n/glossary`.

## Moving translation files

`packages/i18n/components.json` names each component's files and the code it covers, and `babblebird.toml` at the repository's root groups the same files into the areas translators pick from. Moving, renaming or adding an `.ftl` file means changing both in the same commit, or the checker or Babblebird stops finding it.
