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
