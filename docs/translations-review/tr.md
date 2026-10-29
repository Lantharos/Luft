# Turkish review list

Strings in Luft's Turkish translation that a native speaker should check: terms with more than one established equivalent, labels that may clip, and sentences built around a placeable whose suffix depends on its value.

## Terms and shared strings

- `packages/i18n/glossary/tr.tbx` `Start`: "Başlat" — translated as in Windows; check that the name reads well in Luft, where it is also a taskbar button.
- `packages/i18n/glossary/tr.tbx` `board`: "tahta" — no settled term; pano is taken by the clipboard. Check it reads naturally in "Tahta görünümü" and "tahtada".
- `packages/i18n/glossary/tr.tbx` `snap`: "yasla", "yaslama düzeni", "yaslama grubu" — check against the current Windows 11 wording, which may say "Ek düzenleri".
- `packages/i18n/glossary/tr.tbx` `Install Luft`: "Luft’u yükle" — an imperative as an app name; "Luft kurulumu" is the alternative if a noun reads better in Start.
- `packages/i18n/glossary/tr.tbx` `Network Sign-In`: "Ağda oturum açma" — check it is clear as an app name.
- `packages/i18n/glossary/tr.tbx` `wallpaper`: "duvar kâğıdı" — dictionary spelling; many apps write "duvar kağıdı" without the circumflex.
- `packages/i18n/glossary/tr.tbx` `security chip`: "güvenlik çipi" — Windows Security says "güvenlik işlemcisi"; check which people recognize.
- `packages/i18n/glossary/tr.tbx` `firmware`: "üretici yazılımı" — Windows' word, but many people simply say "firmware".
- `packages/i18n/glossary/tr.tbx` `trash`: "Çöp kutusu" — Windows says "Geri Dönüşüm Kutusu", macOS "Çöp Sepeti", GNOME "Çöp"; check the choice.
- `packages/i18n/glossary/tr.tbx` `System Monitor`: "Sistem izleyici" — GNOME says "Sistem Gözetmeni".
- `packages/i18n/glossary/tr.tbx` `set up`: "kur" — "ayarla" fits some contexts better (setting up an account versus installing).
- `packages/web/ui/locales/tr/ui.ftl` `ui-fingerprint-place`: "Sensöre { $finger } yerleştirin." — the .inline forms carry the possessive and accusative (sağ işaret parmağınızı); check both sentences with every finger.
- `packages/web/ui/locales/tr/ui.ftl` `ui-select-placeholder`: "Seçin" — the only polite imperative used as a label; "Seçiniz" or "Seçim yapın" are the alternatives.
- `packages/web/ui/locales/tr/ui.ftl` `ui-split-windows-size`: "{ $size }, { $used } dolu" — check "dolu" reads clearly for space holding files.
- `packages/web/ui/locales/tr/ui.ftl` `ui-fingerprint-duplicate`: "Bu parmak okuyucuda zaten kayıtlı, büyük olasılıkla Windows ya da başka bir hesap tarafından." — check the elliptic second clause reads naturally.
- `apps/settings/locales/tr/settings.ftl` `settings-subpage-back`: "{ $page } sayfasına dön" — avoids a suffix on the page name; check it doesn't sound stiff for a screen reader.
- `packages/web/settings-pages/locales/tr/pages.ftl` `settings-page-mouse`: "Fare ve dokunmatik yüzey" — long for the sidebar; may clip.
- `kestrel/ui/locales/tr/shell.ftl` `battery-level`: "Pil %{ $percentage }, prize takılı" — for the plugged-in-but-not-charging state; check the wording.
- `kestrel/ui/locales/tr/shell.ftl` `keys-space`: "Boşluk" — the only translated key name; Windows docs sometimes say "Ara çubuğu".

## Kestrel and setup

- `kestrel/ui/locales/tr/desktop.ftl` `snap-zone`: "Genişliği %{ $width }, yüksekliği %{ $height } olan alana yasla" — check this reads naturally for a screen reader.
- `kestrel/ui/locales/tr/surfaces.ftl` `start-search-conversion`: "{ $amount } { $from }, { $to } cinsinden" — check it reads well with unit symbols such as "5 km, mi cinsinden".
- `kestrel/ui/locales/tr/surfaces.ftl` `start-search-wifi-on`: "Wi-Fi’ı aç" — suffix follows the "vay fay" pronunciation, as Windows does; confirm.
- `kestrel/ui/locales/tr/system.ftl` `privacy-indicator`: "Kullanımda: { $things }" — depends on how the list items are joined (ve); check the result reads well.
- `kestrel/ui/locales/tr/system.ftl` `health-gpu-reset-body`: "Bilgisayarınız kendiliğinden yeniden başladı: bugün, { $time }. …" — built to avoid a suffix on the time; check it doesn't feel stiff.
- `kestrel/ui/locales/tr/system.ftl` `caffeine-until`: "{ $time } saatine kadar" — avoids a suffix on the time placeable; check it sounds natural under the tile.
- `kestrel/ui/locales/tr/system.ftl` `network-menu-tether`: "Paylaşım" — short tile title for Bluetooth tethering; check it is clear enough.
- `kestrel/ui/locales/tr/desktop.ftl` `switch-monitor-join`: "Genişlet" — Windows' word for extending the desktop across displays.
- `kestrel/ui/locales/tr/portal.ftl` `portal-unknown-app-subject`: "Uygulama" — sentences with { $appName } avoid "uygulaması" after the placeable so this stand-in doesn't produce "Uygulama uygulaması"; check the sentences still read well with real app names.
- `apps/setup/locales/tr/setup.ftl` `setup-region-intro-guessed`: "Luft’u kuralım. Bazı seçimleri tahmin ettik: { $guesses }. Yanlış olanı değiştirin." — with guesses like "dil ve klavye bilgisayarınıza göre"; check the assembled sentence with two guesses joined by "ve".
- `apps/setup/locales/tr/setup.ftl` `setup-account-full-name-example`: "Cahit Arf" — a well-known Turkish mathematician, in the spirit of Ada Lovelace; confirm.
- `apps/setup/installer/locales/tr/installer.ftl` `installer-no-deployment`: "Yeni sistemde dağıtım yok" — technical ostree term; check dağıtım is understood.
- `kestrel/ui/locales/tr/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.

## Settings

- `apps/settings/locales/tr/connections.ftl` `settings-bluetooth-request-unnamed`: "Cihaz" — capitalized because every pairing sentence was built to start with { $name }; check the sentences still read well with a real device name.
- `apps/settings/locales/tr/connections.ftl` `settings-network-metered`: "Tarifeli bağlantı" — Windows' term; check it against "Ölçülü bağlantı", which the page keywords also list.
- `apps/settings/locales/tr/connections.ftl` `settings-network-proxy-port`: "Port" — chose "port" over GNOME's "Bağlantı noktası" to fit the short field; confirm.
- `apps/settings/locales/tr/connections.ftl` `settings-network-ip-routes`: "Rotalar" — GNOME's word; "Yönlendirmeler" is the alternative.
- `apps/settings/locales/tr/system.ftl` `settings-accounts-approve`: "İleri Düzey Veri Koruması’nı" — check Apple's current Turkish name for Advanced Data Protection.
- `apps/settings/locales/tr/devices.ftl` `settings-dictation-hold`: "Dikte için basılı tutun: { $keys }" — colon form avoids a suffix on { $keys } (e.g. "Super+Alt ya da Copilot tuşu"); check it reads naturally.
- `apps/settings/locales/tr/devices.ftl` `settings-power-capacity`: "Şu an { $full }, yeniyken { $design }" — rephrased from "X of Y when new".
- `apps/settings/locales/tr/devices.ftl` `settings-keys-keypad`: "Tuş takımı { $key }" — check what Turkish OSes print for number-pad keys; may clip on shortcut labels.
- `apps/settings/locales/tr/protection.ftl` `settings-encryption-passphrase-title` (and every passphrase string, also in setup): "Disk parolası seçin" — "passphrase" is rendered as "disk parolası" to keep it apart from the account "parola"; check it reads naturally.
- `apps/settings/locales/tr/protection.ftl` `settings-privacy-screen-off-after`: "{ $duration } sonra" — assumes $duration is a bare noun phrase like "5 dakika"; check with real values.
- `apps/settings/locales/tr/protection.ftl` `settings-encryption-drive-encrypting-paused`: "Bir sürücü şifreleniyor, { $percent } noktasında duraklatıldı" — "noktasında" avoids a suffix on the percent; may sound stiff.
- `apps/settings/locales/tr/protection.ftl` `settings-security-key-step-choose`: "{ $option } seçeneğini, ardından { $next } seçeneğini seçin." — placeables are English MokManager option names; "seçeneğini seçin" is repetitive, check for a smoother verb.
- `apps/settings/locales/tr/protection.ftl` `settings-security-anti-cheat`: "Hile önleyicili oyunlar" — no settled Turkish term for anti-cheat; some gamers just say "anti-cheat".
- `apps/settings/locales/tr/protection.ftl` `settings-passwords-stores`: "Uygulama oturumları" — "sign-ins" stored by apps; "oturum" might be read as a running session.
- `apps/settings/locales/tr/personalization.ftl` `settings-appearance-icons-clear`: "Şeffaf" — icon style "Clear" (glass-like); check it isn't read as "clear/empty".
- `apps/settings/locales/tr/personalization.ftl` `settings-appearance-tint-slate`: "Arduvaz" — accurate but uncommon colour name; "Kurşuni" may be friendlier.
- `apps/settings/locales/tr/system.ftl` `settings-updates-switching-standard`: "Standart sistem görüntüsü indiriliyor…" — "image" as in OS image; check "sistem görüntüsü" is understood and not read as a picture.
- `apps/settings/locales/tr/system.ftl` `settings-login-wallpaper-own`: "Kişiye özel" — choice "Their own" vs "Herkes için aynı"; check it is clear enough.
- `apps/settings/locales/tr/system.ftl` `settings-about-other-system`: "Kapladığı { $size } alanı Luft’a vermek için kaldırın" — check with real sizes.

## Website

- `web/site/locales/tr/download.ftl` `download-meet-note`: "önce Ek bilgi, ardından Yine de çalıştır seçeneğini seçin" — SmartScreen labels from memory of Turkish Windows; confirm against the real dialog.
- `web/site/locales/tr/download.ftl` `download-meet-for-windows`: "<span>Windows için</span> Meet Luft’u indir" — the hidden part moved to the front for natural word order; check it reads well with the span dimmed.
- `web/site/locales/tr/home.ftl` `home-question-ready-answer`: "gecelik sürümler" — for "nightly builds"; developers may expect "nightly" kept in English.
- `web/site/locales/tr/home.ftl` `home-motion-heading`: "Her hareketi yerinde." — free rendering of "It moves like it means it"; check it lands as a heading.

## Meet Luft

- `apps/meet/locales/tr/meet.ftl` `linux-ready-description`: "…her zamanki gibi başlayan sistem: { $system }." — a colon so the name needs no suffix and the fallback «bu sistem» isn't lowercase at the start of a sentence; the same in the other linux-ready lines and check-startup-uefi-linux. Check that it doesn't sound stiff.
- `apps/meet/locales/tr/meet.ftl` `ready-remove-description`: "taşınma kutusu" — "moving box"; check that the image comes across.
- `apps/meet/locales/tr/meet.ftl` `problem-tidy`: "önyükleme girdileri" — "start entries" in the firmware boot menu; check it against what firmware and Windows tools say.
- `apps/meet/locales/tr/meet.ftl` `meet-keep-it`: "Kalsın" — the button that keeps Luft instead of removing it; check that it reads clearly as a button.
- `apps/meet/desktop/locales/tr/desktop.ftl` `helper-registry-not-opened`: "Açılamadı: { $key } ({ $error })" — rebuilt as a colon form so the placeable needs no suffix; same pattern in several helper-, live- and stick- errors.
- `apps/meet/desktop/locales/tr/desktop.ftl` `check-secure-boot-off-detail`: "hile önleyicili oyunlar" — "games with anti-cheat"; gamers may expect "anti-cheat".
- `apps/meet/locales/tr/meet.ftl` `room-places-title`: "Luft nereye yerleşsin?" — echoes “yerleşmeden” from check-blocked-description; check it suits a choice between drives.
- `apps/meet/desktop/locales/tr/desktop.ftl` `check-space-erase-drive`: "{ $drive } diski silinirse o diskte ona yer var." — the conditional reads a little stiff; check the word order.
- `apps/meet/desktop/locales/tr/desktop.ftl` `helper-box-room-shortfall`: "Luft’un alanında { $available } GB ayrılabilir, seçtikleriniz ise { $needed } GB gerektiriyor." — "Luft’s room can spare" is the space already set aside for Luft; check that comes across.
