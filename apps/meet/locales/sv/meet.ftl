## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Tillbaka
meet-cancel = Avbryt
meet-continue = Fortsätt
meet-try-again = Försök igen
meet-restart = Starta om
meet-remove = Ta bort
meet-keep-it = Behåll det
meet-close = Stäng
meet-restart-title = Vill du starta om nu?
meet-not-yet = Inte än
meet-iso-use = Använd en ISO-fil jag redan har
meet-iso-using = Använder din ISO-fil för Luft
meet-nightly = Nattliga byggen
meet-channel-nightly = Meet Luft använder nattliga byggen
meet-channel-latest = Meet Luft använder vanliga versioner igen
meet-undo = Ångra
meet-logs-saved = Loggarna från Prova Luft har sparats på skrivbordet
meet-logs-show = Visa
meet-logs-none = Det finns inga loggar från Prova Luft än
meet-logs-failed = Det gick inte att spara loggarna från Prova Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Det gick inte att slutföra kontrollen av den här datorn.
   *[windows] Det gick inte att slutföra kontrollen av den här datorn.
}
problem-room = Det gick inte att göra plats för Luft.
problem-room-linux = Det gick inte att göra Luft redo.
problem-update = Det gick inte att uppdatera Luft.
problem-download = Hämtningen av Luft avbröts. Kontrollera att du är ansluten till internet.
problem-pack = Det gick inte att packa dina saker.
problem-remove = Det gick inte att ta bort Luft.
problem-restart = Det gick inte att förbereda omstarten.
problem-tidy = Det gick inte att ta bort de gamla startposterna.
problem-firmware = Det gick inte att öppna firmware-inställningarna.
problem-folders = Det gick inte att gå igenom dina mappar.
problem-sticks = Det gick inte att leta efter USB-minnen.
problem-stick = Det gick inte att skapa USB-minnet.
problem-offer = Luft kan inte hämtas just nu. Kontrollera att du är ansluten till internet, eller använd en ISO-fil som du redan har.
problem-luft = Det gick inte att undersöka Lufts disk.
problem-resize = Det gick inte att ändra Lufts storlek.
problem-cancel = Det gick inte att avbryta ändringen.
problem-give = Windows kunde inte ta tillbaka utrymmet.
problem-declined = { $platform ->
    [linux] Meet Luft behöver din tillåtelse för att arbeta med disken. Ange ditt lösenord när du blir tillfrågad.
   *[windows] Meet Luft behöver din tillåtelse för att arbeta med disken. Välj Ja när Windows frågar.
}

## First screen

hello-intro = { $platform ->
    [linux] Prova Luft direkt härifrån, utan USB-minne. Om du gillar det kan Luft ta det här systemets plats och behålla dina filer.
   *[windows] Luft kan finnas direkt bredvid Windows. Prova det först utan att installera något, och ta med dina saker när du är redo.
}
hello-check = { $platform ->
    [linux] Kontrollera den här datorn
   *[windows] Kontrollera den här datorn
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Kontrollerar den här datorn
   *[windows] Kontrollerar den här datorn
}
check-ready-title = { $platform ->
    [linux] Den här datorn är redo för Luft
   *[windows] Den här datorn är redo för Luft
}
check-blocked-title = Nästan klart
check-moment = Det tar en liten stund.
check-slow = Windows räknar ut hur mycket utrymme det kan avvara. På en stor disk kan det ta några minuter.
check-blocked-description = Något behöver ändras innan Luft kan flytta in. Så här gör du.
check-found-description = Det här hittade Meet Luft.
check-checking = Kontrollerar disken, firmware och maskinvaran …
check-again = Kontrollera igen
check-action-firmware = Öppna firmware-inställningarna
check-action-tidy = Städa upp
check-firmware-title = Vill du starta om till firmware-inställningarna?
check-firmware-description = Spara det du arbetar med först. Slå på Secure Boot där och spara, så startar datorn som vanligt igen.
check-tidy-title = Vill du ta bort de gamla startposterna?
check-tidy-description = De pekar bara på system som redan är borta. Windows och allt annat startar precis som förut.
check-get-ready-title = Vill du göra Luft redo?
check-get-ready-file = Meet Luft kopierar Luft från din ISO-fil till en mapp på den här datorn och lägger till en startpost för det. Inget partitioneras om.
check-get-ready-download = Meet Luft hämtar Luft, ungefär { $size }, till en mapp på den här datorn och lägger till en startpost för det. Inget partitioneras om.
check-get-ready-confirm = Gör Luft redo

## Choosing how much of the Windows drive Luft gets

room-title = Hur mycket plats ska Luft få?
room-description = Windows gör sig mindre för att ge Luft plats. Dina filer i Windows stannar precis där de är.
room-live = Windows behåller utrymme att växa. Luft lägger också undan { $size } att starta från, som det lämnar tillbaka när det är installerat.
room-make = Gör plats
room-confirm-title = Vill du ge Luft { $size }?
room-confirm-file = Windows krymper sin disk, och sedan kopierar Meet Luft Luft från din ISO-fil. Låt datorn vara ansluten till laddaren.
room-confirm-download = Windows krymper sin disk, och sedan hämtar Meet Luft Luft, ungefär { $size }. Låt datorn vara ansluten till laddaren och till internet.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Var ska Luft ligga?
room-places-description = Luft kan dela disk med Windows eller ta utrymme som Windows inte använder.
room-places-label = Platser för Luft
room-place-windows = Bredvid Windows
room-place-windows-detail = Windows gör sig mindre för att ge Luft plats
room-place-windows-free = { $size } är redan ledigt där
room-place-free = Ledigt utrymme på { $drive }
room-place-free-here = Ledigt utrymme på Windows-disken
room-place-free-detail = { $size } som inget annat använder
room-place-whole = Hela { $drive }
room-place-whole-detail = Raderar den här disken på { $size } åt Luft
room-live-free = { $free } av det är redan ledigt, så Windows avstår mindre och behåller utrymme att växa. Luft lägger också undan { $size } att starta från, som det lämnar tillbaka när det är installerat.
room-live-elsewhere = Luft får { $room } där och lägger undan { $size } till att starta från, som det lämnar tillbaka när det är installerat.
room-confirm-free-title = Vill du ge Luft { $size } ledigt utrymme?
room-confirm-free-file = Meet Luft kopierar dit Luft från din ISO-fil. Inget annat på disken ändras.
room-confirm-free-download = Meet Luft hämtar Luft dit, ungefär { $size }. Inget annat på disken ändras. Låt datorn vara ansluten till internet.
room-erase-title = Vill du radera { $drive }?
room-erase-description = Allt på den här disken på { $size } raderas direkt, innan Luft startar. Det går inte att ångra. Just nu finns:
room-erase-empty = Windows kan inte läsa något på den här disken på { $size }, men allt som finns på den raderas direkt. Det går inte att ångra.
room-erase-unnamed = Namnlös partition
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Krypterad med BitLocker
room-erase-understood = Jag vet att en del av det är krypterat med BitLocker och inte går att få tillbaka
room-erase-confirm = Radera och gör plats

## Luft is ready on Windows

ready-title = Luft är redo
ready-description = Välj hur du vill möta det. Windows startar som vanligt efteråt, om du inte installerar Luft och väljer det.
ready-update-title = Hämta senaste Luft
ready-update-description = Det finns ett nyare bygge. Det ersätter det här och behåller platsen och allt du har packat.
ready-try-title = Prova Luft
ready-try-description = Starta om till Luft utan att installera något. Windows startar som vanligt nästa gång.
ready-box-description = Packa dokument, foton, Wi-Fi-nätverk och mer, så packar Luft upp dem när det är installerat.
ready-box-packed = Packat, { $size }
ready-install-title = Installera Luft
ready-install-description = Starta om till installationsprogrammet. De { $size } bredvid Windows väntar redan på det.
ready-install-drive-description = Starta om till installationsprogrammet. De { $size } på { $drive } väntar redan på det.
ready-stick-description = Lägg Luft på ett USB-minne för att starta det på vilken dator som helst.
ready-remove = Ta bort Luft från den här datorn
ready-restart-try = Spara det du arbetar med först. Luft öppnas om ungefär en minut, och nästa omstart tar dig tillbaka till Windows.
ready-restart-install = Spara det du arbetar med först. Installationsprogrammet öppnas om ungefär en minut, och inget ändras förrän du bekräftar där.
ready-fast-startup-title = Stäng av Snabbstart i Windows
ready-fast-startup-description = Då stängs Windows av helt, så ljud, Wi-Fi och Bluetooth startar på nytt i Luft.
ready-clock-title = Håll klockan rätt i båda
ready-clock-description = Windows läser datorns klocka på samma sätt som Luft, så tiden hoppar inte längre när du byter.
ready-remove-title = Vill du ta bort Luft från den här datorn?
ready-remove-description = Meet Luft raderar allt den har lagt till, även flyttlådan, och ger tillbaka allt utrymme till Windows.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Välj hur du vill möta det. { $system } fortsätter att starta som vanligt tills du bestämmer något annat.
linux-ready-this-system = det här systemet
linux-ready-update-description = Det finns ett nyare bygge. Det ersätter det som Meet Luft har sparat och behåller loggarna från när du provade.
linux-ready-try-description = Starta om till Luft utan att ändra något. { $system } startar som vanligt nästa gång.
linux-ready-replace-title = Ersätt { $system }
linux-ready-replace-description = Luft tar dess plats och behåller dina filer, ditt konto, Wi-Fi-nätverk och andra diskar. Det gamla systemet finns kvar tills du tar bort det.
linux-ready-install-description = Starta om till installationsprogrammet för att lägga Luft på en annan disk eller på ledigt utrymme.
linux-ready-remove = Ta bort Luft från den här datorn
linux-ready-restart-try = Spara det du arbetar med först. Luft öppnas om ungefär en minut, och nästa omstart tar dig tillbaka till { $system }.
linux-ready-restart-replace = Spara det du arbetar med först. Installationsprogrammet öppnas med { $system } valt att ersättas och visar vad som behålls innan något ändras.
linux-ready-remove-title = Vill du ta bort Luft från den här datorn?
linux-ready-remove-description = Meet Luft raderar Lufts filer, dess startfiler och dess startpost. Allt annat förblir som det är.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Ditt Luft
luft-looking = Meet Luft hittade Luft på den här datorn.
luft-checking = Undersöker Lufts disk …
luft-description-beside = Luft är installerat bredvid Windows på den här datorn.
luft-description-drive = Luft är installerat på { $drive }.
luft-bar-used = { $size }, { $used } används
luft-resize-title = Ändra hur mycket utrymme Luft har
luft-resize-description = Ge Luft mer av utrymmet från Windows, eller ge tillbaka en del till Windows.
luft-resize-drive-description = Ge Luft mer av det lediga utrymmet på { $drive }, eller lämna en del av det ledigt.
luft-resize-reencrypting = Luft håller fortfarande på att kryptera eller dekryptera sin disk. När det är klart kan storleken ändras.
luft-resize-passphrase = Lufts disk kan bara låsas upp med en lösenfras, och Luft kan inte skriva in den själv medan det flyttar.
luft-resize-start-first = Starta Luft en gång så att det kan berätta för Meet Luft hur fullt det är, och kom sedan tillbaka.
luft-resize-apart = En annan partition ligger mellan Windows och Luft, så de kan inte dela på utrymmet.
luft-pending-grow = Luft växer nästa gång det startar
luft-pending-grow-description = Starta om till Luft och låt det vara igång i några minuter medan det flyttar in i det nya utrymmet. Du kan använda det under tiden.
luft-pending-shrink = Luft gör plats nästa gång det startar
luft-pending-shrink-description = Starta om till Luft och låt det vara igång i några minuter medan det flyttar sina filer. Öppna sedan Meet Luft i Windows igen för att ge Windows utrymmet.
luft-pending-trim = Luft blir mindre nästa gång det startar
luft-pending-trim-description = Starta om till Luft, så gör det sig mindre inom ungefär en minut.
luft-windows-free-title = Ge Windows det lediga utrymmet
luft-windows-free-description = { $size } direkt efter Windows används inte av något. Windows kan ta tillbaka det.
luft-leftovers-title = Städa upp efter Prova Luft
luft-leftovers-description = Partitionerna som Meet Luft skapade för att starta Luft finns kvar. Luft behöver dem inte längre.
luft-start = Starta om till Luft
luft-cancel = Avbryt ändringen
luft-restart = Spara det du arbetar med först. Luft startar om ungefär en minut, och nästa omstart tar dig tillbaka till Windows.
luft-restart-pending = Spara det du arbetar med först. Luft startar om ungefär en minut och flyttar sina filer på egen hand, vilket tar några minuter. Du kan använda det under tiden.
luft-remove = Ta bort Luft från den här datorn
luft-remove-title = Vill du ta bort Luft från den här datorn?
luft-remove-description = Luft och allt i det raderas, totalt { $size }, och Windows får tillbaka utrymmet. Datorn startar Windows som förut. Det går inte att ångra.
luft-remove-drive-description = Luft och allt i det raderas från { $drive }, totalt { $size }. Datorn startar Windows som förut. Det går inte att ångra.
luft-remove-confirm = Ta bort Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Hur mycket utrymme ska Luft få?
resize-description = Dra för att dela disken mellan Windows och Luft. Luft gör ändringen själv nästa gång det startar.
resize-measuring = Windows räknar ut hur mycket utrymme det kan avvara. På en stor disk kan det ta några minuter.
resize-full = Luft är för fullt för att flyttas, och Windows kan inte avvara tillräckligt med utrymme. Gör plats i Luft eller i Windows först.
resize-drive-description = Dra för att välja hur mycket av { $drive } Luft ska få. Luft gör ändringen själv nästa gång det startar.
resize-drive-free = { $size } ledigt på { $drive }
resize-used = Lufts filer tar upp { $size }.
resize-least = Ändra storleken med minst { $size }.
resize-apply = Ändra
resize-grow-title = Vill du ge Luft { $size } till?
resize-grow-description = Windows gör sig mindre direkt. Luft flyttar in i det nya utrymmet nästa gång det startar, vilket tar några minuter. Låt datorn vara ansluten till laddaren.
resize-grow-drive-description = Luft tar det lediga utrymmet på { $drive } nästa gång det startar, vilket tar en kort stund.
resize-trim-title = Vill du göra Luft { $size } mindre?
resize-trim-description = Luft gör sig mindre nästa gång det startar, och utrymmet på { $drive } förblir ledigt.
resize-shrink-title = Vill du ge tillbaka { $size } till Windows?
resize-shrink-description = Luft flyttar sina filer nästa gång det startar, vilket tar några minuter. Öppna sedan Meet Luft igen, så tar Windows tillbaka utrymmet. Låt datorn vara ansluten till laddaren.

## Packing things to take along to Luft (the moving box)

box-title = Ta med dina saker
box-description = Välj vad du vill ta med. Luft packar upp det i ditt nya konto när det är installerat, och inget tas bort från Windows.
box-looking = Går igenom dina mappar …
box-folder-desktop = Skrivbord
box-folder-documents = Dokument
box-folder-downloads = Hämtade filer
box-folder-music = Musik
box-folder-pictures = Bilder
box-folder-videos = Videoklipp
box-folder-size = { $size }, { $files ->
    [one] { $files } fil
   *[other] { $files } filer
}
box-wifi-title = Wi-Fi-nätverk
box-wifi-description = Med lösenorden, så att Luft är online direkt
box-bluetooth-title = Bluetooth-enheter
box-bluetooth-description = { $devices ->
    [one] { $devices } enhet, klar att använda utan att paras ihop igen
   *[other] { $devices } enheter, klara att använda utan att paras ihop igen
}
box-wallpaper-title = Bakgrundsbild
box-wallpaper-description = Bilden på ditt Windows-skrivbord
box-account-title = Ditt namn och din bild
box-total-slow = { $size }, som tar ungefär { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuter
} att packa
box-pack = Packa

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Gör plats
    .description = Windows flyttar sina filer för att få plats. Det kan ta några minuter.
working-erasing = Raderar disken
    .description = Windows tömmer den så att Luft kan få hela.
working-partitioning = Förbereder Lufts utrymme
    .description = Förbereder partitionerna som Luft startar från.
working-downloading = För över Luft
    .description = Luft kopieras direkt till sitt eget utrymme och kontrolleras på vägen.
working-packing = Packar dina saker
    .description = Kopierar allt du valde till flyttlådan. Stora mappar tar en stund.
working-removing = Tar bort Luft
    .description = Ger tillbaka utrymmet till Windows.
working-removing-linux = Tar bort Luft
    .description = Tar bort dess filer och dess startpost.
working-writing = Skapar USB-minnet
    .description = Luft skrivs till hela minnet. Låt det sitta i.
working-copying = Lägger till Luft i Ventoy
    .description = Luft kopieras bredvid de andra ISO-filerna på minnet. Låt det sitta i.
working-verifying = Kontrollerar USB-minnet
    .description = Läser tillbaka allt för att se till att det startar.
working-stick-downloading = Hämtar Luft
    .description = Det kontrolleras på vägen och sparas, så att nästa USB-minne går snabbare.
working-progress = { $done } av { $total }
working-keep-open = Låt det här fönstret vara öppet.

## After Luft was removed

removed-title = Allt är som förut
removed-description = { $platform ->
    [linux] Lufts filer och dess startpost är borta, och datorn startar precis som förut. Välkommen tillbaka när du vill.
   *[windows] Lufts partitioner och dess startpost är borta, och Windows har allt sitt utrymme igen. Välkommen tillbaka när du vill.
}

## Making a USB stick

stick-title = Skapa ett USB-minne
stick-description = Luft startar från det på vilken dator som helst, för att prova eller installera.
stick-looking = Letar efter USB-minnen …
stick-none = Anslut ett USB-minne på { $size } eller mer. Det visas här.
stick-drives-label = USB-minnen
stick-offer = { $name }, { $size }
stick-make = Skapa USB-minnet
stick-drive-empty = Tomt
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · För litet för Luft
stick-ventoy-title = Det här USB-minnet använder Ventoy
stick-ventoy-description = Vill du lägga till Luft på det, eller radera hela minnet och göra det till ett Luft-minne?
stick-erase-it = Radera det
stick-add = Lägg till Luft
stick-replace-title = Vill du ersätta Luft på minnet?
stick-replace-description = { $count ->
    [one] { $names } finns redan på det här minnet. Nya Luft kan ta dess plats.
   *[other] { $names } finns redan på det här minnet. Nya Luft kan ta deras plats.
}
stick-keep = { $count ->
    [one] Behåll båda
   *[other] Behåll alla
}
stick-replace = Ersätt
stick-full-title = Det finns inte plats för Luft
stick-full-description = Luft behöver { $needed }, och { $free } är ledigt på det här minnet. Gör plats på det, eller radera det och gör det till ett Luft-minne.
stick-erase-title = Vill du radera { $name }?
stick-erase-description = Allt på det här USB-minnet på { $size } raderas och ersätts med Luft. Det går inte att ångra.
stick-erase-confirm = Radera och skapa USB-minnet
stick-done-title = Ditt Luft-minne är klart
stick-done-ventoy-title = Luft finns på ditt Ventoy-minne
stick-done-take-out = Du kan ta ut det nu.
stick-done-eject = Mata ut det innan du tar ut det.
stick-done-start = Starta från det genom att ansluta det och välja det i datorns bootmeny, som öppnas med en tangent som F12, F8 eller Esc direkt när datorn slås på.
stick-done-ventoy-key = Med Secure Boot på ber Ventoy en gång om att få registrera sin egen nyckel, första gången det startar.
stick-done = Klar
stick-done-another = Skapa ett till
