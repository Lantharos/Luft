## Buttons used across steps

setup-continue = Настави
setup-back = Назад
setup-cancel = Откажи
setup-not-now = Не сада
setup-try-again = Покушај поново
setup-restart = Поново покрени
setup-restart-now = Поново покрени сада
setup-restart-later = Поново покрени касније
setup-saving = Чување…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Инсталирање система Luft
setup-installing-progress = Инсталирање, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Претрага
setup-picker-no-match = Ништа се не поклапа

## Welcome step: language, keyboard and time zone

setup-region-title = Добро дошли у Luft
setup-region-language = Језик
setup-region-keyboard = Тастатура
setup-region-time-zone = Временска зона
setup-region-intro = Хајде да подесимо рачунар. Изаберите језик, тастатуру и временску зону.
setup-region-intro-guessed-computer = Хајде да подесимо рачунар. Ово смо претпоставили на основу рачунара, па промените оно што не одговара.
setup-region-intro-guessed = Хајде да подесимо рачунар. Претпоставили смо { $guesses }, па промените оно што не одговара.
setup-region-guess-from-computer = { $fields } на основу рачунара
setup-region-guess-from-network = { $fields } на основу мреже
setup-region-field-language = језик
setup-region-field-keyboard = тастатуру
setup-region-field-time-zone = временску зону

## Where Luft goes

setup-destination-choose-title = Где да се инсталира Luft?
setup-destination-choose-description = Изаберите како ће Luft бити смештен на овом рачунару. Ништа се не мења док не потврдите.
setup-destination-alongside-title = Направите места поред система Windows
setup-destination-alongside-description = Windows се смањује да би било места за Luft. Ваше датотеке у систему Windows остају нетакнуте.
setup-destination-whole-title = Изаберите диск
setup-destination-whole-description = Luft заузима цео диск. Све на њему се брише.
setup-destination-custom-title = Изаберите простор за Luft
setup-destination-custom-description = Распоредите дискове по свом у апликацији Дискови.
setup-destination-replace-title = Замена система { $system }
setup-destination-replace-description = Luft заузима његово место и задржава оно што је ваше.
setup-destination-meet-title = Поред система Windows
setup-destination-meet-description = Апликација Meet Luft је већ направила место, па Windows остаје онакав какав је.
setup-destination-meet-drive-title = На диску { $drive }
setup-destination-meet-drive-description = Апликација Meet Luft је већ направила место на другом диску, а Luft се покреће одатле са сопственим датотекама за покретање.
setup-destination-looking = Прегледање дискова…

setup-destination-meet-choice = Поред система Windows
setup-destination-meet-choice-description = Простор од { $size } који је апликација Meet Luft направила поред система Windows.
setup-destination-meet-drive-choice = На диску { $drive }
setup-destination-meet-drive-choice-description = Простор од { $size } који је апликација Meet Luft направила на диску { $drive }.
setup-destination-alongside-choice = Поред система { $windows }
setup-destination-alongside-choice-description = Windows и његове датотеке остају, а Luft добија део његовог диска.
setup-destination-replace-choice = Замени систем { $system }
setup-destination-replace-choice-description = Ваше датотеке, налог и подешавања остају, а Luft заузима место старог система.
setup-destination-whole-choice = Користи цео диск
setup-destination-whole-choice-description = Диск се брише и цео се предаје систему Luft.
setup-destination-try-choice = Само испробај Luft
setup-destination-try-choice-description = Прво разгледајте. Ништа се не инсталира и дискови остају нетакнути.
setup-destination-custom-choice = Прилагођено
setup-destination-custom-choice-description = Сами распоредите партиције у апликацији Дискови.

setup-destination-more-options = Више опција
setup-destination-starting = Покретање…
setup-destination-replace = Замени
setup-destination-install = Инсталирај Luft

## Confirming where Luft goes

setup-confirm-replace-title = Заменити систем { $system }?
setup-confirm-erase-title = Избрисати диск { $drive }?
setup-confirm-shrink-title = Смањити Windows на { $size }?
setup-confirm-meet-title = Инсталирати Luft поред система Windows?
setup-confirm-meet-drive-title = Инсталирати Luft на диск { $drive }?
setup-confirm-free-title = Инсталирати Luft у слободан простор?
setup-confirm-replace-keep-old = Luft одмах почиње копирање. Стари систем се више неће покретати, а његове датотеке остају док их не уклоните.
setup-confirm-replace-erase-old = Luft одмах почиње копирање. Стари систем се трајно брише, а ваше датотеке остају где јесу.
setup-confirm-erase-description = Све на овом диску се трајно брише, укључујући друге системе и датотеке.
setup-confirm-install-description = Luft одмах почиње копирање. Док ради, можете да подесите налог.
setup-confirm-erase = Избриши и инсталирај
setup-confirm-install = Инсталирај

## Making room next to Windows

setup-alongside-hint = Превуците да бисте поделили диск { $drive } између система Windows и Luft. Windows задржава све своје датотеке и нешто простора за раст.
setup-windows-bitlocker = Windows држи овај диск закључан шифровањем BitLocker, па Luft на њему не може да направи места. У систему Windows искључите шифровање уређаја или смањите диск у Управљању дисковима и изаберите слободан простор под Прилагођено.
setup-windows-hibernated = Windows је у стању спавања или је искључен уз Брзо покретање, па његов диск не може безбедно да се мења. Покрените Windows, држите Shift док бирате Искључи, па опет покрените Luft.
setup-windows-dirty = Диск система Windows прво треба кратко да се провери. Покрените Windows, једном га поново покрените, па опет покрените Luft.
setup-windows-full = Систему Windows треба скоро цео његов диск. Ослободите око { $size } у систему Windows, па опет покрените Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Ствари које сте спаковали у систему Windows, { $size }, распакују се у ваш нови налог.

## Windows options

setup-windows-fast-startup = Искључи Брзо покретање у систему Windows
setup-windows-fast-startup-description = Windows ће се тада потпуно гасити, па звук, Wi-Fi и Bluetooth у систему Luft крећу из почетка, а његов диск остаје доступан.
setup-windows-clock = Тачно време у оба система
setup-windows-clock-description = Windows чита сат рачунара на исти начин као Luft, па се време више не помера када прелазите из једног у други.
setup-windows-bluetooth = Пренеси Bluetooth уређаје
setup-windows-bluetooth-description = { $count ->
    [one] { $count } уређај упарен у систему Windows радиће у систему Luft без поновног упаривања.
    [few] { $count } уређаја упарена у систему Windows радиће у систему Luft без поновног упаривања.
   *[other] { $count } уређаја упарених у систему Windows радиће у систему Luft без поновног упаривања.
}

## Choosing a drive

setup-drives-label = Дискови
setup-drives-none = Нема диска који Luft може да користи. Повежите диск и потражите поново.
setup-drive-has-windows = Има { $windows }
setup-drive-empty = Празан
setup-drive-partitions = { $count ->
    [one] Има { $count } партицију
    [few] Има { $count } партиције
   *[other] Има { $count } партиција
}

## Custom space

setup-custom-open-disks = Отвори Дискове
setup-custom-looking = Тражење…
setup-custom-look-again = Потражи поново
setup-custom-free-label = Слободан простор
setup-custom-free-space = { $size } слободног простора
setup-custom-on-drive = На диску { $drive }
setup-custom-none = Направите бар { $size } слободног простора у апликацији Дискови, па потражите поново. Luft се инсталира у простор који оставите слободним.

## Replacing a Linux system

setup-replace-stays = Шта остаје
setup-replace-changes = Шта се мења
setup-replace-keeps-account = Ваше датотеке и ваш налог { $account }
setup-replace-keeps-account-password = Ваше датотеке и ваш налог { $account } са лозинком
setup-replace-keeps-accounts = { $count ->
    [one] Још { $count } налог на њему, са својим датотекама
    [few] Још { $count } налога на њему, са својим датотекама
   *[other] Још { $count } налога на њему, са својим датотекама
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } мрежна веза, са лозинком за Wi-Fi
    [few] { $count } мрежне везе, са лозинкама за Wi-Fi
   *[other] { $count } мрежних веза, са лозинкама за Wi-Fi
}
setup-replace-keeps-drives = { $drives }, који се као и до сада монтирају при покретању
setup-replace-keeps-hostname = Назив рачунара, { $hostname }, и његови SSH кључеви
setup-replace-keeps-tools = { $count ->
    [one] { $count } алат за командну линију који сте инсталирали, у окружењу Toolbox након пријаве
    [few] { $count } алата за командну линију које сте инсталирали, у окружењу Toolbox након пријаве
   *[other] { $count } алата за командну линију које сте инсталирали, у окружењу Toolbox након пријаве
}
setup-replace-keeps-old = Систем { $system } се више не покреће. Његове системске датотеке чувају се као old-system док их не уклоните у апликацији Дискови или у Подешавањима.
setup-replace-erases-system = Системска партиција система { $system } се брише. Ваше датотеке су на засебној партицији и остају нетакнуте.
setup-replace-clears-boot = Његова партиција /boot се празни за датотеке којима се Luft покреће.
setup-replace-apps = Апликације инсталиране у њему не прелазе. Поново их преузмите у апликацији Schelf.

setup-replace-blocked-encrypted = Шифрован је, па замена уз задржавање датотека још није подржана.
setup-replace-blocked-single = Ваше датотеке деле партицију са системом, па замена уз њихово задржавање још није подржана.
setup-replace-blocked-layout = Његов диск је распоређен на начин који Luft још не може да замени.
setup-replace-blocked-startup = Његова EFI системска партиција је премала за Luft, а нема ни партиције /boot која би се користила уместо ње.
setup-replace-blocked-no-account = Нема налог који би се пренео.
setup-replace-blocked-running = Luft се тренутно покреће са њега. Покрените Luft са USB флеша да бисте га заменили.
setup-replace-blocked-read-only = Његов диск је само за читање.

## Connecting to the internet

setup-network-title = Повежите се на интернет
setup-network-description = Ово није обавезно. Када сте на мрежи, Luft може да подеси сат и временску зону, а интернет можете да користите док се Luft инсталира.
setup-network-unavailable = Мреже тренутно нису доступне. Можете се повезати касније са траке задатака.
setup-network-looking = Тражење мрежа…
setup-network-cable = Повезано каблом
setup-network-show-all = Прикажи све мреже
setup-network-skip = Прескочи
setup-network-failed = Повезивање није успело
setup-network-wrong-password = Погрешна лозинка
setup-network-connected = Повезано
setup-network-connecting = Повезивање…
setup-network-saved = Сачувано
setup-network-password = Лозинка
setup-network-join = Повежи

## Account

setup-account-title = Ко користи овај рачунар?
setup-account-description = Овим налогом се пријављујете. Касније можете да додате још људи у Подешавањима.
setup-account-full-name = Ваше име
setup-account-full-name-example = Никола Тесла
setup-account-user-name = Корисничко име
setup-account-password = Лозинка
setup-account-repeat = Унесите је поново
setup-account-user-name-invalid = Користите мала латинична слова, бројеве, - и _
setup-account-full-name-invalid = Изоставите зарезе и двотачке
setup-account-mismatch = Лозинке се не поклапају

## Installing

setup-finishing-failed-title = Luft није могао да се инсталира
setup-finishing-failed-description = Нешто је пошло наопако током инсталирања.
setup-finishing-failed-stick = Рачунар се и даље покреће као и раније. Можете да наставите да користите Luft са USB флеша или да поново покренете рачунар и покушате опет.
setup-finishing-failed-trying = Рачунар се и даље покреће као и раније. Можете да наставите да користите Luft овакав какав је сада или да поново покренете рачунар и покушате опет.
setup-finishing-use-stick = Користи Luft са флеша
setup-finishing-keep-trying = Настави са испробавањем
setup-finishing-installed-title = Luft је инсталиран
setup-finishing-trust-stick = Извадите USB флеш када екран потамни. Плави екран ће затим тражити да потврдите поверење у Luft. Тамо користите тастатуру.
setup-finishing-trust = Одмах после поновног покретања плави екран ће тражити да потврдите поверење у Luft. Тамо користите тастатуру.
setup-finishing-restart-stick = Поново покрените рачунар да бисте почели да користите Luft. Извадите USB флеш када екран потамни.
setup-finishing-restart = Поново покрените рачунар да бисте почели да користите Luft.
setup-finishing-title = Још мало
setup-finishing-description = Luft се копира на рачунар. То траје неколико минута.
setup-finishing-plug-in = Држите рачунар прикључен на струју док се не заврши.
setup-stage-idle = Припрема
setup-stage-preparing = Прављење места за Luft
setup-stage-copying = Копирање система Luft
setup-stage-waiting = Завршавање
setup-stage-configuring = Подешавање вашег налога
setup-stage-finished = Готово

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Притисните тастер у року од 10 секунди
setup-enroll-choose-enroll = Изаберите Enroll MOK, затим Continue
setup-enroll-choose-yes = Изаберите Yes
setup-enroll-type-code = Укуцајте код, затим изаберите Reboot
setup-enroll-digits = { $count ->
    [one] { $count } цифра
    [few] { $count } цифре
   *[other] { $count } цифара
}
setup-secure-boot-title = Рачунар још не верује систему Luft
setup-secure-boot-code = Одмах после следећег поновног покретања плави екран ће тражити да потврдите поверење у Luft. Тамо помоћу тастатуре унесите овај код.
setup-secure-boot-skipped = Плави екран је прескочен. Набавите нови код и поново покрените рачунар, па тамо користите тастатуру.
setup-secure-boot-getting = Прибављање кода…
setup-secure-boot-new-code = Набави нови код

## Encryption

setup-protect-title = Заштитите своје датотеке
setup-protect-tpm = Шифрујте овај рачунар да нико не би могао да прочита ваше датотеке без пријаве, чак и ако се рачунар изгуби. При покретању се откључава сам.
setup-protect-passphrase = Шифрујте овај рачунар да нико не би могао да прочита ваше датотеке без ваше приступне фразе, чак и ако се рачунар изгуби.
setup-protect-keep-safe = Чувајте овај кључ за опоравак на сигурном месту, даље од овог рачунара. Биће вам потребан ако се рачунар икада не откључа сам.
setup-protect-passphrase-label = Приступна фраза
setup-protect-repeat = Унесите је поново
setup-protect-mismatch = Не поклапају се
setup-protect-kept = Кључ за опоравак је сачуван
setup-protect-skip = Не шифруј
setup-protect-encrypt = Шифруј

## Fingerprint

setup-fingerprint-title = Пријављујте се отиском прста
setup-fingerprint-description = Откључајте Luft додиром уместо уношења лозинке. Касније можете да додате још прстију у Подешавањима.
setup-fingerprint-which = Који прст?
setup-fingerprint-another = Додати још један прст?
setup-fingerprint-finger = Прст
setup-fingerprint-no-reader = Читач отисака прстију не одговара. Отисак прста можете да додате касније у Подешавањима.
setup-fingerprint-add = Додај отисак прста
setup-fingerprint-choose-another = Изабери други прст

## Done

setup-ready-title = Све је спремно
setup-ready-trust = Поново покрените рачунар још једном да бисте завршили. Одмах после поновног покретања плави екран ће тражити да потврдите поверење у Luft. Тамо помоћу тастатуре унесите овај код.
setup-ready-done = Радна површина је спремна. Уживајте у систему Luft.
setup-ready-start = Почни да користиш Luft
