## Displays

settings-display-mirror = Espelhar telas
settings-display-mirror-description = Mostra a mesma imagem em todas as telas
settings-display-mirrored = Telas espelhadas
settings-display-display = Tela
settings-display-apply-failed = Estas configurações não funcionaram. Tente outra combinação.
settings-display-reset = Redefinir
settings-display-apply = Aplicar
settings-display-arrangement-main = { $name }, tela principal
settings-display-use = Usar esta tela
settings-display-main = Tela principal
settings-display-main-description = A barra de tarefas e as novas janelas aparecem aqui
settings-display-resolution-title = Resolução
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Taxa de atualização
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Taxa de atualização variável
settings-display-variable-refresh-description = Faz a tela acompanhar a taxa de quadros de jogos em tela cheia para movimentos mais suaves
settings-display-variable-refresh-off = Desativada
settings-display-variable-refresh-games = Em jogos
settings-display-variable-refresh-fullscreen = Em todos os apps em tela cheia
settings-display-scale = Escala
settings-display-scale-description = Deixa o texto, os apps e todo o resto maiores ou menores
settings-display-orientation = Orientação
settings-display-orientation-landscape = Paisagem
settings-display-orientation-portrait-right = Retrato, girado à direita
settings-display-orientation-portrait-left = Retrato, girado à esquerda
settings-display-orientation-landscape-flipped = Paisagem, invertida

## Display brightness

settings-display-brightness = Brilho
settings-display-brightness-label = Brilho de { $name }
settings-display-brightness-unsupported = Ative o DDC/CI no menu do monitor para alterar o brilho aqui
settings-display-brightness-unresponsive = Sem resposta no momento, tentando de novo em instantes
settings-display-brightness-external = Monitores externos
settings-display-brightness-missing-tool = Instale o ddcutil para alterar o brilho deles aqui
settings-display-brightness-needs-restart = Reinicie para terminar de configurar o brilho deles
settings-display-brightness-no-access = Saia e entre novamente para alterar o brilho deles aqui

## Night light

settings-display-night-light = Luz noturna
settings-display-night-light-description = Cores mais quentes à noite, mais confortáveis para os olhos
settings-display-night-light-schedule = Programação
settings-display-night-light-automatic = Do pôr ao nascer do sol
settings-display-night-light-custom = Personalizada
settings-display-night-light-from = Início
settings-display-night-light-to = Fim
settings-display-night-light-warmth = Intensidade

## Sound

settings-sound-output = Saída
settings-sound-input = Entrada
settings-sound-device = Dispositivo
settings-sound-output-device = Dispositivo de saída
settings-sound-input-device = Dispositivo de entrada
settings-sound-connection = Conexão
settings-sound-output-connection = Conexão de saída
settings-sound-input-connection = Conexão de entrada
settings-sound-volume = Volume
settings-sound-mute = Silenciar { $name }
settings-sound-unmute = Ativar o som de { $name }
settings-sound-balance = Balanço
settings-sound-balance-center = Centro
settings-sound-balance-left = { $share } à esquerda
settings-sound-balance-right = { $share } à direita
settings-sound-louder = Permitir volume acima de 100%
settings-sound-louder-description = O som pode distorcer em volumes mais altos
settings-sound-input-level = Nível de entrada
settings-sound-apps = Volume dos apps
settings-sound-apps-playing = { $count ->
    [one] { $count } app reproduzindo som
   *[other] { $count } apps reproduzindo som
}
settings-sound-app-output = Saída de { $app }
settings-sound-profiles = Perfis de dispositivo
settings-sound-profiles-row-description = Escolha como cada dispositivo de som é usado
settings-sound-profiles-description = Como cada dispositivo de som é usado, como estéreo ou surround
settings-sound-profile-label = Uso de { $device }
settings-sound-profile-off = Desativado

## System sounds

settings-sound-system = Sons do sistema
settings-sound-system-description = Sons de notificações, dispositivos e outros eventos
settings-sound-system-volume = Volume dos sons do sistema
settings-sound-kind-notifications = Notificações
    .description = Silenciados durante o Não perturbe, jogos e compartilhamento de tela
    .preview = Tocar o som de notificação
settings-sound-kind-devices = Dispositivos e carregamento
    .description = Ao conectar um dispositivo ou carregador e com bateria fraca
    .preview = Tocar o som de dispositivo
settings-sound-kind-volume = Retorno de volume
    .description = Um clique ao alterar o volume
    .preview = Tocar o clique de volume
settings-sound-kind-screenshots = Capturas de tela
    .description = Um som de obturador ao salvar uma captura de tela
    .preview = Tocar o som de obturador
settings-sound-kind-recording = Gravação
    .description = Quando a gravação de tela, a câmera ou o ditado começa ou termina
    .preview = Tocar o som de gravação
settings-sound-kind-sign-in = Som de login
    .description = Quando a área de trabalho aparece
    .preview = Tocar o som de login
settings-sound-kind-keyboard = Sons do teclado
    .description = Cada tecla do teclado virtual
    .preview = Tocar o som de tecla

## Power and battery

settings-power-battery = Bateria
settings-power-charging = Carregando
settings-power-charging-at = Carregando a { $power }
settings-power-charging-until-full = Carregando, carga completa em { $time }
settings-power-charging-at-until-full = Carregando a { $power }, carga completa em { $time }
settings-power-on-battery = Na bateria
settings-power-on-battery-using = Na bateria, usando { $power }
settings-power-time-left = Cerca de { $time } de bateria
settings-power-time-left-using = Cerca de { $time } de bateria, usando { $power }
settings-power-full = Totalmente carregada
settings-power-empty = Vazia
settings-power-not-charging = Conectada, sem carregar
settings-power-health = Saúde da bateria
settings-power-capacity = { $full } de { $design } quando nova
settings-power-cycles = { $count ->
    [one] { $cycles } ciclo de carga
   *[other] { $cycles } ciclos de carga
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Mostrar porcentagem
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
} e { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
}
settings-power-never = Nunca

## Charge limit

settings-power-limit = Limitar carga
settings-power-limit-failed = Não foi possível alterar o limite. Tente novamente.
settings-power-limit-elsewhere-off = Outro app desativou o limite, então a bateria carrega totalmente
settings-power-limit-elsewhere-changed = Outro app alterou o limite para { $level }
settings-power-limit-elsewhere-on = Outro app interrompe a carga em { $level }
settings-power-limit-automatic = O computador decide quando parar de carregar
settings-power-limit-stops-at = Para de carregar em { $level }
settings-power-limit-description = Para de carregar antes para ajudar a bateria a durar mais
settings-power-limit-description-at = Para em { $level } para ajudar a bateria a durar mais
settings-power-limit-applied = A carga para em { $level }
settings-power-limit-applied-description = Definido por outro app neste computador

## Battery-powered devices

settings-power-devices = Dispositivos
settings-power-device-mouse = Mouse
settings-power-device-keyboard = Teclado
settings-power-device-headphones = Fones de ouvido
settings-power-device-speaker = Caixa de som
settings-power-device-controller = Controle
settings-power-device-phone = Celular
settings-power-device-tablet = Tablet
settings-power-device-pen = Caneta
settings-power-device-touchpad = Touchpad
settings-power-device-other = Dispositivo

## Power mode

settings-power-mode = Modo de energia
settings-power-mode-row = Modo
settings-power-profile-saver = Economia de energia
    .description = Mais lento e gasta menos energia
settings-power-profile-balanced = Equilibrado
    .description = Desempenho e consumo de energia padrão
settings-power-profile-performance = Desempenho
    .description = Mais rápido e gasta mais energia
settings-power-limited = O desempenho está limitado no momento
settings-power-limited-lap = O desempenho está limitado porque o computador está no seu colo
settings-power-limited-hot = O desempenho está limitado porque o computador está quente demais
settings-power-limited-lap-hot = O desempenho está limitado porque o computador está no seu colo e quente demais
settings-power-saver-low-battery = Economia de energia com bateria fraca
settings-power-saver-low-battery-description = Muda para Economia de energia quando a bateria fica fraca
settings-power-saver-level = Nível da bateria para a economia de energia

## Keyboard backlight

settings-power-keyboard = Teclado
settings-power-backlight = Luz do teclado
settings-power-backlight-off = Desativada
settings-power-backlight-low = Baixa
settings-power-backlight-medium = Média
settings-power-backlight-high = Alta

## Screen and sleep

settings-power-screen = Tela
settings-power-screen-off = Desligar a tela após
settings-power-screen-off-description = Quando o computador fica sem uso por um tempo
settings-power-dim = Escurecer quando inativo
settings-power-dim-description = Reduz o brilho pouco antes de a tela desligar
settings-power-sleep = Suspensão
settings-power-suspend-plugged-in = Suspender quando conectado
settings-power-suspend-inactive = Suspender quando inativo
settings-power-suspend-description = Suspende o computador depois de um tempo sem uso
settings-power-suspend-battery = Suspender ao usar bateria
settings-power-button = Botão liga/desliga
settings-power-button-suspend = Suspender
settings-power-button-hibernate = Hibernar
settings-power-button-ask = Perguntar o que fazer
settings-power-button-nothing = Não fazer nada
settings-power-long-sleep = Desligar após uma longa suspensão
settings-power-long-sleep-description = Em vez de deixar a bateria acabar durante a suspensão, o computador desliga quando a bateria fica fraca ou após uma longa suspensão na bateria. As janelas abertas não são mantidas.
settings-power-long-sleep-failed = Não foi possível alterar esta opção. Tente novamente.
settings-power-long-sleep-after = Desligar após
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

settings-keyboard-sources = Fontes de entrada
settings-keyboard-sources-description = A primeira é usada por padrão. Alterne entre elas enquanto digita.
settings-keyboard-source-edit = Editar no Keys
settings-keyboard-source-up = Mover para cima
settings-keyboard-source-down = Mover para baixo
settings-keyboard-source-remove = Remover
settings-keyboard-add-source-button = Adicionar fonte de entrada
settings-keyboard-own = Seus layouts e métodos de entrada
settings-keyboard-own-layout = Criar um layout
settings-keyboard-own-layout-description = Comece com um layout e mude o que as teclas digitam
settings-keyboard-own-method = Criar um método de entrada
settings-keyboard-own-method-description = Transforme o que você digita em acentos, outras escritas ou palavras para escolher
settings-keyboard-own-open = Abrir o Keys
settings-keyboard-own-open-description = Edite os layouts e métodos de entrada que você criou
settings-keyboard-switch-source = Alternar fonte de entrada
settings-keyboard-add-source = Adicionar uma fonte de entrada
settings-keyboard-add-source-description = Escolha o layout de teclado ou o método de entrada que você quer usar para digitar.
settings-keyboard-add-source-search = Pesquisar idiomas, layouts e métodos de entrada
settings-keyboard-input-method = Método de entrada
settings-keyboard-add-source-no-match = Nada corresponde a “{ $query }”
settings-keyboard-cancel = Cancelar
settings-keyboard-add = Adicionar
settings-keyboard-typing = Digitação
settings-keyboard-repeat = Repetição de teclas
settings-keyboard-repeat-description = Manter uma tecla pressionada digita o caractere várias vezes
settings-keyboard-repeat-delay = Atraso antes de repetir
settings-keyboard-repeat-delay-shorter = Menor
settings-keyboard-repeat-delay-longer = Maior
settings-keyboard-repeat-speed = Velocidade de repetição
settings-keyboard-repeat-speed-slower = Mais lenta
settings-keyboard-repeat-speed-faster = Mais rápida
settings-keyboard-caps-lock = Tecla Caps Lock
settings-keyboard-caps-lock-description = O que acontece quando você a pressiona
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Trocar com Esc
settings-keyboard-caps-lock-nothing = Nada
settings-keyboard-caps-lock-custom = Personalizado
settings-keyboard-lock-notices = Mostrar Caps Lock e Num Lock
settings-keyboard-lock-notices-description = Mostra um aviso rápido na tela quando um deles é ativado ou desativado
settings-keyboard-dictation-on = Ativado
settings-keyboard-dictation-off = Desativado
settings-keyboard-shortcuts-description = Veja e altere atalhos ou adicione os seus

## Copilot key

settings-keyboard-copilot = Tecla Copilot
settings-keyboard-copilot-press = Ao pressionar
settings-keyboard-copilot-press-description = O que acontece ao pressionar a tecla rapidamente
settings-keyboard-copilot-open-start = Abrir o menu Start
settings-keyboard-copilot-open-app = Abrir um app
settings-keyboard-copilot-nothing = Nada
settings-keyboard-copilot-app = App
settings-keyboard-copilot-no-app = Nenhum app escolhido
settings-keyboard-copilot-change = Alterar
settings-keyboard-copilot-choose = Escolher
settings-keyboard-copilot-hold = Segurar para ditar
settings-keyboard-copilot-hold-description = Segure a tecla e fale para digitar o que você diz
settings-keyboard-copilot-hold-off = Funciona quando o ditado está ativado
settings-keyboard-copilot-choose-app = Escolher um app
settings-keyboard-copilot-choose-app-description = A tecla Copilot abre este app.

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
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menu
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Aumentar volume
settings-keys-volume-down = Diminuir volume
settings-keys-mute = Mudo
settings-keys-microphone-mute = Microfone mudo
settings-keys-play = Reproduzir
settings-keys-media-pause = Pausar
settings-keys-stop = Parar
settings-keys-next-track = Próxima faixa
settings-keys-previous-track = Faixa anterior
settings-keys-brightness-up = Aumentar brilho
settings-keys-brightness-down = Diminuir brilho
settings-keys-browser = Navegador
settings-keys-home-page = Página inicial
settings-keys-search = Pesquisar
settings-keys-mail = E-mail
settings-keys-calculator = Calculadora
settings-keys-files = Arquivos
settings-keys-eject = Ejetar
settings-keys-power = Energia
settings-keys-lock = Bloquear

## Keyboard shortcuts

settings-shortcuts-title = Atalhos de teclado
settings-shortcuts-search = Pesquisar atalhos
settings-shortcuts-category-system = Sistema
settings-shortcuts-category-windows = Janelas
settings-shortcuts-category-tiling = Mosaico
settings-shortcuts-category-workspaces = Espaços de trabalho
settings-shortcuts-category-screenshots = Capturas de tela
settings-shortcuts-category-media = Mídia
settings-shortcuts-reset = Restaurar padrão
settings-shortcuts-apps = Atalhos de apps
settings-shortcuts-apps-description = Atalhos que os apps pediram e que funcionam mesmo quando o app não está em primeiro plano
settings-shortcuts-no-match = Nenhum atalho corresponde a “{ $query }”
settings-shortcuts-change = Alterar atalho de { $name }
settings-shortcuts-or = ou
settings-shortcuts-not-set = Não definido
settings-shortcuts-press-keys = Pressione as teclas que você quer usar
settings-shortcuts-needs-modifier = Inclua Ctrl, Alt ou Super para que o atalho não atrapalhe a digitação.
settings-shortcuts-record-description = Pressione o novo atalho. Backspace desativa, Esc cancela.
settings-shortcuts-record-taken = Este atalho já é usado para “{ $name }”. Se você substituir, ele será desativado lá.
settings-shortcuts-try-another = Tentar outro
settings-shortcuts-replace = Substituir
settings-shortcuts-cancel = Cancelar
settings-shortcuts-custom = Atalhos personalizados
settings-shortcuts-custom-description = Execute um comando ou abra um app com uma combinação de teclas
settings-shortcuts-untitled = Sem nome
settings-shortcuts-add = Adicionar atalho
settings-shortcuts-edit = Editar atalho
settings-shortcuts-custom-name = Nome
settings-shortcuts-custom-command = Comando
settings-shortcuts-custom-shortcut = Atalho
settings-shortcuts-custom-taken = Já usado para “{ $name }”. Ao salvar, ele será desativado lá.
settings-shortcuts-remove = Remover
settings-shortcuts-save = Salvar
settings-shortcuts-add-button = Adicionar

## Dictation

settings-dictation-title = Ditado
settings-dictation-description = Segure { $keys } e fale para digitar o que você diz, em qualquer app. Solte para terminar ou pressione Esc para cancelar. Tudo acontece neste computador: sua voz nunca sai dele e não é salva.
settings-dictation-description-no-shortcut = Escolha um atalho abaixo para ditar. Tudo acontece neste computador: sua voz nunca sai dele e não é salva.
settings-dictation-not-installed = O ditado não está instalado neste computador
settings-dictation-hold = Segure { $keys } para ditar
settings-dictation-needs-shortcut = Desativado até ter um atalho
settings-dictation-copilot-key = a tecla Copilot
settings-dictation-shortcut = Atalho
settings-dictation-shortcut-description = Segure para falar ou pressione para ouvir até pressionar de novo ou parar de falar
settings-dictation-shortcut-own = Meu próprio atalho
settings-dictation-shortcut-another = Outro atalho…
settings-dictation-shortcut-off = Desativado
settings-dictation-keys = Teclas
settings-dictation-change = Alterar
settings-dictation-language = Idioma
settings-dictation-language-automatic = Automático
settings-dictation-language-automatic-current = Automático ({ $language })
settings-dictation-language-description = No modo automático, segue o layout de teclado que você usa para digitar
settings-dictation-language-unavailable = { $language } não está disponível neste computador
settings-dictation-engine = Reconhecimento de fala
settings-dictation-engine-automatic = Automático
settings-dictation-engine-description = { $engine } reconhece { $language }
settings-dictation-engine-graphics-card = { $engine } reconhece { $language } na placa de vídeo
settings-dictation-models = Modelos de fala
settings-dictation-models-description = Os modelos são baixados uma vez e ficam neste computador.
settings-dictation-credits = Créditos
settings-dictation-credit = { $credit }. Licenciado sob { $licence }.
settings-dictation-learn-more = Saiba mais

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Não foi possível baixar: { $reason }
settings-dictation-model-downloading = { $received } de { $total }
settings-dictation-model-installed = { $size } neste computador
settings-dictation-model-partial = { $received } de { $total } baixados
settings-dictation-model-size = { $size } para baixar
settings-dictation-model-retry = Tentar novamente
settings-dictation-model-cancel = Cancelar
settings-dictation-model-resume = Retomar
settings-dictation-model-download = Baixar
settings-dictation-model-remove = Remover

## Mouse and touchpad

settings-mouse-mouse = Mouse
settings-mouse-primary-button = Botão principal
settings-mouse-primary-button-description = O botão que você clica para selecionar
settings-mouse-primary-button-left = Esquerdo
settings-mouse-primary-button-right = Direito
settings-mouse-speed = Velocidade do ponteiro
settings-mouse-slower = Mais lenta
settings-mouse-faster = Mais rápida
settings-mouse-acceleration = Aceleração do mouse
settings-mouse-acceleration-description = O ponteiro vai mais longe quando você move o mouse rapidamente
settings-mouse-natural-scrolling = Rolagem natural
settings-mouse-natural-scrolling-description = A rolagem move o conteúdo em vez da visualização
settings-mouse-touchpad = Touchpad
settings-mouse-touchpad-speed = Velocidade do ponteiro no touchpad
settings-mouse-touchpad-scroll-speed = Velocidade de rolagem
settings-mouse-touchpad-scroll-speed-label = Velocidade de rolagem do touchpad
settings-mouse-touchpad-tap = Tocar para clicar
settings-mouse-touchpad-tap-description = Toque no touchpad em vez de pressioná-lo
settings-mouse-touchpad-natural-scrolling = Rolagem natural do touchpad
settings-mouse-touchpad-natural-scrolling-description = O conteúdo se move na mesma direção dos dedos
settings-mouse-touchpad-scroll-with = Rolar com
settings-mouse-touchpad-two-fingers = Dois dedos
settings-mouse-touchpad-scroll-edge = Borda
settings-mouse-touchpad-secondary-click = Clique secundário
settings-mouse-touchpad-secondary-click-description = Como clicar com o botão direito sem um botão separado
settings-mouse-touchpad-click-corner = Canto
settings-mouse-touchpad-disable-typing = Desativar ao digitar
settings-mouse-touchpad-disable-typing-description = Para o ponteiro não pular enquanto você digita
