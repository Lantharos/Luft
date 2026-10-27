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
memory-low-title = Luftu dochádza pamäť
memory-low-app-body = Aplikácia { $app } využíva { $size }. Vynúťte jej ukončenie, aby všetko ostatné reagovalo plynulo.
memory-low-container-body = Kontajner využíva { $size }. Vynúťte jeho ukončenie, aby všetko ostatné reagovalo plynulo.
memory-low-force-quit = Vynútiť ukončenie

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
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program môže vidieť vaše okná
    [few] { $count } programy môžu vidieť vaše okná
    [many] { $count } programu môže vidieť vaše okná
   *[other] { $count } programov môže vidieť vaše okná
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program môže vidieť a používať vaše okná
    [few] { $count } programy môžu vidieť a používať vaše okná
    [many] { $count } programu môže vidieť a používať vaše okná
   *[other] { $count } programov môže vidieť a používať vaše okná
}
privacy-windows-stop = Zrušiť prístup

## Window access prompt

peek-see-request = Povoliť programu, ktorý ste spustili, vidieť vaše okná?
peek-see-description = Bude môcť zachytiť obraz ktoréhokoľvek otvoreného okna.
peek-use-request = Povoliť programu, ktorý ste spustili, vidieť a používať vaše okná?
peek-use-description = Bude vidieť každé otvorené okno a bude v ňom môcť klikať a písať, akoby ste to boli vy.
peek-deny = Nepovoliť
peek-allow-once = Povoliť raz
peek-allow-until-quit = Povoliť do ukončenia

## Window access errors

peek-error-declined-until-quit = Používateľ tohto počítača to zamietol. Program sa môže znova opýtať po svojom ukončení.
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

## Quick settings tiles

auto-rotate-title = Automatické otáčanie
dark-style-title = Tmavý režim
do-not-disturb-title = Nerušiť
night-light-title = Nočné osvetlenie
airplane-mode-title = Režim v lietadle

## Power mode

power-profile-title = Režim napájania
power-profile-header = Režim napájania
power-profile-open-menu = Otvoriť ponuku režimov napájania
power-profile-settings = Nastavenia napájania
power-profile-performance = Výkon
power-profile-balanced = Vyvážený
power-profile-power-saver = Šetrenie energie
power-profile-custom = Vlastný

## Keep awake

caffeine-title = Nezaspávať
caffeine-open-menu = Otvoriť ponuku Nezaspávať
caffeine-until = Do { $time }
caffeine-until-turned-off = Kým sa nevypne
caffeine-30-minutes = 30 minút
caffeine-1-hour = 1 hodina
caffeine-2-hours = 2 hodiny
caffeine-inhibit-reason = Nezaspávať zapnuté v rýchlych nastaveniach

## Brightness

brightness-title = Jas
brightness-open-menu = Otvoriť ponuku jasu

## Keyboard backlight

backlight-title = Podsvietenie klávesnice
backlight-open-menu = Otvoriť ponuku jasu klávesnice
backlight-slider = Jas klávesnice
backlight-off = Vypnuté
backlight-low = Nízke
backlight-high = Vysoké

## Sound

volume-sound-settings = Nastavenia zvuku
volume-mute = Stlmiť
volume-unmute = Zrušiť stlmenie
volume-output-slider = Hlasitosť
volume-output-title = Výstup zvuku
volume-output-open-menu = Otvoriť ponuku výstupu zvuku
volume-input-slider = Mikrofón
volume-input-title = Vstup zvuku
volume-input-open-menu = Otvoriť ponuku vstupu zvuku

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvoriť ponuku Bluetooth
bluetooth-settings = Nastavenia Bluetooth
bluetooth-connect = Pripojiť
bluetooth-disconnect = Odpojiť
bluetooth-connect-device = Pripojiť { $deviceName }
bluetooth-disconnect-device = Odpojiť { $deviceName }
bluetooth-no-devices = Žiadne dostupné ani pripojené zariadenia
bluetooth-turn-on-hint = Ak chcete pripojiť zariadenia, zapnite Bluetooth
bluetooth-connected-count = { $count ->
    [one] Pripojené: { $count }
    [few] Pripojené: { $count }
    [many] Pripojené: { $count }
   *[other] Pripojené: { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <neznáma>
network-menu-connect = Pripojiť
network-menu-disconnect = Odpojiť
network-menu-connect-to = Pripojiť k { $name }
network-menu-disconnect-from = Odpojiť { $name }
network-menu-turn-off = Vypnúť
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zabezpečená, sila signálu { $strength } %
   *[no] { $name }, nezabezpečená, sila signálu { $strength } %
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] Pripojené: { $count }
    [few] Pripojené: { $count }
    [many] Pripojené: { $count }
   *[other] Pripojené: { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvoriť ponuku VPN
network-menu-vpn-settings = Nastavenia VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvoriť ponuku Wi-Fi
network-menu-wifi-settings = Všetky siete
network-menu-wired = Káblové pripojenia
network-menu-wired-open-menu = Otvoriť ponuku káblových pripojení
network-menu-wired-settings = Nastavenia káblovej siete
network-menu-tethers = Tethering cez Bluetooth
network-menu-tethers-open-menu = Otvoriť ponuku tetheringu cez Bluetooth
network-menu-tether = Tethering
network-menu-tether-settings = Nastavenia Bluetooth
network-menu-mobile-connections = Mobilné pripojenia
network-menu-mobile-open-menu = Otvoriť ponuku mobilných pripojení
network-menu-mobile-settings = Nastavenia mobilného pripojenia
network-menu-mobile = Mobilná sieť
network-device-wired = Káblové pripojenie
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prihlásiť sa do siete
network-menu-failed-title = Pripojenie zlyhalo
network-menu-failed-body = Sieťové pripojenie sa nepodarilo aktivovať

## Location access dialog

location-dialog-title = Povoliť prístup k polohe
location-dialog-description = Aplikácia { $appName } chce získať prístup k vašej polohe
location-dialog-info = Prístup k polohe môžete kedykoľvek zmeniť v nastaveniach súkromia
location-dialog-deny = Zamietnuť prístup
location-dialog-grant = Povoliť prístup

## Thunderbolt notifications

thunderbolt-unknown-title = Neznáme zariadenie Thunderbolt
thunderbolt-unknown-body = Počas vašej neprítomnosti bolo pripojené nové zariadenie. Ak ho chcete začať používať, odpojte ho a znova pripojte.
thunderbolt-unauthorized-title = Neautorizované zariadenie Thunderbolt
thunderbolt-unauthorized-body = Bolo pripojené nové zariadenie, ktoré musí schváliť správca
thunderbolt-error-title = Chyba autorizácie zariadenia Thunderbolt
thunderbolt-error-body = Zariadenie Thunderbolt sa nepodarilo autorizovať: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zamietnuť
access-dialog-allow = Povoliť

## Display change confirmation

display-change-title = Ponechať tieto nastavenia?
display-change-countdown = { $seconds ->
    [one] Zmeny nastavení sa vrátia o { $seconds } sekundu
    [few] Zmeny nastavení sa vrátia o { $seconds } sekundy
    [many] Zmeny nastavení sa vrátia o { $seconds } sekundy
   *[other] Zmeny nastavení sa vrátia o { $seconds } sekúnd
}
display-change-revert = Vrátiť späť
display-change-keep = Ponechať zmeny

## Drive connected notification

autorun-connected = Pripojené: „{ $driveName }“
autorun-ready = Disk je pripravený na použitie
autorun-open-with = Otvoriť v aplikácii { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Pomalé klávesy zapnuté
kbd-a11y-slow-keys-off = Pomalé klávesy vypnuté
kbd-a11y-slow-keys-description = Práve ste podržali kláves Shift 8 sekúnd. Je to skratka funkcie Pomalé klávesy, ktorá mení správanie klávesnice.
kbd-a11y-sticky-keys-on = Lepiace klávesy zapnuté
kbd-a11y-sticky-keys-off = Lepiace klávesy vypnuté
kbd-a11y-sticky-keys-on-description = Práve ste päťkrát za sebou stlačili kláves Shift. Je to skratka funkcie Lepiace klávesy, ktorá mení správanie klávesnice.
kbd-a11y-sticky-keys-off-description = Práve ste stlačili dva klávesy naraz alebo päťkrát za sebou kláves Shift. Tým sa vypína funkcia Lepiace klávesy, ktorá mení správanie klávesnice.
kbd-a11y-leave-on = Nechať zapnuté
kbd-a11y-turn-on = Zapnúť
kbd-a11y-turn-off = Vypnúť
kbd-a11y-leave-off = Nechať vypnuté

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Výber zvukového zariadenia
audio-device-cancel = Zrušiť
audio-device-sound-settings = Nastavenia zvuku
audio-device-headphones = Slúchadlá
audio-device-headset = Náhlavná súprava
audio-device-microphone = Mikrofón

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Povoliť blokovanie skratiek
inhibit-shortcuts-app = Aplikácia { $appName } chce blokovať systémové skratky
inhibit-shortcuts-unknown-app = Aplikácia chce blokovať systémové skratky
inhibit-shortcuts-restore = Skratky obnovíte stlačením { $shortcut }
inhibit-shortcuts-deny = Zamietnuť
inhibit-shortcuts-allow = Povoliť

## Unlocking encrypted drives

mount-hidden-volume = Skrytý zväzok
mount-windows-system-volume = Systémový zväzok Windows
mount-uses-keyfiles = Používa súbory kľúčov
mount-keyfiles-use-app = Zväzok, ktorý používa súbory kľúčov, odomknete v aplikácii <i>{ $appName }</i>
mount-keyfiles-need-app = Na odomknutie zväzku, ktorý používa súbory kľúčov, potrebujete externú aplikáciu, napríklad <i>Disky</i>
mount-pim-number = Číslo PIM
mount-pim-invalid = PIM musí byť číslo alebo prázdne
mount-password = Heslo
mount-remember-password = Zapamätať heslo
mount-cancel = Zrušiť
mount-unlock = Odomknúť
mount-open-app = Otvoriť { $appName }
mount-wrong-password = Nepodarilo sa. Skúste to znova.
mount-unlock-failed = Zväzok sa nepodarilo odomknúť
mount-pim-unsupported = Nainštalovaná verzia udisks nepodporuje nastavenie PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vyžaduje sa overenie
network-agent-wifi-rejected = Uložené heslo pre „{ $networkName }“ nefungovalo. Zadajte ho znova.
network-agent-wifi-secrets = Na prístup k bezdrôtovej sieti „{ $networkName }“ sú potrebné heslá alebo šifrovacie kľúče
network-agent-wps-hint = Môžete sa pripojiť aj stlačením tlačidla „WPS“ na smerovači
network-agent-wired-title = Overenie 802.1X pre káblovú sieť
network-agent-dsl-title = Overenie DSL
network-agent-pin-title = Vyžaduje sa kód PIN
network-agent-pin-body = Zariadenie mobilného pripojenia vyžaduje kód PIN
network-agent-vpn-title = Heslo VPN
network-agent-password-required = Na pripojenie k „{ $networkName }“ je potrebné heslo
network-agent-connect = Pripojiť
network-agent-cancel = Zrušiť
network-agent-password = Heslo
network-agent-username = Používateľské meno
network-agent-key = Kľúč
network-agent-private-key-password = Heslo súkromného kľúča
network-agent-identity = Identita
network-agent-service = Služba
network-agent-network-name = Názov siete
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Zachytenie obrazovky
screenshot-area = Výber oblasti
screenshot-screen = Výber obrazovky
screenshot-window = Výber okna
screenshot-take = Urobiť snímku obrazovky
screenshot-record = Nahrávať obrazovku
screenshot-show-pointer = Zobraziť ukazovateľ
screenshot-capture = Zachytiť
screenshot-close = Zavrieť
screenshot-screencasts-folder = Záznamy obrazovky
screenshot-screencast-file = Záznam obrazovky { $date } { $time }
screenshot-screenshots-folder = Snímky obrazovky
screenshot-file = Snímka obrazovky { $timestamp }
screenshot-screencast-recorded = Záznam obrazovky bol uložený
screenshot-screencast-start-failed = Záznam obrazovky sa nepodarilo spustiť
screenshot-screencast-out-of-space = Záznam obrazovky zlyhal: na disku nie je dosť miesta
screenshot-screencast-try-again = Záznam obrazovky zlyhal. Skúste to znova.
screenshot-screencast-failed = Záznam obrazovky zlyhal
screenshot-screencast-view = Kliknutím zobrazíte video
screenshot-show-in-rover = Zobraziť v aplikácii Rover
screenshot-captured = Snímka obrazovky bola zachytená
screenshot-captured-body = Obrázok môžete prilepiť zo schránky
