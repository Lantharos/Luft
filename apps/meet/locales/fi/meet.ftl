## Messages that some steps share

meet-back = Takaisin
meet-cancel = Peruuta
meet-continue = Jatka
meet-try-again = Yritä uudelleen
meet-restart = Käynnistä uudelleen
meet-remove = Poista
meet-keep-it = Säilytä
meet-close = Sulje
meet-restart-title = Käynnistetäänkö uudelleen nyt?
meet-not-yet = Ei vielä
meet-iso-use = Käytä omaa ISO-tiedostoa
meet-iso-using = Käytetään Luft-ISO-tiedostoasi
meet-nightly = Yökäännökset
meet-channel-nightly = Meet Luft käyttää yökäännöksiä
meet-channel-latest = Meet Luft käyttää taas julkaisuversioita
meet-undo = Kumoa
meet-logs-saved = Luftin kokeilun lokit tallennettiin työpöydälle
meet-logs-show = Näytä
meet-logs-none = Luftin kokeilusta ei ole vielä lokeja
meet-logs-failed = Meet Luft ei voinut tallentaa Luftin kokeilun lokeja

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft ei saanut tämän tietokoneen tarkistusta valmiiksi.
   *[windows] Meet Luft ei saanut tämän PC:n tarkistusta valmiiksi.
}
problem-room = Tilan tekeminen Luftille jäi kesken.
problem-room-linux = Luftin valmistelu jäi kesken.
problem-update = Luftin päivitys jäi kesken.
problem-download = Luftin lataus keskeytyi. Tarkista verkkoyhteys.
problem-pack = Tavaroidesi pakkaaminen jäi kesken.
problem-remove = Luftin poistaminen jäi kesken.
problem-restart = Meet Luft ei voinut valmistella uudelleenkäynnistystä.
problem-tidy = Vanhoja käynnistysmerkintöjä ei voitu poistaa.
problem-firmware = Meet Luft ei voinut avata laiteohjelmiston asetuksia.
problem-folders = Meet Luft ei voinut käydä kansioitasi läpi.
problem-sticks = Meet Luft ei voinut etsiä USB-asemia.
problem-stick = Tikun tekeminen jäi kesken.
problem-offer = Luftia ei voi ladata juuri nyt. Tarkista verkkoyhteys tai käytä omaa ISO-tiedostoa.
problem-luft = Meet Luft ei voinut tarkistaa Luftin levyä.
problem-resize = Luftin koon muuttaminen jäi kesken.
problem-cancel = Meet Luft ei voinut perua muutosta.
problem-give = Windows ei voinut ottaa tilaa takaisin.
problem-declined = { $platform ->
    [linux] Meet Luft tarvitsee luvan muokata levyä. Kirjoita salasanasi, kun sitä kysytään.
   *[windows] Meet Luft tarvitsee luvan muokata levyä. Valitse Kyllä, kun Windows kysyy.
}

## First screen

hello-intro = { $platform ->
    [linux] Kokeile Luftia suoraan täältä, ilman USB-tikkua. Jos pidät siitä, Luft voi korvata tämän järjestelmän ja säilyttää tiedostosi.
   *[windows] Luft voi asua Windowsin rinnalla. Kokeile sitä ensin asentamatta mitään ja tuo tavarasi mukaan, kun olet valmis.
}
hello-check = { $platform ->
    [linux] Tarkista tämä tietokone
   *[windows] Tarkista tämä PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Tarkistetaan tätä tietokonetta
   *[windows] Tarkistetaan tätä PC:tä
}
check-ready-title = { $platform ->
    [linux] Tämä tietokone on valmis Luftille
   *[windows] Tämä PC on valmis Luftille
}
check-blocked-title = Melkein valmista
check-moment = Tämä kestää hetken.
check-slow = Windows selvittää, kuinka paljon tilaa se voi luovuttaa. Suurella levyllä tämä voi kestää muutaman minuutin.
check-blocked-description = Jotain täytyy muuttaa, ennen kuin Luft voi muuttaa sisään. Näin se tehdään.
check-found-description = Meet Luft löysi seuraavat asiat.
check-checking = Tarkistetaan levyä, laiteohjelmistoa ja laitteistoa…
check-again = Tarkista uudelleen
check-action-firmware = Avaa laiteohjelmiston asetukset
check-action-tidy = Siivoa
check-firmware-title = Käynnistetäänkö laiteohjelmiston asetuksiin?
check-firmware-description = Tallenna ensin keskeneräiset työt. Ota siellä Secure Boot käyttöön ja tallenna, niin tietokone käynnistyy taas tavalliseen tapaan.
check-tidy-title = Poistetaanko vanhat käynnistysmerkinnät?
check-tidy-description = Ne viittaavat vain järjestelmiin, joita ei enää ole. Windows ja kaikki muu käynnistyvät aivan kuten ennenkin.
check-get-ready-title = Valmistellaanko Luft?
check-get-ready-file = Meet Luft kopioi Luftin ISO-tiedostostasi kansioon tällä tietokoneella ja lisää sille käynnistysmerkinnän. Osioihin ei kosketa.
check-get-ready-download = Meet Luft lataa Luftin (noin { $size }) kansioon tällä tietokoneella ja lisää sille käynnistysmerkinnän. Osioihin ei kosketa.
check-get-ready-confirm = Valmistele

## Choosing how much of the Windows drive Luft gets

room-title = Kuinka paljon tilaa Luftille?
room-description = Windows pienentää itseään antaakseen tilaa Luftille. Windowsin tiedostosi pysyvät juuri siellä, missä ne ovat.
room-live = Windowsille jää kasvunvaraa. Luft varaa lisäksi { $size } käynnistymistä varten ja palauttaa sen, kun se on asennettu.
room-make = Tee tilaa
room-confirm-title = Annetaanko Luftille { $size }?
room-confirm-file = Windows pienentää levyään, ja sitten Meet Luft kopioi Luftin ISO-tiedostostasi. Pidä PC kytkettynä verkkovirtaan.
room-confirm-download = Windows pienentää levyään, ja sitten Meet Luft lataa Luftin (noin { $size }). Pidä PC kytkettynä verkkovirtaan ja verkkoon.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Mihin Luft sijoitetaan?
room-places-description = Luft voi jakaa Windowsin levyn tai käyttää tilaa, jota Windows ei käytä.
room-places-label = Paikat Luftille
room-place-windows = Windowsin rinnalle
room-place-windows-detail = Windows pienentää itseään antaakseen tilaa Luftille
room-place-windows-free = Siellä on jo { $size } vapaata
room-place-free = Vapaa tila levyllä { $drive }
room-place-free-here = Vapaa tila Windowsin levyllä
room-place-free-detail = { $size }, jota mikään muu ei käytä
room-place-whole = Koko levy { $drive }
room-place-whole-detail = Tyhjentää tämän { $size }:n levyn Luftille
room-live-free = Siitä { $free } on jo vapaana, joten Windows luovuttaa vähemmän ja sille jää kasvunvaraa. Luft varaa lisäksi { $size } käynnistymistä varten ja palauttaa sen, kun se on asennettu.
room-live-elsewhere = Luft saa sieltä { $room }, ja lisäksi se varaa { $size } käynnistymistä varten ja palauttaa sen, kun se on asennettu.
room-confirm-free-title = Annetaanko Luftille { $size } vapaata tilaa?
room-confirm-free-file = Meet Luft kopioi Luftin sinne ISO-tiedostostasi. Mikään muu levyllä ei muutu.
room-confirm-free-download = Meet Luft lataa Luftin (noin { $size }) sinne. Mikään muu levyllä ei muutu. Pidä PC kytkettynä verkkoon.
room-erase-title = Tyhjennetäänkö { $drive }?
room-erase-description = Kaikki tällä { $size }:n levyllä poistetaan heti, ennen kuin Luft käynnistyy. Tätä ei voi kumota. Levyllä on nyt:
room-erase-empty = Windows ei pysty lukemaan mitään tältä { $size }:n levyltä, mutta kaikki sillä oleva poistetaan heti. Tätä ei voi kumota.
room-erase-unnamed = Nimetön osio
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Salattu BitLockerilla
room-erase-understood = Ymmärrän, että osa siitä on salattu BitLockerilla eikä sitä voi palauttaa
room-erase-confirm = Tyhjennä ja tee tilaa

## Luft is ready on Windows

ready-title = Luft on valmis
ready-description = Valitse, miten haluat tutustua siihen. Windows käynnistyy sen jälkeen tavalliseen tapaan, ellet asenna Luftia ja valitse sitä.
ready-update-title = Hanki uusin Luft
ready-update-description = Uudempi käännös on saatavilla. Se korvaa tämän ja säilyttää tilan ja kaiken pakkaamasi.
ready-try-title = Kokeile Luftia
ready-try-description = Käynnistä Luftiin asentamatta mitään. Windows käynnistyy seuraavalla kerralla tavalliseen tapaan.
ready-box-description = Pakkaa asiakirjat, kuvat, Wi-Fi-verkot ja muuta, niin Luft purkaa ne asennuksen jälkeen.
ready-box-packed = Pakattu, { $size }
ready-install-title = Asenna Luft
ready-install-description = Käynnistä asennusohjelmaan. Windowsin rinnalla oleva tila ({ $size }) odottaa sitä jo.
ready-install-drive-description = Käynnistä asennusohjelmaan. Levyllä { $drive } oleva tila ({ $size }) odottaa sitä jo.
ready-stick-description = Laita Luft tikulle, niin voit käynnistää sen millä tahansa tietokoneella.
ready-remove = Poista Luft tästä PC:stä
ready-restart-try = Tallenna ensin keskeneräiset työt. Luft avautuu noin minuutissa, ja seuraava uudelleenkäynnistys palauttaa sinut Windowsiin.
ready-restart-install = Tallenna ensin keskeneräiset työt. Asennusohjelma avautuu noin minuutissa, eikä mikään muutu ennen kuin vahvistat sen siellä.
ready-fast-startup-title = Poista Windowsin nopea käynnistys käytöstä
ready-fast-startup-description = Windows sammuu silloin kokonaan, joten ääni, Wi-Fi ja Bluetooth käynnistyvät Luftissa puhtaalta pöydältä.
ready-clock-title = Pidä kello oikeassa molemmissa
ready-clock-description = Windows lukee tietokoneen kelloa samalla tavalla kuin Luft, joten aika ei enää hypi, kun vaihdat järjestelmää.
ready-remove-title = Poistetaanko Luft tästä PC:stä?
ready-remove-description = Meet Luft poistaa kaiken lisäämänsä, myös muuttolaatikon, ja palauttaa Windowsille kaiken sen tilan.

## Luft is ready on Linux

linux-ready-description = Valitse, miten haluat tutustua siihen. Järjestelmä { $system } käynnistyy tavalliseen tapaan, kunnes päätät toisin.
linux-ready-this-system = tämä järjestelmä
linux-ready-update-description = Uudempi käännös on saatavilla. Se korvaa Meet Luftin säilyttämän version ja säilyttää kokeilun lokit.
linux-ready-try-description = Käynnistä Luftiin muuttamatta mitään. Järjestelmä { $system } käynnistyy seuraavalla kerralla tavalliseen tapaan.
linux-ready-replace-title = Korvaa { $system }
linux-ready-replace-description = Luft tulee sen tilalle ja säilyttää tiedostosi, tilisi, Wi-Fi-verkot ja muut levyt. Vanha järjestelmä säilyy, kunnes poistat sen.
linux-ready-install-description = Käynnistä asennusohjelmaan, niin voit asentaa Luftin toiselle levylle tai vapaaseen tilaan.
linux-ready-remove = Poista Luft tästä tietokoneesta
linux-ready-restart-try = Tallenna ensin keskeneräiset työt. Luft avautuu noin minuutissa, ja seuraava uudelleenkäynnistys palauttaa sinut järjestelmään { $system }.
linux-ready-restart-replace = Tallenna ensin keskeneräiset työt. Asennusohjelma avautuu valmiina korvaamaan järjestelmän { $system } ja näyttää, mikä säilyy, ennen kuin mikään muuttuu.
linux-ready-remove-title = Poistetaanko Luft tästä tietokoneesta?
linux-ready-remove-description = Meet Luft poistaa Luftin tiedostot, käynnistystiedostot ja käynnistysmerkinnän. Kaikki muu pysyy ennallaan.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Luftisi
luft-looking = Meet Luft löysi Luftin tästä PC:stä.
luft-checking = Tarkistetaan Luftin levyä…
luft-description-beside = Luft on asennettu tähän PC:hen Windowsin rinnalle.
luft-description-drive = Luft on asennettu levylle { $drive }.
luft-bar-used = { $size }, { $used } käytössä
luft-resize-title = Muuta Luftin kokoa
luft-resize-description = Anna Luftille lisää Windowsin tilaa tai palauta osa Windowsille.
luft-resize-encrypted = Luftin levy on salattu, joten sen siirtäminen vaatisi palautusavaimen. Poista ensin laitteen salaus käytöstä Luftin Asetuksista ja palaa sitten.
luft-resize-apart = Windowsin ja Luftin välissä on toinen osio, joten ne eivät voi jakaa tilaansa.
luft-resize-unreadable = Meet Luft ei pystynyt selvittämään, kuinka täynnä Luft on.
luft-pending-grow = Luft kasvaa seuraavalla käynnistyskerralla
luft-pending-grow-description = Käynnistä Luftiin ja anna sen olla päällä muutama minuutti, kun se siirtyy uuteen tilaan. Voit käyttää sitä sillä välin.
luft-pending-shrink = Luft tekee tilaa seuraavalla käynnistyskerralla
luft-pending-shrink-description = Käynnistä Luftiin ja anna sen olla päällä muutama minuutti, kun se siirtää tiedostojaan. Avaa sitten Meet Luft uudelleen Windowsissa, niin Windows saa tilan.
luft-windows-free-title = Anna vapaa tila Windowsille
luft-windows-free-description = Heti Windowsin jälkeen on { $size } käyttämätöntä tilaa. Windows voi ottaa sen takaisin.
luft-leftovers-title = Siivoa Luftin kokeilun jäljet
luft-leftovers-description = Osiot, jotka Meet Luft teki Luftin käynnistämistä varten, ovat yhä tallella. Luft ei enää tarvitse niitä.
luft-start = Käynnistä Luftiin
luft-cancel = Peru muutos
luft-restart = Tallenna ensin keskeneräiset työt. Luft käynnistyy noin minuutissa, ja seuraava uudelleenkäynnistys palauttaa sinut Windowsiin.
luft-restart-pending = Tallenna ensin keskeneräiset työt. Luft käynnistyy noin minuutissa ja siirtää tiedostonsa itse, mikä kestää muutaman minuutin. Voit käyttää sitä sillä välin.
luft-remove = Poista Luft tästä PC:stä
luft-remove-title = Poistetaanko Luft tästä PC:stä?
luft-remove-description = Luft ja kaikki sen sisältö poistetaan, yhteensä { $size }, ja Windows saa tilan takaisin. PC käynnistää Windowsin kuten ennenkin. Tätä ei voi kumota.
luft-remove-drive-description = Luft ja kaikki sen sisältö poistetaan levyltä { $drive }, yhteensä { $size }. PC käynnistää Windowsin kuten ennenkin. Tätä ei voi kumota.
luft-remove-confirm = Poista Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kuinka paljon tilaa Luftille?
resize-description = Jaa levy Windowsin ja Luftin kesken vetämällä. Luft tekee muutoksen itse seuraavalla käynnistyskerralla.
resize-measuring = Windows selvittää, kuinka paljon tilaa se voi luovuttaa. Suurella levyllä tämä voi kestää muutaman minuutin.
resize-full = Luft on liian täynnä siirrettäväksi, eikä Windows voi luovuttaa sille tarpeeksi tilaa. Vapauta ensin tilaa Luftissa tai Windowsissa.
resize-used = Luftin tiedostot vievät { $size }.
resize-least = Muuta kokoa vähintään { $size }.
resize-apply = Muuta
resize-grow-title = Annetaanko Luftille { $size } lisää?
resize-grow-description = Windows pienentää itseään heti. Luft siirtyy uuteen tilaan seuraavalla käynnistyskerralla, mikä kestää muutaman minuutin. Pidä PC kytkettynä verkkovirtaan.
resize-shrink-title = Palautetaanko Windowsille { $size }?
resize-shrink-description = Luft siirtää tiedostonsa seuraavalla käynnistyskerralla, mikä kestää muutaman minuutin. Avaa sitten Meet Luft uudelleen, niin Windows ottaa tilan takaisin. Pidä PC kytkettynä verkkovirtaan.

## Packing things to take along to Luft (the moving box)

box-title = Tuo tavarasi
box-description = Valitse, mitä otat mukaan. Luft purkaa ne uudelle tilillesi asennuksen jälkeen, eikä Windowsista poisteta mitään.
box-looking = Käydään kansioita läpi…
box-folder-desktop = Työpöytä
box-folder-documents = Tiedostot
box-folder-downloads = Lataukset
box-folder-music = Musiikki
box-folder-pictures = Kuvat
box-folder-videos = Videot
box-folder-size = { $size }, { $files ->
    [one] { $files } tiedosto
   *[other] { $files } tiedostoa
}
box-wifi-title = Wi-Fi-verkot
box-wifi-description = Salasanoineen, joten Luft on heti verkossa
box-bluetooth-title = Bluetooth-laitteet
box-bluetooth-description = { $devices ->
    [one] { $devices } laite, valmiina ilman uutta pariliitosta
   *[other] { $devices } laitetta, valmiina ilman uutta pariliitosta
}
box-wallpaper-title = Taustakuva
box-wallpaper-description = Windowsin työpöytäsi kuva
box-account-title = Nimesi ja kuvasi
box-total-slow = { $size }, pakkaaminen kestää noin { $minutes ->
    [one] { $minutes } minuutin
   *[other] { $minutes } minuuttia
}
box-pack = Pakkaa

## Progress while Meet Luft works

working-shrinking = Tehdään tilaa
    .description = Windows siirtää tiedostojaan tilan vapauttamiseksi. Tämä voi kestää muutaman minuutin.
working-erasing = Tyhjennetään levyä
    .description = Windows tyhjentää sen, jotta Luft saa sen kokonaan.
working-partitioning = Valmistellaan Luftin tilaa
    .description = Valmistellaan osioita, joilta Luft käynnistyy.
working-downloading = Tuodaan Luftia
    .description = Luft kopioidaan suoraan omaan tilaansa ja tarkistetaan matkalla.
working-packing = Pakataan tavaroitasi
    .description = Kaikki valitsemasi kopioidaan muuttolaatikkoon. Suurissa kansioissa kestää hetki.
working-removing = Poistetaan Luftia
    .description = Tila palautetaan Windowsille.
working-removing-linux = Poistetaan Luftia
    .description = Poistetaan sen tiedostot ja käynnistysmerkintä.
working-writing = Tehdään tikkua
    .description = Luft kirjoitetaan koko tikulle. Pidä se kiinni koneessa.
working-copying = Lisätään Luft Ventoyhin
    .description = Luft kopioidaan tikulle muiden ISO-tiedostojen viereen. Pidä se kiinni koneessa.
working-verifying = Tarkistetaan tikkua
    .description = Kaikki luetaan takaisin, jotta tikku varmasti käynnistyy.
working-stick-downloading = Ladataan Luftia
    .description = Se tarkistetaan matkalla ja säilytetään, joten seuraava tikku valmistuu nopeammin.
working-progress = { $done } / { $total }
working-keep-open = Pidä tämä ikkuna auki.

## After Luft was removed

removed-title = Kaikki on ennallaan
removed-description = { $platform ->
    [linux] Luftin tiedostot ja käynnistysmerkintä on poistettu, ja tietokone käynnistyy aivan kuten ennenkin. Tervetuloa takaisin milloin vain.
   *[windows] Luftin osiot ja käynnistysmerkintä on poistettu, ja Windowsilla on taas kaikki tilansa. Tervetuloa takaisin milloin vain.
}

## Making a USB stick

stick-title = Tee USB-tikku
stick-description = Luft käynnistyy siltä millä tahansa tietokoneella kokeiltavaksi tai asennettavaksi.
stick-looking = Etsitään USB-asemia…
stick-none = Liitä vähintään { $size }:n USB-tikku. Se näkyy tässä.
stick-drives-label = USB-asemat
stick-offer = { $name }, { $size }
stick-make = Tee tikku
stick-drive-empty = Tyhjä
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Liian pieni Luftille
stick-ventoy-title = Tämä tikku käyttää Ventoyta
stick-ventoy-description = Lisätäänkö Luft siihen, vai tyhjennetäänkö koko tikku ja tehdään siitä Luft-tikku?
stick-erase-it = Tyhjennä
stick-add = Lisää Luft
stick-replace-title = Korvataanko tikulla oleva Luft?
stick-replace-description = { $count ->
    [one] Tikulla on jo { $names }. Uusi Luft voi tulla sen tilalle.
   *[other] Tikulla on jo { $names }. Uusi Luft voi tulla niiden tilalle.
}
stick-keep = { $count ->
    [one] Säilytä molemmat
   *[other] Säilytä kaikki
}
stick-replace = Korvaa
stick-full-title = Luftille ei ole tilaa
stick-full-description = Luft tarvitsee { $needed }, ja tikulla on vapaata { $free }. Vapauta tikulta tilaa tai tyhjennä se ja tee siitä Luft-tikku.
stick-erase-title = Tyhjennetäänkö { $name }?
stick-erase-description = Kaikki tällä { $size }:n tikulla poistetaan ja korvataan Luftilla. Tätä ei voi kumota.
stick-erase-confirm = Tyhjennä ja tee tikku
stick-done-title = Luft-tikkusi on valmis
stick-done-ventoy-title = Luft on Ventoy-tikullasi
stick-done-take-out = Voit nyt irrottaa sen.
stick-done-eject = Poista se turvallisesti ennen irrottamista.
stick-done-start = Käynnistä tikulta liittämällä se ja valitsemalla se tietokoneen käynnistysvalikosta, joka avautuu heti virran kytkemisen jälkeen esimerkiksi F12-, F8- tai Esc-näppäimellä.
stick-done-ventoy-key = Kun Secure Boot on päällä, Ventoy pyytää ensimmäisellä käynnistyskerralla kerran rekisteröimään oman avaimensa.
stick-done = Valmis
stick-done-another = Tee toinen
