## Shared

system-cancel = Hætta við

## Dictation notifications

dictation-setup-title = Skrifaðu með röddinni
dictation-setup-body = Talaðu og það sem þú segir er skrifað, í hvaða forriti sem er. Hlustað er á þessari tölvu, svo fyrst þarf að sækja talmálslíkanið.
dictation-setup-action = Stilla raddinnslátt
dictation-unsupported-title = Raddinnsláttur á tungumálinu { $language } er ekki í boði á þessari tölvu
dictation-unsupported-body = Örgjörvi tölvunnar ræður ekki við talgreininn sem tungumálið { $language } þarf. Þú getur notað raddinnslátt á öðru tungumáli.
dictation-settings-action = Stillingar raddinnsláttar

## System health notifications

health-gpu-reset-title = Skjákortsrekillinn hætti að svara
health-gpu-reset-body = { $day ->
    [today] Tölvan endurræsti sig í dag kl. { $time }. Í Stillingum sérðu hvað getur komið í veg fyrir að þetta gerist aftur.
   *[other] Tölvan endurræsti sig { $date } kl. { $time }. Í Stillingum sérðu hvað getur komið í veg fyrir að þetta gerist aftur.
}
health-gpu-reset-details = Nánar

oom-app-closed-title = Forritinu { $app } var lokað til að losa minni
oom-container-closed-title = Gámi var lokað til að losa minni
oom-closed-body = Minni tölvunnar var að klárast, svo þessu var lokað til að allt annað héldi áfram að svara.
oom-closed-body-with-size = Minni tölvunnar var að klárast, svo þessu var lokað til að allt annað héldi áfram að svara. Minnisnotkunin var { $size }.
memory-low-title = Minni Luft er að klárast
memory-low-app-body = { $app } notar { $size }. Þvingaðu lokun svo allt annað haldi áfram að svara.
memory-low-container-body = Gámur notar { $size }. Þvingaðu lokun svo allt annað haldi áfram að svara.
memory-low-force-quit = Þvinga lokun

## Input source indicator

input-source-indicator = Inntaksgjafi: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Kveikt er á flugstillingu í vélbúnaði
media-keys-airplane-mode-on = Kveikt á flugstillingu
media-keys-airplane-mode-off = Slökkt á flugstillingu
media-keys-bluetooth-on = Kveikt á Bluetooth
media-keys-bluetooth-off = Slökkt á Bluetooth
media-keys-caps-lock-on = Kveikt á Caps Lock
media-keys-caps-lock-off = Slökkt á Caps Lock
media-keys-num-lock-on = Kveikt á Num Lock
media-keys-num-lock-off = Slökkt á Num Lock

## VPN sign-in

vpn-sign-in-title = Skrá inn á { $connection }
vpn-connect = Tengjast
vpn-signing-in = Skráir inn…
vpn-finish-in-browser = Ljúktu innskráningunni í vafranum.
vpn-certificate-untrusted = { $host } sýndi skilríki sem ekki er hægt að staðfesta ({ $reason }). Fingrafar þess er { $fingerprint }.
vpn-certificate-warning = Einhver gæti verið að þykjast vera þessi þjónn. Tengstu aðeins ef þú áttir von á þessu.
vpn-certificate-connect = Tengjast samt

vpn-field-password = Lykilorð
vpn-field-certificate-password = Lykilorð skilríkis
vpn-field-proxy-password = Lykilorð milliþjóns
vpn-field-pre-shared-key = Fyrirfram deildur lykill
vpn-field-group-password = Lykilorð hóps

## Battery notifications

battery-left = { $percent } eftir.
battery-left-with-time = { $percent } eftir, um { $duration }.
battery-low-title = Lítil hleðsla á rafhlöðu
battery-very-low-title = Mjög lítil hleðsla á rafhlöðu
battery-almost-empty-title = Rafhlaðan er nánast tóm
battery-ups-low-title = Lítil hleðsla á varaaflgjafa
battery-ups-very-low-title = Mjög lítil hleðsla á varaaflgjafa
battery-ups-almost-empty-title = Varaaflgjafinn er nánast tómur
battery-very-low-body = { $left } Tengdu tölvuna við rafmagn fljótlega.
battery-almost-empty-body = { $left } Tengdu tölvuna við rafmagn núna svo óvistuð vinna tapist ekki.

battery-device-low-title = { $device }: lítil hleðsla
battery-device-very-low-title = { $device }: mjög lítil hleðsla
battery-device-low-body = { $left } Hladdu tækið fljótlega.
battery-device-very-low-body = { $left } Hladdu tækið núna svo það slökkni ekki á sér.

battery-device-mouse = Mús
battery-device-keyboard = Lyklaborð
battery-device-phone = Sími
battery-device-tablet = Spjaldtölva
battery-device-controller = Leikjastýring
battery-device-pen = Penni
battery-device-touchpad = Snertiflötur
battery-device-headset = Höfuðtól
battery-device-speaker = Hátalari
battery-device-headphones = Heyrnartól
battery-device-remote = Fjarstýring
battery-device-other = Tengt tæki

## Privacy indicator

privacy-indicator = Í notkun: { $things }
privacy-thing-camera = myndavél
privacy-thing-microphone = hljóðnemi
privacy-thing-screen = skjár
privacy-thing-location = staðsetning
privacy-thing-windows = gluggar

privacy-camera-unknown-app = Forrit notar myndavélina
privacy-stop-sharing = Hætta að deila skjánum
privacy-stop-recording = Stöðva upptöku
privacy-turn-off-location = Slökkva á staðsetningarþjónustu
privacy-settings = Persónuverndarstillingar
privacy-camera = Myndavél
privacy-microphone = Hljóðnemi
privacy-microphone-muted = Slökkt á hljóðnema
privacy-mute-microphone = Þagga hljóðnema
privacy-unmute-microphone = Kveikja á hljóðnema
privacy-close-app = Loka { $app }
privacy-unknown-app = Forrit
privacy-windows-seeing-programs = { $count ->
    [one] { $count } forrit getur séð gluggana þína
   *[other] { $count } forrit geta séð gluggana þína
}
privacy-windows-using-programs = { $count ->
    [one] { $count } forrit getur séð og notað gluggana þína
   *[other] { $count } forrit geta séð og notað gluggana þína
}
privacy-windows-stop = Stöðva aðgang

## Window access prompt

peek-see-request = Leyfa forriti sem þú ræstir að sjá gluggana þína?
peek-see-description = Forritið getur þá tekið myndir af öllum gluggum sem þú hefur opna.
peek-use-request = Leyfa forriti sem þú ræstir að sjá og nota gluggana þína?
peek-use-description = Forritið getur þá séð alla glugga sem þú hefur opna og smellt og skrifað í þá eins og það væri þú.
peek-deny = Ekki leyfa
peek-allow-once = Leyfa einu sinni
peek-allow-until-quit = Leyfa þar til forritið hættir

## Window access errors

peek-error-declined-until-quit = Notandi tölvunnar hafnaði þessu. Forritið getur spurt aftur eftir að það hættir.
peek-error-not-allowed = Notandi tölvunnar leyfði þetta ekki
peek-error-sandboxed = Forrit í sandkassa geta hvorki séð né notað aðra glugga
peek-error-unknown-caller = Forritið sem spurði hætti eða þekktist ekki
peek-error-no-caller = Setubrautin (session bus) sagði ekki hvaða forrit er að spyrja
peek-error-screen-busy = Skjárinn er læstur eða kerfisgluggi er opinn á honum. Reyndu aftur þegar hann er farinn.
peek-error-input-held = Einhver heldur inni lyklum eða músarhnöppum. Reyndu aftur eftir smástund.
peek-error-input-dropped = Innslátturinn var stöðvaður því eitthvað annað var undir bendlinum eða með lyklaborðið þegar hann barst
peek-error-not-in-front = Ekki tókst að færa gluggann fremst
peek-error-covered = Eitthvað annað hylur þennan hluta gluggans
peek-error-outside = { $x }, { $y } er utan myndar gluggans, sem er { $width } × { $height }
peek-error-nothing-to-capture = Glugginn sýnir ekkert sem hægt er að taka mynd af
peek-error-window-picture-late = Mynd gluggans var ekki tilbúin í tæka tíð
peek-error-screen-picture-late = Mynd skjásins var ekki tilbúin í tæka tíð
peek-error-no-window-id = Enginn gluggi hefur auðkennið { $id }. peek list sýnir þá sem eru opnir.
peek-error-no-window-for-handle = Forritið sem var ræst sem { $handle } er ekki með neinn glugga opinn
peek-error-ended-before-window = Forritið hætti áður en það opnaði glugga
peek-error-no-window-in-time = Enginn gluggi opnaðist innan { $duration }
peek-error-launch-not-started-by-peek = Aðeins er hægt að ræsa forrit sem peek run ræsti sjálft
peek-error-ended-while-starting = Forritið hætti á meðan það var að ræsast
peek-error-launch-failed = systemd gat ekki ræst { $program }
peek-error-unknown-handle = Ekkert sem þú ræstir með peek run hefur auðkennið { $handle }, eða það er hætt
peek-error-unknown-key = { $key } er ekki lykill sem peek þekkir
peek-error-unknown-modifier = { $modifier } er ekki breytilykill. Notaðu ctrl, shift, alt eða super.
peek-error-display-owner = Þessi skjár tilheyrir öðru forriti
peek-error-display-run = Forrit á földum skjá eru ræst með peek run
peek-error-display-handle = Þessi skjár var ræstur sem { $handle }, ekki { $requested }

## Quick settings tiles

auto-rotate-title = Sjálfvirkur snúningur
dark-style-title = Dökkt útlit
do-not-disturb-title = Ekki trufla
night-light-title = Næturljós
airplane-mode-title = Flugstilling

## Power mode

power-profile-title = Orkustilling
power-profile-header = Orkustilling
power-profile-open-menu = Opna valmynd orkustillinga
power-profile-settings = Orkustillingar
power-profile-performance = Afköst
power-profile-balanced = Jafnvægi
power-profile-power-saver = Orkusparnaður
power-profile-custom = Sérsniðið

## Keep awake

caffeine-title = Halda vakandi
caffeine-open-menu = Opna valmyndina Halda vakandi
caffeine-until = Til { $time }
caffeine-until-turned-off = Þar til slökkt er
caffeine-30-minutes = 30 mínútur
caffeine-1-hour = 1 klukkustund
caffeine-2-hours = 2 klukkustundir
caffeine-inhibit-reason = Haldið vakandi úr flýtistillingum

## Brightness

brightness-title = Birtustig
brightness-open-menu = Opna valmynd birtustigs

## Keyboard backlight

backlight-title = Baklýsing lyklaborðs
backlight-open-menu = Opna valmynd baklýsingar lyklaborðs
backlight-slider = Birtustig lyklaborðs
backlight-off = Slökkt
backlight-low = Lítil
backlight-high = Mikil

## Sound

volume-sound-settings = Hljóðstillingar
volume-mute = Þagga
volume-unmute = Kveikja á hljóði
volume-output-slider = Hljóðstyrkur
volume-output-title = Hljóðúttak
volume-output-open-menu = Opna valmynd hljóðúttaks
volume-input-slider = Hljóðnemi
volume-input-title = Hljóðinntak
volume-input-open-menu = Opna valmynd hljóðinntaks

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Opna Bluetooth-valmynd
bluetooth-settings = Bluetooth-stillingar
bluetooth-connect = Tengja
bluetooth-disconnect = Aftengja
bluetooth-connect-device = Tengjast við { $deviceName }
bluetooth-disconnect-device = Aftengja { $deviceName }
bluetooth-no-devices = Engin tæki tiltæk eða tengd
bluetooth-turn-on-hint = Kveiktu á Bluetooth til að tengjast tækjum
bluetooth-connected-count = { $count ->
    [one] { $count } tengt
   *[other] { $count } tengd
}

## Network menus in quick settings

network-menu-unknown-network = <óþekkt>
network-menu-connect = Tengjast
network-menu-disconnect = Aftengja
network-menu-connect-to = Tengjast við { $name }
network-menu-disconnect-from = Aftengja { $name }
network-menu-turn-off = Slökkva
network-menu-wifi-network = { $secure ->
    [yes] { $name }, öruggt, sendistyrkur { $strength }%
   *[no] { $name }, ekki öruggt, sendistyrkur { $strength }%
}
network-menu-hotspot = Heitur reitur: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } tenging virk
   *[other] { $count } tengingar virkar
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Opna VPN-valmynd
network-menu-vpn-settings = VPN-stillingar
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Opna Wi-Fi-valmynd
network-menu-wifi-settings = Öll net
network-menu-wired = Snúrutengingar
network-menu-wired-open-menu = Opna valmynd snúrutenginga
network-menu-wired-settings = Stillingar snúrutenginga
network-menu-tethers = Netdeiling um Bluetooth
network-menu-tethers-open-menu = Opna valmynd netdeilingar um Bluetooth
network-menu-tether = Netdeiling
network-menu-tether-settings = Bluetooth-stillingar
network-menu-mobile-connections = Farsímatengingar
network-menu-mobile-open-menu = Opna valmynd farsímatenginga
network-menu-mobile-settings = Stillingar farsímanets
network-menu-mobile = Farsímanet
network-device-wired = Snúrutenging
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Skrá inn á net
network-menu-failed-title = Ekki tókst að tengjast
network-menu-failed-body = Ekki tókst að virkja nettenginguna

## Location access dialog

location-dialog-title = Leyfa aðgang að staðsetningu
location-dialog-description = Forritið { $appName } vill fá aðgang að staðsetningu þinni
location-dialog-info = Þú getur alltaf breytt aðgangi að staðsetningu í persónuverndarstillingum
location-dialog-deny = Hafna
location-dialog-grant = Veita aðgang

## Thunderbolt notifications

thunderbolt-unknown-title = Óþekkt Thunderbolt-tæki
thunderbolt-unknown-body = Nýtt tæki var tengt á meðan þú varst í burtu. Taktu það úr sambandi og tengdu það aftur til að byrja að nota það.
thunderbolt-unauthorized-title = Óheimilað Thunderbolt-tæki
thunderbolt-unauthorized-body = Nýtt tæki var tengt og stjórnandi þarf að samþykkja það
thunderbolt-error-title = Villa við heimild Thunderbolt-tækis
thunderbolt-error-body = Ekki tókst að heimila Thunderbolt-tækið: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Hafna
access-dialog-allow = Leyfa

## Display change confirmation

display-change-title = Halda þessum skjástillingum?
display-change-countdown = { $seconds ->
    [one] Breytingarnar verða afturkallaðar eftir { $seconds } sekúndu
   *[other] Breytingarnar verða afturkallaðar eftir { $seconds } sekúndur
}
display-change-revert = Afturkalla
display-change-keep = Halda breytingum

## Drive connected notification

autorun-connected = „{ $driveName }“ tengdist
autorun-ready = Nú er hægt að nota diskinn
autorun-open-with = Opna með { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Kveikt á hægum lyklum
kbd-a11y-slow-keys-off = Slökkt á hægum lyklum
kbd-a11y-slow-keys-description = Þú hélst Shift-lyklinum inni í 8 sekúndur. Það er flýtileiðin fyrir hæga lykla, sem breyta því hvernig lyklaborðið virkar.
kbd-a11y-sticky-keys-on = Kveikt á klístruðum lyklum
kbd-a11y-sticky-keys-off = Slökkt á klístruðum lyklum
kbd-a11y-sticky-keys-on-description = Þú ýttir 5 sinnum í röð á Shift-lykilinn. Það er flýtileiðin fyrir klístraða lykla, sem breyta því hvernig lyklaborðið virkar.
kbd-a11y-sticky-keys-off-description = Þú ýttir á tvo lykla í einu eða 5 sinnum í röð á Shift-lykilinn. Þá slokknar á klístruðum lyklum, sem breyta því hvernig lyklaborðið virkar.
kbd-a11y-leave-on = Hafa kveikt
kbd-a11y-turn-on = Kveikja
kbd-a11y-turn-off = Slökkva
kbd-a11y-leave-off = Hafa slökkt

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Veldu hljóðtæki
audio-device-cancel = Hætta við
audio-device-sound-settings = Hljóðstillingar
audio-device-headphones = Heyrnartól
audio-device-headset = Höfuðtól
audio-device-microphone = Hljóðnemi

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Leyfa forriti að taka yfir flýtilykla
inhibit-shortcuts-app = Forritið { $appName } vill taka yfir flýtilykla kerfisins
inhibit-shortcuts-unknown-app = Forrit vill taka yfir flýtilykla kerfisins
inhibit-shortcuts-restore = Þú getur endurheimt flýtilyklana með því að ýta á { $shortcut }
inhibit-shortcuts-deny = Hafna
inhibit-shortcuts-allow = Leyfa

## Unlocking encrypted drives

mount-hidden-volume = Falið bindi
mount-windows-system-volume = Windows-kerfisbindi
mount-uses-keyfiles = Notar lykilskrár
mount-keyfiles-use-app = Til að taka úr lás bindi sem notar lykilskrár skaltu frekar nota forritið <i>{ $appName }</i>
mount-keyfiles-need-app = Til að taka úr lás bindi sem notar lykilskrár þarftu sérstakt forrit eins og <i>Diskar</i>
mount-pim-number = PIM-númer
mount-pim-invalid = PIM verður að vera tala eða autt
mount-password = Lykilorð
mount-remember-password = Muna lykilorð
mount-cancel = Hætta við
mount-unlock = Taka úr lás
mount-open-app = Opna { $appName }
mount-wrong-password = Þetta tókst ekki. Reyndu aftur.
mount-unlock-failed = Ekki tókst að taka bindið úr lás
mount-pim-unsupported = Uppsett útgáfa af udisks styður ekki PIM-stillinguna

## Network passwords, asked when connecting needs one

network-agent-auth-required = Auðkenningar krafist
network-agent-wifi-rejected = Vistaða lykilorðið fyrir „{ $networkName }“ virkaði ekki. Sláðu það inn aftur.
network-agent-wifi-secrets = Lykilorð eða dulritunarlykla þarf til að tengjast þráðlausa netinu „{ $networkName }“
network-agent-wps-hint = Þú getur líka tengst með því að ýta á WPS-hnappinn á beininum
network-agent-wired-title = 802.1X-auðkenning fyrir snúrutengingu
network-agent-dsl-title = DSL-auðkenning
network-agent-pin-title = PIN-númers krafist
network-agent-pin-body = Farsímanetstækið þarf PIN-númer
network-agent-vpn-title = VPN-lykilorð
network-agent-password-required = Lykilorð þarf til að tengjast „{ $networkName }“
network-agent-connect = Tengjast
network-agent-cancel = Hætta við
network-agent-password = Lykilorð
network-agent-username = Notandanafn
network-agent-key = Lykill
network-agent-private-key-password = Lykilorð einkalykils
network-agent-identity = Auðkenni
network-agent-service = Þjónusta
network-agent-network-name = Heiti nets
network-agent-pin = PIN-númer

## Screenshots and screen recording

screenshot-source = Skjámyndataka
screenshot-area = Velja svæði
screenshot-screen = Velja skjá
screenshot-window = Velja glugga
screenshot-take = Taka skjámynd
screenshot-record = Taka upp skjáinn
screenshot-show-pointer = Sýna bendil
screenshot-capture = Taka
screenshot-close = Loka
screenshot-screencasts-folder = Skjáupptökur
screenshot-screencast-file = Skjáupptaka { $date } { $time }
screenshot-screenshots-folder = Skjámyndir
screenshot-file = Skjámynd { $timestamp }
screenshot-screencast-recorded = Skjáupptaka vistuð
screenshot-screencast-start-failed = Ekki tókst að hefja skjáupptöku
screenshot-screencast-out-of-space = Ekki tókst að ljúka skjáupptöku: diskurinn er fullur
screenshot-screencast-try-again = Ekki tókst að taka upp skjáinn. Reyndu aftur.
screenshot-screencast-failed = Ekki tókst að taka upp skjáinn
screenshot-screencast-view = Smelltu hér til að skoða myndskeiðið
screenshot-show-in-rover = Sýna í Rover
screenshot-captured = Skjámynd tekin
screenshot-captured-body = Þú getur límt myndina af klippiborðinu
