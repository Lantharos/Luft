# French review list

Strings in Luft's French translation that a native speaker should check: terms with no settled equivalent in French operating systems, and wording around placeables that may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/fr.tbx` `board`: "tableau" — no OS has this mode; check that it reads as a canvas of windows and not as a table or a dashboard.
- `packages/i18n/glossary/fr.tbx` `tray`: "barre d’état système" — chosen over Windows' "zone de notification" to avoid a clash with the notification center; check it is understood.
- `packages/i18n/glossary/fr.tbx` `Start`: "Start" — kept in English as a name, while French Windows says "Démarrer"; check "le menu Start" reads acceptably.
- `packages/i18n/glossary/fr.tbx` `App Store`: "Boutique d’applications" — long; GNOME says "Logiciels", Ubuntu "Logithèque".
- `packages/i18n/glossary/fr.tbx` `Keep awake`: "Maintenir éveillé" — no OS equivalent; check it fits a Quick settings tile.
- `packages/i18n/glossary/fr.tbx` `shut down`: "éteindre" — Windows' power menu says "Arrêter"; check the choice.
- `packages/i18n/glossary/fr.tbx` `undo`: "Annuler" — same word as cancel; check no screen shows both side by side.
- `packages/web/ui/locales/fr/ui.ftl` `ui-split-windows-size`: "{ $size }, dont { $used } utilisés" — "utilisés" is plural; reads oddly for values under 2 GB.
- `packages/web/ui/locales/fr/ui.ftl` `ui-toast-dismiss`: "Ignorer" — Windows' word for closing a notification; "Fermer" is the alternative.
- `kestrel/ui/locales/fr/shell.ftl` `keys-page-up`, `keys-page-down`, `keys-home`, `keys-print-screen`: "Pg préc", "Pg suiv", "Origine", "Impr écran" — keyboards print these inconsistently (often arrows); check they are the names people recognize.
- `kestrel/ui/locales/fr/shell.ftl` `battery-level` `[plugged]`: "Batterie { $percentage } %, sur secteur" — check it conveys plugged in but not charging.

## Kestrel and setup

- `kestrel/ui/locales/fr/system.ftl` `privacy-indicator`: "En cours d’utilisation : { $things }" — avoids a possessive because the list mixes genders and numbers (caméra, microphone, fenêtres); check it reads well with the joined list.
- `kestrel/ui/locales/fr/system.ftl` `dictation-unsupported-title`: "La dictée en { $language } n’est pas disponible…" — French language names are lowercase (« en japonais »); a capitalized or English name will look off.
- `kestrel/ui/locales/fr/system.ftl` `dictation-unsupported-body`: "…la reconnaissance vocale nécessaire pour cette langue ({ $language })…" — check the parenthesis reads naturally.
- `kestrel/ui/locales/fr/system.ftl` `media-keys-caps-lock-on`: "Verr. Maj activé" — Caps Lock and Num Lock are written « Verr. Maj » and « Verr. Num » everywhere, as Windows does, although many French keyboards print only a padlock arrow; check the key names.
- `kestrel/ui/locales/fr/system.ftl` `peek-error-declined`: "{ $app } pourra refaire la demande après son redémarrage." — "after it quits" rephrased to avoid agreement with the program name; check the meaning still holds.
- `kestrel/ui/locales/fr/auth.ftl` `end-session-log-out-user-countdown`: "{ $userName } sera déconnecté automatiquement…" — masculine participle regardless of the person; same for `end-session-log-out-countdown` « Vous serez déconnecté ».
- `kestrel/ui/locales/fr/system.ftl` `screenshot-screencasts-folder`: "Enregistrements de l’écran" — folder name follows the glossary term; check it isn't too long next to « Captures d’écran ».
- `kestrel/ui/locales/fr/desktop.ftl` `switch-monitor-join`: "Étendre" — Windows' word for joined displays; check it against Dupliquer, Externe seul and Intégré seul.
- `kestrel/ui/locales/fr/desktop.ftl` `task-view-desktop`: "Espace de travail { $number }" — Windows says « Bureau 1 », but here it names a workspace; check it fits the task view.
- `kestrel/ui/locales/fr/portal.ftl` `print-paper-executive`: "Exécutive" — paper size names (Lettre US, Légal US, Exécutive, Tabloïd, Statement) vary between CUPS and Windows; check they match French print dialogs.
- `apps/setup/locales/fr/setup.ftl` `setup-region-intro-guessed`: "Nous avons déduit { $guesses }, modifiez ce qui ne convient pas." — the guess fragments carry their own articles (« la langue et le clavier d’après votre ordinateur »); check the joined sentence with both sources.
- `apps/setup/locales/fr/setup.ftl` `setup-destination-meet-choice-description`: "Utiliser les { $size } préparés par Meet Luft à côté de Windows." — agreement assumes a size such as « 120 Go »; check it reads well.
- `apps/setup/locales/fr/setup.ftl` `setup-meet-room-packed`: "Ce que vous avez préparé dans Windows ({ $size }) sera déballé dans votre nouveau compte." — should match how Meet Luft's French names packing.
- `kestrel/ui/locales/fr/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.

## Settings

- `apps/settings/locales/fr/connections.ftl` `settings-network-security-owe`: "Ouvert amélioré" — Wi-Fi Alliance's "Enhanced Open" has no settled French name; check whether the English name or "OWE" reads better.
- `apps/settings/locales/fr/connections.ftl` `settings-network-autoconnect-wifi` (and -wired, -vpn, -other): "Dès que ce réseau est à portée" — short descriptions under the « Connexion automatique » switch; check they read well in place.
- `apps/settings/locales/fr/connections.ftl` `settings-network-wireguard-keepalive`: "Keepalive" — left in English as in WireGuard clients; GNOME says « Keepalive persistant ».
- `apps/settings/locales/fr/connections.ftl` `settings-network-ca`: "Certificat CA" — GNOME's wording; Windows' « certificat d’autorité de certification » may be clearer but is longer.
- `apps/settings/locales/fr/connections.ftl` `settings-bluetooth-request-authorize`: "Après l’association, { $name } pourra se connecter à cet ordinateur." — built so the unnamed form « l’appareil » never starts a sentence; check device names starting with a vowel after « de » and « à » in the other pairing strings.
- `apps/settings/locales/fr/connections.ftl` `settings-bluetooth-windows`: "Windows a déjà associé { $devices }. Vous pouvez l’utiliser ici…" — rephrased so nothing agrees with the device names' gender.
- `apps/settings/locales/fr/system.ftl` `settings-accounts-code`: "Code de validation" — Apple's French wording for the two-factor code; confirm.
- `apps/settings/locales/fr/devices.ftl` `settings-power-time-left`: "Environ { $time } d’autonomie" — chosen so the duration's gender and number don't matter.
- `apps/settings/locales/fr/devices.ftl` `settings-dictation-engine-description`: "Reconnaissance par { $engine } : { $language }" — the colon avoids agreement with language names that may arrive capitalized; check it reads naturally. Same for `settings-dictation-language-unavailable`.
- `apps/settings/locales/fr/devices.ftl` `settings-keys-keypad`: "{ $key } (pavé num.)" — no fixed French label for keypad keys; check length and wording.
- `apps/settings/locales/fr/devices.ftl` `settings-display-orientation-portrait-right`: "Portrait droit" — GNOME's wording; Windows has « Portrait » and « Portrait (retourné) ».
- `apps/settings/locales/fr/devices.ftl` `settings-display-night-light-warmth`: "Chaleur" — Windows calls this slider « Intensité »; check which is clearer.
- `apps/settings/locales/fr/protection.ftl` `settings-encryption-progress-minutes`: "Terminé à { $percent }, encore environ { $minutes } minute" — also inserted into `settings-security-encrypting-progress` before « . Vous pouvez continuer… »; check it reads well there.
- `apps/settings/locales/fr/protection.ftl` `settings-protection-remove`: "Supprimer" — one button for passkeys, SSH keys, the startup PIN and the anti-cheat firmware keys; check it suits the PIN, where « Retirer » might read softer.
- `apps/settings/locales/fr/protection.ftl` `settings-passwords-ssh-added`: "Ajoutée { $when }" — assumes $when reads like « il y a 3 jours » or « hier ».
- `apps/settings/locales/fr/personalization.ftl` `settings-appearance-icons-clear`: "Transparentes" — the English "Clear" icon style is ambiguous (glass-like or plain); check against the actual look.
- `apps/settings/locales/fr/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } activée" — agrees with « aide à la saisie »; check it reads well as a row summary.

## Website

- `web/site/locales/fr/home.ftl` `home-motion-heading`: "Chaque mouvement a un sens." — free rendering of "It moves like it means it"; check it carries the same confidence.
- `web/site/locales/fr/home.ftl` `home-wallpapers-text`: "la couleur d’accentuation, le verre et chaque application prennent ses couleurs" — "le verre" for the desktop's glass material; check it reads naturally.
- `web/site/locales/fr/home.ftl` `home-question-ready-answer`: "Des versions nightly sortent à chaque changement" — "nightly" kept in English as most French projects do; check whether « versions quotidiennes » reads better.
- `web/site/locales/fr/download.ftl` `download-meet-note`: "Informations complémentaires, puis Exécuter quand même" — SmartScreen's French labels from memory; confirm against a French Windows 11.

## Meet Luft

- `apps/meet/locales/fr/meet.ftl` `box-pack`: "Emballer" — packing for the moving box is « emballer / déballer » throughout Meet Luft (carton de déménagement); Setup's `setup-meet-room-packed` says « préparé », so check both read as the same thing.
- `apps/meet/locales/fr/meet.ftl` `ready-box-packed`: "Emballé, { $size }" — agrees with the box (masculine); check it reads well as the status under the moving box.
- `apps/meet/locales/fr/meet.ftl` `check-action-tidy`: "Faire le ménage" — button that removes stale start entries; check it isn't too casual next to « Ouvrir les paramètres du micrologiciel ».
- `apps/meet/locales/fr/meet.ftl` `stick-done-ventoy-key`: "…d’enregistrer sa propre clé de signature" — « clé » already means the USB stick on this screen; check « clé de signature » avoids the confusion.
- `apps/meet/desktop/locales/fr/desktop.ftl` `check-startup-bios-linux`: "…et faites aussi passer le système déjà présent en UEFI…" — the English "along with the system already here" is loose; check the meaning.
- `apps/meet/desktop/locales/fr/desktop.ftl` `check-firmware-key-volume-up`: "Volume +" — tablet button; check it is the usual way to name it.
- `apps/meet/locales/fr/meet.ftl` `meet-nightly`: "Versions nightly" — same choice as the website; check it fits the title bar.
- `apps/meet/locales/fr/meet.ftl` `room-place-windows-free`: "Espace déjà libre : { $size }" — rephrased so nothing agrees with the size; check it reads well as the detail line under « À côté de Windows ».
- `apps/meet/locales/fr/meet.ftl` `room-live-free`: "Une partie de cet espace ({ $free }) est déjà libre : Windows en cède donc moins…" — size in parentheses to avoid agreement with « 20 Go »; check it reads naturally.
- `apps/meet/locales/fr/meet.ftl` `luft-bar-used`: "{ $size }, dont { $used } utilisés" — same wording and the same plural issue as `ui-split-windows-size`.
- `apps/meet/locales/fr/meet.ftl` `luft-resize-passphrase`: "pendant qu’il se déplace" — "while it moves" (Luft moving into its new space at startup); check it is understood, or whether « pendant qu’il change de taille » is clearer.
