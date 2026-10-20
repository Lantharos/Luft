## Errors shown in Install Luft and first-run setup

installer-not-allowed = Nemate dozvolu za ovo.
installer-stopped = Instaler je neočekivano stao.
installer-request-invalid = Zahtev nije ispravan: { $error }
installer-settings-invalid = Podešavanja nisu ispravna: { $error }
installer-busy = Luft se već instalira.
installer-account-exists = Nalog je već napravljen.

## Choosing what to install

installer-no-image = Nema slike { $variant } za instaliranje.
installer-read-failed = Čitanje „{ $path }“ nije uspelo
installer-parse-failed = Obrada „{ $path }“ nije uspela
installer-write-failed = Upisivanje „{ $path }“ nije uspelo

## Checking the destination

installer-drive-gone = Taj disk više nije povezan.
installer-drive-unusable = Luft ne može da se instalira na taj disk.
installer-system-gone = Taj sistem više ne postoji.
installer-system-unreplaceable = Luft još ne može da zameni sistem { $system }.
installer-drive-running = Luft se trenutno pokreće sa tog diska, pa on ne može da se izbriše.
installer-windows-unshrinkable = Windows na tom disku ne može da se smanji.
installer-size-wont-fit = Ta veličina ne staje pored sistema Windows.
installer-space-gone = Taj slobodan prostor više ne postoji.
installer-space-too-small = Taj slobodan prostor je premali za Luft.

## Account and regional settings

installer-user-name-invalid = To korisničko ime ne može da se koristi.
installer-full-name-invalid = Ime ne sme da sadrži dvotačke, zareze ni prelome reda.
installer-password-missing = Izaberite lozinku.
installer-account-not-saved = Novi nalog nije sačuvan
installer-account-missing = Novi nalog nedostaje
installer-regional-invalid = Ta regionalna podešavanja nisu ispravna.
installer-unknown-zone = Novi sistem ne poznaje vremensku zonu { $zone }.

## Installing

installer-esp-partition-failed = EFI sistemska particija nije mogla da se napravi
installer-startup-partition-failed = Particija za datoteke kojima se Luft pokreće nije mogla da se napravi
installer-root-partition-failed = Particija za Luft nije mogla da se napravi
installer-shrink-failed = Windows nije mogao da se smanji
installer-no-esp = Disk nema EFI sistemsku particiju
installer-no-root = Particija za Luft nije napravljena
installer-copy-failed = Luft nije mogao da se kopira
installer-no-deployment = Novi sistem nema instalaciju
installer-deployment-unnamed = Instalacija novog sistema nema naziv
installer-deployment-unopened = Novi sistem nije mogao da se otvori
installer-boot-menu-failed = Meni za pokretanje sistema Luft nije mogao da se smesti na EFI sistemsku particiju
installer-key-queue-failed = Secure Boot ključ sistema Luft nije mogao da se pripremi za sledeće ponovno pokretanje

## Replacing a Linux system

installer-leftovers-failed = Ostaci ranijeg pokušaja nisu mogli da se uklone
installer-default-failed = Luft nije mogao da postane sistem koji se pokreće
installer-relabel-failed = Vaše datoteke nisu mogle da se obeleže za Luft
installer-set-aside-failed = Stari sistem nije mogao da se skloni

## Things packed with Meet Luft

installer-box-unopened = Kutija za selidbu nije mogla da se otvori
installer-box-no-list = Kutija za selidbu nema spisak sadržaja
installer-unpack-failed = Raspakivanje „{ $path }“ nije uspelo
installer-wallpaper-unnamed = Pozadina nema naziv
