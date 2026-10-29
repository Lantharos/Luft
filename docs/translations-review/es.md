# Spanish review list

Strings in Luft's Spanish translation that a native speaker should check: terms with more than one established equivalent, and wording around placeables or tight labels that may not fit every case.

## Terms and shared strings

- `packages/i18n/glossary/es.tbx` `Start`: "Inicio" — the brief keeps Start in English, but Spanish Windows says menú Inicio and Start can't inflect; check it doesn't clash with Inicio as the Home key name in shortcut labels.
- `packages/i18n/glossary/es.tbx` `Settings`: "Configuración" — Apple now says Ajustes; check Configuración still reads as the app name and not only as an abstract noun.
- `packages/i18n/glossary/es.tbx` `tray`: "bandeja del sistema" — Windows 11 no longer names it; check it is understood on a taskbar button.
- `packages/i18n/glossary/es.tbx` `board`: "tablero" — no established term in other systems.
- `packages/i18n/glossary/es.tbx` `snap layout`: "diseño de acoplamiento" — Windows' term, but long; check it fits in Super+Z labels.
- `packages/i18n/glossary/es.tbx` `Keep awake`: "Mantener activo" — the screen is feminine; check it reads right as a Quick settings tile.
- `packages/i18n/glossary/es.tbx` `signed startup`: "arranque firmado" — no settled term.
- `packages/i18n/glossary/es.tbx` `computer`: "ordenador" — Spain-only; Windows uses the neutral equipo.
- `packages/web/ui/locales/es/ui.ftl` `ui-recovery-key-saved`: "Guardada" — feminine, agreeing with clave; check it's only ever shown next to the recovery key.
- `packages/web/ui/locales/es/ui.ftl` `ui-fingerprint-place`: "Coloca el { $finger } en el sensor." — the article sits in the sentence, so every finger's .inline form must be masculine (they all are).
- `packages/web/ui/locales/es/ui.ftl` `ui-finger-right-middle`: "Dedo corazón derecho" — corazón is Spain's word; Latin America says medio.
- `kestrel/ui/locales/es/shell.ftl` `battery-level`: "Batería al { $percentage } %, conectada" — check "conectada" for plugged in but not charging; Quick settings and Settings say "Enchufado", which can't agree with batería here.
- `packages/web/settings-pages/locales/es/pages.ftl` `settings-page-about`: "Información" — Windows' and macOS' word; GNOME says Acerca de, which is in the keywords.

## Kestrel and setup

- `kestrel/ui/locales/es/system.ftl` `privacy-indicator`: "En uso: { $things }" — built as a colon list so the items need no possessive or gender agreement; check it reads well to a screen-reader user.
- `kestrel/ui/locales/es/system.ftl` `battery-left`: "Queda un { $percent }." — assumes $percent arrives as "8 %"; check "un" before the figure reads naturally in every case.
- `kestrel/ui/locales/es/surfaces.ftl` `quick-settings-battery-left`: "Quedan { $duration }" — the plural verb is wrong when the span is a single unit such as "1 h"; check whether a neutral wording is better.
- `kestrel/ui/locales/es/system.ftl` `network-menu-tether`: "Conexión compartida" — Bluetooth tethering has no settled Spanish term (Android says "Compartir conexión por Bluetooth"); anclaje was avoided because anclar means pin. Check it reads right as a Quick settings tile title.
- `kestrel/ui/locales/es/desktop.ftl` `switch-monitor-external-only`: "Solo externas" — the plural assumes several external displays may be meant; check against the 15-character limit and context.
- `kestrel/ui/locales/es/portal.ftl` `print-paper-statement`: "Media carta" — North American paper names; check they match what Spanish print dialogs show.
- `apps/setup/locales/es/setup.ftl` `setup-region-guess-from-computer`: "tu { $fields } a partir del ordenador" — "tu" before a joined list ("tu idioma y teclado") is acceptable, but check it reads well with every field combination.
- `apps/setup/locales/es/setup.ftl` `setup-account-full-name-example`: "Clara Campoamor" — chosen as a well-known Spanish name; confirm.
- `kestrel/ui/locales/es/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.

## Settings

- `apps/settings/locales/es/connections.ftl` `settings-network-security-owe`: "Abierta mejorada" — no settled Spanish name for Wi‑Fi Enhanced Open (OWE); check whether it should stay in English.
- `apps/settings/locales/es/connections.ftl` `settings-network-wireguard-keepalive`: "Keepalive" — kept in English as WireGuard clients do; check whether a Spanish term reads better.
- `apps/settings/locales/es/system.ftl` `settings-accounts-approve`: "la Protección de datos avanzada" — check against Apple's current Spanish (Spain) name for Advanced Data Protection.
- `apps/settings/locales/es/devices.ftl` `settings-dictation-hold`: "Pulsa y mantén { $keys } para dictar" — avoids "mantén pulsado/pulsada" because $keys can be a shortcut or "la tecla Copilot"; check it reads naturally (same in `settings-dictation-description`).
- `apps/settings/locales/es/devices.ftl` `settings-dictation-language-unavailable`: "El idioma { $language } no está disponible en este ordenador" — "el idioma" is added so the lowercase language name doesn't start the sentence; same in `settings-dictation-engine-description`.
- `apps/settings/locales/es/devices.ftl` `settings-keys-keypad`: "{ $key } del teclado numérico" — long for a shortcut label; check whether a shorter form is preferred.
- `apps/settings/locales/es/devices.ftl` `settings-power-limit-stops-at`: "Detiene la carga al { $level }" — assumes $level is a percentage ("al 80 %").
- `apps/settings/locales/es/personalization.ftl` `settings-notifications-banners`: "Avisos" — Windows says "banners de notificación"; check "Avisos" is clear enough (also in `settings-notifications-summary-both`, `settings-notifications-summary-banners`, `settings-notifications-dnd-description`).
- `apps/settings/locales/es/personalization.ftl` `settings-cursors-folder-description`: "Aquí aparecen los temas que pongas en Carpeta personal › .local › share › icons" — "Carpeta personal" for Home follows GNOME; check it matches what Rover shows.
- `apps/settings/locales/es/personalization.ftl` `settings-appearance-icons-clear`: "Transparentes" — the English "Clear" icon style; check it describes the glass-like look.
- `apps/settings/locales/es/personalization.ftl` `settings-accessibility-typing-assist`: "Ayuda para escribir" — the count variants are feminine ("{ $count } activada(s)"), counting assists (ayudas); check it reads naturally under this heading.
- `apps/settings/locales/es/protection.ftl` `settings-security-anti-cheat`: "Juegos con antitrampas" — check "antitrampas" is what Spanish players say rather than "anti-cheat".
- `apps/settings/locales/es/protection.ftl` `settings-usb-hold-back`: "Retener los dispositivos USB nuevos" — check "retener" is clear for holding them back until unlock.
- `apps/settings/locales/es/system.ftl` `settings-updates-stay`: "Seguir en la { $version }" — elides "versión" before the number; check it reads well with real version values.
- `apps/settings/locales/es/system.ftl` `settings-updates-released`: "Publicada { $when }" — assumes $when is a phrase like "hace 3 días" or "ayer".

## Website

- `web/site/locales/es/home.ftl` `home-motion-heading`: "Se mueve con intención." — free rendering of "It moves like it means it"; check it works as a heading.
- `web/site/locales/es/home.ftl` `home-wallpapers-text`: "el color de énfasis, el cristal y todas las aplicaciones toman sus colores" — "el cristal" for the desktop's glass material; check it reads naturally.
- `web/site/locales/es/home.ftl` `home-question-ready-answer`: "Las versiones nightly salen cada vez que algo cambia" — "nightly" kept in English as most Spanish projects do; check whether «versiones diarias» reads better.
- `web/site/locales/es/download.ftl` `download-meet-note`: "Más información y luego Ejecutar de todas formas" — SmartScreen's Spanish labels from memory; confirm against a Spanish Windows 11.

## Meet Luft

- `apps/meet/locales/es/meet.ftl` `ready-remove-description`: "incluida la caja de mudanza" — "caja de mudanza" for the moving box is new here (setup avoids naming it); check it reads naturally (also in `working-packing` .description and `drive-box-no-guid` in desktop.ftl).
- `apps/meet/locales/es/meet.ftl` `meet-logs-saved`: "los registros de la prueba de Luft" — "Try Luft" rendered as "la prueba de Luft" so it fits the sentence; check it's clear it means the Try Luft session (same in `meet-logs-none`, `meet-logs-failed`, `logs-not-saved`).
- `apps/meet/locales/es/meet.ftl` `meet-channel-latest`: "Meet Luft volverá a usar las versiones normales" — "releases" as "versiones normales" to contrast with nightly; check a better word exists.
- `apps/meet/locales/es/meet.ftl` `check-get-ready-file`: "No se cambian las particiones" — for "Nothing is repartitioned"; check it's clear nothing on the disk layout changes (also `check-folder-fine` in desktop.ftl).
- `apps/meet/desktop/locales/es/desktop.ftl` `check-space-short-windows`: "con Liberador de espacio en disco" — Windows' Spanish name for Disk Cleanup from memory; confirm against a Spanish Windows 11.
- `apps/meet/desktop/locales/es/desktop.ftl` `check-firmware-key-volume-up`: "subir volumen" — check this reads right inside "pulsa { $key } cuando aparezca el logotipo".
- `apps/meet/desktop/locales/es/desktop.ftl` `helper-not-started`: "El asistente de Meet Luft" — "helper" as "asistente", which can also suggest a wizard; check whether "proceso auxiliar" is clearer.
- `apps/meet/desktop/locales/es/desktop.ftl` `helper-box-room-shortfall`: "El espacio de Luft puede ceder { $available } GB…" — "Luft's room" is the space set aside for Luft, which holds the moving box; check «ceder» reads right here, where Windows is not the one giving.
- `apps/meet/locales/es/meet.ftl` `luft-resize-passphrase`: "mientras se traslada" — "while it moves" (Luft moving into its new space at startup); check it is understood, or whether «mientras cambia de tamaño» is clearer.
