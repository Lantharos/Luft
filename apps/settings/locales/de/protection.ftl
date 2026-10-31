## Shared buttons

settings-protection-cancel = Abbrechen
settings-protection-continue = Weiter
settings-protection-close = Schließen
settings-protection-restart = Neu starten
settings-protection-remove = Entfernen
settings-protection-turn-on = Einschalten
settings-protection-set-up = Einrichten

## Privacy: screen lock

settings-privacy-screen-lock = Bildschirmsperre
settings-privacy-screen-off = Bildschirm schaltet sich aus
settings-privacy-screen-off-hint = Unter „Energie und Akku“ einstellen
settings-privacy-screen-off-after = Nach { $duration }
settings-privacy-screen-off-never = Nie
settings-privacy-lock-when-off = Bildschirm sperren, wenn er sich ausschaltet
settings-privacy-lock-after = Sperren nach
settings-privacy-lock-after-hint = Wie lange gewartet wird, nachdem der Bildschirm aus ist
settings-privacy-lock-immediately = Sofort

## Privacy: location, camera and microphone

settings-privacy-location-services = Ortungsdienste
settings-privacy-location-services-hint = Lässt Apps herausfinden, wo du bist – für Karten, Wetter und Zeitzonen
settings-privacy-camera-allow = Apps die Kamera verwenden lassen
settings-privacy-microphone-allow = Apps das Mikrofon verwenden lassen

## Privacy: file history

settings-privacy-file-history = Dateiverlauf
settings-privacy-remember-files = Zuletzt verwendete Dateien merken
settings-privacy-remember-files-hint = Apps können die Dateien zeigen, die du zuletzt geöffnet hast
settings-privacy-keep-history = Verlauf behalten für
settings-privacy-keep-forever = Unbegrenzt
settings-privacy-clear-history = Verlauf löschen
settings-privacy-clear-history-hint = Jede Datei in der Liste sofort vergessen
settings-privacy-clear = Löschen
settings-privacy-clear-title = Dateiverlauf löschen?
settings-privacy-clear-description = Apps zeigen die zuletzt geöffneten Dateien nicht mehr an. Die Dateien selbst bleiben, wo sie sind.

## Privacy: trash and temporary files

settings-privacy-cleanup = Papierkorb und temporäre Dateien
settings-privacy-empty-trash = Papierkorb automatisch leeren
settings-privacy-delete-temp = Temporäre Dateien automatisch löschen
settings-privacy-delete-temp-hint = Deine Dateien in temporären Ordnern, die zuletzt nichts verwendet hat
settings-privacy-delete-after = Löschen nach
settings-privacy-delete-after-hint = Wie lange Dateien bleiben, bevor sie entfernt werden

## Security: summary at the top of the page

settings-security-protections = Schutzfunktionen
settings-security-protected = Dein Gerät ist geschützt
settings-security-could-be-safer = Dein Gerät könnte sicherer sein
settings-security-not-encrypted-description = Sein Datenträger ist nicht verschlüsselt, daher kann jeder, der ihn ausbaut, deine Dateien lesen.
settings-security-starts-differently-description = Wenn du die Secure-Boot-Einstellungen geändert hast, bestätige das, damit sich der Datenträger wieder von selbst entsperrt.
settings-security-needed-recovery-key = Dein Datenträger brauchte seinen Wiederherstellungsschlüssel
settings-security-needed-recovery-key-description = Verknüpf den Sicherheitschip erneut, damit er sich von selbst entsperrt.
settings-security-firmware-ready-description = Firmware-Updates für deine Hardware liegen unter „Updates“ bereit.
settings-security-encrypted-secure-boot = Dein Datenträger ist verschlüsselt und Secure Boot prüft, wie er startet.
settings-security-encrypted = Dein Datenträger ist verschlüsselt.

## Security: protections

settings-security-secure-boot = Secure Boot
settings-security-secure-boot-description = Nur vertrauenswürdige Software kann diesen Computer starten
settings-security-chip = Sicherheitschip
settings-security-chip-description = Schützt Schlüssel und prüft, wie dieser Computer gestartet ist
settings-firmware-updates-ready = Firmware-Updates sind bereit
settings-firmware-updates-count = { $count ->
    [one] { $count } Update für deine Hardware unter „Updates“
   *[other] { $count } Updates für deine Hardware unter „Updates“
}

## Security: signed startup

settings-security-signed-startup = Signierter Start
settings-security-signed-startup-on = Bootmenü und System sind für diesen Computer signiert
settings-security-signed-startup-purpose = Lässt nur Software starten, die für diesen Computer signiert ist
settings-security-signed-startup-restart = Wird nach einem Neustart verwendet
settings-security-signed-startup-missed = Der Schlüssel wurde beim letzten Neustart nicht hinzugefügt
settings-security-signed-startup-pending = Füg beim Neustart den Schlüssel auf dem blauen Bildschirm hinzu
settings-security-signed-startup-missed-often = Der Schlüssel wurde nach mehreren Neustarts nicht hinzugefügt
settings-security-show-steps = Schritte anzeigen
settings-security-try-again = Erneut versuchen

## Security: games with anti-cheat

settings-security-anti-cheat = Spiele mit Anti-Cheat
settings-security-anti-cheat-ready = Bereit für Spiele mit Anti-Cheat
settings-security-anti-cheat-removing = Entferne beim Neustart die anderen Schlüssel auf dem blauen Bildschirm
settings-security-anti-cheat-luft-key = Epic muss den Schlüssel von Luft noch in seine Liste aufnehmen
settings-security-anti-cheat-ready-description = Spiele können prüfen, wie dieser Computer gestartet ist

## Security: steps on the blue startup screen

settings-security-key-steps-remove = Schlüssel beim Neustart entfernen
settings-security-key-steps-add = Schlüssel beim Neustart hinzufügen
settings-security-key-steps-remove-description = Nach dem Neustart fragt ein blauer Bildschirm, ob Schlüssel entfernt werden sollen. Er wartet nur 10 Sekunden, also drück eine beliebige Taste, sobald er erscheint.
settings-security-key-steps-add-description = Nach dem Neustart fragt ein blauer Bildschirm nach einem neuen Schlüssel. Er wartet nur 10 Sekunden, also drück eine beliebige Taste, sobald er erscheint.
settings-security-key-step-choose = Wähl { $option } und dann { $next }.
settings-security-key-step-confirm = Wähl { $option }.
settings-security-key-step-code = Gib den Code unten ein und drück { $key }.
settings-security-key-step-reboot = Wähl { $option }.
settings-security-key-enter = Eingabe
settings-security-key-code = Code { $code }
settings-security-key-steps-remove-missed = Wenn du ihn verpasst, startet dein Computer wie gewohnt und du kannst es hier erneut versuchen.
settings-security-key-steps-add-missed = Wenn du ihn verpasst, startet dein Computer wie gewohnt und die Schritte erscheinen beim nächsten Neustart wieder, mit einem neuen Code.
settings-security-later = Später
settings-security-restart-now = Jetzt neu starten

## Security: hardware security level

settings-security-hardware = Hardwaresicherheit
settings-security-hardware-level-0 = Deiner Hardware fehlen viele mögliche Schutzfunktionen
settings-security-hardware-level-1 = Deine Hardware hat die grundlegenden Schutzfunktionen
settings-security-hardware-level-2 = Deine Hardware hat die wichtigen Schutzfunktionen
settings-security-hardware-level-3 = Deine Hardware ist gut geschützt
settings-security-hardware-level-4 = Deine Hardware schützt sich im laufenden Betrieb selbst
settings-security-hardware-level-5 = Deine Hardware schützt sich selbst und kann es nachweisen
settings-security-hardware-description = { $summary }, Stufe { $level } von { $highest }.
settings-security-hardware-next = Für die nächste Stufe
settings-security-hardware-highest = Das ist die höchste Stufe, die es gibt.
settings-security-hardware-inactive = Gerade nicht aktiv
settings-security-hardware-fix-maker = { $count ->
    [one] Nur der Hersteller deines Computers kann das nachrüsten, meist mit einem Firmware-Update:
   *[other] Nur der Hersteller deines Computers kann diese nachrüsten, meist mit einem Firmware-Update:
}
settings-security-hardware-fix-firmware = { $count ->
    [one] Das lässt sich in den Firmware-Einstellungen deines Computers einschalten:
   *[other] Diese lassen sich in den Firmware-Einstellungen deines Computers einschalten:
}
settings-security-hardware-fix-system = { $count ->
    [one] Das hängt davon ab, wie das System eingerichtet ist:
   *[other] Diese hängen davon ab, wie das System eingerichtet ist:
}
settings-security-hardware-fix-unknown = { $count ->
    [one] Das ist auf diesem Computer nicht verfügbar:
   *[other] Diese sind auf diesem Computer nicht verfügbar:
}

## Security: USB protection

settings-usb-hold-back = Neue USB-Geräte zurückhalten
settings-usb-hold-back-description = Geräte, die im gesperrten Zustand angesteckt werden, warten, bis du entsperrst

## Device encryption

settings-encryption = Geräteverschlüsselung
settings-encryption-not-encrypted = Aus
settings-encryption-not-encrypted-reinstall = Aus, und dieser Computer lässt sich nur durch eine erneute Installation von Luft verschlüsseln
# Button that opens the steps to encrypt this computer
settings-encryption-turn-on = Einschalten
settings-encryption-after-restart = Beginnt mit dem Verschlüsseln, wenn du neu startest
settings-encryption-encrypting = Wird verschlüsselt, { $percent } erledigt
settings-encryption-encrypting-paused = Wird verschlüsselt, bei { $percent } angehalten, bis der Computer angeschlossen ist
# Button that takes back the request to encrypt before the computer restarts
settings-encryption-dont-encrypt = Nicht verschlüsseln
settings-encryption-turn-on-title = Diesen Computer verschlüsseln
settings-encryption-turn-on-blocked = Dieser Computer lässt sich gerade nicht verschlüsseln
settings-encryption-turn-on-description = Deine Dateien bleiben, wo sie sind.
settings-encryption-check-in-place = Luft kann seine Partition an Ort und Stelle verschlüsseln.
settings-encryption-check-not-in-place = Die Partition von Luft lässt sich nicht an Ort und Stelle verschlüsseln. Installiere Luft erneut, um sie zu verschlüsseln.
settings-encryption-check-plugged-in = Der Computer ist angeschlossen.
settings-encryption-check-on-battery = Schließe den Computer an. Das Verschlüsseln dauert eine Weile, und der Strom sollte nicht mittendrin ausgehen.
settings-encryption-save-key-title = Wiederherstellungsschlüssel speichern
settings-encryption-save-key-description = Bewahre ihn an einem anderen Ort als diesem Computer auf.
settings-encryption-unlock-title = So wird entsperrt
settings-encryption-unlock-chip = Der Sicherheitschip entsperrt den Datenträger beim Start des Computers von selbst, solange sich nichts daran ändert, wie er startet.
settings-encryption-unlock-passphrase = Wähle eine Passphrase, die du bei jedem Start des Computers eingibst.
settings-encryption-ready-title = Bereit zum Verschlüsseln
settings-encryption-summary-room = Luft schafft jetzt Platz auf seiner Partition und beginnt beim Neustart mit dem Verschlüsseln.
settings-encryption-summary-background = Danach verschlüsselt es im Hintergrund, während du den Computer benutzt. Lass ihn angeschlossen. Eine Unterbrechung hält es nur an.
settings-encryption-summary-chip = Bis es fertig ist, verwahrt der Sicherheitschip den Wiederherstellungsschlüssel, sodass beim Neustart nichts abgefragt wird.
settings-encryption-summary-recovery-key = Bis es fertig ist, wird beim Start der Wiederherstellungsschlüssel statt deiner Passphrase abgefragt.
# Button, verb: starts encrypting this computer
settings-encryption-encrypt = Verschlüsseln
settings-encryption-making-room = Platz wird geschaffen…
settings-encryption-unlocks-chip-pin = Entsperrt mit dem Sicherheitschip und deiner PIN
settings-encryption-unlocks-chip = Entsperrt von selbst mit dem Sicherheitschip
settings-encryption-unlocks-passphrase = Fragt beim Start nach deiner Passphrase
settings-encryption-unlocks-security-key = Entsperrt beim Start mit deinem Sicherheitsschlüssel
settings-encryption-unlocks-recovery-key = Fragt beim Start nach deinem Wiederherstellungsschlüssel

## Device encryption: other drives

settings-encryption-drives = Andere Laufwerke
settings-encryption-drives-hint = Andere Laufwerke und USB-Sticks in Datenträger verschlüsseln
settings-encryption-drives-open = Datenträger öffnen
settings-encryption-drive-encrypting = Ein Laufwerk wird verschlüsselt, { $percent } erledigt
settings-encryption-drive-encrypting-paused = Ein Laufwerk wird verschlüsselt, bei { $percent } angehalten
settings-encryption-drive-decrypting = Ein Laufwerk wird entschlüsselt, { $percent } erledigt
settings-encryption-drive-decrypting-paused = Ein Laufwerk wird entschlüsselt, bei { $percent } angehalten
settings-encryption-drives-auto-unlock = { $count ->
    [one] { $count } verschlüsseltes Laufwerk entsperrt sich mit diesem Computer
   *[other] { $count } verschlüsselte Laufwerke entsperren sich mit diesem Computer
}

## Device encryption: unlocking the disk

settings-encryption-unlocking = Entsperren des Datenträgers
settings-encryption-starts-differently = Dieser Computer startet jetzt anders
settings-encryption-starts-differently-description = Seine Secure-Boot-Einstellungen haben sich geändert, deshalb hat der Datenträger nach dem Wiederherstellungsschlüssel gefragt. Wenn du das geändert hast, bestätige es, damit er sich wieder von selbst entsperrt
settings-encryption-confirm = Bestätigen
settings-encryption-asked-recovery-key = Dein Datenträger hat nach seinem Wiederherstellungsschlüssel gefragt
settings-encryption-relink-description = Verknüpf den Sicherheitschip erneut, damit er sich von selbst entsperrt
settings-encryption-relink = Erneut verknüpfen
settings-encryption-chip-unlock = Mit dem Sicherheitschip entsperren
settings-encryption-chip-unlock-on = Solange sich nichts daran ändert, wie dieser Computer startet
settings-encryption-chip-unlock-off = Damit du beim Start keine Passphrase eingeben musst
settings-encryption-pin = PIN beim Start
settings-encryption-pin-description = Du gibst sie ein, bevor der Datenträger entsperrt wird
settings-encryption-change = Ändern
settings-encryption-add-pin-row = PIN beim Start hinzufügen
settings-encryption-add-pin-row-description = Hält den Datenträger gesperrt, selbst wenn der Computer mitgenommen wird
settings-encryption-add-pin = PIN hinzufügen
settings-encryption-new-key-description = Dein Datenträger hatte noch keinen Wiederherstellungsschlüssel. Bewahre diesen nicht auf diesem Computer auf.
settings-encryption-stop-chip-title = Nicht mehr mit dem Sicherheitschip entsperren?
settings-encryption-stop-chip-passphrase = Dein Computer fragt dann bei jedem Start nach deiner Passphrase.
settings-encryption-stop-chip-recovery-key = Dein Computer fragt dann bei jedem Start nach deinem Wiederherstellungsschlüssel, halte ihn also griffbereit.
settings-encryption-stop-chip = Nicht mehr entsperren
settings-encryption-remove-pin-title = PIN entfernen?
settings-encryption-remove-pin-description = Der Datenträger entsperrt sich beim Start des Computers wieder von selbst.
settings-encryption-remove-pin = PIN entfernen
settings-encryption-unlock-disk-title = Datenträger entsperren
settings-encryption-unlock-disk-description = Für diese Änderung brauchst du deinen Wiederherstellungsschlüssel oder die Passphrase, die du beim Start des Computers eingibst.
settings-encryption-unlock-disk-field = Wiederherstellungsschlüssel oder Passphrase

## Device encryption: security chip and PIN

settings-encryption-ask-pin = Zusätzlich nach einer PIN fragen
settings-encryption-chip-setup-description = Der Sicherheitschip in deinem Computer entsperrt den Datenträger beim Start von selbst, du musst also vorher keine Passphrase mehr eingeben.
settings-encryption-add-pin-title = PIN hinzufügen
settings-encryption-add-pin-description = Du gibst sie bei jedem Start des Computers ein. Ohne sie bleibt der Datenträger gesperrt, selbst wenn jemand den ganzen Computer mitnimmt.
settings-encryption-change-pin-title = PIN ändern
settings-encryption-change-pin-description = Du gibst die neue PIN bei jedem Start des Computers ein.
settings-encryption-change-pin = PIN ändern
settings-encryption-relink-title = Sicherheitschip erneut verknüpfen
settings-encryption-relink-pin-description = Gib die PIN ein, die du beim Start verwenden möchtest.
settings-encryption-ask-pin-step = Fügt beim Start einen Schritt hinzu.
settings-encryption-pin-field = PIN
settings-encryption-new-pin-field = Neue PIN
settings-encryption-pin-length = { $min } bis { $max } Ziffern
settings-encryption-pin-digits-only = Nur Ziffern verwenden
settings-encryption-pin-too-short = { $min ->
    [one] Mindestens { $min } Ziffer verwenden
   *[other] Mindestens { $min } Ziffern verwenden
}
settings-encryption-pin-too-long = { $max ->
    [one] Höchstens { $max } Ziffer verwenden
   *[other] Höchstens { $max } Ziffern verwenden
}
settings-encryption-pins-differ = Die PINs stimmen nicht überein
settings-encryption-confirm-field = Bestätigen
settings-encryption-type-again = Erneut eingeben

## Recovery key

settings-recovery-title = Wiederherstellungsschlüssel
settings-recovery-description = Bringt dich hinein, wenn sich der Datenträger nicht von selbst entsperren kann
settings-recovery-show = Anzeigen
settings-recovery-replace = Ersetzen
settings-recovery-replace-title = Wiederherstellungsschlüssel ersetzen?
settings-recovery-replace-description = Dein aktueller Schlüssel funktioniert dann nicht mehr und du bekommst einen neuen zum Speichern.
settings-recovery-replace-key = Schlüssel ersetzen
settings-recovery-shown-title = Dein Wiederherstellungsschlüssel
settings-recovery-shown-description = Gib ihn ein, falls dein Computer beim Start einmal nach einem Wiederherstellungsschlüssel fragt. Bewahre eine Kopie nicht auf diesem Computer auf.
settings-recovery-fresh-title = Speichere deinen neuen Wiederherstellungsschlüssel
settings-recovery-fresh-description = Dein bisheriger Schlüssel funktioniert nicht mehr. Bewahre diesen auf Papier oder in einem Passwortmanager auf.

## Passwords and keys (the keyring)

settings-passwords-title = Passwörter und Schlüssel
settings-passwords-not-running = Dein Schlüsselbund läuft nicht
settings-passwords-not-running-description = Deine Passwörter und Schlüssel erscheinen hier, sobald er startet
settings-passwords-locked = Gesperrt
settings-passwords-contents = { $count ->
    [0] Noch nichts gespeichert
    [one] { $count } Passwort oder Schlüssel
   *[other] { $count } Passwörter und Schlüssel
}
settings-passwords-protected-chip = Geschützt durch dein Passwort und den Sicherheitschip
settings-passwords-protected = Geschützt durch dein Passwort
settings-passwords-unlock = Entsperren
settings-passwords-lock = Sperren
settings-passwords-seal-title = Mit dem Sicherheitschip versiegeln
settings-passwords-seal-description = Kopien davon lassen sich auf keinem anderen Computer öffnen
settings-passwords-seal = Versiegeln
settings-passwords-fingerprint-on = Entsperrt mit deinem Fingerabdruck
settings-passwords-fingerprint-on-description = Wenn du dich damit anmeldest, werden auch deine Passwörter entsperrt
settings-passwords-fingerprint = Mit Fingerabdruck entsperren
settings-passwords-fingerprint-description = Füg zuerst unter „Benutzer“ einen Fingerabdruck hinzu
settings-passwords-pin = Nach dem Fingerabdruck nach einer PIN fragen
settings-passwords-pin-locked = Entsperr deinen Schlüsselbund, um das zu ändern
settings-passwords-pin-description = Damit ein Fingerabdruck allein sie nicht entsperren kann
settings-passwords-lock-with-screen = Mit dem Bildschirm sperren
settings-passwords-lock-with-screen-description = Sie werden zusammen mit dem Bildschirm gesperrt und entsperrt
settings-passwords-apps = App-Anmeldedaten und Aktivität
settings-passwords-apps-locked = Entsperr deinen Schlüsselbund, um sie zu sehen
settings-passwords-apps-description = Was Apps hier aufbewahren und wann sie es verwendet haben
settings-passwords-apps-allowed = Welche Apps deine Passwörter verwenden dürfen
settings-passwords-apps-allowed-hint = Unter „Apps“ einstellen

## Passwords and keys: apps with access

settings-passwords-stores = Anmeldedaten von Apps
settings-passwords-stores-description = Anmeldedaten, die manche Apps hier ablegen und die nur die jeweilige App lesen kann.
settings-passwords-stores-count = { $count ->
    [one] { $count } gespeicherte Anmeldung
   *[other] { $count } gespeicherte Anmeldungen
}
settings-passwords-forget = Entfernen
settings-passwords-forget-title = Gespeichertes von { $app } entfernen?
settings-passwords-forget-description = { $app } verliert die Anmeldedaten, die hier abgelegt waren, daher musst du dich dort eventuell erneut anmelden.

## Passwords and keys: recent access

settings-passwords-history = Letzte Zugriffe
settings-passwords-history-read = { $app } hat „{ $item }“ verwendet
settings-passwords-history-read-unnamed = { $app } hat ein gespeichertes Passwort verwendet
settings-passwords-history-saved = { $app } hat „{ $item }“ gespeichert
settings-passwords-history-saved-unnamed = { $app } hat ein Passwort gespeichert
settings-passwords-history-deleted = { $app } hat „{ $item }“ gelöscht
settings-passwords-history-deleted-unnamed = { $app } hat ein gespeichertes Passwort gelöscht
settings-passwords-history-denied = { $app } durfte „{ $item }“ nicht verwenden
settings-passwords-history-denied-unnamed = { $app } durfte ein gespeichertes Passwort nicht verwenden
settings-passwords-history-signed = { $app } hat mit „{ $item }“ signiert
settings-passwords-history-signed-unnamed = { $app } hat mit einem gespeicherten Passwort signiert
settings-passwords-history-fewer = Weniger anzeigen
settings-passwords-history-all = { $count ->
    [one] Alle { $count } anzeigen
   *[other] Alle { $count } anzeigen
}
settings-passwords-history-clear = Verlauf löschen
settings-passwords-history-clear-description = Vergessen, welche Apps deinen Schlüsselbund wann verwendet haben
settings-passwords-history-clear-button = Löschen
settings-passwords-history-clear-title = Letzte Zugriffe löschen?
settings-passwords-history-clear-confirm = Die Liste, welche Apps deinen Schlüsselbund wann verwendet haben, wird gelöscht. Deine gespeicherten Passwörter und Schlüssel bleiben, wie sie sind.

## Passwords and keys: SSH keys

settings-passwords-ssh = SSH-Schlüssel
settings-passwords-ssh-description = Schlüssel zum Anmelden an Servern, sicher in deinem Schlüsselbund aufbewahrt.
settings-passwords-ssh-unnamed = Unbenannter Schlüssel
settings-passwords-ssh-in-chip = Im Sicherheitschip aufbewahrt
settings-passwords-ssh-added = Hinzugefügt { $when }
settings-passwords-ssh-copy = Öffentlichen Schlüssel von { $name } kopieren
settings-passwords-ssh-remove = { $name } entfernen
settings-passwords-ssh-confirm = Vor jeder Verwendung fragen
settings-passwords-ssh-confirm-label = Vor jeder Verwendung von { $name } fragen
settings-passwords-ssh-add-row = Schlüssel hinzufügen
settings-passwords-ssh-use = Diese Schlüssel mit SSH verwenden
settings-passwords-ssh-use-description = Die Zeile kopieren, die SSH auf sie verweist
settings-passwords-ssh-copy-line = { $line } kopieren
settings-passwords-ssh-remove-title = „{ $name }“ entfernen?
settings-passwords-ssh-remove-chip = Er existiert nur im Sicherheitschip dieses Computers und ist damit endgültig weg. Server, die nur diesen Schlüssel akzeptieren, lassen dich damit nicht mehr hinein.
settings-passwords-ssh-remove-description = Server, die nur diesen Schlüssel akzeptieren, lassen dich damit nicht mehr hinein. Das kann nicht rückgängig gemacht werden.
settings-passwords-ssh-add-title = SSH-Schlüssel hinzufügen
settings-passwords-ssh-add-description = Auf diesem Computer wird ein neuer Schlüssel erstellt. Kopier seinen öffentlichen Schlüssel auf die Server, an denen du dich anmelden möchtest.
settings-passwords-ssh-name = Name
settings-passwords-ssh-name-placeholder = Zum Beispiel Arbeitslaptop
settings-passwords-ssh-chip = Im Sicherheitschip aufbewahren
settings-passwords-ssh-chip-description = Er kann nie von diesem Computer kopiert werden, nicht einmal von dir
settings-passwords-ssh-chip-unsupported = Der Sicherheitschip dieses Computers kann keine SSH-Schlüssel aufnehmen
settings-passwords-ssh-add = Schlüssel hinzufügen

## Passkeys

settings-passkeys-title = Passkeys
settings-passkeys-unavailable = Entsperr deinen Schlüsselbund, um deine Passkeys zu sehen.
settings-passkeys-chip-fingerprint = Vom Sicherheitschip dieses Computers versiegelt. Jede Anmeldung fragt nach deinem Fingerabdruck oder Passwort.
settings-passkeys-chip-password = Vom Sicherheitschip dieses Computers versiegelt. Jede Anmeldung fragt nach deinem Passwort.
settings-passkeys-password-fingerprint = Mit deinem Passwort verschlüsselt. Jede Anmeldung fragt nach deinem Fingerabdruck oder Passwort.
settings-passkeys-password = Mit deinem Passwort verschlüsselt. Jede Anmeldung fragt nach deinem Passwort.
settings-passkeys-last-used = Zuletzt verwendet { $when }
settings-passkeys-never-used = Nie verwendet
settings-passkeys-password-only = Geschützt durch dein Passwort
settings-passkeys-unreachable = Browser können deine Passkeys nicht erreichen
settings-passkeys-unreachable-description = Sie sind wieder da, sobald der Passkey-Dienst läuft
settings-passkeys-rename-label = Passkey für { $site } umbenennen
settings-passkeys-remove-label = Passkey für { $site } entfernen
settings-passkeys-empty = Noch keine Passkeys
settings-passkeys-empty-description = Passkeys, die Websites erstellen, werden hier für alle Browser gespeichert
settings-passkeys-remove-title = Diesen Passkey entfernen?
settings-passkeys-remove-description = Du kannst dich damit nicht mehr bei { $site } anmelden, also sorg dafür, dass du einen anderen Zugang hast.
settings-passkeys-rename-title = Passkey umbenennen
settings-passkeys-rename-description = Gib deinem Passkey für { $site } einen Namen, den du wiedererkennst.
settings-passkeys-name = Name
settings-passkeys-save = Speichern

## Apps

settings-apps-defaults = Standard-Apps
settings-apps-defaults-description = Werden verwendet, wenn du Links, Dateien und Ordner öffnest
settings-apps-browser = Webbrowser
settings-apps-email = E-Mail
settings-apps-calendar = Kalender
settings-apps-music = Musik
settings-apps-videos = Videos
settings-apps-photos = Fotos
settings-apps-text-editor = Texteditor
settings-apps-files = Dateien
settings-apps-archives = Archive
settings-apps-choose = Auswählen
settings-apps-startup = Autostart
settings-apps-startup-description = Diese Apps öffnen sich, wenn du dich anmeldest
settings-apps-startup-app = { $app } bei der Anmeldung öffnen
settings-apps-startup-remove = { $app } aus dem Autostart entfernen
settings-apps-startup-add = App hinzufügen
settings-apps-startup-add-title = Autostart-App hinzufügen
settings-apps-startup-add-description = Wähl eine App, die sich bei jeder Anmeldung öffnet.
settings-apps-search = Apps suchen
settings-apps-no-match = Keine Apps passen zu deiner Suche
settings-apps-cancel = Abbrechen

## Apps: permissions

settings-apps-permissions = Berechtigungen
settings-apps-location = Standort
settings-apps-camera = Kamera
settings-apps-clipboard = Zwischenablage im Hintergrund
settings-apps-full-access = Vollzugriff
settings-apps-full-access-hint = Die App läuft außerhalb ihrer Sandbox und kann alles, was ein selbst gestartetes Programm kann. Das Entfernen gilt ab dem nächsten Start.
settings-apps-full-access-remove = Entfernen
settings-apps-full-access-remove-app = Vollzugriff von { $app } entfernen
settings-apps-passwords = Gespeicherte Passwörter
settings-apps-passwords-forget = Vergessen
settings-apps-passwords-forget-app = { $app } erneut fragen lassen
settings-apps-permissions-allowed = { $allowed } von { $total } zugelassen
settings-apps-permissions-description = Apps in einer Sandbox bekommen ihre eigenen Dateien und nur das, was du hier erlaubst.
settings-apps-sandbox-only = Nichts außerhalb ihrer Sandbox
settings-apps-folders = Ordner
settings-apps-folders-hint = Ab dem nächsten Start kann die App alles in diesen Ordnern lesen und ändern.
settings-apps-folders-count = { $count ->
    [one] { $count } Ordner
   *[other] { $count } Ordner
}
settings-apps-folder-add = Ordner hinzufügen
settings-apps-folder-remove = Entfernen
settings-apps-folder-remove-app = { $folder } nicht mehr freigeben
settings-apps-usb = USB-Geräte
settings-apps-usb-hint = Etwa Sicherheitsschlüssel, Telefone und Mikrocontroller
settings-apps-serial = Serielle Geräte
settings-apps-serial-hint = Etwa 3D-Drucker und über USB verbundene Platinen
settings-apps-folder-read-only = Nur lesen
settings-apps-downloads = Downloads-Ordner
settings-apps-downloads-hint = Sie kann ab dem nächsten Öffnen Dateien im Ordner „Downloads“ speichern und die dortigen öffnen.
settings-apps-internet = Internet
settings-apps-internet-hint = Sie kann ab dem nächsten Öffnen online gehen.
settings-apps-service-hint = Ein Dienst auf deinem Desktop, mit dem sie sprechen kann
settings-apps-service-remove = Entfernen
settings-apps-service-remove-app = Zugriff auf { $service } entziehen
settings-apps-services-count = { $count ->
    [one] { $count } Dienst
   *[other] { $count } Dienste
}
settings-apps-full-access-off = Die App läuft in einer Sandbox. Vollzugriff hebt die Sandbox auf.
settings-apps-full-access-give = Vollzugriff geben
