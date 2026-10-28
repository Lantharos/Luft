## Shared

system-cancel = Cancelar

## Dictation notifications

dictation-setup-title = Escrever por voz
dictation-setup-body = Fale para escrever o que diz, em qualquer aplicação. O reconhecimento é feito neste computador, por isso precisa primeiro do modelo de voz.
dictation-setup-action = Configurar o ditado
dictation-unsupported-title = O ditado em { $language } não está disponível neste computador
dictation-unsupported-body = O processador deste computador não consegue executar o reconhecimento de voz necessário para { $language }. Pode ditar noutro idioma.
dictation-settings-action = Definições de ditado

## System health notifications

health-gpu-reset-title = O controlador gráfico deixou de responder
health-gpu-reset-body = { $day ->
    [today] O computador reiniciou-se sozinho hoje às { $time }. As Definições mostram o que pode evitar que volte a acontecer.
   *[other] O computador reiniciou-se sozinho a { $date }, às { $time }. As Definições mostram o que pode evitar que volte a acontecer.
}
health-gpu-reset-details = Detalhes

oom-app-closed-title = A aplicação { $app } foi fechada para libertar memória
oom-container-closed-title = Foi fechado um contentor para libertar memória
oom-closed-body = O computador estava a ficar sem memória, por isso foi fechado para que tudo o resto continue a responder.
oom-closed-body-with-size = O computador estava a ficar sem memória, por isso foi fechado para que tudo o resto continue a responder. Estava a utilizar { $size }.
memory-low-title = O Luft está a ficar sem memória
memory-low-app-body = A aplicação { $app } está a utilizar { $size }. Force o fecho para que tudo o resto continue a responder.
memory-low-container-body = Um contentor está a utilizar { $size }. Force o fecho para que tudo o resto continue a responder.
memory-low-force-quit = Forçar fecho

## Input source indicator

input-source-indicator = Fonte de introdução: { $source }

## Hardware keys
# Short notices shown in the middle of the screen when a key is pressed

media-keys-airplane-mode-hardware = O modo de avião está ativado no hardware
media-keys-airplane-mode-on = Modo de avião ativado
media-keys-airplane-mode-off = Modo de avião desativado
media-keys-bluetooth-on = Bluetooth ligado
media-keys-bluetooth-off = Bluetooth desligado
media-keys-caps-lock-on = Caps Lock ativado
media-keys-caps-lock-off = Caps Lock desativado
media-keys-num-lock-on = Num Lock ativado
media-keys-num-lock-off = Num Lock desativado

## VPN sign-in

vpn-sign-in-title = Iniciar sessão em { $connection }
vpn-connect = Ligar
vpn-signing-in = A iniciar sessão…
vpn-finish-in-browser = Conclua o início de sessão no browser.
vpn-certificate-untrusted = { $host } apresentou um certificado que não pode ser verificado ({ $reason }). A impressão digital do certificado é { $fingerprint }.
vpn-certificate-warning = Alguém pode estar a fazer-se passar por este servidor. Ligue apenas se estava à espera disto.
vpn-certificate-connect = Ligar mesmo assim

vpn-field-password = Palavra-passe
vpn-field-certificate-password = Palavra-passe do certificado
vpn-field-proxy-password = Palavra-passe do proxy
vpn-field-pre-shared-key = Chave pré-partilhada
vpn-field-group-password = Palavra-passe do grupo

## Battery notifications

battery-left = Resta { $percent } de bateria.
battery-left-with-time = Resta { $percent } de bateria, cerca de { $duration }.
battery-low-title = Bateria fraca
battery-very-low-title = Bateria muito fraca
battery-almost-empty-title = Bateria quase vazia
battery-ups-low-title = Bateria da UPS fraca
battery-ups-very-low-title = Bateria da UPS muito fraca
battery-ups-almost-empty-title = Bateria da UPS quase vazia
battery-very-low-body = { $left } Ligue o carregador em breve.
battery-almost-empty-body = { $left } Ligue o carregador agora para não perder trabalho por guardar.

battery-device-low-title = { $device }: bateria fraca
battery-device-very-low-title = { $device }: bateria muito fraca
battery-device-low-body = { $left } Carregue a bateria em breve.
battery-device-very-low-body = { $left } Carregue a bateria agora para que o dispositivo não se desligue.

battery-device-mouse = Rato
battery-device-keyboard = Teclado
battery-device-phone = Telemóvel
battery-device-tablet = Tablet
battery-device-controller = Comando de jogos
battery-device-pen = Caneta
battery-device-touchpad = Painel tátil
battery-device-headset = Auscultadores com microfone
battery-device-speaker = Coluna
battery-device-headphones = Auscultadores
battery-device-remote = Telecomando
battery-device-other = Dispositivo ligado

## Privacy indicator

privacy-indicator = A utilizar { $things }
privacy-thing-camera = a câmara
privacy-thing-microphone = o microfone
privacy-thing-screen = o ecrã
privacy-thing-location = a localização
privacy-thing-windows = as janelas

privacy-camera-unknown-app = Uma aplicação está a utilizar a câmara
privacy-stop-sharing = Parar de partilhar o ecrã
privacy-stop-recording = Parar a gravação
privacy-turn-off-location = Desativar os serviços de localização
privacy-settings = Definições de privacidade
privacy-camera = Câmara
privacy-microphone = Microfone
privacy-microphone-muted = Microfone silenciado
privacy-mute-microphone = Silenciar microfone
privacy-unmute-microphone = Reativar microfone
privacy-close-app = Fechar { $app }
privacy-unknown-app = Uma aplicação
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programa pode ver as suas janelas
   *[other] { $count } programas podem ver as suas janelas
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programa pode ver e utilizar as suas janelas
   *[other] { $count } programas podem ver e utilizar as suas janelas
}
privacy-windows-stop = Retirar acesso

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. $app is its name.

peek-see-request = Permitir que um programa que abriu veja as suas janelas?
peek-see-description = Poderá tirar imagens de qualquer janela que tenha aberta.
peek-use-request = Permitir que um programa que abriu veja e utilize as suas janelas?
peek-use-description = Poderá ver qualquer janela que tenha aberta, e clicar e escrever nela em seu nome.
peek-deny = Não permitir
peek-allow-once = Permitir uma vez
peek-allow-until-quit = Permitir até que feche

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

peek-error-declined-until-quit = A pessoa que está a utilizar este computador recusou o pedido. O programa pode voltar a pedir depois de fechar.
peek-error-not-allowed = A pessoa que está a utilizar este computador não o permitiu
peek-error-sandboxed = As aplicações num ambiente isolado não podem ver nem utilizar outras janelas
peek-error-unknown-caller = O programa que fez o pedido terminou ou não foi possível identificá-lo
peek-error-no-caller = O bus de sessão não indicou que programa está a fazer o pedido
peek-error-screen-busy = O ecrã está bloqueado ou tem um pedido do sistema aberto. Tente novamente quando desaparecer.
peek-error-input-held = Alguém está a manter premidas teclas ou botões do rato. Tente novamente daqui a pouco.
peek-error-input-dropped = A introdução foi interrompida porque, quando chegou, estava outra coisa debaixo do ponto ou com o teclado
peek-error-not-in-front = Não foi possível trazer a janela para a frente
peek-error-covered = Há outra coisa a tapar essa parte da janela
peek-error-outside = { $x }, { $y } está fora da imagem da janela, que tem { $width } × { $height }
peek-error-nothing-to-capture = A janela não está a mostrar nada que possa ser capturado
peek-error-window-picture-late = A imagem da janela não ficou pronta a tempo
peek-error-screen-picture-late = A imagem do ecrã não ficou pronta a tempo
peek-error-no-window-id = Nenhuma janela tem o id { $id }. peek list mostra as que estão abertas.
peek-error-no-window-for-handle = O programa iniciado como { $handle } não tem nenhuma janela aberta
peek-error-ended-before-window = O programa terminou antes de abrir uma janela
peek-error-no-window-in-time = Não abriu nenhuma janela em { $duration }
peek-error-launch-not-started-by-peek = Só é possível lançar um programa que o próprio peek run tenha iniciado
peek-error-ended-while-starting = O programa terminou enquanto estava a iniciar
peek-error-launch-failed = O systemd não conseguiu iniciar { $program }
peek-error-unknown-handle = Nada do que iniciou com peek run tem o identificador { $handle }, ou já foi fechado
peek-error-unknown-key = { $key } não é uma tecla que o peek conheça
peek-error-unknown-modifier = { $modifier } não é um modificador. Utilize ctrl, shift, alt ou super.
peek-error-display-owner = Este ecrã pertence a outro programa
peek-error-display-run = Os programas num ecrã oculto são iniciados pelo peek run
peek-error-display-handle = Este ecrã foi iniciado como { $handle }, não como { $requested }

## Quick settings tiles

auto-rotate-title = Rotação automática
dark-style-title = Modo escuro
do-not-disturb-title = Não incomodar
night-light-title = Luz noturna
airplane-mode-title = Modo de avião

## Power mode

power-profile-title = Modo de energia
power-profile-header = Modo de energia
power-profile-open-menu = Abrir o menu de modos de energia
power-profile-settings = Definições de energia
power-profile-performance = Desempenho
power-profile-balanced = Equilibrado
power-profile-power-saver = Poupança de energia
power-profile-custom = Personalizado

## Keep awake

caffeine-title = Manter ativo
caffeine-open-menu = Abrir o menu Manter ativo
caffeine-until = Até { $time }
caffeine-until-turned-off = Até desativar
caffeine-30-minutes = 30 minutos
caffeine-1-hour = 1 hora
caffeine-2-hours = 2 horas
caffeine-inhibit-reason = Mantido ativo a partir das definições rápidas

## Brightness

brightness-title = Brilho
brightness-open-menu = Abrir o menu de brilho

## Keyboard backlight

backlight-title = Retroiluminação do teclado
backlight-open-menu = Abrir o menu de brilho do teclado
backlight-slider = Brilho do teclado
backlight-off = Desligada
backlight-low = Baixa
backlight-high = Alta

## Sound

volume-sound-settings = Definições de som
volume-mute = Desativar som
volume-unmute = Ativar som
volume-output-slider = Volume
volume-output-title = Saída de som
volume-output-open-menu = Abrir o menu de saída de som
volume-input-slider = Microfone
volume-input-title = Entrada de som
volume-input-open-menu = Abrir o menu de entrada de som

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Abrir o menu Bluetooth
bluetooth-settings = Definições de Bluetooth
bluetooth-connect = Ligar
bluetooth-disconnect = Desligar
bluetooth-connect-device = Ligar a { $deviceName }
bluetooth-disconnect-device = Desligar { $deviceName }
bluetooth-no-devices = Não há dispositivos disponíveis nem ligados
bluetooth-turn-on-hint = Ligue o Bluetooth para se ligar a dispositivos
bluetooth-connected-count = { $count ->
    [one] { $count } ligado
   *[other] { $count } ligados
}

## Network menus in quick settings

network-menu-unknown-network = <desconhecida>
network-menu-connect = Ligar
network-menu-disconnect = Desligar
network-menu-connect-to = Ligar a { $name }
network-menu-disconnect-from = Desligar de { $name }
network-menu-turn-off = Desligar
network-menu-wifi-network = { $secure ->
    [yes] { $name }, segura, intensidade do sinal { $strength }%
   *[no] { $name }, não segura, intensidade do sinal { $strength }%
}
network-menu-hotspot = Hotspot de { $name }
network-menu-connected-count = { $count ->
    [one] { $count } ligada
   *[other] { $count } ligadas
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Abrir o menu VPN
network-menu-vpn-settings = Definições de VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Abrir o menu Wi-Fi
network-menu-wifi-settings = Todas as redes
network-menu-wired = Ligações com fios
network-menu-wired-open-menu = Abrir o menu de ligações com fios
network-menu-wired-settings = Definições de rede com fios
network-menu-tethers = Partilha de ligação por Bluetooth
network-menu-tethers-open-menu = Abrir o menu de partilha de ligação por Bluetooth
network-menu-tether = Partilha de ligação
network-menu-tether-settings = Definições de Bluetooth
network-menu-mobile-connections = Ligações móveis
network-menu-mobile-open-menu = Abrir o menu de ligações móveis
network-menu-mobile-settings = Definições de banda larga móvel
network-menu-mobile = Rede móvel
network-device-wired = Com fios
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Iniciar sessão na rede
network-menu-failed-title = A ligação falhou
network-menu-failed-body = Não foi possível ativar a ligação de rede

## Location access dialog

location-dialog-title = Permitir o acesso à localização
location-dialog-description = A aplicação { $appName } quer aceder à sua localização
location-dialog-info = Pode alterar o acesso à localização a qualquer momento nas definições de privacidade
location-dialog-deny = Recusar acesso
location-dialog-grant = Conceder acesso

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositivo Thunderbolt desconhecido
thunderbolt-unknown-body = Foi ligado um novo dispositivo enquanto estava ausente. Desligue-o e volte a ligá-lo para começar a utilizá-lo.
thunderbolt-unauthorized-title = Dispositivo Thunderbolt não autorizado
thunderbolt-unauthorized-body = Foi ligado um novo dispositivo que precisa da aprovação de um administrador
thunderbolt-error-title = Erro de autorização Thunderbolt
thunderbolt-error-body = Não foi possível autorizar o dispositivo Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Recusar
access-dialog-allow = Permitir

## Display change confirmation

display-change-title = Manter estas definições de ecrã?
display-change-countdown = { $seconds ->
    [0] As alterações às definições vão ser revertidas em { $seconds } segundos
    [one] As alterações às definições vão ser revertidas em { $seconds } segundo
   *[other] As alterações às definições vão ser revertidas em { $seconds } segundos
}
display-change-revert = Reverter
display-change-keep = Manter alterações

## Drive connected notification

autorun-connected = «{ $driveName }» ligado
autorun-ready = O disco já pode ser utilizado
autorun-open-with = Abrir com { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Teclas lentas ativadas
kbd-a11y-slow-keys-off = Teclas lentas desativadas
kbd-a11y-slow-keys-description = Manteve a tecla Shift premida durante 8 segundos. Este é o atalho das teclas lentas, que alteram o funcionamento do teclado.
kbd-a11y-sticky-keys-on = Teclas presas ativadas
kbd-a11y-sticky-keys-off = Teclas presas desativadas
kbd-a11y-sticky-keys-on-description = Premiu a tecla Shift 5 vezes seguidas. Este é o atalho das teclas presas, que alteram o funcionamento do teclado.
kbd-a11y-sticky-keys-off-description = Premiu duas teclas ao mesmo tempo ou premiu a tecla Shift 5 vezes seguidas. Isto desativa as teclas presas, que alteram o funcionamento do teclado.
kbd-a11y-leave-on = Manter ativadas
kbd-a11y-turn-on = Ativar
kbd-a11y-turn-off = Desativar
kbd-a11y-leave-off = Manter desativadas

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Selecionar dispositivo de áudio
audio-device-cancel = Cancelar
audio-device-sound-settings = Definições de som
audio-device-headphones = Auscultadores
audio-device-headset = Auscultadores com microfone
audio-device-microphone = Microfone

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permitir o bloqueio de atalhos
inhibit-shortcuts-app = A aplicação { $appName } quer bloquear os atalhos do sistema
inhibit-shortcuts-unknown-app = Uma aplicação quer bloquear os atalhos do sistema
inhibit-shortcuts-restore = Pode repor os atalhos premindo { $shortcut }
inhibit-shortcuts-deny = Recusar
inhibit-shortcuts-allow = Permitir

## Unlocking encrypted drives

mount-hidden-volume = Volume oculto
mount-windows-system-volume = Volume de sistema do Windows
mount-uses-keyfiles = Utiliza ficheiros de chave
mount-keyfiles-use-app = Para desbloquear um volume que utiliza ficheiros de chave, utilize a aplicação <i>{ $appName }</i>
mount-keyfiles-need-app = Precisa de uma aplicação externa, como <i>Discos</i>, para desbloquear um volume que utiliza ficheiros de chave
mount-pim-number = Número PIM
mount-pim-invalid = O PIM tem de ser um número ou ficar vazio
mount-password = Palavra-passe
mount-remember-password = Memorizar palavra-passe
mount-cancel = Cancelar
mount-unlock = Desbloquear
mount-open-app = Abrir { $appName }
mount-wrong-password = Não funcionou. Tente novamente.
mount-unlock-failed = Não foi possível desbloquear o volume
mount-pim-unsupported = A versão instalada do udisks não suporta a definição PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Autenticação necessária
network-agent-wifi-rejected = A palavra-passe guardada para «{ $networkName }» não funcionou. Introduza-a novamente.
network-agent-wifi-secrets = É necessária uma palavra-passe ou chave de encriptação para aceder à rede sem fios «{ $networkName }»
network-agent-wps-hint = Também pode ligar-se premindo o botão «WPS» do router
network-agent-wired-title = Autenticação 802.1X com fios
network-agent-dsl-title = Autenticação DSL
network-agent-pin-title = Código PIN necessário
network-agent-pin-body = O dispositivo de banda larga móvel precisa do código PIN
network-agent-vpn-title = Palavra-passe da VPN
network-agent-password-required = É necessária uma palavra-passe para ligar a «{ $networkName }»
network-agent-connect = Ligar
network-agent-cancel = Cancelar
network-agent-password = Palavra-passe
network-agent-username = Nome de utilizador
network-agent-key = Chave
network-agent-private-key-password = Palavra-passe da chave privada
network-agent-identity = Identidade
network-agent-service = Serviço
network-agent-network-name = Nome da rede
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Captura de ecrã
screenshot-area = Selecionar área
screenshot-screen = Selecionar ecrã
screenshot-window = Selecionar janela
screenshot-take = Fazer captura de ecrã
screenshot-record = Gravar ecrã
screenshot-show-pointer = Mostrar ponteiro
screenshot-capture = Capturar
screenshot-close = Fechar
screenshot-screencasts-folder = Gravações de ecrã
screenshot-screencast-file = Gravação de ecrã de { $date } { $time }
screenshot-screenshots-folder = Capturas de ecrã
screenshot-file = Captura de ecrã de { $timestamp }
screenshot-screencast-recorded = Gravação de ecrã concluída
screenshot-screencast-start-failed = Não foi possível iniciar a gravação de ecrã
screenshot-screencast-out-of-space = A gravação de ecrã falhou: não há espaço em disco
screenshot-screencast-try-again = A gravação de ecrã falhou. Tente novamente.
screenshot-screencast-failed = A gravação de ecrã falhou
screenshot-screencast-view = Clique aqui para ver o vídeo
screenshot-show-in-rover = Mostrar no Rover
screenshot-captured = Captura de ecrã feita
screenshot-captured-body = Pode colar a imagem a partir da área de transferência

## System updates
updates-available-title = Há atualizações do sistema disponíveis
updates-available-body = Abra as Definições para as transferir e instalar.
updates-ready-title = As atualizações estão prontas a instalar
updates-ready-body = Reinicie quando lhe for conveniente para as instalar.
