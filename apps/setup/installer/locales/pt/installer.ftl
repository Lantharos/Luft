## Errors shown in Install Luft and first-run setup

installer-not-allowed = Não tem permissão para fazer isto.
installer-stopped = O instalador parou inesperadamente.
installer-request-invalid = O pedido não é válido: { $error }
installer-settings-invalid = As definições não são válidas: { $error }
installer-busy = O Luft já está a ser instalado.
installer-account-exists = A conta já foi criada.

## Choosing what to install

installer-no-image = Não há nenhuma imagem { $variant } para instalar.
installer-read-failed = Não foi possível ler { $path }
installer-parse-failed = Não foi possível interpretar { $path }
installer-write-failed = Não foi possível escrever { $path }

## Checking the destination

installer-drive-gone = Esse disco já não está ligado.
installer-drive-unusable = Não é possível instalar o Luft nesse disco.
installer-system-gone = Esse sistema já não existe.
installer-system-unreplaceable = O Luft ainda não consegue substituir o { $system }.
installer-drive-running = O Luft está a arrancar a partir desse disco neste momento, por isso não é possível apagá-lo.
installer-windows-unshrinkable = Não é possível reduzir o Windows nesse disco.
installer-size-wont-fit = Esse tamanho não cabe ao lado do Windows.
installer-space-gone = Esse espaço livre já não existe.
installer-space-too-small = Esse espaço livre é demasiado pequeno para o Luft.

## Account and regional settings

installer-user-name-invalid = Não é possível utilizar esse nome de utilizador.
installer-full-name-invalid = Um nome não pode conter dois pontos, vírgulas nem quebras de linha.
installer-password-missing = Escolha uma palavra-passe.
installer-account-not-saved = Não foi possível guardar a nova conta
installer-account-missing = A nova conta não existe
installer-regional-invalid = Essas definições regionais não são válidas.
installer-unknown-zone = O novo sistema não conhece o fuso horário { $zone }.

## Installing

installer-esp-partition-failed = Não foi possível criar a partição de sistema EFI
installer-startup-partition-failed = Não foi possível criar a partição para os ficheiros de arranque do Luft
installer-root-partition-failed = Não foi possível criar a partição para o Luft
installer-shrink-failed = Não foi possível reduzir o Windows
installer-no-esp = O disco não tem nenhuma partição de sistema EFI
installer-no-root = Não foi criada nenhuma partição para o Luft
installer-copy-failed = Não foi possível copiar o Luft
installer-no-deployment = O novo sistema não tem nenhuma implementação
installer-deployment-unnamed = A implementação do novo sistema não tem nome
installer-deployment-unopened = Não foi possível abrir o novo sistema
installer-boot-menu-failed = Não foi possível colocar o menu de arranque do Luft na partição de sistema EFI
installer-key-queue-failed = Não foi possível preparar a chave do Secure Boot do Luft para o próximo reinício

## Replacing a Linux system

installer-leftovers-failed = Não foi possível limpar o que uma tentativa anterior deixou
installer-default-failed = Não foi possível tornar o Luft o sistema que arranca
installer-relabel-failed = Não foi possível etiquetar os seus ficheiros para o Luft
installer-set-aside-failed = Não foi possível pôr de parte o sistema antigo

## Things packed with Meet Luft

installer-box-unopened = Não foi possível abrir a caixa de mudança
installer-box-no-list = A caixa de mudança não tem uma lista do que contém
installer-unpack-failed = Não foi possível desempacotar { $path }
installer-wallpaper-unnamed = A imagem de fundo não tem nome
