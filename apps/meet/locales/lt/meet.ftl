## Messages that some steps share

meet-back = Atgal
meet-cancel = Atšaukti
meet-continue = Tęsti
meet-try-again = Bandyti dar kartą
meet-restart = Paleisti iš naujo
meet-remove = Pašalinti
meet-keep-it = Palikti
meet-close = Uždaryti
meet-restart-title = Paleisti iš naujo dabar?
meet-not-yet = Dar ne
meet-iso-use = Naudoti turimą ISO
meet-iso-using = Naudojamas jūsų Luft ISO
meet-nightly = Naktinės versijos
meet-channel-nightly = Meet Luft naudos naktines versijas
meet-channel-latest = Meet Luft vėl naudos laidas
meet-undo = Anuliuoti
meet-logs-saved = Luft išbandymo žurnalai įrašyti darbalaukyje
meet-logs-show = Rodyti
meet-logs-none = Luft išbandymo žurnalų dar nėra
meet-logs-failed = Meet Luft nepavyko įrašyti Luft išbandymo žurnalų

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft nepavyko baigti tikrinti šio kompiuterio.
   *[windows] Meet Luft nepavyko baigti tikrinti šio kompiuterio.
}
problem-room = Vietos atlaisvinimas sistemai Luft nebaigtas.
problem-room-linux = Luft paruošimas nebaigtas.
problem-update = Luft atnaujinimas nebaigtas.
problem-download = Luft atsisiuntimas sustojo. Patikrinkite interneto ryšį.
problem-pack = Jūsų daiktų supakavimas nebaigtas.
problem-remove = Luft pašalinimas nebaigtas.
problem-restart = Meet Luft nepavyko paruošti paleidimo iš naujo.
problem-tidy = Senų paleidimo įrašų nepavyko pašalinti.
problem-firmware = Meet Luft nepavyko atidaryti programinės aparatinės įrangos nustatymų.
problem-folders = Meet Luft nepavyko peržiūrėti jūsų aplankų.
problem-sticks = Meet Luft nepavyko ieškoti USB įrenginių.
problem-stick = Atmintuko kūrimas nebaigtas.
problem-offer = Luft šiuo metu negalima atsisiųsti. Patikrinkite interneto ryšį arba naudokite turimą ISO.
problem-luft = Meet Luft nepavyko patikrinti Luft disko.
problem-resize = Luft dydžio keitimas nebaigtas.
problem-cancel = Meet Luft nepavyko atšaukti pakeitimo.
problem-give = Windows nepavyko atsiimti vietos.
problem-declined = { $platform ->
    [linux] Meet Luft reikia jūsų leidimo dirbti su disku. Kai paprašys, įveskite slaptažodį.
   *[windows] Meet Luft reikia jūsų leidimo dirbti su disku. Kai Windows paklaus, pasirinkite Taip.
}

## First screen

hello-intro = { $platform ->
    [linux] Išbandykite Luft tiesiai iš čia, be USB atmintuko. Jei patiks, Luft gali užimti šios sistemos vietą ir išsaugoti jūsų failus.
   *[windows] Luft gali gyventi šalia Windows. Pirmiausia išbandykite ją nieko neįdiegę, o kai būsite pasiruošę, pasiimkite savo daiktus.
}
hello-check = { $platform ->
    [linux] Patikrinti šį kompiuterį
   *[windows] Patikrinti šį kompiuterį
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Tikrinamas kompiuteris
   *[windows] Tikrinamas kompiuteris
}
check-ready-title = { $platform ->
    [linux] Šis kompiuteris paruoštas sistemai Luft
   *[windows] Šis kompiuteris paruoštas sistemai Luft
}
check-blocked-title = Beveik baigta
check-moment = Tai užtruks akimirką.
check-slow = Windows skaičiuoja, kiek vietos gali atiduoti. Dideliame diske tai gali užtrukti kelias minutes.
check-blocked-description = Prieš Luft įsikraustant, reikia kai ką pakeisti. Štai ką daryti.
check-found-description = Štai ką rado Meet Luft.
check-checking = Tikrinamas diskas, programinė aparatinė įranga ir aparatinė įranga…
check-again = Tikrinti dar kartą
check-action-firmware = Atidaryti programinės aparatinės įrangos nustatymus
check-action-tidy = Sutvarkyti
check-firmware-title = Paleisti iš naujo į programinės aparatinės įrangos nustatymus?
check-firmware-description = Pirmiausia įrašykite tai, su kuo dirbate. Ten įjunkite Secure Boot ir įrašykite, tada kompiuteris vėl pasileis kaip įprasta.
check-tidy-title = Pašalinti senus paleidimo įrašus?
check-tidy-description = Jie rodo tik į sistemas, kurių jau nebėra. Windows ir visa kita pasileis lygiai taip pat kaip anksčiau.
check-get-ready-title = Paruošti Luft?
check-get-ready-file = Meet Luft nukopijuoja Luft iš jūsų ISO į aplanką šiame kompiuteryje ir prideda jai paleidimo įrašą. Skaidiniai nekeičiami.
check-get-ready-download = Meet Luft atsisiunčia Luft (apie { $size }) į aplanką šiame kompiuteryje ir prideda jai paleidimo įrašą. Skaidiniai nekeičiami.
check-get-ready-confirm = Paruošti

## Choosing how much of the Windows drive Luft gets

room-title = Kiek vietos skirti sistemai Luft?
room-description = Windows susimažina, kad atlaisvintų vietos sistemai Luft. Jūsų failai sistemoje Windows lieka lygiai ten, kur yra.
room-live = Windows lieka vietos augti. Luft dar atideda { $size } paleidimui ir, kai bus įdiegta, tą vietą grąžina.
room-make = Atlaisvinti vietos
room-confirm-title = Skirti sistemai Luft { $size }?
room-confirm-file = Windows sumažina savo diską, tada Meet Luft nukopijuoja Luft iš jūsų ISO. Laikykite kompiuterį prijungtą prie maitinimo.
room-confirm-download = Windows sumažina savo diską, tada Meet Luft atsisiunčia Luft (apie { $size }). Laikykite kompiuterį prijungtą prie maitinimo ir interneto.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kur įdiegti Luft?
room-places-description = Luft gali dalytis Windows disku arba užimti vietą, kurios Windows nenaudoja.
room-places-label = Vietos sistemai Luft
room-place-windows = Šalia Windows
room-place-windows-detail = Windows susimažina, kad atlaisvintų vietos sistemai Luft
room-place-windows-free = Ten jau laisva { $size }
room-place-free = Laisva vieta diske { $drive }
room-place-free-here = Laisva vieta Windows diske
room-place-free-detail = { $size }, kurių niekas kitas nenaudoja
room-place-whole = Visas diskas { $drive }
room-place-whole-detail = Ištrina šį diską ({ $size }) sistemai Luft
room-live-free = Iš jos { $free } jau laisva, todėl Windows atiduoda mažiau ir lieka vietos augti. Luft dar atideda { $size } paleidimui ir, kai bus įdiegta, tą vietą grąžina.
room-live-elsewhere = Luft ten gauna { $room } ir dar atideda { $size } paleidimui, o kai bus įdiegta, tą vietą grąžina.
room-confirm-free-title = Skirti sistemai Luft { $size } laisvos vietos?
room-confirm-free-file = Meet Luft į ją nukopijuoja Luft iš jūsų ISO. Niekas kitas diske nesikeičia.
room-confirm-free-download = Meet Luft į ją atsisiunčia Luft (apie { $size }). Niekas kitas diske nesikeičia. Laikykite kompiuterį prijungtą prie interneto.
room-erase-title = Ištrinti { $drive }?
room-erase-description = Viskas šiame diske ({ $size }) ištrinama iš karto, dar prieš pasileidžiant Luft. Šio veiksmo anuliuoti negalima. Dabar jame yra:
room-erase-empty = Windows negali nieko perskaityti šiame diske ({ $size }), bet viskas, kas jame yra, ištrinama iš karto. Šio veiksmo anuliuoti negalima.
room-erase-unnamed = Skaidinys be pavadinimo
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifruota su BitLocker
room-erase-understood = Suprantu, kad dalis duomenų šifruota su BitLocker ir jų nebus galima atkurti
room-erase-confirm = Ištrinti ir atlaisvinti vietos

## Luft is ready on Windows

ready-title = Luft paruošta
ready-description = Pasirinkite, kaip norite su ja susipažinti. Po to Windows pasileis kaip įprasta, nebent įdiegsite Luft ir ją pasirinksite.
ready-update-title = Gauti naujausią Luft
ready-update-description = Išleista naujesnė versija. Ji pakeis šią ir išsaugos atlaisvintą vietą bei viską, ką supakavote.
ready-try-title = Išbandyti Luft
ready-try-description = Paleisti iš naujo į Luft nieko neįdiegiant. Kitą kartą Windows pasileis kaip įprasta.
ready-box-description = Supakuokite dokumentus, nuotraukas, Wi-Fi tinklus ir kita, o Luft juos išpakuos, kai bus įdiegta.
ready-box-packed = Supakuota, { $size }
ready-install-title = Įdiegti Luft
ready-install-description = Paleisti iš naujo į diegimo programą. Vieta šalia Windows ({ $size }) jau jos laukia.
ready-install-drive-description = Paleisti iš naujo į diegimo programą. Vieta diske { $drive } ({ $size }) jau jos laukia.
ready-stick-description = Įrašykite Luft į atmintuką ir paleiskite ją bet kuriame kompiuteryje.
ready-remove = Pašalinti Luft iš šio kompiuterio
ready-restart-try = Pirmiausia įrašykite tai, su kuo dirbate. Luft atsidarys maždaug po minutės, o kitas paleidimas iš naujo grąžins jus į Windows.
ready-restart-install = Pirmiausia įrašykite tai, su kuo dirbate. Diegimo programa atsidarys maždaug po minutės, ir niekas nepasikeis, kol ten nepatvirtinsite.
ready-fast-startup-title = Išjungti spartųjį paleidimą sistemoje Windows
ready-fast-startup-description = Tada Windows išsijungia visiškai, todėl garsas, Wi-Fi ir Bluetooth sistemoje Luft pasileidžia iš švaraus lapo.
ready-clock-title = Teisingas laikrodis abiejose
ready-clock-description = Windows skaito kompiuterio laikrodį taip pat kaip Luft, todėl perjungiant laikas nebešokinėja.
ready-remove-title = Pašalinti Luft iš šio kompiuterio?
ready-remove-description = Meet Luft ištrina viską, ką pridėjo, taip pat ir persikraustymo dėžę, ir grąžina sistemai Windows visą jos vietą.

## Luft is ready on Linux

linux-ready-description = Pasirinkite, kaip norite su ja susipažinti. { $system } toliau pasileis kaip įprasta, kol nuspręsite kitaip.
linux-ready-this-system = ši sistema
linux-ready-update-description = Išleista naujesnė versija. Ji pakeis Meet Luft laikomą versiją ir išsaugos išbandymo žurnalus.
linux-ready-try-description = Paleisti iš naujo į Luft nieko nekeičiant. Kitą kartą { $system } pasileis kaip įprasta.
linux-ready-replace-title = Pakeisti { $system }
linux-ready-replace-description = Luft užims jos vietą ir išsaugos jūsų failus, paskyrą, Wi-Fi tinklus ir kitus diskus. Senoji sistema liks, kol ją pašalinsite.
linux-ready-install-description = Paleisti iš naujo į diegimo programą ir įdiegti Luft kitame diske arba laisvoje vietoje.
linux-ready-remove = Pašalinti Luft iš šio kompiuterio
linux-ready-restart-try = Pirmiausia įrašykite tai, su kuo dirbate. Luft atsidarys maždaug po minutės, o kitas paleidimas iš naujo grąžins jus čia: { $system }.
linux-ready-restart-replace = Pirmiausia įrašykite tai, su kuo dirbate. Diegimo programa atsidarys jau pasirinkusi pakeisti sistemą ({ $system }) ir prieš bet kokius pakeitimus parodys, kas liks.
linux-ready-remove-title = Pašalinti Luft iš šio kompiuterio?
linux-ready-remove-description = Meet Luft ištrina Luft failus, paleidimo failus ir paleidimo įrašą. Visa kita lieka kaip buvo.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Jūsų Luft
luft-looking = Meet Luft rado Luft šiame kompiuteryje.
luft-checking = Tikrinamas Luft diskas…
luft-description-beside = Luft įdiegta šiame kompiuteryje šalia Windows.
luft-description-drive = Luft įdiegta diske { $drive }.
luft-bar-used = { $size }, naudojama { $used }
luft-resize-title = Keisti Luft skirtą vietą
luft-resize-description = Skirkite sistemai Luft daugiau Windows vietos arba dalį grąžinkite sistemai Windows.
luft-resize-drive-description = Skirkite sistemai Luft daugiau laisvos vietos diske { $drive } arba dalį jos palikite laisvą.
luft-resize-reencrypting = Luft vis dar šifruoja arba iššifruoja savo diską. Kai baigs, jos dydį bus galima keisti.
luft-resize-passphrase = Luft diską galima atrakinti tik slaptafraze, o Luft pati jos įvesti negali, kol persikelia.
luft-resize-start-first = Vieną kartą paleiskite Luft, kad ji galėtų pranešti programai Meet Luft, kiek yra užpildyta, tada grįžkite.
luft-resize-apart = Tarp Windows ir Luft yra kitas skaidinys, todėl jos negali dalytis vieta.
luft-pending-grow = Luft padidės kitą kartą pasileidusi
luft-pending-grow-description = Paleiskite iš naujo į Luft ir palikite ją įjungtą kelias minutes, kol ji persikels į naują vietą. Tuo metu ja galite naudotis.
luft-pending-shrink = Luft atlaisvins vietos kitą kartą pasileidusi
luft-pending-shrink-description = Paleiskite iš naujo į Luft ir palikite ją įjungtą kelias minutes, kol ji perkels savo failus. Tada sistemoje Windows vėl atidarykite Meet Luft, kad Windows gautų vietą.
luft-pending-trim = Luft sumažės kitą kartą pasileidusi
luft-pending-trim-description = Paleiskite iš naujo į Luft, ir ji sumažės maždaug per minutę.
luft-windows-free-title = Atiduoti laisvą vietą sistemai Windows
luft-windows-free-description = { $size } iškart po Windows niekas nenaudoja. Windows gali šią vietą atsiimti.
luft-leftovers-title = Sutvarkyti po Luft bandymo
luft-leftovers-description = Skaidiniai, kuriuos Meet Luft sukūrė Luft paleisti, vis dar yra. Luft jų nebereikia.
luft-start = Paleisti iš naujo į Luft
luft-cancel = Atšaukti pakeitimą
luft-restart = Pirmiausia įrašykite tai, su kuo dirbate. Luft pasileis maždaug po minutės, o kitas paleidimas iš naujo grąžins jus į Windows.
luft-restart-pending = Pirmiausia įrašykite tai, su kuo dirbate. Luft pasileis maždaug po minutės ir pati perkels savo failus, o tai užtrunka kelias minutes. Tuo metu ja galite naudotis.
luft-remove = Pašalinti Luft iš šio kompiuterio
luft-remove-title = Pašalinti Luft iš šio kompiuterio?
luft-remove-description = Luft ir viskas, kas joje yra, ištrinama, iš viso { $size }, o Windows atgauna vietą. Kompiuteris paleis Windows kaip anksčiau. Šio veiksmo anuliuoti negalima.
luft-remove-drive-description = Luft ir viskas, kas joje yra, ištrinama iš disko { $drive }, iš viso { $size }. Kompiuteris paleis Windows kaip anksčiau. Šio veiksmo anuliuoti negalima.
luft-remove-confirm = Pašalinti Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kiek vietos skirti sistemai Luft?
resize-description = Vilkite, kad padalytumėte diską tarp Windows ir Luft. Luft pati atliks pakeitimą kitą kartą pasileidusi.
resize-measuring = Windows skaičiuoja, kiek vietos gali atiduoti. Dideliame diske tai gali užtrukti kelias minutes.
resize-full = Luft per daug užpildyta, kad ją būtų galima perkelti, o Windows negali jai skirti pakankamai vietos. Pirmiausia atlaisvinkite vietos sistemoje Luft arba Windows.
resize-drive-description = Vilkite, kad pasirinktumėte, kiek disko { $drive } užims Luft. Luft pati atliks pakeitimą kitą kartą pasileidusi.
resize-drive-free = { $size } laisva diske { $drive }
resize-used = Luft failai užima { $size }.
resize-least = Pakeiskite bent { $size }.
resize-apply = Pakeisti
resize-grow-title = Skirti sistemai Luft dar { $size }?
resize-grow-description = Windows iš karto susimažina. Luft persikels į naują vietą kitą kartą pasileidusi, o tai užtrunka kelias minutes. Laikykite kompiuterį prijungtą prie maitinimo.
resize-grow-drive-description = Luft užims laisvą vietą diske { $drive } kitą kartą pasileidusi, o tai užtrunka tik akimirką.
resize-trim-title = Sumažinti sistemą Luft { $size }?
resize-trim-description = Luft sumažės kitą kartą pasileidusi, o vieta diske { $drive } liks laisva.
resize-shrink-title = Grąžinti sistemai Windows { $size }?
resize-shrink-description = Luft perkels savo failus kitą kartą pasileidusi, o tai užtrunka kelias minutes. Tada vėl atidarykite Meet Luft, ir Windows atsiims vietą. Laikykite kompiuterį prijungtą prie maitinimo.

## Packing things to take along to Luft (the moving box)

box-title = Pasiimkite savo daiktus
box-description = Pasirinkite, ką pasiimti. Luft tai išpakuos į naująją paskyrą, kai bus įdiegta, o iš Windows nieko nebus pašalinta.
box-looking = Peržiūrimi jūsų aplankai…
box-folder-desktop = Darbalaukis
box-folder-documents = Dokumentai
box-folder-downloads = Atsisiuntimai
box-folder-music = Muzika
box-folder-pictures = Paveikslėliai
box-folder-videos = Vaizdo įrašai
box-folder-size = { $size }, { $files ->
    [one] { $files } failas
    [few] { $files } failai
    [many] { $files } failo
   *[other] { $files } failų
}
box-wifi-title = Wi-Fi tinklai
box-wifi-description = Su slaptažodžiais, kad Luft iš karto būtų prisijungusi
box-bluetooth-title = Bluetooth įrenginiai
box-bluetooth-description = { $devices ->
    [one] { $devices } įrenginys, paruoštas be pakartotinio susiejimo
    [few] { $devices } įrenginiai, paruošti be pakartotinio susiejimo
    [many] { $devices } įrenginio, paruošti be pakartotinio susiejimo
   *[other] { $devices } įrenginių, paruoštų be pakartotinio susiejimo
}
box-wallpaper-title = Fono paveikslėlis
box-wallpaper-description = Paveikslėlis jūsų Windows darbalaukyje
box-account-title = Jūsų vardas ir nuotrauka
box-total-slow = { $size }, supakavimas užtruks apie { $minutes ->
    [one] { $minutes } minutę
    [few] { $minutes } minutes
    [many] { $minutes } minutės
   *[other] { $minutes } minučių
}
box-pack = Supakuoti

## Progress while Meet Luft works

working-shrinking = Atlaisvinama vieta
    .description = Windows perkelia savo failus, kad atlaisvintų vietos. Tai gali užtrukti kelias minutes.
working-erasing = Trinamas diskas
    .description = Windows jį išvalo, kad Luft galėtų užimti visą diską.
working-partitioning = Ruošiama vieta sistemai Luft
    .description = Ruošiami skaidiniai, iš kurių pasileidžia Luft.
working-downloading = Perkeliama Luft
    .description = Luft kopijuojama tiesiai į savo vietą ir pakeliui tikrinama.
working-packing = Pakuojami jūsų daiktai
    .description = Visa, ką pasirinkote, kopijuojama į persikraustymo dėžę. Dideli aplankai užtrunka.
working-removing = Šalinama Luft
    .description = Vieta grąžinama sistemai Windows.
working-removing-linux = Šalinama Luft
    .description = Šalinami jos failai ir paleidimo įrašas.
working-writing = Kuriamas atmintukas
    .description = Luft įrašoma į visą atmintuką. Neištraukite jo.
working-copying = Luft pridedama prie Ventoy
    .description = Luft kopijuojama šalia kitų atmintuke esančių ISO. Neištraukite jo.
working-verifying = Tikrinamas atmintukas
    .description = Viskas nuskaitoma atgal, kad būtų aišku, jog jis pasileis.
working-stick-downloading = Atsisiunčiama Luft
    .description = Ji pakeliui tikrinama ir išsaugoma, todėl kitas atmintukas bus sukurtas greičiau.
working-progress = { $done } iš { $total }
working-keep-open = Neuždarykite šio lango.

## After Luft was removed

removed-title = Viskas kaip buvo
removed-description = { $platform ->
    [linux] Luft failai ir paleidimo įrašas pašalinti, o kompiuteris pasileidžia lygiai taip pat kaip anksčiau. Grįžkite bet kada.
   *[windows] Luft skaidiniai ir paleidimo įrašas pašalinti, o Windows vėl turi visą savo vietą. Grįžkite bet kada.
}

## Making a USB stick

stick-title = Sukurti USB atmintuką
stick-description = Iš jo Luft pasileidžia bet kuriame kompiuteryje – išbandyti ar įdiegti.
stick-looking = Ieškoma USB įrenginių…
stick-none = Prijunkite bent { $size } talpos USB atmintuką. Jis atsiras čia.
stick-drives-label = USB įrenginiai
stick-offer = { $name }, { $size }
stick-make = Sukurti atmintuką
stick-drive-empty = Tuščias
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Per mažas sistemai Luft
stick-ventoy-title = Šiame atmintuke naudojamas Ventoy
stick-ventoy-description = Pridėti prie jo Luft ar ištrinti visą atmintuką ir paversti jį Luft atmintuku?
stick-erase-it = Ištrinti
stick-add = Pridėti Luft
stick-replace-title = Pakeisti jame esančią Luft?
stick-replace-description = { $count ->
    [one] Šiame atmintuke jau yra { $names }. Naujoji Luft gali užimti jos vietą.
    [few] Šiame atmintuke jau yra { $names }. Naujoji Luft gali užimti jų vietą.
    [many] Šiame atmintuke jau yra { $names }. Naujoji Luft gali užimti jų vietą.
   *[other] Šiame atmintuke jau yra { $names }. Naujoji Luft gali užimti jų vietą.
}
stick-keep = { $count ->
    [one] Palikti abi
    [few] Palikti visas
    [many] Palikti visas
   *[other] Palikti visas
}
stick-replace = Pakeisti
stick-full-title = Sistemai Luft neužtenka vietos
stick-full-description = Luft reikia { $needed }, o šiame atmintuke laisva { $free }. Atlaisvinkite jame vietos arba ištrinkite jį ir paverskite Luft atmintuku.
stick-erase-title = Ištrinti { $name }?
stick-erase-description = Viskas šiame atmintuke ({ $size }) bus ištrinta ir pakeista Luft. Šio veiksmo anuliuoti negalima.
stick-erase-confirm = Ištrinti ir sukurti atmintuką
stick-done-title = Jūsų Luft atmintukas paruoštas
stick-done-ventoy-title = Luft yra jūsų Ventoy atmintuke
stick-done-take-out = Dabar galite jį ištraukti.
stick-done-eject = Prieš ištraukdami, išstumkite jį.
stick-done-start = Norėdami paleisti iš jo, prijunkite jį ir pasirinkite kompiuterio paleidimo meniu, kuris atsidaro iškart įjungus paspaudus klavišą, pvz., F12, F8 ar Esc.
stick-done-ventoy-key = Kai Secure Boot įjungtas, Ventoy pirmą kartą pasileisdamas vieną kartą paprašys užregistruoti savo raktą.
stick-done = Atlikta
stick-done-another = Sukurti dar vieną
