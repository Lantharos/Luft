# Dutch review list

Strings in Luft's Dutch translation that a native speaker should check: terms where Windows, macOS and GNOME disagree in Dutch, and wording that may read oddly in Flanders or around a placeable.

## Terms and shared strings

- `packages/i18n/glossary/nl.csv` `board`: "board" — kept as a loanword (het board); check whether it reads naturally or whether "bord" or "canvas" would be better.
- `packages/i18n/glossary/nl.csv` `workspace`: "werkblad" — GNOME's word; Windows says "bureaublad", which Luft already uses for the desktop. Check that werkblad is understood.
- `packages/i18n/glossary/nl.csv` `snap`, `snap layout`, `snap group`: "uitlijnen", "uitlijnindeling", "uitlijngroep" — meant to follow Windows 11; verify against current Windows wording.
- `packages/i18n/glossary/nl.csv` `lock screen`, `login screen`: "vergrendelscherm", "aanmeldscherm" — shorter than Windows' vergrendelingsscherm and aanmeldingsscherm; check that neither reads as a mistake.
- `packages/i18n/glossary/nl.csv` `Keyring`: "sleutelbos" — GNOME's word; check it isn't too playful next to Apple's "sleutelhanger".
- `packages/i18n/glossary/nl.csv` `Wi-Fi`, `USB stick`: "wifi", "usb-stick" — Groene Boekje spelling; Windows writes Wi-Fi and USB. Check the lowercase forms look right in the interface.
- `packages/i18n/glossary/nl.csv` `App Store`: "Appstore" — one word as Dutch compounds go; check it isn't read as Apple's store.
- `packages/i18n/glossary/nl.csv` `Media Viewer`: "Mediaviewer" — loanword; "Mediaweergave" is the alternative.
- `packages/i18n/glossary/nl.csv` `done`: "Klaar" — macOS; Windows uses "Gereed".
- `apps/settings/locales/nl/pages.ftl` `settings-page-appearance`: "Uiterlijk" — GNOME and KDE; macOS says "Weergave". Check which Dutch users expect.
- `apps/settings/locales/nl/pages.ftl` `settings-page-about`: "Info" — follows Windows and macOS; "Over" is the alternative.
- `packages/ui/locales/nl/ui.ftl` `ui-select-placeholder`: "Selecteren" — dropdown placeholder; "Kies een optie" may read better if space allows.
- `packages/ui/locales/nl/ui.ftl` `ui-fingerprint-stage-passed`: "Goed. Til je vinger op en leg hem opnieuw neer." — check the tone of "Goed." at the start.
- `kestrel/ui/locales/nl/shell.ftl` `keys-space`: "Spatie" — the only translated key name; check it matches how Dutch shortcut lists write the space bar.

## Kestrel and setup

- `kestrel/ui/locales/nl/desktop.ftl` `snap-zone`: "Uitlijnen op een vlak van { $width }% bij { $height }%" — check that "vlak" reads naturally for a screen area in a screen-reader label.
- `kestrel/ui/locales/nl/system.ftl` `dictation-unsupported-title`: "{ $language } dicteren is niet beschikbaar op deze computer" — $language currently arrives in English ("Japanese"); the sentence avoids an article so it works with either, but check the word order.
- `kestrel/ui/locales/nl/system.ftl` `privacy-indicator`: "Gebruikt je { $things }" — depends on how the list in $things is joined (should be "en" in Dutch).
- `kestrel/engine/locales/nl/engine.ftl` `switch-monitor-mirror`, `switch-monitor-join`: "Dupliceren", "Uitbreiden" — Windows' Win+P words rather than literal "Spiegelen"/"Samenvoegen"; confirm.
- `kestrel/engine/locales/nl/engine.ftl` `ctrl-alt-tab-panel`: "Taakbalk" — English says "Panel", the comment says it is the taskbar.
- `kestrel/engine/locales/nl/engine.ftl` `screenshot-screenshots-folder`, `screenshot-screencasts-folder`: "Schermafbeeldingen", "Schermopnamen" — folder names on disk; check they match what other Dutch apps (Rover, Magpie) expect.
- `kestrel/engine/locales/nl/engine.ftl` `screenshot-source`: "Schermopname" — also the word for screen recording; "Schermafbeelding en -opname" may be clearer but long.
- `apps/setup/locales/nl/setup.ftl` `setup-region-intro-guessed`: "Laten we beginnen. We hebben { $guesses } afgeleid, dus pas aan wat niet klopt." — with $guesses like "je toetsenbord van je computer en je tijdzone van je netwerk"; check the joined sentence reads well.
- `apps/setup/locales/nl/setup.ftl` `setup-account-full-name-example`: "Rembrandt van Rijn" — check a reviewer is happy with this example name.
- `apps/setup/locales/nl/setup.ftl` `setup-windows-fast-startup`: "Snel opstarten uitschakelen in Windows" — uses the Dutch Windows name "Snel opstarten"; also used in `setup-windows-hibernated`, along with "Schijfbeheer" for Disk Management.
- `apps/setup/locales/nl/setup.ftl` `setup-network-unavailable`: "…via de taakbalk." — English says "from the panel"; assumed it means the taskbar network icons.
- `apps/setup/installer/locales/nl/installer.ftl` `installer-no-deployment`: "Het nieuwe systeem heeft geen deployment" — technical term left in English, no settled Dutch equivalent.

## Settings

- `apps/settings/locales/nl/protection.ftl` `settings-encryption-unlocks-security-key`: "Ontgrendelt bij het opstarten met je beveiligingssleutel" — "beveiligingssleutel" for a hardware security key (Windows' word); check it doesn't read as a software key.
- `apps/settings/locales/nl/system.ftl` `settings-datetime-week-start-regional`: "{ $day }, volgens je regio" — Dutch weekday names are lowercase, so the label may start with a lowercase letter if the code doesn't capitalize it.
- `apps/settings/locales/nl/system.ftl` `settings-updates-last-checked`: "Laatst gecontroleerd: { $when }" — colon form chosen so relative times like "gisteren" and "5 minuten geleden" both fit; same for settings-updates-installed-when, settings-updates-released, settings-passwords-ssh-added, settings-passkeys-last-used.
- `apps/settings/locales/nl/system.ftl` `settings-updates-switching-standard`: "Standaardimage downloaden…" — "image" for the system image; "de image" vs "het image" is unsettled in Dutch; de is used.
- `apps/settings/locales/nl/personalization.ftl` `settings-appearance-icons-clear`: "Doorzichtig" — English "Clear" icon style (glassy, like iOS); check it's understood as a look, not as "empty".
- `apps/settings/locales/nl/personalization.ftl` `settings-fonts-monospace`: "Vaste breedte" — label for the monospace font row; some may expect "Monospace".
- `apps/settings/locales/nl/connections.ftl` `settings-network-security-owe`: "Enhanced Open" — kept the Wi‑Fi Alliance name; check whether Windows or macOS in Dutch translate it.
- `apps/settings/locales/nl/connections.ftl` `settings-network-security-psk`: "WPA2 Persoonlijk" (and WPA3 Persoonlijk, Zakelijk) — follows macOS; Windows writes "WPA2-Persoonlijk". Check which spelling reads best.
- `apps/settings/locales/nl/connections.ftl` `settings-network-private-address`: "Privéadres" — no settled term (macOS says "Privé-wifiadres", Windows "Willekeurige hardwareadressen").
- `apps/settings/locales/nl/connections.ftl` `settings-network-ip-link-local`: "Alleen link-local" — kept the technical term untranslated.
- `apps/settings/locales/nl/connections.ftl` `settings-accounts-app-password`: "App-wachtwoord" — Microsoft's spelling; strict compound rules would give "appwachtwoord".
- `apps/settings/locales/nl/connections.ftl` `settings-accounts-approve`: "Geavanceerde gegevensbescherming" — Apple's Dutch name for Advanced Data Protection; confirm capitalization.
- `apps/settings/locales/nl/devices.ftl` `settings-display-orientation-portrait-right`: "Staand, naar rechts" (and "Staand, naar links", "Liggend, omgedraaid") — check against Windows' Dutch orientation names.
- `apps/settings/locales/nl/devices.ftl` `settings-keys-keypad`: "Numeriek { $key }" — no printed key name exists; check whether "Num { $key }" is more familiar.
- `apps/settings/locales/nl/devices.ftl` `settings-dictation-credits`: "Bronvermelding" — chosen over the loanword "Credits".
- `apps/settings/locales/nl/devices.ftl` `settings-power-capacity`: "{ $full } van { $design } toen hij nieuw was" — “hij” refers to the battery; check it reads naturally in the Battery health row.
- `apps/settings/desktop/locales/nl/desktop.ftl` `desktop-shortcut-switch-panels`: "Wisselen tussen systeembediening" — vague English source; check it makes sense in the shortcut list.
- `apps/settings/desktop/locales/nl/desktop.ftl` `desktop-shortcut-show-screenshot-ui`: "Schermafbeelding maken met keuzes" — “interactively” has no neat Dutch equivalent.
- `apps/settings/locales/nl/connections.ftl` `settings-accounts-online`: "Onlineaccounts" — one-word compound per the spelling rules; GNOME writes "Online-accounts".
- `apps/settings/locales/nl/system.ftl` `settings-updates-area-drivers`: "Drivers en firmware" — "driver" is used throughout instead of Windows' "stuurprogramma"; check which Dutch users expect.
- `apps/settings/locales/nl/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Afbeeldingen › Wallpapers" — assumes the Pictures folder shows as Afbeeldingen (the Dutch folder name); Wallpapers is the real folder name and stays English.

## Website

- `web/site/locales/nl/download.ftl` `download-iso`: "Iso downloaden" — "iso" lowercase per the Groene Boekje rule for letter-by-letter abbreviations; check whether "ISO" reads more natural for a disk image.
- `web/site/locales/nl/home.ftl` `home-security-sealed-text`: "één ondertekende image" — "image" for the system image has no settled Dutch word; check gender and whether "systeemimage" is clearer.
- `web/site/locales/nl/download.ftl` `download-meet-windows-checksum`: "Windows-checksum" — kept the loanword over "controlesom"; check which reads better on a download page.
- `web/site/locales/nl/home.ftl` `home-motion-heading`: "Beweging met een bedoeling." — free rendering of "It moves like it means it"; check it lands as a heading.

## Meet Luft

- `apps/meet/locales/nl/meet.ftl` `meet-logs-saved`: "De logboeken van het uitproberen van Luft staan op je bureaublad" — "Try Luft" as a session has no short Dutch name; check that "het uitproberen van Luft" reads naturally (also meet-logs-none, meet-logs-failed, logs-not-saved).
- `apps/meet/locales/nl/meet.ftl` `problem-tidy`: "De oude opstartvermeldingen konden niet worden verwijderd." — "opstartvermelding" for a firmware boot entry; check whether "opstartitem" is what Dutch users know from Windows.
- `apps/meet/locales/nl/meet.ftl` `ready-remove-description`: "…ook de verhuisdoos…" — the moving box as "verhuisdoos"; check the metaphor lands, also in drive-box-no-guid.
- `apps/meet/locales/nl/meet.ftl` `meet-iso-use`: "Een iso gebruiken die ik al heb" — lowercase "iso" and "Luft-iso" follow the website; check against "ISO".
- `apps/meet/locales/nl/meet.ftl` `stick-drives-label`: "Usb-schijven" — "USB drives" kept apart from "usb-stick"; check whether "usb-sticks" is simply clearer (also problem-sticks, stick-looking).
- `apps/meet/desktop/locales/nl/desktop.ftl` `check-startup-bios-linux`: "Schakel het in de firmware-instellingen in, samen met het systeem dat hier al staat" — the English is vague about what happens to the existing system; check the meaning comes across.
- `apps/meet/desktop/locales/nl/desktop.ftl` `check-firmware-key-volume-up`: "de knop volume omhoog" — inserted after "druk je op"; check it reads well in that sentence.
