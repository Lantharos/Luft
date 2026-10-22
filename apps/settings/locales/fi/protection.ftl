## Shared buttons

settings-protection-cancel = Peruuta
settings-protection-continue = Jatka
settings-protection-close = Sulje
settings-protection-restart = Käynnistä uudelleen
settings-protection-remove = Poista
settings-protection-turn-on = Ota käyttöön
settings-protection-set-up = Määritä

## Privacy: screen lock

settings-privacy-screen-lock = Näytön lukitus
settings-privacy-screen-off = Näyttö sammuu
settings-privacy-screen-off-hint = Määritetään sivulla Virta ja akku
settings-privacy-screen-off-after = Kun { $duration } on kulunut
settings-privacy-screen-off-never = Ei koskaan
settings-privacy-lock-when-off = Lukitse näyttö, kun se sammuu
settings-privacy-lock-after = Lukitusviive
settings-privacy-lock-after-hint = Kuinka kauan odotetaan näytön sammumisen jälkeen
settings-privacy-lock-immediately = Heti

## Privacy: location, camera and microphone

settings-privacy-location-services = Sijaintipalvelut
settings-privacy-location-services-hint = Sovellukset voivat selvittää sijaintisi karttoja, säätä ja aikavyöhykkeitä varten
settings-privacy-camera-allow = Salli sovellusten käyttää kameraa
settings-privacy-microphone-allow = Salli sovellusten käyttää mikrofonia

## Privacy: file history

settings-privacy-file-history = Tiedostohistoria
settings-privacy-remember-files = Muista viimeksi käytetyt tiedostot
settings-privacy-remember-files-hint = Sovellukset voivat näyttää viimeksi avaamasi tiedostot
settings-privacy-keep-history = Historian säilytysaika
settings-privacy-keep-forever = Aina
settings-privacy-clear-history = Tyhjennä historia
settings-privacy-clear-history-hint = Unohda heti kaikki luettelon tiedostot
settings-privacy-clear = Tyhjennä
settings-privacy-clear-title = Tyhjennetäänkö tiedostohistoria?
settings-privacy-clear-description = Sovellukset eivät enää näytä viimeksi avaamiasi tiedostoja. Itse tiedostot pysyvät paikallaan.

## Privacy: trash and temporary files

settings-privacy-cleanup = Roskakori ja väliaikaiset tiedostot
settings-privacy-empty-trash = Tyhjennä roskakori automaattisesti
settings-privacy-delete-temp = Poista väliaikaiset tiedostot automaattisesti
settings-privacy-delete-temp-hint = Väliaikaiskansioissa olevat tiedostosi, joita mikään ei ole viime aikoina käyttänyt
settings-privacy-delete-after = Poistoviive
settings-privacy-delete-after-hint = Kuinka kauan tiedostot säilyvät ennen poistamista

## Security: summary at the top of the page

settings-security-protected = Laitteesi on suojattu
settings-security-could-be-safer = Laitteesi voisi olla paremmin suojattu
settings-security-not-encrypted-description = Sen levyä ei ole salattu, joten kuka tahansa sen irrottava voi lukea tiedostosi.
settings-security-starts-differently-description = Jos muutit sen Secure Boot -asetuksia, vahvista muutos, niin levyn lukitus avautuu taas itsestään.
settings-security-needed-recovery-key = Levysi tarvitsi palautusavaimen
settings-security-needed-recovery-key-description = Yhdistä suojaussiru uudelleen, niin levyn lukitus avautuu itsestään.
settings-security-firmware-ready-description = Laitteistosi laiteohjelmistopäivitykset odottavat Päivitykset-sivulla.
settings-security-encrypted-secure-boot = Levysi on salattu, ja Secure Boot valvoo sen käynnistystä.
settings-security-encrypted = Levysi on salattu.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Vain luotettu ohjelmisto voi käynnistää tämän tietokoneen
settings-security-chip = Suojaussiru
settings-security-chip-description = Pitää avaimet turvassa ja tarkistaa, miten tietokone käynnistyi
settings-firmware-updates-ready = Laiteohjelmistopäivityksiä on valmiina
settings-firmware-updates-count = { $count ->
    [one] { $count } laitteistopäivitys Päivitykset-sivulla
   *[other] { $count } laitteistopäivitystä Päivitykset-sivulla
}

## Security: signed startup

settings-security-signed-startup = Allekirjoitettu käynnistys
settings-security-signed-startup-on = Käynnistysvalikko ja järjestelmä on allekirjoitettu tälle tietokoneelle
settings-security-signed-startup-purpose = Sallii vain tälle tietokoneelle allekirjoitetun ohjelmiston käynnistyä
settings-security-signed-startup-restart = Otetaan käyttöön uudelleenkäynnistyksen jälkeen
settings-security-signed-startup-missed = Avainta ei lisätty viime uudelleenkäynnistyksessä
settings-security-signed-startup-pending = Lisää avain sinisessä näytössä, kun käynnistät uudelleen
settings-security-signed-startup-missed-often = Avainta ei lisätty usean uudelleenkäynnistyksen aikana
settings-security-show-steps = Näytä vaiheet
settings-security-try-again = Yritä uudelleen

## Security: games with anti-cheat

settings-security-anti-cheat = Huijauksenestoa käyttävät pelit
settings-security-anti-cheat-ready = Valmis huijauksenestoa käyttäviin peleihin
settings-security-anti-cheat-removing = Poista muut avaimet sinisessä näytössä, kun käynnistät uudelleen
settings-security-anti-cheat-luft-key = Epicin on vielä lisättävä Luftin avain luetteloonsa
settings-security-anti-cheat-ready-description = Pelit voivat tarkistaa, miten tietokone käynnistyi

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Poista avaimet uudelleenkäynnistyksen yhteydessä
settings-security-key-steps-add = Lisää avain uudelleenkäynnistyksen yhteydessä
settings-security-key-steps-remove-description = Uudelleenkäynnistyksen jälkeen sininen näyttö kysyy avainten poistamisesta. Se odottaa vain 10 sekuntia, joten paina mitä tahansa näppäintä heti, kun se tulee näkyviin.
settings-security-key-steps-add-description = Uudelleenkäynnistyksen jälkeen sininen näyttö kysyy uudesta avaimesta. Se odottaa vain 10 sekuntia, joten paina mitä tahansa näppäintä heti, kun se tulee näkyviin.
settings-security-key-step-choose = Valitse { $option } ja sitten { $next }.
settings-security-key-step-confirm = Valitse { $option }.
settings-security-key-step-code = Kirjoita alla oleva koodi ja paina { $key }.
settings-security-key-step-reboot = Valitse { $option }.
settings-security-key-enter = Enter
settings-security-key-code = Koodi { $code }
settings-security-key-steps-remove-missed = Jos et ehdi, tietokone käynnistyy tavalliseen tapaan ja voit yrittää uudelleen täällä.
settings-security-key-steps-add-missed = Jos et ehdi, tietokone käynnistyy tavalliseen tapaan ja vaiheet näytetään uudelleen seuraavan käynnistyksen yhteydessä uudella koodilla.
settings-security-later = Myöhemmin
settings-security-restart-now = Käynnistä uudelleen nyt

## Security: hardware security level

settings-security-hardware = Laitteistosuojaus
settings-security-hardware-level-0 = Laitteistossasi on vain vähän mahdollisista suojauksista
settings-security-hardware-level-1 = Laitteistossasi on perussuojaukset
settings-security-hardware-level-2 = Laitteistossasi on tärkeimmät suojaukset
settings-security-hardware-level-3 = Laitteistosi on hyvin suojattu
settings-security-hardware-level-4 = Laitteistosi suojaa itseään käytön aikana
settings-security-hardware-level-5 = Laitteistosi suojaa itseään ja pystyy todistamaan sen
settings-security-hardware-description = { $summary }, taso { $level }/{ $highest }.
settings-security-hardware-next = Seuraavaa tasoa varten
settings-security-hardware-highest = Tämä on korkein mahdollinen taso.
settings-security-hardware-inactive = Ei tällä hetkellä käytössä
settings-security-hardware-fix-maker = { $count ->
    [one] Vain tietokoneesi valmistaja voi lisätä tämän, yleensä laiteohjelmistopäivityksellä:
   *[other] Vain tietokoneesi valmistaja voi lisätä nämä, yleensä laiteohjelmistopäivityksellä:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Tämän voi ottaa käyttöön tietokoneen laiteohjelmiston asetuksista:
   *[other] Nämä voi ottaa käyttöön tietokoneen laiteohjelmiston asetuksista:
}
settings-security-hardware-fix-system = { $count ->
    [one] Tämä riippuu järjestelmän määrityksistä:
   *[other] Nämä riippuvat järjestelmän määrityksistä:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Tämä ei ole käytettävissä tässä tietokoneessa:
   *[other] Nämä eivät ole käytettävissä tässä tietokoneessa:
}

## Security: USB protection

settings-usb-hold-back = Pidätä uudet USB-laitteet
settings-usb-hold-back-description = Lukituksen aikana liitetyt odottavat, kunnes avaat lukituksen

## Device encryption

settings-encryption = Laitteen salaus
settings-encryption-not-encrypted = Pois päältä, ja sen voi ottaa käyttöön vain Luftia asennettaessa
settings-encryption-unlocks-chip-pin = Lukitus avataan suojaussirulla ja PIN-koodilla
settings-encryption-unlocks-chip = Lukitus avautuu itsestään suojaussirulla
settings-encryption-unlocks-passphrase = Kysyy tunnuslausetta käynnistyksessä
settings-encryption-unlocks-security-key = Lukitus avataan käynnistyksessä suojausavaimella
settings-encryption-unlocks-recovery-key = Kysyy palautusavainta käynnistyksessä

## Device encryption: other drives

settings-encryption-drives = Muut asemat
settings-encryption-drives-hint = Salaa muita asemia ja USB-tikkuja Levyt-sovelluksessa
settings-encryption-drives-open = Avaa Levyt
settings-encryption-drive-encrypting = Asemaa salataan, { $percent } valmiina
settings-encryption-drive-encrypting-paused = Aseman salaus keskeytetty, { $percent } valmiina
settings-encryption-drive-decrypting = Aseman salausta puretaan, { $percent } valmiina
settings-encryption-drive-decrypting-paused = Aseman salauksen purku keskeytetty, { $percent } valmiina
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } salattu asema avautuu tämän tietokoneen mukana
   *[other] { $count } salattua asemaa avautuu tämän tietokoneen mukana
}

## Device encryption: unlocking the disk

settings-encryption-unlocking = Levyn lukituksen avaus
settings-encryption-starts-differently = Tietokone käynnistyy nyt eri tavalla
settings-encryption-starts-differently-description = Sen Secure Boot -asetukset muuttuivat, joten levy kysyi palautusavainta. Jos teit muutoksen itse, vahvista se, niin lukitus avautuu taas itsestään
settings-encryption-confirm = Vahvista
settings-encryption-asked-recovery-key = Levysi kysyi palautusavainta
settings-encryption-relink-description = Yhdistä suojaussiru uudelleen, niin lukitus avautuu itsestään
settings-encryption-relink = Yhdistä uudelleen
settings-encryption-chip-unlock = Avaa lukitus suojaussirulla
settings-encryption-chip-unlock-on = Kunhan mikään ei muuta tietokoneen käynnistystapaa
settings-encryption-chip-unlock-off = Tunnuslausetta ei tarvitse kirjoittaa käynnistyksessä
settings-encryption-pin = PIN-koodi käynnistyksessä
settings-encryption-pin-description = Kirjoitat sen ennen kuin levyn lukitus avautuu
settings-encryption-change = Vaihda
settings-encryption-add-pin-row = Lisää PIN-koodi käynnistykseen
settings-encryption-add-pin-row-description = Pitää levyn lukittuna, vaikka tietokone vietäisiin
settings-encryption-add-pin = Lisää PIN-koodi
settings-encryption-new-key-description = Levylläsi ei ollut vielä palautusavainta. Säilytä tätä muualla kuin tässä tietokoneessa.
settings-encryption-stop-chip-title = Lopetetaanko lukituksen avaus suojaussirulla?
settings-encryption-stop-chip-passphrase = Tietokone kysyy tunnuslausettasi joka käynnistyksessä.
settings-encryption-stop-chip-recovery-key = Tietokone kysyy palautusavaintasi joka käynnistyksessä, joten pidä se lähettyvillä.
settings-encryption-stop-chip = Lopeta
settings-encryption-remove-pin-title = Poistetaanko PIN-koodi?
settings-encryption-remove-pin-description = Levyn lukitus avautuu taas itsestään, kun tietokone käynnistyy.
settings-encryption-remove-pin = Poista PIN-koodi
settings-encryption-unlock-disk-title = Avaa levyn lukitus
settings-encryption-unlock-disk-description = Tämä muutos vaatii palautusavaimen tai tunnuslauseen, jonka kirjoitat tietokoneen käynnistyessä.
settings-encryption-unlock-disk-field = Palautusavain tai tunnuslause

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Kysy myös PIN-koodia
settings-encryption-chip-setup-description = Tietokoneesi suojaussiru avaa levyn lukituksen itsestään käynnistyksessä, joten tunnuslausetta ei enää tarvitse kirjoittaa ensin.
settings-encryption-add-pin-title = Lisää PIN-koodi
settings-encryption-add-pin-description = Kirjoitat sen aina, kun tietokone käynnistyy. Ilman sitä levy pysyy lukittuna, vaikka joku veisi koko tietokoneen.
settings-encryption-change-pin-title = Vaihda PIN-koodi
settings-encryption-change-pin-description = Kirjoitat uuden PIN-koodin aina, kun tietokone käynnistyy.
settings-encryption-change-pin = Vaihda PIN-koodi
settings-encryption-relink-title = Yhdistä suojaussiru uudelleen
settings-encryption-relink-pin-description = Kirjoita PIN-koodi, jota haluat käyttää käynnistyksessä.
settings-encryption-ask-pin-step = Lisää käynnistykseen yhden vaiheen.
settings-encryption-pin-field = PIN-koodi
settings-encryption-new-pin-field = Uusi PIN-koodi
settings-encryption-pin-length = { $min }–{ $max } numeroa
settings-encryption-pin-digits-only = Käytä vain numeroita
settings-encryption-pin-too-short = { $min ->
    [one] Käytä vähintään { $min } numero
   *[other] Käytä vähintään { $min } numeroa
}
settings-encryption-pin-too-long = { $max ->
    [one] Käytä enintään { $max } numero
   *[other] Käytä enintään { $max } numeroa
}
settings-encryption-pins-differ = PIN-koodit eivät täsmää
settings-encryption-confirm-field = Vahvista
settings-encryption-type-again = Kirjoita uudelleen

## Recovery key

settings-recovery-title = Palautusavain
settings-recovery-description = Pääset sisään, jos levyn lukitus ei avaudu itsestään
settings-recovery-show = Näytä
settings-recovery-replace = Vaihda
settings-recovery-replace-title = Vaihdetaanko palautusavain?
settings-recovery-replace-description = Nykyinen avaimesi lakkaa toimimasta, ja saat tallennettavaksi uuden.
settings-recovery-replace-key = Vaihda avain
settings-recovery-shown-title = Palautusavaimesi
settings-recovery-shown-description = Kirjoita se, jos tietokone joskus kysyy palautusavainta käynnistyksessä. Säilytä kopiota muualla kuin tässä tietokoneessa.
settings-recovery-fresh-title = Tallenna uusi palautusavain
settings-recovery-fresh-description = Edellinen avaimesi ei enää toimi. Säilytä tätä paperilla tai salasanojen hallintasovelluksessa.

## Passwords and keys (the keyring)

settings-passwords-title = Salasanat ja avaimet
settings-passwords-not-running = Avainnippu ei ole käynnissä
settings-passwords-not-running-description = Salasanasi ja avaimesi näkyvät tässä, kun se käynnistyy
settings-passwords-locked = Lukittu
settings-passwords-contents = { $count ->
    [0] Ei vielä mitään tallennettuna
    [one] { $count } salasana tai avain
   *[other] { $count } salasanaa ja avainta
}
settings-passwords-protected-chip = Suojattu salasanallasi ja suojaussirulla
settings-passwords-protected = Suojattu salasanallasi
settings-passwords-unlock = Avaa lukitus
settings-passwords-lock = Lukitse
settings-passwords-seal-title = Sinetöi suojaussirulla
settings-passwords-seal-description = Niiden kopioita ei voi avata toisella tietokoneella
settings-passwords-seal = Sinetöi
settings-passwords-fingerprint-on = Lukitus avautuu sormenjäljelläsi
settings-passwords-fingerprint-on-description = Kun kirjaudut sillä, myös salasanojesi lukitus avautuu
settings-passwords-fingerprint = Avaa lukitus sormenjäljellä
settings-passwords-fingerprint-description = Lisää ensin sormenjälki Käyttäjät-sivulla
settings-passwords-pin = Kysy PIN-koodia sormenjäljen jälkeen
settings-passwords-pin-locked = Avaa avainnipun lukitus muuttaaksesi tätä
settings-passwords-pin-description = Pelkkä sormenjälki ei silloin avaa niiden lukitusta
settings-passwords-lock-with-screen = Lukitse näytön mukana
settings-passwords-lock-with-screen-description = Ne lukitaan ja avataan yhdessä näytön kanssa
settings-passwords-apps = Sovellusten kirjautumistiedot ja toiminta
settings-passwords-apps-locked = Avaa avainnipun lukitus nähdäksesi ne
settings-passwords-apps-description = Mitä sovellukset säilyttävät täällä ja milloin ne käyttivät sitä
settings-passwords-apps-allowed = Mitkä sovellukset voivat käyttää salasanojasi
settings-passwords-apps-allowed-hint = Määritetään sivulla Sovellukset

## Passwords and keys: apps with access

settings-passwords-stores = Sovellusten kirjautumistiedot
settings-passwords-stores-description = Joidenkin sovellusten tänne tallentamat kirjautumistiedot, joita vain kyseinen sovellus voi lukea.
settings-passwords-stores-count = { $count ->
    [one] { $count } tallennettu kirjautuminen
   *[other] { $count } tallennettua kirjautumista
}
settings-passwords-forget = Unohda
settings-passwords-forget-title = Unohdetaanko { $app } -sovelluksen tallentamat tiedot?
settings-passwords-forget-description = { $app } -sovellus menettää tänne tallentamansa kirjautumistiedot, joten saatat joutua kirjautumaan siihen uudelleen.

## Passwords and keys: recent access

settings-passwords-history = Viimeaikainen käyttö
settings-passwords-history-read = { $app } käytti kohdetta ”{ $item }”
settings-passwords-history-read-unnamed = { $app } käytti tallennettua salasanaa
settings-passwords-history-saved = { $app } tallensi kohteen ”{ $item }”
settings-passwords-history-saved-unnamed = { $app } tallensi salasanan
settings-passwords-history-deleted = { $app } poisti kohteen ”{ $item }”
settings-passwords-history-deleted-unnamed = { $app } poisti tallennetun salasanan
settings-passwords-history-denied = { $app } ei saanut käyttää kohdetta ”{ $item }”
settings-passwords-history-denied-unnamed = { $app } ei saanut käyttää tallennettua salasanaa
settings-passwords-history-signed = { $app } allekirjoitti kohteella ”{ $item }”
settings-passwords-history-signed-unnamed = { $app } allekirjoitti tallennetulla salasanalla
settings-passwords-history-fewer = Näytä vähemmän
settings-passwords-history-all = { $count ->
    [one] Näytä kaikki { $count }
   *[other] Näytä kaikki { $count }
}
settings-passwords-history-clear = Tyhjennä historia
settings-passwords-history-clear-description = Unohda, mitkä sovellukset käyttivät avainnippuasi ja milloin
settings-passwords-history-clear-button = Tyhjennä
settings-passwords-history-clear-title = Tyhjennetäänkö viimeaikainen käyttö?
settings-passwords-history-clear-confirm = Luettelo siitä, mitkä sovellukset käyttivät avainnippuasi ja milloin, poistetaan. Tallennetut salasanasi ja avaimesi säilyvät ennallaan.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH-avaimet
settings-passwords-ssh-description = Avaimet palvelimille kirjautumiseen, turvassa avainnipussasi.
settings-passwords-ssh-unnamed = Nimetön avain
settings-passwords-ssh-in-chip = Tallessa suojaussirussa
settings-passwords-ssh-added = Lisätty { $when }
settings-passwords-ssh-copy = Kopioi julkinen avain: { $name }
settings-passwords-ssh-remove = Poista { $name }
settings-passwords-ssh-confirm = Kysy ennen jokaista käyttöä
settings-passwords-ssh-confirm-label = Kysy ennen jokaista käyttöä: { $name }
settings-passwords-ssh-add-row = Lisää avain
settings-passwords-ssh-use = Käytä näitä avaimia SSH:ssa
settings-passwords-ssh-use-description = Kopioi rivi, joka ohjaa SSH:n niihin
settings-passwords-ssh-copy-line = Kopioi { $line }
settings-passwords-ssh-remove-title = Poistetaanko ”{ $name }”?
settings-passwords-ssh-remove-chip = Avain on olemassa vain tämän tietokoneen suojaussirussa, joten se katoaa pysyvästi. Palvelimet, jotka hyväksyvät vain tämän avaimen, eivät enää päästä sinua sisään sillä.
settings-passwords-ssh-remove-description = Palvelimet, jotka hyväksyvät vain tämän avaimen, eivät enää päästä sinua sisään sillä. Tätä ei voi kumota.
settings-passwords-ssh-add-title = Lisää SSH-avain
settings-passwords-ssh-add-description = Tähän tietokoneeseen luodaan uusi avain. Kopioi sen julkinen avain palvelimille, joille haluat kirjautua.
settings-passwords-ssh-name = Nimi
settings-passwords-ssh-name-placeholder = Esimerkiksi työkannettava
settings-passwords-ssh-chip = Säilytä suojaussirussa
settings-passwords-ssh-chip-description = Sitä ei voi koskaan kopioida pois tästä tietokoneesta, et edes sinä itse
settings-passwords-ssh-chip-unsupported = Tämän tietokoneen suojaussiru ei voi säilyttää SSH-avaimia
settings-passwords-ssh-add = Lisää avain

## Passkeys

settings-passkeys-title = Pääsyavaimet
settings-passkeys-unavailable = Avaa avainnipun lukitus nähdäksesi pääsyavaimesi.
settings-passkeys-chip-fingerprint = Sinetöity tämän tietokoneen suojaussirulla. Jokainen kirjautuminen kysyy sormenjälkeäsi tai salasanaasi.
settings-passkeys-chip-password = Sinetöity tämän tietokoneen suojaussirulla. Jokainen kirjautuminen kysyy salasanaasi.
settings-passkeys-password-fingerprint = Salattu salasanallasi. Jokainen kirjautuminen kysyy sormenjälkeäsi tai salasanaasi.
settings-passkeys-password = Salattu salasanallasi. Jokainen kirjautuminen kysyy salasanaasi.
settings-passkeys-last-used = Viimeksi käytetty { $when }
settings-passkeys-never-used = Ei koskaan käytetty
settings-passkeys-password-only = Suojattu salasanallasi
settings-passkeys-unreachable = Selaimet eivät tavoita pääsyavaimiasi
settings-passkeys-unreachable-description = Ne palaavat, kun pääsyavainpalvelu on käynnissä
settings-passkeys-rename-label = Nimeä uudelleen sivuston { $site } pääsyavain
settings-passkeys-remove-label = Poista sivuston { $site } pääsyavain
settings-passkeys-empty = Ei vielä pääsyavaimia
settings-passkeys-empty-description = Sivustojen luomat pääsyavaimet tallennetaan tänne kaikkien selainten käyttöön
settings-passkeys-remove-title = Poistetaanko tämä pääsyavain?
settings-passkeys-remove-description = Et voi enää kirjautua sillä sivustolle { $site }, joten varmista, että pääset sisään muullakin tavalla.
settings-passkeys-rename-title = Nimeä pääsyavain uudelleen
settings-passkeys-rename-description = Anna sivuston { $site } pääsyavaimelle nimi, jonka tunnistat.
settings-passkeys-name = Nimi
settings-passkeys-save = Tallenna

## Apps

settings-apps-defaults = Oletussovellukset
settings-apps-defaults-description = Käytetään, kun avaat linkkejä, tiedostoja ja kansioita
settings-apps-browser = Verkkoselain
settings-apps-email = Sähköposti
settings-apps-calendar = Kalenteri
settings-apps-music = Musiikki
settings-apps-videos = Videot
settings-apps-photos = Valokuvat
settings-apps-text-editor = Tekstieditori
settings-apps-files = Tiedostot
settings-apps-archives = Pakatut tiedostot
settings-apps-choose = Valitse
settings-apps-startup = Käynnistys
settings-apps-startup-description = Nämä sovellukset avautuvat, kun kirjaudut sisään
settings-apps-startup-app = Avaa { $app } kirjautuessa
settings-apps-startup-add = Lisää sovellus
settings-apps-startup-add-title = Lisää käynnistyssovellus
settings-apps-startup-add-description = Valitse sovellus, joka avautuu aina, kun kirjaudut sisään.
settings-apps-search = Hae sovelluksia
settings-apps-no-match = Haulla ei löytynyt sovelluksia
settings-apps-cancel = Peruuta

## Apps: permissions

settings-apps-permissions = Käyttöoikeudet
settings-apps-location = Sijainti
settings-apps-camera = Kamera
settings-apps-clipboard = Leikepöytä taustalla
settings-apps-full-access = Täysi käyttöoikeus
settings-apps-full-access-hint = Se toimii hiekkalaatikkonsa ulkopuolella ja voi tehdä kaiken, mitä itse käynnistämäsi ohjelma voi. Poisto tulee voimaan seuraavalla avauskerralla.
settings-apps-full-access-remove = Poista
settings-apps-full-access-remove-app = Poista sovellukselta { $app } täysi käyttöoikeus
settings-apps-passwords = Tallennetut salasanat
settings-apps-passwords-forget = Unohda
settings-apps-passwords-forget-app = Anna sovelluksen { $app } kysyä uudelleen
settings-apps-permissions-allowed = { $allowed }/{ $total } sallittu
settings-apps-permissions-description = Hiekkalaatikossa olevat sovellukset saavat omat tiedostonsa ja vain sen, mitä sallit tässä.
settings-apps-sandbox-only = Ei mitään hiekkalaatikon ulkopuolelta
settings-apps-folders = Kansiot
settings-apps-folders-hint = Se voi lukea ja muuttaa kaikkea näissä kansioissa seuraavasta avauskerrasta alkaen.
settings-apps-folders-count = { $count ->
    [one] { $count } kansio
   *[other] { $count } kansiota
}
settings-apps-folder-add = Lisää kansio
settings-apps-folder-remove = Poista
settings-apps-folder-remove-app = Lopeta kansion { $folder } jakaminen
settings-apps-usb = USB-laitteet
settings-apps-usb-hint = Kuten suojausavaimet, puhelimet ja mikro-ohjaimet
settings-apps-serial = Sarjalaitteet
settings-apps-serial-hint = Kuten 3D-tulostimet ja USB:llä liitetyt piirilevyt
settings-apps-full-access-off = Se toimii hiekkalaatikossa. Täysi käyttöoikeus poistaa hiekkalaatikon.
settings-apps-full-access-give = Anna täysi käyttöoikeus
