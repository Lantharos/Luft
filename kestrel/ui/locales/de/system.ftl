## Shared

system-cancel = Abbrechen

## Dictation notifications

dictation-setup-title = Schreiben durch Sprechen
dictation-setup-body = Sprich, und was du sagst, wird in jeder App getippt. Das passiert auf diesem Computer, deshalb braucht Diktieren zuerst sein Sprachmodell.
dictation-setup-action = Diktieren einrichten
dictation-unsupported-title = Diktieren auf { $language } ist auf diesem Computer nicht verfügbar
dictation-unsupported-body = Sein Prozessor kann die Spracherkennung für { $language } nicht ausführen. Du kannst in einer anderen Sprache diktieren.
dictation-settings-action = Diktiereinstellungen

## System health notifications

health-gpu-reset-title = Der Grafiktreiber hat nicht mehr reagiert
health-gpu-reset-body = { $day ->
    [today] Dein Computer hat sich heute um { $time } selbst neu gestartet. In den Einstellungen siehst du, was das künftig verhindern kann.
   *[other] Dein Computer hat sich am { $date } um { $time } selbst neu gestartet. In den Einstellungen siehst du, was das künftig verhindern kann.
}
health-gpu-reset-details = Details

oom-app-closed-title = { $app } wurde geschlossen, um Arbeitsspeicher freizugeben
oom-container-closed-title = Ein Container wurde geschlossen, um Arbeitsspeicher freizugeben
oom-closed-body = Der Arbeitsspeicher wurde knapp. Damit alles andere flüssig bleibt, wurde es geschlossen.
oom-closed-body-with-size = Der Arbeitsspeicher wurde knapp. Damit alles andere flüssig bleibt, wurde es geschlossen. Es hat { $size } belegt.
memory-low-title = Luft hat kaum noch Arbeitsspeicher
memory-low-app-body = { $app } belegt { $size }. Erzwinge das Beenden, damit alles andere flüssig bleibt.
memory-low-container-body = Ein Container belegt { $size }. Erzwinge das Beenden, damit alles andere flüssig bleibt.
memory-low-force-quit = Beenden erzwingen

## Input source indicator

input-source-indicator = Eingabequelle: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Flugzeugmodus ist per Hardware eingeschaltet
media-keys-airplane-mode-on = Flugzeugmodus ein
media-keys-airplane-mode-off = Flugzeugmodus aus
media-keys-bluetooth-on = Bluetooth ein
media-keys-bluetooth-off = Bluetooth aus
media-keys-caps-lock-on = Feststelltaste ein
media-keys-caps-lock-off = Feststelltaste aus
media-keys-num-lock-on = Num-Taste ein
media-keys-num-lock-off = Num-Taste aus

## VPN sign-in

vpn-sign-in-title = Bei { $connection } anmelden
vpn-connect = Verbinden
vpn-signing-in = Anmeldung läuft …
vpn-finish-in-browser = Schließ die Anmeldung in deinem Browser ab.
vpn-certificate-untrusted = { $host } hat ein Zertifikat vorgelegt, das nicht überprüft werden kann ({ $reason }). Sein Fingerabdruck ist { $fingerprint }.
vpn-certificate-warning = Jemand könnte sich als dieser Server ausgeben. Verbinde dich nur, wenn du das erwartet hast.
vpn-certificate-connect = Trotzdem verbinden

vpn-field-password = Passwort
vpn-field-certificate-password = Zertifikatspasswort
vpn-field-proxy-password = Proxy-Passwort
vpn-field-pre-shared-key = Pre-Shared Key
vpn-field-group-password = Gruppenpasswort

## Battery notifications

battery-left = Noch { $percent }.
battery-left-with-time = Noch { $percent }, etwa { $duration }.
battery-low-title = Akku schwach
battery-very-low-title = Akku sehr schwach
battery-almost-empty-title = Akku fast leer
battery-ups-low-title = USV-Akku schwach
battery-ups-very-low-title = USV-Akku sehr schwach
battery-ups-almost-empty-title = USV-Akku fast leer
battery-very-low-body = { $left } Schließ bald das Ladegerät an.
battery-almost-empty-body = { $left } Schließ jetzt das Ladegerät an, damit keine ungespeicherte Arbeit verloren geht.

battery-device-low-title = { $device }: Akku schwach
battery-device-very-low-title = { $device }: Akku sehr schwach
battery-device-low-body = { $left } Lade das Gerät bald auf.
battery-device-very-low-body = { $left } Lade das Gerät jetzt auf, damit es sich nicht ausschaltet.

battery-device-mouse = Maus
battery-device-keyboard = Tastatur
battery-device-phone = Handy
battery-device-tablet = Tablet
battery-device-controller = Controller
battery-device-pen = Stift
battery-device-touchpad = Touchpad
battery-device-headset = Headset
battery-device-speaker = Lautsprecher
battery-device-headphones = Kopfhörer
battery-device-remote = Fernbedienung
battery-device-other = Verbundenes Gerät

## Privacy indicator

privacy-indicator = In Verwendung: { $things }
privacy-thing-camera = Kamera
privacy-thing-microphone = Mikrofon
privacy-thing-screen = Bildschirm
privacy-thing-location = Standort
privacy-thing-windows = Fenster

privacy-camera-unknown-app = Eine App verwendet die Kamera
privacy-stop-sharing = Bildschirmfreigabe beenden
privacy-stop-recording = Aufnahme beenden
privacy-turn-off-location = Ortungsdienste ausschalten
privacy-settings = Datenschutzeinstellungen
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon stummgeschaltet
privacy-mute-microphone = Mikrofon stummschalten
privacy-unmute-microphone = Stummschaltung aufheben
privacy-close-app = { $app } schließen
privacy-unknown-app = Eine App
privacy-windows-seeing-programs = { $count ->
    [one] { $count } Programm kann deine Fenster sehen
   *[other] { $count } Programme können deine Fenster sehen
}
privacy-windows-using-programs = { $count ->
    [one] { $count } Programm kann deine Fenster sehen und bedienen
   *[other] { $count } Programme können deine Fenster sehen und bedienen
}
privacy-windows-stop = Zugriff beenden

## Window access prompt

peek-see-request = Einem Programm, das du gestartet hast, erlauben, deine Fenster zu sehen?
peek-see-description = Das Programm kann dann Bilder von jedem geöffneten Fenster aufnehmen.
peek-use-request = Einem Programm, das du gestartet hast, erlauben, deine Fenster zu sehen und zu bedienen?
peek-use-description = Das Programm kann dann jedes geöffnete Fenster sehen und darin klicken und tippen, als wärst du es.
peek-deny = Nicht zulassen
peek-allow-once = Einmal zulassen
peek-allow-until-quit = Bis zum Beenden zulassen

## Window access errors

peek-error-declined-until-quit = Die Person an diesem Computer hat das abgelehnt. Das Programm kann erneut fragen, nachdem es beendet wurde.
peek-error-not-allowed = Die Person an diesem Computer hat das nicht zugelassen
peek-error-sandboxed = Apps in einer Sandbox können andere Fenster weder sehen noch bedienen
peek-error-unknown-caller = Das anfragende Programm wurde beendet oder konnte nicht erkannt werden
peek-error-no-caller = Der Sitzungsbus hat nicht angegeben, welches Programm anfragt
peek-error-screen-busy = Der Bildschirm ist gesperrt oder eine Systemabfrage ist geöffnet. Versuch es erneut, wenn sie geschlossen ist.
peek-error-input-held = Jemand hält gerade Tasten oder Maustasten gedrückt. Versuch es gleich noch einmal.
peek-error-input-dropped = Die Eingabe wurde gestoppt, weil beim Eintreffen etwas anderes unter dem Zeiger lag oder die Tastatur hatte
peek-error-not-in-front = Das Fenster konnte nicht in den Vordergrund geholt werden
peek-error-covered = Dieser Teil des Fensters ist von etwas anderem verdeckt
peek-error-outside = { $x }, { $y } liegt außerhalb des Fensterbilds, das { $width } × { $height } groß ist
peek-error-nothing-to-capture = Das Fenster zeigt nichts an, das aufgenommen werden kann
peek-error-window-picture-late = Das Bild des Fensters war nicht rechtzeitig fertig
peek-error-screen-picture-late = Das Bild des Bildschirms war nicht rechtzeitig fertig
peek-error-no-window-id = Kein Fenster hat die ID { $id }. peek list zeigt die geöffneten an.
peek-error-no-window-for-handle = Das als { $handle } gestartete Programm hat kein Fenster geöffnet
peek-error-ended-before-window = Das Programm wurde beendet, bevor es ein Fenster geöffnet hat
peek-error-no-window-in-time = Innerhalb von { $duration } wurde kein Fenster geöffnet
peek-error-launch-not-started-by-peek = Nur ein Programm, das peek run selbst gestartet hat, kann ausgeführt werden
peek-error-ended-while-starting = Das Programm wurde beim Starten beendet
peek-error-launch-failed = systemd konnte { $program } nicht starten
peek-error-unknown-handle = Nichts, was du mit peek run gestartet hast, hat das Handle { $handle }, oder es wurde beendet
peek-error-unknown-key = { $key } ist keine Taste, die peek kennt
peek-error-unknown-modifier = { $modifier } ist keine Sondertaste. Verwende ctrl, shift, alt oder super.
peek-error-display-owner = Diese Anzeige gehört zu einem anderen Programm
peek-error-display-run = Programme auf einer versteckten Anzeige werden mit peek run gestartet
peek-error-display-handle = Diese Anzeige wurde als { $handle } gestartet, nicht als { $requested }
