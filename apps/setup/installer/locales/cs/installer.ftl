## Errors shown in Install Luft and first-run setup

installer-not-allowed = K této akci nemáte oprávnění.
installer-stopped = Instalační program se neočekávaně zastavil.
installer-request-invalid = Požadavek není platný: { $error }
installer-settings-invalid = Nastavení není platné: { $error }
installer-busy = Luft se už instaluje.
installer-account-exists = Účet už byl vytvořen.

## Choosing what to install

installer-no-image = Neexistuje žádný obraz { $variant }, který by šel nainstalovat.
installer-read-failed = Nepodařilo se přečíst { $path }
installer-parse-failed = Nepodařilo se zpracovat { $path }
installer-write-failed = Nepodařilo se zapsat { $path }

## Checking the destination

installer-drive-gone = Tento disk už není připojený.
installer-drive-unusable = Na tento disk nelze Luft nainstalovat.
installer-system-gone = Tento systém už tu není.
installer-system-unreplaceable = Luft zatím neumí nahradit systém { $system }.
installer-drive-running = Luft se z tohoto disku právě spouští, takže ho nelze vymazat.
installer-windows-unshrinkable = Systém Windows na tomto disku nelze zmenšit.
installer-size-wont-fit = Tato velikost se vedle systému Windows nevejde.
installer-space-gone = Toto volné místo už neexistuje.
installer-space-too-small = Toto volné místo je pro Luft příliš malé.

## Account and regional settings

installer-user-name-invalid = Toto uživatelské jméno nelze použít.
installer-full-name-invalid = Jméno nesmí obsahovat dvojtečky, čárky ani zalomení řádku.
installer-password-missing = Zvolte heslo.
installer-account-not-saved = Nový účet se nepodařilo uložit
installer-account-missing = Nový účet chybí
installer-regional-invalid = Místní nastavení nejsou platná.
installer-unknown-zone = Nový systém nezná časové pásmo { $zone }.

## Installing

installer-esp-partition-failed = Systémový oddíl EFI se nepodařilo vytvořit
installer-startup-partition-failed = Oddíl pro spouštěcí soubory Luftu se nepodařilo vytvořit
installer-root-partition-failed = Oddíl pro Luft se nepodařilo vytvořit
installer-shrink-failed = Systém Windows se nepodařilo zmenšit
installer-no-esp = Disk nemá systémový oddíl EFI
installer-no-root = Nebyl vytvořen žádný oddíl pro Luft
installer-copy-failed = Luft se nepodařilo zkopírovat
installer-no-deployment = Nový systém nemá žádné nasazení
installer-deployment-unnamed = Nasazení nového systému nemá název
installer-deployment-unopened = Nový systém se nepodařilo otevřít
installer-boot-menu-failed = Spouštěcí nabídku Luftu se nepodařilo uložit do systémového oddílu EFI
installer-key-queue-failed = Klíč Secure Boot pro Luft se nepodařilo připravit pro příští restart

## Replacing a Linux system

installer-leftovers-failed = Zbytky předchozího pokusu se nepodařilo odstranit
installer-default-failed = Luft se nepodařilo nastavit jako systém, který se spouští
installer-relabel-failed = Vaše soubory se nepodařilo označit pro Luft
installer-set-aside-failed = Starý systém se nepodařilo odložit stranou

## Things packed with Meet Luft

installer-box-unopened = Stěhovací krabici se nepodařilo otevřít
installer-box-no-list = Stěhovací krabice nemá seznam svého obsahu
installer-unpack-failed = Nepodařilo se rozbalit { $path }
installer-wallpaper-unnamed = Tapeta nemá název
