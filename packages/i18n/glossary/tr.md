# Turkish

What is particular to Turkish, on top of [the rules every language shares](common.md). The agreed terms are in [tr.tbx](tr.tbx).

## Address

Prefer sentences without a person: “Güncellemeler bir sonraki yeniden başlatmada yüklenir”, “Bildirim yok”. When the reader has to be addressed, use siz verb forms without the pronoun, as Windows, macOS, GNOME and KDE do: “Bunu daha sonra Ayarlar’dan değiştirebilirsiniz.” Never sen. Instructions take the polite imperative: “Tüm pencereleri görmek için Super+Tab tuşlarına basın.”

## Buttons and labels

- Buttons and menu items take the plain imperative: “Kaydet”, “Aç”, “Yeniden başlat”, “Görev çubuğuna sabitle”. The button is a command the reader gives, so it sits fine next to siz. A few fixed buttons aren't verbs: “İptal”, “İleri”, “Bitti”, “Tamam”.
- Switch states are “Açık” and “Kapalı”. Results take the passive past: “Kaydedildi”, “Parmak izi eklendi.”
- Başlat is a name and keeps its capital. A label named in a sentence keeps its capital and needs no quotation marks: “Rahatsız etmeyin özelliğini açın”.
- Mind the dotted and dotless i when changing case: i ↔ İ, ı ↔ I. “İptal”, never “Iptal”.

## Typography

- Quotation marks “…”, with ‘…’ inside them.
- The apostrophe ’ goes before suffixes on names, numbers and abbreviations: “Luft’u”, “USB’ye”.
- The dash is an en dash with spaces. No em dashes.
- The percent sign comes before the number, with no space: “%57”. Units follow with a space: “4,5 W”.
- Keys use the English names printed on Turkish keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. Only the space bar is translated: Boşluk.
- Write “e-posta” and “çevrimiçi”.

## Names

- Settings, Disks and Install Luft are Ayarlar, Diskler and Luft’u yükle.
- Start is Başlat, as in Windows; when it needs a suffix, write “Başlat menüsünde”.
- Suffixes follow pronunciation and vowel harmony, after an apostrophe: “Luft’ta”, “Kestrel’de”, “Ayarlar’dan”. The apps' names have no settled pronunciation, so inflect a noun next to them: “Rover uygulamasında”.
- Never attach a suffix to a variable such as `{ $name }`, since harmony depends on the value. Use a colon (“Açıldı: { $name }”) or a following noun: “{ $app } uygulamasında”, “{ $name } adlı dosya”.

## Plurals

Two forms, `one` and `other`. Nouns stay singular after a number, so both often read the same; keep both anyway.

```ftl
notifications-count = { $count ->
    [one] { $count } bildirim
   *[other] { $count } bildirim
}
```

## Words

| English | Turkish | Not | Why |
| --- | --- | --- | --- |
| board | tahta | pano, tuval | Pano is the clipboard; tuval is the canvas inside it |
| All windows | Tüm pencereler | Görev görünümü | What Luft calls the task view |
| snap, snap layout | yasla, yaslama düzeni | sabitle, tuttur | Windows' verb; sabitle is pin |
| tray | sistem tepsisi | bildirim alanı | Best known; it holds apps |
| workspace | çalışma alanı | masaüstü | GNOME's word; masaüstü is the desktop |
| wallpaper | duvar kâğıdı | arka plan | Arka plan is ambiguous next to colours |
| suspend, sleep | Uyku | Askıya al | Windows' word |
| Dictation | Dikte | Sesle yazma | macOS' word, and short |
| passkey | geçiş anahtarı | passkey | Apple and Google |
| Keyring | Anahtarlık | Anahtar zinciri | GNOME's word, and short |
| clipboard | pano | kopyalama arabelleği | Windows and GNOME |
| sandbox | korumalı alan | sanal alan | Windows' word |
| security chip | güvenlik çipi | TPM yongası | Luft avoids the abbreviation; çip is the everyday word |
| firmware | üretici yazılımı | donanım yazılımı | Windows' word |
| password | parola | şifre | Windows, macOS and GNOME; şifre is easily confused with şifreleme |
| passphrase | disk parolası | parola | Apart from the account password |
| light style, dark style | açık mod, koyu mod | açık stil | Matches the Koyu mod tile |
| home folder | ev klasörü; Ev in paths | giriş klasörü | GNOME's word |
| Wallpapers folder | Wallpapers klasörü | Duvar kâğıtları | Keeps its English name on disk |
| metered connection | tarifeli bağlantı | ölçülü bağlantı | Windows' word |
| input source | giriş kaynağı | giriş yöntemi | GNOME's word; giriş yöntemi is input method |
| keyboard backlight | klavye aydınlatması | klavye arka ışığı | One name for the tile and Settings |
| dwell click | bekleterek tıklama | bekleyerek tıklama | The pointer is the one that waits |
| touchpad | dokunmatik yüzey | touchpad | Windows' word |
| battery | pil | batarya | Windows' word |
| trash | Çöp kutusu | Geri Dönüşüm Kutusu | Plain and short |
| forget | unut | kaldır | Windows' word for saved networks |
