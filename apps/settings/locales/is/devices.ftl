## Displays

settings-display-mirror = Spegla skjái
settings-display-mirror-description = Sýnir sömu mynd á öllum skjáum
settings-display-mirrored = Speglaðir skjáir
settings-display-display = Skjár
settings-display-apply-failed = Þessar stillingar virkuðu ekki. Prófaðu aðra uppsetningu.
settings-display-reset = Endurstilla
settings-display-apply = Nota
settings-display-arrangement-main = { $name }, aðalskjár
settings-display-use = Nota þennan skjá
settings-display-main = Aðalskjár
settings-display-main-description = Verkstikan og nýir gluggar birtast hér
settings-display-resolution-title = Upplausn
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Endurnýjunartíðni
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Breytileg endurnýjunartíðni
settings-display-variable-refresh-description = Lætur skjáinn fylgja rammatíðni leikja á fullum skjá svo hreyfingar verði mýkri
settings-display-variable-refresh-off = Slökkt
settings-display-variable-refresh-games = Í leikjum
settings-display-variable-refresh-fullscreen = Í öllum forritum á fullum skjá
settings-display-scale = Kvarði
settings-display-scale-description = Stækkar eða minnkar texta, forrit og allt annað
settings-display-orientation = Stefna
settings-display-orientation-landscape = Langsnið
settings-display-orientation-portrait-right = Skammsnið, hægri
settings-display-orientation-portrait-left = Skammsnið, vinstri
settings-display-orientation-landscape-flipped = Langsnið, á hvolfi

## Display brightness

settings-display-brightness = Birta
settings-display-brightness-label = Birta – { $name }
settings-display-brightness-unsupported = Kveiktu á DDC/CI í valmynd skjásins til að breyta birtunni hér
settings-display-brightness-unresponsive = Svarar ekki eins og er, reynir aftur bráðum
settings-display-brightness-external = Ytri skjáir
settings-display-brightness-missing-tool = Settu upp ddcutil til að breyta birtu þeirra hér
settings-display-brightness-needs-restart = Endurræstu til að ljúka uppsetningu á birtu þeirra
settings-display-brightness-no-access = Skráðu þig út og aftur inn til að breyta birtu þeirra hér

## Night light

settings-display-night-light = Næturljós
settings-display-night-light-description = Hlýrri litir á kvöldin, þægilegri fyrir augun
settings-display-night-light-schedule = Tímaáætlun
settings-display-night-light-automatic = Frá sólsetri til sólarupprásar
settings-display-night-light-custom = Sérsniðið
settings-display-night-light-from = Kveikist
settings-display-night-light-to = Slokknar
settings-display-night-light-warmth = Hlýja

## Sound

settings-sound-output = Úttak
settings-sound-input = Inntak
settings-sound-device = Tæki
settings-sound-output-device = Úttakstæki
settings-sound-input-device = Inntakstæki
settings-sound-connection = Tengi
settings-sound-output-connection = Úttakstengi
settings-sound-input-connection = Inntakstengi
settings-sound-volume = Hljóðstyrkur
settings-sound-mute = Þagga: { $name }
settings-sound-unmute = Kveikja á hljóði: { $name }
settings-sound-balance = Jafnvægi
settings-sound-balance-center = Miðja
settings-sound-balance-left = { $share } vinstri
settings-sound-balance-right = { $share } hægri
settings-sound-louder = Leyfa hærra en 100%
settings-sound-louder-description = Hljóð getur bjagast við mikinn hljóðstyrk
settings-sound-input-level = Inntaksstyrkur
settings-sound-apps = Hljóðstyrkur forrita
settings-sound-apps-playing = { $count ->
    [one] { $count } forrit spilar hljóð
   *[other] { $count } forrit spila hljóð
}
settings-sound-app-output = Úttak fyrir { $app }
settings-sound-profiles = Tækjasnið
settings-sound-profiles-row-description = Veldu hvernig hvert hljóðtæki er notað
settings-sound-profiles-description = Hvernig hvert hljóðtæki er notað, eins og víðóma eða umhverfishljóð
settings-sound-profile-label = Snið fyrir { $device }
settings-sound-profile-off = Slökkt

## System sounds

settings-sound-system = Kerfishljóð
settings-sound-system-description = Hljóð fyrir tilkynningar, tæki og aðra atburði
settings-sound-system-volume = Hljóðstyrkur kerfishljóða
settings-sound-kind-notifications = Tilkynningar
    .description = Hljóðlaust í Ekki trufla, leikjum og skjádeilingu
    .preview = Spila tilkynningarhljóðið
settings-sound-kind-devices = Tæki og hleðsla
    .description = Þegar tæki eða hleðslutæki er tengt og þegar rafhlaðan er að tæmast
    .preview = Spila tækjahljóðið
settings-sound-kind-volume = Endurgjöf hljóðstyrks
    .description = Smellur þegar þú breytir hljóðstyrknum
    .preview = Spila smellinn
settings-sound-kind-screenshots = Skjámyndir
    .description = Lokarahljóð þegar skjámynd er vistuð
    .preview = Spila lokarahljóðið
settings-sound-kind-recording = Upptaka
    .description = Þegar skjáupptaka, myndavélin eða raddinnsláttur byrjar og hættir
    .preview = Spila upptökuhljóðið
settings-sound-kind-sign-in = Innskráningarhljóð
    .description = Þegar skjáborðið birtist
    .preview = Spila innskráningarhljóðið
settings-sound-kind-keyboard = Lyklaborðshljóð
    .description = Hver lykill á skjályklaborðinu
    .preview = Spila lyklaborðshljóð

## Power and battery

settings-power-battery = Rafhlaða
settings-power-charging = Í hleðslu
settings-power-charging-at = Í hleðslu, { $power }
settings-power-charging-until-full = Í hleðslu, fullhlaðin eftir { $time }
settings-power-charging-at-until-full = Í hleðslu, { $power }, fullhlaðin eftir { $time }
settings-power-on-battery = Á rafhlöðu
settings-power-on-battery-using = Á rafhlöðu, notar { $power }
settings-power-time-left = Um { $time } eftir
settings-power-time-left-using = Um { $time } eftir, notar { $power }
settings-power-full = Fullhlaðin
settings-power-empty = Tóm
settings-power-not-charging = Í sambandi, ekki í hleðslu
settings-power-health = Ástand rafhlöðu
settings-power-capacity = { $full } af { $design } þegar hún var ný
settings-power-cycles = { $count ->
    [one] { $cycles } hleðslulota
   *[other] { $cycles } hleðslulotur
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Sýna hlutfall
settings-power-show-percentage-description = Sýnir hleðslustöðuna inni í rafhlöðutákninu

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = innan við mínútu
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } mínútu
   *[other] { $minutes } mínútur
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } klukkustund
   *[other] { $hours } klukkustundir
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } klukkustund
   *[other] { $hours } klukkustundir
} { $minutes ->
    [one] { $minutes } mínútu
   *[other] { $minutes } mínútur
}
settings-power-never = Aldrei

## Charge limit

settings-power-limit = Takmarka hleðslu
settings-power-limit-failed = Ekki tókst að breyta mörkunum. Reyndu aftur.
settings-power-limit-elsewhere-off = Annað forrit slökkti á mörkunum, svo rafhlaðan hleðst að fullu
settings-power-limit-elsewhere-changed = Annað forrit breytti mörkunum í { $level }
settings-power-limit-elsewhere-on = Annað forrit stöðvar hleðslu við { $level }
settings-power-limit-automatic = Tölvan ákveður hvenær hleðslu er hætt
settings-power-limit-stops-at = Hleðsla stöðvast við { $level }
settings-power-limit-description = Hættir hleðslu fyrr svo rafhlaðan endist lengur
settings-power-limit-description-at = Hættir við { $level } svo rafhlaðan endist lengur
settings-power-limit-applied = Hleðsla stöðvast við { $level }
settings-power-limit-applied-description = Stillt af öðru forriti á þessari tölvu

## Battery-powered devices

settings-power-devices = Tæki
settings-power-device-mouse = Mús
settings-power-device-keyboard = Lyklaborð
settings-power-device-headphones = Heyrnartól
settings-power-device-speaker = Hátalari
settings-power-device-controller = Leikjastýring
settings-power-device-phone = Sími
settings-power-device-tablet = Spjaldtölva
settings-power-device-pen = Penni
settings-power-device-touchpad = Snertiflötur
settings-power-device-other = Tæki

## Power mode

settings-power-mode = Orkustilling
settings-power-mode-row = Stilling
settings-power-profile-saver = Orkusparnaður
    .description = Hægari og notar minni orku
settings-power-profile-balanced = Jafnvægi
    .description = Venjuleg afköst og orkunotkun
settings-power-profile-performance = Afköst
    .description = Hraðari og notar meiri orku
settings-power-limited = Afköst eru takmörkuð eins og er
settings-power-limited-lap = Afköst eru takmörkuð af því að tölvan er í kjöltunni á þér
settings-power-limited-hot = Afköst eru takmörkuð af því að tölvan er of heit
settings-power-limited-lap-hot = Afköst eru takmörkuð af því að tölvan er í kjöltunni á þér og of heit
settings-power-saver-low-battery = Orkusparnaður þegar rafhlaðan er lág
settings-power-saver-low-battery-description = Skiptir yfir í orkusparnað þegar rafhlaðan er að tæmast
settings-power-saver-level = Hleðsla rafhlöðu fyrir orkusparnað

## Keyboard backlight

settings-power-keyboard = Lyklaborð
settings-power-backlight = Baklýsing lyklaborðs
settings-power-backlight-off = Slökkt
settings-power-backlight-low = Lítil
settings-power-backlight-medium = Miðlungs
settings-power-backlight-high = Mikil

## Screen and sleep

settings-power-screen = Skjár
settings-power-screen-off = Slökkva á skjánum eftir
settings-power-screen-off-description = Þegar tölvan hefur ekki verið notuð um stund
settings-power-dim = Deyfa þegar tölvan er óvirk
settings-power-dim-description = Lækkar birtuna skömmu áður en slokknar á skjánum
settings-power-sleep = Svefn
settings-power-suspend-plugged-in = Svefn þegar tölvan er í sambandi
settings-power-suspend-inactive = Svefn þegar tölvan er óvirk
settings-power-suspend-description = Setur tölvuna í svefn þegar hún hefur ekki verið notuð um stund
settings-power-suspend-battery = Svefn á rafhlöðu
settings-power-button = Aflrofi
settings-power-button-suspend = Svefn
settings-power-button-hibernate = Dvali
settings-power-button-ask = Spyrja hvað skuli gera
settings-power-button-nothing = Gera ekkert
settings-power-long-sleep = Slökkva eftir langan svefn
settings-power-long-sleep-description = Í stað þess að láta rafhlöðuna tæmast í svefni slekkur tölvan á sér þegar rafhlaðan er að tæmast eða eftir langan svefn á rafhlöðu. Opnir gluggar eru ekki geymdir.
settings-power-long-sleep-failed = Ekki tókst að breyta þessu. Reyndu aftur.
settings-power-long-sleep-after = Slökkva eftir
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } klukkustund
   *[other] { $hours } klukkustundir
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } daga
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } viku
   *[other] { $weeks } vikur
}

## Keyboard

settings-keyboard-sources = Inntaksgjafar
settings-keyboard-sources-description = Sá fyrsti er notaður sjálfgefið. Skiptu á milli þeirra á meðan þú skrifar.
settings-keyboard-source-edit = Breyta í Keys
settings-keyboard-source-up = Færa upp
settings-keyboard-source-down = Færa niður
settings-keyboard-source-remove = Fjarlægja
settings-keyboard-add-source-button = Bæta við inntaksgjafa
settings-keyboard-own = Þínar eigin uppsetningar og innsláttaraðferðir
settings-keyboard-own-layout = Búa til uppsetningu
settings-keyboard-own-layout-description = Byrjaðu á uppsetningu og breyttu því sem lyklarnir skrifa
settings-keyboard-own-method = Búa til innsláttaraðferð
settings-keyboard-own-method-description = Breyttu því sem þú skrifar í kommustafi, önnur ritkerfi eða orð til að velja úr
settings-keyboard-own-open = Opna Keys
settings-keyboard-own-open-description = Breyttu uppsetningunum og innsláttaraðferðunum sem þú hefur búið til
settings-keyboard-switch-source = Skipta um inntaksgjafa
settings-keyboard-add-source = Bæta við inntaksgjafa
settings-keyboard-add-source-description = Veldu lyklaborðsuppsetninguna eða innsláttaraðferðina sem þú vilt nota.
settings-keyboard-add-source-search = Leita að tungumálum, uppsetningum og innsláttaraðferðum
settings-keyboard-input-method = Innsláttaraðferð
settings-keyboard-add-source-no-match = Ekkert passar við „{ $query }“
settings-keyboard-cancel = Hætta við
settings-keyboard-add = Bæta við
settings-keyboard-typing = Innsláttur
settings-keyboard-repeat = Endurtaka lykla
settings-keyboard-repeat-description = Ef lykli er haldið niðri er hann sleginn inn aftur og aftur
settings-keyboard-repeat-delay = Bið áður en endurtekning hefst
settings-keyboard-repeat-delay-shorter = Styttri
settings-keyboard-repeat-delay-longer = Lengri
settings-keyboard-repeat-speed = Endurtekningarhraði
settings-keyboard-repeat-speed-slower = Hægari
settings-keyboard-repeat-speed-faster = Hraðari
settings-keyboard-caps-lock = Caps Lock-lykill
settings-keyboard-caps-lock-description = Hvað gerist þegar þú ýtir á hann
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Víxla við Esc
settings-keyboard-caps-lock-nothing = Ekkert
settings-keyboard-caps-lock-custom = Sérsniðið
settings-keyboard-lock-notices = Sýna Caps Lock og Num Lock
settings-keyboard-lock-notices-description = Birtist stuttlega á skjánum þegar kveikt eða slökkt er á öðrum hvorum
settings-keyboard-dictation-on = Kveikt
settings-keyboard-dictation-off = Slökkt
settings-keyboard-shortcuts-description = Skoðaðu og breyttu flýtilyklum eða bættu við þínum eigin

## Copilot key

settings-keyboard-copilot = Copilot-lykill
settings-keyboard-copilot-press = Stutt ýting
settings-keyboard-copilot-press-description = Hvað gerist þegar þú ýtir stutt á lykilinn
settings-keyboard-copilot-open-start = Opna upphafsvalmynd
settings-keyboard-copilot-open-app = Opna forrit
settings-keyboard-copilot-nothing = Ekkert
settings-keyboard-copilot-app = Forrit
settings-keyboard-copilot-no-app = Ekkert forrit valið enn
settings-keyboard-copilot-change = Breyta
settings-keyboard-copilot-choose = Velja
settings-keyboard-copilot-hold = Halda inni fyrir raddinnslátt
settings-keyboard-copilot-hold-description = Haltu lyklinum inni og talaðu til að skrifa það sem þú segir
settings-keyboard-copilot-hold-off = Virkar þegar kveikt er á raddinnslætti
settings-keyboard-copilot-choose-app = Veldu forrit
settings-keyboard-copilot-choose-app-description = Copilot-lykillinn opnar það.

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
settings-keys-space = Bilslá
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Valmynd
settings-keys-keypad = Talnaborð { $key }
settings-keys-volume-up = Hækka hljóð
settings-keys-volume-down = Lækka hljóð
settings-keys-mute = Þagga
settings-keys-microphone-mute = Þagga hljóðnema
settings-keys-play = Spila
settings-keys-media-pause = Hlé
settings-keys-stop = Stöðva
settings-keys-next-track = Næsta lag
settings-keys-previous-track = Fyrra lag
settings-keys-brightness-up = Auka birtu
settings-keys-brightness-down = Minnka birtu
settings-keys-browser = Vafri
settings-keys-home-page = Heimasíða
settings-keys-search = Leit
settings-keys-mail = Póstur
settings-keys-calculator = Reiknivél
settings-keys-files = Skrár
settings-keys-eject = Útkast
settings-keys-power = Afl
settings-keys-lock = Læsa

## Keyboard shortcuts

settings-shortcuts-title = Flýtilyklar
settings-shortcuts-search = Leita að flýtilyklum
settings-shortcuts-category-system = Kerfi
settings-shortcuts-category-windows = Gluggar
settings-shortcuts-category-tiling = Flísar
settings-shortcuts-category-workspaces = Vinnusvæði
settings-shortcuts-category-screenshots = Skjámyndir
settings-shortcuts-category-media = Margmiðlun
settings-shortcuts-reset = Endurstilla á sjálfgefið
settings-shortcuts-apps = Flýtilyklar forrita
settings-shortcuts-apps-description = Flýtilyklar sem forrit báðu um og virka líka þegar forritið er ekki í forgrunni
settings-shortcuts-no-match = Engir flýtilyklar passa við „{ $query }“
settings-shortcuts-change = Breyta flýtilykli fyrir { $name }
settings-shortcuts-or = eða
settings-shortcuts-not-set = Ekki stilltur
settings-shortcuts-press-keys = Ýttu á lyklana sem þú vilt nota
settings-shortcuts-needs-modifier = Bættu við Ctrl, Alt eða Super svo flýtilykillinn trufli ekki innslátt.
settings-shortcuts-record-description = Ýttu á nýja flýtilykilinn. Backspace slekkur á honum, Esc hættir við.
settings-shortcuts-record-taken = Þessi flýtilykill er þegar notaður fyrir „{ $name }“. Ef þú skiptir honum út verður slökkt á honum þar.
settings-shortcuts-try-another = Prófa annan
settings-shortcuts-replace = Skipta út
settings-shortcuts-cancel = Hætta við
settings-shortcuts-custom = Sérsniðnir flýtilyklar
settings-shortcuts-custom-description = Keyrðu skipun eða opnaðu forrit með lyklasamsetningu
settings-shortcuts-untitled = Ónefndur
settings-shortcuts-add = Bæta við flýtilykli
settings-shortcuts-edit = Breyta flýtilykli
settings-shortcuts-custom-name = Heiti
settings-shortcuts-custom-command = Skipun
settings-shortcuts-custom-shortcut = Flýtilykill
settings-shortcuts-custom-taken = Þegar notaður fyrir „{ $name }“. Ef þú vistar verður slökkt á honum þar.
settings-shortcuts-remove = Fjarlægja
settings-shortcuts-save = Vista
settings-shortcuts-add-button = Bæta við

## Dictation

settings-dictation-title = Raddinnsláttur
settings-dictation-description = Haltu { $keys } inni og talaðu til að skrifa það sem þú segir, í hvaða forriti sem er. Slepptu til að ljúka eða ýttu á Esc til að hætta við. Allt gerist á þessari tölvu: röddin þín fer aldrei út úr henni og er ekki vistuð.
settings-dictation-description-no-shortcut = Veldu flýtilykil hér fyrir neðan til að nota raddinnslátt. Allt gerist á þessari tölvu: röddin þín fer aldrei út úr henni og er ekki vistuð.
settings-dictation-not-installed = Raddinnsláttur er ekki uppsettur á þessari tölvu
settings-dictation-hold = Haltu { $keys } inni til að tala inn texta
settings-dictation-needs-shortcut = Slökkt þar til flýtilykill er valinn
settings-dictation-copilot-key = Copilot-lyklinum
settings-dictation-shortcut = Flýtilykill
settings-dictation-shortcut-description = Haltu honum inni til að tala, eða ýttu á hann til að hlusta þar til þú ýtir aftur eða hættir að tala
settings-dictation-shortcut-own = Eigin flýtilykill
settings-dictation-shortcut-another = Annar flýtilykill…
settings-dictation-shortcut-off = Slökkt
settings-dictation-keys = Lyklar
settings-dictation-change = Breyta
settings-dictation-language = Tungumál
settings-dictation-language-automatic = Sjálfvirkt
settings-dictation-language-automatic-current = Sjálfvirkt ({ $language })
settings-dictation-language-description = Sjálfvirkt fylgir lyklaborðsuppsetningunni sem þú skrifar með
settings-dictation-language-unavailable = Tungumálið { $language } er ekki í boði á þessari tölvu
settings-dictation-engine = Talgreinir
settings-dictation-engine-automatic = Sjálfvirkt
settings-dictation-engine-description = Talgreining með { $engine } – { $language }
settings-dictation-engine-graphics-card = Talgreining með { $engine } á skjákortinu – { $language }
settings-dictation-models = Talmálslíkön
settings-dictation-models-description = Líkön eru sótt einu sinni og geymd á þessari tölvu.
settings-dictation-credits = Höfundar
settings-dictation-credit = { $credit }. Leyfi: { $licence }.
settings-dictation-learn-more = Nánar

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Ekki tókst að sækja: { $reason }
settings-dictation-model-downloading = { $received } af { $total }
settings-dictation-model-installed = { $size } á þessari tölvu
settings-dictation-model-partial = { $received } af { $total } sótt
settings-dictation-model-size = Niðurhal: { $size }
settings-dictation-model-retry = Reyna aftur
settings-dictation-model-cancel = Hætta við
settings-dictation-model-resume = Halda áfram
settings-dictation-model-download = Sækja
settings-dictation-model-remove = Fjarlægja

## Mouse and touchpad

settings-mouse-mouse = Mús
settings-mouse-primary-button = Aðalhnappur
settings-mouse-primary-button-description = Hnappurinn sem þú smellir á til að velja
settings-mouse-primary-button-left = Vinstri
settings-mouse-primary-button-right = Hægri
settings-mouse-speed = Hraði bendils
settings-mouse-slower = Hægari
settings-mouse-faster = Hraðari
settings-mouse-acceleration = Hröðun músar
settings-mouse-acceleration-description = Bendillinn fer lengra þegar þú hreyfir músina hratt
settings-mouse-natural-scrolling = Náttúrulegt skrun
settings-mouse-natural-scrolling-description = Skrun færir efnið í stað sýnarinnar
settings-mouse-touchpad = Snertiflötur
settings-mouse-touchpad-speed = Hraði bendils á snertifleti
settings-mouse-touchpad-scroll-speed = Skrunhraði
settings-mouse-touchpad-scroll-speed-label = Skrunhraði snertiflatar
settings-mouse-touchpad-tap = Snerta til að smella
settings-mouse-touchpad-tap-description = Snertu snertiflötinn í stað þess að þrýsta honum niður
settings-mouse-touchpad-natural-scrolling = Náttúrulegt skrun á snertifleti
settings-mouse-touchpad-natural-scrolling-description = Efnið færist í sömu átt og fingurnir
settings-mouse-touchpad-scroll-with = Skruna með
settings-mouse-touchpad-two-fingers = Tveir fingur
settings-mouse-touchpad-scroll-edge = Brún
settings-mouse-touchpad-secondary-click = Aukasmellur
settings-mouse-touchpad-secondary-click-description = Hvernig á að hægrismella án sérstaks hnapps
settings-mouse-touchpad-click-corner = Horn
settings-mouse-touchpad-disable-typing = Óvirkt við innslátt
settings-mouse-touchpad-disable-typing-description = Svo bendillinn hoppi ekki til á meðan þú skrifar
