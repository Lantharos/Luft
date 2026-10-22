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
