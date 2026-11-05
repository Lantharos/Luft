## Messages that some steps share

meet-back = Nazaj
meet-cancel = Prekliči
meet-continue = Nadaljuj
meet-try-again = Poskusi znova
meet-restart = Znova zaženi
meet-remove = Odstrani
meet-keep-it = Obdrži ga
meet-close = Zapri
meet-restart-title = Želite zdaj znova zagnati računalnik?
meet-not-yet = Še ne
meet-iso-use = Uporabi ISO, ki ga že imam
meet-iso-using = Uporablja se vaš ISO za Luft
meet-nightly = Nočne različice
meet-channel-nightly = Odslej se uporabljajo nočne različice
meet-channel-latest = Znova se uporabljajo izdaje
meet-undo = Razveljavi
meet-logs-saved = Dnevniki preizkusa Lufta so shranjeni na namizju
meet-logs-show = Pokaži
meet-logs-none = Dnevnikov preizkusa Lufta še ni
meet-logs-failed = Dnevnikov preizkusa Lufta ni bilo mogoče shraniti

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Pregleda tega računalnika ni bilo mogoče dokončati.
   *[windows] Pregleda tega računalnika ni bilo mogoče dokončati.
}
problem-room = Priprava prostora za Luft se ni končala.
problem-room-linux = Priprava Lufta se ni končala.
problem-update = Posodabljanje Lufta se ni končalo.
problem-download = Prenos Lufta se je ustavil. Preverite, ali ste povezani z internetom.
problem-pack = Pakiranje vaših stvari se ni končalo.
problem-remove = Odstranjevanje Lufta se ni končalo.
problem-restart = Vnovičnega zagona ni bilo mogoče pripraviti.
problem-tidy = Starih zagonskih vnosov ni bilo mogoče odstraniti.
problem-firmware = Nastavitev vdelane programske opreme ni bilo mogoče odpreti.
problem-folders = Vaših map ni bilo mogoče pregledati.
problem-sticks = Pogonov USB ni bilo mogoče poiskati.
problem-stick = Izdelava ključka se ni končala.
problem-offer = Lufta trenutno ni mogoče prenesti. Preverite, ali ste povezani z internetom, ali pa uporabite ISO, ki ga že imate.
problem-luft = Luftovega diska ni bilo mogoče pregledati.
problem-resize = Spreminjanje velikosti Lufta se ni končalo.
problem-cancel = Spremembe ni bilo mogoče preklicati.
problem-give = Windows prostora ni mogel prevzeti nazaj.
problem-declined = { $platform ->
    [linux] Meet Luft za delo z diskom potrebuje vaše dovoljenje. Ko se prikaže vprašanje, vnesite geslo.
   *[windows] Meet Luft za delo z diskom potrebuje vaše dovoljenje. Ko Windows vpraša, izberite Da.
}

## First screen

hello-intro = { $platform ->
    [linux] Preizkusite Luft kar od tu, brez ključka USB. Če vam bo všeč, lahko Luft zamenja ta sistem in ohrani vaše datoteke.
   *[windows] Luft lahko živi kar ob sistemu Windows. Najprej ga preizkusite, ne da bi kar koli namestili, ko boste pripravljeni, pa vzemite s seboj svoje stvari.
}
hello-check = { $platform ->
    [linux] Preveri ta računalnik
   *[windows] Preveri ta računalnik
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Pregledovanje tega računalnika
   *[windows] Pregledovanje tega računalnika
}
check-ready-title = { $platform ->
    [linux] Ta računalnik je pripravljen za Luft
   *[windows] Ta računalnik je pripravljen za Luft
}
check-blocked-title = Še malo
check-moment = To traja trenutek.
check-slow = Windows ugotavlja, koliko prostora lahko odstopi. Na velikem disku lahko to traja nekaj minut.
check-blocked-description = Preden se Luft lahko vseli, je treba nekaj spremeniti. Tako to storite.
check-found-description = To je ugotovila aplikacija Meet Luft.
check-checking = Preverjanje diska, vdelane programske opreme in strojne opreme …
check-again = Preveri znova
check-action-firmware = Odpri nastavitve vdelane programske opreme
check-action-tidy = Pospravi
check-firmware-title = Želite znova zagnati v nastavitve vdelane programske opreme?
check-firmware-description = Najprej shranite, kar delate. Tam vklopite Secure Boot in shranite, računalnik pa se nato zažene kot običajno.
check-tidy-title = Želite odstraniti stare zagonske vnose?
check-tidy-description = Kažejo samo na sisteme, ki jih ni več. Windows in vse drugo se zaganja tako kot prej.
check-get-ready-title = Želite pripraviti Luft?
check-get-ready-file = Meet Luft kopira Luft iz vaše datoteke ISO v mapo v tem računalniku in zanj doda zagonski vnos. Particije ostanejo nespremenjene.
check-get-ready-download = Meet Luft prenese Luft, približno { $size }, v mapo v tem računalniku in zanj doda zagonski vnos. Particije ostanejo nespremenjene.
check-get-ready-confirm = Pripravi

## Choosing how much of the Windows drive Luft gets

room-title = Koliko prostora za Luft?
room-description = Windows se zmanjša, da se naredi prostor za Luft. Vaše datoteke v sistemu Windows ostanejo, kjer so.
room-live = Windows obdrži prostor za rast. Luft si za začetek rezervira še { $size } in ta prostor vrne, ko je nameščen.
room-make = Naredi prostor
room-confirm-title = Želite Luftu nameniti { $size }?
room-confirm-file = Windows zmanjša svoj disk, nato Meet Luft kopira Luft iz vaše datoteke ISO. Računalnik naj ostane priključen na napajanje.
room-confirm-download = Windows zmanjša svoj disk, nato Meet Luft prenese Luft, približno { $size }. Računalnik naj ostane priključen na napajanje in povezan z internetom.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kje naj bo Luft?
room-places-description = Luft si lahko deli disk s sistemom Windows ali pa zasede prostor, ki ga Windows ne uporablja.
room-places-label = Mesta za Luft
room-place-windows = Ob sistemu Windows
room-place-windows-detail = Windows se zmanjša, da se naredi prostor za Luft
room-place-windows-free = Tam je že prosto: { $size }
room-place-free = Prosti prostor na disku { $drive }
room-place-free-here = Prosti prostor na disku sistema Windows
room-place-free-detail = Prostor ({ $size }), ki ga nič drugega ne uporablja
room-place-whole = Celoten disk { $drive }
room-place-whole-detail = Ta disk ({ $size }) se izbriše za Luft
room-live-free = Prostega je že { $free }, zato Windows odstopi manj in obdrži prostor za rast. Luft si za začetek rezervira še { $size } in ta prostor vrne, ko je nameščen.
room-live-elsewhere = Luft tam dobi { $room } in si za začetek rezervira še { $size }, ta prostor pa vrne, ko je nameščen.
room-confirm-free-title = Želite Luftu nameniti { $size } prostega prostora?
room-confirm-free-file = Meet Luft vanj kopira Luft iz vaše datoteke ISO. Na disku se nič drugega ne spremeni.
room-confirm-free-download = Meet Luft vanj prenese Luft, približno { $size }. Na disku se nič drugega ne spremeni. Računalnik naj ostane povezan z internetom.
room-erase-title = Želite izbrisati disk { $drive }?
room-erase-description = Vse na tem disku ({ $size }) se izbriše takoj, še preden se Luft zažene. Tega ni mogoče razveljaviti. Trenutno je na njem:
room-erase-empty = Windows na tem disku ({ $size }) ne more ničesar prebrati, vendar se vse, kar je na njem, takoj izbriše. Tega ni mogoče razveljaviti.
room-erase-unnamed = Neimenovana particija
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrirano z BitLockerjem
room-erase-understood = Vem, da je del tega šifriran z BitLockerjem in ga ni mogoče obnoviti
room-erase-confirm = Izbriši in naredi prostor

## Luft is ready on Windows

ready-title = Luft je pripravljen
ready-description = Izberite, kako ga želite spoznati. Windows se nato zažene kot običajno, razen če namestite Luft in ga izberete.
ready-update-title = Pridobi najnovejši Luft
ready-update-description = Na voljo je novejša različica. Nadomesti to in ohrani prostor ter vse, kar ste zapakirali.
ready-try-title = Preizkusi Luft
ready-try-description = Znova zaženite v Luft, ne da bi kar koli namestili. Naslednjič se Windows zažene kot običajno.
ready-box-description = Zapakirajte dokumente, fotografije, omrežja Wi-Fi in drugo, Luft pa jih bo razpakiral, ko bo nameščen.
ready-box-packed = Zapakirano: { $size }
ready-install-title = Namesti Luft
ready-install-description = Znova zaženite v namestitveni program. Prostor ob sistemu Windows ({ $size }) ga že čaka.
ready-install-drive-description = Znova zaženite v namestitveni program. Prostor na disku { $drive } ({ $size }) ga že čaka.
ready-stick-description = Prenesite Luft na ključek in ga zaženite v katerem koli računalniku.
ready-remove = Odstrani Luft iz tega računalnika
ready-restart-try = Najprej shranite, kar delate. Luft se odpre v približno minuti, naslednji vnovični zagon pa vas vrne v Windows.
ready-restart-install = Najprej shranite, kar delate. Namestitveni program se odpre v približno minuti in nič se ne spremeni, dokler tam ne potrdite.
ready-fast-startup-title = Izklopi hitri zagon v sistemu Windows
ready-fast-startup-description = Windows se tako povsem zaustavi, zato se zvok, Wi-Fi in Bluetooth v Luftu zaženejo na novo.
ready-clock-title = Ohrani pravilno uro v obeh sistemih
ready-clock-description = Windows bo uro računalnika bral enako kot Luft, zato čas ob preklopu ne bo več skakal.
ready-remove-title = Želite odstraniti Luft iz tega računalnika?
ready-remove-description = Izbriše se vse, kar je dodala aplikacija Meet Luft, tudi selitvena škatla, Windows pa dobi nazaj ves svoj prostor.

## Luft is ready on Linux

linux-ready-description = Izberite, kako ga želite spoznati. Dokler se ne odločite drugače, se kot običajno še naprej zaganja { $system }.
linux-ready-this-system = ta sistem
linux-ready-update-description = Na voljo je novejša različica. Nadomesti tisto, ki jo hrani Meet Luft, in ohrani dnevnike preizkušanja.
linux-ready-try-description = Znova zaženite v Luft, ne da bi kar koli spremenili. Naslednjič se kot običajno zažene { $system }.
linux-ready-replace-title = Zamenjaj { $system }
linux-ready-replace-description = Luft ga nadomesti in ohrani vaše datoteke, račun, omrežja Wi-Fi in druge diske. Stari sistem ostane, dokler ga ne odstranite.
linux-ready-install-description = Znova zaženite v namestitveni program, da Luft namestite na drug disk ali v prosti prostor.
linux-ready-remove = Odstrani Luft iz tega računalnika
linux-ready-restart-try = Najprej shranite, kar delate. Luft se odpre v približno minuti, naslednji vnovični zagon pa vas vrne v { $system }.
linux-ready-restart-replace = Najprej shranite, kar delate. Namestitveni program se odpre z že izbrano zamenjavo za { $system } in pokaže, kaj ostane, preden se kar koli spremeni.
linux-ready-remove-title = Želite odstraniti Luft iz tega računalnika?
linux-ready-remove-description = Izbrišejo se Luftove datoteke, njegove zagonske datoteke in zagonski vnos. Vse drugo ostane, kot je.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Vaš Luft
luft-looking = Aplikacija Meet Luft je v tem računalniku našla Luft.
luft-checking = Pregledovanje Luftovega diska …
luft-description-beside = Luft je v tem računalniku nameščen ob sistemu Windows.
luft-description-drive = Luft je nameščen na disku { $drive }.
luft-bar-used = { $size }, zasedeno: { $used }
luft-resize-title = Spremeni, koliko prostora ima Luft
luft-resize-description = Luftu namenite več prostora sistema Windows ali pa ga nekaj vrnite sistemu Windows.
luft-resize-drive-description = Luftu namenite več prostega prostora na disku { $drive } ali pa ga nekaj pustite prostega.
luft-resize-passphrase = Luftov disk se odpre le s šifrirnim geslom, ki ga Luft med premikanjem ne more vnesti sam.
luft-resize-start-first = Enkrat zaženite Luft, da lahko aplikaciji Meet Luft sporoči, kako poln je, nato se vrnite sem.
luft-resize-apart = Med sistemom Windows in Luftom je druga particija, zato si prostora ne moreta deliti.
luft-pending-grow = Luft se poveča ob naslednjem zagonu
luft-pending-grow-description = Znova zaženite v Luft in ga pustite vklopljenega nekaj minut, da se preseli v novi prostor. Medtem ga lahko uporabljate.
luft-pending-shrink = Luft naredi prostor ob naslednjem zagonu
luft-pending-shrink-description = Znova zaženite v Luft in ga pustite vklopljenega nekaj minut, da premakne svoje datoteke. Nato v sistemu Windows znova odprite Meet Luft, da Windows dobi ta prostor.
luft-pending-trim = Luft se zmanjša ob naslednjem zagonu
luft-pending-trim-description = Znova zaženite v Luft in v približno minuti se bo zmanjšal.
luft-windows-free-title = Prepusti prosti prostor sistemu Windows
luft-windows-free-description = Prostora ({ $size }) takoj za sistemom Windows nič ne uporablja. Windows ga lahko vzame nazaj.
luft-leftovers-title = Pospravi ostanke preizkusa Lufta
luft-leftovers-description = Particije, ki jih je aplikacija Meet Luft ustvarila za zagon Lufta, so še vedno tukaj. Luft jih ne potrebuje več.
luft-start = Znova zaženi v Luft
luft-cancel = Prekliči spremembo
luft-restart = Najprej shranite, kar delate. Luft se zažene v približno minuti, naslednji vnovični zagon pa vas vrne v Windows.
luft-restart-pending = Najprej shranite, kar delate. Luft se zažene v približno minuti in sam premakne svoje datoteke, kar traja nekaj minut. Medtem ga lahko uporabljate.
luft-remove = Odstrani Luft iz tega računalnika
luft-remove-title = Želite odstraniti Luft iz tega računalnika?
luft-remove-description = Luft in vse v njem se izbriše, skupaj { $size }, Windows pa dobi prostor nazaj. Računalnik bo kot prej zaganjal Windows. Tega ni mogoče razveljaviti.
luft-remove-drive-description = Luft in vse v njem se izbriše z diska { $drive }, skupaj { $size }. Računalnik bo kot prej zaganjal Windows. Tega ni mogoče razveljaviti.
luft-remove-confirm = Odstrani Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Koliko prostora za Luft?
resize-description = Povlecite, da razdelite disk med sistem Windows in Luft. Luft spremembo izvede sam ob naslednjem zagonu.
resize-measuring = Windows ugotavlja, koliko prostora lahko odstopi. Na velikem disku lahko to traja nekaj minut.
resize-full = Luft je preveč zaseden, da bi ga bilo mogoče premakniti, Windows pa zanj ne more odstopiti dovolj prostora. Najprej sprostite nekaj prostora v Luftu ali v sistemu Windows.
resize-drive-description = Povlecite, da izberete, koliko diska { $drive } zasede Luft. Luft spremembo izvede sam ob naslednjem zagonu.
resize-drive-free = Prosto na disku { $drive }: { $size }
resize-used = Luftove datoteke zasedajo { $size }.
resize-least = Velikost spremenite za vsaj { $size }.
resize-apply = Spremeni
resize-grow-title = Želite Luftu nameniti še { $size }?
resize-grow-description = Windows se takoj zmanjša. Luft se ob naslednjem zagonu preseli v novi prostor, kar traja nekaj minut. Računalnik naj ostane priključen na napajanje.
resize-grow-drive-description = Luft ob naslednjem zagonu zasede prosti prostor na disku { $drive }, kar traja le trenutek.
resize-trim-title = Želite Luft zmanjšati za { $size }?
resize-trim-description = Luft se ob naslednjem zagonu zmanjša, prostor na disku { $drive } pa ostane prost.
resize-shrink-title = Želite sistemu Windows vrniti { $size }?
resize-shrink-description = Luft ob naslednjem zagonu premakne svoje datoteke, kar traja nekaj minut. Nato znova odprite Meet Luft in Windows bo prostor vzel nazaj. Računalnik naj ostane priključen na napajanje.

## Packing things to take along to Luft (the moving box)

box-title = Vzemite svoje stvari s seboj
box-description = Izberite, kaj želite vzeti s seboj. Luft to razpakira v vaš novi račun, ko je nameščen, iz sistema Windows pa se nič ne odstrani.
box-looking = Pregledovanje map …
box-folder-desktop = Namizje
box-folder-documents = Dokumenti
box-folder-downloads = Prenosi
box-folder-music = Glasba
box-folder-pictures = Slike
box-folder-videos = Videoposnetki
box-folder-size = { $size }, { $files ->
    [one] { $files } datoteka
    [two] { $files } datoteki
    [few] { $files } datoteke
   *[other] { $files } datotek
}
box-wifi-title = Omrežja Wi-Fi
box-wifi-description = Z gesli, da je Luft takoj povezan
box-bluetooth-title = Naprave Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } naprava, pripravljena brez vnovičnega seznanjanja
    [two] { $devices } napravi, pripravljeni brez vnovičnega seznanjanja
    [few] { $devices } naprave, pripravljene brez vnovičnega seznanjanja
   *[other] { $devices } naprav, pripravljenih brez vnovičnega seznanjanja
}
box-wallpaper-title = Ozadje
box-wallpaper-description = Slika na vašem namizju v sistemu Windows
box-account-title = Vaše ime in slika
box-total-slow = { $size }, pakiranje traja približno { $minutes ->
    [one] { $minutes } minuto
    [two] { $minutes } minuti
    [few] { $minutes } minute
   *[other] { $minutes } minut
}
box-pack = Zapakiraj

## Progress while Meet Luft works

working-shrinking = Ustvarjanje prostora
    .description = Windows premika svoje datoteke, da naredi prostor. To lahko traja nekaj minut.
working-erasing = Brisanje diska
    .description = Windows ga počisti, da lahko Luft dobi celoten disk.
working-partitioning = Nastavljanje prostora za Luft
    .description = Pripravljanje particij, s katerih se zažene Luft.
working-downloading = Prenašanje Lufta
    .description = Luft se kopira naravnost v svoj prostor in se med potjo preverja.
working-packing = Pakiranje vaših stvari
    .description = Kopiranje vsega izbranega v selitveno škatlo. Velike mape trajajo dlje.
working-removing = Odstranjevanje Lufta
    .description = Vračanje prostora sistemu Windows.
working-removing-linux = Odstranjevanje Lufta
    .description = Odstranjevanje njegovih datotek in zagonskega vnosa.
working-writing = Izdelava ključka
    .description = Luft se zapisuje na celoten ključek. Ne odstranjujte ga.
working-copying = Dodajanje Lufta v Ventoy
    .description = Luft se kopira poleg drugih datotek ISO na ključku. Ne odstranjujte ga.
working-verifying = Preverjanje ključka
    .description = Branje vsega zapisanega, da se zagotovo zažene.
working-stick-downloading = Prenašanje Lufta
    .description = Med potjo se preverja in se shrani, zato bo naslednji ključek narejen hitreje.
working-progress = { $done } od { $total }
working-keep-open = To okno naj ostane odprto.

## After Luft was removed

removed-title = Vse je spet tako, kot je bilo
removed-description = { $platform ->
    [linux] Luftove datoteke in njegov zagonski vnos so odstranjeni, računalnik pa se zaganja tako kot prej. Vrnite se kadar koli.
   *[windows] Luftove particije in njegov zagonski vnos so odstranjeni, Windows pa ima spet ves svoj prostor. Vrnite se kadar koli.
}

## Making a USB stick

stick-title = Izdelava ključka USB
stick-description = Z njega se Luft zažene v katerem koli računalniku, da ga preizkusite ali namestite.
stick-looking = Iskanje pogonov USB …
stick-none = Priključite ključek USB z vsaj { $size }. Prikazal se bo tukaj.
stick-drives-label = Pogoni USB
stick-offer = { $name }, { $size }
stick-make = Naredi ključek
stick-drive-empty = Prazen
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Premajhen za Luft
stick-ventoy-title = Ta ključek uporablja Ventoy
stick-ventoy-description = Želite nanj dodati Luft ali izbrisati celoten ključek in iz njega narediti ključek z Luftom?
stick-erase-it = Izbriši ga
stick-add = Dodaj Luft
stick-replace-title = Želite zamenjati Luft na njem?
stick-replace-description = { $count ->
    [one] { $names } je že na tem ključku. Novi Luft ga lahko nadomesti.
    [two] { $names } sta že na tem ključku. Novi Luft ju lahko nadomesti.
    [few] { $names } so že na tem ključku. Novi Luft jih lahko nadomesti.
   *[other] { $names } so že na tem ključku. Novi Luft jih lahko nadomesti.
}
stick-keep = { $count ->
    [one] Obdrži oba
   *[other] Obdrži vse
}
stick-replace = Zamenjaj
stick-full-title = Za Luft ni dovolj prostora
stick-full-description = Luft potrebuje { $needed }, prosti prostor na tem ključku pa je { $free }. Na njem naredite prostor ali ga izbrišite in iz njega naredite ključek z Luftom.
stick-erase-title = Želite izbrisati { $name }?
stick-erase-description = Vse na tem ključku ({ $size }) se izbriše in nadomesti z Luftom. Tega ni mogoče razveljaviti.
stick-erase-confirm = Izbriši in naredi ključek
stick-done-title = Ključek z Luftom je pripravljen
stick-done-ventoy-title = Luft je na vašem ključku Ventoy
stick-done-take-out = Zdaj ga lahko odstranite.
stick-done-eject = Pred odstranitvijo ga izvrzite.
stick-done-start = Če želite zagnati z njega, ga priključite in izberite v zagonskem meniju računalnika, ki se takoj po vklopu odpre s tipko, kot je F12, F8 ali Esc.
stick-done-ventoy-key = Če je Secure Boot vklopljen, Ventoy ob prvem zagonu enkrat vpraša, ali naj vpiše svoj ključ.
stick-done = Končano
stick-done-another = Naredi še enega
