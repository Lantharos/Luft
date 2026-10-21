# Lithuanian review list

Strings in Luft's Lithuanian translation that a native speaker should check: terms where Lithuanian operating systems disagree or have no settled word, and wording that may clip or read stiffly.

## Terms and shared strings

- `packages/i18n/glossary/lt.csv` `Settings`: "Nustatymai" — Windows says "Parametrai"; confirm Nustatymai is what most people expect
- `packages/i18n/glossary/lt.csv` `Start`: "Pradžia" — follows Windows; check "meniu Pradžia" reads naturally in sentences
- `packages/i18n/glossary/lt.csv` `board`: "lenta" — no settled term for an endless window canvas; check it reads naturally next to "darbo sritis"
- `packages/i18n/glossary/lt.csv` `tray`: "sistemos dėklas" — KDE's term; Windows has used "pranešimų sritis"
- `packages/i18n/glossary/lt.csv` `snap`: "pritraukti" — check against the current Windows 11 Lithuanian term for Snap layouts
- `packages/i18n/glossary/lt.csv` `Keep awake`: "Neužmigti" — no OS precedent; check it reads as a quick settings tile
- `packages/i18n/glossary/lt.csv` `Night light`: "Naktinė šviesa" — Windows says "Naktinis apšvietimas"; chosen for length
- `packages/i18n/glossary/lt.csv` `Keyring`: "raktinė" — GNOME's term as remembered; confirm against current GNOME Lithuanian
- `packages/i18n/glossary/lt.csv` `firmware`: "programinė aparatinė įranga" — long; check it fits in labels
- `packages/i18n/glossary/lt.csv` `touchpad`: "jutiklinis kilimėlis" — Windows may say "jutiklinė planšetė"; check which people know
- `packages/i18n/glossary/lt.csv` `accessibility`: "Prieinamumas" — Windows, Android and iOS say "Pritaikymas neįgaliesiems"; chosen for length
- `packages/i18n/glossary/lt.csv` `System Monitor`: "Sistemos monitorius" — GNOME may use a different generic name
- `packages/i18n/glossary/lt.csv` `Media Viewer`: "Medijos žiūryklė" — no settled generic name
- `packages/ui/locales/lt/ui.ftl` `ui-window-maximize`: "Maksimizuoti" — check against Windows' title bar tooltips ("Padidinti" is also seen); same for "Minimizuoti"
- `packages/ui/locales/lt/ui.ftl` `ui-fingerprint-swipe`: "Perbraukite { $finger } per jutiklį." — check the accusative .inline forms fit this verb as well as "Uždėkite"
- `packages/ui/locales/lt/ui.ftl` `ui-fingerprint-duplicate`: "Šis pirštas skaitytuve jau įrašytas, tikriausiai per Windows ar kitą paskyrą." — check the "per" construction reads naturally
- `apps/settings/locales/lt/settings.ftl` `settings-subpage-back`: "Atgal: { $page }" — avoids declining the page name after "į"; check it sounds right to screen-reader users
- `apps/settings/locales/lt/pages.ftl` `settings-page-power`: "Maitinimas ir akumuliatorius" — Windows' title, but long for the sidebar
- `apps/settings/locales/lt/pages.ftl` `settings-page-mouse`: "Pelė ir jutiklinis kilimėlis" — long for the sidebar
- `kestrel/ui/locales/lt/shell.ftl` `keys-space`: "Tarpas" — every other key keeps its printed English label; confirm this mix is what Lithuanian users expect

## Kestrel and setup

- `kestrel/ui/locales/lt/desktop.ftl` `window-menu-close`: "[1] Uždaryti langą / *[other] Uždaryti visus langus" — used an exact [1] variant instead of [one], since [one] also covers 21, 31 …; check the app menu shows the right form.
- `kestrel/ui/locales/lt/portal.ftl` `usb-title`, `usb-description`: exact [1] variant for the same reason; check that is fine for device counts.
- `kestrel/ui/locales/lt/portal.ftl` `portal-unknown-app-subject`: "Programa" — all portal sentences were rebuilt as „Leisti, kad { $appName } …?“ so the name stays nominative; check they read naturally with both a real name and the stand-in.
- `kestrel/ui/locales/lt/system.ftl` `oom-closed-body`: "Uždaryta, nes kompiuteriui ėmė trūkti atminties. …" — neuter participle so it fits both an app (feminine) and a container (masculine); check it reads well under the title.
- `kestrel/ui/locales/lt/system.ftl` `dictation-unsupported-title`: "Diktavimas kalba { $language } …" — $language arrives in English for now (e.g. „kalba Japanese“).
- `kestrel/ui/locales/lt/system.ftl` `privacy-indicator`: "Naudojama: { $things }" — list items are nominative; check the joined list reads well.
- `kestrel/engine/locales/lt/engine.ftl` `network-menu-tethers`, `network-menu-tether`: "Bluetooth modemai", "Modemas" — no settled Lithuanian term for Bluetooth tethering; check against Android/GNOME.
- `kestrel/engine/locales/lt/engine.ftl` `auto-rotate-title`: "Automatinis pasukimas" — may clip on a quick settings tile.
- `kestrel/engine/locales/lt/engine.ftl` `display-change-title`: "Palikti šiuos nustatymus?" — shortened (dropped „ekrano“) to stay under 30 characters.
- `kestrel/engine/locales/lt/engine.ftl` `switch-monitor-join`: "Išplėsti" — Windows' word for extending the desktop across displays.
- `apps/setup/locales/lt/setup.ftl` `setup-region-intro-guessed`: "Pradėkime. Parinkome { $guesses }, tad …" — fields are accusative („kalbą“, „klaviatūrą“, „laiko juostą“) and each guess reads „… pagal jūsų kompiuterį“; check the assembled sentence.
- `apps/setup/locales/lt/setup.ftl` `setup-replace-keeps-accounts`: "[1] Kita joje esanti paskyra … / Dar { $count } paskyrų …" — exact [1] plus all four categories with „Dar“; check wording.
- `apps/setup/locales/lt/setup.ftl` `setup-replace-keeps-tools`: "… – prisijungus, Toolbox aplinkoje" — Toolbox kept as a name; check phrasing.
- `apps/setup/locales/lt/setup.ftl` `setup-account-full-name-example`: "Jonas Jonaitis" — the standard Lithuanian placeholder name.
- `apps/setup/locales/lt/setup.ftl` `setup-windows-hibernated`: "… naudojant spartųjį paleidimą …" and `setup-windows-bitlocker` "Disko tvarkymą": check these match current Windows Lithuanian names (Spartusis paleidimas, Disko tvarkymas).

## Settings

- `apps/settings/locales/lt/connections.ftl` `settings-bluetooth-request-unnamed`: "be pavadinimo" — the pairing sentences put a declined "įrenginys/įrenginį/įrenginiui" before { $name }, so an unnamed device reads "įrenginį be pavadinimo"; check this reads naturally in every pairing sentence.
- `apps/settings/locales/lt/connections.ftl` `settings-network-security-owe`: "Patobulintas atviras" — no settled Lithuanian term for Enhanced Open (OWE); check against Windows/Android.
- `apps/settings/locales/lt/connections.ftl` `settings-network-ip-link-local`: "Tik vietinis saitas" — check against GNOME/NetworkManager Lithuanian wording for link-local.
- `apps/settings/locales/lt/connections.ftl` `settings-network-router`: "Maršruto parinktuvas" — Windows' term, long for a field label; may clip.
- `apps/settings/locales/lt/connections.ftl` `settings-accounts-online` `.description`: "…aplankas, esantis aplanke Cloud jūsų namų aplanke…" — assumes the folder is literally named Cloud; three "aplankas" in a row is heavy.
- `apps/settings/locales/lt/connections.ftl` `settings-accounts-approve`: "išplėstinė duomenų apsauga" — check Apple's official Lithuanian name for Advanced Data Protection.
- `apps/settings/locales/lt/connections.ftl` `settings-bluetooth-visible-for`: "{ $minutes } minutę" (accusative of duration) — check it reads right as a standalone menu option.
- `apps/settings/locales/lt/connections.ftl` `settings-accounts-remove-note`: "Jūsų failai lieka tarnyboje { $provider }." — "tarnyboje" for a cloud service; check it sounds natural for OneDrive, iCloud Drive etc.
- `apps/settings/locales/lt/devices.ftl` `settings-dictation-engine-description`: "{ $engine } atpažįsta šią kalbą: { $language }" — Lithuanian language names arrive as "anglų", so the sentence is built around a colon; same for `settings-dictation-language-unavailable` and `settings-dictation-engine-graphics-card`.
- `apps/settings/locales/lt/devices.ftl` `settings-dictation-hold`: "Diktuokite laikydami { $keys }" — needs { $keys } in the accusative; `settings-dictation-copilot-key` is "Copilot klavišą" for that reason, and a joined list such as "Super+Alt arba Copilot klavišą" should still read correctly.
- `apps/settings/locales/lt/devices.ftl` `settings-power-screen-off`: "Laikas iki ekrano išjungimo" — rephrased so the duration picker values (nominative "5 minutės") fit; check the label.
- `apps/settings/locales/lt/devices.ftl` `settings-power-long-sleep-hours`: "{ $hours } valandos" (genitive after "Išjungti po") — days and weeks likewise; these only work after "po".
- `apps/settings/locales/lt/devices.ftl` `settings-keys-keypad`: "Num { $key }" — no settled Lithuanian name for number-pad keys in shortcut labels.
- `apps/settings/locales/lt/protection.ftl` `settings-privacy-screen-off-after`: "Po: { $duration }" — "po" needs the genitive ("po 5 minučių") but the duration arrives in an unknown case, so a colon was used; check whether it reads acceptably or the duration format allows a natural phrase.
- `apps/settings/locales/lt/protection.ftl` `settings-encryption-passphrase-field`: "Slaptafrazė" — used throughout for "passphrase" (GNOME's term) to keep it distinct from "slaptažodis"; confirm it is understood.
- `apps/settings/locales/lt/protection.ftl` `settings-passwords-seal-title`: "Užplombuoti saugos lustu" — "seal" has no settled OS term; check "užplombuoti" vs "užsandarinti".
- `apps/settings/locales/lt/protection.ftl` `settings-security-anti-cheat`: "Žaidimai su apsauga nuo sukčiavimo" — anti-cheat has no settled term; gamers may just say "anti-cheat".
- `apps/settings/locales/lt/protection.ftl` `settings-passwords-ssh-added`: "Pridėtas { $when }" — assumes the relative time reads as "prieš 3 dienas" / "vakar"; same for `settings-passkeys-last-used`, `settings-updates-last-checked`, `settings-updates-released`.
- `apps/settings/locales/lt/system.ftl` `settings-updates-switching-standard`: "Atsisiunčiamas standartinis atvaizdis…" — "atvaizdis" for a system image; check it is the expected word.
- `apps/settings/locales/lt/system.ftl` `settings-datetime-week-start-regional`: "Pagal jūsų regioną: { $day }" — reordered so the lowercase weekday name doesn't start the label.
- `apps/settings/locales/lt/system.ftl` `settings-about-hostname`: "Kompiuterio vardas" — sits next to "Įrenginio pavadinimas"; check the two are distinct enough.
- `apps/settings/locales/lt/personalization.ftl` `settings-fonts-sample`: "Įlinkdama fechtuotojo špaga sublykčiojusi pragręžė apvalų arbūzą" — common Lithuanian pangram; check it is the preferred one.
- `apps/settings/locales/lt/personalization.ftl` `settings-accessibility-bounce-keys`: "Atmetimo klavišai" — no settled Lithuanian term for bounce keys.

## Website

- `web/site/locales/lt/download.ftl` `download-meet-note`: "pasirinkite Daugiau informacijos, tada Vis tiek vykdyti" — SmartScreen button labels not verified; check against Lithuanian Windows 11.
- `web/site/locales/lt/home.ftl` `home-question-ready-answer`: "Naktinės versijos" — no settled Lithuanian term for nightly builds.
- `web/site/locales/lt/download.ftl` `download-meet-for-windows`: "Atsisiųsti Meet Luft <span>skirtą Windows</span>" — check the agreement of "skirtą" with Meet Luft.
- `web/site/locales/lt/home.ftl` `home-start-heading`: "Pradžia žino, kur kas yra." — Start as a bare subject (Pradžia) at the start of a heading; check it's understood as the menu.

## Meet Luft

- `apps/meet/locales/lt/meet.ftl` `ready-remove-description`, `working-packing`: "persikraustymo dėžė" — the moving box; check it reads naturally.
- `apps/meet/desktop/locales/lt/desktop.ftl` `check-start-entries`, `problem-tidy`: "paleidimo įrašas" — no settled Lithuanian term for a firmware boot entry.
- `apps/meet/desktop/locales/lt/desktop.ftl` `check-space-short-windows`, `drive-hide-failed`, `check-encryption-changing-detail`: "Disko valymą", "Failų naršyklės", "Parametruose" — Windows names from memory; check against Lithuanian Windows 11.
- `apps/meet/locales/lt/meet.ftl` `stick-keep`: "Palikti abi", "Palikti visas" — feminine, agreeing with "Luft" as a system.
- `apps/meet/locales/lt/meet.ftl` `problem-check`, `hello-check`: both platform variants say "kompiuteris".
- `apps/meet/locales/lt/meet.ftl` `room-places-title`: "Kur įdiegti Luft?" — the English asks where Luft should go; "įdiegti" is used because Luft is installed there afterwards, but at this step it is only tried. Check against "Kur dėti Luft?".
- `apps/meet/locales/lt/meet.ftl` `resize-least`: "Pakeiskite bent { $size }." — check it reads as "by at least" and not "to at least".

## Install Luft

- `apps/setup/locales/lt/setup.ftl` `setup-destination-meet-drive-description`: "o Luft pasileidžia iš ten su savo paleidimo failais" — reflexive verb chosen so it needs no gender agreement with Luft; check it doesn't read too informal next to "sistema Luft" elsewhere.
