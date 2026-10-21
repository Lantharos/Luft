## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = Processador Intel o AMD de 64 bits
check-processor-x64-detail = Luft hi funciona.
check-processor-arm = Processador Arm
check-processor-arm-detail = De moment, Luft només funciona amb processadors Intel i AMD.
check-processor-32-bit-windows = Windows de 32 bits
check-processor-32-bit-system = Sistema de 32 bits
check-processor-32-bit-detail = Luft necessita un processador Intel o AMD de 64 bits.
check-startup-uefi = S’inicia amb UEFI
check-startup-uefi-windows = Luft s’inicia de la mateixa manera moderna.
check-startup-uefi-linux = Luft afegeix la seva pròpia entrada d’arrencada, i { $system } continua iniciant-se com ara.
check-startup-bios = S’inicia en el mode BIOS antic
check-startup-bios-windows = Luft necessita UEFI. Windows pot fer el canvi amb MBR2GPT, i després es pot activar UEFI a la configuració del microprogramari.
check-startup-bios-linux = Luft necessita UEFI. Activeu-lo a la configuració del microprogramari, juntament amb el sistema que ja hi ha, i torneu a comprovar.
check-startup-mbr = El disc fa servir una taula de particions antiga
check-startup-mbr-windows = Luft necessita un disc GPT. Windows el pot convertir amb MBR2GPT sense perdre fitxers.
check-startup-mbr-linux = Luft necessita un disc GPT per iniciar-se.
check-startup-no-esp = No hi ha cap partició del sistema EFI
check-startup-no-esp-detail = Luft afegeix els seus fitxers d’arrencada al costat dels que ja hi ha a la partició del sistema EFI, i no n’hi ha cap.
check-startup-esp-full = La partició del sistema EFI és plena
check-startup-esp-full-detail = Luft hi necessita { $size } MB per als seus fitxers d’arrencada. Normalment l’espai l’ocupen nuclis o entrades d’arrencada antics.
check-folder-fine = No es modifica cap partició
check-folder-fine-detail = Luft es guarda com un fitxer al vostre disc { $filesystem } i s’inicia des d’allà.
check-folder-encrypted = Els vostres fitxers són en un disc xifrat
check-folder-encrypted-detail = Luft encara no es pot iniciar des d’un disc xifrat. Feu servir una memòria USB per provar-lo.
check-folder-combined = Els vostres fitxers ocupen més d’una partició
check-folder-combined-detail = Luft encara no es pot iniciar des de LVM o RAID. Feu servir una memòria USB per provar-lo.
check-folder-filesystem = Luft no es pot iniciar des de { $filesystem }
check-folder-filesystem-detail = S’inicia des de discs ext4, btrfs i XFS. Feu servir una memòria USB per provar-lo.
check-space-free = { $size } GB lliures
check-space-free-linux = Luft ocupa uns { $size } GB mentre el proveu.
check-space-up-to = Fins a { $size } GB per a Luft
check-space-up-to-detail = Windows conserva els seus fitxers i espai per créixer.
check-space-short = No hi ha prou espai lliure
check-space-short-windows = Luft necessita uns { $needed } GB que Windows pugui cedir. Allibereu { $missing } GB a Windows, per exemple amb la Neteja de disc, i torneu a comprovar.
check-space-short-linux = Luft necessita uns { $needed } GB per iniciar-se. Allibereu { $missing } GB i torneu a comprovar.
check-system-replaceable = Luft en pot ocupar el lloc i conservar els vostres fitxers, el compte i la configuració.
check-system-single = Els vostres fitxers comparteixen partició amb el sistema, així que encara no es pot substituir conservant-los. Sí que es pot provar i instal·lar Luft.
check-system-encrypted = Està xifrat, així que encara no es pot substituir conservant els vostres fitxers.
check-system-unknown = El seu disc està organitzat d’una manera que Luft encara no pot substituir conservant els vostres fitxers.
check-encryption-off = Windows no està xifrat
check-encryption-off-detail = Instal·la Luft pot llegir-ne la configuració i els vostres dispositius Bluetooth.
check-encryption-on = Windows està xifrat amb BitLocker
check-encryption-on-detail = Cap problema. Windows mateix fa l’espai, i Meet Luft porta el que Luft no pot llegir d’un disc bloquejat. Tingueu la clau de recuperació a mà, per si de cas.
check-encryption-changing = BitLocker encara està xifrant o desxifrant
check-encryption-changing-detail = Espereu que Windows acabi i torneu. Podeu veure com va a Configuració, a Xifratge del dispositiu.
check-fast-startup-on = L’inici ràpid està activat
check-fast-startup-on-detail = Windows hiberna en lloc d’apagar-se, i això manté el seu disc bloquejat. Meet Luft s’ofereix a desactivar-lo abans de la instal·lació.
check-fast-startup-off = L’inici ràpid està desactivat
check-fast-startup-off-detail = Windows s’apaga del tot.
check-secure-boot-on = Secure Boot està activat
check-secure-boot-on-detail = Pot quedar activat. Luft us demana una sola vegada, en una pantalla blava, que n’afegiu la clau.
check-secure-boot-off = Secure Boot està desactivat
check-secure-boot-off-detail = Luft funciona sense, però els jocs amb antitrampes el necessiten. { $turningOn }
check-secure-boot-restart-into = Meet Luft pot reiniciar a la configuració del microprogramari, on es troba a { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft pot reiniciar a la configuració del microprogramari, on normalment es troba a Security o Boot.
check-secure-boot-turn-on = Per activar-lo, reinicieu i premeu { $key } quan aparegui el logotip de la marca { $maker }, i després aneu a { $place }.
check-secure-boot-turn-on-anywhere = Per activar-lo, obriu la configuració del microprogramari mentre l’ordinador s’inicia i mireu a Security o Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security i després Secure Boot
check-firmware-place-boot-configuration = Boot Configuration i després Secure Boot
check-firmware-place-security-or-advanced = Security o Advanced, i després Secure Boot Configuration
check-firmware-place-security-or-boot = Security o Boot, i després Secure Boot
check-firmware-place-boot = Boot i després Secure Boot
check-firmware-place-settings = Settings, després Security i després Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 en un ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 o Supr
check-firmware-key-delete = Supr
check-firmware-key-volume-up = el botó d’apujar el volum

## More of the computer's hardware

check-tpm-detail = Si xifreu Luft, es pot desbloquejar sol quan l’ordinador s’inicia.
check-tpm-missing = Sense TPM 2.0
check-tpm-missing-detail = Si xifreu Luft, us demanarà una frase de pas cada vegada que s’iniciï.
check-graphics = Targeta gràfica
check-graphics-detail = Funciona sense configurar res.
check-graphics-nvidia = Luft s’instal·la amb el controlador de la mateixa NVIDIA.
check-wifi-missing = Sense Wi-Fi
check-wifi-missing-detail = A Luft, feu servir un cable de xarxa, o cap connexió.
check-wifi-detail = Funciona a Luft.
check-wifi-broadcom = Alguns xips Wi-Fi de Broadcom necessiten un controlador que Luft no inclou. Tingueu a mà un cable de xarxa o un telèfon per compartir-ne la connexió per USB.
check-start-entries = { $count ->
    [one] Una entrada d’arrencada antiga
   *[other] { $count } entrades d’arrencada antigues
}
check-start-entries-detail = { $count ->
    [one] { $names } apunta a un sistema que ja no és en aquest ordinador. Es pot treure.
   *[other] { $names } apunten a sistemes que ja no són en aquest ordinador. Es poden treure.
}
check-download-unavailable = Ara mateix no es pot baixar Luft
check-download-unavailable-detail = Meet Luft baixa uns 3 GB. Comproveu que esteu en línia i torneu a comprovar, o feu servir una ISO de Luft que ja tingueu.

## Choosing a Luft ISO file

iso-dialog-title = Trieu una ISO de Luft
iso-dialog-filter = ISO de Luft

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Registres de Luft { $name }
logs-no-desktop = Meet Luft no ha trobat el vostre escriptori
logs-not-saved = Meet Luft no ha pogut desar els registres de la prova de Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = L’auxiliar de Meet Luft no s’ha iniciat: { $error }
helper-not-allowed = Meet Luft no ha rebut permís per treballar amb el disc
helper-stopped = L’auxiliar de Meet Luft s’ha aturat
helper-stopped-because = L’auxiliar de Meet Luft s’ha aturat: { $error }
helper-pipe-failed = Meet Luft no s’ha pogut comunicar amb el seu auxiliar: { $error }
helper-pipe-hijacked = Una cosa que no és l’auxiliar de Meet Luft ha obert { $pipe }
helper-record-not-saved = Meet Luft no ha pogut anotar el que ha creat: { $error }
helper-no-room-yet = Primer feu espai per a Luft.
helper-not-ready-linux = Primer prepareu Luft.
helper-not-ready-to-start-windows = Luft encara no està a punt per iniciar-se. Primer feu-li espai.
helper-not-ready-to-start-linux = Luft encara no està a punt per iniciar-se. Primer prepareu-lo.
helper-update-unfinished = No s’ha acabat d’actualitzar Luft. Primer torneu-lo a actualitzar.
helper-room-too-small = Luft necessita més espai.
helper-room-shortfall = Windows pot cedir { $available } GB, i Luft necessita { $needed } GB.
helper-box-shortfall = Windows pot cedir { $available } GB més, i el que heu triat necessita { $needed } GB.
helper-bluetooth-unreadable = No s’ha pogut obrir la configuració Bluetooth de Windows
helper-registry-not-opened = No s’ha pogut obrir { $key }: { $error }
helper-registry-not-changed = No s’ha pogut canviar { $value }: { $error }
helper-registry-not-saved = No s’ha pogut desar { $file }: { $error }
helper-restart-failed = L’ordinador no s’ha reiniciat
helper-windows-restart-failed = Windows no s’ha reiniciat: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Aquest ordinador no s’inicia amb UEFI
firmware-variable-unreadable = No s’ha pogut llegir { $name } del microprogramari: { $error }
firmware-variable-not-saved = No s’ha pogut desar { $name } al microprogramari: { $error }
firmware-entries-full = El microprogramari no té espai per a cap altra entrada d’arrencada
firmware-entry-kept = Windows ha conservat l’entrada d’arrencada { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = No s’han pogut llistar els discs: { $error }
drive-of-path-unknown = No s’ha pogut saber quin disc conté { $path }
drive-windows-folder-missing = No s’ha trobat la carpeta de Windows
drive-windows-drive-missing = No s’ha trobat el disc de Windows
drive-windows-drive-missing-because = No s’ha trobat el disc de Windows: { $error }
drive-windows-partition-missing = No s’ha trobat la partició de Windows
drive-volume-missing = No s’ha trobat el volum { $path }
drive-storage-error = { $what } (error d’emmagatzematge de Windows { $code })
drive-shrink-size-unknown = Windows no ha pogut saber fins a quin punt pot reduir la seva partició
drive-grow-size-unknown = Windows no ha pogut saber fins a quin punt pot ampliar la seva partició
drive-resize-failed = Windows no ha pogut canviar la mida de la seva partició
drive-create-failed = Windows no ha pogut crear una partició per a Luft
drive-hide-failed = Windows no ha pogut amagar la partició nova a l’Explorador de fitxers
drive-format-failed = Windows no ha pogut formatar la partició nova
drive-remove-failed = Windows no ha pogut suprimir una de les particions de Luft
drive-new-partition-missing = No s’ha trobat la partició nova
drive-new-partition-no-volume = La partició nova no té cap volum
drive-start-no-guid = La partició d’arrencada no té GUID
drive-live-no-guid = La partició de Luft no té GUID
drive-box-no-guid = La caixa de mudança no té GUID
drive-guid-unreadable = No es pot llegir el GUID de la partició
drive-not-gpt = La taula de particions del disc no és GPT
drive-start-no-volume = La partició d’arrencada no té cap volum
drive-live-no-volume = La partició de Luft no té cap volum
drive-new-live-no-volume = La partició nova de Luft no té cap volum
drive-partitions-not-noted = Les particions de Luft no consten a les notes de Meet Luft
drive-partitions-gone = Les particions de Luft han desaparegut
drive-partition-gone = Ha desaparegut una partició
drive-start-partition-foreign = La partició d’arrencada de Luft no l’ha creada Meet Luft
drive-start-partition-gone = La partició d’arrencada de Luft ja no hi és
drive-start-partition-not-listed = La partició d’arrencada de Luft no és a la taula de particions
drive-no-esp = Aquest ordinador no té cap partició del sistema EFI
drive-esp-full = La partició del sistema EFI és massa plena per als fitxers d’arrencada de Luft.
drive-esp-not-opened = No s’ha pogut obrir la partició del sistema EFI
drive-esp-file-unreadable = No es pot llegir el fitxer { $file } de la partició del sistema EFI
drive-esp-no-drive = La partició del sistema EFI no té cap disc
drive-esp-no-guid = La partició del sistema EFI no té GUID
drive-no-uuid = El disc on es guarda Luft no té UUID
drive-folder-unreadable = Luft no es pot iniciar des del disc on hi ha els vostres fitxers.
drive-folder-not-startable = No es pot iniciar des de { $folder }

## Errors while getting Luft

live-no-home-folder = No hi ha cap carpeta personal on guardar Luft
live-no-app-data-folder = No hi ha cap carpeta de dades locals d’aplicacions on guardar Luft
live-pointer-unreadable = No es pot llegir quina és la versió més nova de Luft
live-not-published = Luft no s’ha publicat allà
live-checksum-unreadable = No es pot llegir el fitxer de suma de verificació
live-checksum-not-read = No s’ha pogut llegir la suma de verificació de Luft: { $error }
live-download-damaged = La baixada s’ha malmès pel camí. Torneu-ho a provar.
live-download-incomplete = A la baixada de Luft hi falta { $file }
live-download-not-resumable = El servidor no pot continuar la baixada
live-not-signed = { $iso } no està signat
live-signature-unreadable = No es pot llegir la signatura de { $iso }
live-signature-wrong-key = { $iso } no l’ha signat Lantharos
live-signature-other-iso = La signatura és per a { $signed }, no per a { $iso }
live-iso-out-of-order = Els fitxers de la ISO no estan en un ordre que Meet Luft pugui llegir
live-iso-not-iso = Això no és una imatge ISO
live-iso-no-root = La ISO no té carpeta arrel
live-iso-no-joliet = La ISO no té noms Joliet
live-not-removed = No s’ha pogut suprimir { $path }: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = La memòria ja no hi és. Torneu-la a connectar i torneu-la a triar.
stick-too-small = Luft no hi cap, en aquesta memòria. Feu-ne servir una de 4 GB o més.
stick-damaged = La ISO no coincideix amb la seva suma de verificació. Potser s’ha malmès pel camí.
stick-read-back-differs = En tornar a llegir la memòria, no conté el que s’hi ha escrit. Potser està gastada; proveu-ne una altra.
stick-download-unavailable = Ara mateix no es pot baixar Luft: { $error }
stick-download-failed = No s’ha pogut baixar Luft: { $error }
stick-checksum-unreadable = No es pot llegir la suma de verificació de la ISO: { $error }
stick-file-unreadable = No es pot llegir { $path }: { $error }
stick-iso-unreadable = No es pot llegir la ISO: { $error }
stick-iso-no-name = La ISO no té nom
stick-iso-ended-early = La ISO s’ha acabat abans d’hora
stick-iso-already-there = { $name } ja és a la memòria.
stick-no-room = No hi ha espai per a Luft a la memòria. Primer allibereu-hi { $size } MB.
stick-older-not-removed = No s’ha pogut treure la versió anterior de Luft: { $error }
stick-copy-stopped = S’ha aturat la còpia de Luft a la memòria: { $error }
stick-not-opened = No s’ha pogut obrir la memòria: { $error }
stick-write-stopped = S’ha aturat l’escriptura a la memòria: { $error }
stick-not-synced = La memòria no ha desat tot el que s’hi ha escrit: { $error }
stick-read-back-failed = No s’ha pogut tornar a llegir la memòria: { $error }
stick-in-use = La memòria encara està en ús: { $error }
stick-device-in-use = { $device } encara està en ús: { $error }
stick-volume-not-opened = No s’ha pogut obrir el volum de la memòria: { $error }
stick-volume-in-use = La memòria encara està en ús. Tanqueu el que hi tingui fitxers oberts i torneu-ho a provar ({ $error })
stick-not-dismounted = Windows no ha pogut alliberar la memòria: { $error }
stick-not-cleared = Windows no ha pogut buidar la memòria: { $error }
stick-not-refreshed = Windows no ha pogut tornar a examinar la memòria: { $error }
stick-not-ventoy = Aquesta memòria ja no fa servir Ventoy.
stick-ventoy-not-opened = No s’ha pogut obrir la partició de Ventoy: { $error }
stick-ventoy-not-opened-windows = Windows no pot obrir la partició de Ventoy
stick-udisks-missing = Meet Luft necessita UDisks per fer servir la memòria: { $error }
