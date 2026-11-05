## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Voltar
meet-cancel = Cancelar
meet-continue = Continuar
meet-try-again = Tentar novamente
meet-restart = Reiniciar
meet-remove = Remover
meet-keep-it = Mantê-lo
meet-close = Fechar
meet-restart-title = Reiniciar agora?
meet-not-yet = Ainda não
meet-iso-use = Utilizar uma ISO que já tenho
meet-iso-using = A utilizar a sua ISO do Luft
meet-nightly = Versões nightly
meet-channel-nightly = O Meet Luft vai utilizar versões nightly
meet-channel-latest = O Meet Luft volta a utilizar as versões normais
meet-undo = Anular
meet-logs-saved = Os registos da experiência com o Luft foram guardados no ambiente de trabalho
meet-logs-show = Mostrar
meet-logs-none = Ainda não há registos da experiência com o Luft
meet-logs-failed = O Meet Luft não conseguiu guardar os registos da experiência com o Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] O Meet Luft não conseguiu terminar a análise deste computador.
   *[windows] O Meet Luft não conseguiu terminar a análise deste PC.
}
problem-room = Não foi possível terminar de arranjar espaço para o Luft.
problem-room-linux = Não foi possível terminar a preparação do Luft.
problem-update = Não foi possível terminar a atualização do Luft.
problem-download = A transferência do Luft parou. Verifique se está ligado à internet.
problem-pack = Não foi possível terminar de empacotar as suas coisas.
problem-remove = Não foi possível terminar a remoção do Luft.
problem-restart = O Meet Luft não conseguiu preparar o reinício.
problem-tidy = Não foi possível remover as entradas de arranque antigas.
problem-firmware = O Meet Luft não conseguiu abrir as definições do firmware.
problem-folders = O Meet Luft não conseguiu analisar as suas pastas.
problem-sticks = O Meet Luft não conseguiu procurar unidades USB.
problem-stick = Não foi possível terminar a criação da pen.
problem-offer = Não é possível transferir o Luft neste momento. Verifique se está ligado à internet ou utilize uma ISO que já tenha.
problem-luft = O Meet Luft não conseguiu analisar o disco do Luft.
problem-resize = Não foi possível terminar a alteração do tamanho do Luft.
problem-cancel = O Meet Luft não conseguiu cancelar a alteração.
problem-give = O Windows não conseguiu recuperar o espaço.
problem-declined = { $platform ->
    [linux] O Meet Luft precisa de permissão para trabalhar no disco. Introduza a palavra-passe quando lhe for pedida.
   *[windows] O Meet Luft precisa de permissão para trabalhar no disco. Escolha Sim quando o Windows perguntar.
}

## First screen

hello-intro = { $platform ->
    [linux] Experimente o Luft a partir daqui, sem pen USB. Se gostar, o Luft pode ocupar o lugar deste sistema e manter os seus ficheiros.
   *[windows] O Luft pode viver mesmo ao lado do Windows. Experimente-o primeiro sem instalar nada e traga as suas coisas quando estiver pronto.
}
hello-check = { $platform ->
    [linux] Verificar este computador
   *[windows] Verificar este PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] A analisar este computador
   *[windows] A analisar este PC
}
check-ready-title = { $platform ->
    [linux] Este computador está pronto para o Luft
   *[windows] Este PC está pronto para o Luft
}
check-blocked-title = Quase lá
check-moment = Isto demora um momento.
check-slow = O Windows está a calcular quanto espaço pode dispensar. Num disco grande, isto pode demorar alguns minutos.
check-blocked-description = Há algo a mudar antes de o Luft se poder instalar. Eis o que fazer.
check-found-description = Eis o que o Meet Luft encontrou.
check-checking = A verificar o disco, o firmware e o hardware…
check-again = Verificar novamente
check-action-firmware = Abrir as definições do firmware
check-action-tidy = Limpar
check-firmware-title = Reiniciar nas definições do firmware?
check-firmware-description = Guarde primeiro o trabalho em curso. Ative lá o Secure Boot e guarde, e o computador volta a arrancar normalmente.
check-tidy-title = Remover as entradas de arranque antigas?
check-tidy-description = Apenas apontam para sistemas que já não existem. O Windows e tudo o resto arrancam como antes.
check-get-ready-title = Preparar o Luft?
check-get-ready-file = O Meet Luft copia o Luft da sua ISO para uma pasta neste computador e adiciona-lhe uma entrada de arranque. Nenhuma partição é alterada.
check-get-ready-download = O Meet Luft transfere o Luft, cerca de { $size }, para uma pasta neste computador e adiciona-lhe uma entrada de arranque. Nenhuma partição é alterada.
check-get-ready-confirm = Preparar

## Choosing how much of the Windows drive Luft gets

room-title = Quanto espaço para o Luft?
room-description = O Windows fica mais pequeno para dar espaço ao Luft. Os seus ficheiros no Windows ficam exatamente como estão.
room-live = O Windows mantém espaço para crescer. O Luft reserva também { $size } para arrancar, que devolve depois de instalado.
room-make = Arranjar espaço
room-confirm-title = Dar { $size } ao Luft?
room-confirm-file = O Windows reduz o disco e depois o Meet Luft copia o Luft da sua ISO. Mantenha o PC ligado à corrente.
room-confirm-download = O Windows reduz o disco e depois o Meet Luft transfere o Luft, cerca de { $size }. Mantenha o PC ligado à corrente e à internet.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Onde colocar o Luft?
room-places-description = O Luft pode partilhar o disco do Windows ou ocupar espaço que o Windows não utiliza.
room-places-label = Locais para o Luft
room-place-windows = Ao lado do Windows
room-place-windows-detail = O Windows fica mais pequeno para dar espaço ao Luft
room-place-windows-free = Já há { $size } livres
room-place-free = Espaço livre em { $drive }
room-place-free-here = Espaço livre no disco do Windows
room-place-free-detail = { $size } que mais nada utiliza
room-place-whole = Todo o disco { $drive }
room-place-whole-detail = Apaga este disco de { $size } para o Luft
room-live-free = Já há { $free } livres, por isso o Windows cede menos e mantém espaço para crescer. O Luft reserva também { $size } para arrancar, que devolve depois de instalado.
room-live-elsewhere = O Luft fica aí com { $room } e reserva mais { $size } para arrancar, que devolve depois de instalado.
room-confirm-free-title = Dar ao Luft { $size } de espaço livre?
room-confirm-free-file = O Meet Luft copia para lá o Luft da sua ISO. Nada mais muda no disco.
room-confirm-free-download = O Meet Luft transfere para lá o Luft, cerca de { $size }. Nada mais muda no disco. Mantenha o PC ligado à internet.
room-erase-title = Apagar { $drive }?
room-erase-description = Tudo o que está neste disco de { $size } é eliminado de imediato, antes de o Luft arrancar. Não é possível anular. Neste momento contém:
room-erase-empty = O Windows não consegue ler nada neste disco de { $size }, mas o que lá estiver é eliminado de imediato. Não é possível anular.
room-erase-unnamed = Partição sem nome
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Encriptada com o BitLocker
room-erase-understood = Sei que parte do conteúdo está encriptada com o BitLocker e não pode ser recuperada
room-erase-confirm = Apagar e arranjar espaço

## Luft is ready on Windows

ready-title = O Luft está pronto
ready-description = Escolha como quer conhecê-lo. Depois, o Windows arranca normalmente, a não ser que instale o Luft e o escolha.
ready-update-title = Obter o Luft mais recente
ready-update-description = Há uma versão mais recente. Substitui esta e mantém o espaço e tudo o que empacotou.
ready-try-title = Experimentar o Luft
ready-try-description = Reiniciar no Luft sem instalar nada. Da próxima vez, o Windows arranca normalmente.
ready-box-description = Empacotar documentos, fotografias, redes Wi-Fi e mais, para o Luft desempacotar depois de instalado.
ready-box-packed = Empacotado, { $size }
ready-install-title = Instalar o Luft
ready-install-description = Reiniciar no instalador. Os { $size } ao lado do Windows já estão à espera dele.
ready-install-drive-description = Reiniciar no instalador. Os { $size } em { $drive } já estão à espera dele.
ready-stick-description = Colocar o Luft numa pen para o iniciar em qualquer computador.
ready-remove = Remover o Luft deste PC
ready-restart-try = Guarde primeiro o trabalho em curso. O Luft abre dentro de um minuto, mais ou menos, e o reinício seguinte volta ao Windows.
ready-restart-install = Guarde primeiro o trabalho em curso. O instalador abre dentro de um minuto, mais ou menos, e nada muda até confirmar lá.
ready-fast-startup-title = Desativar o arranque rápido no Windows
ready-fast-startup-description = Assim o Windows encerra por completo, e o som, o Wi-Fi e o Bluetooth arrancam do zero no Luft.
ready-clock-title = Manter o relógio certo nos dois
ready-clock-description = O Windows passa a ler o relógio do computador da mesma forma que o Luft, por isso a hora deixa de saltar quando muda de sistema.
ready-remove-title = Remover o Luft deste PC?
ready-remove-description = O Meet Luft elimina tudo o que adicionou, incluindo a caixa de mudança, e devolve todo o espaço ao Windows.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

# $system fica sem artigo, porque também pode ser «este sistema».
linux-ready-description = Escolha como quer conhecê-lo. Até decidir o contrário, { $system } continua a arrancar normalmente.
linux-ready-this-system = este sistema
linux-ready-update-description = Há uma versão mais recente. Substitui a que o Meet Luft guarda e mantém os registos das experiências.
linux-ready-try-description = Reiniciar no Luft sem alterar nada. Da próxima vez, { $system } arranca normalmente.
linux-ready-replace-title = Substituir { $system }
linux-ready-replace-description = O Luft ocupa o seu lugar e mantém os ficheiros, a conta, as redes Wi-Fi e os outros discos. O sistema antigo fica até o remover.
linux-ready-install-description = Reiniciar no instalador para pôr o Luft noutro disco ou em espaço livre.
linux-ready-remove = Remover o Luft deste computador
linux-ready-restart-try = Guarde primeiro o trabalho em curso. O Luft abre dentro de um minuto, mais ou menos, e no reinício seguinte arranca novamente { $system }.
linux-ready-restart-replace = Guarde primeiro o trabalho em curso. O instalador abre com { $system } escolhido para substituir e mostra o que fica antes de alterar seja o que for.
linux-ready-remove-title = Remover o Luft deste computador?
linux-ready-remove-description = O Meet Luft elimina os ficheiros do Luft, os ficheiros de arranque e a entrada de arranque. Tudo o resto fica como está.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = O seu Luft
luft-looking = O Meet Luft encontrou o Luft neste PC.
luft-checking = A analisar o disco do Luft…
luft-description-beside = O Luft está instalado ao lado do Windows neste PC.
luft-description-drive = O Luft está instalado em { $drive }.
luft-bar-used = { $size }, { $used } em uso
luft-resize-title = Alterar o espaço do Luft
luft-resize-description = Dar ao Luft mais espaço do Windows ou devolver parte dele ao Windows.
luft-resize-drive-description = Dar ao Luft mais do espaço livre em { $drive } ou deixar parte dele livre.
luft-resize-passphrase = O disco do Luft só abre com uma frase de acesso, e o Luft não a consegue escrever sozinho enquanto se desloca.
luft-resize-start-first = Inicie o Luft uma vez para que possa dizer ao Meet Luft quão cheio está e depois volte aqui.
luft-resize-apart = Há outra partição entre o Windows e o Luft, por isso não podem partilhar o espaço.
luft-pending-grow = O Luft cresce no próximo arranque
luft-pending-grow-description = Reinicie no Luft e deixe-o ligado alguns minutos enquanto passa para o novo espaço. Entretanto, pode continuar a utilizá-lo.
luft-pending-shrink = O Luft liberta espaço no próximo arranque
luft-pending-shrink-description = Reinicie no Luft e deixe-o ligado alguns minutos enquanto move os ficheiros. Depois abra novamente o Meet Luft no Windows para dar o espaço ao Windows.
luft-pending-trim = O Luft fica mais pequeno no próximo arranque
luft-pending-trim-description = Reinicie no Luft e este fica mais pequeno em cerca de um minuto.
luft-windows-free-title = Dar o espaço livre ao Windows
luft-windows-free-description = Logo a seguir ao Windows há { $size } que nada utiliza. O Windows pode recuperá-los.
luft-leftovers-title = Limpar o que ficou da experiência do Luft
luft-leftovers-description = As partições que o Meet Luft criou para arrancar o Luft ainda estão aqui. O Luft já não precisa delas.
luft-start = Reiniciar no Luft
luft-cancel = Cancelar a alteração
luft-restart = Guarde primeiro o trabalho em curso. O Luft arranca dentro de um minuto, mais ou menos, e o reinício seguinte volta ao Windows.
luft-restart-pending = Guarde primeiro o trabalho em curso. O Luft arranca dentro de um minuto, mais ou menos, e move os ficheiros sozinho, o que demora alguns minutos. Entretanto, pode utilizá-lo.
luft-remove = Remover o Luft deste PC
luft-remove-title = Remover o Luft deste PC?
luft-remove-description = O Luft e tudo o que contém são eliminados, { $size } no total, e o Windows recupera o espaço. O PC arranca o Windows como antes. Não é possível anular.
luft-remove-drive-description = O Luft e tudo o que contém são eliminados de { $drive }, { $size } no total. O PC arranca o Windows como antes. Não é possível anular.
luft-remove-confirm = Remover o Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Quanto espaço para o Luft?
resize-description = Arraste para dividir o disco entre o Windows e o Luft. O próprio Luft faz a alteração no próximo arranque.
resize-measuring = O Windows está a calcular quanto espaço pode dispensar. Num disco grande, isto pode demorar alguns minutos.
resize-full = O Luft está demasiado cheio para ser movido, e o Windows não consegue dispensar espaço suficiente. Liberte primeiro algum espaço no Luft ou no Windows.
resize-drive-description = Arraste para escolher quanto de { $drive } o Luft ocupa. O próprio Luft faz a alteração no próximo arranque.
resize-drive-free = { $size } livres em { $drive }
resize-used = Os ficheiros do Luft ocupam { $size }.
resize-least = Altere o tamanho em pelo menos { $size }.
resize-apply = Alterar
resize-grow-title = Dar mais { $size } ao Luft?
resize-grow-description = O Windows fica mais pequeno de imediato. O Luft passa para o novo espaço no próximo arranque, o que demora alguns minutos. Mantenha o PC ligado à corrente.
resize-grow-drive-description = O Luft ocupa o espaço livre em { $drive } no próximo arranque, o que demora um momento.
resize-trim-title = Reduzir o Luft em { $size }?
resize-trim-description = O Luft fica mais pequeno no próximo arranque, e o espaço em { $drive } continua livre.
resize-shrink-title = Devolver { $size } ao Windows?
resize-shrink-description = O Luft move os ficheiros no próximo arranque, o que demora alguns minutos. Depois abra novamente o Meet Luft e o Windows recupera o espaço. Mantenha o PC ligado à corrente.

## Packing things to take along to Luft (the moving box)

box-title = Trazer as suas coisas
box-description = Escolha o que levar. O Luft desempacota-o na sua nova conta depois de instalado, e nada é removido do Windows.
box-looking = A analisar as suas pastas…
box-folder-desktop = Ambiente de trabalho
box-folder-documents = Documentos
box-folder-downloads = Transferências
box-folder-music = Música
box-folder-pictures = Imagens
box-folder-videos = Vídeos
box-folder-size = { $size }, { $files ->
    [0] { $files } ficheiros
    [one] { $files } ficheiro
   *[other] { $files } ficheiros
}
box-wifi-title = Redes Wi-Fi
box-wifi-description = Com as palavras-passe, para o Luft ficar ligado de imediato
box-bluetooth-title = Dispositivos Bluetooth
box-bluetooth-description = { $devices ->
    [0] { $devices } dispositivos, prontos sem emparelhar novamente
    [one] { $devices } dispositivo, pronto sem emparelhar novamente
   *[other] { $devices } dispositivos, prontos sem emparelhar novamente
}
box-wallpaper-title = Imagem de fundo
box-wallpaper-description = A imagem do ambiente de trabalho do Windows
box-account-title = O seu nome e imagem
box-total-slow = { $size }, que demora cerca de { $minutes ->
    [0] { $minutes } minutos
    [one] { $minutes } minuto
   *[other] { $minutes } minutos
} a empacotar
box-pack = Empacotar

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = A arranjar espaço
    .description = O Windows está a mover os ficheiros para criar espaço. Isto pode demorar alguns minutos.
working-erasing = A apagar o disco
    .description = O Windows limpa-o para que o Luft o possa ocupar por inteiro.
working-partitioning = A preparar o espaço do Luft
    .description = A preparar as partições a partir das quais o Luft arranca.
working-downloading = A trazer o Luft
    .description = O Luft é copiado diretamente para o seu próprio espaço e verificado pelo caminho.
working-packing = A empacotar as suas coisas
    .description = A copiar tudo o que escolheu para a caixa de mudança. As pastas grandes demoram algum tempo.
working-removing = A remover o Luft
    .description = A devolver o espaço ao Windows.
working-removing-linux = A remover o Luft
    .description = A retirar os ficheiros e a entrada de arranque.
working-writing = A criar a pen
    .description = O Luft é gravado em toda a pen. Mantenha-a ligada.
working-copying = A adicionar o Luft ao Ventoy
    .description = O Luft é copiado para junto das outras ISO na pen. Mantenha-a ligada.
working-verifying = A verificar a pen
    .description = A ler tudo novamente para garantir que arranca.
working-stick-downloading = A transferir o Luft
    .description = É verificado pelo caminho e guardado, para que a próxima pen seja mais rápida.
working-progress = { $done } de { $total }
working-keep-open = Mantenha esta janela aberta.

## After Luft was removed

removed-title = Tudo como estava
removed-description = { $platform ->
    [linux] Os ficheiros do Luft e a entrada de arranque desapareceram, e o computador arranca como antes. Volte quando quiser.
   *[windows] As partições do Luft e a entrada de arranque desapareceram, e o Windows tem novamente todo o espaço. Volte quando quiser.
}

## Making a USB stick

stick-title = Criar uma pen USB
stick-description = O Luft arranca a partir dela em qualquer computador, para o experimentar ou instalar.
stick-looking = A procurar unidades USB…
stick-none = Ligue uma pen USB com { $size } ou mais. Aparece aqui.
stick-drives-label = Unidades USB
stick-offer = { $name }, { $size }
stick-make = Criar a pen
stick-drive-empty = Vazia
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Demasiado pequena para o Luft
stick-ventoy-title = Esta pen utiliza o Ventoy
stick-ventoy-description = Adicionar o Luft ou apagar a pen inteira e torná-la uma pen do Luft?
stick-erase-it = Apagar
stick-add = Adicionar o Luft
stick-replace-title = Substituir o Luft que está na pen?
stick-replace-description = { $count ->
    [one] { $names } já está nesta pen. O novo Luft pode ocupar o seu lugar.
   *[other] { $names } já estão nesta pen. O novo Luft pode ocupar o lugar deles.
}
stick-keep = { $count ->
    [one] Manter ambos
   *[other] Manter todos
}
stick-replace = Substituir
stick-full-title = Não há espaço para o Luft
stick-full-description = O Luft precisa de { $needed } e esta pen tem { $free } de espaço livre. Liberte espaço nela, ou apague-a e torne-a uma pen do Luft.
stick-erase-title = Apagar { $name }?
stick-erase-description = Tudo o que está nesta pen de { $size } é apagado e substituído pelo Luft. Não é possível anular.
stick-erase-confirm = Apagar e criar a pen
stick-done-title = A sua pen do Luft está pronta
stick-done-ventoy-title = O Luft está na sua pen Ventoy
stick-done-take-out = Já pode retirá-la.
stick-done-eject = Ejete-a antes de a retirar.
stick-done-start = Para arrancar a partir dela, ligue-a e escolha-a no menu de arranque do computador, que abre com uma tecla como F12, F8 ou Esc logo após ligar o computador.
stick-done-ventoy-key = Com o Secure Boot ativo, o Ventoy pede uma vez para registar a sua própria chave, da primeira vez que arranca.
stick-done = Concluído
stick-done-another = Criar outra
