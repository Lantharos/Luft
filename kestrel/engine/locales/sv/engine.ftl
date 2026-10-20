## Quick settings tiles

auto-rotate-title = Rotera automatiskt
dark-style-title = Mörkt läge
do-not-disturb-title = Stör ej
night-light-title = Nattljus
airplane-mode-title = Flygplansläge

## Power mode

power-profile-title = Energiläge
power-profile-header = Energiläge
power-profile-open-menu = Öppna menyn för energilägen
power-profile-settings = Energiinställningar
power-profile-performance = Prestanda
power-profile-balanced = Balanserat
power-profile-power-saver = Energisparläge
power-profile-custom = Anpassat

## Keep awake

caffeine-title = Håll vaken
caffeine-open-menu = Öppna menyn för Håll vaken
caffeine-until = Till { $time }
caffeine-until-turned-off = Tills den stängs av
caffeine-30-minutes = 30 minuter
caffeine-1-hour = 1 timme
caffeine-2-hours = 2 timmar
caffeine-inhibit-reason = Hålls vaken från snabbinställningarna

## Brightness

brightness-title = Ljusstyrka
brightness-open-menu = Öppna menyn för ljusstyrka

## Keyboard backlight

backlight-title = Tangentbordsbelysning
backlight-open-menu = Öppna menyn för tangentbordets ljusstyrka
backlight-slider = Tangentbordets ljusstyrka
backlight-off = Av
backlight-low = Låg
backlight-high = Hög

## Sound

volume-sound-settings = Ljudinställningar
volume-mute = Stäng av ljudet
volume-unmute = Slå på ljudet
volume-output-slider = Volym
volume-output-title = Ljudutgång
volume-output-open-menu = Öppna menyn för ljudutgång
volume-input-slider = Mikrofon
volume-input-title = Ljudingång
volume-input-open-menu = Öppna menyn för ljudingång

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Öppna Bluetooth-menyn
bluetooth-settings = Bluetooth-inställningar
bluetooth-connect = Anslut
bluetooth-disconnect = Koppla från
bluetooth-connect-device = Anslut till { $deviceName }
bluetooth-disconnect-device = Koppla från { $deviceName }
bluetooth-no-devices = Inga tillgängliga eller anslutna enheter
bluetooth-turn-on-hint = Slå på Bluetooth för att ansluta till enheter
bluetooth-connected-count = { $count ->
    [one] { $count } ansluten
   *[other] { $count } anslutna
}

## Network menus in quick settings

network-menu-unknown-network = <okänt>
network-menu-connect = Anslut
network-menu-disconnect = Koppla från
network-menu-connect-to = Anslut till { $name }
network-menu-disconnect-from = Koppla från { $name }
network-menu-turn-off = Stäng av
network-menu-wifi-network = { $secure ->
    [yes] { $name }, säkert, signalstyrka { $strength } %
   *[no] { $name }, inte säkert, signalstyrka { $strength } %
}
network-menu-hotspot = Surfzon på { $name }
network-menu-connected-count = { $count ->
    [one] { $count } ansluten
   *[other] { $count } anslutna
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Öppna VPN-menyn
network-menu-vpn-settings = VPN-inställningar
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Öppna Wi-Fi-menyn
network-menu-wifi-settings = Alla nätverk
network-menu-wired = Trådbundna anslutningar
network-menu-wired-open-menu = Öppna menyn för trådbundna anslutningar
network-menu-wired-settings = Inställningar för trådbundet nätverk
network-menu-tethers = Delade anslutningar via Bluetooth
network-menu-tethers-open-menu = Öppna menyn för delade anslutningar via Bluetooth
network-menu-tether = Delad anslutning
network-menu-tether-settings = Bluetooth-inställningar
network-menu-mobile-connections = Mobila anslutningar
network-menu-mobile-open-menu = Öppna menyn för mobila anslutningar
network-menu-mobile-settings = Inställningar för mobilt bredband
network-menu-mobile = Mobilt
network-device-wired = Trådbundet
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Logga in på nätverket
network-menu-failed-title = Anslutningen misslyckades
network-menu-failed-body = Det gick inte att aktivera nätverksanslutningen

## Location access dialog

location-dialog-title = Tillåt åtkomst till plats
location-dialog-description = Appen { $appName } vill komma åt din plats
location-dialog-info = Du kan ändra platsåtkomsten när som helst i integritetsinställningarna
location-dialog-deny = Neka åtkomst
location-dialog-grant = Ge åtkomst

## Thunderbolt notifications

thunderbolt-unknown-title = Okänd Thunderbolt-enhet
thunderbolt-unknown-body = En ny enhet anslöts medan du var borta. Koppla ur den och anslut den igen för att börja använda den.
thunderbolt-unauthorized-title = Ej godkänd Thunderbolt-enhet
thunderbolt-unauthorized-body = En ny enhet har anslutits och behöver godkännas av en administratör
thunderbolt-error-title = Fel vid godkännande av Thunderbolt-enhet
thunderbolt-error-body = Det gick inte att godkänna Thunderbolt-enheten: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Neka
access-dialog-allow = Tillåt

## Display change confirmation

display-change-title = Vill du behålla skärminställningarna?
display-change-countdown = { $seconds ->
    [one] Ändringarna återställs om { $seconds } sekund
   *[other] Ändringarna återställs om { $seconds } sekunder
}
display-change-revert = Återställ
display-change-keep = Behåll ändringarna

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = ”{ $appName }” svarar inte
close-dialog-description = Du kan vänta en stund på att appen fortsätter eller tvinga den att avslutas helt
close-dialog-force-quit = Tvinga avslut
close-dialog-wait = Vänta

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Spegla
switch-monitor-join = Utöka
switch-monitor-external-only = Bara extern
switch-monitor-built-in-only = Bara inbyggd

## Sign-in prompt

auth-prompt-password = Lösenord
auth-prompt-username = Användarnamn
auth-prompt-back = Tillbaka
auth-prompt-submit = Skicka
auth-prompt-wrong-password = Lösenordet fungerade inte
auth-prompt-failed = Det fungerade inte. Försök igen.
fingerprint-not-recognized = Fingeravtrycket kändes inte igen

## Drive connected notification

autorun-connected = ”{ $driveName }” har anslutits
autorun-ready = Disken kan nu användas
autorun-open-with = Öppna med { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Långsamma tangenter har slagits på
kbd-a11y-slow-keys-off = Långsamma tangenter har stängts av
kbd-a11y-slow-keys-description = Du höll just ned Skift i 8 sekunder. Det är kortkommandot för Långsamma tangenter, som ändrar hur tangentbordet fungerar.
kbd-a11y-sticky-keys-on = Tröga tangenter har slagits på
kbd-a11y-sticky-keys-off = Tröga tangenter har stängts av
kbd-a11y-sticky-keys-on-description = Du tryckte just på Skift 5 gånger i rad. Det är kortkommandot för Tröga tangenter, som ändrar hur tangentbordet fungerar.
kbd-a11y-sticky-keys-off-description = Du tryckte just på två tangenter samtidigt eller på Skift 5 gånger i rad. Det stänger av Tröga tangenter, som ändrar hur tangentbordet fungerar.
kbd-a11y-leave-on = Låt vara på
kbd-a11y-turn-on = Slå på
kbd-a11y-turn-off = Stäng av
kbd-a11y-leave-off = Låt vara av

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Välj ljudenhet
audio-device-cancel = Avbryt
audio-device-sound-settings = Ljudinställningar
audio-device-headphones = Hörlurar
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tillåt att kortkommandon blockeras
inhibit-shortcuts-app = Appen { $appName } vill blockera kortkommandon
inhibit-shortcuts-unknown-app = En app vill blockera kortkommandon
inhibit-shortcuts-restore = Du kan återställa kortkommandona genom att trycka på { $shortcut }
inhibit-shortcuts-deny = Neka
inhibit-shortcuts-allow = Tillåt

## Administrator authentication

polkit-title = Autentisering krävs
polkit-administrator = Administratör
polkit-password = Lösenord
polkit-cancel = Avbryt
polkit-authenticate = Autentisera
polkit-failed = Det fungerade inte. Försök igen.

## Unlocking encrypted drives

mount-hidden-volume = Dold volym
mount-windows-system-volume = Windows-systemvolym
mount-uses-keyfiles = Använder nyckelfiler
mount-keyfiles-use-app = Använd verktyget <i>{ $appName }</i> för att låsa upp en volym som använder nyckelfiler
mount-keyfiles-need-app = Du behöver ett externt verktyg som <i>Diskar</i> för att låsa upp en volym som använder nyckelfiler
mount-pim-number = PIM-nummer
mount-pim-invalid = PIM måste vara ett tal eller tomt
mount-password = Lösenord
mount-remember-password = Kom ihåg lösenordet
mount-cancel = Avbryt
mount-unlock = Lås upp
mount-open-app = Öppna { $appName }
mount-wrong-password = Det fungerade inte. Försök igen.
mount-unlock-failed = Det gick inte att låsa upp volymen
mount-pim-unsupported = Den installerade versionen av udisks stöder inte PIM-inställningen

## Log out, power off and restart dialog

end-session-log-out-user = Logga ut { $userName }
end-session-log-out-title = Logga ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } loggas ut automatiskt om { $seconds } sekund
   *[other] { $userName } loggas ut automatiskt om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du loggas ut automatiskt om { $seconds } sekund
   *[other] Du loggas ut automatiskt om { $seconds } sekunder
}
end-session-log-out-button = Logga ut
end-session-power-off-title = Stäng av
end-session-power-off-updates-title = Installera uppdateringar och stäng av
end-session-power-off-countdown = { $seconds ->
    [one] Datorn stängs av automatiskt om { $seconds } sekund
   *[other] Datorn stängs av automatiskt om { $seconds } sekunder
}
end-session-power-off-button = Stäng av
end-session-restart-title = Starta om
end-session-restart-updates-title = Installera uppdateringar och starta om
end-session-restart-countdown = { $seconds ->
    [one] Datorn startas om automatiskt om { $seconds } sekund
   *[other] Datorn startas om automatiskt om { $seconds } sekunder
}
end-session-restart-button = Starta om
end-session-update-restart-title = Starta om och installera uppdateringar
end-session-update-restart-countdown = { $seconds ->
    [one] Datorn startas om och installerar uppdateringar automatiskt om { $seconds } sekund
   *[other] Datorn startas om och installerar uppdateringar automatiskt om { $seconds } sekunder
}
end-session-update-restart-button = Starta om och installera
end-session-install-updates = Installera väntande programuppdateringar
end-session-install-version = Installera version { $version }
end-session-low-battery = Låg batterinivå. Anslut laddaren innan du installerar uppdateringar.
end-session-busy-apps = Vissa appar är upptagna eller har osparat arbete
end-session-other-users = Andra användare är inloggade
end-session-cancel = Avbryt
end-session-boot-options = Startalternativ
end-session-remote-user = { $userName } (fjärr)
end-session-console-user = { $userName } (konsol)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Autentisering krävs
network-agent-wifi-rejected = Det sparade lösenordet för ”{ $networkName }” fungerade inte. Ange det igen.
network-agent-wifi-secrets = Lösenord eller krypteringsnycklar krävs för att ansluta till det trådlösa nätverket ”{ $networkName }”
network-agent-wps-hint = Du kan också ansluta genom att trycka på WPS-knappen på routern
network-agent-wired-title = Trådbunden 802.1X-autentisering
network-agent-dsl-title = DSL-autentisering
network-agent-pin-title = PIN-kod krävs
network-agent-pin-body = Enheten för mobilt bredband behöver en PIN-kod
network-agent-vpn-title = VPN-lösenord
network-agent-password-required = Ett lösenord krävs för att ansluta till ”{ $networkName }”
network-agent-connect = Anslut
network-agent-cancel = Avbryt
network-agent-password = Lösenord
network-agent-username = Användarnamn
network-agent-key = Nyckel
network-agent-private-key-password = Lösenord för privat nyckel
network-agent-identity = Identitet
network-agent-service = Tjänst
network-agent-network-name = Nätverksnamn
network-agent-pin = PIN-kod

## Lock screen clock

lock-clock-swipe-up = Svep uppåt
lock-clock-click-or-press = Klicka eller tryck på en tangent

## Notification times

date-just-now = Nyss

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Fönster
ctrl-alt-tab-panel = Aktivitetsfält
ctrl-alt-tab-unlock = Upplåsning

## System notifications

messages-system-source = System
unsafe-mode-title = Systemet är i osäkert läge
unsafe-mode-body = Appar har nu obegränsad åtkomst
unsafe-mode-undo = Ångra
privileged-user-title = Inloggad som privilegierad användare
privileged-user-body = Av säkerhetsskäl bör du inte köra en session som privilegierad användare. Logga in som vanlig användare om du kan.

## On-screen keyboard

osk-keyboard-settings = Tangentbordsinställningar
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel behöver låsa skärmen

## Notifications

messages-unknown-app = Okänd app
messages-reply = Svara
messages-reply-placeholder = Skriv ett svar
messages-reply-send = Skicka

## Media player controls

mpris-unknown-artist = Okänd artist
mpris-unknown-title = Okänd titel

## Starting programs

spawn-failed = Det gick inte att köra ”{ $command }”:

## Text field context menu

entry-menu-copy = Kopiera
entry-menu-paste = Klistra in
entry-menu-show-text = Visa text
entry-menu-hide-text = Dölj text
entry-caps-lock-on = Caps Lock är på

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ta en skärmbild
title-bar-menu-hide = Minimera
title-bar-menu-restore = Återställ
title-bar-menu-maximize = Maximera
title-bar-menu-move = Flytta
title-bar-menu-resize = Ändra storlek
title-bar-menu-always-on-top = Alltid överst
title-bar-menu-always-on-visible-workspace = Visa på alla arbetsytor
title-bar-menu-workspace-left = Flytta till arbetsytan till vänster
title-bar-menu-workspace-right = Flytta till arbetsytan till höger
title-bar-menu-workspace-up = Flytta till arbetsytan ovanför
title-bar-menu-workspace-down = Flytta till arbetsytan nedanför
title-bar-menu-monitor-up = Flytta till skärmen ovanför
title-bar-menu-monitor-down = Flytta till skärmen nedanför
title-bar-menu-monitor-left = Flytta till skärmen till vänster
title-bar-menu-monitor-right = Flytta till skärmen till höger
title-bar-menu-close = Stäng

## Screenshots and screen recording

screenshot-source = Skärmfångst
screenshot-area = Markera område
screenshot-screen = Markera skärm
screenshot-window = Markera fönster
screenshot-take = Ta en skärmbild
screenshot-record = Spela in skärmen
screenshot-show-pointer = Visa pekaren
screenshot-capture = Ta bild
screenshot-close = Stäng
screenshot-screencasts-folder = Skärminspelningar
screenshot-screencast-file = Skärminspelning från { $date } { $time }
screenshot-screenshots-folder = Skärmbilder
screenshot-file = Skärmbild från { $timestamp }
screenshot-screencast-recorded = Skärminspelningen har sparats
screenshot-screencast-start-failed = Det gick inte att starta skärminspelningen
screenshot-screencast-out-of-space = Skärminspelningen misslyckades: diskutrymmet tog slut
screenshot-screencast-try-again = Skärminspelningen misslyckades. Försök igen.
screenshot-screencast-failed = Skärminspelningen misslyckades
screenshot-screencast-view = Klicka här för att visa videon
screenshot-show-in-rover = Visa i Rover
screenshot-captured = Skärmbilden har tagits
screenshot-captured-body = Du kan klistra in bilden från urklipp
