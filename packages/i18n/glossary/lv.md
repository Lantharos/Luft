# Latvian

What is particular to Latvian, on top of [the rules every language shares](common.md). The agreed terms are in [lv.tbx](lv.tbx).

## Address

Prefer sentences without a person: „Atjauninājumi tiks instalēti pēc restartēšanas“, „Nav paziņojumu“. When the reader has to be addressed, use jūs, lowercase, as Windows, macOS and GNOME do: „Mēģiniet vēlreiz.“ Never Jūs or Jūsu with a capital, and never tu. Instructions take the imperative with jūs: „Nospiediet Super+Tab, lai redzētu visus logus.“

## Buttons and labels

- Buttons and menu items take the infinitive: „Saglabāt“, „Atvērt“, „Atcelt“, „Piespraust uzdevumjoslai“.
- Status lines use a past participle that agrees: „Saglabāta“ for a key (atslēga), „Pievienots“ for a fingerprint.
- Iestatījumi keeps its capital in sentences, as an app name: „Atveriet Iestatījumus“. A page is named exactly, after „sadaļā“: „sadaļā Privātums“. Other labels named in a sentence keep their capital and need no quotation marks: „ieslēdziet Netraucēt“.

## Typography

- Quotation marks „…“, with ‚…‘ inside them.
- The dash is an en dash with spaces. The percent sign takes a space: „57 %“.
- Always write the long vowels and soft consonants: ā, ē, ī, ū, č, ģ, ķ, ļ, ņ, š, ž. Search words may add the spelling without them.
- Keys use the English names printed on Latvian keyboards: Ctrl, Alt, Shift, Enter, Delete. Only the unlabelled space bar is Atstarpe.

## Names

- Settings, Disks and Install Luft are Iestatījumi, Diski and Instalēt Luft.
- Start stays Start; write „izvēlne Start“ to fit a sentence.
- Names are never declined; put the kind of thing first and decline that: „lietotnē Rover“, „vieta sistēmai Luft“.

## Plurals

Three forms: `zero` (0 and numbers ending in 0 or 11–19), `one` (numbers ending in 1, except 11) and `other` (the rest). `zero` and `other` usually read the same, but write all three, and always `{ $count }`, never the digit 1:

```ftl
windows-open = { $count ->
    [zero] { $count } atvērti logi
    [one] { $count } atvērts logs
   *[other] { $count } atvērti logi
}
```

## Words

| English | Latvian | Not | Why |
| --- | --- | --- | --- |
| app | lietotne | programma, aplikācija | Windows, macOS and app stores |
| board | tāfele | dēlis, audekls | An open surface windows are laid out on |
| All windows | Visi logi | Uzdevumu skats | What Luft calls the task view |
| taskbar | uzdevumjosla | rīkjosla, panelis | Windows' word |
| tray | sistēmas tekne | paziņojumu apgabals | It holds apps |
| pin, unpin | piespraust, atspraust | piestiprināt | Windows' words |
| snap, snap layout | piesaistīt, piesaistes izkārtojums | pievilkt | Windows' words |
| workspace | darbvieta | darbvirsma | GNOME's word; darbvirsma is the desktop |
| wallpaper | fona attēls | tapete | Windows and GNOME |
| suspend, sleep | miega režīms | gaidstāve | Windows and macOS |
| shut down | izslēgt | beidzēt | Windows; clear in context |
| Night light | Nakts gaisma | Nakts režīms | Windows and GNOME |
| emoji | emocijzīme | emodži | Windows and the term commission; declines naturally |
| Keyring | atslēgu saišķis | atslēgu gredzens | GNOME |
| firmware | aparātprogrammatūra | programmaparatūra | Windows' word |
| touchpad | skārienpaliktnis | skārienpanelis | Windows' word; skārienpanelis is a touchscreen |
| power | barošana | enerģija, jauda | Windows' settings page |
| display | displejs | monitors | Windows' settings page |
| passphrase | paroles frāze | ieejas frāze | GNOME; apart from parole |
| dark style, light style | tumšais režīms, gaišais režīms | tumšais stils | Matches the Tumšais režīms tile |
| hotspot, tether | tīklājs | piesaiste | Windows' word; piesaiste is snapping |
| On-screen keyboard | Ekrāntastatūra | ekrāna tastatūra | Windows' word |
| startup (of the computer) | startēšana | palaišana | Palaišana is for apps starting at sign-in |
