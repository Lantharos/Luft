## Buttons used across steps

setup-continue = Doorgaan
setup-back = Terug
setup-cancel = Annuleren
setup-not-now = Niet nu
setup-try-again = Opnieuw proberen
setup-restart = Opnieuw opstarten
setup-restart-now = Nu opnieuw opstarten
setup-restart-later = Later opnieuw opstarten
setup-saving = Opslaan…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Luft wordt geïnstalleerd
setup-installing-progress = Installeren, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Zoeken
setup-picker-no-match = Niets gevonden

## Welcome step: language, keyboard and time zone

setup-region-title = Welkom bij Luft
setup-region-language = Taal
setup-region-keyboard = Toetsenbord
setup-region-time-zone = Tijdzone
setup-region-intro = Laten we beginnen. Kies je taal, toetsenbord en tijdzone.
setup-region-intro-guessed-computer = Laten we beginnen. We hebben dit afgeleid van je computer, dus pas aan wat niet klopt.
setup-region-intro-guessed = Laten we beginnen. We hebben { $guesses } afgeleid, dus pas aan wat niet klopt.
setup-region-guess-from-computer = je { $fields } van je computer
setup-region-guess-from-network = je { $fields } van je netwerk
setup-region-field-language = taal
setup-region-field-keyboard = toetsenbord
setup-region-field-time-zone = tijdzone

## Where Luft goes

setup-destination-choose-title = Waar moet Luft komen?
setup-destination-choose-description = Kies hoe Luft op deze computer past. Er verandert niets tot je het bevestigt.
setup-destination-alongside-title = Ruimte maken naast Windows
setup-destination-alongside-description = Windows wordt kleiner om ruimte te maken voor Luft. Je bestanden in Windows blijven zoals ze zijn.
setup-destination-whole-title = Kies een schijf
setup-destination-whole-description = Luft gebruikt de hele schijf. Alles wat erop staat, wordt gewist.
setup-destination-custom-title = Kies de ruimte voor Luft
setup-destination-custom-description = Gebruik Schijven om je schijven zelf in te delen.
setup-destination-replace-title = { $system } vervangen
setup-destination-replace-description = Luft neemt de plaats in en houdt wat van jou is.
setup-destination-meet-title = Naast Windows
setup-destination-meet-description = Meet Luft heeft deze ruimte al gemaakt, dus Windows blijft precies zoals het is.
setup-destination-meet-drive-title = Op { $drive }
setup-destination-meet-drive-description = Meet Luft heeft deze ruimte al op een andere schijf gemaakt, en Luft start van daaruit met eigen opstartbestanden.
setup-destination-looking = Je schijven worden bekeken…

setup-destination-meet-choice = Naast Windows
setup-destination-meet-choice-description = De { $size } gebruiken die Meet Luft naast Windows heeft gemaakt.
setup-destination-meet-drive-choice = Op { $drive }
setup-destination-meet-drive-choice-description = De { $size } gebruiken die Meet Luft op { $drive } heeft gemaakt.
setup-destination-alongside-choice = Naast { $windows }
setup-destination-alongside-choice-description = Windows en de bestanden houden, en Luft een deel van de schijf geven.
setup-destination-replace-choice = { $system } vervangen
setup-destination-replace-choice-description = Je bestanden, je account en je instellingen houden, en Luft de plaats laten innemen.
setup-destination-whole-choice = Een hele schijf gebruiken
setup-destination-whole-choice-description = Een schijf wissen en helemaal aan Luft geven.
setup-destination-try-choice = Luft alleen uitproberen
setup-destination-try-choice-description = Eerst rondkijken. Er wordt niets geïnstalleerd en je schijven blijven onaangeroerd.
setup-destination-custom-choice = Aangepast
setup-destination-custom-choice-description = Zelf partities indelen in Schijven.

setup-destination-more-options = Meer opties
setup-destination-starting = Starten…
setup-destination-replace = Vervangen
setup-destination-install = Luft installeren

## Confirming where Luft goes

setup-confirm-replace-title = { $system } vervangen?
setup-confirm-erase-title = { $drive } wissen?
setup-confirm-shrink-title = Windows verkleinen tot { $size }?
setup-confirm-meet-title = Luft naast Windows installeren?
setup-confirm-meet-drive-title = Luft op { $drive } installeren?
setup-confirm-free-title = Luft in de vrije ruimte installeren?
setup-confirm-replace-keep-old = Luft begint meteen met kopiëren. Het oude systeem start daarna niet meer, en de bestanden ervan blijven tot je ze verwijdert.
setup-confirm-replace-erase-old = Luft begint meteen met kopiëren. Het oude systeem wordt definitief gewist, en je bestanden blijven waar ze zijn.
setup-confirm-erase-description = Alles op deze schijf wordt definitief gewist, ook andere systemen en bestanden.
setup-confirm-install-description = Luft begint meteen met kopiëren. Ondertussen kun je je account instellen.
setup-confirm-erase = Wissen en installeren
setup-confirm-install = Installeren

## Making room next to Windows

setup-alongside-hint = Sleep om { $drive } te verdelen tussen Windows en Luft. Windows houdt al zijn bestanden en wat ruimte om te groeien.
setup-windows-bitlocker = Windows houdt deze schijf vergrendeld met BitLocker, dus Luft kan er geen ruimte op maken. Schakel in Windows apparaatversleuteling uit, of verklein de schijf in Schijfbeheer en kies de vrije ruimte onder Aangepast.
setup-windows-hibernated = Windows staat in de slaapstand of is afgesloten met Snel opstarten, dus de schijf kan niet veilig worden gewijzigd. Start Windows, houd Shift ingedrukt terwijl je Afsluiten kiest en start Luft daarna opnieuw.
setup-windows-dirty = De schijf van Windows moet eerst even worden gecontroleerd. Start Windows, start het één keer opnieuw op en start Luft daarna opnieuw.
setup-windows-full = Windows heeft bijna de hele schijf nodig. Maak in Windows ongeveer { $size } vrij en start Luft daarna opnieuw.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Wat je in Windows hebt ingepakt ({ $size }) wordt uitgepakt in je nieuwe account.

## Windows options

setup-windows-fast-startup = Snel opstarten uitschakelen in Windows
setup-windows-fast-startup-description = Windows sluit dan helemaal af, zodat geluid, wifi en Bluetooth in Luft fris starten en de schijf toegankelijk blijft.
setup-windows-clock = De klok in beide goed houden
setup-windows-clock-description = Windows leest de klok van de computer zoals Luft dat doet, zodat de tijd niet meer verspringt als je wisselt.
setup-windows-bluetooth = Je Bluetooth-apparaten meenemen
setup-windows-bluetooth-description = { $count ->
    [one] { $count } apparaat dat in Windows is gekoppeld, werkt in Luft zonder opnieuw te koppelen.
   *[other] { $count } apparaten die in Windows zijn gekoppeld, werken in Luft zonder opnieuw te koppelen.
}

## Choosing a drive

setup-drives-label = Schijven
setup-drives-none = Er is geen schijf die Luft kan gebruiken. Sluit er een aan en kijk opnieuw.
setup-drive-has-windows = Bevat { $windows }
setup-drive-empty = Leeg
setup-drive-partitions = { $count ->
    [one] Bevat { $count } partitie
   *[other] Bevat { $count } partities
}

## Custom space

setup-custom-open-disks = Schijven openen
setup-custom-looking = Zoeken…
setup-custom-look-again = Opnieuw kijken
setup-custom-free-label = Vrije ruimte
setup-custom-free-space = { $size } vrije ruimte
setup-custom-on-drive = Op { $drive }
setup-custom-none = Maak in Schijven minstens { $size } vrije ruimte en kijk dan opnieuw. Luft komt in de ruimte die je vrijlaat.

## Replacing a Linux system

setup-replace-stays = Wat blijft
setup-replace-changes = Wat verandert
setup-replace-keeps-account = Je bestanden en je account { $account }
setup-replace-keeps-account-password = Je bestanden en je account { $account } met het wachtwoord
setup-replace-keeps-accounts = { $count ->
    [one] Het andere account erop, met de bestanden
   *[other] De { $count } andere accounts erop, met hun bestanden
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } netwerkverbinding, met het wifiwachtwoord
   *[other] { $count } netwerkverbindingen, met de wifiwachtwoorden
}
setup-replace-keeps-drives = { $drives }, net als eerst gekoppeld bij het opstarten
setup-replace-keeps-hostname = De naam van de computer, { $hostname }, en de SSH-sleutels
setup-replace-keeps-tools = { $count ->
    [one] { $count } opdrachtregelprogramma dat je hebt geïnstalleerd, in een Toolbox nadat je je aanmeldt
   *[other] { $count } opdrachtregelprogramma’s die je hebt geïnstalleerd, in een Toolbox nadat je je aanmeldt
}
setup-replace-keeps-old = { $system } start niet meer. De systeembestanden blijven bewaard als old-system tot je ze verwijdert in Schijven of Instellingen.
setup-replace-erases-system = De systeempartitie van { $system } wordt gewist. Je bestanden staan op een eigen partitie en blijven zoals ze zijn.
setup-replace-clears-boot = De /boot-partitie wordt leeggemaakt voor de opstartbestanden van Luft.
setup-replace-apps = Apps die erin zijn geïnstalleerd, gaan niet mee. Haal ze opnieuw op in Schelf.

setup-replace-blocked-encrypted = Het is versleuteld, dus vervangen met behoud van je bestanden wordt nog niet ondersteund.
setup-replace-blocked-single = Je bestanden delen één partitie met het systeem, dus vervangen met behoud van je bestanden wordt nog niet ondersteund.
setup-replace-blocked-layout = De schijf is zo ingedeeld dat Luft het systeem nog niet kan vervangen.
setup-replace-blocked-startup = De EFI-systeempartitie is te klein voor Luft en er is geen /boot-partitie om in plaats daarvan te gebruiken.
setup-replace-blocked-no-account = Er is geen account om mee te nemen.
setup-replace-blocked-running = Luft start op dit moment vanaf dit systeem. Start Luft vanaf een usb-stick om het te vervangen.
setup-replace-blocked-read-only = De schijf is alleen-lezen.

## Connecting to the internet

setup-network-title = Verbinding maken met internet
setup-network-description = Dit is optioneel. Als je online bent, kan Luft je klok en tijdzone instellen, en kun je internet gebruiken terwijl Luft wordt geïnstalleerd.
setup-network-unavailable = Netwerken zijn nu niet beschikbaar. Je kunt later verbinding maken via de taakbalk.
setup-network-looking = Netwerken zoeken…
setup-network-cable = Verbonden met een kabel
setup-network-show-all = Alle netwerken tonen
setup-network-skip = Overslaan
setup-network-failed = Kan geen verbinding maken
setup-network-wrong-password = Onjuist wachtwoord
setup-network-connected = Verbonden
setup-network-connecting = Verbinden…
setup-network-saved = Opgeslagen
setup-network-password = Wachtwoord
setup-network-join = Verbinden

## Account

setup-account-title = Wie gebruikt deze computer?
setup-account-description = Met dit account meld je je aan. Je kunt later meer mensen toevoegen in Instellingen.
setup-account-full-name = Je naam
setup-account-full-name-example = Rembrandt van Rijn
setup-account-user-name = Gebruikersnaam
setup-account-password = Wachtwoord
setup-account-repeat = Typ het opnieuw
setup-account-user-name-invalid = Gebruik kleine letters, cijfers, - en _
setup-account-full-name-invalid = Laat komma’s en dubbele punten weg
setup-account-mismatch = De wachtwoorden komen niet overeen

## Installing

setup-finishing-failed-title = Luft kon niet worden geïnstalleerd
setup-finishing-failed-description = Er ging iets mis tijdens het installeren.
setup-finishing-failed-stick = Je computer start nog net als eerst. Je kunt Luft vanaf de usb-stick blijven gebruiken, of opnieuw opstarten en het nog eens proberen.
setup-finishing-failed-trying = Je computer start nog net als eerst. Je kunt Luft blijven gebruiken zoals het nu is, of opnieuw opstarten en het nog eens proberen.
setup-finishing-use-stick = Luft vanaf de stick gebruiken
setup-finishing-keep-trying = Luft blijven uitproberen
setup-finishing-installed-title = Luft is geïnstalleerd
setup-finishing-trust-stick = Haal de usb-stick eruit zodra het scherm zwart wordt. Daarna vraagt een blauw scherm of je Luft vertrouwt. Gebruik daar het toetsenbord.
setup-finishing-trust = Direct na het opnieuw opstarten vraagt een blauw scherm of je Luft vertrouwt. Gebruik daar het toetsenbord.
setup-finishing-restart-stick = Start opnieuw op om het te gaan gebruiken. Haal de usb-stick eruit zodra het scherm zwart wordt.
setup-finishing-restart = Start opnieuw op om het te gaan gebruiken.
setup-finishing-title = Bijna klaar
setup-finishing-description = Luft wordt naar je computer gekopieerd. Dit duurt een paar minuten.
setup-finishing-plug-in = Houd je computer aangesloten op de lader tot het klaar is.
setup-stage-idle = Voorbereiden
setup-stage-preparing = Ruimte maken voor Luft
setup-stage-copying = Luft kopiëren
setup-stage-waiting = Afronden
setup-stage-configuring = Je account instellen
setup-stage-finished = Klaar

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Druk binnen 10 seconden op een toets
setup-enroll-choose-enroll = Kies Enroll MOK en daarna Continue
setup-enroll-choose-yes = Kies Yes
setup-enroll-type-code = Typ de code en kies daarna Reboot
setup-enroll-digits = { $count ->
    [one] { $count } cijfer
   *[other] { $count } cijfers
}
setup-secure-boot-title = Je computer vertrouwt Luft nog niet
setup-secure-boot-code = Direct na de volgende herstart vraagt een blauw scherm of je Luft vertrouwt. Gebruik daar het toetsenbord met deze code.
setup-secure-boot-skipped = Het blauwe scherm is overgeslagen. Vraag een nieuwe code aan en start opnieuw op. Gebruik daarna het toetsenbord op dat scherm.
setup-secure-boot-getting = Je code wordt opgehaald…
setup-secure-boot-new-code = Nieuwe code aanvragen

## Encryption

setup-protect-title = Je bestanden beschermen
setup-protect-tpm = Versleutel deze computer, zodat niemand je bestanden kan lezen zonder zich aan te melden, ook niet als je hem kwijtraakt. Hij ontgrendelt vanzelf bij het opstarten.
setup-protect-passphrase = Versleutel deze computer, zodat niemand je bestanden kan lezen zonder je wachtwoordzin, ook niet als je de computer kwijtraakt.
setup-protect-keep-safe = Bewaar deze herstelsleutel op een veilige plek, niet bij deze computer. Je hebt hem nodig als de computer zichzelf ooit niet kan ontgrendelen.
setup-protect-passphrase-label = Wachtwoordzin
setup-protect-repeat = Typ hem opnieuw
setup-protect-mismatch = Ze komen niet overeen
setup-protect-kept = Ik heb mijn herstelsleutel bewaard
setup-protect-skip = Niet versleutelen
setup-protect-encrypt = Versleutelen

## Fingerprint

setup-fingerprint-title = Aanmelden met je vinger
setup-fingerprint-description = Ontgrendel Luft met een aanraking in plaats van je wachtwoord te typen. Je kunt later meer vingers toevoegen in Instellingen.
setup-fingerprint-which = Welke vinger?
setup-fingerprint-another = Nog een vinger toevoegen?
setup-fingerprint-finger = Vinger
setup-fingerprint-no-reader = De vingerafdruklezer reageert niet. Je kunt later een vingerafdruk toevoegen in Instellingen.
setup-fingerprint-add = Vingerafdruk toevoegen
setup-fingerprint-choose-another = Andere vinger kiezen

## Done

setup-ready-title = Je bent er klaar voor
setup-ready-trust = Start nog één keer opnieuw op om af te ronden. Direct na het opnieuw opstarten vraagt een blauw scherm of je Luft vertrouwt. Gebruik daar het toetsenbord met deze code.
setup-ready-done = Je bureaublad staat klaar. Veel plezier met Luft.
setup-ready-start = Luft gaan gebruiken
