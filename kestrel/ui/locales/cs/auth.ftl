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

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vytvořit přístupový klíč pro { $site }?
passkeys-register-account-by-app = { $app } chce uložit přístupový klíč pro { $account }. Zůstane v tomto počítači.
passkeys-register-account = Aplikace chce uložit přístupový klíč pro { $account }. Zůstane v tomto počítači.
passkeys-register-by-app = { $app } chce uložit přístupový klíč. Zůstane v tomto počítači.
passkeys-register = Aplikace chce uložit přístupový klíč. Zůstane v tomto počítači.
passkeys-sign-in-title = Přihlásit se k { $site } pomocí přístupového klíče?
passkeys-sign-in-choose-by-app = { $app } žádá o přístupový klíč. Vyberte účet, kterým se chcete přihlásit.
passkeys-sign-in-choose = Aplikace žádá o přístupový klíč. Vyberte účet, kterým se chcete přihlásit.
passkeys-sign-in-by-app = { $app } žádá o váš přístupový klíč.
passkeys-sign-in = Aplikace žádá o váš přístupový klíč.
passkeys-manage-title-by-app = Povolit aplikaci { $app } spravovat vaše přístupové klíče?
passkeys-manage-title = Povolit této aplikaci spravovat vaše přístupové klíče?
passkeys-manage-description = Uvidí, pro které weby máte přístupové klíče, a bude je moct odstranit.
passkeys-registered-title = Pro { $site } už přístupový klíč máte
passkeys-registered-description = Přihlaste se tím, který už máte.
passkeys-choose-title = Použít přístupové klíče v tomto počítači?
passkeys-choose-by-app = { $app } se ptá, kde máte přístupový klíč.
passkeys-choose = Aplikace se ptá, kde máte přístupový klíč.
passkeys-use-password = Použít heslo
passkeys-password = Heslo
passkeys-cancel = Zrušit
passkeys-continue = Pokračovat
passkeys-ok = OK
passkeys-use-this-computer = Použít tento počítač
passkeys-fingerprint-unavailable = Pokračujte zadáním hesla.
passkeys-wrong-password = Heslo není správné. Zkuste to znovu.

## Sign-in prompt

auth-prompt-password = Heslo
auth-prompt-username = Uživatelské jméno
auth-prompt-back = Zpět
auth-prompt-submit = Odeslat
auth-prompt-wrong-password = Heslo není správné
auth-prompt-failed = Nepodařilo se. Zkuste to znovu.
fingerprint-not-recognized = Otisk prstu nebyl rozpoznán

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

lock-clock-swipe-up = Přejeďte nahoru
lock-clock-click-or-press = Klikněte nebo stiskněte klávesu

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Odemknutí
