# Polish style guide

How Luft speaks Polish. The [glossary](../../packages/i18n/glossary/pl.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all, as GNOME and KDE do in Polish: „Aktualizacje zostaną zainstalowane przy następnym uruchomieniu”, „Brak powiadomień”. Past impersonal forms work well for results: „Zapisano”, „Skopiowano”, „Nie udało się dodać odcisku palca”.
- When the reader has to be addressed, use **ty**, lowercase, as Windows and macOS do in Polish: „Możesz to zmienić później w Ustawieniach.” Never „Pan/Pani”, never „Państwo”, never capitalized „Ty” or „Twój”.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „proszę” in front of every hint, no marketing words.
- Say what happens, not how it works inside.
- When English uses „you” only out of habit, leave it out: „Brak powiadomień” for „You have no notifications”.

## Buttons, menus and labels

- Buttons and menu items use the **imperative, second person singular**, as in every Polish desktop: „Zapisz”, „Otwórz”, „Anuluj”, „Uruchom ponownie”, „Przypnij do paska zadań”.
- Results and states use the impersonal past: „Zapisano”, „Wysłano do drukarki”.
- Switches and settings are nouns or short phrases: „Oświetlenie nocne”, „Pokazuj sekundy”. A switch that describes ongoing behavior takes the imperfective („Pokazuj”, „Nie usypiaj”); a one-off action takes the perfective („Pokaż”, „Usuń”).
- Headings and page names are nouns: „Powiadomienia”, „Prywatność”.
- Instructions in running text use the imperative with ty: „Naciśnij Super+Tab, aby zobaczyć wszystkie okna.”
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Szybkie ustawienia”, not „Szybkie Ustawienia”. In running text, Luft's parts are ordinary nouns: „pasek zadań”, „ekran blokady”. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „włącz Nie przeszkadzać”, „w Ustawieniach”.

## Typography

- Quotation marks: „…” (low 9, high 9), and «…» inside them.
- Apostrophe: ’, only where Polish needs it for a foreign name, which Luft avoids.
- Ellipsis: one character, „…”, with no space before it: „Ładowanie…”.
- Dash: the en dash with spaces, „ – ”. No em dashes.
- Percent sign with no space: „57%”. Units take a space: „4,5 W”.
- Commas before „aby”, „że”, „który”, „gdy” as Polish grammar requires, even where English has none.
- Key names stay as printed on keyboards sold in Poland, which use the English names: Ctrl, Alt, Shift, Enter, Esc, Delete, Home. Only the space bar is called Spacja.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Ustawienia, Dyski, Zainstaluj Luft. Ustawienia declines like a normal noun: „w Ustawieniach”.
- Start stays Start, as in Windows; say „menu Start” in sentences so it doesn't have to decline.
- Don't decline app names. Put the kind of thing first: „w aplikacji Rover”, „aplikacja Tern została zamknięta”. The same goes for Luft and Kestrel when they would need an ending: „system Luft”, „w systemie Luft”.
- The noun in front decides agreement: „aplikacja Magpie jest otwarta” (feminine, from aplikacja).

## Plurals

Polish has four forms:

- `one`: exactly 1. Unlike Croatian, 21 and 31 are not `one`.
- `few`: 2–4, 22–24, 32–34 and so on, but not 12–14.
- `many`: 0, 5–21, 25–31 and so on, including 12–14.
- `other`: fractions. Use the genitive singular, as in „1,5 pliku”, and make it the default.

Write all four, with `{ $count }` in every one and `*[other]` as the default. Adjectives and verbs agree too:

```ftl
files-selected = { $count ->
    [one] Zaznaczono { $count } plik
    [few] Zaznaczono { $count } pliki
    [many] Zaznaczono { $count } plików
   *[other] Zaznaczono { $count } pliku
}
windows-open = { $count ->
    [one] { $count } otwarte okno
    [few] { $count } otwarte okna
    [many] { $count } otwartych okien
   *[other] { $count } otwartego okna
}
```

Impersonal past forms such as „Zaznaczono” avoid verb agreement altogether, which is why Luft prefers them. When English has an exact `[0]` variant, keep it and translate it: `[0] Brak powiadomień`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Ostatnie sprawdzenie: { $date }”.

## Decisions

| English | Polish | Instead of | Why |
| --- | --- | --- | --- |
| you | ty, lowercase, or no person | Pan/Pani, Ty | Windows and macOS; GNOME and KDE avoid the person |
| board | tablica | plansza, płótno | A plain word for a surface you lay things on |
| All windows | Wszystkie okna | Widok zadań | That's what Luft calls the task view |
| snap, snap layout | przyciągać, układ przyciągania | przypinać, dociągać | Windows' words; przypiąć is pin |
| tray | zasobnik systemowy | obszar powiadomień | Windows' word; it holds apps, not notifications |
| workspace | obszar roboczy | pulpit wirtualny | GNOME's word; pulpit is the desktop |
| wallpaper | tapeta | tło | What people say, as in macOS; tło is ambiguous next to colors |
| suspend, sleep | uśpić, Uśpij, uśpienie | wstrzymać | Windows' and GNOME's words |
| shut down | Wyłącz | Zamknij | Zamknij means close a window |
| Night light | Oświetlenie nocne | Nocne światło | Windows' word, the one most people know |
| Keep awake | Nie usypiaj | Utrzymuj aktywność | Short and plain |
| passkey | klucz dostępu | passkey | Google and Apple in Polish |
| Keyring | pęk kluczy | baza kluczy | macOS (Pęk kluczy) |
| security chip | procesor zabezpieczeń | układ TPM | Windows' name for the TPM |
| firmware | oprogramowanie układowe | firmware | Windows' word |
| touchpad | panel dotykowy | touchpad, gładzik | Windows and GNOME |
| USB stick | pamięć USB | pendrive | Declines without an apostrophe; GNOME and KDE |
| battery | bateria | akumulator | Windows' word |
| security | bezpieczeństwo | zabezpieczenia | GNOME's page name; zabezpieczenia is used for the measures themselves |
| emoji | emoji | emotikon, emotka | Windows' word; indeclinable |
| Wi-Fi | Wi-Fi | sieć bezprzewodowa | What Windows and people say |
| passphrase | fraza hasła | hasło | Keeps it apart from the account password |
| home folder, Pictures | folder domowy, Obrazy | katalog domowy | Folder is the word used everywhere else; the Wallpapers folder inside keeps its English name |
| Zoom (accessibility) | Lupa | Powiększenie | Windows' name; matches the magnifier shortcuts |
| Windows in sentences | system Windows, z systemu Windows | z Windows | Same pattern as system Luft; Windows alone only as a subject |
