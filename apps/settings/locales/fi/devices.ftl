## Displays

settings-display-mirror = Peilaa näytöt
settings-display-mirror-description = Näyttää saman kuvan kaikissa näytöissä
settings-display-mirrored = Peilatut näytöt
settings-display-display = Näyttö
settings-display-apply-failed = Nämä asetukset eivät toimineet. Kokeile toisenlaisia asetuksia.
settings-display-reset = Palauta
settings-display-apply = Käytä
settings-display-arrangement-main = { $name }, päänäyttö
settings-display-use = Käytä tätä näyttöä
settings-display-main = Päänäyttö
settings-display-main-description = Tehtäväpalkki ja uudet ikkunat näkyvät tässä näytössä
settings-display-resolution-title = Tarkkuus
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Virkistystaajuus
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Vaihteleva virkistystaajuus
settings-display-variable-refresh-description = Näyttö seuraa koko näytön pelien kuvataajuutta, jolloin liike on sulavampaa
settings-display-variable-refresh-off = Pois
settings-display-variable-refresh-games = Peleissä
settings-display-variable-refresh-fullscreen = Kaikissa koko näytön sovelluksissa
settings-display-scale = Skaalaus
settings-display-scale-description = Suurentaa tai pienentää tekstiä, sovelluksia ja kaikkea muuta
settings-display-orientation = Suunta
settings-display-orientation-landscape = Vaaka
settings-display-orientation-portrait-right = Pysty, oikealle
settings-display-orientation-portrait-left = Pysty, vasemmalle
settings-display-orientation-landscape-flipped = Vaaka, käännetty

## Display brightness

settings-display-brightness = Kirkkaus
settings-display-brightness-label = Kirkkaus: { $name }
settings-display-brightness-unsupported = Ota DDC/CI käyttöön näytön valikosta, niin voit muuttaa kirkkautta täällä
settings-display-brightness-unresponsive = Ei vastaa juuri nyt, yritetään pian uudelleen
settings-display-brightness-external = Ulkoiset näytöt
settings-display-brightness-missing-tool = Asenna ddcutil, niin voit muuttaa niiden kirkkautta täällä
settings-display-brightness-needs-restart = Viimeistele niiden kirkkauden käyttöönotto käynnistämällä uudelleen
settings-display-brightness-no-access = Kirjaudu ulos ja takaisin sisään, niin voit muuttaa niiden kirkkautta täällä

## Night light

settings-display-night-light = Yövalo
settings-display-night-light-description = Lämpimämmät värit illalla ovat silmille mukavampia
settings-display-night-light-schedule = Ajoitus
settings-display-night-light-automatic = Auringonlaskusta auringonnousuun
settings-display-night-light-custom = Mukautettu
settings-display-night-light-from = Alkaa
settings-display-night-light-to = Päättyy
settings-display-night-light-warmth = Lämpimyys

## Sound

settings-sound-output = Ulostulo
settings-sound-input = Sisääntulo
settings-sound-device = Laite
settings-sound-output-device = Ulostulolaite
settings-sound-input-device = Sisääntulolaite
settings-sound-connection = Liitäntä
settings-sound-output-connection = Ulostulon liitäntä
settings-sound-input-connection = Sisääntulon liitäntä
settings-sound-volume = Äänenvoimakkuus
settings-sound-mute = Mykistä: { $name }
settings-sound-unmute = Poista mykistys: { $name }
settings-sound-balance = Tasapaino
settings-sound-balance-center = Keskellä
settings-sound-balance-left = { $share } vasemmalle
settings-sound-balance-right = { $share } oikealle
settings-sound-louder = Salli yli 100 %
settings-sound-louder-description = Ääni voi säröillä suurilla voimakkuuksilla
settings-sound-input-level = Sisääntulon taso
settings-sound-apps = Sovellusten äänenvoimakkuus
settings-sound-apps-playing = { $count ->
    [one] { $count } sovellus toistaa ääntä
   *[other] { $count } sovellusta toistaa ääntä
}
settings-sound-app-output = { $app } -sovelluksen ulostulo
settings-sound-profiles = Laiteprofiilit
settings-sound-profiles-row-description = Valitse, miten kutakin äänilaitetta käytetään
settings-sound-profiles-description = Kunkin äänilaitteen käyttötapa, kuten stereo tai tilaääni
settings-sound-profile-label = { $device } -laitteen käyttötapa
settings-sound-profile-off = Pois

## System sounds

settings-sound-system = Järjestelmän äänet
settings-sound-system-description = Ilmoitusten, laitteiden ja muiden tapahtumien äänet
settings-sound-system-volume = Järjestelmän äänten voimakkuus
settings-sound-kind-notifications = Ilmoitukset
    .description = Hiljaa Älä häiritse -tilassa, peleissä ja näyttöä jaettaessa
    .preview = Toista ilmoitusääni
settings-sound-kind-devices = Laitteet ja lataus
    .description = Laitteen tai laturin liittäminen ja akun vähäinen varaus
    .preview = Toista laiteääni
settings-sound-kind-volume = Äänenvoimakkuuden palaute
    .description = Naksahdus, kun muutat äänenvoimakkuutta
    .preview = Toista naksahdus
settings-sound-kind-screenshots = Kuvakaappaukset
    .description = Suljinääni, kun kuvakaappaus tallennetaan
    .preview = Toista suljinääni
settings-sound-kind-recording = Tallennus
    .description = Kun näytön tallennus, kamera tai sanelu alkaa ja päättyy
    .preview = Toista tallennusääni
settings-sound-kind-sign-in = Kirjautumisääni
    .description = Kun työpöytä tulee näkyviin
    .preview = Toista kirjautumisääni
settings-sound-kind-keyboard = Näppäinäänet
    .description = Jokainen näyttönäppäimistön näppäin
    .preview = Toista näppäinääni

## Power and battery

settings-power-battery = Akku
settings-power-charging = Latautuu
settings-power-charging-at = Latautuu, { $power }
settings-power-charging-until-full = Latautuu, aikaa täyteen { $time }
settings-power-charging-at-until-full = Latautuu, { $power }, aikaa täyteen { $time }
settings-power-on-battery = Akkuvirralla
settings-power-on-battery-using = Akkuvirralla, kulutus { $power }
settings-power-time-left = Noin { $time } jäljellä
settings-power-time-left-using = Noin { $time } jäljellä, kulutus { $power }
settings-power-full = Täyteen ladattu
settings-power-empty = Tyhjä
settings-power-not-charging = Kytketty, ei lataudu
settings-power-health = Akun kunto
settings-power-capacity = { $full }, uutena { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } latausjakso
   *[other] { $cycles } latausjaksoa
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Näytä prosentit
settings-power-show-percentage-description = Näyttää akun varauksen akkukuvakkeen sisällä

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = alle minuutin
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } minuutti
   *[other] { $minutes } minuuttia
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } tunti
   *[other] { $hours } tuntia
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } tunti
   *[other] { $hours } tuntia
} { $minutes ->
    [one] { $minutes } minuutti
   *[other] { $minutes } minuuttia
}
settings-power-never = Ei koskaan

## Charge limit

settings-power-limit = Rajoita latausta
settings-power-limit-failed = Rajaa ei voitu muuttaa. Yritä uudelleen.
settings-power-limit-elsewhere-off = Toinen sovellus poisti sen käytöstä, joten akku latautuu täyteen
settings-power-limit-elsewhere-changed = Toinen sovellus muutti rajaksi { $level }
settings-power-limit-elsewhere-on = Toinen sovellus lopettaa latauksen tasolla { $level }
settings-power-limit-automatic = Tietokone päättää, milloin lataus lopetetaan
settings-power-limit-stops-at = Lataus päättyy tasolla { $level }
settings-power-limit-description = Lopettaa latauksen aiemmin, jotta akku kestää pidempään
settings-power-limit-description-at = Lopettaa tasolla { $level }, jotta akku kestää pidempään
settings-power-limit-applied = Lataus päättyy tasolla { $level }
settings-power-limit-applied-description = Asetettu toisessa sovelluksessa tässä tietokoneessa

## Battery-powered devices

settings-power-devices = Laitteet
settings-power-device-mouse = Hiiri
settings-power-device-keyboard = Näppäimistö
settings-power-device-headphones = Kuulokkeet
settings-power-device-speaker = Kaiutin
settings-power-device-controller = Peliohjain
settings-power-device-phone = Puhelin
settings-power-device-tablet = Tabletti
settings-power-device-pen = Kynä
settings-power-device-touchpad = Kosketuslevy
settings-power-device-other = Laite

## Power mode

settings-power-mode = Virtatila
settings-power-mode-row = Tila
settings-power-profile-saver = Virransäästö
    .description = Hitaampi, kuluttaa vähemmän virtaa
settings-power-profile-balanced = Tasapainotettu
    .description = Tavallinen suorituskyky ja virrankulutus
settings-power-profile-performance = Suorituskyky
    .description = Nopeampi, kuluttaa enemmän virtaa
settings-power-limited = Suorituskykyä on rajoitettu juuri nyt
settings-power-limited-lap = Suorituskykyä on rajoitettu, koska tietokone on sylissäsi
settings-power-limited-hot = Suorituskykyä on rajoitettu, koska tietokone on liian kuuma
settings-power-limited-lap-hot = Suorituskykyä on rajoitettu, koska tietokone on sylissäsi ja liian kuuma
settings-power-saver-low-battery = Virransäästö, kun akku on vähissä
settings-power-saver-low-battery-description = Siirtyy virransäästöön, kun akun varaus käy vähiin

## Keyboard backlight

settings-power-keyboard = Näppäimistö
settings-power-backlight = Näppäimistön taustavalo
settings-power-backlight-off = Pois
settings-power-backlight-low = Matala
settings-power-backlight-medium = Keskitaso
settings-power-backlight-high = Korkea

## Screen and sleep

settings-power-screen = Näyttö
settings-power-screen-off = Näytön sammutus
settings-power-screen-off-description = Kun tietokonetta ei ole käytetty hetkeen
settings-power-dim = Himmennä käyttämättömänä
settings-power-dim-description = Vähentää kirkkautta hetkeä ennen kuin näyttö sammuu
settings-power-sleep = Lepotila
settings-power-suspend-plugged-in = Lepotila verkkovirralla
settings-power-suspend-inactive = Lepotila käyttämättömänä
settings-power-suspend-description = Siirtää tietokoneen lepotilaan, kun sitä ei ole käytetty hetkeen
settings-power-suspend-battery = Lepotila akkuvirralla
settings-power-button = Virtapainike
settings-power-button-suspend = Lepotila
settings-power-button-hibernate = Horrostila
settings-power-button-ask = Kysy, mitä tehdään
settings-power-button-nothing = Älä tee mitään
settings-power-long-sleep = Sammuta pitkän lepotilan jälkeen
settings-power-long-sleep-description = Akku ei tyhjene lepotilassa, vaan tietokone sammuu, kun akun varaus on vähissä tai kun se on ollut pitkään lepotilassa akkuvirralla. Avoimia ikkunoita ei säilytetä.
settings-power-long-sleep-failed = Tätä ei voitu muuttaa. Yritä uudelleen.
settings-power-long-sleep-after = Sammutusviive
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } tunti
   *[other] { $hours } tuntia
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } päivä
   *[other] { $days } päivää
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } viikko
   *[other] { $weeks } viikkoa
}

## Keyboard

settings-keyboard-sources = Syöttölähteet
settings-keyboard-sources-description = Ensimmäistä käytetään oletuksena. Voit vaihtaa niiden välillä kirjoittaessasi.
settings-keyboard-source-edit = Muokkaa Keys-sovelluksessa
settings-keyboard-source-up = Siirrä ylös
settings-keyboard-source-down = Siirrä alas
settings-keyboard-source-remove = Poista
settings-keyboard-add-source-button = Lisää syöttölähde
settings-keyboard-own = Omat asettelut ja syöttötavat
settings-keyboard-own-layout = Luo asettelu
settings-keyboard-own-layout-description = Aloita valmiista asettelusta ja muuta, mitä sen näppäimet kirjoittavat
settings-keyboard-own-method = Luo syöttötapa
settings-keyboard-own-method-description = Muuttaa kirjoittamasi aksenteiksi, muiksi kirjoitusjärjestelmiksi tai valittaviksi sanoiksi
settings-keyboard-own-open = Avaa Keys
settings-keyboard-own-open-description = Muokkaa luomiasi asetteluja ja syöttötapoja
settings-keyboard-switch-source = Vaihda syöttölähdettä
settings-keyboard-add-source = Lisää syöttölähde
settings-keyboard-add-source-description = Valitse näppäimistöasettelu tai syöttötapa, jolla haluat kirjoittaa.
settings-keyboard-add-source-search = Hae kieliä, asetteluja ja syöttötapoja
settings-keyboard-input-method = Syöttötapa
settings-keyboard-add-source-no-match = Ei osumia haulle ”{ $query }”
settings-keyboard-cancel = Peruuta
settings-keyboard-add = Lisää
settings-keyboard-typing = Kirjoittaminen
settings-keyboard-repeat = Näppäintoisto
settings-keyboard-repeat-description = Pohjassa pidetty näppäin kirjoittaa merkkiä yhä uudelleen
settings-keyboard-repeat-delay = Viive ennen toistoa
settings-keyboard-repeat-delay-shorter = Lyhyempi
settings-keyboard-repeat-delay-longer = Pidempi
settings-keyboard-repeat-speed = Toistonopeus
settings-keyboard-repeat-speed-slower = Hitaampi
settings-keyboard-repeat-speed-faster = Nopeampi
settings-keyboard-caps-lock = Caps Lock -näppäin
settings-keyboard-caps-lock-description = Mitä tapahtuu, kun painat sitä
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Vaihda Esc-näppäimen kanssa
settings-keyboard-caps-lock-nothing = Ei mitään
settings-keyboard-caps-lock-custom = Mukautettu
settings-keyboard-lock-notices = Näytä Caps Lock ja Num Lock
settings-keyboard-lock-notices-description = Näyttää hetken ilmoituksen, kun jompikumpi kytkeytyy päälle tai pois
settings-keyboard-dictation-on = Päällä
settings-keyboard-dictation-off = Pois
settings-keyboard-shortcuts-description = Katso ja muuta pikanäppäimiä tai lisää omia

## Copilot key

settings-keyboard-copilot = Copilot-näppäin
settings-keyboard-copilot-press = Painallus
settings-keyboard-copilot-press-description = Mitä näppäimen lyhyt painallus tekee
settings-keyboard-copilot-open-start = Avaa Start
settings-keyboard-copilot-open-app = Avaa sovellus
settings-keyboard-copilot-nothing = Ei mitään
settings-keyboard-copilot-app = Sovellus
settings-keyboard-copilot-no-app = Sovellusta ei ole vielä valittu
settings-keyboard-copilot-change = Vaihda
settings-keyboard-copilot-choose = Valitse
settings-keyboard-copilot-hold = Sanele pitämällä painettuna
settings-keyboard-copilot-hold-description = Pidä näppäintä painettuna ja puhu, niin puheesi kirjoitetaan
settings-keyboard-copilot-hold-off = Toimii, kun sanelu on käytössä
settings-keyboard-copilot-choose-app = Valitse sovellus
settings-keyboard-copilot-choose-app-description = Copilot-näppäimen painallus avaa sen.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Vaihto
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Sarkain
settings-keys-space = Välilyönti
settings-keys-enter = Enter
settings-keys-backspace = Askelpalautin
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Valikko
settings-keys-keypad = Num { $key }
settings-keys-volume-up = Äänenvoimakkuus ylös
settings-keys-volume-down = Äänenvoimakkuus alas
settings-keys-mute = Mykistä
settings-keys-microphone-mute = Mikrofonin mykistys
settings-keys-play = Toista
settings-keys-media-pause = Tauko
settings-keys-stop = Pysäytä
settings-keys-next-track = Seuraava kappale
settings-keys-previous-track = Edellinen kappale
settings-keys-brightness-up = Kirkkaus ylös
settings-keys-brightness-down = Kirkkaus alas
settings-keys-browser = Selain
settings-keys-home-page = Kotisivu
settings-keys-search = Haku
settings-keys-mail = Sähköposti
settings-keys-calculator = Laskin
settings-keys-files = Tiedostot
settings-keys-eject = Poista levy
settings-keys-power = Virta
settings-keys-lock = Lukitse

## Keyboard shortcuts

settings-shortcuts-title = Pikanäppäimet
settings-shortcuts-search = Hae pikanäppäimiä
settings-shortcuts-category-system = Järjestelmä
settings-shortcuts-category-windows = Ikkunat
settings-shortcuts-category-workspaces = Työtilat
settings-shortcuts-category-screenshots = Kuvakaappaukset
settings-shortcuts-category-media = Media
settings-shortcuts-reset = Palauta oletus
settings-shortcuts-apps = Sovellusten pikanäppäimet
settings-shortcuts-apps-description = Sovellusten pyytämät pikanäppäimet, jotka toimivat, vaikka sovellus ei olisi edessä
settings-shortcuts-no-match = Ei pikanäppäimiä haulle ”{ $query }”
settings-shortcuts-change = Vaihda pikanäppäin: { $name }
settings-shortcuts-or = tai
settings-shortcuts-not-set = Ei asetettu
settings-shortcuts-press-keys = Paina haluamiasi näppäimiä
settings-shortcuts-needs-modifier = Lisää Ctrl, Alt tai Super, jotta pikanäppäin ei häiritse kirjoittamista.
settings-shortcuts-record-description = Paina uutta pikanäppäintä. Askelpalautin poistaa sen käytöstä, Esc peruuttaa.
settings-shortcuts-record-taken = Tämä pikanäppäin on jo käytössä: ”{ $name }”. Jos korvaat sen, se poistuu sieltä käytöstä.
settings-shortcuts-try-another = Kokeile toista
settings-shortcuts-replace = Korvaa
settings-shortcuts-cancel = Peruuta
settings-shortcuts-custom = Omat pikanäppäimet
settings-shortcuts-custom-description = Suorita komento tai avaa sovellus näppäinyhdistelmällä
settings-shortcuts-untitled = Nimetön
settings-shortcuts-add = Lisää pikanäppäin
settings-shortcuts-edit = Muokkaa pikanäppäintä
settings-shortcuts-custom-name = Nimi
settings-shortcuts-custom-command = Komento
settings-shortcuts-custom-shortcut = Pikanäppäin
settings-shortcuts-custom-taken = Jo käytössä: ”{ $name }”. Tallentaminen poistaa sen sieltä käytöstä.
settings-shortcuts-remove = Poista
settings-shortcuts-save = Tallenna
settings-shortcuts-add-button = Lisää

## Dictation

settings-dictation-title = Sanelu
settings-dictation-description = Pidä { $keys } painettuna ja puhu, niin puheesi kirjoitetaan missä tahansa sovelluksessa. Lopeta päästämällä irti tai peruuta painamalla Esc. Kaikki tapahtuu tässä tietokoneessa: äänesi ei lähde siitä eikä sitä tallenneta.
settings-dictation-description-no-shortcut = Valitse alta pikanäppäin, niin voit sanella. Kaikki tapahtuu tässä tietokoneessa: äänesi ei lähde siitä eikä sitä tallenneta.
settings-dictation-not-installed = Sanelua ei ole asennettu tähän tietokoneeseen
settings-dictation-hold = Sanele pitämällä { $keys } painettuna
settings-dictation-needs-shortcut = Pois, kunnes sille on asetettu pikanäppäin
settings-dictation-copilot-key = Copilot-näppäin
settings-dictation-shortcut = Pikanäppäin
settings-dictation-shortcut-description = Pidä painettuna ja puhu, tai paina kerran, niin kuuntelu jatkuu, kunnes painat uudelleen tai lopetat puhumisen
settings-dictation-shortcut-own = Oma pikanäppäin
settings-dictation-shortcut-another = Muu pikanäppäin…
settings-dictation-shortcut-off = Pois
settings-dictation-keys = Näppäimet
settings-dictation-change = Vaihda
settings-dictation-language = Kieli
settings-dictation-language-automatic = Automaattinen
settings-dictation-language-automatic-current = Automaattinen ({ $language })
settings-dictation-language-description = Automaattinen seuraa näppäimistöasettelua, jolla kirjoitat
settings-dictation-language-unavailable = Kieli ei ole käytettävissä tässä tietokoneessa: { $language }
settings-dictation-engine = Puheentunnistin
settings-dictation-engine-automatic = Automaattinen
settings-dictation-engine-description = { $engine } tunnistaa kieltä: { $language }
settings-dictation-engine-graphics-card = { $engine } tunnistaa näytönohjaimella kieltä: { $language }
settings-dictation-models = Puhemallit
settings-dictation-models-description = Mallit ladataan kerran ja säilytetään tässä tietokoneessa.
settings-dictation-credits = Tekijät
settings-dictation-credit = { $credit }. Lisenssi: { $licence }.
settings-dictation-learn-more = Lue lisää

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = Lataus epäonnistui: { $reason }
settings-dictation-model-downloading = { $received } / { $total }
settings-dictation-model-installed = { $size } tässä tietokoneessa
settings-dictation-model-partial = { $received } / { $total } ladattu
settings-dictation-model-size = Latauskoko { $size }
settings-dictation-model-retry = Yritä uudelleen
settings-dictation-model-cancel = Peruuta
settings-dictation-model-resume = Jatka
settings-dictation-model-download = Lataa
settings-dictation-model-remove = Poista

## Mouse and touchpad

settings-mouse-mouse = Hiiri
settings-mouse-primary-button = Ensisijainen painike
settings-mouse-primary-button-description = Painike, jolla valitset asioita
settings-mouse-primary-button-left = Vasen
settings-mouse-primary-button-right = Oikea
settings-mouse-speed = Osoittimen nopeus
settings-mouse-slower = Hitaampi
settings-mouse-faster = Nopeampi
settings-mouse-acceleration = Hiiren kiihdytys
settings-mouse-acceleration-description = Osoitin liikkuu pidemmälle, kun liikutat hiirtä nopeasti
settings-mouse-natural-scrolling = Luonnollinen vieritys
settings-mouse-natural-scrolling-description = Vieritys liikuttaa sisältöä eikä näkymää
settings-mouse-touchpad = Kosketuslevy
settings-mouse-touchpad-speed = Kosketuslevyn osoitinnopeus
settings-mouse-touchpad-scroll-speed = Vieritysnopeus
settings-mouse-touchpad-scroll-speed-label = Kosketuslevyn vieritysnopeus
settings-mouse-touchpad-tap = Napsautus napauttamalla
settings-mouse-touchpad-tap-description = Napauta kosketuslevyä painamisen sijaan
settings-mouse-touchpad-natural-scrolling = Kosketuslevyn luonnollinen vieritys
settings-mouse-touchpad-natural-scrolling-description = Sisältö liikkuu samaan suuntaan kuin sormesi
settings-mouse-touchpad-scroll-with = Vieritystapa
settings-mouse-touchpad-two-fingers = Kaksi sormea
settings-mouse-touchpad-scroll-edge = Reuna
settings-mouse-touchpad-secondary-click = Toissijainen napsautus
settings-mouse-touchpad-secondary-click-description = Oikea napsautus ilman erillistä painiketta
settings-mouse-touchpad-click-corner = Kulma
settings-mouse-touchpad-disable-typing = Pois käytöstä kirjoitettaessa
settings-mouse-touchpad-disable-typing-description = Jotta osoitin ei hyppää kirjoittaessasi
