## Sign-in screen, shown before anyone signs in

greeter-session = Sesija
greeter-accessibility = Pristupačnost
greeter-power = Napajanje
greeter-larger-text = Veći tekst
greeter-screen-reader = Čitač zaslona
greeter-suspend = Mirovanje
greeter-restart = Ponovno pokreni
greeter-power-off = Isključi
greeter-another-account = Drugi račun

## Lock screen

lock-screen-accessibility = Pristupačnost
lock-screen-power = Napajanje
lock-screen-battery = Baterija { $level }
lock-screen-screen-reader = Čitač zaslona
lock-screen-zoom = Povećalo
lock-screen-on-screen-keyboard = Zaslonska tipkovnica
lock-screen-high-contrast = Visoki kontrast
lock-screen-dwell-click = Klik zadržavanjem
lock-screen-larger-text = Veći tekst
lock-screen-suspend = Mirovanje
lock-screen-restart = Ponovno pokreni…
lock-screen-power-off = Isključi…
lock-inhibit-reason = Kestrel mora zaključati zaslon

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Spremi u skup ključeva
keyring-remember-for-app = Zapamti za ovu aplikaciju
keyring-fingerprint-allow = Dodirnite čitač otiska prsta da biste dopustili
keyring-fingerprint-alternative = Ili dodirnite čitač otiska prsta
keyring-confirm = Potvrda
keyring-allow = Dopusti
keyring-deny = Ne dopusti
keyring-password = Lozinka
keyring-mismatch = Unosi se ne podudaraju
keyring-unlock = Otključaj
keyring-cancel = Odustani

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Stvoriti pristupni ključ za { $site }?
passkeys-register-account-by-app = { $app } želi spremiti pristupni ključ za { $account }. Ključ ostaje na ovom računalu.
passkeys-register-account = Aplikacija želi spremiti pristupni ključ za { $account }. Ključ ostaje na ovom računalu.
passkeys-register-by-app = { $app } želi spremiti pristupni ključ. Ključ ostaje na ovom računalu.
passkeys-register = Aplikacija želi spremiti pristupni ključ. Ključ ostaje na ovom računalu.
passkeys-sign-in-title = Prijaviti se na { $site } pristupnim ključem?
passkeys-sign-in-choose-by-app = { $app } traži pristupni ključ. Odaberite račun za prijavu.
passkeys-sign-in-choose = Aplikacija traži pristupni ključ. Odaberite račun za prijavu.
passkeys-sign-in-by-app = { $app } traži vaš pristupni ključ.
passkeys-sign-in = Aplikacija traži vaš pristupni ključ.
passkeys-manage-title-by-app = Dopustiti da { $app } upravlja vašim pristupnim ključevima?
passkeys-manage-title = Dopustiti ovoj aplikaciji upravljanje vašim pristupnim ključevima?
passkeys-manage-description = Vidjet će za koje web-stranice imate pristupne ključeve i moći će ih ukloniti.
passkeys-registered-title = Već imate pristupni ključ za { $site }
passkeys-registered-description = Umjesto toga prijavite se postojećim ključem.
passkeys-choose-title = Koristiti pristupne ključeve na ovom računalu?
passkeys-choose-by-app = { $app } pita gdje se nalazi vaš pristupni ključ.
passkeys-choose = Aplikacija pita gdje se nalazi vaš pristupni ključ.
passkeys-use-password = Koristi lozinku
passkeys-password = Lozinka
passkeys-cancel = Odustani
passkeys-continue = Nastavi
passkeys-ok = U redu
passkeys-use-this-computer = Koristi ovo računalo
passkeys-fingerprint-unavailable = Za nastavak upotrijebite lozinku.
passkeys-wrong-password = Lozinka nije točna. Pokušajte ponovno.

## Sign-in prompt

auth-prompt-password = Lozinka
auth-prompt-username = Korisničko ime
auth-prompt-back = Natrag
auth-prompt-submit = Pošalji
auth-prompt-wrong-password = Ta lozinka nije ispravna
auth-prompt-failed = Nije uspjelo. Pokušajte ponovno.
fingerprint-not-recognized = Otisak prsta nije prepoznat

## Administrator authentication

polkit-title = Potrebna je provjera autentičnosti
polkit-administrator = Administrator
polkit-password = Lozinka
polkit-cancel = Odustani
polkit-authenticate = Potvrdi
polkit-failed = Nažalost, to nije uspjelo. Pokušajte ponovno.

## Log out, power off and restart dialog

end-session-log-out-user = Odjava korisnika { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekundu
    [few] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekunde
   *[other] Korisnik { $userName } automatski će se odjaviti za { $seconds } sekundi
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatski ćete se odjaviti za { $seconds } sekundu
    [few] Automatski ćete se odjaviti za { $seconds } sekunde
   *[other] Automatski ćete se odjaviti za { $seconds } sekundi
}
end-session-log-out-button = Odjava
end-session-power-off-title = Isključivanje
end-session-power-off-updates-title = Instaliranje ažuriranja i isključivanje
end-session-power-off-countdown = { $seconds ->
    [one] Sustav će se automatski isključiti za { $seconds } sekundu
    [few] Sustav će se automatski isključiti za { $seconds } sekunde
   *[other] Sustav će se automatski isključiti za { $seconds } sekundi
}
end-session-power-off-button = Isključi
end-session-restart-title = Ponovno pokretanje
end-session-restart-updates-title = Instaliranje ažuriranja i ponovno pokretanje
end-session-restart-countdown = { $seconds ->
    [one] Sustav će se automatski ponovno pokrenuti za { $seconds } sekundu
    [few] Sustav će se automatski ponovno pokrenuti za { $seconds } sekunde
   *[other] Sustav će se automatski ponovno pokrenuti za { $seconds } sekundi
}
end-session-restart-button = Ponovno pokreni
end-session-update-restart-title = Ponovno pokretanje i instaliranje ažuriranja
end-session-update-restart-countdown = { $seconds ->
    [one] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekundu
    [few] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekunde
   *[other] Sustav će se automatski ponovno pokrenuti i instalirati ažuriranja za { $seconds } sekundi
}
end-session-update-restart-button = Pokreni ponovno i instaliraj
end-session-install-updates = Instaliraj ažuriranja na čekanju
end-session-install-version = Instaliraj verziju { $version }
end-session-low-battery = Baterija je slaba: priključite napajanje prije instaliranja ažuriranja
end-session-busy-apps = Neke su aplikacije zauzete ili imaju nespremljen rad
end-session-other-users = Prijavljeni su i drugi korisnici
end-session-cancel = Odustani
end-session-boot-options = Mogućnosti pokretanja
end-session-remote-user = { $userName } (udaljeno)
end-session-console-user = { $userName } (konzola)

## Lock screen clock

lock-clock-swipe-up = Prijeđite prstom prema gore
lock-clock-click-or-press = Kliknite ili pritisnite tipku

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Prozor za otključavanje
