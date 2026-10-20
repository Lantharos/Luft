## Buttons used across steps

setup-continue = Tovább
setup-back = Vissza
setup-cancel = Mégse
setup-not-now = Most nem
setup-try-again = Újra
setup-restart = Újraindítás
setup-restart-now = Újraindítás most
setup-restart-later = Újraindítás később
setup-saving = Mentés…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Luft telepítése
setup-installing-progress = Telepítés: { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Keresés
setup-picker-no-match = Nincs találat

## Welcome step: language, keyboard and time zone

setup-region-title = Üdvözli a Luft
setup-region-language = Nyelv
setup-region-keyboard = Billentyűzet
setup-region-time-zone = Időzóna
setup-region-intro = Kezdjük a beállítást. Válassza ki a nyelvet, a billentyűzetet és az időzónát.
setup-region-intro-guessed-computer = Kezdjük a beállítást. Ezeket a számítógép alapján töltöttük ki, módosítsa, ami nem stimmel.
setup-region-intro-guessed = Kezdjük a beállítást. Néhány beállítást előre kitöltöttünk: { $guesses }. Módosítsa, ami nem stimmel.
setup-region-guess-from-computer = { $fields } (a számítógép alapján)
setup-region-guess-from-network = { $fields } (a hálózat alapján)
setup-region-field-language = nyelv
setup-region-field-keyboard = billentyűzet
setup-region-field-time-zone = időzóna

## Where Luft goes

setup-destination-choose-title = Hová kerüljön a Luft?
setup-destination-choose-description = Válassza ki, hogyan kerüljön a Luft erre a számítógépre. Semmi sem változik, amíg jóvá nem hagyja.
setup-destination-alongside-title = Hely a Windows mellett
setup-destination-alongside-description = A Windows kisebb lesz, hogy helyet adjon a Luftnak. A Windowsban lévő fájljai változatlanok maradnak.
setup-destination-whole-title = Lemez kiválasztása
setup-destination-whole-description = A Luft a teljes lemezt használja. Minden törlődik róla.
setup-destination-custom-title = Hely kiválasztása a Luft számára
setup-destination-custom-description = A Lemezek alkalmazásban saját maga rendezheti el a lemezeit.
setup-destination-replace-title = { $system } lecserélése
setup-destination-replace-description = A Luft a helyére kerül, a saját adatai pedig megmaradnak.
setup-destination-meet-title = A Windows mellett
setup-destination-meet-description = A Meet Luft már elkészítette ezt a helyet, így a Windows teljesen változatlan marad.
setup-destination-looking = Lemezek vizsgálata…

setup-destination-meet-choice = A Windows mellett
setup-destination-meet-choice-description = A Meet Luft által a Windows mellett létrehozott hely használata ({ $size }).
setup-destination-alongside-choice = { $windows } mellett
setup-destination-alongside-choice-description = A Windows és a fájljai megmaradnak, a Luft pedig megkapja a lemez egy részét.
setup-destination-replace-choice = { $system } lecserélése
setup-destination-replace-choice-description = A fájljai, a fiókja és a beállításai megmaradnak, a Luft pedig átveszi a rendszer helyét.
setup-destination-whole-choice = Teljes lemez használata
setup-destination-whole-choice-description = Egy lemez törlése és teljes átadása a Luftnak.
setup-destination-try-choice = Luft kipróbálása
setup-destination-try-choice-description = Előbb nézzen körül. Semmi sem települ, a lemezek érintetlenek maradnak.
setup-destination-custom-choice = Egyéni
setup-destination-custom-choice-description = Partíciók elrendezése saját kezűleg a Lemezek alkalmazásban.

setup-destination-more-options = További lehetőségek
setup-destination-starting = Indítás…
setup-destination-replace = Lecserélés
setup-destination-install = Luft telepítése

## Confirming where Luft goes

setup-confirm-replace-title = Lecseréli ezt a rendszert: { $system }?
setup-confirm-erase-title = Törli ezt a lemezt: { $drive }?
setup-confirm-shrink-title = Zsugorítja a Windowst { $size } méretűre?
setup-confirm-meet-title = Telepíti a Luftot a Windows mellé?
setup-confirm-free-title = Telepíti a Luftot a szabad helyre?
setup-confirm-replace-keep-old = A Luft azonnal elkezdi a másolást. A régi rendszer többé nem indul el, a fájljai pedig megmaradnak, amíg el nem távolítja őket.
setup-confirm-replace-erase-old = A Luft azonnal elkezdi a másolást. A régi rendszer véglegesen törlődik, a saját fájljai pedig a helyükön maradnak.
setup-confirm-erase-description = A lemezen minden véglegesen törlődik, a többi rendszert és fájlt is beleértve.
setup-confirm-install-description = A Luft azonnal elkezdi a másolást. Közben beállíthatja a fiókját.
setup-confirm-erase = Törlés és telepítés
setup-confirm-install = Telepítés

## Making room next to Windows

setup-alongside-hint = Húzással ossza el a lemezt a Windows és a Luft között: { $drive }. A Windows minden fájlja megmarad, és marad helye a bővülésre is.
setup-windows-bitlocker = A Windows BitLockerrel zárolja ezt a lemezt, ezért a Luft nem tud helyet csinálni rajta. Kapcsolja ki az eszköztitkosítást a Windowsban, vagy zsugorítsa a lemezt a Lemezkezelésben, és az Egyéni lehetőségnél válassza a szabad helyet.
setup-windows-hibernated = A Windows alvó állapotban van, vagy gyors rendszerindítással állt le, ezért a lemeze nem módosítható biztonságosan. Indítsa el a Windowst, a Leállítás kiválasztásakor tartsa lenyomva a Shift billentyűt, majd indítsa el újra a Luftot.
setup-windows-dirty = A Windows lemezét előbb gyorsan ellenőrizni kell. Indítsa el a Windowst, indítsa újra egyszer, majd indítsa el újra a Luftot.
setup-windows-full = A Windowsnak szinte a teljes lemezére szüksége van. Szabadítson fel körülbelül { $size } helyet a Windowsban, majd indítsa el újra a Luftot.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = A Windowsban becsomagolt dolgai ({ $size }) az új fiókjába kerülnek kicsomagolva.

## Windows options

setup-windows-fast-startup = Gyors rendszerindítás kikapcsolása a Windowsban
setup-windows-fast-startup-description = Így a Windows teljesen leáll, ezért a hang, a Wi-Fi és a Bluetooth tisztán indul a Luftban, a Windows lemeze pedig hozzáférhető marad.
setup-windows-clock = Pontos óra mindkét rendszerben
setup-windows-clock-description = A Windows ugyanúgy olvassa a számítógép óráját, mint a Luft, így váltáskor nem ugrik el az idő.
setup-windows-bluetooth = Bluetooth-eszközök átvétele
setup-windows-bluetooth-description = { $count ->
    [one] { $count } Windowsban párosított eszköz újrapárosítás nélkül működik majd a Luftban.
   *[other] { $count } Windowsban párosított eszköz újrapárosítás nélkül működik majd a Luftban.
}

## Choosing a drive

setup-drives-label = Lemezek
setup-drives-none = Nincs olyan lemez, amelyet a Luft használhatna. Csatlakoztasson egyet, és nézze meg újra.
setup-drive-has-windows = Rajta van: { $windows }
setup-drive-empty = Üres
setup-drive-partitions = { $count ->
    [one] { $count } partíció van rajta
   *[other] { $count } partíció van rajta
}

## Custom space

setup-custom-open-disks = Lemezek megnyitása
setup-custom-looking = Keresés…
setup-custom-look-again = Újrakeresés
setup-custom-free-label = Szabad hely
setup-custom-free-space = { $size } szabad hely
setup-custom-on-drive = Lemez: { $drive }
setup-custom-none = A Lemezek alkalmazásban hozzon létre legalább { $size } szabad helyet, majd nézze meg újra. A Luft a szabadon hagyott helyre kerül.

## Replacing a Linux system

setup-replace-stays = Ami megmarad
setup-replace-changes = Ami változik
setup-replace-keeps-account = A fájljai és a fiókja ({ $account })
setup-replace-keeps-account-password = A fájljai és a fiókja ({ $account }) a jelszavával együtt
setup-replace-keeps-accounts = { $count ->
    [one] A rajta lévő másik fiók a fájljaival együtt
   *[other] A rajta lévő további { $count } fiók a fájljaikkal együtt
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } hálózati kapcsolat a Wi-Fi-jelszavával együtt
   *[other] { $count } hálózati kapcsolat a Wi-Fi-jelszavakkal együtt
}
setup-replace-keeps-drives = { $drives }, indításkor a korábbiak szerint csatolva
setup-replace-keeps-hostname = A számítógép neve ({ $hostname }) és az SSH-kulcsai
setup-replace-keeps-tools = { $count ->
    [one] { $count } telepített parancssori eszköz, bejelentkezés után egy Toolboxban
   *[other] { $count } telepített parancssori eszköz, bejelentkezés után egy Toolboxban
}
setup-replace-keeps-old = { $system } többé nem indul el. A rendszerfájljai old-system néven megmaradnak, amíg el nem távolítja őket a Lemezek vagy a Beállítások alkalmazásban.
setup-replace-erases-system = { $system } rendszerpartíciója törlődik. A saját fájljai külön partíción vannak, és változatlanok maradnak.
setup-replace-clears-boot = A /boot partíciója kiürül, hogy elférjenek rajta a Luft indítófájljai.
setup-replace-apps = A benne telepített alkalmazások nem kerülnek át. Telepítse újra őket a Schelf alkalmazásból.

setup-replace-blocked-encrypted = Titkosítva van, ezért a fájlok megtartásával még nem cserélhető le.
setup-replace-blocked-single = A fájljai egy partíción vannak a rendszerrel, ezért a fájlok megtartásával még nem cserélhető le.
setup-replace-blocked-layout = A lemeze olyan felosztású, amelyet a Luft még nem tud lecserélni.
setup-replace-blocked-startup = Az EFI-rendszerpartíciója túl kicsi a Luft számára, és nincs helyette használható /boot partíció.
setup-replace-blocked-no-account = Nincs benne átvehető fiók.
setup-replace-blocked-running = A Luft éppen erről a rendszerről fut. A lecseréléshez indítsa a Luftot pendrive-ról.
setup-replace-blocked-read-only = A lemeze csak olvasható.

## Connecting to the internet

setup-network-title = Csatlakozás az internethez
setup-network-description = Ez nem kötelező. Ha online van, a Luft beállíthatja az órát és az időzónát, és a telepítés közben is használhatja az internetet.
setup-network-unavailable = A hálózatok most nem érhetők el. Később a tálcáról csatlakozhat.
setup-network-looking = Hálózatok keresése…
setup-network-cable = Kábellel csatlakozva
setup-network-show-all = Összes hálózat megjelenítése
setup-network-skip = Kihagyás
setup-network-failed = Nem sikerült csatlakozni
setup-network-wrong-password = Hibás jelszó
setup-network-connected = Csatlakozva
setup-network-connecting = Csatlakozás…
setup-network-saved = Mentve
setup-network-password = Jelszó
setup-network-join = Csatlakozás

## Account

setup-account-title = Ki használja ezt a számítógépet?
setup-account-description = Ezzel a fiókkal jelentkezik be. Később a Beállításokban további személyeket is hozzáadhat.
setup-account-full-name = Teljes név
setup-account-full-name-example = Neumann János
setup-account-user-name = Felhasználónév
setup-account-password = Jelszó
setup-account-repeat = Jelszó még egyszer
setup-account-user-name-invalid = Csak kisbetűket, számokat, - és _ jelet használjon
setup-account-full-name-invalid = Ne használjon vesszőt és kettőspontot
setup-account-mismatch = A jelszavak nem egyeznek

## Installing

setup-finishing-failed-title = A Luft telepítése nem sikerült
setup-finishing-failed-description = Hiba történt a telepítés közben.
setup-finishing-failed-stick = A számítógép továbbra is ugyanúgy indul, mint korábban. A Luftot tovább használhatja a pendrive-ról, vagy újraindíthatja a számítógépet, és újra megpróbálhatja.
setup-finishing-failed-trying = A számítógép továbbra is ugyanúgy indul, mint korábban. A Luftot tovább használhatja a mostani formájában, vagy újraindíthatja a számítógépet, és újra megpróbálhatja.
setup-finishing-use-stick = Luft használata a pendrive-ról
setup-finishing-keep-trying = Luft további kipróbálása
setup-finishing-installed-title = A Luft telepítése kész
setup-finishing-trust-stick = Amikor a képernyő elsötétül, vegye ki a pendrive-ot. Ezután egy kék képernyő kéri, hogy jelölje megbízhatónak a Luftot. Ott a billentyűzetet használja.
setup-finishing-trust = Közvetlenül az újraindítás után egy kék képernyő kéri, hogy jelölje megbízhatónak a Luftot. Ott a billentyűzetet használja.
setup-finishing-restart-stick = A használatához indítsa újra a számítógépet. Amikor a képernyő elsötétül, vegye ki a pendrive-ot.
setup-finishing-restart = A használatához indítsa újra a számítógépet.
setup-finishing-title = Mindjárt kész
setup-finishing-description = A Luft másolása folyamatban van. Ez néhány percig tart.
setup-finishing-plug-in = Amíg el nem készül, tartsa a számítógépet töltőn.
setup-stage-idle = Előkészítés
setup-stage-preparing = Hely készítése a Luft számára
setup-stage-copying = Luft másolása
setup-stage-waiting = Befejezés
setup-stage-configuring = Fiók beállítása
setup-stage-finished = Kész

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Nyomjon le egy billentyűt 10 másodpercen belül
setup-enroll-choose-enroll = Válassza az Enroll MOK, majd a Continue lehetőséget
setup-enroll-choose-yes = Válassza a Yes lehetőséget
setup-enroll-type-code = Írja be a kódot, majd válassza a Reboot lehetőséget
setup-enroll-digits = { $count ->
    [one] { $count } számjegy
   *[other] { $count } számjegy
}
setup-secure-boot-title = A számítógép még nem tartja megbízhatónak a Luftot
setup-secure-boot-code = Közvetlenül a következő újraindítás után egy kék képernyő kéri, hogy jelölje megbízhatónak a Luftot. Ott a billentyűzettel adja meg ezt a kódot.
setup-secure-boot-skipped = A kék képernyő kimaradt. Kérjen új kódot, indítsa újra a számítógépet, majd ott használja a billentyűzetet.
setup-secure-boot-getting = Kód lekérése…
setup-secure-boot-new-code = Új kód kérése

## Encryption

setup-protect-title = Fájlok védelme
setup-protect-tpm = Titkosítsa a számítógépet, hogy bejelentkezés nélkül senki se olvashassa a fájljait, akkor sem, ha elveszíti. Indításkor magától feloldódik.
setup-protect-passphrase = Titkosítsa a számítógépet, hogy a jelmondata nélkül senki se olvashassa a fájljait, akkor sem, ha elveszíti.
setup-protect-staged-title = A fájljai titkosítva lesznek
setup-protect-staged-description = A titkosítás a beállítás végi újraindítás után magától elindul, és közben tovább használhatja a számítógépet.
setup-protect-keep-safe = Tartsa ezt a helyreállítási kulcsot biztonságos helyen, a számítógéptől távol. Akkor lesz rá szüksége, ha a számítógép egyszer nem tudja magától feloldani a titkosítást.
setup-protect-passphrase-label = Jelmondat
setup-protect-repeat = Jelmondat még egyszer
setup-protect-mismatch = Nem egyeznek
setup-protect-kept = Elmentettem a helyreállítási kulcsot
setup-protect-background = A titkosítás a következő újraindítás után a háttérben történik, és közben tovább használhatja a számítógépet.
setup-protect-encrypt = Titkosítás
setup-protect-checking = Ellenőrzés…
setup-protect-start = Fájlok titkosítása

## Fingerprint

setup-fingerprint-title = Bejelentkezés ujjlenyomattal
setup-fingerprint-description = Jelszó beírása helyett egy érintéssel oldhatja fel a Luftot. Később a Beállításokban további ujjakat is hozzáadhat.
setup-fingerprint-which = Melyik ujj?
setup-fingerprint-another = Hozzáad egy másik ujjat?
setup-fingerprint-finger = Ujj
setup-fingerprint-no-reader = Az ujjlenyomat-olvasó nem válaszol. Ujjlenyomatot később a Beállításokban is hozzáadhat.
setup-fingerprint-add = Ujjlenyomat hozzáadása
setup-fingerprint-choose-another = Másik ujj kiválasztása

## Done

setup-ready-title = Minden kész
setup-ready-trust = A befejezéshez indítsa újra még egyszer a számítógépet. Közvetlenül az újraindítás után egy kék képernyő kéri, hogy jelölje megbízhatónak a Luftot. Ott a billentyűzettel adja meg ezt a kódot.
setup-ready-restart = A befejezéshez indítsa újra még egyszer a számítógépet, majd jelentkezzen be a jelszavával.
setup-ready-done = Az asztal készen áll. Jó szórakozást a Lufttal.
setup-ready-start = Kezdés
