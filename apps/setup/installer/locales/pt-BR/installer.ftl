## Errors shown in Install Luft and first-run setup

installer-not-allowed = Você não tem permissão para fazer isso.
installer-stopped = O instalador parou inesperadamente.
installer-request-invalid = A solicitação não é válida: { $error }
installer-settings-invalid = As configurações não são válidas: { $error }
installer-busy = O Luft já está sendo instalado.
installer-account-exists = A conta já foi criada.

## Choosing what to install

installer-no-image = Não há nenhuma imagem { $variant } para instalar.
installer-write-failed = Não foi possível gravar { $path }

## Checking the destination

installer-drive-gone = Esse disco não está mais conectado.
installer-drive-unusable = O Luft não pode ser instalado nesse disco.
installer-system-gone = Esse sistema não está mais lá.
installer-system-unreplaceable = O Luft ainda não consegue substituir o { $system }.
installer-drive-running = O Luft está sendo executado a partir desse disco agora, então ele não pode ser apagado.
installer-windows-unshrinkable = Não é possível reduzir o Windows nesse disco.
installer-size-wont-fit = Esse tamanho não cabe ao lado do Windows.
installer-space-gone = Esse espaço livre não está mais lá.
installer-space-too-small = Esse espaço livre é pequeno demais para o Luft.

## Account and regional settings

installer-user-name-invalid = Esse nome de usuário não pode ser usado.
installer-full-name-invalid = O nome não pode conter dois-pontos, vírgulas nem quebras de linha.
installer-password-missing = Escolha uma senha.
installer-account-not-saved = A nova conta não foi salva
installer-account-missing = A nova conta não foi encontrada
installer-regional-invalid = Essas configurações regionais não são válidas.
installer-unknown-zone = O novo sistema não conhece o fuso horário { $zone }.

## Installing

installer-esp-partition-failed = Não foi possível criar a partição de sistema EFI
installer-startup-partition-failed = Não foi possível criar a partição para os arquivos de inicialização do Luft
installer-root-partition-failed = Não foi possível criar a partição para o Luft
installer-shrink-failed = Não foi possível reduzir o Windows
installer-no-esp = O disco não tem uma partição de sistema EFI
installer-no-root = Nenhuma partição para o Luft foi criada
installer-copy-failed = Não foi possível copiar o Luft
installer-no-deployment = O novo sistema não tem uma implantação
installer-deployment-unnamed = A implantação do novo sistema não tem nome
installer-deployment-unopened = Não foi possível abrir o novo sistema
installer-boot-menu-failed = Não foi possível colocar o menu de inicialização do Luft na partição de sistema EFI
installer-key-queue-failed = Não foi possível agendar a chave de Secure Boot do Luft para a próxima reinicialização

## Replacing a Linux system

installer-leftovers-failed = Não foi possível limpar o que uma tentativa anterior deixou
installer-default-failed = Não foi possível tornar o Luft o sistema que inicia
installer-relabel-failed = Não foi possível rotular seus arquivos para o Luft
installer-set-aside-failed = Não foi possível deixar o sistema antigo de lado

## Things packed with Meet Luft

installer-box-unopened = Não foi possível abrir a caixa de mudança
installer-box-no-list = A caixa de mudança não tem uma lista do que há nela
installer-unpack-failed = Não foi possível desempacotar { $path }
installer-wallpaper-unnamed = O papel de parede não tem nome
