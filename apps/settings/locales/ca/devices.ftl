## Displays

settings-display-mirror = Duplica les pantalles
settings-display-mirror-description = Mostra la mateixa imatge a totes les pantalles
settings-display-mirrored = Pantalles duplicades
settings-display-display = Pantalla
settings-display-apply-failed = Aquesta configuració no ha funcionat. Proveu-ne una altra.
settings-display-reset = Restableix
settings-display-apply = Aplica
settings-display-arrangement-main = { $name }, pantalla principal
settings-display-use = Fes servir aquesta pantalla
settings-display-main = Pantalla principal
settings-display-main-description = La barra de tasques i les finestres noves apareixen aquí
settings-display-resolution-title = Resolució
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Freqüència d’actualització
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Freqüència d’actualització variable
settings-display-variable-refresh-description = La pantalla segueix la freqüència de fotogrames dels jocs a pantalla completa perquè el moviment sigui més fluid
settings-display-variable-refresh-off = Desactivada
settings-display-variable-refresh-games = En els jocs
settings-display-variable-refresh-fullscreen = En totes les aplicacions a pantalla completa
settings-display-scale = Escala
settings-display-scale-description = Fa més grans o més petits el text, les aplicacions i tota la resta
settings-display-orientation = Orientació
settings-display-orientation-landscape = Horitzontal
settings-display-orientation-portrait-right = Vertical cap a la dreta
settings-display-orientation-portrait-left = Vertical cap a l’esquerra
settings-display-orientation-landscape-flipped = Horitzontal, invertida

## Display brightness

settings-display-brightness = Brillantor
settings-display-brightness-label = Brillantor: { $name }
settings-display-brightness-unsupported = Activeu el DDC/CI al menú de la pantalla per canviar-la des d’aquí
settings-display-brightness-unresponsive = Ara no respon; es tornarà a provar d’aquí a poc
settings-display-brightness-external = Pantalles externes
settings-display-brightness-missing-tool = Instal·leu ddcutil per canviar-ne la brillantor des d’aquí
settings-display-brightness-needs-restart = Reinicieu per acabar de configurar-ne la brillantor
settings-display-brightness-no-access = Tanqueu la sessió i torneu-la a iniciar per canviar-ne la brillantor des d’aquí

## Night light

settings-display-night-light = Llum nocturna
settings-display-night-light-description = Colors més càlids al vespre, més descansats per a la vista
settings-display-night-light-schedule = Programació
settings-display-night-light-automatic = De la posta a la sortida del sol
settings-display-night-light-custom = Personalitzada
settings-display-night-light-from = S’activa
settings-display-night-light-to = Es desactiva
settings-display-night-light-warmth = Calidesa

## Sound

settings-sound-output = Sortida
settings-sound-input = Entrada
settings-sound-device = Dispositiu
settings-sound-output-device = Dispositiu de sortida
settings-sound-input-device = Dispositiu d’entrada
settings-sound-connection = Connexió
settings-sound-output-connection = Connexió de sortida
settings-sound-input-connection = Connexió d’entrada
settings-sound-volume = Volum
settings-sound-mute = Silencia: { $name }
settings-sound-unmute = Activa el so: { $name }
settings-sound-balance = Balanç
settings-sound-balance-center = Centre
settings-sound-balance-left = { $share } a l’esquerra
settings-sound-balance-right = { $share } a la dreta
settings-sound-louder = Permet un volum superior al 100 %
settings-sound-louder-description = El so es pot distorsionar a volums alts
settings-sound-input-level = Nivell d’entrada
settings-sound-apps = Volum de les aplicacions
settings-sound-apps-playing = { $count ->
    [one] { $count } aplicació reprodueix so
   *[other] { $count } aplicacions reprodueixen so
}
settings-sound-app-output = Sortida de { $app }
settings-sound-profiles = Perfils dels dispositius
settings-sound-profiles-row-description = Trieu com es fa servir cada dispositiu de so
settings-sound-profiles-description = Com es fa servir cada dispositiu de so, per exemple en estèreo o en so envolvent
settings-sound-profile-label = Ús de { $device }
settings-sound-profile-off = Desactivat

## System sounds

settings-sound-system = Sons del sistema
settings-sound-system-description = Sons per a notificacions, dispositius i altres esdeveniments
settings-sound-system-volume = Volum dels sons del sistema
settings-sound-kind-notifications = Notificacions
    .description = En silenci amb No molestis, durant els jocs i en compartir la pantalla
    .preview = Reprodueix el so de notificació
settings-sound-kind-devices = Dispositius i càrrega
    .description = En connectar un dispositiu o un carregador, i amb la bateria baixa
    .preview = Reprodueix el so de dispositiu
settings-sound-kind-volume = Resposta del volum
    .description = Un clic quan canvieu el volum
    .preview = Reprodueix el clic del volum
settings-sound-kind-screenshots = Captures de pantalla
    .description = Un so d’obturador quan es desa una captura de pantalla
    .preview = Reprodueix l’obturador
settings-sound-kind-recording = Enregistrament
    .description = Quan l’enregistrament de pantalla, la càmera o el dictat comencen i s’aturen
    .preview = Reprodueix el so d’enregistrament
settings-sound-kind-sign-in = So d’inici de sessió
    .description = Quan apareix l’escriptori
    .preview = Reprodueix el so d’inici de sessió
settings-sound-kind-keyboard = Tecleig
    .description = Cada tecla del teclat en pantalla
    .preview = Reprodueix una pulsació de tecla

## Power and battery

settings-power-battery = Bateria
settings-power-charging = Carregant
settings-power-charging-at = Carregant a { $power }
settings-power-charging-until-full = Carregant, plena d’aquí a { $time }
settings-power-charging-at-until-full = Carregant a { $power }, plena d’aquí a { $time }
settings-power-on-battery = Amb bateria
settings-power-on-battery-using = Amb bateria, consum de { $power }
settings-power-time-left = Queden aproximadament { $time }
settings-power-time-left-using = Queden aproximadament { $time }, consum de { $power }
settings-power-full = Carregada del tot
settings-power-empty = Buida
settings-power-not-charging = Endollada, no carrega
settings-power-health = Estat de la bateria
settings-power-capacity = { $full } de { $design } quan era nova
settings-power-cycles = { $count ->
    [one] { $cycles } cicle de càrrega
   *[other] { $cycles } cicles de càrrega
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Mostra el percentatge
settings-power-show-percentage-description = Mostra el nivell de la bateria dins de la icona de la bateria

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = menys d’un minut
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuts
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } hores
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } hores
} { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuts
}
settings-power-never = Mai

## Charge limit

settings-power-limit = Limita la càrrega
settings-power-limit-failed = No s’ha pogut canviar el límit. Torneu-ho a provar.
settings-power-limit-elsewhere-off = Una altra aplicació l’ha desactivat i la bateria es carrega del tot
settings-power-limit-elsewhere-changed = Una altra aplicació ha canviat el límit al { $level }
settings-power-limit-elsewhere-on = Una altra aplicació atura la càrrega al { $level }
settings-power-limit-automatic = L’ordinador decideix quan s’atura la càrrega
settings-power-limit-stops-at = La càrrega s’atura al { $level }
settings-power-limit-description = Atura la càrrega abans d’hora perquè la bateria duri més
settings-power-limit-description-at = S’atura al { $level } perquè la bateria duri més
settings-power-limit-applied = La càrrega s’atura al { $level }
settings-power-limit-applied-description = Ho ha establert una altra aplicació d’aquest ordinador

## Battery-powered devices

settings-power-devices = Dispositius
settings-power-device-mouse = Ratolí
settings-power-device-keyboard = Teclat
settings-power-device-headphones = Auriculars
settings-power-device-speaker = Altaveu
settings-power-device-controller = Comandament
settings-power-device-phone = Telèfon
settings-power-device-tablet = Tauleta
settings-power-device-pen = Llapis
settings-power-device-touchpad = Ratolí tàctil
settings-power-device-other = Dispositiu

## Power mode

settings-power-mode = Mode d’energia
settings-power-mode-row = Mode
settings-power-profile-saver = Estalvi d’energia
    .description = Més lent, i consumeix menys energia
settings-power-profile-balanced = Equilibrat
    .description = Rendiment i consum habituals
settings-power-profile-performance = Rendiment
    .description = Més ràpid, i consumeix més energia
settings-power-limited = Ara mateix el rendiment està limitat
settings-power-limited-lap = El rendiment està limitat perquè l’ordinador és sobre la falda
settings-power-limited-hot = El rendiment està limitat perquè l’ordinador està massa calent
settings-power-limited-lap-hot = El rendiment està limitat perquè l’ordinador és sobre la falda i està massa calent
settings-power-saver-low-battery = Estalvi d’energia amb la bateria baixa
settings-power-saver-low-battery-description = Passa a estalvi d’energia quan la bateria s’esgota

## Keyboard backlight

settings-power-keyboard = Teclat
settings-power-backlight = Retroil·luminació del teclat
settings-power-backlight-off = Desactivada
settings-power-backlight-low = Baixa
settings-power-backlight-medium = Mitjana
settings-power-backlight-high = Alta

## Screen and sleep

settings-power-screen = Pantalla
settings-power-screen-off = Apaga la pantalla després de
settings-power-screen-off-description = Quan fa una estona que no feu servir l’ordinador
settings-power-dim = Atenua la pantalla en inactivitat
settings-power-dim-description = Abaixa la brillantor poc abans que s’apagui la pantalla
settings-power-sleep = Suspensió
settings-power-suspend-plugged-in = Suspèn quan està endollat
settings-power-suspend-inactive = Suspèn quan està inactiu
settings-power-suspend-description = Suspèn l’ordinador després d’una estona sense fer-lo servir
settings-power-suspend-battery = Suspèn amb bateria
settings-power-button = Botó d’engegada
settings-power-button-suspend = Suspèn
settings-power-button-hibernate = Hiberna
settings-power-button-ask = Pregunta què cal fer
settings-power-button-nothing = No facis res
settings-power-long-sleep = Apaga després d’una suspensió llarga
settings-power-long-sleep-description = En lloc de deixar que la bateria s’esgoti durant la suspensió, l’ordinador s’apaga quan la bateria baixa o després d’una suspensió llarga amb bateria. Les finestres obertes no es conserven.
settings-power-long-sleep-failed = No s’ha pogut canviar. Torneu-ho a provar.
settings-power-long-sleep-after = Apaga després de
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } hores
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dia
   *[other] { $days } dies
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } setmana
   *[other] { $weeks } setmanes
}

## Keyboard

settings-keyboard-sources = Fonts d’entrada
settings-keyboard-sources-description = La primera és la predeterminada. Podeu canviar d’una a l’altra mentre escriviu.
settings-keyboard-source-edit = Edita a Keys
settings-keyboard-source-up = Mou amunt
settings-keyboard-source-down = Mou avall
settings-keyboard-source-remove = Treu
settings-keyboard-add-source-button = Afegeix una font d’entrada
settings-keyboard-own = Disposicions i mètodes d’entrada propis
settings-keyboard-own-layout = Crea una disposició
settings-keyboard-own-layout-description = Partiu d’una disposició i canvieu què escriuen les tecles
settings-keyboard-own-method = Crea un mètode d’entrada
settings-keyboard-own-method-description = Convertiu el que escriviu en accents, altres alfabets o paraules per triar
settings-keyboard-own-open = Obre Keys
settings-keyboard-own-open-description = Editeu les disposicions i els mètodes d’entrada que heu creat
settings-keyboard-switch-source = Canvia la font d’entrada
settings-keyboard-add-source = Afegiu una font d’entrada
settings-keyboard-add-source-description = Trieu la disposició de teclat o el mètode d’entrada amb què voleu escriure.
settings-keyboard-add-source-search = Cerca llengües, disposicions i mètodes d’entrada
settings-keyboard-input-method = Mètode d’entrada
settings-keyboard-add-source-no-match = No hi ha cap coincidència amb «{ $query }»
settings-keyboard-cancel = Cancel·la
settings-keyboard-add = Afegeix
settings-keyboard-typing = Escriptura
settings-keyboard-repeat = Repetició de tecles
settings-keyboard-repeat-description = Si manteniu premuda una tecla, s’escriu una vegada i una altra
settings-keyboard-repeat-delay = Retard abans de repetir
settings-keyboard-repeat-delay-shorter = Més curt
settings-keyboard-repeat-delay-longer = Més llarg
settings-keyboard-repeat-speed = Velocitat de repetició
settings-keyboard-repeat-speed-slower = Més lenta
settings-keyboard-repeat-speed-faster = Més ràpida
settings-keyboard-caps-lock = Tecla Bloq Maj
settings-keyboard-caps-lock-description = Què passa quan la premeu
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Intercanvia-la amb Esc
settings-keyboard-caps-lock-nothing = Res
settings-keyboard-caps-lock-custom = Personalitzat
settings-keyboard-lock-notices = Mostra Bloq Maj i Bloq Núm
settings-keyboard-lock-notices-description = Ho indica breument a la pantalla quan s’activen o es desactiven
settings-keyboard-dictation-on = Activat
settings-keyboard-dictation-off = Desactivat
settings-keyboard-shortcuts-description = Consulteu i canvieu les dreceres, o afegiu-ne de pròpies

## Copilot key

settings-keyboard-copilot = Tecla Copilot
settings-keyboard-copilot-press = Pulsació
settings-keyboard-copilot-press-description = Què fa una pulsació curta de la tecla
settings-keyboard-copilot-open-start = Obre Inici
settings-keyboard-copilot-open-app = Obre una aplicació
settings-keyboard-copilot-nothing = Res
settings-keyboard-copilot-app = Aplicació
settings-keyboard-copilot-no-app = Encara no s’ha triat cap aplicació
settings-keyboard-copilot-change = Canvia
settings-keyboard-copilot-choose = Tria
settings-keyboard-copilot-hold = Mantén premut per dictar
settings-keyboard-copilot-hold-description = Manteniu premuda la tecla i parleu per escriure el que dieu
settings-keyboard-copilot-hold-off = Funciona quan el dictat està activat
settings-keyboard-copilot-choose-app = Trieu una aplicació
settings-keyboard-copilot-choose-app-description = S’obre en prémer la tecla Copilot.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Maj
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Impr Pant
settings-keys-page-up = Re Pàg
settings-keys-page-down = Av Pàg
settings-keys-home = Inici
settings-keys-end = Fi
settings-keys-insert = Insert
settings-keys-delete = Supr
settings-keys-tab = Tab
settings-keys-space = Espai
settings-keys-enter = Retorn
settings-keys-backspace = Retrocés
settings-keys-escape = Esc
settings-keys-pause = Pausa
settings-keys-scroll-lock = Bloq Despl
settings-keys-caps-lock = Bloq Maj
settings-keys-menu = Menú
settings-keys-keypad = { $key } (teclat numèric)
settings-keys-volume-up = Apuja el volum
settings-keys-volume-down = Abaixa el volum
settings-keys-mute = Silencia
settings-keys-microphone-mute = Silencia el micròfon
settings-keys-play = Reprodueix
settings-keys-media-pause = Pausa
settings-keys-stop = Atura
settings-keys-next-track = Pista següent
settings-keys-previous-track = Pista anterior
settings-keys-brightness-up = Apuja la brillantor
settings-keys-brightness-down = Abaixa la brillantor
settings-keys-browser = Navegador
settings-keys-home-page = Pàgina d’inici
settings-keys-search = Cerca
settings-keys-mail = Correu
settings-keys-calculator = Calculadora
settings-keys-files = Fitxers
settings-keys-eject = Expulsa
settings-keys-power = Engegada
settings-keys-lock = Bloqueja

## Keyboard shortcuts

settings-shortcuts-title = Dreceres de teclat
settings-shortcuts-search = Cerca dreceres
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Finestres
settings-shortcuts-category-workspaces = Espais de treball
settings-shortcuts-category-screenshots = Captures de pantalla
settings-shortcuts-category-media = Multimèdia
settings-shortcuts-reset = Restableix el valor predeterminat
settings-shortcuts-apps = Dreceres d’aplicacions
settings-shortcuts-apps-description = Les que han demanat les aplicacions, que funcionen encara que l’aplicació no estigui en primer pla
settings-shortcuts-no-match = Cap drecera coincideix amb «{ $query }»
settings-shortcuts-change = Canvia la drecera de { $name }
settings-shortcuts-or = o
settings-shortcuts-not-set = Sense assignar
settings-shortcuts-press-keys = Premeu les tecles que vulgueu
settings-shortcuts-needs-modifier = Afegiu Ctrl, Alt o Super perquè la drecera no interfereixi quan escriviu.
settings-shortcuts-record-description = Premeu la drecera nova. Retrocés la desactiva i Esc cancel·la.
settings-shortcuts-record-taken = Aquesta drecera ja es fa servir per a «{ $name }». Si la substituïu, es desactivarà allà.
settings-shortcuts-try-another = Prova’n una altra
settings-shortcuts-replace = Substitueix
settings-shortcuts-cancel = Cancel·la
settings-shortcuts-custom = Dreceres personalitzades
settings-shortcuts-custom-description = Executeu una ordre o obriu una aplicació amb una combinació de tecles
settings-shortcuts-untitled = Sense nom
settings-shortcuts-add = Afegeix una drecera
settings-shortcuts-edit = Edita la drecera
settings-shortcuts-custom-name = Nom
settings-shortcuts-custom-command = Ordre
settings-shortcuts-custom-shortcut = Drecera
settings-shortcuts-custom-taken = Ja es fa servir per a «{ $name }». Si la deseu, es desactivarà allà.
settings-shortcuts-remove = Treu
settings-shortcuts-save = Desa
settings-shortcuts-add-button = Afegeix

## Dictation

settings-dictation-title = Dictat
settings-dictation-description = Manteniu premut { $keys } i parleu per escriure el que dieu, en qualsevol aplicació. Deixeu-ho anar per acabar, o premeu Esc per cancel·lar. Tot passa en aquest ordinador: la vostra veu no en surt mai i no es desa.
settings-dictation-description-no-shortcut = Trieu una drecera a sota per dictar. Tot passa en aquest ordinador: la vostra veu no en surt mai i no es desa.
settings-dictation-not-installed = El dictat no està instal·lat en aquest ordinador
settings-dictation-hold = Manteniu premut { $keys } per dictar
settings-dictation-needs-shortcut = Desactivat fins que tingui una drecera
settings-dictation-copilot-key = la tecla Copilot
settings-dictation-shortcut = Drecera
settings-dictation-shortcut-description = Manteniu-la premuda per parlar, o premeu-la perquè escolti fins que la torneu a prémer o deixeu de parlar
settings-dictation-shortcut-own = Una drecera pròpia
settings-dictation-shortcut-another = Una altra drecera…
settings-dictation-shortcut-off = Desactivat
settings-dictation-keys = Tecles
settings-dictation-change = Canvia
settings-dictation-language = Llengua
settings-dictation-language-automatic = Automàtica
settings-dictation-language-automatic-current = Automàtica ({ $language })
settings-dictation-language-description = En mode automàtic, segueix la disposició de teclat amb què escriviu
settings-dictation-language-unavailable = Aquesta llengua no està disponible en aquest ordinador: { $language }
settings-dictation-engine = Reconeixement de veu
settings-dictation-engine-automatic = Automàtic
settings-dictation-engine-description = { $engine } reconeix aquesta llengua: { $language }
settings-dictation-engine-graphics-card = { $engine } reconeix aquesta llengua amb la targeta gràfica: { $language }
settings-dictation-models = Models de veu
settings-dictation-models-description = Els models es baixen una sola vegada i es conserven en aquest ordinador.
settings-dictation-credits = Crèdits
settings-dictation-credit = { $credit }. Llicència: { $licence }.
settings-dictation-learn-more = Més informació

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = No s’ha pogut baixar: { $reason }
settings-dictation-model-downloading = { $received } de { $total }
settings-dictation-model-installed = { $size } en aquest ordinador
settings-dictation-model-partial = { $received } de { $total } baixats
settings-dictation-model-size = { $size } per baixar
settings-dictation-model-retry = Torna-ho a provar
settings-dictation-model-cancel = Cancel·la
settings-dictation-model-resume = Reprèn
settings-dictation-model-download = Baixa
settings-dictation-model-remove = Suprimeix

## Mouse and touchpad

settings-mouse-mouse = Ratolí
settings-mouse-primary-button = Botó principal
settings-mouse-primary-button-description = El botó amb què feu clic per seleccionar
settings-mouse-primary-button-left = Esquerre
settings-mouse-primary-button-right = Dret
settings-mouse-speed = Velocitat del punter
settings-mouse-slower = Més lent
settings-mouse-faster = Més ràpid
settings-mouse-acceleration = Acceleració del ratolí
settings-mouse-acceleration-description = El punter es desplaça més lluny quan moveu el ratolí de pressa
settings-mouse-natural-scrolling = Desplaçament natural
settings-mouse-natural-scrolling-description = El desplaçament mou el contingut en lloc de la vista
settings-mouse-touchpad = Ratolí tàctil
settings-mouse-touchpad-speed = Velocitat del punter del ratolí tàctil
settings-mouse-touchpad-scroll-speed = Velocitat de desplaçament
settings-mouse-touchpad-scroll-speed-label = Velocitat de desplaçament del ratolí tàctil
settings-mouse-touchpad-tap = Toc per fer clic
settings-mouse-touchpad-tap-description = Toqueu el ratolí tàctil en lloc de prémer-lo
settings-mouse-touchpad-natural-scrolling = Desplaçament natural del ratolí tàctil
settings-mouse-touchpad-natural-scrolling-description = El contingut es mou en la mateixa direcció que els dits
settings-mouse-touchpad-scroll-with = Desplaçament amb
settings-mouse-touchpad-two-fingers = Dos dits
settings-mouse-touchpad-scroll-edge = Vora
settings-mouse-touchpad-secondary-click = Clic secundari
settings-mouse-touchpad-secondary-click-description = Com fer clic dret sense un botó a part
settings-mouse-touchpad-click-corner = Cantonada
settings-mouse-touchpad-disable-typing = Desactiva’l mentre s’escriu
settings-mouse-touchpad-disable-typing-description = Perquè el punter no salti mentre escriviu
