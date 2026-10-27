## Sign-in screen, shown before anyone signs in

greeter-session = Seja
greeter-accessibility = Dostopnost
greeter-power = Napajanje
greeter-larger-text = Večje besedilo
greeter-screen-reader = Bralnik zaslona
greeter-suspend = Spanje
greeter-restart = Vnovični zagon
greeter-power-off = Zaustavitev sistema
greeter-another-account = Drug račun

## Lock screen

lock-screen-accessibility = Dostopnost
lock-screen-power = Napajanje
lock-screen-battery = Baterija { $level }
lock-screen-screen-reader = Bralnik zaslona
lock-screen-zoom = Povečava
lock-screen-on-screen-keyboard = Zaslonska tipkovnica
lock-screen-high-contrast = Visok kontrast
lock-screen-dwell-click = Klik z zadržanjem kazalca
lock-screen-larger-text = Večje besedilo
lock-screen-suspend = Spanje
lock-screen-restart = Vnovični zagon …
lock-screen-power-off = Zaustavitev sistema …
lock-inhibit-reason = Kestrel mora zakleniti zaslon

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Shrani v zbirko ključev
keyring-remember-for-app = Zapomni si za to aplikacijo
keyring-fingerprint-allow = Za dovolitev se dotaknite bralnika prstnih odtisov
keyring-fingerprint-alternative = Ali pa se dotaknite bralnika prstnih odtisov
keyring-confirm = Potrditev
keyring-allow = Dovoli
keyring-deny = Ne dovoli
keyring-password = Geslo
keyring-mismatch = Vnosa se ne ujemata
keyring-unlock = Odkleni
keyring-cancel = Prekliči

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Želite ustvariti ključ za dostop za { $site }?
passkeys-register-account-by-app = Aplikacija { $app } želi shraniti ključ za dostop za { $account }. Ključ ostane v tem računalniku.
passkeys-register-account = Neka aplikacija želi shraniti ključ za dostop za { $account }. Ključ ostane v tem računalniku.
passkeys-register-by-app = Aplikacija { $app } želi shraniti ključ za dostop. Ključ ostane v tem računalniku.
passkeys-register = Neka aplikacija želi shraniti ključ za dostop. Ključ ostane v tem računalniku.
passkeys-sign-in-title = Se želite s ključem za dostop prijaviti v { $site }?
passkeys-sign-in-choose-by-app = Aplikacija { $app } zahteva ključ za dostop. Izberite račun za prijavo.
passkeys-sign-in-choose = Neka aplikacija zahteva ključ za dostop. Izberite račun za prijavo.
passkeys-sign-in-by-app = Aplikacija { $app } zahteva vaš ključ za dostop.
passkeys-sign-in = Neka aplikacija zahteva vaš ključ za dostop.
passkeys-manage-title-by-app = Ali naj aplikacija { $app } upravlja vaše ključe za dostop?
passkeys-manage-title = Ali naj ta aplikacija upravlja vaše ključe za dostop?
passkeys-manage-description = Videla bo, za katera spletna mesta imate ključe za dostop, in jih bo lahko odstranila.
passkeys-registered-title = Za { $site } že imate ključ za dostop
passkeys-registered-description = Namesto tega se prijavite z obstoječim ključem.
passkeys-choose-title = Želite uporabiti ključe za dostop v tem računalniku?
passkeys-choose-by-app = Aplikacija { $app } sprašuje, kje je vaš ključ za dostop.
passkeys-choose = Neka aplikacija sprašuje, kje je vaš ključ za dostop.
passkeys-use-password = Uporabi geslo
passkeys-password = Geslo
passkeys-cancel = Prekliči
passkeys-continue = Nadaljuj
passkeys-ok = V redu
passkeys-use-this-computer = Uporabi ta računalnik
passkeys-fingerprint-unavailable = Za nadaljevanje uporabite geslo.
passkeys-wrong-password = Geslo ni pravilno. Poskusite znova.

## Sign-in prompt

auth-prompt-password = Geslo
auth-prompt-username = Uporabniško ime
auth-prompt-back = Nazaj
auth-prompt-submit = Pošlji
auth-prompt-wrong-password = Geslo ni delovalo
auth-prompt-failed = To ni uspelo. Poskusite znova.
fingerprint-not-recognized = Prstni odtis ni prepoznan

## Administrator authentication

polkit-title = Potrebno je preverjanje pristnosti
polkit-administrator = Skrbnik
polkit-password = Geslo
polkit-cancel = Prekliči
polkit-authenticate = Preveri pristnost
polkit-failed = To ni uspelo. Poskusite znova.

## Log out, power off and restart dialog

end-session-log-out-user = Odjava – { $userName }
end-session-log-out-title = Odjava
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } – samodejna odjava čez { $seconds } sekundo
    [two] { $userName } – samodejna odjava čez { $seconds } sekundi
    [few] { $userName } – samodejna odjava čez { $seconds } sekunde
   *[other] { $userName } – samodejna odjava čez { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Samodejno boste odjavljeni čez { $seconds } sekundo
    [two] Samodejno boste odjavljeni čez { $seconds } sekundi
    [few] Samodejno boste odjavljeni čez { $seconds } sekunde
   *[other] Samodejno boste odjavljeni čez { $seconds } sekund
}
end-session-log-out-button = Odjava
end-session-power-off-title = Zaustavitev sistema
end-session-power-off-updates-title = Namesti posodobitve in zaustavi sistem
end-session-power-off-countdown = { $seconds ->
    [one] Sistem se bo samodejno zaustavil čez { $seconds } sekundo
    [two] Sistem se bo samodejno zaustavil čez { $seconds } sekundi
    [few] Sistem se bo samodejno zaustavil čez { $seconds } sekunde
   *[other] Sistem se bo samodejno zaustavil čez { $seconds } sekund
}
end-session-power-off-button = Zaustavi sistem
end-session-restart-title = Vnovični zagon
end-session-restart-updates-title = Namesti posodobitve in znova zaženi
end-session-restart-countdown = { $seconds ->
    [one] Sistem se bo samodejno znova zagnal čez { $seconds } sekundo
    [two] Sistem se bo samodejno znova zagnal čez { $seconds } sekundi
    [few] Sistem se bo samodejno znova zagnal čez { $seconds } sekunde
   *[other] Sistem se bo samodejno znova zagnal čez { $seconds } sekund
}
end-session-restart-button = Znova zaženi
end-session-update-restart-title = Znova zaženi in namesti posodobitve
end-session-update-restart-countdown = { $seconds ->
    [one] Sistem se bo čez { $seconds } sekundo samodejno znova zagnal in namestil posodobitve
    [two] Sistem se bo čez { $seconds } sekundi samodejno znova zagnal in namestil posodobitve
    [few] Sistem se bo čez { $seconds } sekunde samodejno znova zagnal in namestil posodobitve
   *[other] Sistem se bo čez { $seconds } sekund samodejno znova zagnal in namestil posodobitve
}
end-session-update-restart-button = Znova zaženi in namesti
end-session-install-updates = Namesti čakajoče posodobitve programske opreme
end-session-install-version = Namesti različico { $version }
end-session-version-nightly = { $release } nočna različica { $number }
end-session-low-battery = Baterija je skoraj prazna. Pred nameščanjem posodobitev priključite napajanje.
end-session-busy-apps = Nekatere aplikacije so zasedene ali imajo neshranjeno delo
end-session-other-users = Prijavljeni so drugi uporabniki
end-session-cancel = Prekliči
end-session-boot-options = Možnosti zagona
end-session-remote-user = { $userName } (oddaljeno)
end-session-console-user = { $userName } (konzola)

## Lock screen clock

lock-clock-swipe-up = Povlecite navzgor
lock-clock-click-or-press = Kliknite ali pritisnite tipko

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Okno za odklepanje
