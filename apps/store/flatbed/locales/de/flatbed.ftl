## Starting up

start-failed = Flatbed konnte nicht starten: { $reason }

## Where pages come from

sources-title = Scannen von
sources-looking = Scanner im Netzwerk und angeschlossene Scanner erscheinen hier, sobald sie gefunden werden.
source-network = Im Netzwerk
source-usb = Angeschlossen
source-camera = Kamera
source-camera-detail = Eine Seite fotografieren
source-add = Scanner hinzufügen …
settings-open = Einstellungen

## The document

document-title = Scans
document-empty = Noch keine Seiten
document-pages = { $count ->
    [one] { $count } Seite
   *[other] { $count } Seiten
}
document-clear = Alle Seiten entfernen
more = Mehr
mode-label = Aussehen der Seiten
mode-colour = Farbe
mode-grey = Graustufen
mode-black-and-white = Schwarzweiß
save-open = Speichern …

welcome-glass = Lege eine Seite mit der Vorderseite nach unten auf das Glas des Scanners
welcome-feeder = Lege die Seiten in den Einzug des Scanners
welcome-camera = Lege die Seite flach ins Licht und halte die Kamera darüber
welcome-drop = Flatbed richtet jede Seite gerade aus und räumt sie auf. Du kannst auch Fotos von Seiten hineinziehen, die du schon gemacht hast.

## Scanning

feed-label = Papier aus
feed-glass = Glas
feed-feeder = Einzug
feed-both-sides = Beidseitig
scan-start = Scannen
camera-start = Foto aufnehmen
import-open = Bilder öffnen …
import-title = Bilder von Seiten öffnen
import-filter = Bilder
import-unreadable = { $count ->
    [one] Eine Datei ist kein Bild, das Flatbed öffnen kann
   *[other] { $count } Dateien sind keine Bilder, die Flatbed öffnen kann
}
scan-scanning = Scannt auf { $name }
scan-cancel = Abbrechen
scan-incoming = Die Seite, die gerade gescannt wird
scan-busy = Der Scanner ist gerade beschäftigt. Versuche es noch einmal, wenn er fertig ist.
scan-feeder-empty = Im Einzug liegt kein Papier.
scan-gone = Der Scanner ist nicht mehr erreichbar. Prüfe, ob er eingeschaltet ist.
scan-failed = Der Scan wurde abgebrochen: { $reason }

## Pages

page-adjust = Seite { $number }, Ecken anpassen
page-turn-left = Nach links drehen
page-turn-right = Nach rechts drehen
page-corners = Ecken anpassen
page-remove = Seite entfernen

corners-title = Ecken anpassen
corners-description = Ziehe jede Ecke an den Rand des Papiers.
corners-whole = Ganzes Bild verwenden
corner-top-left = Ecke oben links
corner-top-right = Ecke oben rechts
corner-bottom-right = Ecke unten rechts
corner-bottom-left = Ecke unten links

clear-title = Alle Seiten entfernen?
clear-description = { $count ->
    [one] Die gescannte Seite wird entfernt. Speichere sie vorher, wenn du sie behalten möchtest.
   *[other] Die { $count } gescannten Seiten werden entfernt. Speichere sie vorher, wenn du sie behalten möchtest.
}
clear-confirm = Entfernen

## Camera

camera-title = Eine Seite fotografieren
camera-description = Wenn der Umriss auf den Rändern des Papiers liegt, nimm das Foto auf. Du kannst beliebig viele Seiten aufnehmen.
camera-opening = Kamera wird geöffnet
camera-refused = Flatbed darf die Kamera nicht verwenden. Du kannst es unter Einstellungen → Datenschutz erlauben.
camera-failed = Die Kamera konnte nicht starten: { $reason }
camera-take = Foto aufnehmen
camera-taken = { $count ->
    [one] { $count } Seite hinzugefügt
   *[other] { $count } Seiten hinzugefügt
}

## Saving

save-dialog-title = Speichern
save-name = Name
save-default-name = Scan { $date }
save-fallback-name = Scan
save-format = Format
format-pdf = PDF
format-jpeg = JPG
format-png = PNG
save-searchable = Durchsuchbarer Text
save-searchable-detail = Liest den Text auf jeder Seite, damit du ihn finden und kopieren kannst
save-searchable-missing = Texterkennung ist auf diesem Computer nicht installiert
save-paper = Seitengröße
paper-automatic = Wie gescannt
paper-a4 = A4
paper-letter = Letter
save-pictures-one = Die Seite wird als Bild gespeichert
save-pictures-several = { $count ->
    [one] Die Seite wird als Bild gespeichert
   *[other] Jede der { $count } Seiten wird als eigenes, nummeriertes Bild im gewählten Ordner gespeichert
}
save-choose-file = Speichern …
save-choose-folder = Ordner wählen …
save-title = Scan speichern
save-folder-title = Ordner für die Seiten wählen
save-filter-pdf = PDF-Dokumente
save-filter-jpeg = JPG-Bilder
save-filter-png = PNG-Bilder
save-reading = Text auf jeder Seite wird gelesen
save-saving = Wird gespeichert
save-failed = Es konnte nicht gespeichert werden: { $reason }
saved-title = Gespeichert
saved-one = Dein Scan ist gespeichert.
saved-several = { $count ->
    [one] Die Seite ist gespeichert.
   *[other] Alle { $count } Seiten sind gespeichert.
}
saved-show = Im Ordner zeigen
saved-send = Senden …
send-failed = Es konnte nicht gesendet werden: { $reason }

## Adding a scanner

add-title = Scanner hinzufügen
add-description = Scanner erscheinen meist von selbst. Wenn deiner fehlt, gib seine Adresse im Netzwerk ein.
add-address = Adresse
add-failed = Unter { $address } hat kein Scanner geantwortet.
add-looking = Scanner wird gesucht
add-confirm = Hinzufügen

## Settings

settings-title = Einstellungen
settings-fine = Feine Scans
settings-fine-detail = Scannt mit 600 Pixeln pro Zoll, für kleine Schrift und Fotos. Das Scannen dauert länger.
settings-languages = Sprachen zum Lesen
settings-languages-detail = Text auf deinen Seiten wird auf diesem Computer in diesen Sprachen gelesen, damit gespeicherte PDFs durchsuchbar sind.
settings-languages-missing = Texterkennung ist auf diesem Computer nicht installiert, daher enthalten gespeicherte PDFs nur Bilder der Seiten.

## Dialogs

dialog-cancel = Abbrechen
dialog-done = Fertig
