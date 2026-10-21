## Window title bar buttons (screen-reader labels)

ui-window-minimize = Réduire
ui-window-maximize = Agrandir
ui-window-close = Fermer

## Text editing context menu

ui-edit-cut = Couper
ui-edit-copy = Copier
ui-edit-paste = Coller
ui-edit-select-all = Tout sélectionner

## Form controls

ui-select-placeholder = Choisir
ui-password-show = Afficher le mot de passe
ui-password-hide = Masquer le mot de passe
ui-toast-dismiss = Ignorer

## Media playback controls

ui-media-play = Lire
ui-media-pause = Pause
ui-media-mute = Couper le son
ui-media-unmute = Rétablir le son
ui-media-volume = Volume
ui-media-position = Position

## Pictures in documents

ui-remote-images-hidden = Les images provenant du Web sont masquées
ui-remote-images-show = Afficher

## Splitting a drive between Windows and Luft

ui-split-space = Espace pour Luft
ui-split-windows-size = { $size }, dont { $used } utilisés

## Recovery key

ui-recovery-key-label = Clé de récupération { $key }
ui-recovery-key-save = Enregistrer dans un fichier
ui-recovery-key-print = Imprimer
ui-recovery-key-copy = Copier
ui-recovery-key-saved = Enregistrée
ui-recovery-key-printing = Envoyée à l’imprimante
ui-recovery-key-copied = Copiée
ui-recovery-key-kept = J’ai enregistré ma clé de récupération

## Fingerprints
## Each finger has a name used as a title (the message value) and a form used inside
## a sentence (.inline), like "Place your … on the sensor." Adjust the case of .inline
## to fit those sentences.

ui-finger-right-index = Index droit
    .inline = index droit
ui-finger-left-index = Index gauche
    .inline = index gauche
ui-finger-right-thumb = Pouce droit
    .inline = pouce droit
ui-finger-left-thumb = Pouce gauche
    .inline = pouce gauche
ui-finger-right-middle = Majeur droit
    .inline = majeur droit
ui-finger-left-middle = Majeur gauche
    .inline = majeur gauche
ui-finger-right-ring = Annulaire droit
    .inline = annulaire droit
ui-finger-left-ring = Annulaire gauche
    .inline = annulaire gauche
ui-finger-right-little = Auriculaire droit
    .inline = auriculaire droit
ui-finger-left-little = Auriculaire gauche
    .inline = auriculaire gauche

ui-fingerprint-place = Posez votre { $finger } sur le capteur.
ui-fingerprint-swipe = Faites glisser votre { $finger } sur le capteur.
ui-fingerprint-stage-passed = C’est bon. Levez le doigt, puis posez-le de nouveau.
ui-fingerprint-stage-passed-swipe = C’est bon. Faites-le glisser de nouveau.
ui-fingerprint-retry = La lecture n’a pas fonctionné. Réessayez.
ui-fingerprint-swipe-too-short = Faites glisser un peu plus lentement.
ui-fingerprint-not-centered = Centrez votre doigt sur le capteur.
ui-fingerprint-remove-and-retry = Levez le doigt et réessayez.
ui-fingerprint-added = Empreinte ajoutée.
ui-fingerprint-full = Le lecteur n’a plus de place pour une autre empreinte.
ui-fingerprint-disconnected = Le lecteur d’empreintes ne répond plus. Réessayez dans un instant.
ui-fingerprint-duplicate = Ce doigt est déjà enregistré dans le lecteur, sans doute par Windows ou un autre compte. Utilisez un autre doigt.
ui-fingerprint-failed = Impossible d’ajouter cette empreinte. Réessayez.

## Sizes and times

ui-time-just-now = à l’instant
ui-time-yesterday = Hier à { $time }
ui-power-watts = { $watts } W

## Dialog buttons

ui-dialog-cancel = Annuler
ui-dialog-close = Fermer
ui-dialog-back = Retour
ui-dialog-continue = Continuer
ui-dialog-done = Terminé

## Passphrases

ui-passphrase-field = Phrase secrète
ui-passphrase-confirm = Confirmation
ui-passphrase-type-again = Répétez la saisie
ui-passphrase-length = { $min ->
    [one] Au moins { $min } caractère
   *[other] Au moins { $min } caractères
}
ui-passphrase-mismatch = Les phrases secrètes ne correspondent pas

## Encryption

ui-encryption-checking = Vérification…
