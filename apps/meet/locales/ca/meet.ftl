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
