## Buttons used across steps

setup-continue = Jatka
setup-back = Takaisin
setup-cancel = Peruuta
setup-not-now = Ei nyt
setup-try-again = Yritä uudelleen
setup-restart = Käynnistä uudelleen
setup-restart-now = Käynnistä uudelleen nyt
setup-restart-later = Käynnistä uudelleen myöhemmin
setup-saving = Tallennetaan…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Asennetaan Luftia
setup-installing-progress = Asennetaan, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Hae
setup-picker-no-match = Ei osumia

## Welcome step: language, keyboard and time zone

setup-region-title = Tervetuloa Luftiin
setup-region-language = Kieli
setup-region-keyboard = Näppäimistö
setup-region-time-zone = Aikavyöhyke
setup-region-intro = Otetaan Luft käyttöön. Valitse kieli, näppäimistö ja aikavyöhyke.
setup-region-intro-guessed-computer = Otetaan Luft käyttöön. Nämä on päätelty tietokoneestasi, joten muuta, jos jokin on väärin.
setup-region-intro-guessed = Otetaan Luft käyttöön. Valmiiksi pääteltiin { $guesses }, joten muuta, jos jokin on väärin.
setup-region-guess-from-computer = { $fields } tietokoneen perusteella
setup-region-guess-from-network = { $fields } verkon perusteella
setup-region-field-language = kieli
setup-region-field-keyboard = näppäimistö
setup-region-field-time-zone = aikavyöhyke

## Where Luft goes

setup-destination-choose-title = Mihin Luft asennetaan?
setup-destination-choose-description = Valitse, miten Luft sijoitetaan tälle tietokoneelle. Mikään ei muutu ennen kuin vahvistat.
setup-destination-alongside-title = Tee tilaa Windowsin rinnalle
setup-destination-alongside-description = Windows pienenee, jotta Luftille vapautuu tilaa. Windowsin tiedostosi pysyvät ennallaan.
setup-destination-whole-title = Valitse levy
setup-destination-whole-description = Luft käyttää koko levyn. Kaikki levyllä oleva poistetaan.
setup-destination-custom-title = Valitse tila Luftille
setup-destination-custom-description = Järjestä levysi haluamallasi tavalla Levyt-sovelluksessa.
setup-destination-replace-title = Korvaa { $system }
setup-destination-replace-description = Luft tulee sen tilalle ja säilyttää kaiken, mikä on sinun.
setup-destination-meet-title = Windowsin rinnalle
setup-destination-meet-description = Meet Luft on jo tehnyt tilan valmiiksi, joten Windows pysyy täysin ennallaan.
setup-destination-looking = Tarkistetaan levyjä…

setup-destination-meet-choice = Windowsin rinnalle
setup-destination-meet-choice-description = Käytä tilaa, jonka Meet Luft teki Windowsin rinnalle ({ $size }).
setup-destination-alongside-choice = { $windows } -järjestelmän rinnalle
setup-destination-alongside-choice-description = Säilytä Windows ja sen tiedostot ja anna Luftille osa sen levystä.
setup-destination-replace-choice = Korvaa { $system }
setup-destination-replace-choice-description = Säilytä tiedostosi, tilisi ja asetuksesi, ja anna Luftin tulla sen tilalle.
setup-destination-whole-choice = Käytä koko levyä
setup-destination-whole-choice-description = Tyhjennä levy ja anna se kokonaan Luftille.
setup-destination-try-choice = Kokeile vain Luftia
setup-destination-try-choice-description = Tutustu ensin. Mitään ei asenneta, eikä levyihisi kosketa.
setup-destination-custom-choice = Mukautettu
setup-destination-custom-choice-description = Järjestä osiot itse Levyt-sovelluksessa.

setup-destination-more-options = Lisää vaihtoehtoja
setup-destination-starting = Käynnistetään…
setup-destination-replace = Korvaa
setup-destination-install = Asenna Luft

## Confirming where Luft goes

setup-confirm-replace-title = Korvataanko { $system }?
setup-confirm-erase-title = Tyhjennetäänkö { $drive }?
setup-confirm-shrink-title = Pienennetäänkö Windows kokoon { $size }?
setup-confirm-meet-title = Asennetaanko Luft Windowsin rinnalle?
setup-confirm-free-title = Asennetaanko Luft vapaaseen tilaan?
setup-confirm-replace-keep-old = Luft alkaa kopioida heti. Vanha järjestelmä ei enää käynnisty, ja sen tiedostot säilyvät, kunnes poistat ne.
setup-confirm-replace-erase-old = Luft alkaa kopioida heti. Vanha järjestelmä poistetaan pysyvästi, ja tiedostosi pysyvät paikallaan.
setup-confirm-erase-description = Kaikki tällä levyllä oleva poistetaan pysyvästi, myös muut järjestelmät ja tiedostot.
setup-confirm-install-description = Luft alkaa kopioida heti. Voit määrittää tilisi sillä aikaa.
setup-confirm-erase = Tyhjennä ja asenna
setup-confirm-install = Asenna

## Making room next to Windows

setup-alongside-hint = Jaa { $drive } Windowsin ja Luftin kesken vetämällä. Windows säilyttää kaikki tiedostonsa ja hieman kasvunvaraa.
setup-windows-bitlocker = Windows pitää tämän levyn lukittuna BitLockerilla, joten Luft ei voi tehdä siihen tilaa. Poista Windowsissa laitteen salaus käytöstä tai pienennä levyä Levynhallinnassa ja valitse vapaa tila kohdasta Mukautettu.
setup-windows-hibernated = Windows on lepotilassa tai sammutettiin nopean käynnistyksen ollessa käytössä, joten sen levyä ei voi muuttaa turvallisesti. Käynnistä Windows, pidä Vaihto-näppäintä painettuna valitessasi Sammuta ja käynnistä sitten Luft uudelleen.
setup-windows-dirty = Windowsin levy pitää ensin tarkistaa nopeasti. Käynnistä Windows, käynnistä se kerran uudelleen ja käynnistä sitten Luft uudelleen.
setup-windows-full = Windows tarvitsee lähes koko levynsä. Vapauta Windowsissa noin { $size } tilaa ja käynnistä sitten Luft uudelleen.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Windowsissa pakkaamasi asiat ({ $size }) puretaan uudelle tilillesi.

## Windows options

setup-windows-fast-startup = Poista Windowsin nopea käynnistys käytöstä
setup-windows-fast-startup-description = Windows sammuu silloin kokonaan, joten ääni, Wi-Fi ja Bluetooth käynnistyvät Luftissa puhtaalta pöydältä ja Windowsin levy pysyy avoimena.
setup-windows-clock = Pidä kello oikeassa molemmissa
setup-windows-clock-description = Windows lukee tietokoneen kelloa samalla tavalla kuin Luft, joten aika ei enää hypi, kun vaihdat järjestelmää.
setup-windows-bluetooth = Tuo Bluetooth-laitteesi
setup-windows-bluetooth-description = { $count ->
    [one] { $count } Windowsissa pariliitetty laite toimii Luftissa ilman uutta pariliitosta.
   *[other] { $count } Windowsissa pariliitettyä laitetta toimii Luftissa ilman uutta pariliitosta.
}

## Choosing a drive

setup-drives-label = Levyt
setup-drives-none = Luft ei löydä levyä, jota se voisi käyttää. Liitä levy ja etsi uudelleen.
setup-drive-has-windows = { $windows } asennettuna
setup-drive-empty = Tyhjä
setup-drive-partitions = { $count ->
    [one] { $count } osio
   *[other] { $count } osiota
}

## Custom space

setup-custom-open-disks = Avaa Levyt
setup-custom-looking = Etsitään…
setup-custom-look-again = Etsi uudelleen
setup-custom-free-label = Vapaa tila
setup-custom-free-space = { $size } vapaata tilaa
setup-custom-on-drive = Levy: { $drive }
setup-custom-none = Vapauta Levyt-sovelluksessa vähintään { $size } tilaa ja etsi sitten uudelleen. Luft asennetaan jättämääsi vapaaseen tilaan.

## Replacing a Linux system

setup-replace-stays = Mikä säilyy
setup-replace-changes = Mikä muuttuu
setup-replace-keeps-account = Tiedostosi ja tilisi { $account }
setup-replace-keeps-account-password = Tiedostosi sekä tilisi { $account } ja sen salasana
setup-replace-keeps-accounts = { $count ->
    [one] Järjestelmän toinen tili tiedostoineen
   *[other] Järjestelmän muut { $count } tiliä tiedostoineen
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } verkkoyhteys Wi-Fi-salasanoineen
   *[other] { $count } verkkoyhteyttä Wi-Fi-salasanoineen
}
setup-replace-keeps-drives = { $drives }, liitetään käynnistyksessä kuten ennenkin
setup-replace-keeps-hostname = Tietokoneen nimi { $hostname } ja sen SSH-avaimet
setup-replace-keeps-tools = { $count ->
    [one] { $count } asentamasi komentorivityökalu, Toolbox-säilössä kirjautumisen jälkeen
   *[other] { $count } asentamaasi komentorivityökalua, Toolbox-säilössä kirjautumisen jälkeen
}
setup-replace-keeps-old = { $system } ei enää käynnisty. Sen järjestelmätiedostot säilytetään nimellä old-system, kunnes poistat ne Levyt-sovelluksessa tai Asetuksissa.
setup-replace-erases-system = { $system } -järjestelmän osio tyhjennetään. Tiedostosi ovat omalla osiollaan ja pysyvät ennallaan.
setup-replace-clears-boot = Sen /boot-osio tyhjennetään Luftin käynnistystiedostoja varten.
setup-replace-apps = Siihen asennetut sovellukset eivät tule mukaan. Asenna ne uudelleen Schelfistä.

setup-replace-blocked-encrypted = Se on salattu, joten sen korvaamista tiedostot säilyttäen ei vielä tueta.
setup-replace-blocked-single = Tiedostosi ovat samalla osiolla järjestelmän kanssa, joten sen korvaamista tiedostot säilyttäen ei vielä tueta.
setup-replace-blocked-layout = Luft ei vielä osaa korvata järjestelmää, jonka levy on osioitu näin.
setup-replace-blocked-startup = Sen EFI-järjestelmäosio on liian pieni Luftille, eikä sen tilalle ole käytettävissä /boot-osiota.
setup-replace-blocked-no-account = Siinä ei ole tiliä, jonka voisi siirtää.
setup-replace-blocked-running = Luft on käynnistetty siitä juuri nyt. Käynnistä Luft USB-tikulta, niin voit korvata sen.
setup-replace-blocked-read-only = Sen levy on kirjoitussuojattu.

## Connecting to the internet

setup-network-title = Yhdistä internetiin
setup-network-description = Tämä on valinnaista. Kun olet verkossa, Luft voi asettaa kellon ja aikavyöhykkeen, ja voit käyttää internetiä asennuksen aikana.
setup-network-unavailable = Verkot eivät ole juuri nyt käytettävissä. Voit yhdistää myöhemmin tehtäväpalkista.
setup-network-looking = Etsitään verkkoja…
setup-network-cable = Yhdistetty kaapelilla
setup-network-show-all = Näytä kaikki verkot
setup-network-skip = Ohita
setup-network-failed = Yhteyttä ei voitu muodostaa
setup-network-wrong-password = Väärä salasana
setup-network-connected = Yhdistetty
setup-network-connecting = Yhdistetään…
setup-network-saved = Tallennettu
setup-network-password = Salasana
setup-network-join = Liity

## Account

setup-account-title = Kuka käyttää tätä tietokonetta?
setup-account-description = Tällä tilillä kirjaudut sisään. Voit lisätä muita käyttäjiä myöhemmin Asetuksissa.
setup-account-full-name = Nimesi
setup-account-full-name-example = Minna Canth
setup-account-user-name = Käyttäjänimi
setup-account-password = Salasana
setup-account-repeat = Kirjoita se uudelleen
setup-account-user-name-invalid = Käytä pieniä kirjaimia, numeroita sekä merkkejä - ja _
setup-account-full-name-invalid = Jätä pilkut ja kaksoispisteet pois
setup-account-mismatch = Salasanat eivät täsmää

## Installing

setup-finishing-failed-title = Luftia ei voitu asentaa
setup-finishing-failed-description = Asennuksessa tapahtui virhe.
setup-finishing-failed-stick = Tietokoneesi käynnistyy yhä samalla tavalla kuin ennenkin. Voit jatkaa Luftin käyttöä USB-tikulta tai käynnistää tietokoneen uudelleen ja yrittää uudestaan.
setup-finishing-failed-trying = Tietokoneesi käynnistyy yhä samalla tavalla kuin ennenkin. Voit jatkaa Luftin käyttöä sellaisenaan tai käynnistää tietokoneen uudelleen ja yrittää uudestaan.
setup-finishing-use-stick = Käytä Luftia tikulta
setup-finishing-keep-trying = Jatka Luftin kokeilua
setup-finishing-installed-title = Luft on asennettu
setup-finishing-trust-stick = Irrota USB-tikku, kun näyttö pimenee. Sen jälkeen sininen näyttö pyytää luottamaan Luftiin. Käytä siinä näppäimistöä.
setup-finishing-trust = Heti uudelleenkäynnistyksen jälkeen sininen näyttö pyytää luottamaan Luftiin. Käytä siinä näppäimistöä.
setup-finishing-restart-stick = Ota Luft käyttöön käynnistämällä tietokone uudelleen. Irrota USB-tikku, kun näyttö pimenee.
setup-finishing-restart = Ota Luft käyttöön käynnistämällä tietokone uudelleen.
setup-finishing-title = Melkein valmista
setup-finishing-description = Luftia kopioidaan tietokoneellesi. Tämä kestää muutaman minuutin.
setup-finishing-plug-in = Pidä tietokone kytkettynä verkkovirtaan, kunnes asennus on valmis.
setup-stage-idle = Valmistellaan
setup-stage-preparing = Tehdään tilaa Luftille
setup-stage-copying = Kopioidaan Luftia
setup-stage-waiting = Viimeistellään
setup-stage-configuring = Määritetään tiliäsi
setup-stage-finished = Valmis

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Paina jotakin näppäintä 10 sekunnin kuluessa
setup-enroll-choose-enroll = Valitse Enroll MOK ja sitten Continue
setup-enroll-choose-yes = Valitse Yes
setup-enroll-type-code = Kirjoita koodi ja valitse sitten Reboot
setup-enroll-digits = { $count ->
    [one] { $count } numero
   *[other] { $count } numeroa
}
setup-secure-boot-title = Tietokoneesi ei vielä luota Luftiin
setup-secure-boot-code = Heti seuraavan uudelleenkäynnistyksen jälkeen sininen näyttö pyytää luottamaan Luftiin. Kirjoita siinä tämä koodi näppäimistöllä.
setup-secure-boot-skipped = Sininen näyttö ohitettiin. Hae uusi koodi, käynnistä uudelleen ja käytä sitten siinä näppäimistöä.
setup-secure-boot-getting = Haetaan koodia…
setup-secure-boot-new-code = Hae uusi koodi

## Encryption

setup-protect-title = Suojaa tiedostosi
setup-protect-tpm = Salaa tämä tietokone, jotta kukaan ei voi lukea tiedostojasi kirjautumatta sisään, vaikka tietokone katoaisi. Lukitus avautuu itsestään käynnistettäessä.
setup-protect-passphrase = Salaa tämä tietokone, jotta kukaan ei voi lukea tiedostojasi ilman tunnuslausettasi, vaikka tietokone katoaisi.
setup-protect-staged-title = Tiedostosi salataan
setup-protect-staged-description = Salaus alkaa itsestään käyttöönoton lopuksi tehtävän uudelleenkäynnistyksen jälkeen, ja voit käyttää tietokonetta sen aikana.
setup-protect-keep-safe = Säilytä tämä palautusavain turvallisessa paikassa erillään tästä tietokoneesta. Tarvitset sitä, jos tietokone ei joskus pysty avaamaan lukitusta itse.
setup-protect-passphrase-label = Tunnuslause
setup-protect-repeat = Kirjoita se uudelleen
setup-protect-mismatch = Ne eivät täsmää
setup-protect-kept = Olen tallentanut palautusavaimeni
setup-protect-background = Salaus tapahtuu taustalla seuraavan uudelleenkäynnistyksen jälkeen, ja voit käyttää tietokonetta sillä välin.
setup-protect-encrypt = Salaa
setup-protect-checking = Tarkistetaan…
setup-protect-start = Salaa tiedostoni

## Fingerprint

setup-fingerprint-title = Kirjaudu sormella
setup-fingerprint-description = Avaa Luftin lukitus kosketuksella salasanan kirjoittamisen sijaan. Voit lisätä sormia myöhemmin Asetuksissa.
setup-fingerprint-which = Mikä sormi?
setup-fingerprint-another = Lisätäänkö toinen sormi?
setup-fingerprint-finger = Sormi
setup-fingerprint-no-reader = Sormenjälkilukija ei vastaa. Voit lisätä sormenjäljen myöhemmin Asetuksissa.
setup-fingerprint-add = Lisää sormenjälki
setup-fingerprint-choose-another = Valitse toinen sormi

## Done

setup-ready-title = Kaikki on valmista
setup-ready-trust = Viimeistele käynnistämällä tietokone vielä kerran uudelleen. Heti sen jälkeen sininen näyttö pyytää luottamaan Luftiin. Kirjoita siinä tämä koodi näppäimistöllä.
setup-ready-restart = Viimeistele käynnistämällä tietokone vielä kerran uudelleen ja kirjaudu sitten sisään salasanallasi.
setup-ready-done = Työpöytäsi on valmis. Mukavia hetkiä Luftin parissa.
setup-ready-start = Aloita Luftin käyttö
