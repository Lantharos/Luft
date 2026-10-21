# Russian review list

Strings in Luft's Russian translation that a native speaker should check, each listed because the term has no settled equivalent, the grammar around a placeable may not fit every value, or the wording may clip.

## Terms and shared strings

- `packages/i18n/glossary/ru.csv` `Settings`: "Настройки" — Windows says "Параметры"; chosen because macOS, GNOME and phones say "Настройки". Check that it doesn't feel foreign to Windows switchers.
- `packages/i18n/glossary/ru.csv` `Start`: "Пуск" — translated as in Windows; check it reads right next to the Luft mark, which is not a Windows logo.
- `packages/i18n/glossary/ru.csv` `board`: "доска" — no established term for this canvas mode; check it doesn't read as a whiteboard.
- `packages/i18n/glossary/ru.csv` `snap`, `snap layout`: "прикрепить", "макет прикрепления" — taken from Windows 11; check against current Windows wording and that it isn't confused with "закрепить" (pin).
- `packages/i18n/glossary/ru.csv` `tray`: "системный трей" — colloquial but widely known; KDE says "системный лоток", Windows avoids a name.
- `packages/i18n/glossary/ru.csv` `workspace`: "рабочая область" — GNOME and KDE say "рабочий стол", which Luft keeps for the desktop; check it is understood.
- `packages/i18n/glossary/ru.csv` `Keep awake`: "Не засыпать" — no settled term; check it reads naturally as a tile label.
- `packages/i18n/glossary/ru.csv` `security chip`: "чип безопасности" — Windows says "процессор безопасности"; check people recognize it.
- `packages/i18n/glossary/ru.csv` `signed startup`: "подписанная загрузка" — no established term; check it doesn't read oddly next to Secure Boot.
- `packages/i18n/glossary/ru.csv` `firmware`: "прошивка" — colloquial next to Windows' "встроенное ПО"; check it suits Settings pages.
- `packages/i18n/glossary/ru.csv` `Media Viewer`: "Просмотр медиафайлов" — no common generic name for a viewer of photos, video, music and PDFs.
- `packages/i18n/glossary/ru.csv` `remove`, `delete`: both "удалить", with "убрать" when nothing is lost; check screens where both appear.
- `packages/ui/locales/ru/ui.ftl` `ui-fingerprint-place`: "Прикоснитесь к сканеру { $finger }." — .inline is instrumental ("правым указательным пальцем") so both fingerprint sentences fit it; check the word order reads naturally.
- `packages/ui/locales/ru/ui.ftl` `ui-select-placeholder`: "Выберите" — an instruction rather than the infinitive buttons use; check it fits as a dropdown placeholder.
- `apps/settings/locales/ru/settings.ftl` `settings-subpage-back`: "Назад: { $page }" — colon form keeps $page in the nominative; check it sounds right to screen-reader users.
- `apps/settings/locales/ru/pages.ftl` `settings-page-mouse`: "Мышь и сенсорная панель" — long for a sidebar entry; check it doesn't clip.
- `apps/settings/locales/ru/pages.ftl` `settings-page-appearance`: "Оформление" — GNOME says "Внешний вид"; check which reads better as a page name.
- `kestrel/ui/locales/ru/shell.ftl` `battery-level`: "Батарея: { $percentage } %, питание подключено" — the [plugged] state means plugged in but not charging; check it reads that way.

## Kestrel and setup

- `kestrel/ui/locales/ru/portal.ftl` `portal-unknown-app-object`: "этому приложению" — used in dative slots ("Разрешить { $appName } …", "передаваться { $appName }", "перейти к { $appName }"), so real app names appear bare there ("Разрешить Firefox использовать…") rather than «приложению Firefox»; check these sentences read naturally with both.
- `kestrel/ui/locales/ru/desktop.ftl` `task-view-desktop`: "Рабочая область { $number }" — follows the glossary, though Windows says «Рабочий стол 1».
- `kestrel/ui/locales/ru/system.ftl` `privacy-indicator`: "Используются: { $things }" — list items are nominative (камера, микрофон…); check the joined list, also for a single item like «Используются: окна».
- `kestrel/ui/locales/ru/system.ftl` `health-gpu-reset-body`: "Компьютер перезагрузился сам: { $date }, { $time }." — built around the placeables to avoid the case of the formatted date; may read a bit dry.
- `kestrel/ui/locales/ru/system.ftl` `oom-closed-body`: "…поэтому его пришлось закрыть…" — «его» covers both приложение and контейнер; check it reads clearly after either title.
- `kestrel/engine/locales/ru/engine.ftl` `screenshot-capture`: "Захватить" — shutter button for both screenshots and recordings; «Снять» could be an alternative.
- `kestrel/engine/locales/ru/engine.ftl` `network-menu-tethers`, `network-menu-tether`: "Модем через Bluetooth", "Модем" — no settled term for Bluetooth tethering.
- `apps/setup/locales/ru/setup.ftl` `setup-region-intro-guessed`: "Начнём настройку. Определено автоматически: { $guesses }. Измените то, что не подходит." — the guess parts are nominative («язык и раскладка клавиатуры по данным компьютера»); check the joined list.
- `apps/setup/locales/ru/setup.ftl` `setup-account-full-name-example`: "Софья Ковалевская" — a well-known Russian mathematician, the counterpart of Ada Lovelace; check it suits a name placeholder.
- `apps/setup/locales/ru/setup.ftl` `setup-drive-has-windows`: "На диске { $windows }" — short subtitle under a drive name; check it reads well there.
- `apps/setup/installer/locales/ru/installer.ftl` `installer-relabel-failed`: "Не удалось подготовить метки ваших файлов для Luft" — the source is about SELinux relabelling; wording may be vague.

## Settings

- `apps/settings/locales/ru/connections.ftl` `settings-bluetooth-request-unnamed`: "без названия" — reads after «устройство»/«устройством»/«на устройстве» in every pairing sentence, which put the noun in front of { $name }; check real names read well there too, e.g. «Выполнить сопряжение с устройством AirPods?»
- `apps/settings/locales/ru/connections.ftl` `settings-accounts-remove-note`: "Ваши файлы останутся в { $provider }." — fine for OneDrive, Dropbox, iCloud Drive; check with Nextcloud or WebDAV.
- `apps/settings/locales/ru/connections.ftl` `settings-accounts-provider-icloud`: "Ваш Аккаунт Apple, …" — follows Apple's Russian branding «Аккаунт Apple» (capital А) rather than the glossary's «учётная запись»; confirm.
- `apps/settings/locales/ru/connections.ftl` `settings-network-security-owe`: "Улучшенная открытая" — no settled Russian term for Enhanced Open (OWE); check against Windows and Android wording.
- `apps/settings/locales/ru/connections.ftl` `settings-network-wireguard-keepalive`: "Поддержание соединения" — WireGuard clients often keep "Keepalive" untranslated; check which reads better.
- `apps/settings/locales/ru/devices.ftl` `settings-power-time-left`: "До разрядки примерно { $time }" — keeps the duration nominative («3 часа 20 минут»); with «менее минуты» it becomes «примерно менее минуты», check whether that is acceptable.
- `apps/settings/locales/ru/devices.ftl` `settings-power-duration-minutes`: "{ $minutes } минута" — nominative picker values shown next to labels like «Отключать экран через»; fine as separate values, but would need «1 минуту» if ever joined into one phrase.
- `apps/settings/locales/ru/devices.ftl` `settings-keys-keypad`: "Num { $key }" — short form for number-pad keys; check against Russian Windows' shortcut labels.
- `apps/settings/locales/ru/devices.ftl` `settings-keys-volume-up`: "Громкость +" (also volume-down, brightness-up/down with "+"/"−", mute «Без звука», microphone-mute «Откл. микрофон») — compact key labels; check they don't look odd inside a shortcut like Ctrl+Громкость +.
- `apps/settings/locales/ru/protection.ftl` `settings-privacy-screen-off-after`: "{ $duration } бездействия" — the duration arrives nominative («5 минут»), so «Через { $duration }» would give «через 1 минута»; check this reads well as the value next to «Отключение экрана».
- `apps/settings/locales/ru/protection.ftl` `settings-passwords-stores-count`: "Сохранено данных для входа: { $count }" — sign-ins aren't countable in Russian, so every variant uses the colon form.
- `apps/settings/locales/ru/system.ftl` `settings-updates-elsewhere-update-by` (and the other `-by` sentences): "{ $app } устанавливает обновления" — the app name is the bare subject, unlike «приложение X» elsewhere, so the fallback «другое приложение» reads right; check it with names like Schelf.
- `apps/settings/locales/ru/system.ftl` `settings-users-fingerprint-remove-description`: "Входить в систему { $finger } больше не получится." — relies on the finger's .inline form being instrumental («правым указательным пальцем»).
- `apps/settings/locales/ru/personalization.ftl` `settings-cursors-folder-description`: "Здесь появляются темы, сохранённые по пути: Домашняя папка › .local › share › icons" — check the colon construction and that «Домашняя папка» matches Rover's name for Home.
- `apps/settings/locales/ru/personalization.ftl` `settings-appearance-icons-clear`: "Прозрачные" — unsure whether "Clear" means transparent, glass-like icons; check against the actual look.
- `apps/settings/locales/ru/personalization.ftl` `settings-appearance-tint-slate`: "Сланцевый" — may feel bookish; «Серо-синий» is an alternative.

## Website

- `web/site/locales/ru/home.ftl` `home-app-mailman-detail`: "проверка новых отправителей" — "screener" has no settled Russian term.
- `web/site/locales/ru/home.ftl` `home-intro`: "ядро, которое само следит за своей целостностью" — "a core that keeps itself in one piece"; check it doesn't read as the Linux kernel.
- `web/site/locales/ru/home.ftl` `home-security-heading`: "Безопасность по замыслу, а не по настройкам." — free rendering of "Safe by design, not by settings"; check it sounds natural.
- `web/site/locales/ru/site.ftl` `site-footer-made`: "…на основе { $fedora }." — relies on Fedora staying undeclined after «на основе».

## Meet Luft

- `apps/meet/locales/ru/meet.ftl` `meet-logs-saved`: "Журналы пробного запуска Luft сохранены на рабочем столе" — "Try Luft" rendered as «пробный запуск»; check it reads naturally.
- `apps/meet/desktop/locales/ru/desktop.ftl` `check-start-entries`: "Старая загрузочная запись" — "start entry" (firmware boot menu entry), matching Setup's «загрузочные файлы».
- `apps/meet/locales/ru/meet.ftl` `stick-keep`: "Оставить оба" — uses an exact `[1]` variant, since the `one` category also covers 21, 31…; same for `stick-replace-description` and `check-start-entries`.
- `apps/meet/desktop/locales/ru/desktop.ftl` `check-encryption-changing-detail`: "…в Параметрах Windows, в разделе «Шифрование устройства»." — Windows' Settings app is «Параметры» in Russian, unlike Luft's «Настройки».
- `apps/meet/locales/ru/meet.ftl` `room-place-free-detail`: "{ $size }, которые больше ничем не заняты" — the plural relative clause assumes sizes like «120 ГБ»; check it reads well with any size.
- `apps/meet/locales/ru/meet.ftl` `luft-resize-title`: "Изменить размер Luft" — shorter than the English "Change how much space Luft has"; check it reads as the title of the row.
- `apps/meet/desktop/locales/ru/desktop.ftl` `helper-box-room-shortfall`: "В месте для Luft найдётся ещё { $available } ГБ, а выбранным вещам нужно { $needed } ГБ." — "Luft’s room can spare" is the space already set aside for Luft; check that comes across.
