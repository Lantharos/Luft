## Quick settings tiles

auto-rotate-title = Autorotasjon
dark-style-title = Mørk modus
do-not-disturb-title = Ikke forstyrr
night-light-title = Nattlys
airplane-mode-title = Flymodus

## Power mode

power-profile-title = Strømmodus
power-profile-header = Strømmodus
power-profile-open-menu = Åpne menyen for strømmodus
power-profile-settings = Strøminnstillinger
power-profile-performance = Ytelse
power-profile-balanced = Balansert
power-profile-power-saver = Strømsparing
power-profile-custom = Egendefinert

## Keep awake

caffeine-title = Hold våken
caffeine-open-menu = Åpne menyen for Hold våken
caffeine-until = Til { $time }
caffeine-until-turned-off = Til den slås av
caffeine-30-minutes = 30 minutter
caffeine-1-hour = 1 time
caffeine-2-hours = 2 timer
caffeine-inhibit-reason = Holdt våken fra hurtiginnstillingene

## Brightness

brightness-title = Lysstyrke
brightness-open-menu = Åpne menyen for lysstyrke

## Keyboard backlight

backlight-title = Tastaturbelysning
backlight-open-menu = Åpne menyen for tastaturbelysning
backlight-slider = Tastaturbelysning
backlight-off = Av
backlight-low = Lav
backlight-high = Høy

## Sound

volume-sound-settings = Lydinnstillinger
volume-mute = Demp
volume-unmute = Slå på lyd
volume-output-slider = Volum
volume-output-title = Lydutgang
volume-output-open-menu = Åpne menyen for lydutgang
volume-input-slider = Mikrofon
volume-input-title = Lydinngang
volume-input-open-menu = Åpne menyen for lydinngang

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Åpne Bluetooth-menyen
bluetooth-settings = Bluetooth-innstillinger
bluetooth-connect = Koble til
bluetooth-disconnect = Koble fra
bluetooth-connect-device = Koble til { $deviceName }
bluetooth-disconnect-device = Koble fra { $deviceName }
bluetooth-no-devices = Ingen tilgjengelige eller tilkoblede enheter
bluetooth-turn-on-hint = Slå på Bluetooth for å koble til enheter
bluetooth-connected-count = { $count ->
    [one] { $count } tilkoblet
   *[other] { $count } tilkoblet
}

## Network menus in quick settings

network-menu-unknown-network = <ukjent>
network-menu-connect = Koble til
network-menu-disconnect = Koble fra
network-menu-connect-to = Koble til { $name }
network-menu-disconnect-from = Koble fra { $name }
network-menu-turn-off = Slå av
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sikret, signalstyrke { $strength } %
   *[no] { $name }, ikke sikret, signalstyrke { $strength } %
}
network-menu-hotspot = Trådløssone på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } tilkoblet
   *[other] { $count } tilkoblet
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Åpne VPN-menyen
network-menu-vpn-settings = VPN-innstillinger
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Åpne Wi-Fi-menyen
network-menu-wifi-settings = Alle nettverk
network-menu-wired = Kablede tilkoblinger
network-menu-wired-open-menu = Åpne menyen for kablede tilkoblinger
network-menu-wired-settings = Innstillinger for kablet nettverk
network-menu-tethers = Internettdeling via Bluetooth
network-menu-tethers-open-menu = Åpne menyen for internettdeling via Bluetooth
network-menu-tether = Internettdeling
network-menu-tether-settings = Bluetooth-innstillinger
network-menu-mobile-connections = Mobiltilkoblinger
network-menu-mobile-open-menu = Åpne menyen for mobiltilkoblinger
network-menu-mobile-settings = Innstillinger for mobilt bredbånd
network-menu-mobile = Mobil
network-device-wired = Kablet
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logg inn på nettverket
network-menu-failed-title = Tilkoblingen mislyktes
network-menu-failed-body = Kunne ikke aktivere nettverkstilkoblingen

## Location access dialog

location-dialog-title = Tillat tilgang til posisjon
location-dialog-description = Appen { $appName } vil ha tilgang til posisjonen din
location-dialog-info = Du kan når som helst endre tilgangen til posisjon i personverninnstillingene
location-dialog-deny = Avslå tilgang
location-dialog-grant = Gi tilgang

## Thunderbolt notifications

thunderbolt-unknown-title = Ukjent Thunderbolt-enhet
thunderbolt-unknown-body = En ny enhet ble koblet til mens du var borte. Koble den fra og til igjen for å ta den i bruk.
thunderbolt-unauthorized-title = Ikke godkjent Thunderbolt-enhet
thunderbolt-unauthorized-body = En ny enhet ble koblet til og må godkjennes av en administrator
thunderbolt-error-title = Feil ved godkjenning av Thunderbolt-enhet
thunderbolt-error-body = Kunne ikke godkjenne Thunderbolt-enheten: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Avslå
access-dialog-allow = Tillat

## Display change confirmation

display-change-title = Beholde skjerminnstillingene?
display-change-countdown = { $seconds ->
    [one] Endringene tilbakestilles om { $seconds } sekund
   *[other] Endringene tilbakestilles om { $seconds } sekunder
}
display-change-revert = Tilbakestill
display-change-keep = Behold endringene

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = «{ $appName }» svarer ikke
close-dialog-description = Du kan vente litt og se om den fortsetter, eller tvinge appen til å avslutte
close-dialog-force-quit = Tving avslutning
close-dialog-wait = Vent

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Speil
switch-monitor-join = Utvid skjermer
switch-monitor-external-only = Bare ekstern
switch-monitor-built-in-only = Bare innebygd

## Sign-in prompt

auth-prompt-password = Passord
auth-prompt-username = Brukernavn
auth-prompt-back = Tilbake
auth-prompt-submit = Send
auth-prompt-wrong-password = Feil passord
auth-prompt-failed = Det virket ikke. Prøv igjen.
fingerprint-not-recognized = Fingeravtrykket ble ikke gjenkjent

## Drive connected notification

autorun-connected = «{ $driveName }» er koblet til
autorun-ready = Disken kan nå brukes
autorun-open-with = Åpne med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Trege taster er slått på
kbd-a11y-slow-keys-off = Trege taster er slått av
kbd-a11y-slow-keys-description = Du holdt nettopp nede Skift-tasten i 8 sekunder. Det er hurtigtasten for trege taster, som endrer hvordan tastaturet virker.
kbd-a11y-sticky-keys-on = Låsetaster er slått på
kbd-a11y-sticky-keys-off = Låsetaster er slått av
kbd-a11y-sticky-keys-on-description = Du trykket nettopp på Skift-tasten 5 ganger på rad. Det er hurtigtasten for låsetaster, som endrer hvordan tastaturet virker.
kbd-a11y-sticky-keys-off-description = Du trykket nettopp på to taster samtidig, eller på Skift-tasten 5 ganger på rad. Det slår av låsetaster, som endrer hvordan tastaturet virker.
kbd-a11y-leave-on = La være på
kbd-a11y-turn-on = Slå på
kbd-a11y-turn-off = Slå av
kbd-a11y-leave-off = La være av

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Velg lydenhet
audio-device-cancel = Avbryt
audio-device-sound-settings = Lydinnstillinger
audio-device-headphones = Hodetelefoner
audio-device-headset = Hodesett
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillat at hurtigtaster overstyres
inhibit-shortcuts-app = Appen { $appName } vil overstyre systemets hurtigtaster
inhibit-shortcuts-unknown-app = En app vil overstyre systemets hurtigtaster
inhibit-shortcuts-restore = Du kan få hurtigtastene tilbake ved å trykke på { $shortcut }
inhibit-shortcuts-deny = Avslå
inhibit-shortcuts-allow = Tillat

## Administrator authentication

polkit-title = Godkjenning kreves
polkit-administrator = Administrator
polkit-password = Passord
polkit-cancel = Avbryt
polkit-authenticate = Godkjenn
polkit-failed = Det virket ikke. Prøv igjen.

## Unlocking encrypted drives

mount-hidden-volume = Skjult volum
mount-windows-system-volume = Windows-systemvolum
mount-uses-keyfiles = Bruker nøkkelfiler
mount-keyfiles-use-app = Bruk <i>{ $appName }</i> for å låse opp et volum som bruker nøkkelfiler
mount-keyfiles-need-app = Du trenger et eksternt verktøy som <i>Disker</i> for å låse opp et volum som bruker nøkkelfiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM må være et tall eller stå tomt
mount-password = Passord
mount-remember-password = Husk passordet
mount-cancel = Avbryt
mount-unlock = Lås opp
mount-open-app = Åpne { $appName }
mount-wrong-password = Det virket ikke. Prøv igjen.
mount-unlock-failed = Kunne ikke låse opp volumet
mount-pim-unsupported = Den installerte versjonen av udisks støtter ikke PIM-innstillingen

## Log out, power off and restart dialog

end-session-log-out-user = Logg ut { $userName }
end-session-log-out-title = Logg ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } logges ut automatisk om { $seconds } sekund
   *[other] { $userName } logges ut automatisk om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du logges ut automatisk om { $seconds } sekund
   *[other] Du logges ut automatisk om { $seconds } sekunder
}
end-session-log-out-button = Logg ut
end-session-power-off-title = Slå av
end-session-power-off-updates-title = Installer oppdateringer og slå av
end-session-power-off-countdown = { $seconds ->
    [one] Datamaskinen slås av automatisk om { $seconds } sekund
   *[other] Datamaskinen slås av automatisk om { $seconds } sekunder
}
end-session-power-off-button = Slå av
end-session-restart-title = Start på nytt
end-session-restart-updates-title = Installer oppdateringer og start på nytt
end-session-restart-countdown = { $seconds ->
    [one] Datamaskinen starter på nytt automatisk om { $seconds } sekund
   *[other] Datamaskinen starter på nytt automatisk om { $seconds } sekunder
}
end-session-restart-button = Start på nytt
end-session-update-restart-title = Start på nytt og installer oppdateringer
end-session-update-restart-countdown = { $seconds ->
    [one] Datamaskinen starter på nytt og installerer oppdateringer automatisk om { $seconds } sekund
   *[other] Datamaskinen starter på nytt og installerer oppdateringer automatisk om { $seconds } sekunder
}
end-session-update-restart-button = Start på nytt og installer
end-session-install-updates = Installer ventende oppdateringer
end-session-install-version = Installer versjon { $version }
end-session-low-battery = Lavt batterinivå. Koble til strøm før du installerer oppdateringer.
end-session-busy-apps = Noen apper er opptatt eller har ulagret arbeid
end-session-other-users = Andre brukere er logget inn
end-session-cancel = Avbryt
end-session-boot-options = Oppstartsalternativer
end-session-remote-user = { $userName } (eksternt)
end-session-console-user = { $userName } (konsoll)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Godkjenning kreves
network-agent-wifi-rejected = Det lagrede passordet for «{ $networkName }» virket ikke. Skriv det inn på nytt.
network-agent-wifi-secrets = Det trådløse nettverket «{ $networkName }» krever passord eller krypteringsnøkkel
network-agent-wps-hint = Du kan også koble til ved å trykke på WPS-knappen på ruteren
network-agent-wired-title = 802.1X-godkjenning for kablet nettverk
network-agent-dsl-title = DSL-godkjenning
network-agent-pin-title = PIN-kode kreves
network-agent-pin-body = Enheten for mobilt bredbånd trenger en PIN-kode
network-agent-vpn-title = VPN-passord
network-agent-password-required = Det kreves et passord for å koble til «{ $networkName }»
network-agent-connect = Koble til
network-agent-cancel = Avbryt
network-agent-password = Passord
network-agent-username = Brukernavn
network-agent-key = Nøkkel
network-agent-private-key-password = Passord for privat nøkkel
network-agent-identity = Identitet
network-agent-service = Tjeneste
network-agent-network-name = Nettverksnavn
network-agent-pin = PIN-kode

## Lock screen clock

lock-clock-swipe-up = Sveip opp
lock-clock-click-or-press = Klikk eller trykk på en tast

## Notification times

date-just-now = Akkurat nå

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Vinduer
ctrl-alt-tab-panel = Oppgavelinje
ctrl-alt-tab-unlock = Opplåsing

## System notifications

messages-system-source = System
unsafe-mode-title = Systemet er satt i usikker modus
unsafe-mode-body = Apper har nå ubegrenset tilgang
unsafe-mode-undo = Angre
privileged-user-title = Logget inn som privilegert bruker
privileged-user-body = Av sikkerhetshensyn bør du unngå å kjøre en økt som privilegert bruker. Logg inn som vanlig bruker hvis du kan.

## On-screen keyboard

osk-keyboard-settings = Tastaturinnstillinger
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel må låse skjermen

## Notifications

messages-unknown-app = Ukjent app
messages-reply = Svar
messages-reply-placeholder = Skriv et svar
messages-reply-send = Send

## Media player controls

mpris-unknown-artist = Ukjent artist
mpris-unknown-title = Ukjent tittel

## Starting programs

spawn-failed = Kunne ikke kjøre «{ $command }»:

## Text field context menu

entry-menu-copy = Kopier
entry-menu-paste = Lim inn
entry-menu-show-text = Vis tekst
entry-menu-hide-text = Skjul tekst
entry-caps-lock-on = Caps Lock er på

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ta skjermbilde
title-bar-menu-hide = Skjul
title-bar-menu-restore = Gjenopprett
title-bar-menu-maximize = Maksimer
title-bar-menu-move = Flytt
title-bar-menu-resize = Endre størrelse
title-bar-menu-always-on-top = Alltid øverst
title-bar-menu-always-on-visible-workspace = Alltid på synlig arbeidsområde
title-bar-menu-workspace-left = Flytt til arbeidsområdet til venstre
title-bar-menu-workspace-right = Flytt til arbeidsområdet til høyre
title-bar-menu-workspace-up = Flytt til arbeidsområdet over
title-bar-menu-workspace-down = Flytt til arbeidsområdet under
title-bar-menu-monitor-up = Flytt til skjermen over
title-bar-menu-monitor-down = Flytt til skjermen under
title-bar-menu-monitor-left = Flytt til skjermen til venstre
title-bar-menu-monitor-right = Flytt til skjermen til høyre
title-bar-menu-close = Lukk

## Screenshots and screen recording

screenshot-source = Skjermbilder og opptak
screenshot-area = Merk område
screenshot-screen = Hele skjermen
screenshot-window = Vindu
screenshot-take = Ta skjermbilde
screenshot-record = Ta opp skjermen
screenshot-show-pointer = Vis pekeren
screenshot-capture = Ta bilde
screenshot-close = Lukk
screenshot-screencasts-folder = Skjermopptak
screenshot-screencast-file = Skjermopptak { $date } { $time }
screenshot-screenshots-folder = Skjermbilder
screenshot-file = Skjermbilde { $timestamp }
screenshot-screencast-recorded = Skjermopptaket er lagret
screenshot-screencast-start-failed = Kunne ikke starte skjermopptaket
screenshot-screencast-out-of-space = Skjermopptaket mislyktes: Ikke nok diskplass
screenshot-screencast-try-again = Skjermopptaket mislyktes. Prøv igjen.
screenshot-screencast-failed = Skjermopptaket mislyktes
screenshot-screencast-view = Klikk her for å se videoen
screenshot-show-in-rover = Vis i Rover
screenshot-captured = Skjermbilde tatt
screenshot-captured-body = Du kan lime inn bildet fra utklippstavlen
