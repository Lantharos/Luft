## What Meet Luft finds when it checks a computer

check-processor-x64 = 64 bitų Intel arba AMD procesorius
check-processor-x64-detail = Luft jame veikia.
check-processor-arm = Arm procesorius
check-processor-arm-detail = Luft kol kas veikia tik su Intel ir AMD procesoriais.
check-processor-32-bit-windows = 32 bitų Windows
check-processor-32-bit-system = 32 bitų sistema
check-processor-32-bit-detail = Luft reikia 64 bitų Intel arba AMD procesoriaus.
check-startup-uefi = Paleidžiama su UEFI
check-startup-uefi-windows = Luft paleidžiama tuo pačiu moderniu būdu.
check-startup-uefi-linux = Luft prideda savo paleidimo įrašą, o { $system } toliau pasileidžia kaip dabar.
check-startup-bios = Paleidžiama senuoju BIOS režimu
check-startup-bios-windows = Luft reikia UEFI. Windows gali persijungti naudodama MBR2GPT, tada UEFI galima įjungti programinės aparatinės įrangos nustatymuose.
check-startup-bios-linux = Luft reikia UEFI. Įjunkite jį programinės aparatinės įrangos nustatymuose kartu su čia esančia sistema, tada patikrinkite dar kartą.
check-startup-mbr = Diske naudojama sena skaidinių lentelė
check-startup-mbr-windows = Luft reikia GPT disko. Windows gali jį konvertuoti naudodama MBR2GPT ir neprarasdama failų.
check-startup-mbr-linux = Luft reikia GPT disko, iš kurio pasileisti.
check-startup-no-esp = Nėra EFI sistemos skaidinio
check-startup-no-esp-detail = Luft prideda savo paleidimo failus šalia tų, kurie jau yra EFI sistemos skaidinyje, bet tokio skaidinio nėra.
check-startup-esp-full = EFI sistemos skaidinys pilnas
check-startup-esp-full-detail = Luft ten reikia { $size } MB savo paleidimo failams. Vietą paprastai užima seni branduoliai arba paleidimo įrašai.
check-folder-fine = Skaidiniai nekeičiami
check-folder-fine-detail = Luft laikoma kaip failas jūsų diske ({ $filesystem }) ir pasileidžia iš ten.
check-folder-encrypted = Jūsų failai yra šifruotame diske
check-folder-encrypted-detail = Luft kol kas negali pasileisti iš šifruoto disko. Vietoj to išbandykite ją iš USB atmintuko.
check-folder-combined = Jūsų failai išdėstyti keliuose skaidiniuose
check-folder-combined-detail = Luft kol kas negali pasileisti iš LVM ar RAID. Vietoj to išbandykite ją iš USB atmintuko.
check-folder-filesystem = Luft negali pasileisti iš failų sistemos { $filesystem }
check-folder-filesystem-detail = Ji pasileidžia iš ext4, btrfs ir XFS diskų. Vietoj to išbandykite ją iš USB atmintuko.
check-space-free = Laisva { $size } GB
check-space-free-linux = Kol ją bandote, Luft užima apie { $size } GB.
check-space-up-to = Iki { $size } GB sistemai Luft
check-space-up-to-detail = Windows išsaugo savo failus ir vietos augti.
check-space-short = Nepakanka laisvos vietos
check-space-short-windows = Luft reikia apie { $needed } GB, kuriuos Windows gali atiduoti. Atlaisvinkite sistemoje Windows { $missing } GB, pavyzdžiui, naudodami Disko valymą, tada patikrinkite dar kartą.
check-space-short-linux = Luft pasileisti reikia apie { $needed } GB. Atlaisvinkite { $missing } GB, tada patikrinkite dar kartą.
check-system-replaceable = Luft gali užimti jos vietą ir išsaugoti jūsų failus, paskyrą ir nustatymus.
check-system-single = Jūsų failai yra tame pačiame skaidinyje kaip sistema, todėl jos pakeitimas išsaugant failus dar nepalaikomas. Luft išbandymas ir diegimas veikia.
check-system-encrypted = Ji šifruota, todėl jos pakeitimas išsaugant jūsų failus dar nepalaikomas.
check-system-unknown = Jos diskas suskaidytas taip, kad Luft dar negali jos pakeisti išsaugodama jūsų failus.
check-encryption-off = Windows nešifruota
check-encryption-off-detail = Įdiegti Luft gali nuskaityti jos nustatymus ir jūsų Bluetooth įrenginius.
check-encryption-on = Windows šifruota su BitLocker
check-encryption-on-detail = Tai ne bėda. Windows pati atlaisvina vietos, o Meet Luft perkelia tai, ko Luft negali nuskaityti iš užrakinto disko. Dėl visa ko laikykite atkūrimo raktą po ranka.
check-encryption-changing = BitLocker vis dar šifruoja arba iššifruoja
check-encryption-changing-detail = Palaukite, kol Windows baigs, tada grįžkite. Eigą galite matyti Parametruose, skiltyje Įrenginio šifravimas.
check-fast-startup-on = Spartusis paleidimas įjungtas
check-fast-startup-on-detail = Windows vietoj išsijungimo užmiega, todėl jos diskas lieka užrakintas. Meet Luft prieš diegimą pasiūlys jį išjungti.
check-fast-startup-off = Spartusis paleidimas išjungtas
check-fast-startup-off-detail = Windows išsijungia visiškai.
check-secure-boot-on = Secure Boot įjungtas
check-secure-boot-on-detail = Jis gali likti įjungtas. Luft vieną kartą mėlyname ekrane paprašys pridėti savo raktą.
check-secure-boot-off = Secure Boot išjungtas
check-secure-boot-off-detail = Luft veikia ir be jo, bet žaidimams su apsauga nuo sukčiavimo jo reikia. { $turningOn }
check-secure-boot-restart-into = Meet Luft gali paleisti iš naujo į programinės aparatinės įrangos nustatymus, kur jis yra čia: { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft gali paleisti iš naujo į programinės aparatinės įrangos nustatymus, kur jis paprastai yra skiltyje Security arba Boot.
check-secure-boot-turn-on = Norėdami jį įjungti, paleiskite kompiuterį iš naujo ir, kai pasirodys gamintojo ({ $maker }) logotipas, paspauskite { $key }, tada eikite į { $place }.
check-secure-boot-turn-on-anywhere = Norėdami jį įjungti, kompiuteriui pasileidžiant atidarykite programinės aparatinės įrangos nustatymus ir ieškokite skiltyje Security arba Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, tada Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, tada Secure Boot
check-firmware-place-security-or-advanced = Security arba Advanced, tada Secure Boot Configuration
check-firmware-place-security-or-boot = Security arba Boot, tada Secure Boot
check-firmware-place-boot = Boot, tada Secure Boot
check-firmware-place-settings = Settings, tada Security, tada Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPad kompiuteriuose F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 arba Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = garsumo didinimo mygtuką

## More of the computer's hardware

check-tpm-detail = Šifruota Luft gali pati atsirakinti, kai kompiuteris pasileidžia.
check-tpm-missing = Nėra TPM 2.0
check-tpm-missing-detail = Jei užšifruosite Luft, ji kaskart pasileisdama prašys slaptafrazės.
check-graphics = Grafika
check-graphics-detail = Veikia iš karto.
check-graphics-nvidia = Luft įdiegiama su pačios NVIDIA tvarkykle.
check-wifi-missing = Nėra Wi-Fi
check-wifi-missing-detail = Sistemoje Luft naudokite tinklo kabelį arba apsieikite be tinklo.
check-wifi-detail = Veikia sistemoje Luft.
check-wifi-broadcom = Kai kuriems Broadcom Wi-Fi lustams reikia tvarkyklės, kurios Luft neturi. Laikykite po ranka tinklo kabelį arba telefoną interneto bendrinimui per USB.
check-start-entries = { $count ->
    [one] { $count } senas paleidimo įrašas
    [few] { $count } seni paleidimo įrašai
    [many] { $count } seno paleidimo įrašo
   *[other] { $count } senų paleidimo įrašų
}
check-start-entries-detail = { $count ->
    [one] { $names } rodo į sistemą, kurios šiame kompiuteryje nebėra. Jį galima sutvarkyti.
    [few] { $names } rodo į sistemas, kurių šiame kompiuteryje nebėra. Juos galima sutvarkyti.
    [many] { $names } rodo į sistemas, kurių šiame kompiuteryje nebėra. Juos galima sutvarkyti.
   *[other] { $names } rodo į sistemas, kurių šiame kompiuteryje nebėra. Juos galima sutvarkyti.
}
check-download-unavailable = Luft šiuo metu negalima atsisiųsti
check-download-unavailable-detail = Meet Luft atsisiunčia apie 3 GB. Patikrinkite interneto ryšį ir patikrinkite dar kartą arba naudokite turimą Luft ISO.

## Choosing a Luft ISO file

iso-dialog-title = Pasirinkite Luft ISO
iso-dialog-filter = Luft ISO

## Saving the logs from trying Luft

logs-file-name = Luft žurnalai { $name }
logs-no-desktop = Meet Luft nerado jūsų darbalaukio
logs-not-saved = Meet Luft nepavyko įrašyti Luft išbandymo žurnalų: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Meet Luft pagalbinė programa nepasileido: { $error }
helper-not-allowed = Meet Luft nebuvo leista dirbti su disku
helper-stopped = Meet Luft pagalbinė programa sustojo
helper-stopped-because = Meet Luft pagalbinė programa sustojo: { $error }
helper-pipe-failed = Meet Luft nepavyko susisiekti su savo pagalbine programa: { $error }
helper-pipe-hijacked = Ryšį { $pipe } atidarė kažkas kitas, ne Meet Luft pagalbinė programa
helper-record-not-saved = Meet Luft nepavyko užsirašyti, ką sukūrė: { $error }
helper-no-room-yet = Pirmiausia atlaisvinkite vietos sistemai Luft.
helper-not-ready-linux = Pirmiausia paruoškite Luft.
helper-not-ready-to-start-windows = Luft dar neparuošta paleisti. Pirmiausia atlaisvinkite jai vietos.
helper-not-ready-to-start-linux = Luft dar neparuošta paleisti. Pirmiausia ją paruoškite.
helper-update-unfinished = Luft atnaujinimas nebaigtas. Pirmiausia atnaujinkite ją dar kartą.
helper-room-too-small = Luft reikia daugiau vietos.
helper-room-shortfall = Windows gali atiduoti { $available } GB, o Luft reikia { $needed } GB.
helper-box-shortfall = Windows gali atiduoti dar { $available } GB, o pasirinktiems daiktams reikia { $needed } GB.
helper-bluetooth-unreadable = Nepavyko atidaryti Windows Bluetooth nustatymų
helper-registry-not-opened = Nepavyko atidaryti registro rakto { $key }: { $error }
helper-registry-not-changed = Nepavyko pakeisti registro reikšmės { $value }: { $error }
helper-registry-not-saved = Nepavyko įrašyti failo { $file }: { $error }
helper-restart-failed = Kompiuteris nepasileido iš naujo
helper-windows-restart-failed = Windows nepasileido iš naujo: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Šis kompiuteris nepasileidžia su UEFI
firmware-variable-unreadable = Nepavyko nuskaityti { $name } iš programinės aparatinės įrangos: { $error }
firmware-variable-not-saved = Nepavyko įrašyti { $name } į programinę aparatinę įrangą: { $error }
firmware-entries-full = Programinėje aparatinėje įrangoje nėra vietos dar vienam paleidimo įrašui
firmware-entry-kept = Windows paliko paleidimo įrašą { $entry }

## Errors about drives and partitions

drive-list-failed = Nepavyko išvardyti diskų: { $error }
drive-of-path-unknown = Nepavyko nustatyti, kuriame diske yra { $path }
drive-windows-folder-missing = Windows aplankas nerastas
drive-windows-drive-missing = Windows diskas nerastas
drive-windows-drive-missing-because = Windows diskas nerastas: { $error }
drive-windows-partition-missing = Windows skaidinys nerastas
drive-volume-missing = Tomas { $path } nerastas
drive-storage-error = { $what } (Windows saugyklos klaida { $code })
drive-shrink-size-unknown = Windows nepavyko nustatyti, kiek galima sumažinti jos skaidinį
drive-grow-size-unknown = Windows nepavyko nustatyti, kiek galima padidinti jos skaidinį
drive-resize-failed = Windows nepavyko pakeisti savo skaidinio dydžio
drive-create-failed = Windows nepavyko sukurti skaidinio sistemai Luft
drive-hide-failed = Windows nepavyko paslėpti naujo skaidinio nuo Failų naršyklės
drive-format-failed = Windows nepavyko suformatuoti naujo skaidinio
drive-remove-failed = Windows nepavyko pašalinti vieno iš Luft skaidinių
drive-new-partition-missing = Naujas skaidinys nerastas
drive-new-partition-no-volume = Naujas skaidinys neturi tomo
drive-start-no-guid = Paleidimo skaidinys neturi GUID
drive-live-no-guid = Live skaidinys neturi GUID
drive-box-no-guid = Persikraustymo dėžė neturi GUID
drive-guid-unreadable = Skaidinio GUID nenuskaitomas
drive-not-gpt = Disko skaidinių lentelė nėra GPT
drive-start-no-volume = Paleidimo skaidinys neturi tomo
drive-live-no-volume = Luft skaidinys neturi tomo
drive-new-live-no-volume = Naujas Luft skaidinys neturi tomo
drive-partitions-not-noted = Luft skaidinių nėra Meet Luft užrašuose
drive-partitions-gone = Luft skaidiniai dingo
drive-partition-gone = Dingo skaidinys
drive-start-partition-foreign = Luft paleidimo skaidinio nesukūrė Meet Luft
drive-start-partition-gone = Luft paleidimo skaidinio nebėra
drive-start-partition-not-listed = Luft paleidimo skaidinio nėra skaidinių lentelėje
drive-no-esp = Šiame kompiuteryje nėra EFI sistemos skaidinio
drive-esp-full = EFI sistemos skaidinys per pilnas Luft paleidimo failams.
drive-esp-not-opened = Nepavyko atidaryti EFI sistemos skaidinio
drive-esp-file-unreadable = EFI sistemos skaidinio failas { $file } nenuskaitomas
drive-esp-no-drive = EFI sistemos skaidinys neturi disko
drive-esp-no-guid = EFI sistemos skaidinys neturi GUID
drive-no-uuid = Diskas, kuriame laikoma Luft, neturi UUID
drive-folder-unreadable = Luft negali pasileisti iš disko, kuriame yra jūsų failai.
drive-folder-not-startable = Iš { $folder } paleisti negalima

## Errors while getting Luft

live-no-home-folder = Nėra namų aplanko, kuriame laikyti Luft
live-no-app-data-folder = Nėra vietinių programų duomenų aplanko, kuriame laikyti Luft
live-pointer-unreadable = Naujausia Luft nenuskaitoma
live-not-published = Luft ten nepaskelbta
live-checksum-unreadable = Kontrolinės sumos failas nenuskaitomas
live-checksum-not-read = Nepavyko nuskaityti Luft kontrolinės sumos: { $error }
live-download-damaged = Atsisiuntimas pakeliui buvo sugadintas. Bandykite dar kartą.
live-download-incomplete = Atsisiųstoje Luft trūksta { $file }
live-download-not-resumable = Serveris negali tęsti atsisiuntimo
live-not-signed = { $iso } nepasirašytas
live-signature-unreadable = Failo { $iso } parašas nenuskaitomas
live-signature-wrong-key = Failo { $iso } nepasirašė Lantharos
live-signature-other-iso = Parašas skirtas failui { $signed }, o ne failui { $iso }
live-iso-out-of-order = ISO failai išdėstyti ne tokia tvarka, kurią Meet Luft gali nuskaityti
live-iso-not-iso = Tai ne ISO atvaizdas
live-iso-no-root = ISO neturi šakninio aplanko
live-iso-no-joliet = ISO neturi Joliet pavadinimų
live-not-removed = Nepavyko pašalinti { $path }: { $error }

## Errors while making a USB stick

stick-gone = Atmintuko nebėra. Vėl jį prijunkite ir pasirinkite iš naujo.
stick-too-small = Luft netelpa šiame atmintuke. Naudokite bent 4 GB talpos atmintuką.
stick-damaged = ISO neatitinka savo kontrolinės sumos. Galbūt jis pakeliui buvo sugadintas.
stick-read-back-differs = Iš atmintuko nuskaityta ne tai, kas į jį įrašyta. Jis gali būti susidėvėjęs, todėl išbandykite kitą.
stick-download-unavailable = Luft šiuo metu negalima atsisiųsti: { $error }
stick-download-failed = Nepavyko atsisiųsti Luft: { $error }
stick-checksum-unreadable = Nepavyko nuskaityti ISO kontrolinės sumos: { $error }
stick-file-unreadable = Nepavyko nuskaityti { $path }: { $error }
stick-iso-unreadable = Nepavyko nuskaityti ISO: { $error }
stick-iso-no-name = ISO neturi pavadinimo
stick-iso-ended-early = ISO baigėsi per anksti
stick-iso-already-there = { $name } jau yra atmintuke.
stick-no-room = Atmintuke nėra vietos sistemai Luft. Pirmiausia atlaisvinkite jame { $size } MB.
stick-older-not-removed = Nepavyko pašalinti senesnės Luft: { $error }
stick-copy-stopped = Luft kopijavimas į atmintuką sustojo: { $error }
stick-not-opened = Nepavyko atidaryti atmintuko: { $error }
stick-write-stopped = Rašymas į atmintuką sustojo: { $error }
stick-not-synced = Atmintukas neįrašė visko: { $error }
stick-read-back-failed = Nepavyko nuskaityti atmintuko atgal: { $error }
stick-in-use = Atmintukas vis dar naudojamas: { $error }
stick-device-in-use = { $device } vis dar naudojamas: { $error }
stick-volume-not-opened = Nepavyko atidaryti atmintuko tomo: { $error }
stick-volume-in-use = Atmintukas vis dar naudojamas. Uždarykite tai, kas jame turi atidarytų failų, ir bandykite dar kartą ({ $error })
stick-not-dismounted = Windows nepavyko atleisti atmintuko: { $error }
stick-not-cleared = Windows nepavyko išvalyti atmintuko: { $error }
stick-not-refreshed = Windows nepavyko iš naujo patikrinti atmintuko: { $error }
stick-not-ventoy = Šiame atmintuke nebenaudojamas Ventoy.
stick-ventoy-not-opened = Nepavyko atidaryti Ventoy skaidinio: { $error }
stick-ventoy-not-opened-windows = Windows negali atidaryti Ventoy skaidinio
stick-udisks-missing = Meet Luft reikia UDisks, kad galėtų naudoti atmintuką: { $error }
