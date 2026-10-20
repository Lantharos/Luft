## Quick settings tiles

auto-rotate-title = Automātiska pagriešana
dark-style-title = Tumšais režīms
do-not-disturb-title = Netraucēt
night-light-title = Nakts gaisma
airplane-mode-title = Lidojuma režīms

## Power mode

power-profile-title = Enerģijas režīms
power-profile-header = Enerģijas režīms
power-profile-open-menu = Atvērt enerģijas režīmu izvēlni
power-profile-settings = Barošanas iestatījumi
power-profile-performance = Veiktspēja
power-profile-balanced = Līdzsvarots
power-profile-power-saver = Enerģijas taupīšana
power-profile-custom = Pielāgots

## Keep awake

caffeine-title = Neaizmigt
caffeine-open-menu = Atvērt izvēlni Neaizmigt
caffeine-until = Līdz { $time }
caffeine-until-turned-off = Līdz izslēgšanai
caffeine-30-minutes = 30 minūtes
caffeine-1-hour = 1 stunda
caffeine-2-hours = 2 stundas
caffeine-inhibit-reason = Ieslēgts Neaizmigt ātrajos iestatījumos

## Brightness

brightness-title = Spilgtums
brightness-open-menu = Atvērt spilgtuma izvēlni

## Keyboard backlight

backlight-title = Tastatūras apgaismojums
backlight-open-menu = Atvērt tastatūras spilgtuma izvēlni
backlight-slider = Tastatūras spilgtums
backlight-off = Izslēgts
backlight-low = Vājš
backlight-high = Spēcīgs

## Sound

volume-sound-settings = Skaņas iestatījumi
volume-mute = Izslēgt skaņu
volume-unmute = Ieslēgt skaņu
volume-output-slider = Skaļums
volume-output-title = Skaņas izvade
volume-output-open-menu = Atvērt skaņas izvades izvēlni
volume-input-slider = Mikrofons
volume-input-title = Skaņas ievade
volume-input-open-menu = Atvērt skaņas ievades izvēlni

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Atvērt Bluetooth izvēlni
bluetooth-settings = Bluetooth iestatījumi
bluetooth-connect = Izveidot savienojumu
bluetooth-disconnect = Atvienot
bluetooth-connect-device = Izveidot savienojumu: { $deviceName }
bluetooth-disconnect-device = Atvienot: { $deviceName }
bluetooth-no-devices = Nav pieejamu vai pievienotu ierīču
bluetooth-turn-on-hint = Ieslēdziet Bluetooth, lai pievienotu ierīces
bluetooth-connected-count = { $count ->
    [zero] { $count } pievienotas
    [one] { $count } pievienota
   *[other] { $count } pievienotas
}

## Network menus in quick settings

network-menu-unknown-network = <nezināms>
network-menu-connect = Izveidot savienojumu
network-menu-disconnect = Atvienot
network-menu-connect-to = Izveidot savienojumu: { $name }
network-menu-disconnect-from = Atvienot: { $name }
network-menu-turn-off = Izslēgt
network-menu-wifi-network = { $secure ->
    [yes] { $name }, drošs, signāla stiprums { $strength } %
   *[no] { $name }, nav drošs, signāla stiprums { $strength } %
}
network-menu-hotspot = Tīklājs { $name }
network-menu-connected-count = { $count ->
    [zero] { $count } savienoti
    [one] { $count } savienots
   *[other] { $count } savienoti
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Atvērt VPN izvēlni
network-menu-vpn-settings = VPN iestatījumi
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Atvērt Wi-Fi izvēlni
network-menu-wifi-settings = Visi tīkli
network-menu-wired = Vadu savienojumi
network-menu-wired-open-menu = Atvērt vadu savienojumu izvēlni
network-menu-wired-settings = Vadu tīkla iestatījumi
network-menu-tethers = Bluetooth tīklāji
network-menu-tethers-open-menu = Atvērt Bluetooth tīklāju izvēlni
network-menu-tether = Tīklājs
network-menu-tether-settings = Bluetooth iestatījumi
network-menu-mobile-connections = Mobilie savienojumi
network-menu-mobile-open-menu = Atvērt mobilo savienojumu izvēlni
network-menu-mobile-settings = Mobilā platjoslas tīkla iestatījumi
network-menu-mobile = Mobilais
network-menu-sign-in = Pierakstīties tīklā
network-menu-failed-title = Savienojums neizdevās
network-menu-failed-body = Neizdevās aktivizēt tīkla savienojumu

## Location access dialog

location-dialog-title = Atļaut piekļuvi atrašanās vietai
location-dialog-description = Lietotne { $appName } vēlas piekļūt jūsu atrašanās vietai
location-dialog-info = Piekļuvi atrašanās vietai jebkurā brīdī var mainīt privātuma iestatījumos
location-dialog-deny = Liegt piekļuvi
location-dialog-grant = Atļaut piekļuvi

## Thunderbolt notifications

thunderbolt-unknown-title = Nezināma Thunderbolt ierīce
thunderbolt-unknown-body = Jūsu prombūtnes laikā tika pievienota jauna ierīce. Lai to izmantotu, atvienojiet un pievienojiet to vēlreiz.
thunderbolt-unauthorized-title = Neautorizēta Thunderbolt ierīce
thunderbolt-unauthorized-body = Tika pievienota jauna ierīce, kurai vajadzīgs administratora apstiprinājums
thunderbolt-error-title = Thunderbolt autorizācijas kļūda
thunderbolt-error-body = Neizdevās autorizēt Thunderbolt ierīci: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Liegt
access-dialog-allow = Atļaut

## Display change confirmation

display-change-title = Vai paturēt šos iestatījumus?
display-change-countdown = { $seconds ->
    [zero] Izmaiņas tiks atsauktas pēc { $seconds } sekundēm
    [one] Izmaiņas tiks atsauktas pēc { $seconds } sekundes
   *[other] Izmaiņas tiks atsauktas pēc { $seconds } sekundēm
}
display-change-revert = Atsaukt
display-change-keep = Paturēt izmaiņas

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ nereaģē
close-dialog-description = Varat brīdi pagaidīt, līdz tā turpinās darbu, vai piespiedu kārtā aizvērt lietotni
close-dialog-force-quit = Piespiedu aizvēršana
close-dialog-wait = Gaidīt

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Dublēt
switch-monitor-join = Paplašināt
switch-monitor-external-only = Tikai ārējie
switch-monitor-built-in-only = Tikai iebūvētais

## Sign-in prompt

auth-prompt-password = Parole
auth-prompt-username = Lietotājvārds
auth-prompt-back = Atpakaļ
auth-prompt-submit = Iesniegt
auth-prompt-wrong-password = Parole neder
auth-prompt-failed = Neizdevās. Mēģiniet vēlreiz.
fingerprint-not-recognized = Pirksta nospiedums netika atpazīts

## Drive connected notification

autorun-connected = „{ $driveName }“ pievienots
autorun-ready = Disku tagad var izmantot
autorun-open-with = Atvērt ar lietotni { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Lēnie taustiņi ieslēgti
kbd-a11y-slow-keys-off = Lēnie taustiņi izslēgti
kbd-a11y-slow-keys-description = Jūs tikko 8 sekundes turējāt nospiestu taustiņu Shift. Tas ir lēno taustiņu īsinājumtaustiņš, un lēnie taustiņi maina tastatūras darbību.
kbd-a11y-sticky-keys-on = Taustiņu fiksācija ieslēgta
kbd-a11y-sticky-keys-off = Taustiņu fiksācija izslēgta
kbd-a11y-sticky-keys-on-description = Jūs tikko 5 reizes pēc kārtas nospiedāt taustiņu Shift. Tas ir taustiņu fiksācijas īsinājumtaustiņš, un taustiņu fiksācija maina tastatūras darbību.
kbd-a11y-sticky-keys-off-description = Jūs tikko vienlaikus nospiedāt divus taustiņus vai 5 reizes pēc kārtas nospiedāt taustiņu Shift. Tādējādi tiek izslēgta taustiņu fiksācija, kas maina tastatūras darbību.
kbd-a11y-leave-on = Atstāt ieslēgtu
kbd-a11y-turn-on = Ieslēgt
kbd-a11y-turn-off = Izslēgt
kbd-a11y-leave-off = Atstāt izslēgtu

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Izvēlieties audio ierīci
audio-device-cancel = Atcelt
audio-device-sound-settings = Skaņas iestatījumi
audio-device-headphones = Austiņas
audio-device-headset = Austiņas ar mikrofonu
audio-device-microphone = Mikrofons

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Atļaut īsinājumtaustiņu pārtveršanu
inhibit-shortcuts-app = Lietotne { $appName } vēlas pārtvert īsinājumtaustiņus
inhibit-shortcuts-unknown-app = Kāda lietotne vēlas pārtvert īsinājumtaustiņus
inhibit-shortcuts-restore = Īsinājumtaustiņus var atjaunot, nospiežot { $shortcut }
inhibit-shortcuts-deny = Liegt
inhibit-shortcuts-allow = Atļaut

## Administrator authentication

polkit-title = Nepieciešama autentifikācija
polkit-administrator = Administrators
polkit-password = Parole
polkit-cancel = Atcelt
polkit-authenticate = Autentificēt
polkit-failed = Neizdevās. Mēģiniet vēlreiz.

## Unlocking encrypted drives

mount-hidden-volume = Slēpts sējums
mount-windows-system-volume = Windows sistēmas sējums
mount-uses-keyfiles = Izmanto atslēgu failus
mount-keyfiles-use-app = Lai atbloķētu sējumu, kas izmanto atslēgu failus, izmantojiet utilītu <i>{ $appName }</i>
mount-keyfiles-need-app = Lai atbloķētu sējumu, kas izmanto atslēgu failus, vajadzīga ārēja utilīta, piemēram, <i>Diski</i>
mount-pim-number = PIM skaitlis
mount-pim-invalid = PIM jābūt skaitlim vai tukšam
mount-password = Parole
mount-remember-password = Atcerēties paroli
mount-cancel = Atcelt
mount-unlock = Atbloķēt
mount-open-app = Atvērt lietotni { $appName }
mount-wrong-password = Neizdevās. Mēģiniet vēlreiz.
mount-unlock-failed = Neizdevās atbloķēt sējumu
mount-pim-unsupported = Instalētā udisks versija neatbalsta PIM iestatījumu

## Log out, power off and restart dialog

end-session-log-out-user = Izrakstīt: { $userName }
end-session-log-out-title = Izrakstīties
end-session-log-out-user-countdown = { $seconds ->
    [zero] Automātiska izrakstīšanās pēc { $seconds } sekundēm: { $userName }
    [one] Automātiska izrakstīšanās pēc { $seconds } sekundes: { $userName }
   *[other] Automātiska izrakstīšanās pēc { $seconds } sekundēm: { $userName }
}
end-session-log-out-countdown = { $seconds ->
    [zero] Automātiska izrakstīšanās pēc { $seconds } sekundēm
    [one] Automātiska izrakstīšanās pēc { $seconds } sekundes
   *[other] Automātiska izrakstīšanās pēc { $seconds } sekundēm
}
end-session-log-out-button = Izrakstīties
end-session-power-off-title = Izslēgt
end-session-power-off-updates-title = Instalēt atjauninājumus un izslēgt
end-session-power-off-countdown = { $seconds ->
    [zero] Sistēma automātiski izslēgsies pēc { $seconds } sekundēm
    [one] Sistēma automātiski izslēgsies pēc { $seconds } sekundes
   *[other] Sistēma automātiski izslēgsies pēc { $seconds } sekundēm
}
end-session-power-off-button = Izslēgt
end-session-restart-title = Restartēt
end-session-restart-updates-title = Instalēt atjauninājumus un restartēt
end-session-restart-countdown = { $seconds ->
    [zero] Sistēma automātiski restartēsies pēc { $seconds } sekundēm
    [one] Sistēma automātiski restartēsies pēc { $seconds } sekundes
   *[other] Sistēma automātiski restartēsies pēc { $seconds } sekundēm
}
end-session-restart-button = Restartēt
end-session-update-restart-title = Restartēt un instalēt atjauninājumus
end-session-update-restart-countdown = { $seconds ->
    [zero] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundēm
    [one] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundes
   *[other] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundēm
}
end-session-update-restart-button = Restartēt un instalēt
end-session-install-updates = Instalēt gaidošos programmatūras atjauninājumus
end-session-install-version = Instalēt versiju { $version }
end-session-low-battery = Zems akumulatora līmenis: pirms atjauninājumu instalēšanas pievienojiet lādētāju
end-session-busy-apps = Dažas lietotnes ir aizņemtas vai tajās ir nesaglabāts darbs
end-session-other-users = Ir pierakstījušies citi lietotāji
end-session-cancel = Atcelt
end-session-boot-options = Sāknēšanas opcijas
end-session-remote-user = { $userName } (attālināti)
end-session-console-user = { $userName } (konsole)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Nepieciešama autentifikācija
network-agent-wifi-rejected = Saglabātā tīkla „{ $networkName }“ parole neder. Ievadiet to vēlreiz.
network-agent-wifi-secrets = Lai piekļūtu bezvadu tīklam „{ $networkName }“, vajadzīgas paroles vai šifrēšanas atslēgas
network-agent-wps-hint = Varat arī izveidot savienojumu, nospiežot maršrutētāja pogu „WPS“
network-agent-wired-title = Vadu tīkla 802.1X autentifikācija
network-agent-dsl-title = DSL autentifikācija
network-agent-pin-title = Nepieciešams PIN kods
network-agent-pin-body = Mobilā platjoslas tīkla ierīcei vajadzīgs PIN kods
network-agent-vpn-title = VPN parole
network-agent-password-required = Lai izveidotu savienojumu ar „{ $networkName }“, vajadzīga parole
network-agent-connect = Izveidot savienojumu
network-agent-cancel = Atcelt
network-agent-password = Parole
network-agent-username = Lietotājvārds
network-agent-key = Atslēga
network-agent-private-key-password = Privātās atslēgas parole
network-agent-identity = Identitāte
network-agent-service = Pakalpojums
network-agent-network-name = Tīkla nosaukums
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Pavelciet uz augšu
lock-clock-click-or-press = Noklikšķiniet vai nospiediet taustiņu

## Notification times

date-just-now = Tikko

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Logi
ctrl-alt-tab-panel = Uzdevumjosla
ctrl-alt-tab-unlock = Atbloķēšanas logs

## System notifications

messages-system-source = Sistēma
unsafe-mode-title = Sistēma pārslēgta nedrošā režīmā
unsafe-mode-body = Lietotnēm tagad ir neierobežota piekļuve
unsafe-mode-undo = Atsaukt
privileged-user-title = Pierakstīšanās kā priviliģētam lietotājam
privileged-user-body = Drošības dēļ sesiju nevajadzētu izmantot kā priviliģētam lietotājam. Ja iespējams, pierakstieties kā parasts lietotājs.

## On-screen keyboard

osk-keyboard-settings = Tastatūras iestatījumi
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel jābloķē ekrāns

## Notifications

messages-unknown-app = Nezināma lietotne
messages-reply = Atbildēt
messages-reply-placeholder = Rakstiet atbildi
messages-reply-send = Sūtīt

## Media player controls

mpris-unknown-artist = Nezināms izpildītājs
mpris-unknown-title = Nezināms nosaukums

## Starting programs

spawn-failed = Neizdevās izpildīt „{ $command }“:

## Text field context menu

entry-menu-copy = Kopēt
entry-menu-paste = Ielīmēt
entry-menu-show-text = Rādīt tekstu
entry-menu-hide-text = Slēpt tekstu
entry-caps-lock-on = Caps Lock ir ieslēgts

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Uzņemt ekrānuzņēmumu
title-bar-menu-hide = Paslēpt
title-bar-menu-restore = Atjaunot
title-bar-menu-maximize = Maksimizēt
title-bar-menu-move = Pārvietot
title-bar-menu-resize = Mainīt izmēru
title-bar-menu-always-on-top = Vienmēr virspusē
title-bar-menu-always-on-visible-workspace = Vienmēr redzamajā darbvietā
title-bar-menu-workspace-left = Pārvietot uz darbvietu pa kreisi
title-bar-menu-workspace-right = Pārvietot uz darbvietu pa labi
title-bar-menu-workspace-up = Pārvietot uz darbvietu augšā
title-bar-menu-workspace-down = Pārvietot uz darbvietu lejā
title-bar-menu-monitor-up = Pārvietot uz displeju augšā
title-bar-menu-monitor-down = Pārvietot uz displeju lejā
title-bar-menu-monitor-left = Pārvietot uz displeju pa kreisi
title-bar-menu-monitor-right = Pārvietot uz displeju pa labi
title-bar-menu-close = Aizvērt

## Screenshots and screen recording

screenshot-source = Ekrāna uzņemšana
screenshot-area = Apgabala atlase
screenshot-screen = Ekrāna atlase
screenshot-window = Loga atlase
screenshot-take = Uzņemt ekrānuzņēmumu
screenshot-record = Ierakstīt ekrānu
screenshot-show-pointer = Rādīt rādītāju
screenshot-capture = Uzņemt
screenshot-close = Aizvērt
screenshot-screencasts-folder = Ekrāna ieraksti
screenshot-screencast-file = Ekrāna ieraksts { $date } { $time }
screenshot-screenshots-folder = Ekrānuzņēmumi
screenshot-file = Ekrānuzņēmums { $timestamp }
screenshot-screencast-recorded = Ekrāna ieraksts saglabāts
screenshot-screencast-start-failed = Neizdevās sākt ekrāna ierakstu
screenshot-screencast-out-of-space = Ekrāna ieraksts neizdevās: diskā nav vietas
screenshot-screencast-try-again = Ekrāna ieraksts neizdevās. Mēģiniet vēlreiz
screenshot-screencast-failed = Ekrāna ieraksts neizdevās
screenshot-screencast-view = Noklikšķiniet, lai skatītu video
screenshot-show-in-rover = Rādīt lietotnē Rover
screenshot-captured = Ekrānuzņēmums uzņemts
screenshot-captured-body = Attēlu var ielīmēt no starpliktuves
