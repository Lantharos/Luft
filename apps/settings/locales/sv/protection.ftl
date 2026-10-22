## Shared buttons

settings-protection-cancel = Avbryt
settings-protection-continue = Fortsätt
settings-protection-close = Stäng
settings-protection-restart = Starta om
settings-protection-remove = Ta bort
settings-protection-turn-on = Slå på
settings-protection-set-up = Konfigurera

## Privacy: screen lock

settings-privacy-screen-lock = Skärmlås
settings-privacy-screen-off = Skärmen släcks
settings-privacy-screen-off-hint = Ställs in i Energi och batteri
settings-privacy-screen-off-after = Efter { $duration }
settings-privacy-screen-off-never = Aldrig
settings-privacy-lock-when-off = Lås skärmen när den släcks
settings-privacy-lock-after = Lås efter
settings-privacy-lock-after-hint = Hur länge det dröjer efter att skärmen har släckts
settings-privacy-lock-immediately = Direkt

## Privacy: location, camera and microphone

settings-privacy-location-services = Platstjänster
settings-privacy-location-services-hint = Låter appar se var du är, för kartor, väder och tidszoner
settings-privacy-camera-allow = Tillåt att appar använder kameran
settings-privacy-microphone-allow = Tillåt att appar använder mikrofonen

## Privacy: file history

settings-privacy-file-history = Filhistorik
settings-privacy-remember-files = Kom ihåg senast använda filer
settings-privacy-remember-files-hint = Appar kan visa filerna du öppnade senast
settings-privacy-keep-history = Spara historik i
settings-privacy-keep-forever = För alltid
settings-privacy-clear-history = Rensa historik
settings-privacy-clear-history-hint = Glöm alla filer i listan nu
settings-privacy-clear = Rensa
settings-privacy-clear-title = Vill du rensa filhistoriken?
settings-privacy-clear-description = Appar visar inte längre filerna du öppnade nyligen. Själva filerna ligger kvar där de är.

## Privacy: trash and temporary files

settings-privacy-cleanup = Papperskorg och tillfälliga filer
settings-privacy-empty-trash = Töm papperskorgen automatiskt
settings-privacy-delete-temp = Radera tillfälliga filer automatiskt
settings-privacy-delete-temp-hint = Dina filer i tillfälliga mappar som inget har använt på sistone
settings-privacy-delete-after = Radera efter
settings-privacy-delete-after-hint = Hur länge filerna ligger kvar innan de tas bort

## Security: summary at the top of the page

settings-security-protected = Din enhet är skyddad
settings-security-encrypting = Enheten krypteras
settings-security-encrypting-progress = { $progress }. Du kan fortsätta arbeta medan det blir klart.
settings-security-decrypting = Enhetskrypteringen stängs av
settings-security-restart-to-encrypt = Starta om för att börja kryptera
settings-security-restart-to-encrypt-description = Krypteringen börjar nästa gång datorn startas om.
settings-security-encryption-failed = Krypteringen startade inte
settings-security-encryption-failed-description = Luft startade utan den och dina filer har inte ändrats. Slå på den igen för att göra ett nytt försök.
settings-security-encryption-refused-description = Luft har ändrat sin storlek, men krypteringen kunde inte starta efteråt. Dina filer har inte ändrats. Slå på den igen för att göra ett nytt försök.
settings-security-waiting-to-encrypt = Krypteringen väntar
settings-security-waiting-to-encrypt-description = Luft ändrar fortfarande sin storlek. När det är klart startar krypteringen vid nästa omstart.
settings-security-could-be-safer = Din enhet kan bli säkrare
settings-security-could-be-safer-description = Slå på enhetskryptering så att dina filer förblir privata.
settings-security-starts-differently-description = Om du har ändrat datorns inställningar för Secure Boot bekräftar du det, så låses disken upp av sig själv igen.
settings-security-needed-recovery-key = Disken behövde sin återställningsnyckel
settings-security-needed-recovery-key-description = Koppla säkerhetschippet igen så att disken låses upp av sig själv.
settings-security-firmware-ready-description = Firmwareuppdateringar för din maskinvara finns i Uppdateringar.
settings-security-encrypted-secure-boot = Disken är krypterad och Secure Boot kontrollerar hur datorn startar.
settings-security-encrypted = Disken är krypterad.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Bara betrodd programvara kan starta den här datorn
settings-security-chip = Säkerhetschip
settings-security-chip-description = Förvarar nycklar säkert och kontrollerar hur datorn startade
settings-firmware-updates-ready = Firmwareuppdateringar finns
settings-firmware-updates-count = { $count ->
    [one] { $count } uppdatering för din maskinvara i Uppdateringar
   *[other] { $count } uppdateringar för din maskinvara i Uppdateringar
}

## Security: signed startup

settings-security-signed-startup = Signerad start
settings-security-signed-startup-on = Startmenyn och systemet är signerade för den här datorn
settings-security-signed-startup-purpose = Låter bara programvara som är signerad för den här datorn starta den
settings-security-signed-startup-restart = Börjar användas efter att du startar om
settings-security-signed-startup-missed = Nyckeln lades inte till vid den senaste omstarten
settings-security-signed-startup-pending = Lägg till nyckeln på den blå skärmen när du startar om
settings-security-signed-startup-missed-often = Nyckeln har inte lagts till trots flera omstarter
settings-security-show-steps = Visa stegen
settings-security-try-again = Försök igen

## Security: games with anti-cheat

settings-security-anti-cheat = Spel med fuskskydd
settings-security-anti-cheat-ready = Redo för spel med fuskskydd
settings-security-anti-cheat-removing = Ta bort de andra nycklarna på den blå skärmen när du startar om
settings-security-anti-cheat-luft-key = Epic behöver fortfarande lägga till Lufts nyckel i sin lista
settings-security-anti-cheat-ready-description = Spel kan kontrollera hur datorn startade

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Ta bort nycklarna när du startar om
settings-security-key-steps-add = Lägg till nyckeln när du startar om
settings-security-key-steps-remove-description = När du har startat om visas en blå skärm som frågar om att ta bort nycklar. Den väntar bara i 10 sekunder, så tryck på valfri tangent så fort den visas.
settings-security-key-steps-add-description = När du har startat om visas en blå skärm som frågar om en ny nyckel. Den väntar bara i 10 sekunder, så tryck på valfri tangent så fort den visas.
settings-security-key-step-choose = Välj { $option } och sedan { $next }.
settings-security-key-step-confirm = Välj { $option }.
settings-security-key-step-code = Skriv koden nedan och tryck på { $key }.
settings-security-key-step-reboot = Välj { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Kod { $code }
settings-security-key-steps-remove-missed = Om du missar den startar datorn som vanligt och du kan försöka igen här.
settings-security-key-steps-add-missed = Om du missar den startar datorn som vanligt och stegen visas igen vid nästa omstart, med en ny kod.
settings-security-later = Senare
settings-security-restart-now = Starta om nu

## Security: hardware security level

settings-security-hardware = Maskinvarusäkerhet
settings-security-hardware-level-0 = Din maskinvara har få av de skydd den skulle kunna ha
settings-security-hardware-level-1 = Din maskinvara har grundläggande skydd
settings-security-hardware-level-2 = Din maskinvara har de viktiga skydden
settings-security-hardware-level-3 = Din maskinvara är väl skyddad
settings-security-hardware-level-4 = Din maskinvara skyddar sig själv medan den körs
settings-security-hardware-level-5 = Din maskinvara skyddar sig själv och kan bevisa det
settings-security-hardware-description = { $summary }, nivå { $level } av { $highest }.
settings-security-hardware-next = För nästa nivå
settings-security-hardware-highest = Det här är den högsta nivån som finns.
settings-security-hardware-inactive = Inte aktivt just nu
settings-security-hardware-fix-maker = { $count ->
    [one] Bara datorns tillverkare kan lägga till det här, oftast med en firmwareuppdatering:
   *[other] Bara datorns tillverkare kan lägga till de här, oftast med en firmwareuppdatering:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Det här kan slås på i datorns firmwareinställningar:
   *[other] De här kan slås på i datorns firmwareinställningar:
}
settings-security-hardware-fix-system = { $count ->
    [one] Det här beror på hur systemet är konfigurerat:
   *[other] De här beror på hur systemet är konfigurerat:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Det här finns inte på den här datorn:
   *[other] De här finns inte på den här datorn:
}

## Security: USB protection

settings-usb-hold-back = Spärra nya USB-enheter
settings-usb-hold-back-description = Enheter som ansluts medan datorn är låst väntar tills du låser upp

## Device encryption

settings-encryption = Enhetskryptering
settings-encryption-encrypting = Enheten krypteras
settings-encryption-decrypting = Enhetskrypteringen stängs av
settings-encryption-starting = Börjar nästa gång du startar om
settings-encryption-failed = Startade inte vid den senaste omstarten, dina filer har inte ändrats
settings-encryption-waiting = Väntar tills Luft har ändrat sin storlek och startar sedan vid nästa omstart
settings-encryption-refused = Kunde inte starta efter att Luft ändrade storlek, dina filer har inte ändrats
settings-encryption-off = Håller dina filer privata om datorn kommer bort
settings-encryption-progress = { $percent } klart
settings-encryption-progress-seconds = { $percent } klart, mindre än en minut kvar
settings-encryption-progress-minutes = { $minutes ->
    [one] { $percent } klart, ungefär { $minutes } minut kvar
   *[other] { $percent } klart, ungefär { $minutes } minuter kvar
}
settings-encryption-progress-hours = { $hours ->
    [one] { $percent } klart, ungefär { $hours } timme kvar
   *[other] { $percent } klart, ungefär { $hours } timmar kvar
}
settings-encryption-unlocks-chip-pin = Låses upp med säkerhetschippet och din PIN-kod
settings-encryption-unlocks-chip = Låses upp av sig själv med säkerhetschippet
settings-encryption-unlocks-passphrase = Frågar efter din lösenfras vid start
settings-encryption-unlocks-security-key = Låses upp med din säkerhetsnyckel vid start
settings-encryption-unlocks-recovery-key = Frågar efter din återställningsnyckel vid start

## Device encryption: other drives

settings-encryption-drives = Andra diskar
settings-encryption-drives-hint = Kryptera andra diskar och USB-minnen i Diskar
settings-encryption-drives-open = Öppna Diskar
settings-encryption-drive-encrypting = En disk krypteras, { $percent } klart
settings-encryption-drive-encrypting-paused = En disk krypteras, pausad vid { $percent }
settings-encryption-drive-decrypting = En disk dekrypteras, { $percent } klart
settings-encryption-drive-decrypting-paused = En disk dekrypteras, pausad vid { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } krypterad disk låses upp med den här datorn
   *[other] { $count } krypterade diskar låses upp med den här datorn
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Slå på enhetskryptering
settings-encryption-turn-on-description = Dina filer förblir privata om datorn kommer bort eller blir stulen. Utan rätt nyckel kan ingen läsa disken.
settings-encryption-blocked-title = Det går inte att slå på enhetskryptering än
settings-encryption-blocked-description = Åtgärda det som är markerat nedan och försök sedan igen.
settings-encryption-backup = Se till att du har säkerhetskopior av dina viktiga filer innan du börjar.
settings-encryption-key-title = Spara återställningsnyckeln
settings-encryption-key-description = Om disken någon gång inte kan låsas upp av sig själv, till exempel efter en reparation, kommer du in med den här nyckeln. Förvara den någon annanstans än på den här datorn.
settings-encryption-unlock-title = Upplåsning vid start
settings-encryption-unlock-description = Säkerhetschippet låser upp disken av sig själv vid start, så inloggningen fungerar som vanligt.
settings-encryption-passphrase-title = Välj en lösenfras
settings-encryption-passphrase-description = Den här datorn kan inte låsa upp disken av sig själv, så den frågar efter lösenfrasen varje gång den startar.
settings-encryption-summary-title = Redo att kryptera
settings-encryption-summary-description = Så här går det till.
settings-encryption-step-restart = Datorn startas om en gång.
settings-encryption-step-screen = Under starten visas skärmen ”Encrypting your device” en kort stund.
settings-encryption-step-background = Resten sker i bakgrunden medan du fortsätter arbeta.
settings-encryption-step-plugged-in = Låt datorn vara ansluten till laddaren tills det är klart.
settings-encryption-ask-pin = Fråga också efter en PIN-kod
settings-encryption-ask-pin-description = Håller disken låst även om någon tar datorn. Du ombeds ange den när krypteringen är klar.
settings-encryption-starting-button = Startar …
settings-encryption-restart-and-encrypt = Starta om och kryptera

## Device encryption: turning it off

settings-encryption-turn-off-title = Vill du stänga av enhetskrypteringen?
settings-encryption-turn-off-description = Dina filer dekrypteras i bakgrunden medan du arbetar. Efteråt kan vem som helst som tar ut disken läsa den.
settings-encryption-keep = Behåll krypteringen
settings-encryption-turning-off = Stänger av …
settings-encryption-turn-off = Stäng av

## Device encryption: unlocking the disk

settings-encryption-unlocking = Upplåsning av disken
settings-encryption-starts-differently = Datorn startar på ett annat sätt nu
settings-encryption-starts-differently-description = Inställningarna för Secure Boot har ändrats, så disken frågade efter sin återställningsnyckel. Om det var du som ändrade dem bekräftar du det, så låses disken upp av sig själv igen
settings-encryption-confirm = Bekräfta
settings-encryption-asked-recovery-key = Disken frågade efter sin återställningsnyckel
settings-encryption-relink-description = Koppla säkerhetschippet igen så att disken låses upp av sig själv
settings-encryption-relink = Koppla igen
settings-encryption-chip-unlock = Lås upp med säkerhetschippet
settings-encryption-chip-unlock-on = Så länge inget ändrar hur datorn startar
settings-encryption-chip-unlock-off = Så att du slipper skriva en lösenfras vid start
settings-encryption-pin = PIN-kod vid start
settings-encryption-pin-description = Du skriver den innan disken låses upp
settings-encryption-change = Ändra
settings-encryption-add-pin-row = Lägg till en PIN-kod vid start
settings-encryption-add-pin-row-description = Håller disken låst även om någon tar datorn
settings-encryption-add-pin = Lägg till PIN-kod
settings-encryption-new-key-description = Disken hade ingen återställningsnyckel än. Förvara den här någon annanstans än på den här datorn.
settings-encryption-stop-chip-title = Vill du sluta låsa upp med säkerhetschippet?
settings-encryption-stop-chip-passphrase = Datorn frågar efter din lösenfras varje gång den startar.
settings-encryption-stop-chip-recovery-key = Datorn frågar efter din återställningsnyckel varje gång den startar, så ha den nära till hands.
settings-encryption-stop-chip = Sluta låsa upp
settings-encryption-remove-pin-title = Vill du ta bort PIN-koden?
settings-encryption-remove-pin-description = Disken låses upp av sig själv igen när datorn startar.
settings-encryption-remove-pin = Ta bort PIN-kod
settings-encryption-unlock-disk-title = Lås upp disken
settings-encryption-unlock-disk-description = Den här ändringen kräver din återställningsnyckel eller lösenfrasen du skriver när datorn startar.
settings-encryption-unlock-disk-field = Återställningsnyckel eller lösenfras

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = Säkerhetschippet i datorn låser upp disken av sig själv vid start, så du behöver inte längre skriva en lösenfras först.
settings-encryption-add-pin-title = Lägg till en PIN-kod
settings-encryption-add-pin-description = Du skriver den varje gång datorn startar. Utan den förblir disken låst, även om någon tar hela datorn.
settings-encryption-change-pin-title = Ändra PIN-kod
settings-encryption-change-pin-description = Du skriver den nya PIN-koden varje gång datorn startar.
settings-encryption-change-pin = Ändra PIN-kod
settings-encryption-relink-title = Koppla säkerhetschippet igen
settings-encryption-relink-pin-description = Skriv PIN-koden du vill använda vid start.
settings-encryption-ask-pin-step = Lägger till ett steg vid start.
settings-encryption-pin-field = PIN-kod
settings-encryption-new-pin-field = Ny PIN-kod
settings-encryption-pin-length = { $min } till { $max } siffror
settings-encryption-pin-digits-only = Använd bara siffror
settings-encryption-pin-too-short = { $min ->
    [one] Använd minst { $min } siffra
   *[other] Använd minst { $min } siffror
}
settings-encryption-pin-too-long = { $max ->
    [one] Använd högst { $max } siffra
   *[other] Använd högst { $max } siffror
}
settings-encryption-pins-differ = PIN-koderna matchar inte
settings-encryption-confirm-field = Bekräfta
settings-encryption-type-again = Skriv den igen

## Recovery key

settings-recovery-title = Återställningsnyckel
settings-recovery-description = Tar dig in om disken inte kan låsas upp av sig själv
settings-recovery-show = Visa
settings-recovery-replace = Ersätt
settings-recovery-replace-title = Vill du ersätta återställningsnyckeln?
settings-recovery-replace-description = Den nuvarande nyckeln slutar fungera och du får en ny att spara.
settings-recovery-replace-key = Ersätt nyckeln
settings-recovery-shown-title = Din återställningsnyckel
settings-recovery-shown-description = Skriv den om datorn någon gång frågar efter en återställningsnyckel vid start. Förvara en kopia någon annanstans än på den här datorn.
settings-recovery-fresh-title = Spara den nya återställningsnyckeln
settings-recovery-fresh-description = Den tidigare nyckeln fungerar inte längre. Förvara den här på papper eller i en lösenordshanterare.

## Passwords and keys (the keyring)

settings-passwords-title = Lösenord och nycklar
settings-passwords-not-running = Nyckelringen körs inte
settings-passwords-not-running-description = Dina lösenord och nycklar visas här när den har startat
settings-passwords-locked = Låst
settings-passwords-contents = { $count ->
    [0] Inget sparat än
    [one] { $count } lösenord eller nyckel
   *[other] { $count } lösenord och nycklar
}
settings-passwords-protected-chip = Skyddas av ditt lösenord och säkerhetschippet
settings-passwords-protected = Skyddas av ditt lösenord
settings-passwords-unlock = Lås upp
settings-passwords-lock = Lås
settings-passwords-seal-title = Försegla med säkerhetschippet
settings-passwords-seal-description = Kopior av dem kan inte öppnas på en annan dator
settings-passwords-seal = Försegla
settings-passwords-fingerprint-on = Låses upp med ditt fingeravtryck
settings-passwords-fingerprint-on-description = När du loggar in med det låses även dina lösenord upp
settings-passwords-fingerprint = Lås upp med fingeravtryck
settings-passwords-fingerprint-description = Lägg först till ett fingeravtryck i Användare
settings-passwords-pin = Fråga efter en PIN-kod efter fingeravtrycket
settings-passwords-pin-locked = Lås upp nyckelringen för att ändra det här
settings-passwords-pin-description = Så att ett fingeravtryck inte ensamt kan låsa upp dem
settings-passwords-lock-with-screen = Lås tillsammans med skärmen
settings-passwords-lock-with-screen-description = De låses och låses upp samtidigt som skärmen
settings-passwords-apps = Inloggningar och aktivitet i appar
settings-passwords-apps-locked = Lås upp nyckelringen för att se dem
settings-passwords-apps-description = Vad appar sparar här och när de använde det
settings-passwords-apps-allowed = Vilka appar som får använda dina lösenord
settings-passwords-apps-allowed-hint = Ställs in i Appar

## Passwords and keys: apps with access

settings-passwords-stores = Inloggningar i appar
settings-passwords-stores-description = Inloggningar som vissa appar sparar här, där bara den appen kan läsa dem.
settings-passwords-stores-count = { $count ->
    [one] { $count } sparad inloggning
   *[other] { $count } sparade inloggningar
}
settings-passwords-forget = Glöm
settings-passwords-forget-title = Vill du glömma det { $app } har sparat?
settings-passwords-forget-description = { $app } förlorar inloggningarna som sparats här, så du kan behöva logga in i appen igen.

## Passwords and keys: recent access

settings-passwords-history = Senaste åtkomst
settings-passwords-history-read = { $app } använde ”{ $item }”
settings-passwords-history-read-unnamed = { $app } använde ett sparat lösenord
settings-passwords-history-saved = { $app } sparade ”{ $item }”
settings-passwords-history-saved-unnamed = { $app } sparade ett lösenord
settings-passwords-history-deleted = { $app } raderade ”{ $item }”
settings-passwords-history-deleted-unnamed = { $app } raderade ett sparat lösenord
settings-passwords-history-denied = { $app } fick inte använda ”{ $item }”
settings-passwords-history-denied-unnamed = { $app } fick inte använda ett sparat lösenord
settings-passwords-history-signed = { $app } signerade med ”{ $item }”
settings-passwords-history-signed-unnamed = { $app } signerade med ett sparat lösenord
settings-passwords-history-fewer = Visa färre
settings-passwords-history-all = { $count ->
    [one] Visa alla { $count }
   *[other] Visa alla { $count }
}
settings-passwords-history-clear = Rensa historik
settings-passwords-history-clear-description = Glöm vilka appar som har använt nyckelringen och när
settings-passwords-history-clear-button = Rensa
settings-passwords-history-clear-title = Vill du rensa senaste åtkomst?
settings-passwords-history-clear-confirm = Listan över vilka appar som har använt nyckelringen och när raderas. Dina sparade lösenord och nycklar finns kvar som de är.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH-nycklar
settings-passwords-ssh-description = Nycklar för att logga in på servrar, förvarade säkert i nyckelringen.
settings-passwords-ssh-unnamed = Namnlös nyckel
settings-passwords-ssh-in-chip = Förvaras i säkerhetschippet
settings-passwords-ssh-added = Tillagd { $when }
settings-passwords-ssh-copy = Kopiera den offentliga nyckeln för { $name }
settings-passwords-ssh-remove = Ta bort { $name }
settings-passwords-ssh-confirm = Fråga före varje användning
settings-passwords-ssh-confirm-label = Fråga före varje användning av { $name }
settings-passwords-ssh-add-row = Lägg till en nyckel
settings-passwords-ssh-use = Använd de här nycklarna med SSH
settings-passwords-ssh-use-description = Kopiera raden som får SSH att använda dem
settings-passwords-ssh-copy-line = Kopiera { $line }
settings-passwords-ssh-remove-title = Vill du ta bort ”{ $name }”?
settings-passwords-ssh-remove-chip = Den finns bara i den här datorns säkerhetschip, så den försvinner för gott. Servrar som bara godtar den här nyckeln släpper inte längre in dig med den.
settings-passwords-ssh-remove-description = Servrar som bara godtar den här nyckeln släpper inte längre in dig med den. Det går inte att ångra.
settings-passwords-ssh-add-title = Lägg till en SSH-nyckel
settings-passwords-ssh-add-description = En ny nyckel skapas på den här datorn. Kopiera den offentliga nyckeln till servrarna du vill logga in på.
settings-passwords-ssh-name = Namn
settings-passwords-ssh-name-placeholder = Till exempel jobbdatorn
settings-passwords-ssh-chip = Förvara den i säkerhetschippet
settings-passwords-ssh-chip-description = Den kan aldrig kopieras från den här datorn, inte ens av dig
settings-passwords-ssh-chip-unsupported = Den här datorns säkerhetschip kan inte förvara SSH-nycklar
settings-passwords-ssh-add = Lägg till nyckel

## Passkeys

settings-passkeys-title = Lösennycklar
settings-passkeys-unavailable = Lås upp nyckelringen för att se dina lösennycklar.
settings-passkeys-chip-fingerprint = Förseglade av den här datorns säkerhetschip. Varje inloggning kräver ditt fingeravtryck eller lösenord.
settings-passkeys-chip-password = Förseglade av den här datorns säkerhetschip. Varje inloggning kräver ditt lösenord.
settings-passkeys-password-fingerprint = Krypterade med ditt lösenord. Varje inloggning kräver ditt fingeravtryck eller lösenord.
settings-passkeys-password = Krypterade med ditt lösenord. Varje inloggning kräver ditt lösenord.
settings-passkeys-last-used = Senast använd { $when }
settings-passkeys-never-used = Aldrig använd
settings-passkeys-password-only = Skyddad av ditt lösenord
settings-passkeys-unreachable = Webbläsare når inte dina lösennycklar
settings-passkeys-unreachable-description = De blir tillgängliga igen när tjänsten för lösennycklar körs
settings-passkeys-rename-label = Byt namn på lösennyckeln för { $site }
settings-passkeys-remove-label = Ta bort lösennyckeln för { $site }
settings-passkeys-empty = Inga lösennycklar än
settings-passkeys-empty-description = Lösennycklar som webbplatser skapar sparas här för alla webbläsare
settings-passkeys-remove-title = Vill du ta bort den här lösennyckeln?
settings-passkeys-remove-description = Du kan inte längre logga in på { $site } med den, så se till att du har ett annat sätt att komma in.
settings-passkeys-rename-title = Byt namn på lösennyckeln
settings-passkeys-rename-description = Ge lösennyckeln för { $site } ett namn som du känner igen.
settings-passkeys-name = Namn
settings-passkeys-save = Spara

## Apps

settings-apps-defaults = Standardappar
settings-apps-defaults-description = Används när du öppnar länkar, filer och mappar
settings-apps-browser = Webbläsare
settings-apps-email = E-post
settings-apps-calendar = Kalender
settings-apps-music = Musik
settings-apps-videos = Videor
settings-apps-photos = Foton
settings-apps-text-editor = Textredigerare
settings-apps-files = Filer
settings-apps-archives = Arkiv
settings-apps-choose = Välj
settings-apps-startup = Autostart
settings-apps-startup-description = De här apparna öppnas när du loggar in
settings-apps-startup-app = Öppna { $app } när du loggar in
settings-apps-startup-add = Lägg till app
settings-apps-startup-add-title = Lägg till en autostartapp
settings-apps-startup-add-description = Välj en app som ska öppnas varje gång du loggar in.
settings-apps-search = Sök efter appar
settings-apps-no-match = Inga appar matchar sökningen
settings-apps-cancel = Avbryt

## Apps: permissions

settings-apps-permissions = Behörigheter
settings-apps-location = Plats
settings-apps-camera = Kamera
settings-apps-clipboard = Urklipp i bakgrunden
settings-apps-full-access = Full åtkomst
settings-apps-full-access-hint = Den körs utanför sin sandlåda och kan allt ett program du startar själv kan. Borttagningen gäller från nästa gång den öppnas.
settings-apps-full-access-remove = Ta bort
settings-apps-full-access-remove-app = Ta bort full åtkomst för { $app }
settings-apps-passwords = Sparade lösenord
settings-apps-passwords-forget = Glöm
settings-apps-passwords-forget-app = Låt { $app } fråga igen
settings-apps-permissions-allowed = { $allowed } av { $total } tillåtna
settings-apps-permissions-description = Appar i en sandlåda får egna filer och bara det du tillåter här.
settings-apps-sandbox-only = Inget utanför sandlådan
settings-apps-folders = Mappar
settings-apps-folders-hint = Från nästa gång den öppnas kan den läsa och ändra allt i de här mapparna.
settings-apps-folders-count = { $count ->
    [one] { $count } mapp
   *[other] { $count } mappar
}
settings-apps-folder-add = Lägg till mapp
settings-apps-folder-remove = Ta bort
settings-apps-folder-remove-app = Sluta dela { $folder }
settings-apps-usb = USB-enheter
settings-apps-usb-hint = Som säkerhetsnycklar, telefoner och mikrokontroller
settings-apps-serial = Seriella enheter
settings-apps-serial-hint = Som 3D-skrivare och kort anslutna via USB
settings-apps-full-access-off = Den körs i en sandlåda. Full åtkomst tar bort sandlådan.
settings-apps-full-access-give = Ge full åtkomst
