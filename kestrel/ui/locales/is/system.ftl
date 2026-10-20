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
privacy-windows-using = Notar gluggana þína
privacy-windows-seeing = Sér gluggana þína
privacy-windows-stop = Stöðva aðgang

## Window access prompt

peek-see-title = { $app } vill sjá gluggana þína
peek-see-description = Forritið getur þá tekið myndir af öllum gluggum sem þú hefur opna.
peek-use-title = { $app } vill sjá og nota gluggana þína
peek-use-description = Forritið getur þá séð alla glugga sem þú hefur opna og smellt og skrifað í þá eins og það væri þú.
peek-deny = Ekki leyfa
peek-allow-once = Leyfa einu sinni
peek-allow-until-quit = Leyfa þar til forritið hættir

## Window access errors

peek-error-declined = Notandi tölvunnar hafnaði þessu. { $app } getur spurt aftur eftir að forritið hættir.
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
