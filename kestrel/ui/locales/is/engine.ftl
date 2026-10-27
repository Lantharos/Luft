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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ svarar ekki
close-dialog-description = Þú getur beðið smástund eftir að forritið taki við sér eða þvingað það til að hætta.
close-dialog-force-quit = Þvinga til að hætta
close-dialog-wait = Bíða

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Spegla
switch-monitor-join = Sameina skjái
switch-monitor-external-only = Aðeins ytri
switch-monitor-built-in-only = Aðeins innbyggður

## Sign-in prompt

auth-prompt-password = Lykilorð
auth-prompt-username = Notandanafn
auth-prompt-back = Til baka
auth-prompt-submit = Senda
auth-prompt-wrong-password = Lykilorðið virkaði ekki
auth-prompt-failed = Þetta tókst ekki. Reyndu aftur.
fingerprint-not-recognized = Fingrafarið þekktist ekki

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

## Administrator authentication

polkit-title = Auðkenningar krafist
polkit-administrator = Stjórnandi
polkit-password = Lykilorð
polkit-cancel = Hætta við
polkit-authenticate = Auðkenna
polkit-failed = Þetta tókst ekki. Reyndu aftur.

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

## Log out, power off and restart dialog

end-session-log-out-user = Skrá { $userName } út
end-session-log-out-title = Skrá út
end-session-log-out-user-countdown = { $seconds ->
    [one] Notandinn { $userName } verður skráður út sjálfkrafa eftir { $seconds } sekúndu
   *[other] Notandinn { $userName } verður skráður út sjálfkrafa eftir { $seconds } sekúndur
}
end-session-log-out-countdown = { $seconds ->
    [one] Sjálfvirk útskráning eftir { $seconds } sekúndu
   *[other] Sjálfvirk útskráning eftir { $seconds } sekúndur
}
end-session-log-out-button = Skrá út
end-session-power-off-title = Slökkva
end-session-power-off-updates-title = Setja upp uppfærslur og slökkva
end-session-power-off-countdown = { $seconds ->
    [one] Slökkt verður á tölvunni sjálfkrafa eftir { $seconds } sekúndu
   *[other] Slökkt verður á tölvunni sjálfkrafa eftir { $seconds } sekúndur
}
end-session-power-off-button = Slökkva
end-session-restart-title = Endurræsa
end-session-restart-updates-title = Setja upp uppfærslur og endurræsa
end-session-restart-countdown = { $seconds ->
    [one] Tölvan endurræsist sjálfkrafa eftir { $seconds } sekúndu
   *[other] Tölvan endurræsist sjálfkrafa eftir { $seconds } sekúndur
}
end-session-restart-button = Endurræsa
end-session-update-restart-title = Endurræsa og setja upp uppfærslur
end-session-update-restart-countdown = { $seconds ->
    [one] Tölvan endurræsist sjálfkrafa og setur upp uppfærslur eftir { $seconds } sekúndu
   *[other] Tölvan endurræsist sjálfkrafa og setur upp uppfærslur eftir { $seconds } sekúndur
}
end-session-update-restart-button = Endurræsa og setja upp
end-session-install-updates = Setja upp hugbúnaðaruppfærslur sem bíða
end-session-install-version = Setja upp útgáfu { $version }
end-session-low-battery = Lítil hleðsla á rafhlöðu: tengdu tölvuna við rafmagn áður en uppfærslur eru settar upp
end-session-busy-apps = Sum forrit eru upptekin eða með óvistaða vinnu
end-session-other-users = Aðrir notendur eru skráðir inn
end-session-cancel = Hætta við
end-session-boot-options = Ræsivalkostir
end-session-remote-user = { $userName } (fjartenging)
end-session-console-user = { $userName } (textaskjár)

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

## Lock screen clock

lock-clock-swipe-up = Strjúktu upp
lock-clock-click-or-press = Smelltu eða ýttu á lykil

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Gluggar
ctrl-alt-tab-panel = Verkstika
ctrl-alt-tab-unlock = Innskráningargluggi

## System notifications

messages-system-source = Kerfi
unsafe-mode-title = Kerfið er komið í óöruggan ham
unsafe-mode-body = Forrit hafa nú ótakmarkaðan aðgang
unsafe-mode-undo = Afturkalla
privileged-user-title = Skráð inn sem notandi með aukin réttindi
privileged-user-body = Af öryggisástæðum ætti ekki að nota setu sem notandi með aukin réttindi. Skráðu þig frekar inn sem venjulegur notandi ef hægt er.

## On-screen keyboard

osk-keyboard-settings = Lyklaborðsstillingar
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel þarf að læsa skjánum

## Notifications

messages-unknown-app = Óþekkt forrit
messages-reply = Svara
messages-reply-placeholder = Skrifaðu svar
messages-reply-send = Senda

## Media player controls

mpris-unknown-artist = Óþekktur flytjandi
mpris-unknown-title = Óþekktur titill

## Starting programs

spawn-failed = Ekki tókst að keyra „{ $command }“:

## Text field context menu

entry-menu-copy = Afrita
entry-menu-paste = Líma
entry-menu-show-text = Sýna texta
entry-menu-hide-text = Fela texta
entry-caps-lock-on = Kveikt er á Caps Lock

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Taka skjámynd
title-bar-menu-hide = Fela
title-bar-menu-restore = Endurheimta
title-bar-menu-maximize = Hámarka
title-bar-menu-move = Færa
title-bar-menu-resize = Breyta stærð
title-bar-menu-always-on-top = Alltaf efst
title-bar-menu-always-on-visible-workspace = Alltaf á sýnilegu vinnusvæði
title-bar-menu-workspace-left = Færa á vinnusvæði til vinstri
title-bar-menu-workspace-right = Færa á vinnusvæði til hægri
title-bar-menu-workspace-up = Færa á vinnusvæði fyrir ofan
title-bar-menu-workspace-down = Færa á vinnusvæði fyrir neðan
title-bar-menu-monitor-up = Færa á skjá fyrir ofan
title-bar-menu-monitor-down = Færa á skjá fyrir neðan
title-bar-menu-monitor-left = Færa á skjá til vinstri
title-bar-menu-monitor-right = Færa á skjá til hægri
title-bar-menu-close = Loka

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
