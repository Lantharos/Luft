## Quick settings tiles

auto-rotate-title = Automatické otáčanie
dark-style-title = Tmavý režim
do-not-disturb-title = Nerušiť
night-light-title = Nočné osvetlenie
airplane-mode-title = Režim v lietadle

## Power mode

power-profile-title = Režim napájania
power-profile-header = Režim napájania
power-profile-open-menu = Otvoriť ponuku režimov napájania
power-profile-settings = Nastavenia napájania
power-profile-performance = Výkon
power-profile-balanced = Vyvážený
power-profile-power-saver = Šetrenie energie
power-profile-custom = Vlastný

## Keep awake

caffeine-title = Nezaspávať
caffeine-open-menu = Otvoriť ponuku Nezaspávať
caffeine-until = Do { $time }
caffeine-until-turned-off = Kým sa nevypne
caffeine-30-minutes = 30 minút
caffeine-1-hour = 1 hodina
caffeine-2-hours = 2 hodiny
caffeine-inhibit-reason = Nezaspávať zapnuté v rýchlych nastaveniach

## Brightness

brightness-title = Jas
brightness-open-menu = Otvoriť ponuku jasu

## Keyboard backlight

backlight-title = Podsvietenie klávesnice
backlight-open-menu = Otvoriť ponuku jasu klávesnice
backlight-slider = Jas klávesnice
backlight-off = Vypnuté
backlight-low = Nízke
backlight-high = Vysoké

## Sound

volume-sound-settings = Nastavenia zvuku
volume-mute = Stlmiť
volume-unmute = Zrušiť stlmenie
volume-output-slider = Hlasitosť
volume-output-title = Výstup zvuku
volume-output-open-menu = Otvoriť ponuku výstupu zvuku
volume-input-slider = Mikrofón
volume-input-title = Vstup zvuku
volume-input-open-menu = Otvoriť ponuku vstupu zvuku

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvoriť ponuku Bluetooth
bluetooth-settings = Nastavenia Bluetooth
bluetooth-connect = Pripojiť
bluetooth-disconnect = Odpojiť
bluetooth-connect-device = Pripojiť { $deviceName }
bluetooth-disconnect-device = Odpojiť { $deviceName }
bluetooth-no-devices = Žiadne dostupné ani pripojené zariadenia
bluetooth-turn-on-hint = Ak chcete pripojiť zariadenia, zapnite Bluetooth
bluetooth-connected-count = { $count ->
    [one] Pripojené: { $count }
    [few] Pripojené: { $count }
    [many] Pripojené: { $count }
   *[other] Pripojené: { $count }
}

## Network menus in quick settings

network-menu-unknown-network = <neznáma>
network-menu-connect = Pripojiť
network-menu-disconnect = Odpojiť
network-menu-connect-to = Pripojiť k { $name }
network-menu-disconnect-from = Odpojiť { $name }
network-menu-turn-off = Vypnúť
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zabezpečená, sila signálu { $strength } %
   *[no] { $name }, nezabezpečená, sila signálu { $strength } %
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] Pripojené: { $count }
    [few] Pripojené: { $count }
    [many] Pripojené: { $count }
   *[other] Pripojené: { $count }
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvoriť ponuku VPN
network-menu-vpn-settings = Nastavenia VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvoriť ponuku Wi-Fi
network-menu-wifi-settings = Všetky siete
network-menu-wired = Káblové pripojenia
network-menu-wired-open-menu = Otvoriť ponuku káblových pripojení
network-menu-wired-settings = Nastavenia káblovej siete
network-menu-tethers = Tethering cez Bluetooth
network-menu-tethers-open-menu = Otvoriť ponuku tetheringu cez Bluetooth
network-menu-tether = Tethering
network-menu-tether-settings = Nastavenia Bluetooth
network-menu-mobile-connections = Mobilné pripojenia
network-menu-mobile-open-menu = Otvoriť ponuku mobilných pripojení
network-menu-mobile-settings = Nastavenia mobilného pripojenia
network-menu-mobile = Mobilná sieť
network-device-wired = Káblové pripojenie
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prihlásiť sa do siete
network-menu-failed-title = Pripojenie zlyhalo
network-menu-failed-body = Sieťové pripojenie sa nepodarilo aktivovať

## Location access dialog

location-dialog-title = Povoliť prístup k polohe
location-dialog-description = Aplikácia { $appName } chce získať prístup k vašej polohe
location-dialog-info = Prístup k polohe môžete kedykoľvek zmeniť v nastaveniach súkromia
location-dialog-deny = Zamietnuť prístup
location-dialog-grant = Povoliť prístup

## Thunderbolt notifications

thunderbolt-unknown-title = Neznáme zariadenie Thunderbolt
thunderbolt-unknown-body = Počas vašej neprítomnosti bolo pripojené nové zariadenie. Ak ho chcete začať používať, odpojte ho a znova pripojte.
thunderbolt-unauthorized-title = Neautorizované zariadenie Thunderbolt
thunderbolt-unauthorized-body = Bolo pripojené nové zariadenie, ktoré musí schváliť správca
thunderbolt-error-title = Chyba autorizácie zariadenia Thunderbolt
thunderbolt-error-body = Zariadenie Thunderbolt sa nepodarilo autorizovať: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zamietnuť
access-dialog-allow = Povoliť

## Display change confirmation

display-change-title = Ponechať tieto nastavenia?
display-change-countdown = { $seconds ->
    [one] Zmeny nastavení sa vrátia o { $seconds } sekundu
    [few] Zmeny nastavení sa vrátia o { $seconds } sekundy
    [many] Zmeny nastavení sa vrátia o { $seconds } sekundy
   *[other] Zmeny nastavení sa vrátia o { $seconds } sekúnd
}
display-change-revert = Vrátiť späť
display-change-keep = Ponechať zmeny

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ nereaguje
close-dialog-description = Môžete chvíľu počkať, či bude aplikácia pokračovať, alebo ju vynútene ukončiť
close-dialog-force-quit = Vynútiť ukončenie
close-dialog-wait = Počkať

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Zrkadliť
switch-monitor-join = Spojiť
switch-monitor-external-only = Iba externá
switch-monitor-built-in-only = Iba vstavaná

## Sign-in prompt

auth-prompt-password = Heslo
auth-prompt-username = Používateľské meno
auth-prompt-back = Späť
auth-prompt-submit = Odoslať
auth-prompt-wrong-password = Heslo nie je správne
auth-prompt-failed = Nepodarilo sa. Skúste to znova.
fingerprint-not-recognized = Odtlačok prsta nebol rozpoznaný

## Drive connected notification

autorun-connected = Pripojené: „{ $driveName }“
autorun-ready = Disk je pripravený na použitie
autorun-open-with = Otvoriť v aplikácii { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Pomalé klávesy zapnuté
kbd-a11y-slow-keys-off = Pomalé klávesy vypnuté
kbd-a11y-slow-keys-description = Práve ste podržali kláves Shift 8 sekúnd. Je to skratka funkcie Pomalé klávesy, ktorá mení správanie klávesnice.
kbd-a11y-sticky-keys-on = Lepiace klávesy zapnuté
kbd-a11y-sticky-keys-off = Lepiace klávesy vypnuté
kbd-a11y-sticky-keys-on-description = Práve ste päťkrát za sebou stlačili kláves Shift. Je to skratka funkcie Lepiace klávesy, ktorá mení správanie klávesnice.
kbd-a11y-sticky-keys-off-description = Práve ste stlačili dva klávesy naraz alebo päťkrát za sebou kláves Shift. Tým sa vypína funkcia Lepiace klávesy, ktorá mení správanie klávesnice.
kbd-a11y-leave-on = Nechať zapnuté
kbd-a11y-turn-on = Zapnúť
kbd-a11y-turn-off = Vypnúť
kbd-a11y-leave-off = Nechať vypnuté

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Výber zvukového zariadenia
audio-device-cancel = Zrušiť
audio-device-sound-settings = Nastavenia zvuku
audio-device-headphones = Slúchadlá
audio-device-headset = Náhlavná súprava
audio-device-microphone = Mikrofón

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Povoliť blokovanie skratiek
inhibit-shortcuts-app = Aplikácia { $appName } chce blokovať systémové skratky
inhibit-shortcuts-unknown-app = Aplikácia chce blokovať systémové skratky
inhibit-shortcuts-restore = Skratky obnovíte stlačením { $shortcut }
inhibit-shortcuts-deny = Zamietnuť
inhibit-shortcuts-allow = Povoliť

## Administrator authentication

polkit-title = Vyžaduje sa overenie
polkit-administrator = Správca
polkit-password = Heslo
polkit-cancel = Zrušiť
polkit-authenticate = Overiť
polkit-failed = Nepodarilo sa. Skúste to znova.

## Unlocking encrypted drives

mount-hidden-volume = Skrytý zväzok
mount-windows-system-volume = Systémový zväzok Windows
mount-uses-keyfiles = Používa súbory kľúčov
mount-keyfiles-use-app = Zväzok, ktorý používa súbory kľúčov, odomknete v aplikácii <i>{ $appName }</i>
mount-keyfiles-need-app = Na odomknutie zväzku, ktorý používa súbory kľúčov, potrebujete externú aplikáciu, napríklad <i>Disky</i>
mount-pim-number = Číslo PIM
mount-pim-invalid = PIM musí byť číslo alebo prázdne
mount-password = Heslo
mount-remember-password = Zapamätať heslo
mount-cancel = Zrušiť
mount-unlock = Odomknúť
mount-open-app = Otvoriť { $appName }
mount-wrong-password = Nepodarilo sa. Skúste to znova.
mount-unlock-failed = Zväzok sa nepodarilo odomknúť
mount-pim-unsupported = Nainštalovaná verzia udisks nepodporuje nastavenie PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odhlásiť používateľa { $userName }
end-session-log-out-title = Odhlásiť sa
end-session-log-out-user-countdown = { $seconds ->
    [one] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundu
    [few] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundy
    [many] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundy
   *[other] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekúnd
}
end-session-log-out-countdown = { $seconds ->
    [one] Automaticky budete odhlásení o { $seconds } sekundu
    [few] Automaticky budete odhlásení o { $seconds } sekundy
    [many] Automaticky budete odhlásení o { $seconds } sekundy
   *[other] Automaticky budete odhlásení o { $seconds } sekúnd
}
end-session-log-out-button = Odhlásiť sa
end-session-power-off-title = Vypnúť
end-session-power-off-updates-title = Nainštalovať aktualizácie a vypnúť
end-session-power-off-countdown = { $seconds ->
    [one] Systém sa automaticky vypne o { $seconds } sekundu
    [few] Systém sa automaticky vypne o { $seconds } sekundy
    [many] Systém sa automaticky vypne o { $seconds } sekundy
   *[other] Systém sa automaticky vypne o { $seconds } sekúnd
}
end-session-power-off-button = Vypnúť
end-session-restart-title = Reštartovať
end-session-restart-updates-title = Nainštalovať aktualizácie a reštartovať
end-session-restart-countdown = { $seconds ->
    [one] Systém sa automaticky reštartuje o { $seconds } sekundu
    [few] Systém sa automaticky reštartuje o { $seconds } sekundy
    [many] Systém sa automaticky reštartuje o { $seconds } sekundy
   *[other] Systém sa automaticky reštartuje o { $seconds } sekúnd
}
end-session-restart-button = Reštartovať
end-session-update-restart-title = Reštartovať a nainštalovať aktualizácie
end-session-update-restart-countdown = { $seconds ->
    [one] Systém sa o { $seconds } sekundu automaticky reštartuje a nainštaluje aktualizácie
    [few] Systém sa o { $seconds } sekundy automaticky reštartuje a nainštaluje aktualizácie
    [many] Systém sa o { $seconds } sekundy automaticky reštartuje a nainštaluje aktualizácie
   *[other] Systém sa o { $seconds } sekúnd automaticky reštartuje a nainštaluje aktualizácie
}
end-session-update-restart-button = Reštartovať a inštalovať
end-session-install-updates = Nainštalovať čakajúce aktualizácie softvéru
end-session-install-version = Nainštalovať verziu { $version }
end-session-low-battery = Batéria je slabá. Pred inštaláciou aktualizácií pripojte napájanie.
end-session-busy-apps = Niektoré aplikácie sú zaneprázdnené alebo obsahujú neuloženú prácu
end-session-other-users = Prihlásení sú aj ďalší používatelia
end-session-cancel = Zrušiť
end-session-boot-options = Možnosti spustenia
end-session-remote-user = { $userName } (vzdialene)
end-session-console-user = { $userName } (konzola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vyžaduje sa overenie
network-agent-wifi-rejected = Uložené heslo pre „{ $networkName }“ nefungovalo. Zadajte ho znova.
network-agent-wifi-secrets = Na prístup k bezdrôtovej sieti „{ $networkName }“ sú potrebné heslá alebo šifrovacie kľúče
network-agent-wps-hint = Môžete sa pripojiť aj stlačením tlačidla „WPS“ na smerovači
network-agent-wired-title = Overenie 802.1X pre káblovú sieť
network-agent-dsl-title = Overenie DSL
network-agent-pin-title = Vyžaduje sa kód PIN
network-agent-pin-body = Zariadenie mobilného pripojenia vyžaduje kód PIN
network-agent-vpn-title = Heslo VPN
network-agent-password-required = Na pripojenie k „{ $networkName }“ je potrebné heslo
network-agent-connect = Pripojiť
network-agent-cancel = Zrušiť
network-agent-password = Heslo
network-agent-username = Používateľské meno
network-agent-key = Kľúč
network-agent-private-key-password = Heslo súkromného kľúča
network-agent-identity = Identita
network-agent-service = Služba
network-agent-network-name = Názov siete
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Potiahnite nahor
lock-clock-click-or-press = Kliknite alebo stlačte kláves

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Okná
ctrl-alt-tab-panel = Panel úloh
ctrl-alt-tab-unlock = Okno odomknutia

## System notifications

messages-system-source = Systém
unsafe-mode-title = Systém bol prepnutý do nebezpečného režimu
unsafe-mode-body = Aplikácie majú teraz neobmedzený prístup
unsafe-mode-undo = Vrátiť späť
privileged-user-title = Prihlásenie ako privilegovaný používateľ
privileged-user-body = Z bezpečnostných dôvodov by ste nemali používať reláciu ako privilegovaný používateľ. Ak je to možné, prihláste sa ako bežný používateľ.

## On-screen keyboard

osk-keyboard-settings = Nastavenia klávesnice
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel musí zamknúť obrazovku

## Notifications

messages-unknown-app = Neznáma aplikácia
messages-reply = Odpovedať
messages-reply-placeholder = Napíšte odpoveď
messages-reply-send = Odoslať

## Media player controls

mpris-unknown-artist = Neznámy interpret
mpris-unknown-title = Neznámy názov

## Starting programs

spawn-failed = Spustenie „{ $command }“ zlyhalo:

## Text field context menu

entry-menu-copy = Kopírovať
entry-menu-paste = Prilepiť
entry-menu-show-text = Zobraziť text
entry-menu-hide-text = Skryť text
entry-caps-lock-on = Caps Lock je zapnutý

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Urobiť snímku obrazovky
title-bar-menu-hide = Skryť
title-bar-menu-restore = Obnoviť
title-bar-menu-maximize = Maximalizovať
title-bar-menu-move = Presunúť
title-bar-menu-resize = Zmeniť veľkosť
title-bar-menu-always-on-top = Vždy navrchu
title-bar-menu-always-on-visible-workspace = Vždy na viditeľnom pracovnom priestore
title-bar-menu-workspace-left = Presunúť na pracovný priestor vľavo
title-bar-menu-workspace-right = Presunúť na pracovný priestor vpravo
title-bar-menu-workspace-up = Presunúť na pracovný priestor hore
title-bar-menu-workspace-down = Presunúť na pracovný priestor dole
title-bar-menu-monitor-up = Presunúť na obrazovku hore
title-bar-menu-monitor-down = Presunúť na obrazovku dole
title-bar-menu-monitor-left = Presunúť na obrazovku vľavo
title-bar-menu-monitor-right = Presunúť na obrazovku vpravo
title-bar-menu-close = Zavrieť

## Screenshots and screen recording

screenshot-source = Zachytenie obrazovky
screenshot-area = Výber oblasti
screenshot-screen = Výber obrazovky
screenshot-window = Výber okna
screenshot-take = Urobiť snímku obrazovky
screenshot-record = Nahrávať obrazovku
screenshot-show-pointer = Zobraziť ukazovateľ
screenshot-capture = Zachytiť
screenshot-close = Zavrieť
screenshot-screencasts-folder = Záznamy obrazovky
screenshot-screencast-file = Záznam obrazovky { $date } { $time }
screenshot-screenshots-folder = Snímky obrazovky
screenshot-file = Snímka obrazovky { $timestamp }
screenshot-screencast-recorded = Záznam obrazovky bol uložený
screenshot-screencast-start-failed = Záznam obrazovky sa nepodarilo spustiť
screenshot-screencast-out-of-space = Záznam obrazovky zlyhal: na disku nie je dosť miesta
screenshot-screencast-try-again = Záznam obrazovky zlyhal. Skúste to znova.
screenshot-screencast-failed = Záznam obrazovky zlyhal
screenshot-screencast-view = Kliknutím zobrazíte video
screenshot-show-in-rover = Zobraziť v aplikácii Rover
screenshot-captured = Snímka obrazovky bola zachytená
screenshot-captured-body = Obrázok môžete prilepiť zo schránky
