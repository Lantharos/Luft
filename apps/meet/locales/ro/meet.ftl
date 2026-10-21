meet-back = Înapoi
meet-cancel = Anulează
meet-continue = Continuă
meet-try-again = Încearcă din nou
meet-restart = Repornește
meet-remove = Elimină
meet-keep-it = Păstrează
meet-close = Închide
meet-restart-title = Reporniți acum?
meet-not-yet = Nu încă
meet-iso-use = Folosește o imagine ISO existentă
meet-iso-using = Se folosește imaginea ISO Luft
meet-nightly = Versiuni nightly
meet-channel-nightly = Meet Luft va folosi versiunile nightly
meet-channel-latest = Meet Luft va folosi din nou versiunile lansate
meet-undo = Anulează
meet-logs-saved = Jurnalele din sesiunea de încercare Luft au fost salvate pe desktop
meet-logs-show = Afișează
meet-logs-none = Nu există încă jurnale din sesiunea de încercare Luft
meet-logs-failed = Meet Luft nu a putut salva jurnalele din sesiunea de încercare Luft


problem-check = { $platform ->
    [linux] Meet Luft nu a putut termina verificarea acestui computer.
   *[windows] Meet Luft nu a putut termina verificarea acestui PC.
}
problem-room = Crearea spațiului pentru Luft nu s-a finalizat.
problem-room-linux = Pregătirea sistemului Luft nu s-a finalizat.
problem-update = Actualizarea sistemului Luft nu s-a finalizat.
problem-download = Descărcarea sistemului Luft s-a oprit. Verificați conexiunea la internet.
problem-pack = Împachetarea lucrurilor nu s-a finalizat.
problem-remove = Eliminarea sistemului Luft nu s-a finalizat.
problem-restart = Meet Luft nu a putut pregăti repornirea.
problem-tidy = Intrările de pornire vechi nu au putut fi eliminate.
problem-firmware = Meet Luft nu a putut deschide setările firmware-ului.
problem-folders = Meet Luft nu a putut parcurge folderele.
problem-sticks = Meet Luft nu a putut căuta unitățile USB.
problem-stick = Crearea stickului nu s-a finalizat.
problem-offer = Luft nu poate fi descărcat acum. Verificați conexiunea la internet sau folosiți o imagine ISO pe care o aveți deja.
problem-declined = { $platform ->
    [linux] Meet Luft are nevoie de permisiune pentru a lucra pe unitate. Introduceți parola când vi se cere.
   *[windows] Meet Luft are nevoie de permisiune pentru a lucra pe unitate. Alegeți Da când Windows întreabă.
}


hello-intro = { $platform ->
    [linux] Încercați Luft chiar de aici, fără stick USB. Dacă vă place, Luft poate lua locul acestui sistem și vă păstrează fișierele.
   *[windows] Luft poate sta chiar lângă Windows. Încercați-l mai întâi fără să instalați nimic și aduceți-vă lucrurile când sunteți gata.
}
hello-check = { $platform ->
    [linux] Verifică acest computer
   *[windows] Verifică acest PC
}


check-looking-title = { $platform ->
    [linux] Se verifică acest computer
   *[windows] Se verifică acest PC
}
check-ready-title = { $platform ->
    [linux] Acest computer este pregătit pentru Luft
   *[windows] Acest PC este pregătit pentru Luft
}
check-blocked-title = Aproape gata
check-moment = Durează doar un moment.
check-slow = Windows calculează cât spațiu poate ceda. Pe o unitate mare, poate dura câteva minute.
check-blocked-description = Ceva trebuie schimbat înainte ca Luft să se poată instala. Iată ce trebuie făcut.
check-found-description = Iată ce a găsit Meet Luft.
check-checking = Se verifică unitatea, firmware-ul și componentele hardware…
check-again = Verifică din nou
check-action-firmware = Deschide setările firmware-ului
check-action-tidy = Curăță
check-firmware-title = Reporniți în setările firmware-ului?
check-firmware-description = Salvați mai întâi ce lucrați. Activați acolo Secure Boot și salvați, iar computerul pornește din nou ca de obicei.
check-tidy-title = Eliminați intrările de pornire vechi?
check-tidy-description = Ele indică doar sisteme care nu mai există. Windows și restul pornesc exact ca înainte.
check-get-ready-title = Pregătiți Luft?
check-get-ready-file = Meet Luft copiază Luft din imaginea ISO într-un folder de pe acest computer și adaugă o intrare de pornire pentru el. Partițiile nu se modifică.
check-get-ready-download = Meet Luft descarcă Luft, aproximativ { $size }, într-un folder de pe acest computer și adaugă o intrare de pornire pentru el. Partițiile nu se modifică.
check-get-ready-confirm = Pregătește-l


room-title = Cât spațiu pentru Luft?
room-description = Windows se micșorează pentru a face loc sistemului Luft. Fișierele din Windows rămân exact unde sunt.
room-live = Windows își păstrează spațiu pentru mai târziu. Luft rezervă și { $size } pentru pornire, pe care îi eliberează după instalare.
room-make = Fă loc
room-confirm-title = Oferiți { $size } pentru Luft?
room-confirm-file = Windows își micșorează unitatea, apoi Meet Luft copiază Luft din imaginea ISO. Țineți PC-ul conectat la priză.
room-confirm-download = Windows își micșorează unitatea, apoi Meet Luft descarcă Luft, aproximativ { $size }. Țineți PC-ul conectat la priză și la internet.


ready-title = Luft este pregătit
ready-description = Alegeți cum vreți să faceți cunoștință cu el. Apoi Windows pornește ca de obicei, dacă nu instalați Luft și nu îl alegeți.
ready-update-title = Obține cel mai nou Luft
ready-update-description = A apărut o versiune mai nouă. O înlocuiește pe aceasta și păstrează spațiul și tot ce ați împachetat.
ready-try-title = Încearcă Luft
ready-try-description = Reporniți în Luft fără să instalați nimic. Data viitoare Windows pornește ca de obicei.
ready-box-description = Împachetați documente, fotografii, rețele Wi-Fi și altele, pe care Luft le despachetează după instalare.
ready-box-packed = Împachetat: { $size }
ready-install-title = Instalează Luft
ready-install-description = Reporniți în programul de instalare. Spațiul de { $size } de lângă Windows îl așteaptă deja.
ready-stick-description = Puneți Luft pe un stick pentru a-l porni pe orice computer.
ready-remove = Elimină Luft de pe acest PC
ready-restart-try = Salvați mai întâi ce lucrați. Luft se deschide în aproximativ un minut, iar următoarea repornire vă aduce înapoi în Windows.
ready-restart-install = Salvați mai întâi ce lucrați. Programul de instalare se deschide în aproximativ un minut și nu se schimbă nimic până nu confirmați acolo.
ready-fast-startup-title = Dezactivează Pornire rapidă în Windows
ready-fast-startup-description = Windows se va opri complet, așa că sunetul, Wi-Fi și Bluetooth pornesc curat în Luft.
ready-clock-title = Ora corectă în ambele sisteme
ready-clock-description = Windows citește ceasul computerului la fel ca Luft, așa că ora nu mai sare când treceți de la un sistem la altul.
ready-remove-title = Eliminați Luft de pe acest PC?
ready-remove-description = Meet Luft șterge tot ce a adăugat, inclusiv cutia de mutare, și îi redă sistemului Windows tot spațiul.


linux-ready-description = Alegeți cum vreți să faceți cunoștință cu el. { $system } pornește în continuare ca de obicei până decideți altfel.
linux-ready-this-system = acest sistem
linux-ready-update-description = A apărut o versiune mai nouă. O înlocuiește pe cea păstrată de Meet Luft și păstrează jurnalele din sesiunile de încercare.
linux-ready-try-description = Reporniți în Luft fără să schimbați nimic. Data viitoare { $system } pornește ca de obicei.
linux-ready-replace-title = Înlocuiește { $system }
linux-ready-replace-description = Luft îi ia locul și păstrează fișierele, contul, rețelele Wi-Fi și celelalte unități. Vechiul sistem rămâne până îl eliminați.
linux-ready-install-description = Reporniți în programul de instalare pentru a pune Luft pe altă unitate sau în spațiul liber.
linux-ready-remove = Elimină Luft de pe acest computer
linux-ready-restart-try = Salvați mai întâi ce lucrați. Luft se deschide în aproximativ un minut, iar următoarea repornire vă aduce înapoi în { $system }.
linux-ready-restart-replace = Salvați mai întâi ce lucrați. Programul de instalare se deschide cu { $system } ales pentru înlocuire și arată ce rămâne înainte de orice modificare.
linux-ready-remove-title = Eliminați Luft de pe acest computer?
linux-ready-remove-description = Meet Luft șterge fișierele sistemului Luft, fișierele lui de pornire și intrarea lui de pornire. Restul rămâne neschimbat.


box-title = Aduceți-vă lucrurile
box-description = Alegeți ce să luați. Luft le despachetează în noul cont după instalare și nu se elimină nimic din Windows.
box-looking = Se parcurg folderele…
box-folder-desktop = Desktop
box-folder-documents = Documente
box-folder-downloads = Descărcări
box-folder-music = Muzică
box-folder-pictures = Imagini
box-folder-videos = Videoclipuri
box-folder-size = { $size }, { $files ->
    [one] { $files } fișier
    [few] { $files } fișiere
   *[other] { $files } de fișiere
}
box-wifi-title = Rețele Wi-Fi
box-wifi-description = Cu parolele lor, ca Luft să fie conectat imediat
box-bluetooth-title = Dispozitive Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } dispozitiv, gata de folosire fără o nouă asociere
    [few] { $devices } dispozitive, gata de folosire fără o nouă asociere
   *[other] { $devices } de dispozitive, gata de folosire fără o nouă asociere
}
box-wallpaper-title = Imagine de fundal
box-wallpaper-description = Imaginea de pe desktopul Windows
box-account-title = Numele și fotografia
box-total-slow = { $size }, se împachetează în aproximativ { $minutes ->
    [one] { $minutes } minut
    [few] { $minutes } minute
   *[other] { $minutes } de minute
}
box-pack = Împachetează


working-shrinking = Se face loc
    .description = Windows își mută fișierele pentru a face spațiu. Poate dura câteva minute.
working-partitioning = Se pregătește spațiul pentru Luft
    .description = Se pregătesc partițiile din care pornește Luft.
working-downloading = Se aduce Luft
    .description = Luft se copiază direct în propriul spațiu și se verifică pe parcurs.
working-packing = Se împachetează lucrurile
    .description = Tot ce ați ales se copiază în cutia de mutare. Folderele mari durează mai mult.
working-removing = Se elimină Luft
    .description = Spațiul este redat sistemului Windows.
working-removing-linux = Se elimină Luft
    .description = Se elimină fișierele și intrarea de pornire.
working-writing = Se creează stickul
    .description = Luft se scrie pe tot stickul. Țineți-l conectat.
working-copying = Se adaugă Luft în Ventoy
    .description = Luft se copiază lângă celelalte imagini ISO de pe stick. Țineți-l conectat.
working-verifying = Se verifică stickul
    .description = Totul se citește înapoi pentru a confirma că pornește.
working-stick-downloading = Se descarcă Luft
    .description = Se verifică pe parcurs și se păstrează, așa că următorul stick se face mai repede.
working-progress = { $done } din { $total }
working-keep-open = Țineți această fereastră deschisă.


removed-title = Totul e ca înainte
removed-description = { $platform ->
    [linux] Fișierele sistemului Luft și intrarea lui de pornire au dispărut, iar computerul pornește exact ca înainte. Reveniți oricând.
   *[windows] Partițiile sistemului Luft și intrarea lui de pornire au dispărut, iar Windows are din nou tot spațiul. Reveniți oricând.
}


stick-title = Creați un stick USB
stick-description = Luft pornește de pe el pe orice computer, pentru încercare sau instalare.
stick-looking = Se caută unități USB…
stick-none = Conectați un stick USB de cel puțin { $size }. Va apărea aici.
stick-drives-label = Unități USB
stick-offer = { $name }, { $size }
stick-make = Creează stickul
stick-drive-empty = Gol
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Prea mic pentru Luft
stick-ventoy-title = Acest stick folosește Ventoy
stick-ventoy-description = Adăugați Luft pe el sau ștergeți tot stickul și faceți din el un stick Luft?
stick-erase-it = Șterge-l
stick-add = Adaugă Luft
stick-replace-title = Înlocuiți versiunea Luft de pe el?
stick-replace-description = { $count ->
    [one] { $names } este deja pe acest stick. Noul Luft îi poate lua locul.
    [few] { $names } sunt deja pe acest stick. Noul Luft le poate lua locul.
   *[other] { $names } sunt deja pe acest stick. Noul Luft le poate lua locul.
}
stick-keep = { $count ->
    [one] Păstrează-le pe amândouă
    [few] Păstrează-le pe toate
   *[other] Păstrează-le pe toate
}
stick-replace = Înlocuiește
stick-full-title = Nu există spațiu pentru Luft
stick-full-description = Luft are nevoie de { $needed }, iar spațiul liber de pe acest stick este de { $free }. Faceți loc pe el sau ștergeți-l și faceți din el un stick Luft.
stick-erase-title = Ștergeți { $name }?
stick-erase-description = Tot ce se află pe acest stick de { $size } se șterge și se înlocuiește cu Luft. Acțiunea nu poate fi anulată.
stick-erase-confirm = Șterge și creează stickul
stick-done-title = Stickul Luft este gata
stick-done-ventoy-title = Luft este pe stickul Ventoy
stick-done-take-out = Acum îl puteți scoate.
stick-done-eject = Deconectați-l în siguranță înainte de a-l scoate.
stick-done-start = Pentru a porni de pe el, conectați-l și alegeți-l în meniul de pornire al computerului, care se deschide cu o tastă precum F12, F8 sau Esc imediat după pornire.
stick-done-ventoy-key = Cu Secure Boot activat, Ventoy cere o singură dată, la prima pornire, să își înregistreze propria cheie.
stick-done = Gata
stick-done-another = Creează încă unul
