# European Portuguese review list

Strings in Luft's European Portuguese translation that a native speaker should check: terms where Windows, macOS, GNOME and KDE disagree in Portugal, and phrasings that may read stiffly or clip.

## Terms and shared strings

- `packages/i18n/glossary/pt.csv` `tray`: "bandeja do sistema" — KDE's term; Windows in Portugal says "área de notificação", which Luft avoids because the tray holds apps. Check it sounds natural.
- `packages/i18n/glossary/pt.csv` `board`: "quadro" — no established equivalent; check it's understood as a canvas of windows.
- `packages/i18n/glossary/pt.csv` `trash`: "Lixo" — GNOME and macOS; Windows users know "Reciclagem". Confirm the choice.
- `packages/i18n/glossary/pt.csv` `Keep awake`: "Manter ativo" — no settled term; "Manter acordado" is the alternative.
- `packages/i18n/glossary/pt.csv` `sandbox`: "ambiente isolado" — Flatpak material in Portuguese often keeps "sandbox".
- `packages/i18n/glossary/pt.csv` `passkey`: "chave de acesso" — Apple in Portugal may use a different term; check what people actually see on websites.
- `packages/i18n/glossary/pt.csv` `Install Luft`: "Instalar o Luft" — check whether the app name reads better without the article.
- `packages/ui/locales/pt/ui.ftl` `ui-recovery-key-saved`: "Guardada" — feminine to agree with "chave"; check it reads right where it appears.
- `packages/ui/locales/pt/ui.ftl` `ui-finger-right-little`: "Mindinho direito" — "Dedo mínimo direito" is more formal; check the register.
- `packages/ui/locales/pt/ui.ftl` `ui-media-pause`: "Pausa" — noun, as Windows uses; "Pausar" is the alternative.
- `apps/settings/locales/pt/settings.ftl` `settings-subpage-back`: "Voltar à página { $page }" — avoids the article before the page name; check it doesn't sound heavy.
- `kestrel/ui/locales/pt/shell.ftl` `battery-level`: "Bateria a { $percentage }%" — no space before %, following Windows; some style guides in Portugal prefer "57 %".
- `kestrel/ui/locales/pt/shell.ftl` `keys-backspace`: "Retrocesso" — Portuguese keyboards print an arrow; check whether "Backspace" is more familiar.

## Kestrel and setup

- `kestrel/ui/locales/pt/system.ftl` `privacy-indicator`: "A utilizar { $things }" with items "a câmara", "o microfone", "o ecrã", "a localização", "as janelas" — check the joined list reads naturally, e.g. "A utilizar a câmara, o microfone e o ecrã".
- `kestrel/ui/locales/pt/system.ftl` `battery-left`: "Resta { $percent } de bateria." — check "Resta 8% de bateria" is preferred over "Restam 8%".
- `kestrel/ui/locales/pt/system.ftl` `health-gpu-reset-body`: "…reiniciou-se sozinho a { $date }, às { $time }." — check "a"/"às" read well with every date and time format (e.g. "à 1:05").
- `kestrel/ui/locales/pt/portal.ftl` `usb-title`, `screen-share-remote-desktop-title`, `shortcuts-consent-title` and other `$appName` messages: built without an article so they also work with the fallback "a aplicação"/"A aplicação"; check "Permitir que Firefox utilize…" without "o" is acceptable.
- `kestrel/ui/locales/pt/portal.ftl` `print-paper-letter` … `print-paper-statement`: paper names kept in English (Letter, Legal, Executive, Statement), Tabloid as "Tabloide" — check against what CUPS and GNOME show in Portuguese.
- `kestrel/engine/locales/pt/engine.ftl` `network-menu-tethers`, `network-menu-tether`: "Partilha de ligação por Bluetooth", "Partilha de ligação" — no settled tile term; check it fits the tile width.
- `kestrel/engine/locales/pt/engine.ftl` `switch-monitor-join`: "Expandir" — Windows' term for extended displays; check it matches Windows in Portugal ("Expandir estes ecrãs").
- `apps/setup/installer/locales/pt/installer.ftl` `installer-no-deployment`: "implementação" — an ostree deployment; technical, check the wording.
- `apps/setup/locales/pt/setup.ftl` `setup-region-intro-guessed`: "Deduzimos { $guesses }; …" with fields carrying their article ("o teclado a partir do computador e o fuso horário a partir da rede") — check the assembled sentence.
- `apps/setup/locales/pt/setup.ftl` `setup-network-unavailable`: "a partir da barra de tarefas" — English says "the panel"; assumed the taskbar's network icons.
- `apps/setup/locales/pt/setup.ftl` `setup-windows-fast-startup`, `setup-windows-bitlocker`: "arranque rápido", "Gestão de Discos" — check these match the names Windows uses in Portugal.
- `apps/setup/locales/pt/setup.ftl` `setup-meet-room-packed`: "O que empacotou no Windows ({ $size }) é desempacotado na sua nova conta." — should match whatever the Meet Luft app calls packing.
- `apps/setup/locales/pt/setup.ftl` `setup-region-title`: "Bem-vindo ao Luft" — masculine form, as Windows uses.

## Settings

- `apps/settings/locales/pt/connections.ftl` `settings-bluetooth-request-display`: ".description = Escreva este código no dispositivo e prima Enter." — `{ $name }` left out because "em { $name }" breaks with the unnamed fallback «o dispositivo» («em o dispositivo»); the title still names the device. Check this reads fine.
- `apps/settings/locales/pt/connections.ftl` `settings-network-security-owe`: "Aberta melhorada" — no settled term for Wi‑Fi Enhanced Open (OWE); check against what Windows or Android show in Portugal.
- `apps/settings/locales/pt/connections.ftl` `settings-network-ip-link-local`: "Só local da ligação" — literal rendering of link-local; GNOME uses «Apenas ligação local», which may read better.
- `apps/settings/locales/pt/connections.ftl` `settings-bluetooth-windows`: "{ $devices } está emparelhado no Windows…" — the participle is masculine; a device name that is clearly feminine would mismatch.
- `apps/settings/locales/pt/system.ftl` `settings-accounts-remove-note`: "Os seus ficheiros ficam no { $provider }." — assumes every provider takes the masculine article (iCloud Drive, OneDrive, Dropbox, Nextcloud, WebDAV).
- `apps/settings/locales/pt/devices.ftl` `settings-sound-mute`: "Desativar som: { $name }" — built with a colon so it works for both «Volume» and app names; check it sounds natural to a screen-reader user.
- `apps/settings/locales/pt/devices.ftl` `settings-display-night-light-from`: "Início" (and `-to` "Fim") — chosen over «Ativa às» because the time picker label is read as "{ $label }, { $time }".
- `apps/settings/locales/pt/devices.ftl` `settings-keys-keypad`: "{ $key } (teclado numérico)" — check whether a shorter form like «Num { $key }» is preferred on shortcut labels.
- `apps/settings/locales/pt/devices.ftl` `settings-power-time-left`: "Tempo restante: cerca de { $time }" — rephrased to avoid «Restam» agreeing with a singular duration.
- `apps/settings/locales/pt/personalization.ftl` `settings-appearance-wallpaper-folder`: "Pasta Wallpapers" — the folder inside Pictures is really named Wallpapers, so the name stays in English; check it reads well next to «Imagens».
- `apps/settings/locales/pt/personalization.ftl` `settings-fonts-sample`: "Um pequeno jabuti xereta viu dez cegonhas felizes" — a well-known pangram, but Brazilian in origin (jabuti, xereta); a more European sentence may be preferable.
- `apps/settings/locales/pt/personalization.ftl` `settings-appearance-icons-clear`: "Transparentes" — the glass-like "Clear" icon style; confirm against the actual look.
- `apps/settings/locales/pt/personalization.ftl` `settings-notifications-banners`: "Faixas" — Windows' word for notification banners; check it is understood.
- `apps/settings/locales/pt/personalization.ftl` `settings-accessibility-zoom`: "Lupa" — Windows' name for the screen magnifier, also used on the lock screen; "Zoom" is the alternative.
- `apps/settings/locales/pt/personalization.ftl` `settings-accessibility-dwell`: "Clicar ao repousar o ponteiro" — no settled term for dwell click; the lock screen's shorter label is «Clique por permanência».
- `apps/settings/locales/pt/protection.ftl` `settings-passwords-stores`: "Credenciais das aplicações" — the sign-ins apps store, rendered as credenciais.
- `apps/settings/locales/pt/protection.ftl` `settings-security-anti-cheat`: "Jogos com anti-batota" — anti-batota is the European word, but gamers may expect "anti-cheat".
- `apps/settings/locales/pt/protection.ftl` `settings-passwords-ssh-added`: "Adicionada { $when }" — assumes $when reads like «há 3 dias» or «ontem»; the same goes for `settings-passkeys-last-used` and `apps/settings/locales/pt/system.ftl` `settings-updates-installed-when` / `settings-updates-released`.
- `apps/settings/locales/pt/system.ftl` `settings-updates-apps-count`: "[0] Geridas no Schelf" — agrees with atualizações; check it fits under the "App updates" row.
- `apps/settings/locales/pt/system.ftl` `settings-about-hostname`: "Nome do anfitrião" — GNOME's term; Windows just says «Nome do dispositivo».

## Website

- `web/site/locales/pt/home.ftl` `home-motion-heading`: "Cada movimento tem intenção." — free rendering of "It moves like it means it"; check it works as a heading.
- `web/site/locales/pt/home.ftl` `home-start-text`: "quando lho pede" — European contraction; check it doesn't read too formal for marketing copy.
- `web/site/locales/pt/home.ftl` `home-question-ready-answer`: "As versões nightly saem sempre que algo muda" — "nightly" kept in English; check whether «versões diárias» reads better.
- `web/site/locales/pt/download.ftl` `download-meet-note`: "Mais informações e depois Executar mesmo assim" — SmartScreen's labels for Portugal from memory, not verified; confirm against a pt-PT Windows 11.

## Meet Luft

- `apps/meet/desktop/locales/pt/desktop.ftl` `check-encryption-changing-detail`: "nas Definições, em Encriptação de dispositivos" — the Windows Settings page name for Portugal from memory; setup.ftl uses the lowercase «encriptação do dispositivo» in running text. Confirm against a pt-PT Windows 11.
- `apps/meet/desktop/locales/pt/desktop.ftl` `check-space-short-windows`: "com a Limpeza do Disco" — Disk Cleanup's pt-PT name, likewise `drive-hide-failed` «Explorador de Ficheiros»; check both against Windows.
- `apps/meet/locales/pt/meet.ftl` `linux-ready-description`: "Até decidir o contrário, { $system } continua a arrancar normalmente." — $system has no article because it can also be «este sistema»; «Fedora Linux 42 continua» without «o» may read slightly bare. Same in the other linux-ready-* messages.
- `apps/meet/locales/pt/meet.ftl` `meet-logs-saved`: "Os registos da experiência com o Luft foram guardados no ambiente de trabalho" — "logs from Try Luft" rendered as «registos da experiência com o Luft»; check it is clear.
- `apps/meet/locales/pt/meet.ftl` `meet-channel-latest`: "O Meet Luft volta a utilizar as versões normais" — "releases" as opposed to nightly builds; «versões estáveis» is the alternative, but there are no stable releases yet.
- `apps/meet/desktop/locales/pt/desktop.ftl` `helper-not-started`: "O processo auxiliar do Meet Luft não arrancou" — "helper" as «processo auxiliar»; check it isn't too technical for an error line.
- `apps/meet/desktop/locales/pt/desktop.ftl` `check-secure-boot-turn-on`: "quando aparecer o logótipo { $maker }" — built without an article so any brand fits; check it reads naturally with «Lenovo», «HP», «Dell».
- `apps/meet/locales/pt/meet.ftl` `luft-resize-passphrase`: "enquanto se desloca" — "while it moves" (Luft moving into its new space at startup); check it is understood, or whether «enquanto muda de tamanho» is clearer.
