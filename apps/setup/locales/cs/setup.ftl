## Buttons used across steps

setup-continue = Pokračovat
setup-back = Zpět
setup-cancel = Zrušit
setup-not-now = Teď ne
setup-try-again = Zkusit znovu
setup-restart = Restartovat
setup-restart-now = Restartovat teď
setup-restart-later = Restartovat později
setup-saving = Ukládání…

## Install progress, shown at the bottom of every step while Luft copies

setup-installing-label = Instalace Luftu
setup-installing-progress = Instalace, { $progress }

## Choosing from a list (language, keyboard, time zone)

setup-picker-search = Hledat
setup-picker-no-match = Nic neodpovídá

## Welcome step: language, keyboard and time zone

setup-region-title = Vítejte v Luftu
setup-region-language = Jazyk
setup-region-keyboard = Klávesnice
setup-region-time-zone = Časové pásmo
setup-region-intro = Na začátek vyberte jazyk, klávesnici a časové pásmo.
setup-region-intro-guessed-computer = Na začátek jsme podle počítače odhadli tato nastavení. Upravte, co nesedí.
setup-region-intro-guessed = Na začátek jsme odhadli { $guesses }. Upravte, co nesedí.
setup-region-guess-from-computer = { $fields } podle počítače
setup-region-guess-from-network = { $fields } podle sítě
setup-region-field-language = jazyk
setup-region-field-keyboard = klávesnici
setup-region-field-time-zone = časové pásmo

## Where Luft goes

setup-destination-choose-title = Kam Luft nainstalovat?
setup-destination-choose-description = Vyberte, jak se Luft do tohoto počítače vejde. Dokud volbu nepotvrdíte, nic se nezmění.
setup-destination-alongside-title = Uvolnit místo vedle Windows
setup-destination-alongside-description = Systém Windows se zmenší, aby se uvolnilo místo pro Luft. Vaše soubory ve Windows zůstanou, jak jsou.
setup-destination-whole-title = Vyberte disk
setup-destination-whole-description = Luft zabere celý disk. Vše, co na něm je, se vymaže.
setup-destination-custom-title = Vyberte místo pro Luft
setup-destination-custom-description = V aplikaci Disky si disky uspořádejte podle sebe.
setup-destination-replace-title = Nahradit systém { $system }
setup-destination-replace-description = Luft nastoupí na jeho místo a zachová to, co je vaše.
setup-destination-meet-title = Vedle Windows
setup-destination-meet-description = Aplikace Meet Luft už místo připravila, takže systém Windows zůstane přesně tak, jak je.
setup-destination-meet-drive-title = Na disku { $drive }
setup-destination-meet-drive-description = Aplikace Meet Luft už místo připravila na jiném disku a Luft se odtud spouští s vlastními spouštěcími soubory.
setup-destination-looking = Prohlížení disků…

setup-destination-meet-choice = Vedle Windows
setup-destination-meet-choice-description = Použít { $size }, které vedle Windows připravila aplikace Meet Luft.
setup-destination-meet-drive-choice = Na disku { $drive }
setup-destination-meet-drive-choice-description = Použít { $size }, které na disku { $drive } připravila aplikace Meet Luft.
setup-destination-alongside-choice = Vedle systému { $windows }
setup-destination-alongside-choice-description = Ponechat systém Windows i jeho soubory a dát Luftu část jeho disku.
setup-destination-replace-choice = Nahradit systém { $system }
setup-destination-replace-choice-description = Ponechat vaše soubory, účet i nastavení a nechat Luft nastoupit na jeho místo.
setup-destination-whole-choice = Použít celý disk
setup-destination-whole-choice-description = Vymazat disk a celý ho dát Luftu.
setup-destination-try-choice = Luft jen vyzkoušet
setup-destination-try-choice-description = Nejdřív se rozhlédněte. Nic se nenainstaluje a disky zůstanou nedotčené.
setup-destination-custom-choice = Vlastní
setup-destination-custom-choice-description = Uspořádat oddíly sami v aplikaci Disky.

setup-destination-more-options = Další možnosti
setup-destination-starting = Spouštění…
setup-destination-replace = Nahradit
setup-destination-install = Instalovat Luft

## Confirming where Luft goes

setup-confirm-replace-title = Nahradit systém { $system }?
setup-confirm-erase-title = Vymazat { $drive }?
setup-confirm-shrink-title = Zmenšit systém Windows na { $size }?
setup-confirm-meet-title = Nainstalovat Luft vedle Windows?
setup-confirm-meet-drive-title = Nainstalovat Luft na disk { $drive }?
setup-confirm-free-title = Nainstalovat Luft do volného místa?
setup-confirm-replace-keep-old = Kopírování začne hned. Starý systém se už nespustí a jeho soubory zůstanou, dokud je neodstraníte.
setup-confirm-replace-erase-old = Kopírování začne hned. Starý systém se nevratně vymaže a vaše soubory zůstanou, kde jsou.
setup-confirm-erase-description = Vše na tomto disku se nevratně vymaže, včetně jiných systémů a souborů.
setup-confirm-install-description = Kopírování začne hned. Mezitím si můžete nastavit účet.
setup-confirm-erase = Vymazat a instalovat
setup-confirm-install = Instalovat

## Making room next to Windows

setup-alongside-hint = Tažením rozdělte { $drive } mezi Windows a Luft. Systém Windows si ponechá všechny soubory a trochu místa navíc.
setup-windows-bitlocker = Systém Windows má tento disk zamčený nástrojem BitLocker, takže na něm Luft nemůže uvolnit místo. Ve Windows vypněte šifrování zařízení, nebo disk zmenšete ve Správě disků a v části Vlastní vyberte volné místo.
setup-windows-hibernated = Systém Windows je uspaný nebo byl vypnutý s rychlým spuštěním, takže jeho disk nejde bezpečně změnit. Spusťte Windows, při volbě Vypnout držte Shift a pak znovu spusťte Luft.
setup-windows-dirty = Disk systému Windows je potřeba nejdřív rychle zkontrolovat. Spusťte Windows, jednou ho restartujte a pak znovu spusťte Luft.
setup-windows-full = Systém Windows potřebuje skoro celý svůj disk. Uvolněte ve Windows asi { $size } a pak znovu spusťte Luft.

## Room made by Meet Luft

setup-meet-room-luft = Luft, { $size }
setup-meet-room-packed = Věci, které jste si ve Windows zabalili ({ $size }), se rozbalí do vašeho nového účtu.

## Windows options

setup-windows-fast-startup = Vypnout rychlé spuštění ve Windows
setup-windows-fast-startup-description = Systém Windows se pak vypíná úplně, takže zvuk, Wi-Fi a Bluetooth v Luftu startují načisto a jeho disk zůstane přístupný.
setup-windows-clock = Správný čas v obou systémech
setup-windows-clock-description = Systém Windows bude číst hodiny počítače stejně jako Luft, takže čas při přepnutí nebude poskakovat.
setup-windows-bluetooth = Převzít zařízení Bluetooth
setup-windows-bluetooth-description = { $count ->
    [one] { $count } zařízení spárované ve Windows bude v Luftu fungovat bez nového párování.
    [few] { $count } zařízení spárovaná ve Windows budou v Luftu fungovat bez nového párování.
    [many] { $count } zařízení spárovaného ve Windows bude v Luftu fungovat bez nového párování.
   *[other] { $count } zařízení spárovaných ve Windows bude v Luftu fungovat bez nového párování.
}

## Choosing a drive

setup-drives-label = Disky
setup-drives-none = Není tu žádný disk, který by Luft mohl použít. Připojte nějaký a zkuste to znovu.
setup-drive-has-windows = Obsahuje { $windows }
setup-drive-empty = Prázdný
setup-drive-partitions = { $count ->
    [one] Má { $count } oddíl
    [few] Má { $count } oddíly
    [many] Má { $count } oddílu
   *[other] Má { $count } oddílů
}

## Custom space

setup-custom-open-disks = Otevřít Disky
setup-custom-looking = Hledání…
setup-custom-look-again = Hledat znovu
setup-custom-free-label = Volné místo
setup-custom-free-space = Volné místo: { $size }
setup-custom-on-drive = Na disku { $drive }
setup-custom-none = V aplikaci Disky uvolněte alespoň { $size } a zkuste to znovu. Luft se nainstaluje do místa, které necháte volné.

## Replacing a Linux system

setup-replace-stays = Co zůstane
setup-replace-changes = Co se změní
setup-replace-keeps-account = Vaše soubory a váš účet { $account }
setup-replace-keeps-account-password = Vaše soubory a váš účet { $account } i s heslem
setup-replace-keeps-accounts = { $count ->
    [one] Další účet v systému i s jeho soubory
    [few] Další { $count } účty v systému i s jejich soubory
    [many] Dalších { $count } účtu v systému i s jejich soubory
   *[other] Dalších { $count } účtů v systému i s jejich soubory
}
setup-replace-keeps-networks = { $count ->
    [one] { $count } síťové připojení i s heslem k Wi-Fi
    [few] { $count } síťová připojení i s hesly k Wi-Fi
    [many] { $count } síťového připojení i s hesly k Wi-Fi
   *[other] { $count } síťových připojení i s hesly k Wi-Fi
}
setup-replace-keeps-drives = { $drives } – připojované při spuštění jako dřív
setup-replace-keeps-hostname = Název počítače { $hostname } a jeho klíče SSH
setup-replace-keeps-tools = { $count ->
    [one] { $count } nainstalovaný nástroj příkazového řádku, po přihlášení v prostředí Toolbox
    [few] { $count } nainstalované nástroje příkazového řádku, po přihlášení v prostředí Toolbox
    [many] { $count } nainstalovaného nástroje příkazového řádku, po přihlášení v prostředí Toolbox
   *[other] { $count } nainstalovaných nástrojů příkazového řádku, po přihlášení v prostředí Toolbox
}
setup-replace-keeps-old = { $system } se přestane spouštět. Jeho systémové soubory zůstanou jako old-system, dokud je neodstraníte v aplikaci Disky nebo v Nastavení.
setup-replace-erases-system = Systémový oddíl, na kterém je { $system }, se vymaže. Vaše soubory jsou na vlastním oddílu a zůstanou, jak jsou.
setup-replace-clears-boot = Jeho oddíl /boot se vyprázdní pro spouštěcí soubory Luftu.
setup-replace-apps = Aplikace v něm nainstalované se nepřenesou. Znovu je získáte v aplikaci Schelf.

setup-replace-blocked-encrypted = Systém je zašifrovaný, takže nahrazení se zachováním souborů zatím není podporované.
setup-replace-blocked-single = Vaše soubory sdílejí jeden oddíl se systémem, takže nahrazení se zachováním souborů zatím není podporované.
setup-replace-blocked-layout = Jeho disk je uspořádaný tak, že ho Luft zatím neumí nahradit.
setup-replace-blocked-startup = Jeho systémový oddíl EFI je pro Luft příliš malý a není tu ani oddíl /boot, který by šel použít místo něj.
setup-replace-blocked-no-account = Nemá žádný účet, který by šel převzít.
setup-replace-blocked-running = Luft se z něj právě spouští. Chcete-li ho nahradit, spusťte Luft z flash disku.
setup-replace-blocked-read-only = Jeho disk je jen pro čtení.

## Connecting to the internet

setup-network-title = Připojte se k internetu
setup-network-description = Není to nutné. Online si Luft nastaví hodiny a časové pásmo a během instalace můžete používat internet.
setup-network-unavailable = Sítě teď nejsou k dispozici. Připojit se můžete později z hlavního panelu.
setup-network-looking = Hledání sítí…
setup-network-cable = Připojeno kabelem
setup-network-show-all = Zobrazit všechny sítě
setup-network-skip = Přeskočit
setup-network-failed = Nepodařilo se připojit
setup-network-wrong-password = Nesprávné heslo
setup-network-connected = Připojeno
setup-network-connecting = Připojování…
setup-network-saved = Uloženo
setup-network-password = Heslo
setup-network-join = Připojit

## Account

setup-account-title = Kdo bude tento počítač používat?
setup-account-description = Tímto účtem se budete přihlašovat. Další lidi můžete později přidat v Nastavení.
setup-account-full-name = Vaše jméno
setup-account-full-name-example = Božena Němcová
setup-account-user-name = Uživatelské jméno
setup-account-password = Heslo
setup-account-repeat = Zadejte ho znovu
setup-account-user-name-invalid = Použijte malá písmena, číslice, - a _
setup-account-full-name-invalid = Vynechte čárky a dvojtečky
setup-account-mismatch = Hesla se neshodují

## Installing

setup-finishing-failed-title = Luft se nepodařilo nainstalovat
setup-finishing-failed-description = Při instalaci se něco pokazilo.
setup-finishing-failed-stick = Počítač se dál spouští stejně jako předtím. Můžete dál používat Luft z flash disku, nebo restartovat a zkusit to znovu.
setup-finishing-failed-trying = Počítač se dál spouští stejně jako předtím. Můžete dál používat Luft tak, jak je, nebo restartovat a zkusit to znovu.
setup-finishing-use-stick = Používat Luft z flash disku
setup-finishing-keep-trying = Dál zkoušet Luft
setup-finishing-installed-title = Luft je nainstalovaný
setup-finishing-trust-stick = Jakmile obrazovka ztmavne, vytáhněte flash disk. Potom se modrá obrazovka zeptá, jestli Luftu důvěřovat. Ovládejte ji klávesnicí.
setup-finishing-trust = Hned po restartu se modrá obrazovka zeptá, jestli Luftu důvěřovat. Ovládejte ji klávesnicí.
setup-finishing-restart-stick = Restartujte a můžete začít. Jakmile obrazovka ztmavne, vytáhněte flash disk.
setup-finishing-restart = Restartujte a můžete začít.
setup-finishing-title = Skoro hotovo
setup-finishing-description = Luft se kopíruje do počítače. Potrvá to několik minut.
setup-finishing-plug-in = Dokud se to nedokončí, nechte počítač připojený k napájení.
setup-stage-idle = Příprava
setup-stage-preparing = Uvolňování místa pro Luft
setup-stage-copying = Kopírování Luftu
setup-stage-waiting = Dokončování
setup-stage-configuring = Nastavování účtu
setup-stage-finished = Hotovo

## Trusting Luft at startup (Secure Boot key enrollment)
## The firmware screens in these steps are in English, so keep the names of its
## menu items (Enroll MOK, Continue, Yes, Reboot) as they are.

setup-enroll-press-key = Do 10 sekund stiskněte libovolnou klávesu
setup-enroll-choose-enroll = Vyberte Enroll MOK a potom Continue
setup-enroll-choose-yes = Vyberte Yes
setup-enroll-type-code = Zadejte kód a vyberte Reboot
setup-enroll-digits = { $count ->
    [one] { $count } číslice
    [few] { $count } číslice
    [many] { $count } číslice
   *[other] { $count } číslic
}
setup-secure-boot-title = Počítač zatím Luftu nedůvěřuje
setup-secure-boot-code = Hned po příštím restartu se modrá obrazovka zeptá, jestli Luftu důvěřovat. Ovládejte ji klávesnicí a zadejte tento kód.
setup-secure-boot-skipped = Modrá obrazovka byla přeskočena. Získejte nový kód, restartujte a ovládejte ji klávesnicí.
setup-secure-boot-getting = Získávání kódu…
setup-secure-boot-new-code = Získat nový kód

## Encryption

setup-protect-title = Ochrana souborů
setup-protect-tpm = Zašifrujte tento počítač, aby nikdo nemohl číst vaše soubory bez přihlášení, ani když počítač ztratíte. Při spuštění se odemkne sám.
setup-protect-passphrase = Zašifrujte tento počítač, aby nikdo nemohl číst vaše soubory bez hesla k disku, ani když počítač ztratíte.
setup-protect-staged-title = Vaše soubory budou zašifrovány
setup-protect-staged-description = Šifrování začne samo po restartu na konci nastavení a počítač můžete mezitím dál používat.
setup-protect-waiting-description = Luft ještě mění svou velikost. Až to dokončí, šifrování se spustí při příštím restartu a počítač můžete mezitím dál používat.
setup-protect-keep-safe = Uložte si tento obnovovací klíč na bezpečné místo mimo tento počítač. Budete ho potřebovat, kdyby se počítač někdy nedokázal odemknout sám.
setup-protect-passphrase-label = Heslo k disku
setup-protect-repeat = Zadejte ho znovu
setup-protect-mismatch = Neshodují se
setup-protect-kept = Obnovovací klíč mám uložený
setup-protect-background = Šifrování proběhne na pozadí po příštím restartu a počítač můžete mezitím dál používat.
setup-protect-encrypt = Zašifrovat
setup-protect-checking = Kontrola…
setup-protect-start = Zašifrovat soubory

## Fingerprint

setup-fingerprint-title = Přihlašování otiskem prstu
setup-fingerprint-description = Odemykejte Luft dotykem místo zadávání hesla. Další prsty můžete později přidat v Nastavení.
setup-fingerprint-which = Který prst?
setup-fingerprint-another = Přidat další prst?
setup-fingerprint-finger = Prst
setup-fingerprint-no-reader = Čtečka otisků prstů neodpovídá. Otisk prstu můžete přidat později v Nastavení.
setup-fingerprint-add = Přidat otisk prstu
setup-fingerprint-choose-another = Vybrat jiný prst

## Done

setup-ready-title = Vše je připraveno
setup-ready-trust = Dokončete nastavení dalším restartem. Hned po něm se modrá obrazovka zeptá, jestli Luftu důvěřovat. Ovládejte ji klávesnicí a zadejte tento kód.
setup-ready-restart = Dokončete nastavení dalším restartem a pak se přihlaste heslem.
setup-ready-done = Plocha je připravená. Ať se vám s Luftem dobře pracuje.
setup-ready-start = Začít používat Luft
