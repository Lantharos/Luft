## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bittinen Intel- tai AMD-suoritin
check-processor-x64-detail = Luft toimii sillä.
check-processor-arm = Arm-suoritin
check-processor-arm-detail = Luft toimii toistaiseksi vain Intel- ja AMD-suorittimilla.
check-processor-32-bit-windows = 32-bittinen Windows
check-processor-32-bit-system = 32-bittinen järjestelmä
check-processor-32-bit-detail = Luft tarvitsee 64-bittisen Intel- tai AMD-suorittimen.
check-startup-uefi = Käynnistyy UEFI-tilassa
check-startup-uefi-windows = Luft käynnistyy samalla nykyaikaisella tavalla.
check-startup-uefi-linux = Luft lisää oman käynnistysmerkintänsä, ja { $system } käynnistyy edelleen kuten nyt.
check-startup-bios = Käynnistyy vanhassa BIOS-tilassa
check-startup-bios-windows = Luft tarvitsee UEFI:n. Windows voi vaihtaa siihen MBR2GPT:llä, minkä jälkeen UEFI voidaan ottaa käyttöön laiteohjelmiston asetuksissa.
check-startup-bios-linux = Luft tarvitsee UEFI:n. Ota se käyttöön laiteohjelmiston asetuksissa yhdessä nykyisen järjestelmän kanssa ja tarkista sitten uudelleen.
check-startup-mbr = Levyllä on vanha osiotaulu
check-startup-mbr-windows = Luft tarvitsee GPT-levyn. Windows voi muuntaa levyn MBR2GPT:llä tiedostoja menettämättä.
check-startup-mbr-linux = Luft tarvitsee GPT-levyn, jolta käynnistyä.
check-startup-no-esp = Ei EFI-järjestelmäosiota
check-startup-no-esp-detail = Luft lisää käynnistystiedostonsa EFI-järjestelmäosiolla jo olevien viereen, mutta sellaista osiota ei ole.
check-startup-esp-full = EFI-järjestelmäosio on täynnä
check-startup-esp-full-detail = Luft tarvitsee siellä { $size } Mt käynnistystiedostoilleen. Tilan vievät yleensä vanhat ytimet tai käynnistysmerkinnät.
check-folder-fine = Osioihin ei kosketa
check-folder-fine-detail = Luft säilytetään tiedostona { $filesystem }-levylläsi ja käynnistyy sieltä.
check-folder-encrypted = Tiedostosi ovat salatulla levyllä
check-folder-encrypted-detail = Luft ei vielä voi käynnistyä salatulta levyltä. Kokeile sitä sen sijaan USB-tikulta.
check-folder-combined = Tiedostosi ovat useammalla kuin yhdellä osiolla
check-folder-combined-detail = Luft ei vielä voi käynnistyä LVM:ltä tai RAIDilta. Kokeile sitä sen sijaan USB-tikulta.
check-folder-filesystem = Luft ei voi käynnistyä tiedostojärjestelmästä { $filesystem }
check-folder-filesystem-detail = Se käynnistyy ext4-, btrfs- ja XFS-levyiltä. Kokeile sitä sen sijaan USB-tikulta.
check-space-free = { $size } Gt vapaana
check-space-free-linux = Luft vie kokeilun ajan noin { $size } Gt.
check-space-up-to = Enintään { $size } Gt Luftille
check-space-up-to-detail = Windows säilyttää tiedostonsa ja kasvunvaraa.
check-space-free-already = Siitä { $size } Gt on jo vapaana, joten Windows luovuttaa vähemmän.
check-space-other-drive = Levyllä { $drive } on sille tilaa.
check-space-erase-drive = Levyllä { $drive } on sille tilaa, kun levy on tyhjennetty.
check-space-short = Vapaata tilaa ei ole tarpeeksi
check-space-short-windows = Luft tarvitsee noin { $needed } Gt, jonka Windows voi luovuttaa. Vapauta Windowsissa { $missing } Gt esimerkiksi Levyn puhdistuksella ja tarkista sitten uudelleen.
check-space-short-linux = Luft tarvitsee noin { $needed } Gt käynnistyäkseen. Vapauta { $missing } Gt ja tarkista sitten uudelleen.
check-system-replaceable = Luft voi tulla sen tilalle ja säilyttää tiedostosi, tilisi ja asetuksesi.
check-system-single = Tiedostosi ovat samalla osiolla kuin järjestelmä, joten sen korvaamista tiedostot säilyttäen ei vielä tueta. Luftin kokeilu ja asennus toimivat.
check-system-encrypted = Se on salattu, joten sen korvaamista tiedostot säilyttäen ei vielä tueta.
check-system-unknown = Sen levy on järjestetty tavalla, jota Luft ei vielä osaa korvata tiedostot säilyttäen.
check-encryption-off = Windowsia ei ole salattu
check-encryption-off-detail = Asenna Luft voi lukea sen asetukset ja Bluetooth-laitteesi.
check-encryption-on = Windows on salattu BitLockerilla
check-encryption-on-detail = Ei haittaa. Windows tekee tilan itse, ja Meet Luft tuo mukanaan sen, mitä Luft ei voi lukea lukitulta levyltä. Pidä palautusavain varmuuden vuoksi lähettyvillä.
check-encryption-changing = BitLocker salaa tai purkaa salausta yhä
check-encryption-changing-detail = Odota, kunnes Windows on valmis, ja palaa sitten. Näet edistymisen Asetuksista kohdasta Laitteen salaus.
check-fast-startup-on = Nopea käynnistys on käytössä
check-fast-startup-on-detail = Windows siirtyy horrostilaan sammumisen sijaan, mikä pitää sen levyn lukittuna. Meet Luft tarjoutuu poistamaan sen käytöstä ennen asennusta.
check-fast-startup-off = Nopea käynnistys ei ole käytössä
check-fast-startup-off-detail = Windows sammuu kokonaan.
check-secure-boot-on = Secure Boot on päällä
check-secure-boot-on-detail = Se voi pysyä päällä. Luft pyytää kerran sinisellä näytöllä lisäämään avaimensa.
check-secure-boot-off = Secure Boot ei ole päällä
check-secure-boot-off-detail = Luft toimii ilman sitä, mutta huijauksenestoa käyttävät pelit tarvitsevat sen. { $turningOn }
check-secure-boot-restart-into = Meet Luft voi käynnistää laiteohjelmiston asetuksiin, joissa se löytyy kohdasta { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft voi käynnistää laiteohjelmiston asetuksiin, joissa se on yleensä kohdassa Security tai Boot.
check-secure-boot-turn-on = Ota se käyttöön käynnistämällä uudelleen ja painamalla { $key }, kun valmistajan { $maker } logo tulee näkyviin, ja siirry kohtaan { $place }.
check-secure-boot-turn-on-anywhere = Ota se käyttöön avaamalla laiteohjelmiston asetukset tietokoneen käynnistyessä ja katsomalla kohdasta Security tai Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security ja sitten Secure Boot
check-firmware-place-boot-configuration = Boot Configuration ja sitten Secure Boot
check-firmware-place-security-or-advanced = Security tai Advanced ja sitten Secure Boot Configuration
check-firmware-place-security-or-boot = Security tai Boot ja sitten Secure Boot
check-firmware-place-boot = Boot ja sitten Secure Boot
check-firmware-place-settings = Settings, sitten Security ja sitten Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPadissa F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 tai Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = äänenvoimakkuuden lisäyspainiketta

## More of the computer's hardware

check-tpm-detail = Salattu Luft voi avata lukituksensa itse tietokoneen käynnistyessä.
check-tpm-missing = Ei TPM 2.0:aa
check-tpm-missing-detail = Jos salaat Luftin, se kysyy tunnuslausetta joka käynnistyksellä.
check-graphics = Grafiikka
check-graphics-detail = Toimii heti.
check-graphics-nvidia = Luft asennetaan NVIDIA:n omalla ohjaimella.
check-wifi-missing = Ei Wi-Fiä
check-wifi-missing-detail = Käytä Luftissa verkkokaapelia tai ei yhteyttä lainkaan.
check-wifi-detail = Toimii Luftissa.
check-wifi-broadcom = Jotkin Broadcomin Wi-Fi-piirit tarvitsevat ohjaimen, jota Luftissa ei ole. Pidä lähettyvillä verkkokaapeli tai puhelin USB-jakoyhteyttä varten.
check-start-entries = { $count ->
    [one] Vanha käynnistysmerkintä
   *[other] { $count } vanhaa käynnistysmerkintää
}
check-start-entries-detail = { $count ->
    [one] { $names } viittaa järjestelmään, jota ei enää ole tässä PC:ssä. Sen voi siivota pois.
   *[other] { $names } viittaavat järjestelmiin, joita ei enää ole tässä PC:ssä. Ne voi siivota pois.
}
check-download-unavailable = Luftia ei voi ladata juuri nyt
check-download-unavailable-detail = Meet Luft lataa noin 3 Gt. Tarkista verkkoyhteys ja tarkista uudelleen tai käytä omaa Luft-ISO-tiedostoa.

## Choosing a Luft ISO file

iso-dialog-title = Valitse Luft-ISO-tiedosto
iso-dialog-filter = Luft-ISO

## Saving the logs from trying Luft

logs-file-name = Luft-lokit { $name }
logs-no-desktop = Meet Luft ei löytänyt työpöytääsi
logs-not-saved = Meet Luft ei voinut tallentaa Luftin kokeilun lokeja: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Meet Luftin apuohjelma ei käynnistynyt: { $error }
helper-not-allowed = Meet Luft ei saanut lupaa muokata levyä
helper-stopped = Meet Luftin apuohjelma pysähtyi
helper-stopped-because = Meet Luftin apuohjelma pysähtyi: { $error }
helper-pipe-failed = Meet Luft ei saanut yhteyttä apuohjelmaansa: { $error }
helper-pipe-hijacked = Jokin muu kuin Meet Luftin apuohjelma avasi yhteyden { $pipe }
helper-record-not-saved = Meet Luft ei voinut kirjata tekemäänsä: { $error }
helper-no-room-yet = Tee ensin tilaa Luftille.
helper-not-ready-linux = Valmistele Luft ensin.
helper-not-ready-to-start-windows = Luft ei ole vielä valmis käynnistymään. Tee sille ensin tilaa.
helper-not-ready-to-start-linux = Luft ei ole vielä valmis käynnistymään. Valmistele se ensin.
helper-update-unfinished = Luftin päivitys jäi kesken. Päivitä se ensin uudelleen.
helper-room-too-small = Luft tarvitsee enemmän tilaa.
helper-room-shortfall = Windows voi luovuttaa { $available } Gt, ja Luft tarvitsee { $needed } Gt.
helper-gap-shortfall = Tilassa on { $available } Gt, ja Luft tarvitsee { $needed } Gt.
helper-place-gone = Tila ei ole enää vapaana. Tarkista uudelleen, mihin Luft mahtuu.
helper-box-shortfall = Windows voi luovuttaa vielä { $available } Gt, ja valitut asiat tarvitsevat { $needed } Gt.
helper-box-room-shortfall = Luftin tilasta riittää { $available } Gt, ja valitut asiat tarvitsevat { $needed } Gt.
helper-bluetooth-unreadable = Windowsin Bluetooth-asetuksia ei voitu avata
helper-registry-not-opened = Rekisteriavainta { $key } ei voitu avata: { $error }
helper-registry-not-changed = Rekisteriarvoa { $value } ei voitu muuttaa: { $error }
helper-registry-not-saved = Tiedostoa { $file } ei voitu tallentaa: { $error }
helper-restart-failed = Tietokone ei käynnistynyt uudelleen
helper-windows-restart-failed = Windows ei käynnistynyt uudelleen: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Tämä PC ei käynnisty UEFI-tilassa
firmware-variable-unreadable = Laiteohjelmistosta ei voitu lukea arvoa { $name }: { $error }
firmware-variable-not-saved = Laiteohjelmistoon ei voitu tallentaa arvoa { $name }: { $error }
firmware-entries-full = Laiteohjelmistossa ei ole tilaa uudelle käynnistysmerkinnälle
firmware-entry-kept = Windows säilytti käynnistysmerkinnän { $entry }

## Errors about drives and partitions

drive-list-failed = Levyjä ei voitu luetella: { $error }
drive-of-path-unknown = Ei voitu selvittää, millä levyllä on { $path }
drive-windows-folder-missing = Windowsin kansiota ei löytynyt
drive-windows-drive-missing = Windowsin levyä ei löytynyt
drive-windows-drive-missing-because = Windowsin levyä ei löytynyt: { $error }
drive-windows-partition-missing = Windowsin osiota ei löytynyt
drive-volume-missing = Taltiota { $path } ei löytynyt
drive-storage-error = { $what } (Windowsin tallennusvirhe { $code })
drive-shrink-size-unknown = Windows ei pystynyt kertomaan, kuinka pieneksi sen osion voi pienentää
drive-resize-failed = Windows ei voinut muuttaa osionsa kokoa
drive-create-failed = Windows ei voinut luoda osiota Luftille
drive-hide-failed = Windows ei voinut piilottaa uutta osiota Resurssienhallinnasta
drive-format-failed = Windows ei voinut alustaa uutta osiota
drive-remove-failed = Windows ei voinut poistaa yhtä Luftin osioista
drive-new-partition-missing = Uutta osiota ei löytynyt
drive-new-partition-no-volume = Uudella osiolla ei ole taltiota
drive-start-no-guid = Käynnistysosiolla ei ole GUID-tunnusta
drive-live-no-guid = Live-osiolla ei ole GUID-tunnusta
drive-box-no-guid = Muuttolaatikolla ei ole GUID-tunnusta
drive-guid-unreadable = Osion GUID-tunnusta ei voi lukea
drive-not-gpt = Levyn osiotaulu ei ole GPT
drive-start-no-volume = Käynnistysosiolla ei ole taltiota
drive-live-no-volume = Luftin osiolla ei ole taltiota
drive-new-live-no-volume = Luftin uudella osiolla ei ole taltiota
drive-partitions-not-noted = Luftin osioita ei ole Meet Luftin muistiinpanoissa
drive-partitions-gone = Luftin osiot katosivat
drive-partition-gone = Osio katosi
drive-gone = Levy katosi
drive-erase-failed = Windows ei voinut tyhjentää levyä
drive-erased-no-room = Tyhjennetyllä levyllä ei ole tilaa Luftille
drive-start-partition-foreign = Luftin käynnistysosio ei ole Meet Luftin tekemä
drive-start-partition-gone = Luftin käynnistysosio on poissa
drive-start-partition-not-listed = Luftin käynnistysosio puuttuu osiotaulusta
drive-no-esp = Tässä tietokoneessa ei ole EFI-järjestelmäosiota
drive-esp-full = EFI-järjestelmäosio on liian täynnä Luftin käynnistystiedostoille.
drive-esp-not-opened = EFI-järjestelmäosiota ei voitu avata
drive-esp-file-unreadable = EFI-järjestelmäosion tiedostoa { $file } ei voi lukea
drive-esp-no-drive = EFI-järjestelmäosiolla ei ole levyä
drive-esp-no-guid = EFI-järjestelmäosiolla ei ole GUID-tunnusta
drive-no-uuid = Levyllä, jolla Luftia säilytetään, ei ole UUID-tunnusta
drive-folder-unreadable = Luft ei voi käynnistyä levyltä, jolla tiedostosi ovat.
drive-folder-not-startable = Kansiosta { $folder } ei voi käynnistää

## Errors while changing Luft once it's installed

luft-gone = Luft ei ole enää tässä PC:ssä
luft-not-resizable = Luftin kokoa ei voi muuttaa Windowsista juuri nyt
luft-size-not-allowed = Luft ei voi olla tuon kokoinen
luft-space-promised = Tila on varattu Luftille. Peru ensin muutos.
luft-no-start-entry = Luftin käynnistysmerkintää ei löytynyt

## Errors while getting Luft

live-no-home-folder = Luftille ei ole kotikansiota
live-no-app-data-folder = Luftille ei ole paikallista sovellustietokansiota
live-pointer-unreadable = Uusinta Luftia ei voi lukea
live-not-published = Luftia ei ole julkaistu siellä
live-checksum-unreadable = Tarkistussummatiedostoa ei voi lukea
live-checksum-not-read = Luftin tarkistussummaa ei voitu lukea: { $error }
live-download-damaged = Lataus vahingoittui matkalla. Yritä uudelleen.
live-download-incomplete = Ladatusta Luftista puuttuu { $file }
live-download-not-resumable = Palvelin ei voi jatkaa latausta
live-not-signed = { $iso } ei ole allekirjoitettu
live-signature-unreadable = Tiedoston { $iso } allekirjoitusta ei voi lukea
live-signature-wrong-key = Lantharos ei ole allekirjoittanut tiedostoa { $iso }
live-signature-other-iso = Allekirjoitus on tiedostolle { $signed }, ei tiedostolle { $iso }
live-iso-out-of-order = ISO-tiedoston tiedostot eivät ole järjestyksessä, jota Meet Luft osaa lukea
live-iso-not-iso = Tämä ei ole ISO-levykuva
live-iso-no-root = ISO-tiedostossa ei ole juurikansiota
live-iso-no-joliet = ISO-tiedostossa ei ole Joliet-nimiä
live-not-removed = Kohdetta { $path } ei voitu poistaa: { $error }

## Errors while making a USB stick

stick-gone = Tikkua ei enää löydy. Liitä se takaisin ja valitse se uudelleen.
stick-too-small = Luft ei mahdu tälle tikulle. Käytä vähintään 4 Gt:n tikkua.
stick-damaged = ISO-tiedosto ei vastaa tarkistussummaansa. Se on voinut vahingoittua matkalla.
stick-read-back-differs = Tikulta ei luettu takaisin sitä, mitä sille kirjoitettiin. Se voi olla kulunut, joten kokeile toista.
stick-download-unavailable = Luftia ei voi ladata juuri nyt: { $error }
stick-download-failed = Luftia ei voitu ladata: { $error }
stick-checksum-unreadable = ISO-tiedoston tarkistussummaa ei voi lukea: { $error }
stick-file-unreadable = Tiedostoa { $path } ei voi lukea: { $error }
stick-iso-unreadable = ISO-tiedostoa ei voi lukea: { $error }
stick-iso-no-name = ISO-tiedostolla ei ole nimeä
stick-iso-ended-early = ISO-tiedosto päättyi ennenaikaisesti
stick-iso-already-there = { $name } on jo tikulla.
stick-no-room = Tikulla ei ole tilaa Luftille. Vapauta siltä ensin { $size } Mt.
stick-older-not-removed = Vanhempaa Luftia ei voitu poistaa: { $error }
stick-copy-stopped = Luftin kopiointi tikulle keskeytyi: { $error }
stick-not-opened = Tikkua ei voitu avata: { $error }
stick-write-stopped = Tikulle kirjoittaminen keskeytyi: { $error }
stick-not-synced = Tikku ei tallentanut kaikkea: { $error }
stick-read-back-failed = Tikkua ei voitu lukea takaisin: { $error }
stick-in-use = Tikku on yhä käytössä: { $error }
stick-device-in-use = { $device } on yhä käytössä: { $error }
stick-volume-not-opened = Tikun taltiota ei voitu avata: { $error }
stick-volume-in-use = Tikku on yhä käytössä. Sulje ohjelmat, joissa on auki tikulla olevia tiedostoja, ja yritä uudelleen ({ $error })
stick-not-dismounted = Windows ei voinut vapauttaa tikkua: { $error }
stick-not-cleared = Windows ei voinut tyhjentää tikkua: { $error }
stick-not-refreshed = Windows ei voinut tarkistaa tikkua uudelleen: { $error }
stick-not-ventoy = Tämä tikku ei enää käytä Ventoyta.
stick-ventoy-not-opened = Ventoyn osiota ei voitu avata: { $error }
stick-ventoy-not-opened-windows = Windows ei voi avata Ventoyn osiota
stick-udisks-missing = Meet Luft tarvitsee UDisksin tikun käyttöön: { $error }
