## Shared

system-cancel = Annuler

## Dictation notifications

dictation-setup-title = Saisir du texte en parlant
dictation-setup-body = Parlez pour écrire ce que vous dites, dans n’importe quelle application. La reconnaissance se fait sur cet ordinateur, elle a donc d’abord besoin de son modèle vocal.
dictation-setup-action = Configurer la dictée
dictation-unsupported-title = La dictée en { $language } n’est pas disponible sur cet ordinateur
dictation-unsupported-body = Son processeur ne peut pas faire fonctionner la reconnaissance vocale nécessaire pour cette langue ({ $language }). Vous pouvez dicter dans une autre langue.
dictation-settings-action = Paramètres de dictée

## System health notifications

health-gpu-reset-title = Le pilote graphique a cessé de répondre
health-gpu-reset-body = { $day ->
    [today] Votre ordinateur a redémarré de lui-même aujourd’hui à { $time }. Les Paramètres indiquent comment éviter que cela se reproduise.
   *[other] Votre ordinateur a redémarré de lui-même le { $date } à { $time }. Les Paramètres indiquent comment éviter que cela se reproduise.
}
health-gpu-reset-details = Détails

oom-app-closed-title = L’application { $app } a été fermée pour libérer de la mémoire
oom-container-closed-title = Un conteneur a été fermé pour libérer de la mémoire
oom-closed-body = L’ordinateur manquait de mémoire. Cette fermeture permet au reste du système de continuer à répondre.
oom-closed-body-with-size = L’ordinateur manquait de mémoire. Cette fermeture permet au reste du système de continuer à répondre. Mémoire utilisée : { $size }.
memory-low-title = Luft manque de mémoire
memory-low-app-body = L’application { $app } utilise { $size }. Forcez sa fermeture pour que le reste du système continue à répondre.
memory-low-container-body = Un conteneur utilise { $size }. Forcez sa fermeture pour que le reste du système continue à répondre.
memory-low-force-quit = Forcer la fermeture

## Input source indicator

input-source-indicator = Source de saisie : { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Le mode avion est activé par l’interrupteur matériel
media-keys-airplane-mode-on = Mode avion activé
media-keys-airplane-mode-off = Mode avion désactivé
media-keys-bluetooth-on = Bluetooth activé
media-keys-bluetooth-off = Bluetooth désactivé
media-keys-caps-lock-on = Verr. Maj activé
media-keys-caps-lock-off = Verr. Maj désactivé
media-keys-num-lock-on = Verr. Num activé
media-keys-num-lock-off = Verr. Num désactivé

## VPN sign-in

vpn-sign-in-title = Se connecter à { $connection }
vpn-connect = Se connecter
vpn-signing-in = Connexion…
vpn-finish-in-browser = Terminez la connexion dans votre navigateur.
vpn-certificate-untrusted = { $host } a présenté un certificat qui ne peut pas être vérifié ({ $reason }). Son empreinte est { $fingerprint }.
vpn-certificate-warning = Quelqu’un pourrait se faire passer pour ce serveur. Ne vous connectez que si vous vous y attendiez.
vpn-certificate-connect = Se connecter quand même

vpn-field-password = Mot de passe
vpn-field-certificate-password = Mot de passe du certificat
vpn-field-proxy-password = Mot de passe du proxy
vpn-field-pre-shared-key = Clé prépartagée
vpn-field-group-password = Mot de passe du groupe

## Battery notifications

battery-left = { $percent } restants.
battery-left-with-time = { $percent } restants, environ { $duration }.
battery-low-title = Batterie faible
battery-very-low-title = Batterie très faible
battery-almost-empty-title = Batterie presque vide
battery-ups-low-title = Batterie de l’onduleur faible
battery-ups-very-low-title = Batterie de l’onduleur très faible
battery-ups-almost-empty-title = Batterie de l’onduleur presque vide
battery-very-low-body = { $left } Branchez l’ordinateur bientôt.
battery-almost-empty-body = { $left } Branchez l’ordinateur maintenant pour ne pas perdre votre travail non enregistré.

battery-device-low-title = Batterie faible : { $device }
battery-device-very-low-title = Batterie très faible : { $device }
battery-device-low-body = { $left } Rechargez l’appareil bientôt.
battery-device-very-low-body = { $left } Rechargez l’appareil maintenant pour qu’il ne s’éteigne pas.

battery-device-mouse = Souris
battery-device-keyboard = Clavier
battery-device-phone = Téléphone
battery-device-tablet = Tablette
battery-device-controller = Manette
battery-device-pen = Stylet
battery-device-touchpad = Pavé tactile
battery-device-headset = Casque-micro
battery-device-speaker = Enceinte
battery-device-headphones = Casque
battery-device-remote = Télécommande
battery-device-other = Appareil connecté

## Privacy indicator

privacy-indicator = En cours d’utilisation : { $things }
privacy-thing-camera = caméra
privacy-thing-microphone = microphone
privacy-thing-screen = écran
privacy-thing-location = position
privacy-thing-windows = fenêtres

privacy-camera-unknown-app = Une application utilise la caméra
privacy-stop-sharing = Arrêter le partage d’écran
privacy-stop-recording = Arrêter l’enregistrement
privacy-turn-off-location = Désactiver la localisation
privacy-settings = Paramètres de confidentialité
privacy-camera = Caméra
privacy-microphone = Microphone
privacy-microphone-muted = Microphone coupé
privacy-mute-microphone = Couper le microphone
privacy-unmute-microphone = Réactiver le microphone
privacy-close-app = Fermer { $app }
privacy-unknown-app = Une application
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programme peut voir vos fenêtres
   *[other] { $count } programmes peuvent voir vos fenêtres
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programme peut voir et utiliser vos fenêtres
   *[other] { $count } programmes peuvent voir et utiliser vos fenêtres
}
privacy-windows-stop = Retirer l’accès

## Window access prompt

peek-see-request = Autoriser un programme que vous avez lancé à voir vos fenêtres ?
peek-see-description = Le programme pourra prendre des captures de toutes les fenêtres ouvertes.
peek-use-request = Autoriser un programme que vous avez lancé à voir et utiliser vos fenêtres ?
peek-use-description = Le programme pourra voir toutes les fenêtres ouvertes, et y cliquer et y taper du texte comme si c’était vous.
peek-deny = Ne pas autoriser
peek-allow-once = Autoriser une fois
peek-allow-until-quit = Autoriser jusqu’à sa fermeture

## Window access errors

peek-error-declined-until-quit = La personne qui utilise cet ordinateur a refusé. Le programme pourra refaire la demande après sa fermeture.
peek-error-not-allowed = La personne qui utilise cet ordinateur ne l’a pas autorisé
peek-error-sandboxed = Les applications isolées dans un bac à sable ne peuvent ni voir ni utiliser les autres fenêtres
peek-error-unknown-caller = Le programme demandeur s’est arrêté ou n’a pas pu être identifié
peek-error-no-caller = Le bus de session n’a pas indiqué quel programme fait la demande
peek-error-screen-busy = L’écran est verrouillé ou une demande du système y est ouverte. Réessayez une fois qu’elle a disparu.
peek-error-input-held = Quelqu’un maintient des touches ou des boutons de la souris enfoncés. Réessayez dans un instant.
peek-error-input-dropped = La saisie a été interrompue, car autre chose se trouvait sous le pointeur ou avait le clavier à son arrivée
peek-error-not-in-front = La fenêtre n’a pas pu être mise au premier plan
peek-error-covered = Quelque chose d’autre recouvre cette partie de la fenêtre
peek-error-outside = { $x }, { $y } se trouve en dehors de l’image de la fenêtre, qui mesure { $width } × { $height }
peek-error-nothing-to-capture = La fenêtre n’affiche rien à capturer
peek-error-window-picture-late = L’image de la fenêtre n’a pas été prête à temps
peek-error-screen-picture-late = L’image de l’écran n’a pas été prête à temps
peek-error-no-window-id = Aucune fenêtre n’a l’identifiant { $id }. peek list affiche celles qui sont ouvertes.
peek-error-no-window-for-handle = Le programme lancé sous { $handle } n’a aucune fenêtre ouverte
peek-error-ended-before-window = Le programme s’est arrêté avant d’ouvrir une fenêtre
peek-error-no-window-in-time = Aucune fenêtre ne s’est ouverte dans le délai de { $duration }
peek-error-launch-not-started-by-peek = Seul un programme démarré par peek run lui-même peut être lancé
peek-error-ended-while-starting = Le programme s’est arrêté pendant son démarrage
peek-error-launch-failed = systemd n’a pas pu démarrer { $program }
peek-error-unknown-handle = Rien de ce que vous avez lancé avec peek run ne porte l’identifiant { $handle }, ou le programme a été fermé
peek-error-unknown-key = { $key } n’est pas une touche connue de peek
peek-error-unknown-modifier = { $modifier } n’est pas une touche de modification. Utilisez ctrl, shift, alt ou super.
peek-error-display-owner = Cet affichage appartient à un autre programme
peek-error-display-run = Les programmes d’un affichage masqué sont lancés par peek run
peek-error-display-handle = Cet affichage a été lancé sous { $handle }, pas sous { $requested }

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
