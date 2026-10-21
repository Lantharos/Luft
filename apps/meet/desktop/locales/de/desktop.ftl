## What Meet Luft finds when it checks a computer
## Each finding has a title and a line of detail below it.

check-processor-x64 = 64-Bit-Prozessor von Intel oder AMD
check-processor-x64-detail = Luft läuft darauf.
check-processor-arm = Arm-Prozessor
check-processor-arm-detail = Luft läuft vorerst nur auf Prozessoren von Intel und AMD.
check-processor-32-bit-windows = 32-Bit-Windows
check-processor-32-bit-system = 32-Bit-System
check-processor-32-bit-detail = Luft braucht einen 64-Bit-Prozessor von Intel oder AMD.
check-startup-uefi = Startet mit UEFI
check-startup-uefi-windows = Luft startet auf dieselbe moderne Weise.
check-startup-uefi-linux = Luft fügt einen eigenen Starteintrag hinzu, und { $system } startet weiter wie bisher.
check-startup-bios = Startet im alten BIOS-Modus
check-startup-bios-windows = Luft braucht UEFI. Windows kann mit MBR2GPT umgestellt werden, danach lässt sich UEFI in den Firmware-Einstellungen einschalten.
check-startup-bios-linux = Luft braucht UEFI. Stell in den Firmware-Einstellungen auf UEFI um, auch für das vorhandene System, und prüf dann erneut.
check-startup-mbr = Der Datenträger hat eine alte Partitionstabelle
check-startup-mbr-windows = Luft braucht einen GPT-Datenträger. Windows kann ihn mit MBR2GPT umwandeln, ohne Dateien zu verlieren.
check-startup-mbr-linux = Luft braucht einen GPT-Datenträger, um davon zu starten.
check-startup-no-esp = Keine EFI-Systempartition
check-startup-no-esp-detail = Luft legt seine Startdateien neben die vorhandenen auf der EFI-Systempartition, und es gibt keine.
check-startup-esp-full = Die EFI-Systempartition ist voll
check-startup-esp-full-detail = Luft braucht dort { $size } MB für seine Startdateien. Meist belegen alte Kernel oder Starteinträge den Platz.
check-folder-fine = Keine Partitionen werden geändert
check-folder-fine-detail = Luft liegt als Datei auf deinem { $filesystem }-Datenträger und startet von dort.
check-folder-encrypted = Deine Dateien liegen auf einem verschlüsselten Datenträger
check-folder-encrypted-detail = Luft kann noch nicht von einem verschlüsselten Datenträger starten. Probier es stattdessen mit einem USB-Stick aus.
check-folder-combined = Deine Dateien verteilen sich auf mehrere Partitionen
check-folder-combined-detail = Luft kann noch nicht von LVM oder RAID starten. Probier es stattdessen mit einem USB-Stick aus.
check-folder-filesystem = Luft kann nicht von { $filesystem } starten
check-folder-filesystem-detail = Es startet von ext4-, btrfs- und XFS-Datenträgern. Probier es stattdessen mit einem USB-Stick aus.
check-space-free = { $size } GB frei
check-space-free-linux = Luft belegt beim Ausprobieren etwa { $size } GB.
check-space-up-to = Bis zu { $size } GB für Luft
check-space-up-to-detail = Windows behält seine Dateien und Platz zum Wachsen.
check-space-free-already = Davon sind schon { $size } GB frei, also gibt Windows weniger ab.
check-space-other-drive = Auf { $drive } ist Platz dafür.
check-space-erase-drive = Auf { $drive } ist Platz dafür, sobald dieser Datenträger gelöscht ist.
check-space-short = Nicht genug freier Speicherplatz
check-space-short-windows = Luft braucht etwa { $needed } GB, die Windows abgeben kann. Gib in Windows { $missing } GB frei, zum Beispiel mit der Datenträgerbereinigung, und prüf dann erneut.
check-space-short-linux = Luft braucht etwa { $needed } GB zum Starten. Gib { $missing } GB frei und prüf dann erneut.
check-system-replaceable = Luft kann an seine Stelle treten und deine Dateien, dein Konto und deine Einstellungen behalten.
check-system-single = Deine Dateien liegen auf derselben Partition wie das System, daher wird das Ersetzen mit Beibehalten deiner Dateien noch nicht unterstützt. Ausprobieren und Installieren funktionieren.
check-system-encrypted = Es ist verschlüsselt, daher wird das Ersetzen mit Beibehalten deiner Dateien noch nicht unterstützt.
check-system-unknown = Sein Datenträger ist so aufgeteilt, dass Luft ihn noch nicht unter Beibehalten deiner Dateien ersetzen kann.
check-encryption-off = Windows ist nicht verschlüsselt
check-encryption-off-detail = „Luft installieren“ kann seine Einstellungen und deine Bluetooth-Geräte lesen.
check-encryption-on = Windows ist mit BitLocker verschlüsselt
check-encryption-on-detail = Kein Problem. Windows schafft den Platz selbst, und Meet Luft bringt mit, was Luft von einem gesperrten Datenträger nicht lesen kann. Halte deinen Wiederherstellungsschlüssel für alle Fälle bereit.
check-encryption-changing = BitLocker ver- oder entschlüsselt noch
check-encryption-changing-detail = Warte, bis Windows fertig ist, und komm dann zurück. Wie weit es ist, siehst du in den Einstellungen unter „Geräteverschlüsselung“.
check-fast-startup-on = Schnellstart ist aktiviert
check-fast-startup-on-detail = Windows geht in den Ruhezustand, statt herunterzufahren, und hält so seinen Datenträger gesperrt. Meet Luft bietet an, ihn vor der Installation auszuschalten.
check-fast-startup-off = Schnellstart ist deaktiviert
check-fast-startup-off-detail = Windows fährt vollständig herunter.
check-secure-boot-on = Secure Boot ist an
check-secure-boot-on-detail = Es kann an bleiben. Luft fragt einmal auf einem blauen Bildschirm, ob sein Schlüssel hinzugefügt werden soll.
check-secure-boot-off = Secure Boot ist aus
check-secure-boot-off-detail = Luft funktioniert auch ohne, aber Spiele mit Anti-Cheat brauchen es. { $turningOn }
check-secure-boot-restart-into = Meet Luft kann in die Firmware-Einstellungen neu starten, wo es unter { $place } zu finden ist.
check-secure-boot-restart-into-anywhere = Meet Luft kann in die Firmware-Einstellungen neu starten, wo es meist unter Security oder Boot zu finden ist.
check-secure-boot-turn-on = Starte zum Einschalten neu, drück { $key }, sobald das { $maker }-Logo erscheint, und geh dann zu { $place }.
check-secure-boot-turn-on-anywhere = Öffne zum Einschalten beim Start des Computers die Firmware-Einstellungen und sieh unter Security oder Boot nach.

## Where Secure Boot is in the firmware settings of each computer brand
## The menu names are the ones the firmware shows, which is usually in English.

check-firmware-place-security = Security, dann Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, dann Secure Boot
check-firmware-place-security-or-advanced = Security oder Advanced, dann Secure Boot Configuration
check-firmware-place-security-or-boot = Security oder Boot, dann Secure Boot
check-firmware-place-boot = Boot, dann Secure Boot
check-firmware-place-settings = Settings, dann Security, dann Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 bei einem ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 oder Entf
check-firmware-key-delete = Entf
check-firmware-key-volume-up = Lauter-Taste

## More of the computer's hardware

check-tpm-detail = Ein verschlüsseltes Luft kann sich beim Start des Computers von selbst entsperren.
check-tpm-missing = Kein TPM 2.0
check-tpm-missing-detail = Wenn du Luft verschlüsselst, fragt es bei jedem Start nach einer Passphrase.
check-graphics = Grafik
check-graphics-detail = Funktioniert sofort.
check-graphics-nvidia = Luft wird mit dem Treiber von NVIDIA installiert.
check-wifi-missing = Kein WLAN
check-wifi-missing-detail = Verwende in Luft ein Netzwerkkabel, oder gar keins.
check-wifi-detail = Funktioniert in Luft.
check-wifi-broadcom = Manche WLAN-Chips von Broadcom brauchen einen Treiber, den Luft nicht mitbringt. Halte ein Netzwerkkabel oder ein Handy für USB-Tethering bereit.
check-start-entries = { $count ->
    [one] Ein alter Starteintrag
   *[other] { $count } alte Starteinträge
}
check-start-entries-detail = { $count ->
    [one] { $names } verweist auf ein System, das nicht mehr auf diesem PC ist. Es kann weggeräumt werden.
   *[other] { $names } verweisen auf Systeme, die nicht mehr auf diesem PC sind. Sie können weggeräumt werden.
}
check-download-unavailable = Luft kann gerade nicht heruntergeladen werden
check-download-unavailable-detail = Meet Luft lädt etwa 3 GB herunter. Prüf, ob du online bist, und prüf erneut, oder verwende eine vorhandene Luft-ISO.

## Choosing a Luft ISO file

iso-dialog-title = Luft-ISO wählen
iso-dialog-filter = Luft-ISO

## Saving the logs from trying Luft
## "Try Luft" is starting Luft for a try without installing it.

logs-file-name = Luft-Protokolle { $name }
logs-no-desktop = Meet Luft konnte deinen Desktop nicht finden
logs-not-saved = Meet Luft konnte die Protokolle von „Luft ausprobieren“ nicht speichern: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission
## Wherever it appears, $error is the system's own description of the problem.

helper-not-started = Das Hilfsprogramm von Meet Luft ist nicht gestartet: { $error }
helper-not-allowed = Meet Luft durfte nicht am Datenträger arbeiten
helper-stopped = Das Hilfsprogramm von Meet Luft wurde beendet
helper-stopped-because = Das Hilfsprogramm von Meet Luft wurde beendet: { $error }
helper-pipe-failed = Meet Luft konnte nicht mit seinem Hilfsprogramm kommunizieren: { $error }
helper-pipe-hijacked = Etwas anderes als das Hilfsprogramm von Meet Luft hat { $pipe } geöffnet
helper-record-not-saved = Meet Luft konnte nicht festhalten, was es angelegt hat: { $error }
helper-no-room-yet = Schaff zuerst Platz für Luft.
helper-not-ready-linux = Bereite Luft zuerst vor.
helper-not-ready-to-start-windows = Luft ist noch nicht startbereit. Schaff zuerst Platz dafür.
helper-not-ready-to-start-linux = Luft ist noch nicht startbereit. Bereite es zuerst vor.
helper-update-unfinished = Das Aktualisieren von Luft wurde nicht abgeschlossen. Aktualisiere es zuerst erneut.
helper-room-too-small = Luft braucht mehr Platz.
helper-room-shortfall = Windows kann { $available } GB abgeben, und Luft braucht { $needed } GB.
helper-gap-shortfall = Dieser Bereich fasst { $available } GB, und Luft braucht { $needed } GB.
helper-place-gone = Dieser Platz ist nicht mehr frei. Prüf erneut, um zu sehen, wo Luft hinpasst.
helper-box-shortfall = Windows kann noch { $available } GB abgeben, und deine Auswahl braucht { $needed } GB.
helper-box-room-shortfall = Im Platz von Luft sind noch { $available } GB übrig, und deine Auswahl braucht { $needed } GB.
helper-bluetooth-unreadable = Die Bluetooth-Einstellungen von Windows konnten nicht geöffnet werden
helper-registry-not-opened = { $key } konnte nicht geöffnet werden: { $error }
helper-registry-not-changed = { $value } konnte nicht geändert werden: { $error }
helper-registry-not-saved = { $file } konnte nicht gespeichert werden: { $error }
helper-restart-failed = Der Computer wurde nicht neu gestartet
helper-windows-restart-failed = Windows wurde nicht neu gestartet: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Dieser PC startet nicht mit UEFI
firmware-variable-unreadable = { $name } konnte nicht aus der Firmware gelesen werden: { $error }
firmware-variable-not-saved = { $name } konnte nicht in der Firmware gespeichert werden: { $error }
firmware-entries-full = In der Firmware ist kein Platz für einen weiteren Starteintrag
firmware-entry-kept = Windows hat den Starteintrag { $entry } behalten

## Errors about drives and partitions
## The live partition is the one Luft starts from, the start partition holds its start files,
## and the moving box holds what was packed to take along.

drive-list-failed = Die Datenträger konnten nicht aufgelistet werden: { $error }
drive-of-path-unknown = Es ließ sich nicht feststellen, auf welchem Datenträger { $path } liegt
drive-windows-folder-missing = Der Windows-Ordner wurde nicht gefunden
drive-windows-drive-missing = Der Datenträger von Windows wurde nicht gefunden
drive-windows-drive-missing-because = Der Datenträger von Windows wurde nicht gefunden: { $error }
drive-windows-partition-missing = Die Partition von Windows wurde nicht gefunden
drive-volume-missing = Das Volume { $path } wurde nicht gefunden
drive-storage-error = { $what } (Windows-Speicherfehler { $code })
drive-shrink-size-unknown = Windows konnte nicht ermitteln, wie klein seine Partition werden kann
drive-resize-failed = Windows konnte die Größe seiner Partition nicht ändern
drive-create-failed = Windows konnte keine Partition für Luft anlegen
drive-hide-failed = Windows konnte die neue Partition nicht aus dem Explorer heraushalten
drive-format-failed = Windows konnte die neue Partition nicht formatieren
drive-remove-failed = Windows konnte eine der Partitionen von Luft nicht entfernen
drive-new-partition-missing = Die neue Partition wurde nicht gefunden
drive-new-partition-no-volume = Die neue Partition hat kein Volume
drive-start-no-guid = Die Startpartition hat keine GUID
drive-live-no-guid = Die Live-Partition hat keine GUID
drive-box-no-guid = Der Umzugskarton hat keine GUID
drive-guid-unreadable = Die GUID der Partition ist nicht lesbar
drive-not-gpt = Die Partitionstabelle des Datenträgers ist nicht GPT
drive-start-no-volume = Die Startpartition hat kein Volume
drive-live-no-volume = Die Partition von Luft hat kein Volume
drive-new-live-no-volume = Die neue Partition von Luft hat kein Volume
drive-partitions-not-noted = Die Partitionen von Luft fehlen in den Notizen von Meet Luft
drive-partitions-gone = Die Partitionen von Luft sind verschwunden
drive-partition-gone = Eine Partition ist verschwunden
drive-gone = Ein Datenträger ist verschwunden
drive-erase-failed = Windows konnte den Datenträger nicht löschen
drive-erased-no-room = Auf dem gelöschten Datenträger ist kein Platz für Luft
drive-start-partition-foreign = Die Startpartition von Luft wurde nicht von Meet Luft angelegt
drive-start-partition-gone = Die Startpartition von Luft ist weg
drive-start-partition-not-listed = Die Startpartition von Luft steht nicht in der Partitionstabelle
drive-no-esp = Dieser Computer hat keine EFI-Systempartition
drive-esp-full = Die EFI-Systempartition ist zu voll für die Startdateien von Luft.
drive-esp-not-opened = Die EFI-Systempartition konnte nicht geöffnet werden
drive-esp-file-unreadable = { $file } auf der EFI-Systempartition ist nicht lesbar
drive-esp-no-drive = Die EFI-Systempartition hat keinen Datenträger
drive-esp-no-guid = Die EFI-Systempartition hat keine GUID
drive-no-uuid = Der Datenträger, auf dem Luft liegt, hat keine UUID
drive-folder-unreadable = Luft kann nicht von dem Datenträger starten, auf dem deine Dateien liegen.
drive-folder-not-startable = Von { $folder } kann nicht gestartet werden

## Errors while changing Luft once it's installed

luft-gone = Luft ist nicht mehr auf diesem PC
luft-not-resizable = Die Größe von Luft lässt sich gerade nicht von Windows aus ändern
luft-size-not-allowed = So groß oder klein kann Luft nicht sein
luft-space-promised = Dieser Platz ist für Luft zurückgelegt. Brich zuerst die Änderung ab.
luft-no-start-entry = Der Starteintrag von Luft wurde nicht gefunden

## Errors while getting Luft

live-no-home-folder = Es gibt keinen persönlichen Ordner, in dem Luft liegen kann
live-no-app-data-folder = Es gibt keinen lokalen App-Datenordner, in dem Luft liegen kann
live-pointer-unreadable = Das neueste Luft ist nicht lesbar
live-not-published = Luft ist dort nicht veröffentlicht
live-checksum-unreadable = Die Prüfsummendatei ist nicht lesbar
live-checksum-not-read = Die Prüfsumme von Luft konnte nicht gelesen werden: { $error }
live-download-damaged = Der Download wurde unterwegs beschädigt. Versuch es erneut.
live-download-incomplete = Im heruntergeladenen Luft fehlt { $file }
live-download-not-resumable = Der Server kann den Download nicht fortsetzen
live-not-signed = { $iso } ist nicht signiert
live-signature-unreadable = Die Signatur von { $iso } ist nicht lesbar
live-signature-wrong-key = { $iso } ist nicht von Lantharos signiert
live-signature-other-iso = Die Signatur gehört zu { $signed }, nicht zu { $iso }
live-iso-out-of-order = Die Dateien der ISO liegen nicht in einer Reihenfolge, die Meet Luft lesen kann
live-iso-not-iso = Das ist kein ISO-Abbild
live-iso-no-root = Die ISO hat keinen Stammordner
live-iso-no-joliet = Die ISO hat keine Joliet-Namen
live-not-removed = { $path } konnte nicht entfernt werden: { $error }

## Errors while making a USB stick
## These are shown in Meet Luft below the list of sticks.

stick-gone = Der Stick ist nicht mehr da. Steck ihn wieder ein und wähl ihn erneut.
stick-too-small = Luft passt nicht auf diesen Stick. Verwende einen mit 4 GB oder mehr.
stick-damaged = Die ISO passt nicht zu ihrer Prüfsumme. Sie wurde unterwegs vielleicht beschädigt.
stick-read-back-differs = Der Stick hat beim Zurücklesen nicht das geliefert, was geschrieben wurde. Er ist vielleicht abgenutzt, versuch es mit einem anderen.
stick-download-unavailable = Luft kann gerade nicht heruntergeladen werden: { $error }
stick-download-failed = Luft konnte nicht heruntergeladen werden: { $error }
stick-checksum-unreadable = Die Prüfsumme der ISO kann nicht gelesen werden: { $error }
stick-file-unreadable = { $path } kann nicht gelesen werden: { $error }
stick-iso-unreadable = Die ISO kann nicht gelesen werden: { $error }
stick-iso-no-name = Die ISO hat keinen Namen
stick-iso-ended-early = Die ISO endet zu früh
stick-iso-already-there = { $name } ist schon auf dem Stick.
stick-no-room = Auf dem Stick ist kein Platz für Luft. Gib zuerst { $size } MB darauf frei.
stick-older-not-removed = Das ältere Luft konnte nicht entfernt werden: { $error }
stick-copy-stopped = Das Kopieren von Luft auf den Stick wurde abgebrochen: { $error }
stick-not-opened = Der Stick konnte nicht geöffnet werden: { $error }
stick-write-stopped = Das Schreiben auf den Stick wurde abgebrochen: { $error }
stick-not-synced = Der Stick hat nicht alles übernommen: { $error }
stick-read-back-failed = Der Stick konnte nicht zurückgelesen werden: { $error }
stick-in-use = Der Stick wird noch verwendet: { $error }
stick-device-in-use = { $device } wird noch verwendet: { $error }
stick-volume-not-opened = Das Volume des Sticks konnte nicht geöffnet werden: { $error }
stick-volume-in-use = Der Stick wird noch verwendet. Schließ alles, was Dateien darauf geöffnet hat, und versuch es erneut ({ $error })
stick-not-dismounted = Windows konnte den Stick nicht freigeben: { $error }
stick-not-cleared = Windows konnte den Stick nicht leeren: { $error }
stick-not-refreshed = Windows konnte den Stick nicht neu einlesen: { $error }
stick-not-ventoy = Dieser Stick verwendet Ventoy nicht mehr.
stick-ventoy-not-opened = Die Ventoy-Partition konnte nicht geöffnet werden: { $error }
stick-ventoy-not-opened-windows = Windows kann die Ventoy-Partition nicht öffnen
stick-udisks-missing = Meet Luft braucht UDisks, um den Stick zu verwenden: { $error }
