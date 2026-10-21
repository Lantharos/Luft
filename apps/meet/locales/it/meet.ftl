## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Indietro
meet-cancel = Annulla
meet-continue = Continua
meet-try-again = Riprova
meet-restart = Riavvia
meet-remove = Rimuovi
meet-keep-it = Mantienilo
meet-close = Chiudi
meet-restart-title = Riavviare ora?
meet-not-yet = Non ancora
meet-iso-use = Usa una ISO che ho già
meet-iso-using = Con la tua ISO di Luft
meet-nightly = Build nightly
meet-channel-nightly = Meet Luft userà le build nightly
meet-channel-latest = Meet Luft userà di nuovo le versioni ufficiali
meet-undo = Annulla
meet-logs-saved = Log della prova di Luft salvati sul desktop
meet-logs-show = Mostra
meet-logs-none = Non ci sono ancora log della prova di Luft
meet-logs-failed = Impossibile salvare i log della prova di Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Impossibile completare l’analisi di questo computer.
   *[windows] Impossibile completare l’analisi di questo PC.
}
problem-room = La creazione dello spazio per Luft non è stata completata.
problem-room-linux = La preparazione di Luft non è stata completata.
problem-update = L’aggiornamento di Luft non è stato completato.
problem-download = Il download di Luft si è interrotto. Verifica di essere online.
problem-pack = L’imballaggio delle tue cose non è stato completato.
problem-remove = La rimozione di Luft non è stata completata.
problem-restart = Impossibile preparare il riavvio.
problem-tidy = Impossibile rimuovere le vecchie voci di avvio.
problem-firmware = Impossibile aprire le impostazioni del firmware.
problem-folders = Impossibile analizzare le tue cartelle.
problem-sticks = Impossibile cercare le unità USB.
problem-stick = La creazione della chiavetta non è stata completata.
problem-offer = Al momento non è possibile scaricare Luft. Verifica di essere online, oppure usa una ISO che hai già.
problem-declined = { $platform ->
    [linux] Meet Luft ha bisogno del tuo permesso per lavorare sul disco. Inserisci la password quando viene richiesta.
   *[windows] Meet Luft ha bisogno del tuo permesso per lavorare sul disco. Scegli Sì quando Windows lo chiede.
}

## First screen

hello-intro = { $platform ->
    [linux] Prova Luft direttamente da qui, senza chiavetta USB. Se ti piace, Luft può prendere il posto di questo sistema e conservare i tuoi file.
   *[windows] Luft può stare proprio accanto a Windows. Provalo prima senza installare nulla, e porta con te le tue cose quando vuoi.
}
hello-check = { $platform ->
    [linux] Controlla questo computer
   *[windows] Controlla questo PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Analisi di questo computer
   *[windows] Analisi di questo PC
}
check-ready-title = { $platform ->
    [linux] Questo computer è pronto per Luft
   *[windows] Questo PC è pronto per Luft
}
check-blocked-title = Ci siamo quasi
check-moment = Ci vuole un momento.
check-slow = Windows sta calcolando quanto spazio può cedere. Su un disco grande può richiedere qualche minuto.
check-blocked-description = Prima che Luft possa trasferirsi qui, serve una modifica. Ecco cosa fare.
check-found-description = Ecco cosa ha trovato Meet Luft.
check-checking = Controllo del disco, del firmware e dell’hardware…
check-again = Controlla di nuovo
check-action-firmware = Apri le impostazioni del firmware
check-action-tidy = Fai pulizia
check-firmware-title = Riavviare nelle impostazioni del firmware?
check-firmware-description = Prima salva il lavoro in corso. Lì attiva Secure Boot e salva, e il computer si riavvia come al solito.
check-tidy-title = Rimuovere le vecchie voci di avvio?
check-tidy-description = Puntano solo a sistemi che non ci sono più. Windows e tutto il resto si avviano come prima.
check-get-ready-title = Preparare Luft?
check-get-ready-file = Meet Luft copia Luft dalla tua ISO in una cartella di questo computer e aggiunge una voce di avvio. Nessuna partizione viene modificata.
check-get-ready-download = Meet Luft scarica Luft, circa { $size }, in una cartella di questo computer e aggiunge una voce di avvio. Nessuna partizione viene modificata.
check-get-ready-confirm = Prepara

## Choosing how much of the Windows drive Luft gets

room-title = Quanto spazio dare a Luft?
room-description = Windows si riduce per fare spazio a Luft. I tuoi file in Windows restano esattamente dove sono.
room-live = Windows conserva lo spazio per crescere. Luft riserva anche { $size } per avviarsi, che restituisce una volta installato.
room-make = Fai spazio
room-confirm-title = Dare { $size } a Luft?
room-confirm-file = Windows riduce il suo disco, poi Meet Luft copia Luft dalla tua ISO. Tieni il PC collegato alla corrente.
room-confirm-download = Windows riduce il suo disco, poi Meet Luft scarica Luft, circa { $size }. Tieni il PC collegato alla corrente e a internet.

## Luft is ready on Windows

ready-title = Luft è pronto
ready-description = Scegli come vuoi conoscerlo. Dopo, Windows si avvia come al solito, a meno che tu non installi Luft e lo scelga.
ready-update-title = Scarica l’ultima versione di Luft
ready-update-description = È uscita una build più recente. Sostituisce questa e mantiene lo spazio e tutto ciò che hai imballato.
ready-try-title = Prova Luft
ready-try-description = Riavvia in Luft senza installare nulla. La prossima volta Windows si avvia come al solito.
ready-box-description = Metti in uno scatolone documenti, foto, reti Wi-Fi e altro: Luft lo disfa una volta installato.
ready-box-packed = Nello scatolone: { $size }
ready-install-title = Installa Luft
ready-install-description = Riavvia nel programma di installazione. I { $size } accanto a Windows lo stanno già aspettando.
ready-stick-description = Metti Luft su una chiavetta per avviarlo su qualsiasi computer.
ready-remove = Rimuovi Luft da questo PC
ready-restart-try = Prima salva il lavoro in corso. Luft si apre in circa un minuto, e il riavvio successivo ti riporta a Windows.
ready-restart-install = Prima salva il lavoro in corso. Il programma di installazione si apre in circa un minuto, e non cambia nulla finché non confermi lì.
ready-fast-startup-title = Disattiva l’avvio rapido in Windows
ready-fast-startup-description = Così Windows si spegne del tutto, e audio, Wi-Fi e Bluetooth ripartono da zero in Luft.
ready-clock-title = Mantieni l’ora corretta in entrambi
ready-clock-description = Windows legge l’orologio del computer come fa Luft, così l’ora non salta più quando passi dall’uno all’altro.
ready-remove-title = Rimuovere Luft da questo PC?
ready-remove-description = Meet Luft elimina tutto ciò che ha aggiunto, compreso lo scatolone del trasloco, e restituisce a Windows tutto il suo spazio.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Scegli come vuoi conoscerlo. { $system } continua ad avviarsi come al solito finché non decidi altrimenti.
linux-ready-this-system = questo sistema
linux-ready-update-description = È uscita una build più recente. Sostituisce quella che conserva Meet Luft e mantiene i log delle prove.
linux-ready-try-description = Riavvia in Luft senza cambiare nulla. La prossima volta { $system } si avvia come al solito.
linux-ready-replace-title = Sostituisci { $system }
linux-ready-replace-description = Luft prende il suo posto e conserva i tuoi file, il tuo account, le reti Wi-Fi e gli altri dischi. Il vecchio sistema resta finché non lo rimuovi.
linux-ready-install-description = Riavvia nel programma di installazione per mettere Luft su un altro disco o nello spazio libero.
linux-ready-remove = Rimuovi Luft da questo computer
linux-ready-restart-try = Prima salva il lavoro in corso. Luft si apre in circa un minuto, e il riavvio successivo ti riporta a { $system }.
linux-ready-restart-replace = Prima salva il lavoro in corso. Il programma di installazione si apre con { $system } già scelto da sostituire, e mostra cosa resta prima di cambiare qualcosa.
linux-ready-remove-title = Rimuovere Luft da questo computer?
linux-ready-remove-description = Meet Luft elimina i file di Luft, i suoi file di avvio e la sua voce di avvio. Tutto il resto resta com’è.

## Packing things to take along to Luft (the moving box)

box-title = Porta con te le tue cose
box-description = Scegli cosa portare. Luft lo trasferisce nel tuo nuovo account una volta installato, e da Windows non viene rimosso nulla.
box-looking = Analisi delle cartelle…
box-folder-desktop = Desktop
box-folder-documents = Documenti
box-folder-downloads = Download
box-folder-music = Musica
box-folder-pictures = Immagini
box-folder-videos = Video
box-folder-size = { $size }, { $files ->
    [one] { $files } file
   *[other] { $files } file
}
box-wifi-title = Reti Wi-Fi
box-wifi-description = Con le loro password, così Luft è subito online
box-bluetooth-title = Dispositivi Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } dispositivo, pronto senza doverlo associare di nuovo
   *[other] { $devices } dispositivi, pronti senza doverli associare di nuovo
}
box-wallpaper-title = Sfondo
box-wallpaper-description = L’immagine sul desktop di Windows
box-account-title = Il tuo nome e la tua immagine
box-total-slow = { $size }, da imballare in circa { $minutes ->
    [one] { $minutes } minuto
   *[other] { $minutes } minuti
}
box-pack = Imballa

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Creazione dello spazio
    .description = Windows sta spostando i suoi file per fare spazio. Può richiedere qualche minuto.
working-partitioning = Preparazione dello spazio di Luft
    .description = Preparazione delle partizioni da cui Luft si avvia.
working-downloading = Trasferimento di Luft
    .description = Luft viene copiato direttamente nel suo spazio e verificato strada facendo.
working-packing = Imballaggio delle tue cose
    .description = Copia di tutto ciò che hai scelto nello scatolone del trasloco. Le cartelle grandi richiedono un po’ di tempo.
working-removing = Rimozione di Luft
    .description = Lo spazio torna a Windows.
working-removing-linux = Rimozione di Luft
    .description = Rimozione dei suoi file e della sua voce di avvio.
working-writing = Creazione della chiavetta
    .description = Luft viene scritto sull’intera chiavetta. Tienila collegata.
working-copying = Aggiunta di Luft a Ventoy
    .description = Luft viene copiato accanto alle altre ISO sulla chiavetta. Tienila collegata.
working-verifying = Verifica della chiavetta
    .description = Rilettura completa per assicurarsi che si avvii.
working-stick-downloading = Download di Luft
    .description = Viene verificato strada facendo e conservato, così la prossima chiavetta è più veloce.
working-progress = { $done } di { $total }
working-keep-open = Tieni aperta questa finestra.

## After Luft was removed

removed-title = Tutto come prima
removed-description = { $platform ->
    [linux] I file di Luft e la sua voce di avvio non ci sono più, e il computer si avvia esattamente come prima. Torna quando vuoi.
   *[windows] Le partizioni di Luft e la sua voce di avvio non ci sono più, e Windows ha di nuovo tutto il suo spazio. Torna quando vuoi.
}

## Making a USB stick

stick-title = Crea una chiavetta USB
stick-description = Luft si avvia da lì su qualsiasi computer, per provarlo o installarlo.
stick-looking = Ricerca delle unità USB…
stick-none = Collega una chiavetta USB da { $size } o più. Comparirà qui.
stick-drives-label = Unità USB
stick-offer = { $name }, { $size }
stick-make = Crea la chiavetta
stick-drive-empty = Vuota
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Troppo piccola per Luft
stick-ventoy-title = Questa chiavetta usa Ventoy
stick-ventoy-description = Aggiungere Luft, o cancellare l’intera chiavetta e farne una chiavetta Luft?
stick-erase-it = Cancellala
stick-add = Aggiungi Luft
stick-replace-title = Sostituire il Luft che contiene?
stick-replace-description = { $count ->
    [one] { $names } è già su questa chiavetta. Il nuovo Luft può prenderne il posto.
   *[other] { $names } sono già su questa chiavetta. Il nuovo Luft può prenderne il posto.
}
stick-keep = { $count ->
    [one] Mantienili entrambi
   *[other] Mantienili tutti
}
stick-replace = Sostituisci
stick-full-title = Non c’è spazio per Luft
stick-full-description = Luft richiede { $needed } e su questa chiavetta ci sono { $free } liberi. Fai spazio sulla chiavetta, oppure cancellala e trasformala in una chiavetta Luft.
stick-erase-title = Cancellare { $name }?
stick-erase-description = Tutto ciò che si trova su questa chiavetta da { $size } viene cancellato e sostituito da Luft. L’operazione non può essere annullata.
stick-erase-confirm = Cancella e crea la chiavetta
stick-done-title = La tua chiavetta Luft è pronta
stick-done-ventoy-title = Luft è sulla tua chiavetta Ventoy
stick-done-take-out = Ora puoi rimuoverla.
stick-done-eject = Espellila prima di rimuoverla.
stick-done-start = Per avviare il computer dalla chiavetta, collegala e sceglila nel menu di avvio del computer, che si apre con un tasto come F12, F8 o Esc subito dopo l’accensione.
stick-done-ventoy-key = Con Secure Boot attivo, al primo avvio Ventoy chiede una volta di registrare la propria chiave.
stick-done = Fine
stick-done-another = Creane un’altra
