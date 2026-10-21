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
meet-iso-using = Koristi se vaš ISO Lufta
meet-nightly = Noćne verzije
meet-channel-nightly = Meet Luft će koristiti noćne verzije
meet-channel-latest = Meet Luft će ponovo koristiti izdanja
meet-undo = Poništi
meet-logs-saved = Zapisnici iz isprobavanja Lufta sačuvani su na radnu površinu
meet-logs-show = Prikaži
meet-logs-none = Još nema zapisnika iz isprobavanja Lufta
meet-logs-failed = Meet Luft nije mogao sačuvati zapisnike iz isprobavanja Lufta

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft nije mogao završiti pregled ovog računara.
   *[windows] Meet Luft nije mogao završiti pregled ovog računara.
}
problem-room = Pravljenje prostora za Luft nije završeno.
problem-room-linux = Pripremanje Lufta nije završeno.
problem-update = Ažuriranje Lufta nije završeno.
problem-download = Preuzimanje Lufta je zaustavljeno. Provjerite jeste li povezani na internet.
problem-pack = Pakovanje vaših stvari nije završeno.
problem-remove = Uklanjanje Lufta nije završeno.
problem-restart = Meet Luft nije mogao pripremiti ponovno pokretanje.
problem-tidy = Stari unosi za pokretanje nisu se mogli ukloniti.
problem-firmware = Meet Luft nije mogao otvoriti postavke firmvera.
problem-folders = Meet Luft nije mogao pregledati vaše foldere.
problem-sticks = Meet Luft nije mogao potražiti USB uređaje.
problem-stick = Pravljenje USB fleša nije završeno.
problem-offer = Luft se trenutno ne može preuzeti. Provjerite jeste li povezani na internet ili upotrijebite ISO koji već imate.
problem-declined = { $platform ->
    [linux] Meet Luft traži vašu dozvolu za rad na disku. Unesite lozinku kad se zatraži.
   *[windows] Meet Luft traži vašu dozvolu za rad na disku. Odaberite Da kad Windows to zatraži.
}

## First screen

hello-intro = { $platform ->
    [linux] Isprobajte Luft direktno odavde, bez USB fleša. Ako vam se svidi, Luft može zamijeniti ovaj sistem i zadržati vaše fajlove.
   *[windows] Luft može živjeti odmah pored Windowsa. Prvo ga isprobajte bez instaliranja, a svoje stvari ponesite kad budete spremni.
}
hello-check = { $platform ->
    [linux] Provjeri ovaj računar
   *[windows] Provjeri ovaj računar
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
check-slow = Windows računa koliko prostora može ustupiti. Na velikom disku to može potrajati nekoliko minuta.
check-blocked-description = Nešto se mora promijeniti prije nego što se Luft može useliti. Evo šta treba uraditi.
check-found-description = Evo šta je Meet Luft pronašao.
check-checking = Provjeravanje diska, firmvera i hardvera…
check-again = Provjeri ponovo
check-action-firmware = Otvori postavke firmvera
check-action-tidy = Počisti
check-firmware-title = Ponovo pokrenuti u postavke firmvera?
check-firmware-description = Prvo sačuvajte ono na čemu radite. Tamo uključite Secure Boot i sačuvajte promjene, a računar će se zatim pokrenuti kao i obično.
check-tidy-title = Ukloniti stare unose za pokretanje?
check-tidy-description = Upućuju samo na sisteme kojih više nema. Windows i sve ostalo pokreću se kao i prije.
check-get-ready-title = Pripremiti Luft?
check-get-ready-file = Meet Luft kopira Luft iz vašeg ISO-a u folder na ovom računaru i dodaje unos za pokretanje. Particije se ne mijenjaju.
check-get-ready-download = Meet Luft preuzima Luft, oko { $size }, u folder na ovom računaru i dodaje unos za pokretanje. Particije se ne mijenjaju.
check-get-ready-confirm = Pripremi

## Choosing how much of the Windows drive Luft gets

room-title = Koliko prostora za Luft?
room-description = Windows se smanjuje da bi Luft dobio prostor. Vaši fajlovi u Windowsu ostaju tačno tamo gdje jesu.
room-live = Windows zadržava prostor za rast. Luft odvaja i { $size } za pokretanje, koje vraća nakon instalacije.
room-make = Napravi prostor
room-confirm-title = Dati Luftu { $size }?
room-confirm-file = Windows smanjuje svoj disk, a zatim Meet Luft kopira Luft iz vašeg ISO-a. Neka računar bude priključen na napajanje.
room-confirm-download = Windows smanjuje svoj disk, a zatim Meet Luft preuzima Luft, oko { $size }. Neka računar bude priključen na napajanje i internet.

## Luft is ready on Windows

ready-title = Luft je spreman
ready-description = Odaberite kako ga želite upoznati. Windows se poslije pokreće kao i obično, osim ako instalirate Luft i odaberete njega.
ready-update-title = Preuzmi najnoviji Luft
ready-update-description = Izašla je novija verzija. Zamjenjuje ovu, a zadržava prostor i sve što ste spakovali.
ready-try-title = Isprobaj Luft
ready-try-description = Ponovo pokrenite u Luft bez instaliranja. Windows se sljedeći put pokreće kao i obično.
ready-box-description = Spakujte dokumente, fotografije, Wi-Fi mreže i drugo, a Luft će ih raspakovati nakon instalacije.
ready-box-packed = Spakovano, { $size }
ready-install-title = Instaliraj Luft
ready-install-description = Ponovo pokrenite u instalacijski program. Prostor od { $size } pored Windowsa već ga čeka.
ready-stick-description = Stavite Luft na USB fleš i pokrenite ga na bilo kojem računaru.
ready-remove = Ukloni Luft s ovog računara
ready-restart-try = Prvo sačuvajte ono na čemu radite. Luft se otvara za otprilike minutu, a sljedeće ponovno pokretanje vraća vas u Windows.
ready-restart-install = Prvo sačuvajte ono na čemu radite. Instalacijski program otvara se za otprilike minutu i ništa se ne mijenja dok tamo ne potvrdite.
ready-fast-startup-title = Isključi Brzo pokretanje u Windowsu
ready-fast-startup-description = Windows se tada potpuno isključuje, pa zvuk, Wi-Fi i Bluetooth u Luftu kreću ispočetka.
ready-clock-title = Tačno vrijeme u oba sistema
ready-clock-description = Windows čita sat računara jednako kao Luft, pa vrijeme više ne skače kad se prebacujete.
ready-remove-title = Ukloniti Luft s ovog računara?
ready-remove-description = Meet Luft briše sve što je dodao, uključujući kutiju za selidbu, i vraća Windowsu sav njegov prostor.

## Luft is ready on Linux

linux-ready-description = Odaberite kako ga želite upoznati. { $system } se i dalje pokreće kao i obično dok ne odlučite drugačije.
linux-ready-this-system = ovaj sistem
linux-ready-update-description = Izašla je novija verzija. Zamjenjuje onu koju čuva Meet Luft i zadržava zapisnike iz isprobavanja.
linux-ready-try-description = Ponovo pokrenite u Luft bez ikakvih promjena. { $system } se sljedeći put pokreće kao i obično.
linux-ready-replace-title = Zamijeni { $system }
linux-ready-replace-description = Luft preuzima njegovo mjesto i zadržava vaše fajlove, račun, Wi-Fi mreže i ostale diskove. Stari sistem ostaje dok ga ne uklonite.
linux-ready-install-description = Ponovo pokrenite u instalacijski program da stavite Luft na drugi disk ili u slobodni prostor.
linux-ready-remove = Ukloni Luft s ovog računara
linux-ready-restart-try = Prvo sačuvajte ono na čemu radite. Luft se otvara za otprilike minutu, a sljedeće ponovno pokretanje vraća vas u { $system }.
linux-ready-restart-replace = Prvo sačuvajte ono na čemu radite. Instalacijski program otvara se s odabranom zamjenom za { $system } i prikazuje šta ostaje prije bilo kakve promjene.
linux-ready-remove-title = Ukloniti Luft s ovog računara?
linux-ready-remove-description = Meet Luft briše fajlove Lufta, njegove fajlove za pokretanje i njegov unos za pokretanje. Sve ostalo ostaje kako jeste.

## Packing things to take along to Luft (the moving box)

box-title = Ponesite svoje stvari
box-description = Odaberite šta ćete ponijeti. Luft će to nakon instalacije raspakovati u vaš novi račun, a iz Windowsa se ništa ne uklanja.
box-looking = Pregledavanje vaših foldera…
box-folder-desktop = Radna površina
box-folder-documents = Dokumenti
box-folder-downloads = Preuzimanja
box-folder-music = Muzika
box-folder-pictures = Slike
box-folder-videos = Videozapisi
box-folder-size = { $size }, { $files ->
    [one] { $files } fajl
    [few] { $files } fajla
   *[other] { $files } fajlova
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
box-wallpaper-description = Slika na vašoj radnoj površini u Windowsu
box-account-title = Vaše ime i slika
box-total-slow = { $size }, pakovanje traje oko { $minutes ->
    [one] { $minutes } minutu
    [few] { $minutes } minute
   *[other] { $minutes } minuta
}
box-pack = Spakuj

## Progress while Meet Luft works

working-shrinking = Pravljenje prostora
    .description = Windows premješta svoje fajlove da oslobodi prostor. To može potrajati nekoliko minuta.
working-partitioning = Priprema prostora za Luft
    .description = Pripremaju se particije s kojih se Luft pokreće.
working-downloading = Prenos Lufta
    .description = Luft se kopira direktno u svoj prostor i usput provjerava.
working-packing = Pakovanje vaših stvari
    .description = Sve što ste odabrali kopira se u kutiju za selidbu. Veliki folderi traju neko vrijeme.
working-removing = Uklanjanje Lufta
    .description = Prostor se vraća Windowsu.
working-removing-linux = Uklanjanje Lufta
    .description = Uklanjaju se njegovi fajlovi i unos za pokretanje.
working-writing = Pravljenje USB fleša
    .description = Luft se zapisuje na cijeli fleš. Ne isključujte ga.
working-copying = Dodavanje Lufta u Ventoy
    .description = Luft se kopira pored ostalih ISO-ova na flešu. Ne isključujte ga.
working-verifying = Provjera USB fleša
    .description = Sve se ponovo čita da se provjeri da se pokreće.
working-stick-downloading = Preuzimanje Lufta
    .description = Usput se provjerava i čuva, pa je sljedeći fleš brže gotov.
working-progress = { $done } od { $total }
working-keep-open = Ne zatvarajte ovaj prozor.

## After Luft was removed

removed-title = Sve je kao prije
removed-description = { $platform ->
    [linux] Fajlovi Lufta i njegov unos za pokretanje su uklonjeni, a računar se pokreće kao i prije. Vratite se kad god želite.
   *[windows] Particije Lufta i njegov unos za pokretanje su uklonjeni, a Windows ponovo ima sav svoj prostor. Vratite se kad god želite.
}

## Making a USB stick

stick-title = Napravi USB fleš
stick-description = Luft se s njega pokreće na bilo kojem računaru, za isprobavanje ili instalaciju.
stick-looking = Traženje USB uređaja…
stick-none = Priključite USB fleš od { $size } ili više. Pojavit će se ovdje.
stick-drives-label = USB uređaji
stick-offer = { $name }, { $size }
stick-make = Napravi fleš
stick-drive-empty = Prazno
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Premalo za Luft
stick-ventoy-title = Ovaj fleš koristi Ventoy
stick-ventoy-description = Dodati Luft na njega ili izbrisati cijeli fleš i pretvoriti ga u fleš za Luft?
stick-erase-it = Izbriši ga
stick-add = Dodaj Luft
stick-replace-title = Zamijeniti Luft na njemu?
stick-replace-description = { $count ->
    [one] Na ovom flešu već je { $names }. Novi Luft može preuzeti njegovo mjesto.
    [few] Na ovom flešu već su { $names }. Novi Luft može preuzeti njihovo mjesto.
   *[other] Na ovom flešu već su { $names }. Novi Luft može preuzeti njihovo mjesto.
}
stick-keep = { $count ->
    [one] Zadrži oba
    [few] Zadrži sve
   *[other] Zadrži sve
}
stick-replace = Zamijeni
stick-full-title = Za Luft nema mjesta
stick-full-description = Luftu treba { $needed }, a na ovom flešu slobodno je { $free }. Oslobodite prostor na njemu ili ga izbrišite i pretvorite u fleš za Luft.
stick-erase-title = Izbrisati { $name }?
stick-erase-description = Sve na ovom flešu od { $size } briše se i zamjenjuje Luftom. To se ne može poništiti.
stick-erase-confirm = Izbriši i napravi fleš
stick-done-title = Vaš USB fleš s Luftom je spreman
stick-done-ventoy-title = Luft je na vašem Ventoy flešu
stick-done-take-out = Sada ga možete izvaditi.
stick-done-eject = Izbacite ga prije nego što ga izvadite.
stick-done-start = Da pokrenete računar s njega, priključite ga i odaberite ga u meniju za pokretanje računara, koji se otvara tipkom poput F12, F8 ili Esc odmah nakon uključivanja.
stick-done-ventoy-key = Kad je Secure Boot uključen, Ventoy pri prvom pokretanju jednom traži da se upiše njegov ključ.
stick-done = Gotovo
stick-done-another = Napravi još jedan
