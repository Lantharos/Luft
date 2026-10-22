## Errors shown in Install Luft and first-run setup

installer-not-allowed = Je hebt geen toestemming om dit te doen.
installer-stopped = Het installatieprogramma is onverwacht gestopt.
installer-request-invalid = Het verzoek is ongeldig: { $error }
installer-settings-invalid = De instellingen zijn ongeldig: { $error }
installer-busy = Luft wordt al geïnstalleerd.
installer-account-exists = Het account is al gemaakt.

## Choosing what to install

installer-no-image = Er is geen { $variant }-image om te installeren.
installer-write-failed = Kan { $path } niet schrijven

## Checking the destination

installer-drive-gone = Die schijf is niet meer aangesloten.
installer-drive-unusable = Luft kan niet op die schijf worden geïnstalleerd.
installer-system-gone = Dat systeem is er niet meer.
installer-system-unreplaceable = Luft kan { $system } nog niet vervangen.
installer-drive-running = Luft start op dit moment vanaf die schijf, dus die kan niet worden gewist.
installer-windows-unshrinkable = Windows op die schijf kan niet worden verkleind.
installer-size-wont-fit = Die grootte past niet naast Windows.
installer-space-gone = Die vrije ruimte is er niet meer.
installer-space-too-small = Die vrije ruimte is te klein voor Luft.

## Account and regional settings

installer-user-name-invalid = Die gebruikersnaam kan niet worden gebruikt.
installer-full-name-invalid = Een naam mag geen dubbele punten, komma’s of regeleinden bevatten.
installer-password-missing = Kies een wachtwoord.
installer-account-not-saved = Het nieuwe account is niet opgeslagen
installer-account-missing = Het nieuwe account ontbreekt
installer-regional-invalid = Die regionale instellingen zijn ongeldig.
installer-unknown-zone = Het nieuwe systeem kent de tijdzone { $zone } niet.

## Installing

installer-esp-partition-failed = Kan de EFI-systeempartitie niet maken
installer-startup-partition-failed = Kan de partitie voor de opstartbestanden van Luft niet maken
installer-root-partition-failed = Kan de partitie voor Luft niet maken
installer-encryption-failed = Kan de partitie voor Luft niet versleutelen
installer-shrink-failed = Windows kon niet worden verkleind
installer-no-esp = De schijf heeft geen EFI-systeempartitie
installer-no-root = Er is geen partitie voor Luft gemaakt
installer-copy-failed = Luft kon niet worden gekopieerd
installer-no-deployment = Het nieuwe systeem heeft geen deployment
installer-deployment-unnamed = De deployment van het nieuwe systeem heeft geen naam
installer-deployment-unopened = Het nieuwe systeem kon niet worden geopend
installer-boot-menu-failed = Het opstartmenu van Luft kon niet op de EFI-systeempartitie worden gezet
installer-key-queue-failed = De Secure Boot-sleutel van Luft kon niet worden klaargezet voor de volgende herstart

## Replacing a Linux system

installer-encryption-keeps-old = Luft kan niet worden versleuteld als het de bestanden van het oude systeem ernaast bewaart.
installer-leftovers-failed = Wat een eerdere poging heeft achtergelaten, kon niet worden opgeruimd
installer-default-failed = Luft kon niet het systeem worden dat start
installer-relabel-failed = Je bestanden konden niet voor Luft worden gelabeld
installer-set-aside-failed = Het oude systeem kon niet opzij worden gezet

## Things packed with Meet Luft

installer-box-unopened = De verhuisdoos kon niet worden geopend
installer-box-no-list = De verhuisdoos heeft geen lijst van wat erin zit
installer-unpack-failed = Kan { $path } niet uitpakken
installer-wallpaper-unnamed = De achtergrond heeft geen naam
