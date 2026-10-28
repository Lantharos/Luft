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

## Quick settings tiles

auto-rotate-title = Rrotullim automatik
dark-style-title = Regjimi i errët
do-not-disturb-title = Mos shqetëso
night-light-title = Drita e natës
airplane-mode-title = Regjimi i aeroplanit

## Power mode

power-profile-title = Regjimi i energjisë
power-profile-header = Regjimi i energjisë
power-profile-open-menu = Hap menynë e regjimeve të energjisë
power-profile-settings = Cilësimet e energjisë
power-profile-performance = Performancë
power-profile-balanced = I balancuar
power-profile-power-saver = Kursim energjie
power-profile-custom = I personalizuar

## Keep awake

caffeine-title = Mbaje zgjuar
caffeine-open-menu = Hap menynë “Mbaje zgjuar”
caffeine-until = Deri në { $time }
caffeine-until-turned-off = Derisa ta çaktivizosh
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 orë
caffeine-2-hours = 2 orë
caffeine-inhibit-reason = Mbajtur zgjuar nga cilësimet e shpejta

## Brightness

brightness-title = Ndriçimi
brightness-open-menu = Hap menynë e ndriçimit

## Keyboard backlight

backlight-title = Ndriçimi i tastierës
backlight-open-menu = Hap menynë e ndriçimit të tastierës
backlight-slider = Ndriçimi i tastierës
backlight-off = Joaktiv
backlight-low = I ulët
backlight-high = I lartë

## Sound

volume-sound-settings = Cilësimet e zërit
volume-mute = Hesht
volume-unmute = Hiq heshtjen
volume-output-slider = Volumi
volume-output-title = Dalja e zërit
volume-output-open-menu = Hap menynë e daljes së zërit
volume-input-slider = Mikrofoni
volume-input-title = Hyrja e zërit
volume-input-open-menu = Hap menynë e hyrjes së zërit

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Hap menynë e Bluetooth
bluetooth-settings = Cilësimet e Bluetooth
bluetooth-connect = Lidhu
bluetooth-disconnect = Shkëputu
bluetooth-connect-device = Lidhu me { $deviceName }
bluetooth-disconnect-device = Shkëput { $deviceName }
bluetooth-no-devices = Nuk ka pajisje të disponueshme ose të lidhura
bluetooth-turn-on-hint = Aktivizo Bluetooth për t’u lidhur me pajisje
bluetooth-connected-count = { $count ->
    [one] { $count } e lidhur
   *[other] { $count } të lidhura
}

## Network menus in quick settings

network-menu-unknown-network = <i panjohur>
network-menu-connect = Lidhu
network-menu-disconnect = Shkëputu
network-menu-connect-to = Lidhu me { $name }
network-menu-disconnect-from = Shkëput { $name }
network-menu-turn-off = Çaktivizo
network-menu-wifi-network = { $secure ->
    [yes] { $name }, i sigurt, fuqia e sinjalit { $strength }%
   *[no] { $name }, jo i sigurt, fuqia e sinjalit { $strength }%
}
network-menu-hotspot = Pika e nxehtë e { $name }
network-menu-connected-count = { $count ->
    [one] { $count } e lidhur
   *[other] { $count } të lidhura
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Hap menynë VPN
network-menu-vpn-settings = Cilësimet e VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Hap menynë Wi-Fi
network-menu-wifi-settings = Të gjitha rrjetet
network-menu-wired = Lidhjet me kabllo
network-menu-wired-open-menu = Hap menynë e lidhjeve me kabllo
network-menu-wired-settings = Cilësimet me kabllo
network-menu-tethers = Internet nga telefoni me Bluetooth
network-menu-tethers-open-menu = Hap menynë e internetit nga telefoni
network-menu-tether = Telefoni
network-menu-tether-settings = Cilësimet e Bluetooth
network-menu-mobile-connections = Lidhjet celulare
network-menu-mobile-open-menu = Hap menynë e lidhjeve celulare
network-menu-mobile-settings = Cilësimet e internetit celular
network-menu-mobile = Celular
network-device-wired = Me kabllo
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Hyr në rrjet
network-menu-failed-title = Lidhja dështoi
network-menu-failed-body = Aktivizimi i lidhjes së rrjetit dështoi

## Location access dialog

location-dialog-title = Lejo qasjen në vendndodhje
location-dialog-description = Aplikacioni { $appName } kërkon qasje në vendndodhjen tënde
location-dialog-info = Qasjen në vendndodhje mund ta ndryshosh kurdo te cilësimet e privatësisë
location-dialog-deny = Refuzo qasjen
location-dialog-grant = Jep qasje

## Thunderbolt notifications

thunderbolt-unknown-title = Pajisje Thunderbolt e panjohur
thunderbolt-unknown-body = U zbulua një pajisje e re ndërsa ishe larg. Shkëpute dhe lidhe sërish pajisjen për të nisur ta përdorësh.
thunderbolt-unauthorized-title = Pajisje Thunderbolt e paautorizuar
thunderbolt-unauthorized-body = U zbulua një pajisje e re që duhet autorizuar nga një administrator
thunderbolt-error-title = Gabim në autorizimin e Thunderbolt
thunderbolt-error-body = Pajisja Thunderbolt nuk u autorizua dot: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Refuzo
access-dialog-allow = Lejo

## Display change confirmation

display-change-title = Të mbahen këto cilësime?
display-change-countdown = { $seconds ->
    [one] Ndryshimet kthehen pas { $seconds } sekonde
   *[other] Ndryshimet kthehen pas { $seconds } sekondash
}
display-change-revert = Kthe cilësimet
display-change-keep = Mbaj ndryshimet

## Drive connected notification

autorun-connected = “{ $driveName }” u lidh
autorun-ready = Disku tani mund të përdoret
autorun-open-with = Hap me { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Tastet e ngadalta u aktivizuan
kbd-a11y-slow-keys-off = Tastet e ngadalta u çaktivizuan
kbd-a11y-slow-keys-description = Sapo mbajte të shtypur tastin Shift për 8 sekonda. Kjo është shkurtorja për tastet e ngadalta, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-sticky-keys-on = Tastet ngjitëse u aktivizuan
kbd-a11y-sticky-keys-off = Tastet ngjitëse u çaktivizuan
kbd-a11y-sticky-keys-on-description = Sapo shtype tastin Shift 5 herë radhazi. Kjo është shkurtorja për tastet ngjitëse, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-sticky-keys-off-description = Sapo shtype dy taste njëherësh ose shtype tastin Shift 5 herë radhazi. Kjo çaktivizon tastet ngjitëse, që ndryshojnë mënyrën si funksionon tastiera jote.
kbd-a11y-leave-on = Lëri aktive
kbd-a11y-turn-on = Aktivizo
kbd-a11y-turn-off = Çaktivizo
kbd-a11y-leave-off = Lëri joaktive

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Zgjidh pajisjen audio
audio-device-cancel = Anulo
audio-device-sound-settings = Cilësimet e zërit
audio-device-headphones = Kufje
audio-device-headset = Kufje me mikrofon
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Lejo çaktivizimin e shkurtoreve
inhibit-shortcuts-app = Aplikacioni { $appName } kërkon të çaktivizojë shkurtoret
inhibit-shortcuts-unknown-app = Një aplikacion kërkon të çaktivizojë shkurtoret
inhibit-shortcuts-restore = Mund t’i rikthesh shkurtoret duke shtypur { $shortcut }
inhibit-shortcuts-deny = Refuzo
inhibit-shortcuts-allow = Lejo

## Unlocking encrypted drives

mount-hidden-volume = Vëllim i fshehur
mount-windows-system-volume = Vëllim sistemi Windows
mount-uses-keyfiles = Përdor skedarë çelësash
mount-keyfiles-use-app = Për të zhbllokuar një vëllim që përdor skedarë çelësash, përdor <i>{ $appName }</i>
mount-keyfiles-need-app = Të duhet një mjet i jashtëm si <i>Disqet</i> për të zhbllokuar një vëllim që përdor skedarë çelësash
mount-pim-number = Numri PIM
mount-pim-invalid = PIM duhet të jetë numër ose bosh
mount-password = Fjalëkalimi
mount-remember-password = Mbaj mend fjalëkalimin
mount-cancel = Anulo
mount-unlock = Zhblloko
mount-open-app = Hap { $appName }
mount-wrong-password = Na vjen keq, nuk funksionoi. Provo sërish.
mount-unlock-failed = Vëllimi nuk u zhbllokua dot
mount-pim-unsupported = Versioni i instaluar i udisks nuk e mbështet cilësimin PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Kërkohet vërtetimi
network-agent-wifi-rejected = Fjalëkalimi i ruajtur për “{ $networkName }” nuk funksionoi. Shkruaje sërish.
network-agent-wifi-secrets = Duhen fjalëkalime ose çelësa enkriptimi për t’u lidhur me rrjetin pa tel “{ $networkName }”
network-agent-wps-hint = Ose mund të lidhesh duke shtypur butonin “WPS” në ruter
network-agent-wired-title = Vërtetimi 802.1X me kabllo
network-agent-dsl-title = Vërtetimi DSL
network-agent-pin-title = Kërkohet kodi PIN
network-agent-pin-body = Pajisja e internetit celular kërkon kodin PIN
network-agent-vpn-title = Fjalëkalimi i VPN
network-agent-password-required = Duhet një fjalëkalim për t’u lidhur me “{ $networkName }”
network-agent-connect = Lidhu
network-agent-cancel = Anulo
network-agent-password = Fjalëkalimi
network-agent-username = Emri i përdoruesit
network-agent-key = Çelësi
network-agent-private-key-password = Fjalëkalimi i çelësit privat
network-agent-identity = Identiteti
network-agent-service = Shërbimi
network-agent-network-name = Emri i rrjetit
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Kapja e ekranit
screenshot-area = Zgjedhje zone
screenshot-screen = Zgjedhje ekrani
screenshot-window = Zgjedhje dritareje
screenshot-take = Bëj foto ekrani
screenshot-record = Regjistro ekranin
screenshot-show-pointer = Shfaq treguesin
screenshot-capture = Kap
screenshot-close = Mbyll
screenshot-screencasts-folder = Regjistrimet e ekranit
screenshot-screencast-file = Regjistrim ekrani { $date } { $time }
screenshot-screenshots-folder = Fotot e ekranit
screenshot-file = Foto ekrani { $timestamp }
screenshot-screencast-recorded = Regjistrimi i ekranit u ruajt
screenshot-screencast-start-failed = Regjistrimi i ekranit nuk nisi
screenshot-screencast-out-of-space = Regjistrimi i ekranit dështoi: nuk ka hapësirë në disk
screenshot-screencast-try-again = Regjistrimi i ekranit dështoi, provo sërish
screenshot-screencast-failed = Regjistrimi i ekranit dështoi
screenshot-screencast-view = Kliko këtu për të parë videon
screenshot-show-in-rover = Shfaq në Rover
screenshot-captured = Foto ekrani u bë
screenshot-captured-body = Mund ta ngjitësh imazhin nga kujtesa e fragmenteve

## System updates
updates-available-title = Ka përditësime të sistemit
updates-available-body = Hap Cilësimet për t’i shkarkuar dhe instaluar.
updates-ready-title = Përditësimet janë gati për t’u instaluar
updates-ready-body = Rinis kur të përshtatet për t’i instaluar.
