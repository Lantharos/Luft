## Displays

settings-display-mirror = Duplicar ecrãs
settings-display-mirror-description = Mostra a mesma imagem em todos os ecrãs
settings-display-mirrored = Ecrãs duplicados
settings-display-display = Ecrã
settings-display-apply-failed = Estas definições não funcionaram. Experimente outra configuração.
settings-display-reset = Repor
settings-display-apply = Aplicar
settings-display-arrangement-main = { $name }, ecrã principal
settings-display-use = Utilizar este ecrã
settings-display-main = Ecrã principal
settings-display-main-description = A barra de tarefas e as novas janelas aparecem aqui
settings-display-resolution-title = Resolução
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Taxa de atualização
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Taxa de atualização variável
settings-display-variable-refresh-description = Permite que o ecrã acompanhe a taxa de fotogramas dos jogos em ecrã inteiro, para um movimento mais suave
settings-display-variable-refresh-off = Desativada
settings-display-variable-refresh-games = Em jogos
settings-display-variable-refresh-fullscreen = Em todas as aplicações em ecrã inteiro
settings-display-scale = Escala
settings-display-scale-description = Aumenta ou reduz o tamanho do texto, das aplicações e de tudo o resto
settings-display-orientation = Orientação
settings-display-orientation-landscape = Horizontal
settings-display-orientation-portrait-right = Vertical para a direita
settings-display-orientation-portrait-left = Vertical para a esquerda
settings-display-orientation-landscape-flipped = Horizontal, invertida

## Display brightness

settings-display-brightness = Brilho
settings-display-brightness-label = Brilho de { $name }
settings-display-brightness-unsupported = Ative o DDC/CI no menu do ecrã para alterar o brilho aqui
settings-display-brightness-unresponsive = Não responde neste momento, nova tentativa em breve
settings-display-brightness-external = Ecrãs externos
settings-display-brightness-missing-tool = Instale o ddcutil para alterar o brilho destes ecrãs aqui
settings-display-brightness-needs-restart = Reinicie para concluir a configuração do brilho destes ecrãs
settings-display-brightness-no-access = Termine sessão e volte a iniciá-la para alterar o brilho destes ecrãs aqui

## Night light

settings-display-night-light = Luz noturna
settings-display-night-light-description = Cores mais quentes à noite, mais confortáveis para os olhos
settings-display-night-light-schedule = Agendamento
settings-display-night-light-automatic = Do pôr ao nascer do sol
settings-display-night-light-custom = Personalizado
settings-display-night-light-from = Início
settings-display-night-light-to = Fim
settings-display-night-light-warmth = Temperatura

## Sound

settings-sound-output = Saída
settings-sound-input = Entrada
settings-sound-device = Dispositivo
settings-sound-output-device = Dispositivo de saída
settings-sound-input-device = Dispositivo de entrada
settings-sound-connection = Ligação
settings-sound-output-connection = Ligação de saída
settings-sound-input-connection = Ligação de entrada
settings-sound-volume = Volume
settings-sound-mute = Desativar som: { $name }
settings-sound-unmute = Ativar som: { $name }
settings-sound-balance = Equilíbrio
settings-sound-balance-center = Centro
settings-sound-balance-left = { $share } à esquerda
settings-sound-balance-right = { $share } à direita
settings-sound-louder = Permitir volume acima de 100%
settings-sound-louder-description = O som pode ficar distorcido com volumes mais altos
settings-sound-input-level = Nível de entrada
settings-sound-apps = Volume das aplicações
settings-sound-apps-playing = { $count ->
    [0] Nenhuma aplicação está a reproduzir som
    [one] { $count } aplicação está a reproduzir som
   *[other] { $count } aplicações estão a reproduzir som
}
settings-sound-app-output = Reproduzir { $app } em
settings-sound-profiles = Perfis dos dispositivos
settings-sound-profiles-row-description = Escolha como é utilizado cada dispositivo de som
settings-sound-profiles-description = Como é utilizado cada dispositivo de som, por exemplo em estéreo ou surround
settings-sound-profile-label = Utilização de { $device }
settings-sound-profile-off = Desligado

## System sounds

settings-sound-system = Sons do sistema
settings-sound-system-description = Sons para notificações, dispositivos e outros eventos
settings-sound-system-volume = Volume dos sons do sistema
settings-sound-kind-notifications = Notificações
    .description = Em silêncio durante Não incomodar, jogos e partilha de ecrã
    .preview = Reproduzir o som de notificação
settings-sound-kind-devices = Dispositivos e carregamento
    .description = Ao ligar um dispositivo ou carregador, e com bateria fraca
    .preview = Reproduzir o som de dispositivo
settings-sound-kind-volume = Resposta do volume
    .description = Um clique ao alterar o volume
    .preview = Reproduzir o clique do volume
settings-sound-kind-screenshots = Capturas de ecrã
    .description = Um obturador ao guardar uma captura de ecrã
    .preview = Reproduzir o obturador
settings-sound-kind-recording = Gravação
    .description = Quando a gravação de ecrã, a câmara ou o ditado começam e param
    .preview = Reproduzir o som de gravação
settings-sound-kind-sign-in = Som de início de sessão
    .description = Quando o ambiente de trabalho aparece
    .preview = Reproduzir o som de início de sessão
settings-sound-kind-keyboard = Toques no teclado
    .description = Cada tecla do teclado no ecrã
    .preview = Reproduzir um toque no teclado

## Power and battery

settings-power-battery = Bateria
settings-power-charging = A carregar
settings-power-charging-at = A carregar a { $power }
settings-power-charging-until-full = A carregar, carga completa dentro de { $time }
settings-power-charging-at-until-full = A carregar a { $power }, carga completa dentro de { $time }
settings-power-on-battery = Com bateria
settings-power-on-battery-using = Com bateria, a utilizar { $power }
settings-power-time-left = Tempo restante: cerca de { $time }
settings-power-time-left-using = Tempo restante: cerca de { $time }, a utilizar { $power }
settings-power-full = Totalmente carregada
settings-power-empty = Vazia
settings-power-not-charging = Ligado à corrente, sem carregar
settings-power-health = Estado da bateria
settings-power-capacity = { $full } de { $design } quando nova
settings-power-cycles = { $count ->
    [0] { $cycles } ciclos de carga
    [one] { $cycles } ciclo de carga
   *[other] { $cycles } ciclos de carga
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Mostrar percentagem
settings-power-show-percentage-description = Mostra o nível da bateria dentro do ícone da bateria

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = menos de um minuto
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
} { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
settings-power-never = Nunca

## Charge limit

settings-power-limit = Limitar o carregamento
settings-power-limit-failed = Não foi possível alterar o limite. Tente novamente.
settings-power-limit-elsewhere-off = Outra aplicação desativou o limite, pelo que a bateria carrega totalmente
settings-power-limit-elsewhere-changed = Outra aplicação alterou o limite para { $level }
settings-power-limit-elsewhere-on = Outra aplicação para o carregamento nos { $level }
settings-power-limit-automatic = O computador decide quando parar de carregar
settings-power-limit-stops-at = Para de carregar nos { $level }
settings-power-limit-description = Para de carregar mais cedo para prolongar a vida da bateria
settings-power-limit-description-at = Para nos { $level } para prolongar a vida da bateria
settings-power-limit-applied = O carregamento para nos { $level }
settings-power-limit-applied-description = Definido por outra aplicação neste computador

## Battery-powered devices

settings-power-devices = Dispositivos
settings-power-device-mouse = Rato
settings-power-device-keyboard = Teclado
settings-power-device-headphones = Auscultadores
settings-power-device-speaker = Coluna
settings-power-device-controller = Comando de jogos
settings-power-device-phone = Telemóvel
settings-power-device-tablet = Tablet
settings-power-device-pen = Caneta
settings-power-device-touchpad = Painel tátil
settings-power-device-other = Dispositivo

## Power mode

settings-power-mode = Modo de energia
settings-power-mode-row = Modo
settings-power-profile-saver = Poupança de energia
    .description = Mais lento e gasta menos energia
settings-power-profile-balanced = Equilibrado
    .description = Desempenho e consumo de energia normais
settings-power-profile-performance = Desempenho
    .description = Mais rápido e gasta mais energia
settings-power-limited = O desempenho está limitado neste momento
settings-power-limited-lap = O desempenho está limitado porque o computador está no seu colo
settings-power-limited-hot = O desempenho está limitado porque o computador está demasiado quente
settings-power-limited-lap-hot = O desempenho está limitado porque o computador está no seu colo e demasiado quente
settings-power-saver-low-battery = Poupança de energia com bateria fraca
settings-power-saver-low-battery-description = Muda para poupança de energia quando a bateria fica fraca

## Keyboard backlight

settings-power-keyboard = Teclado
settings-power-backlight = Retroiluminação do teclado
settings-power-backlight-off = Desligada
settings-power-backlight-low = Baixa
settings-power-backlight-medium = Média
settings-power-backlight-high = Alta

## Screen and sleep

settings-power-screen = Ecrã
settings-power-screen-off = Desligar o ecrã após
settings-power-screen-off-description = Quando não utiliza o computador durante algum tempo
settings-power-dim = Escurecer quando inativo
settings-power-dim-description = Reduz o brilho pouco antes de o ecrã se desligar
settings-power-sleep = Suspensão
settings-power-suspend-plugged-in = Suspender quando ligado à corrente
settings-power-suspend-inactive = Suspender quando inativo
settings-power-suspend-description = Suspende o computador após algum tempo sem utilização
settings-power-suspend-battery = Suspender com bateria
settings-power-button = Botão de energia
settings-power-button-suspend = Suspender
settings-power-button-hibernate = Hibernar
settings-power-button-ask = Perguntar o que fazer
settings-power-button-nothing = Não fazer nada
settings-power-long-sleep = Encerrar após uma suspensão longa
settings-power-long-sleep-description = Em vez de deixar a bateria esgotar-se durante a suspensão, o computador encerra quando a bateria fica fraca ou após uma suspensão longa com bateria. As janelas abertas não são mantidas.
settings-power-long-sleep-failed = Não foi possível alterar isto. Tente novamente.
settings-power-long-sleep-after = Encerrar após
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } hora
   *[other] { $hours } horas
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } dia
   *[other] { $days } dias
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } semana
   *[other] { $weeks } semanas
}

## Keyboard

settings-keyboard-sources = Fontes de introdução
settings-keyboard-sources-description = A primeira é utilizada por predefinição. Alterne entre elas enquanto escreve.
settings-keyboard-source-edit = Editar no Keys
settings-keyboard-source-up = Mover para cima
settings-keyboard-source-down = Mover para baixo
settings-keyboard-source-remove = Remover
settings-keyboard-add-source-button = Adicionar fonte de introdução
settings-keyboard-own = Esquemas e métodos de introdução próprios
settings-keyboard-own-layout = Criar um esquema
settings-keyboard-own-layout-description = Parta de um esquema e altere o que as teclas escrevem
settings-keyboard-own-method = Criar um método de introdução
settings-keyboard-own-method-description = Transforme o que escreve em acentos, outros alfabetos ou palavras para escolher
settings-keyboard-own-open = Abrir o Keys
settings-keyboard-own-open-description = Edite os esquemas e métodos de introdução que criou
settings-keyboard-switch-source = Mudar de fonte de introdução
settings-keyboard-add-source = Adicionar uma fonte de introdução
settings-keyboard-add-source-description = Escolha o esquema de teclado ou o método de introdução com que pretende escrever.
settings-keyboard-add-source-search = Pesquisar idiomas, esquemas e métodos de introdução
settings-keyboard-input-method = Método de introdução
settings-keyboard-add-source-no-match = Nada corresponde a «{ $query }»
settings-keyboard-cancel = Cancelar
settings-keyboard-add = Adicionar
settings-keyboard-typing = Escrita
settings-keyboard-repeat = Repetição de teclas
settings-keyboard-repeat-description = Manter uma tecla premida escreve-a repetidamente
settings-keyboard-repeat-delay = Atraso antes da repetição
settings-keyboard-repeat-delay-shorter = Mais curto
settings-keyboard-repeat-delay-longer = Mais longo
settings-keyboard-repeat-speed = Velocidade de repetição
settings-keyboard-repeat-speed-slower = Mais lenta
settings-keyboard-repeat-speed-faster = Mais rápida
settings-keyboard-caps-lock = Tecla Caps Lock
settings-keyboard-caps-lock-description = O que acontece quando a prime
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Trocar com Esc
settings-keyboard-caps-lock-nothing = Nada
settings-keyboard-caps-lock-custom = Personalizado
settings-keyboard-lock-notices = Mostrar Caps Lock e Num Lock
settings-keyboard-lock-notices-description = Mostra brevemente no ecrã quando um deles é ativado ou desativado
settings-keyboard-dictation-on = Ativado
settings-keyboard-dictation-off = Desativado
settings-keyboard-shortcuts-description = Veja e altere atalhos ou adicione os seus

## Copilot key

settings-keyboard-copilot = Tecla Copilot
settings-keyboard-copilot-press = Premir
settings-keyboard-copilot-press-description = O que faz um toque rápido na tecla
settings-keyboard-copilot-open-start = Abrir o Start
settings-keyboard-copilot-open-app = Abrir uma aplicação
settings-keyboard-copilot-nothing = Nada
settings-keyboard-copilot-app = Aplicação
settings-keyboard-copilot-no-app = Ainda não foi escolhida nenhuma aplicação
settings-keyboard-copilot-change = Alterar
settings-keyboard-copilot-choose = Escolher
settings-keyboard-copilot-hold = Manter premida para ditar
settings-keyboard-copilot-hold-description = Mantenha a tecla premida e fale para escrever o que diz
settings-keyboard-copilot-hold-off = Funciona quando o ditado estiver ativado
settings-keyboard-copilot-choose-app = Escolher uma aplicação
settings-keyboard-copilot-choose-app-description = Premir a tecla Copilot abre-a.

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
settings-keys-space = Espaço
settings-keys-enter = Enter
settings-keys-backspace = Retrocesso
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = { $key } (teclado numérico)
settings-keys-volume-up = Aumentar volume
settings-keys-volume-down = Diminuir volume
settings-keys-mute = Desativar som
settings-keys-microphone-mute = Silenciar microfone
settings-keys-play = Reproduzir
settings-keys-media-pause = Pausa
settings-keys-stop = Parar
settings-keys-next-track = Faixa seguinte
settings-keys-previous-track = Faixa anterior
settings-keys-brightness-up = Aumentar brilho
settings-keys-brightness-down = Diminuir brilho
settings-keys-browser = Browser
settings-keys-home-page = Página inicial
settings-keys-search = Pesquisar
settings-keys-mail = Correio
settings-keys-calculator = Calculadora
settings-keys-files = Ficheiros
settings-keys-eject = Ejetar
settings-keys-power = Energia
settings-keys-lock = Bloquear

## Keyboard shortcuts

settings-shortcuts-title = Atalhos de teclado
settings-shortcuts-search = Pesquisar atalhos
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Janelas
settings-shortcuts-category-tiling = Mosaico
settings-shortcuts-category-workspaces = Áreas de trabalho
settings-shortcuts-category-screenshots = Capturas de ecrã
settings-shortcuts-category-media = Multimédia
settings-shortcuts-reset = Repor predefinição
settings-shortcuts-apps = Atalhos das aplicações
settings-shortcuts-apps-description = Pedidos pelas aplicações, funcionam mesmo quando a aplicação não está em primeiro plano
settings-shortcuts-no-match = Nenhum atalho corresponde a «{ $query }»
settings-shortcuts-change = Alterar o atalho de { $name }
settings-shortcuts-or = ou
settings-shortcuts-not-set = Não definido
settings-shortcuts-press-keys = Prima as teclas pretendidas
settings-shortcuts-needs-modifier = Adicione Ctrl, Alt ou Super para que o atalho não interfira com a escrita.
settings-shortcuts-record-description = Prima o novo atalho. Retrocesso desativa-o, Esc cancela.
settings-shortcuts-record-taken = Este atalho já é utilizado para «{ $name }». Substituí-lo desativa-o aí.
settings-shortcuts-try-another = Experimentar outro
settings-shortcuts-replace = Substituir
settings-shortcuts-cancel = Cancelar
settings-shortcuts-custom = Atalhos personalizados
settings-shortcuts-custom-description = Execute um comando ou abra uma aplicação com uma combinação de teclas
settings-shortcuts-untitled = Sem nome
settings-shortcuts-add = Adicionar atalho
settings-shortcuts-edit = Editar atalho
settings-shortcuts-custom-name = Nome
settings-shortcuts-custom-command = Comando
settings-shortcuts-custom-shortcut = Atalho
settings-shortcuts-custom-taken = Já é utilizado para «{ $name }». Guardar desativa-o aí.
settings-shortcuts-remove = Remover
settings-shortcuts-save = Guardar
settings-shortcuts-add-button = Adicionar

## Dictation

settings-dictation-title = Ditado
settings-dictation-description = Prima sem soltar { $keys } e fale para escrever o que diz, em qualquer aplicação. Solte para terminar ou prima Esc para cancelar. Tudo acontece neste computador: a sua voz nunca sai dele e não é guardada.
settings-dictation-description-no-shortcut = Escolha um atalho abaixo para ditar. Tudo acontece neste computador: a sua voz nunca sai dele e não é guardada.
settings-dictation-not-installed = O ditado não está instalado neste computador
settings-dictation-hold = Prima sem soltar { $keys } para ditar
settings-dictation-needs-shortcut = Desativado até ter um atalho
settings-dictation-copilot-key = a tecla Copilot
settings-dictation-shortcut = Atalho
settings-dictation-shortcut-description = Mantenha-o premido para falar ou prima-o para ouvir até o premir novamente ou parar de falar
settings-dictation-shortcut-own = O meu atalho
settings-dictation-shortcut-another = Outro atalho…
settings-dictation-shortcut-off = Desativado
settings-dictation-keys = Teclas
settings-dictation-change = Alterar
settings-dictation-language = Idioma
settings-dictation-language-automatic = Automático
settings-dictation-language-automatic-current = Automático ({ $language })
settings-dictation-language-description = O modo automático segue o esquema de teclado com que escreve
settings-dictation-language-unavailable = Idioma não disponível neste computador: { $language }
settings-dictation-engine = Reconhecimento de voz
settings-dictation-engine-automatic = Automático
settings-dictation-engine-description = { $engine } reconhece: { $language }
settings-dictation-engine-graphics-card = { $engine } reconhece na placa gráfica: { $language }
settings-dictation-models = Modelos de voz
settings-dictation-models-description = Os modelos são transferidos uma vez e mantidos neste computador.
settings-dictation-credits = Créditos
settings-dictation-credit = { $credit }. Licenciado ao abrigo da licença { $licence }.
settings-dictation-learn-more = Saber mais

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Não foi possível transferir: { $reason }
settings-dictation-model-downloading = { $received } de { $total }
settings-dictation-model-installed = { $size } neste computador
settings-dictation-model-partial = { $received } de { $total } transferidos
settings-dictation-model-size = { $size } a transferir
settings-dictation-model-retry = Tentar novamente
settings-dictation-model-cancel = Cancelar
settings-dictation-model-resume = Retomar
settings-dictation-model-download = Transferir
settings-dictation-model-remove = Remover

## Mouse and touchpad

settings-mouse-mouse = Rato
settings-mouse-primary-button = Botão principal
settings-mouse-primary-button-description = O botão em que clica para selecionar
settings-mouse-primary-button-left = Esquerdo
settings-mouse-primary-button-right = Direito
settings-mouse-speed = Velocidade do ponteiro
settings-mouse-slower = Mais lenta
settings-mouse-faster = Mais rápida
settings-mouse-acceleration = Aceleração do rato
settings-mouse-acceleration-description = O ponteiro percorre uma distância maior quando move o rato depressa
settings-mouse-natural-scrolling = Deslocamento natural
settings-mouse-natural-scrolling-description = O deslocamento move o conteúdo em vez da vista
settings-mouse-touchpad = Painel tátil
settings-mouse-touchpad-speed = Velocidade do ponteiro do painel tátil
settings-mouse-touchpad-scroll-speed = Velocidade de deslocamento
settings-mouse-touchpad-scroll-speed-label = Velocidade de deslocamento do painel tátil
settings-mouse-touchpad-tap = Tocar para clicar
settings-mouse-touchpad-tap-description = Toque no painel tátil em vez de o premir
settings-mouse-touchpad-natural-scrolling = Deslocamento natural do painel tátil
settings-mouse-touchpad-natural-scrolling-description = O conteúdo move-se na mesma direção dos dedos
settings-mouse-touchpad-scroll-with = Deslocar com
settings-mouse-touchpad-two-fingers = Dois dedos
settings-mouse-touchpad-scroll-edge = Margem
settings-mouse-touchpad-secondary-click = Clique secundário
settings-mouse-touchpad-secondary-click-description = Como clicar com o botão direito sem um botão separado
settings-mouse-touchpad-click-corner = Canto
settings-mouse-touchpad-disable-typing = Desativar ao escrever
settings-mouse-touchpad-disable-typing-description = Para que o ponteiro não salte enquanto escreve
