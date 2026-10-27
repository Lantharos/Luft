## Sign-in screen, shown before anyone signs in

greeter-session = Sesija
greeter-accessibility = Pristupačnost
greeter-power = Napajanje
greeter-larger-text = Veći tekst
greeter-screen-reader = Čitač ekrana
greeter-suspend = Spavanje
greeter-restart = Ponovo pokreni
greeter-power-off = Isključi
greeter-another-account = Drugi nalog

## Lock screen

lock-screen-accessibility = Pristupačnost
lock-screen-power = Napajanje
lock-screen-battery = Baterija { $level }
lock-screen-screen-reader = Čitač ekrana
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Tastatura na ekranu
lock-screen-high-contrast = Visok kontrast
lock-screen-dwell-click = Klik zadržavanjem
lock-screen-larger-text = Veći tekst
lock-screen-suspend = Spavanje
lock-screen-restart = Ponovo pokreni…
lock-screen-power-off = Isključi…
lock-inhibit-reason = Kestrel mora da zaključa ekran

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Sačuvaj u privesku ključeva
keyring-remember-for-app = Zapamti za ovu aplikaciju
keyring-fingerprint-allow = Dodirnite čitač otiska prsta da biste dozvolili
keyring-fingerprint-alternative = Ili dodirnite čitač otiska prsta
keyring-confirm = Potvrdite
keyring-allow = Dozvoli
keyring-deny = Ne dozvoli
keyring-password = Lozinka
keyring-mismatch = Unosi se ne podudaraju
keyring-unlock = Otključaj
keyring-cancel = Otkaži

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Napraviti pristupni ključ za { $site }?
passkeys-register-account-by-app = { $app } želi da sačuva pristupni ključ za { $account }. On ostaje na ovom računaru.
passkeys-register-account = Aplikacija želi da sačuva pristupni ključ za { $account }. On ostaje na ovom računaru.
passkeys-register-by-app = { $app } želi da sačuva pristupni ključ. On ostaje na ovom računaru.
passkeys-register = Aplikacija želi da sačuva pristupni ključ. On ostaje na ovom računaru.
passkeys-sign-in-title = Prijaviti se na { $site } pristupnim ključem?
passkeys-sign-in-choose-by-app = { $app } traži pristupni ključ. Izaberite nalog kojim ćete se prijaviti.
passkeys-sign-in-choose = Aplikacija traži pristupni ključ. Izaberite nalog kojim ćete se prijaviti.
passkeys-sign-in-by-app = { $app } traži vaš pristupni ključ.
passkeys-sign-in = Aplikacija traži vaš pristupni ključ.
passkeys-manage-title-by-app = Dozvoliti da { $app } upravlja vašim pristupnim ključevima?
passkeys-manage-title = Dozvoliti ovoj aplikaciji da upravlja vašim pristupnim ključevima?
passkeys-manage-description = Videće za koje sajtove imate pristupne ključeve i moći će da ih ukloni.
passkeys-registered-title = Već imate pristupni ključ za { $site }
passkeys-registered-description = Umesto toga se prijavite onim koji već imate.
passkeys-choose-title = Koristiti pristupne ključeve sa ovog računara?
passkeys-choose-by-app = { $app } pita gde se nalazi vaš pristupni ključ.
passkeys-choose = Aplikacija pita gde se nalazi vaš pristupni ključ.
passkeys-use-password = Koristi lozinku
passkeys-password = Lozinka
passkeys-cancel = Otkaži
passkeys-continue = Nastavi
passkeys-ok = U redu
passkeys-use-this-computer = Koristi ovaj računar
passkeys-fingerprint-unavailable = Unesite lozinku da biste nastavili.
passkeys-wrong-password = Lozinka nije tačna. Pokušajte ponovo.

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Nazad
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Lozinka nije tačna
auth-prompt-failed = Nije uspelo. Pokušajte ponovo.
fingerprint-not-recognized = Otisak prsta nije prepoznat

## Administrator authentication

polkit-title = Potrebna je potvrda identiteta
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Otkaži
polkit-authenticate = Potvrdi
polkit-failed = Nije uspelo. Pokušajte ponovo.

## Log out, power off and restart dialog

end-session-log-out-user = Odjava: { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekundu
    [few] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekunde
   *[other] Korisnik { $userName } će automatski biti odjavljen za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatska odjava za { $seconds } sekundu
    [few] Automatska odjava za { $seconds } sekunde
   *[other] Automatska odjava za { $seconds } sekundi
}
end-session-log-out-button = Odjavi se
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sistem će se automatski isključiti za { $seconds } sekundu
    [few] Sistem će se automatski isključiti za { $seconds } sekunde
   *[other] Sistem će se automatski isključiti za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sistem će se automatski ponovo pokrenuti za { $seconds } sekundu
    [few] Sistem će se automatski ponovo pokrenuti za { $seconds } sekunde
   *[other] Sistem će se automatski ponovo pokrenuti za { $seconds } sekundi
}
end-session-restart-button = Ponovo pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekundu
    [few] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekunde
   *[other] Sistem će se automatski ponovo pokrenuti i instalirati ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Ponovo pokreni i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-version-nightly = { $release } noćna verzija { $number }
end-session-low-battery = Baterija je skoro prazna: priključite punjač pre instaliranja ažuriranja
end-session-busy-apps = Neke aplikacije su zauzete ili imaju nesačuvan rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Otkaži
end-session-boot-options = Opcije pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Lock screen clock

lock-clock-swipe-up = Prevucite nagore
lock-clock-click-or-press = Kliknite ili pritisnite taster

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Prozor za otključavanje
