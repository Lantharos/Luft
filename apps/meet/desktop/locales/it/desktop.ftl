## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = Processore Intel o AMD a 64 bit
check-processor-x64-detail = Luft funziona con questo processore.
check-processor-arm = Processore Arm
check-processor-arm-detail = Per ora Luft funziona solo con processori Intel e AMD.
check-processor-32-bit-windows = Windows a 32 bit
check-processor-32-bit-system = Sistema a 32 bit
check-processor-32-bit-detail = Luft richiede un processore Intel o AMD a 64 bit.
check-startup-uefi = Avvio con UEFI
check-startup-uefi-windows = Luft si avvia nello stesso modo moderno.
check-startup-uefi-linux = Luft aggiunge una propria voce di avvio, e { $system } continua ad avviarsi come ora.
check-startup-bios = Avvio in modalità BIOS legacy
check-startup-bios-windows = Luft richiede UEFI. Windows può effettuare il passaggio con MBR2GPT, poi puoi attivare UEFI nelle impostazioni del firmware.
check-startup-bios-linux = Luft richiede UEFI. Attivalo nelle impostazioni del firmware, adattando anche il sistema già presente, poi controlla di nuovo.
check-startup-mbr = Il disco usa una vecchia tabella delle partizioni
check-startup-mbr-windows = Luft richiede un disco GPT. Windows può convertirlo con MBR2GPT senza perdere file.
check-startup-mbr-linux = Luft richiede un disco GPT da cui avviarsi.
check-startup-no-esp = Nessuna partizione di sistema EFI
check-startup-no-esp-detail = Luft aggiunge i suoi file di avvio accanto a quelli già presenti nella partizione di sistema EFI, che qui non c’è.
check-startup-esp-full = La partizione di sistema EFI è piena
check-startup-esp-full-detail = Luft ha bisogno di { $size } MB lì per i suoi file di avvio. Di solito lo spazio è occupato da vecchi kernel o voci di avvio.
check-folder-fine = Nessuna partizione viene modificata
check-folder-fine-detail = Luft viene conservato come file sul tuo disco { $filesystem } e si avvia da lì.
check-folder-encrypted = I tuoi file sono su un disco crittografato
check-folder-encrypted-detail = Luft non può ancora avviarsi da un disco crittografato. Per provarlo, usa invece una chiavetta USB.
check-folder-combined = I tuoi file occupano più di una partizione
check-folder-combined-detail = Luft non può ancora avviarsi da LVM o RAID. Per provarlo, usa invece una chiavetta USB.
check-folder-filesystem = Luft non può avviarsi da { $filesystem }
check-folder-filesystem-detail = Si avvia da dischi ext4, btrfs e XFS. Per provarlo, usa invece una chiavetta USB.
check-space-free = { $size } GB liberi
check-space-free-linux = Luft occupa circa { $size } GB mentre lo provi.
check-space-up-to = Fino a { $size } GB per Luft
check-space-up-to-detail = Windows conserva i suoi file e lo spazio per crescere.
check-space-short = Spazio libero insufficiente
check-space-short-windows = Luft ha bisogno di circa { $needed } GB che Windows possa cedere. Libera { $missing } GB in Windows, ad esempio con Pulizia disco, poi controlla di nuovo.
check-space-short-linux = Luft ha bisogno di circa { $needed } GB per avviarsi. Libera { $missing } GB, poi controlla di nuovo.
check-system-replaceable = Luft può prendere il suo posto e conservare i tuoi file, il tuo account e le tue impostazioni.
check-system-single = I tuoi file sono sulla stessa partizione del sistema, quindi non è ancora possibile sostituirlo mantenendoli. Puoi comunque provare e installare Luft.
check-system-encrypted = È crittografato, quindi non è ancora possibile sostituirlo mantenendo i tuoi file.
check-system-unknown = Il suo disco è organizzato in un modo che Luft non può ancora sostituire mantenendo i tuoi file.
check-encryption-off = Windows non è crittografato
check-encryption-off-detail = Installa Luft può leggere le sue impostazioni e i tuoi dispositivi Bluetooth.
check-encryption-on = Windows è crittografato con BitLocker
check-encryption-on-detail = Nessun problema. Windows fa spazio da solo, e Meet Luft trasferisce ciò che Luft non può leggere da un disco bloccato. Tieni a portata di mano la chiave di ripristino, per sicurezza.
check-encryption-changing = BitLocker sta ancora crittografando o decrittografando
check-encryption-changing-detail = Aspetta che Windows finisca, poi torna qui. Puoi vedere a che punto è in Impostazioni, sotto Crittografia dispositivo.
check-fast-startup-on = L’avvio rapido è attivo
check-fast-startup-on-detail = Windows va in ibernazione invece di spegnersi, e questo tiene bloccato il suo disco. Meet Luft si offre di disattivarlo prima dell’installazione.
check-fast-startup-off = L’avvio rapido è disattivato
check-fast-startup-off-detail = Windows si spegne del tutto.
check-secure-boot-on = Secure Boot è attivo
check-secure-boot-on-detail = Può restare attivo. Luft chiede una volta, su una schermata blu, di aggiungere la sua chiave.
check-secure-boot-off = Secure Boot è disattivato
check-secure-boot-off-detail = Luft funziona anche senza, ma i giochi con anti-cheat lo richiedono. { $turningOn }
check-secure-boot-restart-into = Meet Luft può riavviare nelle impostazioni del firmware, dove si trova in { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft può riavviare nelle impostazioni del firmware, dove di solito si trova in Security o Boot.
check-secure-boot-turn-on = Per attivarlo, riavvia e premi { $key } quando compare il logo { $maker }, poi vai in { $place }.
check-secure-boot-turn-on-anywhere = Per attivarlo, apri le impostazioni del firmware durante l’avvio del computer e cerca in Security o Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security, poi Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, poi Secure Boot
check-firmware-place-security-or-advanced = Security o Advanced, poi Secure Boot Configuration
check-firmware-place-security-or-boot = Security o Boot, poi Secure Boot
check-firmware-place-boot = Boot, poi Secure Boot
check-firmware-place-settings = Settings, poi Security, poi Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 su un ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 o Canc
check-firmware-key-delete = Canc
check-firmware-key-volume-up = volume su

## More of the computer's hardware

check-tpm-detail = Se Luft è crittografato, può sbloccarsi da solo all’avvio del computer.
check-tpm-missing = Nessun TPM 2.0
check-tpm-missing-detail = Se crittografi Luft, chiede una passphrase a ogni avvio.
check-graphics = Grafica
check-graphics-detail = Funziona subito.
check-graphics-nvidia = Luft si installa con il driver di NVIDIA.
check-wifi-missing = Nessuna Wi-Fi
check-wifi-missing-detail = In Luft usa un cavo di rete, o niente del tutto.
check-wifi-detail = Funziona in Luft.
check-wifi-broadcom = Alcuni chip Wi-Fi Broadcom richiedono un driver che Luft non include. Tieni a portata di mano un cavo di rete o un telefono per il tethering USB.
check-start-entries = { $count ->
    [one] Una vecchia voce di avvio
   *[other] { $count } vecchie voci di avvio
}
check-start-entries-detail = { $count ->
    [one] { $names } punta a un sistema che non è più su questo PC. Può essere rimossa.
   *[other] { $names } puntano a sistemi che non sono più su questo PC. Possono essere rimosse.
}
check-download-unavailable = Al momento non è possibile scaricare Luft
check-download-unavailable-detail = Meet Luft scarica circa 3 GB. Verifica di essere online e controlla di nuovo, oppure usa una ISO di Luft che hai già.

## Choosing a Luft ISO file

iso-dialog-title = Scegli una ISO di Luft
iso-dialog-filter = ISO di Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Log di Luft { $name }
logs-no-desktop = Impossibile trovare il desktop
logs-not-saved = Impossibile salvare i log della prova di Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Il processo di supporto di Meet Luft non si è avviato: { $error }
helper-not-allowed = Meet Luft non ha avuto il permesso di lavorare sul disco
helper-stopped = Il processo di supporto di Meet Luft si è interrotto
helper-stopped-because = Il processo di supporto di Meet Luft si è interrotto: { $error }
helper-pipe-failed = Impossibile comunicare con il processo di supporto di Meet Luft: { $error }
helper-pipe-hijacked = { $pipe } è stato aperto da qualcosa di diverso dal processo di supporto di Meet Luft
helper-record-not-saved = Impossibile annotare ciò che Meet Luft ha creato: { $error }
helper-no-room-yet = Prima fai spazio per Luft.
helper-not-ready-linux = Prima prepara Luft.
helper-not-ready-to-start-windows = Luft non è ancora pronto per avviarsi. Prima fagli spazio.
helper-not-ready-to-start-linux = Luft non è ancora pronto per avviarsi. Prima preparalo.
helper-update-unfinished = L’aggiornamento di Luft non è stato completato. Prima aggiornalo di nuovo.
helper-room-too-small = Luft ha bisogno di più spazio.
helper-room-shortfall = Windows può cedere { $available } GB e Luft ha bisogno di { $needed } GB.
helper-box-shortfall = Windows può cedere altri { $available } GB e gli elementi scelti richiedono { $needed } GB.
helper-bluetooth-unreadable = Impossibile aprire le impostazioni Bluetooth di Windows
helper-registry-not-opened = Impossibile aprire { $key }: { $error }
helper-registry-not-changed = Impossibile modificare { $value }: { $error }
helper-registry-not-saved = Impossibile salvare { $file }: { $error }
helper-restart-failed = Il computer non si è riavviato
helper-windows-restart-failed = Windows non si è riavviato: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Questo PC non si avvia con UEFI
firmware-variable-unreadable = Impossibile leggere { $name } dal firmware: { $error }
firmware-variable-not-saved = Impossibile salvare { $name } nel firmware: { $error }
firmware-entries-full = Il firmware non ha spazio per un’altra voce di avvio
firmware-entry-kept = Windows ha mantenuto la voce di avvio { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Impossibile elencare i dischi: { $error }
drive-of-path-unknown = Impossibile capire quale disco contiene { $path }
drive-windows-folder-missing = Cartella di Windows non trovata
drive-windows-drive-missing = Disco di Windows non trovato
drive-windows-drive-missing-because = Disco di Windows non trovato: { $error }
drive-windows-partition-missing = Partizione di Windows non trovata
drive-volume-missing = Volume { $path } non trovato
drive-storage-error = { $what } (errore di archiviazione di Windows { $code })
drive-shrink-size-unknown = Windows non è riuscito a stabilire quanto può ridurre la sua partizione
drive-grow-size-unknown = Windows non è riuscito a stabilire quanto può ingrandire la sua partizione
drive-resize-failed = Windows non è riuscito a cambiare le dimensioni della sua partizione
drive-create-failed = Windows non è riuscito a creare una partizione per Luft
drive-hide-failed = Windows non è riuscito a nascondere la nuova partizione in Esplora file
drive-format-failed = Windows non è riuscito a formattare la nuova partizione
drive-remove-failed = Windows non è riuscito a rimuovere una delle partizioni di Luft
drive-new-partition-missing = Nuova partizione non trovata
drive-new-partition-no-volume = La nuova partizione non ha un volume
drive-start-no-guid = La partizione di avvio non ha un GUID
drive-live-no-guid = La partizione live non ha un GUID
drive-box-no-guid = Lo scatolone del trasloco non ha un GUID
drive-guid-unreadable = Il GUID della partizione non è leggibile
drive-not-gpt = La tabella delle partizioni del disco non è GPT
drive-start-no-volume = La partizione di avvio non ha un volume
drive-live-no-volume = La partizione di Luft non ha un volume
drive-new-live-no-volume = La nuova partizione di Luft non ha un volume
drive-partitions-not-noted = Le partizioni di Luft mancano dalle note di Meet Luft
drive-partitions-gone = Le partizioni di Luft sono scomparse
drive-partition-gone = Una partizione è scomparsa
drive-start-partition-foreign = La partizione di avvio di Luft non è stata creata da Meet Luft
drive-start-partition-gone = La partizione di avvio di Luft non c’è più
drive-start-partition-not-listed = La partizione di avvio di Luft non è nella tabella delle partizioni
drive-no-esp = Questo computer non ha una partizione di sistema EFI
drive-esp-full = La partizione di sistema EFI è troppo piena per i file di avvio di Luft.
drive-esp-not-opened = Impossibile aprire la partizione di sistema EFI
drive-esp-file-unreadable = Il file { $file } della partizione di sistema EFI non è leggibile
drive-esp-no-drive = La partizione di sistema EFI non ha un disco
drive-esp-no-guid = La partizione di sistema EFI non ha un GUID
drive-no-uuid = Il disco su cui è conservato Luft non ha un UUID
drive-folder-unreadable = Luft non può avviarsi dal disco su cui si trovano i tuoi file.
drive-folder-not-startable = Impossibile avviare da { $folder }

## Errors while getting Luft

live-no-home-folder = Non c’è una cartella home in cui conservare Luft
live-no-app-data-folder = Non c’è una cartella dei dati locali delle app in cui conservare Luft
live-pointer-unreadable = Le informazioni sull’ultima versione di Luft non sono leggibili
live-not-published = Luft non è pubblicato lì
live-checksum-unreadable = Il file di checksum non è leggibile
live-checksum-not-read = Impossibile leggere il checksum di Luft: { $error }
live-download-damaged = Il download si è danneggiato durante il trasferimento. Riprova.
live-download-incomplete = Nel Luft scaricato manca { $file }
live-download-not-resumable = Il server non può riprendere il download
live-not-signed = { $iso } non è firmato
live-signature-unreadable = La firma di { $iso } non è leggibile
live-signature-wrong-key = { $iso } non è firmato da Lantharos
live-signature-other-iso = La firma è per { $signed }, non per { $iso }
live-iso-out-of-order = I file della ISO non sono in un ordine che Meet Luft può leggere
live-iso-not-iso = Questa non è un’immagine ISO
live-iso-no-root = La ISO non ha una cartella principale
live-iso-no-joliet = La ISO non ha nomi Joliet
live-not-removed = Impossibile rimuovere { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = La chiavetta non c’è più. Ricollegala e sceglila di nuovo.
stick-too-small = Luft non entra in questa chiavetta. Usane una da 4 GB o più.
stick-damaged = La ISO non corrisponde al suo checksum. Potrebbe essersi danneggiata durante il trasferimento.
stick-read-back-differs = Rileggendo la chiavetta, i dati non corrispondono a quelli scritti. Potrebbe essere usurata: provane un’altra.
stick-download-unavailable = Al momento non è possibile scaricare Luft: { $error }
stick-download-failed = Impossibile scaricare Luft: { $error }
stick-checksum-unreadable = Impossibile leggere il checksum della ISO: { $error }
stick-file-unreadable = Impossibile leggere { $path }: { $error }
stick-iso-unreadable = Impossibile leggere la ISO: { $error }
stick-iso-no-name = La ISO non ha un nome
stick-iso-ended-early = La ISO è terminata prima del previsto
stick-iso-already-there = { $name } è già sulla chiavetta.
stick-no-room = Non c’è spazio per Luft sulla chiavetta. Prima libera { $size } MB.
stick-older-not-removed = Impossibile rimuovere il Luft precedente: { $error }
stick-copy-stopped = La copia di Luft sulla chiavetta si è interrotta: { $error }
stick-not-opened = Impossibile aprire la chiavetta: { $error }
stick-write-stopped = La scrittura sulla chiavetta si è interrotta: { $error }
stick-not-synced = La chiavetta non ha salvato tutto: { $error }
stick-read-back-failed = Impossibile rileggere la chiavetta: { $error }
stick-in-use = La chiavetta è ancora in uso: { $error }
stick-device-in-use = { $device } è ancora in uso: { $error }
stick-volume-not-opened = Impossibile aprire il volume della chiavetta: { $error }
stick-volume-in-use = La chiavetta è ancora in uso. Chiudi i programmi con file aperti sulla chiavetta e riprova ({ $error })
stick-not-dismounted = Windows non è riuscito a rilasciare la chiavetta: { $error }
stick-not-cleared = Windows non è riuscito a svuotare la chiavetta: { $error }
stick-not-refreshed = Windows non è riuscito a rileggere la chiavetta: { $error }
stick-not-ventoy = Questa chiavetta non usa più Ventoy.
stick-ventoy-not-opened = Impossibile aprire la partizione di Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows non riesce ad aprire la partizione di Ventoy
stick-udisks-missing = Meet Luft ha bisogno di UDisks per usare la chiavetta: { $error }
