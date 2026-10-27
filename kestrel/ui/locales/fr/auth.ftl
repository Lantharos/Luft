## Sign-in screen, shown before anyone signs in

greeter-session = Session
greeter-accessibility = Accessibilité
greeter-power = Alimentation
greeter-larger-text = Texte agrandi
greeter-screen-reader = Lecteur d’écran
greeter-suspend = Mettre en veille
greeter-restart = Redémarrer
greeter-power-off = Éteindre
greeter-another-account = Autre compte

## Lock screen

lock-screen-accessibility = Accessibilité
lock-screen-power = Alimentation
lock-screen-battery = Batterie { $level }
lock-screen-screen-reader = Lecteur d’écran
lock-screen-zoom = Zoom
lock-screen-on-screen-keyboard = Clavier visuel
lock-screen-high-contrast = Contraste élevé
lock-screen-dwell-click = Clic au survol
lock-screen-larger-text = Texte agrandi
lock-screen-suspend = Mettre en veille
lock-screen-restart = Redémarrer…
lock-screen-power-off = Éteindre…
lock-inhibit-reason = Kestrel doit verrouiller l’écran

## Keyring and passphrase prompts. Apps usually supply their own text; these are the defaults

keyring-save = Enregistrer dans votre trousseau
keyring-remember-for-app = Mémoriser pour cette application
keyring-fingerprint-allow = Touchez le lecteur d’empreintes pour autoriser
keyring-fingerprint-alternative = Ou touchez le lecteur d’empreintes
keyring-confirm = Confirmer
keyring-allow = Autoriser
keyring-deny = Ne pas autoriser
keyring-password = Mot de passe
keyring-mismatch = Les saisies ne correspondent pas
keyring-unlock = Déverrouiller
keyring-cancel = Annuler

## Passkey prompts. $site is a website's domain, $app the name of the app asking, $account a user name or email address

passkeys-register-title = Créer une clé d’accès pour { $site } ?
passkeys-register-account-by-app = { $app } veut enregistrer une clé d’accès pour { $account }. Elle reste sur cet ordinateur.
passkeys-register-account = Une application veut enregistrer une clé d’accès pour { $account }. Elle reste sur cet ordinateur.
passkeys-register-by-app = { $app } veut enregistrer une clé d’accès. Elle reste sur cet ordinateur.
passkeys-register = Une application veut enregistrer une clé d’accès. Elle reste sur cet ordinateur.
passkeys-sign-in-title = Se connecter à { $site } avec votre clé d’accès ?
passkeys-sign-in-choose-by-app = { $app } demande une clé d’accès. Choisissez le compte avec lequel vous connecter.
passkeys-sign-in-choose = Une application demande une clé d’accès. Choisissez le compte avec lequel vous connecter.
passkeys-sign-in-by-app = { $app } demande votre clé d’accès.
passkeys-sign-in = Une application demande votre clé d’accès.
passkeys-manage-title-by-app = Autoriser { $app } à gérer vos clés d’accès ?
passkeys-manage-title = Autoriser cette application à gérer vos clés d’accès ?
passkeys-manage-description = Elle verra pour quels sites vous avez des clés d’accès et pourra les supprimer.
passkeys-registered-title = Vous avez déjà une clé d’accès pour { $site }
passkeys-registered-description = Connectez-vous plutôt avec celle-ci.
passkeys-choose-title = Utiliser les clés d’accès de cet ordinateur ?
passkeys-choose-by-app = { $app } demande où se trouve votre clé d’accès.
passkeys-choose = Une application demande où se trouve votre clé d’accès.
passkeys-use-password = Utiliser le mot de passe
passkeys-password = Mot de passe
passkeys-cancel = Annuler
passkeys-continue = Continuer
passkeys-ok = OK
passkeys-use-this-computer = Utiliser cet ordinateur
passkeys-fingerprint-unavailable = Utilisez votre mot de passe pour continuer.
passkeys-wrong-password = Ce mot de passe est incorrect. Réessayez.

## Sign-in prompt

auth-prompt-password = Mot de passe
auth-prompt-username = Nom d’utilisateur
auth-prompt-back = Retour
auth-prompt-submit = Valider
auth-prompt-wrong-password = Ce mot de passe n’a pas fonctionné
auth-prompt-failed = Cela n’a pas fonctionné. Réessayez.
fingerprint-not-recognized = Empreinte non reconnue

## Administrator authentication

polkit-title = Authentification requise
polkit-administrator = Administrateur
polkit-password = Mot de passe
polkit-cancel = Annuler
polkit-authenticate = S’authentifier
polkit-failed = Cela n’a pas fonctionné. Réessayez.

## Log out, power off and restart dialog

end-session-log-out-user = Déconnecter { $userName }
end-session-log-out-title = Se déconnecter
end-session-log-out-user-countdown = { $seconds ->
    [one] { $userName } sera déconnecté automatiquement dans { $seconds } seconde
   *[other] { $userName } sera déconnecté automatiquement dans { $seconds } secondes
}
end-session-log-out-countdown = { $seconds ->
    [one] Vous serez déconnecté automatiquement dans { $seconds } seconde
   *[other] Vous serez déconnecté automatiquement dans { $seconds } secondes
}
end-session-log-out-button = Se déconnecter
end-session-power-off-title = Éteindre
end-session-power-off-updates-title = Installer les mises à jour et éteindre
end-session-power-off-countdown = { $seconds ->
    [one] L’ordinateur s’éteindra automatiquement dans { $seconds } seconde
   *[other] L’ordinateur s’éteindra automatiquement dans { $seconds } secondes
}
end-session-power-off-button = Éteindre
end-session-restart-title = Redémarrer
end-session-restart-updates-title = Installer les mises à jour et redémarrer
end-session-restart-countdown = { $seconds ->
    [one] L’ordinateur redémarrera automatiquement dans { $seconds } seconde
   *[other] L’ordinateur redémarrera automatiquement dans { $seconds } secondes
}
end-session-restart-button = Redémarrer
end-session-update-restart-title = Redémarrer et installer les mises à jour
end-session-update-restart-countdown = { $seconds ->
    [one] L’ordinateur redémarrera automatiquement et installera les mises à jour dans { $seconds } seconde
   *[other] L’ordinateur redémarrera automatiquement et installera les mises à jour dans { $seconds } secondes
}
end-session-update-restart-button = Redémarrer et installer
end-session-install-updates = Installer les mises à jour en attente
end-session-install-version = Installer la version { $version }
end-session-version-nightly = { $release } Nightly { $number }
end-session-low-battery = Batterie faible : branchez l’ordinateur avant d’installer les mises à jour
end-session-busy-apps = Certaines applications sont occupées ou ont du travail non enregistré
end-session-other-users = D’autres utilisateurs sont connectés
end-session-cancel = Annuler
end-session-boot-options = Options de démarrage
end-session-remote-user = { $userName } (à distance)
end-session-console-user = { $userName } (console)

## Lock screen clock

lock-clock-swipe-up = Balayez vers le haut
lock-clock-click-or-press = Cliquez ou appuyez sur une touche

## Ctrl+Alt+Tab switcher, which moves keyboard focus between parts of the desktop

ctrl-alt-tab-unlock = Fenêtre de déverrouillage
