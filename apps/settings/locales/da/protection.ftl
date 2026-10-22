## Shared buttons

settings-protection-cancel = Annuller
settings-protection-continue = Fortsæt
settings-protection-close = Luk
settings-protection-restart = Genstart
settings-protection-remove = Fjern
settings-protection-turn-on = Slå til
settings-protection-set-up = Konfigurer

## Privacy: screen lock

settings-privacy-screen-lock = Skærmlås
settings-privacy-screen-off = Skærmen slukkes
settings-privacy-screen-off-hint = Indstilles i Strøm og batteri
settings-privacy-screen-off-after = Efter { $duration }
settings-privacy-screen-off-never = Aldrig
settings-privacy-lock-when-off = Lås skærmen, når den slukkes
settings-privacy-lock-after = Lås efter
settings-privacy-lock-after-hint = Hvor længe der ventes, når skærmen er slukket
settings-privacy-lock-immediately = Med det samme

## Privacy: location, camera and microphone

settings-privacy-location-services = Placeringstjenester
settings-privacy-location-services-hint = Lader apps finde ud af, hvor du er, til kort, vejr og tidszoner
settings-privacy-camera-allow = Tillad apps at bruge kameraet
settings-privacy-microphone-allow = Tillad apps at bruge mikrofonen

## Privacy: file history

settings-privacy-file-history = Filhistorik
settings-privacy-remember-files = Husk senest brugte filer
settings-privacy-remember-files-hint = Apps kan vise de filer, du åbnede sidst
settings-privacy-keep-history = Behold historik i
settings-privacy-keep-forever = Altid
settings-privacy-clear-history = Ryd historik
settings-privacy-clear-history-hint = Glem alle filer på listen med det samme
settings-privacy-clear = Ryd
settings-privacy-clear-title = Vil du rydde filhistorikken?
settings-privacy-clear-description = Apps viser ikke længere de filer, du har åbnet for nylig. Selve filerne bliver, hvor de er.

## Privacy: trash and temporary files

settings-privacy-cleanup = Papirkurv og midlertidige filer
settings-privacy-empty-trash = Tøm papirkurven automatisk
settings-privacy-delete-temp = Slet midlertidige filer automatisk
settings-privacy-delete-temp-hint = Dine filer i midlertidige mapper, som intet har brugt for nylig
settings-privacy-delete-after = Slet efter
settings-privacy-delete-after-hint = Hvor længe filer bliver liggende, før de fjernes

## Security: summary at the top of the page

settings-security-protected = Din enhed er beskyttet
settings-security-encrypting = Krypterer din enhed
settings-security-encrypting-progress = { $progress }. Du kan arbejde videre, mens det bliver færdigt.
settings-security-decrypting = Slår enhedskryptering fra
settings-security-restart-to-encrypt = Genstart for at begynde krypteringen
settings-security-restart-to-encrypt-description = Krypteringen begynder, næste gang computeren genstarter.
settings-security-encryption-failed = Krypteringen startede ikke
settings-security-encryption-failed-description = Luft startede uden den, og dine filer blev ikke ændret. Slå den til igen for at prøve en gang til.
settings-security-encryption-refused-description = Luft blev færdig med at ændre sin størrelse, men krypteringen kunne ikke starte bagefter. Dine filer blev ikke ændret. Slå den til igen for at prøve en gang til.
settings-security-waiting-to-encrypt = Krypteringen venter
settings-security-waiting-to-encrypt-description = Luft er stadig ved at ændre sin størrelse. Når det er færdigt, starter krypteringen ved næste genstart.
settings-security-could-be-safer = Din enhed kunne være bedre beskyttet
settings-security-could-be-safer-description = Slå enhedskryptering til for at holde dine filer private.
settings-security-starts-differently-description = Hvis du har ændret dens indstillinger for Secure Boot, skal du bekræfte det, så disken igen låses op af sig selv.
settings-security-needed-recovery-key = Din disk skulle bruge sin genoprettelsesnøgle
settings-security-needed-recovery-key-description = Tilknyt sikkerhedschippen igen, så den låses op af sig selv.
settings-security-firmware-ready-description = Firmwareopdateringer til din hardware er klar i Opdateringer.
settings-security-encrypted-secure-boot = Din disk er krypteret, og Secure Boot kontrollerer, hvordan den starter.
settings-security-encrypted = Din disk er krypteret.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Kun software, der er tillid til, kan starte denne computer
settings-security-chip = Sikkerhedschip
settings-security-chip-description = Holder nøgler sikre og kontrollerer, hvordan computeren startede
settings-firmware-updates-ready = Firmwareopdateringer er klar
settings-firmware-updates-count = { $count ->
    [one] { $count } opdatering til din hardware i Opdateringer
   *[other] { $count } opdateringer til din hardware i Opdateringer
}

## Security: signed startup

settings-security-signed-startup = Signeret opstart
settings-security-signed-startup-on = Opstartsmenuen og systemet er signeret til denne computer
settings-security-signed-startup-purpose = Lader kun software, der er signeret til denne computer, starte den
settings-security-signed-startup-restart = Tages i brug, når du genstarter
settings-security-signed-startup-missed = Nøglen blev ikke tilføjet ved sidste genstart
settings-security-signed-startup-pending = Tilføj nøglen på den blå skærm, når du genstarter
settings-security-signed-startup-missed-often = Nøglen blev ikke tilføjet efter flere genstarter
settings-security-show-steps = Vis trin
settings-security-try-again = Prøv igen

## Security: games with anti-cheat

settings-security-anti-cheat = Spil med anti-cheat
settings-security-anti-cheat-ready = Klar til spil med anti-cheat
settings-security-anti-cheat-removing = Fjern de andre nøgler på den blå skærm, når du genstarter
settings-security-anti-cheat-luft-key = Epic mangler stadig at føje Lufts nøgle til sin liste
settings-security-anti-cheat-ready-description = Spil kan kontrollere, hvordan computeren startede

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Fjern nøglerne, når du genstarter
settings-security-key-steps-add = Tilføj nøglen, når du genstarter
settings-security-key-steps-remove-description = Når du har genstartet, spørger en blå skærm om at fjerne nøgler. Den venter kun 10 sekunder, så tryk på en vilkårlig tast, så snart den vises.
settings-security-key-steps-add-description = Når du har genstartet, spørger en blå skærm om en ny nøgle. Den venter kun 10 sekunder, så tryk på en vilkårlig tast, så snart den vises.
settings-security-key-step-choose = Vælg { $option } og derefter { $next }.
settings-security-key-step-confirm = Vælg { $option }.
settings-security-key-step-code = Skriv koden nedenfor, og tryk på { $key }.
settings-security-key-step-reboot = Vælg { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Kode { $code }
settings-security-key-steps-remove-missed = Hvis du ikke når det, starter computeren som normalt, og du kan prøve igen her.
settings-security-key-steps-add-missed = Hvis du ikke når det, starter computeren som normalt, og trinnene vises igen ved næste genstart med en ny kode.
settings-security-later = Senere
settings-security-restart-now = Genstart nu

## Security: hardware security level

settings-security-hardware = Hardwaresikkerhed
settings-security-hardware-level-0 = Din hardware har kun få af de beskyttelser, den kunne have
settings-security-hardware-level-1 = Din hardware har den grundlæggende beskyttelse
settings-security-hardware-level-2 = Din hardware har de vigtige beskyttelser
settings-security-hardware-level-3 = Din hardware er godt beskyttet
settings-security-hardware-level-4 = Din hardware beskytter sig selv, mens den kører
settings-security-hardware-level-5 = Din hardware beskytter sig selv og kan bevise det
settings-security-hardware-description = { $summary }, niveau { $level } af { $highest }.
settings-security-hardware-next = Til næste niveau
settings-security-hardware-highest = Dette er det højeste niveau, der findes.
settings-security-hardware-inactive = Ikke aktiv lige nu
settings-security-hardware-fix-maker = { $count ->
    [one] Kun producenten af din computer kan tilføje denne, som regel med en firmwareopdatering:
   *[other] Kun producenten af din computer kan tilføje disse, som regel med en firmwareopdatering:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Denne kan slås til i din computers firmwareindstillinger:
   *[other] Disse kan slås til i din computers firmwareindstillinger:
}
settings-security-hardware-fix-system = { $count ->
    [one] Denne afhænger af, hvordan systemet er sat op:
   *[other] Disse afhænger af, hvordan systemet er sat op:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Denne findes ikke på denne computer:
   *[other] Disse findes ikke på denne computer:
}

## Security: USB protection

settings-usb-hold-back = Hold nye USB-enheder tilbage
settings-usb-hold-back-description = Enheder, der tilsluttes, mens computeren er låst, venter, til du låser op

## Device encryption

settings-encryption = Enhedskryptering
settings-encryption-encrypting = Krypterer denne enhed
settings-encryption-decrypting = Slår enhedskryptering fra
settings-encryption-starting = Begynder, næste gang du genstarter
settings-encryption-failed = Startede ikke ved sidste genstart, dine filer blev ikke ændret
settings-encryption-waiting = Venter på, at Luft bliver færdig med at ændre størrelse, og starter så ved næste genstart
settings-encryption-refused = Kunne ikke starte, efter Luft ændrede størrelse, dine filer blev ikke ændret
settings-encryption-off = Holder dine filer private, hvis computeren bliver væk
settings-encryption-progress = { $percent } færdig
settings-encryption-progress-seconds = { $percent } færdig, under et minut tilbage
settings-encryption-progress-minutes = { $minutes ->
    [one] { $percent } færdig, cirka { $minutes } minut tilbage
   *[other] { $percent } færdig, cirka { $minutes } minutter tilbage
}
settings-encryption-progress-hours = { $hours ->
    [one] { $percent } færdig, cirka { $hours } time tilbage
   *[other] { $percent } færdig, cirka { $hours } timer tilbage
}
settings-encryption-unlocks-chip-pin = Låses op med sikkerhedschippen og din pinkode
settings-encryption-unlocks-chip = Låses op af sig selv med sikkerhedschippen
settings-encryption-unlocks-passphrase = Beder om din adgangsfrase ved opstart
settings-encryption-unlocks-security-key = Låses op med din sikkerhedsnøgle ved opstart
settings-encryption-unlocks-recovery-key = Beder om din genoprettelsesnøgle ved opstart

## Device encryption: other drives

settings-encryption-drives = Andre drev
settings-encryption-drives-hint = Krypter andre drev og USB-stik i Diske
settings-encryption-drives-open = Åbn Diske
settings-encryption-drive-encrypting = Krypterer et drev, { $percent } færdig
settings-encryption-drive-encrypting-paused = Krypterer et drev, sat på pause ved { $percent }
settings-encryption-drive-decrypting = Dekrypterer et drev, { $percent } færdig
settings-encryption-drive-decrypting-paused = Dekrypterer et drev, sat på pause ved { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } krypteret drev låses op sammen med denne computer
   *[other] { $count } krypterede drev låses op sammen med denne computer
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Slå enhedskryptering til
settings-encryption-turn-on-description = Dine filer forbliver private, hvis computeren bliver væk eller stjålet. Uden den rigtige nøgle kan ingen læse disken.
settings-encryption-blocked-title = Enhedskryptering kan ikke slås til endnu
settings-encryption-blocked-description = Ordn det, der er markeret nedenfor, og prøv så igen.
settings-encryption-backup = Sørg for, at dine vigtige filer er sikkerhedskopieret, før du begynder.
settings-encryption-key-title = Gem din genoprettelsesnøgle
settings-encryption-key-description = Hvis disken en dag ikke kan låse op af sig selv, for eksempel efter en reparation, kan du komme ind igen med denne nøgle. Opbevar den et andet sted end på denne computer.
settings-encryption-unlock-title = Oplåsning ved opstart
settings-encryption-unlock-description = Sikkerhedschippen låser disken op af sig selv ved opstart, så du logger ind som hidtil.
settings-encryption-passphrase-title = Vælg en adgangsfrase
settings-encryption-passphrase-description = Denne computer kan ikke låse disken op af sig selv, så den beder om adgangsfrasen, hver gang den starter.
settings-encryption-summary-title = Klar til kryptering
settings-encryption-summary-description = Sådan foregår det.
settings-encryption-step-restart = Computeren genstarter én gang.
settings-encryption-step-screen = Mens den starter, vises skærmen »Encrypting your device« kortvarigt.
settings-encryption-step-background = Resten foregår i baggrunden, mens du arbejder videre.
settings-encryption-step-plugged-in = Hold computeren tilsluttet strøm, indtil det er færdigt.
settings-encryption-ask-pin = Bed også om en pinkode
settings-encryption-ask-pin-description = Holder disken låst, selv hvis nogen tager computeren. Du bliver bedt om den, når krypteringen er færdig.
settings-encryption-starting-button = Starter…
settings-encryption-restart-and-encrypt = Genstart og krypter

## Device encryption: turning it off

settings-encryption-turn-off-title = Vil du slå enhedskryptering fra?
settings-encryption-turn-off-description = Dine filer dekrypteres i baggrunden, mens du arbejder. Bagefter kan alle, der tager disken ud, læse den.
settings-encryption-keep = Behold kryptering
settings-encryption-turning-off = Slår fra…
settings-encryption-turn-off = Slå fra

## Device encryption: unlocking the disk

settings-encryption-unlocking = Oplåsning af din disk
settings-encryption-starts-differently = Computeren starter anderledes nu
settings-encryption-starts-differently-description = Dens indstillinger for Secure Boot er ændret, så disken bad om sin genoprettelsesnøgle. Hvis det var dig, der ændrede dem, skal du bekræfte det, så den igen låses op af sig selv
settings-encryption-confirm = Bekræft
settings-encryption-asked-recovery-key = Din disk bad om sin genoprettelsesnøgle
settings-encryption-relink-description = Tilknyt sikkerhedschippen igen, så den låses op af sig selv
settings-encryption-relink = Tilknyt igen
settings-encryption-chip-unlock = Lås op med sikkerhedschippen
settings-encryption-chip-unlock-on = Så længe intet ændrer, hvordan computeren starter
settings-encryption-chip-unlock-off = Så du ikke skal skrive en adgangsfrase ved opstart
settings-encryption-pin = Pinkode ved opstart
settings-encryption-pin-description = Du skriver den, før disken låses op
settings-encryption-change = Skift
settings-encryption-add-pin-row = Tilføj en pinkode ved opstart
settings-encryption-add-pin-row-description = Holder disken låst, selv hvis computeren bliver taget
settings-encryption-add-pin = Tilføj pinkode
settings-encryption-new-key-description = Din disk havde endnu ingen genoprettelsesnøgle. Opbevar denne et andet sted end på computeren.
settings-encryption-stop-chip-title = Vil du stoppe oplåsning med sikkerhedschippen?
settings-encryption-stop-chip-passphrase = Computeren beder om din adgangsfrase, hver gang den starter.
settings-encryption-stop-chip-recovery-key = Computeren beder om din genoprettelsesnøgle, hver gang den starter, så hav den ved hånden.
settings-encryption-stop-chip = Stop oplåsning
settings-encryption-remove-pin-title = Vil du fjerne din pinkode?
settings-encryption-remove-pin-description = Disken låses igen op af sig selv, når computeren starter.
settings-encryption-remove-pin = Fjern pinkode
settings-encryption-unlock-disk-title = Lås din disk op
settings-encryption-unlock-disk-description = Denne ændring kræver din genoprettelsesnøgle eller den adgangsfrase, du skriver, når computeren starter.
settings-encryption-unlock-disk-field = Genoprettelsesnøgle eller adgangsfrase

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = Sikkerhedschippen i din computer låser disken op af sig selv ved opstart, så du ikke længere skal skrive en adgangsfrase først.
settings-encryption-add-pin-title = Tilføj en pinkode
settings-encryption-add-pin-description = Du skal skrive den, hver gang computeren starter. Uden den forbliver disken låst, selv hvis nogen tager hele computeren.
settings-encryption-change-pin-title = Skift din pinkode
settings-encryption-change-pin-description = Du skal skrive den nye pinkode, hver gang computeren starter.
settings-encryption-change-pin = Skift pinkode
settings-encryption-relink-title = Tilknyt sikkerhedschippen igen
settings-encryption-relink-pin-description = Skriv den pinkode, du vil bruge ved opstart.
settings-encryption-ask-pin-step = Tilføjer et trin ved opstart.
settings-encryption-pin-field = Pinkode
settings-encryption-new-pin-field = Ny pinkode
settings-encryption-pin-length = { $min } til { $max } cifre
settings-encryption-pin-digits-only = Brug kun cifre
settings-encryption-pin-too-short = { $min ->
    [one] Brug mindst { $min } ciffer
   *[other] Brug mindst { $min } cifre
}
settings-encryption-pin-too-long = { $max ->
    [one] Brug højst { $max } ciffer
   *[other] Brug højst { $max } cifre
}
settings-encryption-pins-differ = Pinkoderne er ikke ens
settings-encryption-confirm-field = Bekræft
settings-encryption-type-again = Skriv den igen

## Recovery key

settings-recovery-title = Genoprettelsesnøgle
settings-recovery-description = Giver dig adgang, hvis disken ikke kan låse op af sig selv
settings-recovery-show = Vis
settings-recovery-replace = Udskift
settings-recovery-replace-title = Vil du udskifte din genoprettelsesnøgle?
settings-recovery-replace-description = Din nuværende nøgle holder op med at virke, og du får en ny, som du skal gemme.
settings-recovery-replace-key = Udskift nøgle
settings-recovery-shown-title = Din genoprettelsesnøgle
settings-recovery-shown-description = Skriv den, hvis computeren en dag beder om en genoprettelsesnøgle ved opstart. Opbevar en kopi et andet sted end på denne computer.
settings-recovery-fresh-title = Gem din nye genoprettelsesnøgle
settings-recovery-fresh-description = Din tidligere nøgle virker ikke længere. Opbevar denne på papir eller i en adgangskodeadministrator.

## Passwords and keys (the keyring)

settings-passwords-title = Adgangskoder og nøgler
settings-passwords-not-running = Din nøglering kører ikke
settings-passwords-not-running-description = Dine adgangskoder og nøgler vises her, når den starter
settings-passwords-locked = Låst
settings-passwords-contents = { $count ->
    [0] Intet gemt endnu
    [one] { $count } adgangskode eller nøgle
   *[other] { $count } adgangskoder og nøgler
}
settings-passwords-protected-chip = Beskyttet af din adgangskode og sikkerhedschippen
settings-passwords-protected = Beskyttet af din adgangskode
settings-passwords-unlock = Lås op
settings-passwords-lock = Lås
settings-passwords-seal-title = Forsegl med sikkerhedschippen
settings-passwords-seal-description = Kopier af dem kan ikke åbnes på en anden computer
settings-passwords-seal = Forsegl
settings-passwords-fingerprint-on = Låses op med dit fingeraftryk
settings-passwords-fingerprint-on-description = Når du logger ind med det, låses dine adgangskoder også op
settings-passwords-fingerprint = Lås op med dit fingeraftryk
settings-passwords-fingerprint-description = Tilføj først et fingeraftryk i Brugere
settings-passwords-pin = Bed om en pinkode efter fingeraftrykket
settings-passwords-pin-locked = Lås din nøglering op for at ændre dette
settings-passwords-pin-description = Så et fingeraftryk alene ikke kan låse dem op
settings-passwords-lock-with-screen = Lås sammen med skærmen
settings-passwords-lock-with-screen-description = De låses og låses op sammen med skærmen
settings-passwords-apps = Applogins og aktivitet
settings-passwords-apps-locked = Lås din nøglering op for at se dem
settings-passwords-apps-description = Hvad apps gemmer her, og hvornår de brugte det
settings-passwords-apps-allowed = Hvilke apps der må bruge dine adgangskoder
settings-passwords-apps-allowed-hint = Indstilles i Apps

## Passwords and keys: apps with access

settings-passwords-stores = Applogins
settings-passwords-stores-description = Logins, som nogle apps gemmer her, hvor kun den pågældende app kan læse dem.
settings-passwords-stores-count = { $count ->
    [one] { $count } gemt login
   *[other] { $count } gemte logins
}
settings-passwords-forget = Glem
settings-passwords-forget-title = Vil du glemme det, { $app } har gemt?
settings-passwords-forget-description = { $app } mister de logins, der var gemt her, så du skal måske logge ind igen.

## Passwords and keys: recent access

settings-passwords-history = Seneste adgang
settings-passwords-history-read = { $app } brugte »{ $item }«
settings-passwords-history-read-unnamed = { $app } brugte en gemt adgangskode
settings-passwords-history-saved = { $app } gemte »{ $item }«
settings-passwords-history-saved-unnamed = { $app } gemte en adgangskode
settings-passwords-history-deleted = { $app } slettede »{ $item }«
settings-passwords-history-deleted-unnamed = { $app } slettede en gemt adgangskode
settings-passwords-history-denied = { $app } fik ikke lov til at bruge »{ $item }«
settings-passwords-history-denied-unnamed = { $app } fik ikke lov til at bruge en gemt adgangskode
settings-passwords-history-signed = { $app } signerede med »{ $item }«
settings-passwords-history-signed-unnamed = { $app } signerede med en gemt adgangskode
settings-passwords-history-fewer = Vis færre
settings-passwords-history-all = { $count ->
    [one] Vis alle { $count }
   *[other] Vis alle { $count }
}
settings-passwords-history-clear = Ryd historik
settings-passwords-history-clear-description = Glem, hvilke apps der har brugt din nøglering, og hvornår
settings-passwords-history-clear-button = Ryd
settings-passwords-history-clear-title = Vil du rydde seneste adgang?
settings-passwords-history-clear-confirm = Listen over, hvilke apps der har brugt din nøglering, og hvornår, slettes. Dine gemte adgangskoder og nøgler forbliver, som de er.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH-nøgler
settings-passwords-ssh-description = Nøgler til at logge ind på servere, opbevaret sikkert i din nøglering.
settings-passwords-ssh-unnamed = Unavngivet nøgle
settings-passwords-ssh-in-chip = Opbevares i sikkerhedschippen
settings-passwords-ssh-added = Tilføjet { $when }
settings-passwords-ssh-copy = Kopier den offentlige nøgle for { $name }
settings-passwords-ssh-remove = Fjern { $name }
settings-passwords-ssh-confirm = Spørg før hver brug
settings-passwords-ssh-confirm-label = Spørg før hver brug af { $name }
settings-passwords-ssh-add-row = Tilføj en nøgle
settings-passwords-ssh-use = Brug disse nøgler med SSH
settings-passwords-ssh-use-description = Kopier linjen, der peger SSH hen på dem
settings-passwords-ssh-copy-line = Kopier { $line }
settings-passwords-ssh-remove-title = Vil du fjerne »{ $name }«?
settings-passwords-ssh-remove-chip = Den findes kun i denne computers sikkerhedschip, så den forsvinder for altid. Servere, der kun accepterer denne nøgle, lukker dig ikke længere ind med den.
settings-passwords-ssh-remove-description = Servere, der kun accepterer denne nøgle, lukker dig ikke længere ind med den. Det kan ikke fortrydes.
settings-passwords-ssh-add-title = Tilføj en SSH-nøgle
settings-passwords-ssh-add-description = Der oprettes en ny nøgle på denne computer. Kopier dens offentlige nøgle til de servere, du vil logge ind på.
settings-passwords-ssh-name = Navn
settings-passwords-ssh-name-placeholder = For eksempel arbejdscomputer
settings-passwords-ssh-chip = Opbevar den i sikkerhedschippen
settings-passwords-ssh-chip-description = Den kan aldrig kopieres fra denne computer, heller ikke af dig
settings-passwords-ssh-chip-unsupported = Denne computers sikkerhedschip kan ikke rumme SSH-nøgler
settings-passwords-ssh-add = Tilføj nøgle

## Passkeys

settings-passkeys-title = Adgangsnøgler
settings-passkeys-unavailable = Lås din nøglering op for at se dine adgangsnøgler.
settings-passkeys-chip-fingerprint = Forseglet af denne computers sikkerhedschip. Hvert login beder om dit fingeraftryk eller din adgangskode.
settings-passkeys-chip-password = Forseglet af denne computers sikkerhedschip. Hvert login beder om din adgangskode.
settings-passkeys-password-fingerprint = Krypteret med din adgangskode. Hvert login beder om dit fingeraftryk eller din adgangskode.
settings-passkeys-password = Krypteret med din adgangskode. Hvert login beder om din adgangskode.
settings-passkeys-last-used = Sidst brugt { $when }
settings-passkeys-never-used = Aldrig brugt
settings-passkeys-password-only = Beskyttet af din adgangskode
settings-passkeys-unreachable = Browsere kan ikke få fat i dine adgangsnøgler
settings-passkeys-unreachable-description = De er tilbage, når tjenesten for adgangsnøgler kører
settings-passkeys-rename-label = Omdøb adgangsnøgle til { $site }
settings-passkeys-remove-label = Fjern adgangsnøgle til { $site }
settings-passkeys-empty = Ingen adgangsnøgler endnu
settings-passkeys-empty-description = Dem, websteder opretter, gemmes her til alle browsere
settings-passkeys-remove-title = Vil du fjerne denne adgangsnøgle?
settings-passkeys-remove-description = Du kan ikke længere logge ind på { $site } med den, så sørg for, at du har en anden måde at komme ind på.
settings-passkeys-rename-title = Omdøb adgangsnøgle
settings-passkeys-rename-description = Giv din adgangsnøgle til { $site } et navn, du kan genkende.
settings-passkeys-name = Navn
settings-passkeys-save = Gem

## Apps

settings-apps-defaults = Standardapps
settings-apps-defaults-description = Bruges, når du åbner links, filer og mapper
settings-apps-browser = Webbrowser
settings-apps-email = E-mail
settings-apps-calendar = Kalender
settings-apps-music = Musik
settings-apps-videos = Videoer
settings-apps-photos = Fotos
settings-apps-text-editor = Teksteditor
settings-apps-files = Filer
settings-apps-archives = Arkiver
settings-apps-choose = Vælg
settings-apps-startup = Opstart
settings-apps-startup-description = Disse apps åbnes, når du logger ind
settings-apps-startup-app = Åbn { $app }, når du logger ind
settings-apps-startup-add = Tilføj app
settings-apps-startup-add-title = Tilføj en opstartsapp
settings-apps-startup-add-description = Vælg en app, der skal åbnes, hver gang du logger ind.
settings-apps-search = Søg efter apps
settings-apps-no-match = Ingen apps matcher din søgning
settings-apps-cancel = Annuller

## Apps: permissions

settings-apps-permissions = Tilladelser
settings-apps-location = Placering
settings-apps-camera = Kamera
settings-apps-clipboard = Udklipsholder i baggrunden
settings-apps-full-access = Fuld adgang
settings-apps-full-access-hint = Den kører uden for sin sandkasse og kan alt, hvad et program, du selv starter, kan. Det træder i kraft, næste gang den åbner, når du fjerner det.
settings-apps-full-access-remove = Fjern
settings-apps-full-access-remove-app = Fjern fuld adgang for { $app }
settings-apps-passwords = Gemte adgangskoder
settings-apps-passwords-forget = Glem
settings-apps-passwords-forget-app = Lad { $app } spørge igen
settings-apps-permissions-allowed = { $allowed } af { $total } tilladt
settings-apps-permissions-description = Apps i en sandkasse får deres egne filer og kun det, du tillader her.
settings-apps-sandbox-only = Intet uden for sandkassen
settings-apps-folders = Mapper
settings-apps-folders-hint = Den kan læse og ændre alt i disse mapper, fra næste gang den åbner.
settings-apps-folders-count = { $count ->
    [one] { $count } mappe
   *[other] { $count } mapper
}
settings-apps-folder-add = Tilføj mappe
settings-apps-folder-remove = Fjern
settings-apps-folder-remove-app = Stop med at dele { $folder }
settings-apps-usb = USB-enheder
settings-apps-usb-hint = Som sikkerhedsnøgler, telefoner og mikrocontrollere
settings-apps-serial = Serielle enheder
settings-apps-serial-hint = Som 3D-printere og kort, der er tilsluttet med USB
settings-apps-full-access-off = Den kører i en sandkasse. Fuld adgang fjerner sandkassen.
settings-apps-full-access-give = Giv fuld adgang
