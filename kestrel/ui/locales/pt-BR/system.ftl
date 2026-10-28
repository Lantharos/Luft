## Shared

system-cancel = Cancelar

## Dictation notifications

dictation-setup-title = Digite falando
dictation-setup-body = Fale para digitar o que você diz, em qualquer app. O ditado funciona neste computador, por isso precisa primeiro do modelo de fala.
dictation-setup-action = Configurar o ditado
dictation-unsupported-title = O ditado em { $language } não está disponível neste computador
dictation-unsupported-body = O processador não consegue executar o reconhecimento de fala necessário para { $language }. Você pode ditar em outro idioma.
dictation-settings-action = Configurações de ditado

## System health notifications

health-gpu-reset-title = O driver de vídeo parou de responder
health-gpu-reset-body = { $day ->
    [today] O computador reiniciou sozinho hoje às { $time }. As Configurações mostram o que pode evitar que isso aconteça de novo.
   *[other] O computador reiniciou sozinho em { $date } às { $time }. As Configurações mostram o que pode evitar que isso aconteça de novo.
}
health-gpu-reset-details = Detalhes

oom-app-closed-title = { $app } foi fechado para liberar memória
oom-container-closed-title = Um contêiner foi fechado para liberar memória
oom-closed-body = O computador estava ficando sem memória, então ele foi fechado para que todo o resto continue respondendo.
oom-closed-body-with-size = O computador estava ficando sem memória, então ele foi fechado para que todo o resto continue respondendo. Ele estava usando { $size }.
memory-low-title = O Luft está ficando sem memória
memory-low-app-body = { $app } está usando { $size }. Force o encerramento para que todo o resto continue respondendo.
memory-low-container-body = Um contêiner está usando { $size }. Force o encerramento para que todo o resto continue respondendo.
memory-low-force-quit = Forçar encerramento

## Input source indicator

input-source-indicator = Fonte de entrada: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = O modo avião está ativado no hardware
media-keys-airplane-mode-on = Modo avião ativado
media-keys-airplane-mode-off = Modo avião desativado
media-keys-bluetooth-on = Bluetooth ativado
media-keys-bluetooth-off = Bluetooth desativado
media-keys-caps-lock-on = Caps Lock ativado
media-keys-caps-lock-off = Caps Lock desativado
media-keys-num-lock-on = Num Lock ativado
media-keys-num-lock-off = Num Lock desativado

## VPN sign-in

vpn-sign-in-title = Entrar em { $connection }
vpn-connect = Conectar
vpn-signing-in = Entrando…
vpn-finish-in-browser = Conclua o login no navegador.
vpn-certificate-untrusted = { $host } apresentou um certificado que não pode ser verificado ({ $reason }). A impressão digital dele é { $fingerprint }.
vpn-certificate-warning = Alguém pode estar se passando por este servidor. Conecte-se somente se você esperava por isso.
vpn-certificate-connect = Conectar mesmo assim

vpn-field-password = Senha
vpn-field-certificate-password = Senha do certificado
vpn-field-proxy-password = Senha do proxy
vpn-field-pre-shared-key = Chave pré-compartilhada
vpn-field-group-password = Senha do grupo

## Battery notifications

battery-left = { $percent } restantes.
battery-left-with-time = { $percent } restantes, cerca de { $duration }.
battery-low-title = Bateria fraca
battery-very-low-title = Bateria muito fraca
battery-almost-empty-title = Bateria quase vazia
battery-ups-low-title = Bateria do nobreak fraca
battery-ups-very-low-title = Bateria do nobreak muito fraca
battery-ups-almost-empty-title = Bateria do nobreak quase vazia
battery-very-low-body = { $left } Conecte o carregador em breve.
battery-almost-empty-body = { $left } Conecte o carregador agora para não perder o trabalho não salvo.

battery-device-low-title = Bateria fraca: { $device }
battery-device-very-low-title = Bateria muito fraca: { $device }
battery-device-low-body = { $left } Carregue em breve.
battery-device-very-low-body = { $left } Carregue agora para que não desligue.

battery-device-mouse = Mouse
battery-device-keyboard = Teclado
battery-device-phone = Celular
battery-device-tablet = Tablet
battery-device-controller = Controle
battery-device-pen = Caneta
battery-device-touchpad = Touchpad
battery-device-headset = Headset
battery-device-speaker = Caixa de som
battery-device-headphones = Fones de ouvido
battery-device-remote = Controle remoto
battery-device-other = Dispositivo conectado

## Privacy indicator

privacy-indicator = Usando { $things }
privacy-thing-camera = a câmera
privacy-thing-microphone = o microfone
privacy-thing-screen = a tela
privacy-thing-location = a localização
privacy-thing-windows = as janelas

privacy-camera-unknown-app = Um app está usando a câmera
privacy-stop-sharing = Parar de compartilhar a tela
privacy-stop-recording = Parar gravação
privacy-turn-off-location = Desativar serviços de localização
privacy-settings = Configurações de privacidade
privacy-camera = Câmera
privacy-microphone = Microfone
privacy-microphone-muted = Microfone silenciado
privacy-mute-microphone = Silenciar microfone
privacy-unmute-microphone = Ativar microfone
privacy-close-app = Fechar { $app }
privacy-unknown-app = Um app
privacy-windows-seeing-programs = { $count ->
    [one] { $count } programa pode ver suas janelas
   *[other] { $count } programas podem ver suas janelas
}
privacy-windows-using-programs = { $count ->
    [one] { $count } programa pode ver e usar suas janelas
   *[other] { $count } programas podem ver e usar suas janelas
}
privacy-windows-stop = Interromper acesso

## Window access prompt

peek-see-request = Permitir que um programa que você abriu veja suas janelas?
peek-see-description = Ele poderá tirar fotos de qualquer janela que você tiver aberta.
peek-use-request = Permitir que um programa que você abriu veja e use suas janelas?
peek-use-description = Ele poderá ver qualquer janela que você tiver aberta e clicar e digitar nela como se fosse você.
peek-deny = Não permitir
peek-allow-once = Permitir uma vez
peek-allow-until-quit = Permitir até que seja fechado

## Window access errors

peek-error-declined-until-quit = A pessoa que usa este computador recusou. O programa pode pedir de novo depois de ser fechado.
peek-error-not-allowed = A pessoa que usa este computador não permitiu
peek-error-sandboxed = Apps em sandbox não podem ver nem usar outras janelas
peek-error-unknown-caller = O programa que fez o pedido foi encerrado ou não pôde ser reconhecido
peek-error-no-caller = O barramento da sessão não informou qual programa está pedindo
peek-error-screen-busy = A tela está bloqueada ou há um aviso do sistema aberto nela. Tente novamente quando ele sumir.
peek-error-input-held = Alguém está segurando teclas ou botões do mouse. Tente novamente daqui a pouco.
peek-error-input-dropped = A entrada foi interrompida porque outra coisa estava sob o ponto ou tinha o teclado quando ela chegou
peek-error-not-in-front = Não foi possível trazer a janela para a frente
peek-error-covered = Outra coisa cobre essa parte da janela
peek-error-outside = { $x }, { $y } está fora da imagem da janela, que tem { $width } × { $height }
peek-error-nothing-to-capture = A janela não está mostrando nada para capturar
peek-error-window-picture-late = A imagem da janela não ficou pronta a tempo
peek-error-screen-picture-late = A imagem da tela não ficou pronta a tempo
peek-error-no-window-id = Nenhuma janela tem o id { $id }. peek list mostra as que estão abertas.
peek-error-no-window-for-handle = O programa iniciado como { $handle } não tem nenhuma janela aberta
peek-error-ended-before-window = O programa foi encerrado antes de abrir uma janela
peek-error-no-window-in-time = Nenhuma janela foi aberta em { $duration }
peek-error-launch-not-started-by-peek = Só é possível abrir um programa que o próprio peek run iniciou
peek-error-ended-while-starting = O programa foi encerrado enquanto iniciava
peek-error-launch-failed = O systemd não conseguiu iniciar { $program }
peek-error-unknown-handle = Nada que você iniciou com peek run tem o identificador { $handle }, ou foi encerrado
peek-error-unknown-key = { $key } não é uma tecla que o peek conhece
peek-error-unknown-modifier = { $modifier } não é um modificador. Use ctrl, shift, alt ou super.
peek-error-display-owner = Esta tela pertence a outro programa
peek-error-display-run = Programas em uma tela oculta são iniciados pelo peek run
peek-error-display-handle = Esta tela foi iniciada como { $handle }, não como { $requested }

## Quick settings tiles

auto-rotate-title = Girar automaticamente
dark-style-title = Modo escuro
do-not-disturb-title = Não perturbe
night-light-title = Luz noturna
airplane-mode-title = Modo avião

## Power mode

power-profile-title = Modo de energia
power-profile-header = Modo de energia
power-profile-open-menu = Abrir menu de modos de energia
power-profile-settings = Configurações de energia
power-profile-performance = Desempenho
power-profile-balanced = Equilibrado
power-profile-power-saver = Economia de energia
power-profile-custom = Personalizado

## Keep awake

caffeine-title = Manter ativo
caffeine-open-menu = Abrir menu Manter ativo
caffeine-until = Até { $time }
caffeine-until-turned-off = Até desativar
caffeine-30-minutes = 30 minutos
caffeine-1-hour = 1 hora
caffeine-2-hours = 2 horas
caffeine-inhibit-reason = Mantido ativo pelas Configurações rápidas

## Brightness

brightness-title = Brilho
brightness-open-menu = Abrir menu de brilho

## Keyboard backlight

backlight-title = Luz do teclado
backlight-open-menu = Abrir menu de brilho do teclado
backlight-slider = Brilho do teclado
backlight-off = Desligada
backlight-low = Baixa
backlight-high = Alta

## Sound

volume-sound-settings = Configurações de som
volume-mute = Silenciar
volume-unmute = Ativar som
volume-output-slider = Volume
volume-output-title = Saída de som
volume-output-open-menu = Abrir menu de saída de som
volume-input-slider = Microfone
volume-input-title = Entrada de som
volume-input-open-menu = Abrir menu de entrada de som

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Abrir menu do Bluetooth
bluetooth-settings = Configurações de Bluetooth
bluetooth-connect = Conectar
bluetooth-disconnect = Desconectar
bluetooth-connect-device = Conectar a { $deviceName }
bluetooth-disconnect-device = Desconectar { $deviceName }
bluetooth-no-devices = Nenhum dispositivo disponível ou conectado
bluetooth-turn-on-hint = Ative o Bluetooth para conectar dispositivos
bluetooth-connected-count = { $count ->
    [one] { $count } conectado
   *[other] { $count } conectados
}

## Network menus in quick settings

network-menu-unknown-network = <desconhecida>
network-menu-connect = Conectar
network-menu-disconnect = Desconectar
network-menu-connect-to = Conectar a { $name }
network-menu-disconnect-from = Desconectar { $name }
network-menu-turn-off = Desligar
network-menu-wifi-network = { $secure ->
    [yes] { $name }, segura, intensidade do sinal { $strength }%
   *[no] { $name }, não segura, intensidade do sinal { $strength }%
}
network-menu-hotspot = Ponto de acesso { $name }
network-menu-connected-count = { $count ->
    [one] { $count } conectada
   *[other] { $count } conectadas
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Abrir menu de VPN
network-menu-vpn-settings = Configurações de VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Abrir menu do Wi-Fi
network-menu-wifi-settings = Todas as redes
network-menu-wired = Conexões cabeadas
network-menu-wired-open-menu = Abrir menu de conexões cabeadas
network-menu-wired-settings = Configurações de rede cabeada
network-menu-tethers = Ancoragem Bluetooth
network-menu-tethers-open-menu = Abrir menu de ancoragem Bluetooth
network-menu-tether = Ancoragem
network-menu-tether-settings = Configurações de Bluetooth
network-menu-mobile-connections = Conexões móveis
network-menu-mobile-open-menu = Abrir menu de conexões móveis
network-menu-mobile-settings = Configurações de banda larga móvel
network-menu-mobile = Dados móveis
network-device-wired = Cabeada
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Entrar na rede
network-menu-failed-title = Falha na conexão
network-menu-failed-body = Não foi possível ativar a conexão de rede

## Location access dialog

location-dialog-title = Permitir acesso à localização
location-dialog-description = O app { $appName } quer acessar sua localização
location-dialog-info = O acesso à localização pode ser alterado a qualquer momento nas configurações de privacidade
location-dialog-deny = Negar acesso
location-dialog-grant = Permitir acesso

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositivo Thunderbolt desconhecido
thunderbolt-unknown-body = Um novo dispositivo foi conectado enquanto você estava ausente. Desconecte-o e conecte-o de novo para começar a usá-lo.
thunderbolt-unauthorized-title = Dispositivo Thunderbolt não autorizado
thunderbolt-unauthorized-body = Um novo dispositivo foi conectado e precisa da aprovação de um administrador
thunderbolt-error-title = Erro de autorização do Thunderbolt
thunderbolt-error-body = Não foi possível autorizar o dispositivo Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Negar
access-dialog-allow = Permitir

## Display change confirmation

display-change-title = Manter estas configurações?
display-change-countdown = { $seconds ->
    [one] As alterações serão desfeitas em { $seconds } segundo
   *[other] As alterações serão desfeitas em { $seconds } segundos
}
display-change-revert = Reverter
display-change-keep = Manter alterações

## Drive connected notification

autorun-connected = “{ $driveName }” conectado
autorun-ready = O disco já pode ser usado
autorun-open-with = Abrir com { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Teclas lentas ativadas
kbd-a11y-slow-keys-off = Teclas lentas desativadas
kbd-a11y-slow-keys-description = Você manteve a tecla Shift pressionada por 8 segundos. Esse é o atalho das Teclas lentas, que mudam o funcionamento do teclado.
kbd-a11y-sticky-keys-on = Teclas de aderência ativadas
kbd-a11y-sticky-keys-off = Teclas de aderência desativadas
kbd-a11y-sticky-keys-on-description = Você pressionou a tecla Shift 5 vezes seguidas. Esse é o atalho das Teclas de aderência, que mudam o funcionamento do teclado.
kbd-a11y-sticky-keys-off-description = Você pressionou duas teclas ao mesmo tempo ou a tecla Shift 5 vezes seguidas. Isso desativa as Teclas de aderência, que mudam o funcionamento do teclado.
kbd-a11y-leave-on = Manter ativado
kbd-a11y-turn-on = Ativar
kbd-a11y-turn-off = Desativar
kbd-a11y-leave-off = Manter desativado

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Selecionar dispositivo de áudio
audio-device-cancel = Cancelar
audio-device-sound-settings = Configurações de som
audio-device-headphones = Fones de ouvido
audio-device-headset = Headset
audio-device-microphone = Microfone

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permitir bloquear atalhos
inhibit-shortcuts-app = O app { $appName } quer bloquear os atalhos do sistema
inhibit-shortcuts-unknown-app = Um app quer bloquear os atalhos do sistema
inhibit-shortcuts-restore = Você pode restaurar os atalhos pressionando { $shortcut }
inhibit-shortcuts-deny = Negar
inhibit-shortcuts-allow = Permitir

## Unlocking encrypted drives

mount-hidden-volume = Volume oculto
mount-windows-system-volume = Volume de sistema do Windows
mount-uses-keyfiles = Usa arquivos-chave
mount-keyfiles-use-app = Para desbloquear um volume que usa arquivos-chave, use o utilitário <i>{ $appName }</i>
mount-keyfiles-need-app = Você precisa de um utilitário externo como o <i>Discos</i> para desbloquear um volume que usa arquivos-chave
mount-pim-number = Número PIM
mount-pim-invalid = O PIM precisa ser um número ou ficar vazio
mount-password = Senha
mount-remember-password = Lembrar senha
mount-cancel = Cancelar
mount-unlock = Desbloquear
mount-open-app = Abrir { $appName }
mount-wrong-password = Não funcionou. Tente novamente.
mount-unlock-failed = Não foi possível desbloquear o volume
mount-pim-unsupported = A versão instalada do udisks não suporta a configuração PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Autenticação necessária
network-agent-wifi-rejected = A senha salva de “{ $networkName }” não funcionou. Digite-a novamente.
network-agent-wifi-secrets = É preciso uma senha ou chave de criptografia para acessar a rede Wi-Fi “{ $networkName }”
network-agent-wps-hint = Você também pode se conectar pressionando o botão “WPS” do roteador
network-agent-wired-title = Autenticação 802.1X cabeada
network-agent-dsl-title = Autenticação DSL
network-agent-pin-title = Código PIN necessário
network-agent-pin-body = O dispositivo de banda larga móvel precisa de um código PIN
network-agent-vpn-title = Senha da VPN
network-agent-password-required = É preciso uma senha para conectar a “{ $networkName }”
network-agent-connect = Conectar
network-agent-cancel = Cancelar
network-agent-password = Senha
network-agent-username = Nome de usuário
network-agent-key = Chave
network-agent-private-key-password = Senha da chave privada
network-agent-identity = Identidade
network-agent-service = Serviço
network-agent-network-name = Nome da rede
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Captura de tela
screenshot-area = Selecionar área
screenshot-screen = Selecionar tela
screenshot-window = Selecionar janela
screenshot-take = Capturar tela
screenshot-record = Gravar tela
screenshot-show-pointer = Mostrar ponteiro
screenshot-capture = Capturar
screenshot-close = Fechar
screenshot-screencasts-folder = Gravações de tela
screenshot-screencast-file = Gravação de tela de { $date } { $time }
screenshot-screenshots-folder = Capturas de tela
screenshot-file = Captura de tela de { $timestamp }
screenshot-screencast-recorded = Gravação de tela salva
screenshot-screencast-start-failed = Não foi possível iniciar a gravação de tela
screenshot-screencast-out-of-space = Falha na gravação de tela: sem espaço em disco
screenshot-screencast-try-again = Falha na gravação de tela. Tente novamente.
screenshot-screencast-failed = Falha na gravação de tela
screenshot-screencast-view = Clique aqui para ver o vídeo
screenshot-show-in-rover = Mostrar no Rover
screenshot-captured = Captura de tela feita
screenshot-captured-body = Você pode colar a imagem da área de transferência

## System updates
updates-available-title = Há atualizações do sistema disponíveis
updates-available-body = Abra as Configurações para baixá-las e instalá-las.
updates-ready-title = As atualizações estão prontas para instalar
updates-ready-body = Reinicie quando for conveniente para instalá-las.
