## Sign-in screen, shown before anyone signs in

greeter-session = Sesija
greeter-accessibility = Pieejamība
greeter-power = Barošana
greeter-larger-text = Lielāks teksts
greeter-screen-reader = Ekrāna lasītājs
greeter-suspend = Miega režīms
greeter-restart = Restartēt
greeter-power-off = Izslēgt
greeter-another-account = Cits konts

## Lock screen

lock-screen-accessibility = Pieejamība
lock-screen-power = Barošana
lock-screen-battery = Akumulators { $level }
lock-screen-screen-reader = Ekrāna lasītājs
lock-screen-zoom = Tālummaiņa
lock-screen-on-screen-keyboard = Ekrāntastatūra
lock-screen-high-contrast = Augsts kontrasts
lock-screen-dwell-click = Klikšķis ar aizturi
lock-screen-larger-text = Lielāks teksts
lock-screen-suspend = Miega režīms
lock-screen-restart = Restartēt…
lock-screen-power-off = Izslēgt…
lock-inhibit-reason = Kestrel jābloķē ekrāns

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Saglabāt atslēgu saišķī
keyring-remember-for-app = Atcerēties šai lietotnei
keyring-fingerprint-allow = Lai atļautu, pieskarieties pirkstu nospiedumu lasītājam
keyring-fingerprint-alternative = Vai pieskarieties pirkstu nospiedumu lasītājam
keyring-confirm = Apstiprināt
keyring-allow = Atļaut
keyring-deny = Neatļaut
keyring-password = Parole
keyring-mismatch = Ievadītās vērtības nesakrīt
keyring-unlock = Atbloķēt
keyring-cancel = Atcelt

## Sign-in prompt

auth-prompt-password = Parole
auth-prompt-username = Lietotājvārds
auth-prompt-back = Atpakaļ
auth-prompt-submit = Iesniegt
auth-prompt-wrong-password = Parole neder
auth-prompt-failed = Neizdevās. Mēģiniet vēlreiz.
fingerprint-not-recognized = Pirksta nospiedums netika atpazīts
fingerprint-scanning = Pieskarieties pirkstu nospiedumu lasītājam
fingerprint-retry-scan = Skenējiet pirkstu vēlreiz
fingerprint-swipe-too-short = Pārvilkums bija pārāk īss, mēģiniet vēlreiz
fingerprint-finger-not-centered = Novietojiet pirkstu centrā un mēģiniet vēlreiz
fingerprint-remove-and-retry = Paceliet pirkstu un mēģiniet vēlreiz
fingerprint-unavailable = Pirksta nospiedums nav pieejams, ievadiet paroli
auth-prompt-use-password = Izmantot paroli
auth-prompt-try-fingerprint = Mēģināt pirksta nospiedumu vēlreiz
auth-prompt-use-fingerprint = Izmantot pirksta nospiedumu
auth-prompt-show-password = Rādīt paroli

## Administrator authentication

polkit-title = Nepieciešama autentifikācija
polkit-administrator = Administrators
polkit-password = Parole
polkit-cancel = Atcelt
polkit-authenticate = Autentificēt
polkit-failed = Neizdevās. Mēģiniet vēlreiz.

## Log out, power off and restart dialog

end-session-log-out-user = Izrakstīt: { $userName }
end-session-log-out-title = Izrakstīties
end-session-log-out-user-countdown = { $seconds ->
    [zero] Automātiska izrakstīšanās pēc { $seconds } sekundēm: { $userName }
    [one] Automātiska izrakstīšanās pēc { $seconds } sekundes: { $userName }
   *[other] Automātiska izrakstīšanās pēc { $seconds } sekundēm: { $userName }
}
end-session-log-out-countdown = { $seconds ->
    [zero] Automātiska izrakstīšanās pēc { $seconds } sekundēm
    [one] Automātiska izrakstīšanās pēc { $seconds } sekundes
   *[other] Automātiska izrakstīšanās pēc { $seconds } sekundēm
}
end-session-log-out-button = Izrakstīties
end-session-power-off-title = Izslēgt
end-session-power-off-updates-title = Instalēt atjauninājumus un izslēgt
end-session-power-off-countdown = { $seconds ->
    [zero] Sistēma automātiski izslēgsies pēc { $seconds } sekundēm
    [one] Sistēma automātiski izslēgsies pēc { $seconds } sekundes
   *[other] Sistēma automātiski izslēgsies pēc { $seconds } sekundēm
}
end-session-power-off-button = Izslēgt
end-session-restart-title = Restartēt
end-session-restart-updates-title = Instalēt atjauninājumus un restartēt
end-session-restart-countdown = { $seconds ->
    [zero] Sistēma automātiski restartēsies pēc { $seconds } sekundēm
    [one] Sistēma automātiski restartēsies pēc { $seconds } sekundes
   *[other] Sistēma automātiski restartēsies pēc { $seconds } sekundēm
}
end-session-restart-button = Restartēt
end-session-update-restart-title = Restartēt un instalēt atjauninājumus
end-session-update-restart-countdown = { $seconds ->
    [zero] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundēm
    [one] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundes
   *[other] Sistēma automātiski restartēsies un instalēs atjauninājumus pēc { $seconds } sekundēm
}
end-session-update-restart-button = Restartēt un instalēt
end-session-install-updates = Instalēt gaidošos programmatūras atjauninājumus
end-session-install-version = Instalēt versiju { $version }
end-session-version-nightly = { $release } nakts būvējums { $number }
end-session-low-battery = Zems akumulatora līmenis: pirms atjauninājumu instalēšanas pievienojiet lādētāju
end-session-busy-apps = Dažas lietotnes ir aizņemtas vai tajās ir nesaglabāts darbs
end-session-other-users = Ir pierakstījušies citi lietotāji
end-session-cancel = Atcelt
end-session-boot-options = Sāknēšanas opcijas
end-session-remote-user = { $userName } (attālināti)
end-session-console-user = { $userName } (konsole)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Atbloķēšanas logs
