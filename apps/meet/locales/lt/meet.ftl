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
