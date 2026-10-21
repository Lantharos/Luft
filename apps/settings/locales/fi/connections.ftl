### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Tallenna
settings-network-saving = Tallennetaan…
settings-network-cancel = Peruuta
settings-network-connect = Yhdistä
settings-network-disconnect = Katkaise yhteys
settings-network-optional = Valinnainen
settings-network-automatic = Automaattinen
settings-network-name = Nimi
settings-network-password = Salasana
settings-network-password-saved = Tallennettu salasana
settings-network-username = Käyttäjänimi
settings-network-router = Reititin
settings-network-dns-servers = DNS-palvelimet
settings-network-private-key = Yksityinen avain
settings-network-connection-settings = Yhteyden asetukset
settings-network-connect-failed = Yhteyttä ei voitu muodostaa

## Network: connection states

settings-network-link-connected = Yhdistetty
settings-network-link-connecting = Yhdistetään…
settings-network-link-disconnected = Ei yhdistetty
settings-network-link-unplugged = Kaapeli irrotettu

## Network: Wi‑Fi security types

settings-network-security-open = Ei mitään
settings-network-security-owe = Parannettu avoin
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Yritys

## Network: signal and radio details

settings-network-signal-excellent = Erinomainen
settings-network-signal-good = Hyvä
settings-network-signal-fair = Kohtalainen
settings-network-signal-weak = Heikko
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · kanava { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signaali
settings-network-detail-band = Taajuusalue
settings-network-detail-speed = Yhteysnopeus
settings-network-detail-access-point = Tukiasema
settings-network-detail-security = Suojaus
settings-network-detail-ipv4 = IP-osoite
settings-network-detail-ipv6 = IPv6-osoite
settings-network-detail-router = Reititin
settings-network-detail-dns = DNS
settings-network-detail-mac = Laitteisto-osoite

## Network panel

settings-network-wifi = Wi-Fi
settings-network-wifi-hardware-off = Kytketty pois laitekytkimellä
settings-network-wifi-connected = Yhdistetty verkkoon { $network }
settings-network-airplane = Lentokonetila
    .description = Katkaisee kaikki langattomat yhteydet
settings-network-airplane-hardware = Otettu käyttöön laitekytkimellä
settings-network-known = Tunnetut verkot
    .description = Verkot, joihin tämä tietokone on liittynyt aiemmin, myös kantaman ulkopuolella olevat
settings-network-known-count = { $count ->
        [one] { $count } tallennettu verkko
       *[other] { $count } tallennettua verkkoa
    }
settings-network-known-in-range = Kantaman sisällä
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Yhdistetty · { $speed }
settings-network-empty = Ei verkkoyhteyksiä
    .description = Liitä verkkokaapeli tai Wi-Fi-sovitin, niin pääset verkkoon
settings-network-proxy = Välityspalvelin
    .description = Ohjaa verkkoliikenne toisen palvelimen kautta. Tätä tarvitaan usein työpaikan tai koulun verkoissa.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi-Fi-verkot
settings-network-wifi-saved = Tallennettu
settings-network-wifi-enterprise = Kirjaudu työpaikan tai koulun tilillä
settings-network-wifi-connect-failed = Tähän verkkoon ei voitu yhdistää
settings-network-wifi-saved-password-failed = Tallennettu salasana ei toiminut. Anna se uudelleen.
settings-network-wifi-settings = Verkon asetukset
settings-network-wifi-searching = Etsitään verkkoja…
settings-network-hidden = Yhdistä piilotettuun verkkoon
    .description = Anna verkon nimi ja suojaustapa.
settings-network-hidden-name = Verkon nimi

## Network: joining a Wi‑Fi network

settings-network-join = Yhdistä verkkoon ”{ $network }”
settings-network-join-enterprise = Kirjaudu työpaikan tai koulun tililläsi.
settings-network-join-password = Anna tämän verkon salasana.
settings-network-join-failed = Tähän verkkoon ei voitu yhdistää.
settings-network-join-sign-in-failed = Kirjautuminen ei onnistunut. Tarkista käyttäjänimi ja salasana.
settings-network-join-wrong-password = Salasana ei toiminut. Tarkista se ja yritä uudelleen.

## Network: connection settings page

settings-network-forget = Unohda tämä verkko
    .description = Poistaa verkon salasanan ja asetukset tästä tietokoneesta
    .button = Unohda
settings-network-remove-vpn = Poista tämä VPN
settings-network-remove-connection = Poista tämä yhteys
settings-network-remove-description = Poistaa sen asetukset tästä tietokoneesta
settings-network-remove = Poista

settings-network-general = Yleiset
settings-network-autoconnect = Yhdistä automaattisesti
settings-network-autoconnect-wifi = Liity tähän verkkoon aina, kun se on kantaman sisällä
settings-network-autoconnect-wired = Yhdistä heti, kun kaapeli liitetään
settings-network-autoconnect-vpn = Yhdistä aina, kun tietokone on verkossa
settings-network-autoconnect-other = Yhdistä aina, kun yhteys on käytettävissä
settings-network-all-users = Kaikkien käytettävissä
    .description = Kuka tahansa tälle tietokoneelle kirjautuva voi käyttää sitä
settings-network-metered = Käytön mukaan laskutettava yhteys
    .description = Sovellukset ja päivitykset välttävät suuria latauksia
settings-network-metered-automatic = Tunnista automaattisesti
settings-network-metered-yes = Laskutettava
settings-network-metered-no = Ei laskutettava

settings-network-security = Suojaus
settings-network-security-type = Suojaustyyppi

settings-network-advanced = Lisäasetukset
settings-network-private-address = Yksityinen osoite
    .description = Vaikeuttaa tämän tietokoneen seuraamista tässä verkossa
settings-network-hardware-address = Laitteisto-osoite
    .description = Osoite, jonka tämä tietokone näyttää verkolle
settings-network-mac-random = Uusi osoite joka kerta
settings-network-mac-stable = Sama osoite tässä verkossa
settings-network-mac-private-off = Pois
settings-network-mac-builtin = Laitteen oma osoite
settings-network-mac-custom = Mukautettu osoite
settings-network-mtu = Suurin paketin koko (MTU)
    .description = Jätä tyhjäksi, ellei verkko vaadi tiettyä kokoa
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Menetelmä
    .label = { $family } -menetelmä
settings-network-ip-dhcp = Automaattinen, vain osoitteet
settings-network-ip-manual = Manuaalinen
settings-network-ip-link-local = Vain linkkipaikallinen
settings-network-ip-shared = Jaettu muille laitteille
settings-network-ip-ignore = Ei hallita
settings-network-ip-disabled = Pois
settings-network-ip-addresses = Osoitteet
    .description = Kukin etuliitteineen, kuten { $example }
settings-network-ip-address = Osoite { $number }
settings-network-ip-remove-address = Poista osoite
settings-network-ip-add-address = Lisää osoite
settings-network-ip-router = { $family } -reititin
settings-network-ip-automatic-dns = Automaattinen DNS
    .description = Käytä verkon ehdottamia DNS-palvelimia
settings-network-ip-dns-first = Käytetään ennen ehdotettuja
settings-network-ip-dns-separate = Erota osoitteet pilkuilla
settings-network-ip-dns-servers = { $family } -DNS-palvelimet
settings-network-ip-search-domains = Hakutoimialueet
    .description = Kokeillaan, kun nimessä ei ole toimialuetta, kuten ”tulostin”
    .label = { $family } -hakutoimialueet
settings-network-ip-automatic-routes = Automaattiset reitit
    .description = Käytä verkon ehdottamia reittejä
settings-network-ip-routes = Reitit
    .description = Ohjaa joidenkin verkkojen liikenne toisen reitittimen kautta
settings-network-ip-add-route = Lisää reitti
settings-network-route-network = Verkko
settings-network-route-priority = Prioriteetti
settings-network-route-remove = Poista reitti

## Network: work or school (802.1X) sign-in

settings-network-eap = Todennus
settings-network-eap-peap = Suojattu EAP (PEAP)
settings-network-eap-ttls = Tunneloitu TLS (TTLS)
settings-network-eap-tls = Varmenne (TLS)
settings-network-eap-inner = Sisäinen todennus
settings-network-client-certificate = Oma varmenne
settings-network-private-key-password = Yksityisen avaimen salasana
    .placeholder = Jos avaimella on salasana
settings-network-anonymous-identity = Anonyymi identiteetti
    .description = Jätä tyhjäksi, ellei verkko pyydä sitä
settings-network-ca = CA-varmenne
    .description = Varmistaa, että yhdistät oikeaan verkkoon
settings-network-ca-system = Käytä järjestelmän varmenteita
settings-network-ca-file = Valitse tiedosto…
settings-network-ca-another-file = Valitse toinen tiedosto…
settings-network-ca-none = Älä tarkista
settings-network-choose-file = Valitse…
settings-network-server-domain = Palvelimen toimialue
    .description = Yhdistä vain tämän toimialueen palvelimiin

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Anna nimi
settings-network-error-no-addresses = Lisää vähintään yksi osoite
settings-network-error-address = Anna osoite etuliitteineen, kuten { $example }
settings-network-error-router = Anna reitittimen osoite, kuten { $example }
settings-network-error-dns = ”{ $address }” ei ole kelvollinen osoite
settings-network-error-search-domain = ”{ $domain }” ei ole kelvollinen toimialue
settings-network-error-route = Anna verkko, kuten { $example }
settings-network-error-priority = Anna prioriteetiksi kokonaisluku
settings-network-error-username = Anna käyttäjänimi
settings-network-error-domain = Anna toimialue, kuten example.com
settings-network-error-certificate = Valitse varmenteesi
settings-network-error-private-key = Valitse yksityinen avaimesi
settings-network-error-mtu = Anna luku väliltä { $lowest }–{ $highest } tai jätä tyhjäksi
settings-network-error-mac = Anna osoite muodossa 12:34:56:78:9A:BC
settings-network-error-password = Anna salasana
settings-network-error-password-length = { $count ->
        [one] Käytä vähintään { $count } merkkiä
       *[other] Käytä vähintään { $count } merkkiä
    }

## Network: proxy

settings-network-proxy-off = Pois
settings-network-proxy-manual = Manuaalinen
settings-network-proxy-url = Määritysosoite
settings-network-proxy-http = Verkko (HTTP)
settings-network-proxy-https = Suojattu verkko (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Palvelin
    .label = { $protocol } -palvelin
settings-network-proxy-port = Portti
    .label = { $protocol } -portti
settings-network-proxy-skip = Älä käytä välityspalvelinta kohteille
settings-network-proxy-error-url = Anna verkko-osoite, kuten http://example.com/proxy.pac
settings-network-proxy-error-host = Anna pelkkä palvelimen nimi, kuten proxy.example.com
settings-network-proxy-error-port = Anna portti väliltä 1–65535
settings-network-proxy-save-failed = Välityspalvelimen asetuksia ei voitu tallentaa

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Tuo tiedostosta
    .description = WireGuard-, OpenVPN- ja muut VPN-määritystiedostot
settings-network-vpn-importing = Tuodaan…
settings-network-wireguard = Määritä WireGuard
    .description = Anna VPN-palveluntarjoajalta tai palvelimelta saamasi tiedot
settings-network-wireguard-dialog = Saat nämä tiedot VPN-palveluntarjoajaltasi tai palvelimen omistajalta.
settings-network-wireguard-name-example = Koti-VPN
settings-network-wireguard-public-key = Julkinen avain { $key }
settings-network-wireguard-public-key-pending = Julkinen avain näkyy tässä jaettavaksi
settings-network-wireguard-copy = Kopioi julkinen avain
settings-network-wireguard-copied = Kopioitu
settings-network-wireguard-generate = Luo uusi avain
settings-network-wireguard-addresses = Tämän tietokoneen osoitteet VPN:ssä
settings-network-wireguard-server-key = Palvelimen julkinen avain
settings-network-wireguard-endpoint = Palvelimen osoite
settings-network-wireguard-allowed-ips = Sallitut IP-osoitteet
    .description = Liikenne näihin osoitealueisiin kulkee VPN:n kautta
settings-network-wireguard-preshared-key = Esijaettu avain
settings-network-wireguard-keepalive = Keepalive
    .description = Auttaa pitämään yhteyden auki reitittimen takana
    .placeholder = Valinnainen, sekunteina
settings-network-wireguard-add = Lisää
settings-network-wireguard-adding = Lisätään…
settings-network-wireguard-error-private-key = Anna tai luo yksityinen avain
settings-network-wireguard-error-addresses = Anna vähintään yksi osoite
settings-network-wireguard-error-server-key = Anna palvelimen julkinen avain
settings-network-wireguard-error-endpoint = Anna palvelimen osoite ja portti
settings-network-wireguard-error-allowed-ips = Anna vähintään yksi osoitealue
settings-network-wireguard-error-keepalive = Anna sekuntimäärä

## Bluetooth panel

settings-bluetooth-hardware-off = Kytketty pois laitekytkimellä
settings-bluetooth-power-on-failed = Bluetoothia ei voitu kytkeä päälle
settings-bluetooth-power-off-failed = Bluetoothia ei voitu kytkeä pois
settings-bluetooth-visible = Näkyy lähellä oleville laitteille
    .description = Puhelimet ja tietokoneet voivat löytää tämän tietokoneen
settings-bluetooth-visible-as = Näkyy nimellä ”{ $name }”
settings-bluetooth-visible-duration = Näkyvyyden kesto
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } minuutiksi
       *[other] { $minutes } minuutiksi
    }
settings-bluetooth-visible-until-off = Kunnes poistetaan käytöstä
settings-bluetooth-visible-failed = Tietokoneen näkyvyyttä ei voitu muuttaa
settings-bluetooth-paired = Omat laitteet
settings-bluetooth-nearby = Lähellä olevat laitteet
settings-bluetooth-searching = Etsitään laitteita…
    .description = Aseta lisättävä laite pariliitostilaan
settings-bluetooth-blocked = Bluetooth on kytketty pois laitekytkimellä
    .description = Kytke se päälle tietokoneen kytkimellä tai näppäimellä
settings-bluetooth-details = Laitteen tiedot
settings-bluetooth-connected = Yhdistetty
settings-bluetooth-connected-battery = Yhdistetty · akku { $battery }
settings-bluetooth-connecting = Yhdistetään…
settings-bluetooth-disconnecting = Katkaistaan yhteyttä…
settings-bluetooth-pairing = Muodostetaan pariliitosta…
settings-bluetooth-forget-confirm = Unohdetaanko laite ”{ $name }”?
    .description = Laitteen pariliitos on muodostettava uudelleen, jotta voit käyttää sitä tämän tietokoneen kanssa.
settings-bluetooth-forget = Unohda
settings-bluetooth-cancel = Peruuta
settings-bluetooth-connect = Yhdistä
settings-bluetooth-disconnect = Katkaise yhteys
settings-bluetooth-done = Valmis

## Bluetooth: device details

settings-bluetooth-type = Tyyppi
settings-bluetooth-battery = Akku
settings-bluetooth-address = Osoite
settings-bluetooth-autoconnect = Yhdistä automaattisesti
    .description = Aina, kun laite on lähellä
settings-bluetooth-kind-headphones = Kuulokkeet
settings-bluetooth-kind-speaker = Kaiutin
settings-bluetooth-kind-mouse = Hiiri
settings-bluetooth-kind-keyboard = Näppäimistö
settings-bluetooth-kind-gamepad = Peliohjain
settings-bluetooth-kind-phone = Puhelin
settings-bluetooth-kind-computer = Tietokone
settings-bluetooth-kind-tablet = Tabletti
settings-bluetooth-kind-display = Näyttö
settings-bluetooth-kind-printer = Tulostin
settings-bluetooth-kind-camera = Kamera
settings-bluetooth-kind-other = Muu laite

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = laite
settings-bluetooth-request-confirm = Muodostetaanko pariliitos: { $name }?
    .description = Varmista, että { $name } näyttää saman koodin.
settings-bluetooth-request-authorize = Saako { $name } muodostaa pariliitoksen?
    .description = Sen jälkeen { $name } voi muodostaa yhteyden tähän tietokoneeseen.
settings-bluetooth-request-pin = Anna PIN-koodi, jota { $name } pyytää
    .description = Se on usein 0000 tai 1234. Jos kumpikaan ei toimi, katso koodi laitteen käyttöohjeesta.
settings-bluetooth-request-passkey = Anna koodi, jonka { $name } näyttää
    .description = Kirjoita kuusi numeroa täsmälleen niin kuin ne näkyvät.
settings-bluetooth-request-display = Muodosta pariliitos: { $name }
    .description = Kirjoita tämä koodi laitteella ja paina sitten Enter.
settings-bluetooth-pair = Muodosta pariliitos
settings-bluetooth-allow = Salli

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Tuo laitteesi Windowsista
    .description = { $count ->
        [one] { $devices } on pariliitetty Windowsissa. Käytä sitä täällä ilman uutta pariliitosta.
       *[other] { $devices } on pariliitetty Windowsissa. Käytä niitä täällä ilman uutta pariliitosta.
    }
settings-bluetooth-windows-more = { $count ->
        [one] { $count } muu
       *[other] { $count } muuta
    }
