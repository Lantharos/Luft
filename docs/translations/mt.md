# Maltese style guide

How Luft speaks Maltese. The [glossary](../../packages/i18n/glossary/mt.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader in the **second person singular**, as Windows in Maltese does: “Tista’ tibdel dan aktar tard fis-Settings.” Never the plural intom, and never a polite third person. macOS has no Maltese, and GNOME and KDE are only partly translated, so Microsoft's Maltese is the reference people know.
- Leave out the pronoun inti and possessives such as tiegħek unless the sentence needs them: “Il-fajl diġà jeżisti”, not “Il-fajl tiegħek diġà jeżisti”.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no marketing words, no “Jekk jogħġbok” in front of every hint.
- Say what happens, not how it works inside.
- Instructions in running text use the imperative singular: “Agħfas Super+Tab biex tara t-twieqi kollha.”
- Use the standard orthography of the Kunsill Nazzjonali tal-Ilsien Malti, with ċ, ġ, għ, ħ and ż everywhere. Never fall back to c, g, h or z.

## Buttons, menus and labels

- Buttons and menu items use the **imperative singular**: “Issejvja”, “Iftaħ”, “Agħlaq”, “Ikkanċella”, “Irristartja”, “Waħħal mat-taskbar”.
- The power menu uses nouns where Windows does: “Sospensjoni”, “Ibernazzjoni”; the others stay verbs: “Itfi”, “Irristartja”, “Oħroġ”.
- Switches and settings are nouns or short phrases: “Dawl ta’ billejl”, “Uri s-sekondi”.
- Headings and page names are nouns: “Notifiki”, “Privatezza”.
- Labels without a verb usually leave out the article (“Skrin imsakkar”); full sentences use it (“L-iskrin imsakkar juri l-ħin”).
- Keep labels short. If a button clips, look for a shorter word before abbreviating.

## English words

Maltese software keeps many English words, and so does Luft, following Windows in Maltese: Settings, taskbar, desktop, app, password, touchpad, firmware. Rules for them:

- English words that Maltese has taken in follow Maltese spelling where Windows does: fajl, fowlder, kompjuter, skrin, netwerk, drajv.
- Others stay in English spelling, without italics or quotation marks: taskbar, desktop, screenshot, passkey.
- They take the Maltese article with its sun-letter assimilation: is-Settings, it-taskbar, id-desktop, l-app, il-password.
- Verbs from English take Maltese forms: issejvja, irristartja, ikkopja, issettja.
- Use the plural the glossary gives, usually the English -s for English words (apps, fajls, passwords).

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Settings rapidi”, not “Settings Rapidi”. When a message starts with the article, only the article's first letter is capitalized: “Il-fajl”, “L-iskrin”, never “IL-fajl”. In running text, Luft's parts are ordinary nouns: “it-taskbar”, “l-iskrin imsakkar”. A label referred to in a sentence keeps its capital letter and needs no quotation marks: “ixgħel Tiddisturbax”.

## Typography

- Quotation marks: “…”, and ‘…’ inside them. Many Maltese words end in an apostrophe, so prefer double quotes.
- Apostrophe: always the typographic ’, never ': ta’, erġa’, saba’, m’hemmx, ’il.
- Ellipsis: one character, “…”, with no space before it: “Qed jillowdja…”.
- Dash: the en dash with spaces, “ – ”. The hyphen of the article (il-, l-, is-) is a hyphen, never a dash.
- Percent sign right after the number with no space: 57%. Units take a space: 4.5 W.
- Key names stay as printed on keyboards sold in Malta, which are English: Ctrl, Alt, Shift, Enter, Delete, Backspace, Home, End, Page Up, Page Down, Print Screen. Spacebar is written as in Windows.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Names take no article and don't change: “Rover huwa miftuħ”, “Iftaħ f’Rover”. When a sentence needs gender or an article, put the kind of thing first: “l-app Rover”, which is feminine: “l-app Rover hija magħluqa”. Luft itself is masculine.
- Settings stays Settings, as in Windows, and takes the plural article: “fis-Settings”. Disks and Install Luft are translated: Diski, Installa Luft.
- Start stays Start; say “il-menù Start” when it needs an article.

## Plurals

Maltese has five forms. With a number written in digits the noun takes:

- `one` (1): the singular, “1 fajl”.
- `two` (2): the plural for most words, “2 fajls”; native nouns with a dual may use the plural too, since the digit is written.
- `few` (0, 3–10, 103–110 …): the plural, “5 fajls”, “0 fajls”.
- `many` (11–19, 111–119 …): the singular, “15-il fajl” in speech, written “15 fajl”.
- `other` (20 and above, 101, 102 …): the singular, “20 fajl”.

Always write all five, keep `{ $count }` in every variant and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notifika
    [two] { $count } notifiki
    [few] { $count } notifiki
    [many] { $count } notifika
   *[other] { $count } notifika
}
```

Adjectives and verbs agree with the noun's form: singular after one, many and other, plural after two and few. When English has an exact `[0]` variant, keep it and translate it: `[0] L-ebda notifika`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that nothing has to agree with it: “L-aħħar verifika: { $date }”.

## Decisions

| English | Maltese | Instead of | Why |
| --- | --- | --- | --- |
| you | singular, no pronoun | intom, inti | Windows in Maltese |
| Settings | Settings | Konfigurazzjoni, Issettjar | Windows in Maltese keeps it in English |
| Start | Start | Bidu, Ibda | Windows' older Maltese packs said Bidu, but people in Malta know the menu as Start, which current Windows also uses |
| taskbar | taskbar | bar tal-kompiti | Windows in Maltese |
| board | bord | tabella | Short and already Maltese |
| All windows | It-twieqi kollha | Wiri tal-kompiti | That's what Luft calls the task view |
| snap | allinja | waħħal | Windows' word; waħħal is pin |
| tray | trej tas-sistema | żona tan-notifiki | Windows' word for the system tray; it holds apps, not notifications |
| workspace | spazju tax-xogħol | workspace, desktop virtwali | Plain Maltese; desktop is the area behind the windows |
| wallpaper | sfond | wallpaper | Windows in Maltese |
| Night light | Dawl ta’ billejl | Modalità ta’ billejl | Windows in Maltese |
| Do Not Disturb | Tiddisturbax | Toqgħodx tiddisturba | The short form people put on doors |
| shut down | Itfi | Agħlaq is-sistema | Shorter, and what people say |
| suspend, sleep | Sospensjoni | Irqad | Windows in Maltese |
| unlock | żblokka | iftaħ | Iftaħ is open |
| paste | ippejstja | waħħal | Waħħal is pin |
| save | issejvja | salva | Windows in Maltese |
| Keyring | Ċurkett taċ-ċwievet | Keyring | Clear to everyone, and plain Maltese for a key ring |
| recovery key | ċavetta tal-irkupru | kodiċi tal-irkupru | Windows' BitLocker word |
| device | apparat | tagħmir | Countable; tagħmir means equipment |
| clipboard | klibbord | clipboard | Windows in Maltese |
| screenshot | screenshot | klipp tal-iskrin | What people say; Windows' word means a cut-out |
| folder | fowlder | folder | Windows in Maltese |
| password | password | kodiċi tal-aċċess | Windows in Maltese and what people say |
| location | post | lokalità | Lokalità is a town or village; servizzi tal-post |
| connect, disconnect | ikkonnettja, skonnettja | qabbad, aqla’ | Qabbad and tqabbil stay for Bluetooth pairing and plugging in |
| brightness | luminożità | dawl tal-iskrin | Settings already used it throughout; dawl tat-tastiera stays for the keyboard backlight |
| dark style (in sentences) | modalità skura | stil skur | Matches the Quick settings tile |
| passphrase | passphrase | password | Kept distinct from the account password; feminine |
| video | vidjo, plural vidjows | video, videos | Maltese spelling |
