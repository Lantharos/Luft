## Quick settings tiles

auto-rotate-title = Rotació automàtica
dark-style-title = Mode fosc
do-not-disturb-title = No molestis
night-light-title = Llum nocturna
airplane-mode-title = Mode d’avió

## Power mode

power-profile-title = Mode d’energia
power-profile-header = Mode d’energia
power-profile-open-menu = Obre el menú de modes d’energia
power-profile-settings = Configuració d’energia
power-profile-performance = Rendiment
power-profile-balanced = Equilibrat
power-profile-power-saver = Estalvi d’energia
power-profile-custom = Personalitzat

## Keep awake

caffeine-title = Mantén actiu
caffeine-open-menu = Obre el menú Mantén actiu
caffeine-until = Fins a les { $time }
caffeine-until-turned-off = Fins que es desactivi
caffeine-30-minutes = 30 minuts
caffeine-1-hour = 1 hora
caffeine-2-hours = 2 hores
caffeine-inhibit-reason = Mantingut actiu des de la configuració ràpida

## Brightness

brightness-title = Brillantor
brightness-open-menu = Obre el menú de brillantor

## Keyboard backlight

backlight-title = Retroil·luminació del teclat
backlight-open-menu = Obre el menú de brillantor del teclat
backlight-slider = Brillantor del teclat
backlight-off = Desactivada
backlight-low = Baixa
backlight-high = Alta

## Sound

volume-sound-settings = Configuració del so
volume-mute = Silencia
volume-unmute = Activa el so
volume-output-slider = Volum
volume-output-title = Sortida de so
volume-output-open-menu = Obre el menú de sortida de so
volume-input-slider = Micròfon
volume-input-title = Entrada de so
volume-input-open-menu = Obre el menú d’entrada de so

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Obre el menú del Bluetooth
bluetooth-settings = Configuració del Bluetooth
bluetooth-connect = Connecta
bluetooth-disconnect = Desconnecta
bluetooth-connect-device = Connecta a { $deviceName }
bluetooth-disconnect-device = Desconnecta { $deviceName }
bluetooth-no-devices = No hi ha dispositius disponibles ni connectats
bluetooth-turn-on-hint = Activeu el Bluetooth per connectar dispositius
bluetooth-connected-count = { $count ->
    [one] { $count } connectat
   *[other] { $count } connectats
}

## Network menus in quick settings

network-menu-unknown-network = <desconeguda>
network-menu-connect = Connecta
network-menu-disconnect = Desconnecta
network-menu-connect-to = Connecta a { $name }
network-menu-disconnect-from = Desconnecta { $name }
network-menu-turn-off = Desactiva
network-menu-wifi-network = { $secure ->
    [yes] { $name }, segura, intensitat del senyal { $strength } %
   *[no] { $name }, no segura, intensitat del senyal { $strength } %
}
network-menu-hotspot = Punt d’accés de { $name }
network-menu-connected-count = { $count ->
    [one] { $count } connectada
   *[other] { $count } connectades
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Obre el menú de VPN
network-menu-vpn-settings = Configuració de VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Obre el menú de Wi-Fi
network-menu-wifi-settings = Totes les xarxes
network-menu-wired = Connexions amb cable
network-menu-wired-open-menu = Obre el menú de connexions amb cable
network-menu-wired-settings = Configuració de la xarxa amb cable
network-menu-tethers = Compartició per Bluetooth
network-menu-tethers-open-menu = Obre el menú de compartició per Bluetooth
network-menu-tether = Compartició
network-menu-tether-settings = Configuració del Bluetooth
network-menu-mobile-connections = Connexions mòbils
network-menu-mobile-open-menu = Obre el menú de connexions mòbils
network-menu-mobile-settings = Configuració de la banda ampla mòbil
network-menu-mobile = Mòbil
network-menu-sign-in = Inicieu la sessió a la xarxa
network-menu-failed-title = Ha fallat la connexió
network-menu-failed-body = No s’ha pogut activar la connexió de xarxa

## Location access dialog

location-dialog-title = Permet l’accés a la ubicació
location-dialog-description = L’aplicació { $appName } vol accedir a la vostra ubicació
location-dialog-info = Podeu canviar l’accés a la ubicació en qualsevol moment a la configuració de privadesa
location-dialog-deny = Denega l’accés
location-dialog-grant = Concedeix l’accés

## Thunderbolt notifications

thunderbolt-unknown-title = Dispositiu Thunderbolt desconegut
thunderbolt-unknown-body = S’ha connectat un dispositiu nou mentre éreu fora. Desconnecteu-lo i torneu-lo a connectar per començar a fer-lo servir.
thunderbolt-unauthorized-title = Dispositiu Thunderbolt no autoritzat
thunderbolt-unauthorized-body = S’ha connectat un dispositiu nou i cal l’aprovació d’un administrador
thunderbolt-error-title = Error d’autorització del Thunderbolt
thunderbolt-error-body = No s’ha pogut autoritzar el dispositiu Thunderbolt: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Denega
access-dialog-allow = Permet

## Display change confirmation

display-change-title = Voleu mantenir aquests canvis?
display-change-countdown = { $seconds ->
    [one] Els canvis es desfaran d’aquí a { $seconds } segon
   *[other] Els canvis es desfaran d’aquí a { $seconds } segons
}
display-change-revert = Desfés els canvis
display-change-keep = Mantén els canvis

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = «{ $appName }» no respon
close-dialog-description = Podeu esperar una mica perquè continuï o forçar que l’aplicació es tanqui del tot
close-dialog-force-quit = Força el tancament
close-dialog-wait = Espera

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Duplica
switch-monitor-join = Amplia
switch-monitor-external-only = Només externa
switch-monitor-built-in-only = Només integrada

## Sign-in prompt

auth-prompt-password = Contrasenya
auth-prompt-username = Nom d’usuari
auth-prompt-back = Enrere
auth-prompt-submit = Envia
auth-prompt-wrong-password = La contrasenya no ha funcionat
auth-prompt-failed = No ha funcionat. Torneu-ho a provar.
fingerprint-not-recognized = No s’ha reconegut l’empremta digital

## Drive connected notification

autorun-connected = S’ha connectat «{ $driveName }»
autorun-ready = Ja podeu fer servir el disc
autorun-open-with = Obre amb { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = S’han activat les tecles lentes
kbd-a11y-slow-keys-off = S’han desactivat les tecles lentes
kbd-a11y-slow-keys-description = Heu mantingut premuda la tecla Maj durant 8 segons. Aquesta és la drecera de les tecles lentes, que canvien com funciona el teclat.
kbd-a11y-sticky-keys-on = S’han activat les tecles enganxoses
kbd-a11y-sticky-keys-off = S’han desactivat les tecles enganxoses
kbd-a11y-sticky-keys-on-description = Heu premut la tecla Maj 5 vegades seguides. Aquesta és la drecera de les tecles enganxoses, que canvien com funciona el teclat.
kbd-a11y-sticky-keys-off-description = Heu premut dues tecles alhora, o la tecla Maj 5 vegades seguides. Això desactiva les tecles enganxoses, que canvien com funciona el teclat.
kbd-a11y-leave-on = Deixa-les activades
kbd-a11y-turn-on = Activa
kbd-a11y-turn-off = Desactiva
kbd-a11y-leave-off = Deixa-les desactivades

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Trieu el dispositiu d’àudio
audio-device-cancel = Cancel·la
audio-device-sound-settings = Configuració del so
audio-device-headphones = Auriculars
audio-device-headset = Auriculars amb micròfon
audio-device-microphone = Micròfon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Permet inhibir les dreceres
inhibit-shortcuts-app = L’aplicació { $appName } vol inhibir les dreceres del sistema
inhibit-shortcuts-unknown-app = Una aplicació vol inhibir les dreceres del sistema
inhibit-shortcuts-restore = Podeu restaurar les dreceres prement { $shortcut }
inhibit-shortcuts-deny = Denega
inhibit-shortcuts-allow = Permet

## Administrator authentication

polkit-title = Cal autenticar-se
polkit-administrator = Administrador
polkit-password = Contrasenya
polkit-cancel = Cancel·la
polkit-authenticate = Autentica
polkit-failed = No ha funcionat. Torneu-ho a provar.

## Unlocking encrypted drives

mount-hidden-volume = Volum ocult
mount-windows-system-volume = Volum del sistema Windows
mount-uses-keyfiles = Fa servir fitxers de clau
mount-keyfiles-use-app = Per desbloquejar un volum que fa servir fitxers de clau, feu servir la utilitat <i>{ $appName }</i>
mount-keyfiles-need-app = Necessiteu una utilitat externa com <i>Discs</i> per desbloquejar un volum que fa servir fitxers de clau
mount-pim-number = Número PIM
mount-pim-invalid = El PIM ha de ser un número o quedar buit
mount-password = Contrasenya
mount-remember-password = Recorda la contrasenya
mount-cancel = Cancel·la
mount-unlock = Desbloqueja
mount-open-app = Obre { $appName }
mount-wrong-password = No ha funcionat. Torneu-ho a provar.
mount-unlock-failed = No s’ha pogut desbloquejar el volum
mount-pim-unsupported = La versió d’udisks instal·lada no admet el paràmetre PIM

## Log out, power off and restart dialog

end-session-log-out-user = Tanca la sessió de { $userName }
end-session-log-out-title = Tanca la sessió
end-session-log-out-user-countdown = { $seconds ->
    [one] La sessió de { $userName } es tancarà automàticament d’aquí a { $seconds } segon
   *[other] La sessió de { $userName } es tancarà automàticament d’aquí a { $seconds } segons
}
end-session-log-out-countdown = { $seconds ->
    [one] La sessió es tancarà automàticament d’aquí a { $seconds } segon
   *[other] La sessió es tancarà automàticament d’aquí a { $seconds } segons
}
end-session-log-out-button = Tanca la sessió
end-session-power-off-title = Apaga
end-session-power-off-updates-title = Instal·la les actualitzacions i apaga
end-session-power-off-countdown = { $seconds ->
    [one] L’ordinador s’apagarà automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador s’apagarà automàticament d’aquí a { $seconds } segons
}
end-session-power-off-button = Apaga
end-session-restart-title = Reinicia
end-session-restart-updates-title = Instal·la les actualitzacions i reinicia
end-session-restart-countdown = { $seconds ->
    [one] L’ordinador es reiniciarà automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador es reiniciarà automàticament d’aquí a { $seconds } segons
}
end-session-restart-button = Reinicia
end-session-update-restart-title = Reinicia i instal·la les actualitzacions
end-session-update-restart-countdown = { $seconds ->
    [one] L’ordinador es reiniciarà i instal·larà les actualitzacions automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador es reiniciarà i instal·larà les actualitzacions automàticament d’aquí a { $seconds } segons
}
end-session-update-restart-button = Reinicia i instal·la
end-session-install-updates = Instal·la les actualitzacions pendents
end-session-install-version = Instal·la la versió { $version }
end-session-low-battery = Queda poca bateria: endolleu l’ordinador abans d’instal·lar les actualitzacions
end-session-busy-apps = Algunes aplicacions estan ocupades o tenen feina sense desar
end-session-other-users = Hi ha altres usuaris amb la sessió iniciada
end-session-cancel = Cancel·la
end-session-boot-options = Opcions d’arrencada
end-session-remote-user = { $userName } (remot)
end-session-console-user = { $userName } (consola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Cal autenticar-se
network-agent-wifi-rejected = La contrasenya desada de «{ $networkName }» no ha funcionat. Torneu-la a introduir.
network-agent-wifi-secrets = Cal una contrasenya o una clau de xifratge per accedir a la xarxa sense fil «{ $networkName }»
network-agent-wps-hint = També us podeu connectar prement el botó «WPS» de l’encaminador
network-agent-wired-title = Autenticació 802.1X amb cable
network-agent-dsl-title = Autenticació DSL
network-agent-pin-title = Cal el codi PIN
network-agent-pin-body = El dispositiu de banda ampla mòbil necessita el codi PIN
network-agent-vpn-title = Contrasenya de la VPN
network-agent-password-required = Cal una contrasenya per connectar-se a «{ $networkName }»
network-agent-connect = Connecta
network-agent-cancel = Cancel·la
network-agent-password = Contrasenya
network-agent-username = Nom d’usuari
network-agent-key = Clau
network-agent-private-key-password = Contrasenya de la clau privada
network-agent-identity = Identitat
network-agent-service = Servei
network-agent-network-name = Nom de la xarxa
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Llisqueu cap amunt
lock-clock-click-or-press = Feu clic o premeu una tecla

## Notification times

date-just-now = Ara mateix

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Finestres
ctrl-alt-tab-panel = Barra de tasques
ctrl-alt-tab-unlock = Finestra de desbloqueig

## System notifications

messages-system-source = Sistema
unsafe-mode-title = El sistema s’ha posat en mode no segur
unsafe-mode-body = Ara les aplicacions tenen accés sense restriccions
unsafe-mode-undo = Desfés
privileged-user-title = Heu iniciat la sessió com a usuari privilegiat
privileged-user-body = Per seguretat, és millor no fer servir una sessió d’usuari privilegiat. Si podeu, inicieu la sessió com a usuari normal.

## On-screen keyboard

osk-keyboard-settings = Configuració del teclat
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel ha de bloquejar la pantalla

## Notifications

messages-unknown-app = Aplicació desconeguda
messages-reply = Respon
messages-reply-placeholder = Escriviu una resposta
messages-reply-send = Envia

## Media player controls

mpris-unknown-artist = Artista desconegut
mpris-unknown-title = Títol desconegut

## Starting programs

spawn-failed = No s’ha pogut executar «{ $command }»:

## Text field context menu

entry-menu-copy = Copia
entry-menu-paste = Enganxa
entry-menu-show-text = Mostra el text
entry-menu-hide-text = Amaga el text
entry-caps-lock-on = Bloq Maj està activat

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Fes una captura de pantalla
title-bar-menu-hide = Amaga
title-bar-menu-restore = Restaura
title-bar-menu-maximize = Maximitza
title-bar-menu-move = Mou
title-bar-menu-resize = Canvia la mida
title-bar-menu-always-on-top = Sempre al davant
title-bar-menu-always-on-visible-workspace = Sempre a l’espai de treball visible
title-bar-menu-workspace-left = Mou a l’espai de treball de l’esquerra
title-bar-menu-workspace-right = Mou a l’espai de treball de la dreta
title-bar-menu-workspace-up = Mou a l’espai de treball de dalt
title-bar-menu-workspace-down = Mou a l’espai de treball de baix
title-bar-menu-monitor-up = Mou a la pantalla de dalt
title-bar-menu-monitor-down = Mou a la pantalla de baix
title-bar-menu-monitor-left = Mou a la pantalla de l’esquerra
title-bar-menu-monitor-right = Mou a la pantalla de la dreta
title-bar-menu-close = Tanca

## Screenshots and screen recording

screenshot-source = Captura de pantalla
screenshot-area = Selecció d’àrea
screenshot-screen = Selecció de pantalla
screenshot-window = Selecció de finestra
screenshot-take = Fes una captura de pantalla
screenshot-record = Enregistra la pantalla
screenshot-show-pointer = Mostra el punter
screenshot-capture = Captura
screenshot-close = Tanca
screenshot-screencasts-folder = Enregistraments de pantalla
screenshot-screencast-file = Enregistrament de pantalla { $date } { $time }
screenshot-screenshots-folder = Captures de pantalla
screenshot-file = Captura de pantalla { $timestamp }
screenshot-screencast-recorded = S’ha enregistrat la pantalla
screenshot-screencast-start-failed = No s’ha pogut començar l’enregistrament
screenshot-screencast-out-of-space = Ha fallat l’enregistrament: no queda espai al disc
screenshot-screencast-try-again = Ha fallat l’enregistrament. Torneu-ho a provar.
screenshot-screencast-failed = Ha fallat l’enregistrament
screenshot-screencast-view = Feu clic aquí per veure el vídeo
screenshot-show-in-rover = Mostra a Rover
screenshot-captured = S’ha fet la captura de pantalla
screenshot-captured-body = Podeu enganxar la imatge des del porta-retalls
