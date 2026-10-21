## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitni procesor Intel ili AMD
check-processor-x64-detail = Luft na njemu radi.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft zasad radi samo na procesorima Intel i AMD.
check-processor-32-bit-windows = 32-bitni Windows
check-processor-32-bit-system = 32-bitni sistem
check-processor-32-bit-detail = Luftu je potreban 64-bitni procesor Intel ili AMD.
check-startup-uefi = Pokreće se s UEFI-jem
check-startup-uefi-windows = Luft se pokreće na isti suvremeni način.
check-startup-uefi-linux = Luft dodaje vlastiti unos za pokretanje, a { $system } se i dalje pokreće kao i sada.
check-startup-bios = Pokreće se u starom načinu BIOS-a
check-startup-bios-windows = Luftu je potreban UEFI. Windows može prijeći pomoću alata MBR2GPT, a zatim se UEFI može uključiti u postavkama firmvera.
check-startup-bios-linux = Luftu je potreban UEFI. Uključite ga u postavkama firmvera, zajedno sa sistemom koji je već ovdje, a zatim ponovo provjerite.
check-startup-mbr = Disk koristi staru tablicu particija
check-startup-mbr-windows = Luftu je potreban disk s GPT-om. Windows ga može pretvoriti pomoću alata MBR2GPT bez gubitka fajlova.
check-startup-mbr-linux = Luftu je za pokretanje potreban disk s GPT-om.
check-startup-no-esp = Nema particije sistema EFI
check-startup-no-esp-detail = Luft svoje fajlove za pokretanje dodaje pored onih koji su već na particiji sistema EFI, a nje nema.
check-startup-esp-full = Particija sistema EFI je puna
check-startup-esp-full-detail = Luftu je tamo potrebno { $size } MB za fajlove za pokretanje. Prostor obično zauzimaju stare jezgre ili unosi za pokretanje.
check-folder-fine = Particije se ne mijenjaju
check-folder-fine-detail = Luft se čuva kao fajl na vašem { $filesystem } disku i odatle se pokreće.
check-folder-encrypted = Vaši fajlovi su na šifriranom disku
check-folder-encrypted-detail = Luft se zasad ne može pokrenuti sa šifriranog diska. Za isprobavanje upotrijebite USB fleš.
check-folder-combined = Vaši fajlovi su na više od jedne particije
check-folder-combined-detail = Luft se zasad ne može pokrenuti s LVM-a ni RAID-a. Za isprobavanje upotrijebite USB fleš.
check-folder-filesystem = Luft se ne može pokrenuti s fajl sistema { $filesystem }
check-folder-filesystem-detail = Pokreće se s diskova ext4, btrfs i XFS. Za isprobavanje upotrijebite USB fleš.
check-space-free = Slobodno: { $size } GB
check-space-free-linux = Dok ga isprobavate, Luft zauzima oko { $size } GB.
check-space-up-to = Do { $size } GB za Luft
check-space-up-to-detail = Windows zadržava svoje fajlove i prostor za rast.
check-space-short = Nema dovoljno slobodnog prostora
check-space-short-windows = Luftu treba oko { $needed } GB koje Windows može ustupiti. Oslobodite { $missing } GB u Windowsu, na primjer Čišćenjem diska, a zatim ponovo provjerite.
check-space-short-linux = Luftu za pokretanje treba oko { $needed } GB. Oslobodite { $missing } GB, a zatim ponovo provjerite.
check-system-replaceable = Luft može doći na njegovo mjesto i zadržati vaše fajlove, račun i postavke.
check-system-single = Vaši fajlovi dijele particiju sa sistemom, pa zamjena uz zadržavanje fajlova zasad nije podržana. Isprobavanje i instalacija Lufta rade.
check-system-encrypted = Sistem je šifriran, pa zamjena uz zadržavanje fajlova zasad nije podržana.
check-system-unknown = Disk sistema raspoređen je na način koji Luft zasad ne može zamijeniti uz zadržavanje vaših fajlova.
check-encryption-off = Windows nije šifriran
check-encryption-off-detail = Instaliraj Luft može pročitati njegove postavke i vaše Bluetooth uređaje.
check-encryption-on = Windows je šifriran BitLockerom
check-encryption-on-detail = To nije problem. Windows sam pravi prostor, a Meet Luft prenosi ono što Luft ne može pročitati sa zaključanog diska. Za svaki slučaj držite ključ za oporavak pri ruci.
check-encryption-changing = BitLocker još šifrira ili dešifrira
check-encryption-changing-detail = Pričekajte da Windows završi, a zatim se vratite. Napredak možete vidjeti u Postavkama, pod Šifriranje uređaja.
check-fast-startup-on = Brzo pokretanje je uključeno
check-fast-startup-on-detail = Windows umjesto isključivanja prelazi u hibernaciju, zbog čega mu disk ostaje zaključan. Meet Luft nudi da ga isključi prije instalacije.
check-fast-startup-off = Brzo pokretanje je isključeno
check-fast-startup-off-detail = Windows se potpuno isključuje.
check-secure-boot-on = Secure Boot je uključen
check-secure-boot-on-detail = Može ostati uključen. Luft jednom, na plavom ekranu, traži da doda svoj ključ.
check-secure-boot-off = Secure Boot je isključen
check-secure-boot-off-detail = Luft radi i bez njega, no igre sa zaštitom od varanja ga trebaju. { $turningOn }
check-secure-boot-restart-into = Meet Luft može ponovo pokrenuti računar u postavke firmvera, gdje se nalazi pod { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft može ponovo pokrenuti računar u postavke firmvera, gdje se obično nalazi pod Security ili Boot.
check-secure-boot-turn-on = Da ga uključite, ponovo pokrenite računar i pritisnite { $key } kad se pojavi logotip { $maker }, a zatim idite na { $place }.
check-secure-boot-turn-on-anywhere = Da ga uključite, otvorite postavke firmvera dok se računar pokreće i potražite pod Security ili Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, zatim Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, zatim Secure Boot
check-firmware-place-security-or-advanced = Security ili Advanced, zatim Secure Boot Configuration
check-firmware-place-security-or-boot = Security ili Boot, zatim Secure Boot
check-firmware-place-boot = Boot, zatim Secure Boot
check-firmware-place-settings = Settings, zatim Security, zatim Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 na ThinkPadu)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ili Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = tipku za pojačavanje zvuka

## More of the computer's hardware

check-tpm-detail = Šifrirani Luft može se sam otključati pri pokretanju računara.
check-tpm-missing = Nema TPM-a 2.0
check-tpm-missing-detail = Ako šifrirate Luft, pri svakom će pokretanju tražiti lozinku za šifriranje.
check-graphics = Grafika
check-graphics-detail = Radi odmah.
check-graphics-nvidia = Luft se instalira s NVIDIA-inim drajverom.
check-wifi-missing = Nema Wi-Fija
check-wifi-missing-detail = U Luftu koristite mrežni kabel ili ništa.
check-wifi-detail = Radi u Luftu.
check-wifi-broadcom = Neki Broadcomovi Wi-Fi čipovi trebaju drajver koji Luft ne sadrži. Držite pri ruci mrežni kabel ili telefon za USB dijeljenje veze.
check-start-entries = { $count ->
    [one] { $count } stari unos za pokretanje
    [few] { $count } stara unosa za pokretanje
   *[other] { $count } starih unosa za pokretanje
}
check-start-entries-detail = { $count ->
    [one] { $names } upućuje na sistem kojeg više nema na ovom računaru. Može se počistiti.
    [few] { $names } upućuju na sisteme kojih više nema na ovom računaru. Mogu se počistiti.
   *[other] { $names } upućuju na sisteme kojih više nema na ovom računaru. Mogu se počistiti.
}
check-download-unavailable = Luft se trenutno ne može preuzeti
check-download-unavailable-detail = Meet Luft preuzima oko 3 GB. Provjerite jeste li povezani s internetom i ponovo provjerite ili upotrijebite ISO Lufta koji već imate.

## Choosing a Luft ISO file

iso-dialog-title = Odaberite ISO Lufta
iso-dialog-filter = ISO Lufta

## Saving the logs from trying Luft

logs-file-name = Zapisnici Lufta { $name }
logs-no-desktop = Meet Luft nije pronašao vašu radnu površinu
logs-not-saved = Meet Luft nije mogao sačuvati zapisnike iz isprobavanja Lufta: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomoćni program aplikacije Meet Luft nije se pokrenuo: { $error }
helper-not-allowed = Meet Luft nije dobio dozvolu za rad na disku
helper-stopped = Pomoćni program aplikacije Meet Luft se zaustavio
helper-stopped-because = Pomoćni program aplikacije Meet Luft se zaustavio: { $error }
helper-pipe-failed = Meet Luft ne može komunicirati sa svojim pomoćnim programom: { $error }
helper-pipe-hijacked = { $pipe } je otvorio netko drugi, a ne pomoćni program aplikacije Meet Luft
helper-record-not-saved = Meet Luft nije mogao zabilježiti šta je napravio: { $error }
helper-no-room-yet = Prvo napravite prostor za Luft.
helper-not-ready-linux = Prvo pripremite Luft.
helper-not-ready-to-start-windows = Luft još nije spreman za pokretanje. Prvo napravite prostor za njega.
helper-not-ready-to-start-linux = Luft još nije spreman za pokretanje. Prvo ga pripremite.
helper-update-unfinished = Ažuriranje Lufta nije završeno. Prvo ga ponovo ažurirajte.
helper-room-too-small = Luftu treba više prostora od toga.
helper-room-shortfall = Windows može ustupiti { $available } GB, a Luftu treba { $needed } GB.
helper-box-shortfall = Windows može ustupiti još { $available } GB, a za odabrano je potrebno { $needed } GB.
helper-bluetooth-unreadable = Postavke Bluetootha u Windowsu nisu se mogle otvoriti
helper-registry-not-opened = Nije moguće otvoriti { $key }: { $error }
helper-registry-not-changed = Nije moguće promijeniti { $value }: { $error }
helper-registry-not-saved = Nije moguće sačuvati { $file }: { $error }
helper-restart-failed = Računar se nije ponovo pokrenuo
helper-windows-restart-failed = Windows se nije ponovo pokrenuo: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ovaj računar se ne pokreće s UEFI-jem
firmware-variable-unreadable = Nije moguće pročitati { $name } iz firmvera: { $error }
firmware-variable-not-saved = Nije moguće sačuvati { $name } u firmver: { $error }
firmware-entries-full = U firmveru nema mjesta za još jedan unos za pokretanje
firmware-entry-kept = Windows je zadržao unos za pokretanje { $entry }

## Errors about drives and partitions

drive-list-failed = Nije moguće prikazati spisak diskova: { $error }
drive-of-path-unknown = Nije moguće utvrditi na kojem je disku { $path }
drive-windows-folder-missing = Folder Windowsa nije pronađen
drive-windows-drive-missing = Disk Windowsa nije pronađen
drive-windows-drive-missing-because = Disk Windowsa nije pronađen: { $error }
drive-windows-partition-missing = Particija Windowsa nije pronađena
drive-volume-missing = Volumen { $path } nije pronađen
drive-storage-error = { $what } (greška pohrane u Windowsu { $code })
drive-shrink-size-unknown = Windows nije mogao utvrditi koliko se njegova particija može smanjiti
drive-grow-size-unknown = Windows nije mogao utvrditi koliko se njegova particija može povećati
drive-resize-failed = Windows nije mogao promijeniti veličinu svoje particije
drive-create-failed = Windows nije mogao napraviti particiju za Luft
drive-hide-failed = Windows nije mogao sakriti novu particiju iz File Explorera
drive-format-failed = Windows nije mogao formatirati novu particiju
drive-remove-failed = Windows nije mogao ukloniti jednu od particija Lufta
drive-new-partition-missing = Nova particija nije pronađena
drive-new-partition-no-volume = Nova particija nema volumen
drive-start-no-guid = Particija za pokretanje nema GUID
drive-live-no-guid = Particija za pokretanje Lufta nema GUID
drive-box-no-guid = Kutija za selidbu nema GUID
drive-guid-unreadable = GUID particije nije čitljiv
drive-not-gpt = Tablica particija diska nije GPT
drive-start-no-volume = Particija za pokretanje nema volumen
drive-live-no-volume = Particija Lufta nema volumen
drive-new-live-no-volume = Nova particija Lufta nema volumen
drive-partitions-not-noted = Particija Lufta nema u bilješkama aplikacije Meet Luft
drive-partitions-gone = Particije Lufta su nestale
drive-partition-gone = Jedna je particija nestala
drive-start-partition-foreign = Particiju za pokretanje Lufta nije napravio Meet Luft
drive-start-partition-gone = Particije za pokretanje Lufta više nema
drive-start-partition-not-listed = Particije za pokretanje Lufta nema u tablici particija
drive-no-esp = Ovaj računar nema particiju sistema EFI
drive-esp-full = Particija sistema EFI previše je puna za fajlove za pokretanje Lufta.
drive-esp-not-opened = Particija sistema EFI nije se mogla otvoriti
drive-esp-file-unreadable = Fajl { $file } na particiji sistema EFI nije čitljiv
drive-esp-no-drive = Particija sistema EFI nema disk
drive-esp-no-guid = Particija sistema EFI nema GUID
drive-no-uuid = Disk na kojem se čuva Luft nema UUID
drive-folder-unreadable = Luft se ne može pokrenuti s diska na kojem su vaši fajlovi.
drive-folder-not-startable = S foldera { $folder } nije moguće pokretanje

## Errors while getting Luft

live-no-home-folder = Nema ličnog foldera u kojem bi se čuvao Luft
live-no-app-data-folder = Nema foldera lokalnih podataka aplikacija u kojem bi se čuvao Luft
live-pointer-unreadable = Najnoviji Luft nije čitljiv
live-not-published = Luft tamo nije objavljen
live-checksum-unreadable = Fajl kontrolnog zbira nije čitljiv
live-checksum-not-read = Kontrolni zbir Lufta nije se mogao pročitati: { $error }
live-download-damaged = Preuzimanje se usput oštetilo. Pokušajte ponovo.
live-download-incomplete = U preuzetom Luftu nedostaje { $file }
live-download-not-resumable = Server ne može nastaviti preuzimanje
live-not-signed = { $iso } nije potpisan
live-signature-unreadable = Potpis fajla { $iso } nije čitljiv
live-signature-wrong-key = { $iso } nije potpisao Lantharos
live-signature-other-iso = Potpis je za { $signed }, a ne za { $iso }
live-iso-out-of-order = Fajlovi u ISO-u nisu poredani onako kako ih Meet Luft može pročitati
live-iso-not-iso = Ovo nije ISO slika
live-iso-no-root = ISO nema korijensku mapu
live-iso-no-joliet = ISO nema nazive Joliet
live-not-removed = { $path } nije se moglo ukloniti: { $error }

## Errors while making a USB stick

stick-gone = USB fleša više nema. Ponovo ga priključite i odaberite.
stick-too-small = Luft ne stane na ovaj fleš. Upotrijebite fleš od 4 GB ili više.
stick-damaged = ISO se ne podudara sa svojim kontrolnim zbirom. Možda se oštetio pri preuzimanju.
stick-read-back-differs = Fleš pri ponovnom čitanju nije vratio ono što je na njega zapisano. Možda je istrošen, pa pokušajte s drugim.
stick-download-unavailable = Luft se trenutno ne može preuzeti: { $error }
stick-download-failed = Luft se nije mogao preuzeti: { $error }
stick-checksum-unreadable = Kontrolni zbir ISO-a ne može se pročitati: { $error }
stick-file-unreadable = { $path } ne može se pročitati: { $error }
stick-iso-unreadable = ISO se ne može pročitati: { $error }
stick-iso-no-name = ISO nema naziv
stick-iso-ended-early = ISO je završio prerano
stick-iso-already-there = { $name } je već na flešu.
stick-no-room = Na flešu nema mjesta za Luft. Prvo na njemu oslobodite { $size } MB.
stick-older-not-removed = Stariji Luft nije se mogao ukloniti: { $error }
stick-copy-stopped = Kopiranje Lufta na fleš je zaustavljeno: { $error }
stick-not-opened = Fleš se nije mogao otvoriti: { $error }
stick-write-stopped = Zapisivanje na fleš je zaustavljeno: { $error }
stick-not-synced = Fleš nije primio sve: { $error }
stick-read-back-failed = Fleš se nije mogao ponovo pročitati: { $error }
stick-in-use = Fleš se još koristi: { $error }
stick-device-in-use = { $device } se još koristi: { $error }
stick-volume-not-opened = Volumen fleša nije se mogao otvoriti: { $error }
stick-volume-in-use = Fleš se još koristi. Zatvorite ono što na njemu ima otvorene fajlove i pokušajte ponovo ({ $error })
stick-not-dismounted = Windows nije mogao otpustiti fleš: { $error }
stick-not-cleared = Windows nije mogao očistiti fleš: { $error }
stick-not-refreshed = Windows nije mogao ponovo pregledati fleš: { $error }
stick-not-ventoy = Ovaj fleš više ne koristi Ventoy.
stick-ventoy-not-opened = Particija Ventoya nije se mogla otvoriti: { $error }
stick-ventoy-not-opened-windows = Windows ne može otvoriti particiju Ventoya
stick-udisks-missing = Meet Luft za korištenje fleša treba UDisks: { $error }
