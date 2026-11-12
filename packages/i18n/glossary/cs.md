# Czech

What is particular to Czech, on top of [the rules every language shares](common.md). The agreed terms are in [cs.tbx](cs.tbx).

## Address

Prefer sentences without a person: „Aktualizace se nainstalují při příštím restartu“, „Žádná oznámení“. When the reader has to be addressed, use vy, lowercase, as Windows, macOS, GNOME and KDE do: „Můžete to později změnit v Nastavení.“ Never Vy or Váš with a capital, and never ty. Write standard Czech, not colloquial forms: „nemůžete“, not „nemůžte“; „flash disk“, not „flashka“.

## Buttons and labels

- Buttons and menu items take the infinitive, as Windows, macOS and GNOME do: „Uložit“, „Otevřít“, „Zrušit“, „Připnout na hlavní panel“. Prefer the imperfective on buttons where Windows does („Instalovat“, „Stáhnout“) and the perfective in sentences („Aplikace se nainstaluje“).
- Some power actions read better as nouns, as in Windows: „Režim spánku“, „Hibernace“.
- Instructions in running text take the imperative with vy: „Stiskněte Super+Tab a uvidíte všechna okna.“
- Short status messages use the neuter past participle: „Uloženo“, „Zkopírováno“.
- A label named in a sentence keeps its capital and needs no quotation marks: „zapněte Nerušit“. A page of Settings is named exactly as in the sidebar: „na stránce Aktualizace“, not „v Aktualizacích“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces: „ – “. No em dashes. Ranges take an en dash without spaces: „2–4“.
- Percent signs and units take a space: „57 %“, „4,5 W“, so write `{ $percentage } %`.
- Keys use the English names printed on Czech keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is translated: Mezerník.
- Write „e-mail“, „online“ and „Wi-Fi“.

## Names

- Settings, Disks and Install Luft are Nastavení, Disky and Instalovat Luft.
- Start stays Start, as in Windows; write „nabídka Start“ when it has to inflect: „v nabídce Start“.
- Don't inflect app names; put the kind of thing first: „v aplikaci Rover“, „aplikace Tern byla zavřena“. Luft inflects as a masculine noun when it must (Luftu, s Luftem). Before Windows, add „systém“ when the case would show: „ze systému Windows“.

## Plurals

Four forms: `one` (1), `few` (2–4), `many` (decimals such as 1,5, with the genitive singular) and `other` (0 and 5 up, with the genitive plural). Write all four. Adjectives and verbs agree:

```ftl
windows-open = { $count ->
    [one] { $count } otevřené okno
    [few] { $count } otevřená okna
    [many] { $count } otevřeného okna
   *[other] { $count } otevřených oken
}
```

## Words

| English | Czech | Not | Why |
| --- | --- | --- | --- |
| board | tabule | plátno, nástěnka | A board in Czech; plátno is the canvas inside it |
| All windows | Všechna okna | Zobrazení úloh | What Luft calls the task view |
| taskbar | hlavní panel | panel úloh | Windows' word |
| tray | oznamovací oblast | systémová lišta | Windows' word, known for decades |
| snap, snap layout | přichytit, rozložení přichycení | připnout | Windows' words; připnout is pin |
| notification | oznámení | upozornění | Windows and GNOME; upozornění is a sound alert |
| workspace | pracovní prostor | pracovní plocha | Plocha is the desktop in Windows |
| wallpaper | tapeta | pozadí | macOS and phones; pozadí is ambiguous next to colours |
| suspend, sleep | uspat, Režim spánku | suspendovat | Windows' word |
| Night light | Noční světlo | Noční osvětlení | Shorter; GNOME's word |
| Quick settings | Rychlé nastavení | Rychlá nastavení | Windows 11 |
| Keep awake | Nevypínat obrazovku | Zůstat vzhůru | Says what it does, without a figure of speech |
| passkey | přístupový klíč | passkey | Apple, Google and Windows |
| Keyring | klíčenka | svazek klíčů | GNOME and macOS |
| recovery key | obnovovací klíč | klíč pro obnovení | BitLocker's word |
| sandbox | izolované prostředí | sandbox | Understandable without the English word |
| remove, delete | odebrat, odstranit | smazat | Windows: odebrat takes out of a list, odstranit destroys |
| security | zabezpečení | bezpečnost | Windows' settings page |
| privacy | soukromí | ochrana osobních údajů | Short; macOS and GNOME |
| display | displej | monitor | Windows' settings page; obrazovka is the screen as a surface |
| passphrase | heslo k disku | šifrovací heslo | Says what it unlocks, apart from the account password |
| input source | vstupní zdroj | zdroj vstupu | GNOME's word |
| home folder | domovská složka | Domov | GNOME and KDE |
| Wallpapers folder | složka Wallpapers | složka Tapety | The real folder keeps its English name |
