## Buttons used across steps

setup-continue = Продължи
setup-back = Назад
setup-cancel = Отказ
setup-not-now = Не сега
setup-try-again = Опитай отново
setup-restart = Рестартирай
setup-restart-now = Рестартирай сега
setup-restart-later = Рестартирай по-късно
setup-saving = Запазване…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Инсталиране на Luft
setup-installing-progress = Инсталиране, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Търсене
setup-picker-no-match = Няма съвпадения

## Welcome step: language, keyboard and time zone

setup-region-title = Добре дошли в Luft
setup-region-language = Език
setup-region-keyboard = Клавиатура
setup-region-time-zone = Часова зона
setup-region-intro = Да започнем с настройката. Изберете език, клавиатура и часова зона.
setup-region-intro-guessed-computer = Да започнем с настройката. Определихме ги по компютъра ви, затова променете каквото не е вярно.
setup-region-intro-guessed = Да започнем с настройката. Определихме { $guesses }, затова променете каквото не е вярно.
setup-region-guess-from-computer = { $fields } по компютъра ви
setup-region-guess-from-network = { $fields } по мрежата ви
setup-region-field-language = езика
setup-region-field-keyboard = клавиатурата
setup-region-field-time-zone = часовата зона

## Where Luft goes

setup-destination-choose-title = Къде да се инсталира Luft?
setup-destination-choose-description = Изберете как Luft да се разположи на този компютър. Нищо не се променя, докато не потвърдите.
setup-destination-alongside-title = Място до Windows
setup-destination-alongside-description = Windows се смалява, за да освободи място за Luft. Файловете ви в Windows остават непокътнати.
setup-destination-whole-title = Избор на диск
setup-destination-whole-description = Luft заема целия диск. Всичко на него се изтрива.
setup-destination-custom-title = Избор на място за Luft
setup-destination-custom-description = Подредете дисковете си както искате с приложението Дискове.
setup-destination-replace-title = Замяна на { $system }
setup-destination-replace-description = Luft заема мястото на старата система и запазва това, което е ваше.
setup-destination-meet-title = До Windows
setup-destination-meet-description = Meet Luft вече освободи това място, така че Windows остава точно какъвто е.
setup-destination-meet-drive-title = На { $drive }
setup-destination-meet-drive-description = Meet Luft вече освободи това място на друг диск и Luft се стартира оттам със собствени стартови файлове.
setup-destination-looking = Преглеждане на дисковете…

setup-destination-meet-choice = До Windows
setup-destination-meet-choice-description = Използвайте { $size }, освободени от Meet Luft до Windows.
setup-destination-meet-drive-choice = На { $drive }
setup-destination-meet-drive-choice-description = Използвайте { $size }, освободени от Meet Luft на { $drive }.
setup-destination-alongside-choice = До { $windows }
setup-destination-alongside-choice-description = Запазете Windows и файловете му и дайте на Luft част от диска му.
setup-destination-replace-choice = Замяна на { $system }
setup-destination-replace-choice-description = Запазете файловете, акаунта и настройките си, а Luft ще заеме мястото на старата система.
setup-destination-whole-choice = Цял диск
setup-destination-whole-choice-description = Изтрийте диск и го дайте изцяло на Luft.
setup-destination-try-choice = Само пробване на Luft
setup-destination-try-choice-description = Първо разгледайте. Нищо не се инсталира и дисковете ви остават непокътнати.
setup-destination-custom-choice = Ръчна настройка
setup-destination-custom-choice-description = Подредете дяловете сами в Дискове.

setup-destination-more-options = Още опции
setup-destination-starting = Стартиране…
setup-destination-replace = Замени
setup-destination-install = Инсталирай Luft

## Confirming where Luft goes

setup-confirm-replace-title = Да се замени ли { $system }?
setup-confirm-erase-title = Да се изтрие ли { $drive }?
setup-confirm-shrink-title = Да се смали ли Windows до { $size }?
setup-confirm-meet-title = Да се инсталира ли Luft до Windows?
setup-confirm-meet-drive-title = Да се инсталира ли Luft на { $drive }?
setup-confirm-free-title = Да се инсталира ли Luft в свободното място?
setup-confirm-replace-keep-old = Luft започва копирането веднага. Старата система вече няма да се стартира, а файловете ѝ остават, докато не ги премахнете.
setup-confirm-replace-erase-old = Luft започва копирането веднага. Старата система се изтрива завинаги, а вашите файлове остават където са.
setup-confirm-erase-description = Всичко на този диск се изтрива завинаги, включително други системи и файлове.
setup-confirm-install-description = Luft започва копирането веднага. Междувременно можете да настроите акаунта си.
setup-confirm-erase = Изтрий и инсталирай
setup-confirm-install = Инсталирай

## Making room next to Windows

setup-alongside-hint = Плъзнете, за да разделите { $drive } между Windows и Luft. Windows запазва всичките си файлове и малко свободно място.
setup-windows-bitlocker = Windows държи този диск заключен с BitLocker, затова Luft не може да освободи място на него. В Windows изключете шифроването на устройството или смалете диска в Управление на дискове и изберете свободното място в Ръчна настройка.
setup-windows-hibernated = Windows е в режим на заспиване или е изключен с Бързо стартиране, затова дискът му не може да бъде променен безопасно. Стартирайте Windows, задръжте Shift, докато избирате Изключване, и след това стартирайте Luft отново.
setup-windows-dirty = Дискът на Windows първо трябва да бъде проверен. Стартирайте Windows, рестартирайте го веднъж и след това стартирайте Luft отново.
setup-windows-full = Windows използва почти целия си диск. Освободете около { $size } в Windows и след това стартирайте Luft отново.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Нещата, които събрахте в Windows ({ $size }), се разопаковат в новия ви акаунт.

## Windows options

setup-windows-fast-startup = Изключване на Бързо стартиране в Windows
setup-windows-fast-startup-description = Тогава Windows се изключва напълно, така че звукът, Wi-Fi и Bluetooth стартират начисто в Luft, а дискът му остава достъпен.
setup-windows-clock = Верен часовник и в двете системи
setup-windows-clock-description = Windows чете часовника на компютъра по същия начин като Luft, така че часът вече не скача при превключване.
setup-windows-bluetooth = Пренасяне на устройствата Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } устройство, сдвоено в Windows, ще работи в Luft без повторно сдвояване.
   *[other] { $count } устройства, сдвоени в Windows, ще работят в Luft без повторно сдвояване.
}

## Choosing a drive

setup-drives-label = Дискове
setup-drives-none = Няма диск, който Luft да може да използва. Свържете диск и проверете отново.
setup-drive-has-windows = С { $windows }
setup-drive-empty = Празен
setup-drive-partitions = { $count ->
    [one] С { $count } дял
   *[other] С { $count } дяла
}

## Custom space

setup-custom-open-disks = Отвори Дискове
setup-custom-looking = Търсене…
setup-custom-look-again = Провери отново
setup-custom-free-label = Свободно място
setup-custom-free-space = { $size } свободно място
setup-custom-on-drive = На { $drive }
setup-custom-none = Освободете поне { $size } в Дискове и проверете отново. Luft се инсталира в мястото, което оставите свободно.

## Replacing a Linux system

setup-replace-stays = Какво остава
setup-replace-changes = Какво се променя
setup-replace-keeps-account = Файловете ви и акаунтът ви { $account }
setup-replace-keeps-account-password = Файловете ви и акаунтът ви { $account } с паролата му
setup-replace-keeps-accounts = { $count ->
    [one] Другият акаунт в системата, с файловете му
   *[other] Другите { $count } акаунта в системата, с файловете им
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } мрежова връзка с паролата за Wi-Fi
   *[other] { $count } мрежови връзки с паролите за Wi-Fi
}
setup-replace-keeps-drives = { $drives } – монтирани при стартиране, както досега
setup-replace-keeps-hostname = Името на компютъра, { $hostname }, и SSH ключовете му
setup-replace-keeps-tools = { $count ->
    [one] { $count } инструмент за командния ред, който сте инсталирали, в Toolbox след влизане
   *[other] { $count } инструмента за командния ред, които сте инсталирали, в Toolbox след влизане
}
setup-replace-keeps-old = Системата { $system } вече няма да се стартира. Системните ѝ файлове се пазят като old-system, докато не ги премахнете в Дискове или Настройки.
setup-replace-erases-system = Системният дял на { $system } се изтрива. Файловете ви са на отделен дял и остават непокътнати.
setup-replace-clears-boot = Дялът ѝ /boot се изчиства, за да побере стартовите файлове на Luft.
setup-replace-apps = Инсталираните в нея приложения не се пренасят. Инсталирайте ги отново от Schelf.

setup-replace-blocked-encrypted = Системата е шифрована, затова замяната ѝ със запазване на файловете ви все още не се поддържа.
setup-replace-blocked-single = Файловете ви са на един дял със системата, затова замяната ѝ със запазване на файловете все още не се поддържа.
setup-replace-blocked-layout = Дискът ѝ е разделен по начин, който Luft все още не може да замени.
setup-replace-blocked-startup = Системният ѝ EFI дял е твърде малък за Luft и няма дял /boot, който да се използва вместо него.
setup-replace-blocked-no-account = В нея няма акаунт, който да бъде пренесен.
setup-replace-blocked-running = Luft в момента се стартира от нея. Стартирайте Luft от USB флашка, за да я замените.
setup-replace-blocked-read-only = Дискът ѝ е само за четене.

## Connecting to the internet

setup-network-title = Свързване с интернет
setup-network-description = Това не е задължително. С връзка Luft може да настрои часовника и часовата зона, а вие можете да използвате интернет, докато Luft се инсталира.
setup-network-unavailable = В момента няма налични мрежи. Можете да се свържете по-късно от панела.
setup-network-looking = Търсене на мрежи…
setup-network-cable = Свързано с кабел
setup-network-show-all = Покажи всички мрежи
setup-network-skip = Пропусни
setup-network-failed = Неуспешно свързване
setup-network-wrong-password = Грешна парола
setup-network-connected = Свързано
setup-network-connecting = Свързване…
setup-network-saved = Запазена
setup-network-password = Парола
setup-network-join = Свържи

## Account

setup-account-title = Кой ще използва този компютър?
setup-account-description = С този акаунт ще влизате. Можете да добавите още хора по-късно в Настройки.
setup-account-full-name = Вашето име
setup-account-full-name-example = Иван Вазов
setup-account-user-name = Потребителско име
setup-account-password = Парола
setup-account-repeat = Въведете я отново
setup-account-user-name-invalid = Използвайте малки латински букви, цифри, - и _
setup-account-full-name-invalid = Без запетаи и двоеточия
setup-account-mismatch = Паролите не съвпадат

## Installing

setup-finishing-failed-title = Инсталирането на Luft не успя
setup-finishing-failed-description = Нещо се обърка по време на инсталирането.
setup-finishing-failed-stick = Компютърът ви все още стартира както преди. Можете да продължите да използвате Luft от USB флашката или да рестартирате и да опитате отново.
setup-finishing-failed-trying = Компютърът ви все още стартира както преди. Можете да продължите да използвате Luft така, както е сега, или да рестартирате и да опитате отново.
setup-finishing-use-stick = Използвай Luft от флашката
setup-finishing-keep-trying = Продължи да пробваш Luft
setup-finishing-installed-title = Luft е инсталиран
setup-finishing-trust-stick = Извадете USB флашката, когато екранът потъмнее. След това син екран ще попита дали да се довери на Luft. Използвайте клавиатурата там.
setup-finishing-trust = Веднага след рестартирането син екран ще попита дали да се довери на Luft. Използвайте клавиатурата там.
setup-finishing-restart-stick = Рестартирайте, за да започнете работа с Luft. Извадете USB флашката, когато екранът потъмнее.
setup-finishing-restart = Рестартирайте, за да започнете работа с Luft.
setup-finishing-title = Почти готово
setup-finishing-description = Luft се копира на компютъра ви. Това отнема няколко минути.
setup-finishing-plug-in = Дръжте компютъра включен в захранването, докато приключи.
setup-stage-idle = Подготовка
setup-stage-preparing = Освобождаване на място за Luft
setup-stage-copying = Копиране на Luft
setup-stage-waiting = Завършване
setup-stage-configuring = Настройване на акаунта ви
setup-stage-finished = Готово

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Натиснете клавиш в рамките на 10 секунди
setup-enroll-choose-enroll = Изберете Enroll MOK, след това Continue
setup-enroll-choose-yes = Изберете Yes
setup-enroll-type-code = Въведете кода, след това изберете Reboot
setup-enroll-digits = { $count ->
    [one] { $count } цифра
   *[other] { $count } цифри
}
setup-secure-boot-title = Компютърът ви все още не се доверява на Luft
setup-secure-boot-code = Веднага след следващото рестартиране син екран ще попита дали да се довери на Luft. Въведете там този код с клавиатурата.
setup-secure-boot-skipped = Синият екран беше пропуснат. Вземете нов код и рестартирайте, след което използвайте клавиатурата там.
setup-secure-boot-getting = Получаване на кода…
setup-secure-boot-new-code = Вземи нов код

## Encryption

setup-protect-title = Защита на файловете
setup-protect-tpm = Шифровайте компютъра, така че никой да не може да чете файловете ви, без да влезе в акаунта, дори ако компютърът бъде изгубен. Той се отключва сам при стартиране.
setup-protect-passphrase = Шифровайте компютъра, така че никой да не може да чете файловете ви без паролата за диска, дори ако компютърът бъде изгубен.
setup-protect-keep-safe = Пазете този ключ за възстановяване на сигурно място, далеч от компютъра. Ще ви трябва, ако компютърът някога не може да се отключи сам.
setup-protect-passphrase-label = Парола за диска
setup-protect-repeat = Въведете я отново
setup-protect-mismatch = Не съвпадат
setup-protect-kept = Запазих ключа си за възстановяване
setup-protect-encrypt = Шифровай

## Fingerprint

setup-fingerprint-title = Вход с пръстов отпечатък
setup-fingerprint-description = Отключвайте Luft с докосване, вместо да въвеждате паролата си. Можете да добавите още пръсти по-късно в Настройки.
setup-fingerprint-which = Кой пръст?
setup-fingerprint-another = Да се добави ли още един пръст?
setup-fingerprint-finger = Пръст
setup-fingerprint-no-reader = Четецът на отпечатъци не отговаря. Можете да добавите отпечатък по-късно в Настройки.
setup-fingerprint-add = Добави отпечатък
setup-fingerprint-choose-another = Избери друг пръст

## Done

setup-ready-title = Всичко е готово
setup-ready-trust = Рестартирайте още веднъж, за да завършите. Веднага след рестартирането син екран ще попита дали да се довери на Luft. Въведете там този код с клавиатурата.
setup-ready-done = Работният ви плот е готов. Приятна работа с Luft.
setup-ready-start = Започни работа с Luft
