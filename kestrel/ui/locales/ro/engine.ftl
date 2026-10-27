## Quick settings tiles

auto-rotate-title = Rotire automată
dark-style-title = Mod întunecat
do-not-disturb-title = Nu deranjați
night-light-title = Lumină de noapte
airplane-mode-title = Mod avion

## Power mode

power-profile-title = Mod de alimentare
power-profile-header = Mod de alimentare
power-profile-open-menu = Deschide meniul modurilor de alimentare
power-profile-settings = Setări alimentare
power-profile-performance = Performanță
power-profile-balanced = Echilibrat
power-profile-power-saver = Economisire energie
power-profile-custom = Personalizat

## Keep awake

caffeine-title = Menține activ
caffeine-open-menu = Deschide meniul Menține activ
caffeine-until = Până la { $time }
caffeine-until-turned-off = Până la dezactivare
caffeine-30-minutes = 30 de minute
caffeine-1-hour = 1 oră
caffeine-2-hours = 2 ore
caffeine-inhibit-reason = Menținut activ din Setări rapide

## Brightness

brightness-title = Luminozitate
brightness-open-menu = Deschide meniul de luminozitate

## Keyboard backlight

backlight-title = Iluminare tastatură
backlight-open-menu = Deschide meniul de luminozitate a tastaturii
backlight-slider = Luminozitate tastatură
backlight-off = Dezactivată
backlight-low = Redusă
backlight-high = Ridicată

## Sound

volume-sound-settings = Setări sunet
volume-mute = Dezactivează sunetul
volume-unmute = Activează sunetul
volume-output-slider = Volum
volume-output-title = Ieșire audio
volume-output-open-menu = Deschide meniul de ieșire audio
volume-input-slider = Microfon
volume-input-title = Intrare audio
volume-input-open-menu = Deschide meniul de intrare audio

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Deschide meniul Bluetooth
bluetooth-settings = Setări Bluetooth
bluetooth-connect = Conectează
bluetooth-disconnect = Deconectează
bluetooth-connect-device = Conectează la { $deviceName }
bluetooth-disconnect-device = Deconectează { $deviceName }
bluetooth-no-devices = Niciun dispozitiv disponibil sau conectat
bluetooth-turn-on-hint = Activați Bluetooth pentru a vă conecta la dispozitive
bluetooth-connected-count = { $count ->
    [one] { $count } dispozitiv conectat
    [few] { $count } dispozitive conectate
   *[other] { $count } de dispozitive conectate
}

## Network menus in quick settings

network-menu-unknown-network = <necunoscută>
network-menu-connect = Conectează
network-menu-disconnect = Deconectează
network-menu-connect-to = Conectează la { $name }
network-menu-disconnect-from = Deconectează { $name }
network-menu-turn-off = Dezactivează
network-menu-wifi-network = { $secure ->
    [yes] { $name }, securizată, puterea semnalului { $strength }%
   *[no] { $name }, nesecurizată, puterea semnalului { $strength }%
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] { $count } conexiune activă
    [few] { $count } conexiuni active
   *[other] { $count } de conexiuni active
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Deschide meniul VPN
network-menu-vpn-settings = Setări VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Deschide meniul Wi-Fi
network-menu-wifi-settings = Toate rețelele
network-menu-wired = Conexiuni prin cablu
network-menu-wired-open-menu = Deschide meniul conexiunilor prin cablu
network-menu-wired-settings = Setări conexiune prin cablu
network-menu-tethers = Partajare internet prin Bluetooth
network-menu-tethers-open-menu = Deschide meniul de partajare a internetului prin Bluetooth
network-menu-tether = Partajare internet
network-menu-tether-settings = Setări Bluetooth
network-menu-mobile-connections = Conexiuni mobile
network-menu-mobile-open-menu = Deschide meniul conexiunilor mobile
network-menu-mobile-settings = Setări bandă largă mobilă
network-menu-mobile = Date mobile
network-device-wired = Prin cablu
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Conectează-te la rețea
network-menu-failed-title = Conectarea nu a reușit
network-menu-failed-body = Conexiunea la rețea nu a putut fi activată

## Location access dialog

location-dialog-title = Permiteți accesul la locație
location-dialog-description = Aplicația { $appName } vrea să vă acceseze locația
location-dialog-info = Accesul la locație poate fi schimbat oricând din setările de confidențialitate
location-dialog-deny = Refuză accesul
location-dialog-grant = Permite accesul

## Thunderbolt notifications

thunderbolt-unknown-title = Dispozitiv Thunderbolt necunoscut
thunderbolt-unknown-body = Un dispozitiv nou a fost conectat cât timp computerul era blocat. Deconectați-l și conectați-l din nou pentru a începe să îl folosiți.
thunderbolt-unauthorized-title = Dispozitiv Thunderbolt neautorizat
thunderbolt-unauthorized-body = Un dispozitiv nou a fost conectat și are nevoie de aprobarea unui administrator
thunderbolt-error-title = Eroare de autorizare Thunderbolt
thunderbolt-error-body = Dispozitivul Thunderbolt nu a putut fi autorizat: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Refuză
access-dialog-allow = Permite

## Display change confirmation

display-change-title = Păstrați setările ecranului?
display-change-countdown = { $seconds ->
    [one] Setările vor reveni la cele anterioare în { $seconds } secundă
    [few] Setările vor reveni la cele anterioare în { $seconds } secunde
   *[other] Setările vor reveni la cele anterioare în { $seconds } de secunde
}
display-change-revert = Revino
display-change-keep = Păstrează

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }” nu răspunde
close-dialog-description = Puteți aștepta puțin să își revină sau puteți forța închiderea aplicației
close-dialog-force-quit = Forțează închiderea
close-dialog-wait = Așteaptă

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Oglindire
switch-monitor-join = Extindere
switch-monitor-external-only = Doar externe
switch-monitor-built-in-only = Doar integrat

## Sign-in prompt

auth-prompt-password = Parolă
auth-prompt-username = Nume de utilizator
auth-prompt-back = Înapoi
auth-prompt-submit = Trimite
auth-prompt-wrong-password = Parola nu a funcționat
auth-prompt-failed = Nu a funcționat. Încercați din nou.
fingerprint-not-recognized = Amprenta nu a fost recunoscută

## Drive connected notification

autorun-connected = „{ $driveName }” a fost conectat
autorun-ready = Discul poate fi folosit acum
autorun-open-with = Deschide cu { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Taste lente activate
kbd-a11y-slow-keys-off = Taste lente dezactivate
kbd-a11y-slow-keys-description = Ați ținut apăsată tasta Shift timp de 8 secunde. Aceasta este comanda rapidă pentru Taste lente, care schimbă modul în care funcționează tastatura.
kbd-a11y-sticky-keys-on = Taste adezive activate
kbd-a11y-sticky-keys-off = Taste adezive dezactivate
kbd-a11y-sticky-keys-on-description = Ați apăsat tasta Shift de 5 ori la rând. Aceasta este comanda rapidă pentru Taste adezive, care schimbă modul în care funcționează tastatura.
kbd-a11y-sticky-keys-off-description = Ați apăsat două taste deodată sau ați apăsat tasta Shift de 5 ori la rând. Astfel se dezactivează Taste adezive, care schimbă modul în care funcționează tastatura.
kbd-a11y-leave-on = Lasă activat
kbd-a11y-turn-on = Activează
kbd-a11y-turn-off = Dezactivează
kbd-a11y-leave-off = Lasă dezactivat

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Alegeți dispozitivul audio
audio-device-cancel = Anulează
audio-device-sound-settings = Setări sunet
audio-device-headphones = Căști
audio-device-headset = Căști cu microfon
audio-device-microphone = Microfon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permiteți blocarea comenzilor rapide
inhibit-shortcuts-app = Aplicația { $appName } vrea să blocheze comenzile rapide
inhibit-shortcuts-unknown-app = O aplicație vrea să blocheze comenzile rapide
inhibit-shortcuts-restore = Puteți reactiva comenzile rapide apăsând { $shortcut }
inhibit-shortcuts-deny = Refuză
inhibit-shortcuts-allow = Permite

## Administrator authentication

polkit-title = Este necesară autentificarea
polkit-administrator = Administrator
polkit-password = Parolă
polkit-cancel = Anulează
polkit-authenticate = Autentifică
polkit-failed = Nu a funcționat. Încercați din nou.

## Unlocking encrypted drives

mount-hidden-volume = Volum ascuns
mount-windows-system-volume = Volum de sistem Windows
mount-uses-keyfiles = Folosește fișiere cheie
mount-keyfiles-use-app = Pentru a debloca un volum care folosește fișiere cheie, folosiți utilitarul <i>{ $appName }</i>
mount-keyfiles-need-app = Pentru a debloca un volum care folosește fișiere cheie aveți nevoie de un utilitar extern, cum ar fi <i>Discuri</i>
mount-pim-number = Număr PIM
mount-pim-invalid = PIM-ul trebuie să fie un număr sau să rămână gol
mount-password = Parolă
mount-remember-password = Ține minte parola
mount-cancel = Anulează
mount-unlock = Deblochează
mount-open-app = Deschide { $appName }
mount-wrong-password = Nu a funcționat. Încercați din nou.
mount-unlock-failed = Volumul nu a putut fi deblocat
mount-pim-unsupported = Versiunea instalată de udisks nu acceptă setarea PIM

## Log out, power off and restart dialog

end-session-log-out-user = Deconectare { $userName }
end-session-log-out-title = Deconectare
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } se va deconecta automat în { $seconds } secundă
    [few] { $userName } se va deconecta automat în { $seconds } secunde
   *[other] { $userName } se va deconecta automat în { $seconds } de secunde
}
end-session-log-out-countdown = { $seconds ->
    [one] Vă veți deconecta automat în { $seconds } secundă
    [few] Vă veți deconecta automat în { $seconds } secunde
   *[other] Vă veți deconecta automat în { $seconds } de secunde
}
end-session-log-out-button = Deconectare
end-session-power-off-title = Oprire
end-session-power-off-updates-title = Instalează actualizările și oprește
end-session-power-off-countdown = { $seconds ->
    [one] Computerul se va opri automat în { $seconds } secundă
    [few] Computerul se va opri automat în { $seconds } secunde
   *[other] Computerul se va opri automat în { $seconds } de secunde
}
end-session-power-off-button = Oprește
end-session-restart-title = Repornire
end-session-restart-updates-title = Instalează actualizările și repornește
end-session-restart-countdown = { $seconds ->
    [one] Computerul va reporni automat în { $seconds } secundă
    [few] Computerul va reporni automat în { $seconds } secunde
   *[other] Computerul va reporni automat în { $seconds } de secunde
}
end-session-restart-button = Repornește
end-session-update-restart-title = Repornește și instalează actualizările
end-session-update-restart-countdown = { $seconds ->
    [one] Computerul va reporni automat și va instala actualizările în { $seconds } secundă
    [few] Computerul va reporni automat și va instala actualizările în { $seconds } secunde
   *[other] Computerul va reporni automat și va instala actualizările în { $seconds } de secunde
}
end-session-update-restart-button = Repornește și instalează
end-session-install-updates = Instalează actualizările în așteptare
end-session-install-version = Instalează versiunea { $version }
end-session-low-battery = Baterie descărcată: conectați încărcătorul înainte de a instala actualizările
end-session-busy-apps = Unele aplicații sunt ocupate sau au lucru nesalvat
end-session-other-users = Alți utilizatori sunt conectați
end-session-cancel = Anulează
end-session-boot-options = Opțiuni de pornire
end-session-remote-user = { $userName } (la distanță)
end-session-console-user = { $userName } (consolă)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Este necesară autentificarea
network-agent-wifi-rejected = Parola salvată pentru „{ $networkName }” nu a funcționat. Introduceți-o din nou.
network-agent-wifi-secrets = Pentru accesarea rețelei wireless „{ $networkName }” sunt necesare parole sau chei de criptare
network-agent-wps-hint = Vă puteți conecta și apăsând butonul „WPS” de pe router
network-agent-wired-title = Autentificare 802.1X prin cablu
network-agent-dsl-title = Autentificare DSL
network-agent-pin-title = Este necesar codul PIN
network-agent-pin-body = Dispozitivul de bandă largă mobilă are nevoie de codul PIN
network-agent-vpn-title = Parolă VPN
network-agent-password-required = Pentru conectarea la „{ $networkName }” este necesară o parolă
network-agent-connect = Conectează
network-agent-cancel = Anulează
network-agent-password = Parolă
network-agent-username = Nume de utilizator
network-agent-key = Cheie
network-agent-private-key-password = Parola cheii private
network-agent-identity = Identitate
network-agent-service = Serviciu
network-agent-network-name = Numele rețelei
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Glisați în sus
lock-clock-click-or-press = Faceți clic sau apăsați o tastă

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Ferestre
ctrl-alt-tab-panel = Bara de activități
ctrl-alt-tab-unlock = Fereastra de deblocare

## System notifications

messages-system-source = Sistem
unsafe-mode-title = Sistemul a fost trecut în modul nesigur
unsafe-mode-body = Aplicațiile au acum acces nerestricționat
unsafe-mode-undo = Anulează
privileged-user-title = Sesiune pornită ca utilizator privilegiat
privileged-user-body = Din motive de securitate, evitați să folosiți o sesiune ca utilizator privilegiat. Dacă este posibil, conectați-vă ca utilizator obișnuit.

## On-screen keyboard

osk-keyboard-settings = Setări tastatură
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel trebuie să blocheze ecranul

## Notifications

messages-unknown-app = Aplicație necunoscută
messages-reply = Răspunde
messages-reply-placeholder = Scrieți un răspuns
messages-reply-send = Trimite

## Media player controls

mpris-unknown-artist = Artist necunoscut
mpris-unknown-title = Titlu necunoscut

## Starting programs

spawn-failed = Executarea „{ $command }” nu a reușit:

## Text field context menu

entry-menu-copy = Copiază
entry-menu-paste = Lipește
entry-menu-show-text = Afișează textul
entry-menu-hide-text = Ascunde textul
entry-caps-lock-on = Caps Lock este activat

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Fă o captură de ecran
title-bar-menu-hide = Ascunde
title-bar-menu-restore = Restabilește
title-bar-menu-maximize = Maximizează
title-bar-menu-move = Mută
title-bar-menu-resize = Redimensionează
title-bar-menu-always-on-top = Mereu deasupra
title-bar-menu-always-on-visible-workspace = Pe toate spațiile de lucru
title-bar-menu-workspace-left = Mută în spațiul de lucru din stânga
title-bar-menu-workspace-right = Mută în spațiul de lucru din dreapta
title-bar-menu-workspace-up = Mută în spațiul de lucru de deasupra
title-bar-menu-workspace-down = Mută în spațiul de lucru de dedesubt
title-bar-menu-monitor-up = Mută pe ecranul de deasupra
title-bar-menu-monitor-down = Mută pe ecranul de dedesubt
title-bar-menu-monitor-left = Mută pe ecranul din stânga
title-bar-menu-monitor-right = Mută pe ecranul din dreapta
title-bar-menu-close = Închide

## Screenshots and screen recording

screenshot-source = Captură de ecran
screenshot-area = Selectează o zonă
screenshot-screen = Selectează un ecran
screenshot-window = Selectează o fereastră
screenshot-take = Fă o captură de ecran
screenshot-record = Înregistrează ecranul
screenshot-show-pointer = Afișează cursorul
screenshot-capture = Capturează
screenshot-close = Închide
screenshot-screencasts-folder = Înregistrări de ecran
screenshot-screencast-file = Înregistrare de ecran din { $date } { $time }
screenshot-screenshots-folder = Capturi de ecran
screenshot-file = Captură de ecran din { $timestamp }
screenshot-screencast-recorded = Înregistrarea ecranului a fost salvată
screenshot-screencast-start-failed = Înregistrarea ecranului nu a putut porni
screenshot-screencast-out-of-space = Înregistrarea ecranului a eșuat: spațiu insuficient pe disc
screenshot-screencast-try-again = Înregistrarea ecranului a eșuat. Încercați din nou.
screenshot-screencast-failed = Înregistrarea ecranului a eșuat
screenshot-screencast-view = Faceți clic aici pentru a vedea videoclipul
screenshot-show-in-rover = Afișează în Rover
screenshot-captured = Captură de ecran realizată
screenshot-captured-body = Puteți lipi imaginea din clipboard
