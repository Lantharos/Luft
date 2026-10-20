## Buttons used across steps

setup-continue = Continuar
setup-back = Voltar
setup-cancel = Cancelar
setup-not-now = Agora não
setup-try-again = Tentar novamente
setup-restart = Reiniciar
setup-restart-now = Reiniciar agora
setup-restart-later = Reiniciar depois
setup-saving = Salvando…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Instalando o Luft
setup-installing-progress = Instalando, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Pesquisar
setup-picker-no-match = Nenhum resultado

## Welcome step: language, keyboard and time zone

setup-region-title = Boas-vindas ao Luft
setup-region-language = Idioma
setup-region-keyboard = Teclado
setup-region-time-zone = Fuso horário
setup-region-intro = Vamos começar. Escolha o idioma, o teclado e o fuso horário.
setup-region-intro-guessed-computer = Vamos começar. Detectamos estas opções pelo computador, então altere o que estiver errado.
setup-region-intro-guessed = Vamos começar. Detectamos { $guesses }, então altere o que estiver errado.
setup-region-guess-from-computer = { $fields } pelo computador
setup-region-guess-from-network = { $fields } pela rede
setup-region-field-language = o idioma
setup-region-field-keyboard = o teclado
setup-region-field-time-zone = o fuso horário

## Where Luft goes

setup-destination-choose-title = Onde o Luft deve ficar?
setup-destination-choose-description = Escolha como o Luft vai ficar neste computador. Nada muda até você confirmar.
setup-destination-alongside-title = Abrir espaço ao lado do Windows
setup-destination-alongside-description = O Windows fica menor para dar espaço ao Luft. Seus arquivos no Windows continuam como estão.
setup-destination-whole-title = Escolher um disco
setup-destination-whole-description = O Luft ocupa o disco inteiro. Tudo o que houver nele será apagado.
setup-destination-custom-title = Escolher o espaço para o Luft
setup-destination-custom-description = Use o app Discos para organizar os discos do seu jeito.
setup-destination-replace-title = Substituir o { $system }
setup-destination-replace-description = O Luft toma o lugar dele e mantém o que é seu.
setup-destination-meet-title = Ao lado do Windows
setup-destination-meet-description = O Meet Luft já abriu este espaço, então o Windows continua exatamente como está.
setup-destination-looking = Verificando os discos…

setup-destination-meet-choice = Junto com o Windows
setup-destination-meet-choice-description = Usar os { $size } que o Meet Luft reservou ao lado do Windows.
setup-destination-alongside-choice = Junto com o { $windows }
setup-destination-alongside-choice-description = Manter o Windows e os arquivos dele e dar ao Luft parte do disco.
setup-destination-replace-choice = Substituir o { $system }
setup-destination-replace-choice-description = Manter seus arquivos, sua conta e suas configurações e deixar o Luft tomar o lugar dele.
setup-destination-whole-choice = Usar um disco inteiro
setup-destination-whole-choice-description = Apagar um disco e entregá-lo todo ao Luft.
setup-destination-try-choice = Só experimentar o Luft
setup-destination-try-choice-description = Conheça primeiro. Nada é instalado e os discos ficam intactos.
setup-destination-custom-choice = Personalizado
setup-destination-custom-choice-description = Organizar as partições você mesmo no app Discos.

setup-destination-more-options = Mais opções
setup-destination-starting = Iniciando…
setup-destination-replace = Substituir
setup-destination-install = Instalar o Luft

## Confirming where Luft goes

setup-confirm-replace-title = Substituir o { $system }?
setup-confirm-erase-title = Apagar { $drive }?
setup-confirm-shrink-title = Reduzir o Windows para { $size }?
setup-confirm-meet-title = Instalar o Luft ao lado do Windows?
setup-confirm-free-title = Instalar o Luft no espaço livre?
setup-confirm-replace-keep-old = O Luft começa a copiar imediatamente. O sistema antigo não vai mais iniciar, e os arquivos dele ficam até você removê-los.
setup-confirm-replace-erase-old = O Luft começa a copiar imediatamente. O sistema antigo é apagado de vez, e seus arquivos ficam onde estão.
setup-confirm-erase-description = Tudo neste disco será apagado de vez, incluindo outros sistemas e arquivos.
setup-confirm-install-description = O Luft começa a copiar imediatamente. Você pode configurar sua conta enquanto isso.
setup-confirm-erase = Apagar e instalar
setup-confirm-install = Instalar

## Making room next to Windows

setup-alongside-hint = Arraste para dividir { $drive } entre o Windows e o Luft. O Windows mantém todos os arquivos e um pouco de espaço para crescer.
setup-windows-bitlocker = O Windows mantém este disco bloqueado com o BitLocker, então o Luft não consegue abrir espaço nele. No Windows, desative a criptografia do dispositivo ou reduza o disco no Gerenciamento de Disco e escolha o espaço livre em Personalizado.
setup-windows-hibernated = O Windows está em suspensão ou foi desligado com a Inicialização rápida, então não é seguro alterar o disco dele. Inicie o Windows, mantenha Shift pressionado enquanto escolhe Desligar e inicie o Luft novamente.
setup-windows-dirty = O disco do Windows precisa de uma verificação rápida primeiro. Inicie o Windows, reinicie-o uma vez e inicie o Luft novamente.
setup-windows-full = O Windows precisa de quase todo o disco. Libere cerca de { $size } no Windows e inicie o Luft novamente.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = O que você empacotou no Windows, { $size }, será desempacotado na sua nova conta.

## Windows options

setup-windows-fast-startup = Desativar a Inicialização rápida no Windows
setup-windows-fast-startup-description = Assim o Windows desliga por completo, o som, o Wi-Fi e o Bluetooth começam do zero no Luft e o disco do Windows fica acessível.
setup-windows-clock = Manter o relógio certo nos dois
setup-windows-clock-description = O Windows passa a ler o relógio do computador como o Luft, então a hora não pula mais quando você alterna entre eles.
setup-windows-bluetooth = Trazer seus dispositivos Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } dispositivo pareado no Windows vai funcionar no Luft sem precisar parear de novo.
   *[other] { $count } dispositivos pareados no Windows vão funcionar no Luft sem precisar parear de novo.
}

## Choosing a drive

setup-drives-label = Discos
setup-drives-none = Nenhum disco pode ser usado pelo Luft. Conecte um e verifique de novo.
setup-drive-has-windows = Tem o { $windows }
setup-drive-empty = Vazio
setup-drive-partitions = { $count ->
    [one] Tem { $count } partição
   *[other] Tem { $count } partições
}

## Custom space

setup-custom-open-disks = Abrir Discos
setup-custom-looking = Verificando…
setup-custom-look-again = Verificar de novo
setup-custom-free-label = Espaço livre
setup-custom-free-space = { $size } de espaço livre
setup-custom-on-drive = Em { $drive }
setup-custom-none = Deixe pelo menos { $size } de espaço livre no app Discos e verifique de novo. O Luft fica no espaço que você deixar livre.

## Replacing a Linux system

setup-replace-stays = O que fica
setup-replace-changes = O que muda
setup-replace-keeps-account = Seus arquivos e sua conta { $account }
setup-replace-keeps-account-password = Seus arquivos e sua conta { $account } com a senha dela
setup-replace-keeps-accounts = { $count ->
    [one] A outra conta do sistema, com os arquivos dela
   *[other] As outras { $count } contas do sistema, com os arquivos delas
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } conexão de rede, com a senha do Wi-Fi
   *[other] { $count } conexões de rede, com as senhas do Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montados na inicialização como antes
setup-replace-keeps-hostname = O nome do computador, { $hostname }, e as chaves SSH dele
setup-replace-keeps-tools = { $count ->
    [one] { $count } ferramenta de linha de comando que você instalou, em um Toolbox depois que você entrar
   *[other] { $count } ferramentas de linha de comando que você instalou, em um Toolbox depois que você entrar
}
setup-replace-keeps-old = O { $system } deixa de iniciar. Os arquivos de sistema dele são mantidos como old-system até você removê-los no app Discos ou nas Configurações.
setup-replace-erases-system = A partição de sistema do { $system } é apagada. Seus arquivos estão em uma partição própria e continuam como estão.
setup-replace-clears-boot = A partição /boot dele é esvaziada para receber os arquivos de inicialização do Luft.
setup-replace-apps = Os apps instalados nele não vêm junto. Baixe-os de novo no Schelf.

setup-replace-blocked-encrypted = Ele está criptografado, então ainda não é possível substituí-lo mantendo seus arquivos.
setup-replace-blocked-single = Seus arquivos estão na mesma partição que o sistema, então ainda não é possível substituí-lo mantendo-os.
setup-replace-blocked-layout = O disco dele está organizado de um jeito que o Luft ainda não consegue substituir.
setup-replace-blocked-startup = A partição de sistema EFI dele é pequena demais para o Luft, e não há uma partição /boot para usar no lugar.
setup-replace-blocked-no-account = Ele não tem nenhuma conta para trazer.
setup-replace-blocked-running = O Luft está sendo executado a partir dele agora. Inicie o Luft por um pen drive para substituí-lo.
setup-replace-blocked-read-only = O disco dele é somente leitura.

## Connecting to the internet

setup-network-title = Conectar à internet
setup-network-description = Isto é opcional. Com internet, o Luft acerta o relógio e o fuso horário, e você pode usar a internet enquanto o Luft é instalado.
setup-network-unavailable = As redes não estão disponíveis agora. Você pode se conectar depois pelo painel.
setup-network-looking = Procurando redes…
setup-network-cable = Conectado por cabo
setup-network-show-all = Mostrar todas as redes
setup-network-skip = Pular
setup-network-failed = Não foi possível conectar
setup-network-wrong-password = Senha incorreta
setup-network-connected = Conectado
setup-network-connecting = Conectando…
setup-network-saved = Salva
setup-network-password = Senha
setup-network-join = Conectar

## Account

setup-account-title = Quem vai usar este computador?
setup-account-description = Esta é a conta com a qual você entra. Você pode adicionar mais pessoas depois nas Configurações.
setup-account-full-name = Seu nome
setup-account-full-name-example = Clarice Lispector
setup-account-user-name = Nome de usuário
setup-account-password = Senha
setup-account-repeat = Digite de novo
setup-account-user-name-invalid = Use letras minúsculas, números, - e _
setup-account-full-name-invalid = Não use vírgulas nem dois-pontos
setup-account-mismatch = As senhas não coincidem

## Installing

setup-finishing-failed-title = Não foi possível instalar o Luft
setup-finishing-failed-description = Algo deu errado durante a instalação.
setup-finishing-failed-stick = O computador continua iniciando como antes. Você pode continuar usando o Luft pelo pen drive ou reiniciar e tentar novamente.
setup-finishing-failed-trying = O computador continua iniciando como antes. Você pode continuar usando o Luft como está agora ou reiniciar e tentar novamente.
setup-finishing-use-stick = Usar o Luft pelo pen drive
setup-finishing-keep-trying = Continuar experimentando o Luft
setup-finishing-installed-title = O Luft está instalado
setup-finishing-trust-stick = Retire o pen drive quando a tela escurecer. Depois, uma tela azul vai pedir para confiar no Luft. Use o teclado nela.
setup-finishing-trust = Logo depois de reiniciar, uma tela azul vai pedir para confiar no Luft. Use o teclado nela.
setup-finishing-restart-stick = Reinicie para começar a usá-lo. Retire o pen drive quando a tela escurecer.
setup-finishing-restart = Reinicie para começar a usá-lo.
setup-finishing-title = Quase lá
setup-finishing-description = O Luft está sendo copiado para o computador. Isso leva alguns minutos.
setup-finishing-plug-in = Mantenha o computador ligado na tomada até terminar.
setup-stage-idle = Preparando
setup-stage-preparing = Abrindo espaço para o Luft
setup-stage-copying = Copiando o Luft
setup-stage-waiting = Finalizando
setup-stage-configuring = Configurando sua conta
setup-stage-finished = Concluído

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Pressione uma tecla em até 10 segundos
setup-enroll-choose-enroll = Escolha Enroll MOK e depois Continue
setup-enroll-choose-yes = Escolha Yes
setup-enroll-type-code = Digite o código e escolha Reboot
setup-enroll-digits = { $count ->
    [one] { $count } dígito
   *[other] { $count } dígitos
}
setup-secure-boot-title = O computador ainda não confia no Luft
setup-secure-boot-code = Logo depois da próxima reinicialização, uma tela azul vai pedir para confiar no Luft. Use o teclado nela com este código.
setup-secure-boot-skipped = A tela azul foi pulada. Gere um novo código e reinicie. Depois, use o teclado nela.
setup-secure-boot-getting = Gerando o código…
setup-secure-boot-new-code = Gerar um novo código

## Encryption

setup-protect-title = Proteja seus arquivos
setup-protect-tpm = Criptografe este computador para que ninguém leia seus arquivos sem entrar na sua conta, mesmo se ele for perdido. Ele se desbloqueia sozinho ao iniciar.
setup-protect-passphrase = Criptografe este computador para que ninguém leia seus arquivos sem a sua frase secreta, mesmo se ele for perdido.
setup-protect-staged-title = Seus arquivos serão criptografados
setup-protect-staged-description = A criptografia começa sozinha depois da reinicialização no fim da configuração, e você pode continuar usando o computador enquanto isso.
setup-protect-keep-safe = Guarde esta chave de recuperação em um lugar seguro, longe deste computador. Você vai precisar dela se o computador não conseguir se desbloquear sozinho.
setup-protect-passphrase-label = Frase secreta
setup-protect-repeat = Digite de novo
setup-protect-mismatch = Elas não coincidem
setup-protect-kept = Guardei minha chave de recuperação
setup-protect-background = A criptografia acontece em segundo plano depois da próxima reinicialização, e você pode continuar usando o computador enquanto isso.
setup-protect-encrypt = Criptografar
setup-protect-checking = Verificando…
setup-protect-start = Criptografar meus arquivos

## Fingerprint

setup-fingerprint-title = Entre com o dedo
setup-fingerprint-description = Desbloqueie o Luft com um toque em vez de digitar a senha. Você pode adicionar mais dedos depois nas Configurações.
setup-fingerprint-which = Qual dedo?
setup-fingerprint-another = Adicionar outro dedo?
setup-fingerprint-finger = Dedo
setup-fingerprint-no-reader = O leitor de impressão digital não está respondendo. Você pode adicionar uma impressão digital depois nas Configurações.
setup-fingerprint-add = Adicionar impressão digital
setup-fingerprint-choose-another = Escolher outro dedo

## Done

setup-ready-title = Tudo pronto
setup-ready-trust = Reinicie mais uma vez para concluir. Logo depois de reiniciar, uma tela azul vai pedir para confiar no Luft. Use o teclado nela com este código.
setup-ready-restart = Reinicie mais uma vez para concluir e depois entre com sua senha.
setup-ready-done = Sua área de trabalho está pronta. Divirta-se com o Luft.
setup-ready-start = Começar a usar o Luft
