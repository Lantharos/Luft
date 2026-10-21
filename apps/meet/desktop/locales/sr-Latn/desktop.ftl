## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitni procesor Intel ili AMD
check-processor-x64-detail = Luft radi na njemu.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft za sada radi samo na procesorima Intel i AMD.
check-processor-32-bit-windows = 32-bitni Windows
check-processor-32-bit-system = 32-bitni sistem
check-processor-32-bit-detail = Sistemu Luft je potreban 64-bitni procesor Intel ili AMD.
check-startup-uefi = Pokreće se pomoću UEFI-ja
check-startup-uefi-windows = Luft se pokreće na isti savremeni način.
check-startup-uefi-linux = Luft dodaje sopstvenu stavku za pokretanje, a sistem { $system } se i dalje pokreće kao i sada.
check-startup-bios = Pokreće se u starom BIOS režimu
check-startup-bios-windows = Sistemu Luft je potreban UEFI. Windows može da pređe pomoću alatke MBR2GPT, a zatim može da se uključi UEFI u podešavanjima firmvera.
check-startup-bios-linux = Sistemu Luft je potreban UEFI. Uključite ga u podešavanjima firmvera, zajedno sa sistemom koji je već ovde, pa ponovo proverite.
check-startup-mbr = Disk koristi staru tabelu particija
check-startup-mbr-windows = Sistemu Luft je potreban GPT disk. Windows može da ga pretvori pomoću alatke MBR2GPT bez gubitka datoteka.
check-startup-mbr-linux = Sistemu Luft je za pokretanje potreban GPT disk.
check-startup-no-esp = Nema EFI sistemske particije
check-startup-no-esp-detail = Luft dodaje svoje datoteke za pokretanje pored onih koje su već na EFI sistemskoj particiji, a nje nema.
check-startup-esp-full = EFI sistemska particija je puna
check-startup-esp-full-detail = Sistemu Luft je tamo potrebno { $size } MB za datoteke za pokretanje. Prostor obično zauzimaju stara jezgra ili stavke za pokretanje.
check-folder-fine = Particije se ne menjaju
check-folder-fine-detail = Luft se čuva kao datoteka na vašem { $filesystem } disku i odatle se pokreće.
check-folder-encrypted = Vaše datoteke su na šifrovanom disku
check-folder-encrypted-detail = Luft za sada ne može da se pokrene sa šifrovanog diska. Za isprobavanje upotrebite USB fleš.
check-folder-combined = Vaše datoteke su na više od jedne particije
check-folder-combined-detail = Luft za sada ne može da se pokrene sa LVM-a ni RAID-a. Za isprobavanje upotrebite USB fleš.
check-folder-filesystem = Luft ne može da se pokrene sa sistema datoteka { $filesystem }
check-folder-filesystem-detail = Pokreće se sa diskova ext4, btrfs i XFS. Za isprobavanje upotrebite USB fleš.
check-space-free = Slobodno: { $size } GB
check-space-free-linux = Dok ga isprobavate, Luft zauzima oko { $size } GB.
check-space-up-to = Do { $size } GB za Luft
check-space-up-to-detail = Windows zadržava svoje datoteke i prostor za rast.
check-space-short = Nema dovoljno slobodnog prostora
check-space-short-windows = Sistemu Luft treba oko { $needed } GB koje Windows može da ustupi. Oslobodite { $missing } GB u sistemu Windows, na primer pomoću Čišćenja diska, pa ponovo proverite.
check-space-short-linux = Sistemu Luft za pokretanje treba oko { $needed } GB. Oslobodite { $missing } GB, pa ponovo proverite.
check-system-replaceable = Luft može da zauzme njegovo mesto i zadrži vaše datoteke, nalog i podešavanja.
check-system-single = Vaše datoteke dele particiju sa sistemom, pa zamena uz zadržavanje datoteka za sada nije podržana. Isprobavanje i instaliranje sistema Luft rade.
check-system-encrypted = Sistem je šifrovan, pa zamena uz zadržavanje datoteka za sada nije podržana.
check-system-unknown = Disk sistema je raspoređen na način koji Luft za sada ne može da zameni uz zadržavanje vaših datoteka.
check-encryption-off = Windows nije šifrovan
check-encryption-off-detail = Instaliraj Luft može da pročita njegova podešavanja i vaše Bluetooth uređaje.
check-encryption-on = Windows je šifrovan pomoću BitLocker-a
check-encryption-on-detail = To nije problem. Windows sam pravi prostor, a Meet Luft prenosi ono što Luft ne može da pročita sa zaključanog diska. Za svaki slučaj držite ključ za oporavak pri ruci.
check-encryption-changing = BitLocker još šifruje ili dešifruje
check-encryption-changing-detail = Sačekajte da Windows završi, pa se vratite. Napredak možete da vidite u Podešavanjima, pod Šifrovanje uređaja.
check-fast-startup-on = Brzo pokretanje je uključeno
check-fast-startup-on-detail = Windows umesto isključivanja prelazi u hibernaciju, zbog čega mu disk ostaje zaključan. Meet Luft nudi da ga isključi pre instaliranja.
check-fast-startup-off = Brzo pokretanje je isključeno
check-fast-startup-off-detail = Windows se potpuno isključuje.
check-secure-boot-on = Secure Boot je uključen
check-secure-boot-on-detail = Može da ostane uključen. Luft jednom, na plavom ekranu, traži da doda svoj ključ.
check-secure-boot-off = Secure Boot je isključen
check-secure-boot-off-detail = Luft radi i bez njega, ali igre sa zaštitom od varanja ga zahtevaju. { $turningOn }
check-secure-boot-restart-into = Meet Luft može ponovo da pokrene računar u podešavanja firmvera, gde se nalazi pod { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft može ponovo da pokrene računar u podešavanja firmvera, gde se obično nalazi pod Security ili Boot.
check-secure-boot-turn-on = Da biste ga uključili, ponovo pokrenite računar i pritisnite { $key } kad se pojavi logotip { $maker }, pa idite na { $place }.
check-secure-boot-turn-on-anywhere = Da biste ga uključili, otvorite podešavanja firmvera dok se računar pokreće i potražite pod Security ili Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, zatim Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, zatim Secure Boot
check-firmware-place-security-or-advanced = Security ili Advanced, zatim Secure Boot Configuration
check-firmware-place-security-or-boot = Security ili Boot, zatim Secure Boot
check-firmware-place-boot = Boot, zatim Secure Boot
check-firmware-place-settings = Settings, zatim Security, zatim Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 na ThinkPad-u)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ili Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = dugme za pojačavanje zvuka

## More of the computer's hardware

check-tpm-detail = Šifrovani Luft može sam da se otključa pri pokretanju računara.
check-tpm-missing = Nema TPM 2.0
check-tpm-missing-detail = Ako šifrujete Luft, pri svakom pokretanju će tražiti lozinku za šifrovanje.
check-graphics = Grafika
check-graphics-detail = Radi odmah.
check-graphics-nvidia = Luft se instalira sa NVIDIA-inim drajverom.
check-wifi-missing = Nema Wi-Fi mreže
check-wifi-missing-detail = U sistemu Luft koristite mrežni kabl ili ništa.
check-wifi-detail = Radi u sistemu Luft.
check-wifi-broadcom = Neki Broadcom Wi-Fi čipovi traže drajver koji Luft ne sadrži. Držite pri ruci mrežni kabl ili telefon za USB deljenje veze.
check-start-entries = { $count ->
    [one] { $count } stara stavka za pokretanje
    [few] { $count } stare stavke za pokretanje
   *[other] { $count } starih stavki za pokretanje
}
check-start-entries-detail = { $count ->
    [one] { $names } upućuje na sistem kojeg više nema na ovom računaru. Može da se počisti.
    [few] { $names } upućuju na sisteme kojih više nema na ovom računaru. Mogu da se počiste.
   *[other] { $names } upućuju na sisteme kojih više nema na ovom računaru. Mogu da se počiste.
}
check-download-unavailable = Luft trenutno ne može da se preuzme
check-download-unavailable-detail = Meet Luft preuzima oko 3 GB. Proverite da li ste povezani na internet i ponovo proverite ili upotrebite ISO za Luft koji već imate.

## Choosing a Luft ISO file

iso-dialog-title = Izaberite ISO za Luft
iso-dialog-filter = ISO za Luft

## Saving the logs from trying Luft

logs-file-name = Luft evidencije { $name }
logs-no-desktop = Aplikacija Meet Luft nije pronašla vašu radnu površinu
logs-not-saved = Aplikacija Meet Luft nije mogla da sačuva evidencije iz isprobavanja sistema Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomoćni program aplikacije Meet Luft se nije pokrenuo: { $error }
helper-not-allowed = Aplikacija Meet Luft nije dobila dozvolu za rad na disku
helper-stopped = Pomoćni program aplikacije Meet Luft se zaustavio
helper-stopped-because = Pomoćni program aplikacije Meet Luft se zaustavio: { $error }
helper-pipe-failed = Aplikacija Meet Luft ne može da komunicira sa svojim pomoćnim programom: { $error }
helper-pipe-hijacked = { $pipe } je otvorio neko drugi, a ne pomoćni program aplikacije Meet Luft
helper-record-not-saved = Aplikacija Meet Luft nije mogla da zabeleži šta je napravila: { $error }
helper-no-room-yet = Prvo napravite prostor za Luft.
helper-not-ready-linux = Prvo pripremite Luft.
helper-not-ready-to-start-windows = Luft još nije spreman za pokretanje. Prvo napravite prostor za njega.
helper-not-ready-to-start-linux = Luft još nije spreman za pokretanje. Prvo ga pripremite.
helper-update-unfinished = Ažuriranje sistema Luft nije završeno. Prvo ga ponovo ažurirajte.
helper-room-too-small = Sistemu Luft treba više prostora od toga.
helper-room-shortfall = Windows može da ustupi { $available } GB, a sistemu Luft treba { $needed } GB.
helper-box-shortfall = Windows može da ustupi još { $available } GB, a za izabrano je potrebno { $needed } GB.
helper-bluetooth-unreadable = Bluetooth podešavanja sistema Windows nisu mogla da se otvore
helper-registry-not-opened = Nije moguće otvoriti { $key }: { $error }
helper-registry-not-changed = Nije moguće promeniti { $value }: { $error }
helper-registry-not-saved = Nije moguće sačuvati { $file }: { $error }
helper-restart-failed = Računar se nije ponovo pokrenuo
helper-windows-restart-failed = Windows se nije ponovo pokrenuo: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ovaj računar se ne pokreće pomoću UEFI-ja
firmware-variable-unreadable = Nije moguće pročitati { $name } iz firmvera: { $error }
firmware-variable-not-saved = Nije moguće sačuvati { $name } u firmveru: { $error }
firmware-entries-full = U firmveru nema mesta za još jednu stavku za pokretanje
firmware-entry-kept = Windows je zadržao stavku za pokretanje { $entry }

## Errors about drives and partitions

drive-list-failed = Nije moguće prikazati listu diskova: { $error }
drive-of-path-unknown = Nije moguće utvrditi na kom disku je { $path }
drive-windows-folder-missing = Fascikla sistema Windows nije pronađena
drive-windows-drive-missing = Disk sistema Windows nije pronađen
drive-windows-drive-missing-because = Disk sistema Windows nije pronađen: { $error }
drive-windows-partition-missing = Particija sistema Windows nije pronađena
drive-volume-missing = Volumen { $path } nije pronađen
drive-storage-error = { $what } (greška skladišta u sistemu Windows { $code })
drive-shrink-size-unknown = Windows nije mogao da utvrdi koliko njegova particija može da se smanji
drive-grow-size-unknown = Windows nije mogao da utvrdi koliko njegova particija može da se poveća
drive-resize-failed = Windows nije mogao da promeni veličinu svoje particije
drive-create-failed = Windows nije mogao da napravi particiju za Luft
drive-hide-failed = Windows nije mogao da sakrije novu particiju iz Istraživača datoteka
drive-format-failed = Windows nije mogao da formatira novu particiju
drive-remove-failed = Windows nije mogao da ukloni jednu od particija sistema Luft
drive-new-partition-missing = Nova particija nije pronađena
drive-new-partition-no-volume = Nova particija nema volumen
drive-start-no-guid = Particija za pokretanje nema GUID
drive-live-no-guid = Particija sa koje se Luft pokreće nema GUID
drive-box-no-guid = Kutija za selidbu nema GUID
drive-guid-unreadable = GUID particije nije čitljiv
drive-not-gpt = Tabela particija diska nije GPT
drive-start-no-volume = Particija za pokretanje nema volumen
drive-live-no-volume = Particija sistema Luft nema volumen
drive-new-live-no-volume = Nova particija sistema Luft nema volumen
drive-partitions-not-noted = Particija sistema Luft nema u beleškama aplikacije Meet Luft
drive-partitions-gone = Particije sistema Luft su nestale
drive-partition-gone = Jedna particija je nestala
drive-start-partition-foreign = Particiju za pokretanje sistema Luft nije napravila aplikacija Meet Luft
drive-start-partition-gone = Particije za pokretanje sistema Luft više nema
drive-start-partition-not-listed = Particije za pokretanje sistema Luft nema u tabeli particija
drive-no-esp = Ovaj računar nema EFI sistemsku particiju
drive-esp-full = EFI sistemska particija je previše puna za datoteke za pokretanje sistema Luft.
drive-esp-not-opened = EFI sistemska particija nije mogla da se otvori
drive-esp-file-unreadable = Datoteka { $file } na EFI sistemskoj particiji nije čitljiva
drive-esp-no-drive = EFI sistemska particija nema disk
drive-esp-no-guid = EFI sistemska particija nema GUID
drive-no-uuid = Disk na kom se čuva Luft nema UUID
drive-folder-unreadable = Luft ne može da se pokrene sa diska na kom su vaše datoteke.
drive-folder-not-startable = Sa fascikle { $folder } nije moguće pokretanje

## Errors while getting Luft

live-no-home-folder = Nema lične fascikle u kojoj bi se čuvao Luft
live-no-app-data-folder = Nema fascikle lokalnih podataka aplikacija u kojoj bi se čuvao Luft
live-pointer-unreadable = Najnoviji Luft nije čitljiv
live-not-published = Luft tamo nije objavljen
live-checksum-unreadable = Datoteka kontrolnog zbira nije čitljiva
live-checksum-not-read = Kontrolni zbir sistema Luft nije mogao da se pročita: { $error }
live-download-damaged = Preuzimanje se usput oštetilo. Pokušajte ponovo.
live-download-incomplete = U preuzetom sistemu Luft nedostaje { $file }
live-download-not-resumable = Server ne može da nastavi preuzimanje
live-not-signed = Datoteka { $iso } nije potpisana
live-signature-unreadable = Potpis datoteke { $iso } nije čitljiv
live-signature-wrong-key = Datoteku { $iso } nije potpisao Lantharos
live-signature-other-iso = Potpis je za { $signed }, a ne za { $iso }
live-iso-out-of-order = Datoteke u ISO-u nisu poređane onako kako Meet Luft može da ih pročita
live-iso-not-iso = Ovo nije ISO slika
live-iso-no-root = ISO nema korensku fasciklu
live-iso-no-joliet = ISO nema Joliet nazive
live-not-removed = { $path } nije moglo da se ukloni: { $error }

## Errors while making a USB stick

stick-gone = USB fleša više nema. Ponovo ga priključite i izaberite.
stick-too-small = Luft ne staje na ovaj fleš. Upotrebite fleš od 4 GB ili više.
stick-damaged = ISO se ne podudara sa svojim kontrolnim zbirom. Možda se oštetio pri preuzimanju.
stick-read-back-differs = Fleš pri ponovnom čitanju nije vratio ono što je na njega upisano. Možda je istrošen, pa pokušajte sa drugim.
stick-download-unavailable = Luft trenutno ne može da se preuzme: { $error }
stick-download-failed = Luft nije mogao da se preuzme: { $error }
stick-checksum-unreadable = Kontrolni zbir ISO-a ne može da se pročita: { $error }
stick-file-unreadable = { $path } ne može da se pročita: { $error }
stick-iso-unreadable = ISO ne može da se pročita: { $error }
stick-iso-no-name = ISO nema naziv
stick-iso-ended-early = ISO se prerano završio
stick-iso-already-there = Datoteka { $name } je već na flešu.
stick-no-room = Na flešu nema mesta za Luft. Prvo na njemu oslobodite { $size } MB.
stick-older-not-removed = Stariji Luft nije mogao da se ukloni: { $error }
stick-copy-stopped = Kopiranje sistema Luft na fleš je zaustavljeno: { $error }
stick-not-opened = Fleš nije mogao da se otvori: { $error }
stick-write-stopped = Upisivanje na fleš je zaustavljeno: { $error }
stick-not-synced = Fleš nije primio sve: { $error }
stick-read-back-failed = Fleš nije mogao ponovo da se pročita: { $error }
stick-in-use = Fleš se još koristi: { $error }
stick-device-in-use = { $device } se još koristi: { $error }
stick-volume-not-opened = Volumen fleša nije mogao da se otvori: { $error }
stick-volume-in-use = Fleš se još koristi. Zatvorite ono što na njemu ima otvorene datoteke i pokušajte ponovo ({ $error })
stick-not-dismounted = Windows nije mogao da otpusti fleš: { $error }
stick-not-cleared = Windows nije mogao da očisti fleš: { $error }
stick-not-refreshed = Windows nije mogao ponovo da pregleda fleš: { $error }
stick-not-ventoy = Ovaj fleš više ne koristi Ventoy.
stick-ventoy-not-opened = Particija alatke Ventoy nije mogla da se otvori: { $error }
stick-ventoy-not-opened-windows = Windows ne može da otvori particiju alatke Ventoy
stick-udisks-missing = Aplikaciji Meet Luft je za korišćenje fleša potreban UDisks: { $error }
