### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Сачувај
settings-network-saving = Чување…
settings-network-cancel = Откажи
settings-network-connect = Повежи
settings-network-disconnect = Прекини везу
settings-network-optional = Необавезно
settings-network-automatic = Аутоматски
settings-network-name = Назив
settings-network-password = Лозинка
settings-network-password-saved = Сачувана лозинка
settings-network-username = Корисничко име
settings-network-router = Рутер
settings-network-dns-servers = DNS сервери
settings-network-private-key = Приватни кључ
settings-network-connection-settings = Подешавања везе
settings-network-connect-failed = Повезивање није успело

## Network: connection states

settings-network-link-connected = Повезано
settings-network-link-connecting = Повезивање…
settings-network-link-disconnected = Није повезано
settings-network-link-unplugged = Кабл није прикључен

## Network: Wi‑Fi security types

settings-network-security-open = Без заштите
settings-network-security-owe = Побољшана отворена
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Пословна

## Network: signal and radio details

settings-network-signal-excellent = Одличан
settings-network-signal-good = Добар
settings-network-signal-fair = Солидан
settings-network-signal-weak = Слаб
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · канал { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Сигнал
settings-network-detail-band = Опсег
settings-network-detail-speed = Брзина везе
settings-network-detail-access-point = Приступна тачка
settings-network-detail-security = Безбедност
settings-network-detail-ipv4 = IP адреса
settings-network-detail-ipv6 = IPv6 адреса
settings-network-detail-router = Рутер
settings-network-detail-dns = DNS
settings-network-detail-mac = Хардверска адреса

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Искључено хардверским прекидачем
settings-network-wifi-connected = Повезано на { $network }
settings-network-airplane = Режим рада у авиону
    .description = Искључује све бежичне везе
settings-network-airplane-hardware = Укључено хардверским прекидачем
settings-network-known = Познате мреже
    .description = Мреже на које се овај рачунар већ повезивао, у домету или не
settings-network-known-count = { $count ->
        [one] { $count } сачувана мрежа
        [few] { $count } сачуване мреже
       *[other] { $count } сачуваних мрежа
    }
settings-network-known-in-range = У домету
settings-network-ethernet = Етернет
settings-network-ethernet-named = Етернет ({ $name })
settings-network-wired-connected = Повезано · { $speed }
settings-network-empty = Нема мрежних веза
    .description = Прикључите мрежни кабл или Wi‑Fi адаптер да бисте се повезали на интернет
settings-network-proxy = Прокси
    .description = Шаље веб-саобраћај преко другог сервера, што је често потребно на мрежама на послу или у школи.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi мреже
settings-network-wifi-saved = Сачувана
settings-network-wifi-enterprise = Пријавите се пословним или школским налогом
settings-network-wifi-connect-failed = Повезивање на ову мрежу није успело
settings-network-wifi-saved-password-failed = Сачувана лозинка не ради. Унесите је поново.
settings-network-wifi-settings = Подешавања мреже
settings-network-wifi-searching = Тражење мрежа…
settings-network-hidden = Повежи се на скривену мрежу
    .description = Унесите назив мреже и начин на који је заштићена.
settings-network-hidden-name = Назив мреже

## Network: joining a Wi‑Fi network

settings-network-join = Повезивање на „{ $network }“
settings-network-join-enterprise = Пријавите се пословним или школским налогом.
settings-network-join-password = Унесите лозинку за ову мрежу.
settings-network-join-failed = Повезивање на ову мрежу није успело.
settings-network-join-sign-in-failed = Пријава није успела. Проверите корисничко име и лозинку.
settings-network-join-wrong-password = Лозинка не ради. Проверите је и покушајте поново.

## Network: connection settings page

settings-network-forget = Заборави ову мрежу
    .description = Уклања њену лозинку и подешавања са овог рачунара
    .button = Заборави
settings-network-remove-vpn = Уклони овај VPN
settings-network-remove-connection = Уклони ову везу
settings-network-remove-description = Брише њена подешавања са овог рачунара
settings-network-remove = Уклони

settings-network-general = Опште
settings-network-autoconnect = Аутоматско повезивање
settings-network-autoconnect-wifi = Повезује се на ову мрежу кад год је у домету
settings-network-autoconnect-wired = Повезује се чим се прикључи кабл
settings-network-autoconnect-vpn = Повезује се кад год је овај рачунар на мрежи
settings-network-autoconnect-other = Повезује се кад год је доступна
settings-network-all-users = Доступно свима
    .description = Може да је користи свако ко се пријави на овом рачунару
settings-network-metered = Ограничена веза
    .description = Апликације и ажурирања се уздржавају од великих преузимања
settings-network-metered-automatic = Препознај аутоматски
settings-network-metered-yes = Ограничена
settings-network-metered-no = Неограничена

settings-network-security = Безбедност
settings-network-security-type = Врста заштите

settings-network-advanced = Напредно
settings-network-private-address = Приватна адреса
    .description = Отежава праћење овог рачунара на овој мрежи
settings-network-hardware-address = Хардверска адреса
    .description = Адреса коју овај рачунар показује мрежи
settings-network-mac-random = Нова адреса сваки пут
settings-network-mac-stable = Иста адреса за ову мрежу
settings-network-mac-private-off = Искључено
settings-network-mac-builtin = Уграђена адреса
settings-network-mac-custom = Прилагођена адреса
settings-network-mtu = Највећа величина пакета (MTU)
    .description = Оставите празно, осим ако мрежа захтева одређену величину
    .label = MTU

## Network: IPv4 and IPv6 settings

settings-network-ip-method = Метод
    .label = { $family } метод
settings-network-ip-dhcp = Аутоматски, само адресе
settings-network-ip-manual = Ручно
settings-network-ip-link-local = Само локална веза
settings-network-ip-shared = Дељено са другим уређајима
settings-network-ip-ignore = Без управљања
settings-network-ip-disabled = Искључено
settings-network-ip-addresses = Адресе
    .description = Свака са својим префиксом, нпр. { $example }
settings-network-ip-address = Адреса { $number }
settings-network-ip-remove-address = Уклони адресу
settings-network-ip-add-address = Додај адресу
settings-network-ip-router = { $family } рутер
settings-network-ip-automatic-dns = Аутоматски DNS
    .description = Користи DNS сервере које предлаже ова мрежа
settings-network-ip-dns-first = Користе се пре предложених
settings-network-ip-dns-separate = Раздвојите адресе зарезима
settings-network-ip-dns-servers = { $family } DNS сервери
settings-network-ip-search-domains = Домени за претрагу
    .description = Користе се кад назив нема домен, нпр. „printer“
    .label = { $family } домени за претрагу
settings-network-ip-automatic-routes = Аутоматске руте
    .description = Користи руте које предлаже ова мрежа
settings-network-ip-routes = Руте
    .description = Шаље саобраћај за неке мреже преко другог рутера
settings-network-ip-add-route = Додај руту
settings-network-route-network = Мрежа
settings-network-route-priority = Приоритет
settings-network-route-remove = Уклони руту

## Network: work or school (802.1X) sign-in

settings-network-eap = Потврда идентитета
settings-network-eap-peap = Заштићени EAP (PEAP)
settings-network-eap-ttls = Тунеловани TLS (TTLS)
settings-network-eap-tls = Сертификат (TLS)
settings-network-eap-inner = Унутрашња потврда идентитета
settings-network-client-certificate = Ваш сертификат
settings-network-private-key-password = Лозинка приватног кључа
    .placeholder = Ако кључ има лозинку
settings-network-anonymous-identity = Анонимни идентитет
    .description = Оставите празно, осим ако мрежа то захтева
settings-network-ca = CA сертификат
    .description = Потврђује да се повезујете на праву мрежу
settings-network-ca-system = Користи системске сертификате
settings-network-ca-file = Изабери датотеку…
settings-network-ca-another-file = Изабери другу датотеку…
settings-network-ca-none = Не проверавај
settings-network-choose-file = Изабери…
settings-network-server-domain = Домен сервера
    .description = Повезује се само на сервере у овом домену

## Network: form errors

settings-network-error-name = Унесите назив
settings-network-error-no-addresses = Додајте бар једну адресу
settings-network-error-address = Унесите адресу са префиксом, нпр. { $example }
settings-network-error-router = Унесите адресу рутера, нпр. { $example }
settings-network-error-dns = „{ $address }“ није исправна адреса
settings-network-error-search-domain = „{ $domain }“ није исправан домен
settings-network-error-route = Унесите мрежу, нпр. { $example }
settings-network-error-priority = Приоритет мора бити цео број
settings-network-error-username = Унесите корисничко име
settings-network-error-domain = Унесите домен, нпр. example.com
settings-network-error-certificate = Изаберите свој сертификат
settings-network-error-private-key = Изаберите свој приватни кључ
settings-network-error-mtu = Унесите број од { $lowest } до { $highest } или оставите празно
settings-network-error-mac = Унесите адресу као што је 12:34:56:78:9A:BC
settings-network-error-password = Унесите лозинку
settings-network-error-password-length = { $count ->
        [one] Унесите бар { $count } знак
        [few] Унесите бар { $count } знака
       *[other] Унесите бар { $count } знакова
    }

## Network: proxy

settings-network-proxy-off = Искључено
settings-network-proxy-manual = Ручно
settings-network-proxy-url = Адреса конфигурације
settings-network-proxy-http = Веб (HTTP)
settings-network-proxy-https = Безбедни веб (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Сервер
    .label = { $protocol } – сервер
settings-network-proxy-port = Порт
    .label = { $protocol } – порт
settings-network-proxy-skip = Не користи прокси за
settings-network-proxy-error-url = Унесите веб-адресу, нпр. http://example.com/proxy.pac
settings-network-proxy-error-host = Унесите само назив сервера, нпр. proxy.example.com
settings-network-proxy-error-port = Порт мора бити од 1 до 65535
settings-network-proxy-save-failed = Чување подешавања проксија није успело

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Увези из датотеке
    .description = WireGuard, OpenVPN и друге датотеке са VPN конфигурацијом
settings-network-vpn-importing = Увожење…
settings-network-wireguard = Подеси WireGuard
    .description = Унесите податке које сте добили од VPN провајдера или са сервера
settings-network-wireguard-dialog = Ове податке можете добити од VPN провајдера или власника сервера.
settings-network-wireguard-name-example = Кућни VPN
settings-network-wireguard-public-key = Јавни кључ { $key }
settings-network-wireguard-public-key-pending = Овде ће се појавити јавни кључ који треба да поделите
settings-network-wireguard-copy = Копирај јавни кључ
settings-network-wireguard-copied = Копирано
settings-network-wireguard-generate = Направи нови кључ
settings-network-wireguard-addresses = Адресе овог рачунара унутар VPN мреже
settings-network-wireguard-server-key = Јавни кључ сервера
settings-network-wireguard-endpoint = Адреса сервера
settings-network-wireguard-allowed-ips = Дозвољене IP адресе
    .description = Саобраћај ка овим опсезима иде кроз VPN
settings-network-wireguard-preshared-key = Унапред дељени кључ
settings-network-wireguard-keepalive = Одржавање везе
    .description = Помаже да веза остане активна иза рутера
    .placeholder = Необавезно, у секундама
settings-network-wireguard-add = Додај
settings-network-wireguard-adding = Додавање…
settings-network-wireguard-error-private-key = Унесите или направите приватни кључ
settings-network-wireguard-error-addresses = Унесите бар једну адресу
settings-network-wireguard-error-server-key = Унесите јавни кључ сервера
settings-network-wireguard-error-endpoint = Унесите адресу и порт сервера
settings-network-wireguard-error-allowed-ips = Унесите бар један опсег
settings-network-wireguard-error-keepalive = Унесите број секунди

## Bluetooth panel

settings-bluetooth-hardware-off = Искључено хардверским прекидачем
settings-bluetooth-power-on-failed = Bluetooth није могао да се укључи
settings-bluetooth-power-off-failed = Bluetooth није могао да се искључи
settings-bluetooth-visible = Видљиво уређајима у близини
    .description = Омогућава телефонима и рачунарима да пронађу овај рачунар
settings-bluetooth-visible-as = Приказује се као „{ $name }“
settings-bluetooth-visible-duration = Остани видљив
settings-bluetooth-visible-for = { $minutes ->
        [one] { $minutes } минут
        [few] { $minutes } минута
       *[other] { $minutes } минута
    }
settings-bluetooth-visible-until-off = Док се не искључи
settings-bluetooth-visible-failed = Промена видљивости овог рачунара није успела
settings-bluetooth-paired = Моји уређаји
settings-bluetooth-nearby = Уређаји у близини
settings-bluetooth-searching = Тражење уређаја…
    .description = Ставите уређај који желите да додате у режим упаривања
settings-bluetooth-blocked = Bluetooth је искључен хардверским прекидачем
    .description = Укључите га прекидачем или тастером на рачунару
settings-bluetooth-details = Детаљи уређаја
settings-bluetooth-connected = Повезано
settings-bluetooth-connected-battery = Повезано · батерија { $battery }
settings-bluetooth-connecting = Повезивање…
settings-bluetooth-disconnecting = Прекидање везе…
settings-bluetooth-pairing = Упаривање…
settings-bluetooth-forget-confirm = Заборавити „{ $name }“?
    .description = Мораћете поново да га упарите да бисте га користили са овим рачунаром.
settings-bluetooth-forget = Заборави
settings-bluetooth-cancel = Откажи
settings-bluetooth-connect = Повежи
settings-bluetooth-disconnect = Прекини везу
settings-bluetooth-done = Готово

## Bluetooth: device details

settings-bluetooth-type = Врста
settings-bluetooth-battery = Батерија
settings-bluetooth-address = Адреса
settings-bluetooth-autoconnect = Аутоматско повезивање
    .description = Кад год је у близини
settings-bluetooth-kind-headphones = Слушалице
settings-bluetooth-kind-speaker = Звучник
settings-bluetooth-kind-mouse = Миш
settings-bluetooth-kind-keyboard = Тастатура
settings-bluetooth-kind-gamepad = Контролер за игре
settings-bluetooth-kind-phone = Телефон
settings-bluetooth-kind-computer = Рачунар
settings-bluetooth-kind-tablet = Таблет
settings-bluetooth-kind-display = Екран
settings-bluetooth-kind-printer = Штампач
settings-bluetooth-kind-camera = Камера
settings-bluetooth-kind-other = Други уређај

## Bluetooth: pairing requests

settings-bluetooth-request-unnamed = уређај
settings-bluetooth-request-confirm = Упарити { $name }?
    .description = Проверите да ли { $name } приказује исти код.
settings-bluetooth-request-authorize = Дозволити упаривање за { $name }?
    .description = Након тога ће { $name } моћи да се повеже са овим рачунаром.
settings-bluetooth-request-pin = Унесите PIN за { $name }
    .description = Често је 0000 или 1234. Ако ниједан не ради, потражите га у упутству уређаја.
settings-bluetooth-request-passkey = Унесите код који приказује { $name }
    .description = Откуцајте шест цифара тачно онако како су приказане.
settings-bluetooth-request-display = Упаривање: { $name }
    .description = Откуцајте овај код за { $name }, па притисните Enter.
settings-bluetooth-pair = Упари
settings-bluetooth-allow = Дозволи

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Пренесите уређаје из система Windows
    .description = { $count ->
        [one] Уређај { $devices } је упарен у систему Windows. Користите га овде без поновног упаривања.
        [few] Уређаји { $devices } су упарени у систему Windows. Користите их овде без поновног упаривања.
       *[other] Уређаји { $devices } су упарени у систему Windows. Користите их овде без поновног упаривања.
    }
settings-bluetooth-windows-more = { $count ->
        [one] још { $count }
        [few] још { $count }
       *[other] још { $count }
    }
