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
problem-luft = Meet Luft kunne ikke undersøge Lufts drev.
problem-resize = Ændringen af Lufts størrelse blev ikke færdig.
problem-cancel = Meet Luft kunne ikke annullere ændringen.
problem-give = Windows kunne ikke tage pladsen tilbage.
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

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Hvor skal Luft være?
room-places-description = Luft kan dele drev med Windows eller tage plads, som Windows ikke bruger.
room-places-label = Steder til Luft
room-place-windows = Ved siden af Windows
room-place-windows-detail = Windows bliver mindre for at give plads til Luft
room-place-windows-free = { $size } er allerede ledig der
room-place-free = Ledig plads på { $drive }
room-place-free-here = Ledig plads på Windows’ drev
room-place-free-detail = { $size }, som intet andet bruger
room-place-whole = Hele { $drive }
room-place-whole-detail = Sletter dette drev på { $size } til Luft
room-live-free = Heraf er { $free } allerede ledig, så Windows afgiver mindre og beholder plads til at vokse. Luft lægger også { $size } til side at starte fra og giver pladsen tilbage, når det er installeret.
room-live-elsewhere = Luft får { $room } der og lægger { $size } mere til side at starte fra, som det giver tilbage, når det er installeret.
room-confirm-free-title = Vil du give Luft { $size } ledig plads?
room-confirm-free-file = Meet Luft kopierer Luft fra din ISO-fil derind. Intet andet på drevet ændres.
room-confirm-free-download = Meet Luft henter Luft, cirka { $size }, derind. Intet andet på drevet ændres. Hold pc’en online.
room-erase-title = Vil du slette { $drive }?
room-erase-description = Alt på dette drev på { $size } slettes med det samme, før Luft starter. Det kan ikke fortrydes. Lige nu ligger der:
room-erase-empty = Windows kan ikke læse noget på dette drev på { $size }, men alt, hvad der ligger på det, slettes med det samme. Det kan ikke fortrydes.
room-erase-unnamed = Unavngiven partition
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Krypteret med BitLocker
room-erase-understood = Jeg ved, at noget af det er krypteret med BitLocker og ikke kan hentes tilbage
room-erase-confirm = Slet og gør plads

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
ready-install-drive-description = Genstart i installationsprogrammet. De { $size } på { $drive } venter allerede på det.
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

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Dit Luft
luft-looking = Meet Luft har fundet Luft på denne pc.
luft-checking = Undersøger Lufts drev…
luft-description-beside = Luft er installeret ved siden af Windows på denne pc.
luft-description-drive = Luft er installeret på { $drive }.
luft-bar-used = { $size }, { $used } brugt
luft-resize-title = Ændr, hvor meget plads Luft har
luft-resize-description = Giv Luft mere af Windows’ plads, eller giv noget tilbage til Windows.
luft-resize-drive-description = Giv Luft mere af den ledige plads på { $drive }, eller lad noget af den være ledig.
luft-resize-passphrase = Lufts drev kan kun åbnes med en adgangsfrase, og Luft kan ikke selv indtaste den, mens det flytter.
luft-resize-start-first = Start Luft én gang, så det kan fortælle Meet Luft, hvor fyldt det er, og kom så tilbage.
luft-resize-apart = Der ligger en anden partition mellem Windows og Luft, så de kan ikke dele deres plads.
luft-pending-grow = Luft vokser, næste gang det starter
luft-pending-grow-description = Genstart i Luft, og lad det være tændt i et par minutter, mens det flytter ind på den nye plads. Du kan bruge det imens.
luft-pending-shrink = Luft gør plads, næste gang det starter
luft-pending-shrink-description = Genstart i Luft, og lad det være tændt i et par minutter, mens det flytter sine filer. Åbn så Meet Luft i Windows igen for at give Windows pladsen.
luft-pending-trim = Luft bliver mindre, næste gang det starter
luft-pending-trim-description = Genstart i Luft, så gør det sig selv mindre i løbet af et minuts tid.
luft-windows-free-title = Giv Windows den ledige plads
luft-windows-free-description = { $size } lige efter Windows bruges ikke af noget. Windows kan tage pladsen tilbage.
luft-leftovers-title = Ryd op efter Prøv Luft
luft-leftovers-description = De partitioner, Meet Luft lavede for at starte Luft, er her stadig. Luft har ikke brug for dem længere.
luft-start = Genstart i Luft
luft-cancel = Annuller ændringen
luft-restart = Gem først det, du arbejder på. Luft starter om et minuts tid, og næste genstart fører dig tilbage til Windows.
luft-restart-pending = Gem først det, du arbejder på. Luft starter om et minuts tid og flytter selv sine filer, hvilket tager et par minutter. Du kan bruge det imens.
luft-remove = Fjern Luft fra denne pc
luft-remove-title = Vil du fjerne Luft fra denne pc?
luft-remove-description = Luft og alt i det slettes, { $size } i alt, og Windows får pladsen tilbage. Pc’en starter Windows som før. Det kan ikke fortrydes.
luft-remove-drive-description = Luft og alt i det slettes fra { $drive }, { $size } i alt. Pc’en starter Windows som før. Det kan ikke fortrydes.
luft-remove-confirm = Fjern Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Hvor meget plads skal Luft have?
resize-description = Træk for at fordele drevet mellem Windows og Luft. Luft foretager selv ændringen, næste gang det starter.
resize-measuring = Windows regner ud, hvor meget plads det kan undvære. På et stort drev kan det tage et par minutter.
resize-full = Luft er for fyldt til at blive flyttet, og Windows kan ikke undvære nok plads til det. Gør først lidt plads i Luft eller i Windows.
resize-drive-description = Træk for at vælge, hvor meget af { $drive } Luft får. Luft foretager selv ændringen, næste gang det starter.
resize-drive-free = { $size } ledig på { $drive }
resize-used = Lufts filer fylder { $size }.
resize-least = Ændr størrelsen med mindst { $size }.
resize-apply = Ændr
resize-grow-title = Vil du give Luft { $size } mere?
resize-grow-description = Windows bliver mindre med det samme. Luft flytter ind på den nye plads, næste gang det starter, hvilket tager et par minutter. Hold pc’en tilsluttet strøm.
resize-grow-drive-description = Luft overtager den ledige plads på { $drive }, næste gang det starter, hvilket tager et øjeblik.
resize-trim-title = Vil du gøre Luft { $size } mindre?
resize-trim-description = Luft gør sig selv mindre, næste gang det starter, og pladsen på { $drive } forbliver ledig.
resize-shrink-title = Vil du give Windows { $size } tilbage?
resize-shrink-description = Luft flytter sine filer, næste gang det starter, hvilket tager et par minutter. Åbn så Meet Luft igen, og Windows tager pladsen tilbage. Hold pc’en tilsluttet strøm.

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
working-erasing = Sletter drevet
    .description = Windows rydder det, så Luft kan få det hele.
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
