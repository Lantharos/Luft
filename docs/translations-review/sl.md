# Slovenian review list

Strings in Luft's Slovenian translation that a native speaker should check: terms with no settled equivalent across Windows, GNOME and KDE, and wording that may not fit every value of a placeable.

## Terms and shared strings

- `packages/i18n/glossary/sl.tbx` `snap`: "zaskočiti", with "postavitev oken" and "skupina oken" — check what Windows 11 in Slovenian calls Snap and snap layouts; pripeti had to stay free for pin.
- `packages/i18n/glossary/sl.tbx` `tray`: "sistemska vrstica" — the Luft tray is a single taskbar button, so vrstica may read oddly; consider "skrite ikone" or "sistemski pladenj".
- `packages/i18n/glossary/sl.tbx` `board`: "tabla" — no established term; check that it reads naturally for an endless canvas of windows.
- `packages/i18n/glossary/sl.tbx` `Night light`: "Nočna svetloba" — confirm against Windows 11 in Slovenian, which may say "Nočna lučka".
- `packages/i18n/glossary/sl.tbx` `Keep awake`: "Ohrani budnost" — no established term; check it fits a quick settings tile.
- `packages/i18n/glossary/sl.tbx` `Media Viewer`: "Pregledovalnik medijev" — GNOME and KDE sometimes say predstavnost; check which people know better.
- `packages/i18n/glossary/sl.tbx` `notification center`: "središče za obvestila" — Windows has used both središče and center; confirm the current one.
- `packages/i18n/glossary/sl.tbx` `emoji`: "emodži" — check that this spelling is preferred over emoji in Slovenian software.
- `packages/i18n/glossary/sl.tbx` `firmware`: "vdelana programska oprema" — long for labels; check whether a shorter form is acceptable where space is tight.
- `docs/translations/sl.md` Address and tone: says macOS uses vi in Slovenian — confirm how Apple's Slovenian addresses the reader.
- `packages/web/settings-pages/locales/sl/pages.ftl` `settings-page-about`: "O sistemu" — Windows says Vizitka; check which fits a Settings sidebar better.
- `packages/web/ui/locales/sl/ui.ftl` `ui-media-pause`: "Začasno ustavi" — Windows' wording; "Premor" is shorter if this ever shows as a visible label.
- `kestrel/ui/locales/sl/shell.ftl` `battery-level`: "Baterija { $percentage } %, priključena na napajanje" — check the plugged-in but not charging state reads clearly.

## Kestrel and setup

- `kestrel/ui/locales/sl/desktop.ftl` `window-menu-close`: "[one] Zapri okno" — Slovenian `one` also covers 101, where "Zapri okno" would be wrong; English has no count in the text, so check whether a different construction is wanted.
- `kestrel/ui/locales/sl/surfaces.ftl` `start-search-settings-section`: "Nastavitve – { $page }" — chosen to avoid declining the page title; check it reads naturally as a search result description.
- `kestrel/ui/locales/sl/system.ftl` `health-gpu-reset-body`: "Računalnik se je sam znova zagnal ({ $date }, { $time }). …" — date in parentheses to avoid the "3. marec / 3. marca" case problem.
- `kestrel/ui/locales/sl/system.ftl` `oom-closed-body`: "… zato ga je sistem zaprl …" — "ga" fits both aplikacija (as program) and vsebnik only loosely; aplikacija is feminine, so a native check is useful.
- `kestrel/ui/locales/sl/system.ftl` `peek-see-title`: "Program { $app } želi videti vaša okna" — used "program" rather than "aplikacija" because the asker is usually a command-line tool, as the English errors say.
- `kestrel/ui/locales/sl/system.ftl` `privacy-indicator`: "V uporabi: { $things }" — dropped "your" so the list items stay in the nominative.
- `kestrel/ui/locales/sl/portal.ftl` `screen-share-remember-description`: "Naslednjič vas { $appName } ne vpraša znova" — present tense used to avoid gender agreement with the app name.
- `kestrel/ui/locales/sl/portal.ftl` `usb-description`: "Dokler je naprava priključena, lahko { $appName } z njo komunicira neposredno." — present tense to avoid gender agreement; $appName can also be "aplikacija" when unknown.
- `kestrel/ui/locales/sl/system.ftl` `network-menu-connect-to`: "Poveži z omrežjem { $name }" — $name can also be a device (phone tethering), where "omrežjem" is slightly off.
- `kestrel/ui/locales/sl/system.ftl` `display-change-title`: "Ohranim nastavitve zaslona?" — must stay under 30 characters; check the first-person form is acceptable.
- `apps/setup/locales/sl/setup.ftl` `setup-region-intro-guessed`: "Začnimo z nastavitvijo. Nekaj smo že izpolnili: { $guesses }. Popravite, kar ni prav." — $guesses joins pieces like "jezik in tipkovnica glede na računalnik"; check it reads well with the list formatter.
- `apps/setup/locales/sl/setup.ftl` `setup-network-unavailable`: "Povežete se lahko pozneje prek opravilne vrstice." — English says "from the panel"; assumed it means the taskbar.
- `kestrel/ui/locales/sl/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.

## Settings

- `apps/settings/locales/sl/connections.ftl` `settings-bluetooth-request-confirm`: "Ali naj se { $name } seznani s tem računalnikom?" — built so { $name } stays nominative (unnamed is „naprava“); check it reads naturally with real device names.
- `apps/settings/locales/sl/connections.ftl` `settings-bluetooth-request-authorize`: description "Naprava se bo lahko povezala s tem računalnikom." — { $name } dropped to avoid gender agreement with unknown names; check this is acceptable.
- `apps/settings/locales/sl/connections.ftl` `settings-bluetooth-windows`: "Naprava/Napravi/Naprave { $devices } …" — agreement assumes $count is the total number of devices in the list.
- `apps/settings/locales/sl/connections.ftl` `settings-network-ip-link-local`: "Samo lokalna povezava" — no settled Slovenian term for link-local.
- `apps/settings/locales/sl/connections.ftl` `settings-network-security-owe`: "Izboljšano odprto" — check against Windows' Slovenian wording for Enhanced Open.
- `apps/settings/locales/sl/system.ftl` `settings-accounts-apple-account`: "Račun Apple" — Apple has no Slovenian localization; chose the modifier-after-noun order from the style guide.
- `apps/settings/locales/sl/devices.ftl` `settings-power-duration-minutes`: "{ $minutes } minuto …" — durations are in the accusative (they follow „čez“, „zdrži še“); verify every sentence and picker using them takes the accusative, such as „Zdrži še približno { $time }“.
- `apps/settings/locales/sl/devices.ftl` `settings-keys-keypad`: "Številčnica { $key }" — check whether keyboards/OSes say Num or something else for keypad keys.
- `packages/web/ui/locales/sl/ui.ftl` `ui-passphrase-field`: "Šifrirno geslo" — used for the passphrase in setup and Settings alike; check it reads as distinct from the account "geslo" and matches what GNOME Disks uses in Slovenian.
- `apps/settings/locales/sl/protection.ftl` `settings-privacy-screen-off-after`: "{ $duration } nedejavnosti" — rebuilt as "5 minut nedejavnosti" so the duration's case never changes; check it reads well as a row value under "Zaslon se izklopi".
- `apps/settings/locales/sl/protection.ftl` `settings-security-hardware-fix-maker` (and the other fix-* messages): "Obe lahko doda …" for two — check that "obe" referring to listed protections (zaščite, f) reads naturally.
- `apps/settings/locales/sl/protection.ftl` `settings-passwords-history-signed`: "Aplikacija { $app } je podpisala s ključem „{ $item }“" — the item may be a password rather than a key; check "s ključem" fits.
- `apps/settings/locales/sl/protection.ftl` `settings-passwords-access-revoke`: "Prepovej aplikaciji { $app } uporabo elementa „{ $item }“" — "elementa" added to avoid declining the item name; check it isn't stiff.
- `apps/settings/locales/sl/personalization.ftl` `settings-appearance-wallpaper-tile`: "Razpostavi" — check against the Windows/GNOME Slovenian term for tiled wallpaper ("Tlakovano" is the other candidate).
- `apps/settings/locales/sl/personalization.ftl` `settings-accessibility-typing-assist-count`: "Vklopljeno: { $count }" — neutral form used for every plural category to avoid agreement with an unnamed noun.
- `apps/settings/locales/sl/system.ftl` `settings-datetime-increase`: "{ $label }: povečaj" — screen-reader label; word order chosen because $label is capitalized (Ura, Minuta).
- `apps/settings/locales/sl/system.ftl` `settings-updates-apps-count`: "{ $count } aplikacija ima posodobitev v aplikaciji Schelf" — "aplikacija … v aplikaciji" repeats; a reviewer may prefer another phrasing.

## Website

- `web/site/locales/sl/download.ftl` `download-meet-note`: "Več informacij … Vseeno zaženi" — SmartScreen button labels from memory; check them against a Slovenian Windows.
- `web/site/locales/sl/home.ftl` `home-intro`: "temelj, ki sam ostaja nedotaknjen" — free rendering of "a core that keeps itself in one piece"; check it reads naturally.
- `web/site/locales/sl/home.ftl` `home-app-disks`: "Pogoni" — the kind shown under Diski; needed a word other than the app name.
- `web/site/locales/sl/home.ftl` `home-motion-text`: "zato si lahko sredi giba premisli brez sunka" — the spring metaphor; check it doesn't read oddly.

## Meet Luft

- `apps/meet/locales/sl/meet.ftl` `linux-ready-description`: "… se kot običajno še naprej zaganja { $system }." — { $system } can be „ta sistem“, so Linux sentences keep it out of the sentence start; check the word order reads naturally.
- `apps/meet/locales/sl/meet.ftl` `linux-ready-restart-replace`: "Namestitveni program se odpre z že izbrano zamenjavo za { $system } …" — rebuilt to avoid declining the system name; check it isn't stiff.
- `apps/meet/locales/sl/meet.ftl` `check-found-description`: "To je ugotovila aplikacija Meet Luft." — messages avoid giving Meet Luft a gender by using „aplikacija Meet Luft“ or impersonal „ni bilo mogoče …“; check that's the right call.
- `apps/meet/locales/sl/meet.ftl` `stick-done-eject`: "Pred odstranitvijo ga izvrzite." — check against Windows' Slovenian wording for ejecting a drive.
- `apps/meet/desktop/locales/sl/desktop.ftl` `drive-storage-error`: "napaka shrambe sistema Windows { $code }" — no settled term for "Windows storage error".
- `apps/meet/desktop/locales/sl/desktop.ftl` `check-wifi-broadcom`: "telefon za internetno povezavo prek USB" — paraphrase of USB tethering; check Android's Slovenian term („Internet prek USB-ja“).
- `apps/meet/locales/sl/meet.ftl` `room-live-free`: "Prostega je že { $free }, …" — partitive genitive chosen so the sentence works for any size; check it reads naturally.
- `apps/meet/locales/sl/meet.ftl` `room-erase-bitlocker`: "Šifrirano z BitLockerjem" — neuter status form under a partition's name in the list; "Šifrirana" (agreeing with particija) is the alternative.
- `apps/meet/locales/sl/meet.ftl` `room-erase-understood`: "Vem, da je del tega šifriran z BitLockerjem in ga ni mogoče obnoviti" — tick box text in first person; check "del tega" reads clearly as "some of what is on the drive".
- `apps/meet/locales/sl/meet.ftl` `luft-windows-free-title`: "Prepusti prosti prostor sistemu Windows" — check "prepusti" is the most natural verb for handing free space over.
- `apps/meet/desktop/locales/sl/desktop.ftl` `check-space-free-already`: "Od tega je že prostih { $size } GB …" — "prostih" fits 5 and more and decimals; for 1–4 GB the agreement would be off.
