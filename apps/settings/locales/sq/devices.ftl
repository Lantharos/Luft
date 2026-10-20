## Displays

settings-display-mirror = Pasqyro ekranet
settings-display-mirror-description = Shfaq të njëjtën pamje në çdo ekran
settings-display-mirrored = Ekranet e pasqyruara
settings-display-display = Ekrani
settings-display-apply-failed = Këto cilësime nuk funksionuan. Provo një konfigurim tjetër.
settings-display-reset = Rivendos
settings-display-apply = Zbato
settings-display-arrangement-main = { $name }, ekrani kryesor
settings-display-use = Përdor këtë ekran
settings-display-main = Ekrani kryesor
settings-display-main-description = Shiriti i detyrave dhe dritaret e reja shfaqen këtu
settings-display-resolution-title = Rezolucioni
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Shpejtësia e rifreskimit
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Shpejtësi rifreskimi e ndryshueshme
settings-display-variable-refresh-description = Lejon ekranin të ndjekë shpejtësinë e kuadrove të lojërave në ekran të plotë për lëvizje më të butë
settings-display-variable-refresh-off = Joaktive
settings-display-variable-refresh-games = Në lojëra
settings-display-variable-refresh-fullscreen = Në të gjitha aplikacionet në ekran të plotë
settings-display-scale = Shkalla
settings-display-scale-description = Zmadhon ose zvogëlon tekstin, aplikacionet dhe gjithçka tjetër
settings-display-orientation = Orientimi
settings-display-orientation-landscape = Horizontal
settings-display-orientation-portrait-right = Vertikal djathtas
settings-display-orientation-portrait-left = Vertikal majtas
settings-display-orientation-landscape-flipped = Horizontal, i përmbysur

## Display brightness

settings-display-brightness = Ndriçimi
settings-display-brightness-label = Ndriçimi: { $name }
settings-display-brightness-unsupported = Aktivizo DDC/CI në menynë e ekranit për ta ndryshuar këtu
settings-display-brightness-unresponsive = Nuk përgjigjet tani, do të provohet sërish së shpejti
settings-display-brightness-external = Ekranet e jashtme
settings-display-brightness-missing-tool = Instalo ddcutil për të ndryshuar ndriçimin e tyre këtu
settings-display-brightness-needs-restart = Rinis për të përfunduar konfigurimin e ndriçimit të tyre
settings-display-brightness-no-access = Dil dhe hyr sërish për të ndryshuar ndriçimin e tyre këtu

## Night light

settings-display-night-light = Drita e natës
settings-display-night-light-description = Ngjyra më të ngrohta në mbrëmje, më të buta për sytë
settings-display-night-light-schedule = Orari
settings-display-night-light-automatic = Nga perëndimi në lindje të diellit
settings-display-night-light-custom = I personalizuar
settings-display-night-light-from = Aktivizohet
settings-display-night-light-to = Çaktivizohet
settings-display-night-light-warmth = Ngrohtësia

## Sound

settings-sound-output = Dalja
settings-sound-input = Hyrja
settings-sound-device = Pajisja
settings-sound-output-device = Pajisja e daljes
settings-sound-input-device = Pajisja e hyrjes
settings-sound-connection = Lidhja
settings-sound-output-connection = Lidhja e daljes
settings-sound-input-connection = Lidhja e hyrjes
settings-sound-volume = Volumi
settings-sound-mute = Hesht: { $name }
settings-sound-unmute = Aktivizo zërin: { $name }
settings-sound-balance = Balanca
settings-sound-balance-center = Në qendër
settings-sound-balance-left = { $share } majtas
settings-sound-balance-right = { $share } djathtas
settings-sound-louder = Lejo mbi 100%
settings-sound-louder-description = Zëri mund të shtrembërohet në volume më të larta
settings-sound-input-level = Niveli i hyrjes
settings-sound-apps = Volumi i aplikacioneve
settings-sound-apps-playing = { $count ->
    [one] { $count } aplikacion po luan zë
   *[other] { $count } aplikacione po luajnë zë
}
settings-sound-app-output = Dalja për { $app }
settings-sound-profiles = Profilet e pajisjeve
settings-sound-profiles-row-description = Zgjidh si përdoret secila pajisje zëri
settings-sound-profiles-description = Si përdoret secila pajisje zëri, p.sh. stereo ose surround
settings-sound-profile-label = Si përdoret { $device }
settings-sound-profile-off = Joaktive

## System sounds

settings-sound-system = Tingujt e sistemit
settings-sound-system-description = Tinguj për njoftimet, pajisjet dhe ngjarje të tjera
settings-sound-system-volume = Volumi i tingujve të sistemit
settings-sound-kind-notifications = Njoftimet
    .description = Heshtin gjatë “Mos shqetëso”, lojërave dhe ndarjes së ekranit
    .preview = Luaj tingullin e njoftimit
settings-sound-kind-devices = Pajisjet dhe karikimi
    .description = Lidhja e një pajisjeje ose karikuesi dhe bateria e ulët
    .preview = Luaj tingullin e pajisjes
settings-sound-kind-volume = Reagimi i volumit
    .description = Një tik kur ndryshon volumin
    .preview = Luaj tikun e volumit
settings-sound-kind-screenshots = Fotot e ekranit
    .description = Një klik shkrepjeje kur ruhet një foto ekrani
    .preview = Luaj shkrepjen
settings-sound-kind-recording = Regjistrimi
    .description = Kur nis dhe ndalon regjistrimi i ekranit, kamera ose diktimi
    .preview = Luaj tingullin e regjistrimit
settings-sound-kind-sign-in = Tingulli i hyrjes
    .description = Kur shfaqet desktopi yt
    .preview = Luaj tingullin e hyrjes
settings-sound-kind-keyboard = Prekjet e tastierës
    .description = Çdo tast i tastierës në ekran
    .preview = Luaj një prekje tastiere

## Power and battery

settings-power-battery = Bateria
settings-power-charging = Po karikohet
settings-power-charging-at = Po karikohet me { $power }
settings-power-charging-until-full = Po karikohet, mbushet për { $time }
settings-power-charging-at-until-full = Po karikohet me { $power }, mbushet për { $time }
settings-power-on-battery = Me bateri
settings-power-on-battery-using = Me bateri, harxhon { $power }
settings-power-time-left = Mbeten rreth { $time }
settings-power-time-left-using = Mbeten rreth { $time }, harxhon { $power }
settings-power-full = Plotësisht e karikuar
settings-power-empty = Bosh
settings-power-not-charging = E lidhur në prizë, nuk po karikohet
settings-power-health = Gjendja e baterisë
settings-power-capacity = { $full } nga { $design } kur ishte e re
settings-power-cycles = { $count ->
    [one] { $cycles } cikël karikimi
   *[other] { $cycles } cikle karikimi
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Shfaq përqindjen
settings-power-show-percentage-description = Shfaq nivelin e baterisë brenda ikonës së baterisë

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = më pak se një minutë
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minutë
   *[other] { $minutes } minuta
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } orë
   *[other] { $hours } orë
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } orë
   *[other] { $hours } orë
} { $minutes ->
    [one] { $minutes } minutë
   *[other] { $minutes } minuta
}
settings-power-never = Kurrë

## Charge limit

settings-power-limit = Kufizo karikimin
settings-power-limit-failed = Kufiri nuk u ndryshua dot. Provo sërish.
settings-power-limit-elsewhere-off = Një aplikacion tjetër e çaktivizoi, kështu që bateria karikohet plotësisht
settings-power-limit-elsewhere-changed = Një aplikacion tjetër e ndryshoi kufirin në { $level }
settings-power-limit-elsewhere-on = Një aplikacion tjetër e ndalon karikimin në { $level }
settings-power-limit-automatic = Kompjuteri vendos vetë kur ta ndalojë karikimin
settings-power-limit-stops-at = Karikimi ndalon në { $level }
settings-power-limit-description = Ndalon karikimin më herët që bateria të zgjasë më shumë
settings-power-limit-description-at = Ndalon në { $level } që bateria të zgjasë më shumë
settings-power-limit-applied = Karikimi ndalon në { $level }
settings-power-limit-applied-description = Caktuar nga një aplikacion tjetër në këtë kompjuter

## Battery-powered devices

settings-power-devices = Pajisjet
settings-power-device-mouse = Miu
settings-power-device-keyboard = Tastiera
settings-power-device-headphones = Kufjet
settings-power-device-speaker = Altoparlanti
settings-power-device-controller = Kontrolluesi
settings-power-device-phone = Telefoni
settings-power-device-tablet = Tableti
settings-power-device-pen = Lapsi
settings-power-device-touchpad = Blloku i prekjes
settings-power-device-other = Pajisja

## Power mode

settings-power-mode = Regjimi i energjisë
settings-power-mode-row = Regjimi
settings-power-profile-saver = Kursim energjie
    .description = Më i ngadaltë dhe harxhon më pak energji
settings-power-profile-balanced = I balancuar
    .description = Performancë dhe harxhim energjie standard
settings-power-profile-performance = Performancë
    .description = Më i shpejtë dhe harxhon më shumë energji
settings-power-limited = Performanca është e kufizuar tani
settings-power-limited-lap = Performanca është e kufizuar sepse kompjuteri është në prehrin tënd
settings-power-limited-hot = Performanca është e kufizuar sepse kompjuteri është shumë i nxehtë
settings-power-limited-lap-hot = Performanca është e kufizuar sepse kompjuteri është në prehrin tënd dhe shumë i nxehtë
settings-power-saver-low-battery = Kursim energjie kur bateria është e ulët
settings-power-saver-low-battery-description = Kalon në kursim energjie kur bateria po mbaron

## Keyboard backlight

settings-power-keyboard = Tastiera
settings-power-backlight = Ndriçimi i tastierës
settings-power-backlight-off = Joaktiv
settings-power-backlight-low = I ulët
settings-power-backlight-medium = Mesatar
settings-power-backlight-high = I lartë

## Screen and sleep

settings-power-screen = Ekrani
settings-power-screen-off = Fik ekranin pas
settings-power-screen-off-description = Kur nuk e ke përdorur kompjuterin për një kohë
settings-power-dim = Errëso kur është joaktiv
settings-power-dim-description = Ul ndriçimin pak para se të fiket ekrani
settings-power-sleep = Gjumi
settings-power-suspend-plugged-in = Vëre në gjumë kur është në prizë
settings-power-suspend-inactive = Vëre në gjumë kur është joaktiv
settings-power-suspend-description = E vë kompjuterin në gjumë pas pak kohe pa përdorim
settings-power-suspend-battery = Vëre në gjumë kur është me bateri
settings-power-button = Butoni i energjisë
settings-power-button-suspend = Gjumë
settings-power-button-hibernate = Përgjumje
settings-power-button-ask = Pyet çfarë të bëjë
settings-power-button-nothing = Mos bëj asgjë
settings-power-long-sleep = Fik pas një gjumi të gjatë
settings-power-long-sleep-description = Në vend që ta lërë baterinë të shkarkohet gjatë gjumit, kompjuteri fiket kur bateria bie ose pas një gjumi të gjatë me bateri. Dritaret e hapura nuk ruhen.
settings-power-long-sleep-failed = Kjo nuk u ndryshua dot. Provo sërish.
settings-power-long-sleep-after = Fik pas
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } orë
   *[other] { $hours } orë
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } ditë
   *[other] { $days } ditë
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } javë
   *[other] { $weeks } javë
}

## Keyboard

settings-keyboard-sources = Burimet e hyrjes
settings-keyboard-sources-description = I pari përdoret si parazgjedhje. Kalo nga njëri te tjetri ndërsa shkruan.
settings-keyboard-source-edit = Redakto në Keys
settings-keyboard-source-up = Lëviz lart
settings-keyboard-source-down = Lëviz poshtë
settings-keyboard-source-remove = Hiq
settings-keyboard-add-source-button = Shto burim hyrjeje
settings-keyboard-own = Skemat dhe metodat e tua të futjes
settings-keyboard-own-layout = Krijo një skemë
settings-keyboard-own-layout-description = Nis nga një skemë dhe ndrysho çfarë shkruajnë tastet e saj
settings-keyboard-own-method = Krijo një metodë futjeje
settings-keyboard-own-method-description = Shndërro atë që shkruan në theks, alfabete të tjera ose fjalë për të zgjedhur
settings-keyboard-own-open = Hap Keys
settings-keyboard-own-open-description = Redakto skemat dhe metodat e futjes që ke krijuar
settings-keyboard-switch-source = Ndërro burimin e hyrjes
settings-keyboard-add-source = Shto një burim hyrjeje
settings-keyboard-add-source-description = Zgjidh skemën e tastierës ose metodën e futjes me të cilën do të shkruash.
settings-keyboard-add-source-search = Kërko gjuhë, skema dhe metoda futjeje
settings-keyboard-input-method = Metodë futjeje
settings-keyboard-add-source-no-match = Asgjë nuk përputhet me “{ $query }”
settings-keyboard-cancel = Anulo
settings-keyboard-add = Shto
settings-keyboard-typing = Shkrimi
settings-keyboard-repeat = Përsëritja e tasteve
settings-keyboard-repeat-description = Kur mban një tast të shtypur, ai shkruhet vazhdimisht
settings-keyboard-repeat-delay = Vonesa para përsëritjes
settings-keyboard-repeat-delay-shorter = Më e shkurtër
settings-keyboard-repeat-delay-longer = Më e gjatë
settings-keyboard-repeat-speed = Shpejtësia e përsëritjes
settings-keyboard-repeat-speed-slower = Më ngadalë
settings-keyboard-repeat-speed-faster = Më shpejt
settings-keyboard-caps-lock = Tasti Caps Lock
settings-keyboard-caps-lock-description = Çfarë ndodh kur e shtyp
settings-keyboard-caps-lock-escape = Escape
settings-keyboard-caps-lock-swap-escape = Ndërro me Escape
settings-keyboard-caps-lock-nothing = Asgjë
settings-keyboard-caps-lock-custom = I personalizuar
settings-keyboard-lock-notices = Shfaq Caps Lock dhe Num Lock
settings-keyboard-lock-notices-description = Shfaqet shkurtimisht në ekran kur njëri prej tyre aktivizohet ose çaktivizohet
settings-keyboard-dictation-on = Aktiv
settings-keyboard-dictation-off = Joaktiv
settings-keyboard-shortcuts-description = Shiko dhe ndrysho shkurtoret ose shto tuat

## Copilot key

settings-keyboard-copilot = Tasti Copilot
settings-keyboard-copilot-press = Shtypja
settings-keyboard-copilot-press-description = Çfarë bën një shtypje e shpejtë e tastit
settings-keyboard-copilot-open-start = Hap Fillimin
settings-keyboard-copilot-open-app = Hap një aplikacion
settings-keyboard-copilot-nothing = Asgjë
settings-keyboard-copilot-app = Aplikacioni
settings-keyboard-copilot-no-app = Ende nuk është zgjedhur asnjë aplikacion
settings-keyboard-copilot-change = Ndrysho
settings-keyboard-copilot-choose = Zgjidh
settings-keyboard-copilot-hold = Mbaje për të diktuar
settings-keyboard-copilot-hold-description = Mbaje tastin dhe fol për të shkruar atë që thua
settings-keyboard-copilot-hold-off = Funksionon kur diktimi është aktiv
settings-keyboard-copilot-choose-app = Zgjidh një aplikacion
settings-keyboard-copilot-choose-app-description = Shtypja e tastit Copilot e hap atë.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Hapësirë
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menyja
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Rrit volumin
settings-keys-volume-down = Ul volumin
settings-keys-mute = Hesht
settings-keys-microphone-mute = Hesht mikrofonin
settings-keys-play = Luaj
settings-keys-media-pause = Pauzë
settings-keys-stop = Ndalo
settings-keys-next-track = Pjesa tjetër
settings-keys-previous-track = Pjesa e mëparshme
settings-keys-brightness-up = Rrit ndriçimin
settings-keys-brightness-down = Ul ndriçimin
settings-keys-browser = Shfletuesi
settings-keys-home-page = Faqja kryesore
settings-keys-search = Kërko
settings-keys-mail = Posta
settings-keys-calculator = Makina llogaritëse
settings-keys-files = Skedarët
settings-keys-eject = Nxirr
settings-keys-power = Energjia
settings-keys-lock = Blloko

## Keyboard shortcuts

settings-shortcuts-title = Shkurtoret e tastierës
settings-shortcuts-search = Kërko shkurtore
settings-shortcuts-category-system = Sistemi
settings-shortcuts-category-windows = Dritaret
settings-shortcuts-category-workspaces = Hapësirat e punës
settings-shortcuts-category-screenshots = Fotot e ekranit
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Rivendos parazgjedhjen
settings-shortcuts-apps = Shkurtoret e aplikacioneve
settings-shortcuts-apps-description = Ato që kanë kërkuar aplikacionet, që funksionojnë edhe kur aplikacioni nuk është përpara
settings-shortcuts-no-match = Asnjë shkurtore nuk përputhet me “{ $query }”
settings-shortcuts-change = Ndrysho shkurtoren për { $name }
settings-shortcuts-or = ose
settings-shortcuts-not-set = E pacaktuar
settings-shortcuts-press-keys = Shtyp tastet që dëshiron
settings-shortcuts-needs-modifier = Shto Ctrl, Alt ose Super, që shkurtorja të mos pengojë shkrimin.
settings-shortcuts-record-description = Shtyp shkurtoren e re. Backspace e çaktivizon, Escape anulon.
settings-shortcuts-record-taken = Kjo shkurtore përdoret tashmë për “{ $name }”. Nëse e zëvendëson, atje çaktivizohet.
settings-shortcuts-try-another = Provo një tjetër
settings-shortcuts-replace = Zëvendëso
settings-shortcuts-cancel = Anulo
settings-shortcuts-custom = Shkurtore të personalizuara
settings-shortcuts-custom-description = Ekzekuto një komandë ose hap një aplikacion me një kombinim tastesh
settings-shortcuts-untitled = Pa titull
settings-shortcuts-add = Shto shkurtore
settings-shortcuts-edit = Redakto shkurtoren
settings-shortcuts-custom-name = Emri
settings-shortcuts-custom-command = Komanda
settings-shortcuts-custom-shortcut = Shkurtorja
settings-shortcuts-custom-taken = Përdoret tashmë për “{ $name }”. Nëse e ruan, atje çaktivizohet.
settings-shortcuts-remove = Hiq
settings-shortcuts-save = Ruaj
settings-shortcuts-add-button = Shto

## Dictation

settings-dictation-title = Diktimi
settings-dictation-description = Mbaj { $keys } dhe fol për të shkruar atë që thua, në çdo aplikacion. Lësho për të përfunduar ose shtyp Escape për të anuluar. Gjithçka ndodh në këtë kompjuter: zëri yt nuk largohet kurrë prej tij dhe nuk ruhet.
settings-dictation-description-no-shortcut = Zgjidh më poshtë një shkurtore për të diktuar. Gjithçka ndodh në këtë kompjuter: zëri yt nuk largohet kurrë prej tij dhe nuk ruhet.
settings-dictation-not-installed = Diktimi nuk është instaluar në këtë kompjuter
settings-dictation-hold = Mbaj { $keys } për të diktuar
settings-dictation-needs-shortcut = Joaktiv derisa të ketë një shkurtore
settings-dictation-copilot-key = tastin Copilot
settings-dictation-shortcut = Shkurtorja
settings-dictation-shortcut-description = Mbaje për të folur, ose shtype për të dëgjuar derisa ta shtypësh sërish ose të ndalosh së foluri
settings-dictation-shortcut-own = Shkurtorja ime
settings-dictation-shortcut-another = Një shkurtore tjetër…
settings-dictation-shortcut-off = Joaktiv
settings-dictation-keys = Tastet
settings-dictation-change = Ndrysho
settings-dictation-language = Gjuha
settings-dictation-language-automatic = Automatike
settings-dictation-language-automatic-current = Automatike ({ $language })
settings-dictation-language-description = Automatikja ndjek skemën e tastierës me të cilën shkruan
settings-dictation-language-unavailable = { $language } nuk është e disponueshme në këtë kompjuter
settings-dictation-engine = Njohësi i të folurit
settings-dictation-engine-automatic = Automatik
settings-dictation-engine-description = { $engine } njeh gjuhën { $language }
settings-dictation-engine-graphics-card = { $engine } njeh gjuhën { $language } në kartën grafike
settings-dictation-models = Modelet e të folurit
settings-dictation-models-description = Modelet shkarkohen një herë dhe mbahen në këtë kompjuter.
settings-dictation-credits = Meritat
settings-dictation-credit = { $credit }. Licencuar sipas { $licence }.
settings-dictation-learn-more = Mëso më shumë

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Shkarkimi dështoi: { $reason }
settings-dictation-model-downloading = { $received } nga { $total }
settings-dictation-model-installed = { $size } në këtë kompjuter
settings-dictation-model-partial = { $received } nga { $total } të shkarkuara
settings-dictation-model-size = { $size } për t’u shkarkuar
settings-dictation-model-retry = Provo sërish
settings-dictation-model-cancel = Anulo
settings-dictation-model-resume = Vazhdo
settings-dictation-model-download = Shkarko
settings-dictation-model-remove = Hiq

## Mouse and touchpad

settings-mouse-mouse = Miu
settings-mouse-primary-button = Butoni kryesor
settings-mouse-primary-button-description = Butoni që klikon për të përzgjedhur
settings-mouse-primary-button-left = Majtas
settings-mouse-primary-button-right = Djathtas
settings-mouse-speed = Shpejtësia e treguesit
settings-mouse-slower = Më ngadalë
settings-mouse-faster = Më shpejt
settings-mouse-acceleration = Përshpejtimi i miut
settings-mouse-acceleration-description = Treguesi shkon më larg kur e lëviz miun shpejt
settings-mouse-natural-scrolling = Rrëshqitje natyrale
settings-mouse-natural-scrolling-description = Rrëshqitja lëviz përmbajtjen në vend të pamjes
settings-mouse-touchpad = Blloku i prekjes
settings-mouse-touchpad-speed = Shpejtësia e treguesit të bllokut të prekjes
settings-mouse-touchpad-scroll-speed = Shpejtësia e rrëshqitjes
settings-mouse-touchpad-scroll-speed-label = Shpejtësia e rrëshqitjes së bllokut të prekjes
settings-mouse-touchpad-tap = Trokit për të klikuar
settings-mouse-touchpad-tap-description = Trokit mbi bllokun e prekjes në vend që ta shtypësh
settings-mouse-touchpad-natural-scrolling = Rrëshqitje natyrale në bllokun e prekjes
settings-mouse-touchpad-natural-scrolling-description = Përmbajtja lëviz në të njëjtin drejtim si gishtat
settings-mouse-touchpad-scroll-with = Rrëshqit me
settings-mouse-touchpad-two-fingers = Dy gishta
settings-mouse-touchpad-scroll-edge = Buza
settings-mouse-touchpad-secondary-click = Klikimi dytësor
settings-mouse-touchpad-secondary-click-description = Si të klikosh me të djathtën pa një buton të veçantë
settings-mouse-touchpad-click-corner = Këndi
settings-mouse-touchpad-disable-typing = Çaktivizo gjatë shkrimit
settings-mouse-touchpad-disable-typing-description = Që treguesi të mos kërcejë ndërsa shkruan
