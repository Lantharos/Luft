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
