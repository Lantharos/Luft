## What Meet Luft finds when it checks a computer

check-processor-x64 = 64 bitu Intel vai AMD procesors
check-processor-x64-detail = Luft darbojas ar to.
check-processor-arm = Arm procesors
check-processor-arm-detail = Luft pagaidām darbojas tikai ar Intel un AMD procesoriem.
check-processor-32-bit-windows = 32 bitu Windows
check-processor-32-bit-system = 32 bitu sistēma
check-processor-32-bit-detail = Luft vajadzīgs 64 bitu Intel vai AMD procesors.
check-startup-uefi = Startē ar UEFI
check-startup-uefi-windows = Luft startē tādā pašā modernā veidā.
check-startup-uefi-linux = Luft pievieno savu startēšanas ierakstu, un { $system } turpina startēt tāpat kā tagad.
check-startup-bios = Startē mantotajā BIOS režīmā
check-startup-bios-windows = Luft vajadzīgs UEFI. Windows var pārslēgties ar rīku MBR2GPT, pēc tam UEFI var ieslēgt aparātprogrammatūras iestatījumos.
check-startup-bios-linux = Luft vajadzīgs UEFI. Ieslēdziet to aparātprogrammatūras iestatījumos kopā ar šeit esošo sistēmu un pēc tam pārbaudiet vēlreiz.
check-startup-mbr = Diskā ir veca nodalījumu tabula
check-startup-mbr-windows = Luft vajadzīgs GPT disks. Windows to var pārveidot ar rīku MBR2GPT, nezaudējot failus.
check-startup-mbr-linux = Luft vajadzīgs GPT disks, no kura startēt.
check-startup-no-esp = Nav EFI sistēmas nodalījuma
check-startup-no-esp-detail = Luft pievieno savus startēšanas failus blakus tiem, kas jau ir EFI sistēmas nodalījumā, bet tāda nodalījuma nav.
check-startup-esp-full = EFI sistēmas nodalījums ir pilns
check-startup-esp-full-detail = Luft tur vajag { $size } MB saviem startēšanas failiem. Vietu parasti aizņem veci kodoli vai startēšanas ieraksti.
check-folder-fine = Nodalījumi netiek mainīti
check-folder-fine-detail = Luft tiek glabāta kā fails jūsu diskā ({ $filesystem }) un startē no turienes.
check-folder-encrypted = Jūsu faili ir šifrētā diskā
check-folder-encrypted-detail = Luft vēl nevar startēt no šifrēta diska. Tā vietā izmēģiniet to no USB zibatmiņas.
check-folder-combined = Jūsu faili aizņem vairāk nekā vienu nodalījumu
check-folder-combined-detail = Luft vēl nevar startēt no LVM vai RAID. Tā vietā izmēģiniet to no USB zibatmiņas.
check-folder-filesystem = Luft nevar startēt no failu sistēmas { $filesystem }
check-folder-filesystem-detail = Tā startē no ext4, btrfs un XFS diskiem. Tā vietā izmēģiniet to no USB zibatmiņas.
check-space-free = Brīvi { $size } GB
check-space-free-linux = Izmēģinājuma laikā Luft aizņem aptuveni { $size } GB.
check-space-up-to = Līdz { $size } GB sistēmai Luft
check-space-up-to-detail = Windows patur savus failus un vietu augšanai.
check-space-short = Nepietiek brīvas vietas
check-space-short-windows = Luft vajag aptuveni { $needed } GB, ko Windows var atvēlēt. Atbrīvojiet sistēmā Windows { $missing } GB, piemēram, ar Diska tīrīšanu, un pēc tam pārbaudiet vēlreiz.
check-space-short-linux = Luft startēšanai vajag aptuveni { $needed } GB. Atbrīvojiet { $missing } GB un pēc tam pārbaudiet vēlreiz.
check-system-replaceable = Luft var stāties tās vietā un paturēt jūsu failus, kontu un iestatījumus.
check-system-single = Jūsu faili atrodas vienā nodalījumā ar sistēmu, tāpēc tās aizstāšana, saglabājot failus, vēl netiek atbalstīta. Luft izmēģināšana un instalēšana darbojas.
check-system-encrypted = Tā ir šifrēta, tāpēc tās aizstāšana, saglabājot jūsu failus, vēl netiek atbalstīta.
check-system-unknown = Tās disks ir sadalīts veidā, kuru Luft vēl nevar aizstāt, saglabājot jūsu failus.
check-encryption-off = Windows nav šifrēta
check-encryption-off-detail = Instalēt Luft var nolasīt tās iestatījumus un jūsu Bluetooth ierīces.
check-encryption-on = Windows ir šifrēta ar BitLocker
check-encryption-on-detail = Tas nekas. Windows pati atbrīvo vietu, un Meet Luft pārnes to, ko Luft nevar nolasīt no bloķēta diska. Katram gadījumam turiet atkopšanas atslēgu pa rokai.
check-encryption-changing = BitLocker joprojām šifrē vai atšifrē
check-encryption-changing-detail = Pagaidiet, līdz Windows pabeidz, un pēc tam atgriezieties. Progresu var redzēt Iestatījumos, sadaļā Ierīces šifrēšana.
check-fast-startup-on = Ātrā startēšana ir ieslēgta
check-fast-startup-on-detail = Windows izslēgšanās vietā hibernējas, tāpēc tās disks paliek bloķēts. Meet Luft pirms instalēšanas piedāvā to izslēgt.
check-fast-startup-off = Ātrā startēšana ir izslēgta
check-fast-startup-off-detail = Windows izslēdzas pilnībā.
check-secure-boot-on = Secure Boot ir ieslēgts
check-secure-boot-on-detail = Tas var palikt ieslēgts. Luft vienreiz zilā ekrānā lūgs pievienot savu atslēgu.
check-secure-boot-off = Secure Boot ir izslēgts
check-secure-boot-off-detail = Luft darbojas arī bez tā, taču spēlēm ar pretkrāpšanas aizsardzību tas ir vajadzīgs. { $turningOn }
check-secure-boot-restart-into = Meet Luft var restartēt aparātprogrammatūras iestatījumos, kur tas atrodas šeit: { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft var restartēt aparātprogrammatūras iestatījumos, kur tas parasti atrodas sadaļā Security vai Boot.
check-secure-boot-turn-on = Lai to ieslēgtu, restartējiet datoru un, kad parādās ražotāja ({ $maker }) logotips, nospiediet { $key }, pēc tam atveriet { $place }.
check-secure-boot-turn-on-anywhere = Lai to ieslēgtu, datora startēšanas laikā atveriet aparātprogrammatūras iestatījumus un meklējiet sadaļā Security vai Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, pēc tam Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, pēc tam Secure Boot
check-firmware-place-security-or-advanced = Security vai Advanced, pēc tam Secure Boot Configuration
check-firmware-place-security-or-boot = Security vai Boot, pēc tam Secure Boot
check-firmware-place-boot = Boot, pēc tam Secure Boot
check-firmware-place-settings = Settings, pēc tam Security, pēc tam Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPad datoros F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 vai Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = skaļuma palielināšanas pogu

## More of the computer's hardware

check-tpm-detail = Šifrēta Luft var pati atbloķēties, kad dators startē.
check-tpm-missing = Nav TPM 2.0
check-tpm-missing-detail = Ja šifrēsiet Luft, tā katrā startēšanas reizē prasīs paroles frāzi.
check-graphics = Grafika
check-graphics-detail = Darbojas uzreiz.
check-graphics-nvidia = Luft tiek instalēta ar pašas NVIDIA draiveri.
check-wifi-missing = Nav Wi-Fi
check-wifi-missing-detail = Sistēmā Luft izmantojiet tīkla kabeli vai iztieciet bez tīkla.
check-wifi-detail = Darbojas sistēmā Luft.
check-wifi-broadcom = Dažām Broadcom Wi-Fi mikroshēmām vajadzīgs draiveris, kura Luft nav. Turiet pa rokai tīkla kabeli vai tālruni interneta koplietošanai caur USB.
check-start-entries = { $count ->
    [zero] { $count } vecu startēšanas ierakstu
    [one] { $count } vecs startēšanas ieraksts
   *[other] { $count } veci startēšanas ieraksti
}
check-start-entries-detail = { $count ->
    [zero] { $names } norāda uz sistēmām, kuru šajā datorā vairs nav. Tos var sakārtot.
    [one] { $names } norāda uz sistēmu, kuras šajā datorā vairs nav. To var sakārtot.
   *[other] { $names } norāda uz sistēmām, kuru šajā datorā vairs nav. Tos var sakārtot.
}
check-download-unavailable = Luft pašlaik nevar lejupielādēt
check-download-unavailable-detail = Meet Luft lejupielādē aptuveni 3 GB. Pārbaudiet interneta savienojumu un pārbaudiet vēlreiz vai izmantojiet esošu Luft ISO.

## Choosing a Luft ISO file

iso-dialog-title = Izvēlieties Luft ISO
iso-dialog-filter = Luft ISO

## Saving the logs from trying Luft

logs-file-name = Luft žurnāli { $name }
logs-no-desktop = Meet Luft nevarēja atrast jūsu darbvirsmu
logs-not-saved = Meet Luft nevarēja saglabāt Luft izmēģinājuma žurnālus: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Meet Luft palīgrīks nestartēja: { $error }
helper-not-allowed = Meet Luft netika atļauts strādāt ar disku
helper-stopped = Meet Luft palīgrīks apstājās
helper-stopped-because = Meet Luft palīgrīks apstājās: { $error }
helper-pipe-failed = Meet Luft nevarēja sazināties ar savu palīgrīku: { $error }
helper-pipe-hijacked = Savienojumu { $pipe } atvēra kaut kas cits, nevis Meet Luft palīgrīks
helper-record-not-saved = Meet Luft nevarēja pierakstīt, ko izveidoja: { $error }
helper-no-room-yet = Vispirms atbrīvojiet vietu sistēmai Luft.
helper-not-ready-linux = Vispirms sagatavojiet Luft.
helper-not-ready-to-start-windows = Luft vēl nav gatava startēšanai. Vispirms atbrīvojiet tai vietu.
helper-not-ready-to-start-linux = Luft vēl nav gatava startēšanai. Vispirms sagatavojiet to.
helper-update-unfinished = Luft atjaunināšana netika pabeigta. Vispirms atjauniniet to vēlreiz.
helper-room-too-small = Luft vajag vairāk vietas.
helper-room-shortfall = Windows var atvēlēt { $available } GB, bet Luft vajag { $needed } GB.
helper-box-shortfall = Windows var atvēlēt vēl { $available } GB, bet izvēlētajām lietām vajag { $needed } GB.
helper-bluetooth-unreadable = Windows Bluetooth iestatījumus nevarēja atvērt
helper-registry-not-opened = Nevarēja atvērt reģistra atslēgu { $key }: { $error }
helper-registry-not-changed = Nevarēja mainīt reģistra vērtību { $value }: { $error }
helper-registry-not-saved = Nevarēja saglabāt failu { $file }: { $error }
helper-restart-failed = Dators netika restartēts
helper-windows-restart-failed = Windows netika restartēta: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Šis dators nestartē ar UEFI
firmware-variable-unreadable = Nevarēja nolasīt { $name } no aparātprogrammatūras: { $error }
firmware-variable-not-saved = Nevarēja saglabāt { $name } aparātprogrammatūrā: { $error }
firmware-entries-full = Aparātprogrammatūrā nav vietas vēl vienam startēšanas ierakstam
firmware-entry-kept = Windows paturēja startēšanas ierakstu { $entry }

## Errors about drives and partitions

drive-list-failed = Diskus nevarēja uzskaitīt: { $error }
drive-of-path-unknown = Nevarēja noteikt, kurā diskā atrodas { $path }
drive-windows-folder-missing = Windows mape netika atrasta
drive-windows-drive-missing = Windows disks netika atrasts
drive-windows-drive-missing-because = Windows disks netika atrasts: { $error }
drive-windows-partition-missing = Windows nodalījums netika atrasts
drive-volume-missing = Sējums { $path } netika atrasts
drive-storage-error = { $what } (Windows krātuves kļūda { $code })
drive-shrink-size-unknown = Windows nevarēja noteikt, cik mazu var padarīt savu nodalījumu
drive-grow-size-unknown = Windows nevarēja noteikt, cik lielu var padarīt savu nodalījumu
drive-resize-failed = Windows nevarēja mainīt sava nodalījuma lielumu
drive-create-failed = Windows nevarēja izveidot nodalījumu sistēmai Luft
drive-hide-failed = Windows nevarēja paslēpt jauno nodalījumu no Failu pārlūka
drive-format-failed = Windows nevarēja formatēt jauno nodalījumu
drive-remove-failed = Windows nevarēja noņemt vienu no Luft nodalījumiem
drive-new-partition-missing = Jaunais nodalījums netika atrasts
drive-new-partition-no-volume = Jaunajam nodalījumam nav sējuma
drive-start-no-guid = Startēšanas nodalījumam nav GUID
drive-live-no-guid = Live nodalījumam nav GUID
drive-box-no-guid = Pārcelšanās kastei nav GUID
drive-guid-unreadable = Nodalījuma GUID nevar nolasīt
drive-not-gpt = Diska nodalījumu tabula nav GPT
drive-start-no-volume = Startēšanas nodalījumam nav sējuma
drive-live-no-volume = Luft nodalījumam nav sējuma
drive-new-live-no-volume = Luft jaunajam nodalījumam nav sējuma
drive-partitions-not-noted = Luft nodalījumu nav Meet Luft piezīmēs
drive-partitions-gone = Luft nodalījumi pazuda
drive-partition-gone = Viens nodalījums pazuda
drive-start-partition-foreign = Luft startēšanas nodalījumu nav izveidojusi Meet Luft
drive-start-partition-gone = Luft startēšanas nodalījuma vairs nav
drive-start-partition-not-listed = Luft startēšanas nodalījuma nav nodalījumu tabulā
drive-no-esp = Šajā datorā nav EFI sistēmas nodalījuma
drive-esp-full = EFI sistēmas nodalījums ir pārāk pilns Luft startēšanas failiem.
drive-esp-not-opened = EFI sistēmas nodalījumu nevarēja atvērt
drive-esp-file-unreadable = EFI sistēmas nodalījuma failu { $file } nevar nolasīt
drive-esp-no-drive = EFI sistēmas nodalījumam nav diska
drive-esp-no-guid = EFI sistēmas nodalījumam nav GUID
drive-no-uuid = Diskam, kurā glabājas Luft, nav UUID
drive-folder-unreadable = Luft nevar startēt no diska, kurā ir jūsu faili.
drive-folder-not-startable = No { $folder } nevar startēt

## Errors while getting Luft

live-no-home-folder = Nav mājas mapes, kur glabāt Luft
live-no-app-data-folder = Nav lokālās lietotņu datu mapes, kur glabāt Luft
live-pointer-unreadable = Jaunāko Luft nevar nolasīt
live-not-published = Luft tur nav publicēta
live-checksum-unreadable = Kontrolsummas failu nevar nolasīt
live-checksum-not-read = Luft kontrolsummu nevarēja nolasīt: { $error }
live-download-damaged = Lejupielāde pa ceļam tika bojāta. Mēģiniet vēlreiz.
live-download-incomplete = Lejupielādētajai Luft trūkst { $file }
live-download-not-resumable = Serveris nevar turpināt lejupielādi
live-not-signed = { $iso } nav parakstīts
live-signature-unreadable = Faila { $iso } parakstu nevar nolasīt
live-signature-wrong-key = Failu { $iso } nav parakstījis Lantharos
live-signature-other-iso = Paraksts ir failam { $signed }, nevis failam { $iso }
live-iso-out-of-order = ISO faili nav secībā, kuru Meet Luft var nolasīt
live-iso-not-iso = Tas nav ISO attēls
live-iso-no-root = ISO nav saknes mapes
live-iso-no-joliet = ISO nav Joliet nosaukumu
live-not-removed = { $path } nevarēja noņemt: { $error }

## Errors while making a USB stick

stick-gone = Zibatmiņas vairs nav. Pievienojiet to vēlreiz un izvēlieties no jauna.
stick-too-small = Luft neietilpst šajā zibatmiņā. Izmantojiet vismaz 4 GB zibatmiņu.
stick-damaged = ISO neatbilst savai kontrolsummai. Iespējams, tas pa ceļam tika bojāts.
stick-read-back-differs = No zibatmiņas netika nolasīts tas, kas tajā tika ierakstīts. Tā var būt nolietojusies, tāpēc izmēģiniet citu.
stick-download-unavailable = Luft pašlaik nevar lejupielādēt: { $error }
stick-download-failed = Luft nevarēja lejupielādēt: { $error }
stick-checksum-unreadable = ISO kontrolsummu nevar nolasīt: { $error }
stick-file-unreadable = { $path } nevar nolasīt: { $error }
stick-iso-unreadable = ISO nevar nolasīt: { $error }
stick-iso-no-name = ISO nav nosaukuma
stick-iso-ended-early = ISO beidzās priekšlaicīgi
stick-iso-already-there = { $name } jau ir zibatmiņā.
stick-no-room = Zibatmiņā nav vietas sistēmai Luft. Vispirms atbrīvojiet tajā { $size } MB.
stick-older-not-removed = Vecāko Luft nevarēja noņemt: { $error }
stick-copy-stopped = Luft kopēšana uz zibatmiņu apstājās: { $error }
stick-not-opened = Zibatmiņu nevarēja atvērt: { $error }
stick-write-stopped = Rakstīšana zibatmiņā apstājās: { $error }
stick-not-synced = Zibatmiņa nesaglabāja visu: { $error }
stick-read-back-failed = Zibatmiņu nevarēja nolasīt atpakaļ: { $error }
stick-in-use = Zibatmiņa joprojām tiek izmantota: { $error }
stick-device-in-use = { $device } joprojām tiek izmantots: { $error }
stick-volume-not-opened = Zibatmiņas sējumu nevarēja atvērt: { $error }
stick-volume-in-use = Zibatmiņa joprojām tiek izmantota. Aizveriet to, kam tajā ir atvērti faili, un mēģiniet vēlreiz ({ $error })
stick-not-dismounted = Windows nevarēja atbrīvot zibatmiņu: { $error }
stick-not-cleared = Windows nevarēja notīrīt zibatmiņu: { $error }
stick-not-refreshed = Windows nevarēja vēlreiz pārbaudīt zibatmiņu: { $error }
stick-not-ventoy = Šajā zibatmiņā vairs nav Ventoy.
stick-ventoy-not-opened = Ventoy nodalījumu nevarēja atvērt: { $error }
stick-ventoy-not-opened-windows = Windows nevar atvērt Ventoy nodalījumu
stick-udisks-missing = Meet Luft vajadzīgs UDisks, lai izmantotu zibatmiņu: { $error }
