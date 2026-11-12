# Norwegian Bokmål

What is particular to Norwegian Bokmål, on top of [the rules every language shares](common.md). The agreed terms are in [nb.tbx](nb.tbx).

## Address

Address the reader as du, lowercase, as macOS, Windows, GNOME and KDE do: «Du kan endre dette senere i Innstillinger.» Never De or dere. Prefer an active sentence with du to a stiff impersonal one; short -s passives are fine for status: «Lagres automatisk».

Write moderate, mainstream Bokmål as Windows and macOS do: the -en ending for feminine nouns in the definite form («tavlen», «oppgavelinjen»), «hvis» rather than «om» for conditions, and no radical forms.

## Buttons and labels

- Buttons and menu items take the imperative: «Lagre», «Åpne», «Lukk», «Start på nytt», «Fest til oppgavelinjen». Verbs in -ere take no ending («Kopier», «Installer»); stems ending in two consonants keep the -e («Åpne», «Endre»).
- Instructions take the imperative: «Trykk på Super+Tab for å se alle vinduer.»
- Compounds are one word, never split: «skjerminnstillinger», «hurtigtast».
- Days, months, languages and nationalities are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: «slå på Ikke forstyrr».

## Typography

- Quotation marks «…», with ‘…’ inside them.
- The apostrophe ’ only marks the genitive of names ending in s, x or z: «Keys’ oppsett».
- The dash is an en dash with spaces. No em dashes.
- Percent signs and units take a no-break space: «57 %», «4,5 W».
- Compounds with names, abbreviations or digits take a hyphen: «Bluetooth-adapter», «USB-pinne», «Rover-vindu».
- Keys follow Norwegian keyboards and Windows: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellomrom, Tilbake, Delete.
- Write «e-post», «på nett», and «wifi» in running text but «Wi-Fi» as a label.

## Names

- Settings, Disks and Install Luft are Innstillinger, Disker and Installer Luft.
- Start stays Start, as in Windows; «Start-menyen» when it needs a definite form.
- Names never take the definite ending, so never «Roveren». When a sentence needs one: «appen Rover», «i appen Tern». The genitive is a plain -s: «Rovers vindu», «Lufts oppdateringer».

## Plurals

Two forms, `one` and `other`. Adjectives agree in the plural:

```ftl
windows-open = { $count ->
    [one] { $count } åpent vindu
   *[other] { $count } åpne vinduer
}
```

## Words

| English | Norwegian | Not | Why |
| --- | --- | --- | --- |
| app | app, en | program, applikasjon | What Windows, phones and app stores say |
| board | tavle, en | board, lerret | A plain Norwegian word; lerret is the canvas inside it |
| All windows | Alle vinduer | Oppgavevisning | What Luft calls the task view |
| notification, notification center | varsel, varslingssenter | varsling, melding | Windows and Android; melding is also a message |
| pin, unpin | feste, løsne | knappe fast | Windows' words |
| snap, snap layout | dokke, dokkeoppsett | feste | Windows uses feste for both; Luft keeps it for pin |
| tray | systemstatusfelt | varslingsområde | Windows' word; it holds apps |
| workspace | arbeidsområde | skrivebord | GNOME's word; skrivebord is the desktop |
| wallpaper | bakgrunnsbilde | bakgrunn | Bakgrunn is ambiguous next to colours |
| sign in, sign out | logge inn, logge ut | logge på, logge av | macOS, GNOME and nearly every website; the noun stays pålogging |
| suspend, sleep | Hvilemodus | Ventemodus | Windows' word |
| shut down | Slå av | Avslutt | Windows and GNOME |
| Power saver | Strømsparing | Best strømeffektivitet | Short, and matches Strømmodus |
| recovery key | gjenopprettingsnøkkel | gjenopprettelsesnøkkel | BitLocker's word |
| Keyring | Nøkkelring | Nøkkelknippe | GNOME and macOS |
| security chip | sikkerhetsbrikke | TPM-brikke | Luft avoids the abbreviation |
| firmware | fastvare | firmware | Windows and macOS |
| keyboard shortcut | hurtigtast | tastatursnarvei | Windows' word, short |
| touchpad | styreplate | touchpad | Windows and macOS |
| computer | datamaskin | PC, maskin | Windows and GNOME in running text |
| USB stick | minnepinne | USB-flashstasjon | Common speech; USB-pinne where USB must be said |
| passphrase | passfrase | passordfrase | Short, and apart from passord |
| metered connection | forbruksmålt tilkobling | målt tilkobling | Windows' word |
| input source | inndatakilde | inndatametode | Covers layouts and input methods |
| hotspot | trådløssone | hotspot | GNOME's word |
| drive | disk | stasjon | Matches Disker; stasjon only for a plugged-in drive |
| light style, dark style | lys modus, mørk modus | lys stil | Matches the Quick settings tile |
| home folder | hjemmemappe; Hjem in paths | hjemmekatalog | GNOME's words |
