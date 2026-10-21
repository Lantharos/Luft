## Messages that some steps share

meet-back = Späť
meet-cancel = Zrušiť
meet-continue = Pokračovať
meet-try-again = Skúsiť znova
meet-restart = Reštartovať
meet-remove = Odstrániť
meet-keep-it = Ponechať
meet-close = Zavrieť
meet-restart-title = Reštartovať teraz?
meet-not-yet = Ešte nie
meet-iso-use = Použiť ISO, ktoré už mám
meet-iso-using = Používa sa vaše ISO systému Luft
meet-nightly = Nočné zostavy
meet-channel-nightly = Meet Luft bude používať nočné zostavy
meet-channel-latest = Meet Luft bude znova používať vydania
meet-undo = Späť
meet-logs-saved = Denníky zo skúšania systému Luft sú uložené na pracovnej ploche
meet-logs-show = Zobraziť
meet-logs-none = Zatiaľ nie sú žiadne denníky zo skúšania systému Luft
meet-logs-failed = Aplikácii Meet Luft sa nepodarilo uložiť denníky zo skúšania systému Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Kontrolu tohto počítača sa nepodarilo dokončiť.
   *[windows] Kontrolu tohto počítača sa nepodarilo dokončiť.
}
problem-room = Uvoľňovanie miesta pre Luft sa nepodarilo dokončiť.
problem-room-linux = Prípravu systému Luft sa nepodarilo dokončiť.
problem-update = Aktualizáciu systému Luft sa nepodarilo dokončiť.
problem-download = Sťahovanie systému Luft sa zastavilo. Skontrolujte, či ste online.
problem-pack = Balenie vašich vecí sa nepodarilo dokončiť.
problem-remove = Odstránenie systému Luft sa nepodarilo dokončiť.
problem-restart = Aplikácii Meet Luft sa nepodarilo pripraviť reštart.
problem-tidy = Staré položky spúšťania sa nepodarilo odstrániť.
problem-firmware = Aplikácii Meet Luft sa nepodarilo otvoriť nastavenia firmvéru.
problem-folders = Aplikácii Meet Luft sa nepodarilo prejsť vaše priečinky.
problem-sticks = Aplikácii Meet Luft sa nepodarilo vyhľadať USB kľúče.
problem-stick = Vytvorenie USB kľúča sa nepodarilo dokončiť.
problem-offer = Luft sa teraz nedá stiahnuť. Skontrolujte, či ste online, alebo použite ISO, ktoré už máte.
problem-luft = Aplikácii Meet Luft sa nepodarilo skontrolovať disk systému Luft.
problem-resize = Zmenu veľkosti systému Luft sa nepodarilo dokončiť.
problem-cancel = Aplikácii Meet Luft sa nepodarilo zrušiť zmenu.
problem-give = Windows si nedokázal vziať miesto späť.
problem-declined = { $platform ->
    [linux] Meet Luft potrebuje vaše povolenie na prácu s diskom. Keď o to požiada, zadajte heslo.
   *[windows] Meet Luft potrebuje vaše povolenie na prácu s diskom. Keď sa Windows opýta, vyberte Áno.
}

## First screen

hello-intro = { $platform ->
    [linux] Vyskúšajte Luft priamo odtiaľto, bez USB kľúča. Keď sa vám zapáči, Luft môže nahradiť tento systém a zachovať vaše súbory.
   *[windows] Luft môže byť hneď vedľa Windows. Najprv ho vyskúšajte bez inštalácie, a keď budete pripravení, vezmite si so sebou svoje veci.
}
hello-check = { $platform ->
    [linux] Skontrolovať tento počítač
   *[windows] Skontrolovať tento počítač
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Kontrola tohto počítača
   *[windows] Kontrola tohto počítača
}
check-ready-title = { $platform ->
    [linux] Tento počítač je pripravený na Luft
   *[windows] Tento počítač je pripravený na Luft
}
check-blocked-title = Takmer hotovo
check-moment = Chvíľu to potrvá.
check-slow = Windows zisťuje, koľko miesta môže uvoľniť. Na veľkom disku to môže trvať niekoľko minút.
check-blocked-description = Skôr než sa Luft nasťahuje, treba niečo zmeniť. Postup nájdete nižšie.
check-found-description = Toto zistila aplikácia Meet Luft.
check-checking = Kontroluje sa disk, firmvér a hardvér…
check-again = Skontrolovať znova
check-action-firmware = Otvoriť nastavenia firmvéru
check-action-tidy = Upratať
check-firmware-title = Reštartovať do nastavení firmvéru?
check-firmware-description = Najprv uložte rozrobenú prácu. Zapnite tam Secure Boot, uložte zmeny a počítač sa spustí ako zvyčajne.
check-tidy-title = Odstrániť staré položky spúšťania?
check-tidy-description = Odkazujú len na systémy, ktoré tu už nie sú. Windows aj všetko ostatné sa spustí rovnako ako predtým.
check-get-ready-title = Pripraviť Luft?
check-get-ready-file = Meet Luft skopíruje Luft z vášho ISO do priečinka v tomto počítači a pridá preň položku spúšťania. Oddiely sa nemenia.
check-get-ready-download = Meet Luft stiahne Luft (asi { $size }) do priečinka v tomto počítači a pridá preň položku spúšťania. Oddiely sa nemenia.
check-get-ready-confirm = Pripraviť

## Choosing how much of the Windows drive Luft gets

room-title = Koľko miesta pre Luft?
room-description = Windows sa zmenší, aby uvoľnil miesto pre Luft. Vaše súbory vo Windows zostanú presne tam, kde sú.
room-live = Windows si nechá miesto na rast. Luft si navyše vyhradí { $size } na štart a po inštalácii toto miesto vráti.
room-make = Uvoľniť miesto
room-confirm-title = Dať systému Luft { $size }?
room-confirm-file = Windows zmenší svoj disk a potom Meet Luft skopíruje Luft z vášho ISO. Nechajte počítač pripojený k napájaniu.
room-confirm-download = Windows zmenší svoj disk a potom Meet Luft stiahne Luft (asi { $size }). Nechajte počítač pripojený k napájaniu a online.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kam umiestniť Luft?
room-places-description = Luft môže zdieľať disk so systémom Windows alebo využiť miesto, ktoré Windows nepoužíva.
room-places-label = Miesta pre Luft
room-place-windows = Vedľa Windows
room-place-windows-detail = Windows sa zmenší, aby uvoľnil miesto pre Luft
room-place-windows-free = Už je tam voľných { $size }
room-place-free = Voľné miesto na disku { $drive }
room-place-free-here = Voľné miesto na disku systému Windows
room-place-free-detail = { $size } miesta, ktoré nič iné nepoužíva
room-place-whole = Celý disk { $drive }
room-place-whole-detail = Tento disk ({ $size }) sa pre Luft vymaže
room-live-free = Z toho je už voľných { $free }, takže Windows uvoľní menej a ponechá si miesto na rast. Luft si navyše vyhradí { $size } na štart a po inštalácii toto miesto vráti.
room-live-elsewhere = Luft tam dostane { $room } a navyše si vyhradí ďalších { $size } na štart. Po inštalácii toto miesto vráti.
room-confirm-free-title = Dať systému Luft { $size } voľného miesta?
room-confirm-free-file = Meet Luft doň skopíruje Luft z vášho ISO. Nič iné sa na disku nezmení.
room-confirm-free-download = Meet Luft doň stiahne Luft (asi { $size }). Nič iné sa na disku nezmení. Nechajte počítač online.
room-erase-title = Vymazať { $drive }?
room-erase-description = Všetko na tomto disku ({ $size }) sa vymaže hneď, ešte pred spustením systému Luft. Túto akciu nie je možné vrátiť. Momentálne je na ňom:
room-erase-empty = Windows na tomto disku ({ $size }) nič neprečíta, ale všetko, čo na ňom je, sa hneď vymaže. Túto akciu nie je možné vrátiť.
room-erase-unnamed = Oddiel bez názvu
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrovaný nástrojom BitLocker
room-erase-understood = Viem, že časť z toho je šifrovaná nástrojom BitLocker a nebude sa dať obnoviť
room-erase-confirm = Vymazať a uvoľniť miesto

## Luft is ready on Windows

ready-title = Luft je pripravený
ready-description = Vyberte, ako sa s ním chcete zoznámiť. Potom sa Windows spustí ako zvyčajne, ak Luft nenainštalujete a nevyberiete.
ready-update-title = Získať najnovší Luft
ready-update-description = Vyšla novšia zostava. Nahradí túto a zachová uvoľnené miesto aj všetko, čo ste zbalili.
ready-try-title = Vyskúšať Luft
ready-try-description = Reštartovať do systému Luft bez inštalácie. Nabudúce sa Windows spustí ako zvyčajne.
ready-box-description = Zbaľte dokumenty, fotky, siete Wi-Fi a ďalšie veci, aby ich Luft po inštalácii rozbalil.
ready-box-packed = Zbalené, { $size }
ready-install-title = Inštalovať Luft
ready-install-description = Reštartovať do inštalátora. Miesto vedľa Windows ({ $size }) už naň čaká.
ready-install-drive-description = Reštartovať do inštalátora. Miesto na disku { $drive } ({ $size }) už naň čaká.
ready-stick-description = Nahrajte Luft na USB kľúč a spustite ho na akomkoľvek počítači.
ready-remove = Odstrániť Luft z tohto počítača
ready-restart-try = Najprv uložte rozrobenú prácu. Luft sa otvorí asi o minútu a po ďalšom reštarte budete späť vo Windows.
ready-restart-install = Najprv uložte rozrobenú prácu. Inštalátor sa otvorí asi o minútu a nič sa nezmení, kým to v ňom nepotvrdíte.
ready-fast-startup-title = Vypnúť rýchle spustenie vo Windows
ready-fast-startup-description = Windows sa potom vypína úplne, takže zvuk, Wi-Fi a Bluetooth sa v systéme Luft spustia odznova.
ready-clock-title = Správny čas v oboch systémoch
ready-clock-description = Windows bude čítať hodiny počítača rovnako ako Luft, takže čas pri prepnutí už nebude skákať.
ready-remove-title = Odstrániť Luft z tohto počítača?
ready-remove-description = Aplikácia Meet Luft odstráni všetko, čo pridala, vrátane sťahovacej krabice, a vráti Windows všetko jeho miesto.

## Luft is ready on Linux

linux-ready-description = Vyberte, ako sa s ním chcete zoznámiť. Kým sa nerozhodnete inak, bude sa ďalej spúšťať { $system }.
linux-ready-this-system = tento systém
linux-ready-update-description = Vyšla novšia zostava. Nahradí tú, ktorú uchováva Meet Luft, a zachová denníky zo skúšania.
linux-ready-try-description = Reštartovať do systému Luft bez akýchkoľvek zmien. Nabudúce sa ako zvyčajne spustí { $system }.
linux-ready-replace-title = Nahradiť systém { $system }
linux-ready-replace-description = Luft zaujme jeho miesto a zachová vaše súbory, účet, siete Wi-Fi a ďalšie disky. Starý systém zostane, kým ho neodstránite.
linux-ready-install-description = Reštartovať do inštalátora a dať Luft na iný disk alebo do voľného miesta.
linux-ready-remove = Odstrániť Luft z tohto počítača
linux-ready-restart-try = Najprv uložte rozrobenú prácu. Luft sa otvorí asi o minútu a po ďalšom reštarte sa vráti { $system }.
linux-ready-restart-replace = Najprv uložte rozrobenú prácu. Inštalátor sa otvorí s vybraným systémom { $system } na nahradenie a ukáže, čo zostane, skôr než sa čokoľvek zmení.
linux-ready-remove-title = Odstrániť Luft z tohto počítača?
linux-ready-remove-description = Meet Luft odstráni súbory systému Luft, jeho spúšťacie súbory a položku spúšťania. Všetko ostatné zostane, ako je.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Váš Luft
luft-looking = Aplikácia Meet Luft našla v tomto počítači Luft.
luft-checking = Kontroluje sa disk systému Luft…
luft-description-beside = Luft je v tomto počítači nainštalovaný vedľa Windows.
luft-description-drive = Luft je nainštalovaný na disku { $drive }.
luft-bar-used = { $size }, využité { $used }
luft-resize-title = Zmeniť veľkosť systému Luft
luft-resize-description = Dajte systému Luft viac miesta z Windows alebo časť miesta vráťte systému Windows.
luft-resize-drive-description = Dajte systému Luft viac voľného miesta na disku { $drive } alebo jeho časť nechajte voľnú.
luft-resize-reencrypting = Luft ešte šifruje alebo dešifruje svoj disk. Keď skončí, bude možné zmeniť jeho veľkosť.
luft-resize-passphrase = Disk systému Luft sa otvára iba prístupovou frázou a Luft ju počas presunu nemôže zadať sám.
luft-resize-start-first = Raz spustite Luft, aby mohol aplikácii Meet Luft oznámiť, aký je zaplnený, a potom sa sem vráťte.
luft-resize-apart = Medzi Windows a systémom Luft je ďalší oddiel, takže si nemôžu deliť miesto.
luft-pending-grow = Luft sa zväčší pri ďalšom spustení
luft-pending-grow-description = Reštartujte do systému Luft a nechajte ho niekoľko minút zapnutý, kým sa presunie do nového miesta. Medzitým ho môžete používať.
luft-pending-shrink = Luft uvoľní miesto pri ďalšom spustení
luft-pending-shrink-description = Reštartujte do systému Luft a nechajte ho niekoľko minút zapnutý, kým presunie svoje súbory. Potom vo Windows znova otvorte Meet Luft, aby Windows dostal toto miesto.
luft-pending-trim = Luft sa zmenší pri ďalšom spustení
luft-pending-trim-description = Reštartujte do systému Luft a zhruba do minúty sa zmenší.
luft-windows-free-title = Dať voľné miesto systému Windows
luft-windows-free-description = Miesto hneď za Windows ({ $size }) nič nepoužíva. Windows si ho môže vziať späť.
luft-leftovers-title = Upratať po skúšaní systému Luft
luft-leftovers-description = Oddiely, ktoré aplikácia Meet Luft vytvorila na spustenie systému Luft, tu stále sú. Luft ich už nepotrebuje.
luft-start = Reštartovať do systému Luft
luft-cancel = Zrušiť zmenu
luft-restart = Najprv uložte rozrobenú prácu. Luft sa spustí asi o minútu a po ďalšom reštarte budete späť vo Windows.
luft-restart-pending = Najprv uložte rozrobenú prácu. Luft sa spustí asi o minútu a sám presunie svoje súbory, čo potrvá niekoľko minút. Medzitým ho môžete používať.
luft-remove = Odstrániť Luft z tohto počítača
luft-remove-title = Odstrániť Luft z tohto počítača?
luft-remove-description = Luft aj všetko v ňom sa vymaže, spolu { $size }, a Windows dostane miesto späť. Počítač bude spúšťať Windows ako predtým. Túto akciu nie je možné vrátiť.
luft-remove-drive-description = Luft aj všetko v ňom sa vymaže z disku { $drive }, spolu { $size }. Počítač bude spúšťať Windows ako predtým. Túto akciu nie je možné vrátiť.
luft-remove-confirm = Odstrániť Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Koľko miesta pre Luft?
resize-description = Potiahnutím rozdeľte disk medzi Windows a Luft. Luft zmenu urobí sám pri ďalšom spustení.
resize-measuring = Windows zisťuje, koľko miesta môže uvoľniť. Na veľkom disku to môže trvať niekoľko minút.
resize-full = Luft je na presun príliš plný a Windows mu nemôže uvoľniť dosť miesta. Najprv uvoľnite miesto v systéme Luft alebo vo Windows.
resize-drive-description = Potiahnutím vyberte, koľko z disku { $drive } Luft zaberie. Luft zmenu urobí sám pri ďalšom spustení.
resize-drive-free = Voľné miesto na disku { $drive }: { $size }
resize-used = Súbory systému Luft zaberajú { $size }.
resize-least = Zmeňte veľkosť aspoň o { $size }.
resize-apply = Zmeniť
resize-grow-title = Dať systému Luft o { $size } viac?
resize-grow-description = Windows sa hneď zmenší. Luft sa pri ďalšom spustení presunie do nového miesta, čo potrvá niekoľko minút. Nechajte počítač pripojený k napájaniu.
resize-grow-drive-description = Luft pri ďalšom spustení zaberie voľné miesto na disku { $drive }, čo potrvá len chvíľu.
resize-trim-title = Zmenšiť systém Luft o { $size }?
resize-trim-description = Luft sa pri ďalšom spustení zmenší a uvoľnené miesto zostane voľné na disku { $drive }.
resize-shrink-title = Vrátiť systému Windows { $size }?
resize-shrink-description = Luft pri ďalšom spustení presunie svoje súbory, čo potrvá niekoľko minút. Potom znova otvorte Meet Luft a Windows si miesto vezme späť. Nechajte počítač pripojený k napájaniu.

## Packing things to take along to Luft (the moving box)

box-title = Vezmite si svoje veci
box-description = Vyberte, čo si vziať so sebou. Luft to po inštalácii rozbalí do vášho nového účtu a z Windows sa nič neodstráni.
box-looking = Prechádzajú sa priečinky…
box-folder-desktop = Pracovná plocha
box-folder-documents = Dokumenty
box-folder-downloads = Stiahnuté súbory
box-folder-music = Hudba
box-folder-pictures = Obrázky
box-folder-videos = Videá
box-folder-size = { $size }, { $files ->
    [one] { $files } súbor
    [few] { $files } súbory
    [many] { $files } súboru
   *[other] { $files } súborov
}
box-wifi-title = Siete Wi-Fi
box-wifi-description = Aj s heslami, takže Luft bude hneď online
box-bluetooth-title = Zariadenia Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } zariadenie, pripravené bez nového párovania
    [few] { $devices } zariadenia, pripravené bez nového párovania
    [many] { $devices } zariadenia, pripravené bez nového párovania
   *[other] { $devices } zariadení, pripravených bez nového párovania
}
box-wallpaper-title = Pozadie
box-wallpaper-description = Obrázok na pracovnej ploche Windows
box-account-title = Vaše meno a obrázok
box-total-slow = { $size }, balenie potrvá asi { $minutes ->
    [one] { $minutes } minútu
    [few] { $minutes } minúty
    [many] { $minutes } minúty
   *[other] { $minutes } minút
}
box-pack = Zbaliť

## Progress while Meet Luft works

working-shrinking = Uvoľňuje sa miesto
    .description = Windows presúva svoje súbory, aby uvoľnil miesto. Môže to trvať niekoľko minút.
working-erasing = Vymazáva sa disk
    .description = Windows ho vyprázdni, aby ho Luft mohol mať celý.
working-partitioning = Pripravuje sa miesto pre Luft
    .description = Pripravujú sa oddiely, z ktorých sa Luft spúšťa.
working-downloading = Prenáša sa Luft
    .description = Luft sa kopíruje priamo na svoje miesto a cestou sa kontroluje.
working-packing = Balia sa vaše veci
    .description = Všetko, čo ste vybrali, sa kopíruje do sťahovacej krabice. Veľké priečinky chvíľu trvajú.
working-removing = Odstraňuje sa Luft
    .description = Miesto sa vracia systému Windows.
working-removing-linux = Odstraňuje sa Luft
    .description = Odstraňujú sa jeho súbory a položka spúšťania.
working-writing = Vytvára sa USB kľúč
    .description = Luft sa zapisuje na celý USB kľúč. Nechajte ho pripojený.
working-copying = Pridáva sa Luft do Ventoy
    .description = Luft sa kopíruje vedľa ostatných ISO na USB kľúči. Nechajte ho pripojený.
working-verifying = Kontroluje sa USB kľúč
    .description = Všetko sa číta späť, aby bolo isté, že sa z neho dá spustiť.
working-stick-downloading = Sťahuje sa Luft
    .description = Cestou sa kontroluje a uchová sa, takže ďalší USB kľúč bude rýchlejší.
working-progress = { $done } z { $total }
working-keep-open = Nechajte toto okno otvorené.

## After Luft was removed

removed-title = Všetko je ako predtým
removed-description = { $platform ->
    [linux] Súbory systému Luft aj jeho položka spúšťania sú preč a počítač sa spúšťa rovnako ako predtým. Vráťte sa kedykoľvek.
   *[windows] Oddiely systému Luft aj jeho položka spúšťania sú preč a Windows má znova všetko svoje miesto. Vráťte sa kedykoľvek.
}

## Making a USB stick

stick-title = Vytvoriť USB kľúč
stick-description = Luft sa z neho spustí na akomkoľvek počítači, aby ste ho mohli vyskúšať alebo nainštalovať.
stick-looking = Hľadajú sa USB kľúče…
stick-none = Pripojte USB kľúč s kapacitou aspoň { $size }. Zobrazí sa tu.
stick-drives-label = USB kľúče
stick-offer = { $name }, { $size }
stick-make = Vytvoriť USB kľúč
stick-drive-empty = Prázdny
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Pre Luft príliš malý
stick-ventoy-title = Tento USB kľúč používa Ventoy
stick-ventoy-description = Pridať naň Luft, alebo celý USB kľúč vymazať a urobiť z neho kľúč s Luftom?
stick-erase-it = Vymazať
stick-add = Pridať Luft
stick-replace-title = Nahradiť Luft, ktorý na ňom je?
stick-replace-description = { $count ->
    [one] Na tomto USB kľúči už je { $names }. Nový Luft môže zaujať jeho miesto.
    [few] Na tomto USB kľúči už sú { $names }. Nový Luft môže zaujať ich miesto.
    [many] Na tomto USB kľúči už sú { $names }. Nový Luft môže zaujať ich miesto.
   *[other] Na tomto USB kľúči už sú { $names }. Nový Luft môže zaujať ich miesto.
}
stick-keep = { $count ->
    [one] Ponechať oba
    [few] Ponechať všetky
    [many] Ponechať všetky
   *[other] Ponechať všetky
}
stick-replace = Nahradiť
stick-full-title = Na Luft tu nie je miesto
stick-full-description = Luft potrebuje { $needed } a na tomto USB kľúči je voľných { $free }. Uvoľnite na ňom miesto alebo ho vymažte a urobte z neho kľúč s Luftom.
stick-erase-title = Vymazať { $name }?
stick-erase-description = Všetko na tomto USB kľúči ({ $size }) sa vymaže a nahradí systémom Luft. Túto akciu nie je možné vrátiť.
stick-erase-confirm = Vymazať a vytvoriť USB kľúč
stick-done-title = Váš USB kľúč s Luftom je pripravený
stick-done-ventoy-title = Luft je na vašom USB kľúči s Ventoy
stick-done-take-out = Teraz ho môžete vytiahnuť.
stick-done-eject = Pred vytiahnutím ho vysuňte.
stick-done-start = Ak z neho chcete spustiť počítač, pripojte ho a vyberte ho v ponuke spúšťania, ktorá sa otvára klávesom ako F12, F8 alebo Esc hneď po zapnutí.
stick-done-ventoy-key = So zapnutým Secure Boot Ventoy pri prvom spustení raz požiada o zaregistrovanie vlastného kľúča.
stick-done = Hotovo
stick-done-another = Vytvoriť ďalší
