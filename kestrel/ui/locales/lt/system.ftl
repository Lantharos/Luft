## Shared

system-cancel = Atšaukti

## Dictation notifications

dictation-setup-title = Rašykite kalbėdami
dictation-setup-body = Kalbėkite, ir jūsų žodžiai bus įrašyti bet kurioje programoje. Kalba atpažįstama šiame kompiuteryje, todėl pirmiausia reikia kalbos modelio.
dictation-setup-action = Nustatyti diktavimą
dictation-unsupported-title = Diktavimas kalba { $language } šiame kompiuteryje negalimas
dictation-unsupported-body = Šio kompiuterio procesorius negali paleisti kalbos atpažinimo, kurio reikia kalbai { $language }. Galite diktuoti kita kalba.
dictation-settings-action = Diktavimo nustatymai

## System health notifications

health-gpu-reset-title = Grafikos tvarkyklė nustojo atsakyti
health-gpu-reset-body = { $day ->
    [today] Šiandien { $time } kompiuteris pats pasileido iš naujo. Nustatymuose rasite, kaip to išvengti ateityje.
   *[other] { $date } { $time } kompiuteris pats pasileido iš naujo. Nustatymuose rasite, kaip to išvengti ateityje.
}
health-gpu-reset-details = Išsamiau

oom-app-closed-title = Programa { $app } uždaryta, kad atsilaisvintų atminties
oom-container-closed-title = Konteineris uždarytas, kad atsilaisvintų atminties
oom-closed-body = Uždaryta, nes kompiuteriui ėmė trūkti atminties. Taip visa kita toliau veikia sklandžiai.
oom-closed-body-with-size = Uždaryta, nes kompiuteriui ėmė trūkti atminties. Taip visa kita toliau veikia sklandžiai. Buvo naudojama { $size }.
memory-low-title = Luft sistemai trūksta atminties
memory-low-app-body = Programa { $app } naudoja { $size }. Priverstinai ją uždarykite, kad visa kita toliau veiktų sklandžiai.
memory-low-container-body = Konteineris naudoja { $size }. Priverstinai jį uždarykite, kad visa kita toliau veiktų sklandžiai.
memory-low-force-quit = Priverstinai uždaryti

## Input source indicator

input-source-indicator = Įvesties šaltinis: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Lėktuvo režimas įjungtas aparatiniu jungikliu
media-keys-airplane-mode-on = Lėktuvo režimas įjungtas
media-keys-airplane-mode-off = Lėktuvo režimas išjungtas
media-keys-bluetooth-on = Bluetooth įjungtas
media-keys-bluetooth-off = Bluetooth išjungtas
media-keys-caps-lock-on = Caps Lock įjungtas
media-keys-caps-lock-off = Caps Lock išjungtas
media-keys-num-lock-on = Num Lock įjungtas
media-keys-num-lock-off = Num Lock išjungtas

## VPN sign-in

vpn-sign-in-title = Prisijungti prie VPN { $connection }
vpn-connect = Prisijungti
vpn-signing-in = Jungiamasi…
vpn-finish-in-browser = Baikite prisijungti naršyklėje.
vpn-certificate-untrusted = Serveris { $host } pateikė sertifikatą, kurio nepavyksta patikrinti ({ $reason }). Jo kontrolinis kodas: { $fingerprint }.
vpn-certificate-warning = Kažkas gali apsimesti šiuo serveriu. Junkitės tik tada, jei to tikėjotės.
vpn-certificate-connect = Vis tiek prisijungti

vpn-field-password = Slaptažodis
vpn-field-certificate-password = Sertifikato slaptažodis
vpn-field-proxy-password = Tarpinio serverio slaptažodis
vpn-field-pre-shared-key = Iš anksto bendrinamas raktas
vpn-field-group-password = Grupės slaptažodis

## Battery notifications

battery-left = Liko { $percent }.
battery-left-with-time = Liko { $percent }, maždaug { $duration }.
battery-low-title = Akumuliatorius senka
battery-very-low-title = Akumuliatorius beveik išsikrovęs
battery-almost-empty-title = Akumuliatorius tuoj išsikraus
battery-ups-low-title = UPS akumuliatorius senka
battery-ups-very-low-title = UPS akumuliatorius beveik išsikrovęs
battery-ups-almost-empty-title = UPS akumuliatorius tuoj išsikraus
battery-very-low-body = { $left } Netrukus prijunkite maitinimą.
battery-almost-empty-body = { $left } Prijunkite maitinimą dabar, kad neprarastumėte neįrašytų darbų.

battery-device-low-title = { $device }: akumuliatorius senka
battery-device-very-low-title = { $device }: akumuliatorius beveik išsikrovęs
battery-device-low-body = { $left } Netrukus įkraukite.
battery-device-very-low-body = { $left } Įkraukite dabar, kad įrenginys neišsijungtų.

battery-device-mouse = Pelė
battery-device-keyboard = Klaviatūra
battery-device-phone = Telefonas
battery-device-tablet = Planšetinis kompiuteris
battery-device-controller = Žaidimų valdiklis
battery-device-pen = Rašiklis
battery-device-touchpad = Jutiklinis kilimėlis
battery-device-headset = Ausinės su mikrofonu
battery-device-speaker = Garsiakalbis
battery-device-headphones = Ausinės
battery-device-remote = Nuotolinio valdymo pultas
battery-device-other = Prijungtas įrenginys

## Privacy indicator

privacy-indicator = Naudojama: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofonas
privacy-thing-screen = ekranas
privacy-thing-location = buvimo vieta
privacy-thing-windows = langai

privacy-camera-unknown-app = Programa naudoja kamerą
privacy-stop-sharing = Nebebendrinti ekrano
privacy-stop-recording = Stabdyti įrašymą
privacy-turn-off-location = Išjungti vietos nustatymo paslaugas
privacy-settings = Privatumo nustatymai
privacy-camera = Kamera
privacy-microphone = Mikrofonas
privacy-microphone-muted = Mikrofonas nutildytas
privacy-mute-microphone = Nutildyti mikrofoną
privacy-unmute-microphone = Įjungti mikrofoną
privacy-close-app = Uždaryti programą { $app }
privacy-unknown-app = Programa
privacy-windows-using = Naudoja jūsų langus
privacy-windows-seeing = Mato jūsų langus
privacy-windows-stop = Atimti prieigą

## Window access prompt

peek-see-title = { $app } nori matyti jūsų langus
peek-see-description = Galės daryti bet kurio atidaryto lango nuotraukas.
peek-use-title = { $app } nori matyti ir naudoti jūsų langus
peek-use-description = Galės matyti bet kurį atidarytą langą, spustelėti jame ir rašyti, tarsi tai būtumėte jūs.
peek-deny = Neleisti
peek-allow-once = Leisti vieną kartą
peek-allow-until-quit = Leisti, kol neužsidarys

## Window access errors

peek-error-declined = Šio kompiuterio naudotojas tai atmetė. { $app } galės paprašyti dar kartą, kai baigs darbą.
peek-error-not-allowed = Šio kompiuterio naudotojas to neleido
peek-error-sandboxed = Programos smėlio dėžėje negali matyti ar naudoti kitų langų
peek-error-unknown-caller = Prašanti programa baigė darbą arba nepavyko jos atpažinti
peek-error-no-caller = Seanso magistralė nenurodė, kuri programa prašo
peek-error-screen-busy = Ekranas užrakintas arba jame atvertas sistemos dialogas. Bandykite dar kartą, kai jo nebeliks.
peek-error-input-held = Kažkas laiko nuspaudęs klavišus ar pelės mygtukus. Po akimirkos bandykite dar kartą.
peek-error-input-dropped = Įvestis sustabdyta, nes jai atkeliavus po žymikliu buvo kas kita arba klaviatūrą valdė kas kita
peek-error-not-in-front = Nepavyko iškelti lango į priekį
peek-error-covered = Tą lango dalį dengia kažkas kita
peek-error-outside = { $x }, { $y } yra už lango vaizdo ribų, o jo dydis { $width } × { $height }
peek-error-nothing-to-capture = Lange nerodoma nieko, ką būtų galima užfiksuoti
peek-error-window-picture-late = Lango vaizdas nebuvo paruoštas laiku
peek-error-screen-picture-late = Ekrano vaizdas nebuvo paruoštas laiku
peek-error-no-window-id = Lango su ID { $id } nėra. Atidarytus langus parodo peek list.
peek-error-no-window-for-handle = Programa, paleista kaip { $handle }, neturi atidaryto lango
peek-error-ended-before-window = Programa baigė darbą neatidariusi lango
peek-error-no-window-in-time = Per { $duration } neatsidarė joks langas
peek-error-launch-not-started-by-peek = Paleisti galima tik tą programą, kurią paleido pati peek run
peek-error-ended-while-starting = Programa baigė darbą dar nepasileidusi
peek-error-launch-failed = systemd nepavyko paleisti programos { $program }
peek-error-unknown-handle = Su peek run paleistos programos su žyma { $handle } nėra arba ji jau baigė darbą
peek-error-unknown-key = peek nežino klavišo { $key }
peek-error-unknown-modifier = { $modifier } nėra modifikavimo klavišas. Naudokite ctrl, shift, alt arba super.
peek-error-display-owner = Šis ekranas priklauso kitai programai
peek-error-display-run = Programas paslėptame ekrane paleidžia peek run
peek-error-display-handle = Šis ekranas paleistas kaip { $handle }, o ne { $requested }
