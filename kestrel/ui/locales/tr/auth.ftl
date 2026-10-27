## Sign-in screen, shown before anyone signs in

greeter-session = Oturum
greeter-accessibility = Erişilebilirlik
greeter-power = Güç
greeter-larger-text = Daha büyük metin
greeter-screen-reader = Ekran okuyucu
greeter-suspend = Uyku
greeter-restart = Yeniden başlat
greeter-power-off = Bilgisayarı kapat
greeter-another-account = Başka bir hesap

## Lock screen

lock-screen-accessibility = Erişilebilirlik
lock-screen-power = Güç
lock-screen-battery = Pil { $level }
lock-screen-screen-reader = Ekran okuyucu
lock-screen-zoom = Yakınlaştırma
lock-screen-on-screen-keyboard = Ekran klavyesi
lock-screen-high-contrast = Yüksek karşıtlık
lock-screen-dwell-click = Bekleterek tıklama
lock-screen-larger-text = Daha büyük metin
lock-screen-suspend = Uyku
lock-screen-restart = Yeniden başlat…
lock-screen-power-off = Bilgisayarı kapat…
lock-inhibit-reason = Kestrel’in ekranı kilitlemesi gerekiyor

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Anahtarlığa kaydet
keyring-remember-for-app = Bu uygulama için hatırla
keyring-fingerprint-allow = İzin vermek için parmak izi okuyucuya dokunun
keyring-fingerprint-alternative = Ya da parmak izi okuyucuya dokunun
keyring-confirm = Onayla
keyring-allow = İzin ver
keyring-deny = İzin verme
keyring-password = Parola
keyring-mismatch = Girilenler eşleşmiyor
keyring-unlock = Kilidi aç
keyring-cancel = İptal

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = { $site } için geçiş anahtarı oluşturulsun mu?
passkeys-register-account-by-app = { $app }, { $account } için bir geçiş anahtarı kaydetmek istiyor. Anahtar bu bilgisayarda kalır.
passkeys-register-account = Bir uygulama, { $account } için bir geçiş anahtarı kaydetmek istiyor. Anahtar bu bilgisayarda kalır.
passkeys-register-by-app = { $app } bir geçiş anahtarı kaydetmek istiyor. Anahtar bu bilgisayarda kalır.
passkeys-register = Bir uygulama bir geçiş anahtarı kaydetmek istiyor. Anahtar bu bilgisayarda kalır.
passkeys-sign-in-title = Geçiş anahtarınızla { $site } sitesinde oturum açılsın mı?
passkeys-sign-in-choose-by-app = { $app } bir geçiş anahtarı istiyor. Oturum açmak için kullanılacak hesabı seçin.
passkeys-sign-in-choose = Bir uygulama bir geçiş anahtarı istiyor. Oturum açmak için kullanılacak hesabı seçin.
passkeys-sign-in-by-app = { $app } geçiş anahtarınızı istiyor.
passkeys-sign-in = Bir uygulama geçiş anahtarınızı istiyor.
passkeys-manage-title-by-app = { $app } geçiş anahtarlarınızı yönetebilsin mi?
passkeys-manage-title = Bu uygulama geçiş anahtarlarınızı yönetebilsin mi?
passkeys-manage-description = Hangi siteler için geçiş anahtarınız olduğunu görebilir ve bunları kaldırabilir.
passkeys-registered-title = { $site } için zaten bir geçiş anahtarınız var
passkeys-registered-description = Bunun yerine mevcut anahtarla oturum açın.
passkeys-choose-title = Bu bilgisayardaki geçiş anahtarları kullanılsın mı?
passkeys-choose-by-app = { $app } geçiş anahtarınızın nerede olduğunu soruyor.
passkeys-choose = Bir uygulama geçiş anahtarınızın nerede olduğunu soruyor.
passkeys-use-password = Parola kullan
passkeys-password = Parola
passkeys-cancel = İptal
passkeys-continue = Devam
passkeys-ok = Tamam
passkeys-use-this-computer = Bu bilgisayarı kullan
passkeys-fingerprint-unavailable = Devam etmek için parolanızı kullanın.
passkeys-wrong-password = Parola yanlış. Yeniden deneyin.

## Sign-in prompt

auth-prompt-password = Parola
auth-prompt-username = Kullanıcı adı
auth-prompt-back = Geri
auth-prompt-submit = Gönder
auth-prompt-wrong-password = Parola işe yaramadı
auth-prompt-failed = İşe yaramadı. Yeniden deneyin.
fingerprint-not-recognized = Parmak izi tanınmadı

## Administrator authentication

polkit-title = Kimlik doğrulaması gerekiyor
polkit-administrator = Yönetici
polkit-password = Parola
polkit-cancel = İptal
polkit-authenticate = Doğrula
polkit-failed = İşe yaramadı. Yeniden deneyin.

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

## Lock screen clock

lock-clock-swipe-up = Yukarı kaydırın
lock-clock-click-or-press = Tıklayın ya da bir tuşa basın

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Kilit açma penceresi
