## What Meet Luft finds when it checks a computer

check-processor-x64 = 64 bit Intel veya AMD işlemci
check-processor-x64-detail = Luft bu işlemcide çalışır.
check-processor-arm = Arm işlemci
check-processor-arm-detail = Luft şimdilik yalnızca Intel ve AMD işlemcilerde çalışır.
check-processor-32-bit-windows = 32 bit Windows
check-processor-32-bit-system = 32 bit sistem
check-processor-32-bit-detail = Luft için 64 bit Intel veya AMD işlemci gerekir.
check-startup-uefi = UEFI ile başlıyor
check-startup-uefi-windows = Luft da aynı modern yolla başlar.
check-startup-uefi-linux = Luft kendi önyükleme girdisini ekler; şu anki sistem de şimdiki gibi başlamaya devam eder: { $system }.
check-startup-bios = Eski BIOS modunda başlıyor
check-startup-bios-windows = Luft için UEFI gerekir. Windows MBR2GPT ile geçiş yapabilir, ardından UEFI üretici yazılımı ayarlarından açılabilir.
check-startup-bios-linux = Luft için UEFI gerekir. Üretici yazılımı ayarlarından, buradaki sistemle birlikte açın ve yeniden denetleyin.
check-startup-mbr = Disk eski bir bölüm tablosu kullanıyor
check-startup-mbr-windows = Luft için GPT disk gerekir. Windows, MBR2GPT ile dosyaları kaybetmeden dönüştürebilir.
check-startup-mbr-linux = Luft’un başlayabilmesi için GPT disk gerekir.
check-startup-no-esp = EFI sistem bölümü yok
check-startup-no-esp-detail = Luft önyükleme dosyalarını EFI sistem bölümündeki dosyaların yanına ekler, ama böyle bir bölüm yok.
check-startup-esp-full = EFI sistem bölümü dolu
check-startup-esp-full-detail = Luft’un önyükleme dosyaları için orada { $size } MB alana ihtiyacı var. Bu yeri genellikle eski çekirdekler ya da önyükleme girdileri kaplar.
check-folder-fine = Hiçbir bölüm değiştirilmez
check-folder-fine-detail = Luft, { $filesystem } diskinizde bir dosya olarak tutulur ve oradan başlar.
check-folder-encrypted = Dosyalarınız şifreli bir diskte
check-folder-encrypted-detail = Luft henüz şifreli bir diskten başlayamıyor. Denemek için bir USB bellek kullanın.
check-folder-combined = Dosyalarınız birden fazla bölüme yayılmış
check-folder-combined-detail = Luft henüz LVM ya da RAID üzerinden başlayamıyor. Denemek için bir USB bellek kullanın.
check-folder-filesystem = Luft şu dosya sisteminden başlayamaz: { $filesystem }
check-folder-filesystem-detail = ext4, btrfs ve XFS disklerden başlar. Denemek için bir USB bellek kullanın.
check-space-free = { $size } GB boş
check-space-free-linux = Luft, siz denerken yaklaşık { $size } GB yer kaplar.
check-space-up-to = Luft için en fazla { $size } GB
check-space-up-to-detail = Windows dosyalarını ve büyümek için yer ayırır.
check-space-short = Yeterli boş alan yok
check-space-short-windows = Luft’un, Windows’un ayırabileceği yaklaşık { $needed } GB alana ihtiyacı var. Windows’ta örneğin Disk Temizleme ile { $missing } GB yer açın ve yeniden denetleyin.
check-space-short-linux = Luft’un başlayabilmesi için yaklaşık { $needed } GB alan gerekir. { $missing } GB yer açın ve yeniden denetleyin.
check-system-replaceable = Luft onun yerini alabilir ve dosyalarınızı, hesabınızı ve ayarlarınızı korur.
check-system-single = Dosyalarınız sistemle aynı bölümde, bu yüzden dosyaları koruyarak sistemin yerine yükleme henüz desteklenmiyor. Luft’u denemek ve yüklemek mümkün.
check-system-encrypted = Sistem şifreli, bu yüzden dosyalarınızı koruyarak yerine yükleme henüz desteklenmiyor.
check-system-unknown = Diski, Luft’un dosyalarınızı koruyarak henüz yerine geçemeyeceği bir düzende.
check-encryption-off = Windows şifreli değil
check-encryption-off-detail = Luft’u yükle, Windows ayarlarını ve Bluetooth cihazlarınızı okuyabilir.
check-encryption-on = Windows BitLocker ile şifrelenmiş
check-encryption-on-detail = Sorun değil. Yeri Windows kendisi açar, Meet Luft da Luft’un kilitli bir diskten okuyamayacaklarını taşır. Ne olur ne olmaz, kurtarma anahtarınızı yakında tutun.
check-encryption-changing = BitLocker hâlâ şifreliyor ya da şifre çözüyor
check-encryption-changing-detail = Windows bitirene kadar bekleyin, sonra geri gelin. Ne kadar ilerlediğini Ayarlar’da Cihaz şifreleme altında görebilirsiniz.
check-fast-startup-on = Hızlı başlatma açık
check-fast-startup-on-detail = Windows kapanmak yerine hazırda bekleme moduna geçer ve bu da diskini kilitli tutar. Meet Luft yüklemeden önce kapatmayı önerir.
check-fast-startup-off = Hızlı başlatma kapalı
check-fast-startup-off-detail = Windows tamamen kapanır.
check-secure-boot-on = Secure Boot açık
check-secure-boot-on-detail = Açık kalabilir. Luft, anahtarını eklemek için mavi bir ekranda bir kez sorar.
check-secure-boot-off = Secure Boot kapalı
check-secure-boot-off-detail = Luft onsuz da çalışır, ama hile önleyicili oyunlar buna ihtiyaç duyar. { $turningOn }
check-secure-boot-restart-into = Meet Luft üretici yazılımı ayarlarında yeniden başlatabilir; ayar şurada: { $place }.
check-secure-boot-restart-into-anywhere = Meet Luft üretici yazılımı ayarlarında yeniden başlatabilir; ayar genellikle Security ya da Boot altındadır.
check-secure-boot-turn-on = Açmak için yeniden başlatın ve { $maker } logosu görünürken şu tuşa basın: { $key }. Ardından şuraya gidin: { $place }.
check-secure-boot-turn-on-anywhere = Açmak için bilgisayar başlarken üretici yazılımı ayarlarını açın ve Security ya da Boot altına bakın.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security, ardından Secure Boot
check-firmware-place-boot-configuration = Boot Configuration, ardından Secure Boot
check-firmware-place-security-or-advanced = Security ya da Advanced, ardından Secure Boot Configuration
check-firmware-place-security-or-boot = Security ya da Boot, ardından Secure Boot
check-firmware-place-boot = Boot, ardından Secure Boot
check-firmware-place-settings = Settings, ardından Security, ardından Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (ThinkPad’de F1)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ya da Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = ses açma düğmesi

## More of the computer's hardware

check-tpm-detail = Şifreli bir Luft, bilgisayar başlarken kilidini kendiliğinden açabilir.
check-tpm-missing = TPM 2.0 yok
check-tpm-missing-detail = Luft’u şifrelerseniz her başlangıçta disk parolası sorar.
check-graphics = Grafik
check-graphics-detail = Kutudan çıktığı gibi çalışır.
check-graphics-nvidia = Luft, NVIDIA’nın kendi sürücüsüyle yüklenir.
check-wifi-missing = Wi-Fi yok
check-wifi-missing-detail = Luft’ta ağ kablosu kullanın ya da ağsız kullanın.
check-wifi-detail = Luft’ta çalışır.
check-wifi-broadcom = Bazı Broadcom Wi-Fi çipleri, Luft’ta bulunmayan bir sürücüye ihtiyaç duyar. Yakınınızda bir ağ kablosu ya da USB ile internet paylaşımı için bir telefon bulundurun.
check-start-entries = { $count ->
    [one] Eski bir önyükleme girdisi
   *[other] { $count } eski önyükleme girdisi
}
check-start-entries-detail = { $count ->
    [one] Bu girdi artık bu bilgisayarda olmayan bir sistemi gösteriyor: { $names }. Temizlenebilir.
   *[other] Bu girdiler artık bu bilgisayarda olmayan sistemleri gösteriyor: { $names }. Temizlenebilirler.
}
check-download-unavailable = Luft şu anda indirilemiyor
check-download-unavailable-detail = Meet Luft yaklaşık 3 GB indirir. İnternete bağlı olduğunuzu denetleyip yeniden deneyin ya da elinizdeki bir Luft ISO’sunu kullanın.

## Choosing a Luft ISO file

iso-dialog-title = Luft ISO’su seçin
iso-dialog-filter = Luft ISO’su

## Saving the logs from trying Luft

logs-file-name = Luft günlükleri { $name }
logs-no-desktop = Meet Luft masaüstünüzü bulamadı
logs-not-saved = Meet Luft, Luft denemesinin günlüklerini kaydedemedi: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Meet Luft yardımcısı başlamadı: { $error }
helper-not-allowed = Meet Luft’a diskte çalışma izni verilmedi
helper-stopped = Meet Luft yardımcısı durdu
helper-stopped-because = Meet Luft yardımcısı durdu: { $error }
helper-pipe-failed = Meet Luft yardımcısıyla iletişim kuramadı: { $error }
helper-pipe-hijacked = Meet Luft yardımcısı dışında bir şey bunu açtı: { $pipe }
helper-record-not-saved = Meet Luft oluşturduklarını not edemedi: { $error }
helper-no-room-yet = Önce Luft için yer açın.
helper-not-ready-linux = Önce Luft’u hazırlayın.
helper-not-ready-to-start-windows = Luft henüz başlamaya hazır değil. Önce onun için yer açın.
helper-not-ready-to-start-linux = Luft henüz başlamaya hazır değil. Önce hazırlayın.
helper-update-unfinished = Luft güncellemesi tamamlanmadı. Önce yeniden güncelleyin.
helper-room-too-small = Luft’un bundan daha fazla alana ihtiyacı var.
helper-room-shortfall = Windows { $available } GB ayırabilir, Luft’un ise { $needed } GB alana ihtiyacı var.
helper-box-shortfall = Windows { $available } GB daha ayırabilir, seçtikleriniz ise { $needed } GB gerektiriyor.
helper-bluetooth-unreadable = Windows’un Bluetooth ayarları açılamadı
helper-registry-not-opened = Açılamadı: { $key } ({ $error })
helper-registry-not-changed = Değiştirilemedi: { $value } ({ $error })
helper-registry-not-saved = Kaydedilemedi: { $file } ({ $error })
helper-restart-failed = Bilgisayar yeniden başlamadı
helper-windows-restart-failed = Windows yeniden başlamadı: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Bu bilgisayar UEFI ile başlamıyor
firmware-variable-unreadable = Üretici yazılımından okunamadı: { $name } ({ $error })
firmware-variable-not-saved = Üretici yazılımına kaydedilemedi: { $name } ({ $error })
firmware-entries-full = Üretici yazılımında başka bir önyükleme girdisine yer yok
firmware-entry-kept = Windows şu önyükleme girdisini tuttu: { $entry }

## Errors about drives and partitions

drive-list-failed = Sürücüler listelenemedi: { $error }
drive-of-path-unknown = Bu klasörün hangi sürücüde olduğu anlaşılamadı: { $path }
drive-windows-folder-missing = Windows klasörü bulunamadı
drive-windows-drive-missing = Windows sürücüsü bulunamadı
drive-windows-drive-missing-because = Windows sürücüsü bulunamadı: { $error }
drive-windows-partition-missing = Windows bölümü bulunamadı
drive-volume-missing = Birim bulunamadı: { $path }
drive-storage-error = { $what } (Windows depolama hatası { $code })
drive-shrink-size-unknown = Windows, bölümünün ne kadar küçülebileceğini belirleyemedi
drive-grow-size-unknown = Windows, bölümünün ne kadar büyüyebileceğini belirleyemedi
drive-resize-failed = Windows bölümünün boyutunu değiştiremedi
drive-create-failed = Windows, Luft için bir bölüm oluşturamadı
drive-hide-failed = Windows yeni bölümü Dosya Gezgini’nden gizleyemedi
drive-format-failed = Windows yeni bölümü biçimlendiremedi
drive-remove-failed = Windows, Luft’un bölümlerinden birini kaldıramadı
drive-new-partition-missing = Yeni bölüm bulunamadı
drive-new-partition-no-volume = Yeni bölümün birimi yok
drive-start-no-guid = Önyükleme bölümünün GUID’i yok
drive-live-no-guid = Canlı bölümün GUID’i yok
drive-box-no-guid = Taşınma kutusunun GUID’i yok
drive-guid-unreadable = Bölümün GUID’i okunamıyor
drive-not-gpt = Sürücünün bölüm tablosu GPT değil
drive-start-no-volume = Önyükleme bölümünün birimi yok
drive-live-no-volume = Luft bölümünün birimi yok
drive-new-live-no-volume = Luft’un yeni bölümünün birimi yok
drive-partitions-not-noted = Luft’un bölümleri Meet Luft’un notlarında yok
drive-partitions-gone = Luft’un bölümleri kayboldu
drive-partition-gone = Bir bölüm kayboldu
drive-start-partition-foreign = Luft’un önyükleme bölümü Meet Luft’un oluşturduğu bir bölüm değil
drive-start-partition-gone = Luft’un önyükleme bölümü yok olmuş
drive-start-partition-not-listed = Luft’un önyükleme bölümü bölüm tablosunda yok
drive-no-esp = Bu bilgisayarda EFI sistem bölümü yok
drive-esp-full = EFI sistem bölümü, Luft’un önyükleme dosyaları için fazla dolu.
drive-esp-not-opened = EFI sistem bölümü açılamadı
drive-esp-file-unreadable = EFI sistem bölümündeki dosya okunamıyor: { $file }
drive-esp-no-drive = EFI sistem bölümünün sürücüsü yok
drive-esp-no-guid = EFI sistem bölümünün GUID’i yok
drive-no-uuid = Luft’un tutulduğu sürücünün UUID’si yok
drive-folder-unreadable = Luft, dosyalarınızın bulunduğu sürücüden başlayamaz.
drive-folder-not-startable = Bu klasörden başlatılamaz: { $folder }

## Errors while getting Luft

live-no-home-folder = Luft’u tutmak için bir ev klasörü yok
live-no-app-data-folder = Luft’u tutmak için yerel bir uygulama verileri klasörü yok
live-pointer-unreadable = En yeni Luft okunamıyor
live-not-published = Luft orada yayımlanmamış
live-checksum-unreadable = Sağlama toplamı dosyası okunamıyor
live-checksum-not-read = Luft’un sağlama toplamı okunamadı: { $error }
live-download-damaged = İndirilen dosya yolda bozuldu. Yeniden deneyin.
live-download-incomplete = İndirilen Luft’ta eksik dosya var: { $file }
live-download-not-resumable = Sunucu indirmeye devam edemiyor
live-not-signed = İmzalı değil: { $iso }
live-signature-unreadable = İmzası okunamıyor: { $iso }
live-signature-wrong-key = Lantharos tarafından imzalanmamış: { $iso }
live-signature-other-iso = İmza { $iso } için değil, { $signed } için
live-iso-out-of-order = ISO’daki dosyalar Meet Luft’un okuyabileceği bir sırada değil
live-iso-not-iso = Bu bir ISO kalıbı değil
live-iso-no-root = ISO’nun kök klasörü yok
live-iso-no-joliet = ISO’da Joliet adları yok
live-not-removed = Kaldırılamadı: { $path } ({ $error })

## Errors while making a USB stick

stick-gone = Bellek artık takılı değil. Yeniden takın ve tekrar seçin.
stick-too-small = Luft bu belleğe sığmıyor. 4 GB ya da daha büyük bir bellek kullanın.
stick-damaged = ISO, sağlama toplamıyla eşleşmiyor. Yolda bozulmuş olabilir.
stick-read-back-differs = Bellekten geri okunan, yazılanla aynı değil. Yıpranmış olabilir, başka bir bellek deneyin.
stick-download-unavailable = Luft şu anda indirilemiyor: { $error }
stick-download-failed = Luft indirilemedi: { $error }
stick-checksum-unreadable = ISO’nun sağlama toplamı okunamıyor: { $error }
stick-file-unreadable = Okunamıyor: { $path } ({ $error })
stick-iso-unreadable = ISO okunamıyor: { $error }
stick-iso-no-name = ISO’nun adı yok
stick-iso-ended-early = ISO beklenenden önce bitti
stick-iso-already-there = Bu dosya zaten bellekte: { $name }
stick-no-room = Bellekte Luft için yer yok. Önce bellekte { $size } MB yer açın.
stick-older-not-removed = Eski Luft kaldırılamadı: { $error }
stick-copy-stopped = Luft’un belleğe kopyalanması durdu: { $error }
stick-not-opened = Bellek açılamadı: { $error }
stick-write-stopped = Belleğe yazma durdu: { $error }
stick-not-synced = Bellek her şeyi kaydetmedi: { $error }
stick-read-back-failed = Bellek geri okunamadı: { $error }
stick-in-use = Bellek hâlâ kullanımda: { $error }
stick-device-in-use = Hâlâ kullanımda: { $device } ({ $error })
stick-volume-not-opened = Belleğin birimi açılamadı: { $error }
stick-volume-in-use = Bellek hâlâ kullanımda. Üzerinde dosya açık olan uygulamaları kapatıp yeniden deneyin ({ $error })
stick-not-dismounted = Windows belleği bırakamadı: { $error }
stick-not-cleared = Windows belleği temizleyemedi: { $error }
stick-not-refreshed = Windows belleği yeniden tarayamadı: { $error }
stick-not-ventoy = Bu bellek artık Ventoy kullanmıyor.
stick-ventoy-not-opened = Ventoy bölümü açılamadı: { $error }
stick-ventoy-not-opened-windows = Windows, Ventoy bölümünü açamıyor
stick-udisks-missing = Meet Luft’un belleği kullanabilmesi için UDisks gerekir: { $error }
