# Slovak review list

Strings in Luft's Slovak translation that a native speaker should check, each listed because the English is ambiguous, the term has no settled Slovak equivalent, or the grammar around a placeable may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/sk.tbx` `account`: "účet" — Windows says „konto“; check that „účet“ is the better known word for both user and online accounts.
- `packages/i18n/glossary/sk.tbx` `tray`: "systémová lišta" — KDE's word; Windows has no direct equivalent. Check it reads as a button of background app icons.
- `packages/i18n/glossary/sk.tbx` `snap layout`: "rozloženie okien" — Windows uses „rozloženie prichytenia“; check which people recognize.
- `packages/i18n/glossary/sk.tbx` `Keep awake`: "Nezaspávať" — no settled term; check it fits a Quick settings tile.
- `packages/i18n/glossary/sk.tbx` `Power saver`: "Šetrenie energie" — check against how Slovak GNOME and Windows name the power profiles.
- `packages/i18n/glossary/sk.tbx` `remove` / `delete`: "odstrániť" / "vymazať" — Windows uses „odstrániť“ for both; check the split feels natural.
- `packages/i18n/glossary/sk.tbx` `board`: "tabuľa" — new feature with no existing term.
- `packages/i18n/glossary/sk.tbx` `Start`: "Start" — Slovak Windows writes „Štart“; Luft keeps the name unchanged.
- `apps/settings/locales/sk/settings.ftl` `settings-subpage-back`: "Späť na stránku { $page }" — page titles stay in the nominative after „stránku“; check it sounds natural with titles like „Klávesnica“.
- `apps/settings/locales/sk/settings.ftl` `settings-more-show`: "Zobraziť ešte { $count }" — identical in every plural form to avoid guessing the hidden noun's gender.
- `packages/web/ui/locales/sk/ui.ftl` `ui-select-placeholder`: "Vybrať" — infinitive like buttons; „Vyberte“ might read better as a placeholder.
- `packages/web/ui/locales/sk/ui.ftl` `ui-split-windows-size`: "{ $size }, využité { $used }" — check the word order reads well.
- `packages/web/ui/locales/sk/ui.ftl` `ui-fingerprint-swipe`: "Potiahnite { $finger } po snímači." — check the verb for swipe readers.
- `kestrel/ui/locales/sk/shell.ftl` `keys-space`: "Medzerník" — the only key name translated; others stay as printed on Slovak keyboards.

## Kestrel and setup

- `kestrel/ui/locales/sk/system.ftl` `network-menu-tether`: "Tethering" — English loanword used for Bluetooth tethering; check it reads naturally or whether "Zdieľanie pripojenia" fits the tile.
- `kestrel/ui/locales/sk/system.ftl` `privacy-indicator`: "Používa sa: { $things }" — built as a label + list to avoid gender agreement with "vaša/váš/vaše"; check it sounds natural with a list like "kamera, mikrofón a obrazovka".
- `kestrel/ui/locales/sk/portal.ftl` `portal-unknown-app-subject`/`portal-unknown-app-object`: "Táto aplikácia"/"táto aplikácia" — all $appName sentences use the name in the nominative ("Môže { $appName } …?"); check the uninflected real app names read well there.
- `apps/setup/locales/sk/setup.ftl` `setup-region-field-keyboard`: "klávesnicu" — written in the accusative because it is only used inside "Odhadli sme { $guesses }"; check no other place shows it alone.
- `kestrel/ui/locales/sk/auth.ftl` `ctrl-alt-tab-unlock`: "Okno odomknutia" — unclear English source ("Unlock Window" as a noun); check wording.
- `kestrel/ui/locales/sk/desktop.ftl` `task-view-desktop`: "Pracovný priestor { $number }" — workspace name in the task view, matching Settings; check it fits under each workspace thumbnail.
- `apps/setup/locales/sk/setup.ftl` `setup-windows-hibernated` / `setup-windows-fast-startup`: "rýchle spustenie" — check the name Slovak Windows uses for Fast Startup (rýchle spúšťanie?) and whether it should be capitalized.
- `kestrel/ui/locales/sk/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.

## Settings

- `apps/settings/locales/sk/connections.ftl` `settings-network-security-owe`: "Rozšírená otvorená" — no settled Slovak term for OWE / Enhanced Open; check what Windows or Android show in Slovak.
- `apps/settings/locales/sk/connections.ftl` `settings-network-ip-link-local`: "Len lokálne pre linku" — follows GNOME's style; check it reads naturally.
- `apps/settings/locales/sk/connections.ftl` `settings-bluetooth-request-unnamed`: "zariadenie" — the pairing sentences were built so { $name } is always nominative/accusative ("Spárovať { $name }?", "Zadajte kód, ktorý zobrazuje { $name }"); check they read well with both a real device name and "zariadenie".
- `apps/settings/locales/sk/connections.ftl` `settings-bluetooth-request-display`: ".description = Napíšte tento kód na pripájanom zariadení a potom stlačte Enter." — { $name } dropped because the locative case can't fit an arbitrary name; the title still names the device.
- `apps/settings/locales/sk/connections.ftl` `settings-bluetooth-windows`: "Zariadenie spárované v systéme Windows: { $devices }. …" — colon construction avoids gender agreement with the device list; check it reads naturally.
- `apps/settings/locales/sk/system.ftl` `settings-accounts-online`: "Každý účet je priečinok v priečinku Cloud vo vašom domovskom priečinku, …" — "Cloud" kept as the folder's literal name; check that the folder isn't localized, and the triple "priečinok" is acceptable.
- `apps/settings/locales/sk/system.ftl` `settings-accounts-apple-account`: "Apple účet" — Apple's current Slovak name for Apple Account; confirm.
- `apps/settings/locales/sk/system.ftl` `settings-accounts-kept`: "Ponechané: { $count } položka, zvyšok sa stiahne pri otvorení" — colon form to avoid participle agreement across plural forms.
- `apps/settings/locales/sk/devices.ftl` `settings-power-time-left`: "Zostáva približne { $time }" — singular verb with durations like "3 hodiny 20 minút"; acceptable in UI but strictly "zostávajú" for 2–4. Same in `settings-power-charging-until-full` ("do úplného nabitia zostáva { $time }").
- `apps/settings/locales/sk/devices.ftl` `settings-power-screen-off`: "Vypnutie obrazovky" — English "Turn off the screen after" + picker; rephrased as a noun so the duration options stay in the nominative ("5 minút"). Same idea for `settings-power-long-sleep-after` = "Čas do vypnutia".
- `apps/settings/locales/sk/devices.ftl` `settings-sound-mute`: "Stlmiť: { $name }" — screen-reader label; colon avoids "Stlmiť Hlasitosť" or a case clash with app names.
- `apps/settings/locales/sk/devices.ftl` `settings-keys-keypad`: "Num { $key }" — Slovak keyboards print nothing for this; check the abbreviation is clear.
- `apps/settings/locales/sk/devices.ftl` `settings-keys-volume-up` (and the other media keys): "Zvýšiť hlasitosť" — verb-like key names; check against Windows' Slovak shortcut labels.
- `apps/settings/desktop/locales/sk/desktop.ftl` `desktop-shortcut-focus-active-notification`: "Presunúť fokus na aktívne oznámenie" — "fokus" is common in GNOME Slovak but informal; check.
- `packages/web/ui/locales/sk/ui.ftl` `ui-passphrase-field`: "Prístupová fráza" — passphrase isn't in the glossary; chosen to stay distinct from „heslo“. Check it reads naturally next to BitLocker/GNOME wording.
- `apps/settings/locales/sk/protection.ftl` `settings-encryption-pin`: "PIN pri spustení" — „PIN“ alone in short labels and buttons, „kód PIN“ in sentences; check the mix is acceptable.
- `apps/settings/locales/sk/protection.ftl` `settings-passwords-access-revoke`: "Zakázať aplikácii { $app } používať { $item }" — $item is a saved item's name in accusative position; may not fit every value.
- `apps/settings/locales/sk/protection.ftl` `settings-passwords-ssh-copy`: "Kopírovať verejný kľúč pre { $name }" — avoids „verejný kľúč kľúča“; check it's natural.
- `apps/settings/locales/sk/protection.ftl` `settings-security-anti-cheat`: "Hry s ochranou proti podvádzaniu" — gamers may simply say „anti-cheat“.
- `apps/settings/locales/sk/system.ftl` `settings-login-show-person`: "Zobrazovať { $name }" — person's name lands in accusative; undeclined names may look odd.
- `apps/settings/locales/sk/system.ftl` `settings-updates-released`: "Vydané { $when }" — assumes $when reads like „pred 3 dňami“ or „včera“.
- `apps/settings/locales/sk/personalization.ftl` `settings-fonts-sample`: "Kŕdeľ ďatľov učí koňa žrať kôru." — short well-known sentence rich in diacritics, not a full pangram.
- `apps/settings/locales/sk/personalization.ftl` `settings-accessibility-bounce-keys`: "Filtrovanie opakovaných stlačení" — long; check against the term KDE/GNOME Slovak use and whether it clips.
- `apps/settings/locales/sk/personalization.ftl` `settings-fonts-monospace`: "Neproporcionálne" — some OSes say „s pevnou šírkou“; check preference.

## Website

- `web/site/locales/sk/download.ftl` `download-meet-note`: "Ďalšie informácie … Spustiť aj tak" — SmartScreen labels from memory, not verified against a Slovak Windows.
- `web/site/locales/sk/home.ftl` `home-motion-heading`: "Pohyb, ktorý dáva zmysel." — free rendering of "It moves like it means it"; check the tone.
- `web/site/locales/sk/home.ftl` `home-app-mailman-detail`: "preverovanie nových odosielateľov" — "screener" has no settled Slovak term.
- `web/site/locales/sk/site.ftl` `site-footer-made`: "Vytvára { $lantharos }." — Lantharos as the subject avoids declining the name; check it reads naturally as a credit line.

## Meet Luft

- `apps/meet/locales/sk/meet.ftl` `meet-logs-saved`: "Denníky zo skúšania systému Luft sú uložené na pracovnej ploche" — "logs" as „denníky“ and "Try Luft" described rather than named; check both.
- `apps/meet/desktop/locales/sk/desktop.ftl` `check-start-entries`: "Stará položka spúšťania" — "start entry" (firmware boot menu entry) used throughout Meet Luft.
- `apps/meet/desktop/locales/sk/desktop.ftl` `check-fast-startup-on-detail`: "…prejde do režimu dlhodobého spánku…" — follows the guide's „Dlhodobý spánok“ for hibernate; check it reads well in a sentence.
- `apps/meet/desktop/locales/sk/desktop.ftl` `check-secure-boot-turn-on`: "…pri zobrazení loga { $maker } stlačte { $key } a prejdite do { $place }." — $key may be "tlačidlo zvýšenia hlasitosti" and $place an English menu path; check both fit.
- `apps/meet/locales/sk/meet.ftl` `room-place-windows-free`: "Už je tam voľných { $size }" — genitive plural „voľných“ like `stick-full-description`; check it reads well with sizes such as „1,5 GB“ or „1 TB“.
- `apps/meet/locales/sk/meet.ftl` `room-erase-bitlocker`: "Šifrovaný nástrojom BitLocker" — masculine to agree with the partition (oddiel) it labels; check it fits next to each listed volume.
- `apps/meet/locales/sk/meet.ftl` `room-erase-understood`: "Viem, že časť z toho je šifrovaná nástrojom BitLocker a nebude sa dať obnoviť" — first person on a tick box, as in English; check the wording is natural for a confirmation.
- `apps/meet/locales/sk/meet.ftl` `luft-resize-title`: "Zmeniť veľkosť systému Luft" — shortened from "change how much space Luft has"; check it still says the same thing.
- `apps/meet/desktop/locales/sk/desktop.ftl` `helper-box-room-shortfall`: "V mieste pre Luft je voľných ešte { $available } GB…" — "Luft's room" rendered as the space made for Luft; check it's clear.
