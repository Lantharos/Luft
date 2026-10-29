## Displays

settings-display-mirror = Dubliuoti ekranus
settings-display-mirror-description = Visuose ekranuose rodomas tas pats vaizdas
settings-display-mirrored = Dubliuojami ekranai
settings-display-display = Ekranas
settings-display-apply-failed = Šie nustatymai netiko. Pabandykite kitą sąranką.
settings-display-reset = Atkurti
settings-display-apply = Taikyti
settings-display-arrangement-main = { $name }, pagrindinis ekranas
settings-display-use = Naudoti šį ekraną
settings-display-main = Pagrindinis ekranas
settings-display-main-description = Čia rodoma užduočių juosta ir atsiranda nauji langai
settings-display-resolution-title = Skyra
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Atnaujinimo dažnis
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Kintamas atnaujinimo dažnis
settings-display-variable-refresh-description = Ekranas prisitaiko prie viso ekrano žaidimų kadrų dažnio, todėl judesys sklandesnis
settings-display-variable-refresh-off = Išjungta
settings-display-variable-refresh-games = Žaidimuose
settings-display-variable-refresh-fullscreen = Visose viso ekrano programose
settings-display-scale = Mastelis
settings-display-scale-description = Padidina arba sumažina tekstą, programas ir visa kita
settings-display-orientation = Padėtis
settings-display-orientation-landscape = Gulsčia
settings-display-orientation-portrait-right = Stačia, pasukta į dešinę
settings-display-orientation-portrait-left = Stačia, pasukta į kairę
settings-display-orientation-landscape-flipped = Gulsčia, apversta

## Display brightness

settings-display-brightness = Šviesumas
settings-display-brightness-label = { $name } šviesumas
settings-display-brightness-unsupported = Kad galėtumėte jį keisti čia, ekrano meniu įjunkite DDC/CI
settings-display-brightness-unresponsive = Šiuo metu neatsako, netrukus bus bandoma dar kartą
settings-display-brightness-external = Išoriniai monitoriai
settings-display-brightness-missing-tool = Kad galėtumėte keisti jų šviesumą čia, įdiekite ddcutil
settings-display-brightness-needs-restart = Paleiskite iš naujo, kad būtų baigtas jų šviesumo nustatymas
settings-display-brightness-no-access = Kad galėtumėte keisti jų šviesumą čia, atsijunkite ir vėl prisijunkite

## Night light

settings-display-night-light = Naktinė šviesa
settings-display-night-light-description = Vakare šiltesnės spalvos, kurios mažiau vargina akis
settings-display-night-light-schedule = Tvarkaraštis
settings-display-night-light-automatic = Nuo saulėlydžio iki saulėtekio
settings-display-night-light-custom = Pasirinktinis
settings-display-night-light-from = Įjungiama
settings-display-night-light-to = Išjungiama
settings-display-night-light-warmth = Šiltumas

## Sound

settings-sound-output = Išvestis
settings-sound-input = Įvestis
settings-sound-device = Įrenginys
settings-sound-output-device = Išvesties įrenginys
settings-sound-input-device = Įvesties įrenginys
settings-sound-connection = Jungtis
settings-sound-output-connection = Išvesties jungtis
settings-sound-input-connection = Įvesties jungtis
settings-sound-volume = Garsumas
settings-sound-mute = Nutildyti: { $name }
settings-sound-unmute = Įjungti garsą: { $name }
settings-sound-balance = Balansas
settings-sound-balance-center = Centre
settings-sound-balance-left = Kairėn { $share }
settings-sound-balance-right = Dešinėn { $share }
settings-sound-louder = Leisti garsiau nei 100 %
settings-sound-louder-description = Didesniu garsumu garsas gali būti iškraipytas
settings-sound-input-level = Įvesties lygis
settings-sound-apps = Programų garsumas
settings-sound-apps-playing = { $count ->
    [one] { $count } programa leidžia garsą
    [few] { $count } programos leidžia garsą
    [many] { $count } programos leidžia garsą
   *[other] { $count } programų leidžia garsą
}
settings-sound-app-output = Kur leisti programos { $app } garsą
settings-sound-profiles = Įrenginių profiliai
settings-sound-profiles-row-description = Pasirinkite, kaip naudojamas kiekvienas garso įrenginys
settings-sound-profiles-description = Kaip naudojamas kiekvienas garso įrenginys, pvz., stereo ar erdvinis garsas
settings-sound-profile-label = Kaip naudojamas įrenginys { $device }
settings-sound-profile-off = Išjungtas

## System sounds

settings-sound-system = Sistemos garsai
settings-sound-system-description = Pranešimų, įrenginių ir kitų įvykių garsai
settings-sound-system-volume = Sistemos garsų garsumas
settings-sound-kind-notifications = Pranešimai
    .description = Nutyla, kai įjungta Netrukdyti, žaidžiama ar bendrinamas ekranas
    .preview = Paleisti pranešimo garsą
settings-sound-kind-devices = Įrenginiai ir įkrovimas
    .description = Prijungus įrenginį ar įkroviklį ir kai akumuliatorius beveik išsikrovęs
    .preview = Paleisti įrenginio garsą
settings-sound-kind-volume = Garsumo keitimo garsas
    .description = Spragtelėjimas keičiant garsumą
    .preview = Paleisti garsumo spragtelėjimą
settings-sound-kind-screenshots = Ekrano kopijos
    .description = Užrakto spragtelėjimas įrašius ekrano kopiją
    .preview = Paleisti užrakto garsą
settings-sound-kind-recording = Įrašymas
    .description = Kai pradedamas ir baigiamas ekrano įrašas, kameros naudojimas ar diktavimas
    .preview = Paleisti įrašymo garsą
settings-sound-kind-sign-in = Prisijungimo garsas
    .description = Kai atsiranda darbalaukis
    .preview = Paleisti prisijungimo garsą
settings-sound-kind-keyboard = Klavišų paspaudimai
    .description = Kiekvienas ekrano klaviatūros klavišas
    .preview = Paleisti klavišo paspaudimo garsą

## Power and battery

settings-power-battery = Akumuliatorius
settings-power-charging = Įkraunama
settings-power-charging-at = Įkraunama, galia { $power }
settings-power-charging-until-full = Įkraunama, iki visiško įkrovimo liko { $time }
settings-power-charging-at-until-full = Įkraunama, galia { $power }, iki visiško įkrovimo liko { $time }
settings-power-on-battery = Maitinama iš akumuliatoriaus
settings-power-on-battery-using = Maitinama iš akumuliatoriaus, naudojama { $power }
settings-power-time-left = Liko maždaug { $time }
settings-power-time-left-using = Liko maždaug { $time }, naudojama { $power }
settings-power-full = Visiškai įkrautas
settings-power-empty = Išsikrovęs
settings-power-not-charging = Prijungtas prie maitinimo, neįkraunamas
settings-power-health = Akumuliatoriaus būklė
settings-power-capacity = { $full } iš pradinių { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } įkrovimo ciklas
    [few] { $cycles } įkrovimo ciklai
    [many] { $cycles } įkrovimo ciklo
   *[other] { $cycles } įkrovimo ciklų
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Rodyti procentus
settings-power-show-percentage-description = Akumuliatoriaus įkrovos lygis rodomas akumuliatoriaus piktogramoje

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mažiau nei minutė
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minutė
    [few] { $minutes } minutės
    [many] { $minutes } minutės
   *[other] { $minutes } minučių
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } valanda
    [few] { $hours } valandos
    [many] { $hours } valandos
   *[other] { $hours } valandų
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } valanda
    [few] { $hours } valandos
    [many] { $hours } valandos
   *[other] { $hours } valandų
} { $minutes ->
    [one] { $minutes } minutė
    [few] { $minutes } minutės
    [many] { $minutes } minutės
   *[other] { $minutes } minučių
}
settings-power-never = Niekada

## Charge limit

settings-power-limit = Riboti įkrovimą
settings-power-limit-failed = Nepavyko pakeisti ribos. Bandykite dar kartą.
settings-power-limit-elsewhere-off = Kita programa ją išjungė, todėl akumuliatorius įkraunamas visiškai
settings-power-limit-elsewhere-changed = Kita programa pakeitė ribą į { $level }
settings-power-limit-elsewhere-on = Kita programa sustabdo įkrovimą ties { $level }
settings-power-limit-automatic = Kada nustoti įkrauti, sprendžia kompiuteris
settings-power-limit-stops-at = Įkrovimas sustabdomas ties { $level }
settings-power-limit-description = Įkrovimas sustabdomas anksčiau, kad akumuliatorius tarnautų ilgiau
settings-power-limit-description-at = Sustabdoma ties { $level }, kad akumuliatorius tarnautų ilgiau
settings-power-limit-applied = Įkrovimas sustabdomas ties { $level }
settings-power-limit-applied-description = Nustatė kita šio kompiuterio programa

## Battery-powered devices

settings-power-devices = Įrenginiai
settings-power-device-mouse = Pelė
settings-power-device-keyboard = Klaviatūra
settings-power-device-headphones = Ausinės
settings-power-device-speaker = Garsiakalbis
settings-power-device-controller = Žaidimų valdiklis
settings-power-device-phone = Telefonas
settings-power-device-tablet = Planšetinis kompiuteris
settings-power-device-pen = Rašiklis
settings-power-device-touchpad = Jutiklinis kilimėlis
settings-power-device-other = Įrenginys

## Power mode

settings-power-mode = Maitinimo režimas
settings-power-mode-row = Režimas
settings-power-profile-saver = Energijos taupymas
    .description = Lėčiau, bet naudojama mažiau energijos
settings-power-profile-balanced = Subalansuotas
    .description = Įprastas našumas ir energijos naudojimas
settings-power-profile-performance = Našumas
    .description = Greičiau, bet naudojama daugiau energijos
settings-power-limited = Šiuo metu našumas ribojamas
settings-power-limited-lap = Našumas ribojamas, nes kompiuteris laikomas ant kelių
settings-power-limited-hot = Našumas ribojamas, nes kompiuteris per daug įkaito
settings-power-limited-lap-hot = Našumas ribojamas, nes kompiuteris laikomas ant kelių ir per daug įkaito
settings-power-saver-low-battery = Energijos taupymas, kai akumuliatorius senka
settings-power-saver-low-battery-description = Įjungia energijos taupymą, kai akumuliatorius beveik išsikrauna
settings-power-saver-level = Akumuliatoriaus lygis energijos taupymui

## Keyboard backlight

settings-power-keyboard = Klaviatūra
settings-power-backlight = Klaviatūros apšvietimas
settings-power-backlight-off = Išjungtas
settings-power-backlight-low = Silpnas
settings-power-backlight-medium = Vidutinis
settings-power-backlight-high = Stiprus

## Screen and sleep

settings-power-screen = Ekranas
settings-power-screen-off = Laikas iki ekrano išjungimo
settings-power-screen-off-description = Kai kompiuteris kurį laiką nenaudojamas
settings-power-dim = Pritemdyti, kai neaktyvus
settings-power-dim-description = Sumažina šviesumą prieš pat išjungiant ekraną
settings-power-sleep = Miego režimas
settings-power-suspend-plugged-in = Miego režimas, kai prijungtas prie maitinimo
settings-power-suspend-inactive = Miego režimas, kai neaktyvus
settings-power-suspend-description = Kompiuteris pereina į miego režimą, kai kurį laiką nenaudojamas
settings-power-suspend-battery = Miego režimas, kai maitinama iš akumuliatoriaus
settings-power-button = Maitinimo mygtukas
settings-power-button-suspend = Miego režimas
settings-power-button-hibernate = Užmigdyti
settings-power-button-ask = Klausti, ką daryti
settings-power-button-nothing = Nieko nedaryti
settings-power-long-sleep = Išjungti po ilgo miego
settings-power-long-sleep-description = Kad akumuliatorius miegant visiškai neišsikrautų, kompiuteris išsijungia, kai akumuliatorius senka arba po ilgo miego naudojant akumuliatorių. Atidaryti langai neišlieka.
settings-power-long-sleep-failed = Nepavyko to pakeisti. Bandykite dar kartą.
settings-power-long-sleep-after = Išjungti po
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } valandos
    [few] { $hours } valandų
    [many] { $hours } valandos
   *[other] { $hours } valandų
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dienos
    [few] { $days } dienų
    [many] { $days } dienos
   *[other] { $days } dienų
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } savaitės
    [few] { $weeks } savaičių
    [many] { $weeks } savaitės
   *[other] { $weeks } savaičių
}

## Keyboard

settings-keyboard-sources = Įvesties šaltiniai
settings-keyboard-sources-description = Pirmasis naudojamas pagal numatytuosius nustatymus. Rašydami galite perjungti šaltinius.
settings-keyboard-source-edit = Redaguoti programoje Keys
settings-keyboard-source-up = Perkelti aukštyn
settings-keyboard-source-down = Perkelti žemyn
settings-keyboard-source-remove = Pašalinti
settings-keyboard-add-source-button = Pridėti įvesties šaltinį
settings-keyboard-own = Jūsų išdėstymai ir įvesties būdai
settings-keyboard-own-layout = Sukurti išdėstymą
settings-keyboard-own-layout-description = Pasirinkite išdėstymą ir pakeiskite, ką rašo jo klavišai
settings-keyboard-own-method = Sukurti įvesties būdą
settings-keyboard-own-method-description = Tai, ką rašote, paverskite diakritiniais ženklais, kitais raštais ar žodžiais, iš kurių galima rinktis
settings-keyboard-own-open = Atidaryti Keys
settings-keyboard-own-open-description = Redaguokite savo sukurtus išdėstymus ir įvesties būdus
settings-keyboard-switch-source = Perjungti įvesties šaltinį
settings-keyboard-add-source = Pridėti įvesties šaltinį
settings-keyboard-add-source-description = Pasirinkite klaviatūros išdėstymą arba įvesties būdą, kuriuo norite rašyti.
settings-keyboard-add-source-search = Ieškoti kalbų, išdėstymų ir įvesties būdų
settings-keyboard-input-method = Įvesties būdas
settings-keyboard-add-source-no-match = Pagal „{ $query }“ nieko nerasta
settings-keyboard-cancel = Atšaukti
settings-keyboard-add = Pridėti
settings-keyboard-typing = Rašymas
settings-keyboard-repeat = Klavišų kartojimas
settings-keyboard-repeat-description = Laikant nuspaustą klavišą, jis rašomas vėl ir vėl
settings-keyboard-repeat-delay = Delsa prieš kartojimą
settings-keyboard-repeat-delay-shorter = Trumpesnė
settings-keyboard-repeat-delay-longer = Ilgesnė
settings-keyboard-repeat-speed = Kartojimo sparta
settings-keyboard-repeat-speed-slower = Lėčiau
settings-keyboard-repeat-speed-faster = Greičiau
settings-keyboard-caps-lock = Caps Lock klavišas
settings-keyboard-caps-lock-description = Kas nutinka jį paspaudus
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Sukeisti su Esc
settings-keyboard-caps-lock-nothing = Nieko
settings-keyboard-caps-lock-custom = Pasirinktinis
settings-keyboard-lock-notices = Rodyti Caps Lock ir Num Lock
settings-keyboard-lock-notices-description = Trumpam parodo ekrane, kai kuris nors iš jų įjungiamas ar išjungiamas
settings-keyboard-dictation-on = Įjungta
settings-keyboard-dictation-off = Išjungta
settings-keyboard-shortcuts-description = Peržiūrėkite ir keiskite sparčiuosius klavišus arba pridėkite savo

## Copilot key

settings-keyboard-copilot = Copilot klavišas
settings-keyboard-copilot-press = Paspaudimas
settings-keyboard-copilot-press-description = Kas nutinka trumpai paspaudus klavišą
settings-keyboard-copilot-open-start = Atidaryti meniu Pradžia
settings-keyboard-copilot-open-app = Atidaryti programą
settings-keyboard-copilot-nothing = Nieko
settings-keyboard-copilot-app = Programa
settings-keyboard-copilot-no-app = Programa dar nepasirinkta
settings-keyboard-copilot-change = Keisti
settings-keyboard-copilot-choose = Pasirinkti
settings-keyboard-copilot-hold = Laikyti diktavimui
settings-keyboard-copilot-hold-description = Laikykite klavišą ir kalbėkite – tai, ką sakote, bus parašyta
settings-keyboard-copilot-hold-off = Veikia, kai įjungtas diktavimas
settings-keyboard-copilot-choose-app = Pasirinkite programą
settings-keyboard-copilot-choose-app-description = Ji atsidarys paspaudus Copilot klavišą.

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
settings-keys-space = Tarpas
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meniu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Garsiau
settings-keys-volume-down = Tyliau
settings-keys-mute = Nutildyti
settings-keys-microphone-mute = Nutildyti mikrofoną
settings-keys-play = Leisti
settings-keys-media-pause = Pristabdyti
settings-keys-stop = Stabdyti
settings-keys-next-track = Kitas takelis
settings-keys-previous-track = Ankstesnis takelis
settings-keys-brightness-up = Šviesiau
settings-keys-brightness-down = Tamsiau
settings-keys-browser = Naršyklė
settings-keys-home-page = Pagrindinis puslapis
settings-keys-search = Paieška
settings-keys-mail = Paštas
settings-keys-calculator = Skaičiuotuvas
settings-keys-files = Failai
settings-keys-eject = Išstumti
settings-keys-power = Maitinimas
settings-keys-lock = Užrakinti

## Keyboard shortcuts

settings-shortcuts-title = Spartieji klavišai
settings-shortcuts-search = Ieškoti sparčiųjų klavišų
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Langai
settings-shortcuts-category-tiling = Išklotinė
settings-shortcuts-category-workspaces = Darbo sritys
settings-shortcuts-category-screenshots = Ekrano kopijos
settings-shortcuts-category-media = Medija
settings-shortcuts-reset = Atkurti numatytąjį
settings-shortcuts-apps = Programų spartieji klavišai
settings-shortcuts-apps-description = Programų užregistruoti klavišai, kurie veikia net tada, kai programa ne priekyje
settings-shortcuts-no-match = Pagal „{ $query }“ sparčiųjų klavišų nerasta
settings-shortcuts-change = Keisti sparčiąjį klavišą: { $name }
settings-shortcuts-or = arba
settings-shortcuts-not-set = Nenustatyta
settings-shortcuts-press-keys = Paspauskite norimus klavišus
settings-shortcuts-needs-modifier = Pridėkite Ctrl, Alt arba Super, kad spartusis klavišas netrukdytų rašyti.
settings-shortcuts-record-description = Paspauskite naują spartųjį klavišą. Backspace jį išjungia, Esc atšaukia.
settings-shortcuts-record-taken = Šis spartusis klavišas jau naudojamas veiksmui „{ $name }“. Jį pakeitus, ten jis bus išjungtas.
settings-shortcuts-try-another = Bandyti kitą
settings-shortcuts-replace = Pakeisti
settings-shortcuts-cancel = Atšaukti
settings-shortcuts-custom = Pasirinktiniai spartieji klavišai
settings-shortcuts-custom-description = Klavišų deriniu paleiskite komandą arba atidarykite programą
settings-shortcuts-untitled = Be pavadinimo
settings-shortcuts-add = Pridėti spartųjį klavišą
settings-shortcuts-edit = Redaguoti spartųjį klavišą
settings-shortcuts-custom-name = Pavadinimas
settings-shortcuts-custom-command = Komanda
settings-shortcuts-custom-shortcut = Spartusis klavišas
settings-shortcuts-custom-taken = Jau naudojamas veiksmui „{ $name }“. Įrašius, ten jis bus išjungtas.
settings-shortcuts-remove = Pašalinti
settings-shortcuts-save = Įrašyti
settings-shortcuts-add-button = Pridėti

## Dictation

settings-dictation-title = Diktavimas
settings-dictation-description = Bet kurioje programoje laikykite { $keys } ir kalbėkite – tai, ką sakote, bus parašyta. Atleiskite, kad baigtumėte, arba paspauskite Esc, kad atšauktumėte. Viskas vyksta šiame kompiuteryje: jūsų balsas iš jo niekur nesiunčiamas ir neįrašomas.
settings-dictation-description-no-shortcut = Kad galėtumėte diktuoti, toliau pasirinkite spartųjį klavišą. Viskas vyksta šiame kompiuteryje: jūsų balsas iš jo niekur nesiunčiamas ir neįrašomas.
settings-dictation-not-installed = Diktavimas šiame kompiuteryje neįdiegtas
settings-dictation-hold = Diktuokite laikydami { $keys }
settings-dictation-needs-shortcut = Išjungta, kol nepriskirtas spartusis klavišas
settings-dictation-copilot-key = Copilot klavišą
settings-dictation-shortcut = Spartusis klavišas
settings-dictation-shortcut-description = Laikykite jį ir kalbėkite arba paspauskite, ir bus klausoma, kol paspausite dar kartą ar nustosite kalbėti
settings-dictation-shortcut-own = Mano spartusis klavišas
settings-dictation-shortcut-another = Kitas spartusis klavišas…
settings-dictation-shortcut-off = Išjungta
settings-dictation-keys = Klavišai
settings-dictation-change = Keisti
settings-dictation-language = Kalba
settings-dictation-language-automatic = Automatiškai
settings-dictation-language-automatic-current = Automatiškai ({ $language })
settings-dictation-language-description = Automatiškai parenkama pagal klaviatūros išdėstymą, kuriuo rašote
settings-dictation-language-unavailable = Ši kalba šiame kompiuteryje nepasiekiama: { $language }
settings-dictation-engine = Kalbos atpažinimas
settings-dictation-engine-automatic = Automatiškai
settings-dictation-engine-description = { $engine } atpažįsta šią kalbą: { $language }
settings-dictation-engine-graphics-card = { $engine } vaizdo plokšte atpažįsta šią kalbą: { $language }
settings-dictation-models = Kalbos modeliai
settings-dictation-models-description = Modeliai atsisiunčiami vieną kartą ir laikomi šiame kompiuteryje.
settings-dictation-credits = Autoriai
settings-dictation-credit = { $credit }. Licencija: { $licence }.
settings-dictation-learn-more = Sužinoti daugiau

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Nepavyko atsisiųsti: { $reason }
settings-dictation-model-downloading = { $received } iš { $total }
settings-dictation-model-installed = Šiame kompiuteryje: { $size }
settings-dictation-model-partial = Atsisiųsta { $received } iš { $total }
settings-dictation-model-size = Atsisiųsti reikia { $size }
settings-dictation-model-retry = Bandyti dar kartą
settings-dictation-model-cancel = Atšaukti
settings-dictation-model-resume = Tęsti
settings-dictation-model-download = Atsisiųsti
settings-dictation-model-remove = Pašalinti

## Mouse and touchpad

settings-mouse-mouse = Pelė
settings-mouse-primary-button = Pagrindinis mygtukas
settings-mouse-primary-button-description = Mygtukas, kuriuo spustelėjate, kad ką nors pasirinktumėte
settings-mouse-primary-button-left = Kairysis
settings-mouse-primary-button-right = Dešinysis
settings-mouse-speed = Žymiklio greitis
settings-mouse-slower = Lėčiau
settings-mouse-faster = Greičiau
settings-mouse-acceleration = Pelės pagreitis
settings-mouse-acceleration-description = Greitai judinant pelę, žymiklis nukeliauja toliau
settings-mouse-natural-scrolling = Natūralusis slinkimas
settings-mouse-natural-scrolling-description = Slenkant judinamas turinys, o ne rodinys
settings-mouse-touchpad = Jutiklinis kilimėlis
settings-mouse-touchpad-speed = Jutiklinio kilimėlio žymiklio greitis
settings-mouse-touchpad-scroll-speed = Slinkimo greitis
settings-mouse-touchpad-scroll-speed-label = Jutiklinio kilimėlio slinkimo greitis
settings-mouse-touchpad-tap = Spustelėjimas bakstelėjus
settings-mouse-touchpad-tap-description = Bakstelėkite jutiklinį kilimėlį, užuot jį nuspaudę
settings-mouse-touchpad-natural-scrolling = Jutiklinio kilimėlio natūralusis slinkimas
settings-mouse-touchpad-natural-scrolling-description = Turinys juda ta pačia kryptimi kaip pirštai
settings-mouse-touchpad-scroll-with = Slinkti
settings-mouse-touchpad-two-fingers = Dviem pirštais
settings-mouse-touchpad-scroll-edge = Kraštu
settings-mouse-touchpad-secondary-click = Antrinis spustelėjimas
settings-mouse-touchpad-secondary-click-description = Kaip spustelėti dešiniuoju mygtuku be atskiro mygtuko
settings-mouse-touchpad-click-corner = Kampu
settings-mouse-touchpad-disable-typing = Išjungti rašant
settings-mouse-touchpad-disable-typing-description = Kad rašant žymiklis nešokinėtų
