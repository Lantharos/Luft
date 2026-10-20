## Shared

system-cancel = Zrušiť

## Dictation notifications

dictation-setup-title = Píšte hlasom
dictation-setup-body = Hovorte a vaše slová sa napíšu v ľubovoľnej aplikácii. Reč sa spracúva priamo v tomto počítači, preto treba najprv stiahnuť rečový model.
dictation-setup-action = Nastaviť diktovanie
dictation-unsupported-title = Diktovanie v jazyku { $language } nie je v tomto počítači dostupné
dictation-unsupported-body = Procesor tohto počítača nedokáže spustiť rozpoznávanie reči, ktoré jazyk { $language } potrebuje. Môžete diktovať v inom jazyku.
dictation-settings-action = Nastavenia diktovania

## System health notifications

health-gpu-reset-title = Grafický ovládač prestal reagovať
health-gpu-reset-body = { $day ->
    [today] Počítač sa dnes o { $time } sám reštartoval. V Nastaveniach zistíte, čo môže zabrániť tomu, aby sa to opakovalo.
   *[other] Počítač sa sám reštartoval: { $date } o { $time }. V Nastaveniach zistíte, čo môže zabrániť tomu, aby sa to opakovalo.
}
health-gpu-reset-details = Podrobnosti

oom-app-closed-title = Aplikácia { $app } bola zatvorená, aby sa uvoľnila pamäť
oom-container-closed-title = Kontajner bol zatvorený, aby sa uvoľnila pamäť
oom-closed-body = V počítači dochádzala pamäť. Zatvorenie pomohlo, aby všetko ostatné reagovalo plynulo.
oom-closed-body-with-size = V počítači dochádzala pamäť. Zatvorenie pomohlo, aby všetko ostatné reagovalo plynulo. Využitá pamäť: { $size }.

## Input source indicator

input-source-indicator = Zdroj vstupu: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Režim v lietadle je zapnutý hardvérovo
media-keys-airplane-mode-on = Režim v lietadle zapnutý
media-keys-airplane-mode-off = Režim v lietadle vypnutý
media-keys-bluetooth-on = Bluetooth zapnutý
media-keys-bluetooth-off = Bluetooth vypnutý
media-keys-caps-lock-on = Caps Lock zapnutý
media-keys-caps-lock-off = Caps Lock vypnutý
media-keys-num-lock-on = Num Lock zapnutý
media-keys-num-lock-off = Num Lock vypnutý

## VPN sign-in

vpn-sign-in-title = Prihlásenie do siete { $connection }
vpn-connect = Pripojiť
vpn-signing-in = Prihlasuje sa…
vpn-finish-in-browser = Dokončite prihlásenie v prehliadači.
vpn-certificate-untrusted = Server { $host } predložil certifikát, ktorý sa nedá overiť ({ $reason }). Jeho odtlačok je { $fingerprint }.
vpn-certificate-warning = Niekto sa môže vydávať za tento server. Pripojte sa, iba ak ste to očakávali.
vpn-certificate-connect = Napriek tomu pripojiť

vpn-field-password = Heslo
vpn-field-certificate-password = Heslo certifikátu
vpn-field-proxy-password = Heslo proxy
vpn-field-pre-shared-key = Predzdieľaný kľúč
vpn-field-group-password = Heslo skupiny

## Battery notifications

battery-left = Zostáva { $percent }.
battery-left-with-time = Zostáva { $percent }, približne { $duration }.
battery-low-title = Slabá batéria
battery-very-low-title = Veľmi slabá batéria
battery-almost-empty-title = Batéria je takmer vybitá
battery-ups-low-title = Slabá batéria UPS
battery-ups-very-low-title = Veľmi slabá batéria UPS
battery-ups-almost-empty-title = Batéria UPS je takmer vybitá
battery-very-low-body = { $left } Čoskoro pripojte napájanie.
battery-almost-empty-body = { $left } Pripojte napájanie hneď, aby ste neprišli o neuloženú prácu.

battery-device-low-title = { $device }: slabá batéria
battery-device-very-low-title = { $device }: veľmi slabá batéria
battery-device-low-body = { $left } Čoskoro zariadenie nabite.
battery-device-very-low-body = { $left } Nabite zariadenie hneď, aby sa nevyplo.

battery-device-mouse = Myš
battery-device-keyboard = Klávesnica
battery-device-phone = Telefón
battery-device-tablet = Tablet
battery-device-controller = Ovládač
battery-device-pen = Pero
battery-device-touchpad = Touchpad
battery-device-headset = Náhlavná súprava
battery-device-speaker = Reproduktor
battery-device-headphones = Slúchadlá
battery-device-remote = Diaľkový ovládač
battery-device-other = Pripojené zariadenie

## Privacy indicator

privacy-indicator = Používa sa: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofón
privacy-thing-screen = obrazovka
privacy-thing-location = poloha
privacy-thing-windows = okná

privacy-camera-unknown-app = Kameru používa aplikácia
privacy-stop-sharing = Zastaviť zdieľanie obrazovky
privacy-stop-recording = Zastaviť nahrávanie
privacy-turn-off-location = Vypnúť služby určovania polohy
privacy-settings = Nastavenia súkromia
privacy-camera = Kamera
privacy-microphone = Mikrofón
privacy-microphone-muted = Mikrofón stlmený
privacy-mute-microphone = Stlmiť mikrofón
privacy-unmute-microphone = Zrušiť stlmenie mikrofónu
privacy-close-app = Zavrieť { $app }
privacy-unknown-app = Aplikácia
privacy-windows-using = Používa vaše okná
privacy-windows-seeing = Vidí vaše okná
privacy-windows-stop = Zrušiť prístup

## Window access prompt

peek-see-title = { $app } chce vidieť vaše okná
peek-see-description = Bude môcť zachytiť obraz ktoréhokoľvek otvoreného okna.
peek-use-title = { $app } chce vidieť a používať vaše okná
peek-use-description = Bude vidieť každé otvorené okno a bude v ňom môcť klikať a písať, akoby ste to boli vy.
peek-deny = Nepovoliť
peek-allow-once = Povoliť raz
peek-allow-until-quit = Povoliť do ukončenia

## Window access errors

peek-error-declined = Používateľ tohto počítača to zamietol. { $app } sa môže znova opýtať po svojom ukončení.
peek-error-not-allowed = Používateľ tohto počítača to nepovolil
peek-error-sandboxed = Aplikácie v izolovanom prostredí nemôžu vidieť ani používať iné okná
peek-error-unknown-caller = Program, ktorý žiada, sa ukončil alebo ho nebolo možné rozpoznať
peek-error-no-caller = Zbernica relácie neuviedla, ktorý program žiada
peek-error-screen-busy = Obrazovka je zamknutá alebo je na nej otvorená systémová výzva. Skúste to znova, keď zmizne.
peek-error-input-held = Niekto drží stlačené klávesy alebo tlačidlá myši. Skúste to znova o chvíľu.
peek-error-input-dropped = Vstup bol zastavený, pretože keď dorazil, pod daným bodom bolo niečo iné alebo klávesnicu malo iné okno
peek-error-not-in-front = Okno sa nepodarilo presunúť do popredia
peek-error-covered = Túto časť okna zakrýva niečo iné
peek-error-outside = Bod { $x }, { $y } je mimo obrazu okna, ktorý má rozmery { $width } × { $height }
peek-error-nothing-to-capture = Okno nezobrazuje nič, čo by sa dalo zachytiť
peek-error-window-picture-late = Obraz okna nebol pripravený včas
peek-error-screen-picture-late = Obraz obrazovky nebol pripravený včas
peek-error-no-window-id = Žiadne okno nemá ID { $id }. Otvorené okná vypíše peek list.
peek-error-no-window-for-handle = Program spustený ako { $handle } nemá otvorené žiadne okno
peek-error-ended-before-window = Program sa ukončil skôr, ako otvoril okno
peek-error-no-window-in-time = Počas { $duration } sa neotvorilo žiadne okno
peek-error-launch-not-started-by-peek = Spustiť sa dá iba program, ktorý spustil samotný peek run
peek-error-ended-while-starting = Program sa ukončil počas spúšťania
peek-error-launch-failed = systemd nedokázal spustiť { $program }
peek-error-unknown-handle = Nič, čo ste spustili pomocou peek run, nemá identifikátor { $handle }, alebo sa to už ukončilo
peek-error-unknown-key = { $key } nie je kláves, ktorý peek pozná
peek-error-unknown-modifier = { $modifier } nie je modifikačný kláves. Použite ctrl, shift, alt alebo super.
peek-error-display-owner = Táto obrazovka patrí inému programu
peek-error-display-run = Programy v skrytej obrazovke spúšťa peek run
peek-error-display-handle = Táto obrazovka bola spustená ako { $handle }, nie ako { $requested }
