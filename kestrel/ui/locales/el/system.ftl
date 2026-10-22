## Shared

system-cancel = Ακύρωση

## Dictation notifications

dictation-setup-title = Πληκτρολόγηση με τη φωνή
dictation-setup-body = Μιλήστε και ό,τι λέτε γράφεται, σε οποιαδήποτε εφαρμογή. Η αναγνώριση γίνεται σε αυτόν τον υπολογιστή, οπότε χρειάζεται πρώτα το μοντέλο ομιλίας.
dictation-setup-action = Ρύθμιση υπαγόρευσης
dictation-unsupported-title = Η υπαγόρευση για τη γλώσσα { $language } δεν είναι διαθέσιμη σε αυτόν τον υπολογιστή
dictation-unsupported-body = Ο επεξεργαστής του δεν μπορεί να εκτελέσει την αναγνώριση ομιλίας που χρειάζεται η γλώσσα { $language }. Μπορείτε να υπαγορεύετε σε άλλη γλώσσα.
dictation-settings-action = Ρυθμίσεις υπαγόρευσης

## System health notifications

health-gpu-reset-title = Το πρόγραμμα οδήγησης γραφικών σταμάτησε να αποκρίνεται
health-gpu-reset-body = { $day ->
    [today] Ο υπολογιστής σας έκανε επανεκκίνηση μόνος του σήμερα στις { $time }. Στις Ρυθμίσεις θα δείτε τι μπορεί να το αποτρέψει στο μέλλον.
   *[other] Ο υπολογιστής σας έκανε επανεκκίνηση μόνος του στις { $date }, ώρα { $time }. Στις Ρυθμίσεις θα δείτε τι μπορεί να το αποτρέψει στο μέλλον.
}
health-gpu-reset-details = Λεπτομέρειες

oom-app-closed-title = Η εφαρμογή { $app } έκλεισε για να ελευθερωθεί μνήμη
oom-container-closed-title = Ένα κοντέινερ έκλεισε για να ελευθερωθεί μνήμη
oom-closed-body = Η μνήμη του υπολογιστή είχε σχεδόν εξαντληθεί, οπότε έκλεισε για να συνεχίσουν να αποκρίνονται όλα τα υπόλοιπα.
oom-closed-body-with-size = Η μνήμη του υπολογιστή είχε σχεδόν εξαντληθεί, οπότε έκλεισε για να συνεχίσουν να αποκρίνονται όλα τα υπόλοιπα. Χρησιμοποιούσε { $size }.
memory-low-title = Η μνήμη του Luft εξαντλείται
memory-low-app-body = Η εφαρμογή { $app } χρησιμοποιεί { $size }. Τερματίστε την αναγκαστικά για να συνεχίσουν να αποκρίνονται όλα τα υπόλοιπα.
memory-low-container-body = Ένα κοντέινερ χρησιμοποιεί { $size }. Τερματίστε το αναγκαστικά για να συνεχίσουν να αποκρίνονται όλα τα υπόλοιπα.
memory-low-force-quit = Αναγκαστικός τερματισμός

## Input source indicator

input-source-indicator = Πηγή εισαγωγής: { $source }

## Hardware keys
# Short notices shown in the middle of the screen when a key is pressed

media-keys-airplane-mode-hardware = Η λειτουργία πτήσης είναι ενεργή από διακόπτη της συσκευής
media-keys-airplane-mode-on = Λειτουργία πτήσης ενεργή
media-keys-airplane-mode-off = Λειτουργία πτήσης ανενεργή
media-keys-bluetooth-on = Bluetooth ενεργό
media-keys-bluetooth-off = Bluetooth ανενεργό
media-keys-caps-lock-on = Caps Lock ενεργό
media-keys-caps-lock-off = Caps Lock ανενεργό
media-keys-num-lock-on = Num Lock ενεργό
media-keys-num-lock-off = Num Lock ανενεργό

## VPN sign-in

vpn-sign-in-title = Σύνδεση: { $connection }
vpn-connect = Σύνδεση
vpn-signing-in = Σύνδεση…
vpn-finish-in-browser = Ολοκληρώστε τη σύνδεση στο πρόγραμμα περιήγησης.
vpn-certificate-untrusted = Ο διακομιστής { $host } παρουσίασε πιστοποιητικό που δεν μπορεί να επαληθευτεί ({ $reason }). Το αποτύπωμά του είναι { $fingerprint }.
vpn-certificate-warning = Κάποιος μπορεί να προσποιείται ότι είναι αυτός ο διακομιστής. Συνδεθείτε μόνο αν το περιμένατε.
vpn-certificate-connect = Σύνδεση ούτως ή άλλως

vpn-field-password = Κωδικός πρόσβασης
vpn-field-certificate-password = Κωδικός πιστοποιητικού
vpn-field-proxy-password = Κωδικός διακομιστή μεσολάβησης
vpn-field-pre-shared-key = Προκοινόχρηστο κλειδί
vpn-field-group-password = Κωδικός ομάδας

## Battery notifications

battery-left = Απομένει { $percent }.
battery-left-with-time = Απομένει { $percent }, περίπου { $duration }.
battery-low-title = Χαμηλή μπαταρία
battery-very-low-title = Πολύ χαμηλή μπαταρία
battery-almost-empty-title = Η μπαταρία σχεδόν άδειασε
battery-ups-low-title = Χαμηλή μπαταρία UPS
battery-ups-very-low-title = Πολύ χαμηλή μπαταρία UPS
battery-ups-almost-empty-title = Η μπαταρία του UPS σχεδόν άδειασε
battery-very-low-body = { $left } Συνδέστε σύντομα τον φορτιστή.
battery-almost-empty-body = { $left } Συνδέστε τώρα τον φορτιστή για να μη χάσετε εργασία που δεν έχει αποθηκευτεί.

battery-device-low-title = { $device }: χαμηλή μπαταρία
battery-device-very-low-title = { $device }: πολύ χαμηλή μπαταρία
battery-device-low-body = { $left } Φορτίστε τη συσκευή σύντομα.
battery-device-very-low-body = { $left } Φορτίστε τη συσκευή τώρα για να μην απενεργοποιηθεί.

battery-device-mouse = Ποντίκι
battery-device-keyboard = Πληκτρολόγιο
battery-device-phone = Τηλέφωνο
battery-device-tablet = Tablet
battery-device-controller = Χειριστήριο
battery-device-pen = Γραφίδα
battery-device-touchpad = Επιφάνεια αφής
battery-device-headset = Ακουστικά με μικρόφωνο
battery-device-speaker = Ηχείο
battery-device-headphones = Ακουστικά
battery-device-remote = Τηλεχειριστήριο
battery-device-other = Συνδεδεμένη συσκευή

## Privacy indicator

privacy-indicator = Σε χρήση: { $things }
privacy-thing-camera = κάμερα
privacy-thing-microphone = μικρόφωνο
privacy-thing-screen = οθόνη
privacy-thing-location = τοποθεσία
privacy-thing-windows = παράθυρα

privacy-camera-unknown-app = Μια εφαρμογή χρησιμοποιεί την κάμερα
privacy-stop-sharing = Διακοπή κοινής χρήσης οθόνης
privacy-stop-recording = Διακοπή εγγραφής
privacy-turn-off-location = Απενεργοποίηση υπηρεσιών τοποθεσίας
privacy-settings = Ρυθμίσεις απορρήτου
privacy-camera = Κάμερα
privacy-microphone = Μικρόφωνο
privacy-microphone-muted = Μικρόφωνο σε σίγαση
privacy-mute-microphone = Σίγαση μικροφώνου
privacy-unmute-microphone = Κατάργηση σίγασης μικροφώνου
privacy-close-app = Κλείσιμο: { $app }
privacy-unknown-app = Μια εφαρμογή
privacy-windows-using = Χρησιμοποιεί τα παράθυρά σας
privacy-windows-seeing = Βλέπει τα παράθυρά σας
privacy-windows-stop = Διακοπή πρόσβασης

## Window access prompt
# A program (often a coding assistant) asks to see or control the windows on the screen. $app is its name.

peek-see-title = Το πρόγραμμα { $app } ζητά να βλέπει τα παράθυρά σας
peek-see-description = Θα μπορεί να τραβά εικόνες από οποιοδήποτε ανοιχτό παράθυρο.
peek-use-title = Το πρόγραμμα { $app } ζητά να βλέπει και να χειρίζεται τα παράθυρά σας
peek-use-description = Θα μπορεί να βλέπει κάθε ανοιχτό παράθυρο και να κάνει κλικ και να πληκτρολογεί σε αυτό σαν να ήσασταν εσείς.
peek-deny = Να μην επιτρέπεται
peek-allow-once = Να επιτρέπεται μία φορά
peek-allow-until-quit = Να επιτρέπεται μέχρι να κλείσει

## Window access errors
# Shown in a terminal to the person or program that ran the peek command. "peek run" and "peek list" are commands and stay as they are.

peek-error-declined = Το άτομο που χρησιμοποιεί αυτόν τον υπολογιστή το αρνήθηκε. Το πρόγραμμα { $app } μπορεί να ζητήσει ξανά αφού κλείσει.
peek-error-not-allowed = Το άτομο που χρησιμοποιεί αυτόν τον υπολογιστή δεν το επέτρεψε
peek-error-sandboxed = Οι εφαρμογές σε απομονωμένο περιβάλλον δεν μπορούν να βλέπουν ή να χειρίζονται άλλα παράθυρα
peek-error-unknown-caller = Το πρόγραμμα που ζητά πρόσβαση τερματίστηκε ή δεν ήταν δυνατό να αναγνωριστεί
peek-error-no-caller = Ο δίαυλος της περιόδου λειτουργίας δεν ανέφερε ποιο πρόγραμμα ζητά πρόσβαση
peek-error-screen-busy = Η οθόνη είναι κλειδωμένη ή εμφανίζεται ένα παράθυρο του συστήματος. Δοκιμάστε ξανά όταν κλείσει.
peek-error-input-held = Κάποιος κρατά πατημένα πλήκτρα ή κουμπιά του ποντικιού. Δοκιμάστε ξανά σε λίγο.
peek-error-input-dropped = Η εισαγωγή διακόπηκε, γιατί όταν έφτασε υπήρχε κάτι άλλο κάτω από το σημείο ή κάτι άλλο είχε το πληκτρολόγιο
peek-error-not-in-front = Δεν ήταν δυνατό να μεταφερθεί το παράθυρο μπροστά
peek-error-covered = Κάτι άλλο καλύπτει αυτό το τμήμα του παραθύρου
peek-error-outside = Το σημείο { $x }, { $y } είναι έξω από την εικόνα του παραθύρου, που έχει μέγεθος { $width } × { $height }
peek-error-nothing-to-capture = Το παράθυρο δεν εμφανίζει τίποτα για λήψη
peek-error-window-picture-late = Η εικόνα του παραθύρου δεν ήταν έτοιμη εγκαίρως
peek-error-screen-picture-late = Η εικόνα της οθόνης δεν ήταν έτοιμη εγκαίρως
peek-error-no-window-id = Κανένα παράθυρο δεν έχει το αναγνωριστικό { $id }. Η εντολή peek list δείχνει τα ανοιχτά παράθυρα.
peek-error-no-window-for-handle = Το πρόγραμμα που ξεκίνησε ως { $handle } δεν έχει ανοιχτό παράθυρο
peek-error-ended-before-window = Το πρόγραμμα τερματίστηκε πριν ανοίξει παράθυρο
peek-error-no-window-in-time = Δεν άνοιξε κανένα παράθυρο μέσα σε { $duration }
peek-error-launch-not-started-by-peek = Μπορεί να εκκινηθεί μόνο πρόγραμμα που ξεκίνησε η ίδια η εντολή peek run
peek-error-ended-while-starting = Το πρόγραμμα τερματίστηκε κατά την εκκίνηση
peek-error-launch-failed = Το systemd δεν μπόρεσε να ξεκινήσει το πρόγραμμα { $program }
peek-error-unknown-handle = Τίποτα από όσα ξεκινήσατε με την εντολή peek run δεν έχει το αναγνωριστικό { $handle }, ή έχει ήδη κλείσει
peek-error-unknown-key = Το peek δεν γνωρίζει πλήκτρο με το όνομα { $key }
peek-error-unknown-modifier = Το { $modifier } δεν είναι πλήκτρο τροποποίησης. Χρησιμοποιήστε ctrl, shift, alt ή super.
peek-error-display-owner = Αυτή η οθόνη ανήκει σε άλλο πρόγραμμα
peek-error-display-run = Τα προγράμματα σε κρυφή οθόνη ξεκινούν με την εντολή peek run
peek-error-display-handle = Αυτή η οθόνη ξεκίνησε ως { $handle }, όχι ως { $requested }
