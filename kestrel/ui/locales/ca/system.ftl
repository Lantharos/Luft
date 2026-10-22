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
