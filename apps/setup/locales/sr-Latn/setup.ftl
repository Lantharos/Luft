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

setup-installing-label = Instaliranje sistema Luft
setup-installing-progress = Instaliranje, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Pretraga
setup-picker-no-match = Ništa se ne poklapa

## Welcome step: language, keyboard and time zone

setup-region-title = Dobro došli u Luft
setup-region-language = Jezik
setup-region-keyboard = Tastatura
setup-region-time-zone = Vremenska zona
setup-region-intro = Hajde da podesimo računar. Izaberite jezik, tastaturu i vremensku zonu.
setup-region-intro-guessed-computer = Hajde da podesimo računar. Ovo smo pretpostavili na osnovu računara, pa promenite ono što ne odgovara.
setup-region-intro-guessed = Hajde da podesimo računar. Pretpostavili smo { $guesses }, pa promenite ono što ne odgovara.
setup-region-guess-from-computer = { $fields } na osnovu računara
setup-region-guess-from-network = { $fields } na osnovu mreže
setup-region-field-language = jezik
setup-region-field-keyboard = tastaturu
setup-region-field-time-zone = vremensku zonu

## Where Luft goes

setup-destination-choose-title = Gde da se instalira Luft?
setup-destination-choose-description = Izaberite kako će Luft biti smešten na ovom računaru. Ništa se ne menja dok ne potvrdite.
setup-destination-alongside-title = Napravite mesta pored sistema Windows
setup-destination-alongside-description = Windows se smanjuje da bi bilo mesta za Luft. Vaše datoteke u sistemu Windows ostaju netaknute.
setup-destination-whole-title = Izaberite disk
setup-destination-whole-description = Luft zauzima ceo disk. Sve na njemu se briše.
setup-destination-custom-title = Izaberite prostor za Luft
setup-destination-custom-description = Rasporedite diskove po svom u aplikaciji Diskovi.
setup-destination-replace-title = Zamena sistema { $system }
setup-destination-replace-description = Luft zauzima njegovo mesto i zadržava ono što je vaše.
setup-destination-meet-title = Pored sistema Windows
setup-destination-meet-description = Aplikacija Meet Luft je već napravila mesto, pa Windows ostaje onakav kakav je.
setup-destination-meet-drive-title = Na disku { $drive }
setup-destination-meet-drive-description = Aplikacija Meet Luft je već napravila mesto na drugom disku, a Luft se pokreće odatle sa sopstvenim datotekama za pokretanje.
setup-destination-looking = Pregledanje diskova…

setup-destination-meet-choice = Pored sistema Windows
setup-destination-meet-choice-description = Prostor od { $size } koji je aplikacija Meet Luft napravila pored sistema Windows.
setup-destination-meet-drive-choice = Na disku { $drive }
setup-destination-meet-drive-choice-description = Prostor od { $size } koji je aplikacija Meet Luft napravila na disku { $drive }.
setup-destination-alongside-choice = Pored sistema { $windows }
setup-destination-alongside-choice-description = Windows i njegove datoteke ostaju, a Luft dobija deo njegovog diska.
setup-destination-replace-choice = Zameni sistem { $system }
setup-destination-replace-choice-description = Vaše datoteke, nalog i podešavanja ostaju, a Luft zauzima mesto starog sistema.
setup-destination-whole-choice = Koristi ceo disk
setup-destination-whole-choice-description = Disk se briše i ceo se predaje sistemu Luft.
setup-destination-try-choice = Samo isprobaj Luft
setup-destination-try-choice-description = Prvo razgledajte. Ništa se ne instalira i diskovi ostaju netaknuti.
setup-destination-custom-choice = Prilagođeno
setup-destination-custom-choice-description = Sami rasporedite particije u aplikaciji Diskovi.

setup-destination-more-options = Više opcija
setup-destination-starting = Pokretanje…
setup-destination-replace = Zameni
setup-destination-install = Instaliraj Luft

## Confirming where Luft goes

setup-confirm-replace-title = Zameniti sistem { $system }?
setup-confirm-erase-title = Izbrisati disk { $drive }?
setup-confirm-shrink-title = Smanjiti Windows na { $size }?
setup-confirm-meet-title = Instalirati Luft pored sistema Windows?
setup-confirm-meet-drive-title = Instalirati Luft na disk { $drive }?
setup-confirm-free-title = Instalirati Luft u slobodan prostor?
setup-confirm-replace-keep-old = Luft odmah počinje kopiranje. Stari sistem se više neće pokretati, a njegove datoteke ostaju dok ih ne uklonite.
setup-confirm-replace-erase-old = Luft odmah počinje kopiranje. Stari sistem se trajno briše, a vaše datoteke ostaju gde jesu.
setup-confirm-erase-description = Sve na ovom disku se trajno briše, uključujući druge sisteme i datoteke.
setup-confirm-install-description = Luft odmah počinje kopiranje. Dok radi, možete da podesite nalog.
setup-confirm-erase = Izbriši i instaliraj
setup-confirm-install = Instaliraj

## Making room next to Windows

setup-alongside-hint = Prevucite da biste podelili disk { $drive } između sistema Windows i Luft. Windows zadržava sve svoje datoteke i nešto prostora za rast.
setup-windows-bitlocker = Windows drži ovaj disk zaključan šifrovanjem BitLocker, pa Luft na njemu ne može da napravi mesta. U sistemu Windows isključite šifrovanje uređaja ili smanjite disk u Upravljanju diskovima i izaberite slobodan prostor pod Prilagođeno.
setup-windows-hibernated = Windows je u stanju spavanja ili je isključen uz Brzo pokretanje, pa njegov disk ne može bezbedno da se menja. Pokrenite Windows, držite Shift dok birate Isključi, pa opet pokrenite Luft.
setup-windows-dirty = Disk sistema Windows prvo treba kratko da se proveri. Pokrenite Windows, jednom ga ponovo pokrenite, pa opet pokrenite Luft.
setup-windows-full = Sistemu Windows treba skoro ceo njegov disk. Oslobodite oko { $size } u sistemu Windows, pa opet pokrenite Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Stvari koje ste spakovali u sistemu Windows, { $size }, raspakuju se u vaš novi nalog.

## Windows options

setup-windows-fast-startup = Isključi Brzo pokretanje u sistemu Windows
setup-windows-fast-startup-description = Windows će se tada potpuno gasiti, pa zvuk, Wi-Fi i Bluetooth u sistemu Luft kreću iz početka, a njegov disk ostaje dostupan.
setup-windows-clock = Tačno vreme u oba sistema
setup-windows-clock-description = Windows čita sat računara na isti način kao Luft, pa se vreme više ne pomera kada prelazite iz jednog u drugi.
setup-windows-bluetooth = Prenesi Bluetooth uređaje
setup-windows-bluetooth-description = { $count ->
    [one] { $count } uređaj uparen u sistemu Windows radiće u sistemu Luft bez ponovnog uparivanja.
    [few] { $count } uređaja uparena u sistemu Windows radiće u sistemu Luft bez ponovnog uparivanja.
   *[other] { $count } uređaja uparenih u sistemu Windows radiće u sistemu Luft bez ponovnog uparivanja.
}

## Choosing a drive

setup-drives-label = Diskovi
setup-drives-none = Nema diska koji Luft može da koristi. Povežite disk i potražite ponovo.
setup-drive-has-windows = Ima { $windows }
setup-drive-empty = Prazan
setup-drive-partitions = { $count ->
    [one] Ima { $count } particiju
    [few] Ima { $count } particije
   *[other] Ima { $count } particija
}

## Custom space

setup-custom-open-disks = Otvori Diskove
setup-custom-looking = Traženje…
setup-custom-look-again = Potraži ponovo
setup-custom-free-label = Slobodan prostor
setup-custom-free-space = { $size } slobodnog prostora
setup-custom-on-drive = Na disku { $drive }
setup-custom-none = Napravite bar { $size } slobodnog prostora u aplikaciji Diskovi, pa potražite ponovo. Luft se instalira u prostor koji ostavite slobodnim.

## Replacing a Linux system

setup-replace-stays = Šta ostaje
setup-replace-changes = Šta se menja
setup-replace-keeps-account = Vaše datoteke i vaš nalog { $account }
setup-replace-keeps-account-password = Vaše datoteke i vaš nalog { $account } sa lozinkom
setup-replace-keeps-accounts = { $count ->
    [one] Još { $count } nalog na njemu, sa svojim datotekama
    [few] Još { $count } naloga na njemu, sa svojim datotekama
   *[other] Još { $count } naloga na njemu, sa svojim datotekama
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } mrežna veza, sa lozinkom za Wi-Fi
    [few] { $count } mrežne veze, sa lozinkama za Wi-Fi
   *[other] { $count } mrežnih veza, sa lozinkama za Wi-Fi
}
setup-replace-keeps-drives = { $drives }, koji se kao i do sada montiraju pri pokretanju
setup-replace-keeps-hostname = Naziv računara, { $hostname }, i njegovi SSH ključevi
setup-replace-keeps-tools = { $count ->
    [one] { $count } alat za komandnu liniju koji ste instalirali, u okruženju Toolbox nakon prijave
    [few] { $count } alata za komandnu liniju koje ste instalirali, u okruženju Toolbox nakon prijave
   *[other] { $count } alata za komandnu liniju koje ste instalirali, u okruženju Toolbox nakon prijave
}
setup-replace-keeps-old = Sistem { $system } se više ne pokreće. Njegove sistemske datoteke čuvaju se kao old-system dok ih ne uklonite u aplikaciji Diskovi ili u Podešavanjima.
setup-replace-erases-system = Sistemska particija sistema { $system } se briše. Vaše datoteke su na zasebnoj particiji i ostaju netaknute.
setup-replace-clears-boot = Njegova particija /boot se prazni za datoteke kojima se Luft pokreće.
setup-replace-apps = Aplikacije instalirane u njemu ne prelaze. Ponovo ih preuzmite u aplikaciji Schelf.

setup-replace-blocked-encrypted = Šifrovan je, pa zamena uz zadržavanje datoteka još nije podržana.
setup-replace-blocked-single = Vaše datoteke dele particiju sa sistemom, pa zamena uz njihovo zadržavanje još nije podržana.
setup-replace-blocked-layout = Njegov disk je raspoređen na način koji Luft još ne može da zameni.
setup-replace-blocked-startup = Njegova EFI sistemska particija je premala za Luft, a nema ni particije /boot koja bi se koristila umesto nje.
setup-replace-blocked-no-account = Nema nalog koji bi se preneo.
setup-replace-blocked-running = Luft se trenutno pokreće sa njega. Pokrenite Luft sa USB fleša da biste ga zamenili.
setup-replace-blocked-read-only = Njegov disk je samo za čitanje.

## Connecting to the internet

setup-network-title = Povežite se na internet
setup-network-description = Ovo nije obavezno. Kada ste na mreži, Luft može da podesi sat i vremensku zonu, a internet možete da koristite dok se Luft instalira.
setup-network-unavailable = Mreže trenutno nisu dostupne. Možete se povezati kasnije sa trake zadataka.
setup-network-looking = Traženje mreža…
setup-network-cable = Povezano kablom
setup-network-show-all = Prikaži sve mreže
setup-network-skip = Preskoči
setup-network-failed = Povezivanje nije uspelo
setup-network-wrong-password = Pogrešna lozinka
setup-network-connected = Povezano
setup-network-connecting = Povezivanje…
setup-network-saved = Sačuvano
setup-network-password = Lozinka
setup-network-join = Poveži

## Account

setup-account-title = Ko koristi ovaj računar?
setup-account-description = Ovim nalogom se prijavljujete. Kasnije možete da dodate još ljudi u Podešavanjima.
setup-account-full-name = Vaše ime
setup-account-full-name-example = Nikola Tesla
setup-account-user-name = Korisničko ime
setup-account-password = Lozinka
setup-account-repeat = Unesite je ponovo
setup-account-user-name-invalid = Koristite mala latinična slova, brojeve, - i _
setup-account-full-name-invalid = Izostavite zareze i dvotačke
setup-account-mismatch = Lozinke se ne poklapaju

## Installing

setup-finishing-failed-title = Luft nije mogao da se instalira
setup-finishing-failed-description = Nešto je pošlo naopako tokom instaliranja.
setup-finishing-failed-stick = Računar se i dalje pokreće kao i ranije. Možete da nastavite da koristite Luft sa USB fleša ili da ponovo pokrenete računar i pokušate opet.
setup-finishing-failed-trying = Računar se i dalje pokreće kao i ranije. Možete da nastavite da koristite Luft ovakav kakav je sada ili da ponovo pokrenete računar i pokušate opet.
setup-finishing-use-stick = Koristi Luft sa fleša
setup-finishing-keep-trying = Nastavi sa isprobavanjem
setup-finishing-installed-title = Luft je instaliran
setup-finishing-trust-stick = Izvadite USB fleš kada ekran potamni. Plavi ekran će zatim tražiti da potvrdite poverenje u Luft. Tamo koristite tastaturu.
setup-finishing-trust = Odmah posle ponovnog pokretanja plavi ekran će tražiti da potvrdite poverenje u Luft. Tamo koristite tastaturu.
setup-finishing-restart-stick = Ponovo pokrenite računar da biste počeli da koristite Luft. Izvadite USB fleš kada ekran potamni.
setup-finishing-restart = Ponovo pokrenite računar da biste počeli da koristite Luft.
setup-finishing-title = Još malo
setup-finishing-description = Luft se kopira na računar. To traje nekoliko minuta.
setup-finishing-plug-in = Držite računar priključen na struju dok se ne završi.
setup-stage-idle = Priprema
setup-stage-preparing = Pravljenje mesta za Luft
setup-stage-copying = Kopiranje sistema Luft
setup-stage-waiting = Završavanje
setup-stage-configuring = Podešavanje vašeg naloga
setup-stage-finished = Gotovo

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Pritisnite taster u roku od 10 sekundi
setup-enroll-choose-enroll = Izaberite Enroll MOK, zatim Continue
setup-enroll-choose-yes = Izaberite Yes
setup-enroll-type-code = Ukucajte kod, zatim izaberite Reboot
setup-enroll-digits = { $count ->
    [one] { $count } cifra
    [few] { $count } cifre
   *[other] { $count } cifara
}
setup-secure-boot-title = Računar još ne veruje sistemu Luft
setup-secure-boot-code = Odmah posle sledećeg ponovnog pokretanja plavi ekran će tražiti da potvrdite poverenje u Luft. Tamo pomoću tastature unesite ovaj kod.
setup-secure-boot-skipped = Plavi ekran je preskočen. Nabavite novi kod i ponovo pokrenite računar, pa tamo koristite tastaturu.
setup-secure-boot-getting = Pribavljanje koda…
setup-secure-boot-new-code = Nabavi novi kod

## Encryption

setup-protect-title = Zaštitite svoje datoteke
setup-protect-tpm = Šifrujte ovaj računar da niko ne bi mogao da pročita vaše datoteke bez prijave, čak i ako se računar izgubi. Pri pokretanju se otključava sam.
setup-protect-passphrase = Šifrujte ovaj računar da niko ne bi mogao da pročita vaše datoteke bez vaše pristupne fraze, čak i ako se računar izgubi.
setup-protect-staged-title = Vaše datoteke će biti šifrovane
setup-protect-staged-description = Šifrovanje počinje samo od sebe posle ponovnog pokretanja na kraju podešavanja, a računar možete da koristite dok traje.
setup-protect-waiting-description = Luft još menja svoju veličinu. Kada to završi, šifrovanje počinje pri sledećem ponovnom pokretanju, a vi u međuvremenu možete da nastavite da koristite računar.
setup-protect-keep-safe = Čuvajte ovaj ključ za oporavak na sigurnom mestu, dalje od ovog računara. Biće vam potreban ako se računar ikada ne otključa sam.
setup-protect-passphrase-label = Pristupna fraza
setup-protect-repeat = Unesite je ponovo
setup-protect-mismatch = Ne poklapaju se
setup-protect-kept = Ključ za oporavak je sačuvan
setup-protect-background = Šifrovanje teče u pozadini posle sledećeg ponovnog pokretanja, a računar možete da koristite i za to vreme.
setup-protect-encrypt = Šifruj
setup-protect-checking = Provera…
setup-protect-start = Šifruj moje datoteke

## Fingerprint

setup-fingerprint-title = Prijavljujte se otiskom prsta
setup-fingerprint-description = Otključajte Luft dodirom umesto unošenja lozinke. Kasnije možete da dodate još prstiju u Podešavanjima.
setup-fingerprint-which = Koji prst?
setup-fingerprint-another = Dodati još jedan prst?
setup-fingerprint-finger = Prst
setup-fingerprint-no-reader = Čitač otisaka prstiju ne odgovara. Otisak prsta možete da dodate kasnije u Podešavanjima.
setup-fingerprint-add = Dodaj otisak prsta
setup-fingerprint-choose-another = Izaberi drugi prst

## Done

setup-ready-title = Sve je spremno
setup-ready-trust = Ponovo pokrenite računar još jednom da biste završili. Odmah posle ponovnog pokretanja plavi ekran će tražiti da potvrdite poverenje u Luft. Tamo pomoću tastature unesite ovaj kod.
setup-ready-restart = Ponovo pokrenite računar još jednom da biste završili, pa se prijavite lozinkom.
setup-ready-done = Radna površina je spremna. Uživajte u sistemu Luft.
setup-ready-start = Počni da koristiš Luft
