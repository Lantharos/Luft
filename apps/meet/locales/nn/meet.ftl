## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Tilbake
meet-cancel = Avbryt
meet-continue = Hald fram
meet-try-again = Prøv igjen
meet-restart = Start på nytt
meet-remove = Fjern
meet-keep-it = Behald det
meet-close = Lukk
meet-restart-title = Vil du starte på nytt no?
meet-not-yet = Ikkje enno
meet-iso-use = Bruk ei ISO-fil eg har
meet-iso-using = Brukar ISO-fila di
meet-nightly = Nattlege bygg
meet-channel-nightly = Meet Luft brukar nattlege bygg
meet-channel-latest = Meet Luft brukar utgåver igjen
meet-undo = Angre
meet-logs-saved = Loggane frå då du prøvde Luft, er lagra på skrivebordet ditt
meet-logs-show = Vis
meet-logs-none = Det finst ingen loggar frå å prøve Luft enno
meet-logs-failed = Meet Luft kunne ikkje lagre loggane frå då du prøvde Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft vart ikkje ferdig med å sjekke denne datamaskinen.
   *[windows] Meet Luft vart ikkje ferdig med å sjekke denne datamaskinen.
}
problem-room = Meet Luft vart ikkje ferdig med å lage plass til Luft.
problem-room-linux = Meet Luft vart ikkje ferdig med å gjere Luft klart.
problem-update = Oppdateringa av Luft vart ikkje fullført.
problem-download = Nedlastinga av Luft stoppa. Sjekk at du er på nett.
problem-pack = Pakkinga av tinga dine vart ikkje fullført.
problem-remove = Fjerninga av Luft vart ikkje fullført.
problem-restart = Meet Luft kunne ikkje gjere klar omstarten.
problem-tidy = Dei gamle oppstartsoppføringane kunne ikkje fjernast.
problem-firmware = Meet Luft kunne ikkje opne fastvareinnstillingane.
problem-folders = Meet Luft kunne ikkje sjå gjennom mappene dine.
problem-sticks = Meet Luft kunne ikkje sjå etter USB-stasjonar.
problem-stick = Minnepinnen vart ikkje ferdig laga.
problem-offer = Luft kan ikkje lastast ned no. Sjekk at du er på nett, eller bruk ei ISO-fil du alt har.
problem-luft = Meet Luft kunne ikkje sjå på disken til Luft.
problem-resize = Endringa av storleiken på Luft vart ikkje fullført.
problem-cancel = Meet Luft kunne ikkje avbryte endringa.
problem-give = Windows kunne ikkje ta tilbake plassen.
problem-declined = { $platform ->
    [linux] Meet Luft treng løyve frå deg for å arbeide med disken. Skriv inn passordet ditt når du blir spurd.
   *[windows] Meet Luft treng løyve frå deg for å arbeide med disken. Vel Ja når Windows spør.
}

## First screen

hello-intro = { $platform ->
    [linux] Prøv Luft rett herifrå, utan minnepinne. Liker du det, kan Luft ta plassen til dette systemet og behalde filene dine.
   *[windows] Luft kan bu rett ved sida av Windows. Prøv det først utan å installere noko, og ta med deg tinga dine når du er klar.
}
hello-check = { $platform ->
    [linux] Sjekk denne datamaskinen
   *[windows] Sjekk denne datamaskinen
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Ser på denne datamaskinen
   *[windows] Ser på denne datamaskinen
}
check-ready-title = { $platform ->
    [linux] Denne datamaskinen er klar for Luft
   *[windows] Denne datamaskinen er klar for Luft
}
check-blocked-title = Snart klar
check-moment = Dette tek eit augeblink.
check-slow = Windows reknar ut kor mykje plass det kan gje frå seg. På ein stor disk kan dette ta nokre minutt.
check-blocked-description = Noko må endrast før Luft kan flytte inn. Slik gjer du det.
check-found-description = Dette fann Meet Luft.
check-checking = Sjekkar disken, fastvara og maskinvara …
check-again = Sjekk igjen
check-action-firmware = Opne fastvareinnstillingane
check-action-tidy = Rydd opp
check-firmware-title = Vil du starte på nytt i fastvareinnstillingane?
check-firmware-description = Lagre det du arbeider med først. Slå på Secure Boot der og lagre, så startar datamaskinen igjen som vanleg.
check-tidy-title = Vil du fjerne dei gamle oppstartsoppføringane?
check-tidy-description = Dei peikar berre på system som alt er borte. Windows og alt anna startar akkurat som før.
check-get-ready-title = Vil du gjere Luft klart?
check-get-ready-file = Meet Luft kopierer Luft frå ISO-fila di til ei mappe på denne datamaskinen og legg til ei oppstartsoppføring for det. Ingen partisjonar blir endra.
check-get-ready-download = Meet Luft lastar ned Luft, om lag { $size }, til ei mappe på denne datamaskinen og legg til ei oppstartsoppføring for det. Ingen partisjonar blir endra.
check-get-ready-confirm = Gjer det klart

## Choosing how much of the Windows drive Luft gets

room-title = Kor mykje plass skal Luft få?
room-description = Windows gjer seg mindre, så det blir plass til Luft. Filene dine i Windows blir liggjande akkurat der dei er.
room-live = Windows held på plass til å vekse. Luft set òg av { $size } å starte frå, og gjev det tilbake når det er installert.
room-make = Lag plass
room-confirm-title = Vil du gje Luft { $size }?
room-confirm-file = Windows krympar disken sin, og så kopierer Meet Luft Luft frå ISO-fila di. Hald datamaskinen kopla til straum.
room-confirm-download = Windows krympar disken sin, og så lastar Meet Luft ned Luft, om lag { $size }. Hald datamaskinen kopla til straum og på nett.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kvar skal Luft vere?
room-places-description = Luft kan dele disk med Windows, eller ta plass som Windows ikkje brukar.
room-places-label = Stader for Luft
room-place-windows = Ved sida av Windows
room-place-windows-detail = Windows gjer seg mindre, så det blir plass til Luft
room-place-windows-free = { $size } er alt ledig der
room-place-free = Ledig plass på { $drive }
room-place-free-here = Ledig plass på disken til Windows
room-place-free-detail = { $size } som ingenting anna brukar
room-place-whole = Heile { $drive }
room-place-whole-detail = Slettar denne disken på { $size } for Luft
room-live-free = Av dette er { $free } alt ledig, så Windows gjev frå seg mindre og held på plass til å vekse. Luft set òg av { $size } å starte frå, og gjev det tilbake når det er installert.
room-live-elsewhere = Luft får { $room } der og set av { $size } til å starte frå, og gjev det tilbake når det er installert.
room-confirm-free-title = Vil du gje Luft { $size } ledig plass?
room-confirm-free-file = Meet Luft kopierer Luft frå ISO-fila di dit. Ingenting anna på disken blir endra.
room-confirm-free-download = Meet Luft lastar ned Luft dit, om lag { $size }. Ingenting anna på disken blir endra. Hald datamaskinen på nett.
room-erase-title = Vil du slette { $drive }?
room-erase-description = Alt på denne disken på { $size } blir sletta med ein gong, før Luft startar. Dette kan ikkje angrast. Dette ligg på han no:
room-erase-empty = Windows kan ikkje lese noko på denne disken på { $size }, men alt som ligg på han, blir sletta med ein gong. Dette kan ikkje angrast.
room-erase-unnamed = Partisjon utan namn
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Kryptert med BitLocker
room-erase-understood = Eg veit at noko av det er kryptert med BitLocker og ikkje kan hentast tilbake
room-erase-confirm = Slett og lag plass

## Luft is ready on Windows

ready-title = Luft er klart
ready-description = Vel korleis du vil bli kjend med det. Windows startar som vanleg etterpå, med mindre du installerer Luft og vel det.
ready-update-title = Hent nyaste Luft
ready-update-description = Eit nyare bygg er ute. Det erstattar dette og held på plassen og alt du har pakka.
ready-try-title = Prøv Luft
ready-try-description = Start på nytt i Luft utan å installere noko. Windows startar som vanleg neste gong.
ready-box-description = Pakk dokument, bilete, Wi-Fi-nettverk og meir, så pakkar Luft det ut når det er installert.
ready-box-packed = Pakka, { $size }
ready-install-title = Installer Luft
ready-install-description = Start på nytt i installasjonsprogrammet. Dei { $size } ved sida av Windows ventar alt på det.
ready-install-drive-description = Start på nytt i installasjonsprogrammet. Dei { $size } på { $drive } ventar alt på det.
ready-stick-description = Legg Luft på ein minnepinne for å starte det på kva datamaskin som helst.
ready-remove = Fjern Luft frå denne datamaskinen
ready-restart-try = Lagre det du arbeider med først. Luft opnar seg om eit minutt eller så, og neste omstart tek deg tilbake til Windows.
ready-restart-install = Lagre det du arbeider med først. Installasjonsprogrammet opnar seg om eit minutt eller så, og ingenting blir endra før du stadfestar der.
ready-fast-startup-title = Slå av Rask oppstart i Windows
ready-fast-startup-description = Windows blir då slått heilt av, så lyd, Wi-Fi og Bluetooth startar på nytt i Luft.
ready-clock-title = Hald klokka rett i begge
ready-clock-description = Windows les klokka i datamaskinen på same måte som Luft, så tida hoppar ikkje lenger når du byter.
ready-remove-title = Vil du fjerne Luft frå denne datamaskinen?
ready-remove-description = Meet Luft slettar alt det la til, òg flytteeska, og gjev Windows all plassen tilbake.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Vel korleis du vil bli kjend med det. { $system } held fram med å starte som vanleg til du bestemmer noko anna.
linux-ready-this-system = dette systemet
linux-ready-update-description = Eit nyare bygg er ute. Det erstattar det Meet Luft har lagra, og held på loggane frå då du prøvde det.
linux-ready-try-description = Start på nytt i Luft utan å endre noko. { $system } startar som vanleg neste gong.
linux-ready-replace-title = Erstatt { $system }
linux-ready-replace-description = Luft tek plassen og held på filene dine, kontoen din, Wi-Fi-nettverk og andre diskar. Det gamle systemet blir liggjande til du fjernar det.
linux-ready-install-description = Start på nytt i installasjonsprogrammet for å leggje Luft på ein annan disk eller på ledig plass.
linux-ready-remove = Fjern Luft frå denne datamaskinen
linux-ready-restart-try = Lagre det du arbeider med først. Luft opnar seg om eit minutt eller så, og neste omstart tek deg tilbake til { $system }.
linux-ready-restart-replace = Lagre det du arbeider med først. Installasjonsprogrammet opnar seg med { $system } valt for å bli erstatta, og viser kva som blir verande før noko blir endra.
linux-ready-remove-title = Vil du fjerne Luft frå denne datamaskinen?
linux-ready-remove-description = Meet Luft slettar filene til Luft, oppstartsfilene og oppstartsoppføringa. Alt anna blir verande som det er.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Ditt Luft
luft-looking = Meet Luft fann Luft på denne datamaskinen.
luft-checking = Ser på disken til Luft …
luft-description-beside = Luft er installert ved sida av Windows på denne datamaskinen.
luft-description-drive = Luft er installert på { $drive }.
luft-bar-used = { $size }, { $used } brukt
luft-resize-title = Endre kor mykje plass Luft har
luft-resize-description = Gje Luft meir av plassen til Windows, eller gje noko tilbake til Windows.
luft-resize-drive-description = Gje Luft meir av den ledige plassen på { $drive }, eller la noko av han stå ledig.
luft-resize-reencrypting = Luft held framleis på å kryptere eller dekryptere disken sin. Når det er ferdig, kan storleiken endrast.
luft-resize-passphrase = Disken til Luft kan berre opnast med ein passfrase, og Luft kan ikkje skrive han inn sjølv medan det flyttar.
luft-resize-start-first = Start Luft éin gong, så det kan fortelje Meet Luft kor fullt det er, og kom så tilbake.
luft-resize-apart = Ein annan partisjon ligg mellom Windows og Luft, så dei kan ikkje dele plassen.
luft-pending-grow = Luft veks neste gong det startar
luft-pending-grow-description = Start på nytt i Luft og la det stå på i nokre minutt medan det flyttar inn på den nye plassen. Du kan bruke det i mellomtida.
luft-pending-shrink = Luft lagar plass neste gong det startar
luft-pending-shrink-description = Start på nytt i Luft og la det stå på i nokre minutt medan det flyttar filene sine. Opne så Meet Luft i Windows igjen for å gje Windows plassen.
luft-pending-trim = Luft blir mindre neste gong det startar
luft-pending-trim-description = Start på nytt i Luft, så gjer det seg mindre i løpet av eit minutts tid.
luft-windows-free-title = Gje Windows den ledige plassen
luft-windows-free-description = { $size } rett etter Windows blir ikkje brukt av noko. Windows kan ta han tilbake.
luft-leftovers-title = Rydd opp etter at du prøvde Luft
luft-leftovers-description = Partisjonane Meet Luft laga for å starte Luft, er her framleis. Luft treng dei ikkje lenger.
luft-start = Start på nytt i Luft
luft-cancel = Avbryt endringa
luft-restart = Lagre det du arbeider med først. Luft startar om eit minutt eller så, og neste omstart tek deg tilbake til Windows.
luft-restart-pending = Lagre det du arbeider med først. Luft startar om eit minutt eller så og flyttar filene sine sjølv, noko som tek nokre minutt. Du kan bruke det i mellomtida.
luft-remove = Fjern Luft frå denne datamaskinen
luft-remove-title = Vil du fjerne Luft frå denne datamaskinen?
luft-remove-description = Luft og alt i det blir sletta, { $size } til saman, og Windows får plassen tilbake. Datamaskinen startar Windows som før. Dette kan ikkje angrast.
luft-remove-drive-description = Luft og alt i det blir sletta frå { $drive }, { $size } til saman. Datamaskinen startar Windows som før. Dette kan ikkje angrast.
luft-remove-confirm = Fjern Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kor mykje plass skal Luft få?
resize-description = Dra for å dele disken mellom Windows og Luft. Luft gjer endringa sjølv neste gong det startar.
resize-measuring = Windows reknar ut kor mykje plass det kan gje frå seg. På ein stor disk kan dette ta nokre minutt.
resize-full = Luft er for fullt til å flyttast, og Windows kan ikkje gje frå seg nok plass til det. Lag litt plass i Luft eller i Windows først.
resize-drive-description = Dra for å velje kor mykje av { $drive } Luft skal få. Luft gjer endringa sjølv neste gong det startar.
resize-drive-free = { $size } ledig på { $drive }
resize-used = Filene til Luft tek opp { $size }.
resize-least = Endre storleiken med minst { $size }.
resize-apply = Endre
resize-grow-title = Vil du gje Luft { $size } meir?
resize-grow-description = Windows gjer seg mindre med ein gong. Luft flyttar inn på den nye plassen neste gong det startar, noko som tek nokre minutt. Hald datamaskinen kopla til straum.
resize-grow-drive-description = Luft tek over den ledige plassen på { $drive } neste gong det startar, noko som tek ein augeblink.
resize-trim-title = Vil du gjere Luft { $size } mindre?
resize-trim-description = Luft gjer seg mindre neste gong det startar, og plassen på { $drive } blir ståande ledig.
resize-shrink-title = Vil du gje Windows { $size } tilbake?
resize-shrink-description = Luft flyttar filene sine neste gong det startar, noko som tek nokre minutt. Opne så Meet Luft igjen, så tek Windows plassen tilbake. Hald datamaskinen kopla til straum.

## Packing things to take along to Luft (the moving box)

box-title = Ta med tinga dine
box-description = Vel kva du vil ta med. Luft pakkar det ut i den nye kontoen din når det er installert, og ingenting blir fjerna frå Windows.
box-looking = Ser gjennom mappene dine …
box-folder-desktop = Skrivebord
box-folder-documents = Dokument
box-folder-downloads = Nedlastingar
box-folder-music = Musikk
box-folder-pictures = Bilete
box-folder-videos = Videoar
box-folder-size = { $size }, { $files ->
    [one] { $files } fil
   *[other] { $files } filer
}
box-wifi-title = Wi-Fi-nettverk
box-wifi-description = Med passorda, så Luft er på nett med ein gong
box-bluetooth-title = Bluetooth-einingar
box-bluetooth-description = { $devices ->
    [one] { $devices } eining, klar utan å bli para på nytt
   *[other] { $devices } einingar, klare utan å bli para på nytt
}
box-wallpaper-title = Bakgrunnsbilete
box-wallpaper-description = Biletet på skrivebordet ditt i Windows
box-account-title = Namnet og biletet ditt
box-total-slow = { $size }, som tek om lag { $minutes ->
    [one] { $minutes } minutt
   *[other] { $minutes } minutt
} å pakke
box-pack = Pakk

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Lagar plass
    .description = Windows flyttar filene sine for å lage plass. Dette kan ta nokre minutt.
working-erasing = Slettar disken
    .description = Windows tømer han, så Luft kan få heile.
working-partitioning = Gjer klar plassen til Luft
    .description = Lagar partisjonane som Luft startar frå.
working-downloading = Hentar Luft
    .description = Luft blir kopiert rett inn på sin eigen plass og kontrollert undervegs.
working-packing = Pakkar tinga dine
    .description = Kopierer alt du valde, til flytteeska. Store mapper tek litt tid.
working-removing = Fjernar Luft
    .description = Gjev plassen tilbake til Windows.
working-removing-linux = Fjernar Luft
    .description = Tek bort filene og oppstartsoppføringa.
working-writing = Lagar minnepinnen
    .description = Luft blir skrive over heile minnepinnen. La han stå i.
working-copying = Legg Luft til i Ventoy
    .description = Luft blir kopiert ved sida av dei andre ISO-filene på minnepinnen. La han stå i.
working-verifying = Sjekkar minnepinnen
    .description = Les alt tilbake for å vere sikker på at han startar.
working-stick-downloading = Lastar ned Luft
    .description = Det blir kontrollert undervegs og teke vare på, så neste minnepinne går raskare.
working-progress = { $done } av { $total }
working-keep-open = La dette vindauget vere ope.

## After Luft was removed

removed-title = Alt er som før
removed-description = { $platform ->
    [linux] Filene og oppstartsoppføringa til Luft er borte, og datamaskinen startar akkurat som før. Kom gjerne tilbake når du vil.
   *[windows] Partisjonane og oppstartsoppføringa til Luft er borte, og Windows har all plassen sin igjen. Kom gjerne tilbake når du vil.
}

## Making a USB stick

stick-title = Lag ein minnepinne
stick-description = Luft startar frå han på kva datamaskin som helst, for å prøve det eller installere det.
stick-looking = Ser etter USB-stasjonar …
stick-none = Set inn ein minnepinne på { $size } eller meir. Han dukkar opp her.
stick-drives-label = USB-stasjonar
stick-offer = { $name }, { $size }
stick-make = Lag minnepinnen
stick-drive-empty = Tom
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · For liten for Luft
stick-ventoy-title = Denne minnepinnen brukar Ventoy
stick-ventoy-description = Vil du leggje Luft til på han, eller slette heile minnepinnen og gjere han til ein Luft-pinne?
stick-erase-it = Slett han
stick-add = Legg til Luft
stick-replace-title = Vil du erstatte Luft på han?
stick-replace-description = { $count ->
    [one] { $names } ligg alt på denne minnepinnen. Den nye versjonen av Luft kan ta plassen.
   *[other] { $names } ligg alt på denne minnepinnen. Den nye versjonen av Luft kan ta plassen deira.
}
stick-keep = { $count ->
    [one] Behald begge
   *[other] Behald alle
}
stick-replace = Erstatt
stick-full-title = Det er ikkje plass til Luft
stick-full-description = Luft treng { $needed }, og { $free } er ledig på denne minnepinnen. Lag plass på han, eller slett han og gjer han til ein Luft-pinne.
stick-erase-title = Vil du slette { $name }?
stick-erase-description = Alt på denne minnepinnen på { $size } blir sletta og erstatta med Luft. Dette kan ikkje angrast.
stick-erase-confirm = Slett og lag minnepinnen
stick-done-title = Luft-pinnen din er klar
stick-done-ventoy-title = Luft ligg på Ventoy-pinnen din
stick-done-take-out = No kan du ta han ut.
stick-done-eject = Løys han ut før du tek han ut.
stick-done-start = For å starte frå han set du han inn og vel han i oppstartsmenyen til datamaskinen, som du opnar med ein tast som F12, F8 eller Esc rett etter at du har slått på.
stick-done-ventoy-key = Når Secure Boot er på, ber Ventoy éin gong om å registrere sin eigen nøkkel første gongen han startar.
stick-done = Ferdig
stick-done-another = Lag ein til
