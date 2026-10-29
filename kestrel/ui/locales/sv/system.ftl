## Shared

system-cancel = Avbryt

## Dictation notifications

dictation-setup-title = Skriv genom att tala
dictation-setup-body = Prata för att skriva det du säger, i vilken app som helst. Talet tolkas på den här datorn, så talmodellen måste installeras först.
dictation-setup-action = Konfigurera diktering
dictation-unsupported-title = Diktering på { $language } är inte tillgänglig på den här datorn
dictation-unsupported-body = Processorn klarar inte den taligenkänning som { $language } kräver. Du kan diktera på ett annat språk.
dictation-settings-action = Dikteringsinställningar

## System health notifications

health-gpu-reset-title = Grafikdrivrutinen slutade svara
health-gpu-reset-body = { $day ->
    [today] Datorn startade om sig själv i dag kl. { $time }. I Inställningar ser du vad som kan förhindra att det händer igen.
   *[other] Datorn startade om sig själv den { $date } kl. { $time }. I Inställningar ser du vad som kan förhindra att det händer igen.
}
health-gpu-reset-details = Detaljer

oom-app-closed-title = { $app } stängdes för att frigöra minne
oom-container-closed-title = En container stängdes för att frigöra minne
oom-closed-body = Datorn höll på att få slut på minne, så den stängdes för att resten skulle fortsätta svara.
oom-closed-body-with-size = Datorn höll på att få slut på minne, så den stängdes för att resten skulle fortsätta svara. Den använde { $size }.
memory-low-title = Luft har ont om minne
memory-low-app-body = { $app } använder { $size }. Tvinga den att avslutas så att resten fortsätter svara.
memory-low-container-body = En container använder { $size }. Tvinga den att avslutas så att resten fortsätter svara.
memory-low-force-quit = Tvinga avslut

## Input source indicator

input-source-indicator = Inmatningskälla: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Flygplansläge är på via maskinvaran
media-keys-airplane-mode-on = Flygplansläge på
media-keys-airplane-mode-off = Flygplansläge av
media-keys-bluetooth-on = Bluetooth på
media-keys-bluetooth-off = Bluetooth av
media-keys-caps-lock-on = Caps Lock på
media-keys-caps-lock-off = Caps Lock av
media-keys-num-lock-on = Num Lock på
media-keys-num-lock-off = Num Lock av

## VPN sign-in

vpn-sign-in-title = Logga in på { $connection }
vpn-connect = Anslut
vpn-signing-in = Loggar in …
vpn-finish-in-browser = Slutför inloggningen i webbläsaren.
vpn-certificate-untrusted = { $host } visade ett certifikat som inte kan verifieras ({ $reason }). Dess fingeravtryck är { $fingerprint }.
vpn-certificate-warning = Någon kan utge sig för att vara den här servern. Anslut bara om du väntade dig det här.
vpn-certificate-connect = Anslut ändå

vpn-field-password = Lösenord
vpn-field-certificate-password = Certifikatlösenord
vpn-field-proxy-password = Proxylösenord
vpn-field-pre-shared-key = Delad nyckel
vpn-field-group-password = Grupplösenord

## Battery notifications

battery-left = { $percent } kvar.
battery-left-with-time = { $percent } kvar, ungefär { $duration }.
battery-low-title = Låg batterinivå
battery-very-low-title = Mycket låg batterinivå
battery-almost-empty-title = Batteriet är nästan slut
battery-ups-low-title = Låg batterinivå i UPS:en
battery-ups-very-low-title = Mycket låg batterinivå i UPS:en
battery-ups-almost-empty-title = UPS:ens batteri är nästan slut
battery-very-low-body = { $left } Anslut laddaren snart.
battery-almost-empty-body = { $left } Anslut laddaren nu så att du inte förlorar osparat arbete.

battery-device-low-title = Låg batterinivå: { $device }
battery-device-very-low-title = Mycket låg batterinivå: { $device }
battery-device-low-body = { $left } Ladda snart.
battery-device-very-low-body = { $left } Ladda nu så att enheten inte stängs av.

battery-device-mouse = Mus
battery-device-keyboard = Tangentbord
battery-device-phone = Telefon
battery-device-tablet = Surfplatta
battery-device-controller = Handkontroll
battery-device-pen = Penna
battery-device-touchpad = Styrplatta
battery-device-headset = Headset
battery-device-speaker = Högtalare
battery-device-headphones = Hörlurar
battery-device-remote = Fjärrkontroll
battery-device-other = Ansluten enhet

## Privacy indicator

privacy-indicator = Använder { $things }
privacy-thing-camera = kameran
privacy-thing-microphone = mikrofonen
privacy-thing-screen = skärmen
privacy-thing-location = platsen
privacy-thing-windows = dina fönster

privacy-camera-unknown-app = En app använder kameran
privacy-stop-sharing = Sluta dela skärmen
privacy-stop-recording = Stoppa inspelningen
privacy-turn-off-location = Stäng av platstjänster
privacy-settings = Integritetsinställningar
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofonen är avstängd
privacy-mute-microphone = Stäng av mikrofonen
privacy-unmute-microphone = Slå på mikrofonen
privacy-close-app = Stäng { $app }
privacy-unknown-app = En app
privacy-reported-app = ”{ $name }” (namnet är inte bekräftat)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program kan se dina fönster
   *[other] { $count } program kan se dina fönster
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program kan se och använda dina fönster
   *[other] { $count } program kan se och använda dina fönster
}
privacy-windows-stop = Stoppa åtkomst

## Window access prompt

peek-see-request = Vill du låta ett program som du har startat se dina fönster?
peek-see-description = Den kommer att kunna ta bilder av alla fönster du har öppna.
peek-use-request = Vill du låta ett program som du har startat se och använda dina fönster?
peek-use-description = Den kommer att kunna se alla fönster du har öppna och klicka och skriva i dem som om det vore du.
peek-deny = Tillåt inte
peek-allow-once = Tillåt en gång
peek-allow-until-quit = Tillåt tills den avslutas

## Window access errors

peek-error-declined-until-quit = Den som använder datorn nekade. Programmet kan fråga igen när det har avslutats.
peek-error-not-allowed = Den som använder datorn tillät det inte
peek-error-sandboxed = Appar i en sandlåda kan inte se eller använda andra fönster
peek-error-unknown-caller = Programmet som frågar har avslutats eller kunde inte identifieras
peek-error-no-caller = Sessionsbussen angav inte vilket program som frågar
peek-error-screen-busy = Skärmen är låst eller så visas en systemdialog. Försök igen när den är borta.
peek-error-input-held = Någon håller ned tangenter eller musknappar. Försök igen om en stund.
peek-error-input-dropped = Inmatningen stoppades eftersom något annat låg under punkten eller hade tangentbordet när den kom fram
peek-error-not-in-front = Det gick inte att ta fram fönstret
peek-error-covered = Något annat täcker den delen av fönstret
peek-error-outside = { $x }, { $y } ligger utanför fönsterbilden, som är { $width } × { $height }
peek-error-nothing-to-capture = Fönstret visar inget att ta en bild av
peek-error-window-picture-late = Fönsterbilden blev inte klar i tid
peek-error-screen-picture-late = Skärmbilden blev inte klar i tid
peek-error-no-window-id = Inget fönster har id { $id }. peek list visar de öppna.
peek-error-no-window-for-handle = Programmet som startades som { $handle } har inget öppet fönster
peek-error-ended-before-window = Programmet avslutades innan det öppnade ett fönster
peek-error-no-window-in-time = Inget fönster öppnades inom { $duration }
peek-error-launch-not-started-by-peek = Bara ett program som peek run själv har startat kan startas
peek-error-ended-while-starting = Programmet avslutades medan det startade
peek-error-launch-failed = systemd kunde inte starta { $program }
peek-error-unknown-handle = Inget som du har startat med peek run har referensen { $handle }, eller så har det avslutats
peek-error-unknown-key = { $key } är ingen tangent som peek känner till
peek-error-unknown-modifier = { $modifier } är ingen modifieringstangent. Använd ctrl, shift, alt eller super.
peek-error-display-owner = Den här skärmen tillhör ett annat program
peek-error-display-run = Program på en dold skärm startas av peek run
peek-error-display-handle = Den här skärmen startades som { $handle }, inte { $requested }

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
inhibit-shortcuts-titled-app = En app med fönstret ”{ $title }” vill blockera kortkommandon
inhibit-shortcuts-restore = Du kan återställa kortkommandona genom att trycka på { $shortcut }
inhibit-shortcuts-deny = Neka
inhibit-shortcuts-allow = Tillåt

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

## System updates
updates-available-title = Systemuppdateringar är tillgängliga
updates-available-body = Öppna Inställningar för att hämta och installera dem.
updates-ready-title = Uppdateringarna är redo att installeras
updates-ready-body = Starta om när det passar dig för att installera dem.
