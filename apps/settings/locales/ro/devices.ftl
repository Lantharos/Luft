## Displays

settings-display-mirror = Oglindire ecrane
settings-display-mirror-description = Afișează aceeași imagine pe toate ecranele
settings-display-mirrored = Ecrane oglindite
settings-display-display = Ecran
settings-display-apply-failed = Aceste setări nu au funcționat. Încercați o altă configurație.
settings-display-reset = Resetează
settings-display-apply = Aplică
settings-display-arrangement-main = { $name }, ecran principal
settings-display-use = Folosește acest ecran
settings-display-main = Ecran principal
settings-display-main-description = Bara de activități și ferestrele noi apar aici
settings-display-resolution-title = Rezoluție
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Rată de reîmprospătare
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Rată de reîmprospătare variabilă
settings-display-variable-refresh-description = Ecranul urmează rata de cadre a jocurilor pe ecran complet, pentru o mișcare mai fluidă
settings-display-variable-refresh-off = Dezactivată
settings-display-variable-refresh-games = În jocuri
settings-display-variable-refresh-fullscreen = În toate aplicațiile pe ecran complet
settings-display-scale = Scalare
settings-display-scale-description = Mărește sau micșorează textul, aplicațiile și toate celelalte elemente
settings-display-orientation = Orientare
settings-display-orientation-landscape = Peisaj
settings-display-orientation-portrait-right = Portret spre dreapta
settings-display-orientation-portrait-left = Portret spre stânga
settings-display-orientation-landscape-flipped = Peisaj, întors

## Display brightness

settings-display-brightness = Luminozitate
settings-display-brightness-label = Luminozitate { $name }
settings-display-brightness-unsupported = Activați DDC/CI din meniul ecranului pentru a o schimba de aici
settings-display-brightness-unresponsive = Nu răspunde momentan, se reîncearcă în curând
settings-display-brightness-external = Ecrane externe
settings-display-brightness-missing-tool = Instalați ddcutil pentru a le schimba luminozitatea de aici
settings-display-brightness-needs-restart = Reporniți pentru a termina configurarea luminozității lor
settings-display-brightness-no-access = Deconectați-vă și conectați-vă din nou pentru a le schimba luminozitatea de aici

## Night light

settings-display-night-light = Lumină de noapte
settings-display-night-light-description = Culori mai calde seara, mai odihnitoare pentru ochi
settings-display-night-light-schedule = Program
settings-display-night-light-automatic = De la apus la răsărit
settings-display-night-light-custom = Personalizat
settings-display-night-light-from = Se activează
settings-display-night-light-to = Se dezactivează
settings-display-night-light-warmth = Căldură

## Sound

settings-sound-output = Ieșire
settings-sound-input = Intrare
settings-sound-device = Dispozitiv
settings-sound-output-device = Dispozitiv de ieșire
settings-sound-input-device = Dispozitiv de intrare
settings-sound-connection = Conexiune
settings-sound-output-connection = Conexiune de ieșire
settings-sound-input-connection = Conexiune de intrare
settings-sound-volume = Volum
settings-sound-mute = Dezactivează sunetul pentru { $name }
settings-sound-unmute = Activează sunetul pentru { $name }
settings-sound-balance = Balans
settings-sound-balance-center = Centru
settings-sound-balance-left = { $share } stânga
settings-sound-balance-right = { $share } dreapta
settings-sound-louder = Permite peste 100%
settings-sound-louder-description = La volum mare, sunetul poate fi distorsionat
settings-sound-input-level = Nivel de intrare
settings-sound-apps = Volumul aplicațiilor
settings-sound-apps-playing = { $count ->
    [one] { $count } aplicație redă sunet
    [few] { $count } aplicații redau sunet
   *[other] { $count } de aplicații redau sunet
}
settings-sound-app-output = Redă { $app } pe
settings-sound-profiles = Profiluri de dispozitiv
settings-sound-profiles-row-description = Alegeți cum este folosit fiecare dispozitiv audio
settings-sound-profiles-description = Cum este folosit fiecare dispozitiv audio, de exemplu stereo sau surround
settings-sound-profile-label = Mod de utilizare pentru { $device }
settings-sound-profile-off = Dezactivat

## System sounds

settings-sound-system = Sunete de sistem
settings-sound-system-description = Sunete pentru notificări, dispozitive și alte evenimente
settings-sound-system-volume = Volumul sunetelor de sistem
settings-sound-kind-notifications = Notificări
    .description = Fără sunet în modul Nu deranjați, în jocuri și la partajarea ecranului
    .preview = Redă sunetul de notificare
settings-sound-kind-devices = Dispozitive și încărcare
    .description = Conectarea unui dispozitiv sau a unui încărcător și bateria descărcată
    .preview = Redă sunetul pentru dispozitive
settings-sound-kind-volume = Semnal la schimbarea volumului
    .description = Un clic atunci când schimbați volumul
    .preview = Redă clicul de volum
settings-sound-kind-screenshots = Capturi de ecran
    .description = Un declanșator atunci când se salvează o captură de ecran
    .preview = Redă declanșatorul
settings-sound-kind-recording = Înregistrare
    .description = Când pornește și se oprește înregistrarea de ecran, camera sau dictarea
    .preview = Redă sunetul de înregistrare
settings-sound-kind-sign-in = Sunet de conectare
    .description = Când apare desktopul
    .preview = Redă sunetul de conectare
settings-sound-kind-keyboard = Atingeri de taste
    .description = Fiecare tastă de pe tastatura de pe ecran
    .preview = Redă o atingere de tastă

## Power and battery

settings-power-battery = Baterie
settings-power-charging = Se încarcă
settings-power-charging-at = Se încarcă la { $power }
settings-power-charging-until-full = Se încarcă, plină în { $time }
settings-power-charging-at-until-full = Se încarcă la { $power }, plină în { $time }
settings-power-on-battery = Pe baterie
settings-power-on-battery-using = Pe baterie, consum: { $power }
settings-power-time-left = Timp rămas: aproximativ { $time }
settings-power-time-left-using = Timp rămas: aproximativ { $time }, consum: { $power }
settings-power-full = Încărcată complet
settings-power-empty = Descărcată
settings-power-not-charging = Conectată la priză, nu se încarcă
settings-power-health = Starea bateriei
settings-power-capacity = { $full } din { $design } când era nouă
settings-power-cycles = { $count ->
    [one] { $cycles } ciclu de încărcare
    [few] { $cycles } cicluri de încărcare
   *[other] { $cycles } de cicluri de încărcare
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Afișează procentul
settings-power-show-percentage-description = Afișează nivelul bateriei în pictograma bateriei

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = mai puțin de un minut
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
    [few] { $minutes } minute
   *[other] { $minutes } de minute
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } oră
    [few] { $hours } ore
   *[other] { $hours } de ore
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } oră
    [few] { $hours } ore
   *[other] { $hours } de ore
} { $minutes ->
    [one] { $minutes } minut
    [few] { $minutes } minute
   *[other] { $minutes } de minute
}
settings-power-never = Niciodată

## Charge limit

settings-power-limit = Limitează încărcarea
settings-power-limit-failed = Limita nu a putut fi schimbată. Încercați din nou.
settings-power-limit-elsewhere-off = O altă aplicație a dezactivat-o, așa că bateria se încarcă complet
settings-power-limit-elsewhere-changed = O altă aplicație a schimbat limita la { $level }
settings-power-limit-elsewhere-on = O altă aplicație oprește încărcarea la { $level }
settings-power-limit-automatic = Computerul decide când să oprească încărcarea
settings-power-limit-stops-at = Încărcarea se oprește la { $level }
settings-power-limit-description = Oprește încărcarea mai devreme, pentru ca bateria să țină mai mult
settings-power-limit-description-at = Se oprește la { $level }, pentru ca bateria să țină mai mult
settings-power-limit-applied = Încărcarea se oprește la { $level }
settings-power-limit-applied-description = Setată de o altă aplicație de pe acest computer

## Battery-powered devices

settings-power-devices = Dispozitive
settings-power-device-mouse = Mouse
settings-power-device-keyboard = Tastatură
settings-power-device-headphones = Căști
settings-power-device-speaker = Difuzor
settings-power-device-controller = Controller
settings-power-device-phone = Telefon
settings-power-device-tablet = Tabletă
settings-power-device-pen = Creion
settings-power-device-touchpad = Touchpad
settings-power-device-other = Dispozitiv

## Power mode

settings-power-mode = Mod de alimentare
settings-power-mode-row = Mod
settings-power-profile-saver = Economisire energie
    .description = Mai lent și consumă mai puțină energie
settings-power-profile-balanced = Echilibrat
    .description = Performanță și consum standard
settings-power-profile-performance = Performanță
    .description = Mai rapid și consumă mai multă energie
settings-power-limited = Performanța este limitată momentan
settings-power-limited-lap = Performanța este limitată, deoarece computerul este pe genunchi
settings-power-limited-hot = Performanța este limitată, deoarece computerul este prea fierbinte
settings-power-limited-lap-hot = Performanța este limitată, deoarece computerul este pe genunchi și este prea fierbinte
settings-power-saver-low-battery = Economisire energie la baterie descărcată
settings-power-saver-low-battery-description = Trece la Economisire energie când bateria se descarcă
settings-power-saver-level = Nivelul bateriei pentru economisirea energiei

## Keyboard backlight

settings-power-keyboard = Tastatură
settings-power-backlight = Iluminarea tastaturii
settings-power-backlight-off = Dezactivată
settings-power-backlight-low = Redusă
settings-power-backlight-medium = Medie
settings-power-backlight-high = Ridicată

## Screen and sleep

settings-power-screen = Ecran
settings-power-screen-off = Oprește ecranul după
settings-power-screen-off-description = Când nu ați folosit computerul de ceva vreme
settings-power-dim = Estompare la inactivitate
settings-power-dim-description = Reduce luminozitatea cu puțin timp înainte de oprirea ecranului
settings-power-sleep = Repaus
settings-power-suspend-plugged-in = Repaus când este conectat la priză
settings-power-suspend-inactive = Repaus la inactivitate
settings-power-suspend-description = Trece computerul în repaus după un timp de neutilizare
settings-power-suspend-battery = Repaus pe baterie
settings-power-button = Butonul de pornire
settings-power-button-suspend = Repaus
settings-power-button-hibernate = Hibernare
settings-power-button-ask = Întreabă ce să facă
settings-power-button-nothing = Nu face nimic
settings-power-long-sleep = Oprire după un repaus lung
settings-power-long-sleep-description = În loc să lase bateria să se descarce complet în repaus, computerul se oprește când bateria scade sau după un repaus lung pe baterie. Ferestrele deschise nu se păstrează.
settings-power-long-sleep-failed = Setarea nu a putut fi schimbată. Încercați din nou.
settings-power-long-sleep-after = Oprește după
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } oră
    [few] { $hours } ore
   *[other] { $hours } de ore
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } zi
    [few] { $days } zile
   *[other] { $days } de zile
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } săptămână
    [few] { $weeks } săptămâni
   *[other] { $weeks } de săptămâni
}

## Keyboard

settings-keyboard-sources = Surse de introducere
settings-keyboard-sources-description = Prima este folosită implicit. Puteți comuta între ele în timp ce tastați.
settings-keyboard-source-edit = Editează în Keys
settings-keyboard-source-up = Mută în sus
settings-keyboard-source-down = Mută în jos
settings-keyboard-source-remove = Elimină
settings-keyboard-add-source-button = Adaugă o sursă de introducere
settings-keyboard-own = Aranjamente și metode de introducere proprii
settings-keyboard-own-layout = Creează un aranjament
settings-keyboard-own-layout-description = Porniți de la un aranjament și schimbați ce scriu tastele lui
settings-keyboard-own-method = Creează o metodă de introducere
settings-keyboard-own-method-description = Transformați ce tastați în diacritice, alte alfabete sau cuvinte dintre care alegeți
settings-keyboard-own-open = Deschide Keys
settings-keyboard-own-open-description = Editați aranjamentele și metodele de introducere create
settings-keyboard-switch-source = Comută sursa de introducere
settings-keyboard-add-source = Adăugați o sursă de introducere
settings-keyboard-add-source-description = Alegeți aranjamentul de tastatură sau metoda de introducere cu care vreți să scrieți.
settings-keyboard-add-source-search = Căutați limbi, aranjamente și metode de introducere
settings-keyboard-input-method = Metodă de introducere
settings-keyboard-add-source-no-match = Nimic nu corespunde cu „{ $query }”
settings-keyboard-cancel = Anulează
settings-keyboard-add = Adaugă
settings-keyboard-typing = Tastare
settings-keyboard-repeat = Repetarea tastelor
settings-keyboard-repeat-description = O tastă ținută apăsată se scrie din nou și din nou
settings-keyboard-repeat-delay = Întârziere până la repetare
settings-keyboard-repeat-delay-shorter = Mai scurtă
settings-keyboard-repeat-delay-longer = Mai lungă
settings-keyboard-repeat-speed = Viteza de repetare
settings-keyboard-repeat-speed-slower = Mai lentă
settings-keyboard-repeat-speed-faster = Mai rapidă
settings-keyboard-caps-lock = Tasta Caps Lock
settings-keyboard-caps-lock-description = Ce se întâmplă când o apăsați
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Inversează cu Esc
settings-keyboard-caps-lock-nothing = Nimic
settings-keyboard-caps-lock-custom = Personalizat
settings-keyboard-lock-notices = Afișează Caps Lock și Num Lock
settings-keyboard-lock-notices-description = Apare scurt pe ecran când oricare dintre ele se activează sau se dezactivează
settings-keyboard-dictation-on = Activată
settings-keyboard-dictation-off = Dezactivată
settings-keyboard-shortcuts-description = Vedeți și schimbați comenzile rapide sau adăugați altele noi

## Copilot key

settings-keyboard-copilot = Tasta Copilot
settings-keyboard-copilot-press = Apăsare
settings-keyboard-copilot-press-description = Ce face o apăsare scurtă a tastei
settings-keyboard-copilot-open-start = Deschide meniul Start
settings-keyboard-copilot-open-app = Deschide o aplicație
settings-keyboard-copilot-nothing = Nimic
settings-keyboard-copilot-app = Aplicație
settings-keyboard-copilot-no-app = Nicio aplicație aleasă încă
settings-keyboard-copilot-change = Schimbă
settings-keyboard-copilot-choose = Alege
settings-keyboard-copilot-hold = Apăsare lungă pentru dictare
settings-keyboard-copilot-hold-description = Țineți tasta apăsată și vorbiți pentru a scrie ce spuneți
settings-keyboard-copilot-hold-off = Funcționează după activarea dictării
settings-keyboard-copilot-choose-app = Alegeți o aplicație
settings-keyboard-copilot-choose-app-description = Tasta Copilot o deschide la apăsare.

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
settings-keys-space = Spațiu
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Meniu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Volum mai tare
settings-keys-volume-down = Volum mai încet
settings-keys-mute = Fără sunet
settings-keys-microphone-mute = Microfon dezactivat
settings-keys-play = Redare
settings-keys-media-pause = Pauză
settings-keys-stop = Stop
settings-keys-next-track = Piesa următoare
settings-keys-previous-track = Piesa anterioară
settings-keys-brightness-up = Luminozitate mai mare
settings-keys-brightness-down = Luminozitate mai mică
settings-keys-browser = Browser
settings-keys-home-page = Pagina de pornire
settings-keys-search = Căutare
settings-keys-mail = E-mail
settings-keys-calculator = Calculator
settings-keys-files = Fișiere
settings-keys-eject = Scoatere
settings-keys-power = Alimentare
settings-keys-lock = Blocare

## Keyboard shortcuts

settings-shortcuts-title = Comenzi rapide
settings-shortcuts-search = Caută comenzi rapide
settings-shortcuts-category-system = Sistem
settings-shortcuts-category-windows = Ferestre
settings-shortcuts-category-tiling = Mozaic
settings-shortcuts-category-workspaces = Spații de lucru
settings-shortcuts-category-screenshots = Capturi de ecran
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Resetează la valoarea implicită
settings-shortcuts-apps = Comenzi rapide ale aplicațiilor
settings-shortcuts-apps-description = Cerute de aplicații, funcționează chiar și când aplicația nu este în prim-plan
settings-shortcuts-no-match = Nicio comandă rapidă nu corespunde cu „{ $query }”
settings-shortcuts-change = Schimbă comanda rapidă pentru { $name }
settings-shortcuts-or = sau
settings-shortcuts-not-set = Nesetată
settings-shortcuts-press-keys = Apăsați tastele dorite
settings-shortcuts-needs-modifier = Adăugați Ctrl, Alt sau Super, ca să nu vă încurce comanda rapidă la tastare.
settings-shortcuts-record-description = Apăsați noua comandă rapidă. Backspace o dezactivează, Esc anulează.
settings-shortcuts-record-taken = Această comandă rapidă este deja folosită pentru „{ $name }”. Dacă o înlocuiți, acolo se dezactivează.
settings-shortcuts-try-another = Încearcă alta
settings-shortcuts-replace = Înlocuiește
settings-shortcuts-cancel = Anulează
settings-shortcuts-custom = Comenzi rapide personalizate
settings-shortcuts-custom-description = Rulați o comandă sau deschideți o aplicație cu o combinație de taste
settings-shortcuts-untitled = Fără nume
settings-shortcuts-add = Adaugă o comandă rapidă
settings-shortcuts-edit = Editează comanda rapidă
settings-shortcuts-custom-name = Nume
settings-shortcuts-custom-command = Comandă
settings-shortcuts-custom-shortcut = Comandă rapidă
settings-shortcuts-custom-taken = Folosită deja pentru „{ $name }”. Dacă salvați, acolo se dezactivează.
settings-shortcuts-remove = Elimină
settings-shortcuts-save = Salvează
settings-shortcuts-add-button = Adaugă

## Dictation

settings-dictation-title = Dictare
settings-dictation-description = Țineți apăsat { $keys } și vorbiți pentru a scrie ce spuneți, în orice aplicație. Eliberați pentru a termina sau apăsați Esc pentru a anula. Totul se petrece pe acest computer: vocea nu părăsește niciodată computerul și nu este salvată.
settings-dictation-description-no-shortcut = Alegeți mai jos o comandă rapidă pentru dictare. Totul se petrece pe acest computer: vocea nu părăsește niciodată computerul și nu este salvată.
settings-dictation-not-installed = Dictarea nu este instalată pe acest computer
settings-dictation-hold = Țineți apăsat { $keys } pentru dictare
settings-dictation-needs-shortcut = Dezactivată până când are o comandă rapidă
settings-dictation-copilot-key = tasta Copilot
settings-dictation-shortcut = Comandă rapidă
settings-dictation-shortcut-description = Țineți-o apăsată ca să vorbiți sau apăsați-o ca să ascultați până când o apăsați din nou sau nu mai vorbiți
settings-dictation-shortcut-own = Comandă rapidă proprie
settings-dictation-shortcut-another = Altă comandă rapidă…
settings-dictation-shortcut-off = Dezactivată
settings-dictation-keys = Taste
settings-dictation-change = Schimbă
settings-dictation-language = Limbă
settings-dictation-language-automatic = Automat
settings-dictation-language-automatic-current = Automat ({ $language })
settings-dictation-language-description = Automat urmează aranjamentul de tastatură cu care scrieți
settings-dictation-language-unavailable = Limba { $language } nu este disponibilă pe acest computer
settings-dictation-engine = Recunoaștere vocală
settings-dictation-engine-automatic = Automat
settings-dictation-engine-description = { $engine } recunoaște limba { $language }
settings-dictation-engine-graphics-card = { $engine } recunoaște limba { $language } pe placa video
settings-dictation-models = Modele de vorbire
settings-dictation-models-description = Modelele se descarcă o singură dată și rămân pe acest computer.
settings-dictation-credits = Mulțumiri
settings-dictation-credit = { $credit }. Licență: { $licence }.
settings-dictation-learn-more = Aflați mai multe

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Descărcarea nu a reușit: { $reason }
settings-dictation-model-downloading = { $received } din { $total }
settings-dictation-model-installed = { $size } pe acest computer
settings-dictation-model-partial = Descărcat: { $received } din { $total }
settings-dictation-model-size = De descărcat: { $size }
settings-dictation-model-retry = Încearcă din nou
settings-dictation-model-cancel = Anulează
settings-dictation-model-resume = Reia
settings-dictation-model-download = Descarcă
settings-dictation-model-remove = Elimină

## Mouse and touchpad

settings-mouse-mouse = Mouse
settings-mouse-primary-button = Buton principal
settings-mouse-primary-button-description = Butonul pe care faceți clic pentru a selecta
settings-mouse-primary-button-left = Stânga
settings-mouse-primary-button-right = Dreapta
settings-mouse-speed = Viteza indicatorului
settings-mouse-slower = Mai lent
settings-mouse-faster = Mai rapid
settings-mouse-acceleration = Accelerarea mouse-ului
settings-mouse-acceleration-description = Indicatorul se deplasează mai departe când mișcați mouse-ul repede
settings-mouse-natural-scrolling = Derulare naturală
settings-mouse-natural-scrolling-description = Derularea mută conținutul, nu vizualizarea
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Viteza indicatorului pe touchpad
settings-mouse-touchpad-scroll-speed = Viteza de derulare
settings-mouse-touchpad-scroll-speed-label = Viteza de derulare pe touchpad
settings-mouse-touchpad-tap = Atingere pentru clic
settings-mouse-touchpad-tap-description = Atingeți touchpadul în loc să-l apăsați
settings-mouse-touchpad-natural-scrolling = Derulare naturală pe touchpad
settings-mouse-touchpad-natural-scrolling-description = Conținutul se mișcă în aceeași direcție ca degetele
settings-mouse-touchpad-scroll-with = Derulare cu
settings-mouse-touchpad-two-fingers = Două degete
settings-mouse-touchpad-scroll-edge = Marginea
settings-mouse-touchpad-secondary-click = Clic secundar
settings-mouse-touchpad-secondary-click-description = Cum faceți clic dreapta fără un buton separat
settings-mouse-touchpad-click-corner = Colțul
settings-mouse-touchpad-disable-typing = Dezactivare în timpul tastării
settings-mouse-touchpad-disable-typing-description = Ca indicatorul să nu sară în timp ce tastați
