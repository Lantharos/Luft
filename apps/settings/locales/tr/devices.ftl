## Displays

settings-display-mirror = Ekranları yansıt
settings-display-mirror-description = Her ekranda aynı görüntüyü gösterir
settings-display-mirrored = Yansıtılan ekranlar
settings-display-display = Ekran
settings-display-apply-failed = Bu ayarlar işe yaramadı. Farklı bir düzen deneyin.
settings-display-reset = Sıfırla
settings-display-apply = Uygula
settings-display-arrangement-main = { $name }, ana ekran
settings-display-use = Bu ekranı kullan
settings-display-main = Ana ekran
settings-display-main-description = Görev çubuğu ve yeni pencereler burada görünür
settings-display-resolution-title = Çözünürlük
settings-display-resolution = { $width } × { $height }
settings-display-refresh-rate-title = Yenileme hızı
settings-display-refresh-rate = { NUMBER($rate, maximumFractionDigits: 2) } Hz
settings-display-variable-refresh = Değişken yenileme hızı
settings-display-variable-refresh-description = Daha akıcı hareket için ekranın tam ekran oyunların kare hızını izlemesini sağlar
settings-display-variable-refresh-off = Kapalı
settings-display-variable-refresh-games = Oyunlarda
settings-display-variable-refresh-fullscreen = Tüm tam ekran uygulamalarda
settings-display-scale = Ölçek
settings-display-scale-description = Metni, uygulamaları ve diğer her şeyi büyütür ya da küçültür
settings-display-orientation = Yön
settings-display-orientation-landscape = Yatay
settings-display-orientation-portrait-right = Dikey, sağa
settings-display-orientation-portrait-left = Dikey, sola
settings-display-orientation-landscape-flipped = Yatay, ters

## Display brightness

settings-display-brightness = Parlaklık
settings-display-brightness-label = { $name } parlaklığı
settings-display-brightness-unsupported = Buradan değiştirmek için ekranın menüsünde DDC/CI’yı açın
settings-display-brightness-unresponsive = Şu anda yanıt vermiyor, birazdan yeniden denenecek
settings-display-brightness-external = Harici ekranlar
settings-display-brightness-missing-tool = Parlaklıklarını buradan değiştirmek için ddcutil’i yükleyin
settings-display-brightness-needs-restart = Parlaklık ayarlarının kurulumunu tamamlamak için yeniden başlatın
settings-display-brightness-no-access = Parlaklıklarını buradan değiştirmek için oturumu kapatıp yeniden açın

## Night light

settings-display-night-light = Gece ışığı
settings-display-night-light-description = Akşamları gözlerinizi daha az yoran, daha sıcak renkler
settings-display-night-light-schedule = Zamanlama
settings-display-night-light-automatic = Gün batımından gün doğumuna
settings-display-night-light-custom = Özel
settings-display-night-light-from = Açılma saati
settings-display-night-light-to = Kapanma saati
settings-display-night-light-warmth = Sıcaklık

## Sound

settings-sound-output = Çıkış
settings-sound-input = Giriş
settings-sound-device = Cihaz
settings-sound-output-device = Çıkış cihazı
settings-sound-input-device = Giriş cihazı
settings-sound-connection = Bağlantı
settings-sound-output-connection = Çıkış bağlantısı
settings-sound-input-connection = Giriş bağlantısı
settings-sound-volume = Ses düzeyi
settings-sound-mute = Sesi kapat: { $name }
settings-sound-unmute = Sesi aç: { $name }
settings-sound-balance = Denge
settings-sound-balance-center = Orta
settings-sound-balance-left = Sol { $share }
settings-sound-balance-right = Sağ { $share }
settings-sound-louder = Ses düzeyinin %100’ü aşmasına izin ver
settings-sound-louder-description = Yüksek ses düzeylerinde ses bozulabilir
settings-sound-input-level = Giriş düzeyi
settings-sound-apps = Uygulama ses düzeyleri
settings-sound-apps-playing = { $count ->
    [one] { $count } uygulama ses çalıyor
   *[other] { $count } uygulama ses çalıyor
}
settings-sound-app-output = { $app } uygulamasının çıkışı
settings-sound-profiles = Cihaz profilleri
settings-sound-profiles-row-description = Her ses cihazının nasıl kullanılacağını seçin
settings-sound-profiles-description = Her ses cihazının nasıl kullanılacağı, örneğin stereo ya da çevresel ses
settings-sound-profile-label = { $device } kullanım biçimi
settings-sound-profile-off = Kapalı

## System sounds

settings-sound-system = Sistem sesleri
settings-sound-system-description = Bildirimler, cihazlar ve diğer olaylar için sesler
settings-sound-system-volume = Sistem sesleri düzeyi
settings-sound-kind-notifications = Bildirimler
    .description = Rahatsız etmeyin açıkken, oyunlarda ve ekran paylaşımında sessizdir
    .preview = Bildirim sesini çal
settings-sound-kind-devices = Cihazlar ve şarj
    .description = Bir cihaz ya da şarj aleti takıldığında ve pil azaldığında
    .preview = Cihaz sesini çal
settings-sound-kind-volume = Ses düzeyi geri bildirimi
    .description = Ses düzeyini değiştirdiğinizde bir tık sesi
    .preview = Tık sesini çal
settings-sound-kind-screenshots = Ekran görüntüleri
    .description = Ekran görüntüsü kaydedildiğinde deklanşör sesi
    .preview = Deklanşör sesini çal
settings-sound-kind-recording = Kayıt
    .description = Ekran kaydı, kamera ya da dikte başlayıp durduğunda
    .preview = Kayıt sesini çal
settings-sound-kind-sign-in = Oturum açma sesi
    .description = Masaüstünüz göründüğünde
    .preview = Oturum açma sesini çal
settings-sound-kind-keyboard = Tuş sesleri
    .description = Ekran klavyesindeki her tuş için
    .preview = Tuş sesini çal

## Power and battery

settings-power-battery = Pil
settings-power-charging = Şarj oluyor
settings-power-charging-at = { $power } ile şarj oluyor
settings-power-charging-until-full = Şarj oluyor, { $time } içinde dolacak
settings-power-charging-at-until-full = { $power } ile şarj oluyor, { $time } içinde dolacak
settings-power-on-battery = Pil gücüyle çalışıyor
settings-power-on-battery-using = Pil gücüyle çalışıyor, tüketim { $power }
settings-power-time-left = Yaklaşık { $time } kaldı
settings-power-time-left-using = Yaklaşık { $time } kaldı, tüketim { $power }
settings-power-full = Tamamen dolu
settings-power-empty = Boş
settings-power-not-charging = Prize takılı, şarj olmuyor
settings-power-health = Pil sağlığı
settings-power-capacity = Şu an { $full }, yeniyken { $design }
settings-power-cycles = { $count ->
    [one] { $cycles } şarj döngüsü
   *[other] { $cycles } şarj döngüsü
}
settings-power-watt-hours = { NUMBER($value, maximumFractionDigits: 1) } Wh
settings-power-show-percentage = Yüzdeyi göster
settings-power-show-percentage-description = Pil düzeyini pil simgesinin içinde gösterir

## Durations, used inside other sentences and as picker options

settings-power-duration-under-minute = bir dakikadan az
settings-power-duration-minutes = { $minutes ->
    [one] { $minutes } dakika
   *[other] { $minutes } dakika
}
settings-power-duration-hours = { $hours ->
    [one] { $hours } saat
   *[other] { $hours } saat
}
settings-power-duration-hours-minutes = { $hours ->
    [one] { $hours } saat
   *[other] { $hours } saat
} { $minutes ->
    [one] { $minutes } dakika
   *[other] { $minutes } dakika
}
settings-power-never = Hiçbir zaman

## Charge limit

settings-power-limit = Şarjı sınırla
settings-power-limit-failed = Sınır değiştirilemedi. Yeniden deneyin.
settings-power-limit-elsewhere-off = Başka bir uygulama sınırı kapattı, bu yüzden pil tamamen şarj oluyor
settings-power-limit-elsewhere-changed = Başka bir uygulama sınırı { $level } olarak değiştirdi
settings-power-limit-elsewhere-on = Başka bir uygulama şarjı { $level } olunca durduruyor
settings-power-limit-automatic = Şarjın ne zaman duracağına bilgisayarınız karar verir
settings-power-limit-stops-at = Şarj { $level } olunca durur
settings-power-limit-description = Pilin ömrünü uzatmak için şarjı erken durdurur
settings-power-limit-description-at = Pilin ömrünü uzatmak için şarj { $level } olunca durur
settings-power-limit-applied = Şarj { $level } olunca duruyor
settings-power-limit-applied-description = Bu bilgisayardaki başka bir uygulama tarafından ayarlandı

## Battery-powered devices

settings-power-devices = Cihazlar
settings-power-device-mouse = Fare
settings-power-device-keyboard = Klavye
settings-power-device-headphones = Kulaklık
settings-power-device-speaker = Hoparlör
settings-power-device-controller = Oyun kumandası
settings-power-device-phone = Telefon
settings-power-device-tablet = Tablet
settings-power-device-pen = Kalem
settings-power-device-touchpad = Dokunmatik yüzey
settings-power-device-other = Cihaz

## Power mode

settings-power-mode = Güç modu
settings-power-mode-row = Mod
settings-power-profile-saver = Güç tasarrufu
    .description = Daha yavaş, daha az güç harcar
settings-power-profile-balanced = Dengeli
    .description = Standart performans ve güç kullanımı
settings-power-profile-performance = Performans
    .description = Daha hızlı, daha fazla güç harcar
settings-power-limited = Performans şu anda sınırlı
settings-power-limited-lap = Bilgisayar kucağınızda olduğu için performans sınırlı
settings-power-limited-hot = Bilgisayar çok ısındığı için performans sınırlı
settings-power-limited-lap-hot = Bilgisayar kucağınızda olduğu ve çok ısındığı için performans sınırlı
settings-power-saver-low-battery = Pil azken güç tasarrufu
settings-power-saver-low-battery-description = Pil azaldığında güç tasarrufuna geçer

## Keyboard backlight

settings-power-keyboard = Klavye
settings-power-backlight = Klavye aydınlatması
settings-power-backlight-off = Kapalı
settings-power-backlight-low = Düşük
settings-power-backlight-medium = Orta
settings-power-backlight-high = Yüksek

## Screen and sleep

settings-power-screen = Ekran
settings-power-screen-off = Ekranın kapanma süresi
settings-power-screen-off-description = Bilgisayarı bir süre kullanmadığınızda
settings-power-dim = Kullanılmadığında karart
settings-power-dim-description = Ekran kapanmadan kısa süre önce parlaklığı düşürür
settings-power-sleep = Uyku
settings-power-suspend-plugged-in = Prize takılıyken uyku
settings-power-suspend-inactive = Kullanılmadığında uyku
settings-power-suspend-description = Bir süre kullanılmayan bilgisayarı uyku moduna alır
settings-power-suspend-battery = Pil gücündeyken uyku
settings-power-button = Güç düğmesi
settings-power-button-suspend = Uyku
settings-power-button-hibernate = Hazırda beklet
settings-power-button-ask = Ne yapılacağını sor
settings-power-button-nothing = Hiçbir şey yapma
settings-power-long-sleep = Uzun bir uykudan sonra kapat
settings-power-long-sleep-description = Uykudayken pilin bitmesine izin vermek yerine, pil azaldığında ya da pil gücündeyken uzun süre uykuda kaldığında bilgisayar kapanır. Açık pencereler korunmaz.
settings-power-long-sleep-failed = Bu ayar değiştirilemedi. Yeniden deneyin.
settings-power-long-sleep-after = Kapanma süresi
settings-power-long-sleep-hours = { $hours ->
    [one] { $hours } saat
   *[other] { $hours } saat
}
settings-power-long-sleep-days = { $days ->
    [one] { $days } gün
   *[other] { $days } gün
}
settings-power-long-sleep-weeks = { $weeks ->
    [one] { $weeks } hafta
   *[other] { $weeks } hafta
}

## Keyboard

settings-keyboard-sources = Giriş kaynakları
settings-keyboard-sources-description = Varsayılan olarak ilki kullanılır. Yazarken aralarında geçiş yapabilirsiniz.
settings-keyboard-source-edit = Keys uygulamasında düzenle
settings-keyboard-source-up = Yukarı taşı
settings-keyboard-source-down = Aşağı taşı
settings-keyboard-source-remove = Kaldır
settings-keyboard-add-source-button = Giriş kaynağı ekle
settings-keyboard-own = Kendi düzenleriniz ve giriş yöntemleriniz
settings-keyboard-own-layout = Düzen oluştur
settings-keyboard-own-layout-description = Bir düzenden başlayıp tuşlarının ne yazdığını değiştirin
settings-keyboard-own-method = Giriş yöntemi oluştur
settings-keyboard-own-method-description = Yazdıklarınızı aksanlı harflere, başka yazı sistemlerine ya da seçilebilecek sözcüklere dönüştürün
settings-keyboard-own-open = Keys uygulamasını aç
settings-keyboard-own-open-description = Oluşturduğunuz düzenleri ve giriş yöntemlerini düzenleyin
settings-keyboard-switch-source = Giriş kaynağını değiştir
settings-keyboard-add-source = Giriş kaynağı ekle
settings-keyboard-add-source-description = Yazmak için kullanmak istediğiniz klavye düzenini ya da giriş yöntemini seçin.
settings-keyboard-add-source-search = Dil, düzen ve giriş yöntemi ara
settings-keyboard-input-method = Giriş yöntemi
settings-keyboard-add-source-no-match = “{ $query }” ile eşleşen bir şey yok
settings-keyboard-cancel = İptal
settings-keyboard-add = Ekle
settings-keyboard-typing = Yazma
settings-keyboard-repeat = Tuş tekrarı
settings-keyboard-repeat-description = Basılı tutulan tuş tekrar tekrar yazılır
settings-keyboard-repeat-delay = Tekrar gecikmesi
settings-keyboard-repeat-delay-shorter = Daha kısa
settings-keyboard-repeat-delay-longer = Daha uzun
settings-keyboard-repeat-speed = Tekrar hızı
settings-keyboard-repeat-speed-slower = Daha yavaş
settings-keyboard-repeat-speed-faster = Daha hızlı
settings-keyboard-caps-lock = Caps Lock tuşu
settings-keyboard-caps-lock-description = Bastığınızda ne olacağı
settings-keyboard-caps-lock-escape = Esc
settings-keyboard-caps-lock-swap-escape = Esc ile yer değiştir
settings-keyboard-caps-lock-nothing = Hiçbir şey
settings-keyboard-caps-lock-custom = Özel
settings-keyboard-lock-notices = Caps Lock ve Num Lock durumunu göster
settings-keyboard-lock-notices-description = Biri açılıp kapandığında ekranda kısa süre gösterir
settings-keyboard-dictation-on = Açık
settings-keyboard-dictation-off = Kapalı
settings-keyboard-shortcuts-description = Kısayolları görün ve değiştirin ya da kendi kısayollarınızı ekleyin

## Copilot key

settings-keyboard-copilot = Copilot tuşu
settings-keyboard-copilot-press = Kısa basış
settings-keyboard-copilot-press-description = Tuşa kısa basıldığında ne olacağı
settings-keyboard-copilot-open-start = Başlat menüsünü aç
settings-keyboard-copilot-open-app = Bir uygulama aç
settings-keyboard-copilot-nothing = Hiçbir şey
settings-keyboard-copilot-app = Uygulama
settings-keyboard-copilot-no-app = Henüz uygulama seçilmedi
settings-keyboard-copilot-change = Değiştir
settings-keyboard-copilot-choose = Seç
settings-keyboard-copilot-hold = Basılı tutarak dikte
settings-keyboard-copilot-hold-description = Söylediklerinizi yazmak için tuşu basılı tutup konuşun
settings-keyboard-copilot-hold-off = Dikte açıldığında çalışır
settings-keyboard-copilot-choose-app = Bir uygulama seçin
settings-keyboard-copilot-choose-app-description = Copilot tuşuna basıldığında bu uygulama açılır.

## Key names on shortcut labels, as printed on keyboards. Keep them short.

settings-keys-super = Super
settings-keys-ctrl = Ctrl
settings-keys-alt = Alt
settings-keys-shift = Shift
settings-keys-meta = Meta
settings-keys-hyper = Hyper
settings-keys-print-screen = Print Screen
settings-keys-page-up = Page Up
settings-keys-page-down = Page Down
settings-keys-home = Home
settings-keys-end = End
settings-keys-insert = Insert
settings-keys-delete = Delete
settings-keys-tab = Tab
settings-keys-space = Boşluk
settings-keys-enter = Enter
settings-keys-backspace = Backspace
settings-keys-escape = Esc
settings-keys-pause = Pause
settings-keys-scroll-lock = Scroll Lock
settings-keys-caps-lock = Caps Lock
settings-keys-menu = Menü
settings-keys-keypad = Tuş takımı { $key }
settings-keys-volume-up = Sesi yükselt
settings-keys-volume-down = Sesi alçalt
settings-keys-mute = Sesi kapat
settings-keys-microphone-mute = Mikrofonu kapat
settings-keys-play = Oynat
settings-keys-media-pause = Duraklat
settings-keys-stop = Durdur
settings-keys-next-track = Sonraki parça
settings-keys-previous-track = Önceki parça
settings-keys-brightness-up = Parlaklığı artır
settings-keys-brightness-down = Parlaklığı azalt
settings-keys-browser = Tarayıcı
settings-keys-home-page = Ana sayfa
settings-keys-search = Ara
settings-keys-mail = E-posta
settings-keys-calculator = Hesap makinesi
settings-keys-files = Dosyalar
settings-keys-eject = Çıkar
settings-keys-power = Güç
settings-keys-lock = Kilitle

## Keyboard shortcuts

settings-shortcuts-title = Klavye kısayolları
settings-shortcuts-search = Kısayollarda ara
settings-shortcuts-category-system = Sistem
settings-shortcuts-category-windows = Pencereler
settings-shortcuts-category-workspaces = Çalışma alanları
settings-shortcuts-category-screenshots = Ekran görüntüleri
settings-shortcuts-category-media = Medya
settings-shortcuts-reset = Varsayılana sıfırla
settings-shortcuts-apps = Uygulama kısayolları
settings-shortcuts-apps-description = Uygulamaların istediği, uygulama önde değilken de çalışan kısayollar
settings-shortcuts-no-match = “{ $query }” ile eşleşen kısayol yok
settings-shortcuts-change = Kısayolu değiştir: { $name }
settings-shortcuts-or = ya da
settings-shortcuts-not-set = Ayarlanmadı
settings-shortcuts-press-keys = İstediğiniz tuşlara basın
settings-shortcuts-needs-modifier = Kısayolun yazmanızı engellememesi için Ctrl, Alt ya da Super ekleyin.
settings-shortcuts-record-description = Yeni kısayola basın. Backspace kısayolu kapatır, Esc iptal eder.
settings-shortcuts-record-taken = Bu kısayol zaten “{ $name }” için kullanılıyor. Değiştirirseniz orada kapatılır.
settings-shortcuts-try-another = Başka birini dene
settings-shortcuts-replace = Değiştir
settings-shortcuts-cancel = İptal
settings-shortcuts-custom = Özel kısayollar
settings-shortcuts-custom-description = Bir tuş birleşimiyle komut çalıştırın ya da uygulama açın
settings-shortcuts-untitled = Adsız
settings-shortcuts-add = Kısayol ekle
settings-shortcuts-edit = Kısayolu düzenle
settings-shortcuts-custom-name = Ad
settings-shortcuts-custom-command = Komut
settings-shortcuts-custom-shortcut = Kısayol
settings-shortcuts-custom-taken = Zaten “{ $name }” için kullanılıyor. Kaydederseniz orada kapatılır.
settings-shortcuts-remove = Kaldır
settings-shortcuts-save = Kaydet
settings-shortcuts-add-button = Ekle

## Dictation

settings-dictation-title = Dikte
settings-dictation-description = Herhangi bir uygulamada söylediklerinizi yazmak için şunu basılı tutup konuşun: { $keys }. Bitirmek için bırakın, iptal etmek için Esc tuşuna basın. Her şey bu bilgisayarda gerçekleşir: sesiniz bilgisayardan çıkmaz ve kaydedilmez.
settings-dictation-description-no-shortcut = Dikte için aşağıdan bir kısayol seçin. Her şey bu bilgisayarda gerçekleşir: sesiniz bilgisayardan çıkmaz ve kaydedilmez.
settings-dictation-not-installed = Dikte bu bilgisayarda yüklü değil
settings-dictation-hold = Dikte için basılı tutun: { $keys }
settings-dictation-needs-shortcut = Bir kısayol atanana kadar kapalı
settings-dictation-copilot-key = Copilot tuşu
settings-dictation-shortcut = Kısayol
settings-dictation-shortcut-description = Konuşmak için basılı tutun ya da basın; yeniden basana ya da konuşmayı bırakana kadar dinler
settings-dictation-shortcut-own = Kendi kısayolum
settings-dictation-shortcut-another = Başka bir kısayol…
settings-dictation-shortcut-off = Kapalı
settings-dictation-keys = Tuşlar
settings-dictation-change = Değiştir
settings-dictation-language = Dil
settings-dictation-language-automatic = Otomatik
settings-dictation-language-automatic-current = Otomatik ({ $language })
settings-dictation-language-description = Otomatik, yazarken kullandığınız klavye düzenini izler
settings-dictation-language-unavailable = { $language } bu bilgisayarda kullanılamıyor
settings-dictation-engine = Konuşma tanıyıcı
settings-dictation-engine-automatic = Otomatik
settings-dictation-engine-description = { $language } için { $engine } kullanılır
settings-dictation-engine-graphics-card = { $language } için ekran kartında { $engine } kullanılır
settings-dictation-models = Konuşma modelleri
settings-dictation-models-description = Modeller bir kez indirilir ve bu bilgisayarda saklanır.
settings-dictation-credits = Emeği geçenler
settings-dictation-credit = { $credit }. Lisans: { $licence }.
settings-dictation-learn-more = Daha fazla bilgi

## Dictation models. Sizes are already formatted, such as "600 MB".

settings-dictation-model-failed = İndirilemedi: { $reason }
settings-dictation-model-downloading = { $received } / { $total }
settings-dictation-model-installed = Bu bilgisayarda { $size }
settings-dictation-model-partial = { $received } / { $total } indirildi
settings-dictation-model-size = İndirme boyutu: { $size }
settings-dictation-model-retry = Yeniden dene
settings-dictation-model-cancel = İptal
settings-dictation-model-resume = Sürdür
settings-dictation-model-download = İndir
settings-dictation-model-remove = Kaldır

## Mouse and touchpad

settings-mouse-mouse = Fare
settings-mouse-primary-button = Birincil düğme
settings-mouse-primary-button-description = Öğeleri seçmek için tıkladığınız düğme
settings-mouse-primary-button-left = Sol
settings-mouse-primary-button-right = Sağ
settings-mouse-speed = İşaretçi hızı
settings-mouse-slower = Daha yavaş
settings-mouse-faster = Daha hızlı
settings-mouse-acceleration = Fare ivmesi
settings-mouse-acceleration-description = Fareyi hızlı hareket ettirdiğinizde işaretçi daha uzağa gider
settings-mouse-natural-scrolling = Doğal kaydırma
settings-mouse-natural-scrolling-description = Kaydırma, görünümü değil içeriği hareket ettirir
settings-mouse-touchpad = Dokunmatik yüzey
settings-mouse-touchpad-speed = Dokunmatik yüzey işaretçi hızı
settings-mouse-touchpad-scroll-speed = Kaydırma hızı
settings-mouse-touchpad-scroll-speed-label = Dokunmatik yüzey kaydırma hızı
settings-mouse-touchpad-tap = Dokunarak tıklama
settings-mouse-touchpad-tap-description = Dokunmatik yüzeye bastırmak yerine dokunun
settings-mouse-touchpad-natural-scrolling = Dokunmatik yüzeyde doğal kaydırma
settings-mouse-touchpad-natural-scrolling-description = İçerik parmaklarınızla aynı yönde hareket eder
settings-mouse-touchpad-scroll-with = Kaydırma yöntemi
settings-mouse-touchpad-two-fingers = İki parmak
settings-mouse-touchpad-scroll-edge = Kenar
settings-mouse-touchpad-secondary-click = İkincil tıklama
settings-mouse-touchpad-secondary-click-description = Ayrı bir düğme olmadan sağ tıklama yöntemi
settings-mouse-touchpad-click-corner = Köşe
settings-mouse-touchpad-disable-typing = Yazarken devre dışı bırak
settings-mouse-touchpad-disable-typing-description = Yazarken işaretçi sıçramasın diye
