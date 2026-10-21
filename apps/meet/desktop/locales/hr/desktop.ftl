## What Meet Luft finds when it checks a computer

check-processor-x64 = 64-bitni procesor Intel ili AMD
check-processor-x64-detail = Luft na njemu radi.
check-processor-arm = Procesor Arm
check-processor-arm-detail = Luft zasad radi samo na procesorima Intel i AMD.
check-processor-32-bit-windows = 32-bitni Windows
check-processor-32-bit-system = 32-bitni sustav
check-processor-32-bit-detail = Luftu je potreban 64-bitni procesor Intel ili AMD.
check-startup-uefi = Pokreće se s UEFI-jem
check-startup-uefi-windows = Luft se pokreće na isti suvremeni način.
check-startup-uefi-linux = Luft dodaje vlastiti unos za pokretanje, a { $system } se i dalje pokreće kao i sada.
check-startup-bios = Pokreće se u starom načinu BIOS-a
check-startup-bios-windows = Luftu je potreban UEFI. Windows može prijeći pomoću alata MBR2GPT, a zatim se UEFI može uključiti u postavkama firmvera.
check-startup-bios-linux = Luftu je potreban UEFI. Uključite ga u postavkama firmvera, zajedno sa sustavom koji je već ovdje, a zatim ponovno provjerite.
check-startup-mbr = Disk koristi staru tablicu particija
check-startup-mbr-windows = Luftu je potreban disk s GPT-om. Windows ga može pretvoriti pomoću alata MBR2GPT bez gubitka datoteka.
check-startup-mbr-linux = Luftu je za pokretanje potreban disk s GPT-om.
check-startup-no-esp = Nema particije sustava EFI
check-startup-no-esp-detail = Luft svoje datoteke za pokretanje dodaje uz one koje su već na particiji sustava EFI, a nje nema.
check-startup-esp-full = Particija sustava EFI je puna
check-startup-esp-full-detail = Luftu je ondje potrebno { $size } MB za datoteke za pokretanje. Prostor obično zauzimaju stare jezgre ili unosi za pokretanje.
check-folder-fine = Particije se ne mijenjaju
check-folder-fine-detail = Luft se čuva kao datoteka na vašem disku { $filesystem } i odande se pokreće.
check-folder-encrypted = Vaše su datoteke na šifriranom disku
check-folder-encrypted-detail = Luft se zasad ne može pokrenuti sa šifriranog diska. Za isprobavanje upotrijebite USB memoriju.
check-folder-combined = Vaše su datoteke na više od jedne particije
check-folder-combined-detail = Luft se zasad ne može pokrenuti s LVM-a ni RAID-a. Za isprobavanje upotrijebite USB memoriju.
check-folder-filesystem = Luft se ne može pokrenuti s datotečnog sustava { $filesystem }
check-folder-filesystem-detail = Pokreće se s diskova ext4, btrfs i XFS. Za isprobavanje upotrijebite USB memoriju.
check-space-free = Slobodno: { $size } GB
check-space-free-linux = Dok ga isprobavate, Luft zauzima oko { $size } GB.
check-space-up-to = Do { $size } GB za Luft
check-space-up-to-detail = Windows zadržava svoje datoteke i prostor za rast.
check-space-free-already = Od toga je { $size } GB već slobodno, pa Windows ustupa manje.
check-space-other-drive = Za njega ima mjesta na disku { $drive }.
check-space-erase-drive = Za njega ima mjesta na disku { $drive }, nakon što se taj disk izbriše.
check-space-short = Nema dovoljno slobodnog prostora
check-space-short-windows = Luftu treba oko { $needed } GB koje Windows može ustupiti. Oslobodite { $missing } GB u sustavu Windows, na primjer Čišćenjem diska, a zatim ponovno provjerite.
check-space-short-linux = Luftu za pokretanje treba oko { $needed } GB. Oslobodite { $missing } GB, a zatim ponovno provjerite.
check-system-replaceable = Luft može doći na njegovo mjesto i zadržati vaše datoteke, račun i postavke.
check-system-single = Vaše datoteke dijele particiju sa sustavom, pa zamjena uz zadržavanje datoteka zasad nije podržana. Isprobavanje i instalacija Lufta rade.
check-system-encrypted = Sustav je šifriran, pa zamjena uz zadržavanje datoteka zasad nije podržana.
check-system-unknown = Disk sustava raspoređen je na način koji Luft zasad ne može zamijeniti uz zadržavanje vaših datoteka.
check-encryption-off = Windows nije šifriran
check-encryption-off-detail = Instaliraj Luft može pročitati njegove postavke i vaše Bluetooth uređaje.
check-encryption-on = Windows je šifriran BitLockerom
check-encryption-on-detail = To nije problem. Windows sam stvara prostor, a Meet Luft prenosi ono što Luft ne može pročitati sa zaključanog diska. Za svaki slučaj držite ključ za oporavak pri ruci.
check-encryption-changing = BitLocker još šifrira ili dešifrira
check-encryption-changing-detail = Pričekajte da Windows završi, a zatim se vratite. Napredak možete vidjeti u Postavkama, pod Šifriranje uređaja.
check-fast-startup-on = Brzo pokretanje je uključeno
check-fast-startup-on-detail = Windows umjesto isključivanja prelazi u hibernaciju, zbog čega mu disk ostaje zaključan. Meet Luft nudi da ga isključi prije instalacije.
check-fast-startup-off = Brzo pokretanje je isključeno
check-fast-startup-off-detail = Windows se potpuno isključuje.
check-secure-boot-on = Secure Boot je uključen
check-secure-boot-on-detail = Može ostati uključen. Luft jednom, na plavom zaslonu, traži da doda svoj ključ.
check-secure-boot-off = Secure Boot je isključen
check-secure-boot-off-detail = Luft radi i bez njega, no igre sa zaštitom od varanja ga trebaju. { $turningOn }
check-secure-boot-restart-into = Meet Luft može ponovno pokrenuti računalo u postavke firmvera, gdje se nalazi pod { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft može ponovno pokrenuti računalo u postavke firmvera, gdje se obično nalazi pod Security ili Boot.
check-secure-boot-turn-on = Da biste ga uključili, ponovno pokrenite računalo i pritisnite { $key } kad se pojavi logotip { $maker }, a zatim idite na { $place }.
check-secure-boot-turn-on-anywhere = Da biste ga uključili, otvorite postavke firmvera dok se računalo pokreće i potražite pod Security ili Boot.

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
check-firmware-key-volume-up = tipku za pojačavanje glasnoće

## More of the computer's hardware

check-tpm-detail = Šifrirani Luft može se sam otključati pri pokretanju računala.
check-tpm-missing = Nema TPM-a 2.0
check-tpm-missing-detail = Ako šifrirate Luft, pri svakom će pokretanju tražiti lozinku za šifriranje.
check-graphics = Grafika
check-graphics-detail = Radi odmah.
check-graphics-nvidia = Luft se instalira s NVIDIA-inim upravljačkim programom.
check-wifi-missing = Nema Wi-Fija
check-wifi-missing-detail = U Luftu koristite mrežni kabel ili ništa.
check-wifi-detail = Radi u Luftu.
check-wifi-broadcom = Neki Broadcomovi Wi-Fi čipovi trebaju upravljački program koji Luft ne sadrži. Držite pri ruci mrežni kabel ili telefon za USB dijeljenje veze.
check-start-entries = { $count ->
    [one] { $count } stari unos za pokretanje
    [few] { $count } stara unosa za pokretanje
   *[other] { $count } starih unosa za pokretanje
}
check-start-entries-detail = { $count ->
    [one] { $names } upućuje na sustav kojeg više nema na ovom računalu. Može se ukloniti.
    [few] { $names } upućuju na sustave kojih više nema na ovom računalu. Mogu se ukloniti.
   *[other] { $names } upućuju na sustave kojih više nema na ovom računalu. Mogu se ukloniti.
}
check-download-unavailable = Luft se trenutačno ne može preuzeti
check-download-unavailable-detail = Meet Luft preuzima oko 3 GB. Provjerite jeste li povezani s internetom i ponovno provjerite ili upotrijebite ISO Lufta koji već imate.

## Choosing a Luft ISO file

iso-dialog-title = Odaberite ISO Lufta
iso-dialog-filter = ISO Lufta

## Saving the logs from trying Luft

logs-file-name = Zapisnici Lufta { $name }
logs-no-desktop = Meet Luft nije pronašao vašu radnu površinu
logs-not-saved = Meet Luft nije mogao spremiti zapisnike iz isprobavanja Lufta: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Pomoćni program aplikacije Meet Luft nije se pokrenuo: { $error }
helper-not-allowed = Meet Luft nije dobio dopuštenje za rad na disku
helper-stopped = Pomoćni program aplikacije Meet Luft se zaustavio
helper-stopped-because = Pomoćni program aplikacije Meet Luft se zaustavio: { $error }
helper-pipe-failed = Meet Luft ne može komunicirati sa svojim pomoćnim programom: { $error }
helper-pipe-hijacked = { $pipe } je otvorio netko drugi, a ne pomoćni program aplikacije Meet Luft
helper-record-not-saved = Meet Luft nije mogao zabilježiti što je napravio: { $error }
helper-no-room-yet = Najprije stvorite prostor za Luft.
helper-not-ready-linux = Najprije pripremite Luft.
helper-not-ready-to-start-windows = Luft još nije spreman za pokretanje. Najprije stvorite prostor za njega.
helper-not-ready-to-start-linux = Luft još nije spreman za pokretanje. Najprije ga pripremite.
helper-update-unfinished = Ažuriranje Lufta nije dovršeno. Najprije ga ponovno ažurirajte.
helper-room-too-small = Luftu treba više prostora od toga.
helper-room-shortfall = Windows može ustupiti { $available } GB, a Luftu treba { $needed } GB.
helper-gap-shortfall = Taj prostor ima { $available } GB, a Luftu treba { $needed } GB.
helper-place-gone = Taj prostor više nije slobodan. Ponovno provjerite gdje Luft stane.
helper-box-shortfall = Windows može ustupiti još { $available } GB, a za odabrano je potrebno { $needed } GB.
helper-box-room-shortfall = Prostor Lufta može ustupiti { $available } GB, a za odabrano je potrebno { $needed } GB.
helper-bluetooth-unreadable = Postavke Bluetootha u sustavu Windows nisu se mogle otvoriti
helper-registry-not-opened = Nije moguće otvoriti { $key }: { $error }
helper-registry-not-changed = Nije moguće promijeniti { $value }: { $error }
helper-registry-not-saved = Nije moguće spremiti { $file }: { $error }
helper-restart-failed = Računalo se nije ponovno pokrenulo
helper-windows-restart-failed = Windows se nije ponovno pokrenuo: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Ovo se računalo ne pokreće s UEFI-jem
firmware-variable-unreadable = Nije moguće pročitati { $name } iz firmvera: { $error }
firmware-variable-not-saved = Nije moguće spremiti { $name } u firmver: { $error }
firmware-entries-full = U firmveru nema mjesta za još jedan unos za pokretanje
firmware-entry-kept = Windows je zadržao unos za pokretanje { $entry }

## Errors about drives and partitions

drive-list-failed = Nije moguće prikazati popis diskova: { $error }
drive-of-path-unknown = Nije moguće utvrditi na kojem je disku { $path }
drive-windows-folder-missing = Mapa sustava Windows nije pronađena
drive-windows-drive-missing = Disk sustava Windows nije pronađen
drive-windows-drive-missing-because = Disk sustava Windows nije pronađen: { $error }
drive-windows-partition-missing = Particija sustava Windows nije pronađena
drive-volume-missing = Volumen { $path } nije pronađen
drive-storage-error = { $what } (pogreška pohrane sustava Windows { $code })
drive-shrink-size-unknown = Windows nije mogao utvrditi koliko se njegova particija može smanjiti
drive-resize-failed = Windows nije mogao promijeniti veličinu svoje particije
drive-create-failed = Windows nije mogao izraditi particiju za Luft
drive-hide-failed = Windows nije mogao sakriti novu particiju iz Eksplorera za datoteke
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
drive-gone = Jedan je disk nestao
drive-erase-failed = Windows nije mogao izbrisati disk
drive-erased-no-room = Na izbrisanom disku nema mjesta za Luft
drive-start-partition-foreign = Particiju za pokretanje Lufta nije izradio Meet Luft
drive-start-partition-gone = Particije za pokretanje Lufta više nema
drive-start-partition-not-listed = Particije za pokretanje Lufta nema u tablici particija
drive-no-esp = Ovo računalo nema particiju sustava EFI
drive-esp-full = Particija sustava EFI previše je puna za datoteke za pokretanje Lufta.
drive-esp-not-opened = Particija sustava EFI nije se mogla otvoriti
drive-esp-file-unreadable = Datoteka { $file } na particiji sustava EFI nije čitljiva
drive-esp-no-drive = Particija sustava EFI nema disk
drive-esp-no-guid = Particija sustava EFI nema GUID
drive-no-uuid = Disk na kojem se čuva Luft nema UUID
drive-folder-unreadable = Luft se ne može pokrenuti s diska na kojem su vaše datoteke.
drive-folder-not-startable = S mape { $folder } nije moguće pokretanje

## Errors while changing Luft once it's installed

luft-gone = Lufta više nema na ovom računalu
luft-not-resizable = Veličina Lufta trenutačno se ne može promijeniti iz sustava Windows
luft-size-not-allowed = Luft ne može biti te veličine
luft-space-promised = Taj je prostor odvojen za Luft. Najprije otkažite promjenu.
luft-no-start-entry = Unos za pokretanje Lufta nije pronađen

## Errors while getting Luft

live-no-home-folder = Nema osobne mape u kojoj bi se čuvao Luft
live-no-app-data-folder = Nema mape lokalnih podataka aplikacija u kojoj bi se čuvao Luft
live-pointer-unreadable = Najnoviji Luft nije čitljiv
live-not-published = Luft ondje nije objavljen
live-checksum-unreadable = Datoteka kontrolnog zbroja nije čitljiva
live-checksum-not-read = Kontrolni zbroj Lufta nije se mogao pročitati: { $error }
live-download-damaged = Preuzimanje se usput oštetilo. Pokušajte ponovno.
live-download-incomplete = U preuzetom Luftu nedostaje { $file }
live-download-not-resumable = Poslužitelj ne može nastaviti preuzimanje
live-not-signed = { $iso } nije potpisan
live-signature-unreadable = Potpis datoteke { $iso } nije čitljiv
live-signature-wrong-key = { $iso } nije potpisao Lantharos
live-signature-other-iso = Potpis je za { $signed }, a ne za { $iso }
live-iso-out-of-order = Datoteke u ISO-u nisu poredane onako kako ih Meet Luft može pročitati
live-iso-not-iso = Ovo nije ISO slika
live-iso-no-root = ISO nema korijensku mapu
live-iso-no-joliet = ISO nema nazive Joliet
live-not-removed = { $path } nije se moglo ukloniti: { $error }

## Errors while making a USB stick

stick-gone = USB memorije više nema. Ponovno je priključite i odaberite.
stick-too-small = Luft ne stane na ovu memoriju. Upotrijebite memoriju od 4 GB ili više.
stick-damaged = ISO se ne podudara sa svojim kontrolnim zbrojem. Možda se oštetio pri preuzimanju.
stick-read-back-differs = Memorija pri ponovnom čitanju nije vratila ono što je na nju zapisano. Možda je istrošena, pa pokušajte s drugom.
stick-download-unavailable = Luft se trenutačno ne može preuzeti: { $error }
stick-download-failed = Luft se nije mogao preuzeti: { $error }
stick-checksum-unreadable = Kontrolni zbroj ISO-a ne može se pročitati: { $error }
stick-file-unreadable = { $path } ne može se pročitati: { $error }
stick-iso-unreadable = ISO se ne može pročitati: { $error }
stick-iso-no-name = ISO nema naziv
stick-iso-ended-early = ISO je završio prerano
stick-iso-already-there = { $name } je već na memoriji.
stick-no-room = Na memoriji nema mjesta za Luft. Najprije na njoj oslobodite { $size } MB.
stick-older-not-removed = Stariji Luft nije se mogao ukloniti: { $error }
stick-copy-stopped = Kopiranje Lufta na memoriju je zaustavljeno: { $error }
stick-not-opened = Memorija se nije mogla otvoriti: { $error }
stick-write-stopped = Zapisivanje na memoriju je zaustavljeno: { $error }
stick-not-synced = Memorija nije primila sve: { $error }
stick-read-back-failed = Memorija se nije mogla ponovno pročitati: { $error }
stick-in-use = Memorija se još koristi: { $error }
stick-device-in-use = { $device } se još koristi: { $error }
stick-volume-not-opened = Volumen memorije nije se mogao otvoriti: { $error }
stick-volume-in-use = Memorija se još koristi. Zatvorite ono što na njoj ima otvorene datoteke i pokušajte ponovno ({ $error })
stick-not-dismounted = Windows nije mogao otpustiti memoriju: { $error }
stick-not-cleared = Windows nije mogao očistiti memoriju: { $error }
stick-not-refreshed = Windows nije mogao ponovno pregledati memoriju: { $error }
stick-not-ventoy = Ova memorija više ne koristi Ventoy.
stick-ventoy-not-opened = Particija Ventoyja nije se mogla otvoriti: { $error }
stick-ventoy-not-opened-windows = Windows ne može otvoriti particiju Ventoyja
stick-udisks-missing = Meet Luft za korištenje memorije treba UDisks: { $error }
