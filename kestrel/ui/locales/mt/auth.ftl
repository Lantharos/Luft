## Sign-in screen, shown before anyone signs in

greeter-session = Sessjoni
greeter-accessibility = Aċċessibilità
greeter-power = Enerġija
greeter-larger-text = Test akbar
greeter-screen-reader = Qarrej tal-iskrin
greeter-suspend = Sospensjoni
greeter-restart = Irristartja
greeter-power-off = Itfi
greeter-another-account = Kont ieħor

## Lock screen

lock-screen-accessibility = Aċċessibilità
lock-screen-power = Enerġija
lock-screen-battery = Batterija { $level }
lock-screen-screen-reader = Qarrej tal-iskrin
lock-screen-zoom = Lenti
lock-screen-on-screen-keyboard = Tastiera fuq l-iskrin
lock-screen-high-contrast = Kuntrast għoli
lock-screen-dwell-click = Klikk bil-waqfien
lock-screen-larger-text = Test akbar
lock-screen-suspend = Sospensjoni
lock-screen-restart = Irristartja…
lock-screen-power-off = Itfi…
lock-inhibit-reason = Kestrel irid isakkar l-iskrin

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Issejvja fiċ-ċurkett taċ-ċwievet
keyring-remember-for-app = Ftakar għal din l-app
keyring-fingerprint-allow = Mess il-qarrej tal-marki tas-swaba’ biex tippermetti
keyring-fingerprint-alternative = Jew mess il-qarrej tal-marki tas-swaba’
keyring-confirm = Ikkonferma
keyring-allow = Ippermetti
keyring-deny = Tippermettix
keyring-password = Password
keyring-mismatch = Dak li dħalt ma jaqbilx
keyring-unlock = Żblokka
keyring-cancel = Ikkanċella

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Toħloq passkey għal { $site }?
passkeys-register-account-by-app = L-app { $app } trid tissejvja passkey għal { $account }. Jibqa’ fuq dan il-kompjuter.
passkeys-register-account = App trid tissejvja passkey għal { $account }. Jibqa’ fuq dan il-kompjuter.
passkeys-register-by-app = L-app { $app } trid tissejvja passkey. Jibqa’ fuq dan il-kompjuter.
passkeys-register = App trid tissejvja passkey. Jibqa’ fuq dan il-kompjuter.
passkeys-sign-in-title = Tidħol f’{ $site } bil-passkey?
passkeys-sign-in-choose-by-app = L-app { $app } qed titlob passkey. Agħżel il-kont li bih tidħol.
passkeys-sign-in-choose = App qed titlob passkey. Agħżel il-kont li bih tidħol.
passkeys-sign-in-by-app = L-app { $app } qed titlob il-passkey.
passkeys-sign-in = App qed titlob il-passkey.
passkeys-manage-title-by-app = Tħalli lill-app { $app } timmaniġġja l-passkeys?
passkeys-manage-title = Tħalli lil din l-app timmaniġġja l-passkeys?
passkeys-manage-description = Tkun tista’ tara għal liema siti għandek passkeys u tista’ tneħħihom.
passkeys-registered-title = Diġà għandek passkey għal { $site }
passkeys-registered-description = Minflok, idħol b’dak li għandek.
passkeys-choose-title = Tuża l-passkeys fuq dan il-kompjuter?
passkeys-choose-by-app = L-app { $app } qed tistaqsi fejn hu l-passkey.
passkeys-choose = App qed tistaqsi fejn hu l-passkey.
passkeys-use-password = Uża l-password
passkeys-password = Password
passkeys-cancel = Ikkanċella
passkeys-continue = Kompli
passkeys-ok = OK
passkeys-use-this-computer = Uża dan il-kompjuter
passkeys-fingerprint-unavailable = Uża l-password biex tkompli.
passkeys-wrong-password = Il-password mhix tajba. Erġa’ pprova.

## Sign-in prompt

auth-prompt-password = Password
auth-prompt-username = Isem tal-utent
auth-prompt-back = Lura
auth-prompt-submit = Ibgħat
auth-prompt-wrong-password = Il-password ma ħadmitx
auth-prompt-failed = Ma ħadimx. Erġa’ pprova.
fingerprint-not-recognized = Il-marka tas-saba’ ma ntgħarfitx

## Administrator authentication

polkit-title = Hija meħtieġa l-awtentikazzjoni
polkit-administrator = Amministratur
polkit-password = Password
polkit-cancel = Ikkanċella
polkit-authenticate = Awtentika
polkit-failed = Ma ħadimx. Erġa’ pprova.

## Log out, power off and restart dialog

end-session-log-out-user = Oħroġ lil { $userName }
end-session-log-out-title = Oħroġ
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
    [two] { $userName } joħroġ awtomatikament f’{ $seconds } sekondi
    [few] { $userName } joħroġ awtomatikament f’{ $seconds } sekondi
    [many] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
   *[other] { $userName } joħroġ awtomatikament f’{ $seconds } sekonda
}
end-session-log-out-countdown = { $seconds ->
    [one] Toħroġ awtomatikament f’{ $seconds } sekonda
    [two] Toħroġ awtomatikament f’{ $seconds } sekondi
    [few] Toħroġ awtomatikament f’{ $seconds } sekondi
    [many] Toħroġ awtomatikament f’{ $seconds } sekonda
   *[other] Toħroġ awtomatikament f’{ $seconds } sekonda
}
end-session-log-out-button = Oħroġ
end-session-power-off-title = Itfi
end-session-power-off-updates-title = Installa l-aġġornamenti u itfi
end-session-power-off-countdown = { $seconds ->
    [one] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jintefa awtomatikament f’{ $seconds } sekonda
}
end-session-power-off-button = Itfi
end-session-restart-title = Irristartja
end-session-restart-updates-title = Installa l-aġġornamenti u irristartja
end-session-restart-countdown = { $seconds ->
    [one] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jirristartja awtomatikament f’{ $seconds } sekonda
}
end-session-restart-button = Irristartja
end-session-update-restart-title = Irristartja u installa l-aġġornamenti
end-session-update-restart-countdown = { $seconds ->
    [one] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
    [two] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekondi
    [few] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekondi
    [many] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
   *[other] Il-kompjuter jirristartja u jinstalla l-aġġornamenti awtomatikament f’{ $seconds } sekonda
}
end-session-update-restart-button = Irristartja u installa
end-session-install-updates = Installa l-aġġornamenti pendenti
end-session-install-version = Installa l-verżjoni { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Il-batterija baxxa: qabbad mal-elettriku qabel ma tinstalla l-aġġornamenti
end-session-busy-apps = Xi apps għadhom qed jaħdmu jew għandhom xogħol mhux issejvjat
end-session-other-users = Hemm utenti oħra li daħlu
end-session-cancel = Ikkanċella
end-session-boot-options = Għażliet tal-boot
end-session-remote-user = { $userName } (mill-bogħod)
end-session-console-user = { $userName } (konsola)

## Lock screen clock

lock-clock-swipe-up = Swajpja ’l fuq
lock-clock-click-or-press = Ikklikkja jew agħfas tast

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Tieqa tal-iżblokkar
