# Romanian review list

Strings in Luft's Romanian translation that a native speaker should check. Each is listed because the English is ambiguous, the term has no settled Romanian equivalent, or the wording may clip or not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/ro.csv` `snap`: "andoca", snap layout "aranjament de andocare" — Windows' Romanian term for snapping is unclear to me; check it's natural and doesn't clash with pin ("fixa").
- `packages/i18n/glossary/ro.csv` `tray`: "tava de sistem" — Windows 11 calls this area something else; check it's understood.
- `packages/i18n/glossary/ro.csv` `board`: "tablă" — no settled term; check it reads as a canvas of windows, not a table.
- `packages/i18n/glossary/ro.csv` `sign in`: "conecta" — follows Windows, but clashes with connecting to a network or device; "autentifica" is the alternative.
- `packages/i18n/glossary/ro.csv` `Keyring`: "Portchei" — macOS's word; GNOME's Romanian term may differ.
- `packages/i18n/glossary/ro.csv` `undo`: "Anulează" — the same button text as Cancel; check that's acceptable where both can appear.
- `packages/i18n/glossary/ro.csv` `Install Luft`: "Instalează Luft" — imperative as an app name; "Instalare Luft" is the noun alternative.
- `packages/i18n/glossary/ro.csv` `Keep awake`: "Menține activ" — check it reads as keeping the screen on.
- `packages/ui/locales/ro/ui.ftl` `ui-finger-right-index`: "Arătătorul drept" — articulated finger names used as titles; check they read well in a list.
- `packages/ui/locales/ro/ui.ftl` `ui-split-windows-size`: "{ $size }, ocupat: { $used }" — rephrased to avoid agreement with the size; check it reads naturally.
- `packages/ui/locales/ro/ui.ftl` `ui-recovery-key-saved`: "Salvată" — feminine to agree with "cheie"; check it's clear on its own.
- `packages/ui/locales/ro/ui.ftl` `ui-select-placeholder`: "Alege" — imperative singular as a dropdown placeholder; "Selectați" may read better.
- `apps/settings/locales/ro/pages.ftl` `settings-page-accessibility`: "taste de respingere" for bounce keys — check the term Windows uses.
- `kestrel/ui/locales/ro/shell.ftl` `battery-level`: "Baterie { $percentage }%" — percent sign with no space, as in Windows; check against the preferred norm.

## Kestrel and setup

- `kestrel/ui/locales/ro/system.ftl` `privacy-indicator`: "În uz: { $things }" with articulated list items (camera, microfonul, ecranul, locația, ferestrele) — check it reads naturally with the list joiner, e.g. "În uz: camera, microfonul și ecranul".
- `kestrel/ui/locales/ro/desktop.ftl` `snap-zone`: "Andochează într-o zonă de { $width }% pe { $height }%" — check "X% pe Y%" is a natural way to say width by height.
- `kestrel/ui/locales/ro/desktop.ftl` `task-view-desktop`: "Spațiu de lucru { $number }" — follows the workspace term instead of Windows' "Desktop 2"; check it fits under a workspace thumbnail.
- `kestrel/engine/locales/ro/engine.ftl` `bluetooth-connected-count`: "{ $count } dispozitive conectate" — tile subtitle, may clip; a shorter "{ $count } conectate" is the fallback.
- `kestrel/engine/locales/ro/engine.ftl` `network-menu-connected-count`: "{ $count } conexiuni active" — tile subtitle, may clip.
- `kestrel/engine/locales/ro/engine.ftl` `switch-monitor-join`: "Extindere" — Windows' "Extinde" wording; confirm it fits "Join Displays".
- `kestrel/engine/locales/ro/engine.ftl` `ctrl-alt-tab-unlock`: "Fereastra de deblocare" — the lock screen's sign-in prompt; check the wording.
- `kestrel/engine/locales/ro/engine.ftl` `end-session-log-out-user-countdown`: "{ $userName } se va deconecta automat în …" — reflexive to avoid gender agreement with the name.
- `kestrel/engine/locales/ro/engine.ftl` `thunderbolt-unknown-body`: "…a fost conectat cât timp computerul era blocat…" — "while you were away" rendered as "while the computer was locked"; confirm that is the real situation.
- `apps/setup/locales/ro/setup.ftl` `setup-region-intro-guessed`: "Am dedus { $guesses }, …" with parts like "limba și tastatura de pe computer" — check the assembled sentence with both sources.
- `apps/setup/locales/ro/setup.ftl` `setup-windows-bitlocker`, `setup-windows-hibernated`: "Gestionare disc", "Pornire rapidă", "Închidere" — check these match Romanian Windows' exact labels.
- `apps/setup/locales/ro/setup.ftl` `setup-account-full-name-example`: "Ana Aslan" — chosen as a well-known Romanian name.
- `apps/setup/locales/ro/setup.ftl` `setup-replace-erases-system`: "Partiția de sistem din { $system } se șterge." — avoids declining the system name.
- `apps/setup/installer/locales/ro/installer.ftl` `installer-no-deployment`: "Noul sistem nu are nicio implementare" — "deployment" (ostree) has no settled term.

## Settings

- `apps/settings/locales/ro/connections.ftl` `settings-network-security-owe`: "Deschisă îmbunătățită" — no settled Romanian term for Enhanced Open (OWE); check against what Windows/Android show in Romanian.
- `apps/settings/locales/ro/connections.ftl` `settings-network-autoconnect-other`: "Se conectează ori de câte ori este disponibilă" — feminine agreement assumes „conexiunea”; check it reads right for any connection kind.
- `apps/settings/locales/ro/connections.ftl` `settings-network-all-users`: "Disponibilă pentru toți" — feminine agreement assumes „rețea/conexiune”; may also be shown for a VPN.
- `apps/settings/locales/ro/connections.ftl` `settings-network-wireguard-keepalive`: "Keepalive" — left in English as WireGuard's own setting name; check whether a Romanian label is preferred.
- `apps/settings/locales/ro/connections.ftl` `settings-accounts-remove-note`: "Fișierele rămân în { $provider }." — „în OneDrive/iCloud Drive” is fine, but check it with every provider name.
- `apps/settings/locales/ro/connections.ftl` `settings-accounts-approve`: "Protecția avansată a datelor" — Apple's Romanian name for Advanced Data Protection should be confirmed.
- `apps/settings/locales/ro/devices.ftl` `settings-sound-mute`: "Dezactivează sunetul pentru { $name }" — $name can be „Volum” or an app name; „pentru Volum” is slightly awkward for screen readers.
- `apps/settings/locales/ro/devices.ftl` `settings-keys-keypad`: "Num { $key }" — chosen as a short keypad prefix; check what Romanian keyboard labels or Windows use.
- `apps/settings/locales/ro/devices.ftl` `settings-keys-volume-up`: "Volum mai tare" — media key names (volume, brightness, mute, eject) have no printed Romanian names; check they read as key names.
- `apps/settings/locales/ro/devices.ftl` `settings-power-cycles`: "{ $cycles } de cicluri de încărcare" — with a list of numbers the „de” follows the last one only; check it reads acceptably.
- `apps/settings/locales/ro/devices.ftl` `settings-power-limited-lap`: "…deoarece computerul este pe genunchi" — check this is natural for the lap-detection state.
- `apps/settings/locales/ro/devices.ftl` `settings-dictation-engine-description`: "{ $engine } recunoaște limba { $language }" — assumes the language name arrives as a nominative noun like „română”.
- `apps/settings/locales/ro/system.ftl` `settings-updates-elsewhere-download-by` and the other `-by` messages: "Actualizările sunt descărcate de { $app }" — passive so that $app (an app name, a tool like dnf, or „o altă aplicație”) needs no article; check it reads naturally.
- `apps/settings/desktop/locales/ro/desktop.ftl` `desktop-shortcut-switch-panels`: "Comută între controalele sistemului" — vague English source; check it describes moving focus between taskbar and other desktop parts.
- `apps/settings/locales/ro/personalization.ftl` `settings-cursors-folder-description`: "Temele puse în Folder personal › .local › share › icons apar aici" — check the home folder name matches what Rover shows in Romanian.
- `apps/settings/locales/ro/personalization.ftl` `settings-appearance-icons-clear`: "Transparente" — English "Clear" icon style; check it reads right next to Originale and Nuanțate.
- `apps/settings/locales/ro/personalization.ftl` `settings-cursors-downloads`: "{ $downloads } de descărcări" — $downloads is a shortened number like 1,2K; check "de" reads fine with such values.
- `apps/settings/locales/ro/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } opțiuni active" — added a noun for agreement; may be long for a summary row.
- `apps/settings/locales/ro/protection.ftl` `settings-encryption-unlock-title`: passphrase translated as "frază de acces" throughout, distinct from "parolă"; confirm the term.
- `apps/settings/locales/ro/protection.ftl` `settings-encryption-relink`: "Asociază din nou" — "Link the security chip again"; check the verb.
- `apps/settings/locales/ro/protection.ftl` `settings-encryption-step-screen`: "…ecranul „Encrypting your device”." — boot screen title kept in English, as German did; change if that screen is localized.
- `apps/settings/locales/ro/protection.ftl` `settings-security-anti-cheat`: "Jocuri cu anti-cheat" — kept the gamer loanword.
- `apps/settings/locales/ro/protection.ftl` `settings-passwords-stores-count`: "{ $count } conectări salvate" — "sign-ins" as countable "conectări"; check naturalness.
- `apps/settings/locales/ro/system.ftl` `settings-users-account`: "Contul meu" — first person chosen to avoid "dvs."; check against the style guide.
