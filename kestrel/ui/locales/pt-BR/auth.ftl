## Sign-in screen, shown before anyone signs in

greeter-session = Sessão
greeter-accessibility = Acessibilidade
greeter-power = Energia
greeter-larger-text = Texto maior
greeter-screen-reader = Leitor de tela
greeter-suspend = Suspender
greeter-restart = Reiniciar
greeter-power-off = Desligar
greeter-another-account = Outra conta

## Lock screen

lock-screen-accessibility = Acessibilidade
lock-screen-power = Energia
lock-screen-battery = Bateria { $level }
lock-screen-screen-reader = Leitor de tela
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Teclado virtual
lock-screen-high-contrast = Alto contraste
lock-screen-dwell-click = Clique por permanência
lock-screen-larger-text = Texto maior
lock-screen-suspend = Suspender
lock-screen-restart = Reiniciar…
lock-screen-power-off = Desligar…
lock-inhibit-reason = O Kestrel precisa bloquear a tela

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Salvar no Chaveiro
keyring-remember-for-app = Lembrar para este app
keyring-fingerprint-allow = Toque no leitor de impressão digital para permitir
keyring-fingerprint-alternative = Ou toque no leitor de impressão digital
keyring-confirm = Confirmar
keyring-allow = Permitir
keyring-deny = Não permitir
keyring-password = Senha
keyring-mismatch = As senhas não coincidem
keyring-unlock = Desbloquear
keyring-cancel = Cancelar

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Criar uma chave de acesso para { $site }?
passkeys-register-account-by-app = { $app } quer salvar uma chave de acesso para { $account }. Ela fica neste computador.
passkeys-register-account = Um app quer salvar uma chave de acesso para { $account }. Ela fica neste computador.
passkeys-register-by-app = { $app } quer salvar uma chave de acesso. Ela fica neste computador.
passkeys-register = Um app quer salvar uma chave de acesso. Ela fica neste computador.
passkeys-sign-in-title = Entrar em { $site } com sua chave de acesso?
passkeys-sign-in-choose-by-app = { $app } está pedindo uma chave de acesso. Escolha a conta com a qual entrar.
passkeys-sign-in-choose = Um app está pedindo uma chave de acesso. Escolha a conta com a qual entrar.
passkeys-sign-in-by-app = { $app } está pedindo sua chave de acesso.
passkeys-sign-in = Um app está pedindo sua chave de acesso.
passkeys-manage-title-by-app = Permitir que { $app } gerencie suas chaves de acesso?
passkeys-manage-title = Permitir que este app gerencie suas chaves de acesso?
passkeys-manage-description = Ele verá para quais sites você tem chaves de acesso e poderá removê-las.
passkeys-registered-title = Você já tem uma chave de acesso para { $site }
passkeys-registered-description = Entre com a que você já tem.
passkeys-choose-title = Usar as chaves de acesso deste computador?
passkeys-choose-by-app = { $app } está perguntando onde está sua chave de acesso.
passkeys-choose = Um app está perguntando onde está sua chave de acesso.
passkeys-use-password = Usar senha
passkeys-password = Senha
passkeys-cancel = Cancelar
passkeys-continue = Continuar
passkeys-ok = OK
passkeys-use-this-computer = Usar este computador
passkeys-fingerprint-unavailable = Use sua senha para continuar.
passkeys-wrong-password = Senha incorreta. Tente novamente.

## Sign-in prompt

auth-prompt-password = Senha
auth-prompt-username = Nome de usuário
auth-prompt-back = Voltar
auth-prompt-submit = Enviar
auth-prompt-wrong-password = Essa senha não funcionou
auth-prompt-failed = Não funcionou. Tente novamente.
fingerprint-not-recognized = Impressão digital não reconhecida
fingerprint-scanning = Toque no leitor de impressão digital
fingerprint-retry-scan = Escaneie o dedo novamente
fingerprint-swipe-too-short = O deslize foi curto demais, tente novamente
fingerprint-finger-not-centered = Centralize o dedo e tente novamente
fingerprint-remove-and-retry = Levante o dedo e tente novamente
fingerprint-unavailable = A impressão digital não está disponível, digite sua senha
auth-prompt-use-password = Usar senha
auth-prompt-try-fingerprint = Tentar a impressão digital novamente
auth-prompt-use-fingerprint = Usar impressão digital
auth-prompt-show-password = Mostrar senha

## Administrator authentication

polkit-title = Autenticação necessária
polkit-administrator = Administrador
polkit-password = Senha
polkit-cancel = Cancelar
polkit-authenticate = Autenticar
polkit-failed = Não funcionou. Tente novamente.

## Log out, power off and restart dialog

end-session-log-out-user = Sair: { $userName }
end-session-log-out-title = Sair
end-session-log-out-user-countdown = { $seconds ->
    [one] A sessão de { $userName } será encerrada automaticamente em { $seconds } segundo
   *[other] A sessão de { $userName } será encerrada automaticamente em { $seconds } segundos
}
end-session-log-out-countdown = { $seconds ->
    [one] Sua sessão será encerrada automaticamente em { $seconds } segundo
   *[other] Sua sessão será encerrada automaticamente em { $seconds } segundos
}
end-session-log-out-button = Sair
end-session-power-off-title = Desligar
end-session-power-off-updates-title = Instalar atualizações e desligar
end-session-power-off-countdown = { $seconds ->
    [one] O computador será desligado automaticamente em { $seconds } segundo
   *[other] O computador será desligado automaticamente em { $seconds } segundos
}
end-session-power-off-button = Desligar
end-session-restart-title = Reiniciar
end-session-restart-updates-title = Instalar atualizações e reiniciar
end-session-restart-countdown = { $seconds ->
    [one] O computador será reiniciado automaticamente em { $seconds } segundo
   *[other] O computador será reiniciado automaticamente em { $seconds } segundos
}
end-session-restart-button = Reiniciar
end-session-update-restart-title = Reiniciar e instalar atualizações
end-session-update-restart-countdown = { $seconds ->
    [one] O computador será reiniciado e instalará as atualizações automaticamente em { $seconds } segundo
   *[other] O computador será reiniciado e instalará as atualizações automaticamente em { $seconds } segundos
}
end-session-update-restart-button = Reiniciar e instalar
end-session-install-updates = Instalar atualizações pendentes
end-session-install-version = Instalar a versão { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Bateria fraca: conecte o carregador antes de instalar atualizações
end-session-busy-apps = Alguns apps estão ocupados ou têm trabalho não salvo
end-session-other-users = Há outros usuários conectados
end-session-cancel = Cancelar
end-session-boot-options = Opções de inicialização
end-session-remote-user = { $userName } (remoto)
end-session-console-user = { $userName } (console)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Janela de desbloqueio
