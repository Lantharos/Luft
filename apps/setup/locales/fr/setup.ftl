## Buttons used across steps

setup-continue = Continuer
setup-back = Retour
setup-cancel = Annuler
setup-not-now = Plus tard
setup-try-again = Réessayer
setup-restart = Redémarrer
setup-restart-now = Redémarrer maintenant
setup-restart-later = Redémarrer plus tard
setup-saving = Enregistrement…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installation de Luft
setup-installing-progress = Installation, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Rechercher
setup-picker-no-match = Aucun résultat

## Welcome step: language, keyboard and time zone

setup-region-title = Bienvenue dans Luft
setup-region-language = Langue
setup-region-keyboard = Clavier
setup-region-time-zone = Fuseau horaire
setup-region-intro = Commençons. Choisissez votre langue, votre clavier et votre fuseau horaire.
setup-region-intro-guessed-computer = Commençons. Ces choix ont été déduits de votre ordinateur, modifiez ce qui ne convient pas.
setup-region-intro-guessed = Commençons. Nous avons déduit { $guesses }, modifiez ce qui ne convient pas.
setup-region-guess-from-computer = { $fields } d’après votre ordinateur
setup-region-guess-from-network = { $fields } d’après votre réseau
setup-region-field-language = la langue
setup-region-field-keyboard = le clavier
setup-region-field-time-zone = le fuseau horaire

## Where Luft goes

setup-destination-choose-title = Où installer Luft ?
setup-destination-choose-description = Choisissez comment Luft s’intègre à cet ordinateur. Rien ne change avant votre confirmation.
setup-destination-alongside-title = Faire de la place à côté de Windows
setup-destination-alongside-description = Windows est réduit pour faire de la place à Luft. Vos fichiers dans Windows restent tels quels.
setup-destination-whole-title = Choisir un disque
setup-destination-whole-description = Luft occupe tout le disque. Tout ce qu’il contient est effacé.
setup-destination-custom-title = Choisir l’espace pour Luft
setup-destination-custom-description = Utilisez Disques pour organiser vos disques à votre façon.
setup-destination-replace-title = Remplacer { $system }
setup-destination-replace-description = Luft prend sa place et conserve ce qui vous appartient.
setup-destination-meet-title = À côté de Windows
setup-destination-meet-description = Meet Luft a déjà fait cette place, Windows reste donc exactement tel quel.
setup-destination-meet-drive-title = Sur { $drive }
setup-destination-meet-drive-description = Meet Luft a déjà fait cette place sur un autre disque, et Luft démarre depuis celui-ci avec ses propres fichiers de démarrage.
setup-destination-looking = Analyse de vos disques…

setup-destination-meet-choice = À côté de Windows
setup-destination-meet-choice-description = Utiliser les { $size } préparés par Meet Luft à côté de Windows.
setup-destination-meet-drive-choice = Sur { $drive }
setup-destination-meet-drive-choice-description = Utiliser les { $size } préparés par Meet Luft sur { $drive }.
setup-destination-alongside-choice = À côté de { $windows }
setup-destination-alongside-choice-description = Conserver Windows et ses fichiers, et donner à Luft une partie de son disque.
setup-destination-replace-choice = Remplacer { $system }
setup-destination-replace-choice-description = Conserver vos fichiers, votre compte et vos paramètres, et laisser Luft prendre sa place.
setup-destination-whole-choice = Utiliser un disque entier
setup-destination-whole-choice-description = Effacer un disque et le donner entièrement à Luft.
setup-destination-try-choice = Essayer Luft
setup-destination-try-choice-description = Découvrez d’abord le système. Rien n’est installé et vos disques ne sont pas modifiés.
setup-destination-custom-choice = Personnalisé
setup-destination-custom-choice-description = Organiser vous-même les partitions dans Disques.

setup-destination-more-options = Plus d’options
setup-destination-starting = Démarrage…
setup-destination-replace = Remplacer
setup-destination-install = Installer Luft

## Confirming where Luft goes

setup-confirm-replace-title = Remplacer { $system } ?
setup-confirm-erase-title = Effacer { $drive } ?
setup-confirm-shrink-title = Réduire Windows à { $size } ?
setup-confirm-meet-title = Installer Luft à côté de Windows ?
setup-confirm-meet-drive-title = Installer Luft sur { $drive } ?
setup-confirm-free-title = Installer Luft dans l’espace libre ?
setup-confirm-replace-keep-old = Luft commence la copie immédiatement. L’ancien système ne démarrera plus, et ses fichiers restent jusqu’à ce que vous les supprimiez.
setup-confirm-replace-erase-old = Luft commence la copie immédiatement. L’ancien système est effacé définitivement, et vos fichiers restent où ils sont.
setup-confirm-erase-description = Tout le contenu de ce disque est effacé définitivement, y compris les autres systèmes et fichiers.
setup-confirm-install-description = Luft commence la copie immédiatement. Vous pouvez configurer votre compte pendant ce temps.
setup-confirm-erase = Effacer et installer
setup-confirm-install = Installer

## Making room next to Windows

setup-alongside-hint = Faites glisser pour répartir { $drive } entre Windows et Luft. Windows conserve tous ses fichiers et un peu de place pour évoluer.
setup-windows-bitlocker = Windows garde ce disque verrouillé avec BitLocker, Luft ne peut donc pas y faire de place. Dans Windows, désactivez le chiffrement de l’appareil, ou réduisez le disque dans le Gestionnaire de disques et choisissez l’espace libre sous Personnalisé.
setup-windows-hibernated = Windows est en veille ou a été éteint avec le démarrage rapide, son disque ne peut donc pas être modifié sans risque. Démarrez Windows, maintenez Maj enfoncée en choisissant Arrêter, puis redémarrez Luft.
setup-windows-dirty = Le disque de Windows doit d’abord être vérifié rapidement. Démarrez Windows, redémarrez-le une fois, puis redémarrez Luft.
setup-windows-full = Windows a besoin de presque tout son disque. Libérez environ { $size } dans Windows, puis redémarrez Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Ce que vous avez préparé dans Windows ({ $size }) sera déballé dans votre nouveau compte.

## Windows options

setup-windows-fast-startup = Désactiver le démarrage rapide de Windows
setup-windows-fast-startup-description = Windows s’éteint alors complètement : le son, le Wi-Fi et le Bluetooth repartent de zéro dans Luft, et son disque reste accessible.
setup-windows-clock = Garder l’heure juste dans les deux systèmes
setup-windows-clock-description = Windows lit l’horloge de l’ordinateur comme Luft, l’heure ne saute donc plus quand vous changez de système.
setup-windows-bluetooth = Récupérer vos appareils Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } appareil associé dans Windows fonctionnera dans Luft sans nouvelle association.
   *[other] { $count } appareils associés dans Windows fonctionneront dans Luft sans nouvelle association.
}

## Choosing a drive

setup-drives-label = Disques
setup-drives-none = Aucun disque utilisable par Luft. Connectez-en un et relancez la recherche.
setup-drive-has-windows = Contient { $windows }
setup-drive-empty = Vide
setup-drive-partitions = { $count ->
    [one] { $count } partition
   *[other] { $count } partitions
}

## Custom space

setup-custom-open-disks = Ouvrir Disques
setup-custom-looking = Recherche…
setup-custom-look-again = Rechercher de nouveau
setup-custom-free-label = Espace libre
setup-custom-free-space = { $size } d’espace libre
setup-custom-on-drive = Sur { $drive }
setup-custom-none = Libérez au moins { $size } d’espace dans Disques, puis relancez la recherche. Luft s’installe dans l’espace que vous laissez libre.

## Replacing a Linux system

setup-replace-stays = Ce qui reste
setup-replace-changes = Ce qui change
setup-replace-keeps-account = Vos fichiers et votre compte { $account }
setup-replace-keeps-account-password = Vos fichiers et votre compte { $account }, avec son mot de passe
setup-replace-keeps-accounts = { $count ->
    [one] L’autre compte du système, avec ses fichiers
   *[other] Les { $count } autres comptes du système, avec leurs fichiers
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } connexion réseau, avec son mot de passe Wi-Fi
   *[other] { $count } connexions réseau, avec leurs mots de passe Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montés au démarrage comme avant
setup-replace-keeps-hostname = Le nom de l’ordinateur, { $hostname }, et ses clés SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } outil en ligne de commande que vous avez installé, dans une Toolbox après votre connexion
   *[other] { $count } outils en ligne de commande que vous avez installés, dans une Toolbox après votre connexion
}
setup-replace-keeps-old = { $system } ne démarre plus. Ses fichiers système sont conservés dans old-system jusqu’à ce que vous les supprimiez dans Disques ou dans les Paramètres.
setup-replace-erases-system = La partition système de { $system } est effacée. Vos fichiers se trouvent sur leur propre partition et restent tels quels.
setup-replace-clears-boot = Sa partition /boot est vidée pour accueillir les fichiers de démarrage de Luft.
setup-replace-apps = Les applications qui y sont installées ne sont pas reprises. Réinstallez-les depuis Schelf.

setup-replace-blocked-encrypted = Ce système est chiffré : le remplacer en conservant vos fichiers n’est pas encore possible.
setup-replace-blocked-single = Vos fichiers partagent une même partition avec le système : le remplacer en les conservant n’est pas encore possible.
setup-replace-blocked-layout = Son disque est organisé d’une manière que Luft ne peut pas encore remplacer.
setup-replace-blocked-startup = Sa partition système EFI est trop petite pour Luft, et aucune partition /boot ne peut la remplacer.
setup-replace-blocked-no-account = Il n’a aucun compte à reprendre.
setup-replace-blocked-running = Luft démarre actuellement depuis ce système. Démarrez Luft depuis une clé USB pour le remplacer.
setup-replace-blocked-read-only = Son disque est en lecture seule.

## Connecting to the internet

setup-network-title = Se connecter à Internet
setup-network-description = Cette étape est facultative. Une fois en ligne, Luft peut régler votre horloge et votre fuseau horaire, et vous pouvez utiliser Internet pendant l’installation.
setup-network-unavailable = Les réseaux ne sont pas disponibles pour le moment. Vous pourrez vous connecter plus tard depuis la barre des tâches.
setup-network-looking = Recherche de réseaux…
setup-network-cable = Connecté par câble
setup-network-show-all = Afficher tous les réseaux
setup-network-skip = Ignorer
setup-network-failed = Connexion impossible
setup-network-wrong-password = Mot de passe incorrect
setup-network-connected = Connecté
setup-network-connecting = Connexion…
setup-network-saved = Enregistré
setup-network-password = Mot de passe
setup-network-join = Rejoindre

## Account

setup-account-title = Qui utilise cet ordinateur ?
setup-account-description = C’est le compte avec lequel vous vous connectez. Vous pourrez ajouter d’autres personnes plus tard dans les Paramètres.
setup-account-full-name = Votre nom
setup-account-full-name-example = Marie Curie
setup-account-user-name = Nom d’utilisateur
setup-account-password = Mot de passe
setup-account-repeat = Saisissez-le de nouveau
setup-account-user-name-invalid = Utilisez des minuscules, des chiffres, - et _
setup-account-full-name-invalid = N’utilisez ni virgule ni deux-points
setup-account-mismatch = Les mots de passe ne correspondent pas

## Installing

setup-finishing-failed-title = Impossible d’installer Luft
setup-finishing-failed-description = Un problème est survenu pendant l’installation.
setup-finishing-failed-stick = Votre ordinateur démarre toujours comme avant. Vous pouvez continuer à utiliser Luft depuis la clé USB, ou redémarrer et réessayer.
setup-finishing-failed-trying = Votre ordinateur démarre toujours comme avant. Vous pouvez continuer à utiliser Luft tel quel, ou redémarrer et réessayer.
setup-finishing-use-stick = Utiliser Luft depuis la clé
setup-finishing-keep-trying = Continuer l’essai de Luft
setup-finishing-installed-title = Luft est installé
setup-finishing-trust-stick = Retirez la clé USB dès que l’écran devient noir. Un écran bleu vous demande ensuite de faire confiance à Luft. Utilisez le clavier sur cet écran.
setup-finishing-trust = Juste après le redémarrage, un écran bleu vous demande de faire confiance à Luft. Utilisez le clavier sur cet écran.
setup-finishing-restart-stick = Redémarrez pour commencer à l’utiliser. Retirez la clé USB dès que l’écran devient noir.
setup-finishing-restart = Redémarrez pour commencer à l’utiliser.
setup-finishing-title = Presque terminé
setup-finishing-description = Luft est en cours de copie sur votre ordinateur. Cela prend quelques minutes.
setup-finishing-plug-in = Laissez votre ordinateur branché jusqu’à la fin.
setup-stage-idle = Préparation
setup-stage-preparing = Libération de l’espace pour Luft
setup-stage-copying = Copie de Luft
setup-stage-waiting = Finalisation
setup-stage-configuring = Configuration de votre compte
setup-stage-finished = Terminé

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Appuyez sur une touche dans les 10 secondes
setup-enroll-choose-enroll = Choisissez Enroll MOK, puis Continue
setup-enroll-choose-yes = Choisissez Yes
setup-enroll-type-code = Saisissez le code, puis choisissez Reboot
setup-enroll-digits = { $count ->
    [one] { $count } chiffre
   *[other] { $count } chiffres
}
setup-secure-boot-title = Votre ordinateur ne fait pas encore confiance à Luft
setup-secure-boot-code = Juste après le prochain redémarrage, un écran bleu vous demande de faire confiance à Luft. Utilisez le clavier sur cet écran avec ce code.
setup-secure-boot-skipped = L’écran bleu a été ignoré. Obtenez un nouveau code et redémarrez, puis utilisez le clavier sur cet écran.
setup-secure-boot-getting = Obtention de votre code…
setup-secure-boot-new-code = Obtenir un nouveau code

## Encryption

setup-protect-title = Protéger vos fichiers
setup-protect-tpm = Chiffrez cet ordinateur pour que personne ne puisse lire vos fichiers sans se connecter, même en cas de perte. Il se déverrouille tout seul au démarrage.
setup-protect-passphrase = Chiffrez cet ordinateur pour que personne ne puisse lire vos fichiers sans votre phrase secrète, même en cas de perte.
setup-protect-staged-title = Vos fichiers seront chiffrés
setup-protect-staged-description = Le chiffrement démarre tout seul après le redémarrage qui termine la configuration, et vous pouvez continuer à utiliser votre ordinateur pendant ce temps.
setup-protect-waiting-description = Luft change encore de taille. Une fois terminé, le chiffrement commencera au prochain redémarrage, et vous pouvez continuer à utiliser votre ordinateur en attendant.
setup-protect-keep-safe = Conservez cette clé de récupération en lieu sûr, loin de cet ordinateur. Vous en aurez besoin si l’ordinateur ne parvient plus à se déverrouiller tout seul.
setup-protect-passphrase-label = Phrase secrète
setup-protect-repeat = Saisissez-la de nouveau
setup-protect-mismatch = Les saisies ne correspondent pas
setup-protect-kept = J’ai conservé ma clé de récupération
setup-protect-background = Le chiffrement se fait en arrière-plan après le prochain redémarrage, et vous pouvez continuer à utiliser votre ordinateur pendant ce temps.
setup-protect-encrypt = Chiffrer
setup-protect-checking = Vérification…
setup-protect-start = Chiffrer mes fichiers

## Fingerprint

setup-fingerprint-title = Se connecter avec le doigt
setup-fingerprint-description = Déverrouillez Luft d’un simple contact au lieu de saisir votre mot de passe. Vous pourrez ajouter d’autres doigts plus tard dans les Paramètres.
setup-fingerprint-which = Quel doigt ?
setup-fingerprint-another = Ajouter un autre doigt ?
setup-fingerprint-finger = Doigt
setup-fingerprint-no-reader = Le lecteur d’empreintes ne répond pas. Vous pourrez ajouter une empreinte plus tard dans les Paramètres.
setup-fingerprint-add = Ajouter une empreinte
setup-fingerprint-choose-another = Choisir un autre doigt

## Done

setup-ready-title = Tout est prêt
setup-ready-trust = Redémarrez une dernière fois pour terminer. Juste après le redémarrage, un écran bleu vous demande de faire confiance à Luft. Utilisez le clavier sur cet écran avec ce code.
setup-ready-restart = Redémarrez une dernière fois pour terminer, puis connectez-vous avec votre mot de passe.
setup-ready-done = Votre bureau est prêt. Bonne découverte de Luft.
setup-ready-start = Commencer à utiliser Luft
