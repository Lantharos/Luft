# Macedonian review list

Strings in Luft's Macedonian translation that a native speaker should check. Each is listed because the term has no settled equivalent, the source is ambiguous, or the wording may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/mk.csv` `Settings`: "Поставки" — chosen over GNOME's "Подесувања" as the word Windows uses; confirm it's the one people know best.
- `packages/i18n/glossary/mk.csv` `Start`: "Старт" — follows Macedonian Windows; check that "менито Старт" reads naturally in sentences.
- `packages/i18n/glossary/mk.csv` `tray`: "системска област" — no settled Macedonian term; Windows' "област за известувања" describes notifications rather than background apps.
- `packages/i18n/glossary/mk.csv` `snap`: "прилепи" — check it reads as arranging a window on the screen; snap group "група прилепени прозорци" may be long for titles.
- `packages/i18n/glossary/mk.csv` `clipboard`: "клипборд" — loanword chosen over "привремена меморија"; check it isn't too colloquial.
- `packages/i18n/glossary/mk.csv` `Keep awake`: "Без спиење" — short tile name; check it reads as a feature, not an instruction.
- `packages/i18n/glossary/mk.csv` `Keyring`: "привезок за клучеви" — no settled Macedonian term.
- `packages/i18n/glossary/mk.csv` `passkey`: "клуч за пристап" — check it doesn't clash with other "клуч" terms such as the recovery key.
- `packages/i18n/glossary/mk.csv` `USB stick`: "USB-меморија" — "USB-стик" and "флеш" are also common.
- `docs/translations/mk.md` percent sign: "57%" with no space — check against current Macedonian orthography and what users expect in battery labels.
- `docs/translations/mk.md` count form: "два диска" but "два прозорци" — check the rule on which masculine nouns take the count form.
- `packages/ui/locales/mk/ui.ftl` `ui-split-windows-size`: "{ $size }, зафатени { $used }" — check the order reads naturally with sizes like "120 GB".
- `packages/ui/locales/mk/ui.ftl` `ui-fingerprint-place`: "Ставете го { $finger } на сензорот." — the doubled "го" fits only masculine finger names, which all current ones are.
- `packages/ui/locales/mk/ui.ftl` `ui-finger-right-ring`: "Десен прстенест прст" — "домал прст" is the alternative; check which is more common.
- `packages/ui/locales/mk/ui.ftl` `ui-toast-dismiss`: "Отфрли" — screen-reader label for closing a notification bubble; "Затвори" would also work.
- `apps/settings/locales/mk/pages.ftl` `settings-page-about`: "За системот" — check against Windows' "За" page name.
- `apps/settings/locales/mk/pages.ftl` `settings-page-add-account`: "Додавање сметка" — verbal noun as a page name, per the heading rule.
- `kestrel/ui/locales/mk/shell.ftl` `keys-space`: "Празно место" — the space bar has no printed label; check what Macedonian users call it ("Space" is also common).

## Kestrel and setup

- `kestrel/ui/locales/mk/surfaces.ftl` `start-search-settings-section`: "Поставки: { $page }" — avoids „Поставки за Изглед“ with a capitalized page name mid-phrase; check it reads well as a search result description.
- `kestrel/ui/locales/mk/system.ftl` `privacy-indicator`: "Во употреба: { $things }" — built as a label so the list items (камера, микрофон, екран, локација, прозорци) need no gender or number agreement.
- `kestrel/ui/locales/mk/system.ftl` `oom-closed-body`: "На компјутерот му снемуваше меморија, па со затворањето сè друго продолжи да реагира." — rephrased to avoid a gendered participle for an unknown app or container.
- `kestrel/ui/locales/mk/system.ftl` `battery-left`: "Преостанато е { $percent }." — impersonal neuter to avoid number agreement with the percentage; check it sounds natural.
- `kestrel/ui/locales/mk/system.ftl` `media-keys-airplane-mode-hardware`: "Режимот за авион е вклучен со копче на уредот" — "in hardware" means a physical switch; check the wording.
- `kestrel/ui/locales/mk/portal.ftl` `portal-unknown-app-subject`: "Апликацијата" — `$appName` stands bare in these sentences because this fallback replaces it, so app names start sentences without „апликацијата“, e.g. „Firefox сака…“.
- `kestrel/engine/locales/mk/engine.ftl` `network-menu-tether`: "Тетеринг" — no settled Macedonian term; also in `network-menu-tethers` „Тетеринг преку Bluetooth“.
- `kestrel/engine/locales/mk/engine.ftl` `network-menu-hotspot`: "Хотспот на { $name }" — loanword; „Точка на пристап“ is the alternative.
- `kestrel/engine/locales/mk/engine.ftl` `screenshot-screencasts-folder`: "Снимки од екранот" — folder name on disk, next to „Слики од екранот“ for screenshots; check the two are distinct enough.
- `kestrel/engine/locales/mk/engine.ftl` `ctrl-alt-tab-panel`: "Лента со задачи" — English says "Panel", which here means the taskbar.
- `apps/setup/locales/mk/setup.ftl` `setup-region-intro-guessed`: "Да почнеме со поставувањето. Претпоставивме: { $guesses }. Сменете сè што не е точно." — the list is built from definite nouns („јазикот и тастатурата според компјутерот“); check the joined sentence with real values.
- `apps/setup/locales/mk/setup.ftl` `setup-account-full-name-example`: "Блаже Конески" — a well-known Macedonian name as the placeholder.
- `apps/setup/locales/mk/setup.ftl` `setup-windows-fast-startup`: "Исклучи го Брзо стартување во Windows" — assumes Windows calls Fast Startup „Брзо стартување“ in Macedonian; same for „Управување со дискови“ (Disk Management) in `setup-windows-bitlocker`.
- `apps/setup/installer/locales/mk/installer.ftl` `installer-no-deployment`: "Новиот систем нема распоредување" — technical term for a system deployment; check the wording.

## Settings

- `apps/settings/locales/mk/connections.ftl` `settings-network-security-psk`, `settings-network-security-sae`, `settings-network-security-enterprise`, `settings-network-security-owe`: "WPA2 лична", "WPA3 лична", "Деловна", "Подобрена отворена" — check whether these Wi-Fi security names should stay in English (WPA2-Personal, Enterprise, Enhanced Open).
- `apps/settings/locales/mk/connections.ftl` `settings-accounts-apple-account`: "Apple-сметка" — Apple has no Macedonian localization; check whether „Apple Account“ reads better.
- `apps/settings/locales/mk/connections.ftl` `settings-accounts-approve`: "…користи Напредна заштита на податоците…" — Apple's Advanced Data Protection has no official Macedonian name.
- `apps/settings/locales/mk/connections.ftl` `settings-bluetooth-windows`: "Уредот { $devices } е спарен во Windows…" / "Уредите { $devices } се спарени…" — the noun avoids gender agreement with device names; check it with a list like „Keyboard, Mouse и уште 3“.
- `apps/settings/locales/mk/connections.ftl` `settings-bluetooth-request-authorize`: "Да се дозволи спарување со { $name }?" — `$name` may be the fallback „уредот“; check both readings.
- `apps/settings/locales/mk/connections.ftl` `settings-network-wireguard-keepalive`: "Одржување на врската" — no settled term for WireGuard keepalive; „Keepalive“ may be more familiar.
- `apps/settings/locales/mk/devices.ftl` `settings-power-time-left`: "Преостанато: околу { $time }" — with „помалку од минута“ it reads „околу помалку од минута“, as awkward as the English.
- `apps/settings/locales/mk/devices.ftl` `settings-sound-mute`: "Исклучи звук – { $name }" — screen-reader label; `$name` is „Јачина на звук“ or an app name, the dash avoids case agreement.
- `apps/settings/locales/mk/devices.ftl` `settings-keys-keypad`: "Нумерички { $key }" — keypad keys have no printed name; check whether „Num { $key }“ is more familiar.
- `apps/settings/locales/mk/devices.ftl` `settings-display-mirror`: "Огледално прикажување" — Windows uses „Дуплирај“; check which is more familiar.
- `apps/settings/locales/mk/protection.ftl` `settings-encryption-passphrase-field`: "Тајна фраза" — passphrase has no settled Macedonian term; chosen to stay distinct from лозинка and used for every passphrase in Settings and setup.
- `apps/settings/locales/mk/protection.ftl` `settings-encryption-pin`: "PIN при стартување" — PIN kept in Latin (PIN-от, PIN-овите); a reviewer may prefer ПИН as on bank cards.
- `apps/settings/locales/mk/personalization.ftl` `settings-fonts-monospace`: "Еднаква ширина" — monospace has no common short term; check it is understood.
- `apps/settings/locales/mk/personalization.ftl` `settings-accessibility-typing-assist-count`: "{ $count } вклучена / вклучени" — feminine agreement assumes a hidden „функција“; check it reads well next to the row title.
- `apps/settings/locales/mk/personalization.ftl` `settings-accessibility-dwell-time`: "Задржи" / `settings-accessibility-hold-time`: "Држи" — labels before a duration slider; check they read well with the value.
- `apps/settings/locales/mk/system.ftl` `settings-updates-switching-standard`: "Се презема стандардната слика на системот…" — "system image" as слика на системот; check it isn't read as a picture.
- `apps/settings/locales/mk/system.ftl` `settings-updates-last-checked`: "Последна проверка { $when }" — relies on relative times like „пред 5 минути“ and „вчера“ reading naturally after it.
- `apps/settings/locales/mk/system.ftl` `settings-datetime-format-12h`: "12-часовен" — English says AM/PM; the format name reads more naturally.

## Website

- `web/site/locales/mk/download.ftl` `download-meet-note`: "Повеќе информации … Сепак изврши" — SmartScreen button labels could not be verified; check them against a Macedonian Windows.
- `web/site/locales/mk/home.ftl` `home-intro`: "основа што сама останува неоштетена" — free rendering of "a core that keeps itself in one piece".
- `web/site/locales/mk/home.ftl` `home-app-disks`: "Складирање" — the kind shown under Дискови; needed a word other than the app name.
- `web/site/locales/mk/home.ftl` `home-meet-usb`: "запишете го ISO-то сами" — check whether „ISO-то“ or „ISO-сликата“ is the usual form.

## Meet Luft

- `apps/meet/locales/mk/meet.ftl` `meet-logs-saved`: "Дневниците од пробувањето на Luft…" — logs as „дневници“ and Try Luft as „пробувањето на Luft“; check both read naturally.
- `apps/meet/locales/mk/meet.ftl` `meet-channel-latest`: "…редовни изданија" — releases as opposed to nightly builds; no settled term.
- `apps/meet/locales/mk/meet.ftl` `room-confirm-title`: "Да се дадат { $size } на Luft?" — plural verb assumes sizes like „120 GB“.
- `apps/meet/locales/mk/meet.ftl` `stick-keep`: "Задржи ги двата" — masculine „двата“ for two Luft builds; check against „двете“.
- `apps/meet/locales/mk/meet.ftl` `linux-ready-replace-title`: "Замени го { $system }" — `$system` is a Latin name or the fallback „овој систем“, so no „системот“ before it.
- `apps/meet/desktop/locales/mk/desktop.ftl` `check-fast-startup-on`: "Брзо стартување е вклучено" — assumes Windows' Macedonian name for Fast Startup; same for „Чистење на дискот“ and „Шифрирање на уредот“.
- `apps/meet/desktop/locales/mk/desktop.ftl` `check-firmware-key-volume-up`: "копчето за зголемување на звукот" — check it fits after „притиснете“.
