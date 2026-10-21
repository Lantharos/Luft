## Messages that some steps share

meet-back = Назад
meet-cancel = Откажи
meet-continue = Продолжи
meet-try-again = Обиди се повторно
meet-restart = Рестартирај
meet-remove = Отстрани
meet-keep-it = Задржи го
meet-close = Затвори
meet-restart-title = Да се рестартира сега?
meet-not-yet = Не сега
meet-iso-use = Користи ISO што веќе го имам
meet-iso-using = Се користи вашето ISO на Luft
meet-nightly = Ноќни верзии
meet-channel-nightly = Meet Luft ќе користи ноќни верзии
meet-channel-latest = Meet Luft повторно ќе користи редовни изданија
meet-undo = Врати
meet-logs-saved = Дневниците од пробувањето на Luft се зачувани на работната површина
meet-logs-show = Прикажи
meet-logs-none = Сè уште нема дневници од пробувањето на Luft
meet-logs-failed = Meet Luft не можеше да ги зачува дневниците од пробувањето на Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft не можеше да го заврши прегледот на овој компјутер.
   *[windows] Meet Luft не можеше да го заврши прегледот на овој компјутер.
}
problem-room = Правењето место за Luft не заврши.
problem-room-linux = Подготовката на Luft не заврши.
problem-update = Ажурирањето на Luft не заврши.
problem-download = Преземањето на Luft запре. Проверете дали сте поврзани на интернет.
problem-pack = Пакувањето на вашите работи не заврши.
problem-remove = Отстранувањето на Luft не заврши.
problem-restart = Meet Luft не можеше да го подготви рестартирањето.
problem-tidy = Старите записи за стартување не можеа да се отстранат.
problem-firmware = Meet Luft не можеше да ги отвори поставките на фирмверот.
problem-folders = Meet Luft не можеше да ги прегледа вашите папки.
problem-sticks = Meet Luft не можеше да бара USB-мемории.
problem-stick = Правењето на USB-меморијата не заврши.
problem-offer = Luft моментално не може да се преземе. Проверете дали сте поврзани на интернет или користете ISO што веќе го имате.
problem-declined = { $platform ->
    [linux] На Meet Luft му е потребна ваша дозвола за да работи на дискот. Внесете ја лозинката кога ќе ве праша.
   *[windows] На Meet Luft му е потребна ваша дозвола за да работи на дискот. Изберете Да кога Windows ќе праша.
}

## First screen

hello-intro = { $platform ->
    [linux] Пробајте го Luft директно од тука, без USB-меморија. Ако ви се допадне, Luft може да го заземе местото на овој систем и да ги задржи вашите датотеки.
   *[windows] Luft може да стои веднаш покрај Windows. Најпрвин пробајте го без да инсталирате ништо, а кога ќе бидете подготвени, понесете ги своите работи.
}
hello-check = { $platform ->
    [linux] Провери го овој компјутер
   *[windows] Провери го овој компјутер
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Се прегледува овој компјутер
   *[windows] Се прегледува овој компјутер
}
check-ready-title = { $platform ->
    [linux] Овој компјутер е подготвен за Luft
   *[windows] Овој компјутер е подготвен за Luft
}
check-blocked-title = Уште малку
check-moment = Ова трае кратко.
check-slow = Windows пресметува колку простор може да одвои. На голем диск ова може да трае неколку минути.
check-blocked-description = Нешто треба да се смени пред Luft да се всели. Еве што да направите.
check-found-description = Еве што пронајде Meet Luft.
check-checking = Се проверуваат дискот, фирмверот и хардверот…
check-again = Провери повторно
check-action-firmware = Отвори ги поставките на фирмверот
check-action-tidy = Расчисти
check-firmware-title = Да се рестартира во поставките на фирмверот?
check-firmware-description = Најпрвин зачувајте сè на што работите. Таму вклучете го Secure Boot и зачувајте, а компјутерот потоа повторно се стартува како обично.
check-tidy-title = Да се отстранат старите записи за стартување?
check-tidy-description = Тие покажуваат само кон системи што веќе ги нема. Windows и сè друго се стартуваат исто како досега.
check-get-ready-title = Да се подготви Luft?
check-get-ready-file = Meet Luft го копира Luft од вашето ISO во папка на овој компјутер и додава запис за стартување за него. Партициите остануваат какви што се.
check-get-ready-download = Meet Luft го презема Luft, околу { $size }, во папка на овој компјутер и додава запис за стартување за него. Партициите остануваат какви што се.
check-get-ready-confirm = Подготви го

## Choosing how much of the Windows drive Luft gets

room-title = Колку простор за Luft?
room-description = Windows се намалува за да му даде простор на Luft. Вашите датотеки во Windows остануваат токму каде што се.
room-live = Windows задржува простор за раст. Luft одвојува уште { $size } за стартување и ги враќа штом ќе биде инсталиран.
room-make = Направи место
room-confirm-title = Да се дадат { $size } на Luft?
room-confirm-file = Windows го намалува својот диск, а потоа Meet Luft го копира Luft од вашето ISO. Држете го компјутерот приклучен на струја.
room-confirm-download = Windows го намалува својот диск, а потоа Meet Luft го презема Luft, околу { $size }. Држете го компјутерот приклучен на струја и на интернет.

## Luft is ready on Windows

ready-title = Luft е подготвен
ready-description = Изберете како сакате да се запознаете. Потоа Windows се стартува како обично, освен ако не го инсталирате Luft и не го изберете.
ready-update-title = Земи го најновиот Luft
ready-update-description = Излезе понова верзија. Ја заменува оваа и ги задржува просторот и сè што спакувавте.
ready-try-title = Пробај го Luft
ready-try-description = Рестартирајте во Luft без да инсталирате ништо. Следниот пат Windows се стартува како обично.
ready-box-description = Спакувајте документи, фотографии, Wi-Fi-мрежи и друго, за Luft да ги отпакува кога ќе се инсталира.
ready-box-packed = Спакувано, { $size }
ready-install-title = Инсталирај Luft
ready-install-description = Рестартирајте во инсталаторот. Просторот од { $size } покрај Windows веќе го чека.
ready-stick-description = Ставете го Luft на USB-меморија за да го стартувате на кој било компјутер.
ready-remove = Отстрани го Luft од овој компјутер
ready-restart-try = Најпрвин зачувајте сè на што работите. Luft се отвора за околу една минута, а следното рестартирање ве враќа во Windows.
ready-restart-install = Најпрвин зачувајте сè на што работите. Инсталаторот се отвора за околу една минута, а ништо не се менува додека не потврдите таму.
ready-fast-startup-title = Исклучи го Брзо стартување во Windows
ready-fast-startup-description = Тогаш Windows целосно се исклучува, па звукот, Wi-Fi и Bluetooth почнуваат од почеток во Luft.
ready-clock-title = Точен часовник во двата системи
ready-clock-description = Windows го чита часовникот на компјутерот како Luft, па времето повеќе не скока кога ќе се префрлите.
ready-remove-title = Да се отстрани Luft од овој компјутер?
ready-remove-description = Meet Luft брише сè што додаде, вклучително и кутијата за селење, и му го враќа на Windows целиот негов простор.

## Luft is ready on Linux

linux-ready-description = Изберете како сакате да се запознаете. Додека не одлучите поинаку, { $system } продолжува да се стартува како обично.
linux-ready-this-system = овој систем
linux-ready-update-description = Излезе понова верзија. Ја заменува онаа што ја чува Meet Luft и ги задржува дневниците од пробувањето.
linux-ready-try-description = Рестартирајте во Luft без да менувате ништо. Следниот пат { $system } се стартува како обично.
linux-ready-replace-title = Замени го { $system }
linux-ready-replace-description = Luft го зазема неговото место и ги задржува вашите датотеки, сметката, Wi-Fi-мрежите и другите дискови. Стариот систем останува додека не го отстраните.
linux-ready-install-description = Рестартирајте во инсталаторот за да го ставите Luft на друг диск или во слободен простор.
linux-ready-remove = Отстрани го Luft од овој компјутер
linux-ready-restart-try = Најпрвин зачувајте сè на што работите. Luft се отвора за околу една минута, а следното рестартирање ве враќа во { $system }.
linux-ready-restart-replace = Најпрвин зачувајте сè на што работите. Инсталаторот се отвора со { $system } избран за замена и покажува што останува пред да се смени нешто.
linux-ready-remove-title = Да се отстрани Luft од овој компјутер?
linux-ready-remove-description = Meet Luft ги брише датотеките на Luft, неговите датотеки за стартување и неговиот запис за стартување. Сè друго останува какво што е.

## Packing things to take along to Luft (the moving box)

box-title = Понесете ги своите работи
box-description = Изберете што да понесете. Luft го отпакува тоа во вашата нова сметка кога ќе се инсталира, а од Windows ништо не се отстранува.
box-looking = Се прегледуваат вашите папки…
box-folder-desktop = Работна површина
box-folder-documents = Документи
box-folder-downloads = Преземања
box-folder-music = Музика
box-folder-pictures = Слики
box-folder-videos = Видеа
box-folder-size = { $size }, { $files ->
    [one] { $files } датотека
   *[other] { $files } датотеки
}
box-wifi-title = Wi-Fi-мрежи
box-wifi-description = Со нивните лозинки, за Luft веднаш да биде на интернет
box-bluetooth-title = Bluetooth-уреди
box-bluetooth-description = { $devices ->
    [one] { $devices } уред, подготвен без повторно спарување
   *[other] { $devices } уреди, подготвени без повторно спарување
}
box-wallpaper-title = Позадина
box-wallpaper-description = Сликата на вашата работна површина во Windows
box-account-title = Вашето име и слика
box-total-slow = { $size }, пакувањето трае околу { $minutes ->
    [one] { $minutes } минута
   *[other] { $minutes } минути
}
box-pack = Спакувај

## Progress while Meet Luft works

working-shrinking = Се прави место
    .description = Windows ги преместува своите датотеки за да направи простор. Ова може да трае неколку минути.
working-partitioning = Се поставува просторот за Luft
    .description = Се подготвуваат партициите од кои се стартува Luft.
working-downloading = Luft се пренесува
    .description = Luft се копира директно во својот простор и успатно се проверува.
working-packing = Се пакуваат вашите работи
    .description = Сè што избравте се копира во кутијата за селење. Големите папки траат подолго.
working-removing = Се отстранува Luft
    .description = Просторот му се враќа на Windows.
working-removing-linux = Се отстранува Luft
    .description = Се вадат неговите датотеки и записот за стартување.
working-writing = Се прави USB-меморијата
    .description = Luft се запишува на целата меморија. Држете ја приклучена.
working-copying = Luft се додава во Ventoy
    .description = Luft се копира до другите ISO-датотеки на меморијата. Држете ја приклучена.
working-verifying = Се проверува USB-меморијата
    .description = Сè се чита повторно за да се провери дека се стартува.
working-stick-downloading = Се презема Luft
    .description = Успатно се проверува и се чува, па следната USB-меморија се прави побрзо.
working-progress = { $done } од { $total }
working-keep-open = Оставете го овој прозорец отворен.

## After Luft was removed

removed-title = Сè е како што беше
removed-description = { $platform ->
    [linux] Датотеките на Luft и неговиот запис за стартување ги нема, а компјутерот се стартува исто како порано. Вратете се кога сакате.
   *[windows] Партициите на Luft и неговиот запис за стартување ги нема, а Windows повторно го има целиот свој простор. Вратете се кога сакате.
}

## Making a USB stick

stick-title = Правење USB-меморија
stick-description = Од неа Luft се стартува на кој било компјутер, за да го пробате или инсталирате.
stick-looking = Се бараат USB-мемории…
stick-none = Приклучете USB-меморија од { $size } или поголема. Ќе се појави тука.
stick-drives-label = USB-мемории
stick-offer = { $name }, { $size }
stick-make = Направи USB-меморија
stick-drive-empty = Празна
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Премала за Luft
stick-ventoy-title = Оваа USB-меморија користи Ventoy
stick-ventoy-description = Да се додаде Luft на неа или да се избрише целата и да стане USB-меморија за Luft?
stick-erase-it = Избриши ја
stick-add = Додај Luft
stick-replace-title = Да се замени Luft на неа?
stick-replace-description = { $count ->
    [one] { $names } веќе е на оваа USB-меморија. Новиот Luft може да го заземе неговото место.
   *[other] { $names } веќе се на оваа USB-меморија. Новиот Luft може да го заземе нивното место.
}
stick-keep = { $count ->
    [one] Задржи ги двата
   *[other] Задржи ги сите
}
stick-replace = Замени
stick-full-title = Нема место за Luft
stick-full-description = На Luft му требаат { $needed }, а на оваа USB-меморија се слободни { $free }. Направете место на неа или избришете ја и направете ја USB-меморија за Luft.
stick-erase-title = Да се избрише меморијата { $name }?
stick-erase-description = Сè на оваа USB-меморија од { $size } се брише и се заменува со Luft. Ова не може да се врати.
stick-erase-confirm = Избриши и направи USB-меморија
stick-done-title = Вашата USB-меморија со Luft е подготвена
stick-done-ventoy-title = Luft е на вашата USB-меморија со Ventoy
stick-done-take-out = Сега можете да ја извадите.
stick-done-eject = Исфрлете ја пред да ја извадите.
stick-done-start = За да стартувате од неа, приклучете ја и изберете ја во менито за стартување на компјутерот, кое се отвора со копче како F12, F8 или Esc веднаш по вклучувањето.
stick-done-ventoy-key = Со вклучен Secure Boot, Ventoy при првото стартување еднаш бара да се регистрира неговиот сопствен клуч.
stick-done = Готово
stick-done-another = Направи уште една
