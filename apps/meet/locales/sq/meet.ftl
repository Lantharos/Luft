## Messages that some steps share

meet-back = Prapa
meet-cancel = Anulo
meet-continue = Vazhdo
meet-try-again = Provo sërish
meet-restart = Rinis
meet-remove = Hiq
meet-keep-it = Mbaje
meet-close = Mbyll
meet-restart-title = Të riniset tani?
meet-not-yet = Jo ende
meet-iso-use = Përdor një ISO që e kam
meet-iso-using = Po përdoret ISO-ja jote e Luft
meet-nightly = Versionet nightly
meet-channel-nightly = Meet Luft do të përdorë versionet nightly
meet-channel-latest = Meet Luft do të përdorë sërish versionet zyrtare
meet-undo = Zhbëj
meet-logs-saved = Regjistrat nga Provo Luft u ruajtën në desktop
meet-logs-show = Shfaq
meet-logs-none = Ende nuk ka regjistra nga Provo Luft
meet-logs-failed = Meet Luft nuk mundi t’i ruante regjistrat nga Provo Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft nuk mundi ta përfundonte kontrollin e këtij kompjuteri.
   *[windows] Meet Luft nuk mundi ta përfundonte kontrollin e këtij PC-je.
}
problem-room = Krijimi i vendit për Luft nuk përfundoi.
problem-room-linux = Përgatitja e Luft nuk përfundoi.
problem-update = Përditësimi i Luft nuk përfundoi.
problem-download = Shkarkimi i Luft u ndal. Kontrollo që je në internet.
problem-pack = Paketimi i gjërave të tua nuk përfundoi.
problem-remove = Heqja e Luft nuk përfundoi.
problem-restart = Meet Luft nuk mundi ta përgatiste rinisjen.
problem-tidy = Hyrjet e vjetra të nisjes nuk mund të hiqeshin.
problem-firmware = Meet Luft nuk mundi të hapte cilësimet e firmware.
problem-folders = Meet Luft nuk mundi t’i shikonte dosjet e tua.
problem-sticks = Meet Luft nuk mundi të kërkonte memorie USB.
problem-stick = Krijimi i memories USB nuk përfundoi.
problem-offer = Luft nuk mund të shkarkohet tani. Kontrollo që je në internet ose përdor një ISO që e ke tashmë.
problem-luft = Meet Luft nuk mundi ta shikonte diskun e Luft.
problem-resize = Ndryshimi i madhësisë së Luft nuk përfundoi.
problem-cancel = Meet Luft nuk mundi ta anulonte ndryshimin.
problem-give = Windows nuk mundi ta merrte hapësirën mbrapsht.
problem-declined = { $platform ->
    [linux] Meet Luft ka nevojë për lejen tënde për të punuar në disk. Shkruaj fjalëkalimin kur ta kërkojë.
   *[windows] Meet Luft ka nevojë për lejen tënde për të punuar në disk. Zgjidh “Po” kur ta pyesë Windows.
}

## First screen

hello-intro = { $platform ->
    [linux] Provo Luft drejtpërdrejt nga këtu, pa memorie USB. Kur të pëlqen, Luft mund të zërë vendin e këtij sistemi dhe të mbajë skedarët e tu.
   *[windows] Luft mund të jetojë menjëherë pranë Windows. Provoje fillimisht pa instaluar asgjë dhe merr me vete gjërat e tua kur të jesh gati.
}
hello-check = { $platform ->
    [linux] Kontrollo këtë kompjuter
   *[windows] Kontrollo këtë PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Po kontrollohet ky kompjuter
   *[windows] Po kontrollohet ky PC
}
check-ready-title = { $platform ->
    [linux] Ky kompjuter është gati për Luft
   *[windows] Ky PC është gati për Luft
}
check-blocked-title = Pothuajse gati
check-moment = Kjo zgjat pak.
check-slow = Windows po llogarit sa vend mund të lirojë. Në një disk të madh kjo mund të zgjasë disa minuta.
check-blocked-description = Diçka duhet të ndryshojë para se Luft të vendoset. Ja çfarë duhet bërë.
check-found-description = Ja çfarë gjeti Meet Luft.
check-checking = Po kontrollohen disku, firmware dhe hardueri…
check-again = Kontrollo sërish
check-action-firmware = Hap cilësimet e firmware
check-action-tidy = Pastro
check-firmware-title = Të riniset te cilësimet e firmware?
check-firmware-description = Ruaj fillimisht çfarëdo që po bën. Aktivizo aty Secure Boot dhe ruaje, dhe kompjuteri nis sërish si zakonisht.
check-tidy-title = Të hiqen hyrjet e vjetra të nisjes?
check-tidy-description = Ato tregojnë vetëm sisteme që nuk ekzistojnë më. Windows dhe gjithçka tjetër nisen njësoj si më parë.
check-get-ready-title = Të përgatitet Luft?
check-get-ready-file = Meet Luft e kopjon Luft nga ISO-ja jote në një dosje në këtë kompjuter dhe shton një hyrje nisjeje për të. Asgjë nuk ndahet nga e para.
check-get-ready-download = Meet Luft shkarkon Luft, rreth { $size }, në një dosje në këtë kompjuter dhe shton një hyrje nisjeje për të. Asgjë nuk ndahet nga e para.
check-get-ready-confirm = Përgatite

## Choosing how much of the Windows drive Luft gets

room-title = Sa vend për Luft?
room-description = Windows zvogëlohet për t’i bërë vend Luft. Skedarët e tu në Windows mbeten siç janë.
room-live = Windows mban vend për t’u rritur. Luft lë mënjanë edhe { $size } për të nisur, të cilat i kthen pasi të instalohet.
room-make = Bëj vend
room-confirm-title = T’i jepen Luft { $size }?
room-confirm-file = Windows zvogëlon diskun e tij, pastaj Meet Luft kopjon Luft nga ISO-ja jote. Mbaje PC-në në prizë.
room-confirm-download = Windows zvogëlon diskun e tij, pastaj Meet Luft shkarkon Luft, rreth { $size }. Mbaje PC-në në prizë dhe në internet.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Ku të shkojë Luft?
room-places-description = Luft mund ta ndajë diskun me Windows ose të marrë hapësirë që Windows nuk e përdor.
room-places-label = Vende për Luft
room-place-windows = Pranë Windows
room-place-windows-detail = Windows zvogëlohet për t’i bërë vend Luft
room-place-windows-free = Aty janë të lira tashmë { $size }
room-place-free = Hapësirë e lirë në { $drive }
room-place-free-here = Hapësirë e lirë në diskun e Windows
room-place-free-detail = { $size } që nuk i përdor asgjë tjetër
room-place-whole = I gjithë disku { $drive }
room-place-whole-detail = E fshin këtë disk prej { $size } për Luft
room-live-free = { $free } prej tyre janë të lira tashmë, ndaj Windows jep më pak dhe mban vend për t’u rritur. Luft lë mënjanë edhe { $size } për të nisur, të cilat i kthen pasi të instalohet.
room-live-elsewhere = Luft merr aty { $room } dhe lë mënjanë edhe { $size } për të nisur, të cilat i kthen pasi të instalohet.
room-confirm-free-title = T’i jepen Luft { $size } hapësirë të lirë?
room-confirm-free-file = Meet Luft kopjon aty Luft nga ISO-ja jote. Asgjë tjetër në disk nuk ndryshon.
room-confirm-free-download = Meet Luft shkarkon aty Luft, rreth { $size }. Asgjë tjetër në disk nuk ndryshon. Mbaje PC-në në internet.
room-erase-title = Të fshihet { $drive }?
room-erase-description = Gjithçka në këtë disk prej { $size } fshihet menjëherë, para se të niset Luft. Kjo nuk mund të zhbëhet. Tani në të ka:
room-erase-empty = Windows nuk mund të lexojë asgjë në këtë disk prej { $size }, por çfarëdo që ka në të fshihet menjëherë. Kjo nuk mund të zhbëhet.
room-erase-unnamed = Ndarje pa emër
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = E enkriptuar me BitLocker
room-erase-understood = E di që një pjesë e tij është e enkriptuar me BitLocker dhe nuk mund të rikthehet
room-erase-confirm = Fshi dhe bëj vend

## Luft is ready on Windows

ready-title = Luft është gati
ready-description = Zgjidh si do ta njohësh. Pas kësaj Windows niset si zakonisht, përveç nëse instalon Luft dhe e zgjedh atë.
ready-update-title = Merr Luft më të ri
ready-update-description = Ka dalë një version më i ri. Zëvendëson këtë dhe mban vendin dhe çdo gjë që ke paketuar.
ready-try-title = Provo Luft
ready-try-description = Rinis në Luft pa instaluar asgjë. Herën tjetër Windows niset si zakonisht.
ready-box-description = Paketo dokumente, foto, rrjete Wi-Fi e më shumë, që Luft t’i shpaketojë kur të instalohet.
ready-box-packed = Paketuar, { $size }
ready-install-title = Instalo Luft
ready-install-description = Rinis te instaluesi. { $size } pranë Windows po e presin tashmë.
ready-install-drive-description = Rinis te instaluesi. { $size } në { $drive } po e presin tashmë.
ready-stick-description = Vendose Luft në një memorie USB për ta nisur në çdo kompjuter.
ready-remove = Hiq Luft nga ky PC
ready-restart-try = Ruaj fillimisht çfarëdo që po bën. Luft hapet për një minutë a më pak, dhe rinisja e ardhshme të kthen te Windows.
ready-restart-install = Ruaj fillimisht çfarëdo që po bën. Instaluesi hapet për një minutë a më pak, dhe asgjë nuk ndryshon derisa të konfirmosh aty.
ready-fast-startup-title = Çaktivizo Fast Startup në Windows
ready-fast-startup-description = Kështu Windows fiket plotësisht, ndaj zëri, Wi-Fi dhe Bluetooth nisin nga e para në Luft.
ready-clock-title = Mbaje orën të saktë në të dyja
ready-clock-description = Windows e lexon orën e kompjuterit njësoj si Luft, ndaj ora nuk kërcen më kur kalon nga njëri te tjetri.
ready-remove-title = Të hiqet Luft nga ky PC?
ready-remove-description = Meet Luft fshin gjithçka që shtoi, përfshirë kutinë e shpërnguljes, dhe ia kthen Windows gjithë hapësirën e tij.

## Luft is ready on Linux

linux-ready-description = Zgjidh si do ta njohësh. { $system } vazhdon të niset si zakonisht derisa të vendosësh ndryshe.
linux-ready-this-system = ky sistem
linux-ready-update-description = Ka dalë një version më i ri. Zëvendëson atë që mban Meet Luft dhe ruan regjistrat nga provat.
linux-ready-try-description = Rinis në Luft pa ndryshuar asgjë. Herën tjetër { $system } niset si zakonisht.
linux-ready-replace-title = Zëvendëso { $system }
linux-ready-replace-description = Luft zë vendin e tij dhe mban skedarët, llogarinë, rrjetet Wi-Fi dhe disqet e tjera. Sistemi i vjetër mbetet derisa ta heqësh.
linux-ready-install-description = Rinis te instaluesi për ta vendosur Luft në një disk tjetër ose në hapësirë të lirë.
linux-ready-remove = Hiq Luft nga ky kompjuter
linux-ready-restart-try = Ruaj fillimisht çfarëdo që po bën. Luft hapet për një minutë a më pak, dhe rinisja e ardhshme të kthen te { $system }.
linux-ready-restart-replace = Ruaj fillimisht çfarëdo që po bën. Instaluesi hapet me { $system } të zgjedhur për t’u zëvendësuar dhe të tregon çfarë mbetet para se të ndryshojë diçka.
linux-ready-remove-title = Të hiqet Luft nga ky kompjuter?
linux-ready-remove-description = Meet Luft fshin skedarët e Luft, skedarët e tij të nisjes dhe hyrjen e tij të nisjes. Gjithçka tjetër mbetet siç është.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Luft-i yt
luft-looking = Meet Luft gjeti Luft në këtë PC.
luft-checking = Po shikohet disku i Luft…
luft-description-beside = Luft është instaluar pranë Windows në këtë PC.
luft-description-drive = Luft është instaluar në { $drive }.
luft-bar-used = { $size }, { $used } të përdorura
luft-resize-title = Ndrysho sa hapësirë ka Luft
luft-resize-description = Jepi Luft më shumë nga hapësira e Windows, ose ktheji Windows një pjesë.
luft-resize-drive-description = Jepi Luft më shumë nga hapësira e lirë në { $drive }, ose lëre një pjesë të saj të lirë.
luft-resize-reencrypting = Luft ende po e enkripton ose po e dekripton diskun e vet. Sapo të mbarojë, madhësia e tij mund të ndryshojë.
luft-resize-passphrase = Disku i Luft hapet vetëm me frazëkalim, dhe Luft nuk mund ta shkruajë vetë ndërsa zhvendoset.
luft-resize-start-first = Nise Luft një herë, që t’i tregojë Meet Luft sa i mbushur është, pastaj kthehu.
luft-resize-apart = Mes Windows dhe Luft ndodhet një ndarje tjetër, ndaj ata nuk mund ta ndajnë hapësirën.
luft-pending-grow = Luft zgjerohet herën tjetër që niset
luft-pending-grow-description = Rinis në Luft dhe lëre ndezur për disa minuta, ndërsa zhvendoset në hapësirën e re. Ndërkohë mund ta përdorësh.
luft-pending-shrink = Luft bën vend herën tjetër që niset
luft-pending-shrink-description = Rinis në Luft dhe lëre ndezur për disa minuta, ndërsa zhvendos skedarët e vet. Pastaj hap sërish Meet Luft në Windows për t’ia dhënë hapësirën Windows.
luft-pending-trim = Luft zvogëlohet herën tjetër që niset
luft-pending-trim-description = Rinis në Luft, dhe ai zvogëlohet brenda rreth një minute.
luft-windows-free-title = Jepi Windows hapësirën e lirë
luft-windows-free-description = { $size } menjëherë pas Windows nuk përdoren nga asgjë. Windows mund t’i marrë mbrapsht.
luft-leftovers-title = Pastro pas provës së Luft
luft-leftovers-description = Ndarjet që krijoi Meet Luft për të nisur Luft janë ende këtu. Luft nuk ka më nevojë për to.
luft-start = Rinis në Luft
luft-cancel = Anulo ndryshimin
luft-restart = Ruaj fillimisht çfarëdo që po bën. Luft niset për një minutë a më pak, dhe rinisja e ardhshme të kthen te Windows.
luft-restart-pending = Ruaj fillimisht çfarëdo që po bën. Luft niset për një minutë a më pak dhe i zhvendos vetë skedarët e tij, gjë që zgjat disa minuta. Ndërkohë mund ta përdorësh.
luft-remove = Hiq Luft nga ky PC
luft-remove-title = Të hiqet Luft nga ky PC?
luft-remove-description = Luft dhe gjithçka në të fshihen, { $size } gjithsej, dhe Windows e merr hapësirën mbrapsht. PC-ja nis Windows si më parë. Kjo nuk mund të zhbëhet.
luft-remove-drive-description = Luft dhe gjithçka në të fshihen nga { $drive }, { $size } gjithsej. PC-ja nis Windows si më parë. Kjo nuk mund të zhbëhet.
luft-remove-confirm = Hiq Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Sa hapësirë për Luft?
resize-description = Tërhiq për ta ndarë diskun mes Windows dhe Luft. Luft e bën vetë ndryshimin herën tjetër që niset.
resize-measuring = Windows po llogarit sa vend mund të lirojë. Në një disk të madh kjo mund të zgjasë disa minuta.
resize-full = Luft është shumë i mbushur për t’u zhvendosur, dhe Windows nuk mund të lirojë vend të mjaftueshëm për të. Bëj fillimisht pak vend në Luft ose në Windows.
resize-drive-description = Tërhiq për të zgjedhur sa nga { $drive } merr Luft. Luft e bën vetë ndryshimin herën tjetër që niset.
resize-drive-free = { $size } të lira në { $drive }
resize-used = Skedarët e Luft zënë { $size }.
resize-least = Ndryshoje të paktën me { $size }.
resize-apply = Ndryshoje
resize-grow-title = T’i jepen Luft edhe { $size }?
resize-grow-description = Windows zvogëlohet menjëherë. Luft zhvendoset në hapësirën e re herën tjetër që niset, gjë që zgjat disa minuta. Mbaje PC-në në prizë.
resize-grow-drive-description = Luft e merr hapësirën e lirë në { $drive } herën tjetër që niset, gjë që zgjat pak.
resize-trim-title = Të zvogëlohet Luft me { $size }?
resize-trim-description = Luft zvogëlohet herën tjetër që niset, dhe hapësira mbetet e lirë në { $drive }.
resize-shrink-title = T’i kthehen Windows { $size }?
resize-shrink-description = Luft i zhvendos skedarët e tij herën tjetër që niset, gjë që zgjat disa minuta. Pastaj hap sërish Meet Luft, dhe Windows e merr hapësirën mbrapsht. Mbaje PC-në në prizë.

## Packing things to take along to Luft (the moving box)

box-title = Merr me vete gjërat e tua
box-description = Zgjidh çfarë të marrësh me vete. Luft i shpaketon në llogarinë tënde të re kur të instalohet, dhe asgjë nuk hiqet nga Windows.
box-looking = Po shikohen dosjet e tua…
box-folder-desktop = Desktopi
box-folder-documents = Dokumentet
box-folder-downloads = Shkarkimet
box-folder-music = Muzika
box-folder-pictures = Fotografitë
box-folder-videos = Videot
box-folder-size = { $size }, { $files ->
    [one] { $files } skedar
   *[other] { $files } skedarë
}
box-wifi-title = Rrjetet Wi-Fi
box-wifi-description = Me fjalëkalimet e tyre, që Luft të jetë menjëherë në internet
box-bluetooth-title = Pajisjet Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } pajisje, gati pa u çiftuar sërish
   *[other] { $devices } pajisje, gati pa u çiftuar sërish
}
box-wallpaper-title = Sfondi
box-wallpaper-description = Fotografia në desktopin tënd të Windows
box-account-title = Emri dhe fotografia jote
box-total-slow = { $size }, që duhen rreth { $minutes ->
    [one] { $minutes } minutë
   *[other] { $minutes } minuta
} për t’u paketuar
box-pack = Paketo

## Progress while Meet Luft works

working-shrinking = Po bëhet vend
    .description = Windows po zhvendos skedarët e tij për të liruar hapësirë. Kjo mund të zgjasë disa minuta.
working-erasing = Po fshihet disku
    .description = Windows po e pastron që Luft ta ketë të tërin.
working-partitioning = Po përgatitet hapësira e Luft
    .description = Po përgatiten ndarjet nga të cilat niset Luft.
working-downloading = Po sillet Luft
    .description = Luft kopjohet drejtpërdrejt në hapësirën e vet dhe kontrollohet gjatë rrugës.
working-packing = Po paketohen gjërat e tua
    .description = Po kopjohet gjithçka që zgjodhe në kutinë e shpërnguljes. Dosjet e mëdha zgjasin pak.
working-removing = Po hiqet Luft
    .description = Hapësira po i kthehet Windows.
working-removing-linux = Po hiqet Luft
    .description = Po hiqen skedarët dhe hyrja e tij e nisjes.
working-writing = Po krijohet memoria USB
    .description = Luft shkruhet në të gjithë memorien. Mbaje të lidhur.
working-copying = Po shtohet Luft në Ventoy
    .description = Luft kopjohet pranë ISO-ve të tjera në memorie. Mbaje të lidhur.
working-verifying = Po kontrollohet memoria USB
    .description = Po lexohet e gjitha sërish për t’u siguruar që niset.
working-stick-downloading = Po shkarkohet Luft
    .description = Kontrollohet gjatë rrugës dhe ruhet, që memoria tjetër të bëhet më shpejt.
working-progress = { $done } nga { $total }
working-keep-open = Mbaje këtë dritare të hapur.

## After Luft was removed

removed-title = Gjithçka si më parë
removed-description = { $platform ->
    [linux] Skedarët e Luft dhe hyrja e tij e nisjes u hoqën, dhe kompjuteri yt niset njësoj si më parë. Kthehu kur të duash.
   *[windows] Ndarjet e Luft dhe hyrja e tij e nisjes u hoqën, dhe Windows ka sërish gjithë hapësirën e tij. Kthehu kur të duash.
}

## Making a USB stick

stick-title = Krijo një memorie USB
stick-description = Luft niset prej saj në çdo kompjuter, për ta provuar ose instaluar.
stick-looking = Po kërkohen memorie USB…
stick-none = Lidh një memorie USB prej { $size } ose më shumë. Do të shfaqet këtu.
stick-drives-label = Memoriet USB
stick-offer = { $name }, { $size }
stick-make = Krijo memorien
stick-drive-empty = Bosh
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Shumë e vogël për Luft
stick-ventoy-title = Kjo memorie përdor Ventoy
stick-ventoy-description = Ta shtosh Luft në të, apo ta fshish të gjithë memorien dhe ta bësh memorie Luft?
stick-erase-it = Fshije
stick-add = Shto Luft
stick-replace-title = Të zëvendësohet Luft që ka?
stick-replace-description = { $count ->
    [one] { $names } është tashmë në këtë memorie. Luft i ri mund të zërë vendin e tij.
   *[other] { $names } janë tashmë në këtë memorie. Luft i ri mund të zërë vendin e tyre.
}
stick-keep = { $count ->
    [one] Mbaji të dyja
   *[other] Mbaji të gjitha
}
stick-replace = Zëvendëso
stick-full-title = Nuk ka vend për Luft
stick-full-description = Luft ka nevojë për { $needed }, ndërsa në këtë memorie janë të lira { $free }. Liro vend në të, ose fshije dhe bëje memorie Luft.
stick-erase-title = Të fshihet { $name }?
stick-erase-description = Gjithçka në këtë memorie prej { $size } fshihet dhe zëvendësohet me Luft. Kjo nuk mund të zhbëhet.
stick-erase-confirm = Fshi dhe krijo memorien
stick-done-title = Memoria jote Luft është gati
stick-done-ventoy-title = Luft është në memorien tënde Ventoy
stick-done-take-out = Tani mund ta heqësh.
stick-done-eject = Nxirre në mënyrë të sigurt para se ta heqësh.
stick-done-start = Për ta nisur prej saj, lidhe dhe zgjidhe te menyja e nisjes së kompjuterit, që hapet me një tast si F12, F8 ose Esc menjëherë pas ndezjes.
stick-done-ventoy-key = Me Secure Boot aktiv, Ventoy kërkon një herë të regjistrojë çelësin e vet herën e parë që niset.
stick-done = U krye
stick-done-another = Krijo një tjetër
