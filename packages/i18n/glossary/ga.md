# Irish

What is particular to Irish, on top of [the rules every language shares](common.md). The agreed terms are in [ga.tbx](ga.tbx).

## Address

Address the reader as tú, as Windows, Microsoft 365, GNOME and KDE do: “Is féidir leat é seo a athrú níos déanaí sna Socruithe.” Irish has no polite form, so never sibh for one reader. Instructions take the imperative singular: “Brúigh Super+Tab chun gach fuinneog a fheiceáil.”

## Buttons and labels

- Buttons and menu items take the imperative singular, like Windows: “Sábháil”, “Oscail”, “Cealaigh”, “Pionnáil don tascbharra”. Power items that name a state are nouns: “Codladh”.
- Page names use agus, never &: “Teanga agus réigiún”.
- A noun after a verb on a button takes the article when English means “the”: “Taispeáin an pasfhocal”.
- A prefix before a capital stays lowercase with no hyphen: “i bhFuinneog”, “na hAipeanna”. Before a lowercase vowel, t- and n- take one: “an t-ainm”, “seacht n-aip”.

## Typography

- Quotation marks “…”, with ‘…’ inside them.
- The apostrophe is always ’, and Irish uses it often: “d’ordóg”, “b’fhéidir”.
- The dash is an en dash with spaces. The percent sign takes no space: “57%”.
- Keys use the names printed on Irish and British keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the unlabelled space bar is “Spás”.

## Names

- Settings, Disks and Install Luft are Socruithe, Dioscaí and Suiteáil Luft. Socruithe takes the article in sentences (“sna Socruithe”), and Disks is named with its kind so it doesn't mutate (“san aip Dioscaí”).
- Start is Tosaigh, as in Windows, and “an roghchlár Tosaigh” in sentences.
- Names never take mutations or the genitive: “ar Luft”, “fuinneog Tern”. When a sentence would mutate the name, put the kind of thing first: “san aip Rover”.

## Mutations

Variables never mutate, so build the sentence so the word before one doesn't trigger a mutation: “chuig”, not “go”, before a page name (“Ar ais chuig { $page }”), since go puts h before vowels. Where the mutation comes from a word that travels with the value, put that word into the value, as the fingers' `.inline` forms do: “do chorrmhéar dheas”, “d’ordóg chlé”.

## Plurals

Five forms: `one` (1), `two` (2), `few` (3–6), `many` (7–10) and `other` (0, 11 and up). Write all five. After digits Irish uses the singular noun with the mutation of the spoken number: lenition after 1–6, eclipsis after 7–10, none after 0, 20, 30 and 100. `other` takes the plain singular, right for round numbers and acceptable for 11–19:

```ftl
notifications-count = { $count ->
    [one] { $count } fhógra
    [two] { $count } fhógra
    [few] { $count } fhógra
    [many] { $count } bhfógra
   *[other] { $count } fógra
}
```

Nouns starting with a vowel don't change after 1–6 and take n- after 7–10: “{ $count } n-aip”. Nouns with a counting form keep it: “{ $count } bliana”, “{ $count } uaire”.

## Words

| English | Irish | Not | Why |
| --- | --- | --- | --- |
| app | aip | feidhmchlár | Windows and app stores; feidhmchlár is older and longer |
| board | clár | bord, canbhás | A board you lay things on; canbhás is the surface inside it |
| All windows | Gach fuinneog | Amharc tascanna | What Luft calls the task view |
| Quick settings | Socruithe tapa | Mearshocruithe | Clearer at a glance |
| notification center | ionad fógraí | lárionad fógraí | Shorter; Windows' ionad |
| snap | snapáil | greamaigh, ailínigh | Greamaigh is paste |
| tray | tráidire | limistéar fógraí | It holds apps |
| workspace | spás oibre | deasc | Deasc is the desktop |
| wallpaper | cúlbhrat | cúlra, páipéar balla | Cúlra is ambiguous next to colours |
| sign in | sínigh isteach | logáil isteach | Windows and Microsoft accounts |
| suspend, sleep | Codladh | Cuir ar fionraí | Windows' word |
| shut down | múch | dún | Windows' word; dún is close |
| Keyring | fáinne eochrach | eochairfháinne | GNOME's word |
| clipboard | gearrthaisce | gearrthaisceadán | Windows' word |
| firmware | dochtearraí | firmware | Microsoft's term |
| battery | ceallra | cadhnra | Windows' word |
| dark style | stíl dhorcha | mód dorcha | Matches the Stíl row in Settings |
| PIN | UAP, plural UAPanna | PIN | Irish Windows Hello |
| passphrase | frása faire | pasfhrása | Reads as Irish and declines |
| zoom | súmáil | zúmáil | Microsoft's spelling |
| take a screenshot | glac gabháil scáileáin | tóg | Microsoft's verb |
| speech (recognizer, model) | urlabhra | caint | téarma.ie: aithint urlabhra |
