# Icelandic review list

Strings in Luft's Icelandic translation that a native speaker should check: terms with no single settled Icelandic equivalent, and wording around placeables that may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/is.csv` `Start`: "Upphaf", in running text "upphafsvalmynd" — check that this matches what Icelandic Windows shows today, or whether people simply say Start.
- `packages/i18n/glossary/is.csv` `board`: "tafla" — no established term exists for this mode; "tafla" also means a data table.
- `packages/i18n/glossary/is.csv` `snap`, `snap layout`, `snap group`: "raða", "gluggauppröðun", "gluggahópur" — Windows' Icelandic term for snap is unknown to me; "festa" is kept for pin.
- `packages/i18n/glossary/is.csv` `tray`: "kerfisbakki" — check it is understood; Windows calls the area "tilkynningasvæði".
- `packages/i18n/glossary/is.csv` `dark style`: "Dökkt útlit" — GNOME may say "Dökkur stíll"; check which reads best on a quick settings tile.
- `packages/i18n/glossary/is.csv` `Dictation`: "Raddinnsláttur" — check against Apple's and Microsoft's Icelandic term for dictation.
- `packages/i18n/glossary/is.csv` `clipboard`: "klippiborð" — GNOME says "klippispjald"; check which Icelandic users know better.
- `packages/i18n/glossary/is.csv` `Do Not Disturb`: "Ekki trufla" — Apple uses "Ónáðið ekki".
- `packages/i18n/glossary/is.csv` `account`: "aðgangur", plural "aðgangar" — check that the Settings page name "Aðgangar" reads natural for online accounts.
- `packages/i18n/glossary/is.csv` `set up`: "stilla" — chosen so it doesn't clash with "setja upp" (install); check it fits "set up a device".
- `packages/i18n/glossary/is.csv` `Media Viewer`: "Margmiðlunarskoðari" — long; check it fits as a generic app name.
- `kestrel/ui/locales/is/shell.ftl` `keys-space`: "Bilslá" — the other keys keep the English names printed on Icelandic keyboards; check that this mix reads right in shortcut labels.
- `kestrel/ui/locales/is/shell.ftl` `battery-level` [plugged]: "Rafhlaða { $percentage }%, tengd við rafmagn" — check the wording and the percent sign without a space.
- `apps/settings/locales/is/settings.ftl` `settings-subpage-back`: "Til baka á síðuna { $page }" — "síðuna" keeps the page name in the nominative; check it isn't too long for a screen-reader label.
- `packages/web/settings-pages/locales/is/pages.ftl` `settings-page-about`: "Um tölvuna" — Windows says only "Um"; check which fits the sidebar.
- `packages/web/ui/locales/is/ui.ftl` `ui-finger-*` .inline: accusative forms ("hægri löngutöng", "hægri litlafingur") for "Leggðu …" and "Dragðu …"; check every sentence using `{ $finger }` takes the accusative.
- `packages/web/ui/locales/is/ui.ftl` `ui-toast-dismiss`: "Hunsa" — Windows' word for dismissing a notification; "Loka" would also work.

## Kestrel and setup

- `apps/setup/locales/is/setup.ftl` `setup-region-title`: "Velkomin í Luft" — uses the common gender-neutral signage form instead of "Velkomin(n)"; confirm this reads well.
- `apps/setup/locales/is/setup.ftl` `setup-region-intro-guessed`: "Byrjum. Við giskuðum á { $guesses }, svo breyttu því sem passar ekki." — $guesses is built from "{ $fields } út frá tölvunni/netinu" joined by "og"; check the assembled sentence reads naturally.
- `apps/setup/locales/is/setup.ftl` `setup-protect-passphrase-label`: "Lykilsetning" — used for passphrase everywhere, also in Settings, to keep it apart from "lykilorð"; check it is the term Icelandic users know.
- `apps/setup/locales/is/setup.ftl` `setup-windows-hibernated`: "flýtiræsingu" and `setup-windows-bitlocker` "Diskastjórnun" — assumed Icelandic Windows names for Fast Startup and Disk Management; verify.
- `kestrel/ui/locales/is/portal.ftl` `portal-unknown-app-object`: "forritinu" — every sentence that puts it in object position was written to take the dative (Leyfa …, með …, frá …, úr …, í …); check any sentence where the app name sits mid-sentence as subject.
- `kestrel/ui/locales/is/portal.ftl` `shortcuts-record-title`: "Flýtilyklar í { $appName }" — "í" so the dative works with the unknown-app fallback; "fyrir" would be more natural but needs the accusative.
- `kestrel/ui/locales/is/desktop.ftl` `window-menu-close`, `portal.ftl` `usb-title`/`usb-description`, `setup.ftl` `setup-replace-keeps-accounts`: English singular variants without the number became exact [1] variants, since Icelandic [one] also covers 21, 31 ….
- `kestrel/ui/locales/is/system.ftl` `oom-closed-body`: "…svo þessu var lokað…" — avoids a gendered pronoun for app vs container; check it doesn't read too vague.
- `kestrel/ui/locales/is/engine.ftl` `network-menu-tethers` / `network-menu-tether`: "Netdeiling um Bluetooth" / "Netdeiling" — no settled term for tethering.
- `kestrel/ui/locales/is/engine.ftl` `end-session-log-out-user-countdown`: "Notandinn { $userName } verður skráður út…" — "notandinn" carries the masculine agreement so the person's gender doesn't matter; check it sounds natural.
- `kestrel/ui/locales/is/engine.ftl` `ctrl-alt-tab-unlock`: "Innskráningargluggi" — the lock screen's sign-in prompt; check the term.
- `kestrel/ui/locales/is/system.ftl` `peek-error-no-caller`: "Setubrautin (session bus)" — technical term with no settled Icelandic equivalent.

## Settings

- `apps/settings/locales/is/devices.ftl` `settings-power-duration-minutes`: "{ $minutes } mínútu" — durations are in the accusative so they fit „eftir { $time }“, „Um { $time } eftir“ and the pickers after „Slökkva á skjánum eftir“; check every use reads well.
- `apps/settings/locales/is/devices.ftl` `settings-dictation-copilot-key`: "Copilot-lyklinum" — dative, because it fills „Haltu { $keys } inni“; check the joined list „Super+Alt eða Copilot-lyklinum“.
- `apps/settings/locales/is/devices.ftl` `settings-dictation-engine-description`: "Talgreining með { $engine } – { $language }" — rebuilt so the language name's case doesn't matter.
- `apps/settings/locales/is/devices.ftl` `settings-display-orientation-portrait-right`: "Skammsnið, hægri" — langsnið/skammsnið for landscape/portrait; check against what Windows uses in Icelandic.
- `apps/settings/locales/is/devices.ftl` `settings-display-scale`: "Kvarði" — Windows' word; „Stærð“ may be clearer.
- `apps/settings/locales/is/connections.ftl` `settings-network-security-owe`: "Aukið opið" — no settled Icelandic term for Enhanced Open (OWE).
- `apps/settings/locales/is/connections.ftl` `settings-network-security-enterprise`: "Fyrirtæki" — WPA Enterprise; might read better as „Fyrirtækjanet“.
- `apps/settings/locales/is/connections.ftl` `settings-network-ip-link-local`: "Aðeins staðbundin vistföng (link-local)" — no settled term.
- `apps/settings/locales/is/connections.ftl` `settings-network-wireguard-keepalive`: "Viðhaldsboð" — no settled term for keepalive.
- `apps/settings/locales/is/system.ftl` `settings-accounts-approve`: "…notar Advanced Data Protection…" — Apple has no Icelandic name for it, kept in English.
- `apps/settings/locales/is/connections.ftl` `settings-bluetooth-request-display`: "Sláðu þennan kóða inn á tækinu og ýttu svo á Enter." — leaves out { $name } because „á“ needs the dative and the unnamed fallback „tækið“ is nominative/accusative.
- `apps/settings/locales/is/protection.ftl` `settings-encryption-pin-field`: "PIN-númer" — used throughout, as Windows does; check it isn't too long in the PIN dialog rows and buttons („Bæta við PIN-númeri við ræsingu“).
- `apps/settings/locales/is/protection.ftl` `settings-security-anti-cheat`: "Leikir með svindlvörn" — no settled Icelandic term for anti-cheat; „svindlvörn“ is a coinage.
- `apps/settings/locales/is/protection.ftl` `settings-passwords-ssh-copy`: "Afrita dreifilykil { $name }" — check it reads naturally with a key name after it.
- `apps/settings/locales/is/protection.ftl` `settings-passwords-history-all`: "Sýna öll { $count }" — neuter „öll“ assumes the items are atvik/lykilorð; check against the list it expands.
- `apps/settings/locales/is/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } virk / virkar" — agreement is loose (it counts the typing assists); another phrasing may read better.
- `apps/settings/locales/is/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Myndir › Wallpapers" — the folder itself is named Wallpapers in every language; check the Pictures folder shows as „Myndir“ on Icelandic systems.
- `apps/settings/locales/is/personalization.ftl` `settings-accessibility-dwell-time`: "Halda kyrru í" — label before a duration slider; check it reads well with the slider value.
- `apps/settings/locales/is/system.ftl` `settings-datetime-week-start-regional`: "{ $day }, samkvæmt svæðinu þínu" — assumes $day is the nominative weekday name.
- `apps/settings/locales/is/system.ftl` `settings-users-fingerprint-remove-description`: "Þú getur ekki lengur notað { $finger } til að skrá þig inn." — relies on the accusative .inline finger forms from ui.ftl.
- `apps/settings/locales/is/system.ftl` `settings-about-other-system`: "Fjarlægðu það til að gefa Luft plássið, { $size }" — reworded around the size placeable; check it reads naturally.
- `apps/settings/locales/is/system.ftl` `settings-about-mount-internal`: "Tengja" — chosen for mount; check it isn't confused with connecting a device.

## Website

- `web/site/locales/is/download.ftl` `download-meet-note`: "veldu Frekari upplýsingar og svo Keyra samt" — couldn't verify the SmartScreen button labels of the Icelandic Windows language pack.
- `web/site/locales/is/home.ftl` `home-app-tern`: "Útstöð" — GNOME's word for terminal; „Skipanalína” is the other candidate.
- `web/site/locales/is/home.ftl` `home-app-rover-detail`: "flýtiskoðun" — coinage for Quick Look, which has no Icelandic name.
- `web/site/locales/is/home.ftl` `home-question-ready-answer`: "Næturútgáfur … næturuppfærslur" — no settled term for nightly builds.

## Meet Luft

- `apps/meet/locales/is/meet.ftl` `ready-remove-description`: "flutningakassanum" — the moving box; no settled term.
- `apps/meet/locales/is/meet.ftl` `meet-logs-saved`: "Atvikaskrár úr prufukeyrslu Luft…" — "Try Luft" as „prufukeyrsla”, and logs as „atvikaskrár”; check both.
- `apps/meet/locales/is/meet.ftl` `problem-declined`: "Veldu Já þegar Windows spyr." — assumes the UAC button in the Icelandic language pack is „Já”.
- `apps/meet/desktop/locales/is/desktop.ftl` `check-fast-startup-on`: "Kveikt er á flýtiræsingu" — „flýtiræsing” as in Setup; couldn't verify Windows' Icelandic name for Fast Startup, nor „Diskhreinsun” for Disk Cleanup and „Dulritun tækis” for Device encryption.
- `apps/meet/desktop/locales/is/desktop.ftl` `helper-not-started`: "Hjálparforrit Meet Luft…" — "helper" as „hjálparforrit”.
- `apps/meet/desktop/locales/is/desktop.ftl` `drive-volume-missing`: "Gagnasvæðið { $path }…" — "volume" as „gagnasvæði”; no settled term.
- `apps/meet/locales/is/meet.ftl` `luft-title`: "Luft hjá þér" — "Your Luft" reworded because Luft isn't inflected; check it works as a screen title.
- `apps/meet/locales/is/meet.ftl` `room-place-whole`: "Allur diskurinn { $drive }" — "diskurinn" put first so the drive name stays uninflected; check it reads well with names like "Samsung SSD 990 PRO".
- `apps/meet/locales/is/meet.ftl` `room-place-windows-free`: "Þar eru { $size } þegar laus" — plural agreement assumes a size like "40 GB"; check it reads right with any size.

## Install Luft

- `apps/setup/locales/is/setup.ftl` `setup-destination-meet-drive-description`: "Luft ræsist þaðan með eigin ræsiskrám" — check "ræsist" reads as the system starting from that drive.
