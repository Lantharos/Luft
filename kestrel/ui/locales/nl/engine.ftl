## Quick settings tiles

auto-rotate-title = Automatisch draaien
dark-style-title = Donkere modus
do-not-disturb-title = Niet storen
night-light-title = Nachtlampje
airplane-mode-title = Vliegtuigmodus

## Power mode

power-profile-title = Energiemodus
power-profile-header = Energiemodus
power-profile-open-menu = Menu energiemodus openen
power-profile-settings = Energie-instellingen
power-profile-performance = Prestaties
power-profile-balanced = Gebalanceerd
power-profile-power-saver = Energiebesparing
power-profile-custom = Aangepast

## Keep awake

caffeine-title = Wakker houden
caffeine-open-menu = Menu wakker houden openen
caffeine-until = Tot { $time }
caffeine-until-turned-off = Tot ik het uitschakel
caffeine-30-minutes = 30 minuten
caffeine-1-hour = 1 uur
caffeine-2-hours = 2 uur
caffeine-inhibit-reason = Wakker gehouden via snelle instellingen

## Brightness

brightness-title = Helderheid
brightness-open-menu = Menu helderheid openen

## Keyboard backlight

backlight-title = Toetsenbordverlichting
backlight-open-menu = Menu toetsenbordhelderheid openen
backlight-slider = Toetsenbordhelderheid
backlight-off = Uit
backlight-low = Laag
backlight-high = Hoog

## Sound

volume-sound-settings = Geluidsinstellingen
volume-mute = Dempen
volume-unmute = Dempen opheffen
volume-output-slider = Volume
volume-output-title = Geluidsuitvoer
volume-output-open-menu = Menu geluidsuitvoer openen
volume-input-slider = Microfoon
volume-input-title = Geluidsinvoer
volume-input-open-menu = Menu geluidsinvoer openen

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Bluetooth-menu openen
bluetooth-settings = Bluetooth-instellingen
bluetooth-connect = Verbinden
bluetooth-disconnect = Verbreken
bluetooth-connect-device = Verbinden met { $deviceName }
bluetooth-disconnect-device = Verbinding met { $deviceName } verbreken
bluetooth-no-devices = Geen beschikbare of verbonden apparaten
bluetooth-turn-on-hint = Schakel Bluetooth in om verbinding te maken met apparaten
bluetooth-connected-count = { $count ->
    [one] { $count } verbonden
   *[other] { $count } verbonden
}

## Network menus in quick settings

network-menu-unknown-network = <onbekend>
network-menu-connect = Verbinden
network-menu-disconnect = Verbreken
network-menu-connect-to = Verbinden met { $name }
network-menu-disconnect-from = Verbinding met { $name } verbreken
network-menu-turn-off = Uitschakelen
network-menu-wifi-network = { $secure ->
    [yes] { $name }, beveiligd, signaalsterkte { $strength }%
   *[no] { $name }, niet beveiligd, signaalsterkte { $strength }%
}
network-menu-hotspot = Hotspot van { $name }
network-menu-connected-count = { $count ->
    [one] { $count } verbonden
   *[other] { $count } verbonden
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = VPN-menu openen
network-menu-vpn-settings = VPN-instellingen
network-menu-wifi = Wifi
network-menu-wifi-open-menu = Wifi-menu openen
network-menu-wifi-settings = Alle netwerken
network-menu-wired = Bekabelde verbindingen
network-menu-wired-open-menu = Menu bekabelde verbindingen openen
network-menu-wired-settings = Instellingen voor bekabeld netwerk
network-menu-tethers = Bluetooth-tethering
network-menu-tethers-open-menu = Menu Bluetooth-tethering openen
network-menu-tether = Tethering
network-menu-tether-settings = Bluetooth-instellingen
network-menu-mobile-connections = Mobiele verbindingen
network-menu-mobile-open-menu = Menu mobiele verbindingen openen
network-menu-mobile-settings = Instellingen voor mobiel breedband
network-menu-mobile = Mobiel
network-device-wired = Bekabeld
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Aanmelden bij netwerk
network-menu-failed-title = Verbinding mislukt
network-menu-failed-body = De netwerkverbinding kon niet worden geactiveerd

## Location access dialog

location-dialog-title = Locatietoegang toestaan
location-dialog-description = De app { $appName } wil toegang tot je locatie
location-dialog-info = Je kunt locatietoegang altijd wijzigen in de privacyinstellingen
location-dialog-deny = Weigeren
location-dialog-grant = Toegang geven

## Thunderbolt notifications

thunderbolt-unknown-title = Onbekend Thunderbolt-apparaat
thunderbolt-unknown-body = Er is een nieuw apparaat aangesloten terwijl je weg was. Koppel het los en sluit het opnieuw aan om het te gebruiken.
thunderbolt-unauthorized-title = Niet-goedgekeurd Thunderbolt-apparaat
thunderbolt-unauthorized-body = Er is een nieuw apparaat aangesloten dat goedkeuring van een beheerder nodig heeft
thunderbolt-error-title = Fout bij goedkeuren van Thunderbolt-apparaat
thunderbolt-error-body = Kan het Thunderbolt-apparaat niet goedkeuren: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Weigeren
access-dialog-allow = Toestaan

## Display change confirmation

display-change-title = Deze beeldinstellingen houden?
display-change-countdown = { $seconds ->
    [one] De wijzigingen worden over { $seconds } seconde teruggedraaid
   *[other] De wijzigingen worden over { $seconds } seconden teruggedraaid
}
display-change-revert = Terugdraaien
display-change-keep = Behouden

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” reageert niet
close-dialog-description = Je kunt even wachten tot de app verdergaat, of de app geforceerd stoppen
close-dialog-force-quit = Geforceerd stoppen
close-dialog-wait = Wachten

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Dupliceren
switch-monitor-join = Uitbreiden
switch-monitor-external-only = Alleen extern
switch-monitor-built-in-only = Alleen intern

## Sign-in prompt

auth-prompt-password = Wachtwoord
auth-prompt-username = Gebruikersnaam
auth-prompt-back = Terug
auth-prompt-submit = Versturen
auth-prompt-wrong-password = Dat wachtwoord werkte niet
auth-prompt-failed = Dat werkte niet. Probeer het opnieuw.
fingerprint-not-recognized = Vingerafdruk niet herkend

## Drive connected notification

autorun-connected = “{ $driveName }” aangesloten
autorun-ready = De schijf kan nu worden gebruikt
autorun-open-with = Openen met { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Langzame toetsen ingeschakeld
kbd-a11y-slow-keys-off = Langzame toetsen uitgeschakeld
kbd-a11y-slow-keys-description = Je hebt de Shift-toets 8 seconden ingedrukt gehouden. Dat is de sneltoets voor Langzame toetsen, een functie die de werking van je toetsenbord verandert.
kbd-a11y-sticky-keys-on = Plaktoetsen ingeschakeld
kbd-a11y-sticky-keys-off = Plaktoetsen uitgeschakeld
kbd-a11y-sticky-keys-on-description = Je hebt 5 keer achter elkaar op de Shift-toets gedrukt. Dat is de sneltoets voor Plaktoetsen, een functie die de werking van je toetsenbord verandert.
kbd-a11y-sticky-keys-off-description = Je hebt twee toetsen tegelijk ingedrukt of 5 keer achter elkaar op de Shift-toets gedrukt. Daarmee schakel je Plaktoetsen uit, een functie die de werking van je toetsenbord verandert.
kbd-a11y-leave-on = Aan laten
kbd-a11y-turn-on = Inschakelen
kbd-a11y-turn-off = Uitschakelen
kbd-a11y-leave-off = Uit laten

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Audioapparaat kiezen
audio-device-cancel = Annuleren
audio-device-sound-settings = Geluidsinstellingen
audio-device-headphones = Koptelefoon
audio-device-headset = Headset
audio-device-microphone = Microfoon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Sneltoetsen laten blokkeren
inhibit-shortcuts-app = De app { $appName } wil de systeemsneltoetsen blokkeren
inhibit-shortcuts-unknown-app = Een app wil de systeemsneltoetsen blokkeren
inhibit-shortcuts-restore = Je kunt de sneltoetsen herstellen door op { $shortcut } te drukken
inhibit-shortcuts-deny = Weigeren
inhibit-shortcuts-allow = Toestaan

## Administrator authentication

polkit-title = Verificatie vereist
polkit-administrator = Beheerder
polkit-password = Wachtwoord
polkit-cancel = Annuleren
polkit-authenticate = Verifiëren
polkit-failed = Dat werkte niet. Probeer het opnieuw.

## Unlocking encrypted drives

mount-hidden-volume = Verborgen volume
mount-windows-system-volume = Windows-systeemvolume
mount-uses-keyfiles = Gebruikt sleutelbestanden
mount-keyfiles-use-app = Gebruik het hulpprogramma <i>{ $appName }</i> om een volume met sleutelbestanden te ontgrendelen
mount-keyfiles-need-app = Je hebt een extern hulpprogramma zoals <i>Schijven</i> nodig om een volume met sleutelbestanden te ontgrendelen
mount-pim-number = PIM-nummer
mount-pim-invalid = De PIM moet een getal zijn of leeg blijven
mount-password = Wachtwoord
mount-remember-password = Wachtwoord onthouden
mount-cancel = Annuleren
mount-unlock = Ontgrendelen
mount-open-app = { $appName } openen
mount-wrong-password = Dat werkte niet. Probeer het opnieuw.
mount-unlock-failed = Kan het volume niet ontgrendelen
mount-pim-unsupported = De geïnstalleerde versie van udisks ondersteunt de PIM-instelling niet

## Log out, power off and restart dialog

end-session-log-out-user = { $userName } afmelden
end-session-log-out-title = Afmelden
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } wordt over { $seconds } seconde automatisch afgemeld
   *[other] { $userName } wordt over { $seconds } seconden automatisch afgemeld
}
end-session-log-out-countdown = { $seconds ->
    [one] Je wordt over { $seconds } seconde automatisch afgemeld
   *[other] Je wordt over { $seconds } seconden automatisch afgemeld
}
end-session-log-out-button = Afmelden
end-session-power-off-title = Afsluiten
end-session-power-off-updates-title = Updates installeren en afsluiten
end-session-power-off-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch afgesloten
   *[other] De computer wordt over { $seconds } seconden automatisch afgesloten
}
end-session-power-off-button = Afsluiten
end-session-restart-title = Opnieuw opstarten
end-session-restart-updates-title = Updates installeren en opnieuw opstarten
end-session-restart-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch opnieuw opgestart
   *[other] De computer wordt over { $seconds } seconden automatisch opnieuw opgestart
}
end-session-restart-button = Opnieuw opstarten
end-session-update-restart-title = Opnieuw opstarten en updates installeren
end-session-update-restart-countdown = { $seconds ->
    [one] De computer wordt over { $seconds } seconde automatisch opnieuw opgestart om updates te installeren
   *[other] De computer wordt over { $seconds } seconden automatisch opnieuw opgestart om updates te installeren
}
end-session-update-restart-button = Opnieuw opstarten en installeren
end-session-install-updates = Openstaande software-updates installeren
end-session-install-version = Versie { $version } installeren
end-session-low-battery = Batterij bijna leeg: sluit de lader aan voordat je updates installeert
end-session-busy-apps = Sommige apps zijn bezig of hebben niet-opgeslagen werk
end-session-other-users = Er zijn andere gebruikers aangemeld
end-session-cancel = Annuleren
end-session-boot-options = Opstartopties
end-session-remote-user = { $userName } (op afstand)
end-session-console-user = { $userName } (console)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Verificatie vereist
network-agent-wifi-rejected = Het opgeslagen wachtwoord voor “{ $networkName }” werkte niet. Voer het opnieuw in.
network-agent-wifi-secrets = Er zijn wachtwoorden of versleutelingssleutels nodig voor het draadloze netwerk “{ $networkName }”
network-agent-wps-hint = Je kunt ook verbinding maken door op de WPS-knop van je router te drukken
network-agent-wired-title = Bekabelde 802.1X-verificatie
network-agent-dsl-title = DSL-verificatie
network-agent-pin-title = Pincode vereist
network-agent-pin-body = Het apparaat voor mobiel breedband heeft een pincode nodig
network-agent-vpn-title = VPN-wachtwoord
network-agent-password-required = Er is een wachtwoord nodig om verbinding te maken met “{ $networkName }”
network-agent-connect = Verbinden
network-agent-cancel = Annuleren
network-agent-password = Wachtwoord
network-agent-username = Gebruikersnaam
network-agent-key = Sleutel
network-agent-private-key-password = Wachtwoord van privésleutel
network-agent-identity = Identiteit
network-agent-service = Service
network-agent-network-name = Netwerknaam
network-agent-pin = Pincode

## Lock screen clock

lock-clock-swipe-up = Veeg omhoog
lock-clock-click-or-press = Klik of druk op een toets

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Vensters
ctrl-alt-tab-panel = Taakbalk
ctrl-alt-tab-unlock = Ontgrendelvenster

## System notifications

messages-system-source = Systeem
unsafe-mode-title = Het systeem staat in de onveilige modus
unsafe-mode-body = Apps hebben nu onbeperkte toegang
unsafe-mode-undo = Ongedaan maken
privileged-user-title = Aangemeld als gebruiker met extra rechten
privileged-user-body = Werk om veiligheidsredenen liever niet in een sessie met extra rechten. Meld je zo mogelijk aan als gewone gebruiker.

## On-screen keyboard

osk-keyboard-settings = Toetsenbordinstellingen
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel moet het scherm vergrendelen

## Notifications

messages-unknown-app = Onbekende app
messages-reply = Beantwoorden
messages-reply-placeholder = Schrijf een antwoord
messages-reply-send = Versturen

## Media player controls

mpris-unknown-artist = Onbekende artiest
mpris-unknown-title = Onbekende titel

## Starting programs

spawn-failed = Uitvoeren van “{ $command }” mislukt:

## Text field context menu

entry-menu-copy = Kopiëren
entry-menu-paste = Plakken
entry-menu-show-text = Tekst tonen
entry-menu-hide-text = Tekst verbergen
entry-caps-lock-on = Caps Lock staat aan

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Schermafbeelding maken
title-bar-menu-hide = Minimaliseren
title-bar-menu-restore = Vorige grootte
title-bar-menu-maximize = Maximaliseren
title-bar-menu-move = Verplaatsen
title-bar-menu-resize = Formaat wijzigen
title-bar-menu-always-on-top = Altijd bovenop
title-bar-menu-always-on-visible-workspace = Altijd op zichtbaar werkblad
title-bar-menu-workspace-left = Naar werkblad links verplaatsen
title-bar-menu-workspace-right = Naar werkblad rechts verplaatsen
title-bar-menu-workspace-up = Naar werkblad erboven verplaatsen
title-bar-menu-workspace-down = Naar werkblad eronder verplaatsen
title-bar-menu-monitor-up = Naar beeldscherm erboven verplaatsen
title-bar-menu-monitor-down = Naar beeldscherm eronder verplaatsen
title-bar-menu-monitor-left = Naar beeldscherm links verplaatsen
title-bar-menu-monitor-right = Naar beeldscherm rechts verplaatsen
title-bar-menu-close = Sluiten

## Screenshots and screen recording

screenshot-source = Schermopname
screenshot-area = Gebied selecteren
screenshot-screen = Scherm selecteren
screenshot-window = Venster selecteren
screenshot-take = Schermafbeelding maken
screenshot-record = Scherm opnemen
screenshot-show-pointer = Aanwijzer tonen
screenshot-capture = Vastleggen
screenshot-close = Sluiten
screenshot-screencasts-folder = Schermopnamen
screenshot-screencast-file = Schermopname van { $date } { $time }
screenshot-screenshots-folder = Schermafbeeldingen
screenshot-file = Schermafbeelding van { $timestamp }
screenshot-screencast-recorded = Schermopname gemaakt
screenshot-screencast-start-failed = Schermopname kon niet starten
screenshot-screencast-out-of-space = Schermopname mislukt: schijf is vol
screenshot-screencast-try-again = Schermopname mislukt, probeer het opnieuw
screenshot-screencast-failed = Schermopname mislukt
screenshot-screencast-view = Klik hier om de video te bekijken
screenshot-show-in-rover = Tonen in Rover
screenshot-captured = Schermafbeelding gemaakt
screenshot-captured-body = Je kunt de afbeelding plakken vanaf het klembord
