# Maltese review list

Strings in Luft's Maltese translation that a native speaker should check: places where Luft keeps an English word or picks a Maltese one, terms Windows in Maltese doesn't settle, and sentences built around a placeable.

## Terms and shared strings

- `packages/i18n/glossary/mt.csv` `Start`: "Start" — older Windows packs said "Bidu"/"Ibda"; check that keeping Start, with "il-menù Start" in sentences, feels right.
- `packages/i18n/glossary/mt.csv` `Settings`: "Settings" — kept in English as Windows in Maltese does, used with the plural article (is-Settings, fis-Settings); check the plural agreement reads naturally.
- `packages/i18n/glossary/mt.csv` `workspace`: "spazju tax-xogħol" — Windows keeps "workspace" or says "desktop virtwali"; check the Maltese phrase is clear.
- `packages/i18n/glossary/mt.csv` `Keyring`: "Ċurkett taċ-ċwievet" — a literal key ring; check it is understood as a store of passwords, or whether "Keyring" should stay English.
- `packages/i18n/glossary/mt.csv` `Media Viewer`: "Viewer tal-midja" — no settled Maltese word for a viewer; check against alternatives such as "Wiri tal-midja".
- `packages/i18n/glossary/mt.csv` `App Store`: "Store tal-apps" — follows Microsoft Store; "Ħanut tal-apps" is the Maltese alternative.
- `packages/i18n/glossary/mt.csv` `screenshot`: "screenshot" — Windows says "klipp tal-iskrin"; chosen because it is what people say.
- `packages/i18n/glossary/mt.csv` `Do Not Disturb`: "Tiddisturbax" — check it works as a switch name in sentences ("ixgħel Tiddisturbax").
- `packages/i18n/glossary/mt.csv` `shut down`: "Itfi" — the same word as turn off; check the power menu doesn't feel ambiguous next to "Irristartja" and "Sospensjoni".
- `packages/i18n/glossary/mt.csv` `unpin`: "neħħi" — the same verb as remove; check "Neħħi mit-taskbar" is clear enough.
- `packages/i18n/glossary/mt.csv` `unlock`: "żblokka" — chosen to keep "iftaħ" for open; check it pairs naturally with "sakkar".
- `packages/i18n/glossary/mt.csv` `folder`: "fowlder" — Windows' spelling; check it isn't felt as odd next to the English "folder".
- `packages/i18n/glossary/mt.csv` `taskbar`: "taskbar", masculine — check the gender people use (it-taskbar huwa / hija).
- `packages/ui/locales/mt/ui.ftl` `ui-finger-*` `.inline`: "s-saba’ l-werrej tal-lemin" … — written without the euphonic i because both sentences put it after a verb ending in a vowel (Poġġi, Għaddi); check all ten read well in both sentences.
- `packages/ui/locales/mt/ui.ftl` `ui-finger-right-thumb`: "Is-saba’ l-kbir tal-lemin" — check "saba’ l-kbir" is the usual word for thumb here.
- `packages/ui/locales/mt/ui.ftl` `ui-media-play` / `ui-media-pause`: "Doqq" / "Pawża" — a verb next to a noun, as media players commonly label them; check they feel natural.
- `packages/ui/locales/mt/ui.ftl` `ui-toast-dismiss`: "Warrab" — "Agħlaq" is the alternative.
- `packages/ui/locales/mt/ui.ftl` `ui-time-just-now`: "issa stess" — check it fits wherever relative times appear ("ftit ilu" is the alternative).
- `packages/ui/locales/mt/ui.ftl` `ui-recovery-key-saved` / `ui-recovery-key-copied`: "Issejvjata" / "Ikkopjata" — feminine to agree with ċavetta; check they read well standing alone.
- `packages/ui/locales/mt/ui.ftl` `ui-window-minimize` / `ui-window-maximize`: "Imminimizza" / "Immassimizza" — imperatives of Windows' verbs; check the spelling.
- `apps/settings/locales/mt/settings.ftl` `settings-more-show`: "Uri { $count } aktar" — "aktar" avoids agreeing with items of unknown gender and number; check it reads well for every count.
- `apps/settings/locales/mt/pages.ftl` `settings-page-display`: "Skrins" — Windows' "displej" is the alternative; check the plural fits the sidebar.
- `apps/settings/locales/mt/pages.ftl` `settings-page-appearance`: "Dehra" — check it is the word people expect for the appearance page ("Personalizzazzjoni" is Windows').
- `kestrel/ui/locales/mt/shell.ftl` `keys-space`: "Spacebar" — as in Microsoft's Maltese key names; check it looks right in shortcut labels such as "Ctrl+Spacebar".

## Kestrel and setup

- `kestrel/ui/locales/mt/desktop.ftl` `task-view-desktop`: "Spazju tax-xogħol { $number }" — follows the glossary's workspace term; Windows in Maltese may say "Desktop 1", and this may clip on small task view cards.
- `kestrel/ui/locales/mt/desktop.ftl` `window-menu-unmaximize`: "Ċekken lura" — no settled Maltese term for unmaximize; check it reads naturally next to Immassimizza.
- `kestrel/ui/locales/mt/system.ftl` `privacy-indicator`: "Fl-użu: { $things }" — reworded so the list items (kamera, mikrofonu, skrin, post, twieqi) need no article or agreement; check it reads well as a screen-reader label.
- `kestrel/ui/locales/mt/system.ftl` `oom-closed-body`: "…għalhekk Luft għalaq dan biex…" — rephrased with Luft as subject so the same body fits an app (feminine) and a container (masculine).
- `kestrel/ui/locales/mt/system.ftl` `health-gpu-reset-body`: "Il-kompjuter irristartja waħdu ({ $date }, { $time })." — date and time put in brackets to avoid article assimilation with the formatted values.
- `kestrel/ui/locales/mt/portal.ftl` `screen-share-title`: "Tippermetti li { $appName } tara l-iskrin?" — built around "li" so the unknown-app fallback "l-app" fits without "ma’ l-app"; loses the word "share".
- `kestrel/ui/locales/mt/portal.ftl` `portal-account-title`: "Tippermetti li { $appName } tara l-isem u l-istampa tal-kont?" — same construction as above.
- `kestrel/engine/locales/mt/engine.ftl` `caffeine-until`: "Sa { $time }" — "sal-" would need assimilation with the formatted time; check "Sa 14:30" reads acceptably.
- `kestrel/engine/locales/mt/engine.ftl` `close-dialog-title`: "“{ $appName }” mhix qed tirrispondi" — feminine agreement for an app name; check it reads naturally with names like Firefox.
- `kestrel/engine/locales/mt/engine.ftl` `network-menu-tethers`: "Tethering bil-Bluetooth" — no settled Maltese term; kept the English tethering.
- `kestrel/engine/locales/mt/engine.ftl` `screenshot-screencasts-folder`: "Rekordjar tal-iskrin" — folder name on disk; check it's a good folder name versus keeping "Screencasts".
- `apps/setup/locales/mt/setup.ftl` `setup-region-intro-guessed`: "Ejja nissettjaw kollox. Għażilna { $guesses }, …" — the list is built from "il-lingwa / it-tastiera / iż-żona tal-ħin" plus "skont il-kompjuter / skont in-netwerk"; check the joined sentence flows.
- `apps/setup/locales/mt/setup.ftl` `setup-replace-keeps-accounts`: "{ $count } kont ieħor fiha, bil-fajls tagħhom" — singular noun with plural possessive for many/other; check the agreement.
- `apps/setup/installer/locales/mt/installer.ftl` `installer-box-unopened`: "Il-kaxxa tat-trasferiment ma setgħetx tinfetaħ" — "moving box" rendered as transfer box; check it matches what Meet Luft calls it in Maltese.

## Settings

- `apps/settings/locales/mt/connections.ftl` `settings-bluetooth-request-unnamed`: "dan l-apparat" — chosen so it fits after ma’, għal and lil without article contraction; check every pairing sentence reads well with it and with real device names.
- `apps/settings/locales/mt/connections.ftl` `settings-bluetooth-windows`: "{ $devices } huwa mqabbad f’Windows…" — masculine agreement assumed for a single device name; check.
- `apps/settings/locales/mt/connections.ftl` `settings-bluetooth-windows-more`: "{ $count } oħrajn" — ends a list like "Tastiera, Maws u 3 oħrajn"; check with the list joiner and for 11+.
- `apps/settings/locales/mt/connections.ftl` `settings-network-security-enterprise`: "Enterprise" — kept as the WPA standard name; check whether a Maltese word is preferred.
- `apps/settings/locales/mt/connections.ftl` `settings-accounts-syncing`: "Sinkronizzazzjoni ta’ { $count } bidliet" — nominal phrasing to avoid verb agreement with 11+; check it doesn't read stiff.
- `apps/settings/locales/mt/devices.ftl` `settings-display-orientation-portrait-right`: "Ritratt, lejn il-lemin" — Pajsaġġ/Ritratt follow Windows; check.
- `apps/settings/locales/mt/devices.ftl` `settings-sound-mute`: "Itfi l-ħoss: { $name }" — screen-reader label; colon form chosen because $name may be "Volum" or an app name.
- `apps/settings/locales/mt/devices.ftl` `settings-sound-apps-playing`: "{ $count } app qed iddoqq il-ħoss" — singular verb for many/other per the style guide; a native may prefer plural agreement with 11+.
- `apps/settings/locales/mt/devices.ftl` `settings-dictation-language-unavailable`: "Mhux disponibbli f’dan il-kompjuter: { $language }" — reordered to avoid gender agreement with the language name.
- `apps/settings/locales/mt/devices.ftl` `settings-mouse-touchpad-scroll-with`: "Scrolling permezz ta’" — picker label followed by "Żewġ swaba’" / "Xifer"; check it reads well.
- `apps/settings/locales/mt/devices.ftl` `settings-keys-volume-up`: "Volum ’il fuq" — media key names translated since keyboards print icons; check whether English names are expected.
- `apps/settings/locales/mt/personalization.ftl` `settings-fonts-sample`: "Ġużeppi ħareġ jiġri wara ċ-ċerv żgħir fil-bosk" — not a true pangram; it shows the Maltese special letters. A native reviewer may know a real Maltese pangram.
- `apps/settings/locales/mt/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Stampi › Wallpapers" — Wallpapers is the real folder name and stays English; check that "Stampi" is what the Pictures folder is called on a Maltese system (it may stay "Pictures").
- `apps/settings/locales/mt/personalization.ftl` `settings-appearance-tint-teal`: "Ċelesti skur" — no settled Maltese word for teal.
- `apps/settings/locales/mt/personalization.ftl` `settings-appearance-tint-slate`: "Griż blu" — slate as a colour name; check it reads naturally.
- `apps/settings/locales/mt/personalization.ftl` `settings-accessibility-bounce-keys`: "Bounce keys" — kept in English as in the page keywords; a Maltese term may exist.
- `apps/settings/locales/mt/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } mixgħula" — feminine agreement with an implied “għajnuna”; check it reads well.
- `apps/settings/locales/mt/protection.ftl` `settings-privacy-screen-lock`: "Sakkar l-iskrin" — heading is a verb phrase; Maltese lacks a common noun for locking the screen.
- `apps/settings/locales/mt/protection.ftl` `settings-encryption-passphrase-field`: "Passphrase" — kept in English and feminine, distinct from password; no glossary term exists.
- `apps/settings/locales/mt/protection.ftl` `settings-encryption-unlocks-chip`: "Tiżblokka waħedha biċ-ċippa tas-sigurtà" — feminine verbs assume the implied subject is id-diska; check it reads right under the Device encryption title.
- `apps/settings/locales/mt/protection.ftl` `settings-passwords-history-read`: "{ $app } uża “{ $item }”" — bare app names take masculine verbs per the style guide's “Rover huwa”; check this across the history messages.
- `apps/settings/locales/mt/system.ftl` `settings-users-fingerprint-remove`: "Neħħi { $finger }" — the title form of the finger name starts with a capital (Is-saba’ …) mid-sentence; screen-reader label only.
- `apps/settings/locales/mt/system.ftl` `settings-login-wallpaper-own`: "Tiegħu stess" — masculine generic; may need a neutral phrasing.
- `apps/settings/locales/mt/protection.ftl` `settings-privacy-location`: "Post" — location is "post" everywhere (servizzi tal-post, Itfi s-servizzi tal-post); "lokalità" was the alternative but reads as a town or village; check against what people expect.
- `apps/settings/locales/mt/system.ftl` `settings-updates-elsewhere-refresh-by`: "Qed isir tiftix għal aġġornamenti minn { $app }" — impersonal so it reads with an app name and with "app oħra" without gender agreement; check it doesn't sound stiff.

## Website

- `web/site/locales/mt/download.ftl` `download-meet-note`: "Aktar informazzjoni, imbagħad Ħaddem xorta waħda" — couldn't verify the SmartScreen labels in Windows' Maltese language pack; check them against the real dialog.
- `web/site/locales/mt/home.ftl` `home-essentials-text`: "madum" — "tiles" for the quick settings tiles; check it isn't read too literally as floor tiles.
- `web/site/locales/mt/home.ftl` `home-app-disks-detail`: "drajvs USB magħmula minn image" — "image" kept in English for a disk image, as in the security section; check it reads naturally.
- `web/site/locales/mt/home.ftl` `home-motion-text`: "molol" — "springs"; check the image of motion on springs comes across.

## Meet Luft

- `apps/meet/locales/mt/meet.ftl` `linux-ready-description`: "{ $system } jibqa’ jibda bħas-soltu…" — the verb is masculine, which fits system names such as "Fedora Linux 42" but not the feminine fallback "din is-sistema"; same in linux-ready-try-description, linux-ready-restart-try and check-startup-uefi-linux.
- `apps/meet/locales/mt/meet.ftl` `ready-remove-description`: "il-kaxxa tal-ġarr" — "moving box"; check that the image comes across, or whether there's a more natural phrase.
- `apps/meet/locales/mt/meet.ftl` `problem-tidy`: "entrati tal-boot" — "start entries" in the firmware boot menu; no settled Maltese term.
- `apps/meet/locales/mt/meet.ftl` `problem-declined`: "Agħżel Iva meta jistaqsik Windows" — I assume Windows' Maltese UAC prompt shows "Iva"; confirm. Fast Startup, Disk Cleanup and File Explorer are kept in English, as in Setup.
- `apps/meet/desktop/locales/mt/desktop.ftl` `helper-not-started`: "L-għajnuna ta’ Meet Luft" — "helper", the part that works on the drive; check that it reads as a program and not as help.
- `apps/meet/desktop/locales/mt/desktop.ftl` `check-encryption-changing-detail`: "taħt Ċċifrar tal-apparat" — the Device encryption page name in Windows' Maltese Settings is unverified.
