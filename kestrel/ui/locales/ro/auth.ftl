## Sign-in screen, shown before anyone signs in

greeter-session = Sesiune
greeter-accessibility = Accesibilitate
greeter-power = Alimentare
greeter-larger-text = Text mai mare
greeter-screen-reader = Cititor de ecran
greeter-suspend = Repaus
greeter-restart = Repornește
greeter-power-off = Oprește
greeter-another-account = Alt cont

## Lock screen

lock-screen-accessibility = Accesibilitate
lock-screen-power = Alimentare
lock-screen-battery = Baterie { $level }
lock-screen-screen-reader = Cititor de ecran
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Tastatură pe ecran
lock-screen-high-contrast = Contrast ridicat
lock-screen-dwell-click = Clic prin staționare
lock-screen-larger-text = Text mai mare
lock-screen-suspend = Repaus
lock-screen-restart = Repornește…
lock-screen-power-off = Oprește…
lock-inhibit-reason = Kestrel trebuie să blocheze ecranul

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Salvează în Portchei
keyring-remember-for-app = Ține minte pentru această aplicație
keyring-fingerprint-allow = Atingeți cititorul de amprente pentru a permite
keyring-fingerprint-alternative = Sau atingeți cititorul de amprente
keyring-confirm = Confirmați
keyring-allow = Permite
keyring-deny = Nu permite
keyring-password = Parolă
keyring-mismatch = Intrările nu se potrivesc
keyring-unlock = Deblochează
keyring-cancel = Anulează

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Creați o cheie de acces pentru { $site }?
passkeys-register-account-by-app = { $app } vrea să salveze o cheie de acces pentru { $account }. Aceasta rămâne pe acest computer.
passkeys-register-account = O aplicație vrea să salveze o cheie de acces pentru { $account }. Aceasta rămâne pe acest computer.
passkeys-register-by-app = { $app } vrea să salveze o cheie de acces. Aceasta rămâne pe acest computer.
passkeys-register = O aplicație vrea să salveze o cheie de acces. Aceasta rămâne pe acest computer.
passkeys-sign-in-title = Vă conectați la { $site } cu cheia de acces?
passkeys-sign-in-choose-by-app = { $app } cere o cheie de acces. Alegeți contul cu care vă conectați.
passkeys-sign-in-choose = O aplicație cere o cheie de acces. Alegeți contul cu care vă conectați.
passkeys-sign-in-by-app = { $app } cere cheia de acces.
passkeys-sign-in = O aplicație cere cheia de acces.
passkeys-manage-title-by-app = Permiteți ca { $app } să gestioneze cheile de acces?
passkeys-manage-title = Permiteți acestei aplicații să gestioneze cheile de acces?
passkeys-manage-description = Va vedea pentru ce site-uri aveți chei de acces și le va putea elimina.
passkeys-registered-title = Aveți deja o cheie de acces pentru { $site }
passkeys-registered-description = Conectați-vă cu cea existentă.
passkeys-choose-title = Folosiți cheile de acces de pe acest computer?
passkeys-choose-by-app = { $app } întreabă unde se află cheia de acces.
passkeys-choose = O aplicație întreabă unde se află cheia de acces.
passkeys-use-password = Folosește parola
passkeys-password = Parolă
passkeys-cancel = Anulează
passkeys-continue = Continuă
passkeys-ok = OK
passkeys-use-this-computer = Folosește acest computer
passkeys-fingerprint-unavailable = Folosiți parola pentru a continua.
passkeys-wrong-password = Parola nu este corectă. Încercați din nou.

## Sign-in prompt

auth-prompt-password = Parolă
auth-prompt-username = Nume de utilizator
auth-prompt-back = Înapoi
auth-prompt-submit = Trimite
auth-prompt-wrong-password = Parola nu a funcționat
auth-prompt-failed = Nu a funcționat. Încercați din nou.
fingerprint-not-recognized = Amprenta nu a fost recunoscută
fingerprint-scanning = Atingeți cititorul de amprente
fingerprint-retry-scan = Scanați din nou degetul
fingerprint-swipe-too-short = Glisarea a fost prea scurtă, încercați din nou
fingerprint-finger-not-centered = Centrați degetul și încercați din nou
fingerprint-remove-and-retry = Ridicați degetul și încercați din nou
fingerprint-unavailable = Amprenta nu este disponibilă, introduceți parola
auth-prompt-use-password = Folosește parola
auth-prompt-try-fingerprint = Încearcă din nou amprenta
auth-prompt-use-fingerprint = Folosește amprenta
auth-prompt-show-password = Afișează parola

## Administrator authentication

polkit-title = Este necesară autentificarea
polkit-administrator = Administrator
polkit-password = Parolă
polkit-cancel = Anulează
polkit-authenticate = Autentifică
polkit-failed = Nu a funcționat. Încercați din nou.

## Log out, power off and restart dialog

end-session-log-out-user = Deconectare { $userName }
end-session-log-out-title = Deconectare
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } se va deconecta automat în { $seconds } secundă
    [few] { $userName } se va deconecta automat în { $seconds } secunde
   *[other] { $userName } se va deconecta automat în { $seconds } de secunde
}
end-session-log-out-countdown = { $seconds ->
    [one] Vă veți deconecta automat în { $seconds } secundă
    [few] Vă veți deconecta automat în { $seconds } secunde
   *[other] Vă veți deconecta automat în { $seconds } de secunde
}
end-session-log-out-button = Deconectare
end-session-power-off-title = Oprire
end-session-power-off-updates-title = Instalează actualizările și oprește
end-session-power-off-countdown = { $seconds ->
    [one] Computerul se va opri automat în { $seconds } secundă
    [few] Computerul se va opri automat în { $seconds } secunde
   *[other] Computerul se va opri automat în { $seconds } de secunde
}
end-session-power-off-button = Oprește
end-session-restart-title = Repornire
end-session-restart-updates-title = Instalează actualizările și repornește
end-session-restart-countdown = { $seconds ->
    [one] Computerul va reporni automat în { $seconds } secundă
    [few] Computerul va reporni automat în { $seconds } secunde
   *[other] Computerul va reporni automat în { $seconds } de secunde
}
end-session-restart-button = Repornește
end-session-update-restart-title = Repornește și instalează actualizările
end-session-update-restart-countdown = { $seconds ->
    [one] Computerul va reporni automat și va instala actualizările în { $seconds } secundă
    [few] Computerul va reporni automat și va instala actualizările în { $seconds } secunde
   *[other] Computerul va reporni automat și va instala actualizările în { $seconds } de secunde
}
end-session-update-restart-button = Repornește și instalează
end-session-install-updates = Instalează actualizările în așteptare
end-session-install-version = Instalează versiunea { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Baterie descărcată: conectați încărcătorul înainte de a instala actualizările
end-session-busy-apps = Unele aplicații sunt ocupate sau au lucru nesalvat
end-session-other-users = Alți utilizatori sunt conectați
end-session-cancel = Anulează
end-session-boot-options = Opțiuni de pornire
end-session-remote-user = { $userName } (la distanță)
end-session-console-user = { $userName } (consolă)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Fereastra de deblocare
