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
privacy-windows-using = Käyttää ikkunoitasi
privacy-windows-seeing = Näkee ikkunasi
privacy-windows-stop = Peru käyttöoikeus

## Window access prompt

peek-see-title = { $app } haluaa nähdä ikkunasi
peek-see-description = Se voi ottaa kuvan mistä tahansa avoimesta ikkunastasi.
peek-use-title = { $app } haluaa nähdä ja käyttää ikkunoitasi
peek-use-description = Se näkee kaikki avoimet ikkunasi ja voi napsauttaa ja kirjoittaa niissä aivan kuin olisit itse.
peek-deny = Älä salli
peek-allow-once = Salli kerran
peek-allow-until-quit = Salli, kunnes se suljetaan

## Window access errors

peek-error-declined = Tietokoneen käyttäjä kieltäytyi. { $app } voi pyytää uudelleen, kun se on sulkeutunut.
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
