# Ukrainian review list

Strings in Luft's Ukrainian translation that a native speaker should check, each listed because the term has no settled equivalent, Ukrainian systems disagree on it, the grammar around a placeable may not fit every value, or the wording may clip.

## Terms and shared strings

- `packages/i18n/glossary/uk.csv` `Settings`: "Параметри" — GNOME, macOS and Windows 10 use it, Windows 11 and Android say "Налаштування"/"Настройки"; check it reads naturally in phrases like "Параметри дисплея".
- `packages/i18n/glossary/uk.csv` `app`: "програма" — what Windows, macOS and GNOME say; "застосунок" is the newer word many Ukrainian apps use. Check which one readers expect today.
- `packages/i18n/glossary/uk.csv` `Install Luft`: "Встановлення Luft" — a noun like Windows' installer; check it reads as an app name next to "Диски".
- `packages/i18n/glossary/uk.csv` `Start`: "Пуск" — Windows' name; check it doesn't read dated next to the rest of Luft.
- `packages/i18n/glossary/uk.csv` `board`: "дошка" — no established term for this canvas mode; check it doesn't read as a whiteboard or notice board.
- `packages/i18n/glossary/uk.csv` `snap`: "прикріпити" — next to "закріпити" for pin; check the two stay distinct for readers.
- `packages/i18n/glossary/uk.csv` `tray`: "системний лоток" — KDE's word; Windows users may expect "область сповіщень".
- `packages/i18n/glossary/uk.csv` `Keep awake`: "Не засинати" — no settled term; check it reads naturally as a tile label.
- `packages/i18n/glossary/uk.csv` `suspend`: "Сплячий режим" — long for a power menu item; "Сон" is the shorter option.
- `packages/i18n/glossary/uk.csv` `shut down`: "Вимкнути" — the same word as turn off; Windows says "Завершити роботу".
- `packages/i18n/glossary/uk.csv` `undo`: "скасувати" — collides with Cancel; "Повернути" is the fallback where both appear.
- `packages/i18n/glossary/uk.csv` `signed startup`: "підписаний запуск" — no established term; check it doesn't read oddly next to Secure Boot.
- `packages/i18n/glossary/uk.csv` `security chip`: "процесор безпеки" — Windows' name for the TPM, though it is a chip; check people recognize it.
- `packages/ui/locales/uk/ui.ftl` `ui-fingerprint-place`: "Прикладіть { $finger } до сканера." — relies on .inline being accusative, which equals the nominative for every finger name; check it reads naturally.
- `packages/ui/locales/uk/ui.ftl` `ui-media-pause`: "Пауза" — a noun among infinitive buttons, as media players usually label it; "Призупинити" is the alternative.
- `packages/ui/locales/uk/ui.ftl` `ui-select-placeholder`: "Вибрати" — placeholder of an empty dropdown; check whether "Не вибрано" reads better.
- `apps/settings/locales/uk/settings.ftl` `settings-subpage-back`: "Назад до сторінки { $page }" — $page stays in the nominative after "сторінки"; check it reads well with titles like "Живлення й акумулятор".
- `apps/settings/locales/uk/pages.ftl` `settings-page-appearance`: "Вигляд" — GNOME's word; Windows calls the page "Персоналізація".
- `apps/settings/locales/uk/pages.ftl` `settings-page-display`: "Дисплеї" — plural because there can be several; Windows says "Дисплей".
- `kestrel/ui/locales/uk/shell.ftl` `battery-level`: "Акумулятор { $percentage }%, повністю заряджено" — impersonal forms after a masculine noun; check "повністю заряджений" doesn't read better.

## Kestrel and setup

- `kestrel/ui/locales/uk/desktop.ftl` `taskbar-show-keyboard-layout`: "Показувати розкладку клавіатури" — read as an on/off menu item; if it is a one-off action it should be «Показати».
- `kestrel/ui/locales/uk/desktop.ftl` `window-menu-close`: uses an exact `[1]` variant instead of `[one]`, because Ukrainian `one` also covers 21, 31… — check that "Закрити вікно" / "Закрити всі вікна" reads right.
- `kestrel/ui/locales/uk/portal.ftl` `usb-title`, `usb-description`: same `[1]` instead of `[one]` reason — check.
- `kestrel/ui/locales/uk/portal.ftl` `screen-share-title`, `usb-title`, `shortcuts-consent-title`: "Показати { $appName } ваш екран?" — the app name sits undeclined in a dative slot (the fallback is «цій програмі»); check it reads naturally with real names like Zoom or OBS.
- `kestrel/ui/locales/uk/portal.ftl` `portal-launcher-description`: "{ $appName } хоче додати ярлик до меню „Пуск“." — «ярлик» instead of «програму», so the fallback «Програма» isn't repeated.
- `kestrel/ui/locales/uk/system.ftl` `oom-closed-body`: "…тому довелося це зробити, щоб усе інше й далі працювало без затримок." — gender-neutral wording because the title can be an app (feminine) or a container (masculine).
- `kestrel/ui/locales/uk/system.ftl` `privacy-indicator`: "Задіяно: { $things }" — chosen so the list stays in the nominative.
- `kestrel/ui/locales/uk/system.ftl` `dictation-unsupported-title`: "Диктування для мови { $language } недоступне на цьому комп’ютері" — $language arrives in English, so «для мови» keeps it undeclined.
- `kestrel/ui/locales/uk/system.ftl` `peek-error-unknown-handle`: "…не має дескриптора { $handle }…" — "handle" rendered as «дескриптор»; a reviewer may prefer «мітка».
- `kestrel/engine/locales/uk/engine.ftl` `network-menu-tethers`: "Модеми Bluetooth" — Bluetooth tethering; check against KDE/GNOME wording.
- `kestrel/engine/locales/uk/engine.ftl` `screenshot-source`: "Знімки й записи екрана" — name for "Screen Capture" notifications; «Захоплення екрана» is the alternative.
- `apps/setup/locales/uk/setup.ftl` `setup-region-intro-guessed`, `setup-region-field-*`: field names are in the accusative (мову, клавіатуру) to follow «Автоматично визначено …» — check the joined list reads well.
- `apps/setup/locales/uk/setup.ftl` `setup-windows-hibernated`: "…утримуйте Shift, вибираючи «Завершити роботу»…" — Windows' Ukrainian menu item; check it matches current Windows.
- `apps/setup/locales/uk/setup.ftl` `setup-windows-bitlocker`: "…у програмі «Керування дисками»…" — Windows' Ukrainian name for Disk Management.
- `apps/setup/locales/uk/setup.ftl` `setup-account-user-name-invalid`: "Використовуйте малі латинські літери, цифри, - і _" — added «латинські» since Cyrillic isn't allowed; confirm.
- `apps/setup/locales/uk/setup.ftl` `setup-protect-kept`: "Ключ відновлення збережено" — impersonal to avoid the gendered «Я зберіг/зберегла».

## Settings

- `apps/settings/locales/uk/connections.ftl` `settings-bluetooth-request-unnamed`: "без назви" — chosen so it reads after «пристроєм/пристрою/пристрої { $name }» in every pairing sentence; check it reads well in all six.
- `apps/settings/locales/uk/connections.ftl` `settings-bluetooth-windows`: "Пристрій { $devices } має пару у Windows…" — $devices is a list of names; check the noun in front reads naturally with a joined list like «Клавіатура, Миша і ще 3».
- `apps/settings/locales/uk/connections.ftl` `settings-network-security-owe`: "Покращена відкрита" — no settled Ukrainian name for OWE / Enhanced Open; check against Windows or Android.
- `apps/settings/locales/uk/connections.ftl` `settings-network-anonymous-identity`: "Анонімна ідентичність" — Windows and NetworkManager wording varies («анонімне посвідчення»); check.
- `apps/settings/locales/uk/connections.ftl` `settings-accounts-remove-note`: "Ваші файли залишаться в сервісі { $provider }. Зміни, зроблені тут, спершу буде вивантажено." — check «сервісі» vs «службі» and «вивантажено» for uploading.
- `apps/settings/locales/uk/devices.ftl` `settings-power-time-left`: "Залишилося приблизно { $time }" — $time is nominative («1 хвилина»), so agreement is slightly off for 1, 21…; check if acceptable.
- `apps/settings/locales/uk/devices.ftl` `settings-power-long-sleep-hours`: "{ $hours } годину" — accusative, to follow the label «Вимикати через»; settings-power-duration-* stay nominative because they are also used inside sentences.
- `apps/settings/locales/uk/devices.ftl` `settings-keys-keypad`: "Num { $key }" — keyboards print no word for the keypad; check if «Num 5» is what people expect.
- `apps/settings/locales/uk/devices.ftl` `settings-dictation-copilot-key`: "клавішу Copilot" — accusative because it is inserted after «Утримуйте»; check it still reads right everywhere $keys is used.
- `apps/settings/locales/uk/system.ftl` `settings-updates-elsewhere-*-by`: "{ $app } шукає оновлення" — the name starts the sentence without «програма», because the fallback is «інша програма»; check it reads well with names like Schelf.
- `apps/settings/locales/uk/personalization.ftl` `settings-cursors-folder-description`: "Тут з’являються теми з папки Домівка › .local › share › icons" — «Домівка» is GNOME's name for the home folder; it must match what Rover shows in its path bar.
- `apps/settings/locales/uk/personalization.ftl` `settings-fonts-sample`: "Чуєш їх, доцю, га? Кумедна ж ти, прощайся без ґольфів!" — a well-known Ukrainian pangram; check it fits the preview width.
- `apps/settings/locales/uk/personalization.ftl` `settings-accessibility-dwell-time`: "Утримувати" — followed by a duration slider; check it reads naturally next to the value (same for `settings-accessibility-hold-time`).
- `apps/settings/locales/uk/personalization.ftl` `settings-accessibility-locate-pointer`: "Знаходити вказівник клавішею Ctrl" — rephrased as a switch label rather than an instruction.
- `apps/settings/locales/uk/personalization.ftl` `settings-taskbar-look-accent`: "Колір акценту" — noun among feminine adjectives (Суцільна, Прозора); «Акцентна» is shorter if it clips.
- `apps/settings/locales/uk/protection.ftl` `settings-security-anti-cheat`: "Ігри з античитом" — gamer word «античит»; check it is acceptable in a system interface.
- `apps/settings/locales/uk/protection.ftl` `settings-passwords-access-reset`: "Дозволити програмі { $app } знову запитати доступ до { $item }" — $item stays in the nominative after «до»; fine for most names, may read oddly for declinable ones.
- `apps/settings/locales/uk/protection.ftl` `settings-passwords-contents`: "{ $count } паролі або ключі" — mixed count of passwords and keys; check the few/many forms read naturally.
- `apps/settings/locales/uk/protection.ftl` `settings-passwords-stores-count`: "Збережено облікових даних: { $count }" — «облікові дані» is uncountable, so all plural variants use the colon form.
- `apps/settings/locales/uk/system.ftl` `settings-datetime-increase`: "Збільшити: { $label }" — colon form so the hour/minute label can stay in the nominative.
- `apps/settings/locales/uk/system.ftl` `settings-users-fingerprint-remove-description`: "Ви більше не зможете входити, прикладаючи { $finger }." — relies on .inline being in the accusative, which matches the nominative for these masculine nouns.
- `apps/settings/locales/uk/system.ftl` `settings-updates-stay`: "Залишитися на { $version }" — check that a bare version number after «на» reads well on the button.
