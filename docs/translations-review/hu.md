# Hungarian review list

Strings in Luft's Hungarian translation that a native speaker should check: terms with more than one established equivalent, labels that may clip, and sentences built around a placeable whose suffix or article depends on its value.

## Terms and shared strings

- `packages/i18n/glossary/hu.csv` `you`: formal verb forms without „Ön” everywhere — check this still feels friendly enough for Luft, or whether tegezés (as in many newer apps) would fit better.
- `packages/i18n/glossary/hu.csv` `tray`: "rendszertálca" — Windows 10/11 say "értesítési terület" or describe it as hidden icons; check which people recognize.
- `packages/i18n/glossary/hu.csv` `snap`: "illeszt", "illesztési elrendezés", "illesztési csoport" — taken from Windows 11; check against the current Windows wording.
- `packages/i18n/glossary/hu.csv` `Airplane mode`: "Repülőgép mód" — Windows writes "Repülőgép üzemmód", Android "Repülős üzemmód"; chosen for length.
- `packages/i18n/glossary/hu.csv` `Power mode`: "Energiamód" — shorter than Windows' "Energiagazdálkodási mód"; check it reads naturally.
- `packages/i18n/glossary/hu.csv` `power`: "Tápellátás" — check against Windows 11's page name.
- `packages/i18n/glossary/hu.csv` `sandbox`: "homokozó" — check it reads well to non-technical people, or whether "elkülönített környezet" is better in sentences.
- `packages/i18n/glossary/hu.csv` `emoji`: "emodzsi" — Microsoft's spelling; many people write "emoji".
- `packages/i18n/glossary/hu.csv` `USB stick`: "pendrive" — everyday word, but the hyphenated suffixes (pendrive-ot) may look odd in some sentences.
- `docs/translations/hu.md` Names: the guide forbids „a(z)”; check that sentences such as „{ $app } alkalmazásban” without an article read acceptably, since many Hungarian programs use „a(z)” there instead.
- `apps/settings/locales/hu/pages.ftl` `settings-page-power`: "Tápellátás és akkumulátor" — long for the sidebar; may clip.
- `apps/settings/locales/hu/pages.ftl` `settings-page-cursors`: "Kurzortémák" — check against "Egérmutató-témák".
- `packages/ui/locales/hu/ui.ftl` `ui-window-minimize`: "Kis méret" / `ui-window-maximize`: "Teljes méret" — Windows' tooltips; check they suit screen readers.
- `packages/ui/locales/hu/ui.ftl` `ui-select-placeholder`: "Válasszon" — the only imperative used as a label; "Kiválasztás" is the alternative.
- `packages/ui/locales/hu/ui.ftl` `ui-finger-right-index` .inline: "a jobb mutatóujját" — the inline forms carry the article and the accusative possessive for „Helyezze { $finger } az érzékelőre.” and „Húzza végig { $finger } az érzékelőn.”; check both sentences with every finger.
- `packages/ui/locales/hu/ui.ftl` `ui-time-just-now`: "épp most" — check it fits wherever relative times show; "az imént" is the alternative.
- `apps/settings/locales/hu/settings.ftl` `settings-subpage-back`: "Vissza ide: { $page }" — avoids a suffix on the page name; check it doesn't sound stiff for a screen reader.
- `kestrel/ui/locales/hu/shell.ftl` `battery-level`: "Akkumulátor: { $percentage }%, töltő csatlakoztatva" — for the plugged-in-but-not-charging state.

## Kestrel and setup

- `kestrel/ui/locales/hu/desktop.ftl` `task-view-desktop`: "{ $number }. munkaterület" — ordinal form follows the glossary's munkaterület; check it reads well as a workspace name (Windows says "1. asztal").
- `kestrel/ui/locales/hu/desktop.ftl` `tray-apps`: "Rendszertálca" — shortened from "tray apps"; check it is clear as a screen-reader label.
- `kestrel/ui/locales/hu/surfaces.ftl` `start-search-file-reveal`: "Megjelenítés itt: { $fileManager }" — colon form avoids a suffix on the app name; check it sounds natural in a context menu.
- `kestrel/ui/locales/hu/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from } átváltva: { $to }" — check it reads naturally with unit symbols.
- `kestrel/ui/locales/hu/surfaces.ftl` `emoji-skin-tone`: "Bőrszín" — Windows may use "Bőrtónus"; check which is more familiar.
- `kestrel/ui/locales/hu/system.ftl` `health-gpu-reset-body`: "A számítógép { $date }, { $time } időpontban magától újraindult." — built to avoid suffixes on the date and time; check it reads well with real formatted values.
- `kestrel/ui/locales/hu/system.ftl` `oom-app-closed-title`: "{ $app } bezárva a memória felszabadításához" — no article before the app name; check it is acceptable as a notification title.
- `kestrel/ui/locales/hu/system.ftl` `privacy-thing-location`: "helyadatok" — list item inside "Használatban: kamera, helyadatok…"; check the plural sits well next to the singular items.
- `kestrel/ui/locales/hu/system.ftl` `battery-device-headset`: "Headset" — kept English as it is the common word; check against "mikrofonos fejhallgató".
- `kestrel/ui/locales/hu/auth.ftl` `passkeys-use-this-computer`: "Ez a számítógép" — a button phrased as a noun phrase rather than an action noun; check it is clear.
- `kestrel/ui/locales/hu/portal.ftl` `print-failed-from-app`: "{ $printer } nyomtató nem fogadta { $appName } alkalmazás dokumentumát." — no article before either placeable; check it reads naturally.
- `kestrel/engine/locales/hu/engine.ftl` `kbd-a11y-leave-on`: "Megtartás" — used for both Leave On and Leave Off, since each appears in a separate dialog; check this is clear.
- `kestrel/engine/locales/hu/engine.ftl` `screenshot-capture`: "Rögzítés" — same word as pinning (rögzítés) in other places; check whether "Felvétel" or "Készítés" is better for the shutter button.
- `kestrel/engine/locales/hu/engine.ftl` `network-menu-mobile`: "Mobilnet" — short tile title for Mobile Broadband; check it is the familiar word.
- `apps/setup/locales/hu/setup.ftl` `setup-region-intro-guessed`: "Néhány beállítást előre kitöltöttünk: { $guesses }." with pieces like "nyelv és billentyűzet (a számítógép alapján)" — check the joined list reads well.
- `apps/setup/locales/hu/setup.ftl` `setup-account-full-name-example`: "Neumann János" — a well-known name in Hungarian order (family name first); check the full name field doesn't assume given-name-first.
- `apps/setup/locales/hu/setup.ftl` `setup-ready-start`: "Kezdés" — short button for "Start using Luft"; check it is not too vague.
- `apps/setup/locales/hu/setup.ftl` `setup-finishing-trust`: "…kéri, hogy jelölje megbízhatónak a Luftot." — check this wording for trusting Luft's key.
- `apps/setup/installer/locales/hu/installer.ftl` `installer-no-deployment`: "Az új rendszernek nincs telepített példánya" — "deployment" (ostree) has no settled Hungarian term.
- `kestrel/ui/locales/hu/auth.ftl` `lock-screen-dwell-click`: "Kattintás a mutató megállításával" — matches the Settings name, but is long for the lock screen's accessibility menu; check it fits.

## Settings

- `apps/settings/locales/hu/connections.ftl` `settings-accounts-online` and `personalization.ftl` `settings-cursors-folder-description`: "a Saját mappában lévő Cloud mappán belül", "A Saját mappa › .local › share › icons" — check that "Saját mappa" matches how Rover names the home folder, and that the Cloud folder keeps its English name on disk.
- `apps/settings/locales/hu/connections.ftl` `settings-bluetooth-request-unnamed`: "névtelen eszköz" — fills $name in the pairing sentences ("Párosítás ezzel: névtelen eszköz?"); check it reads acceptably in every request message.
- `apps/settings/locales/hu/connections.ftl` `settings-bluetooth-request-confirm` and siblings: "Párosítás ezzel: { $name }?" — colon constructions avoid suffixing the device name; check they don't feel too stiff for a dialog title.
- `apps/settings/locales/hu/connections.ftl` `settings-network-band`: "{ $band } GHz · { $channel }. csatorna" — ordinal dot after the placeable; assumes $channel is a plain number.
- `apps/settings/locales/hu/connections.ftl` `settings-accounts-browser`: "…bejelentkezhet { $provider } fiókjával…" — relies on "Microsoft fiókjával"/"Dropbox fiókjával" without hyphen, which is not strictly standard spelling.
- `apps/settings/locales/hu/connections.ftl` `settings-accounts-approve`: "…be van kapcsolva a Speciális adatvédelem." — check this matches Apple's Hungarian name for Advanced Data Protection.
- `apps/settings/locales/hu/connections.ftl` `settings-network-security-psk`: "WPA2 Személyes" — Windows writes "WPA2-Personal" in some versions; check the preferred form.
- `apps/settings/locales/hu/connections.ftl` `settings-bluetooth-windows`: "A Windowsban párosított eszközök: { $devices }. …" — $devices is a joined list; check the list joiner ("és még 3") fits.
- `apps/settings/locales/hu/devices.ftl` `settings-dictation-description`: "…ha beszéd közben lenyomva tartja ezt: { $keys }." — $keys may be "Super+Alt vagy Copilot billentyű"; check it reads naturally.
- `apps/settings/locales/hu/devices.ftl` `settings-sound-app-output`: "{ $app } hangkimenete" — picker label for "Play { $app } on"; check it fits the UI.
- `apps/settings/locales/hu/devices.ftl` `settings-power-limit-stops-at`: "A töltés { $level } töltöttségnél leáll" — avoids "80%-nál"; check it isn't too wordy.
- `apps/settings/locales/hu/devices.ftl` `settings-keys-keypad`: "Num { $key }" — no settled Hungarian label for keypad keys.
- `apps/settings/locales/hu/personalization.ftl` `settings-fonts-sample`: "Árvíztűrő tükörfúrógép" — the classic Hungarian accent test phrase, not a full pangram; check whether a real pangram ("Jó foxim és don Quijote…") is preferred despite its length.
- `apps/settings/locales/hu/personalization.ftl` `settings-appearance-dark-from`: "Sötét mód kezdete" — rewritten as a noun to sit before the time picker; check it reads well next to the time.
- `apps/settings/locales/hu/personalization.ftl` `settings-accessibility-dwell-time`: "Várakozás" — label before a duration slider; check it is clear enough (also `settings-accessibility-hold-time` "Nyomva tartás").
- `apps/settings/locales/hu/personalization.ftl` `settings-appearance-icons-clear`: "Áttetsző" — icon style "Clear"; check it isn't read as "Törlés".
- `apps/settings/locales/hu/protection.ftl` `settings-encryption-passphrase-field`: "Jelmondat" — passphrase term, not in the glossary; used throughout the disk-unlock strings.
- `apps/settings/locales/hu/protection.ftl` `settings-security-hardware-description`: "{ $summary }. Szint: { $level }/{ $highest }." — restructured to avoid suffixes on numbers; check it reads naturally.
- `apps/settings/locales/hu/protection.ftl` `settings-passwords-access-revoke`: "{ $app } nem használhatja ezt: { $item }" — screen-reader label of a remove button phrased as a statement; check whether an action noun reads better.
- `apps/settings/locales/hu/protection.ftl` `settings-passwords-forget-title`: "Elfelejti ennek az alkalmazásnak a mentett adatait: { $app }?" — colon form to avoid an article before the app name; check it isn't too stiff.
- `apps/settings/locales/hu/protection.ftl` `settings-security-anti-cheat-luft-key`: "Az Epicnek még fel kell vennie a listájára a Luft kulcsát" — suffix on the company name Epic; check spelling.
- `apps/settings/locales/hu/system.ftl` `settings-updates-version-staged`: "{ $version } verzió készen áll a telepítésre" — sentences start with the version number and no article to avoid a/az; check this reads acceptably (also `settings-updates-version-available`, `settings-updates-notes-title`).
- `apps/settings/locales/hu/system.ftl` `settings-updates-stay`: "Maradás ennél: { $version }" — button; check it fits and reads well.
- `apps/settings/locales/hu/system.ftl` `settings-users-fingerprint-remove-description`: "Többé nem használhatja { $finger } a bejelentkezéshez." — relies on the .inline finger forms (accusative with article) from ui.ftl.
- `apps/settings/locales/hu/connections.ftl` `settings-network-link-connected`: "Csatlakozva" — used for every network and Bluetooth connection, with "csatlakoztatva" kept for things plugged in; Windows writes "Csatlakoztatva" for both, so check which reads more naturally.

## Website

- `web/site/locales/hu/home.ftl` `home-question-ready-answer`: "Éjszakai buildek" — "build" is common in Hungarian IT but informal; "éjszakai kiadás" would clash with the first release.
- `web/site/locales/hu/home.ftl` `home-motion-heading`: "Minden mozdulatnak célja van." — free rendering of "It moves like it means it".
- `web/site/locales/hu/home.ftl` `home-get`, `home-look`: "A Luft beszerzése", "Körülnézés" — action-noun button form; check they read well as hero buttons.
- `web/site/locales/hu/home.ftl` `home-security-sealed-text`: "aláírt lemezkép" — the signed system image; check the term.

## Meet Luft

- `apps/meet/locales/hu/meet.ftl` `ready-remove-description`, `working-packing`: "költözési doboz" — the moving box; check it reads naturally.
- `apps/meet/desktop/locales/hu/desktop.ftl` `check-start-entries`, `problem-tidy`: "indítási bejegyzés" — no settled Hungarian term for a firmware boot entry.
- `apps/meet/desktop/locales/hu/desktop.ftl` `check-encryption-changing-detail`: "a Gépházban, az Eszköztitkosítás résznél" — check that Windows 11 still calls Settings "Gépház" in Hungarian.
- `apps/meet/desktop/locales/hu/desktop.ftl` `check-secure-boot-turn-on`: "nyomja meg a következőt, amikor megjelenik a gyártó ({ $maker }) logója: { $key }" — reordered so the key and brand need no suffix; check it reads naturally.
- `apps/meet/locales/hu/meet.ftl` `linux-ready-description`, `linux-ready-try-description`: "A rendszer ({ $system })" — the system name is put in parentheses to avoid an article and suffix.
- `apps/meet/locales/hu/meet.ftl` `meet-nightly`, `meet-channel-nightly`: "Éjszakai buildek" — same informal term as on the website.
