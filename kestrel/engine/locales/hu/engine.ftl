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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }” nem válaszol
close-dialog-description = Várhat egy kicsit, hátha folytatja a működést, vagy kényszerítheti az alkalmazás bezárását.
close-dialog-force-quit = Kényszerített bezárás
close-dialog-wait = Várakozás

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Tükrözés
switch-monitor-join = Kiterjesztés
switch-monitor-external-only = Csak külső
switch-monitor-built-in-only = Csak beépített

## Sign-in prompt

auth-prompt-password = Jelszó
auth-prompt-username = Felhasználónév
auth-prompt-back = Vissza
auth-prompt-submit = Küldés
auth-prompt-wrong-password = Ez a jelszó nem működött
auth-prompt-failed = Ez nem sikerült. Próbálja újra.
fingerprint-not-recognized = Nem felismert ujjlenyomat

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

## Administrator authentication

polkit-title = Hitelesítés szükséges
polkit-administrator = Rendszergazda
polkit-password = Jelszó
polkit-cancel = Mégse
polkit-authenticate = Hitelesítés
polkit-failed = Ez nem sikerült. Próbálja újra.

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

## Log out, power off and restart dialog

end-session-log-out-user = Kijelentkezés: { $userName }
end-session-log-out-title = Kijelentkezés
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } { $seconds } másodperc múlva automatikusan kijelentkezik
   *[other] { $userName } { $seconds } másodperc múlva automatikusan kijelentkezik
}
end-session-log-out-countdown = { $seconds ->
    [one] { $seconds } másodperc múlva automatikusan kijelentkezik
   *[other] { $seconds } másodperc múlva automatikusan kijelentkezik
}
end-session-log-out-button = Kijelentkezés
end-session-power-off-title = Leállítás
end-session-power-off-updates-title = Frissítések telepítése és leállítás
end-session-power-off-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan leáll
   *[other] A rendszer { $seconds } másodperc múlva automatikusan leáll
}
end-session-power-off-button = Leállítás
end-session-restart-title = Újraindítás
end-session-restart-updates-title = Frissítések telepítése és újraindítás
end-session-restart-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan újraindul
   *[other] A rendszer { $seconds } másodperc múlva automatikusan újraindul
}
end-session-restart-button = Újraindítás
end-session-update-restart-title = Újraindítás és frissítések telepítése
end-session-update-restart-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan újraindul, és telepíti a frissítéseket
   *[other] A rendszer { $seconds } másodperc múlva automatikusan újraindul, és telepíti a frissítéseket
}
end-session-update-restart-button = Újraindítás és telepítés
end-session-install-updates = Függőben lévő frissítések telepítése
end-session-install-version = { $version } verzió telepítése
end-session-low-battery = Alacsony töltöttség: a frissítések telepítése előtt csatlakoztassa a töltőt
end-session-busy-apps = Néhány alkalmazás még dolgozik, vagy nem mentett munkát tartalmaz
end-session-other-users = Más felhasználók is be vannak jelentkezve
end-session-cancel = Mégse
end-session-boot-options = Rendszerindítási lehetőségek
end-session-remote-user = { $userName } (távoli)
end-session-console-user = { $userName } (konzol)

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

## Lock screen clock

lock-clock-swipe-up = Csúsztasson felfelé
lock-clock-click-or-press = Kattintson, vagy nyomjon le egy billentyűt

## Notification times

date-just-now = Épp most

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Ablakok
ctrl-alt-tab-panel = Tálca
ctrl-alt-tab-unlock = Feloldási ablak

## System notifications

messages-system-source = Rendszer
unsafe-mode-title = A rendszer nem biztonságos módba került
unsafe-mode-body = Az alkalmazások mostantól korlátozás nélkül hozzáférnek mindenhez
unsafe-mode-undo = Visszavonás
privileged-user-title = Bejelentkezve kiemelt jogú felhasználóként
privileged-user-body = Biztonsági okokból kerülje a munkamenet kiemelt jogú felhasználóként való futtatását. Ha lehet, jelentkezzen be normál felhasználóként.

## On-screen keyboard

osk-keyboard-settings = Billentyűzetbeállítások
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = A Kestrelnek zárolnia kell a képernyőt

## Notifications

messages-unknown-app = Ismeretlen alkalmazás
messages-reply = Válasz
messages-reply-placeholder = Válasz írása
messages-reply-send = Küldés

## Media player controls

mpris-unknown-artist = Ismeretlen előadó
mpris-unknown-title = Ismeretlen cím

## Starting programs

spawn-failed = „{ $command }” végrehajtása nem sikerült:

## Text field context menu

entry-menu-copy = Másolás
entry-menu-paste = Beillesztés
entry-menu-show-text = Szöveg megjelenítése
entry-menu-hide-text = Szöveg elrejtése
entry-caps-lock-on = A Caps Lock be van kapcsolva

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Képernyőkép készítése
title-bar-menu-hide = Elrejtés
title-bar-menu-restore = Előző méret
title-bar-menu-maximize = Teljes méret
title-bar-menu-move = Áthelyezés
title-bar-menu-resize = Átméretezés
title-bar-menu-always-on-top = Mindig felül
title-bar-menu-always-on-visible-workspace = Minden munkaterületen
title-bar-menu-workspace-left = Áthelyezés a bal oldali munkaterületre
title-bar-menu-workspace-right = Áthelyezés a jobb oldali munkaterületre
title-bar-menu-workspace-up = Áthelyezés a felső munkaterületre
title-bar-menu-workspace-down = Áthelyezés az alsó munkaterületre
title-bar-menu-monitor-up = Áthelyezés a felső kijelzőre
title-bar-menu-monitor-down = Áthelyezés az alsó kijelzőre
title-bar-menu-monitor-left = Áthelyezés a bal oldali kijelzőre
title-bar-menu-monitor-right = Áthelyezés a jobb oldali kijelzőre
title-bar-menu-close = Bezárás

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
