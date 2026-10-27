## Sign-in screen, shown before anyone signs in

greeter-session = Sessió
greeter-accessibility = Accessibilitat
greeter-power = Energia
greeter-larger-text = Text més gran
greeter-screen-reader = Lector de pantalla
greeter-suspend = Suspèn
greeter-restart = Reinicia
greeter-power-off = Apaga
greeter-another-account = Un altre compte

## Lock screen

lock-screen-accessibility = Accessibilitat
lock-screen-power = Energia
lock-screen-battery = Bateria: { $level }
lock-screen-screen-reader = Lector de pantalla
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Teclat en pantalla
lock-screen-high-contrast = Contrast alt
lock-screen-dwell-click = Clic en espera
lock-screen-larger-text = Text més gran
lock-screen-suspend = Suspèn
lock-screen-restart = Reinicia…
lock-screen-power-off = Apaga…
lock-inhibit-reason = Kestrel ha de bloquejar la pantalla

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Desa al clauer
keyring-remember-for-app = Recorda-ho per a aquesta aplicació
keyring-fingerprint-allow = Toqueu el lector d’empremtes per permetre-ho
keyring-fingerprint-alternative = O toqueu el lector d’empremtes
keyring-confirm = Confirmeu
keyring-allow = Permet
keyring-deny = No ho permetis
keyring-password = Contrasenya
keyring-mismatch = Les entrades no coincideixen
keyring-unlock = Desbloqueja
keyring-cancel = Cancel·la

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Voleu crear una clau d’accés per a { $site }?
passkeys-register-account-by-app = { $app } vol desar una clau d’accés per a { $account }. Es queda en aquest ordinador.
passkeys-register-account = Una aplicació vol desar una clau d’accés per a { $account }. Es queda en aquest ordinador.
passkeys-register-by-app = { $app } vol desar una clau d’accés. Es queda en aquest ordinador.
passkeys-register = Una aplicació vol desar una clau d’accés. Es queda en aquest ordinador.
passkeys-sign-in-title = Voleu iniciar la sessió a { $site } amb la vostra clau d’accés?
passkeys-sign-in-choose-by-app = { $app } demana una clau d’accés. Trieu el compte amb què voleu iniciar la sessió.
passkeys-sign-in-choose = Una aplicació demana una clau d’accés. Trieu el compte amb què voleu iniciar la sessió.
passkeys-sign-in-by-app = { $app } demana la vostra clau d’accés.
passkeys-sign-in = Una aplicació demana la vostra clau d’accés.
passkeys-manage-title-by-app = Voleu que { $app } gestioni les vostres claus d’accés?
passkeys-manage-title = Voleu que aquesta aplicació gestioni les vostres claus d’accés?
passkeys-manage-description = Podrà veure per a quins llocs teniu claus d’accés i les podrà treure.
passkeys-registered-title = Ja teniu una clau d’accés per a { $site }
passkeys-registered-description = Inicieu la sessió amb la que ja teniu.
passkeys-choose-title = Voleu fer servir les claus d’accés d’aquest ordinador?
passkeys-choose-by-app = { $app } pregunta on és la vostra clau d’accés.
passkeys-choose = Una aplicació pregunta on és la vostra clau d’accés.
passkeys-use-password = Fes servir la contrasenya
passkeys-password = Contrasenya
passkeys-cancel = Cancel·la
passkeys-continue = Continua
passkeys-ok = D’acord
passkeys-use-this-computer = Fes servir aquest ordinador
passkeys-fingerprint-unavailable = Feu servir la contrasenya per continuar.
passkeys-wrong-password = La contrasenya no és correcta. Torneu-ho a provar.

## Sign-in prompt

auth-prompt-password = Contrasenya
auth-prompt-username = Nom d’usuari
auth-prompt-back = Enrere
auth-prompt-submit = Envia
auth-prompt-wrong-password = La contrasenya no ha funcionat
auth-prompt-failed = No ha funcionat. Torneu-ho a provar.
fingerprint-not-recognized = No s’ha reconegut l’empremta digital

## Administrator authentication

polkit-title = Cal autenticar-se
polkit-administrator = Administrador
polkit-password = Contrasenya
polkit-cancel = Cancel·la
polkit-authenticate = Autentica
polkit-failed = No ha funcionat. Torneu-ho a provar.

## Log out, power off and restart dialog

end-session-log-out-user = Tanca la sessió de { $userName }
end-session-log-out-title = Tanca la sessió
end-session-log-out-user-countdown = { $seconds ->
    [one] La sessió de { $userName } es tancarà automàticament d’aquí a { $seconds } segon
   *[other] La sessió de { $userName } es tancarà automàticament d’aquí a { $seconds } segons
}
end-session-log-out-countdown = { $seconds ->
    [one] La sessió es tancarà automàticament d’aquí a { $seconds } segon
   *[other] La sessió es tancarà automàticament d’aquí a { $seconds } segons
}
end-session-log-out-button = Tanca la sessió
end-session-power-off-title = Apaga
end-session-power-off-updates-title = Instal·la les actualitzacions i apaga
end-session-power-off-countdown = { $seconds ->
    [one] L’ordinador s’apagarà automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador s’apagarà automàticament d’aquí a { $seconds } segons
}
end-session-power-off-button = Apaga
end-session-restart-title = Reinicia
end-session-restart-updates-title = Instal·la les actualitzacions i reinicia
end-session-restart-countdown = { $seconds ->
    [one] L’ordinador es reiniciarà automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador es reiniciarà automàticament d’aquí a { $seconds } segons
}
end-session-restart-button = Reinicia
end-session-update-restart-title = Reinicia i instal·la les actualitzacions
end-session-update-restart-countdown = { $seconds ->
    [one] L’ordinador es reiniciarà i instal·larà les actualitzacions automàticament d’aquí a { $seconds } segon
   *[other] L’ordinador es reiniciarà i instal·larà les actualitzacions automàticament d’aquí a { $seconds } segons
}
end-session-update-restart-button = Reinicia i instal·la
end-session-install-updates = Instal·la les actualitzacions pendents
end-session-install-version = Instal·la la versió { $version }
end-session-low-battery = Queda poca bateria: endolleu l’ordinador abans d’instal·lar les actualitzacions
end-session-busy-apps = Algunes aplicacions estan ocupades o tenen feina sense desar
end-session-other-users = Hi ha altres usuaris amb la sessió iniciada
end-session-cancel = Cancel·la
end-session-boot-options = Opcions d’arrencada
end-session-remote-user = { $userName } (remot)
end-session-console-user = { $userName } (consola)

## Lock screen clock

lock-clock-swipe-up = Llisqueu cap amunt
lock-clock-click-or-press = Feu clic o premeu una tecla

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Finestra de desbloqueig
