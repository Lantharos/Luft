# Irish review list

Strings in Luft's Irish translation that a native speaker should check: terms with no settled equivalent in Irish software, choices where Microsoft and GNOME differ, and wording around placeables where initial mutations may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/ga.tbx` `Start`: "Tosaigh" — follows Irish Windows; check it reads as a menu name and not as a button telling the reader to start.
- `packages/i18n/glossary/ga.tbx` `board`: "clár" — no OS has this mode, and clár also means programme; check it reads as a canvas of windows.
- `packages/i18n/glossary/ga.tbx` `Quick settings`: "Socruithe tapa" — Windows 11's Irish term isn't certain; check whether "Mearshocruithe" is what people know.
- `packages/i18n/glossary/ga.tbx` `snap`, `snap layout`, `snap group`: "snapáil", "leagan amach snapála", "grúpa snapála" — loanword chosen because greamaigh is paste; check against téarma.ie and Windows' Irish Snap terms.
- `packages/i18n/glossary/ga.tbx` `tray`: "tráidire" — chosen over Windows' notification area term to avoid a clash with the notification center; check it is understood.
- `packages/i18n/glossary/ga.tbx` `wallpaper`: "cúlbhrat" — Windows' personalisation page uses cúlra; check cúlbhrat is familiar.
- `packages/i18n/glossary/ga.tbx` `accent color`: "dath béime" — check against Windows' Irish Colours page.
- `packages/i18n/glossary/ga.tbx` `Keep awake`: "Coinnigh múscailte" — no OS equivalent; check it fits a Quick settings tile and reads as keeping the computer awake.
- `packages/i18n/glossary/ga.tbx` `passkey`: "eochair rochtana" — no settled Irish term; check against Microsoft and Google's Irish sign-in pages.
- `packages/i18n/glossary/ga.tbx` `login screen`: "scáileán sínithe isteach" — consistent with sínigh isteach, but long; GNOME says logáil isteach.
- `packages/i18n/glossary/ga.tbx` `emoji`: "emoji", plural "emojithe" — check the plural.
- `packages/i18n/glossary/ga.tbx` `undo`, `cancel`: both "Cealaigh" — same word, as in Microsoft and LibreOffice; check no screen shows both side by side.
- `docs/translations/ga.md` Plurals: the `other` form uses the unmutated singular; for 11–19 the spoken form mutates (aon fhógra déag, seacht bhfógra déag), so check this is acceptable with digits.
- `packages/web/ui/locales/ga/ui.ftl` `ui-finger-*` `.inline`: "do chorrmhéar dheas", "d’ordóg chlé" … — the possessive is inside the inline form so the mutation is right; check the ring finger "méar fáinne dheas" reads naturally.
- `packages/web/ui/locales/ga/ui.ftl` `ui-edit-select-all`: "Roghnaigh uile" — Microsoft's form; "Roghnaigh gach rud" is the alternative.
- `packages/web/ui/locales/ga/ui.ftl` `ui-media-position`: "Suíomh" — also means location and website; check it reads as the playback position.
- `packages/web/ui/locales/ga/ui.ftl` `ui-split-windows-size`: "{ $size }, { $used } in úsáid" — check it reads as how much of Windows' share is used.
- `packages/web/settings-pages/locales/ga/pages.ftl` `settings-page-about`: "Eolas" — Windows says "Maidir le", which reads as unfinished on its own; check the choice.
- `packages/web/settings-pages/locales/ga/pages.ftl` `settings-page-display`: "Scáileáin" — Windows' page is "Taispeáint"; check which people look for.
- `kestrel/ui/locales/ga/shell.ftl` `keys-space`: "Spás" — the space bar has no printed name; check it reads well in shortcuts like Ctrl+Spás.
- `kestrel/ui/locales/ga/shell.ftl` `battery-level` `[plugged]`: "Ceallra { $percentage }%, plugáilte isteach" — check it conveys plugged in but not charging.
- `packages/i18n/glossary/ga.tbx` `dark style`: "Stíl dhorcha" — used on the Quick settings tile and in running text so it matches the Stíl row in Settings; Irish Windows may say "Mód dorcha", so check the tile still reads as a switch.
- `packages/i18n/glossary/ga.tbx` `PIN`, `passphrase`: "UAP", "frása faire" — UAP follows Irish Windows Hello and is also used for Bluetooth pairing and mobile broadband PINs; check both read naturally, including "d’UAP" and the plural "UAPanna".

## Kestrel and setup

- `kestrel/ui/locales/ga/surfaces.ftl` `start-search-settings-section`: "Socruithe: { $page }" — "{ $page } settings" needs a genitive the placeable can't take; check the colon form reads well in search results.
- `kestrel/ui/locales/ga/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from } mar { $to }" — "i"/"go" would need mutation or n-/h- before unit symbols; check "mar" sounds natural for a unit conversion.
- `kestrel/ui/locales/ga/surfaces.ftl` `start-search-file-reveal`: "Taispeáin i { $fileManager }" — correct for Rover; would need "in" if a file manager name ever starts with a vowel.
- `kestrel/ui/locales/ga/system.ftl` `privacy-indicator`: "In úsáid: { $things }" — rebuilt as a label so the list items need no lenition after "do".
- `kestrel/ui/locales/ga/portal.ftl` `screen-share-title`: "An bhféadfaidh { $appName } do scáileán a fheiceáil?" — rephrased from "Share your screen with …?" because "le" + "an aip" (unknown-app fallback) would need "leis an"; same pattern used for the USB, account, remote desktop, input capture and shortcuts titles.
- `kestrel/ui/locales/ga/portal.ftl` `print-title-from-app`: "Priontáil – { $appName }" — dash instead of "ó", which would need "ón aip" for the fallback; same for `print-job-name-from-app`.
- `kestrel/ui/locales/ga/portal.ftl` `print-paper-letter`: "Letter" — US paper size names (Letter, Legal, Executive, Tabloid, Statement) kept in English; check what Irish printer dialogs use.
- `kestrel/ui/locales/ga/system.ftl` `network-menu-hotspot`: "{ $name } (ball te)" — "ball te" for hotspot has no settled OS usage.
- `kestrel/ui/locales/ga/system.ftl` `network-menu-tether`: "Teadráil" — term for Bluetooth tethering; check it is understood, also in `network-menu-tethers`.
- `kestrel/ui/locales/ga/desktop.ftl` `switch-monitor-join`: "Leathnaigh" — "Join displays" rendered as Windows' "Extend"; check it fits under 15 characters with the meaning intended.
- `kestrel/ui/locales/ga/system.ftl` `display-change-countdown`: "… i gceann { $seconds } shoicind" — lenited for one/two/few, plain for many/other; check counting forms of soicind.
- `kestrel/ui/locales/ga/auth.ftl` `end-session-remote-user`: "{ $userName } (cian)" — "cian" for remote is terse; maybe "(cianda)".
- `apps/setup/locales/ga/setup.ftl` `setup-region-intro-guessed`: "Bímis ag tosú. Fuaireamar { $guesses }, mar sin athraigh aon rud nach bhfuil i gceart." — guesses are built as "teanga agus méarchlár ó do ríomhaire"; "Fuaireamar" (we got) replaces "we guessed"; check the joined sentence reads naturally.
- `apps/setup/locales/ga/setup.ftl` `setup-windows-bitlocker`: "… i mBainistíocht Diosca …" — the Irish Windows name of Disk Management and Fast Startup ("Tosú Tapa") should match Microsoft's Irish UI.
- `apps/setup/locales/ga/setup.ftl` `setup-replace-keeps-tools`: "{ $count } uirlis líne na n-orduithe …" — check the counting form of uirlis and the "n-" after 7–10.
- `apps/setup/locales/ga/setup.ftl` `setup-account-full-name-example`: "Peig Sayers" — chosen as a well-known Irish name.

## Settings

- `apps/settings/locales/ga/connections.ftl` `settings-network-known-count`: "{ $count } líonra shábháilte" (two) — adjective lenited after dhá, plain elsewhere; check the adjective agreement across all five variants.
- `apps/settings/locales/ga/system.ftl` `settings-accounts-syncing`: "{ $count } athrú á shioncrónú" / "á sioncrónú" — check whether the possessive should agree with the singular noun (á shioncrónú) in every variant.
- `apps/settings/locales/ga/connections.ftl` `settings-bluetooth-request-*`: "Péireáil { $name }?", "Ceadaigh { $name } a phéireáil?" — $name can be "an gléas", so every sentence keeps $name out of prepositional phrases (no ar an/leis an eclipsis); check they still read naturally.
- `apps/settings/locales/ga/system.ftl` `settings-accounts-online`: "…san fhillteán Cloud i d’fhillteán baile…" — assumes the folder is literally named Cloud and is not localised.
- `apps/settings/locales/ga/system.ftl` `settings-accounts-approve`: "Úsáideann do chuntas Apple Advanced Data Protection." — Apple's feature name kept in English since Apple has no Irish localisation; confirm.
- `apps/settings/locales/ga/system.ftl` `settings-accounts-working`: "Ag caint leis an tseirbhís { $provider }…" — rephrased to avoid "le" before vowel-initial names (iCloud, OneDrive); check it isn't too wordy.
- `apps/settings/locales/ga/connections.ftl` `settings-network-security-owe`: "Oscailte feabhsaithe" — no settled Irish term for Wi‑Fi Enhanced Open.
- `apps/settings/locales/ga/devices.ftl` `settings-power-long-sleep-weeks`: "{ $weeks } seachtaine" (few/many) — check the counting form after 3–10 versus "sheachtain".
- `apps/settings/locales/ga/devices.ftl` `settings-power-duration-hours`: "{ $hours } uaire" / "n-uaire" — counting forms of uair after digits; used inside other sentences, check the flow.
- `apps/settings/locales/ga/devices.ftl` `settings-sound-app-output`: "Aschur { $app }" — picker label rephrased as "Output of app" instead of "Play app on".
- `apps/settings/locales/ga/devices.ftl` `settings-display-night-light-warmth`: "Teas" — slider label; "Teocht dhatha" would be more technical.
- `apps/settings/locales/ga/personalization.ftl` `settings-fonts-sample`: "D’fhuascail Íosa, Úrmhac na hÓighe Beannaithe, pór Éava agus Ádhaimh" — the traditional Irish pangram. It's religious, so a reviewer may prefer something neutral.
- `apps/settings/locales/ga/personalization.ftl` `settings-appearance-icons-tinted` / `settings-appearance-tint` / `settings-appearance-icons-clear`: "Daite" / "Dath" / "Trédhearcach" — the icon styles have no established Irish names.
- `apps/settings/locales/ga/personalization.ftl` `settings-appearance-tint-slate`: "Slinn" — check whether people say "liathghorm" for this color instead.
- `apps/settings/locales/ga/personalization.ftl` `settings-appearance-wallpaper-empty` / `-folder-description`: "Pictiúir › Wallpapers" — this assumes the Pictures folder shows as "Pictiúir" and the Wallpapers folder keeps its English name on disk.
- `apps/settings/locales/ga/personalization.ftl` `settings-cursors-folder-description`: "…san fhillteán Baile › .local › share › icons" — "Baile" for the Home folder, as in GNOME's Irish translation.
- `apps/settings/locales/ga/personalization.ftl` `settings-taskbar-look`: "Dreach" — chosen because "Cuma" is already Appearance and "Stíl" is already Style.
- `apps/settings/locales/ga/personalization.ftl` `settings-accessibility-reduce-motion-description`: "Céimnítear isteach agus amach in áit sleamhnú agus súmáil" — check that "céimnigh" reads clearly as a fade.
- `apps/settings/locales/ga/protection.ftl` `settings-encryption-drives-auto-unlock`: "Tiomántáin chriptithe a dhíghlasáiltear leis an ríomhaire seo: { $count }" — a "label: count" form chosen to avoid number–noun–adjective mutations; check whether a full sentence with all five forms reads better.
- `apps/settings/locales/ga/protection.ftl` `settings-passwords-contents`: "{ $count } mhír" — "item" used instead of "passwords and keys" to keep the counting form simple. Check that it's clear enough in context.
- `apps/settings/locales/ga/protection.ftl` `settings-passwords-stores-count`: "Sínithe isteach sábháilte: { $count }" — the same label-and-count form, used to avoid mutating "síniú isteach" plus an adjective.
- `apps/settings/locales/ga/protection.ftl` `settings-passwords-access-revoke` / `-reset`: "Ná lig don aip { $app } { $item } a úsáid" / "Lig don aip { $app } { $item } a iarraidh arís" — two names next to each other with nothing between them. Check this works for screen readers.
- `apps/settings/locales/ga/protection.ftl` `settings-security-anti-cheat`: "Cluichí le frith-chaimiléireacht" — there is no settled term for anti-cheat.
- `apps/settings/locales/ga/system.ftl` `settings-datetime-format-12h`: "r.n./i.n." — check this is the abbreviation people expect on a clock setting.
- `apps/settings/locales/ga/system.ftl` `settings-updates-apps-count`: "Nuashonruithe i Schelf do { $count } aip" — rephrased to avoid "tá nuashonrú ag", so check the word order.
- `kestrel/settings/locales/ga/settings.ftl` `drives-windows-read-only`: "inléite amháin" — used for read-only; check it reads naturally for a drive.
- `apps/settings/locales/ga/system.ftl` `settings-about-mount-internal`: "Feistigh" — chosen for mount; check whether people would expect a different verb.

## Website

- `web/site/locales/ga/download.ftl` `download-meet-note`: "roghnaigh Tuilleadh faisnéise, ansin Rith ar aon nós" — couldn't verify the SmartScreen button labels of the Irish Windows language pack.
- `web/site/locales/ga/home.ftl` `home-wallpapers-text`: "Tagann { $count } ghrianghraf leis" — counting forms follow the style guide; check the [other] form reads well for 11–19.
- `web/site/locales/ga/home.ftl` `home-question-ready-answer`: "leaganacha oíche" — no settled term for nightly builds.
- `web/site/locales/ga/site.ftl` `site-nav-docs`: "Doiciméadú" — check against „Cáipéisíocht” for documentation.

## Meet Luft

- `apps/meet/locales/ga/meet.ftl` `problem-declined`: "Roghnaigh Tá nuair a fhiafraíonn Windows." — couldn't verify the UAC Yes button in the Irish language pack.
- `apps/meet/locales/ga/meet.ftl` `ready-remove-description`: "an bosca imirce" — the moving box; no settled term.
- `apps/meet/locales/ga/meet.ftl` `meet-logs-saved`: "na logaí ó thriail Luft" — "Try Luft" written as an ordinary phrase rather than a name.
- `apps/meet/desktop/locales/ga/desktop.ftl` `check-space-short-windows`: "Glantachán Diosca" — assumed Irish name of Disk Cleanup; also „Criptiú gléis” for the Device encryption page; verify both.
- `apps/meet/desktop/locales/ga/desktop.ftl` `helper-not-started`: "cúntóir Meet Luft" — "helper" as „cúntóir”.
- `apps/meet/desktop/locales/ga/desktop.ftl` `check-start-entries`: "{ $count } sheaniontráil tosaithe" — mutation of a compound with „sean-” after numbers; check the forms.
- `apps/meet/desktop/locales/ga/desktop.ftl` `check-wifi-broadcom`: "teatharáil USB" — tethering has no settled Irish term.
- `apps/meet/locales/ga/meet.ftl` `room-live-free`, `apps/meet/desktop/locales/ga/desktop.ftl` `check-space-free-already`: "Tá { $free } de saor cheana féin" — "de" as "of it" right before "saor" may read ambiguously; check against "Tá { $free } den spás sin saor".
- `apps/meet/locales/ga/meet.ftl` `room-erase-understood`: "Tuigim go bhfuil cuid de criptithe le BitLocker agus nach féidir í a fháil ar ais" — check the pronoun agreement with "cuid".
- `apps/meet/locales/ga/meet.ftl` `room-erase-title`, `working-erasing`: "Glan", "Ag glanadh an tiomántáin" — "glan" follows the stick screens for erase; check it's strong enough for wiping a whole internal drive, against "scrios".
- `apps/meet/desktop/locales/ga/desktop.ftl` `helper-box-room-shortfall`: "Is féidir le spás Luft { $available } GB a spáráil" — "spáráil" for "spare"; check it reads naturally.
