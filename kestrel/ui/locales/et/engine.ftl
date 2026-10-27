## Quick settings tiles

auto-rotate-title = Automaatne pööramine
dark-style-title = Tume režiim
do-not-disturb-title = Ära sega
night-light-title = Öövalgus
airplane-mode-title = Lennukirežiim

## Power mode

power-profile-title = Toiterežiim
power-profile-header = Toiterežiim
power-profile-open-menu = Ava toiterežiimide menüü
power-profile-settings = Toitesätted
power-profile-performance = Jõudlus
power-profile-balanced = Tasakaalustatud
power-profile-power-saver = Energiasääst
power-profile-custom = Kohandatud

## Keep awake

caffeine-title = Hoia ärkvel
caffeine-open-menu = Ava ärkvel hoidmise menüü
caffeine-until = Kuni { $time }
caffeine-until-turned-off = Kuni väljalülitamiseni
caffeine-30-minutes = 30 minutit
caffeine-1-hour = 1 tund
caffeine-2-hours = 2 tundi
caffeine-inhibit-reason = Ärkvel hoitud kiirsätete kaudu

## Brightness

brightness-title = Heledus
brightness-open-menu = Ava heleduse menüü

## Keyboard backlight

backlight-title = Klaviatuuri taustvalgustus
backlight-open-menu = Ava klaviatuuri heleduse menüü
backlight-slider = Klaviatuuri heledus
backlight-off = Väljas
backlight-low = Madal
backlight-high = Kõrge

## Sound

volume-sound-settings = Helisätted
volume-mute = Vaigista
volume-unmute = Tühista vaigistus
volume-output-slider = Helitugevus
volume-output-title = Heliväljund
volume-output-open-menu = Ava heliväljundi menüü
volume-input-slider = Mikrofon
volume-input-title = Helisisend
volume-input-open-menu = Ava helisisendi menüü

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Ava Bluetoothi menüü
bluetooth-settings = Bluetoothi sätted
bluetooth-connect = Ühenda
bluetooth-disconnect = Katkesta ühendus
bluetooth-connect-device = Ühenda seadmega { $deviceName }
bluetooth-disconnect-device = Katkesta ühendus seadmega { $deviceName }
bluetooth-no-devices = Saadaolevaid ega ühendatud seadmeid pole
bluetooth-turn-on-hint = Seadmetega ühenduse loomiseks lülita Bluetooth sisse
bluetooth-connected-count =
    { $count ->
        [one] { $count } ühendatud
       *[other] { $count } ühendatud
    }

## Network menus in quick settings

network-menu-unknown-network = <tundmatu>
network-menu-connect = Ühenda
network-menu-disconnect = Katkesta ühendus
network-menu-connect-to = Ühenda: { $name }
network-menu-disconnect-from = Katkesta ühendus: { $name }
network-menu-turn-off = Lülita välja
network-menu-wifi-network =
    { $secure ->
        [yes] { $name }, turvaline, signaali tugevus { $strength }%
       *[no] { $name }, turvamata, signaali tugevus { $strength }%
    }
network-menu-hotspot = Kuumkoht { $name }
network-menu-connected-count =
    { $count ->
        [one] { $count } ühendatud
       *[other] { $count } ühendatud
    }
network-menu-vpn = VPN
network-menu-vpn-open-menu = Ava VPN-i menüü
network-menu-vpn-settings = VPN-i sätted
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Ava Wi-Fi menüü
network-menu-wifi-settings = Kõik võrgud
network-menu-wired = Juhtmega ühendused
network-menu-wired-open-menu = Ava juhtmega ühenduste menüü
network-menu-wired-settings = Juhtmega võrgu sätted
network-menu-tethers = Bluetoothi ühiskasutus
network-menu-tethers-open-menu = Ava Bluetoothi ühiskasutuse menüü
network-menu-tether = Ühiskasutus
network-menu-tether-settings = Bluetoothi sätted
network-menu-mobile-connections = Mobiilsideühendused
network-menu-mobile-open-menu = Ava mobiilsideühenduste menüü
network-menu-mobile-settings = Mobiilse lairibaühenduse sätted
network-menu-mobile = Mobiilside
network-device-wired = Juhtmega
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logi võrku sisse
network-menu-failed-title = Ühendamine ebaõnnestus
network-menu-failed-body = Võrguühendust ei õnnestunud aktiveerida

## Location access dialog

location-dialog-title = Juurdepääs asukohale
location-dialog-description = Rakendus { $appName } soovib juurdepääsu sinu asukohale
location-dialog-info = Asukohale juurdepääsu saab igal ajal muuta privaatsussätetes
location-dialog-deny = Keela juurdepääs
location-dialog-grant = Luba juurdepääs

## Thunderbolt notifications

thunderbolt-unknown-title = Tundmatu Thunderbolti seade
thunderbolt-unknown-body = Sinu äraolekul ühendati uus seade. Selle kasutamiseks eemalda see ja ühenda uuesti.
thunderbolt-unauthorized-title = Volitamata Thunderbolti seade
thunderbolt-unauthorized-body = Ühendati uus seade, mis vajab administraatori heakskiitu
thunderbolt-error-title = Thunderbolti volitamise viga
thunderbolt-error-body = Thunderbolti seadet ei õnnestunud volitada: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Keela
access-dialog-allow = Luba

## Display change confirmation

display-change-title = Kas jätta need kuvasätted?
display-change-countdown =
    { $seconds ->
        [one] Sätted taastatakse { $seconds } sekundi pärast
       *[other] Sätted taastatakse { $seconds } sekundi pärast
    }
display-change-revert = Taasta sätted
display-change-keep = Jäta muudatused

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ ei reageeri
close-dialog-description = Võid veidi oodata, kuni see jätkab, või sundida rakenduse täielikult sulguma
close-dialog-force-quit = Sunni sulgema
close-dialog-wait = Oota

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Peegelda
switch-monitor-join = Laienda
switch-monitor-external-only = Ainult välised
switch-monitor-built-in-only = Ainult sisemine

## Sign-in prompt

auth-prompt-password = Salasõna
auth-prompt-username = Kasutajanimi
auth-prompt-back = Tagasi
auth-prompt-submit = Kinnita
auth-prompt-wrong-password = See salasõna ei sobinud
auth-prompt-failed = See ei õnnestunud. Proovi uuesti.
fingerprint-not-recognized = Sõrmejälge ei tuvastatud

## Drive connected notification

autorun-connected = „{ $driveName }“ on ühendatud
autorun-ready = Ketast saab nüüd kasutada
autorun-open-with = Ava rakendusega { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Aeglased klahvid on sisse lülitatud
kbd-a11y-slow-keys-off = Aeglased klahvid on välja lülitatud
kbd-a11y-slow-keys-description = Hoidsid Shift-klahvi 8 sekundit all. See on aeglaste klahvide kiirklahv. Aeglased klahvid muudavad klaviatuuri tööviisi.
kbd-a11y-sticky-keys-on = Kleepklahvid on sisse lülitatud
kbd-a11y-sticky-keys-off = Kleepklahvid on välja lülitatud
kbd-a11y-sticky-keys-on-description = Vajutasid Shift-klahvi 5 korda järjest. See on kleepklahvide kiirklahv. Kleepklahvid muudavad klaviatuuri tööviisi.
kbd-a11y-sticky-keys-off-description = Vajutasid kaht klahvi korraga või Shift-klahvi 5 korda järjest. See lülitab kleepklahvid välja. Kleepklahvid muudavad klaviatuuri tööviisi.
kbd-a11y-leave-on = Jäta sisse
kbd-a11y-turn-on = Lülita sisse
kbd-a11y-turn-off = Lülita välja
kbd-a11y-leave-off = Jäta välja

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vali heliseade
audio-device-cancel = Loobu
audio-device-sound-settings = Helisätted
audio-device-headphones = Kõrvaklapid
audio-device-headset = Peakomplekt
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Kiirklahvide blokeerimine
inhibit-shortcuts-app = Rakendus { $appName } soovib süsteemi kiirklahvid blokeerida
inhibit-shortcuts-unknown-app = Üks rakendus soovib süsteemi kiirklahvid blokeerida
inhibit-shortcuts-restore = Kiirklahvid saad taastada, kui vajutad { $shortcut }
inhibit-shortcuts-deny = Keela
inhibit-shortcuts-allow = Luba

## Administrator authentication

polkit-title = Vajalik on autentimine
polkit-administrator = Administraator
polkit-password = Salasõna
polkit-cancel = Loobu
polkit-authenticate = Autendi
polkit-failed = See ei õnnestunud. Proovi uuesti.

## Unlocking encrypted drives

mount-hidden-volume = Peidetud köide
mount-windows-system-volume = Windowsi süsteemiköide
mount-uses-keyfiles = Kasutab võtmefaile
mount-keyfiles-use-app = Võtmefaile kasutava köite avamiseks kasuta rakendust <i>{ $appName }</i>
mount-keyfiles-need-app = Võtmefaile kasutava köite avamiseks on vaja eraldi tööriista, näiteks rakendust <i>Kettad</i>
mount-pim-number = PIM-number
mount-pim-invalid = PIM peab olema number või tühi
mount-password = Salasõna
mount-remember-password = Jäta salasõna meelde
mount-cancel = Loobu
mount-unlock = Ava
mount-open-app = Ava { $appName }
mount-wrong-password = Vabandust, see ei õnnestunud. Proovi uuesti.
mount-unlock-failed = Köidet ei õnnestunud avada
mount-pim-unsupported = Installitud udisksi versioon ei toeta PIM-sätet

## Log out, power off and restart dialog

end-session-log-out-user = Kasutaja { $userName } väljalogimine
end-session-log-out-title = Väljalogimine
end-session-log-out-user-countdown =
    { $seconds ->
        [one] Kasutaja { $userName } logitakse automaatselt välja { $seconds } sekundi pärast
       *[other] Kasutaja { $userName } logitakse automaatselt välja { $seconds } sekundi pärast
    }
end-session-log-out-countdown =
    { $seconds ->
        [one] Sind logitakse automaatselt välja { $seconds } sekundi pärast
       *[other] Sind logitakse automaatselt välja { $seconds } sekundi pärast
    }
end-session-log-out-button = Logi välja
end-session-power-off-title = Väljalülitamine
end-session-power-off-updates-title = Värskenduste installimine ja väljalülitamine
end-session-power-off-countdown =
    { $seconds ->
        [one] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
       *[other] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
    }
end-session-power-off-button = Lülita välja
end-session-restart-title = Taaskäivitamine
end-session-restart-updates-title = Värskenduste installimine ja taaskäivitamine
end-session-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
    }
end-session-restart-button = Taaskäivita
end-session-update-restart-title = Taaskäivitamine ja värskenduste installimine
end-session-update-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
    }
end-session-update-restart-button = Taaskäivita ja installi
end-session-install-updates = Installi ootel tarkvaravärskendused
end-session-install-version = Installi versioon { $version }
end-session-low-battery = Aku tase on madal: enne värskenduste installimist ühenda arvuti vooluvõrku
end-session-busy-apps = Mõni rakendus on hõivatud või sisaldab salvestamata tööd
end-session-other-users = Sisse on logitud teisi kasutajaid
end-session-cancel = Loobu
end-session-boot-options = Käivitusvalikud
end-session-remote-user = { $userName } (kaugühendus)
end-session-console-user = { $userName } (konsool)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vajalik on autentimine
network-agent-wifi-rejected = Võrgu „{ $networkName }“ salvestatud salasõna ei sobinud. Sisesta see uuesti.
network-agent-wifi-secrets = Traadita võrguga „{ $networkName }“ ühendamiseks on vaja salasõnu või krüptovõtmeid
network-agent-wps-hint = Ühenduse saad luua ka ruuteri nupuga „WPS“
network-agent-wired-title = Juhtmega võrgu 802.1X-autentimine
network-agent-dsl-title = DSL-autentimine
network-agent-pin-title = Vajalik on PIN-kood
network-agent-pin-body = Mobiilse lairibaseadme jaoks on vaja PIN-koodi
network-agent-vpn-title = VPN-i salasõna
network-agent-password-required = Ühenduse „{ $networkName }“ loomiseks on vaja salasõna
network-agent-connect = Ühenda
network-agent-cancel = Loobu
network-agent-password = Salasõna
network-agent-username = Kasutajanimi
network-agent-key = Võti
network-agent-private-key-password = Privaatvõtme salasõna
network-agent-identity = Identiteet
network-agent-service = Teenus
network-agent-network-name = Võrgu nimi
network-agent-pin = PIN-kood

## Lock screen clock

lock-clock-swipe-up = Pühi üles
lock-clock-click-or-press = Klõpsa või vajuta mõnda klahvi

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Aknad
ctrl-alt-tab-panel = Tegumiriba
ctrl-alt-tab-unlock = Lukust avamine

## System notifications

messages-system-source = Süsteem
unsafe-mode-title = Süsteem viidi ohtlikku režiimi
unsafe-mode-body = Rakendustel on nüüd piiramatu juurdepääs
unsafe-mode-undo = Võta tagasi
privileged-user-title = Sisse logitud privilegeeritud kasutajana
privileged-user-body = Turvakaalutlustel ei tohiks seanssi privilegeeritud kasutajana käitada. Võimaluse korral logi sisse tavakasutajana.

## On-screen keyboard

osk-keyboard-settings = Klaviatuurisätted
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel peab ekraani lukustama

## Notifications

messages-unknown-app = Tundmatu rakendus
messages-reply = Vasta
messages-reply-placeholder = Kirjuta vastus
messages-reply-send = Saada

## Media player controls

mpris-unknown-artist = Tundmatu esitaja
mpris-unknown-title = Tundmatu pealkiri

## Starting programs

spawn-failed = Käsu „{ $command }“ käivitamine ebaõnnestus:

## Text field context menu

entry-menu-copy = Kopeeri
entry-menu-paste = Kleebi
entry-menu-show-text = Kuva tekst
entry-menu-hide-text = Peida tekst
entry-caps-lock-on = Caps Lock on sees

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Tee kuvatõmmis
title-bar-menu-hide = Peida
title-bar-menu-restore = Taasta
title-bar-menu-maximize = Maksimeeri
title-bar-menu-move = Teisalda
title-bar-menu-resize = Muuda suurust
title-bar-menu-always-on-top = Alati pealmine
title-bar-menu-always-on-visible-workspace = Alati nähtaval tööalal
title-bar-menu-workspace-left = Teisalda vasakpoolsele tööalale
title-bar-menu-workspace-right = Teisalda parempoolsele tööalale
title-bar-menu-workspace-up = Teisalda ülemisele tööalale
title-bar-menu-workspace-down = Teisalda alumisele tööalale
title-bar-menu-monitor-up = Teisalda ülemisele kuvarile
title-bar-menu-monitor-down = Teisalda alumisele kuvarile
title-bar-menu-monitor-left = Teisalda vasakpoolsele kuvarile
title-bar-menu-monitor-right = Teisalda parempoolsele kuvarile
title-bar-menu-close = Sulge

## Screenshots and screen recording

screenshot-source = Ekraanijäädvustus
screenshot-area = Ala valimine
screenshot-screen = Ekraani valimine
screenshot-window = Akna valimine
screenshot-take = Tee kuvatõmmis
screenshot-record = Salvesta ekraanivideo
screenshot-show-pointer = Kuva kursor
screenshot-capture = Jäädvusta
screenshot-close = Sulge
screenshot-screencasts-folder = Ekraanisalvestused
screenshot-screencast-file = Ekraanisalvestus { $date } { $time }
screenshot-screenshots-folder = Kuvatõmmised
screenshot-file = Kuvatõmmis { $timestamp }
screenshot-screencast-recorded = Ekraanisalvestus on valmis
screenshot-screencast-start-failed = Ekraanisalvestust ei õnnestunud alustada
screenshot-screencast-out-of-space = Ekraanisalvestus ebaõnnestus: kettaruum on otsas
screenshot-screencast-try-again = Ekraanisalvestus ebaõnnestus. Proovi uuesti
screenshot-screencast-failed = Ekraanisalvestus ebaõnnestus
screenshot-screencast-view = Klõpsa video vaatamiseks
screenshot-show-in-rover = Kuva rakenduses Rover
screenshot-captured = Kuvatõmmis on tehtud
screenshot-captured-body = Pildi saad kleepida lõikelaualt
rain-title = Vihm
rain-open-menu = Ava vihmamenüü
rain-drizzle = Uduvihm
rain-rain = Vihm
rain-storm = Torm
rain-show = Näita töölaual
rain-sound = Heli
rain-volume = Vihma valjus
rain-settings = Vihma seadistused
