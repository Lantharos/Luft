# Translations

Luft's desktop and apps are written in English and translated with [Project Fluent](https://projectfluent.org). Every translatable piece of Luft keeps its messages in `.ftl` files next to its code, one folder per language, with English as the source.

Luft is translated into Albanian, Bosnian, Bulgarian, Catalan, Croatian, Czech, Danish, Dutch, Estonian, Finnish, French, German, Greek, Hungarian, Icelandic, Irish, Italian, Latvian, Lithuanian, Macedonian, Maltese, Norwegian Bokmål, Norwegian Nynorsk, Polish, Portuguese (Portugal and Brazil), Romanian, Russian, Serbian (Cyrillic and Latin as separate languages), Slovak, Slovenian, Spanish, Swedish, Turkish and Ukrainian. Translations are licensed GPL-3.0-or-later, like the rest of Luft.

## Where the messages live

| Component | Files | English source |
| --- | --- | --- |
| kestrel-desktop | `kestrel/ui/locales/*/desktop.ftl` | taskbar, tray, board, task view, snapping, title bars, window menus, switchers, rain |
| kestrel-surfaces | `kestrel/ui/locales/*/surfaces.ftl` | Start, quick settings, notifications, calendar, clipboard, emoji, the on-screen keyboard |
| kestrel-shell | `kestrel/ui/locales/*/shell.ftl` | shared pieces such as key names, durations and text field menus |
| kestrel-system | `kestrel/ui/locales/*/system.ftl` | network menus and sign-in, VPNs, Bluetooth, sound, power, displays, drives, accessibility, screenshots, dictation, system notices |
| kestrel-auth | `kestrel/ui/locales/*/auth.ftl` | login screen, lock screen, sign-in and administrator prompts, keyring and passkey prompts, signing out and powering off |
| kestrel-portal | `kestrel/ui/locales/*/portal.ftl` | printing, screen sharing, shortcuts and other app requests |
| kestrel-settings | `kestrel/settings/locales/*/settings.ftl` | notifications from `kestrel-settings` about drives |
| kestrel-portal-service | `kestrel/portal/locales/*/portal.ftl` | print job names and printing failures from `kestrel-portal` |
| ui | `packages/web/ui/locales/*/ui.ftl` | the UI kit every app shares |
| settings | `apps/settings/locales/*/settings.ftl` | Settings' window, sidebar and its groups, and search |
| settings-pages | `packages/web/settings-pages/locales/*/pages.ftl` | Settings' page names and search words, also used by Start |
| settings-connections | `apps/settings/locales/*/connections.ftl` | Network, Bluetooth |
| settings-devices | `apps/settings/locales/*/devices.ftl` | Displays, Sound, Power, Input |
| settings-personalization | `apps/settings/locales/*/personalization.ftl` | Appearance, Desktop, Notifications, Accessibility |
| settings-protection | `apps/settings/locales/*/protection.ftl` | Apps, Privacy, Security |
| settings-system | `apps/settings/locales/*/system.ftl` | Accounts, Language & time, System |
| settings-desktop | `apps/settings/desktop/locales/*/desktop.ftl` | messages from Settings' native side |
| sandbox | `apps/schelf/sandbox/locales/*/sandbox.ftl` | notifications from the sandbox AppImages run in |
| trust | `packages/system/trust/locales/*/trust.ftl` | errors from the security service, shared by Disks, Settings and Install Luft |
| setup | `apps/setup/locales/*/setup.ftl` | Install Luft and first-run setup |
| setup-desktop | `apps/setup/desktop/locales/*/desktop.ftl` | messages from setup's native side |
| setup-installer | `apps/setup/installer/locales/*/installer.ftl` | the installer service's errors and progress |
| meet | `apps/meet/locales/*/meet.ftl` | Meet Luft, the Windows and Linux app that gets a computer ready for Luft |
| meet-desktop | `apps/meet/desktop/locales/*/desktop.ftl` | Meet Luft's checks, errors and file dialogs from its native side |
| site | `web/site/locales/*/site.ftl` | the website's header, footer, language list and missing-page page |
| site-home | `web/site/locales/*/home.ftl` | the website's home page |
| site-download | `web/site/locales/*/download.ftl` | the website's download page |

`packages/i18n/components.json` lists the same components with the code each one covers. Language folders use BCP 47 tags: `en`, `bs`, `ca`, `cs`, `da`, `de`, `et`, `es`, `fr`, `ga`, `hr`, `is`, `it`, `lv`, `lt`, `hu`, `mt`, `nl`, `nb`, `nn`, `pl`, `pt-BR`, `pt`, `ro`, `sq`, `sk`, `sl`, `sr-Latn`, `fi`, `sv`, `tr`, `el`, `bg`, `mk`, `ru`, `sr`, `uk`.

The glossary for each language is `packages/i18n/glossary/<language>.tbx`, and its style guide is `docs/translations/<language>.md`. Strings a native speaker should look at first, with the reason for each, are listed in `docs/translations-review/<language>.md`; remove a note once someone fluent has checked it.

## How a language is picked

- **Kestrel** follows the account's language from AccountsService and switches as soon as it changes. Before anyone signs in, the login screen uses the system language from `/etc/locale.conf`.
- **Apps** get the session's languages from `luft_app::Appearance` with their first state, so a translation loads with no extra round trip. An app started after the language changed uses the new one; apps already open keep theirs until they restart.
- **The website** has a copy of every page per language: English at the root of luft.computer, the others under their tag in lower case, such as `/de` or `/pt-br`. On a first visit to the home page, the site's Worker sends the visitor to the language their browser asks for and remembers it in a `lang` cookie; picking a language in the footer replaces it.
- **Rust services** read `LANGUAGE`, `LC_ALL`, `LC_MESSAGES` and `LANG`, in that order.
- A message that isn't translated yet shows in English; the rest of the screen stays translated.
- `sr` is Serbian in Cyrillic and `sr-Latn` Serbian in Latin script. The locale `sr_RS.UTF-8@latin` picks Latin, any other Serbian locale Cyrillic. Serbian is translated once, in Cyrillic: `bun run transliterate` in `packages/i18n` writes the Latin files from it, and the checker fails when they differ.
- Dates, numbers and units follow the formats locale: the region chosen in Settings, or else the account's language. The session applies it as `LC_TIME`, `LC_NUMERIC`, `LC_MONETARY`, `LC_MEASUREMENT` and `LC_PAPER`, and Kestrel follows a change to either right away and hands it to apps started afterwards. Setup only picks formats for the time zone's country when they are in the person's language and script, so English in Serbia keeps following English.

Settings → Language & time sets the account's language through AccountsService, like the language picked during setup. The new language reaches the login screen and the whole session at the next sign-in, and Kestrel and newly started apps right away.

## Writing translatable code

Message IDs are stable, semantic and start with the feature they belong to, such as `quick-settings-wifi-off`. They never come from the English text, and they always appear literally in the code, so the checker can find them.

| Where | How |
| --- | --- |
| Svelte apps | `import { t, i18n } from '@luft/i18n'`, then `t('id', { count })`. `t` is reactive. Use `i18n.formats` as the locale of every `Intl` formatter |
| Kestrel | `t`, `bindText(label, id)` and `localized(actor, apply)` from `kestrel/ui/src/shared/i18n`. Widgets that live all session use `bindText` or `localized` so they follow a language change, and `formatsLocale()` is the locale for `Intl` |
| Website | `const { t } = localize(Astro)` from `web/site/src/i18n/pages`, then `t('id')`. A message with a link holds the `<a>` itself, with its address as a variable, and goes into the page with `set:html` |
| Rust | `static L10N: Localizer = luft_i18n::localizer!("locales", ["desktop"]);` once per crate, then `t!(L10N, "id", count = n)` |

- Never build a sentence from pieces. One sentence is one message, with placeables for what changes: `files-copied = Copied { $name } to { $folder }`.
- Anything counted gets a plural selector, even when English reads the same:

  ```ftl
  notifications-count = { $count ->
      [one] { $count } notification
     *[other] { $count } notifications
  }
  ```

- Variables are camelCase. Pass numbers as numbers; Fluent formats them for the language.
- Add a comment above a message when the English is ambiguous: whether "Open" is a verb, where the text shows, what a variable holds.
- Keyboard shortcut labels are built from translatable key names, since German writes Strg for Ctrl.
- Log messages and errors meant for developers stay in English.

`bun run check` in `packages/i18n` runs the checker. It fails on messages that don't parse, IDs used in code that English doesn't define, English messages nothing uses, duplicate IDs within a bundle, translations using variables English doesn't have, and new interface text written straight into the code of these components. Strings that look like interface text but have to stay as they are, such as a font name, go in `packages/i18n/allowed/<component>.txt`, one per line as the path, a tab and the string. The checks workflow runs it with every other package's checks.

Builds put each language in its own file: apps get one lazily loaded chunk per language with English filling the gaps, and Kestrel compiles one file per language into its resources and reads only the one in use.

## Trying layouts with the pseudo-locale

`LUFT_LOCALE` overrides the language everywhere, along with the formats of dates, numbers and units, and nothing changes it while it's set. Set to `en-XA`, it shows English with accented letters and every vowel doubled, about a third longer, which shows clipped or overflowing text and strings that are still hard-coded:

```sh
LUFT_LOCALE=en-XA kestrel/tools/session.sh capture --only system:translations
LUFT_LOCALE=de kestrel/tools/session.sh nested
```

## Adding a language

1. Add it to `LANGUAGES` in `packages/i18n/src/locales.ts`, `LOCALES` in `packages/i18n/rust/locales.rs` and the `localizer!` macro in `packages/i18n/rust/lib.rs`. `LANGUAGES` is what Settings offers; keep it sorted by the language's own name, English first.
2. Add its locales, with the country each is spoken in, to `LOCALES` in `apps/setup/src/lib/regional/languages.ts`, which Install Luft offers, and to `FORMATS` in `apps/settings/src/lib/panels/system/language/region/formats.ts`.
3. Add its file to the outputs of `kestrel-locales` in `kestrel/engine/ui/meson.build` and to `kestrel/engine/ui/kestrel.gresource.xml`.
4. Add its CEF locale to `languages` in `os/image/parts/stages/runtime.sh` if CEF ships one.
5. Create its folder with an empty file for every component, a glossary and a style guide. Weblate does the first step for new languages added there.

## Setting up Weblate

Translations happen on [Hosted Weblate](https://hosted.weblate.org) under its free plan for libre projects. Weblate reads the `.ftl` files from GitHub and sends changes back as pull requests.

1. Sign in to Hosted Weblate and ask for a libre project: **Add new translation project**, name **Luft**, URL slug `luft`, website `https://luft.computer`, and pick the **Libre** billing plan. Hosted Weblate reviews libre projects before they go public.
2. In the project's settings: translation license **GPL-3.0-or-later**, source language **English**, and under **Workflow** turn on **Translation review** if every change should be reviewed first.
3. Add the first component, **kestrel-desktop**, from **Add new translation component** → **From version control**:
   - Version control system: **GitHub pull request**
   - Source code repository: `https://github.com/Lantharos/Luft.git`, repository branch `main`
   - Repository browser: `https://github.com/Lantharos/Luft/blob/{{branch}}/{{filename}}#L{{line}}`
   - File format: **Fluent file**
   - File mask: `kestrel/ui/locales/*/desktop.ftl`
   - Monolingual base language file: `kestrel/ui/locales/en/desktop.ftl`, template for new translations left empty
   - Edit base file: off, so English only changes through the code
   - Language code style: **BCP style using hyphen as a separator**
   - Language filter: `^(?!sr-Latn$).*$`, since the Latin Serbian files are generated from the Cyrillic ones
   - License: **GPL-3.0-or-later**
4. Add every other component from the table above the same way, with **From existing component** → repository `weblate://luft/kestrel-desktop`, so they share one clone and one pull request. Name each component as in the table, with its file mask and its `en` file as the base.
5. Add a component named **Glossary**: file format **TermBase eXchange file**, file mask `packages/i18n/glossary/*.tbx`, no base file, and turn on **Use as a glossary**. Weblate then shows the agreed terms next to every string.
6. On GitHub, under the repository's **Settings → Webhooks**, add `https://hosted.weblate.org/hooks/github/` with content type `application/json` and the push event, so Weblate pulls new strings as soon as they land on `main`.
7. Weblate opens pull requests from its own fork. In the project's **Add-ons**, turn on **Squash Git commits** (per language) to keep them small.
8. Each pull request runs the checks workflow, which fails if a translation doesn't parse or uses a variable English doesn't have. A pull request that changes Serbian also needs `bun run transliterate` in `packages/i18n`, committed to its branch, before it passes.

Weblate doesn't remove messages from translations when they leave the English file, so whoever removes an English message removes it from every language in the same change; the checker insists on it.

## Moving translation files

Weblate finds each component's files through its file mask, so moving, renaming or adding `.ftl` files means updating `packages/i18n/components.json` and the component's file mask and base file in Weblate › Settings › Files together. Otherwise Weblate stops finding the files and raises a "No file mask matches" alert.

`bun run weblate` in `packages/i18n` compares the project's components on Hosted Weblate with `components.json` and the repository, and names every component whose file mask or base file differs, points at files that don't exist, or is missing on either side. The checks workflow runs it whenever a translation file or `components.json` changes. When Weblate can't be reached, it only warns, so an outage doesn't hold up a merge.

Hosted Weblate's documentation covers the details: [adding components](https://docs.weblate.org/en/latest/admin/projects.html), [the Fluent format](https://docs.weblate.org/en/latest/formats/fluent.html) and [continuous localization](https://docs.weblate.org/en/latest/admin/continuous.html).
