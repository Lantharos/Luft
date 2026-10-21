## Messages that some steps share

meet-back = Назад
meet-cancel = Откажи
meet-continue = Настави
meet-try-again = Покушај поново
meet-restart = Поново покрени
meet-remove = Уклони
meet-keep-it = Задржи
meet-close = Затвори
meet-restart-title = Поново покренути сада?
meet-not-yet = Не још
meet-iso-use = Користи ISO који већ имам
meet-iso-using = Користи се ваш ISO за Luft
meet-nightly = Ноћне верзије
meet-channel-nightly = Meet Luft ће користити ноћне верзије
meet-channel-latest = Meet Luft ће поново користити издања
meet-undo = Опозови
meet-logs-saved = Евиденције из испробавања система Luft сачуване су на радну површину
meet-logs-show = Прикажи
meet-logs-none = Још нема евиденција из испробавања система Luft
meet-logs-failed = Апликација Meet Luft није могла да сачува евиденције из испробавања система Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Апликација Meet Luft није могла да заврши преглед овог рачунара.
   *[windows] Апликација Meet Luft није могла да заврши преглед овог рачунара.
}
problem-room = Прављење простора за Luft није завршено.
problem-room-linux = Припрема система Luft није завршена.
problem-update = Ажурирање система Luft није завршено.
problem-download = Преузимање система Luft је заустављено. Проверите да ли сте повезани на интернет.
problem-pack = Паковање ваших ствари није завршено.
problem-remove = Уклањање система Luft није завршено.
problem-restart = Апликација Meet Luft није могла да припреми поновно покретање.
problem-tidy = Старе ставке за покретање нису могле да се уклоне.
problem-firmware = Апликација Meet Luft није могла да отвори подешавања фирмвера.
problem-folders = Апликација Meet Luft није могла да прегледа ваше фасцикле.
problem-sticks = Апликација Meet Luft није могла да потражи USB уређаје.
problem-stick = Прављење USB флеша није завршено.
problem-offer = Luft тренутно не може да се преузме. Проверите да ли сте повезани на интернет или употребите ISO који већ имате.
problem-declined = { $platform ->
    [linux] Meet Luft тражи вашу дозволу за рад на диску. Унесите лозинку кад се затражи.
   *[windows] Meet Luft тражи вашу дозволу за рад на диску. Изаберите Да кад Windows то затражи.
}

## First screen

hello-intro = { $platform ->
    [linux] Испробајте Luft директно одавде, без USB флеша. Ако вам се допадне, Luft може да заузме место овог система и задржи ваше датотеке.
   *[windows] Luft може да живи одмах поред система Windows. Прво га испробајте без инсталирања, а своје ствари понесите кад будете спремни.
}
hello-check = { $platform ->
    [linux] Провери овај рачунар
   *[windows] Провери овај рачунар
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Преглед овог рачунара
   *[windows] Преглед овог рачунара
}
check-ready-title = { $platform ->
    [linux] Овај рачунар је спреман за Luft
   *[windows] Овај рачунар је спреман за Luft
}
check-blocked-title = Још мало
check-moment = Ово траје тренутак.
check-slow = Windows рачуна колико простора може да уступи. На великом диску то може да потраје неколико минута.
check-blocked-description = Нешто мора да се промени пре него што Luft може да се усели. Ево шта треба урадити.
check-found-description = Ево шта је апликација Meet Luft пронашла.
check-checking = Провера диска, фирмвера и хардвера…
check-again = Провери поново
check-action-firmware = Отвори подешавања фирмвера
check-action-tidy = Почисти
check-firmware-title = Поново покренути у подешавања фирмвера?
check-firmware-description = Прво сачувајте оно на чему радите. Тамо укључите Secure Boot и сачувајте промене, а рачунар ће се затим покренути као и обично.
check-tidy-title = Уклонити старе ставке за покретање?
check-tidy-description = Упућују само на системе којих више нема. Windows и све остало покрећу се као и раније.
check-get-ready-title = Припремити Luft?
check-get-ready-file = Meet Luft копира Luft из вашег ISO-а у фасциклу на овом рачунару и додаје ставку за покретање. Партиције се не мењају.
check-get-ready-download = Meet Luft преузима Luft, око { $size }, у фасциклу на овом рачунару и додаје ставку за покретање. Партиције се не мењају.
check-get-ready-confirm = Припреми

## Choosing how much of the Windows drive Luft gets

room-title = Колико простора за Luft?
room-description = Windows се смањује да би Luft добио простор. Ваше датотеке у систему Windows остају тачно где јесу.
room-live = Windows задржава простор за раст. Luft одваја и { $size } за покретање, које враћа после инсталације.
room-make = Направи простор
room-confirm-title = Дати систему Luft { $size }?
room-confirm-file = Windows смањује свој диск, а затим Meet Luft копира Luft из вашег ISO-а. Нека рачунар буде прикључен на напајање.
room-confirm-download = Windows смањује свој диск, а затим Meet Luft преузима Luft, око { $size }. Нека рачунар буде прикључен на напајање и интернет.

## Luft is ready on Windows

ready-title = Luft је спреман
ready-description = Изаберите како желите да га упознате. Windows се после покреће као и обично, осим ако инсталирате Luft и изаберете њега.
ready-update-title = Преузми најновији Luft
ready-update-description = Изашла је новија верзија. Замењује ову, а задржава простор и све што сте спаковали.
ready-try-title = Испробај Luft
ready-try-description = Поново покрените у Luft без инсталирања. Windows се следећи пут покреће као и обично.
ready-box-description = Спакујте документе, фотографије, Wi-Fi мреже и друго, а Luft ће их распаковати после инсталације.
ready-box-packed = Спаковано, { $size }
ready-install-title = Инсталирај Luft
ready-install-description = Поново покрените у програм за инсталацију. Простор од { $size } поред система Windows га већ чека.
ready-stick-description = Ставите Luft на USB флеш и покрените га на било ком рачунару.
ready-remove = Уклони Luft са овог рачунара
ready-restart-try = Прво сачувајте оно на чему радите. Luft се отвара за отприлике минут, а следеће поновно покретање враћа вас у Windows.
ready-restart-install = Прво сачувајте оно на чему радите. Програм за инсталацију се отвара за отприлике минут и ништа се не мења док тамо не потврдите.
ready-fast-startup-title = Искључи Брзо покретање у систему Windows
ready-fast-startup-description = Windows се тада потпуно искључује, па звук, Wi-Fi и Bluetooth у систему Luft крећу испочетка.
ready-clock-title = Тачно време у оба система
ready-clock-description = Windows чита сат рачунара на исти начин као Luft, па време више не скаче кад прелазите из једног у други.
ready-remove-title = Уклонити Luft са овог рачунара?
ready-remove-description = Апликација Meet Luft брише све што је додала, укључујући кутију за селидбу, и враћа систему Windows сав његов простор.

## Luft is ready on Linux

linux-ready-description = Изаберите како желите да га упознате. Систем { $system } се и даље покреће као и обично док не одлучите другачије.
linux-ready-this-system = овај систем
linux-ready-update-description = Изашла је новија верзија. Замењује ону коју чува Meet Luft и задржава евиденције из испробавања.
linux-ready-try-description = Поново покрените у Luft без икаквих промена. Систем { $system } се следећи пут покреће као и обично.
linux-ready-replace-title = Замени { $system }
linux-ready-replace-description = Luft заузима његово место и задржава ваше датотеке, налог, Wi-Fi мреже и остале дискове. Стари систем остаје док га не уклоните.
linux-ready-install-description = Поново покрените у програм за инсталацију да бисте ставили Luft на други диск или у слободан простор.
linux-ready-remove = Уклони Luft са овог рачунара
linux-ready-restart-try = Прво сачувајте оно на чему радите. Luft се отвара за отприлике минут, а следеће поновно покретање враћа вас у систем { $system }.
linux-ready-restart-replace = Прво сачувајте оно на чему радите. Програм за инсталацију се отвара са изабраном заменом за систем { $system } и приказује шта остаје пре било какве промене.
linux-ready-remove-title = Уклонити Luft са овог рачунара?
linux-ready-remove-description = Meet Luft брише датотеке система Luft, његове датотеке за покретање и његову ставку за покретање. Све остало остаје како јесте.

## Packing things to take along to Luft (the moving box)

box-title = Понесите своје ствари
box-description = Изаберите шта ћете понети. Luft ће то после инсталације распаковати у ваш нови налог, а из система Windows се ништа не уклања.
box-looking = Прегледање ваших фасцикли…
box-folder-desktop = Радна површина
box-folder-documents = Документи
box-folder-downloads = Преузимања
box-folder-music = Музика
box-folder-pictures = Слике
box-folder-videos = Видео-снимци
box-folder-size = { $size }, { $files ->
    [one] { $files } датотека
    [few] { $files } датотеке
   *[other] { $files } датотека
}
box-wifi-title = Wi-Fi мреже
box-wifi-description = Са лозинкама, па је Luft одмах на интернету
box-bluetooth-title = Bluetooth уређаји
box-bluetooth-description = { $devices ->
    [one] { $devices } уређај, спреман без поновног упаривања
    [few] { $devices } уређаја, спремна без поновног упаривања
   *[other] { $devices } уређаја, спремних без поновног упаривања
}
box-wallpaper-title = Позадина
box-wallpaper-description = Слика на вашој радној површини у систему Windows
box-account-title = Ваше име и слика
box-total-slow = { $size }, паковање траје око { $minutes ->
    [one] { $minutes } минут
    [few] { $minutes } минута
   *[other] { $minutes } минута
}
box-pack = Спакуј

## Progress while Meet Luft works

working-shrinking = Прављење простора
    .description = Windows премешта своје датотеке да ослободи простор. То може да потраје неколико минута.
working-partitioning = Припрема простора за Luft
    .description = Припремају се партиције са којих се Luft покреће.
working-downloading = Пренос система Luft
    .description = Luft се копира директно у свој простор и успут проверава.
working-packing = Паковање ваших ствари
    .description = Све што сте изабрали копира се у кутију за селидбу. Велике фасцикле трају неко време.
working-removing = Уклањање система Luft
    .description = Простор се враћа систему Windows.
working-removing-linux = Уклањање система Luft
    .description = Уклањају се његове датотеке и ставка за покретање.
working-writing = Прављење USB флеша
    .description = Luft се уписује на цео флеш. Не искључујте га.
working-copying = Додавање система Luft у Ventoy
    .description = Luft се копира поред осталих ISO датотека на флешу. Не искључујте га.
working-verifying = Провера USB флеша
    .description = Све се поново чита да би се проверило да се покреће.
working-stick-downloading = Преузимање система Luft
    .description = Успут се проверава и чува, па је следећи флеш брже готов.
working-progress = { $done } од { $total }
working-keep-open = Не затварајте овај прозор.

## After Luft was removed

removed-title = Све је као пре
removed-description = { $platform ->
    [linux] Датотеке система Luft и његова ставка за покретање су уклоњене, а рачунар се покреће као и раније. Вратите се кад год желите.
   *[windows] Партиције система Luft и његова ставка за покретање су уклоњене, а Windows поново има сав свој простор. Вратите се кад год желите.
}

## Making a USB stick

stick-title = Направи USB флеш
stick-description = Luft се са њега покреће на било ком рачунару, за испробавање или инсталацију.
stick-looking = Тражење USB уређаја…
stick-none = Прикључите USB флеш од { $size } или више. Појавиће се овде.
stick-drives-label = USB уређаји
stick-offer = { $name }, { $size }
stick-make = Направи флеш
stick-drive-empty = Празно
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Премало за Luft
stick-ventoy-title = Овај флеш користи Ventoy
stick-ventoy-description = Додати Luft на њега или избрисати цео флеш и претворити га у флеш за Luft?
stick-erase-it = Избриши га
stick-add = Додај Luft
stick-replace-title = Заменити Luft на њему?
stick-replace-description = { $count ->
    [one] На овом флешу већ је { $names }. Нови Luft може да заузме његово место.
    [few] На овом флешу већ су { $names }. Нови Luft може да заузме њихово место.
   *[other] На овом флешу већ су { $names }. Нови Luft може да заузме њихово место.
}
stick-keep = { $count ->
    [one] Задржи оба
    [few] Задржи све
   *[other] Задржи све
}
stick-replace = Замени
stick-full-title = За Luft нема места
stick-full-description = Систему Luft треба { $needed }, а на овом флешу слободно је { $free }. Ослободите простор на њему или га избришите и претворите у флеш за Luft.
stick-erase-title = Избрисати { $name }?
stick-erase-description = Све на овом флешу од { $size } брише се и замењује системом Luft. Ово не може да се опозове.
stick-erase-confirm = Избриши и направи флеш
stick-done-title = Ваш USB флеш са системом Luft је спреман
stick-done-ventoy-title = Luft је на вашем флешу са алатком Ventoy
stick-done-take-out = Сада можете да га извадите.
stick-done-eject = Избаците га пре него што га извадите.
stick-done-start = Да бисте покренули рачунар са њега, прикључите га и изаберите у менију за покретање рачунара, који се отвара тастером као што је F12, F8 или Esc одмах после укључивања.
stick-done-ventoy-key = Кад је Secure Boot укључен, Ventoy при првом покретању једном тражи да се упише његов кључ.
stick-done = Готово
stick-done-another = Направи још један
