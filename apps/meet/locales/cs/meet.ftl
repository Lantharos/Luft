## Messages that some steps share

meet-back = Zpět
meet-cancel = Zrušit
meet-continue = Pokračovat
meet-try-again = Zkusit znovu
meet-restart = Restartovat
meet-remove = Odebrat
meet-keep-it = Ponechat
meet-close = Zavřít
meet-restart-title = Restartovat teď?
meet-not-yet = Ještě ne
meet-iso-use = Použít ISO, které už mám
meet-iso-using = Používá se vaše ISO systému Luft
meet-nightly = Noční sestavení
meet-channel-nightly = Meet Luft bude používat noční sestavení
meet-channel-latest = Meet Luft bude znovu používat vydání
meet-undo = Zpět
meet-logs-saved = Protokoly ze zkoušení systému Luft jsou uložené na ploše
meet-logs-show = Zobrazit
meet-logs-none = Zatím nejsou žádné protokoly ze zkoušení systému Luft
meet-logs-failed = Aplikaci Meet Luft se nepodařilo uložit protokoly ze zkoušení systému Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Kontrolu tohoto počítače se nepodařilo dokončit.
   *[windows] Kontrolu tohoto počítače se nepodařilo dokončit.
}
problem-room = Uvolňování místa pro Luft se nepodařilo dokončit.
problem-room-linux = Příprava systému Luft se nepodařila dokončit.
problem-update = Aktualizaci systému Luft se nepodařilo dokončit.
problem-download = Stahování systému Luft se zastavilo. Zkontrolujte, že jste online.
problem-pack = Balení vašich věcí se nepodařilo dokončit.
problem-remove = Odebrání systému Luft se nepodařilo dokončit.
problem-restart = Aplikaci Meet Luft se nepodařilo připravit restart.
problem-tidy = Staré spouštěcí položky se nepodařilo odebrat.
problem-firmware = Aplikaci Meet Luft se nepodařilo otevřít nastavení firmwaru.
problem-folders = Aplikaci Meet Luft se nepodařilo projít vaše složky.
problem-sticks = Aplikaci Meet Luft se nepodařilo vyhledat flash disky.
problem-stick = Vytvoření flash disku se nepodařilo dokončit.
problem-offer = Luft teď nejde stáhnout. Zkontrolujte, že jste online, nebo použijte ISO, které už máte.
problem-luft = Aplikaci Meet Luft se nepodařilo zkontrolovat disk systému Luft.
problem-resize = Změnu velikosti systému Luft se nepodařilo dokončit.
problem-cancel = Aplikaci Meet Luft se nepodařilo zrušit změnu.
problem-give = Windows si nedokázaly vzít místo zpět.
problem-declined = { $platform ->
    [linux] Meet Luft potřebuje vaše svolení k práci s diskem. Až o to požádá, zadejte heslo.
   *[windows] Meet Luft potřebuje vaše svolení k práci s diskem. Až se Windows zeptají, zvolte Ano.
}

## First screen

hello-intro = { $platform ->
    [linux] Vyzkoušejte Luft přímo odsud, bez flash disku. Až se vám bude líbit, Luft může nahradit tento systém a zachovat vaše soubory.
   *[windows] Luft může být hned vedle Windows. Nejdřív ho vyzkoušejte bez instalace, a až budete připraveni, vezměte si s sebou své věci.
}
hello-check = { $platform ->
    [linux] Zkontrolovat tento počítač
   *[windows] Zkontrolovat tento počítač
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Kontrola tohoto počítače
   *[windows] Kontrola tohoto počítače
}
check-ready-title = { $platform ->
    [linux] Tento počítač je pro Luft připravený
   *[windows] Tento počítač je pro Luft připravený
}
check-blocked-title = Skoro hotovo
check-moment = Chvíli to potrvá.
check-slow = Windows zjišťují, kolik místa mohou uvolnit. Na velkém disku to může trvat několik minut.
check-blocked-description = Než se Luft může nastěhovat, je potřeba něco změnit. Postup najdete níže.
check-found-description = Tohle aplikace Meet Luft zjistila.
check-checking = Kontrola disku, firmwaru a hardwaru…
check-again = Zkontrolovat znovu
check-action-firmware = Otevřít nastavení firmwaru
check-action-tidy = Uklidit
check-firmware-title = Restartovat do nastavení firmwaru?
check-firmware-description = Nejdřív uložte rozdělanou práci. Zapněte tam Secure Boot, uložte změny a počítač se spustí jako obvykle.
check-tidy-title = Odebrat staré spouštěcí položky?
check-tidy-description = Odkazují jen na systémy, které už tu nejsou. Windows i všechno ostatní se spustí stejně jako předtím.
check-get-ready-title = Připravit Luft?
check-get-ready-file = Meet Luft zkopíruje Luft z vašeho ISO do složky v tomto počítači a přidá pro něj spouštěcí položku. Oddíly se nemění.
check-get-ready-download = Meet Luft stáhne Luft (asi { $size }) do složky v tomto počítači a přidá pro něj spouštěcí položku. Oddíly se nemění.
check-get-ready-confirm = Připravit

## Choosing how much of the Windows drive Luft gets

room-title = Kolik místa pro Luft?
room-description = Windows se zmenší, aby uvolnily místo pro Luft. Vaše soubory ve Windows zůstanou přesně tam, kde jsou.
room-live = Windows si nechají místo na růst. Luft si navíc vyhradí { $size } na start a po instalaci toto místo vrátí.
room-make = Uvolnit místo
room-confirm-title = Dát systému Luft { $size }?
room-confirm-file = Windows zmenší svůj disk a pak Meet Luft zkopíruje Luft z vašeho ISO. Nechte počítač připojený k napájení.
room-confirm-download = Windows zmenší svůj disk a pak Meet Luft stáhne Luft (asi { $size }). Nechte počítač připojený k napájení a online.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Kam umístit Luft?
room-places-description = Luft může sdílet disk se systémem Windows, nebo zabrat místo, které Windows nepoužívají.
room-places-label = Místa pro Luft
room-place-windows = Vedle Windows
room-place-windows-detail = Windows se zmenší, aby uvolnily místo pro Luft
room-place-windows-free = Už tam je volných { $size }
room-place-free = Volné místo na disku { $drive }
room-place-free-here = Volné místo na disku systému Windows
room-place-free-detail = { $size } místa, které nic jiného nepoužívá
room-place-whole = Celý disk { $drive }
room-place-whole-detail = Tento disk ({ $size }) se pro Luft vymaže
room-live-free = Z toho je už volných { $free }, takže Windows uvolní méně a nechají si místo na růst. Luft si navíc vyhradí { $size } na start a po instalaci toto místo vrátí.
room-live-elsewhere = Luft tam dostane { $room } a navíc si vyhradí dalších { $size } na start, které po instalaci vrátí.
room-confirm-free-title = Dát systému Luft { $size } volného místa?
room-confirm-free-file = Meet Luft do něj zkopíruje Luft z vašeho ISO. Nic jiného na disku se nezmění.
room-confirm-free-download = Meet Luft do něj stáhne Luft (asi { $size }). Nic jiného na disku se nezmění. Nechte počítač online.
room-erase-title = Vymazat disk { $drive }?
room-erase-description = Všechno na tomto disku ({ $size }) se vymaže hned, ještě než se Luft spustí. Tuto akci nelze vrátit. Teď na něm je:
room-erase-empty = Windows na tomto disku ({ $size }) nic nepřečtou, ale cokoli na něm je, se hned vymaže. Tuto akci nelze vrátit.
room-erase-unnamed = Oddíl bez názvu
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Šifrováno nástrojem BitLocker
room-erase-understood = Beru na vědomí, že část dat je šifrovaná nástrojem BitLocker a nepůjde obnovit
room-erase-confirm = Vymazat a uvolnit místo

## Luft is ready on Windows

ready-title = Luft je připravený
ready-description = Vyberte, jak se s ním chcete seznámit. Potom se Windows spustí jako obvykle, pokud Luft nenainstalujete a nevyberete.
ready-update-title = Získat nejnovější Luft
ready-update-description = Vyšlo novější sestavení. Nahradí to současné a zachová uvolněné místo i všechno, co jste zabalili.
ready-try-title = Vyzkoušet Luft
ready-try-description = Restartovat do systému Luft bez instalace. Příště se Windows spustí jako obvykle.
ready-box-description = Zabalte dokumenty, fotky, sítě Wi-Fi a další, aby je Luft po instalaci rozbalil.
ready-box-packed = Zabaleno, { $size }
ready-install-title = Instalovat Luft
ready-install-description = Restartovat do instalačního programu. Místo vedle Windows ({ $size }) už na něj čeká.
ready-install-drive-description = Restartovat do instalačního programu. Místo na disku { $drive } ({ $size }) už na něj čeká.
ready-stick-description = Nahrajte Luft na flash disk a spusťte ho na jakémkoli počítači.
ready-remove = Odebrat Luft z tohoto počítače
ready-restart-try = Nejdřív uložte rozdělanou práci. Luft se otevře zhruba za minutu a po dalším restartu budete zpátky ve Windows.
ready-restart-install = Nejdřív uložte rozdělanou práci. Instalační program se otevře zhruba za minutu a nic se nezmění, dokud to v něm nepotvrdíte.
ready-fast-startup-title = Vypnout rychlé spuštění ve Windows
ready-fast-startup-description = Windows se pak vypínají úplně, takže zvuk, Wi-Fi a Bluetooth se v systému Luft spustí načisto.
ready-clock-title = Správný čas v obou systémech
ready-clock-description = Windows budou číst hodiny počítače stejně jako Luft, takže čas už při přepnutí nebude skákat.
ready-remove-title = Odebrat Luft z tohoto počítače?
ready-remove-description = Aplikace Meet Luft odstraní všechno, co přidala, včetně stěhovací krabice, a vrátí Windows všechno jejich místo.

## Luft is ready on Linux

linux-ready-description = Vyberte, jak se s ním chcete seznámit. Dokud se nerozhodnete jinak, bude se dál spouštět { $system }.
linux-ready-this-system = tento systém
linux-ready-update-description = Vyšlo novější sestavení. Nahradí to, které Meet Luft uchovává, a zachová protokoly ze zkoušení.
linux-ready-try-description = Restartovat do systému Luft bez jakýchkoli změn. Příště se jako obvykle spustí { $system }.
linux-ready-replace-title = Nahradit systém { $system }
linux-ready-replace-description = Luft zaujme jeho místo a zachová vaše soubory, účet, sítě Wi-Fi a další disky. Starý systém zůstane, dokud ho neodstraníte.
linux-ready-install-description = Restartovat do instalačního programu a dát Luft na jiný disk nebo do volného místa.
linux-ready-remove = Odebrat Luft z tohoto počítače
linux-ready-restart-try = Nejdřív uložte rozdělanou práci. Luft se otevře zhruba za minutu a po dalším restartu se vrátí { $system }.
linux-ready-restart-replace = Nejdřív uložte rozdělanou práci. Instalační program se otevře s vybraným systémem { $system } k nahrazení a ukáže, co zůstane, než se cokoli změní.
linux-ready-remove-title = Odebrat Luft z tohoto počítače?
linux-ready-remove-description = Meet Luft odstraní soubory systému Luft, jeho spouštěcí soubory a spouštěcí položku. Všechno ostatní zůstane, jak je.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Váš Luft
luft-looking = Aplikace Meet Luft našla v tomto počítači Luft.
luft-checking = Kontrola disku systému Luft…
luft-description-beside = Luft je v tomto počítači nainstalovaný vedle Windows.
luft-description-drive = Luft je nainstalovaný na disku { $drive }.
luft-bar-used = { $size }, využito { $used }
luft-resize-title = Změnit velikost systému Luft
luft-resize-description = Dejte systému Luft víc místa z Windows, nebo část místa vraťte systému Windows.
luft-resize-encrypted = Disk systému Luft je šifrovaný, takže jeho přesun by vyžadoval obnovovací klíč. Nejdřív v Nastavení systému Luft vypněte šifrování zařízení a pak se vraťte.
luft-resize-apart = Mezi Windows a systémem Luft je jiný oddíl, takže nemohou sdílet místo.
luft-resize-unreadable = Aplikace Meet Luft nedokázala zjistit, jak moc je Luft zaplněný.
luft-pending-grow = Luft se zvětší při příštím spuštění
luft-pending-grow-description = Restartujte do systému Luft a nechte ho několik minut zapnutý, než se přesune do nového místa. Mezitím ho můžete používat.
luft-pending-shrink = Luft uvolní místo při příštím spuštění
luft-pending-shrink-description = Restartujte do systému Luft a nechte ho několik minut zapnutý, než přesune své soubory. Pak ve Windows znovu otevřete Meet Luft, aby Windows místo získaly.
luft-windows-free-title = Dát Windows volné místo
luft-windows-free-description = Místo hned za Windows ({ $size }) nic nepoužívá. Windows si ho mohou vzít zpět.
luft-leftovers-title = Uklidit po zkoušení systému Luft
luft-leftovers-description = Oddíly, které aplikace Meet Luft vytvořila ke spuštění systému Luft, tu stále jsou. Luft je už nepotřebuje.
luft-start = Restartovat do systému Luft
luft-cancel = Zrušit změnu
luft-restart = Nejdřív uložte rozdělanou práci. Luft se spustí zhruba za minutu a po dalším restartu budete zpátky ve Windows.
luft-restart-pending = Nejdřív uložte rozdělanou práci. Luft se spustí zhruba za minutu a sám přesune své soubory, což zabere několik minut. Mezitím ho můžete používat.
luft-remove = Odebrat Luft z tohoto počítače
luft-remove-title = Odebrat Luft z tohoto počítače?
luft-remove-description = Luft a všechno v něm se odstraní, celkem { $size }, a Windows dostanou místo zpět. Počítač bude spouštět Windows jako dřív. Tuto akci nelze vrátit.
luft-remove-drive-description = Luft a všechno v něm se odstraní z disku { $drive }, celkem { $size }. Počítač bude spouštět Windows jako dřív. Tuto akci nelze vrátit.
luft-remove-confirm = Odebrat Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Kolik místa pro Luft?
resize-description = Přetažením rozdělte disk mezi Windows a Luft. Luft změnu provede sám při příštím spuštění.
resize-measuring = Windows zjišťují, kolik místa mohou uvolnit. Na velkém disku to může trvat několik minut.
resize-full = Luft je na přesun příliš zaplněný a Windows pro něj nemohou uvolnit dost místa. Nejdřív uvolněte místo v systému Luft nebo ve Windows.
resize-used = Soubory systému Luft zabírají { $size }.
resize-least = Změňte velikost alespoň o { $size }.
resize-apply = Změnit
resize-grow-title = Dát systému Luft o { $size } víc?
resize-grow-description = Windows se zmenší hned. Luft se do nového místa přesune při příštím spuštění, což zabere několik minut. Nechte počítač připojený k napájení.
resize-shrink-title = Vrátit systému Windows { $size }?
resize-shrink-description = Luft při příštím spuštění přesune své soubory, což zabere několik minut. Pak znovu otevřete Meet Luft a Windows si místo vezmou zpět. Nechte počítač připojený k napájení.

## Packing things to take along to Luft (the moving box)

box-title = Vezměte si své věci
box-description = Vyberte, co si vzít s sebou. Luft to po instalaci rozbalí do vašeho nového účtu a z Windows se nic neodstraní.
box-looking = Procházení složek…
box-folder-desktop = Plocha
box-folder-documents = Dokumenty
box-folder-downloads = Stažené soubory
box-folder-music = Hudba
box-folder-pictures = Obrázky
box-folder-videos = Videa
box-folder-size = { $size }, { $files ->
    [one] { $files } soubor
    [few] { $files } soubory
    [many] { $files } souboru
   *[other] { $files } souborů
}
box-wifi-title = Sítě Wi-Fi
box-wifi-description = I s hesly, takže Luft bude hned online
box-bluetooth-title = Zařízení Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } zařízení, připravené bez nového párování
    [few] { $devices } zařízení, připravená bez nového párování
    [many] { $devices } zařízení, připravená bez nového párování
   *[other] { $devices } zařízení, připravených bez nového párování
}
box-wallpaper-title = Tapeta
box-wallpaper-description = Obrázek na ploše Windows
box-account-title = Vaše jméno a obrázek
box-total-slow = { $size }, balení zabere asi { $minutes ->
    [one] { $minutes } minutu
    [few] { $minutes } minuty
    [many] { $minutes } minuty
   *[other] { $minutes } minut
}
box-pack = Zabalit

## Progress while Meet Luft works

working-shrinking = Uvolňování místa
    .description = Windows přesouvají své soubory, aby uvolnily místo. Může to trvat několik minut.
working-erasing = Mazání disku
    .description = Windows ho vymažou, aby ho Luft mohl využít celý.
working-partitioning = Příprava místa pro Luft
    .description = Příprava oddílů, ze kterých se Luft spouští.
working-downloading = Přenášení systému Luft
    .description = Luft se kopíruje přímo do svého místa a cestou se kontroluje.
working-packing = Balení vašich věcí
    .description = Kopírování všeho, co jste vybrali, do stěhovací krabice. Velké složky chvíli trvají.
working-removing = Odebírání systému Luft
    .description = Vracení místa systému Windows.
working-removing-linux = Odebírání systému Luft
    .description = Odstraňování jeho souborů a spouštěcí položky.
working-writing = Vytváření flash disku
    .description = Luft se zapisuje na celý flash disk. Nechte ho připojený.
working-copying = Přidávání systému Luft do Ventoy
    .description = Luft se kopíruje vedle ostatních ISO na flash disku. Nechte ho připojený.
working-verifying = Kontrola flash disku
    .description = Zpětné čtení všech dat, aby bylo jisté, že se z něj dá spustit.
working-stick-downloading = Stahování systému Luft
    .description = Cestou se kontroluje a uchová se, takže další flash disk bude rychlejší.
working-progress = { $done } z { $total }
working-keep-open = Nechte toto okno otevřené.

## After Luft was removed

removed-title = Všechno je jako dřív
removed-description = { $platform ->
    [linux] Soubory systému Luft i jeho spouštěcí položka jsou pryč a počítač se spouští stejně jako předtím. Vraťte se kdykoli.
   *[windows] Oddíly systému Luft i jeho spouštěcí položka jsou pryč a Windows mají zase všechno své místo. Vraťte se kdykoli.
}

## Making a USB stick

stick-title = Vytvořit flash disk
stick-description = Luft se z něj spustí na jakémkoli počítači, abyste ho mohli vyzkoušet nebo nainstalovat.
stick-looking = Hledání flash disků…
stick-none = Připojte flash disk s kapacitou alespoň { $size }. Objeví se tady.
stick-drives-label = Flash disky
stick-offer = { $name }, { $size }
stick-make = Vytvořit flash disk
stick-drive-empty = Prázdný
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Pro Luft příliš malý
stick-ventoy-title = Tento flash disk používá Ventoy
stick-ventoy-description = Přidat na něj Luft, nebo celý flash disk vymazat a udělat z něj flash disk s Luftem?
stick-erase-it = Vymazat
stick-add = Přidat Luft
stick-replace-title = Nahradit Luft, který na něm je?
stick-replace-description = { $count ->
    [one] Na tomto flash disku už je { $names }. Nový Luft může zaujmout jeho místo.
    [few] Na tomto flash disku už jsou { $names }. Nový Luft může zaujmout jejich místo.
    [many] Na tomto flash disku už jsou { $names }. Nový Luft může zaujmout jejich místo.
   *[other] Na tomto flash disku už jsou { $names }. Nový Luft může zaujmout jejich místo.
}
stick-keep = { $count ->
    [one] Ponechat oba
    [few] Ponechat všechny
    [many] Ponechat všechny
   *[other] Ponechat všechny
}
stick-replace = Nahradit
stick-full-title = Na Luft tu není místo
stick-full-description = Luft potřebuje { $needed } a na tomto flash disku je volných { $free }. Uvolněte na něm místo, nebo ho vymažte a udělejte z něj flash disk s Luftem.
stick-erase-title = Vymazat { $name }?
stick-erase-description = Všechno na tomto flash disku ({ $size }) se vymaže a nahradí systémem Luft. Tuto akci nelze vrátit.
stick-erase-confirm = Vymazat a vytvořit flash disk
stick-done-title = Váš flash disk s Luftem je připravený
stick-done-ventoy-title = Luft je na vašem flash disku s Ventoy
stick-done-take-out = Teď ho můžete vytáhnout.
stick-done-eject = Před vytažením ho vysuňte.
stick-done-start = Pokud z něj chcete spustit počítač, připojte ho a vyberte ho v nabídce spouštění, která se otevře klávesou jako F12, F8 nebo Esc hned po zapnutí.
stick-done-ventoy-key = Se zapnutým Secure Bootem Ventoy při prvním spuštění jednou požádá o zaregistrování vlastního klíče.
stick-done = Hotovo
stick-done-another = Vytvořit další
