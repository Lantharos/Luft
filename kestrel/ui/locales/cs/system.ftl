## Shared

system-cancel = Zrušit

## Dictation notifications

dictation-setup-title = Psaní hlasem
dictation-setup-body = Mluvte a vaše slova se zapíšou v jakékoli aplikaci. Řeč se zpracovává přímo v tomto počítači, takže je nejdřív potřeba stáhnout model řeči.
dictation-setup-action = Nastavit diktování
dictation-unsupported-title = Diktování v jazyce { $language } není v tomto počítači k dispozici
dictation-unsupported-body = Procesor tohoto počítače nezvládne rozpoznávání řeči, které jazyk { $language } potřebuje. Můžete diktovat v jiném jazyce.
dictation-settings-action = Nastavení diktování

## System health notifications

health-gpu-reset-title = Grafický ovladač přestal odpovídat
health-gpu-reset-body = { $day ->
    [today] Počítač se dnes v { $time } sám restartoval. V Nastavení zjistíte, co může zabránit tomu, aby se to opakovalo.
   *[other] Počítač se { $date } v { $time } sám restartoval. V Nastavení zjistíte, co může zabránit tomu, aby se to opakovalo.
}
health-gpu-reset-details = Podrobnosti

oom-app-closed-title = Aplikace { $app } byla zavřena, aby se uvolnila paměť
oom-container-closed-title = Kontejner byl zavřen, aby se uvolnila paměť
oom-closed-body = Počítači docházela paměť. Zavřením se uvolnilo místo, aby vše ostatní dál plynule reagovalo.
oom-closed-body-with-size = Počítači docházela paměť. Zavřením se uvolnilo { $size }, aby vše ostatní dál plynule reagovalo.
memory-low-title = Systému Luft dochází paměť
memory-low-app-body = Aplikace { $app } používá { $size }. Vynuťte její ukončení, aby vše ostatní dál plynule reagovalo.
memory-low-container-body = Kontejner používá { $size }. Vynuťte jeho ukončení, aby vše ostatní dál plynule reagovalo.
memory-low-force-quit = Vynutit ukončení

## Input source indicator

input-source-indicator = Vstupní zdroj: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Režim v letadle je zapnutý hardwarovým přepínačem
media-keys-airplane-mode-on = Režim v letadle zapnut
media-keys-airplane-mode-off = Režim v letadle vypnut
media-keys-bluetooth-on = Bluetooth zapnut
media-keys-bluetooth-off = Bluetooth vypnut
media-keys-caps-lock-on = Caps Lock zapnut
media-keys-caps-lock-off = Caps Lock vypnut
media-keys-num-lock-on = Num Lock zapnut
media-keys-num-lock-off = Num Lock vypnut

## VPN sign-in

vpn-sign-in-title = Přihlášení k VPN { $connection }
vpn-connect = Připojit
vpn-signing-in = Přihlašování…
vpn-finish-in-browser = Dokončete přihlášení v prohlížeči.
vpn-certificate-untrusted = Server { $host } předložil certifikát, který nelze ověřit ({ $reason }). Jeho otisk je { $fingerprint }.
vpn-certificate-warning = Někdo se může vydávat za tento server. Připojte se, jen pokud jste to očekávali.
vpn-certificate-connect = Přesto připojit

vpn-field-password = Heslo
vpn-field-certificate-password = Heslo certifikátu
vpn-field-proxy-password = Heslo proxy
vpn-field-pre-shared-key = Předsdílený klíč
vpn-field-group-password = Heslo skupiny

## Battery notifications

battery-left = Zbývá { $percent }.
battery-left-with-time = Zbývá { $percent }, přibližně { $duration }.
battery-low-title = Slabá baterie
battery-very-low-title = Velmi slabá baterie
battery-almost-empty-title = Baterie je téměř vybitá
battery-ups-low-title = Slabá baterie UPS
battery-ups-very-low-title = Velmi slabá baterie UPS
battery-ups-almost-empty-title = Baterie UPS je téměř vybitá
battery-very-low-body = { $left } Brzy připojte napájení.
battery-almost-empty-body = { $left } Připojte napájení hned, abyste nepřišli o neuloženou práci.

battery-device-low-title = { $device }: slabá baterie
battery-device-very-low-title = { $device }: velmi slabá baterie
battery-device-low-body = { $left } Zařízení brzy nabijte.
battery-device-very-low-body = { $left } Nabijte zařízení hned, jinak se vypne.

battery-device-mouse = Myš
battery-device-keyboard = Klávesnice
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Herní ovladač
battery-device-pen = Pero
battery-device-touchpad = Touchpad
battery-device-headset = Náhlavní souprava
battery-device-speaker = Reproduktor
battery-device-headphones = Sluchátka
battery-device-remote = Dálkový ovladač
battery-device-other = Připojené zařízení

## Privacy indicator

privacy-indicator = Právě se používá: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = obrazovka
privacy-thing-location = poloha
privacy-thing-windows = okna

privacy-camera-unknown-app = Kameru používá nějaká aplikace
privacy-stop-sharing = Ukončit sdílení obrazovky
privacy-stop-recording = Ukončit nahrávání
privacy-turn-off-location = Vypnout služby určování polohy
privacy-settings = Nastavení soukromí
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon ztlumen
privacy-mute-microphone = Ztlumit mikrofon
privacy-unmute-microphone = Zrušit ztlumení mikrofonu
privacy-close-app = Zavřít { $app }
privacy-unknown-app = Neznámá aplikace
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program může vidět vaše okna
    [few] { $count } programy mohou vidět vaše okna
    [many] { $count } programu může vidět vaše okna
   *[other] { $count } programů může vidět vaše okna
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program může vidět a ovládat vaše okna
    [few] { $count } programy mohou vidět a ovládat vaše okna
    [many] { $count } programu může vidět a ovládat vaše okna
   *[other] { $count } programů může vidět a ovládat vaše okna
}
privacy-windows-stop = Odebrat přístup

## Window access prompt

peek-see-request = Povolit programu, který jste spustili, vidět vaše okna?
peek-see-description = Bude moct pořizovat snímky kteréhokoli otevřeného okna.
peek-use-request = Povolit programu, který jste spustili, vidět a ovládat vaše okna?
peek-use-description = Uvidí všechna otevřená okna a bude v nich moct klikat a psát, jako byste to dělali vy.
peek-deny = Nepovolit
peek-allow-once = Povolit jednou
peek-allow-until-quit = Povolit do ukončení

## Window access errors

peek-error-declined-until-quit = Uživatel tohoto počítače žádost odmítl. Program může požádat znovu po svém ukončení.
peek-error-not-allowed = Uživatel tohoto počítače to nepovolil
peek-error-sandboxed = Aplikace v izolovaném prostředí nemohou vidět ani ovládat jiná okna
peek-error-unknown-caller = Žádající program skončil nebo ho nelze rozpoznat
peek-error-no-caller = Sběrnice relace neuvedla, který program žádá
peek-error-screen-busy = Obrazovka je zamknutá nebo je na ní otevřená systémová výzva. Zkuste to znovu, až zmizí.
peek-error-input-held = Někdo drží stisknuté klávesy nebo tlačítka myši. Zkuste to za chvíli znovu.
peek-error-input-dropped = Vstup byl zastaven, protože v době jeho doručení bylo v daném bodě něco jiného nebo klávesnici ovládalo jiné okno
peek-error-not-in-front = Okno se nepodařilo přenést do popředí
peek-error-covered = Tuto část okna zakrývá něco jiného
peek-error-outside = Bod { $x }, { $y } leží mimo snímek okna o velikosti { $width } × { $height }
peek-error-nothing-to-capture = Okno nezobrazuje nic, co by šlo zachytit
peek-error-window-picture-late = Snímek okna nebyl připraven včas
peek-error-screen-picture-late = Snímek obrazovky nebyl připraven včas
peek-error-no-window-id = Žádné okno nemá id { $id }. Otevřená okna vypíše peek list.
peek-error-no-window-for-handle = Program spuštěný jako { $handle } nemá otevřené žádné okno
peek-error-ended-before-window = Program skončil dřív, než otevřel okno
peek-error-no-window-in-time = Během { $duration } se neotevřelo žádné okno
peek-error-launch-not-started-by-peek = Spustit lze jen program, který spustil sám peek run
peek-error-ended-while-starting = Program skončil během spouštění
peek-error-launch-failed = systemd nemohl spustit { $program }
peek-error-unknown-handle = Nic, co jste spustili pomocí peek run, nemá identifikátor { $handle }, nebo to už skončilo
peek-error-unknown-key = { $key } není klávesa, kterou peek zná
peek-error-unknown-modifier = { $modifier } není modifikační klávesa. Použijte ctrl, shift, alt nebo super.
peek-error-display-owner = Tento displej patří jinému programu
peek-error-display-run = Programy ve skrytém displeji spouští peek run
peek-error-display-handle = Tento displej byl spuštěn jako { $handle }, ne jako { $requested }

## Quick settings tiles

auto-rotate-title = Automatické otočení
dark-style-title = Tmavý režim
do-not-disturb-title = Nerušit
night-light-title = Noční světlo
airplane-mode-title = Režim v letadle

## Power mode

power-profile-title = Režim napájení
power-profile-header = Režim napájení
power-profile-open-menu = Otevřít nabídku režimů napájení
power-profile-settings = Nastavení napájení
power-profile-performance = Výkon
power-profile-balanced = Vyvážený
power-profile-power-saver = Úspora energie
power-profile-custom = Vlastní

## Keep awake

caffeine-title = Nevypínat obrazovku
caffeine-open-menu = Otevřít nabídku Nevypínat obrazovku
caffeine-until = Do { $time }
caffeine-until-turned-off = Do vypnutí
caffeine-30-minutes = 30 minut
caffeine-1-hour = 1 hodinu
caffeine-2-hours = 2 hodiny
caffeine-inhibit-reason = Obrazovku nechává zapnutou rychlé nastavení

## Brightness

brightness-title = Jas
brightness-open-menu = Otevřít nabídku jasu

## Keyboard backlight

backlight-title = Podsvícení klávesnice
backlight-open-menu = Otevřít nabídku jasu klávesnice
backlight-slider = Jas klávesnice
backlight-off = Vypnuto
backlight-low = Nízké
backlight-high = Vysoké

## Sound

volume-sound-settings = Nastavení zvuku
volume-mute = Ztlumit
volume-unmute = Zrušit ztlumení
volume-output-slider = Hlasitost
volume-output-title = Výstup zvuku
volume-output-open-menu = Otevřít nabídku výstupu zvuku
volume-input-slider = Mikrofon
volume-input-title = Vstup zvuku
volume-input-open-menu = Otevřít nabídku vstupu zvuku

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otevřít nabídku Bluetooth
bluetooth-settings = Nastavení Bluetooth
bluetooth-connect = Připojit
bluetooth-disconnect = Odpojit
bluetooth-connect-device = Připojit k { $deviceName }
bluetooth-disconnect-device = Odpojit { $deviceName }
bluetooth-no-devices = Žádná dostupná ani připojená zařízení
bluetooth-turn-on-hint = Pro připojení zařízení zapněte Bluetooth
bluetooth-connected-count = { $count ->
    [one] { $count } připojené
    [few] { $count } připojená
    [many] { $count } připojeného
   *[other] { $count } připojených
}

## Network menus in quick settings

network-menu-unknown-network = <neznámá>
network-menu-connect = Připojit
network-menu-disconnect = Odpojit
network-menu-connect-to = Připojit k { $name }
network-menu-disconnect-from = Odpojit { $name }
network-menu-turn-off = Vypnout
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zabezpečená, síla signálu { $strength } %
   *[no] { $name }, nezabezpečená, síla signálu { $strength } %
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] { $count } připojené
    [few] { $count } připojená
    [many] { $count } připojeného
   *[other] { $count } připojených
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otevřít nabídku VPN
network-menu-vpn-settings = Nastavení VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otevřít nabídku Wi-Fi
network-menu-wifi-settings = Všechny sítě
network-menu-wired = Kabelová připojení
network-menu-wired-open-menu = Otevřít nabídku kabelových připojení
network-menu-wired-settings = Nastavení kabelové sítě
network-menu-tethers = Sdílení přes Bluetooth
network-menu-tethers-open-menu = Otevřít nabídku sdílení přes Bluetooth
network-menu-tether = Sdílení připojení
network-menu-tether-settings = Nastavení Bluetooth
network-menu-mobile-connections = Mobilní připojení
network-menu-mobile-open-menu = Otevřít nabídku mobilních připojení
network-menu-mobile-settings = Nastavení mobilních dat
network-menu-mobile = Mobilní data
network-device-wired = Kabelové připojení
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Přihlásit se k síti
network-menu-failed-title = Připojení se nezdařilo
network-menu-failed-body = Síťové připojení se nepodařilo aktivovat

## Location access dialog

location-dialog-title = Povolit přístup k poloze
location-dialog-description = Aplikace { $appName } chce získat přístup k vaší poloze
location-dialog-info = Přístup k poloze můžete kdykoli změnit v nastavení soukromí
location-dialog-deny = Odepřít přístup
location-dialog-grant = Povolit přístup

## Thunderbolt notifications

thunderbolt-unknown-title = Neznámé zařízení Thunderbolt
thunderbolt-unknown-body = Během vaší nepřítomnosti bylo připojeno nové zařízení. Začnete ho používat, když ho odpojíte a znovu připojíte.
thunderbolt-unauthorized-title = Neautorizované zařízení Thunderbolt
thunderbolt-unauthorized-body = Bylo připojeno nové zařízení, které musí schválit správce
thunderbolt-error-title = Chyba autorizace zařízení Thunderbolt
thunderbolt-error-body = Zařízení Thunderbolt se nepodařilo autorizovat: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odepřít
access-dialog-allow = Povolit

## Display change confirmation

display-change-title = Ponechat nastavení displeje?
display-change-countdown = { $seconds ->
    [one] Změny nastavení se vrátí za { $seconds } sekundu
    [few] Změny nastavení se vrátí za { $seconds } sekundy
    [many] Změny nastavení se vrátí za { $seconds } sekundy
   *[other] Změny nastavení se vrátí za { $seconds } sekund
}
display-change-revert = Vrátit zpět
display-change-keep = Ponechat změny

## Drive connected notification

autorun-connected = Připojeno „{ $driveName }“
autorun-ready = Disk je připravený k použití
autorun-open-with = Otevřít v aplikaci { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Pomalé klávesy zapnuty
kbd-a11y-slow-keys-off = Pomalé klávesy vypnuty
kbd-a11y-slow-keys-description = Právě jste 8 sekund drželi klávesu Shift. To je zkratka funkce Pomalé klávesy, která mění chování klávesnice.
kbd-a11y-sticky-keys-on = Lepicí klávesy zapnuty
kbd-a11y-sticky-keys-off = Lepicí klávesy vypnuty
kbd-a11y-sticky-keys-on-description = Právě jste 5krát za sebou stiskli klávesu Shift. To je zkratka funkce Lepicí klávesy, která mění chování klávesnice.
kbd-a11y-sticky-keys-off-description = Právě jste stiskli dvě klávesy najednou nebo 5krát za sebou klávesu Shift. Tím se vypíná funkce Lepicí klávesy, která mění chování klávesnice.
kbd-a11y-leave-on = Nechat zapnuté
kbd-a11y-turn-on = Zapnout
kbd-a11y-turn-off = Vypnout
kbd-a11y-leave-off = Nechat vypnuté

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vyberte zvukové zařízení
audio-device-cancel = Zrušit
audio-device-sound-settings = Nastavení zvuku
audio-device-headphones = Sluchátka
audio-device-headset = Náhlavní souprava
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Povolit blokování zkratek
inhibit-shortcuts-app = Aplikace { $appName } chce blokovat systémové zkratky
inhibit-shortcuts-unknown-app = Aplikace chce blokovat systémové zkratky
inhibit-shortcuts-restore = Zkratky obnovíte stisknutím { $shortcut }
inhibit-shortcuts-deny = Odepřít
inhibit-shortcuts-allow = Povolit

## Unlocking encrypted drives

mount-hidden-volume = Skrytý svazek
mount-windows-system-volume = Systémový svazek Windows
mount-uses-keyfiles = Používá soubory klíčů
mount-keyfiles-use-app = Svazek, který používá soubory klíčů, odemknete v nástroji <i>{ $appName }</i>
mount-keyfiles-need-app = K odemknutí svazku, který používá soubory klíčů, potřebujete externí nástroj, například <i>Disky</i>
mount-pim-number = Číslo PIM
mount-pim-invalid = PIM musí být číslo, nebo zůstat prázdné
mount-password = Heslo
mount-remember-password = Zapamatovat heslo
mount-cancel = Zrušit
mount-unlock = Odemknout
mount-open-app = Otevřít { $appName }
mount-wrong-password = Nepodařilo se. Zkuste to znovu.
mount-unlock-failed = Svazek se nepodařilo odemknout
mount-pim-unsupported = Nainstalovaná verze udisks nepodporuje nastavení PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vyžaduje se ověření
network-agent-wifi-rejected = Uložené heslo k síti „{ $networkName }“ nefungovalo. Zadejte ho znovu.
network-agent-wifi-secrets = Pro přístup k bezdrátové síti „{ $networkName }“ je potřeba heslo nebo šifrovací klíč
network-agent-wps-hint = Můžete se také připojit stisknutím tlačítka „WPS“ na routeru
network-agent-wired-title = Ověření 802.1X v kabelové síti
network-agent-dsl-title = Ověření DSL
network-agent-pin-title = Vyžaduje se kód PIN
network-agent-pin-body = Zařízení pro mobilní data potřebuje kód PIN
network-agent-vpn-title = Heslo VPN
network-agent-password-required = K připojení k síti „{ $networkName }“ je potřeba heslo
network-agent-connect = Připojit
network-agent-cancel = Zrušit
network-agent-password = Heslo
network-agent-username = Uživatelské jméno
network-agent-key = Klíč
network-agent-private-key-password = Heslo soukromého klíče
network-agent-identity = Identita
network-agent-service = Služba
network-agent-network-name = Název sítě
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Zachycení obrazovky
screenshot-area = Výběr oblasti
screenshot-screen = Výběr obrazovky
screenshot-window = Výběr okna
screenshot-take = Pořídit snímek obrazovky
screenshot-record = Nahrát obrazovku
screenshot-show-pointer = Zobrazit ukazatel
screenshot-capture = Zachytit
screenshot-close = Zavřít
screenshot-screencasts-folder = Záznamy obrazovky
screenshot-screencast-file = Záznam obrazovky { $date } { $time }
screenshot-screenshots-folder = Snímky obrazovky
screenshot-file = Snímek obrazovky { $timestamp }
screenshot-screencast-recorded = Záznam obrazovky uložen
screenshot-screencast-start-failed = Záznam obrazovky se nepodařilo spustit
screenshot-screencast-out-of-space = Záznam obrazovky se nezdařil: na disku není místo
screenshot-screencast-try-again = Záznam obrazovky se nezdařil, zkuste to znovu
screenshot-screencast-failed = Záznam obrazovky se nezdařil
screenshot-screencast-view = Kliknutím zobrazíte video
screenshot-show-in-rover = Zobrazit v aplikaci Rover
screenshot-captured = Snímek obrazovky pořízen
screenshot-captured-body = Obrázek můžete vložit ze schránky

## System updates
updates-available-title = Jsou k dispozici aktualizace systému
updates-available-body = Stáhnete a nainstalujete je v Nastavení.
updates-ready-title = Aktualizace jsou připravené k instalaci
updates-ready-body = Nainstalují se při restartu, až se vám to bude hodit.
