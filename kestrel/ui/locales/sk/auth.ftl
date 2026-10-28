## Sign-in screen, shown before anyone signs in

greeter-session = Relácia
greeter-accessibility = Prístupnosť
greeter-power = Napájanie
greeter-larger-text = Väčší text
greeter-screen-reader = Čítačka obrazovky
greeter-suspend = Režim spánku
greeter-restart = Reštartovať
greeter-power-off = Vypnúť
greeter-another-account = Iný účet

## Lock screen

lock-screen-accessibility = Prístupnosť
lock-screen-power = Napájanie
lock-screen-battery = Batéria { $level }
lock-screen-screen-reader = Čítačka obrazovky
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Klávesnica na obrazovke
lock-screen-high-contrast = Vysoký kontrast
lock-screen-dwell-click = Kliknutie zotrvaním
lock-screen-larger-text = Väčší text
lock-screen-suspend = Režim spánku
lock-screen-restart = Reštartovať…
lock-screen-power-off = Vypnúť…
lock-inhibit-reason = Kestrel musí zamknúť obrazovku

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Uložiť do zväzku kľúčov
keyring-remember-for-app = Zapamätať pre túto aplikáciu
keyring-fingerprint-allow = Povoľte to dotykom snímača odtlačkov prstov
keyring-fingerprint-alternative = Alebo sa dotknite snímača odtlačkov prstov
keyring-confirm = Potvrdenie
keyring-allow = Povoliť
keyring-deny = Nepovoliť
keyring-password = Heslo
keyring-mismatch = Zadané hodnoty sa nezhodujú
keyring-unlock = Odomknúť
keyring-cancel = Zrušiť

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Vytvoriť prístupový kľúč pre { $site }?
passkeys-register-account-by-app = { $app } chce uložiť prístupový kľúč pre { $account }. Zostane v tomto počítači.
passkeys-register-account = Aplikácia chce uložiť prístupový kľúč pre { $account }. Zostane v tomto počítači.
passkeys-register-by-app = { $app } chce uložiť prístupový kľúč. Zostane v tomto počítači.
passkeys-register = Aplikácia chce uložiť prístupový kľúč. Zostane v tomto počítači.
passkeys-sign-in-title = Prihlásiť sa do { $site } prístupovým kľúčom?
passkeys-sign-in-choose-by-app = { $app } žiada prístupový kľúč. Vyberte účet, ktorým sa chcete prihlásiť.
passkeys-sign-in-choose = Aplikácia žiada prístupový kľúč. Vyberte účet, ktorým sa chcete prihlásiť.
passkeys-sign-in-by-app = { $app } žiada váš prístupový kľúč.
passkeys-sign-in = Aplikácia žiada váš prístupový kľúč.
passkeys-manage-title-by-app = Povoliť aplikácii { $app } spravovať vaše prístupové kľúče?
passkeys-manage-title = Povoliť tejto aplikácii spravovať vaše prístupové kľúče?
passkeys-manage-description = Uvidí, pre ktoré weby máte prístupové kľúče, a bude ich môcť odstrániť.
passkeys-registered-title = Pre { $site } už máte prístupový kľúč
passkeys-registered-description = Prihláste sa radšej tým, ktorý už máte.
passkeys-choose-title = Použiť prístupové kľúče v tomto počítači?
passkeys-choose-by-app = { $app } sa pýta, kde máte prístupový kľúč.
passkeys-choose = Aplikácia sa pýta, kde máte prístupový kľúč.
passkeys-use-password = Použiť heslo
passkeys-password = Heslo
passkeys-cancel = Zrušiť
passkeys-continue = Pokračovať
passkeys-ok = OK
passkeys-use-this-computer = Použiť tento počítač
passkeys-fingerprint-unavailable = Pokračujte zadaním hesla.
passkeys-wrong-password = Heslo nie je správne. Skúste to znova.

## Sign-in prompt

auth-prompt-password = Heslo
auth-prompt-username = Používateľské meno
auth-prompt-back = Späť
auth-prompt-submit = Odoslať
auth-prompt-wrong-password = Heslo nie je správne
auth-prompt-failed = Nepodarilo sa. Skúste to znova.
fingerprint-not-recognized = Odtlačok prsta nebol rozpoznaný
fingerprint-scanning = Dotknite sa snímača odtlačkov prstov
fingerprint-retry-scan = Naskenujte prst znova
fingerprint-swipe-too-short = Potiahnutie bolo príliš krátke, skúste to znova
fingerprint-finger-not-centered = Položte prst do stredu a skúste to znova
fingerprint-remove-and-retry = Zdvihnite prst a skúste to znova
fingerprint-unavailable = Odtlačok prsta nie je k dispozícii, zadajte heslo
auth-prompt-use-password = Použiť heslo
auth-prompt-try-fingerprint = Skúsiť znova odtlačok prsta
auth-prompt-use-fingerprint = Použiť odtlačok prsta
auth-prompt-show-password = Zobraziť heslo

## Administrator authentication

polkit-title = Vyžaduje sa overenie
polkit-administrator = Správca
polkit-password = Heslo
polkit-cancel = Zrušiť
polkit-authenticate = Overiť
polkit-failed = Nepodarilo sa. Skúste to znova.

## Log out, power off and restart dialog

end-session-log-out-user = Odhlásiť používateľa { $userName }
end-session-log-out-title = Odhlásiť sa
end-session-log-out-user-countdown = { $seconds ->
    [one] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundu
    [few] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundy
    [many] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekundy
   *[other] Používateľ { $userName } bude automaticky odhlásený o { $seconds } sekúnd
}
end-session-log-out-countdown = { $seconds ->
    [one] Automaticky budete odhlásení o { $seconds } sekundu
    [few] Automaticky budete odhlásení o { $seconds } sekundy
    [many] Automaticky budete odhlásení o { $seconds } sekundy
   *[other] Automaticky budete odhlásení o { $seconds } sekúnd
}
end-session-log-out-button = Odhlásiť sa
end-session-power-off-title = Vypnúť
end-session-power-off-updates-title = Nainštalovať aktualizácie a vypnúť
end-session-power-off-countdown = { $seconds ->
    [one] Systém sa automaticky vypne o { $seconds } sekundu
    [few] Systém sa automaticky vypne o { $seconds } sekundy
    [many] Systém sa automaticky vypne o { $seconds } sekundy
   *[other] Systém sa automaticky vypne o { $seconds } sekúnd
}
end-session-power-off-button = Vypnúť
end-session-restart-title = Reštartovať
end-session-restart-updates-title = Nainštalovať aktualizácie a reštartovať
end-session-restart-countdown = { $seconds ->
    [one] Systém sa automaticky reštartuje o { $seconds } sekundu
    [few] Systém sa automaticky reštartuje o { $seconds } sekundy
    [many] Systém sa automaticky reštartuje o { $seconds } sekundy
   *[other] Systém sa automaticky reštartuje o { $seconds } sekúnd
}
end-session-restart-button = Reštartovať
end-session-update-restart-title = Reštartovať a nainštalovať aktualizácie
end-session-update-restart-countdown = { $seconds ->
    [one] Systém sa o { $seconds } sekundu automaticky reštartuje a nainštaluje aktualizácie
    [few] Systém sa o { $seconds } sekundy automaticky reštartuje a nainštaluje aktualizácie
    [many] Systém sa o { $seconds } sekundy automaticky reštartuje a nainštaluje aktualizácie
   *[other] Systém sa o { $seconds } sekúnd automaticky reštartuje a nainštaluje aktualizácie
}
end-session-update-restart-button = Reštartovať a inštalovať
end-session-install-updates = Nainštalovať čakajúce aktualizácie softvéru
end-session-install-version = Nainštalovať verziu { $version }
end-session-version-nightly = { $release } nočná zostava { $number }
end-session-low-battery = Batéria je slabá. Pred inštaláciou aktualizácií pripojte napájanie.
end-session-busy-apps = Niektoré aplikácie sú zaneprázdnené alebo obsahujú neuloženú prácu
end-session-other-users = Prihlásení sú aj ďalší používatelia
end-session-cancel = Zrušiť
end-session-boot-options = Možnosti spustenia
end-session-remote-user = { $userName } (vzdialene)
end-session-console-user = { $userName } (konzola)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Okno odomknutia
