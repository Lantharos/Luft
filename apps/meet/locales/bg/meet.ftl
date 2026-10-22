## Messages that some steps share

meet-back = Назад
meet-cancel = Отказ
meet-continue = Продължи
meet-try-again = Опитай отново
meet-restart = Рестартирай
meet-remove = Премахни
meet-keep-it = Запази го
meet-close = Затвори
meet-restart-title = Да се рестартира ли сега?
meet-not-yet = Още не
meet-iso-use = Използвай наличен ISO образ
meet-iso-using = Използва се вашият ISO образ на Luft
meet-nightly = Нощни версии
meet-channel-nightly = Meet Luft ще използва нощни версии
meet-channel-latest = Meet Luft отново ще използва издания
meet-undo = Отмени
meet-logs-saved = Журналите от пробването на Luft са запазени на работния плот
meet-logs-show = Покажи
meet-logs-none = Все още няма журнали от пробването на Luft
meet-logs-failed = Meet Luft не можа да запази журналите от пробването на Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft не можа да завърши проверката на този компютър.
   *[windows] Meet Luft не можа да завърши проверката на този компютър.
}
problem-room = Освобождаването на място за Luft не завърши.
problem-room-linux = Подготовката на Luft не завърши.
problem-update = Актуализирането на Luft не завърши.
problem-download = Изтеглянето на Luft спря. Проверете дали сте свързани с интернет.
problem-pack = Опаковането на нещата ви не завърши.
problem-remove = Премахването на Luft не завърши.
problem-restart = Meet Luft не можа да подготви рестартирането.
problem-tidy = Старите записи за стартиране не можаха да бъдат премахнати.
problem-firmware = Meet Luft не можа да отвори настройките на фърмуера.
problem-folders = Meet Luft не можа да прегледа папките ви.
problem-sticks = Meet Luft не можа да потърси USB устройства.
problem-stick = Създаването на флашката не завърши.
problem-offer = В момента Luft не може да бъде изтеглен. Проверете дали сте свързани с интернет или използвайте наличен ISO образ.
problem-luft = Meet Luft не можа да прегледа диска на Luft.
problem-resize = Промяната на размера на Luft не завърши.
problem-cancel = Meet Luft не можа да отмени промяната.
problem-give = Windows не можа да си върне мястото.
problem-declined = { $platform ->
    [linux] Meet Luft се нуждае от разрешението ви, за да работи с диска. Въведете паролата си, когато бъде поискана.
   *[windows] Meet Luft се нуждае от разрешението ви, за да работи с диска. Изберете Да, когато Windows попита.
}

## First screen

hello-intro = { $platform ->
    [linux] Пробвайте Luft направо оттук, без USB флашка. Ако ви хареса, Luft може да заеме мястото на тази система и да запази файловете ви.
   *[windows] Luft може да стои точно до Windows. Първо го пробвайте, без да инсталирате нищо, и пренесете нещата си, когато сте готови.
}
hello-check = { $platform ->
    [linux] Провери този компютър
   *[windows] Провери този компютър
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Преглеждане на този компютър
   *[windows] Преглеждане на този компютър
}
check-ready-title = { $platform ->
    [linux] Този компютър е готов за Luft
   *[windows] Този компютър е готов за Luft
}
check-blocked-title = Почти готово
check-moment = Отнема само момент.
check-slow = Windows изчислява колко място може да отдели. При голям диск това може да отнеме няколко минути.
check-blocked-description = Нещо трябва да се промени, преди Luft да се настани. Ето какво да направите.
check-found-description = Ето какво откри Meet Luft.
check-checking = Проверка на диска, фърмуера и хардуера…
check-again = Провери отново
check-action-firmware = Отвори настройките на фърмуера
check-action-tidy = Разчисти
check-firmware-title = Да се рестартира ли в настройките на фърмуера?
check-firmware-description = Първо запазете това, по което работите. Включете там Secure Boot и запазете, а компютърът ще стартира отново както обикновено.
check-tidy-title = Да се премахнат ли старите записи за стартиране?
check-tidy-description = Те сочат само към системи, които вече ги няма. Windows и всичко останало стартират точно както преди.
check-get-ready-title = Да се подготви ли Luft?
check-get-ready-file = Meet Luft копира Luft от вашия ISO образ в папка на този компютър и добавя запис за стартиране за него. Дяловете не се променят.
check-get-ready-download = Meet Luft изтегля Luft, около { $size }, в папка на този компютър и добавя запис за стартиране за него. Дяловете не се променят.
check-get-ready-confirm = Подготви го

## Choosing how much of the Windows drive Luft gets

room-title = Колко място за Luft?
room-description = Windows се смалява, за да освободи място за Luft. Файловете ви в Windows остават точно където са.
room-live = Windows запазва място, за да расте. Luft заделя и { $size } за начало и ги връща, след като бъде инсталиран.
room-make = Освободи място
room-confirm-title = Да се дадат ли { $size } на Luft?
room-confirm-file = Windows смалява диска си, след което Meet Luft копира Luft от вашия ISO образ. Дръжте компютъра включен в захранването.
room-confirm-download = Windows смалява диска си, след което Meet Luft изтегля Luft, около { $size }. Дръжте компютъра включен в захранването и свързан с интернет.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Къде да се настани Luft?
room-places-description = Luft може да дели диска на Windows или да заеме място, което Windows не използва.
room-places-label = Места за Luft
room-place-windows = До Windows
room-place-windows-detail = Windows се смалява, за да освободи място за Luft
room-place-windows-free = Там вече има { $size } свободни
room-place-free = Свободно място на { $drive }
room-place-free-here = Свободно място на диска на Windows
room-place-free-detail = { $size }, които нищо друго не използва
room-place-whole = Целият диск { $drive }
room-place-whole-detail = Изтрива този диск от { $size } за Luft
room-live-free = { $free } от тях вече са свободни, така че Windows отделя по-малко и запазва място, за да расте. Luft заделя и { $size } за начало и ги връща, след като бъде инсталиран.
room-live-elsewhere = Luft получава там { $room } и заделя още { $size } за начало, които връща, след като бъде инсталиран.
room-confirm-free-title = Да се дадат ли на Luft { $size } свободно място?
room-confirm-free-file = Meet Luft копира Luft там от вашия ISO образ. Нищо друго на диска не се променя.
room-confirm-free-download = Meet Luft изтегля Luft там, около { $size }. Нищо друго на диска не се променя. Дръжте компютъра свързан с интернет.
room-erase-title = Да се изтрие ли { $drive }?
room-erase-description = Всичко на този диск от { $size } се изтрива веднага, преди Luft да стартира. Това не може да бъде отменено. В момента на него има:
room-erase-empty = Windows не може да прочете нищо на този диск от { $size }, но каквото и да има на него, се изтрива веднага. Това не може да бъде отменено.
room-erase-unnamed = Дял без име
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Шифрован с BitLocker
room-erase-understood = Знам, че част от данните са шифровани с BitLocker и не могат да бъдат възстановени
room-erase-confirm = Изтрий и освободи място

## Luft is ready on Windows

ready-title = Luft е готов
ready-description = Изберете как искате да се запознаете с него. След това Windows стартира както обикновено, освен ако не инсталирате Luft и не го изберете.
ready-update-title = Най-новата версия на Luft
ready-update-description = Излязла е по-нова версия. Тя заменя тази и запазва мястото и всичко, което сте опаковали.
ready-try-title = Пробване на Luft
ready-try-description = Рестартирайте в Luft, без да инсталирате нищо. Следващия път Windows стартира както обикновено.
ready-box-description = Опаковайте документи, снимки, Wi-Fi мрежи и още неща, които Luft да разопакова след инсталирането.
ready-box-packed = Опаковано: { $size }
ready-install-title = Инсталиране на Luft
ready-install-description = Рестартирайте в инсталатора. Мястото от { $size } до Windows вече го чака.
ready-install-drive-description = Рестартирайте в инсталатора. Мястото от { $size } на { $drive } вече го чака.
ready-stick-description = Запишете Luft на флашка, за да го стартирате на всеки компютър.
ready-remove = Премахни Luft от този компютър
ready-restart-try = Първо запазете това, по което работите. Luft се отваря след около минута, а следващото рестартиране ви връща в Windows.
ready-restart-install = Първо запазете това, по което работите. Инсталаторът се отваря след около минута и нищо не се променя, докато не потвърдите там.
ready-fast-startup-title = Изключване на Бързо стартиране в Windows
ready-fast-startup-description = Тогава Windows се изключва напълно, така че звукът, Wi-Fi и Bluetooth стартират начисто в Luft.
ready-clock-title = Верен часовник и в двете системи
ready-clock-description = Windows чете часовника на компютъра по същия начин като Luft, така че часът вече не скача при превключване.
ready-remove-title = Да се премахне ли Luft от този компютър?
ready-remove-description = Meet Luft изтрива всичко, което е добавил, включително кашона за преместване, и връща цялото място на Windows.

## Luft is ready on Linux

linux-ready-description = Изберете как искате да се запознаете с него. { $system } продължава да стартира както обикновено, докато не решите друго.
linux-ready-this-system = тази система
linux-ready-update-description = Излязла е по-нова версия. Тя заменя тази, която Meet Luft пази, и запазва журналите от пробването.
linux-ready-try-description = Рестартирайте в Luft, без да променяте нищо. Следващия път { $system } стартира както обикновено.
linux-ready-replace-title = Замяна на { $system }
linux-ready-replace-description = Luft заема мястото ѝ и запазва файловете, акаунта, Wi-Fi мрежите и другите ви дискове. Старата система остава, докато не я премахнете.
linux-ready-install-description = Рестартирайте в инсталатора, за да поставите Luft на друг диск или в свободно място.
linux-ready-remove = Премахни Luft от този компютър
linux-ready-restart-try = Първо запазете това, по което работите. Luft се отваря след около минута, а следващото рестартиране ви връща в { $system }.
linux-ready-restart-replace = Първо запазете това, по което работите. Инсталаторът се отваря с { $system } като система за замяна и показва какво остава, преди нещо да се промени.
linux-ready-remove-title = Да се премахне ли Luft от този компютър?
linux-ready-remove-description = Meet Luft изтрива файловете на Luft, стартовите му файлове и записа му за стартиране. Всичко останало остава както е.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Вашият Luft
luft-looking = Meet Luft откри Luft на този компютър.
luft-checking = Преглеждане на диска на Luft…
luft-description-beside = Luft е инсталиран до Windows на този компютър.
luft-description-drive = Luft е инсталиран на { $drive }.
luft-bar-used = { $size }, използвани { $used }
luft-resize-title = Промяна на мястото за Luft
luft-resize-description = Дайте на Luft още от мястото на Windows или върнете част от него на Windows.
luft-resize-drive-description = Дайте на Luft още от свободното място на { $drive } или оставете част от него свободна.
luft-resize-passphrase = Дискът на Luft се отваря само с парола за диска, а Luft не може сам да я въведе, докато се премества.
luft-resize-start-first = Стартирайте Luft веднъж, за да може да каже на Meet Luft колко е запълнен, след което се върнете тук.
luft-resize-apart = Между Windows и Luft има друг дял, затова те не могат да делят мястото си.
luft-pending-grow = Luft се разширява при следващото си стартиране
luft-pending-grow-description = Рестартирайте в Luft и го оставете включен няколко минути, докато се премести в новото място. Междувременно можете да го използвате.
luft-pending-shrink = Luft освобождава място при следващото си стартиране
luft-pending-shrink-description = Рестартирайте в Luft и го оставете включен няколко минути, докато премести файловете си. След това отворете отново Meet Luft в Windows, за да дадете мястото на Windows.
luft-pending-trim = Luft се смалява при следващото си стартиране
luft-pending-trim-description = Рестартирайте в Luft и той ще се смали за около минута.
luft-windows-free-title = Даване на свободното място на Windows
luft-windows-free-description = { $size } точно след Windows не се използват от нищо. Windows може да си ги върне.
luft-leftovers-title = Разчистване след пробването на Luft
luft-leftovers-description = Дяловете, които Meet Luft създаде, за да стартира Luft, още са тук. Luft вече не се нуждае от тях.
luft-start = Рестартирай в Luft
luft-cancel = Отмени промяната
luft-restart = Първо запазете това, по което работите. Luft стартира след около минута, а следващото рестартиране ви връща в Windows.
luft-restart-pending = Първо запазете това, по което работите. Luft стартира след около минута и сам премества файловете си, което отнема няколко минути. Междувременно можете да го използвате.
luft-remove = Премахни Luft от този компютър
luft-remove-title = Да се премахне ли Luft от този компютър?
luft-remove-description = Luft и всичко в него се изтрива, общо { $size }, а Windows си връща мястото. Компютърът стартира Windows както преди. Това не може да бъде отменено.
luft-remove-drive-description = Luft и всичко в него се изтрива от { $drive }, общо { $size }. Компютърът стартира Windows както преди. Това не може да бъде отменено.
luft-remove-confirm = Премахни Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Колко място за Luft?
resize-description = Плъзнете, за да разделите диска между Windows и Luft. Luft сам прави промяната при следващото си стартиране.
resize-measuring = Windows изчислява колко място може да отдели. При голям диск това може да отнеме няколко минути.
resize-full = Luft е твърде запълнен, за да бъде преместен, а Windows не може да отдели достатъчно място за него. Първо освободете място в Luft или в Windows.
resize-drive-description = Плъзнете, за да изберете колко от { $drive } да заема Luft. Luft сам прави промяната при следващото си стартиране.
resize-drive-free = { $size } свободни на { $drive }
resize-used = Файловете на Luft заемат { $size }.
resize-least = Променете размера с поне { $size }.
resize-apply = Промени
resize-grow-title = Да се дадат ли на Luft още { $size }?
resize-grow-description = Windows се смалява веднага. Luft се премества в новото място при следващото си стартиране, което отнема няколко минути. Дръжте компютъра включен в захранването.
resize-grow-drive-description = Luft заема свободното място на { $drive } при следващото си стартиране, което отнема само миг.
resize-trim-title = Да се смали ли Luft с { $size }?
resize-trim-description = Luft се смалява при следващото си стартиране, а мястото на { $drive } остава свободно.
resize-shrink-title = Да се върнат ли { $size } на Windows?
resize-shrink-description = Luft премества файловете си при следващото си стартиране, което отнема няколко минути. След това отворете отново Meet Luft и Windows си връща мястото. Дръжте компютъра включен в захранването.

## Packing things to take along to Luft (the moving box)

box-title = Пренасяне на нещата ви
box-description = Изберете какво да вземете. Luft го разопакова в новия ви акаунт след инсталирането, а от Windows нищо не се премахва.
box-looking = Преглеждане на папките ви…
box-folder-desktop = Работен плот
box-folder-documents = Документи
box-folder-downloads = Изтегляния
box-folder-music = Музика
box-folder-pictures = Снимки
box-folder-videos = Видеоклипове
box-folder-size = { $size }, { $files ->
    [one] { $files } файл
   *[other] { $files } файла
}
box-wifi-title = Wi-Fi мрежи
box-wifi-description = С паролите им, така че Luft да е онлайн веднага
box-bluetooth-title = Устройства Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } устройство, готово без повторно сдвояване
   *[other] { $devices } устройства, готови без повторно сдвояване
}
box-wallpaper-title = Тапет
box-wallpaper-description = Картината на работния плот в Windows
box-account-title = Вашето име и снимка
box-total-slow = { $size }, опаковането отнема около { $minutes ->
    [one] { $minutes } минута
   *[other] { $minutes } минути
}
box-pack = Опаковай

## Progress while Meet Luft works

working-shrinking = Освобождаване на място
    .description = Windows премества файловете си, за да освободи място. Това може да отнеме няколко минути.
working-erasing = Изтриване на диска
    .description = Windows го изчиства, за да може Luft да заеме целия диск.
working-partitioning = Подготовка на мястото за Luft
    .description = Подготвят се дяловете, от които стартира Luft.
working-downloading = Пренасяне на Luft
    .description = Luft се копира направо в собственото си място и се проверява по пътя.
working-packing = Опаковане на нещата ви
    .description = Всичко избрано се копира в кашона за преместване. Големите папки отнемат време.
working-removing = Премахване на Luft
    .description = Мястото се връща на Windows.
working-removing-linux = Премахване на Luft
    .description = Премахват се файловете и записът му за стартиране.
working-writing = Създаване на флашката
    .description = Luft се записва върху цялата флашка. Не я изваждайте.
working-copying = Добавяне на Luft към Ventoy
    .description = Luft се копира до другите ISO образи на флашката. Не я изваждайте.
working-verifying = Проверка на флашката
    .description = Всичко се прочита обратно, за да се потвърди, че стартира.
working-stick-downloading = Изтегляне на Luft
    .description = Проверява се по пътя и се запазва, така че следващата флашка става по-бързо.
working-progress = { $done } от { $total }
working-keep-open = Не затваряйте този прозорец.

## After Luft was removed

removed-title = Всичко е както преди
removed-description = { $platform ->
    [linux] Файловете на Luft и записът му за стартиране са премахнати, а компютърът ви стартира точно както преди. Върнете се по всяко време.
   *[windows] Дяловете на Luft и записът му за стартиране са премахнати, а Windows отново разполага с цялото си място. Върнете се по всяко време.
}

## Making a USB stick

stick-title = Създаване на USB флашка
stick-description = Luft стартира от нея на всеки компютър, за да го пробвате или инсталирате.
stick-looking = Търсене на USB устройства…
stick-none = Включете USB флашка от { $size } или повече. Тя ще се покаже тук.
stick-drives-label = USB устройства
stick-offer = { $name }, { $size }
stick-make = Създай флашката
stick-drive-empty = Празна
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Твърде малка за Luft
stick-ventoy-title = Тази флашка използва Ventoy
stick-ventoy-description = Да се добави ли Luft към нея, или да се изтрие цялата флашка и да стане флашка с Luft?
stick-erase-it = Изтрий я
stick-add = Добави Luft
stick-replace-title = Да се замени ли Luft на нея?
stick-replace-description = { $count ->
    [one] { $names } вече е на тази флашка. Новият Luft може да заеме мястото му.
   *[other] { $names } вече са на тази флашка. Новият Luft може да заеме мястото им.
}
stick-keep = { $count ->
    [one] Запази и двата
   *[other] Запази всички
}
stick-replace = Замени
stick-full-title = Няма място за Luft
stick-full-description = Luft се нуждае от { $needed }, а свободното място на тази флашка е { $free }. Освободете място на нея или я изтрийте и я превърнете във флашка с Luft.
stick-erase-title = Да се изтрие ли { $name }?
stick-erase-description = Всичко на тази флашка от { $size } се изтрива и се заменя с Luft. Това не може да бъде отменено.
stick-erase-confirm = Изтрий и създай флашката
stick-done-title = Флашката с Luft е готова
stick-done-ventoy-title = Luft е на флашката ви с Ventoy
stick-done-take-out = Вече можете да я извадите.
stick-done-eject = Първо я изключете безопасно, а после я извадете.
stick-done-start = За да стартирате от нея, включете я и я изберете в менюто за зареждане на компютъра, което се отваря с клавиш като F12, F8 или Esc веднага след включване.
stick-done-ventoy-key = При включен Secure Boot Ventoy ще поиска веднъж да регистрира собствения си ключ при първото стартиране.
stick-done = Готово
stick-done-another = Създай още една
