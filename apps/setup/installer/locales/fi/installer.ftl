## Errors shown in Install Luft and first-run setup

installer-not-allowed = Sinulla ei ole oikeutta tehdä tätä.
installer-stopped = Asennusohjelma pysähtyi odottamatta.
installer-request-invalid = Pyyntö ei kelpaa: { $error }
installer-settings-invalid = Asetukset eivät kelpaa: { $error }
installer-busy = Luftia asennetaan jo.
installer-account-exists = Tili on jo luotu.

## Choosing what to install

installer-no-image = Asennettavaa levykuvaa ei ole: { $variant }
installer-read-failed = Tiedostoa ei voitu lukea: { $path }
installer-parse-failed = Tiedostoa ei voitu jäsentää: { $path }
installer-write-failed = Tiedostoa ei voitu kirjoittaa: { $path }

## Checking the destination

installer-drive-gone = Levy ei ole enää liitettynä.
installer-drive-unusable = Luftia ei voi asentaa tälle levylle.
installer-system-gone = Järjestelmää ei enää löydy.
installer-system-unreplaceable = Luft ei vielä osaa korvata tätä järjestelmää: { $system }
installer-drive-running = Luft on käynnistetty tältä levyltä juuri nyt, joten sitä ei voi tyhjentää.
installer-windows-unshrinkable = Tämän levyn Windowsia ei voi pienentää.
installer-size-wont-fit = Tämä koko ei mahdu Windowsin rinnalle.
installer-space-gone = Vapaata tilaa ei enää löydy.
installer-space-too-small = Vapaa tila on liian pieni Luftille.

## Account and regional settings

installer-user-name-invalid = Tätä käyttäjänimeä ei voi käyttää.
installer-full-name-invalid = Nimessä ei voi olla kaksoispisteitä, pilkkuja tai rivinvaihtoja.
installer-password-missing = Valitse salasana.
installer-account-not-saved = Uutta tiliä ei tallennettu
installer-account-missing = Uusi tili puuttuu
installer-regional-invalid = Alueasetukset eivät kelpaa.
installer-unknown-zone = Uusi järjestelmä ei tunne aikavyöhykettä { $zone }.

## Installing

installer-esp-partition-failed = EFI-järjestelmäosiota ei voitu luoda
installer-startup-partition-failed = Luftin käynnistystiedostojen osiota ei voitu luoda
installer-root-partition-failed = Luftin osiota ei voitu luoda
installer-shrink-failed = Windowsia ei voitu pienentää
installer-no-esp = Levyllä ei ole EFI-järjestelmäosiota
installer-no-root = Luftille ei luotu osiota
installer-copy-failed = Luftia ei voitu kopioida
installer-no-deployment = Uudessa järjestelmässä ei ole käyttöönottoa
installer-deployment-unnamed = Uuden järjestelmän käyttöönotolla ei ole nimeä
installer-deployment-unopened = Uutta järjestelmää ei voitu avata
installer-boot-menu-failed = Luftin käynnistysvalikkoa ei voitu tallentaa EFI-järjestelmäosiolle
installer-key-queue-failed = Luftin Secure Boot -avainta ei voitu asettaa odottamaan seuraavaa uudelleenkäynnistystä

## Replacing a Linux system

installer-leftovers-failed = Aiemman yrityksen jäänteitä ei voitu poistaa
installer-default-failed = Luftia ei voitu asettaa käynnistyväksi järjestelmäksi
installer-relabel-failed = Tiedostojasi ei voitu merkitä Luftia varten
installer-set-aside-failed = Vanhaa järjestelmää ei voitu siirtää syrjään

## Things packed with Meet Luft

installer-box-unopened = Muuttolaatikkoa ei voitu avata
installer-box-no-list = Muuttolaatikossa ei ole sisältöluetteloa
installer-unpack-failed = Ei voitu purkaa: { $path }
installer-wallpaper-unnamed = Taustakuvalla ei ole nimeä
