# Czech review list

Strings in Luft's Czech translation that a native speaker should check: term choices without one settled Czech equivalent, and sentences built around placeables whose case may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/cs.csv` `board`: "tabule" — no established Czech term for this feature; check that tabule reads naturally next to plátno for the canvas.
- `packages/i18n/glossary/cs.csv` `workspace`: "pracovní prostor" — GNOME uses pracovní plocha; chosen to avoid confusion with plocha (desktop). Check it's understood.
- `packages/i18n/glossary/cs.csv` `tray`: "oznamovací oblast" — Windows' classic term, though the button holds background apps rather than notifications.
- `packages/i18n/glossary/cs.csv` `Keep awake`: "Nevypínat obrazovku" — long for a Quick settings tile; check whether a shorter form fits.
- `packages/i18n/glossary/cs.csv` `sandbox`: "izolované prostředí" — some readers may know only the English sandbox.
- `packages/i18n/glossary/cs.csv` `wallpaper`: "tapeta" — Windows and GNOME say pozadí; tapeta follows macOS and phones.
- `packages/i18n/glossary/cs.csv` `USB stick`: "flash disk" — check against jednotka USB flash used by Windows.
- `packages/ui/locales/cs/ui.ftl` `ui-fingerprint-place`: "Dotkněte se snímače { $finger }." — .inline finger names are in the instrumental so they fit both this and the swipe sentence; check it reads naturally for placing a finger.
- `packages/ui/locales/cs/ui.ftl` `ui-toast-dismiss`: "Zavřít" — dismissing a notification bubble; Skrýt would also work.
- `apps/settings/locales/cs/settings.ftl` `settings-subpage-back`: "Zpět na stránku { $page }" — the page title stays in the nominative as an apposition; check it doesn't sound stiff to screen-reader users.
- `packages/settings-pages/locales/cs/pages.ftl` `settings-page-display`: "Displeje" — Windows uses the singular Displej; plural follows the English page name.

## Kestrel and setup

- `kestrel/ui/locales/cs/portal.ftl` `portal-unknown-app-object`: "tato aplikace" — titles were rephrased as "Může { $appName } …?" so the app name stays in the nominative; check they read naturally with both real names and the fallback.
- `kestrel/ui/locales/cs/portal.ftl` `screen-share-title`: "Může { $appName } vidět vaši obrazovku?" — English "Share your screen with …?" rephrased to avoid inflecting the app name; check the meaning still fits.
- `kestrel/ui/locales/cs/system.ftl` `privacy-indicator`: "Právě se používá: { $things }" — items are nominative list words (kamera, mikrofon …); check the list joins naturally.
- `kestrel/ui/locales/cs/system.ftl` `oom-closed-body-with-size`: "Počítači docházela paměť. Zavřením se uvolnilo { $size }, aby vše ostatní dál plynule reagovalo." — rephrased to avoid gender agreement between app and container; English says what it was using, not what was freed.
- `kestrel/ui/locales/cs/surfaces.ftl` `start-search-keep-awake-off`: "Povolit vypínání obrazovky" — opposite of Nevypínat obrazovku; check it is clear.
- `kestrel/ui/locales/cs/desktop.ftl` `task-view-desktop`: "Pracovní prostor { $number }" — follows the glossary's workspace; Windows says Plocha 1.
- `kestrel/engine/locales/cs/engine.ftl` `switch-monitor-join`: "Rozšířit" — Windows' word for extending displays; check it is understood as joining.
- `apps/setup/locales/cs/setup.ftl` `setup-region-intro-guessed`: "Na začátek jsme odhadli { $guesses }. Upravte, co nesedí." — built from pieces; field names are accusative (jazyk, klávesnici, časové pásmo); check the joined list.
- `apps/setup/locales/cs/setup.ftl` `setup-windows-hibernated`: "…vypnutý s rychlým spuštěním…" — Fast Startup as Windows names it in Czech (Rychlé spuštění); check.
- `apps/setup/desktop/locales/cs/desktop.ftl` `desktop-window-title`: "Nastavit Luft" — infinitive like Instalovat Luft; avoids clashing with Nastavení.
- `apps/setup/installer/locales/cs/installer.ftl` `installer-box-unopened`: "Stěhovací krabici se nepodařilo otevřít" — the Meet Luft moving box metaphor; check Meet Luft uses the same word.

## Settings

- `apps/settings/locales/cs/connections.ftl` `settings-network-security-owe`: "Rozšířená otevřená" — no settled Czech term for Enhanced Open (OWE); check whether keeping "Enhanced Open" reads better.
- `apps/settings/locales/cs/connections.ftl` `settings-bluetooth-request-unnamed`: "bez názvu" — chosen so every pairing sentence reads "zařízení { $name }" (e.g. "Spárovat zařízení bez názvu?"); check all six request sentences with both a real name and this value.
- `apps/settings/locales/cs/connections.ftl` `settings-bluetooth-windows`: "V systému Windows jsou spárovaná tato zařízení: { $devices }. …" — $devices is a list ending in "a 3 další"; check it reads well with one and many devices.
- `apps/settings/locales/cs/system.ftl` `settings-accounts-online`: "Každý účet má vlastní složku ve složce Cloud ve vaší domovské složce…" — assumes the folder keeps the English name Cloud.
- `apps/settings/locales/cs/system.ftl` `settings-accounts-browser`: "…kde se přihlásíte přes { $provider }." — $provider (Microsoft, Dropbox) stays uninflected after "přes"; check it sounds natural.
- `apps/settings/locales/cs/devices.ftl` `settings-sound-mute`: "Ztlumit: { $name }" — colon avoids inflecting app names; screen-reader label only.
- `apps/settings/locales/cs/devices.ftl` `settings-power-time-left`: "Zbývá asi { $time }" — with the durations in nominative ("1 hodina 5 minut") and "méně než minuta"; check the under-a-minute case reads acceptably.
- `apps/settings/locales/cs/devices.ftl` `settings-power-screen-off`: "Vypnout obrazovku po nečinnosti" — the picker shows nominative durations ("5 minut") next to it; English "after" can't take the duration in Czech, so check the row reads as label plus value.
- `apps/settings/locales/cs/devices.ftl` `settings-dictation-engine-description`: "{ $engine } rozpoznává jazyk { $language }" — "jazyk" added so the language name can stay nominative.
- `apps/settings/locales/cs/devices.ftl` `settings-keys-keypad`: "Num { $key }" — check this is the label Czech users expect for number-pad keys.
- `apps/settings/locales/cs/protection.ftl` (all passphrase strings, and `setup-protect-passphrase-label` in setup): "heslo k disku" — chosen for "passphrase" to keep it apart from the account "heslo" and from "přístupový klíč" (passkey); check it reads naturally and isn't confused with the account password.
- `apps/settings/locales/cs/system.ftl` `settings-updates-elsewhere-update-by`: "Aktualizace instaluje { $app }" — the agent comes last so { $app } can be a name (Schelf, dnf) or "jiná aplikace" in the nominative; same for the other `-by` strings. Check the word order reads naturally.
- `apps/settings/locales/cs/protection.ftl` `settings-encryption-step-screen`: "Během spouštění se krátce zobrazí obrazovka „Šifrování zařízení“." — the quoted title must match what the startup screen actually shows; if that screen stays in English, quote the English title instead.
- `apps/settings/locales/cs/protection.ftl` `settings-privacy-screen-off-after`: "{ $duration } nečinnosti" — rebuilt so the nominative duration ("5 minut", "1 minuta") fits; confirm it reads well as a row value.
- `apps/settings/locales/cs/protection.ftl` `settings-privacy-delete-after`: "Odstraňovat starší než" — followed by a choice of durations ("30 dní"); check it fits every option.
- `apps/settings/locales/cs/protection.ftl` `settings-security-anti-cheat-luft-key`: "Epic ještě musí přidat klíč Luftu na svůj seznam" — inflects Luft; check it isn't better as "klíč systému Luft".
- `apps/settings/locales/cs/personalization.ftl` `settings-accessibility-typing-assist-count`: "Zapnuto: { $count }" — neutral form to avoid agreement with an unnamed noun; check it reads fine next to "Pomoc s psaním".
- `apps/settings/locales/cs/personalization.ftl` `settings-accessibility-bounce-keys`: "Filtrování opakovaných stisků" — no settled Czech term; may clip, GNOME uses "Vícenásobné stisky" in some versions.
- `apps/settings/locales/cs/personalization.ftl` `settings-appearance-icons-clear`: "Průhledné" — English "Clear" icon style; check it describes the actual look.
- `apps/settings/locales/cs/system.ftl` `settings-datetime-increase`: "Zvýšit hodnotu: { $label }" — $label is the title form "Hodina"/"Minuta", so a colon construction was used.
- `apps/settings/locales/cs/system.ftl` `settings-users-fingerprint-remove-description`: "Už se nebudete moct přihlašovat { $finger }." — relies on the instrumental .inline form ("pravým ukazováčkem").

## Website

- `web/site/locales/cs/home.ftl` `home-motion-heading`: "Pohyb, který dává smysl." — free rendering of "It moves like it means it"; check the tone.
- `web/site/locales/cs/home.ftl` `home-app-mailman-detail`: "prověřování nových odesílatelů" — "screener" has no settled Czech term.
- `web/site/locales/cs/home.ftl` `home-app-magpie-detail`: "zbytek složky máte na šipce" — colloquial for "an arrow key away"; check it is clear.
- `web/site/locales/cs/site.ftl` `site-footer-made`: "Vytváří { $lantharos }." — Lantharos as the subject avoids declining the name; check it reads naturally as a credit line.

## Meet Luft

- `apps/meet/locales/cs/meet.ftl` `meet-logs-saved`: "Protokoly ze zkoušení systému Luft jsou uložené na ploše" — "Try Luft" as a mode is described rather than named; check all three logs messages.
- `apps/meet/desktop/locales/cs/desktop.ftl` `check-start-entries`: "Stará spouštěcí položka" — "start entry" (firmware boot menu entry) used throughout Meet Luft.
- `apps/meet/locales/cs/meet.ftl` `check-blocked-description`: "Postup najdete níže." — free rendering of "Here's what to do."
- Windows is treated as plural throughout Meet Luft ("Windows zmenší", "Windows nedokážou"), while Setup mixes "systém Windows" singular; check which a reviewer prefers.
- `apps/meet/desktop/locales/cs/desktop.ftl` `check-secure-boot-turn-on`: "…při zobrazení loga { $maker } stisknete { $key } a přejdete do { $place }." — $key may be "tlačítko zesílení hlasitosti" and $place an English menu path; check both fit.
- `apps/meet/locales/cs/meet.ftl` `room-erase-understood`: "Beru na vědomí, že část dat je šifrovaná nástrojem BitLocker a nepůjde obnovit" — tick-box wording in the first person; check it reads naturally next to the box.
- `apps/meet/locales/cs/meet.ftl` `luft-resize-title`: "Změnit velikost systému Luft" — English "Change how much space Luft has"; shortened to the size of Luft, matching problem-resize.
- `apps/meet/desktop/locales/cs/desktop.ftl` `helper-box-room-shortfall`: "Místo pro Luft může uvolnit { $available } GB a vybrané věci potřebují { $needed } GB." — "Luft's room" rendered as místo pro Luft; check the moving box shortfall is clear.
