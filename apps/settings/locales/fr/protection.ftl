## Shared buttons

settings-protection-cancel = Annuler
settings-protection-continue = Continuer
settings-protection-close = Fermer
settings-protection-done = Terminé
settings-protection-restart = Redémarrer
settings-protection-remove = Supprimer
settings-protection-turn-on = Activer
settings-protection-set-up = Configurer

## Privacy: screen lock

settings-privacy-screen-lock = Verrouillage de l’écran
settings-privacy-screen-off = Extinction de l’écran
settings-privacy-screen-off-hint = À régler dans Alimentation et batterie
settings-privacy-screen-off-after = Après { $duration }
settings-privacy-screen-off-never = Jamais
settings-privacy-lock-when-off = Verrouiller l’écran quand il s’éteint
settings-privacy-lock-after = Verrouiller après
settings-privacy-lock-after-hint = Délai après l’extinction de l’écran
settings-privacy-lock-immediately = Immédiatement

## Privacy: location, camera and microphone

settings-privacy-location = Localisation
settings-privacy-location-services = Services de localisation
settings-privacy-location-services-hint = Permet aux applications de savoir où vous êtes, pour les cartes, la météo et les fuseaux horaires
settings-privacy-camera = Caméra
settings-privacy-camera-allow = Autoriser les applications à utiliser la caméra
settings-privacy-microphone-allow = Autoriser les applications à utiliser le microphone
settings-privacy-apps-asked = Applications ayant demandé l’accès
settings-privacy-apps-allowed = { $allowed } sur { $total } autorisées

## Privacy: file history

settings-privacy-file-history = Historique des fichiers
settings-privacy-remember-files = Mémoriser les fichiers récents
settings-privacy-remember-files-hint = Les applications peuvent afficher les derniers fichiers ouverts
settings-privacy-keep-history = Conserver l’historique
settings-privacy-keep-forever = Toujours
settings-privacy-clear-history = Effacer l’historique
settings-privacy-clear-history-hint = Oublier immédiatement tous les fichiers de la liste
settings-privacy-clear = Effacer
settings-privacy-clear-title = Effacer l’historique des fichiers ?
settings-privacy-clear-description = Les applications n’afficheront plus les fichiers ouverts récemment. Les fichiers eux-mêmes restent où ils sont.

## Privacy: trash and temporary files

settings-privacy-cleanup = Corbeille et fichiers temporaires
settings-privacy-empty-trash = Vider la Corbeille automatiquement
settings-privacy-delete-temp = Supprimer automatiquement les fichiers temporaires
settings-privacy-delete-temp-hint = Vos fichiers des dossiers temporaires qui n’ont pas servi récemment
settings-privacy-delete-after = Supprimer après
settings-privacy-delete-after-hint = Durée de conservation des fichiers avant leur suppression

## Security: summary at the top of the page

settings-security-protected = Votre appareil est protégé
settings-security-encrypting = Chiffrement de votre appareil
settings-security-encrypting-progress = { $progress }. Vous pouvez continuer à travailler pendant ce temps.
settings-security-decrypting = Désactivation du chiffrement de l’appareil
settings-security-restart-to-encrypt = Redémarrer pour lancer le chiffrement
settings-security-restart-to-encrypt-description = Le chiffrement commencera au prochain redémarrage de cet ordinateur.
settings-security-encryption-failed = Le chiffrement n’a pas démarré
settings-security-encryption-failed-description = Luft a démarré sans le chiffrement et vos fichiers n’ont pas été modifiés. Activez-le de nouveau pour réessayer.
settings-security-could-be-safer = Votre appareil pourrait être mieux protégé
settings-security-could-be-safer-description = Activez le chiffrement de l’appareil pour protéger vos fichiers.
settings-security-starts-differently-description = Si vous avez modifié ses paramètres Secure Boot, confirmez-le pour que le disque se déverrouille de nouveau tout seul.
settings-security-needed-recovery-key = Votre disque a demandé sa clé de récupération
settings-security-needed-recovery-key-description = Associez de nouveau la puce de sécurité pour qu’il se déverrouille tout seul.
settings-security-firmware-ready-description = Des mises à jour du micrologiciel de votre matériel sont prêtes dans Mises à jour.
settings-security-encrypted-secure-boot = Votre disque est chiffré et Secure Boot vérifie son démarrage.
settings-security-encrypted = Votre disque est chiffré.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Seuls des logiciels de confiance peuvent démarrer cet ordinateur
settings-security-chip = Puce de sécurité
settings-security-chip-description = Protège les clés et vérifie comment cet ordinateur a démarré
settings-firmware-updates-ready = Des mises à jour du micrologiciel sont prêtes
settings-firmware-updates-count = { $count ->
    [one] { $count } mise à jour de votre matériel dans Mises à jour
   *[other] { $count } mises à jour de votre matériel dans Mises à jour
}

## Security: signed startup

settings-security-signed-startup = Démarrage signé
settings-security-signed-startup-on = Le menu de démarrage et le système sont signés pour cet ordinateur
settings-security-signed-startup-purpose = Seuls les logiciels signés pour cet ordinateur peuvent le démarrer
settings-security-signed-startup-restart = Pris en compte après le redémarrage
settings-security-signed-startup-missed = La clé n’a pas été ajoutée au dernier redémarrage
settings-security-signed-startup-pending = Ajoutez la clé sur l’écran bleu au redémarrage
settings-security-signed-startup-missed-often = La clé n’a pas été ajoutée après plusieurs redémarrages
settings-security-show-steps = Afficher les étapes
settings-security-try-again = Réessayer

## Security: games with anti-cheat

settings-security-anti-cheat = Jeux avec anti-triche
settings-security-anti-cheat-ready = Prêt pour les jeux avec anti-triche
settings-security-anti-cheat-removing = Supprimez les autres clés sur l’écran bleu au redémarrage
settings-security-anti-cheat-luft-key = Epic doit encore ajouter la clé de Luft à sa liste
settings-security-anti-cheat-ready-description = Les jeux peuvent vérifier comment cet ordinateur a démarré

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Supprimer les clés au redémarrage
settings-security-key-steps-add = Ajouter la clé au redémarrage
settings-security-key-steps-remove-description = Après le redémarrage, un écran bleu propose de supprimer des clés. Il n’attend que 10 secondes : appuyez sur une touche dès qu’il apparaît.
settings-security-key-steps-add-description = Après le redémarrage, un écran bleu propose d’ajouter une nouvelle clé. Il n’attend que 10 secondes : appuyez sur une touche dès qu’il apparaît.
settings-security-key-step-choose = Choisissez { $option }, puis { $next }.
settings-security-key-step-confirm = Choisissez { $option }.
settings-security-key-step-code = Tapez le code ci-dessous et appuyez sur { $key }.
settings-security-key-step-reboot = Choisissez { $option }.
settings-security-key-enter = Entrée
settings-security-key-code = Code { $code }
settings-security-key-steps-remove-missed = Si vous le manquez, l’ordinateur démarre normalement et vous pourrez réessayer ici.
settings-security-key-steps-add-missed = Si vous le manquez, l’ordinateur démarre normalement et les étapes s’afficheront de nouveau au prochain redémarrage, avec un nouveau code.
settings-security-later = Plus tard
settings-security-restart-now = Redémarrer maintenant

## Security: hardware security level

settings-security-hardware = Sécurité matérielle
settings-security-hardware-level-0 = Votre matériel dispose de peu des protections possibles
settings-security-hardware-level-1 = Votre matériel dispose des protections de base
settings-security-hardware-level-2 = Votre matériel dispose des protections importantes
settings-security-hardware-level-3 = Votre matériel est bien protégé
settings-security-hardware-level-4 = Votre matériel se protège pendant son fonctionnement
settings-security-hardware-level-5 = Votre matériel se protège et peut le prouver
settings-security-hardware-description = { $summary }, niveau { $level } sur { $highest }.
settings-security-hardware-next = Pour le niveau suivant
settings-security-hardware-highest = C’est le niveau le plus élevé.
settings-security-hardware-inactive = Inactives pour le moment
settings-security-hardware-fix-maker = { $count ->
    [one] Seul le fabricant de votre ordinateur peut ajouter cette protection, généralement par une mise à jour du micrologiciel :
   *[other] Seul le fabricant de votre ordinateur peut ajouter ces protections, généralement par une mise à jour du micrologiciel :
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Cette protection peut être activée dans les paramètres du micrologiciel de votre ordinateur :
   *[other] Ces protections peuvent être activées dans les paramètres du micrologiciel de votre ordinateur :
}
settings-security-hardware-fix-system = { $count ->
    [one] Cette protection dépend de la configuration du système :
   *[other] Ces protections dépendent de la configuration du système :
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Cette protection n’est pas disponible sur cet ordinateur :
   *[other] Ces protections ne sont pas disponibles sur cet ordinateur :
}

## Security: USB protection

settings-usb-hold-back = Bloquer les nouveaux périphériques USB
settings-usb-hold-back-description = Ceux branchés pendant le verrouillage attendent que vous déverrouilliez

## Device encryption

settings-encryption = Chiffrement de l’appareil
settings-encryption-encrypting = Chiffrement de cet appareil
settings-encryption-decrypting = Désactivation du chiffrement de l’appareil
settings-encryption-starting = Commencera au prochain redémarrage
settings-encryption-failed = N’a pas démarré au dernier redémarrage, vos fichiers n’ont pas été modifiés
settings-encryption-off = Protège vos fichiers si cet ordinateur est perdu
settings-encryption-progress = Terminé à { $percent }
settings-encryption-progress-seconds = Terminé à { $percent }, moins d’une minute restante
settings-encryption-progress-minutes = { $minutes ->
    [one] Terminé à { $percent }, encore environ { $minutes } minute
   *[other] Terminé à { $percent }, encore environ { $minutes } minutes
}
settings-encryption-progress-hours = { $hours ->
    [one] Terminé à { $percent }, encore environ { $hours } heure
   *[other] Terminé à { $percent }, encore environ { $hours } heures
}
settings-encryption-unlocks-chip-pin = Se déverrouille avec la puce de sécurité et votre code PIN
settings-encryption-unlocks-chip = Se déverrouille tout seul avec la puce de sécurité
settings-encryption-unlocks-passphrase = Demande votre phrase secrète au démarrage
settings-encryption-unlocks-security-key = Se déverrouille avec votre clé de sécurité au démarrage
settings-encryption-unlocks-recovery-key = Demande votre clé de récupération au démarrage

## Device encryption: other drives

settings-encryption-drives = Autres lecteurs
settings-encryption-drives-hint = Chiffrez d’autres lecteurs et clés USB dans Disques
settings-encryption-drives-open = Ouvrir Disques
settings-encryption-drive-encrypting = Chiffrement d’un lecteur, terminé à { $percent }
settings-encryption-drive-encrypting-paused = Chiffrement d’un lecteur, en pause à { $percent }
settings-encryption-drive-decrypting = Déchiffrement d’un lecteur, terminé à { $percent }
settings-encryption-drive-decrypting-paused = Déchiffrement d’un lecteur, en pause à { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } lecteur chiffré se déverrouille avec cet ordinateur
   *[other] { $count } lecteurs chiffrés se déverrouillent avec cet ordinateur
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Activer le chiffrement de l’appareil
settings-encryption-turn-on-description = Vos fichiers restent privés si cet ordinateur est perdu ou volé. Sans la bonne clé, personne ne peut lire le disque.
settings-encryption-blocked-title = Le chiffrement de l’appareil ne peut pas encore être activé
settings-encryption-blocked-description = Réglez les points signalés ci-dessous, puis réessayez.
settings-encryption-checking = Vérification de votre ordinateur…
settings-encryption-backup = Avant de commencer, assurez-vous que vos fichiers importants sont sauvegardés.
settings-encryption-key-title = Enregistrez votre clé de récupération
settings-encryption-key-description = Si le disque ne peut plus se déverrouiller tout seul, par exemple après une réparation, cette clé vous permet d’y accéder. Conservez-la ailleurs que sur cet ordinateur.
settings-encryption-unlock-title = Déverrouillage au démarrage
settings-encryption-unlock-description = La puce de sécurité déverrouille le disque toute seule au démarrage, la connexion ne change donc pas.
settings-encryption-passphrase-title = Choisissez une phrase secrète
settings-encryption-passphrase-description = Cet ordinateur ne peut pas déverrouiller le disque tout seul : il demandera cette phrase secrète à chaque démarrage.
settings-encryption-summary-title = Prêt pour le chiffrement
settings-encryption-summary-description = Voici la suite des opérations.
settings-encryption-step-restart = Votre ordinateur redémarre une fois.
settings-encryption-step-screen = Pendant le démarrage, un bref écran « Encrypting your device » s’affiche.
settings-encryption-step-background = Le reste se fait en arrière-plan pendant que vous continuez à travailler.
settings-encryption-step-plugged-in = Laissez l’ordinateur branché jusqu’à la fin.
settings-encryption-ask-pin = Demander aussi un code PIN
settings-encryption-ask-pin-description = Le disque reste verrouillé même si quelqu’un prend l’ordinateur. Le code sera demandé une fois le chiffrement terminé.
settings-encryption-back = Retour
settings-encryption-starting-button = Démarrage…
settings-encryption-restart-and-encrypt = Redémarrer et chiffrer

## Device encryption: turning it off

settings-encryption-turn-off-title = Désactiver le chiffrement de l’appareil ?
settings-encryption-turn-off-description = Vos fichiers sont déchiffrés en arrière-plan pendant que vous travaillez. Ensuite, toute personne qui retire le disque pourra le lire.
settings-encryption-keep = Garder le chiffrement
settings-encryption-turning-off = Désactivation…
settings-encryption-turn-off = Désactiver

## Device encryption: unlocking the disk

settings-encryption-unlocking = Déverrouillage de votre disque
settings-encryption-starts-differently = Cet ordinateur démarre différemment
settings-encryption-starts-differently-description = Ses paramètres Secure Boot ont changé, le disque a donc demandé sa clé de récupération. Si vous êtes à l’origine du changement, confirmez-le pour qu’il se déverrouille de nouveau tout seul
settings-encryption-confirm = Confirmer
settings-encryption-asked-recovery-key = Votre disque a demandé sa clé de récupération
settings-encryption-relink-description = Associez de nouveau la puce de sécurité pour qu’il se déverrouille tout seul
settings-encryption-relink = Associer de nouveau
settings-encryption-chip-unlock = Déverrouiller avec la puce de sécurité
settings-encryption-chip-unlock-on = Tant que rien ne change dans le démarrage de cet ordinateur
settings-encryption-chip-unlock-off = Pour ne pas taper de phrase secrète au démarrage
settings-encryption-pin = Code PIN au démarrage
settings-encryption-pin-description = À taper avant le déverrouillage du disque
settings-encryption-change = Modifier
settings-encryption-add-pin-row = Ajouter un code PIN au démarrage
settings-encryption-add-pin-row-description = Le disque reste verrouillé même si l’ordinateur est volé
settings-encryption-add-pin = Ajouter un code PIN
settings-encryption-new-key-description = Votre disque n’avait pas encore de clé de récupération. Conservez celle-ci ailleurs que sur cet ordinateur.
settings-encryption-stop-chip-title = Ne plus déverrouiller avec la puce de sécurité ?
settings-encryption-stop-chip-passphrase = Votre ordinateur demandera votre phrase secrète à chaque démarrage.
settings-encryption-stop-chip-recovery-key = Votre ordinateur demandera votre clé de récupération à chaque démarrage, gardez-la donc à portée de main.
settings-encryption-stop-chip = Ne plus déverrouiller
settings-encryption-remove-pin-title = Supprimer votre code PIN ?
settings-encryption-remove-pin-description = Le disque se déverrouillera de nouveau tout seul au démarrage de l’ordinateur.
settings-encryption-remove-pin = Supprimer le code PIN
settings-encryption-unlock-disk-title = Déverrouiller votre disque
settings-encryption-unlock-disk-description = Cette modification nécessite votre clé de récupération ou la phrase secrète que vous tapez au démarrage.
settings-encryption-unlock-disk-field = Clé de récupération ou phrase secrète

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = La puce de sécurité de votre ordinateur déverrouille le disque toute seule au démarrage, vous n’avez donc plus à taper de phrase secrète.
settings-encryption-add-pin-title = Ajouter un code PIN
settings-encryption-add-pin-description = Vous le taperez à chaque démarrage de l’ordinateur. Sans lui, le disque reste verrouillé, même si quelqu’un emporte tout l’ordinateur.
settings-encryption-change-pin-title = Modifier votre code PIN
settings-encryption-change-pin-description = Vous taperez le nouveau code PIN à chaque démarrage de l’ordinateur.
settings-encryption-change-pin = Modifier le code PIN
settings-encryption-relink-title = Associer de nouveau la puce de sécurité
settings-encryption-relink-pin-description = Tapez le code PIN que vous souhaitez utiliser au démarrage.
settings-encryption-ask-pin-step = Ajoute une étape au démarrage.
settings-encryption-pin-field = Code PIN
settings-encryption-new-pin-field = Nouveau code PIN
settings-encryption-pin-length = De { $min } à { $max } chiffres
settings-encryption-pin-digits-only = Utilisez uniquement des chiffres
settings-encryption-pin-too-short = { $min ->
    [one] Utilisez au moins { $min } chiffre
   *[other] Utilisez au moins { $min } chiffres
}
settings-encryption-pin-too-long = { $max ->
    [one] Utilisez au plus { $max } chiffre
   *[other] Utilisez au plus { $max } chiffres
}
settings-encryption-pins-differ = Les codes PIN ne correspondent pas
settings-encryption-confirm-field = Confirmation
settings-encryption-type-again = Répétez la saisie
settings-encryption-passphrase-field = Phrase secrète
settings-encryption-passphrase-length = { $min ->
    [one] Au moins { $min } caractère
   *[other] Au moins { $min } caractères
}
settings-encryption-passphrases-differ = Les phrases secrètes ne correspondent pas

## Recovery key

settings-recovery-title = Clé de récupération
settings-recovery-description = Vous permet d’accéder au disque s’il ne peut pas se déverrouiller tout seul
settings-recovery-show = Afficher
settings-recovery-replace = Remplacer
settings-recovery-replace-title = Remplacer votre clé de récupération ?
settings-recovery-replace-description = Votre clé actuelle ne fonctionnera plus et vous en recevrez une nouvelle à enregistrer.
settings-recovery-replace-key = Remplacer la clé
settings-recovery-shown-title = Votre clé de récupération
settings-recovery-shown-description = Tapez-la si votre ordinateur demande une clé de récupération au démarrage. Conservez-en une copie ailleurs que sur cet ordinateur.
settings-recovery-fresh-title = Enregistrez votre nouvelle clé de récupération
settings-recovery-fresh-description = Votre ancienne clé ne fonctionne plus. Conservez celle-ci sur papier ou dans un gestionnaire de mots de passe.
settings-recovery-saved = J’ai enregistré ma clé de récupération

## Passwords and keys (the keyring)

settings-passwords-title = Mots de passe et clés
settings-passwords-not-running = Votre trousseau n’est pas lancé
settings-passwords-not-running-description = Vos mots de passe et vos clés apparaîtront ici dès son démarrage
settings-passwords-locked = Verrouillé
settings-passwords-contents = { $count ->
    [0] Rien d’enregistré pour l’instant
    [one] { $count } mot de passe ou clé
   *[other] { $count } mots de passe et clés
}
settings-passwords-protected-chip = Protégé par votre mot de passe et la puce de sécurité
settings-passwords-protected = Protégé par votre mot de passe
settings-passwords-unlock = Déverrouiller
settings-passwords-lock = Verrouiller
settings-passwords-seal-title = Sceller avec la puce de sécurité
settings-passwords-seal-description = Leurs copies ne peuvent pas être ouvertes sur un autre ordinateur
settings-passwords-seal = Sceller
settings-passwords-fingerprint-on = Se déverrouille avec votre empreinte digitale
settings-passwords-fingerprint-on-description = La connexion par empreinte déverrouille aussi vos mots de passe
settings-passwords-fingerprint = Déverrouiller avec votre empreinte digitale
settings-passwords-fingerprint-description = Ajoutez d’abord une empreinte dans Utilisateurs
settings-passwords-pin = Demander un code PIN après l’empreinte
settings-passwords-pin-locked = Déverrouillez votre trousseau pour modifier ce paramètre
settings-passwords-pin-description = Pour qu’une empreinte seule ne suffise pas à les déverrouiller
settings-passwords-lock-with-screen = Verrouiller avec l’écran
settings-passwords-lock-with-screen-description = Ils se verrouillent et se déverrouillent en même temps que l’écran
settings-passwords-apps = Applications ayant accès
settings-passwords-apps-locked = Déverrouillez votre trousseau pour les afficher
settings-passwords-apps-asked = { $count ->
    [0] Aucune application ne les a encore demandés
    [one] { $count } application les a demandés
   *[other] { $count } applications les ont demandés
}

## Passwords and keys: apps with access

settings-passwords-access-description = Si vous en retirez une, l’application redemandera l’accès la prochaine fois.
settings-passwords-access-not-allowed = Non autorisée
settings-passwords-access-none = Aucune application n’a encore demandé vos mots de passe
settings-passwords-access-revoke = Ne plus autoriser { $app } à utiliser { $item }
settings-passwords-access-reset = Permettre à { $app } de redemander { $item }
settings-passwords-stores = Identifiants des applications
settings-passwords-stores-description = Identifiants que certaines applications conservent ici et que seule l’application concernée peut lire.
settings-passwords-stores-count = { $count ->
    [one] { $count } identifiant enregistré
   *[other] { $count } identifiants enregistrés
}
settings-passwords-forget = Oublier
settings-passwords-forget-title = Oublier les données enregistrées par { $app } ?
settings-passwords-forget-description = { $app } perdra les identifiants conservés ici ; vous devrez peut-être vous y reconnecter.

## Passwords and keys: recent access

settings-passwords-history = Accès récents
settings-passwords-history-read = { $app } a utilisé « { $item } »
settings-passwords-history-read-unnamed = { $app } a utilisé un mot de passe enregistré
settings-passwords-history-saved = { $app } a enregistré « { $item } »
settings-passwords-history-saved-unnamed = { $app } a enregistré un mot de passe
settings-passwords-history-deleted = { $app } a supprimé « { $item } »
settings-passwords-history-deleted-unnamed = { $app } a supprimé un mot de passe enregistré
settings-passwords-history-denied = Accès à « { $item } » refusé pour { $app }
settings-passwords-history-denied-unnamed = Accès à un mot de passe enregistré refusé pour { $app }
settings-passwords-history-signed = { $app } a signé avec « { $item } »
settings-passwords-history-signed-unnamed = { $app } a signé avec un mot de passe enregistré
settings-passwords-history-fewer = Afficher moins
settings-passwords-history-all = { $count ->
    [one] Afficher les { $count }
   *[other] Afficher les { $count }
}
settings-passwords-history-clear = Effacer l’historique
settings-passwords-history-clear-description = Oublier quelles applications ont utilisé votre trousseau et quand
settings-passwords-history-clear-button = Effacer
settings-passwords-history-clear-title = Effacer les accès récents ?
settings-passwords-history-clear-confirm = La liste des applications ayant utilisé votre trousseau, avec les dates, sera effacée. Vos mots de passe et clés enregistrés ne changent pas.

## Passwords and keys: SSH keys

settings-passwords-ssh = Clés SSH
settings-passwords-ssh-description = Clés pour se connecter à des serveurs, conservées en sécurité dans votre trousseau.
settings-passwords-ssh-unnamed = Clé sans nom
settings-passwords-ssh-in-chip = Conservée dans la puce de sécurité
settings-passwords-ssh-added = Ajoutée { $when }
settings-passwords-ssh-copy = Copier la clé publique de { $name }
settings-passwords-ssh-remove = Supprimer { $name }
settings-passwords-ssh-confirm = Demander avant chaque utilisation
settings-passwords-ssh-confirm-label = Demander avant chaque utilisation de { $name }
settings-passwords-ssh-add-row = Ajouter une clé
settings-passwords-ssh-use = Utiliser ces clés avec SSH
settings-passwords-ssh-use-description = Copiez la ligne qui indique à SSH où les trouver
settings-passwords-ssh-copy-line = Copier { $line }
settings-passwords-ssh-remove-title = Supprimer « { $name } » ?
settings-passwords-ssh-remove-chip = Elle n’existe que dans la puce de sécurité de cet ordinateur et sera donc perdue définitivement. Les serveurs qui n’acceptent que cette clé ne vous laisseront plus vous connecter avec.
settings-passwords-ssh-remove-description = Les serveurs qui n’acceptent que cette clé ne vous laisseront plus vous connecter avec. Cette action est irréversible.
settings-passwords-ssh-add-title = Ajouter une clé SSH
settings-passwords-ssh-add-description = Une nouvelle clé est créée sur cet ordinateur. Copiez sa clé publique sur les serveurs auxquels vous voulez vous connecter.
settings-passwords-ssh-name = Nom
settings-passwords-ssh-name-placeholder = Par exemple, portable du travail
settings-passwords-ssh-chip = La conserver dans la puce de sécurité
settings-passwords-ssh-chip-description = Elle ne pourra jamais être copiée hors de cet ordinateur, pas même par vous
settings-passwords-ssh-chip-unsupported = La puce de sécurité de cet ordinateur ne peut pas contenir de clés SSH
settings-passwords-ssh-add = Ajouter la clé

## Passkeys

settings-passkeys-title = Clés d’accès
settings-passkeys-unavailable = Déverrouillez votre trousseau pour afficher vos clés d’accès.
settings-passkeys-chip-fingerprint = Scellées par la puce de sécurité de cet ordinateur. Chaque connexion demande votre empreinte digitale ou votre mot de passe.
settings-passkeys-chip-password = Scellées par la puce de sécurité de cet ordinateur. Chaque connexion demande votre mot de passe.
settings-passkeys-password-fingerprint = Chiffrées avec votre mot de passe. Chaque connexion demande votre empreinte digitale ou votre mot de passe.
settings-passkeys-password = Chiffrées avec votre mot de passe. Chaque connexion demande votre mot de passe.
settings-passkeys-last-used = Dernière utilisation : { $when }
settings-passkeys-never-used = Jamais utilisée
settings-passkeys-password-only = Protégée par votre mot de passe
settings-passkeys-unreachable = Les navigateurs n’ont pas accès à vos clés d’accès
settings-passkeys-unreachable-description = Elles seront de nouveau disponibles dès que le service des clés d’accès sera lancé
settings-passkeys-rename-label = Renommer la clé d’accès de { $site }
settings-passkeys-remove-label = Supprimer la clé d’accès de { $site }
settings-passkeys-empty = Aucune clé d’accès pour l’instant
settings-passkeys-empty-description = Celles que créent les sites sont enregistrées ici pour tous les navigateurs
settings-passkeys-remove-title = Supprimer cette clé d’accès ?
settings-passkeys-remove-description = Vous ne pourrez plus vous connecter à { $site } avec elle : assurez-vous d’avoir un autre moyen d’accès.
settings-passkeys-rename-title = Renommer la clé d’accès
settings-passkeys-rename-description = Donnez à votre clé d’accès pour { $site } un nom que vous reconnaîtrez.
settings-passkeys-name = Nom
settings-passkeys-save = Enregistrer

## Apps

settings-apps-defaults = Applications par défaut
settings-apps-defaults-description = Utilisées pour ouvrir les liens, les fichiers et les dossiers
settings-apps-browser = Navigateur web
settings-apps-email = E-mail
settings-apps-calendar = Calendrier
settings-apps-music = Musique
settings-apps-videos = Vidéos
settings-apps-photos = Photos
settings-apps-text-editor = Éditeur de texte
settings-apps-files = Fichiers
settings-apps-choose = Choisir
settings-apps-startup = Démarrage
settings-apps-startup-description = Ces applications s’ouvrent quand vous vous connectez
settings-apps-startup-app = Ouvrir { $app } à la connexion
settings-apps-startup-add = Ajouter une application
settings-apps-startup-add-title = Ajouter une application au démarrage
settings-apps-startup-add-description = Choisissez une application à ouvrir à chaque connexion.
settings-apps-search = Rechercher des applications
settings-apps-no-match = Aucune application ne correspond à votre recherche
settings-apps-cancel = Annuler
