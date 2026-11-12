## Sign-in screen, shown before anyone signs in

greeter-session = Relace
greeter-accessibility = Přístupnost
greeter-power = Napájení
greeter-larger-text = Větší text
greeter-screen-reader = Čtečka obrazovky
greeter-suspend = Režim spánku
greeter-restart = Restartovat
greeter-power-off = Vypnout
greeter-another-account = Jiný účet

## Lock screen

lock-screen-accessibility = Přístupnost
lock-screen-power = Napájení
lock-screen-battery = Baterie { $level }
lock-screen-screen-reader = Čtečka obrazovky
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Klávesnice na obrazovce
lock-screen-high-contrast = Vysoký kontrast
lock-screen-dwell-click = Kliknutí podržením ukazatele
lock-screen-larger-text = Větší text
lock-screen-suspend = Režim spánku
lock-screen-restart = Restartovat…
lock-screen-power-off = Vypnout…
lock-inhibit-reason = Kestrel musí zamknout obrazovku

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Uložit do klíčenky
keyring-remember-for-app = Zapamatovat pro tuto aplikaci
keyring-fingerprint-allow = Povolte dotykem čtečky otisků prstů
keyring-fingerprint-alternative = Nebo se dotkněte čtečky otisků prstů
keyring-confirm = Potvrzení
keyring-allow = Povolit
keyring-deny = Nepovolit
keyring-password = Heslo
keyring-mismatch = Zadání se neshodují
keyring-unlock = Odemknout
keyring-cancel = Zrušit

## Sign-in prompt

auth-prompt-password = Heslo
auth-prompt-username = Uživatelské jméno
auth-prompt-back = Zpět
auth-prompt-submit = Odeslat
auth-prompt-wrong-password = Heslo není správné
auth-prompt-failed = Nepodařilo se. Zkuste to znovu.
fingerprint-not-recognized = Otisk prstu nebyl rozpoznán
fingerprint-scanning = Dotkněte se čtečky otisků prstů
fingerprint-retry-scan = Naskenujte prst znovu
fingerprint-swipe-too-short = Přejetí bylo příliš krátké, zkuste to znovu
fingerprint-finger-not-centered = Položte prst doprostřed a zkuste to znovu
fingerprint-remove-and-retry = Zvedněte prst a zkuste to znovu
fingerprint-unavailable = Otisk prstu není k dispozici, zadejte heslo
auth-prompt-use-password = Použít heslo
auth-prompt-try-fingerprint = Zkusit znovu otisk prstu
auth-prompt-use-fingerprint = Použít otisk prstu
auth-prompt-show-password = Zobrazit heslo

## Administrator authentication

polkit-title = Vyžaduje se ověření
polkit-administrator = Správce
polkit-password = Heslo
polkit-cancel = Zrušit
polkit-authenticate = Ověřit
polkit-failed = Nepodařilo se. Zkuste to znovu.

## Log out, power off and restart dialog

end-session-log-out-user = Odhlásit uživatele { $userName }
end-session-log-out-title = Odhlásit se
end-session-log-out-user-countdown = { $seconds ->
    [one] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundu
    [few] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundy
    [many] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekundy
   *[other] Uživatel { $userName } bude automaticky odhlášen za { $seconds } sekund
}
end-session-log-out-countdown = { $seconds ->
    [one] Automatické odhlášení za { $seconds } sekundu
    [few] Automatické odhlášení za { $seconds } sekundy
    [many] Automatické odhlášení za { $seconds } sekundy
   *[other] Automatické odhlášení za { $seconds } sekund
}
end-session-log-out-button = Odhlásit se
end-session-power-off-title = Vypnout
end-session-power-off-updates-title = Nainstalovat aktualizace a vypnout
end-session-power-off-countdown = { $seconds ->
    [one] Počítač se automaticky vypne za { $seconds } sekundu
    [few] Počítač se automaticky vypne za { $seconds } sekundy
    [many] Počítač se automaticky vypne za { $seconds } sekundy
   *[other] Počítač se automaticky vypne za { $seconds } sekund
}
end-session-power-off-button = Vypnout
end-session-restart-title = Restartovat
end-session-restart-updates-title = Nainstalovat aktualizace a restartovat
end-session-restart-countdown = { $seconds ->
    [one] Počítač se automaticky restartuje za { $seconds } sekundu
    [few] Počítač se automaticky restartuje za { $seconds } sekundy
    [many] Počítač se automaticky restartuje za { $seconds } sekundy
   *[other] Počítač se automaticky restartuje za { $seconds } sekund
}
end-session-restart-button = Restartovat
end-session-update-restart-title = Restartovat a nainstalovat aktualizace
end-session-update-restart-countdown = { $seconds ->
    [one] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundu
    [few] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundy
    [many] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekundy
   *[other] Počítač se automaticky restartuje a nainstaluje aktualizace za { $seconds } sekund
}
end-session-update-restart-button = Restartovat a nainstalovat
end-session-install-updates = Nainstalovat čekající aktualizace
end-session-install-version = Nainstalovat verzi { $version }
end-session-version-nightly = { $release } noční sestavení { $number }
end-session-low-battery = Baterie je slabá. Před instalací aktualizací připojte napájení.
end-session-busy-apps = Některé aplikace pracují nebo mají neuložená data
end-session-other-users = Jsou přihlášeni i další uživatelé
end-session-cancel = Zrušit
end-session-boot-options = Možnosti spuštění
end-session-remote-user = { $userName } (vzdáleně)
end-session-console-user = { $userName } (konzole)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Odemknutí
