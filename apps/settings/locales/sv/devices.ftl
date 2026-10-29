## Displays

settings-display-mirror = Spegla skärmar
settings-display-mirror-description = Visar samma bild på alla skärmar
settings-display-mirrored = Speglade skärmar
settings-display-display = Skärm
settings-display-apply-failed = De här inställningarna fungerade inte. Prova en annan konfiguration.
settings-display-reset = Återställ
settings-display-apply = Verkställ
settings-display-arrangement-main = { $name }, huvudskärm
settings-display-use = Använd den här skärmen
settings-display-main = Huvudskärm
settings-display-main-description = Aktivitetsfältet och nya fönster visas här
settings-display-resolution-title = Upplösning
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Uppdateringsfrekvens
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Variabel uppdateringsfrekvens
settings-display-variable-refresh-description = Låter skärmen följa bildfrekvensen i spel i helskärm för jämnare rörelser
settings-display-variable-refresh-off = Av
settings-display-variable-refresh-games = I spel
settings-display-variable-refresh-fullscreen = I alla appar i helskärm
settings-display-scale = Skala
settings-display-scale-description = Gör text, appar och allt annat större eller mindre
settings-display-orientation = Orientering
settings-display-orientation-landscape = Liggande
settings-display-orientation-portrait-right = Stående åt höger
settings-display-orientation-portrait-left = Stående åt vänster
settings-display-orientation-landscape-flipped = Liggande, vänd

## Display brightness

settings-display-brightness = Ljusstyrka
settings-display-brightness-label = Ljusstyrka för { $name }
settings-display-brightness-unsupported = Slå på DDC/CI i skärmens meny för att ändra den här
settings-display-brightness-unresponsive = Svarar inte just nu, försöker igen om en stund
settings-display-brightness-external = Externa skärmar
settings-display-brightness-missing-tool = Installera ddcutil för att ändra deras ljusstyrka här
settings-display-brightness-needs-restart = Starta om för att slutföra inställningen av deras ljusstyrka
settings-display-brightness-no-access = Logga ut och in igen för att ändra deras ljusstyrka här

## Night light

settings-display-night-light = Nattljus
settings-display-night-light-description = Varmare färger på kvällen, skonsammare för ögonen
settings-display-night-light-schedule = Schema
settings-display-night-light-automatic = Solnedgång till soluppgång
settings-display-night-light-custom = Anpassat
settings-display-night-light-from = Slås på
settings-display-night-light-to = Stängs av
settings-display-night-light-warmth = Värme

## Sound

settings-sound-output = Utgång
settings-sound-input = Ingång
settings-sound-device = Enhet
settings-sound-output-device = Utgångsenhet
settings-sound-input-device = Ingångsenhet
settings-sound-connection = Anslutning
settings-sound-output-connection = Utgångsanslutning
settings-sound-input-connection = Ingångsanslutning
settings-sound-volume = Volym
settings-sound-mute = Stäng av ljudet för { $name }
settings-sound-unmute = Slå på ljudet för { $name }
settings-sound-balance = Balans
settings-sound-balance-center = Mitten
settings-sound-balance-left = { $share } vänster
settings-sound-balance-right = { $share } höger
settings-sound-louder = Tillåt högre än 100 %
settings-sound-louder-description = Ljudet kan bli förvrängt vid höga volymer
settings-sound-input-level = Ingångsnivå
settings-sound-apps = Appvolymer
settings-sound-apps-playing = { $count ->
    [one] { $count } app spelar upp ljud
   *[other] { $count } appar spelar upp ljud
}
settings-sound-app-output = Spela upp { $app } på
settings-sound-profiles = Enhetsprofiler
settings-sound-profiles-row-description = Välj hur varje ljudenhet används
settings-sound-profiles-description = Hur varje ljudenhet används, till exempel stereo eller surround
settings-sound-profile-label = Hur { $device } används
settings-sound-profile-off = Av

## System sounds

settings-sound-system = Systemljud
settings-sound-system-description = Ljud för notiser, enheter och andra händelser
settings-sound-system-volume = Volym för systemljud
settings-sound-kind-notifications = Notiser
    .description = Tyst under Stör ej, spel och skärmdelning
    .preview = Spela upp notisljudet
settings-sound-kind-devices = Enheter och laddning
    .description = När en enhet eller laddare ansluts och när batteriet är svagt
    .preview = Spela upp enhetsljudet
settings-sound-kind-volume = Volymljud
    .description = Ett klick när du ändrar volymen
    .preview = Spela upp volymklicket
settings-sound-kind-screenshots = Skärmbilder
    .description = Ett slutarljud när en skärmbild sparas
    .preview = Spela upp slutarljudet
settings-sound-kind-recording = Inspelning
    .description = När skärminspelning, kameran eller diktering startar och slutar
    .preview = Spela upp inspelningsljudet
settings-sound-kind-sign-in = Inloggningsljud
    .description = När skrivbordet visas
    .preview = Spela upp inloggningsljudet
settings-sound-kind-keyboard = Tangentljud
    .description = Varje tangent på skärmtangentbordet
    .preview = Spela upp ett tangentljud

## Power and battery

settings-power-battery = Batteri
settings-power-charging = Laddas
settings-power-charging-at = Laddas med { $power }
settings-power-charging-until-full = Laddas, fulladdat om { $time }
settings-power-charging-at-until-full = Laddas med { $power }, fulladdat om { $time }
settings-power-on-battery = På batteri
settings-power-on-battery-using = På batteri, förbrukar { $power }
settings-power-time-left = Cirka { $time } kvar
settings-power-time-left-using = Cirka { $time } kvar, förbrukar { $power }
settings-power-full = Fulladdat
settings-power-empty = Tomt
settings-power-not-charging = Laddare ansluten, laddas inte
settings-power-health = Batterihälsa
settings-power-capacity = { $full } av { $design } som nytt
settings-power-cycles = { $count ->
    [one] { $cycles } laddningscykel
   *[other] { $cycles } laddningscykler
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Visa procent
settings-power-show-percentage-description = Visar batterinivån i batteriikonen

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mindre än en minut
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuter
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } timme
   *[other] { $hours } timmar
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } timme
   *[other] { $hours } timmar
} { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuter
}
settings-power-never = Aldrig

## Charge limit

settings-power-limit = Begränsa laddningen
settings-power-limit-failed = Det gick inte att ändra gränsen. Försök igen.
settings-power-limit-elsewhere-off = En annan app har stängt av den, så batteriet laddas fullt
settings-power-limit-elsewhere-changed = En annan app har ändrat gränsen till { $level }
settings-power-limit-elsewhere-on = En annan app stoppar laddningen vid { $level }
settings-power-limit-automatic = Datorn bestämmer när laddningen ska stoppas
settings-power-limit-stops-at = Laddningen stoppas vid { $level }
settings-power-limit-description = Stoppar laddningen tidigare så att batteriet håller längre
settings-power-limit-description-at = Stoppar vid { $level } så att batteriet håller längre
settings-power-limit-applied = Laddningen stoppas vid { $level }
settings-power-limit-applied-description = Inställt av en annan app på den här datorn

## Battery-powered devices

settings-power-devices = Enheter
settings-power-device-mouse = Mus
settings-power-device-keyboard = Tangentbord
settings-power-device-headphones = Hörlurar
settings-power-device-speaker = Högtalare
settings-power-device-controller = Spelkontroll
settings-power-device-phone = Telefon
settings-power-device-tablet = Surfplatta
settings-power-device-pen = Penna
settings-power-device-touchpad = Styrplatta
settings-power-device-other = Enhet

## Power mode

settings-power-mode = Energiläge
settings-power-mode-row = Läge
settings-power-profile-saver = Energisparläge
    .description = Långsammare och förbrukar mindre energi
settings-power-profile-balanced = Balanserat
    .description = Normal prestanda och energiförbrukning
settings-power-profile-performance = Prestanda
    .description = Snabbare och förbrukar mer energi
settings-power-limited = Prestandan är begränsad just nu
settings-power-limited-lap = Prestandan är begränsad eftersom datorn ligger i ditt knä
settings-power-limited-hot = Prestandan är begränsad eftersom datorn är för varm
settings-power-limited-lap-hot = Prestandan är begränsad eftersom datorn ligger i ditt knä och är för varm
settings-power-saver-low-battery = Energisparläge vid låg batterinivå
settings-power-saver-low-battery-description = Byter till energisparläge när batteriet börjar ta slut
settings-power-saver-level = Batterinivå för energisparläge

## Keyboard backlight

settings-power-keyboard = Tangentbord
settings-power-backlight = Tangentbordsbelysning
settings-power-backlight-off = Av
settings-power-backlight-low = Låg
settings-power-backlight-medium = Medel
settings-power-backlight-high = Hög

## Screen and sleep

settings-power-screen = Skärm
settings-power-screen-off = Stäng av skärmen efter
settings-power-screen-off-description = När du inte har använt datorn på en stund
settings-power-dim = Dämpa vid inaktivitet
settings-power-dim-description = Sänker ljusstyrkan strax innan skärmen stängs av
settings-power-sleep = Viloläge
settings-power-suspend-plugged-in = Viloläge med laddare ansluten
settings-power-suspend-inactive = Viloläge vid inaktivitet
settings-power-suspend-description = Försätter datorn i viloläge när den inte har använts på en stund
settings-power-suspend-battery = Viloläge på batteri
settings-power-button = Strömknapp
settings-power-button-suspend = Viloläge
settings-power-button-hibernate = Dvala
settings-power-button-ask = Fråga vad som ska göras
settings-power-button-nothing = Gör ingenting
settings-power-long-sleep = Stäng av efter lång tid i viloläge
settings-power-long-sleep-description = I stället för att låta batteriet ta slut i viloläge stängs datorn av när batteriet börjar ta slut eller efter lång tid i viloläge på batteri. Öppna fönster sparas inte.
settings-power-long-sleep-failed = Det gick inte att ändra det här. Försök igen.
settings-power-long-sleep-after = Stäng av efter
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } timme
   *[other] { $hours } timmar
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dag
   *[other] { $days } dagar
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } vecka
   *[other] { $weeks } veckor
}

## Keyboard

settings-keyboard-sources = Inmatningskällor
settings-keyboard-sources-description = Den första används som standard. Växla mellan dem medan du skriver.
settings-keyboard-source-edit = Redigera i Keys
settings-keyboard-source-up = Flytta upp
settings-keyboard-source-down = Flytta ned
settings-keyboard-source-remove = Ta bort
settings-keyboard-add-source-button = Lägg till inmatningskälla
settings-keyboard-own = Egna layouter och inmatningsmetoder
settings-keyboard-own-layout = Skapa en layout
settings-keyboard-own-layout-description = Utgå från en layout och ändra vad tangenterna skriver
settings-keyboard-own-method = Skapa en inmatningsmetod
settings-keyboard-own-method-description = Gör om det du skriver till accenter, andra skriftsystem eller ord att välja mellan
settings-keyboard-own-open = Öppna Keys
settings-keyboard-own-open-description = Redigera layouterna och inmatningsmetoderna du har skapat
settings-keyboard-switch-source = Växla inmatningskälla
settings-keyboard-add-source = Lägg till en inmatningskälla
settings-keyboard-add-source-description = Välj den tangentbordslayout eller inmatningsmetod du vill skriva med.
settings-keyboard-add-source-search = Sök bland språk, layouter och inmatningsmetoder
settings-keyboard-input-method = Inmatningsmetod
settings-keyboard-add-source-no-match = Inget matchar ”{ $query }”
settings-keyboard-cancel = Avbryt
settings-keyboard-add = Lägg till
settings-keyboard-typing = Skrivning
settings-keyboard-repeat = Tangentupprepning
settings-keyboard-repeat-description = När du håller ned en tangent skrivs tecknet om och om igen
settings-keyboard-repeat-delay = Fördröjning före upprepning
settings-keyboard-repeat-delay-shorter = Kortare
settings-keyboard-repeat-delay-longer = Längre
settings-keyboard-repeat-speed = Upprepningshastighet
settings-keyboard-repeat-speed-slower = Långsammare
settings-keyboard-repeat-speed-faster = Snabbare
settings-keyboard-caps-lock = Caps Lock-tangenten
settings-keyboard-caps-lock-description = Vad som händer när du trycker på den
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Byt plats med Esc
settings-keyboard-caps-lock-nothing = Ingenting
settings-keyboard-caps-lock-custom = Anpassad
settings-keyboard-lock-notices = Visa Caps Lock och Num Lock
settings-keyboard-lock-notices-description = Visas en kort stund på skärmen när någon av dem slås på eller av
settings-keyboard-dictation-on = På
settings-keyboard-dictation-off = Av
settings-keyboard-shortcuts-description = Visa och ändra kortkommandon eller lägg till egna

## Copilot key

settings-keyboard-copilot = Copilot-tangenten
settings-keyboard-copilot-press = Tryck
settings-keyboard-copilot-press-description = Vad ett kort tryck på tangenten gör
settings-keyboard-copilot-open-start = Öppna Start
settings-keyboard-copilot-open-app = Öppna en app
settings-keyboard-copilot-nothing = Ingenting
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Ingen app vald än
settings-keyboard-copilot-change = Ändra
settings-keyboard-copilot-choose = Välj
settings-keyboard-copilot-hold = Håll ned för att diktera
settings-keyboard-copilot-hold-description = Håll ned tangenten och prata för att skriva det du säger
settings-keyboard-copilot-hold-off = Fungerar när diktering är på
settings-keyboard-copilot-choose-app = Välj en app
settings-keyboard-copilot-choose-app-description = Copilot-tangenten öppnar den.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Skift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tabb
settings-keys-space = Blanksteg
settings-keys-enter = Enter
settings-keys-backspace = Backsteg
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meny
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Höj volymen
settings-keys-volume-down = Sänk volymen
settings-keys-mute = Ljud av
settings-keys-microphone-mute = Mikrofon av
settings-keys-play = Spela upp
settings-keys-media-pause = Pausa
settings-keys-stop = Stoppa
settings-keys-next-track = Nästa spår
settings-keys-previous-track = Föregående spår
settings-keys-brightness-up = Ljusare
settings-keys-brightness-down = Mörkare
settings-keys-browser = Webbläsare
settings-keys-home-page = Startsida
settings-keys-search = Sök
settings-keys-mail = E-post
settings-keys-calculator = Kalkylator
settings-keys-files = Filer
settings-keys-eject = Mata ut
settings-keys-power = Ström
settings-keys-lock = Lås

## Keyboard shortcuts

settings-shortcuts-title = Kortkommandon
settings-shortcuts-search = Sök kortkommandon
settings-shortcuts-category-system = System
settings-shortcuts-category-windows = Fönster
settings-shortcuts-category-tiling = Plattor
settings-shortcuts-category-workspaces = Arbetsytor
settings-shortcuts-category-screenshots = Skärmbilder
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Återställ till standard
settings-shortcuts-apps = Appars kortkommandon
settings-shortcuts-apps-description = Sådana som appar har bett om och som fungerar även när appen inte är i förgrunden
settings-shortcuts-no-match = Inga kortkommandon matchar ”{ $query }”
settings-shortcuts-change = Ändra kortkommando för { $name }
settings-shortcuts-or = eller
settings-shortcuts-not-set = Inte angivet
settings-shortcuts-press-keys = Tryck på tangenterna du vill använda
settings-shortcuts-needs-modifier = Lägg till Ctrl, Alt eller Super så att kortkommandot inte stör när du skriver.
settings-shortcuts-record-description = Tryck på det nya kortkommandot. Backsteg stänger av det, Esc avbryter.
settings-shortcuts-record-taken = Kortkommandot används redan för ”{ $name }”. Om du ersätter det stängs det av där.
settings-shortcuts-try-another = Prova ett annat
settings-shortcuts-replace = Ersätt
settings-shortcuts-cancel = Avbryt
settings-shortcuts-custom = Egna kortkommandon
settings-shortcuts-custom-description = Kör ett kommando eller öppna en app med en tangentkombination
settings-shortcuts-untitled = Namnlöst
settings-shortcuts-add = Lägg till kortkommando
settings-shortcuts-edit = Redigera kortkommando
settings-shortcuts-custom-name = Namn
settings-shortcuts-custom-command = Kommando
settings-shortcuts-custom-shortcut = Kortkommando
settings-shortcuts-custom-taken = Används redan för ”{ $name }”. Om du sparar stängs det av där.
settings-shortcuts-remove = Ta bort
settings-shortcuts-save = Spara
settings-shortcuts-add-button = Lägg till

## Dictation

settings-dictation-title = Diktering
settings-dictation-description = Håll ned { $keys } och prata för att skriva det du säger, i vilken app som helst. Släpp för att avsluta eller tryck på Esc för att avbryta. Allt sker på den här datorn: din röst lämnar den aldrig och sparas inte.
settings-dictation-description-no-shortcut = Välj ett kortkommando nedan för att diktera. Allt sker på den här datorn: din röst lämnar den aldrig och sparas inte.
settings-dictation-not-installed = Diktering är inte installerat på den här datorn
settings-dictation-hold = Håll ned { $keys } för att diktera
settings-dictation-needs-shortcut = Av tills ett kortkommando har valts
settings-dictation-copilot-key = Copilot-tangenten
settings-dictation-shortcut = Kortkommando
settings-dictation-shortcut-description = Håll ned det och prata, eller tryck på det för att lyssna tills du trycker igen eller slutar prata
settings-dictation-shortcut-own = Eget kortkommando
settings-dictation-shortcut-another = Ett annat kortkommando …
settings-dictation-shortcut-off = Av
settings-dictation-keys = Tangenter
settings-dictation-change = Ändra
settings-dictation-language = Språk
settings-dictation-language-automatic = Automatiskt
settings-dictation-language-automatic-current = Automatiskt ({ $language })
settings-dictation-language-description = Automatiskt följer tangentbordslayouten du skriver med
settings-dictation-language-unavailable = Språket { $language } är inte tillgängligt på den här datorn
settings-dictation-engine = Taligenkänning
settings-dictation-engine-automatic = Automatiskt
settings-dictation-engine-description = { $engine } känner igen { $language }
settings-dictation-engine-graphics-card = { $engine } känner igen { $language } på grafikkortet
settings-dictation-models = Talmodeller
settings-dictation-models-description = Modellerna hämtas en gång och sparas på den här datorn.
settings-dictation-credits = Erkännanden
settings-dictation-credit = { $credit }. Licensierad under { $licence }.
settings-dictation-learn-more = Läs mer

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Det gick inte att hämta: { $reason }
settings-dictation-model-downloading = { $received } av { $total }
settings-dictation-model-installed = { $size } på den här datorn
settings-dictation-model-partial = { $received } av { $total } hämtat
settings-dictation-model-size = { $size } att hämta
settings-dictation-model-retry = Försök igen
settings-dictation-model-cancel = Avbryt
settings-dictation-model-resume = Återuppta
settings-dictation-model-download = Hämta
settings-dictation-model-remove = Ta bort

## Mouse and touchpad

settings-mouse-mouse = Mus
settings-mouse-primary-button = Primär knapp
settings-mouse-primary-button-description = Knappen du klickar med för att markera saker
settings-mouse-primary-button-left = Vänster
settings-mouse-primary-button-right = Höger
settings-mouse-speed = Pekarhastighet
settings-mouse-slower = Långsammare
settings-mouse-faster = Snabbare
settings-mouse-acceleration = Musacceleration
settings-mouse-acceleration-description = Pekaren rör sig längre när du flyttar musen snabbt
settings-mouse-natural-scrolling = Naturlig rullning
settings-mouse-natural-scrolling-description = Rullningen flyttar innehållet i stället för vyn
settings-mouse-touchpad = Styrplatta
settings-mouse-touchpad-speed = Pekarhastighet för styrplattan
settings-mouse-touchpad-scroll-speed = Rullningshastighet
settings-mouse-touchpad-scroll-speed-label = Rullningshastighet för styrplattan
settings-mouse-touchpad-tap = Tryck för att klicka
settings-mouse-touchpad-tap-description = Knacka lätt på styrplattan i stället för att trycka ned den
settings-mouse-touchpad-natural-scrolling = Naturlig rullning på styrplattan
settings-mouse-touchpad-natural-scrolling-description = Innehållet rör sig åt samma håll som fingrarna
settings-mouse-touchpad-scroll-with = Rulla med
settings-mouse-touchpad-two-fingers = Två fingrar
settings-mouse-touchpad-scroll-edge = Kanten
settings-mouse-touchpad-secondary-click = Sekundärklick
settings-mouse-touchpad-secondary-click-description = Hur du högerklickar utan en separat knapp
settings-mouse-touchpad-click-corner = Hörnet
settings-mouse-touchpad-disable-typing = Stäng av medan du skriver
settings-mouse-touchpad-disable-typing-description = Så att pekaren inte hoppar medan du skriver
