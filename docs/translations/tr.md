# Turkish style guide

How Luft speaks Turkish. The [glossary](../../packages/i18n/glossary/tr.csv) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Prefer sentences without a person at all: “Güncellemeler bir sonraki yeniden başlatmada yüklenir”, “Bildirim yok”.
- When the reader has to be addressed, use **siz** forms, as Windows, macOS, GNOME and KDE all do in Turkish: “Bunu daha sonra Ayarlar’dan değiştirebilirsiniz.” Leave out the pronoun siz; the verb ending already says who is meant. Never switch to sen.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as “Lütfen” at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the polite imperative ending in -in/-ın/-un/-ün: “Tüm pencereleri görmek için Super+Tab tuşlarına basın.” “Yeniden deneyin.”

## Buttons, menus and labels

- Buttons and menu items use the **plain imperative**, the usual form for commands in Turkish software: “Kaydet”, “Aç”, “Yeniden başlat”, “Görev çubuğuna sabitle”. This doesn't contradict addressing the reader with siz: the button is a command the reader gives.
- A few fixed buttons are not verbs: “İptal”, “İleri”, “Bitti”, “Tamam”.
- Switches and settings are nouns or short phrases: “Gece ışığı”, “Saniyeleri göster”. Their states are “Açık” and “Kapalı”.
- Headings and page names are nouns: “Bildirimler”, “Gizlilik”.
- States shown after an action use the passive past: “Kaydedildi”, “Kopyalandı”, “Parmak izi eklendi.”
- Keep labels short. If a label clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Hızlı ayarlar”, “Oturum açma ekranı”, not “Hızlı Ayarlar”. In running text, Luft's parts are ordinary nouns: “görev çubuğu”, “kilit ekranı”. Start (Başlat) is a name and keeps its capital. A label referred to in a sentence keeps its capital letter and needs no quotation marks: “Rahatsız etmeyin özelliğini açın”.

Mind the dotted and dotless i when changing case: i ↔ İ, ı ↔ I. “İptal”, “İleri”, never “Iptal”.

## Typography

- Quotation marks: “…”, and ‘…’ inside them.
- Apostrophe: ’, the typographic one, before suffixes on names, numbers and abbreviations: “Luft’u”, “USB’ye”.
- Ellipsis: one character, “…”, with no space before it: “Yükleniyor…”.
- Dash: the en dash with spaces, “ – ”. No em dashes.
- No space before punctuation.
- The percent sign comes before the number, with no space: “%57”. Units follow the number with a space: “4,5 W”, “120 GB”.
- Key names follow what Turkish keyboards print, which is English: Ctrl, Alt, Shift, Enter, Esc, Tab, Backspace, Delete, Home, End, Page Up, Page Down, Print Screen. Only the space bar is translated: Boşluk.
- Write “e-posta” and “çevrimiçi”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Ayarlar, Diskler, Luft’u yükle.
- Start is translated, as in Windows: Başlat. When it needs a suffix, say “Başlat menüsü”: “Başlat menüsünde”, “Başlat menüsüne sabitle”.
- Suffixes follow pronunciation and vowel harmony, after an apostrophe: “Luft’ta”, “Luft’u”, “Kestrel’de”, “Ayarlar’dan”. For the apps, whose pronunciation in Turkish isn't settled, put the kind of thing next to the name and inflect that: “Rover uygulamasında”, “Tern uygulamasını”.
- Never attach a suffix to a placeable such as `{ $name }` or `{ $app }`: vowel harmony and the consonant depend on the value, which the translation can't know. Use a colon (“Açıldı: { $name }”) or let a following noun take the suffix: “{ $app } uygulamasında”, “{ $page } sayfasına dön”, “{ $name } adlı dosya”.

## Plurals

Turkish has two forms, `one` (1) and `other` (everything else, including 0). Nouns stay singular after a number, so both variants often read the same. Keep both anyway, and always keep `{ $count }` in both and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } bildirim
   *[other] { $count } bildirim
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Bildirim yok`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it so it needs no suffix: “Son denetim: { $date }”.

## Decisions

| English | Turkish | Instead of | Why |
| --- | --- | --- | --- |
| you | siz forms, or no person | sen | Windows, macOS, GNOME and KDE |
| buttons | plain imperative: Kaydet | Kaydedin, Kaydetme | Every Turkish desktop does this |
| Start | Başlat | Start | Windows' name for the menu |
| board | tahta | pano, tuval | Pano is the clipboard; tuval is the canvas inside it |
| All windows | Tüm pencereler | Görev görünümü | That's what Luft calls the task view |
| snap, snap layout | yasla, yaslama düzeni | sabitle, tuttur | Windows' verb; sabitle is pin |
| tray | sistem tepsisi | bildirim alanı | Best known; it holds apps, not notifications |
| workspace | çalışma alanı, also in the task view: Çalışma alanı 2 | masaüstü | GNOME's word; masaüstü is the desktop |
| wallpaper | duvar kâğıdı | arka plan | Arka plan is ambiguous next to colors |
| suspend, sleep | Uyku | Askıya al | Windows' word |
| Dictation | Dikte | Sesle yazma | macOS' word, and short |
| passkey | geçiş anahtarı | passkey | Apple and Google in Turkish |
| Keyring | Anahtarlık | Anahtar zinciri | GNOME's word, and short |
| clipboard | pano | kopyalama arabelleği | Windows and GNOME |
| sandbox | korumalı alan | sanal alan | Windows' word |
| security chip | güvenlik çipi | TPM yongası | Luft avoids the abbreviation in the interface; çip is the everyday word |
| firmware | üretici yazılımı | donanım yazılımı | Windows' word |
| password | parola | şifre | Windows, macOS and GNOME; şifre is easy to confuse with şifreleme |
| passphrase | disk parolası | parola | Keeps the disk's passphrase apart from the account password, in Settings and setup alike |
| light style, dark style | açık mod, koyu mod | açık stil, koyu stil | Matches the Koyu mod tile |
| home folder | ev klasörü, Ev in paths | giriş klasörü | GNOME's word |
| Wallpapers folder | Wallpapers klasörü, Resimler › Wallpapers | Duvar kâğıtları | The folder keeps its English name on disk |
| metered connection | tarifeli bağlantı | ölçülü bağlantı | Windows' word |
| input source | giriş kaynağı | giriş yöntemi | GNOME's word; input method is giriş yöntemi |
| keyboard backlight | klavye aydınlatması | klavye arka ışığı | One name for the tile and Settings |
| dwell click | bekleterek tıklama | bekleyerek tıklama | The pointer is the one that waits |
| touchpad | dokunmatik yüzey | touchpad | Windows' word |
| battery | pil | batarya | Windows' word |
| trash | Çöp kutusu | Geri Dönüşüm Kutusu | Plain and short |
| forget | unut | kaldır | Windows' word for saved networks |
