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
