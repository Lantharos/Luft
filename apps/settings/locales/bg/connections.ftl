### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Запази
settings-network-saving = Запазване…
settings-network-cancel = Отказ
settings-network-connect = Свържи
settings-network-disconnect = Прекъсни
settings-network-optional = По избор
settings-network-automatic = Автоматично
settings-network-name = Име
settings-network-password = Парола
settings-network-password-saved = Запазена парола
settings-network-username = Потребителско име
settings-network-router = Рутер
settings-network-dns-servers = DNS сървъри
settings-network-private-key = Частен ключ
settings-network-connection-settings = Настройки на връзката
settings-network-connect-failed = Неуспешно свързване

## Network: connection states

settings-network-link-connected = Свързано
settings-network-link-connecting = Свързване…
settings-network-link-disconnected = Не е свързано
settings-network-link-unplugged = Кабелът е изключен

## Network: Wi‑Fi security types

settings-network-security-open = Без защита
settings-network-security-owe = Подобрена отворена
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
settings-network-security-enterprise = Корпоративна

## Network: signal and radio details

settings-network-signal-excellent = Отличен
settings-network-signal-good = Добър
settings-network-signal-fair = Среден
settings-network-signal-weak = Слаб
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } GHz · канал { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Сигнал
settings-network-detail-band = Честотна лента
settings-network-detail-speed = Скорост на връзката
settings-network-detail-access-point = Точка за достъп
settings-network-detail-security = Защита
settings-network-detail-ipv4 = IP адрес
settings-network-detail-ipv6 = IPv6 адрес
settings-network-detail-router = Рутер
settings-network-detail-dns = DNS
settings-network-detail-mac = Хардуерен адрес

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Изключено с хардуерен превключвател
settings-network-wifi-connected = Свързано с { $network }
settings-network-airplane = Самолетен режим
    .description = Изключва всички безжични връзки
settings-network-airplane-hardware = Включен с хардуерен превключвател
settings-network-known = Известни мрежи
    .description = Мрежи, към които компютърът се е свързвал, независимо дали са наблизо
settings-network-known-count = { $count ->
        [one] { $count } запазена мрежа
       *[other] { $count } запазени мрежи
    }
settings-network-known-in-range = В обхват
settings-network-wired = Кабелна връзка
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Свързано · { $speed }
settings-network-empty = Няма мрежови връзки
    .description = Включете мрежов кабел или Wi‑Fi адаптер, за да се свържете с интернет
settings-network-proxy = Прокси
    .description = Уеб трафикът минава през друг сървър. Често е нужно в мрежите на работа или в училище.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi мрежи
settings-network-wifi-saved = Запазена
settings-network-wifi-enterprise = Вход със служебен или училищен акаунт
settings-network-wifi-connect-failed = Неуспешно свързване с тази мрежа
settings-network-wifi-saved-password-failed = Запазената парола не проработи. Въведете я отново.
settings-network-wifi-settings = Настройки на мрежата
settings-network-wifi-searching = Търсене на мрежи…
settings-network-hidden = Свързване със скрита мрежа
    .description = Въведете името на мрежата и вида на защитата ѝ.
settings-network-hidden-name = Име на мрежата

## Network: joining a Wi‑Fi network

settings-network-join = Свързване с „{ $network }“
settings-network-join-enterprise = Влезте със служебния или училищния си акаунт.
settings-network-join-password = Въведете паролата за тази мрежа.
settings-network-join-failed = Неуспешно свързване с тази мрежа.
settings-network-join-sign-in-failed = Неуспешен вход. Проверете потребителското име и паролата.
settings-network-join-wrong-password = Паролата не проработи. Проверете я и опитайте отново.

## Network: connection settings page

settings-network-forget = Забравяне на тази мрежа
    .description = Премахва паролата и настройките ѝ от този компютър
    .button = Забрави
settings-network-remove-vpn = Премахване на тази VPN връзка
settings-network-remove-connection = Премахване на тази връзка
settings-network-remove-description = Изтрива настройките ѝ от този компютър
settings-network-remove = Премахни

settings-network-general = Общи
settings-network-autoconnect = Автоматично свързване
settings-network-autoconnect-wifi = Свързване с тази мрежа, щом е в обхват
settings-network-autoconnect-wired = Свързване веднага щом се включи кабел
settings-network-autoconnect-vpn = Свързване винаги, когато компютърът е онлайн
settings-network-autoconnect-other = Свързване винаги, когато е налична
settings-network-all-users = Достъпна за всички
    .description = Всеки, който влиза в този компютър, може да я използва
settings-network-metered = Връзка с отчитане
    .description = Приложенията и актуализациите избягват големите изтегляния
settings-network-metered-automatic = Автоматично откриване
settings-network-metered-yes = С отчитане
settings-network-metered-no = Без отчитане

settings-network-security = Защита
settings-network-security-type = Вид защита

settings-network-advanced = Разширени
settings-network-private-address = Частен адрес
    .description = Затруднява проследяването на компютъра в тази мрежа
settings-network-hardware-address = Хардуерен адрес
    .description = Адресът, с който компютърът се представя в мрежата
settings-network-mac-random = Нов адрес всеки път
settings-network-mac-stable = Един и същ адрес за тази мрежа
settings-network-mac-private-off = Изключено
settings-network-mac-builtin = Вграден адрес
settings-network-mac-custom = Собствен адрес
settings-network-mtu = Максимален размер на пакета (MTU)
    .description = Оставете празно, освен ако мрежата не изисква определен размер
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Метод
    .label = Метод за { $family }
settings-network-ip-dhcp = Автоматично, само адреси
settings-network-ip-manual = Ръчно
settings-network-ip-link-local = Само локална връзка
settings-network-ip-shared = Споделено с други устройства
settings-network-ip-ignore = Без управление
settings-network-ip-disabled = Изключено
settings-network-ip-addresses = Адреси
    .description = Всеки с префикса си, например { $example }
settings-network-ip-address = Адрес { $number }
settings-network-ip-remove-address = Премахни адреса
settings-network-ip-add-address = Добави адрес
settings-network-ip-router = Рутер за { $family }
settings-network-ip-automatic-dns = Автоматичен DNS
    .description = Използване на DNS сървърите, които мрежата предлага
settings-network-ip-dns-first = Използват се преди предложените
settings-network-ip-dns-separate = Разделете адресите със запетаи
settings-network-ip-dns-servers = DNS сървъри за { $family }
settings-network-ip-search-domains = Домейни за търсене
    .description = Използват се, когато дадено име няма домейн, например „printer“
    .label = { $family } домейни за търсене
settings-network-ip-automatic-routes = Автоматични маршрути
    .description = Използване на маршрутите, които мрежата предлага
settings-network-ip-routes = Маршрути
    .description = Трафикът към някои мрежи минава през друг рутер
settings-network-ip-add-route = Добави маршрут
settings-network-route-network = Мрежа
settings-network-route-priority = Приоритет
settings-network-route-remove = Премахни маршрута

## Network: work or school (802.1X) sign-in

settings-network-eap = Удостоверяване
settings-network-eap-peap = Защитен EAP (PEAP)
settings-network-eap-ttls = Тунелиран TLS (TTLS)
settings-network-eap-tls = Сертификат (TLS)
settings-network-eap-inner = Вътрешно удостоверяване
settings-network-client-certificate = Вашият сертификат
settings-network-private-key-password = Парола за частния ключ
    .placeholder = Ако ключът има такава
settings-network-anonymous-identity = Анонимна самоличност
    .description = Оставете празно, освен ако мрежата не я изисква
settings-network-ca = Сертификат на CA
    .description = Потвърждава, че се свързвате с истинската мрежа
settings-network-ca-system = Системни сертификати
settings-network-ca-file = Избери файл…
settings-network-ca-another-file = Избери друг файл…
settings-network-ca-none = Без проверка
settings-network-choose-file = Избери…
settings-network-server-domain = Домейн на сървъра
    .description = Свързване само със сървъри в този домейн

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Въведете име
settings-network-error-no-addresses = Добавете поне един адрес
settings-network-error-address = Въведете адрес с префикса му, например { $example }
settings-network-error-router = Въведете адрес на рутер, например { $example }
settings-network-error-dns = „{ $address }“ не е валиден адрес
settings-network-error-search-domain = „{ $domain }“ не е валиден домейн
settings-network-error-route = Въведете мрежа, например { $example }
settings-network-error-priority = Използвайте цяло число за приоритета
settings-network-error-username = Въведете потребителското си име
settings-network-error-domain = Въведете домейн, например example.com
settings-network-error-certificate = Изберете сертификата си
settings-network-error-private-key = Изберете частния си ключ
settings-network-error-mtu = Използвайте число от { $lowest } до { $highest } или оставете полето празно
settings-network-error-mac = Въведете адрес като 12:34:56:78:9A:BC
settings-network-error-password = Въведете паролата си
settings-network-error-password-length = { $count ->
        [one] Използвайте поне { $count } знак
       *[other] Използвайте поне { $count } знака
    }

## Network: proxy

settings-network-proxy-off = Изключено
settings-network-proxy-manual = Ръчно
settings-network-proxy-url = Адрес на конфигурацията
settings-network-proxy-http = Уеб (HTTP)
settings-network-proxy-https = Защитен уеб (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Сървър
    .label = Сървър за { $protocol }
settings-network-proxy-port = Порт
    .label = Порт за { $protocol }
settings-network-proxy-skip = Без прокси за
settings-network-proxy-error-url = Въведете уеб адрес, например http://example.com/proxy.pac
settings-network-proxy-error-host = Въведете само името на сървъра, например proxy.example.com
settings-network-proxy-error-port = Използвайте порт от 1 до 65535
settings-network-proxy-save-failed = Настройките за прокси не можаха да бъдат запазени

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Импортиране от файл
    .description = Конфигурационни файлове за WireGuard, OpenVPN и други VPN
settings-network-vpn-importing = Импортиране…
settings-network-wireguard = Настройване на WireGuard
    .description = Въведете данните от доставчика на VPN или от сървъра
settings-network-wireguard-dialog = Доставчикът на VPN или собственикът на сървъра може да ви даде тези данни.
settings-network-wireguard-name-example = Домашна VPN
settings-network-wireguard-public-key = Публичен ключ { $key }
settings-network-wireguard-public-key-pending = Публичният ключ ще се покаже тук, за да го споделите
settings-network-wireguard-copy = Копирай публичния ключ
settings-network-wireguard-copied = Копирано
settings-network-wireguard-generate = Генерирай нов ключ
settings-network-wireguard-addresses = Адреси на компютъра във VPN мрежата
settings-network-wireguard-server-key = Публичен ключ на сървъра
settings-network-wireguard-endpoint = Адрес на сървъра
settings-network-wireguard-allowed-ips = Разрешени IP адреси
    .description = Трафикът към тези диапазони минава през VPN
settings-network-wireguard-preshared-key = Предварително споделен ключ
settings-network-wireguard-keepalive = Поддържане на връзката
    .description = Помага връзката да не прекъсва зад рутер
    .placeholder = По избор, в секунди
settings-network-wireguard-add = Добави
settings-network-wireguard-adding = Добавяне…
settings-network-wireguard-error-private-key = Въведете или генерирайте частен ключ
settings-network-wireguard-error-addresses = Въведете поне един адрес
settings-network-wireguard-error-server-key = Въведете публичния ключ на сървъра
settings-network-wireguard-error-endpoint = Въведете адреса и порта на сървъра
settings-network-wireguard-error-allowed-ips = Въведете поне един диапазон
settings-network-wireguard-error-keepalive = Въведете брой секунди

## Bluetooth panel

settings-bluetooth-hardware-off = Изключено с хардуерен превключвател
settings-bluetooth-power-on-failed = Bluetooth не можа да се включи
settings-bluetooth-power-off-failed = Bluetooth не можа да се изключи
settings-bluetooth-visible = Видимост за устройства наблизо
    .description = Позволява на телефони и компютри да откриват този компютър
settings-bluetooth-visible-as = Показва се като „{ $name }“
settings-bluetooth-visible-duration = Продължителност на видимостта
settings-bluetooth-visible-for = { $minutes ->
        [one] За { $minutes } минута
       *[other] За { $minutes } минути
    }
settings-bluetooth-visible-until-off = До изключване
settings-bluetooth-visible-failed = Видимостта на компютъра не можа да се промени
settings-bluetooth-paired = Моите устройства
settings-bluetooth-nearby = Устройства наблизо
settings-bluetooth-searching = Търсене на устройства…
    .description = Включете режима на сдвояване на устройството, което искате да добавите
settings-bluetooth-blocked = Bluetooth е изключен с хардуерен превключвател
    .description = Използвайте превключвателя или клавиша на компютъра, за да го включите
settings-bluetooth-details = Подробности за устройството
settings-bluetooth-connected = Свързано
settings-bluetooth-connected-battery = Свързано · батерия { $battery }
settings-bluetooth-connecting = Свързване…
settings-bluetooth-disconnecting = Прекъсване на връзката…
settings-bluetooth-pairing = Сдвояване…
settings-bluetooth-forget-confirm = Да се забрави ли „{ $name }“?
    .description = Ще трябва да го сдвоите отново, за да го използвате с този компютър.
settings-bluetooth-forget = Забрави
settings-bluetooth-cancel = Отказ
settings-bluetooth-connect = Свържи
settings-bluetooth-disconnect = Прекъсни
settings-bluetooth-done = Готово

## Bluetooth: device details

settings-bluetooth-type = Тип
settings-bluetooth-battery = Батерия
settings-bluetooth-address = Адрес
settings-bluetooth-autoconnect = Автоматично свързване
    .description = Винаги, когато е наблизо
settings-bluetooth-kind-headphones = Слушалки
settings-bluetooth-kind-speaker = Високоговорител
settings-bluetooth-kind-mouse = Мишка
settings-bluetooth-kind-keyboard = Клавиатура
settings-bluetooth-kind-gamepad = Контролер за игри
settings-bluetooth-kind-phone = Телефон
settings-bluetooth-kind-computer = Компютър
settings-bluetooth-kind-tablet = Таблет
settings-bluetooth-kind-display = Екран
settings-bluetooth-kind-printer = Принтер
settings-bluetooth-kind-camera = Камера
settings-bluetooth-kind-other = Друго устройство

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = устройството
settings-bluetooth-request-confirm = Сдвояване с { $name }?
    .description = Уверете се, че на { $name } се показва същият код.
settings-bluetooth-request-authorize = Да се разреши ли сдвояване с { $name }?
    .description = След това { $name } ще може да се свързва с този компютър.
settings-bluetooth-request-pin = Въведете ПИН кода за { $name }
    .description = Често е 0000 или 1234. Ако нито един не работи, потърсете го в ръководството на устройството.
settings-bluetooth-request-passkey = Въведете кода, показан на { $name }
    .description = Въведете шестте цифри точно както са изписани.
settings-bluetooth-request-display = Сдвояване с { $name }
    .description = Въведете този код на { $name } и натиснете Enter.
settings-bluetooth-pair = Сдвои
settings-bluetooth-allow = Разреши

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Пренесете устройствата си от Windows
    .description = { $count ->
        [one] В Windows е сдвоено: { $devices }. Използвайте го тук без ново сдвояване.
       *[other] В Windows са сдвоени: { $devices }. Използвайте ги тук без ново сдвояване.
    }
settings-bluetooth-windows-more = { $count ->
        [one] още { $count }
       *[other] още { $count }
    }

## Accounts panel

settings-accounts-unavailable = Акаунтите не са налични
    .description = Услугата за акаунти не е инсталирана на този компютър
settings-accounts-online = Онлайн акаунти
    .description = Всеки акаунт е папка в Cloud в личната ви папка, която всяко приложение може да отвори. Файловете се изтеглят, когато ги отворите.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud или WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Влезте отново, за да продължите да го използвате
settings-accounts-paused-metered = Синхронизирането е на пауза при връзка с отчитане
settings-accounts-paused-battery = Синхронизирането е на пауза, докато батерията е слаба
settings-accounts-connecting = Свързване…
settings-accounts-offline = Офлайн
settings-accounts-offline-kept = Офлайн, запазените файлове са налични
settings-accounts-not-connected = Няма връзка
settings-accounts-syncing = { $count ->
        [one] Синхронизиране на { $count } промяна
       *[other] Синхронизиране на { $count } промени
    }
settings-accounts-name = Име
settings-accounts-folder = Папка
settings-accounts-server = Сървър
settings-accounts-storage = Хранилище
settings-accounts-storage-used = Използвани { $used } от { $total }
settings-accounts-on-device = На това устройство
settings-accounts-kept = { $count ->
        [one] { $count } запазен елемент, останалото се изтегля при отваряне
       *[other] { $count } запазени елемента, останалото се изтегля при отваряне
    }
settings-accounts-on-demand = Файловете се изтеглят, когато ги отворите
settings-accounts-sign-in-again = Влез отново
settings-accounts-keep = Остави
settings-accounts-remove = Премахни
settings-accounts-remove-confirm = Премахни от компютъра
settings-accounts-removing = Премахване…
settings-accounts-remove-note = Файловете ви остават в { $provider }. Промените, направени тук, първо се качват.

## Accounts: providers

settings-accounts-provider-icloud = Вашият акаунт в Apple, потвърден с код от iPhone, iPad или Mac
settings-accounts-provider-onedrive = Личен, служебен или училищен акаунт в Microsoft, в браузъра
settings-accounts-provider-dropbox = Акаунт в Dropbox, в браузъра
settings-accounts-provider-nextcloud = Ваш собствен сървър или сървърът на организацията ви
settings-accounts-provider-webdav = Всеки сървър, който поддържа WebDAV

## Accounts: signing in

settings-accounts-sign-in-again-title = Повторен вход в { $account }
settings-accounts-browser = Браузърът ви ще се отвори, за да влезете с { $provider }. Luft никога не вижда паролата ви.
settings-accounts-password-for = Въведете паролата за { $user }.
settings-accounts-apple-account = Акаунт в Apple
settings-accounts-password = Парола
settings-accounts-app-password = Парола за приложение
settings-accounts-user = Потребителско име
settings-accounts-apple-note = Използвайте паролата за акаунта си в Apple. Паролите за отделни приложения не работят тук. След това Apple показва код на вашия iPhone, iPad или Mac.
settings-accounts-nextcloud-browser = Браузърът ви ще се отвори, за да влезете в сървъра си и да разрешите достъп на Luft.
settings-accounts-use-app-password = Използвай парола за приложение
settings-accounts-error-server = Въведете адреса на сървъра
settings-accounts-error-apple-account = Въведете имейла на акаунта си в Apple
settings-accounts-error-user = Въведете потребителското име
settings-accounts-error-password = Въведете паролата
settings-accounts-cancel = Отказ
settings-accounts-back = Назад
settings-accounts-continue-in-browser = Продължи в браузъра
settings-accounts-sign-in = Вход
settings-accounts-try-again = Опитай отново
settings-accounts-continue = Продължи
settings-accounts-working = Връзка с { $provider }…
settings-accounts-finish-in-browser = Завършете влизането с { $provider } в браузъра си. Luft никога не вижда паролата ви, а тази страница ще се обнови сама, щом приключите.
settings-accounts-no-browser = Браузърът не се отвори. Копирайте връзката и я отворете в браузър.
settings-accounts-open-again = Отвори страницата отново
settings-accounts-copy-link = Копирай връзката
settings-accounts-copied = Копирано
settings-accounts-code = Код за потвърждение
    .placeholder = 6-цифрен код
settings-accounts-text-me = Изпрати ми код с SMS
settings-accounts-choose-phone = На кой номер Apple да изпрати кода?
    .description = Изпращане на SMS
settings-accounts-approve = Акаунтът ви в Apple използва Разширена защита на данните. Одобрете заявката на вашия iPhone, iPad или Mac, за да може този компютър да отваря iCloud Drive.
