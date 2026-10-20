## Shared by the dialogs apps open through the desktop portal

portal-cancel = Annuler
portal-allow = Autoriser
portal-share = Partager

portal-unknown-app-subject = L’application
portal-unknown-app-object = l’application

## Choosing an app to open a file or link

portal-app-chooser-open-title = Ouvrir « { $name } »
portal-app-chooser-open-description = Choisissez une application pour l’ouvrir.
portal-app-chooser-open-kind = Choisissez une application pour l’ouvrir ({ $kind }).
portal-app-chooser-title = Choisir une application
portal-app-chooser-description = Choisissez une application pour continuer.
portal-app-chooser-kind = Choisissez une application pour ce type de fichier ({ $kind }).
portal-app-chooser-nothing-installed = Aucune application installée ne peut ouvrir cet élément
portal-app-chooser-find = Trouver une application
portal-app-chooser-open = Ouvrir

## Adding a website or app to Start

portal-launcher-website-title = Ajouter ce site web à vos applications ?
portal-launcher-website-description = { $site } s’ouvrira dans sa propre fenêtre depuis Start.
portal-launcher-title = Ajouter cet élément à vos applications ?
portal-launcher-description = { $appName } veut ajouter une application à Start.
portal-launcher-name = Nom
portal-launcher-add = Ajouter

## Screenshots taken for apps

portal-screenshot-file-name = Capture d’écran { $date }

## Account details

portal-account-title = Partager votre nom et votre photo avec { $appName } ?
portal-account-description = { $appName } verra le nom et la photo de votre compte.

## Wallpaper

portal-wallpaper-title = Définir comme fond d’écran ?
portal-wallpaper-description = { $appName } veut changer votre fond d’écran. Il est utilisé en mode clair, en mode sombre et sur l’écran de verrouillage.
portal-wallpaper-set = Définir comme fond d’écran

## USB devices

usb-title = { $count ->
    [one] Autoriser { $appName } à utiliser cet appareil ?
   *[other] Autoriser { $appName } à utiliser ces appareils ?
}
usb-description = { $count ->
    [one] { $appName } pourra communiquer directement avec l’appareil tant qu’il est branché.
   *[other] { $appName } pourra communiquer directement avec les appareils tant qu’ils sont branchés.
}
usb-unknown-maker = Fabricant inconnu
usb-unknown-device = Appareil inconnu

## Screen sharing, remote control and input capture

screen-share-title = Partager votre écran avec { $appName } ?
screen-share-description = { $appName } pourra voir ce que vous choisissez.
screen-share-screens = Écrans
screen-share-windows = Fenêtres
screen-share-main-screen = Écran principal
screen-share-virtual-screen = Écran virtuel
screen-share-new-virtual-screen = Nouvel écran virtuel
screen-share-new-virtual-screen-description = Un écran supplémentaire réservé au partage
screen-share-nothing-to-share = Aucune fenêtre ouverte à partager.
screen-share-remember = Mémoriser mon choix
screen-share-remember-description = { $appName } n’aura plus à demander
screen-share-clipboard = Partager le presse-papiers
screen-share-clipboard-description = Copier et coller dans les deux sens

screen-share-remote-desktop-title = Autoriser { $appName } à contrôler votre ordinateur ?
screen-share-remote-desktop-with-screen = { $appName } pourra voir ce que vous choisissez et utiliser les appareils que vous autorisez.
screen-share-remote-desktop-description = { $appName } pourra utiliser les appareils que vous autorisez.
screen-share-devices = Appareils
screen-share-device-keyboard = Clavier
screen-share-device-pointer = Souris et pavé tactile
screen-share-device-touchscreen = Écran tactile

screen-share-input-capture-title = Autoriser { $appName } à prendre le contrôle de votre clavier et de votre souris ?
screen-share-input-capture-description = Lorsque votre pointeur atteint le bord de l’écran, { $appName } peut prendre le contrôle de votre clavier et de votre souris, par exemple pour piloter un autre ordinateur.

## Keyboard shortcuts apps register for the whole session

shortcuts-consent-title = Autoriser { $appName } à utiliser des raccourcis clavier ?
shortcuts-consent-description = Ces raccourcis parviennent à { $appName } même lorsque vous utilisez d’autres applications.
shortcuts-record-title = Raccourcis pour { $appName }
shortcuts-record-description = Choisissez un raccourci, puis appuyez sur les touches souhaitées. Retour arrière l’efface.
shortcuts-not-set = Non défini
shortcuts-press-keys = Appuyez sur des touches
shortcuts-unusable = { $shortcut } ne peut pas être utilisé
shortcuts-taken = { $shortcut } est déjà utilisé
shortcuts-save = Enregistrer

## Printing

print-title = Imprimer
print-title-from-app = Imprimer depuis { $appName }
print-accept = Imprimer
print-no-printers = Aucune imprimante n’est configurée.
print-job-name = Document
print-job-name-from-app = Document de { $appName }
print-failed-title = Impossible d’imprimer
print-failed = { $printer } n’a pas accepté le document.
print-failed-from-app = { $printer } n’a pas accepté le document de { $appName }.

print-printer = Imprimante
print-printer-not-accepting = N’accepte pas de documents pour le moment
print-printer-paused = En pause
print-back = Retour

print-copies = Copies
print-copies-fewer = Moins de copies
print-copies-more = Plus de copies

print-pages = Pages
print-pages-all = Toutes
print-pages-current = Page actuelle
print-pages-selection = Sélection
print-pages-range = Plage
print-pages-range-hint = Par exemple 1-3, 5

print-paper = Papier
print-paper-dimensions = { $width } × { $height }
print-paper-letter = Lettre US
print-paper-legal = Légal US
print-paper-executive = Exécutive
print-paper-tabloid = Tabloïd
print-paper-statement = Statement
print-paper-envelope = Enveloppe { $size }

print-orientation = Orientation
print-orientation-portrait = Portrait
print-orientation-landscape = Paysage

print-two-sided = Recto verso
print-two-sided-off = Désactivé
print-two-sided-long-edge = Bord long
print-two-sided-short-edge = Bord court

print-color = Couleur
print-color-mode-color = Couleur
print-color-mode-monochrome = Noir et blanc
