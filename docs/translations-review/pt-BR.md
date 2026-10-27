# Brazilian Portuguese review list

Strings in Luft's Brazilian Portuguese translation that a native speaker should check: terms with more than one established equivalent in Brazil, and sentences built around placeables that may not fit every value.

## Terms and shared strings

- `packages/i18n/glossary/pt-BR.tbx` `app`: "app" — chosen over Windows' "aplicativo" for length; check it reads naturally on the Settings page "Apps" and in running text.
- `packages/i18n/glossary/pt-BR.tbx` `tray`: "bandeja do sistema" — Windows 11 in Brazil mostly says "área de notificação" or "estouro do canto da barra de tarefas"; check the better-known word.
- `packages/i18n/glossary/pt-BR.tbx` `snap`: "ajustar", "layout de ajuste", "grupo de ajuste" — Windows' terms; check they don't read as "adjust" out of context.
- `packages/i18n/glossary/pt-BR.tbx` `board`: "quadro" — no settled term; check it suggests a canvas of windows rather than a picture frame.
- `packages/i18n/glossary/pt-BR.tbx` `Keep awake`: "Manter ativo" — check it is clear that the screen stays on.
- `packages/i18n/glossary/pt-BR.tbx` `sandbox`: "sandbox" (feminine) — usage varies between "a sandbox" and "o sandbox".
- `packages/i18n/glossary/pt-BR.tbx` `login screen`: "tela de login" — Windows says "tela de entrada"; check which reads better.
- `packages/i18n/glossary/pt-BR.tbx` `Start`: "Start" — kept as a name; Brazilians know Windows' "Iniciar", so check that "menu Start" doesn't feel odd.
- `packages/web/ui/locales/pt-BR/ui.ftl` `ui-recovery-key-saved`: "Salva" — feminine to agree with "chave"; check it reads well alone on the button.
- `packages/web/ui/locales/pt-BR/ui.ftl` `ui-fingerprint-place`: "Coloque o { $finger } no sensor." — every .inline finger name is masculine; check the sentence with "polegar" and "dedo mínimo".
- `packages/web/ui/locales/pt-BR/ui.ftl` `ui-time-just-now`: "agora mesmo" — lowercase because it may follow other text; check where it shows.
- `kestrel/ui/locales/pt-BR/shell.ftl` `keys-backspace`: "Backspace" — ABNT2 keyboards often print only an arrow; check whether "Backspace" is the usual name.
- `apps/settings/locales/pt-BR/settings.ftl` `settings-more-show`: "Mostrar mais { $count }" — check against "Mostrar outros { $count }".

## Kestrel and setup

- `kestrel/ui/locales/pt-BR/desktop.ftl` `task-view-desktop`: "Espaço de trabalho { $number }" — follows the glossary's word for workspace, where English and Windows say Desktop; check it fits under the workspace thumbnails.
- `kestrel/ui/locales/pt-BR/system.ftl` `privacy-thing-camera` (and the other privacy-thing items): "a câmera", "o microfone" … — items carry their article so the joined list reads “Usando a câmera, o microfone e a tela”; check this fits how the list is joined.
- `kestrel/ui/locales/pt-BR/system.ftl` `dictation-unsupported-title`: "O ditado em { $language } não está disponível neste computador" — $language currently arrives in English (“em Japanese”).
- `apps/setup/locales/pt-BR/setup.ftl` `setup-region-field-language` (and keyboard, time zone): "o idioma" — fields carry articles so “Detectamos o idioma e o teclado pelo computador” reads well; check they are only used inside these lists.
- `kestrel/ui/locales/pt-BR/portal.ftl` `print-paper-statement`: "Statement" — no settled Brazilian name for this paper size; kept the English name.
- `kestrel/ui/locales/pt-BR/system.ftl` `network-menu-tether`: "Ancoragem" — Android's term for tethering; check it is clear on a quick settings tile.
- `kestrel/ui/locales/pt-BR/desktop.ftl` `switch-monitor-external-only`: "Só externa" / `switch-monitor-built-in-only`: "Só integrada" — shortened to stay under 15 characters; feminine agreeing with “tela”.
- `apps/setup/locales/pt-BR/setup.ftl` `setup-account-full-name-example`: "Clarice Lispector" — chosen as a well-known Brazilian name in place of Ada Lovelace.

## Settings

- `apps/settings/locales/pt-BR/connections.ftl` `settings-bluetooth-pair`: "Parear" — chose Parear (Android, everyday use) over Windows' Emparelhar throughout; confirm.
- `apps/settings/locales/pt-BR/connections.ftl` `settings-bluetooth-request-authorize`: "Permitir que { $name } faça o pareamento?" — sentences around $name were rebuilt to avoid "de/em + o dispositivo" contractions when the unnamed fallback is used; check they read well with both a real name and "o dispositivo".
- `apps/settings/locales/pt-BR/connections.ftl` `settings-bluetooth-windows`: "No Windows, já existe pareamento com { $devices }. Use-os aqui sem parear de novo." — phrased to avoid gender agreement with the device list; check it sounds natural.
- `apps/settings/locales/pt-BR/system.ftl` `settings-accounts-online`: "Cada conta é uma pasta dentro de Cloud, na sua pasta pessoal…" — assumes the folder is literally named Cloud on disk and not localized.
- `apps/settings/locales/pt-BR/system.ftl` `settings-accounts-remove-note`: "Seus arquivos continuam no { $provider }." — masculine article fits OneDrive, Dropbox, iCloud Drive, Nextcloud; reads oddly with WebDAV.
- `apps/settings/locales/pt-BR/connections.ftl` `settings-network-mac-builtin`: "Endereço do adaptador" — for "Built-in address" (the card's own MAC); "Endereço original" may be preferred.
- `apps/settings/locales/pt-BR/devices.ftl` `settings-power-time-left`: "Cerca de { $time } de bateria" — rephrased from "about … left" to avoid agreement with the duration; odd with "menos de um minuto".
- `apps/settings/locales/pt-BR/devices.ftl` `settings-display-night-light-from`: "Início" (and `-to` "Fim") — labels of time pickers, rendered as "{ $label }, { $time }"; English says "Turns on/off".
- `apps/settings/locales/pt-BR/devices.ftl` `settings-sound-unmute`: "Ativar o som de { $name }" — $name can be "Volume", giving "Ativar o som de Volume"; screen-reader only.
- `apps/settings/locales/pt-BR/devices.ftl` `settings-keys-keypad`: "Num { $key }" — short label for number pad keys; check it is understood on shortcut labels.
- `apps/settings/locales/pt-BR/devices.ftl` `settings-power-suspend-plugged-in`: "Suspender quando conectado" — paired with "Suspender ao usar bateria"; may clip less than "na tomada" but is slightly vague.
- `apps/settings/locales/pt-BR/devices.ftl` `settings-keyboard-copilot-press`: "Ao pressionar" — English is a noun row title ("Press"); confirm this works as a row label.
- `apps/settings/locales/pt-BR/personalization.ftl` `settings-cursors-folder-description`: "Os temas colocados em Pasta pessoal › .local › share › icons aparecem aqui" — "Pasta pessoal" for Home follows GNOME; check it matches Rover's name for Home.
- `apps/settings/locales/pt-BR/personalization.ftl` `settings-appearance-icons-clear`: "Transparente" — English "Clear" icon style (glassy, see-through) has no settled term; check it fits the actual look.
- `apps/settings/locales/pt-BR/personalization.ftl` `settings-accessibility-typing-assist-count`: "Desativada / { $count } ativa / { $count } ativas" — agrees with "Assistência de digitação" (feminine); check it reads well as a row value.
- `apps/settings/locales/pt-BR/personalization.ftl` `settings-accessibility-pointing`: "Ponteiro" — section heading for pointing aids; "Apontar e clicar" is GNOME's alternative if this feels too narrow.
- `apps/settings/locales/pt-BR/personalization.ftl` `settings-fonts-sample`: "Um pequeno jabuti xereta viu dez cegonhas felizes" — classic Brazilian pangram (misses k, w, y); check it is the preferred one.
- `packages/web/ui/locales/pt-BR/ui.ftl` `ui-passphrase-field`: "Frase secreta" — used for "passphrase" throughout to keep it apart from "senha"; GNOME's term, Windows BitLocker just says "senha".
- `apps/settings/locales/pt-BR/protection.ftl` `settings-passwords-history-read`: "{ $app } usou “{ $item }”" — app names start the sentence without the article the style guide asks for (o Rover), since $app can be any app; same in the other history lines and `settings-passwords-forget-*`.
- `apps/settings/locales/pt-BR/protection.ftl` `settings-security-anti-cheat`: "Jogos com antitrapaça" — "anti-cheat" is often left in English by Brazilian gamers; check which reads more natural.
- `apps/settings/locales/pt-BR/system.ftl` `settings-updates-stay`: "Ficar na { $version }" — elided "versão"; check it reads naturally with a version number.



## Website

- `web/site/locales/pt-BR/home.ftl` `home-motion-heading`: "Cada movimento tem intenção." — free rendering of "It moves like it means it"; check it works as a heading.
- `web/site/locales/pt-BR/home.ftl` `home-question-ready-answer`: "As versões nightly saem sempre que algo muda" — "nightly" kept in English as most Brazilian projects do.
- `web/site/locales/pt-BR/download.ftl` `download-meet-note`: "Mais informações e depois Executar assim mesmo" — SmartScreen's Brazilian labels from memory; confirm against a pt-BR Windows 11.

## Meet Luft

- `apps/meet/locales/pt-BR/meet.ftl` `linux-ready-this-system`: "sistema atual" — the fallback goes after an article ("o { $system }") in every sentence, so it is "sistema atual" without "este"; check the sentences read well with both a real name like Fedora Linux 42 and the fallback.
- `apps/meet/locales/pt-BR/meet.ftl` `meet-channel-latest`: "O Meet Luft vai voltar a usar as versões estáveis" — "releases" as opposed to nightly builds; "estáveis" may overpromise while no stable release exists yet.
- `apps/meet/locales/pt-BR/meet.ftl` `meet-logs-saved`: "Os logs de quando você experimentou o Luft foram salvos na área de trabalho" — "Try Luft" as a mode name doesn't fit inside a sentence, so it is paraphrased here and in the other log messages; long for a notice.
- `apps/meet/desktop/locales/pt-BR/desktop.ftl` `check-secure-boot-turn-on`: "quando o logotipo da { $maker } aparecer" — assumes every brand takes the feminine article (a Lenovo, a Dell, a HP).
- `apps/meet/desktop/locales/pt-BR/desktop.ftl` `helper-not-started`: "O auxiliar do Meet Luft não iniciou" — "auxiliar" for "helper" (the elevated process); "assistente" would read as a wizard.
- `apps/meet/desktop/locales/pt-BR/desktop.ftl` `check-encryption-changing-detail`: "em Configurações, em Criptografia do dispositivo" — page name from memory of pt-BR Windows 11; Fast Startup follows setup's "Inicialização rápida", Disk Cleanup is "Limpeza de Disco", Explorer "Explorador de Arquivos".
- `apps/meet/locales/pt-BR/meet.ftl` `box-folder-music`: "Músicas" (and "Imagens", "Área de trabalho") — meant to match the folder names Windows shows in Portuguese (Brazil).
