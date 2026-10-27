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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” não está respondendo
close-dialog-description = Você pode esperar um pouco para que ele continue ou forçar o encerramento do app
close-dialog-force-quit = Forçar encerramento
close-dialog-wait = Esperar

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Espelhar
switch-monitor-join = Estender
switch-monitor-external-only = Só externa
switch-monitor-built-in-only = Só integrada

## Sign-in prompt

auth-prompt-password = Senha
auth-prompt-username = Nome de usuário
auth-prompt-back = Voltar
auth-prompt-submit = Enviar
auth-prompt-wrong-password = Essa senha não funcionou
auth-prompt-failed = Não funcionou. Tente novamente.
fingerprint-not-recognized = Impressão digital não reconhecida

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

## Administrator authentication

polkit-title = Autenticação necessária
polkit-administrator = Administrador
polkit-password = Senha
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = Não funcionou. Tente novamente.

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

## Log out, power off and restart dialog

end-session-log-out-user = Sair: { $userName }
end-session-log-out-title = Sair
end-session-log-out-user-countdown = { $seconds ->
    [one] A sessão de { $userName } será encerrada automaticamente em { $seconds } segundo
   *[other] A sessão de { $userName } será encerrada automaticamente em { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [one] Sua sessão será encerrada automaticamente em { $seconds } segundo
   *[other] Sua sessão será encerrada automaticamente em { $seconds } segundos
}
end-session-log-out-button = Sair
end-session-power-off-title = Desligar
end-session-power-off-updates-title = Instalar atualizações e desligar
end-session-power-off-countdown = { $seconds ->
    [one] O computador será desligado automaticamente em { $seconds } segundo
   *[other] O computador será desligado automaticamente em { $seconds } segundos
}
end-session-power-off-button = Desligar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar atualizações e reiniciar
end-session-restart-countdown = { $seconds ->
    [one] O computador será reiniciado automaticamente em { $seconds } segundo
   *[other] O computador será reiniciado automaticamente em { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar atualizações
end-session-update-restart-countdown = { $seconds ->
    [one] O computador será reiniciado e instalará as atualizações automaticamente em { $seconds } segundo
   *[other] O computador será reiniciado e instalará as atualizações automaticamente em { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar atualizações pendentes
end-session-install-version = Instalar a versão { $version }
end-session-low-battery = Bateria fraca: conecte o carregador antes de instalar atualizações
end-session-busy-apps = Alguns apps estão ocupados ou têm trabalho não salvo
end-session-other-users = Há outros usuários conectados
end-session-cancel = Cancelar
end-session-boot-options = Opções de inicialização
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (console)

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

## Lock screen clock

lock-clock-swipe-up = Deslize para cima
lock-clock-click-or-press = Clique ou pressione uma tecla

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Janelas
ctrl-alt-tab-panel = Painel
ctrl-alt-tab-unlock = Janela de desbloqueio

## System notifications

messages-system-source = Sistema
unsafe-mode-title = O sistema foi colocado em modo inseguro
unsafe-mode-body = Os apps agora têm acesso irrestrito
unsafe-mode-undo = Desfazer
privileged-user-title = Conectado como usuário privilegiado
privileged-user-body = Por segurança, evite usar uma sessão como usuário privilegiado. Se possível, entre como usuário comum.

## On-screen keyboard

osk-keyboard-settings = Configurações de teclado
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = O Kestrel precisa bloquear a tela

## Notifications

messages-unknown-app = App desconhecido
messages-reply = Responder
messages-reply-placeholder = Escreva uma resposta
messages-reply-send = Enviar

## Media player controls

mpris-unknown-artist = Artista desconhecido
mpris-unknown-title = Título desconhecido

## Starting programs

spawn-failed = Falha ao executar “{ $command }”:

## Text field context menu

entry-menu-copy = Copiar
entry-menu-paste = Colar
entry-menu-show-text = Mostrar texto
entry-menu-hide-text = Ocultar texto
entry-caps-lock-on = Caps Lock ativado

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Capturar tela
title-bar-menu-hide = Ocultar
title-bar-menu-restore = Restaurar
title-bar-menu-maximize = Maximizar
title-bar-menu-move = Mover
title-bar-menu-resize = Redimensionar
title-bar-menu-always-on-top = Sempre visível
title-bar-menu-always-on-visible-workspace = Em todos os espaços de trabalho
title-bar-menu-workspace-left = Mover para o espaço de trabalho à esquerda
title-bar-menu-workspace-right = Mover para o espaço de trabalho à direita
title-bar-menu-workspace-up = Mover para o espaço de trabalho acima
title-bar-menu-workspace-down = Mover para o espaço de trabalho abaixo
title-bar-menu-monitor-up = Mover para a tela acima
title-bar-menu-monitor-down = Mover para a tela abaixo
title-bar-menu-monitor-left = Mover para a tela à esquerda
title-bar-menu-monitor-right = Mover para a tela à direita
title-bar-menu-close = Fechar

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
