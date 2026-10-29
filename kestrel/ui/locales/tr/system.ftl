## Shared

system-cancel = İptal

## Dictation notifications

dictation-setup-title = Konuşarak yazın
dictation-setup-body = Söylediklerinizi her uygulamada yazıya dökün. Dikte bu bilgisayarda çalıştığı için önce konuşma modelinin yüklenmesi gerekir.
dictation-setup-action = Dikteyi kur
dictation-unsupported-title = { $language } dilinde dikte bu bilgisayarda kullanılamıyor
dictation-unsupported-body = Bu bilgisayarın işlemcisi, { $language } dili için gereken konuşma tanıyıcıyı çalıştıramıyor. Başka bir dilde dikte edebilirsiniz.
dictation-settings-action = Dikte ayarları

## System health notifications

health-gpu-reset-title = Grafik sürücüsü yanıt vermeyi durdurdu
health-gpu-reset-body = { $day ->
    [today] Bilgisayarınız kendiliğinden yeniden başladı: bugün, { $time }. Bunun yeniden olmasını neyin önleyebileceğini Ayarlar’da görebilirsiniz.
   *[other] Bilgisayarınız kendiliğinden yeniden başladı: { $date }, { $time }. Bunun yeniden olmasını neyin önleyebileceğini Ayarlar’da görebilirsiniz.
}
health-gpu-reset-details = Ayrıntılar

oom-app-closed-title = Bellek boşaltmak için { $app } uygulaması kapatıldı
oom-container-closed-title = Bellek boşaltmak için bir kapsayıcı kapatıldı
oom-closed-body = Bilgisayarın belleği azalıyordu, bu yüzden diğer her şeyin akıcı çalışması için kapatıldı.
oom-closed-body-with-size = Bilgisayarın belleği azalıyordu, bu yüzden diğer her şeyin akıcı çalışması için kapatıldı. Kullandığı bellek: { $size }.
memory-low-title = Luft’un belleği azalıyor
memory-low-app-body = { $app } uygulaması { $size } kullanıyor. Diğer her şeyin akıcı çalışması için uygulamayı zorla kapatın.
memory-low-container-body = Bir kapsayıcı { $size } kullanıyor. Diğer her şeyin akıcı çalışması için kapsayıcıyı zorla kapatın.
memory-low-force-quit = Zorla kapat

## Input source indicator

input-source-indicator = Giriş kaynağı: { $source }

## Hardware keys

media-keys-airplane-mode-hardware = Uçak modu donanımdan açık
media-keys-airplane-mode-on = Uçak modu açık
media-keys-airplane-mode-off = Uçak modu kapalı
media-keys-bluetooth-on = Bluetooth açık
media-keys-bluetooth-off = Bluetooth kapalı
media-keys-caps-lock-on = Caps Lock açık
media-keys-caps-lock-off = Caps Lock kapalı
media-keys-num-lock-on = Num Lock açık
media-keys-num-lock-off = Num Lock kapalı

## VPN sign-in

vpn-sign-in-title = Oturum aç: { $connection }
vpn-connect = Bağlan
vpn-signing-in = Oturum açılıyor…
vpn-finish-in-browser = Oturum açma işlemini tarayıcınızda tamamlayın.
vpn-certificate-untrusted = { $host } doğrulanamayan bir sertifika sundu ({ $reason }). Parmak izi: { $fingerprint }.
vpn-certificate-warning = Başka biri bu sunucuymuş gibi davranıyor olabilir. Yalnızca bunu bekliyorsanız bağlanın.
vpn-certificate-connect = Yine de bağlan

vpn-field-password = Parola
vpn-field-certificate-password = Sertifika parolası
vpn-field-proxy-password = Ara sunucu parolası
vpn-field-pre-shared-key = Önceden paylaşılan anahtar
vpn-field-group-password = Grup parolası

## Battery notifications

battery-left = { $percent } kaldı.
battery-left-with-time = { $percent } kaldı, yaklaşık { $duration }.
battery-low-title = Pil zayıf
battery-very-low-title = Pil çok zayıf
battery-almost-empty-title = Pil bitmek üzere
battery-ups-low-title = UPS pili zayıf
battery-ups-very-low-title = UPS pili çok zayıf
battery-ups-almost-empty-title = UPS pili bitmek üzere
battery-very-low-body = { $left } Yakında prize takın.
battery-almost-empty-body = { $left } Kaydedilmemiş çalışmalarınızı kaybetmemek için şimdi prize takın.

battery-device-low-title = { $device }: pil zayıf
battery-device-very-low-title = { $device }: pil çok zayıf
battery-device-low-body = { $left } Yakında şarj edin.
battery-device-very-low-body = { $left } Kapanmaması için şimdi şarj edin.

battery-device-mouse = Fare
battery-device-keyboard = Klavye
battery-device-phone = Telefon
battery-device-tablet = Tablet
battery-device-controller = Oyun kumandası
battery-device-pen = Kalem
battery-device-touchpad = Dokunmatik yüzey
battery-device-headset = Mikrofonlu kulaklık
battery-device-speaker = Hoparlör
battery-device-headphones = Kulaklık
battery-device-remote = Uzaktan kumanda
battery-device-other = Bağlı cihaz

## Privacy indicator

privacy-indicator = Kullanımda: { $things }
privacy-thing-camera = kamera
privacy-thing-microphone = mikrofon
privacy-thing-screen = ekran
privacy-thing-location = konum
privacy-thing-windows = pencereler

privacy-camera-unknown-app = Bir uygulama kamerayı kullanıyor
privacy-stop-sharing = Ekran paylaşımını durdur
privacy-stop-recording = Kaydı durdur
privacy-turn-off-location = Konum hizmetlerini kapat
privacy-settings = Gizlilik ayarları
privacy-camera = Kamera
privacy-microphone = Mikrofon
privacy-microphone-muted = Mikrofon kapalı
privacy-mute-microphone = Mikrofonu kapat
privacy-unmute-microphone = Mikrofonu aç
privacy-close-app = Kapat: { $app }
privacy-unknown-app = Bir uygulama
privacy-reported-app = “{ $name }” (ad doğrulanmadı)
privacy-windows-seeing-programs = { $count } program pencerelerinizi görebilir
privacy-windows-using-programs = { $count } program pencerelerinizi görebilir ve kullanabilir
privacy-windows-stop = Erişimi durdur

## Window access prompt

peek-see-request = Başlattığınız bir programın pencerelerinizi görmesine izin verilsin mi?
peek-see-description = Açık olan her pencerenin görüntüsünü alabilecek.
peek-use-request = Başlattığınız bir programın pencerelerinizi görmesine ve kullanmasına izin verilsin mi?
peek-use-description = Açık olan her pencereyi görebilecek ve sizmiş gibi tıklayıp yazabilecek.
peek-deny = İzin verme
peek-allow-once = Bir kez izin ver
peek-allow-until-quit = Kapanana kadar izin ver

## Window access errors

peek-error-declined-until-quit = Bu bilgisayarı kullanan kişi bunu reddetti. Program kapandıktan sonra yeniden sorabilir.
peek-error-not-allowed = Bu bilgisayarı kullanan kişi buna izin vermedi
peek-error-sandboxed = Korumalı alandaki uygulamalar başka pencereleri göremez ve kullanamaz
peek-error-unknown-caller = İsteyen program sona erdi ya da tanınamadı
peek-error-no-caller = Oturum veri yolu hangi programın istediğini bildirmedi
peek-error-screen-busy = Ekran kilitli ya da üzerinde bir sistem istemi açık. İstem kapandığında yeniden deneyin.
peek-error-input-held = Biri tuşları ya da fare düğmelerini basılı tutuyor. Biraz sonra yeniden deneyin.
peek-error-input-dropped = Giriş durduruldu, çünkü ulaştığında o noktanın altında başka bir şey vardı ya da klavye başka bir şeydeydi
peek-error-not-in-front = Pencere öne getirilemedi
peek-error-covered = Pencerenin o bölümünü başka bir şey kapatıyor
peek-error-outside = { $x }, { $y } noktası pencerenin görüntüsünün dışında. Görüntü boyutu: { $width } × { $height }
peek-error-nothing-to-capture = Pencere yakalanacak bir şey göstermiyor
peek-error-window-picture-late = Pencerenin görüntüsü zamanında hazır olmadı
peek-error-screen-picture-late = Ekranın görüntüsü zamanında hazır olmadı
peek-error-no-window-id = Kimliği { $id } olan bir pencere yok. Açık olanları peek list gösterir.
peek-error-no-window-for-handle = { $handle } olarak başlatılan programın açık penceresi yok
peek-error-ended-before-window = Program bir pencere açmadan sona erdi
peek-error-no-window-in-time = Süre içinde hiçbir pencere açılmadı: { $duration }
peek-error-launch-not-started-by-peek = Yalnızca peek run tarafından başlatılmış bir program açılabilir
peek-error-ended-while-starting = Program başlarken sona erdi
peek-error-launch-failed = systemd şunu başlatamadı: { $program }
peek-error-unknown-handle = peek run ile başlattığınız hiçbir şeyin tanıtıcısı { $handle } değil ya da o program kapandı
peek-error-unknown-key = { $key }, peek’in tanıdığı bir tuş değil
peek-error-unknown-modifier = { $modifier } bir değiştirici tuş değil. ctrl, shift, alt ya da super kullanın.
peek-error-display-owner = Bu ekran başka bir programa ait
peek-error-display-run = Gizli bir ekrandaki programlar peek run ile başlatılır
peek-error-display-handle = Bu ekran { $requested } olarak değil, { $handle } olarak başlatıldı

## Quick settings tiles

auto-rotate-title = Otomatik döndür
dark-style-title = Koyu mod
do-not-disturb-title = Rahatsız etmeyin
night-light-title = Gece ışığı
airplane-mode-title = Uçak modu

## Power mode

power-profile-title = Güç modu
power-profile-header = Güç modu
power-profile-open-menu = Güç modu menüsünü aç
power-profile-settings = Güç ayarları
power-profile-performance = Performans
power-profile-balanced = Dengeli
power-profile-power-saver = Güç tasarrufu
power-profile-custom = Özel

## Keep awake

caffeine-title = Uyanık tut
caffeine-open-menu = Uyanık tut menüsünü aç
caffeine-until = { $time } saatine kadar
caffeine-until-turned-off = Kapatılana kadar
caffeine-30-minutes = 30 dakika
caffeine-1-hour = 1 saat
caffeine-2-hours = 2 saat
caffeine-inhibit-reason = Hızlı ayarlardan uyanık tutuluyor

## Brightness

brightness-title = Parlaklık
brightness-open-menu = Parlaklık menüsünü aç

## Keyboard backlight

backlight-title = Klavye aydınlatması
backlight-open-menu = Klavye parlaklığı menüsünü aç
backlight-slider = Klavye parlaklığı
backlight-off = Kapalı
backlight-low = Düşük
backlight-high = Yüksek

## Sound

volume-sound-settings = Ses ayarları
volume-mute = Sesi kapat
volume-unmute = Sesi aç
volume-output-slider = Ses düzeyi
volume-output-title = Ses çıkışı
volume-output-open-menu = Ses çıkışı menüsünü aç
volume-input-slider = Mikrofon
volume-input-title = Ses girişi
volume-input-open-menu = Ses girişi menüsünü aç

## Bluetooth

bluetooth-title = Bluetooth
bluetooth-open-menu = Bluetooth menüsünü aç
bluetooth-settings = Bluetooth ayarları
bluetooth-connect = Bağlan
bluetooth-disconnect = Bağlantıyı kes
bluetooth-connect-device = Bağlan: { $deviceName }
bluetooth-disconnect-device = Bağlantıyı kes: { $deviceName }
bluetooth-no-devices = Kullanılabilir ya da bağlı cihaz yok
bluetooth-turn-on-hint = Cihazlara bağlanmak için Bluetooth’u açın
bluetooth-connected-count = { $count ->
    [one] { $count } bağlı
   *[other] { $count } bağlı
}

## Network menus in quick settings

network-menu-unknown-network = <bilinmeyen>
network-menu-connect = Bağlan
network-menu-disconnect = Bağlantıyı kes
network-menu-connect-to = Bağlan: { $name }
network-menu-disconnect-from = Bağlantıyı kes: { $name }
network-menu-turn-off = Kapat
network-menu-wifi-network = { $secure ->
    [yes] { $name }, güvenli, sinyal gücü %{ $strength }
   *[no] { $name }, güvenli değil, sinyal gücü %{ $strength }
}
network-menu-hotspot = Erişim noktası: { $name }
network-menu-connected-count = { $count ->
    [one] { $count } bağlı
   *[other] { $count } bağlı
}
network-menu-vpn = VPN
network-menu-vpn-open-menu = VPN menüsünü aç
network-menu-vpn-settings = VPN ayarları
network-menu-wifi = Wi-Fi
network-menu-wifi-open-menu = Wi-Fi menüsünü aç
network-menu-wifi-settings = Tüm ağlar
network-menu-wired = Kablolu bağlantılar
network-menu-wired-open-menu = Kablolu bağlantılar menüsünü aç
network-menu-wired-settings = Kablolu ağ ayarları
network-menu-tethers = Bluetooth internet paylaşımı
network-menu-tethers-open-menu = Bluetooth internet paylaşımı menüsünü aç
network-menu-tether = Paylaşım
network-menu-tether-settings = Bluetooth ayarları
network-menu-mobile-connections = Mobil bağlantılar
network-menu-mobile-open-menu = Mobil bağlantılar menüsünü aç
network-menu-mobile-settings = Mobil geniş bant ayarları
network-menu-mobile = Mobil
network-device-wired = Kablolu
network-device-named = { $kind } ({ $name })
network-menu-sign-in = Ağda oturum açın
network-menu-failed-title = Bağlantı kurulamadı
network-menu-failed-body = Ağ bağlantısı etkinleştirilemedi

## Location access dialog

location-dialog-title = Konum erişimine izin ver
location-dialog-description = { $appName } uygulaması konumunuza erişmek istiyor
location-dialog-info = Konum erişimini gizlilik ayarlarından istediğiniz zaman değiştirebilirsiniz
location-dialog-deny = Erişimi reddet
location-dialog-grant = Erişim izni ver

## Thunderbolt notifications

thunderbolt-unknown-title = Bilinmeyen Thunderbolt cihazı
thunderbolt-unknown-body = Siz yokken yeni bir cihaz bağlandı. Kullanmaya başlamak için cihazı çıkarıp yeniden takın.
thunderbolt-unauthorized-title = Yetkilendirilmemiş Thunderbolt cihazı
thunderbolt-unauthorized-body = Yeni bir cihaz bağlandı ve bir yöneticinin onayı gerekiyor
thunderbolt-error-title = Thunderbolt yetkilendirme hatası
thunderbolt-error-body = Thunderbolt cihazı yetkilendirilemedi: { $reason }

## App permission dialog, used when an app asks for access to something

access-dialog-deny = Reddet
access-dialog-allow = İzin ver

## Display change confirmation

display-change-title = Bu ekran ayarları kalsın mı?
display-change-countdown = { $seconds ->
    [one] Ayar değişiklikleri { $seconds } saniye içinde geri alınacak
   *[other] Ayar değişiklikleri { $seconds } saniye içinde geri alınacak
}
display-change-revert = Geri al
display-change-keep = Değişiklikleri koru

## Drive connected notification

autorun-connected = “{ $driveName }” bağlandı
autorun-ready = Disk artık kullanılabilir
autorun-open-with = { $appName } ile aç

## Keyboard accessibility shortcuts

kbd-a11y-slow-keys-on = Yavaş tuşlar açıldı
kbd-a11y-slow-keys-off = Yavaş tuşlar kapatıldı
kbd-a11y-slow-keys-description = Shift tuşunu 8 saniye basılı tuttunuz. Bu, klavyenizin çalışma biçimini değiştiren Yavaş tuşlar özelliğinin kısayoludur.
kbd-a11y-sticky-keys-on = Yapışkan tuşlar açıldı
kbd-a11y-sticky-keys-off = Yapışkan tuşlar kapatıldı
kbd-a11y-sticky-keys-on-description = Shift tuşuna art arda 5 kez bastınız. Bu, klavyenizin çalışma biçimini değiştiren Yapışkan tuşlar özelliğinin kısayoludur.
kbd-a11y-sticky-keys-off-description = İki tuşa aynı anda ya da Shift tuşuna art arda 5 kez bastınız. Bu, klavyenizin çalışma biçimini değiştiren Yapışkan tuşlar özelliğini kapatır.
kbd-a11y-leave-on = Açık bırak
kbd-a11y-turn-on = Aç
kbd-a11y-turn-off = Kapat
kbd-a11y-leave-off = Kapalı bırak

## Audio device selection, shown after plugging something into the headphone jack

audio-device-title = Ses cihazını seçin
audio-device-cancel = İptal
audio-device-sound-settings = Ses ayarları
audio-device-headphones = Kulaklık
audio-device-headset = Mikrofonlu kulaklık
audio-device-microphone = Mikrofon

## Keyboard shortcut inhibiting, asked when an app wants to receive system shortcuts itself

inhibit-shortcuts-title = Kısayolların engellenmesine izin ver
inhibit-shortcuts-app = { $appName } uygulaması kısayolları engellemek istiyor
inhibit-shortcuts-unknown-app = Bir uygulama kısayolları engellemek istiyor
inhibit-shortcuts-titled-app = “{ $title }” penceresine sahip bir uygulama kısayolları engellemek istiyor
inhibit-shortcuts-restore = Kısayolları geri getirmek için şu tuşlara basın: { $shortcut }
inhibit-shortcuts-deny = Reddet
inhibit-shortcuts-allow = İzin ver

## Unlocking encrypted drives

mount-hidden-volume = Gizli birim
mount-windows-system-volume = Windows sistem birimi
mount-uses-keyfiles = Anahtar dosyaları kullanır
mount-keyfiles-use-app = Anahtar dosyaları kullanan bir birimin kilidini açmak için bunun yerine <i>{ $appName }</i> uygulamasını kullanın
mount-keyfiles-need-app = Anahtar dosyaları kullanan bir birimin kilidini açmak için <i>Diskler</i> gibi harici bir uygulama gerekir
mount-pim-number = PIM numarası
mount-pim-invalid = PIM bir sayı olmalı ya da boş kalmalı
mount-password = Parola
mount-remember-password = Parolayı hatırla
mount-cancel = İptal
mount-unlock = Kilidi aç
mount-open-app = { $appName } uygulamasını aç
mount-wrong-password = İşe yaramadı. Yeniden deneyin.
mount-unlock-failed = Birimin kilidi açılamadı
mount-pim-unsupported = Yüklü udisks sürümü PIM ayarını desteklemiyor

## Network passwords, asked when connecting needs one

network-agent-auth-required = Kimlik doğrulaması gerekiyor
network-agent-wifi-rejected = “{ $networkName }” için kayıtlı parola işe yaramadı. Parolayı yeniden girin.
network-agent-wifi-secrets = “{ $networkName }” kablosuz ağına erişmek için parola ya da şifreleme anahtarı gerekiyor
network-agent-wps-hint = Bunun yerine yönlendiricinizdeki “WPS” düğmesine basarak da bağlanabilirsiniz
network-agent-wired-title = Kablolu 802.1X kimlik doğrulaması
network-agent-dsl-title = DSL kimlik doğrulaması
network-agent-pin-title = PIN kodu gerekiyor
network-agent-pin-body = Mobil geniş bant cihazı için PIN kodu gerekiyor
network-agent-vpn-title = VPN parolası
network-agent-password-required = “{ $networkName }” ağına bağlanmak için parola gerekiyor
network-agent-connect = Bağlan
network-agent-cancel = İptal
network-agent-password = Parola
network-agent-username = Kullanıcı adı
network-agent-key = Anahtar
network-agent-private-key-password = Özel anahtar parolası
network-agent-identity = Kimlik
network-agent-service = Hizmet
network-agent-network-name = Ağ adı
network-agent-pin = PIN

## Screenshots and screen recording

screenshot-source = Ekran yakalama
screenshot-area = Alan seçimi
screenshot-screen = Ekran seçimi
screenshot-window = Pencere seçimi
screenshot-take = Ekran görüntüsü al
screenshot-record = Ekranı kaydet
screenshot-show-pointer = İşaretçiyi göster
screenshot-capture = Yakala
screenshot-close = Kapat
screenshot-screencasts-folder = Ekran kayıtları
screenshot-screencast-file = Ekran kaydı { $date } { $time }
screenshot-screenshots-folder = Ekran görüntüleri
screenshot-file = Ekran görüntüsü { $timestamp }
screenshot-screencast-recorded = Ekran kaydedildi
screenshot-screencast-start-failed = Ekran kaydı başlatılamadı
screenshot-screencast-out-of-space = Ekran kaydı başarısız: disk alanı yetersiz
screenshot-screencast-try-again = Ekran kaydı başarısız oldu. Yeniden deneyin.
screenshot-screencast-failed = Ekran kaydı başarısız oldu
screenshot-screencast-view = Videoyu görmek için buraya tıklayın
screenshot-show-in-rover = Rover uygulamasında göster
screenshot-captured = Ekran görüntüsü alındı
screenshot-captured-body = Resmi panodan yapıştırabilirsiniz

## System updates
updates-available-title = Sistem güncellemeleri var
updates-available-body = İndirip yüklemek için Ayarlar’ı açın.
updates-ready-title = Güncellemeler yüklenmeye hazır
updates-ready-body = Yüklemek için size uygun bir zamanda yeniden başlatın.
