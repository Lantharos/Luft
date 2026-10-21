# Bulgarian review list

Strings in Luft's Bulgarian translation that a native speaker should check. Each is listed because the term has no settled equivalent, the source is ambiguous, or the wording may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/bg.csv` `board`: "табло" — check it reads as a canvas of windows rather than a dashboard; "дъска" was the alternative.
- `packages/i18n/glossary/bg.csv` `wallpaper`: "тапет" — chosen over "фон" (Windows' Personalization word) to avoid confusion with background colors; confirm it doesn't feel too colloquial.
- `packages/i18n/glossary/bg.csv` `tray`: "системна област" — no settled Bulgarian term; Windows says "област за уведомяване", which describes notifications rather than background apps.
- `packages/i18n/glossary/bg.csv` `Keep awake`: "Без заспиване" — short tile name; check it reads as a feature and not as an instruction.
- `packages/i18n/glossary/bg.csv` `Media Viewer`: "Преглед на мултимедия" — generic app name; check against what Bulgarian desktops call a viewer.
- `packages/i18n/glossary/bg.csv` `snap group`: "група за прилепване" — follows Windows' "оформление за прилепване"; check it's understandable on its own.
- `packages/i18n/glossary/bg.csv` `Install Luft`: "Инсталиране на Luft" — a verbal noun as the app name; the imperative "Инсталирай Luft" would match buttons instead.
- `docs/translations/bg.md` quotation marks: "‚…‘" for inner quotes — check against current Bulgarian typographic practice.
- `docs/translations/bg.md` percent sign: "57 %" with a space — follows the orthographic dictionary; check it matches what users expect in battery labels.
- `packages/web/ui/locales/bg/ui.ftl` `ui-window-minimize`: "Минимизирай" — imperative per the button rule; Windows uses "Минимизиране" for its title bar buttons.
- `packages/web/ui/locales/bg/ui.ftl` `ui-select-placeholder`: "Изберете" — placeholder in a dropdown; check the polite form reads well there.
- `packages/web/ui/locales/bg/ui.ftl` `ui-split-windows-size`: "{ $size }, заети { $used }" — check the order reads naturally with sizes like "120 GB".
- `packages/web/ui/locales/bg/ui.ftl` `ui-finger-right-little`: "Дясно кутре" — "кутре" is neuter, so the .inline form is "дясното кутре"; check it isn't too informal next to "показалец".
- `kestrel/ui/locales/bg/shell.ftl` `keys-space`: "Интервал" — the space bar has no printed label; the other keys keep their English names as printed on Bulgarian keyboards.

## Kestrel and setup

- `kestrel/ui/locales/bg/desktop.ftl` `task-view-desktop`: "Работно пространство { $number }" — follows the glossary (workspace = работно пространство, not работен плот as Windows says); check it doesn't clip in the task view.
- `kestrel/engine/locales/bg/engine.ftl` `auto-rotate-title`: "Автозавъртане" — shortened for the tile; confirm it reads naturally versus "Автоматично завъртане".
- `kestrel/engine/locales/bg/engine.ftl` `network-menu-tether`: "Тетъринг" — Android's loanword; check it is the expected term for a Bluetooth tether tile.
- `kestrel/engine/locales/bg/engine.ftl` `network-menu-mobile`: "Мобилни данни" — chosen for the "Mobile" (broadband) tile, while its settings item and the PIN prompt say "мобилен интернет"; check whether one term should cover both.
- `kestrel/engine/locales/bg/engine.ftl` `switch-monitor-join`: "Разширяване" — Windows' "Extend" wording for joining displays.
- `kestrel/engine/locales/bg/engine.ftl` `autorun-connected`: "Свързано: „{ $driveName }“" — phrased this way to avoid gender agreement with an unknown partition name.
- `kestrel/ui/locales/bg/system.ftl` `oom-closed-body`: "Паметта на компютъра почти се изчерпа и затварянето му помогна всичко останало да продължи да работи гладко." — rephrased so "му" covers both приложението and контейнерът; check it reads naturally.
- `kestrel/ui/locales/bg/system.ftl` `dictation-unsupported-title`: "Диктовка на { $language } не е налична на този компютър" — $language arrives in English for now, so it will read "на Japanese".
- `kestrel/ui/locales/bg/system.ftl` `privacy-indicator`: "В употреба: { $things }" — avoids agreement with the list; check the list joiner output looks right.
- `kestrel/ui/locales/bg/surfaces.ftl` `quick-settings-battery-left`: "Остават { $duration }" — plural verb assumed for formatted spans like "1 ч 20 мин"; reads oddly with a single "1 ч".
- `kestrel/ui/locales/bg/portal.ftl` `portal-unknown-app-subject`: "Приложението" — app names in portal sentences have no "приложението" prefix because this fallback fills the same slot; check sentences like "{ $appName } ще вижда…" read well with both.
- `kestrel/ui/locales/bg/portal.ftl` `print-orientation-portrait`: "Портретна" / "Пейзажна" — check against what Bulgarian print dialogs use (some say "Книжна"/"Албумна").
- `apps/setup/locales/bg/setup.ftl` `setup-region-intro-guessed`: "Да започнем с настройката. Определихме { $guesses }, затова променете каквото не е вярно." — guesses expand to "езика и клавиатурата по компютъра ви и часовата зона по мрежата ви"; check the joined sentence.
- `apps/setup/locales/bg/setup.ftl` `setup-account-user-name-invalid`: "Използвайте малки латински букви, цифри, - и _" — added "латински", assuming user names are ASCII only.
- `apps/setup/locales/bg/setup.ftl` `setup-windows-hibernated`: "…изключен с Бързо стартиране…" — Fast Startup and Disk Management (Управление на дискове) named as Bulgarian Windows does; verify.

## Settings

- `apps/settings/locales/bg/connections.ftl` `settings-network-security`, `settings-network-detail-security`: "Защита", "Вид защита" — Wi‑Fi security uses защита as in Windows, not the glossary's сигурност (which stays for the Security page); confirm.
- `apps/settings/locales/bg/connections.ftl` `settings-network-security-owe`: "Подобрена отворена" — no settled Bulgarian name for Enhanced Open (OWE); check whether keeping the English name is better.
- `apps/settings/locales/bg/connections.ftl` `settings-network-ip-link-local`: "Само локална връзка" — GNOME-style rendering of link-local; check it is recognizable.
- `apps/settings/locales/bg/connections.ftl` `settings-network-ip-search-domains` `.label`: "{ $family } домейни за търсене" — Windows-style prefix order, unlike the "Метод за { $family }" pattern used for the other labels.
- `apps/settings/locales/bg/system.ftl` `settings-accounts-online`: "…папка в Cloud в личната ви папка…" — assumes the folder is literally named Cloud on disk; confirm.
- `apps/settings/locales/bg/connections.ftl` `settings-bluetooth-windows`: "В Windows е сдвоено: { $devices }…" — rephrased with a colon so device names of any gender fit.
- `apps/settings/locales/bg/system.ftl` `settings-accounts-provider-icloud`: "акаунт в Apple" — follows Apple's Bulgarian wording for Apple Account; confirm.
- `apps/settings/locales/bg/devices.ftl` `settings-sound-mute`: "{ $name }: изключи звука" — colon form because $name can be "Сила на звука" or an app name.
- `apps/settings/locales/bg/devices.ftl` `settings-sound-connection`: "Връзка" — the device port (speakers vs headphones); check whether "Порт" or "Изход" reads better.
- `apps/settings/locales/bg/devices.ftl` `settings-keys-keypad`: "Num { $key }" — short label for number-pad keys; check against what Bulgarian users expect.
- `apps/settings/locales/bg/devices.ftl` `settings-dictation-engine-description`: "{ $engine } разпознава { $language }" — assumes language names arrive lowercase, as Bulgarian writes them.
- `apps/settings/locales/bg/devices.ftl` `settings-shortcuts-add`: "Добави комбинация" — shared by a dialog title and a button, so the imperative is used for both.
- `apps/settings/locales/bg/protection.ftl` `settings-passwords-stores-count`: "{ $count } запазен вход / запазени входа" — "sign-ins" as a countable noun is awkward in Bulgarian; check whether another phrasing fits better.
- `apps/settings/locales/bg/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } включена / включени" — the counted noun (помощна функция) is implied; check it reads well next to the row title "Помощ при писане".
- `apps/settings/locales/bg/personalization.ftl` `settings-appearance-theme-apps`: "Цветове от тапета и за другите приложения" — free rendering of "Match other apps to the wallpaper"; check it is clear as a switch title.
- `apps/settings/locales/bg/personalization.ftl` `settings-appearance-icons-clear`: "Прозрачни" — assumes "Clear" means glass-like transparent icons, not "remove".
- `apps/settings/locales/bg/protection.ftl` `settings-security-anti-cheat`: "Игри със защита срещу измами" — anti-cheat has no settled Bulgarian term; gamers may simply say "анти-чийт".
- `apps/settings/locales/bg/system.ftl` `settings-datetime-increase`: "Увеличи: { $label }" — colon used so the case of Час/Минута doesn't matter.
- `packages/web/ui/locales/bg/ui.ftl` `ui-passphrase-field`: "Парола за диска" — used for passphrase in Settings and in setup, to keep it apart from the account password; check it reads naturally everywhere.
- `apps/settings/locales/bg/personalization.ftl` `settings-appearance-wallpaper-folder-description`: "Снимки › Wallpapers" — "Снимки" is used for the Pictures folder throughout; check it matches the folder name Bulgarian systems actually create (some use "Изображения").

## Website

- `web/site/locales/bg/download.ftl` `download-meet-note`: "Повече информация … Изпълни въпреки това" — SmartScreen button labels from memory; check them against a Bulgarian Windows.
- `web/site/locales/bg/home.ftl` `home-description`: "Спокойна и бърза работна среда" — "desktop" in the sense of the whole environment, per the glossary's работна среда; check it reads well as the tagline.
- `web/site/locales/bg/home.ftl` `home-app-disks`: "Съхранение" — the kind shown under Дискове; needed a word other than the app name.
- `web/site/locales/bg/download.ftl` `download-needs-space-value`: "32 ГБ или повече" — Cyrillic unit as Windows writes it; check against how other Bulgarian strings in Luft show sizes.

## Meet Luft

- `apps/meet/locales/bg/meet.ftl` `meet-logs-saved`: "Журналите от пробването на Luft…" — logs as "журнали"; Windows says "регистрационни файлове" and many people say "логове".
- `apps/meet/locales/bg/meet.ftl` `ready-remove-description`: "кашона за преместване" — the moving box; check it reads as a container for packed things and not too literally.
- `apps/meet/locales/bg/meet.ftl` `box-pack`: "Опаковай" — pack/unpack as опаковам/разопаковам, while Setup says "Нещата, които събрахте"; check whether събирам fits better.
- `apps/meet/locales/bg/meet.ftl` `hello-check`: "Провери този компютър" — PC and computer are both "компютър", as Bulgarian Windows says; the $platform variants are identical.
- `apps/meet/locales/bg/meet.ftl` `linux-ready-restart-replace`: "Инсталаторът се отваря с { $system } като система за замяна" — phrased to avoid gender agreement with the system name.
- `apps/meet/locales/bg/meet.ftl` `check-action-tidy`: "Разчисти" — tidying old start entries; check it's clear as a button.
- `apps/meet/desktop/locales/bg/desktop.ftl` `check-secure-boot-turn-on`: "натиснете { $key }" — with `check-firmware-key-volume-up` as "бутона за увеличаване на звука"; check the sentence reads well with both a key name and the button.
- `apps/meet/desktop/locales/bg/desktop.ftl` `check-fast-startup-on`: "Бързо стартиране е включено" — the setting's name is neuter by its sense (стартиране); confirm the agreement.
- `apps/meet/locales/bg/meet.ftl` `room-places-title`: "Къде да се настани Luft?" — echoes „да се настани“ from check-blocked-description; check it doesn’t sound too figurative for choosing a drive.
- `apps/meet/locales/bg/meet.ftl` `room-place-windows-free`: "Там вече има { $size } свободни" — plural agreement assumes sizes like „120 GB“.
- `apps/meet/desktop/locales/bg/desktop.ftl` `helper-box-room-shortfall`: "Мястото на Luft може да отдели { $available } ГБ, а за избраното са нужни { $needed } ГБ." — "Luft’s room can spare" is the space already set aside for Luft; check that comes across.
