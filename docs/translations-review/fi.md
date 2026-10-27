# Finnish review list

Strings in Luft's Finnish translation that a native speaker should check. Each is listed because the term has no settled Finnish equivalent, the English is ambiguous, or the wording around a placeable may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/fi.csv` `snap`: "telakoida", with "ikkuna-asettelu" and "ikkunaryhmä" — Windows uses kiinnittää for both pin and snap; check that telakoida reads naturally for putting a window into half of the screen.
- `packages/i18n/glossary/fi.csv` `board`: "taulu" — a new feature with no established Finnish word; check it isn't confused with a spreadsheet table or a Kanban board.
- `packages/i18n/glossary/fi.csv` `tray`: "ilmaisinalue" — Windows' older term for the notification area; check it fits a button that holds background apps.
- `packages/i18n/glossary/fi.csv` `security`: "suojaus" — chosen to match Windows and suojaussiru; tietoturva may be what people expect as a Settings page name.
- `packages/i18n/glossary/fi.csv` `sandbox`: "hiekkalaatikko" — check it is understood by ordinary users, not only developers.
- `packages/i18n/glossary/fi.csv` `turn on`, `turn off`: "ottaa käyttöön", "poistaa käytöstä" — check against "kytkeä päälle/pois" for radios and hardware.
- `kestrel/ui/locales/fi/shell.ftl` `keys-shift`, `keys-tab`, `keys-space`, `keys-backspace`: "Vaihto", "Sarkain", "Välilyönti", "Askelpalautin" — follow Microsoft's Finnish shortcut names; Finnish keyboards mostly print arrows on these keys, so check that people prefer these to Shift and Tab.
- `kestrel/ui/locales/fi/shell.ftl` `keys-delete`, `keys-insert`, `keys-home`, `keys-end`, `keys-page-up`, `keys-page-down`, `keys-print-screen`: kept in English as printed on Finnish keyboards — check against the abbreviations (Del, Ins, PgUp, PrtSc) some keyboards print.
- `kestrel/ui/locales/fi/shell.ftl` `battery-level`: "Akku { $percentage } %, kytketty verkkovirtaan" — the plugged-in state without charging; check that it doesn't suggest charging.
- `packages/web/ui/locales/fi/ui.ftl` `ui-fingerprint-swipe`: "Vedä { $finger } anturin yli." — the finger name stays in the nominative; check that "vedä" reads right for swipe readers, against "pyyhkäise … sormella", which would need another case.
- `packages/web/ui/locales/fi/ui.ftl` `ui-media-pause`: "Keskeytä" — some players say "Tauko"; check which is expected.
- `packages/web/ui/locales/fi/ui.ftl` `ui-split-space`: "Tila Luftille" — slider label for disk space; check against "Luftin tila", which may read as a status.
- `packages/web/ui/locales/fi/ui.ftl` `ui-recovery-key-label`: "Palautusavain { $key }" — read out by screen readers before the key itself.
- `apps/settings/locales/fi/settings.ftl` `settings-subpage-back`: "Takaisin sivulle { $page }" — keeps the page name in the nominative; check it reads naturally with every panel title.
- `apps/settings/locales/fi/settings.ftl` `settings-more-show`: "Näytä { $count } lisää" — same in both plural forms; check it fits every list it ends.
- `packages/web/settings-pages/locales/fi/pages.ftl` `settings-page-appearance`: "Ulkoasu" — GNOME's word; Windows says Mukauttaminen.
- `packages/web/settings-pages/locales/fi/pages.ftl` `settings-page-security`: "Suojaus" — see the glossary note on security.
- `packages/web/settings-pages/locales/fi/pages.ftl` `settings-page-cursors`: "Osoitinteemat" — the page holds mouse cursor themes; check against "Kohdistinteemat".
- `packages/web/settings-pages/locales/fi/pages.ftl` `settings-page-accessibility` `.keywords`: the Finnish names of sticky, slow, bounce and mouse keys and of dwell click vary between Windows and GNOME; check that the common ones are there.

## Kestrel and setup

- `kestrel/ui/locales/fi/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from } yksikkönä { $to }" — check that this reads naturally with unit symbols (e.g. "5 km yksikkönä mi"); an arrow might be clearer.
- `kestrel/ui/locales/fi/surfaces.ftl` `start-search-settings-section`: "Asetukset: { $page }" — built this way to keep the page name in the nominative; check it reads well as a search result description.
- `kestrel/ui/locales/fi/surfaces.ftl` `quick-settings-on`, `quick-settings-off`: "Päällä", "Pois" — also used for every on/off state in Settings; check they read well as tile subtitles and picker options.
- `kestrel/ui/locales/fi/auth.ftl` `lock-screen-dwell-click`: "Viivenapsautus" — no settled term; the Settings switch for the same feature says "Napsauta pysäyttämällä osoitin".
- `kestrel/ui/locales/fi/system.ftl` `network-menu-tethers`, `network-menu-tether`: "Bluetooth-jakoyhteydet", "Jakoyhteys" — no settled Finnish term for Bluetooth tethering.
- `kestrel/ui/locales/fi/system.ftl` `network-menu-mobile`: "Mobiiliverkko" — tile title for mobile broadband; check it fits the tile width.
- `kestrel/ui/locales/fi/desktop.ftl` `switch-monitor-mirror`, `switch-monitor-join`: "Monista", "Laajenna" — Windows' terms for duplicate and extend; check they fit here.
- `kestrel/ui/locales/fi/shell.ftl` `ctrl-alt-tab-panel`: "Tehtäväpalkki" — English says "Panel"; translated as the taskbar it refers to.
- `kestrel/ui/locales/fi/system.ftl` `dictation-unsupported-body`: "…puheentunnistinta, jota { $language } vaatii." — the language name may arrive in English (e.g. "Japanese"), so the sentence may read oddly.
- `kestrel/ui/locales/fi/system.ftl` `peek-error-launch-not-started-by-peek`: "Käynnistää voi vain ohjelman, jonka peek run on itse käynnistänyt" — the English is ambiguous; check the intended meaning.
- `apps/setup/locales/fi/setup.ftl` `setup-destination-alongside-choice`: "{ $windows } -järjestelmän rinnalle" — compound used to keep "Windows 11" in the nominative; check it doesn't feel heavy.
- `apps/setup/locales/fi/setup.ftl` `setup-region-intro-guessed`: "Valmiiksi pääteltiin { $guesses }, …" with parts like "kieli tietokoneen perusteella" — check that the joined list reads naturally.
- `apps/setup/locales/fi/setup.ftl` `setup-windows-hibernated`, `setup-windows-fast-startup`: "nopea käynnistys" — Windows' Finnish name for Fast Startup; check it matches current Windows wording.

## Settings

- `apps/settings/locales/fi/connections.ftl` `settings-network-metered-yes`, `settings-network-metered-no`: "Laskutettava", "Ei laskutettava" — shortened from "Käytön mukaan laskutettava"; check the options read clearly under the row title.
- `apps/settings/locales/fi/connections.ftl` `settings-network-security-owe`: "Parannettu avoin" — no settled Finnish term for Enhanced Open (OWE); check against Windows and Android.
- `apps/settings/locales/fi/connections.ftl` `settings-network-ip-ignore`: "Ei hallita" — check it reads naturally as a picker option.
- `apps/settings/locales/fi/connections.ftl` `settings-bluetooth-request-confirm`: "Muodostetaanko pariliitos: { $name }?" — with the unnamed fallback this reads "…: laite?"; check it's acceptable.
- `apps/settings/locales/fi/connections.ftl` `settings-bluetooth-request-display`: the description leaves out { $name } ("Kirjoita tämä koodi laitteella ja paina sitten Enter.") because the title already names the device and no inflected form fits the unnamed fallback.
- `apps/settings/locales/fi/system.ftl` `settings-accounts-online`: "…kotikansiosi Cloud-kansiossa…" — assumes the folder is named Cloud on disk; check.
- `apps/settings/locales/fi/devices.ftl` `settings-sound-output`, `settings-sound-input`: "Ulostulo", "Sisääntulo" — GNOME's words, also used in quick settings; Windows 11 may use others.
- `apps/settings/locales/fi/devices.ftl` `settings-power-charging-until-full`: "Latautuu, aikaa täyteen { $time }" — built so the duration stays in the nominative; check "alle minuutin" reads well here and in "Noin { $time } jäljellä".
- `apps/settings/locales/fi/devices.ftl` `settings-power-screen-off`: "Näytön sammutus" — a noun label instead of "Turn off the screen after", with durations as options; check it reads well with "Ei koskaan".
- `apps/settings/locales/fi/devices.ftl` `settings-keys-keypad`: "Num { $key }" — check what Finnish keyboards and Windows call number pad keys.
- `apps/settings/locales/fi/devices.ftl` `settings-keys-eject`: "Poista levy" — check against the usual Finnish name of the eject key.
- `apps/settings/locales/fi/personalization.ftl` `settings-fonts-sample`: "Viekas kettu punaturkki laiskan koiran takaa kurkki" — the familiar Finnish counterpart of the English sample, but it has no ä or ö; check whether a sample with them is preferred.
- `apps/settings/locales/fi/personalization.ftl` `settings-appearance-wallpaper-span`: "Laajenna näyttöjen yli" — Windows says just "Laajenna"; check it reads well as a fit option.
- `apps/settings/locales/fi/personalization.ftl` `settings-taskbar-look-solid`: "Peittävä" — opaque taskbar background; "Kiinteä" is the alternative.
- `apps/settings/locales/fi/personalization.ftl` `settings-appearance-tint-slate`: "Siniharmaa" — slate has no common Finnish color name.
- `apps/settings/locales/fi/personalization.ftl` `settings-accessibility-bounce-keys`, `settings-accessibility-bounce-keys-delay`: "Toistuvien painallusten esto", "Toistuvien painallusten viive" — no settled Finnish term for bounce keys, and long for labels.
- `apps/settings/locales/fi/personalization.ftl` `settings-accessibility-dwell-time`: "Pysäytysaika" — label before a duration slider; check it's understood as how long the pointer must rest.
- `apps/settings/locales/fi/personalization.ftl` `settings-accessibility-typing-assist-count`: "Pois", "{ $count } päällä" — check the count reads naturally as a row summary.
- `apps/settings/locales/fi/protection.ftl` `settings-privacy-screen-off-after`: "Kun { $duration } on kulunut" — built so the duration stays in the nominative; check it reads naturally with "1 minuutti" and "5 minuuttia".
- `apps/settings/locales/fi/protection.ftl` `settings-passwords-history-signed`: "{ $app } allekirjoitti kohteella ”{ $item }”" — "kohteella" is vague; the item is normally a key.
- `apps/settings/locales/fi/system.ftl` `settings-updates-switching-standard`: "Ladataan vakiokuvaa…" — the standard system image (without NVIDIA's driver); check it's clear.
- `apps/settings/locales/fi/system.ftl` `settings-users-fingerprint-remove-description`: "Tämän jälkeen { $finger } ei enää kelpaa kirjautumiseen." — relies on the .inline finger name in the nominative.

## Website

- `web/site/locales/fi/download.ftl` `download-meet-note`: "valitse Lisätietoja ja sitten Suorita silti" — SmartScreen button labels from memory; check against current Finnish Windows 11.
- `web/site/locales/fi/home.ftl` `home-question-ready-answer`: "Yökäännöksiä", "yökäännösten päivitykset" — no settled Finnish term for nightly builds; "yöversio" is the alternative.
- `web/site/locales/fi/home.ftl` `home-motion-heading`: "Liikettä, jossa on tarkoitus." — free rendering of "It moves like it means it"; check it sounds natural as a heading.
- `web/site/locales/fi/site.ftl` `site-footer-photos`: "Kuvat: { $photographers }, Unsplash." — built so the joined list of names stays in the nominative.

## Meet Luft

- `apps/meet/locales/fi/meet.ftl` `ready-remove-description`, `working-packing`: "muuttolaatikko" — the moving box; check it reads naturally as a name for the packed data.
- `apps/meet/desktop/locales/fi/desktop.ftl` `check-start-entries`, `problem-tidy`: "käynnistysmerkintä" — no settled Finnish term for a firmware boot entry.
- `apps/meet/desktop/locales/fi/desktop.ftl` `check-space-short-windows`: "Levyn puhdistuksella" — Disk Cleanup's Finnish name from memory; check against current Windows.
- `apps/meet/locales/fi/meet.ftl` `stick-none`, `stick-erase-description`: "vähintään { $size }:n USB-tikku" — genitive ending added after the size placeable ("4 Gt:n"); check it reads well.
- `apps/meet/desktop/locales/fi/desktop.ftl` `check-secure-boot-turn-on`: "painamalla { $key }, kun valmistajan { $maker } logo tulee näkyviin" — the volume-up key name is written in the partitive to fit; check the sentence with both key forms.
- `apps/meet/locales/fi/meet.ftl` `problem-check`, `hello-check`: Windows variants say "PC", Linux "tietokone", following the English; Finnish Windows mostly says "tietokone", so both could be the same.
- `apps/meet/locales/fi/meet.ftl` `room-place-whole-detail`, `room-erase-description`, `room-erase-empty`: "tämän { $size }:n levyn" — genitive ending added after the size placeable, as on the stick screens; check it reads well with every unit.
- `apps/meet/locales/fi/meet.ftl` `luft-title`: "Luftisi" — possessive suffix on the name; check it doesn't feel odd as a page title, against "Oma Luft".
- `apps/meet/locales/fi/meet.ftl` `luft-resize-title`: "Muuta Luftin kokoa" — shorter than the English "Change how much space Luft has"; check it is clear that it's about disk space.

## Install Luft

- `apps/setup/locales/fi/setup.ftl` `setup-destination-meet-drive-choice-description`, `setup-confirm-meet-drive-title`: "levylle { $drive }" — the drive name stands uninflected after "levylle"; check it reads naturally with names like "Samsung SSD 980".
