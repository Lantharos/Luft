## Quick settings tiles

auto-rotate-title = Rrotullim automatik
dark-style-title = Regjimi i errët
do-not-disturb-title = Mos shqetëso
night-light-title = Drita e natës
airplane-mode-title = Regjimi i aeroplanit

## Power mode

power-profile-title = Regjimi i energjisë
power-profile-header = Regjimi i energjisë
power-profile-open-menu = Hap menynë e regjimeve të energjisë
power-profile-settings = Cilësimet e energjisë
power-profile-performance = Performancë
power-profile-balanced = I balancuar
power-profile-power-saver = Kursim energjie
power-profile-custom = I personalizuar

## Keep awake

caffeine-title = Mbaje zgjuar
caffeine-open-menu = Hap menynë “Mbaje zgjuar”
caffeine-until = Deri në { $time }
caffeine-until-turned-off = Derisa ta çaktivizosh
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 orë
caffeine-2-hours = 2 orë
caffeine-inhibit-reason = Mbajtur zgjuar nga cilësimet e shpejta

## Brightness

brightness-title = Ndriçimi
brightness-open-menu = Hap menynë e ndriçimit

## Keyboard backlight

backlight-title = Ndriçimi i tastierës
backlight-open-menu = Hap menynë e ndriçimit të tastierës
backlight-slider = Ndriçimi i tastierës
backlight-off = Joaktiv
backlight-low = I ulët
backlight-high = I lartë

## Sound

volume-sound-settings = Cilësimet e zërit
volume-mute = Hesht
volume-unmute = Hiq heshtjen
volume-output-slider = Volumi
volume-output-title = Dalja e zërit
volume-output-open-menu = Hap menynë e daljes së zërit
volume-input-slider = Mikrofoni
volume-input-title = Hyrja e zërit
volume-input-open-menu = Hap menynë e hyrjes së zërit

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Hap menynë e Bluetooth
bluetooth-settings = Cilësimet e Bluetooth
bluetooth-connect = Lidhu
bluetooth-disconnect = Shkëputu
bluetooth-connect-device = Lidhu me { $deviceName }
bluetooth-disconnect-device = Shkëput { $deviceName }
bluetooth-no-devices = Nuk ka pajisje të disponueshme ose të lidhura
bluetooth-turn-on-hint = Aktivizo Bluetooth për t’u lidhur me pajisje
bluetooth-connected-count = { $count ->
    [one] { $count } e lidhur
   *[other] { $count } të lidhura
}

## Network menus in quick settings

network-menu-unknown-network = <i panjohur>
network-menu-connect = Lidhu
network-menu-disconnect = Shkëputu
network-menu-connect-to = Lidhu me { $name }
network-menu-disconnect-from = Shkëput { $name }
network-menu-turn-off = Çaktivizo
network-menu-wifi-network = { $secure ->
    [yes] { $name }, i sigurt, fuqia e sinjalit { $strength }%
   *[no] { $name }, jo i sigurt, fuqia e sinjalit { $strength }%
}
network-menu-hotspot = Pika e nxehtë e { $name }
network-menu-connected-count = { $count ->
    [one] { $count } e lidhur
   *[other] { $count } të lidhura
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Hap menynë VPN
network-menu-vpn-settings = Cilësimet e VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Hap menynë Wi-Fi
network-menu-wifi-settings = Të gjitha rrjetet
network-menu-wired = Lidhjet me kabllo
network-menu-wired-open-menu = Hap menynë e lidhjeve me kabllo
network-menu-wired-settings = Cilësimet me kabllo
network-menu-tethers = Internet nga telefoni me Bluetooth
network-menu-tethers-open-menu = Hap menynë e internetit nga telefoni
network-menu-tether = Telefoni
network-menu-tether-settings = Cilësimet e Bluetooth
network-menu-mobile-connections = Lidhjet celulare
network-menu-mobile-open-menu = Hap menynë e lidhjeve celulare
network-menu-mobile-settings = Cilësimet e internetit celular
network-menu-mobile = Celular
network-device-wired = Me kabllo
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Hyr në rrjet
network-menu-failed-title = Lidhja dështoi
network-menu-failed-body = Aktivizimi i lidhjes së rrjetit dështoi

## Location access dialog

location-dialog-title = Lejo qasjen në vendndodhje
location-dialog-description = Aplikacioni { $appName } kërkon qasje në vendndodhjen tënde
location-dialog-info = Qasjen në vendndodhje mund ta ndryshosh kurdo te cilësimet e privatësisë
location-dialog-deny = Refuzo qasjen
location-dialog-grant = Jep qasje

## Thunderbolt notifications

thunderbolt-unknown-title = Pajisje Thunderbolt e panjohur
thunderbolt-unknown-body = U zbulua një pajisje e re ndërsa ishe larg. Shkëpute dhe lidhe sërish pajisjen për të nisur ta përdorësh.
thunderbolt-unauthorized-title = Pajisje Thunderbolt e paautorizuar
thunderbolt-unauthorized-body = U zbulua një pajisje e re që duhet autorizuar nga një administrator
thunderbolt-error-title = Gabim në autorizimin e Thunderbolt
thunderbolt-error-body = Pajisja Thunderbolt nuk u autorizua dot: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Refuzo
access-dialog-allow = Lejo

## Display change confirmation

display-change-title = Të mbahen këto cilësime?
display-change-countdown = { $seconds ->
    [one] Ndryshimet kthehen pas { $seconds } sekonde
   *[other] Ndryshimet kthehen pas { $seconds } sekondash
}
display-change-revert = Kthe cilësimet
display-change-keep = Mbaj ndryshimet

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” nuk po përgjigjet
close-dialog-description = Mund të presësh pak që të vazhdojë ose ta detyrosh aplikacionin të mbyllet plotësisht
close-dialog-force-quit = Detyro mbylljen
close-dialog-wait = Prit

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Pasqyro
switch-monitor-join = Bashko ekranet
switch-monitor-external-only = Vetëm të jashtmit
switch-monitor-built-in-only = Vetëm i brendshmi

## Sign-in prompt

auth-prompt-password = Fjalëkalimi
auth-prompt-username = Emri i përdoruesit
auth-prompt-back = Prapa
auth-prompt-submit = Dërgo
auth-prompt-wrong-password = Ai fjalëkalim nuk funksionoi
auth-prompt-failed = Nuk funksionoi. Provo sërish.
fingerprint-not-recognized = Gjurma e gishtit nuk u njoh

## Drive connected notification

autorun-connected = “{ $driveName }” u lidh
autorun-ready = Disku tani mund të përdoret
autorun-open-with = Hap me { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Tastet e ngadalta u aktivizuan
kbd-a11y-slow-keys-off = Tastet e ngadalta u çaktivizuan
kbd-a11y-slow-keys-description = Sapo mbajte të shtypur tastin Shift për 8 sekonda. Kjo është shkurtorja për tastet e ngadalta, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-sticky-keys-on = Tastet ngjitëse u aktivizuan
kbd-a11y-sticky-keys-off = Tastet ngjitëse u çaktivizuan
kbd-a11y-sticky-keys-on-description = Sapo shtype tastin Shift 5 herë radhazi. Kjo është shkurtorja për tastet ngjitëse, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-sticky-keys-off-description = Sapo shtype dy taste njëherësh ose shtype tastin Shift 5 herë radhazi. Kjo çaktivizon tastet ngjitëse, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-leave-on = Lëri aktive
kbd-a11y-turn-on = Aktivizo
kbd-a11y-turn-off = Çaktivizo
kbd-a11y-leave-off = Lëri joaktive

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Zgjidh pajisjen audio
audio-device-cancel = Anulo
audio-device-sound-settings = Cilësimet e zërit
audio-device-headphones = Kufje
audio-device-headset = Kufje me mikrofon
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Lejo çaktivizimin e shkurtoreve
inhibit-shortcuts-app = Aplikacioni { $appName } kërkon të çaktivizojë shkurtoret
inhibit-shortcuts-unknown-app = Një aplikacion kërkon të çaktivizojë shkurtoret
inhibit-shortcuts-restore = Mund t’i rikthesh shkurtoret duke shtypur { $shortcut }
inhibit-shortcuts-deny = Refuzo
inhibit-shortcuts-allow = Lejo

## Administrator authentication

polkit-title = Kërkohet vërtetimi
polkit-administrator = Administratori
polkit-password = Fjalëkalimi
polkit-cancel = Anulo
polkit-authenticate = Vërteto
polkit-failed = Na vjen keq, nuk funksionoi. Provo sërish.

## Unlocking encrypted drives

mount-hidden-volume = Vëllim i fshehur
mount-windows-system-volume = Vëllim sistemi Windows
mount-uses-keyfiles = Përdor skedarë çelësash
mount-keyfiles-use-app = Për të zhbllokuar një vëllim që përdor skedarë çelësash, përdor <i>{ $appName }</i>
mount-keyfiles-need-app = Të duhet një mjet i jashtëm si <i>Disqet</i> për të zhbllokuar një vëllim që përdor skedarë çelësash
mount-pim-number = Numri PIM
mount-pim-invalid = PIM duhet të jetë numër ose bosh
mount-password = Fjalëkalimi
mount-remember-password = Mbaj mend fjalëkalimin
mount-cancel = Anulo
mount-unlock = Zhblloko
mount-open-app = Hap { $appName }
mount-wrong-password = Na vjen keq, nuk funksionoi. Provo sërish.
mount-unlock-failed = Vëllimi nuk u zhbllokua dot
mount-pim-unsupported = Versioni i instaluar i udisks nuk e mbështet cilësimin PIM

## Log out, power off and restart dialog

end-session-log-out-user = Dil si { $userName }
end-session-log-out-title = Dil
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } do të dalë automatikisht pas { $seconds } sekonde
   *[other] { $userName } do të dalë automatikisht pas { $seconds } sekondash
}
end-session-log-out-countdown = { $seconds ->
    [one] Do të dalësh automatikisht pas { $seconds } sekonde
   *[other] Do të dalësh automatikisht pas { $seconds } sekondash
}
end-session-log-out-button = Dil
end-session-power-off-title = Fik
end-session-power-off-updates-title = Instalo përditësimet dhe fik
end-session-power-off-countdown = { $seconds ->
    [one] Sistemi do të fiket automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të fiket automatikisht pas { $seconds } sekondash
}
end-session-power-off-button = Fik
end-session-restart-title = Rinis
end-session-restart-updates-title = Instalo përditësimet dhe rinis
end-session-restart-countdown = { $seconds ->
    [one] Sistemi do të riniset automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të riniset automatikisht pas { $seconds } sekondash
}
end-session-restart-button = Rinis
end-session-update-restart-title = Rinis dhe instalo përditësimet
end-session-update-restart-countdown = { $seconds ->
    [one] Sistemi do të riniset dhe do të instalojë përditësimet automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të riniset dhe do të instalojë përditësimet automatikisht pas { $seconds } sekondash
}
end-session-update-restart-button = Rinis dhe instalo
end-session-install-updates = Instalo përditësimet e softuerit në pritje
end-session-install-version = Instalo versionin { $version }
end-session-low-battery = Bateria është e ulët: lidhe në korrent para se të instalosh përditësimet
end-session-busy-apps = Disa aplikacione janë të zëna ose kanë punë të paruajtur
end-session-other-users = Përdorues të tjerë kanë hyrë në sistem
end-session-cancel = Anulo
end-session-boot-options = Opsionet e nisjes
end-session-remote-user = { $userName } (në distancë)
end-session-console-user = { $userName } (konsolë)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Kërkohet vërtetimi
network-agent-wifi-rejected = Fjalëkalimi i ruajtur për “{ $networkName }” nuk funksionoi. Shkruaje sërish.
network-agent-wifi-secrets = Duhen fjalëkalime ose çelësa enkriptimi për t’u lidhur me rrjetin pa tel “{ $networkName }”
network-agent-wps-hint = Ose mund të lidhesh duke shtypur butonin “WPS” në ruter
network-agent-wired-title = Vërtetimi 802.1X me kabllo
network-agent-dsl-title = Vërtetimi DSL
network-agent-pin-title = Kërkohet kodi PIN
network-agent-pin-body = Pajisja e internetit celular kërkon kodin PIN
network-agent-vpn-title = Fjalëkalimi i VPN
network-agent-password-required = Duhet një fjalëkalim për t’u lidhur me “{ $networkName }”
network-agent-connect = Lidhu
network-agent-cancel = Anulo
network-agent-password = Fjalëkalimi
network-agent-username = Emri i përdoruesit
network-agent-key = Çelësi
network-agent-private-key-password = Fjalëkalimi i çelësit privat
network-agent-identity = Identiteti
network-agent-service = Shërbimi
network-agent-network-name = Emri i rrjetit
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Rrëshqit lart
lock-clock-click-or-press = Kliko ose shtyp një tast

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Dritaret
ctrl-alt-tab-panel = Paneli
ctrl-alt-tab-unlock = Dritarja e zhbllokimit

## System notifications

messages-system-source = Sistemi
unsafe-mode-title = Sistemi u vendos në regjim të pasigurt
unsafe-mode-body = Aplikacionet tani kanë qasje të pakufizuar
unsafe-mode-undo = Zhbëj
privileged-user-title = Ke hyrë si përdorues me privilegje
privileged-user-body = Një seancë si përdorues me privilegje duhet shmangur për arsye sigurie. Nëse mundesh, hyr si përdorues i zakonshëm.

## On-screen keyboard

osk-keyboard-settings = Cilësimet e tastierës
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel duhet të bllokojë ekranin

## Notifications

messages-unknown-app = Aplikacion i panjohur
messages-reply = Përgjigju
messages-reply-placeholder = Shkruaj një përgjigje
messages-reply-send = Dërgo

## Media player controls

mpris-unknown-artist = Artist i panjohur
mpris-unknown-title = Titull i panjohur

## Starting programs

spawn-failed = Ekzekutimi i “{ $command }” dështoi:

## Text field context menu

entry-menu-copy = Kopjo
entry-menu-paste = Ngjit
entry-menu-show-text = Shfaq tekstin
entry-menu-hide-text = Fshih tekstin
entry-caps-lock-on = Caps Lock është aktiv

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Bëj foto ekrani
title-bar-menu-hide = Fshih
title-bar-menu-restore = Rikthe
title-bar-menu-maximize = Maksimizo
title-bar-menu-move = Lëviz
title-bar-menu-resize = Ndrysho përmasat
title-bar-menu-always-on-top = Gjithmonë sipër
title-bar-menu-always-on-visible-workspace = Gjithmonë në hapësirën e dukshme të punës
title-bar-menu-workspace-left = Zhvendos në hapësirën e punës majtas
title-bar-menu-workspace-right = Zhvendos në hapësirën e punës djathtas
title-bar-menu-workspace-up = Zhvendos në hapësirën e punës sipër
title-bar-menu-workspace-down = Zhvendos në hapësirën e punës poshtë
title-bar-menu-monitor-up = Zhvendos në monitorin sipër
title-bar-menu-monitor-down = Zhvendos në monitorin poshtë
title-bar-menu-monitor-left = Zhvendos në monitorin majtas
title-bar-menu-monitor-right = Zhvendos në monitorin djathtas
title-bar-menu-close = Mbyll

## Screenshots and screen recording

screenshot-source = Kapja e ekranit
screenshot-area = Zgjedhje zone
screenshot-screen = Zgjedhje ekrani
screenshot-window = Zgjedhje dritareje
screenshot-take = Bëj foto ekrani
screenshot-record = Regjistro ekranin
screenshot-show-pointer = Shfaq treguesin
screenshot-capture = Kap
screenshot-close = Mbyll
screenshot-screencasts-folder = Regjistrimet e ekranit
screenshot-screencast-file = Regjistrim ekrani { $date } { $time }
screenshot-screenshots-folder = Fotot e ekranit
screenshot-file = Foto ekrani { $timestamp }
screenshot-screencast-recorded = Regjistrimi i ekranit u ruajt
screenshot-screencast-start-failed = Regjistrimi i ekranit nuk nisi
screenshot-screencast-out-of-space = Regjistrimi i ekranit dështoi: nuk ka hapësirë në disk
screenshot-screencast-try-again = Regjistrimi i ekranit dështoi, provo sërish
screenshot-screencast-failed = Regjistrimi i ekranit dështoi
screenshot-screencast-view = Kliko këtu për të parë videon
screenshot-show-in-rover = Shfaq në Rover
screenshot-captured = Foto ekrani u bë
screenshot-captured-body = Mund ta ngjitësh imazhin nga kujtesa e fragmenteve

## Rain

rain-title = Shi
rain-open-menu = Hap menynë e shiut
rain-drizzle = Vesë
rain-rain = Shi
rain-storm = Stuhi
rain-show = Shfaqe në desktop
rain-sound = Zëri
rain-volume = Volumi i shiut
rain-settings = Cilësimet e shiut
