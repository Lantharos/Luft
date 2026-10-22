## Buttons used across steps

setup-continue = Nastavi
setup-back = Natrag
setup-cancel = Odustani
setup-not-now = Ne sada
setup-try-again = Pokušaj ponovno
setup-restart = Ponovno pokreni
setup-restart-now = Ponovno pokreni sada
setup-restart-later = Ponovno pokreni kasnije
setup-saving = Spremanje…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Instaliranje Lufta
setup-installing-progress = Instaliranje, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Pretraži
setup-picker-no-match = Nema rezultata

## Welcome step: language, keyboard and time zone

setup-region-title = Dobro došli u Luft
setup-region-language = Jezik
setup-region-keyboard = Tipkovnica
setup-region-time-zone = Vremenska zona
setup-region-intro = Krenimo s postavljanjem. Odaberite jezik, tipkovnicu i vremensku zonu.
setup-region-intro-guessed-computer = Krenimo s postavljanjem. Ovo smo preuzeli s vašeg računala, pa promijenite što ne odgovara.
setup-region-intro-guessed = Krenimo s postavljanjem. Pretpostavili smo { $guesses }, pa promijenite što ne odgovara.
setup-region-guess-from-computer = { $fields } prema vašem računalu
setup-region-guess-from-network = { $fields } prema vašoj mreži
setup-region-field-language = jezik
setup-region-field-keyboard = tipkovnicu
setup-region-field-time-zone = vremensku zonu

## Where Luft goes

setup-destination-choose-title = Gdje instalirati Luft?
setup-destination-choose-description = Odaberite kako će Luft stati na ovo računalo. Ništa se ne mijenja dok ne potvrdite.
setup-destination-alongside-title = Napravite mjesta uz Windows
setup-destination-alongside-description = Windows se smanjuje da bi Luft dobio prostor. Vaše datoteke u sustavu Windows ostaju kakve jesu.
setup-destination-whole-title = Odaberite disk
setup-destination-whole-description = Luft zauzima cijeli disk. Sve na njemu se briše.
setup-destination-custom-title = Odaberite prostor za Luft
setup-destination-custom-description = Rasporedite diskove po svome u aplikaciji Diskovi.
setup-destination-replace-title = Zamijeni { $system }
setup-destination-replace-description = Luft dolazi na njegovo mjesto i čuva ono što je vaše.
setup-destination-meet-title = Uz Windows
setup-destination-meet-description = Meet Luft je već napravio mjesta, pa Windows ostaje točno kakav jest.
setup-destination-meet-drive-title = Na disku { $drive }
setup-destination-meet-drive-description = Meet Luft je već napravio mjesta na drugom disku, a Luft se pokreće odande s vlastitim datotekama za pokretanje.
setup-destination-looking = Pregledavanje diskova…

setup-destination-meet-choice = Uz Windows
setup-destination-meet-choice-description = Koristi se prostor od { $size } koji je Meet Luft napravio uz Windows.
setup-destination-meet-drive-choice = Na disku { $drive }
setup-destination-meet-drive-choice-description = Koristi se prostor od { $size } koji je Meet Luft napravio na disku { $drive }.
setup-destination-alongside-choice = Uz { $windows }
setup-destination-alongside-choice-description = Windows i njegove datoteke ostaju, a Luft dobiva dio njegova diska.
setup-destination-replace-choice = Zamijeni { $system }
setup-destination-replace-choice-description = Vaše datoteke, račun i postavke ostaju, a Luft dolazi na njegovo mjesto.
setup-destination-whole-choice = Upotrijebi cijeli disk
setup-destination-whole-choice-description = Disk se briše i cijeli pripada Luftu.
setup-destination-try-choice = Samo isprobaj Luft
setup-destination-try-choice-description = Najprije razgledajte. Ništa se ne instalira, a diskovi ostaju netaknuti.
setup-destination-custom-choice = Prilagođeno
setup-destination-custom-choice-description = Sami rasporedite particije u aplikaciji Diskovi.

setup-destination-more-options = Više mogućnosti
setup-destination-starting = Pokretanje…
setup-destination-replace = Zamijeni
setup-destination-install = Instaliraj Luft

## Confirming where Luft goes

setup-confirm-replace-title = Zamijeniti { $system }?
setup-confirm-erase-title = Izbrisati { $drive }?
setup-confirm-shrink-title = Smanjiti Windows na { $size }?
setup-confirm-meet-title = Instalirati Luft uz Windows?
setup-confirm-meet-drive-title = Instalirati Luft na disk { $drive }?
setup-confirm-free-title = Instalirati Luft u slobodni prostor?
setup-confirm-replace-keep-old = Luft odmah počinje s kopiranjem. Stari se sustav više neće pokretati, a njegove datoteke ostaju dok ih ne uklonite.
setup-confirm-replace-erase-old = Luft odmah počinje s kopiranjem. Stari se sustav trajno briše, a vaše datoteke ostaju gdje jesu.
setup-confirm-erase-description = Sve na ovom disku trajno se briše, uključujući druge sustave i datoteke.
setup-confirm-install-description = Luft odmah počinje s kopiranjem. Dok traje, možete postaviti svoj račun.
setup-confirm-erase = Izbriši i instaliraj
setup-confirm-install = Instaliraj

## Making room next to Windows

setup-alongside-hint = Povucite da biste podijelili { $drive } između sustava Windows i Lufta. Windows zadržava sve svoje datoteke i nešto prostora za rast.
setup-windows-bitlocker = Windows drži ovaj disk zaključanim pomoću BitLockera, pa Luft na njemu ne može napraviti mjesta. U sustavu Windows isključite šifriranje uređaja ili smanjite disk u Upravljanju diskovima i odaberite slobodni prostor pod Prilagođeno.
setup-windows-hibernated = Windows je u stanju mirovanja ili je isključen uz brzo pokretanje, pa se njegov disk ne može sigurno mijenjati. Pokrenite Windows, držite Shift dok odabirete Isključi, a zatim ponovno pokrenite Luft.
setup-windows-dirty = Disk sustava Windows najprije treba kratku provjeru. Pokrenite Windows, jednom ga ponovno pokrenite, a zatim ponovno pokrenite Luft.
setup-windows-full = Windowsu treba gotovo cijeli disk. U sustavu Windows oslobodite oko { $size }, a zatim ponovno pokrenite Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Ono što ste spakirali u sustavu Windows, { $size }, raspakirat će se u vaš novi račun.

## Windows options

setup-windows-fast-startup = Isključi brzo pokretanje u sustavu Windows
setup-windows-fast-startup-description = Windows se tada potpuno isključuje, pa se zvuk, Wi-Fi i Bluetooth u Luftu pokreću ispočetka, a njegov disk ostaje otvoren.
setup-windows-clock = Neka sat bude točan u oba sustava
setup-windows-clock-description = Windows čita sat računala jednako kao Luft, pa vrijeme više ne skače pri prelasku.
setup-windows-bluetooth = Prenesi Bluetooth uređaje
setup-windows-bluetooth-description = { $count ->
    [one] { $count } uređaj uparen u sustavu Windows radit će u Luftu bez ponovnog uparivanja.
    [few] { $count } uređaja uparena u sustavu Windows radit će u Luftu bez ponovnog uparivanja.
   *[other] { $count } uređaja uparenih u sustavu Windows radit će u Luftu bez ponovnog uparivanja.
}

## Choosing a drive

setup-drives-label = Diskovi
setup-drives-none = Nema diska koji Luft može koristiti. Spojite disk i pogledajte ponovno.
setup-drive-has-windows = Sadrži { $windows }
setup-drive-empty = Prazan
setup-drive-partitions = { $count ->
    [one] Ima { $count } particiju
    [few] Ima { $count } particije
   *[other] Ima { $count } particija
}

## Custom space

setup-custom-open-disks = Otvori Diskove
setup-custom-looking = Pregledavanje…
setup-custom-look-again = Pogledaj ponovno
setup-custom-free-label = Slobodni prostor
setup-custom-free-space = { $size } slobodnog prostora
setup-custom-on-drive = Na disku { $drive }
setup-custom-none = U aplikaciji Diskovi oslobodite najmanje { $size }, a zatim pogledajte ponovno. Luft se instalira u prostor koji ostavite slobodnim.

## Replacing a Linux system

setup-replace-stays = Što ostaje
setup-replace-changes = Što se mijenja
setup-replace-keeps-account = Vaše datoteke i vaš račun { $account }
setup-replace-keeps-account-password = Vaše datoteke i vaš račun { $account } s lozinkom
setup-replace-keeps-accounts = { $count ->
    [one] Još { $count } račun na njemu, s pripadajućim datotekama
    [few] Još { $count } računa na njemu, s pripadajućim datotekama
   *[other] Još { $count } računa na njemu, s pripadajućim datotekama
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } mrežna veza, s lozinkom za Wi-Fi
    [few] { $count } mrežne veze, s lozinkama za Wi-Fi
   *[other] { $count } mrežnih veza, s lozinkama za Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montirani pri pokretanju kao i dosad
setup-replace-keeps-hostname = Naziv računala, { $hostname }, i njegovi SSH ključevi
setup-replace-keeps-tools = { $count ->
    [one] { $count } alat naredbenog retka koji ste instalirali, u Toolboxu nakon prijave
    [few] { $count } alata naredbenog retka koja ste instalirali, u Toolboxu nakon prijave
   *[other] { $count } alata naredbenog retka koje ste instalirali, u Toolboxu nakon prijave
}
setup-replace-keeps-old = { $system } se više ne pokreće. Njegove sistemske datoteke čuvaju se kao old-system dok ih ne uklonite u Diskovima ili Postavkama.
setup-replace-erases-system = Sistemska particija sustava { $system } briše se. Vaše su datoteke na zasebnoj particiji i ostaju kakve jesu.
setup-replace-clears-boot = Njegova particija /boot prazni se za Luftove datoteke za pokretanje.
setup-replace-apps = Aplikacije instalirane u njemu ne prelaze. Ponovno ih preuzmite iz aplikacije Schelf.

setup-replace-blocked-encrypted = Šifriran je, pa zamjena uz zadržavanje datoteka još nije podržana.
setup-replace-blocked-single = Vaše datoteke dijele particiju sa sustavom, pa zamjena uz njihovo zadržavanje još nije podržana.
setup-replace-blocked-layout = Njegov je disk raspoređen na način koji Luft još ne može zamijeniti.
setup-replace-blocked-startup = Njegova EFI sistemska particija premala je za Luft, a nema ni particije /boot koja bi se mogla upotrijebiti.
setup-replace-blocked-no-account = Nema računa koji bi se mogao prenijeti.
setup-replace-blocked-running = Luft se upravo pokreće s njega. Pokrenite Luft s USB memorije da biste ga zamijenili.
setup-replace-blocked-read-only = Njegov je disk samo za čitanje.

## Connecting to the internet

setup-network-title = Povežite se s internetom
setup-network-description = Ovo nije obavezno. Uz vezu Luft može postaviti sat i vremensku zonu, a dok se Luft instalira, možete koristiti internet.
setup-network-unavailable = Mreže trenutačno nisu dostupne. Možete se povezati kasnije s programske trake.
setup-network-looking = Traženje mreža…
setup-network-cable = Povezano kabelom
setup-network-show-all = Prikaži sve mreže
setup-network-skip = Preskoči
setup-network-failed = Povezivanje nije uspjelo
setup-network-wrong-password = Pogrešna lozinka
setup-network-connected = Povezano
setup-network-connecting = Povezivanje…
setup-network-saved = Spremljeno
setup-network-password = Lozinka
setup-network-join = Poveži

## Account

setup-account-title = Tko koristi ovo računalo?
setup-account-description = S ovim se računom prijavljujete. Više osoba možete dodati kasnije u Postavkama.
setup-account-full-name = Vaše ime
setup-account-full-name-example = Nikola Tesla
setup-account-user-name = Korisničko ime
setup-account-password = Lozinka
setup-account-repeat = Upišite je ponovno
setup-account-user-name-invalid = Koristite mala slova, brojke, - i _
setup-account-full-name-invalid = Izostavite zareze i dvotočke
setup-account-mismatch = Lozinke se ne podudaraju

## Installing

setup-finishing-failed-title = Luft nije moguće instalirati
setup-finishing-failed-description = Nešto je pošlo po krivu tijekom instalacije.
setup-finishing-failed-stick = Računalo se i dalje pokreće kao i prije. Možete nastaviti koristiti Luft s USB memorije ili ponovno pokrenuti računalo i pokušati opet.
setup-finishing-failed-trying = Računalo se i dalje pokreće kao i prije. Možete nastaviti koristiti Luft ovako kako jest ili ponovno pokrenuti računalo i pokušati opet.
setup-finishing-use-stick = Koristi Luft s USB memorije
setup-finishing-keep-trying = Nastavi isprobavati Luft
setup-finishing-installed-title = Luft je instaliran
setup-finishing-trust-stick = Izvadite USB memoriju čim se zaslon zatamni. Zatim će plavi zaslon zatražiti da vjerujete Luftu. Ondje koristite tipkovnicu.
setup-finishing-trust = Odmah nakon ponovnog pokretanja plavi zaslon zatražit će da vjerujete Luftu. Ondje koristite tipkovnicu.
setup-finishing-restart-stick = Ponovno pokrenite računalo da biste ga počeli koristiti. Izvadite USB memoriju čim se zaslon zatamni.
setup-finishing-restart = Ponovno pokrenite računalo da biste ga počeli koristiti.
setup-finishing-title = Još malo
setup-finishing-description = Luft se kopira na vaše računalo. To traje nekoliko minuta.
setup-finishing-plug-in = Ostavite računalo priključeno na napajanje dok se ne završi.
setup-stage-idle = Priprema
setup-stage-preparing = Stvaranje mjesta za Luft
setup-stage-copying = Kopiranje Lufta
setup-stage-waiting = Dovršavanje
setup-stage-configuring = Postavljanje vašeg računa
setup-stage-finished = Gotovo

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Pritisnite tipku u roku od 10 sekundi
setup-enroll-choose-enroll = Odaberite Enroll MOK, a zatim Continue
setup-enroll-choose-yes = Odaberite Yes
setup-enroll-type-code = Upišite kod, a zatim odaberite Reboot
setup-enroll-digits = { $count ->
    [one] { $count } znamenka
    [few] { $count } znamenke
   *[other] { $count } znamenki
}
setup-secure-boot-title = Vaše računalo još ne vjeruje Luftu
setup-secure-boot-code = Odmah nakon sljedećeg ponovnog pokretanja plavi zaslon zatražit će da vjerujete Luftu. Ondje pomoću tipkovnice upišite ovaj kod.
setup-secure-boot-skipped = Plavi zaslon je preskočen. Zatražite novi kod i ponovno pokrenite računalo, a zatim ondje koristite tipkovnicu.
setup-secure-boot-getting = Dohvaćanje koda…
setup-secure-boot-new-code = Zatraži novi kod

## Encryption

setup-protect-title = Zaštitite svoje datoteke
setup-protect-tpm = Šifrirajte ovo računalo kako nitko ne bi mogao čitati vaše datoteke bez prijave, čak ni ako se izgubi. Pri pokretanju se samo otključava.
setup-protect-passphrase = Šifrirajte ovo računalo kako nitko ne bi mogao čitati vaše datoteke bez vaše lozinke za šifriranje, čak ni ako se izgubi.
setup-protect-keep-safe = Čuvajte ovaj ključ za oporavak na sigurnom mjestu, odvojeno od ovog računala. Trebat će vam ako se računalo ikad ne može samo otključati.
setup-protect-passphrase-label = Lozinka za šifriranje
setup-protect-repeat = Upišite je ponovno
setup-protect-mismatch = Ne podudaraju se
setup-protect-kept = Ključ za oporavak je spremljen
setup-protect-only-now = Šifriranje možete uključiti samo sada, dok instalirate Luft.
setup-protect-skip = Nemoj šifrirati
setup-protect-encrypt = Šifriraj

## Fingerprint

setup-fingerprint-title = Prijavite se prstom
setup-fingerprint-description = Otključajte Luft dodirom umjesto upisivanja lozinke. Više prstiju možete dodati kasnije u Postavkama.
setup-fingerprint-which = Koji prst?
setup-fingerprint-another = Dodati još jedan prst?
setup-fingerprint-finger = Prst
setup-fingerprint-no-reader = Čitač otiska prsta ne odgovara. Otisak prsta možete dodati kasnije u Postavkama.
setup-fingerprint-add = Dodaj otisak prsta
setup-fingerprint-choose-another = Odaberi drugi prst

## Done

setup-ready-title = Sve je spremno
setup-ready-trust = Ponovno pokrenite računalo još jednom da biste završili. Odmah nakon ponovnog pokretanja plavi zaslon zatražit će da vjerujete Luftu. Ondje pomoću tipkovnice upišite ovaj kod.
setup-ready-done = Vaša radna površina je spremna. Uživajte u Luftu.
setup-ready-start = Počni koristiti Luft
