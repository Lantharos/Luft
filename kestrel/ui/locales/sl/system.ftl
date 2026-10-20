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
battery-left-with-time = Preostalo: { $percent }, približno { $duration }.
battery-low-title = Baterija je skoraj prazna
battery-very-low-title = Baterija je zelo prazna
battery-almost-empty-title = Baterija je tik pred izpraznitvijo
battery-ups-low-title = Baterija UPS je skoraj prazna
battery-ups-very-low-title = Baterija UPS je zelo prazna
battery-ups-almost-empty-title = Baterija UPS je tik pred izpraznitvijo
battery-very-low-body = { $left } Kmalu priključite napajanje.
battery-almost-empty-body = { $left } Takoj priključite napajanje, da ne izgubite neshranjenega dela.

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
privacy-windows-using = Uporablja vaša okna
privacy-windows-seeing = Vidi vaša okna
privacy-windows-stop = Ustavi dostop

## Window access prompt

peek-see-title = Program { $app } želi videti vaša okna
peek-see-description = Lahko bo naredil posnetek katerega koli odprtega okna.
peek-use-title = Program { $app } želi videti in uporabljati vaša okna
peek-use-description = Videl bo vsa odprta okna ter v njih klikal in tipkal, kot da bi bili vi.
peek-deny = Ne dovoli
peek-allow-once = Dovoli enkrat
peek-allow-until-quit = Dovoli, dokler se ne zapre

## Window access errors

peek-error-declined = Oseba, ki uporablja ta računalnik, je to zavrnila. Program { $app } lahko znova vpraša, ko se zapre.
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
