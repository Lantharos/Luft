## Displays

settings-display-mirror = Dupliquer les écrans
settings-display-mirror-description = Affiche la même image sur tous les écrans
settings-display-mirrored = Écrans dupliqués
settings-display-display = Écran
settings-display-apply-failed = Ces paramètres n’ont pas fonctionné. Essayez une autre configuration.
settings-display-reset = Réinitialiser
settings-display-apply = Appliquer
settings-display-arrangement-main = { $name }, écran principal
settings-display-use = Utiliser cet écran
settings-display-main = Écran principal
settings-display-main-description = La barre des tâches et les nouvelles fenêtres s’affichent ici
settings-display-resolution-title = Résolution
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Fréquence d’actualisation
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Fréquence d’actualisation variable
settings-display-variable-refresh-description = Permet à l’écran de suivre la fréquence d’images des jeux en plein écran, pour des mouvements plus fluides
settings-display-variable-refresh-off = Désactivée
settings-display-variable-refresh-games = Dans les jeux
settings-display-variable-refresh-fullscreen = Dans toutes les applications en plein écran
settings-display-scale = Échelle
settings-display-scale-description = Agrandit ou réduit le texte, les applications et tout le reste
settings-display-orientation = Orientation
settings-display-orientation-landscape = Paysage
settings-display-orientation-portrait-right = Portrait droit
settings-display-orientation-portrait-left = Portrait gauche
settings-display-orientation-landscape-flipped = Paysage retourné

## Display brightness

settings-display-brightness = Luminosité
settings-display-brightness-label = Luminosité de l’écran { $name }
settings-display-brightness-unsupported = Activez DDC/CI dans le menu de l’écran pour la régler ici
settings-display-brightness-unresponsive = Ne répond pas pour le moment, nouvel essai sous peu
settings-display-brightness-external = Écrans externes
settings-display-brightness-missing-tool = Installez ddcutil pour régler leur luminosité ici
settings-display-brightness-needs-restart = Redémarrez pour terminer la configuration de leur luminosité
settings-display-brightness-no-access = Déconnectez-vous puis reconnectez-vous pour régler leur luminosité ici

## Night light

settings-display-night-light = Éclairage nocturne
settings-display-night-light-description = Des couleurs plus chaudes le soir, plus reposantes pour les yeux
settings-display-night-light-schedule = Programmation
settings-display-night-light-automatic = Du coucher au lever du soleil
settings-display-night-light-custom = Personnalisée
settings-display-night-light-from = Activation
settings-display-night-light-to = Désactivation
settings-display-night-light-warmth = Chaleur

## Sound

settings-sound-output = Sortie
settings-sound-input = Entrée
settings-sound-device = Appareil
settings-sound-output-device = Appareil de sortie
settings-sound-input-device = Appareil d’entrée
settings-sound-connection = Connexion
settings-sound-output-connection = Connexion de sortie
settings-sound-input-connection = Connexion d’entrée
settings-sound-volume = Volume
settings-sound-mute = Couper le son ({ $name })
settings-sound-unmute = Rétablir le son ({ $name })
settings-sound-balance = Balance
settings-sound-balance-center = Centre
settings-sound-balance-left = { $share } à gauche
settings-sound-balance-right = { $share } à droite
settings-sound-louder = Autoriser plus de 100 %
settings-sound-louder-description = Le son peut saturer à volume élevé
settings-sound-input-level = Niveau d’entrée
settings-sound-apps = Volume des applications
settings-sound-apps-playing = { $count ->
    [one] { $count } application émet du son
   *[other] { $count } applications émettent du son
}
settings-sound-app-output = Sortie audio pour { $app }
settings-sound-profiles = Profils des appareils
settings-sound-profiles-row-description = Choisir l’utilisation de chaque appareil audio
settings-sound-profiles-description = Utilisation de chaque appareil audio, par exemple en stéréo ou en son surround
settings-sound-profile-label = Profil pour { $device }
settings-sound-profile-off = Désactivé

## System sounds

settings-sound-system = Sons système
settings-sound-system-description = Sons des notifications, des appareils et d’autres événements
settings-sound-system-volume = Volume des sons système
settings-sound-kind-notifications = Notifications
    .description = Coupés en mode Ne pas déranger, pendant les jeux et le partage d’écran
    .preview = Écouter le son des notifications
settings-sound-kind-devices = Appareils et charge
    .description = Connexion d’un appareil ou d’un chargeur, et batterie faible
    .preview = Écouter le son des appareils
settings-sound-kind-volume = Retour sonore du volume
    .description = Un petit clic quand vous modifiez le volume
    .preview = Écouter le clic du volume
settings-sound-kind-screenshots = Captures d’écran
    .description = Un bruit d’obturateur quand une capture d’écran est enregistrée
    .preview = Écouter l’obturateur
settings-sound-kind-recording = Enregistrement
    .description = Au début et à la fin de l’enregistrement de l’écran, de la caméra ou de la dictée
    .preview = Écouter le son d’enregistrement
settings-sound-kind-sign-in = Son de connexion
    .description = Quand votre bureau apparaît
    .preview = Écouter le son de connexion
settings-sound-kind-keyboard = Frappes au clavier
    .description = Chaque touche du clavier visuel
    .preview = Écouter une frappe

## Power and battery

settings-power-battery = Batterie
settings-power-charging = En charge
settings-power-charging-at = En charge à { $power }
settings-power-charging-until-full = En charge, pleine dans { $time }
settings-power-charging-at-until-full = En charge à { $power }, pleine dans { $time }
settings-power-on-battery = Sur batterie
settings-power-on-battery-using = Sur batterie, consommation de { $power }
settings-power-time-left = Environ { $time } d’autonomie
settings-power-time-left-using = Environ { $time } d’autonomie, consommation de { $power }
settings-power-full = Chargée
settings-power-empty = Vide
settings-power-not-charging = Branchée, pas en charge
settings-power-health = État de la batterie
settings-power-capacity = { $full } sur { $design } à l’état neuf
settings-power-cycles = { $count ->
    [one] { $cycles } cycle de charge
   *[other] { $cycles } cycles de charge
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Afficher le pourcentage
settings-power-show-percentage-description = Affiche le niveau de charge dans l’icône de la batterie

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = moins d’une minute
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } heure
   *[other] { $hours } heures
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } heure
   *[other] { $hours } heures
} { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
}
settings-power-never = Jamais

## Charge limit

settings-power-limit = Limiter la charge
settings-power-limit-failed = Impossible de modifier la limite. Réessayez.
settings-power-limit-elsewhere-off = Une autre application l’a désactivée, la batterie se charge donc complètement
settings-power-limit-elsewhere-changed = Une autre application a fixé la limite à { $level }
settings-power-limit-elsewhere-on = Une autre application arrête la charge à { $level }
settings-power-limit-automatic = Votre ordinateur décide quand arrêter la charge
settings-power-limit-stops-at = La charge s’arrête à { $level }
settings-power-limit-description = Arrête la charge plus tôt pour prolonger la durée de vie de la batterie
settings-power-limit-description-at = S’arrête à { $level } pour prolonger la durée de vie de la batterie
settings-power-limit-applied = La charge s’arrête à { $level }
settings-power-limit-applied-description = Définie par une autre application sur cet ordinateur

## Battery-powered devices

settings-power-devices = Appareils
settings-power-device-mouse = Souris
settings-power-device-keyboard = Clavier
settings-power-device-headphones = Casque
settings-power-device-speaker = Haut-parleur
settings-power-device-controller = Manette
settings-power-device-phone = Téléphone
settings-power-device-tablet = Tablette
settings-power-device-pen = Stylet
settings-power-device-touchpad = Pavé tactile
settings-power-device-other = Appareil

## Power mode

settings-power-mode = Mode d’alimentation
settings-power-mode-row = Mode
settings-power-profile-saver = Économie d’énergie
    .description = Plus lent, consomme moins d’énergie
settings-power-profile-balanced = Équilibré
    .description = Performances et consommation standard
settings-power-profile-performance = Performances
    .description = Plus rapide, consomme plus d’énergie
settings-power-limited = Les performances sont limitées pour le moment
settings-power-limited-lap = Les performances sont limitées, car l’ordinateur est sur vos genoux
settings-power-limited-hot = Les performances sont limitées, car l’ordinateur est trop chaud
settings-power-limited-lap-hot = Les performances sont limitées, car l’ordinateur est sur vos genoux et trop chaud
settings-power-saver-low-battery = Économie d’énergie si la batterie est faible
settings-power-saver-low-battery-description = Passe en économie d’énergie quand la batterie devient faible
settings-power-saver-level = Niveau de batterie pour l’économie d’énergie

## Keyboard backlight

settings-power-keyboard = Clavier
settings-power-backlight = Rétroéclairage du clavier
settings-power-backlight-off = Désactivé
settings-power-backlight-low = Faible
settings-power-backlight-medium = Moyen
settings-power-backlight-high = Élevé

## Screen and sleep

settings-power-screen = Écran
settings-power-screen-off = Éteindre l’écran après
settings-power-screen-off-description = Quand vous n’avez pas utilisé l’ordinateur depuis un moment
settings-power-dim = Assombrir en cas d’inactivité
settings-power-dim-description = Réduit la luminosité peu avant l’extinction de l’écran
settings-power-sleep = Veille
settings-power-suspend-plugged-in = Mettre en veille sur secteur
settings-power-suspend-inactive = Mettre en veille en cas d’inactivité
settings-power-suspend-description = Met l’ordinateur en veille après un moment sans utilisation
settings-power-suspend-battery = Mettre en veille sur batterie
settings-power-button = Bouton d’alimentation
settings-power-button-suspend = Mettre en veille
settings-power-button-hibernate = Mettre en veille prolongée
settings-power-button-ask = Demander quoi faire
settings-power-button-nothing = Ne rien faire
settings-power-long-sleep = Éteindre après une longue veille
settings-power-long-sleep-description = Plutôt que de laisser la batterie se vider pendant la veille, l’ordinateur s’éteint quand la batterie devient faible ou après une longue veille sur batterie. Les fenêtres ouvertes ne sont pas conservées.
settings-power-long-sleep-failed = Impossible de modifier ce paramètre. Réessayez.
settings-power-long-sleep-after = Éteindre après
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } heure
   *[other] { $hours } heures
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } jour
   *[other] { $days } jours
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } semaine
   *[other] { $weeks } semaines
}

## Keyboard

settings-keyboard-sources = Sources de saisie
settings-keyboard-sources-description = La première est utilisée par défaut. Passez de l’une à l’autre pendant la saisie.
settings-keyboard-source-edit = Modifier dans Keys
settings-keyboard-source-up = Monter
settings-keyboard-source-down = Descendre
settings-keyboard-source-remove = Retirer
settings-keyboard-add-source-button = Ajouter une source de saisie
settings-keyboard-own = Vos propres dispositions et méthodes de saisie
settings-keyboard-own-layout = Créer une disposition
settings-keyboard-own-layout-description = Partir d’une disposition et changer ce que saisissent ses touches
settings-keyboard-own-method = Créer une méthode de saisie
settings-keyboard-own-method-description = Transformer ce que vous tapez en accents, en autres écritures ou en mots à choisir
settings-keyboard-own-open = Ouvrir Keys
settings-keyboard-own-open-description = Modifier les dispositions et méthodes de saisie que vous avez créées
settings-keyboard-switch-source = Changer de source de saisie
settings-keyboard-add-source = Ajouter une source de saisie
settings-keyboard-add-source-description = Choisissez la disposition du clavier ou la méthode de saisie à utiliser.
settings-keyboard-add-source-search = Rechercher des langues, dispositions et méthodes de saisie
settings-keyboard-input-method = Méthode de saisie
settings-keyboard-add-source-no-match = Aucun résultat pour « { $query } »
settings-keyboard-cancel = Annuler
settings-keyboard-add = Ajouter
settings-keyboard-typing = Saisie
settings-keyboard-repeat = Répétition des touches
settings-keyboard-repeat-description = Maintenir une touche enfoncée la répète
settings-keyboard-repeat-delay = Délai avant répétition
settings-keyboard-repeat-delay-shorter = Plus court
settings-keyboard-repeat-delay-longer = Plus long
settings-keyboard-repeat-speed = Vitesse de répétition
settings-keyboard-repeat-speed-slower = Plus lente
settings-keyboard-repeat-speed-faster = Plus rapide
settings-keyboard-caps-lock = Touche Verr. Maj
settings-keyboard-caps-lock-description = Ce qui se passe quand vous appuyez dessus
settings-keyboard-caps-lock-escape = Échap
settings-keyboard-caps-lock-swap-escape = Inverser avec Échap
settings-keyboard-caps-lock-nothing = Rien
settings-keyboard-caps-lock-custom = Personnalisé
settings-keyboard-lock-notices = Afficher Verr. Maj et Verr. Num
settings-keyboard-lock-notices-description = S’affiche brièvement à l’écran quand l’une de ces touches est activée ou désactivée
settings-keyboard-dictation-on = Activée
settings-keyboard-dictation-off = Désactivée
settings-keyboard-shortcuts-description = Consultez et modifiez les raccourcis, ou ajoutez les vôtres

## Copilot key

settings-keyboard-copilot = Touche Copilot
settings-keyboard-copilot-press = Appui
settings-keyboard-copilot-press-description = Ce que fait un appui bref sur la touche
settings-keyboard-copilot-open-start = Ouvrir Start
settings-keyboard-copilot-open-app = Ouvrir une application
settings-keyboard-copilot-nothing = Rien
settings-keyboard-copilot-app = Application
settings-keyboard-copilot-no-app = Aucune application choisie
settings-keyboard-copilot-change = Changer
settings-keyboard-copilot-choose = Choisir
settings-keyboard-copilot-hold = Maintenir pour dicter
settings-keyboard-copilot-hold-description = Maintenez la touche et parlez pour saisir ce que vous dites
settings-keyboard-copilot-hold-off = Fonctionne une fois la dictée activée
settings-keyboard-copilot-choose-app = Choisir une application
settings-keyboard-copilot-choose-app-description = Un appui sur la touche Copilot l’ouvre.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Maj
settings-keys-meta = Méta
settings-keys-hyper = Hyper
settings-keys-print-screen = Impr écran
settings-keys-page-up = Pg préc
settings-keys-page-down = Pg suiv
settings-keys-home = Origine
settings-keys-end = Fin
settings-keys-insert = Inser
settings-keys-delete = Suppr
settings-keys-tab = Tab
settings-keys-space = Espace
settings-keys-enter = Entrée
settings-keys-backspace = Retour arrière
settings-keys-escape = Échap
settings-keys-pause = Pause
settings-keys-scroll-lock = Arrêt défil
settings-keys-caps-lock = Verr. Maj
settings-keys-menu = Menu
settings-keys-keypad = { $key } (pavé num.)
settings-keys-volume-up = Volume +
settings-keys-volume-down = Volume −
settings-keys-mute = Muet
settings-keys-microphone-mute = Micro muet
settings-keys-play = Lecture
settings-keys-media-pause = Pause
settings-keys-stop = Arrêt
settings-keys-next-track = Piste suivante
settings-keys-previous-track = Piste précédente
settings-keys-brightness-up = Luminosité +
settings-keys-brightness-down = Luminosité −
settings-keys-browser = Navigateur
settings-keys-home-page = Page d’accueil
settings-keys-search = Recherche
settings-keys-mail = Courrier
settings-keys-calculator = Calculatrice
settings-keys-files = Fichiers
settings-keys-eject = Éjecter
settings-keys-power = Alimentation
settings-keys-lock = Verrouiller

## Keyboard shortcuts

settings-shortcuts-title = Raccourcis clavier
settings-shortcuts-search = Rechercher des raccourcis
settings-shortcuts-category-system = Système
settings-shortcuts-category-windows = Fenêtres
settings-shortcuts-category-tiling = Pavage
settings-shortcuts-category-workspaces = Espaces de travail
settings-shortcuts-category-screenshots = Captures d’écran
settings-shortcuts-category-media = Multimédia
settings-shortcuts-reset = Rétablir par défaut
settings-shortcuts-apps = Raccourcis des applications
settings-shortcuts-apps-description = Demandés par les applications, ils fonctionnent même quand l’application n’est pas au premier plan
settings-shortcuts-no-match = Aucun raccourci ne correspond à « { $query } »
settings-shortcuts-change = Modifier le raccourci « { $name } »
settings-shortcuts-or = ou
settings-shortcuts-not-set = Non défini
settings-shortcuts-press-keys = Appuyez sur les touches souhaitées
settings-shortcuts-needs-modifier = Ajoutez Ctrl, Alt ou Super pour que le raccourci ne gêne pas la saisie.
settings-shortcuts-record-description = Appuyez sur le nouveau raccourci. Retour arrière le désactive, Échap annule.
settings-shortcuts-record-taken = Ce raccourci est déjà utilisé pour « { $name } ». Le remplacer le retire de cette action.
settings-shortcuts-try-another = Essayer un autre
settings-shortcuts-replace = Remplacer
settings-shortcuts-cancel = Annuler
settings-shortcuts-custom = Raccourcis personnalisés
settings-shortcuts-custom-description = Exécuter une commande ou ouvrir une application avec une combinaison de touches
settings-shortcuts-untitled = Sans titre
settings-shortcuts-add = Ajouter un raccourci
settings-shortcuts-edit = Modifier le raccourci
settings-shortcuts-custom-name = Nom
settings-shortcuts-custom-command = Commande
settings-shortcuts-custom-shortcut = Raccourci
settings-shortcuts-custom-taken = Déjà utilisé pour « { $name } ». L’enregistrer le retire de cette action.
settings-shortcuts-remove = Supprimer
settings-shortcuts-save = Enregistrer
settings-shortcuts-add-button = Ajouter

## Dictation

settings-dictation-title = Dictée
settings-dictation-description = Maintenez { $keys } et parlez pour saisir ce que vous dites, dans n’importe quelle application. Relâchez pour terminer, ou appuyez sur Échap pour annuler. Tout se passe sur cet ordinateur : votre voix n’en sort jamais et n’est pas enregistrée.
settings-dictation-description-no-shortcut = Choisissez un raccourci ci-dessous pour dicter. Tout se passe sur cet ordinateur : votre voix n’en sort jamais et n’est pas enregistrée.
settings-dictation-not-installed = La dictée n’est pas installée sur cet ordinateur
settings-dictation-hold = Maintenez { $keys } pour dicter
settings-dictation-needs-shortcut = Désactivée tant qu’aucun raccourci n’est défini
settings-dictation-copilot-key = la touche Copilot
settings-dictation-shortcut = Raccourci
settings-dictation-shortcut-description = Maintenez-le pour parler, ou appuyez dessus pour que l’écoute continue jusqu’au prochain appui ou jusqu’à ce que vous cessiez de parler
settings-dictation-shortcut-own = Mon propre raccourci
settings-dictation-shortcut-another = Autre raccourci…
settings-dictation-shortcut-off = Désactivé
settings-dictation-keys = Touches
settings-dictation-change = Changer
settings-dictation-language = Langue
settings-dictation-language-automatic = Automatique
settings-dictation-language-automatic-current = Automatique ({ $language })
settings-dictation-language-description = En automatique, la langue suit la disposition du clavier utilisée
settings-dictation-language-unavailable = Langue non disponible sur cet ordinateur : { $language }
settings-dictation-engine = Reconnaissance vocale
settings-dictation-engine-automatic = Automatique
settings-dictation-engine-description = Reconnaissance par { $engine } : { $language }
settings-dictation-engine-graphics-card = Reconnaissance par { $engine } sur la carte graphique : { $language }
settings-dictation-models = Modèles vocaux
settings-dictation-models-description = Les modèles sont téléchargés une seule fois et conservés sur cet ordinateur.
settings-dictation-credits = Crédits
settings-dictation-credit = { $credit }. Sous licence { $licence }.
settings-dictation-learn-more = En savoir plus

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Téléchargement impossible : { $reason }
settings-dictation-model-downloading = { $received } sur { $total }
settings-dictation-model-installed = { $size } sur cet ordinateur
settings-dictation-model-partial = { $received } sur { $total } téléchargés
settings-dictation-model-size = { $size } à télécharger
settings-dictation-model-retry = Réessayer
settings-dictation-model-cancel = Annuler
settings-dictation-model-resume = Reprendre
settings-dictation-model-download = Télécharger
settings-dictation-model-remove = Supprimer

## Mouse and touchpad

settings-mouse-mouse = Souris
settings-mouse-primary-button = Bouton principal
settings-mouse-primary-button-description = Le bouton sur lequel vous cliquez pour sélectionner
settings-mouse-primary-button-left = Gauche
settings-mouse-primary-button-right = Droit
settings-mouse-speed = Vitesse du pointeur
settings-mouse-slower = Plus lente
settings-mouse-faster = Plus rapide
settings-mouse-acceleration = Accélération de la souris
settings-mouse-acceleration-description = Le pointeur va plus loin quand vous déplacez la souris rapidement
settings-mouse-natural-scrolling = Défilement naturel
settings-mouse-natural-scrolling-description = Le défilement déplace le contenu plutôt que la vue
settings-mouse-touchpad = Pavé tactile
settings-mouse-touchpad-speed = Vitesse du pointeur du pavé tactile
settings-mouse-touchpad-scroll-speed = Vitesse de défilement
settings-mouse-touchpad-scroll-speed-label = Vitesse de défilement du pavé tactile
settings-mouse-touchpad-tap = Toucher pour cliquer
settings-mouse-touchpad-tap-description = Touchez le pavé tactile au lieu de l’enfoncer
settings-mouse-touchpad-natural-scrolling = Défilement naturel du pavé tactile
settings-mouse-touchpad-natural-scrolling-description = Le contenu se déplace dans le même sens que vos doigts
settings-mouse-touchpad-scroll-with = Défiler avec
settings-mouse-touchpad-two-fingers = Deux doigts
settings-mouse-touchpad-scroll-edge = Bord
settings-mouse-touchpad-secondary-click = Clic secondaire
settings-mouse-touchpad-secondary-click-description = Comment faire un clic droit sans bouton séparé
settings-mouse-touchpad-click-corner = Coin
settings-mouse-touchpad-disable-typing = Désactiver pendant la saisie
settings-mouse-touchpad-disable-typing-description = Pour que le pointeur ne saute pas pendant que vous tapez
