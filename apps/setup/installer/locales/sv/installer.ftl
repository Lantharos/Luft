## Errors shown in Install Luft and first-run setup

installer-not-allowed = Du har inte behörighet att göra det här.
installer-stopped = Installationsprogrammet avslutades oväntat.
installer-request-invalid = Begäran är ogiltig: { $error }
installer-settings-invalid = Inställningarna är ogiltiga: { $error }
installer-busy = Luft installeras redan.
installer-account-exists = Kontot har redan skapats.

## Choosing what to install

installer-no-image = Det finns ingen avbildning av typen { $variant } att installera.
installer-write-failed = Det gick inte att skriva { $path }

## Checking the destination

installer-drive-gone = Disken är inte längre ansluten.
installer-drive-unusable = Luft kan inte installeras på den disken.
installer-system-gone = Systemet finns inte längre.
installer-system-unreplaceable = Luft kan inte ersätta { $system } ännu.
installer-drive-running = Luft startar från den disken just nu, så den kan inte raderas.
installer-windows-unshrinkable = Windows på den disken kan inte krympas.
installer-size-wont-fit = Den storleken får inte plats bredvid Windows.
installer-space-gone = Det lediga utrymmet finns inte längre.
installer-space-too-small = Det lediga utrymmet är för litet för Luft.

## Account and regional settings

installer-user-name-invalid = Det användarnamnet kan inte användas.
installer-full-name-invalid = Ett namn får inte innehålla kolon, kommatecken eller radbrytningar.
installer-password-missing = Välj ett lösenord.
installer-account-not-saved = Det nya kontot sparades inte
installer-account-missing = Det nya kontot saknas
installer-regional-invalid = De regionala inställningarna är ogiltiga.
installer-unknown-zone = Det nya systemet känner inte till tidszonen { $zone }.

## Installing

installer-esp-partition-failed = Det gick inte att skapa EFI-systempartitionen
installer-startup-partition-failed = Det gick inte att skapa partitionen för Lufts startfiler
installer-root-partition-failed = Det gick inte att skapa partitionen för Luft
installer-encryption-failed = Det gick inte att kryptera partitionen för Luft
installer-shrink-failed = Det gick inte att krympa Windows
installer-no-esp = Disken har ingen EFI-systempartition
installer-no-root = Ingen partition för Luft skapades
installer-copy-failed = Det gick inte att kopiera Luft
installer-no-deployment = Det nya systemet har ingen driftsättning
installer-deployment-unnamed = Det nya systemets driftsättning har inget namn
installer-deployment-unopened = Det gick inte att öppna det nya systemet
installer-boot-menu-failed = Det gick inte att lägga Lufts startmeny på EFI-systempartitionen
installer-key-queue-failed = Det gick inte att förbereda Lufts Secure Boot-nyckel för nästa omstart

## Replacing a Linux system

installer-encryption-keeps-old = Luft kan inte krypteras när det behåller det gamla systemets filer bredvid sig.
installer-leftovers-failed = Det gick inte att rensa det som ett tidigare försök lämnade kvar
installer-default-failed = Det gick inte att göra Luft till systemet som startar
installer-relabel-failed = Det gick inte att märka dina filer för Luft
installer-set-aside-failed = Det gick inte att flytta undan det gamla systemet

## Things packed with Meet Luft

installer-box-unopened = Det gick inte att öppna flyttlådan
installer-box-no-list = Flyttlådan har ingen lista över vad den innehåller
installer-unpack-failed = Det gick inte att packa upp { $path }
installer-wallpaper-unnamed = Bakgrundsbilden har inget namn
