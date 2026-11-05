## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = Processador Intel ou AMD de 64 bits
check-processor-x64-detail = O Luft funciona nele.
check-processor-arm = Processador Arm
check-processor-arm-detail = Por enquanto, o Luft só funciona em processadores Intel e AMD.
check-processor-32-bit-windows = Windows de 32 bits
check-processor-32-bit-system = Sistema de 32 bits
check-processor-32-bit-detail = O Luft precisa de um processador Intel ou AMD de 64 bits.
check-startup-uefi = Inicia com UEFI
check-startup-uefi-windows = O Luft inicia do mesmo jeito moderno.
check-startup-uefi-linux = O Luft adiciona a própria entrada de inicialização, e o { $system } continua iniciando como agora.
check-startup-bios = Inicia no modo BIOS legado
check-startup-bios-windows = O Luft precisa de UEFI. O Windows pode fazer a conversão com o MBR2GPT, e depois o UEFI pode ser ativado nas configurações do firmware.
check-startup-bios-linux = O Luft precisa de UEFI. Ative-o nas configurações do firmware, junto com o sistema que já está aqui, e verifique de novo.
check-startup-mbr = O disco usa uma tabela de partições antiga
check-startup-mbr-windows = O Luft precisa de um disco GPT. O Windows pode convertê-lo com o MBR2GPT sem perder arquivos.
check-startup-mbr-linux = O Luft precisa de um disco GPT para iniciar.
check-startup-no-esp = Nenhuma partição de sistema EFI
check-startup-no-esp-detail = O Luft coloca os arquivos de inicialização dele ao lado dos que já estão na partição de sistema EFI, e ela não existe.
check-startup-esp-full = A partição de sistema EFI está cheia
check-startup-esp-full-detail = O Luft precisa de { $size } MB lá para os arquivos de inicialização. Kernels ou entradas de inicialização antigos costumam ocupar esse espaço.
check-folder-fine = Nenhuma partição é alterada
check-folder-fine-detail = O Luft fica guardado como um arquivo no seu disco { $filesystem } e inicia a partir dele.
check-folder-encrypted = Seus arquivos estão em um disco criptografado
check-folder-encrypted-detail = O Luft ainda não consegue iniciar a partir de um disco criptografado. Use um pen drive para experimentá-lo.
check-folder-combined = Seus arquivos ocupam mais de uma partição
check-folder-combined-detail = O Luft ainda não consegue iniciar a partir de LVM ou RAID. Use um pen drive para experimentá-lo.
check-folder-filesystem = O Luft não consegue iniciar a partir de { $filesystem }
check-folder-filesystem-detail = Ele inicia a partir de discos ext4, btrfs e XFS. Use um pen drive para experimentá-lo.
check-space-free = { $size } GB livres
check-space-free-linux = O Luft ocupa cerca de { $size } GB enquanto você o experimenta.
check-space-up-to = Até { $size } GB para o Luft
check-space-up-to-detail = O Windows mantém os arquivos dele e espaço para crescer.
check-space-free-already = Já há { $size } GB livres, então o Windows cede menos.
check-space-other-drive = Há espaço para ele em { $drive }.
check-space-erase-drive = Há espaço para ele em { $drive }, depois que esse disco for apagado.
check-space-short = Espaço livre insuficiente
check-space-short-windows = O Luft precisa de cerca de { $needed } GB que o Windows possa ceder. Libere { $missing } GB no Windows, por exemplo com a Limpeza de Disco, e verifique de novo.
check-space-short-linux = O Luft precisa de cerca de { $needed } GB para iniciar. Libere { $missing } GB e verifique de novo.
check-system-replaceable = O Luft pode tomar o lugar dele e manter seus arquivos, sua conta e suas configurações.
check-system-single = Seus arquivos estão na mesma partição que o sistema, então ainda não é possível substituí-lo mantendo-os. Experimentar e instalar o Luft funcionam.
check-system-encrypted = Ele está criptografado, então ainda não é possível substituí-lo mantendo seus arquivos.
check-system-unknown = O disco dele está organizado de um jeito que o Luft ainda não consegue substituir mantendo seus arquivos.
check-encryption-off = O Windows não está criptografado
check-encryption-off-detail = O Instalar o Luft consegue ler as configurações dele e seus dispositivos Bluetooth.
check-encryption-on = O Windows está criptografado com o BitLocker
check-encryption-on-detail = Não tem problema. O próprio Windows abre o espaço, e o Meet Luft traz o que o Luft não consegue ler de um disco bloqueado. Deixe sua chave de recuperação por perto, por via das dúvidas.
check-encryption-changing = O BitLocker ainda está criptografando ou descriptografando
check-encryption-changing-detail = Espere o Windows terminar e volte depois. Você pode ver o andamento em Configurações, em Criptografia do dispositivo.
check-fast-startup-on = A Inicialização rápida está ativada
check-fast-startup-on-detail = O Windows hiberna em vez de desligar, o que mantém o disco dele bloqueado. O Meet Luft oferece desativá-la antes da instalação.
check-fast-startup-off = A Inicialização rápida está desativada
check-fast-startup-off-detail = O Windows desliga por completo.
check-secure-boot-on = O Secure Boot está ativado
check-secure-boot-on-detail = Ele pode continuar ativado. O Luft pede uma vez, em uma tela azul, para adicionar a chave dele.
check-secure-boot-off = O Secure Boot está desativado
check-secure-boot-off-detail = O Luft funciona sem ele, mas jogos com antitrapaça precisam dele. { $turningOn }
check-secure-boot-restart-into = O Meet Luft pode reiniciar nas configurações do firmware, onde ele fica em { $place }.
check-secure-boot-restart-into-anywhere = O Meet Luft pode reiniciar nas configurações do firmware, onde ele costuma ficar em Security ou Boot.
check-secure-boot-turn-on = Para ativá-lo, reinicie e pressione { $key } quando o logotipo da { $maker } aparecer e depois vá em { $place }.
check-secure-boot-turn-on-anywhere = Para ativá-lo, abra as configurações do firmware enquanto o computador inicia e procure em Security ou Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security e depois Secure Boot
check-firmware-place-boot-configuration = Boot Configuration e depois Secure Boot
check-firmware-place-security-or-advanced = Security ou Advanced e depois Secure Boot Configuration
check-firmware-place-security-or-boot = Security ou Boot e depois Secure Boot
check-firmware-place-boot = Boot e depois Secure Boot
check-firmware-place-settings = Settings, depois Security e depois Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 em um ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ou Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = o botão de aumentar o volume

## More of the computer's hardware

check-tpm-detail = Um Luft criptografado pode se desbloquear sozinho quando o computador inicia.
check-tpm-missing = Sem TPM 2.0
check-tpm-missing-detail = Se você criptografar o Luft, ele vai pedir uma frase secreta toda vez que iniciar.
check-graphics = Placa de vídeo
check-graphics-detail = Funciona sem configurar nada.
check-graphics-nvidia = O Luft é instalado com o driver da própria NVIDIA.
check-wifi-missing = Sem Wi-Fi
check-wifi-missing-detail = No Luft, use um cabo de rede ou fique sem rede.
check-wifi-detail = Funciona no Luft.
check-wifi-broadcom = Alguns chips Wi-Fi da Broadcom precisam de um driver que o Luft não inclui. Tenha por perto um cabo de rede ou um celular para ancoragem USB.
check-start-entries = { $count ->
    [one] Uma entrada de inicialização antiga
   *[other] { $count } entradas de inicialização antigas
}
check-start-entries-detail = { $count ->
    [one] { $names } aponta para um sistema que não está mais neste PC. A entrada pode ser removida.
   *[other] { $names } apontam para sistemas que não estão mais neste PC. As entradas podem ser removidas.
}
check-download-unavailable = Não é possível baixar o Luft agora
check-download-unavailable-detail = O Meet Luft baixa cerca de 3 GB. Confira se você está online e verifique de novo, ou use uma ISO do Luft que você já tem.

## Choosing a Luft ISO file

iso-dialog-title = Escolher uma ISO do Luft
iso-dialog-filter = ISO do Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Logs do Luft { $name }
logs-no-desktop = O Meet Luft não encontrou sua área de trabalho
logs-not-saved = O Meet Luft não conseguiu salvar os logs de quando você experimentou o Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = O auxiliar do Meet Luft não iniciou: { $error }
helper-not-allowed = O Meet Luft não recebeu permissão para alterar o disco
helper-stopped = O auxiliar do Meet Luft parou
helper-stopped-because = O auxiliar do Meet Luft parou: { $error }
helper-pipe-failed = O Meet Luft não conseguiu se comunicar com o auxiliar: { $error }
helper-pipe-hijacked = Algo que não é o auxiliar do Meet Luft abriu { $pipe }
helper-record-not-saved = O Meet Luft não conseguiu registrar o que criou: { $error }
helper-no-room-yet = Abra espaço para o Luft primeiro.
helper-not-ready-linux = Prepare o Luft primeiro.
helper-not-ready-to-start-windows = O Luft ainda não está pronto para iniciar. Abra espaço para ele primeiro.
helper-not-ready-to-start-linux = O Luft ainda não está pronto para iniciar. Prepare-o primeiro.
helper-update-unfinished = A atualização do Luft não terminou. Atualize-o de novo primeiro.
helper-room-too-small = O Luft precisa de mais espaço que isso.
helper-room-shortfall = O Windows pode ceder { $available } GB, e o Luft precisa de { $needed } GB.
helper-gap-shortfall = Esse espaço tem { $available } GB, e o Luft precisa de { $needed } GB.
helper-place-gone = Esse espaço não está mais livre. Verifique de novo para ver onde o Luft cabe.
helper-box-shortfall = O Windows pode ceder mais { $available } GB, e os itens escolhidos precisam de { $needed } GB.
helper-box-room-shortfall = O espaço do Luft pode ceder { $available } GB, e os itens escolhidos precisam de { $needed } GB.
helper-bluetooth-unreadable = Não foi possível abrir as configurações de Bluetooth do Windows
helper-registry-not-opened = Não foi possível abrir { $key }: { $error }
helper-registry-not-changed = Não foi possível alterar { $value }: { $error }
helper-registry-not-saved = Não foi possível salvar { $file }: { $error }
helper-restart-failed = O computador não reiniciou
helper-windows-restart-failed = O Windows não reiniciou: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Este PC não inicia com UEFI
firmware-variable-unreadable = Não foi possível ler { $name } do firmware: { $error }
firmware-variable-not-saved = Não foi possível salvar { $name } no firmware: { $error }
firmware-entries-full = O firmware não tem espaço para outra entrada de inicialização
firmware-entry-kept = O Windows manteve a entrada de inicialização { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Não foi possível listar os discos: { $error }
drive-of-path-unknown = Não foi possível saber qual disco contém { $path }
drive-windows-folder-missing = A pasta do Windows não foi encontrada
drive-windows-drive-missing = O disco do Windows não foi encontrado
drive-windows-drive-missing-because = O disco do Windows não foi encontrado: { $error }
drive-windows-partition-missing = A partição do Windows não foi encontrada
drive-volume-missing = O volume { $path } não foi encontrado
drive-storage-error = { $what } (erro de armazenamento do Windows { $code })
drive-shrink-size-unknown = O Windows não conseguiu saber o quanto a partição dele pode diminuir
drive-resize-failed = O Windows não conseguiu alterar o tamanho da partição dele
drive-create-failed = O Windows não conseguiu criar uma partição para o Luft
drive-hide-failed = O Windows não conseguiu esconder a nova partição do Explorador de Arquivos
drive-format-failed = O Windows não conseguiu formatar a nova partição
drive-remove-failed = O Windows não conseguiu remover uma das partições do Luft
drive-new-partition-missing = A nova partição não foi encontrada
drive-new-partition-no-volume = A nova partição não tem volume
drive-start-no-guid = A partição de inicialização não tem GUID
drive-live-no-guid = A partição do Luft não tem GUID
drive-box-no-guid = A caixa de mudança não tem GUID
drive-guid-unreadable = Não é possível ler o GUID da partição
drive-not-gpt = A tabela de partições do disco não é GPT
drive-start-no-volume = A partição de inicialização não tem volume
drive-live-no-volume = A partição do Luft não tem volume
drive-new-live-no-volume = A nova partição do Luft não tem volume
drive-partitions-not-noted = As partições do Luft não estão nos registros do Meet Luft
drive-partitions-gone = As partições do Luft sumiram
drive-partition-gone = Uma partição sumiu
drive-gone = Um disco sumiu
drive-erase-failed = O Windows não conseguiu apagar o disco
drive-erased-no-room = O disco apagado não tem espaço para o Luft
drive-start-partition-foreign = A partição de inicialização do Luft não foi criada pelo Meet Luft
drive-start-partition-gone = A partição de inicialização do Luft não existe mais
drive-start-partition-not-listed = A partição de inicialização do Luft não está na tabela de partições
drive-no-esp = Este computador não tem partição de sistema EFI
drive-esp-full = A partição de sistema EFI está cheia demais para os arquivos de inicialização do Luft.
drive-esp-not-opened = Não foi possível abrir a partição de sistema EFI
drive-esp-file-unreadable = Não é possível ler { $file } da partição de sistema EFI
drive-esp-no-drive = A partição de sistema EFI não tem disco
drive-esp-no-guid = A partição de sistema EFI não tem GUID
drive-no-uuid = O disco onde o Luft fica não tem UUID
drive-folder-unreadable = O Luft não consegue iniciar a partir do disco onde estão seus arquivos.
drive-folder-not-startable = Não é possível iniciar a partir de { $folder }

## Errors while changing Luft once it's installed

luft-gone = O Luft não está mais neste PC
luft-not-resizable = Não é possível alterar o tamanho do Luft pelo Windows agora
luft-size-not-allowed = O Luft não pode ter esse tamanho
luft-space-promised = Esse espaço está reservado para o Luft. Cancele a alteração primeiro.
luft-no-start-entry = A entrada de inicialização do Luft não foi encontrada

## Errors while getting Luft

live-no-home-folder = Não há uma pasta pessoal para guardar o Luft
live-no-app-data-folder = Não há uma pasta de dados locais de apps para guardar o Luft
live-pointer-unreadable = Não é possível ler qual é o Luft mais recente
live-not-published = O Luft não está publicado lá
live-checksum-unreadable = Não é possível ler o arquivo de checksum
live-checksum-not-read = Não foi possível ler o checksum do Luft: { $error }
live-download-damaged = O download foi danificado no caminho. Tente novamente.
live-download-incomplete = Falta { $file } no Luft baixado
live-download-not-resumable = O servidor não consegue continuar o download
live-not-signed = { $iso } não tem assinatura
live-signature-unreadable = Não é possível ler a assinatura de { $iso }
live-signature-wrong-key = A assinatura de { $iso } não é da Lantharos
live-signature-other-iso = A assinatura é de { $signed }, não de { $iso }
live-iso-out-of-order = Os arquivos da ISO não estão em uma ordem que o Meet Luft consiga ler
live-iso-not-iso = Isto não é uma imagem ISO
live-iso-no-root = A ISO não tem pasta raiz
live-iso-no-joliet = A ISO não tem nomes Joliet
live-not-removed = Não foi possível remover { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = O pen drive não está mais conectado. Conecte-o de novo e escolha-o outra vez.
stick-too-small = O Luft não cabe neste pen drive. Use um de 4 GB ou mais.
stick-damaged = A ISO não corresponde ao checksum. Ela pode ter sido danificada no caminho.
stick-read-back-differs = A leitura do pen drive não bateu com o que foi gravado nele. Ele pode estar desgastado, então tente outro.
stick-download-unavailable = Não é possível baixar o Luft agora: { $error }
stick-download-failed = Não foi possível baixar o Luft: { $error }
stick-checksum-unreadable = Não é possível ler o checksum da ISO: { $error }
stick-file-unreadable = Não é possível ler { $path }: { $error }
stick-iso-unreadable = Não é possível ler a ISO: { $error }
stick-iso-no-name = A ISO não tem nome
stick-iso-ended-early = A ISO terminou antes do esperado
stick-iso-already-there = { $name } já está no pen drive.
stick-no-room = Não há espaço para o Luft no pen drive. Libere { $size } MB nele primeiro.
stick-older-not-removed = Não foi possível remover o Luft mais antigo: { $error }
stick-copy-stopped = A cópia do Luft para o pen drive parou: { $error }
stick-not-opened = Não foi possível abrir o pen drive: { $error }
stick-write-stopped = A gravação no pen drive parou: { $error }
stick-not-synced = O pen drive não salvou tudo: { $error }
stick-read-back-failed = Não foi possível reler o pen drive: { $error }
stick-in-use = O pen drive ainda está em uso: { $error }
stick-device-in-use = { $device } ainda está em uso: { $error }
stick-volume-not-opened = Não foi possível abrir o volume do pen drive: { $error }
stick-volume-in-use = O pen drive ainda está em uso. Feche o que estiver com arquivos abertos nele e tente novamente ({ $error })
stick-not-dismounted = O Windows não conseguiu liberar o pen drive: { $error }
stick-not-cleared = O Windows não conseguiu limpar o pen drive: { $error }
stick-not-refreshed = O Windows não conseguiu verificar o pen drive de novo: { $error }
stick-not-ventoy = Este pen drive não usa mais o Ventoy.
stick-ventoy-not-opened = Não foi possível abrir a partição do Ventoy: { $error }
stick-ventoy-not-opened-windows = O Windows não consegue abrir a partição do Ventoy
stick-udisks-missing = O Meet Luft precisa do UDisks para usar o pen drive: { $error }
