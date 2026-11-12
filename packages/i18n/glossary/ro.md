# Romanian

What is particular to Romanian, on top of [the rules every language shares](common.md). The agreed terms are in [ro.tbx](ro.tbx).

## Address

Prefer sentences without a person: „Actualizările se instalează la următoarea repornire”, „Nicio notificare”. When the reader has to be addressed, use the polite plural verb forms without a pronoun, as Windows, macOS and GNOME do: „Puteți schimba asta mai târziu în Setări.” No dumneavoastră, no dvs., and never tu in running text. Instructions take the polite imperative: „Apăsați Super+Tab pentru a vedea toate ferestrele.”

Always write ș and ț with the comma below, never the cedilla forms ş and ţ. Use â and î by the current rules: „România”, „sunt”, „înapoi”, „reîncarcă”.

## Buttons and labels

- Buttons and menu items take the imperative singular, as macOS, GNOME and Android do: „Salvează”, „Deschide”, „Anulează”, „Fixează în bara de activități”. Windows' nouns („Salvare”) read like headings. The button is a command the reader gives, so it sits fine next to the polite form.
- A few power actions are nouns, as in Windows: „Repaus”, „Hibernare”, „Deconectare”.
- A label named in a sentence keeps its capital and needs no quotation marks: „activați Nu deranjați”.

## Typography

- Quotation marks „…”, with «…» inside them. The apostrophe is ’.
- The dash is an en dash with spaces. No em dashes.
- The percent sign takes no space: „57%”.
- Loanwords and abbreviations whose spelling differs from how they're said take a hyphen before the article: „mouse-ul”, „firmware-ul”, „USB-ul”, but „desktopul”, „touchpadul”.
- Keys use the English names printed on Romanian keyboards: Ctrl, Alt, Shift, Enter, Delete. The space bar is „Spațiu”.

## Names

- Settings, Disks and Install Luft are Setări, Discuri and Instalează Luft.
- Start stays Start; write „meniul Start” when it needs an article or a case.
- App names and Luft never take articles or case endings; put the kind of thing first: „în aplicația Rover”, „sistemul Luft”.

## Plurals

Three forms: `one` (1), `few` (0, 2–19, and 101–119 and so on) and `other` (20–100, 120 and so on). With `other`, the noun takes „de”:

```ftl
files-copied = { $count ->
    [one] { $count } fișier copiat
    [few] { $count } fișiere copiate
   *[other] { $count } de fișiere copiate
}
```

## Words

| English | Romanian | Not | Why |
| --- | --- | --- | --- |
| board | tablă | panou, planșă | Panou is a panel |
| All windows | Toate ferestrele | Vizualizare activități | What Luft calls the task view |
| taskbar | bara de activități | bara de sarcini | Windows' word |
| tray | tava de sistem | zona de notificare | It holds apps, not notifications |
| pin, unpin | fixa, anula fixarea | ancora | Windows' words |
| snap, snap layout | andoca, aranjament de andocare | fixa | Fixa is pin |
| sign in, sign out | conecta, deconecta | autentifica | Windows' words |
| workspace | spațiu de lucru | desktop virtual | GNOME's word; desktop is the area behind the windows |
| wallpaper | imagine de fundal | fundal, tapet | Fundal is ambiguous next to colours |
| keyboard layout | aranjament de tastatură | aspect de tastatură | GNOME and KDE; Aspect is Appearance |
| suspend, sleep | Repaus | Suspendare | Windows' word |
| Night light | Lumină de noapte | Lumină nocturnă | Windows' word |
| Keyring | Portchei | Inel de chei | macOS's word |
| keyboard shortcut | comandă rapidă | scurtătură | Windows' word |
| folder, computer, clipboard | folder, computer, clipboard | dosar, calculator, memorie temporară | Windows' words, and what people say |
| sandbox | mediu izolat | sandbox | Plain Romanian |
| passphrase | frază de acces | parolă | Apart from the account password |
| PIN | PIN, PIN-ul | codul PIN | Windows' word; codul PIN only for a SIM |
| input source | sursă de introducere | sursă de intrare | Covers layouts and input methods |
| metered connection | conexiune contorizată | conexiune limitată | Windows' word |
| home folder | folder personal | dosar personal | Folder is Luft's word |
| tether | Partajare internet | Tethering | Plain Romanian |
| Wallpapers folder | Wallpapers | Imagini de fundal | A real folder that keeps its name |
