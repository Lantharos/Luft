## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = Processador Intel ou AMD de 64 bits
check-processor-x64-detail = O Luft funciona com ele.
check-processor-arm = Processador Arm
check-processor-arm-detail = Por agora, o Luft só funciona em processadores Intel e AMD.
check-processor-32-bit-windows = Windows de 32 bits
check-processor-32-bit-system = Sistema de 32 bits
check-processor-32-bit-detail = O Luft precisa de um processador Intel ou AMD de 64 bits.
check-startup-uefi = Arranca com UEFI
check-startup-uefi-windows = O Luft arranca da mesma forma moderna.
check-startup-uefi-linux = O Luft adiciona a sua própria entrada de arranque, e { $system } continua a arrancar como agora.
check-startup-bios = Arranca no modo BIOS antigo
check-startup-bios-windows = O Luft precisa de UEFI. O Windows pode mudar com o MBR2GPT e depois é possível ativar o UEFI nas definições do firmware.
check-startup-bios-linux = O Luft precisa de UEFI. Ative-o nas definições do firmware, juntamente com o sistema que já cá está, e verifique novamente.
check-startup-mbr = O disco utiliza uma tabela de partições antiga
check-startup-mbr-windows = O Luft precisa de um disco GPT. O Windows pode convertê-lo com o MBR2GPT sem perder ficheiros.
check-startup-mbr-linux = O Luft precisa de um disco GPT para arrancar.
check-startup-no-esp = Sem partição de sistema EFI
check-startup-no-esp-detail = O Luft coloca os seus ficheiros de arranque junto dos que já estão na partição de sistema EFI, e não existe nenhuma.
check-startup-esp-full = A partição de sistema EFI está cheia
check-startup-esp-full-detail = O Luft precisa de { $size } MB nela para os seus ficheiros de arranque. Normalmente, o espaço está ocupado por kernels ou entradas de arranque antigos.
check-folder-fine = Nenhuma partição é alterada
check-folder-fine-detail = O Luft fica guardado como um ficheiro no seu disco { $filesystem } e arranca a partir daí.
check-folder-encrypted = Os seus ficheiros estão num disco encriptado
check-folder-encrypted-detail = O Luft ainda não consegue arrancar a partir de um disco encriptado. Para o experimentar, utilize uma pen USB.
check-folder-combined = Os seus ficheiros ocupam mais do que uma partição
check-folder-combined-detail = O Luft ainda não consegue arrancar a partir de LVM ou RAID. Para o experimentar, utilize uma pen USB.
check-folder-filesystem = O Luft não consegue arrancar a partir de { $filesystem }
check-folder-filesystem-detail = Arranca a partir de discos ext4, btrfs e XFS. Para o experimentar, utilize uma pen USB.
check-space-free = { $size } GB livres
check-space-free-linux = O Luft ocupa cerca de { $size } GB enquanto o experimenta.
check-space-up-to = Até { $size } GB para o Luft
check-space-up-to-detail = O Windows mantém os ficheiros e espaço para crescer.
check-space-free-already = Já há { $size } GB livres, por isso o Windows cede menos.
check-space-other-drive = Há espaço para o Luft em { $drive }.
check-space-erase-drive = Há espaço para o Luft em { $drive }, depois de esse disco ser apagado.
check-space-short = Não há espaço livre suficiente
check-space-short-windows = O Luft precisa de cerca de { $needed } GB que o Windows possa dispensar. Liberte { $missing } GB no Windows, por exemplo com a Limpeza do Disco, e verifique novamente.
check-space-short-linux = O Luft precisa de cerca de { $needed } GB para arrancar. Liberte { $missing } GB e verifique novamente.
check-system-replaceable = O Luft pode ocupar o seu lugar e manter os seus ficheiros, a conta e as definições.
check-system-single = Os seus ficheiros estão na mesma partição que o sistema, por isso ainda não é possível substituí-lo mantendo-os. É possível experimentar e instalar o Luft.
check-system-encrypted = Está encriptado, por isso ainda não é possível substituí-lo mantendo os seus ficheiros.
check-system-unknown = O disco está organizado de uma forma que o Luft ainda não consegue substituir mantendo os seus ficheiros.
check-encryption-off = O Windows não está encriptado
check-encryption-off-detail = O Instalar o Luft consegue ler as definições e os seus dispositivos Bluetooth.
check-encryption-on = O Windows está encriptado com o BitLocker
check-encryption-on-detail = Não há problema. O próprio Windows arranja o espaço, e o Meet Luft traz o que o Luft não consegue ler num disco bloqueado. Tenha a chave de recuperação à mão, por precaução.
check-encryption-changing = O BitLocker ainda está a encriptar ou a desencriptar
check-encryption-changing-detail = Aguarde até o Windows terminar e depois volte. Pode ver o progresso nas Definições, em Encriptação de dispositivos.
check-fast-startup-on = O arranque rápido está ativo
check-fast-startup-on-detail = O Windows hiberna em vez de encerrar, o que mantém o disco bloqueado. O Meet Luft propõe desativá-lo antes da instalação.
check-fast-startup-off = O arranque rápido está desativado
check-fast-startup-off-detail = O Windows encerra por completo.
check-secure-boot-on = O Secure Boot está ativo
check-secure-boot-on-detail = Pode ficar ativo. O Luft pede uma vez, num ecrã azul, para adicionar a sua chave.
check-secure-boot-off = O Secure Boot está desativado
check-secure-boot-off-detail = O Luft funciona sem ele, embora os jogos com anti-batota precisem dele. { $turningOn }
check-secure-boot-restart-into = O Meet Luft pode reiniciar nas definições do firmware, onde se encontra em { $place }.
check-secure-boot-restart-into-anywhere = O Meet Luft pode reiniciar nas definições do firmware, onde normalmente se encontra em Security ou Boot.
check-secure-boot-turn-on = Para o ativar, reinicie e prima { $key } quando aparecer o logótipo { $maker }; depois, aceda a { $place }.
check-secure-boot-turn-on-anywhere = Para o ativar, abra as definições do firmware durante o arranque do computador e procure em Security ou Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security e depois Secure Boot
check-firmware-place-boot-configuration = Boot Configuration e depois Secure Boot
check-firmware-place-security-or-advanced = Security ou Advanced e depois Secure Boot Configuration
check-firmware-place-security-or-boot = Security ou Boot e depois Secure Boot
check-firmware-place-boot = Boot e depois Secure Boot
check-firmware-place-settings = Settings, Security e depois Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 num ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ou Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = o botão de aumentar o volume

## More of the computer's hardware

check-tpm-detail = Um Luft encriptado pode desbloquear-se sozinho quando o computador arranca.
check-tpm-missing = Sem TPM 2.0
check-tpm-missing-detail = Se encriptar o Luft, este pede uma frase de acesso sempre que arranca.
check-graphics = Placa gráfica
check-graphics-detail = Funciona de imediato.
check-graphics-nvidia = O Luft é instalado com o controlador da própria NVIDIA.
check-wifi-missing = Sem Wi-Fi
check-wifi-missing-detail = No Luft, utilize um cabo de rede ou fique sem rede.
check-wifi-detail = Funciona no Luft.
check-wifi-broadcom = Alguns chips Wi-Fi da Broadcom precisam de um controlador que o Luft não inclui. Tenha à mão um cabo de rede ou um telemóvel para partilhar a ligação por USB.
check-start-entries = { $count ->
    [one] Uma entrada de arranque antiga
   *[other] { $count } entradas de arranque antigas
}
check-start-entries-detail = { $count ->
    [one] { $names } aponta para um sistema que já não está neste PC. Pode ser removida.
   *[other] { $names } apontam para sistemas que já não estão neste PC. Podem ser removidas.
}
check-download-unavailable = Não é possível transferir o Luft neste momento
check-download-unavailable-detail = O Meet Luft transfere cerca de 3 GB. Verifique se está ligado à internet e verifique novamente, ou utilize uma ISO do Luft que já tenha.

## Choosing a Luft ISO file

iso-dialog-title = Escolher uma ISO do Luft
iso-dialog-filter = ISO do Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Registos do Luft { $name }
logs-no-desktop = O Meet Luft não encontrou o ambiente de trabalho
logs-not-saved = O Meet Luft não conseguiu guardar os registos da experiência com o Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = O processo auxiliar do Meet Luft não arrancou: { $error }
helper-not-allowed = O Meet Luft não recebeu permissão para trabalhar no disco
helper-stopped = O processo auxiliar do Meet Luft parou
helper-stopped-because = O processo auxiliar do Meet Luft parou: { $error }
helper-pipe-failed = O Meet Luft não conseguiu comunicar com o processo auxiliar: { $error }
helper-pipe-hijacked = Outro programa que não o processo auxiliar do Meet Luft abriu { $pipe }
helper-record-not-saved = O Meet Luft não conseguiu registar o que criou: { $error }
helper-no-room-yet = Arranje primeiro espaço para o Luft.
helper-not-ready-linux = Prepare primeiro o Luft.
helper-not-ready-to-start-windows = O Luft ainda não está pronto para arrancar. Arranje-lhe primeiro espaço.
helper-not-ready-to-start-linux = O Luft ainda não está pronto para arrancar. Prepare-o primeiro.
helper-update-unfinished = A atualização do Luft não terminou. Atualize-o novamente primeiro.
helper-room-too-small = O Luft precisa de mais espaço do que isso.
helper-room-shortfall = O Windows pode dispensar { $available } GB e o Luft precisa de { $needed } GB.
helper-gap-shortfall = Esse espaço tem { $available } GB e o Luft precisa de { $needed } GB.
helper-place-gone = Esse espaço já não está livre. Verifique novamente para ver onde cabe o Luft.
helper-box-shortfall = O Windows pode dispensar mais { $available } GB e estes itens precisam de { $needed } GB.
helper-box-room-shortfall = O espaço do Luft pode dispensar { $available } GB e estes itens precisam de { $needed } GB.
helper-bluetooth-unreadable = Não foi possível abrir as definições de Bluetooth do Windows
helper-registry-not-opened = Não foi possível abrir { $key }: { $error }
helper-registry-not-changed = Não foi possível alterar { $value }: { $error }
helper-registry-not-saved = Não foi possível guardar { $file }: { $error }
helper-restart-failed = O computador não reiniciou
helper-windows-restart-failed = O Windows não reiniciou: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Este PC não arranca com UEFI
firmware-variable-unreadable = Não foi possível ler { $name } do firmware: { $error }
firmware-variable-not-saved = Não foi possível guardar { $name } no firmware: { $error }
firmware-entries-full = O firmware não tem espaço para mais uma entrada de arranque
firmware-entry-kept = O Windows manteve a entrada de arranque { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Não foi possível listar os discos: { $error }
drive-of-path-unknown = Não foi possível saber que disco contém { $path }
drive-windows-folder-missing = A pasta do Windows não foi encontrada
drive-windows-drive-missing = O disco do Windows não foi encontrado
drive-windows-drive-missing-because = O disco do Windows não foi encontrado: { $error }
drive-windows-partition-missing = A partição do Windows não foi encontrada
drive-volume-missing = O volume { $path } não foi encontrado
drive-storage-error = { $what } (erro de armazenamento do Windows { $code })
drive-shrink-size-unknown = O Windows não conseguiu determinar até onde a partição pode ser reduzida
drive-resize-failed = O Windows não conseguiu alterar o tamanho da partição
drive-create-failed = O Windows não conseguiu criar uma partição para o Luft
drive-hide-failed = O Windows não conseguiu esconder a nova partição do Explorador de Ficheiros
drive-format-failed = O Windows não conseguiu formatar a nova partição
drive-remove-failed = O Windows não conseguiu remover uma das partições do Luft
drive-new-partition-missing = A nova partição não foi encontrada
drive-new-partition-no-volume = A nova partição não tem volume
drive-start-no-guid = A partição de arranque não tem GUID
drive-live-no-guid = A partição a partir da qual o Luft arranca não tem GUID
drive-box-no-guid = A caixa de mudança não tem GUID
drive-guid-unreadable = Não é possível ler o GUID da partição
drive-not-gpt = A tabela de partições do disco não é GPT
drive-start-no-volume = A partição de arranque não tem volume
drive-live-no-volume = A partição do Luft não tem volume
drive-new-live-no-volume = A nova partição do Luft não tem volume
drive-partitions-not-noted = As partições do Luft não constam dos registos do Meet Luft
drive-partitions-gone = As partições do Luft desapareceram
drive-partition-gone = Uma partição desapareceu
drive-gone = Um disco desapareceu
drive-erase-failed = O Windows não conseguiu apagar o disco
drive-erased-no-room = O disco apagado não tem espaço para o Luft
drive-start-partition-foreign = A partição de arranque do Luft não foi criada pelo Meet Luft
drive-start-partition-gone = A partição de arranque do Luft já não existe
drive-start-partition-not-listed = A partição de arranque do Luft não está na tabela de partições
drive-no-esp = Este computador não tem partição de sistema EFI
drive-esp-full = A partição de sistema EFI está demasiado cheia para os ficheiros de arranque do Luft.
drive-esp-not-opened = Não foi possível abrir a partição de sistema EFI
drive-esp-file-unreadable = Não é possível ler { $file } na partição de sistema EFI
drive-esp-no-drive = A partição de sistema EFI não tem disco
drive-esp-no-guid = A partição de sistema EFI não tem GUID
drive-no-uuid = O disco onde o Luft está guardado não tem UUID
drive-folder-unreadable = O Luft não consegue arrancar a partir do disco onde estão os seus ficheiros.
drive-folder-not-startable = Não é possível arrancar a partir de { $folder }

## Errors while changing Luft once it's installed

luft-gone = O Luft já não está neste PC
luft-not-resizable = Neste momento não é possível alterar o tamanho do Luft a partir do Windows
luft-size-not-allowed = O Luft não pode ter esse tamanho
luft-space-promised = Esse espaço está reservado para o Luft. Cancele primeiro a alteração.
luft-no-start-entry = A entrada de arranque do Luft não foi encontrada

## Errors while getting Luft

live-no-home-folder = Não há nenhuma pasta pessoal onde guardar o Luft
live-no-app-data-folder = Não há nenhuma pasta local de dados de aplicações onde guardar o Luft
live-pointer-unreadable = Não é possível ler qual é o Luft mais recente
live-not-published = O Luft não está publicado aí
live-checksum-unreadable = Não é possível ler o ficheiro da soma de verificação
live-checksum-not-read = Não foi possível ler a soma de verificação do Luft: { $error }
live-download-damaged = A transferência foi danificada pelo caminho. Tente novamente.
live-download-incomplete = Falta { $file } no Luft transferido
live-download-not-resumable = O servidor não consegue continuar a transferência
live-not-signed = { $iso } não está assinado
live-signature-unreadable = Não é possível ler a assinatura de { $iso }
live-signature-wrong-key = { $iso } não está assinado pela Lantharos
live-signature-other-iso = A assinatura é de { $signed }, não de { $iso }
live-iso-out-of-order = Os ficheiros da ISO não estão numa ordem que o Meet Luft consiga ler
live-iso-not-iso = Isto não é uma imagem ISO
live-iso-no-root = A ISO não tem pasta raiz
live-iso-no-joliet = A ISO não tem nomes Joliet
live-not-removed = Não foi possível remover { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = A pen já não está ligada. Volte a ligá-la e escolha-a novamente.
stick-too-small = O Luft não cabe nesta pen. Utilize uma com 4 GB ou mais.
stick-damaged = A ISO não corresponde à soma de verificação. Pode ter sido danificada pelo caminho.
stick-read-back-differs = O que foi lido da pen não corresponde ao que foi gravado. Pode estar gasta; experimente outra.
stick-download-unavailable = Não é possível transferir o Luft neste momento: { $error }
stick-download-failed = Não foi possível transferir o Luft: { $error }
stick-checksum-unreadable = Não é possível ler a soma de verificação da ISO: { $error }
stick-file-unreadable = Não é possível ler { $path }: { $error }
stick-iso-unreadable = Não é possível ler a ISO: { $error }
stick-iso-no-name = A ISO não tem nome
stick-iso-ended-early = A ISO terminou antes do tempo
stick-iso-already-there = { $name } já está na pen.
stick-no-room = Não há espaço para o Luft na pen. Liberte primeiro { $size } MB nela.
stick-older-not-removed = Não foi possível remover o Luft anterior: { $error }
stick-copy-stopped = A cópia do Luft para a pen parou: { $error }
stick-not-opened = Não foi possível abrir a pen: { $error }
stick-write-stopped = A gravação na pen parou: { $error }
stick-not-synced = A pen não guardou tudo: { $error }
stick-read-back-failed = Não foi possível voltar a ler a pen: { $error }
stick-in-use = A pen ainda está a ser utilizada: { $error }
stick-device-in-use = { $device } ainda está a ser utilizado: { $error }
stick-volume-not-opened = Não foi possível abrir o volume da pen: { $error }
stick-volume-in-use = A pen ainda está a ser utilizada. Feche o que tiver ficheiros abertos nela e tente novamente ({ $error })
stick-not-dismounted = O Windows não conseguiu libertar a pen: { $error }
stick-not-cleared = O Windows não conseguiu limpar a pen: { $error }
stick-not-refreshed = O Windows não conseguiu voltar a analisar a pen: { $error }
stick-not-ventoy = Esta pen já não utiliza o Ventoy.
stick-ventoy-not-opened = Não foi possível abrir a partição do Ventoy: { $error }
stick-ventoy-not-opened-windows = O Windows não consegue abrir a partição do Ventoy
stick-udisks-missing = O Meet Luft precisa do UDisks para utilizar a pen: { $error }
