## Shared

system-cancel = Cancel·la

## Dictation notifications

dictation-setup-title = Escriviu parlant
dictation-setup-body = Parleu per escriure el que dieu, en qualsevol aplicació. Funciona en aquest ordinador, així que primer necessita el model de veu.
dictation-setup-action = Configura el dictat
dictation-unsupported-title = El dictat en { $language } no està disponible en aquest ordinador
dictation-unsupported-body = El processador no pot executar el reconeixedor de veu que necessita la llengua { $language }. Podeu dictar en una altra llengua.
dictation-settings-action = Configuració del dictat

## System health notifications

health-gpu-reset-title = El controlador gràfic ha deixat de respondre
health-gpu-reset-body = { $day ->
    [today] L’ordinador s’ha reiniciat sol avui a les { $time }. A la Configuració podeu veure què pot evitar que torni a passar.
   *[other] L’ordinador s’ha reiniciat sol el { $date } a les { $time }. A la Configuració podeu veure què pot evitar que torni a passar.
}
health-gpu-reset-details = Detalls

oom-app-closed-title = S’ha tancat { $app } per alliberar memòria
oom-container-closed-title = S’ha tancat un contenidor per alliberar memòria
oom-closed-body = L’ordinador s’estava quedant sense memòria, així que s’ha tancat perquè la resta continuï responent.
oom-closed-body-with-size = L’ordinador s’estava quedant sense memòria, així que s’ha tancat perquè la resta continuï responent. Feia servir { $size }.
memory-low-title = A Luft li queda poca memòria
memory-low-app-body = { $app } fa servir { $size }. Forceu-ne el tancament perquè la resta continuï responent.
memory-low-container-body = Un contenidor fa servir { $size }. Forceu-ne el tancament perquè la resta continuï responent.
memory-low-force-quit = Força el tancament

## Input source indicator

input-source-indicator = Font d’entrada: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = El mode d’avió està activat al maquinari
media-keys-airplane-mode-on = Mode d’avió activat
media-keys-airplane-mode-off = Mode d’avió desactivat
media-keys-bluetooth-on = Bluetooth activat
media-keys-bluetooth-off = Bluetooth desactivat
media-keys-caps-lock-on = Bloq Maj activat
media-keys-caps-lock-off = Bloq Maj desactivat
media-keys-num-lock-on = Bloq Núm activat
media-keys-num-lock-off = Bloq Núm desactivat

## VPN sign-in

vpn-sign-in-title = Inicieu la sessió a { $connection }
vpn-connect = Connecta
vpn-signing-in = S’està iniciant la sessió…
vpn-finish-in-browser = Acabeu d’iniciar la sessió al navegador.
vpn-certificate-untrusted = { $host } ha presentat un certificat que no es pot verificar ({ $reason }). L’empremta digital és { $fingerprint }.
vpn-certificate-warning = Algú podria estar fent-se passar per aquest servidor. Connecteu-vos-hi només si us ho esperàveu.
vpn-certificate-connect = Connecta igualment

vpn-field-password = Contrasenya
vpn-field-certificate-password = Contrasenya del certificat
vpn-field-proxy-password = Contrasenya del servidor intermediari
vpn-field-pre-shared-key = Clau precompartida
vpn-field-group-password = Contrasenya del grup

## Battery notifications

battery-left = Queda un { $percent }.
battery-left-with-time = Queda un { $percent }, uns { $duration }.
battery-low-title = Bateria baixa
battery-very-low-title = Bateria molt baixa
battery-almost-empty-title = Bateria gairebé esgotada
battery-ups-low-title = Bateria del SAI baixa
battery-ups-very-low-title = Bateria del SAI molt baixa
battery-ups-almost-empty-title = Bateria del SAI gairebé esgotada
battery-very-low-body = { $left } Endolleu l’ordinador aviat.
battery-almost-empty-body = { $left } Endolleu l’ordinador ara per no perdre la feina sense desar.

battery-device-low-title = Bateria baixa: { $device }
battery-device-very-low-title = Bateria molt baixa: { $device }
battery-device-low-body = { $left } Carregueu-ne la bateria aviat.
battery-device-very-low-body = { $left } Carregueu-ne la bateria ara perquè no s’apagui.

battery-device-mouse = Ratolí
battery-device-keyboard = Teclat
battery-device-phone = Telèfon
battery-device-tablet = Tauleta
battery-device-controller = Comandament
battery-device-pen = Llapis
battery-device-touchpad = Ratolí tàctil
battery-device-headset = Auriculars amb micròfon
battery-device-speaker = Altaveu
battery-device-headphones = Auriculars
battery-device-remote = Comandament a distància
battery-device-other = Dispositiu connectat

## Privacy indicator

privacy-indicator = En ús: { $things }
privacy-thing-camera = càmera
privacy-thing-microphone = micròfon
privacy-thing-screen = pantalla
privacy-thing-location = ubicació
privacy-thing-windows = finestres

privacy-camera-unknown-app = Una aplicació està fent servir la càmera
privacy-stop-sharing = Deixa de compartir la pantalla
privacy-stop-recording = Atura l’enregistrament
privacy-turn-off-location = Desactiva els serveis d’ubicació
privacy-settings = Configuració de privadesa
privacy-camera = Càmera
privacy-microphone = Micròfon
privacy-microphone-muted = Micròfon silenciat
privacy-mute-microphone = Silencia el micròfon
privacy-unmute-microphone = Activa el micròfon
privacy-close-app = Tanca { $app }
privacy-unknown-app = Una aplicació
privacy-reported-app = «{ $name }» (nom no verificat)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programa pot veure les vostres finestres
   *[other] { $count } programes poden veure les vostres finestres
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programa pot veure i fer servir les vostres finestres
   *[other] { $count } programes poden veure i fer servir les vostres finestres
}
privacy-windows-stop = Retira l’accés

## Window access prompt

peek-see-request = Voleu permetre que un programa que heu obert vegi les vostres finestres?
peek-see-description = Podrà fer captures de qualsevol finestra que tingueu oberta.
peek-use-request = Voleu permetre que un programa que heu obert vegi i faci servir les vostres finestres?
peek-use-description = Podrà veure qualsevol finestra que tingueu oberta, i fer-hi clic i escriure-hi com si fóssiu vós.
peek-deny = No ho permetis
peek-allow-once = Permet una vegada
peek-allow-until-quit = Permet fins que es tanqui

## Window access errors

peek-error-declined-until-quit = La persona que fa servir aquest ordinador ho ha rebutjat. El programa ho pot tornar a demanar quan s’hagi tancat.
peek-error-not-allowed = La persona que fa servir aquest ordinador no ho ha permès
peek-error-sandboxed = Les aplicacions en un entorn aïllat no poden veure ni fer servir altres finestres
peek-error-unknown-caller = El programa que ho demana s’ha tancat o no s’ha pogut reconèixer
peek-error-no-caller = El bus de sessió no ha indicat quin programa ho demana
peek-error-screen-busy = La pantalla està bloquejada o hi ha un avís del sistema obert. Torneu-ho a provar quan hagi desaparegut.
peek-error-input-held = Algú està mantenint premudes tecles o botons del ratolí. Torneu-ho a provar d’aquí a un moment.
peek-error-input-dropped = S’ha aturat l’entrada perquè, quan ha arribat, hi havia una altra cosa sota el punt o una altra cosa tenia el teclat
peek-error-not-in-front = No s’ha pogut portar la finestra al davant
peek-error-covered = Hi ha una altra cosa que tapa aquesta part de la finestra
peek-error-outside = { $x }, { $y } és fora de la imatge de la finestra, que fa { $width } × { $height }
peek-error-nothing-to-capture = La finestra no mostra res que es pugui capturar
peek-error-window-picture-late = La imatge de la finestra no ha estat a punt a temps
peek-error-screen-picture-late = La imatge de la pantalla no ha estat a punt a temps
peek-error-no-window-id = No hi ha cap finestra amb l’identificador { $id }. peek list mostra les que estan obertes.
peek-error-no-window-for-handle = El programa iniciat com a { $handle } no té cap finestra oberta
peek-error-ended-before-window = El programa s’ha tancat abans d’obrir una finestra
peek-error-no-window-in-time = No s’ha obert cap finestra en { $duration }
peek-error-launch-not-started-by-peek = Només es pot iniciar un programa que hagi iniciat el mateix peek run
peek-error-ended-while-starting = El programa s’ha tancat mentre s’iniciava
peek-error-launch-failed = systemd no ha pogut iniciar { $program }
peek-error-unknown-handle = Cap programa iniciat amb peek run no té l’identificador { $handle }, o ja s’ha tancat
peek-error-unknown-key = { $key } no és una tecla que peek conegui
peek-error-unknown-modifier = { $modifier } no és un modificador. Feu servir ctrl, shift, alt o super.
peek-error-display-owner = Aquesta pantalla pertany a un altre programa
peek-error-display-run = Els programes d’una pantalla amagada els inicia peek run
peek-error-display-handle = Aquesta pantalla es va iniciar com a { $handle }, no com a { $requested }

## Quick settings tiles

auto-rotate-title = Rotació automàtica
dark-style-title = Mode fosc
do-not-disturb-title = No molestis
night-light-title = Llum nocturna
airplane-mode-title = Mode d’avió

## Power mode

power-profile-title = Mode d’energia
power-profile-header = Mode d’energia
power-profile-open-menu = Obre el menú de modes d’energia
power-profile-settings = Configuració d’energia
power-profile-performance = Rendiment
power-profile-balanced = Equilibrat
power-profile-power-saver = Estalvi d’energia
power-profile-custom = Personalitzat

## Keep awake

caffeine-title = Mantén actiu
caffeine-open-menu = Obre el menú Mantén actiu
caffeine-until = Fins a les { $time }
caffeine-until-turned-off = Fins que es desactivi
caffeine-30-minutes = 30 minuts
caffeine-1-hour = 1 hora
caffeine-2-hours = 2 hores
caffeine-inhibit-reason = Mantingut actiu des de la configuració ràpida

## Brightness

brightness-title = Brillantor
brightness-open-menu = Obre el menú de brillantor

## Keyboard backlight

backlight-title = Retroil·luminació del teclat
backlight-open-menu = Obre el menú de brillantor del teclat
backlight-slider = Brillantor del teclat
backlight-off = Desactivada
backlight-low = Baixa
backlight-high = Alta

## Sound

volume-sound-settings = Configuració del so
volume-mute = Silencia
volume-unmute = Activa el so
volume-output-slider = Volum
volume-output-title = Sortida de so
volume-output-open-menu = Obre el menú de sortida de so
volume-input-slider = Micròfon
volume-input-title = Entrada de so
volume-input-open-menu = Obre el menú d’entrada de so

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Obre el menú del Bluetooth
bluetooth-settings = Configuració del Bluetooth
bluetooth-connect = Connecta
bluetooth-disconnect = Desconnecta
bluetooth-connect-device = Connecta a { $deviceName }
bluetooth-disconnect-device = Desconnecta { $deviceName }
bluetooth-no-devices = No hi ha dispositius disponibles ni connectats
bluetooth-turn-on-hint = Activeu el Bluetooth per connectar dispositius
bluetooth-connected-count = { $count ->
    [one] { $count } connectat
   *[other] { $count } connectats
}

## Network menus in quick settings

network-menu-unknown-network = <desconeguda>
network-menu-connect = Connecta
network-menu-disconnect = Desconnecta
network-menu-connect-to = Connecta a { $name }
network-menu-disconnect-from = Desconnecta { $name }
network-menu-turn-off = Desactiva
network-menu-wifi-network = { $secure ->
    [yes] { $name }, segura, intensitat del senyal { $strength } %
   *[no] { $name }, no segura, intensitat del senyal { $strength } %
}
network-menu-hotspot = Punt d’accés de { $name }
network-menu-connected-count = { $count ->
    [one] { $count } connectada
   *[other] { $count } connectades
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Obre el menú de VPN
network-menu-vpn-settings = Configuració de VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Obre el menú de Wi-Fi
network-menu-wifi-settings = Totes les xarxes
network-menu-wired = Connexions amb cable
network-menu-wired-open-menu = Obre el menú de connexions amb cable
network-menu-wired-settings = Configuració de la xarxa amb cable
network-menu-tethers = Compartició per Bluetooth
network-menu-tethers-open-menu = Obre el menú de compartició per Bluetooth
network-menu-tether = Compartició
network-menu-tether-settings = Configuració del Bluetooth
network-menu-mobile-connections = Connexions mòbils
network-menu-mobile-open-menu = Obre el menú de connexions mòbils
network-menu-mobile-settings = Configuració de la banda ampla mòbil
network-menu-mobile = Mòbil
network-device-wired = Amb cable
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Inicieu la sessió a la xarxa
network-menu-failed-title = Ha fallat la connexió
network-menu-failed-body = No s’ha pogut activar la connexió de xarxa

## Location access dialog

location-dialog-title = Permet l’accés a la ubicació
location-dialog-description = L’aplicació { $appName } vol accedir a la vostra ubicació
location-dialog-info = Podeu canviar l’accés a la ubicació en qualsevol moment a la configuració de privadesa
location-dialog-deny = Denega l’accés
location-dialog-grant = Concedeix l’accés

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositiu Thunderbolt desconegut
thunderbolt-unknown-body = S’ha connectat un dispositiu nou mentre éreu fora. Desconnecteu-lo i torneu-lo a connectar per començar a fer-lo servir.
thunderbolt-unauthorized-title = Dispositiu Thunderbolt no autoritzat
thunderbolt-unauthorized-body = S’ha connectat un dispositiu nou i cal l’aprovació d’un administrador
thunderbolt-error-title = Error d’autorització del Thunderbolt
thunderbolt-error-body = No s’ha pogut autoritzar el dispositiu Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Denega
access-dialog-allow = Permet

## Display change confirmation

display-change-title = Voleu mantenir aquests canvis?
display-change-countdown = { $seconds ->
    [one] Els canvis es desfaran d’aquí a { $seconds } segon
   *[other] Els canvis es desfaran d’aquí a { $seconds } segons
}
display-change-revert = Desfés els canvis
display-change-keep = Mantén els canvis

## Drive connected notification

autorun-connected = S’ha connectat «{ $driveName }»
autorun-ready = Ja podeu fer servir el disc
autorun-open-with = Obre amb { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = S’han activat les tecles lentes
kbd-a11y-slow-keys-off = S’han desactivat les tecles lentes
kbd-a11y-slow-keys-description = Heu mantingut premuda la tecla Maj durant 8 segons. Aquesta és la drecera de les tecles lentes, que canvien com funciona el teclat.
kbd-a11y-sticky-keys-on = S’han activat les tecles enganxoses
kbd-a11y-sticky-keys-off = S’han desactivat les tecles enganxoses
kbd-a11y-sticky-keys-on-description = Heu premut la tecla Maj 5 vegades seguides. Aquesta és la drecera de les tecles enganxoses, que canvien com funciona el teclat.
kbd-a11y-sticky-keys-off-description = Heu premut dues tecles alhora, o la tecla Maj 5 vegades seguides. Això desactiva les tecles enganxoses, que canvien com funciona el teclat.
kbd-a11y-leave-on = Deixa-les activades
kbd-a11y-turn-on = Activa
kbd-a11y-turn-off = Desactiva
kbd-a11y-leave-off = Deixa-les desactivades

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Trieu el dispositiu d’àudio
audio-device-cancel = Cancel·la
audio-device-sound-settings = Configuració del so
audio-device-headphones = Auriculars
audio-device-headset = Auriculars amb micròfon
audio-device-microphone = Micròfon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permet inhibir les dreceres
inhibit-shortcuts-app = L’aplicació { $appName } vol inhibir les dreceres del sistema
inhibit-shortcuts-unknown-app = Una aplicació vol inhibir les dreceres del sistema
inhibit-shortcuts-titled-app = Una aplicació amb la finestra «{ $title }» vol inhibir les dreceres del sistema
inhibit-shortcuts-restore = Podeu restaurar les dreceres prement { $shortcut }
inhibit-shortcuts-deny = Denega
inhibit-shortcuts-allow = Permet

## Unlocking encrypted drives

mount-hidden-volume = Volum ocult
mount-windows-system-volume = Volum del sistema Windows
mount-uses-keyfiles = Fa servir fitxers de clau
mount-keyfiles-use-app = Per desbloquejar un volum que fa servir fitxers de clau, feu servir la utilitat <i>{ $appName }</i>
mount-keyfiles-need-app = Necessiteu una utilitat externa com <i>Discs</i> per desbloquejar un volum que fa servir fitxers de clau
mount-pim-number = Número PIM
mount-pim-invalid = El PIM ha de ser un número o quedar buit
mount-password = Contrasenya
mount-remember-password = Recorda la contrasenya
mount-cancel = Cancel·la
mount-unlock = Desbloqueja
mount-open-app = Obre { $appName }
mount-wrong-password = No ha funcionat. Torneu-ho a provar.
mount-unlock-failed = No s’ha pogut desbloquejar el volum
mount-pim-unsupported = La versió d’udisks instal·lada no admet el paràmetre PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Cal autenticar-se
network-agent-wifi-rejected = La contrasenya desada de «{ $networkName }» no ha funcionat. Torneu-la a introduir.
network-agent-wifi-secrets = Cal una contrasenya o una clau de xifratge per accedir a la xarxa sense fil «{ $networkName }»
network-agent-wps-hint = També us podeu connectar prement el botó «WPS» de l’encaminador
network-agent-wired-title = Autenticació 802.1X amb cable
network-agent-dsl-title = Autenticació DSL
network-agent-pin-title = Cal el codi PIN
network-agent-pin-body = El dispositiu de banda ampla mòbil necessita el codi PIN
network-agent-vpn-title = Contrasenya de la VPN
network-agent-password-required = Cal una contrasenya per connectar-se a «{ $networkName }»
network-agent-connect = Connecta
network-agent-cancel = Cancel·la
network-agent-password = Contrasenya
network-agent-username = Nom d’usuari
network-agent-key = Clau
network-agent-private-key-password = Contrasenya de la clau privada
network-agent-identity = Identitat
network-agent-service = Servei
network-agent-network-name = Nom de la xarxa
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Captura de pantalla
screenshot-area = Selecció d’àrea
screenshot-screen = Selecció de pantalla
screenshot-window = Selecció de finestra
screenshot-take = Fes una captura de pantalla
screenshot-record = Enregistra la pantalla
screenshot-show-pointer = Mostra el punter
screenshot-capture = Captura
screenshot-close = Tanca
screenshot-screencasts-folder = Enregistraments de pantalla
screenshot-screencast-file = Enregistrament de pantalla { $date } { $time }
screenshot-screenshots-folder = Captures de pantalla
screenshot-file = Captura de pantalla { $timestamp }
screenshot-screencast-recorded = S’ha enregistrat la pantalla
screenshot-screencast-start-failed = No s’ha pogut començar l’enregistrament
screenshot-screencast-out-of-space = Ha fallat l’enregistrament: no queda espai al disc
screenshot-screencast-try-again = Ha fallat l’enregistrament. Torneu-ho a provar.
screenshot-screencast-failed = Ha fallat l’enregistrament
screenshot-screencast-view = Feu clic aquí per veure el vídeo
screenshot-show-in-rover = Mostra a Rover
screenshot-captured = S’ha fet la captura de pantalla
screenshot-captured-body = Podeu enganxar la imatge des del porta-retalls

## System updates
updates-available-title = Hi ha actualitzacions del sistema disponibles
updates-available-body = Obriu la Configuració per baixar-les i instal·lar-les.
updates-ready-title = Les actualitzacions estan a punt per instal·lar-se
updates-ready-body = Reinicieu quan us vagi bé per instal·lar-les.
