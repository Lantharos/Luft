# French style guide

How Luft speaks French, as written in France. The [glossary](../../packages/i18n/glossary/fr.tbx) has the agreed terms; Weblate shows them next to every string.

## Address and tone

- Address the reader as **vous**, lowercase, as macOS, Windows, GNOME and KDE all do in French: « Vous pourrez le modifier plus tard dans les Paramètres. » Never « tu », and never a capitalized Vous or Votre.
- Prefer sentences without a person when they read just as well: « Aucune notification » for “You have no notifications”, « Les mises à jour seront installées au prochain redémarrage ».
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as « Veuillez » at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Instructions in running text use the imperative with vous: « Appuyez sur Super+Tab pour afficher toutes les fenêtres. »

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in every French OS: « Enregistrer », « Ouvrir », « Annuler », « Redémarrer », « Épingler à la barre des tâches ».
- A few fixed buttons are not verbs: « Suivant », « Terminé », « OK ».
- Switches and settings are nouns or short phrases: « Éclairage nocturne », « Afficher les secondes ».
- Headings and page names are nouns without an article: « Notifications », « Confidentialité ».
- Status lines use a past participle that agrees with what it describes: « Clé copiée », « Fichier enregistré ». When the subject isn't visible, build the sentence so agreement doesn't depend on a placeable.
- Keep labels short. French runs about a fifth longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. « Paramètres rapides », not « Paramètres Rapides ». In running text, Luft's parts are ordinary nouns: « la barre des tâches », « l’écran de verrouillage ». Capitals keep their accents: « Écrans », « À propos », « Échap ». The Settings app is « les Paramètres » with a capital, the general word « paramètres » without; the same goes for the Corbeille.

## Typography

- Quotation marks: « … », with a narrow no-break space (U+202F) inside each guillemet. Inside them use “…” without spaces.
- Apostrophe: the typographic ’, never '.
- A narrow no-break space (U+202F) goes before ; ! and ?, and a no-break space (U+00A0) before :. Since Luft avoids exclamation marks, the question mark and colon are the usual cases: « Supprimer ce fichier ? », « Dernière vérification : { $date } ».
- Percent sign and units take a no-break space (U+00A0) before them: « 57 % », « 4,5 W ». The space goes in the translation, outside the placeable.
- Ellipsis: one character, « … », with no space before it: « Chargement… ».
- Dash: the en dash with spaces, «  –  ».
- Key names follow French keyboards: Ctrl, Alt, Maj, Entrée, Échap, Espace, Retour arrière, Suppr, Inser, Origine, Fin, Pg préc, Pg suiv, Impr écran. Super stays Super.
- Write « e-mail », as Windows and macOS do, not « courriel » or « mail », and « en ligne » for online.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Paramètres, Disques, Installer Luft.
- Start stays Start; say « le menu Start » in running text.
- App names take no article and don't change. Their gender is that of « application », feminine, but avoid making anything agree with the bare name: write « l’application Rover est fermée » rather than « Rover est fermé ». Luft is masculine (le système): « Luft est à jour ».
- Before a name starting with a vowel, elide as usual: « l’application », « d’Helium » (the h of Helium is mute).

## Plurals

French has `one` for 0 and 1, `many` for exact multiples of a million, and `other` for everything else. Luft never counts in millions, so `many` is left out and those numbers fall to `other`. Because `one` also covers 0, a sentence in `one` must read well with « 0 ». Always write `{ $count }`, never the digit:

```ftl
windows-open = { $count ->
    [one] { $count } fenêtre ouverte
   *[other] { $count } fenêtres ouvertes
}
```

When English has an exact `[0]` variant, keep it and translate it: `[0] Aucune notification`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its gender and number don't matter: « Dernière vérification : { $date } ».

## Decisions

| English | French | Instead of | Why |
| --- | --- | --- | --- |
| you | vous, or no person | tu | macOS, Windows, GNOME and KDE |
| Settings | Paramètres | Réglages, Configuration | Windows and GNOME; macOS's Réglages is Apple-specific |
| app | application, la | app, logiciel | Windows and GNOME; app reads casual in France |
| & in page names | et | & | What Windows and macOS write in French |
| board | tableau, le | planche, toile | Short and familiar from board-style apps; toile is the canvas inside it |
| All windows | Toutes les fenêtres | Vue des tâches | That's what Luft calls the task view |
| snap, snap layout | ancrer, disposition d’ancrage | aimanter, magnétiser | Windows' words |
| tray | barre d’état système | zone de notification | Windows' old name, but it holds apps, not notifications, and would clash with the centre de notifications |
| workspace | espace de travail | bureau virtuel | GNOME and KDE; bureau is the desktop |
| wallpaper | fond d’écran | arrière-plan | The everyday word; arrière-plan is ambiguous next to colors |
| accent color | couleur d’accentuation | couleur d’accent | Windows |
| Night light | Éclairage nocturne | Lumière nocturne, Veilleuse | Windows and GNOME |
| suspend, sleep | mettre en veille, veille | suspendre | Windows and macOS |
| shut down | éteindre | arrêter | macOS and GNOME; arrêter is ambiguous for apps and timers |
| passkey | clé d’accès | passkey, clé d’identification | Windows and Google; Apple's word is less widespread |
| Keyring | trousseau | porte-clés | macOS and GNOME |
| encryption | chiffrement | cryptage | Correct French term; Windows and GNOME |
| firmware | micrologiciel | firmware, microprogramme | GNOME and KDE; firmware stays as a search word |
| touchpad | pavé tactile | touchpad | Windows and GNOME |
| remove, delete | retirer, supprimer | supprimer for both | Keeps taking something out of a list apart from destroying it; a Remove button that deletes files, keys or settings says supprimer |
| Wi-Fi | Wi-Fi | WiFi, wifi | Official spelling, used by every French OS |
| passphrase | phrase secrète | phrase de passe, mot de passe | Kept apart from the account password |
| PIN | code PIN, le | PIN alone | Windows Hello and phones |
| input source | source de saisie | source d’entrée | GNOME; covers layouts and input methods |
| Caps Lock, Num Lock | Verr. Maj, Verr. Num | Verr Maj, Verrouillage majuscules | What Windows shows in French |
| metered connection | connexion limitée | connexion facturée à l’usage | Short; Windows' wording is too long for a switch |
| Take a screenshot | Prendre une capture d’écran | Faire une capture d’écran | One verb everywhere |
| Desktop { $number } in All windows | Espace de travail { $number } | Bureau { $number } | It names a workspace |
| Type it again | Saisissez-le de nouveau | Tapez-le de nouveau | Répétez la saisie where the field can be a PIN or a passphrase |
