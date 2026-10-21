## Shared buttons

settings-protection-cancel = Cancelar
settings-protection-continue = Continuar
settings-protection-close = Fechar
settings-protection-restart = Reiniciar
settings-protection-remove = Remover
settings-protection-turn-on = Ativar
settings-protection-set-up = Configurar

## Privacy: screen lock

settings-privacy-screen-lock = Bloqueio do ecrã
settings-privacy-screen-off = O ecrã desliga-se
settings-privacy-screen-off-hint = Definido em Energia e bateria
settings-privacy-screen-off-after = Após { $duration }
settings-privacy-screen-off-never = Nunca
settings-privacy-lock-when-off = Bloquear o ecrã quando se desliga
settings-privacy-lock-after = Bloquear após
settings-privacy-lock-after-hint = Quanto tempo esperar depois de o ecrã se desligar
settings-privacy-lock-immediately = Imediatamente

## Privacy: location, camera and microphone

settings-privacy-location = Localização
settings-privacy-location-services = Serviços de localização
settings-privacy-location-services-hint = Permite que as aplicações saibam onde está, para mapas, meteorologia e fusos horários
settings-privacy-camera = Câmara
settings-privacy-camera-allow = Permitir que as aplicações utilizem a câmara
settings-privacy-microphone-allow = Permitir que as aplicações utilizem o microfone
settings-privacy-apps-asked = Aplicações que pediram acesso
settings-privacy-apps-allowed = { $allowed } de { $total } permitidas

## Privacy: file history

settings-privacy-file-history = Histórico de ficheiros
settings-privacy-remember-files = Lembrar ficheiros utilizados recentemente
settings-privacy-remember-files-hint = As aplicações podem mostrar os últimos ficheiros abertos
settings-privacy-keep-history = Manter o histórico durante
settings-privacy-keep-forever = Para sempre
settings-privacy-clear-history = Limpar histórico
settings-privacy-clear-history-hint = Esquecer já todos os ficheiros da lista
settings-privacy-clear = Limpar
settings-privacy-clear-title = Limpar o histórico de ficheiros?
settings-privacy-clear-description = As aplicações deixam de mostrar os ficheiros abertos recentemente. Os ficheiros ficam onde estão.

## Privacy: trash and temporary files

settings-privacy-cleanup = Lixo e ficheiros temporários
settings-privacy-empty-trash = Esvaziar o Lixo automaticamente
settings-privacy-delete-temp = Eliminar ficheiros temporários automaticamente
settings-privacy-delete-temp-hint = Ficheiros seus em pastas temporárias que nada utilizou ultimamente
settings-privacy-delete-after = Eliminar após
settings-privacy-delete-after-hint = Quanto tempo os ficheiros ficam antes de serem removidos

## Security: summary at the top of the page

settings-security-protected = O dispositivo está protegido
settings-security-encrypting = A encriptar o dispositivo
settings-security-encrypting-progress = { $progress }. Pode continuar a trabalhar enquanto termina.
settings-security-decrypting = A desativar a encriptação do dispositivo
settings-security-restart-to-encrypt = Reinicie para começar a encriptar
settings-security-restart-to-encrypt-description = A encriptação começa da próxima vez que este computador reiniciar.
settings-security-encryption-failed = A encriptação não começou
settings-security-encryption-failed-description = O Luft arrancou sem ela e os ficheiros não foram alterados. Ative-a outra vez para tentar novamente.
settings-security-encryption-refused-description = O Luft terminou de mudar de tamanho, mas a encriptação não conseguiu começar depois. Os ficheiros não foram alterados. Ative-a outra vez para tentar novamente.
settings-security-waiting-to-encrypt = A encriptação está à espera
settings-security-waiting-to-encrypt-description = O Luft ainda está a mudar de tamanho. Quando terminar, a encriptação começa no próximo reinício.
settings-security-could-be-safer = O dispositivo podia estar mais seguro
settings-security-could-be-safer-description = Ative a encriptação do dispositivo para manter os ficheiros privados.
settings-security-starts-differently-description = Se alterou as definições de Secure Boot, confirme-o para que o disco volte a desbloquear-se sozinho.
settings-security-needed-recovery-key = O disco precisou da chave de recuperação
settings-security-needed-recovery-key-description = Volte a associar o chip de segurança para que o disco se desbloqueie sozinho.
settings-security-firmware-ready-description = Há atualizações de firmware para o hardware prontas em Atualizações.
settings-security-encrypted-secure-boot = O disco está encriptado e o Secure Boot verifica como arranca.
settings-security-encrypted = O disco está encriptado.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Só software de confiança pode arrancar este computador
settings-security-chip = Chip de segurança
settings-security-chip-description = Guarda as chaves em segurança e verifica como este computador arrancou
settings-firmware-updates-ready = Há atualizações de firmware prontas
settings-firmware-updates-count = { $count ->
    [one] { $count } atualização para o hardware em Atualizações
   *[other] { $count } atualizações para o hardware em Atualizações
}

## Security: signed startup

settings-security-signed-startup = Arranque assinado
settings-security-signed-startup-on = O menu de arranque e o sistema estão assinados para este computador
settings-security-signed-startup-purpose = Só deixa arrancar software assinado para este computador
settings-security-signed-startup-restart = Passa a ser utilizado depois de reiniciar
settings-security-signed-startup-missed = A chave não foi adicionada no último reinício
settings-security-signed-startup-pending = Adicione a chave no ecrã azul quando reiniciar
settings-security-signed-startup-missed-often = A chave não foi adicionada após vários reinícios
settings-security-show-steps = Mostrar passos
settings-security-try-again = Tentar novamente

## Security: games with anti-cheat

settings-security-anti-cheat = Jogos com anti-batota
settings-security-anti-cheat-ready = Pronto para jogos com anti-batota
settings-security-anti-cheat-removing = Remova as outras chaves no ecrã azul quando reiniciar
settings-security-anti-cheat-luft-key = A Epic ainda tem de adicionar a chave do Luft à sua lista
settings-security-anti-cheat-ready-description = Os jogos podem verificar como este computador arrancou

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Remover as chaves ao reiniciar
settings-security-key-steps-add = Adicionar a chave ao reiniciar
settings-security-key-steps-remove-description = Depois de reiniciar, um ecrã azul pergunta se quer remover chaves. Só espera 10 segundos, por isso prima qualquer tecla assim que aparecer.
settings-security-key-steps-add-description = Depois de reiniciar, um ecrã azul pergunta por uma chave nova. Só espera 10 segundos, por isso prima qualquer tecla assim que aparecer.
settings-security-key-step-choose = Escolha { $option } e depois { $next }.
settings-security-key-step-confirm = Escolha { $option }.
settings-security-key-step-code = Escreva o código abaixo e prima { $key }.
settings-security-key-step-reboot = Escolha { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Código { $code }
settings-security-key-steps-remove-missed = Se não chegar a tempo, o computador arranca normalmente e pode tentar novamente aqui.
settings-security-key-steps-add-missed = Se não chegar a tempo, o computador arranca normalmente e os passos voltam a aparecer no próximo reinício, com um código novo.
settings-security-later = Mais tarde
settings-security-restart-now = Reiniciar agora

## Security: hardware security level

settings-security-hardware = Segurança do hardware
settings-security-hardware-level-0 = O hardware tem poucas das proteções que podia ter
settings-security-hardware-level-1 = O hardware tem as proteções básicas
settings-security-hardware-level-2 = O hardware tem as proteções importantes
settings-security-hardware-level-3 = O hardware está bem protegido
settings-security-hardware-level-4 = O hardware protege-se a si próprio enquanto funciona
settings-security-hardware-level-5 = O hardware protege-se a si próprio e consegue prová-lo
settings-security-hardware-description = { $summary }, nível { $level } de { $highest }.
settings-security-hardware-next = Para o nível seguinte
settings-security-hardware-highest = Este é o nível mais alto que existe.
settings-security-hardware-inactive = Inativas de momento
settings-security-hardware-fix-maker = { $count ->
    [one] Só o fabricante do computador pode adicionar esta proteção, normalmente com uma atualização de firmware:
   *[other] Só o fabricante do computador pode adicionar estas proteções, normalmente com uma atualização de firmware:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Esta proteção pode ser ativada nas definições de firmware do computador:
   *[other] Estas proteções podem ser ativadas nas definições de firmware do computador:
}
settings-security-hardware-fix-system = { $count ->
    [one] Esta proteção depende da forma como o sistema está configurado:
   *[other] Estas proteções dependem da forma como o sistema está configurado:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Esta proteção não está disponível neste computador:
   *[other] Estas proteções não estão disponíveis neste computador:
}

## Security: USB protection

settings-usb-hold-back = Reter novos dispositivos USB
settings-usb-hold-back-description = Os que forem ligados com a sessão bloqueada esperam até desbloquear

## Device encryption

settings-encryption = Encriptação do dispositivo
settings-encryption-encrypting = A encriptar este dispositivo
settings-encryption-decrypting = A desativar a encriptação do dispositivo
settings-encryption-starting = Começa da próxima vez que reiniciar
settings-encryption-failed = Não começou no último reinício; os ficheiros não foram alterados
settings-encryption-waiting = Espera que o Luft termine de mudar de tamanho e começa no próximo reinício
settings-encryption-refused = Não conseguiu começar depois de o Luft mudar de tamanho; os ficheiros não foram alterados
settings-encryption-off = Mantém os ficheiros privados se perder este computador
settings-encryption-progress = { $percent } concluído
settings-encryption-progress-seconds = { $percent } concluído, falta menos de um minuto
settings-encryption-progress-minutes = { $minutes ->
    [one] { $percent } concluído, falta cerca de { $minutes } minuto
   *[other] { $percent } concluído, faltam cerca de { $minutes } minutos
}
settings-encryption-progress-hours = { $hours ->
    [one] { $percent } concluído, falta cerca de { $hours } hora
   *[other] { $percent } concluído, faltam cerca de { $hours } horas
}
settings-encryption-unlocks-chip-pin = Desbloqueia com o chip de segurança e o PIN
settings-encryption-unlocks-chip = Desbloqueia sozinho com o chip de segurança
settings-encryption-unlocks-passphrase = Pede a frase de acesso no arranque
settings-encryption-unlocks-security-key = Desbloqueia com a chave de segurança no arranque
settings-encryption-unlocks-recovery-key = Pede a chave de recuperação no arranque

## Device encryption: other drives

settings-encryption-drives = Outras unidades
settings-encryption-drives-hint = Encripte outras unidades e pens USB nos Discos
settings-encryption-drives-open = Abrir os Discos
settings-encryption-drive-encrypting = A encriptar uma unidade, { $percent } concluído
settings-encryption-drive-encrypting-paused = A encriptar uma unidade, em pausa a { $percent }
settings-encryption-drive-decrypting = A desencriptar uma unidade, { $percent } concluído
settings-encryption-drive-decrypting-paused = A desencriptar uma unidade, em pausa a { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [0] Nenhuma unidade encriptada se desbloqueia com este computador
    [one] { $count } unidade encriptada desbloqueia-se com este computador
   *[other] { $count } unidades encriptadas desbloqueiam-se com este computador
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Ativar a encriptação do dispositivo
settings-encryption-turn-on-description = Os ficheiros ficam privados se este computador for perdido ou roubado. Sem a chave certa, ninguém consegue ler o disco.
settings-encryption-blocked-title = Ainda não é possível ativar a encriptação do dispositivo
settings-encryption-blocked-description = Resolva o que está assinalado abaixo e tente novamente.
settings-encryption-backup = Antes de começar, confirme que tem cópias de segurança dos ficheiros importantes.
settings-encryption-key-title = Guarde a chave de recuperação
settings-encryption-key-description = Se algum dia o disco não conseguir desbloquear-se sozinho, por exemplo depois de uma reparação, esta chave permite-lhe voltar a entrar. Guarde-a noutro sítio que não este computador.
settings-encryption-unlock-title = Desbloqueio no arranque
settings-encryption-unlock-description = O chip de segurança desbloqueia o disco sozinho no arranque, por isso o início de sessão continua igual.
settings-encryption-passphrase-title = Escolha uma frase de acesso
settings-encryption-passphrase-description = Este computador não consegue desbloquear o disco sozinho, por isso pede esta frase de acesso sempre que arranca.
settings-encryption-summary-title = Pronto para encriptar
settings-encryption-summary-description = Isto é o que acontece a seguir.
settings-encryption-step-restart = O computador reinicia uma vez.
settings-encryption-step-screen = Durante o arranque, aparece por instantes o ecrã «Encrypting your device».
settings-encryption-step-background = O resto acontece em segundo plano enquanto continua a trabalhar.
settings-encryption-step-plugged-in = Mantenha o computador ligado à corrente até terminar.
settings-encryption-ask-pin = Pedir também um PIN
settings-encryption-ask-pin-description = Mantém o disco bloqueado mesmo que alguém leve o computador. É pedido quando a encriptação terminar.
settings-encryption-starting-button = A iniciar…
settings-encryption-restart-and-encrypt = Reiniciar e encriptar

## Device encryption: turning it off

settings-encryption-turn-off-title = Desativar a encriptação do dispositivo?
settings-encryption-turn-off-description = Os ficheiros são desencriptados em segundo plano enquanto trabalha. Depois, qualquer pessoa que retire o disco consegue lê-lo.
settings-encryption-keep = Manter a encriptação
settings-encryption-turning-off = A desativar…
settings-encryption-turn-off = Desativar

## Device encryption: unlocking the disk

settings-encryption-unlocking = Desbloqueio do disco
settings-encryption-starts-differently = Este computador arranca agora de forma diferente
settings-encryption-starts-differently-description = As definições de Secure Boot mudaram, por isso o disco pediu a chave de recuperação. Se fez esta alteração, confirme-a para que volte a desbloquear-se sozinho
settings-encryption-confirm = Confirmar
settings-encryption-asked-recovery-key = O disco pediu a chave de recuperação
settings-encryption-relink-description = Volte a associar o chip de segurança para que o disco se desbloqueie sozinho
settings-encryption-relink = Voltar a associar
settings-encryption-chip-unlock = Desbloquear com o chip de segurança
settings-encryption-chip-unlock-on = Desde que nada altere a forma como este computador arranca
settings-encryption-chip-unlock-off = Para não ter de escrever uma frase de acesso no arranque
settings-encryption-pin = PIN no arranque
settings-encryption-pin-description = É introduzido antes de o disco se desbloquear
settings-encryption-change = Alterar
settings-encryption-add-pin-row = Adicionar um PIN no arranque
settings-encryption-add-pin-row-description = Mantém o disco bloqueado mesmo que alguém leve o computador
settings-encryption-add-pin = Adicionar PIN
settings-encryption-new-key-description = O disco ainda não tinha chave de recuperação. Guarde esta noutro sítio que não este computador.
settings-encryption-stop-chip-title = Deixar de desbloquear com o chip de segurança?
settings-encryption-stop-chip-passphrase = O computador vai pedir a frase de acesso sempre que arrancar.
settings-encryption-stop-chip-recovery-key = O computador vai pedir a chave de recuperação sempre que arrancar, por isso tenha-a por perto.
settings-encryption-stop-chip = Deixar de desbloquear
settings-encryption-remove-pin-title = Remover o PIN?
settings-encryption-remove-pin-description = O disco volta a desbloquear-se sozinho quando o computador arrancar.
settings-encryption-remove-pin = Remover PIN
settings-encryption-unlock-disk-title = Desbloquear o disco
settings-encryption-unlock-disk-description = Esta alteração precisa da chave de recuperação ou da frase de acesso que escreve quando o computador arranca.
settings-encryption-unlock-disk-field = Chave de recuperação ou frase de acesso

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = O chip de segurança do computador desbloqueia o disco sozinho no arranque, por isso deixa de ter de escrever primeiro uma frase de acesso.
settings-encryption-add-pin-title = Adicionar um PIN
settings-encryption-add-pin-description = Vai introduzi-lo sempre que o computador arrancar. Sem ele, o disco fica bloqueado, mesmo que alguém leve o computador inteiro.
settings-encryption-change-pin-title = Alterar o PIN
settings-encryption-change-pin-description = Vai introduzir o novo PIN sempre que o computador arrancar.
settings-encryption-change-pin = Alterar PIN
settings-encryption-relink-title = Voltar a associar o chip de segurança
settings-encryption-relink-pin-description = Introduza o PIN que quer utilizar no arranque.
settings-encryption-ask-pin-step = Acrescenta um passo no arranque.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = Novo PIN
settings-encryption-pin-length = { $min } a { $max } algarismos
settings-encryption-pin-digits-only = Utilize só algarismos
settings-encryption-pin-too-short = { $min ->
    [one] Utilize pelo menos { $min } algarismo
   *[other] Utilize pelo menos { $min } algarismos
}
settings-encryption-pin-too-long = { $max ->
    [one] Utilize no máximo { $max } algarismo
   *[other] Utilize no máximo { $max } algarismos
}
settings-encryption-pins-differ = Os PINs não coincidem
settings-encryption-confirm-field = Confirmar
settings-encryption-type-again = Escreva-o novamente

## Recovery key

settings-recovery-title = Chave de recuperação
settings-recovery-description = Permite entrar se o disco não conseguir desbloquear-se sozinho
settings-recovery-show = Mostrar
settings-recovery-replace = Substituir
settings-recovery-replace-title = Substituir a chave de recuperação?
settings-recovery-replace-description = A chave atual deixa de funcionar e recebe uma nova para guardar.
settings-recovery-replace-key = Substituir chave
settings-recovery-shown-title = Chave de recuperação
settings-recovery-shown-description = Introduza-a se algum dia o computador pedir uma chave de recuperação no arranque. Guarde uma cópia noutro sítio que não este computador.
settings-recovery-fresh-title = Guarde a nova chave de recuperação
settings-recovery-fresh-description = A chave anterior já não funciona. Guarde esta em papel ou num gestor de palavras-passe.

## Passwords and keys (the keyring)

settings-passwords-title = Palavras-passe e chaves
settings-passwords-not-running = O porta-chaves não está em execução
settings-passwords-not-running-description = As palavras-passe e as chaves aparecem aqui quando ele arrancar
settings-passwords-locked = Bloqueado
settings-passwords-contents = { $count ->
    [0] Ainda nada guardado
    [one] { $count } palavra-passe ou chave
   *[other] { $count } palavras-passe e chaves
}
settings-passwords-protected-chip = Protegido pela palavra-passe e pelo chip de segurança
settings-passwords-protected = Protegido pela palavra-passe
settings-passwords-unlock = Desbloquear
settings-passwords-lock = Bloquear
settings-passwords-seal-title = Selar com o chip de segurança
settings-passwords-seal-description = As cópias não podem ser abertas noutro computador
settings-passwords-seal = Selar
settings-passwords-fingerprint-on = Desbloqueia com a impressão digital
settings-passwords-fingerprint-on-description = Iniciar sessão com ela também desbloqueia as palavras-passe
settings-passwords-fingerprint = Desbloquear com a impressão digital
settings-passwords-fingerprint-description = Adicione primeiro uma impressão digital em Utilizadores
settings-passwords-pin = Pedir um PIN depois da impressão digital
settings-passwords-pin-locked = Desbloqueie o porta-chaves para alterar isto
settings-passwords-pin-description = Para que a impressão digital sozinha não as desbloqueie
settings-passwords-lock-with-screen = Bloquear com o ecrã
settings-passwords-lock-with-screen-description = Bloqueiam-se e desbloqueiam-se juntamente com o ecrã
settings-passwords-apps = Aplicações com acesso
settings-passwords-apps-locked = Desbloqueie o porta-chaves para as ver
settings-passwords-apps-asked = { $count ->
    [0] Ainda nenhuma aplicação as pediu
    [one] { $count } aplicação pediu-as
   *[other] { $count } aplicações pediram-nas
}

## Passwords and keys: apps with access

settings-passwords-access-description = Ao remover uma, a aplicação volta a pedir acesso da próxima vez.
settings-passwords-access-not-allowed = Não permitido
settings-passwords-access-none = Ainda nenhuma aplicação pediu as palavras-passe
settings-passwords-access-revoke = Impedir { $app } de utilizar { $item }
settings-passwords-access-reset = Deixar { $app } voltar a pedir { $item }
settings-passwords-stores = Credenciais das aplicações
settings-passwords-stores-description = Credenciais que algumas aplicações guardam aqui, onde só essa aplicação as pode ler.
settings-passwords-stores-count = { $count ->
    [0] Nenhuma credencial guardada
    [one] { $count } credencial guardada
   *[other] { $count } credenciais guardadas
}
settings-passwords-forget = Esquecer
settings-passwords-forget-title = Esquecer o que { $app } guardou?
settings-passwords-forget-description = { $app } perde as credenciais que guardou aqui, por isso pode ter de voltar a iniciar sessão.

## Passwords and keys: recent access

settings-passwords-history = Acessos recentes
settings-passwords-history-read = { $app } utilizou «{ $item }»
settings-passwords-history-read-unnamed = { $app } utilizou uma palavra-passe guardada
settings-passwords-history-saved = { $app } guardou «{ $item }»
settings-passwords-history-saved-unnamed = { $app } guardou uma palavra-passe
settings-passwords-history-deleted = { $app } eliminou «{ $item }»
settings-passwords-history-deleted-unnamed = { $app } eliminou uma palavra-passe guardada
settings-passwords-history-denied = { $app } não teve permissão para utilizar «{ $item }»
settings-passwords-history-denied-unnamed = { $app } não teve permissão para utilizar uma palavra-passe guardada
settings-passwords-history-signed = { $app } assinou com «{ $item }»
settings-passwords-history-signed-unnamed = { $app } assinou com uma palavra-passe guardada
settings-passwords-history-fewer = Mostrar menos
settings-passwords-history-all = { $count ->
    [one] Mostrar tudo ({ $count })
   *[other] Mostrar tudo ({ $count })
}
settings-passwords-history-clear = Limpar histórico
settings-passwords-history-clear-description = Esquecer que aplicações utilizaram o porta-chaves e quando
settings-passwords-history-clear-button = Limpar
settings-passwords-history-clear-title = Limpar os acessos recentes?
settings-passwords-history-clear-confirm = A lista das aplicações que utilizaram o porta-chaves, e de quando o fizeram, é apagada. As palavras-passe e as chaves guardadas ficam como estão.

## Passwords and keys: SSH keys

settings-passwords-ssh = Chaves SSH
settings-passwords-ssh-description = Chaves para iniciar sessão em servidores, guardadas em segurança no porta-chaves.
settings-passwords-ssh-unnamed = Chave sem nome
settings-passwords-ssh-in-chip = Guardada no chip de segurança
settings-passwords-ssh-added = Adicionada { $when }
settings-passwords-ssh-copy = Copiar a chave pública de { $name }
settings-passwords-ssh-remove = Remover { $name }
settings-passwords-ssh-confirm = Perguntar antes de cada utilização
settings-passwords-ssh-confirm-label = Perguntar antes de cada utilização de { $name }
settings-passwords-ssh-add-row = Adicionar uma chave
settings-passwords-ssh-use = Utilizar estas chaves com SSH
settings-passwords-ssh-use-description = Copie a linha que indica ao SSH onde estão
settings-passwords-ssh-copy-line = Copiar { $line }
settings-passwords-ssh-remove-title = Remover «{ $name }»?
settings-passwords-ssh-remove-chip = Só existe no chip de segurança deste computador, por isso desaparece para sempre. Os servidores que só aceitam esta chave deixam de o deixar entrar com ela.
settings-passwords-ssh-remove-description = Os servidores que só aceitam esta chave deixam de o deixar entrar com ela. Esta ação não pode ser anulada.
settings-passwords-ssh-add-title = Adicionar uma chave SSH
settings-passwords-ssh-add-description = É criada uma chave nova neste computador. Copie a chave pública para os servidores em que quer iniciar sessão.
settings-passwords-ssh-name = Nome
settings-passwords-ssh-name-placeholder = Por exemplo, portátil do trabalho
settings-passwords-ssh-chip = Guardar no chip de segurança
settings-passwords-ssh-chip-description = Nunca pode ser copiada para fora deste computador, nem sequer pelo utilizador
settings-passwords-ssh-chip-unsupported = O chip de segurança deste computador não consegue guardar chaves SSH
settings-passwords-ssh-add = Adicionar chave

## Passkeys

settings-passkeys-title = Chaves de acesso
settings-passkeys-unavailable = Desbloqueie o porta-chaves para ver as chaves de acesso.
settings-passkeys-chip-fingerprint = Seladas pelo chip de segurança deste computador. Cada início de sessão pede a impressão digital ou a palavra-passe.
settings-passkeys-chip-password = Seladas pelo chip de segurança deste computador. Cada início de sessão pede a palavra-passe.
settings-passkeys-password-fingerprint = Encriptadas com a palavra-passe. Cada início de sessão pede a impressão digital ou a palavra-passe.
settings-passkeys-password = Encriptadas com a palavra-passe. Cada início de sessão pede a palavra-passe.
settings-passkeys-last-used = Utilizada pela última vez { $when }
settings-passkeys-never-used = Nunca utilizada
settings-passkeys-password-only = Protegida pela palavra-passe
settings-passkeys-unreachable = Os browsers não conseguem aceder às chaves de acesso
settings-passkeys-unreachable-description = Voltam a estar disponíveis quando o serviço de chaves de acesso estiver em execução
settings-passkeys-rename-label = Mudar o nome da chave de acesso de { $site }
settings-passkeys-remove-label = Remover a chave de acesso de { $site }
settings-passkeys-empty = Ainda não há chaves de acesso
settings-passkeys-empty-description = As que os sites criarem são guardadas aqui para todos os browsers
settings-passkeys-remove-title = Remover esta chave de acesso?
settings-passkeys-remove-description = Deixa de poder iniciar sessão em { $site } com ela, por isso confirme que tem outra forma de entrar.
settings-passkeys-rename-title = Mudar o nome da chave de acesso
settings-passkeys-rename-description = Dê à chave de acesso de { $site } um nome que reconheça.
settings-passkeys-name = Nome
settings-passkeys-save = Guardar

## Apps

settings-apps-defaults = Aplicações predefinidas
settings-apps-defaults-description = Utilizadas para abrir ligações, ficheiros e pastas
settings-apps-browser = Browser
settings-apps-email = Correio eletrónico
settings-apps-calendar = Calendário
settings-apps-music = Música
settings-apps-videos = Vídeos
settings-apps-photos = Fotografias
settings-apps-text-editor = Editor de texto
settings-apps-files = Ficheiros
settings-apps-choose = Escolher
settings-apps-startup = Arranque
settings-apps-startup-description = Estas aplicações abrem quando inicia sessão
settings-apps-startup-app = Abrir { $app } ao iniciar sessão
settings-apps-startup-add = Adicionar aplicação
settings-apps-startup-add-title = Adicionar uma aplicação de arranque
settings-apps-startup-add-description = Escolha uma aplicação para abrir sempre que iniciar sessão.
settings-apps-search = Pesquisar aplicações
settings-apps-no-match = Nenhuma aplicação corresponde à pesquisa
settings-apps-cancel = Cancelar
