## Messages that some steps share

meet-back = Natrag
meet-cancel = Odustani
meet-continue = Nastavi
meet-try-again = Pokušaj ponovno
meet-restart = Ponovno pokreni
meet-remove = Ukloni
meet-keep-it = Zadrži
meet-close = Zatvori
meet-restart-title = Ponovno pokrenuti sada?
meet-not-yet = Ne još
meet-iso-use = Koristi ISO koji već imam
meet-iso-using = Koristi se vaš ISO Lufta
meet-nightly = Noćne verzije
meet-channel-nightly = Meet Luft će koristiti noćne verzije
meet-channel-latest = Meet Luft će ponovno koristiti izdanja
meet-undo = Poništi
meet-logs-saved = Zapisnici iz isprobavanja Lufta spremljeni su na radnu površinu
meet-logs-show = Prikaži
meet-logs-none = Još nema zapisnika iz isprobavanja Lufta
meet-logs-failed = Meet Luft nije mogao spremiti zapisnike iz isprobavanja Lufta

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft nije mogao dovršiti pregled ovog računala.
   *[windows] Meet Luft nije mogao dovršiti pregled ovog računala.
}
problem-room = Stvaranje prostora za Luft nije dovršeno.
problem-room-linux = Pripremanje Lufta nije dovršeno.
problem-update = Ažuriranje Lufta nije dovršeno.
problem-download = Preuzimanje Lufta je zaustavljeno. Provjerite jeste li povezani s internetom.
problem-pack = Pakiranje vaših stvari nije dovršeno.
problem-remove = Uklanjanje Lufta nije dovršeno.
problem-restart = Meet Luft nije mogao pripremiti ponovno pokretanje.
problem-tidy = Stari unosi za pokretanje nisu se mogli ukloniti.
problem-firmware = Meet Luft nije mogao otvoriti postavke firmvera.
problem-folders = Meet Luft nije mogao pregledati vaše mape.
problem-sticks = Meet Luft nije mogao potražiti USB pogone.
problem-stick = Izrada USB memorije nije dovršena.
problem-offer = Luft se trenutačno ne može preuzeti. Provjerite jeste li povezani s internetom ili upotrijebite ISO koji već imate.
problem-luft = Meet Luft nije mogao pregledati disk Lufta.
problem-resize = Promjena veličine Lufta nije dovršena.
problem-cancel = Meet Luft nije mogao otkazati promjenu.
problem-give = Windows nije mogao ponovno preuzeti prostor.
problem-declined = { $platform ->
    [linux] Meet Luft traži vaše dopuštenje za rad na disku. Upišite lozinku kad se zatraži.
   *[windows] Meet Luft traži vaše dopuštenje za rad na disku. Odaberite Da kad Windows to zatraži.
}

## First screen

hello-intro = { $platform ->
    [linux] Isprobajte Luft izravno odavde, bez USB memorije. Ako vam se svidi, Luft može zamijeniti ovaj sustav i zadržati vaše datoteke.
   *[windows] Luft može živjeti odmah uz Windows. Najprije ga isprobajte bez instaliranja, a svoje stvari ponesite kad budete spremni.
}
hello-check = { $platform ->
    [linux] Provjeri ovo računalo
   *[windows] Provjeri ovo računalo
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Pregled ovog računala
   *[windows] Pregled ovog računala
}
check-ready-title = { $platform ->
    [linux] Ovo računalo je spremno za Luft
   *[windows] Ovo računalo je spremno za Luft
}
check-blocked-title = Još malo
check-moment = Ovo traje trenutak.
check-slow = Windows računa koliko prostora može ustupiti. Na velikom disku to može potrajati nekoliko minuta.
check-blocked-description = Nešto se mora promijeniti prije nego što se Luft može useliti. Evo što treba učiniti.
check-found-description = Evo što je Meet Luft pronašao.
check-checking = Provjeravanje diska, firmvera i hardvera…
check-again = Provjeri ponovno
check-action-firmware = Otvori postavke firmvera
check-action-tidy = Pospremi
check-firmware-title = Ponovno pokrenuti u postavke firmvera?
check-firmware-description = Najprije spremite ono na čemu radite. Ondje uključite Secure Boot i spremite promjene, a računalo će se zatim pokrenuti kao i obično.
check-tidy-title = Ukloniti stare unose za pokretanje?
check-tidy-description = Upućuju samo na sustave kojih više nema. Windows i sve ostalo pokreću se kao i prije.
check-get-ready-title = Pripremiti Luft?
check-get-ready-file = Meet Luft kopira Luft iz vašeg ISO-a u mapu na ovom računalu i dodaje unos za pokretanje. Particije se ne mijenjaju.
check-get-ready-download = Meet Luft preuzima Luft, oko { $size }, u mapu na ovom računalu i dodaje unos za pokretanje. Particije se ne mijenjaju.
check-get-ready-confirm = Pripremi

## Choosing how much of the Windows drive Luft gets

room-title = Koliko prostora za Luft?
room-description = Windows se smanjuje kako bi Luft dobio prostor. Vaše datoteke u sustavu Windows ostaju točno gdje jesu.
room-live = Windows zadržava prostor za rast. Luft odvaja i { $size } za pokretanje, koje vraća nakon instalacije.
room-make = Stvori prostor
room-confirm-title = Dati Luftu { $size }?
room-confirm-file = Windows smanjuje svoj disk, a zatim Meet Luft kopira Luft iz vašeg ISO-a. Neka računalo bude priključeno na napajanje.
room-confirm-download = Windows smanjuje svoj disk, a zatim Meet Luft preuzima Luft, oko { $size }. Neka računalo bude priključeno na napajanje i internet.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kamo smjestiti Luft?
room-places-description = Luft može dijeliti disk sa sustavom Windows ili zauzeti prostor koji Windows ne koristi.
room-places-label = Mjesta za Luft
room-place-windows = Uz Windows
room-place-windows-detail = Windows se smanjuje kako bi Luft dobio prostor
room-place-windows-free = Ondje je već slobodno { $size }
room-place-free = Slobodni prostor na disku { $drive }
room-place-free-here = Slobodni prostor na disku sustava Windows
room-place-free-detail = { $size } koje ništa drugo ne koristi
room-place-whole = Cijeli disk { $drive }
room-place-whole-detail = Ovaj disk od { $size } briše se za Luft
room-live-free = Od toga je { $free } već slobodno, pa Windows ustupa manje i zadržava prostor za rast. Luft odvaja i { $size } za pokretanje, koje vraća nakon instalacije.
room-live-elsewhere = Luft ondje dobiva { $room } i odvaja još { $size } za pokretanje, koje vraća nakon instalacije.
room-confirm-free-title = Dati Luftu { $size } slobodnog prostora?
room-confirm-free-file = Meet Luft u njega kopira Luft iz vašeg ISO-a. Ništa se drugo na disku ne mijenja.
room-confirm-free-download = Meet Luft u njega preuzima Luft, oko { $size }. Ništa se drugo na disku ne mijenja. Neka računalo ostane povezano s internetom.
room-erase-title = Izbrisati disk { $drive }?
room-erase-description = Sve na ovom disku od { $size } briše se odmah, prije pokretanja Lufta. To se ne može poništiti. Trenutačno je na njemu:
room-erase-empty = Windows ne može pročitati ništa na ovom disku od { $size }, ali sve što je na njemu odmah se briše. To se ne može poništiti.
room-erase-unnamed = Particija bez naziva
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrirano BitLockerom
room-erase-understood = Znam da je dio podataka šifriran BitLockerom i da se ne može vratiti
room-erase-confirm = Izbriši i stvori prostor

## Luft is ready on Windows

ready-title = Luft je spreman
ready-description = Odaberite kako ga želite upoznati. Windows se poslije pokreće kao i obično, osim ako instalirate Luft i odaberete njega.
ready-update-title = Nabavi najnoviji Luft
ready-update-description = Izašla je novija verzija. Zamjenjuje ovu, a zadržava prostor i sve što ste spakirali.
ready-try-title = Isprobaj Luft
ready-try-description = Ponovno pokrenite u Luft bez instaliranja. Windows se sljedeći put pokreće kao i obično.
ready-box-description = Spakirajte dokumente, fotografije, Wi-Fi mreže i drugo, a Luft će ih raspakirati nakon instalacije.
ready-box-packed = Spakirano, { $size }
ready-install-title = Instaliraj Luft
ready-install-description = Ponovno pokrenite u instalacijski program. Prostor od { $size } uz Windows već ga čeka.
ready-install-drive-description = Ponovno pokrenite u instalacijski program. Prostor od { $size } na disku { $drive } već ga čeka.
ready-stick-description = Stavite Luft na USB memoriju i pokrenite ga na bilo kojem računalu.
ready-remove = Ukloni Luft s ovog računala
ready-restart-try = Najprije spremite ono na čemu radite. Luft se otvara za otprilike minutu, a sljedeće ponovno pokretanje vraća vas u Windows.
ready-restart-install = Najprije spremite ono na čemu radite. Instalacijski program otvara se za otprilike minutu i ništa se ne mijenja dok ondje ne potvrdite.
ready-fast-startup-title = Isključi brzo pokretanje u sustavu Windows
ready-fast-startup-description = Windows se tada potpuno isključuje, pa zvuk, Wi-Fi i Bluetooth u Luftu kreću ispočetka.
ready-clock-title = Neka sat bude točan u oba sustava
ready-clock-description = Windows čita sat računala jednako kao Luft, pa vrijeme više ne skače kad se prebacujete.
ready-remove-title = Ukloniti Luft s ovog računala?
ready-remove-description = Meet Luft briše sve što je dodao, uključujući kutiju za selidbu, i vraća sustavu Windows sav njegov prostor.

## Luft is ready on Linux

linux-ready-description = Odaberite kako ga želite upoznati. { $system } se i dalje pokreće kao i obično dok ne odlučite drukčije.
linux-ready-this-system = ovaj sustav
linux-ready-update-description = Izašla je novija verzija. Zamjenjuje onu koju čuva Meet Luft i zadržava zapisnike iz isprobavanja.
linux-ready-try-description = Ponovno pokrenite u Luft bez ikakvih promjena. { $system } se sljedeći put pokreće kao i obično.
linux-ready-replace-title = Zamijeni { $system }
linux-ready-replace-description = Luft dolazi na njegovo mjesto i zadržava vaše datoteke, račun, Wi-Fi mreže i ostale diskove. Stari sustav ostaje dok ga ne uklonite.
linux-ready-install-description = Ponovno pokrenite u instalacijski program da biste Luft stavili na drugi disk ili u slobodni prostor.
linux-ready-remove = Ukloni Luft s ovog računala
linux-ready-restart-try = Najprije spremite ono na čemu radite. Luft se otvara za otprilike minutu, a sljedeće ponovno pokretanje vraća vas u { $system }.
linux-ready-restart-replace = Najprije spremite ono na čemu radite. Instalacijski program otvara se s odabranom zamjenom za { $system } i prikazuje što ostaje prije bilo kakve promjene.
linux-ready-remove-title = Ukloniti Luft s ovog računala?
linux-ready-remove-description = Meet Luft briše datoteke Lufta, njegove datoteke za pokretanje i njegov unos za pokretanje. Sve ostalo ostaje kako jest.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Vaš Luft
luft-looking = Meet Luft je pronašao Luft na ovom računalu.
luft-checking = Pregledavanje diska Lufta…
luft-description-beside = Luft je instaliran uz Windows na ovom računalu.
luft-description-drive = Luft je instaliran na disku { $drive }.
luft-bar-used = { $size }, zauzeto { $used }
luft-resize-title = Promijeni koliko prostora ima Luft
luft-resize-description = Dajte Luftu više prostora sustava Windows ili dio prostora vratite sustavu Windows.
luft-resize-drive-description = Dajte Luftu više slobodnog prostora na disku { $drive } ili dio ostavite slobodnim.
luft-resize-passphrase = Luftov disk otvara se samo lozinkom za disk, a Luft je ne može sam upisati dok se premješta.
luft-resize-start-first = Jednom pokrenite Luft kako bi aplikaciji Meet Luft mogao javiti koliko je pun, a zatim se vratite.
luft-resize-apart = Između sustava Windows i Lufta nalazi se još jedna particija, pa ne mogu dijeliti prostor.
luft-pending-grow = Luft se povećava pri sljedećem pokretanju
luft-pending-grow-description = Ponovno pokrenite u Luft i ostavite ga uključenim nekoliko minuta dok se premješta u novi prostor. U međuvremenu ga možete koristiti.
luft-pending-shrink = Luft oslobađa prostor pri sljedećem pokretanju
luft-pending-shrink-description = Ponovno pokrenite u Luft i ostavite ga uključenim nekoliko minuta dok premješta svoje datoteke. Zatim ponovno otvorite Meet Luft u sustavu Windows kako bi Windows preuzeo prostor.
luft-pending-trim = Luft se smanjuje pri sljedećem pokretanju
luft-pending-trim-description = Ponovno pokrenite u Luft i smanjit će se za otprilike minutu.
luft-windows-free-title = Daj sustavu Windows slobodni prostor
luft-windows-free-description = Prostor od { $size } odmah iza sustava Windows ništa ne koristi. Windows ga može ponovno preuzeti.
luft-leftovers-title = Počisti nakon isprobavanja Lufta
luft-leftovers-description = Particije koje je Meet Luft izradio za pokretanje Lufta još su ovdje. Luftu više nisu potrebne.
luft-start = Ponovno pokreni u Luft
luft-cancel = Otkaži promjenu
luft-restart = Najprije spremite ono na čemu radite. Luft se pokreće za otprilike minutu, a sljedeće ponovno pokretanje vraća vas u Windows.
luft-restart-pending = Najprije spremite ono na čemu radite. Luft se pokreće za otprilike minutu i sam premješta svoje datoteke, što traje nekoliko minuta. U međuvremenu ga možete koristiti.
luft-remove = Ukloni Luft s ovog računala
luft-remove-title = Ukloniti Luft s ovog računala?
luft-remove-description = Briše se Luft i sve u njemu, ukupno { $size }, a Windows dobiva prostor natrag. Računalo će pokretati Windows kao i prije. To se ne može poništiti.
luft-remove-drive-description = S diska { $drive } briše se Luft i sve u njemu, ukupno { $size }. Računalo će pokretati Windows kao i prije. To se ne može poništiti.
luft-remove-confirm = Ukloni Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Koliko prostora za Luft?
resize-description = Povlačenjem podijelite disk između sustava Windows i Lufta. Luft sam provodi promjenu pri sljedećem pokretanju.
resize-measuring = Windows računa koliko prostora može ustupiti. Na velikom disku to može potrajati nekoliko minuta.
resize-full = Luft je previše pun za premještanje, a Windows ne može ustupiti dovoljno prostora za njega. Najprije oslobodite prostor u Luftu ili u sustavu Windows.
resize-drive-description = Povlačenjem odaberite koliko diska { $drive } zauzima Luft. Luft sam provodi promjenu pri sljedećem pokretanju.
resize-drive-free = Slobodno na disku { $drive }: { $size }
resize-used = Datoteke Lufta zauzimaju { $size }.
resize-least = Promijenite za najmanje { $size }.
resize-apply = Promijeni
resize-grow-title = Dati Luftu još { $size }?
resize-grow-description = Windows se odmah smanjuje. Luft se premješta u novi prostor pri sljedećem pokretanju, što traje nekoliko minuta. Neka računalo bude priključeno na napajanje.
resize-grow-drive-description = Luft pri sljedećem pokretanju zauzima slobodni prostor na disku { $drive }, što traje samo tren.
resize-trim-title = Smanjiti Luft za { $size }?
resize-trim-description = Luft se smanjuje pri sljedećem pokretanju, a prostor na disku { $drive } ostaje slobodan.
resize-shrink-title = Vratiti sustavu Windows { $size }?
resize-shrink-description = Luft premješta svoje datoteke pri sljedećem pokretanju, što traje nekoliko minuta. Zatim ponovno otvorite Meet Luft i Windows će preuzeti prostor natrag. Neka računalo bude priključeno na napajanje.

## Packing things to take along to Luft (the moving box)

box-title = Ponesite svoje stvari
box-description = Odaberite što ćete ponijeti. Luft će to nakon instalacije raspakirati u vaš novi račun, a iz sustava Windows ništa se ne uklanja.
box-looking = Pregledavanje vaših mapa…
box-folder-desktop = Radna površina
box-folder-documents = Dokumenti
box-folder-downloads = Preuzimanja
box-folder-music = Glazba
box-folder-pictures = Slike
box-folder-videos = Videozapisi
box-folder-size = { $size }, { $files ->
    [one] { $files } datoteka
    [few] { $files } datoteke
   *[other] { $files } datoteka
}
box-wifi-title = Wi-Fi mreže
box-wifi-description = S lozinkama, pa je Luft odmah na internetu
box-bluetooth-title = Bluetooth uređaji
box-bluetooth-description = { $devices ->
    [one] { $devices } uređaj, spreman bez ponovnog uparivanja
    [few] { $devices } uređaja, spremna bez ponovnog uparivanja
   *[other] { $devices } uređaja, spremnih bez ponovnog uparivanja
}
box-wallpaper-title = Pozadina
box-wallpaper-description = Slika na vašoj radnoj površini u sustavu Windows
box-account-title = Vaše ime i slika
box-total-slow = { $size }, pakiranje traje oko { $minutes ->
    [one] { $minutes } minutu
    [few] { $minutes } minute
   *[other] { $minutes } minuta
}
box-pack = Spakiraj

## Progress while Meet Luft works

working-shrinking = Stvaranje prostora
    .description = Windows premješta svoje datoteke kako bi oslobodio prostor. To može potrajati nekoliko minuta.
working-erasing = Brisanje diska
    .description = Windows ga čisti kako bi cijeli pripao Luftu.
working-partitioning = Priprema prostora za Luft
    .description = Pripremaju se particije s kojih se Luft pokreće.
working-downloading = Prijenos Lufta
    .description = Luft se kopira izravno u svoj prostor i provjerava usput.
working-packing = Pakiranje vaših stvari
    .description = Sve što ste odabrali kopira se u kutiju za selidbu. Velike mape traju neko vrijeme.
working-removing = Uklanjanje Lufta
    .description = Prostor se vraća sustavu Windows.
working-removing-linux = Uklanjanje Lufta
    .description = Uklanjaju se njegove datoteke i unos za pokretanje.
working-writing = Izrada USB memorije
    .description = Luft se zapisuje na cijelu memoriju. Ne isključujte je.
working-copying = Dodavanje Lufta u Ventoy
    .description = Luft se kopira uz ostale ISO-ove na memoriji. Ne isključujte je.
working-verifying = Provjera USB memorije
    .description = Sve se ponovno čita kako bi se provjerilo da se pokreće.
working-stick-downloading = Preuzimanje Lufta
    .description = Usput se provjerava i čuva, pa je sljedeća memorija brže gotova.
working-progress = { $done } od { $total }
working-keep-open = Ne zatvarajte ovaj prozor.

## After Luft was removed

removed-title = Sve je kao prije
removed-description = { $platform ->
    [linux] Datoteke Lufta i njegov unos za pokretanje su uklonjeni, a računalo se pokreće kao i prije. Vratite se kad god želite.
   *[windows] Particije Lufta i njegov unos za pokretanje su uklonjeni, a Windows ponovno ima sav svoj prostor. Vratite se kad god želite.
}

## Making a USB stick

stick-title = Izradi USB memoriju
stick-description = Luft se s nje pokreće na bilo kojem računalu, za isprobavanje ili instalaciju.
stick-looking = Traženje USB pogona…
stick-none = Priključite USB memoriju od { $size } ili više. Pojavit će se ovdje.
stick-drives-label = USB pogoni
stick-offer = { $name }, { $size }
stick-make = Izradi memoriju
stick-drive-empty = Prazno
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Premalo za Luft
stick-ventoy-title = Ova memorija koristi Ventoy
stick-ventoy-description = Dodati Luft na nju ili izbrisati cijelu memoriju i pretvoriti je u memoriju za Luft?
stick-erase-it = Izbriši je
stick-add = Dodaj Luft
stick-replace-title = Zamijeniti Luft na njoj?
stick-replace-description = { $count ->
    [one] Na ovoj memoriji već je { $names }. Novi Luft može doći na njegovo mjesto.
    [few] Na ovoj memoriji već su { $names }. Novi Luft može doći na njihovo mjesto.
   *[other] Na ovoj memoriji već su { $names }. Novi Luft može doći na njihovo mjesto.
}
stick-keep = { $count ->
    [one] Zadrži oba
    [few] Zadrži sve
   *[other] Zadrži sve
}
stick-replace = Zamijeni
stick-full-title = Za Luft nema mjesta
stick-full-description = Luftu treba { $needed }, a na ovoj je memoriji slobodno { $free }. Oslobodite prostor na njoj ili je izbrišite i pretvorite u memoriju za Luft.
stick-erase-title = Izbrisati { $name }?
stick-erase-description = Sve na ovoj memoriji od { $size } briše se i zamjenjuje Luftom. To se ne može poništiti.
stick-erase-confirm = Izbriši i izradi memoriju
stick-done-title = Vaša USB memorija s Luftom je spremna
stick-done-ventoy-title = Luft je na vašoj memoriji s Ventoyjem
stick-done-take-out = Sada je možete izvaditi.
stick-done-eject = Izbacite je prije nego što je izvadite.
stick-done-start = Da biste pokrenuli računalo s nje, priključite je i odaberite je u izborniku za pokretanje računala, koji se otvara tipkom poput F12, F8 ili Esc odmah nakon uključivanja.
stick-done-ventoy-key = Kad je Secure Boot uključen, Ventoy pri prvom pokretanju jednom traži da se upiše njegov ključ.
stick-done = Gotovo
stick-done-another = Izradi još jednu
