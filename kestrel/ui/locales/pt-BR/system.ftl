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
