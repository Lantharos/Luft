## Sign-in screen, shown before anyone signs in

greeter-session = Seanca
greeter-accessibility = Qasshmëria
greeter-power = Energjia
greeter-larger-text = Tekst më i madh
greeter-screen-reader = Lexuesi i ekranit
greeter-suspend = Gjumë
greeter-restart = Rinis
greeter-power-off = Fik
greeter-another-account = Një llogari tjetër

## Lock screen

lock-screen-accessibility = Qasshmëria
lock-screen-power = Energjia
lock-screen-battery = Bateria { $level }
lock-screen-screen-reader = Lexuesi i ekranit
lock-screen-zoom = Zmadhimi
lock-screen-on-screen-keyboard = Tastiera në ekran
lock-screen-high-contrast = Kontrast i lartë
lock-screen-dwell-click = Klikim me qëndrim
lock-screen-larger-text = Tekst më i madh
lock-screen-suspend = Gjumë
lock-screen-restart = Rinis…
lock-screen-power-off = Fik…
lock-inhibit-reason = Kestrel duhet të bllokojë ekranin

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Ruaje në vargun e çelësave
keyring-remember-for-app = Mbaje mend për këtë aplikacion
keyring-fingerprint-allow = Prek lexuesin e gjurmëve të gishtave për ta lejuar
keyring-fingerprint-alternative = Ose prek lexuesin e gjurmëve të gishtave
keyring-confirm = Konfirmo
keyring-allow = Lejo
keyring-deny = Mos lejo
keyring-password = Fjalëkalimi
keyring-mismatch = Të dhënat nuk përputhen
keyring-unlock = Zhblloko
keyring-cancel = Anulo

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Të krijohet një çelës kalimi për { $site }?
passkeys-register-account-by-app = { $app } dëshiron të ruajë një çelës kalimi për { $account }. Ai mbetet në këtë kompjuter.
passkeys-register-account = Një aplikacion dëshiron të ruajë një çelës kalimi për { $account }. Ai mbetet në këtë kompjuter.
passkeys-register-by-app = { $app } dëshiron të ruajë një çelës kalimi. Ai mbetet në këtë kompjuter.
passkeys-register = Një aplikacion dëshiron të ruajë një çelës kalimi. Ai mbetet në këtë kompjuter.
passkeys-sign-in-title = Të hysh në { $site } me çelësin tënd të kalimit?
passkeys-sign-in-choose-by-app = { $app } po kërkon një çelës kalimi. Zgjidh llogarinë me të cilën do të hysh.
passkeys-sign-in-choose = Një aplikacion po kërkon një çelës kalimi. Zgjidh llogarinë me të cilën do të hysh.
passkeys-sign-in-by-app = { $app } po kërkon çelësin tënd të kalimit.
passkeys-sign-in = Një aplikacion po kërkon çelësin tënd të kalimit.
passkeys-manage-title-by-app = Të lejohet { $app } të menaxhojë çelësat e tu të kalimit?
passkeys-manage-title = Të lejohet ky aplikacion të menaxhojë çelësat e tu të kalimit?
passkeys-manage-description = Do të shohë për cilat sajte ke çelësa kalimi dhe mund t’i heqë.
passkeys-registered-title = Ke tashmë një çelës kalimi për { $site }
passkeys-registered-description = Hyr me atë që ke.
passkeys-choose-title = Të përdoren çelësat e kalimit në këtë kompjuter?
passkeys-choose-by-app = { $app } po pyet ku e ke çelësin e kalimit.
passkeys-choose = Një aplikacion po pyet ku e ke çelësin e kalimit.
passkeys-use-password = Përdor fjalëkalimin
passkeys-password = Fjalëkalimi
passkeys-cancel = Anulo
passkeys-continue = Vazhdo
passkeys-ok = OK
passkeys-use-this-computer = Përdor këtë kompjuter
passkeys-fingerprint-unavailable = Përdor fjalëkalimin për të vazhduar.
passkeys-wrong-password = Fjalëkalimi nuk është i saktë. Provo sërish.

## Sign-in prompt

auth-prompt-password = Fjalëkalimi
auth-prompt-username = Emri i përdoruesit
auth-prompt-back = Prapa
auth-prompt-submit = Dërgo
auth-prompt-wrong-password = Ai fjalëkalim nuk funksionoi
auth-prompt-failed = Nuk funksionoi. Provo sërish.
fingerprint-not-recognized = Gjurma e gishtit nuk u njoh

## Administrator authentication

polkit-title = Kërkohet vërtetimi
polkit-administrator = Administratori
polkit-password = Fjalëkalimi
polkit-cancel = Anulo
polkit-authenticate = Vërteto
polkit-failed = Na vjen keq, nuk funksionoi. Provo sërish.

## Log out, power off and restart dialog

end-session-log-out-user = Dil si { $userName }
end-session-log-out-title = Dil
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } do të dalë automatikisht pas { $seconds } sekonde
   *[other] { $userName } do të dalë automatikisht pas { $seconds } sekondash
}
end-session-log-out-countdown = { $seconds ->
    [one] Do të dalësh automatikisht pas { $seconds } sekonde
   *[other] Do të dalësh automatikisht pas { $seconds } sekondash
}
end-session-log-out-button = Dil
end-session-power-off-title = Fik
end-session-power-off-updates-title = Instalo përditësimet dhe fik
end-session-power-off-countdown = { $seconds ->
    [one] Sistemi do të fiket automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të fiket automatikisht pas { $seconds } sekondash
}
end-session-power-off-button = Fik
end-session-restart-title = Rinis
end-session-restart-updates-title = Instalo përditësimet dhe rinis
end-session-restart-countdown = { $seconds ->
    [one] Sistemi do të riniset automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të riniset automatikisht pas { $seconds } sekondash
}
end-session-restart-button = Rinis
end-session-update-restart-title = Rinis dhe instalo përditësimet
end-session-update-restart-countdown = { $seconds ->
    [one] Sistemi do të riniset dhe do të instalojë përditësimet automatikisht pas { $seconds } sekonde
   *[other] Sistemi do të riniset dhe do të instalojë përditësimet automatikisht pas { $seconds } sekondash
}
end-session-update-restart-button = Rinis dhe instalo
end-session-install-updates = Instalo përditësimet e softuerit në pritje
end-session-install-version = Instalo versionin { $version }
end-session-low-battery = Bateria është e ulët: lidhe në korrent para se të instalosh përditësimet
end-session-busy-apps = Disa aplikacione janë të zëna ose kanë punë të paruajtur
end-session-other-users = Përdorues të tjerë kanë hyrë në sistem
end-session-cancel = Anulo
end-session-boot-options = Opsionet e nisjes
end-session-remote-user = { $userName } (në distancë)
end-session-console-user = { $userName } (konsolë)

## Lock screen clock

lock-clock-swipe-up = Rrëshqit lart
lock-clock-click-or-press = Kliko ose shtyp një tast

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Dritarja e zhbllokimit
