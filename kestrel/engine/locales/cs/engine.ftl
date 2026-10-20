## Quick settings tiles

auto-rotate-title = Automatické otočení
dark-style-title = Tmavý režim
do-not-disturb-title = Nerušit
night-light-title = Noční světlo
airplane-mode-title = Režim v letadle

## Power mode

power-profile-title = Režim napájení
power-profile-header = Režim napájení
power-profile-open-menu = Otevřít nabídku režimů napájení
power-profile-settings = Nastavení napájení
power-profile-performance = Výkon
power-profile-balanced = Vyvážený
power-profile-power-saver = Úspora energie
power-profile-custom = Vlastní

## Keep awake

caffeine-title = Nevypínat obrazovku
caffeine-open-menu = Otevřít nabídku Nevypínat obrazovku
caffeine-until = Do { $time }
caffeine-until-turned-off = Do vypnutí
caffeine-30-minutes = 30 minut
caffeine-1-hour = 1 hodinu
caffeine-2-hours = 2 hodiny
caffeine-inhibit-reason = Obrazovku nechává zapnutou rychlé nastavení

## Brightness

brightness-title = Jas
brightness-open-menu = Otevřít nabídku jasu

## Keyboard backlight

backlight-title = Podsvícení klávesnice
backlight-open-menu = Otevřít nabídku jasu klávesnice
backlight-slider = Jas klávesnice
backlight-off = Vypnuto
backlight-low = Nízké
backlight-high = Vysoké

## Sound

volume-sound-settings = Nastavení zvuku
volume-mute = Ztlumit
volume-unmute = Zrušit ztlumení
volume-output-slider = Hlasitost
volume-output-title = Výstup zvuku
volume-output-open-menu = Otevřít nabídku výstupu zvuku
volume-input-slider = Mikrofon
volume-input-title = Vstup zvuku
volume-input-open-menu = Otevřít nabídku vstupu zvuku

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otevřít nabídku Bluetooth
bluetooth-settings = Nastavení Bluetooth
bluetooth-connect = Připojit
bluetooth-disconnect = Odpojit
bluetooth-connect-device = Připojit k { $deviceName }
bluetooth-disconnect-device = Odpojit { $deviceName }
bluetooth-no-devices = Žádná dostupná ani připojená zařízení
bluetooth-turn-on-hint = Pro připojení zařízení zapněte Bluetooth
bluetooth-connected-count = { $count ->
    [one] { $count } připojené
    [few] { $count } připojená
    [many] { $count } připojeného
   *[other] { $count } připojených
}

## Network menus in quick settings

network-menu-unknown-network = <neznámá>
network-menu-connect = Připojit
network-menu-disconnect = Odpojit
network-menu-connect-to = Připojit k { $name }
network-menu-disconnect-from = Odpojit { $name }
network-menu-turn-off = Vypnout
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zabezpečená, síla signálu { $strength } %
   *[no] { $name }, nezabezpečená, síla signálu { $strength } %
}
network-menu-hotspot = Hotspot { $name }
network-menu-connected-count = { $count ->
    [one] { $count } připojené
    [few] { $count } připojená
    [many] { $count } připojeného
   *[other] { $count } připojených
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otevřít nabídku VPN
network-menu-vpn-settings = Nastavení VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otevřít nabídku Wi-Fi
network-menu-wifi-settings = Všechny sítě
network-menu-wired = Kabelová připojení
network-menu-wired-open-menu = Otevřít nabídku kabelových připojení
network-menu-wired-settings = Nastavení kabelové sítě
network-menu-tethers = Sdílení přes Bluetooth
network-menu-tethers-open-menu = Otevřít nabídku sdílení přes Bluetooth
network-menu-tether = Sdílení připojení
network-menu-tether-settings = Nastavení Bluetooth
network-menu-mobile-connections = Mobilní připojení
network-menu-mobile-open-menu = Otevřít nabídku mobilních připojení
network-menu-mobile-settings = Nastavení mobilních dat
network-menu-mobile = Mobilní data
network-menu-sign-in = Přihlásit se k síti
network-menu-failed-title = Připojení se nezdařilo
network-menu-failed-body = Síťové připojení se nepodařilo aktivovat

## Location access dialog

location-dialog-title = Povolit přístup k poloze
location-dialog-description = Aplikace { $appName } chce získat přístup k vaší poloze
location-dialog-info = Přístup k poloze můžete kdykoli změnit v nastavení soukromí
location-dialog-deny = Odepřít přístup
location-dialog-grant = Povolit přístup

## Thunderbolt notifications

thunderbolt-unknown-title = Neznámé zařízení Thunderbolt
thunderbolt-unknown-body = Během vaší nepřítomnosti bylo připojeno nové zařízení. Začnete ho používat, když ho odpojíte a znovu připojíte.
thunderbolt-unauthorized-title = Neautorizované zařízení Thunderbolt
thunderbolt-unauthorized-body = Bylo připojeno nové zařízení, které musí schválit správce
thunderbolt-error-title = Chyba autorizace zařízení Thunderbolt
thunderbolt-error-body = Zařízení Thunderbolt se nepodařilo autorizovat: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odepřít
access-dialog-allow = Povolit

## Display change confirmation

display-change-title = Ponechat nastavení displeje?
display-change-countdown = { $seconds ->
    [one] Změny nastavení se vrátí za { $seconds } sekundu
    [few] Změny nastavení se vrátí za { $seconds } sekundy
    [many] Změny nastavení se vrátí za { $seconds } sekundy
   *[other] Změny nastavení se vrátí za { $seconds } sekund
}
display-change-revert = Vrátit zpět
display-change-keep = Ponechat změny

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Aplikace { $appName } neodpovídá
close-dialog-description = Můžete chvíli počkat, jestli bude aplikace pokračovat, nebo ji vynuceně ukončit
close-dialog-force-quit = Vynutit ukončení
close-dialog-wait = Počkat

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Zrcadlit
switch-monitor-join = Rozšířit
switch-monitor-external-only = Jen externí
switch-monitor-built-in-only = Jen vestavěný

## Sign-in prompt

auth-prompt-password = Heslo
auth-prompt-username = Uživatelské jméno
auth-prompt-back = Zpět
auth-prompt-submit = Odeslat
auth-prompt-wrong-password = Heslo není správné
auth-prompt-failed = Nepodařilo se. Zkuste to znovu.
fingerprint-not-recognized = Otisk prstu nebyl rozpoznán

## Drive connected notification

autorun-connected = Připojeno „{ $driveName }“
autorun-ready = Disk je připravený k použití
autorun-open-with = Otevřít v aplikaci { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Pomalé klávesy zapnuty
kbd-a11y-slow-keys-off = Pomalé klávesy vypnuty
kbd-a11y-slow-keys-description = Právě jste 8 sekund drželi klávesu Shift. To je zkratka funkce Pomalé klávesy, která mění chování klávesnice.
kbd-a11y-sticky-keys-on = Lepicí klávesy zapnuty
kbd-a11y-sticky-keys-off = Lepicí klávesy vypnuty
kbd-a11y-sticky-keys-on-description = Právě jste 5krát za sebou stiskli klávesu Shift. To je zkratka funkce Lepicí klávesy, která mění chování klávesnice.
kbd-a11y-sticky-keys-off-description = Právě jste stiskli dvě klávesy najednou nebo 5krát za sebou klávesu Shift. Tím se vypíná funkce Lepicí klávesy, která mění chování klávesnice.
kbd-a11y-leave-on = Nechat zapnuté
kbd-a11y-turn-on = Zapnout
kbd-a11y-turn-off = Vypnout
kbd-a11y-leave-off = Nechat vypnuté

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Vyberte zvukové zařízení
audio-device-cancel = Zrušit
audio-device-sound-settings = Nastavení zvuku
audio-device-headphones = Sluchátka
audio-device-headset = Náhlavní souprava
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Povolit blokování zkratek
inhibit-shortcuts-app = Aplikace { $appName } chce blokovat systémové zkratky
inhibit-shortcuts-unknown-app = Aplikace chce blokovat systémové zkratky
inhibit-shortcuts-restore = Zkratky obnovíte stisknutím { $shortcut }
inhibit-shortcuts-deny = Odepřít
inhibit-shortcuts-allow = Povolit

## Administrator authentication

polkit-title = Vyžaduje se ověření
polkit-administrator = Správce
polkit-password = Heslo
polkit-cancel = Zrušit
polkit-authenticate = Ověřit
polkit-failed = Nepodařilo se. Zkuste to znovu.

## Unlocking encrypted drives

mount-hidden-volume = Skrytý svazek
mount-windows-system-volume = Systémový svazek Windows
mount-uses-keyfiles = Používá soubory klíčů
mount-keyfiles-use-app = Svazek, který používá soubory klíčů, odemknete v nástroji <i>{ $appName }</i>
mount-keyfiles-need-app = K odemknutí svazku, který používá soubory klíčů, potřebujete externí nástroj, například <i>Disky</i>
mount-pim-number = Číslo PIM
mount-pim-invalid = PIM musí být číslo, nebo zůstat prázdné
mount-password = Heslo
mount-remember-password = Zapamatovat heslo
mount-cancel = Zrušit
mount-unlock = Odemknout
mount-open-app = Otevřít { $appName }
mount-wrong-password = Nepodařilo se. Zkuste to znovu.
mount-unlock-failed = Svazek se nepodařilo odemknout
mount-pim-unsupported = Nainstalovaná verze udisks nepodporuje nastavení PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odhlásit uživatele { $userName }
end-session-log-out-title = Odhlásit se
end-session-log-out-user-countdown = { $seconds ->
    [one] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundu
    [few] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundy
    [many] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundy
   *[other] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatické odhlášení za { $seconds } sekundu
    [few] Automatické odhlášení za { $seconds } sekundy
    [many] Automatické odhlášení za { $seconds } sekundy
   *[other] Automatické odhlášení za { $seconds } sekund
}
end-session-log-out-button = Odhlásit se
end-session-power-off-title = Vypnout
end-session-power-off-updates-title = Nainstalovat aktualizace a vypnout
end-session-power-off-countdown = { $seconds ->
    [one] Počítač se automaticky vypne za { $seconds } sekundu
    [few] Počítač se automaticky vypne za { $seconds } sekundy
    [many] Počítač se automaticky vypne za { $seconds } sekundy
   *[other] Počítač se automaticky vypne za { $seconds } sekund
}
end-session-power-off-button = Vypnout
end-session-restart-title = Restartovat
end-session-restart-updates-title = Nainstalovat aktualizace a restartovat
end-session-restart-countdown = { $seconds ->
    [one] Počítač se automaticky restartuje za { $seconds } sekundu
    [few] Počítač se automaticky restartuje za { $seconds } sekundy
    [many] Počítač se automaticky restartuje za { $seconds } sekundy
   *[other] Počítač se automaticky restartuje za { $seconds } sekund
}
end-session-restart-button = Restartovat
end-session-update-restart-title = Restartovat a nainstalovat aktualizace
end-session-update-restart-countdown = { $seconds ->
    [one] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundu
    [few] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundy
    [many] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundy
   *[other] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekund
}
end-session-update-restart-button = Restartovat a nainstalovat
end-session-install-updates = Nainstalovat čekající aktualizace
end-session-install-version = Nainstalovat verzi { $version }
end-session-low-battery = Baterie je slabá. Před instalací aktualizací připojte napájení.
end-session-busy-apps = Některé aplikace pracují nebo mají neuložená data
end-session-other-users = Jsou přihlášeni i další uživatelé
end-session-cancel = Zrušit
end-session-boot-options = Možnosti spuštění
end-session-remote-user = { $userName } (vzdáleně)
end-session-console-user = { $userName } (konzole)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Vyžaduje se ověření
network-agent-wifi-rejected = Uložené heslo k síti „{ $networkName }“ nefungovalo. Zadejte ho znovu.
network-agent-wifi-secrets = Pro přístup k bezdrátové síti „{ $networkName }“ je potřeba heslo nebo šifrovací klíč
network-agent-wps-hint = Můžete se také připojit stisknutím tlačítka „WPS“ na routeru
network-agent-wired-title = Ověření 802.1X v kabelové síti
network-agent-dsl-title = Ověření DSL
network-agent-pin-title = Vyžaduje se kód PIN
network-agent-pin-body = Zařízení pro mobilní data potřebuje kód PIN
network-agent-vpn-title = Heslo VPN
network-agent-password-required = K připojení k síti „{ $networkName }“ je potřeba heslo
network-agent-connect = Připojit
network-agent-cancel = Zrušit
network-agent-password = Heslo
network-agent-username = Uživatelské jméno
network-agent-key = Klíč
network-agent-private-key-password = Heslo soukromého klíče
network-agent-identity = Identita
network-agent-service = Služba
network-agent-network-name = Název sítě
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Přejeďte nahoru
lock-clock-click-or-press = Klikněte nebo stiskněte klávesu

## Notification times

date-just-now = Právě teď

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Okna
ctrl-alt-tab-panel = Hlavní panel
ctrl-alt-tab-unlock = Odemknutí

## System notifications

messages-system-source = Systém
unsafe-mode-title = Systém byl přepnut do nebezpečného režimu
unsafe-mode-body = Aplikace mají teď neomezený přístup
unsafe-mode-undo = Vrátit zpět
privileged-user-title = Jste přihlášeni jako privilegovaný uživatel
privileged-user-body = Z bezpečnostních důvodů nepoužívejte relaci privilegovaného uživatele. Pokud můžete, přihlaste se jako běžný uživatel.

## On-screen keyboard

osk-keyboard-settings = Nastavení klávesnice
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel musí zamknout obrazovku

## Notifications

messages-unknown-app = Neznámá aplikace
messages-reply = Odpovědět
messages-reply-placeholder = Napište odpověď
messages-reply-send = Odeslat

## Media player controls

mpris-unknown-artist = Neznámý interpret
mpris-unknown-title = Neznámý název

## Starting programs

spawn-failed = Spuštění „{ $command }“ se nezdařilo:

## Text field context menu

entry-menu-copy = Kopírovat
entry-menu-paste = Vložit
entry-menu-show-text = Zobrazit text
entry-menu-hide-text = Skrýt text
entry-caps-lock-on = Caps Lock je zapnutý

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Pořídit snímek obrazovky
title-bar-menu-hide = Skrýt
title-bar-menu-restore = Obnovit
title-bar-menu-maximize = Maximalizovat
title-bar-menu-move = Přesunout
title-bar-menu-resize = Změnit velikost
title-bar-menu-always-on-top = Vždy navrchu
title-bar-menu-always-on-visible-workspace = Vždy na viditelném pracovním prostoru
title-bar-menu-workspace-left = Přesunout na pracovní prostor vlevo
title-bar-menu-workspace-right = Přesunout na pracovní prostor vpravo
title-bar-menu-workspace-up = Přesunout na pracovní prostor nahoře
title-bar-menu-workspace-down = Přesunout na pracovní prostor dole
title-bar-menu-monitor-up = Přesunout na displej nahoře
title-bar-menu-monitor-down = Přesunout na displej dole
title-bar-menu-monitor-left = Přesunout na displej vlevo
title-bar-menu-monitor-right = Přesunout na displej vpravo
title-bar-menu-close = Zavřít

## Screenshots and screen recording

screenshot-source = Zachycení obrazovky
screenshot-area = Výběr oblasti
screenshot-screen = Výběr obrazovky
screenshot-window = Výběr okna
screenshot-take = Pořídit snímek obrazovky
screenshot-record = Nahrát obrazovku
screenshot-show-pointer = Zobrazit ukazatel
screenshot-capture = Zachytit
screenshot-close = Zavřít
screenshot-screencasts-folder = Záznamy obrazovky
screenshot-screencast-file = Záznam obrazovky { $date } { $time }
screenshot-screenshots-folder = Snímky obrazovky
screenshot-file = Snímek obrazovky { $timestamp }
screenshot-screencast-recorded = Záznam obrazovky uložen
screenshot-screencast-start-failed = Záznam obrazovky se nepodařilo spustit
screenshot-screencast-out-of-space = Záznam obrazovky se nezdařil: na disku není místo
screenshot-screencast-try-again = Záznam obrazovky se nezdařil, zkuste to znovu
screenshot-screencast-failed = Záznam obrazovky se nezdařil
screenshot-screencast-view = Kliknutím zobrazíte video
screenshot-show-in-rover = Zobrazit v aplikaci Rover
screenshot-captured = Snímek obrazovky pořízen
screenshot-captured-body = Obrázek můžete vložit ze schránky
