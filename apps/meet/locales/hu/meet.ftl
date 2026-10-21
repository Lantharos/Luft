## Messages that some steps share

meet-back = Vissza
meet-cancel = Mégse
meet-continue = Tovább
meet-try-again = Újra
meet-restart = Újraindítás
meet-remove = Eltávolítás
meet-keep-it = Megtartás
meet-close = Bezárás
meet-restart-title = Újraindítja most?
meet-not-yet = Még ne
meet-iso-use = Meglévő ISO használata
meet-iso-using = A saját Luft ISO-ja van használatban
meet-nightly = Éjszakai buildek
meet-channel-nightly = A Meet Luft éjszakai buildeket fog használni
meet-channel-latest = A Meet Luft újra kiadásokat fog használni
meet-undo = Visszavonás
meet-logs-saved = A Luft kipróbálásának naplói az asztalra kerültek
meet-logs-show = Megjelenítés
meet-logs-none = A Luft kipróbálásából még nincsenek naplók
meet-logs-failed = A Meet Luft nem tudta menteni a Luft kipróbálásának naplóit

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] A Meet Luft nem tudta befejezni a számítógép átnézését.
   *[windows] A Meet Luft nem tudta befejezni a PC átnézését.
}
problem-room = A Luft számára való helycsinálás nem fejeződött be.
problem-room-linux = A Luft előkészítése nem fejeződött be.
problem-update = A Luft frissítése nem fejeződött be.
problem-download = A Luft letöltése megszakadt. Ellenőrizze, hogy van-e internetkapcsolat.
problem-pack = A dolgai becsomagolása nem fejeződött be.
problem-remove = A Luft eltávolítása nem fejeződött be.
problem-restart = A Meet Luft nem tudta beállítani az újraindítást.
problem-tidy = A régi indítási bejegyzéseket nem sikerült eltávolítani.
problem-firmware = A Meet Luft nem tudta megnyitni a firmware-beállításokat.
problem-folders = A Meet Luft nem tudta átnézni a mappáit.
problem-sticks = A Meet Luft nem tudott USB-meghajtókat keresni.
problem-stick = A pendrive elkészítése nem fejeződött be.
problem-offer = A Luft most nem tölthető le. Ellenőrizze, hogy van-e internetkapcsolat, vagy használjon egy meglévő ISO-t.
problem-luft = A Meet Luft nem tudta átnézni a Luft meghajtóját.
problem-resize = A Luft méretének módosítása nem fejeződött be.
problem-cancel = A Meet Luft nem tudta visszavonni a módosítást.
problem-give = A Windows nem tudta visszavenni a helyet.
problem-declined = { $platform ->
    [linux] A Meet Luftnak engedély kell a meghajtó módosításához. Adja meg a jelszavát, amikor kéri.
   *[windows] A Meet Luftnak engedély kell a meghajtó módosításához. Válassza az Igen gombot, amikor a Windows rákérdez.
}

## First screen

hello-intro = { $platform ->
    [linux] Próbálja ki a Luftot közvetlenül innen, pendrive nélkül. Ha tetszik, a Luft átveheti ennek a rendszernek a helyét, és megtartja a fájljait.
   *[windows] A Luft elfér a Windows mellett. Először próbálja ki telepítés nélkül, és hozza át a dolgait, amikor készen áll.
}
hello-check = { $platform ->
    [linux] A számítógép ellenőrzése
   *[windows] A PC ellenőrzése
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] A számítógép átnézése
   *[windows] A PC átnézése
}
check-ready-title = { $platform ->
    [linux] Ez a számítógép készen áll a Luftra
   *[windows] Ez a PC készen áll a Luftra
}
check-blocked-title = Majdnem kész
check-moment = Ez eltart egy pillanatig.
check-slow = A Windows kiszámolja, mennyi helyet tud átadni. Nagy meghajtón ez néhány percig is eltarthat.
check-blocked-description = Valamin változtatni kell, mielőtt a Luft beköltözhet. Ezt kell tennie.
check-found-description = Ezt találta a Meet Luft.
check-checking = A meghajtó, a firmware és a hardver ellenőrzése…
check-again = Újbóli ellenőrzés
check-action-firmware = Firmware-beállítások megnyitása
check-action-tidy = Rendrakás
check-firmware-title = Újraindítja a firmware-beállításokba?
check-firmware-description = Előbb mentse, amin dolgozik. Ott kapcsolja be a Secure Bootot és mentsen, utána a számítógép a szokásos módon indul újra.
check-tidy-title = Eltávolítja a régi indítási bejegyzéseket?
check-tidy-description = Ezek csak már nem létező rendszerekre mutatnak. A Windows és minden más pontosan úgy indul, mint eddig.
check-get-ready-title = Előkészíti a Luftot?
check-get-ready-file = A Meet Luft az ISO-ból egy mappába másolja a Luftot ezen a számítógépen, és indítási bejegyzést ad hozzá. A partíciók nem változnak.
check-get-ready-download = A Meet Luft letölti a Luftot (kb. { $size }) egy mappába ezen a számítógépen, és indítási bejegyzést ad hozzá. A partíciók nem változnak.
check-get-ready-confirm = Előkészítés

## Choosing how much of the Windows drive Luft gets

room-title = Mennyi hely jusson a Luftnak?
room-description = A Windows kisebbre zsugorítja magát, hogy helyet adjon a Luftnak. A Windowsban lévő fájljai pontosan ott maradnak, ahol vannak.
room-live = A Windowsnak marad helye a bővülésre. A Luft ezen felül félretesz { $size } helyet az induláshoz, amelyet a telepítés után visszaad.
room-make = Helycsinálás
room-confirm-title = { $size } helyet ad a Luftnak?
room-confirm-file = A Windows zsugorítja a meghajtóját, majd a Meet Luft átmásolja a Luftot az ISO-ból. A PC maradjon áramforráshoz csatlakoztatva.
room-confirm-download = A Windows zsugorítja a meghajtóját, majd a Meet Luft letölti a Luftot (kb. { $size }). A PC maradjon áramforráshoz és az internethez csatlakoztatva.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Hová kerüljön a Luft?
room-places-description = A Luft osztozhat a Windows meghajtóján, vagy elfoglalhat olyan helyet, amelyet a Windows nem használ.
room-places-label = Helyek a Luft számára
room-place-windows = A Windows mellett
room-place-windows-detail = A Windows kisebbre zsugorítja magát, hogy helyet adjon a Luftnak
room-place-windows-free = Ott már { $size } szabad
room-place-free = Szabad hely: { $drive }
room-place-free-here = Szabad hely a Windows meghajtóján
room-place-free-detail = { $size }, amelyet semmi más nem használ
room-place-whole = A teljes meghajtó: { $drive }
room-place-whole-detail = Törli ezt a { $size } méretű meghajtót a Luft számára
room-live-free = Ebből { $free } már szabad, így a Windows kevesebbet ad át, és marad helye a bővülésre. A Luft ezen felül félretesz { $size } helyet az induláshoz, amelyet a telepítés után visszaad.
room-live-elsewhere = A Luft ott { $room } helyet kap, és még { $size } helyet félretesz az induláshoz, amelyet a telepítés után visszaad.
room-confirm-free-title = { $size } szabad helyet ad a Luftnak?
room-confirm-free-file = A Meet Luft oda másolja a Luftot az ISO-ból. A meghajtón semmi más nem változik.
room-confirm-free-download = A Meet Luft oda tölti le a Luftot (kb. { $size }). A meghajtón semmi más nem változik. A PC maradjon az internethez csatlakoztatva.
room-erase-title = Törli ezt a meghajtót: { $drive }?
room-erase-description = Ezen a { $size } méretű meghajtón azonnal minden törlődik, még a Luft indulása előtt. Ez nem vonható vissza. Jelenleg ezek vannak rajta:
room-erase-empty = A Windows semmit sem tud olvasni erről a { $size } méretű meghajtóról, de bármi van rajta, azonnal törlődik. Ez nem vonható vissza.
room-erase-unnamed = Névtelen partíció
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = BitLockerrel titkosítva
room-erase-understood = Tudomásul veszem, hogy egy része BitLockerrel titkosított, és nem állítható vissza
room-erase-confirm = Törlés és helycsinálás

## Luft is ready on Windows

ready-title = A Luft készen áll
ready-description = Válassza ki, hogyan ismerkedne meg vele. A Windows utána a szokásos módon indul, hacsak nem telepíti és választja a Luftot.
ready-update-title = A legújabb Luft beszerzése
ready-update-description = Megjelent egy újabb build. Ezt váltja le, és megtartja a helyet és mindent, amit becsomagolt.
ready-try-title = Luft kipróbálása
ready-try-description = Újraindítás a Luftba, telepítés nélkül. Legközelebb a Windows a szokásos módon indul.
ready-box-description = Csomagolja be dokumentumait, fotóit, Wi-Fi-hálózatait és még sok mást, és a Luft a telepítés után kicsomagolja őket.
ready-box-packed = Becsomagolva, { $size }
ready-install-title = Luft telepítése
ready-install-description = Újraindítás a telepítőbe. A Windows melletti { $size } hely már várja.
ready-install-drive-description = Újraindítás a telepítőbe. A hely ({ $size }) már várja ezen a meghajtón: { $drive }.
ready-stick-description = Tegye a Luftot pendrive-ra, hogy bármelyik számítógépen elindíthassa.
ready-remove = A Luft eltávolítása erről a PC-ről
ready-restart-try = Előbb mentse, amin dolgozik. A Luft nagyjából egy perc múlva megnyílik, a következő újraindítás pedig visszaviszi a Windowsba.
ready-restart-install = Előbb mentse, amin dolgozik. A telepítő nagyjából egy perc múlva megnyílik, és semmi sem változik, amíg ott meg nem erősíti.
ready-fast-startup-title = Gyors rendszerindítás kikapcsolása a Windowsban
ready-fast-startup-description = A Windows ekkor teljesen leáll, így a hang, a Wi-Fi és a Bluetooth tisztán indul a Luftban.
ready-clock-title = Pontos óra mindkettőben
ready-clock-description = A Windows ugyanúgy olvassa a számítógép óráját, mint a Luft, így váltáskor nem ugrik többé az idő.
ready-remove-title = Eltávolítja a Luftot erről a PC-ről?
ready-remove-description = A Meet Luft töröl mindent, amit hozzáadott, a költözési dobozt is, és a Windows visszakapja a teljes helyét.

## Luft is ready on Linux

linux-ready-description = Válassza ki, hogyan ismerkedne meg vele. A rendszer ({ $system }) a szokásos módon indul, amíg másként nem dönt.
linux-ready-this-system = ez a rendszer
linux-ready-update-description = Megjelent egy újabb build. Leváltja a Meet Luft által tárolt verziót, és megtartja a kipróbálás naplóit.
linux-ready-try-description = Újraindítás a Luftba, változtatás nélkül. Legközelebb a rendszer ({ $system }) a szokásos módon indul.
linux-ready-replace-title = Csere: { $system }
linux-ready-replace-description = A Luft átveszi a helyét, és megtartja a fájljait, a fiókját, a Wi-Fi-hálózatokat és a többi meghajtót. A régi rendszer megmarad, amíg el nem távolítja.
linux-ready-install-description = Újraindítás a telepítőbe, hogy a Luftot egy másik meghajtóra vagy szabad helyre tegye.
linux-ready-remove = A Luft eltávolítása erről a számítógépről
linux-ready-restart-try = Előbb mentse, amin dolgozik. A Luft nagyjából egy perc múlva megnyílik, a következő újraindítás pedig visszaviszi ide: { $system }.
linux-ready-restart-replace = Előbb mentse, amin dolgozik. A telepítő úgy nyílik meg, hogy a lecserélendő rendszer már ki van választva ({ $system }), és minden változtatás előtt megmutatja, mi marad meg.
linux-ready-remove-title = Eltávolítja a Luftot erről a számítógépről?
linux-ready-remove-description = A Meet Luft törli a Luft fájljait, indítófájljait és indítási bejegyzését. Minden más változatlan marad.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Az Ön Luftja
luft-looking = A Meet Luft megtalálta a Luftot ezen a PC-n.
luft-checking = A Luft meghajtójának átnézése…
luft-description-beside = A Luft a Windows mellé van telepítve ezen a PC-n.
luft-description-drive = A Luft telepítési helye: { $drive }.
luft-bar-used = { $size }, ebből { $used } foglalt
luft-resize-title = A Luft helyének módosítása
luft-resize-description = Adjon a Luftnak több helyet a Windowséból, vagy adjon vissza belőle a Windowsnak.
luft-resize-drive-description = Adjon a Luftnak több szabad helyet, vagy hagyjon belőle szabadon ezen a meghajtón: { $drive }.
luft-resize-reencrypting = A Luft még titkosítja vagy visszafejti a meghajtóját. Ha végzett, módosítható a mérete.
luft-resize-passphrase = A Luft meghajtója csak jelmondattal nyílik meg, és a Luft költözés közben nem tudja maga beírni.
luft-resize-start-first = Indítsa el egyszer a Luftot, hogy közölhesse a Meet Lufttal, mennyire van tele, aztán térjen vissza.
luft-resize-apart = A Windows és a Luft között egy másik partíció van, ezért nem tudnak osztozni a helyükön.
luft-pending-grow = A Luft a következő indításkor megnő
luft-pending-grow-description = Indítsa újra a gépet a Luftba, és hagyja bekapcsolva néhány percig, amíg beköltözik az új helyre. Közben nyugodtan használhatja.
luft-pending-shrink = A Luft a következő indításkor helyet csinál
luft-pending-shrink-description = Indítsa újra a gépet a Luftba, és hagyja bekapcsolva néhány percig, amíg áthelyezi a fájljait. Utána nyissa meg újra a Meet Luftot a Windowsban, hogy a Windows megkapja a helyet.
luft-pending-trim = A Luft a következő indításkor kisebb lesz
luft-pending-trim-description = Indítsa újra a gépet a Luftba, és nagyjából egy percen belül kisebbre zsugorítja magát.
luft-windows-free-title = A szabad hely átadása a Windowsnak
luft-windows-free-description = Közvetlenül a Windows után { $size } hely semmire sincs használva. A Windows visszaveheti.
luft-leftovers-title = Rendrakás a Luft kipróbálása után
luft-leftovers-description = Azok a partíciók, amelyeket a Meet Luft a Luft indításához készített, még megvannak. A Luftnak már nincs rájuk szüksége.
luft-start = Újraindítás a Luftba
luft-cancel = Módosítás visszavonása
luft-restart = Előbb mentse, amin dolgozik. A Luft nagyjából egy perc múlva elindul, a következő újraindítás pedig visszaviszi a Windowsba.
luft-restart-pending = Előbb mentse, amin dolgozik. A Luft nagyjából egy perc múlva elindul, és magától áthelyezi a fájljait, ami néhány percig tart. Közben használhatja.
luft-remove = A Luft eltávolítása erről a PC-ről
luft-remove-title = Eltávolítja a Luftot erről a PC-ről?
luft-remove-description = A Luft és minden, ami rajta van, törlődik, összesen { $size }, és a Windows visszakapja a helyet. A PC ugyanúgy a Windowst indítja, mint korábban. Ez nem vonható vissza.
luft-remove-drive-description = A Luft és minden, ami rajta van, törlődik erről a meghajtóról: { $drive }, összesen { $size }. A PC ugyanúgy a Windowst indítja, mint korábban. Ez nem vonható vissza.
luft-remove-confirm = Luft eltávolítása

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Mennyi hely jusson a Luftnak?
resize-description = Húzással ossza fel a meghajtót a Windows és a Luft között. A módosítást a Luft maga végzi el a következő indításkor.
resize-measuring = A Windows kiszámolja, mennyi helyet tud átadni. Nagy meghajtón ez néhány percig is eltarthat.
resize-full = A Luft túl tele van ahhoz, hogy áthelyezhető legyen, és a Windows nem tud neki elég helyet átadni. Előbb csináljon helyet a Luftban vagy a Windowsban.
resize-drive-description = Húzással válassza ki, mennyit foglaljon el a Luft ebből a meghajtóból: { $drive }. A módosítást a Luft maga végzi el a következő indításkor.
resize-drive-free = { $size } szabad ezen a meghajtón: { $drive }
resize-used = A Luft fájljai { $size } helyet foglalnak.
resize-least = Legalább { $size } változtatás szükséges.
resize-apply = Módosítás
resize-grow-title = Még { $size } helyet ad a Luftnak?
resize-grow-description = A Windows azonnal kisebbre zsugorítja magát. A Luft a következő indításkor költözik be az új helyre, ami néhány percig tart. A PC maradjon áramforráshoz csatlakoztatva.
resize-grow-drive-description = A Luft a következő indításkor elfoglalja a szabad helyet ezen a meghajtón: { $drive }. Ez csak egy pillanatig tart.
resize-trim-title = Csökkenti a Luft méretét { $size } értékkel?
resize-trim-description = A Luft a következő indításkor kisebbre zsugorítja magát, a hely pedig szabad marad ezen a meghajtón: { $drive }.
resize-shrink-title = Visszaad { $size } helyet a Windowsnak?
resize-shrink-description = A Luft a következő indításkor áthelyezi a fájljait, ami néhány percig tart. Utána nyissa meg újra a Meet Luftot, és a Windows visszaveszi a helyet. A PC maradjon áramforráshoz csatlakoztatva.

## Packing things to take along to Luft (the moving box)

box-title = Hozza a dolgait
box-description = Válassza ki, mit visz magával. A Luft a telepítés után kicsomagolja az új fiókjába, a Windowsból pedig semmi sem törlődik.
box-looking = Mappák átnézése…
box-folder-desktop = Asztal
box-folder-documents = Dokumentumok
box-folder-downloads = Letöltések
box-folder-music = Zene
box-folder-pictures = Képek
box-folder-videos = Videók
box-folder-size = { $size }, { $files ->
    [one] { $files } fájl
   *[other] { $files } fájl
}
box-wifi-title = Wi-Fi-hálózatok
box-wifi-description = A jelszavaikkal együtt, hogy a Luft azonnal online legyen
box-bluetooth-title = Bluetooth-eszközök
box-bluetooth-description = { $devices ->
    [one] { $devices } eszköz, újbóli párosítás nélkül használható
   *[other] { $devices } eszköz, újbóli párosítás nélkül használható
}
box-wallpaper-title = Háttérkép
box-wallpaper-description = A Windows asztalán lévő kép
box-account-title = A neve és a képe
box-total-slow = { $size }, a becsomagolás nagyjából { $minutes ->
    [one] { $minutes } percig
   *[other] { $minutes } percig
} tart
box-pack = Becsomagolás

## Progress while Meet Luft works

working-shrinking = Helycsinálás
    .description = A Windows áthelyezi a fájljait, hogy helyet csináljon. Ez eltarthat néhány percig.
working-erasing = A meghajtó törlése
    .description = A Windows kiüríti, hogy a Luft az egészet megkaphassa.
working-partitioning = A Luft helyének beállítása
    .description = Azoknak a partícióknak az előkészítése, amelyekről a Luft indul.
working-downloading = A Luft áthozása
    .description = A Luft egyenesen a saját helyére kerül, és útközben ellenőrzésen esik át.
working-packing = A dolgai becsomagolása
    .description = Minden kiválasztott elem a költözési dobozba kerül. A nagy mappák eltartanak egy ideig.
working-removing = A Luft eltávolítása
    .description = A hely visszaadása a Windowsnak.
working-removing-linux = A Luft eltávolítása
    .description = A fájljainak és indítási bejegyzésének eltávolítása.
working-writing = A pendrive elkészítése
    .description = A Luft a teljes pendrive-ra kerül. Ne húzza ki.
working-copying = A Luft hozzáadása a Ventoyhoz
    .description = A Luft a pendrive-on lévő többi ISO mellé kerül. Ne húzza ki.
working-verifying = A pendrive ellenőrzése
    .description = Minden visszaolvasása, hogy biztosan elinduljon.
working-stick-downloading = A Luft letöltése
    .description = Útközben ellenőrzésen esik át, és megmarad, így a következő pendrive gyorsabban elkészül.
working-progress = { $done } / { $total }
working-keep-open = Hagyja nyitva ezt az ablakot.

## After Luft was removed

removed-title = Minden a régi
removed-description = { $platform ->
    [linux] A Luft fájljai és indítási bejegyzése eltűntek, a számítógép pontosan úgy indul, mint korábban. Bármikor visszatérhet.
   *[windows] A Luft partíciói és indítási bejegyzése eltűntek, a Windows pedig újra a teljes helyét használhatja. Bármikor visszatérhet.
}

## Making a USB stick

stick-title = Pendrive készítése
stick-description = Erről a Luft bármelyik számítógépen elindul, kipróbálásra vagy telepítésre.
stick-looking = USB-meghajtók keresése…
stick-none = Csatlakoztasson egy legalább { $size } méretű pendrive-ot. Itt fog megjelenni.
stick-drives-label = USB-meghajtók
stick-offer = { $name }, { $size }
stick-make = Pendrive készítése
stick-drive-empty = Üres
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Túl kicsi a Luft számára
stick-ventoy-title = Ez a pendrive Ventoyt használ
stick-ventoy-description = Hozzáadja a Luftot, vagy törli a teljes pendrive-ot, és Luft-pendrive-ot készít belőle?
stick-erase-it = Törlés
stick-add = Luft hozzáadása
stick-replace-title = Lecseréli a rajta lévő Luftot?
stick-replace-description = { $count ->
    [one] Ezen a pendrive-on már rajta van: { $names }. Az új Luft átveheti a helyét.
   *[other] Ezen a pendrive-on már rajta van: { $names }. Az új Luft átveheti a helyüket.
}
stick-keep = { $count ->
    [one] Mindkettő megtartása
   *[other] Mind megtartása
}
stick-replace = Csere
stick-full-title = Nincs hely a Luftnak
stick-full-description = A Luftnak { $needed } kell, a pendrive-on pedig { $free } szabad. Csináljon rajta helyet, vagy törölje, és készítsen belőle Luft-pendrive-ot.
stick-erase-title = Törli ezt: { $name }?
stick-erase-description = Ezen a { $size } méretű pendrive-on minden törlődik, és a Luft kerül a helyére. Ez nem vonható vissza.
stick-erase-confirm = Törlés és pendrive készítése
stick-done-title = Elkészült a Luft-pendrive
stick-done-ventoy-title = A Luft felkerült a Ventoy-pendrive-ra
stick-done-take-out = Most már kihúzhatja.
stick-done-eject = Kihúzás előtt adja ki.
stick-done-start = Az indításhoz csatlakoztassa, és válassza ki a számítógép rendszerindító menüjében, amely bekapcsolás után azonnal megnyílik egy billentyűvel, például F12, F8 vagy Esc.
stick-done-ventoy-key = Bekapcsolt Secure Boot mellett a Ventoy az első indításkor egyszer kéri a saját kulcsa regisztrálását.
stick-done = Kész
stick-done-another = Újabb készítése
