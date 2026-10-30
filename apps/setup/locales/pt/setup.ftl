## Buttons used across steps

setup-continue = Continuar
setup-back = Voltar
setup-cancel = Cancelar
setup-not-now = Agora não
setup-try-again = Tentar novamente
setup-restart = Reiniciar
setup-restart-now = Reiniciar agora
setup-restart-later = Reiniciar mais tarde
setup-saving = A guardar…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = A instalar o Luft
setup-installing-progress = A instalar, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Pesquisar
setup-picker-no-match = Nada corresponde à pesquisa

## Welcome step: language, keyboard and time zone

setup-region-title = Bem-vindo ao Luft
setup-region-language = Idioma
setup-region-keyboard = Teclado
setup-region-time-zone = Fuso horário
setup-region-intro = Vamos começar. Escolha o idioma, o teclado e o fuso horário.
setup-region-intro-guessed-computer = Vamos começar. Estas opções foram deduzidas a partir do computador; altere o que não estiver certo.
setup-region-intro-guessed = Vamos começar. Deduzimos { $guesses }; altere o que não estiver certo.
setup-region-guess-from-computer = { $fields } a partir do computador
setup-region-guess-from-network = { $fields } a partir da rede
setup-region-field-language = o idioma
setup-region-field-keyboard = o teclado
setup-region-field-time-zone = o fuso horário

## Where Luft goes

setup-destination-choose-title = Onde quer instalar o Luft?
setup-destination-choose-description = Escolha como o Luft fica neste computador. Nada muda até confirmar.
setup-destination-alongside-title = Arranjar espaço ao lado do Windows
setup-destination-alongside-description = O Windows fica mais pequeno para dar espaço ao Luft. Os seus ficheiros no Windows ficam como estão.
setup-destination-whole-title = Escolher um disco
setup-destination-whole-description = O Luft ocupa o disco inteiro. Tudo o que está no disco é apagado.
setup-destination-custom-title = Escolher o espaço para o Luft
setup-destination-custom-description = Utilize os Discos para organizar os discos à sua maneira.
setup-destination-replace-title = Substituir o { $system }
setup-destination-replace-description = O Luft ocupa o lugar do sistema e mantém o que é seu.
setup-destination-meet-title = Ao lado do Windows
setup-destination-meet-description = O Meet Luft já preparou este espaço, por isso o Windows fica exatamente como está.
setup-destination-meet-drive-title = Em { $drive }
setup-destination-meet-drive-description = O Meet Luft já preparou este espaço noutro disco, e o Luft arranca a partir daí com ficheiros de arranque próprios.
setup-destination-looking = A analisar os discos…

setup-destination-meet-choice = Ao lado do Windows
setup-destination-meet-choice-description = Utilizar os { $size } que o Meet Luft preparou ao lado do Windows.
setup-destination-meet-drive-choice = Em { $drive }
setup-destination-meet-drive-choice-description = Utilizar os { $size } que o Meet Luft preparou em { $drive }.
setup-destination-alongside-choice = Ao lado do { $windows }
setup-destination-alongside-choice-description = Manter o Windows e os ficheiros, e dar ao Luft uma parte do disco.
setup-destination-replace-choice = Substituir o { $system }
setup-destination-replace-choice-description = Manter os ficheiros, a conta e as definições, e deixar o Luft ocupar o lugar do sistema.
setup-destination-whole-choice = Utilizar um disco inteiro
setup-destination-whole-choice-description = Apagar um disco e dá-lo todo ao Luft.
setup-destination-try-choice = Só experimentar o Luft
setup-destination-try-choice-description = Explorar primeiro. Nada é instalado e os discos ficam intactos.
setup-destination-custom-choice = Personalizado
setup-destination-custom-choice-description = Organizar as partições manualmente nos Discos.

setup-destination-more-options = Mais opções
setup-destination-starting = A iniciar…
setup-destination-replace = Substituir
setup-destination-install = Instalar o Luft

## Confirming where Luft goes

setup-confirm-replace-title = Substituir o { $system }?
setup-confirm-erase-title = Apagar { $drive }?
setup-confirm-shrink-title = Reduzir o Windows para { $size }?
setup-confirm-meet-title = Instalar o Luft ao lado do Windows?
setup-confirm-meet-drive-title = Instalar o Luft em { $drive }?
setup-confirm-free-title = Instalar o Luft no espaço livre?
setup-confirm-replace-keep-old = O Luft começa a copiar de imediato. O sistema antigo deixa de arrancar, e os ficheiros dele ficam até os remover.
setup-confirm-replace-erase-old = O Luft começa a copiar de imediato. O sistema antigo é apagado definitivamente, e os seus ficheiros ficam onde estão.
setup-confirm-erase-description = Tudo o que está neste disco é apagado definitivamente, incluindo outros sistemas e ficheiros.
setup-confirm-install-description = O Luft começa a copiar de imediato. Pode configurar a conta enquanto isso.
setup-confirm-erase = Apagar e instalar
setup-confirm-install = Instalar

## Making room next to Windows

setup-alongside-hint = Arraste para dividir { $drive } entre o Windows e o Luft. O Windows mantém todos os ficheiros e algum espaço para crescer.
setup-windows-bitlocker = O Windows mantém este disco bloqueado com o BitLocker, por isso o Luft não consegue arranjar espaço nele. No Windows, desative a encriptação do dispositivo ou reduza o disco na Gestão de Discos e escolha o espaço livre em Personalizado.
setup-windows-hibernated = O Windows está em suspensão ou foi encerrado com o arranque rápido, por isso não é seguro alterar o disco dele. Inicie o Windows, mantenha Shift premido enquanto escolhe Encerrar e volte a iniciar o Luft.
setup-windows-dirty = O disco do Windows precisa primeiro de uma verificação rápida. Inicie o Windows, reinicie-o uma vez e volte a iniciar o Luft.
setup-windows-full = O Windows precisa de quase todo o disco. Liberte cerca de { $size } no Windows e volte a iniciar o Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = O que empacotou no Windows ({ $size }) é desempacotado na sua nova conta.

## Windows options

setup-windows-fast-startup = Desativar o arranque rápido no Windows
setup-windows-fast-startup-description = Assim o Windows encerra por completo, o som, o Wi-Fi e o Bluetooth arrancam do zero no Luft e o disco do Windows fica acessível.
setup-windows-clock = Manter o relógio certo nos dois
setup-windows-clock-description = O Windows passa a ler o relógio do computador da mesma forma que o Luft, por isso a hora deixa de saltar quando muda de sistema.
setup-windows-bluetooth = Trazer os dispositivos Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } dispositivo emparelhado no Windows vai funcionar no Luft sem ser preciso emparelhá-lo novamente.
   *[other] { $count } dispositivos emparelhados no Windows vão funcionar no Luft sem ser preciso emparelhá-los novamente.
}

## Choosing a drive

setup-drives-label = Discos
setup-drives-none = Não há nenhum disco que o Luft possa utilizar. Ligue um e procure novamente.
setup-drive-has-windows = Tem o { $windows }
setup-drive-empty = Vazio
setup-drive-partitions = { $count ->
    [one] Tem { $count } partição
   *[other] Tem { $count } partições
}

## Custom space

setup-custom-open-disks = Abrir os Discos
setup-custom-looking = A procurar…
setup-custom-look-again = Procurar novamente
setup-custom-free-label = Espaço livre
setup-custom-free-space = { $size } de espaço livre
setup-custom-on-drive = Em { $drive }
setup-custom-none = Crie pelo menos { $size } de espaço livre nos Discos e procure novamente. O Luft é instalado no espaço que deixar livre.

## Replacing a Linux system

setup-replace-stays = O que fica
setup-replace-changes = O que muda
setup-replace-keeps-account = Os seus ficheiros e a sua conta { $account }
setup-replace-keeps-account-password = Os seus ficheiros e a sua conta { $account }, com a palavra-passe
setup-replace-keeps-accounts = { $count ->
    [one] A outra conta do sistema, com os respetivos ficheiros
   *[other] As outras { $count } contas do sistema, com os respetivos ficheiros
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } ligação de rede, com a palavra-passe do Wi-Fi
   *[other] { $count } ligações de rede, com as palavras-passe do Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montados no arranque como antes
setup-replace-keeps-hostname = O nome do computador, { $hostname }, e as chaves SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } ferramenta de linha de comandos que instalou, numa Toolbox depois de iniciar sessão
   *[other] { $count } ferramentas de linha de comandos que instalou, numa Toolbox depois de iniciar sessão
}
setup-replace-keeps-old = O { $system } deixa de arrancar. Os ficheiros de sistema ficam guardados como old-system até os remover nos Discos ou nas Definições.
setup-replace-erases-system = A partição de sistema do { $system } é apagada. Os seus ficheiros estão numa partição própria e ficam como estão.
setup-replace-clears-boot = A partição /boot é limpa para guardar os ficheiros de arranque do Luft.
setup-replace-apps = As aplicações instaladas no sistema antigo não são transferidas. Pode obtê-las novamente no Schelf.

setup-replace-blocked-encrypted = O sistema está encriptado, por isso ainda não é possível substituí-lo mantendo os seus ficheiros.
setup-replace-blocked-single = Os seus ficheiros estão na mesma partição que o sistema, por isso ainda não é possível substituí-lo mantendo-os.
setup-replace-blocked-layout = O disco está organizado de uma forma que o Luft ainda não consegue substituir.
setup-replace-blocked-startup = A partição de sistema EFI é demasiado pequena para o Luft, e não há nenhuma partição /boot para utilizar em vez dela.
setup-replace-blocked-no-account = O sistema não tem nenhuma conta para transferir.
setup-replace-blocked-running = O Luft está a arrancar a partir deste sistema neste momento. Inicie o Luft a partir de uma pen USB para o substituir.
setup-replace-blocked-read-only = O disco é só de leitura.

## Connecting to the internet

setup-network-title = Ligar à internet
setup-network-description = Este passo é opcional. Com ligação, o Luft acerta o relógio e o fuso horário, e pode utilizar a internet enquanto o Luft é instalado.
setup-network-unavailable = De momento, não há redes disponíveis. Pode ligar-se mais tarde a partir da barra de tarefas.
setup-network-looking = A procurar redes…
setup-network-cable = Ligado por cabo
setup-network-show-all = Mostrar todas as redes
setup-network-skip = Ignorar
setup-network-failed = Não foi possível ligar
setup-network-wrong-password = Palavra-passe incorreta
setup-network-connected = Ligado
setup-network-connecting = A ligar…
setup-network-saved = Guardada
setup-network-password = Palavra-passe
setup-network-join = Ligar

## Account

setup-account-title = Quem vai utilizar este computador?
setup-account-description = Esta é a conta com que inicia sessão. Pode adicionar mais pessoas mais tarde nas Definições.
setup-account-full-name = Nome
setup-account-full-name-example = Fernando Pessoa
setup-account-user-name = Nome de utilizador
setup-account-password = Palavra-passe
setup-account-repeat = Escreva-a novamente
setup-account-user-name-invalid = Utilize letras minúsculas, números, - e _
setup-account-full-name-invalid = Não utilize vírgulas nem dois pontos
setup-account-mismatch = As palavras-passe não coincidem

## Installing

setup-finishing-failed-title = Não foi possível instalar o Luft
setup-finishing-failed-description = Ocorreu um problema durante a instalação.
setup-finishing-failed-stick = O computador continua a arrancar como antes. Pode continuar a utilizar o Luft a partir da pen USB, ou reiniciar e tentar novamente.
setup-finishing-failed-trying = O computador continua a arrancar como antes. Pode continuar a utilizar o Luft como está agora, ou reiniciar e tentar novamente.
setup-finishing-use-stick = Utilizar o Luft a partir da pen
setup-finishing-keep-trying = Continuar a experimentar o Luft
setup-finishing-installed-title = O Luft está instalado
setup-finishing-trust-stick = Retire a pen USB quando o ecrã ficar escuro. Depois, um ecrã azul pede para confiar no Luft. Utilize o teclado nesse ecrã.
setup-finishing-trust = Logo após o reinício, um ecrã azul pede para confiar no Luft. Utilize o teclado nesse ecrã.
setup-finishing-restart-stick = Reinicie para começar a utilizá-lo. Retire a pen USB quando o ecrã ficar escuro.
setup-finishing-restart = Reinicie para começar a utilizá-lo.
setup-finishing-title = Quase pronto
setup-finishing-description = O Luft está a ser copiado para o computador. Isto demora alguns minutos.
setup-finishing-plug-in = Mantenha o computador ligado à corrente até terminar.
setup-stage-idle = A preparar
setup-stage-preparing = A arranjar espaço para o Luft
setup-stage-copying = A copiar o Luft
setup-stage-waiting = A concluir
setup-stage-configuring = A configurar a sua conta
setup-stage-finished = Concluído

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Prima uma tecla nos 10 segundos seguintes
setup-enroll-choose-enroll = Escolha Enroll MOK e depois Continue
setup-enroll-choose-yes = Escolha Yes
setup-enroll-type-code = Escreva o código e depois escolha Reboot
setup-enroll-digits = { $count ->
    [one] { $count } algarismo
   *[other] { $count } algarismos
}
setup-secure-boot-title = O computador ainda não confia no Luft
setup-secure-boot-code = Logo após o próximo reinício, um ecrã azul pede para confiar no Luft. Utilize o teclado nesse ecrã com este código.
setup-secure-boot-skipped = O ecrã azul foi ignorado. Obtenha um novo código e reinicie; depois, utilize o teclado nesse ecrã.
setup-secure-boot-getting = A obter o código…
setup-secure-boot-new-code = Obter um novo código

## Encryption

setup-protect-title = Proteger os seus ficheiros
setup-protect-tpm = Encriptar este computador para que ninguém possa ler os seus ficheiros sem iniciar sessão, mesmo que o perca. O computador desbloqueia-se sozinho ao arrancar.
setup-protect-passphrase = Encriptar este computador para que ninguém possa ler os seus ficheiros sem a frase de acesso, mesmo que o perca.
setup-protect-keep-safe = Guarde esta chave de recuperação num lugar seguro, longe deste computador. Vai precisar dela se o computador não conseguir desbloquear-se sozinho.
setup-protect-passphrase-label = Frase de acesso
setup-protect-repeat = Escreva-a novamente
setup-protect-mismatch = Não coincidem
setup-protect-kept = Guardei a minha chave de recuperação
setup-protect-skip = Não encriptar
setup-protect-encrypt = Encriptar

## Fingerprint

setup-fingerprint-title = Iniciar sessão com o dedo
setup-fingerprint-description = Desbloqueie o Luft com um toque em vez de escrever a palavra-passe. Pode adicionar mais dedos mais tarde nas Definições.
setup-fingerprint-which = Que dedo?
setup-fingerprint-another = Adicionar outro dedo?
setup-fingerprint-finger = Dedo
setup-fingerprint-no-reader = O leitor de impressões digitais não está a responder. Pode adicionar uma impressão digital mais tarde nas Definições.
setup-fingerprint-add = Adicionar impressão digital
setup-fingerprint-choose-another = Escolher outro dedo

## Done

setup-ready-title = Está tudo pronto
setup-ready-trust = Reinicie mais uma vez para concluir. Logo após o reinício, um ecrã azul pede para confiar no Luft. Utilize o teclado nesse ecrã com este código.
setup-ready-done = O ambiente de trabalho está pronto. Divirta-se com o Luft.
setup-ready-start = Começar a utilizar o Luft
