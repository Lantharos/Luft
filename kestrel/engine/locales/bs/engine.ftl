## Quick settings tiles

auto-rotate-title = Automatska rotacija
dark-style-title = Tamni način rada
do-not-disturb-title = Ne uznemiravaj
night-light-title = Noćno svjetlo
airplane-mode-title = Način rada u avionu

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Otvori meni načina napajanja
power-profile-settings = Postavke napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Ušteda energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori meni Drži budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Držano budnim iz brzih postavki

## Brightness

brightness-title = Osvjetljenje
brightness-open-menu = Otvori meni osvjetljenja

## Keyboard backlight

backlight-title = Osvjetljenje tastature
backlight-open-menu = Otvori meni osvjetljenja tastature
backlight-slider = Osvjetljenje tastature
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Postavke zvuka
volume-mute = Isključi zvuk
volume-unmute = Uključi zvuk
volume-output-slider = Jačina zvuka
volume-output-title = Izlaz zvuka
volume-output-open-menu = Otvori meni izlaza zvuka
volume-input-slider = Mikrofon
volume-input-title = Ulaz zvuka
volume-input-open-menu = Otvori meni ulaza zvuka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvori meni Bluetootha
bluetooth-settings = Postavke Bluetootha
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži s uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu s uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da se povežete s uređajima
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznato>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži: { $name }
network-menu-disconnect-from = Prekini vezu: { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength }%
   *[no] { $name }, nije zaštićena, jačina signala { $strength }%
}
network-menu-hotspot = Pristupna tačka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori meni VPN-a
network-menu-vpn-settings = Postavke VPN-a
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori meni Wi-Fi mreže
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori meni žičnih veza
network-menu-wired-settings = Postavke žične mreže
network-menu-tethers = Bluetooth dijeljenje veze
network-menu-tethers-open-menu = Otvori meni Bluetooth dijeljenja veze
network-menu-tether = Dijeljenje veze
network-menu-tether-settings = Postavke Bluetootha
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori meni mobilnih veza
network-menu-mobile-settings = Postavke mobilnog interneta
network-menu-mobile = Mobilni internet
network-device-wired = Žična mreža
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspjelo
network-menu-failed-body = Aktiviranje mrežne veze nije uspjelo

## Location access dialog

location-dialog-title = Dozvoliti pristup lokaciji
location-dialog-description = Aplikacija { $appName } želi pristupiti vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada promijeniti u postavkama privatnosti
location-dialog-deny = Odbij pristup
location-dialog-grant = Dozvoli pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznat Thunderbolt uređaj
thunderbolt-unknown-body = Dok niste bili tu, otkriven je novi uređaj. Isključite ga i ponovo priključite da ga počnete koristiti.
thunderbolt-unauthorized-title = Neodobren Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji mora odobriti administrator
thunderbolt-error-title = Greška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije bilo moguće odobriti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odbij
access-dialog-allow = Dozvoli

## Display change confirmation

display-change-title = Zadržati ove postavke ekrana?
display-change-countdown = { $seconds ->
    [one] Promjene postavki se poništavaju za { $seconds } sekundu
    [few] Promjene postavki se poništavaju za { $seconds } sekunde
   *[other] Promjene postavki se poništavaju za { $seconds } sekundi
}
display-change-revert = Vrati postavke
display-change-keep = Zadrži promjene

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Aplikacija „{ $appName }“ ne reaguje
close-dialog-description = Možete malo pričekati da nastavi s radom ili prisilno zatvoriti aplikaciju
close-dialog-force-quit = Prisilno zatvori
close-dialog-wait = Čekaj

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Preslikaj
switch-monitor-join = Spoji ekrane
switch-monitor-external-only = Samo vanjski
switch-monitor-built-in-only = Samo ugrađeni

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Nazad
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Ta lozinka nije ispravna
auth-prompt-failed = Nije uspjelo. Pokušajte ponovo.
fingerprint-not-recognized = Otisak prsta nije prepoznat

## Drive connected notification

autorun-connected = „{ $driveName }“ je priključen
autorun-ready = Disk se sada može koristiti
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spore tipke su uključene
kbd-a11y-slow-keys-off = Spore tipke su isključene
kbd-a11y-slow-keys-description = Upravo ste držali tipku Shift 8 sekundi. To je prečica za Spore tipke, funkciju koja mijenja način rada tastature.
kbd-a11y-sticky-keys-on = Ljepljive tipke su uključene
kbd-a11y-sticky-keys-off = Ljepljive tipke su isključene
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli tipku Shift 5 puta zaredom. To je prečica za Ljepljive tipke, funkciju koja mijenja način rada tastature.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dvije tipke odjednom ili tipku Shift 5 puta zaredom. Time se isključuju Ljepljive tipke, funkcija koja mijenja način rada tastature.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Odaberite audio uređaj
audio-device-cancel = Otkaži
audio-device-sound-settings = Postavke zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice s mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dozvoliti blokiranje prečica
inhibit-shortcuts-app = Aplikacija { $appName } želi blokirati prečice
inhibit-shortcuts-unknown-app = Jedna aplikacija želi blokirati prečice
inhibit-shortcuts-restore = Prečice možete vratiti pritiskom na { $shortcut }
inhibit-shortcuts-deny = Odbij
inhibit-shortcuts-allow = Dozvoli

## Administrator authentication

polkit-title = Potrebna je autentifikacija
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Otkaži
polkit-authenticate = Potvrdi
polkit-failed = Nažalost, nije uspjelo. Pokušajte ponovo.

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen Windowsa
mount-uses-keyfiles = Koristi fajlove ključeva
mount-keyfiles-use-app = Da otključate volumen koji koristi fajlove ključeva, koristite alat <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi fajlove ključeva potreban je vanjski alat, kao što su <i>Diskovi</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora biti broj ili prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Otkaži
mount-unlock = Otključaj
mount-open-app = Otvori { $appName }
mount-wrong-password = Nažalost, nije uspjelo. Pokušajte ponovo.
mount-unlock-failed = Volumen nije moguće otključati
mount-pim-unsupported = Instalirana verzija udisksa ne podržava postavku PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odjava: { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } se automatski odjavljuje za { $seconds } sekundu
    [few] { $userName } se automatski odjavljuje za { $seconds } sekunde
   *[other] { $userName } se automatski odjavljuje za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatski ćete biti odjavljeni za { $seconds } sekundu
    [few] Automatski ćete biti odjavljeni za { $seconds } sekunde
   *[other] Automatski ćete biti odjavljeni za { $seconds } sekundi
}
end-session-log-out-button = Odjava
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sistem se automatski isključuje za { $seconds } sekundu
    [few] Sistem se automatski isključuje za { $seconds } sekunde
   *[other] Sistem se automatski isključuje za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sistem se automatski ponovo pokreće za { $seconds } sekundu
    [few] Sistem se automatski ponovo pokreće za { $seconds } sekunde
   *[other] Sistem se automatski ponovo pokreće za { $seconds } sekundi
}
end-session-restart-button = Ponovo pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekundu
    [few] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekunde
   *[other] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Ponovo pokreni i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-low-battery = Baterija je slaba: priključite punjač prije instaliranja ažuriranja
end-session-busy-apps = Neke aplikacije su zauzete ili imaju nesačuvan rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Otkaži
end-session-boot-options = Opcije pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je autentifikacija
network-agent-wifi-rejected = Sačuvana lozinka za „{ $networkName }“ nije ispravna. Unesite je ponovo.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifriranje
network-agent-wps-hint = Možete se povezati i pritiskom na dugme „WPS“ na ruteru
network-agent-wired-title = Žična 802.1X autentifikacija
network-agent-dsl-title = DSL autentifikacija
network-agent-pin-title = Potreban je PIN kôd
network-agent-pin-body = Uređaju za mobilni internet potreban je PIN kôd
network-agent-vpn-title = VPN lozinka
network-agent-password-required = Za povezivanje s „{ $networkName }“ potrebna je lozinka
network-agent-connect = Poveži
network-agent-cancel = Otkaži
network-agent-password = Lozinka
network-agent-username = Korisničko ime
network-agent-key = Ključ
network-agent-private-key-password = Lozinka privatnog ključa
network-agent-identity = Identitet
network-agent-service = Usluga
network-agent-network-name = Naziv mreže
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Prevucite prema gore
lock-clock-click-or-press = Kliknite ili pritisnite tipku

## Notification times

date-just-now = Upravo

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Prozori
ctrl-alt-tab-panel = Panel
ctrl-alt-tab-unlock = Prozor za otključavanje

## System notifications

messages-system-source = Sistem
unsafe-mode-title = Sistem je prebačen u nesigurni način rada
unsafe-mode-body = Aplikacije sada imaju neograničen pristup
unsafe-mode-undo = Poništi
privileged-user-title = Prijavljeni ste kao privilegovani korisnik
privileged-user-body = Iz sigurnosnih razloga sesiju ne bi trebalo pokretati kao privilegovani korisnik. Ako je moguće, prijavite se kao običan korisnik.

## On-screen keyboard

osk-keyboard-settings = Postavke tastature
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel mora zaključati ekran

## Notifications

messages-unknown-app = Nepoznata aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošalji

## Media player controls

mpris-unknown-artist = Nepoznat izvođač
mpris-unknown-title = Nepoznat naslov

## Starting programs

spawn-failed = Pokretanje naredbe „{ $command }“ nije uspjelo:

## Text field context menu

entry-menu-copy = Kopiraj
entry-menu-paste = Zalijepi
entry-menu-show-text = Prikaži tekst
entry-menu-hide-text = Sakrij tekst
entry-caps-lock-on = Caps Lock je uključen

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Napravi snimak ekrana
title-bar-menu-hide = Sakrij
title-bar-menu-restore = Vrati
title-bar-menu-maximize = Maksimiziraj
title-bar-menu-move = Premjesti
title-bar-menu-resize = Promijeni veličinu
title-bar-menu-always-on-top = Uvijek na vrhu
title-bar-menu-always-on-visible-workspace = Uvijek na vidljivom radnom prostoru
title-bar-menu-workspace-left = Premjesti na radni prostor lijevo
title-bar-menu-workspace-right = Premjesti na radni prostor desno
title-bar-menu-workspace-up = Premjesti na radni prostor gore
title-bar-menu-workspace-down = Premjesti na radni prostor dolje
title-bar-menu-monitor-up = Premjesti na ekran gore
title-bar-menu-monitor-down = Premjesti na ekran dolje
title-bar-menu-monitor-left = Premjesti na ekran lijevo
title-bar-menu-monitor-right = Premjesti na ekran desno
title-bar-menu-close = Zatvori

## Screenshots and screen recording

screenshot-source = Snimanje ekrana
screenshot-area = Odabir područja
screenshot-screen = Odabir ekrana
screenshot-window = Odabir prozora
screenshot-take = Napravi snimak ekrana
screenshot-record = Snimaj ekran
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Videosnimci ekrana
screenshot-screencast-file = Videosnimak ekrana { $date } { $time }
screenshot-screenshots-folder = Snimci ekrana
screenshot-file = Snimak ekrana { $timestamp }
screenshot-screencast-recorded = Videosnimak ekrana je snimljen
screenshot-screencast-start-failed = Snimanje ekrana nije pokrenuto
screenshot-screencast-out-of-space = Snimanje ekrana nije uspjelo: nema prostora na disku
screenshot-screencast-try-again = Snimanje ekrana nije uspjelo. Pokušajte ponovo.
screenshot-screencast-failed = Snimanje ekrana nije uspjelo
screenshot-screencast-view = Kliknite ovdje da pogledate video
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimak ekrana je napravljen
screenshot-captured-body = Sliku možete zalijepiti iz međuspremnika

## Rain

rain-title = Kiša
rain-open-menu = Otvori meni kiše
rain-drizzle = Rosulja
rain-rain = Kiša
rain-storm = Oluja
rain-show = Prikaži na radnoj površini
rain-sound = Zvuk
rain-volume = Jačina kiše
rain-settings = Postavke kiše
