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
privacy-windows-using = Folosește ferestrele
privacy-windows-seeing = Vede ferestrele
privacy-windows-stop = Oprește accesul

## Window access prompt

peek-see-title = { $app } vrea să vă vadă ferestrele
peek-see-description = Va putea face capturi ale oricărei ferestre deschise.
peek-use-title = { $app } vrea să vă vadă și să vă folosească ferestrele
peek-use-description = Va putea vedea orice fereastră deschisă și va putea face clic și tasta în ea ca și cum ați face-o personal.
peek-deny = Nu permite
peek-allow-once = Permite o dată
peek-allow-until-quit = Permite până la închidere

## Window access errors

peek-error-declined = Persoana care folosește acest computer a refuzat. { $app } poate cere din nou după ce se închide.
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
