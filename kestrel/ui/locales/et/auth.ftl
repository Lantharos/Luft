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
usb-protection-refused-title = Uued USB-seadmed on ootel
usb-protection-refused-body = Luft ei suutnud kinnitada, et just sinu töölaud sai lukust avatud. Klahvistikud ja hiired töötavad endiselt.
usb-protection-refused-settings = Seadistused

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
keyring-unlock = Ava lukustus
keyring-cancel = Loobu

## Sign-in prompt

auth-prompt-password = Salasõna
auth-prompt-username = Kasutajanimi
auth-prompt-back = Tagasi
auth-prompt-submit = Kinnita
auth-prompt-wrong-password = See salasõna ei sobinud
auth-prompt-failed = See ei õnnestunud. Proovi uuesti.
fingerprint-not-recognized = Sõrmejälge ei tuvastatud
fingerprint-scanning = Puuduta sõrmejäljelugejat
fingerprint-retry-scan = Skanni sõrm uuesti
fingerprint-swipe-too-short = Libistus oli liiga lühike, proovi uuesti
fingerprint-finger-not-centered = Aseta sõrm keskele ja proovi uuesti
fingerprint-remove-and-retry = Tõsta sõrm üles ja proovi uuesti
fingerprint-unavailable = Sõrmejälg pole saadaval, sisesta salasõna
auth-prompt-use-password = Kasuta salasõna
auth-prompt-try-fingerprint = Proovi sõrmejälge uuesti
auth-prompt-use-fingerprint = Kasuta sõrmejälge
auth-prompt-show-password = Näita salasõna

## Administrator authentication

polkit-title = Vajalik on autentimine
polkit-administrator = Administraator
polkit-password = Salasõna
polkit-cancel = Loobu
polkit-authenticate = Autendi
polkit-failed = See ei õnnestunud. Proovi uuesti.

## Log out, power off and restart dialog

end-session-log-out-user = Kas logid { $userName } kasutaja välja?
end-session-log-out-title = Kas logid välja?
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
end-session-power-off-title = Kas lülitad arvuti välja?
end-session-power-off-updates-title = Kas paigaldad uuenduse ja lülitad arvuti välja?
end-session-power-off-countdown =
    { $seconds ->
        [one] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
       *[other] Süsteem lülitub automaatselt välja { $seconds } sekundi pärast
    }
end-session-power-off-button = Lülita välja
end-session-restart-title = Kas käivitad arvuti uuesti?
end-session-restart-updates-title = Kas paigaldad uuenduse ja käivitad arvuti uuesti?
end-session-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub automaatselt { $seconds } sekundi pärast
    }
end-session-restart-button = Taaskäivita
end-session-update-restart-title = Kas käivitad arvuti uuesti ja paigaldad uuenduse?
end-session-update-restart-countdown =
    { $seconds ->
        [one] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
       *[other] Süsteem taaskäivitub ja installib värskendused automaatselt { $seconds } sekundi pärast
    }
end-session-update-restart-button = Taaskäivita ja paigalda
end-session-install-updates = Paigalda ootel tarkvarauuendused
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


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Lukust avamine
end-session-power-options-title = Mida peaks see arvuti tegema?
end-session-power-options-description = Sa vajutasid toitenuppu.
end-session-suspend-button = Unerežiim
greeter-wake-hint = Sisselogimiseks klõpsa või vajuta ükspuha mis klahvi
lock-screen-wake-hint = Lukustuse avamiseks klõpsa või vajuta ükspuha mis klahvi
end-session-awake-reason = Väljalülitamise, uuesti käivitamise või väljalogimise pöördloendus
