## Buttons used across steps

setup-continue = Nadaljuj
setup-back = Nazaj
setup-cancel = Prekliči
setup-not-now = Ne zdaj
setup-try-again = Poskusi znova
setup-restart = Znova zaženi
setup-restart-now = Znova zaženi zdaj
setup-restart-later = Znova zaženi pozneje
setup-saving = Shranjevanje …

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Nameščanje Lufta
setup-installing-progress = Nameščanje, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Iskanje
setup-picker-no-match = Ni zadetkov

## Welcome step: language, keyboard and time zone

setup-region-title = Dobrodošli v Luftu
setup-region-language = Jezik
setup-region-keyboard = Tipkovnica
setup-region-time-zone = Časovni pas
setup-region-intro = Začnimo z nastavitvijo. Izberite jezik, tipkovnico in časovni pas.
setup-region-intro-guessed-computer = Začnimo z nastavitvijo. Te nastavitve smo prevzeli iz računalnika, zato popravite, kar ni prav.
setup-region-intro-guessed = Začnimo z nastavitvijo. Nekaj smo že izpolnili: { $guesses }. Popravite, kar ni prav.
setup-region-guess-from-computer = { $fields } glede na računalnik
setup-region-guess-from-network = { $fields } glede na omrežje
setup-region-field-language = jezik
setup-region-field-keyboard = tipkovnica
setup-region-field-time-zone = časovni pas

## Where Luft goes

setup-destination-choose-title = Kam naj se namesti Luft?
setup-destination-choose-description = Izberite, kako bo Luft umeščen v ta računalnik. Dokler ne potrdite, se nič ne spremeni.
setup-destination-alongside-title = Naredite prostor ob sistemu Windows
setup-destination-alongside-description = Windows se zmanjša, da se naredi prostor za Luft. Vaše datoteke v sistemu Windows ostanejo nespremenjene.
setup-destination-whole-title = Izberite disk
setup-destination-whole-description = Luft zasede celoten disk. Vse na njem se izbriše.
setup-destination-custom-title = Izberite prostor za Luft
setup-destination-custom-description = Diske razporedite po svoje v aplikaciji Diski.
setup-destination-replace-title = Zamenjajte { $system }
setup-destination-replace-description = Luft ga nadomesti in ohrani vse, kar je vaše.
setup-destination-meet-title = Ob sistemu Windows
setup-destination-meet-description = Meet Luft je ta prostor že pripravil, zato Windows ostane povsem nespremenjen.
setup-destination-meet-drive-title = Disk: { $drive }
setup-destination-meet-drive-description = Meet Luft je ta prostor že pripravil na drugem disku, Luft pa se zaganja od tam z lastnimi zagonskimi datotekami.
setup-destination-looking = Pregledovanje diskov …

setup-destination-meet-choice = Ob sistemu Windows
setup-destination-meet-choice-description = Uporabite prostor ({ $size }), ki ga je Meet Luft pripravil ob sistemu Windows.
setup-destination-meet-drive-choice = Disk: { $drive }
setup-destination-meet-drive-choice-description = Uporabite prostor ({ $size }), ki ga je Meet Luft pripravil na disku { $drive }.
setup-destination-alongside-choice = Ob sistemu { $windows }
setup-destination-alongside-choice-description = Obdržite Windows in njegove datoteke, Luftu pa namenite del njegovega diska.
setup-destination-replace-choice = Zamenjaj { $system }
setup-destination-replace-choice-description = Obdržite datoteke, račun in nastavitve, Luft pa naj nadomesti stari sistem.
setup-destination-whole-choice = Uporabi celoten disk
setup-destination-whole-choice-description = Izbrišite disk in ga v celoti namenite Luftu.
setup-destination-try-choice = Samo preizkusi Luft
setup-destination-try-choice-description = Najprej se razglejte. Nič se ne namesti in diski ostanejo nedotaknjeni.
setup-destination-custom-choice = Po meri
setup-destination-custom-choice-description = Particije razporedite sami v aplikaciji Diski.

setup-destination-more-options = Več možnosti
setup-destination-starting = Zagon …
setup-destination-replace = Zamenjaj
setup-destination-install = Namesti Luft

## Confirming where Luft goes

setup-confirm-replace-title = Želite zamenjati { $system }?
setup-confirm-erase-title = Želite izbrisati { $drive }?
setup-confirm-shrink-title = Želite Windows zmanjšati na { $size }?
setup-confirm-meet-title = Želite Luft namestiti ob sistem Windows?
setup-confirm-meet-drive-title = Želite Luft namestiti na disk { $drive }?
setup-confirm-free-title = Želite Luft namestiti v prosti prostor?
setup-confirm-replace-keep-old = Kopiranje se začne takoj. Stari sistem se ne bo več zagnal, njegove datoteke pa ostanejo, dokler jih ne odstranite.
setup-confirm-replace-erase-old = Kopiranje se začne takoj. Stari sistem se trajno izbriše, vaše datoteke pa ostanejo, kjer so.
setup-confirm-erase-description = Vse na tem disku se trajno izbriše, tudi drugi sistemi in datoteke.
setup-confirm-install-description = Kopiranje se začne takoj. Medtem lahko nastavite svoj račun.
setup-confirm-erase = Izbriši in namesti
setup-confirm-install = Namesti

## Making room next to Windows

setup-alongside-hint = Povlecite, da razdelite { $drive } med Windows in Luft. Windows obdrži vse svoje datoteke in nekaj prostora za rast.
setup-windows-bitlocker = Windows ima ta disk zaklenjen z BitLockerjem, zato Luft na njem ne more narediti prostora. V sistemu Windows izklopite šifriranje naprave ali pa disk zmanjšajte v Upravljanju diskov in prosti prostor izberite pod možnostjo Po meri.
setup-windows-hibernated = Windows je v stanju mirovanja ali je bil zaustavljen s hitrim zagonom, zato njegovega diska ni mogoče varno spremeniti. Zaženite Windows, držite Shift, ko izberete Zaustavitev sistema, nato znova zaženite Luft.
setup-windows-dirty = Disk sistema Windows je treba najprej hitro preveriti. Zaženite Windows, ga enkrat znova zaženite, nato znova zaženite Luft.
setup-windows-full = Windows potrebuje skoraj ves svoj disk. V sistemu Windows sprostite približno { $size }, nato znova zaženite Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Stvari, ki ste jih zapakirali v sistemu Windows ({ $size }), se razpakirajo v vaš novi račun.

## Windows options

setup-windows-fast-startup = Izklopi hitri zagon v sistemu Windows
setup-windows-fast-startup-description = Windows se tako povsem zaustavi, zato se zvok, Wi-Fi in Bluetooth v Luftu zaženejo na novo, njegov disk pa ostane dostopen.
setup-windows-clock = Ohrani pravilno uro v obeh sistemih
setup-windows-clock-description = Windows bo uro računalnika bral enako kot Luft, zato čas ob preklopu ne bo več skakal.
setup-windows-bluetooth = Prenesi naprave Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } naprava, seznanjena v sistemu Windows, bo v Luftu delovala brez vnovičnega seznanjanja.
    [two] { $count } napravi, seznanjeni v sistemu Windows, bosta v Luftu delovali brez vnovičnega seznanjanja.
    [few] { $count } naprave, seznanjene v sistemu Windows, bodo v Luftu delovale brez vnovičnega seznanjanja.
   *[other] { $count } naprav, seznanjenih v sistemu Windows, bo v Luftu delovalo brez vnovičnega seznanjanja.
}

## Choosing a drive

setup-drives-label = Diski
setup-drives-none = Ni diska, ki bi ga Luft lahko uporabil. Priključite disk in poglejte znova.
setup-drive-has-windows = Na njem je { $windows }
setup-drive-empty = Prazen
setup-drive-partitions = { $count ->
    [one] Ima { $count } particijo
    [two] Ima { $count } particiji
    [few] Ima { $count } particije
   *[other] Ima { $count } particij
}

## Custom space

setup-custom-open-disks = Odpri Diske
setup-custom-looking = Iskanje …
setup-custom-look-again = Poglej znova
setup-custom-free-label = Prosti prostor
setup-custom-free-space = Prosti prostor: { $size }
setup-custom-on-drive = Disk: { $drive }
setup-custom-none = V aplikaciji Diski sprostite vsaj { $size } prostora, nato poglejte znova. Luft se namesti v prostor, ki ga pustite prostega.

## Replacing a Linux system

setup-replace-stays = Kaj ostane
setup-replace-changes = Kaj se spremeni
setup-replace-keeps-account = Vaše datoteke in račun { $account }
setup-replace-keeps-account-password = Vaše datoteke in račun { $account } z geslom
setup-replace-keeps-accounts = { $count ->
    [one] { $count } drug račun v sistemu, z datotekami
    [two] { $count } druga računa v sistemu, z datotekami
    [few] { $count } drugi računi v sistemu, z datotekami
   *[other] { $count } drugih računov v sistemu, z datotekami
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } omrežna povezava z geslom za Wi-Fi
    [two] { $count } omrežni povezavi z gesli za Wi-Fi
    [few] { $count } omrežne povezave z gesli za Wi-Fi
   *[other] { $count } omrežnih povezav z gesli za Wi-Fi
}
setup-replace-keeps-drives = { $drives }, ki se kot doslej priklopijo ob zagonu
setup-replace-keeps-hostname = Ime računalnika, { $hostname }, in njegovi ključi SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } orodje ukazne vrstice, ki ste ga namestili, v okolju Toolbox po prijavi
    [two] { $count } orodji ukazne vrstice, ki ste ju namestili, v okolju Toolbox po prijavi
    [few] { $count } orodja ukazne vrstice, ki ste jih namestili, v okolju Toolbox po prijavi
   *[other] { $count } orodij ukazne vrstice, ki ste jih namestili, v okolju Toolbox po prijavi
}
setup-replace-keeps-old = Sistem { $system } se ne bo več zaganjal. Njegove sistemske datoteke ostanejo v mapi old-system, dokler jih ne odstranite v Diskih ali Nastavitvah.
setup-replace-erases-system = Sistemska particija sistema { $system } se izbriše. Vaše datoteke so na lastni particiji in ostanejo nespremenjene.
setup-replace-clears-boot = Particija /boot se izprazni za Luftove zagonske datoteke.
setup-replace-apps = Aplikacije, nameščene v starem sistemu, se ne prenesejo. Znova jih namestite iz aplikacije Schelf.

setup-replace-blocked-encrypted = Sistem je šifriran, zato zamenjava z ohranitvijo datotek še ni podprta.
setup-replace-blocked-single = Vaše datoteke so na isti particiji kot sistem, zato zamenjava z ohranitvijo datotek še ni podprta.
setup-replace-blocked-layout = Disk tega sistema je razporejen tako, da ga Luft še ne more zamenjati.
setup-replace-blocked-startup = Sistemska particija EFI je za Luft premajhna, particije /boot, ki bi jo lahko uporabil namesto nje, pa ni.
setup-replace-blocked-no-account = Sistem nima računa, ki bi ga lahko prenesli.
setup-replace-blocked-running = Luft se trenutno zaganja iz tega sistema. Za zamenjavo zaženite Luft s ključka USB.
setup-replace-blocked-read-only = Disk tega sistema je samo za branje.

## Connecting to the internet

setup-network-title = Povežite se z internetom
setup-network-description = To ni obvezno. S povezavo lahko Luft nastavi uro in časovni pas, med nameščanjem pa lahko uporabljate internet.
setup-network-unavailable = Omrežja trenutno niso na voljo. Povežete se lahko pozneje prek opravilne vrstice.
setup-network-looking = Iskanje omrežij …
setup-network-cable = Povezano s kablom
setup-network-show-all = Pokaži vsa omrežja
setup-network-skip = Preskoči
setup-network-failed = Povezava ni uspela
setup-network-wrong-password = Napačno geslo
setup-network-connected = Povezano
setup-network-connecting = Povezovanje …
setup-network-saved = Shranjeno
setup-network-password = Geslo
setup-network-join = Poveži

## Account

setup-account-title = Kdo uporablja ta računalnik?
setup-account-description = S tem računom se boste prijavljali. Več oseb lahko pozneje dodate v Nastavitvah.
setup-account-full-name = Vaše ime
setup-account-full-name-example = France Prešeren
setup-account-user-name = Uporabniško ime
setup-account-password = Geslo
setup-account-repeat = Vnesite ga znova
setup-account-user-name-invalid = Uporabite male črke, številke, - in _
setup-account-full-name-invalid = Brez vejic in dvopičij
setup-account-mismatch = Gesli se ne ujemata

## Installing

setup-finishing-failed-title = Lufta ni bilo mogoče namestiti
setup-finishing-failed-description = Med nameščanjem je prišlo do napake.
setup-finishing-failed-stick = Računalnik se še vedno zaganja tako kot prej. Luft lahko še naprej uporabljate s ključka USB ali pa ga znova zaženete in poskusite znova.
setup-finishing-failed-trying = Računalnik se še vedno zaganja tako kot prej. Luft lahko še naprej uporabljate takšnega, kot je zdaj, ali pa ga znova zaženete in poskusite znova.
setup-finishing-use-stick = Uporabljaj Luft s ključka
setup-finishing-keep-trying = Še naprej preizkušaj Luft
setup-finishing-installed-title = Luft je nameščen
setup-finishing-trust-stick = Ko zaslon potemni, odstranite ključek USB. Nato modri zaslon vpraša, ali zaupate Luftu. Tam uporabite tipkovnico.
setup-finishing-trust = Takoj po vnovičnem zagonu modri zaslon vpraša, ali zaupate Luftu. Tam uporabite tipkovnico.
setup-finishing-restart-stick = Za začetek uporabe znova zaženite računalnik. Ko zaslon potemni, odstranite ključek USB.
setup-finishing-restart = Za začetek uporabe znova zaženite računalnik.
setup-finishing-title = Skoraj končano
setup-finishing-description = Luft se kopira v vaš računalnik. To traja nekaj minut.
setup-finishing-plug-in = Računalnik naj bo priključen na napajanje, dokler se to ne konča.
setup-stage-idle = Priprava
setup-stage-preparing = Ustvarjanje prostora za Luft
setup-stage-copying = Kopiranje Lufta
setup-stage-waiting = Zaključevanje
setup-stage-configuring = Nastavljanje vašega računa
setup-stage-finished = Končano

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = V 10 sekundah pritisnite katero koli tipko
setup-enroll-choose-enroll = Izberite Enroll MOK, nato Continue
setup-enroll-choose-yes = Izberite Yes
setup-enroll-type-code = Vnesite kodo, nato izberite Reboot
setup-enroll-digits = { $count ->
    [one] { $count } števka
    [two] { $count } števki
    [few] { $count } števke
   *[other] { $count } števk
}
setup-secure-boot-title = Računalnik Luftu še ne zaupa
setup-secure-boot-code = Takoj po naslednjem vnovičnem zagonu modri zaslon vpraša, ali zaupate Luftu. Tam s tipkovnico vnesite to kodo.
setup-secure-boot-skipped = Modri zaslon je bil preskočen. Pridobite novo kodo in znova zaženite računalnik, nato tam uporabite tipkovnico.
setup-secure-boot-getting = Pridobivanje kode …
setup-secure-boot-new-code = Pridobi novo kodo

## Encryption

setup-protect-title = Zaščitite svoje datoteke
setup-protect-tpm = Šifrirajte ta računalnik, da nihče ne more brati vaših datotek brez prijave, tudi če ga izgubite. Ob zagonu se odklene sam.
setup-protect-passphrase = Šifrirajte ta računalnik, da nihče ne more brati vaših datotek brez vašega šifrirnega gesla, tudi če računalnik izgubite.
setup-protect-staged-title = Vaše datoteke bodo šifrirane
setup-protect-staged-description = Šifriranje se začne samo po vnovičnem zagonu ob koncu nastavitve, računalnik pa lahko medtem uporabljate naprej.
setup-protect-keep-safe = Ta obnovitveni ključ shranite na varno mesto, ločeno od tega računalnika. Potrebovali ga boste, če se računalnik kdaj ne bo mogel odkleniti sam.
setup-protect-passphrase-label = Šifrirno geslo
setup-protect-repeat = Vnesite ga znova
setup-protect-mismatch = Vnosa se ne ujemata
setup-protect-kept = Obnovitveni ključ je shranjen na varnem
setup-protect-background = Šifriranje poteka v ozadju po naslednjem vnovičnem zagonu, računalnik pa lahko medtem uporabljate naprej.
setup-protect-encrypt = Šifriraj
setup-protect-checking = Preverjanje …
setup-protect-start = Šifriraj moje datoteke

## Fingerprint

setup-fingerprint-title = Prijava s prstom
setup-fingerprint-description = Luft odklenite z dotikom, namesto da vnašate geslo. Več prstov lahko pozneje dodate v Nastavitvah.
setup-fingerprint-which = Kateri prst?
setup-fingerprint-another = Želite dodati še en prst?
setup-fingerprint-finger = Prst
setup-fingerprint-no-reader = Bralnik prstnih odtisov se ne odziva. Prstni odtis lahko pozneje dodate v Nastavitvah.
setup-fingerprint-add = Dodaj prstni odtis
setup-fingerprint-choose-another = Izberi drug prst

## Done

setup-ready-title = Vse je pripravljeno
setup-ready-trust = Za dokončanje še enkrat znova zaženite računalnik. Takoj po vnovičnem zagonu modri zaslon vpraša, ali zaupate Luftu. Tam s tipkovnico vnesite to kodo.
setup-ready-restart = Za dokončanje še enkrat znova zaženite računalnik, nato se prijavite z geslom.
setup-ready-done = Vaše namizje je pripravljeno. Uživajte v Luftu.
setup-ready-start = Začni uporabljati Luft
