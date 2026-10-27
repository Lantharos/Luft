# Norwegian Nynorsk review list

Strings in Luft's Nynorsk translation that a native speaker should check: terms with no settled Nynorsk equivalent, forms where the norm allows a choice, and wording that might read stiffly or clip.

## Terms and shared strings

- `packages/i18n/glossary/nn.tbx` `snap`: "dokke, dokkingsoppsett, dokkingsgruppe" — Windows uses «feste» for both snap and pin; check «dokke» reads naturally for windows and doesn't suggest «doll».
- `packages/i18n/glossary/nn.tbx` `notification`: "varsling, varslingar" — chosen over «varsel» (same form in singular and plural); check it feels right throughout the desktop.
- `packages/i18n/glossary/nn.tbx` `tray`: "systemfelt" — Norwegian Windows says «systemstatusfelt»; check the shorter word is understood.
- `packages/i18n/glossary/nn.tbx` `board`: "tavle" — check it reads as the endless-canvas mode, not a whiteboard app.
- `packages/i18n/glossary/nn.tbx` `File Manager`: "Filhandsamar" — KDE's word; check against GNOME's plain «Filer».
- `packages/i18n/glossary/nn.tbx` `Text Editor`: "Tekstredigerar" — check against «Tekstredigering» or «Skriveprogram».
- `packages/i18n/glossary/nn.tbx` `accessibility`: "Tilgjenge" — KDE's word; check it is understood as accessibility rather than access.
- `packages/i18n/glossary/nn.tbx` `security`: "tryggleik" — chosen over «sikkerheit»; check it suits technical contexts like Secure Boot and encryption.
- `packages/i18n/glossary/nn.tbx` `keyboard shortcut`: "snarveg" — check it is clear next to file shortcuts; «tastatursnarveg» is the fallback.
- `packages/i18n/glossary/nn.tbx` `passkey`: "tilgangsnøkkel" — Apple says «passnøkkel» in Norwegian; check which people know.
- `packages/i18n/glossary/nn.tbx` `search`: "søkje" — the norm also allows «søke»; the guide picks the classic -je forms (leggje, setje, søkje), check that's the preferred house style.
- `kestrel/ui/locales/nn/shell.ftl` `keys-backspace`: "Tilbaketast" — Norwegian keyboards print an arrow; check whether «Backspace» is the more familiar shortcut label.
- `kestrel/ui/locales/nn/shell.ftl` `battery-level`: "Batteri { $percentage } %, fullada" — check «fullada» vs «fulladd» for the participle.
- `packages/web/ui/locales/nn/ui.ftl` `ui-fingerprint-retry`: "Fingeren vart ikkje lesen godt nok. Prøv igjen." — check it sounds natural.
- `packages/web/ui/locales/nn/ui.ftl` `ui-fingerprint-place`: "Legg { $finger } på sensoren." — the finger name is indefinite without «din»; check «Legg høgre peikefinger på sensoren» reads naturally.
- `packages/web/ui/locales/nn/ui.ftl` `ui-finger-right-little`: "Høgre veslefinger" — chosen over «litlefinger»; check which is more common.
- `apps/settings/locales/nn/settings.ftl` `settings-more-show`: "Vis { $count } til" — check «til» vs «fleire» after a number.

## Kestrel and setup

- `kestrel/ui/locales/nn/desktop.ftl` `window-menu-unmaximize`: "Avmaksimer" — GNOME's word; check it isn't too technical next to Gjenopprett.
- `kestrel/ui/locales/nn/system.ftl` `privacy-indicator`: "Brukar { $things }" with definite list items (kameraet, mikrofonen …) — check the list joins naturally without a possessive.
- `kestrel/ui/locales/nn/system.ftl` `oom-closed-body`: "… så han vart lukka …" — "han" stands for both the app and the container; check it reads naturally.
- `kestrel/ui/locales/nn/system.ftl` `health-gpu-reset-body`: "… på nytt { $date } klokka { $time }." — check the date placeable (e.g. "3. mars") fits without "den".
- `kestrel/ui/locales/nn/system.ftl` `battery-device-headset`: "Headset" — English loan, also in `system.ftl` `audio-device-headset`; check against «hovudtelefonar med mikrofon».
- `kestrel/ui/locales/nn/portal.ftl` `screen-share-device-touchscreen`: "Trykkskjerm" — no settled Nynorsk term (Bokmål systems say «berøringsskjerm»).
- `kestrel/ui/locales/nn/system.ftl` `network-menu-hotspot`: "Tilgangspunkt på { $name }" — check wording for a shared Wi-Fi hotspot.
- `kestrel/ui/locales/nn/system.ftl` `network-menu-tethers`: "Deling over Bluetooth" (and `network-menu-tether` "Deling") — no settled term for Bluetooth tethering.
- `kestrel/ui/locales/nn/system.ftl` `display-change-title`: "Behalde skjerminnstillingane?" — kept under 30 characters; check the bare infinitive question reads fine.
- `kestrel/ui/locales/nn/auth.ftl` `end-session-remote-user`: "{ $userName } (eksternt)" — check this is the clearest word for a user signed in over SSH.
- `apps/setup/locales/nn/setup.ftl` `setup-windows-hibernated`: "… Rask oppstart … hald inne Skift medan du vel Avslutt …" — names taken from Norwegian Windows (Rask oppstart, Avslutt, and Diskbehandling in `setup-windows-bitlocker`); verify against a Norwegian Windows.
- `apps/setup/locales/nn/setup.ftl` `setup-region-intro-guessed`: "Vi har gjetta { $guesses }, …" with parts like "tastaturet ut frå datamaskinen" — check the joined sentence reads naturally.
- `apps/setup/locales/nn/setup.ftl` `setup-network-unavailable`: "… frå oppgåvelinja." — English says "the panel", read here as the taskbar.

## Settings

- `apps/settings/locales/nn/connections.ftl` `settings-network-ip-routes`: "Ruter" — spelled like "ruter" (router) used on the same page; check whether another word for routes is better.
- `apps/settings/locales/nn/connections.ftl` `settings-network-security-psk`: "WPA2-Personleg" (also WPA3, and "Bedrift" for Enterprise) — Windows keeps "WPA2-Personal"/"WPA2-Enterprise"; check which a Nynorsk reader expects.
- `apps/settings/locales/nn/connections.ftl` `settings-network-ip-link-local`: "Berre lenkjelokal" — no settled Nynorsk term.
- `apps/settings/locales/nn/connections.ftl` `settings-network-proxy`: "Proxy" — the loanword, as in Windows; «mellomtenar» is only in the search keywords.
- `apps/settings/locales/nn/system.ftl` `settings-accounts-online`: "Kvar konto er ei mappe i Cloud, …" — assumes the folder keeps the English name Cloud.
- `apps/settings/locales/nn/devices.ftl` `settings-mouse-touchpad-tap`: "Trykk lett for å klikke" — check against what Norwegian users know for "Tap to click".
- `apps/settings/desktop/locales/nn/desktop.ftl` `desktop-shortcut-switch-panels`: "Byt mellom systemkontrollar" (and `desktop-shortcut-cycle-panels`) — moves keyboard focus between the taskbar and other parts of the desktop; check the name makes sense in the shortcut list.
- `apps/settings/locales/nn/personalization.ftl` `settings-appearance-icons-clear`: "Klar" — icon style next to Original and Farga; «klar» may read as "ready", check whether «Gjennomsiktige» fits if the style is see-through glass.
- `apps/settings/locales/nn/personalization.ftl` `settings-appearance-style`: "Modus" with the choices Lys and Mørk — follows «mørk modus» from Quick settings; check it reads well as the row name.
- `apps/settings/locales/nn/personalization.ftl` `settings-fonts-sample`: "Vår sære Zulu frå badeøya spelte jo whist og quickstep i min taxi" — Nynorsk form of the common Norwegian pangram; check it reads naturally.
- `apps/settings/locales/nn/personalization.ftl` `settings-taskbar-look-solid`: "Heildekkande" — check against what Norwegian desktops call an opaque bar.
- `apps/settings/locales/nn/personalization.ftl` `settings-cursors-folder-description`: "Tema du legg i Heimemappe › .local › share › icons …" — check whether the home folder shows as «Heimemappe» or «Heim» in the file manager.
- `apps/settings/locales/nn/protection.ftl` `settings-security-anti-cheat`: "Spel med anti-juks" — no settled Norwegian term; "anti-cheat" may be what gamers actually say.
- `apps/settings/locales/nn/protection.ftl` `settings-encryption-backup`: "… sikkerheitskopi …" — check against «tryggingskopi», which fits the «tryggleik» used elsewhere.
- `apps/settings/locales/nn/system.ftl` `settings-updates-last-checked`: "Sist sjekka { $when }" — assumes $when arrives as "for 5 minutt sidan" or "i går"; same for `settings-updates-released` and `settings-passwords-ssh-added`.
- `apps/settings/locales/nn/system.ftl` `settings-updates-switching-standard`: "Lastar ned standardbiletet …" — "image" as in system image; «bilete» could be misread as picture, consider «standardsystemet».

## Website

- `web/site/locales/nn/download.ftl` `download-meet-note`: «Mer informasjon» and «Kjør likevel» — Bokmål SmartScreen labels, since Windows has no Nynorsk; check this reads fine in a Nynorsk sentence.
- `web/site/locales/nn/home.ftl` `home-app-mailman-detail`: "ei sortering av nye avsendarar" — "screener" has no settled Nynorsk term.
- `web/site/locales/nn/home.ftl` `home-meet-room`: "Han lagar plass" — Meet Luft referred to as "han" (ein app); check it reads naturally as a step heading.
- `web/site/locales/nn/home.ftl` `home-question-ready-answer`: "Nattlege bygg" — "nightly builds"; check whether another term is more familiar.

## Meet Luft

- `apps/meet/desktop/locales/nn/desktop.ftl` `check-encryption-changing-detail`: "i Innstillinger, under Enhetskryptering" — Bokmål page names, because Windows ships no Nynorsk; setup.ftl says «einingskryptering» in running text, so check the mix reads right.
- `apps/meet/locales/nn/meet.ftl` `ready-remove-description`: "òg flytteeska" — «flytteeske» for the moving box partition; check it reads as Meet Luft's packed bundle.
- `apps/meet/locales/nn/meet.ftl` `meet-logs-saved`: "Loggane frå då du prøvde Luft, er lagra på skrivebordet ditt" — "logs from Try Luft" rephrased; check it isn't too long for a notice.
- `apps/meet/desktop/locales/nn/desktop.ftl` `check-start-entries-detail`: "Ho kan ryddast bort." — «oppstartsoppføring» taken as feminine (ei føring); check the pronoun.
- `apps/meet/desktop/locales/nn/desktop.ftl` `check-encryption-on-detail`: "for sikkerheits skuld" — fixed phrase kept although the guide prefers «tryggleik»; check it doesn't read as Bokmål.
- `apps/meet/desktop/locales/nn/desktop.ftl` `check-secure-boot-off-detail`: "spel med juksevern" — no settled Nynorsk term for anti-cheat.
- `apps/meet/locales/nn/meet.ftl` `luft-title`: "Ditt Luft" — Nynorsk usually puts the possessive after the noun, which a name without a definite ending can't take; check it reads naturally as a title.
