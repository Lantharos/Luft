## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Terug
meet-cancel = Annuleren
meet-continue = Doorgaan
meet-try-again = Opnieuw proberen
meet-restart = Opnieuw opstarten
meet-remove = Verwijderen
meet-keep-it = Behouden
meet-close = Sluiten
meet-restart-title = Nu opnieuw opstarten?
meet-not-yet = Nog niet
meet-iso-use = Een iso gebruiken die ik al heb
meet-iso-using = Je Luft-iso wordt gebruikt
meet-nightly = Nightly builds
meet-channel-nightly = Meet Luft gebruikt nightly builds
meet-channel-latest = Meet Luft gebruikt weer releases
meet-undo = Ongedaan maken
meet-logs-saved = De logboeken van het uitproberen van Luft staan op je bureaublad
meet-logs-show = Tonen
meet-logs-none = Er zijn nog geen logboeken van het uitproberen van Luft
meet-logs-failed = Meet Luft kon de logboeken van het uitproberen van Luft niet opslaan

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft kon deze computer niet volledig controleren.
   *[windows] Meet Luft kon deze pc niet volledig controleren.
}
problem-room = Ruimte maken voor Luft is niet afgerond.
problem-room-linux = Luft klaarzetten is niet afgerond.
problem-update = Luft bijwerken is niet afgerond.
problem-download = Het downloaden van Luft is gestopt. Controleer of je online bent.
problem-pack = Je spullen inpakken is niet afgerond.
problem-remove = Luft verwijderen is niet afgerond.
problem-restart = Meet Luft kon de herstart niet voorbereiden.
problem-tidy = De oude opstartvermeldingen konden niet worden verwijderd.
problem-firmware = Meet Luft kon de firmware-instellingen niet openen.
problem-folders = Meet Luft kon je mappen niet doorzoeken.
problem-sticks = Meet Luft kon niet naar usb-schijven zoeken.
problem-stick = Het maken van de stick is niet afgerond.
problem-offer = Luft kan nu niet worden gedownload. Controleer of je online bent, of gebruik een iso die je al hebt.
problem-luft = Meet Luft kon de schijf van Luft niet bekijken.
problem-resize = De grootte van Luft wijzigen is niet afgerond.
problem-cancel = Meet Luft kon de wijziging niet annuleren.
problem-give = Windows kon de ruimte niet terugnemen.
problem-declined = { $platform ->
    [linux] Meet Luft heeft je toestemming nodig om met de schijf te werken. Voer je wachtwoord in als erom wordt gevraagd.
   *[windows] Meet Luft heeft je toestemming nodig om met de schijf te werken. Kies Ja als Windows erom vraagt.
}

## First screen

hello-intro = { $platform ->
    [linux] Probeer Luft meteen vanaf hier, zonder usb-stick. Bevalt het, dan kan Luft de plaats van dit systeem innemen en je bestanden houden.
   *[windows] Luft kan gewoon naast Windows staan. Probeer het eerst zonder iets te installeren, en neem je spullen mee zodra je er klaar voor bent.
}
hello-check = { $platform ->
    [linux] Deze computer controleren
   *[windows] Deze pc controleren
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Deze computer wordt bekeken
   *[windows] Deze pc wordt bekeken
}
check-ready-title = { $platform ->
    [linux] Deze computer is klaar voor Luft
   *[windows] Deze pc is klaar voor Luft
}
check-blocked-title = Bijna zover
check-moment = Dit duurt even.
check-slow = Windows berekent hoeveel ruimte het kan missen. Op een grote schijf kan dat een paar minuten duren.
check-blocked-description = Er moet nog iets veranderen voordat Luft kan intrekken. Zo doe je dat.
check-found-description = Dit heeft Meet Luft gevonden.
check-checking = De schijf, de firmware en de hardware worden gecontroleerd…
check-again = Opnieuw controleren
check-action-firmware = Firmware-instellingen openen
check-action-tidy = Opruimen
check-firmware-title = Opnieuw opstarten in de firmware-instellingen?
check-firmware-description = Sla eerst op waar je mee bezig bent. Schakel daar Secure Boot in en sla op, dan start je computer weer gewoon op.
check-tidy-title = De oude opstartvermeldingen verwijderen?
check-tidy-description = Ze verwijzen alleen naar systemen die al weg zijn. Windows en al het andere starten gewoon zoals eerst.
check-get-ready-title = Luft klaarzetten?
check-get-ready-file = Meet Luft kopieert Luft van je iso naar een map op deze computer en voegt er een opstartvermelding voor toe. Er wordt niets opnieuw gepartitioneerd.
check-get-ready-download = Meet Luft downloadt Luft, ongeveer { $size }, naar een map op deze computer en voegt er een opstartvermelding voor toe. Er wordt niets opnieuw gepartitioneerd.
check-get-ready-confirm = Klaarzetten

## Choosing how much of the Windows drive Luft gets

room-title = Hoeveel ruimte krijgt Luft?
room-description = Windows maakt zichzelf kleiner om Luft ruimte te geven. Je bestanden in Windows blijven precies waar ze zijn.
room-live = Windows houdt ruimte om te groeien. Luft reserveert ook { $size } om vanaf te starten, en geeft die terug zodra het is geïnstalleerd.
room-make = Ruimte maken
room-confirm-title = Luft { $size } geven?
room-confirm-file = Windows verkleint zijn schijf en Meet Luft kopieert daarna Luft van je iso. Houd de pc aangesloten op de lader.
room-confirm-download = Windows verkleint zijn schijf en Meet Luft downloadt daarna Luft, ongeveer { $size }. Houd de pc aangesloten op de lader en online.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Waar moet Luft komen?
room-places-description = Luft kan de schijf van Windows delen, of ruimte nemen die Windows niet gebruikt.
room-places-label = Plekken voor Luft
room-place-windows = Naast Windows
room-place-windows-detail = Windows maakt zichzelf kleiner om Luft ruimte te geven
room-place-windows-free = Daar is al { $size } vrij
room-place-free = Vrije ruimte op { $drive }
room-place-free-here = Vrije ruimte op de schijf van Windows
room-place-free-detail = { $size } die door niets anders wordt gebruikt
room-place-whole = Heel { $drive }
room-place-whole-detail = Wist deze schijf van { $size } voor Luft
room-live-free = Daarvan is al { $free } vrij, dus Windows levert minder in en houdt ruimte om te groeien. Luft reserveert ook { $size } om vanaf te starten, en geeft die terug zodra het is geïnstalleerd.
room-live-elsewhere = Luft krijgt daar { $room }, en reserveert nog { $size } om vanaf te starten, die het teruggeeft zodra het is geïnstalleerd.
room-confirm-free-title = Luft { $size } vrije ruimte geven?
room-confirm-free-file = Meet Luft kopieert Luft daarin vanaf je iso. Verder verandert er niets op de schijf.
room-confirm-free-download = Meet Luft downloadt Luft, ongeveer { $size }, daarin. Verder verandert er niets op de schijf. Houd de pc online.
room-erase-title = { $drive } wissen?
room-erase-description = Alles op deze schijf van { $size } wordt meteen gewist, nog voordat Luft start. Dit kan niet ongedaan worden gemaakt. Er staat nu op:
room-erase-empty = Windows kan niets lezen op deze schijf van { $size }, maar wat er ook op staat, wordt meteen gewist. Dit kan niet ongedaan worden gemaakt.
room-erase-unnamed = Naamloze partitie
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Versleuteld met BitLocker
room-erase-understood = Ik weet dat een deel ervan met BitLocker is versleuteld en niet terug te halen is
room-erase-confirm = Wissen en ruimte maken

## Luft is ready on Windows

ready-title = Luft is klaar
ready-description = Kies hoe je kennis wilt maken. Daarna start Windows gewoon op, tenzij je Luft installeert en daarvoor kiest.
ready-update-title = De nieuwste versie van Luft ophalen
ready-update-description = Er is een nieuwere build. Die vervangt deze en houdt de ruimte en alles wat je hebt ingepakt.
ready-try-title = Luft uitproberen
ready-try-description = Opnieuw opstarten in Luft zonder iets te installeren. De volgende keer start Windows gewoon op.
ready-box-description = Pak documenten, foto’s, wifinetwerken en meer in, zodat Luft ze uitpakt zodra het is geïnstalleerd.
ready-box-packed = Ingepakt, { $size }
ready-install-title = Luft installeren
ready-install-description = Opnieuw opstarten in het installatieprogramma. De { $size } naast Windows staat er al voor klaar.
ready-install-drive-description = Opnieuw opstarten in het installatieprogramma. De { $size } op { $drive } staat er al voor klaar.
ready-stick-description = Zet Luft op een stick om het op elke computer te starten.
ready-remove = Luft van deze pc verwijderen
ready-restart-try = Sla eerst op waar je mee bezig bent. Luft opent over een minuutje, en bij de volgende herstart ben je terug in Windows.
ready-restart-install = Sla eerst op waar je mee bezig bent. Het installatieprogramma opent over een minuutje, en er verandert niets tot je het daar bevestigt.
ready-fast-startup-title = Snel opstarten uitschakelen in Windows
ready-fast-startup-description = Windows sluit dan helemaal af, zodat geluid, wifi en Bluetooth in Luft fris starten.
ready-clock-title = De klok in beide goed houden
ready-clock-description = Windows leest de klok van de computer zoals Luft dat doet, zodat de tijd niet meer verspringt als je wisselt.
ready-remove-title = Luft van deze pc verwijderen?
ready-remove-description = Meet Luft wist alles wat het heeft toegevoegd, ook de verhuisdoos, en geeft Windows al zijn ruimte terug.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Kies hoe je kennis wilt maken. { $system } blijft gewoon opstarten tot je iets anders besluit.
linux-ready-this-system = dit systeem
linux-ready-update-description = Er is een nieuwere build. Die vervangt de build die Meet Luft bewaart en houdt de logboeken van het uitproberen.
linux-ready-try-description = Opnieuw opstarten in Luft zonder iets te veranderen. De volgende keer start { $system } gewoon op.
linux-ready-replace-title = { $system } vervangen
linux-ready-replace-description = Luft neemt de plaats in en houdt je bestanden, je account, wifinetwerken en andere schijven. Het oude systeem blijft tot je het verwijdert.
linux-ready-install-description = Opnieuw opstarten in het installatieprogramma om Luft op een andere schijf of in vrije ruimte te zetten.
linux-ready-remove = Luft van deze computer verwijderen
linux-ready-restart-try = Sla eerst op waar je mee bezig bent. Luft opent over een minuutje, en bij de volgende herstart ben je terug in { $system }.
linux-ready-restart-replace = Sla eerst op waar je mee bezig bent. Het installatieprogramma opent met { $system } gekozen om te vervangen, en laat zien wat blijft voordat er iets verandert.
linux-ready-remove-title = Luft van deze computer verwijderen?
linux-ready-remove-description = Meet Luft wist de bestanden van Luft, de opstartbestanden en de opstartvermelding. Al het andere blijft zoals het is.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Je Luft
luft-looking = Meet Luft heeft Luft op deze pc gevonden.
luft-checking = De schijf van Luft wordt bekeken…
luft-description-beside = Luft is naast Windows op deze pc geïnstalleerd.
luft-description-drive = Luft is geïnstalleerd op { $drive }.
luft-bar-used = { $size }, { $used } gebruikt
luft-resize-title = De ruimte van Luft wijzigen
luft-resize-description = Geef Luft meer van de ruimte van Windows, of geef wat terug aan Windows.
luft-resize-drive-description = Geef Luft meer van de vrije ruimte op { $drive }, of laat een deel ervan vrij.
luft-resize-reencrypting = Luft is zijn schijf nog aan het versleutelen of ontsleutelen. Zodra dat klaar is, kan het van grootte veranderen.
luft-resize-passphrase = De schijf van Luft gaat alleen open met een wachtwoordzin, en Luft kan die niet zelf invoeren terwijl het verhuist.
luft-resize-start-first = Start Luft één keer, zodat het Meet Luft kan laten weten hoe vol het is, en kom dan terug.
luft-resize-apart = Er zit een andere partitie tussen Windows en Luft, dus ze kunnen hun ruimte niet delen.
luft-pending-grow = Luft groeit de volgende keer dat het start
luft-pending-grow-description = Start opnieuw op in Luft en laat het een paar minuten aan staan terwijl het naar de nieuwe ruimte verhuist. Je kunt het intussen gewoon gebruiken.
luft-pending-shrink = Luft maakt ruimte de volgende keer dat het start
luft-pending-shrink-description = Start opnieuw op in Luft en laat het een paar minuten aan staan terwijl het zijn bestanden verplaatst. Open daarna Meet Luft weer in Windows om Windows de ruimte te geven.
luft-pending-trim = Luft wordt kleiner de volgende keer dat het start
luft-pending-trim-description = Start opnieuw op in Luft, dan maakt het zichzelf binnen ongeveer een minuut kleiner.
luft-windows-free-title = Windows de vrije ruimte geven
luft-windows-free-description = { $size } direct na Windows wordt door niets gebruikt. Windows kan die terugnemen.
luft-leftovers-title = Opruimen na het uitproberen van Luft
luft-leftovers-description = De partities die Meet Luft heeft gemaakt om Luft te starten, staan er nog. Luft heeft ze niet meer nodig.
luft-start = Opnieuw opstarten in Luft
luft-cancel = Wijziging annuleren
luft-restart = Sla eerst op waar je mee bezig bent. Luft start over een minuutje, en bij de volgende herstart ben je terug in Windows.
luft-restart-pending = Sla eerst op waar je mee bezig bent. Luft start over een minuutje en verplaatst zelf zijn bestanden, wat een paar minuten duurt. Je kunt het intussen gebruiken.
luft-remove = Luft van deze pc verwijderen
luft-remove-title = Luft van deze pc verwijderen?
luft-remove-description = Luft en alles wat erop staat wordt gewist, in totaal { $size }, en Windows krijgt de ruimte terug. De pc start Windows zoals eerst. Dit kan niet ongedaan worden gemaakt.
luft-remove-drive-description = Luft en alles wat erop staat wordt van { $drive } gewist, in totaal { $size }. De pc start Windows zoals eerst. Dit kan niet ongedaan worden gemaakt.
luft-remove-confirm = Luft verwijderen

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Hoeveel ruimte krijgt Luft?
resize-description = Sleep om de schijf te verdelen tussen Windows en Luft. Luft voert de wijziging zelf uit de volgende keer dat het start.
resize-measuring = Windows berekent hoeveel ruimte het kan missen. Op een grote schijf kan dat een paar minuten duren.
resize-full = Luft is te vol om te verplaatsen, en Windows kan er niet genoeg ruimte voor missen. Maak eerst wat ruimte vrij in Luft of in Windows.
resize-drive-description = Sleep om te kiezen hoeveel van { $drive } Luft krijgt. Luft voert de wijziging zelf uit de volgende keer dat het start.
resize-drive-free = { $size } vrij op { $drive }
resize-used = De bestanden van Luft nemen { $size } in beslag.
resize-least = Wijzig de grootte met minstens { $size }.
resize-apply = Wijzigen
resize-grow-title = Luft { $size } meer geven?
resize-grow-description = Windows maakt zichzelf meteen kleiner. Luft verhuist de volgende keer dat het start naar de nieuwe ruimte, wat een paar minuten duurt. Houd de pc aangesloten op de lader.
resize-grow-drive-description = Luft neemt de vrije ruimte op { $drive } in gebruik de volgende keer dat het start, wat even duurt.
resize-trim-title = Luft { $size } kleiner maken?
resize-trim-description = Luft maakt zichzelf kleiner de volgende keer dat het start, en de ruimte op { $drive } blijft vrij.
resize-shrink-title = Windows { $size } teruggeven?
resize-shrink-description = Luft verplaatst zijn bestanden de volgende keer dat het start, wat een paar minuten duurt. Open daarna Meet Luft opnieuw, dan neemt Windows de ruimte terug. Houd de pc aangesloten op de lader.

## Packing things to take along to Luft (the moving box)

box-title = Je spullen meenemen
box-description = Kies wat je meeneemt. Luft pakt het uit in je nieuwe account zodra het is geïnstalleerd, en er wordt niets uit Windows verwijderd.
box-looking = Je mappen worden doorzocht…
box-folder-desktop = Bureaublad
box-folder-documents = Documenten
box-folder-downloads = Downloads
box-folder-music = Muziek
box-folder-pictures = Afbeeldingen
box-folder-videos = Video’s
box-folder-size = { $size }, { $files ->
    [one] { $files } bestand
   *[other] { $files } bestanden
}
box-wifi-title = Wifinetwerken
box-wifi-description = Met de wachtwoorden, zodat Luft meteen online is
box-bluetooth-title = Bluetooth-apparaten
box-bluetooth-description = { $devices ->
    [one] { $devices } apparaat, klaar zonder opnieuw te koppelen
   *[other] { $devices } apparaten, klaar zonder opnieuw te koppelen
}
box-wallpaper-title = Achtergrond
box-wallpaper-description = De afbeelding op je Windows-bureaublad
box-account-title = Je naam en foto
box-total-slow = { $size }, het inpakken duurt ongeveer { $minutes ->
    [one] { $minutes } minuut
   *[other] { $minutes } minuten
}
box-pack = Inpakken

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Ruimte maken
    .description = Windows verplaatst zijn bestanden om ruimte te maken. Dit kan een paar minuten duren.
working-erasing = De schijf wissen
    .description = Windows maakt hem leeg, zodat Luft hem helemaal kan gebruiken.
working-partitioning = De ruimte voor Luft inrichten
    .description = De partities waar Luft vanaf start, worden voorbereid.
working-downloading = Luft binnenhalen
    .description = Luft wordt rechtstreeks naar zijn eigen ruimte gekopieerd en onderweg gecontroleerd.
working-packing = Je spullen inpakken
    .description = Alles wat je hebt gekozen, gaat in de verhuisdoos. Grote mappen duren even.
working-removing = Luft verwijderen
    .description = De ruimte gaat terug naar Windows.
working-removing-linux = Luft verwijderen
    .description = De bestanden en de opstartvermelding worden verwijderd.
working-writing = De stick maken
    .description = Luft wordt op de hele stick geschreven. Laat hem aangesloten.
working-copying = Luft aan Ventoy toevoegen
    .description = Luft wordt naast de andere iso’s op de stick gekopieerd. Laat hem aangesloten.
working-verifying = De stick controleren
    .description = Alles wordt teruggelezen om zeker te weten dat hij start.
working-stick-downloading = Luft downloaden
    .description = Het wordt onderweg gecontroleerd en bewaard, zodat de volgende stick sneller gaat.
working-progress = { $done } van { $total }
working-keep-open = Houd dit venster open.

## After Luft was removed

removed-title = Alles is weer zoals het was
removed-description = { $platform ->
    [linux] De bestanden van Luft en de opstartvermelding zijn weg, en je computer start gewoon zoals eerst. Kom gerust terug.
   *[windows] De partities van Luft en de opstartvermelding zijn weg, en Windows heeft al zijn ruimte terug. Kom gerust terug.
}

## Making a USB stick

stick-title = Een usb-stick maken
stick-description = Luft start ervan op elke computer, om het uit te proberen of te installeren.
stick-looking = Usb-schijven zoeken…
stick-none = Sluit een usb-stick van { $size } of meer aan. Hij verschijnt hier.
stick-drives-label = Usb-schijven
stick-offer = { $name }, { $size }
stick-make = Stick maken
stick-drive-empty = Leeg
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Te klein voor Luft
stick-ventoy-title = Deze stick gebruikt Ventoy
stick-ventoy-description = Luft eraan toevoegen, of de hele stick wissen en er een Luft-stick van maken?
stick-erase-it = Wissen
stick-add = Luft toevoegen
stick-replace-title = De versie van Luft erop vervangen?
stick-replace-description = { $count ->
    [one] { $names } staat al op deze stick. De nieuwe versie van Luft kan de plaats ervan innemen.
   *[other] { $names } staan al op deze stick. De nieuwe versie van Luft kan hun plaats innemen.
}
stick-keep = { $count ->
    [one] Beide houden
   *[other] Alle houden
}
stick-replace = Vervangen
stick-full-title = Er is geen ruimte voor Luft
stick-full-description = Luft heeft { $needed } nodig en er is { $free } vrij op deze stick. Maak er ruimte op, of wis hem en maak er een Luft-stick van.
stick-erase-title = { $name } wissen?
stick-erase-description = Alles op deze stick van { $size } wordt gewist en vervangen door Luft. Dit kan niet ongedaan worden gemaakt.
stick-erase-confirm = Wissen en stick maken
stick-done-title = Je Luft-stick is klaar
stick-done-ventoy-title = Luft staat op je Ventoy-stick
stick-done-take-out = Je kunt hem er nu uit halen.
stick-done-eject = Werp hem uit voordat je hem eruit haalt.
stick-done-start = Om ervan te starten, sluit je hem aan en kies je hem in het opstartmenu van de computer. Dat opent met een toets als F12, F8 of Esc, direct na het aanzetten.
stick-done-ventoy-key = Met Secure Boot aan vraagt Ventoy de eerste keer dat het start één keer om zijn eigen sleutel te registreren.
stick-done = Klaar
stick-done-another = Nog een maken
