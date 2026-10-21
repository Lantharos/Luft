## Buttons used across steps

setup-continue = Fortsæt
setup-back = Tilbage
setup-cancel = Annuller
setup-not-now = Ikke nu
setup-try-again = Prøv igen
setup-restart = Genstart
setup-restart-now = Genstart nu
setup-restart-later = Genstart senere
setup-saving = Gemmer…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installerer Luft
setup-installing-progress = Installerer, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Søg
setup-picker-no-match = Intet passer

## Welcome step: language, keyboard and time zone

setup-region-title = Velkommen til Luft
setup-region-language = Sprog
setup-region-keyboard = Tastatur
setup-region-time-zone = Tidszone
setup-region-intro = Lad os komme i gang. Vælg dit sprog, dit tastatur og din tidszone.
setup-region-intro-guessed-computer = Lad os komme i gang. Vi har gættet indstillingerne ud fra din computer, så ret det, der ikke passer.
setup-region-intro-guessed = Lad os komme i gang. Vi har gættet { $guesses }, så ret det, der ikke passer.
setup-region-guess-from-computer = { $fields } ud fra din computer
setup-region-guess-from-network = { $fields } ud fra dit netværk
setup-region-field-language = dit sprog
setup-region-field-keyboard = dit tastatur
setup-region-field-time-zone = din tidszone

## Where Luft goes

setup-destination-choose-title = Hvor skal Luft installeres?
setup-destination-choose-description = Vælg, hvordan Luft skal være på denne computer. Intet ændres, før du bekræfter.
setup-destination-alongside-title = Gør plads ved siden af Windows
setup-destination-alongside-description = Windows bliver mindre for at give plads til Luft. Dine filer i Windows forbliver, som de er.
setup-destination-whole-title = Vælg en disk
setup-destination-whole-description = Luft bruger hele disken. Alt på den bliver slettet.
setup-destination-custom-title = Vælg pladsen til Luft
setup-destination-custom-description = Brug Diske til at indrette dine diske, som du vil.
setup-destination-replace-title = Erstat { $system }
setup-destination-replace-description = Luft tager dets plads og beholder det, der er dit.
setup-destination-meet-title = Ved siden af Windows
setup-destination-meet-description = Meet Luft har allerede gjort plads, så Windows forbliver præcis, som det er.
setup-destination-meet-drive-title = På { $drive }
setup-destination-meet-drive-description = Meet Luft har allerede gjort plads på en anden disk, og Luft starter derfra med sine egne opstartsfiler.
setup-destination-looking = Undersøger dine diske…

setup-destination-meet-choice = Ved siden af Windows
setup-destination-meet-choice-description = Brug de { $size }, som Meet Luft har gjort klar ved siden af Windows.
setup-destination-meet-drive-choice = På { $drive }
setup-destination-meet-drive-choice-description = Brug de { $size }, som Meet Luft har gjort klar på { $drive }.
setup-destination-alongside-choice = Ved siden af { $windows }
setup-destination-alongside-choice-description = Behold Windows og dets filer, og giv Luft en del af disken.
setup-destination-replace-choice = Erstat { $system }
setup-destination-replace-choice-description = Behold dine filer, din konto og dine indstillinger, og lad Luft tage dets plads.
setup-destination-whole-choice = Brug en hel disk
setup-destination-whole-choice-description = Slet en disk, og giv hele den til Luft.
setup-destination-try-choice = Prøv bare Luft
setup-destination-try-choice-description = Se dig omkring først. Intet bliver installeret, og dine diske forbliver urørte.
setup-destination-custom-choice = Brugerdefineret
setup-destination-custom-choice-description = Inddel selv partitionerne i Diske.

setup-destination-more-options = Flere muligheder
setup-destination-starting = Starter…
setup-destination-replace = Erstat
setup-destination-install = Installer Luft

## Confirming where Luft goes

setup-confirm-replace-title = Vil du erstatte { $system }?
setup-confirm-erase-title = Vil du slette { $drive }?
setup-confirm-shrink-title = Vil du formindske Windows til { $size }?
setup-confirm-meet-title = Vil du installere Luft ved siden af Windows?
setup-confirm-meet-drive-title = Vil du installere Luft på { $drive }?
setup-confirm-free-title = Vil du installere Luft på den ledige plads?
setup-confirm-replace-keep-old = Luft begynder at kopiere med det samme. Det gamle system kan ikke længere starte, og dets filer bliver liggende, indtil du fjerner dem.
setup-confirm-replace-erase-old = Luft begynder at kopiere med det samme. Det gamle system slettes for altid, og dine filer bliver, hvor de er.
setup-confirm-erase-description = Alt på denne disk slettes for altid, også andre systemer og filer.
setup-confirm-install-description = Luft begynder at kopiere med det samme. Du kan konfigurere din konto imens.
setup-confirm-erase = Slet og installer
setup-confirm-install = Installer

## Making room next to Windows

setup-alongside-hint = Træk for at dele { $drive } mellem Windows og Luft. Windows beholder alle sine filer og lidt plads til at vokse.
setup-windows-bitlocker = Windows holder denne disk låst med BitLocker, så Luft kan ikke gøre plads på den. Slå enhedskryptering fra i Windows, eller formindsk disken i Diskhåndtering, og vælg den ledige plads under Brugerdefineret.
setup-windows-hibernated = Windows er i dvale eller blev lukket ned med Hurtig start, så disken kan ikke ændres sikkert. Start Windows, hold Skift nede, mens du vælger Luk computeren, og start så Luft igen.
setup-windows-dirty = Windows’ disk skal lige kontrolleres først. Start Windows, genstart den én gang, og start så Luft igen.
setup-windows-full = Windows bruger næsten hele sin disk. Frigør cirka { $size } i Windows, og start så Luft igen.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Det, du pakkede i Windows, { $size }, bliver pakket ud på din nye konto.

## Windows options

setup-windows-fast-startup = Slå Hurtig start fra i Windows
setup-windows-fast-startup-description = Så lukker Windows helt ned, og lyd, wi-fi og Bluetooth starter forfra i Luft, og Windows’ disk forbliver tilgængelig.
setup-windows-clock = Hold uret rigtigt i begge
setup-windows-clock-description = Windows læser computerens ur på samme måde som Luft, så klokkeslættet ikke længere springer, når du skifter.
setup-windows-bluetooth = Tag dine Bluetooth-enheder med
setup-windows-bluetooth-description = { $count ->
    [one] { $count } enhed, der er parret i Windows, virker i Luft uden at skulle parres igen.
   *[other] { $count } enheder, der er parret i Windows, virker i Luft uden at skulle parres igen.
}

## Choosing a drive

setup-drives-label = Diske
setup-drives-none = Der er ingen disk, som Luft kan bruge. Tilslut en, og se efter igen.
setup-drive-has-windows = Har { $windows }
setup-drive-empty = Tom
setup-drive-partitions = { $count ->
    [one] Har { $count } partition
   *[other] Har { $count } partitioner
}

## Custom space

setup-custom-open-disks = Åbn Diske
setup-custom-looking = Undersøger…
setup-custom-look-again = Se efter igen
setup-custom-free-label = Ledig plads
setup-custom-free-space = { $size } ledig plads
setup-custom-on-drive = På { $drive }
setup-custom-none = Gør mindst { $size } ledig plads i Diske, og se så efter igen. Luft installeres på den plads, du lader være ledig.

## Replacing a Linux system

setup-replace-stays = Det bevares
setup-replace-changes = Det ændres
setup-replace-keeps-account = Dine filer og din konto { $account }
setup-replace-keeps-account-password = Dine filer og din konto { $account } med dens adgangskode
setup-replace-keeps-accounts = { $count ->
    [one] Den anden konto på systemet med dens filer
   *[other] De { $count } andre konti på systemet med deres filer
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } netværksforbindelse med dens wi-fi-adgangskode
   *[other] { $count } netværksforbindelser med wi-fi-adgangskoder
}
setup-replace-keeps-drives = { $drives }, som tilsluttes ved opstart som før
setup-replace-keeps-hostname = Computerens navn, { $hostname }, og dens SSH-nøgler
setup-replace-keeps-tools = { $count ->
    [one] { $count } kommandolinjeværktøj, du har installeret, i en Toolbox, når du har logget ind
   *[other] { $count } kommandolinjeværktøjer, du har installeret, i en Toolbox, når du har logget ind
}
setup-replace-keeps-old = { $system } kan ikke længere starte. Systemfilerne gemmes som old-system, indtil du fjerner dem i Diske eller Indstillinger.
setup-replace-erases-system = Systempartitionen for { $system } slettes. Dine filer ligger på deres egen partition og forbliver, som de er.
setup-replace-clears-boot = Systemets /boot-partition ryddes, så den kan rumme Lufts opstartsfiler.
setup-replace-apps = Apps, der er installeret i systemet, kommer ikke med. Hent dem igen i Schelf.

setup-replace-blocked-encrypted = Systemet er krypteret, så det kan endnu ikke erstattes, mens dine filer beholdes.
setup-replace-blocked-single = Dine filer deler partition med systemet, så det kan endnu ikke erstattes, mens filerne beholdes.
setup-replace-blocked-layout = Systemets disk er inddelt på en måde, som Luft endnu ikke kan erstatte.
setup-replace-blocked-startup = Systemets EFI-systempartition er for lille til Luft, og der er ingen /boot-partition at bruge i stedet.
setup-replace-blocked-no-account = Systemet har ingen konto at tage med.
setup-replace-blocked-running = Luft starter fra systemet lige nu. Start Luft fra et USB-stik for at erstatte det.
setup-replace-blocked-read-only = Systemets disk er skrivebeskyttet.

## Connecting to the internet

setup-network-title = Opret forbindelse til internettet
setup-network-description = Det er valgfrit. Når du er online, kan Luft indstille dit ur og din tidszone, og du kan bruge internettet, mens Luft installeres.
setup-network-unavailable = Netværk er ikke tilgængelige lige nu. Du kan oprette forbindelse senere fra panelet.
setup-network-looking = Søger efter netværk…
setup-network-cable = Forbundet med kabel
setup-network-show-all = Vis alle netværk
setup-network-skip = Spring over
setup-network-failed = Kunne ikke oprette forbindelse
setup-network-wrong-password = Forkert adgangskode
setup-network-connected = Forbundet
setup-network-connecting = Opretter forbindelse…
setup-network-saved = Gemt
setup-network-password = Adgangskode
setup-network-join = Opret forbindelse

## Account

setup-account-title = Hvem bruger denne computer?
setup-account-description = Det er den konto, du logger ind med. Du kan tilføje flere personer senere i Indstillinger.
setup-account-full-name = Dit navn
setup-account-full-name-example = Karen Blixen
setup-account-user-name = Brugernavn
setup-account-password = Adgangskode
setup-account-repeat = Skriv den igen
setup-account-user-name-invalid = Brug små bogstaver, tal, - og _
setup-account-full-name-invalid = Undlad kommaer og koloner
setup-account-mismatch = Adgangskoderne er ikke ens

## Installing

setup-finishing-failed-title = Luft kunne ikke installeres
setup-finishing-failed-description = Noget gik galt under installationen.
setup-finishing-failed-stick = Din computer starter stadig på samme måde som før. Du kan fortsætte med at bruge Luft fra USB-stikket eller genstarte og prøve igen.
setup-finishing-failed-trying = Din computer starter stadig på samme måde som før. Du kan fortsætte med at bruge Luft, som det er nu, eller genstarte og prøve igen.
setup-finishing-use-stick = Brug Luft fra USB-stikket
setup-finishing-keep-trying = Bliv ved med at prøve Luft
setup-finishing-installed-title = Luft er installeret
setup-finishing-trust-stick = Tag USB-stikket ud, når skærmen bliver mørk. Derefter beder en blå skærm dig om at stole på Luft. Brug tastaturet der.
setup-finishing-trust = Lige efter genstarten beder en blå skærm dig om at stole på Luft. Brug tastaturet der.
setup-finishing-restart-stick = Genstart for at begynde at bruge det. Tag USB-stikket ud, når skærmen bliver mørk.
setup-finishing-restart = Genstart for at begynde at bruge det.
setup-finishing-title = Næsten færdig
setup-finishing-description = Luft bliver kopieret til din computer. Det tager et par minutter.
setup-finishing-plug-in = Hold din computer tilsluttet strøm, indtil det er færdigt.
setup-stage-idle = Gør klar
setup-stage-preparing = Gør plads til Luft
setup-stage-copying = Kopierer Luft
setup-stage-waiting = Afslutter
setup-stage-configuring = Konfigurerer din konto
setup-stage-finished = Færdig

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Tryk på en tast inden for 10 sekunder
setup-enroll-choose-enroll = Vælg Enroll MOK og derefter Continue
setup-enroll-choose-yes = Vælg Yes
setup-enroll-type-code = Skriv koden, og vælg derefter Reboot
setup-enroll-digits = { $count ->
    [one] { $count } ciffer
   *[other] { $count } cifre
}
setup-secure-boot-title = Din computer stoler endnu ikke på Luft
setup-secure-boot-code = Lige efter næste genstart beder en blå skærm dig om at stole på Luft. Brug tastaturet der med denne kode.
setup-secure-boot-skipped = Den blå skærm blev sprunget over. Hent en ny kode, og genstart, og brug så tastaturet der.
setup-secure-boot-getting = Henter din kode…
setup-secure-boot-new-code = Hent en ny kode

## Encryption

setup-protect-title = Beskyt dine filer
setup-protect-tpm = Krypter denne computer, så ingen kan læse dine filer uden at logge ind, heller ikke hvis den bliver væk. Den låser selv op, når den starter.
setup-protect-passphrase = Krypter denne computer, så ingen kan læse dine filer uden din adgangsfrase, heller ikke hvis den bliver væk.
setup-protect-staged-title = Dine filer bliver krypteret
setup-protect-staged-description = Krypteringen starter af sig selv efter genstarten til sidst i konfigurationen, og du kan bruge din computer imens.
setup-protect-keep-safe = Opbevar denne genoprettelsesnøgle et sikkert sted, væk fra denne computer. Du skal bruge den, hvis computeren en dag ikke kan låse op af sig selv.
setup-protect-passphrase-label = Adgangsfrase
setup-protect-repeat = Skriv den igen
setup-protect-mismatch = De er ikke ens
setup-protect-kept = Jeg har gemt min genoprettelsesnøgle
setup-protect-background = Krypteringen sker i baggrunden efter næste genstart, og du kan bruge din computer imens.
setup-protect-encrypt = Krypter
setup-protect-checking = Kontrollerer…
setup-protect-start = Krypter mine filer

## Fingerprint

setup-fingerprint-title = Log ind med din finger
setup-fingerprint-description = Lås Luft op med et tryk i stedet for at skrive din adgangskode. Du kan tilføje flere fingre senere i Indstillinger.
setup-fingerprint-which = Hvilken finger?
setup-fingerprint-another = Vil du tilføje en finger mere?
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = Fingeraftrykslæseren svarer ikke. Du kan tilføje et fingeraftryk senere i Indstillinger.
setup-fingerprint-add = Tilføj fingeraftryk
setup-fingerprint-choose-another = Vælg en anden finger

## Done

setup-ready-title = Så er du klar
setup-ready-trust = Genstart én gang mere for at gøre det færdigt. Lige efter genstarten beder en blå skærm dig om at stole på Luft. Brug tastaturet der med denne kode.
setup-ready-restart = Genstart én gang mere for at gøre det færdigt, og log derefter ind med din adgangskode.
setup-ready-done = Dit skrivebord er klar. God fornøjelse med Luft.
setup-ready-start = Begynd at bruge Luft
