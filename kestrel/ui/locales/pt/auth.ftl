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

## Sign-in prompt

auth-prompt-password = Palavra-passe
auth-prompt-username = Nome de utilizador
auth-prompt-back = Voltar
auth-prompt-submit = Enviar
auth-prompt-wrong-password = A palavra-passe não está correta
auth-prompt-failed = Não funcionou. Tente novamente.
fingerprint-not-recognized = Impressão digital não reconhecida
fingerprint-scanning = Toque no leitor de impressões digitais
fingerprint-retry-scan = Digitalize novamente o dedo
fingerprint-swipe-too-short = O deslize foi demasiado curto, tente novamente
fingerprint-finger-not-centered = Centre o dedo e tente novamente
fingerprint-remove-and-retry = Levante o dedo e tente novamente
fingerprint-unavailable = A impressão digital não está disponível, introduza a palavra-passe
auth-prompt-use-password = Utilizar palavra-passe
auth-prompt-try-fingerprint = Tentar novamente com a impressão digital
auth-prompt-use-fingerprint = Utilizar impressão digital
auth-prompt-show-password = Mostrar palavra-passe

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


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Desbloquear
