# Czech style guide

How Luft speaks Czech. The [glossary](../../packages/i18n/glossary/cs.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: „Aktualizace se nainstalují při příštím restartu“, „Žádná oznámení“.
- When the reader has to be addressed, use **vy**, lowercase, as Windows, macOS, GNOME and KDE all do in Czech: „Můžete to později změnit v Nastavení.“ Never capitalize Vy or Váš, and never switch to ty.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no „prosím“ in every hint, no marketing words.
- Say what happens, not how it works inside. „Aktualizace se nainstalují při příštím restartu“, not „Obraz systému se při spuštění vymění“.
- Use standard Czech, not colloquial forms: „nemůžete“, not „nemůžte“; „flash disk“, not „flashka“.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as Windows, macOS and GNOME do: „Uložit“, „Otevřít“, „Zrušit“, „Restartovat“, „Připnout na hlavní panel“.
- Prefer the imperfective infinitive on buttons where Windows does („Instalovat“, „Stáhnout“), and the perfective verb in sentences („Aplikace se nainstaluje…“).
- Some power and session actions read better as nouns, as in Windows: „Režim spánku“, „Hibernace“.
- Switches and settings are nouns or short phrases: „Noční světlo“, „Zobrazovat sekundy“.
- Headings and page names are nouns: „Oznámení“, „Soukromí“.
- Instructions in running text use the imperative with vy: „Stiskněte Super+Tab a uvidíte všechna okna.“
- Short status messages use the neuter past participle without a subject: „Uloženo“, „Zkopírováno“.
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. „Rychlé nastavení“, not „Rychlé Nastavení“. In running text, Luft's parts are ordinary nouns: „hlavní panel“, „zamykací obrazovka“, „centrum oznámení“. A label referred to in a sentence keeps its capital letter and needs no quotation marks: „zapněte Nerušit“.

## Typography

- Quotation marks: „…“, and ‚…‘ inside them.
- Ellipsis: one character, „…“, with no space before it after a word: „Načítání…“.
- Dash: the en dash with spaces, „ – “. No em dashes. Ranges take the en dash without spaces: „2–4“.
- Percent sign and units are separated by a space: „57 %“, „4,5 W“. The placeable carries the number, so write `{ $percentage } %`.
- Key names stay as printed on Czech keyboards, which use the English names: Ctrl, Alt, Shift, Enter, Esc, Delete, Home, End, Page Up. Only the space bar is translated: Mezerník.
- Write „e-mail“, „online“ and „Wi-Fi“.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Nastavení, Disky, Instalovat Luft.
- Start stays Start, as in Windows; say „nabídka Start“ when it has to inflect: „v nabídce Start“.
- Avoid inflecting app names. Put the kind of thing first: „v aplikaci Rover“, „aplikace Tern byla zavřena“. Luft itself inflects as a masculine noun when needed (Luftu, s Luftem), but prefer sentences where it doesn't.
- Before Windows, add „systém“ when the case would show: „ze systému Windows“.

## Plurals

Czech has four forms: `one` (1), `few` (2–4), `many` (only decimal numbers, such as 1,5) and `other` (0 and 5 and up). `many` takes the genitive singular, `other` the genitive plural. Write all four, keep `*[other]` as the default, and always write `{ $count }`, never the digit. Adjectives and verbs agree too:

```ftl
windows-open = { $count ->
    [one] { $count } otevřené okno
    [few] { $count } otevřená okna
    [many] { $count } otevřeného okna
   *[other] { $count } otevřených oken
}
minutes-left = { $count ->
    [one] Zbývá { $count } minuta
    [few] Zbývají { $count } minuty
    [many] Zbývá { $count } minuty
   *[other] Zbývá { $count } minut
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Žádná oznámení`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its case doesn't matter: „Naposledy zkontrolováno: { $date }“.

## Decisions

| English | Czech | Instead of | Why |
| --- | --- | --- | --- |
| you | vy, lowercase, or no person | ty, Vy | Windows, macOS, GNOME and KDE |
| board | tabule | plátno, nástěnka | A board in Czech; plátno is the canvas inside it |
| All windows | Všechna okna | Zobrazení úloh | That's what Luft calls the task view |
| taskbar | hlavní panel | panel úloh | Windows' word |
| tray | oznamovací oblast | systémová lišta | Windows' word, known for decades |
| snap, snap layout | přichytit, rozložení přichycení | připnout | Windows' words; připnout is pin |
| notification | oznámení | upozornění | Windows and GNOME; upozornění is a sound alert |
| workspace | pracovní prostor | pracovní plocha | Pracovní plocha reads as the desktop, which Windows calls plocha |
| wallpaper | tapeta | pozadí | macOS and phones; pozadí is ambiguous next to colors |
| suspend, sleep | uspat, Režim spánku | suspendovat | Windows' word |
| Night light | Noční světlo | Noční osvětlení | Shorter; GNOME's word |
| Quick settings | Rychlé nastavení | Rychlá nastavení | Windows 11 |
| Keep awake | Nevypínat obrazovku | Zůstat vzhůru | Says what it does, no figure of speech |
| passkey | přístupový klíč | passkey | Apple, Google and Windows in Czech |
| Keyring | klíčenka | svazek klíčů | GNOME and macOS |
| recovery key | obnovovací klíč | klíč pro obnovení | Windows' BitLocker word |
| sandbox | izolované prostředí | sandbox | Understandable without knowing the English word |
| remove, delete | odebrat, odstranit | smazat | Windows: odebrat takes out of a list, odstranit destroys |
| security | zabezpečení | bezpečnost | Windows' settings page |
| privacy | soukromí | ochrana osobních údajů | Short; macOS and GNOME |
| USB stick | flash disk | flashka, USB klíčenka | Standard and widely known |
| display | displej | monitor | Windows' settings page; obrazovka for the screen as a surface |
| passphrase | heslo k disku | šifrovací heslo, přístupová fráze | Keeps it apart from the account password; says what it unlocks |
| input source | vstupní zdroj | zdroj vstupu | GNOME's word |
| home folder | domovská složka | Domov | GNOME and KDE |
| Settings page in a sentence | na stránce Aktualizace | v Aktualizacích | The page name stays exactly as in the sidebar |
| Wallpapers folder | složka Wallpapers | složka Tapety | The real folder keeps its English name |
