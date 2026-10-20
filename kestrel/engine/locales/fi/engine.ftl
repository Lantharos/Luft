## Quick settings tiles

auto-rotate-title = Automaattinen kierto
dark-style-title = Tumma tila
do-not-disturb-title = Älä häiritse
night-light-title = Yövalo
airplane-mode-title = Lentokonetila

## Power mode

power-profile-title = Virtatila
power-profile-header = Virtatila
power-profile-open-menu = Avaa virtatilavalikko
power-profile-settings = Virta-asetukset
power-profile-performance = Suorituskyky
power-profile-balanced = Tasapainotettu
power-profile-power-saver = Virransäästö
power-profile-custom = Mukautettu

## Keep awake

caffeine-title = Pidä hereillä
caffeine-open-menu = Avaa Pidä hereillä -valikko
caffeine-until = { $time } asti
caffeine-until-turned-off = Kunnes poistetaan käytöstä
caffeine-30-minutes = 30 minuuttia
caffeine-1-hour = 1 tunti
caffeine-2-hours = 2 tuntia
caffeine-inhibit-reason = Pidetty hereillä pika-asetuksista

## Brightness

brightness-title = Kirkkaus
brightness-open-menu = Avaa kirkkausvalikko

## Keyboard backlight

backlight-title = Näppäimistön taustavalo
backlight-open-menu = Avaa näppäimistön kirkkausvalikko
backlight-slider = Näppäimistön kirkkaus
backlight-off = Pois
backlight-low = Matala
backlight-high = Korkea

## Sound

volume-sound-settings = Ääniasetukset
volume-mute = Mykistä
volume-unmute = Poista mykistys
volume-output-slider = Äänenvoimakkuus
volume-output-title = Äänen ulostulo
volume-output-open-menu = Avaa äänen ulostulon valikko
volume-input-slider = Mikrofoni
volume-input-title = Äänen sisääntulo
volume-input-open-menu = Avaa äänen sisääntulon valikko

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Avaa Bluetooth-valikko
bluetooth-settings = Bluetooth-asetukset
bluetooth-connect = Yhdistä
bluetooth-disconnect = Katkaise yhteys
bluetooth-connect-device = Yhdistä laitteeseen { $deviceName }
bluetooth-disconnect-device = Katkaise yhteys laitteeseen { $deviceName }
bluetooth-no-devices = Ei käytettävissä olevia tai yhdistettyjä laitteita
bluetooth-turn-on-hint = Kytke Bluetooth päälle, niin voit yhdistää laitteisiin
bluetooth-connected-count = { $count ->
    [one] { $count } yhdistetty
   *[other] { $count } yhdistettyä
}

## Network menus in quick settings

network-menu-unknown-network = <tuntematon>
network-menu-connect = Yhdistä
network-menu-disconnect = Katkaise yhteys
network-menu-connect-to = Yhdistä: { $name }
network-menu-disconnect-from = Katkaise yhteys: { $name }
network-menu-turn-off = Kytke pois
network-menu-wifi-network = { $secure ->
    [yes] { $name }, suojattu, signaalin voimakkuus { $strength } %
   *[no] { $name }, ei suojattu, signaalin voimakkuus { $strength } %
}
network-menu-hotspot = { $name } -yhteyspiste
network-menu-connected-count = { $count ->
    [one] { $count } yhdistetty
   *[other] { $count } yhdistettyä
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = Avaa VPN-valikko
network-menu-vpn-settings = VPN-asetukset
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Avaa Wi-Fi-valikko
network-menu-wifi-settings = Kaikki verkot
network-menu-wired = Kiinteät yhteydet
network-menu-wired-open-menu = Avaa kiinteiden yhteyksien valikko
network-menu-wired-settings = Kiinteän verkon asetukset
network-menu-tethers = Bluetooth-jakoyhteydet
network-menu-tethers-open-menu = Avaa Bluetooth-jakoyhteyksien valikko
network-menu-tether = Jakoyhteys
network-menu-tether-settings = Bluetooth-asetukset
network-menu-mobile-connections = Mobiiliyhteydet
network-menu-mobile-open-menu = Avaa mobiiliyhteyksien valikko
network-menu-mobile-settings = Mobiililaajakaistan asetukset
network-menu-mobile = Mobiiliverkko
network-device-wired = Kiinteä
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Kirjaudu verkkoon
network-menu-failed-title = Yhteys epäonnistui
network-menu-failed-body = Verkkoyhteyttä ei voitu muodostaa

## Location access dialog

location-dialog-title = Salli sijainnin käyttö
location-dialog-description = Sovellus { $appName } haluaa käyttää sijaintiasi
location-dialog-info = Sijainnin käyttöoikeutta voi muuttaa milloin tahansa tietosuoja-asetuksista
location-dialog-deny = Estä
location-dialog-grant = Salli

## Thunderbolt notifications

thunderbolt-unknown-title = Tuntematon Thunderbolt-laite
thunderbolt-unknown-body = Uusi laite liitettiin, kun olit poissa. Irrota se ja liitä uudelleen, niin voit käyttää sitä.
thunderbolt-unauthorized-title = Hyväksymätön Thunderbolt-laite
thunderbolt-unauthorized-body = Uusi laite liitettiin, ja se tarvitsee järjestelmänvalvojan hyväksynnän
thunderbolt-error-title = Thunderbolt-laitteen hyväksyntä epäonnistui
thunderbolt-error-body = Thunderbolt-laitetta ei voitu hyväksyä: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Estä
access-dialog-allow = Salli

## Display change confirmation

display-change-title = Säilytetäänkö näyttöasetukset?
display-change-countdown = { $seconds ->
    [one] Muutokset perutaan { $seconds } sekunnin kuluttua
   *[other] Muutokset perutaan { $seconds } sekunnin kuluttua
}
display-change-revert = Palauta asetukset
display-change-keep = Säilytä muutokset

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = ”{ $appName }” ei vastaa
close-dialog-description = Voit odottaa hetken, jatkaako se toimintaansa, tai pakottaa sovelluksen sulkeutumaan
close-dialog-force-quit = Pakota lopetus
close-dialog-wait = Odota

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Monista
switch-monitor-join = Laajenna
switch-monitor-external-only = Vain ulkoinen
switch-monitor-built-in-only = Vain sisäinen

## Sign-in prompt

auth-prompt-password = Salasana
auth-prompt-username = Käyttäjänimi
auth-prompt-back = Takaisin
auth-prompt-submit = Lähetä
auth-prompt-wrong-password = Salasana ei kelvannut
auth-prompt-failed = Se ei onnistunut. Yritä uudelleen.
fingerprint-not-recognized = Sormenjälkeä ei tunnistettu

## Drive connected notification

autorun-connected = ”{ $driveName }” liitetty
autorun-ready = Levy on nyt käytettävissä
autorun-open-with = Avaa { $appName } -sovelluksella

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Hitaat näppäimet otettu käyttöön
kbd-a11y-slow-keys-off = Hitaat näppäimet poistettu käytöstä
kbd-a11y-slow-keys-description = Pidit juuri Vaihto-näppäintä painettuna 8 sekuntia. Se on Hitaat näppäimet -toiminnon pikanäppäin, ja toiminto muuttaa näppäimistön toimintaa.
kbd-a11y-sticky-keys-on = Alas jäävät näppäimet otettu käyttöön
kbd-a11y-sticky-keys-off = Alas jäävät näppäimet poistettu käytöstä
kbd-a11y-sticky-keys-on-description = Painoit juuri Vaihto-näppäintä 5 kertaa peräkkäin. Se on Alas jäävät näppäimet -toiminnon pikanäppäin, ja toiminto muuttaa näppäimistön toimintaa.
kbd-a11y-sticky-keys-off-description = Painoit juuri kahta näppäintä yhtä aikaa tai Vaihto-näppäintä 5 kertaa peräkkäin. Se poistaa käytöstä Alas jäävät näppäimet -toiminnon, joka muuttaa näppäimistön toimintaa.
kbd-a11y-leave-on = Pidä käytössä
kbd-a11y-turn-on = Ota käyttöön
kbd-a11y-turn-off = Poista käytöstä
kbd-a11y-leave-off = Pidä pois käytöstä

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Valitse äänilaite
audio-device-cancel = Peruuta
audio-device-sound-settings = Ääniasetukset
audio-device-headphones = Kuulokkeet
audio-device-headset = Kuulokemikrofoni
audio-device-microphone = Mikrofoni

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Salli pikanäppäinten ohitus
inhibit-shortcuts-app = Sovellus { $appName } haluaa ohittaa järjestelmän pikanäppäimet
inhibit-shortcuts-unknown-app = Sovellus haluaa ohittaa järjestelmän pikanäppäimet
inhibit-shortcuts-restore = Voit palauttaa pikanäppäimet painamalla { $shortcut }
inhibit-shortcuts-deny = Estä
inhibit-shortcuts-allow = Salli

## Administrator authentication

polkit-title = Tunnistautuminen vaaditaan
polkit-administrator = Järjestelmänvalvoja
polkit-password = Salasana
polkit-cancel = Peruuta
polkit-authenticate = Tunnistaudu
polkit-failed = Se ei onnistunut. Yritä uudelleen.

## Unlocking encrypted drives

mount-hidden-volume = Piilotettu taltio
mount-windows-system-volume = Windowsin järjestelmätaltio
mount-uses-keyfiles = Käyttää avaintiedostoja
mount-keyfiles-use-app = Avaa avaintiedostoja käyttävän taltion lukitus <i>{ $appName }</i> -sovelluksella
mount-keyfiles-need-app = Avaintiedostoja käyttävän taltion lukituksen avaamiseen tarvitaan erillinen työkalu, kuten <i>Levyt</i>
mount-pim-number = PIM-luku
mount-pim-invalid = PIM:n on oltava luku tai tyhjä
mount-password = Salasana
mount-remember-password = Muista salasana
mount-cancel = Peruuta
mount-unlock = Avaa lukitus
mount-open-app = Avaa { $appName }
mount-wrong-password = Se ei onnistunut. Yritä uudelleen.
mount-unlock-failed = Taltion lukitusta ei voitu avata
mount-pim-unsupported = Asennettu udisks-versio ei tue PIM-asetusta

## Log out, power off and restart dialog

end-session-log-out-user = Kirjaa { $userName } ulos
end-session-log-out-title = Kirjaudu ulos
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
   *[other] { $userName } kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
}
end-session-log-out-countdown = { $seconds ->
    [one] Sinut kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
   *[other] Sinut kirjataan ulos automaattisesti { $seconds } sekunnin kuluttua
}
end-session-log-out-button = Kirjaudu ulos
end-session-power-off-title = Sammuta
end-session-power-off-updates-title = Asenna päivitykset ja sammuta
end-session-power-off-countdown = { $seconds ->
    [one] Järjestelmä sammuu automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä sammuu automaattisesti { $seconds } sekunnin kuluttua
}
end-session-power-off-button = Sammuta
end-session-restart-title = Käynnistä uudelleen
end-session-restart-updates-title = Asenna päivitykset ja käynnistä uudelleen
end-session-restart-countdown = { $seconds ->
    [one] Järjestelmä käynnistyy uudelleen automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä käynnistyy uudelleen automaattisesti { $seconds } sekunnin kuluttua
}
end-session-restart-button = Käynnistä uudelleen
end-session-update-restart-title = Käynnistä uudelleen ja asenna päivitykset
end-session-update-restart-countdown = { $seconds ->
    [one] Järjestelmä käynnistyy uudelleen ja asentaa päivitykset automaattisesti { $seconds } sekunnin kuluttua
   *[other] Järjestelmä käynnistyy uudelleen ja asentaa päivitykset automaattisesti { $seconds } sekunnin kuluttua
}
end-session-update-restart-button = Käynnistä ja asenna
end-session-install-updates = Asenna odottavat päivitykset
end-session-install-version = Asenna versio { $version }
end-session-low-battery = Akun varaus on vähissä: kytke laturi ennen päivitysten asentamista
end-session-busy-apps = Jotkin sovellukset ovat kesken tai niissä on tallentamatonta työtä
end-session-other-users = Muita käyttäjiä on kirjautuneena
end-session-cancel = Peruuta
end-session-boot-options = Käynnistysvalinnat
end-session-remote-user = { $userName } (etä)
end-session-console-user = { $userName } (konsoli)

## Network passwords, asked when connecting needs one

network-agent-auth-required = Tunnistautuminen vaaditaan
network-agent-wifi-rejected = Verkon ”{ $networkName }” tallennettu salasana ei toiminut. Kirjoita se uudelleen.
network-agent-wifi-secrets = Langattoman verkon ”{ $networkName }” käyttöön tarvitaan salasana tai salausavain
network-agent-wps-hint = Voit myös yhdistää painamalla reitittimen WPS-painiketta
network-agent-wired-title = Kiinteän verkon 802.1X-tunnistautuminen
network-agent-dsl-title = DSL-tunnistautuminen
network-agent-pin-title = PIN-koodi vaaditaan
network-agent-pin-body = Mobiililaajakaistalaite tarvitsee PIN-koodin
network-agent-vpn-title = VPN-salasana
network-agent-password-required = Yhteyden ”{ $networkName }” muodostamiseen tarvitaan salasana
network-agent-connect = Yhdistä
network-agent-cancel = Peruuta
network-agent-password = Salasana
network-agent-username = Käyttäjänimi
network-agent-key = Avain
network-agent-private-key-password = Yksityisen avaimen salasana
network-agent-identity = Identiteetti
network-agent-service = Palvelu
network-agent-network-name = Verkon nimi
network-agent-pin = PIN

## Lock screen clock

lock-clock-swipe-up = Pyyhkäise ylös
lock-clock-click-or-press = Napsauta tai paina näppäintä

## Notification times

date-just-now = Juuri nyt

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Ikkunat
ctrl-alt-tab-panel = Tehtäväpalkki
ctrl-alt-tab-unlock = Lukituksen avaus

## System notifications

messages-system-source = Järjestelmä
unsafe-mode-title = Järjestelmä on asetettu vaaralliseen tilaan
unsafe-mode-body = Sovelluksilla on nyt rajoittamaton käyttöoikeus
unsafe-mode-undo = Kumoa
privileged-user-title = Kirjauduttu sisään pääkäyttäjänä
privileged-user-body = Istunnon käyttämistä pääkäyttäjänä kannattaa välttää tietoturvasyistä. Kirjaudu mieluummin sisään tavallisena käyttäjänä.

## On-screen keyboard

osk-keyboard-settings = Näppäimistöasetukset
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrelin täytyy lukita näyttö

## Notifications

messages-unknown-app = Tuntematon sovellus
messages-reply = Vastaa
messages-reply-placeholder = Kirjoita vastaus
messages-reply-send = Lähetä

## Media player controls

mpris-unknown-artist = Tuntematon esittäjä
mpris-unknown-title = Tuntematon nimi

## Starting programs

spawn-failed = Komennon ”{ $command }” suorittaminen epäonnistui:

## Text field context menu

entry-menu-copy = Kopioi
entry-menu-paste = Liitä
entry-menu-show-text = Näytä teksti
entry-menu-hide-text = Piilota teksti
entry-caps-lock-on = Caps Lock on päällä

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ota kuvakaappaus
title-bar-menu-hide = Pienennä
title-bar-menu-restore = Palauta
title-bar-menu-maximize = Suurenna
title-bar-menu-move = Siirrä
title-bar-menu-resize = Muuta kokoa
title-bar-menu-always-on-top = Aina päällimmäisenä
title-bar-menu-always-on-visible-workspace = Aina näkyvässä työtilassa
title-bar-menu-workspace-left = Siirrä vasemmanpuoleiseen työtilaan
title-bar-menu-workspace-right = Siirrä oikeanpuoleiseen työtilaan
title-bar-menu-workspace-up = Siirrä yläpuoliseen työtilaan
title-bar-menu-workspace-down = Siirrä alapuoliseen työtilaan
title-bar-menu-monitor-up = Siirrä yläpuoliseen näyttöön
title-bar-menu-monitor-down = Siirrä alapuoliseen näyttöön
title-bar-menu-monitor-left = Siirrä vasemmanpuoleiseen näyttöön
title-bar-menu-monitor-right = Siirrä oikeanpuoleiseen näyttöön
title-bar-menu-close = Sulje

## Screenshots and screen recording

screenshot-source = Näytönkaappaus
screenshot-area = Alueen valinta
screenshot-screen = Näytön valinta
screenshot-window = Ikkunan valinta
screenshot-take = Ota kuvakaappaus
screenshot-record = Tallenna näyttö
screenshot-show-pointer = Näytä osoitin
screenshot-capture = Kaappaa
screenshot-close = Sulje
screenshot-screencasts-folder = Näyttötallenteet
screenshot-screencast-file = Näyttötallenne { $date } { $time }
screenshot-screenshots-folder = Kuvakaappaukset
screenshot-file = Kuvakaappaus { $timestamp }
screenshot-screencast-recorded = Näyttötallenne tallennettu
screenshot-screencast-start-failed = Näytön tallennusta ei voitu aloittaa
screenshot-screencast-out-of-space = Näytön tallennus epäonnistui: levytila loppui
screenshot-screencast-try-again = Näytön tallennus epäonnistui. Yritä uudelleen.
screenshot-screencast-failed = Näytön tallennus epäonnistui
screenshot-screencast-view = Katso video napsauttamalla tästä
screenshot-show-in-rover = Näytä Roverissa
screenshot-captured = Kuvakaappaus otettu
screenshot-captured-body = Voit liittää kuvan leikepöydältä
