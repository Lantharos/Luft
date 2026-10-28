## Sign-in screen, shown before anyone signs in

greeter-session = Seansas
greeter-accessibility = Prieinamumas
greeter-power = Maitinimas
greeter-larger-text = Didesnis tekstas
greeter-screen-reader = Ekrano skaitytuvas
greeter-suspend = Miego režimas
greeter-restart = Paleisti iš naujo
greeter-power-off = Išjungti
greeter-another-account = Kita paskyra

## Lock screen

lock-screen-accessibility = Prieinamumas
lock-screen-power = Maitinimas
lock-screen-battery = Akumuliatorius { $level }
lock-screen-screen-reader = Ekrano skaitytuvas
lock-screen-zoom = Didinimas
lock-screen-on-screen-keyboard = Ekrano klaviatūra
lock-screen-high-contrast = Didelis kontrastas
lock-screen-dwell-click = Spustelėjimas užlaikius
lock-screen-larger-text = Didesnis tekstas
lock-screen-suspend = Miego režimas
lock-screen-restart = Paleisti iš naujo…
lock-screen-power-off = Išjungti…
lock-inhibit-reason = Kestrel turi užrakinti ekraną

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Įrašyti į raktinę
keyring-remember-for-app = Įsiminti šiai programai
keyring-fingerprint-allow = Palieskite piršto atspaudų skaitytuvą, kad leistumėte
keyring-fingerprint-alternative = Arba palieskite piršto atspaudų skaitytuvą
keyring-confirm = Pakartokite
keyring-allow = Leisti
keyring-deny = Neleisti
keyring-password = Slaptažodis
keyring-mismatch = Įvesti slaptažodžiai nesutampa
keyring-unlock = Atrakinti
keyring-cancel = Atšaukti

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Sukurti prieigos raktą svetainei { $site }?
passkeys-register-account-by-app = { $app } nori įrašyti prieigos raktą paskyrai { $account }. Jis liks šiame kompiuteryje.
passkeys-register-account = Programa nori įrašyti prieigos raktą paskyrai { $account }. Jis liks šiame kompiuteryje.
passkeys-register-by-app = { $app } nori įrašyti prieigos raktą. Jis liks šiame kompiuteryje.
passkeys-register = Programa nori įrašyti prieigos raktą. Jis liks šiame kompiuteryje.
passkeys-sign-in-title = Prisijungti prie svetainės { $site } prieigos raktu?
passkeys-sign-in-choose-by-app = { $app } prašo prieigos rakto. Pasirinkite paskyrą, kuria prisijungsite.
passkeys-sign-in-choose = Programa prašo prieigos rakto. Pasirinkite paskyrą, kuria prisijungsite.
passkeys-sign-in-by-app = { $app } prašo jūsų prieigos rakto.
passkeys-sign-in = Programa prašo jūsų prieigos rakto.
passkeys-manage-title-by-app = Leisti programai { $app } tvarkyti jūsų prieigos raktus?
passkeys-manage-title = Leisti šiai programai tvarkyti jūsų prieigos raktus?
passkeys-manage-description = Ji matys, kurioms svetainėms turite prieigos raktų, ir galės juos pašalinti.
passkeys-registered-title = Svetainei { $site } jau turite prieigos raktą
passkeys-registered-description = Prisijunkite turimu raktu.
passkeys-choose-title = Naudoti šiame kompiuteryje esančius prieigos raktus?
passkeys-choose-by-app = { $app } klausia, kur yra jūsų prieigos raktas.
passkeys-choose = Programa klausia, kur yra jūsų prieigos raktas.
passkeys-use-password = Naudoti slaptažodį
passkeys-password = Slaptažodis
passkeys-cancel = Atšaukti
passkeys-continue = Tęsti
passkeys-ok = Gerai
passkeys-use-this-computer = Naudoti šį kompiuterį
passkeys-fingerprint-unavailable = Norėdami tęsti, įveskite slaptažodį.
passkeys-wrong-password = Slaptažodis neteisingas. Bandykite dar kartą.

## Sign-in prompt

auth-prompt-password = Slaptažodis
auth-prompt-username = Naudotojo vardas
auth-prompt-back = Atgal
auth-prompt-submit = Pateikti
auth-prompt-wrong-password = Slaptažodis netinka
auth-prompt-failed = Nepavyko. Bandykite dar kartą.
fingerprint-not-recognized = Piršto atspaudas neatpažintas
fingerprint-scanning = Palieskite piršto atspaudų skaitytuvą
fingerprint-retry-scan = Nuskaitykite pirštą dar kartą
fingerprint-swipe-too-short = Perbraukimas buvo per trumpas, bandykite dar kartą
fingerprint-finger-not-centered = Padėkite pirštą per vidurį ir bandykite dar kartą
fingerprint-remove-and-retry = Pakelkite pirštą ir bandykite dar kartą
fingerprint-unavailable = Piršto atspaudas nepasiekiamas, įveskite slaptažodį
auth-prompt-use-password = Naudoti slaptažodį
auth-prompt-try-fingerprint = Bandyti piršto atspaudą dar kartą
auth-prompt-use-fingerprint = Naudoti piršto atspaudą
auth-prompt-show-password = Rodyti slaptažodį

## Administrator authentication

polkit-title = Reikia patvirtinti tapatybę
polkit-administrator = Administratorius
polkit-password = Slaptažodis
polkit-cancel = Atšaukti
polkit-authenticate = Patvirtinti
polkit-failed = Nepavyko. Bandykite dar kartą.

## Log out, power off and restart dialog

end-session-log-out-user = Atjungti naudotoją { $userName }
end-session-log-out-title = Atsijungti
end-session-log-out-user-countdown = { $seconds ->
    [one] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundės
    [few] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundžių
    [many] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundės
   *[other] Naudotojas { $userName } bus automatiškai atjungtas po { $seconds } sekundžių
}
end-session-log-out-countdown = { $seconds ->
    [one] Būsite automatiškai atjungti po { $seconds } sekundės
    [few] Būsite automatiškai atjungti po { $seconds } sekundžių
    [many] Būsite automatiškai atjungti po { $seconds } sekundės
   *[other] Būsite automatiškai atjungti po { $seconds } sekundžių
}
end-session-log-out-button = Atsijungti
end-session-power-off-title = Išjungti
end-session-power-off-updates-title = Įdiegti naujinimus ir išjungti
end-session-power-off-countdown = { $seconds ->
    [one] Sistema bus automatiškai išjungta po { $seconds } sekundės
    [few] Sistema bus automatiškai išjungta po { $seconds } sekundžių
    [many] Sistema bus automatiškai išjungta po { $seconds } sekundės
   *[other] Sistema bus automatiškai išjungta po { $seconds } sekundžių
}
end-session-power-off-button = Išjungti
end-session-restart-title = Paleisti iš naujo
end-session-restart-updates-title = Įdiegti naujinimus ir paleisti iš naujo
end-session-restart-countdown = { $seconds ->
    [one] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundės
    [few] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundžių
    [many] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundės
   *[other] Sistema bus automatiškai paleista iš naujo po { $seconds } sekundžių
}
end-session-restart-button = Paleisti iš naujo
end-session-update-restart-title = Paleisti iš naujo ir įdiegti naujinimus
end-session-update-restart-countdown = { $seconds ->
    [one] Po { $seconds } sekundės sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
    [few] Po { $seconds } sekundžių sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
    [many] Po { $seconds } sekundės sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
   *[other] Po { $seconds } sekundžių sistema bus automatiškai paleista iš naujo ir bus įdiegti naujinimai
}
end-session-update-restart-button = Paleisti iš naujo ir įdiegti
end-session-install-updates = Įdiegti laukiančius programinės įrangos naujinimus
end-session-install-version = Įdiegti versiją { $version }
end-session-version-nightly = { $release } naktinė versija { $number }
end-session-low-battery = Akumuliatorius beveik išsikrovęs: prieš diegdami naujinimus prijunkite maitinimą
end-session-busy-apps = Kai kurios programos užimtos arba turi neįrašytų darbų
end-session-other-users = Prisijungę kiti naudotojai
end-session-cancel = Atšaukti
end-session-boot-options = Paleisties parinktys
end-session-remote-user = { $userName } (nuotoliniu būdu)
end-session-console-user = { $userName } (konsolėje)

## Lock screen clock


## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Atrakinimo langas
