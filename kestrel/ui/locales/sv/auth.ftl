## Sign-in screen, shown before anyone signs in

greeter-session = Session
greeter-accessibility = Hjälpmedel
greeter-power = Ström
greeter-larger-text = Större text
greeter-screen-reader = Skärmläsare
greeter-suspend = Viloläge
greeter-restart = Starta om
greeter-power-off = Stäng av
greeter-another-account = Ett annat konto

## Lock screen

lock-screen-accessibility = Hjälpmedel
lock-screen-power = Ström
lock-screen-battery = Batteri { $level }
lock-screen-screen-reader = Skärmläsare
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Skärmtangentbord
lock-screen-high-contrast = Hög kontrast
lock-screen-dwell-click = Vilande klick
lock-screen-larger-text = Större text
lock-screen-suspend = Viloläge
lock-screen-restart = Starta om …
lock-screen-power-off = Stäng av …
lock-inhibit-reason = Kestrel behöver låsa skärmen

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Spara i nyckelringen
keyring-remember-for-app = Kom ihåg för den här appen
keyring-fingerprint-allow = Rör vid fingeravtrycksläsaren för att tillåta
keyring-fingerprint-alternative = Eller rör vid fingeravtrycksläsaren
keyring-confirm = Bekräfta
keyring-allow = Tillåt
keyring-deny = Tillåt inte
keyring-password = Lösenord
keyring-mismatch = Inmatningarna stämmer inte överens
keyring-unlock = Lås upp
keyring-cancel = Avbryt

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vill du skapa en lösennyckel för { $site }?
passkeys-register-account-by-app = { $app } vill spara en lösennyckel för { $account }. Den stannar på den här datorn.
passkeys-register-account = En app vill spara en lösennyckel för { $account }. Den stannar på den här datorn.
passkeys-register-by-app = { $app } vill spara en lösennyckel. Den stannar på den här datorn.
passkeys-register = En app vill spara en lösennyckel. Den stannar på den här datorn.
passkeys-sign-in-title = Vill du logga in på { $site } med din lösennyckel?
passkeys-sign-in-choose-by-app = { $app } ber om en lösennyckel. Välj kontot du vill logga in med.
passkeys-sign-in-choose = En app ber om en lösennyckel. Välj kontot du vill logga in med.
passkeys-sign-in-by-app = { $app } ber om din lösennyckel.
passkeys-sign-in = En app ber om din lösennyckel.
passkeys-manage-title-by-app = Vill du låta { $app } hantera dina lösennycklar?
passkeys-manage-title = Vill du låta den här appen hantera dina lösennycklar?
passkeys-manage-description = Den kommer att se vilka webbplatser du har lösennycklar för och kan ta bort dem.
passkeys-registered-title = Du har redan en lösennyckel för { $site }
passkeys-registered-description = Logga in med den du har i stället.
passkeys-choose-title = Vill du använda lösennycklarna på den här datorn?
passkeys-choose-by-app = { $app } frågar var din lösennyckel finns.
passkeys-choose = En app frågar var din lösennyckel finns.
passkeys-use-password = Använd lösenord
passkeys-password = Lösenord
passkeys-cancel = Avbryt
passkeys-continue = Fortsätt
passkeys-ok = OK
passkeys-use-this-computer = Använd den här datorn
passkeys-fingerprint-unavailable = Använd ditt lösenord för att fortsätta.
passkeys-wrong-password = Lösenordet stämmer inte. Försök igen.

## Sign-in prompt

auth-prompt-password = Lösenord
auth-prompt-username = Användarnamn
auth-prompt-back = Tillbaka
auth-prompt-submit = Skicka
auth-prompt-wrong-password = Lösenordet fungerade inte
auth-prompt-failed = Det fungerade inte. Försök igen.
fingerprint-not-recognized = Fingeravtrycket kändes inte igen
fingerprint-scanning = Rör vid fingeravtrycksläsaren
fingerprint-retry-scan = Skanna fingret igen
fingerprint-swipe-too-short = Svepningen var för kort, försök igen
fingerprint-finger-not-centered = Placera fingret i mitten och försök igen
fingerprint-remove-and-retry = Lyft fingret och försök igen
fingerprint-unavailable = Fingeravtryck är inte tillgängligt, ange ditt lösenord
auth-prompt-use-password = Använd lösenord i stället
auth-prompt-try-fingerprint = Försök med fingeravtryck igen
auth-prompt-use-fingerprint = Använd fingeravtryck
auth-prompt-show-password = Visa lösenord

## Administrator authentication

polkit-title = Autentisering krävs
polkit-administrator = Administratör
polkit-password = Lösenord
polkit-cancel = Avbryt
polkit-authenticate = Autentisera
polkit-failed = Det fungerade inte. Försök igen.

## Log out, power off and restart dialog

end-session-log-out-user = Logga ut { $userName }
end-session-log-out-title = Logga ut
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } loggas ut automatiskt om { $seconds } sekund
   *[other] { $userName } loggas ut automatiskt om { $seconds } sekunder
}
end-session-log-out-countdown = { $seconds ->
    [one] Du loggas ut automatiskt om { $seconds } sekund
   *[other] Du loggas ut automatiskt om { $seconds } sekunder
}
end-session-log-out-button = Logga ut
end-session-power-off-title = Stäng av
end-session-power-off-updates-title = Installera uppdateringar och stäng av
end-session-power-off-countdown = { $seconds ->
    [one] Datorn stängs av automatiskt om { $seconds } sekund
   *[other] Datorn stängs av automatiskt om { $seconds } sekunder
}
end-session-power-off-button = Stäng av
end-session-restart-title = Starta om
end-session-restart-updates-title = Installera uppdateringar och starta om
end-session-restart-countdown = { $seconds ->
    [one] Datorn startas om automatiskt om { $seconds } sekund
   *[other] Datorn startas om automatiskt om { $seconds } sekunder
}
end-session-restart-button = Starta om
end-session-update-restart-title = Starta om och installera uppdateringar
end-session-update-restart-countdown = { $seconds ->
    [one] Datorn startas om och installerar uppdateringar automatiskt om { $seconds } sekund
   *[other] Datorn startas om och installerar uppdateringar automatiskt om { $seconds } sekunder
}
end-session-update-restart-button = Starta om och installera
end-session-install-updates = Installera väntande programuppdateringar
end-session-install-version = Installera version { $version }
end-session-version-nightly = { $release } nattligt bygge { $number }
end-session-low-battery = Låg batterinivå. Anslut laddaren innan du installerar uppdateringar.
end-session-busy-apps = Vissa appar är upptagna eller har osparat arbete
end-session-other-users = Andra användare är inloggade
end-session-cancel = Avbryt
end-session-boot-options = Startalternativ
end-session-remote-user = { $userName } (fjärr)
end-session-console-user = { $userName } (konsol)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Upplåsning
