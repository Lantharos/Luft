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
privacy-windows-using = Használja az ablakokat
privacy-windows-seeing = Látja az ablakokat
privacy-windows-stop = Hozzáférés megszüntetése

## Window access prompt

peek-see-title = { $app } látni szeretné az ablakait
peek-see-description = Bármelyik megnyitott ablakáról képet készíthet majd.
peek-use-title = { $app } látni és használni szeretné az ablakait
peek-use-description = Látni fog minden megnyitott ablakot, és kattinthat, illetve gépelhet bennük, mintha saját maga tenné.
peek-deny = Elutasítás
peek-allow-once = Engedélyezés egyszer
peek-allow-until-quit = Engedélyezés kilépésig

## Window access errors

peek-error-declined = A számítógép használója ezt elutasította. { $app } a kilépése után újra kérheti.
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
