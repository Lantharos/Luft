## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Voltar
meet-cancel = Cancelar
meet-continue = Continuar
meet-try-again = Tentar novamente
meet-restart = Reiniciar
meet-remove = Remover
meet-keep-it = Manter
meet-close = Fechar
meet-restart-title = Reiniciar agora?
meet-not-yet = Ainda não
meet-iso-use = Usar uma ISO que já tenho
meet-iso-using = Usando sua ISO do Luft
meet-nightly = Versões nightly
meet-channel-nightly = O Meet Luft vai usar versões nightly
meet-channel-latest = O Meet Luft vai voltar a usar as versões estáveis
meet-undo = Desfazer
meet-logs-saved = Os logs de quando você experimentou o Luft foram salvos na área de trabalho
meet-logs-show = Mostrar
meet-logs-none = Ainda não há logs de quando você experimentou o Luft
meet-logs-failed = O Meet Luft não conseguiu salvar os logs de quando você experimentou o Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] O Meet Luft não conseguiu terminar de verificar este computador.
   *[windows] O Meet Luft não conseguiu terminar de verificar este PC.
}
problem-room = Não foi possível terminar de abrir espaço para o Luft.
problem-room-linux = Não foi possível terminar de preparar o Luft.
problem-update = Não foi possível terminar de atualizar o Luft.
problem-download = O download do Luft parou. Confira se você está online.
problem-pack = Não foi possível terminar de empacotar suas coisas.
problem-remove = Não foi possível terminar de remover o Luft.
problem-restart = O Meet Luft não conseguiu preparar a reinicialização.
problem-tidy = Não foi possível remover as entradas de inicialização antigas.
problem-firmware = O Meet Luft não conseguiu abrir as configurações do firmware.
problem-folders = O Meet Luft não conseguiu verificar suas pastas.
problem-sticks = O Meet Luft não conseguiu procurar unidades USB.
problem-stick = Não foi possível terminar de criar o pen drive.
problem-offer = Não é possível baixar o Luft agora. Confira se você está online ou use uma ISO que você já tem.
problem-luft = O Meet Luft não conseguiu analisar o disco do Luft.
problem-resize = Não foi possível terminar de alterar o tamanho do Luft.
problem-cancel = O Meet Luft não conseguiu cancelar a alteração.
problem-give = O Windows não conseguiu recuperar o espaço.
problem-declined = { $platform ->
    [linux] O Meet Luft precisa da sua permissão para fazer alterações no disco. Digite sua senha quando for pedida.
   *[windows] O Meet Luft precisa da sua permissão para fazer alterações no disco. Escolha Sim quando o Windows perguntar.
}

## First screen

hello-intro = { $platform ->
    [linux] Experimente o Luft daqui mesmo, sem pen drive. Se gostar, o Luft pode tomar o lugar deste sistema e manter seus arquivos.
   *[windows] O Luft pode ficar ao lado do Windows. Experimente primeiro sem instalar nada e traga suas coisas quando estiver pronto.
}
hello-check = { $platform ->
    [linux] Verificar este computador
   *[windows] Verificar este PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Verificando este computador
   *[windows] Verificando este PC
}
check-ready-title = { $platform ->
    [linux] Este computador está pronto para o Luft
   *[windows] Este PC está pronto para o Luft
}
check-blocked-title = Quase lá
check-moment = Isso leva um momento.
check-slow = O Windows está calculando quanto espaço pode ceder. Em um disco grande, isso pode levar alguns minutos.
check-blocked-description = Algumas coisas precisam mudar antes de o Luft chegar. Veja o que fazer.
check-found-description = Veja o que o Meet Luft encontrou.
check-checking = Verificando o disco, o firmware e o hardware…
check-again = Verificar de novo
check-action-firmware = Abrir configurações do firmware
check-action-tidy = Limpar
check-firmware-title = Reiniciar nas configurações do firmware?
check-firmware-description = Salve primeiro o que estiver fazendo. Ative o Secure Boot lá e salve, e o computador inicia de novo normalmente.
check-tidy-title = Remover as entradas de inicialização antigas?
check-tidy-description = Elas só apontam para sistemas que já não existem. O Windows e todo o resto iniciam como antes.
check-get-ready-title = Preparar o Luft?
check-get-ready-file = O Meet Luft copia o Luft da sua ISO para uma pasta neste computador e adiciona uma entrada de inicialização para ele. Nenhuma partição é alterada.
check-get-ready-download = O Meet Luft baixa o Luft, cerca de { $size }, para uma pasta neste computador e adiciona uma entrada de inicialização para ele. Nenhuma partição é alterada.
check-get-ready-confirm = Preparar

## Choosing how much of the Windows drive Luft gets

room-title = Quanto espaço para o Luft?
room-description = O Windows fica menor para dar espaço ao Luft. Seus arquivos no Windows continuam exatamente onde estão.
room-live = O Windows mantém espaço para crescer. O Luft também reserva { $size } para começar, que ele devolve depois de instalado.
room-make = Abrir espaço
room-confirm-title = Dar { $size } ao Luft?
room-confirm-file = O Windows reduz o disco dele e depois o Meet Luft copia o Luft da sua ISO. Mantenha o PC ligado na tomada.
room-confirm-download = O Windows reduz o disco dele e depois o Meet Luft baixa o Luft, cerca de { $size }. Mantenha o PC ligado na tomada e online.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Onde o Luft deve ficar?
room-places-description = O Luft pode compartilhar o disco do Windows ou usar um espaço que o Windows não usa.
room-places-label = Locais para o Luft
room-place-windows = Ao lado do Windows
room-place-windows-detail = O Windows fica menor para dar espaço ao Luft
room-place-windows-free = Já há { $size } livres
room-place-free = Espaço livre em { $drive }
room-place-free-here = Espaço livre no disco do Windows
room-place-free-detail = { $size } que nada mais usa
room-place-whole = Todo o disco { $drive }
room-place-whole-detail = Apaga este disco de { $size } para o Luft
room-live-free = Já há { $free } livres, então o Windows cede menos e mantém espaço para crescer. O Luft também reserva { $size } para começar, que ele devolve depois de instalado.
room-live-elsewhere = O Luft fica com { $room } lá e reserva mais { $size } para começar, que ele devolve depois de instalado.
room-confirm-free-title = Dar ao Luft { $size } de espaço livre?
room-confirm-free-file = O Meet Luft copia o Luft da sua ISO para lá. Nada mais muda no disco.
room-confirm-free-download = O Meet Luft baixa o Luft para lá, cerca de { $size }. Nada mais muda no disco. Mantenha o PC online.
room-erase-title = Apagar { $drive }?
room-erase-description = Tudo neste disco de { $size } é excluído na hora, antes de o Luft iniciar. Isso não pode ser desfeito. Agora ele contém:
room-erase-empty = O Windows não consegue ler nada neste disco de { $size }, mas o que estiver nele é excluído na hora. Isso não pode ser desfeito.
room-erase-unnamed = Partição sem nome
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Criptografada com o BitLocker
room-erase-understood = Sei que parte do conteúdo está criptografada com o BitLocker e não pode ser recuperada
room-erase-confirm = Apagar e abrir espaço

## Luft is ready on Windows

ready-title = O Luft está pronto
ready-description = Escolha como quer conhecê-lo. Depois, o Windows inicia normalmente, a menos que você instale o Luft e o escolha.
ready-update-title = Obter o Luft mais recente
ready-update-description = Saiu uma versão mais nova. Ela substitui esta e mantém o espaço e tudo o que você empacotou.
ready-try-title = Experimentar o Luft
ready-try-description = Reinicie no Luft sem instalar nada. Na próxima vez, o Windows inicia normalmente.
ready-box-description = Empacote documentos, fotos, redes Wi-Fi e mais para o Luft desempacotar quando for instalado.
ready-box-packed = Empacotado, { $size }
ready-install-title = Instalar o Luft
ready-install-description = Reinicie no instalador. Os { $size } ao lado do Windows já estão esperando por ele.
ready-install-drive-description = Reinicie no instalador. Os { $size } em { $drive } já estão esperando por ele.
ready-stick-description = Coloque o Luft em um pen drive para iniciá-lo em qualquer computador.
ready-remove = Remover o Luft deste PC
ready-restart-try = Salve primeiro o que estiver fazendo. O Luft abre em cerca de um minuto, e a próxima reinicialização traz você de volta ao Windows.
ready-restart-install = Salve primeiro o que estiver fazendo. O instalador abre em cerca de um minuto, e nada muda até você confirmar lá.
ready-fast-startup-title = Desativar a Inicialização rápida no Windows
ready-fast-startup-description = Assim o Windows desliga por completo, e o som, o Wi-Fi e o Bluetooth começam do zero no Luft.
ready-clock-title = Manter o relógio certo nos dois
ready-clock-description = O Windows passa a ler o relógio do computador como o Luft, então a hora não pula mais quando você alterna entre eles.
ready-remove-title = Remover o Luft deste PC?
ready-remove-description = O Meet Luft exclui tudo o que adicionou, incluindo a caixa de mudança, e devolve todo o espaço ao Windows.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Escolha como quer conhecê-lo. O { $system } continua iniciando normalmente até você decidir o contrário.
# Usado depois de um artigo: “o sistema atual”
linux-ready-this-system = sistema atual
linux-ready-update-description = Saiu uma versão mais nova. Ela substitui a que o Meet Luft guarda e mantém os logs de quando você experimentou o Luft.
linux-ready-try-description = Reinicie no Luft sem alterar nada. Na próxima vez, o { $system } inicia normalmente.
linux-ready-replace-title = Substituir o { $system }
linux-ready-replace-description = O Luft toma o lugar dele e mantém seus arquivos, sua conta, as redes Wi-Fi e os outros discos. O sistema antigo fica até você removê-lo.
linux-ready-install-description = Reinicie no instalador para colocar o Luft em outro disco ou em espaço livre.
linux-ready-remove = Remover o Luft deste computador
linux-ready-restart-try = Salve primeiro o que estiver fazendo. O Luft abre em cerca de um minuto, e a próxima reinicialização traz você de volta ao { $system }.
linux-ready-restart-replace = Salve primeiro o que estiver fazendo. O instalador abre com o { $system } escolhido para ser substituído e mostra o que fica antes de qualquer mudança.
linux-ready-remove-title = Remover o Luft deste computador?
linux-ready-remove-description = O Meet Luft exclui os arquivos do Luft, os arquivos de inicialização e a entrada de inicialização dele. Todo o resto continua como está.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Seu Luft
luft-looking = O Meet Luft encontrou o Luft neste PC.
luft-checking = Analisando o disco do Luft…
luft-description-beside = O Luft está instalado ao lado do Windows neste PC.
luft-description-drive = O Luft está instalado em { $drive }.
luft-bar-used = { $size }, { $used } em uso
luft-resize-title = Alterar o espaço do Luft
luft-resize-description = Dê ao Luft mais espaço do Windows ou devolva uma parte ao Windows.
luft-resize-encrypted = O disco do Luft está criptografado, então movê-lo exigiria a chave de recuperação dele. Desative primeiro a criptografia do dispositivo nas Configurações do Luft e depois volte aqui.
luft-resize-apart = Há outra partição entre o Windows e o Luft, então eles não podem dividir o espaço.
luft-resize-unreadable = O Meet Luft não conseguiu saber quanto espaço o Luft ocupa.
luft-pending-grow = O Luft cresce na próxima vez que iniciar
luft-pending-grow-description = Reinicie no Luft e deixe-o ligado por alguns minutos enquanto ele passa para o novo espaço. Enquanto isso, você pode continuar usando o Luft.
luft-pending-shrink = O Luft libera espaço na próxima vez que iniciar
luft-pending-shrink-description = Reinicie no Luft e deixe-o ligado por alguns minutos enquanto ele move os arquivos. Depois abra o Meet Luft no Windows de novo para dar o espaço ao Windows.
luft-windows-free-title = Dar o espaço livre ao Windows
luft-windows-free-description = Logo depois do Windows há { $size } que nada usa. O Windows pode recuperar esse espaço.
luft-leftovers-title = Limpar o que sobrou de experimentar o Luft
luft-leftovers-description = As partições que o Meet Luft criou para iniciar o Luft ainda estão aqui. O Luft não precisa mais delas.
luft-start = Reiniciar no Luft
luft-cancel = Cancelar a alteração
luft-restart = Salve primeiro o que estiver fazendo. O Luft inicia em cerca de um minuto, e a próxima reinicialização traz você de volta ao Windows.
luft-restart-pending = Salve primeiro o que estiver fazendo. O Luft inicia em cerca de um minuto e move os arquivos sozinho, o que leva alguns minutos. Enquanto isso, você pode usá-lo.
luft-remove = Remover o Luft deste PC
luft-remove-title = Remover o Luft deste PC?
luft-remove-description = O Luft e tudo o que há nele são excluídos, { $size } no total, e o Windows recupera o espaço. O PC inicia o Windows como antes. Isso não pode ser desfeito.
luft-remove-drive-description = O Luft e tudo o que há nele são excluídos de { $drive }, { $size } no total. O PC inicia o Windows como antes. Isso não pode ser desfeito.
luft-remove-confirm = Remover o Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Quanto espaço para o Luft?
resize-description = Arraste para dividir o disco entre o Windows e o Luft. O próprio Luft faz a alteração na próxima vez que iniciar.
resize-measuring = O Windows está calculando quanto espaço pode ceder. Em um disco grande, isso pode levar alguns minutos.
resize-full = O Luft está cheio demais para ser movido, e o Windows não consegue ceder espaço suficiente. Libere primeiro algum espaço no Luft ou no Windows.
resize-used = Os arquivos do Luft ocupam { $size }.
resize-least = Altere o tamanho em pelo menos { $size }.
resize-apply = Alterar
resize-grow-title = Dar mais { $size } ao Luft?
resize-grow-description = O Windows fica menor na hora. O Luft passa para o novo espaço na próxima vez que iniciar, o que leva alguns minutos. Mantenha o PC ligado na tomada.
resize-shrink-title = Devolver { $size } ao Windows?
resize-shrink-description = O Luft move os arquivos na próxima vez que iniciar, o que leva alguns minutos. Depois abra o Meet Luft de novo, e o Windows recupera o espaço. Mantenha o PC ligado na tomada.

## Packing things to take along to Luft (the moving box)

box-title = Traga suas coisas
box-description = Escolha o que levar. O Luft desempacota tudo na sua nova conta quando for instalado, e nada é removido do Windows.
box-looking = Verificando suas pastas…
box-folder-desktop = Área de trabalho
box-folder-documents = Documentos
box-folder-downloads = Downloads
box-folder-music = Músicas
box-folder-pictures = Imagens
box-folder-videos = Vídeos
box-folder-size = { $size }, { $files ->
    [one] { $files } arquivo
   *[other] { $files } arquivos
}
box-wifi-title = Redes Wi-Fi
box-wifi-description = Com as senhas, para o Luft ficar online na hora
box-bluetooth-title = Dispositivos Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } dispositivo, pronto sem parear de novo
   *[other] { $devices } dispositivos, prontos sem parear de novo
}
box-wallpaper-title = Papel de parede
box-wallpaper-description = A imagem da sua área de trabalho do Windows
box-account-title = Seu nome e sua foto
box-total-slow = { $size }, que leva cerca de { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
} para empacotar
box-pack = Empacotar

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Abrindo espaço
    .description = O Windows está movendo os arquivos dele para abrir espaço. Isso pode levar alguns minutos.
working-erasing = Apagando o disco
    .description = O Windows limpa o disco para que o Luft possa ocupá-lo inteiro.
working-partitioning = Preparando o espaço do Luft
    .description = Preparando as partições de onde o Luft inicia.
working-downloading = Trazendo o Luft
    .description = O Luft é copiado direto para o espaço dele e verificado no caminho.
working-packing = Empacotando suas coisas
    .description = Copiando tudo o que você escolheu para a caixa de mudança. Pastas grandes demoram um pouco.
working-removing = Removendo o Luft
    .description = Devolvendo o espaço ao Windows.
working-removing-linux = Removendo o Luft
    .description = Retirando os arquivos e a entrada de inicialização dele.
working-writing = Criando o pen drive
    .description = O Luft é gravado no pen drive inteiro. Mantenha-o conectado.
working-copying = Adicionando o Luft ao Ventoy
    .description = O Luft é copiado ao lado das outras ISOs no pen drive. Mantenha-o conectado.
working-verifying = Verificando o pen drive
    .description = Lendo tudo de volta para garantir que ele inicia.
working-stick-downloading = Baixando o Luft
    .description = Ele é verificado no caminho e guardado, para o próximo pen drive ser mais rápido.
working-progress = { $done } de { $total }
working-keep-open = Mantenha esta janela aberta.

## After Luft was removed

removed-title = Tudo voltou a ser como antes
removed-description = { $platform ->
    [linux] Os arquivos e a entrada de inicialização do Luft foram removidos, e o computador inicia como antes. Volte quando quiser.
   *[windows] As partições e a entrada de inicialização do Luft foram removidas, e o Windows tem todo o espaço de volta. Volte quando quiser.
}

## Making a USB stick

stick-title = Criar um pen drive
stick-description = O Luft inicia por ele em qualquer computador, para experimentar ou instalar.
stick-looking = Procurando unidades USB…
stick-none = Conecte um pen drive de { $size } ou mais. Ele aparece aqui.
stick-drives-label = Unidades USB
stick-offer = { $name }, { $size }
stick-make = Criar o pen drive
stick-drive-empty = Vazio
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Pequeno demais para o Luft
stick-ventoy-title = Este pen drive usa Ventoy
stick-ventoy-description = Adicionar o Luft a ele ou apagar o pen drive inteiro e transformá-lo em um pen drive do Luft?
stick-erase-it = Apagar
stick-add = Adicionar o Luft
stick-replace-title = Substituir o Luft que está nele?
stick-replace-description = { $count ->
    [one] { $names } já está neste pen drive. O novo Luft pode tomar o lugar dele.
   *[other] { $names } já estão neste pen drive. O novo Luft pode tomar o lugar deles.
}
stick-keep = { $count ->
    [one] Manter os dois
   *[other] Manter todos
}
stick-replace = Substituir
stick-full-title = Não há espaço para o Luft
stick-full-description = O Luft precisa de { $needed }, e há { $free } livres neste pen drive. Libere espaço nele ou apague-o e transforme-o em um pen drive do Luft.
stick-erase-title = Apagar { $name }?
stick-erase-description = Tudo neste pen drive de { $size } é apagado e substituído pelo Luft. Isso não pode ser desfeito.
stick-erase-confirm = Apagar e criar o pen drive
stick-done-title = Seu pen drive do Luft está pronto
stick-done-ventoy-title = O Luft está no seu pen drive com Ventoy
stick-done-take-out = Você já pode retirá-lo.
stick-done-eject = Ejete-o antes de retirá-lo.
stick-done-start = Para iniciar por ele, conecte-o e escolha-o no menu de inicialização do computador, que abre com uma tecla como F12, F8 ou Esc logo depois de ligar.
stick-done-ventoy-key = Com o Secure Boot ativado, o Ventoy pede para registrar a própria chave na primeira vez que inicia.
stick-done = Concluído
stick-done-another = Criar outro
