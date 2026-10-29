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
privacy-reported-app = „{ $name }“ (Name nicht überprüft)
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

## Quick settings tiles

auto-rotate-title = Automatisch drehen
dark-style-title = Dunkler Modus
do-not-disturb-title = Nicht stören
night-light-title = Nachtmodus
airplane-mode-title = Flugzeugmodus

## Power mode

power-profile-title = Energiemodus
power-profile-header = Energiemodus
power-profile-open-menu = Menü für Energiemodus öffnen
power-profile-settings = Energieeinstellungen
power-profile-performance = Leistung
power-profile-balanced = Ausgewogen
power-profile-power-saver = Energie sparen
power-profile-custom = Benutzerdefiniert

## Keep awake

caffeine-title = Wach halten
caffeine-open-menu = Menü für „Wach halten“ öffnen
caffeine-until = Bis { $time }
caffeine-until-turned-off = Bis zum Ausschalten
caffeine-30-minutes = 30 Minuten
caffeine-1-hour = 1 Stunde
caffeine-2-hours = 2 Stunden
caffeine-inhibit-reason = In den Schnelleinstellungen wach gehalten

## Brightness

brightness-title = Helligkeit
brightness-open-menu = Helligkeitsmenü öffnen

## Keyboard backlight

backlight-title = Tastaturbeleuchtung
backlight-open-menu = Menü für Tastaturhelligkeit öffnen
backlight-slider = Tastaturhelligkeit
backlight-off = Aus
backlight-low = Niedrig
backlight-high = Hoch

## Sound

volume-sound-settings = Soundeinstellungen
volume-mute = Stummschalten
volume-unmute = Stummschaltung aufheben
volume-output-slider = Lautstärke
volume-output-title = Soundausgabe
volume-output-open-menu = Menü für Soundausgabe öffnen
volume-input-slider = Mikrofon
volume-input-title = Soundeingabe
volume-input-open-menu = Menü für Soundeingabe öffnen

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Bluetooth-Menü öffnen
bluetooth-settings = Bluetooth-Einstellungen
bluetooth-connect = Verbinden
bluetooth-disconnect = Trennen
bluetooth-connect-device = Mit { $deviceName } verbinden
bluetooth-disconnect-device = { $deviceName } trennen
bluetooth-no-devices = Keine verfügbaren oder verbundenen Geräte
bluetooth-turn-on-hint = Schalte Bluetooth ein, um Geräte zu verbinden
bluetooth-connected-count = { $count ->
    [one] { $count } verbunden
   *[other] { $count } verbunden
}

## Network menus in quick settings

network-menu-unknown-network = <unbekannt>
network-menu-connect = Verbinden
network-menu-disconnect = Trennen
network-menu-connect-to = Mit { $name } verbinden
network-menu-disconnect-from = { $name } trennen
network-menu-turn-off = Ausschalten
network-menu-wifi-network = { $secure ->
    [yes] { $name }, gesichert, Signalstärke { $strength } %
   *[no] { $name }, nicht gesichert, Signalstärke { $strength } %
}
network-menu-hotspot = Hotspot von { $name }
network-menu-connected-count = { $count ->
    [one] { $count } verbunden
   *[other] { $count } verbunden
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = VPN-Menü öffnen
network-menu-vpn-settings = VPN-Einstellungen
network-menu-wifi = WLAN
network-menu-wifi-open-menu = WLAN-Menü öffnen
network-menu-wifi-settings = Alle Netzwerke
network-menu-wired = Kabelverbindungen
network-menu-wired-open-menu = Menü für Kabelverbindungen öffnen
network-menu-wired-settings = Kabeleinstellungen
network-menu-tethers = Bluetooth-Tethering
network-menu-tethers-open-menu = Menü für Bluetooth-Tethering öffnen
network-menu-tether = Tethering
network-menu-tether-settings = Bluetooth-Einstellungen
network-menu-mobile-connections = Mobilfunkverbindungen
network-menu-mobile-open-menu = Menü für Mobilfunkverbindungen öffnen
network-menu-mobile-settings = Mobilfunkeinstellungen
network-menu-mobile = Mobilfunk
network-device-wired = Kabelgebunden
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Beim Netzwerk anmelden
network-menu-failed-title = Verbindung fehlgeschlagen
network-menu-failed-body = Die Netzwerkverbindung konnte nicht hergestellt werden

## Location access dialog

location-dialog-title = Standortzugriff zulassen
location-dialog-description = Die App { $appName } möchte auf deinen Standort zugreifen
location-dialog-info = Du kannst den Standortzugriff jederzeit in den Datenschutzeinstellungen ändern
location-dialog-deny = Zugriff verweigern
location-dialog-grant = Zugriff erlauben

## Thunderbolt notifications

thunderbolt-unknown-title = Unbekanntes Thunderbolt-Gerät
thunderbolt-unknown-body = Während du weg warst, wurde ein neues Gerät erkannt. Trenn es und schließ es erneut an, um es zu verwenden.
thunderbolt-unauthorized-title = Nicht autorisiertes Thunderbolt-Gerät
thunderbolt-unauthorized-body = Ein neues Gerät wurde erkannt und muss von einem Administrator autorisiert werden
thunderbolt-error-title = Fehler bei der Thunderbolt-Autorisierung
thunderbolt-error-body = Das Thunderbolt-Gerät konnte nicht autorisiert werden: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Verweigern
access-dialog-allow = Zulassen

## Display change confirmation

display-change-title = Einstellungen beibehalten?
display-change-countdown = { $seconds ->
    [one] Die Änderungen werden in { $seconds } Sekunde zurückgesetzt
   *[other] Die Änderungen werden in { $seconds } Sekunden zurückgesetzt
}
display-change-revert = Zurücksetzen
display-change-keep = Beibehalten

## Drive connected notification

autorun-connected = „{ $driveName }“ angeschlossen
autorun-ready = Der Datenträger kann jetzt verwendet werden
autorun-open-with = Mit { $appName } öffnen

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Anschlagverzögerung eingeschaltet
kbd-a11y-slow-keys-off = Anschlagverzögerung ausgeschaltet
kbd-a11y-slow-keys-description = Du hast die Umschalttaste 8 Sekunden lang gedrückt gehalten. Das ist das Tastenkürzel für die Anschlagverzögerung, die das Verhalten deiner Tastatur ändert.
kbd-a11y-sticky-keys-on = Einrastfunktion eingeschaltet
kbd-a11y-sticky-keys-off = Einrastfunktion ausgeschaltet
kbd-a11y-sticky-keys-on-description = Du hast die Umschalttaste 5-mal hintereinander gedrückt. Das ist das Tastenkürzel für die Einrastfunktion, die das Verhalten deiner Tastatur ändert.
kbd-a11y-sticky-keys-off-description = Du hast zwei Tasten gleichzeitig oder die Umschalttaste 5-mal hintereinander gedrückt. Damit wird die Einrastfunktion ausgeschaltet, die das Verhalten deiner Tastatur ändert.
kbd-a11y-leave-on = Eingeschaltet lassen
kbd-a11y-turn-on = Einschalten
kbd-a11y-turn-off = Ausschalten
kbd-a11y-leave-off = Ausgeschaltet lassen

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Audiogerät auswählen
audio-device-cancel = Abbrechen
audio-device-sound-settings = Soundeinstellungen
audio-device-headphones = Kopfhörer
audio-device-headset = Headset
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Tastenkürzel übernehmen lassen
inhibit-shortcuts-app = Die App { $appName } möchte die Tastenkürzel des Systems übernehmen
inhibit-shortcuts-unknown-app = Eine App möchte die Tastenkürzel des Systems übernehmen
inhibit-shortcuts-titled-app = Eine App mit dem Fenster „{ $title }“ möchte die Tastenkürzel des Systems übernehmen
inhibit-shortcuts-restore = Mit { $shortcut } bekommst du die Tastenkürzel zurück
inhibit-shortcuts-deny = Verweigern
inhibit-shortcuts-allow = Zulassen

## Unlocking encrypted drives

mount-hidden-volume = Verstecktes Volume
mount-windows-system-volume = Windows-Systemvolume
mount-uses-keyfiles = Verwendet Schlüsseldateien
mount-keyfiles-use-app = Verwende zum Entsperren eines Volumes mit Schlüsseldateien stattdessen <i>{ $appName }</i>
mount-keyfiles-need-app = Zum Entsperren eines Volumes mit Schlüsseldateien brauchst du ein externes Programm wie <i>Datenträger</i>
mount-pim-number = PIM-Nummer
mount-pim-invalid = Die PIM muss eine Zahl sein oder leer bleiben
mount-password = Passwort
mount-remember-password = Passwort merken
mount-cancel = Abbrechen
mount-unlock = Entsperren
mount-open-app = { $appName } öffnen
mount-wrong-password = Das hat leider nicht funktioniert. Versuch es noch einmal.
mount-unlock-failed = Das Volume konnte nicht entsperrt werden
mount-pim-unsupported = Die installierte udisks-Version unterstützt die PIM-Einstellung nicht

## Network passwords, asked when connecting needs one

network-agent-auth-required = Authentifizierung erforderlich
network-agent-wifi-rejected = Das gespeicherte Passwort für „{ $networkName }“ hat nicht funktioniert. Gib es erneut ein.
network-agent-wifi-secrets = Für das WLAN „{ $networkName }“ sind Passwörter oder Schlüssel nötig
network-agent-wps-hint = Du kannst dich auch über die WPS-Taste an deinem Router verbinden
network-agent-wired-title = 802.1X-Authentifizierung über Kabel
network-agent-dsl-title = DSL-Authentifizierung
network-agent-pin-title = PIN erforderlich
network-agent-pin-body = Das Mobilfunkgerät braucht eine PIN
network-agent-vpn-title = VPN-Passwort
network-agent-password-required = Für die Verbindung mit „{ $networkName }“ ist ein Passwort nötig
network-agent-connect = Verbinden
network-agent-cancel = Abbrechen
network-agent-password = Passwort
network-agent-username = Benutzername
network-agent-key = Schlüssel
network-agent-private-key-password = Passwort des privaten Schlüssels
network-agent-identity = Identität
network-agent-service = Dienst
network-agent-network-name = Netzwerkname
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Bildschirmaufnahme
screenshot-area = Bereich auswählen
screenshot-screen = Bildschirm auswählen
screenshot-window = Fenster auswählen
screenshot-take = Bildschirmfoto aufnehmen
screenshot-record = Bildschirm aufnehmen
screenshot-show-pointer = Zeiger anzeigen
screenshot-capture = Aufnehmen
screenshot-close = Schließen
screenshot-screencasts-folder = Bildschirmaufnahmen
screenshot-screencast-file = Bildschirmaufnahme vom { $date } { $time }
screenshot-screenshots-folder = Bildschirmfotos
screenshot-file = Bildschirmfoto vom { $timestamp }
screenshot-screencast-recorded = Bildschirmaufnahme gespeichert
screenshot-screencast-start-failed = Bildschirmaufnahme konnte nicht starten
screenshot-screencast-out-of-space = Bildschirmaufnahme fehlgeschlagen: kein Speicherplatz mehr
screenshot-screencast-try-again = Bildschirmaufnahme fehlgeschlagen. Versuch es noch einmal.
screenshot-screencast-failed = Bildschirmaufnahme fehlgeschlagen
screenshot-screencast-view = Klick hier, um das Video anzusehen
screenshot-show-in-rover = In Rover anzeigen
screenshot-captured = Bildschirmfoto aufgenommen
screenshot-captured-body = Du kannst das Bild aus der Zwischenablage einfügen

## System updates
updates-available-title = Systemupdates sind verfügbar
updates-available-body = Öffne die Einstellungen, um sie herunterzuladen und zu installieren.
updates-ready-title = Updates sind bereit zur Installation
updates-ready-body = Starte neu, wann es dir passt, um sie zu installieren.
