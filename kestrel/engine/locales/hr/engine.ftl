## Quick settings tiles

auto-rotate-title = Automatsko okretanje
dark-style-title = Tamni način
do-not-disturb-title = Ne ometaj
night-light-title = Noćno svjetlo
airplane-mode-title = Način rada u zrakoplovu

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Otvori izbornik načina napajanja
power-profile-settings = Postavke napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Štednja energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori izbornik Drži budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Budno iz brzih postavki

## Brightness

brightness-title = Svjetlina
brightness-open-menu = Otvori izbornik svjetline

## Keyboard backlight

backlight-title = Osvjetljenje tipkovnice
backlight-open-menu = Otvori izbornik svjetline tipkovnice
backlight-slider = Svjetlina tipkovnice
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Postavke zvuka
volume-mute = Isključi zvuk
volume-unmute = Uključi zvuk
volume-output-slider = Glasnoća
volume-output-title = Izlaz zvuka
volume-output-open-menu = Otvori izbornik izlaza zvuka
volume-input-slider = Mikrofon
volume-input-title = Ulaz zvuka
volume-input-open-menu = Otvori izbornik ulaza zvuka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Otvori izbornik Bluetootha
bluetooth-settings = Postavke Bluetootha
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži s uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu s uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da biste se povezali s uređajima
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznato>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži s { $name }
network-menu-disconnect-from = Prekini vezu s { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength } %
   *[no] { $name }, nije zaštićena, jačina signala { $strength } %
}
network-menu-hotspot = Pristupna točka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori izbornik VPN-a
network-menu-vpn-settings = Postavke VPN-a
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori izbornik Wi-Fi mreže
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori izbornik žičnih veza
network-menu-wired-settings = Postavke žične mreže
network-menu-tethers = Dijeljenje veze putem Bluetootha
network-menu-tethers-open-menu = Otvori izbornik dijeljenja veze putem Bluetootha
network-menu-tether = Dijeljenje veze
network-menu-tether-settings = Postavke Bluetootha
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori izbornik mobilnih veza
network-menu-mobile-settings = Postavke mobilne mreže
network-menu-mobile = Mobilna mreža
network-device-wired = Žična mreža
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspjelo
network-menu-failed-body = Aktiviranje mrežne veze nije uspjelo

## Location access dialog

location-dialog-title = Dopusti pristup lokaciji
location-dialog-description = Aplikacija { $appName } želi pristupiti vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada promijeniti u postavkama privatnosti
location-dialog-deny = Odbij pristup
location-dialog-grant = Dopusti pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznati Thunderbolt uređaj
thunderbolt-unknown-body = Dok niste bili tu, otkriven je novi uređaj. Odspojite ga i ponovno spojite da biste ga počeli koristiti.
thunderbolt-unauthorized-title = Neovlašteni Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji mora odobriti administrator
thunderbolt-error-title = Pogreška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije moguće odobriti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Odbij
access-dialog-allow = Dopusti

## Display change confirmation

display-change-title = Zadržati ove postavke zaslona?
display-change-countdown = { $seconds ->
    [one] Promjene će se poništiti za { $seconds } sekundu
    [few] Promjene će se poništiti za { $seconds } sekunde
   *[other] Promjene će se poništiti za { $seconds } sekundi
}
display-change-revert = Vrati postavke
display-change-keep = Zadrži promjene

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ ne reagira
close-dialog-description = Možete malo pričekati da nastavi s radom ili prisilno zatvoriti aplikaciju
close-dialog-force-quit = Prisilno zatvori
close-dialog-wait = Pričekaj

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Zrcaljenje
switch-monitor-join = Proširenje
switch-monitor-external-only = Samo vanjski
switch-monitor-built-in-only = Samo ugrađeni

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Natrag
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Ta lozinka nije ispravna
auth-prompt-failed = Nije uspjelo. Pokušajte ponovno.
fingerprint-not-recognized = Otisak prsta nije prepoznat

## Drive connected notification

autorun-connected = „{ $driveName }“ je spojen
autorun-ready = Disk se sada može koristiti
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spore tipke su uključene
kbd-a11y-slow-keys-off = Spore tipke su isključene
kbd-a11y-slow-keys-description = Upravo ste držali tipku Shift 8 sekundi. To je prečac za Spore tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-sticky-keys-on = Ljepljive tipke su uključene
kbd-a11y-sticky-keys-off = Ljepljive tipke su isključene
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli tipku Shift 5 puta zaredom. To je prečac za Ljepljive tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dvije tipke odjednom ili tipku Shift 5 puta zaredom. Time se isključuju Ljepljive tipke, koje mijenjaju način rada tipkovnice.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Odaberite audiouređaj
audio-device-cancel = Odustani
audio-device-sound-settings = Postavke zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice s mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dopusti blokiranje prečaca
inhibit-shortcuts-app = Aplikacija { $appName } želi blokirati prečace
inhibit-shortcuts-unknown-app = Aplikacija želi blokirati prečace
inhibit-shortcuts-restore = Prečace možete vratiti pritiskom na { $shortcut }
inhibit-shortcuts-deny = Odbij
inhibit-shortcuts-allow = Dopusti

## Administrator authentication

polkit-title = Potrebna je provjera autentičnosti
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Odustani
polkit-authenticate = Potvrdi
polkit-failed = Nažalost, to nije uspjelo. Pokušajte ponovno.

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen sustava Windows
mount-uses-keyfiles = Koristi datoteke s ključem
mount-keyfiles-use-app = Za otključavanje volumena koji koristi datoteke s ključem upotrijebite alat <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi datoteke s ključem potreban je vanjski alat poput <i>Diskova</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora biti broj ili prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Odustani
mount-unlock = Otključaj
mount-open-app = Otvori { $appName }
mount-wrong-password = Nažalost, to nije uspjelo. Pokušajte ponovno.
mount-unlock-failed = Volumen nije moguće otključati
mount-pim-unsupported = Instalirana verzija udisksa ne podržava postavku PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odjava korisnika { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekundu
    [few] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekunde
   *[other] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatski ćete se odjaviti za { $seconds } sekundu
    [few] Automatski ćete se odjaviti za { $seconds } sekunde
   *[other] Automatski ćete se odjaviti za { $seconds } sekundi
}
end-session-log-out-button = Odjava
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sustav će se automatski isključiti za { $seconds } sekundu
    [few] Sustav će se automatski isključiti za { $seconds } sekunde
   *[other] Sustav će se automatski isključiti za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sustav će se automatski ponovno pokrenuti za { $seconds } sekundu
    [few] Sustav će se automatski ponovno pokrenuti za { $seconds } sekunde
   *[other] Sustav će se automatski ponovno pokrenuti za { $seconds } sekundi
}
end-session-restart-button = Ponovno pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekundu
    [few] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekunde
   *[other] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Pokreni ponovno i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-low-battery = Baterija je slaba: priključite napajanje prije instaliranja ažuriranja
end-session-busy-apps = Neke su aplikacije zauzete ili imaju nespremljen rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Odustani
end-session-boot-options = Mogućnosti pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je provjera autentičnosti
network-agent-wifi-rejected = Spremljena lozinka za „{ $networkName }“ nije uspjela. Unesite je ponovno.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifriranje
network-agent-wps-hint = Možete se povezati i pritiskom na tipku „WPS“ na usmjerivaču
network-agent-wired-title = Provjera autentičnosti 802.1X za žičnu mrežu
network-agent-dsl-title = Provjera autentičnosti za DSL
network-agent-pin-title = Potreban je PIN
network-agent-pin-body = Uređaj za mobilni širokopojasni pristup traži PIN
network-agent-vpn-title = Lozinka za VPN
network-agent-password-required = Za povezivanje s mrežom „{ $networkName }“ potrebna je lozinka
network-agent-connect = Poveži
network-agent-cancel = Odustani
network-agent-password = Lozinka
network-agent-username = Korisničko ime
network-agent-key = Ključ
network-agent-private-key-password = Lozinka privatnog ključa
network-agent-identity = Identitet
network-agent-service = Usluga
network-agent-network-name = Naziv mreže
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Prijeđite prstom prema gore
lock-clock-click-or-press = Kliknite ili pritisnite tipku

## Notification times

date-just-now = Upravo sada

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Prozori
ctrl-alt-tab-panel = Programska traka
ctrl-alt-tab-unlock = Prozor za otključavanje

## System notifications

messages-system-source = Sustav
unsafe-mode-title = Sustav je prebačen u nesigurni način rada
unsafe-mode-body = Aplikacije sada imaju neograničen pristup
unsafe-mode-undo = Poništi
privileged-user-title = Prijavljeni ste kao povlašteni korisnik
privileged-user-body = Iz sigurnosnih razloga izbjegavajte rad u sesiji povlaštenog korisnika. Ako je moguće, prijavite se kao običan korisnik.

## On-screen keyboard

osk-keyboard-settings = Postavke tipkovnice
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel mora zaključati zaslon

## Notifications

messages-unknown-app = Nepoznata aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošalji

## Media player controls

mpris-unknown-artist = Nepoznati izvođač
mpris-unknown-title = Nepoznat naslov

## Starting programs

spawn-failed = Izvršavanje naredbe „{ $command }“ nije uspjelo:

## Text field context menu

entry-menu-copy = Kopiraj
entry-menu-paste = Zalijepi
entry-menu-show-text = Prikaži tekst
entry-menu-hide-text = Sakrij tekst
entry-caps-lock-on = Caps Lock je uključen

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Snimi zaslon
title-bar-menu-hide = Sakrij
title-bar-menu-restore = Vrati
title-bar-menu-maximize = Maksimiziraj
title-bar-menu-move = Premjesti
title-bar-menu-resize = Promijeni veličinu
title-bar-menu-always-on-top = Uvijek na vrhu
title-bar-menu-always-on-visible-workspace = Uvijek na vidljivom radnom prostoru
title-bar-menu-workspace-left = Premjesti na radni prostor lijevo
title-bar-menu-workspace-right = Premjesti na radni prostor desno
title-bar-menu-workspace-up = Premjesti na radni prostor iznad
title-bar-menu-workspace-down = Premjesti na radni prostor ispod
title-bar-menu-monitor-up = Premjesti na zaslon iznad
title-bar-menu-monitor-down = Premjesti na zaslon ispod
title-bar-menu-monitor-left = Premjesti na zaslon lijevo
title-bar-menu-monitor-right = Premjesti na zaslon desno
title-bar-menu-close = Zatvori

## Screenshots and screen recording

screenshot-source = Snimanje zaslona
screenshot-area = Odabir područja
screenshot-screen = Odabir zaslona
screenshot-window = Odabir prozora
screenshot-take = Snimi zaslon
screenshot-record = Snimaj zaslon
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Videosnimke zaslona
screenshot-screencast-file = Videosnimka zaslona { $date } { $time }
screenshot-screenshots-folder = Snimke zaslona
screenshot-file = Snimka zaslona { $timestamp }
screenshot-screencast-recorded = Videosnimka zaslona je snimljena
screenshot-screencast-start-failed = Snimanje zaslona nije se moglo pokrenuti
screenshot-screencast-out-of-space = Snimanje zaslona nije uspjelo: nema dovoljno prostora na disku
screenshot-screencast-try-again = Snimanje zaslona nije uspjelo, pokušajte ponovno
screenshot-screencast-failed = Snimanje zaslona nije uspjelo
screenshot-screencast-view = Kliknite ovdje za prikaz videozapisa
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimka zaslona je snimljena
screenshot-captured-body = Sliku možete zalijepiti iz međuspremnika
