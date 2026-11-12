# German

What is particular to German, on top of [the rules every language shares](common.md). The agreed terms are in [de.tbx](de.tbx).

## Address

Address the reader as du, lowercase: „Du kannst das später in den Einstellungen ändern.“ Never Sie.

## Buttons and labels

- Buttons and menu items take the infinitive: „Speichern“, „Öffnen“, „Neu starten“, „An Taskleiste anheften“.
- Instructions in running text take the imperative with du, without the final -e: „Drück Super+Tab, um alle Fenster zu sehen.“, „Wähl“, „Klick“.
- Nouns keep their capital as usual. Luft's parts are ordinary nouns: „die Taskleiste“, „das Board“, „die Schnelleinstellungen“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. No em dashes.
- The ellipsis takes no space before it when it cuts a word short, and a space otherwise.
- Compounds with names, abbreviations or English words take a hyphen: „Rover-Fenster“, „USB-Stick“, „PDF-Datei“.
- Keys follow German keyboards: Strg, Entf, Einfg, Bild auf, Bild ab, Pos1, Ende, Umschalt.
- Write „E-Mail“ and „online“.

## Names

- Settings, Disks and Install Luft are Einstellungen, Datenträger and Luft installieren. Start stays Start.
- App names are neuter unless the glossary says otherwise: „Rover ist geöffnet“. When a case ending looks odd, write „in der App Rover“.

## Plurals

Two forms, `one` and `other`.

```ftl
notifications-count = { $count ->
    [one] { $count } Benachrichtigung
   *[other] { $count } Benachrichtigungen
}
```

## Words

| English | German | Not | Why |
| --- | --- | --- | --- |
| app | App, die | Anwendung | What Windows, phones and app stores say |
| board | Board, das | Tafel, Leinwand | Short, already German; Leinwand is the canvas inside it |
| All windows | Alle Fenster | Aufgabenansicht | What Luft calls the task view |
| notification center | Benachrichtigungscenter | Mitteilungszentrale | Windows' word |
| snap, snap layout | andocken, Andocklayout | einrasten | Windows' words |
| tray | Infobereich | Systemablage | Windows' word |
| workspace | Arbeitsfläche | Desktop, Arbeitsbereich | GNOME's word; Desktop is the area behind the windows |
| wallpaper | Hintergrundbild | Hintergrund | Hintergrund is ambiguous next to colours |
| suspend, sleep | Standby | Bereitschaft | Energie sparen is the power mode |
| Power saver | Energie sparen | Stromsparmodus | Matches the other power modes |
| Night light | Nachtmodus | Nachtlicht | Windows' word |
| Dictation | Diktieren | Spracheingabe | Spracheingabe is a different Windows feature |
| Keyring | Schlüsselbund | Schlüsselring | GNOME and macOS |
| security chip | Sicherheitschip | TPM-Chip | Luft avoids the abbreviation in the interface |
| Full access | Vollzugriff | Voller Zugriff | Windows' word |
| password | Passwort | Kennwort | More common today |
| keyboard shortcut | Tastenkürzel | Tastenkombination | Shorter; GNOME and KDE |
| Wi-Fi | WLAN | Wi-Fi | What German speakers say |
| sound | Sound | Audio, Ton | Windows' settings page |
