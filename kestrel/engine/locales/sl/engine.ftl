## Quick settings tiles

auto-rotate-title = Samodejno sukanje
dark-style-title = Temni način
do-not-disturb-title = Ne moti
night-light-title = Nočna svetloba
airplane-mode-title = Način za letalo

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Odpri meni načinov napajanja
power-profile-settings = Nastavitve napajanja
power-profile-performance = Zmogljivost
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Varčevanje z energijo
power-profile-custom = Po meri

## Keep awake

caffeine-title = Ohrani budnost
caffeine-open-menu = Odpri meni za ohranjanje budnosti
caffeine-until = Do { $time }
caffeine-until-turned-off = Do izklopa
caffeine-30-minutes = 30 minut
caffeine-1-hour = 1 ura
caffeine-2-hours = 2 uri
caffeine-inhibit-reason = Budnost ohranjena prek hitrih nastavitev

## Brightness

brightness-title = Svetlost
brightness-open-menu = Odpri meni svetlosti

## Keyboard backlight

backlight-title = Osvetlitev tipkovnice
backlight-open-menu = Odpri meni svetlosti tipkovnice
backlight-slider = Svetlost tipkovnice
backlight-off = Izklopljeno
backlight-low = Nizka
backlight-high = Visoka

## Sound

volume-sound-settings = Nastavitve zvoka
volume-mute = Izklopi zvok
volume-unmute = Vklopi zvok
volume-output-slider = Glasnost
volume-output-title = Izhod zvoka
volume-output-open-menu = Odpri meni izhoda zvoka
volume-input-slider = Mikrofon
volume-input-title = Vhod zvoka
volume-input-open-menu = Odpri meni vhoda zvoka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Odpri meni Bluetooth
bluetooth-settings = Nastavitve Bluetooth
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini povezavo
bluetooth-connect-device = Poveži z napravo { $deviceName }
bluetooth-disconnect-device = Prekini povezavo z napravo { $deviceName }
bluetooth-no-devices = Ni razpoložljivih ali povezanih naprav
bluetooth-turn-on-hint = Za povezovanje z napravami vklopite Bluetooth
bluetooth-connected-count = { $count ->
    [one] { $count } povezana
    [two] { $count } povezani
    [few] { $count } povezane
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <neznano>
network-menu-connect = Poveži
network-menu-disconnect = Prekini povezavo
network-menu-connect-to = Poveži z omrežjem { $name }
network-menu-disconnect-from = Prekini povezavo z omrežjem { $name }
network-menu-turn-off = Izklopi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaščiteno, moč signala { $strength } %
   *[no] { $name }, nezaščiteno, moč signala { $strength } %
}
network-menu-hotspot = Dostopna točka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [two] { $count } povezani
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Odpri meni VPN
network-menu-vpn-settings = Nastavitve VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Odpri meni Wi-Fi
network-menu-wifi-settings = Vsa omrežja
network-menu-wired = Žične povezave
network-menu-wired-open-menu = Odpri meni žičnih povezav
network-menu-wired-settings = Nastavitve žičnega omrežja
network-menu-tethers = Deljenje povezave Bluetooth
network-menu-tethers-open-menu = Odpri meni deljenja povezave Bluetooth
network-menu-tether = Deljenje povezave
network-menu-tether-settings = Nastavitve Bluetooth
network-menu-mobile-connections = Mobilne povezave
network-menu-mobile-open-menu = Odpri meni mobilnih povezav
network-menu-mobile-settings = Nastavitve mobilnih povezav
network-menu-mobile = Mobilno omrežje
network-device-wired = Žično
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava v omrežje
network-menu-failed-title = Povezava ni uspela
network-menu-failed-body = Aktiviranje omrežne povezave ni uspelo

## Location access dialog

location-dialog-title = Dovoli dostop do lokacije
location-dialog-description = Aplikacija { $appName } želi dostopati do vaše lokacije
location-dialog-info = Dostop do lokacije lahko kadar koli spremenite v nastavitvah zasebnosti
location-dialog-deny = Zavrni dostop
location-dialog-grant = Dovoli dostop

## Thunderbolt notifications

thunderbolt-unknown-title = Neznana naprava Thunderbolt
thunderbolt-unknown-body = Med vašo odsotnostjo je bila priključena nova naprava. Za začetek uporabe jo izključite in znova priključite.
thunderbolt-unauthorized-title = Nepooblaščena naprava Thunderbolt
thunderbolt-unauthorized-body = Priključena je bila nova naprava, ki jo mora odobriti skrbnik
thunderbolt-error-title = Napaka pri pooblaščanju naprave Thunderbolt
thunderbolt-error-body = Naprave Thunderbolt ni bilo mogoče pooblastiti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zavrni
access-dialog-allow = Dovoli

## Display change confirmation

display-change-title = Ohranim nastavitve zaslona?
display-change-countdown = { $seconds ->
    [one] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekundo
    [two] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekundi
    [few] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekunde
   *[other] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekund
}
display-change-revert = Razveljavi
display-change-keep = Ohrani spremembe

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ se ne odziva
close-dialog-description = Počakate lahko, da se aplikacija spet odzove, ali pa jo prisilno zaprete
close-dialog-force-quit = Prisilno zapri
close-dialog-wait = Počakaj

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Zrcaljenje
switch-monitor-join = Združi zaslone
switch-monitor-external-only = Samo zunanji
switch-monitor-built-in-only = Samo vgrajeni

## Sign-in prompt

auth-prompt-password = Geslo
auth-prompt-username = Uporabniško ime
auth-prompt-back = Nazaj
auth-prompt-submit = Pošlji
auth-prompt-wrong-password = Geslo ni delovalo
auth-prompt-failed = To ni uspelo. Poskusite znova.
fingerprint-not-recognized = Prstni odtis ni prepoznan

## Drive connected notification

autorun-connected = Priključeno: „{ $driveName }“
autorun-ready = Disk je pripravljen za uporabo
autorun-open-with = Odpri z aplikacijo { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Počasne tipke so vklopljene
kbd-a11y-slow-keys-off = Počasne tipke so izklopljene
kbd-a11y-slow-keys-description = Pravkar ste 8 sekund držali tipko Shift. To je bližnjica za funkcijo Počasne tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-sticky-keys-on = Lepljive tipke so vklopljene
kbd-a11y-sticky-keys-off = Lepljive tipke so izklopljene
kbd-a11y-sticky-keys-on-description = Pravkar ste petkrat zapored pritisnili tipko Shift. To je bližnjica za funkcijo Lepljive tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-sticky-keys-off-description = Pravkar ste hkrati pritisnili dve tipki ali petkrat zapored pritisnili tipko Shift. S tem se izklopi funkcija Lepljive tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-leave-on = Pusti vklopljeno
kbd-a11y-turn-on = Vklopi
kbd-a11y-turn-off = Izklopi
kbd-a11y-leave-off = Pusti izklopljeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izberite zvočno napravo
audio-device-cancel = Prekliči
audio-device-sound-settings = Nastavitve zvoka
audio-device-headphones = Slušalke
audio-device-headset = Slušalke z mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dovoli onemogočanje bližnjic
inhibit-shortcuts-app = Aplikacija { $appName } želi onemogočiti bližnjice
inhibit-shortcuts-unknown-app = Neka aplikacija želi onemogočiti bližnjice
inhibit-shortcuts-restore = Bližnjice lahko obnovite s pritiskom { $shortcut }
inhibit-shortcuts-deny = Zavrni
inhibit-shortcuts-allow = Dovoli

## Administrator authentication

polkit-title = Potrebno je preverjanje pristnosti
polkit-administrator = Skrbnik
polkit-password = Geslo
polkit-cancel = Prekliči
polkit-authenticate = Preveri pristnost
polkit-failed = To ni uspelo. Poskusite znova.

## Unlocking encrypted drives

mount-hidden-volume = Skriti nosilec
mount-windows-system-volume = Sistemski nosilec Windows
mount-uses-keyfiles = Uporablja datoteke s ključi
mount-keyfiles-use-app = Za odklepanje nosilca, ki uporablja datoteke s ključi, uporabite aplikacijo <i>{ $appName }</i>
mount-keyfiles-need-app = Za odklepanje nosilca, ki uporablja datoteke s ključi, potrebujete zunanjo aplikacijo, kot je <i>Diski</i>
mount-pim-number = Število PIM
mount-pim-invalid = PIM mora biti število ali prazen
mount-password = Geslo
mount-remember-password = Zapomni si geslo
mount-cancel = Prekliči
mount-unlock = Odkleni
mount-open-app = Odpri aplikacijo { $appName }
mount-wrong-password = To ni uspelo. Poskusite znova.
mount-unlock-failed = Nosilca ni mogoče odkleniti
mount-pim-unsupported = Nameščena različica udisks ne podpira nastavitve PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odjava – { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } – samodejna odjava čez { $seconds } sekundo
    [two] { $userName } – samodejna odjava čez { $seconds } sekundi
    [few] { $userName } – samodejna odjava čez { $seconds } sekunde
   *[other] { $userName } – samodejna odjava čez { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Samodejno boste odjavljeni čez { $seconds } sekundo
    [two] Samodejno boste odjavljeni čez { $seconds } sekundi
    [few] Samodejno boste odjavljeni čez { $seconds } sekunde
   *[other] Samodejno boste odjavljeni čez { $seconds } sekund
}
end-session-log-out-button = Odjava
end-session-power-off-title = Zaustavitev sistema
end-session-power-off-updates-title = Namesti posodobitve in zaustavi sistem
end-session-power-off-countdown = { $seconds ->
    [one] Sistem se bo samodejno zaustavil čez { $seconds } sekundo
    [two] Sistem se bo samodejno zaustavil čez { $seconds } sekundi
    [few] Sistem se bo samodejno zaustavil čez { $seconds } sekunde
   *[other] Sistem se bo samodejno zaustavil čez { $seconds } sekund
}
end-session-power-off-button = Zaustavi sistem
end-session-restart-title = Vnovični zagon
end-session-restart-updates-title = Namesti posodobitve in znova zaženi
end-session-restart-countdown = { $seconds ->
    [one] Sistem se bo samodejno znova zagnal čez { $seconds } sekundo
    [two] Sistem se bo samodejno znova zagnal čez { $seconds } sekundi
    [few] Sistem se bo samodejno znova zagnal čez { $seconds } sekunde
   *[other] Sistem se bo samodejno znova zagnal čez { $seconds } sekund
}
end-session-restart-button = Znova zaženi
end-session-update-restart-title = Znova zaženi in namesti posodobitve
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem se bo čez { $seconds } sekundo samodejno znova zagnal in namestil posodobitve
    [two] Sistem se bo čez { $seconds } sekundi samodejno znova zagnal in namestil posodobitve
    [few] Sistem se bo čez { $seconds } sekunde samodejno znova zagnal in namestil posodobitve
   *[other] Sistem se bo čez { $seconds } sekund samodejno znova zagnal in namestil posodobitve
}
end-session-update-restart-button = Znova zaženi in namesti
end-session-install-updates = Namesti čakajoče posodobitve programske opreme
end-session-install-version = Namesti različico { $version }
end-session-low-battery = Baterija je skoraj prazna. Pred nameščanjem posodobitev priključite napajanje.
end-session-busy-apps = Nekatere aplikacije so zasedene ali imajo neshranjeno delo
end-session-other-users = Prijavljeni so drugi uporabniki
end-session-cancel = Prekliči
end-session-boot-options = Možnosti zagona
end-session-remote-user = { $userName } (oddaljeno)
end-session-console-user = { $userName } (konzola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebno je preverjanje pristnosti
network-agent-wifi-rejected = Shranjeno geslo za „{ $networkName }“ ni delovalo. Vnesite ga znova.
network-agent-wifi-secrets = Za dostop do brezžičnega omrežja „{ $networkName }“ so potrebna gesla ali šifrirni ključi
network-agent-wps-hint = Povežete se lahko tudi s pritiskom gumba „WPS“ na usmerjevalniku
network-agent-wired-title = Žično preverjanje pristnosti 802.1X
network-agent-dsl-title = Preverjanje pristnosti DSL
network-agent-pin-title = Potrebna je koda PIN
network-agent-pin-body = Za mobilno širokopasovno napravo je potrebna koda PIN
network-agent-vpn-title = Geslo VPN
network-agent-password-required = Za povezavo z omrežjem „{ $networkName }“ je potrebno geslo
network-agent-connect = Poveži
network-agent-cancel = Prekliči
network-agent-password = Geslo
network-agent-username = Uporabniško ime
network-agent-key = Ključ
network-agent-private-key-password = Geslo zasebnega ključa
network-agent-identity = Identiteta
network-agent-service = Storitev
network-agent-network-name = Ime omrežja
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Povlecite navzgor
lock-clock-click-or-press = Kliknite ali pritisnite tipko

## Notification times

date-just-now = Pravkar

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Okna
ctrl-alt-tab-panel = Opravilna vrstica
ctrl-alt-tab-unlock = Okno za odklepanje

## System notifications

messages-system-source = Sistem
unsafe-mode-title = Sistem je v nevarnem načinu
unsafe-mode-body = Aplikacije imajo zdaj neomejen dostop
unsafe-mode-undo = Razveljavi
privileged-user-title = Prijavljeni ste kot privilegirani uporabnik
privileged-user-body = Seji s privilegiranim uporabnikom se iz varnostnih razlogov izogibajte. Če je mogoče, se prijavite kot običajni uporabnik.

## On-screen keyboard

osk-keyboard-settings = Nastavitve tipkovnice
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel mora zakleniti zaslon

## Notifications

messages-unknown-app = Neznana aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošlji

## Media player controls

mpris-unknown-artist = Neznan izvajalec
mpris-unknown-title = Neznan naslov

## Starting programs

spawn-failed = Izvajanje ukaza „{ $command }“ ni uspelo:

## Text field context menu

entry-menu-copy = Kopiraj
entry-menu-paste = Prilepi
entry-menu-show-text = Pokaži besedilo
entry-menu-hide-text = Skrij besedilo
entry-caps-lock-on = Caps Lock je vklopljen

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Zajemi posnetek zaslona
title-bar-menu-hide = Skrij
title-bar-menu-restore = Obnovi
title-bar-menu-maximize = Maksimiraj
title-bar-menu-move = Premakni
title-bar-menu-resize = Spremeni velikost
title-bar-menu-always-on-top = Vedno na vrhu
title-bar-menu-always-on-visible-workspace = Vedno na vidni delovni površini
title-bar-menu-workspace-left = Premakni na levo delovno površino
title-bar-menu-workspace-right = Premakni na desno delovno površino
title-bar-menu-workspace-up = Premakni na zgornjo delovno površino
title-bar-menu-workspace-down = Premakni na spodnjo delovno površino
title-bar-menu-monitor-up = Premakni na zgornji zaslon
title-bar-menu-monitor-down = Premakni na spodnji zaslon
title-bar-menu-monitor-left = Premakni na levi zaslon
title-bar-menu-monitor-right = Premakni na desni zaslon
title-bar-menu-close = Zapri

## Screenshots and screen recording

screenshot-source = Zajem zaslona
screenshot-area = Izbor območja
screenshot-screen = Izbor zaslona
screenshot-window = Izbor okna
screenshot-take = Zajemi posnetek zaslona
screenshot-record = Posnemi zaslon
screenshot-show-pointer = Pokaži kazalec
screenshot-capture = Zajemi
screenshot-close = Zapri
screenshot-screencasts-folder = Videoposnetki zaslona
screenshot-screencast-file = Videoposnetek zaslona { $date } { $time }
screenshot-screenshots-folder = Posnetki zaslona
screenshot-file = Posnetek zaslona { $timestamp }
screenshot-screencast-recorded = Videoposnetek zaslona je posnet
screenshot-screencast-start-failed = Snemanja zaslona ni bilo mogoče začeti
screenshot-screencast-out-of-space = Snemanje zaslona ni uspelo: na disku ni dovolj prostora
screenshot-screencast-try-again = Snemanje zaslona ni uspelo. Poskusite znova.
screenshot-screencast-failed = Snemanje zaslona ni uspelo
screenshot-screencast-view = Kliknite tukaj za ogled videoposnetka
screenshot-show-in-rover = Pokaži v aplikaciji Rover
screenshot-captured = Posnetek zaslona je zajet
screenshot-captured-body = Sliko lahko prilepite iz odložišča
