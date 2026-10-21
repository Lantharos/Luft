## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Enrere
meet-cancel = Cancel·la
meet-continue = Continua
meet-try-again = Torna-ho a provar
meet-restart = Reinicia
meet-remove = Treu
meet-keep-it = Conserva’l
meet-close = Tanca
meet-restart-title = Voleu reiniciar ara?
meet-not-yet = Encara no
meet-iso-use = Fes servir una ISO que ja tinc
meet-iso-using = Amb la vostra ISO de Luft
meet-nightly = Versions nightly
meet-channel-nightly = Meet Luft farà servir versions nightly
meet-channel-latest = Meet Luft tornarà a fer servir les versions publicades
meet-undo = Desfés
meet-logs-saved = S’han desat a l’escriptori els registres de la prova de Luft
meet-logs-show = Mostra
meet-logs-none = Encara no hi ha registres de la prova de Luft
meet-logs-failed = Meet Luft no ha pogut desar els registres de la prova de Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft no ha pogut acabar d’examinar aquest ordinador.
   *[windows] Meet Luft no ha pogut acabar d’examinar aquest PC.
}
problem-room = No s’ha acabat de fer espai per a Luft.
problem-room-linux = No s’ha acabat de preparar Luft.
problem-update = No s’ha acabat d’actualitzar Luft.
problem-download = La baixada de Luft s’ha aturat. Comproveu que esteu en línia.
problem-pack = No s’han acabat d’empaquetar les vostres coses.
problem-remove = No s’ha acabat de treure Luft.
problem-restart = Meet Luft no ha pogut preparar el reinici.
problem-tidy = No s’han pogut treure les entrades d’arrencada antigues.
problem-firmware = Meet Luft no ha pogut obrir la configuració del microprogramari.
problem-folders = Meet Luft no ha pogut examinar les vostres carpetes.
problem-sticks = Meet Luft no ha pogut cercar unitats USB.
problem-stick = No s’ha acabat de crear la memòria.
problem-offer = Ara mateix no es pot baixar Luft. Comproveu que esteu en línia, o feu servir una ISO que ja tingueu.
problem-luft = Meet Luft no ha pogut examinar el disc de Luft.
problem-resize = No s’ha acabat de canviar la mida de Luft.
problem-cancel = Meet Luft no ha pogut anul·lar el canvi.
problem-give = Windows no ha pogut recuperar l’espai.
problem-declined = { $platform ->
    [linux] Meet Luft necessita el vostre permís per treballar amb el disc. Escriviu la contrasenya quan us la demani.
   *[windows] Meet Luft necessita el vostre permís per treballar amb el disc. Trieu Sí quan Windows us ho demani.
}

## First screen

hello-intro = { $platform ->
    [linux] Proveu Luft des d’aquí mateix, sense memòria USB. Si us agrada, Luft pot ocupar el lloc d’aquest sistema i conservar els vostres fitxers.
   *[windows] Luft pot conviure amb Windows. Proveu-lo primer sense instal·lar res, i porteu-hi les vostres coses quan estigueu a punt.
}
hello-check = { $platform ->
    [linux] Comprova aquest ordinador
   *[windows] Comprova aquest PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] S’està examinant aquest ordinador
   *[windows] S’està examinant aquest PC
}
check-ready-title = { $platform ->
    [linux] Aquest ordinador està a punt per a Luft
   *[windows] Aquest PC està a punt per a Luft
}
check-blocked-title = Gairebé hi som
check-moment = Triga un moment.
check-slow = Windows està calculant quant espai pot cedir. En un disc gran pot trigar uns minuts.
check-blocked-description = Cal canviar alguna cosa abans que Luft s’hi pugui instal·lar. Això és el que heu de fer.
check-found-description = Això és el que ha trobat Meet Luft.
check-checking = S’estan comprovant el disc, el microprogramari i el maquinari…
check-again = Torna a comprovar
check-action-firmware = Obre la configuració del microprogramari
check-action-tidy = Fes neteja
check-firmware-title = Voleu reiniciar a la configuració del microprogramari?
check-firmware-description = Primer deseu el que tingueu obert. Activeu-hi Secure Boot i deseu, i l’ordinador s’iniciarà de nou com sempre.
check-tidy-title = Voleu treure les entrades d’arrencada antigues?
check-tidy-description = Només apunten a sistemes que ja no hi són. Windows i tota la resta s’inicien igual que abans.
check-get-ready-title = Voleu preparar Luft?
check-get-ready-file = Meet Luft copia Luft de la vostra ISO a una carpeta d’aquest ordinador i hi afegeix una entrada d’arrencada. No es modifica cap partició.
check-get-ready-download = Meet Luft baixa Luft, uns { $size }, a una carpeta d’aquest ordinador i hi afegeix una entrada d’arrencada. No es modifica cap partició.
check-get-ready-confirm = Prepara’l

## Choosing how much of the Windows drive Luft gets

room-title = Quant espai voleu per a Luft?
room-description = Windows es fa més petit per deixar espai a Luft. Els vostres fitxers de Windows es queden exactament on són.
room-live = Windows conserva espai per créixer. Luft també reserva { $size } per començar, que retorna un cop s’ha instal·lat.
room-make = Fes espai
room-confirm-title = Voleu donar { $size } a Luft?
room-confirm-file = Windows redueix el seu disc i després Meet Luft copia Luft de la vostra ISO. Manteniu l’ordinador endollat.
room-confirm-download = Windows redueix el seu disc i després Meet Luft baixa Luft, uns { $size }. Manteniu l’ordinador endollat i connectat a internet.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = On voleu posar Luft?
room-places-description = Luft pot compartir el disc de Windows o ocupar espai que Windows no fa servir.
room-places-label = Llocs per a Luft
room-place-windows = Al costat de Windows
room-place-windows-detail = Windows es fa més petit per deixar espai a Luft
room-place-windows-free = Ja hi ha { $size } lliures
room-place-free = Espai lliure a { $drive }
room-place-free-here = Espai lliure al disc de Windows
room-place-free-detail = { $size } que no fa servir res més
room-place-whole = Tot el disc { $drive }
room-place-whole-detail = Esborra aquest disc de { $size } per a Luft
room-live-free = Ja hi ha { $free } lliures, així que Windows en cedeix menys i conserva espai per créixer. Luft també reserva { $size } per començar, que retorna un cop s’ha instal·lat.
room-live-elsewhere = Luft hi obté { $room } i reserva { $size } més per començar, que retorna un cop s’ha instal·lat.
room-confirm-free-title = Voleu donar a Luft { $size } d’espai lliure?
room-confirm-free-file = Meet Luft hi copia Luft de la vostra ISO. No canvia res més del disc.
room-confirm-free-download = Meet Luft hi baixa Luft, uns { $size }. No canvia res més del disc. Manteniu l’ordinador connectat a internet.
room-erase-title = Voleu esborrar { $drive }?
room-erase-description = Tot el que hi ha en aquest disc de { $size } s’esborra de seguida, abans que s’iniciï Luft. No es pot desfer. Ara conté:
room-erase-empty = Windows no pot llegir res d’aquest disc de { $size }, però tot el que hi hagi s’esborra de seguida. No es pot desfer.
room-erase-unnamed = Partició sense nom
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Xifrada amb BitLocker
room-erase-understood = Sé que una part està xifrada amb BitLocker i no es podrà recuperar
room-erase-confirm = Esborra i fes espai

## Luft is ready on Windows

ready-title = Luft està a punt
ready-description = Trieu com el voleu conèixer. Després Windows s’inicia com sempre, tret que instal·leu Luft i el trieu.
ready-update-title = Obtén la versió més nova de Luft
ready-update-description = Hi ha una versió més nova. Substitueix aquesta i conserva l’espai i tot el que heu empaquetat.
ready-try-title = Prova Luft
ready-try-description = Reinicieu a Luft sense instal·lar res. La pròxima vegada Windows s’inicia com sempre.
ready-box-description = Empaqueteu documents, fotos, xarxes Wi-Fi i més perquè Luft ho desempaqueti quan s’instal·li.
ready-box-packed = Empaquetat, { $size }
ready-install-title = Instal·la Luft
ready-install-description = Reinicieu a l’instal·lador. Els { $size } al costat de Windows ja l’esperen.
ready-install-drive-description = Reinicieu a l’instal·lador. Els { $size } de { $drive } ja l’esperen.
ready-stick-description = Poseu Luft en una memòria per iniciar-lo a qualsevol ordinador.
ready-remove = Treu Luft d’aquest ordinador
ready-restart-try = Primer deseu el que tingueu obert. Luft s’obre en un minut o així, i el reinici següent us torna a Windows.
ready-restart-install = Primer deseu el que tingueu obert. L’instal·lador s’obre en un minut o així, i no canvia res fins que no ho confirmeu allà.
ready-fast-startup-title = Desactiva l’inici ràpid de Windows
ready-fast-startup-description = Així Windows s’apaga del tot, de manera que el so, el Wi-Fi i el Bluetooth s’inicien de nou a Luft.
ready-clock-title = Mantén l’hora correcta en tots dos
ready-clock-description = Windows llegeix el rellotge de l’ordinador com Luft, així que l’hora ja no salta quan canvieu de sistema.
ready-remove-title = Voleu treure Luft d’aquest ordinador?
ready-remove-description = Meet Luft suprimeix tot el que ha afegit, inclosa la caixa de mudança, i retorna a Windows tot el seu espai.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Trieu com el voleu conèixer. { $system } continua iniciant-se com sempre fins que decidiu el contrari.
linux-ready-this-system = aquest sistema
linux-ready-update-description = Hi ha una versió més nova. Substitueix la que guarda Meet Luft i conserva els registres de les proves.
linux-ready-try-description = Reinicieu a Luft sense canviar res. La pròxima vegada { $system } s’inicia com sempre.
linux-ready-replace-title = Substitueix { $system }
linux-ready-replace-description = Luft n’ocupa el lloc i conserva els vostres fitxers, el compte, les xarxes Wi-Fi i els altres discs. El sistema antic es conserva fins que el suprimiu.
linux-ready-install-description = Reinicieu a l’instal·lador per posar Luft en un altre disc o en espai lliure.
linux-ready-remove = Treu Luft d’aquest ordinador
linux-ready-restart-try = Primer deseu el que tingueu obert. Luft s’obre en un minut o així, i el reinici següent us torna a { $system }.
linux-ready-restart-replace = Primer deseu el que tingueu obert. L’instal·lador s’obre amb { $system } triat per substituir-lo, i mostra què es conserva abans de canviar res.
linux-ready-remove-title = Voleu treure Luft d’aquest ordinador?
linux-ready-remove-description = Meet Luft suprimeix els fitxers de Luft, els seus fitxers d’arrencada i la seva entrada d’arrencada. Tota la resta es queda com està.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = El vostre Luft
luft-looking = Meet Luft ha trobat Luft en aquest ordinador.
luft-checking = S’està examinant el disc de Luft…
luft-description-beside = Luft està instal·lat al costat de Windows en aquest ordinador.
luft-description-drive = Luft està instal·lat a { $drive }.
luft-bar-used = { $size }, { $used } en ús
luft-resize-title = Canvia l’espai de Luft
luft-resize-description = Doneu a Luft més espai de Windows, o retorneu-ne una part a Windows.
luft-resize-drive-description = Doneu a Luft més part de l’espai lliure de { $drive }, o deixeu-ne una part lliure.
luft-resize-reencrypting = Luft encara està xifrant o desxifrant el seu disc. Quan acabi, se’n podrà canviar la mida.
luft-resize-passphrase = El disc de Luft només s’obre amb una frase de pas, i Luft no la pot escriure per si mateix mentre es trasllada.
luft-resize-start-first = Inicieu Luft una vegada perquè pugui dir a Meet Luft fins a quin punt està ple, i després torneu aquí.
luft-resize-apart = Hi ha una altra partició entre Windows i Luft, així que no poden compartir l’espai.
luft-pending-grow = Luft creixerà la pròxima vegada que s’iniciï
luft-pending-grow-description = Reinicieu a Luft i deixeu-lo engegat uns minuts mentre s’instal·la al nou espai. Mentrestant el podeu continuar fent servir.
luft-pending-shrink = Luft farà espai la pròxima vegada que s’iniciï
luft-pending-shrink-description = Reinicieu a Luft i deixeu-lo engegat uns minuts mentre mou els seus fitxers. Després torneu a obrir Meet Luft a Windows per donar l’espai a Windows.
luft-pending-trim = Luft es farà més petit la pròxima vegada que s’iniciï
luft-pending-trim-description = Reinicieu a Luft i es farà més petit en qüestió d’un minut.
luft-windows-free-title = Dona l’espai lliure a Windows
luft-windows-free-description = Just després de Windows hi ha { $size } que no fa servir res. Windows els pot recuperar.
luft-leftovers-title = Neteja el que ha quedat de provar Luft
luft-leftovers-description = Les particions que Meet Luft va crear per iniciar Luft encara hi són. Luft ja no les necessita.
luft-start = Reinicia a Luft
luft-cancel = Cancel·la el canvi
luft-restart = Primer deseu el que tingueu obert. Luft s’inicia en un minut o així, i el reinici següent us torna a Windows.
luft-restart-pending = Primer deseu el que tingueu obert. Luft s’inicia en un minut o així i mou els seus fitxers tot sol, cosa que triga uns minuts. Mentrestant el podeu fer servir.
luft-remove = Treu Luft d’aquest ordinador
luft-remove-title = Voleu treure Luft d’aquest ordinador?
luft-remove-description = Se suprimeix Luft amb tot el que conté, { $size } en total, i Windows recupera l’espai. L’ordinador inicia Windows com abans. No es pot desfer.
luft-remove-drive-description = Se suprimeix Luft de { $drive } amb tot el que conté, { $size } en total. L’ordinador inicia Windows com abans. No es pot desfer.
luft-remove-confirm = Treu Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Quant espai voleu per a Luft?
resize-description = Arrossegueu per repartir el disc entre Windows i Luft. Luft mateix fa el canvi la pròxima vegada que s’iniciï.
resize-measuring = Windows està calculant quant espai pot cedir. En un disc gran pot trigar uns minuts.
resize-full = Luft està massa ple per moure’l, i Windows no pot cedir prou espai. Primer feu espai a Luft o a Windows.
resize-drive-description = Arrossegueu per triar quina part de { $drive } ocupa Luft. Luft mateix fa el canvi la pròxima vegada que s’iniciï.
resize-drive-free = { $size } lliures a { $drive }
resize-used = Els fitxers de Luft ocupen { $size }.
resize-least = Canvieu la mida com a mínim { $size }.
resize-apply = Canvia-la
resize-grow-title = Voleu donar { $size } més a Luft?
resize-grow-description = Windows es fa més petit de seguida. Luft s’instal·la al nou espai la pròxima vegada que s’iniciï, cosa que triga uns minuts. Manteniu l’ordinador endollat.
resize-grow-drive-description = Luft ocuparà l’espai lliure de { $drive } la pròxima vegada que s’iniciï, cosa que triga un moment.
resize-trim-title = Voleu fer Luft { $size } més petit?
resize-trim-description = Luft es fa més petit la pròxima vegada que s’iniciï, i l’espai de { $drive } queda lliure.
resize-shrink-title = Voleu retornar { $size } a Windows?
resize-shrink-description = Luft mou els seus fitxers la pròxima vegada que s’iniciï, cosa que triga uns minuts. Després torneu a obrir Meet Luft, i Windows recupera l’espai. Manteniu l’ordinador endollat.

## Packing things to take along to Luft (the moving box)

box-title = Porteu les vostres coses
box-description = Trieu què us voleu endur. Luft ho desempaqueta al vostre compte nou quan s’instal·la, i no se suprimeix res de Windows.
box-looking = S’estan examinant les vostres carpetes…
box-folder-desktop = Escriptori
box-folder-documents = Documents
box-folder-downloads = Baixades
box-folder-music = Música
box-folder-pictures = Imatges
box-folder-videos = Vídeos
box-folder-size = { $size }, { $files ->
    [one] { $files } fitxer
   *[other] { $files } fitxers
}
box-wifi-title = Xarxes Wi-Fi
box-wifi-description = Amb les contrasenyes, perquè Luft estigui en línia de seguida
box-bluetooth-title = Dispositius Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } dispositiu, a punt sense tornar-lo a vincular
   *[other] { $devices } dispositius, a punt sense tornar-los a vincular
}
box-wallpaper-title = Fons de pantalla
box-wallpaper-description = La imatge de l’escriptori de Windows
box-account-title = El vostre nom i la vostra imatge
box-total-slow = { $size }, que es triga aproximadament { $minutes ->
    [one] { $minutes } minut
   *[other] { $minutes } minuts
} a empaquetar
box-pack = Empaqueta

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = S’està fent espai
    .description = Windows està movent els seus fitxers per fer espai. Pot trigar uns minuts.
working-erasing = S’està esborrant el disc
    .description = Windows el buida perquè Luft el pugui ocupar sencer.
working-partitioning = S’està preparant l’espai de Luft
    .description = S’estan preparant les particions des de les quals s’inicia Luft.
working-downloading = S’està portant Luft
    .description = Luft es copia directament al seu propi espai i es comprova pel camí.
working-packing = S’estan empaquetant les vostres coses
    .description = S’està copiant tot el que heu triat a la caixa de mudança. Les carpetes grans triguen una estona.
working-removing = S’està traient Luft
    .description = S’està retornant l’espai a Windows.
working-removing-linux = S’està traient Luft
    .description = S’estan traient els seus fitxers i la seva entrada d’arrencada.
working-writing = S’està creant la memòria
    .description = Luft s’escriu a tota la memòria. Manteniu-la connectada.
working-copying = S’està afegint Luft a Ventoy
    .description = Luft es copia al costat de les altres ISO de la memòria. Manteniu-la connectada.
working-verifying = S’està comprovant la memòria
    .description = Es torna a llegir sencera per assegurar que arrenca.
working-stick-downloading = S’està baixant Luft
    .description = Es comprova pel camí i es conserva, així la memòria següent es crea més de pressa.
working-progress = { $done } de { $total }
working-keep-open = Mantingueu aquesta finestra oberta.

## After Luft was removed

removed-title = Tot torna a estar com abans
removed-description = { $platform ->
    [linux] Els fitxers de Luft i la seva entrada d’arrencada han desaparegut, i l’ordinador s’inicia igual que abans. Torneu quan vulgueu.
   *[windows] Les particions de Luft i la seva entrada d’arrencada han desaparegut, i Windows torna a tenir tot el seu espai. Torneu quan vulgueu.
}

## Making a USB stick

stick-title = Creeu una memòria USB
stick-description = Serveix per iniciar Luft a qualsevol ordinador, per provar-lo o per instal·lar-lo.
stick-looking = S’estan cercant unitats USB…
stick-none = Connecteu una memòria USB de { $size } o més. Apareixerà aquí.
stick-drives-label = Unitats USB
stick-offer = { $name }, { $size }
stick-make = Crea la memòria
stick-drive-empty = Buida
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Massa petita per a Luft
stick-ventoy-title = Aquesta memòria fa servir Ventoy
stick-ventoy-description = Voleu afegir-hi Luft, o esborrar tota la memòria i convertir-la en una memòria de Luft?
stick-erase-it = Esborra-la
stick-add = Afegeix Luft
stick-replace-title = Voleu substituir la versió de Luft que hi ha?
stick-replace-description = { $count ->
    [one] { $names } ja és en aquesta memòria. La versió nova de Luft en pot ocupar el lloc.
   *[other] { $names } ja són en aquesta memòria. La versió nova de Luft en pot ocupar el lloc.
}
stick-keep = { $count ->
    [one] Conserva totes dues
   *[other] Conserva-les totes
}
stick-replace = Substitueix
stick-full-title = No hi ha espai per a Luft
stick-full-description = Luft necessita { $needed }, i en aquesta memòria hi ha { $free } d’espai lliure. Feu-hi espai, o esborreu-la i convertiu-la en una memòria de Luft.
stick-erase-title = Voleu esborrar { $name }?
stick-erase-description = S’esborrarà tot el que hi ha en aquesta memòria de { $size } i se substituirà per Luft. No es pot desfer.
stick-erase-confirm = Esborra i crea la memòria
stick-done-title = La vostra memòria de Luft està a punt
stick-done-ventoy-title = Luft és a la vostra memòria Ventoy
stick-done-take-out = Ja la podeu treure.
stick-done-eject = Expulseu-la abans de treure-la.
stick-done-start = Per iniciar-hi Luft, connecteu-la i trieu-la al menú d’arrencada de l’ordinador, que s’obre amb una tecla com F12, F8 o Esc just després d’engegar-lo.
stick-done-ventoy-key = Amb Secure Boot activat, Ventoy us demana que n’inscriviu la clau la primera vegada que s’inicia.
stick-done = Fet
stick-done-another = Crea’n una altra
