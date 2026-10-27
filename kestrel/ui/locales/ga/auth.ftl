## Sign-in screen, shown before anyone signs in

greeter-session = Seisiún
greeter-accessibility = Inrochtaineacht
greeter-power = Cumhacht
greeter-larger-text = Téacs níos mó
greeter-screen-reader = Léitheoir scáileáin
greeter-suspend = Codladh
greeter-restart = Atosaigh
greeter-power-off = Múch
greeter-another-account = Cuntas eile

## Lock screen

lock-screen-accessibility = Inrochtaineacht
lock-screen-power = Cumhacht
lock-screen-battery = Ceallra { $level }
lock-screen-screen-reader = Léitheoir scáileáin
lock-screen-zoom = Súmáil
lock-screen-on-screen-keyboard = Méarchlár ar an scáileán
lock-screen-high-contrast = Codarsnacht ard
lock-screen-dwell-click = Cliceáil fanachta
lock-screen-larger-text = Téacs níos mó
lock-screen-suspend = Codladh
lock-screen-restart = Atosaigh…
lock-screen-power-off = Múch…
lock-inhibit-reason = Caithfidh Kestrel an scáileán a ghlasáil

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Sábháil i d’fháinne eochrach
keyring-remember-for-app = Cuimhnigh don aip seo
keyring-fingerprint-allow = Tadhaill an léitheoir méarloirg chun é a cheadú
keyring-fingerprint-alternative = Nó tadhaill an léitheoir méarloirg
keyring-confirm = Deimhnigh
keyring-allow = Ceadaigh
keyring-deny = Ná ceadaigh
keyring-password = Pasfhocal
keyring-mismatch = Ní hionann an dá iontráil
keyring-unlock = Díghlasáil
keyring-cancel = Cealaigh

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Cruthaigh eochair rochtana le haghaidh { $site }?
passkeys-register-account-by-app = Tá { $app } ag iarraidh eochair rochtana a shábháil le haghaidh { $account }. Fanfaidh sí ar an ríomhaire seo.
passkeys-register-account = Tá aip ag iarraidh eochair rochtana a shábháil le haghaidh { $account }. Fanfaidh sí ar an ríomhaire seo.
passkeys-register-by-app = Tá { $app } ag iarraidh eochair rochtana a shábháil. Fanfaidh sí ar an ríomhaire seo.
passkeys-register = Tá aip ag iarraidh eochair rochtana a shábháil. Fanfaidh sí ar an ríomhaire seo.
passkeys-sign-in-title = Sínigh isteach ar { $site } le d’eochair rochtana?
passkeys-sign-in-choose-by-app = Tá { $app } ag iarraidh eochair rochtana. Roghnaigh an cuntas lena síneoidh tú isteach.
passkeys-sign-in-choose = Tá aip ag iarraidh eochair rochtana. Roghnaigh an cuntas lena síneoidh tú isteach.
passkeys-sign-in-by-app = Tá { $app } ag iarraidh d’eochair rochtana.
passkeys-sign-in = Tá aip ag iarraidh d’eochair rochtana.
passkeys-manage-title-by-app = Lig do { $app } d’eochracha rochtana a bhainistiú?
passkeys-manage-title = Lig don aip seo d’eochracha rochtana a bhainistiú?
passkeys-manage-description = Feicfidh sí na suíomhanna a bhfuil eochracha rochtana agat dóibh, agus beidh sí in ann iad a bhaint.
passkeys-registered-title = Tá eochair rochtana agat cheana le haghaidh { $site }
passkeys-registered-description = Sínigh isteach leis an gceann atá agat.
passkeys-choose-title = Úsáid na heochracha rochtana ar an ríomhaire seo?
passkeys-choose-by-app = Tá { $app } ag fiafraí cá bhfuil d’eochair rochtana.
passkeys-choose = Tá aip ag fiafraí cá bhfuil d’eochair rochtana.
passkeys-use-password = Úsáid pasfhocal
passkeys-password = Pasfhocal
passkeys-cancel = Cealaigh
passkeys-continue = Lean ar aghaidh
passkeys-ok = OK
passkeys-use-this-computer = Úsáid an ríomhaire seo
passkeys-fingerprint-unavailable = Úsáid do phasfhocal chun leanúint ar aghaidh.
passkeys-wrong-password = Níl an pasfhocal sin ceart. Bain triail eile as.

## Sign-in prompt

auth-prompt-password = Pasfhocal
auth-prompt-username = Ainm úsáideora
auth-prompt-back = Ar ais
auth-prompt-submit = Seol
auth-prompt-wrong-password = Níor oibrigh an pasfhocal sin
auth-prompt-failed = Níor oibrigh sé sin. Bain triail eile as.
fingerprint-not-recognized = Níor aithníodh an méarlorg

## Administrator authentication

polkit-title = Fíordheimhniú riachtanach
polkit-administrator = Riarthóir
polkit-password = Pasfhocal
polkit-cancel = Cealaigh
polkit-authenticate = Fíordheimhnigh
polkit-failed = Níor oibrigh sé sin. Bain triail eile as.

## Log out, power off and restart dialog

end-session-log-out-user = Sínigh amach { $userName }
end-session-log-out-title = Sínigh amach
end-session-log-out-user-countdown = { $seconds ->
    [one] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [two] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [few] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } shoicind
    [many] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } soicind
   *[other] Sínfear { $userName } amach go huathoibríoch i gceann { $seconds } soicind
}
end-session-log-out-countdown = { $seconds ->
    [one] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [two] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [few] Sínfear amach thú go huathoibríoch i gceann { $seconds } shoicind
    [many] Sínfear amach thú go huathoibríoch i gceann { $seconds } soicind
   *[other] Sínfear amach thú go huathoibríoch i gceann { $seconds } soicind
}
end-session-log-out-button = Sínigh amach
end-session-power-off-title = Múch
end-session-power-off-updates-title = Suiteáil nuashonruithe agus múch
end-session-power-off-countdown = { $seconds ->
    [one] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [two] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [few] Múchfar an córas go huathoibríoch i gceann { $seconds } shoicind
    [many] Múchfar an córas go huathoibríoch i gceann { $seconds } soicind
   *[other] Múchfar an córas go huathoibríoch i gceann { $seconds } soicind
}
end-session-power-off-button = Múch
end-session-restart-title = Atosaigh
end-session-restart-updates-title = Suiteáil nuashonruithe agus atosaigh
end-session-restart-countdown = { $seconds ->
    [one] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [two] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [few] Atosófar an córas go huathoibríoch i gceann { $seconds } shoicind
    [many] Atosófar an córas go huathoibríoch i gceann { $seconds } soicind
   *[other] Atosófar an córas go huathoibríoch i gceann { $seconds } soicind
}
end-session-restart-button = Atosaigh
end-session-update-restart-title = Atosaigh agus suiteáil nuashonruithe
end-session-update-restart-countdown = { $seconds ->
    [one] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [two] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [few] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } shoicind
    [many] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } soicind
   *[other] Atosófar an córas agus suiteálfar nuashonruithe go huathoibríoch i gceann { $seconds } soicind
}
end-session-update-restart-button = Atosaigh agus suiteáil
end-session-install-updates = Suiteáil na nuashonruithe bogearraí atá ag fanacht
end-session-install-version = Suiteáil leagan { $version }
end-session-low-battery = Ceallra íseal: plugáil isteach sula suiteálann tú nuashonruithe
end-session-busy-apps = Tá roinnt aipeanna gnóthach nó tá obair gan sábháil iontu
end-session-other-users = Tá úsáideoirí eile sínithe isteach
end-session-cancel = Cealaigh
end-session-boot-options = Roghanna tosaithe
end-session-remote-user = { $userName } (cian)
end-session-console-user = { $userName } (consól)

## Lock screen clock

lock-clock-swipe-up = Scuab suas
lock-clock-click-or-press = Cliceáil nó brúigh eochair

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Fuinneog díghlasála
