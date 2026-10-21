## Buttons used across steps

setup-continue = Continuă
setup-back = Înapoi
setup-cancel = Anulează
setup-not-now = Nu acum
setup-try-again = Încearcă din nou
setup-restart = Repornește
setup-restart-now = Repornește acum
setup-restart-later = Repornește mai târziu
setup-saving = Se salvează…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Se instalează Luft
setup-installing-progress = Se instalează, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Caută
setup-picker-no-match = Nicio potrivire

## Welcome step: language, keyboard and time zone

setup-region-title = Bun venit în Luft
setup-region-language = Limbă
setup-region-keyboard = Tastatură
setup-region-time-zone = Fus orar
setup-region-intro = Să începem configurarea. Alegeți limba, tastatura și fusul orar.
setup-region-intro-guessed-computer = Să începem configurarea. Le-am dedus de pe computer, așa că modificați ce nu este corect.
setup-region-intro-guessed = Să începem configurarea. Am dedus { $guesses }, așa că modificați ce nu este corect.
setup-region-guess-from-computer = { $fields } de pe computer
setup-region-guess-from-network = { $fields } din rețea
setup-region-field-language = limba
setup-region-field-keyboard = tastatura
setup-region-field-time-zone = fusul orar

## Where Luft goes

setup-destination-choose-title = Unde să fie instalat Luft?
setup-destination-choose-description = Alegeți cum își face loc Luft pe acest computer. Nu se schimbă nimic până nu confirmați.
setup-destination-alongside-title = Faceți loc lângă Windows
setup-destination-alongside-description = Windows se micșorează pentru a face loc sistemului Luft. Fișierele din Windows rămân neschimbate.
setup-destination-whole-title = Alegeți o unitate
setup-destination-whole-description = Luft ocupă întreaga unitate. Tot ce se află pe ea se șterge.
setup-destination-custom-title = Alegeți spațiul pentru Luft
setup-destination-custom-description = Folosiți Discuri pentru a aranja unitățile cum doriți.
setup-destination-replace-title = Înlocuiește { $system }
setup-destination-replace-description = Luft îi ia locul și păstrează tot ce vă aparține.
setup-destination-meet-title = Lângă Windows
setup-destination-meet-description = Meet Luft a făcut deja acest loc, așa că Windows rămâne exact cum este.
setup-destination-meet-drive-title = Pe { $drive }
setup-destination-meet-drive-description = Meet Luft a făcut deja acest loc pe alt disc, iar Luft pornește de acolo cu propriile fișiere de pornire.
setup-destination-looking = Se analizează unitățile…

setup-destination-meet-choice = Alături de Windows
setup-destination-meet-choice-description = Folosiți spațiul de { $size } pregătit de Meet Luft lângă Windows.
setup-destination-meet-drive-choice = Pe { $drive }
setup-destination-meet-drive-choice-description = Folosiți spațiul de { $size } pregătit de Meet Luft pe { $drive }.
setup-destination-alongside-choice = Alături de { $windows }
setup-destination-alongside-choice-description = Păstrați Windows și fișierele lui și dați sistemului Luft o parte din unitate.
setup-destination-replace-choice = Înlocuiește { $system }
setup-destination-replace-choice-description = Păstrați fișierele, contul și setările și lăsați Luft să îi ia locul.
setup-destination-whole-choice = Folosește o unitate întreagă
setup-destination-whole-choice-description = Ștergeți o unitate și dați-o în întregime sistemului Luft.
setup-destination-try-choice = Doar încearcă Luft
setup-destination-try-choice-description = Explorați mai întâi. Nu se instalează nimic, iar unitățile rămân neatinse.
setup-destination-custom-choice = Personalizat
setup-destination-custom-choice-description = Aranjați manual partițiile în Discuri.

setup-destination-more-options = Mai multe opțiuni
setup-destination-starting = Se pornește…
setup-destination-replace = Înlocuiește
setup-destination-install = Instalează Luft

## Confirming where Luft goes

setup-confirm-replace-title = Înlocuiți { $system }?
setup-confirm-erase-title = Ștergeți { $drive }?
setup-confirm-shrink-title = Micșorați Windows la { $size }?
setup-confirm-meet-title = Instalați Luft lângă Windows?
setup-confirm-meet-drive-title = Instalați Luft pe { $drive }?
setup-confirm-free-title = Instalați Luft în spațiul liber?
setup-confirm-replace-keep-old = Copierea începe imediat. Vechiul sistem nu va mai porni, iar fișierele lui rămân până le eliminați.
setup-confirm-replace-erase-old = Copierea începe imediat. Vechiul sistem se șterge definitiv, iar fișierele rămân unde sunt.
setup-confirm-erase-description = Tot ce se află pe această unitate se șterge definitiv, inclusiv alte sisteme și fișiere.
setup-confirm-install-description = Copierea începe imediat. Între timp puteți configura contul.
setup-confirm-erase = Șterge și instalează
setup-confirm-install = Instalează

## Making room next to Windows

setup-alongside-hint = Trageți pentru a împărți { $drive } între Windows și Luft. Windows își păstrează toate fișierele și ceva spațiu pentru mai târziu.
setup-windows-bitlocker = Windows ține această unitate blocată cu BitLocker, așa că Luft nu poate face loc pe ea. În Windows, dezactivați criptarea dispozitivului sau micșorați unitatea în Gestionare disc și alegeți spațiul liber la Personalizat.
setup-windows-hibernated = Windows este în repaus sau a fost oprit cu Pornire rapidă, așa că unitatea lui nu poate fi modificată în siguranță. Porniți Windows, țineți apăsat Shift în timp ce alegeți Închidere, apoi porniți din nou Luft.
setup-windows-dirty = Unitatea Windows trebuie mai întâi verificată rapid. Porniți Windows, reporniți-l o dată, apoi porniți din nou Luft.
setup-windows-full = Windows are nevoie de aproape toată unitatea. Eliberați aproximativ { $size } în Windows, apoi porniți din nou Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Ce ați împachetat în Windows ({ $size }) se despachetează în noul cont.

## Windows options

setup-windows-fast-startup = Dezactivează Pornire rapidă în Windows
setup-windows-fast-startup-description = Windows se va opri complet, așa că sunetul, Wi-Fi și Bluetooth pornesc curat în Luft, iar unitatea lui rămâne accesibilă.
setup-windows-clock = Ora corectă în ambele sisteme
setup-windows-clock-description = Windows citește ceasul computerului la fel ca Luft, așa că ora nu mai sare când treceți de la un sistem la altul.
setup-windows-bluetooth = Păstrează dispozitivele Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } dispozitiv asociat în Windows va funcționa în Luft fără o nouă asociere.
    [few] { $count } dispozitive asociate în Windows vor funcționa în Luft fără o nouă asociere.
   *[other] { $count } de dispozitive asociate în Windows vor funcționa în Luft fără o nouă asociere.
}

## Choosing a drive

setup-drives-label = Unități
setup-drives-none = Nu există nicio unitate pe care Luft să o poată folosi. Conectați una și căutați din nou.
setup-drive-has-windows = Conține { $windows }
setup-drive-empty = Goală
setup-drive-partitions = { $count ->
    [one] { $count } partiție
    [few] { $count } partiții
   *[other] { $count } de partiții
}

## Custom space

setup-custom-open-disks = Deschide Discuri
setup-custom-looking = Se caută…
setup-custom-look-again = Caută din nou
setup-custom-free-label = Spațiu liber
setup-custom-free-space = Spațiu liber: { $size }
setup-custom-on-drive = Pe { $drive }
setup-custom-none = Eliberați cel puțin { $size } în Discuri, apoi căutați din nou. Luft se instalează în spațiul lăsat liber.

## Replacing a Linux system

setup-replace-stays = Ce rămâne
setup-replace-changes = Ce se schimbă
setup-replace-keeps-account = Fișierele și contul { $account }
setup-replace-keeps-account-password = Fișierele și contul { $account }, cu parola lui
setup-replace-keeps-accounts = { $count ->
    [one] Celălalt cont de pe sistem, cu fișierele lui
    [few] Celelalte { $count } conturi de pe sistem, cu fișierele lor
   *[other] Celelalte { $count } de conturi de pe sistem, cu fișierele lor
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } conexiune de rețea, cu parola Wi-Fi
    [few] { $count } conexiuni de rețea, cu parolele Wi-Fi
   *[other] { $count } de conexiuni de rețea, cu parolele Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montate la pornire ca înainte
setup-replace-keeps-hostname = Numele computerului, { $hostname }, și cheile lui SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } instrument de linie de comandă pe care l-ați instalat, într-un Toolbox după conectare
    [few] { $count } instrumente de linie de comandă pe care le-ați instalat, într-un Toolbox după conectare
   *[other] { $count } de instrumente de linie de comandă pe care le-ați instalat, într-un Toolbox după conectare
}
setup-replace-keeps-old = { $system } nu va mai porni. Fișierele lui de sistem se păstrează în old-system până le eliminați din Discuri sau Setări.
setup-replace-erases-system = Partiția de sistem din { $system } se șterge. Fișierele sunt pe o partiție separată și rămân neschimbate.
setup-replace-clears-boot = Partiția /boot se golește pentru a primi fișierele de pornire ale sistemului Luft.
setup-replace-apps = Aplicațiile instalate în el nu sunt preluate. Le puteți instala din nou din Schelf.

setup-replace-blocked-encrypted = Este criptat, așa că înlocuirea lui cu păstrarea fișierelor nu este acceptată încă.
setup-replace-blocked-single = Fișierele se află pe aceeași partiție cu sistemul, așa că înlocuirea lui cu păstrarea lor nu este acceptată încă.
setup-replace-blocked-layout = Unitatea lui este organizată într-un mod pe care Luft nu îl poate înlocui încă.
setup-replace-blocked-startup = Partiția de sistem EFI este prea mică pentru Luft și nu există o partiție /boot care să fie folosită în schimb.
setup-replace-blocked-no-account = Nu are niciun cont de preluat.
setup-replace-blocked-running = Luft pornește chiar acum de pe el. Porniți Luft de pe un stick USB pentru a-l înlocui.
setup-replace-blocked-read-only = Unitatea lui este doar în citire.

## Connecting to the internet

setup-network-title = Conectați-vă la internet
setup-network-description = Este opțional. Online, Luft poate seta ceasul și fusul orar, iar internetul poate fi folosit pe durata instalării.
setup-network-unavailable = Rețelele nu sunt disponibile momentan. Vă puteți conecta mai târziu din panou.
setup-network-looking = Se caută rețele…
setup-network-cable = Conectat prin cablu
setup-network-show-all = Afișează toate rețelele
setup-network-skip = Omite
setup-network-failed = Conectarea nu a reușit
setup-network-wrong-password = Parolă greșită
setup-network-connected = Conectat
setup-network-connecting = Se conectează…
setup-network-saved = Salvată
setup-network-password = Parolă
setup-network-join = Conectează

## Account

setup-account-title = Cine folosește acest computer?
setup-account-description = Acesta este contul cu care vă conectați. Puteți adăuga alte persoane mai târziu în Setări.
setup-account-full-name = Numele
setup-account-full-name-example = Ana Aslan
setup-account-user-name = Nume de utilizator
setup-account-password = Parolă
setup-account-repeat = Introduceți-o din nou
setup-account-user-name-invalid = Folosiți litere mici, cifre, - și _
setup-account-full-name-invalid = Nu folosiți virgule sau două puncte
setup-account-mismatch = Parolele nu se potrivesc

## Installing

setup-finishing-failed-title = Luft nu a putut fi instalat
setup-finishing-failed-description = Ceva nu a funcționat în timpul instalării.
setup-finishing-failed-stick = Computerul pornește în continuare ca înainte. Puteți folosi Luft în continuare de pe stickul USB sau puteți reporni și încerca din nou.
setup-finishing-failed-trying = Computerul pornește în continuare ca înainte. Puteți folosi Luft în continuare așa cum este acum sau puteți reporni și încerca din nou.
setup-finishing-use-stick = Folosește Luft de pe stick
setup-finishing-keep-trying = Continuă să încerci Luft
setup-finishing-installed-title = Luft este instalat
setup-finishing-trust-stick = Scoateți stickul USB când ecranul se întunecă. Apoi un ecran albastru vă cere să aveți încredere în Luft. Acolo folosiți tastatura.
setup-finishing-trust = Imediat după repornire, un ecran albastru vă cere să aveți încredere în Luft. Acolo folosiți tastatura.
setup-finishing-restart-stick = Reporniți pentru a începe să îl folosiți. Scoateți stickul USB când ecranul se întunecă.
setup-finishing-restart = Reporniți pentru a începe să îl folosiți.
setup-finishing-title = Aproape gata
setup-finishing-description = Luft se copiază pe computer. Durează câteva minute.
setup-finishing-plug-in = Țineți computerul conectat la priză până la final.
setup-stage-idle = Se pregătește
setup-stage-preparing = Se face loc pentru Luft
setup-stage-copying = Se copiază Luft
setup-stage-waiting = Se finalizează
setup-stage-configuring = Se configurează contul
setup-stage-finished = Gata

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Apăsați o tastă în 10 secunde
setup-enroll-choose-enroll = Alegeți Enroll MOK, apoi Continue
setup-enroll-choose-yes = Alegeți Yes
setup-enroll-type-code = Introduceți codul, apoi alegeți Reboot
setup-enroll-digits = { $count ->
    [one] { $count } cifră
    [few] { $count } cifre
   *[other] { $count } de cifre
}
setup-secure-boot-title = Computerul nu are încă încredere în Luft
setup-secure-boot-code = Imediat după următoarea repornire, un ecran albastru vă cere să aveți încredere în Luft. Acolo folosiți tastatura și acest cod.
setup-secure-boot-skipped = Ecranul albastru a fost omis. Obțineți un cod nou și reporniți, apoi folosiți tastatura acolo.
setup-secure-boot-getting = Se obține codul…
setup-secure-boot-new-code = Obține un cod nou

## Encryption

setup-protect-title = Protejați-vă fișierele
setup-protect-tpm = Criptați acest computer ca nimeni să nu vă poată citi fișierele fără conectare, chiar dacă îl pierdeți. Se deblochează singur la pornire.
setup-protect-passphrase = Criptați acest computer ca nimeni să nu vă poată citi fișierele fără fraza de acces, chiar dacă îl pierdeți.
setup-protect-staged-title = Fișierele vor fi criptate
setup-protect-staged-description = Criptarea începe singură după repornirea de la finalul configurării și puteți folosi computerul în timpul ei.
setup-protect-waiting-description = Luft încă își schimbă dimensiunea. După ce termină, criptarea pornește la următoarea repornire, iar între timp puteți folosi calculatorul în continuare.
setup-protect-keep-safe = Păstrați această cheie de recuperare într-un loc sigur, departe de acest computer. Veți avea nevoie de ea dacă computerul nu se mai poate debloca singur.
setup-protect-passphrase-label = Frază de acces
setup-protect-repeat = Introduceți-o din nou
setup-protect-mismatch = Nu se potrivesc
setup-protect-kept = Am păstrat cheia de recuperare
setup-protect-background = Criptarea are loc în fundal după următoarea repornire și puteți folosi computerul între timp.
setup-protect-encrypt = Criptează
setup-protect-checking = Se verifică…
setup-protect-start = Criptează fișierele

## Fingerprint

setup-fingerprint-title = Conectați-vă cu amprenta
setup-fingerprint-description = Deblocați Luft cu o atingere în loc să tastați parola. Puteți adăuga alte degete mai târziu în Setări.
setup-fingerprint-which = Care deget?
setup-fingerprint-another = Adăugați alt deget?
setup-fingerprint-finger = Deget
setup-fingerprint-no-reader = Cititorul de amprente nu răspunde. Puteți adăuga o amprentă mai târziu în Setări.
setup-fingerprint-add = Adaugă amprenta
setup-fingerprint-choose-another = Alege alt deget

## Done

setup-ready-title = Totul este gata
setup-ready-trust = Reporniți încă o dată pentru a finaliza. Imediat după repornire, un ecran albastru vă cere să aveți încredere în Luft. Acolo folosiți tastatura și acest cod.
setup-ready-restart = Reporniți încă o dată pentru a finaliza, apoi conectați-vă cu parola.
setup-ready-done = Desktopul este gata. Bucurați-vă de Luft.
setup-ready-start = Începe să folosești Luft
