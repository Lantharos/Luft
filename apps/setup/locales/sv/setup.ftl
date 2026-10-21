## Buttons used across steps

setup-continue = Fortsätt
setup-back = Tillbaka
setup-cancel = Avbryt
setup-not-now = Inte nu
setup-try-again = Försök igen
setup-restart = Starta om
setup-restart-now = Starta om nu
setup-restart-later = Starta om senare
setup-saving = Sparar …

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installerar Luft
setup-installing-progress = Installerar, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Sök
setup-picker-no-match = Inga träffar

## Welcome step: language, keyboard and time zone

setup-region-title = Välkommen till Luft
setup-region-language = Språk
setup-region-keyboard = Tangentbord
setup-region-time-zone = Tidszon
setup-region-intro = Nu sätter vi igång. Välj språk, tangentbord och tidszon.
setup-region-intro-guessed-computer = Nu sätter vi igång. Vi har gissat de här utifrån datorn, så ändra det som inte stämmer.
setup-region-intro-guessed = Nu sätter vi igång. Vi har gissat { $guesses }, så ändra det som inte stämmer.
setup-region-guess-from-computer = { $fields } utifrån datorn
setup-region-guess-from-network = { $fields } utifrån nätverket
setup-region-field-language = språket
setup-region-field-keyboard = tangentbordet
setup-region-field-time-zone = tidszonen

## Where Luft goes

setup-destination-choose-title = Var ska Luft installeras?
setup-destination-choose-description = Välj hur Luft ska få plats på den här datorn. Inget ändras förrän du bekräftar.
setup-destination-alongside-title = Gör plats bredvid Windows
setup-destination-alongside-description = Windows krymps för att ge plats åt Luft. Dina filer i Windows förblir som de är.
setup-destination-whole-title = Välj en disk
setup-destination-whole-description = Luft tar hela disken. Allt på den raderas.
setup-destination-custom-title = Välj utrymmet för Luft
setup-destination-custom-description = Använd Diskar för att ordna diskarna som du vill.
setup-destination-replace-title = Ersätt { $system }
setup-destination-replace-description = Luft tar dess plats och behåller det som är ditt.
setup-destination-meet-title = Bredvid Windows
setup-destination-meet-description = Meet Luft har redan gjort plats, så Windows förblir precis som det är.
setup-destination-meet-drive-title = På { $drive }
setup-destination-meet-drive-description = Meet Luft har redan gjort plats på en annan disk, och Luft startar därifrån med egna startfiler.
setup-destination-looking = Letar efter diskar …

setup-destination-meet-choice = Bredvid Windows
setup-destination-meet-choice-description = Använd de { $size } som Meet Luft har gjort plats för bredvid Windows.
setup-destination-meet-drive-choice = På { $drive }
setup-destination-meet-drive-choice-description = Använd de { $size } som Meet Luft har gjort plats för på { $drive }.
setup-destination-alongside-choice = Bredvid { $windows }
setup-destination-alongside-choice-description = Behåll Windows och dess filer och ge Luft en del av disken.
setup-destination-replace-choice = Ersätt { $system }
setup-destination-replace-choice-description = Behåll dina filer, ditt konto och dina inställningar och låt Luft ta dess plats.
setup-destination-whole-choice = Använd en hel disk
setup-destination-whole-choice-description = Radera en disk och ge hela den till Luft.
setup-destination-try-choice = Prova bara Luft
setup-destination-try-choice-description = Titta dig omkring först. Inget installeras och diskarna lämnas orörda.
setup-destination-custom-choice = Anpassat
setup-destination-custom-choice-description = Ordna partitionerna själv i Diskar.

setup-destination-more-options = Fler alternativ
setup-destination-starting = Startar …
setup-destination-replace = Ersätt
setup-destination-install = Installera Luft

## Confirming where Luft goes

setup-confirm-replace-title = Vill du ersätta { $system }?
setup-confirm-erase-title = Vill du radera { $drive }?
setup-confirm-shrink-title = Vill du krympa Windows till { $size }?
setup-confirm-meet-title = Vill du installera Luft bredvid Windows?
setup-confirm-meet-drive-title = Vill du installera Luft på { $drive }?
setup-confirm-free-title = Vill du installera Luft på det lediga utrymmet?
setup-confirm-replace-keep-old = Luft börjar kopiera direkt. Det gamla systemet startar inte längre, och dess filer finns kvar tills du tar bort dem.
setup-confirm-replace-erase-old = Luft börjar kopiera direkt. Det gamla systemet raderas för gott, och dina filer stannar där de är.
setup-confirm-erase-description = Allt på disken raderas för gott, även andra system och filer.
setup-confirm-install-description = Luft börjar kopiera direkt. Du kan konfigurera ditt konto under tiden.
setup-confirm-erase = Radera och installera
setup-confirm-install = Installera

## Making room next to Windows

setup-alongside-hint = Dra för att dela { $drive } mellan Windows och Luft. Windows behåller alla sina filer och lite utrymme att växa.
setup-windows-bitlocker = Windows håller den här disken låst med BitLocker, så Luft kan inte göra plats på den. Stäng av enhetskryptering i Windows, eller krymp disken i Diskhantering och välj det lediga utrymmet under Anpassat.
setup-windows-hibernated = Windows är i viloläge eller stängdes av med Snabbstart, så disken kan inte ändras på ett säkert sätt. Starta Windows, håll ned Skift medan du väljer Stäng av och starta sedan Luft igen.
setup-windows-dirty = Windows-disken behöver en snabb kontroll först. Starta Windows, starta om det en gång och starta sedan Luft igen.
setup-windows-full = Windows behöver nästan hela sin disk. Frigör ungefär { $size } i Windows och starta sedan Luft igen.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Det du packade i Windows, { $size }, packas upp i ditt nya konto.

## Windows options

setup-windows-fast-startup = Stäng av Snabbstart i Windows
setup-windows-fast-startup-description = Då stängs Windows av helt, så ljud, Wi-Fi och Bluetooth startar på nytt i Luft och disken förblir tillgänglig.
setup-windows-clock = Håll klockan rätt i båda
setup-windows-clock-description = Windows läser datorns klocka på samma sätt som Luft, så tiden hoppar inte längre när du byter.
setup-windows-bluetooth = Ta med dina Bluetooth-enheter
setup-windows-bluetooth-description = { $count ->
    [one] { $count } enhet som är ihopparad i Windows fungerar i Luft utan att paras ihop igen.
   *[other] { $count } enheter som är ihopparade i Windows fungerar i Luft utan att paras ihop igen.
}

## Choosing a drive

setup-drives-label = Diskar
setup-drives-none = Det finns ingen disk som Luft kan använda. Anslut en och leta igen.
setup-drive-has-windows = Har { $windows }
setup-drive-empty = Tom
setup-drive-partitions = { $count ->
    [one] Har { $count } partition
   *[other] Har { $count } partitioner
}

## Custom space

setup-custom-open-disks = Öppna Diskar
setup-custom-looking = Letar …
setup-custom-look-again = Leta igen
setup-custom-free-label = Ledigt utrymme
setup-custom-free-space = { $size } ledigt utrymme
setup-custom-on-drive = På { $drive }
setup-custom-none = Frigör minst { $size } i Diskar och leta sedan igen. Luft installeras på det utrymme du lämnar ledigt.

## Replacing a Linux system

setup-replace-stays = Det här behålls
setup-replace-changes = Det här ändras
setup-replace-keeps-account = Dina filer och ditt konto { $account }
setup-replace-keeps-account-password = Dina filer och ditt konto { $account } med lösenordet
setup-replace-keeps-accounts = { $count ->
    [one] Det andra kontot på systemet, med dess filer
   *[other] De { $count } andra kontona på systemet, med deras filer
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } nätverksanslutning, med Wi-Fi-lösenordet
   *[other] { $count } nätverksanslutningar, med Wi-Fi-lösenorden
}
setup-replace-keeps-drives = { $drives }, monteras vid start som förut
setup-replace-keeps-hostname = Datorns namn, { $hostname }, och dess SSH-nycklar
setup-replace-keeps-tools = { $count ->
    [one] { $count } kommandoradsverktyg som du har installerat, i en Toolbox när du har loggat in
   *[other] { $count } kommandoradsverktyg som du har installerat, i en Toolbox när du har loggat in
}
setup-replace-keeps-old = { $system } startar inte längre. Systemfilerna sparas som old-system tills du tar bort dem i Diskar eller Inställningar.
setup-replace-erases-system = Systempartitionen för { $system } raderas. Dina filer ligger på en egen partition och förblir som de är.
setup-replace-clears-boot = Dess /boot-partition töms för att rymma Lufts startfiler.
setup-replace-apps = Appar som är installerade där följer inte med. Hämta dem igen från Schelf.

setup-replace-blocked-encrypted = Systemet är krypterat, så det går ännu inte att ersätta det och behålla dina filer.
setup-replace-blocked-single = Dina filer delar partition med systemet, så det går ännu inte att ersätta det och behålla dem.
setup-replace-blocked-layout = Disken är indelad på ett sätt som Luft inte kan ersätta ännu.
setup-replace-blocked-startup = EFI-systempartitionen är för liten för Luft, och det finns ingen /boot-partition att använda i stället.
setup-replace-blocked-no-account = Det finns inget konto att ta med.
setup-replace-blocked-running = Luft startar från systemet just nu. Starta Luft från ett USB-minne för att ersätta det.
setup-replace-blocked-read-only = Disken är skrivskyddad.

## Connecting to the internet

setup-network-title = Anslut till internet
setup-network-description = Det här är valfritt. När du är ansluten kan Luft ställa in klockan och tidszonen, och du kan använda internet medan Luft installeras.
setup-network-unavailable = Inga nätverk är tillgängliga just nu. Du kan ansluta senare från panelen.
setup-network-looking = Letar efter nätverk …
setup-network-cable = Ansluten med kabel
setup-network-show-all = Visa alla nätverk
setup-network-skip = Hoppa över
setup-network-failed = Det gick inte att ansluta
setup-network-wrong-password = Fel lösenord
setup-network-connected = Ansluten
setup-network-connecting = Ansluter …
setup-network-saved = Sparat
setup-network-password = Lösenord
setup-network-join = Anslut

## Account

setup-account-title = Vem använder den här datorn?
setup-account-description = Det här är kontot du loggar in med. Du kan lägga till fler personer senare i Inställningar.
setup-account-full-name = Ditt namn
setup-account-full-name-example = Astrid Lindgren
setup-account-user-name = Användarnamn
setup-account-password = Lösenord
setup-account-repeat = Skriv det igen
setup-account-user-name-invalid = Använd gemener, siffror, - och _
setup-account-full-name-invalid = Utelämna kommatecken och kolon
setup-account-mismatch = Lösenorden stämmer inte överens

## Installing

setup-finishing-failed-title = Det gick inte att installera Luft
setup-finishing-failed-description = Något gick fel under installationen.
setup-finishing-failed-stick = Datorn startar fortfarande som förut. Du kan fortsätta använda Luft från USB-minnet eller starta om och försöka igen.
setup-finishing-failed-trying = Datorn startar fortfarande som förut. Du kan fortsätta använda Luft som det är nu eller starta om och försöka igen.
setup-finishing-use-stick = Använd Luft från USB-minnet
setup-finishing-keep-trying = Fortsätt prova Luft
setup-finishing-installed-title = Luft är installerat
setup-finishing-trust-stick = Ta ut USB-minnet när skärmen blir svart. En blå skärm ber dig sedan att lita på Luft. Använd tangentbordet där.
setup-finishing-trust = Direkt efter omstarten ber en blå skärm dig att lita på Luft. Använd tangentbordet där.
setup-finishing-restart-stick = Starta om för att börja använda det. Ta ut USB-minnet när skärmen blir svart.
setup-finishing-restart = Starta om för att börja använda det.
setup-finishing-title = Snart klart
setup-finishing-description = Luft kopieras till datorn. Det tar några minuter.
setup-finishing-plug-in = Låt datorn vara ansluten till laddaren tills det är klart.
setup-stage-idle = Förbereder
setup-stage-preparing = Gör plats för Luft
setup-stage-copying = Kopierar Luft
setup-stage-waiting = Slutför
setup-stage-configuring = Konfigurerar ditt konto
setup-stage-finished = Klart

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Tryck på en tangent inom 10 sekunder
setup-enroll-choose-enroll = Välj Enroll MOK och sedan Continue
setup-enroll-choose-yes = Välj Yes
setup-enroll-type-code = Skriv koden och välj sedan Reboot
setup-enroll-digits = { $count ->
    [one] { $count } siffra
   *[other] { $count } siffror
}
setup-secure-boot-title = Datorn litar inte på Luft än
setup-secure-boot-code = Direkt efter nästa omstart ber en blå skärm dig att lita på Luft. Använd tangentbordet där med den här koden.
setup-secure-boot-skipped = Den blå skärmen hoppades över. Hämta en ny kod och starta om, och använd sedan tangentbordet där.
setup-secure-boot-getting = Hämtar din kod …
setup-secure-boot-new-code = Hämta en ny kod

## Encryption

setup-protect-title = Skydda dina filer
setup-protect-tpm = Kryptera datorn så att ingen kan läsa dina filer utan att logga in, även om den kommer bort. Den låses upp av sig själv när den startar.
setup-protect-passphrase = Kryptera datorn så att ingen kan läsa dina filer utan din lösenfras, även om den kommer bort.
setup-protect-staged-title = Dina filer kommer att krypteras
setup-protect-staged-description = Krypteringen startar av sig själv efter omstarten i slutet av installationen, och du kan använda datorn under tiden.
setup-protect-keep-safe = Förvara återställningsnyckeln på ett säkert ställe, inte tillsammans med datorn. Du behöver den om datorn någon gång inte kan låsa upp sig själv.
setup-protect-passphrase-label = Lösenfras
setup-protect-repeat = Skriv den igen
setup-protect-mismatch = De stämmer inte överens
setup-protect-kept = Jag har sparat min återställningsnyckel
setup-protect-background = Krypteringen sker i bakgrunden efter nästa omstart, och du kan använda datorn under tiden.
setup-protect-encrypt = Kryptera
setup-protect-checking = Kontrollerar …
setup-protect-start = Kryptera mina filer

## Fingerprint

setup-fingerprint-title = Logga in med fingret
setup-fingerprint-description = Lås upp Luft med en beröring i stället för att skriva lösenordet. Du kan lägga till fler fingrar senare i Inställningar.
setup-fingerprint-which = Vilket finger?
setup-fingerprint-another = Vill du lägga till ett finger till?
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = Fingeravtrycksläsaren svarar inte. Du kan lägga till ett fingeravtryck senare i Inställningar.
setup-fingerprint-add = Lägg till fingeravtryck
setup-fingerprint-choose-another = Välj ett annat finger

## Done

setup-ready-title = Allt är klart
setup-ready-trust = Starta om en gång till för att slutföra. Direkt efter omstarten ber en blå skärm dig att lita på Luft. Använd tangentbordet där med den här koden.
setup-ready-restart = Starta om en gång till för att slutföra och logga sedan in med ditt lösenord.
setup-ready-done = Skrivbordet är klart. Ha det så kul med Luft.
setup-ready-start = Börja använda Luft
