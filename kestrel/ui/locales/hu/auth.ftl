## Sign-in screen, shown before anyone signs in

greeter-session = Munkamenet
greeter-accessibility = Akadálymentesség
greeter-power = Tápellátás
greeter-larger-text = Nagy szöveg
greeter-screen-reader = Képernyőolvasó
greeter-suspend = Alvó állapot
greeter-restart = Újraindítás
greeter-power-off = Leállítás
greeter-another-account = Másik fiók

## Lock screen

lock-screen-accessibility = Akadálymentesség
lock-screen-power = Tápellátás
lock-screen-battery = Akkumulátor: { $level }
lock-screen-screen-reader = Képernyőolvasó
lock-screen-zoom = Nagyítás
lock-screen-on-screen-keyboard = Képernyő-billentyűzet
lock-screen-high-contrast = Nagy kontraszt
lock-screen-dwell-click = Kattintás a mutató megállításával
lock-screen-larger-text = Nagy szöveg
lock-screen-suspend = Alvó állapot
lock-screen-restart = Újraindítás…
lock-screen-power-off = Leállítás…
lock-inhibit-reason = A Kestrelnek zárolnia kell a képernyőt

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Mentés a kulcstartóba
keyring-remember-for-app = Megjegyzés ehhez az alkalmazáshoz
keyring-fingerprint-allow = Az engedélyezéshez érintse meg az ujjlenyomat-olvasót
keyring-fingerprint-alternative = Vagy érintse meg az ujjlenyomat-olvasót
keyring-confirm = Megerősítés
keyring-allow = Engedélyezés
keyring-deny = Elutasítás
keyring-password = Jelszó
keyring-mismatch = A beírt jelszavak nem egyeznek
keyring-unlock = Feloldás
keyring-cancel = Mégse

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Létrehoz egy jelkulcsot ehhez a webhelyhez: { $site }?
passkeys-register-account-by-app = { $app } jelkulcsot szeretne menteni ehhez a fiókhoz: { $account }. A jelkulcs ezen a számítógépen marad.
passkeys-register-account = Egy alkalmazás jelkulcsot szeretne menteni ehhez a fiókhoz: { $account }. A jelkulcs ezen a számítógépen marad.
passkeys-register-by-app = { $app } jelkulcsot szeretne menteni. A jelkulcs ezen a számítógépen marad.
passkeys-register = Egy alkalmazás jelkulcsot szeretne menteni. A jelkulcs ezen a számítógépen marad.
passkeys-sign-in-title = Bejelentkezik jelkulccsal ide: { $site }?
passkeys-sign-in-choose-by-app = { $app } jelkulcsot kér. Válassza ki, melyik fiókkal jelentkezik be.
passkeys-sign-in-choose = Egy alkalmazás jelkulcsot kér. Válassza ki, melyik fiókkal jelentkezik be.
passkeys-sign-in-by-app = { $app } a jelkulcsát kéri.
passkeys-sign-in = Egy alkalmazás a jelkulcsát kéri.
passkeys-manage-title-by-app = Engedélyezi, hogy { $app } kezelje a jelkulcsait?
passkeys-manage-title = Engedélyezi, hogy ez az alkalmazás kezelje a jelkulcsait?
passkeys-manage-description = Látni fogja, mely webhelyekhez van jelkulcsa, és el is távolíthatja őket.
passkeys-registered-title = Már van jelkulcsa ehhez a webhelyhez: { $site }
passkeys-registered-description = Jelentkezzen be inkább a meglévővel.
passkeys-choose-title = A számítógépen tárolt jelkulcsokat használja?
passkeys-choose-by-app = { $app } azt kérdezi, hol található a jelkulcsa.
passkeys-choose = Egy alkalmazás azt kérdezi, hol található a jelkulcsa.
passkeys-use-password = Jelszó használata
passkeys-password = Jelszó
passkeys-cancel = Mégse
passkeys-continue = Folytatás
passkeys-ok = OK
passkeys-use-this-computer = Ez a számítógép
passkeys-fingerprint-unavailable = A folytatáshoz adja meg a jelszavát.
passkeys-wrong-password = Ez a jelszó nem megfelelő. Próbálja újra.

## Sign-in prompt

auth-prompt-password = Jelszó
auth-prompt-username = Felhasználónév
auth-prompt-back = Vissza
auth-prompt-submit = Küldés
auth-prompt-wrong-password = Ez a jelszó nem működött
auth-prompt-failed = Ez nem sikerült. Próbálja újra.
fingerprint-not-recognized = Nem felismert ujjlenyomat

## Administrator authentication

polkit-title = Hitelesítés szükséges
polkit-administrator = Rendszergazda
polkit-password = Jelszó
polkit-cancel = Mégse
polkit-authenticate = Hitelesítés
polkit-failed = Ez nem sikerült. Próbálja újra.

## Log out, power off and restart dialog

end-session-log-out-user = Kijelentkezés: { $userName }
end-session-log-out-title = Kijelentkezés
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } { $seconds } másodperc múlva automatikusan kijelentkezik
   *[other] { $userName } { $seconds } másodperc múlva automatikusan kijelentkezik
}
end-session-log-out-countdown = { $seconds ->
    [one] { $seconds } másodperc múlva automatikusan kijelentkezik
   *[other] { $seconds } másodperc múlva automatikusan kijelentkezik
}
end-session-log-out-button = Kijelentkezés
end-session-power-off-title = Leállítás
end-session-power-off-updates-title = Frissítések telepítése és leállítás
end-session-power-off-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan leáll
   *[other] A rendszer { $seconds } másodperc múlva automatikusan leáll
}
end-session-power-off-button = Leállítás
end-session-restart-title = Újraindítás
end-session-restart-updates-title = Frissítések telepítése és újraindítás
end-session-restart-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan újraindul
   *[other] A rendszer { $seconds } másodperc múlva automatikusan újraindul
}
end-session-restart-button = Újraindítás
end-session-update-restart-title = Újraindítás és frissítések telepítése
end-session-update-restart-countdown = { $seconds ->
    [one] A rendszer { $seconds } másodperc múlva automatikusan újraindul, és telepíti a frissítéseket
   *[other] A rendszer { $seconds } másodperc múlva automatikusan újraindul, és telepíti a frissítéseket
}
end-session-update-restart-button = Újraindítás és telepítés
end-session-install-updates = Függőben lévő frissítések telepítése
end-session-install-version = { $version } verzió telepítése
end-session-version-nightly = { $release }, { $number }. éjszakai build
end-session-low-battery = Alacsony töltöttség: a frissítések telepítése előtt csatlakoztassa a töltőt
end-session-busy-apps = Néhány alkalmazás még dolgozik, vagy nem mentett munkát tartalmaz
end-session-other-users = Más felhasználók is be vannak jelentkezve
end-session-cancel = Mégse
end-session-boot-options = Rendszerindítási lehetőségek
end-session-remote-user = { $userName } (távoli)
end-session-console-user = { $userName } (konzol)

## Lock screen clock

lock-clock-swipe-up = Csúsztasson felfelé
lock-clock-click-or-press = Kattintson, vagy nyomjon le egy billentyűt

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Feloldási ablak
