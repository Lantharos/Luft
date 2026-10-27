# Norwegian Bokmål style guide

How Luft speaks Norwegian Bokmål. The [glossary](../../packages/i18n/glossary/nb.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **du**, lowercase, as macOS, Windows, GNOME and KDE all do in Norwegian: «Du kan endre dette senere i Innstillinger.» Never «De» or «dere».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no «vennligst» in front of every hint, no marketing words.
- Say what happens, not how it works inside. «Oppdateringene installeres neste gang du starter på nytt», not «Systembildet byttes ut ved oppstart».
- When English uses «you» only out of habit, Norwegian may leave it out: «Ingen varsler» for «You have no notifications».
- Prefer active sentences with du over stiff impersonal ones: «Du kan endre det senere», not «Det er mulig å endre det senere». Short passive forms with -s are fine for status: «Lagres automatisk».
- Use moderate, mainstream Bokmål as Windows and macOS write it: the -en ending for feminine nouns in the definite form («tavlen», «oppgavelinjen»), «hvis» rather than «om» for conditions, and no radical forms.

## Buttons, menus and labels

- Buttons and menu items use the **imperative**: «Lagre», «Åpne», «Lukk», «Start på nytt», «Fest til oppgavelinjen».
- Verbs in -ere take no ending in the imperative: «Kopier», «Installer», «Konfigurer». Verbs whose stem ends in two consonants keep the -e: «Åpne», «Endre».
- Switches and settings are nouns or short phrases: «Nattlys», «Vis sekunder».
- Headings and page names are nouns: «Varsler», «Personvern».
- Instructions in running text use the imperative with du implied: «Trykk på Super+Tab for å se alle vinduer.»
- Keep labels short. Compounds are written as one word («skjerminnstillinger», «hurtigtast»), never split into two.

## Capitalization

Sentence case: only the first word and names take a capital letter. «Hurtiginnstillinger», «Ikke forstyrr», never «Ikke Forstyrr». Days, months, languages and nationalities are lowercase, as always in Norwegian. In running text, Luft's parts are ordinary nouns: «oppgavelinjen», «låseskjermen», «tavlen». A label referred to in a sentence keeps its capital letter and needs no quotation marks: «slå på Ikke forstyrr».

## Typography

- Quotation marks: «…», and ‘…’ inside them.
- Apostrophe: ’, used only for the genitive of names ending in s, x or z: «Keys’ oppsett».
- Ellipsis: one character, «…», with no space before it: «Laster inn…».
- Dash: the en dash with spaces, « – ». No em dashes.
- Percent sign and units take a space, a no-break space so they never wrap away from the number: «57 %», «4,5 W».
- Compounds with names, abbreviations or digits take a hyphen: «Bluetooth-adapter», «USB-pinne», «PDF-fil», «Rover-vindu».
- Key names follow what Norwegian keyboards print and what Windows writes in Norwegian: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellomrom, Tilbake, Delete, Insert, Home, End, Page Up, Page Down, Print Screen.
- Write «e-post», «på nett» and «wifi» in running text, «Wi-Fi» as a label.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Innstillinger, Disker, Installer Luft.
- Start stays Start, as on Windows; say «Start-menyen» when it needs a definite form.
- Names never take the definite ending: never «Roveren». When a sentence needs gender or a definite form, put the kind of thing first: «appen Rover», «i appen Tern». The genitive takes a plain -s: «Rovers vindu», «Lufts oppdateringer».

## Plurals

Norwegian Bokmål has two forms, `one` (1) and `other` (everything else, including 0). Always keep `{ $count }` in both, and keep `*[other]` as the default. Adjectives agree in the plural:

```ftl
windows-open = { $count ->
    [one] { $count } åpent vindu
   *[other] { $count } åpne vinduer
}
notifications-count = { $count ->
    [one] { $count } varsel
   *[other] { $count } varsler
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Ingen varsler`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: «Sist sjekket: { $date }».

## Decisions

| English | Norwegian | Instead of | Why |
| --- | --- | --- | --- |
| app | app, en | program, applikasjon | What Windows, phones and app stores say |
| board | tavle, en | board, lerret | A plain Norwegian word; «lerret» is the canvas inside it |
| All windows | Alle vinduer | Oppgavevisning | That's what Luft calls the task view |
| notification | varsel | varsling, melding | Windows and Android; «melding» also means a message |
| notification center | varslingssenter | meldingssenter | Windows' word |
| pin, unpin | feste, løsne | knappe fast | Windows' words |
| snap, snap layout | dokke, dokkeoppsett | feste, festeoppsett | Windows uses «feste» for both; Luft keeps it for pin |
| tray | systemstatusfelt | varslingsområde | Windows' word; it holds apps, not notifications |
| workspace | arbeidsområde | skrivebord | GNOME's word; «skrivebord» is the area behind the windows |
| wallpaper | bakgrunnsbilde | bakgrunn | «Bakgrunn» is ambiguous next to colors |
| sign in, sign out | logge inn, logge ut | logge på, logge av | macOS, GNOME and nearly every website; the noun stays «pålogging» |
| suspend, sleep | Hvilemodus | Ventemodus, Hvile | Windows' word |
| shut down | Slå av | Avslutt | Windows' and GNOME's word |
| Power saver | Strømsparing | Best strømeffektivitet | Short and matches Strømmodus |
| passkey | tilgangsnøkkel | passkey, passnøkkel | Windows and Google in Norwegian |
| recovery key | gjenopprettingsnøkkel | gjenopprettelsesnøkkel | BitLocker's word, which people meet first |
| Keyring | Nøkkelring | Nøkkelknippe | GNOME and macOS |
| security chip | sikkerhetsbrikke | TPM-brikke | Luft avoids the abbreviation in the interface |
| firmware | fastvare | firmware | Windows and macOS in Norwegian |
| password | passord | kode | Everyone's word |
| keyboard shortcut | hurtigtast | tastatursnarvei | Windows' word, short |
| touchpad | styreplate | touchpad | Windows' and macOS' word |
| computer | datamaskin | PC, maskin | Windows' and GNOME's word in running text |
| USB stick | minnepinne | USB-flashstasjon | Common speech; «USB-pinne» where USB must be said |
| Wi-Fi | Wi-Fi | WLAN, trådløst | Windows' label; wifi in running text |
| passphrase | passfrase | passordfrase | Short, and kept apart from «passord» |
| metered connection | forbruksmålt tilkobling | målt tilkobling | Windows' word |
| input source | inndatakilde | inndatametode | Covers both layouts and input methods |
| hotspot | trådløssone | hotspot | GNOME's word |
| drive | disk | stasjon | Matches the app Disker; «stasjon» only where a plugged-in drive must be named |
| light style, dark style | lys modus, mørk modus | lys stil, mørk stil | Matches the Quick settings tile |
| home folder | hjemmemappe; «Hjem» in paths | hjemmekatalog | GNOME's words |
