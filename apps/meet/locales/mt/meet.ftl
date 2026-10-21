## Messages that some steps share

meet-back = Lura
meet-cancel = Ikkanċella
meet-continue = Kompli
meet-try-again = Erġa’ pprova
meet-restart = Irristartja
meet-remove = Neħħi
meet-keep-it = Żommu
meet-close = Agħlaq
meet-restart-title = Tirristartja issa?
meet-not-yet = Mhux issa
meet-iso-use = Uża ISO li diġà għandi
meet-iso-using = Qed tintuża l-ISO tiegħek ta’ Luft
meet-nightly = Builds nightly
meet-channel-nightly = Meet Luft se juża l-builds nightly
meet-channel-latest = Meet Luft se jerġa’ juża r-rilaxxi
meet-undo = Erġa’ lura
meet-logs-saved = Il-logs ta’ Ipprova Luft ġew issejvjati fuq id-desktop
meet-logs-show = Uri
meet-logs-none = Għad m’hemmx logs ta’ Ipprova Luft
meet-logs-failed = Meet Luft ma setax jissejvja l-logs ta’ Ipprova Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft ma setax ilesti l-verifika ta’ dan il-kompjuter.
   *[windows] Meet Luft ma setax ilesti l-verifika ta’ dan il-PC.
}
problem-room = L-ispazju għal Luft ma tlestiex.
problem-room-linux = It-tħejjija ta’ Luft ma tlestietx.
problem-update = L-aġġornament ta’ Luft ma tlestiex.
problem-download = It-tniżżil ta’ Luft waqaf. Iċċekkja li int online.
problem-pack = L-ippakkjar tal-affarijiet tiegħek ma tlestiex.
problem-remove = It-tneħħija ta’ Luft ma tlestietx.
problem-restart = Meet Luft ma setax iħejji r-restart.
problem-tidy = L-entrati qodma tal-boot ma setgħux jitneħħew.
problem-firmware = Meet Luft ma setax jiftaħ is-settings tal-firmware.
problem-folders = Meet Luft ma setax iħares lejn il-fowlders tiegħek.
problem-sticks = Meet Luft ma setax ifittex drajvs USB.
problem-stick = Il-preparazzjoni tad-drajv USB ma tlestietx.
problem-offer = Luft ma jistax jitniżżel bħalissa. Iċċekkja li int online, jew uża ISO li diġà għandek.
problem-luft = Meet Luft ma setax iħares lejn id-drajv ta’ Luft.
problem-resize = It-tibdil tad-daqs ta’ Luft ma tlestiex.
problem-cancel = Meet Luft ma setax jikkanċella l-bidla.
problem-give = Windows ma setax jieħu l-ispazju lura.
problem-declined = { $platform ->
    [linux] Meet Luft għandu bżonn il-permess tiegħek biex jaħdem fuq id-drajv. Daħħal il-password meta jitolbok.
   *[windows] Meet Luft għandu bżonn il-permess tiegħek biex jaħdem fuq id-drajv. Agħżel Iva meta jistaqsik Windows.
}

## First screen

hello-intro = { $platform ->
    [linux] Ipprova Luft dritt minn hawn, mingħajr drajv USB. Jekk togħġbok, Luft jista’ jieħu post din is-sistema u jżomm il-fajls tiegħek.
   *[windows] Luft jista’ jgħix eżatt ħdejn Windows. L-ewwel ipprovah mingħajr ma tinstalla xejn, u ġib l-affarijiet tiegħek miegħek meta tkun lest.
}
hello-check = { $platform ->
    [linux] Iċċekkja dan il-kompjuter
   *[windows] Iċċekkja dan il-PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Qed jiġi ċċekkjat il-kompjuter
   *[windows] Qed jiġi ċċekkjat il-PC
}
check-ready-title = { $platform ->
    [linux] Dan il-kompjuter lest għal Luft
   *[windows] Dan il-PC lest għal Luft
}
check-blocked-title = Kważi lest
check-moment = Dan jieħu ftit.
check-slow = Windows qed jikkalkula kemm jista’ jagħti spazju. Fuq drajv kbir dan jista’ jieħu ftit minuti.
check-blocked-description = Hemm bżonn tinbidel xi ħaġa qabel ma Luft jista’ jidħol. Hawn x’għandek tagħmel.
check-found-description = Hawn x’sab Meet Luft.
check-checking = Qed jiġu ċċekkjati d-drajv, il-firmware u l-hardware…
check-again = Erġa’ ċċekkja
check-action-firmware = Iftaħ is-settings tal-firmware
check-action-tidy = Naddaf
check-firmware-title = Tirristartja fis-settings tal-firmware?
check-firmware-description = L-ewwel issejvja dak li qed taħdem fuqu. Hemmhekk ixgħel Secure Boot u ssejvja, u l-kompjuter jerġa’ jibda bħas-soltu.
check-tidy-title = Tneħħi l-entrati qodma tal-boot?
check-tidy-description = Jippuntaw biss lejn sistemi li m’għadhomx hemm. Windows u kull ħaġa oħra jibdew eżatt bħal qabel.
check-get-ready-title = Tħejji lil Luft?
check-get-ready-file = Meet Luft jikkopja lil Luft mill-ISO tiegħek f’fowlder fuq dan il-kompjuter u jżidlu entrata tal-boot. L-ebda partizzjoni ma tinbidel.
check-get-ready-download = Meet Luft iniżżel lil Luft, madwar { $size }, f’fowlder fuq dan il-kompjuter u jżidlu entrata tal-boot. L-ebda partizzjoni ma tinbidel.
check-get-ready-confirm = Ħejjih

## Choosing how much of the Windows drive Luft gets

room-title = Kemm spazju għal Luft?
room-description = Windows jiċċekken biex jagħti spazju lil Luft. Il-fajls tiegħek f’Windows jibqgħu eżatt fejn huma.
room-live = Windows iżomm spazju biex jikber. Luft iwarrab ukoll { $size } biex jibda minnhom, u jroddhom lura ladarba jiġi installat.
room-make = Agħmel spazju
room-confirm-title = Tagħti { $size } lil Luft?
room-confirm-file = Windows iċekken id-drajv tiegħu, imbagħad Meet Luft jikkopja lil Luft mill-ISO tiegħek. Żomm il-PC imqabbad mad-dawl.
room-confirm-download = Windows iċekken id-drajv tiegħu, imbagħad Meet Luft iniżżel lil Luft, madwar { $size }. Żomm il-PC imqabbad mad-dawl u online.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Fejn għandu jmur Luft?
room-places-description = Luft jista’ jaqsam id-drajv ta’ Windows, jew jieħu spazju li Windows ma jużax.
room-places-label = Postijiet għal Luft
room-place-windows = Ħdejn Windows
room-place-windows-detail = Windows jiċċekken biex jagħti spazju lil Luft
room-place-windows-free = Diġà hemm { $size } ħielsa hemmhekk
room-place-free = Spazju ħieles fuq { $drive }
room-place-free-here = Spazju ħieles fuq id-drajv ta’ Windows
room-place-free-detail = { $size } li xejn ieħor ma jużahom
room-place-whole = { $drive } kollu
room-place-whole-detail = Iħassar dan id-drajv ta’ { $size } għal Luft
room-live-free = { $free } minnu diġà ħielsa, għalhekk Windows iċedi inqas u jżomm spazju biex jikber. Luft iwarrab ukoll { $size } biex jibda minnhom, u jroddhom lura ladarba jiġi installat.
room-live-elsewhere = Luft jieħu { $room } hemmhekk, u jwarrab { $size } oħra biex jibda minnhom, li jroddhom lura ladarba jiġi installat.
room-confirm-free-title = Tagħti { $size } ta’ spazju ħieles lil Luft?
room-confirm-free-file = Meet Luft jikkopja lil Luft mill-ISO tiegħek fih. Xejn ieħor fuq id-drajv ma jinbidel.
room-confirm-free-download = Meet Luft iniżżel lil Luft fih, madwar { $size }. Xejn ieħor fuq id-drajv ma jinbidel. Żomm il-PC online.
room-erase-title = Tħassar { $drive }?
room-erase-description = Kollox fuq dan id-drajv ta’ { $size } jitħassar minnufih, qabel ma jibda Luft. Dan ma jistax jitreġġa’ lura. Bħalissa fuqu hemm:
room-erase-empty = Windows ma jista’ jaqra xejn fuq dan id-drajv ta’ { $size }, imma kull ma hemm fuqu jitħassar minnufih. Dan ma jistax jitreġġa’ lura.
room-erase-unnamed = Partizzjoni mingħajr isem
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Iċċifrata b’BitLocker
room-erase-understood = Naf li parti minnu hija ċċifrata b’BitLocker u ma tistax tinġieb lura
room-erase-confirm = Ħassar u agħmel spazju

## Luft is ready on Windows

ready-title = Luft lest
ready-description = Agħżel kif tixtieq issir tafu. Wara Windows jibda bħas-soltu, sakemm ma tinstallax lil Luft u tagħżlu.
ready-update-title = Ikseb l-aħħar Luft
ready-update-description = Ħareġ build ġdid. Jieħu post dan u jżomm l-ispazju u kull ma ppakkjajt.
ready-try-title = Ipprova Luft
ready-try-description = Irristartja f’Luft mingħajr ma tinstalla xejn. Id-darba li jmiss Windows jibda bħas-soltu.
ready-box-description = Ippakkja dokumenti, ritratti, netwerks Wi-Fi u aktar, biex Luft jiftaħhom meta jiġi installat.
ready-box-packed = Ippakkjat, { $size }
ready-install-title = Installa Luft
ready-install-description = Irristartja fl-installatur. L-ispazju ta’ { $size } ħdejn Windows diġà qed jistennieh.
ready-install-drive-description = Irristartja fl-installatur. L-ispazju ta’ { $size } fuq { $drive } diġà qed jistennieh.
ready-stick-description = Poġġi lil Luft fuq drajv USB biex tibdieh fuq kwalunkwe kompjuter.
ready-remove = Neħħi lil Luft minn dan il-PC
ready-restart-try = L-ewwel issejvja dak li qed taħdem fuqu. Luft jinfetaħ f’xi minuta, u r-restart li jmiss iġibek lura f’Windows.
ready-restart-install = L-ewwel issejvja dak li qed taħdem fuqu. L-installatur jinfetaħ f’xi minuta, u xejn ma jinbidel qabel ma tikkonferma hemmhekk.
ready-fast-startup-title = Itfi Fast Startup f’Windows
ready-fast-startup-description = Hekk Windows jintefa għalkollox, u l-ħoss, il-Wi-Fi u l-Bluetooth jibdew mill-ġdid f’Luft.
ready-clock-title = Żomm il-ħin korrett fit-tnejn
ready-clock-description = Windows jaqra l-arloġġ tal-kompjuter bl-istess mod bħal Luft, għalhekk il-ħin ma jibqax jaqbeż meta taqleb.
ready-remove-title = Tneħħi lil Luft minn dan il-PC?
ready-remove-description = Meet Luft iħassar kull ma żied, inkluża l-kaxxa tal-ġarr, u jagħti lura lil Windows l-ispazju kollu tiegħu.

## Luft is ready on Linux

linux-ready-description = Agħżel kif tixtieq issir tafu. { $system } jibqa’ jibda bħas-soltu sakemm ma tiddeċidix mod ieħor.
linux-ready-this-system = din is-sistema
linux-ready-update-description = Ħareġ build ġdid. Jieħu post dak li jżomm Meet Luft u jżomm il-logs ta’ meta pprovajtu.
linux-ready-try-description = Irristartja f’Luft mingħajr ma tibdel xejn. Id-darba li jmiss jibda { $system } bħas-soltu.
linux-ready-replace-title = Ibdel { $system }
linux-ready-replace-description = Luft jieħu postha u jżomm il-fajls, il-kont, in-netwerks Wi-Fi u d-drajvs l-oħra tiegħek. Is-sistema l-qadima tibqa’ sakemm tneħħiha.
linux-ready-install-description = Irristartja fl-installatur biex tpoġġi lil Luft fuq drajv ieħor jew fi spazju ħieles.
linux-ready-remove = Neħħi lil Luft minn dan il-kompjuter
linux-ready-restart-try = L-ewwel issejvja dak li qed taħdem fuqu. Luft jinfetaħ f’xi minuta, u r-restart li jmiss jerġa’ jibda { $system }.
linux-ready-restart-replace = L-ewwel issejvja dak li qed taħdem fuqu. L-installatur jinfetaħ b’{ $system } magħżula biex tinbidel, u juri x’jibqa’ qabel ma jinbidel xejn.
linux-ready-remove-title = Tneħħi lil Luft minn dan il-kompjuter?
linux-ready-remove-description = Meet Luft iħassar il-fajls ta’ Luft, il-fajls tal-boot tiegħu u l-entrata tal-boot tiegħu. Kull ħaġa oħra tibqa’ kif inhi.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Luft fuq dan il-PC
luft-looking = Meet Luft sab lil Luft fuq dan il-PC.
luft-checking = Qed jiġi ċċekkjat id-drajv ta’ Luft…
luft-description-beside = Luft huwa installat ħdejn Windows fuq dan il-PC.
luft-description-drive = Luft huwa installat fuq { $drive }.
luft-bar-used = { $size }, { $used } użati
luft-resize-title = Ibdel kemm għandu spazju Luft
luft-resize-description = Agħti lil Luft aktar mill-ispazju ta’ Windows, jew agħti ftit lura lil Windows.
luft-resize-encrypted = Id-drajv ta’ Luft huwa ċċifrat, għalhekk biex jiċċaqlaq ikun hemm bżonn iċ-ċavetta tal-irkupru tiegħu. L-ewwel itfi ċ-ċċifrar tal-apparat fis-Settings ta’ Luft, imbagħad erġa’ ejja.
luft-resize-apart = Hemm partizzjoni oħra bejn Windows u Luft, għalhekk ma jistgħux jaqsmu l-ispazju tagħhom.
luft-resize-unreadable = Meet Luft ma setax jgħid kemm hu mimli Luft.
luft-pending-grow = Luft jikber id-darba li jmiss li jibda
luft-pending-grow-description = Irristartja f’Luft u ħallih mixgħul għal ftit minuti waqt li jidħol fl-ispazju l-ġdid. Tista’ tibqa’ tużah sadanittant.
luft-pending-shrink = Luft jagħmel spazju id-darba li jmiss li jibda
luft-pending-shrink-description = Irristartja f’Luft u ħallih mixgħul għal ftit minuti waqt li jċaqlaq il-fajls tiegħu. Imbagħad erġa’ iftaħ Meet Luft f’Windows biex Windows jieħu l-ispazju.
luft-windows-free-title = Agħti l-ispazju ħieles lil Windows
luft-windows-free-description = { $size } eżatt wara Windows mhuma użati minn xejn. Windows jista’ jeħodhom lura.
luft-leftovers-title = Naddaf wara li pprovajt Luft
luft-leftovers-description = Il-partizzjonijiet li għamel Meet Luft biex jibda lil Luft għadhom hawn. Luft m’għandux bżonnhom aktar.
luft-start = Irristartja f’Luft
luft-cancel = Ikkanċella l-bidla
luft-restart = L-ewwel issejvja dak li qed taħdem fuqu. Luft jibda f’xi minuta, u r-restart li jmiss iġibek lura f’Windows.
luft-restart-pending = L-ewwel issejvja dak li qed taħdem fuqu. Luft jibda f’xi minuta u jċaqlaq il-fajls tiegħu waħdu, u dan jieħu ftit minuti. Tista’ tużah sadanittant.
luft-remove = Neħħi lil Luft minn dan il-PC
luft-remove-title = Tneħħi lil Luft minn dan il-PC?
luft-remove-description = Luft u kull ma fih jitħassru, { $size } b’kollox, u Windows jieħu l-ispazju lura. Il-PC jibda Windows bħal qabel. Dan ma jistax jitreġġa’ lura.
luft-remove-drive-description = Luft u kull ma fih jitħassru minn { $drive }, { $size } b’kollox. Il-PC jibda Windows bħal qabel. Dan ma jistax jitreġġa’ lura.
luft-remove-confirm = Neħħi lil Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kemm spazju għal Luft?
resize-description = Kaxkar biex taqsam id-drajv bejn Windows u Luft. Luft jagħmel il-bidla hu stess id-darba li jmiss li jibda.
resize-measuring = Windows qed jikkalkula kemm jista’ jagħti spazju. Fuq drajv kbir dan jista’ jieħu ftit minuti.
resize-full = Luft huwa mimli wisq biex jiċċaqlaq, u Windows ma jistax jagħtih biżżejjed spazju. L-ewwel agħmel ftit spazju f’Luft jew f’Windows.
resize-used = Il-fajls ta’ Luft jieħdu { $size }.
resize-least = Ibdlu b’mill-inqas { $size }.
resize-apply = Ibdlu
resize-grow-title = Tagħti { $size } oħra lil Luft?
resize-grow-description = Windows jiċċekken minnufih. Luft jidħol fl-ispazju l-ġdid id-darba li jmiss li jibda, u dan jieħu ftit minuti. Żomm il-PC imqabbad mad-dawl.
resize-shrink-title = Tagħti { $size } lura lil Windows?
resize-shrink-description = Luft iċaqlaq il-fajls tiegħu id-darba li jmiss li jibda, u dan jieħu ftit minuti. Imbagħad erġa’ iftaħ Meet Luft, u Windows jieħu l-ispazju lura. Żomm il-PC imqabbad mad-dawl.

## Packing things to take along to Luft (the moving box)

box-title = Ġib l-affarijiet tiegħek
box-description = Agħżel x’se tieħu miegħek. Luft jiftaħhom fil-kont il-ġdid tiegħek meta jiġi installat, u xejn ma jitneħħa minn Windows.
box-looking = Qed jiġu mfittxija l-fowlders tiegħek…
box-folder-desktop = Desktop
box-folder-documents = Dokumenti
box-folder-downloads = Downloads
box-folder-music = Mużika
box-folder-pictures = Stampi
box-folder-videos = Vidjows
box-folder-size = { $size }, { $files ->
    [one] { $files } fajl
    [two] { $files } fajls
    [few] { $files } fajls
    [many] { $files } fajl
   *[other] { $files } fajl
}
box-wifi-title = Netwerks Wi-Fi
box-wifi-description = Bil-passwords tagħhom, biex Luft ikun online mill-ewwel
box-bluetooth-title = Apparati Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } apparat, lest mingħajr ma jerġa’ jitqabbad
    [two] { $devices } apparati, lesti mingħajr ma jerġgħu jitqabbdu
    [few] { $devices } apparati, lesti mingħajr ma jerġgħu jitqabbdu
    [many] { $devices } apparat, lesti mingħajr ma jerġgħu jitqabbdu
   *[other] { $devices } apparat, lesti mingħajr ma jerġgħu jitqabbdu
}
box-wallpaper-title = Sfond
box-wallpaper-description = L-istampa fuq id-desktop ta’ Windows
box-account-title = L-isem u l-istampa tiegħek
box-total-slow = { $size }, li jieħdu madwar { $minutes ->
    [one] { $minutes } minuta
    [two] { $minutes } minuti
    [few] { $minutes } minuti
    [many] { $minutes } minuta
   *[other] { $minutes } minuta
} biex jiġu ppakkjati
box-pack = Ippakkja

## Progress while Meet Luft works

working-shrinking = Qed isir l-ispazju
    .description = Windows qed iċaqlaq il-fajls tiegħu biex jagħmel spazju. Dan jista’ jieħu ftit minuti.
working-erasing = Qed jitħassar id-drajv
    .description = Windows qed inaddfu biex Luft ikollu kollu.
working-partitioning = Qed jitħejja l-ispazju ta’ Luft
    .description = Qed jitħejjew il-partizzjonijiet li minnhom jibda Luft.
working-downloading = Qed jinġieb Luft
    .description = Luft jiġi kkupjat dritt fl-ispazju tiegħu u jiġi ċċekkjat fit-triq.
working-packing = Qed jiġu ppakkjati l-affarijiet tiegħek
    .description = Qed jiġi kkupjat dak kollu li għażilt fil-kaxxa tal-ġarr. Fowlders kbar jieħdu ftit.
working-removing = Qed jitneħħa Luft
    .description = L-ispazju qed jingħata lura lil Windows.
working-removing-linux = Qed jitneħħa Luft
    .description = Qed jitneħħew il-fajls u l-entrata tal-boot tiegħu.
working-writing = Qed isir id-drajv USB
    .description = Luft qed jinkiteb fuq id-drajv kollu. Żommu mqabbad.
working-copying = Qed jiżdied Luft ma’ Ventoy
    .description = Luft qed jiġi kkupjat ħdejn l-ISOs l-oħra fuq id-drajv. Żommu mqabbad.
working-verifying = Qed jiġi ċċekkjat id-drajv USB
    .description = Qed jerġa’ jinqara kollu biex ikun żgur li jibda.
working-stick-downloading = Qed jitniżżel Luft
    .description = Jiġi ċċekkjat fit-triq u jinżamm, biex id-drajv li jmiss isir aktar malajr.
working-progress = { $done } minn { $total }
working-keep-open = Jekk jogħġbok, żomm din it-tieqa miftuħa.

## After Luft was removed

removed-title = Kollox lura kif kien
removed-description = { $platform ->
    [linux] Il-fajls ta’ Luft u l-entrata tal-boot tiegħu tneħħew, u l-kompjuter jibda eżatt bħal qabel. Erġa’ ejja meta trid.
   *[windows] Il-partizzjonijiet ta’ Luft u l-entrata tal-boot tiegħu tneħħew, u Windows għandu l-ispazju kollu tiegħu lura. Erġa’ ejja meta trid.
}

## Making a USB stick

stick-title = Agħmel drajv USB
stick-description = Luft jibda minnu fuq kwalunkwe kompjuter, biex tipprovah jew tinstallah.
stick-looking = Qed jiġu mfittxija drajvs USB…
stick-none = Qabbad drajv USB ta’ { $size } jew aktar. Jidher hawn.
stick-drives-label = Drajvs USB
stick-offer = { $name }, { $size }
stick-make = Agħmel id-drajv
stick-drive-empty = Vojt
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Żgħir wisq għal Luft
stick-ventoy-title = Dan id-drajv juża Ventoy
stick-ventoy-description = Iżżid lil Luft miegħu, jew tħassar id-drajv kollu u tagħmlu drajv ta’ Luft?
stick-erase-it = Ħassru
stick-add = Żid Luft
stick-replace-title = Tibdel il-Luft li hemm fuqu?
stick-replace-description = { $count ->
    [one] { $names } diġà jinsab fuq dan id-drajv. Il-Luft il-ġdid jista’ jieħu postu.
    [two] { $names } diġà jinsabu fuq dan id-drajv. Il-Luft il-ġdid jista’ jieħu posthom.
    [few] { $names } diġà jinsabu fuq dan id-drajv. Il-Luft il-ġdid jista’ jieħu posthom.
    [many] { $names } diġà jinsabu fuq dan id-drajv. Il-Luft il-ġdid jista’ jieħu posthom.
   *[other] { $names } diġà jinsabu fuq dan id-drajv. Il-Luft il-ġdid jista’ jieħu posthom.
}
stick-keep = { $count ->
    [one] Żomm it-tnejn
    [two] Żommhom kollha
    [few] Żommhom kollha
    [many] Żommhom kollha
   *[other] Żommhom kollha
}
stick-replace = Ibdel
stick-full-title = M’hemmx spazju għal Luft
stick-full-description = Luft għandu bżonn { $needed }, u fuq dan id-drajv hemm { $free } ħielsa. Agħmel spazju fuqu, jew ħassru u agħmlu drajv ta’ Luft.
stick-erase-title = Tħassar { $name }?
stick-erase-description = Kollox fuq dan id-drajv ta’ { $size } jitħassar u jinbidel b’Luft. Dan ma jistax jitreġġa’ lura.
stick-erase-confirm = Ħassar u agħmel id-drajv
stick-done-title = Id-drajv ta’ Luft tiegħek lest
stick-done-ventoy-title = Luft qiegħed fuq id-drajv Ventoy tiegħek
stick-done-take-out = Issa tista’ toħorġu.
stick-done-eject = Agħmel eject qabel toħorġu.
stick-done-start = Biex tibda minnu, qabbdu u agħżlu fil-menù tal-boot tal-kompjuter, li jinfetaħ b’buttuna bħal F12, F8 jew Esc eżatt wara li tixgħel.
stick-done-ventoy-key = B’Secure Boot mixgħul, Ventoy jitlob darba biex jirreġistra ċ-ċavetta tiegħu l-ewwel darba li jibda.
stick-done = Lest
stick-done-another = Agħmel ieħor
