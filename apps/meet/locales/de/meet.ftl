## Messages that some steps share
## $platform is "windows" or "linux". Windows calls the computer a PC, Linux a computer.

meet-back = Zurück
meet-cancel = Abbrechen
meet-continue = Weiter
meet-try-again = Erneut versuchen
meet-restart = Neu starten
meet-remove = Entfernen
meet-keep-it = Behalten
meet-close = Schließen
meet-restart-title = Jetzt neu starten?
meet-not-yet = Noch nicht
meet-iso-use = Vorhandene ISO verwenden
meet-iso-using = Deine Luft-ISO wird verwendet
meet-nightly = Nightly-Builds
meet-channel-nightly = Meet Luft verwendet jetzt Nightly-Builds
meet-channel-latest = Meet Luft verwendet wieder Releases
meet-undo = Rückgängig
meet-logs-saved = Die Protokolle von „Luft ausprobieren“ wurden auf deinem Desktop gespeichert
meet-logs-show = Anzeigen
meet-logs-none = Es gibt noch keine Protokolle von „Luft ausprobieren“
meet-logs-failed = Meet Luft konnte die Protokolle von „Luft ausprobieren“ nicht speichern

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft konnte die Prüfung dieses Computers nicht abschließen.
   *[windows] Meet Luft konnte die Prüfung dieses PCs nicht abschließen.
}
problem-room = Das Platzschaffen für Luft wurde nicht abgeschlossen.
problem-room-linux = Das Vorbereiten von Luft wurde nicht abgeschlossen.
problem-update = Das Aktualisieren von Luft wurde nicht abgeschlossen.
problem-download = Der Download von Luft wurde unterbrochen. Prüf, ob du online bist.
problem-pack = Das Einpacken deiner Sachen wurde nicht abgeschlossen.
problem-remove = Das Entfernen von Luft wurde nicht abgeschlossen.
problem-restart = Meet Luft konnte den Neustart nicht vorbereiten.
problem-tidy = Die alten Starteinträge konnten nicht entfernt werden.
problem-firmware = Meet Luft konnte die Firmware-Einstellungen nicht öffnen.
problem-folders = Meet Luft konnte deine Ordner nicht durchsehen.
problem-sticks = Meet Luft konnte nicht nach USB-Laufwerken suchen.
problem-stick = Das Erstellen des Sticks wurde nicht abgeschlossen.
problem-offer = Luft kann gerade nicht heruntergeladen werden. Prüf, ob du online bist, oder verwende eine vorhandene ISO.
problem-declined = { $platform ->
    [linux] Meet Luft braucht deine Erlaubnis, um am Datenträger zu arbeiten. Gib dein Passwort ein, wenn danach gefragt wird.
   *[windows] Meet Luft braucht deine Erlaubnis, um am Datenträger zu arbeiten. Wähl „Ja“, wenn Windows fragt.
}

## First screen

hello-intro = { $platform ->
    [linux] Probier Luft direkt von hier aus, ohne USB-Stick. Wenn es dir gefällt, kann Luft an die Stelle dieses Systems treten und deine Dateien behalten.
   *[windows] Luft kann direkt neben Windows leben. Probier es erst aus, ohne etwas zu installieren, und nimm deine Sachen mit, wenn du so weit bist.
}
hello-check = { $platform ->
    [linux] Diesen Computer prüfen
   *[windows] Diesen PC prüfen
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Dieser Computer wird geprüft
   *[windows] Dieser PC wird geprüft
}
check-ready-title = { $platform ->
    [linux] Dieser Computer ist bereit für Luft
   *[windows] Dieser PC ist bereit für Luft
}
check-blocked-title = Fast geschafft
check-moment = Das dauert einen Moment.
check-slow = Windows ermittelt, wie viel Platz es abgeben kann. Auf einem großen Datenträger kann das ein paar Minuten dauern.
check-blocked-description = Bevor Luft einziehen kann, muss sich etwas ändern. So geht’s.
check-found-description = Das hat Meet Luft gefunden.
check-checking = Datenträger, Firmware und Hardware werden geprüft …
check-again = Erneut prüfen
check-action-firmware = Firmware-Einstellungen öffnen
check-action-tidy = Aufräumen
check-firmware-title = In die Firmware-Einstellungen neu starten?
check-firmware-description = Speichere vorher alles, woran du gerade arbeitest. Schalte dort Secure Boot ein und speichere, dann startet dein Computer wieder wie gewohnt.
check-tidy-title = Alte Starteinträge entfernen?
check-tidy-description = Sie verweisen nur auf Systeme, die es nicht mehr gibt. Windows und alles andere starten genau wie vorher.
check-get-ready-title = Luft vorbereiten?
check-get-ready-file = Meet Luft kopiert Luft aus deiner ISO in einen Ordner auf diesem Computer und fügt einen Starteintrag dafür hinzu. Die Partitionen bleiben unverändert.
check-get-ready-download = Meet Luft lädt Luft, etwa { $size }, in einen Ordner auf diesem Computer herunter und fügt einen Starteintrag dafür hinzu. Die Partitionen bleiben unverändert.
check-get-ready-confirm = Vorbereiten

## Choosing how much of the Windows drive Luft gets

room-title = Wie viel Platz für Luft?
room-description = Windows verkleinert sich, um Luft Platz zu machen. Deine Dateien in Windows bleiben genau, wo sie sind.
room-live = Windows behält Platz zum Wachsen. Luft legt außerdem { $size } zum Starten zurück und gibt sie nach der Installation wieder frei.
room-make = Platz schaffen
room-confirm-title = Luft { $size } geben?
room-confirm-file = Windows verkleinert seinen Datenträger, dann kopiert Meet Luft Luft aus deiner ISO. Lass den PC am Strom.
room-confirm-download = Windows verkleinert seinen Datenträger, dann lädt Meet Luft Luft herunter, etwa { $size }. Lass den PC am Strom und online.

## Luft is ready on Windows

ready-title = Luft ist bereit
ready-description = Wähl, wie du es kennenlernen möchtest. Danach startet Windows wie gewohnt, außer du installierst Luft und wählst es.
ready-update-title = Neuestes Luft holen
ready-update-description = Es gibt einen neueren Build. Er ersetzt diesen und behält den Platz und alles, was du eingepackt hast.
ready-try-title = Luft ausprobieren
ready-try-description = In Luft neu starten, ohne etwas zu installieren. Beim nächsten Mal startet Windows wie gewohnt.
ready-box-description = Pack Dokumente, Fotos, WLAN-Netzwerke und mehr ein, damit Luft sie nach der Installation auspackt.
ready-box-packed = Eingepackt, { $size }
ready-install-title = Luft installieren
ready-install-description = In das Installationsprogramm neu starten. Die { $size } neben Windows warten schon darauf.
ready-stick-description = Bring Luft auf einen Stick, um es auf jedem Computer zu starten.
ready-remove = Luft von diesem PC entfernen
ready-restart-try = Speichere vorher alles, woran du gerade arbeitest. Luft öffnet sich in etwa einer Minute, und der nächste Neustart bringt dich zurück zu Windows.
ready-restart-install = Speichere vorher alles, woran du gerade arbeitest. Das Installationsprogramm öffnet sich in etwa einer Minute, und nichts ändert sich, bevor du dort bestätigst.
ready-fast-startup-title = Schnellstart in Windows ausschalten
ready-fast-startup-description = Windows fährt dann vollständig herunter, sodass Sound, WLAN und Bluetooth in Luft frisch starten.
ready-clock-title = Uhrzeit in beiden richtig halten
ready-clock-description = Windows liest die Uhr des Computers so wie Luft, damit die Uhrzeit beim Wechseln nicht mehr springt.
ready-remove-title = Luft von diesem PC entfernen?
ready-remove-description = Meet Luft löscht alles, was es hinzugefügt hat, auch den Umzugskarton, und gibt Windows seinen ganzen Platz zurück.

## Luft is ready on Linux
## $system is the name of the Linux system already installed, like "Fedora Linux 42"

linux-ready-description = Wähl, wie du es kennenlernen möchtest. { $system } startet weiter wie gewohnt, bis du dich anders entscheidest.
linux-ready-this-system = dieses System
linux-ready-update-description = Es gibt einen neueren Build. Er ersetzt den, den Meet Luft aufbewahrt, und behält die Protokolle vom Ausprobieren.
linux-ready-try-description = In Luft neu starten, ohne etwas zu ändern. Beim nächsten Mal startet { $system } wie gewohnt.
linux-ready-replace-title = { $system } ersetzen
linux-ready-replace-description = Luft tritt an seine Stelle und behält deine Dateien, dein Konto, WLAN-Netzwerke und andere Datenträger. Das alte System bleibt, bis du es entfernst.
linux-ready-install-description = In das Installationsprogramm neu starten, um Luft auf einen anderen Datenträger oder in freien Speicherplatz zu installieren.
linux-ready-remove = Luft von diesem Computer entfernen
linux-ready-restart-try = Speichere vorher alles, woran du gerade arbeitest. Luft öffnet sich in etwa einer Minute, und der nächste Neustart bringt dich zurück zu { $system }.
linux-ready-restart-replace = Speichere vorher alles, woran du gerade arbeitest. Das Installationsprogramm öffnet sich mit { $system } als zu ersetzendem System und zeigt, was bleibt, bevor sich etwas ändert.
linux-ready-remove-title = Luft von diesem Computer entfernen?
linux-ready-remove-description = Meet Luft löscht die Dateien von Luft, seine Startdateien und seinen Starteintrag. Alles andere bleibt, wie es ist.

## Packing things to take along to Luft (the moving box)

box-title = Deine Sachen mitnehmen
box-description = Wähl, was mitkommen soll. Luft packt es nach der Installation in deinem neuen Konto aus, und aus Windows wird nichts entfernt.
box-looking = Deine Ordner werden durchsucht …
box-folder-desktop = Desktop
box-folder-documents = Dokumente
box-folder-downloads = Downloads
box-folder-music = Musik
box-folder-pictures = Bilder
box-folder-videos = Videos
box-folder-size = { $size }, { $files ->
    [one] { $files } Datei
   *[other] { $files } Dateien
}
box-wifi-title = WLAN-Netzwerke
box-wifi-description = Mit ihren Passwörtern, damit Luft sofort online ist
box-bluetooth-title = Bluetooth-Geräte
box-bluetooth-description = { $devices ->
    [one] { $devices } Gerät, bereit ohne erneutes Koppeln
   *[other] { $devices } Geräte, bereit ohne erneutes Koppeln
}
box-wallpaper-title = Hintergrundbild
box-wallpaper-description = Das Bild auf deinem Windows-Desktop
box-account-title = Dein Name und Bild
box-total-slow = { $size }, das Einpacken dauert etwa { $minutes ->
    [one] { $minutes } Minute
   *[other] { $minutes } Minuten
}
box-pack = Einpacken

## Progress while Meet Luft works
## Each message is the title, and .description the line below it.

working-shrinking = Platz wird geschaffen
    .description = Windows verschiebt seine Dateien, um Platz zu machen. Das kann ein paar Minuten dauern.
working-partitioning = Platz für Luft wird eingerichtet
    .description = Die Partitionen, von denen Luft startet, werden vorbereitet.
working-downloading = Luft wird geholt
    .description = Luft wird direkt in seinen eigenen Bereich kopiert und unterwegs geprüft.
working-packing = Deine Sachen werden eingepackt
    .description = Alles, was du ausgewählt hast, wird in den Umzugskarton kopiert. Große Ordner brauchen eine Weile.
working-removing = Luft wird entfernt
    .description = Der Platz wird an Windows zurückgegeben.
working-removing-linux = Luft wird entfernt
    .description = Seine Dateien und sein Starteintrag werden entfernt.
working-writing = Stick wird erstellt
    .description = Luft wird auf den ganzen Stick geschrieben. Lass ihn eingesteckt.
working-copying = Luft wird zu Ventoy hinzugefügt
    .description = Luft wird neben die anderen ISOs auf dem Stick kopiert. Lass ihn eingesteckt.
working-verifying = Stick wird geprüft
    .description = Alles wird zurückgelesen, um sicherzugehen, dass er startet.
working-stick-downloading = Luft wird heruntergeladen
    .description = Es wird unterwegs geprüft und aufbewahrt, damit der nächste Stick schneller geht.
working-progress = { $done } von { $total }
working-keep-open = Lass dieses Fenster bitte geöffnet.

## After Luft was removed

removed-title = Alles wieder wie vorher
removed-description = { $platform ->
    [linux] Die Dateien von Luft und sein Starteintrag sind weg, und dein Computer startet genau wie vorher. Komm jederzeit wieder.
   *[windows] Die Partitionen von Luft und sein Starteintrag sind weg, und Windows hat seinen ganzen Platz zurück. Komm jederzeit wieder.
}

## Making a USB stick

stick-title = USB-Stick erstellen
stick-description = Luft startet davon auf jedem Computer, zum Ausprobieren oder Installieren.
stick-looking = USB-Laufwerke werden gesucht …
stick-none = Steck einen USB-Stick mit { $size } oder mehr ein. Er erscheint dann hier.
stick-drives-label = USB-Laufwerke
stick-offer = { $name }, { $size }
stick-make = Stick erstellen
stick-drive-empty = Leer
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Zu klein für Luft
stick-ventoy-title = Dieser Stick verwendet Ventoy
stick-ventoy-description = Luft hinzufügen oder den ganzen Stick löschen und daraus einen Luft-Stick machen?
stick-erase-it = Löschen
stick-add = Luft hinzufügen
stick-replace-title = Luft darauf ersetzen?
stick-replace-description = { $count ->
    [one] { $names } ist schon auf diesem Stick. Das neue Luft kann an seine Stelle treten.
   *[other] { $names } sind schon auf diesem Stick. Das neue Luft kann an ihre Stelle treten.
}
stick-keep = { $count ->
    [one] Beide behalten
   *[other] Alle behalten
}
stick-replace = Ersetzen
stick-full-title = Kein Platz für Luft
stick-full-description = Luft braucht { $needed }, und auf diesem Stick sind { $free } frei. Schaff Platz darauf oder lösch ihn und mach daraus einen Luft-Stick.
stick-erase-title = { $name } löschen?
stick-erase-description = Alles auf diesem { $size }-Stick wird gelöscht und durch Luft ersetzt. Das lässt sich nicht rückgängig machen.
stick-erase-confirm = Löschen und Stick erstellen
stick-done-title = Dein Luft-Stick ist bereit
stick-done-ventoy-title = Luft ist auf deinem Ventoy-Stick
stick-done-take-out = Du kannst ihn jetzt abziehen.
stick-done-eject = Wirf ihn aus, bevor du ihn abziehst.
stick-done-start = Um davon zu starten, steck ihn ein und wähl ihn im Bootmenü des Computers, das sich direkt nach dem Einschalten mit einer Taste wie F12, F8 oder Esc öffnet.
stick-done-ventoy-key = Mit aktivem Secure Boot fragt Ventoy beim ersten Start einmal, ob sein eigener Schlüssel registriert werden soll.
stick-done = Fertig
stick-done-another = Weiteren erstellen
