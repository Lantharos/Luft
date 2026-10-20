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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = «{ $appName }» não está a responder
close-dialog-description = Pode aguardar um pouco para ver se a aplicação volta a responder ou forçar o seu encerramento
close-dialog-force-quit = Forçar encerramento
close-dialog-wait = Aguardar

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Duplicar
switch-monitor-join = Expandir
switch-monitor-external-only = Só externos
switch-monitor-built-in-only = Só integrado

## Sign-in prompt

auth-prompt-password = Palavra-passe
auth-prompt-username = Nome de utilizador
auth-prompt-back = Voltar
auth-prompt-submit = Enviar
auth-prompt-wrong-password = A palavra-passe não está correta
auth-prompt-failed = Não funcionou. Tente novamente.
fingerprint-not-recognized = Impressão digital não reconhecida

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

## Administrator authentication

polkit-title = Autenticação necessária
polkit-administrator = Administrador
polkit-password = Palavra-passe
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = Não funcionou. Tente novamente.

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

## Log out, power off and restart dialog

end-session-log-out-user = Terminar a sessão de { $userName }
end-session-log-out-title = Terminar sessão
end-session-log-out-user-countdown = { $seconds ->
    [0] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundos
    [one] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundo
   *[other] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [0] A sessão vai ser terminada automaticamente em { $seconds } segundos
    [one] A sessão vai ser terminada automaticamente em { $seconds } segundo
   *[other] A sessão vai ser terminada automaticamente em { $seconds } segundos
}
end-session-log-out-button = Terminar sessão
end-session-power-off-title = Encerrar
end-session-power-off-updates-title = Instalar atualizações e encerrar
end-session-power-off-countdown = { $seconds ->
    [0] O sistema vai encerrar automaticamente em { $seconds } segundos
    [one] O sistema vai encerrar automaticamente em { $seconds } segundo
   *[other] O sistema vai encerrar automaticamente em { $seconds } segundos
}
end-session-power-off-button = Encerrar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar atualizações e reiniciar
end-session-restart-countdown = { $seconds ->
    [0] O sistema vai reiniciar automaticamente em { $seconds } segundos
    [one] O sistema vai reiniciar automaticamente em { $seconds } segundo
   *[other] O sistema vai reiniciar automaticamente em { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar atualizações
end-session-update-restart-countdown = { $seconds ->
    [0] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundos
    [one] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundo
   *[other] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar as atualizações pendentes
end-session-install-version = Instalar a versão { $version }
end-session-low-battery = Bateria fraca. Ligue o carregador antes de instalar atualizações.
end-session-busy-apps = Algumas aplicações estão ocupadas ou têm trabalho por guardar
end-session-other-users = Há outros utilizadores com sessão iniciada
end-session-cancel = Cancelar
end-session-boot-options = Opções de arranque
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (consola)

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

## Lock screen clock

lock-clock-swipe-up = Deslize para cima
lock-clock-click-or-press = Clique ou prima uma tecla

## Notification times

date-just-now = Agora mesmo

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Janelas
ctrl-alt-tab-panel = Barra de tarefas
ctrl-alt-tab-unlock = Desbloquear

## System notifications

messages-system-source = Sistema
unsafe-mode-title = O sistema foi colocado em modo não seguro
unsafe-mode-body = As aplicações têm agora acesso sem restrições
unsafe-mode-undo = Anular
privileged-user-title = Sessão iniciada como utilizador privilegiado
privileged-user-body = Por razões de segurança, deve evitar utilizar uma sessão como utilizador privilegiado. Se possível, inicie sessão como utilizador normal.

## On-screen keyboard

osk-keyboard-settings = Definições de teclado
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = O Kestrel tem de bloquear o ecrã

## Notifications

messages-unknown-app = Aplicação desconhecida
messages-reply = Responder
messages-reply-placeholder = Escrever uma resposta
messages-reply-send = Enviar

## Media player controls

mpris-unknown-artist = Artista desconhecido
mpris-unknown-title = Título desconhecido

## Starting programs

spawn-failed = Não foi possível executar «{ $command }»:

## Text field context menu

entry-menu-copy = Copiar
entry-menu-paste = Colar
entry-menu-show-text = Mostrar texto
entry-menu-hide-text = Ocultar texto
entry-caps-lock-on = O Caps Lock está ativado

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Fazer captura de ecrã
title-bar-menu-hide = Ocultar
title-bar-menu-restore = Restaurar
title-bar-menu-maximize = Maximizar
title-bar-menu-move = Mover
title-bar-menu-resize = Redimensionar
title-bar-menu-always-on-top = Sempre visível
title-bar-menu-always-on-visible-workspace = Em todas as áreas de trabalho
title-bar-menu-workspace-left = Mover para a área de trabalho à esquerda
title-bar-menu-workspace-right = Mover para a área de trabalho à direita
title-bar-menu-workspace-up = Mover para a área de trabalho acima
title-bar-menu-workspace-down = Mover para a área de trabalho abaixo
title-bar-menu-monitor-up = Mover para o ecrã acima
title-bar-menu-monitor-down = Mover para o ecrã abaixo
title-bar-menu-monitor-left = Mover para o ecrã à esquerda
title-bar-menu-monitor-right = Mover para o ecrã à direita
title-bar-menu-close = Fechar

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
