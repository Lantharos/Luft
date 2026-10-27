## Sign-in screen, shown before anyone signs in

greeter-session = Sessão
greeter-accessibility = Acessibilidade
greeter-power = Energia
greeter-larger-text = Texto maior
greeter-screen-reader = Leitor de ecrã
greeter-suspend = Suspender
greeter-restart = Reiniciar
greeter-power-off = Encerrar
greeter-another-account = Outra conta

## Lock screen

lock-screen-accessibility = Acessibilidade
lock-screen-power = Energia
lock-screen-battery = Bateria a { $level }
lock-screen-screen-reader = Leitor de ecrã
lock-screen-zoom = Lupa
lock-screen-on-screen-keyboard = Teclado no ecrã
lock-screen-high-contrast = Alto contraste
lock-screen-dwell-click = Clique por permanência
lock-screen-larger-text = Texto maior
lock-screen-suspend = Suspender
lock-screen-restart = Reiniciar…
lock-screen-power-off = Encerrar…
lock-inhibit-reason = O Kestrel tem de bloquear o ecrã

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Guardar no porta-chaves
keyring-remember-for-app = Memorizar para esta aplicação
keyring-fingerprint-allow = Toque no leitor de impressões digitais para permitir
keyring-fingerprint-alternative = Ou toque no leitor de impressões digitais
keyring-confirm = Confirmar
keyring-allow = Permitir
keyring-deny = Não permitir
keyring-password = Palavra-passe
keyring-mismatch = Os valores introduzidos não coincidem
keyring-unlock = Desbloquear
keyring-cancel = Cancelar

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Criar uma chave de acesso para { $site }?
passkeys-register-account-by-app = A aplicação { $app } quer guardar uma chave de acesso para { $account }. A chave fica neste computador.
passkeys-register-account = Uma aplicação quer guardar uma chave de acesso para { $account }. A chave fica neste computador.
passkeys-register-by-app = A aplicação { $app } quer guardar uma chave de acesso. A chave fica neste computador.
passkeys-register = Uma aplicação quer guardar uma chave de acesso. A chave fica neste computador.
passkeys-sign-in-title = Iniciar sessão em { $site } com a chave de acesso?
passkeys-sign-in-choose-by-app = A aplicação { $app } está a pedir uma chave de acesso. Escolha a conta com que pretende iniciar sessão.
passkeys-sign-in-choose = Uma aplicação está a pedir uma chave de acesso. Escolha a conta com que pretende iniciar sessão.
passkeys-sign-in-by-app = A aplicação { $app } está a pedir a sua chave de acesso.
passkeys-sign-in = Uma aplicação está a pedir a sua chave de acesso.
passkeys-manage-title-by-app = Permitir que a aplicação { $app } faça a gestão das suas chaves de acesso?
passkeys-manage-title = Permitir que esta aplicação faça a gestão das suas chaves de acesso?
passkeys-manage-description = Poderá ver para que sites tem chaves de acesso e removê-las.
passkeys-registered-title = Já tem uma chave de acesso para { $site }
passkeys-registered-description = Inicie sessão com a chave que já tem.
passkeys-choose-title = Utilizar as chaves de acesso deste computador?
passkeys-choose-by-app = A aplicação { $app } quer saber onde está a sua chave de acesso.
passkeys-choose = Uma aplicação quer saber onde está a sua chave de acesso.
passkeys-use-password = Utilizar palavra-passe
passkeys-password = Palavra-passe
passkeys-cancel = Cancelar
passkeys-continue = Continuar
passkeys-ok = OK
passkeys-use-this-computer = Utilizar este computador
passkeys-fingerprint-unavailable = Utilize a palavra-passe para continuar.
passkeys-wrong-password = A palavra-passe não está correta. Tente novamente.

## Sign-in prompt

auth-prompt-password = Palavra-passe
auth-prompt-username = Nome de utilizador
auth-prompt-back = Voltar
auth-prompt-submit = Enviar
auth-prompt-wrong-password = A palavra-passe não está correta
auth-prompt-failed = Não funcionou. Tente novamente.
fingerprint-not-recognized = Impressão digital não reconhecida

## Administrator authentication

polkit-title = Autenticação necessária
polkit-administrator = Administrador
polkit-password = Palavra-passe
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = Não funcionou. Tente novamente.

## Log out, power off and restart dialog

end-session-log-out-user = Terminar a sessão de { $userName }
end-session-log-out-title = Terminar sessão
end-session-log-out-user-countdown = { $seconds ->
    [0] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundos
    [one] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundo
   *[other] A sessão de { $userName } vai ser terminada automaticamente em { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [0] A sessão vai ser terminada automaticamente em { $seconds } segundos
    [one] A sessão vai ser terminada automaticamente em { $seconds } segundo
   *[other] A sessão vai ser terminada automaticamente em { $seconds } segundos
}
end-session-log-out-button = Terminar sessão
end-session-power-off-title = Encerrar
end-session-power-off-updates-title = Instalar atualizações e encerrar
end-session-power-off-countdown = { $seconds ->
    [0] O sistema vai encerrar automaticamente em { $seconds } segundos
    [one] O sistema vai encerrar automaticamente em { $seconds } segundo
   *[other] O sistema vai encerrar automaticamente em { $seconds } segundos
}
end-session-power-off-button = Encerrar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar atualizações e reiniciar
end-session-restart-countdown = { $seconds ->
    [0] O sistema vai reiniciar automaticamente em { $seconds } segundos
    [one] O sistema vai reiniciar automaticamente em { $seconds } segundo
   *[other] O sistema vai reiniciar automaticamente em { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar atualizações
end-session-update-restart-countdown = { $seconds ->
    [0] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundos
    [one] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundo
   *[other] O sistema vai reiniciar e instalar as atualizações automaticamente em { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar as atualizações pendentes
end-session-install-version = Instalar a versão { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Bateria fraca. Ligue o carregador antes de instalar atualizações.
end-session-busy-apps = Algumas aplicações estão ocupadas ou têm trabalho por guardar
end-session-other-users = Há outros utilizadores com sessão iniciada
end-session-cancel = Cancelar
end-session-boot-options = Opções de arranque
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (consola)

## Lock screen clock

lock-clock-swipe-up = Deslize para cima
lock-clock-click-or-press = Clique ou prima uma tecla

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Desbloquear
