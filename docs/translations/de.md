# German style guide

How Luft speaks German. The [glossary](../../packages/i18n/glossary/de.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **du**, lowercase: „Du kannst das später in den Einstellungen ändern.“ Never „Sie“, never „Ihr“.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as „Bitte“ at the start of every hint, no marketing words.
- Say what happens, not how it works inside. „Die Updates werden beim nächsten Neustart installiert“, not „Das System-Image wird beim Booten ausgetauscht“.
- When English uses „you“ only out of habit, German may leave it out: „Keine Benachrichtigungen“ for „You have no notifications“.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**: „Speichern“, „Öffnen“, „Neu starten“, „An Taskleiste anheften“.
- Switches and settings are nouns or short phrases: „Nachtmodus“, „Sekunden anzeigen“.
- Headings and page names are nouns: „Benachrichtigungen“, „Datenschutz“.
- Instructions in running text use the imperative with du: „Drück Super+Tab, um alle Fenster zu sehen.“ Write „Drück“, „Wähl“, „Klick“ without the final -e.
- Keep labels short. German runs about a third longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case, with the usual German rules for nouns. Feature names are ordinary nouns, so „die Taskleiste“, „das Board“, „die Schnelleinstellungen“. Only names stay as they are: Rover, Magpie, Tern, Start.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Ellipsis: one character, „…“, with no space before it when something is left out of a word, and a space before it otherwise: „Wird geladen …“.
- Dash: the en dash with spaces, „ – “. No em dashes.
- Compounds with names, abbreviations or English words take a hyphen: „Rover-Fenster“, „USB-Stick“, „PDF-Datei“.
- Key names follow German keyboards: Strg, Entf, Einfg, Bild auf, Bild ab, Pos1, Ende, Umschalt. These come from translatable key names, so translate them where they appear.
- Write „E-Mail“ and „online“.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Einstellungen, Datenträger, Luft installieren.
- Names are neuter unless the glossary says otherwise: „Rover ist geöffnet“. When a case ending would look odd, add the kind of thing: „in der App Rover“.

## Plurals

German has two forms, `one` and `other`. Always keep `{ $count }` in both, and keep `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } Benachrichtigung
   *[other] { $count } Benachrichtigungen
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Keine Benachrichtigungen`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it.

## Decisions

| English | German | Instead of | Why |
| --- | --- | --- | --- |
| app | App, die | Anwendung | What Windows, phones and app stores say |
| board | Board, das | Tafel, Leinwand | Short, already German, and „Leinwand“ is the canvas inside it |
| All windows | Alle Fenster | Aufgabenansicht | That's what Luft calls the task view |
| notification center | Benachrichtigungscenter | Mitteilungszentrale | Windows' word |
| snap, snap layout | andocken, Andocklayout | einrasten | Windows' words |
| tray | Infobereich | Systemablage | Windows' word |
| workspace | Arbeitsfläche | Desktop, Arbeitsbereich | GNOME's word; „Desktop“ is the area behind the windows |
| wallpaper | Hintergrundbild | Hintergrund | „Hintergrund“ is ambiguous next to colors |
| suspend, sleep | Standby | Bereitschaft, Energie sparen | „Energie sparen“ is the power mode |
| Power saver | Energie sparen | Stromsparmodus | Matches the other power modes |
| Night light | Nachtmodus | Nachtlicht | Windows and GNOME both say Nachtmodus |
| Dictation | Diktieren | Spracheingabe | Spracheingabe is a different Windows feature |
| passkey | Passkey, der | Hauptschlüssel | The word websites, Apple and Google use |
| Keyring | Schlüsselbund | Schlüsselring | GNOME and macOS |
| security chip | Sicherheitschip | TPM-Chip | Luft avoids the abbreviation in the interface |
| Full access | Vollzugriff | Voller Zugriff | Windows' word |
| password | Passwort | Kennwort | More common today |
| keyboard shortcut | Tastenkürzel | Tastenkombination | Shorter, GNOME and KDE |
| Wi-Fi | WLAN | Wi-Fi | What German speakers say |
| sound | Sound | Audio, Ton | Windows' settings page |
