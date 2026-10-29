## Shared

system-cancel = Prekliči

## Dictation notifications

dictation-setup-title = Pišite z govorom
dictation-setup-body = Govorite in vaše besede se zapišejo v kateri koli aplikaciji. Govor se obdeluje v tem računalniku, zato je treba najprej namestiti govorni model.
dictation-setup-action = Nastavi narekovanje
dictation-unsupported-title = Narekovanje v jeziku { $language } v tem računalniku ni na voljo
dictation-unsupported-body = Procesor tega računalnika ne zmore poganjati razpoznavalnika govora, ki ga potrebuje jezik { $language }. Narekujete lahko v drugem jeziku.
dictation-settings-action = Nastavitve narekovanja

## System health notifications

health-gpu-reset-title = Grafični gonilnik se je prenehal odzivati
health-gpu-reset-body = { $day ->
    [today] Računalnik se je danes ob { $time } sam znova zagnal. V Nastavitvah si lahko ogledate, kako to preprečiti.
   *[other] Računalnik se je sam znova zagnal ({ $date }, { $time }). V Nastavitvah si lahko ogledate, kako to preprečiti.
}
health-gpu-reset-details = Podrobnosti

oom-app-closed-title = Aplikacija { $app } je bila zaprta, da se sprosti pomnilnik
oom-container-closed-title = Vsebnik je bil zaprt, da se sprosti pomnilnik
oom-closed-body = Računalniku je zmanjkovalo pomnilnika, zato ga je sistem zaprl, da se vse drugo še naprej hitro odziva.
oom-closed-body-with-size = Računalniku je zmanjkovalo pomnilnika, zato ga je sistem zaprl, da se vse drugo še naprej hitro odziva. Porabljeni pomnilnik: { $size }.
memory-low-title = Sistemu Luft zmanjkuje pomnilnika
memory-low-app-body = Aplikacija { $app } porablja { $size }. Vsilite njeno zaprtje, da se vse drugo še naprej hitro odziva.
memory-low-container-body = Vsebnik porablja { $size }. Vsilite njegovo zaprtje, da se vse drugo še naprej hitro odziva.
memory-low-force-quit = Vsili zaprtje

## Input source indicator

input-source-indicator = Vir vnosa: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Način za letalo je vklopljen s stikalom na napravi
media-keys-airplane-mode-on = Način za letalo je vklopljen
media-keys-airplane-mode-off = Način za letalo je izklopljen
media-keys-bluetooth-on = Bluetooth je vklopljen
media-keys-bluetooth-off = Bluetooth je izklopljen
media-keys-caps-lock-on = Caps Lock je vklopljen
media-keys-caps-lock-off = Caps Lock je izklopljen
media-keys-num-lock-on = Num Lock je vklopljen
media-keys-num-lock-off = Num Lock je izklopljen

## VPN sign-in

vpn-sign-in-title = Prijava v { $connection }
vpn-connect = Poveži
vpn-signing-in = Prijavljanje …
vpn-finish-in-browser = Prijavo dokončajte v brskalniku.
vpn-certificate-untrusted = Strežnik { $host } je predložil potrdilo, ki ga ni mogoče preveriti ({ $reason }). Prstni odtis potrdila: { $fingerprint }.
vpn-certificate-warning = Nekdo se morda izdaja za ta strežnik. Povežite se le, če ste to pričakovali.
vpn-certificate-connect = Vseeno se poveži

vpn-field-password = Geslo
vpn-field-certificate-password = Geslo potrdila
vpn-field-proxy-password = Geslo posredniškega strežnika
vpn-field-pre-shared-key = Ključ v skupni rabi
vpn-field-group-password = Geslo skupine

## Battery notifications

battery-left = Preostalo: { $percent }.

battery-device-low-title = Nizka raven baterije: { $device }
battery-device-very-low-title = Zelo nizka raven baterije: { $device }
battery-device-low-body = { $left } Kmalu napolnite baterijo.
battery-device-very-low-body = { $left } Napolnite baterijo zdaj, da se naprava ne izklopi.

battery-device-mouse = Miška
battery-device-keyboard = Tipkovnica
battery-device-phone = Telefon
battery-device-tablet = Tablični računalnik
battery-device-controller = Krmilnik
battery-device-pen = Pisalo
battery-device-touchpad = Sledilna ploščica
battery-device-headset = Slušalke z mikrofonom
battery-device-speaker = Zvočnik
battery-device-headphones = Slušalke
battery-device-remote = Daljinski upravljalnik
battery-device-other = Povezana naprava

## Privacy indicator

privacy-indicator = V uporabi: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = zaslon
privacy-thing-location = lokacija
privacy-thing-windows = okna

privacy-camera-unknown-app = Kamero uporablja neka aplikacija
privacy-stop-sharing = Ustavi deljenje zaslona
privacy-stop-recording = Ustavi snemanje
privacy-turn-off-location = Izklopi lokacijske storitve
privacy-settings = Nastavitve zasebnosti
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon je utišan
privacy-mute-microphone = Utišaj mikrofon
privacy-unmute-microphone = Vklopi mikrofon
privacy-close-app = Zapri { $app }
privacy-unknown-app = Neka aplikacija
privacy-reported-app = „{ $name }“ (ime ni preverjeno)
privacy-windows-seeing-programs = { $count ->
    [one] { $count } program lahko vidi vaša okna
    [two] { $count } programa lahko vidita vaša okna
    [few] { $count } programi lahko vidijo vaša okna
   *[other] { $count } programov lahko vidi vaša okna
}
privacy-windows-using-programs = { $count ->
    [one] { $count } program lahko vidi in uporablja vaša okna
    [two] { $count } programa lahko vidita in uporabljata vaša okna
    [few] { $count } programi lahko vidijo in uporabljajo vaša okna
   *[other] { $count } programov lahko vidi in uporablja vaša okna
}
privacy-windows-stop = Ustavi dostop

## Window access prompt

peek-see-request = Ali želite programu, ki ste ga zagnali, dovoliti, da vidi vaša okna?
peek-see-description = Lahko bo naredil posnetek katerega koli odprtega okna.
peek-use-request = Ali želite programu, ki ste ga zagnali, dovoliti, da vidi in uporablja vaša okna?
peek-use-description = Videl bo vsa odprta okna ter v njih klikal in tipkal, kot da bi bili vi.
peek-deny = Ne dovoli
peek-allow-once = Dovoli enkrat
peek-allow-until-quit = Dovoli, dokler se ne zapre

## Window access errors

peek-error-declined-until-quit = Oseba, ki uporablja ta računalnik, je to zavrnila. Program lahko znova vpraša, ko se zapre.
peek-error-not-allowed = Oseba, ki uporablja ta računalnik, tega ni dovolila
peek-error-sandboxed = Aplikacije v izoliranem okolju ne morejo videti ali uporabljati drugih oken
peek-error-unknown-caller = Program, ki sprašuje, se je končal ali ga ni bilo mogoče prepoznati
peek-error-no-caller = Sejno vodilo ni sporočilo, kateri program sprašuje
peek-error-screen-busy = Zaslon je zaklenjen ali pa je na njem odprt sistemski poziv. Poskusite znova, ko ga ne bo več.
peek-error-input-held = Nekdo drži pritisnjene tipke ali gumbe miške. Poskusite znova čez trenutek.
peek-error-input-dropped = Vnos je bil ustavljen, ker je bilo ob njegovem prihodu pod točko nekaj drugega ali pa je tipkovnico imelo nekaj drugega
peek-error-not-in-front = Okna ni bilo mogoče premakniti v ospredje
peek-error-covered = Ta del okna prekriva nekaj drugega
peek-error-outside = { $x }, { $y } je zunaj slike okna, ki meri { $width } × { $height }
peek-error-nothing-to-capture = Okno ne prikazuje ničesar, kar bi bilo mogoče zajeti
peek-error-window-picture-late = Slika okna ni bila pravočasno pripravljena
peek-error-screen-picture-late = Slika zaslona ni bila pravočasno pripravljena
peek-error-no-window-id = Nobeno okno nima ID-ja { $id }. Ukaz peek list pokaže odprta okna.
peek-error-no-window-for-handle = Program, zagnan kot { $handle }, nima odprtega okna
peek-error-ended-before-window = Program se je končal, preden je odprl okno
peek-error-no-window-in-time = V času { $duration } se ni odprlo nobeno okno
peek-error-launch-not-started-by-peek = Zagnati je mogoče le program, ki ga je zagnal peek run
peek-error-ended-while-starting = Program se je končal med zagonom
peek-error-launch-failed = systemd ni mogel zagnati programa { $program }
peek-error-unknown-handle = Nič, kar ste zagnali s peek run, nima oznake { $handle }, ali pa se je že zaprlo
peek-error-unknown-key = { $key } ni tipka, ki jo peek pozna
peek-error-unknown-modifier = { $modifier } ni modifikatorska tipka. Uporabite ctrl, shift, alt ali super.
peek-error-display-owner = Ta zaslon pripada drugemu programu
peek-error-display-run = Programe na skritem zaslonu zaganja peek run
peek-error-display-handle = Ta zaslon je bil zagnan kot { $handle }, ne kot { $requested }

## Quick settings tiles

auto-rotate-title = Samodejno sukanje
dark-style-title = Temni način
do-not-disturb-title = Ne moti
night-light-title = Nočna svetloba
airplane-mode-title = Način za letalo

## Power mode

power-profile-title = Način napajanja
power-profile-header = Način napajanja
power-profile-open-menu = Odpri meni načinov napajanja
power-profile-settings = Nastavitve napajanja
power-profile-performance = Zmogljivost
power-profile-balanced = Uravnoteženo
power-profile-power-saver = Varčevanje z energijo
power-profile-custom = Po meri

## Keep awake

caffeine-title = Ohrani budnost
caffeine-open-menu = Odpri meni za ohranjanje budnosti
caffeine-until = Do { $time }
caffeine-until-turned-off = Do izklopa
caffeine-30-minutes = 30 minut
caffeine-1-hour = 1 ura
caffeine-2-hours = 2 uri
caffeine-inhibit-reason = Budnost ohranjena prek hitrih nastavitev

## Brightness

brightness-title = Svetlost
brightness-open-menu = Odpri meni svetlosti

## Keyboard backlight

backlight-title = Osvetlitev tipkovnice
backlight-open-menu = Odpri meni svetlosti tipkovnice
backlight-slider = Svetlost tipkovnice
backlight-off = Izklopljeno
backlight-low = Nizka
backlight-high = Visoka

## Sound

volume-sound-settings = Nastavitve zvoka
volume-mute = Izklopi zvok
volume-unmute = Vklopi zvok
volume-output-slider = Glasnost
volume-output-title = Izhod zvoka
volume-output-open-menu = Odpri meni izhoda zvoka
volume-input-slider = Mikrofon
volume-input-title = Vhod zvoka
volume-input-open-menu = Odpri meni vhoda zvoka

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Odpri meni Bluetooth
bluetooth-settings = Nastavitve Bluetooth
bluetooth-connect = Poveži
bluetooth-disconnect = Prekini povezavo
bluetooth-connect-device = Poveži z napravo { $deviceName }
bluetooth-disconnect-device = Prekini povezavo z napravo { $deviceName }
bluetooth-no-devices = Ni razpoložljivih ali povezanih naprav
bluetooth-turn-on-hint = Za povezovanje z napravami vklopite Bluetooth
bluetooth-connected-count = { $count ->
    [one] { $count } povezana
    [two] { $count } povezani
    [few] { $count } povezane
   *[other] { $count } povezanih
}

## Network menus in quick settings

network-menu-unknown-network = <neznano>
network-menu-connect = Poveži
network-menu-disconnect = Prekini povezavo
network-menu-connect-to = Poveži z omrežjem { $name }
network-menu-disconnect-from = Prekini povezavo z omrežjem { $name }
network-menu-turn-off = Izklopi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, zaščiteno, moč signala { $strength } %
   *[no] { $name }, nezaščiteno, moč signala { $strength } %
}
network-menu-hotspot = Dostopna točka { $name }
network-menu-connected-count = { $count ->
    [one] { $count } povezana
    [two] { $count } povezani
    [few] { $count } povezane
   *[other] { $count } povezanih
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Odpri meni VPN
network-menu-vpn-settings = Nastavitve VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Odpri meni Wi-Fi
network-menu-wifi-settings = Vsa omrežja
network-menu-wired = Žične povezave
network-menu-wired-open-menu = Odpri meni žičnih povezav
network-menu-wired-settings = Nastavitve žičnega omrežja
network-menu-tethers = Deljenje povezave Bluetooth
network-menu-tethers-open-menu = Odpri meni deljenja povezave Bluetooth
network-menu-tether = Deljenje povezave
network-menu-tether-settings = Nastavitve Bluetooth
network-menu-mobile-connections = Mobilne povezave
network-menu-mobile-open-menu = Odpri meni mobilnih povezav
network-menu-mobile-settings = Nastavitve mobilnih povezav
network-menu-mobile = Mobilno omrežje
network-device-wired = Žično
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Prijava v omrežje
network-menu-failed-title = Povezava ni uspela
network-menu-failed-body = Aktiviranje omrežne povezave ni uspelo

## Location access dialog

location-dialog-title = Dovoli dostop do lokacije
location-dialog-description = Aplikacija { $appName } želi dostopati do vaše lokacije
location-dialog-info = Dostop do lokacije lahko kadar koli spremenite v nastavitvah zasebnosti
location-dialog-deny = Zavrni dostop
location-dialog-grant = Dovoli dostop

## Thunderbolt notifications

thunderbolt-unknown-title = Neznana naprava Thunderbolt
thunderbolt-unknown-body = Med vašo odsotnostjo je bila priključena nova naprava. Za začetek uporabe jo izključite in znova priključite.
thunderbolt-unauthorized-title = Nepooblaščena naprava Thunderbolt
thunderbolt-unauthorized-body = Priključena je bila nova naprava, ki jo mora odobriti skrbnik
thunderbolt-error-title = Napaka pri pooblaščanju naprave Thunderbolt
thunderbolt-error-body = Naprave Thunderbolt ni bilo mogoče pooblastiti: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Zavrni
access-dialog-allow = Dovoli

## Display change confirmation

display-change-title = Ohranim nastavitve zaslona?
display-change-countdown = { $seconds ->
    [one] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekundo
    [two] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekundi
    [few] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekunde
   *[other] Spremembe nastavitev se bodo razveljavile čez { $seconds } sekund
}
display-change-revert = Razveljavi
display-change-keep = Ohrani spremembe

## Drive connected notification

autorun-connected = Priključeno: „{ $driveName }“
autorun-ready = Disk je pripravljen za uporabo
autorun-open-with = Odpri z aplikacijo { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Počasne tipke so vklopljene
kbd-a11y-slow-keys-off = Počasne tipke so izklopljene
kbd-a11y-slow-keys-description = Pravkar ste 8 sekund držali tipko Shift. To je bližnjica za funkcijo Počasne tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-sticky-keys-on = Lepljive tipke so vklopljene
kbd-a11y-sticky-keys-off = Lepljive tipke so izklopljene
kbd-a11y-sticky-keys-on-description = Pravkar ste petkrat zapored pritisnili tipko Shift. To je bližnjica za funkcijo Lepljive tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-sticky-keys-off-description = Pravkar ste hkrati pritisnili dve tipki ali petkrat zapored pritisnili tipko Shift. S tem se izklopi funkcija Lepljive tipke, ki spremeni delovanje tipkovnice.
kbd-a11y-leave-on = Pusti vklopljeno
kbd-a11y-turn-on = Vklopi
kbd-a11y-turn-off = Izklopi
kbd-a11y-leave-off = Pusti izklopljeno

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izberite zvočno napravo
audio-device-cancel = Prekliči
audio-device-sound-settings = Nastavitve zvoka
audio-device-headphones = Slušalke
audio-device-headset = Slušalke z mikrofonom
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Dovoli onemogočanje bližnjic
inhibit-shortcuts-app = Aplikacija { $appName } želi onemogočiti bližnjice
inhibit-shortcuts-unknown-app = Neka aplikacija želi onemogočiti bližnjice
inhibit-shortcuts-titled-app = Aplikacija z oknom „{ $title }“ želi onemogočiti bližnjice
inhibit-shortcuts-restore = Bližnjice lahko obnovite s pritiskom { $shortcut }
inhibit-shortcuts-deny = Zavrni
inhibit-shortcuts-allow = Dovoli

## Unlocking encrypted drives

mount-hidden-volume = Skriti nosilec
mount-windows-system-volume = Sistemski nosilec Windows
mount-uses-keyfiles = Uporablja datoteke s ključi
mount-keyfiles-use-app = Za odklepanje nosilca, ki uporablja datoteke s ključi, uporabite aplikacijo <i>{ $appName }</i>
mount-keyfiles-need-app = Za odklepanje nosilca, ki uporablja datoteke s ključi, potrebujete zunanjo aplikacijo, kot je <i>Diski</i>
mount-pim-number = Število PIM
mount-pim-invalid = PIM mora biti število ali prazen
mount-password = Geslo
mount-remember-password = Zapomni si geslo
mount-cancel = Prekliči
mount-unlock = Odkleni
mount-open-app = Odpri aplikacijo { $appName }
mount-wrong-password = To ni uspelo. Poskusite znova.
mount-unlock-failed = Nosilca ni mogoče odkleniti
mount-pim-unsupported = Nameščena različica udisks ne podpira nastavitve PIM

## Network passwords, asked when connecting needs one

network-agent-auth-required = Potrebno je preverjanje pristnosti
network-agent-wifi-rejected = Shranjeno geslo za „{ $networkName }“ ni delovalo. Vnesite ga znova.
network-agent-wifi-secrets = Za dostop do brezžičnega omrežja „{ $networkName }“ so potrebna gesla ali šifrirni ključi
network-agent-wps-hint = Povežete se lahko tudi s pritiskom gumba „WPS“ na usmerjevalniku
network-agent-wired-title = Žično preverjanje pristnosti 802.1X
network-agent-dsl-title = Preverjanje pristnosti DSL
network-agent-pin-title = Potrebna je koda PIN
network-agent-pin-body = Za mobilno širokopasovno napravo je potrebna koda PIN
network-agent-vpn-title = Geslo VPN
network-agent-password-required = Za povezavo z omrežjem „{ $networkName }“ je potrebno geslo
network-agent-connect = Poveži
network-agent-cancel = Prekliči
network-agent-password = Geslo
network-agent-username = Uporabniško ime
network-agent-key = Ključ
network-agent-private-key-password = Geslo zasebnega ključa
network-agent-identity = Identiteta
network-agent-service = Storitev
network-agent-network-name = Ime omrežja
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Zajem zaslona
screenshot-area = Izbor območja
screenshot-screen = Izbor zaslona
screenshot-window = Izbor okna
screenshot-take = Zajemi posnetek zaslona
screenshot-record = Posnemi zaslon
screenshot-show-pointer = Pokaži kazalec
screenshot-capture = Zajemi
screenshot-close = Zapri
screenshot-screencasts-folder = Videoposnetki zaslona
screenshot-screencast-file = Videoposnetek zaslona { $date } { $time }
screenshot-screenshots-folder = Posnetki zaslona
screenshot-file = Posnetek zaslona { $timestamp }
screenshot-screencast-recorded = Videoposnetek zaslona je posnet
screenshot-screencast-start-failed = Snemanja zaslona ni bilo mogoče začeti
screenshot-screencast-out-of-space = Snemanje zaslona ni uspelo: na disku ni dovolj prostora
screenshot-screencast-try-again = Snemanje zaslona ni uspelo. Poskusite znova.
screenshot-screencast-failed = Snemanje zaslona ni uspelo
screenshot-screencast-view = Kliknite tukaj za ogled videoposnetka
screenshot-show-in-rover = Pokaži v aplikaciji Rover
screenshot-captured = Posnetek zaslona je zajet
screenshot-captured-body = Sliko lahko prilepite iz odložišča

## System updates
updates-available-title = Na voljo so sistemske posodobitve
updates-available-body = Odprite Nastavitve, da jih prenesete in namestite.
updates-ready-title = Posodobitve so pripravljene za namestitev
updates-ready-body = Za namestitev znova zaženite računalnik, ko vam ustreza.
