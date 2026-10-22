## Messages that some steps share

meet-back = Atpakaļ
meet-cancel = Atcelt
meet-continue = Turpināt
meet-try-again = Mēģināt vēlreiz
meet-restart = Restartēt
meet-remove = Noņemt
meet-keep-it = Paturēt
meet-close = Aizvērt
meet-restart-title = Vai restartēt tūlīt?
meet-not-yet = Vēl ne
meet-iso-use = Izmantot esošu ISO
meet-iso-using = Tiek izmantots jūsu Luft ISO
meet-nightly = Nakts būvējumi
meet-channel-nightly = Meet Luft izmantos nakts būvējumus
meet-channel-latest = Meet Luft atkal izmantos laidienus
meet-undo = Atsaukt
meet-logs-saved = Luft izmēģinājuma žurnāli saglabāti darbvirsmā
meet-logs-show = Rādīt
meet-logs-none = No Luft izmēģinājuma vēl nav žurnālu
meet-logs-failed = Meet Luft nevarēja saglabāt Luft izmēģinājuma žurnālus

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft nevarēja pabeigt šī datora pārbaudi.
   *[windows] Meet Luft nevarēja pabeigt šī datora pārbaudi.
}
problem-room = Vietas atbrīvošana sistēmai Luft netika pabeigta.
problem-room-linux = Luft sagatavošana netika pabeigta.
problem-update = Luft atjaunināšana netika pabeigta.
problem-download = Luft lejupielāde apstājās. Pārbaudiet interneta savienojumu.
problem-pack = Jūsu lietu sapakošana netika pabeigta.
problem-remove = Luft noņemšana netika pabeigta.
problem-restart = Meet Luft nevarēja sagatavot restartēšanu.
problem-tidy = Vecos startēšanas ierakstus nevarēja noņemt.
problem-firmware = Meet Luft nevarēja atvērt aparātprogrammatūras iestatījumus.
problem-folders = Meet Luft nevarēja pārskatīt jūsu mapes.
problem-sticks = Meet Luft nevarēja meklēt USB diskus.
problem-stick = Zibatmiņas izveide netika pabeigta.
problem-offer = Luft pašlaik nevar lejupielādēt. Pārbaudiet interneta savienojumu vai izmantojiet esošu ISO.
problem-luft = Meet Luft nevarēja pārbaudīt Luft disku.
problem-resize = Luft lieluma maiņa netika pabeigta.
problem-cancel = Meet Luft nevarēja atcelt izmaiņu.
problem-give = Windows nevarēja paņemt vietu atpakaļ.
problem-declined = { $platform ->
    [linux] Meet Luft vajadzīga jūsu atļauja darbam ar disku. Ievadiet paroli, kad tā tiek prasīta.
   *[windows] Meet Luft vajadzīga jūsu atļauja darbam ar disku. Kad Windows jautā, izvēlieties Jā.
}

## First screen

hello-intro = { $platform ->
    [linux] Izmēģiniet Luft tieši no šejienes, bez USB zibatmiņas. Ja tā jums patīk, Luft var aizstāt šo sistēmu un saglabāt jūsu failus.
   *[windows] Luft var dzīvot blakus Windows. Vispirms izmēģiniet to, neko neinstalējot, un paņemiet līdzi savas lietas, kad būsiet gatavi.
}
hello-check = { $platform ->
    [linux] Pārbaudīt šo datoru
   *[windows] Pārbaudīt šo datoru
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Notiek datora pārbaude
   *[windows] Notiek datora pārbaude
}
check-ready-title = { $platform ->
    [linux] Šis dators ir gatavs sistēmai Luft
   *[windows] Šis dators ir gatavs sistēmai Luft
}
check-blocked-title = Gandrīz gatavs
check-moment = Tas aizņems brīdi.
check-slow = Windows aprēķina, cik daudz vietas tā var atvēlēt. Lielā diskā tas var aizņemt dažas minūtes.
check-blocked-description = Pirms Luft var ievākties, kaut kas jāmaina. Lūk, kas jādara.
check-found-description = Lūk, ko atrada Meet Luft.
check-checking = Notiek diska, aparātprogrammatūras un aparatūras pārbaude…
check-again = Pārbaudīt vēlreiz
check-action-firmware = Atvērt aparātprogrammatūras iestatījumus
check-action-tidy = Sakārtot
check-firmware-title = Vai restartēt aparātprogrammatūras iestatījumos?
check-firmware-description = Vispirms saglabājiet iesākto darbu. Tur ieslēdziet Secure Boot un saglabājiet, un dators atkal startēs kā parasti.
check-tidy-title = Vai noņemt vecos startēšanas ierakstus?
check-tidy-description = Tie norāda tikai uz sistēmām, kuru vairs nav. Windows un viss pārējais startē tieši tāpat kā iepriekš.
check-get-ready-title = Vai sagatavot Luft?
check-get-ready-file = Meet Luft nokopē Luft no jūsu ISO mapē šajā datorā un pievieno tai startēšanas ierakstu. Nodalījumi netiek mainīti.
check-get-ready-download = Meet Luft lejupielādē Luft (aptuveni { $size }) mapē šajā datorā un pievieno tai startēšanas ierakstu. Nodalījumi netiek mainīti.
check-get-ready-confirm = Sagatavot

## Choosing how much of the Windows drive Luft gets

room-title = Cik vietas atvēlēt sistēmai Luft?
room-description = Windows samazina sevi, lai atbrīvotu vietu sistēmai Luft. Jūsu faili sistēmā Windows paliek tieši tur, kur ir.
room-live = Windows paliek vieta augšanai. Luft papildus rezervē { $size } startēšanai, ko pēc instalēšanas atdod atpakaļ.
room-make = Atbrīvot vietu
room-confirm-title = Vai atvēlēt sistēmai Luft { $size }?
room-confirm-file = Windows samazina savu disku, pēc tam Meet Luft nokopē Luft no jūsu ISO. Turiet datoru pievienotu strāvai.
room-confirm-download = Windows samazina savu disku, pēc tam Meet Luft lejupielādē Luft (aptuveni { $size }). Turiet datoru pievienotu strāvai un internetam.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kur novietot Luft?
room-places-description = Luft var dalīt Windows disku vai aizņemt vietu, ko Windows neizmanto.
room-places-label = Vietas sistēmai Luft
room-place-windows = Blakus Windows
room-place-windows-detail = Windows samazina sevi, lai atbrīvotu vietu sistēmai Luft
room-place-windows-free = Tur jau ir brīvi { $size }
room-place-free = Brīvā vieta diskā { $drive }
room-place-free-here = Brīvā vieta Windows diskā
room-place-free-detail = { $size }, ko nekas cits neizmanto
room-place-whole = Viss disks { $drive }
room-place-whole-detail = Izdzēš šo disku ({ $size }) sistēmai Luft
room-live-free = No tās { $free } jau ir brīvi, tāpēc Windows atdod mazāk un patur vietu augšanai. Luft papildus rezervē { $size } startēšanai, ko pēc instalēšanas atdod atpakaļ.
room-live-elsewhere = Luft tur saņem { $room } un papildus rezervē vēl { $size } startēšanai, ko pēc instalēšanas atdod atpakaļ.
room-confirm-free-title = Vai atvēlēt sistēmai Luft { $size } brīvās vietas?
room-confirm-free-file = Meet Luft tajā nokopē Luft no jūsu ISO. Nekas cits diskā nemainās.
room-confirm-free-download = Meet Luft tajā lejupielādē Luft (aptuveni { $size }). Nekas cits diskā nemainās. Turiet datoru pievienotu internetam.
room-erase-title = Vai izdzēst { $drive }?
room-erase-description = Viss šajā diskā ({ $size }) tiek izdzēsts uzreiz, pirms Luft startē. To nevar atsaukt. Tajā pašlaik ir:
room-erase-empty = Windows nevar nolasīt neko šajā diskā ({ $size }), taču viss, kas tajā ir, tiek izdzēsts uzreiz. To nevar atsaukt.
room-erase-unnamed = Nodalījums bez nosaukuma
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrēts ar BitLocker
room-erase-understood = Es saprotu, ka daļa no tā ir šifrēta ar BitLocker un to nevarēs atgūt
room-erase-confirm = Izdzēst un atbrīvot vietu

## Luft is ready on Windows

ready-title = Luft ir gatava
ready-description = Izvēlieties, kā vēlaties ar to iepazīties. Pēc tam Windows startē kā parasti, ja vien neinstalējat Luft un neizvēlaties to.
ready-update-title = Iegūt jaunāko Luft
ready-update-description = Ir pieejams jaunāks būvējums. Tas aizstāj šo un patur atbrīvoto vietu un visu sapakoto.
ready-try-title = Izmēģināt Luft
ready-try-description = Restartēt sistēmā Luft, neko neinstalējot. Nākamreiz Windows startēs kā parasti.
ready-box-description = Sapakojiet dokumentus, fotoattēlus, Wi-Fi tīklus un citas lietas, ko Luft izpakos pēc instalēšanas.
ready-box-packed = Sapakots, { $size }
ready-install-title = Instalēt Luft
ready-install-description = Restartēt instalētājā. Vieta blakus Windows ({ $size }) to jau gaida.
ready-install-drive-description = Restartēt instalētājā. Vieta diskā { $drive } ({ $size }) to jau gaida.
ready-stick-description = Ierakstiet Luft zibatmiņā, lai to startētu jebkurā datorā.
ready-remove = Noņemt Luft no šī datora
ready-restart-try = Vispirms saglabājiet iesākto darbu. Luft atvērsies aptuveni pēc minūtes, un nākamā restartēšana jūs atgriezīs sistēmā Windows.
ready-restart-install = Vispirms saglabājiet iesākto darbu. Instalētājs atvērsies aptuveni pēc minūtes, un nekas nemainīsies, kamēr tur to neapstiprināsiet.
ready-fast-startup-title = Izslēgt ātro startēšanu sistēmā Windows
ready-fast-startup-description = Tad Windows izslēdzas pilnībā, tāpēc skaņa, Wi-Fi un Bluetooth sistēmā Luft startē no tīras lapas.
ready-clock-title = Pareizs pulkstenis abās sistēmās
ready-clock-description = Windows nolasa datora pulksteni tāpat kā Luft, tāpēc laiks vairs nelēkā, kad pārslēdzaties.
ready-remove-title = Vai noņemt Luft no šī datora?
ready-remove-description = Meet Luft izdzēš visu, ko pievienoja, arī pārcelšanās kasti, un atdod sistēmai Windows visu tās vietu.

## Luft is ready on Linux

linux-ready-description = Izvēlieties, kā vēlaties ar to iepazīties. { $system } turpina startēt kā parasti, līdz izlemsiet citādi.
linux-ready-this-system = šī sistēma
linux-ready-update-description = Ir pieejams jaunāks būvējums. Tas aizstāj to, ko glabā Meet Luft, un patur izmēģinājuma žurnālus.
linux-ready-try-description = Restartēt sistēmā Luft, neko nemainot. Nākamreiz { $system } startēs kā parasti.
linux-ready-replace-title = Aizstāt { $system }
linux-ready-replace-description = Luft stājas tās vietā un patur jūsu failus, kontu, Wi-Fi tīklus un citus diskus. Vecā sistēma paliek, līdz to noņemsiet.
linux-ready-install-description = Restartēt instalētājā, lai novietotu Luft citā diskā vai brīvajā vietā.
linux-ready-remove = Noņemt Luft no šī datora
linux-ready-restart-try = Vispirms saglabājiet iesākto darbu. Luft atvērsies aptuveni pēc minūtes, un nākamā restartēšana jūs atgriezīs šeit: { $system }.
linux-ready-restart-replace = Vispirms saglabājiet iesākto darbu. Instalētājs atvērsies ar aizstāšanai izvēlētu sistēmu ({ $system }) un pirms jebkādām izmaiņām parādīs, kas paliek.
linux-ready-remove-title = Vai noņemt Luft no šī datora?
linux-ready-remove-description = Meet Luft izdzēš Luft failus, startēšanas failus un startēšanas ierakstu. Viss pārējais paliek kā bijis.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Jūsu Luft
luft-looking = Meet Luft atrada Luft šajā datorā.
luft-checking = Notiek Luft diska pārbaude…
luft-description-beside = Luft ir instalēta šajā datorā blakus Windows.
luft-description-drive = Luft ir instalēta diskā { $drive }.
luft-bar-used = { $size }, izmantoti { $used }
luft-resize-title = Mainīt Luft vietas apjomu
luft-resize-description = Atvēliet sistēmai Luft vairāk Windows vietas vai atdodiet daļu atpakaļ sistēmai Windows.
luft-resize-drive-description = Atvēliet sistēmai Luft vairāk brīvās vietas diskā { $drive } vai atstājiet daļu no tās brīvu.
luft-resize-passphrase = Luft disks atveras tikai ar paroles frāzi, un Luft nevar to pati ievadīt, kamēr pārvietojas.
luft-resize-start-first = Vienreiz startējiet sistēmu Luft, lai tā varētu paziņot programmai Meet Luft, cik pilna tā ir, un tad atgriezieties.
luft-resize-apart = Starp Windows un Luft atrodas cits nodalījums, tāpēc tās nevar dalīt savu vietu.
luft-pending-grow = Luft palielināsies nākamajā startēšanas reizē
luft-pending-grow-description = Restartējiet sistēmā Luft un atstājiet to ieslēgtu dažas minūtes, kamēr tā pārceļas uz jauno vietu. Tikmēr to var turpināt lietot.
luft-pending-shrink = Luft atbrīvos vietu nākamajā startēšanas reizē
luft-pending-shrink-description = Restartējiet sistēmā Luft un atstājiet to ieslēgtu dažas minūtes, kamēr tā pārvieto savus failus. Pēc tam sistēmā Windows atkal atveriet Meet Luft, lai Windows saņemtu vietu.
luft-pending-trim = Luft samazināsies nākamajā startēšanas reizē
luft-pending-trim-description = Restartējiet sistēmā Luft, un tā samazināsies aptuveni minūtes laikā.
luft-windows-free-title = Atdot brīvo vietu sistēmai Windows
luft-windows-free-description = { $size } tieši aiz Windows netiek izmantoti. Windows var to paņemt atpakaļ.
luft-leftovers-title = Sakārtot pēc Luft izmēģināšanas
luft-leftovers-description = Nodalījumi, ko Meet Luft izveidoja Luft startēšanai, joprojām ir šeit. Luft tie vairs nav vajadzīgi.
luft-start = Restartēt sistēmā Luft
luft-cancel = Atcelt izmaiņu
luft-restart = Vispirms saglabājiet iesākto darbu. Luft startēs aptuveni pēc minūtes, un nākamā restartēšana jūs atgriezīs sistēmā Windows.
luft-restart-pending = Vispirms saglabājiet iesākto darbu. Luft startēs aptuveni pēc minūtes un pati pārvietos savus failus, kas aizņem dažas minūtes. Tikmēr to var lietot.
luft-remove = Noņemt Luft no šī datora
luft-remove-title = Vai noņemt Luft no šī datora?
luft-remove-description = Luft un viss tajā tiek izdzēsts, kopā { $size }, un Windows saņem vietu atpakaļ. Dators startē Windows tāpat kā iepriekš. To nevar atsaukt.
luft-remove-drive-description = Luft un viss tajā tiek izdzēsts no diska { $drive }, kopā { $size }. Dators startē Windows tāpat kā iepriekš. To nevar atsaukt.
luft-remove-confirm = Noņemt Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Cik vietas atvēlēt sistēmai Luft?
resize-description = Velciet, lai sadalītu disku starp Windows un Luft. Luft pati veiks izmaiņu nākamajā startēšanas reizē.
resize-measuring = Windows aprēķina, cik daudz vietas tā var atvēlēt. Lielā diskā tas var aizņemt dažas minūtes.
resize-full = Luft ir pārāk pilna, lai to pārvietotu, un Windows nevar tai atvēlēt pietiekami daudz vietas. Vispirms atbrīvojiet vietu sistēmā Luft vai Windows.
resize-drive-description = Velciet, lai izvēlētos, cik daudz no diska { $drive } aizņems Luft. Luft pati veiks izmaiņu nākamajā startēšanas reizē.
resize-drive-free = { $size } brīvi diskā { $drive }
resize-used = Luft faili aizņem { $size }.
resize-least = Mainiet vismaz par { $size }.
resize-apply = Mainīt
resize-grow-title = Vai atvēlēt sistēmai Luft vēl { $size }?
resize-grow-description = Windows uzreiz samazina sevi. Luft pārcelsies uz jauno vietu nākamajā startēšanas reizē, kas aizņem dažas minūtes. Turiet datoru pievienotu strāvai.
resize-grow-drive-description = Luft paņems brīvo vietu diskā { $drive } nākamajā startēšanas reizē, kas aizņem tikai mirkli.
resize-trim-title = Vai samazināt sistēmu Luft par { $size }?
resize-trim-description = Luft samazināsies nākamajā startēšanas reizē, un vieta diskā { $drive } paliks brīva.
resize-shrink-title = Vai atdot sistēmai Windows { $size }?
resize-shrink-description = Luft pārvietos savus failus nākamajā startēšanas reizē, kas aizņem dažas minūtes. Pēc tam vēlreiz atveriet Meet Luft, un Windows paņems vietu atpakaļ. Turiet datoru pievienotu strāvai.

## Packing things to take along to Luft (the moving box)

box-title = Paņemiet savas lietas
box-description = Izvēlieties, ko ņemt līdzi. Luft pēc instalēšanas to izpakos jūsu jaunajā kontā, un no Windows nekas netiks noņemts.
box-looking = Notiek jūsu mapju pārskatīšana…
box-folder-desktop = Darbvirsma
box-folder-documents = Dokumenti
box-folder-downloads = Lejupielādes
box-folder-music = Mūzika
box-folder-pictures = Attēli
box-folder-videos = Video
box-folder-size = { $size }, { $files ->
    [zero] { $files } failu
    [one] { $files } fails
   *[other] { $files } faili
}
box-wifi-title = Wi-Fi tīkli
box-wifi-description = Ar parolēm, lai Luft uzreiz būtu tiešsaistē
box-bluetooth-title = Bluetooth ierīces
box-bluetooth-description = { $devices ->
    [zero] { $devices } ierīču, gatavas bez atkārtotas savienošanas pārī
    [one] { $devices } ierīce, gatava bez atkārtotas savienošanas pārī
   *[other] { $devices } ierīces, gatavas bez atkārtotas savienošanas pārī
}
box-wallpaper-title = Fona attēls
box-wallpaper-description = Attēls jūsu Windows darbvirsmā
box-account-title = Jūsu vārds un attēls
box-total-slow = { $size }, sapakošana aizņems aptuveni { $minutes ->
    [zero] { $minutes } minūšu
    [one] { $minutes } minūti
   *[other] { $minutes } minūtes
}
box-pack = Sapakot

## Progress while Meet Luft works

working-shrinking = Notiek vietas atbrīvošana
    .description = Windows pārvieto savus failus, lai atbrīvotu vietu. Tas var aizņemt dažas minūtes.
working-erasing = Notiek diska dzēšana
    .description = Windows to iztīra, lai Luft varētu aizņemt visu disku.
working-partitioning = Notiek Luft vietas iestatīšana
    .description = Tiek sagatavoti nodalījumi, no kuriem startē Luft.
working-downloading = Notiek Luft pārnešana
    .description = Luft tiek kopēta tieši savā vietā un pa ceļam pārbaudīta.
working-packing = Notiek jūsu lietu sapakošana
    .description = Viss izvēlētais tiek kopēts pārcelšanās kastē. Lielas mapes prasa laiku.
working-removing = Notiek Luft noņemšana
    .description = Vieta tiek atdota sistēmai Windows.
working-removing-linux = Notiek Luft noņemšana
    .description = Tiek noņemti tās faili un startēšanas ieraksts.
working-writing = Notiek zibatmiņas izveide
    .description = Luft tiek ierakstīta visā zibatmiņā. Neatvienojiet to.
working-copying = Notiek Luft pievienošana Ventoy
    .description = Luft tiek kopēta blakus citiem ISO zibatmiņā. Neatvienojiet to.
working-verifying = Notiek zibatmiņas pārbaude
    .description = Viss tiek nolasīts atpakaļ, lai pārliecinātos, ka tā startē.
working-stick-downloading = Notiek Luft lejupielāde
    .description = Tā tiek pārbaudīta pa ceļam un saglabāta, lai nākamā zibatmiņa tiktu izveidota ātrāk.
working-progress = { $done } no { $total }
working-keep-open = Neaizveriet šo logu.

## After Luft was removed

removed-title = Viss ir kā agrāk
removed-description = { $platform ->
    [linux] Luft faili un startēšanas ieraksts ir noņemti, un dators startē tieši tāpat kā iepriekš. Atgriezieties jebkurā laikā.
   *[windows] Luft nodalījumi un startēšanas ieraksts ir noņemti, un sistēmai Windows atkal ir visa tās vieta. Atgriezieties jebkurā laikā.
}

## Making a USB stick

stick-title = Izveidot USB zibatmiņu
stick-description = No tās Luft startē jebkurā datorā, lai to izmēģinātu vai instalētu.
stick-looking = Notiek USB disku meklēšana…
stick-none = Pievienojiet USB zibatmiņu, kuras ietilpība ir vismaz { $size }. Tā parādīsies šeit.
stick-drives-label = USB diski
stick-offer = { $name }, { $size }
stick-make = Izveidot zibatmiņu
stick-drive-empty = Tukša
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Par mazu sistēmai Luft
stick-ventoy-title = Šajā zibatmiņā ir Ventoy
stick-ventoy-description = Vai pievienot tai Luft vai izdzēst visu zibatmiņu un izveidot no tās Luft zibatmiņu?
stick-erase-it = Izdzēst
stick-add = Pievienot Luft
stick-replace-title = Vai aizstāt tajā esošo Luft?
stick-replace-description = { $count ->
    [zero] Šajā zibatmiņā jau ir { $names }. Jaunā Luft var stāties to vietā.
    [one] Šajā zibatmiņā jau ir { $names }. Jaunā Luft var stāties tās vietā.
   *[other] Šajā zibatmiņā jau ir { $names }. Jaunā Luft var stāties to vietā.
}
stick-keep = { $count ->
    [zero] Paturēt visas
    [one] Paturēt abas
   *[other] Paturēt visas
}
stick-replace = Aizstāt
stick-full-title = Sistēmai Luft nepietiek vietas
stick-full-description = Luft vajag { $needed }, bet šajā zibatmiņā brīvi ir { $free }. Atbrīvojiet tajā vietu vai izdzēsiet to un izveidojiet Luft zibatmiņu.
stick-erase-title = Vai izdzēst { $name }?
stick-erase-description = Viss šajā zibatmiņā ({ $size }) tiks izdzēsts un aizstāts ar Luft. To nevar atsaukt.
stick-erase-confirm = Izdzēst un izveidot zibatmiņu
stick-done-title = Jūsu Luft zibatmiņa ir gatava
stick-done-ventoy-title = Luft ir jūsu Ventoy zibatmiņā
stick-done-take-out = Tagad varat to izņemt.
stick-done-eject = Pirms izņemšanas izstumiet to.
stick-done-start = Lai startētu no tās, pievienojiet to un izvēlieties datora sāknēšanas izvēlnē, kas atveras uzreiz pēc ieslēgšanas ar taustiņu, piemēram, F12, F8 vai Esc.
stick-done-ventoy-key = Ja Secure Boot ir ieslēgts, Ventoy pirmajā startēšanas reizē vienreiz lūgs reģistrēt savu atslēgu.
stick-done = Gatavs
stick-done-another = Izveidot vēl vienu
