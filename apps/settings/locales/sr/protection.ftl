## Shared buttons

settings-protection-cancel = Откажи
settings-protection-continue = Настави
settings-protection-close = Затвори
settings-protection-restart = Поново покрени
settings-protection-remove = Уклони
settings-protection-turn-on = Укључи
settings-protection-set-up = Подеси

## Privacy: screen lock

settings-privacy-screen-lock = Закључавање екрана
settings-privacy-screen-off = Екран се искључује
settings-privacy-screen-off-hint = Подешава се у одељку Напајање и батерија
settings-privacy-screen-off-after = { $duration } неактивности
settings-privacy-screen-off-never = Никад
settings-privacy-lock-when-off = Закључај екран кад се искључи
settings-privacy-lock-after = Закључај после
settings-privacy-lock-after-hint = Колико да се чека кад се екран искључи
settings-privacy-lock-immediately = Одмах

## Privacy: location, camera and microphone

settings-privacy-location = Локација
settings-privacy-location-services = Услуге локације
settings-privacy-location-services-hint = Омогућава апликацијама да утврде где сте, за мапе, временску прогнозу и временске зоне
settings-privacy-camera = Камера
settings-privacy-camera-allow = Дозволи апликацијама да користе камеру
settings-privacy-microphone-allow = Дозволи апликацијама да користе микрофон
settings-privacy-apps-asked = Апликације које су тражиле приступ
settings-privacy-apps-allowed = Дозвољено { $allowed } од { $total }

## Privacy: file history

settings-privacy-file-history = Историја датотека
settings-privacy-remember-files = Памти недавно коришћене датотеке
settings-privacy-remember-files-hint = Апликације могу да прикажу датотеке које сте последње отварали
settings-privacy-keep-history = Чувај историју
settings-privacy-keep-forever = Заувек
settings-privacy-clear-history = Обриши историју
settings-privacy-clear-history-hint = Одмах заборави све датотеке са листе
settings-privacy-clear = Обриши
settings-privacy-clear-title = Обрисати историју датотека?
settings-privacy-clear-description = Апликације више неће приказивати датотеке које сте недавно отварали. Саме датотеке остају где јесу.

## Privacy: trash and temporary files

settings-privacy-cleanup = Смеће и привремене датотеке
settings-privacy-empty-trash = Аутоматски испразни смеће
settings-privacy-delete-temp = Аутоматски бриши привремене датотеке
settings-privacy-delete-temp-hint = Ваше датотеке у привременим фасциклама које ништа није скоро користило
settings-privacy-delete-after = Избриши после
settings-privacy-delete-after-hint = Колико дуго датотеке остају пре него што се уклоне

## Security: summary at the top of the page

settings-security-protected = Ваш уређај је заштићен
settings-security-encrypting = Уређај се шифрује
settings-security-encrypting-progress = { $progress }. Можете да наставите с радом док се не заврши.
settings-security-decrypting = Шифровање уређаја се искључује
settings-security-restart-to-encrypt = Поново покрените да би почело шифровање
settings-security-restart-to-encrypt-description = Шифровање почиње при следећем поновном покретању овог рачунара.
settings-security-encryption-failed = Шифровање није почело
settings-security-encryption-failed-description = Luft се покренуо без њега и ваше датотеке нису мењане. Укључите га поново да бисте покушали још једном.
settings-security-could-be-safer = Ваш уређај може бити безбеднији
settings-security-could-be-safer-description = Укључите шифровање уређаја да би ваше датотеке остале приватне.
settings-security-starts-differently-description = Ако сте променили његова Secure Boot подешавања, потврдите то да би се диск поново сам откључавао.
settings-security-needed-recovery-key = Диску је био потребан кључ за опоравак
settings-security-needed-recovery-key-description = Поново повежите безбедносни чип да би се диск сам откључавао.
settings-security-firmware-ready-description = Ажурирања фирмвера за ваш хардвер спремна су у одељку Ажурирања.
settings-security-encrypted-secure-boot = Ваш диск је шифрован, а Secure Boot проверава како се рачунар покреће.
settings-security-encrypted = Ваш диск је шифрован.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Само поуздани софтвер може да покрене овај рачунар
settings-security-chip = Безбедносни чип
settings-security-chip-description = Чува кључеве и проверава како се овај рачунар покренуо
settings-firmware-updates-ready = Ажурирања фирмвера су спремна
settings-firmware-updates-count = { $count ->
    [one] { $count } ажурирање за ваш хардвер у одељку Ажурирања
    [few] { $count } ажурирања за ваш хардвер у одељку Ажурирања
   *[other] { $count } ажурирања за ваш хардвер у одељку Ажурирања
}

## Security: signed startup

settings-security-signed-startup = Потписано покретање
settings-security-signed-startup-on = Мени за покретање и систем су потписани за овај рачунар
settings-security-signed-startup-purpose = Дозвољава покретање само софтверу потписаном за овај рачунар
settings-security-signed-startup-restart = Почиње да се користи после поновног покретања
settings-security-signed-startup-missed = Кључ није додат при последњем поновном покретању
settings-security-signed-startup-pending = Додајте кључ на плавом екрану при поновном покретању
settings-security-signed-startup-missed-often = Кључ није додат ни после неколико поновних покретања
settings-security-show-steps = Прикажи кораке
settings-security-try-again = Покушај поново

## Security: games with anti-cheat

settings-security-anti-cheat = Игре са заштитом од варања
settings-security-anti-cheat-ready = Спремно за игре са заштитом од варања
settings-security-anti-cheat-removing = Уклоните остале кључеве на плавом екрану при поновном покретању
settings-security-anti-cheat-luft-key = Epic још треба да дода кључ система Luft на своју листу
settings-security-anti-cheat-ready-description = Игре могу да провере како се овај рачунар покренуо

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Уклоните кључеве при поновном покретању
settings-security-key-steps-add = Додајте кључ при поновном покретању
settings-security-key-steps-remove-description = После поновног покретања појавиће се плави екран који пита за уклањање кључева. Чека само 10 секунди, па притисните било који тастер чим се појави.
settings-security-key-steps-add-description = После поновног покретања појавиће се плави екран који пита за нови кључ. Чека само 10 секунди, па притисните било који тастер чим се појави.
settings-security-key-step-choose = Изаберите { $option }, затим { $next }.
settings-security-key-step-confirm = Изаберите { $option }.
settings-security-key-step-code = Унесите код испод и притисните { $key }.
settings-security-key-step-reboot = Изаберите { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Код { $code }
settings-security-key-steps-remove-missed = Ако га пропустите, рачунар се покреће као и обично и можете поново да покушате овде.
settings-security-key-steps-add-missed = Ако га пропустите, рачунар се покреће као и обично, а кораци се поново приказују при следећем поновном покретању, са новим кодом.
settings-security-later = Касније
settings-security-restart-now = Поново покрени сада

## Security: hardware security level

settings-security-hardware = Безбедност хардвера
settings-security-hardware-level-0 = Ваш хардвер има мало заштита које би могао да има
settings-security-hardware-level-1 = Ваш хардвер има основне заштите
settings-security-hardware-level-2 = Ваш хардвер има важне заштите
settings-security-hardware-level-3 = Ваш хардвер је добро заштићен
settings-security-hardware-level-4 = Ваш хардвер штити сам себе док ради
settings-security-hardware-level-5 = Ваш хардвер штити сам себе и може то да докаже
settings-security-hardware-description = { $summary }, ниво { $level } од { $highest }.
settings-security-hardware-next = За следећи ниво
settings-security-hardware-highest = Ово је највиши ниво који постоји.
settings-security-hardware-inactive = Тренутно није активно
settings-security-hardware-fix-maker = { $count ->
    [one] Ово може да дода само произвођач вашег рачунара, обично ажурирањем фирмвера:
   *[other] Ово може да дода само произвођач вашег рачунара, обично ажурирањем фирмвера:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Ово може да се укључи у подешавањима фирмвера вашег рачунара:
   *[other] Ово може да се укључи у подешавањима фирмвера вашег рачунара:
}
settings-security-hardware-fix-system = { $count ->
    [one] Ово зависи од тога како је систем подешен:
   *[other] Ово зависи од тога како је систем подешен:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Ово није доступно на овом рачунару:
   *[other] Ово није доступно на овом рачунару:
}

## Security: USB protection

settings-usb-hold-back = Задржи нове USB уређаје
settings-usb-hold-back-description = Уређаји прикључени док је екран закључан чекају да откључате

## Device encryption

settings-encryption = Шифровање уређаја
settings-encryption-encrypting = Овај уређај се шифрује
settings-encryption-decrypting = Шифровање уређаја се искључује
settings-encryption-starting = Почиње при следећем поновном покретању
settings-encryption-failed = Није почело при последњем поновном покретању, ваше датотеке нису мењане
settings-encryption-off = Чува ваше датотеке приватним ако изгубите овај рачунар
settings-encryption-progress = Готово { $percent }
settings-encryption-progress-seconds = Готово { $percent }, преостало је мање од минута
settings-encryption-progress-minutes = { $minutes ->
    [one] Готово { $percent }, преостао је око { $minutes } минут
    [few] Готово { $percent }, преостала су око { $minutes } минута
   *[other] Готово { $percent }, преостало је око { $minutes } минута
}
settings-encryption-progress-hours = { $hours ->
    [one] Готово { $percent }, преостао је око { $hours } сат
    [few] Готово { $percent }, преостала су око { $hours } сата
   *[other] Готово { $percent }, преостало је око { $hours } сати
}
settings-encryption-unlocks-chip-pin = Откључава се безбедносним чипом и вашим PIN-ом
settings-encryption-unlocks-chip = Откључава се сам помоћу безбедносног чипа
settings-encryption-unlocks-passphrase = При покретању тражи вашу приступну фразу
settings-encryption-unlocks-security-key = При покретању се откључава вашим безбедносним кључем
settings-encryption-unlocks-recovery-key = При покретању тражи ваш кључ за опоравак

## Device encryption: other drives

settings-encryption-drives = Остали дискови
settings-encryption-drives-hint = Шифрујте остале дискове и USB флеш меморије у апликацији Дискови
settings-encryption-drives-open = Отвори Дискове
settings-encryption-drive-encrypting = Диск се шифрује, готово { $percent }
settings-encryption-drive-encrypting-paused = Диск се шифрује, паузирано на { $percent }
settings-encryption-drive-decrypting = Диск се дешифрује, готово { $percent }
settings-encryption-drive-decrypting-paused = Диск се дешифрује, паузирано на { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } шифровани диск се откључава са овим рачунаром
    [few] { $count } шифрована диска се откључавају са овим рачунаром
   *[other] { $count } шифрованих дискова се откључава са овим рачунаром
}

## Device encryption: turning it on

settings-encryption-turn-on-title = Укључите шифровање уређаја
settings-encryption-turn-on-description = Ваше датотеке остају приватне ако се овај рачунар изгуби или буде украден. Без правог кључа нико не може да прочита диск.
settings-encryption-blocked-title = Шифровање уређаја још не може да се укључи
settings-encryption-blocked-description = Решите оно што је означено испод, па покушајте поново.
settings-encryption-backup = Пре него што почнете, проверите да ли имате резервне копије важних датотека.
settings-encryption-key-title = Сачувајте кључ за опоравак
settings-encryption-key-description = Ако диск икада не може сам да се откључа, на пример после поправке, овим кључем ћете поново ући. Чувајте га негде ван овог рачунара.
settings-encryption-unlock-title = Откључавање при покретању
settings-encryption-unlock-description = Безбедносни чип сам откључава диск при покретању, тако да се пријављујете као и до сада.
settings-encryption-passphrase-title = Изаберите приступну фразу
settings-encryption-passphrase-description = Овај рачунар не може сам да откључа диск, па ову приступну фразу тражи при сваком покретању.
settings-encryption-summary-title = Спремно за шифровање
settings-encryption-summary-description = Ево шта следи.
settings-encryption-step-restart = Рачунар се једном поново покреће.
settings-encryption-step-screen = Током покретања накратко се појављује екран „Уређај се шифрује“.
settings-encryption-step-background = Остатак се одвија у позадини док ви настављате с радом.
settings-encryption-step-plugged-in = Држите рачунар прикључен на напајање док се не заврши.
settings-encryption-ask-pin = Тражи и PIN
settings-encryption-ask-pin-description = Диск остаје закључан чак и ако неко однесе рачунар. Тражи се када се шифровање заврши.
settings-encryption-starting-button = Покреће се…
settings-encryption-restart-and-encrypt = Поново покрени и шифруј

## Device encryption: turning it off

settings-encryption-turn-off-title = Искључити шифровање уређаја?
settings-encryption-turn-off-description = Ваше датотеке се дешифрују у позадини док радите. Након тога свако ко извади диск може да га прочита.
settings-encryption-keep = Задржи шифровање
settings-encryption-turning-off = Искључује се…
settings-encryption-turn-off = Искључи

## Device encryption: unlocking the disk

settings-encryption-unlocking = Откључавање диска
settings-encryption-starts-differently = Овај рачунар се сада другачије покреће
settings-encryption-starts-differently-description = Његова Secure Boot подешавања су се променила, па је диск тражио кључ за опоравак. Ако сте ви направили промену, потврдите је да би се диск поново сам откључавао
settings-encryption-confirm = Потврди
settings-encryption-asked-recovery-key = Диск је тражио кључ за опоравак
settings-encryption-relink-description = Поново повежите безбедносни чип да би се диск сам откључавао
settings-encryption-relink = Повежи поново
settings-encryption-chip-unlock = Откључавање безбедносним чипом
settings-encryption-chip-unlock-on = Све док се ништа не промени у начину покретања овог рачунара
settings-encryption-chip-unlock-off = Да не бисте уносили приступну фразу при покретању
settings-encryption-pin = PIN при покретању
settings-encryption-pin-description = Уносите га пре него што се диск откључа
settings-encryption-change = Промени
settings-encryption-add-pin-row = Додај PIN при покретању
settings-encryption-add-pin-row-description = Диск остаје закључан чак и ако неко однесе рачунар
settings-encryption-add-pin = Додај PIN
settings-encryption-new-key-description = Ваш диск још није имао кључ за опоравак. Чувајте овај негде ван овог рачунара.
settings-encryption-stop-chip-title = Престати са откључавањем безбедносним чипом?
settings-encryption-stop-chip-passphrase = Рачунар ће тражити вашу приступну фразу при сваком покретању.
settings-encryption-stop-chip-recovery-key = Рачунар ће тражити ваш кључ за опоравак при сваком покретању, па га држите при руци.
settings-encryption-stop-chip = Престани са откључавањем
settings-encryption-remove-pin-title = Уклонити PIN?
settings-encryption-remove-pin-description = Диск ће се поново сам откључавати при покретању рачунара.
settings-encryption-remove-pin = Уклони PIN
settings-encryption-unlock-disk-title = Откључајте диск
settings-encryption-unlock-disk-description = За ову промену потребан је кључ за опоравак или приступна фраза коју уносите при покретању рачунара.
settings-encryption-unlock-disk-field = Кључ за опоравак или приступна фраза

## Device encryption: security chip and PIN

settings-encryption-chip-setup-description = Безбедносни чип у вашем рачунару сам откључава диск при покретању, тако да више не морате прво да уносите приступну фразу.
settings-encryption-add-pin-title = Додајте PIN
settings-encryption-add-pin-description = Уносићете га при сваком покретању рачунара. Без њега диск остаје закључан, чак и ако неко однесе цео рачунар.
settings-encryption-change-pin-title = Промените PIN
settings-encryption-change-pin-description = Нови PIN ћете уносити при сваком покретању рачунара.
settings-encryption-change-pin = Промени PIN
settings-encryption-relink-title = Поново повежите безбедносни чип
settings-encryption-relink-pin-description = Унесите PIN који желите да користите при покретању.
settings-encryption-ask-pin-step = Додаје корак при покретању.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = Нови PIN
settings-encryption-pin-length = Од { $min } до { $max } цифара
settings-encryption-pin-digits-only = Користите само цифре
settings-encryption-pin-too-short = { $min ->
    [one] Користите најмање { $min } цифру
    [few] Користите најмање { $min } цифре
   *[other] Користите најмање { $min } цифара
}
settings-encryption-pin-too-long = { $max ->
    [one] Користите највише { $max } цифру
    [few] Користите највише { $max } цифре
   *[other] Користите највише { $max } цифара
}
settings-encryption-pins-differ = PIN-ови се не поклапају
settings-encryption-confirm-field = Потврда
settings-encryption-type-again = Унесите поново

## Recovery key

settings-recovery-title = Кључ за опоравак
settings-recovery-description = Омогућава приступ ако диск не може сам да се откључа
settings-recovery-show = Прикажи
settings-recovery-replace = Замени
settings-recovery-replace-title = Заменити кључ за опоравак?
settings-recovery-replace-description = Тренутни кључ престаје да ради, а добићете нови који треба да сачувате.
settings-recovery-replace-key = Замени кључ
settings-recovery-shown-title = Ваш кључ за опоравак
settings-recovery-shown-description = Унесите га ако рачунар икада при покретању затражи кључ за опоравак. Чувајте копију негде ван овог рачунара.
settings-recovery-fresh-title = Сачувајте нови кључ за опоравак
settings-recovery-fresh-description = Претходни кључ више не ради. Чувајте овај на папиру или у управљачу лозинкама.

## Passwords and keys (the keyring)

settings-passwords-title = Лозинке и кључеви
settings-passwords-not-running = Привезак кључева није покренут
settings-passwords-not-running-description = Ваше лозинке и кључеви приказују се овде чим се покрене
settings-passwords-locked = Закључано
settings-passwords-contents = { $count ->
    [0] Још ништа није сачувано
    [one] { $count } сачувана ставка
    [few] { $count } сачуване ставке
   *[other] { $count } сачуваних ставки
}
settings-passwords-protected-chip = Заштићено вашом лозинком и безбедносним чипом
settings-passwords-protected = Заштићено вашом лозинком
settings-passwords-unlock = Откључај
settings-passwords-lock = Закључај
settings-passwords-seal-title = Запечати безбедносним чипом
settings-passwords-seal-description = Њихове копије не могу да се отворе на другом рачунару
settings-passwords-seal = Запечати
settings-passwords-fingerprint-on = Откључава се вашим отиском прста
settings-passwords-fingerprint-on-description = Пријава отиском прста откључава и ваше лозинке
settings-passwords-fingerprint = Откључавање отиском прста
settings-passwords-fingerprint-description = Прво додајте отисак прста у одељку Корисници
settings-passwords-pin = Тражи PIN после отиска прста
settings-passwords-pin-locked = Откључајте привезак кључева да бисте ово променили
settings-passwords-pin-description = Да их сам отисак прста не би могао откључати
settings-passwords-lock-with-screen = Закључавај заједно са екраном
settings-passwords-lock-with-screen-description = Закључавају се и откључавају заједно са екраном
settings-passwords-apps = Апликације са приступом
settings-passwords-apps-locked = Откључајте привезак кључева да бисте их видели
settings-passwords-apps-asked = { $count ->
    [0] Још ниједна апликација их није тражила
    [one] { $count } апликација их је тражила
    [few] { $count } апликације су их тражиле
   *[other] { $count } апликација их је тражило
}

## Passwords and keys: apps with access

settings-passwords-access-description = Ако уклоните неку, апликација ће следећи пут поново питати.
settings-passwords-access-not-allowed = Није дозвољено
settings-passwords-access-none = Још ниједна апликација није тражила ваше лозинке
settings-passwords-access-revoke = Забрани апликацији { $app } да користи { $item }
settings-passwords-access-reset = Дозволи апликацији { $app } да поново тражи { $item }
settings-passwords-stores = Пријаве апликација
settings-passwords-stores-description = Пријаве које неке апликације чувају овде, где само та апликација може да их прочита.
settings-passwords-stores-count = { $count ->
    [one] { $count } сачувана пријава
    [few] { $count } сачуване пријаве
   *[other] { $count } сачуваних пријава
}
settings-passwords-forget = Заборави
settings-passwords-forget-title = Заборавити шта је апликација { $app } сачувала?
settings-passwords-forget-description = Апликација { $app } губи пријаве које је овде чувала, па ћете можда морати поново да се пријавите у њу.

## Passwords and keys: recent access

settings-passwords-history = Недавни приступ
settings-passwords-history-read = Апликација { $app } је користила „{ $item }“
settings-passwords-history-read-unnamed = Апликација { $app } је користила сачувану лозинку
settings-passwords-history-saved = Апликација { $app } је сачувала „{ $item }“
settings-passwords-history-saved-unnamed = Апликација { $app } је сачувала лозинку
settings-passwords-history-deleted = Апликација { $app } је избрисала „{ $item }“
settings-passwords-history-deleted-unnamed = Апликација { $app } је избрисала сачувану лозинку
settings-passwords-history-denied = Апликацији { $app } није дозвољено да користи „{ $item }“
settings-passwords-history-denied-unnamed = Апликацији { $app } није дозвољено да користи сачувану лозинку
settings-passwords-history-signed = Апликација { $app } је потписала помоћу „{ $item }“
settings-passwords-history-signed-unnamed = Апликација { $app } је потписала помоћу сачуване лозинке
settings-passwords-history-fewer = Прикажи мање
settings-passwords-history-all = { $count ->
    [one] Прикажи све ({ $count })
    [few] Прикажи све ({ $count })
   *[other] Прикажи све ({ $count })
}
settings-passwords-history-clear = Обриши историју
settings-passwords-history-clear-description = Заборави које су апликације користиле привезак кључева и када
settings-passwords-history-clear-button = Обриши
settings-passwords-history-clear-title = Обрисати недавни приступ?
settings-passwords-history-clear-confirm = Листа апликација које су користиле привезак кључева и када се брише. Сачуване лозинке и кључеви остају какви јесу.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH кључеви
settings-passwords-ssh-description = Кључеви за пријаву на сервере, безбедно сачувани у привеску кључева.
settings-passwords-ssh-unnamed = Кључ без назива
settings-passwords-ssh-in-chip = Чува се у безбедносном чипу
settings-passwords-ssh-added = Додат { $when }
settings-passwords-ssh-copy = Копирај јавни кључ за { $name }
settings-passwords-ssh-remove = Уклони { $name }
settings-passwords-ssh-confirm = Питај пре сваке употребе
settings-passwords-ssh-confirm-label = Питај пре сваке употребе кључа { $name }
settings-passwords-ssh-add-row = Додај кључ
settings-passwords-ssh-use = Користи ове кључеве са SSH-ом
settings-passwords-ssh-use-description = Копирајте ред који усмерава SSH на њих
settings-passwords-ssh-copy-line = Копирај { $line }
settings-passwords-ssh-remove-title = Уклонити „{ $name }“?
settings-passwords-ssh-remove-chip = Постоји само у безбедносном чипу овог рачунара, па нестаје заувек. Сервери који прихватају само овај кључ више вас неће пустити с њим.
settings-passwords-ssh-remove-description = Сервери који прихватају само овај кључ више вас неће пустити с њим. Ово не може да се опозове.
settings-passwords-ssh-add-title = Додајте SSH кључ
settings-passwords-ssh-add-description = Нови кључ се прави на овом рачунару. Копирајте његов јавни кључ на сервере на које желите да се пријављујете.
settings-passwords-ssh-name = Назив
settings-passwords-ssh-name-placeholder = На пример, пословни лаптоп
settings-passwords-ssh-chip = Чувај у безбедносном чипу
settings-passwords-ssh-chip-description = Никад не може да се копира са овог рачунара, чак ни од вас
settings-passwords-ssh-chip-unsupported = Безбедносни чип овог рачунара не може да чува SSH кључеве
settings-passwords-ssh-add = Додај кључ

## Passkeys

settings-passkeys-title = Приступни кључеви
settings-passkeys-unavailable = Откључајте привезак кључева да бисте видели приступне кључеве.
settings-passkeys-chip-fingerprint = Запечаћени безбедносним чипом овог рачунара. Свака пријава тражи отисак прста или лозинку.
settings-passkeys-chip-password = Запечаћени безбедносним чипом овог рачунара. Свака пријава тражи лозинку.
settings-passkeys-password-fingerprint = Шифровани вашом лозинком. Свака пријава тражи отисак прста или лозинку.
settings-passkeys-password = Шифровани вашом лозинком. Свака пријава тражи лозинку.
settings-passkeys-last-used = Последњи пут коришћен { $when }
settings-passkeys-never-used = Никад коришћен
settings-passkeys-password-only = Заштићен вашом лозинком
settings-passkeys-unreachable = Прегледачи не могу да приступе вашим приступним кључевима
settings-passkeys-unreachable-description = Поново су доступни чим се покрене услуга приступних кључева
settings-passkeys-rename-label = Преименуј приступни кључ за { $site }
settings-passkeys-remove-label = Уклони приступни кључ за { $site }
settings-passkeys-empty = Још нема приступних кључева
settings-passkeys-empty-description = Кључеви које сајтови направе чувају се овде за све прегледаче
settings-passkeys-remove-title = Уклонити овај приступни кључ?
settings-passkeys-remove-description = Њиме више нећете моћи да се пријавите на { $site }, па проверите да имате други начин приступа.
settings-passkeys-rename-title = Преименујте приступни кључ
settings-passkeys-rename-description = Дајте приступном кључу за { $site } назив који ћете препознати.
settings-passkeys-name = Назив
settings-passkeys-save = Сачувај

## Apps

settings-apps-defaults = Подразумеване апликације
settings-apps-defaults-description = Користе се када отварате везе, датотеке и фасцикле
settings-apps-browser = Веб прегледач
settings-apps-email = Е-пошта
settings-apps-calendar = Календар
settings-apps-music = Музика
settings-apps-videos = Видео-снимци
settings-apps-photos = Фотографије
settings-apps-text-editor = Уређивач текста
settings-apps-files = Датотеке
settings-apps-choose = Изабери
settings-apps-startup = Покретање
settings-apps-startup-description = Ове апликације се отварају када се пријавите
settings-apps-startup-app = Отвори апликацију { $app } при пријави
settings-apps-startup-add = Додај апликацију
settings-apps-startup-add-title = Додајте апликацију при покретању
settings-apps-startup-add-description = Изаберите апликацију која ће се отварати при свакој пријави.
settings-apps-search = Претражи апликације
settings-apps-no-match = Ниједна апликација не одговара претрази
settings-apps-cancel = Откажи
