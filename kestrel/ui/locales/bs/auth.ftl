## Sign-in screen, shown before anyone signs in

greeter-session = Sesija
greeter-accessibility = Pristupačnost
greeter-power = Napajanje
greeter-larger-text = Veći tekst
greeter-screen-reader = Čitač ekrana
greeter-suspend = Mirovanje
greeter-restart = Ponovo pokreni
greeter-power-off = Isključi
greeter-another-account = Drugi račun

## Lock screen

lock-screen-accessibility = Pristupačnost
lock-screen-power = Napajanje
lock-screen-battery = Baterija { $level }
lock-screen-screen-reader = Čitač ekrana
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Tastatura na ekranu
lock-screen-high-contrast = Visoki kontrast
lock-screen-dwell-click = Klik zadržavanjem
lock-screen-larger-text = Veći tekst
lock-screen-suspend = Mirovanje
lock-screen-restart = Ponovo pokreni…
lock-screen-power-off = Isključi…
lock-inhibit-reason = Kestrel mora zaključati ekran

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Sačuvaj u privjesku ključeva
keyring-remember-for-app = Zapamti za ovu aplikaciju
keyring-fingerprint-allow = Dodirnite čitač otiska prsta da dozvolite
keyring-fingerprint-alternative = Ili dodirnite čitač otiska prsta
keyring-confirm = Potvrda
keyring-allow = Dozvoli
keyring-deny = Ne dozvoli
keyring-password = Lozinka
keyring-mismatch = Unosi se ne podudaraju
keyring-unlock = Otključaj
keyring-cancel = Otkaži

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Nazad
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Ta lozinka nije ispravna
auth-prompt-failed = Nije uspjelo. Pokušajte ponovo.
fingerprint-not-recognized = Otisak prsta nije prepoznat
fingerprint-scanning = Dodirnite čitač otiska prsta
fingerprint-retry-scan = Ponovo skenirajte prst
fingerprint-swipe-too-short = Prevlačenje je bilo prekratko, pokušajte ponovo
fingerprint-finger-not-centered = Postavite prst u sredinu i pokušajte ponovo
fingerprint-remove-and-retry = Podignite prst i pokušajte ponovo
fingerprint-unavailable = Otisak prsta nije dostupan, unesite lozinku
auth-prompt-use-password = Koristi lozinku
auth-prompt-try-fingerprint = Ponovo pokušaj otiskom prsta
auth-prompt-use-fingerprint = Koristi otisak prsta
auth-prompt-show-password = Prikaži lozinku

## Administrator authentication

polkit-title = Potrebna je autentifikacija
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Otkaži
polkit-authenticate = Potvrdi
polkit-failed = Nažalost, nije uspjelo. Pokušajte ponovo.

## Log out, power off and restart dialog

end-session-log-out-user = Odjava: { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } se automatski odjavljuje za { $seconds } sekundu
    [few] { $userName } se automatski odjavljuje za { $seconds } sekunde
   *[other] { $userName } se automatski odjavljuje za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatski ćete biti odjavljeni za { $seconds } sekundu
    [few] Automatski ćete biti odjavljeni za { $seconds } sekunde
   *[other] Automatski ćete biti odjavljeni za { $seconds } sekundi
}
end-session-log-out-button = Odjava
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sistem se automatski isključuje za { $seconds } sekundu
    [few] Sistem se automatski isključuje za { $seconds } sekunde
   *[other] Sistem se automatski isključuje za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sistem se automatski ponovo pokreće za { $seconds } sekundu
    [few] Sistem se automatski ponovo pokreće za { $seconds } sekunde
   *[other] Sistem se automatski ponovo pokreće za { $seconds } sekundi
}
end-session-restart-button = Ponovo pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekundu
    [few] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekunde
   *[other] Sistem se automatski ponovo pokreće i instalira ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Ponovo pokreni i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-version-nightly = { $release } noćna verzija { $number }
end-session-low-battery = Baterija je slaba: priključite punjač prije instaliranja ažuriranja
end-session-busy-apps = Neke aplikacije su zauzete ili imaju nesačuvan rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Otkaži
end-session-boot-options = Opcije pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Prozor za otključavanje
