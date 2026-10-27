## Quick settings tiles

auto-rotate-title = Uathrothlú
dark-style-title = Stíl dhorcha
do-not-disturb-title = Ná cuir isteach orm
night-light-title = Solas oíche
airplane-mode-title = Mód eitleáin

## Power mode

power-profile-title = Mód cumhachta
power-profile-header = Mód cumhachta
power-profile-open-menu = Oscail roghchlár na módanna cumhachta
power-profile-settings = Socruithe cumhachta
power-profile-performance = Feidhmíocht
power-profile-balanced = Cothromaithe
power-profile-power-saver = Coigilteoir cumhachta
power-profile-custom = Saincheaptha

## Keep awake

caffeine-title = Coinnigh múscailte
caffeine-open-menu = Oscail roghchlár Coinnigh múscailte
caffeine-until = Go dtí { $time }
caffeine-until-turned-off = Go dtí go gcasfar as é
caffeine-30-minutes = 30 nóiméad
caffeine-1-hour = 1 uair an chloig
caffeine-2-hours = 2 uair an chloig
caffeine-inhibit-reason = Coinnithe múscailte ó na socruithe tapa

## Brightness

brightness-title = Gile
brightness-open-menu = Oscail roghchlár na gile

## Keyboard backlight

backlight-title = Cúlsolas méarchláir
backlight-open-menu = Oscail roghchlár ghile an mhéarchláir
backlight-slider = Gile an mhéarchláir
backlight-off = As
backlight-low = Íseal
backlight-high = Ard

## Sound

volume-sound-settings = Socruithe fuaime
volume-mute = Balbhaigh
volume-unmute = Díbhalbhaigh
volume-output-slider = Airde
volume-output-title = Aschur fuaime
volume-output-open-menu = Oscail roghchlár an aschuir fuaime
volume-input-slider = Micreafón
volume-input-title = Ionchur fuaime
volume-input-open-menu = Oscail roghchlár an ionchuir fuaime

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Oscail roghchlár Bluetooth
bluetooth-settings = Socruithe Bluetooth
bluetooth-connect = Ceangail
bluetooth-disconnect = Dícheangail
bluetooth-connect-device = Ceangail le { $deviceName }
bluetooth-disconnect-device = Dícheangail { $deviceName }
bluetooth-no-devices = Níl aon ghléas ar fáil ná ceangailte
bluetooth-turn-on-hint = Cas air Bluetooth chun ceangal le gléasanna
bluetooth-connected-count = { $count ->
    [one] { $count } ceangailte
    [two] { $count } ceangailte
    [few] { $count } ceangailte
    [many] { $count } ceangailte
   *[other] { $count } ceangailte
}

## Network menus in quick settings

network-menu-unknown-network = <anaithnid>
network-menu-connect = Ceangail
network-menu-disconnect = Dícheangail
network-menu-connect-to = Ceangail le { $name }
network-menu-disconnect-from = Dícheangail { $name }
network-menu-turn-off = Cas as
network-menu-wifi-network = { $secure ->
    [yes] { $name }, slán, neart an chomhartha { $strength }%
   *[no] { $name }, neamhshlán, neart an chomhartha { $strength }%
}
network-menu-hotspot = { $name } (ball te)
network-menu-connected-count = { $count ->
    [one] { $count } ceangailte
    [two] { $count } ceangailte
    [few] { $count } ceangailte
    [many] { $count } ceangailte
   *[other] { $count } ceangailte
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Oscail roghchlár VPN
network-menu-vpn-settings = Socruithe VPN
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Oscail roghchlár Wi-Fi
network-menu-wifi-settings = Gach líonra
network-menu-wired = Ceangail shreangaithe
network-menu-wired-open-menu = Oscail roghchlár na gceangal sreangaithe
network-menu-wired-settings = Socruithe sreangaithe
network-menu-tethers = Teadráil Bluetooth
network-menu-tethers-open-menu = Oscail roghchlár na teadrála Bluetooth
network-menu-tether = Teadráil
network-menu-tether-settings = Socruithe Bluetooth
network-menu-mobile-connections = Ceangail shoghluaiste
network-menu-mobile-open-menu = Oscail roghchlár na gceangal soghluaiste
network-menu-mobile-settings = Socruithe leathanbhanda shoghluaiste
network-menu-mobile = Soghluaiste
network-device-wired = Sreangach
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Sínigh isteach ar an líonra
network-menu-failed-title = Theip ar an gceangal
network-menu-failed-body = Níorbh fhéidir an ceangal líonra a ghníomhachtú

## Location access dialog

location-dialog-title = Ceadaigh rochtain ar do shuíomh
location-dialog-description = Tá an aip { $appName } ag iarraidh rochtain a fháil ar do shuíomh
location-dialog-info = Is féidir rochtain ar do shuíomh a athrú am ar bith sna socruithe príobháideachais
location-dialog-deny = Diúltaigh
location-dialog-grant = Ceadaigh

## Thunderbolt notifications

thunderbolt-unknown-title = Gléas Thunderbolt anaithnid
thunderbolt-unknown-body = Ceanglaíodh gléas nua fad a bhí tú as láthair. Díphlugáil é agus plugáil isteach arís é chun tosú á úsáid.
thunderbolt-unauthorized-title = Gléas Thunderbolt gan údarú
thunderbolt-unauthorized-body = Ceanglaíodh gléas nua agus teastaíonn cead riarthóra uaidh
thunderbolt-error-title = Earráid údaraithe Thunderbolt
thunderbolt-error-body = Níorbh fhéidir an gléas Thunderbolt a údarú: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Diúltaigh
access-dialog-allow = Ceadaigh

## Display change confirmation

display-change-title = Coinnigh na socruithe seo?
display-change-countdown = { $seconds ->
    [one] Fillfear ar na socruithe roimhe seo i gceann { $seconds } shoicind
    [two] Fillfear ar na socruithe roimhe seo i gceann { $seconds } shoicind
    [few] Fillfear ar na socruithe roimhe seo i gceann { $seconds } shoicind
    [many] Fillfear ar na socruithe roimhe seo i gceann { $seconds } soicind
   *[other] Fillfear ar na socruithe roimhe seo i gceann { $seconds } soicind
}
display-change-revert = Fill ar ais
display-change-keep = Coinnigh

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = Níl “{ $appName }” ag freagairt
close-dialog-description = Is féidir leat fanacht tamall go leanfaidh sé ar aghaidh, nó an aip a scor go hiomlán
close-dialog-force-quit = Fórsáil scor
close-dialog-wait = Fan

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Scáthán
switch-monitor-join = Leathnaigh
switch-monitor-external-only = Seachtrach amháin
switch-monitor-built-in-only = Inmheánach amháin

## Sign-in prompt

auth-prompt-password = Pasfhocal
auth-prompt-username = Ainm úsáideora
auth-prompt-back = Ar ais
auth-prompt-submit = Seol
auth-prompt-wrong-password = Níor oibrigh an pasfhocal sin
auth-prompt-failed = Níor oibrigh sé sin. Bain triail eile as.
fingerprint-not-recognized = Níor aithníodh an méarlorg

## Drive connected notification

autorun-connected = “{ $driveName }” ceangailte
autorun-ready = Is féidir an diosca a úsáid anois
autorun-open-with = Oscail le { $appName }

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Eochracha malla casta air
kbd-a11y-slow-keys-off = Eochracha malla casta as
kbd-a11y-slow-keys-description = Choinnigh tú an eochair Shift síos ar feadh 8 soicind. Seo é an t-aicearra do na heochracha malla, a athraíonn an chaoi a n-oibríonn do mhéarchlár.
kbd-a11y-sticky-keys-on = Eochracha greamaitheacha casta air
kbd-a11y-sticky-keys-off = Eochracha greamaitheacha casta as
kbd-a11y-sticky-keys-on-description = Bhrúigh tú an eochair Shift 5 huaire as a chéile. Seo é an t-aicearra do na heochracha greamaitheacha, a athraíonn an chaoi a n-oibríonn do mhéarchlár.
kbd-a11y-sticky-keys-off-description = Bhrúigh tú dhá eochair ag an am céanna, nó bhrúigh tú an eochair Shift 5 huaire as a chéile. Casann sé seo as na heochracha greamaitheacha, a athraíonn an chaoi a n-oibríonn do mhéarchlár.
kbd-a11y-leave-on = Fág air
kbd-a11y-turn-on = Cas air
kbd-a11y-turn-off = Cas as
kbd-a11y-leave-off = Fág as

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Roghnaigh gléas fuaime
audio-device-cancel = Cealaigh
audio-device-sound-settings = Socruithe fuaime
audio-device-headphones = Cluasáin
audio-device-headset = Cluasán
audio-device-microphone = Micreafón

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Ceadaigh aicearraí a chosc
inhibit-shortcuts-app = Tá an aip { $appName } ag iarraidh aicearraí an chórais a chosc
inhibit-shortcuts-unknown-app = Tá aip ag iarraidh aicearraí an chórais a chosc
inhibit-shortcuts-restore = Is féidir leat na haicearraí a fháil ar ais trí { $shortcut } a bhrú
inhibit-shortcuts-deny = Diúltaigh
inhibit-shortcuts-allow = Ceadaigh

## Administrator authentication

polkit-title = Fíordheimhniú riachtanach
polkit-administrator = Riarthóir
polkit-password = Pasfhocal
polkit-cancel = Cealaigh
polkit-authenticate = Fíordheimhnigh
polkit-failed = Níor oibrigh sé sin. Bain triail eile as.

## Unlocking encrypted drives

mount-hidden-volume = Imleabhar folaithe
mount-windows-system-volume = Imleabhar córais Windows
mount-uses-keyfiles = Úsáideann sé eochairchomhaid
mount-keyfiles-use-app = Chun imleabhar a úsáideann eochairchomhaid a dhíghlasáil, úsáid an uirlis <i>{ $appName }</i> ina ionad
mount-keyfiles-need-app = Teastaíonn uirlis sheachtrach ar nós <i>Dioscaí</i> chun imleabhar a úsáideann eochairchomhaid a dhíghlasáil
mount-pim-number = Uimhir PIM
mount-pim-invalid = Caithfidh an PIM a bheith ina uimhir nó folamh
mount-password = Pasfhocal
mount-remember-password = Cuimhnigh ar an bpasfhocal
mount-cancel = Cealaigh
mount-unlock = Díghlasáil
mount-open-app = Oscail { $appName }
mount-wrong-password = Níor oibrigh sé sin. Bain triail eile as.
mount-unlock-failed = Níorbh fhéidir an t-imleabhar a dhíghlasáil
mount-pim-unsupported = Ní thacaíonn an leagan de udisks atá suiteáilte leis an socrú PIM

## Log out, power off and restart dialog

end-session-log-out-user = Sínigh amach { $userName }
end-session-log-out-title = Sínigh amach
end-session-log-out-user-countdown = { $seconds ->
    [one] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [two] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [few] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [many] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } soicind
   *[other] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } soicind
}
end-session-log-out-countdown = { $seconds ->
    [one] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [two] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [few] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [many] Sínfear amach thú go huathoibríoch i gceann { $seconds } soicind
   *[other] Sínfear amach thú go huathoibríoch i gceann { $seconds } soicind
}
end-session-log-out-button = Sínigh amach
end-session-power-off-title = Múch
end-session-power-off-updates-title = Suiteáil nuashonruithe agus múch
end-session-power-off-countdown = { $seconds ->
    [one] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [two] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [few] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [many] Múchfar an córas go huathoibríoch i gceann { $seconds } soicind
   *[other] Múchfar an córas go huathoibríoch i gceann { $seconds } soicind
}
end-session-power-off-button = Múch
end-session-restart-title = Atosaigh
end-session-restart-updates-title = Suiteáil nuashonruithe agus atosaigh
end-session-restart-countdown = { $seconds ->
    [one] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [two] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [few] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [many] Atosófar an córas go huathoibríoch i gceann { $seconds } soicind
   *[other] Atosófar an córas go huathoibríoch i gceann { $seconds } soicind
}
end-session-restart-button = Atosaigh
end-session-update-restart-title = Atosaigh agus suiteáil nuashonruithe
end-session-update-restart-countdown = { $seconds ->
    [one] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [two] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [few] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [many] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } soicind
   *[other] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } soicind
}
end-session-update-restart-button = Atosaigh agus suiteáil
end-session-install-updates = Suiteáil na nuashonruithe bogearraí atá ag fanacht
end-session-install-version = Suiteáil leagan { $version }
end-session-low-battery = Ceallra íseal: plugáil isteach sula suiteálann tú nuashonruithe
end-session-busy-apps = Tá roinnt aipeanna gnóthach nó tá obair gan sábháil iontu
end-session-other-users = Tá úsáideoirí eile sínithe isteach
end-session-cancel = Cealaigh
end-session-boot-options = Roghanna tosaithe
end-session-remote-user = { $userName } (cian)
end-session-console-user = { $userName } (consól)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Fíordheimhniú riachtanach
network-agent-wifi-rejected = Níor oibrigh an pasfhocal sábháilte do “{ $networkName }”. Cuir isteach arís é.
network-agent-wifi-secrets = Teastaíonn pasfhocail nó eochracha criptithe chun rochtain a fháil ar an líonra gan sreang “{ $networkName }”
network-agent-wps-hint = Nó is féidir leat ceangal tríd an gcnaipe “WPS” ar do ródaire a bhrú
network-agent-wired-title = Fíordheimhniú sreangaithe 802.1X
network-agent-dsl-title = Fíordheimhniú DSL
network-agent-pin-title = UAP riachtanach
network-agent-pin-body = Teastaíonn UAP don ghléas leathanbhanda shoghluaiste
network-agent-vpn-title = Pasfhocal VPN
network-agent-password-required = Teastaíonn pasfhocal chun ceangal le “{ $networkName }”
network-agent-connect = Ceangail
network-agent-cancel = Cealaigh
network-agent-password = Pasfhocal
network-agent-username = Ainm úsáideora
network-agent-key = Eochair
network-agent-private-key-password = Pasfhocal na heochrach príobháidí
network-agent-identity = Aitheantas
network-agent-service = Seirbhís
network-agent-network-name = Ainm an líonra
network-agent-pin = UAP

## Lock screen clock

lock-clock-swipe-up = Scuab suas
lock-clock-click-or-press = Cliceáil nó brúigh eochair

## Notification times

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Fuinneoga
ctrl-alt-tab-panel = Painéal
ctrl-alt-tab-unlock = Fuinneog díghlasála

## System notifications

messages-system-source = Córas
unsafe-mode-title = Cuireadh an córas i mód neamhshábháilte
unsafe-mode-body = Tá rochtain gan srian ag aipeanna anois
unsafe-mode-undo = Cealaigh
privileged-user-title = Sínithe isteach mar úsáideoir pribhléideach
privileged-user-body = Níor cheart seisiún a rith mar úsáideoir pribhléideach ar chúiseanna slándála. Más féidir, sínigh isteach mar ghnáthúsáideoir.

## On-screen keyboard

osk-keyboard-settings = Socruithe méarchláir
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Caithfidh Kestrel an scáileán a ghlasáil

## Notifications

messages-unknown-app = Aip anaithnid
messages-reply = Freagair
messages-reply-placeholder = Scríobh freagra
messages-reply-send = Seol

## Media player controls

mpris-unknown-artist = Ealaíontóir anaithnid
mpris-unknown-title = Teideal anaithnid

## Starting programs

spawn-failed = Theip ar “{ $command }” a rith:

## Text field context menu

entry-menu-copy = Cóipeáil
entry-menu-paste = Greamaigh
entry-menu-show-text = Taispeáin an téacs
entry-menu-hide-text = Folaigh an téacs
entry-caps-lock-on = Tá Caps Lock ar siúl

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Glac gabháil scáileáin
title-bar-menu-hide = Folaigh
title-bar-menu-restore = Athchóirigh
title-bar-menu-maximize = Uasmhéadaigh
title-bar-menu-move = Bog
title-bar-menu-resize = Athraigh an méid
title-bar-menu-always-on-top = I gcónaí ar barr
title-bar-menu-always-on-visible-workspace = I gcónaí ar an spás oibre infheicthe
title-bar-menu-workspace-left = Bog chuig an spás oibre ar chlé
title-bar-menu-workspace-right = Bog chuig an spás oibre ar dheis
title-bar-menu-workspace-up = Bog chuig an spás oibre thuas
title-bar-menu-workspace-down = Bog chuig an spás oibre thíos
title-bar-menu-monitor-up = Bog chuig an scáileán thuas
title-bar-menu-monitor-down = Bog chuig an scáileán thíos
title-bar-menu-monitor-left = Bog chuig an scáileán ar chlé
title-bar-menu-monitor-right = Bog chuig an scáileán ar dheis
title-bar-menu-close = Dún

## Screenshots and screen recording

screenshot-source = Gabháil scáileáin
screenshot-area = Roghnú limistéir
screenshot-screen = Roghnú scáileáin
screenshot-window = Roghnú fuinneoige
screenshot-take = Glac gabháil scáileáin
screenshot-record = Taifead an scáileán
screenshot-show-pointer = Taispeáin an pointeoir
screenshot-capture = Gabh
screenshot-close = Dún
screenshot-screencasts-folder = Taifeadtaí scáileáin
screenshot-screencast-file = Taifeadadh scáileáin { $date } { $time }
screenshot-screenshots-folder = Gabhálacha scáileáin
screenshot-file = Gabháil scáileáin { $timestamp }
screenshot-screencast-recorded = Taifeadadh an scáileán
screenshot-screencast-start-failed = Níor thosaigh an taifeadadh scáileáin
screenshot-screencast-out-of-space = Theip ar an taifeadadh scáileáin: níl spás fágtha ar an diosca
screenshot-screencast-try-again = Theip ar an taifeadadh scáileáin. Bain triail eile as.
screenshot-screencast-failed = Theip ar an taifeadadh scáileáin
screenshot-screencast-view = Cliceáil anseo chun an físeán a fheiceáil
screenshot-show-in-rover = Taispeáin i Rover
screenshot-captured = Gabhadh an scáileán
screenshot-captured-body = Is féidir leat an íomhá a ghreamú ón ngearrthaisce
