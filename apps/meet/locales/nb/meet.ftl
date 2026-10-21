## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Tilbake
meet-cancel = Avbryt
meet-continue = Fortsett
meet-try-again = Prøv igjen
meet-restart = Start på nytt
meet-remove = Fjern
meet-keep-it = Behold det
meet-close = Lukk
meet-restart-title = Vil du starte på nytt nå?
meet-not-yet = Ikke ennå
meet-iso-use = Bruk en ISO-fil jeg har
meet-iso-using = Bruker ISO-filen din
meet-nightly = Nattlige bygg
meet-channel-nightly = Meet Luft bruker nattlige bygg
meet-channel-latest = Meet Luft bruker utgivelser igjen
meet-undo = Angre
meet-logs-saved = Loggene fra å prøve Luft er lagret på skrivebordet ditt
meet-logs-show = Vis
meet-logs-none = Det finnes ingen logger fra å prøve Luft ennå
meet-logs-failed = Meet Luft kunne ikke lagre loggene fra å prøve Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft ble ikke ferdig med å sjekke denne datamaskinen.
   *[windows] Meet Luft ble ikke ferdig med å sjekke denne datamaskinen.
}
problem-room = Meet Luft ble ikke ferdig med å lage plass til Luft.
problem-room-linux = Meet Luft ble ikke ferdig med å gjøre Luft klart.
problem-update = Oppdateringen av Luft ble ikke fullført.
problem-download = Nedlastingen av Luft stoppet. Sjekk at du er på nett.
problem-pack = Pakkingen av tingene dine ble ikke fullført.
problem-remove = Fjerningen av Luft ble ikke fullført.
problem-restart = Meet Luft kunne ikke gjøre klar omstarten.
problem-tidy = De gamle oppstartsoppføringene kunne ikke fjernes.
problem-firmware = Meet Luft kunne ikke åpne fastvareinnstillingene.
problem-folders = Meet Luft kunne ikke se gjennom mappene dine.
problem-sticks = Meet Luft kunne ikke se etter USB-stasjoner.
problem-stick = Minnepinnen ble ikke ferdig laget.
problem-offer = Luft kan ikke lastes ned akkurat nå. Sjekk at du er på nett, eller bruk en ISO-fil du allerede har.
problem-declined = { $platform ->
    [linux] Meet Luft trenger tillatelse fra deg for å jobbe med disken. Skriv inn passordet ditt når du blir spurt.
   *[windows] Meet Luft trenger tillatelse fra deg for å jobbe med disken. Velg Ja når Windows spør.
}

## First screen

hello-intro = { $platform ->
    [linux] Prøv Luft rett herfra, uten minnepinne. Liker du det, kan Luft ta plassen til dette systemet og beholde filene dine.
   *[windows] Luft kan bo rett ved siden av Windows. Prøv det først uten å installere noe, og ta med deg tingene dine når du er klar.
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
check-blocked-title = Nesten klar
check-moment = Dette tar et øyeblikk.
check-slow = Windows regner ut hvor mye plass det kan avse. På en stor disk kan dette ta noen minutter.
check-blocked-description = Noe må endres før Luft kan flytte inn. Slik gjør du det.
check-found-description = Dette fant Meet Luft.
check-checking = Sjekker disken, fastvaren og maskinvaren…
check-again = Sjekk igjen
check-action-firmware = Åpne fastvareinnstillingene
check-action-tidy = Rydd opp
check-firmware-title = Vil du starte på nytt i fastvareinnstillingene?
check-firmware-description = Lagre det du jobber med først. Slå på Secure Boot der og lagre, så starter datamaskinen igjen som vanlig.
check-tidy-title = Vil du fjerne de gamle oppstartsoppføringene?
check-tidy-description = De peker bare på systemer som allerede er borte. Windows og alt annet starter akkurat som før.
check-get-ready-title = Vil du gjøre Luft klar?
check-get-ready-file = Meet Luft kopierer Luft fra ISO-filen din til en mappe på denne datamaskinen og legger til en oppstartsoppføring for det. Ingen partisjoner endres.
check-get-ready-download = Meet Luft laster ned Luft, omtrent { $size }, til en mappe på denne datamaskinen og legger til en oppstartsoppføring for det. Ingen partisjoner endres.
check-get-ready-confirm = Gjør det klart

## Choosing how much of the Windows drive Luft gets

room-title = Hvor mye plass skal Luft få?
room-description = Windows gjør seg mindre for å gi plass til Luft. Filene dine i Windows blir akkurat der de er.
room-live = Windows beholder plass til å vokse. Luft setter også av { $size } å starte fra, som det gir tilbake når det er installert.
room-make = Lag plass
room-confirm-title = Vil du gi Luft { $size }?
room-confirm-file = Windows krymper disken sin, og deretter kopierer Meet Luft Luft fra ISO-filen din. La datamaskinen være koblet til strøm.
room-confirm-download = Windows krymper disken sin, og deretter laster Meet Luft ned Luft, omtrent { $size }. La datamaskinen være koblet til strøm og på nett.

## Luft is ready on Windows

ready-title = Luft er klart
ready-description = Velg hvordan du vil bli kjent med det. Windows starter som vanlig etterpå, med mindre du installerer Luft og velger det.
ready-update-title = Hent nyeste Luft
ready-update-description = Et nyere bygg er ute. Det erstatter dette og beholder plassen og alt du har pakket.
ready-try-title = Prøv Luft
ready-try-description = Start på nytt i Luft uten å installere noe. Windows starter som vanlig neste gang.
ready-box-description = Pakk dokumenter, bilder, wifi-nettverk og mer, så pakker Luft dem ut når det er installert.
ready-box-packed = Pakket, { $size }
ready-install-title = Installer Luft
ready-install-description = Start på nytt i installasjonsprogrammet. De { $size } ved siden av Windows venter allerede på det.
ready-stick-description = Legg Luft på en minnepinne for å starte det på hvilken som helst datamaskin.
ready-remove = Fjern Luft fra denne datamaskinen
ready-restart-try = Lagre det du jobber med først. Luft åpnes om et minutt eller så, og neste omstart tar deg tilbake til Windows.
ready-restart-install = Lagre det du jobber med først. Installasjonsprogrammet åpnes om et minutt eller så, og ingenting endres før du bekrefter der.
ready-fast-startup-title = Slå av rask oppstart i Windows
ready-fast-startup-description = Da slår Windows seg helt av, så lyd, wifi og Bluetooth starter på nytt i Luft.
ready-clock-title = Hold klokken riktig i begge
ready-clock-description = Windows leser datamaskinens klokke på samme måte som Luft, så tiden hopper ikke lenger når du bytter.
ready-remove-title = Vil du fjerne Luft fra denne datamaskinen?
ready-remove-description = Meet Luft sletter alt det la til, også flytteesken, og gir Windows all plassen tilbake.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Velg hvordan du vil bli kjent med det. { $system } fortsetter å starte som vanlig til du bestemmer noe annet.
linux-ready-this-system = dette systemet
linux-ready-update-description = Et nyere bygg er ute. Det erstatter det Meet Luft har lagret, og beholder loggene fra når du prøvde det.
linux-ready-try-description = Start på nytt i Luft uten å endre noe. { $system } starter som vanlig neste gang.
linux-ready-replace-title = Erstatt { $system }
linux-ready-replace-description = Luft tar plassen og beholder filene dine, kontoen din, wifi-nettverk og andre disker. Det gamle systemet blir liggende til du fjerner det.
linux-ready-install-description = Start på nytt i installasjonsprogrammet for å legge Luft på en annen disk eller på ledig plass.
linux-ready-remove = Fjern Luft fra denne datamaskinen
linux-ready-restart-try = Lagre det du jobber med først. Luft åpnes om et minutt eller så, og neste omstart tar deg tilbake til { $system }.
linux-ready-restart-replace = Lagre det du jobber med først. Installasjonsprogrammet åpnes med { $system } valgt for å erstattes, og viser hva som beholdes før noe endres.
linux-ready-remove-title = Vil du fjerne Luft fra denne datamaskinen?
linux-ready-remove-description = Meet Luft sletter filene til Luft, oppstartsfilene og oppstartsoppføringen. Alt annet blir som det er.

## Packing things to take along to Luft (the moving box)

box-title = Ta med tingene dine
box-description = Velg hva du vil ta med. Luft pakker det ut i den nye kontoen din når det er installert, og ingenting fjernes fra Windows.
box-looking = Ser gjennom mappene dine…
box-folder-desktop = Skrivebord
box-folder-documents = Dokumenter
box-folder-downloads = Nedlastinger
box-folder-music = Musikk
box-folder-pictures = Bilder
box-folder-videos = Videoer
box-folder-size = { $size }, { $files ->
    [one] { $files } fil
   *[other] { $files } filer
}
box-wifi-title = Wi-Fi-nettverk
box-wifi-description = Med passordene, så Luft er på nett med en gang
box-bluetooth-title = Bluetooth-enheter
box-bluetooth-description = { $devices ->
    [one] { $devices } enhet, klar uten ny sammenkobling
   *[other] { $devices } enheter, klare uten ny sammenkobling
}
box-wallpaper-title = Bakgrunnsbilde
box-wallpaper-description = Bildet på Windows-skrivebordet ditt
box-account-title = Navnet og bildet ditt
box-total-slow = { $size }, som tar omtrent { $minutes ->
    [one] { $minutes } minutt
   *[other] { $minutes } minutter
} å pakke
box-pack = Pakk

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Lager plass
    .description = Windows flytter filene sine for å gi plass. Dette kan ta noen minutter.
working-partitioning = Klargjør plassen til Luft
    .description = Gjør klar partisjonene Luft starter fra.
working-downloading = Henter Luft
    .description = Luft kopieres rett inn på sin egen plass og kontrolleres underveis.
working-packing = Pakker tingene dine
    .description = Kopierer alt du valgte, til flytteesken. Store mapper tar litt tid.
working-removing = Fjerner Luft
    .description = Gir plassen tilbake til Windows.
working-removing-linux = Fjerner Luft
    .description = Tar bort filene og oppstartsoppføringen.
working-writing = Lager minnepinnen
    .description = Luft skrives over hele minnepinnen. La den stå i.
working-copying = Legger Luft til i Ventoy
    .description = Luft kopieres ved siden av de andre ISO-filene på minnepinnen. La den stå i.
working-verifying = Sjekker minnepinnen
    .description = Leser alt tilbake for å sikre at den starter.
working-stick-downloading = Laster ned Luft
    .description = Det kontrolleres underveis og tas vare på, så neste minnepinne går raskere.
working-progress = { $done } av { $total }
working-keep-open = La dette vinduet være åpent.

## After Luft was removed

removed-title = Alt er som før
removed-description = { $platform ->
    [linux] Filene og oppstartsoppføringen til Luft er borte, og datamaskinen starter akkurat som før. Kom gjerne tilbake når som helst.
   *[windows] Partisjonene og oppstartsoppføringen til Luft er borte, og Windows har all plassen sin igjen. Kom gjerne tilbake når som helst.
}

## Making a USB stick

stick-title = Lag en minnepinne
stick-description = Luft starter fra den på hvilken som helst datamaskin, for å prøve det eller installere det.
stick-looking = Ser etter USB-stasjoner…
stick-none = Sett inn en minnepinne på { $size } eller mer. Den dukker opp her.
stick-drives-label = USB-stasjoner
stick-offer = { $name }, { $size }
stick-make = Lag minnepinnen
stick-drive-empty = Tom
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · For liten for Luft
stick-ventoy-title = Denne minnepinnen bruker Ventoy
stick-ventoy-description = Vil du legge Luft til på den, eller slette hele minnepinnen og gjøre den til en Luft-pinne?
stick-erase-it = Slett den
stick-add = Legg til Luft
stick-replace-title = Vil du erstatte Luft på den?
stick-replace-description = { $count ->
    [one] { $names } ligger allerede på denne minnepinnen. Den nye versjonen av Luft kan ta plassen.
   *[other] { $names } ligger allerede på denne minnepinnen. Den nye versjonen av Luft kan ta plassen deres.
}
stick-keep = { $count ->
    [one] Behold begge
   *[other] Behold alle
}
stick-replace = Erstatt
stick-full-title = Det er ikke plass til Luft
stick-full-description = Luft trenger { $needed }, og { $free } er ledig på denne minnepinnen. Lag plass på den, eller slett den og gjør den til en Luft-pinne.
stick-erase-title = Vil du slette { $name }?
stick-erase-description = Alt på denne minnepinnen på { $size } slettes og erstattes med Luft. Dette kan ikke angres.
stick-erase-confirm = Slett og lag minnepinnen
stick-done-title = Luft-pinnen din er klar
stick-done-ventoy-title = Luft ligger på Ventoy-pinnen din
stick-done-take-out = Du kan ta den ut nå.
stick-done-eject = Løs den ut før du tar den ut.
stick-done-start = For å starte fra den setter du den inn og velger den i oppstartsmenyen til datamaskinen, som åpnes med en tast som F12, F8 eller Esc rett etter at du slår på.
stick-done-ventoy-key = Når Secure Boot er på, ber Ventoy én gang om å registrere sin egen nøkkel første gang den starter.
stick-done = Ferdig
stick-done-another = Lag en til
