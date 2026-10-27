## Sign-in screen, shown before anyone signs in

greeter-session = Sesión
greeter-accessibility = Accesibilidad
greeter-power = Energía
greeter-larger-text = Texto más grande
greeter-screen-reader = Lector de pantalla
greeter-suspend = Suspender
greeter-restart = Reiniciar
greeter-power-off = Apagar
greeter-another-account = Otra cuenta

## Lock screen

lock-screen-accessibility = Accesibilidad
lock-screen-power = Energía
lock-screen-battery = Batería al { $level }
lock-screen-screen-reader = Lector de pantalla
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Teclado en pantalla
lock-screen-high-contrast = Alto contraste
lock-screen-dwell-click = Clic al detener el puntero
lock-screen-larger-text = Texto más grande
lock-screen-suspend = Suspender
lock-screen-restart = Reiniciar…
lock-screen-power-off = Apagar…
lock-inhibit-reason = Kestrel necesita bloquear la pantalla

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Guardar en el llavero
keyring-remember-for-app = Recordar para esta aplicación
keyring-fingerprint-allow = Toca el lector de huellas para permitirlo
keyring-fingerprint-alternative = O toca el lector de huellas
keyring-confirm = Confirmar
keyring-allow = Permitir
keyring-deny = No permitir
keyring-password = Contraseña
keyring-mismatch = Las contraseñas no coinciden
keyring-unlock = Desbloquear
keyring-cancel = Cancelar

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = ¿Crear una llave de acceso para { $site }?
passkeys-register-account-by-app = { $app } quiere guardar una llave de acceso para { $account }. Se queda en este ordenador.
passkeys-register-account = Una aplicación quiere guardar una llave de acceso para { $account }. Se queda en este ordenador.
passkeys-register-by-app = { $app } quiere guardar una llave de acceso. Se queda en este ordenador.
passkeys-register = Una aplicación quiere guardar una llave de acceso. Se queda en este ordenador.
passkeys-sign-in-title = ¿Iniciar sesión en { $site } con tu llave de acceso?
passkeys-sign-in-choose-by-app = { $app } pide una llave de acceso. Elige la cuenta con la que quieres iniciar sesión.
passkeys-sign-in-choose = Una aplicación pide una llave de acceso. Elige la cuenta con la que quieres iniciar sesión.
passkeys-sign-in-by-app = { $app } pide tu llave de acceso.
passkeys-sign-in = Una aplicación pide tu llave de acceso.
passkeys-manage-title-by-app = ¿Permitir que { $app } gestione tus llaves de acceso?
passkeys-manage-title = ¿Permitir que esta aplicación gestione tus llaves de acceso?
passkeys-manage-description = Verá para qué sitios tienes llaves de acceso y podrá eliminarlas.
passkeys-registered-title = Ya tienes una llave de acceso para { $site }
passkeys-registered-description = Inicia sesión con la que ya tienes.
passkeys-choose-title = ¿Usar las llaves de acceso de este ordenador?
passkeys-choose-by-app = { $app } pregunta dónde está tu llave de acceso.
passkeys-choose = Una aplicación pregunta dónde está tu llave de acceso.
passkeys-use-password = Usar contraseña
passkeys-password = Contraseña
passkeys-cancel = Cancelar
passkeys-continue = Continuar
passkeys-ok = Aceptar
passkeys-use-this-computer = Usar este ordenador
passkeys-fingerprint-unavailable = Usa tu contraseña para continuar.
passkeys-wrong-password = La contraseña no es correcta. Vuelve a intentarlo.

## Sign-in prompt

auth-prompt-password = Contraseña
auth-prompt-username = Nombre de usuario
auth-prompt-back = Atrás
auth-prompt-submit = Enviar
auth-prompt-wrong-password = La contraseña no es correcta
auth-prompt-failed = No ha funcionado. Vuelve a intentarlo.
fingerprint-not-recognized = Huella no reconocida

## Administrator authentication

polkit-title = Se necesita autenticación
polkit-administrator = Administrador
polkit-password = Contraseña
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = No ha funcionado. Vuelve a intentarlo.

## Log out, power off and restart dialog

end-session-log-out-user = Cerrar la sesión de { $userName }
end-session-log-out-title = Cerrar sesión
end-session-log-out-user-countdown = { $seconds ->
    [one] La sesión de { $userName } se cerrará automáticamente en { $seconds } segundo
   *[other] La sesión de { $userName } se cerrará automáticamente en { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [one] Tu sesión se cerrará automáticamente en { $seconds } segundo
   *[other] Tu sesión se cerrará automáticamente en { $seconds } segundos
}
end-session-log-out-button = Cerrar sesión
end-session-power-off-title = Apagar
end-session-power-off-updates-title = Instalar actualizaciones y apagar
end-session-power-off-countdown = { $seconds ->
    [one] El ordenador se apagará automáticamente en { $seconds } segundo
   *[other] El ordenador se apagará automáticamente en { $seconds } segundos
}
end-session-power-off-button = Apagar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar actualizaciones y reiniciar
end-session-restart-countdown = { $seconds ->
    [one] El ordenador se reiniciará automáticamente en { $seconds } segundo
   *[other] El ordenador se reiniciará automáticamente en { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar actualizaciones
end-session-update-restart-countdown = { $seconds ->
    [one] El ordenador se reiniciará e instalará las actualizaciones automáticamente en { $seconds } segundo
   *[other] El ordenador se reiniciará e instalará las actualizaciones automáticamente en { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar las actualizaciones pendientes
end-session-install-version = Instalar la versión { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Batería baja: conecta el cargador antes de instalar actualizaciones
end-session-busy-apps = Algunas aplicaciones están ocupadas o tienen trabajo sin guardar
end-session-other-users = Hay otros usuarios con la sesión iniciada
end-session-cancel = Cancelar
end-session-boot-options = Opciones de arranque
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (consola)

## Lock screen clock

lock-clock-swipe-up = Desliza hacia arriba
lock-clock-click-or-press = Haz clic o pulsa una tecla

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Ventana de desbloqueo
