## Shared

system-cancel = Mégse

## Dictation notifications

dictation-setup-title = Gépelés beszéddel
dictation-setup-body = Beszéljen, és a szöveg bármelyik alkalmazásban megjelenik. A felismerés ezen a számítógépen történik, ezért először le kell tölteni a beszédmodellt.
dictation-setup-action = Diktálás beállítása
dictation-unsupported-title = A diktálás ezen a nyelven nem érhető el ezen a számítógépen: { $language }
dictation-unsupported-body = A számítógép processzora nem tudja futtatni az ehhez a nyelvhez szükséges beszédfelismerőt: { $language }. Más nyelven továbbra is diktálhat.
dictation-settings-action = Diktálási beállítások

## System health notifications

health-gpu-reset-title = A grafikus illesztőprogram nem válaszolt
health-gpu-reset-body = { $day ->
    [today] A számítógép ma, { $time } időpontban magától újraindult. A Beállításokban megnézheti, mi segít megelőzni, hogy ez újra megtörténjen.
   *[other] A számítógép { $date }, { $time } időpontban magától újraindult. A Beállításokban megnézheti, mi segít megelőzni, hogy ez újra megtörténjen.
}
health-gpu-reset-details = Részletek

oom-app-closed-title = { $app } bezárva a memória felszabadításához
oom-container-closed-title = Egy konténer bezárva a memória felszabadításához
oom-closed-body = A számítógép memóriája majdnem elfogyott, ezért a rendszer bezárta, hogy minden más továbbra is gyorsan reagáljon.
oom-closed-body-with-size = A számítógép memóriája majdnem elfogyott, ezért a rendszer bezárta, hogy minden más továbbra is gyorsan reagáljon. Memóriahasználata: { $size }.
memory-low-title = A Luft memóriája fogytán van
memory-low-app-body = { $app } { $size } memóriát használ. Kényszerítse ki a bezárását, hogy minden más továbbra is gyorsan reagáljon.
memory-low-container-body = Egy konténer { $size } memóriát használ. Kényszerítse ki a bezárását, hogy minden más továbbra is gyorsan reagáljon.
memory-low-force-quit = Bezárás kényszerítése

## Input source indicator

input-source-indicator = Beviteli forrás: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = A repülőgép mód hardveresen be van kapcsolva
media-keys-airplane-mode-on = Repülőgép mód bekapcsolva
media-keys-airplane-mode-off = Repülőgép mód kikapcsolva
media-keys-bluetooth-on = Bluetooth bekapcsolva
media-keys-bluetooth-off = Bluetooth kikapcsolva
media-keys-caps-lock-on = Caps Lock bekapcsolva
media-keys-caps-lock-off = Caps Lock kikapcsolva
media-keys-num-lock-on = Num Lock bekapcsolva
media-keys-num-lock-off = Num Lock kikapcsolva

## VPN sign-in

vpn-sign-in-title = Bejelentkezés: { $connection }
vpn-connect = Csatlakozás
vpn-signing-in = Bejelentkezés…
vpn-finish-in-browser = Fejezze be a bejelentkezést a böngészőben.
vpn-certificate-untrusted = { $host } kiszolgáló olyan tanúsítványt küldött, amely nem ellenőrizhető ({ $reason }). A tanúsítvány ujjlenyomata: { $fingerprint }.
vpn-certificate-warning = Lehet, hogy valaki ennek a kiszolgálónak adja ki magát. Csak akkor csatlakozzon, ha erre számított.
vpn-certificate-connect = Csatlakozás mindenképp

vpn-field-password = Jelszó
vpn-field-certificate-password = Tanúsítvány jelszava
vpn-field-proxy-password = Proxy jelszava
vpn-field-pre-shared-key = Előre megosztott kulcs
vpn-field-group-password = Csoportjelszó

## Battery notifications

battery-left = Töltöttség: { $percent }.
battery-left-with-time = Töltöttség: { $percent }, még körülbelül { $duration }.
battery-low-title = Az akkumulátor töltöttsége alacsony
battery-very-low-title = Az akkumulátor töltöttsége nagyon alacsony
battery-almost-empty-title = Az akkumulátor majdnem lemerült
battery-ups-low-title = A szünetmentes táp töltöttsége alacsony
battery-ups-very-low-title = A szünetmentes táp töltöttsége nagyon alacsony
battery-ups-almost-empty-title = A szünetmentes táp majdnem lemerült
battery-very-low-body = { $left } Hamarosan csatlakoztassa a töltőt.
battery-almost-empty-body = { $left } Csatlakoztassa most a töltőt, hogy ne vesszen el a nem mentett munka.

battery-device-low-title = Alacsony töltöttség: { $device }
battery-device-very-low-title = Nagyon alacsony töltöttség: { $device }
battery-device-low-body = { $left } Hamarosan töltse fel.
battery-device-very-low-body = { $left } Töltse fel most, hogy ne kapcsoljon ki.

battery-device-mouse = Egér
battery-device-keyboard = Billentyűzet
battery-device-phone = Telefon
battery-device-tablet = Táblagép
battery-device-controller = Játékvezérlő
battery-device-pen = Toll
battery-device-touchpad = Érintőpad
battery-device-headset = Headset
battery-device-speaker = Hangszóró
battery-device-headphones = Fejhallgató
battery-device-remote = Távirányító
battery-device-other = Csatlakoztatott eszköz

## Privacy indicator

privacy-indicator = Használatban: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = képernyő
privacy-thing-location = helyadatok
privacy-thing-windows = ablakok

privacy-camera-unknown-app = Egy alkalmazás használja a kamerát
privacy-stop-sharing = Képernyőmegosztás leállítása
privacy-stop-recording = Felvétel leállítása
privacy-turn-off-location = Helymeghatározás kikapcsolása
privacy-settings = Adatvédelmi beállítások
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon némítva
privacy-mute-microphone = Mikrofon némítása
privacy-unmute-microphone = Mikrofon némításának feloldása
privacy-close-app = { $app } bezárása
privacy-unknown-app = Egy alkalmazás
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program láthatja az ablakait
   *[other] { $count } program láthatja az ablakait
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program láthatja és használhatja az ablakait
   *[other] { $count } program láthatja és használhatja az ablakait
}
privacy-windows-stop = Hozzáférés megszüntetése

## Window access prompt

peek-see-request = Engedélyezi, hogy egy Ön által elindított program lássa az ablakait?
peek-see-description = Bármelyik megnyitott ablakáról képet készíthet majd.
peek-use-request = Engedélyezi, hogy egy Ön által elindított program lássa és használja az ablakait?
peek-use-description = Látni fog minden megnyitott ablakot, és kattinthat, illetve gépelhet bennük, mintha saját maga tenné.
peek-deny = Elutasítás
peek-allow-once = Engedélyezés egyszer
peek-allow-until-quit = Engedélyezés kilépésig

## Window access errors

peek-error-declined-until-quit = A számítógép használója ezt elutasította. A program a kilépése után újra kérheti.
peek-error-not-allowed = A számítógép használója ezt nem engedélyezte
peek-error-sandboxed = A homokozóban futó alkalmazások nem láthatják és nem használhatják a többi ablakot
peek-error-unknown-caller = A kérést küldő program leállt, vagy nem sikerült azonosítani
peek-error-no-caller = A munkamenetbusz nem jelezte, melyik program küldte a kérést
peek-error-screen-busy = A képernyő zárolva van, vagy egy rendszerablak van rajta nyitva. Próbálja újra, ha már eltűnt.
peek-error-input-held = Valaki lenyomva tart billentyűket vagy egérgombokat. Próbálja újra egy pillanat múlva.
peek-error-input-dropped = A bevitel leállt, mert amikor megérkezett, valami más volt a megadott pont alatt, vagy más kapta a billentyűzetet
peek-error-not-in-front = Az ablakot nem sikerült előtérbe hozni
peek-error-covered = Az ablak ezen részét valami más takarja
peek-error-outside = Ez a pont kívül esik az ablak képén: { $x }, { $y }. A kép mérete: { $width } × { $height }
peek-error-nothing-to-capture = Az ablak nem jelenít meg semmit, amit rögzíteni lehetne
peek-error-window-picture-late = Az ablak képe nem készült el időben
peek-error-screen-picture-late = A képernyő képe nem készült el időben
peek-error-no-window-id = Nincs { $id } azonosítójú ablak. A peek list kiírja a nyitott ablakokat.
peek-error-no-window-for-handle = Ennek a programnak nincs nyitott ablaka: { $handle }
peek-error-ended-before-window = A program kilépett, mielőtt ablakot nyitott volna
peek-error-no-window-in-time = Nem nyílt meg ablak ennyi idő alatt: { $duration }
peek-error-launch-not-started-by-peek = Csak olyan program indítható, amelyet maga a peek run indított
peek-error-ended-while-starting = A program indítás közben kilépett
peek-error-launch-failed = A systemd nem tudta elindítani ezt a programot: { $program }
peek-error-unknown-handle = A peek run paranccsal indított programok egyikének sincs ilyen azonosítója, vagy már kilépett: { $handle }
peek-error-unknown-key = A peek nem ismer ilyen billentyűt: { $key }
peek-error-unknown-modifier = Ez nem módosítóbillentyű: { $modifier }. Ezek közül választhat: ctrl, shift, alt vagy super.
peek-error-display-owner = Ez a kijelző egy másik programhoz tartozik
peek-error-display-run = A rejtett kijelzőn futó programokat a peek run indítja
peek-error-display-handle = Ez a kijelző ezzel az azonosítóval indult: { $handle }, nem ezzel: { $requested }

## Quick settings tiles

auto-rotate-title = Automatikus forgatás
dark-style-title = Sötét mód
do-not-disturb-title = Ne zavarjanak
night-light-title = Éjszakai fény
airplane-mode-title = Repülőgép mód

## Power mode

power-profile-title = Energiamód
power-profile-header = Energiamód
power-profile-open-menu = Energiamód menüjének megnyitása
power-profile-settings = Tápellátási beállítások
power-profile-performance = Teljesítmény
power-profile-balanced = Kiegyensúlyozott
power-profile-power-saver = Energiatakarékos
power-profile-custom = Egyéni

## Keep awake

caffeine-title = Ébren tartás
caffeine-open-menu = Ébren tartás menüjének megnyitása
caffeine-until = Eddig: { $time }
caffeine-until-turned-off = Kikapcsolásig
caffeine-30-minutes = 30 perc
caffeine-1-hour = 1 óra
caffeine-2-hours = 2 óra
caffeine-inhibit-reason = Ébren tartva a gyorsbeállításokból

## Brightness

brightness-title = Fényerő
brightness-open-menu = Fényerő menüjének megnyitása

## Keyboard backlight

backlight-title = Billentyűzet-háttérvilágítás
backlight-open-menu = Billentyűzetfényerő menüjének megnyitása
backlight-slider = Billentyűzet fényereje
backlight-off = Ki
backlight-low = Alacsony
backlight-high = Magas

## Sound

volume-sound-settings = Hangbeállítások
volume-mute = Némítás
volume-unmute = Némítás feloldása
volume-output-slider = Hangerő
volume-output-title = Hangkimenet
volume-output-open-menu = Hangkimenet menüjének megnyitása
volume-input-slider = Mikrofon
volume-input-title = Hangbemenet
volume-input-open-menu = Hangbemenet menüjének megnyitása

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Bluetooth menüjének megnyitása
bluetooth-settings = Bluetooth-beállítások
bluetooth-connect = Csatlakozás
bluetooth-disconnect = Leválasztás
bluetooth-connect-device = Csatlakozás: { $deviceName }
bluetooth-disconnect-device = Leválasztás: { $deviceName }
bluetooth-no-devices = Nincs elérhető vagy csatlakoztatott eszköz
bluetooth-turn-on-hint = Az eszközök csatlakoztatásához kapcsolja be a Bluetooth funkciót
bluetooth-connected-count = { $count ->
    [one] { $count } csatlakozva
   *[other] { $count } csatlakozva
}

## Network menus in quick settings

network-menu-unknown-network = <ismeretlen>
network-menu-connect = Csatlakozás
network-menu-disconnect = Leválasztás
network-menu-connect-to = Csatlakozás: { $name }
network-menu-disconnect-from = Leválasztás: { $name }
network-menu-turn-off = Kikapcsolás
network-menu-wifi-network = { $secure ->
    [yes] { $name }, biztonságos, jelerősség: { $strength }%
   *[no] { $name }, nem biztonságos, jelerősség: { $strength }%
}
network-menu-hotspot = Hotspot: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } csatlakozva
   *[other] { $count } csatlakozva
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = VPN menüjének megnyitása
network-menu-vpn-settings = VPN-beállítások
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Wi-Fi menüjének megnyitása
network-menu-wifi-settings = Összes hálózat
network-menu-wired = Vezetékes kapcsolatok
network-menu-wired-open-menu = Vezetékes kapcsolatok menüjének megnyitása
network-menu-wired-settings = Vezetékes beállítások
network-menu-tethers = Bluetooth-internetmegosztás
network-menu-tethers-open-menu = Bluetooth-internetmegosztás menüjének megnyitása
network-menu-tether = Internetmegosztás
network-menu-tether-settings = Bluetooth-beállítások
network-menu-mobile-connections = Mobilkapcsolatok
network-menu-mobile-open-menu = Mobilkapcsolatok menüjének megnyitása
network-menu-mobile-settings = Mobil szélessávú beállítások
network-menu-mobile = Mobilnet
network-device-wired = Vezetékes
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Bejelentkezés a hálózatba
network-menu-failed-title = A csatlakozás nem sikerült
network-menu-failed-body = Nem sikerült aktiválni a hálózati kapcsolatot

## Location access dialog

location-dialog-title = Helyhozzáférés engedélyezése
location-dialog-description = { $appName } alkalmazás hozzá szeretne férni a tartózkodási helyéhez
location-dialog-info = A helyhozzáférés bármikor módosítható az adatvédelmi beállításokban
location-dialog-deny = Elutasítás
location-dialog-grant = Engedélyezés

## Thunderbolt notifications

thunderbolt-unknown-title = Ismeretlen Thunderbolt-eszköz
thunderbolt-unknown-body = Távollétében új eszköz csatlakozott. A használatához húzza ki, majd csatlakoztassa újra.
thunderbolt-unauthorized-title = Nem engedélyezett Thunderbolt-eszköz
thunderbolt-unauthorized-body = Új eszköz csatlakozott, amelyet egy rendszergazdának jóvá kell hagynia
thunderbolt-error-title = Thunderbolt-engedélyezési hiba
thunderbolt-error-body = Nem sikerült engedélyezni a Thunderbolt-eszközt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Elutasítás
access-dialog-allow = Engedélyezés

## Display change confirmation

display-change-title = Megtartja a beállításokat?
display-change-countdown = { $seconds ->
    [one] A beállítások { $seconds } másodperc múlva visszaállnak
   *[other] A beállítások { $seconds } másodperc múlva visszaállnak
}
display-change-revert = Visszaállítás
display-change-keep = Megtartás

## Drive connected notification

autorun-connected = „{ $driveName }” csatlakoztatva
autorun-ready = A lemez használatra kész
autorun-open-with = Megnyitás ezzel: { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Lassú billentyűk bekapcsolva
kbd-a11y-slow-keys-off = Lassú billentyűk kikapcsolva
kbd-a11y-slow-keys-description = 8 másodpercig lenyomva tartotta a Shift billentyűt. Ez a Lassú billentyűk funkció billentyűparancsa, amely megváltoztatja a billentyűzet működését.
kbd-a11y-sticky-keys-on = Beragadó billentyűk bekapcsolva
kbd-a11y-sticky-keys-off = Beragadó billentyűk kikapcsolva
kbd-a11y-sticky-keys-on-description = Ötször egymás után megnyomta a Shift billentyűt. Ez a Beragadó billentyűk funkció billentyűparancsa, amely megváltoztatja a billentyűzet működését.
kbd-a11y-sticky-keys-off-description = Két billentyűt nyomott le egyszerre, vagy ötször egymás után megnyomta a Shift billentyűt. Ez kikapcsolja a Beragadó billentyűk funkciót, amely megváltoztatja a billentyűzet működését.
kbd-a11y-leave-on = Megtartás
kbd-a11y-turn-on = Bekapcsolás
kbd-a11y-turn-off = Kikapcsolás
kbd-a11y-leave-off = Megtartás

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Hangeszköz kiválasztása
audio-device-cancel = Mégse
audio-device-sound-settings = Hangbeállítások
audio-device-headphones = Fejhallgató
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Billentyűparancsok letiltásának engedélyezése
inhibit-shortcuts-app = { $appName } alkalmazás le szeretné tiltani a billentyűparancsokat
inhibit-shortcuts-unknown-app = Egy alkalmazás le szeretné tiltani a billentyűparancsokat
inhibit-shortcuts-restore = A billentyűparancsokat ezzel állíthatja vissza: { $shortcut }
inhibit-shortcuts-deny = Elutasítás
inhibit-shortcuts-allow = Engedélyezés

## Unlocking encrypted drives

mount-hidden-volume = Rejtett kötet
mount-windows-system-volume = Windows-rendszerkötet
mount-uses-keyfiles = Kulcsfájlokat használ
mount-keyfiles-use-app = Kulcsfájlokat használó kötet feloldásához használja inkább ezt az alkalmazást: <i>{ $appName }</i>
mount-keyfiles-need-app = Kulcsfájlokat használó kötet feloldásához külső segédprogramra van szükség, például a <i>Lemezek</i> alkalmazásra
mount-pim-number = PIM-szám
mount-pim-invalid = A PIM csak szám lehet, vagy maradjon üresen
mount-password = Jelszó
mount-remember-password = Jelszó megjegyzése
mount-cancel = Mégse
mount-unlock = Feloldás
mount-open-app = { $appName } megnyitása
mount-wrong-password = Ez nem sikerült. Próbálja újra.
mount-unlock-failed = Nem sikerült feloldani a kötetet
mount-pim-unsupported = A telepített udisks verzió nem támogatja a PIM-beállítást

## Network passwords, asked when connecting needs one

network-agent-auth-required = Hitelesítés szükséges
network-agent-wifi-rejected = A mentett jelszó nem működött ehhez a hálózathoz: „{ $networkName }”. Adja meg újra.
network-agent-wifi-secrets = Jelszó vagy titkosítási kulcs szükséges ehhez a vezeték nélküli hálózathoz: „{ $networkName }”
network-agent-wps-hint = A routeren található WPS gomb megnyomásával is csatlakozhat
network-agent-wired-title = Vezetékes 802.1X-hitelesítés
network-agent-dsl-title = DSL-hitelesítés
network-agent-pin-title = PIN-kód szükséges
network-agent-pin-body = A mobil szélessávú eszközhöz PIN-kód szükséges
network-agent-vpn-title = VPN-jelszó
network-agent-password-required = Jelszó szükséges a csatlakozáshoz: „{ $networkName }”
network-agent-connect = Csatlakozás
network-agent-cancel = Mégse
network-agent-password = Jelszó
network-agent-username = Felhasználónév
network-agent-key = Kulcs
network-agent-private-key-password = Titkos kulcs jelszava
network-agent-identity = Identitás
network-agent-service = Szolgáltatás
network-agent-network-name = Hálózatnév
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Képernyőrögzítés
screenshot-area = Terület kijelölése
screenshot-screen = Képernyő kijelölése
screenshot-window = Ablak kijelölése
screenshot-take = Képernyőkép készítése
screenshot-record = Képernyőfelvétel
screenshot-show-pointer = Mutató megjelenítése
screenshot-capture = Rögzítés
screenshot-close = Bezárás
screenshot-screencasts-folder = Képernyőfelvételek
screenshot-screencast-file = Képernyőfelvétel { $date } { $time }
screenshot-screenshots-folder = Képernyőképek
screenshot-file = Képernyőkép { $timestamp }
screenshot-screencast-recorded = A képernyőfelvétel elkészült
screenshot-screencast-start-failed = Nem sikerült elindítani a képernyőfelvételt
screenshot-screencast-out-of-space = A képernyőfelvétel leállt: nincs elég hely a lemezen
screenshot-screencast-try-again = A képernyőfelvétel nem sikerült. Próbálja újra.
screenshot-screencast-failed = A képernyőfelvétel nem sikerült
screenshot-screencast-view = Kattintson ide a videó megtekintéséhez
screenshot-show-in-rover = Megjelenítés a Rover alkalmazásban
screenshot-captured = A képernyőkép elkészült
screenshot-captured-body = A képet beillesztheti a vágólapról.
