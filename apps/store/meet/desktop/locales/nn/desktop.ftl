## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-bits Intel- eller AMD-prosessor
check-processor-x64-detail = Luft køyrer på han.
check-processor-arm = Arm-prosessor
check-processor-arm-detail = Luft køyrer førebels berre på Intel- og AMD-prosessorar.
check-processor-32-bit-windows = 32-bits Windows
check-processor-32-bit-system = 32-bits system
check-processor-32-bit-detail = Luft treng ein 64-bits Intel- eller AMD-prosessor.
check-startup-uefi = Startar med UEFI
check-startup-uefi-windows = Luft startar på den same moderne måten.
check-startup-uefi-linux = Luft legg til si eiga oppstartsoppføring, og { $system } held fram med å starte som no.
check-startup-bios = Startar i eldre BIOS-modus
check-startup-bios-windows = Luft treng UEFI. Windows kan byte over med MBR2GPT, og så kan UEFI slåast på i fastvareinnstillingane.
check-startup-bios-linux = Luft treng UEFI. Slå det på i fastvareinnstillingane, saman med systemet som alt er her, og sjekk igjen.
check-startup-mbr = Disken brukar ein gammal partisjonstabell
check-startup-mbr-windows = Luft treng ein GPT-disk. Windows kan konvertere han med MBR2GPT utan å miste filer.
check-startup-mbr-linux = Luft treng ein GPT-disk å starte frå.
check-startup-no-esp = Ingen EFI-systempartisjon
check-startup-no-esp-detail = Luft legg oppstartsfilene sine ved sida av dei som alt ligg på EFI-systempartisjonen, og det finst ingen.
check-startup-esp-full = EFI-systempartisjonen er full
check-startup-esp-full-detail = Luft treng { $size } MB der til oppstartsfilene sine. Det er som regel gamle kjernar eller oppstartsoppføringar som tek opp plassen.
check-folder-fine = Ingen partisjonar blir endra
check-folder-fine-detail = Luft blir lagra som ei fil på { $filesystem }-disken din og startar derifrå.
check-folder-encrypted = Filene dine ligg på ein kryptert disk
check-folder-encrypted-detail = Luft kan ikkje starte frå ein kryptert disk enno. Bruk ein minnepinne for å prøve det i staden.
check-folder-combined = Filene dine er spreidde over meir enn éin partisjon
check-folder-combined-detail = Luft kan ikkje starte frå LVM eller RAID enno. Bruk ein minnepinne for å prøve det i staden.
check-folder-filesystem = Luft kan ikkje starte frå { $filesystem }
check-folder-filesystem-detail = Det startar frå ext4-, btrfs- og XFS-diskar. Bruk ein minnepinne for å prøve det i staden.
check-space-free = { $size } GB ledig
check-space-free-linux = Luft tek om lag { $size } GB medan du prøver det.
check-space-up-to = Opptil { $size } GB til Luft
check-space-up-to-detail = Windows held på filene sine og plass til å vekse.
check-space-free-already = Av dette er { $size } GB alt ledig, så Windows gjev frå seg mindre.
check-space-other-drive = Det er plass til det på { $drive }.
check-space-erase-drive = Det er plass til det på { $drive } når den disken er sletta.
check-space-short = Ikkje nok ledig plass
check-space-short-windows = Luft treng om lag { $needed } GB som Windows kan gje frå seg. Frigjer { $missing } GB i Windows, til dømes med Diskopprydding, og sjekk igjen.
check-space-short-linux = Luft treng om lag { $needed } GB å starte frå. Frigjer { $missing } GB, og sjekk igjen.
check-system-replaceable = Luft kan ta plassen og behalde filene, kontoen og innstillingane dine.
check-system-single = Filene dine deler partisjon med systemet, så det er enno ikkje mogleg å erstatte det og samtidig behalde filene. Du kan framleis prøve og installere Luft.
check-system-encrypted = Systemet er kryptert, så det er enno ikkje mogleg å erstatte det og samtidig behalde filene dine.
check-system-unknown = Disken er sett opp på ein måte som gjer at Luft enno ikkje kan erstatte systemet og samtidig behalde filene dine.
check-encryption-off = Windows er ikkje kryptert
check-encryption-off-detail = Installer Luft kan lese innstillingane og Bluetooth-einingane dine.
check-encryption-on = Windows er kryptert med BitLocker
check-encryption-on-detail = Det går fint. Windows lagar plassen sjølv, og Meet Luft tek med det Luft ikkje kan lese frå ein låst disk. Ha gjenopprettingsnøkkelen for hand, for sikkerheits skuld.
check-encryption-changing = BitLocker krypterer eller dekrypterer framleis
# Windows finst berre på bokmål, så sidene heiter det same som der.
check-encryption-changing-detail = Vent til Windows er ferdig, og kom tilbake. Du ser kor langt det har kome i Innstillinger, under Enhetskryptering.
check-fast-startup-on = Rask oppstart er på
check-fast-startup-on-detail = Windows går i dvalemodus i staden for å slå seg av, og det held disken låst. Meet Luft tilbyr å slå det av før installeringa.
check-fast-startup-off = Rask oppstart er av
check-fast-startup-off-detail = Windows blir slått heilt av.
check-secure-boot-on = Secure Boot er på
check-secure-boot-on-detail = Det kan vere på. Luft ber éin gong, på ein blå skjerm, om å leggje til nøkkelen sin.
check-secure-boot-off = Secure Boot er av
check-secure-boot-off-detail = Luft verkar utan, men spel med juksevern treng det. { $turningOn }
check-secure-boot-restart-into = Meet Luft kan starte på nytt i fastvareinnstillingane, der det ligg under { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft kan starte på nytt i fastvareinnstillingane, der det som regel ligg under Security eller Boot.
check-secure-boot-turn-on = For å slå det på startar du på nytt og trykkjer på { $key } når { $maker }-logoen kjem fram, og går så til { $place }.
check-secure-boot-turn-on-anywhere = For å slå det på opnar du fastvareinnstillingane medan datamaskinen startar, og ser under Security eller Boot.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security og så Secure Boot
check-firmware-place-boot-configuration = Boot Configuration og så Secure Boot
check-firmware-place-security-or-advanced = Security eller Advanced og så Secure Boot Configuration
check-firmware-place-security-or-boot = Security eller Boot og så Secure Boot
check-firmware-place-boot = Boot og så Secure Boot
check-firmware-place-settings = Settings, deretter Security og så Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 på ein ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 eller Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = volum opp

## More of the computer's hardware

check-tpm-detail = Viss Luft er kryptert, kan det låse seg opp sjølv når datamaskinen startar.
check-tpm-missing = Ingen TPM 2.0
check-tpm-missing-detail = Viss du krypterer Luft, ber det om ein passfrase kvar gong det startar.
check-graphics = Grafikk
check-graphics-detail = Verkar rett ut av eska.
check-graphics-nvidia = Luft blir installert med den eigne drivaren til NVIDIA.
check-wifi-missing = Ingen Wi-Fi
check-wifi-missing-detail = Bruk ein nettverkskabel i Luft, eller ingenting.
check-wifi-detail = Verkar i Luft.
check-wifi-broadcom = Somme Wi-Fi-brikker frå Broadcom treng ein drivar som Luft ikkje har med. Ha ein nettverkskabel eller ein telefon for USB-deling for hand.
check-start-entries = { $count ->
    [one] Ei gammal oppstartsoppføring
   *[other] { $count } gamle oppstartsoppføringar
}
check-start-entries-detail = { $count ->
    [one] { $names } peikar på eit system som ikkje lenger finst på denne datamaskinen. Ho kan ryddast bort.
   *[other] { $names } peikar på system som ikkje lenger finst på denne datamaskinen. Dei kan ryddast bort.
}
check-download-unavailable = Luft kan ikkje lastast ned no
check-download-unavailable-detail = Meet Luft lastar ned om lag 3 GB. Sjekk at du er på nett, og sjekk igjen, eller bruk ei Luft-ISO-fil du alt har.

## Choosing a Luft ISO file

iso-dialog-title = Vel ei Luft-ISO-fil
iso-dialog-filter = Luft-ISO

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-loggar { $name }
logs-no-desktop = Meet Luft fann ikkje skrivebordet ditt
logs-not-saved = Meet Luft kunne ikkje lagre loggane frå då du prøvde Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Hjelparen til Meet Luft starta ikkje: { $error }
helper-not-allowed = Meet Luft fekk ikkje lov til å arbeide med disken
helper-stopped = Hjelparen til Meet Luft stoppa
helper-stopped-because = Hjelparen til Meet Luft stoppa: { $error }
helper-pipe-failed = Meet Luft fekk ikkje kontakt med hjelparen sin: { $error }
helper-pipe-hijacked = Noko anna enn hjelparen til Meet Luft opna { $pipe }
helper-record-not-saved = Meet Luft kunne ikkje notere kva det laga: { $error }
helper-no-room-yet = Lag plass til Luft først.
helper-not-ready-linux = Gjer Luft klart først.
helper-not-ready-to-start-windows = Luft er ikkje klart til å starte enno. Lag plass til det først.
helper-not-ready-to-start-linux = Luft er ikkje klart til å starte enno. Gjer det klart først.
helper-update-unfinished = Oppdateringa av Luft vart ikkje fullført. Oppdater det på nytt først.
helper-room-too-small = Luft treng meir plass enn det.
helper-room-shortfall = Windows kan gje frå seg { $available } GB, og Luft treng { $needed } GB.
helper-gap-shortfall = Den plassen har { $available } GB, og Luft treng { $needed } GB.
helper-place-gone = Den plassen er ikkje ledig lenger. Sjekk igjen for å sjå kvar Luft får plass.
helper-box-shortfall = Windows kan gje frå seg { $available } GB til, og dette treng { $needed } GB.
helper-box-room-shortfall = Plassen til Luft kan gje frå seg { $available } GB, og dette treng { $needed } GB.
helper-bluetooth-unreadable = Bluetooth-innstillingane i Windows kunne ikkje opnast
helper-registry-not-opened = Kunne ikkje opne { $key }: { $error }
helper-registry-not-changed = Kunne ikkje endre { $value }: { $error }
helper-registry-not-saved = Kunne ikkje lagre { $file }: { $error }
helper-restart-failed = Datamaskinen starta ikkje på nytt
helper-windows-restart-failed = Windows starta ikkje på nytt: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Denne datamaskinen startar ikkje med UEFI
firmware-variable-unreadable = Kunne ikkje lese { $name } frå fastvara: { $error }
firmware-variable-not-saved = Kunne ikkje lagre { $name } i fastvara: { $error }
firmware-entries-full = Fastvara har ikkje plass til fleire oppstartsoppføringar
firmware-entry-kept = Windows heldt på oppstartsoppføringa { $entry }

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Diskane kunne ikkje listast opp: { $error }
drive-of-path-unknown = Kunne ikkje finne ut kva disk { $path } ligg på
drive-windows-folder-missing = Fann ikkje mappa til Windows
drive-windows-drive-missing = Fann ikkje disken til Windows
drive-windows-drive-missing-because = Fann ikkje disken til Windows: { $error }
drive-windows-partition-missing = Fann ikkje partisjonen til Windows
drive-volume-missing = Fann ikkje volumet { $path }
drive-storage-error = { $what } (lagringsfeil { $code } i Windows)
drive-shrink-size-unknown = Windows kunne ikkje finne ut kor liten partisjonen kan bli
drive-resize-failed = Windows kunne ikkje endre storleiken på partisjonen sin
drive-create-failed = Windows kunne ikkje lage ein partisjon til Luft
drive-hide-failed = Windows kunne ikkje halde den nye partisjonen utanfor Filutforsker
drive-format-failed = Windows kunne ikkje formatere den nye partisjonen
drive-remove-failed = Windows kunne ikkje fjerne ein av partisjonane til Luft
drive-new-partition-missing = Fann ikkje den nye partisjonen
drive-new-partition-no-volume = Den nye partisjonen har ikkje noko volum
drive-start-no-guid = Oppstartspartisjonen har ingen GUID
drive-live-no-guid = Live-partisjonen har ingen GUID
drive-box-no-guid = Flytteeska har ingen GUID
drive-guid-unreadable = GUID-en til partisjonen kan ikkje lesast
drive-not-gpt = Partisjonstabellen på disken er ikkje GPT
drive-start-no-volume = Oppstartspartisjonen har ikkje noko volum
drive-live-no-volume = Partisjonen til Luft har ikkje noko volum
drive-new-live-no-volume = Den nye partisjonen til Luft har ikkje noko volum
drive-partitions-not-noted = Partisjonane til Luft manglar i notata til Meet Luft
drive-partitions-gone = Partisjonane til Luft har forsvunne
drive-partition-gone = Ein partisjon har forsvunne
drive-gone = Ein disk har forsvunne
drive-erase-failed = Windows kunne ikkje slette disken
drive-erased-no-room = Den sletta disken har ikkje plass til Luft
drive-start-partition-foreign = Oppstartspartisjonen til Luft er ikkje laga av Meet Luft
drive-start-partition-gone = Oppstartspartisjonen til Luft er borte
drive-start-partition-not-listed = Oppstartspartisjonen til Luft står ikkje i partisjonstabellen
drive-no-esp = Denne datamaskinen har ingen EFI-systempartisjon
drive-esp-full = EFI-systempartisjonen er for full til oppstartsfilene til Luft.
drive-esp-not-opened = EFI-systempartisjonen kunne ikkje opnast
drive-esp-file-unreadable = { $file } på EFI-systempartisjonen kan ikkje lesast
drive-esp-no-drive = EFI-systempartisjonen har ingen disk
drive-esp-no-guid = EFI-systempartisjonen har ingen GUID
drive-no-uuid = Disken som Luft ligg på, har ingen UUID
drive-folder-unreadable = Luft kan ikkje starte frå disken som filene dine ligg på.
drive-folder-not-startable = { $folder } kan ikkje startast frå

## Errors while changing Luft once it's installed

luft-gone = Luft er ikkje lenger på denne datamaskinen
luft-not-resizable = Storleiken på Luft kan ikkje endrast frå Windows akkurat no
luft-size-not-allowed = Luft kan ikkje ha den storleiken
luft-space-promised = Den plassen er sett av til Luft. Avbryt endringa først.
luft-no-start-entry = Fann ikkje oppstartsoppføringa til Luft

## Errors while getting Luft

live-no-home-folder = Det finst inga heimemappe å leggje Luft i
live-no-app-data-folder = Det finst inga mappe for lokale appdata å leggje Luft i
live-pointer-unreadable = Den nyaste versjonen av Luft kan ikkje lesast
live-not-published = Luft er ikkje publisert der
live-checksum-unreadable = Kontrollsumfila kan ikkje lesast
live-checksum-not-read = Kontrollsummen til Luft kunne ikkje lesast: { $error }
live-download-damaged = Nedlastinga vart skadd undervegs. Prøv igjen.
live-download-incomplete = Luft manglar { $file } etter nedlastinga
live-download-not-resumable = Tenaren kan ikkje halde fram med nedlastinga
live-not-signed = { $iso } er ikkje signert
live-signature-unreadable = Signaturen til { $iso } kan ikkje lesast
live-signature-wrong-key = { $iso } er ikkje signert av Lantharos
live-signature-other-iso = Signaturen gjeld { $signed }, ikkje { $iso }
live-iso-out-of-order = Filene i ISO-fila ligg ikkje i ei rekkjefølgje som Meet Luft kan lese
live-iso-not-iso = Dette er ikkje eit ISO-bilete
live-iso-no-root = ISO-fila har inga rotmappe
live-iso-no-joliet = ISO-fila har ingen Joliet-namn
live-not-removed = { $path } kunne ikkje fjernast: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = Minnepinnen er ikkje der lenger. Set han inn igjen og vel han på nytt.
stick-too-small = Luft får ikkje plass på denne minnepinnen. Bruk ein på 4 GB eller meir.
stick-damaged = ISO-fila stemmer ikkje med kontrollsummen. Ho kan ha blitt skadd undervegs.
stick-read-back-differs = Minnepinnen las ikkje tilbake det som vart skrive til han. Han kan vere utsliten, så prøv ein annan.
stick-download-unavailable = Luft kan ikkje lastast ned no: { $error }
stick-download-failed = Luft kunne ikkje lastast ned: { $error }
stick-checksum-unreadable = Kontrollsummen til ISO-fila kan ikkje lesast: { $error }
stick-file-unreadable = { $path } kan ikkje lesast: { $error }
stick-iso-unreadable = ISO-fila kan ikkje lesast: { $error }
stick-iso-no-name = ISO-fila har ikkje noko namn
stick-iso-ended-early = ISO-fila slutta for tidleg
stick-iso-already-there = { $name } ligg alt på minnepinnen.
stick-no-room = Det er ikkje plass til Luft på minnepinnen. Frigjer { $size } MB på han først.
stick-older-not-removed = Den eldre versjonen av Luft kunne ikkje fjernast: { $error }
stick-copy-stopped = Kopieringa av Luft til minnepinnen stoppa: { $error }
stick-not-opened = Minnepinnen kunne ikkje opnast: { $error }
stick-write-stopped = Skrivinga til minnepinnen stoppa: { $error }
stick-not-synced = Minnepinnen tok ikkje imot alt: { $error }
stick-read-back-failed = Minnepinnen kunne ikkje lesast tilbake: { $error }
stick-in-use = Minnepinnen er framleis i bruk: { $error }
stick-device-in-use = { $device } er framleis i bruk: { $error }
stick-volume-not-opened = Volumet på minnepinnen kunne ikkje opnast: { $error }
stick-volume-in-use = Minnepinnen er framleis i bruk. Lukk det som har filer opne på han, og prøv igjen ({ $error })
stick-not-dismounted = Windows kunne ikkje sleppe minnepinnen: { $error }
stick-not-cleared = Windows kunne ikkje tømme minnepinnen: { $error }
stick-not-refreshed = Windows kunne ikkje sjå på minnepinnen på nytt: { $error }
stick-not-ventoy = Denne minnepinnen brukar ikkje Ventoy lenger.
stick-ventoy-not-opened = Ventoy-partisjonen kunne ikkje opnast: { $error }
stick-ventoy-not-opened-windows = Windows kan ikkje opne Ventoy-partisjonen
stick-udisks-missing = Meet Luft treng UDisks for å bruke minnepinnen: { $error }
