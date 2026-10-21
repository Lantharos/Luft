## Messages that some steps share

meet-back = Geri
meet-cancel = İptal
meet-continue = Devam
meet-try-again = Yeniden dene
meet-restart = Yeniden başlat
meet-remove = Kaldır
meet-keep-it = Kalsın
meet-close = Kapat
meet-restart-title = Şimdi yeniden başlatılsın mı?
meet-not-yet = Henüz değil
meet-iso-use = Elimdeki ISO’yu kullan
meet-iso-using = Luft ISO’nuz kullanılıyor
meet-nightly = Gecelik sürümler
meet-channel-nightly = Meet Luft gecelik sürümleri kullanacak
meet-channel-latest = Meet Luft yeniden kararlı sürümleri kullanacak
meet-undo = Geri al
meet-logs-saved = Luft denemesinin günlükleri masaüstüne kaydedildi
meet-logs-show = Göster
meet-logs-none = Henüz Luft denemesinden günlük yok
meet-logs-failed = Meet Luft, Luft denemesinin günlüklerini kaydedemedi

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Meet Luft bu bilgisayarı incelemeyi bitiremedi.
   *[windows] Meet Luft bu bilgisayarı incelemeyi bitiremedi.
}
problem-room = Luft için yer açma işlemi tamamlanmadı.
problem-room-linux = Luft’u hazırlama işlemi tamamlanmadı.
problem-update = Luft güncellemesi tamamlanmadı.
problem-download = Luft’un indirilmesi durdu. İnternete bağlı olduğunuzu denetleyin.
problem-pack = Eşyalarınızın paketlenmesi tamamlanmadı.
problem-remove = Luft’un kaldırılması tamamlanmadı.
problem-restart = Meet Luft yeniden başlatmayı hazırlayamadı.
problem-tidy = Eski önyükleme girdileri kaldırılamadı.
problem-firmware = Meet Luft üretici yazılımı ayarlarını açamadı.
problem-folders = Meet Luft klasörlerinize göz atamadı.
problem-sticks = Meet Luft USB bellekleri arayamadı.
problem-stick = USB bellek hazırlama işlemi tamamlanmadı.
problem-offer = Luft şu anda indirilemiyor. İnternete bağlı olduğunuzu denetleyin ya da elinizdeki bir ISO’yu kullanın.
problem-declined = { $platform ->
    [linux] Meet Luft’un diskte çalışmak için izninize ihtiyacı var. Sorulduğunda parolanızı girin.
   *[windows] Meet Luft’un diskte çalışmak için izninize ihtiyacı var. Windows sorduğunda Evet’i seçin.
}

## First screen

hello-intro = { $platform ->
    [linux] Luft’u USB bellek olmadan doğrudan buradan deneyin. Beğenirseniz Luft bu sistemin yerini alabilir ve dosyalarınızı korur.
   *[windows] Luft, Windows’un hemen yanında yaşayabilir. Önce hiçbir şey yüklemeden deneyin, hazır olduğunuzda eşyalarınızı da getirin.
}
hello-check = { $platform ->
    [linux] Bu bilgisayarı denetle
   *[windows] Bu bilgisayarı denetle
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Bilgisayar inceleniyor
   *[windows] Bilgisayar inceleniyor
}
check-ready-title = { $platform ->
    [linux] Bu bilgisayar Luft’a hazır
   *[windows] Bu bilgisayar Luft’a hazır
}
check-blocked-title = Az kaldı
check-moment = Bu biraz sürer.
check-slow = Windows ne kadar yer ayırabileceğini hesaplıyor. Büyük bir diskte bu birkaç dakika sürebilir.
check-blocked-description = Luft yerleşmeden önce bir şeyin değişmesi gerekiyor. Yapmanız gerekenler şunlar.
check-found-description = Meet Luft’un buldukları.
check-checking = Disk, üretici yazılımı ve donanım denetleniyor…
check-again = Yeniden denetle
check-action-firmware = Üretici yazılımı ayarlarını aç
check-action-tidy = Temizle
check-firmware-title = Üretici yazılımı ayarlarında yeniden başlatılsın mı?
check-firmware-description = Önce üzerinde çalıştığınız her şeyi kaydedin. Orada Secure Boot’u açıp kaydedin, bilgisayarınız her zamanki gibi yeniden başlar.
check-tidy-title = Eski önyükleme girdileri kaldırılsın mı?
check-tidy-description = Bunlar yalnızca artık var olmayan sistemleri gösteriyor. Windows ve diğer her şey eskisi gibi başlar.
check-get-ready-title = Luft hazırlansın mı?
check-get-ready-file = Meet Luft, Luft’u ISO’nuzdan bu bilgisayardaki bir klasöre kopyalar ve onun için bir önyükleme girdisi ekler. Hiçbir bölüm değiştirilmez.
check-get-ready-download = Meet Luft, yaklaşık { $size } boyutundaki Luft’u bu bilgisayardaki bir klasöre indirir ve onun için bir önyükleme girdisi ekler. Hiçbir bölüm değiştirilmez.
check-get-ready-confirm = Hazırla

## Choosing how much of the Windows drive Luft gets

room-title = Luft’a ne kadar yer?
room-description = Windows, Luft’a yer açmak için kendini küçültür. Windows’taki dosyalarınız olduğu yerde kalır.
room-live = Windows büyümek için yer ayırır. Luft da başlangıç için { $size } ayırır ve yüklendikten sonra bu alanı geri verir.
room-make = Yer aç
room-confirm-title = Luft’a { $size } verilsin mi?
room-confirm-file = Windows diskini küçültür, ardından Meet Luft, Luft’u ISO’nuzdan kopyalar. Bilgisayarı prize takılı tutun.
room-confirm-download = Windows diskini küçültür, ardından Meet Luft yaklaşık { $size } boyutundaki Luft’u indirir. Bilgisayarı prize takılı ve internete bağlı tutun.

## Luft is ready on Windows

ready-title = Luft hazır
ready-description = Onunla nasıl tanışmak istediğinizi seçin. Luft’u yükleyip seçmediğiniz sürece Windows sonrasında her zamanki gibi başlar.
ready-update-title = En yeni Luft’u al
ready-update-description = Daha yeni bir sürüm çıktı. Bunun yerini alır; ayrılan yeri ve paketlediğiniz her şeyi korur.
ready-try-title = Luft’u dene
ready-try-description = Hiçbir şey yüklemeden Luft’ta yeniden başlatın. Bir sonraki sefer Windows her zamanki gibi başlar.
ready-box-description = Belgeleri, fotoğrafları, Wi-Fi ağlarını ve daha fazlasını paketleyin; Luft yüklendiğinde bunları açar.
ready-box-packed = Paketlendi: { $size }
ready-install-title = Luft’u yükle
ready-install-description = Yükleyicide yeniden başlatın. Windows’un yanındaki { $size } alan onu bekliyor.
ready-stick-description = Herhangi bir bilgisayarda başlatmak için Luft’u bir USB belleğe yazın.
ready-remove = Luft’u bu bilgisayardan kaldır
ready-restart-try = Önce üzerinde çalıştığınız her şeyi kaydedin. Luft yaklaşık bir dakika içinde açılır, bir sonraki yeniden başlatma sizi Windows’a döndürür.
ready-restart-install = Önce üzerinde çalıştığınız her şeyi kaydedin. Yükleyici yaklaşık bir dakika içinde açılır ve orada onaylayana kadar hiçbir şey değişmez.
ready-fast-startup-title = Windows’ta Hızlı başlatmayı kapat
ready-fast-startup-description = Böylece Windows tamamen kapanır; ses, Wi-Fi ve Bluetooth Luft’ta temiz bir şekilde başlar.
ready-clock-title = Saat iki sistemde de doğru kalsın
ready-clock-description = Windows bilgisayarın saatini Luft ile aynı şekilde okur, böylece sistemler arasında geçiş yaptığınızda saat artık kaymaz.
ready-remove-title = Luft bu bilgisayardan kaldırılsın mı?
ready-remove-description = Meet Luft, taşınma kutusu da dahil eklediği her şeyi siler ve tüm alanı Windows’a geri verir.

## Luft is ready on Linux

linux-ready-description = Onunla nasıl tanışmak istediğinizi seçin. Siz aksini seçene kadar her zamanki gibi başlayan sistem: { $system }.
linux-ready-this-system = bu sistem
linux-ready-update-description = Daha yeni bir sürüm çıktı. Meet Luft’un tuttuğu sürümün yerini alır ve denemelerin günlüklerini korur.
linux-ready-try-description = Hiçbir şeyi değiştirmeden Luft’ta yeniden başlatın. Bir sonraki sefer her zamanki gibi açılacak sistem: { $system }.
linux-ready-replace-title = Yerine yükle: { $system }
linux-ready-replace-description = Luft onun yerini alır; dosyalarınızı, hesabınızı, Wi-Fi ağlarınızı ve diğer sürücüleri korur. Eski sistem siz kaldırana kadar kalır.
linux-ready-install-description = Luft’u başka bir sürücüye ya da boş alana yüklemek için yükleyicide yeniden başlatın.
linux-ready-remove = Luft’u bu bilgisayardan kaldır
linux-ready-restart-try = Önce üzerinde çalıştığınız her şeyi kaydedin. Luft yaklaşık bir dakika içinde açılır, bir sonraki yeniden başlatmada şu sisteme dönersiniz: { $system }.
linux-ready-restart-replace = Önce üzerinde çalıştığınız her şeyi kaydedin. Yükleyici, yerine yüklenecek sistem seçili olarak açılır ({ $system }) ve bir şey değişmeden önce neyin kalacağını gösterir.
linux-ready-remove-title = Luft bu bilgisayardan kaldırılsın mı?
linux-ready-remove-description = Meet Luft, Luft’un dosyalarını, önyükleme dosyalarını ve önyükleme girdisini siler. Geri kalan her şey olduğu gibi kalır.

## Packing things to take along to Luft (the moving box)

box-title = Eşyalarınızı getirin
box-description = Yanınızda ne götüreceğinizi seçin. Luft yüklendiğinde bunları yeni hesabınıza açar; Windows’tan hiçbir şey silinmez.
box-looking = Klasörlerinize göz atılıyor…
box-folder-desktop = Masaüstü
box-folder-documents = Belgeler
box-folder-downloads = İndirilenler
box-folder-music = Müzik
box-folder-pictures = Resimler
box-folder-videos = Videolar
box-folder-size = { $size }, { $files ->
    [one] { $files } dosya
   *[other] { $files } dosya
}
box-wifi-title = Wi-Fi ağları
box-wifi-description = Parolalarıyla birlikte, böylece Luft hemen internete bağlanır
box-bluetooth-title = Bluetooth cihazları
box-bluetooth-description = { $devices ->
    [one] { $devices } cihaz, yeniden eşleştirmeden hazır
   *[other] { $devices } cihaz, yeniden eşleştirmeden hazır
}
box-wallpaper-title = Duvar kâğıdı
box-wallpaper-description = Windows masaüstünüzdeki resim
box-account-title = Adınız ve resminiz
box-total-slow = { $size }, paketlemesi yaklaşık { $minutes ->
    [one] { $minutes } dakika
   *[other] { $minutes } dakika
} sürer
box-pack = Paketle

## Progress while Meet Luft works

working-shrinking = Yer açılıyor
    .description = Windows yer açmak için dosyalarını taşıyor. Bu birkaç dakika sürebilir.
working-partitioning = Luft’un alanı hazırlanıyor
    .description = Luft’un başlayacağı bölümler hazırlanıyor.
working-downloading = Luft getiriliyor
    .description = Luft doğrudan kendi alanına kopyalanıyor ve yol boyunca denetleniyor.
working-packing = Eşyalarınız paketleniyor
    .description = Seçtiğiniz her şey taşınma kutusuna kopyalanıyor. Büyük klasörler biraz sürer.
working-removing = Luft kaldırılıyor
    .description = Alan Windows’a geri veriliyor.
working-removing-linux = Luft kaldırılıyor
    .description = Dosyaları ve önyükleme girdisi kaldırılıyor.
working-writing = USB bellek hazırlanıyor
    .description = Luft belleğin tamamına yazılıyor. Takılı tutun.
working-copying = Luft, Ventoy’a ekleniyor
    .description = Luft bellekteki diğer ISO’ların yanına kopyalanıyor. Takılı tutun.
working-verifying = USB bellek denetleniyor
    .description = Başlayabildiğinden emin olmak için tamamı geri okunuyor.
working-stick-downloading = Luft indiriliyor
    .description = Yol boyunca denetlenir ve saklanır, böylece sonraki bellek daha hızlı hazırlanır.
working-progress = { $done } / { $total }
working-keep-open = Lütfen bu pencereyi açık tutun.

## After Luft was removed

removed-title = Her şey eskisi gibi
removed-description = { $platform ->
    [linux] Luft’un dosyaları ve önyükleme girdisi kaldırıldı, bilgisayarınız eskisi gibi başlıyor. İstediğiniz zaman geri gelin.
   *[windows] Luft’un bölümleri ve önyükleme girdisi kaldırıldı, Windows tüm alanına yeniden sahip. İstediğiniz zaman geri gelin.
}

## Making a USB stick

stick-title = USB bellek hazırla
stick-description = Luft, denemek ya da yüklemek için her bilgisayarda bu bellekten başlar.
stick-looking = USB bellekler aranıyor…
stick-none = En az { $size } boyutunda bir USB bellek takın. Burada görünecek.
stick-drives-label = USB bellekler
stick-offer = { $name }, { $size }
stick-make = Belleği hazırla
stick-drive-empty = Boş
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Luft için çok küçük
stick-ventoy-title = Bu bellek Ventoy kullanıyor
stick-ventoy-description = Luft bu belleğe eklensin mi, yoksa belleğin tamamı silinip Luft belleğine mi dönüştürülsün?
stick-erase-it = Sil
stick-add = Luft’u ekle
stick-replace-title = Üzerindeki Luft değiştirilsin mi?
stick-replace-description = { $count ->
    [one] Bu bellekte zaten şu sürüm var: { $names }. Yeni Luft onun yerini alabilir.
   *[other] Bu bellekte zaten şu sürümler var: { $names }. Yeni Luft onların yerini alabilir.
}
stick-keep = { $count ->
    [one] İkisini de tut
   *[other] Hepsini tut
}
stick-replace = Değiştir
stick-full-title = Luft’a yer yok
stick-full-description = Luft’un { $needed } alana ihtiyacı var, bu bellekte ise { $free } boş. Bellekte yer açın ya da silip Luft belleğine dönüştürün.
stick-erase-title = { $name } silinsin mi?
stick-erase-description = Bu { $size } belleğin üzerindeki her şey silinir ve yerine Luft yazılır. Bu işlem geri alınamaz.
stick-erase-confirm = Sil ve belleği hazırla
stick-done-title = Luft belleğiniz hazır
stick-done-ventoy-title = Luft, Ventoy belleğinizde
stick-done-take-out = Artık çıkarabilirsiniz.
stick-done-eject = Çıkarmadan önce güvenli bir şekilde kaldırın.
stick-done-start = Bellekten başlatmak için takın ve bilgisayarın önyükleme menüsünden seçin; bu menü bilgisayar açılır açılmaz F12, F8 ya da Esc gibi bir tuşla açılır.
stick-done-ventoy-key = Secure Boot açıksa Ventoy ilk başladığında kendi anahtarını kaydetmek için bir kez sorar.
stick-done = Bitti
stick-done-another = Bir tane daha hazırla
