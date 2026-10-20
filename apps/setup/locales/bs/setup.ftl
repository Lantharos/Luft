## Buttons used across steps

setup-continue = Nastavi
setup-back = Nazad
setup-cancel = Otkaži
setup-not-now = Ne sada
setup-try-again = Pokušaj ponovo
setup-restart = Ponovo pokreni
setup-restart-now = Ponovo pokreni sada
setup-restart-later = Ponovo pokreni kasnije
setup-saving = Čuvanje…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Instaliranje Lufta
setup-installing-progress = Instaliranje, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Pretraži
setup-picker-no-match = Nema rezultata

## Welcome step: language, keyboard and time zone

setup-region-title = Dobro došli u Luft
setup-region-language = Jezik
setup-region-keyboard = Tastatura
setup-region-time-zone = Vremenska zona
setup-region-intro = Krenimo s postavljanjem. Odaberite jezik, tastaturu i vremensku zonu.
setup-region-intro-guessed-computer = Krenimo s postavljanjem. Ovo smo pretpostavili na osnovu vašeg računara, pa promijenite ono što ne odgovara.
setup-region-intro-guessed = Krenimo s postavljanjem. Pretpostavili smo { $guesses }, pa promijenite ono što ne odgovara.
setup-region-guess-from-computer = { $fields } na osnovu vašeg računara
setup-region-guess-from-network = { $fields } na osnovu vaše mreže
setup-region-field-language = jezik
setup-region-field-keyboard = tastaturu
setup-region-field-time-zone = vremensku zonu

## Where Luft goes

setup-destination-choose-title = Gdje instalirati Luft?
setup-destination-choose-description = Odaberite kako će Luft stati na ovaj računar. Ništa se ne mijenja dok ne potvrdite.
setup-destination-alongside-title = Napravite mjesta pored Windowsa
setup-destination-alongside-description = Windows se smanjuje da napravi prostor za Luft. Vaši fajlovi u Windowsu ostaju kakvi jesu.
setup-destination-whole-title = Odaberite disk
setup-destination-whole-description = Luft zauzima cijeli disk. Sve na njemu se briše.
setup-destination-custom-title = Odaberite prostor za Luft
setup-destination-custom-description = Uredite diskove po svom u aplikaciji Diskovi.
setup-destination-replace-title = Zamijeni { $system }
setup-destination-replace-description = Luft preuzima njegovo mjesto i zadržava ono što je vaše.
setup-destination-meet-title = Pored Windowsa
setup-destination-meet-description = Meet Luft je već napravio ovaj prostor, pa Windows ostaje tačno onakav kakav jeste.
setup-destination-looking = Pregledanje diskova…

setup-destination-meet-choice = Pored Windowsa
setup-destination-meet-choice-description = Koristite { $size } koje je Meet Luft napravio pored Windowsa.
setup-destination-alongside-choice = Pored sistema { $windows }
setup-destination-alongside-choice-description = Zadržite Windows i njegove fajlove, a Luftu dajte dio njegovog diska.
setup-destination-replace-choice = Zamijeni { $system }
setup-destination-replace-choice-description = Zadržite svoje fajlove, račun i postavke, a Luft neka preuzme njegovo mjesto.
setup-destination-whole-choice = Koristi cijeli disk
setup-destination-whole-choice-description = Izbrišite disk i dajte ga cijelog Luftu.
setup-destination-try-choice = Samo isprobaj Luft
setup-destination-try-choice-description = Prvo razgledajte. Ništa se ne instalira, a diskovi ostaju netaknuti.
setup-destination-custom-choice = Prilagođeno
setup-destination-custom-choice-description = Sami rasporedite particije u aplikaciji Diskovi.

setup-destination-more-options = Više opcija
setup-destination-starting = Pokretanje…
setup-destination-replace = Zamijeni
setup-destination-install = Instaliraj Luft

## Confirming where Luft goes

setup-confirm-replace-title = Zamijeniti { $system }?
setup-confirm-erase-title = Izbrisati { $drive }?
setup-confirm-shrink-title = Smanjiti Windows na { $size }?
setup-confirm-meet-title = Instalirati Luft pored Windowsa?
setup-confirm-free-title = Instalirati Luft u slobodni prostor?
setup-confirm-replace-keep-old = Luft odmah počinje s kopiranjem. Stari sistem se više neće pokretati, a njegovi fajlovi ostaju dok ih ne uklonite.
setup-confirm-replace-erase-old = Luft odmah počinje s kopiranjem. Stari sistem se trajno briše, a vaši fajlovi ostaju gdje jesu.
setup-confirm-erase-description = Sve na ovom disku se trajno briše, uključujući druge sisteme i fajlove.
setup-confirm-install-description = Luft odmah počinje s kopiranjem. U međuvremenu možete postaviti svoj račun.
setup-confirm-erase = Izbriši i instaliraj
setup-confirm-install = Instaliraj

## Making room next to Windows

setup-alongside-hint = Prevucite da podijelite disk { $drive } između Windowsa i Lufta. Windows zadržava sve svoje fajlove i nešto prostora za rast.
setup-windows-bitlocker = Windows drži ovaj disk zaključanim pomoću BitLockera, pa Luft na njemu ne može napraviti mjesta. U Windowsu isključite šifriranje uređaja ili smanjite disk u alatu Upravljanje diskovima i odaberite slobodni prostor pod Prilagođeno.
setup-windows-hibernated = Windows je u stanju mirovanja ili je isključen uz Brzo pokretanje, pa njegov disk nije sigurno mijenjati. Pokrenite Windows, držite Shift dok birate Isključi, a zatim ponovo pokrenite Luft.
setup-windows-dirty = Disk Windowsa prvo treba kratku provjeru. Pokrenite Windows, jednom ga ponovo pokrenite, a zatim ponovo pokrenite Luft.
setup-windows-full = Windowsu treba skoro cijeli disk. Oslobodite oko { $size } u Windowsu, a zatim ponovo pokrenite Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Ono što ste spakovali u Windowsu, { $size }, raspakuje se u vaš novi račun.

## Windows options

setup-windows-fast-startup = Isključi Brzo pokretanje u Windowsu
setup-windows-fast-startup-description = Windows se tada potpuno isključuje, pa se zvuk, Wi-Fi i Bluetooth u Luftu pokreću ispočetka, a njegov disk ostaje dostupan.
setup-windows-clock = Tačno vrijeme u oba sistema
setup-windows-clock-description = Windows čita sat računara na isti način kao Luft, pa vrijeme više ne skače kad se prebacujete.
setup-windows-bluetooth = Ponesite svoje Bluetooth uređaje
setup-windows-bluetooth-description = { $count ->
    [one] { $count } uređaj uparen u Windowsu radit će u Luftu bez ponovnog uparivanja.
    [few] { $count } uređaja uparena u Windowsu radit će u Luftu bez ponovnog uparivanja.
   *[other] { $count } uređaja uparenih u Windowsu radit će u Luftu bez ponovnog uparivanja.
}

## Choosing a drive

setup-drives-label = Diskovi
setup-drives-none = Nema diska koji Luft može koristiti. Priključite jedan i ponovo pogledajte.
setup-drive-has-windows = Sadrži { $windows }
setup-drive-empty = Prazan
setup-drive-partitions = { $count ->
    [one] Sadrži { $count } particiju
    [few] Sadrži { $count } particije
   *[other] Sadrži { $count } particija
}

## Custom space

setup-custom-open-disks = Otvori Diskove
setup-custom-looking = Pregledanje…
setup-custom-look-again = Pogledaj ponovo
setup-custom-free-label = Slobodni prostor
setup-custom-free-space = { $size } slobodnog prostora
setup-custom-on-drive = Na disku { $drive }
setup-custom-none = Napravite najmanje { $size } slobodnog prostora u aplikaciji Diskovi, a zatim ponovo pogledajte. Luft se instalira u prostor koji ostavite slobodnim.

## Replacing a Linux system

setup-replace-stays = Šta ostaje
setup-replace-changes = Šta se mijenja
setup-replace-keeps-account = Vaši fajlovi i vaš račun { $account }
setup-replace-keeps-account-password = Vaši fajlovi i vaš račun { $account } s njegovom lozinkom
setup-replace-keeps-accounts = { $count ->
    [one] Drugi račun na njemu, s njegovim fajlovima
    [few] Druga { $count } računa na njemu, s njihovim fajlovima
   *[other] Drugih { $count } računa na njemu, s njihovim fajlovima
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } mrežna veza, s lozinkom za Wi-Fi
    [few] { $count } mrežne veze, s lozinkama za Wi-Fi
   *[other] { $count } mrežnih veza, s lozinkama za Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montirani pri pokretanju kao i do sada
setup-replace-keeps-hostname = Ime računara, { $hostname }, i njegovi SSH ključevi
setup-replace-keeps-tools = { $count ->
    [one] { $count } alat za naredbeni redak koji ste instalirali, u Toolboxu nakon prijave
    [few] { $count } alata za naredbeni redak koja ste instalirali, u Toolboxu nakon prijave
   *[other] { $count } alata za naredbeni redak koje ste instalirali, u Toolboxu nakon prijave
}
setup-replace-keeps-old = { $system } se više ne pokreće. Njegovi sistemski fajlovi čuvaju se kao old-system dok ih ne uklonite u Diskovima ili Postavkama.
setup-replace-erases-system = Sistemska particija sistema { $system } se briše. Vaši fajlovi su na zasebnoj particiji i ostaju kakvi jesu.
setup-replace-clears-boot = Njegova particija /boot se prazni za Luftove fajlove za pokretanje.
setup-replace-apps = Aplikacije instalirane u njemu ne prelaze. Ponovo ih preuzmite iz aplikacije Schelf.

setup-replace-blocked-encrypted = Šifriran je, pa zamjena uz zadržavanje vaših fajlova još nije podržana.
setup-replace-blocked-single = Vaši fajlovi dijele particiju sa sistemom, pa zamjena uz njihovo zadržavanje još nije podržana.
setup-replace-blocked-layout = Njegov disk je raspoređen na način koji Luft još ne može zamijeniti.
setup-replace-blocked-startup = Njegova EFI sistemska particija je premala za Luft, a nema particije /boot koja bi se mogla koristiti umjesto nje.
setup-replace-blocked-no-account = Nema računa koji bi se mogao prenijeti.
setup-replace-blocked-running = Luft se upravo pokreće s njega. Pokrenite Luft s USB fleša da ga zamijenite.
setup-replace-blocked-read-only = Njegov disk je samo za čitanje.

## Connecting to the internet

setup-network-title = Povežite se na internet
setup-network-description = Ovo nije obavezno. Uz internet Luft može podesiti sat i vremensku zonu, a internet možete koristiti dok se Luft instalira.
setup-network-unavailable = Mreže trenutno nisu dostupne. Možete se povezati kasnije s programske trake.
setup-network-looking = Traženje mreža…
setup-network-cable = Povezano kablom
setup-network-show-all = Prikaži sve mreže
setup-network-skip = Preskoči
setup-network-failed = Povezivanje nije uspjelo
setup-network-wrong-password = Pogrešna lozinka
setup-network-connected = Povezano
setup-network-connecting = Povezivanje…
setup-network-saved = Sačuvano
setup-network-password = Lozinka
setup-network-join = Poveži

## Account

setup-account-title = Ko koristi ovaj računar?
setup-account-description = S ovim računom se prijavljujete. Više osoba možete dodati kasnije u Postavkama.
setup-account-full-name = Vaše ime
setup-account-full-name-example = Meša Selimović
setup-account-user-name = Korisničko ime
setup-account-password = Lozinka
setup-account-repeat = Unesite je ponovo
setup-account-user-name-invalid = Koristite mala slova, brojeve, - i _
setup-account-full-name-invalid = Izostavite zareze i dvotačke
setup-account-mismatch = Lozinke se ne podudaraju

## Installing

setup-finishing-failed-title = Luft nije bilo moguće instalirati
setup-finishing-failed-description = Nešto je pošlo po zlu tokom instaliranja.
setup-finishing-failed-stick = Računar se i dalje pokreće kao i prije. Možete nastaviti koristiti Luft s USB fleša ili ponovo pokrenuti računar i pokušati ponovo.
setup-finishing-failed-trying = Računar se i dalje pokreće kao i prije. Možete nastaviti koristiti Luft ovako ili ponovo pokrenuti računar i pokušati ponovo.
setup-finishing-use-stick = Koristi Luft s fleša
setup-finishing-keep-trying = Nastavi isprobavati Luft
setup-finishing-installed-title = Luft je instaliran
setup-finishing-trust-stick = Izvadite USB fleš čim ekran postane taman. Zatim plavi ekran traži da vjerujete Luftu. Tamo koristite tastaturu.
setup-finishing-trust = Odmah nakon ponovnog pokretanja plavi ekran traži da vjerujete Luftu. Tamo koristite tastaturu.
setup-finishing-restart-stick = Ponovo pokrenite računar da ga počnete koristiti. Izvadite USB fleš čim ekran postane taman.
setup-finishing-restart = Ponovo pokrenite računar da ga počnete koristiti.
setup-finishing-title = Još malo
setup-finishing-description = Luft se kopira na vaš računar. To traje nekoliko minuta.
setup-finishing-plug-in = Držite računar priključen na napajanje dok se ne završi.
setup-stage-idle = Priprema
setup-stage-preparing = Pravljenje mjesta za Luft
setup-stage-copying = Kopiranje Lufta
setup-stage-waiting = Završavanje
setup-stage-configuring = Postavljanje vašeg računa
setup-stage-finished = Gotovo

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Pritisnite tipku u roku od 10 sekundi
setup-enroll-choose-enroll = Odaberite Enroll MOK, zatim Continue
setup-enroll-choose-yes = Odaberite Yes
setup-enroll-type-code = Unesite kôd, zatim odaberite Reboot
setup-enroll-digits = { $count ->
    [one] { $count } cifra
    [few] { $count } cifre
   *[other] { $count } cifara
}
setup-secure-boot-title = Vaš računar još ne vjeruje Luftu
setup-secure-boot-code = Odmah nakon sljedećeg ponovnog pokretanja plavi ekran traži da vjerujete Luftu. Tamo pomoću tastature unesite ovaj kôd.
setup-secure-boot-skipped = Plavi ekran je preskočen. Zatražite novi kôd i ponovo pokrenite računar, a zatim tamo koristite tastaturu.
setup-secure-boot-getting = Preuzimanje koda…
setup-secure-boot-new-code = Zatraži novi kôd

## Encryption

setup-protect-title = Zaštitite svoje fajlove
setup-protect-tpm = Šifrirajte ovaj računar da niko ne može čitati vaše fajlove bez prijave, čak ni ako se izgubi. Otključava se sam pri pokretanju.
setup-protect-passphrase = Šifrirajte ovaj računar da niko ne može čitati vaše fajlove bez vaše pristupne fraze, čak ni ako se izgubi.
setup-protect-staged-title = Vaši fajlovi će biti šifrirani
setup-protect-staged-description = Šifriranje počinje samo od sebe nakon ponovnog pokretanja na kraju postavljanja, a računar možete koristiti dok traje.
setup-protect-keep-safe = Čuvajte ovaj ključ za oporavak na sigurnom mjestu, odvojeno od ovog računara. Trebat će vam ako se računar ikada ne bude mogao sam otključati.
setup-protect-passphrase-label = Pristupna fraza
setup-protect-repeat = Unesite je ponovo
setup-protect-mismatch = Ne podudaraju se
setup-protect-kept = Ključ za oporavak je sačuvan
setup-protect-background = Šifriranje se odvija u pozadini nakon sljedećeg ponovnog pokretanja, a računar u međuvremenu možete koristiti.
setup-protect-encrypt = Šifriraj
setup-protect-checking = Provjeravanje…
setup-protect-start = Šifriraj moje fajlove

## Fingerprint

setup-fingerprint-title = Prijava otiskom prsta
setup-fingerprint-description = Otključajte Luft dodirom umjesto unošenja lozinke. Više prstiju možete dodati kasnije u Postavkama.
setup-fingerprint-which = Koji prst?
setup-fingerprint-another = Dodati još jedan prst?
setup-fingerprint-finger = Prst
setup-fingerprint-no-reader = Čitač otiska prsta ne odgovara. Otisak prsta možete dodati kasnije u Postavkama.
setup-fingerprint-add = Dodaj otisak prsta
setup-fingerprint-choose-another = Odaberi drugi prst

## Done

setup-ready-title = Sve je spremno
setup-ready-trust = Ponovo pokrenite računar još jednom da završite. Odmah nakon toga plavi ekran traži da vjerujete Luftu. Tamo pomoću tastature unesite ovaj kôd.
setup-ready-restart = Ponovo pokrenite računar još jednom da završite, a zatim se prijavite svojom lozinkom.
setup-ready-done = Vaša radna površina je spremna. Uživajte u Luftu.
setup-ready-start = Počni koristiti Luft
