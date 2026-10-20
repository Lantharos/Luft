### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Guardar
settings-network-saving = A guardar…
settings-network-cancel = Cancelar
settings-network-connect = Ligar
settings-network-disconnect = Desligar
settings-network-optional = Opcional
settings-network-automatic = Automático
settings-network-name = Nome
settings-network-password = Palavra-passe
settings-network-password-saved = Palavra-passe guardada
settings-network-username = Nome de utilizador
settings-network-router = Router
settings-network-dns-servers = Servidores DNS
settings-network-private-key = Chave privada
settings-network-connection-settings = Definições da ligação
settings-network-connect-failed = Não foi possível ligar

## Network: connection states

settings-network-link-connected = Ligado
settings-network-link-connecting = A ligar…
settings-network-link-disconnected = Sem ligação
settings-network-link-unplugged = Cabo desligado

## Network: Wi‑Fi security types

settings-network-security-open = Nenhuma
settings-network-security-owe = Aberta melhorada
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
settings-network-detail-speed = Velocidade da ligação
settings-network-detail-access-point = Ponto de acesso
settings-network-detail-security = Segurança
settings-network-detail-ipv4 = Endereço IP
settings-network-detail-ipv6 = Endereço IPv6
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Endereço físico

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Desligado por um interruptor físico
settings-network-wifi-connected = Ligado a { $network }
settings-network-airplane = Modo de avião
    .description = Desliga todas as ligações sem fios
settings-network-airplane-hardware = Ativado por um interruptor físico
settings-network-known = Redes conhecidas
    .description = Redes a que este computador já se ligou, por perto ou não
settings-network-known-count = { $count ->
        [0] Nenhuma rede guardada
        [one] { $count } rede guardada
       *[other] { $count } redes guardadas
    }
settings-network-known-in-range = Ao alcance
settings-network-wired = Com fios
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Ligado · { $speed }
settings-network-empty = Sem ligações de rede
    .description = Ligue um cabo de rede ou um adaptador Wi‑Fi para aceder à internet
settings-network-proxy = Proxy
    .description = Envia o tráfego da Web através de outro servidor, o que é muitas vezes necessário em redes de trabalho ou escolares.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Redes Wi‑Fi
settings-network-wifi-saved = Guardada
settings-network-wifi-enterprise = Iniciar sessão com uma conta de trabalho ou escolar
settings-network-wifi-connect-failed = Não foi possível ligar a esta rede
settings-network-wifi-saved-password-failed = A palavra-passe guardada não funcionou. Introduza-a novamente.
settings-network-wifi-settings = Definições da rede
settings-network-wifi-searching = A procurar redes…
settings-network-hidden = Ligar a uma rede oculta
    .description = Introduza o nome da rede e o tipo de segurança.
settings-network-hidden-name = Nome da rede

## Network: joining a Wi‑Fi network

settings-network-join = Ligar a «{ $network }»
settings-network-join-enterprise = Inicie sessão com a sua conta de trabalho ou escolar.
settings-network-join-password = Introduza a palavra-passe desta rede.
settings-network-join-failed = Não foi possível ligar a esta rede.
settings-network-join-sign-in-failed = Não foi possível iniciar sessão. Verifique o nome de utilizador e a palavra-passe.
settings-network-join-wrong-password = A palavra-passe não funcionou. Verifique-a e tente novamente.

## Network: connection settings page

settings-network-forget = Esquecer esta rede
    .description = Remove deste computador a palavra-passe e as definições da rede
    .button = Esquecer
settings-network-remove-vpn = Remover esta VPN
settings-network-remove-connection = Remover esta ligação
settings-network-remove-description = Elimina deste computador as respetivas definições
settings-network-remove = Remover

settings-network-general = Geral
settings-network-autoconnect = Ligar automaticamente
settings-network-autoconnect-wifi = Ligar a esta rede sempre que estiver ao alcance
settings-network-autoconnect-wired = Ligar assim que for ligado um cabo
settings-network-autoconnect-vpn = Ligar sempre que este computador estiver online
settings-network-autoconnect-other = Ligar sempre que estiver disponível
settings-network-all-users = Disponível para todos
    .description = Qualquer pessoa que inicie sessão neste computador pode utilizá-la
settings-network-metered = Ligação tarifada
    .description = As aplicações e as atualizações evitam transferências grandes
settings-network-metered-automatic = Detetar automaticamente
settings-network-metered-yes = Tarifada
settings-network-metered-no = Não tarifada

settings-network-security = Segurança
settings-network-security-type = Tipo de segurança

settings-network-advanced = Avançado
settings-network-private-address = Endereço privado
    .description = Torna este computador mais difícil de seguir nesta rede
settings-network-hardware-address = Endereço físico
    .description = O endereço que este computador mostra à rede
settings-network-mac-random = Novo endereço de cada vez
settings-network-mac-stable = O mesmo endereço para esta rede
settings-network-mac-private-off = Desativado
settings-network-mac-builtin = Endereço integrado
settings-network-mac-custom = Endereço personalizado
settings-network-mtu = Tamanho máximo dos pacotes (MTU)
    .description = Deixe vazio, a não ser que a rede precise de um tamanho específico
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Método
    .label = Método { $family }
settings-network-ip-dhcp = Automático, só endereços
settings-network-ip-manual = Manual
settings-network-ip-link-local = Só local da ligação
settings-network-ip-shared = Partilhado com outros dispositivos
settings-network-ip-ignore = Não gerido
settings-network-ip-disabled = Desativado
settings-network-ip-addresses = Endereços
    .description = Cada um com o respetivo prefixo, como { $example }
settings-network-ip-address = Endereço { $number }
settings-network-ip-remove-address = Remover endereço
settings-network-ip-add-address = Adicionar endereço
settings-network-ip-router = Router { $family }
settings-network-ip-automatic-dns = DNS automático
    .description = Utilizar os servidores DNS sugeridos por esta rede
settings-network-ip-dns-first = Utilizados antes dos sugeridos
settings-network-ip-dns-separate = Separe os endereços com vírgulas
settings-network-ip-dns-servers = Servidores DNS { $family }
settings-network-ip-search-domains = Domínios de pesquisa
    .description = Utilizados quando um nome não tem domínio, como «impressora»
    .label = Domínios de pesquisa { $family }
settings-network-ip-automatic-routes = Rotas automáticas
    .description = Utilizar as rotas sugeridas por esta rede
settings-network-ip-routes = Rotas
    .description = Envia o tráfego de algumas redes através de outro router
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
settings-network-client-certificate = O seu certificado
settings-network-private-key-password = Palavra-passe da chave privada
    .placeholder = Se a chave tiver uma
settings-network-anonymous-identity = Identidade anónima
    .description = Deixe vazio, a não ser que a rede a peça
settings-network-ca = Certificado da AC
    .description = Confirma que está a ligar-se à rede verdadeira
settings-network-ca-system = Utilizar os certificados do sistema
settings-network-ca-file = Escolher um ficheiro…
settings-network-ca-another-file = Escolher outro ficheiro…
settings-network-ca-none = Não verificar
settings-network-choose-file = Escolher…
settings-network-server-domain = Domínio do servidor
    .description = Ligar apenas a servidores deste domínio

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Introduza um nome
settings-network-error-no-addresses = Adicione pelo menos um endereço
settings-network-error-address = Introduza um endereço com o respetivo prefixo, como { $example }
settings-network-error-router = Introduza o endereço de um router, como { $example }
settings-network-error-dns = «{ $address }» não é um endereço válido
settings-network-error-search-domain = «{ $domain }» não é um domínio válido
settings-network-error-route = Introduza uma rede, como { $example }
settings-network-error-priority = Utilize um número inteiro para a prioridade
settings-network-error-username = Introduza o nome de utilizador
settings-network-error-domain = Introduza um domínio, como example.com
settings-network-error-certificate = Escolha o seu certificado
settings-network-error-private-key = Escolha a sua chave privada
settings-network-error-mtu = Utilize um número de { $lowest } a { $highest } ou deixe vazio
settings-network-error-mac = Introduza um endereço como 12:34:56:78:9A:BC
settings-network-error-password = Introduza a palavra-passe
settings-network-error-password-length = { $count ->
        [one] Utilize pelo menos { $count } caráter
       *[other] Utilize pelo menos { $count } carateres
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
settings-network-proxy-skip = Não utilizar o proxy para
settings-network-proxy-error-url = Introduza um endereço Web, como http://example.com/proxy.pac
settings-network-proxy-error-host = Introduza apenas o nome do servidor, como proxy.example.com
settings-network-proxy-error-port = Utilize uma porta de 1 a 65535
settings-network-proxy-save-failed = Não foi possível guardar as definições do proxy

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Importar de um ficheiro
    .description = Ficheiros de configuração do WireGuard, OpenVPN e outras VPN
settings-network-vpn-importing = A importar…
settings-network-wireguard = Configurar o WireGuard
    .description = Introduza os dados do fornecedor ou do servidor da VPN
settings-network-wireguard-dialog = O fornecedor da VPN ou o proprietário do servidor podem fornecer-lhe estes dados.
settings-network-wireguard-name-example = VPN de casa
settings-network-wireguard-public-key = Chave pública { $key }
settings-network-wireguard-public-key-pending = A chave pública aparece aqui para a partilhar
settings-network-wireguard-copy = Copiar chave pública
settings-network-wireguard-copied = Copiada
settings-network-wireguard-generate = Gerar uma nova chave
settings-network-wireguard-addresses = Endereços deste computador dentro da VPN
settings-network-wireguard-server-key = Chave pública do servidor
settings-network-wireguard-endpoint = Endereço do servidor
settings-network-wireguard-allowed-ips = IP permitidos
    .description = O tráfego para estes intervalos passa pela VPN
settings-network-wireguard-preshared-key = Chave pré-partilhada
settings-network-wireguard-keepalive = Keepalive
    .description = Ajuda a manter a ligação ativa atrás de um router
    .placeholder = Opcional, em segundos
settings-network-wireguard-add = Adicionar
settings-network-wireguard-adding = A adicionar…
settings-network-wireguard-error-private-key = Introduza ou gere uma chave privada
settings-network-wireguard-error-addresses = Introduza pelo menos um endereço
settings-network-wireguard-error-server-key = Introduza a chave pública do servidor
settings-network-wireguard-error-endpoint = Introduza o endereço e a porta do servidor
settings-network-wireguard-error-allowed-ips = Introduza pelo menos um intervalo
settings-network-wireguard-error-keepalive = Introduza um número de segundos

## Bluetooth panel

settings-bluetooth-hardware-off = Desligado por um interruptor físico
settings-bluetooth-power-on-failed = Não foi possível ligar o Bluetooth
settings-bluetooth-power-off-failed = Não foi possível desligar o Bluetooth
settings-bluetooth-visible = Visível para dispositivos próximos
    .description = Permite que telemóveis e computadores encontrem este computador
settings-bluetooth-visible-as = Visível como «{ $name }»
settings-bluetooth-visible-duration = Manter visível
settings-bluetooth-visible-for = { $minutes ->
        [one] Durante { $minutes } minuto
       *[other] Durante { $minutes } minutos
    }
settings-bluetooth-visible-until-off = Até ser desligado
settings-bluetooth-visible-failed = Não foi possível alterar a visibilidade deste computador
settings-bluetooth-paired = Os meus dispositivos
settings-bluetooth-nearby = Dispositivos próximos
settings-bluetooth-searching = A procurar dispositivos…
    .description = Coloque o dispositivo que pretende adicionar em modo de emparelhamento
settings-bluetooth-blocked = O Bluetooth está desligado por um interruptor físico
    .description = Utilize o interruptor ou a tecla do computador para o ligar
settings-bluetooth-details = Detalhes do dispositivo
settings-bluetooth-connected = Ligado
settings-bluetooth-connected-battery = Ligado · bateria a { $battery }
settings-bluetooth-connecting = A ligar…
settings-bluetooth-disconnecting = A desligar…
settings-bluetooth-pairing = A emparelhar…
settings-bluetooth-forget-confirm = Esquecer «{ $name }»?
    .description = Terá de o emparelhar novamente para o utilizar com este computador.
settings-bluetooth-forget = Esquecer
settings-bluetooth-cancel = Cancelar
settings-bluetooth-connect = Ligar
settings-bluetooth-disconnect = Desligar
settings-bluetooth-done = Concluído

## Bluetooth: device details

settings-bluetooth-type = Tipo
settings-bluetooth-battery = Bateria
settings-bluetooth-address = Endereço
settings-bluetooth-autoconnect = Ligar automaticamente
    .description = Sempre que estiver por perto
settings-bluetooth-kind-headphones = Auscultadores
settings-bluetooth-kind-speaker = Coluna
settings-bluetooth-kind-mouse = Rato
settings-bluetooth-kind-keyboard = Teclado
settings-bluetooth-kind-gamepad = Comando de jogos
settings-bluetooth-kind-phone = Telemóvel
settings-bluetooth-kind-computer = Computador
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Ecrã
settings-bluetooth-kind-printer = Impressora
settings-bluetooth-kind-camera = Câmara
settings-bluetooth-kind-other = Outro dispositivo

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = o dispositivo
settings-bluetooth-request-confirm = Emparelhar com { $name }?
    .description = Confirme que { $name } mostra o mesmo código.
settings-bluetooth-request-authorize = Permitir que { $name } se emparelhe?
    .description = Depois disso, { $name } poderá ligar-se a este computador.
settings-bluetooth-request-pin = Introduza o PIN para emparelhar { $name }
    .description = Muitas vezes é 0000 ou 1234. Se nenhum funcionar, consulte o manual do dispositivo.
settings-bluetooth-request-passkey = Introduza o código que { $name } mostra
    .description = Escreva os seis algarismos exatamente como aparecem.
settings-bluetooth-request-display = Emparelhar com { $name }
    .description = Escreva este código no dispositivo e prima Enter.
settings-bluetooth-pair = Emparelhar
settings-bluetooth-allow = Permitir

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Trazer os dispositivos do Windows
    .description = { $count ->
        [one] { $devices } está emparelhado no Windows. Utilize-o aqui sem o emparelhar novamente.
       *[other] { $devices } estão emparelhados no Windows. Utilize-os aqui sem os emparelhar novamente.
    }
settings-bluetooth-windows-more = { $count ->
        [one] mais { $count }
       *[other] mais { $count }
    }

## Accounts panel

settings-accounts-unavailable = As contas não estão disponíveis
    .description = O serviço de contas não está instalado neste computador
settings-accounts-online = Contas online
    .description = Cada conta é uma pasta em Cloud, na sua pasta pessoal, que todas as aplicações podem abrir. Os ficheiros são transferidos quando os abre.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud ou WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Inicie sessão novamente para continuar a utilizá-la
settings-accounts-paused-metered = Sincronização em pausa numa ligação tarifada
settings-accounts-paused-battery = Sincronização em pausa enquanto a bateria estiver fraca
settings-accounts-connecting = A ligar…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, os ficheiros mantidos continuam aqui
settings-accounts-not-connected = Sem ligação
settings-accounts-syncing = { $count ->
        [one] A sincronizar { $count } alteração
       *[other] A sincronizar { $count } alterações
    }
settings-accounts-name = Nome
settings-accounts-folder = Pasta
settings-accounts-server = Servidor
settings-accounts-storage = Armazenamento
settings-accounts-storage-used = { $used } de { $total } utilizados
settings-accounts-on-device = Neste dispositivo
settings-accounts-kept = { $count ->
        [0] Nenhum item mantido, o resto é transferido ao abrir
        [one] { $count } item mantido, o resto é transferido ao abrir
       *[other] { $count } itens mantidos, o resto é transferido ao abrir
    }
settings-accounts-on-demand = Os ficheiros são transferidos quando os abre
settings-accounts-sign-in-again = Iniciar sessão novamente
settings-accounts-keep = Manter
settings-accounts-remove = Remover
settings-accounts-remove-confirm = Remover deste computador
settings-accounts-removing = A remover…
settings-accounts-remove-note = Os seus ficheiros ficam no { $provider }. As alterações feitas aqui são enviadas primeiro.

## Accounts: providers

settings-accounts-provider-icloud = A sua Conta Apple, confirmada com um código do iPhone, iPad ou Mac
settings-accounts-provider-onedrive = Uma conta Microsoft pessoal, de trabalho ou escolar, no browser
settings-accounts-provider-dropbox = Uma conta Dropbox, no browser
settings-accounts-provider-nextcloud = Um servidor próprio ou da sua organização
settings-accounts-provider-webdav = Qualquer servidor compatível com WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Iniciar sessão novamente em { $account }
settings-accounts-browser = O browser abre-se para iniciar sessão na conta { $provider }. O Luft nunca vê a sua palavra-passe.
settings-accounts-password-for = Introduza a palavra-passe de { $user }.
settings-accounts-apple-account = Conta Apple
settings-accounts-password = Palavra-passe
settings-accounts-app-password = Palavra-passe de aplicação
settings-accounts-user = Nome de utilizador
settings-accounts-apple-note = Utilize a palavra-passe da sua Conta Apple; as palavras-passe específicas de aplicações não funcionam aqui. Em seguida, a Apple mostra um código no seu iPhone, iPad ou Mac.
settings-accounts-nextcloud-browser = O browser abre-se para iniciar sessão no seu servidor e dar acesso ao Luft.
settings-accounts-use-app-password = Utilizar antes uma palavra-passe de aplicação
settings-accounts-error-server = Introduza o endereço do servidor
settings-accounts-error-apple-account = Introduza o e-mail da sua Conta Apple
settings-accounts-error-user = Introduza o nome de utilizador
settings-accounts-error-password = Introduza a palavra-passe
settings-accounts-cancel = Cancelar
settings-accounts-back = Voltar
settings-accounts-continue-in-browser = Continuar no browser
settings-accounts-sign-in = Iniciar sessão
settings-accounts-try-again = Tentar novamente
settings-accounts-continue = Continuar
settings-accounts-working = A comunicar com { $provider }…
settings-accounts-finish-in-browser = Conclua o início de sessão na conta { $provider } no browser. O Luft nunca vê a sua palavra-passe, e esta página atualiza-se sozinha quando terminar.
settings-accounts-no-browser = Nenhum browser foi aberto. Copie a ligação e abra-a num browser.
settings-accounts-open-again = Abrir a página novamente
settings-accounts-copy-link = Copiar a ligação
settings-accounts-copied = Copiada
settings-accounts-code = Código de verificação
    .placeholder = Código de 6 algarismos
settings-accounts-text-me = Receber antes um código por SMS
settings-accounts-choose-phone = Para que número deve a Apple enviar o código?
    .description = Enviar uma mensagem de texto
settings-accounts-approve = A sua Conta Apple utiliza a Proteção avançada de dados. Aprove o pedido no iPhone, iPad ou Mac para permitir que este computador abra o iCloud Drive.
