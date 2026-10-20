# Norwegian Bokmål review list

Strings in Luft's Norwegian Bokmål translation that a native speaker should check: terms with no settled Norwegian equivalent, choices where Windows and other systems disagree, and wording that might read stiffly or clip.

## Terms and shared strings

- `packages/i18n/glossary/nb.csv` `snap`: "dokke, dokkeoppsett, dokkegruppe" — Windows uses «feste» for both snap and pin; check whether «dokke» reads naturally or another verb is better.
- `packages/i18n/glossary/nb.csv` `board`: "tavle" — check it reads as the endless-canvas mode, not a whiteboard app.
- `packages/i18n/glossary/nb.csv` `tray`: "systemstatusfelt" — Windows' name for the notification area; check it is understood for a button that holds background apps.
- `packages/i18n/glossary/nb.csv` `sign in`: "logge inn / logge ut", noun «pålogging» — chosen over Windows' «logge på / logge av»; check the mix with «påloggingsskjerm» feels natural.
- `packages/i18n/glossary/nb.csv` `notification`: "varsel, plural varsler" — check against «varsling», which some apps use.
- `packages/i18n/glossary/nb.csv` `Media Viewer`: "Medievisning" — generic name of Magpie; check whether «Mediefremviser» or another name is more familiar.
- `packages/i18n/glossary/nb.csv` `USB stick`: "minnepinne" — check against «USB-pinne» in installer contexts.
- `packages/i18n/glossary/nb.csv` `accent color`: "aksentfarge" — Windows says «uthevingsfarge»; check which people know better.
- `packages/i18n/glossary/nb.csv` `passkey`: "tilgangsnøkkel" — Apple uses «passnøkkel»; check which is more widespread.
- `kestrel/ui/locales/nb/shell.ftl` `keys-backspace`: "Tilbake" — Norwegian keyboards print an arrow; check whether «Backspace» is the more familiar shortcut label.
- `packages/ui/locales/nb/ui.ftl` `ui-fingerprint-retry`: "Det ble ikke lest skikkelig. Prøv igjen." — check it sounds natural.
- `packages/ui/locales/nb/ui.ftl` `ui-media-unmute`: "Slå på lyd" — check it is clear next to «Demp».
- `apps/settings/locales/nb/settings.ftl` `settings-more-show`: "Vis { $count } til" — check «til» vs «flere» after a number.

## Kestrel and setup

- `kestrel/ui/locales/nb/system.ftl` `dictation-unsupported-title`: "Diktering på { $language } er ikke tilgjengelig på denne datamaskinen" — $language currently arrives in English ("Japanese"), so it reads "på Japanese" until the speech service sends localized names.
- `kestrel/ui/locales/nb/system.ftl` `health-gpu-reset-body`: "Datamaskinen startet seg selv på nytt { $date } kl. { $time }." — check that a bare date without «den» reads naturally with the formatted day and month.
- `kestrel/ui/locales/nb/surfaces.ftl` `start-search-settings-section`: "Innstillinger: { $page }" — chosen to avoid hyphenating a multi-word page title («Strøm og batteri-innstillinger»); check it reads well as a search-result description.
- `kestrel/ui/locales/nb/surfaces.ftl` `start-folder-ungroup`: "Løs opp mappen" — English says "Ungroup apps"; check this is clear for an app folder in Start.
- `kestrel/engine/locales/nb/engine.ftl` `network-menu-tethers`: "Internettdeling via Bluetooth" — no settled short term for Bluetooth tethering; may clip as a menu header.
- `kestrel/engine/locales/nb/engine.ftl` `switch-monitor-join`: "Utvid skjermer" — follows Windows' «Utvid»; check against the 15-character limit context.
- `kestrel/engine/locales/nb/engine.ftl` `inhibit-shortcuts-title`: "Tillat at hurtigtaster overstyres" — "inhibit shortcuts" has no settled Norwegian term.
- `apps/setup/installer/locales/nb/installer.ftl` `installer-no-deployment`: "Det nye systemet har ingen utrulling" — «utrulling» for an ostree deployment is a technical guess.
- `apps/setup/locales/nb/setup.ftl` `setup-region-intro-guessed`: "Vi har gjettet { $guesses }" — relies on the joined list ("tastaturet ut fra datamaskinen og tidssonen ut fra nettverket") using «og»; check the list joiner.
- `kestrel/engine/locales/nb/engine.ftl` `network-menu-hotspot`: "Trådløssone på { $name }" — $name is the Wi-Fi device sharing the connection; check it reads well with the device names people see, and against Windows' «mobilt tilkoblingspunkt».
- `kestrel/engine/locales/nb/engine.ftl` `screenshot-source`: "Skjermbilder og opptak" — notification source for the screenshot and recording tool; «skjermopptak» alone would mean only recordings.

## Settings

- `apps/settings/locales/nb/connections.ftl` `settings-network-ip-link-local`: "Bare lokal lenke (link-local)" — no settled Norwegian term; check it reads naturally.
- `apps/settings/locales/nb/connections.ftl` `settings-network-security-owe`: "Forbedret åpen" — literal; Windows shows "OWE"; check.
- `apps/settings/locales/nb/connections.ftl` `settings-network-wireguard-keepalive`: "Keepalive" — left in English as WireGuard tools do.
- `apps/settings/locales/nb/connections.ftl` `settings-accounts-online`: "Hver konto er en mappe i Cloud i hjemmemappen din …" — assumes the folder is literally named Cloud and not localized.
- `apps/settings/locales/nb/connections.ftl` `settings-bluetooth-request-confirm`: "Vil du koble sammen med { $name }?" — pairing is translated «koble sammen»/«sammenkobling» throughout; check it doesn't read too close to «koble til».
- `apps/settings/locales/nb/devices.ftl` `settings-power-suspend-plugged-in`: "Hvilemodus når den er koblet til strøm" — may be long for a row label.
- `apps/settings/locales/nb/personalization.ftl` `settings-cursors-folder-description`: "Temaer du legger i Hjem › .local › share › icons, vises her" — check that "Hjem" matches how Rover names the home folder in Norwegian.
- `apps/settings/locales/nb/personalization.ftl` `settings-fonts-monospace`: "Fast bredde" — monospace has no single settled short term; check against how Rover/Draft name it.
- `apps/settings/locales/nb/personalization.ftl` `settings-accessibility-dwell-time`: "Hold i ro i" — label followed by a duration slider; check it reads naturally next to the value.
- `apps/settings/locales/nb/protection.ftl` `settings-security-anti-cheat`: "Spill med juksebeskyttelse" — «juksebeskyttelse» for anti-cheat; gamers may expect «anti-cheat».
- `apps/settings/locales/nb/protection.ftl` `settings-passwords-seal`: "Forsegl" — «forsegle» for sealing to the TPM; check it reads clearly.
- `apps/settings/locales/nb/system.ftl` `settings-datetime-format-12h`: "12-timers" — English says AM/PM; Norwegian Windows labels it as 12-hour, check the choice is clear next to «24-timers».
- `apps/settings/locales/nb/system.ftl` `settings-updates-switching-standard`: "Laster ned standardbildet…" — «bildet» for the system image may be read as a picture; «systembildet» may be clearer but longer.
