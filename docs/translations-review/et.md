# Estonian review list

Strings in Luft's Estonian translation that a native speaker should check. Each is listed because the term has no settled equivalent, the choice between competing words is a judgment call, or the grammar around a placeable may not fit every value.

## Terms and shared strings

- Every string: the move from teie to sina and from parool to salasõna was done by machine; read the whole translation once for verb forms and case endings.
- `packages/i18n/glossary/et.csv` `notification`: "teavitus" — Windows uses "teatis", phones often "märguanne"; check which reads most natural.
- `packages/i18n/glossary/et.csv` `snap`, `snap layout`, `snap group`: "paigutama", "paigutusmall", "paigutusrühm" — no settled Estonian term known; check against Windows 11's Estonian name for Snap layouts.
- `packages/i18n/glossary/et.csv` `tray`: "süsteemisalv" — check whether Windows' current Estonian term is better known.
- `packages/i18n/glossary/et.csv` `workspace`: "tööala" — check against GNOME's Estonian term.
- `packages/i18n/glossary/et.csv` `board`: "tahvel" — Luft-specific mode; check it reads as a canvas of windows and not a tablet.
- `packages/i18n/glossary/et.csv` `App Store`: "Rakendusepood" — "Rakenduste pood" is also common; check the spelling as one word.
- `packages/i18n/glossary/et.csv` `Install Luft`: "Lufti installimine" — check the genitive without apostrophe and the noun form as an app name.
- `packages/i18n/glossary/et.csv` `Night light`: "Öövalgus" — check against Windows' current Estonian name.
- `packages/i18n/glossary/et.csv` `Do Not Disturb`: "Ära sega" — Windows may say "Mitte segada"; check.
- `packages/i18n/glossary/et.csv` `Power saver`: "Energiasääst" — check it fits next to the other power modes.
- `docs/translations/et.md` Typography: inner quotes ‚…‘ — check against current EKI recommendation.
- `packages/web/ui/locales/et/ui.ftl` `ui-fingerprint-place`: "Aseta oma { $finger } andurile." — relies on the imperative object being nominative; check it reads naturally with every finger name.
- `packages/web/ui/locales/et/ui.ftl` `ui-finger-right-little`: "Parem väike sõrm" — "väikesõrm" is also used; check.
- `packages/web/ui/locales/et/ui.ftl` `ui-time-just-now`: "äsja" — shown where "N sekundit tagasi" would be; check it fits.
- `packages/web/ui/locales/et/ui.ftl` `ui-split-windows-size`: "{ $size }, kasutusel { $used }" — check word order.
- `kestrel/ui/locales/et/shell.ftl` `keys-backspace`, `keys-delete`, `keys-page-up`: English names kept — check what keyboards sold in Estonia print (possibly Del, PgUp).
- `kestrel/ui/locales/et/shell.ftl` `battery-level`: "Aku { $percentage }%, laeb" — check "laeb" versus "laadimisel".
- `apps/settings/locales/et/settings.ftl` `settings-subpage-back`: "Tagasi: { $page }" — colon keeps the page name in the nominative; check for screen readers.

## Kestrel and setup

- `kestrel/ui/locales/et/desktop.ftl` `task-view-desktop`: "Tööala { $number }" — English says "Desktop"; used the glossary's workspace term (tööala) because töölaud is the desktop background. Windows says "Töölaud 1"; check which reads better in All windows.
- `kestrel/ui/locales/et/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from } → { $to }" — used an arrow instead of "in" to keep the units uninflected; check that it reads well (and aloud for screen readers).
- `kestrel/ui/locales/et/system.ftl` `health-gpu-reset-body`: "Arvuti taaskäivitus iseenesest: { $date } kell { $time }." — colon keeps the date in the nominative; check it doesn't feel stiff.
- `kestrel/ui/locales/et/system.ftl` `privacy-indicator`: "Kasutusel: { $things }" — the privacy-thing items are nominative lowercase (kaamera, mikrofon, ekraan, asukoht, aknad); check the joined list reads naturally.
- `kestrel/ui/locales/et/portal.ftl` `portal-unknown-app-object`: "see rakendus" — all portal sentences put the app name in the nominative ("Kas { $appName } võib …?"), so both unknown-app forms are nominative; check the question form fits every title.
- `kestrel/engine/locales/et/engine.ftl` `auto-rotate-title`: "Automaatne pööramine" — may be long for a Quick settings tile.
- `kestrel/engine/locales/et/engine.ftl` `network-menu-tethers`: "Bluetoothi ühiskasutus" / `network-menu-tether`: "Ühiskasutus" — no settled Estonian term for Bluetooth tethering; check against what Estonian phones show.
- `kestrel/engine/locales/et/engine.ftl` `network-menu-hotspot`: "Kuumkoht { $name }" — check against Windows' "mobiilne kuumkoht" wording.
- `kestrel/engine/locales/et/engine.ftl` `switch-monitor-join`: "Laienda" — Windows' word for extending the desktop across displays; English says "Join Displays".
- `apps/setup/locales/et/setup.ftl` `setup-region-field-language`: "keele" — the three field names are genitive because they only appear as the object of "Tuvastasime { $guesses }"; check the whole built sentence.
- `apps/setup/locales/et/setup.ftl` `setup-windows-hibernated`: "… hoia all Shift-klahvi ja vali Lülita välja …" — should match the label of Shut down in Estonian Windows (possibly "Sule arvuti"); "kiirkäivitus" and "kettahaldus" should likewise match Windows.
- `apps/setup/locales/et/setup.ftl` `setup-destination-alongside-choice`: "Koos süsteemiga { $windows }" — built to keep "Windows 11" uninflected; check it reads well as an option title.
- `apps/setup/locales/et/setup.ftl` `setup-network-unavailable`: "Ühenduse saad luua hiljem paneelilt." — unclear which panel the English means; check in context.
- `kestrel/engine/locales/et/engine.ftl` `backlight-title`: "Klaviatuuri taustvalgustus" — matches the Power page in Settings but may clip on a Quick settings tile.

## Settings

- `apps/settings/locales/et/system.ftl` `settings-accounts-online`: "Iga konto on kaust sinu kodukaustas olevas kaustas Cloud …" — kept the folder name Cloud in English; check whether the folder is localized on disk and whether the double "kaust" reads well.
- `apps/settings/locales/et/connections.ftl` `settings-bluetooth-request-authorize`: "Kas lubada, et { $name } seotakse?" — built so the unnamed fallback „seade“ works; check it reads naturally with real device names.
- `apps/settings/locales/et/connections.ftl` `settings-bluetooth-request-display`: "Sidumine: { $name }" / "Koodi ootab { $name }. Tipi see seal sisse ja vajuta Enter." — rephrased to keep the name in the nominative; check fluency.
- `apps/settings/locales/et/connections.ftl` `settings-bluetooth-windows`: "Windowsis on seotud { $devices }." — $devices is a list ending in "ja veel 3"; check agreement with a single device vs. a list.
- `apps/settings/locales/et/connections.ftl` `settings-network-security-enterprise`: "Ettevõte" — Windows may show "Enterprise" or "Ettevõtte"; confirm the usual Estonian label.
- `apps/settings/locales/et/connections.ftl` `settings-network-ip-link-local`: "Ainult kohtvõrguaadress" — no settled term for link-local; check against GNOME/NetworkManager Estonian.
- `apps/settings/locales/et/connections.ftl` `settings-network-wireguard-keepalive`: "Elushoidmine" — check whether "Keepalive" is the more familiar label for Estonian users.
- `apps/settings/locales/et/devices.ftl` `settings-power-screen-off`: "Lülita ekraan välja pärast" — picker label followed by a nominative duration ("5 minutit"), as Windows does; confirm it reads acceptably.
- `apps/settings/locales/et/devices.ftl` `settings-power-charging-until-full`: "Laadimine, täislaadimiseni { $time }" — avoids "pärast" with a nominative duration; check fluency, also with "alla minuti".
- `apps/settings/locales/et/devices.ftl` `settings-dictation-engine-description`: "{ $engine }, keel: { $language }" — terse to keep the language name in the nominative; check it is clear.
- `apps/settings/locales/et/devices.ftl` `settings-keys-keypad`: "Numbriplokk { $key }" — may be long on shortcut labels; a shorter form like "Num { $key }" could be preferable.
- `apps/settings/locales/et/protection.ftl` `settings-privacy-screen-off-after`: "Pärast { $duration }" — assumes $duration arrives as a partitive phrase like „5 minutit“; check it reads naturally with the real value (genitive „5 minuti pärast“ would be more idiomatic but can't be built around a placeable).
- `packages/web/ui/locales/et/ui.ftl` `ui-passphrase-field`: "Paroolifraas" — used for passphrase everywhere, as in KDE; check it sits well next to „salasõna“ (GNOME Disks just says „parool“).
- `apps/settings/locales/et/protection.ftl` `settings-security-anti-cheat`: "Petmisvastase kaitsega mängud" — no settled Estonian term for anti-cheat; many gamers just say „anti-cheat“.
- `apps/settings/locales/et/system.ftl` `settings-users-fingerprint-remove-description`: "Edaspidi ei sobi { $finger } enam sisselogimiseks." — built so the finger name stays the nominative subject; check it reads naturally with every finger name.
- `apps/settings/locales/et/system.ftl` `settings-updates-switching-standard`: "Tavalise tõmmise allalaadimine…" — „tõmmis“ for system image; check whether „kujutis“ reads better.
- `apps/settings/locales/et/personalization.ftl` `settings-fonts-sample`: "Põdur Zagrebi tšellomängija-följetonist Ciqo külmetas kehvas garaažis" — the classic Estonian pangram; long, check it fits the preview.
- `apps/settings/locales/et/personalization.ftl` `settings-appearance-tint-teal`: "Sinakasroheline" and `settings-appearance-tint-slate`: "Hallikassinine" — check these color names fit the swatches' tooltips.
- `apps/settings/locales/et/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Pildid › Wallpapers" — the Wallpapers folder keeps its English name on disk; check that „Pildid“ matches the Estonian Pictures folder and that „Kodu“ in the cursors folder path matches how the home folder is shown.

## Website

- `web/site/locales/et/download.ftl` `download-meet-note`: "vali Lisateave ja seejärel Käivita ikkagi" — SmartScreen button labels not verified; check against Estonian Windows 11 („Käivita siiski“ is possible).
- `web/site/locales/et/home.ftl` `home-question-ready-answer`: "Öiseid järke", "öisest järgust" — no settled Estonian term for nightly builds.
- `web/site/locales/et/home.ftl` `home-meet-restart`: "Taaskäivita Lufti" — step heading for "Restart into Luft"; check the illative reads naturally.
- `web/site/locales/et/home.ftl` `home-motion-heading`: "Liigub nii, nagu peab." — free rendering of "It moves like it means it".

## Meet Luft

- `apps/meet/locales/et/meet.ftl` `ready-remove-description`, `working-packing`: "kolimiskast" — the moving box; check it reads naturally.
- `apps/meet/desktop/locales/et/desktop.ftl` `check-start-entries`, `problem-tidy`: "käivituskirje" — no settled Estonian term for a firmware boot entry.
- `apps/meet/desktop/locales/et/desktop.ftl` `check-fast-startup-on`, `ready-fast-startup-title`: "kiirkäivitus" — taken from Setup; check against Estonian Windows' name for Fast Startup.
- `apps/meet/desktop/locales/et/desktop.ftl` `check-space-short-windows`: "kettapuhastusega" — Disk Cleanup's Estonian name from memory.
- `apps/meet/locales/et/meet.ftl` `problem-check`, `hello-check`, `check-ready-title`: both platform variants say "arvuti", since Estonian Windows doesn't use "PC" here.
- `apps/meet/locales/et/meet.ftl` `room-places-label`: "Lufti asukohad" — screen-reader name of the list of places; "asukoht" may suggest a folder path rather than a place on a drive.
- `apps/meet/locales/et/meet.ftl` `luft-resize-title`: "Muuda Lufti ruumi suurust" — check it reads naturally as a row title.
- `apps/meet/locales/et/meet.ftl` `room-erase-understood`: "Saan aru, et osa sellest on BitLockeriga krüptitud ja seda ei saa taastada" — tick box label in the first person; check the tone fits.
