# Polish

What is particular to Polish, on top of [the rules every language shares](common.md). The agreed terms are in [pl.tbx](pl.tbx).

## Address

Prefer sentences without a person, as GNOME and KDE do: „Aktualizacje zostaną zainstalowane przy następnym uruchomieniu”, „Brak powiadomień”. The impersonal past suits results: „Zapisano”, „Nie udało się dodać odcisku palca”. When the reader has to be addressed, use ty, lowercase, as Windows and macOS do: „Możesz to zmienić później w Ustawieniach.” Never Pan, Pani or Państwo, and never Ty or Twój with a capital.

## Buttons and labels

- Buttons and menu items take the imperative singular: „Zapisz”, „Otwórz”, „Anuluj”, „Uruchom ponownie”, „Przypnij do paska zadań”.
- A switch for ongoing behaviour takes the imperfective („Pokazuj sekundy”, „Nie usypiaj”); a one-off action the perfective („Pokaż”, „Usuń”).
- A label named in a sentence keeps its capital and needs no quotation marks: „włącz Nie przeszkadzać”.

## Typography

- Quotation marks „…”, with «…» inside them.
- The dash is an en dash with spaces: „ – ”. No em dashes.
- The percent sign takes no space („57%”); units do („4,5 W”).
- Commas before „aby”, „że”, „który” and „gdy”, as grammar requires, even where English has none.
- Keys use the English names printed on Polish keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is Spacja.

## Names

- Settings, Disks and Install Luft are Ustawienia, Dyski and Zainstaluj Luft. Ustawienia declines normally: „w Ustawieniach”.
- Start stays Start; write „menu Start” so it doesn't decline.
- Don't decline app names, Luft or Kestrel; put the kind of thing first: „w aplikacji Rover”, „w systemie Luft”, „z systemu Windows”. That noun decides agreement: „aplikacja Magpie jest otwarta”.

## Plurals

Four forms. `one` is exactly 1 (21 is not). `few` is 2–4, 22–24 and so on, but not 12–14. `many` is 0, 5–21, 25–31 and so on, including 12–14. `other` is fractions, with the genitive singular („1,5 pliku”). Write all four. The impersonal past, such as „Zaznaczono”, avoids agreeing the verb:

```ftl
files-selected = { $count ->
    [one] Zaznaczono { $count } plik
    [few] Zaznaczono { $count } pliki
    [many] Zaznaczono { $count } plików
   *[other] Zaznaczono { $count } pliku
}
```

## Words

| English | Polish | Not | Why |
| --- | --- | --- | --- |
| board | tablica | plansza, płótno | A plain word for a surface you lay things on |
| All windows | Wszystkie okna | Widok zadań | What Luft calls the task view |
| snap, snap layout | przyciągać, układ przyciągania | przypinać | Windows' words; przypiąć is pin |
| tray | zasobnik systemowy | obszar powiadomień | Windows' word; it holds apps, not notifications |
| workspace | obszar roboczy | pulpit wirtualny | GNOME's word; pulpit is the desktop |
| wallpaper | tapeta | tło | What people say; tło is ambiguous next to colours |
| suspend, sleep | uśpić, Uśpij, uśpienie | wstrzymać | Windows and GNOME |
| shut down | Wyłącz | Zamknij | Zamknij closes a window |
| Night light | Oświetlenie nocne | Nocne światło | Windows' word |
| Keep awake | Nie usypiaj | Utrzymuj aktywność | Short and plain |
| Keyring | pęk kluczy | baza kluczy | macOS |
| security chip | procesor zabezpieczeń | układ TPM | Windows' name for the TPM |
| firmware | oprogramowanie układowe | firmware | Windows' word |
| touchpad | panel dotykowy | touchpad, gładzik | Windows and GNOME |
| USB stick | pamięć USB | pendrive | Declines without an apostrophe; GNOME and KDE |
| battery | bateria | akumulator | Windows' word |
| security | bezpieczeństwo | zabezpieczenia | GNOME's page name; zabezpieczenia are the measures |
| emoji | emoji | emotikon, emotka | Windows' word; indeclinable |
| passphrase | fraza hasła | hasło | Apart from the account password |
| home folder, Pictures | folder domowy, Obrazy | katalog domowy | Folder is the word used everywhere else; Wallpapers keeps its English name |
| Zoom (accessibility) | Lupa | Powiększenie | Windows' name; matches the magnifier shortcuts |
