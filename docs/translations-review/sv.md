# Swedish review list

Strings in Luft's Swedish translation that a native speaker should check: terms with no single settled Swedish equivalent, and wording around placeables that may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/sv.csv` `notification`: "notis" — chosen over Windows' "meddelande" and GNOME's/Android's "avisering"; check that it reads natural in system text, not only on phones.
- `packages/i18n/glossary/sv.csv` `suspend` / `hibernate`: "Viloläge" / "Dvala" — follows KDE and Ubuntu; Windows users know "Strömsparläge" for sleep and "Viloläge" for hibernate, so check whether this swap confuses them.
- `packages/i18n/glossary/sv.csv` `snap`: "docka", "dockningslayout" — Windows says "fästa" for snap but also for pin; check that "docka" is understood for placing a window in part of the screen.
- `packages/i18n/glossary/sv.csv` `board`: "tavla" — no established term exists for this mode.
- `packages/i18n/glossary/sv.csv` `passkey`: "lösennyckel" — Apple's word; Google and Microsoft use "nyckel" or leave "passkey" in English.
- `packages/i18n/glossary/sv.csv` `accessibility`: "Hjälpmedel" — Windows and GNOME; macOS says "Tillgänglighet", which is in the search keywords.
- `kestrel/ui/locales/sv/shell.ftl` `keys-shift`, `keys-tab`, `keys-space`, `keys-backspace`: "Skift", "Tabb", "Blanksteg", "Backsteg" — Swedish keyboards print symbols for these; check that the Windows names are the right ones to show in shortcut labels.
- `kestrel/ui/locales/sv/shell.ftl` `battery-level` [plugged]: "Batteri { $percentage } %, laddare ansluten" — the English "plugged in" has no short Swedish participle that agrees with "batteri".
- `packages/ui/locales/sv/ui.ftl` `ui-finger-*` .inline: the possessive is part of the inline form ("ditt högra pekfinger", "din högra tumme") because it agrees with the finger's gender; check every sentence that uses `{ $finger }` reads right without its own "din"/"ditt".
- `packages/ui/locales/sv/ui.ftl` `ui-time-just-now`: "nyss" — Windows shows "Just nu"; check which fits where the timestamp appears.
- `packages/ui/locales/sv/ui.ftl` `ui-split-windows-size`: "{ $size }, varav { $used } används" — check it reads well next to the slider.

## Kestrel and setup

- `kestrel/ui/locales/sv/system.ftl` `privacy-indicator`: "Använder { $things }" with list items in definite form (kameran, mikrofonen, skärmen, platsen, dina fönster) — check the joined list reads naturally, e.g. "Använder kameran, mikrofonen och dina fönster".
- `kestrel/ui/locales/sv/system.ftl` `dictation-unsupported-title`: "Diktering på { $language } är inte tillgänglig på den här datorn" — $language currently arrives in English ("Japanese"), so the sentence will mix languages until the speech service localizes it.
- `kestrel/ui/locales/sv/system.ftl` `health-gpu-reset-body`: "… sig själv den { $date } kl. { $time }" — assumes $date is like "3 mars"; check it reads right with the region's date format.
- `kestrel/ui/locales/sv/system.ftl` `battery-device-low-title`: "Låg batterinivå: { $device }" — rephrased with a colon to avoid inflecting the device name; check it fits the notification style.
- `kestrel/ui/locales/sv/surfaces.ftl` `start-folder-ungroup`: "Dela upp mappen" — English says "Ungroup apps"; check it is clear that the apps move back to the grid.
- `kestrel/ui/locales/sv/desktop.ftl` `snap-zone`: "Docka till ett område på { $width } % × { $height } %" — screen-reader phrasing; check it sounds natural when read aloud.
- `kestrel/ui/locales/sv/auth.ftl` `lock-screen-dwell-click`: "Vilande klick" — no settled Swedish term for dwell click (Settings describes it as "Klicka genom att låta pekaren vila"); check it is understood in the lock screen menu.
- `kestrel/engine/locales/sv/engine.ftl` `network-menu-tether`: "Delad anslutning" (and `network-menu-tethers` "Delade anslutningar via Bluetooth") — no settled Swedish term for tethering; check it is understood and fits the tile.
- `kestrel/engine/locales/sv/engine.ftl` `switch-monitor-join`: "Utöka" — Windows' word for extending the desktop; check it is clear next to "Spegla".
- `kestrel/engine/locales/sv/engine.ftl` `ctrl-alt-tab-unlock`: "Upplåsning" — names the lock screen sign-in prompt in the Ctrl+Alt+Tab switcher; check it is understandable.
- `apps/setup/locales/sv/setup.ftl` `setup-region-intro-guessed`: "Vi har gissat { $guesses }, så ändra det som inte stämmer." with parts like "tangentbordet utifrån datorn" — check the assembled sentence with two guesses joined by "och".
- `apps/setup/locales/sv/setup.ftl` `setup-destination-meet-choice-description`: "Använd de { $size } som Meet Luft har gjort plats för bredvid Windows." — check the construction around the size.
- `apps/setup/installer/locales/sv/installer.ftl` `installer-no-deployment`: "Det nya systemet har ingen driftsättning" — technical ostree term; check whether a plainer word fits better.

## Settings

- `apps/settings/locales/sv/connections.ftl` `settings-network-security-owe`: "Förbättrat öppet" — no settled Swedish term for OWE / Enhanced Open; check against what Windows or routers show in Swedish.
- `apps/settings/locales/sv/connections.ftl` `settings-network-security-enterprise`: "Enterprise" — kept English as routers and Windows print it (WPA2-Enterprise); "Företag" is the alternative.
- `apps/settings/locales/sv/connections.ftl` `settings-network-ip-routes`: "Vägar" — GNOME uses "Rutter"; check which a Swedish network admin expects.
- `apps/settings/locales/sv/connections.ftl` `settings-network-wireguard-preshared-key`: "I förväg delad nyckel" — WireGuard UIs often keep "Preshared key"; check.
- `apps/settings/locales/sv/connections.ftl` `settings-network-wireguard-keepalive`: "Keepalive" — kept as the WireGuard term.
- `apps/settings/locales/sv/connections.ftl` `settings-accounts-online`: "Varje konto är en mapp i Cloud i din hemmapp …" — check whether the Cloud folder keeps its English name on a Swedish system.
- `apps/settings/locales/sv/devices.ftl` `settings-sound-mute`: "Stäng av ljudet för { $name }" — $name can be "Volym", which reads oddly capitalized mid-sentence for screen readers.
- `apps/settings/locales/sv/devices.ftl` `settings-keys-keypad`: "Num { $key }" — short form for number-pad keys; check against Swedish keyboard conventions.
- `apps/settings/locales/sv/devices.ftl` `settings-power-suspend-plugged-in`: "Viloläge med laddare ansluten" — row label for the suspend timeout when plugged in; check it pairs naturally with "Viloläge på batteri".
- `apps/settings/locales/sv/devices.ftl` `settings-power-long-sleep`: "Stäng av efter lång tid i viloläge" — may clip at laptop width.
- `apps/settings/desktop/locales/sv/desktop.ftl` `desktop-shortcut-show-screenshot-ui`: "Ta en skärmbild och välj vad som ska med" — free rendering of "interactively"; same for the screen recording one.
- `apps/settings/locales/sv/personalization.ftl` `settings-fonts-sample`: "Flygande bäckasiner söka hwila på mjuka tuvor" — the classic Swedish pangram, but archaic (söka, hwila); a reviewer may prefer a modern sentence.
- `apps/settings/locales/sv/personalization.ftl` `settings-appearance-icons-clear`: "Genomskinliga" — chose this over iOS' "Klar" to avoid clashing with the Done button; check against the icon style it names.
- `apps/settings/locales/sv/personalization.ftl` `settings-taskbar-look`: "Bakgrund" — English "Look"; renamed to avoid repeating the page name Utseende right next to the back button.
- `apps/settings/locales/sv/personalization.ftl` `settings-fonts-monospace`: "Fast breddsteg" — standard typographic term, but long; check it fits as a row title.
- `apps/settings/locales/sv/protection.ftl` `settings-security-anti-cheat`: "Spel med fuskskydd" — no settled Swedish term; gamers often just say anti-cheat.
- `apps/settings/locales/sv/protection.ftl` `settings-usb-hold-back`: "Spärra nya USB-enheter" — "spärra" may sound more permanent than holding devices back until unlock.
- `apps/settings/locales/sv/system.ftl` `settings-datetime-increase`: "Öka { $label }" — $label arrives capitalized (Timme/Minut), so it reads "Öka Timme" to a screen reader.
- `apps/settings/locales/sv/system.ftl` `settings-about-other-system`: "Ta bort det för att ge dess { $size } till Luft" — "det" assumes the other system is referred to as "systemet" (ett); check against the row title it sits under.
- `apps/settings/locales/sv/system.ftl` `settings-updates-elsewhere-refresh-by`: "Sökning efter uppdateringar pågår i { $app }" — rephrased so it also reads right when $app is "en annan app"; check it sounds natural next to the other "… av { $app }" lines.
