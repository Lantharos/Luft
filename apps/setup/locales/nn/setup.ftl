## Buttons used across steps

setup-continue = Hald fram
setup-back = Tilbake
setup-cancel = Avbryt
setup-not-now = Ikkje no
setup-try-again = Prøv igjen
setup-restart = Start på nytt
setup-restart-now = Start på nytt no
setup-restart-later = Start på nytt seinare
setup-saving = Lagrar …

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installerer Luft
setup-installing-progress = Installerer, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Søk
setup-picker-no-match = Fann ingenting som passar

## Welcome step: language, keyboard and time zone

setup-region-title = Velkomen til Luft
setup-region-language = Språk
setup-region-keyboard = Tastatur
setup-region-time-zone = Tidssone
setup-region-intro = La oss setje opp alt. Vel språk, tastatur og tidssone.
setup-region-intro-guessed-computer = La oss setje opp alt. Vi har gjetta dette ut frå datamaskinen, så endre det som ikkje stemmer.
setup-region-intro-guessed = La oss setje opp alt. Vi har gjetta { $guesses }, så endre det som ikkje stemmer.
setup-region-guess-from-computer = { $fields } ut frå datamaskinen
setup-region-guess-from-network = { $fields } ut frå nettverket
setup-region-field-language = språket
setup-region-field-keyboard = tastaturet
setup-region-field-time-zone = tidssona

## Where Luft goes

setup-destination-choose-title = Kvar skal Luft vere?
setup-destination-choose-description = Vel korleis Luft skal få plass på denne datamaskinen. Ingenting blir endra før du stadfestar.
setup-destination-alongside-title = Lag plass ved sida av Windows
setup-destination-alongside-description = Windows blir mindre, så det blir plass til Luft. Filene dine i Windows blir verande som dei er.
setup-destination-whole-title = Vel ein disk
setup-destination-whole-description = Luft tek heile disken. Alt som ligg på han, blir sletta.
setup-destination-custom-title = Vel plassen til Luft
setup-destination-custom-description = Bruk Diskar for å ordne diskane slik du vil.
setup-destination-replace-title = Erstatt { $system }
setup-destination-replace-description = Luft tek plassen og held på det som er ditt.
setup-destination-meet-title = Ved sida av Windows
setup-destination-meet-description = Meet Luft har alt laga denne plassen, så Windows blir verande akkurat som det er.
setup-destination-meet-drive-title = På { $drive }
setup-destination-meet-drive-description = Meet Luft har alt laga denne plassen på ein annan disk, og Luft startar derifrå med eigne oppstartsfiler.
setup-destination-looking = Ser på diskane dine …

setup-destination-meet-choice = Ved sida av Windows
setup-destination-meet-choice-description = Bruk dei { $size } som Meet Luft laga ved sida av Windows.
setup-destination-meet-drive-choice = På { $drive }
setup-destination-meet-drive-choice-description = Bruk dei { $size } som Meet Luft laga på { $drive }.
setup-destination-alongside-choice = Ved sida av { $windows }
setup-destination-alongside-choice-description = Behald Windows og filene der, og gje Luft ein del av disken.
setup-destination-replace-choice = Erstatt { $system }
setup-destination-replace-choice-description = Behald filene, kontoen og innstillingane dine, og la Luft ta plassen.
setup-destination-whole-choice = Bruk ein heil disk
setup-destination-whole-choice-description = Slett ein disk og gje heile disken til Luft.
setup-destination-try-choice = Berre prøv Luft
setup-destination-try-choice-description = Sjå deg om først. Ingenting blir installert, og diskane dine blir ikkje rørte.
setup-destination-custom-choice = Tilpassa
setup-destination-custom-choice-description = Ordne partisjonane sjølv i Diskar.

setup-destination-more-options = Fleire val
setup-destination-starting = Startar …
setup-destination-replace = Erstatt
setup-destination-install = Installer Luft

## Confirming where Luft goes

setup-confirm-replace-title = Vil du erstatte { $system }?
setup-confirm-erase-title = Vil du slette { $drive }?
setup-confirm-shrink-title = Vil du krympe Windows til { $size }?
setup-confirm-meet-title = Vil du installere Luft ved sida av Windows?
setup-confirm-meet-drive-title = Vil du installere Luft på { $drive }?
setup-confirm-free-title = Vil du installere Luft på den ledige plassen?
setup-confirm-replace-keep-old = Luft byrjar å kopiere med ein gong. Det gamle systemet startar ikkje lenger, og filene til systemet blir liggjande til du fjernar dei.
setup-confirm-replace-erase-old = Luft byrjar å kopiere med ein gong. Det gamle systemet blir sletta for godt, og filene dine blir liggjande der dei er.
setup-confirm-erase-description = Alt på denne disken blir sletta for godt, òg andre system og filer.
setup-confirm-install-description = Luft byrjar å kopiere med ein gong. Du kan setje opp kontoen din medan det held på.
setup-confirm-erase = Slett og installer
setup-confirm-install = Installer

## Making room next to Windows

setup-alongside-hint = Dra for å dele { $drive } mellom Windows og Luft. Windows held på alle filene sine og litt plass til å vekse.
setup-windows-bitlocker = Windows held denne disken låst med BitLocker, så Luft kan ikkje lage plass på han. Slå av einingskryptering i Windows, eller krymp disken i Diskbehandling og vel den ledige plassen under Tilpassa.
setup-windows-hibernated = Windows er i kvilemodus eller vart slått av med Rask oppstart, så disken kan ikkje endrast trygt. Start Windows, hald inne Skift medan du vel Avslutt, og start så Luft igjen.
setup-windows-dirty = Disken til Windows må sjekkast raskt først. Start Windows, start det på nytt éin gong, og start så Luft igjen.
setup-windows-full = Windows treng nesten heile disken sin. Frigjer om lag { $size } i Windows, og start så Luft igjen.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Det du pakka i Windows, { $size }, blir pakka ut i den nye kontoen din.

## Windows options

setup-windows-fast-startup = Slå av Rask oppstart i Windows
setup-windows-fast-startup-description = Windows blir då slått heilt av, så lyd, Wi-Fi og Bluetooth startar på nytt i Luft, og disken til Windows blir verande open.
setup-windows-clock = Hald klokka rett i begge
setup-windows-clock-description = Windows les klokka i datamaskinen på same måte som Luft, så tida hoppar ikkje lenger når du byter.
setup-windows-bluetooth = Ta med Bluetooth-einingane dine
setup-windows-bluetooth-description = { $count ->
    [one] { $count } eining som er para i Windows, verkar i Luft utan å bli para på nytt.
   *[other] { $count } einingar som er para i Windows, verkar i Luft utan å bli para på nytt.
}

## Choosing a drive

setup-drives-label = Diskar
setup-drives-none = Det finst ingen disk som Luft kan bruke. Kople til ein og sjå etter igjen.
setup-drive-has-windows = Har { $windows }
setup-drive-empty = Tom
setup-drive-partitions = { $count ->
    [one] Har { $count } partisjon
   *[other] Har { $count } partisjonar
}

## Custom space

setup-custom-open-disks = Opne Diskar
setup-custom-looking = Ser etter …
setup-custom-look-again = Sjå etter igjen
setup-custom-free-label = Ledig plass
setup-custom-free-space = { $size } ledig plass
setup-custom-on-drive = På { $drive }
setup-custom-none = Lag minst { $size } ledig plass i Diskar, og sjå etter igjen. Luft blir lagt på plassen du lèt stå ledig.

## Replacing a Linux system

setup-replace-stays = Dette blir verande
setup-replace-changes = Dette blir endra
setup-replace-keeps-account = Filene dine og kontoen din { $account }
setup-replace-keeps-account-password = Filene dine og kontoen din { $account } med passordet
setup-replace-keeps-accounts = { $count ->
    [one] Den andre kontoen på systemet, med filene sine
   *[other] Dei { $count } andre kontoane på systemet, med filene sine
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } nettverkstilkopling, med Wi-Fi-passordet
   *[other] { $count } nettverkstilkoplingar, med Wi-Fi-passorda
}
setup-replace-keeps-drives = { $drives }, monterte ved oppstart som før
setup-replace-keeps-hostname = Namnet på datamaskinen, { $hostname }, og SSH-nøklane
setup-replace-keeps-tools = { $count ->
    [one] { $count } kommandolinjeverktøy du installerte, i ein Toolbox etter at du har logga inn
   *[other] { $count } kommandolinjeverktøy du installerte, i ein Toolbox etter at du har logga inn
}
setup-replace-keeps-old = { $system } blir ikkje starta lenger. Systemfilene blir tekne vare på som old-system til du fjernar dei i Diskar eller Innstillingar.
setup-replace-erases-system = Systempartisjonen til { $system } blir sletta. Filene dine ligg på ein eigen partisjon og blir verande som dei er.
setup-replace-clears-boot = /boot-partisjonen blir tømd, så han kan halde oppstartsfilene til Luft.
setup-replace-apps = Appar som er installerte der, blir ikkje med. Hent dei på nytt frå Schelf.

setup-replace-blocked-encrypted = Systemet er kryptert, så det er enno ikkje mogleg å erstatte det og samtidig behalde filene dine.
setup-replace-blocked-single = Filene dine deler partisjon med systemet, så det er enno ikkje mogleg å erstatte det og samtidig behalde filene.
setup-replace-blocked-layout = Disken er sett opp på ein måte som Luft ikkje kan erstatte enno.
setup-replace-blocked-startup = EFI-systempartisjonen er for liten for Luft, og det finst ingen /boot-partisjon å bruke i staden.
setup-replace-blocked-no-account = Systemet har ingen konto å ta med over.
setup-replace-blocked-running = Luft startar frå dette systemet no. Start Luft frå ein minnepinne for å erstatte det.
setup-replace-blocked-read-only = Disken er skriveverna.

## Connecting to the internet

setup-network-title = Kople til internett
setup-network-description = Dette er valfritt. Når du er på nett, kan Luft stille klokka og tidssona, og du kan bruke internett medan Luft blir installert.
setup-network-unavailable = Nettverk er ikkje tilgjengelege no. Du kan kople til seinare frå oppgåvelinja.
setup-network-looking = Ser etter nettverk …
setup-network-cable = Kopla til med kabel
setup-network-show-all = Vis alle nettverk
setup-network-skip = Hopp over
setup-network-failed = Kunne ikkje kople til
setup-network-wrong-password = Feil passord
setup-network-connected = Tilkopla
setup-network-connecting = Koplar til …
setup-network-saved = Lagra
setup-network-password = Passord
setup-network-join = Kople til

## Account

setup-account-title = Kven brukar denne datamaskinen?
setup-account-description = Dette er kontoen du loggar inn med. Du kan leggje til fleire personar seinare i Innstillingar.
setup-account-full-name = Namnet ditt
setup-account-full-name-example = Kari Nordmann
setup-account-user-name = Brukarnamn
setup-account-password = Passord
setup-account-repeat = Skriv det ein gong til
setup-account-user-name-invalid = Bruk små bokstavar, tal, - og _
setup-account-full-name-invalid = Ikkje bruk komma eller kolon
setup-account-mismatch = Passorda er ikkje like

## Installing

setup-finishing-failed-title = Luft kunne ikkje installerast
setup-finishing-failed-description = Noko gjekk gale under installeringa.
setup-finishing-failed-stick = Datamaskinen startar framleis på same måte som før. Du kan halde fram med å bruke Luft frå minnepinnen, eller starte på nytt og prøve igjen.
setup-finishing-failed-trying = Datamaskinen startar framleis på same måte som før. Du kan halde fram med å bruke Luft slik det er no, eller starte på nytt og prøve igjen.
setup-finishing-use-stick = Bruk Luft frå minnepinnen
setup-finishing-keep-trying = Hald fram med å prøve Luft
setup-finishing-installed-title = Luft er installert
setup-finishing-trust-stick = Ta ut minnepinnen når skjermen blir mørk. Ein blå skjerm spør deretter om du stolar på Luft. Bruk tastaturet der.
setup-finishing-trust = Rett etter omstarten spør ein blå skjerm om du stolar på Luft. Bruk tastaturet der.
setup-finishing-restart-stick = Start på nytt for å ta Luft i bruk. Ta ut minnepinnen når skjermen blir mørk.
setup-finishing-restart = Start på nytt for å ta Luft i bruk.
setup-finishing-title = Snart ferdig
setup-finishing-description = Luft blir kopiert til datamaskinen. Det tek nokre minutt.
setup-finishing-plug-in = Hald datamaskinen kopla til straum til det er ferdig.
setup-stage-idle = Gjer seg klar
setup-stage-preparing = Lagar plass til Luft
setup-stage-copying = Kopierer Luft
setup-stage-waiting = Fullfører
setup-stage-configuring = Kontoen din blir sett opp
setup-stage-finished = Ferdig

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Trykk på ein tast innan 10 sekund
setup-enroll-choose-enroll = Vel Enroll MOK, og deretter Continue
setup-enroll-choose-yes = Vel Yes
setup-enroll-type-code = Skriv inn koden, og vel så Reboot
setup-enroll-digits = { $count ->
    [one] { $count } siffer
   *[other] { $count } siffer
}
setup-secure-boot-title = Datamaskinen stolar ikkje på Luft enno
setup-secure-boot-code = Rett etter neste omstart spør ein blå skjerm om du stolar på Luft. Bruk tastaturet der og denne koden.
setup-secure-boot-skipped = Den blå skjermen vart hoppa over. Hent ein ny kode og start på nytt, og bruk så tastaturet der.
setup-secure-boot-getting = Hentar koden din …
setup-secure-boot-new-code = Hent ein ny kode

## Encryption

setup-protect-title = Vern filene dine
setup-protect-tpm = Krypter denne datamaskinen, så ingen kan lese filene dine utan å logge inn, sjølv om han blir borte. Han låser seg opp sjølv når han startar.
setup-protect-passphrase = Krypter denne datamaskinen, så ingen kan lese filene dine utan passfrasen din, sjølv om han blir borte.
setup-protect-keep-safe = Ta vare på denne gjenopprettingsnøkkelen ein trygg stad, borte frå denne datamaskinen. Du treng han viss datamaskinen ein gong ikkje kan låse seg opp sjølv.
setup-protect-passphrase-label = Passfrase
setup-protect-repeat = Skriv han ein gong til
setup-protect-mismatch = Dei er ikkje like
setup-protect-kept = Eg har teke vare på gjenopprettingsnøkkelen
setup-protect-encrypt = Krypter

## Fingerprint

setup-fingerprint-title = Logg inn med fingeren
setup-fingerprint-description = Lås opp Luft med eit trykk i staden for å skrive passordet. Du kan leggje til fleire fingrar seinare i Innstillingar.
setup-fingerprint-which = Kva finger?
setup-fingerprint-another = Vil du leggje til ein finger til?
setup-fingerprint-finger = Finger
setup-fingerprint-no-reader = Fingeravtrykklesaren svarer ikkje. Du kan leggje til eit fingeravtrykk seinare i Innstillingar.
setup-fingerprint-add = Legg til fingeravtrykk
setup-fingerprint-choose-another = Vel ein annan finger

## Done

setup-ready-title = Alt er klart
setup-ready-trust = Start på nytt ein gong til for å gjere deg ferdig. Rett etter omstarten spør ein blå skjerm om du stolar på Luft. Bruk tastaturet der og denne koden.
setup-ready-done = Skrivebordet ditt er klart. Kos deg med Luft.
setup-ready-start = Ta i bruk Luft
