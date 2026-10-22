## Shared

system-cancel = Anulo

## Dictation notifications

dictation-setup-title = Shkruaj duke folur
dictation-setup-body = Fol dhe ajo që thua shkruhet në çdo aplikacion. Dëgjon në këtë kompjuter, ndaj i duhet fillimisht modeli i të folurit.
dictation-setup-action = Konfiguro diktimin
dictation-unsupported-title = Diktimi në gjuhën { $language } nuk ofrohet në këtë kompjuter
dictation-unsupported-body = Procesori i tij nuk e ekzekuton dot njohësin e të folurit që i duhet gjuhës { $language }. Mund të diktosh në një gjuhë tjetër.
dictation-settings-action = Cilësimet e diktimit

## System health notifications

health-gpu-reset-title = Drejtuesi i grafikës ndaloi së përgjigjuri
health-gpu-reset-body = { $day ->
    [today] Kompjuteri u rinis vetë sot në orën { $time }. Te Cilësimet sheh çfarë mund ta parandalojë herë tjetër.
   *[other] Kompjuteri u rinis vetë më { $date } në orën { $time }. Te Cilësimet sheh çfarë mund ta parandalojë herë tjetër.
}
health-gpu-reset-details = Detajet

oom-app-closed-title = { $app } u mbyll për të liruar memorie
oom-container-closed-title = Një kontejner u mbyll për të liruar memorie
oom-closed-body = Kompjuterit po i mbaronte memoria, ndaj u mbyll që gjithçka tjetër të vazhdojë të përgjigjet.
oom-closed-body-with-size = Kompjuterit po i mbaronte memoria, ndaj u mbyll që gjithçka tjetër të vazhdojë të përgjigjet. Po përdorte { $size }.
memory-low-title = Memoria e Luft po mbaron
memory-low-app-body = { $app } po përdor { $size }. Detyroje të mbyllet që gjithçka tjetër të vazhdojë të përgjigjet.
memory-low-container-body = Një kontejner po përdor { $size }. Detyroje të mbyllet që gjithçka tjetër të vazhdojë të përgjigjet.
memory-low-force-quit = Detyro mbylljen

## Input source indicator

input-source-indicator = Burimi i hyrjes: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Regjimi i aeroplanit është aktivizuar nga çelësi i pajisjes
media-keys-airplane-mode-on = Regjimi i aeroplanit aktiv
media-keys-airplane-mode-off = Regjimi i aeroplanit joaktiv
media-keys-bluetooth-on = Bluetooth aktiv
media-keys-bluetooth-off = Bluetooth joaktiv
media-keys-caps-lock-on = Caps Lock aktiv
media-keys-caps-lock-off = Caps Lock joaktiv
media-keys-num-lock-on = Num Lock aktiv
media-keys-num-lock-off = Num Lock joaktiv

## VPN sign-in

vpn-sign-in-title = Hyr në { $connection }
vpn-connect = Lidhu
vpn-signing-in = Po hyn…
vpn-finish-in-browser = Përfundo hyrjen në shfletues.
vpn-certificate-untrusted = { $host } paraqiti një certifikatë që nuk mund të verifikohet ({ $reason }). Gjurma e saj e gishtit është { $fingerprint }.
vpn-certificate-warning = Dikush mund të shtiret si ky server. Lidhu vetëm nëse e prisje këtë.
vpn-certificate-connect = Lidhu gjithsesi

vpn-field-password = Fjalëkalimi
vpn-field-certificate-password = Fjalëkalimi i certifikatës
vpn-field-proxy-password = Fjalëkalimi i proxy-t
vpn-field-pre-shared-key = Çelësi i parandarë
vpn-field-group-password = Fjalëkalimi i grupit

## Battery notifications

battery-left = Ka mbetur { $percent }.
battery-left-with-time = Ka mbetur { $percent }, rreth { $duration }.
battery-low-title = Bateria e ulët
battery-very-low-title = Bateria shumë e ulët
battery-almost-empty-title = Bateria pothuajse bosh
battery-ups-low-title = Bateria e UPS-it e ulët
battery-ups-very-low-title = Bateria e UPS-it shumë e ulët
battery-ups-almost-empty-title = Bateria e UPS-it pothuajse bosh
battery-very-low-body = { $left } Lidhe me karikuesin së shpejti.
battery-almost-empty-body = { $left } Lidhe me karikuesin tani që të mos humbasësh punën e paruajtur.

battery-device-low-title = { $device }: bateria e ulët
battery-device-very-low-title = { $device }: bateria shumë e ulët
battery-device-low-body = { $left } Karikoje së shpejti.
battery-device-very-low-body = { $left } Karikoje tani që të mos fiket.

battery-device-mouse = Miu
battery-device-keyboard = Tastiera
battery-device-phone = Telefoni
battery-device-tablet = Tableti
battery-device-controller = Kontrolluesi
battery-device-pen = Lapsi
battery-device-touchpad = Blloku i prekjes
battery-device-headset = Kufjet me mikrofon
battery-device-speaker = Altoparlanti
battery-device-headphones = Kufjet
battery-device-remote = Telekomanda
battery-device-other = Pajisja e lidhur

## Privacy indicator

privacy-indicator = Në përdorim: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofoni
privacy-thing-screen = ekrani
privacy-thing-location = vendndodhja
privacy-thing-windows = dritaret

privacy-camera-unknown-app = Një aplikacion po përdor kamerën
privacy-stop-sharing = Ndalo ndarjen e ekranit
privacy-stop-recording = Ndalo regjistrimin
privacy-turn-off-location = Çaktivizo shërbimet e vendndodhjes
privacy-settings = Cilësimet e privatësisë
privacy-camera = Kamera
privacy-microphone = Mikrofoni
privacy-microphone-muted = Mikrofoni i heshtur
privacy-mute-microphone = Hesht mikrofonin
privacy-unmute-microphone = Aktivizo mikrofonin
privacy-close-app = Mbyll { $app }
privacy-unknown-app = Një aplikacion
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program mund të shohë dritaret e tua
   *[other] { $count } programe mund të shohin dritaret e tua
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program mund të shohë dhe të përdorë dritaret e tua
   *[other] { $count } programe mund të shohin dhe të përdorin dritaret e tua
}
privacy-windows-stop = Ndalo qasjen

## Window access prompt

peek-see-request = Të lejohet një program që ke nisur të shohë dritaret e tua?
peek-see-description = Do të mund të bëjë foto të çdo dritareje që ke të hapur.
peek-use-request = Të lejohet një program që ke nisur të shohë dhe të përdorë dritaret e tua?
peek-use-description = Do të mund të shohë çdo dritare që ke të hapur dhe të klikojë e të shkruajë në të si të ishe ti.
peek-deny = Mos lejo
peek-allow-once = Lejo një herë
peek-allow-until-quit = Lejo derisa të mbyllet

## Window access errors

peek-error-declined-until-quit = Personi që përdor këtë kompjuter e refuzoi. Programi mund të pyesë sërish pasi të mbyllet.
peek-error-not-allowed = Personi që përdor këtë kompjuter nuk e lejoi
peek-error-sandboxed = Aplikacionet në mjedis të izoluar nuk mund të shohin ose përdorin dritare të tjera
peek-error-unknown-caller = Programi që pyet përfundoi ose nuk u njoh dot
peek-error-no-caller = Busi i seancës nuk tregoi se cili program po pyet
peek-error-screen-busy = Ekrani është i bllokuar ose në të është hapur një kërkesë e sistemit. Provo sërish kur të largohet.
peek-error-input-held = Dikush po mban të shtypur taste ose butona të miut. Provo sërish pas pak.
peek-error-input-dropped = Hyrja u ndal sepse kur mbërriti, nën atë pikë ishte diçka tjetër ose fokusi i tastierës ishte diku tjetër
peek-error-not-in-front = Dritarja nuk u soll dot përpara
peek-error-covered = Diçka tjetër e mbulon atë pjesë të dritares
peek-error-outside = { $x }, { $y } është jashtë figurës së dritares, që është { $width } × { $height }
peek-error-nothing-to-capture = Dritarja nuk po shfaq asgjë për t’u kapur
peek-error-window-picture-late = Pamja e dritares nuk u bë gati në kohë
peek-error-screen-picture-late = Pamja e ekranit nuk u bë gati në kohë
peek-error-no-window-id = Asnjë dritare nuk ka id-në { $id }. peek list tregon ato të hapurat.
peek-error-no-window-for-handle = Programi i nisur si { $handle } nuk ka asnjë dritare të hapur
peek-error-ended-before-window = Programi përfundoi para se të hapte një dritare
peek-error-no-window-in-time = Asnjë dritare nuk u hap brenda { $duration }
peek-error-launch-not-started-by-peek = Mund të niset vetëm një program që e ka nisur vetë peek run
peek-error-ended-while-starting = Programi përfundoi ndërsa po nisej
peek-error-launch-failed = systemd nuk e nisi dot { $program }
peek-error-unknown-handle = Asgjë që ke nisur me peek run nuk ka identifikuesin { $handle }, ose është mbyllur
peek-error-unknown-key = { $key } nuk është tast që peek e njeh
peek-error-unknown-modifier = { $modifier } nuk është modifikues. Përdor ctrl, shift, alt ose super.
peek-error-display-owner = Ky ekran i përket një programi tjetër
peek-error-display-run = Programet në një ekran të fshehur nisen nga peek run
peek-error-display-handle = Ky ekran u nis si { $handle }, jo si { $requested }
