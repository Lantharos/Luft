# Danish review list

Strings in Luft's Danish translation that a native speaker should check: terms with no settled Danish equivalent and wording that might read stiffly or clip.

## Terms and shared strings

- `packages/i18n/glossary/da.csv` `snap`: "docke, docklayout, dockgruppe" — Windows uses »fastgøre« for both snap and pin; check whether »docke« reads naturally or another verb is better.
- `packages/i18n/glossary/da.csv` `board`: "tavle" — check it reads as the endless-canvas mode, not a whiteboard app.
- `packages/i18n/glossary/da.csv` `notification`: "notifikation" — chosen over Windows' »meddelelse«; check it feels right throughout the desktop.
- `packages/i18n/glossary/da.csv` `tray`: "systembakke" — Windows' Danish label differs; check it is understood.
- `packages/i18n/glossary/da.csv` `Power saver`: "Strømbesparelse" — Windows' Danish power modes use longer phrases; check it sits well next to the other modes.
- `packages/i18n/glossary/da.csv` `App Store`: "Appbutik" — generic name of Schelf; check against »App Store«-style usage people know.
- `packages/i18n/glossary/da.csv` `sign in`: "log ind / log ud" — chosen over Windows' »log på / log af«.
- `kestrel/ui/locales/da/shell.ftl` `keys-backspace`: "Tilbage" — Danish keyboards print an arrow; check whether »Backspace« is the more familiar shortcut label.
- `kestrel/ui/locales/da/shell.ftl` `keys-shift`: "Skift" — Microsoft's Danish name; check it against what keyboards and people use.
- `packages/ui/locales/da/ui.ftl` `ui-fingerprint-retry`: "Det kunne ikke aflæses ordentligt. Prøv igen." — check it sounds natural.
- `packages/ui/locales/da/ui.ftl` `ui-toast-dismiss`: "Afvis" — screen-reader label for closing a notification bubble; »Luk« may be clearer.
- `apps/settings/locales/da/settings.ftl` `settings-more-show`: "Vis { $count } mere" — check »mere« vs »til« after a number.

## Kestrel and setup

- `kestrel/ui/locales/da/desktop.ftl` `window-menu-unmaximize`: "Afmaksimer" — GNOME's word; check it reads naturally, the alternative is "Gendan størrelse".
- `kestrel/ui/locales/da/surfaces.ftl` `notifications-more`: "{ $count } mere" — follows settings-more-show; strictly "flere" is the count form, check which is preferred.
- `kestrel/ui/locales/da/surfaces.ftl` `start-search-settings-section`: "Indstillinger for { $page }" — $page keeps its capital (Udseende); check it reads fine in search results.
- `kestrel/ui/locales/da/system.ftl` `privacy-indicator`: "Bruger { $things }" — list items carry their own article or possessive (kameraet, mikrofonen, din placering, dine vinduer) to avoid gender clashes; check the mix reads well.
- `kestrel/engine/locales/da/engine.ftl` `screenshot-source`: "Skærmbilleder" — source name for screenshot and recording notifications; skærmoptagelse is reserved for screen recording.
- `kestrel/engine/locales/da/engine.ftl` `screenshot-capture`: "Tag" — shutter button for both screenshots and recordings; check it fits in recording mode.
- `kestrel/engine/locales/da/engine.ftl` `switch-monitor-join`: "Udvid" — Windows' word for extending the desktop across displays, not a literal "join".
- `kestrel/engine/locales/da/engine.ftl` `inhibit-shortcuts-title`: "Tillad overtagelse af genveje" — "inhibit" rendered as the app taking over system shortcuts; check the meaning.
- `kestrel/engine/locales/da/engine.ftl` `mount-hidden-volume`: "Skjult diskenhed" — volume as diskenhed (Windows); VeraCrypt users may expect "volumen".
- `apps/setup/locales/da/setup.ftl` `setup-region-guess-from-computer`: "{ $fields } ud fra din computer" — the field names carry their possessive (dit sprog, din tidszone) because sprog/tastatur and tidszone differ in gender; check the joined sentence.
- `apps/setup/locales/da/setup.ftl` `setup-account-full-name-example`: "Karen Blixen" — chosen as a well-known Danish name.
- `apps/setup/installer/locales/da/installer.ftl` `installer-no-deployment`: "Det nye system har ingen udrulning" — technical ostree term with no settled Danish word.

## Settings

- `apps/settings/locales/da/devices.ftl` `settings-sound-mute`: "Slå lyden fra: { $name }" — a colon construction so it works for both "Lydstyrke" and app names; check it reads acceptably for screen readers.
- `apps/settings/locales/da/connections.ftl` `settings-bluetooth-request-authorize`: ".description = { $name } vil kunne …" — when the device is unnamed this starts a sentence with lowercase "enheden" (same in English).
- `apps/settings/locales/da/connections.ftl` `settings-network-security-owe`: "Udvidet åben" — no settled Danish term for Enhanced Open (OWE); Windows may keep it in English.
- `apps/settings/locales/da/connections.ftl` `settings-network-security-enterprise`: "Virksomhed" — check against how Windows labels WPA Enterprise in Danish.
- `apps/settings/locales/da/connections.ftl` `settings-network-wireguard-addresses`: "Denne computers adresser i VPN-forbindelsen" — avoided "VPN'et" because the style guide limits apostrophes; check it sounds natural.
- `apps/settings/locales/da/system.ftl` `settings-accounts-kept`: "{ $count } elementer gemt lokalt, resten hentes ved åbning" — "kept" rendered as "gemt lokalt"; confirm it matches the Accounts wording elsewhere.
- `apps/settings/locales/da/devices.ftl` `settings-keys-keypad`: "Numerisk { $key }" — Windows writes e.g. "Num 5"; check which a Danish user expects.
- `apps/settings/locales/da/devices.ftl` `settings-dictation-credits`: "Tak til" — heading for model credits; "Kreditering" is the alternative.
- `apps/settings/locales/da/personalization.ftl` `settings-fonts-sample`: "Quizdeltagerne spiste jordbær med fløde, mens cirkusklovnen Walther spillede på xylofon" — classic Danish pangram; check it isn't too long for the font preview rows (English is much shorter).
- `apps/settings/locales/da/personalization.ftl` `settings-appearance-style`: "Tilstand" — the Light/Dark row, named after the Mørk tilstand tile and as Windows does; English says "Style".
- `apps/settings/locales/da/personalization.ftl` `settings-appearance-icons-clear`: "Klar" — icon style meaning glass-like/transparent; check it doesn't read as "ready".
- `apps/settings/locales/da/personalization.ftl` `settings-appearance-wallpaper-tile`: "Fliselæg" — check against the Danish Windows/GNOME wording for the tile fit option.
- `apps/settings/locales/da/personalization.ftl` `settings-accessibility-sticky-keys` / `slow-keys` / `bounce-keys`: "Klæbende taster", "Langsomme taster", "Afvisningstaster" — GNOME's Danish names, also used in the keyboard notifications; Windows calls Sticky Keys »Træge taster« and Filter Keys »Filtertaster«, check which Danes recognise.
- `apps/settings/locales/da/personalization.ftl` `settings-accessibility-pointing`: "Mus og markør" — section heading for pointing aids; English "Pointing" has no settled Danish noun.
- `apps/settings/locales/da/personalization.ftl` `settings-fonts-styles`: "{ $count } snit" — "snit" is the typographer's word for a font style; check it's understood by ordinary users.
- `apps/settings/locales/da/protection.ftl` `settings-encryption-passphrase-field`: "Adgangsfrase" — used in setup and Settings to stay distinct from "adgangskode"; no settled OS term, check it.
- `apps/settings/locales/da/system.ftl` `settings-updates-variant-standard`: "Skift til standardudgaven" — "standard image" rendered as "standard edition" here and in the installer's errors, to avoid "aftryk"; check it fits the NVIDIA/standard choice.
- `apps/settings/locales/da/system.ftl` `settings-datetime-week-start-regional`: "{ $day }, ifølge dit område" — assumes $day arrives as a lowercase weekday that reads fine at the start of the label.

## Website

- `web/site/locales/da/home.ftl` `home-security-sealed-text`: "Hele systemet er ét signeret aftryk" — the style guide avoids "aftryk", but "udgave" doesn't carry "signed image" here; check for a better word.
- `web/site/locales/da/home.ftl` `home-app-mailman-detail`: "en sortering af nye afsendere" — "screener" has no settled Danish term.
- `web/site/locales/da/home.ftl` `home-question-ready-answer`: "Natlige builds … en natlig build" — check the gender of "build" and whether "nightly-builds" is more familiar.

## Meet Luft

- `apps/meet/locales/da/meet.ftl` `ready-update-title`: "Hent den nyeste Luft" — a build of Luft is treated as common gender (»den nyeste Luft«, »den nye Luft«) while the system itself is »det«; check it doesn't jar.
- `apps/meet/locales/da/meet.ftl` `meet-nightly`: "Natlige builds" — same open question as on the website: gender of »build« and whether »nightly builds« is more familiar.
- `apps/meet/locales/da/meet.ftl` `problem-room`: "Arbejdet med at gøre plads til Luft blev ikke færdigt." — English "Making room … didn't finish" has no neat Danish noun; check for something shorter.
- `apps/meet/locales/da/meet.ftl` `check-tidy-title`: "Vil du fjerne de gamle startposter?" — "start entry" rendered as »startpost«; check that Danes recognise it next to »bootpost« or »boot-indgang«.
- `apps/meet/locales/da/meet.ftl` `box-folder-downloads`: "Overførsler" — Windows' Danish name for the Downloads folder; check it is still what current Windows 11 shows.
- `apps/meet/desktop/locales/da/desktop.ftl` `check-secure-boot-off-detail`: "spil med anti-snyd kræver det" — »anti-cheat« is often left in English by Danish gamers.
- `apps/meet/desktop/locales/da/desktop.ftl` `drive-volume-missing`: "Diskenheden { $path } blev ikke fundet" — »volume« as Windows' »diskenhed«; check it reads naturally in these error lines.
- `apps/meet/locales/da/meet.ftl` `luft-title`: "Dit Luft" — the installed system as neuter, while a build is »den nyeste Luft«; check the gender doesn't jar next to it.
