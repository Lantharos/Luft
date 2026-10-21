# Latvian review list

Strings in Luft's Latvian translation that a native speaker should check: terms with more than one accepted form, and wording that may clip or read stiffly.

## Terms and shared strings

- `packages/i18n/glossary/lv.csv` `board`: "tāfele" — no settled term for an endless window canvas; check it reads naturally next to "darbvieta"
- `packages/i18n/glossary/lv.csv` `tray`: "sistēmas tekne" — Windows has used both this and "paziņojumu apgabals"; confirm which Latvian users know
- `packages/i18n/glossary/lv.csv` `accent color`: "akcenta krāsa" — check against the current Windows Latvian term ("izcēluma krāsa" is also seen)
- `packages/i18n/glossary/lv.csv` `Keep awake`: "Neaizmigt" — no OS precedent; check it reads as a quick settings tile
- `packages/i18n/glossary/lv.csv` `Keyring`: "atslēgu saišķis" — GNOME's term as remembered; confirm against current GNOME Latvian
- `packages/i18n/glossary/lv.csv` `signed startup`: "parakstīta startēšana" — no settled term; matches "startēšana" used for the computer starting elsewhere, "parakstīta sāknēšana" is an alternative
- `packages/i18n/glossary/lv.csv` `shut down`: "izslēgt" — same word as turn off; check no screen needs both side by side
- `packages/i18n/glossary/lv.csv` `firmware`: "aparātprogrammatūra" — long; check it fits in labels
- `packages/ui/locales/lv/ui.ftl` `ui-fingerprint-swipe`: "Pārvelciet ar { $finger } pāri sensoram." — relies on the .inline accusative doubling as the instrumental after "ar"
- `packages/ui/locales/lv/ui.ftl` `ui-split-space`: "Vieta sistēmai Luft" — added "sistēmai" so Luft needn't decline; check it isn't too stiff
- `apps/settings/locales/lv/settings.ftl` `settings-subpage-back`: "Atpakaļ: { $page }" — avoids declining the page name after "uz"; check it sounds right to screen-reader users
- `kestrel/ui/locales/lv/shell.ftl` `battery-level`: "Akumulators { $percentage } %, …" — percent with a space, per the Latvian standard; Windows Latvian writes it without
- `kestrel/ui/locales/lv/shell.ftl` `keys-space`: "Atstarpe" — every other key keeps its printed English label; confirm this mix is what Latvian users expect
- `packages/settings-pages/locales/lv/pages.ftl` `settings-page-about`: "Par sistēmu" — Windows says just "Par"; check which reads better as a sidebar entry

## Kestrel and setup

- `kestrel/ui/locales/lv/desktop.ftl` `snap-zone`: "Piesaistīt apgabalam { $width } % × { $height } %" — check the screen-reader phrasing.
- `kestrel/ui/locales/lv/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from } uz { $to }" — "uz" for unit conversion; check it reads naturally.
- `kestrel/ui/locales/lv/surfaces.ftl` `quick-settings-battery-left`: "Atlicis { $duration }" — participle doesn't agree with every duration (e.g. "1 h 20 min"); check.
- `kestrel/ui/locales/lv/surfaces.ftl` `start-search-keep-awake-off`: "Atļaut miega režīmu" — rephrased "Stop keeping awake"; check it is clear.
- `kestrel/ui/locales/lv/system.ftl` `privacy-indicator`: "Tiek izmantots: { $things }" — list items are nominative (kamera, mikrofons, logi); check agreement reads acceptably with a colon.
- `kestrel/ui/locales/lv/system.ftl` `health-gpu-reset-body`: "Dators restartējās pats: { $date }, { $time }." — built so the date's case doesn't matter; check.
- `kestrel/ui/locales/lv/system.ftl` `peek-error-declined`: "{ $app } var jautāt vēlreiz pēc tam, kad būs aizvērta." — feminine assumes the program is an app; may be a terminal tool.
- `kestrel/ui/locales/lv/portal.ftl` `print-two-sided`: "Abpusēja druka" — check against what Latvian print dialogs use.
- `kestrel/engine/locales/lv/engine.ftl` `network-menu-tether`: "Tīklājs" — internet shared from a phone over Bluetooth, named like the Wi-Fi hotspot (header "Bluetooth tīklāji"); check it is understood as Bluetooth tethering.
- `kestrel/engine/locales/lv/engine.ftl` `switch-monitor-join`: "Paplašināt" — Windows' Extend; English says "Join Displays".
- `kestrel/engine/locales/lv/engine.ftl` `screenshot-screencasts-folder`: "Ekrāna ieraksti" — folder name on disk; check against existing XDG/GNOME Latvian folder names.
- `apps/setup/locales/lv/setup.ftl` `setup-region-intro-guessed`: "Mēs noteicām { $guesses }, …" — field names (`setup-region-field-*`) are in the accusative (valodu, tastatūru, laika joslu) to fit this sentence; check the joined list reads well.
- `apps/setup/locales/lv/setup.ftl` `setup-finishing-installed-title`: "Luft ir instalēta" — Luft is treated as feminine (sistēma) throughout setup and installer; confirm the gender.
- `apps/setup/locales/lv/setup.ftl` `setup-windows-hibernated`: "…ar ātro startēšanu…" — Windows' Latvian name for Fast Startup; verify.

## Settings

- `apps/settings/locales/lv/connections.ftl` `settings-bluetooth-request-unnamed`: "bez nosaukuma" — every pairing sentence puts "ierīce" (declined) before { $name }, so the stand-in reads "ierīci bez nosaukuma"; check the sentences read well with both a real name and this stand-in.
- `apps/settings/locales/lv/connections.ftl` `settings-bluetooth-windows`: "Ierīce { $devices } ir savienota pārī sistēmā Windows…" — { $devices } is a list like "Tastatūra, Pele un vēl 3"; check it reads naturally after "Ierīces".
- `apps/settings/locales/lv/connections.ftl` `settings-network-metered`: "Limitēts savienojums" — Windows' term; confirm against current Windows Latvian.
- `apps/settings/locales/lv/connections.ftl` `settings-network-security-owe`: "Uzlabots atvērtais" — no settled Latvian term for Enhanced Open (OWE).
- `apps/settings/locales/lv/system.ftl` `settings-accounts-online`: "Katrs konts ir mape Cloud jūsu mājas mapē…" — assumes the folder keeps its English name Cloud.
- `apps/settings/locales/lv/devices.ftl` `settings-sound-mute`: "Izslēgt skaņu: { $name }" — $name can be "Skaļums" or an app name; colon form avoids declining it, check it sounds fine for screen readers.
- `apps/settings/locales/lv/devices.ftl` `settings-dictation-engine-description`: "{ $engine } atpazīst šo valodu: { $language }" — colon used so the language name's case doesn't matter; might read stiff.
- `apps/settings/locales/lv/devices.ftl` `settings-keys-keypad`: "Num { $key }" — short label for number pad keys; check whether reviewers prefer something else.
- `apps/settings/desktop/locales/lv/desktop.ftl` `desktop-updates-another-app`: "cita lietotne" — fills `settings-updates-elsewhere-*-by` ("{ $app } instalē atjauninājumus"), giving "Schelf instalē atjauninājumus" or "Cita lietotne instalē atjauninājumus"; check both read well.
- `apps/settings/locales/lv/personalization.ftl` `settings-appearance-wallpaper-folder`: "Mape Wallpapers" — the folder on disk is literally named Wallpapers, so it is kept in English; check it reads naturally next to the translated Attēli.
- `apps/settings/locales/lv/personalization.ftl` `settings-appearance-wallpaper-fit-title`: "Ietilpināšana" — row title over Aizpildīt/Ietilpināt/Centrēt/Izstiept/Izklāt (Windows' Latvian fit options); check the title isn't stiff.
- `apps/settings/locales/lv/personalization.ftl` `settings-cursors-folder-description`: "Šeit parādās motīvi, ko ievietojat mapē Mājas › .local › share › icons" — assumes the home folder shows as Mājas in Rover's Latvian sidebar.
- `apps/settings/locales/lv/personalization.ftl` `settings-taskbar-look`: "Fons" — chosen over "Izskats" to avoid clashing with the Appearance page name; values Stikls/Vienkrāsains/Caurspīdīgs/Akcenta krāsa.
- `apps/settings/locales/lv/personalization.ftl` `settings-accessibility-dwell-time`: "Aizture" — label before a duration slider; "Rest for" has no natural short Latvian equivalent.
- `apps/settings/locales/lv/protection.ftl` `settings-privacy-screen-off-after`: "{ $duration } bez darbības" — built so the nominative $duration ("5 minūtes") fits; check it matches what the screen-off option really means.
- `apps/settings/locales/lv/protection.ftl` `settings-privacy-lock-after`: "Bloķēšanas aizture" — noun used because the following options' case is unknown; same for `settings-privacy-delete-after` "Dzēšanas termiņš".
- `apps/settings/locales/lv/protection.ftl` `settings-passwords-stores-count`: "Saglabāti pierakstīšanās dati: { $count }" — "sign-in" as a countable noun has no good Latvian form, so the count is moved after a colon.
- `apps/settings/locales/lv/system.ftl` `settings-about-old-system`: "Saglabāta, kad to aizstāja Luft · { $size }" — feminine agrees with an implied sistēma; check against what the row title shows (e.g. Windows).
- `apps/settings/locales/lv/system.ftl` `settings-updates-apps-count`: "Lietotnē Schelf ir atjauninājumi { $count } lietotnēm" — dative after the number; check it reads well for every count.

## Website

- `web/site/locales/lv/download.ftl` `download-meet-note`: "izvēlieties Papildinformācija un pēc tam Tik un tā palaist" — SmartScreen button labels not verified; check against Latvian Windows 11.
- `web/site/locales/lv/home.ftl` `home-question-ready-answer`: "Nakts būvējumi" — no settled Latvian term for nightly builds.
- `web/site/locales/lv/download.ftl` `download-meet-for-windows`: "Lejupielādēt Meet Luft <span>operētājsistēmai Windows</span>" — check the hidden part isn't too long on wide buttons.
- `web/site/locales/lv/home.ftl` `home-motion-heading`: "Kustība ar nodomu." — free rendering of "It moves like it means it".

## Meet Luft

- `apps/meet/locales/lv/meet.ftl` `ready-remove-description`, `working-packing`: "pārcelšanās kaste" — the moving box; check it reads naturally.
- `apps/meet/desktop/locales/lv/desktop.ftl` `check-start-entries`, `problem-tidy`: "startēšanas ieraksts" — no settled Latvian term for a firmware boot entry.
- `apps/meet/desktop/locales/lv/desktop.ftl` `check-space-short-windows`, `drive-hide-failed`: "Diska tīrīšana", "Failu pārlūks" — Windows tool names from memory; check against Latvian Windows.
- `apps/meet/locales/lv/meet.ftl` `stick-keep`: "Paturēt abas", "Paturēt visas" — feminine, agreeing with "Luft" as a system; check it reads right for builds on a stick.
- `apps/meet/locales/lv/meet.ftl` `problem-check`, `hello-check`: both platform variants say "dators".
- `apps/meet/locales/lv/meet.ftl` `luft-resize-title`: "Mainīt Luft vietas apjomu" — check it reads naturally as a row title.
- `apps/meet/locales/lv/meet.ftl` `luft-windows-free-description`: "{ $size } tieši aiz Windows netiek izmantoti." — the verb is plural to agree with a number of gigabytes; check it reads right with every size.
- `apps/meet/desktop/locales/lv/desktop.ftl` `luft-size-not-allowed`: "Luft nevar būt šādā lielumā" — check against "Luft nevar būt tik liela".
