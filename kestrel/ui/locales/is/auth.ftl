## Sign-in screen, shown before anyone signs in

greeter-session = Seta
greeter-accessibility = Aðgengi
greeter-power = Orka
greeter-larger-text = Stærri texti
greeter-screen-reader = Skjálesari
greeter-suspend = Svefn
greeter-restart = Endurræsa
greeter-power-off = Slökkva
greeter-another-account = Annar aðgangur

## Lock screen

lock-screen-accessibility = Aðgengi
lock-screen-power = Orka
lock-screen-battery = Rafhlaða { $level }
lock-screen-screen-reader = Skjálesari
lock-screen-zoom = Aðdráttur
lock-screen-on-screen-keyboard = Skjályklaborð
lock-screen-high-contrast = Mikil birtuskil
lock-screen-dwell-click = Smella með bið
lock-screen-larger-text = Stærri texti
lock-screen-suspend = Svefn
lock-screen-restart = Endurræsa…
lock-screen-power-off = Slökkva…
lock-inhibit-reason = Kestrel þarf að læsa skjánum

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Vista í lyklakippunni
keyring-remember-for-app = Muna fyrir þetta forrit
keyring-fingerprint-allow = Snertu fingrafaralesarann til að leyfa
keyring-fingerprint-alternative = Eða snertu fingrafaralesarann
keyring-confirm = Staðfesta
keyring-allow = Leyfa
keyring-deny = Ekki leyfa
keyring-password = Lykilorð
keyring-mismatch = Færslurnar eru ekki eins
keyring-unlock = Taka úr lás
keyring-cancel = Hætta við

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Búa til aðgangslykil fyrir { $site }?
passkeys-register-account-by-app = { $app } vill vista aðgangslykil fyrir { $account }. Hann er geymdur á þessari tölvu.
passkeys-register-account = Forrit vill vista aðgangslykil fyrir { $account }. Hann er geymdur á þessari tölvu.
passkeys-register-by-app = { $app } vill vista aðgangslykil. Hann er geymdur á þessari tölvu.
passkeys-register = Forrit vill vista aðgangslykil. Hann er geymdur á þessari tölvu.
passkeys-sign-in-title = Skrá inn á { $site } með aðgangslykli?
passkeys-sign-in-choose-by-app = { $app } biður um aðgangslykil. Veldu aðganginn sem þú vilt skrá þig inn með.
passkeys-sign-in-choose = Forrit biður um aðgangslykil. Veldu aðganginn sem þú vilt skrá þig inn með.
passkeys-sign-in-by-app = { $app } biður um aðgangslykilinn þinn.
passkeys-sign-in = Forrit biður um aðgangslykilinn þinn.
passkeys-manage-title-by-app = Leyfa { $app } að sjá um aðgangslyklana þína?
passkeys-manage-title = Leyfa þessu forriti að sjá um aðgangslyklana þína?
passkeys-manage-description = Forritið sér fyrir hvaða vefsvæði þú átt aðgangslykla og getur fjarlægt þá.
passkeys-registered-title = Þú átt nú þegar aðgangslykil fyrir { $site }
passkeys-registered-description = Skráðu þig frekar inn með þeim sem þú átt.
passkeys-choose-title = Nota aðgangslyklana á þessari tölvu?
passkeys-choose-by-app = { $app } spyr hvar aðgangslykillinn þinn er.
passkeys-choose = Forrit spyr hvar aðgangslykillinn þinn er.
passkeys-use-password = Nota lykilorð
passkeys-password = Lykilorð
passkeys-cancel = Hætta við
passkeys-continue = Halda áfram
passkeys-ok = Í lagi
passkeys-use-this-computer = Nota þessa tölvu
passkeys-fingerprint-unavailable = Notaðu lykilorðið þitt til að halda áfram.
passkeys-wrong-password = Lykilorðið er ekki rétt. Reyndu aftur.

## Sign-in prompt

auth-prompt-password = Lykilorð
auth-prompt-username = Notandanafn
auth-prompt-back = Til baka
auth-prompt-submit = Senda
auth-prompt-wrong-password = Lykilorðið virkaði ekki
auth-prompt-failed = Þetta tókst ekki. Reyndu aftur.
fingerprint-not-recognized = Fingrafarið þekktist ekki

## Administrator authentication

polkit-title = Auðkenningar krafist
polkit-administrator = Stjórnandi
polkit-password = Lykilorð
polkit-cancel = Hætta við
polkit-authenticate = Auðkenna
polkit-failed = Þetta tókst ekki. Reyndu aftur.

## Log out, power off and restart dialog

end-session-log-out-user = Skrá { $userName } út
end-session-log-out-title = Skrá út
end-session-log-out-user-countdown = { $seconds ->
    [one] Notandinn { $userName } verður skráður út sjálfkrafa eftir { $seconds } sekúndu
   *[other] Notandinn { $userName } verður skráður út sjálfkrafa eftir { $seconds } sekúndur
}
end-session-log-out-countdown = { $seconds ->
    [one] Sjálfvirk útskráning eftir { $seconds } sekúndu
   *[other] Sjálfvirk útskráning eftir { $seconds } sekúndur
}
end-session-log-out-button = Skrá út
end-session-power-off-title = Slökkva
end-session-power-off-updates-title = Setja upp uppfærslur og slökkva
end-session-power-off-countdown = { $seconds ->
    [one] Slökkt verður á tölvunni sjálfkrafa eftir { $seconds } sekúndu
   *[other] Slökkt verður á tölvunni sjálfkrafa eftir { $seconds } sekúndur
}
end-session-power-off-button = Slökkva
end-session-restart-title = Endurræsa
end-session-restart-updates-title = Setja upp uppfærslur og endurræsa
end-session-restart-countdown = { $seconds ->
    [one] Tölvan endurræsist sjálfkrafa eftir { $seconds } sekúndu
   *[other] Tölvan endurræsist sjálfkrafa eftir { $seconds } sekúndur
}
end-session-restart-button = Endurræsa
end-session-update-restart-title = Endurræsa og setja upp uppfærslur
end-session-update-restart-countdown = { $seconds ->
    [one] Tölvan endurræsist sjálfkrafa og setur upp uppfærslur eftir { $seconds } sekúndu
   *[other] Tölvan endurræsist sjálfkrafa og setur upp uppfærslur eftir { $seconds } sekúndur
}
end-session-update-restart-button = Endurræsa og setja upp
end-session-install-updates = Setja upp hugbúnaðaruppfærslur sem bíða
end-session-install-version = Setja upp útgáfu { $version }
end-session-low-battery = Lítil hleðsla á rafhlöðu: tengdu tölvuna við rafmagn áður en uppfærslur eru settar upp
end-session-busy-apps = Sum forrit eru upptekin eða með óvistaða vinnu
end-session-other-users = Aðrir notendur eru skráðir inn
end-session-cancel = Hætta við
end-session-boot-options = Ræsivalkostir
end-session-remote-user = { $userName } (fjartenging)
end-session-console-user = { $userName } (textaskjár)

## Lock screen clock

lock-clock-swipe-up = Strjúktu upp
lock-clock-click-or-press = Smelltu eða ýttu á lykil

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Innskráningargluggi
