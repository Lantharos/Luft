## What Meet Luft finds when it checks a computer

check-processor-x64 = Proċessur Intel jew AMD ta’ 64 bit
check-processor-x64-detail = Luft jaħdem fuqu.
check-processor-arm = Proċessur Arm
check-processor-arm-detail = Għalissa Luft jaħdem biss fuq proċessuri Intel u AMD.
check-processor-32-bit-windows = Windows ta’ 32 bit
check-processor-32-bit-system = Sistema ta’ 32 bit
check-processor-32-bit-detail = Luft għandu bżonn proċessur Intel jew AMD ta’ 64 bit.
check-startup-uefi = Jibda b’UEFI
check-startup-uefi-windows = Luft jibda bl-istess mod modern.
check-startup-uefi-linux = Luft iżid l-entrata tal-boot tiegħu, u { $system } jibqa’ jibda kif jibda issa.
check-startup-bios = Jibda fil-modalità BIOS il-qadima
check-startup-bios-windows = Luft għandu bżonn UEFI. Windows jista’ jaqleb b’MBR2GPT, imbagħad UEFI jista’ jinxtegħel fis-settings tal-firmware.
check-startup-bios-linux = Luft għandu bżonn UEFI. Ixgħlu fis-settings tal-firmware, flimkien mas-sistema li diġà hawn, imbagħad erġa’ ċċekkja.
check-startup-mbr = Id-drajv juża tabella tal-partizzjonijiet antika
check-startup-mbr-windows = Luft għandu bżonn drajv GPT. Windows jista’ jikkonvertih b’MBR2GPT mingħajr ma jintilfu fajls.
check-startup-mbr-linux = Luft għandu bżonn drajv GPT biex jibda minnu.
check-startup-no-esp = M’hemmx partizzjoni tas-sistema EFI
check-startup-no-esp-detail = Luft iżid il-fajls tal-boot tiegħu ħdejn dawk li diġà hemm fuq il-partizzjoni tas-sistema EFI, u m’hemmx waħda.
check-startup-esp-full = Il-partizzjoni tas-sistema EFI hija mimlija
check-startup-esp-full-detail = Luft għandu bżonn { $size } MB hemmhekk għall-fajls tal-boot tiegħu. Normalment l-ispazju jieħduh kernels jew entrati tal-boot qodma.
check-folder-fine = L-ebda partizzjoni ma tinbidel
check-folder-fine-detail = Luft jinżamm bħala fajl fuq id-drajv { $filesystem } tiegħek u jibda minn hemm.
check-folder-encrypted = Il-fajls tiegħek jinsabu fuq drajv iċċifrat
check-folder-encrypted-detail = Luft għadu ma jistax jibda minn drajv iċċifrat. Uża drajv USB biex tipprovah minflok.
check-folder-combined = Il-fajls tiegħek jinfirxu fuq aktar minn partizzjoni waħda
check-folder-combined-detail = Luft għadu ma jistax jibda minn LVM jew RAID. Uża drajv USB biex tipprovah minflok.
check-folder-filesystem = Luft ma jistax jibda minn { $filesystem }
check-folder-filesystem-detail = Jibda minn drajvs ext4, btrfs u XFS. Uża drajv USB biex tipprovah minflok.
check-space-free = { $size } GB ħielsa
check-space-free-linux = Luft jieħu madwar { $size } GB waqt li tipprovah.
check-space-up-to = Sa { $size } GB għal Luft
check-space-up-to-detail = Windows iżomm il-fajls tiegħu u spazju biex jikber.
check-space-short = M’hemmx biżżejjed spazju ħieles
check-space-short-windows = Luft għandu bżonn madwar { $needed } GB li Windows jista’ jċedi. Ħeles { $missing } GB f’Windows, pereżempju b’Disk Cleanup, imbagħad erġa’ ċċekkja.
check-space-short-linux = Luft għandu bżonn madwar { $needed } GB biex jibda minnhom. Ħeles { $missing } GB, imbagħad erġa’ ċċekkja.
check-system-replaceable = Luft jista’ jieħu postha u jżomm il-fajls, il-kont u s-settings tiegħek.
check-system-single = Il-fajls tiegħek jaqsmu partizzjoni waħda mas-sistema, għalhekk il-bdil tagħha filwaqt li jinżammu għadu mhux appoġġjat. Il-prova u l-installazzjoni ta’ Luft jaħdmu.
check-system-encrypted = Hija ċċifrata, għalhekk il-bdil tagħha filwaqt li jinżammu l-fajls tiegħek għadu mhux appoġġjat.
check-system-unknown = Id-drajv tagħha huwa organizzat b’mod li Luft għadu ma jistax jibdel filwaqt li jżomm il-fajls tiegħek.
check-encryption-off = Windows mhuwiex iċċifrat
check-encryption-off-detail = Installa Luft jista’ jaqra s-settings tiegħu u l-apparati Bluetooth tiegħek.
check-encryption-on = Windows huwa ċċifrat b’BitLocker
check-encryption-on-detail = M’hemmx problema. Windows jagħmel l-ispazju hu stess, u Meet Luft iġib dak li Luft ma jistax jaqra minn drajv imsakkar. Żomm iċ-ċavetta tal-irkupru fil-qrib, għal kull eventwalità.
check-encryption-changing = BitLocker għadu qed jiċċifra jew jiddeċifra
check-encryption-changing-detail = Stenna sakemm Windows ilesti, imbagħad erġa’ ejja. Tista’ tara kemm wasal fis-Settings, taħt Ċċifrar tal-apparat.
check-fast-startup-on = Fast Startup huwa mixgħul
check-fast-startup-on-detail = Windows jidħol f’ibernazzjoni minflok jintefa, u dan iżomm id-drajv tiegħu msakkar. Meet Luft joffri li jitfih qabel l-installazzjoni.
check-fast-startup-off = Fast Startup huwa mitfi
check-fast-startup-off-detail = Windows jintefa għalkollox.
check-secure-boot-on = Secure Boot huwa mixgħul
check-secure-boot-on-detail = Jista’ jibqa’ mixgħul. Luft jistaqsi darba, fuq skrin blu, biex iżid iċ-ċavetta tiegħu.
check-secure-boot-off = Secure Boot huwa mitfi
check-secure-boot-off-detail = Luft jaħdem mingħajru, iżda logħob b’anti-cheat għandu bżonnu. { $turningOn }
check-secure-boot-restart-into = Meet Luft jista’ jirristartja fis-settings tal-firmware, fejn tinsab taħt { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft jista’ jirristartja fis-settings tal-firmware, fejn normalment tinsab taħt Security jew Boot.
check-secure-boot-turn-on = Biex tixgħlu, irristartja u agħfas { $key } hekk kif jidher il-logo ta’ { $maker }, imbagħad mur f’{ $place }.
check-secure-boot-turn-on-anywhere = Biex tixgħlu, iftaħ is-settings tal-firmware waqt li l-kompjuter jibda u fittex taħt Security jew Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, imbagħad Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, imbagħad Secure Boot
check-firmware-place-security-or-advanced = Security jew Advanced, imbagħad Secure Boot Configuration
check-firmware-place-security-or-boot = Security jew Boot, imbagħad Secure Boot
check-firmware-place-boot = Boot, imbagħad Secure Boot
check-firmware-place-settings = Settings, imbagħad Security, imbagħad Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 fuq ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 jew Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = il-buttuna tal-volum ’il fuq

## More of the computer's hardware

check-tpm-detail = Luft iċċifrat jista’ jiżblokka waħdu meta jibda l-kompjuter.
check-tpm-missing = M’hemmx TPM 2.0
check-tpm-missing-detail = Jekk tiċċifra lil Luft, jitolbok passphrase kull darba li jibda.
check-graphics = Grafika
check-graphics-detail = Taħdem mill-ewwel.
check-graphics-nvidia = Luft jiġi installat bid-driver ta’ NVIDIA stess.
check-wifi-missing = M’hemmx Wi-Fi
check-wifi-missing-detail = Uża kejbil tan-netwerk f’Luft, jew xejn.
check-wifi-detail = Jaħdem f’Luft.
check-wifi-broadcom = Xi ċipep Wi-Fi ta’ Broadcom għandhom bżonn driver li Luft ma jinkludix. Żomm fil-qrib kejbil tan-netwerk jew mowbajl għat-tethering bl-USB.
check-start-entries = { $count ->
    [one] Entrata tal-boot qadima
    [two] { $count } entrati tal-boot qodma
    [few] { $count } entrati tal-boot qodma
    [many] { $count } entrata tal-boot qadima
   *[other] { $count } entrata tal-boot qadima
}
check-start-entries-detail = { $count ->
    [one] { $names } tippunta lejn sistema li m’għadhiex fuq dan il-PC. Tista’ titneħħa.
    [two] { $names } jippuntaw lejn sistemi li m’għadhomx fuq dan il-PC. Jistgħu jitneħħew.
    [few] { $names } jippuntaw lejn sistemi li m’għadhomx fuq dan il-PC. Jistgħu jitneħħew.
    [many] { $names } jippuntaw lejn sistemi li m’għadhomx fuq dan il-PC. Jistgħu jitneħħew.
   *[other] { $names } jippuntaw lejn sistemi li m’għadhomx fuq dan il-PC. Jistgħu jitneħħew.
}
check-download-unavailable = Luft ma jistax jitniżżel bħalissa
check-download-unavailable-detail = Meet Luft iniżżel madwar 3 GB. Iċċekkja li int online u erġa’ ċċekkja, jew uża ISO ta’ Luft li diġà għandek.

## Choosing a Luft ISO file

iso-dialog-title = Agħżel ISO ta’ Luft
iso-dialog-filter = ISO ta’ Luft

## Saving the logs from trying Luft

logs-file-name = Logs ta’ Luft { $name }
logs-no-desktop = Meet Luft ma sabx id-desktop tiegħek
logs-not-saved = Meet Luft ma setax jissejvja l-logs ta’ Ipprova Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = L-għajnuna ta’ Meet Luft ma bdietx: { $error }
helper-not-allowed = Meet Luft ma tħalliex jaħdem fuq id-drajv
helper-stopped = L-għajnuna ta’ Meet Luft waqfet
helper-stopped-because = L-għajnuna ta’ Meet Luft waqfet: { $error }
helper-pipe-failed = Meet Luft ma setax jitkellem mal-għajnuna tiegħu: { $error }
helper-pipe-hijacked = Xi ħaġa li mhix l-għajnuna ta’ Meet Luft fetħet { $pipe }
helper-record-not-saved = Meet Luft ma setax jieħu nota ta’ dak li għamel: { $error }
helper-no-room-yet = L-ewwel agħmel spazju għal Luft.
helper-not-ready-linux = L-ewwel ħejji lil Luft.
helper-not-ready-to-start-windows = Luft għadu mhux lest biex jibda. L-ewwel agħmillu spazju.
helper-not-ready-to-start-linux = Luft għadu mhux lest biex jibda. L-ewwel ħejjih.
helper-update-unfinished = L-aġġornament ta’ Luft ma tlestiex. L-ewwel erġa’ aġġornah.
helper-room-too-small = Luft għandu bżonn aktar spazju minn hekk.
helper-room-shortfall = Windows jista’ jċedi { $available } GB, u Luft għandu bżonn { $needed } GB.
helper-box-shortfall = Windows jista’ jċedi { $available } GB oħra, u dawn għandhom bżonn { $needed } GB.
helper-bluetooth-unreadable = Is-settings tal-Bluetooth ta’ Windows ma setgħux jinfetħu
helper-registry-not-opened = Ma setax jinfetaħ { $key }: { $error }
helper-registry-not-changed = Ma setax jinbidel { $value }: { $error }
helper-registry-not-saved = Ma setax jiġi ssejvjat { $file }: { $error }
helper-restart-failed = Il-kompjuter ma rristartjax
helper-windows-restart-failed = Windows ma rristartjax: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Dan il-PC ma jibdiex b’UEFI
firmware-variable-unreadable = Ma setax jinqara { $name } mill-firmware: { $error }
firmware-variable-not-saved = Ma setax jiġi ssejvjat { $name } fil-firmware: { $error }
firmware-entries-full = Il-firmware m’għandux spazju għal entrata oħra tal-boot
firmware-entry-kept = Windows żamm l-entrata tal-boot { $entry }

## Errors about drives and partitions

drive-list-failed = Id-drajvs ma setgħux jiġu elenkati: { $error }
drive-of-path-unknown = Ma setax jinstab liema drajv fih { $path }
drive-windows-folder-missing = Il-fowlder ta’ Windows ma nstabx
drive-windows-drive-missing = Id-drajv ta’ Windows ma nstabx
drive-windows-drive-missing-because = Id-drajv ta’ Windows ma nstabx: { $error }
drive-windows-partition-missing = Il-partizzjoni ta’ Windows ma nstabitx
drive-volume-missing = Il-volum { $path } ma nstabx
drive-storage-error = { $what } (żball tal-ħażna ta’ Windows { $code })
drive-shrink-size-unknown = Windows ma setax jgħid kemm tista’ tiċkien il-partizzjoni tiegħu
drive-grow-size-unknown = Windows ma setax jgħid kemm tista’ tikber il-partizzjoni tiegħu
drive-resize-failed = Windows ma setax ibiddel id-daqs tal-partizzjoni tiegħu
drive-create-failed = Windows ma setax jagħmel partizzjoni għal Luft
drive-hide-failed = Windows ma setax iżomm il-partizzjoni l-ġdida barra minn File Explorer
drive-format-failed = Windows ma setax jifformattja l-partizzjoni l-ġdida
drive-remove-failed = Windows ma setax ineħħi waħda mill-partizzjonijiet ta’ Luft
drive-new-partition-missing = Il-partizzjoni l-ġdida ma nstabitx
drive-new-partition-no-volume = Il-partizzjoni l-ġdida m’għandhiex volum
drive-start-no-guid = Il-partizzjoni tal-boot m’għandhiex GUID
drive-live-no-guid = Il-partizzjoni live m’għandhiex GUID
drive-box-no-guid = Il-kaxxa tal-ġarr m’għandhiex GUID
drive-guid-unreadable = Il-GUID tal-partizzjoni ma jinqarax
drive-not-gpt = It-tabella tal-partizzjonijiet tad-drajv mhijiex GPT
drive-start-no-volume = Il-partizzjoni tal-boot m’għandhiex volum
drive-live-no-volume = Il-partizzjoni ta’ Luft m’għandhiex volum
drive-new-live-no-volume = Il-partizzjoni l-ġdida ta’ Luft m’għandhiex volum
drive-partitions-not-noted = Il-partizzjonijiet ta’ Luft mhumiex fin-noti ta’ Meet Luft
drive-partitions-gone = Il-partizzjonijiet ta’ Luft għebu
drive-partition-gone = Partizzjoni għabet
drive-start-partition-foreign = Il-partizzjoni tal-boot ta’ Luft mhix waħda li għamel Meet Luft
drive-start-partition-gone = Il-partizzjoni tal-boot ta’ Luft m’għadhiex hemm
drive-start-partition-not-listed = Il-partizzjoni tal-boot ta’ Luft mhix fit-tabella tal-partizzjonijiet
drive-no-esp = Dan il-kompjuter m’għandux partizzjoni tas-sistema EFI
drive-esp-full = Il-partizzjoni tas-sistema EFI hija mimlija wisq għall-fajls tal-boot ta’ Luft.
drive-esp-not-opened = Il-partizzjoni tas-sistema EFI ma setgħetx tinfetaħ
drive-esp-file-unreadable = { $file } fuq il-partizzjoni tas-sistema EFI ma jinqarax
drive-esp-no-drive = Il-partizzjoni tas-sistema EFI m’għandhiex drajv
drive-esp-no-guid = Il-partizzjoni tas-sistema EFI m’għandhiex GUID
drive-no-uuid = Id-drajv fejn jinżamm Luft m’għandux UUID
drive-folder-unreadable = Luft ma jistax jibda mid-drajv fejn hemm il-fajls tiegħek.
drive-folder-not-startable = Ma jistax jinbeda minn { $folder }

## Errors while getting Luft

live-no-home-folder = M’hemmx fowlder personali fejn jinżamm Luft
live-no-app-data-folder = M’hemmx fowlder lokali tad-data tal-apps fejn jinżamm Luft
live-pointer-unreadable = L-aħħar Luft ma jinqarax
live-not-published = Luft mhuwiex ippubblikat hemmhekk
live-checksum-unreadable = Il-fajl tal-checksum ma jinqarax
live-checksum-not-read = Il-checksum ta’ Luft ma setax jinqara: { $error }
live-download-damaged = It-tniżżil ġarrab ħsara fit-triq. Erġa’ pprova.
live-download-incomplete = Fil-Luft imniżżel nieqes { $file }
live-download-not-resumable = Is-server ma jistax ikompli t-tniżżil
live-not-signed = { $iso } mhuwiex iffirmat
live-signature-unreadable = Il-firma ta’ { $iso } ma tinqarax
live-signature-wrong-key = { $iso } mhuwiex iffirmat minn Lantharos
live-signature-other-iso = Il-firma hija għal { $signed }, mhux għal { $iso }
live-iso-out-of-order = Il-fajls tal-ISO mhumiex f’ordni li Meet Luft jista’ jaqra
live-iso-not-iso = Din mhix image ISO
live-iso-no-root = L-ISO m’għandhiex fowlder ewlieni
live-iso-no-joliet = L-ISO m’għandhiex ismijiet Joliet
live-not-removed = { $path } ma setax jitneħħa: { $error }

## Errors while making a USB stick

stick-gone = Id-drajv m’għadux hemm. Erġa’ qabbdu u erġa’ agħżlu.
stick-too-small = Luft ma joqgħodx fuq dan id-drajv. Uża wieħed ta’ 4 GB jew aktar.
stick-damaged = L-ISO ma taqbilx mal-checksum tagħha. Setgħet ġarrbet ħsara fit-triq.
stick-read-back-differs = Id-drajv ma tax lura dak li nkiteb fuqu. Jista’ jkun mikul, għalhekk ipprova ieħor.
stick-download-unavailable = Luft ma jistax jitniżżel bħalissa: { $error }
stick-download-failed = Luft ma setax jitniżżel: { $error }
stick-checksum-unreadable = Il-checksum tal-ISO ma jistax jinqara: { $error }
stick-file-unreadable = { $path } ma jistax jinqara: { $error }
stick-iso-unreadable = L-ISO ma tistax tinqara: { $error }
stick-iso-no-name = L-ISO m’għandhiex isem
stick-iso-ended-early = L-ISO spiċċat qabel il-waqt
stick-iso-already-there = { $name } diġà jinsab fuq id-drajv.
stick-no-room = M’hemmx spazju għal Luft fuq id-drajv. L-ewwel ħeles { $size } MB fuqu.
stick-older-not-removed = Il-Luft l-antik ma setax jitneħħa: { $error }
stick-copy-stopped = L-ikkupjar ta’ Luft fuq id-drajv waqaf: { $error }
stick-not-opened = Id-drajv ma setax jinfetaħ: { $error }
stick-write-stopped = Il-kitba fuq id-drajv waqfet: { $error }
stick-not-synced = Id-drajv ma żammx kollox: { $error }
stick-read-back-failed = Id-drajv ma setax jerġa’ jinqara: { $error }
stick-in-use = Id-drajv għadu qed jintuża: { $error }
stick-device-in-use = { $device } għadu qed jintuża: { $error }
stick-volume-not-opened = Il-volum tad-drajv ma setax jinfetaħ: { $error }
stick-volume-in-use = Id-drajv għadu qed jintuża. Agħlaq dak li għandu fajls miftuħa fuqu u erġa’ pprova ({ $error })
stick-not-dismounted = Windows ma setax jeħles mid-drajv: { $error }
stick-not-cleared = Windows ma setax inaddaf id-drajv: { $error }
stick-not-refreshed = Windows ma setax jerġa’ jħares lejn id-drajv: { $error }
stick-not-ventoy = Dan id-drajv m’għadux juża Ventoy.
stick-ventoy-not-opened = Il-partizzjoni ta’ Ventoy ma setgħetx tinfetaħ: { $error }
stick-ventoy-not-opened-windows = Windows ma jistax jiftaħ il-partizzjoni ta’ Ventoy
stick-udisks-missing = Meet Luft għandu bżonn UDisks biex juża d-drajv: { $error }
