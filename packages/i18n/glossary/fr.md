# French

What is particular to French, on top of [the rules every language shares](common.md). The agreed terms are in [fr.tbx](fr.tbx).

## Address

Address the reader as vous, lowercase, as macOS, Windows, GNOME and KDE do: « Vous pourrez le modifier plus tard dans les Paramètres. » Never tu, and never Vous or Votre with a capital. Leave the person out when the sentence reads as well: « Aucune notification ». Instructions take the imperative with vous: « Appuyez sur Super+Tab pour afficher toutes les fenêtres. »

## Buttons and labels

- Buttons and menu items take the infinitive: « Enregistrer », « Ouvrir », « Annuler », « Épingler à la barre des tâches ». A few fixed buttons aren't verbs: « Suivant », « Terminé », « OK ».
- Headings and page names are nouns without an article: « Notifications », « Confidentialité ». Page names use et, never &.
- Status lines use a past participle that agrees: « Clé copiée », « Fichier enregistré ». When the subject isn't visible, build the sentence so agreement doesn't hang on a variable.
- Capitals keep their accents: « Écrans », « À propos », « Échap ». The Settings app is « les Paramètres » with a capital; the general word « paramètres » has none. The same goes for the Corbeille.

## Typography

- Quotation marks « … », with a narrow no-break space (U+202F) inside each guillemet, and “…” without spaces inside them.
- The apostrophe is always ’.
- A narrow no-break space goes before ; ! and ?, and a no-break space (U+00A0) before the colon: « Supprimer ce fichier ? », « Dernière vérification : { $date } ».
- Percent signs and units take a no-break space, written in the translation outside the variable: « 57 % », « 4,5 W ».
- The dash is an en dash with spaces.
- Keys follow French keyboards: Ctrl, Alt, Maj, Entrée, Échap, Espace, Retour arrière, Suppr, Inser, Origine, Fin, Pg préc, Pg suiv, Impr écran, Verr. Maj, Verr. Num. Super stays Super.
- Write « e-mail », not courriel or mail, and « en ligne ».

## Names

- Settings, Disks and Install Luft are Paramètres, Disques and Installer Luft. Start stays Start: « le menu Start ».
- App names take no article and don't change. Their gender would be that of application, but avoid agreeing with the bare name: « l’application Rover est fermée », not « Rover est fermé ». Luft is masculine: « Luft est à jour ».
- Elide before a vowel or mute h as usual: « l’application », « d’Helium ».

## Plurals

`one` covers 0 and 1, `other` the rest; `many`, for exact millions, never happens in Luft and is left out. A sentence in `one` must read well with 0.

```ftl
windows-open = { $count ->
    [one] { $count } fenêtre ouverte
   *[other] { $count } fenêtres ouvertes
}
```

## Words

| English | French | Not | Why |
| --- | --- | --- | --- |
| Settings | Paramètres | Réglages, Configuration | Windows and GNOME; Réglages is Apple's |
| app | application, la | app, logiciel | Windows and GNOME; app reads casual in France |
| board | tableau, le | planche, toile | Short and familiar; toile is the canvas inside it |
| All windows | Toutes les fenêtres | Vue des tâches | What Luft calls the task view |
| snap, snap layout | ancrer, disposition d’ancrage | aimanter | Windows' words |
| tray | barre d’état système | zone de notification | It holds apps, and would clash with the centre de notifications |
| workspace | espace de travail | bureau virtuel | GNOME and KDE; bureau is the desktop, also in All windows |
| wallpaper | fond d’écran | arrière-plan | The everyday word; arrière-plan is ambiguous next to colours |
| accent color | couleur d’accentuation | couleur d’accent | Windows |
| Night light | Éclairage nocturne | Veilleuse | Windows and GNOME |
| suspend, sleep | mettre en veille, veille | suspendre | Windows and macOS |
| shut down | éteindre | arrêter | macOS and GNOME; arrêter is ambiguous for apps and timers |
| Keyring | trousseau | porte-clés | macOS and GNOME |
| encryption | chiffrement | cryptage | The correct term; Windows and GNOME |
| firmware | micrologiciel | firmware | GNOME and KDE; firmware stays a search word |
| touchpad | pavé tactile | touchpad | Windows and GNOME |
| remove, delete | retirer, supprimer | supprimer for both | Retirer takes out of a list; a Remove that deletes files, keys or settings says supprimer |
| passphrase | phrase secrète | mot de passe | Apart from the account password |
| PIN | code PIN, le | PIN alone | Windows Hello and phones |
| input source | source de saisie | source d’entrée | GNOME; covers layouts and input methods |
| metered connection | connexion limitée | connexion facturée à l’usage | Windows' wording is too long for a switch |
| take a screenshot | prendre une capture d’écran | faire une capture | One verb everywhere |
| Type it again | Saisissez-le de nouveau | Tapez-le de nouveau | Répétez la saisie where the field can be a PIN or a passphrase |
