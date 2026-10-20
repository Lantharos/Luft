# Italian review list

Strings in Luft's Italian translation that a native speaker should check: terms without a settled Italian equivalent, choices between what Windows and GNOME say, and sentences built around a placeable.

## Terms and shared strings

- `packages/i18n/glossary/it.csv` `board`: "lavagna" — check that it reads naturally as the name of an endless canvas of windows, or whether keeping "board" is better.
- `packages/i18n/glossary/it.csv` `tray`: "vassoio di sistema" — KDE's term; Windows says "area di notifica", avoided here because Luft also has a notification center. Check it feels familiar.
- `packages/i18n/glossary/it.csv` `App Store`: "Store di app" — no settled generic name; alternatives are "Negozio di app" or GNOME's "Software".
- `packages/i18n/glossary/it.csv` `Power mode`: "Modalità energia" — shortened from "Modalità di alimentazione"; check it doesn't sound clipped.
- `packages/i18n/glossary/it.csv` `Keep awake`: "Mantieni attivo" — check it is clear that it keeps the screen on.
- `packages/i18n/glossary/it.csv` `sign out`: "uscire", button "Esci" — chosen over Windows' "Disconnetti" to avoid a clash with network and device disconnects.
- `packages/i18n/glossary/it.csv` `undo` / `cancel`: both "Annulla" on buttons, as in Windows — check no screen shows both side by side.
- `packages/ui/locales/it/ui.ftl` `ui-fingerprint-place`: "Appoggia { $finger } sul sensore." — the article lives in each finger's .inline form (l’indice, il pollice); check all ten read correctly.
- `packages/ui/locales/it/ui.ftl` `ui-time-just-now`: "adesso" — check it fits wherever relative times appear (it may need "poco fa").
- `packages/ui/locales/it/ui.ftl` `ui-toast-dismiss`: "Ignora" — Windows' label for dismissing a notification; "Chiudi" is the alternative.
- `apps/settings/locales/it/settings.ftl` `settings-more-show`: "Mostra ancora { $count }" / "Mostra altri { $count }" — the items' gender is unknown, so the singular avoids agreement.
- `apps/settings/locales/it/pages.ftl` `settings-page-region`: "Lingua e regione" — Windows says "Lingua e area geografica", which is longer; check it fits the sidebar.
- `kestrel/ui/locales/it/shell.ftl` `keys-page-up` / `keys-page-down`: "Pag su" / "Pag giù" — Italian keyboards print arrows or "Pag"; check the shortcut labels look right.
- `kestrel/ui/locales/it/shell.ftl` `keys-backspace`: "Backspace" — Italian keyboards print only an arrow; Microsoft's Italian docs use "Backspace".

## Kestrel and setup

- `kestrel/ui/locales/it/desktop.ftl` `task-view-desktop`: "Spazio di lavoro { $number }" — follows the glossary (workspace = spazio di lavoro) rather than Windows' "Desktop 1"; check it fits under the task view thumbnails.
- `kestrel/ui/locales/it/desktop.ftl` `taskbar-settings`: "Impostazioni della barra delle applicazioni" — long for a right-click menu item; check it doesn't clip.
- `kestrel/ui/locales/it/system.ftl` `dictation-unsupported-title`: "La dettatura in { $language } non è disponibile su questo computer" — $language arrives in English for now ("in Japanese"); reads oddly until the speech service sends localized names.
- `kestrel/ui/locales/it/system.ftl` `privacy-indicator`: "In uso: { $things }" — rebuilt as a label with bare nouns (fotocamera, microfono, schermo, posizione, finestre) so the list needs no articles; check it reads naturally to a screen-reader user.
- `kestrel/ui/locales/it/portal.ftl` `usb-title`: "Vuoi che { $appName } usi questo dispositivo?" — phrased with “Vuoi che” (also in screen-share-remote-desktop-title, screen-share-input-capture-title, shortcuts-consent-title) because “Consentire a { $appName }” would give “a l’app” when the app is unknown.
- `kestrel/ui/locales/it/portal.ftl` `print-paper-letter`: "Letter" — US paper names (Letter, Legal, Executive, Tabloid, Statement) left in English as Italian printer dialogs usually show them; check.
- `kestrel/ui/locales/it/surfaces.ftl` `notifications-more`: "{ $count } in più" — same form for one and other; check it reads well on the expand button.
- `kestrel/engine/locales/it/engine.ftl` `screenshot-screencasts-folder`: "Registrazioni schermo" — folder name created in the home folder; check against what Italian GNOME users expect (GNOME uses “Screencast”).
- `apps/setup/locales/it/setup.ftl` `setup-region-intro-guessed`: "Iniziamo con la configurazione. Abbiamo ricavato { $guesses }: correggi quello che non va." — field names carry their own article (la lingua, il fuso orario) so the joined list reads “la lingua e la tastiera dal tuo computer e il fuso orario dalla tua rete”; check the list joiner uses “e”.
- `apps/setup/locales/it/setup.ftl` `setup-network-unavailable`: "Puoi connetterti più tardi dalla barra delle applicazioni." — English says “from the panel”; assumed it means the taskbar's status icons.
- `apps/setup/locales/it/setup.ftl` `setup-windows-hibernated`: "…tieni premuto Maiusc mentre scegli Arresta il sistema…" — uses Windows' Italian menu item name and “avvio rapido” for Fast Startup; check they match current Windows 11 Italian.
- `apps/setup/installer/locales/it/installer.ftl` `installer-box-unopened`: "Impossibile aprire lo scatolone del trasloco" — check this matches the moving-box wording in Meet Luft's Italian text, if it gets one.

## Settings

- `apps/settings/locales/it/connections.ftl` `settings-network-automatic`: "Automatico" — shared word for an IP method (m) and a proxy mode (modalità, f); check it reads fine in both pickers.
- `apps/settings/locales/it/connections.ftl` `settings-network-security-owe`: "Enhanced Open" — kept the Wi‑Fi Alliance name; check whether a translation like "Aperta avanzata" is preferred.
- `apps/settings/locales/it/connections.ftl` `settings-network-wifi-connected`: "Connessa a { $network }" — feminine to agree with la Wi‑Fi; check it doesn't read as a mismatch next to "Connesso" elsewhere.
- `apps/settings/locales/it/connections.ftl` `settings-accounts-online`: "Ogni account è una cartella dentro Cloud, nella tua cartella home, …" — assumes the folder is literally named "Cloud" in every language.
- `apps/settings/locales/it/connections.ftl` `settings-bluetooth-request-authorize`: "Consentire l’associazione con { $name }?" — built so "il dispositivo" (request-unnamed) fits; same care in request-passkey ("Inserisci il codice che mostra { $name }") and request-display ("Digita questo codice con { $name }").
- `apps/settings/locales/it/connections.ftl` `settings-bluetooth-windows`: "Windows ha già associato { $devices }. Usalo qui …" — "lo" is masculine regardless of the device name's gender.
- `apps/settings/locales/it/devices.ftl` `settings-power-limit-stops-at`: "Ferma la ricarica a { $level }" — Italian normally says "all’80%"; "a 80%" avoids merging the article into the placeable (same in elsewhere-changed, elsewhere-on, description-at, applied).
- `apps/settings/locales/it/devices.ftl` `settings-dictation-engine-description`: "{ $engine } riconosce il parlato in { $language }" — assumes language names arrive lowercase ("inglese"); same in engine-graphics-card and language-unavailable.
- `apps/settings/locales/it/devices.ftl` `settings-sound-mute`: "Disattiva audio: { $name }" — colon form so both "Volume" and an app name fit.
- `apps/settings/locales/it/devices.ftl` `settings-keys-scroll-lock`: "Bloc Scorr" — also "Bloc Maiusc" for Caps Lock and "Bloc Num" in lock-notices; check against current Italian keyboards.
- `apps/settings/locales/it/personalization.ftl` `settings-fonts-sample`: "Pranzo d’acqua fa volti sghembi" — classic short Italian pangram; check it suits a font preview.
- `apps/settings/locales/it/personalization.ftl` `settings-appearance-icons-clear`: "Trasparenti" — English "Clear" icon style; check whether the style is glass-like or plain see-through.
- `apps/settings/locales/it/personalization.ftl` `settings-taskbar-look`: "Stile" — used instead of "Aspetto" to avoid repeating the page name; check it reads well next to Vetro/Pieno/Trasparente/Colore principale.
- `apps/settings/locales/it/personalization.ftl` `settings-accessibility-dwell-time`: "Fermo per" — followed by a duration slider; check it reads naturally with the slider value.
- `apps/settings/locales/it/protection.ftl` `settings-passwords-stores`: "Credenziali delle app" — "sign-ins" apps keep in the keyring rendered as credenziali; check it doesn't sound like passwords in general.
- `apps/settings/locales/it/protection.ftl` `settings-passwords-ssh-added`: "Aggiunta { $when }" — relies on $when being like "3 giorni fa" or "ieri".
- `apps/settings/locales/it/system.ftl` `settings-datetime-week-start-regional`: "Come nella tua regione: { $day }" — reordered so a lowercase weekday name doesn't start the label.
- `apps/settings/locales/it/system.ftl` `settings-updates-installed-when`: "Aggiornamenti installati { $when }" — relies on $when being a relative phrase like "ieri" or "5 minuti fa".
- `apps/settings/locales/it/system.ftl` `settings-about-storage-free`: "Liberi: { $free } su { $total }" — built with a colon so "liberi" needn't agree with the size.
