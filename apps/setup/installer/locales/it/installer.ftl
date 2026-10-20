## Errors shown in Install Luft and first-run setup

installer-not-allowed = Non hai l’autorizzazione per farlo.
installer-stopped = Il programma di installazione si è interrotto inaspettatamente.
installer-request-invalid = La richiesta non è valida: { $error }
installer-settings-invalid = Le impostazioni non sono valide: { $error }
installer-busy = Luft è già in fase di installazione.
installer-account-exists = L’account è già stato creato.

## Choosing what to install

installer-no-image = Non c’è nessuna immagine { $variant } da installare.
installer-read-failed = Impossibile leggere { $path }
installer-parse-failed = Impossibile analizzare { $path }
installer-write-failed = Impossibile scrivere { $path }

## Checking the destination

installer-drive-gone = Quel disco non è più collegato.
installer-drive-unusable = Luft non può essere installato su quel disco.
installer-system-gone = Quel sistema non c’è più.
installer-system-unreplaceable = Luft non può ancora sostituire { $system }.
installer-drive-running = Luft è in esecuzione proprio da quel disco, quindi non può essere cancellato.
installer-windows-unshrinkable = Impossibile ridurre Windows su quel disco.
installer-size-wont-fit = Questa dimensione non entra accanto a Windows.
installer-space-gone = Quello spazio libero non c’è più.
installer-space-too-small = Quello spazio libero è troppo piccolo per Luft.

## Account and regional settings

installer-user-name-invalid = Questo nome utente non può essere usato.
installer-full-name-invalid = Un nome non può contenere due punti, virgole o a capo.
installer-password-missing = Scegli una password.
installer-account-not-saved = Il nuovo account non è stato salvato
installer-account-missing = Il nuovo account non è presente
installer-regional-invalid = Queste impostazioni internazionali non sono valide.
installer-unknown-zone = Il nuovo sistema non conosce il fuso orario { $zone }.

## Installing

installer-esp-partition-failed = Impossibile creare la partizione di sistema EFI
installer-startup-partition-failed = Impossibile creare la partizione per i file di avvio di Luft
installer-root-partition-failed = Impossibile creare la partizione per Luft
installer-shrink-failed = Impossibile ridurre Windows
installer-no-esp = Il disco non ha una partizione di sistema EFI
installer-no-root = Non è stata creata nessuna partizione per Luft
installer-copy-failed = Impossibile copiare Luft
installer-no-deployment = Il nuovo sistema non ha un deployment
installer-deployment-unnamed = Il deployment del nuovo sistema non ha un nome
installer-deployment-unopened = Impossibile aprire il nuovo sistema
installer-boot-menu-failed = Impossibile aggiungere il menu di avvio di Luft alla partizione di sistema EFI
installer-key-queue-failed = Impossibile preparare la chiave Secure Boot di Luft per il prossimo riavvio

## Replacing a Linux system

installer-leftovers-failed = Impossibile eliminare ciò che un tentativo precedente ha lasciato
installer-default-failed = Impossibile impostare Luft come sistema che si avvia
installer-relabel-failed = Impossibile etichettare i tuoi file per Luft
installer-set-aside-failed = Impossibile mettere da parte il vecchio sistema

## Things packed with Meet Luft

installer-box-unopened = Impossibile aprire lo scatolone del trasloco
installer-box-no-list = Lo scatolone del trasloco non ha un elenco del contenuto
installer-unpack-failed = Impossibile estrarre { $path }
installer-wallpaper-unnamed = Lo sfondo non ha un nome
