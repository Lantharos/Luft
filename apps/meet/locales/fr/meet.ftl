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
