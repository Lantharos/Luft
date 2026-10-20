## Quick settings tiles

auto-rotate-title = Autorotation
dark-style-title = Mørk tilstand
do-not-disturb-title = Forstyr ikke
night-light-title = Natlys
airplane-mode-title = Flytilstand

## Power mode

power-profile-title = Strømtilstand
power-profile-header = Strømtilstand
power-profile-open-menu = Åbn menuen for strømtilstand
power-profile-settings = Strømindstillinger
power-profile-performance = Ydeevne
power-profile-balanced = Balanceret
power-profile-power-saver = Strømbesparelse
power-profile-custom = Brugerdefineret

## Keep awake

caffeine-title = Hold vågen
caffeine-open-menu = Åbn menuen for Hold vågen
caffeine-until = Indtil { $time }
caffeine-until-turned-off = Indtil det slås fra
caffeine-30-minutes = 30 minutter
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timer
caffeine-inhibit-reason = Holdt vågen fra de hurtige indstillinger

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Åbn menuen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturbelysning
backlight-open-menu = Åbn menuen for tastaturets lysstyrke
backlight-slider = Tastaturets lysstyrke
backlight-off = Fra
backlight-low = Lav
backlight-high = Høj

## Sound

volume-sound-settings = Lydindstillinger
volume-mute = Slå lyden fra
volume-unmute = Slå lyden til
volume-output-slider = Lydstyrke
volume-output-title = Lydudgang
volume-output-open-menu = Åbn menuen for lydudgang
volume-input-slider = Mikrofon
volume-input-title = Lydindgang
volume-input-open-menu = Åbn menuen for lydindgang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Åbn Bluetooth-menuen
bluetooth-settings = Bluetooth-indstillinger
bluetooth-connect = Opret forbindelse
bluetooth-disconnect = Afbryd
bluetooth-connect-device = Opret forbindelse til { $deviceName }
bluetooth-disconnect-device = Afbryd { $deviceName }
bluetooth-no-devices = Ingen tilgængelige eller tilsluttede enheder
bluetooth-turn-on-hint = Slå Bluetooth til for at oprette forbindelse til enheder
bluetooth-connected-count = { $count ->
    [one] { $count } forbundet
   *[other] { $count } forbundet
}

## Network menus in quick settings

network-menu-unknown-network = <ukendt>
network-menu-connect = Opret forbindelse
network-menu-disconnect = Afbryd
network-menu-connect-to = Opret forbindelse til { $name }
network-menu-disconnect-from = Afbryd { $name }
network-menu-turn-off = Slå fra
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikret, signalstyrke { $strength } %
   *[no] { $name }, ikke sikret, signalstyrke { $strength } %
}
network-menu-hotspot = Hotspot på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } forbundet
   *[other] { $count } forbundet
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Åbn VPN-menuen
network-menu-vpn-settings = VPN-indstillinger
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Åbn Wi-Fi-menuen
network-menu-wifi-settings = Alle netværk
network-menu-wired = Kablede forbindelser
network-menu-wired-open-menu = Åbn menuen for kablede forbindelser
network-menu-wired-settings = Indstillinger for kablet netværk
network-menu-tethers = Bluetooth-tethering
network-menu-tethers-open-menu = Åbn menuen for Bluetooth-tethering
network-menu-tether = Tethering
network-menu-tether-settings = Bluetooth-indstillinger
network-menu-mobile-connections = Mobilforbindelser
network-menu-mobile-open-menu = Åbn menuen for mobilforbindelser
network-menu-mobile-settings = Indstillinger for mobilt bredbånd
network-menu-mobile = Mobil
network-device-wired = Kablet
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Log ind på netværket
network-menu-failed-title = Forbindelsen mislykkedes
network-menu-failed-body = Netværksforbindelsen kunne ikke aktiveres

## Location access dialog

location-dialog-title = Tillad adgang til placering
location-dialog-description = Appen { $appName } vil have adgang til din placering
location-dialog-info = Du kan altid ændre adgangen til din placering i indstillingerne for privatliv
location-dialog-deny = Afvis adgang
location-dialog-grant = Giv adgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukendt Thunderbolt-enhed
thunderbolt-unknown-body = En ny enhed blev tilsluttet, mens du var væk. Tag den ud, og sæt den i igen for at bruge den.
thunderbolt-unauthorized-title = Ikke-godkendt Thunderbolt-enhed
thunderbolt-unauthorized-body = En ny enhed blev tilsluttet og skal godkendes af en administrator
thunderbolt-error-title = Thunderbolt-enheden kunne ikke godkendes
thunderbolt-error-body = Thunderbolt-enheden kunne ikke godkendes: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Afvis
access-dialog-allow = Tillad

## Display change confirmation

display-change-title = Behold skærmindstillingerne?
display-change-countdown = { $seconds ->
    [one] Ændringerne fortrydes om { $seconds } sekund
   *[other] Ændringerne fortrydes om { $seconds } sekunder
}
display-change-revert = Fortryd
display-change-keep = Behold ændringer

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = »{ $appName }« svarer ikke
close-dialog-description = Du kan vente lidt på, at appen fortsætter, eller tvinge den til at afslutte
close-dialog-force-quit = Tving til at afslutte
close-dialog-wait = Vent

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Spejl
switch-monitor-join = Udvid
switch-monitor-external-only = Kun eksterne
switch-monitor-built-in-only = Kun indbygget

## Sign-in prompt

auth-prompt-password = Adgangskode
auth-prompt-username = Brugernavn
auth-prompt-back = Tilbage
auth-prompt-submit = Send
auth-prompt-wrong-password = Adgangskoden virkede ikke
auth-prompt-failed = Det virkede ikke. Prøv igen.
fingerprint-not-recognized = Fingeraftrykket blev ikke genkendt

## Drive connected notification

autorun-connected = »{ $driveName }« er tilsluttet
autorun-ready = Disken kan nu bruges
autorun-open-with = Åbn med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Langsomme taster er slået til
kbd-a11y-slow-keys-off = Langsomme taster er slået fra
kbd-a11y-slow-keys-description = Du har lige holdt Skift nede i 8 sekunder. Det er genvejen til Langsomme taster, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-sticky-keys-on = Klæbende taster er slået til
kbd-a11y-sticky-keys-off = Klæbende taster er slået fra
kbd-a11y-sticky-keys-on-description = Du har lige trykket på Skift 5 gange i træk. Det er genvejen til Klæbende taster, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-sticky-keys-off-description = Du har lige trykket på to taster på én gang eller på Skift 5 gange i træk. Det slår Klæbende taster fra, som ændrer, hvordan dit tastatur fungerer.
kbd-a11y-leave-on = Lad være slået til
kbd-a11y-turn-on = Slå til
kbd-a11y-turn-off = Slå fra
kbd-a11y-leave-off = Lad være slået fra

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vælg lydenhed
audio-device-cancel = Annuller
audio-device-sound-settings = Lydindstillinger
audio-device-headphones = Hovedtelefoner
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillad overtagelse af genveje
inhibit-shortcuts-app = Appen { $appName } vil overtage systemets tastaturgenveje
inhibit-shortcuts-unknown-app = En app vil overtage systemets tastaturgenveje
inhibit-shortcuts-restore = Du kan få genvejene tilbage ved at trykke på { $shortcut }
inhibit-shortcuts-deny = Afvis
inhibit-shortcuts-allow = Tillad

## Administrator authentication

polkit-title = Godkendelse påkrævet
polkit-administrator = Administrator
polkit-password = Adgangskode
polkit-cancel = Annuller
polkit-authenticate = Godkend
polkit-failed = Det virkede ikke. Prøv igen.

## Unlocking encrypted drives

mount-hidden-volume = Skjult diskenhed
mount-windows-system-volume = Windows-systemdiskenhed
mount-uses-keyfiles = Bruger nøglefiler
mount-keyfiles-use-app = Brug <i>{ $appName }</i> til at låse en diskenhed op, der bruger nøglefiler
mount-keyfiles-need-app = Du skal bruge et eksternt værktøj som <i>Diske</i> for at låse en diskenhed op, der bruger nøglefiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM skal være et tal eller tomt
mount-password = Adgangskode
mount-remember-password = Husk adgangskode
mount-cancel = Annuller
mount-unlock = Lås op
mount-open-app = Åbn { $appName }
mount-wrong-password = Det virkede ikke. Prøv igen.
mount-unlock-failed = Diskenheden kunne ikke låses op
mount-pim-unsupported = Den installerede version af udisks understøtter ikke PIM-indstillingen

## Log out, power off and restart dialog

end-session-log-out-user = Log { $userName } ud
end-session-log-out-title = Log ud
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } logges automatisk ud om { $seconds } sekund
   *[other] { $userName } logges automatisk ud om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du logges automatisk ud om { $seconds } sekund
   *[other] Du logges automatisk ud om { $seconds } sekunder
}
end-session-log-out-button = Log ud
end-session-power-off-title = Sluk
end-session-power-off-updates-title = Installer opdateringer og sluk
end-session-power-off-countdown = { $seconds ->
    [one] Computeren slukker automatisk om { $seconds } sekund
   *[other] Computeren slukker automatisk om { $seconds } sekunder
}
end-session-power-off-button = Sluk
end-session-restart-title = Genstart
end-session-restart-updates-title = Installer opdateringer og genstart
end-session-restart-countdown = { $seconds ->
    [one] Computeren genstarter automatisk om { $seconds } sekund
   *[other] Computeren genstarter automatisk om { $seconds } sekunder
}
end-session-restart-button = Genstart
end-session-update-restart-title = Genstart og installer opdateringer
end-session-update-restart-countdown = { $seconds ->
    [one] Computeren genstarter automatisk og installerer opdateringer om { $seconds } sekund
   *[other] Computeren genstarter automatisk og installerer opdateringer om { $seconds } sekunder
}
end-session-update-restart-button = Genstart og installer
end-session-install-updates = Installer ventende softwareopdateringer
end-session-install-version = Installer version { $version }
end-session-low-battery = Lavt batteriniveau: Tilslut strøm, før du installerer opdateringer
end-session-busy-apps = Nogle apps er optaget eller har arbejde, der ikke er gemt
end-session-other-users = Andre brugere er logget ind
end-session-cancel = Annuller
end-session-boot-options = Opstartsindstillinger
end-session-remote-user = { $userName } (ekstern)
end-session-console-user = { $userName } (konsol)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkendelse påkrævet
network-agent-wifi-rejected = Den gemte adgangskode til »{ $networkName }« virkede ikke. Indtast den igen.
network-agent-wifi-secrets = Der kræves adgangskoder eller krypteringsnøgler for at få adgang til det trådløse netværk »{ $networkName }«
network-agent-wps-hint = Du kan også oprette forbindelse ved at trykke på WPS-knappen på din router
network-agent-wired-title = Kablet 802.1X-godkendelse
network-agent-dsl-title = DSL-godkendelse
network-agent-pin-title = Pinkode påkrævet
network-agent-pin-body = Enheden til mobilt bredbånd kræver en pinkode
network-agent-vpn-title = VPN-adgangskode
network-agent-password-required = Der kræves en adgangskode for at oprette forbindelse til »{ $networkName }«
network-agent-connect = Opret forbindelse
network-agent-cancel = Annuller
network-agent-password = Adgangskode
network-agent-username = Brugernavn
network-agent-key = Nøgle
network-agent-private-key-password = Adgangskode til privat nøgle
network-agent-identity = Identitet
network-agent-service = Tjeneste
network-agent-network-name = Netværksnavn
network-agent-pin = Pinkode

## Lock screen clock

lock-clock-swipe-up = Stryg opad
lock-clock-click-or-press = Klik, eller tryk på en tast

## Notification times

date-just-now = Lige nu

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Vinduer
ctrl-alt-tab-panel = Proceslinje
ctrl-alt-tab-unlock = Oplåsning

## System notifications

messages-system-source = System
unsafe-mode-title = Systemet er sat i usikker tilstand
unsafe-mode-body = Apps har nu ubegrænset adgang
unsafe-mode-undo = Fortryd
privileged-user-title = Logget ind som privilegeret bruger
privileged-user-body = Af sikkerhedshensyn bør du undgå at køre en session som privilegeret bruger. Log om muligt ind som almindelig bruger.

## On-screen keyboard

osk-keyboard-settings = Tastaturindstillinger
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel skal låse skærmen

## Notifications

messages-unknown-app = Ukendt app
messages-reply = Svar
messages-reply-placeholder = Skriv et svar
messages-reply-send = Send

## Media player controls

mpris-unknown-artist = Ukendt kunstner
mpris-unknown-title = Ukendt titel

## Starting programs

spawn-failed = »{ $command }« kunne ikke køres:

## Text field context menu

entry-menu-copy = Kopier
entry-menu-paste = Sæt ind
entry-menu-show-text = Vis tekst
entry-menu-hide-text = Skjul tekst
entry-caps-lock-on = Caps Lock er slået til

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Tag skærmbillede
title-bar-menu-hide = Skjul
title-bar-menu-restore = Gendan
title-bar-menu-maximize = Maksimer
title-bar-menu-move = Flyt
title-bar-menu-resize = Tilpas størrelse
title-bar-menu-always-on-top = Altid øverst
title-bar-menu-always-on-visible-workspace = Altid på det synlige arbejdsområde
title-bar-menu-workspace-left = Flyt til arbejdsområdet til venstre
title-bar-menu-workspace-right = Flyt til arbejdsområdet til højre
title-bar-menu-workspace-up = Flyt til arbejdsområdet ovenover
title-bar-menu-workspace-down = Flyt til arbejdsområdet nedenunder
title-bar-menu-monitor-up = Flyt til skærmen ovenover
title-bar-menu-monitor-down = Flyt til skærmen nedenunder
title-bar-menu-monitor-left = Flyt til skærmen til venstre
title-bar-menu-monitor-right = Flyt til skærmen til højre
title-bar-menu-close = Luk

## Screenshots and screen recording

screenshot-source = Skærmbilleder
screenshot-area = Vælg område
screenshot-screen = Vælg skærm
screenshot-window = Vælg vindue
screenshot-take = Tag skærmbillede
screenshot-record = Optag skærmen
screenshot-show-pointer = Vis markør
screenshot-capture = Tag
screenshot-close = Luk
screenshot-screencasts-folder = Skærmoptagelser
screenshot-screencast-file = Skærmoptagelse fra { $date } { $time }
screenshot-screenshots-folder = Skærmbilleder
screenshot-file = Skærmbillede fra { $timestamp }
screenshot-screencast-recorded = Skærmoptagelse gemt
screenshot-screencast-start-failed = Skærmoptagelsen kunne ikke starte
screenshot-screencast-out-of-space = Skærmoptagelsen mislykkedes: Der er ikke mere plads på disken
screenshot-screencast-try-again = Skærmoptagelsen mislykkedes. Prøv igen.
screenshot-screencast-failed = Skærmoptagelsen mislykkedes
screenshot-screencast-view = Klik her for at se videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skærmbillede taget
screenshot-captured-body = Du kan indsætte billedet fra udklipsholderen
