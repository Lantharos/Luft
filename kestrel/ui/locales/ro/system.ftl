## Shared

system-cancel = Anulează

## Dictation notifications

dictation-setup-title = Scrieți vorbind
dictation-setup-body = Vorbiți și textul apare în orice aplicație. Recunoașterea vorbirii are loc pe acest computer, așa că mai întâi trebuie instalat modelul de vorbire.
dictation-setup-action = Configurează dictarea
dictation-unsupported-title = Dictarea în limba { $language } nu este disponibilă pe acest computer
dictation-unsupported-body = Procesorul acestui computer nu poate rula recunoașterea vorbirii necesară pentru limba { $language }. Puteți dicta în altă limbă.
dictation-settings-action = Setări dictare

## System health notifications

health-gpu-reset-title = Driverul grafic a încetat să răspundă
health-gpu-reset-body = { $day ->
    [today] Computerul a repornit singur azi, la { $time }. În Setări puteți vedea ce poate împiedica repetarea problemei.
   *[other] Computerul a repornit singur pe { $date }, la { $time }. În Setări puteți vedea ce poate împiedica repetarea problemei.
}
health-gpu-reset-details = Detalii

oom-app-closed-title = Aplicația { $app } a fost închisă pentru a elibera memorie
oom-container-closed-title = Un container a fost închis pentru a elibera memorie
oom-closed-body = Computerul rămânea fără memorie, așa că a fost închis pentru ca restul să funcționeze în continuare fără întreruperi.
oom-closed-body-with-size = Computerul rămânea fără memorie, așa că a fost închis pentru ca restul să funcționeze în continuare fără întreruperi. Folosea { $size }.
memory-low-title = Luft rămâne fără memorie
memory-low-app-body = Aplicația { $app } folosește { $size }. Forțați închiderea ei pentru ca restul să funcționeze în continuare fără întreruperi.
memory-low-container-body = Un container folosește { $size }. Forțați închiderea lui pentru ca restul să funcționeze în continuare fără întreruperi.
memory-low-force-quit = Forțează închiderea

## Input source indicator

input-source-indicator = Sursă de introducere: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Modul avion este activat din hardware
media-keys-airplane-mode-on = Mod avion activat
media-keys-airplane-mode-off = Mod avion dezactivat
media-keys-bluetooth-on = Bluetooth activat
media-keys-bluetooth-off = Bluetooth dezactivat
media-keys-caps-lock-on = Caps Lock activat
media-keys-caps-lock-off = Caps Lock dezactivat
media-keys-num-lock-on = Num Lock activat
media-keys-num-lock-off = Num Lock dezactivat

## VPN sign-in

vpn-sign-in-title = Conectare la { $connection }
vpn-connect = Conectează
vpn-signing-in = Se conectează…
vpn-finish-in-browser = Finalizați conectarea în browser.
vpn-certificate-untrusted = { $host } a prezentat un certificat care nu poate fi verificat ({ $reason }). Amprenta lui este { $fingerprint }.
vpn-certificate-warning = Cineva s-ar putea da drept acest server. Conectați-vă doar dacă vă așteptați la asta.
vpn-certificate-connect = Conectează oricum

vpn-field-password = Parolă
vpn-field-certificate-password = Parola certificatului
vpn-field-proxy-password = Parola proxy-ului
vpn-field-pre-shared-key = Cheie predistribuită
vpn-field-group-password = Parola grupului

## Battery notifications

battery-left = Baterie rămasă: { $percent }.
battery-left-with-time = Baterie rămasă: { $percent }, aproximativ { $duration }.
battery-low-title = Baterie descărcată
battery-very-low-title = Baterie foarte descărcată
battery-almost-empty-title = Baterie aproape goală
battery-ups-low-title = Bateria UPS-ului este descărcată
battery-ups-very-low-title = Bateria UPS-ului este foarte descărcată
battery-ups-almost-empty-title = Bateria UPS-ului este aproape goală
battery-very-low-body = { $left } Conectați curând încărcătorul.
battery-almost-empty-body = { $left } Conectați acum încărcătorul ca să nu pierdeți lucrul nesalvat.

battery-device-low-title = Baterie descărcată: { $device }
battery-device-very-low-title = Baterie foarte descărcată: { $device }
battery-device-low-body = { $left } Încărcați curând dispozitivul.
battery-device-very-low-body = { $left } Încărcați acum dispozitivul ca să nu se oprească.

battery-device-mouse = Mouse
battery-device-keyboard = Tastatură
battery-device-phone = Telefon
battery-device-tablet = Tabletă
battery-device-controller = Controller
battery-device-pen = Creion
battery-device-touchpad = Touchpad
battery-device-headset = Căști cu microfon
battery-device-speaker = Difuzor
battery-device-headphones = Căști
battery-device-remote = Telecomandă
battery-device-other = Dispozitiv conectat

## Privacy indicator

privacy-indicator = În uz: { $things }
privacy-thing-camera = camera
privacy-thing-microphone = microfonul
privacy-thing-screen = ecranul
privacy-thing-location = locația
privacy-thing-windows = ferestrele

privacy-camera-unknown-app = O aplicație folosește camera
privacy-stop-sharing = Oprește partajarea ecranului
privacy-stop-recording = Oprește înregistrarea
privacy-turn-off-location = Dezactivează serviciile de localizare
privacy-settings = Setări confidențialitate
privacy-camera = Cameră
privacy-microphone = Microfon
privacy-microphone-muted = Microfon dezactivat
privacy-mute-microphone = Dezactivează microfonul
privacy-unmute-microphone = Activează microfonul
privacy-close-app = Închide { $app }
privacy-unknown-app = O aplicație
privacy-reported-app = „{ $name }” (nume neverificat)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program vă poate vedea ferestrele
    [few] { $count } programe vă pot vedea ferestrele
   *[other] { $count } de programe vă pot vedea ferestrele
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program vă poate vedea și folosi ferestrele
    [few] { $count } programe vă pot vedea și folosi ferestrele
   *[other] { $count } de programe vă pot vedea și folosi ferestrele
}
privacy-windows-stop = Oprește accesul

## Window access prompt

peek-see-request = Permiteți unui program pe care l-ați pornit să vă vadă ferestrele?
peek-see-description = Va putea face capturi ale oricărei ferestre deschise.
peek-use-request = Permiteți unui program pe care l-ați pornit să vă vadă și să vă folosească ferestrele?
peek-use-description = Va putea vedea orice fereastră deschisă și va putea face clic și tasta în ea ca și cum ați face-o personal.
peek-deny = Nu permite
peek-allow-once = Permite o dată
peek-allow-until-quit = Permite până la închidere

## Window access errors

peek-error-declined-until-quit = Persoana care folosește acest computer a refuzat. Programul poate cere din nou după ce se închide.
peek-error-not-allowed = Persoana care folosește acest computer nu a permis acest lucru
peek-error-sandboxed = Aplicațiile dintr-un mediu izolat nu pot vedea sau folosi alte ferestre
peek-error-unknown-caller = Programul care a cerut s-a încheiat sau nu a putut fi recunoscut
peek-error-no-caller = Magistrala sesiunii nu a indicat ce program cere
peek-error-screen-busy = Ecranul este blocat sau este deschisă o solicitare de sistem. Încercați din nou după ce dispare.
peek-error-input-held = Cineva ține apăsate taste sau butoane ale mouse-ului. Încercați din nou peste un moment.
peek-error-input-dropped = Intrarea a fost oprită, deoarece altceva se afla sub punct sau avea tastatura când a ajuns
peek-error-not-in-front = Fereastra nu a putut fi adusă în față
peek-error-covered = Altceva acoperă acea parte a ferestrei
peek-error-outside = { $x }, { $y } se află în afara imaginii ferestrei, care are { $width } × { $height }
peek-error-nothing-to-capture = Fereastra nu afișează nimic de capturat
peek-error-window-picture-late = Imaginea ferestrei nu a fost gata la timp
peek-error-screen-picture-late = Imaginea ecranului nu a fost gata la timp
peek-error-no-window-id = Nicio fereastră nu are id-ul { $id }. peek list afișează ferestrele deschise.
peek-error-no-window-for-handle = Programul pornit ca { $handle } nu are nicio fereastră deschisă
peek-error-ended-before-window = Programul s-a încheiat înainte să deschidă o fereastră
peek-error-no-window-in-time = Nicio fereastră nu s-a deschis în { $duration }
peek-error-launch-not-started-by-peek = Poate fi lansat doar un program pornit chiar de peek run
peek-error-ended-while-starting = Programul s-a încheiat în timp ce pornea
peek-error-launch-failed = systemd nu a putut porni { $program }
peek-error-unknown-handle = Nimic din ce ați pornit cu peek run nu are identificatorul { $handle } sau s-a închis
peek-error-unknown-key = { $key } nu este o tastă cunoscută de peek
peek-error-unknown-modifier = { $modifier } nu este o tastă de modificare. Folosiți ctrl, shift, alt sau super.
peek-error-display-owner = Acest ecran aparține altui program
peek-error-display-run = Programele dintr-un ecran ascuns sunt pornite de peek run
peek-error-display-handle = Acest ecran a fost pornit ca { $handle }, nu ca { $requested }

## Quick settings tiles

auto-rotate-title = Rotire automată
dark-style-title = Mod întunecat
do-not-disturb-title = Nu deranjați
night-light-title = Lumină de noapte
airplane-mode-title = Mod avion

## Power mode

power-profile-title = Mod de alimentare
power-profile-header = Mod de alimentare
power-profile-open-menu = Deschide meniul modurilor de alimentare
power-profile-settings = Setări alimentare
power-profile-performance = Performanță
power-profile-balanced = Echilibrat
power-profile-power-saver = Economisire energie
power-profile-custom = Personalizat

## Keep awake

caffeine-title = Menține activ
caffeine-open-menu = Deschide meniul Menține activ
caffeine-until = Până la { $time }
caffeine-until-turned-off = Până la dezactivare
caffeine-30-minutes = 30 de minute
caffeine-1-hour = 1 oră
caffeine-2-hours = 2 ore
caffeine-inhibit-reason = Menținut activ din Setări rapide

## Brightness

brightness-title = Luminozitate
brightness-open-menu = Deschide meniul de luminozitate

## Keyboard backlight

backlight-title = Iluminare tastatură
backlight-open-menu = Deschide meniul de luminozitate a tastaturii
backlight-slider = Luminozitate tastatură
backlight-off = Dezactivată
backlight-low = Redusă
backlight-high = Ridicată

## Sound

volume-sound-settings = Setări sunet
volume-mute = Dezactivează sunetul
volume-unmute = Activează sunetul
volume-output-slider = Volum
volume-output-title = Ieșire audio
volume-output-open-menu = Deschide meniul de ieșire audio
volume-input-slider = Microfon
volume-input-title = Intrare audio
volume-input-open-menu = Deschide meniul de intrare audio

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Deschide meniul Bluetooth
bluetooth-settings = Setări Bluetooth
bluetooth-connect = Conectează
bluetooth-disconnect = Deconectează
bluetooth-connect-device = Conectează la { $deviceName }
bluetooth-disconnect-device = Deconectează { $deviceName }
bluetooth-no-devices = Niciun dispozitiv disponibil sau conectat
bluetooth-turn-on-hint = Activați Bluetooth pentru a vă conecta la dispozitive
bluetooth-connected-count = { $count ->
    [one] { $count } dispozitiv conectat
    [few] { $count } dispozitive conectate
   *[other] { $count } de dispozitive conectate
}

## Network menus in quick settings

network-menu-unknown-network = <necunoscută>
network-menu-connect = Conectează
network-menu-disconnect = Deconectează
network-menu-connect-to = Conectează la { $name }
network-menu-disconnect-from = Deconectează { $name }
network-menu-turn-off = Dezactivează
network-menu-wifi-network = { $secure ->
    [yes] { $name }, securizată, puterea semnalului { $strength }%
   *[no] { $name }, nesecurizată, puterea semnalului { $strength }%
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] { $count } conexiune activă
    [few] { $count } conexiuni active
   *[other] { $count } de conexiuni active
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Deschide meniul VPN
network-menu-vpn-settings = Setări VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Deschide meniul Wi-Fi
network-menu-wifi-settings = Toate rețelele
network-menu-wired = Conexiuni prin cablu
network-menu-wired-open-menu = Deschide meniul conexiunilor prin cablu
network-menu-wired-settings = Setări conexiune prin cablu
network-menu-tethers = Partajare internet prin Bluetooth
network-menu-tethers-open-menu = Deschide meniul de partajare a internetului prin Bluetooth
network-menu-tether = Partajare internet
network-menu-tether-settings = Setări Bluetooth
network-menu-mobile-connections = Conexiuni mobile
network-menu-mobile-open-menu = Deschide meniul conexiunilor mobile
network-menu-mobile-settings = Setări bandă largă mobilă
network-menu-mobile = Date mobile
network-device-wired = Prin cablu
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Conectează-te la rețea
network-menu-failed-title = Conectarea nu a reușit
network-menu-failed-body = Conexiunea la rețea nu a putut fi activată

## Location access dialog

location-dialog-title = Permiteți accesul la locație
location-dialog-description = Aplicația { $appName } vrea să vă acceseze locația
location-dialog-info = Accesul la locație poate fi schimbat oricând din setările de confidențialitate
location-dialog-deny = Refuză accesul
location-dialog-grant = Permite accesul

## Thunderbolt notifications

thunderbolt-unknown-title = Dispozitiv Thunderbolt necunoscut
thunderbolt-unknown-body = Un dispozitiv nou a fost conectat cât timp computerul era blocat. Deconectați-l și conectați-l din nou pentru a începe să îl folosiți.
thunderbolt-unauthorized-title = Dispozitiv Thunderbolt neautorizat
thunderbolt-unauthorized-body = Un dispozitiv nou a fost conectat și are nevoie de aprobarea unui administrator
thunderbolt-error-title = Eroare de autorizare Thunderbolt
thunderbolt-error-body = Dispozitivul Thunderbolt nu a putut fi autorizat: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Refuză
access-dialog-allow = Permite

## Display change confirmation

display-change-title = Păstrați setările ecranului?
display-change-countdown = { $seconds ->
    [one] Setările vor reveni la cele anterioare în { $seconds } secundă
    [few] Setările vor reveni la cele anterioare în { $seconds } secunde
   *[other] Setările vor reveni la cele anterioare în { $seconds } de secunde
}
display-change-revert = Revino
display-change-keep = Păstrează

## Drive connected notification

autorun-connected = „{ $driveName }” a fost conectat
autorun-ready = Discul poate fi folosit acum
autorun-open-with = Deschide cu { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Taste lente activate
kbd-a11y-slow-keys-off = Taste lente dezactivate
kbd-a11y-slow-keys-description = Ați ținut apăsată tasta Shift timp de 8 secunde. Aceasta este comanda rapidă pentru Taste lente, care schimbă modul în care funcționează tastatura.
kbd-a11y-sticky-keys-on = Taste adezive activate
kbd-a11y-sticky-keys-off = Taste adezive dezactivate
kbd-a11y-sticky-keys-on-description = Ați apăsat tasta Shift de 5 ori la rând. Aceasta este comanda rapidă pentru Taste adezive, care schimbă modul în care funcționează tastatura.
kbd-a11y-sticky-keys-off-description = Ați apăsat două taste deodată sau ați apăsat tasta Shift de 5 ori la rând. Astfel se dezactivează Taste adezive, care schimbă modul în care funcționează tastatura.
kbd-a11y-leave-on = Lasă activat
kbd-a11y-turn-on = Activează
kbd-a11y-turn-off = Dezactivează
kbd-a11y-leave-off = Lasă dezactivat

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Alegeți dispozitivul audio
audio-device-cancel = Anulează
audio-device-sound-settings = Setări sunet
audio-device-headphones = Căști
audio-device-headset = Căști cu microfon
audio-device-microphone = Microfon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permiteți blocarea comenzilor rapide
inhibit-shortcuts-app = Aplicația { $appName } vrea să blocheze comenzile rapide
inhibit-shortcuts-unknown-app = O aplicație vrea să blocheze comenzile rapide
inhibit-shortcuts-titled-app = O aplicație cu fereastra „{ $title }” vrea să blocheze comenzile rapide
inhibit-shortcuts-restore = Puteți reactiva comenzile rapide apăsând { $shortcut }
inhibit-shortcuts-deny = Refuză
inhibit-shortcuts-allow = Permite

## Unlocking encrypted drives

mount-hidden-volume = Volum ascuns
mount-windows-system-volume = Volum de sistem Windows
mount-uses-keyfiles = Folosește fișiere cheie
mount-keyfiles-use-app = Pentru a debloca un volum care folosește fișiere cheie, folosiți utilitarul <i>{ $appName }</i>
mount-keyfiles-need-app = Pentru a debloca un volum care folosește fișiere cheie aveți nevoie de un utilitar extern, cum ar fi <i>Discuri</i>
mount-pim-number = Număr PIM
mount-pim-invalid = PIM-ul trebuie să fie un număr sau să rămână gol
mount-password = Parolă
mount-remember-password = Ține minte parola
mount-cancel = Anulează
mount-unlock = Deblochează
mount-open-app = Deschide { $appName }
mount-wrong-password = Nu a funcționat. Încercați din nou.
mount-unlock-failed = Volumul nu a putut fi deblocat
mount-pim-unsupported = Versiunea instalată de udisks nu acceptă setarea PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Este necesară autentificarea
network-agent-wifi-rejected = Parola salvată pentru „{ $networkName }” nu a funcționat. Introduceți-o din nou.
network-agent-wifi-secrets = Pentru accesarea rețelei wireless „{ $networkName }” sunt necesare parole sau chei de criptare
network-agent-wps-hint = Vă puteți conecta și apăsând butonul „WPS” de pe router
network-agent-wired-title = Autentificare 802.1X prin cablu
network-agent-dsl-title = Autentificare DSL
network-agent-pin-title = Este necesar codul PIN
network-agent-pin-body = Dispozitivul de bandă largă mobilă are nevoie de codul PIN
network-agent-vpn-title = Parolă VPN
network-agent-password-required = Pentru conectarea la „{ $networkName }” este necesară o parolă
network-agent-connect = Conectează
network-agent-cancel = Anulează
network-agent-password = Parolă
network-agent-username = Nume de utilizator
network-agent-key = Cheie
network-agent-private-key-password = Parola cheii private
network-agent-identity = Identitate
network-agent-service = Serviciu
network-agent-network-name = Numele rețelei
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Captură de ecran
screenshot-area = Selectează o zonă
screenshot-screen = Selectează un ecran
screenshot-window = Selectează o fereastră
screenshot-take = Fă o captură de ecran
screenshot-record = Înregistrează ecranul
screenshot-show-pointer = Afișează cursorul
screenshot-capture = Capturează
screenshot-close = Închide
screenshot-screencasts-folder = Înregistrări de ecran
screenshot-screencast-file = Înregistrare de ecran din { $date } { $time }
screenshot-screenshots-folder = Capturi de ecran
screenshot-file = Captură de ecran din { $timestamp }
screenshot-screencast-recorded = Înregistrarea ecranului a fost salvată
screenshot-screencast-start-failed = Înregistrarea ecranului nu a putut porni
screenshot-screencast-out-of-space = Înregistrarea ecranului a eșuat: spațiu insuficient pe disc
screenshot-screencast-try-again = Înregistrarea ecranului a eșuat. Încercați din nou.
screenshot-screencast-failed = Înregistrarea ecranului a eșuat
screenshot-screencast-view = Faceți clic aici pentru a vedea videoclipul
screenshot-show-in-rover = Afișează în Rover
screenshot-captured = Captură de ecran realizată
screenshot-captured-body = Puteți lipi imaginea din clipboard

## System updates
updates-available-title = Sunt disponibile actualizări de sistem
updates-available-body = Deschideți Setări pentru a le descărca și instala.
updates-ready-title = Actualizările sunt gata de instalare
updates-ready-body = Reporniți când vă convine pentru a le instala.
