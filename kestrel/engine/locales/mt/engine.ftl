## Quick settings tiles

auto-rotate-title = Dawran awtomatiku
dark-style-title = Modalità skura
do-not-disturb-title = Tiddisturbax
night-light-title = Dawl ta’ billejl
airplane-mode-title = Modalità tal-ajruplan

## Power mode

power-profile-title = Modalità tal-enerġija
power-profile-header = Modalità tal-enerġija
power-profile-open-menu = Iftaħ il-menù tal-modalità tal-enerġija
power-profile-settings = Settings tal-enerġija
power-profile-performance = Prestazzjoni
power-profile-balanced = Bilanċjat
power-profile-power-saver = Iffrankar tal-enerġija
power-profile-custom = Personalizzat

## Keep awake

caffeine-title = Żomm mixgħul
caffeine-open-menu = Iftaħ il-menù ta’ Żomm mixgħul
caffeine-until = Sa { $time }
caffeine-until-turned-off = Sakemm jintefa
caffeine-30-minutes = 30 minuta
caffeine-1-hour = Siegħa
caffeine-2-hours = Sagħtejn
caffeine-inhibit-reason = Miżmum mixgħul mis-Settings rapidi

## Brightness

brightness-title = Luminożità
brightness-open-menu = Iftaħ il-menù tal-luminożità

## Keyboard backlight

backlight-title = Dawl tat-tastiera
backlight-open-menu = Iftaħ il-menù tad-dawl tat-tastiera
backlight-slider = Dawl tat-tastiera
backlight-off = Mitfi
backlight-low = Baxx
backlight-high = Għoli

## Sound

volume-sound-settings = Settings tal-ħoss
volume-mute = Itfi l-ħoss
volume-unmute = Ixgħel il-ħoss
volume-output-slider = Volum
volume-output-title = Output tal-ħoss
volume-output-open-menu = Iftaħ il-menù tal-output tal-ħoss
volume-input-slider = Mikrofonu
volume-input-title = Input tal-ħoss
volume-input-open-menu = Iftaħ il-menù tal-input tal-ħoss

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Iftaħ il-menù tal-Bluetooth
bluetooth-settings = Settings tal-Bluetooth
bluetooth-connect = Ikkonnettja
bluetooth-disconnect = Skonnettja
bluetooth-connect-device = Ikkonnettja ma’ { $deviceName }
bluetooth-disconnect-device = Skonnettja { $deviceName }
bluetooth-no-devices = L-ebda apparat disponibbli jew ikkonnettjat
bluetooth-turn-on-hint = Ixgħel il-Bluetooth biex tqabbad apparati
bluetooth-connected-count = { $count ->
    [one] { $count } ikkonnettjat
    [two] { $count } ikkonnettjati
    [few] { $count } ikkonnettjati
    [many] { $count } ikkonnettjat
   *[other] { $count } ikkonnettjat
}

## Network menus in quick settings

network-menu-unknown-network = <mhux magħruf>
network-menu-connect = Ikkonnettja
network-menu-disconnect = Skonnettja
network-menu-connect-to = Ikkonnettja ma’ { $name }
network-menu-disconnect-from = Skonnettja minn { $name }
network-menu-turn-off = Itfi
network-menu-wifi-network = { $secure ->
    [yes] { $name }, sigur, qawwa tas-sinjal { $strength }%
   *[no] { $name }, mhux sigur, qawwa tas-sinjal { $strength }%
}
network-menu-hotspot = Hotspot ta’ { $name }
network-menu-connected-count = { $count ->
    [one] { $count } ikkonnettjat
    [two] { $count } ikkonnettjati
    [few] { $count } ikkonnettjati
    [many] { $count } ikkonnettjat
   *[other] { $count } ikkonnettjat
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Iftaħ il-menù tal-VPN
network-menu-vpn-settings = Settings tal-VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Iftaħ il-menù tal-Wi-Fi
network-menu-wifi-settings = In-netwerks kollha
network-menu-wired = Konnessjonijiet bil-wajer
network-menu-wired-open-menu = Iftaħ il-menù tal-konnessjonijiet bil-wajer
network-menu-wired-settings = Settings bil-wajer
network-menu-tethers = Tethering bil-Bluetooth
network-menu-tethers-open-menu = Iftaħ il-menù tat-tethering bil-Bluetooth
network-menu-tether = Tethering
network-menu-tether-settings = Settings tal-Bluetooth
network-menu-mobile-connections = Konnessjonijiet mobbli
network-menu-mobile-open-menu = Iftaħ il-menù tal-konnessjonijiet mobbli
network-menu-mobile-settings = Settings tal-broadband mobbli
network-menu-mobile = Mobbli
network-menu-sign-in = Idħol fin-netwerk
network-menu-failed-title = Il-konnessjoni falliet
network-menu-failed-body = Il-konnessjoni tan-netwerk ma setgħetx tiġi attivata

## Location access dialog

location-dialog-title = Ippermetti l-aċċess għall-post
location-dialog-description = L-app { $appName } trid taċċessa l-post fejn tinsab
location-dialog-info = Tista’ tibdel l-aċċess għall-post meta trid mis-settings tal-privatezza
location-dialog-deny = Iċħad l-aċċess
location-dialog-grant = Agħti aċċess

## Thunderbolt notifications

thunderbolt-unknown-title = Apparat Thunderbolt mhux magħruf
thunderbolt-unknown-body = Ġie mqabbad apparat ġdid waqt li ma kontx hawn. Aqilgħu u erġa’ qabbdu biex tibda tużah.
thunderbolt-unauthorized-title = Apparat Thunderbolt mhux awtorizzat
thunderbolt-unauthorized-body = Ġie mqabbad apparat ġdid u jeħtieġ l-approvazzjoni ta’ amministratur
thunderbolt-error-title = Żball fl-awtorizzazzjoni tat-Thunderbolt
thunderbolt-error-body = L-apparat Thunderbolt ma setax jiġi awtorizzat: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Iċħad
access-dialog-allow = Ippermetti

## Display change confirmation

display-change-title = Iżżomm dawn is-settings?
display-change-countdown = { $seconds ->
    [one] Il-bidliet jitreġġgħu lura f’{ $seconds } sekonda
    [two] Il-bidliet jitreġġgħu lura f’{ $seconds } sekondi
    [few] Il-bidliet jitreġġgħu lura f’{ $seconds } sekondi
    [many] Il-bidliet jitreġġgħu lura f’{ $seconds } sekonda
   *[other] Il-bidliet jitreġġgħu lura f’{ $seconds } sekonda
}
display-change-revert = Erġa’ lura
display-change-keep = Żomm il-bidliet

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” mhix qed tirrispondi
close-dialog-description = Tista’ tistenna ftit biex tkompli, jew iġġegħel lill-app tingħalaq għal kollox
close-dialog-force-quit = Agħlaq bilfors
close-dialog-wait = Stenna

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Mera
switch-monitor-join = Għaqqad skrins
switch-monitor-external-only = Estern biss
switch-monitor-built-in-only = Intern biss

## Sign-in prompt

auth-prompt-password = Password
auth-prompt-username = Isem tal-utent
auth-prompt-back = Lura
auth-prompt-submit = Ibgħat
auth-prompt-wrong-password = Il-password ma ħadmitx
auth-prompt-failed = Ma ħadimx. Erġa’ pprova.
fingerprint-not-recognized = Il-marka tas-saba’ ma ntgħarfitx

## Drive connected notification

autorun-connected = “{ $driveName }” imqabbad
autorun-ready = Id-diska issa tista’ tintuża
autorun-open-with = Iftaħ b’{ $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Tasti bil-mod mixgħula
kbd-a11y-slow-keys-off = Tasti bil-mod mitfija
kbd-a11y-slow-keys-description = Għadek kif żammejt it-tast Shift magħfus għal 8 sekondi. Dan huwa l-shortcut għal Tasti bil-mod, li jibdel kif taħdem it-tastiera.
kbd-a11y-sticky-keys-on = Tasti permanenti mixgħula
kbd-a11y-sticky-keys-off = Tasti permanenti mitfija
kbd-a11y-sticky-keys-on-description = Għadek kif għafast it-tast Shift 5 darbiet wara xulxin. Dan huwa l-shortcut għal Tasti permanenti, li jibdel kif taħdem it-tastiera.
kbd-a11y-sticky-keys-off-description = Għadek kif għafast żewġ tasti flimkien, jew it-tast Shift 5 darbiet wara xulxin. Dan jitfi Tasti permanenti, li jibdel kif taħdem it-tastiera.
kbd-a11y-leave-on = Ħallih mixgħul
kbd-a11y-turn-on = Ixgħel
kbd-a11y-turn-off = Itfi
kbd-a11y-leave-off = Ħallih mitfi

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Agħżel apparat tal-awdjo
audio-device-cancel = Ikkanċella
audio-device-sound-settings = Settings tal-ħoss
audio-device-headphones = Headphones
audio-device-headset = Headset
audio-device-microphone = Mikrofonu

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Ippermetti li jinqabdu s-shortcuts
inhibit-shortcuts-app = L-app { $appName } trid taqbad is-shortcuts tas-sistema
inhibit-shortcuts-unknown-app = App trid taqbad is-shortcuts tas-sistema
inhibit-shortcuts-restore = Tista’ terġa’ tixgħel is-shortcuts billi tagħfas { $shortcut }
inhibit-shortcuts-deny = Iċħad
inhibit-shortcuts-allow = Ippermetti

## Administrator authentication

polkit-title = Hija meħtieġa l-awtentikazzjoni
polkit-administrator = Amministratur
polkit-password = Password
polkit-cancel = Ikkanċella
polkit-authenticate = Awtentika
polkit-failed = Ma ħadimx. Erġa’ pprova.

## Unlocking encrypted drives

mount-hidden-volume = Volum moħbi
mount-windows-system-volume = Volum tas-sistema ta’ Windows
mount-uses-keyfiles = Juża keyfiles
mount-keyfiles-use-app = Biex tiżblokka volum li juża keyfiles, uża <i>{ $appName }</i> minflok
mount-keyfiles-need-app = Biex tiżblokka volum li juża keyfiles, għandek bżonn utility esterna bħal <i>Diski</i>
mount-pim-number = Numru PIM
mount-pim-invalid = Il-PIM irid ikun numru jew vojt
mount-password = Password
mount-remember-password = Ftakar il-password
mount-cancel = Ikkanċella
mount-unlock = Żblokka
mount-open-app = Iftaħ { $appName }
mount-wrong-password = Ma ħadimx. Erġa’ pprova.
mount-unlock-failed = Il-volum ma setax jiġi żblokkat
mount-pim-unsupported = Il-verżjoni installata ta’ udisks ma tappoġġjax is-setting PIM

## Log out, power off and restart dialog

end-session-log-out-user = Oħroġ lil { $userName }
end-session-log-out-title = Oħroġ
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
    [two] { $userName } joħroġ awtomatikament f’{ $seconds } sekondi
    [few] { $userName } joħroġ awtomatikament f’{ $seconds } sekondi
    [many] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
   *[other] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
}
end-session-log-out-countdown = { $seconds ->
    [one] Toħroġ awtomatikament f’{ $seconds } sekonda
    [two] Toħroġ awtomatikament f’{ $seconds } sekondi
    [few] Toħroġ awtomatikament f’{ $seconds } sekondi
    [many] Toħroġ awtomatikament f’{ $seconds } sekonda
   *[other] Toħroġ awtomatikament f’{ $seconds } sekonda
}
end-session-log-out-button = Oħroġ
end-session-power-off-title = Itfi
end-session-power-off-updates-title = Installa l-aġġornamenti u itfi
end-session-power-off-countdown = { $seconds ->
    [one] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
}
end-session-power-off-button = Itfi
end-session-restart-title = Irristartja
end-session-restart-updates-title = Installa l-aġġornamenti u irristartja
end-session-restart-countdown = { $seconds ->
    [one] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
}
end-session-restart-button = Irristartja
end-session-update-restart-title = Irristartja u installa l-aġġornamenti
end-session-update-restart-countdown = { $seconds ->
    [one] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
}
end-session-update-restart-button = Irristartja u installa
end-session-install-updates = Installa l-aġġornamenti pendenti
end-session-install-version = Installa l-verżjoni { $version }
end-session-low-battery = Il-batterija baxxa: qabbad mal-elettriku qabel ma tinstalla l-aġġornamenti
end-session-busy-apps = Xi apps għadhom qed jaħdmu jew għandhom xogħol mhux issejvjat
end-session-other-users = Hemm utenti oħra li daħlu
end-session-cancel = Ikkanċella
end-session-boot-options = Għażliet tal-boot
end-session-remote-user = { $userName } (mill-bogħod)
end-session-console-user = { $userName } (konsola)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Hija meħtieġa l-awtentikazzjoni
network-agent-wifi-rejected = Il-password issejvjata għal “{ $networkName }” ma ħadmitx. Erġa’ daħħalha.
network-agent-wifi-secrets = Biex tidħol fin-netwerk mingħajr fili “{ $networkName }” huma meħtieġa passwords jew ċwievet taċ-ċċifrar
network-agent-wps-hint = Tista’ wkoll tikkonnettja billi tagħfas il-buttuna “WPS” fuq ir-router
network-agent-wired-title = Awtentikazzjoni 802.1X bil-wajer
network-agent-dsl-title = Awtentikazzjoni DSL
network-agent-pin-title = Huwa meħtieġ il-PIN
network-agent-pin-body = L-apparat tal-broadband mobbli jeħtieġ PIN
network-agent-vpn-title = Password tal-VPN
network-agent-password-required = Biex tikkonnettja ma’ “{ $networkName }” hija meħtieġa password
network-agent-connect = Ikkonnettja
network-agent-cancel = Ikkanċella
network-agent-password = Password
network-agent-username = Isem tal-utent
network-agent-key = Ċavetta
network-agent-private-key-password = Password taċ-ċavetta privata
network-agent-identity = Identità
network-agent-service = Servizz
network-agent-network-name = Isem tan-netwerk
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Swajpja ’l fuq
lock-clock-click-or-press = Ikklikkja jew agħfas tast

## Notification times

date-just-now = Issa stess

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Twieqi
ctrl-alt-tab-panel = Taskbar
ctrl-alt-tab-unlock = Tieqa tal-iżblokkar

## System notifications

messages-system-source = Sistema
unsafe-mode-title = Is-sistema tqiegħdet f’modalità mhux sigura
unsafe-mode-body = L-apps issa għandhom aċċess mingħajr restrizzjonijiet
unsafe-mode-undo = Erġa’ lura
privileged-user-title = Dħalt bħala utent privileġġat
privileged-user-body = Għal raġunijiet ta’ sigurtà, evita li tuża sessjoni bħala utent privileġġat. Jekk tista’, idħol bħala utent normali.

## On-screen keyboard

osk-keyboard-settings = Settings tat-tastiera
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel irid isakkar l-iskrin

## Notifications

messages-unknown-app = App mhux magħrufa
messages-reply = Wieġeb
messages-reply-placeholder = Ikteb tweġiba
messages-reply-send = Ibgħat

## Media player controls

mpris-unknown-artist = Artist mhux magħruf
mpris-unknown-title = Titlu mhux magħruf

## Starting programs

spawn-failed = Ma setax jitħaddem “{ $command }”:

## Text field context menu

entry-menu-copy = Ikkopja
entry-menu-paste = Ippejstja
entry-menu-show-text = Uri t-test
entry-menu-hide-text = Aħbi t-test
entry-caps-lock-on = Caps Lock mixgħul

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ħu screenshot
title-bar-menu-hide = Aħbi
title-bar-menu-restore = Irrestawra
title-bar-menu-maximize = Immassimizza
title-bar-menu-move = Ċaqlaq
title-bar-menu-resize = Ibdel id-daqs
title-bar-menu-always-on-top = Dejjem fuq kollox
title-bar-menu-always-on-visible-workspace = Dejjem fuq l-ispazju tax-xogħol viżibbli
title-bar-menu-workspace-left = Ressaq lejn l-ispazju tax-xogħol fuq ix-xellug
title-bar-menu-workspace-right = Ressaq lejn l-ispazju tax-xogħol fuq il-lemin
title-bar-menu-workspace-up = Ressaq lejn l-ispazju tax-xogħol ta’ fuq
title-bar-menu-workspace-down = Ressaq lejn l-ispazju tax-xogħol ta’ taħt
title-bar-menu-monitor-up = Ressaq lejn l-iskrin ta’ fuq
title-bar-menu-monitor-down = Ressaq lejn l-iskrin ta’ taħt
title-bar-menu-monitor-left = Ressaq lejn l-iskrin fuq ix-xellug
title-bar-menu-monitor-right = Ressaq lejn l-iskrin fuq il-lemin
title-bar-menu-close = Agħlaq

## Screenshots and screen recording

screenshot-source = Qbid tal-iskrin
screenshot-area = Għażla ta’ żona
screenshot-screen = Għażla ta’ skrin
screenshot-window = Għażla ta’ tieqa
screenshot-take = Ħu screenshot
screenshot-record = Irrekordja l-iskrin
screenshot-show-pointer = Uri l-pointer
screenshot-capture = Aqbad
screenshot-close = Agħlaq
screenshot-screencasts-folder = Rekordjar tal-iskrin
screenshot-screencast-file = Rekordjar tal-iskrin { $date } { $time }
screenshot-screenshots-folder = Screenshots
screenshot-file = Screenshot { $timestamp }
screenshot-screencast-recorded = Ir-rekordjar tal-iskrin ġie ssejvjat
screenshot-screencast-start-failed = Ir-rekordjar tal-iskrin ma setax jibda
screenshot-screencast-out-of-space = Ir-rekordjar tal-iskrin waqaf: m’hemmx biżżejjed spazju fuq id-diska
screenshot-screencast-try-again = Ir-rekordjar tal-iskrin falla. Erġa’ pprova.
screenshot-screencast-failed = Ir-rekordjar tal-iskrin falla
screenshot-screencast-view = Ikklikkja hawn biex tara l-vidjo
screenshot-show-in-rover = Uri f’Rover
screenshot-captured = Screenshot meħud
screenshot-captured-body = Tista’ tippejstja l-istampa mill-klibbord
