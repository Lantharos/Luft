## Shared

system-cancel = Peruuta

## Dictation notifications

dictation-setup-title = Kirjoita puhumalla
dictation-setup-body = Puhu, niin sanasi kirjoitetaan missä tahansa sovelluksessa. Puhe tunnistetaan tässä tietokoneessa, joten puhemalli tarvitaan ensin.
dictation-setup-action = Määritä sanelu
dictation-unsupported-title = Sanelu ei ole käytettävissä tässä tietokoneessa: { $language }
dictation-unsupported-body = Tietokoneen suoritin ei pysty käyttämään puheentunnistinta, jota { $language } vaatii. Voit sanella toisella kielellä.
dictation-settings-action = Saneluasetukset

## System health notifications

health-gpu-reset-title = Grafiikkaohjain lakkasi vastaamasta
health-gpu-reset-body = { $day ->
    [today] Tietokone käynnistyi itsestään uudelleen tänään klo { $time }. Asetuksista näet, miten sen voi estää jatkossa.
   *[other] Tietokone käynnistyi itsestään uudelleen { $date } klo { $time }. Asetuksista näet, miten sen voi estää jatkossa.
}
health-gpu-reset-details = Lisätietoja

oom-app-closed-title = { $app } suljettiin muistin vapauttamiseksi
oom-container-closed-title = Säilö suljettiin muistin vapauttamiseksi
oom-closed-body = Tietokoneen muisti oli loppumassa, joten se suljettiin, jotta kaikki muu toimisi sujuvasti.
oom-closed-body-with-size = Tietokoneen muisti oli loppumassa, joten se suljettiin, jotta kaikki muu toimisi sujuvasti. Se käytti muistia { $size }.
memory-low-title = Luftin muisti on loppumassa
memory-low-app-body = { $app } käyttää muistia { $size }. Pakota se sulkeutumaan, jotta kaikki muu toimii sujuvasti.
memory-low-container-body = Säilö käyttää muistia { $size }. Pakota se sulkeutumaan, jotta kaikki muu toimii sujuvasti.
memory-low-force-quit = Pakota sulkeutumaan

## Input source indicator

input-source-indicator = Syöttölähde: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Lentokonetila on kytketty laitteen kytkimestä
media-keys-airplane-mode-on = Lentokonetila päällä
media-keys-airplane-mode-off = Lentokonetila pois
media-keys-bluetooth-on = Bluetooth päällä
media-keys-bluetooth-off = Bluetooth pois
media-keys-caps-lock-on = Caps Lock päällä
media-keys-caps-lock-off = Caps Lock pois
media-keys-num-lock-on = Num Lock päällä
media-keys-num-lock-off = Num Lock pois

## VPN sign-in

vpn-sign-in-title = Kirjaudu sisään: { $connection }
vpn-connect = Yhdistä
vpn-signing-in = Kirjaudutaan…
vpn-finish-in-browser = Viimeistele kirjautuminen selaimessa.
vpn-certificate-untrusted = { $host } esitti varmenteen, jota ei voida vahvistaa ({ $reason }). Sen sormenjälki on { $fingerprint }.
vpn-certificate-warning = Joku voi esiintyä tänä palvelimena. Yhdistä vain, jos odotit tätä.
vpn-certificate-connect = Yhdistä silti

vpn-field-password = Salasana
vpn-field-certificate-password = Varmenteen salasana
vpn-field-proxy-password = Välityspalvelimen salasana
vpn-field-pre-shared-key = Esijaettu avain
vpn-field-group-password = Ryhmän salasana

## Battery notifications

battery-left = { $percent } jäljellä.
battery-left-with-time = { $percent } jäljellä, noin { $duration }.
battery-low-title = Akku vähissä
battery-very-low-title = Akku erittäin vähissä
battery-almost-empty-title = Akku melkein tyhjä
battery-ups-low-title = UPS-akku vähissä
battery-ups-very-low-title = UPS-akku erittäin vähissä
battery-ups-almost-empty-title = UPS-akku melkein tyhjä
battery-very-low-body = { $left } Kytke laturi pian.
battery-almost-empty-body = { $left } Kytke laturi nyt, ettei tallentamaton työ katoa.

battery-device-low-title = { $device }: akku vähissä
battery-device-very-low-title = { $device }: akku erittäin vähissä
battery-device-low-body = { $left } Lataa se pian.
battery-device-very-low-body = { $left } Lataa se nyt, ettei se sammu.

battery-device-mouse = Hiiri
battery-device-keyboard = Näppäimistö
battery-device-phone = Puhelin
battery-device-tablet = Tabletti
battery-device-controller = Peliohjain
battery-device-pen = Kynä
battery-device-touchpad = Kosketuslevy
battery-device-headset = Kuulokemikrofoni
battery-device-speaker = Kaiutin
battery-device-headphones = Kuulokkeet
battery-device-remote = Kaukosäädin
battery-device-other = Yhdistetty laite

## Privacy indicator

privacy-indicator = Käytössä: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofoni
privacy-thing-screen = näyttö
privacy-thing-location = sijainti
privacy-thing-windows = ikkunat

privacy-camera-unknown-app = Sovellus käyttää kameraa
privacy-stop-sharing = Lopeta näytön jakaminen
privacy-stop-recording = Lopeta tallennus
privacy-turn-off-location = Poista sijaintipalvelut käytöstä
privacy-settings = Tietosuoja-asetukset
privacy-camera = Kamera
privacy-microphone = Mikrofoni
privacy-microphone-muted = Mikrofoni mykistetty
privacy-mute-microphone = Mykistä mikrofoni
privacy-unmute-microphone = Poista mikrofonin mykistys
privacy-close-app = Sulje { $app }
privacy-unknown-app = Sovellus
privacy-reported-app = ”{ $name }” (nimeä ei ole varmistettu)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } ohjelma voi nähdä ikkunasi
   *[other] { $count } ohjelmaa voi nähdä ikkunasi
}
privacy-windows-using-programs = { $count ->
    [one] { $count } ohjelma voi nähdä ja käyttää ikkunoitasi
   *[other] { $count } ohjelmaa voi nähdä ja käyttää ikkunoitasi
}
privacy-windows-stop = Peru käyttöoikeus

## Window access prompt

peek-see-request = Sallitaanko käynnistämäsi ohjelman nähdä ikkunasi?
peek-see-description = Se voi ottaa kuvan mistä tahansa avoimesta ikkunastasi.
peek-use-request = Sallitaanko käynnistämäsi ohjelman nähdä ja käyttää ikkunoitasi?
peek-use-description = Se näkee kaikki avoimet ikkunasi ja voi napsauttaa ja kirjoittaa niissä aivan kuin olisit itse.
peek-deny = Älä salli
peek-allow-once = Salli kerran
peek-allow-until-quit = Salli, kunnes se suljetaan

## Window access errors

peek-error-declined-until-quit = Tietokoneen käyttäjä kieltäytyi. Ohjelma voi pyytää uudelleen, kun se on sulkeutunut.
peek-error-not-allowed = Tietokoneen käyttäjä ei sallinut tätä
peek-error-sandboxed = Hiekkalaatikossa toimivat sovellukset eivät voi nähdä tai käyttää muita ikkunoita
peek-error-unknown-caller = Pyytävä ohjelma päättyi, tai sitä ei tunnistettu
peek-error-no-caller = Istuntoväylä ei kertonut, mikä ohjelma pyytää
peek-error-screen-busy = Näyttö on lukittu, tai siinä on auki järjestelmän kehote. Yritä uudelleen, kun se on poissa.
peek-error-input-held = Joku pitää näppäimiä tai hiiren painikkeita painettuna. Yritä hetken kuluttua uudelleen.
peek-error-input-dropped = Syöte pysäytettiin, koska kohdassa oli jotain muuta tai näppäimistö oli muun käytössä syötteen saapuessa
peek-error-not-in-front = Ikkunaa ei voitu tuoda eteen
peek-error-covered = Jokin muu peittää tämän ikkunan osan
peek-error-outside = { $x }, { $y } on ikkunan kuvan ulkopuolella, kuvan koko on { $width } × { $height }
peek-error-nothing-to-capture = Ikkunassa ei näy mitään kaapattavaa
peek-error-window-picture-late = Ikkunan kuva ei valmistunut ajoissa
peek-error-screen-picture-late = Näytön kuva ei valmistunut ajoissa
peek-error-no-window-id = Tunnuksella { $id } ei ole ikkunaa. peek list näyttää avoimet ikkunat.
peek-error-no-window-for-handle = Tunnuksella { $handle } käynnistetyllä ohjelmalla ei ole avointa ikkunaa
peek-error-ended-before-window = Ohjelma päättyi ennen kuin se avasi ikkunan
peek-error-no-window-in-time = Ikkuna ei avautunut ajoissa ({ $duration })
peek-error-launch-not-started-by-peek = Käynnistää voi vain ohjelman, jonka peek run on itse käynnistänyt
peek-error-ended-while-starting = Ohjelma päättyi käynnistyessään
peek-error-launch-failed = systemd ei voinut käynnistää ohjelmaa { $program }
peek-error-unknown-handle = Millään komennolla peek run käynnistämälläsi ohjelmalla ei ole tunnusta { $handle }, tai ohjelma on sulkeutunut
peek-error-unknown-key = peek ei tunne näppäintä { $key }
peek-error-unknown-modifier = { $modifier } ei ole muokkausnäppäin. Käytä näppäimiä ctrl, shift, alt tai super.
peek-error-display-owner = Tämä näyttö kuuluu toiselle ohjelmalle
peek-error-display-run = Piilotetun näytön ohjelmat käynnistetään komennolla peek run
peek-error-display-handle = Tämä näyttö käynnistettiin tunnuksella { $handle }, ei tunnuksella { $requested }

## Quick settings tiles

auto-rotate-title = Automaattinen kierto
dark-style-title = Tumma tila
do-not-disturb-title = Älä häiritse
night-light-title = Yövalo
airplane-mode-title = Lentokonetila

## Power mode

power-profile-title = Virtatila
power-profile-header = Virtatila
power-profile-open-menu = Avaa virtatilavalikko
power-profile-settings = Virta-asetukset
power-profile-performance = Suorituskyky
power-profile-balanced = Tasapainotettu
power-profile-power-saver = Virransäästö
power-profile-custom = Mukautettu

## Keep awake

caffeine-title = Pidä hereillä
caffeine-open-menu = Avaa Pidä hereillä -valikko
caffeine-until = { $time } asti
caffeine-until-turned-off = Kunnes poistetaan käytöstä
caffeine-30-minutes = 30 minuuttia
caffeine-1-hour = 1 tunti
caffeine-2-hours = 2 tuntia
caffeine-inhibit-reason = Pidetty hereillä pika-asetuksista

## Brightness

brightness-title = Kirkkaus
brightness-open-menu = Avaa kirkkausvalikko

## Keyboard backlight

backlight-title = Näppäimistön taustavalo
backlight-open-menu = Avaa näppäimistön kirkkausvalikko
backlight-slider = Näppäimistön kirkkaus
backlight-off = Pois
backlight-low = Matala
backlight-high = Korkea

## Sound

volume-sound-settings = Ääniasetukset
volume-mute = Mykistä
volume-unmute = Poista mykistys
volume-output-slider = Äänenvoimakkuus
volume-output-title = Äänen ulostulo
volume-output-open-menu = Avaa äänen ulostulon valikko
volume-input-slider = Mikrofoni
volume-input-title = Äänen sisääntulo
volume-input-open-menu = Avaa äänen sisääntulon valikko

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Avaa Bluetooth-valikko
bluetooth-settings = Bluetooth-asetukset
bluetooth-connect = Yhdistä
bluetooth-disconnect = Katkaise yhteys
bluetooth-connect-device = Yhdistä laitteeseen { $deviceName }
bluetooth-disconnect-device = Katkaise yhteys laitteeseen { $deviceName }
bluetooth-no-devices = Ei käytettävissä olevia tai yhdistettyjä laitteita
bluetooth-turn-on-hint = Kytke Bluetooth päälle, niin voit yhdistää laitteisiin
bluetooth-connected-count = { $count ->
    [one] { $count } yhdistetty
   *[other] { $count } yhdistettyä
}

## Network menus in quick settings

network-menu-unknown-network = <tuntematon>
network-menu-connect = Yhdistä
network-menu-disconnect = Katkaise yhteys
network-menu-connect-to = Yhdistä: { $name }
network-menu-disconnect-from = Katkaise yhteys: { $name }
network-menu-turn-off = Kytke pois
network-menu-wifi-network = { $secure ->
    [yes] { $name }, suojattu, signaalin voimakkuus { $strength } %
   *[no] { $name }, ei suojattu, signaalin voimakkuus { $strength } %
}
network-menu-hotspot = { $name } -yhteyspiste
network-menu-connected-count = { $count ->
    [one] { $count } yhdistetty
   *[other] { $count } yhdistettyä
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Avaa VPN-valikko
network-menu-vpn-settings = VPN-asetukset
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Avaa Wi-Fi-valikko
network-menu-wifi-settings = Kaikki verkot
network-menu-wired = Kiinteät yhteydet
network-menu-wired-open-menu = Avaa kiinteiden yhteyksien valikko
network-menu-wired-settings = Kiinteän verkon asetukset
network-menu-tethers = Bluetooth-jakoyhteydet
network-menu-tethers-open-menu = Avaa Bluetooth-jakoyhteyksien valikko
network-menu-tether = Jakoyhteys
network-menu-tether-settings = Bluetooth-asetukset
network-menu-mobile-connections = Mobiiliyhteydet
network-menu-mobile-open-menu = Avaa mobiiliyhteyksien valikko
network-menu-mobile-settings = Mobiililaajakaistan asetukset
network-menu-mobile = Mobiiliverkko
network-device-wired = Kiinteä
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Kirjaudu verkkoon
network-menu-failed-title = Yhteys epäonnistui
network-menu-failed-body = Verkkoyhteyttä ei voitu muodostaa

## Location access dialog

location-dialog-title = Salli sijainnin käyttö
location-dialog-description = Sovellus { $appName } haluaa käyttää sijaintiasi
location-dialog-info = Sijainnin käyttöoikeutta voi muuttaa milloin tahansa tietosuoja-asetuksista
location-dialog-deny = Estä
location-dialog-grant = Salli

## Thunderbolt notifications

thunderbolt-unknown-title = Tuntematon Thunderbolt-laite
thunderbolt-unknown-body = Uusi laite liitettiin, kun olit poissa. Irrota se ja liitä uudelleen, niin voit käyttää sitä.
thunderbolt-unauthorized-title = Hyväksymätön Thunderbolt-laite
thunderbolt-unauthorized-body = Uusi laite liitettiin, ja se tarvitsee järjestelmänvalvojan hyväksynnän
thunderbolt-error-title = Thunderbolt-laitteen hyväksyntä epäonnistui
thunderbolt-error-body = Thunderbolt-laitetta ei voitu hyväksyä: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Estä
access-dialog-allow = Salli

## Display change confirmation

display-change-title = Säilytetäänkö näyttöasetukset?
display-change-countdown = { $seconds ->
    [one] Muutokset perutaan { $seconds } sekunnin kuluttua
   *[other] Muutokset perutaan { $seconds } sekunnin kuluttua
}
display-change-revert = Palauta asetukset
display-change-keep = Säilytä muutokset

## Drive connected notification

autorun-connected = ”{ $driveName }” liitetty
autorun-ready = Levy on nyt käytettävissä
autorun-open-with = Avaa { $appName } -sovelluksella

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Hitaat näppäimet otettu käyttöön
kbd-a11y-slow-keys-off = Hitaat näppäimet poistettu käytöstä
kbd-a11y-slow-keys-description = Pidit juuri Vaihto-näppäintä painettuna 8 sekuntia. Se on Hitaat näppäimet -toiminnon pikanäppäin, ja toiminto muuttaa näppäimistön toimintaa.
kbd-a11y-sticky-keys-on = Alas jäävät näppäimet otettu käyttöön
kbd-a11y-sticky-keys-off = Alas jäävät näppäimet poistettu käytöstä
kbd-a11y-sticky-keys-on-description = Painoit juuri Vaihto-näppäintä 5 kertaa peräkkäin. Se on Alas jäävät näppäimet -toiminnon pikanäppäin, ja toiminto muuttaa näppäimistön toimintaa.
kbd-a11y-sticky-keys-off-description = Painoit juuri kahta näppäintä yhtä aikaa tai Vaihto-näppäintä 5 kertaa peräkkäin. Se poistaa käytöstä Alas jäävät näppäimet -toiminnon, joka muuttaa näppäimistön toimintaa.
kbd-a11y-leave-on = Pidä käytössä
kbd-a11y-turn-on = Ota käyttöön
kbd-a11y-turn-off = Poista käytöstä
kbd-a11y-leave-off = Pidä pois käytöstä

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Valitse äänilaite
audio-device-cancel = Peruuta
audio-device-sound-settings = Ääniasetukset
audio-device-headphones = Kuulokkeet
audio-device-headset = Kuulokemikrofoni
audio-device-microphone = Mikrofoni

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Salli pikanäppäinten ohitus
inhibit-shortcuts-app = Sovellus { $appName } haluaa ohittaa järjestelmän pikanäppäimet
inhibit-shortcuts-unknown-app = Sovellus haluaa ohittaa järjestelmän pikanäppäimet
inhibit-shortcuts-titled-app = Sovellus, jonka ikkuna on ”{ $title }”, haluaa ohittaa järjestelmän pikanäppäimet
inhibit-shortcuts-restore = Voit palauttaa pikanäppäimet painamalla { $shortcut }
inhibit-shortcuts-deny = Estä
inhibit-shortcuts-allow = Salli

## Unlocking encrypted drives

mount-hidden-volume = Piilotettu taltio
mount-windows-system-volume = Windowsin järjestelmätaltio
mount-uses-keyfiles = Käyttää avaintiedostoja
mount-keyfiles-use-app = Avaa avaintiedostoja käyttävän taltion lukitus <i>{ $appName }</i> -sovelluksella
mount-keyfiles-need-app = Avaintiedostoja käyttävän taltion lukituksen avaamiseen tarvitaan erillinen työkalu, kuten <i>Levyt</i>
mount-pim-number = PIM-luku
mount-pim-invalid = PIM:n on oltava luku tai tyhjä
mount-password = Salasana
mount-remember-password = Muista salasana
mount-cancel = Peruuta
mount-unlock = Avaa lukitus
mount-open-app = Avaa { $appName }
mount-wrong-password = Se ei onnistunut. Yritä uudelleen.
mount-unlock-failed = Taltion lukitusta ei voitu avata
mount-pim-unsupported = Asennettu udisks-versio ei tue PIM-asetusta

## Network passwords, asked when connecting needs one

network-agent-auth-required = Tunnistautuminen vaaditaan
network-agent-wifi-rejected = Verkon ”{ $networkName }” tallennettu salasana ei toiminut. Kirjoita se uudelleen.
network-agent-wifi-secrets = Langattoman verkon ”{ $networkName }” käyttöön tarvitaan salasana tai salausavain
network-agent-wps-hint = Voit myös yhdistää painamalla reitittimen WPS-painiketta
network-agent-wired-title = Kiinteän verkon 802.1X-tunnistautuminen
network-agent-dsl-title = DSL-tunnistautuminen
network-agent-pin-title = PIN-koodi vaaditaan
network-agent-pin-body = Mobiililaajakaistalaite tarvitsee PIN-koodin
network-agent-vpn-title = VPN-salasana
network-agent-password-required = Yhteyden ”{ $networkName }” muodostamiseen tarvitaan salasana
network-agent-connect = Yhdistä
network-agent-cancel = Peruuta
network-agent-password = Salasana
network-agent-username = Käyttäjänimi
network-agent-key = Avain
network-agent-private-key-password = Yksityisen avaimen salasana
network-agent-identity = Identiteetti
network-agent-service = Palvelu
network-agent-network-name = Verkon nimi
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Näytönkaappaus
screenshot-area = Alueen valinta
screenshot-screen = Näytön valinta
screenshot-window = Ikkunan valinta
screenshot-take = Ota kuvakaappaus
screenshot-record = Tallenna näyttö
screenshot-show-pointer = Näytä osoitin
screenshot-capture = Kaappaa
screenshot-close = Sulje
screenshot-screencasts-folder = Näyttötallenteet
screenshot-screencast-file = Näyttötallenne { $date } { $time }
screenshot-screenshots-folder = Kuvakaappaukset
screenshot-file = Kuvakaappaus { $timestamp }
screenshot-screencast-recorded = Näyttötallenne tallennettu
screenshot-screencast-start-failed = Näytön tallennusta ei voitu aloittaa
screenshot-screencast-out-of-space = Näytön tallennus epäonnistui: levytila loppui
screenshot-screencast-try-again = Näytön tallennus epäonnistui. Yritä uudelleen.
screenshot-screencast-failed = Näytön tallennus epäonnistui
screenshot-screencast-view = Katso video napsauttamalla tästä
screenshot-show-in-rover = Näytä Roverissa
screenshot-captured = Kuvakaappaus otettu
screenshot-captured-body = Voit liittää kuvan leikepöydältä

## System updates
updates-available-title = Järjestelmäpäivityksiä on saatavilla
updates-available-body = Lataa ja asenna ne Asetuksissa.
updates-ready-title = Päivitykset ovat valmiita asennettaviksi
updates-ready-body = Asenna ne käynnistämällä uudelleen, kun sinulle sopii.
