## Quick settings tiles

auto-rotate-title = Rotation auto
dark-style-title = Mode sombre
do-not-disturb-title = Ne pas déranger
night-light-title = Éclairage nocturne
airplane-mode-title = Mode avion

## Power mode

power-profile-title = Mode d’alimentation
power-profile-header = Mode d’alimentation
power-profile-open-menu = Ouvrir le menu des modes d’alimentation
power-profile-settings = Paramètres d’alimentation
power-profile-performance = Performances
power-profile-balanced = Équilibré
power-profile-power-saver = Économie d’énergie
power-profile-custom = Personnalisé

## Keep awake

caffeine-title = Maintenir éveillé
caffeine-open-menu = Ouvrir le menu Maintenir éveillé
caffeine-until = Jusqu’à { $time }
caffeine-until-turned-off = Jusqu’à désactivation
caffeine-30-minutes = 30 minutes
caffeine-1-hour = 1 heure
caffeine-2-hours = 2 heures
caffeine-inhibit-reason = Maintenu éveillé depuis les paramètres rapides

## Brightness

brightness-title = Luminosité
brightness-open-menu = Ouvrir le menu de luminosité

## Keyboard backlight

backlight-title = Rétroéclairage du clavier
backlight-open-menu = Ouvrir le menu de luminosité du clavier
backlight-slider = Luminosité du clavier
backlight-off = Désactivé
backlight-low = Faible
backlight-high = Élevé

## Sound

volume-sound-settings = Paramètres du son
volume-mute = Couper le son
volume-unmute = Rétablir le son
volume-output-slider = Volume
volume-output-title = Sortie audio
volume-output-open-menu = Ouvrir le menu de sortie audio
volume-input-slider = Microphone
volume-input-title = Entrée audio
volume-input-open-menu = Ouvrir le menu d’entrée audio

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Ouvrir le menu Bluetooth
bluetooth-settings = Paramètres Bluetooth
bluetooth-connect = Connecter
bluetooth-disconnect = Déconnecter
bluetooth-connect-device = Se connecter à { $deviceName }
bluetooth-disconnect-device = Déconnecter { $deviceName }
bluetooth-no-devices = Aucun appareil disponible ou connecté
bluetooth-turn-on-hint = Activez le Bluetooth pour vous connecter à des appareils
bluetooth-connected-count = { $count ->
    [one] { $count } connecté
   *[other] { $count } connectés
}

## Network menus in quick settings

network-menu-unknown-network = <inconnu>
network-menu-connect = Connecter
network-menu-disconnect = Déconnecter
network-menu-connect-to = Se connecter à { $name }
network-menu-disconnect-from = Déconnecter { $name }
network-menu-turn-off = Désactiver
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sécurisé, puissance du signal { $strength } %
   *[no] { $name }, non sécurisé, puissance du signal { $strength } %
}
network-menu-hotspot = Point d’accès { $name }
network-menu-connected-count = { $count ->
    [one] { $count } connectée
   *[other] { $count } connectées
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Ouvrir le menu VPN
network-menu-vpn-settings = Paramètres VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Ouvrir le menu Wi-Fi
network-menu-wifi-settings = Tous les réseaux
network-menu-wired = Connexions filaires
network-menu-wired-open-menu = Ouvrir le menu des connexions filaires
network-menu-wired-settings = Paramètres filaires
network-menu-tethers = Partages de connexion Bluetooth
network-menu-tethers-open-menu = Ouvrir le menu des partages de connexion Bluetooth
network-menu-tether = Partage de connexion
network-menu-tether-settings = Paramètres Bluetooth
network-menu-mobile-connections = Connexions mobiles
network-menu-mobile-open-menu = Ouvrir le menu des connexions mobiles
network-menu-mobile-settings = Paramètres du haut débit mobile
network-menu-mobile = Mobile
network-device-wired = Filaire
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Se connecter au réseau
network-menu-failed-title = Échec de la connexion
network-menu-failed-body = La connexion réseau n’a pas pu être activée

## Location access dialog

location-dialog-title = Autoriser l’accès à la position
location-dialog-description = L’application { $appName } veut accéder à votre position
location-dialog-info = Vous pouvez modifier l’accès à la position à tout moment dans les paramètres de confidentialité
location-dialog-deny = Refuser
location-dialog-grant = Autoriser

## Thunderbolt notifications

thunderbolt-unknown-title = Appareil Thunderbolt inconnu
thunderbolt-unknown-body = Un nouvel appareil a été connecté pendant votre absence. Débranchez-le puis rebranchez-le pour commencer à l’utiliser.
thunderbolt-unauthorized-title = Appareil Thunderbolt non autorisé
thunderbolt-unauthorized-body = Un nouvel appareil a été connecté et doit être approuvé par un administrateur
thunderbolt-error-title = Erreur d’autorisation Thunderbolt
thunderbolt-error-body = Impossible d’autoriser l’appareil Thunderbolt : { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Refuser
access-dialog-allow = Autoriser

## Display change confirmation

display-change-title = Conserver ces paramètres ?
display-change-countdown = { $seconds ->
    [one] Les modifications seront annulées dans { $seconds } seconde
   *[other] Les modifications seront annulées dans { $seconds } secondes
}
display-change-revert = Rétablir
display-change-keep = Conserver

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = « { $appName } » ne répond pas
close-dialog-description = Vous pouvez attendre un peu qu’elle reprenne, ou forcer l’application à quitter.
close-dialog-force-quit = Forcer à quitter
close-dialog-wait = Attendre

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Dupliquer
switch-monitor-join = Étendre
switch-monitor-external-only = Externe seul
switch-monitor-built-in-only = Intégré seul

## Sign-in prompt

auth-prompt-password = Mot de passe
auth-prompt-username = Nom d’utilisateur
auth-prompt-back = Retour
auth-prompt-submit = Valider
auth-prompt-wrong-password = Ce mot de passe n’a pas fonctionné
auth-prompt-failed = Cela n’a pas fonctionné. Réessayez.
fingerprint-not-recognized = Empreinte non reconnue

## Drive connected notification

autorun-connected = « { $driveName } » connecté
autorun-ready = Le disque est prêt à être utilisé
autorun-open-with = Ouvrir avec { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Touches lentes activées
kbd-a11y-slow-keys-off = Touches lentes désactivées
kbd-a11y-slow-keys-description = Vous venez de maintenir la touche Maj enfoncée pendant 8 secondes. C’est le raccourci des touches lentes, qui modifient le fonctionnement de votre clavier.
kbd-a11y-sticky-keys-on = Touches rémanentes activées
kbd-a11y-sticky-keys-off = Touches rémanentes désactivées
kbd-a11y-sticky-keys-on-description = Vous venez d’appuyer 5 fois de suite sur la touche Maj. C’est le raccourci des touches rémanentes, qui modifient le fonctionnement de votre clavier.
kbd-a11y-sticky-keys-off-description = Vous venez d’appuyer sur deux touches à la fois, ou 5 fois de suite sur la touche Maj. Cela désactive les touches rémanentes, qui modifient le fonctionnement de votre clavier.
kbd-a11y-leave-on = Laisser activé
kbd-a11y-turn-on = Activer
kbd-a11y-turn-off = Désactiver
kbd-a11y-leave-off = Laisser désactivé

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Choisir l’appareil audio
audio-device-cancel = Annuler
audio-device-sound-settings = Paramètres du son
audio-device-headphones = Casque
audio-device-headset = Casque-micro
audio-device-microphone = Microphone

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Autoriser le blocage des raccourcis
inhibit-shortcuts-app = L’application { $appName } veut bloquer les raccourcis
inhibit-shortcuts-unknown-app = Une application veut bloquer les raccourcis
inhibit-shortcuts-restore = Vous pouvez rétablir les raccourcis en appuyant sur { $shortcut }
inhibit-shortcuts-deny = Refuser
inhibit-shortcuts-allow = Autoriser

## Administrator authentication

polkit-title = Authentification requise
polkit-administrator = Administrateur
polkit-password = Mot de passe
polkit-cancel = Annuler
polkit-authenticate = S’authentifier
polkit-failed = Cela n’a pas fonctionné. Réessayez.

## Unlocking encrypted drives

mount-hidden-volume = Volume caché
mount-windows-system-volume = Volume système Windows
mount-uses-keyfiles = Utilise des fichiers de clés
mount-keyfiles-use-app = Pour déverrouiller un volume qui utilise des fichiers de clés, utilisez plutôt l’utilitaire <i>{ $appName }</i>
mount-keyfiles-need-app = Pour déverrouiller un volume qui utilise des fichiers de clés, il faut un utilitaire externe comme <i>Disques</i>
mount-pim-number = Numéro PIM
mount-pim-invalid = Le PIM doit être un nombre ou rester vide
mount-password = Mot de passe
mount-remember-password = Mémoriser le mot de passe
mount-cancel = Annuler
mount-unlock = Déverrouiller
mount-open-app = Ouvrir { $appName }
mount-wrong-password = Cela n’a pas fonctionné. Réessayez.
mount-unlock-failed = Impossible de déverrouiller le volume
mount-pim-unsupported = La version installée d’udisks ne prend pas en charge le paramètre PIM

## Log out, power off and restart dialog

end-session-log-out-user = Déconnecter { $userName }
end-session-log-out-title = Se déconnecter
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } sera déconnecté automatiquement dans { $seconds } seconde
   *[other] { $userName } sera déconnecté automatiquement dans { $seconds } secondes
}
end-session-log-out-countdown = { $seconds ->
    [one] Vous serez déconnecté automatiquement dans { $seconds } seconde
   *[other] Vous serez déconnecté automatiquement dans { $seconds } secondes
}
end-session-log-out-button = Se déconnecter
end-session-power-off-title = Éteindre
end-session-power-off-updates-title = Installer les mises à jour et éteindre
end-session-power-off-countdown = { $seconds ->
    [one] L’ordinateur s’éteindra automatiquement dans { $seconds } seconde
   *[other] L’ordinateur s’éteindra automatiquement dans { $seconds } secondes
}
end-session-power-off-button = Éteindre
end-session-restart-title = Redémarrer
end-session-restart-updates-title = Installer les mises à jour et redémarrer
end-session-restart-countdown = { $seconds ->
    [one] L’ordinateur redémarrera automatiquement dans { $seconds } seconde
   *[other] L’ordinateur redémarrera automatiquement dans { $seconds } secondes
}
end-session-restart-button = Redémarrer
end-session-update-restart-title = Redémarrer et installer les mises à jour
end-session-update-restart-countdown = { $seconds ->
    [one] L’ordinateur redémarrera automatiquement et installera les mises à jour dans { $seconds } seconde
   *[other] L’ordinateur redémarrera automatiquement et installera les mises à jour dans { $seconds } secondes
}
end-session-update-restart-button = Redémarrer et installer
end-session-install-updates = Installer les mises à jour en attente
end-session-install-version = Installer la version { $version }
end-session-low-battery = Batterie faible : branchez l’ordinateur avant d’installer les mises à jour
end-session-busy-apps = Certaines applications sont occupées ou ont du travail non enregistré
end-session-other-users = D’autres utilisateurs sont connectés
end-session-cancel = Annuler
end-session-boot-options = Options de démarrage
end-session-remote-user = { $userName } (à distance)
end-session-console-user = { $userName } (console)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Authentification requise
network-agent-wifi-rejected = Le mot de passe enregistré pour « { $networkName } » n’a pas fonctionné. Saisissez-le de nouveau.
network-agent-wifi-secrets = Un mot de passe ou une clé de chiffrement est nécessaire pour accéder au réseau sans fil « { $networkName } »
network-agent-wps-hint = Vous pouvez aussi vous connecter en appuyant sur le bouton « WPS » de votre routeur
network-agent-wired-title = Authentification filaire 802.1X
network-agent-dsl-title = Authentification DSL
network-agent-pin-title = Code PIN requis
network-agent-pin-body = Un code PIN est nécessaire pour l’appareil haut débit mobile
network-agent-vpn-title = Mot de passe VPN
network-agent-password-required = Un mot de passe est nécessaire pour se connecter à « { $networkName } »
network-agent-connect = Se connecter
network-agent-cancel = Annuler
network-agent-password = Mot de passe
network-agent-username = Nom d’utilisateur
network-agent-key = Clé
network-agent-private-key-password = Mot de passe de la clé privée
network-agent-identity = Identité
network-agent-service = Service
network-agent-network-name = Nom du réseau
network-agent-pin = Code PIN

## Lock screen clock

lock-clock-swipe-up = Balayez vers le haut
lock-clock-click-or-press = Cliquez ou appuyez sur une touche

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Fenêtres
ctrl-alt-tab-panel = Barre des tâches
ctrl-alt-tab-unlock = Fenêtre de déverrouillage

## System notifications

messages-system-source = Système
unsafe-mode-title = Le système est passé en mode non sécurisé
unsafe-mode-body = Les applications ont désormais un accès sans restriction
unsafe-mode-undo = Annuler
privileged-user-title = Connecté en tant qu’utilisateur privilégié
privileged-user-body = Pour des raisons de sécurité, évitez d’ouvrir une session en tant qu’utilisateur privilégié. Si possible, connectez-vous avec un compte standard.

## On-screen keyboard

osk-keyboard-settings = Paramètres du clavier
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel doit verrouiller l’écran

## Notifications

messages-unknown-app = Application inconnue
messages-reply = Répondre
messages-reply-placeholder = Écrire une réponse
messages-reply-send = Envoyer

## Media player controls

mpris-unknown-artist = Artiste inconnu
mpris-unknown-title = Titre inconnu

## Starting programs

spawn-failed = Impossible d’exécuter « { $command } » :

## Text field context menu

entry-menu-copy = Copier
entry-menu-paste = Coller
entry-menu-show-text = Afficher le texte
entry-menu-hide-text = Masquer le texte
entry-caps-lock-on = Verr. Maj est activé

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Prendre une capture d’écran
title-bar-menu-hide = Réduire
title-bar-menu-restore = Restaurer
title-bar-menu-maximize = Agrandir
title-bar-menu-move = Déplacer
title-bar-menu-resize = Redimensionner
title-bar-menu-always-on-top = Toujours au premier plan
title-bar-menu-always-on-visible-workspace = Sur tous les espaces de travail
title-bar-menu-workspace-left = Déplacer vers l’espace de travail de gauche
title-bar-menu-workspace-right = Déplacer vers l’espace de travail de droite
title-bar-menu-workspace-up = Déplacer vers l’espace de travail du haut
title-bar-menu-workspace-down = Déplacer vers l’espace de travail du bas
title-bar-menu-monitor-up = Déplacer vers l’écran du haut
title-bar-menu-monitor-down = Déplacer vers l’écran du bas
title-bar-menu-monitor-left = Déplacer vers l’écran de gauche
title-bar-menu-monitor-right = Déplacer vers l’écran de droite
title-bar-menu-close = Fermer

## Screenshots and screen recording

screenshot-source = Capture d’écran
screenshot-area = Sélection d’une zone
screenshot-screen = Sélection d’un écran
screenshot-window = Sélection d’une fenêtre
screenshot-take = Prendre une capture d’écran
screenshot-record = Enregistrer l’écran
screenshot-show-pointer = Afficher le pointeur
screenshot-capture = Capturer
screenshot-close = Fermer
screenshot-screencasts-folder = Enregistrements de l’écran
screenshot-screencast-file = Enregistrement de l’écran { $date } { $time }
screenshot-screenshots-folder = Captures d’écran
screenshot-file = Capture d’écran { $timestamp }
screenshot-screencast-recorded = Enregistrement de l’écran terminé
screenshot-screencast-start-failed = Impossible de démarrer l’enregistrement de l’écran
screenshot-screencast-out-of-space = Échec de l’enregistrement de l’écran : espace disque insuffisant
screenshot-screencast-try-again = Échec de l’enregistrement de l’écran. Réessayez.
screenshot-screencast-failed = Échec de l’enregistrement de l’écran
screenshot-screencast-view = Cliquez ici pour voir la vidéo
screenshot-show-in-rover = Afficher dans Rover
screenshot-captured = Capture d’écran effectuée
screenshot-captured-body = Vous pouvez coller l’image depuis le presse-papiers
