## What Meet Luft finds when it checks a computer

check-processor-x64 = Processeur Intel ou AMD 64 bits
check-processor-x64-detail = Luft fonctionne dessus.
check-processor-arm = Processeur Arm
check-processor-arm-detail = Pour l’instant, Luft ne fonctionne que sur les processeurs Intel et AMD.
check-processor-32-bit-windows = Windows 32 bits
check-processor-32-bit-system = Système 32 bits
check-processor-32-bit-detail = Luft a besoin d’un processeur Intel ou AMD 64 bits.
check-startup-uefi = Démarre en UEFI
check-startup-uefi-windows = Luft démarre de la même manière moderne.
check-startup-uefi-linux = Luft ajoute sa propre entrée de démarrage, et { $system } continue de démarrer comme aujourd’hui.
check-startup-bios = Démarre en mode BIOS hérité
check-startup-bios-windows = Luft a besoin de l’UEFI. Windows peut faire la conversion avec MBR2GPT, puis l’UEFI peut être activé dans les paramètres du micrologiciel.
check-startup-bios-linux = Luft a besoin de l’UEFI. Activez-le dans les paramètres du micrologiciel et faites aussi passer le système déjà présent en UEFI, puis vérifiez de nouveau.
check-startup-mbr = Le disque utilise une ancienne table de partitions
check-startup-mbr-windows = Luft a besoin d’un disque GPT. Windows peut le convertir avec MBR2GPT sans perdre de fichiers.
check-startup-mbr-linux = Luft a besoin d’un disque GPT pour démarrer.
check-startup-no-esp = Aucune partition système EFI
check-startup-no-esp-detail = Luft ajoute ses fichiers de démarrage à côté de ceux de la partition système EFI, et il n’y en a pas.
check-startup-esp-full = La partition système EFI est pleine
check-startup-esp-full-detail = Luft y a besoin de { $size } Mo pour ses fichiers de démarrage. D’anciens noyaux ou d’anciennes entrées de démarrage occupent généralement cet espace.
check-folder-fine = Aucune partition n’est modifiée
check-folder-fine-detail = Luft est conservé sous forme de fichier sur votre disque { $filesystem } et démarre depuis celui-ci.
check-folder-encrypted = Vos fichiers sont sur un disque chiffré
check-folder-encrypted-detail = Luft ne peut pas encore démarrer depuis un disque chiffré. Utilisez plutôt une clé USB pour l’essayer.
check-folder-combined = Vos fichiers s’étendent sur plusieurs partitions
check-folder-combined-detail = Luft ne peut pas encore démarrer depuis LVM ou RAID. Utilisez plutôt une clé USB pour l’essayer.
check-folder-filesystem = Luft ne peut pas démarrer depuis { $filesystem }
check-folder-filesystem-detail = Il démarre depuis des disques ext4, btrfs et XFS. Utilisez plutôt une clé USB pour l’essayer.
check-space-free = { $size } Go libres
check-space-free-linux = Luft occupe environ { $size } Go pendant l’essai.
check-space-up-to = Jusqu’à { $size } Go pour Luft
check-space-up-to-detail = Windows conserve ses fichiers et de la place pour évoluer.
check-space-free-already = { $size } Go sont déjà libres, Windows en cède donc moins.
check-space-other-drive = Il y a de la place pour lui sur { $drive }.
check-space-erase-drive = Il y a de la place pour lui sur { $drive }, une fois ce disque effacé.
check-space-short = Espace libre insuffisant
check-space-short-windows = Luft a besoin d’environ { $needed } Go que Windows peut libérer. Libérez { $missing } Go dans Windows, par exemple avec le Nettoyage de disque, puis vérifiez de nouveau.
check-space-short-linux = Luft a besoin d’environ { $needed } Go pour démarrer. Libérez { $missing } Go, puis vérifiez de nouveau.
check-system-replaceable = Luft peut prendre sa place et conserver vos fichiers, votre compte et vos paramètres.
check-system-single = Vos fichiers partagent une même partition avec le système : le remplacer en les conservant n’est pas encore possible. Vous pouvez tout de même essayer et installer Luft.
check-system-encrypted = Il est chiffré : le remplacer en conservant vos fichiers n’est pas encore possible.
check-system-unknown = Son disque est organisé d’une manière que Luft ne peut pas encore remplacer en conservant vos fichiers.
check-encryption-off = Windows n’est pas chiffré
check-encryption-off-detail = Installer Luft peut lire ses paramètres et vos appareils Bluetooth.
check-encryption-on = Windows est chiffré avec BitLocker
check-encryption-on-detail = Aucun problème. Windows fait lui-même la place, et Meet Luft apporte ce que Luft ne peut pas lire sur un disque verrouillé. Gardez votre clé de récupération à portée de main, au cas où.
check-encryption-changing = BitLocker est en train de chiffrer ou de déchiffrer
check-encryption-changing-detail = Attendez que Windows ait terminé, puis revenez. Vous pouvez suivre la progression dans Paramètres, sous Chiffrement de l’appareil.
check-fast-startup-on = Le démarrage rapide est activé
check-fast-startup-on-detail = Windows se met en veille prolongée au lieu de s’éteindre, ce qui garde son disque verrouillé. Meet Luft propose de le désactiver avant l’installation.
check-fast-startup-off = Le démarrage rapide est désactivé
check-fast-startup-off-detail = Windows s’éteint complètement.
check-secure-boot-on = Secure Boot est activé
check-secure-boot-on-detail = Il peut rester activé. Luft demande une fois, sur un écran bleu, d’ajouter sa clé.
check-secure-boot-off = Secure Boot est désactivé
check-secure-boot-off-detail = Luft fonctionne sans, mais les jeux avec anti-triche en ont besoin. { $turningOn }
check-secure-boot-restart-into = Meet Luft peut redémarrer dans les paramètres du micrologiciel, où il se trouve sous { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft peut redémarrer dans les paramètres du micrologiciel, où il se trouve généralement sous Security ou Boot.
check-secure-boot-turn-on = Pour l’activer, redémarrez et appuyez sur { $key } à l’apparition du logo { $maker }, puis allez dans { $place }.
check-secure-boot-turn-on-anywhere = Pour l’activer, ouvrez les paramètres du micrologiciel au démarrage de l’ordinateur et regardez sous Security ou Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, puis Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, puis Secure Boot
check-firmware-place-security-or-advanced = Security ou Advanced, puis Secure Boot Configuration
check-firmware-place-security-or-boot = Security ou Boot, puis Secure Boot
check-firmware-place-boot = Boot, puis Secure Boot
check-firmware-place-settings = Settings, puis Security, puis Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 sur un ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ou Suppr
check-firmware-key-delete = Suppr
check-firmware-key-volume-up = Volume +

## More of the computer's hardware

check-tpm-detail = Un Luft chiffré peut se déverrouiller tout seul au démarrage de l’ordinateur.
check-tpm-missing = Aucun TPM 2.0
check-tpm-missing-detail = Si vous chiffrez Luft, il demande une phrase secrète à chaque démarrage.
check-graphics = Carte graphique
check-graphics-detail = Fonctionne immédiatement.
check-graphics-nvidia = Luft s’installe avec le pilote de NVIDIA.
check-wifi-missing = Pas de Wi-Fi
check-wifi-missing-detail = Utilisez un câble réseau dans Luft, ou rien du tout.
check-wifi-detail = Fonctionne dans Luft.
check-wifi-broadcom = Certaines puces Wi-Fi Broadcom ont besoin d’un pilote que Luft n’inclut pas. Gardez à portée de main un câble réseau ou un téléphone pour le partage de connexion USB.
check-start-entries = { $count ->
    [one] Une ancienne entrée de démarrage
   *[other] { $count } anciennes entrées de démarrage
}
check-start-entries-detail = { $count ->
    [one] { $names } pointe vers un système qui n’est plus sur ce PC. Elle peut être supprimée.
   *[other] { $names } pointent vers des systèmes qui ne sont plus sur ce PC. Elles peuvent être supprimées.
}
check-download-unavailable = Luft ne peut pas être téléchargé pour le moment
check-download-unavailable-detail = Meet Luft télécharge environ 3 Go. Vérifiez que vous êtes en ligne et relancez la vérification, ou utilisez une ISO de Luft que vous avez déjà.

## Choosing a Luft ISO file

iso-dialog-title = Choisir une ISO de Luft
iso-dialog-filter = ISO de Luft

## Saving the logs from trying Luft

logs-file-name = Journaux Luft { $name }
logs-no-desktop = Meet Luft n’a pas trouvé votre bureau
logs-not-saved = Meet Luft n’a pas pu enregistrer les journaux de l’essai de Luft : { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = L’assistant de Meet Luft n’a pas démarré : { $error }
helper-not-allowed = Meet Luft n’a pas été autorisé à modifier le disque
helper-stopped = L’assistant de Meet Luft s’est arrêté
helper-stopped-because = L’assistant de Meet Luft s’est arrêté : { $error }
helper-pipe-failed = Meet Luft n’a pas pu communiquer avec son assistant : { $error }
helper-pipe-hijacked = Un autre programme que l’assistant de Meet Luft a ouvert { $pipe }
helper-record-not-saved = Meet Luft n’a pas pu noter ce qu’il a créé : { $error }
helper-no-room-yet = Faites d’abord de la place pour Luft.
helper-not-ready-linux = Préparez d’abord Luft.
helper-not-ready-to-start-windows = Luft n’est pas encore prêt à démarrer. Faites-lui d’abord de la place.
helper-not-ready-to-start-linux = Luft n’est pas encore prêt à démarrer. Préparez-le d’abord.
helper-update-unfinished = La mise à jour de Luft n’a pas abouti. Relancez-la d’abord.
helper-room-too-small = Luft a besoin de plus d’espace que cela.
helper-room-shortfall = Windows peut libérer { $available } Go, et Luft a besoin de { $needed } Go.
helper-gap-shortfall = Cet espace offre { $available } Go, et Luft a besoin de { $needed } Go.
helper-place-gone = Cet espace n’est plus libre. Vérifiez de nouveau pour voir où Luft peut s’installer.
helper-box-shortfall = Windows peut encore libérer { $available } Go, et ces éléments ont besoin de { $needed } Go.
helper-box-room-shortfall = L’espace de Luft peut encore accueillir { $available } Go, et ces éléments ont besoin de { $needed } Go.
helper-bluetooth-unreadable = Les paramètres Bluetooth de Windows n’ont pas pu être ouverts
helper-registry-not-opened = Impossible d’ouvrir { $key } : { $error }
helper-registry-not-changed = Impossible de modifier { $value } : { $error }
helper-registry-not-saved = Impossible d’enregistrer { $file } : { $error }
helper-restart-failed = L’ordinateur n’a pas redémarré
helper-windows-restart-failed = Windows n’a pas redémarré : { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ce PC ne démarre pas en UEFI
firmware-variable-unreadable = Impossible de lire { $name } dans le micrologiciel : { $error }
firmware-variable-not-saved = Impossible d’enregistrer { $name } dans le micrologiciel : { $error }
firmware-entries-full = Le micrologiciel n’a plus de place pour une autre entrée de démarrage
firmware-entry-kept = Windows a conservé l’entrée de démarrage { $entry }

## Errors about drives and partitions

drive-list-failed = Impossible de lister les disques : { $error }
drive-of-path-unknown = Impossible de déterminer quel disque contient { $path }
drive-windows-folder-missing = Le dossier de Windows est introuvable
drive-windows-drive-missing = Le disque de Windows est introuvable
drive-windows-drive-missing-because = Le disque de Windows est introuvable : { $error }
drive-windows-partition-missing = La partition de Windows est introuvable
drive-volume-missing = Le volume { $path } est introuvable
drive-storage-error = { $what } (erreur de stockage Windows { $code })
drive-shrink-size-unknown = Windows n’a pas pu déterminer jusqu’où sa partition peut être réduite
drive-resize-failed = Windows n’a pas pu modifier la taille de sa partition
drive-create-failed = Windows n’a pas pu créer de partition pour Luft
drive-hide-failed = Windows n’a pas pu masquer la nouvelle partition dans l’Explorateur de fichiers
drive-format-failed = Windows n’a pas pu formater la nouvelle partition
drive-remove-failed = Windows n’a pas pu supprimer l’une des partitions de Luft
drive-new-partition-missing = La nouvelle partition est introuvable
drive-new-partition-no-volume = La nouvelle partition n’a pas de volume
drive-start-no-guid = La partition de démarrage n’a pas de GUID
drive-live-no-guid = La partition de Luft n’a pas de GUID
drive-box-no-guid = Le carton de déménagement n’a pas de GUID
drive-guid-unreadable = Le GUID de la partition est illisible
drive-not-gpt = La table de partitions du disque n’est pas GPT
drive-start-no-volume = La partition de démarrage n’a pas de volume
drive-live-no-volume = La partition de Luft n’a pas de volume
drive-new-live-no-volume = La nouvelle partition de Luft n’a pas de volume
drive-partitions-not-noted = Les partitions de Luft ne figurent pas dans les notes de Meet Luft
drive-partitions-gone = Les partitions de Luft ont disparu
drive-partition-gone = Une partition a disparu
drive-gone = Un disque a disparu
drive-erase-failed = Windows n’a pas pu effacer le disque
drive-erased-no-room = Le disque effacé n’a pas assez de place pour Luft
drive-start-partition-foreign = La partition de démarrage de Luft n’a pas été créée par Meet Luft
drive-start-partition-gone = La partition de démarrage de Luft a disparu
drive-start-partition-not-listed = La partition de démarrage de Luft ne figure pas dans la table de partitions
drive-no-esp = Cet ordinateur n’a pas de partition système EFI
drive-esp-full = La partition système EFI est trop pleine pour les fichiers de démarrage de Luft.
drive-esp-not-opened = La partition système EFI n’a pas pu être ouverte
drive-esp-file-unreadable = Le fichier { $file } de la partition système EFI est illisible
drive-esp-no-drive = La partition système EFI n’a pas de disque
drive-esp-no-guid = La partition système EFI n’a pas de GUID
drive-no-uuid = Le disque où Luft est conservé n’a pas d’UUID
drive-folder-unreadable = Luft ne peut pas démarrer depuis le disque où se trouvent vos fichiers.
drive-folder-not-startable = Impossible de démarrer depuis { $folder }

## Errors while changing Luft once it's installed

luft-gone = Luft n’est plus sur ce PC
luft-not-resizable = La taille de Luft ne peut pas être modifiée depuis Windows pour le moment
luft-size-not-allowed = Luft ne peut pas avoir cette taille
luft-space-promised = Cet espace est réservé à Luft. Annulez d’abord la modification.
luft-no-start-entry = L’entrée de démarrage de Luft est introuvable

## Errors while getting Luft

live-no-home-folder = Aucun dossier personnel où conserver Luft
live-no-app-data-folder = Aucun dossier de données d’applications locales où conserver Luft
live-pointer-unreadable = La dernière version de Luft est illisible
live-not-published = Luft n’est pas publié à cet endroit
live-checksum-unreadable = Le fichier de somme de contrôle est illisible
live-checksum-not-read = La somme de contrôle de Luft n’a pas pu être lue : { $error }
live-download-damaged = Le téléchargement a été endommagé en cours de route. Réessayez.
live-download-incomplete = Il manque { $file } dans la version téléchargée de Luft
live-download-not-resumable = Le serveur ne peut pas reprendre le téléchargement
live-not-signed = { $iso } n’est pas signé
live-signature-unreadable = La signature de { $iso } est illisible
live-signature-wrong-key = { $iso } n’est pas signé par Lantharos
live-signature-other-iso = La signature concerne { $signed }, et non { $iso }
live-iso-out-of-order = Les fichiers de l’ISO ne sont pas dans un ordre que Meet Luft peut lire
live-iso-not-iso = Ce n’est pas une image ISO
live-iso-no-root = L’ISO n’a pas de dossier racine
live-iso-no-joliet = L’ISO n’a pas de noms Joliet
live-not-removed = Impossible de supprimer { $path } : { $error }

## Errors while making a USB stick

stick-gone = La clé n’est plus là. Rebranchez-la et choisissez-la de nouveau.
stick-too-small = Luft ne tient pas sur cette clé. Utilisez-en une de 4 Go ou plus.
stick-damaged = L’ISO ne correspond pas à sa somme de contrôle. Elle a peut-être été endommagée en cours de route.
stick-read-back-differs = La relecture de la clé ne correspond pas à ce qui y a été écrit. Elle est peut-être usée, essayez-en une autre.
stick-download-unavailable = Luft ne peut pas être téléchargé pour le moment : { $error }
stick-download-failed = Luft n’a pas pu être téléchargé : { $error }
stick-checksum-unreadable = La somme de contrôle de l’ISO ne peut pas être lue : { $error }
stick-file-unreadable = Impossible de lire { $path } : { $error }
stick-iso-unreadable = L’ISO ne peut pas être lue : { $error }
stick-iso-no-name = L’ISO n’a pas de nom
stick-iso-ended-early = L’ISO s’est terminée trop tôt
stick-iso-already-there = { $name } est déjà sur la clé.
stick-no-room = Pas assez de place pour Luft sur la clé. Libérez-y d’abord { $size } Mo.
stick-older-not-removed = L’ancienne version de Luft n’a pas pu être supprimée : { $error }
stick-copy-stopped = La copie de Luft sur la clé s’est interrompue : { $error }
stick-not-opened = La clé n’a pas pu être ouverte : { $error }
stick-write-stopped = L’écriture sur la clé s’est interrompue : { $error }
stick-not-synced = La clé n’a pas tout enregistré : { $error }
stick-read-back-failed = La relecture de la clé a échoué : { $error }
stick-in-use = La clé est encore utilisée : { $error }
stick-device-in-use = { $device } est encore utilisé : { $error }
stick-volume-not-opened = Le volume de la clé n’a pas pu être ouvert : { $error }
stick-volume-in-use = La clé est encore utilisée. Fermez ce qui y a des fichiers ouverts et réessayez ({ $error })
stick-not-dismounted = Windows n’a pas pu libérer la clé : { $error }
stick-not-cleared = Windows n’a pas pu vider la clé : { $error }
stick-not-refreshed = Windows n’a pas pu analyser de nouveau la clé : { $error }
stick-not-ventoy = Cette clé n’utilise plus Ventoy.
stick-ventoy-not-opened = La partition de Ventoy n’a pas pu être ouverte : { $error }
stick-ventoy-not-opened-windows = Windows ne peut pas ouvrir la partition de Ventoy
stick-udisks-missing = Meet Luft a besoin d’UDisks pour utiliser la clé : { $error }
