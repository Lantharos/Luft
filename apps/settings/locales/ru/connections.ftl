### Network, Bluetooth and Accounts panels

## Network: shared words

settings-network-save = Сохранить
settings-network-saving = Сохранение…
settings-network-cancel = Отмена
settings-network-connect = Подключить
settings-network-disconnect = Отключить
settings-network-optional = Необязательно
settings-network-automatic = Автоматически
settings-network-name = Имя
settings-network-password = Пароль
settings-network-password-saved = Сохранённый пароль
settings-network-username = Имя пользователя
settings-network-router = Маршрутизатор
settings-network-dns-servers = DNS-серверы
settings-network-private-key = Закрытый ключ
settings-network-connection-settings = Настройки подключения
settings-network-connect-failed = Не удалось подключиться

## Network: connection states

settings-network-link-connected = Подключено
settings-network-link-connecting = Подключение…
settings-network-link-disconnected = Не подключено
settings-network-link-unplugged = Кабель не подключён

## Network: Wi‑Fi security types

settings-network-security-open = Нет
settings-network-security-owe = Улучшенная открытая
settings-network-security-wep = WEP
settings-network-security-psk = WPA2-Personal
settings-network-security-sae = WPA3-Personal
settings-network-security-enterprise = Корпоративная

## Network: signal and radio details

settings-network-signal-excellent = Отличный
settings-network-signal-good = Хороший
settings-network-signal-fair = Средний
settings-network-signal-weak = Слабый
settings-network-signal = { $quality } ({ $strength })
settings-network-band = { $band } ГГц · канал { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Сигнал
settings-network-detail-band = Диапазон
settings-network-detail-speed = Скорость подключения
settings-network-detail-access-point = Точка доступа
settings-network-detail-security = Безопасность
settings-network-detail-ipv4 = IP-адрес
settings-network-detail-ipv6 = IPv6-адрес
settings-network-detail-router = Маршрутизатор
settings-network-detail-dns = DNS
settings-network-detail-mac = Аппаратный адрес

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Отключено аппаратным переключателем
settings-network-wifi-connected = Подключено к сети { $network }
settings-network-airplane = Режим полёта
    .description = Отключает все беспроводные подключения
settings-network-airplane-hardware = Включён аппаратным переключателем
settings-network-known = Известные сети
    .description = Сети, к которым этот компьютер уже подключался, рядом они или нет
settings-network-known-count = { $count ->
        [one] { $count } сохранённая сеть
        [few] { $count } сохранённые сети
        [many] { $count } сохранённых сетей
       *[other] { $count } сохранённой сети
    }
settings-network-known-in-range = В зоне действия
settings-network-ethernet = Ethernet
settings-network-ethernet-named = Ethernet ({ $name })
settings-network-wired-connected = Подключено · { $speed }
settings-network-empty = Нет сетевых подключений
    .description = Подключите сетевой кабель или адаптер Wi‑Fi, чтобы выйти в интернет
settings-network-proxy = Прокси
    .description = Направлять веб-трафик через другой сервер. Это часто нужно в рабочих и учебных сетях.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Сети Wi‑Fi
settings-network-wifi-saved = Сохранена
settings-network-wifi-enterprise = Вход с рабочей или учебной учётной записью
settings-network-wifi-connect-failed = Не удалось подключиться к этой сети
settings-network-wifi-saved-password-failed = Сохранённый пароль не подошёл. Введите его ещё раз.
settings-network-wifi-settings = Настройки сети
settings-network-wifi-searching = Поиск сетей…
settings-network-hidden = Подключиться к скрытой сети
    .description = Укажите имя сети и тип её защиты.
settings-network-hidden-name = Имя сети

## Network: joining a Wi‑Fi network

settings-network-join = Подключение к сети «{ $network }»
settings-network-join-enterprise = Войдите с рабочей или учебной учётной записью.
settings-network-join-password = Введите пароль этой сети.
settings-network-join-failed = Не удалось подключиться к этой сети.
settings-network-join-sign-in-failed = Не удалось войти. Проверьте имя пользователя и пароль.
settings-network-join-wrong-password = Пароль не подошёл. Проверьте его и попробуйте ещё раз.

## Network: connection settings page

settings-network-forget = Забыть эту сеть
    .description = Удаляет её пароль и настройки с этого компьютера
    .button = Забыть
settings-network-remove-vpn = Удалить эту VPN
settings-network-remove-connection = Удалить это подключение
settings-network-remove-description = Удаляет его настройки с этого компьютера
settings-network-remove = Удалить

settings-network-general = Общие
settings-network-autoconnect = Подключаться автоматически
settings-network-autoconnect-wifi = Подключаться к этой сети, когда она в зоне действия
settings-network-autoconnect-wired = Подключаться, как только вставлен кабель
settings-network-autoconnect-vpn = Подключаться, когда этот компьютер в сети
settings-network-autoconnect-other = Подключаться, когда это возможно
settings-network-all-users = Доступно всем
    .description = Доступно любому, кто входит на этом компьютере
settings-network-metered = Лимитное подключение
    .description = Приложения и обновления воздерживаются от больших загрузок
settings-network-metered-automatic = Определять автоматически
settings-network-metered-yes = Лимитное
settings-network-metered-no = Безлимитное

settings-network-security = Безопасность
settings-network-security-type = Тип защиты

settings-network-advanced = Дополнительно
settings-network-private-address = Частный адрес
    .description = Затрудняет отслеживание этого компьютера в этой сети
settings-network-hardware-address = Аппаратный адрес
    .description = Адрес, который этот компьютер сообщает сети
settings-network-mac-random = Новый адрес каждый раз
settings-network-mac-stable = Один адрес для этой сети
settings-network-mac-private-off = Отключён
settings-network-mac-builtin = Встроенный адрес
settings-network-mac-custom = Свой адрес
settings-network-mtu = Наибольший размер пакета (MTU)
    .description = Оставьте пустым, если вашей сети не нужен особый размер
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Метод
    .label = Метод { $family }
settings-network-ip-dhcp = Автоматически, только адреса
settings-network-ip-manual = Вручную
settings-network-ip-link-local = Только локальная связь
settings-network-ip-shared = Общий доступ для других устройств
settings-network-ip-ignore = Не управляется
settings-network-ip-disabled = Отключено
settings-network-ip-addresses = Адреса
    .description = Каждый с префиксом, например { $example }
settings-network-ip-address = Адрес { $number }
settings-network-ip-remove-address = Удалить адрес
settings-network-ip-add-address = Добавить адрес
settings-network-ip-router = Маршрутизатор { $family }
settings-network-ip-automatic-dns = Автоматический DNS
    .description = Использовать DNS-серверы, предложенные этой сетью
settings-network-ip-dns-first = Используются раньше предложенных
settings-network-ip-dns-separate = Разделяйте адреса запятыми
settings-network-ip-dns-servers = DNS-серверы { $family }
settings-network-ip-search-domains = Домены поиска
    .description = Подставляются, когда у имени нет домена, например «printer»
    .label = Домены поиска { $family }
settings-network-ip-automatic-routes = Автоматические маршруты
    .description = Использовать маршруты, предложенные этой сетью
settings-network-ip-routes = Маршруты
    .description = Направлять трафик некоторых сетей через другой маршрутизатор
settings-network-ip-add-route = Добавить маршрут
settings-network-route-network = Сеть
settings-network-route-priority = Приоритет
settings-network-route-remove = Удалить маршрут

## Network: work or school (802.1X) sign-in

settings-network-eap = Проверка подлинности
settings-network-eap-peap = Защищённый EAP (PEAP)
settings-network-eap-ttls = Туннелированный TLS (TTLS)
settings-network-eap-tls = Сертификат (TLS)
settings-network-eap-inner = Внутренняя проверка подлинности
settings-network-client-certificate = Ваш сертификат
settings-network-private-key-password = Пароль закрытого ключа
    .placeholder = Если он есть у ключа
settings-network-anonymous-identity = Анонимное удостоверение
    .description = Оставьте пустым, если ваша сеть этого не требует
settings-network-ca = Сертификат ЦС
    .description = Подтверждает, что вы подключаетесь к настоящей сети
settings-network-ca-system = Использовать системные сертификаты
settings-network-ca-file = Выбрать файл…
settings-network-ca-another-file = Выбрать другой файл…
settings-network-ca-none = Не проверять
settings-network-choose-file = Выбрать…
settings-network-server-domain = Домен сервера
    .description = Подключаться только к серверам в этом домене

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Введите имя
settings-network-error-no-addresses = Добавьте хотя бы один адрес
settings-network-error-address = Введите адрес с префиксом, например { $example }
settings-network-error-router = Введите адрес маршрутизатора, например { $example }
settings-network-error-dns = «{ $address }» — недопустимый адрес
settings-network-error-search-domain = «{ $domain }» — недопустимый домен
settings-network-error-route = Введите сеть, например { $example }
settings-network-error-priority = Приоритет должен быть целым числом
settings-network-error-username = Введите имя пользователя
settings-network-error-domain = Введите домен, например example.com
settings-network-error-certificate = Выберите свой сертификат
settings-network-error-private-key = Выберите свой закрытый ключ
settings-network-error-mtu = Введите число от { $lowest } до { $highest } или оставьте поле пустым
settings-network-error-mac = Введите адрес вида 12:34:56:78:9A:BC
settings-network-error-password = Введите пароль
settings-network-error-password-length = { $count ->
        [one] Не менее { $count } символа
        [few] Не менее { $count } символов
        [many] Не менее { $count } символов
       *[other] Не менее { $count } символа
    }

## Network: proxy

settings-network-proxy-off = Не используется
settings-network-proxy-manual = Вручную
settings-network-proxy-url = Адрес конфигурации
settings-network-proxy-http = Веб (HTTP)
settings-network-proxy-https = Защищённый веб (HTTPS)
settings-network-proxy-socks = SOCKS
settings-network-proxy-server = Сервер
    .label = Сервер: { $protocol }
settings-network-proxy-port = Порт
    .label = Порт: { $protocol }
settings-network-proxy-skip = Не использовать прокси для
settings-network-proxy-error-url = Введите веб-адрес, например http://example.com/proxy.pac
settings-network-proxy-error-host = Введите только имя сервера, например proxy.example.com
settings-network-proxy-error-port = Введите порт от 1 до 65535
settings-network-proxy-save-failed = Не удалось сохранить настройки прокси

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Импортировать из файла
    .description = Файлы конфигурации WireGuard, OpenVPN и других VPN
settings-network-vpn-importing = Импорт…
settings-network-wireguard = Настроить WireGuard
    .description = Введите данные от вашего VPN-провайдера или сервера
settings-network-wireguard-dialog = Эти данные может сообщить ваш VPN-провайдер или владелец сервера.
settings-network-wireguard-name-example = Домашняя VPN
settings-network-wireguard-public-key = Открытый ключ { $key }
settings-network-wireguard-public-key-pending = Здесь появится открытый ключ, которым нужно поделиться
settings-network-wireguard-copy = Копировать открытый ключ
settings-network-wireguard-copied = Скопировано
settings-network-wireguard-generate = Создать новый ключ
settings-network-wireguard-addresses = Адреса этого компьютера внутри VPN
settings-network-wireguard-server-key = Открытый ключ сервера
settings-network-wireguard-endpoint = Адрес сервера
settings-network-wireguard-allowed-ips = Разрешённые IP-адреса
    .description = Трафик в эти диапазоны идёт через VPN
settings-network-wireguard-preshared-key = Общий ключ
settings-network-wireguard-keepalive = Поддержание соединения
    .description = Помогает не терять соединение за маршрутизатором
    .placeholder = Необязательно, в секундах
settings-network-wireguard-add = Добавить
settings-network-wireguard-adding = Добавление…
settings-network-wireguard-error-private-key = Введите или создайте закрытый ключ
settings-network-wireguard-error-addresses = Введите хотя бы один адрес
settings-network-wireguard-error-server-key = Введите открытый ключ сервера
settings-network-wireguard-error-endpoint = Введите адрес и порт сервера
settings-network-wireguard-error-allowed-ips = Введите хотя бы один диапазон
settings-network-wireguard-error-keepalive = Введите число секунд

## Bluetooth panel

settings-bluetooth-hardware-off = Отключено аппаратным переключателем
settings-bluetooth-power-on-failed = Не удалось включить Bluetooth
settings-bluetooth-power-off-failed = Не удалось отключить Bluetooth
settings-bluetooth-visible = Видимость для устройств рядом
    .description = Телефоны и компьютеры смогут найти этот компьютер
settings-bluetooth-visible-as = Отображается как «{ $name }»
settings-bluetooth-visible-duration = Оставаться видимым
settings-bluetooth-visible-for = { $minutes ->
        [one] На { $minutes } минуту
        [few] На { $minutes } минуты
        [many] На { $minutes } минут
       *[other] На { $minutes } минуты
    }
settings-bluetooth-visible-until-off = Пока не отключено
settings-bluetooth-visible-failed = Не удалось изменить видимость этого компьютера
settings-bluetooth-paired = Мои устройства
settings-bluetooth-nearby = Устройства рядом
settings-bluetooth-searching = Поиск устройств…
    .description = Переведите устройство, которое хотите добавить, в режим сопряжения
settings-bluetooth-blocked = Bluetooth отключён аппаратным переключателем
    .description = Включите его переключателем или клавишей на компьютере
settings-bluetooth-details = Сведения об устройстве
settings-bluetooth-connected = Подключено
settings-bluetooth-connected-battery = Подключено · батарея { $battery }
settings-bluetooth-connecting = Подключение…
settings-bluetooth-disconnecting = Отключение…
settings-bluetooth-pairing = Сопряжение…
settings-bluetooth-forget-confirm = Забыть «{ $name }»?
    .description = Чтобы снова использовать его с этим компьютером, понадобится повторное сопряжение.
settings-bluetooth-forget = Забыть
settings-bluetooth-cancel = Отмена
settings-bluetooth-connect = Подключить
settings-bluetooth-disconnect = Отключить
settings-bluetooth-done = Готово

## Bluetooth: device details

settings-bluetooth-type = Тип
settings-bluetooth-battery = Батарея
settings-bluetooth-address = Адрес
settings-bluetooth-autoconnect = Подключаться автоматически
    .description = Когда устройство рядом
settings-bluetooth-kind-headphones = Наушники
settings-bluetooth-kind-speaker = Колонка
settings-bluetooth-kind-mouse = Мышь
settings-bluetooth-kind-keyboard = Клавиатура
settings-bluetooth-kind-gamepad = Геймпад
settings-bluetooth-kind-phone = Телефон
settings-bluetooth-kind-computer = Компьютер
settings-bluetooth-kind-tablet = Планшет
settings-bluetooth-kind-display = Экран
settings-bluetooth-kind-printer = Принтер
settings-bluetooth-kind-camera = Камера
settings-bluetooth-kind-other = Другое устройство

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

settings-bluetooth-request-unnamed = без названия
settings-bluetooth-request-confirm = Выполнить сопряжение с устройством { $name }?
    .description = Убедитесь, что на устройстве { $name } показан тот же код.
settings-bluetooth-request-authorize = Разрешить сопряжение с устройством { $name }?
    .description = Устройство { $name } сможет подключаться к этому компьютеру.
settings-bluetooth-request-pin = Введите PIN-код устройства { $name }
    .description = Часто это 0000 или 1234. Если не подходит ни тот, ни другой, посмотрите в руководстве к устройству.
settings-bluetooth-request-passkey = Введите код, показанный на устройстве { $name }
    .description = Введите шесть цифр точно так, как они показаны.
settings-bluetooth-request-display = Сопряжение с устройством { $name }
    .description = Введите этот код на устройстве { $name } и нажмите Enter.
settings-bluetooth-pair = Выполнить сопряжение
settings-bluetooth-allow = Разрешить

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Перенести устройства из Windows
    .description = { $count ->
        [one] В Windows уже сопряжено: { $devices }. Используйте его здесь без повторного сопряжения.
        [few] В Windows уже сопряжены: { $devices }. Используйте их здесь без повторного сопряжения.
        [many] В Windows уже сопряжены: { $devices }. Используйте их здесь без повторного сопряжения.
       *[other] В Windows уже сопряжены: { $devices }. Используйте их здесь без повторного сопряжения.
    }
settings-bluetooth-windows-more = { $count ->
        [one] ещё { $count }
        [few] ещё { $count }
        [many] ещё { $count }
       *[other] ещё { $count }
    }
