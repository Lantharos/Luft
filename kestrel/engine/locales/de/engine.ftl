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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = „{ $appName }“ reagiert nicht
close-dialog-description = Du kannst kurz warten, ob die App weiterläuft, oder sie sofort beenden
close-dialog-force-quit = Sofort beenden
close-dialog-wait = Warten

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Spiegeln
switch-monitor-join = Erweitern
switch-monitor-external-only = Nur extern
switch-monitor-built-in-only = Nur intern

## Sign-in prompt

auth-prompt-password = Passwort
auth-prompt-username = Benutzername
auth-prompt-back = Zurück
auth-prompt-submit = Senden
auth-prompt-wrong-password = Das Passwort hat nicht funktioniert
auth-prompt-failed = Das hat nicht funktioniert. Versuch es noch einmal.
fingerprint-not-recognized = Fingerabdruck nicht erkannt

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
inhibit-shortcuts-restore = Mit { $shortcut } bekommst du die Tastenkürzel zurück
inhibit-shortcuts-deny = Verweigern
inhibit-shortcuts-allow = Zulassen

## Administrator authentication

polkit-title = Authentifizierung erforderlich
polkit-administrator = Administrator
polkit-password = Passwort
polkit-cancel = Abbrechen
polkit-authenticate = Authentifizieren
polkit-failed = Das hat leider nicht funktioniert. Versuch es noch einmal.

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

## Log out, power off and restart dialog

end-session-log-out-user = { $userName } abmelden
end-session-log-out-title = Abmelden
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } wird in { $seconds } Sekunde automatisch abgemeldet
   *[other] { $userName } wird in { $seconds } Sekunden automatisch abgemeldet
}
end-session-log-out-countdown = { $seconds ->
    [one] Du wirst in { $seconds } Sekunde automatisch abgemeldet
   *[other] Du wirst in { $seconds } Sekunden automatisch abgemeldet
}
end-session-log-out-button = Abmelden
end-session-power-off-title = Herunterfahren
end-session-power-off-updates-title = Updates installieren und herunterfahren
end-session-power-off-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch heruntergefahren
   *[other] Das System wird in { $seconds } Sekunden automatisch heruntergefahren
}
end-session-power-off-button = Herunterfahren
end-session-restart-title = Neu starten
end-session-restart-updates-title = Updates installieren und neu starten
end-session-restart-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch neu gestartet
   *[other] Das System wird in { $seconds } Sekunden automatisch neu gestartet
}
end-session-restart-button = Neu starten
end-session-update-restart-title = Neu starten und Updates installieren
end-session-update-restart-countdown = { $seconds ->
    [one] Das System wird in { $seconds } Sekunde automatisch neu gestartet und installiert die Updates
   *[other] Das System wird in { $seconds } Sekunden automatisch neu gestartet und installiert die Updates
}
end-session-update-restart-button = Neu starten und installieren
end-session-install-updates = Ausstehende Softwareupdates installieren
end-session-install-version = Version { $version } installieren
end-session-low-battery = Akku fast leer: Schließ den Computer an, bevor du Updates installierst
end-session-busy-apps = Einige Apps sind beschäftigt oder haben ungespeicherte Änderungen
end-session-other-users = Andere Benutzer sind angemeldet
end-session-cancel = Abbrechen
end-session-boot-options = Startoptionen
end-session-remote-user = { $userName } (entfernt)
end-session-console-user = { $userName } (Konsole)

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

## Lock screen clock

lock-clock-swipe-up = Wisch nach oben
lock-clock-click-or-press = Klick oder drück eine Taste

## Notification times

date-just-now = Gerade eben

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Fenster
ctrl-alt-tab-panel = Leiste
ctrl-alt-tab-unlock = Entsperrfenster

## System notifications

messages-system-source = System
unsafe-mode-title = Das System ist im unsicheren Modus
unsafe-mode-body = Apps haben jetzt uneingeschränkten Zugriff
unsafe-mode-undo = Rückgängig
privileged-user-title = Als privilegierter Benutzer angemeldet
privileged-user-body = Aus Sicherheitsgründen solltest du keine Sitzung als privilegierter Benutzer verwenden. Melde dich wenn möglich als normaler Benutzer an.

## On-screen keyboard

osk-keyboard-settings = Tastatureinstellungen
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel muss den Bildschirm sperren

## Notifications

messages-unknown-app = Unbekannte App
messages-reply = Antworten
messages-reply-placeholder = Antwort schreiben
messages-reply-send = Senden

## Media player controls

mpris-unknown-artist = Unbekannter Interpret
mpris-unknown-title = Unbekannter Titel

## Starting programs

spawn-failed = „{ $command }“ konnte nicht ausgeführt werden:

## Text field context menu

entry-menu-copy = Kopieren
entry-menu-paste = Einfügen
entry-menu-show-text = Text anzeigen
entry-menu-hide-text = Text ausblenden
entry-caps-lock-on = Feststelltaste ist aktiviert

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Bildschirmfoto aufnehmen
title-bar-menu-hide = Minimieren
title-bar-menu-restore = Wiederherstellen
title-bar-menu-maximize = Maximieren
title-bar-menu-move = Verschieben
title-bar-menu-resize = Größe ändern
title-bar-menu-always-on-top = Immer im Vordergrund
title-bar-menu-always-on-visible-workspace = Auf allen Arbeitsflächen
title-bar-menu-workspace-left = Auf Arbeitsfläche links verschieben
title-bar-menu-workspace-right = Auf Arbeitsfläche rechts verschieben
title-bar-menu-workspace-up = Auf Arbeitsfläche oben verschieben
title-bar-menu-workspace-down = Auf Arbeitsfläche unten verschieben
title-bar-menu-monitor-up = Auf Bildschirm oben verschieben
title-bar-menu-monitor-down = Auf Bildschirm unten verschieben
title-bar-menu-monitor-left = Auf Bildschirm links verschieben
title-bar-menu-monitor-right = Auf Bildschirm rechts verschieben
title-bar-menu-close = Schließen

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

## Rain

rain-title = Regen
rain-open-menu = Regenmenü öffnen
rain-drizzle = Nieselregen
rain-rain = Regen
rain-storm = Sturm
rain-show = Auf dem Desktop zeigen
rain-sound = Ton
rain-volume = Lautstärke des Regens
rain-settings = Regen-Einstellungen
