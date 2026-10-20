## Errors shown in Install Luft and first-run setup

installer-not-allowed = Vous n’êtes pas autorisé à faire cela.
installer-stopped = Le programme d’installation s’est arrêté de façon inattendue.
installer-request-invalid = La demande n’est pas valide : { $error }
installer-settings-invalid = Les paramètres ne sont pas valides : { $error }
installer-busy = Luft est déjà en cours d’installation.
installer-account-exists = Le compte a déjà été créé.

## Choosing what to install

installer-no-image = Aucune image { $variant } à installer.
installer-read-failed = Impossible de lire { $path }
installer-parse-failed = Impossible d’analyser { $path }
installer-write-failed = Impossible d’écrire { $path }

## Checking the destination

installer-drive-gone = Ce disque n’est plus connecté.
installer-drive-unusable = Luft ne peut pas être installé sur ce disque.
installer-system-gone = Ce système n’est plus présent.
installer-system-unreplaceable = Luft ne peut pas encore remplacer { $system }.
installer-drive-running = Luft démarre actuellement depuis ce disque, il ne peut donc pas être effacé.
installer-windows-unshrinkable = Windows ne peut pas être réduit sur ce disque.
installer-size-wont-fit = Cette taille ne tient pas à côté de Windows.
installer-space-gone = Cet espace libre n’est plus disponible.
installer-space-too-small = Cet espace libre est trop petit pour Luft.

## Account and regional settings

installer-user-name-invalid = Ce nom d’utilisateur ne peut pas être utilisé.
installer-full-name-invalid = Un nom ne peut contenir ni deux-points, ni virgule, ni saut de ligne.
installer-password-missing = Choisissez un mot de passe.
installer-account-not-saved = Le nouveau compte n’a pas été enregistré
installer-account-missing = Le nouveau compte est introuvable
installer-regional-invalid = Ces paramètres régionaux ne sont pas valides.
installer-unknown-zone = Le nouveau système ne connaît pas le fuseau horaire { $zone }.

## Installing

installer-esp-partition-failed = Impossible de créer la partition système EFI
installer-startup-partition-failed = Impossible de créer la partition des fichiers de démarrage de Luft
installer-root-partition-failed = Impossible de créer la partition de Luft
installer-shrink-failed = Impossible de réduire Windows
installer-no-esp = Le disque n’a pas de partition système EFI
installer-no-root = Aucune partition n’a été créée pour Luft
installer-copy-failed = Impossible de copier Luft
installer-no-deployment = Le nouveau système n’a aucun déploiement
installer-deployment-unnamed = Le déploiement du nouveau système n’a pas de nom
installer-deployment-unopened = Impossible d’ouvrir le nouveau système
installer-boot-menu-failed = Impossible de placer le menu de démarrage de Luft sur la partition système EFI
installer-key-queue-failed = Impossible de préparer la clé Secure Boot de Luft pour le prochain redémarrage

## Replacing a Linux system

installer-leftovers-failed = Impossible de supprimer ce qu’une tentative précédente a laissé
installer-default-failed = Impossible de faire de Luft le système qui démarre
installer-relabel-failed = Impossible d’étiqueter vos fichiers pour Luft
installer-set-aside-failed = Impossible de mettre l’ancien système de côté

## Things packed with Meet Luft

installer-box-unopened = Impossible d’ouvrir le carton de déménagement
installer-box-no-list = Le carton de déménagement n’a pas de liste de contenu
installer-unpack-failed = Impossible de déballer { $path }
installer-wallpaper-unnamed = Le fond d’écran n’a pas de nom
