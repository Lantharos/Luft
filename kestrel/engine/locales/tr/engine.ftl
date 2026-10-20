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

## Window resizing

window-resize-size = { $width } × { $height }

## App not responding

close-dialog-title = “{ $appName }” yanıt vermiyor
close-dialog-description = Uygulamanın devam etmesi için biraz bekleyebilir ya da uygulamayı tamamen kapanmaya zorlayabilirsiniz
close-dialog-force-quit = Kapanmaya zorla
close-dialog-wait = Bekle

## Display mode switcher, keep each label under about 15 characters

switch-monitor-mirror = Yansıt
switch-monitor-join = Genişlet
switch-monitor-external-only = Yalnızca harici
switch-monitor-built-in-only = Yalnızca dahili

## Sign-in prompt

auth-prompt-password = Parola
auth-prompt-username = Kullanıcı adı
auth-prompt-back = Geri
auth-prompt-submit = Gönder
auth-prompt-wrong-password = Parola işe yaramadı
auth-prompt-failed = İşe yaramadı. Yeniden deneyin.
fingerprint-not-recognized = Parmak izi tanınmadı

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
inhibit-shortcuts-restore = Kısayolları geri getirmek için şu tuşlara basın: { $shortcut }
inhibit-shortcuts-deny = Reddet
inhibit-shortcuts-allow = İzin ver

## Administrator authentication

polkit-title = Kimlik doğrulaması gerekiyor
polkit-administrator = Yönetici
polkit-password = Parola
polkit-cancel = İptal
polkit-authenticate = Doğrula
polkit-failed = İşe yaramadı. Yeniden deneyin.

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

## Log out, power off and restart dialog

end-session-log-out-user = Oturumu kapat: { $userName }
end-session-log-out-title = Oturumu kapat
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } adlı kullanıcının oturumu { $seconds } saniye içinde otomatik olarak kapatılacak
   *[other] { $userName } adlı kullanıcının oturumu { $seconds } saniye içinde otomatik olarak kapatılacak
}
end-session-log-out-countdown = { $seconds ->
    [one] Oturumunuz { $seconds } saniye içinde otomatik olarak kapatılacak
   *[other] Oturumunuz { $seconds } saniye içinde otomatik olarak kapatılacak
}
end-session-log-out-button = Oturumu kapat
end-session-power-off-title = Bilgisayarı kapat
end-session-power-off-updates-title = Güncellemeleri yükle ve kapat
end-session-power-off-countdown = { $seconds ->
    [one] Sistem { $seconds } saniye içinde otomatik olarak kapanacak
   *[other] Sistem { $seconds } saniye içinde otomatik olarak kapanacak
}
end-session-power-off-button = Kapat
end-session-restart-title = Yeniden başlat
end-session-restart-updates-title = Güncellemeleri yükle ve yeniden başlat
end-session-restart-countdown = { $seconds ->
    [one] Sistem { $seconds } saniye içinde otomatik olarak yeniden başlayacak
   *[other] Sistem { $seconds } saniye içinde otomatik olarak yeniden başlayacak
}
end-session-restart-button = Yeniden başlat
end-session-update-restart-title = Yeniden başlat ve güncellemeleri yükle
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem { $seconds } saniye içinde otomatik olarak yeniden başlayacak ve güncellemeleri yükleyecek
   *[other] Sistem { $seconds } saniye içinde otomatik olarak yeniden başlayacak ve güncellemeleri yükleyecek
}
end-session-update-restart-button = Yeniden başlat ve yükle
end-session-install-updates = Bekleyen yazılım güncellemelerini yükle
end-session-install-version = { $version } sürümünü yükle
end-session-low-battery = Pil zayıf. Güncellemeleri yüklemeden önce bilgisayarı prize takın.
end-session-busy-apps = Bazı uygulamalar meşgul ya da kaydedilmemiş çalışmalar içeriyor
end-session-other-users = Başka kullanıcıların oturumu açık
end-session-cancel = İptal
end-session-boot-options = Önyükleme seçenekleri
end-session-remote-user = { $userName } (uzak)
end-session-console-user = { $userName } (konsol)

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

## Lock screen clock

lock-clock-swipe-up = Yukarı kaydırın
lock-clock-click-or-press = Tıklayın ya da bir tuşa basın

## Notification times

date-just-now = Az önce

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-windows = Pencereler
ctrl-alt-tab-panel = Görev çubuğu
ctrl-alt-tab-unlock = Kilit açma penceresi

## System notifications

messages-system-source = Sistem
unsafe-mode-title = Sistem güvenli olmayan moda alındı
unsafe-mode-body = Uygulamaların artık sınırsız erişimi var
unsafe-mode-undo = Geri al
privileged-user-title = Ayrıcalıklı bir kullanıcı olarak oturum açıldı
privileged-user-body = Güvenlik nedeniyle ayrıcalıklı bir kullanıcı olarak oturum çalıştırmaktan kaçınılmalıdır. Mümkünse normal bir kullanıcı olarak oturum açın.

## On-screen keyboard

osk-keyboard-settings = Klavye ayarları
osk-letters-key = ABC

## Lock screen

lock-inhibit-reason = Kestrel’in ekranı kilitlemesi gerekiyor

## Notifications

messages-unknown-app = Bilinmeyen uygulama
messages-reply = Yanıtla
messages-reply-placeholder = Yanıt yazın
messages-reply-send = Gönder

## Media player controls

mpris-unknown-artist = Bilinmeyen sanatçı
mpris-unknown-title = Bilinmeyen başlık

## Starting programs

spawn-failed = “{ $command }” çalıştırılamadı:

## Text field context menu

entry-menu-copy = Kopyala
entry-menu-paste = Yapıştır
entry-menu-show-text = Metni göster
entry-menu-hide-text = Metni gizle
entry-caps-lock-on = Caps Lock açık

## Window menu, opened by right-clicking a window's title bar

title-bar-menu-screenshot = Ekran görüntüsü al
title-bar-menu-hide = Gizle
title-bar-menu-restore = Önceki boyutuna getir
title-bar-menu-maximize = Ekranı kapla
title-bar-menu-move = Taşı
title-bar-menu-resize = Yeniden boyutlandır
title-bar-menu-always-on-top = Her zaman üstte
title-bar-menu-always-on-visible-workspace = Her zaman görünür çalışma alanında
title-bar-menu-workspace-left = Soldaki çalışma alanına taşı
title-bar-menu-workspace-right = Sağdaki çalışma alanına taşı
title-bar-menu-workspace-up = Üstteki çalışma alanına taşı
title-bar-menu-workspace-down = Alttaki çalışma alanına taşı
title-bar-menu-monitor-up = Üstteki ekrana taşı
title-bar-menu-monitor-down = Alttaki ekrana taşı
title-bar-menu-monitor-left = Soldaki ekrana taşı
title-bar-menu-monitor-right = Sağdaki ekrana taşı
title-bar-menu-close = Kapat

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
