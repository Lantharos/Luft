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
