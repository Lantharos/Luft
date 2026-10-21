# Polish review list

Strings in Luft's Polish translation that a native speaker should check, each listed because the term has no settled equivalent, the grammar around a placeable may not fit every value, or the wording may clip.

## Terms and shared strings

- `packages/i18n/glossary/pl.csv` `board`: "tablica" — no established Polish term for this canvas mode; check it doesn't read as a whiteboard or notice board.
- `packages/i18n/glossary/pl.csv` `Night light`: "Oświetlenie nocne" — Windows' term, longer than GNOME's "Nocne światło"; check it fits a Quick settings tile.
- `packages/i18n/glossary/pl.csv` `Keep awake`: "Nie usypiaj" — no settled term; check it reads naturally as a tile label.
- `packages/i18n/glossary/pl.csv` `security chip`: "procesor zabezpieczeń" — Windows' name for the TPM, though it is technically a chip, not a processor; check people recognize it.
- `packages/i18n/glossary/pl.csv` `Keyring`: "pęk kluczy" — macOS' term for Keychain; GNOME users may know "baza kluczy".
- `packages/i18n/glossary/pl.csv` `signed startup`: "podpisane uruchamianie" — no established term; check it doesn't read oddly next to Secure Boot.
- `packages/i18n/glossary/pl.csv` `security`: "bezpieczeństwo" — Windows names its page "Zabezpieczenia"; check which reads better as the Settings page name.
- `packages/i18n/glossary/pl.csv` `remove`, `delete`: both "usunąć" — Polish has no common pair; check the cases where both appear on one screen.
- `packages/ui/locales/pl/ui.ftl` `ui-fingerprint-place`: "Przyłóż { $finger } do czytnika." — relies on .inline being accusative, which equals the nominative for every finger name; check it reads naturally.
- `packages/ui/locales/pl/ui.ftl` `ui-toast-dismiss`: "Odrzuć" — Windows' word for dismissing a notification; "Zamknij" is the alternative.
- `apps/settings/locales/pl/settings.ftl` `settings-subpage-back`: "Wróć do strony { $page }" — $page stays in the nominative after "strony"; check it reads well with titles like "Zasilanie i bateria".
- `apps/settings/locales/pl/pages.ftl` `settings-page-display`: "Ekrany" — plural because there can be several; Windows says "Ekran".
- `kestrel/ui/locales/pl/shell.ftl` `keys-delete`: "Delete" — many Polish keyboards print "Del"; check which is more familiar in shortcut labels.

## Kestrel and setup

- `kestrel/ui/locales/pl/portal.ftl` `portal-unknown-app-object`: "aplikacja" — kept in the nominative so every "object" sentence (usb-title, screen-share-title, portal-account-title, shortcuts-consent-*, input-capture, remote-desktop-title) is built as "Czy { $appName } może…"; check these read naturally with both a real app name and the fallback.
- `kestrel/ui/locales/pl/portal.ftl` `screen-share-title`: "Czy { $appName } może widzieć twój ekran?" — rephrased from "Share your screen with …?" to avoid declining the app name; check it still reads as a sharing request.
- `kestrel/ui/locales/pl/system.ftl` `dictation-unsupported-title`: "Język { $language } nie jest dostępny do dyktowania na tym komputerze" — $language currently arrives in English ("Japanese"); built in the nominative so a future Polish name fits too.
- `kestrel/ui/locales/pl/system.ftl` `oom-closed-body`: "Na komputerze kończyła się pamięć. Zamknięcie pozwoliło zachować płynne działanie reszty systemu." — rephrased to avoid gender agreement with an app or container.
- `kestrel/ui/locales/pl/surfaces.ftl` `quick-settings-on`: "Włączone" — neuter used generically for tiles of any gender (Bluetooth, Tryb samolotowy, Oświetlenie nocne).
- `kestrel/ui/locales/pl/surfaces.ftl` `start-search-settings-section`: "Ustawienia: { $page }" — check it fits as a search result description.
- `kestrel/engine/locales/pl/engine.ftl` `auto-rotate-title`: "Autoobracanie" — short tile title; GNOME says "Automatyczne obracanie", which may clip.
- `kestrel/engine/locales/pl/engine.ftl` `network-menu-tethers`: "Tethering przez Bluetooth" — no settled Polish term; Windows and Android also use "tethering".
- `apps/setup/locales/pl/setup.ftl` `setup-region-field-keyboard`: "klawiaturę" — the field names are in the accusative to fit "Dobrano { $guesses }"; they're only used in that list.
- `apps/setup/locales/pl/setup.ftl` `setup-network-unavailable`: "Możesz połączyć się później z paska zadań." — English says "from the panel"; check which part of the desktop is meant.
- `apps/setup/locales/pl/setup.ftl` `setup-windows-hibernated`: "…przytrzymaj Shift i wybierz Zamknij…" — Polish Windows calls Shut down "Zamknij" in the power menu; Fast Startup is "szybkie uruchamianie".
- `apps/setup/installer/locales/pl/installer.ftl` `installer-box-unopened`: "Nie udało się otworzyć kartonu przeprowadzkowego" — "moving box" metaphor for what Meet Luft packs; check it matches whatever Meet Luft's Polish text calls it.

## Settings

- `apps/settings/locales/pl/connections.ftl` `settings-network-security-owe`: "Rozszerzona otwarta" — no settled Polish term for Enhanced Open (OWE); check against what Windows or Android show.
- `apps/settings/locales/pl/connections.ftl` `settings-bluetooth-request-confirm`: "Sparować z: { $name }?" — colon avoids declining the device name (and the unnamed fallback „urządzenie”); check it reads naturally. The .description lines of the pairing requests drop { $name } for the same reason.
- `apps/settings/locales/pl/system.ftl` `settings-accounts-online`: "…w folderze Cloud…" — kept the folder name Cloud on the assumption it is a fixed folder name on disk, as other languages did; translate if the folder is localized.
- `apps/settings/locales/pl/devices.ftl` `settings-power-time-left`: "Szacowany czas pracy: { $time }" — "about … left" rephrased so the nominative duration fits; check it is clear on a battery row.
- `apps/settings/locales/pl/devices.ftl` `settings-power-charging-until-full`: "Ładowanie, do pełnego naładowania: { $time }" — colon construction for the nominative duration; may be long at laptop size.
- `apps/settings/locales/pl/devices.ftl` `settings-power-screen-off`: "Wyłączanie ekranu po czasie" — English "Turn off the screen after" + option cannot take nominative durations in Polish („po 5 minut” is wrong); check the label with options like „5 minut”. Same for `settings-power-long-sleep-after` "Czas do wyłączenia".
- `apps/settings/locales/pl/devices.ftl` `settings-mouse-touchpad-scroll-edge`: "Przy krawędzi" — and `settings-mouse-touchpad-click-corner` "W rogu"; options shown next to "Dwoma palcami", check they read as a consistent set.
- `apps/settings/locales/pl/devices.ftl` `settings-keys-keypad`: "Num { $key }" — chosen for keypad keys (Num 5, Num Enter); check against common Polish usage.
- `apps/settings/locales/pl/system.ftl` `settings-updates-elsewhere-download-by`: "Aktualizacje pobiera { $app }" — object-first word order keeps { $app } in the nominative, so both an app name and the fallback „inna aplikacja” fit; the other `-by` messages are built the same way. Check it reads naturally.
- `apps/settings/locales/pl/protection.ftl` `settings-privacy-screen-off-after`: "Po { $duration } bezczynności" — built so $duration stays in the nominative ("5 minut bezczynności"); check it reads well with every duration value, e.g. "1 minuta".
- `apps/settings/locales/pl/protection.ftl` `settings-encryption-passphrase-field`: "Fraza hasła" — chosen for "passphrase" to keep it distinct from the account "hasło"; not in the glossary, check it against what Polish disk-encryption UIs use.
- `apps/settings/locales/pl/protection.ftl` `settings-encryption-unlocks-security-key`: "Odblokowywany kluczem zabezpieczeń przy uruchamianiu" — "klucz zabezpieczeń" (Windows' term for a hardware security key) is not in the glossary.
- `apps/settings/locales/pl/protection.ftl` `settings-security-anti-cheat`: "Gry z ochroną przed oszustwami" — Polish gamers often just say "anti-cheat"; check which is more recognizable.
- `apps/settings/locales/pl/protection.ftl` `settings-passwords-stores`: "Dane logowania aplikacji" — "sign-in" as a countable noun has no good Polish equivalent, so the count message uses "Zapisane dane logowania: { $count }".
- `apps/settings/locales/pl/protection.ftl` `settings-passwords-history-read`: "Aplikacja { $app } użyła „{ $item }”" — the quoted item sits where Polish wants the genitive; check it doesn't read odd with real item names.
- `apps/settings/locales/pl/protection.ftl` `settings-passkeys-last-used`: "Ostatnio użyty { $when }" — depends on $when being a phrase like "3 dni temu" or "wczoraj".
- `apps/settings/locales/pl/system.ftl` `settings-users-fingerprint-remove-description`: "Nie zalogujesz się już za pomocą tego palca ({ $finger })." — the finger name arrives in the nominative, so it's put in parentheses rather than declined.
- `apps/settings/locales/pl/system.ftl` `settings-updates-apps-count`: "… w sklepie Schelf" — "sklep" avoids repeating "aplikacja … w aplikacji Schelf"; check this is acceptable with the app-name rule.
- `apps/settings/locales/pl/personalization.ftl` `settings-appearance-wallpaper-tile`: "Sąsiadująco" — Windows' term; check it fits next to the imperative options (Wypełnij, Dopasuj, Wyśrodkuj, Rozciągnij).
- `apps/settings/locales/pl/personalization.ftl` `settings-appearance-icons-clear`: "Przezroczyste" — assumes "Clear" means the glass-like transparent icon style, not "remove".

## Website

- `web/site/locales/pl/home.ftl` `home-motion-heading`: "Porusza się z wyczuciem." — free rendering of "It moves like it means it"; check it carries the same confidence.
- `web/site/locales/pl/home.ftl` `home-app-mailman-detail`: "sito dla nowych nadawców" — "screener" has no settled Polish term; check it reads clearly.
- `web/site/locales/pl/home.ftl` `home-app-disks`: "Zarządzanie dyskami" — "Drives" as the kind, chosen so it doesn't repeat the app name Dyski in "Dyski (Dyski)".
- `web/site/locales/pl/site.ftl` `site-footer-made`: "Tworzy { $lantharos }." — Lantharos as the subject avoids declining the name; check it reads naturally as a credit line.

## Meet Luft

- `apps/meet/locales/pl/meet.ftl` `meet-logs-saved`: "Dzienniki z wypróbowywania systemu Luft zapisano na pulpicie" — "Try Luft" as a mode has no fixed Polish name, so it's described; check it reads naturally in all three logs messages.
- `apps/meet/desktop/locales/pl/desktop.ftl` `check-start-entries`: "Stary wpis rozruchowy" — "start entry" (a firmware boot menu entry) rendered as wpis rozruchowy, used throughout Meet Luft.
- `apps/meet/locales/pl/meet.ftl` `check-action-tidy`: "Uporządkuj" — button for removing stale boot entries; check it's clear enough next to the explanation.
- `apps/meet/desktop/locales/pl/desktop.ftl` `check-secure-boot-restart-into`: "…gdzie ta opcja jest w { $place }" — $place is an English firmware menu path ("Security, a potem Secure Boot"); check the preposition reads well with it.
- `apps/meet/desktop/locales/pl/desktop.ftl` `helper-pipe-hijacked`: "{ $pipe } otworzyło coś innego niż pomocnik Meet Luft" — word order chosen so $pipe needs no case.
- `apps/meet/locales/pl/meet.ftl` `room-erase-bitlocker`: "Szyfrowanie BitLocker" — a noun instead of "Zaszyfrowana funkcją BitLocker", so it fits next to any partition without gender agreement; check it reads as a state on the partition row.
- `apps/meet/locales/pl/meet.ftl` `room-place-free-detail`: "{ $size } miejsca, którego nic innego nie używa" — "miejsca" added so the relative clause doesn't depend on the number in $size; check it isn't too long for a detail line.
- `apps/meet/locales/pl/meet.ftl` `luft-bar-used`: "{ $size }, zajęte: { $used }" — colon form keeps $used in the nominative; check it reads naturally under the space bar.
- `apps/meet/desktop/locales/pl/desktop.ftl` `helper-box-room-shortfall`: "Miejsce systemu Luft pomieści jeszcze { $available } GB…" — "Luft’s room" rendered as the space set aside for Luft; check it's clear this is the room Meet Luft made.
