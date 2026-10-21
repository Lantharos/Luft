## Messages that some steps share

meet-back = Tagasi
meet-cancel = Loobu
meet-continue = Jätka
meet-try-again = Proovi uuesti
meet-restart = Taaskäivita
meet-remove = Eemalda
meet-keep-it = Jäta alles
meet-close = Sulge
meet-restart-title = Kas taaskäivitada kohe?
meet-not-yet = Mitte veel
meet-iso-use = Kasuta olemasolevat ISO-faili
meet-iso-using = Kasutatakse teie Lufti ISO-faili
meet-nightly = Öised järgud
meet-channel-nightly = Meet Luft kasutab öiseid järke
meet-channel-latest = Meet Luft kasutab taas väljalaskeid
meet-undo = Võta tagasi
meet-logs-saved = Lufti proovimise logid salvestati töölauale
meet-logs-show = Kuva
meet-logs-none = Lufti proovimisest pole veel logisid
meet-logs-failed = Meet Luft ei saanud Lufti proovimise logisid salvestada

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft ei saanud selle arvuti kontrollimist lõpetada.
   *[windows] Meet Luft ei saanud selle arvuti kontrollimist lõpetada.
}
problem-room = Luftile ruumi tegemine jäi pooleli.
problem-room-linux = Lufti ettevalmistamine jäi pooleli.
problem-update = Lufti värskendamine jäi pooleli.
problem-download = Lufti allalaadimine katkes. Kontrollige, kas olete võrgus.
problem-pack = Teie asjade pakkimine jäi pooleli.
problem-remove = Lufti eemaldamine jäi pooleli.
problem-restart = Meet Luft ei saanud taaskäivitust seadistada.
problem-tidy = Vanu käivituskirjeid ei saanud eemaldada.
problem-firmware = Meet Luft ei saanud püsivara sätteid avada.
problem-folders = Meet Luft ei saanud teie kaustu läbi vaadata.
problem-sticks = Meet Luft ei saanud USB-draive otsida.
problem-stick = Mälupulga tegemine jäi pooleli.
problem-offer = Lufti ei saa praegu alla laadida. Kontrollige, kas olete võrgus, või kasutage olemasolevat ISO-faili.
problem-luft = Meet Luft ei saanud Lufti ketast kontrollida.
problem-resize = Lufti suuruse muutmine jäi pooleli.
problem-cancel = Meet Luft ei saanud muudatust tühistada.
problem-give = Windows ei saanud ruumi tagasi võtta.
problem-declined = { $platform ->
    [linux] Meet Luft vajab kettal toimetamiseks teie luba. Sisestage küsimisel oma parool.
   *[windows] Meet Luft vajab kettal toimetamiseks teie luba. Kui Windows küsib, valige Jah.
}

## First screen

hello-intro = { $platform ->
    [linux] Proovige Lufti otse siit, ilma USB-mälupulgata. Kui see meeldib, võib Luft selle süsteemi asemele tulla ja teie failid alles jätta.
   *[windows] Luft saab elada otse Windowsi kõrval. Proovige seda esmalt ilma midagi installimata ja võtke oma asjad kaasa, kui olete valmis.
}
hello-check = { $platform ->
    [linux] Kontrolli seda arvutit
   *[windows] Kontrolli seda arvutit
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Arvuti kontrollimine
   *[windows] Arvuti kontrollimine
}
check-ready-title = { $platform ->
    [linux] See arvuti on Lufti jaoks valmis
   *[windows] See arvuti on Lufti jaoks valmis
}
check-blocked-title = Peaaegu valmis
check-moment = See võtab hetke.
check-slow = Windows arvutab, kui palju ruumi see loovutada saab. Suurel kettal võib see võtta mõne minuti.
check-blocked-description = Enne kui Luft sisse kolida saab, tuleb midagi muuta. Toimige nii.
check-found-description = Meet Luft leidis järgmist.
check-checking = Ketta, püsivara ja riistvara kontrollimine…
check-again = Kontrolli uuesti
check-action-firmware = Ava püsivara sätted
check-action-tidy = Korista
check-firmware-title = Kas taaskäivitada püsivara sätetesse?
check-firmware-description = Salvestage esmalt pooleliolev töö. Lülitage seal sisse Secure Boot ja salvestage, siis käivitub arvuti taas tavapäraselt.
check-tidy-title = Kas eemaldada vanad käivituskirjed?
check-tidy-description = Need viitavad ainult süsteemidele, mida enam pole. Windows ja kõik muu käivituvad täpselt nagu varem.
check-get-ready-title = Kas valmistada Luft ette?
check-get-ready-file = Meet Luft kopeerib Lufti teie ISO-failist selle arvuti kausta ja lisab sellele käivituskirje. Partitsioone ei muudeta.
check-get-ready-download = Meet Luft laadib Lufti (umbes { $size }) selle arvuti kausta ja lisab sellele käivituskirje. Partitsioone ei muudeta.
check-get-ready-confirm = Valmista ette

## Choosing how much of the Windows drive Luft gets

room-title = Kui palju ruumi Luftile?
room-description = Windows teeb end väiksemaks, et Luftile ruumi anda. Teie Windowsi failid jäävad täpselt sinna, kus nad on.
room-live = Windowsile jääb kasvuruumi. Luft jätab lisaks käivitamiseks kõrvale { $size }, mille ta pärast installimist tagasi annab.
room-make = Tee ruumi
room-confirm-title = Kas anda Luftile { $size }?
room-confirm-file = Windows kahandab oma ketast, seejärel kopeerib Meet Luft Lufti teie ISO-failist. Hoidke arvuti vooluvõrgus.
room-confirm-download = Windows kahandab oma ketast, seejärel laadib Meet Luft alla Lufti (umbes { $size }). Hoidke arvuti vooluvõrgus ja võrguühenduses.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kuhu Luft paigutada?
room-places-description = Luft saab jagada Windowsi ketast või võtta ruumi, mida Windows ei kasuta.
room-places-label = Lufti asukohad
room-place-windows = Windowsi kõrvale
room-place-windows-detail = Windows teeb end väiksemaks, et Luftile ruumi anda
room-place-windows-free = Seal on juba vaba { $size }
room-place-free = Vaba ruum kettal { $drive }
room-place-free-here = Vaba ruum Windowsi kettal
room-place-free-detail = { $size }, mida miski muu ei kasuta
room-place-whole = Kogu ketas { $drive }
room-place-whole-detail = Kustutab Lufti jaoks selle ketta ({ $size })
room-live-free = Sellest on juba vaba { $free }, nii et Windows loovutab vähem ja talle jääb kasvuruumi. Luft jätab lisaks käivitamiseks kõrvale { $size }, mille ta pärast installimist tagasi annab.
room-live-elsewhere = Luft saab sealt { $room } ja jätab käivitamiseks kõrvale veel { $size }, mille ta pärast installimist tagasi annab.
room-confirm-free-title = Kas anda Luftile { $size } vaba ruumi?
room-confirm-free-file = Meet Luft kopeerib Lufti sinna teie ISO-failist. Muu kettal ei muutu.
room-confirm-free-download = Meet Luft laadib Lufti (umbes { $size }) sinna alla. Muu kettal ei muutu. Hoidke arvuti võrguühenduses.
room-erase-title = Kas kustutada { $drive }?
room-erase-description = Kõik sellel kettal ({ $size }) kustutatakse kohe, enne kui Luft käivitub. Seda ei saa tagasi võtta. Praegu on sellel:
room-erase-empty = Windows ei suuda sellelt kettalt ({ $size }) midagi lugeda, kuid kõik, mis sellel on, kustutatakse kohe. Seda ei saa tagasi võtta.
room-erase-unnamed = Nimetu partitsioon
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = BitLockeriga krüptitud
room-erase-understood = Saan aru, et osa sellest on BitLockeriga krüptitud ja seda ei saa taastada
room-erase-confirm = Kustuta ja tee ruumi

## Luft is ready on Windows

ready-title = Luft on valmis
ready-description = Valige, kuidas soovite sellega tutvuda. Windows käivitub hiljem tavapäraselt, kui te just Lufti ei installi ega seda ei vali.
ready-update-title = Hangi uusim Luft
ready-update-description = Saadaval on uuem järk. See asendab praeguse ning jätab alles ruumi ja kõik, mille olete pakkinud.
ready-try-title = Proovi Lufti
ready-try-description = Taaskäivitage Lufti ilma midagi installimata. Järgmisel korral käivitub Windows tavapäraselt.
ready-box-description = Pakkige dokumendid, fotod, Wi-Fi-võrgud ja muu, et Luft need pärast installimist lahti pakiks.
ready-box-packed = Pakitud, { $size }
ready-install-title = Lufti installimine
ready-install-description = Taaskäivitage installerisse. Windowsi kõrval olev ruum ({ $size }) ootab seda juba.
ready-install-drive-description = Taaskäivitage installerisse. Kettal { $drive } olev ruum ({ $size }) ootab seda juba.
ready-stick-description = Pange Luft mälupulgale, et seda mis tahes arvutis käivitada.
ready-remove = Eemalda Luft sellest arvutist
ready-restart-try = Salvestage esmalt pooleliolev töö. Luft avaneb umbes minuti pärast ja järgmine taaskäivitus viib teid tagasi Windowsi.
ready-restart-install = Salvestage esmalt pooleliolev töö. Installer avaneb umbes minuti pärast ja midagi ei muutu enne, kui te seal kinnitate.
ready-fast-startup-title = Lülita Windowsi kiirkäivitus välja
ready-fast-startup-description = Siis lülitub Windows täielikult välja, nii et heli, Wi-Fi ja Bluetooth käivituvad Luftis puhtalt.
ready-clock-title = Hoia kell mõlemas õige
ready-clock-description = Windows loeb arvuti kella samamoodi nagu Luft, nii et aeg ei hüppa enam, kui süsteemi vahetate.
ready-remove-title = Kas eemaldada Luft sellest arvutist?
ready-remove-description = Meet Luft kustutab kõik, mille see lisas, ka kolimiskasti, ja annab Windowsile kogu ruumi tagasi.

## Luft is ready on Linux

linux-ready-description = Valige, kuidas soovite sellega tutvuda. Süsteem { $system } käivitub tavapäraselt, kuni te teisiti ei otsusta.
linux-ready-this-system = see süsteem
linux-ready-update-description = Saadaval on uuem järk. See asendab Meet Lufti hoitava järgu ja jätab proovimise logid alles.
linux-ready-try-description = Taaskäivitage Lufti ilma midagi muutmata. Järgmisel korral käivitub { $system } tavapäraselt.
linux-ready-replace-title = Asenda { $system }
linux-ready-replace-description = Luft tuleb selle asemele ja jätab alles teie failid, konto, Wi-Fi-võrgud ja teised kettad. Vana süsteem jääb alles, kuni selle eemaldate.
linux-ready-install-description = Taaskäivitage installerisse, et panna Luft teisele kettale või vabale ruumile.
linux-ready-remove = Eemalda Luft sellest arvutist
linux-ready-restart-try = Salvestage esmalt pooleliolev töö. Luft avaneb umbes minuti pärast ja järgmine taaskäivitus viib teid tagasi süsteemi { $system }.
linux-ready-restart-replace = Salvestage esmalt pooleliolev töö. Installer avaneb nii, et asendamiseks on valitud { $system }, ja näitab enne muudatusi, mis alles jääb.
linux-ready-remove-title = Kas eemaldada Luft sellest arvutist?
linux-ready-remove-description = Meet Luft kustutab Lufti failid, käivitusfailid ja käivituskirje. Kõik muu jääb nii, nagu on.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Teie Luft
luft-looking = Meet Luft leidis sellest arvutist Lufti.
luft-checking = Lufti ketta kontrollimine…
luft-description-beside = Luft on selles arvutis installitud Windowsi kõrvale.
luft-description-drive = Luft on installitud kettale { $drive }.
luft-bar-used = { $size }, kasutusel { $used }
luft-resize-title = Muuda Lufti ruumi suurust
luft-resize-description = Andke Luftile rohkem Windowsi ruumi või andke osa Windowsile tagasi.
luft-resize-encrypted = Lufti ketas on krüptitud, nii et selle teisaldamiseks oleks vaja taastevõtit. Lülitage esmalt Lufti Sätetes seadme krüptimine välja ja tulge siis tagasi.
luft-resize-apart = Windowsi ja Lufti vahel on teine partitsioon, nii et nad ei saa oma ruumi jagada.
luft-resize-unreadable = Meet Luft ei suutnud kindlaks teha, kui täis Luft on.
luft-pending-grow = Luft kasvab järgmisel käivitamisel
luft-pending-grow-description = Taaskäivitage Lufti ja jätke see mõneks minutiks sisse, kuni see uude ruumi kolib. Võite seda vahepeal edasi kasutada.
luft-pending-shrink = Luft teeb järgmisel käivitamisel ruumi
luft-pending-shrink-description = Taaskäivitage Lufti ja jätke see mõneks minutiks sisse, kuni see oma faile teisaldab. Seejärel avage Windowsis uuesti Meet Luft, et Windows ruumi saaks.
luft-windows-free-title = Anna vaba ruum Windowsile
luft-windows-free-description = Kohe Windowsi järel olev { $size } on kasutamata. Windows saab selle tagasi võtta.
luft-leftovers-title = Korista pärast Lufti proovimist
luft-leftovers-description = Partitsioonid, mille Meet Luft Lufti käivitamiseks tegi, on endiselt alles. Luft ei vaja neid enam.
luft-start = Taaskäivita Lufti
luft-cancel = Tühista muudatus
luft-restart = Salvestage esmalt pooleliolev töö. Luft käivitub umbes minuti pärast ja järgmine taaskäivitus viib teid tagasi Windowsi.
luft-restart-pending = Salvestage esmalt pooleliolev töö. Luft käivitub umbes minuti pärast ja teisaldab oma failid ise, mis võtab mõne minuti. Võite seda vahepeal kasutada.
luft-remove = Eemalda Luft sellest arvutist
luft-remove-title = Kas eemaldada Luft sellest arvutist?
luft-remove-description = Luft ja kõik selles kustutatakse, kokku { $size }, ja Windows saab ruumi tagasi. Arvuti käivitab Windowsi nagu varem. Seda ei saa tagasi võtta.
luft-remove-drive-description = Luft ja kõik selles kustutatakse kettalt { $drive }, kokku { $size }. Arvuti käivitab Windowsi nagu varem. Seda ei saa tagasi võtta.
luft-remove-confirm = Eemalda Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kui palju ruumi Luftile?
resize-description = Lohistage, et jagada ketas Windowsi ja Lufti vahel. Luft teeb muudatuse ise järgmisel käivitamisel.
resize-measuring = Windows arvutab, kui palju ruumi see loovutada saab. Suurel kettal võib see võtta mõne minuti.
resize-full = Luft on teisaldamiseks liiga täis ja Windows ei saa sellele piisavalt ruumi loovutada. Tehke esmalt ruumi Luftis või Windowsis.
resize-used = Lufti failid võtavad { $size }.
resize-least = Muutke vähemalt { $size } võrra.
resize-apply = Muuda
resize-grow-title = Kas anda Luftile { $size } juurde?
resize-grow-description = Windows teeb end kohe väiksemaks. Luft kolib uude ruumi järgmisel käivitamisel, mis võtab mõne minuti. Hoidke arvuti vooluvõrgus.
resize-shrink-title = Kas anda Windowsile { $size } tagasi?
resize-shrink-description = Luft teisaldab oma failid järgmisel käivitamisel, mis võtab mõne minuti. Seejärel avage uuesti Meet Luft ja Windows võtab ruumi tagasi. Hoidke arvuti vooluvõrgus.

## Packing things to take along to Luft (the moving box)

box-title = Võtke oma asjad kaasa
box-description = Valige, mida kaasa võtta. Luft pakib selle pärast installimist teie uude kontosse lahti ja Windowsist ei eemaldata midagi.
box-looking = Kaustade läbivaatamine…
box-folder-desktop = Töölaud
box-folder-documents = Dokumendid
box-folder-downloads = Allalaadimised
box-folder-music = Muusika
box-folder-pictures = Pildid
box-folder-videos = Videod
box-folder-size = { $size }, { $files ->
    [one] { $files } fail
   *[other] { $files } faili
}
box-wifi-title = Wi-Fi-võrgud
box-wifi-description = Koos paroolidega, nii et Luft on kohe võrgus
box-bluetooth-title = Bluetooth-seadmed
box-bluetooth-description = { $devices ->
    [one] { $devices } seade, valmis ilma uuesti sidumata
   *[other] { $devices } seadet, valmis ilma uuesti sidumata
}
box-wallpaper-title = Taustapilt
box-wallpaper-description = Teie Windowsi töölaua pilt
box-account-title = Teie nimi ja pilt
box-total-slow = { $size }, pakkimine võtab umbes { $minutes ->
    [one] { $minutes } minuti
   *[other] { $minutes } minutit
}
box-pack = Paki

## Progress while Meet Luft works

working-shrinking = Ruumi tegemine
    .description = Windows teisaldab ruumi tegemiseks oma faile. See võib võtta mõne minuti.
working-erasing = Ketta kustutamine
    .description = Windows tühjendab selle, et Luft saaks selle tervenisti.
working-partitioning = Lufti ruumi seadistamine
    .description = Partitsioonide ettevalmistamine, millelt Luft käivitub.
working-downloading = Lufti toomine
    .description = Luft kopeeritakse otse tema enda ruumi ja kontrollitakse teel.
working-packing = Teie asjade pakkimine
    .description = Kõik valitu kopeeritakse kolimiskasti. Suured kaustad võtavad aega.
working-removing = Lufti eemaldamine
    .description = Ruum antakse Windowsile tagasi.
working-removing-linux = Lufti eemaldamine
    .description = Selle failide ja käivituskirje eemaldamine.
working-writing = Mälupulga tegemine
    .description = Luft kirjutatakse kogu mälupulgale. Hoidke see ühendatuna.
working-copying = Lufti lisamine Ventoysse
    .description = Luft kopeeritakse mälupulgale teiste ISO-failide kõrvale. Hoidke see ühendatuna.
working-verifying = Mälupulga kontrollimine
    .description = Kõik loetakse tagasi, et see kindlasti käivituks.
working-stick-downloading = Lufti allalaadimine
    .description = Seda kontrollitakse teel ja hoitakse alles, nii et järgmine mälupulk valmib kiiremini.
working-progress = { $done } / { $total }
working-keep-open = Hoidke see aken avatuna.

## After Luft was removed

removed-title = Kõik on nagu enne
removed-description = { $platform ->
    [linux] Lufti failid ja käivituskirje on eemaldatud ning arvuti käivitub täpselt nagu varem. Tulge tagasi millal iganes.
   *[windows] Lufti partitsioonid ja käivituskirje on eemaldatud ning Windowsil on taas kogu oma ruum. Tulge tagasi millal iganes.
}

## Making a USB stick

stick-title = Tee USB-mälupulk
stick-description = Luft käivitub sellelt mis tahes arvutis, et seda proovida või installida.
stick-looking = USB-draivide otsimine…
stick-none = Ühendage USB-mälupulk, mille maht on vähemalt { $size }. See ilmub siia.
stick-drives-label = USB-draivid
stick-offer = { $name }, { $size }
stick-make = Tee mälupulk
stick-drive-empty = Tühi
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Lufti jaoks liiga väike
stick-ventoy-title = See mälupulk kasutab Ventoyd
stick-ventoy-description = Kas lisada Luft sellele või kustutada kogu mälupulk ja teha sellest Lufti mälupulk?
stick-erase-it = Kustuta
stick-add = Lisa Luft
stick-replace-title = Kas asendada sellel olev Luft?
stick-replace-description = { $count ->
    [one] { $names } on juba sellel mälupulgal. Uus Luft võib selle asemele tulla.
   *[other] { $names } on juba sellel mälupulgal. Uus Luft võib nende asemele tulla.
}
stick-keep = { $count ->
    [one] Jäta mõlemad
   *[other] Jäta kõik
}
stick-replace = Asenda
stick-full-title = Luftile pole ruumi
stick-full-description = Luft vajab { $needed } ja sellel mälupulgal on vaba { $free }. Tehke sellele ruumi või kustutage see ja tehke sellest Lufti mälupulk.
stick-erase-title = Kas kustutada { $name }?
stick-erase-description = Kõik sellel mälupulgal ({ $size }) kustutatakse ja asendatakse Luftiga. Seda ei saa tagasi võtta.
stick-erase-confirm = Kustuta ja tee mälupulk
stick-done-title = Teie Lufti mälupulk on valmis
stick-done-ventoy-title = Luft on teie Ventoy mälupulgal
stick-done-take-out = Nüüd võite selle eemaldada.
stick-done-eject = Väljutage see enne eemaldamist.
stick-done-start = Sellelt käivitamiseks ühendage see ja valige see arvuti alglaadimismenüüst, mis avaneb kohe pärast sisselülitamist klahviga, nagu F12, F8 või Esc.
stick-done-ventoy-key = Kui Secure Boot on sees, palub Ventoy esimesel käivitamisel ühe korra oma võtme registreerida.
stick-done = Valmis
stick-done-another = Tee veel üks
