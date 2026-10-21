## Messages that some steps share

meet-back = Nazad
meet-cancel = Otkaži
meet-continue = Nastavi
meet-try-again = Pokušaj ponovo
meet-restart = Ponovo pokreni
meet-remove = Ukloni
meet-keep-it = Zadrži
meet-close = Zatvori
meet-restart-title = Ponovo pokrenuti sada?
meet-not-yet = Ne još
meet-iso-use = Koristi ISO koji već imam
meet-iso-using = Koristi se vaš ISO za Luft
meet-nightly = Noćne verzije
meet-channel-nightly = Meet Luft će koristiti noćne verzije
meet-channel-latest = Meet Luft će ponovo koristiti izdanja
meet-undo = Opozovi
meet-logs-saved = Evidencije iz isprobavanja sistema Luft sačuvane su na radnu površinu
meet-logs-show = Prikaži
meet-logs-none = Još nema evidencija iz isprobavanja sistema Luft
meet-logs-failed = Aplikacija Meet Luft nije mogla da sačuva evidencije iz isprobavanja sistema Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Aplikacija Meet Luft nije mogla da završi pregled ovog računara.
   *[windows] Aplikacija Meet Luft nije mogla da završi pregled ovog računara.
}
problem-room = Pravljenje prostora za Luft nije završeno.
problem-room-linux = Priprema sistema Luft nije završena.
problem-update = Ažuriranje sistema Luft nije završeno.
problem-download = Preuzimanje sistema Luft je zaustavljeno. Proverite da li ste povezani na internet.
problem-pack = Pakovanje vaših stvari nije završeno.
problem-remove = Uklanjanje sistema Luft nije završeno.
problem-restart = Aplikacija Meet Luft nije mogla da pripremi ponovno pokretanje.
problem-tidy = Stare stavke za pokretanje nisu mogle da se uklone.
problem-firmware = Aplikacija Meet Luft nije mogla da otvori podešavanja firmvera.
problem-folders = Aplikacija Meet Luft nije mogla da pregleda vaše fascikle.
problem-sticks = Aplikacija Meet Luft nije mogla da potraži USB uređaje.
problem-stick = Pravljenje USB fleša nije završeno.
problem-offer = Luft trenutno ne može da se preuzme. Proverite da li ste povezani na internet ili upotrebite ISO koji već imate.
problem-luft = Aplikacija Meet Luft nije mogla da pregleda disk sistema Luft.
problem-resize = Promena veličine sistema Luft nije završena.
problem-cancel = Aplikacija Meet Luft nije mogla da otkaže promenu.
problem-give = Windows nije mogao ponovo da preuzme prostor.
problem-declined = { $platform ->
    [linux] Meet Luft traži vašu dozvolu za rad na disku. Unesite lozinku kad se zatraži.
   *[windows] Meet Luft traži vašu dozvolu za rad na disku. Izaberite Da kad Windows to zatraži.
}

## First screen

hello-intro = { $platform ->
    [linux] Isprobajte Luft direktno odavde, bez USB fleša. Ako vam se dopadne, Luft može da zauzme mesto ovog sistema i zadrži vaše datoteke.
   *[windows] Luft može da živi odmah pored sistema Windows. Prvo ga isprobajte bez instaliranja, a svoje stvari ponesite kad budete spremni.
}
hello-check = { $platform ->
    [linux] Proveri ovaj računar
   *[windows] Proveri ovaj računar
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Pregled ovog računara
   *[windows] Pregled ovog računara
}
check-ready-title = { $platform ->
    [linux] Ovaj računar je spreman za Luft
   *[windows] Ovaj računar je spreman za Luft
}
check-blocked-title = Još malo
check-moment = Ovo traje trenutak.
check-slow = Windows računa koliko prostora može da ustupi. Na velikom disku to može da potraje nekoliko minuta.
check-blocked-description = Nešto mora da se promeni pre nego što Luft može da se useli. Evo šta treba uraditi.
check-found-description = Evo šta je aplikacija Meet Luft pronašla.
check-checking = Provera diska, firmvera i hardvera…
check-again = Proveri ponovo
check-action-firmware = Otvori podešavanja firmvera
check-action-tidy = Počisti
check-firmware-title = Ponovo pokrenuti u podešavanja firmvera?
check-firmware-description = Prvo sačuvajte ono na čemu radite. Tamo uključite Secure Boot i sačuvajte promene, a računar će se zatim pokrenuti kao i obično.
check-tidy-title = Ukloniti stare stavke za pokretanje?
check-tidy-description = Upućuju samo na sisteme kojih više nema. Windows i sve ostalo pokreću se kao i ranije.
check-get-ready-title = Pripremiti Luft?
check-get-ready-file = Meet Luft kopira Luft iz vašeg ISO-a u fasciklu na ovom računaru i dodaje stavku za pokretanje. Particije se ne menjaju.
check-get-ready-download = Meet Luft preuzima Luft, oko { $size }, u fasciklu na ovom računaru i dodaje stavku za pokretanje. Particije se ne menjaju.
check-get-ready-confirm = Pripremi

## Choosing how much of the Windows drive Luft gets

room-title = Koliko prostora za Luft?
room-description = Windows se smanjuje da bi Luft dobio prostor. Vaše datoteke u sistemu Windows ostaju tačno gde jesu.
room-live = Windows zadržava prostor za rast. Luft odvaja i { $size } za pokretanje, koje vraća posle instalacije.
room-make = Napravi prostor
room-confirm-title = Dati sistemu Luft { $size }?
room-confirm-file = Windows smanjuje svoj disk, a zatim Meet Luft kopira Luft iz vašeg ISO-a. Neka računar bude priključen na napajanje.
room-confirm-download = Windows smanjuje svoj disk, a zatim Meet Luft preuzima Luft, oko { $size }. Neka računar bude priključen na napajanje i internet.

## Choosing where Luft goes, when there's more than one place

room-places-title = Gde će biti Luft?
room-places-description = Luft može da deli disk sa sistemom Windows ili da zauzme prostor koji Windows ne koristi.
room-places-label = Mesta za Luft
room-place-windows = Pored sistema Windows
room-place-windows-detail = Windows se smanjuje da bi Luft dobio prostor
room-place-windows-free = Tamo je već slobodno { $size }
room-place-free = Slobodan prostor na disku { $drive }
room-place-free-here = Slobodan prostor na disku sistema Windows
room-place-free-detail = Prostor od { $size } koji ništa drugo ne koristi
room-place-whole = Ceo disk { $drive }
room-place-whole-detail = Disk od { $size } briše se za Luft
room-live-free = Od toga je već slobodno { $free }, pa Windows ustupa manje i zadržava prostor za rast. Luft odvaja i { $size } za pokretanje, koje vraća posle instalacije.
room-live-elsewhere = Luft tamo dobija { $room }, a odvaja još { $size } za pokretanje, koje vraća posle instalacije.
room-confirm-free-title = Dati sistemu Luft { $size } slobodnog prostora?
room-confirm-free-file = Meet Luft u njega kopira Luft iz vašeg ISO-a. Ništa drugo na disku se ne menja.
room-confirm-free-download = Meet Luft u njega preuzima Luft, oko { $size }. Ništa drugo na disku se ne menja. Neka računar ostane povezan na internet.
room-erase-title = Izbrisati disk { $drive }?
room-erase-description = Sve na ovom disku od { $size } briše se odmah, pre nego što se Luft pokrene. Ovo ne može da se opozove. Trenutno se na njemu nalazi:
room-erase-empty = Windows ne može ništa da pročita na ovom disku od { $size }, ali šta god da je na njemu briše se odmah. Ovo ne može da se opozove.
room-erase-unnamed = Particija bez naziva
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrovana pomoću BitLocker-a
room-erase-understood = Razumem da je deo toga šifrovan pomoću BitLocker-a i da ne može da se povrati
room-erase-confirm = Izbriši i napravi prostor

## Luft is ready on Windows

ready-title = Luft je spreman
ready-description = Izaberite kako želite da ga upoznate. Windows se posle pokreće kao i obično, osim ako instalirate Luft i izaberete njega.
ready-update-title = Preuzmi najnoviji Luft
ready-update-description = Izašla je novija verzija. Zamenjuje ovu, a zadržava prostor i sve što ste spakovali.
ready-try-title = Isprobaj Luft
ready-try-description = Ponovo pokrenite u Luft bez instaliranja. Windows se sledeći put pokreće kao i obično.
ready-box-description = Spakujte dokumente, fotografije, Wi-Fi mreže i drugo, a Luft će ih raspakovati posle instalacije.
ready-box-packed = Spakovano, { $size }
ready-install-title = Instaliraj Luft
ready-install-description = Ponovo pokrenite u program za instalaciju. Prostor od { $size } pored sistema Windows ga već čeka.
ready-install-drive-description = Ponovo pokrenite u program za instalaciju. Prostor od { $size } na disku { $drive } ga već čeka.
ready-stick-description = Stavite Luft na USB fleš i pokrenite ga na bilo kom računaru.
ready-remove = Ukloni Luft sa ovog računara
ready-restart-try = Prvo sačuvajte ono na čemu radite. Luft se otvara za otprilike minut, a sledeće ponovno pokretanje vraća vas u Windows.
ready-restart-install = Prvo sačuvajte ono na čemu radite. Program za instalaciju se otvara za otprilike minut i ništa se ne menja dok tamo ne potvrdite.
ready-fast-startup-title = Isključi Brzo pokretanje u sistemu Windows
ready-fast-startup-description = Windows se tada potpuno isključuje, pa zvuk, Wi-Fi i Bluetooth u sistemu Luft kreću ispočetka.
ready-clock-title = Tačno vreme u oba sistema
ready-clock-description = Windows čita sat računara na isti način kao Luft, pa vreme više ne skače kad prelazite iz jednog u drugi.
ready-remove-title = Ukloniti Luft sa ovog računara?
ready-remove-description = Aplikacija Meet Luft briše sve što je dodala, uključujući kutiju za selidbu, i vraća sistemu Windows sav njegov prostor.

## Luft is ready on Linux

linux-ready-description = Izaberite kako želite da ga upoznate. Sistem { $system } se i dalje pokreće kao i obično dok ne odlučite drugačije.
linux-ready-this-system = ovaj sistem
linux-ready-update-description = Izašla je novija verzija. Zamenjuje onu koju čuva Meet Luft i zadržava evidencije iz isprobavanja.
linux-ready-try-description = Ponovo pokrenite u Luft bez ikakvih promena. Sistem { $system } se sledeći put pokreće kao i obično.
linux-ready-replace-title = Zameni { $system }
linux-ready-replace-description = Luft zauzima njegovo mesto i zadržava vaše datoteke, nalog, Wi-Fi mreže i ostale diskove. Stari sistem ostaje dok ga ne uklonite.
linux-ready-install-description = Ponovo pokrenite u program za instalaciju da biste stavili Luft na drugi disk ili u slobodan prostor.
linux-ready-remove = Ukloni Luft sa ovog računara
linux-ready-restart-try = Prvo sačuvajte ono na čemu radite. Luft se otvara za otprilike minut, a sledeće ponovno pokretanje vraća vas u sistem { $system }.
linux-ready-restart-replace = Prvo sačuvajte ono na čemu radite. Program za instalaciju se otvara sa izabranom zamenom za sistem { $system } i prikazuje šta ostaje pre bilo kakve promene.
linux-ready-remove-title = Ukloniti Luft sa ovog računara?
linux-ready-remove-description = Meet Luft briše datoteke sistema Luft, njegove datoteke za pokretanje i njegovu stavku za pokretanje. Sve ostalo ostaje kako jeste.

## Luft is installed on this PC

luft-title = Vaš Luft
luft-looking = Aplikacija Meet Luft je pronašla Luft na ovom računaru.
luft-checking = Pregled diska sistema Luft…
luft-description-beside = Luft je instaliran pored sistema Windows na ovom računaru.
luft-description-drive = Luft je instaliran na disku { $drive }.
luft-bar-used = { $size }, zauzeto { $used }
luft-resize-title = Promeni koliko prostora ima Luft
luft-resize-description = Dajte sistemu Luft deo prostora sistema Windows ili vratite deo prostora sistemu Windows.
luft-resize-encrypted = Disk sistema Luft je šifrovan, pa bi za njegovo pomeranje bio potreban ključ za oporavak. Prvo isključite šifrovanje uređaja u Podešavanjima sistema Luft, pa se vratite.
luft-resize-apart = Između sistema Windows i Luft nalazi se druga particija, pa ne mogu da dele prostor.
luft-resize-unreadable = Aplikacija Meet Luft nije mogla da utvrdi koliko je Luft popunjen.
luft-pending-grow = Luft se povećava pri sledećem pokretanju
luft-pending-grow-description = Ponovo pokrenite u Luft i ostavite ga uključenim nekoliko minuta dok se širi u novi prostor. Za to vreme možete da ga koristite.
luft-pending-shrink = Luft oslobađa prostor pri sledećem pokretanju
luft-pending-shrink-description = Ponovo pokrenite u Luft i ostavite ga uključenim nekoliko minuta dok premešta svoje datoteke. Zatim ponovo otvorite Meet Luft u sistemu Windows da bi Windows dobio prostor.
luft-windows-free-title = Daj sistemu Windows slobodan prostor
luft-windows-free-description = Prostor od { $size } odmah iza sistema Windows ništa ne koristi. Windows može ponovo da ga zauzme.
luft-leftovers-title = Počisti posle isprobavanja sistema Luft
luft-leftovers-description = Particije koje je aplikacija Meet Luft napravila za pokretanje sistema Luft još su tu. Sistemu Luft više nisu potrebne.
luft-start = Ponovo pokreni u Luft
luft-cancel = Otkaži promenu
luft-restart = Prvo sačuvajte ono na čemu radite. Luft se pokreće za otprilike minut, a sledeće ponovno pokretanje vraća vas u Windows.
luft-restart-pending = Prvo sačuvajte ono na čemu radite. Luft se pokreće za otprilike minut i sam premešta svoje datoteke, što traje nekoliko minuta. Za to vreme možete da ga koristite.
luft-remove = Ukloni Luft sa ovog računara
luft-remove-title = Ukloniti Luft sa ovog računara?
luft-remove-description = Luft i sve u njemu se briše, ukupno { $size }, a Windows dobija prostor nazad. Računar pokreće Windows kao i ranije. Ovo ne može da se opozove.
luft-remove-drive-description = Luft i sve u njemu se briše sa diska { $drive }, ukupno { $size }. Računar pokreće Windows kao i ranije. Ovo ne može da se opozove.
luft-remove-confirm = Ukloni Luft

## Changing how much space Luft has

resize-title = Koliko prostora za Luft?
resize-description = Prevucite da biste podelili disk između sistema Windows i Luft. Luft sam sprovodi promenu pri sledećem pokretanju.
resize-measuring = Windows računa koliko prostora može da ustupi. Na velikom disku to može da potraje nekoliko minuta.
resize-full = Luft je previše pun da bi se pomerio, a Windows ne može da ustupi dovoljno prostora za njega. Prvo oslobodite prostor u sistemu Luft ili u sistemu Windows.
resize-used = Datoteke sistema Luft zauzimaju { $size }.
resize-least = Promenite za najmanje { $size }.
resize-apply = Promeni
resize-grow-title = Dati sistemu Luft još { $size }?
resize-grow-description = Windows se odmah smanjuje. Luft se pri sledećem pokretanju širi u novi prostor, što traje nekoliko minuta. Neka računar bude priključen na napajanje.
resize-shrink-title = Vratiti sistemu Windows { $size }?
resize-shrink-description = Luft pri sledećem pokretanju premešta svoje datoteke, što traje nekoliko minuta. Zatim ponovo otvorite Meet Luft i Windows će preuzeti prostor. Neka računar bude priključen na napajanje.

## Packing things to take along to Luft (the moving box)

box-title = Ponesite svoje stvari
box-description = Izaberite šta ćete poneti. Luft će to posle instalacije raspakovati u vaš novi nalog, a iz sistema Windows se ništa ne uklanja.
box-looking = Pregledanje vaših fascikli…
box-folder-desktop = Radna površina
box-folder-documents = Dokumenti
box-folder-downloads = Preuzimanja
box-folder-music = Muzika
box-folder-pictures = Slike
box-folder-videos = Video-snimci
box-folder-size = { $size }, { $files ->
    [one] { $files } datoteka
    [few] { $files } datoteke
   *[other] { $files } datoteka
}
box-wifi-title = Wi-Fi mreže
box-wifi-description = Sa lozinkama, pa je Luft odmah na internetu
box-bluetooth-title = Bluetooth uređaji
box-bluetooth-description = { $devices ->
    [one] { $devices } uređaj, spreman bez ponovnog uparivanja
    [few] { $devices } uređaja, spremna bez ponovnog uparivanja
   *[other] { $devices } uređaja, spremnih bez ponovnog uparivanja
}
box-wallpaper-title = Pozadina
box-wallpaper-description = Slika na vašoj radnoj površini u sistemu Windows
box-account-title = Vaše ime i slika
box-total-slow = { $size }, pakovanje traje oko { $minutes ->
    [one] { $minutes } minut
    [few] { $minutes } minuta
   *[other] { $minutes } minuta
}
box-pack = Spakuj

## Progress while Meet Luft works

working-shrinking = Pravljenje prostora
    .description = Windows premešta svoje datoteke da oslobodi prostor. To može da potraje nekoliko minuta.
working-erasing = Brisanje diska
    .description = Windows ga prazni da bi Luft dobio ceo disk.
working-partitioning = Priprema prostora za Luft
    .description = Pripremaju se particije sa kojih se Luft pokreće.
working-downloading = Prenos sistema Luft
    .description = Luft se kopira direktno u svoj prostor i usput proverava.
working-packing = Pakovanje vaših stvari
    .description = Sve što ste izabrali kopira se u kutiju za selidbu. Velike fascikle traju neko vreme.
working-removing = Uklanjanje sistema Luft
    .description = Prostor se vraća sistemu Windows.
working-removing-linux = Uklanjanje sistema Luft
    .description = Uklanjaju se njegove datoteke i stavka za pokretanje.
working-writing = Pravljenje USB fleša
    .description = Luft se upisuje na ceo fleš. Ne isključujte ga.
working-copying = Dodavanje sistema Luft u Ventoy
    .description = Luft se kopira pored ostalih ISO datoteka na flešu. Ne isključujte ga.
working-verifying = Provera USB fleša
    .description = Sve se ponovo čita da bi se proverilo da se pokreće.
working-stick-downloading = Preuzimanje sistema Luft
    .description = Usput se proverava i čuva, pa je sledeći fleš brže gotov.
working-progress = { $done } od { $total }
working-keep-open = Ne zatvarajte ovaj prozor.

## After Luft was removed

removed-title = Sve je kao pre
removed-description = { $platform ->
    [linux] Datoteke sistema Luft i njegova stavka za pokretanje su uklonjene, a računar se pokreće kao i ranije. Vratite se kad god želite.
   *[windows] Particije sistema Luft i njegova stavka za pokretanje su uklonjene, a Windows ponovo ima sav svoj prostor. Vratite se kad god želite.
}

## Making a USB stick

stick-title = Napravi USB fleš
stick-description = Luft se sa njega pokreće na bilo kom računaru, za isprobavanje ili instalaciju.
stick-looking = Traženje USB uređaja…
stick-none = Priključite USB fleš od { $size } ili više. Pojaviće se ovde.
stick-drives-label = USB uređaji
stick-offer = { $name }, { $size }
stick-make = Napravi fleš
stick-drive-empty = Prazno
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Premalo za Luft
stick-ventoy-title = Ovaj fleš koristi Ventoy
stick-ventoy-description = Dodati Luft na njega ili izbrisati ceo fleš i pretvoriti ga u fleš za Luft?
stick-erase-it = Izbriši ga
stick-add = Dodaj Luft
stick-replace-title = Zameniti Luft na njemu?
stick-replace-description = { $count ->
    [one] Na ovom flešu već je { $names }. Novi Luft može da zauzme njegovo mesto.
    [few] Na ovom flešu već su { $names }. Novi Luft može da zauzme njihovo mesto.
   *[other] Na ovom flešu već su { $names }. Novi Luft može da zauzme njihovo mesto.
}
stick-keep = { $count ->
    [one] Zadrži oba
    [few] Zadrži sve
   *[other] Zadrži sve
}
stick-replace = Zameni
stick-full-title = Za Luft nema mesta
stick-full-description = Sistemu Luft treba { $needed }, a na ovom flešu slobodno je { $free }. Oslobodite prostor na njemu ili ga izbrišite i pretvorite u fleš za Luft.
stick-erase-title = Izbrisati { $name }?
stick-erase-description = Sve na ovom flešu od { $size } briše se i zamenjuje sistemom Luft. Ovo ne može da se opozove.
stick-erase-confirm = Izbriši i napravi fleš
stick-done-title = Vaš USB fleš sa sistemom Luft je spreman
stick-done-ventoy-title = Luft je na vašem flešu sa alatkom Ventoy
stick-done-take-out = Sada možete da ga izvadite.
stick-done-eject = Izbacite ga pre nego što ga izvadite.
stick-done-start = Da biste pokrenuli računar sa njega, priključite ga i izaberite u meniju za pokretanje računara, koji se otvara tasterom kao što je F12, F8 ili Esc odmah posle uključivanja.
stick-done-ventoy-key = Kad je Secure Boot uključen, Ventoy pri prvom pokretanju jednom traži da se upiše njegov ključ.
stick-done = Gotovo
stick-done-another = Napravi još jedan
