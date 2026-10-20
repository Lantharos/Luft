## Buttons used across steps

setup-continue = Продолжи
setup-back = Назад
setup-cancel = Откажи
setup-not-now = Не сега
setup-try-again = Обиди се повторно
setup-restart = Рестартирај
setup-restart-now = Рестартирај сега
setup-restart-later = Рестартирај подоцна
setup-saving = Се зачувува…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Се инсталира Luft
setup-installing-progress = Се инсталира, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Пребарај
setup-picker-no-match = Ништо не одговара

## Welcome step: language, keyboard and time zone

setup-region-title = Добре дојдовте во Luft
setup-region-language = Јазик
setup-region-keyboard = Тастатура
setup-region-time-zone = Временска зона
setup-region-intro = Да почнеме со поставувањето. Изберете јазик, тастатура и временска зона.
setup-region-intro-guessed-computer = Да почнеме со поставувањето. Ова го претпоставивме според компјутерот, па сменете сè што не е точно.
setup-region-intro-guessed = Да почнеме со поставувањето. Претпоставивме: { $guesses }. Сменете сè што не е точно.
setup-region-guess-from-computer = { $fields } според компјутерот
setup-region-guess-from-network = { $fields } според мрежата
setup-region-field-language = јазикот
setup-region-field-keyboard = тастатурата
setup-region-field-time-zone = временската зона

## Where Luft goes

setup-destination-choose-title = Каде да се инсталира Luft?
setup-destination-choose-description = Изберете како Luft ќе се смести на овој компјутер. Ништо не се менува додека не потврдите.
setup-destination-alongside-title = Место покрај Windows
setup-destination-alongside-description = Windows се намалува за да се направи место за Luft. Вашите датотеки во Windows остануваат какви што се.
setup-destination-whole-title = Избор на диск
setup-destination-whole-description = Luft го зазема целиот диск. Сè на него се брише.
setup-destination-custom-title = Избор на простор за Luft
setup-destination-custom-description = Распоредете ги дисковите по ваша волја во Дискови.
setup-destination-replace-title = Замена на системот { $system }
setup-destination-replace-description = Luft го зазема неговото место и го задржува она што е ваше.
setup-destination-meet-title = Покрај Windows
setup-destination-meet-description = Meet Luft веќе го направи ова место, па Windows останува токму каков што е.
setup-destination-looking = Се прегледуваат дисковите…

setup-destination-meet-choice = Покрај Windows
setup-destination-meet-choice-description = Користете ги { $size } што Meet Luft ги направи до Windows.
setup-destination-alongside-choice = Покрај { $windows }
setup-destination-alongside-choice-description = Задржете го Windows и неговите датотеки, а на Luft дајте му дел од неговиот диск.
setup-destination-replace-choice = Замени го системот { $system }
setup-destination-replace-choice-description = Задржете ги датотеките, сметката и поставките, а Luft нека го заземе неговото место.
setup-destination-whole-choice = Користи цел диск
setup-destination-whole-choice-description = Избришете диск и дајте му го целиот на Luft.
setup-destination-try-choice = Само пробај го Luft
setup-destination-try-choice-description = Најпрвин разгледајте. Ништо не се инсталира и дисковите остануваат недопрени.
setup-destination-custom-choice = Прилагодено
setup-destination-custom-choice-description = Сами распоредете ги партициите во Дискови.

setup-destination-more-options = Повеќе опции
setup-destination-starting = Се стартува…
setup-destination-replace = Замени
setup-destination-install = Инсталирај Luft

## Confirming where Luft goes

setup-confirm-replace-title = Да се замени системот { $system }?
setup-confirm-erase-title = Да се избрише дискот { $drive }?
setup-confirm-shrink-title = Да се намали Windows на { $size }?
setup-confirm-meet-title = Да се инсталира Luft до Windows?
setup-confirm-free-title = Да се инсталира Luft во слободниот простор?
setup-confirm-replace-keep-old = Luft веднаш почнува со копирање. Стариот систем повеќе нема да се стартува, а неговите датотеки остануваат додека не ги отстраните.
setup-confirm-replace-erase-old = Luft веднаш почнува со копирање. Стариот систем се брише засекогаш, а вашите датотеки остануваат каде што се.
setup-confirm-erase-description = Сè на овој диск се брише засекогаш, вклучувајќи други системи и датотеки.
setup-confirm-install-description = Luft веднаш почнува со копирање. Во меѓувреме можете да ја поставите сметката.
setup-confirm-erase = Избриши и инсталирај
setup-confirm-install = Инсталирај

## Making room next to Windows

setup-alongside-hint = Повлечете за да го поделите дискот { $drive } меѓу Windows и Luft. Windows ги задржува сите свои датотеки и малку простор за раст.
setup-windows-bitlocker = Windows го држи овој диск заклучен со BitLocker, па Luft не може да направи место на него. Во Windows исклучете го шифрирањето на уредот или намалете го дискот во Управување со дискови и изберете го слободниот простор под Прилагодено.
setup-windows-hibernated = Windows е во режим на спиење или е исклучен со Брзо стартување, па неговиот диск не може безбедно да се менува. Стартувајте го Windows, држете Shift додека избирате Исклучи, па повторно стартувајте го Luft.
setup-windows-dirty = Дискот на Windows најпрвин треба брзо да се провери. Стартувајте го Windows, рестартирајте го еднаш, па повторно стартувајте го Luft.
setup-windows-full = На Windows му е потребен речиси целиот диск. Ослободете околу { $size } во Windows, па повторно стартувајте го Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Работите што ги спакувавте во Windows ({ $size }) се отпакуваат во вашата нова сметка.

## Windows options

setup-windows-fast-startup = Исклучи го Брзо стартување во Windows
setup-windows-fast-startup-description = Тогаш Windows целосно се исклучува, па звукот, Wi-Fi и Bluetooth почнуваат од почеток во Luft, а неговиот диск останува отворен.
setup-windows-clock = Точен часовник во двата системи
setup-windows-clock-description = Windows го чита часовникот на компјутерот како Luft, па времето повеќе не скока кога ќе се префрлите.
setup-windows-bluetooth = Пренеси ги Bluetooth-уредите
setup-windows-bluetooth-description = { $count ->
    [one] { $count } уред спарен во Windows ќе работи во Luft без повторно спарување.
   *[other] { $count } уреди спарени во Windows ќе работат во Luft без повторно спарување.
}

## Choosing a drive

setup-drives-label = Дискови
setup-drives-none = Нема диск што Luft може да го користи. Поврзете еден и прегледајте повторно.
setup-drive-has-windows = Има { $windows }
setup-drive-empty = Празен
setup-drive-partitions = { $count ->
    [one] Има { $count } партиција
   *[other] Има { $count } партиции
}

## Custom space

setup-custom-open-disks = Отвори Дискови
setup-custom-looking = Се прегледува…
setup-custom-look-again = Прегледај повторно
setup-custom-free-label = Слободен простор
setup-custom-free-space = { $size } слободен простор
setup-custom-on-drive = На дискот { $drive }
setup-custom-none = Направете најмалку { $size } слободен простор во Дискови, па прегледајте повторно. Luft се инсталира во просторот што ќе го оставите слободен.

## Replacing a Linux system

setup-replace-stays = Што останува
setup-replace-changes = Што се менува
setup-replace-keeps-account = Вашите датотеки и вашата сметка { $account }
setup-replace-keeps-account-password = Вашите датотеки и вашата сметка { $account } со нејзината лозинка
setup-replace-keeps-accounts = { $count ->
    [one] Другата сметка во системот, со своите датотеки
   *[other] Другите { $count } сметки во системот, со своите датотеки
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } мрежна врска, со својата лозинка за Wi-Fi
   *[other] { $count } мрежни врски, со лозинките за Wi-Fi
}
setup-replace-keeps-drives = { $drives }, кои се приклучуваат при стартување како досега
setup-replace-keeps-hostname = Името на компјутерот, { $hostname }, и неговите SSH-клучеви
setup-replace-keeps-tools = { $count ->
    [one] { $count } алатка за командна линија што ја инсталиравте, во Toolbox по најавата
   *[other] { $count } алатки за командна линија што ги инсталиравте, во Toolbox по најавата
}
setup-replace-keeps-old = Системот { $system } повеќе не се стартува. Неговите системски датотеки се чуваат како old-system додека не ги отстраните во Дискови или Поставки.
setup-replace-erases-system = Системската партиција на { $system } се брише. Вашите датотеки се на посебна партиција и остануваат какви што се.
setup-replace-clears-boot = Неговата партиција /boot се празни за да ги собере датотеките за стартување на Luft.
setup-replace-apps = Апликациите инсталирани во него не се пренесуваат. Преземете ги повторно од Schelf.

setup-replace-blocked-encrypted = Шифриран е, па замената со задржување на датотеките сè уште не е поддржана.
setup-replace-blocked-single = Вашите датотеки делат една партиција со системот, па замената со нивно задржување сè уште не е поддржана.
setup-replace-blocked-layout = Неговиот диск е распореден на начин што Luft сè уште не може да го замени.
setup-replace-blocked-startup = Неговата EFI-системска партиција е премала за Luft, а нема партиција /boot што би се користела наместо неа.
setup-replace-blocked-no-account = Нема сметка што може да се пренесе.
setup-replace-blocked-running = Luft моментално се стартува од него. Стартувајте го Luft од USB-меморија за да го замените.
setup-replace-blocked-read-only = Неговиот диск е само за читање.

## Connecting to the internet

setup-network-title = Поврзување на интернет
setup-network-description = Ова не е задолжително. Со интернет Luft може да ги постави часовникот и временската зона, а вие можете да го користите интернетот додека Luft се инсталира.
setup-network-unavailable = Мрежите моментално не се достапни. Можете да се поврзете подоцна од лентата со задачи.
setup-network-looking = Се бараат мрежи…
setup-network-cable = Поврзано со кабел
setup-network-show-all = Прикажи ги сите мрежи
setup-network-skip = Прескокни
setup-network-failed = Не може да се поврзе
setup-network-wrong-password = Погрешна лозинка
setup-network-connected = Поврзано
setup-network-connecting = Се поврзува…
setup-network-saved = Зачувана
setup-network-password = Лозинка
setup-network-join = Поврзи се

## Account

setup-account-title = Кој го користи овој компјутер?
setup-account-description = Со оваа сметка се најавувате. Подоцна можете да додадете други луѓе во Поставки.
setup-account-full-name = Вашето име
setup-account-full-name-example = Блаже Конески
setup-account-user-name = Корисничко име
setup-account-password = Лозинка
setup-account-repeat = Внесете ја повторно
setup-account-user-name-invalid = Користете мали букви, бројки, - и _
setup-account-full-name-invalid = Изоставете запирки и две точки
setup-account-mismatch = Лозинките не се совпаѓаат

## Installing

setup-finishing-failed-title = Luft не можеше да се инсталира
setup-finishing-failed-description = Нешто тргна наопаку при инсталирањето.
setup-finishing-failed-stick = Компјутерот сè уште се стартува како порано. Можете да продолжите да го користите Luft од USB-меморијата или да рестартирате и да се обидете повторно.
setup-finishing-failed-trying = Компјутерот сè уште се стартува како порано. Можете да продолжите да го користите Luft вака или да рестартирате и да се обидете повторно.
setup-finishing-use-stick = Користи го Luft од USB-меморијата
setup-finishing-keep-trying = Продолжи со пробување на Luft
setup-finishing-installed-title = Luft е инсталиран
setup-finishing-trust-stick = Извадете ја USB-меморијата штом екранот ќе потемни. Потоа син екран ќе праша дали му верувате на Luft. Таму користете ја тастатурата.
setup-finishing-trust = Веднаш по рестартирањето, син екран ќе праша дали му верувате на Luft. Таму користете ја тастатурата.
setup-finishing-restart-stick = Рестартирајте за да почнете да го користите. Извадете ја USB-меморијата штом екранот ќе потемни.
setup-finishing-restart = Рестартирајте за да почнете да го користите.
setup-finishing-title = Уште малку
setup-finishing-description = Luft се копира на вашиот компјутер. Ова трае неколку минути.
setup-finishing-plug-in = Држете го компјутерот приклучен на струја додека не заврши.
setup-stage-idle = Подготовка
setup-stage-preparing = Се прави место за Luft
setup-stage-copying = Се копира Luft
setup-stage-waiting = Завршување
setup-stage-configuring = Се поставува вашата сметка
setup-stage-finished = Готово

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Притиснете копче во рок од 10 секунди
setup-enroll-choose-enroll = Изберете Enroll MOK, па Continue
setup-enroll-choose-yes = Изберете Yes
setup-enroll-type-code = Внесете го кодот, па изберете Reboot
setup-enroll-digits = { $count ->
    [one] { $count } цифра
   *[other] { $count } цифри
}
setup-secure-boot-title = Компјутерот сè уште не му верува на Luft
setup-secure-boot-code = Веднаш по следното рестартирање, син екран ќе праша дали му верувате на Luft. Таму користете ја тастатурата и овој код.
setup-secure-boot-skipped = Синиот екран беше прескокнат. Земете нов код и рестартирајте, па таму користете ја тастатурата.
setup-secure-boot-getting = Се зема кодот…
setup-secure-boot-new-code = Земи нов код

## Encryption

setup-protect-title = Заштита на датотеките
setup-protect-tpm = Шифрирајте го компјутерот за никој да не може да ги чита вашите датотеки без најава, дури и ако го изгубите. Се отклучува сам при стартување.
setup-protect-passphrase = Шифрирајте го компјутерот за никој да не може да ги чита вашите датотеки без вашата тајна фраза, дури и ако го изгубите.
setup-protect-staged-title = Вашите датотеки ќе бидат шифрирани
setup-protect-staged-description = Шифрирањето почнува само по рестартирањето на крајот од поставувањето, а во меѓувреме можете да го користите компјутерот.
setup-protect-keep-safe = Чувајте го овој клуч за обновување на безбедно место, подалеку од овој компјутер. Ќе ви треба ако компјутерот некогаш не може да се отклучи сам.
setup-protect-passphrase-label = Тајна фраза
setup-protect-repeat = Внесете ја повторно
setup-protect-mismatch = Не се совпаѓаат
setup-protect-kept = Го зачував клучот за обновување
setup-protect-background = Шифрирањето се одвива во позадина по следното рестартирање, а во меѓувреме можете да го користите компјутерот.
setup-protect-encrypt = Шифрирај
setup-protect-checking = Се проверува…
setup-protect-start = Шифрирај ги моите датотеки

## Fingerprint

setup-fingerprint-title = Најава со прст
setup-fingerprint-description = Отклучувајте го Luft со допир наместо со внесување лозинка. Подоцна можете да додадете други прсти во Поставки.
setup-fingerprint-which = Кој прст?
setup-fingerprint-another = Да се додаде уште еден прст?
setup-fingerprint-finger = Прст
setup-fingerprint-no-reader = Читачот на отпечатоци од прсти не одговара. Отпечаток од прст можете да додадете подоцна во Поставки.
setup-fingerprint-add = Додај отпечаток од прст
setup-fingerprint-choose-another = Избери друг прст

## Done

setup-ready-title = Сè е подготвено
setup-ready-trust = Рестартирајте уште еднаш за да завршите. Веднаш по рестартирањето, син екран ќе праша дали му верувате на Luft. Таму користете ја тастатурата и овој код.
setup-ready-restart = Рестартирајте уште еднаш за да завршите, па најавете се со лозинката.
setup-ready-done = Работната површина е подготвена. Уживајте во Luft.
setup-ready-start = Започни со Luft
