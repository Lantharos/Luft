## Buttons used across steps

setup-continue = Continua
setup-back = Indietro
setup-cancel = Annulla
setup-not-now = Non ora
setup-try-again = Riprova
setup-restart = Riavvia
setup-restart-now = Riavvia ora
setup-restart-later = Riavvia più tardi
setup-saving = Salvataggio…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Installazione di Luft
setup-installing-progress = Installazione, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Cerca
setup-picker-no-match = Nessuna corrispondenza

## Welcome step: language, keyboard and time zone

setup-region-title = Ti diamo il benvenuto in Luft
setup-region-language = Lingua
setup-region-keyboard = Tastiera
setup-region-time-zone = Fuso orario
setup-region-intro = Iniziamo con la configurazione. Scegli lingua, tastiera e fuso orario.
setup-region-intro-guessed-computer = Iniziamo con la configurazione. Abbiamo ricavato queste impostazioni dal tuo computer: correggi quello che non va.
setup-region-intro-guessed = Iniziamo con la configurazione. Abbiamo ricavato { $guesses }: correggi quello che non va.
setup-region-guess-from-computer = { $fields } dal tuo computer
setup-region-guess-from-network = { $fields } dalla tua rete
setup-region-field-language = la lingua
setup-region-field-keyboard = la tastiera
setup-region-field-time-zone = il fuso orario

## Where Luft goes

setup-destination-choose-title = Dove vuoi installare Luft?
setup-destination-choose-description = Scegli come Luft trova posto su questo computer. Non cambia nulla finché non confermi.
setup-destination-alongside-title = Fai spazio accanto a Windows
setup-destination-alongside-description = Windows si riduce per fare spazio a Luft. I tuoi file in Windows restano come sono.
setup-destination-whole-title = Scegli un disco
setup-destination-whole-description = Luft occupa l’intero disco. Tutto ciò che contiene viene cancellato.
setup-destination-custom-title = Scegli lo spazio per Luft
setup-destination-custom-description = Usa Dischi per organizzare i dischi a modo tuo.
setup-destination-replace-title = Sostituisci { $system }
setup-destination-replace-description = Luft prende il suo posto e conserva ciò che è tuo.
setup-destination-meet-title = Accanto a Windows
setup-destination-meet-description = Meet Luft ha già fatto spazio, quindi Windows resta esattamente com’è.
setup-destination-meet-drive-title = Su { $drive }
setup-destination-meet-drive-description = Meet Luft ha già fatto spazio su un altro disco, e Luft si avvia da lì con i propri file di avvio.
setup-destination-looking = Analisi dei dischi…

setup-destination-meet-choice = Accanto a Windows
setup-destination-meet-choice-description = Usa i { $size } che Meet Luft ha preparato accanto a Windows.
setup-destination-meet-drive-choice = Su { $drive }
setup-destination-meet-drive-choice-description = Usa i { $size } che Meet Luft ha preparato su { $drive }.
setup-destination-alongside-choice = Accanto a { $windows }
setup-destination-alongside-choice-description = Mantieni Windows e i suoi file e dai a Luft una parte del suo disco.
setup-destination-replace-choice = Sostituisci { $system }
setup-destination-replace-choice-description = Mantieni file, account e impostazioni e lascia che Luft prenda il suo posto.
setup-destination-whole-choice = Usa un intero disco
setup-destination-whole-choice-description = Cancella un disco e dallo tutto a Luft.
setup-destination-try-choice = Prova Luft e basta
setup-destination-try-choice-description = Dai prima un’occhiata. Non viene installato nulla e i dischi restano intatti.
setup-destination-custom-choice = Personalizzato
setup-destination-custom-choice-description = Organizza tu le partizioni in Dischi.

setup-destination-more-options = Altre opzioni
setup-destination-starting = Avvio…
setup-destination-replace = Sostituisci
setup-destination-install = Installa Luft

## Confirming where Luft goes

setup-confirm-replace-title = Sostituire { $system }?
setup-confirm-erase-title = Cancellare { $drive }?
setup-confirm-shrink-title = Ridurre Windows a { $size }?
setup-confirm-meet-title = Installare Luft accanto a Windows?
setup-confirm-meet-drive-title = Installare Luft su { $drive }?
setup-confirm-free-title = Installare Luft nello spazio libero?
setup-confirm-replace-keep-old = Luft inizia subito a copiare. Il vecchio sistema non si avvierà più e i suoi file restano finché non li rimuovi.
setup-confirm-replace-erase-old = Luft inizia subito a copiare. Il vecchio sistema viene cancellato definitivamente, mentre i tuoi file restano dove sono.
setup-confirm-erase-description = Tutto ciò che si trova su questo disco viene cancellato definitivamente, compresi altri sistemi e file.
setup-confirm-install-description = Luft inizia subito a copiare. Nel frattempo puoi configurare il tuo account.
setup-confirm-erase = Cancella e installa
setup-confirm-install = Installa

## Making room next to Windows

setup-alongside-hint = Trascina per dividere { $drive } tra Windows e Luft. Windows conserva tutti i suoi file e un po’ di spazio per crescere.
setup-windows-bitlocker = Windows tiene questo disco bloccato con BitLocker, quindi Luft non può farci spazio. In Windows disattiva la crittografia del dispositivo, oppure riduci il disco in Gestione disco e scegli lo spazio libero in Personalizzato.
setup-windows-hibernated = Windows è in sospensione o è stato spento con l’avvio rapido, quindi il suo disco non può essere modificato in sicurezza. Avvia Windows, tieni premuto Maiusc mentre scegli Arresta il sistema, poi avvia di nuovo Luft.
setup-windows-dirty = Il disco di Windows ha prima bisogno di un rapido controllo. Avvia Windows, riavvialo una volta, poi avvia di nuovo Luft.
setup-windows-full = Windows ha bisogno di quasi tutto il suo disco. Libera circa { $size } in Windows, poi avvia di nuovo Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Quello che hai preparato in Windows, { $size }, viene trasferito nel tuo nuovo account.

## Windows options

setup-windows-fast-startup = Disattiva l’avvio rapido in Windows
setup-windows-fast-startup-description = Così Windows si spegne del tutto: audio, Wi-Fi e Bluetooth ripartono da zero in Luft e il suo disco resta accessibile.
setup-windows-clock = Mantieni l’ora corretta in entrambi
setup-windows-clock-description = Windows legge l’orologio del computer come fa Luft, così l’ora non salta più quando passi dall’uno all’altro.
setup-windows-bluetooth = Porta con te i dispositivi Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } dispositivo associato in Windows funzionerà in Luft senza doverlo associare di nuovo.
   *[other] { $count } dispositivi associati in Windows funzioneranno in Luft senza doverli associare di nuovo.
}

## Choosing a drive

setup-drives-label = Dischi
setup-drives-none = Non c’è nessun disco che Luft possa usare. Collegane uno e cerca di nuovo.
setup-drive-has-windows = Contiene { $windows }
setup-drive-empty = Vuoto
setup-drive-partitions = { $count ->
    [one] { $count } partizione
   *[other] { $count } partizioni
}

## Custom space

setup-custom-open-disks = Apri Dischi
setup-custom-looking = Ricerca…
setup-custom-look-again = Cerca di nuovo
setup-custom-free-label = Spazio libero
setup-custom-free-space = { $size } di spazio libero
setup-custom-on-drive = Su { $drive }
setup-custom-none = Libera almeno { $size } di spazio in Dischi, poi cerca di nuovo. Luft viene installato nello spazio che lasci libero.

## Replacing a Linux system

setup-replace-stays = Cosa resta
setup-replace-changes = Cosa cambia
setup-replace-keeps-account = I tuoi file e il tuo account { $account }
setup-replace-keeps-account-password = I tuoi file e il tuo account { $account } con la sua password
setup-replace-keeps-accounts = { $count ->
    [one] L’altro account presente, con i suoi file
   *[other] Gli altri { $count } account presenti, con i loro file
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } connessione di rete, con la sua password Wi-Fi
   *[other] { $count } connessioni di rete, con le password Wi-Fi
}
setup-replace-keeps-drives = { $drives }, montati all’avvio come prima
setup-replace-keeps-hostname = Il nome del computer, { $hostname }, e le sue chiavi SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } strumento da riga di comando che hai installato, in una Toolbox dopo l’accesso
   *[other] { $count } strumenti da riga di comando che hai installato, in una Toolbox dopo l’accesso
}
setup-replace-keeps-old = { $system } non si avvia più. I suoi file di sistema vengono conservati come old-system finché non li rimuovi in Dischi o nelle Impostazioni.
setup-replace-erases-system = La partizione di sistema di { $system } viene cancellata. I tuoi file si trovano su una partizione a parte e restano come sono.
setup-replace-clears-boot = La sua partizione /boot viene svuotata per ospitare i file di avvio di Luft.
setup-replace-apps = Le app installate non vengono trasferite. Puoi installarle di nuovo da Schelf.

setup-replace-blocked-encrypted = È crittografato, quindi non è ancora possibile sostituirlo mantenendo i tuoi file.
setup-replace-blocked-single = I tuoi file sono sulla stessa partizione del sistema, quindi non è ancora possibile sostituirlo mantenendoli.
setup-replace-blocked-layout = Il suo disco è organizzato in un modo che Luft non può ancora sostituire.
setup-replace-blocked-startup = La sua partizione di sistema EFI è troppo piccola per Luft e non c’è una partizione /boot da usare al suo posto.
setup-replace-blocked-no-account = Non ha nessun account da trasferire.
setup-replace-blocked-running = Luft è in esecuzione proprio da questo sistema. Avvia Luft da una chiavetta USB per sostituirlo.
setup-replace-blocked-read-only = Il suo disco è di sola lettura.

## Connecting to the internet

setup-network-title = Connettiti a internet
setup-network-description = È facoltativo. Se sei online, Luft può impostare orologio e fuso orario, e puoi usare internet mentre Luft si installa.
setup-network-unavailable = Le reti non sono disponibili al momento. Puoi connetterti più tardi dalla barra delle applicazioni.
setup-network-looking = Ricerca delle reti…
setup-network-cable = Connesso via cavo
setup-network-show-all = Mostra tutte le reti
setup-network-skip = Salta
setup-network-failed = Impossibile connettersi
setup-network-wrong-password = Password errata
setup-network-connected = Connesso
setup-network-connecting = Connessione…
setup-network-saved = Salvata
setup-network-password = Password
setup-network-join = Connetti

## Account

setup-account-title = Chi usa questo computer?
setup-account-description = È l’account con cui accedi. Puoi aggiungere altre persone più tardi nelle Impostazioni.
setup-account-full-name = Il tuo nome
setup-account-full-name-example = Rita Levi-Montalcini
setup-account-user-name = Nome utente
setup-account-password = Password
setup-account-repeat = Digitala di nuovo
setup-account-user-name-invalid = Usa lettere minuscole, numeri, - e _
setup-account-full-name-invalid = Non usare virgole né due punti
setup-account-mismatch = Le password non corrispondono

## Installing

setup-finishing-failed-title = Impossibile installare Luft
setup-finishing-failed-description = Si è verificato un problema durante l’installazione.
setup-finishing-failed-stick = Il computer si avvia ancora come prima. Puoi continuare a usare Luft dalla chiavetta USB, oppure riavviare e riprovare.
setup-finishing-failed-trying = Il computer si avvia ancora come prima. Puoi continuare a usare Luft così com’è ora, oppure riavviare e riprovare.
setup-finishing-use-stick = Usa Luft dalla chiavetta
setup-finishing-keep-trying = Continua a provare Luft
setup-finishing-installed-title = Luft è installato
setup-finishing-trust-stick = Rimuovi la chiavetta USB quando lo schermo diventa nero. Poi una schermata blu chiede di considerare attendibile Luft: lì usa la tastiera.
setup-finishing-trust = Subito dopo il riavvio, una schermata blu chiede di considerare attendibile Luft: lì usa la tastiera.
setup-finishing-restart-stick = Riavvia per iniziare a usarlo. Rimuovi la chiavetta USB quando lo schermo diventa nero.
setup-finishing-restart = Riavvia per iniziare a usarlo.
setup-finishing-title = Quasi fatto
setup-finishing-description = Luft viene copiato sul tuo computer. Ci vuole qualche minuto.
setup-finishing-plug-in = Tieni il computer collegato alla corrente fino al termine.
setup-stage-idle = Preparazione
setup-stage-preparing = Creazione dello spazio per Luft
setup-stage-copying = Copia di Luft
setup-stage-waiting = Completamento
setup-stage-configuring = Configurazione dell’account
setup-stage-finished = Fatto

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Premi un tasto entro 10 secondi
setup-enroll-choose-enroll = Scegli Enroll MOK, poi Continue
setup-enroll-choose-yes = Scegli Yes
setup-enroll-type-code = Digita il codice, poi scegli Reboot
setup-enroll-digits = { $count ->
    [one] { $count } cifra
   *[other] { $count } cifre
}
setup-secure-boot-title = Il computer non considera ancora attendibile Luft
setup-secure-boot-code = Subito dopo il prossimo riavvio, una schermata blu chiede di considerare attendibile Luft. Lì usa la tastiera con questo codice.
setup-secure-boot-skipped = La schermata blu è stata saltata. Richiedi un nuovo codice e riavvia, poi lì usa la tastiera.
setup-secure-boot-getting = Recupero del codice…
setup-secure-boot-new-code = Richiedi un nuovo codice

## Encryption

setup-protect-title = Proteggi i tuoi file
setup-protect-tpm = Crittografa questo computer, così nessuno può leggere i tuoi file senza accedere, anche se lo perdi. Si sblocca da solo all’avvio.
setup-protect-passphrase = Crittografa questo computer, così nessuno può leggere i tuoi file senza la tua passphrase, anche se lo perdi.
setup-protect-keep-safe = Conserva questa chiave di ripristino in un posto sicuro, lontano da questo computer. Ti serve se il computer non riesce a sbloccarsi da solo.
setup-protect-passphrase-label = Passphrase
setup-protect-repeat = Digitala di nuovo
setup-protect-mismatch = Non corrispondono
setup-protect-kept = Ho conservato la chiave di ripristino
setup-protect-only-now = La crittografia si può attivare solo ora, durante l’installazione di Luft.
setup-protect-skip = Non crittografare
setup-protect-encrypt = Crittografa

## Fingerprint

setup-fingerprint-title = Accedi con il dito
setup-fingerprint-description = Sblocca Luft con un tocco invece di digitare la password. Puoi aggiungere altre dita più tardi nelle Impostazioni.
setup-fingerprint-which = Quale dito?
setup-fingerprint-another = Aggiungere un altro dito?
setup-fingerprint-finger = Dito
setup-fingerprint-no-reader = Il lettore di impronte non risponde. Puoi aggiungere un’impronta più tardi nelle Impostazioni.
setup-fingerprint-add = Aggiungi impronta
setup-fingerprint-choose-another = Scegli un altro dito

## Done

setup-ready-title = È tutto pronto
setup-ready-trust = Riavvia ancora una volta per finire. Subito dopo il riavvio, una schermata blu chiede di considerare attendibile Luft. Lì usa la tastiera con questo codice.
setup-ready-done = Il tuo desktop è pronto. Buon divertimento con Luft.
setup-ready-start = Inizia a usare Luft
