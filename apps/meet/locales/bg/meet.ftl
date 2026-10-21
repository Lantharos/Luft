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
