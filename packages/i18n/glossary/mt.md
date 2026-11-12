# Maltese

What is particular to Maltese, on top of [the rules every language shares](common.md). The agreed terms are in [mt.tbx](mt.tbx).

## Address

Address the reader in the second person singular, as Windows does in Maltese: “Tista’ tibdel dan aktar tard fis-Settings.” Never intom, and never a polite third person. Windows' Maltese is the reference people know, since macOS has none and GNOME and KDE are only partly translated. Leave out inti and possessives such as tiegħek unless the sentence needs them: “Il-fajl diġà jeżisti”. Instructions take the imperative singular: “Agħfas Super+Tab biex tara t-twieqi kollha.”

Use the standard orthography of the Kunsill Nazzjonali tal-Ilsien Malti, with ċ, ġ, għ, ħ and ż everywhere.

## Buttons and labels

- Buttons and menu items take the imperative singular: “Issejvja”, “Iftaħ”, “Agħlaq”, “Ikkanċella”, “Waħħal mat-taskbar”.
- The power menu uses nouns where Windows does (“Sospensjoni”, “Ibernazzjoni”); the rest stay verbs: “Itfi”, “Irristartja”, “Oħroġ”.
- Labels without a verb usually drop the article (“Skrin imsakkar”); full sentences keep it.
- When a message starts with the article, only its first letter is a capital: “Il-fajl”, never “IL-fajl”.
- A label named in a sentence keeps its capital and needs no quotation marks: “ixgħel Tiddisturbax”.

## English words

Maltese software keeps many English words, and Luft follows Windows in Maltese: Settings, taskbar, desktop, app, password, touchpad, firmware.

- Words Maltese has taken in follow Maltese spelling where Windows does: fajl, fowlder, kompjuter, skrin, netwerk, drajv, vidjo.
- Others keep their English spelling, without italics or quotation marks: taskbar, desktop, screenshot.
- They take the Maltese article with sun-letter assimilation: is-Settings, it-taskbar, l-app.
- Verbs from English take Maltese forms: issejvja, irristartja, ikkopja.
- Plurals are as the glossary gives them, usually the English -s (apps, fajls).

## Typography

- Quotation marks “…”, with ‘…’ inside them. Prefer the double ones, since many words end in an apostrophe.
- The apostrophe is always ’: ta’, erġa’, m’hemmx, ’il.
- The dash is an en dash with spaces. The article's hyphen (il-, l-, is-) is a hyphen, never a dash.
- The percent sign takes no space (57%); units do (4.5 W).
- Keys stay as printed on Maltese keyboards, which are English: Ctrl, Alt, Shift, Enter, Delete, Spacebar.

## Names

- Names take no article and don't change: “Rover huwa miftuħ”. When a sentence needs an article or gender: “l-app Rover hija magħluqa”, since app is feminine. Luft is masculine.
- Settings stays Settings, as in Windows, with the plural article: “fis-Settings”. Disks and Install Luft are Diski and Installa Luft.
- Start stays Start: “il-menù Start”.

## Plurals

Five forms. With digits, the noun takes the singular after `one` (1), `many` (11–19, 111–119) and `other` (20 and up, 101, 102), and the plural after `two` (2) and `few` (0, 3–10, 103–110). Adjectives and verbs follow the noun. Write all five:

```ftl
notifications-count = { $count ->
    [one] { $count } notifika
    [two] { $count } notifiki
    [few] { $count } notifiki
    [many] { $count } notifika
   *[other] { $count } notifika
}
```

## Words

| English | Maltese | Not | Why |
| --- | --- | --- | --- |
| Settings | Settings | Konfigurazzjoni | Windows in Maltese keeps it in English |
| Start | Start | Bidu, Ibda | People know the menu as Start, as current Windows has it |
| taskbar | taskbar | bar tal-kompiti | Windows in Maltese |
| board | bord | tabella | Short and already Maltese |
| All windows | It-twieqi kollha | Wiri tal-kompiti | What Luft calls the task view |
| snap | allinja | waħħal | Windows' word; waħħal is pin |
| tray | trej tas-sistema | żona tan-notifiki | Windows' word; it holds apps |
| workspace | spazju tax-xogħol | desktop virtwali | Plain Maltese; desktop is the area behind the windows |
| wallpaper | sfond | wallpaper | Windows in Maltese |
| Night light | Dawl ta’ billejl | Modalità ta’ billejl | Windows in Maltese |
| Do Not Disturb | Tiddisturbax | Toqgħodx tiddisturba | The short form people put on doors |
| shut down | Itfi | Agħlaq is-sistema | Shorter, and what people say |
| suspend, sleep | Sospensjoni | Irqad | Windows in Maltese |
| unlock | żblokka | iftaħ | Iftaħ is open |
| paste | ippejstja | waħħal | Waħħal is pin |
| save | issejvja | salva | Windows in Maltese |
| Keyring | Ċurkett taċ-ċwievet | Keyring | Plain Maltese for a key ring |
| recovery key | ċavetta tal-irkupru | kodiċi tal-irkupru | BitLocker's word |
| device | apparat | tagħmir | Countable; tagħmir means equipment |
| clipboard | klibbord | clipboard | Windows in Maltese |
| screenshot | screenshot | klipp tal-iskrin | What people say; Windows' word means a cut-out |
| location | post | lokalità | Lokalità is a town or village |
| connect, disconnect | ikkonnettja, skonnettja | qabbad, aqla’ | Qabbad stays for Bluetooth pairing and plugging in |
| brightness | luminożità | dawl tal-iskrin | Used throughout Settings; dawl tat-tastiera is the keyboard backlight |
| dark style | modalità skura | stil skur | Matches the Quick settings tile |
| passphrase | passphrase, feminine | password | Apart from the account password |
