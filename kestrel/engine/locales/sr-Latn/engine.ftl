## Quick settings tiles

auto-rotate-title = Automatska rotacija
dark-style-title = Tamni režim
do-not-disturb-title = Ne uznemiravaj
night-light-title = Noćno svetlo
airplane-mode-title = Režim rada u avionu

## Power mode

power-profile-title = Režim napajanja
power-profile-header = Režim napajanja
power-profile-open-menu = Otvori meni režima napajanja
power-profile-settings = Podešavanja napajanja
power-profile-performance = Performanse
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Ušteda energije
power-profile-custom = Prilagođeno

## Keep awake

caffeine-title = Drži budnim
caffeine-open-menu = Otvori meni za držanje budnim
caffeine-until = Do { $time }
caffeine-until-turned-off = Dok se ne isključi
caffeine-30-minutes = 30 minuta
caffeine-1-hour = 1 sat
caffeine-2-hours = 2 sata
caffeine-inhibit-reason = Drži budnim iz brzih podešavanja

## Brightness

brightness-title = Osvetljenost
brightness-open-menu = Otvori meni osvetljenosti

## Keyboard backlight

backlight-title = Osvetljenje tastature
backlight-open-menu = Otvori meni osvetljenja tastature
backlight-slider = Osvetljenje tastature
backlight-off = Isključeno
backlight-low = Slabo
backlight-high = Jako

## Sound

volume-sound-settings = Podešavanja zvuka
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
bluetooth-open-menu = Otvori meni za Bluetooth
bluetooth-settings = Podešavanja za Bluetooth
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini vezu
bluetooth-connect-device = Poveži se sa uređajem { $deviceName }
bluetooth-disconnect-device = Prekini vezu sa uređajem { $deviceName }
bluetooth-no-devices = Nema dostupnih ni povezanih uređaja
bluetooth-turn-on-hint = Uključite Bluetooth da biste povezali uređaje
bluetooth-connected-count = { $count ->
    [one] { $count } povezan
    [few] { $count } povezana
   *[other] { $count } povezano
}

## Network menus in quick settings

network-menu-unknown-network = <nepoznata>
network-menu-connect = Poveži
network-menu-disconnect = Prekini vezu
network-menu-connect-to = Poveži se sa { $name }
network-menu-disconnect-from = Prekini vezu sa { $name }
network-menu-turn-off = Isključi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaštićena, jačina signala { $strength }%
   *[no] { $name }, nije zaštićena, jačina signala { $strength }%
}
network-menu-hotspot = Pristupna tačka: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Otvori meni za VPN
network-menu-vpn-settings = Podešavanja za VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Otvori meni za Wi-Fi
network-menu-wifi-settings = Sve mreže
network-menu-wired = Žične veze
network-menu-wired-open-menu = Otvori meni žičnih veza
network-menu-wired-settings = Podešavanja žične mreže
network-menu-tethers = Deljenje veze preko telefona
network-menu-tethers-open-menu = Otvori meni deljenja veze
network-menu-tether = Deljenje veze
network-menu-tether-settings = Podešavanja za Bluetooth
network-menu-mobile-connections = Mobilne veze
network-menu-mobile-open-menu = Otvori meni mobilnih veza
network-menu-mobile-settings = Podešavanja mobilnog interneta
network-menu-mobile = Mobilni internet
network-device-wired = Žična veza
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava na mrežu
network-menu-failed-title = Povezivanje nije uspelo
network-menu-failed-body = Mrežna veza nije mogla da se aktivira

## Location access dialog

location-dialog-title = Dozvoliti pristup lokaciji?
location-dialog-description = Aplikacija { $appName } želi da pristupi vašoj lokaciji
location-dialog-info = Pristup lokaciji možete bilo kada da promenite u podešavanjima privatnosti
location-dialog-deny = Zabrani pristup
location-dialog-grant = Dozvoli pristup

## Thunderbolt notifications

thunderbolt-unknown-title = Nepoznat Thunderbolt uređaj
thunderbolt-unknown-body = Dok ste bili odsutni, otkriven je novi uređaj. Isključite ga i ponovo priključite da biste počeli da ga koristite.
thunderbolt-unauthorized-title = Neodobren Thunderbolt uređaj
thunderbolt-unauthorized-body = Otkriven je novi uređaj koji administrator mora da odobri
thunderbolt-error-title = Greška pri odobravanju Thunderbolt uređaja
thunderbolt-error-body = Thunderbolt uređaj nije mogao da se odobri: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zabrani
access-dialog-allow = Dozvoli

## Display change confirmation

display-change-title = Zadržati ova podešavanja ekrana?
display-change-countdown = { $seconds ->
    [one] Promene će biti vraćene za { $seconds } sekundu
    [few] Promene će biti vraćene za { $seconds } sekunde
   *[other] Promene će biti vraćene za { $seconds } sekundi
}
display-change-revert = Vrati
display-change-keep = Zadrži promene

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ ne odgovara
close-dialog-description = Možete malo da sačekate da aplikacija nastavi sa radom ili da je prinudno zatvorite
close-dialog-force-quit = Prinudno zatvori
close-dialog-wait = Sačekaj

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Preslikaj
switch-monitor-join = Proširi
switch-monitor-external-only = Samo spoljni
switch-monitor-built-in-only = Samo ugrađeni

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Nazad
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Lozinka nije tačna
auth-prompt-failed = Nije uspelo. Pokušajte ponovo.
fingerprint-not-recognized = Otisak prsta nije prepoznat

## Drive connected notification

autorun-connected = Povezan je disk „{ $driveName }“
autorun-ready = Disk je spreman za korišćenje
autorun-open-with = Otvori u aplikaciji { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Spori tasteri su uključeni
kbd-a11y-slow-keys-off = Spori tasteri su isključeni
kbd-a11y-slow-keys-description = Upravo ste držali taster Shift 8 sekundi. To je prečica za Spore tastere, koji menjaju način na koji tastatura radi.
kbd-a11y-sticky-keys-on = Lepljivi tasteri su uključeni
kbd-a11y-sticky-keys-off = Lepljivi tasteri su isključeni
kbd-a11y-sticky-keys-on-description = Upravo ste pritisnuli taster Shift 5 puta zaredom. To je prečica za Lepljive tastere, koji menjaju način na koji tastatura radi.
kbd-a11y-sticky-keys-off-description = Upravo ste pritisnuli dva tastera odjednom ili taster Shift 5 puta zaredom. Time se isključuju Lepljivi tasteri, koji menjaju način na koji tastatura radi.
kbd-a11y-leave-on = Ostavi uključeno
kbd-a11y-turn-on = Uključi
kbd-a11y-turn-off = Isključi
kbd-a11y-leave-off = Ostavi isključeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izaberite audio-uređaj
audio-device-cancel = Otkaži
audio-device-sound-settings = Podešavanja zvuka
audio-device-headphones = Slušalice
audio-device-headset = Slušalice sa mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dozvoliti zaobilaženje prečica?
inhibit-shortcuts-app = Aplikacija { $appName } želi da zaobiđe sistemske prečice
inhibit-shortcuts-unknown-app = Jedna aplikacija želi da zaobiđe sistemske prečice
inhibit-shortcuts-restore = Prečice možete da vratite pritiskom na { $shortcut }
inhibit-shortcuts-deny = Zabrani
inhibit-shortcuts-allow = Dozvoli

## Administrator authentication

polkit-title = Potrebna je potvrda identiteta
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Otkaži
polkit-authenticate = Potvrdi
polkit-failed = Nije uspelo. Pokušajte ponovo.

## Unlocking encrypted drives

mount-hidden-volume = Skriveni volumen
mount-windows-system-volume = Sistemski volumen za Windows
mount-uses-keyfiles = Koristi datoteke ključeva
mount-keyfiles-use-app = Da biste otključali volumen koji koristi datoteke ključeva, koristite aplikaciju <i>{ $appName }</i>
mount-keyfiles-need-app = Za otključavanje volumena koji koristi datoteke ključeva potrebna je posebna aplikacija, na primer <i>Diskovi</i>
mount-pim-number = PIM broj
mount-pim-invalid = PIM mora da bude broj ili da ostane prazan
mount-password = Lozinka
mount-remember-password = Zapamti lozinku
mount-cancel = Otkaži
mount-unlock = Otključaj
mount-open-app = Otvori aplikaciju { $appName }
mount-wrong-password = Nije uspelo. Pokušajte ponovo.
mount-unlock-failed = Volumen nije mogao da se otključa
mount-pim-unsupported = Instalirana verzija udisks ne podržava PIM

## Log out, power off and restart dialog

end-session-log-out-user = Odjava: { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekundu
    [few] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekunde
   *[other] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatska odjava za { $seconds } sekundu
    [few] Automatska odjava za { $seconds } sekunde
   *[other] Automatska odjava za { $seconds } sekundi
}
end-session-log-out-button = Odjavi se
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sistem će se automatski isključiti za { $seconds } sekundu
    [few] Sistem će se automatski isključiti za { $seconds } sekunde
   *[other] Sistem će se automatski isključiti za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sistem će se automatski ponovo pokrenuti za { $seconds } sekundu
    [few] Sistem će se automatski ponovo pokrenuti za { $seconds } sekunde
   *[other] Sistem će se automatski ponovo pokrenuti za { $seconds } sekundi
}
end-session-restart-button = Ponovo pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekundu
    [few] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekunde
   *[other] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Ponovo pokreni i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-low-battery = Baterija je skoro prazna: priključite punjač pre instaliranja ažuriranja
end-session-busy-apps = Neke aplikacije su zauzete ili imaju nesačuvan rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Otkaži
end-session-boot-options = Opcije pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebna je potvrda identiteta
network-agent-wifi-rejected = Sačuvana lozinka za „{ $networkName }“ nije uspela. Unesite je ponovo.
network-agent-wifi-secrets = Za pristup bežičnoj mreži „{ $networkName }“ potrebne su lozinke ili ključevi za šifrovanje
network-agent-wps-hint = Možete se povezati i pritiskom na dugme „WPS“ na ruteru
network-agent-wired-title = Potvrda identiteta za žičnu mrežu 802.1X
network-agent-dsl-title = Potvrda identiteta za DSL
network-agent-pin-title = Potreban je PIN
network-agent-pin-body = Uređaju za mobilni internet je potreban PIN
network-agent-vpn-title = Lozinka za VPN
network-agent-password-required = Za povezivanje sa „{ $networkName }“ potrebna je lozinka
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

lock-clock-swipe-up = Prevucite nagore
lock-clock-click-or-press = Kliknite ili pritisnite taster

## Notification times

date-just-now = Upravo

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Prozori
ctrl-alt-tab-panel = Traka zadataka
ctrl-alt-tab-unlock = Prozor za otključavanje

## System notifications

messages-system-source = Sistem
unsafe-mode-title = Sistem je prebačen u nebezbedni režim
unsafe-mode-body = Aplikacije sada imaju neograničen pristup
unsafe-mode-undo = Opozovi
privileged-user-title = Prijavljeni ste kao privilegovani korisnik
privileged-user-body = Iz bezbednosnih razloga izbegavajte rad u sesiji privilegovanog korisnika. Ako je moguće, prijavite se kao običan korisnik.

## On-screen keyboard

osk-keyboard-settings = Podešavanja tastature
osk-letters-key = ABV

## Lock screen

lock-inhibit-reason = Kestrel mora da zaključa ekran

## Notifications

messages-unknown-app = Nepoznata aplikacija
messages-reply = Odgovori
messages-reply-placeholder = Napišite odgovor
messages-reply-send = Pošalji

## Media player controls

mpris-unknown-artist = Nepoznat izvođač
mpris-unknown-title = Nepoznat naslov

## Starting programs

spawn-failed = Pokretanje „{ $command }“ nije uspelo:

## Text field context menu

entry-menu-copy = Kopiraj
entry-menu-paste = Nalepi
entry-menu-show-text = Prikaži tekst
entry-menu-hide-text = Sakrij tekst
entry-caps-lock-on = Caps Lock je uključen

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Napravi snimak ekrana
title-bar-menu-hide = Sakrij
title-bar-menu-restore = Vrati
title-bar-menu-maximize = Maksimizuj
title-bar-menu-move = Pomeri
title-bar-menu-resize = Promeni veličinu
title-bar-menu-always-on-top = Uvek na vrhu
title-bar-menu-always-on-visible-workspace = Uvek na vidljivom radnom prostoru
title-bar-menu-workspace-left = Premesti na radni prostor levo
title-bar-menu-workspace-right = Premesti na radni prostor desno
title-bar-menu-workspace-up = Premesti na radni prostor gore
title-bar-menu-workspace-down = Premesti na radni prostor dole
title-bar-menu-monitor-up = Premesti na ekran gore
title-bar-menu-monitor-down = Premesti na ekran dole
title-bar-menu-monitor-left = Premesti na ekran levo
title-bar-menu-monitor-right = Premesti na ekran desno
title-bar-menu-close = Zatvori

## Screenshots and screen recording

screenshot-source = Snimanje ekrana
screenshot-area = Izbor oblasti
screenshot-screen = Izbor ekrana
screenshot-window = Izbor prozora
screenshot-take = Napravi snimak ekrana
screenshot-record = Snimi ekran
screenshot-show-pointer = Prikaži pokazivač
screenshot-capture = Snimi
screenshot-close = Zatvori
screenshot-screencasts-folder = Video-snimci ekrana
screenshot-screencast-file = Video-snimak ekrana { $date } { $time }
screenshot-screenshots-folder = Snimci ekrana
screenshot-file = Snimak ekrana { $timestamp }
screenshot-screencast-recorded = Ekran je snimljen
screenshot-screencast-start-failed = Snimanje ekrana nije moglo da počne
screenshot-screencast-out-of-space = Snimanje ekrana nije uspelo: nema mesta na disku
screenshot-screencast-try-again = Snimanje ekrana nije uspelo, pokušajte ponovo
screenshot-screencast-failed = Snimanje ekrana nije uspelo
screenshot-screencast-view = Kliknite ovde da biste pogledali video
screenshot-show-in-rover = Prikaži u aplikaciji Rover
screenshot-captured = Snimak ekrana je napravljen
screenshot-captured-body = Sliku možete da nalepite iz ostave

## Rain

rain-title = Kiša
rain-open-menu = Otvori meni kiše
rain-drizzle = Rosulja
rain-rain = Kiša
rain-storm = Oluja
rain-show = Prikaži na radnoj površini
rain-sound = Zvuk
rain-volume = Jačina kiše
rain-settings = Podešavanja kiše
