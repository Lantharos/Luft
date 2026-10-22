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
