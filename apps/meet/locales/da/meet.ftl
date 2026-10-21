## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Tilbage
meet-cancel = Annuller
meet-continue = Fortsæt
meet-try-again = Prøv igen
meet-restart = Genstart
meet-remove = Fjern
meet-keep-it = Behold det
meet-close = Luk
meet-restart-title = Vil du genstarte nu?
meet-not-yet = Ikke endnu
meet-iso-use = Brug en ISO-fil, jeg allerede har
meet-iso-using = Bruger din Luft-ISO
meet-nightly = Natlige builds
meet-channel-nightly = Meet Luft bruger nu natlige builds
meet-channel-latest = Meet Luft bruger nu udgivelser igen
meet-undo = Fortryd
meet-logs-saved = Logfilerne fra Prøv Luft er gemt på dit skrivebord
meet-logs-show = Vis
meet-logs-none = Der er ingen logfiler fra Prøv Luft endnu
meet-logs-failed = Meet Luft kunne ikke gemme logfilerne fra Prøv Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft kunne ikke gennemføre undersøgelsen af denne computer.
   *[windows] Meet Luft kunne ikke gennemføre undersøgelsen af denne pc.
}
problem-room = Arbejdet med at gøre plads til Luft blev ikke færdigt.
problem-room-linux = Klargøringen af Luft blev ikke færdig.
problem-update = Opdateringen af Luft blev ikke færdig.
problem-download = Luft-downloaden stoppede. Tjek, at du er online.
problem-pack = Pakningen af dine ting blev ikke færdig.
problem-remove = Fjernelsen af Luft blev ikke færdig.
problem-restart = Meet Luft kunne ikke forberede genstarten.
problem-tidy = De gamle startposter kunne ikke fjernes.
problem-firmware = Meet Luft kunne ikke åbne firmwareindstillingerne.
problem-folders = Meet Luft kunne ikke gennemgå dine mapper.
problem-sticks = Meet Luft kunne ikke søge efter USB-drev.
problem-stick = USB-stikket blev ikke lavet færdigt.
problem-offer = Luft kan ikke hentes lige nu. Tjek, at du er online, eller brug en ISO-fil, du allerede har.
problem-declined = { $platform ->
    [linux] Meet Luft skal have din tilladelse til at arbejde med drevet. Skriv din adgangskode, når du bliver spurgt.
   *[windows] Meet Luft skal have din tilladelse til at arbejde med drevet. Vælg Ja, når Windows spørger.
}

## First screen

hello-intro = { $platform ->
    [linux] Prøv Luft direkte herfra, uden USB-stik. Når du kan lide det, kan Luft tage dette systems plads og beholde dine filer.
   *[windows] Luft kan bo lige ved siden af Windows. Prøv det først uden at installere noget, og tag dine ting med, når du er klar.
}
hello-check = { $platform ->
    [linux] Tjek denne computer
   *[windows] Tjek denne pc
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Undersøger denne computer
   *[windows] Undersøger denne pc
}
check-ready-title = { $platform ->
    [linux] Denne computer er klar til Luft
   *[windows] Denne pc er klar til Luft
}
check-blocked-title = Næsten klar
check-moment = Det tager et øjeblik.
check-slow = Windows regner ud, hvor meget plads det kan undvære. På et stort drev kan det tage et par minutter.
check-blocked-description = Der skal ændres noget, før Luft kan flytte ind. Sådan gør du.
check-found-description = Det har Meet Luft fundet.
check-checking = Tjekker drevet, firmwaren og hardwaren…
check-again = Tjek igen
check-action-firmware = Åbn firmwareindstillinger
check-action-tidy = Ryd op
check-firmware-title = Vil du genstarte i firmwareindstillingerne?
check-firmware-description = Gem først det, du arbejder på. Slå Secure Boot til der, og gem, så starter din computer igen som normalt.
check-tidy-title = Vil du fjerne de gamle startposter?
check-tidy-description = De peger kun på systemer, der allerede er væk. Windows og alt andet starter præcis som før.
check-get-ready-title = Vil du gøre Luft klar?
check-get-ready-file = Meet Luft kopierer Luft fra din ISO-fil til en mappe på denne computer og tilføjer en startpost til det. Intet bliver ompartitioneret.
check-get-ready-download = Meet Luft henter Luft, cirka { $size }, til en mappe på denne computer og tilføjer en startpost til det. Intet bliver ompartitioneret.
check-get-ready-confirm = Gør det klar

## Choosing how much of the Windows drive Luft gets

room-title = Hvor meget plads skal Luft have?
room-description = Windows bliver mindre for at give plads til Luft. Dine filer i Windows forbliver præcis, hvor de er.
room-live = Windows beholder plads til at vokse. Luft lægger også { $size } til side at starte fra og giver pladsen tilbage, når det er installeret.
room-make = Gør plads
room-confirm-title = Vil du give Luft { $size }?
room-confirm-file = Windows formindsker sit drev, og derefter kopierer Meet Luft Luft fra din ISO-fil. Hold pc’en tilsluttet strøm.
room-confirm-download = Windows formindsker sit drev, og derefter henter Meet Luft Luft, cirka { $size }. Hold pc’en tilsluttet strøm og online.

## Luft is ready on Windows

ready-title = Luft er klar
ready-description = Vælg, hvordan du vil møde det. Windows starter som normalt bagefter, medmindre du installerer Luft og vælger det.
ready-update-title = Hent den nyeste Luft
ready-update-description = Der er kommet en nyere build. Den erstatter denne og beholder pladsen og det, du har pakket.
ready-try-title = Prøv Luft
ready-try-description = Genstart i Luft uden at installere noget. Windows starter som normalt næste gang.
ready-box-description = Pak dokumenter, fotos, wi-fi-netværk og mere, som Luft pakker ud, når det er installeret.
ready-box-packed = Pakket, { $size }
ready-install-title = Installer Luft
ready-install-description = Genstart i installationsprogrammet. De { $size } ved siden af Windows venter allerede på det.
ready-stick-description = Læg Luft på et USB-stik for at starte det på enhver computer.
ready-remove = Fjern Luft fra denne pc
ready-restart-try = Gem først det, du arbejder på. Luft åbner om et minuts tid, og næste genstart fører dig tilbage til Windows.
ready-restart-install = Gem først det, du arbejder på. Installationsprogrammet åbner om et minuts tid, og intet ændres, før du bekræfter der.
ready-fast-startup-title = Slå Hurtig start fra i Windows
ready-fast-startup-description = Så lukker Windows helt ned, og lyd, wi-fi og Bluetooth starter forfra i Luft.
ready-clock-title = Hold uret rigtigt i begge
ready-clock-description = Windows læser computerens ur på samme måde som Luft, så klokkeslættet ikke længere springer, når du skifter.
ready-remove-title = Vil du fjerne Luft fra denne pc?
ready-remove-description = Meet Luft sletter alt, hvad det har tilføjet, også flyttekassen, og giver Windows al sin plads tilbage.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Vælg, hvordan du vil møde det. { $system } bliver ved med at starte som normalt, indtil du beslutter andet.
linux-ready-this-system = dette system
linux-ready-update-description = Der er kommet en nyere build. Den erstatter den, Meet Luft har gemt, og beholder logfilerne fra Prøv Luft.
linux-ready-try-description = Genstart i Luft uden at ændre noget. { $system } starter som normalt næste gang.
linux-ready-replace-title = Erstat { $system }
linux-ready-replace-description = Luft tager dets plads og beholder dine filer, din konto, wi-fi-netværk og andre drev. Det gamle system bliver liggende, indtil du fjerner det.
linux-ready-install-description = Genstart i installationsprogrammet for at lægge Luft på et andet drev eller på ledig plads.
linux-ready-remove = Fjern Luft fra denne computer
linux-ready-restart-try = Gem først det, du arbejder på. Luft åbner om et minuts tid, og næste genstart fører dig tilbage til { $system }.
linux-ready-restart-replace = Gem først det, du arbejder på. Installationsprogrammet åbner med { $system } valgt til at blive erstattet og viser, hvad der bevares, før noget ændres.
linux-ready-remove-title = Vil du fjerne Luft fra denne computer?
linux-ready-remove-description = Meet Luft sletter Lufts filer, dets startfiler og dets startpost. Alt andet forbliver, som det er.

## Packing things to take along to Luft (the moving box)

box-title = Tag dine ting med
box-description = Vælg, hvad der skal med. Luft pakker det ud på din nye konto, når det er installeret, og intet fjernes fra Windows.
box-looking = Gennemgår dine mapper…
box-folder-desktop = Skrivebord
box-folder-documents = Dokumenter
box-folder-downloads = Overførsler
box-folder-music = Musik
box-folder-pictures = Billeder
box-folder-videos = Videoer
box-folder-size = { $size }, { $files ->
    [one] { $files } fil
   *[other] { $files } filer
}
box-wifi-title = Wi-Fi-netværk
box-wifi-description = Med deres adgangskoder, så Luft er online med det samme
box-bluetooth-title = Bluetooth-enheder
box-bluetooth-description = { $devices ->
    [one] { $devices } enhed, klar uden at skulle parres igen
   *[other] { $devices } enheder, klar uden at skulle parres igen
}
box-wallpaper-title = Baggrundsbillede
box-wallpaper-description = Billedet på dit Windows-skrivebord
box-account-title = Dit navn og billede
box-total-slow = { $size }, som tager cirka { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minutter
} at pakke
box-pack = Pak

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Gør plads
    .description = Windows flytter sine filer for at gøre plads. Det kan tage et par minutter.
working-partitioning = Indretter Lufts plads
    .description = Gør de partitioner klar, som Luft starter fra.
working-downloading = Henter Luft over
    .description = Luft kopieres direkte til sin egen plads og kontrolleres undervejs.
working-packing = Pakker dine ting
    .description = Kopierer alt, hvad du har valgt, til flyttekassen. Store mapper tager et stykke tid.
working-removing = Fjerner Luft
    .description = Giver pladsen tilbage til Windows.
working-removing-linux = Fjerner Luft
    .description = Fjerner dets filer og dets startpost.
working-writing = Laver USB-stikket
    .description = Luft skrives på hele stikket. Lad det sidde i.
working-copying = Føjer Luft til Ventoy
    .description = Luft kopieres ved siden af de andre ISO-filer på stikket. Lad det sidde i.
working-verifying = Kontrollerer stikket
    .description = Læser det hele tilbage for at sikre, at det kan starte.
working-stick-downloading = Henter Luft
    .description = Det kontrolleres undervejs og gemmes, så det næste stik går hurtigere.
working-progress = { $done } af { $total }
working-keep-open = Hold dette vindue åbent.

## After Luft was removed

removed-title = Alt er som før
removed-description = { $platform ->
    [linux] Lufts filer og dets startpost er væk, og din computer starter præcis som før. Kom tilbage når som helst.
   *[windows] Lufts partitioner og dets startpost er væk, og Windows har al sin plads igen. Kom tilbage når som helst.
}

## Making a USB stick

stick-title = Lav et USB-stik
stick-description = Luft starter fra det på enhver computer, så du kan prøve eller installere det.
stick-looking = Søger efter USB-drev…
stick-none = Tilslut et USB-stik på { $size } eller mere. Det dukker op her.
stick-drives-label = USB-drev
stick-offer = { $name }, { $size }
stick-make = Lav stikket
stick-drive-empty = Tomt
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · For lille til Luft
stick-ventoy-title = Dette stik bruger Ventoy
stick-ventoy-description = Vil du føje Luft til det, eller slette hele stikket og gøre det til et Luft-stik?
stick-erase-it = Slet det
stick-add = Tilføj Luft
stick-replace-title = Vil du erstatte Luft på stikket?
stick-replace-description = { $count ->
    [one] { $names } er allerede på dette stik. Den nye Luft kan tage dens plads.
   *[other] { $names } er allerede på dette stik. Den nye Luft kan tage deres plads.
}
stick-keep = { $count ->
    [one] Behold begge
   *[other] Behold alle
}
stick-replace = Erstat
stick-full-title = Der er ikke plads til Luft
stick-full-description = Luft skal bruge { $needed }, og der er { $free } ledig på dette stik. Gør plads på det, eller slet det, og gør det til et Luft-stik.
stick-erase-title = Vil du slette { $name }?
stick-erase-description = Alt på dette stik på { $size } slettes og erstattes med Luft. Det kan ikke fortrydes.
stick-erase-confirm = Slet og lav stikket
stick-done-title = Dit Luft-stik er klar
stick-done-ventoy-title = Luft er på dit Ventoy-stik
stick-done-take-out = Du kan tage det ud nu.
stick-done-eject = Skub det ud, før du tager det ud.
stick-done-start = Start fra det ved at sætte det i og vælge det i computerens bootmenu, som åbnes med en tast som F12, F8 eller Esc lige efter, at du har tændt.
stick-done-ventoy-key = Når Secure Boot er slået til, beder Ventoy én gang om at registrere sin egen nøgle, første gang det starter.
stick-done = Udført
stick-done-another = Lav et til
