## Window title bar buttons (screen-reader labels)

ui-window-minimize = Згорнути
ui-window-maximize = Розгорнути
ui-window-close = Закрити

## Text editing context menu

ui-edit-cut = Вирізати
ui-edit-copy = Копіювати
ui-edit-paste = Вставити
ui-edit-select-all = Виділити все

## Form controls

ui-select-placeholder = Вибрати
ui-password-show = Показати пароль
ui-password-hide = Сховати пароль
ui-toast-dismiss = Закрити

## Media playback controls

ui-media-play = Відтворити
ui-media-pause = Пауза
ui-media-mute = Вимкнути звук
ui-media-unmute = Увімкнути звук
ui-media-volume = Гучність
ui-media-position = Позиція

## Pictures in documents

ui-remote-images-hidden = Зображення з інтернету приховано
ui-remote-images-show = Показати

## Splitting a drive between Windows and Luft

ui-split-space = Місце для Luft
ui-split-windows-size = { $size }, зайнято { $used }

## Recovery key

ui-recovery-key-label = Ключ відновлення { $key }
ui-recovery-key-save = Зберегти у файл
ui-recovery-key-print = Друкувати
ui-recovery-key-copy = Копіювати
ui-recovery-key-saved = Збережено
ui-recovery-key-printing = Надіслано на принтер
ui-recovery-key-copied = Скопійовано
ui-recovery-key-kept = Ключ відновлення збережено

## Fingerprints
## Each finger has a name used as a title (the message value) and a form used inside
## a sentence (.inline), like "Place your … on the sensor." Adjust the case of .inline
## to fit those sentences.

ui-finger-right-index = Вказівний палець правої руки
    .inline = вказівний палець правої руки
ui-finger-left-index = Вказівний палець лівої руки
    .inline = вказівний палець лівої руки
ui-finger-right-thumb = Великий палець правої руки
    .inline = великий палець правої руки
ui-finger-left-thumb = Великий палець лівої руки
    .inline = великий палець лівої руки
ui-finger-right-middle = Середній палець правої руки
    .inline = середній палець правої руки
ui-finger-left-middle = Середній палець лівої руки
    .inline = середній палець лівої руки
ui-finger-right-ring = Безіменний палець правої руки
    .inline = безіменний палець правої руки
ui-finger-left-ring = Безіменний палець лівої руки
    .inline = безіменний палець лівої руки
ui-finger-right-little = Мізинець правої руки
    .inline = мізинець правої руки
ui-finger-left-little = Мізинець лівої руки
    .inline = мізинець лівої руки

ui-fingerprint-place = Прикладіть { $finger } до сканера.
ui-fingerprint-swipe = Проведіть { $finger } по сканеру.
ui-fingerprint-stage-passed = Добре. Підніміть палець і прикладіть його знову.
ui-fingerprint-stage-passed-swipe = Добре. Проведіть ще раз.
ui-fingerprint-retry = Не вдалося зчитати відбиток. Спробуйте ще раз.
ui-fingerprint-swipe-too-short = Проведіть трохи повільніше.
ui-fingerprint-not-centered = Прикладіть палець до центру сканера.
ui-fingerprint-remove-and-retry = Підніміть палець і спробуйте ще раз.
ui-fingerprint-added = Відбиток пальця додано.
ui-fingerprint-full = У сканері більше немає місця для нового відбитка.
ui-fingerprint-disconnected = Сканер відбитків перестав відповідати. Спробуйте ще раз трохи згодом.
ui-fingerprint-duplicate = Цей палець уже збережено в сканері — імовірно, у Windows або в іншому обліковому записі. Використайте інший палець.
ui-fingerprint-failed = Не вдалося додати цей відбиток. Спробуйте ще раз.

## Sizes and times

ui-time-just-now = щойно
ui-time-yesterday = Учора, { $time }
ui-power-watts = { $watts } Вт

## Dialog buttons

ui-dialog-cancel = Скасувати
ui-dialog-close = Закрити
ui-dialog-back = Назад
ui-dialog-continue = Продовжити
ui-dialog-done = Готово

## Passphrases

ui-passphrase-field = Парольна фраза
ui-passphrase-confirm = Підтвердження
ui-passphrase-type-again = Введіть ще раз
ui-passphrase-length = { $min ->
    [one] Щонайменше { $min } символ
    [few] Щонайменше { $min } символи
    [many] Щонайменше { $min } символів
   *[other] Щонайменше { $min } символу
}
ui-passphrase-mismatch = Парольні фрази не збігаються

## Encryption

ui-encryption-checking = Перевірка…
