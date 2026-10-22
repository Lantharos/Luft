## Shared buttons

settings-protection-cancel = Annulla
settings-protection-continue = Continua
settings-protection-close = Chiudi
settings-protection-restart = Riavvia
settings-protection-remove = Rimuovi
settings-protection-turn-on = Attiva
settings-protection-set-up = Configura

## Privacy: screen lock

settings-privacy-screen-lock = Blocco schermo
settings-privacy-screen-off = Spegnimento dello schermo
settings-privacy-screen-off-hint = Si imposta in Alimentazione e batteria
settings-privacy-screen-off-after = Dopo { $duration }
settings-privacy-screen-off-never = Mai
settings-privacy-lock-when-off = Blocca lo schermo quando si spegne
settings-privacy-lock-after = Blocca dopo
settings-privacy-lock-after-hint = Quanto aspettare dopo lo spegnimento dello schermo
settings-privacy-lock-immediately = Subito

## Privacy: location, camera and microphone

settings-privacy-location-services = Servizi di localizzazione
settings-privacy-location-services-hint = Consente alle app di sapere dove ti trovi, per mappe, meteo e fusi orari
settings-privacy-camera-allow = Consenti alle app di usare la fotocamera
settings-privacy-microphone-allow = Consenti alle app di usare il microfono

## Privacy: file history

settings-privacy-file-history = Cronologia dei file
settings-privacy-remember-files = Ricorda i file usati di recente
settings-privacy-remember-files-hint = Le app possono mostrare gli ultimi file che hai aperto
settings-privacy-keep-history = Conserva la cronologia per
settings-privacy-keep-forever = Sempre
settings-privacy-clear-history = Cancella la cronologia
settings-privacy-clear-history-hint = Dimentica subito tutti i file dell’elenco
settings-privacy-clear = Cancella
settings-privacy-clear-title = Cancellare la cronologia dei file?
settings-privacy-clear-description = Le app non mostreranno più i file che hai aperto di recente. I file restano dove sono.

## Privacy: trash and temporary files

settings-privacy-cleanup = Cestino e file temporanei
settings-privacy-empty-trash = Svuota automaticamente il Cestino
settings-privacy-delete-temp = Elimina automaticamente i file temporanei
settings-privacy-delete-temp-hint = I tuoi file nelle cartelle temporanee che nessuno ha usato di recente
settings-privacy-delete-after = Elimina dopo
settings-privacy-delete-after-hint = Quanto restano i file prima di essere rimossi

## Security: summary at the top of the page

settings-security-protected = Il dispositivo è protetto
settings-security-could-be-safer = Il dispositivo potrebbe essere più sicuro
settings-security-starts-differently-description = Se hai cambiato le impostazioni di Secure Boot, conferma la modifica perché il disco si sblocchi di nuovo da solo.
settings-security-needed-recovery-key = Il disco ha richiesto la chiave di ripristino
settings-security-needed-recovery-key-description = Collega di nuovo il chip di sicurezza perché lo sblocchi da solo.
settings-security-firmware-ready-description = Gli aggiornamenti del firmware per il tuo hardware sono pronti in Aggiornamenti.
settings-security-encrypted-secure-boot = Il disco è crittografato e Secure Boot controlla come si avvia.
settings-security-encrypted = Il disco è crittografato.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Solo software attendibile può avviare questo computer
settings-security-chip = Chip di sicurezza
settings-security-chip-description = Protegge le chiavi e controlla come si è avviato questo computer
settings-firmware-updates-ready = Gli aggiornamenti del firmware sono pronti
settings-firmware-updates-count = { $count ->
    [one] { $count } aggiornamento per il tuo hardware in Aggiornamenti
   *[other] { $count } aggiornamenti per il tuo hardware in Aggiornamenti
}

## Security: signed startup

settings-security-signed-startup = Avvio firmato
settings-security-signed-startup-on = Il menu di avvio e il sistema sono firmati per questo computer
settings-security-signed-startup-purpose = Consente di avviare questo computer solo con software firmato appositamente
settings-security-signed-startup-restart = Entra in uso dopo il riavvio
settings-security-signed-startup-missed = La chiave non è stata aggiunta all’ultimo riavvio
settings-security-signed-startup-pending = Aggiungi la chiave nella schermata blu al riavvio
settings-security-signed-startup-missed-often = La chiave non è stata aggiunta dopo alcuni riavvii
settings-security-show-steps = Mostra i passaggi
settings-security-try-again = Riprova

## Security: games with anti-cheat

settings-security-anti-cheat = Giochi con anti-cheat
settings-security-anti-cheat-ready = Pronto per i giochi con anti-cheat
settings-security-anti-cheat-removing = Rimuovi le altre chiavi nella schermata blu al riavvio
settings-security-anti-cheat-luft-key = Epic deve ancora aggiungere la chiave di Luft al suo elenco
settings-security-anti-cheat-ready-description = I giochi possono controllare come si è avviato questo computer

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Rimuovi le chiavi al riavvio
settings-security-key-steps-add = Aggiungi la chiave al riavvio
settings-security-key-steps-remove-description = Dopo il riavvio, una schermata blu chiede se rimuovere le chiavi. Aspetta solo 10 secondi, quindi premi un tasto qualsiasi appena compare.
settings-security-key-steps-add-description = Dopo il riavvio, una schermata blu chiede di una nuova chiave. Aspetta solo 10 secondi, quindi premi un tasto qualsiasi appena compare.
settings-security-key-step-choose = Scegli { $option }, poi { $next }.
settings-security-key-step-confirm = Scegli { $option }.
settings-security-key-step-code = Digita il codice qui sotto e premi { $key }.
settings-security-key-step-reboot = Scegli { $option }.
settings-security-key-enter = Invio
settings-security-key-code = Codice { $code }
settings-security-key-steps-remove-missed = Se non fai in tempo, il computer si avvia come al solito e puoi riprovare da qui.
settings-security-key-steps-add-missed = Se non fai in tempo, il computer si avvia come al solito e i passaggi ricompaiono al prossimo riavvio, con un nuovo codice.
settings-security-later = Più tardi
settings-security-restart-now = Riavvia ora

## Security: hardware security level

settings-security-hardware = Sicurezza dell’hardware
settings-security-hardware-level-0 = Il tuo hardware ha poche delle protezioni che potrebbe avere
settings-security-hardware-level-1 = Il tuo hardware ha le protezioni di base
settings-security-hardware-level-2 = Il tuo hardware ha le protezioni importanti
settings-security-hardware-level-3 = Il tuo hardware è ben protetto
settings-security-hardware-level-4 = Il tuo hardware si protegge mentre è in funzione
settings-security-hardware-level-5 = Il tuo hardware si protegge e può dimostrarlo
settings-security-hardware-description = { $summary }, livello { $level } di { $highest }.
settings-security-hardware-next = Per il livello successivo
settings-security-hardware-highest = Questo è il livello più alto che esista.
settings-security-hardware-inactive = Non attive al momento
settings-security-hardware-fix-maker = { $count ->
    [one] Solo il produttore del computer può aggiungere questa protezione, di solito con un aggiornamento del firmware:
   *[other] Solo il produttore del computer può aggiungere queste protezioni, di solito con un aggiornamento del firmware:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Questa protezione si può attivare nelle impostazioni del firmware del computer:
   *[other] Queste protezioni si possono attivare nelle impostazioni del firmware del computer:
}
settings-security-hardware-fix-system = { $count ->
    [one] Questa protezione dipende da come è configurato il sistema:
   *[other] Queste protezioni dipendono da come è configurato il sistema:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Questa protezione non è disponibile su questo computer:
   *[other] Queste protezioni non sono disponibili su questo computer:
}

## Security: USB protection

settings-usb-hold-back = Blocca i nuovi dispositivi USB
settings-usb-hold-back-description = Quelli collegati mentre il computer è bloccato aspettano finché non lo sblocchi

## Device encryption

settings-encryption = Crittografia del dispositivo
settings-encryption-unlocks-chip-pin = Si sblocca con il chip di sicurezza e il tuo PIN
settings-encryption-unlocks-chip = Si sblocca da solo con il chip di sicurezza
settings-encryption-unlocks-passphrase = Chiede la passphrase all’avvio
settings-encryption-unlocks-security-key = Si sblocca con la tua chiave di sicurezza all’avvio
settings-encryption-unlocks-recovery-key = Chiede la chiave di ripristino all’avvio

## Device encryption: other drives

settings-encryption-drives = Altre unità
settings-encryption-drives-hint = Crittografa altre unità e chiavette USB in Dischi
settings-encryption-drives-open = Apri Dischi
settings-encryption-drive-encrypting = Crittografia di un’unità, { $percent } completato
settings-encryption-drive-encrypting-paused = Crittografia di un’unità, in pausa al { $percent }
settings-encryption-drive-decrypting = Decrittografia di un’unità, { $percent } completato
settings-encryption-drive-decrypting-paused = Decrittografia di un’unità, in pausa al { $percent }
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } unità crittografata si sblocca con questo computer
   *[other] { $count } unità crittografate si sbloccano con questo computer
}

## Device encryption: unlocking the disk

settings-encryption-unlocking = Sblocco del disco
settings-encryption-starts-differently = Questo computer ora si avvia in modo diverso
settings-encryption-starts-differently-description = Le impostazioni di Secure Boot sono cambiate, quindi il disco ha chiesto la chiave di ripristino. Se la modifica è tua, confermala perché si sblocchi di nuovo da solo
settings-encryption-confirm = Conferma
settings-encryption-asked-recovery-key = Il disco ha chiesto la chiave di ripristino
settings-encryption-relink-description = Collega di nuovo il chip di sicurezza perché lo sblocchi da solo
settings-encryption-relink = Collega di nuovo
settings-encryption-chip-unlock = Sblocca con il chip di sicurezza
settings-encryption-chip-unlock-on = Finché non cambia nulla nel modo in cui si avvia questo computer
settings-encryption-chip-unlock-off = Così non devi digitare una passphrase all’avvio
settings-encryption-pin = PIN all’avvio
settings-encryption-pin-description = Lo digiti prima che il disco si sblocchi
settings-encryption-change = Cambia
settings-encryption-add-pin-row = Aggiungi un PIN all’avvio
settings-encryption-add-pin-row-description = Tiene il disco bloccato anche se qualcuno prende il computer
settings-encryption-add-pin = Aggiungi PIN
settings-encryption-new-key-description = Il disco non aveva ancora una chiave di ripristino. Conserva questa in un posto diverso da questo computer.
settings-encryption-stop-chip-title = Smettere di sbloccare con il chip di sicurezza?
settings-encryption-stop-chip-passphrase = Il computer ti chiederà la passphrase a ogni avvio.
settings-encryption-stop-chip-recovery-key = Il computer ti chiederà la chiave di ripristino a ogni avvio, quindi tienila a portata di mano.
settings-encryption-stop-chip = Smetti di sbloccare
settings-encryption-remove-pin-title = Rimuovere il PIN?
settings-encryption-remove-pin-description = Il disco tornerà a sbloccarsi da solo all’avvio del computer.
settings-encryption-remove-pin = Rimuovi PIN
settings-encryption-unlock-disk-title = Sblocca il disco
settings-encryption-unlock-disk-description = Questa modifica richiede la chiave di ripristino o la passphrase che digiti all’avvio del computer.
settings-encryption-unlock-disk-field = Chiave di ripristino o passphrase

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Chiedi anche un PIN
settings-encryption-chip-setup-description = Il chip di sicurezza del computer sblocca il disco da solo all’avvio, così non devi più digitare prima una passphrase.
settings-encryption-add-pin-title = Aggiungi un PIN
settings-encryption-add-pin-description = Lo digiterai a ogni avvio del computer. Senza PIN il disco resta bloccato, anche se qualcuno prende l’intero computer.
settings-encryption-change-pin-title = Cambia il PIN
settings-encryption-change-pin-description = Digiterai il nuovo PIN a ogni avvio del computer.
settings-encryption-change-pin = Cambia PIN
settings-encryption-relink-title = Collega di nuovo il chip di sicurezza
settings-encryption-relink-pin-description = Digita il PIN che vuoi usare all’avvio.
settings-encryption-ask-pin-step = Aggiunge un passaggio all’avvio.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = Nuovo PIN
settings-encryption-pin-length = Da { $min } a { $max } cifre
settings-encryption-pin-digits-only = Usa solo cifre
settings-encryption-pin-too-short = { $min ->
    [one] Usa almeno { $min } cifra
   *[other] Usa almeno { $min } cifre
}
settings-encryption-pin-too-long = { $max ->
    [one] Usa al massimo { $max } cifra
   *[other] Usa al massimo { $max } cifre
}
settings-encryption-pins-differ = I PIN non corrispondono
settings-encryption-confirm-field = Conferma
settings-encryption-type-again = Digitalo di nuovo

## Recovery key

settings-recovery-title = Chiave di ripristino
settings-recovery-description = Ti permette di accedere se il disco non riesce a sbloccarsi da solo
settings-recovery-show = Mostra
settings-recovery-replace = Sostituisci
settings-recovery-replace-title = Sostituire la chiave di ripristino?
settings-recovery-replace-description = La chiave attuale smette di funzionare e ne riceverai una nuova da salvare.
settings-recovery-replace-key = Sostituisci chiave
settings-recovery-shown-title = La tua chiave di ripristino
settings-recovery-shown-description = Digitala se un giorno il computer chiede una chiave di ripristino all’avvio. Conservane una copia in un posto diverso da questo computer.
settings-recovery-fresh-title = Salva la nuova chiave di ripristino
settings-recovery-fresh-description = La chiave precedente non funziona più. Conserva questa su carta o in un gestore di password.

## Passwords and keys (the keyring)

settings-passwords-title = Password e chiavi
settings-passwords-not-running = Il Portachiavi non è in esecuzione
settings-passwords-not-running-description = Le tue password e chiavi compaiono qui appena si avvia
settings-passwords-locked = Bloccato
settings-passwords-contents = { $count ->
    [0] Ancora niente di salvato
    [one] { $count } password o chiave
   *[other] { $count } password e chiavi
}
settings-passwords-protected-chip = Protetto dalla tua password e dal chip di sicurezza
settings-passwords-protected = Protetto dalla tua password
settings-passwords-unlock = Sblocca
settings-passwords-lock = Blocca
settings-passwords-seal-title = Sigilla con il chip di sicurezza
settings-passwords-seal-description = Le loro copie non si possono aprire su un altro computer
settings-passwords-seal = Sigilla
settings-passwords-fingerprint-on = Si sblocca con l’impronta digitale
settings-passwords-fingerprint-on-description = Accedere con l’impronta sblocca anche le tue password
settings-passwords-fingerprint = Sblocca con l’impronta digitale
settings-passwords-fingerprint-description = Prima aggiungi un’impronta in Utenti
settings-passwords-pin = Chiedi un PIN dopo l’impronta
settings-passwords-pin-locked = Sblocca il Portachiavi per cambiare questa opzione
settings-passwords-pin-description = Così l’impronta da sola non basta a sbloccarle
settings-passwords-lock-with-screen = Blocca insieme allo schermo
settings-passwords-lock-with-screen-description = Si bloccano e si sbloccano insieme allo schermo
settings-passwords-apps = Credenziali e attività delle app
settings-passwords-apps-locked = Sblocca il Portachiavi per vederle
settings-passwords-apps-description = Cosa conservano qui le app e quando l’hanno usato
settings-passwords-apps-allowed = Quali app possono usare le tue password
settings-passwords-apps-allowed-hint = Si imposta in App

## Passwords and keys: apps with access

settings-passwords-stores = Credenziali delle app
settings-passwords-stores-description = Credenziali che alcune app conservano qui, dove solo quell’app può leggerle.
settings-passwords-stores-count = { $count ->
    [one] { $count } credenziale salvata
   *[other] { $count } credenziali salvate
}
settings-passwords-forget = Dimentica
settings-passwords-forget-title = Dimenticare ciò che { $app } ha salvato?
settings-passwords-forget-description = { $app } perde le credenziali che conservava qui, quindi potresti dover accedere di nuovo.

## Passwords and keys: recent access

settings-passwords-history = Accessi recenti
settings-passwords-history-read = { $app } ha usato “{ $item }”
settings-passwords-history-read-unnamed = { $app } ha usato una password salvata
settings-passwords-history-saved = { $app } ha salvato “{ $item }”
settings-passwords-history-saved-unnamed = { $app } ha salvato una password
settings-passwords-history-deleted = { $app } ha eliminato “{ $item }”
settings-passwords-history-deleted-unnamed = { $app } ha eliminato una password salvata
settings-passwords-history-denied = { $app } non ha avuto il permesso di usare “{ $item }”
settings-passwords-history-denied-unnamed = { $app } non ha avuto il permesso di usare una password salvata
settings-passwords-history-signed = { $app } ha firmato con “{ $item }”
settings-passwords-history-signed-unnamed = { $app } ha firmato con una password salvata
settings-passwords-history-fewer = Mostra meno
settings-passwords-history-all = { $count ->
    [one] Mostra { $count }
   *[other] Mostra tutti e { $count }
}
settings-passwords-history-clear = Cancella la cronologia
settings-passwords-history-clear-description = Dimentica quali app hanno usato il Portachiavi e quando
settings-passwords-history-clear-button = Cancella
settings-passwords-history-clear-title = Cancellare gli accessi recenti?
settings-passwords-history-clear-confirm = L’elenco delle app che hanno usato il Portachiavi, e di quando, viene cancellato. Le password e le chiavi salvate restano come sono.

## Passwords and keys: SSH keys

settings-passwords-ssh = Chiavi SSH
settings-passwords-ssh-description = Chiavi per accedere ai server, conservate al sicuro nel Portachiavi.
settings-passwords-ssh-unnamed = Chiave senza nome
settings-passwords-ssh-in-chip = Conservata nel chip di sicurezza
settings-passwords-ssh-added = Aggiunta { $when }
settings-passwords-ssh-copy = Copia la chiave pubblica di { $name }
settings-passwords-ssh-remove = Rimuovi { $name }
settings-passwords-ssh-confirm = Chiedi prima di ogni uso
settings-passwords-ssh-confirm-label = Chiedi prima di ogni uso di { $name }
settings-passwords-ssh-add-row = Aggiungi una chiave
settings-passwords-ssh-use = Usa queste chiavi con SSH
settings-passwords-ssh-use-description = Copia la riga che indica a SSH dove trovarle
settings-passwords-ssh-copy-line = Copia { $line }
settings-passwords-ssh-remove-title = Rimuovere “{ $name }”?
settings-passwords-ssh-remove-chip = Esiste solo nel chip di sicurezza di questo computer, quindi sparisce per sempre. I server che accettano solo questa chiave non ti faranno più entrare con essa.
settings-passwords-ssh-remove-description = I server che accettano solo questa chiave non ti faranno più entrare con essa. L’operazione non si può annullare.
settings-passwords-ssh-add-title = Aggiungi una chiave SSH
settings-passwords-ssh-add-description = Viene creata una nuova chiave su questo computer. Copia la sua chiave pubblica sui server a cui vuoi accedere.
settings-passwords-ssh-name = Nome
settings-passwords-ssh-name-placeholder = Per esempio, portatile di lavoro
settings-passwords-ssh-chip = Conservala nel chip di sicurezza
settings-passwords-ssh-chip-description = Non potrà mai essere copiata fuori da questo computer, nemmeno da te
settings-passwords-ssh-chip-unsupported = Il chip di sicurezza di questo computer non può contenere chiavi SSH
settings-passwords-ssh-add = Aggiungi chiave

## Passkeys

settings-passkeys-title = Passkey
settings-passkeys-unavailable = Sblocca il Portachiavi per vedere le tue passkey.
settings-passkeys-chip-fingerprint = Sigillate dal chip di sicurezza di questo computer. Ogni accesso chiede l’impronta digitale o la password.
settings-passkeys-chip-password = Sigillate dal chip di sicurezza di questo computer. Ogni accesso chiede la password.
settings-passkeys-password-fingerprint = Crittografate con la tua password. Ogni accesso chiede l’impronta digitale o la password.
settings-passkeys-password = Crittografate con la tua password. Ogni accesso chiede la password.
settings-passkeys-last-used = Ultimo utilizzo: { $when }
settings-passkeys-never-used = Mai usata
settings-passkeys-password-only = Protetta dalla tua password
settings-passkeys-unreachable = I browser non riescono a raggiungere le tue passkey
settings-passkeys-unreachable-description = Tornano disponibili appena il servizio delle passkey è in esecuzione
settings-passkeys-rename-label = Rinomina la passkey per { $site }
settings-passkeys-remove-label = Rimuovi la passkey per { $site }
settings-passkeys-empty = Ancora nessuna passkey
settings-passkeys-empty-description = Quelle create dai siti vengono salvate qui per tutti i browser
settings-passkeys-remove-title = Rimuovere questa passkey?
settings-passkeys-remove-description = Non potrai più accedere a { $site } con questa passkey, quindi assicurati di avere un altro modo per entrare.
settings-passkeys-rename-title = Rinomina la passkey
settings-passkeys-rename-description = Dai alla passkey per { $site } un nome che riconoscerai.
settings-passkeys-name = Nome
settings-passkeys-save = Salva

## Apps

settings-apps-defaults = App predefinite
settings-apps-defaults-description = Usate quando apri link, file e cartelle
settings-apps-browser = Browser web
settings-apps-email = Email
settings-apps-calendar = Calendario
settings-apps-music = Musica
settings-apps-videos = Video
settings-apps-photos = Foto
settings-apps-text-editor = Editor di testo
settings-apps-files = File
settings-apps-archives = Archivi
settings-apps-choose = Scegli
settings-apps-startup = Avvio
settings-apps-startup-description = Queste app si aprono quando accedi
settings-apps-startup-app = Apri { $app } all’accesso
settings-apps-startup-add = Aggiungi app
settings-apps-startup-add-title = Aggiungi un’app all’avvio
settings-apps-startup-add-description = Scegli un’app da aprire ogni volta che accedi.
settings-apps-search = Cerca app
settings-apps-no-match = Nessuna app corrisponde alla ricerca
settings-apps-cancel = Annulla

## Apps: permissions

settings-apps-permissions = Autorizzazioni
settings-apps-location = Posizione
settings-apps-camera = Fotocamera
settings-apps-clipboard = Appunti in background
settings-apps-full-access = Accesso completo
settings-apps-full-access-hint = Funziona fuori dalla sua sandbox e può fare tutto ciò che fa un programma che avvii tu. La rimozione vale dalla prossima apertura.
settings-apps-full-access-remove = Rimuovi
settings-apps-full-access-remove-app = Rimuovi l’accesso completo a { $app }
settings-apps-passwords = Password salvate
settings-apps-passwords-forget = Dimentica
settings-apps-passwords-forget-app = Fai chiedere di nuovo a { $app }
settings-apps-permissions-allowed = { $allowed } su { $total } consentite
settings-apps-permissions-description = Le app in una sandbox hanno i propri file e solo ciò che consenti qui.
settings-apps-sandbox-only = Niente oltre la sua sandbox
settings-apps-folders = Cartelle
settings-apps-folders-hint = Dalla prossima apertura potrà leggere e modificare tutto il contenuto di queste cartelle.
settings-apps-folders-count = { $count ->
    [one] { $count } cartella
   *[other] { $count } cartelle
}
settings-apps-folder-add = Aggiungi cartella
settings-apps-folder-remove = Rimuovi
settings-apps-folder-remove-app = Smetti di condividere { $folder }
settings-apps-usb = Dispositivi USB
settings-apps-usb-hint = Come chiavi di sicurezza, telefoni e microcontrollori
settings-apps-serial = Dispositivi seriali
settings-apps-serial-hint = Come stampanti 3D e schede collegate via USB
settings-apps-full-access-off = Funziona in una sandbox. L'accesso completo la rimuove.
settings-apps-full-access-give = Dai accesso completo
