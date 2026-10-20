## Displays

settings-display-mirror = Kuvarite peegeldamine
settings-display-mirror-description = Kuvab igal kuvaril sama pilti
settings-display-mirrored = Peegeldatud kuvarid
settings-display-display = Kuvar
settings-display-apply-failed = Need sätted ei toiminud. Proovige teistsugust seadistust.
settings-display-reset = Lähtesta
settings-display-apply = Rakenda
settings-display-arrangement-main = { $name }, põhikuvar
settings-display-use = Kasuta seda kuvarit
settings-display-main = Põhikuvar
settings-display-main-description = Tegumiriba ja uued aknad ilmuvad siia
settings-display-resolution-title = Eraldusvõime
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Värskendussagedus
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Muutuv värskendussagedus
settings-display-variable-refresh-description = Kuvar järgib täisekraanmängude kaadrisagedust, et liikumine oleks sujuvam
settings-display-variable-refresh-off = Väljas
settings-display-variable-refresh-games = Mängudes
settings-display-variable-refresh-fullscreen = Kõigis täisekraanrakendustes
settings-display-scale = Skaleerimine
settings-display-scale-description = Muudab teksti, rakendused ja kõik muu suuremaks või väiksemaks
settings-display-orientation = Suund
settings-display-orientation-landscape = Horisontaalpaigutus
settings-display-orientation-portrait-right = Vertikaalpaigutus paremale
settings-display-orientation-portrait-left = Vertikaalpaigutus vasakule
settings-display-orientation-landscape-flipped = Horisontaalpaigutus, ümberpööratud

## Display brightness

settings-display-brightness = Heledus
settings-display-brightness-label = Heledus: { $name }
settings-display-brightness-unsupported = Siin muutmiseks lülitage kuvari menüüs sisse DDC/CI
settings-display-brightness-unresponsive = Praegu ei vasta, proovitakse varsti uuesti
settings-display-brightness-external = Välised kuvarid
settings-display-brightness-missing-tool = Nende heleduse muutmiseks siin installige ddcutil
settings-display-brightness-needs-restart = Nende heleduse seadistamise lõpetamiseks taaskäivitage arvuti
settings-display-brightness-no-access = Nende heleduse muutmiseks siin logige välja ja uuesti sisse

## Night light

settings-display-night-light = Öövalgus
settings-display-night-light-description = Õhtul soojemad värvid, mis on silmadele leebemad
settings-display-night-light-schedule = Ajakava
settings-display-night-light-automatic = Päikeseloojangust päikesetõusuni
settings-display-night-light-custom = Kohandatud
settings-display-night-light-from = Lülitub sisse
settings-display-night-light-to = Lülitub välja
settings-display-night-light-warmth = Soojus

## Sound

settings-sound-output = Väljund
settings-sound-input = Sisend
settings-sound-device = Seade
settings-sound-output-device = Väljundseade
settings-sound-input-device = Sisendseade
settings-sound-connection = Ühendus
settings-sound-output-connection = Väljundi ühendus
settings-sound-input-connection = Sisendi ühendus
settings-sound-volume = Helitugevus
settings-sound-mute = Vaigista: { $name }
settings-sound-unmute = Tühista vaigistus: { $name }
settings-sound-balance = Tasakaal
settings-sound-balance-center = Keskel
settings-sound-balance-left = { $share } vasakule
settings-sound-balance-right = { $share } paremale
settings-sound-louder = Luba valjemat heli kui 100%
settings-sound-louder-description = Suurema helitugevuse korral võib heli moonduda
settings-sound-input-level = Sisendi tase
settings-sound-apps = Rakenduste helitugevus
settings-sound-apps-playing = { $count ->
    [one] { $count } rakendus esitab heli
   *[other] { $count } rakendust esitab heli
}
settings-sound-app-output = Rakenduse { $app } heliväljund
settings-sound-profiles = Seadmeprofiilid
settings-sound-profiles-row-description = Valige, kuidas iga heliseadet kasutatakse
settings-sound-profiles-description = Kuidas iga heliseadet kasutatakse, näiteks stereo või ruumiline heli
settings-sound-profile-label = Seadme { $device } kasutusviis
settings-sound-profile-off = Väljas

## System sounds

settings-sound-system = Süsteemihelid
settings-sound-system-description = Teavituste, seadmete ja muude sündmuste helid
settings-sound-system-volume = Süsteemihelide tugevus
settings-sound-kind-notifications = Teavitused
    .description = Vaikivad režiimi Ära sega, mängude ja ekraani jagamise ajal
    .preview = Esita teavitusheli
settings-sound-kind-devices = Seadmed ja laadimine
    .description = Seadme või laadija ühendamine ja tühjenev aku
    .preview = Esita seadmeheli
settings-sound-kind-volume = Helitugevuse tagasiside
    .description = Klõps helitugevuse muutmisel
    .preview = Esita helitugevuse klõps
settings-sound-kind-screenshots = Kuvatõmmised
    .description = Katiku heli kuvatõmmise salvestamisel
    .preview = Esita katiku heli
settings-sound-kind-recording = Salvestamine
    .description = Kui ekraanisalvestus, kaamera või dikteerimine algab ja lõpeb
    .preview = Esita salvestamise heli
settings-sound-kind-sign-in = Sisselogimisheli
    .description = Kui teie töölaud ilmub
    .preview = Esita sisselogimisheli
settings-sound-kind-keyboard = Klahvivajutused
    .description = Iga klahv ekraaniklaviatuuril
    .preview = Esita klahvivajutuse heli

## Power and battery

settings-power-battery = Aku
settings-power-charging = Laadimine
settings-power-charging-at = Laadimine, { $power }
settings-power-charging-until-full = Laadimine, täislaadimiseni { $time }
settings-power-charging-at-until-full = Laadimine, { $power }, täislaadimiseni { $time }
settings-power-on-battery = Akutoitel
settings-power-on-battery-using = Akutoitel, tarbimine { $power }
settings-power-time-left = Jäänud umbes { $time }
settings-power-time-left-using = Jäänud umbes { $time }, tarbimine { $power }
settings-power-full = Täis laetud
settings-power-empty = Tühi
settings-power-not-charging = Vooluvõrgus, ei laadi
settings-power-health = Aku seisukord
settings-power-capacity = { $full }, uuena { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } laadimistsükkel
   *[other] { $cycles } laadimistsüklit
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Kuva protsent
settings-power-show-percentage-description = Kuvab akutaseme akuikooni sees

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = alla minuti
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minutit
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } tund
   *[other] { $hours } tundi
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } tund
   *[other] { $hours } tundi
} { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minutit
}
settings-power-never = Mitte kunagi

## Charge limit

settings-power-limit = Laadimispiirang
settings-power-limit-failed = Piirangut ei õnnestunud muuta. Proovige uuesti.
settings-power-limit-elsewhere-off = Teine rakendus lülitas selle välja, nii et aku laetakse täis
settings-power-limit-elsewhere-changed = Teine rakendus muutis piiranguks { $level }
settings-power-limit-elsewhere-on = Teine rakendus lõpetab laadimise tasemel { $level }
settings-power-limit-automatic = Arvuti otsustab ise, millal laadimine lõpetada
settings-power-limit-stops-at = Laadimine lõpeb tasemel { $level }
settings-power-limit-description = Lõpetab laadimise varem, et aku kestaks kauem
settings-power-limit-description-at = Lõpetab tasemel { $level }, et aku kestaks kauem
settings-power-limit-applied = Laadimine lõpeb tasemel { $level }
settings-power-limit-applied-description = Määras selle arvuti teine rakendus

## Battery-powered devices

settings-power-devices = Seadmed
settings-power-device-mouse = Hiir
settings-power-device-keyboard = Klaviatuur
settings-power-device-headphones = Kõrvaklapid
settings-power-device-speaker = Kõlar
settings-power-device-controller = Mängukontroller
settings-power-device-phone = Telefon
settings-power-device-tablet = Tahvelarvuti
settings-power-device-pen = Pliiats
settings-power-device-touchpad = Puuteplaat
settings-power-device-other = Seade

## Power mode

settings-power-mode = Toiterežiim
settings-power-mode-row = Režiim
settings-power-profile-saver = Energiasääst
    .description = Aeglasem ja tarbib vähem energiat
settings-power-profile-balanced = Tasakaalustatud
    .description = Tavaline jõudlus ja energiatarve
settings-power-profile-performance = Jõudlus
    .description = Kiirem ja tarbib rohkem energiat
settings-power-limited = Jõudlus on praegu piiratud
settings-power-limited-lap = Jõudlus on piiratud, sest arvuti on teie sülle asetatud
settings-power-limited-hot = Jõudlus on piiratud, sest arvuti on liiga kuum
settings-power-limited-lap-hot = Jõudlus on piiratud, sest arvuti on teie sülle asetatud ja liiga kuum
settings-power-saver-low-battery = Energiasääst tühjeneva aku korral
settings-power-saver-low-battery-description = Lülitub energiasäästule, kui aku hakkab tühjaks saama

## Keyboard backlight

settings-power-keyboard = Klaviatuur
settings-power-backlight = Klaviatuuri taustvalgustus
settings-power-backlight-off = Väljas
settings-power-backlight-low = Madal
settings-power-backlight-medium = Keskmine
settings-power-backlight-high = Kõrge

## Screen and sleep

settings-power-screen = Ekraan
settings-power-screen-off = Lülita ekraan välja pärast
settings-power-screen-off-description = Kui te pole arvutit mõnda aega kasutanud
settings-power-dim = Tumenda jõudeolekus
settings-power-dim-description = Vähendab heledust veidi enne ekraani väljalülitamist
settings-power-sleep = Unerežiim
settings-power-suspend-plugged-in = Unerežiim vooluvõrgus
settings-power-suspend-inactive = Unerežiim jõudeolekus
settings-power-suspend-description = Viib arvuti mõne aja pärast unerežiimi, kui seda ei kasutata
settings-power-suspend-battery = Unerežiim akutoitel
settings-power-button = Toitenupp
settings-power-button-suspend = Unerežiim
settings-power-button-hibernate = Talveunerežiim
settings-power-button-ask = Küsi, mida teha
settings-power-button-nothing = Ära tee midagi
settings-power-long-sleep = Lülita pärast pikka und välja
settings-power-long-sleep-description = Selle asemel, et lasta akul unerežiimis tühjaks saada, lülitub arvuti välja, kui aku hakkab tühjaks saama või pärast pikka und akutoitel. Avatud aknaid ei säilitata.
settings-power-long-sleep-failed = Seda ei õnnestunud muuta. Proovige uuesti.
settings-power-long-sleep-after = Lülita välja pärast
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } tund
   *[other] { $hours } tundi
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } päev
   *[other] { $days } päeva
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } nädal
   *[other] { $weeks } nädalat
}

## Keyboard

settings-keyboard-sources = Sisendallikad
settings-keyboard-sources-description = Esimest kasutatakse vaikimisi. Saate nende vahel tippimise ajal vahetada.
settings-keyboard-source-edit = Muuda rakenduses Keys
settings-keyboard-source-up = Teisalda üles
settings-keyboard-source-down = Teisalda alla
settings-keyboard-source-remove = Eemalda
settings-keyboard-add-source-button = Lisa sisendallikas
settings-keyboard-own = Teie enda paigutused ja sisestusmeetodid
settings-keyboard-own-layout = Loo paigutus
settings-keyboard-own-layout-description = Alustage olemasolevast paigutusest ja muutke, mida selle klahvid kirjutavad
settings-keyboard-own-method = Loo sisestusmeetod
settings-keyboard-own-method-description = Muutke tipitu täpitähtedeks, teisteks kirjadeks või valitavateks sõnadeks
settings-keyboard-own-open = Ava Keys
settings-keyboard-own-open-description = Muutke loodud paigutusi ja sisestusmeetodeid
settings-keyboard-switch-source = Vaheta sisendallikat
settings-keyboard-add-source = Sisendallika lisamine
settings-keyboard-add-source-description = Valige klaviatuuripaigutus või sisestusmeetod, millega soovite tippida.
settings-keyboard-add-source-search = Otsi keeli, paigutusi ja sisestusmeetodeid
settings-keyboard-input-method = Sisestusmeetod
settings-keyboard-add-source-no-match = Päringule „{ $query }“ ei leitud vasteid
settings-keyboard-cancel = Loobu
settings-keyboard-add = Lisa
settings-keyboard-typing = Tippimine
settings-keyboard-repeat = Klahvikordus
settings-keyboard-repeat-description = Klahvi allhoidmine sisestab märki ikka ja jälle
settings-keyboard-repeat-delay = Viivitus enne kordamist
settings-keyboard-repeat-delay-shorter = Lühem
settings-keyboard-repeat-delay-longer = Pikem
settings-keyboard-repeat-speed = Kordamiskiirus
settings-keyboard-repeat-speed-slower = Aeglasem
settings-keyboard-repeat-speed-faster = Kiirem
settings-keyboard-caps-lock = Caps Locki klahv
settings-keyboard-caps-lock-description = Mis juhtub, kui seda vajutate
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Vaheta Esc-klahviga
settings-keyboard-caps-lock-nothing = Mitte midagi
settings-keyboard-caps-lock-custom = Kohandatud
settings-keyboard-lock-notices = Kuva Caps Lock ja Num Lock
settings-keyboard-lock-notices-description = Kuvab ekraanil hetkeks teate, kui kumbki sisse või välja lülitub
settings-keyboard-dictation-on = Sees
settings-keyboard-dictation-off = Väljas
settings-keyboard-shortcuts-description = Vaadake ja muutke kiirklahve või lisage oma

## Copilot key

settings-keyboard-copilot = Copiloti klahv
settings-keyboard-copilot-press = Vajutus
settings-keyboard-copilot-press-description = Mida teeb klahvi lühike vajutus
settings-keyboard-copilot-open-start = Ava Start
settings-keyboard-copilot-open-app = Ava rakendus
settings-keyboard-copilot-nothing = Mitte midagi
settings-keyboard-copilot-app = Rakendus
settings-keyboard-copilot-no-app = Rakendust pole veel valitud
settings-keyboard-copilot-change = Muuda
settings-keyboard-copilot-choose = Vali
settings-keyboard-copilot-hold = Dikteerimine allhoidmisel
settings-keyboard-copilot-hold-description = Hoidke klahvi all ja rääkige, et öeldu kirja panna
settings-keyboard-copilot-hold-off = Toimib, kui dikteerimine on sisse lülitatud
settings-keyboard-copilot-choose-app = Valige rakendus
settings-keyboard-copilot-choose-app-description = Copiloti klahvi vajutamine avab selle.

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
settings-keys-space = Tühik
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menüü
settings-keys-keypad = Numbriplokk { $key }
settings-keys-volume-up = Valjemaks
settings-keys-volume-down = Vaiksemaks
settings-keys-mute = Vaigista
settings-keys-microphone-mute = Mikrofoni vaigistus
settings-keys-play = Esita
settings-keys-media-pause = Paus
settings-keys-stop = Stopp
settings-keys-next-track = Järgmine lugu
settings-keys-previous-track = Eelmine lugu
settings-keys-brightness-up = Heledamaks
settings-keys-brightness-down = Tumedamaks
settings-keys-browser = Brauser
settings-keys-home-page = Avaleht
settings-keys-search = Otsing
settings-keys-mail = Meil
settings-keys-calculator = Kalkulaator
settings-keys-files = Failid
settings-keys-eject = Väljuta
settings-keys-power = Toide
settings-keys-lock = Lukusta

## Keyboard shortcuts

settings-shortcuts-title = Kiirklahvid
settings-shortcuts-search = Otsi kiirklahve
settings-shortcuts-category-system = Süsteem
settings-shortcuts-category-windows = Aknad
settings-shortcuts-category-workspaces = Tööalad
settings-shortcuts-category-screenshots = Kuvatõmmised
settings-shortcuts-category-media = Meedia
settings-shortcuts-reset = Taasta vaikeväärtus
settings-shortcuts-apps = Rakenduste kiirklahvid
settings-shortcuts-apps-description = Rakenduste soovitud kiirklahvid, mis töötavad ka siis, kui rakendus pole esiplaanil
settings-shortcuts-no-match = Päringule „{ $query }“ ei leitud ühtegi kiirklahvi
settings-shortcuts-change = Muuda kiirklahvi: { $name }
settings-shortcuts-or = või
settings-shortcuts-not-set = Määramata
settings-shortcuts-press-keys = Vajutage soovitud klahve
settings-shortcuts-needs-modifier = Lisage Ctrl, Alt või Super, et kiirklahv ei segaks tippimist.
settings-shortcuts-record-description = Vajutage uut kiirklahvi. Backspace lülitab selle välja, Esc tühistab.
settings-shortcuts-record-taken = Seda kiirklahvi kasutab juba „{ $name }“. Asendamisel lülitatakse see seal välja.
settings-shortcuts-try-another = Proovi teist
settings-shortcuts-replace = Asenda
settings-shortcuts-cancel = Loobu
settings-shortcuts-custom = Kohandatud kiirklahvid
settings-shortcuts-custom-description = Käivitage käsk või avage rakendus klahvikombinatsiooniga
settings-shortcuts-untitled = Nimetu
settings-shortcuts-add = Lisa kiirklahv
settings-shortcuts-edit = Muuda kiirklahvi
settings-shortcuts-custom-name = Nimi
settings-shortcuts-custom-command = Käsk
settings-shortcuts-custom-shortcut = Kiirklahv
settings-shortcuts-custom-taken = Juba kasutusel: „{ $name }“. Salvestamisel lülitatakse see seal välja.
settings-shortcuts-remove = Eemalda
settings-shortcuts-save = Salvesta
settings-shortcuts-add-button = Lisa

## Dictation

settings-dictation-title = Dikteerimine
settings-dictation-description = Hoidke all { $keys } ja rääkige – öeldu kirjutatakse mis tahes rakendusse. Lõpetamiseks laske lahti, loobumiseks vajutage Esc. Kõik toimub selles arvutis: teie häält ei saadeta kuhugi ega salvestata.
settings-dictation-description-no-shortcut = Dikteerimiseks valige allpool kiirklahv. Kõik toimub selles arvutis: teie häält ei saadeta kuhugi ega salvestata.
settings-dictation-not-installed = Dikteerimine pole sellesse arvutisse installitud
settings-dictation-hold = Dikteerimiseks hoidke all { $keys }
settings-dictation-needs-shortcut = Väljas, kuni sellele on määratud kiirklahv
settings-dictation-copilot-key = Copiloti klahv
settings-dictation-shortcut = Kiirklahv
settings-dictation-shortcut-description = Hoidke seda rääkimise ajal all või vajutage, et kuulamine kestaks, kuni vajutate uuesti või lõpetate rääkimise
settings-dictation-shortcut-own = Minu oma kiirklahv
settings-dictation-shortcut-another = Muu kiirklahv…
settings-dictation-shortcut-off = Väljas
settings-dictation-keys = Klahvid
settings-dictation-change = Muuda
settings-dictation-language = Keel
settings-dictation-language-automatic = Automaatne
settings-dictation-language-automatic-current = Automaatne ({ $language })
settings-dictation-language-description = Automaatne valik järgib klaviatuuripaigutust, millega tipite
settings-dictation-language-unavailable = See keel pole selles arvutis saadaval: { $language }
settings-dictation-engine = Kõnetuvastus
settings-dictation-engine-automatic = Automaatne
settings-dictation-engine-description = { $engine }, keel: { $language }
settings-dictation-engine-graphics-card = { $engine } graafikakaardil, keel: { $language }
settings-dictation-models = Kõnemudelid
settings-dictation-models-description = Mudelid laaditakse alla üks kord ja hoitakse selles arvutis.
settings-dictation-credits = Tänuavaldused
settings-dictation-credit = { $credit }. Litsents: { $licence }.
settings-dictation-learn-more = Lisateave

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Allalaadimine ebaõnnestus: { $reason }
settings-dictation-model-downloading = { $received } / { $total }
settings-dictation-model-installed = Selles arvutis: { $size }
settings-dictation-model-partial = Alla laaditud { $received } / { $total }
settings-dictation-model-size = Allalaaditav maht: { $size }
settings-dictation-model-retry = Proovi uuesti
settings-dictation-model-cancel = Loobu
settings-dictation-model-resume = Jätka
settings-dictation-model-download = Laadi alla
settings-dictation-model-remove = Eemalda

## Mouse and touchpad

settings-mouse-mouse = Hiir
settings-mouse-primary-button = Põhinupp
settings-mouse-primary-button-description = Nupp, millega klõpsates asju valite
settings-mouse-primary-button-left = Vasak
settings-mouse-primary-button-right = Parem
settings-mouse-speed = Kursori kiirus
settings-mouse-slower = Aeglasem
settings-mouse-faster = Kiirem
settings-mouse-acceleration = Hiire kiirendus
settings-mouse-acceleration-description = Kursor liigub kaugemale, kui hiirt kiiresti liigutate
settings-mouse-natural-scrolling = Loomulik kerimine
settings-mouse-natural-scrolling-description = Kerimine liigutab sisu, mitte vaadet
settings-mouse-touchpad = Puuteplaat
settings-mouse-touchpad-speed = Puuteplaadi kursori kiirus
settings-mouse-touchpad-scroll-speed = Kerimiskiirus
settings-mouse-touchpad-scroll-speed-label = Puuteplaadi kerimiskiirus
settings-mouse-touchpad-tap = Puudutusega klõpsamine
settings-mouse-touchpad-tap-description = Puudutage puuteplaati, selle asemel et seda alla vajutada
settings-mouse-touchpad-natural-scrolling = Puuteplaadi loomulik kerimine
settings-mouse-touchpad-natural-scrolling-description = Sisu liigub samas suunas kui teie sõrmed
settings-mouse-touchpad-scroll-with = Kerimisviis
settings-mouse-touchpad-two-fingers = Kahe sõrmega
settings-mouse-touchpad-scroll-edge = Servas
settings-mouse-touchpad-secondary-click = Teisene klõps
settings-mouse-touchpad-secondary-click-description = Kuidas paremklõpsata ilma eraldi nuputa
settings-mouse-touchpad-click-corner = Nurgas
settings-mouse-touchpad-disable-typing = Keela tippimise ajal
settings-mouse-touchpad-disable-typing-description = Et kursor tippimise ajal ei hüppaks
