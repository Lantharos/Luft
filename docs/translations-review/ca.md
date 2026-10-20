# Catalan review list

Strings in Luft’s Catalan translation that a native speaker should check: terms with more than one established equivalent, and wording around placeables or tight labels that may not fit every case.

## Terms and shared strings

- `packages/i18n/glossary/ca.csv` `Start`: "Inici" — translated as in Catalan Windows; check it doesn’t clash with Inici as the Home key name in shortcut labels.
- `packages/i18n/glossary/ca.csv` `snap layout`: "disposició d’ajust" — check what Catalan Windows 11 calls snap layouts and snap groups; no settled term elsewhere.
- `packages/i18n/glossary/ca.csv` `board`: "tauler" — no established term in other systems.
- `packages/i18n/glossary/ca.csv` `Keep awake`: "Mantén actiu" — masculine, implying the computer; check it reads right as a Quick settings tile that keeps the screen on.
- `packages/i18n/glossary/ca.csv` `Install Luft`: "Instal·la Luft" — imperative like a button; check it works as an app name, or whether «Instal·lació de Luft» reads better.
- `packages/i18n/glossary/ca.csv` `signed startup`: "arrencada signada" — no settled term.
- `packages/i18n/glossary/ca.csv` `sandbox`: "entorn aïllat" — Softcatalà also uses «entorn de proves»; check which is clearer next to Accés complet.
- `packages/i18n/glossary/ca.csv` `USB stick`: "memòria USB" — Windows says «unitat flaix USB»; check the everyday word.
- `packages/i18n/glossary/ca.csv` `Power saver`: "Estalvi d’energia" — check it doesn’t read as Windows’ «Estalvi de bateria», a different feature.
- `docs/translations/ca.md` address: vós in running text with tu imperatives on buttons follows Softcatalà, while Catalan Windows and macOS now use tu throughout; check the mix still reads natural.
- `packages/ui/locales/ca/ui.ftl` `ui-select-placeholder`: "Trieu" — short vós imperative in a dropdown; check it doesn’t look abrupt.
- `packages/ui/locales/ca/ui.ftl` `ui-recovery-key-saved`: "Desada" — feminine, agreeing with clau; check it’s only ever shown next to the recovery key.
- `packages/ui/locales/ca/ui.ftl` `ui-fingerprint-place`: "Col·loqueu el { $finger } sobre el sensor." — the article sits in the sentence, so every finger’s .inline form must be masculine (they all are: dit, polze).
- `packages/ui/locales/ca/ui.ftl` `ui-finger-right-little`: "Dit petit dret" — «dit petit» is the everyday word; «menovell» or «auricular» are more formal.
- `apps/settings/locales/ca/pages.ftl` `settings-page-mouse`: "Ratolí i ratolí tàctil" — repetitive and long in the sidebar.
- `apps/settings/locales/ca/pages.ftl` `settings-page-region`: "Llengua i regió" — Windows says «Idioma i regió»; check which people expect.
- `kestrel/ui/locales/ca/shell.ftl` `battery-level`: "Bateria al { $percentage } %, endollada" — check «endollada» for plugged in but not charging.
- `kestrel/ui/locales/ca/shell.ftl` `keys-shift`: "Maj" — Catalan software writes Maj, while Spanish-layout keyboards often print Mayús or only an arrow.

## Kestrel and setup

- `kestrel/ui/locales/ca/system.ftl` `privacy-indicator`: "En ús: { $things }" — the privacy-thing items are bare nouns (càmera, micròfon…) so the list needs no articles or agreement; check it reads well as a screen-reader label.
- `kestrel/ui/locales/ca/system.ftl` `dictation-unsupported-title` / `dictation-unsupported-body`: "El dictat en { $language }…" — $language currently arrives in English, so the sentence will mix languages until the speech service localizes names.
- `kestrel/ui/locales/ca/desktop.ftl` `task-view-desktop`: "Espai de treball { $number }" — follows the glossary (workspace), but Catalan Windows says «Escriptori 1»; check it fits the task view card.
- `kestrel/ui/locales/ca/desktop.ftl` `tray-apps`: "Aplicacions de la safata del sistema" — long for a screen-reader label; «Aplicacions de la safata» may be enough.
- `apps/setup/locales/ca/setup.ftl` `setup-region-field-language` (and keyboard, time-zone): "la llengua", "el teclat", "la zona horària" — written with the article because they are only joined into setup-region-intro-guessed («Hem deduït la llengua i el teclat a partir de l’ordinador…»); verify the list joiner produces «i».
- `apps/setup/locales/ca/setup.ftl` `setup-replace-keeps-drives`: "{ $drives }, muntats en arrencar com abans" — plural masculine agreement assumes several drives; with one it should be «muntat».
- `apps/setup/locales/ca/setup.ftl` `setup-destination-meet-choice-description` etc.: option labels and their descriptions use the singular imperative like buttons (Conserva, Esborra, Fes-hi una ullada), while step titles use vós (Trieu un disc); check this split feels right.
- `apps/setup/locales/ca/setup.ftl` `setup-windows-fast-startup`: "Desactiva l’inici ràpid de Windows" — Catalan Windows calls Fast Startup «Inici ràpid»; confirm.
- `kestrel/engine/locales/ca/engine.ftl` `switch-monitor-join`: "Amplia" — Windows' term for extending displays; check it's clear next to Duplica.
- `kestrel/engine/locales/ca/engine.ftl` `ctrl-alt-tab-panel`: "Barra de tasques" — English says Panel but the comment says it is the taskbar.
- `kestrel/engine/locales/ca/engine.ftl` `inhibit-shortcuts-title`: "Permet inhibir les dreceres" — GNOME's wording; «inhibir» may feel technical.
- `kestrel/ui/locales/ca/portal.ftl` `print-paper-statement`: "Statement" — kept in English, there's no common Catalan name for this paper size.

## Settings

- `apps/settings/locales/ca/connections.ftl` `settings-network-router`: "Encaminador" — Softcatalà's term; confirm it isn't too formal next to «router», which many people use.
- `apps/settings/locales/ca/connections.ftl` `settings-network-wireguard-keepalive`: "Manteniment de la connexió" — WireGuard's «keepalive» has no settled Catalan term; check whether keeping «Keepalive» is clearer to the people who use this field.
- `apps/settings/locales/ca/connections.ftl` `settings-accounts-online`: "Cada compte és una carpeta dins de Cloud…" — assumes the Cloud folder keeps its English name on disk; check against the folder's actual name.
- `apps/settings/locales/ca/connections.ftl` `settings-bluetooth-request-display`: "Escriviu aquest codi amb { $name } i premeu Retorn." — phrased with «amb» so the fallback «el dispositiu» doesn't need a contraction; check it reads well.
- `apps/settings/locales/ca/devices.ftl` `settings-sound-mute`: "Silencia: { $name }" — $name can be «Volum» or an app's name, so a colon was used; check this reads well for a screen reader.
- `apps/settings/locales/ca/devices.ftl` `settings-power-time-left`: "Queden aproximadament { $time }" — with «menys d’un minut» it reads «Queden aproximadament menys d’un minut»; check.
- `apps/settings/locales/ca/devices.ftl` `settings-dictation-engine-description`: "{ $engine } reconeix aquesta llengua: { $language }" — colon used because the language name would need an article («l’anglès»); check whether this feels stiff.
- `apps/settings/locales/ca/devices.ftl` `settings-keys-keypad`: "{ $key } (teclat numèric)" — check against how Catalan keyboard labels name keypad keys.
- `apps/settings/locales/ca/devices.ftl` `settings-keyboard-caps-lock`: "Tecla Bloq Maj" — key names Bloq Maj, Bloq Núm and Bloq Despl follow Spanish-layout keyboards; confirm.
- `apps/settings/locales/ca/personalization.ftl` `settings-fonts-sample`: "Jove xef, porti whisky amb quinze glaçons d’hidrogen, coi!" — the classic Catalan pangram; it needs «coi» for the letter c and ends with an exclamation mark. Check it is acceptable as a font sample.
- `apps/settings/locales/ca/personalization.ftl` `settings-appearance-wallpaper-fit-title`: "Encaix" (options Omple, Encaixa, Centra, Estira, Mosaic) — avoided «Ajusta» because the glossary reserves ajustar for snapping; check against what Catalan Windows/GNOME show for wallpaper fit.
- `apps/settings/locales/ca/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Imatges › Wallpapers" — the Wallpapers folder keeps its English name on disk; check that Imatges is the name Rover shows for Pictures.
- `apps/settings/locales/ca/personalization.ftl` `settings-cursors-folder-description`: "Carpeta personal › .local › share › icons" — Home rendered as GNOME's «Carpeta personal»; check it matches Rover's name for Home.
- `apps/settings/locales/ca/personalization.ftl` `settings-appearance-tint-slate`: "Pissarra" — slate as a color name; «Gris blavós» may read clearer.
- `apps/settings/locales/ca/protection.ftl` `settings-encryption-step-screen`: "Mentre s’inicia, apareixerà breument una pantalla «Encrypting your device»." — the startup screen is only shown in English, so its title is quoted as it appears; check this reads acceptably.
- `apps/settings/locales/ca/protection.ftl` `settings-security-anti-cheat`: "Jocs amb antitrampes" — no settled Catalan term for anti-cheat.
- `apps/settings/locales/ca/protection.ftl` `settings-security-hardware-fix-maker`: "Només el fabricant de l’ordinador pot afegir aquestes { $count } proteccions, …" — English has no noun here; «protecció/proteccions» is named so the pronoun has something to agree with. Check it reads well above the list.
- `apps/settings/locales/ca/protection.ftl` `settings-encryption-progress`: "{ $percent } completat" — check the agreement reads naturally («40 % completat») and fits inside settings-security-encrypting-progress.
- `apps/settings/locales/ca/protection.ftl` `settings-passkeys-last-used`: "Darrer ús: { $when }" — assumes $when is a relative phrase like «fa 3 dies»; same for `settings-passwords-ssh-added` "Afegida { $when }" and `system.ftl` `settings-updates-released` "Publicada { $when }".
- `apps/settings/locales/ca/system.ftl` `settings-about-other-system`: "Suprimiu-lo per donar-ne els { $size } a Luft" — check the article before the size placeable reads well.

## Website

- `web/site/locales/ca/home.ftl` `home-motion-heading`: "Cada moviment té intenció." — free rendering of "It moves like it means it"; check it works as a heading.
- `web/site/locales/ca/home.ftl` `home-meet-restart`: "Reinicia a Luft" — step heading written as a button-style imperative; check whether a noun («Reinici a Luft») suits the card better.
- `web/site/locales/ca/home.ftl` `home-question-ready-answer`: "Les versions nightly surten cada vegada que canvia alguna cosa" — "nightly" kept in English; check whether «versions diàries» reads better.
- `web/site/locales/ca/download.ftl` `download-meet-note`: "Més informació i després Executa igualment" — SmartScreen's Catalan labels could not be verified; confirm against a Catalan Windows 11.
