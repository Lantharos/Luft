## Quick settings tiles

auto-rotate-title = Automatinis pasukimas
dark-style-title = Tamsusis režimas
do-not-disturb-title = Netrukdyti
night-light-title = Naktinė šviesa
airplane-mode-title = Lėktuvo režimas

## Power mode

power-profile-title = Maitinimo režimas
power-profile-header = Maitinimo režimas
power-profile-open-menu = Atidaryti maitinimo režimų meniu
power-profile-settings = Maitinimo nustatymai
power-profile-performance = Našumas
power-profile-balanced = Subalansuotas
power-profile-power-saver = Energijos taupymas
power-profile-custom = Pasirinktinis

## Keep awake

caffeine-title = Neužmigti
caffeine-open-menu = Atidaryti meniu Neužmigti
caffeine-until = Iki { $time }
caffeine-until-turned-off = Kol išjungsite
caffeine-30-minutes = 30 minučių
caffeine-1-hour = 1 valandą
caffeine-2-hours = 2 valandas
caffeine-inhibit-reason = Neužmigti įjungta sparčiuosiuose nustatymuose

## Brightness

brightness-title = Šviesumas
brightness-open-menu = Atidaryti šviesumo meniu

## Keyboard backlight

backlight-title = Klaviatūros apšvietimas
backlight-open-menu = Atidaryti klaviatūros šviesumo meniu
backlight-slider = Klaviatūros šviesumas
backlight-off = Išjungta
backlight-low = Silpnas
backlight-high = Stiprus

## Sound

volume-sound-settings = Garso nustatymai
volume-mute = Nutildyti
volume-unmute = Įjungti garsą
volume-output-slider = Garsumas
volume-output-title = Garso išvestis
volume-output-open-menu = Atidaryti garso išvesties meniu
volume-input-slider = Mikrofonas
volume-input-title = Garso įvestis
volume-input-open-menu = Atidaryti garso įvesties meniu

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Atidaryti Bluetooth meniu
bluetooth-settings = Bluetooth nustatymai
bluetooth-connect = Prijungti
bluetooth-disconnect = Atjungti
bluetooth-connect-device = Prijungti įrenginį { $deviceName }
bluetooth-disconnect-device = Atjungti įrenginį { $deviceName }
bluetooth-no-devices = Nėra pasiekiamų ar prijungtų įrenginių
bluetooth-turn-on-hint = Įjunkite Bluetooth, kad galėtumėte prijungti įrenginius
bluetooth-connected-count = { $count ->
    [one] { $count } prijungtas
    [few] { $count } prijungti
    [many] { $count } prijungto
   *[other] { $count } prijungtų
}

## Network menus in quick settings

network-menu-unknown-network = <nežinomas>
network-menu-connect = Prisijungti
network-menu-disconnect = Atsijungti
network-menu-connect-to = Prisijungti prie tinklo { $name }
network-menu-disconnect-from = Atsijungti nuo tinklo { $name }
network-menu-turn-off = Išjungti
network-menu-wifi-network = { $secure ->
    [yes] { $name }, saugus, signalo stiprumas { $strength } %
   *[no] { $name }, nesaugus, signalo stiprumas { $strength } %
}
network-menu-hotspot = Prieigos taškas { $name }
network-menu-connected-count = { $count ->
    [one] { $count } prijungtas
    [few] { $count } prijungti
    [many] { $count } prijungto
   *[other] { $count } prijungtų
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Atidaryti VPN meniu
network-menu-vpn-settings = VPN nustatymai
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Atidaryti Wi-Fi meniu
network-menu-wifi-settings = Visi tinklai
network-menu-wired = Laidiniai ryšiai
network-menu-wired-open-menu = Atidaryti laidinių ryšių meniu
network-menu-wired-settings = Laidinio ryšio nustatymai
network-menu-tethers = Bluetooth modemai
network-menu-tethers-open-menu = Atidaryti Bluetooth modemų meniu
network-menu-tether = Modemas
network-menu-tether-settings = Bluetooth nustatymai
network-menu-mobile-connections = Mobilieji ryšiai
network-menu-mobile-open-menu = Atidaryti mobiliųjų ryšių meniu
network-menu-mobile-settings = Mobiliojo interneto nustatymai
network-menu-mobile = Mobilusis
network-menu-sign-in = Prisijungti prie tinklo
network-menu-failed-title = Nepavyko prisijungti
network-menu-failed-body = Nepavyko suaktyvinti tinklo ryšio

## Location access dialog

location-dialog-title = Leisti pasiekti buvimo vietą
location-dialog-description = Programa { $appName } nori pasiekti jūsų buvimo vietą
location-dialog-info = Buvimo vietos prieigą bet kada galite pakeisti Nustatymų skiltyje Privatumas
location-dialog-deny = Neleisti
location-dialog-grant = Leisti

## Thunderbolt notifications

thunderbolt-unknown-title = Nežinomas Thunderbolt įrenginys
thunderbolt-unknown-body = Kol jūsų nebuvo, prijungtas naujas įrenginys. Atjunkite jį ir vėl prijunkite, kad galėtumėte naudoti.
thunderbolt-unauthorized-title = Nepatvirtintas Thunderbolt įrenginys
thunderbolt-unauthorized-body = Prijungtas naujas įrenginys, kurį turi patvirtinti administratorius
thunderbolt-error-title = Thunderbolt patvirtinimo klaida
thunderbolt-error-body = Nepavyko patvirtinti Thunderbolt įrenginio: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Neleisti
access-dialog-allow = Leisti

## Display change confirmation

display-change-title = Palikti šiuos nustatymus?
display-change-countdown = { $seconds ->
    [one] Nustatymai bus atkurti po { $seconds } sekundės
    [few] Nustatymai bus atkurti po { $seconds } sekundžių
    [many] Nustatymai bus atkurti po { $seconds } sekundės
   *[other] Nustatymai bus atkurti po { $seconds } sekundžių
}
display-change-revert = Atkurti
display-change-keep = Palikti

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Programa { $appName } neatsako
close-dialog-description = Galite šiek tiek palaukti, kol ji vėl ims veikti, arba priverstinai ją uždaryti
close-dialog-force-quit = Priverstinai uždaryti
close-dialog-wait = Laukti

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Dubliuoti
switch-monitor-join = Išplėsti
switch-monitor-external-only = Tik išorinis
switch-monitor-built-in-only = Tik integruotas

## Sign-in prompt

auth-prompt-password = Slaptažodis
auth-prompt-username = Naudotojo vardas
auth-prompt-back = Atgal
auth-prompt-submit = Pateikti
auth-prompt-wrong-password = Slaptažodis netinka
auth-prompt-failed = Nepavyko. Bandykite dar kartą.
fingerprint-not-recognized = Piršto atspaudas neatpažintas

## Drive connected notification

autorun-connected = Prijungtas „{ $driveName }“
autorun-ready = Diską jau galima naudoti
autorun-open-with = Atidaryti programoje { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Lėtieji klavišai įjungti
kbd-a11y-slow-keys-off = Lėtieji klavišai išjungti
kbd-a11y-slow-keys-description = Ką tik 8 sekundes laikėte nuspaudę klavišą Shift. Taip įjungiami lėtieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-sticky-keys-on = Lipnieji klavišai įjungti
kbd-a11y-sticky-keys-off = Lipnieji klavišai išjungti
kbd-a11y-sticky-keys-on-description = Ką tik 5 kartus iš eilės paspaudėte klavišą Shift. Taip įjungiami lipnieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-sticky-keys-off-description = Ką tik paspaudėte du klavišus vienu metu arba 5 kartus iš eilės paspaudėte klavišą Shift. Taip išjungiami lipnieji klavišai, kurie keičia klaviatūros veikimą.
kbd-a11y-leave-on = Palikti įjungtus
kbd-a11y-turn-on = Įjungti
kbd-a11y-turn-off = Išjungti
kbd-a11y-leave-off = Palikti išjungtus

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Pasirinkite garso įrenginį
audio-device-cancel = Atšaukti
audio-device-sound-settings = Garso nustatymai
audio-device-headphones = Ausinės
audio-device-headset = Ausinės su mikrofonu
audio-device-microphone = Mikrofonas

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Leisti perimti sparčiuosius klavišus
inhibit-shortcuts-app = Programa { $appName } nori perimti sparčiuosius klavišus
inhibit-shortcuts-unknown-app = Programa nori perimti sparčiuosius klavišus
inhibit-shortcuts-restore = Sparčiuosius klavišus galite grąžinti paspaudę { $shortcut }
inhibit-shortcuts-deny = Neleisti
inhibit-shortcuts-allow = Leisti

## Administrator authentication

polkit-title = Reikia patvirtinti tapatybę
polkit-administrator = Administratorius
polkit-password = Slaptažodis
polkit-cancel = Atšaukti
polkit-authenticate = Patvirtinti
polkit-failed = Nepavyko. Bandykite dar kartą.

## Unlocking encrypted drives

mount-hidden-volume = Paslėptas tomas
mount-windows-system-volume = Windows sistemos tomas
mount-uses-keyfiles = Naudoja raktų failus
mount-keyfiles-use-app = Norėdami atrakinti tomą, kuriam naudojami raktų failai, naudokite programą <i>{ $appName }</i>
mount-keyfiles-need-app = Norint atrakinti tomą, kuriam naudojami raktų failai, reikia išorinės programos, pavyzdžiui, <i>Diskai</i>
mount-pim-number = PIM numeris
mount-pim-invalid = PIM turi būti skaičius arba tuščias
mount-password = Slaptažodis
mount-remember-password = Įsiminti slaptažodį
mount-cancel = Atšaukti
mount-unlock = Atrakinti
mount-open-app = Atidaryti programą { $appName }
mount-wrong-password = Nepavyko. Bandykite dar kartą.
mount-unlock-failed = Nepavyko atrakinti tomo
mount-pim-unsupported = Įdiegta udisks versija nepalaiko PIM nustatymo

## Log out, power off and restart dialog

end-session-log-out-user = Atjungti naudotoją { $userName }
end-session-log-out-title = Atsijungti
end-session-log-out-user-countdown = { $seconds ->
    [one] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundės
    [few] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundžių
    [many] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundės
   *[other] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundžių
}
end-session-log-out-countdown = { $seconds ->
    [one] Būsite automatiškai atjungti po { $seconds } sekundės
    [few] Būsite automatiškai atjungti po { $seconds } sekundžių
    [many] Būsite automatiškai atjungti po { $seconds } sekundės
   *[other] Būsite automatiškai atjungti po { $seconds } sekundžių
}
end-session-log-out-button = Atsijungti
end-session-power-off-title = Išjungti
end-session-power-off-updates-title = Įdiegti naujinimus ir išjungti
end-session-power-off-countdown = { $seconds ->
    [one] Sistema bus automatiškai išjungta po { $seconds } sekundės
    [few] Sistema bus automatiškai išjungta po { $seconds } sekundžių
    [many] Sistema bus automatiškai išjungta po { $seconds } sekundės
   *[other] Sistema bus automatiškai išjungta po { $seconds } sekundžių
}
end-session-power-off-button = Išjungti
end-session-restart-title = Paleisti iš naujo
end-session-restart-updates-title = Įdiegti naujinimus ir paleisti iš naujo
end-session-restart-countdown = { $seconds ->
    [one] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundės
    [few] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundžių
    [many] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundės
   *[other] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundžių
}
end-session-restart-button = Paleisti iš naujo
end-session-update-restart-title = Paleisti iš naujo ir įdiegti naujinimus
end-session-update-restart-countdown = { $seconds ->
    [one] Po { $seconds } sekundės sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
    [few] Po { $seconds } sekundžių sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
    [many] Po { $seconds } sekundės sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
   *[other] Po { $seconds } sekundžių sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
}
end-session-update-restart-button = Paleisti iš naujo ir įdiegti
end-session-install-updates = Įdiegti laukiančius programinės įrangos naujinimus
end-session-install-version = Įdiegti versiją { $version }
end-session-low-battery = Akumuliatorius beveik išsikrovęs: prieš diegdami naujinimus prijunkite maitinimą
end-session-busy-apps = Kai kurios programos užimtos arba turi neįrašytų darbų
end-session-other-users = Prisijungę kiti naudotojai
end-session-cancel = Atšaukti
end-session-boot-options = Paleisties parinktys
end-session-remote-user = { $userName } (nuotoliniu būdu)
end-session-console-user = { $userName } (konsolėje)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Reikia patvirtinti tapatybę
network-agent-wifi-rejected = Įrašytas tinklo „{ $networkName }“ slaptažodis netiko. Įveskite jį dar kartą.
network-agent-wifi-secrets = Norint prisijungti prie belaidžio tinklo „{ $networkName }“, reikia slaptažodžių arba šifravimo raktų
network-agent-wps-hint = Taip pat galite prisijungti paspaudę maršruto parinktuvo mygtuką „WPS“
network-agent-wired-title = Laidinio 802.1X ryšio tapatybės patvirtinimas
network-agent-dsl-title = DSL tapatybės patvirtinimas
network-agent-pin-title = Reikia PIN kodo
network-agent-pin-body = Mobiliojo interneto įrenginiui reikia PIN kodo
network-agent-vpn-title = VPN slaptažodis
network-agent-password-required = Norint prisijungti prie „{ $networkName }“, reikia slaptažodžio
network-agent-connect = Prisijungti
network-agent-cancel = Atšaukti
network-agent-password = Slaptažodis
network-agent-username = Naudotojo vardas
network-agent-key = Raktas
network-agent-private-key-password = Privačiojo rakto slaptažodis
network-agent-identity = Tapatybė
network-agent-service = Paslauga
network-agent-network-name = Tinklo pavadinimas
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Perbraukite aukštyn
lock-clock-click-or-press = Spustelėkite arba paspauskite klavišą

## Notification times

date-just-now = Ką tik

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Langai
ctrl-alt-tab-panel = Užduočių juosta
ctrl-alt-tab-unlock = Atrakinimo langas

## System notifications

messages-system-source = Sistema
unsafe-mode-title = Sistema perjungta į nesaugų režimą
unsafe-mode-body = Programos dabar turi neribotą prieigą
unsafe-mode-undo = Anuliuoti
privileged-user-title = Prisijungta kaip privilegijuotas naudotojas
privileged-user-body = Saugumo sumetimais seanso geriau nenaudoti kaip privilegijuotas naudotojas. Jei įmanoma, prisijunkite kaip įprastas naudotojas.

## On-screen keyboard

osk-keyboard-settings = Klaviatūros nustatymai
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel turi užrakinti ekraną

## Notifications

messages-unknown-app = Nežinoma programa
messages-reply = Atsakyti
messages-reply-placeholder = Rašykite atsakymą
messages-reply-send = Siųsti

## Media player controls

mpris-unknown-artist = Nežinomas atlikėjas
mpris-unknown-title = Nežinomas pavadinimas

## Starting programs

spawn-failed = Nepavyko vykdyti „{ $command }“:

## Text field context menu

entry-menu-copy = Kopijuoti
entry-menu-paste = Įklijuoti
entry-menu-show-text = Rodyti tekstą
entry-menu-hide-text = Slėpti tekstą
entry-caps-lock-on = Caps Lock įjungtas

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Padaryti ekrano kopiją
title-bar-menu-hide = Slėpti
title-bar-menu-restore = Atkurti
title-bar-menu-maximize = Maksimizuoti
title-bar-menu-move = Perkelti
title-bar-menu-resize = Keisti dydį
title-bar-menu-always-on-top = Visada viršuje
title-bar-menu-always-on-visible-workspace = Visose darbo srityse
title-bar-menu-workspace-left = Perkelti į kairiąją darbo sritį
title-bar-menu-workspace-right = Perkelti į dešiniąją darbo sritį
title-bar-menu-workspace-up = Perkelti į viršutinę darbo sritį
title-bar-menu-workspace-down = Perkelti į apatinę darbo sritį
title-bar-menu-monitor-up = Perkelti į viršutinį ekraną
title-bar-menu-monitor-down = Perkelti į apatinį ekraną
title-bar-menu-monitor-left = Perkelti į kairįjį ekraną
title-bar-menu-monitor-right = Perkelti į dešinįjį ekraną
title-bar-menu-close = Uždaryti

## Screenshots and screen recording

screenshot-source = Ekrano fiksavimas
screenshot-area = Srities pasirinkimas
screenshot-screen = Ekrano pasirinkimas
screenshot-window = Lango pasirinkimas
screenshot-take = Padaryti ekrano kopiją
screenshot-record = Įrašyti ekraną
screenshot-show-pointer = Rodyti žymiklį
screenshot-capture = Fiksuoti
screenshot-close = Uždaryti
screenshot-screencasts-folder = Ekrano įrašai
screenshot-screencast-file = Ekrano įrašas { $date } { $time }
screenshot-screenshots-folder = Ekrano kopijos
screenshot-file = Ekrano kopija { $timestamp }
screenshot-screencast-recorded = Ekrano įrašas paruoštas
screenshot-screencast-start-failed = Nepavyko pradėti įrašyti ekrano
screenshot-screencast-out-of-space = Nepavyko įrašyti ekrano: diske trūksta vietos
screenshot-screencast-try-again = Nepavyko įrašyti ekrano. Bandykite dar kartą.
screenshot-screencast-failed = Nepavyko įrašyti ekrano
screenshot-screencast-view = Spustelėkite, kad peržiūrėtumėte vaizdo įrašą
screenshot-show-in-rover = Rodyti programoje Rover
screenshot-captured = Ekrano kopija padaryta
screenshot-captured-body = Paveikslėlį galite įklijuoti iš iškarpinės
