# Norwegian Nynorsk

What is particular to Norwegian Nynorsk, on top of [the rules every language shares](common.md). The agreed terms are in [nn.tbx](nn.tbx).

Luft follows the current official Nynorsk norm in the mainstream forms GNOME and KDE use: ikkje, eg, berre, noko, fleire, innstillingar, filer, datamaskinen. Write real Nynorsk, not Bokmål with a few words swapped: høgre, frå, kvar, korleis, gøyme, straum, tryggleik, bilete, vindauge. Where the norm allows two forms, take the classic one: infinitives in -e (opne, lagre, gløyme), -je verbs where they exist (leggje, setje, søkje), vere, kome, no. No a-infinitives.

## Address

Address the reader as du, lowercase, as GNOME and KDE do in Nynorsk: «Du kan endre dette seinare i Innstillingar.» Never De. Prefer active sentences; Nynorsk uses the s-passive sparingly, so status takes blir and a participle: «Blir lagra automatisk».

## Buttons and labels

- Buttons and menu items take the imperative: «Lagre», «Opne», «Lukk», «Start på nytt», «Fest til oppgåvelinja».
- Instructions take the imperative: «Trykk Super+Tab for å sjå alle vindauge.»
- Compounds are one word, never split: «skjerminnstillingar».
- An ei noun as object is always ho: «bruk ho», «slå ho på».
- A label named in a sentence keeps its capital and needs no quotation marks: «slå på Ikkje forstyrr».

## Typography

- Quotation marks «…», with ‘…’ inside them. The apostrophe ’ marks the genitive of names ending in s, x or z.
- The ellipsis takes a space before it when it stands for missing words.
- The dash is an en dash with spaces. No em dashes.
- Percent signs and units take a no-break space: «57 %», «4,5 W».
- Compounds with names, abbreviations or digits take a hyphen: «Bluetooth-adapter», «USB-minnepinne», «Rover-vindauget».
- Keys follow Norwegian keyboards and Windows: Ctrl, Alt, Skift, Enter, Esc, Tab, Mellomrom, Tilbaketast, Delete.
- Write «e-post» and «på nett».

## Names

- Settings, Disks and Install Luft are Innstillingar, Diskar and Installer Luft.
- Start stays Start; «Start-menyen» when it needs a definite form.
- Names never take the definite ending, so never «Roveren». When a sentence needs one: «appen Rover». Prefer a preposition to the genitive: «vindauget til Rover», «oppdateringar for Luft».

## Plurals

Two forms, `one` and `other`. Adjectives agree, and many neuter nouns look the same in both:

```ftl
windows-open = { $count ->
    [one] { $count } ope vindauge
   *[other] { $count } opne vindauge
}
```

## Words

| English | Nynorsk | Not | Why |
| --- | --- | --- | --- |
| app | app, ein, appar | program | What Windows, phones and app stores say |
| board | tavle, ei | brett, lerret | A plain word; lerret is the canvas inside it |
| All windows | Alle vindauge | Oppgåvevising | What Luft calls the task view |
| window | vindauge | vindu | The Nynorsk word GNOME and KDE use |
| notification, notification center | varsling, ei; varslingssenter | varsel | KDE's word; varsel is the same in singular and plural |
| pin, unpin | feste, løyse | nåle fast | Windows' word |
| snap, snap layout | dokke, dokkingsoppsett | feste | Windows uses feste for both; Luft keeps them apart |
| taskbar | oppgåvelinje | verktøylinje | Windows' word in Nynorsk form |
| tray | systemfelt | varslingsområde | Short; it holds apps |
| workspace | arbeidsområde | skrivebord | GNOME's word; skrivebord is the desktop, also in All windows |
| wallpaper | bakgrunnsbilete | bakgrunn | Bakgrunn is ambiguous next to colours |
| sign in, sign out | logge inn, logge ut | logge på, logge av | GNOME, KDE and nearly every website |
| suspend, sleep | Kvilemodus | Ventemodus | Windows' word in Nynorsk form |
| hibernate | Dvalemodus | Dvale | Pairs with Kvilemodus |
| power, Power saver | straum, Straumsparing | kraft, Batterisparing | Matches Straummodus |
| passkey | tilgangsnøkkel | passkey | Google and Microsoft |
| recovery key | gjenopprettingsnøkkel | gjenopprettingskode | BitLocker's word |
| Keyring | Nøkkelring | Nøkkelknippe | GNOME and macOS |
| security, security chip | tryggleik, tryggleiksbrikke | sikkerheit, TPM-brikke | KDE and GNOME; Luft avoids the abbreviation |
| accessibility | Tilgjenge | Tilgjengelegheit | Short enough for a page name; KDE's word |
| firmware | fastvare | firmware | Windows' word |
| touchpad | styreplate | pekeplate | Windows' word |
| keyboard shortcut | snarveg | hurtigtast | KDE's word |
| Fonts | Skrifttypar | Skrifter | Clearer as a page name |
| device | eining | apparat | Windows, GNOME and KDE |
| USB stick | minnepinne | USB-nøkkel | Common speech; nøkkel is for keys |
| passphrase | passfrase | passord | Apart from the account password |
| metered connection | forbruksmålt tilkopling | avgrensa tilkopling | Windows' term in Nynorsk form |
| hotspot | tilgangspunkt | hotspot | Plain Norwegian |
| sticky keys, slow keys | klebrige tastar, trege tastar | faste tastar | GNOME's words |
