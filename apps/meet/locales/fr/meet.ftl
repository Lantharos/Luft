## Messages that some steps share

meet-back = Retour
meet-cancel = Annuler
meet-continue = Continuer
meet-try-again = Réessayer
meet-restart = Redémarrer
meet-remove = Supprimer
meet-keep-it = Le garder
meet-close = Fermer
meet-restart-title = Redémarrer maintenant ?
meet-not-yet = Pas encore
meet-iso-use = Utiliser une ISO que j’ai déjà
meet-iso-using = Utilisation de votre ISO de Luft
meet-nightly = Versions nightly
meet-channel-nightly = Meet Luft utilisera les versions nightly
meet-channel-latest = Meet Luft utilisera de nouveau les versions publiées
meet-undo = Annuler
meet-logs-saved = Les journaux de l’essai de Luft ont été enregistrés sur votre bureau
meet-logs-show = Afficher
meet-logs-none = Aucun journal de l’essai de Luft pour le moment
meet-logs-failed = Meet Luft n’a pas pu enregistrer les journaux de l’essai de Luft

## What went wrong

problem-check = { $platform ->
    [linux] Meet Luft n’a pas pu terminer l’analyse de cet ordinateur.
   *[windows] Meet Luft n’a pas pu terminer l’analyse de ce PC.
}
problem-room = La préparation de l’espace pour Luft n’a pas abouti.
problem-room-linux = La préparation de Luft n’a pas abouti.
problem-update = La mise à jour de Luft n’a pas abouti.
problem-download = Le téléchargement de Luft s’est interrompu. Vérifiez que vous êtes en ligne.
problem-pack = L’emballage de vos affaires n’a pas abouti.
problem-remove = La suppression de Luft n’a pas abouti.
problem-restart = Meet Luft n’a pas pu préparer le redémarrage.
problem-tidy = Les anciennes entrées de démarrage n’ont pas pu être supprimées.
problem-firmware = Meet Luft n’a pas pu ouvrir les paramètres du micrologiciel.
problem-folders = Meet Luft n’a pas pu parcourir vos dossiers.
problem-sticks = Meet Luft n’a pas pu rechercher les clés USB.
problem-stick = La création de la clé n’a pas abouti.
problem-offer = Luft ne peut pas être téléchargé pour le moment. Vérifiez que vous êtes en ligne, ou utilisez une ISO que vous avez déjà.
problem-luft = Meet Luft n’a pas pu analyser le disque de Luft.
problem-resize = La modification de la taille de Luft n’a pas abouti.
problem-cancel = Meet Luft n’a pas pu annuler la modification.
problem-give = Windows n’a pas pu récupérer l’espace.
problem-declined = { $platform ->
    [linux] Meet Luft a besoin de votre autorisation pour modifier le disque. Saisissez votre mot de passe quand il vous est demandé.
   *[windows] Meet Luft a besoin de votre autorisation pour modifier le disque. Choisissez Oui quand Windows le demande.
}

## First screen

hello-intro = { $platform ->
    [linux] Essayez Luft directement d’ici, sans clé USB. S’il vous plaît, Luft peut prendre la place de ce système et conserver vos fichiers.
   *[windows] Luft peut s’installer juste à côté de Windows. Essayez-le d’abord sans rien installer, puis emportez vos affaires quand vous le souhaitez.
}
hello-check = { $platform ->
    [linux] Vérifier cet ordinateur
   *[windows] Vérifier ce PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Analyse de cet ordinateur
   *[windows] Analyse de ce PC
}
check-ready-title = { $platform ->
    [linux] Cet ordinateur est prêt pour Luft
   *[windows] Ce PC est prêt pour Luft
}
check-blocked-title = Vous y êtes presque
check-moment = Cela prend un instant.
check-slow = Windows calcule l’espace qu’il peut libérer. Sur un grand disque, cela peut prendre quelques minutes.
check-blocked-description = Il reste quelque chose à changer avant que Luft puisse s’installer. Voici comment faire.
check-found-description = Voici ce que Meet Luft a trouvé.
check-checking = Vérification du disque, du micrologiciel et du matériel…
check-again = Vérifier de nouveau
check-action-firmware = Ouvrir les paramètres du micrologiciel
check-action-tidy = Faire le ménage
check-firmware-title = Redémarrer dans les paramètres du micrologiciel ?
check-firmware-description = Enregistrez d’abord votre travail en cours. Activez-y Secure Boot et enregistrez, puis votre ordinateur redémarre normalement.
check-tidy-title = Supprimer les anciennes entrées de démarrage ?
check-tidy-description = Elles pointent seulement vers des systèmes qui n’existent plus. Windows et tout le reste démarrent exactement comme avant.
check-get-ready-title = Préparer Luft ?
check-get-ready-file = Meet Luft copie Luft depuis votre ISO dans un dossier de cet ordinateur et lui ajoute une entrée de démarrage. Aucune partition n’est modifiée.
check-get-ready-download = Meet Luft télécharge Luft, environ { $size }, dans un dossier de cet ordinateur et lui ajoute une entrée de démarrage. Aucune partition n’est modifiée.
check-get-ready-confirm = Préparer

## Choosing how much of the Windows drive Luft gets

room-title = Combien d’espace pour Luft ?
room-description = Windows se réduit pour faire de la place à Luft. Vos fichiers dans Windows restent exactement où ils sont.
room-live = Windows garde de la place pour évoluer. Luft réserve aussi { $size } pour démarrer, qu’il rend une fois installé.
room-make = Faire de la place
room-confirm-title = Donner { $size } à Luft ?
room-confirm-file = Windows réduit son disque, puis Meet Luft copie Luft depuis votre ISO. Laissez le PC branché.
room-confirm-download = Windows réduit son disque, puis Meet Luft télécharge Luft, environ { $size }. Laissez le PC branché et en ligne.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Où installer Luft ?
room-places-description = Luft peut partager le disque de Windows, ou prendre de l’espace que Windows n’utilise pas.
room-places-label = Emplacements pour Luft
room-place-windows = À côté de Windows
room-place-windows-detail = Windows se réduit pour faire de la place à Luft
room-place-windows-free = Espace déjà libre : { $size }
room-place-free = Espace libre sur { $drive }
room-place-free-here = Espace libre sur le disque de Windows
room-place-free-detail = { $size } que rien d’autre n’utilise
room-place-whole = Tout le disque { $drive }
room-place-whole-detail = Efface ce disque de { $size } pour Luft
room-live-free = Une partie de cet espace ({ $free }) est déjà libre : Windows en cède donc moins et garde de la place pour évoluer. Luft réserve aussi { $size } pour démarrer, qu’il rend une fois installé.
room-live-elsewhere = Luft y obtient { $room } et réserve { $size } de plus pour démarrer, qu’il rend une fois installé.
room-confirm-free-title = Donner { $size } d’espace libre à Luft ?
room-confirm-free-file = Meet Luft y copie Luft depuis votre ISO. Rien d’autre ne change sur le disque.
room-confirm-free-download = Meet Luft y télécharge Luft, environ { $size }. Rien d’autre ne change sur le disque. Laissez le PC en ligne.
room-erase-title = Effacer { $drive } ?
room-erase-description = Tout le contenu de ce disque de { $size } est supprimé immédiatement, avant le démarrage de Luft. Cette action est irréversible. Il contient actuellement :
room-erase-empty = Windows ne peut rien lire sur ce disque de { $size }, mais tout ce qu’il contient est supprimé immédiatement. Cette action est irréversible.
room-erase-unnamed = Partition sans nom
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Chiffrée avec BitLocker
room-erase-understood = Je sais qu’une partie est chiffrée avec BitLocker et ne pourra pas être récupérée
room-erase-confirm = Effacer et faire de la place

## Luft is ready on Windows

ready-title = Luft est prêt
ready-description = Choisissez comment le découvrir. Windows démarre ensuite normalement, sauf si vous installez Luft et le choisissez.
ready-update-title = Obtenir la dernière version de Luft
ready-update-description = Une version plus récente est disponible. Elle remplace celle-ci et conserve l’espace réservé et tout ce que vous avez emballé.
ready-try-title = Essayer Luft
ready-try-description = Redémarrer dans Luft sans rien installer. Windows démarre normalement la fois suivante.
ready-box-description = Emballez documents, photos, réseaux Wi-Fi et plus encore, que Luft déballera une fois installé.
ready-box-packed = Emballé, { $size }
ready-install-title = Installer Luft
ready-install-description = Redémarrer dans le programme d’installation. L’espace de { $size } à côté de Windows l’attend déjà.
ready-install-drive-description = Redémarrer dans le programme d’installation. L’espace de { $size } sur { $drive } l’attend déjà.
ready-stick-description = Mettez Luft sur une clé pour le démarrer sur n’importe quel ordinateur.
ready-remove = Supprimer Luft de ce PC
ready-restart-try = Enregistrez d’abord votre travail en cours. Luft s’ouvre au bout d’une minute environ, et le redémarrage suivant vous ramène à Windows.
ready-restart-install = Enregistrez d’abord votre travail en cours. Le programme d’installation s’ouvre au bout d’une minute environ, et rien ne change avant votre confirmation.
ready-fast-startup-title = Désactiver le démarrage rapide de Windows
ready-fast-startup-description = Windows s’éteint alors complètement : le son, le Wi-Fi et le Bluetooth repartent de zéro dans Luft.
ready-clock-title = Garder l’heure juste dans les deux systèmes
ready-clock-description = Windows lit l’horloge de l’ordinateur comme Luft, l’heure ne saute donc plus quand vous changez de système.
ready-remove-title = Supprimer Luft de ce PC ?
ready-remove-description = Meet Luft supprime tout ce qu’il a ajouté, y compris le carton de déménagement, et rend tout son espace à Windows.

## Luft is ready on Linux

linux-ready-description = Choisissez comment le découvrir. Jusqu’à ce que vous en décidiez autrement, { $system } continue de démarrer normalement.
linux-ready-this-system = ce système
linux-ready-update-description = Une version plus récente est disponible. Elle remplace celle que conserve Meet Luft et garde les journaux de vos essais.
linux-ready-try-description = Redémarrer dans Luft sans rien modifier. La fois suivante, { $system } démarre normalement.
linux-ready-replace-title = Remplacer { $system }
linux-ready-replace-description = Luft prend sa place et conserve vos fichiers, votre compte, vos réseaux Wi-Fi et vos autres disques. L’ancien système reste jusqu’à ce que vous le supprimiez.
linux-ready-install-description = Redémarrer dans le programme d’installation pour placer Luft sur un autre disque ou dans de l’espace libre.
linux-ready-remove = Supprimer Luft de cet ordinateur
linux-ready-restart-try = Enregistrez d’abord votre travail en cours. Luft s’ouvre au bout d’une minute environ, et le redémarrage suivant vous ramène à { $system }.
linux-ready-restart-replace = Enregistrez d’abord votre travail en cours. Le programme d’installation s’ouvre prêt à remplacer { $system }, et montre ce qui reste avant toute modification.
linux-ready-remove-title = Supprimer Luft de cet ordinateur ?
linux-ready-remove-description = Meet Luft supprime les fichiers de Luft, ses fichiers de démarrage et son entrée de démarrage. Rien d’autre ne change.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Votre Luft
luft-looking = Meet Luft a trouvé Luft sur ce PC.
luft-checking = Analyse du disque de Luft…
luft-description-beside = Luft est installé à côté de Windows sur ce PC.
luft-description-drive = Luft est installé sur { $drive }.
luft-bar-used = { $size }, dont { $used } utilisés
luft-resize-title = Modifier l’espace de Luft
luft-resize-description = Donnez à Luft une plus grande part de l’espace de Windows, ou rendez-en une partie à Windows.
luft-resize-drive-description = Donnez à Luft une plus grande part de l’espace libre sur { $drive }, ou laissez-en une partie libre.
luft-resize-reencrypting = Luft est encore en train de chiffrer ou de déchiffrer son disque. Une fois que ce sera fait, sa taille pourra changer.
luft-resize-passphrase = Le disque de Luft ne s’ouvre qu’avec une phrase secrète, et Luft ne peut pas la saisir lui-même pendant qu’il se déplace.
luft-resize-start-first = Démarrez Luft une fois pour qu’il puisse indiquer à Meet Luft à quel point il est plein, puis revenez ici.
luft-resize-apart = Une autre partition se trouve entre Windows et Luft, ils ne peuvent donc pas partager leur espace.
luft-pending-grow = Luft s’agrandit à son prochain démarrage
luft-pending-grow-description = Redémarrez dans Luft et laissez-le allumé quelques minutes, le temps qu’il s’installe dans le nouvel espace. Vous pouvez l’utiliser pendant ce temps.
luft-pending-shrink = Luft libère de la place à son prochain démarrage
luft-pending-shrink-description = Redémarrez dans Luft et laissez-le allumé quelques minutes, le temps qu’il déplace ses fichiers. Rouvrez ensuite Meet Luft dans Windows pour donner l’espace à Windows.
luft-pending-trim = Luft se réduit à son prochain démarrage
luft-pending-trim-description = Redémarrez dans Luft, et il se réduira en une minute environ.
luft-windows-free-title = Donner l’espace libre à Windows
luft-windows-free-description = Un espace de { $size } situé juste après Windows est inutilisé. Windows peut le récupérer.
luft-leftovers-title = Nettoyer après l’essai de Luft
luft-leftovers-description = Les partitions créées par Meet Luft pour démarrer Luft sont toujours là. Luft n’en a plus besoin.
luft-start = Redémarrer dans Luft
luft-cancel = Annuler la modification
luft-restart = Enregistrez d’abord votre travail en cours. Luft démarre au bout d’une minute environ, et le redémarrage suivant vous ramène à Windows.
luft-restart-pending = Enregistrez d’abord votre travail en cours. Luft démarre au bout d’une minute environ et déplace lui-même ses fichiers, ce qui prend quelques minutes. Vous pouvez l’utiliser pendant ce temps.
luft-remove = Supprimer Luft de ce PC
luft-remove-title = Supprimer Luft de ce PC ?
luft-remove-description = Luft et tout son contenu sont supprimés, { $size } au total, et Windows récupère l’espace. Le PC démarre Windows comme avant. Cette action est irréversible.
luft-remove-drive-description = Luft et tout son contenu sont supprimés de { $drive }, { $size } au total. Le PC démarre Windows comme avant. Cette action est irréversible.
luft-remove-confirm = Supprimer Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Combien d’espace pour Luft ?
resize-description = Faites glisser pour répartir le disque entre Windows et Luft. Luft effectue lui-même la modification à son prochain démarrage.
resize-measuring = Windows calcule l’espace qu’il peut libérer. Sur un grand disque, cela peut prendre quelques minutes.
resize-full = Luft est trop plein pour être déplacé, et Windows ne peut pas libérer assez d’espace pour lui. Faites d’abord de la place dans Luft ou dans Windows.
resize-drive-description = Faites glisser pour choisir quelle part de { $drive } revient à Luft. Luft effectue lui-même la modification à son prochain démarrage.
resize-drive-free = { $size } d’espace libre sur { $drive }
resize-used = Les fichiers de Luft occupent { $size }.
resize-least = Modifiez la taille d’au moins { $size }.
resize-apply = Modifier
resize-grow-title = Donner { $size } de plus à Luft ?
resize-grow-description = Windows se réduit immédiatement. Luft s’installe dans le nouvel espace à son prochain démarrage, ce qui prend quelques minutes. Laissez le PC branché.
resize-grow-drive-description = Luft occupe l’espace libre sur { $drive } à son prochain démarrage, ce qui prend un instant.
resize-trim-title = Réduire Luft de { $size } ?
resize-trim-description = Luft se réduit à son prochain démarrage, et l’espace reste libre sur { $drive }.
resize-shrink-title = Rendre { $size } à Windows ?
resize-shrink-description = Luft déplace ses fichiers à son prochain démarrage, ce qui prend quelques minutes. Rouvrez ensuite Meet Luft, et Windows récupère l’espace. Laissez le PC branché.

## Packing things to take along to Luft (the moving box)

box-title = Emporter vos affaires
box-description = Choisissez ce que vous emportez. Luft le déballe dans votre nouveau compte une fois installé, et rien n’est retiré de Windows.
box-looking = Analyse de vos dossiers…
box-folder-desktop = Bureau
box-folder-documents = Documents
box-folder-downloads = Téléchargements
box-folder-music = Musique
box-folder-pictures = Images
box-folder-videos = Vidéos
box-folder-size = { $size }, { $files ->
    [one] { $files } fichier
   *[other] { $files } fichiers
}
box-wifi-title = Réseaux Wi-Fi
box-wifi-description = Avec leurs mots de passe, pour que Luft soit en ligne tout de suite
box-bluetooth-title = Appareils Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } appareil, prêt sans nouvelle association
   *[other] { $devices } appareils, prêts sans nouvelle association
}
box-wallpaper-title = Fond d’écran
box-wallpaper-description = L’image de votre bureau Windows
box-account-title = Votre nom et votre photo
box-total-slow = { $size }, environ { $minutes ->
    [one] { $minutes } minute
   *[other] { $minutes } minutes
} pour tout emballer
box-pack = Emballer

## Progress while Meet Luft works

working-shrinking = Libération de l’espace
    .description = Windows déplace ses fichiers pour faire de la place. Cela peut prendre quelques minutes.
working-erasing = Effacement du disque
    .description = Windows le vide pour que Luft puisse en disposer entièrement.
working-partitioning = Préparation de l’espace de Luft
    .description = Préparation des partitions depuis lesquelles Luft démarre.
working-downloading = Transfert de Luft
    .description = Luft est copié directement dans son propre espace et vérifié en cours de route.
working-packing = Emballage de vos affaires
    .description = Copie de tout ce que vous avez choisi dans le carton de déménagement. Les gros dossiers prennent du temps.
working-removing = Suppression de Luft
    .description = Restitution de l’espace à Windows.
working-removing-linux = Suppression de Luft
    .description = Suppression de ses fichiers et de son entrée de démarrage.
working-writing = Création de la clé
    .description = Luft est écrit sur toute la clé. Laissez-la branchée.
working-copying = Ajout de Luft à Ventoy
    .description = Luft est copié à côté des autres ISO de la clé. Laissez-la branchée.
working-verifying = Vérification de la clé
    .description = Relecture complète pour s’assurer qu’elle démarre.
working-stick-downloading = Téléchargement de Luft
    .description = Il est vérifié en cours de route et conservé, pour que la prochaine clé soit plus rapide.
working-progress = { $done } sur { $total }
working-keep-open = Laissez cette fenêtre ouverte.

## After Luft was removed

removed-title = Tout est comme avant
removed-description = { $platform ->
    [linux] Les fichiers de Luft et son entrée de démarrage ont été supprimés, et votre ordinateur démarre exactement comme avant. Revenez quand vous voulez.
   *[windows] Les partitions de Luft et son entrée de démarrage ont été supprimées, et Windows a retrouvé tout son espace. Revenez quand vous voulez.
}

## Making a USB stick

stick-title = Créer une clé USB
stick-description = Luft démarre depuis celle-ci sur n’importe quel ordinateur, pour l’essayer ou l’installer.
stick-looking = Recherche de clés USB…
stick-none = Branchez une clé USB de { $size } ou plus. Elle apparaîtra ici.
stick-drives-label = Clés USB
stick-offer = { $name }, { $size }
stick-make = Créer la clé
stick-drive-empty = Vide
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Trop petite pour Luft
stick-ventoy-title = Cette clé utilise Ventoy
stick-ventoy-description = Y ajouter Luft, ou effacer toute la clé pour en faire une clé Luft ?
stick-erase-it = L’effacer
stick-add = Ajouter Luft
stick-replace-title = Remplacer la version de Luft présente ?
stick-replace-description = { $count ->
    [one] { $names } est déjà sur cette clé. Le nouveau Luft peut prendre sa place.
   *[other] { $names } sont déjà sur cette clé. Le nouveau Luft peut prendre leur place.
}
stick-keep = { $count ->
    [one] Garder les deux
   *[other] Tout garder
}
stick-replace = Remplacer
stick-full-title = Pas assez de place pour Luft
stick-full-description = Luft a besoin de { $needed }, et il reste { $free } sur cette clé. Faites-y de la place, ou effacez-la pour en faire une clé Luft.
stick-erase-title = Effacer { $name } ?
stick-erase-description = Tout le contenu de cette clé de { $size } est effacé et remplacé par Luft. Cette action est irréversible.
stick-erase-confirm = Effacer et créer la clé
stick-done-title = Votre clé Luft est prête
stick-done-ventoy-title = Luft est sur votre clé Ventoy
stick-done-take-out = Vous pouvez la retirer maintenant.
stick-done-eject = Éjectez-la avant de la retirer.
stick-done-start = Pour démarrer dessus, branchez-la et choisissez-la dans le menu de démarrage de l’ordinateur, qui s’ouvre avec une touche comme F12, F8 ou Échap juste après l’allumage.
stick-done-ventoy-key = Avec Secure Boot activé, Ventoy demande une fois, à son premier démarrage, d’enregistrer sa propre clé de signature.
stick-done = Terminé
stick-done-another = En créer une autre
