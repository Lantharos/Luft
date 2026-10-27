## Sign-in screen, shown before anyone signs in

greeter-session = Seanss
greeter-accessibility = Hõlbustus
greeter-power = Toide
greeter-larger-text = Suurem tekst
greeter-screen-reader = Ekraanilugeja
greeter-suspend = Unerežiim
greeter-restart = Taaskäivita
greeter-power-off = Lülita välja
greeter-another-account = Muu konto

## Lock screen

lock-screen-accessibility = Hõlbustus
lock-screen-power = Toide
lock-screen-battery = Aku { $level }
lock-screen-screen-reader = Ekraanilugeja
lock-screen-zoom = Luup
lock-screen-on-screen-keyboard = Ekraaniklaviatuur
lock-screen-high-contrast = Kõrge kontrast
lock-screen-dwell-click = Viibimisklõps
lock-screen-larger-text = Suurem tekst
lock-screen-suspend = Unerežiim
lock-screen-restart = Taaskäivita…
lock-screen-power-off = Lülita välja…
lock-inhibit-reason = Kestrel peab ekraani lukustama

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Salvesta võtmerõngasse
keyring-remember-for-app = Jäta selle rakenduse jaoks meelde
keyring-fingerprint-allow = Lubamiseks puuduta sõrmejäljelugejat
keyring-fingerprint-alternative = Või puuduta sõrmejäljelugejat
keyring-confirm = Kinnitus
keyring-allow = Luba
keyring-deny = Ära luba
keyring-password = Salasõna
keyring-mismatch = Sisestused ei ühti
keyring-unlock = Ava
keyring-cancel = Loobu

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Kas luua pääsuvõti saidile { $site }?
passkeys-register-account-by-app = { $app } soovib salvestada pääsuvõtme konto { $account } jaoks. See jääb sellesse arvutisse.
passkeys-register-account = Üks rakendus soovib salvestada pääsuvõtme konto { $account } jaoks. See jääb sellesse arvutisse.
passkeys-register-by-app = { $app } soovib salvestada pääsuvõtme. See jääb sellesse arvutisse.
passkeys-register = Üks rakendus soovib salvestada pääsuvõtme. See jääb sellesse arvutisse.
passkeys-sign-in-title = Kas logida saidile { $site } sisse pääsuvõtmega?
passkeys-sign-in-choose-by-app = { $app } küsib pääsuvõtit. Vali konto, millega sisse logida.
passkeys-sign-in-choose = Üks rakendus küsib pääsuvõtit. Vali konto, millega sisse logida.
passkeys-sign-in-by-app = { $app } küsib sinu pääsuvõtit.
passkeys-sign-in = Üks rakendus küsib sinu pääsuvõtit.
passkeys-manage-title-by-app = Kas lubad rakendusel { $app } hallata sinu pääsuvõtmeid?
passkeys-manage-title = Kas lubad sellel rakendusel hallata sinu pääsuvõtmeid?
passkeys-manage-description = See näeb, millistel saitidel on sul pääsuvõtmed, ja saab neid eemaldada.
passkeys-registered-title = Sul on saidi { $site } jaoks juba pääsuvõti
passkeys-registered-description = Logi selle asemel sisse olemasoleva pääsuvõtmega.
passkeys-choose-title = Kas kasutada selle arvuti pääsuvõtmeid?
passkeys-choose-by-app = { $app } küsib, kus sinu pääsuvõti asub.
passkeys-choose = Üks rakendus küsib, kus sinu pääsuvõti asub.
passkeys-use-password = Kasuta salasõna
passkeys-password = Salasõna
passkeys-cancel = Loobu
passkeys-continue = Jätka
passkeys-ok = OK
passkeys-use-this-computer = Kasuta seda arvutit
passkeys-fingerprint-unavailable = Jätkamiseks kasuta salasõna.
passkeys-wrong-password = See salasõna pole õige. Proovi uuesti.

## Sign-in prompt

auth-prompt-password = Salasõna
auth-prompt-username = Kasutajanimi
auth-prompt-back = Tagasi
auth-prompt-submit = Kinnita
auth-prompt-wrong-password = See salasõna ei sobinud
auth-prompt-failed = See ei õnnestunud. Proovi uuesti.
fingerprint-not-recognized = Sõrmejälge ei tuvastatud

## Administrator authentication

polkit-title = Vajalik on autentimine
polkit-administrator = Administraator
polkit-password = Salasõna
polkit-cancel = Loobu
polkit-authenticate = Autendi
polkit-failed = See ei õnnestunud. Proovi uuesti.

## Log out, power off and restart dialog

end-session-log-out-user = Kasutaja { $userName } väljalogimine
end-session-log-out-title = Väljalogimine
end-session-log-out-user-countdown =
    { $seconds ->
        [one] Kasutaja { $userName } logitakse automaatselt välja { $seconds } sekundi pärast
       *[other] Kasutaja { $userName } logitakse automaatselt välja { $seconds } sekundi pärast
    }
end-session-log-out-countdown =
    { $seconds ->
        [one] Sind logitakse automaatselt välja { $seconds } sekundi pärast
       *[other] Sind logitakse automaatselt välja { $seconds } sekundi pärast
    }
end-session-log-out-button = Logi välja
end-session-power-off-title = Väljalülitamine
end-session-power-off-updates-title = Värskenduste installimine ja väljalülitamine
end-session-power-off-countdown =
    { $seconds ->
        [one] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
       *[other] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
    }
end-session-power-off-button = Lülita välja
end-session-restart-title = Taaskäivitamine
end-session-restart-updates-title = Värskenduste installimine ja taaskäivitamine
end-session-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
    }
end-session-restart-button = Taaskäivita
end-session-update-restart-title = Taaskäivitamine ja värskenduste installimine
end-session-update-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
    }
end-session-update-restart-button = Taaskäivita ja installi
end-session-install-updates = Installi ootel tarkvaravärskendused
end-session-install-version = Installi versioon { $version }
end-session-version-nightly = { $release } öine järk { $number }
end-session-low-battery = Aku tase on madal: enne värskenduste installimist ühenda arvuti vooluvõrku
end-session-busy-apps = Mõni rakendus on hõivatud või sisaldab salvestamata tööd
end-session-other-users = Sisse on logitud teisi kasutajaid
end-session-cancel = Loobu
end-session-boot-options = Käivitusvalikud
end-session-remote-user = { $userName } (kaugühendus)
end-session-console-user = { $userName } (konsool)

## Lock screen clock

lock-clock-swipe-up = Pühi üles
lock-clock-click-or-press = Klõpsa või vajuta mõnda klahvi

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Lukust avamine
