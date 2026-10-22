## Buttons used across steps

setup-continue = Fortsett
setup-back = Tilbake
setup-cancel = Avbryt
setup-not-now = Ikke nå
setup-try-again = Prøv igjen
setup-restart = Start på nytt
setup-restart-now = Start på nytt nå
setup-restart-later = Start på nytt senere
setup-saving = Lagrer…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installerer Luft
setup-installing-progress = Installerer, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Søk
setup-picker-no-match = Ingen treff

## Welcome step: language, keyboard and time zone

setup-region-title = Velkommen til Luft
setup-region-language = Språk
setup-region-keyboard = Tastatur
setup-region-time-zone = Tidssone
setup-region-intro = La oss sette deg i gang. Velg språk, tastatur og tidssone.
setup-region-intro-guessed-computer = La oss sette deg i gang. Vi har gjettet disse ut fra datamaskinen, så endre det som ikke stemmer.
setup-region-intro-guessed = La oss sette deg i gang. Vi har gjettet { $guesses }, så endre det som ikke stemmer.
setup-region-guess-from-computer = { $fields } ut fra datamaskinen
setup-region-guess-from-network = { $fields } ut fra nettverket
setup-region-field-language = språket
setup-region-field-keyboard = tastaturet
setup-region-field-time-zone = tidssonen

## Where Luft goes

setup-destination-choose-title = Hvor skal Luft installeres?
setup-destination-choose-description = Velg hvordan Luft skal få plass på denne datamaskinen. Ingenting endres før du bekrefter.
setup-destination-alongside-title = Lag plass ved siden av Windows
setup-destination-alongside-description = Windows blir mindre for å gi plass til Luft. Filene dine i Windows forblir som de er.
setup-destination-whole-title = Velg en disk
setup-destination-whole-description = Luft tar over hele disken. Alt på den slettes.
setup-destination-custom-title = Velg plassen til Luft
setup-destination-custom-description = Bruk Disker til å ordne diskene slik du vil.
setup-destination-replace-title = Erstatt { $system }
setup-destination-replace-description = Luft tar plassen, og det som er ditt, beholdes.
setup-destination-meet-title = Ved siden av Windows
setup-destination-meet-description = Meet Luft har allerede laget plass, så Windows forblir akkurat som det er.
setup-destination-meet-drive-title = På { $drive }
setup-destination-meet-drive-description = Meet Luft har allerede laget plass på en annen disk, og Luft starter derfra med egne oppstartsfiler.
setup-destination-looking = Ser på diskene dine…

setup-destination-meet-choice = Ved siden av Windows
setup-destination-meet-choice-description = Bruk de { $size } som Meet Luft laget ved siden av Windows.
setup-destination-meet-drive-choice = På { $drive }
setup-destination-meet-drive-choice-description = Bruk de { $size } som Meet Luft laget på { $drive }.
setup-destination-alongside-choice = Ved siden av { $windows }
setup-destination-alongside-choice-description = Behold Windows og filene dine der, og gi Luft en del av disken.
setup-destination-replace-choice = Erstatt { $system }
setup-destination-replace-choice-description = Behold filene, kontoen og innstillingene dine, og la Luft ta plassen.
setup-destination-whole-choice = Bruk en hel disk
setup-destination-whole-choice-description = Slett en disk, og gi hele den til Luft.
setup-destination-try-choice = Bare prøv Luft
setup-destination-try-choice-description = Se deg rundt først. Ingenting installeres, og diskene dine forblir urørt.
setup-destination-custom-choice = Egendefinert
setup-destination-custom-choice-description = Ordne partisjonene selv i Disker.

setup-destination-more-options = Flere alternativer
setup-destination-starting = Starter…
setup-destination-replace = Erstatt
setup-destination-install = Installer Luft

## Confirming where Luft goes

setup-confirm-replace-title = Vil du erstatte { $system }?
setup-confirm-erase-title = Vil du slette { $drive }?
setup-confirm-shrink-title = Vil du krympe Windows til { $size }?
setup-confirm-meet-title = Vil du installere Luft ved siden av Windows?
setup-confirm-meet-drive-title = Vil du installere Luft på { $drive }?
setup-confirm-free-title = Vil du installere Luft på den ledige plassen?
setup-confirm-replace-keep-old = Luft begynner å kopiere med en gang. Det gamle systemet starter ikke lenger, og filene beholdes til du fjerner dem.
setup-confirm-replace-erase-old = Luft begynner å kopiere med en gang. Det gamle systemet slettes for godt, og filene dine blir der de er.
setup-confirm-erase-description = Alt på denne disken slettes for godt, også andre systemer og filer.
setup-confirm-install-description = Luft begynner å kopiere med en gang. Du kan konfigurere kontoen din mens det pågår.
setup-confirm-erase = Slett og installer
setup-confirm-install = Installer

## Making room next to Windows

setup-alongside-hint = Dra for å dele { $drive } mellom Windows og Luft. Windows beholder alle filene sine og litt plass til å vokse.
setup-windows-bitlocker = Windows holder denne disken låst med BitLocker, så Luft kan ikke lage plass på den. Slå av enhetskryptering i Windows, eller krymp disken i Diskbehandling og velg den ledige plassen under Egendefinert.
setup-windows-hibernated = Windows er i dvalemodus eller ble slått av med rask oppstart, så disken kan ikke endres trygt. Start Windows, hold nede Skift mens du velger Slå av, og start Luft igjen.
setup-windows-dirty = Windows-disken må sjekkes raskt først. Start Windows, start det på nytt én gang, og start Luft igjen.
setup-windows-full = Windows trenger nesten hele disken sin. Frigjør omtrent { $size } i Windows, og start Luft igjen.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Det du pakket i Windows, { $size }, pakkes ut i den nye kontoen din.

## Windows options

setup-windows-fast-startup = Slå av rask oppstart i Windows
setup-windows-fast-startup-description = Da slår Windows seg helt av, så lyd, wifi og Bluetooth starter på nytt i Luft, og disken forblir tilgjengelig.
setup-windows-clock = Hold klokken riktig i begge
setup-windows-clock-description = Windows leser datamaskinens klokke på samme måte som Luft, så tiden hopper ikke lenger når du bytter.
setup-windows-bluetooth = Ta med Bluetooth-enhetene dine
setup-windows-bluetooth-description = { $count ->
    [one] { $count } enhet som er sammenkoblet i Windows, virker i Luft uten ny sammenkobling.
   *[other] { $count } enheter som er sammenkoblet i Windows, virker i Luft uten ny sammenkobling.
}

## Choosing a drive

setup-drives-label = Disker
setup-drives-none = Det finnes ingen disk Luft kan bruke. Koble til en, og se etter igjen.
setup-drive-has-windows = Har { $windows }
setup-drive-empty = Tom
setup-drive-partitions = { $count ->
    [one] Har { $count } partisjon
   *[other] Har { $count } partisjoner
}

## Custom space

setup-custom-open-disks = Åpne Disker
setup-custom-looking = Ser etter…
setup-custom-look-again = Se etter igjen
setup-custom-free-label = Ledig plass
setup-custom-free-space = { $size } ledig plass
setup-custom-on-drive = På { $drive }
setup-custom-none = Lag minst { $size } ledig plass i Disker, og se etter igjen. Luft installeres på den ledige plassen du lar være igjen.

## Replacing a Linux system

setup-replace-stays = Dette beholdes
setup-replace-changes = Dette endres
setup-replace-keeps-account = Filene dine og kontoen din { $account }
setup-replace-keeps-account-password = Filene dine og kontoen din { $account } med passordet
setup-replace-keeps-accounts = { $count ->
    [one] Den andre kontoen på den, med filene sine
   *[other] De { $count } andre kontoene på den, med filene sine
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } nettverkstilkobling, med wifi-passordet
   *[other] { $count } nettverkstilkoblinger, med wifi-passordene
}
setup-replace-keeps-drives = { $drives }, som kobles til ved oppstart som før
setup-replace-keeps-hostname = Datamaskinens navn, { $hostname }, og SSH-nøklene
setup-replace-keeps-tools = { $count ->
    [one] { $count } kommandolinjeverktøy du installerte, i en Toolbox etter at du logger inn
   *[other] { $count } kommandolinjeverktøy du installerte, i en Toolbox etter at du logger inn
}
setup-replace-keeps-old = { $system } starter ikke lenger. Systemfilene beholdes som old-system til du fjerner dem i Disker eller Innstillinger.
setup-replace-erases-system = Systempartisjonen til { $system } slettes. Filene dine ligger på en egen partisjon og forblir som de er.
setup-replace-clears-boot = /boot-partisjonen tømmes for å gi plass til oppstartsfilene til Luft.
setup-replace-apps = Apper som er installert der, blir ikke med. Hent dem igjen fra Schelf.

setup-replace-blocked-encrypted = Det er kryptert, så å erstatte det og beholde filene støttes ikke ennå.
setup-replace-blocked-single = Filene dine ligger på samme partisjon som systemet, så å erstatte det og beholde dem støttes ikke ennå.
setup-replace-blocked-layout = Disken er satt opp på en måte Luft ikke kan erstatte ennå.
setup-replace-blocked-startup = EFI-systempartisjonen er for liten for Luft, og det finnes ingen /boot-partisjon å bruke i stedet.
setup-replace-blocked-no-account = Det har ingen konto å ta med.
setup-replace-blocked-running = Luft starter fra det akkurat nå. Start Luft fra en minnepinne for å erstatte det.
setup-replace-blocked-read-only = Disken er skrivebeskyttet.

## Connecting to the internet

setup-network-title = Koble til internett
setup-network-description = Dette er valgfritt. Når du er på nett, kan Luft stille klokken og tidssonen, og du kan bruke internett mens Luft installeres.
setup-network-unavailable = Nettverk er ikke tilgjengelig akkurat nå. Du kan koble til senere fra panelet.
setup-network-looking = Ser etter nettverk…
setup-network-cable = Tilkoblet med kabel
setup-network-show-all = Vis alle nettverk
setup-network-skip = Hopp over
setup-network-failed = Kunne ikke koble til
setup-network-wrong-password = Feil passord
setup-network-connected = Tilkoblet
setup-network-connecting = Kobler til…
setup-network-saved = Lagret
setup-network-password = Passord
setup-network-join = Koble til

## Account

setup-account-title = Hvem bruker denne datamaskinen?
setup-account-description = Dette er kontoen du logger inn med. Du kan legge til flere personer senere i Innstillinger.
setup-account-full-name = Navnet ditt
setup-account-full-name-example = Kari Nordmann
setup-account-user-name = Brukernavn
setup-account-password = Passord
setup-account-repeat = Skriv det inn igjen
setup-account-user-name-invalid = Bruk små bokstaver, tall, - og _
setup-account-full-name-invalid = Ikke bruk komma eller kolon
setup-account-mismatch = Passordene er ikke like

## Installing

setup-finishing-failed-title = Luft kunne ikke installeres
setup-finishing-failed-description = Noe gikk galt under installeringen.
setup-finishing-failed-stick = Datamaskinen starter fortsatt som før. Du kan fortsette å bruke Luft fra minnepinnen, eller starte på nytt og prøve igjen.
setup-finishing-failed-trying = Datamaskinen starter fortsatt som før. Du kan fortsette å bruke Luft slik det er nå, eller starte på nytt og prøve igjen.
setup-finishing-use-stick = Bruk Luft fra minnepinnen
setup-finishing-keep-trying = Fortsett å prøve Luft
setup-finishing-installed-title = Luft er installert
setup-finishing-trust-stick = Ta ut minnepinnen når skjermen blir svart. Deretter ber en blå skjerm deg om å stole på Luft. Bruk tastaturet der.
setup-finishing-trust = Rett etter omstarten ber en blå skjerm deg om å stole på Luft. Bruk tastaturet der.
setup-finishing-restart-stick = Start på nytt for å ta det i bruk. Ta ut minnepinnen når skjermen blir svart.
setup-finishing-restart = Start på nytt for å ta det i bruk.
setup-finishing-title = Nesten ferdig
setup-finishing-description = Luft kopieres til datamaskinen. Dette tar noen minutter.
setup-finishing-plug-in = La datamaskinen være koblet til strøm til det er ferdig.
setup-stage-idle = Gjør klar
setup-stage-preparing = Lager plass til Luft
setup-stage-copying = Kopierer Luft
setup-stage-waiting = Gjør ferdig
setup-stage-configuring = Konfigurerer kontoen din
setup-stage-finished = Ferdig

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Trykk på en tast innen 10 sekunder
setup-enroll-choose-enroll = Velg Enroll MOK og deretter Continue
setup-enroll-choose-yes = Velg Yes
setup-enroll-type-code = Skriv inn koden, og velg Reboot
setup-enroll-digits = { $count ->
    [one] { $count } siffer
   *[other] { $count } sifre
}
setup-secure-boot-title = Datamaskinen stoler ikke på Luft ennå
setup-secure-boot-code = Rett etter neste omstart ber en blå skjerm deg om å stole på Luft. Bruk tastaturet der med denne koden.
setup-secure-boot-skipped = Den blå skjermen ble hoppet over. Hent en ny kode og start på nytt, og bruk tastaturet der.
setup-secure-boot-getting = Henter koden din…
setup-secure-boot-new-code = Hent en ny kode

## Encryption

setup-protect-title = Beskytt filene dine
setup-protect-tpm = Krypter denne datamaskinen, så ingen kan lese filene dine uten å logge inn, selv om den blir borte. Den låses opp av seg selv når den starter.
setup-protect-passphrase = Krypter denne datamaskinen, så ingen kan lese filene dine uten passfrasen din, selv om den blir borte.
setup-protect-keep-safe = Oppbevar denne gjenopprettingsnøkkelen et trygt sted, borte fra datamaskinen. Du trenger den hvis datamaskinen en gang ikke kan låse seg opp selv.
setup-protect-passphrase-label = Passfrase
setup-protect-repeat = Skriv den inn igjen
setup-protect-mismatch = De er ikke like
setup-protect-kept = Jeg har tatt vare på gjenopprettingsnøkkelen
setup-protect-only-now = Du kan bare slå på kryptering nå, mens Luft installeres.
setup-protect-skip = Ikke krypter
setup-protect-encrypt = Krypter

## Fingerprint

setup-fingerprint-title = Logg inn med fingeren
setup-fingerprint-description = Lås opp Luft med et trykk i stedet for å skrive passordet. Du kan legge til flere fingre senere i Innstillinger.
setup-fingerprint-which = Hvilken finger?
setup-fingerprint-another = Vil du legge til en finger til?
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = Fingeravtrykkleseren svarer ikke. Du kan legge til et fingeravtrykk senere i Innstillinger.
setup-fingerprint-add = Legg til fingeravtrykk
setup-fingerprint-choose-another = Velg en annen finger

## Done

setup-ready-title = Alt er klart
setup-ready-trust = Start på nytt én gang til for å fullføre. Rett etter omstarten ber en blå skjerm deg om å stole på Luft. Bruk tastaturet der med denne koden.
setup-ready-done = Skrivebordet ditt er klart. Kos deg med Luft.
setup-ready-start = Begynn å bruke Luft
