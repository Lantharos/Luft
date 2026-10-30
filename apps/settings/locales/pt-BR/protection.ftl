## Shared buttons

settings-protection-cancel = Cancelar
settings-protection-continue = Continuar
settings-protection-close = Fechar
settings-protection-restart = Reiniciar
settings-protection-remove = Remover
settings-protection-turn-on = Ativar
settings-protection-set-up = Configurar

## Privacy: screen lock

settings-privacy-screen-lock = Bloqueio de tela
settings-privacy-screen-off = A tela se desliga
settings-privacy-screen-off-hint = Definido em Energia e bateria
settings-privacy-screen-off-after = Após { $duration }
settings-privacy-screen-off-never = Nunca
settings-privacy-lock-when-off = Bloquear a tela quando ela se desligar
settings-privacy-lock-after = Bloquear após
settings-privacy-lock-after-hint = Quanto tempo esperar depois que a tela se desliga
settings-privacy-lock-immediately = Imediatamente

## Privacy: location, camera and microphone

settings-privacy-location-services = Serviços de localização
settings-privacy-location-services-hint = Permite que os apps saibam onde você está, para mapas, clima e fusos horários
settings-privacy-camera-allow = Permitir que os apps usem a câmera
settings-privacy-microphone-allow = Permitir que os apps usem o microfone

## Privacy: file history

settings-privacy-file-history = Histórico de arquivos
settings-privacy-remember-files = Lembrar arquivos usados recentemente
settings-privacy-remember-files-hint = Os apps podem mostrar os últimos arquivos que você abriu
settings-privacy-keep-history = Manter o histórico por
settings-privacy-keep-forever = Para sempre
settings-privacy-clear-history = Limpar histórico
settings-privacy-clear-history-hint = Esquecer agora todos os arquivos da lista
settings-privacy-clear = Limpar
settings-privacy-clear-title = Limpar o histórico de arquivos?
settings-privacy-clear-description = Os apps não vão mais mostrar os arquivos que você abriu recentemente. Os arquivos continuam onde estão.

## Privacy: trash and temporary files

settings-privacy-cleanup = Lixeira e arquivos temporários
settings-privacy-empty-trash = Esvaziar a Lixeira automaticamente
settings-privacy-delete-temp = Excluir arquivos temporários automaticamente
settings-privacy-delete-temp-hint = Seus arquivos em pastas temporárias que nada usou nos últimos tempos
settings-privacy-delete-after = Excluir após
settings-privacy-delete-after-hint = Quanto tempo os arquivos ficam antes de serem removidos

## Security: summary at the top of the page

settings-security-protected = Seu dispositivo está protegido
settings-security-could-be-safer = Seu dispositivo poderia estar mais seguro
settings-security-not-encrypted-description = O disco não está criptografado, então qualquer pessoa que o retirar pode ler seus arquivos.
settings-security-starts-differently-description = Se você alterou as configurações de Secure Boot, confirme para que o disco volte a se desbloquear sozinho.
settings-security-needed-recovery-key = O disco precisou da chave de recuperação
settings-security-needed-recovery-key-description = Vincule o chip de segurança de novo para que ele se desbloqueie sozinho.
settings-security-firmware-ready-description = Há atualizações de firmware para o seu hardware prontas em Atualizações.
settings-security-encrypted-secure-boot = O disco está criptografado e o Secure Boot verifica como ele inicia.
settings-security-encrypted = O disco está criptografado.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Só software confiável pode iniciar este computador
settings-security-chip = Chip de segurança
settings-security-chip-description = Guarda as chaves com segurança e verifica como este computador iniciou
settings-firmware-updates-ready = Há atualizações de firmware prontas
settings-firmware-updates-count = { $count ->
    [one] { $count } atualização para o seu hardware em Atualizações
   *[other] { $count } atualizações para o seu hardware em Atualizações
}

## Security: signed startup

settings-security-signed-startup = Inicialização assinada
settings-security-signed-startup-on = O menu de inicialização e o sistema estão assinados para este computador
settings-security-signed-startup-purpose = Só permite iniciar software assinado para este computador
settings-security-signed-startup-restart = Passa a valer depois que você reiniciar
settings-security-signed-startup-missed = A chave não foi adicionada na última reinicialização
settings-security-signed-startup-pending = Adicione a chave na tela azul ao reiniciar
settings-security-signed-startup-missed-often = A chave não foi adicionada depois de algumas reinicializações
settings-security-show-steps = Mostrar etapas
settings-security-try-again = Tentar novamente

## Security: games with anti-cheat

settings-security-anti-cheat = Jogos com antitrapaça
settings-security-anti-cheat-ready = Pronto para jogos com antitrapaça
settings-security-anti-cheat-removing = Remova as outras chaves na tela azul ao reiniciar
settings-security-anti-cheat-luft-key = A Epic ainda precisa adicionar a chave do Luft à lista dela
settings-security-anti-cheat-ready-description = Os jogos podem verificar como este computador iniciou

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Remova as chaves ao reiniciar
settings-security-key-steps-add = Adicione a chave ao reiniciar
settings-security-key-steps-remove-description = Depois que você reiniciar, uma tela azul vai perguntar sobre a remoção de chaves. Ela só espera 10 segundos, então pressione qualquer tecla assim que ela aparecer.
settings-security-key-steps-add-description = Depois que você reiniciar, uma tela azul vai perguntar sobre uma nova chave. Ela só espera 10 segundos, então pressione qualquer tecla assim que ela aparecer.
settings-security-key-step-choose = Escolha { $option } e depois { $next }.
settings-security-key-step-confirm = Escolha { $option }.
settings-security-key-step-code = Digite o código abaixo e pressione { $key }.
settings-security-key-step-reboot = Escolha { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Código { $code }
settings-security-key-steps-remove-missed = Se você perder o momento, o computador inicia normalmente e você pode tentar de novo aqui.
settings-security-key-steps-add-missed = Se você perder o momento, o computador inicia normalmente e as etapas aparecem de novo na próxima reinicialização, com um novo código.
settings-security-later = Mais tarde
settings-security-restart-now = Reiniciar agora

## Security: hardware security level

settings-security-hardware = Segurança do hardware
settings-security-hardware-level-0 = O hardware tem poucas das proteções que poderia ter
settings-security-hardware-level-1 = O hardware tem as proteções básicas
settings-security-hardware-level-2 = O hardware tem as proteções importantes
settings-security-hardware-level-3 = O hardware está bem protegido
settings-security-hardware-level-4 = O hardware se protege enquanto funciona
settings-security-hardware-level-5 = O hardware se protege e consegue comprovar isso
settings-security-hardware-description = { $summary }, nível { $level } de { $highest }.
settings-security-hardware-next = Para o próximo nível
settings-security-hardware-highest = Este é o nível mais alto que existe.
settings-security-hardware-inactive = Inativas no momento
settings-security-hardware-fix-maker = { $count ->
    [one] Só o fabricante do computador pode adicionar isto, geralmente com uma atualização de firmware:
   *[other] Só o fabricante do computador pode adicionar estas, geralmente com uma atualização de firmware:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Isto pode ser ativado nas configurações de firmware do computador:
   *[other] Estas podem ser ativadas nas configurações de firmware do computador:
}
settings-security-hardware-fix-system = { $count ->
    [one] Isto depende de como o sistema está configurado:
   *[other] Estas dependem de como o sistema está configurado:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Isto não está disponível neste computador:
   *[other] Estas não estão disponíveis neste computador:
}

## Security: USB protection

settings-usb-hold-back = Reter novos dispositivos USB
settings-usb-hold-back-description = Os conectados com a tela bloqueada esperam até você desbloquear

## Device encryption

settings-encryption = Criptografia do dispositivo
settings-encryption-not-encrypted = Desativada
settings-encryption-not-encrypted-reinstall = Desativada, e este computador só pode ser criptografado instalando o Luft de novo
# Button that opens the steps to encrypt this computer
settings-encryption-turn-on = Ativar
settings-encryption-after-restart = Começa a criptografar quando você reiniciar
settings-encryption-encrypting = Criptografando, { $percent } concluído
settings-encryption-encrypting-paused = Criptografando, pausado em { $percent } até o computador ser conectado à tomada
# Button that takes back the request to encrypt before the computer restarts
settings-encryption-dont-encrypt = Não criptografar
settings-encryption-turn-on-title = Criptografar este computador
settings-encryption-turn-on-blocked = Este computador não pode ser criptografado agora
settings-encryption-turn-on-description = Seus arquivos continuam onde estão.
settings-encryption-check-in-place = O Luft pode criptografar a própria partição no lugar onde ela está.
settings-encryption-check-not-in-place = A partição do Luft não pode ser criptografada onde está. Instale o Luft de novo para criptografá-la.
settings-encryption-check-plugged-in = O computador está conectado à tomada.
settings-encryption-check-on-battery = Conecte o computador à tomada. A criptografia leva um tempo e não deve ficar sem energia no meio.
settings-encryption-save-key-title = Salve a chave de recuperação
settings-encryption-save-key-description = Guarde-a em outro lugar que não seja este computador.
settings-encryption-unlock-title = Como o disco é desbloqueado
settings-encryption-unlock-chip = O chip de segurança desbloqueia o disco sozinho quando o computador inicia, desde que nada mude a forma como ele inicia.
settings-encryption-unlock-passphrase = Escolha uma frase secreta para digitar toda vez que o computador iniciar.
settings-encryption-ready-title = Pronto para criptografar
settings-encryption-summary-room = O Luft abre espaço na própria partição agora e começa a criptografar quando você reiniciar.
settings-encryption-summary-background = Depois, criptografa em segundo plano enquanto você usa o computador. Mantenha-o conectado à tomada. Uma interrupção apenas pausa o processo.
settings-encryption-summary-chip = Até terminar, o chip de segurança guarda a chave de recuperação, então reiniciar não pede nada.
settings-encryption-summary-recovery-key = Até terminar, pede a chave de recuperação na inicialização em vez da sua frase secreta.
# Button, verb: starts encrypting this computer
settings-encryption-encrypt = Criptografar
settings-encryption-making-room = Abrindo espaço…
settings-encryption-unlocks-chip-pin = Desbloqueia com o chip de segurança e o seu PIN
settings-encryption-unlocks-chip = Desbloqueia sozinho com o chip de segurança
settings-encryption-unlocks-passphrase = Pede a frase secreta na inicialização
settings-encryption-unlocks-security-key = Desbloqueia com a chave de segurança na inicialização
settings-encryption-unlocks-recovery-key = Pede a chave de recuperação na inicialização

## Device encryption: other drives

settings-encryption-drives = Outras unidades
settings-encryption-drives-hint = Criptografe outras unidades e pen drives em Discos
settings-encryption-drives-open = Abrir Discos
settings-encryption-drive-encrypting = Criptografando uma unidade, { $percent } concluído
settings-encryption-drive-encrypting-paused = Criptografando uma unidade, pausado em { $percent }
settings-encryption-drive-decrypting = Descriptografando uma unidade, { $percent } concluído
settings-encryption-drive-decrypting-paused = Descriptografando uma unidade, pausado em { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } unidade criptografada é desbloqueada com este computador
   *[other] { $count } unidades criptografadas são desbloqueadas com este computador
}

## Device encryption: unlocking the disk

settings-encryption-unlocking = Desbloqueio do disco
settings-encryption-starts-differently = Este computador agora inicia de outro jeito
settings-encryption-starts-differently-description = As configurações de Secure Boot mudaram, então o disco pediu a chave de recuperação. Se foi você que fez a mudança, confirme para que ele volte a se desbloquear sozinho
settings-encryption-confirm = Confirmar
settings-encryption-asked-recovery-key = O disco pediu a chave de recuperação
settings-encryption-relink-description = Vincule o chip de segurança de novo para que ele se desbloqueie sozinho
settings-encryption-relink = Vincular de novo
settings-encryption-chip-unlock = Desbloquear com o chip de segurança
settings-encryption-chip-unlock-on = Desde que nada mude a forma como este computador inicia
settings-encryption-chip-unlock-off = Para não precisar digitar uma frase secreta na inicialização
settings-encryption-pin = PIN na inicialização
settings-encryption-pin-description = Você o digita antes de o disco ser desbloqueado
settings-encryption-change = Alterar
settings-encryption-add-pin-row = Adicionar um PIN na inicialização
settings-encryption-add-pin-row-description = Mantém o disco bloqueado mesmo se alguém levar o computador
settings-encryption-add-pin = Adicionar PIN
settings-encryption-new-key-description = O disco ainda não tinha uma chave de recuperação. Guarde esta em outro lugar que não seja este computador.
settings-encryption-stop-chip-title = Parar de desbloquear com o chip de segurança?
settings-encryption-stop-chip-passphrase = O computador vai pedir a frase secreta toda vez que iniciar.
settings-encryption-stop-chip-recovery-key = O computador vai pedir a chave de recuperação toda vez que iniciar, então mantenha-a por perto.
settings-encryption-stop-chip = Parar de desbloquear
settings-encryption-remove-pin-title = Remover o PIN?
settings-encryption-remove-pin-description = O disco vai voltar a se desbloquear sozinho quando o computador iniciar.
settings-encryption-remove-pin = Remover PIN
settings-encryption-unlock-disk-title = Desbloquear o disco
settings-encryption-unlock-disk-description = Esta alteração precisa da chave de recuperação ou da frase secreta que você digita quando o computador inicia.
settings-encryption-unlock-disk-field = Chave de recuperação ou frase secreta

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Pedir também um PIN
settings-encryption-chip-setup-description = O chip de segurança do computador desbloqueia o disco sozinho na inicialização, então você não precisa mais digitar uma frase secreta antes.
settings-encryption-add-pin-title = Adicionar um PIN
settings-encryption-add-pin-description = Você vai digitá-lo toda vez que o computador iniciar. Sem ele, o disco continua bloqueado, mesmo se alguém levar o computador inteiro.
settings-encryption-change-pin-title = Alterar o PIN
settings-encryption-change-pin-description = Você vai digitar o novo PIN toda vez que o computador iniciar.
settings-encryption-change-pin = Alterar PIN
settings-encryption-relink-title = Vincular o chip de segurança de novo
settings-encryption-relink-pin-description = Digite o PIN que você quer usar na inicialização.
settings-encryption-ask-pin-step = Adiciona uma etapa na inicialização.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = Novo PIN
settings-encryption-pin-length = De { $min } a { $max } dígitos
settings-encryption-pin-digits-only = Use só dígitos
settings-encryption-pin-too-short = { $min ->
    [one] Use pelo menos { $min } dígito
   *[other] Use pelo menos { $min } dígitos
}
settings-encryption-pin-too-long = { $max ->
    [one] Use no máximo { $max } dígito
   *[other] Use no máximo { $max } dígitos
}
settings-encryption-pins-differ = Os PINs não coincidem
settings-encryption-confirm-field = Confirmar
settings-encryption-type-again = Digite de novo

## Recovery key

settings-recovery-title = Chave de recuperação
settings-recovery-description = Permite entrar se o disco não conseguir se desbloquear sozinho
settings-recovery-show = Mostrar
settings-recovery-replace = Substituir
settings-recovery-replace-title = Substituir a chave de recuperação?
settings-recovery-replace-description = A chave atual deixa de funcionar e você recebe uma nova para salvar.
settings-recovery-replace-key = Substituir chave
settings-recovery-shown-title = Sua chave de recuperação
settings-recovery-shown-description = Digite-a se o computador pedir uma chave de recuperação na inicialização. Guarde uma cópia em outro lugar que não seja este computador.
settings-recovery-fresh-title = Salve a nova chave de recuperação
settings-recovery-fresh-description = A chave anterior não funciona mais. Guarde esta no papel ou em um gerenciador de senhas.

## Passwords and keys (the keyring)

settings-passwords-title = Senhas e chaves
settings-passwords-not-running = O Chaveiro não está em execução
settings-passwords-not-running-description = Suas senhas e chaves aparecem aqui assim que ele iniciar
settings-passwords-locked = Bloqueado
settings-passwords-contents = { $count ->
    [0] Nada salvo ainda
    [one] { $count } senha ou chave
   *[other] { $count } senhas e chaves
}
settings-passwords-protected-chip = Protegido pela sua senha e pelo chip de segurança
settings-passwords-protected = Protegido pela sua senha
settings-passwords-unlock = Desbloquear
settings-passwords-lock = Bloquear
settings-passwords-seal-title = Selar com o chip de segurança
settings-passwords-seal-description = Cópias delas não podem ser abertas em outro computador
settings-passwords-seal = Selar
settings-passwords-fingerprint-on = Desbloqueia com a sua impressão digital
settings-passwords-fingerprint-on-description = Entrar com ela também desbloqueia suas senhas
settings-passwords-fingerprint = Desbloquear com a impressão digital
settings-passwords-fingerprint-description = Adicione primeiro uma impressão digital em Usuários
settings-passwords-pin = Pedir um PIN depois da impressão digital
settings-passwords-pin-locked = Desbloqueie o Chaveiro para alterar isto
settings-passwords-pin-description = Assim, só a impressão digital não basta para desbloqueá-las
settings-passwords-lock-with-screen = Bloquear junto com a tela
settings-passwords-lock-with-screen-description = Elas são bloqueadas e desbloqueadas junto com a tela
settings-passwords-apps = Logins e atividade de apps
settings-passwords-apps-locked = Desbloqueie o Chaveiro para vê-los
settings-passwords-apps-description = O que os apps guardam aqui e quando usaram
settings-passwords-apps-allowed = Quais apps podem usar suas senhas
settings-passwords-apps-allowed-hint = Definido em Apps

## Passwords and keys: apps with access

settings-passwords-stores = Logins de apps
settings-passwords-stores-description = Logins que alguns apps guardam aqui, onde só o próprio app pode lê-los.
settings-passwords-stores-count = { $count ->
    [one] { $count } login salvo
   *[other] { $count } logins salvos
}
settings-passwords-forget = Esquecer
settings-passwords-forget-title = Esquecer o que { $app } salvou?
settings-passwords-forget-description = { $app } perde os logins que guardou aqui, então talvez você precise entrar nele de novo.

## Passwords and keys: recent access

settings-passwords-history = Acessos recentes
settings-passwords-history-read = { $app } usou “{ $item }”
settings-passwords-history-read-unnamed = { $app } usou uma senha salva
settings-passwords-history-saved = { $app } salvou “{ $item }”
settings-passwords-history-saved-unnamed = { $app } salvou uma senha
settings-passwords-history-deleted = { $app } excluiu “{ $item }”
settings-passwords-history-deleted-unnamed = { $app } excluiu uma senha salva
settings-passwords-history-denied = { $app } não teve permissão para usar “{ $item }”
settings-passwords-history-denied-unnamed = { $app } não teve permissão para usar uma senha salva
settings-passwords-history-signed = { $app } assinou com “{ $item }”
settings-passwords-history-signed-unnamed = { $app } assinou com uma senha salva
settings-passwords-history-fewer = Mostrar menos
settings-passwords-history-all = { $count ->
    [one] Mostrar { $count }
   *[other] Mostrar todos os { $count }
}
settings-passwords-history-clear = Limpar histórico
settings-passwords-history-clear-description = Esquecer quais apps usaram o Chaveiro e quando
settings-passwords-history-clear-button = Limpar
settings-passwords-history-clear-title = Limpar os acessos recentes?
settings-passwords-history-clear-confirm = A lista de quais apps usaram o Chaveiro e quando será apagada. Suas senhas e chaves salvas continuam como estão.

## Passwords and keys: SSH keys

settings-passwords-ssh = Chaves SSH
settings-passwords-ssh-description = Chaves para entrar em servidores, guardadas com segurança no Chaveiro.
settings-passwords-ssh-unnamed = Chave sem nome
settings-passwords-ssh-in-chip = Guardada no chip de segurança
settings-passwords-ssh-added = Adicionada { $when }
settings-passwords-ssh-copy = Copiar a chave pública de { $name }
settings-passwords-ssh-remove = Remover { $name }
settings-passwords-ssh-confirm = Perguntar antes de cada uso
settings-passwords-ssh-confirm-label = Perguntar antes de cada uso de { $name }
settings-passwords-ssh-add-row = Adicionar uma chave
settings-passwords-ssh-use = Usar estas chaves com SSH
settings-passwords-ssh-use-description = Copie a linha que direciona o SSH para elas
settings-passwords-ssh-copy-line = Copiar { $line }
settings-passwords-ssh-remove-title = Remover “{ $name }”?
settings-passwords-ssh-remove-chip = Ela só existe no chip de segurança deste computador, então será perdida para sempre. Servidores que só aceitam esta chave não vão mais deixar você entrar com ela.
settings-passwords-ssh-remove-description = Servidores que só aceitam esta chave não vão mais deixar você entrar com ela. Não é possível desfazer.
settings-passwords-ssh-add-title = Adicionar uma chave SSH
settings-passwords-ssh-add-description = Uma nova chave é criada neste computador. Copie a chave pública dela para os servidores em que você quer entrar.
settings-passwords-ssh-name = Nome
settings-passwords-ssh-name-placeholder = Por exemplo, notebook do trabalho
settings-passwords-ssh-chip = Guardar no chip de segurança
settings-passwords-ssh-chip-description = Ela nunca poderá ser copiada deste computador, nem mesmo por você
settings-passwords-ssh-chip-unsupported = O chip de segurança deste computador não comporta chaves SSH
settings-passwords-ssh-add = Adicionar chave

## Passkeys

settings-passkeys-title = Chaves de acesso
settings-passkeys-unavailable = Desbloqueie o Chaveiro para ver suas chaves de acesso.
settings-passkeys-chip-fingerprint = Seladas pelo chip de segurança deste computador. Cada login pede sua impressão digital ou senha.
settings-passkeys-chip-password = Seladas pelo chip de segurança deste computador. Cada login pede sua senha.
settings-passkeys-password-fingerprint = Criptografadas com sua senha. Cada login pede sua impressão digital ou senha.
settings-passkeys-password = Criptografadas com sua senha. Cada login pede sua senha.
settings-passkeys-last-used = Usada pela última vez { $when }
settings-passkeys-never-used = Nunca usada
settings-passkeys-password-only = Protegida pela sua senha
settings-passkeys-unreachable = Os navegadores não conseguem acessar suas chaves de acesso
settings-passkeys-unreachable-description = Elas voltam assim que o serviço de chaves de acesso estiver em execução
settings-passkeys-rename-label = Renomear a chave de acesso de { $site }
settings-passkeys-remove-label = Remover a chave de acesso de { $site }
settings-passkeys-empty = Nenhuma chave de acesso ainda
settings-passkeys-empty-description = As que os sites criarem ficam salvas aqui para todos os navegadores
settings-passkeys-remove-title = Remover esta chave de acesso?
settings-passkeys-remove-description = Você não vai mais conseguir entrar em { $site } com ela, então confira se tem outra forma de acesso.
settings-passkeys-rename-title = Renomear chave de acesso
settings-passkeys-rename-description = Dê à chave de acesso de { $site } um nome que você reconheça.
settings-passkeys-name = Nome
settings-passkeys-save = Salvar

## Apps

settings-apps-defaults = Apps padrão
settings-apps-defaults-description = Usados ao abrir links, arquivos e pastas
settings-apps-browser = Navegador
settings-apps-email = E-mail
settings-apps-calendar = Calendário
settings-apps-music = Música
settings-apps-videos = Vídeos
settings-apps-photos = Fotos
settings-apps-text-editor = Editor de texto
settings-apps-files = Arquivos
settings-apps-archives = Arquivos compactados
settings-apps-choose = Escolher
settings-apps-startup = Inicialização
settings-apps-startup-description = Estes apps abrem quando você entra
settings-apps-startup-app = Abrir { $app } quando você entrar
settings-apps-startup-add = Adicionar app
settings-apps-startup-add-title = Adicionar um app de inicialização
settings-apps-startup-add-description = Escolha um app para abrir sempre que você entrar.
settings-apps-search = Pesquisar apps
settings-apps-no-match = Nenhum app corresponde à pesquisa
settings-apps-cancel = Cancelar

## Apps: permissions

settings-apps-permissions = Permissões
settings-apps-location = Localização
settings-apps-camera = Câmera
settings-apps-clipboard = Área de transferência em segundo plano
settings-apps-full-access = Acesso total
settings-apps-full-access-hint = Ele roda fora do ambiente isolado e pode fazer tudo o que um programa que você mesmo abre pode. A remoção vale a partir da próxima vez que abrir.
settings-apps-full-access-remove = Remover
settings-apps-full-access-remove-app = Remover o acesso total do { $app }
settings-apps-passwords = Senhas salvas
settings-apps-passwords-forget = Esquecer
settings-apps-passwords-forget-app = Fazer o { $app } perguntar de novo
settings-apps-permissions-allowed = { $allowed } de { $total } permitidos
settings-apps-permissions-description = Apps em um ambiente isolado recebem seus próprios arquivos e só o que você permitir aqui.
settings-apps-sandbox-only = Nada além do ambiente isolado
settings-apps-folders = Pastas
settings-apps-folders-hint = A partir da próxima vez que abrir, ele pode ler e alterar tudo nestas pastas.
settings-apps-folders-count = { $count ->
    [one] { $count } pasta
   *[other] { $count } pastas
}
settings-apps-folder-add = Adicionar pasta
settings-apps-folder-remove = Remover
settings-apps-folder-remove-app = Parar de compartilhar { $folder }
settings-apps-usb = Dispositivos USB
settings-apps-usb-hint = Como chaves de segurança, celulares e microcontroladores
settings-apps-serial = Dispositivos seriais
settings-apps-serial-hint = Como impressoras 3D e placas conectadas por USB
settings-apps-folder-read-only = Somente leitura
settings-apps-internet = Internet
settings-apps-internet-hint = Pode se conectar à internet a partir da próxima vez que abrir.
settings-apps-service-hint = Um serviço da área de trabalho com o qual pode se comunicar
settings-apps-service-remove = Remover
settings-apps-service-remove-app = Não deixar mais se comunicar com { $service }
settings-apps-services-count = { $count ->
    [one] { $count } serviço
   *[other] { $count } serviços
}
settings-apps-full-access-off = Ele roda em um ambiente isolado. O acesso total tira o isolamento.
settings-apps-full-access-give = Dar acesso total
