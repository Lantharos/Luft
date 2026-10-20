### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Salvar
settings-network-saving = Salvando…
settings-network-cancel = Cancelar
settings-network-connect = Conectar
settings-network-disconnect = Desconectar
settings-network-optional = Opcional
settings-network-automatic = Automático
settings-network-name = Nome
settings-network-password = Senha
settings-network-password-saved = Senha salva
settings-network-username = Nome de usuário
settings-network-router = Roteador
settings-network-dns-servers = Servidores DNS
settings-network-private-key = Chave privada
settings-network-connection-settings = Configurações da conexão
settings-network-connect-failed = Não foi possível conectar

## Network: connection states

settings-network-link-connected = Conectado
settings-network-link-connecting = Conectando…
settings-network-link-disconnected = Não conectado
settings-network-link-unplugged = Cabo desconectado

## Network: Wi‑Fi security types

settings-network-security-open = Nenhuma
settings-network-security-owe = Aberta aprimorada
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Pessoal
settings-network-security-sae = WPA3 Pessoal
settings-network-security-enterprise = Empresarial

## Network: signal and radio details

settings-network-signal-excellent = Excelente
settings-network-signal-good = Bom
settings-network-signal-fair = Razoável
settings-network-signal-weak = Fraco
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · Canal { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Sinal
settings-network-detail-band = Banda
settings-network-detail-speed = Velocidade do link
settings-network-detail-access-point = Ponto de acesso
settings-network-detail-security = Segurança
settings-network-detail-ipv4 = Endereço IP
settings-network-detail-ipv6 = Endereço IPv6
settings-network-detail-router = Roteador
settings-network-detail-dns = DNS
settings-network-detail-mac = Endereço físico

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Desativado por um botão físico
settings-network-wifi-connected = Conectado a { $network }
settings-network-airplane = Modo avião
    .description = Desativa todas as conexões sem fio
settings-network-airplane-hardware = Ativado por um botão físico
settings-network-known = Redes conhecidas
    .description = Redes às quais este computador já se conectou, próximas ou não
settings-network-known-count = { $count ->
        [one] { $count } rede salva
       *[other] { $count } redes salvas
    }
settings-network-known-in-range = Ao alcance
settings-network-wired = Cabeada
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Conectado · { $speed }
settings-network-empty = Nenhuma conexão de rede
    .description = Conecte um cabo de rede ou um adaptador Wi‑Fi para acessar a internet
settings-network-proxy = Proxy
    .description = Envia o tráfego da web por outro servidor, o que costuma ser necessário em redes de trabalho ou de escola.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Redes Wi‑Fi
settings-network-wifi-saved = Salva
settings-network-wifi-enterprise = Entrar com uma conta de trabalho ou escola
settings-network-wifi-connect-failed = Não foi possível conectar a esta rede
settings-network-wifi-saved-password-failed = A senha salva não funcionou. Digite-a novamente.
settings-network-wifi-settings = Configurações da rede
settings-network-wifi-searching = Procurando redes…
settings-network-hidden = Conectar a uma rede oculta
    .description = Digite o nome da rede e o tipo de segurança.
settings-network-hidden-name = Nome da rede

## Network: joining a Wi‑Fi network

settings-network-join = Conectar a “{ $network }”
settings-network-join-enterprise = Entre com sua conta de trabalho ou escola.
settings-network-join-password = Digite a senha desta rede.
settings-network-join-failed = Não foi possível conectar a esta rede.
settings-network-join-sign-in-failed = Não foi possível entrar. Verifique o nome de usuário e a senha.
settings-network-join-wrong-password = A senha não funcionou. Verifique-a e tente novamente.

## Network: connection settings page

settings-network-forget = Esquecer esta rede
    .description = Remove a senha e as configurações dela deste computador
    .button = Esquecer
settings-network-remove-vpn = Remover esta VPN
settings-network-remove-connection = Remover esta conexão
settings-network-remove-description = Exclui as configurações dela deste computador
settings-network-remove = Remover

settings-network-general = Geral
settings-network-autoconnect = Conectar automaticamente
settings-network-autoconnect-wifi = Conectar a esta rede sempre que estiver ao alcance
settings-network-autoconnect-wired = Conectar assim que o cabo for ligado
settings-network-autoconnect-vpn = Conectar sempre que este computador estiver online
settings-network-autoconnect-other = Conectar sempre que estiver disponível
settings-network-all-users = Disponível para todos
    .description = Qualquer pessoa que entrar neste computador pode usá-la
settings-network-metered = Conexão limitada
    .description = Apps e atualizações evitam downloads grandes
settings-network-metered-automatic = Detectar automaticamente
settings-network-metered-yes = Limitada
settings-network-metered-no = Não limitada

settings-network-security = Segurança
settings-network-security-type = Tipo de segurança

settings-network-advanced = Avançado
settings-network-private-address = Endereço privado
    .description = Torna este computador mais difícil de rastrear nesta rede
settings-network-hardware-address = Endereço físico
    .description = O endereço que este computador mostra para a rede
settings-network-mac-random = Novo endereço a cada vez
settings-network-mac-stable = Mesmo endereço para esta rede
settings-network-mac-private-off = Desativado
settings-network-mac-builtin = Endereço do adaptador
settings-network-mac-custom = Endereço personalizado
settings-network-mtu = Tamanho máximo de pacote (MTU)
    .description = Deixe em branco, a menos que a rede precise de um tamanho específico
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Método
    .label = Método { $family }
settings-network-ip-dhcp = Automático, só endereços
settings-network-ip-manual = Manual
settings-network-ip-link-local = Somente link-local
settings-network-ip-shared = Compartilhado com outros dispositivos
settings-network-ip-ignore = Não gerenciado
settings-network-ip-disabled = Desativado
settings-network-ip-addresses = Endereços
    .description = Cada um com seu prefixo, como { $example }
settings-network-ip-address = Endereço { $number }
settings-network-ip-remove-address = Remover endereço
settings-network-ip-add-address = Adicionar endereço
settings-network-ip-router = Roteador { $family }
settings-network-ip-automatic-dns = DNS automático
    .description = Usa os servidores DNS sugeridos por esta rede
settings-network-ip-dns-first = Usados antes dos sugeridos
settings-network-ip-dns-separate = Separe os endereços com vírgulas
settings-network-ip-dns-servers = Servidores DNS { $family }
settings-network-ip-search-domains = Domínios de pesquisa
    .description = Usados quando um nome não tem domínio, como “impressora”
    .label = Domínios de pesquisa { $family }
settings-network-ip-automatic-routes = Rotas automáticas
    .description = Usa as rotas sugeridas por esta rede
settings-network-ip-routes = Rotas
    .description = Envia o tráfego de algumas redes por outro roteador
settings-network-ip-add-route = Adicionar rota
settings-network-route-network = Rede
settings-network-route-priority = Prioridade
settings-network-route-remove = Remover rota

## Network: work or school (802.1X) sign-in

settings-network-eap = Autenticação
settings-network-eap-peap = EAP protegido (PEAP)
settings-network-eap-ttls = TLS em túnel (TTLS)
settings-network-eap-tls = Certificado (TLS)
settings-network-eap-inner = Autenticação interna
settings-network-client-certificate = Seu certificado
settings-network-private-key-password = Senha da chave privada
    .placeholder = Se a chave tiver uma
settings-network-anonymous-identity = Identidade anônima
    .description = Deixe em branco, a menos que a rede peça
settings-network-ca = Certificado de CA
    .description = Confirma que você está se conectando à rede verdadeira
settings-network-ca-system = Usar certificados do sistema
settings-network-ca-file = Escolher um arquivo…
settings-network-ca-another-file = Escolher outro arquivo…
settings-network-ca-none = Não verificar
settings-network-choose-file = Escolher…
settings-network-server-domain = Domínio do servidor
    .description = Conectar apenas a servidores deste domínio

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Digite um nome
settings-network-error-no-addresses = Adicione pelo menos um endereço
settings-network-error-address = Digite um endereço com o prefixo, como { $example }
settings-network-error-router = Digite o endereço de um roteador, como { $example }
settings-network-error-dns = “{ $address }” não é um endereço válido
settings-network-error-search-domain = “{ $domain }” não é um domínio válido
settings-network-error-route = Digite uma rede, como { $example }
settings-network-error-priority = Use um número inteiro para a prioridade
settings-network-error-username = Digite seu nome de usuário
settings-network-error-domain = Digite um domínio, como example.com
settings-network-error-certificate = Escolha seu certificado
settings-network-error-private-key = Escolha sua chave privada
settings-network-error-mtu = Use um número de { $lowest } a { $highest } ou deixe em branco
settings-network-error-mac = Digite um endereço como 12:34:56:78:9A:BC
settings-network-error-password = Digite sua senha
settings-network-error-password-length = { $count ->
        [one] Use pelo menos { $count } caractere
       *[other] Use pelo menos { $count } caracteres
    }

## Network: proxy

settings-network-proxy-off = Desativado
settings-network-proxy-manual = Manual
settings-network-proxy-url = Endereço de configuração
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Web segura (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Servidor
    .label = Servidor { $protocol }
settings-network-proxy-port = Porta
    .label = Porta { $protocol }
settings-network-proxy-skip = Não usar o proxy para
settings-network-proxy-error-url = Digite um endereço da web, como http://example.com/proxy.pac
settings-network-proxy-error-host = Digite só o nome do servidor, como proxy.example.com
settings-network-proxy-error-port = Use uma porta de 1 a 65535
settings-network-proxy-save-failed = Não foi possível salvar as configurações de proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importar de um arquivo
    .description = Arquivos de configuração do WireGuard, OpenVPN e outras VPNs
settings-network-vpn-importing = Importando…
settings-network-wireguard = Configurar o WireGuard
    .description = Digite os dados do seu provedor ou servidor de VPN
settings-network-wireguard-dialog = O provedor de VPN ou o responsável pelo servidor pode passar esses dados.
settings-network-wireguard-name-example = VPN de casa
settings-network-wireguard-public-key = Chave pública { $key }
settings-network-wireguard-public-key-pending = A chave pública aparece aqui para ser compartilhada
settings-network-wireguard-copy = Copiar chave pública
settings-network-wireguard-copied = Copiada
settings-network-wireguard-generate = Gerar uma nova chave
settings-network-wireguard-addresses = Endereços deste computador dentro da VPN
settings-network-wireguard-server-key = Chave pública do servidor
settings-network-wireguard-endpoint = Endereço do servidor
settings-network-wireguard-allowed-ips = IPs permitidos
    .description = O tráfego para estes intervalos passa pela VPN
settings-network-wireguard-preshared-key = Chave pré-compartilhada
settings-network-wireguard-keepalive = Keepalive
    .description = Ajuda a manter a conexão ativa atrás de um roteador
    .placeholder = Opcional, em segundos
settings-network-wireguard-add = Adicionar
settings-network-wireguard-adding = Adicionando…
settings-network-wireguard-error-private-key = Digite ou gere uma chave privada
settings-network-wireguard-error-addresses = Digite pelo menos um endereço
settings-network-wireguard-error-server-key = Digite a chave pública do servidor
settings-network-wireguard-error-endpoint = Digite o endereço e a porta do servidor
settings-network-wireguard-error-allowed-ips = Digite pelo menos um intervalo
settings-network-wireguard-error-keepalive = Digite um número de segundos

## Bluetooth panel

settings-bluetooth-hardware-off = Desativado por um botão físico
settings-bluetooth-power-on-failed = Não foi possível ativar o Bluetooth
settings-bluetooth-power-off-failed = Não foi possível desativar o Bluetooth
settings-bluetooth-visible = Visível para dispositivos próximos
    .description = Permite que celulares e computadores encontrem este computador
settings-bluetooth-visible-as = Aparece como “{ $name }”
settings-bluetooth-visible-duration = Ficar visível
settings-bluetooth-visible-for = { $minutes ->
        [one] Por { $minutes } minuto
       *[other] Por { $minutes } minutos
    }
settings-bluetooth-visible-until-off = Até ser desativado
settings-bluetooth-visible-failed = Não foi possível alterar a visibilidade deste computador
settings-bluetooth-paired = Meus dispositivos
settings-bluetooth-nearby = Dispositivos próximos
settings-bluetooth-searching = Procurando dispositivos…
    .description = Coloque o dispositivo que você quer adicionar no modo de pareamento
settings-bluetooth-blocked = O Bluetooth está desativado por um botão físico
    .description = Use o botão ou a tecla do computador para ativá-lo
settings-bluetooth-details = Detalhes do dispositivo
settings-bluetooth-connected = Conectado
settings-bluetooth-connected-battery = Conectado · Bateria em { $battery }
settings-bluetooth-connecting = Conectando…
settings-bluetooth-disconnecting = Desconectando…
settings-bluetooth-pairing = Pareando…
settings-bluetooth-forget-confirm = Esquecer “{ $name }”?
    .description = Será preciso parear de novo para usá-lo com este computador.
settings-bluetooth-forget = Esquecer
settings-bluetooth-cancel = Cancelar
settings-bluetooth-connect = Conectar
settings-bluetooth-disconnect = Desconectar
settings-bluetooth-done = Concluído

## Bluetooth: device details

settings-bluetooth-type = Tipo
settings-bluetooth-battery = Bateria
settings-bluetooth-address = Endereço
settings-bluetooth-autoconnect = Conectar automaticamente
    .description = Sempre que estiver por perto
settings-bluetooth-kind-headphones = Fones de ouvido
settings-bluetooth-kind-speaker = Caixa de som
settings-bluetooth-kind-mouse = Mouse
settings-bluetooth-kind-keyboard = Teclado
settings-bluetooth-kind-gamepad = Controle de jogo
settings-bluetooth-kind-phone = Celular
settings-bluetooth-kind-computer = Computador
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Tela
settings-bluetooth-kind-printer = Impressora
settings-bluetooth-kind-camera = Câmera
settings-bluetooth-kind-other = Outro dispositivo

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = o dispositivo
settings-bluetooth-request-confirm = Parear com { $name }?
    .description = Verifique se { $name } mostra o mesmo código.
settings-bluetooth-request-authorize = Permitir que { $name } faça o pareamento?
    .description = Depois disso, { $name } poderá se conectar a este computador.
settings-bluetooth-request-pin = Digite o PIN para { $name }
    .description = Costuma ser 0000 ou 1234. Se nenhum funcionar, consulte o manual do dispositivo.
settings-bluetooth-request-passkey = Digite o código que { $name } mostra
    .description = Digite os seis dígitos exatamente como aparecem.
settings-bluetooth-request-display = Parear com { $name }
    .description = Digite este código usando { $name } e pressione Enter.
settings-bluetooth-pair = Parear
settings-bluetooth-allow = Permitir

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Trazer seus dispositivos do Windows
    .description = { $count ->
        [one] No Windows, já existe pareamento com { $devices }. Use aqui sem parear de novo.
       *[other] No Windows, já existe pareamento com { $devices }. Use-os aqui sem parear de novo.
    }
settings-bluetooth-windows-more = { $count ->
        [one] mais { $count }
       *[other] mais { $count }
    }

## Accounts panel

settings-accounts-unavailable = Contas indisponíveis
    .description = O serviço de contas não está instalado neste computador
settings-accounts-online = Contas online
    .description = Cada conta é uma pasta dentro de Cloud, na sua pasta pessoal, que qualquer app pode abrir. Os arquivos são baixados quando você os abre.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud ou WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Entre novamente para continuar usando
settings-accounts-paused-metered = Sincronização pausada em uma conexão limitada
settings-accounts-paused-battery = Sincronização pausada enquanto a bateria está fraca
settings-accounts-connecting = Conectando…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, os arquivos mantidos continuam aqui
settings-accounts-not-connected = Não conectada
settings-accounts-syncing = { $count ->
        [one] Sincronizando { $count } alteração
       *[other] Sincronizando { $count } alterações
    }
settings-accounts-name = Nome
settings-accounts-folder = Pasta
settings-accounts-server = Servidor
settings-accounts-storage = Armazenamento
settings-accounts-storage-used = { $used } de { $total } em uso
settings-accounts-on-device = Neste dispositivo
settings-accounts-kept = { $count ->
        [one] { $count } item mantido, o restante é baixado ao abrir
       *[other] { $count } itens mantidos, o restante é baixado ao abrir
    }
settings-accounts-on-demand = Os arquivos são baixados quando você os abre
settings-accounts-sign-in-again = Entrar novamente
settings-accounts-keep = Manter
settings-accounts-remove = Remover
settings-accounts-remove-confirm = Remover deste computador
settings-accounts-removing = Removendo…
settings-accounts-remove-note = Seus arquivos continuam no { $provider }. As alterações feitas aqui são enviadas antes.

## Accounts: providers

settings-accounts-provider-icloud = Sua Conta Apple, confirmada com um código do iPhone, iPad ou Mac
settings-accounts-provider-onedrive = Uma conta Microsoft pessoal, de trabalho ou de escola, no navegador
settings-accounts-provider-dropbox = Uma conta do Dropbox, no navegador
settings-accounts-provider-nextcloud = Seu próprio servidor ou o da sua organização
settings-accounts-provider-webdav = Qualquer servidor compatível com WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Entrar novamente em { $account }
settings-accounts-browser = O navegador será aberto para você entrar com { $provider }. O Luft nunca vê sua senha.
settings-accounts-password-for = Digite a senha de { $user }.
settings-accounts-apple-account = Conta Apple
settings-accounts-password = Senha
settings-accounts-app-password = Senha de app
settings-accounts-user = Nome de usuário
settings-accounts-apple-note = Use a senha da sua Conta Apple; senhas específicas de app não funcionam aqui. Depois, a Apple mostra um código no seu iPhone, iPad ou Mac.
settings-accounts-nextcloud-browser = O navegador será aberto para você entrar no seu servidor e permitir o acesso do Luft.
settings-accounts-use-app-password = Usar uma senha de app
settings-accounts-error-server = Digite o endereço do servidor
settings-accounts-error-apple-account = Digite o e-mail da sua Conta Apple
settings-accounts-error-user = Digite o nome de usuário
settings-accounts-error-password = Digite a senha
settings-accounts-cancel = Cancelar
settings-accounts-back = Voltar
settings-accounts-continue-in-browser = Continuar no navegador
settings-accounts-sign-in = Entrar
settings-accounts-try-again = Tentar novamente
settings-accounts-continue = Continuar
settings-accounts-working = Conectando ao { $provider }…
settings-accounts-finish-in-browser = Termine de entrar com { $provider } no navegador. O Luft nunca vê sua senha, e esta tela é atualizada sozinha quando você terminar.
settings-accounts-no-browser = Nenhum navegador foi aberto. Copie o link e abra-o em um navegador.
settings-accounts-open-again = Abrir a página novamente
settings-accounts-copy-link = Copiar o link
settings-accounts-copied = Copiado
settings-accounts-code = Código de verificação
    .placeholder = Código de 6 dígitos
settings-accounts-text-me = Receber o código por SMS
settings-accounts-choose-phone = Para qual número a Apple deve enviar o código?
    .description = Enviar por SMS
settings-accounts-approve = Sua Conta Apple usa a Proteção Avançada de Dados. Aprove a solicitação no seu iPhone, iPad ou Mac para que este computador possa abrir o iCloud Drive.
