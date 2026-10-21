### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Speichern
settings-network-saving = Wird gespeichert …
settings-network-cancel = Abbrechen
settings-network-connect = Verbinden
settings-network-disconnect = Trennen
settings-network-optional = Optional
settings-network-automatic = Automatisch
settings-network-name = Name
settings-network-password = Passwort
settings-network-password-saved = Gespeichertes Passwort
settings-network-username = Benutzername
settings-network-router = Router
settings-network-dns-servers = DNS-Server
settings-network-private-key = Privater Schlüssel
settings-network-connection-settings = Verbindungseinstellungen
settings-network-connect-failed = Verbindung fehlgeschlagen

## Network: connection states

settings-network-link-connected = Verbunden
settings-network-link-connecting = Wird verbunden …
settings-network-link-disconnected = Nicht verbunden
settings-network-link-unplugged = Kabel nicht eingesteckt

## Network: Wi‑Fi security types

settings-network-security-open = Keine
settings-network-security-owe = Enhanced Open
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Ausgezeichnet
settings-network-signal-good = Gut
settings-network-signal-fair = Mittel
settings-network-signal-weak = Schwach
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Kanal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Frequenzband
settings-network-detail-speed = Verbindungsgeschwindigkeit
settings-network-detail-access-point = Zugangspunkt
settings-network-detail-security = Sicherheit
settings-network-detail-ipv4 = IP-Adresse
settings-network-detail-ipv6 = IPv6-Adresse
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardwareadresse

## Network panel

settings-network-wifi = WLAN
settings-network-wifi-hardware-off = Mit einem Hardwareschalter ausgeschaltet
settings-network-wifi-connected = Verbunden mit { $network }
settings-network-airplane = Flugzeugmodus
    .description = Schaltet alle drahtlosen Verbindungen aus
settings-network-airplane-hardware = Mit einem Hardwareschalter eingeschaltet
settings-network-known = Bekannte Netzwerke
    .description = Netzwerke, mit denen dieser Computer schon verbunden war, ob in der Nähe oder nicht
settings-network-known-count = { $count ->
        [one] { $count } gespeichertes Netzwerk
       *[other] { $count } gespeicherte Netzwerke
    }
settings-network-known-in-range = In Reichweite
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Verbunden · { $speed }
settings-network-empty = Keine Netzwerkverbindungen
    .description = Steck ein Netzwerkkabel oder einen WLAN-Adapter ein, um online zu gehen
settings-network-proxy = Proxy
    .description = Leitet den Webverkehr über einen anderen Server, oft nötig in Firmen- oder Schulnetzwerken.

## Network: Wi‑Fi networks

settings-network-wifi-networks = WLAN-Netzwerke
settings-network-wifi-saved = Gespeichert
settings-network-wifi-enterprise = Mit Arbeits- oder Schulkonto anmelden
settings-network-wifi-connect-failed = Verbindung mit diesem Netzwerk fehlgeschlagen
settings-network-wifi-saved-password-failed = Das gespeicherte Passwort hat nicht funktioniert. Gib es noch einmal ein.
settings-network-wifi-settings = Netzwerkeinstellungen
settings-network-wifi-searching = Netzwerke werden gesucht …
settings-network-hidden = Mit verborgenem Netzwerk verbinden
    .description = Gib den Namen des Netzwerks und seine Sicherheit ein.
settings-network-hidden-name = Netzwerkname

## Network: joining a Wi‑Fi network

settings-network-join = Mit „{ $network }“ verbinden
settings-network-join-enterprise = Melde dich mit deinem Arbeits- oder Schulkonto an.
settings-network-join-password = Gib das Passwort für dieses Netzwerk ein.
settings-network-join-failed = Verbindung mit diesem Netzwerk fehlgeschlagen.
settings-network-join-sign-in-failed = Anmeldung fehlgeschlagen. Prüf deinen Benutzernamen und dein Passwort.
settings-network-join-wrong-password = Das Passwort hat nicht funktioniert. Prüf es und versuch es noch einmal.

## Network: connection settings page

settings-network-forget = Dieses Netzwerk entfernen
    .description = Löscht sein Passwort und seine Einstellungen von diesem Computer
    .button = Entfernen
settings-network-remove-vpn = Dieses VPN entfernen
settings-network-remove-connection = Diese Verbindung entfernen
settings-network-remove-description = Löscht ihre Einstellungen von diesem Computer
settings-network-remove = Entfernen

settings-network-general = Allgemein
settings-network-autoconnect = Automatisch verbinden
settings-network-autoconnect-wifi = Verbinden, sobald das Netzwerk in Reichweite ist
settings-network-autoconnect-wired = Verbinden, sobald ein Kabel eingesteckt wird
settings-network-autoconnect-vpn = Verbinden, sobald dieser Computer online ist
settings-network-autoconnect-other = Verbinden, sobald sie verfügbar ist
settings-network-all-users = Für alle verfügbar
    .description = Alle, die sich hier anmelden, können sie nutzen
settings-network-metered = Getaktete Verbindung
    .description = Apps und Updates halten sich mit großen Downloads zurück
settings-network-metered-automatic = Automatisch erkennen
settings-network-metered-yes = Getaktet
settings-network-metered-no = Nicht getaktet

settings-network-security = Sicherheit
settings-network-security-type = Sicherheitstyp

settings-network-advanced = Erweitert
settings-network-private-address = Private Adresse
    .description = Erschwert es, diesen Computer in diesem Netzwerk zu verfolgen
settings-network-hardware-address = Hardwareadresse
    .description = Die Adresse, die dieser Computer dem Netzwerk zeigt
settings-network-mac-random = Jedes Mal eine neue Adresse
settings-network-mac-stable = Gleiche Adresse für dieses Netzwerk
settings-network-mac-private-off = Aus
settings-network-mac-builtin = Eingebaute Adresse
settings-network-mac-custom = Eigene Adresse
settings-network-mtu = Maximale Paketgröße (MTU)
    .description = Leer lassen, außer dein Netzwerk braucht eine bestimmte Größe
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Methode
    .label = { $family }-Methode
settings-network-ip-dhcp = Automatisch, nur Adressen
settings-network-ip-manual = Manuell
settings-network-ip-link-local = Nur Link-Local
settings-network-ip-shared = Mit anderen Geräten geteilt
settings-network-ip-ignore = Nicht verwaltet
settings-network-ip-disabled = Aus
settings-network-ip-addresses = Adressen
    .description = Jeweils mit Präfix, etwa { $example }
settings-network-ip-address = Adresse { $number }
settings-network-ip-remove-address = Adresse entfernen
settings-network-ip-add-address = Adresse hinzufügen
settings-network-ip-router = { $family }-Router
settings-network-ip-automatic-dns = Automatisches DNS
    .description = Die DNS-Server verwenden, die dieses Netzwerk vorschlägt
settings-network-ip-dns-first = Werden vor den vorgeschlagenen verwendet
settings-network-ip-dns-separate = Adressen mit Kommas trennen
settings-network-ip-dns-servers = { $family }-DNS-Server
settings-network-ip-search-domains = Suchdomänen
    .description = Werden ausprobiert, wenn ein Name keine Domäne hat, etwa „drucker“
    .label = { $family }-Suchdomänen
settings-network-ip-automatic-routes = Automatische Routen
    .description = Die Routen verwenden, die dieses Netzwerk vorschlägt
settings-network-ip-routes = Routen
    .description = Verkehr für bestimmte Netzwerke über einen anderen Router leiten
settings-network-ip-add-route = Route hinzufügen
settings-network-route-network = Netzwerk
settings-network-route-priority = Priorität
settings-network-route-remove = Route entfernen

## Network: work or school (802.1X) sign-in

settings-network-eap = Authentifizierung
settings-network-eap-peap = Protected EAP (PEAP)
settings-network-eap-ttls = Tunneled TLS (TTLS)
settings-network-eap-tls = Zertifikat (TLS)
settings-network-eap-inner = Innere Authentifizierung
settings-network-client-certificate = Dein Zertifikat
settings-network-private-key-password = Passwort des privaten Schlüssels
    .placeholder = Falls der Schlüssel eins hat
settings-network-anonymous-identity = Anonyme Identität
    .description = Leer lassen, außer dein Netzwerk verlangt sie
settings-network-ca = CA-Zertifikat
    .description = Stellt sicher, dass du dich mit dem echten Netzwerk verbindest
settings-network-ca-system = Systemzertifikate verwenden
settings-network-ca-file = Datei auswählen …
settings-network-ca-another-file = Andere Datei auswählen …
settings-network-ca-none = Nicht prüfen
settings-network-choose-file = Auswählen …
settings-network-server-domain = Serverdomäne
    .description = Nur mit Servern in dieser Domäne verbinden

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Gib einen Namen ein
settings-network-error-no-addresses = Füg mindestens eine Adresse hinzu
settings-network-error-address = Gib eine Adresse mit Präfix ein, etwa { $example }
settings-network-error-router = Gib eine Routeradresse ein, etwa { $example }
settings-network-error-dns = „{ $address }“ ist keine gültige Adresse
settings-network-error-search-domain = „{ $domain }“ ist keine gültige Domäne
settings-network-error-route = Gib ein Netzwerk ein, etwa { $example }
settings-network-error-priority = Verwende eine ganze Zahl für die Priorität
settings-network-error-username = Gib deinen Benutzernamen ein
settings-network-error-domain = Gib eine Domäne ein, etwa example.com
settings-network-error-certificate = Wähl dein Zertifikat aus
settings-network-error-private-key = Wähl deinen privaten Schlüssel aus
settings-network-error-mtu = Verwende eine Zahl von { $lowest } bis { $highest } oder lass das Feld leer
settings-network-error-mac = Gib eine Adresse wie 12:34:56:78:9A:BC ein
settings-network-error-password = Gib dein Passwort ein
settings-network-error-password-length = { $count ->
        [one] Verwende mindestens { $count } Zeichen
       *[other] Verwende mindestens { $count } Zeichen
    }

## Network: proxy

settings-network-proxy-off = Aus
settings-network-proxy-manual = Manuell
settings-network-proxy-url = Konfigurationsadresse
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Sicheres Web (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Server
    .label = { $protocol }-Server
settings-network-proxy-port = Port
    .label = { $protocol }-Port
settings-network-proxy-skip = Proxy nicht verwenden für
settings-network-proxy-error-url = Gib eine Webadresse ein, etwa http://example.com/proxy.pac
settings-network-proxy-error-host = Gib nur den Servernamen ein, etwa proxy.example.com
settings-network-proxy-error-port = Verwende einen Port von 1 bis 65535
settings-network-proxy-save-failed = Die Proxy-Einstellungen konnten nicht gespeichert werden

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Aus Datei importieren
    .description = WireGuard-, OpenVPN- und andere VPN-Konfigurationsdateien
settings-network-vpn-importing = Wird importiert …
settings-network-wireguard = WireGuard einrichten
    .description = Gib die Daten von deinem VPN-Anbieter oder Server ein
settings-network-wireguard-dialog = Diese Daten bekommst du von deinem VPN-Anbieter oder von der Person, die den Server betreibt.
settings-network-wireguard-name-example = VPN zu Hause
settings-network-wireguard-public-key = Öffentlicher Schlüssel { $key }
settings-network-wireguard-public-key-pending = Hier erscheint der öffentliche Schlüssel zum Weitergeben
settings-network-wireguard-copy = Öffentlichen Schlüssel kopieren
settings-network-wireguard-copied = Kopiert
settings-network-wireguard-generate = Neuen Schlüssel erzeugen
settings-network-wireguard-addresses = Adressen dieses Computers im VPN
settings-network-wireguard-server-key = Öffentlicher Schlüssel des Servers
settings-network-wireguard-endpoint = Serveradresse
settings-network-wireguard-allowed-ips = Zulässige IPs
    .description = Verkehr zu diesen Bereichen läuft über das VPN
settings-network-wireguard-preshared-key = Pre-Shared Key
settings-network-wireguard-keepalive = Keepalive
    .description = Hilft, die Verbindung hinter einem Router aufrechtzuerhalten
    .placeholder = Optional, in Sekunden
settings-network-wireguard-add = Hinzufügen
settings-network-wireguard-adding = Wird hinzugefügt …
settings-network-wireguard-error-private-key = Gib einen privaten Schlüssel ein oder erzeug einen
settings-network-wireguard-error-addresses = Gib mindestens eine Adresse ein
settings-network-wireguard-error-server-key = Gib den öffentlichen Schlüssel des Servers ein
settings-network-wireguard-error-endpoint = Gib die Adresse und den Port des Servers ein
settings-network-wireguard-error-allowed-ips = Gib mindestens einen Bereich ein
settings-network-wireguard-error-keepalive = Gib eine Anzahl Sekunden ein

## Bluetooth panel

settings-bluetooth-hardware-off = Mit einem Hardwareschalter ausgeschaltet
settings-bluetooth-power-on-failed = Bluetooth konnte nicht eingeschaltet werden
settings-bluetooth-power-off-failed = Bluetooth konnte nicht ausgeschaltet werden
settings-bluetooth-visible = Für Geräte in der Nähe sichtbar
    .description = Lässt Smartphones und Computer diesen Computer finden
settings-bluetooth-visible-as = Angezeigt als „{ $name }“
settings-bluetooth-visible-duration = Sichtbar bleiben
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } Minute lang
       *[other] { $minutes } Minuten lang
    }
settings-bluetooth-visible-until-off = Bis zum Ausschalten
settings-bluetooth-visible-failed = Die Sichtbarkeit dieses Computers konnte nicht geändert werden
settings-bluetooth-paired = Meine Geräte
settings-bluetooth-nearby = Geräte in der Nähe
settings-bluetooth-searching = Geräte werden gesucht …
    .description = Versetz das Gerät, das du hinzufügen willst, in den Kopplungsmodus
settings-bluetooth-blocked = Bluetooth ist mit einem Hardwareschalter ausgeschaltet
    .description = Schalt es mit dem Schalter oder der Taste an deinem Computer ein
settings-bluetooth-details = Gerätedetails
settings-bluetooth-connected = Verbunden
settings-bluetooth-connected-battery = Verbunden · Akku { $battery }
settings-bluetooth-connecting = Wird verbunden …
settings-bluetooth-disconnecting = Wird getrennt …
settings-bluetooth-pairing = Wird gekoppelt …
settings-bluetooth-forget-confirm = „{ $name }“ entfernen?
    .description = Du musst es erneut koppeln, um es mit diesem Computer zu verwenden.
settings-bluetooth-forget = Entfernen
settings-bluetooth-cancel = Abbrechen
settings-bluetooth-connect = Verbinden
settings-bluetooth-disconnect = Trennen
settings-bluetooth-done = Fertig

## Bluetooth: device details

settings-bluetooth-type = Typ
settings-bluetooth-battery = Akku
settings-bluetooth-address = Adresse
settings-bluetooth-autoconnect = Automatisch verbinden
    .description = Sobald es in der Nähe ist
settings-bluetooth-kind-headphones = Kopfhörer
settings-bluetooth-kind-speaker = Lautsprecher
settings-bluetooth-kind-mouse = Maus
settings-bluetooth-kind-keyboard = Tastatur
settings-bluetooth-kind-gamepad = Controller
settings-bluetooth-kind-phone = Smartphone
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Bildschirm
settings-bluetooth-kind-printer = Drucker
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Anderes Gerät

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = dem Gerät
settings-bluetooth-request-confirm = Mit { $name } koppeln?
    .description = Prüf, ob auf { $name } derselbe Code angezeigt wird.
settings-bluetooth-request-authorize = Kopplung mit { $name } zulassen?
    .description = Dieser Computer lässt dann Verbindungen von { $name } zu.
settings-bluetooth-request-pin = PIN von { $name } eingeben
    .description = Oft ist es 0000 oder 1234. Wenn beides nicht klappt, steht die PIN in der Anleitung des Geräts.
settings-bluetooth-request-passkey = Code eingeben, der auf { $name } angezeigt wird
    .description = Gib die sechs Ziffern genau so ein, wie sie angezeigt werden.
settings-bluetooth-request-display = Mit { $name } koppeln
    .description = Gib diesen Code auf { $name } ein und drück dann die Eingabetaste.
settings-bluetooth-pair = Koppeln
settings-bluetooth-allow = Zulassen

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Geräte aus Windows übernehmen
    .description = { $count ->
        [one] { $devices } ist in Windows gekoppelt. Verwende es hier, ohne es erneut zu koppeln.
       *[other] { $devices } sind in Windows gekoppelt. Verwende sie hier, ohne sie erneut zu koppeln.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } weiteres
       *[other] { $count } weitere
    }
