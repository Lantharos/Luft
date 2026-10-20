### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Enregistrer
settings-network-saving = Enregistrement…
settings-network-cancel = Annuler
settings-network-connect = Se connecter
settings-network-disconnect = Se déconnecter
settings-network-optional = Facultatif
settings-network-automatic = Automatique
settings-network-name = Nom
settings-network-password = Mot de passe
settings-network-password-saved = Mot de passe enregistré
settings-network-username = Nom d’utilisateur
settings-network-router = Routeur
settings-network-dns-servers = Serveurs DNS
settings-network-private-key = Clé privée
settings-network-connection-settings = Paramètres de la connexion
settings-network-connect-failed = Connexion impossible

## Network: connection states

settings-network-link-connected = Connecté
settings-network-link-connecting = Connexion…
settings-network-link-disconnected = Non connecté
settings-network-link-unplugged = Câble débranché

## Network: Wi‑Fi security types

settings-network-security-open = Aucune
settings-network-security-owe = Ouvert amélioré
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personnel
settings-network-security-sae = WPA3 Personnel
settings-network-security-enterprise = Entreprise

## Network: signal and radio details

settings-network-signal-excellent = Excellent
settings-network-signal-good = Bon
settings-network-signal-fair = Moyen
settings-network-signal-weak = Faible
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · canal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Bande
settings-network-detail-speed = Vitesse de liaison
settings-network-detail-access-point = Point d’accès
settings-network-detail-security = Sécurité
settings-network-detail-ipv4 = Adresse IP
settings-network-detail-ipv6 = Adresse IPv6
settings-network-detail-router = Routeur
settings-network-detail-dns = DNS
settings-network-detail-mac = Adresse matérielle

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Désactivé par un interrupteur matériel
settings-network-wifi-connected = Connecté à { $network }
settings-network-airplane = Mode avion
    .description = Désactive toutes les connexions sans fil
settings-network-airplane-hardware = Activé par un interrupteur matériel
settings-network-known = Réseaux connus
    .description = Réseaux auxquels cet ordinateur s’est déjà connecté, à portée ou non
settings-network-known-count = { $count ->
        [one] { $count } réseau enregistré
       *[other] { $count } réseaux enregistrés
    }
settings-network-known-in-range = À portée
settings-network-wired = Filaire
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Connecté · { $speed }
settings-network-empty = Aucune connexion réseau
    .description = Branchez un câble réseau ou un adaptateur Wi‑Fi pour vous connecter à Internet
settings-network-proxy = Proxy
    .description = Fait passer le trafic web par un autre serveur, souvent nécessaire sur les réseaux professionnels ou scolaires.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Réseaux Wi‑Fi
settings-network-wifi-saved = Enregistré
settings-network-wifi-enterprise = Connexion avec un compte professionnel ou scolaire
settings-network-wifi-connect-failed = Impossible de se connecter à ce réseau
settings-network-wifi-saved-password-failed = Le mot de passe enregistré n’a pas fonctionné. Saisissez-le de nouveau.
settings-network-wifi-settings = Paramètres du réseau
settings-network-wifi-searching = Recherche de réseaux…
settings-network-hidden = Se connecter à un réseau masqué
    .description = Saisissez le nom du réseau et son type de sécurité.
settings-network-hidden-name = Nom du réseau

## Network: joining a Wi‑Fi network

settings-network-join = Se connecter à « { $network } »
settings-network-join-enterprise = Connectez-vous avec votre compte professionnel ou scolaire.
settings-network-join-password = Saisissez le mot de passe de ce réseau.
settings-network-join-failed = Impossible de se connecter à ce réseau.
settings-network-join-sign-in-failed = Connexion impossible. Vérifiez votre nom d’utilisateur et votre mot de passe.
settings-network-join-wrong-password = Ce mot de passe n’a pas fonctionné. Vérifiez-le et réessayez.

## Network: connection settings page

settings-network-forget = Oublier ce réseau
    .description = Supprime son mot de passe et ses paramètres de cet ordinateur
    .button = Oublier
settings-network-remove-vpn = Supprimer ce VPN
settings-network-remove-connection = Supprimer cette connexion
settings-network-remove-description = Supprime ses paramètres de cet ordinateur
settings-network-remove = Supprimer

settings-network-general = Général
settings-network-autoconnect = Connexion automatique
settings-network-autoconnect-wifi = Dès que ce réseau est à portée
settings-network-autoconnect-wired = Dès qu’un câble est branché
settings-network-autoconnect-vpn = Dès que cet ordinateur est en ligne
settings-network-autoconnect-other = Dès qu’elle est disponible
settings-network-all-users = Disponible pour tous
    .description = Toute personne qui se connecte sur cet ordinateur peut l’utiliser
settings-network-metered = Connexion limitée
    .description = Les applications et les mises à jour évitent les gros téléchargements
settings-network-metered-automatic = Détection automatique
settings-network-metered-yes = Limitée
settings-network-metered-no = Non limitée

settings-network-security = Sécurité
settings-network-security-type = Type de sécurité

settings-network-advanced = Avancé
settings-network-private-address = Adresse privée
    .description = Rend cet ordinateur plus difficile à suivre sur ce réseau
settings-network-hardware-address = Adresse matérielle
    .description = L’adresse que cet ordinateur présente au réseau
settings-network-mac-random = Nouvelle adresse à chaque fois
settings-network-mac-stable = Même adresse pour ce réseau
settings-network-mac-private-off = Désactivée
settings-network-mac-builtin = Adresse intégrée
settings-network-mac-custom = Adresse personnalisée
settings-network-mtu = Taille maximale des paquets (MTU)
    .description = Laissez vide, sauf si votre réseau exige une taille précise
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Méthode
    .label = Méthode { $family }
settings-network-ip-dhcp = Automatique, adresses uniquement
settings-network-ip-manual = Manuelle
settings-network-ip-link-local = Lien local uniquement
settings-network-ip-shared = Partagée avec d’autres appareils
settings-network-ip-ignore = Non gérée
settings-network-ip-disabled = Désactivée
settings-network-ip-addresses = Adresses
    .description = Chacune avec son préfixe, par exemple { $example }
settings-network-ip-address = Adresse { $number }
settings-network-ip-remove-address = Retirer l’adresse
settings-network-ip-add-address = Ajouter une adresse
settings-network-ip-router = Routeur { $family }
settings-network-ip-automatic-dns = DNS automatique
    .description = Utiliser les serveurs DNS proposés par ce réseau
settings-network-ip-dns-first = Utilisés avant ceux proposés par le réseau
settings-network-ip-dns-separate = Séparez les adresses par des virgules
settings-network-ip-dns-servers = Serveurs DNS { $family }
settings-network-ip-search-domains = Domaines de recherche
    .description = Essayés quand un nom n’a pas de domaine, par exemple « imprimante »
    .label = Domaines de recherche { $family }
settings-network-ip-automatic-routes = Routes automatiques
    .description = Utiliser les routes proposées par ce réseau
settings-network-ip-routes = Routes
    .description = Faire passer le trafic de certains réseaux par un autre routeur
settings-network-ip-add-route = Ajouter une route
settings-network-route-network = Réseau
settings-network-route-priority = Priorité
settings-network-route-remove = Retirer la route

## Network: work or school (802.1X) sign-in

settings-network-eap = Authentification
settings-network-eap-peap = EAP protégé (PEAP)
settings-network-eap-ttls = TLS tunnelisé (TTLS)
settings-network-eap-tls = Certificat (TLS)
settings-network-eap-inner = Authentification interne
settings-network-client-certificate = Votre certificat
settings-network-private-key-password = Mot de passe de la clé privée
    .placeholder = Si la clé en a un
settings-network-anonymous-identity = Identité anonyme
    .description = Laissez vide, sauf si votre réseau la demande
settings-network-ca = Certificat CA
    .description = Confirme que vous vous connectez au bon réseau
settings-network-ca-system = Utiliser les certificats du système
settings-network-ca-file = Choisir un fichier…
settings-network-ca-another-file = Choisir un autre fichier…
settings-network-ca-none = Ne pas vérifier
settings-network-choose-file = Choisir…
settings-network-server-domain = Domaine du serveur
    .description = Se connecter uniquement aux serveurs de ce domaine

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Saisissez un nom
settings-network-error-no-addresses = Ajoutez au moins une adresse
settings-network-error-address = Saisissez une adresse avec son préfixe, par exemple { $example }
settings-network-error-router = Saisissez l’adresse d’un routeur, par exemple { $example }
settings-network-error-dns = « { $address } » n’est pas une adresse valide
settings-network-error-search-domain = « { $domain } » n’est pas un domaine valide
settings-network-error-route = Saisissez un réseau, par exemple { $example }
settings-network-error-priority = La priorité doit être un nombre entier
settings-network-error-username = Saisissez votre nom d’utilisateur
settings-network-error-domain = Saisissez un domaine, par exemple example.com
settings-network-error-certificate = Choisissez votre certificat
settings-network-error-private-key = Choisissez votre clé privée
settings-network-error-mtu = Saisissez un nombre de { $lowest } à { $highest }, ou laissez le champ vide
settings-network-error-mac = Saisissez une adresse, par exemple 12:34:56:78:9A:BC
settings-network-error-password = Saisissez votre mot de passe
settings-network-error-password-length = { $count ->
        [one] Utilisez au moins { $count } caractère
       *[other] Utilisez au moins { $count } caractères
    }

## Network: proxy

settings-network-proxy-off = Désactivé
settings-network-proxy-manual = Manuel
settings-network-proxy-url = Adresse de configuration
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web sécurisé (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Serveur
    .label = Serveur { $protocol }
settings-network-proxy-port = Port
    .label = Port { $protocol }
settings-network-proxy-skip = Ne pas utiliser le proxy pour
settings-network-proxy-error-url = Saisissez une adresse web, par exemple http://example.com/proxy.pac
settings-network-proxy-error-host = Saisissez uniquement le nom du serveur, par exemple proxy.example.com
settings-network-proxy-error-port = Saisissez un port de 1 à 65535
settings-network-proxy-save-failed = Impossible d’enregistrer les paramètres du proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importer depuis un fichier
    .description = Fichiers de configuration WireGuard, OpenVPN et d’autres VPN
settings-network-vpn-importing = Importation…
settings-network-wireguard = Configurer WireGuard
    .description = Saisissez les informations fournies par votre fournisseur de VPN ou votre serveur
settings-network-wireguard-dialog = Votre fournisseur de VPN ou le propriétaire du serveur peut vous donner ces informations.
settings-network-wireguard-name-example = VPN de la maison
settings-network-wireguard-public-key = Clé publique { $key }
settings-network-wireguard-public-key-pending = Sa clé publique apparaîtra ici, prête à être partagée
settings-network-wireguard-copy = Copier la clé publique
settings-network-wireguard-copied = Copiée
settings-network-wireguard-generate = Générer une nouvelle clé
settings-network-wireguard-addresses = Adresses de cet ordinateur dans le VPN
settings-network-wireguard-server-key = Clé publique du serveur
settings-network-wireguard-endpoint = Adresse du serveur
settings-network-wireguard-allowed-ips = IP autorisées
    .description = Le trafic vers ces plages passe par le VPN
settings-network-wireguard-preshared-key = Clé prépartagée
settings-network-wireguard-keepalive = Keepalive
    .description = Aide la connexion à rester active derrière un routeur
    .placeholder = Facultatif, en secondes
settings-network-wireguard-add = Ajouter
settings-network-wireguard-adding = Ajout…
settings-network-wireguard-error-private-key = Saisissez ou générez une clé privée
settings-network-wireguard-error-addresses = Saisissez au moins une adresse
settings-network-wireguard-error-server-key = Saisissez la clé publique du serveur
settings-network-wireguard-error-endpoint = Saisissez l’adresse et le port du serveur
settings-network-wireguard-error-allowed-ips = Saisissez au moins une plage
settings-network-wireguard-error-keepalive = Saisissez un nombre de secondes

## Bluetooth panel

settings-bluetooth-hardware-off = Désactivé par un interrupteur matériel
settings-bluetooth-power-on-failed = Impossible d’activer le Bluetooth
settings-bluetooth-power-off-failed = Impossible de désactiver le Bluetooth
settings-bluetooth-visible = Visible par les appareils à proximité
    .description = Permet aux téléphones et aux ordinateurs de trouver celui-ci
settings-bluetooth-visible-as = Visible sous le nom « { $name } »
settings-bluetooth-visible-duration = Durée de visibilité
settings-bluetooth-visible-for = { $minutes ->
        [one] Pendant { $minutes } minute
       *[other] Pendant { $minutes } minutes
    }
settings-bluetooth-visible-until-off = Jusqu’à la désactivation
settings-bluetooth-visible-failed = Impossible de modifier la visibilité de cet ordinateur
settings-bluetooth-paired = Mes appareils
settings-bluetooth-nearby = Appareils à proximité
settings-bluetooth-searching = Recherche d’appareils…
    .description = Mettez l’appareil à ajouter en mode d’association
settings-bluetooth-blocked = Le Bluetooth est désactivé par un interrupteur matériel
    .description = Utilisez l’interrupteur ou la touche de votre ordinateur pour l’activer
settings-bluetooth-details = Détails de l’appareil
settings-bluetooth-connected = Connecté
settings-bluetooth-connected-battery = Connecté · batterie { $battery }
settings-bluetooth-connecting = Connexion…
settings-bluetooth-disconnecting = Déconnexion…
settings-bluetooth-pairing = Association…
settings-bluetooth-forget-confirm = Oublier « { $name } » ?
    .description = Vous devrez l’associer de nouveau pour l’utiliser avec cet ordinateur.
settings-bluetooth-forget = Oublier
settings-bluetooth-cancel = Annuler
settings-bluetooth-connect = Connecter
settings-bluetooth-disconnect = Déconnecter
settings-bluetooth-done = Terminé

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Batterie
settings-bluetooth-address = Adresse
settings-bluetooth-autoconnect = Connexion automatique
    .description = Dès qu’il est à proximité
settings-bluetooth-kind-headphones = Casque
settings-bluetooth-kind-speaker = Haut-parleur
settings-bluetooth-kind-mouse = Souris
settings-bluetooth-kind-keyboard = Clavier
settings-bluetooth-kind-gamepad = Manette de jeu
settings-bluetooth-kind-phone = Téléphone
settings-bluetooth-kind-computer = Ordinateur
settings-bluetooth-kind-tablet = Tablette
settings-bluetooth-kind-display = Écran
settings-bluetooth-kind-printer = Imprimante
settings-bluetooth-kind-camera = Caméra
settings-bluetooth-kind-other = Autre appareil

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = l’appareil
settings-bluetooth-request-confirm = Associer à { $name } ?
    .description = Vérifiez que { $name } affiche le même code.
settings-bluetooth-request-authorize = Autoriser { $name } à s’associer ?
    .description = Après l’association, { $name } pourra se connecter à cet ordinateur.
settings-bluetooth-request-pin = Saisissez le code PIN de { $name }
    .description = C’est souvent 0000 ou 1234. Sinon, consultez le manuel de l’appareil.
settings-bluetooth-request-passkey = Saisissez le code affiché sur { $name }
    .description = Tapez les six chiffres exactement comme ils apparaissent.
settings-bluetooth-request-display = Associer à { $name }
    .description = Tapez ce code sur { $name }, puis appuyez sur Entrée.
settings-bluetooth-pair = Associer
settings-bluetooth-allow = Autoriser

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Récupérer vos appareils depuis Windows
    .description = { $count ->
        [one] Windows a déjà associé { $devices }. Vous pouvez l’utiliser ici sans l’associer de nouveau.
       *[other] Windows a déjà associé { $devices }. Vous pouvez les utiliser ici sans les associer de nouveau.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } autre
       *[other] { $count } autres
    }

## Accounts panel

settings-accounts-unavailable = Comptes indisponibles
    .description = Le service de comptes n’est pas installé sur cet ordinateur
settings-accounts-online = Comptes en ligne
    .description = Chaque compte est un dossier dans Cloud, dans votre dossier personnel, que toutes les applications peuvent ouvrir. Les fichiers sont téléchargés quand vous les ouvrez.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud ou WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Reconnectez-vous pour continuer à l’utiliser
settings-accounts-paused-metered = Synchronisation suspendue sur une connexion limitée
settings-accounts-paused-battery = Synchronisation suspendue, batterie faible
settings-accounts-connecting = Connexion…
settings-accounts-offline = Hors ligne
settings-accounts-offline-kept = Hors ligne, les fichiers conservés restent disponibles
settings-accounts-not-connected = Non connecté
settings-accounts-syncing = { $count ->
        [one] Synchronisation de { $count } modification
       *[other] Synchronisation de { $count } modifications
    }
settings-accounts-name = Nom
settings-accounts-folder = Dossier
settings-accounts-server = Serveur
settings-accounts-storage = Stockage
settings-accounts-storage-used = { $used } utilisés sur { $total }
settings-accounts-on-device = Sur cet appareil
settings-accounts-kept = { $count ->
        [one] { $count } élément conservé, le reste est téléchargé à l’ouverture
       *[other] { $count } éléments conservés, le reste est téléchargé à l’ouverture
    }
settings-accounts-on-demand = Les fichiers sont téléchargés quand vous les ouvrez
settings-accounts-sign-in-again = Se reconnecter
settings-accounts-keep = Conserver
settings-accounts-remove = Retirer
settings-accounts-remove-confirm = Retirer de cet ordinateur
settings-accounts-removing = Retrait…
settings-accounts-remove-note = Vos fichiers restent dans { $provider }. Les modifications faites ici sont d’abord envoyées.

## Accounts: providers

settings-accounts-provider-icloud = Votre compte Apple, confirmé par un code reçu sur votre iPhone, iPad ou Mac
settings-accounts-provider-onedrive = Un compte Microsoft personnel, professionnel ou scolaire, dans votre navigateur
settings-accounts-provider-dropbox = Un compte Dropbox, dans votre navigateur
settings-accounts-provider-nextcloud = Votre serveur ou celui de votre organisation
settings-accounts-provider-webdav = Tout serveur compatible WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Se reconnecter à { $account }
settings-accounts-browser = Votre navigateur s’ouvre pour vous connecter avec { $provider }. Luft ne voit jamais votre mot de passe.
settings-accounts-password-for = Saisissez le mot de passe pour { $user }.
settings-accounts-apple-account = Compte Apple
settings-accounts-password = Mot de passe
settings-accounts-app-password = Mot de passe d’application
settings-accounts-user = Nom d’utilisateur
settings-accounts-apple-note = Utilisez le mot de passe de votre compte Apple. Les mots de passe d’application ne fonctionnent pas ici. Apple affiche ensuite un code sur votre iPhone, iPad ou Mac.
settings-accounts-nextcloud-browser = Votre navigateur s’ouvre pour vous connecter à votre serveur et autoriser Luft.
settings-accounts-use-app-password = Utiliser plutôt un mot de passe d’application
settings-accounts-error-server = Saisissez l’adresse du serveur
settings-accounts-error-apple-account = Saisissez l’adresse e-mail de votre compte Apple
settings-accounts-error-user = Saisissez le nom d’utilisateur
settings-accounts-error-password = Saisissez le mot de passe
settings-accounts-cancel = Annuler
settings-accounts-back = Retour
settings-accounts-continue-in-browser = Continuer dans le navigateur
settings-accounts-sign-in = Se connecter
settings-accounts-try-again = Réessayer
settings-accounts-continue = Continuer
settings-accounts-working = Communication avec { $provider }…
settings-accounts-finish-in-browser = Terminez la connexion à { $provider } dans votre navigateur. Luft ne voit jamais votre mot de passe, et cet écran se met à jour automatiquement une fois la connexion terminée.
settings-accounts-no-browser = Aucun navigateur ne s’est ouvert. Copiez le lien et ouvrez-le dans un navigateur.
settings-accounts-open-again = Rouvrir la page
settings-accounts-copy-link = Copier le lien
settings-accounts-copied = Copié
settings-accounts-code = Code de validation
    .placeholder = Code à 6 chiffres
settings-accounts-text-me = Recevoir plutôt un code par SMS
settings-accounts-choose-phone = À quel numéro Apple doit-il envoyer le code ?
    .description = Envoyer un SMS
settings-accounts-approve = Votre compte Apple utilise la protection avancée des données. Approuvez la demande sur votre iPhone, iPad ou Mac pour permettre à cet ordinateur d’ouvrir iCloud Drive.
