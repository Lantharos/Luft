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
privacy-windows-using = Använder dina fönster
privacy-windows-seeing = Ser dina fönster
privacy-windows-stop = Stoppa åtkomst

## Window access prompt

peek-see-title = { $app } vill se dina fönster
peek-see-description = Den kommer att kunna ta bilder av alla fönster du har öppna.
peek-use-title = { $app } vill se och använda dina fönster
peek-use-description = Den kommer att kunna se alla fönster du har öppna och klicka och skriva i dem som om det vore du.
peek-deny = Tillåt inte
peek-allow-once = Tillåt en gång
peek-allow-until-quit = Tillåt tills den avslutas

## Window access errors

peek-error-declined = Den som använder datorn nekade. { $app } kan fråga igen när den har avslutats.
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
