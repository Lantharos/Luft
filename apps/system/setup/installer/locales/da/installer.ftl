## Errors shown in Install Luft and first-run setup

installer-not-allowed = Du har ikke tilladelse til at gøre dette.
installer-stopped = Installationsprogrammet stoppede uventet.
installer-request-invalid = Anmodningen er ugyldig: { $error }
installer-settings-invalid = Indstillingerne er ugyldige: { $error }
installer-busy = Luft er allerede ved at blive installeret.
installer-account-exists = Kontoen er allerede oprettet.

## Choosing what to install

installer-no-image = Der er ingen { $variant }-udgave at installere.
installer-write-failed = Kunne ikke skrive { $path }

## Checking the destination

installer-drive-gone = Disken er ikke længere tilsluttet.
installer-drive-unusable = Luft kan ikke installeres på den disk.
installer-system-gone = Systemet findes ikke længere.
installer-system-unreplaceable = Luft kan endnu ikke erstatte { $system }.
installer-drive-running = Luft starter fra den disk lige nu, så den kan ikke slettes.
installer-windows-unshrinkable = Windows på den disk kan ikke gøres mindre.
installer-size-wont-fit = Den størrelse er der ikke plads til ved siden af Windows.
installer-space-gone = Den ledige plads findes ikke længere.
installer-space-too-small = Den ledige plads er for lille til Luft.

## Account and regional settings

installer-user-name-invalid = Det brugernavn kan ikke bruges.
installer-full-name-invalid = Et navn må ikke indeholde koloner, kommaer eller linjeskift.
installer-password-missing = Vælg en adgangskode.
installer-account-not-saved = Den nye konto blev ikke gemt
installer-account-missing = Den nye konto mangler
installer-regional-invalid = De regionale indstillinger er ugyldige.
installer-unknown-zone = Det nye system kender ikke tidszonen { $zone }.

## Installing

installer-esp-partition-failed = EFI-systempartitionen kunne ikke oprettes
installer-startup-partition-failed = Partitionen til Lufts opstartsfiler kunne ikke oprettes
installer-root-partition-failed = Partitionen til Luft kunne ikke oprettes
installer-encryption-failed = Partitionen til Luft kunne ikke krypteres
installer-shrink-failed = Windows kunne ikke gøres mindre
installer-no-esp = Disken har ingen EFI-systempartition
installer-no-root = Der blev ikke oprettet nogen partition til Luft
installer-copy-failed = Luft kunne ikke kopieres
installer-no-deployment = Det nye system har ingen udrulning
installer-deployment-unnamed = Det nye systems udrulning har intet navn
installer-deployment-unopened = Det nye system kunne ikke åbnes
installer-boot-menu-failed = Lufts opstartsmenu kunne ikke lægges på EFI-systempartitionen
installer-key-queue-failed = Lufts Secure Boot-nøgle kunne ikke sættes i kø til næste genstart

## Replacing a Linux system

installer-encryption-keeps-old = Luft kan ikke krypteres, når det beholder det gamle systems filer ved siden af sig.
installer-leftovers-failed = Det, et tidligere forsøg efterlod, kunne ikke ryddes
installer-default-failed = Luft kunne ikke gøres til det system, der starter
installer-relabel-failed = Dine filer kunne ikke mærkes til Luft
installer-set-aside-failed = Det gamle system kunne ikke lægges til side

## Things packed with Meet Luft

installer-box-unopened = Flyttekassen kunne ikke åbnes
installer-box-no-list = Flyttekassen har ingen liste over indholdet
installer-unpack-failed = Kunne ikke pakke { $path } ud
installer-wallpaper-unnamed = Baggrundsbilledet har intet navn
