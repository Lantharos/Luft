# Norwegian Nynorsk style guide

How Luft speaks Nynorsk. The [glossary](../../packages/i18n/glossary/nn.csv) has the agreed terms; Weblate shows them next to every string.

Luft follows the current official Nynorsk norm and its mainstream forms, the ones GNOME and KDE use in Nynorsk: ikkje, eg, berre, noko, fleire, innstillingar, filer, programmet, datamaskinen. Write genuine Nynorsk, not Bokmål with a few words swapped: høgre, venstre, frå, kvar, korleis, gøyme, straum, tryggleik, bilete, vindauge.

## Address and tone

- Address the reader as **du**, lowercase, as GNOME and KDE do in Nynorsk and as Windows and macOS do in Bokmål (neither ships Nynorsk): «Du kan endre dette seinare i Innstillingar.» Never «De».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no «ver venleg» in front of every hint, no marketing words.
- Say what happens, not how it works inside. «Oppdateringane blir installerte neste gong du startar på nytt», not «Systembiletet blir bytt ut ved oppstart».
- When English uses «you» only out of habit, Nynorsk may leave it out: «Ingen varslingar» for «You have no notifications».
- Prefer active sentences with du over passive ones; Nynorsk uses the s-passive sparingly. Use «blir» + participle for status: «Blir lagra automatisk».
- Choose the classic Nynorsk forms where the norm allows two: infinitives in -e (opne, lagre, gløyme), -je verbs where they exist (leggje, setje, søkje, følgje), «vere», «kome», «no», «noko», «korleis». Don't mix in a-infinitives.

## Buttons, menus and labels

- Buttons and menu items use the **imperative**: «Lagre», «Opne», «Lukk», «Start på nytt», «Fest til oppgåvelinja». When the imperative can't drop the final -e, it equals the infinitive: «Opne», «Lagre».
- Switches and settings are nouns or short phrases: «Nattlys», «Vis sekund».
- Headings and page names are nouns: «Varslingar», «Personvern».
- Instructions in running text use the imperative with du implied: «Trykk Super+Tab for å sjå alle vindauge.»
- Keep labels short. Compounds are written as one word («skjerminnstillingar», «tastaturoppsett»), never split into two.

## Capitalization

Sentence case: only the first word and names take a capital letter. «Hurtiginnstillingar», «Ikkje forstyrr». Days, months, languages and nationalities are lowercase. In running text, Luft's parts are ordinary nouns: «oppgåvelinja», «låseskjermen», «tavla». A label referred to in a sentence keeps its capital letter and needs no quotation marks: «slå på Ikkje forstyrr».

## Typography

- Quotation marks: «…», and ‘…’ inside them.
- Apostrophe: ’, used for the genitive of names ending in s, x or z: «Keys’ oppsett».
- Ellipsis: one character, «…», with a space before it when it stands for words left out or a process going on: «Lastar …».
- Dash: the en dash with spaces, « – ». No em dashes.
- Percent sign and units take a space, a no-break space so they never wrap away from the number: «57 %», «4,5 W».
- Compounds with names, abbreviations or digits take a hyphen: «Bluetooth-adapter», «USB-minnepinne», «PDF-fil», «Rover-vindauget».
- Key names follow what Norwegian keyboards print and what Windows writes in Norwegian: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellomrom, Tilbaketast, Delete, Insert, Home, End, Page Up, Page Down, Print Screen.
- Write «e-post» and «på nett».

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Innstillingar, Diskar, Installer Luft.
- Start stays Start, as in Norwegian Windows; say «Start-menyen» when a definite form is needed.
- Names never take the definite ending: never «Roveren». When a sentence needs gender or a definite form, put the kind of thing first: «appen Rover», «i appen Tern». The genitive takes a plain -s, but Nynorsk prefers a preposition: «vindauget til Rover», «oppdateringar for Luft».

## Plurals

Nynorsk has two forms, `one` (1) and `other` (everything else, including 0). Always keep `{ $count }` in both, and keep `*[other]` as the default. Adjectives agree in the plural, and many neuter nouns look the same in both forms:

```ftl
windows-open = { $count ->
    [one] { $count } ope vindauge
   *[other] { $count } opne vindauge
}
notifications-count = { $count ->
    [one] { $count } varsling
   *[other] { $count } varslingar
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Ingen varslingar`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: «Sist sjekka: { $date }».

## Decisions

| English | Nynorsk | Instead of | Why |
| --- | --- | --- | --- |
| app | app, ein, appar | program | What Windows, phones and app stores say; «program» stays fine in keywords |
| board | tavle, ei | brett, lerret | A plain word; «lerret» is the canvas inside it |
| All windows | Alle vindauge | Oppgåvevising | That's what Luft calls the task view |
| window | vindauge | vindu | The Nynorsk word GNOME and KDE use |
| notification | varsling, ei, varslingar | varsel | KDE's word; «varsel» has the same form in singular and plural |
| notification center | varslingssenter | meldingssenter | Follows varsling; Windows' word in Norwegian |
| pin, unpin | feste, løyse | nåle fast | Windows' word in Norwegian |
| snap, snap layout | dokke, dokkingsoppsett | feste | Windows uses «feste» for both snap and pin; Luft keeps them apart |
| taskbar | oppgåvelinje | verktøylinje | Windows' word, in Nynorsk form |
| tray | systemfelt | varslingsområde | Short; it holds apps, not notifications |
| workspace | arbeidsområde | skrivebord | GNOME's word; «skrivebord» is the area behind the windows |
| wallpaper | bakgrunnsbilete | bakgrunn | «Bakgrunn» is ambiguous next to colors |
| sign in, sign out | logge inn, logge ut | logge på, logge av | GNOME, KDE and nearly every website |
| suspend, sleep | Kvilemodus | Ventemodus, Kvile | Windows' word in Nynorsk form |
| hibernate | Dvalemodus | Dvale | Windows' word; pairs with Kvilemodus |
| Power saver | Straumsparing | Batterisparing | Matches Straummodus, the setting it belongs to |
| power | straum | kraft, energi | Nynorsk form of what Windows calls the page |
| passkey | tilgangsnøkkel | passkey | Google's and Microsoft's word in Norwegian |
| recovery key | gjenopprettingsnøkkel | gjenopprettingskode | BitLocker's word, which people meet first |
| Keyring | Nøkkelring | Nøkkelknippe | GNOME and macOS |
| security, security chip | tryggleik, tryggleiksbrikke | sikkerheit, TPM-brikke | The Nynorsk word KDE and GNOME use; Luft avoids the abbreviation |
| accessibility | Tilgjenge | Tilgjengelegheit | Short enough for a page name; KDE's word |
| firmware | fastvare | firmware | Windows' word; «firmware» stays in keywords |
| touchpad | styreplate | pekeplate, touchpad | Windows' word |
| keyboard shortcut | snarveg | hurtigtast | KDE's word, in Nynorsk form |
| Fonts | Skrifttypar | Skrifter | Clearer as a page name |
| device | eining | apparat | Windows, GNOME and KDE |
| USB stick | minnepinne | USB-pinne, USB-nøkkel | Common speech; «nøkkel» is used for keys |
| Wi-Fi | Wi-Fi | WLAN, trådlaust nett | Windows' label |
| Desktop { $number } (All windows) | Arbeidsområde { $number } | Skrivebord { $number } | It names a workspace |
| passphrase | passfrase | passord | Keeps the disk passphrase apart from the account password |
| metered connection | forbruksmålt tilkopling | avgrensa tilkopling | Windows' term, in Nynorsk form |
| hotspot | tilgangspunkt | hotspot | Plain Norwegian; Windows says «mobilt tilgangspunkt» |
| sticky keys, slow keys | klebrige tastar, trege tastar | faste tastar | GNOME's words |
| it (an ei noun) as object | ho | henne | One form throughout: «bruk ho», «slå ho på» |
