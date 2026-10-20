## Quick settings tiles

auto-rotate-title = Autorotering
dark-style-title = Mørk modus
do-not-disturb-title = Ikkje forstyrr
night-light-title = Nattlys
airplane-mode-title = Flymodus

## Power mode

power-profile-title = Straummodus
power-profile-header = Straummodus
power-profile-open-menu = Opne menyen for straummodus
power-profile-settings = Strauminnstillingar
power-profile-performance = Yting
power-profile-balanced = Balansert
power-profile-power-saver = Straumsparing
power-profile-custom = Tilpassa

## Keep awake

caffeine-title = Hald vaken
caffeine-open-menu = Opne menyen for Hald vaken
caffeine-until = Til { $time }
caffeine-until-turned-off = Til du slår det av
caffeine-30-minutes = 30 minutt
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timar
caffeine-inhibit-reason = Halden vaken frå hurtiginnstillingane

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Opne menyen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturlys
backlight-open-menu = Opne menyen for tastaturlys
backlight-slider = Lysstyrke på tastaturet
backlight-off = Av
backlight-low = Låg
backlight-high = Høg

## Sound

volume-sound-settings = Lydinnstillingar
volume-mute = Slå av lyden
volume-unmute = Slå på lyden
volume-output-slider = Lydstyrke
volume-output-title = Lydutgang
volume-output-open-menu = Opne menyen for lydutgang
volume-input-slider = Mikrofon
volume-input-title = Lydinngang
volume-input-open-menu = Opne menyen for lydinngang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Opne Bluetooth-menyen
bluetooth-settings = Bluetooth-innstillingar
bluetooth-connect = Kople til
bluetooth-disconnect = Kople frå
bluetooth-connect-device = Kople til { $deviceName }
bluetooth-disconnect-device = Kople frå { $deviceName }
bluetooth-no-devices = Ingen tilgjengelege eller tilkopla einingar
bluetooth-turn-on-hint = Slå på Bluetooth for å kople til einingar
bluetooth-connected-count = { $count ->
    [one] { $count } tilkopla
   *[other] { $count } tilkopla
}

## Network menus in quick settings

network-menu-unknown-network = <ukjend>
network-menu-connect = Kople til
network-menu-disconnect = Kople frå
network-menu-connect-to = Kople til { $name }
network-menu-disconnect-from = Kople frå { $name }
network-menu-turn-off = Slå av
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikra, signalstyrke { $strength } %
   *[no] { $name }, ikkje sikra, signalstyrke { $strength } %
}
network-menu-hotspot = Tilgangspunkt på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } tilkopla
   *[other] { $count } tilkopla
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Opne VPN-menyen
network-menu-vpn-settings = VPN-innstillingar
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Opne Wi-Fi-menyen
network-menu-wifi-settings = Alle nettverk
network-menu-wired = Kabeltilkoplingar
network-menu-wired-open-menu = Opne menyen for kabeltilkoplingar
network-menu-wired-settings = Innstillingar for kabelnett
network-menu-tethers = Deling over Bluetooth
network-menu-tethers-open-menu = Opne menyen for deling over Bluetooth
network-menu-tether = Deling
network-menu-tether-settings = Bluetooth-innstillingar
network-menu-mobile-connections = Mobiltilkoplingar
network-menu-mobile-open-menu = Opne menyen for mobiltilkoplingar
network-menu-mobile-settings = Innstillingar for mobilt breiband
network-menu-mobile = Mobilnett
network-menu-sign-in = Logg inn på nettverket
network-menu-failed-title = Tilkoplinga mislukkast
network-menu-failed-body = Kunne ikkje aktivere nettverkstilkoplinga

## Location access dialog

location-dialog-title = Tillat tilgang til posisjonen
location-dialog-description = Appen { $appName } vil ha tilgang til posisjonen din
location-dialog-info = Du kan endre tilgangen til posisjonen når som helst i personverninnstillingane
location-dialog-deny = Nekt tilgang
location-dialog-grant = Gje tilgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukjend Thunderbolt-eining
thunderbolt-unknown-body = Ei ny eining vart kopla til medan du var borte. Kople eininga frå og til igjen for å ta ho i bruk.
thunderbolt-unauthorized-title = Thunderbolt-eining utan godkjenning
thunderbolt-unauthorized-body = Ei ny eining vart kopla til og må godkjennast av ein administrator
thunderbolt-error-title = Feil ved godkjenning av Thunderbolt-eining
thunderbolt-error-body = Kunne ikkje godkjenne Thunderbolt-eininga: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Nekt
access-dialog-allow = Tillat

## Display change confirmation

display-change-title = Behalde skjerminnstillingane?
display-change-countdown = { $seconds ->
    [one] Endringane blir tilbakestilte om { $seconds } sekund
   *[other] Endringane blir tilbakestilte om { $seconds } sekund
}
display-change-revert = Tilbakestill
display-change-keep = Behald endringane

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = «{ $appName }» svarer ikkje
close-dialog-description = Du kan vente litt og sjå om appen held fram, eller tvinge han til å avslutte.
close-dialog-force-quit = Tving avslutting
close-dialog-wait = Vent

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Spegl
switch-monitor-join = Utvid
switch-monitor-external-only = Berre eksterne
switch-monitor-built-in-only = Berre innebygd

## Sign-in prompt

auth-prompt-password = Passord
auth-prompt-username = Brukarnamn
auth-prompt-back = Tilbake
auth-prompt-submit = Send
auth-prompt-wrong-password = Passordet fungerte ikkje
auth-prompt-failed = Det fungerte ikkje. Prøv igjen.
fingerprint-not-recognized = Fingeravtrykket vart ikkje kjent att

## Drive connected notification

autorun-connected = «{ $driveName }» er kopla til
autorun-ready = Disken kan no brukast
autorun-open-with = Opne med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Trege tastar er slått på
kbd-a11y-slow-keys-off = Trege tastar er slått av
kbd-a11y-slow-keys-description = Du heldt nettopp Skift-tasten nede i 8 sekund. Det er snarvegen for Trege tastar, som endrar korleis tastaturet verkar.
kbd-a11y-sticky-keys-on = Klebrige tastar er slått på
kbd-a11y-sticky-keys-off = Klebrige tastar er slått av
kbd-a11y-sticky-keys-on-description = Du trykte nettopp på Skift-tasten 5 gonger på rad. Det er snarvegen for Klebrige tastar, som endrar korleis tastaturet verkar.
kbd-a11y-sticky-keys-off-description = Du trykte nettopp på to tastar samtidig, eller på Skift-tasten 5 gonger på rad. Det slår av Klebrige tastar, som endrar korleis tastaturet verkar.
kbd-a11y-leave-on = La vere på
kbd-a11y-turn-on = Slå på
kbd-a11y-turn-off = Slå av
kbd-a11y-leave-off = La vere av

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vel lydeining
audio-device-cancel = Avbryt
audio-device-sound-settings = Lydinnstillingar
audio-device-headphones = Hovudtelefonar
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillat å blokkere snarvegar
inhibit-shortcuts-app = Appen { $appName } vil blokkere snarvegar
inhibit-shortcuts-unknown-app = Ein app vil blokkere snarvegar
inhibit-shortcuts-restore = Du kan få snarvegane tilbake ved å trykkje { $shortcut }
inhibit-shortcuts-deny = Nekt
inhibit-shortcuts-allow = Tillat

## Administrator authentication

polkit-title = Godkjenning krevst
polkit-administrator = Administrator
polkit-password = Passord
polkit-cancel = Avbryt
polkit-authenticate = Godkjenn
polkit-failed = Det fungerte ikkje. Prøv igjen.

## Unlocking encrypted drives

mount-hidden-volume = Gøymt volum
mount-windows-system-volume = Windows-systemvolum
mount-uses-keyfiles = Brukar nøkkelfiler
mount-keyfiles-use-app = Bruk <i>{ $appName }</i> for å låse opp eit volum som brukar nøkkelfiler
mount-keyfiles-need-app = Du treng eit eige verktøy som <i>Diskar</i> for å låse opp eit volum som brukar nøkkelfiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM må vere eit tal eller stå tomt
mount-password = Passord
mount-remember-password = Hugs passordet
mount-cancel = Avbryt
mount-unlock = Lås opp
mount-open-app = Opne { $appName }
mount-wrong-password = Det fungerte ikkje. Prøv igjen.
mount-unlock-failed = Kunne ikkje låse opp volumet
mount-pim-unsupported = Den installerte versjonen av udisks støttar ikkje PIM-innstillinga

## Log out, power off and restart dialog

end-session-log-out-user = Logg ut { $userName }
end-session-log-out-title = Logg ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } blir logga ut automatisk om { $seconds } sekund
   *[other] { $userName } blir logga ut automatisk om { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Du blir logga ut automatisk om { $seconds } sekund
   *[other] Du blir logga ut automatisk om { $seconds } sekund
}
end-session-log-out-button = Logg ut
end-session-power-off-title = Slå av
end-session-power-off-updates-title = Installer oppdateringar og slå av
end-session-power-off-countdown = { $seconds ->
    [one] Systemet blir slått av automatisk om { $seconds } sekund
   *[other] Systemet blir slått av automatisk om { $seconds } sekund
}
end-session-power-off-button = Slå av
end-session-restart-title = Start på nytt
end-session-restart-updates-title = Installer oppdateringar og start på nytt
end-session-restart-countdown = { $seconds ->
    [one] Systemet startar på nytt automatisk om { $seconds } sekund
   *[other] Systemet startar på nytt automatisk om { $seconds } sekund
}
end-session-restart-button = Start på nytt
end-session-update-restart-title = Start på nytt og installer oppdateringar
end-session-update-restart-countdown = { $seconds ->
    [one] Systemet startar automatisk på nytt og installerer oppdateringar om { $seconds } sekund
   *[other] Systemet startar automatisk på nytt og installerer oppdateringar om { $seconds } sekund
}
end-session-update-restart-button = Start på nytt og installer
end-session-install-updates = Installer ventande programvareoppdateringar
end-session-install-version = Installer versjon { $version }
end-session-low-battery = Lite straum på batteriet: kople til straum før du installerer oppdateringar
end-session-busy-apps = Nokre appar er opptekne eller har ulagra arbeid
end-session-other-users = Andre brukarar er logga inn
end-session-cancel = Avbryt
end-session-boot-options = Oppstartsval
end-session-remote-user = { $userName } (eksternt)
end-session-console-user = { $userName } (konsoll)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkjenning krevst
network-agent-wifi-rejected = Det lagra passordet for «{ $networkName }» fungerte ikkje. Skriv det inn igjen.
network-agent-wifi-secrets = Du treng passord eller krypteringsnøklar for å kople til det trådlause nettverket «{ $networkName }»
network-agent-wps-hint = Du kan òg kople til ved å trykkje på WPS-knappen på ruteren
network-agent-wired-title = 802.1X-godkjenning for kabelnett
network-agent-dsl-title = DSL-godkjenning
network-agent-pin-title = PIN-kode krevst
network-agent-pin-body = Eininga for mobilt breiband treng ein PIN-kode
network-agent-vpn-title = VPN-passord
network-agent-password-required = Du treng eit passord for å kople til «{ $networkName }»
network-agent-connect = Kople til
network-agent-cancel = Avbryt
network-agent-password = Passord
network-agent-username = Brukarnamn
network-agent-key = Nøkkel
network-agent-private-key-password = Passord for privat nøkkel
network-agent-identity = Identitet
network-agent-service = Teneste
network-agent-network-name = Nettverksnamn
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Sveip opp
lock-clock-click-or-press = Klikk eller trykk på ein tast

## Notification times

date-just-now = Akkurat no

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Vindauge
ctrl-alt-tab-panel = Oppgåvelinje
ctrl-alt-tab-unlock = Opplåsingsvindauge

## System notifications

messages-system-source = System
unsafe-mode-title = Systemet er sett i usikker modus
unsafe-mode-body = Appar har no full tilgang
unsafe-mode-undo = Angre
privileged-user-title = Logga inn som privilegert brukar
privileged-user-body = Av omsyn til tryggleiken bør du ikkje køyre ei økt som privilegert brukar. Logg heller inn som vanleg brukar om du kan.

## On-screen keyboard

osk-keyboard-settings = Tastaturinnstillingar
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel må låse skjermen

## Notifications

messages-unknown-app = Ukjend app
messages-reply = Svar
messages-reply-placeholder = Skriv eit svar
messages-reply-send = Send

## Media player controls

mpris-unknown-artist = Ukjend artist
mpris-unknown-title = Ukjend tittel

## Starting programs

spawn-failed = Kunne ikkje køyre «{ $command }»:

## Text field context menu

entry-menu-copy = Kopier
entry-menu-paste = Lim inn
entry-menu-show-text = Vis teksten
entry-menu-hide-text = Gøym teksten
entry-caps-lock-on = Caps Lock er på

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ta skjermbilete
title-bar-menu-hide = Gøym
title-bar-menu-restore = Gjenopprett
title-bar-menu-maximize = Maksimer
title-bar-menu-move = Flytt
title-bar-menu-resize = Endre storleik
title-bar-menu-always-on-top = Alltid øvst
title-bar-menu-always-on-visible-workspace = Alltid på synleg arbeidsområde
title-bar-menu-workspace-left = Flytt til arbeidsområdet til venstre
title-bar-menu-workspace-right = Flytt til arbeidsområdet til høgre
title-bar-menu-workspace-up = Flytt til arbeidsområdet over
title-bar-menu-workspace-down = Flytt til arbeidsområdet under
title-bar-menu-monitor-up = Flytt til skjermen over
title-bar-menu-monitor-down = Flytt til skjermen under
title-bar-menu-monitor-left = Flytt til skjermen til venstre
title-bar-menu-monitor-right = Flytt til skjermen til høgre
title-bar-menu-close = Lukk

## Screenshots and screen recording

screenshot-source = Skjermfangst
screenshot-area = Vel område
screenshot-screen = Vel skjerm
screenshot-window = Vel vindauge
screenshot-take = Ta skjermbilete
screenshot-record = Ta opp skjermen
screenshot-show-pointer = Vis peikaren
screenshot-capture = Ta bilete
screenshot-close = Lukk
screenshot-screencasts-folder = Skjermopptak
screenshot-screencast-file = Skjermopptak frå { $date } { $time }
screenshot-screenshots-folder = Skjermbilete
screenshot-file = Skjermbilete frå { $timestamp }
screenshot-screencast-recorded = Skjermopptaket er lagra
screenshot-screencast-start-failed = Skjermopptaket kunne ikkje starte
screenshot-screencast-out-of-space = Skjermopptaket stoppa: Disken er full
screenshot-screencast-try-again = Skjermopptaket mislukkast. Prøv igjen.
screenshot-screencast-failed = Skjermopptaket mislukkast
screenshot-screencast-view = Klikk her for å sjå videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skjermbilete teke
screenshot-captured-body = Du kan lime inn biletet frå utklippstavla
