## Messages that some steps share

meet-back = Πίσω
meet-cancel = Ακύρωση
meet-continue = Συνέχεια
meet-try-again = Επανάληψη
meet-restart = Επανεκκίνηση
meet-remove = Αφαίρεση
meet-keep-it = Διατήρηση
meet-close = Κλείσιμο
meet-restart-title = Επανεκκίνηση τώρα;
meet-not-yet = Όχι ακόμη
meet-iso-use = Χρήση ISO που ήδη έχω
meet-iso-using = Χρησιμοποιείται το δικό σας ISO του Luft
meet-nightly = Νυχτερινές εκδόσεις
meet-channel-nightly = Το Meet Luft θα χρησιμοποιεί νυχτερινές εκδόσεις
meet-channel-latest = Το Meet Luft θα χρησιμοποιεί ξανά κανονικές εκδόσεις
meet-undo = Αναίρεση
meet-logs-saved = Τα αρχεία καταγραφής από τη δοκιμή του Luft αποθηκεύτηκαν στην επιφάνεια εργασίας
meet-logs-show = Εμφάνιση
meet-logs-none = Δεν υπάρχουν ακόμη αρχεία καταγραφής από τη δοκιμή του Luft
meet-logs-failed = Το Meet Luft δεν μπόρεσε να αποθηκεύσει τα αρχεία καταγραφής από τη δοκιμή του Luft

## What went wrong, shown in red next to a Try again button

problem-check = { $platform ->
    [linux] Το Meet Luft δεν μπόρεσε να ολοκληρώσει τον έλεγχο αυτού του υπολογιστή.
   *[windows] Το Meet Luft δεν μπόρεσε να ολοκληρώσει τον έλεγχο αυτού του PC.
}
problem-room = Η δημιουργία χώρου για το Luft δεν ολοκληρώθηκε.
problem-room-linux = Η προετοιμασία του Luft δεν ολοκληρώθηκε.
problem-update = Η ενημέρωση του Luft δεν ολοκληρώθηκε.
problem-download = Η λήψη του Luft σταμάτησε. Ελέγξτε ότι είστε συνδεδεμένοι στο διαδίκτυο.
problem-pack = Το πακετάρισμα των πραγμάτων σας δεν ολοκληρώθηκε.
problem-remove = Η αφαίρεση του Luft δεν ολοκληρώθηκε.
problem-restart = Το Meet Luft δεν μπόρεσε να προετοιμάσει την επανεκκίνηση.
problem-tidy = Οι παλιές καταχωρίσεις εκκίνησης δεν μπόρεσαν να αφαιρεθούν.
problem-firmware = Το Meet Luft δεν μπόρεσε να ανοίξει τις ρυθμίσεις υλικολογισμικού.
problem-folders = Το Meet Luft δεν μπόρεσε να εξετάσει τους φακέλους σας.
problem-sticks = Το Meet Luft δεν μπόρεσε να αναζητήσει μονάδες USB.
problem-stick = Η δημιουργία του στικ δεν ολοκληρώθηκε.
problem-offer = Δεν είναι δυνατή η λήψη του Luft αυτήν τη στιγμή. Ελέγξτε ότι είστε συνδεδεμένοι ή χρησιμοποιήστε ένα ISO που ήδη έχετε.
problem-luft = Το Meet Luft δεν μπόρεσε να εξετάσει τον δίσκο του Luft.
problem-resize = Η αλλαγή μεγέθους του Luft δεν ολοκληρώθηκε.
problem-cancel = Το Meet Luft δεν μπόρεσε να ακυρώσει την αλλαγή.
problem-give = Τα Windows δεν μπόρεσαν να πάρουν πίσω τον χώρο.
problem-declined = { $platform ->
    [linux] Το Meet Luft χρειάζεται την άδειά σας για να εργαστεί στον δίσκο. Πληκτρολογήστε τον κωδικό πρόσβασής σας όταν σας ζητηθεί.
   *[windows] Το Meet Luft χρειάζεται την άδειά σας για να εργαστεί στον δίσκο. Επιλέξτε «Ναι» όταν ρωτήσουν τα Windows.
}

## First screen

hello-intro = { $platform ->
    [linux] Δοκιμάστε το Luft κατευθείαν από εδώ, χωρίς στικ USB. Αν σας αρέσει, το Luft μπορεί να πάρει τη θέση αυτού του συστήματος και να κρατήσει τα αρχεία σας.
   *[windows] Το Luft μπορεί να ζει ακριβώς δίπλα στα Windows. Δοκιμάστε το πρώτα χωρίς να εγκαταστήσετε τίποτα και πάρτε μαζί τα πράγματά σας όταν είστε έτοιμοι.
}
hello-check = { $platform ->
    [linux] Έλεγχος υπολογιστή
   *[windows] Έλεγχος PC
}

## Checking whether the computer is ready

check-looking-title = { $platform ->
    [linux] Έλεγχος του υπολογιστή
   *[windows] Έλεγχος του PC
}
check-ready-title = { $platform ->
    [linux] Ο υπολογιστής είναι έτοιμος για το Luft
   *[windows] Το PC είναι έτοιμο για το Luft
}
check-blocked-title = Σχεδόν έτοιμο
check-moment = Θα πάρει λίγο χρόνο.
check-slow = Τα Windows υπολογίζουν πόσο χώρο μπορούν να διαθέσουν. Σε μεγάλο δίσκο αυτό μπορεί να πάρει μερικά λεπτά.
check-blocked-description = Κάτι πρέπει να αλλάξει πριν εγκατασταθεί το Luft. Δείτε τι να κάνετε.
check-found-description = Αυτά βρήκε το Meet Luft.
check-checking = Έλεγχος δίσκου, υλικολογισμικού και υλικού…
check-again = Νέος έλεγχος
check-action-firmware = Άνοιγμα ρυθμίσεων υλικολογισμικού
check-action-tidy = Τακτοποίηση
check-firmware-title = Επανεκκίνηση στις ρυθμίσεις υλικολογισμικού;
check-firmware-description = Αποθηκεύστε πρώτα ό,τι κάνετε. Ενεργοποιήστε εκεί το Secure Boot και αποθηκεύστε, και ο υπολογιστής θα ξεκινήσει ξανά κανονικά.
check-tidy-title = Αφαίρεση των παλιών καταχωρίσεων εκκίνησης;
check-tidy-description = Δείχνουν μόνο σε συστήματα που δεν υπάρχουν πια. Τα Windows και όλα τα άλλα ξεκινούν όπως πριν.
check-get-ready-title = Προετοιμασία του Luft;
check-get-ready-file = Το Meet Luft αντιγράφει το Luft από το ISO σας σε έναν φάκελο αυτού του υπολογιστή και προσθέτει μια καταχώριση εκκίνησης γι’ αυτό. Δεν αλλάζει κανένα διαμέρισμα.
check-get-ready-download = Το Meet Luft κατεβάζει το Luft, περίπου { $size }, σε έναν φάκελο αυτού του υπολογιστή και προσθέτει μια καταχώριση εκκίνησης γι’ αυτό. Δεν αλλάζει κανένα διαμέρισμα.
check-get-ready-confirm = Προετοιμασία

## Choosing how much of the Windows drive Luft gets

room-title = Πόσος χώρος για το Luft;
room-description = Τα Windows μικραίνουν για να κάνουν χώρο στο Luft. Τα αρχεία σας στα Windows μένουν ακριβώς εκεί που είναι.
room-live = Τα Windows κρατούν χώρο για να μεγαλώσουν. Το Luft δεσμεύει επίσης { $size } για να ξεκινά, τα οποία επιστρέφει μόλις εγκατασταθεί.
room-make = Δημιουργία χώρου
room-confirm-title = Διάθεση { $size } στο Luft;
room-confirm-file = Τα Windows μικραίνουν τον δίσκο τους και μετά το Meet Luft αντιγράφει το Luft από το ISO σας. Κρατήστε το PC στην πρίζα.
room-confirm-download = Τα Windows μικραίνουν τον δίσκο τους και μετά το Meet Luft κατεβάζει το Luft, περίπου { $size }. Κρατήστε το PC στην πρίζα και συνδεδεμένο στο διαδίκτυο.

## Choosing where Luft goes, when there's more than one place
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

room-places-title = Πού να μπει το Luft;
room-places-description = Το Luft μπορεί να μοιραστεί τον δίσκο των Windows ή να πάρει χώρο που τα Windows δεν χρησιμοποιούν.
room-places-label = Θέσεις για το Luft
room-place-windows = Δίπλα στα Windows
room-place-windows-detail = Τα Windows μικραίνουν για να κάνουν χώρο στο Luft
room-place-windows-free = Εκεί είναι ήδη ελεύθερα { $size }
room-place-free = Ελεύθερος χώρος στο { $drive }
room-place-free-here = Ελεύθερος χώρος στον δίσκο των Windows
room-place-free-detail = { $size } που δεν χρησιμοποιεί τίποτε άλλο
room-place-whole = Ολόκληρο το { $drive }
room-place-whole-detail = Διαγράφει αυτόν τον δίσκο των { $size } για το Luft
room-live-free = Από αυτόν τον χώρο, τα { $free } είναι ήδη ελεύθερα, οπότε τα Windows παραχωρούν λιγότερα και κρατούν χώρο για να μεγαλώσουν. Το Luft δεσμεύει επίσης { $size } για να ξεκινά, τα οποία επιστρέφει μόλις εγκατασταθεί.
room-live-elsewhere = Το Luft παίρνει εκεί { $room } και δεσμεύει ακόμη { $size } για να ξεκινά, τα οποία επιστρέφει μόλις εγκατασταθεί.
room-confirm-free-title = Διάθεση { $size } ελεύθερου χώρου στο Luft;
room-confirm-free-file = Το Meet Luft αντιγράφει εκεί το Luft από το ISO σας. Τίποτε άλλο στον δίσκο δεν αλλάζει.
room-confirm-free-download = Το Meet Luft κατεβάζει εκεί το Luft, περίπου { $size }. Τίποτε άλλο στον δίσκο δεν αλλάζει. Κρατήστε το PC συνδεδεμένο στο διαδίκτυο.
room-erase-title = Διαγραφή του { $drive };
room-erase-description = Όλο το περιεχόμενο αυτού του δίσκου των { $size } διαγράφεται αμέσως, πριν ξεκινήσει το Luft. Δεν είναι δυνατή η αναίρεση. Αυτήν τη στιγμή περιέχει:
room-erase-empty = Τα Windows δεν μπορούν να διαβάσουν τίποτα σε αυτόν τον δίσκο των { $size }, αλλά ό,τι υπάρχει σε αυτόν διαγράφεται αμέσως. Δεν είναι δυνατή η αναίρεση.
room-erase-unnamed = Διαμέρισμα χωρίς όνομα
room-erase-volume-name = { $name } ({ $letter })
room-erase-volume = { $filesystem }, { $size }
room-erase-bitlocker = Κρυπτογραφημένο με BitLocker
room-erase-understood = Γνωρίζω ότι ένα μέρος του είναι κρυπτογραφημένο με BitLocker και δεν μπορεί να ανακτηθεί
room-erase-confirm = Διαγραφή και δημιουργία χώρου

## Luft is ready on Windows

ready-title = Το Luft είναι έτοιμο
ready-description = Επιλέξτε πώς θέλετε να το γνωρίσετε. Μετά τα Windows ξεκινούν κανονικά, εκτός αν εγκαταστήσετε το Luft και το επιλέξετε.
ready-update-title = Λήψη του νεότερου Luft
ready-update-description = Κυκλοφόρησε νεότερη έκδοση. Αντικαθιστά αυτήν και κρατά τον χώρο και ό,τι έχετε πακετάρει.
ready-try-title = Δοκιμή του Luft
ready-try-description = Επανεκκίνηση στο Luft χωρίς εγκατάσταση. Την επόμενη φορά τα Windows ξεκινούν κανονικά.
ready-box-description = Πακετάρετε έγγραφα, φωτογραφίες, δίκτυα Wi-Fi και άλλα, για να τα αποσυσκευάσει το Luft όταν εγκατασταθεί.
ready-box-packed = Πακεταρισμένα, { $size }
ready-install-title = Εγκατάσταση Luft
ready-install-description = Επανεκκίνηση στο πρόγραμμα εγκατάστασης. Ο χώρος των { $size } δίπλα στα Windows το περιμένει ήδη.
ready-install-drive-description = Επανεκκίνηση στο πρόγραμμα εγκατάστασης. Ο χώρος των { $size } στο { $drive } το περιμένει ήδη.
ready-stick-description = Βάλτε το Luft σε ένα στικ για να το ξεκινάτε σε οποιονδήποτε υπολογιστή.
ready-remove = Αφαίρεση του Luft από αυτό το PC
ready-restart-try = Αποθηκεύστε πρώτα ό,τι κάνετε. Το Luft ανοίγει σε περίπου ένα λεπτό, και η επόμενη επανεκκίνηση σας επιστρέφει στα Windows.
ready-restart-install = Αποθηκεύστε πρώτα ό,τι κάνετε. Το πρόγραμμα εγκατάστασης ανοίγει σε περίπου ένα λεπτό, και τίποτα δεν αλλάζει μέχρι να επιβεβαιώσετε εκεί.
ready-fast-startup-title = Απενεργοποίηση της γρήγορης εκκίνησης στα Windows
ready-fast-startup-description = Τα Windows θα τερματίζουν πλήρως, ώστε ο ήχος, το Wi-Fi και το Bluetooth να ξεκινούν από την αρχή στο Luft.
ready-clock-title = Σωστή ώρα και στα δύο συστήματα
ready-clock-description = Τα Windows θα διαβάζουν το ρολόι του υπολογιστή όπως το Luft, ώστε η ώρα να μην αλλάζει όταν κάνετε εναλλαγή.
ready-remove-title = Αφαίρεση του Luft από αυτό το PC;
ready-remove-description = Το Meet Luft διαγράφει ό,τι πρόσθεσε, μαζί και την κούτα μετακόμισης, και επιστρέφει στα Windows όλο τον χώρο τους.

## Luft is ready on Linux

linux-ready-description = Επιλέξτε πώς θέλετε να το γνωρίσετε. Μέχρι να αποφασίσετε διαφορετικά, θα ξεκινά κανονικά { $system }.
linux-ready-this-system = αυτό το σύστημα
linux-ready-update-description = Κυκλοφόρησε νεότερη έκδοση. Αντικαθιστά αυτήν που κρατά το Meet Luft και διατηρεί τα αρχεία καταγραφής από τις δοκιμές.
linux-ready-try-description = Επανεκκίνηση στο Luft χωρίς καμία αλλαγή. Την επόμενη φορά θα ξεκινήσει κανονικά { $system }.
linux-ready-replace-title = Αντικατάσταση: { $system }
linux-ready-replace-description = Το Luft παίρνει τη θέση του και κρατά τα αρχεία, τον λογαριασμό, τα δίκτυα Wi-Fi και τους άλλους δίσκους σας. Το παλιό σύστημα μένει μέχρι να το αφαιρέσετε.
linux-ready-install-description = Επανεκκίνηση στο πρόγραμμα εγκατάστασης για να βάλετε το Luft σε άλλον δίσκο ή σε ελεύθερο χώρο.
linux-ready-remove = Αφαίρεση του Luft από αυτόν τον υπολογιστή
linux-ready-restart-try = Αποθηκεύστε πρώτα ό,τι κάνετε. Το Luft ανοίγει σε περίπου ένα λεπτό, και με την επόμενη επανεκκίνηση θα ξεκινήσει πάλι { $system }.
linux-ready-restart-replace = Αποθηκεύστε πρώτα ό,τι κάνετε. Το πρόγραμμα εγκατάστασης ανοίγει έτοιμο να αντικαταστήσει { $system } και δείχνει τι μένει πριν αλλάξει οτιδήποτε.
linux-ready-remove-title = Αφαίρεση του Luft από αυτόν τον υπολογιστή;
linux-ready-remove-description = Το Meet Luft διαγράφει τα αρχεία του Luft, τα αρχεία εκκίνησής του και την καταχώριση εκκίνησής του. Όλα τα άλλα μένουν ως έχουν.

## Luft is installed on this PC
## $drive is the name of a drive, like "Samsung SSD 990 PRO", and $size a size, like "120 GB"

luft-title = Το Luft σας
luft-looking = Το Meet Luft βρήκε το Luft σε αυτό το PC.
luft-checking = Έλεγχος του δίσκου του Luft…
luft-description-beside = Το Luft είναι εγκατεστημένο δίπλα στα Windows σε αυτό το PC.
luft-description-drive = Το Luft είναι εγκατεστημένο στο { $drive }.
luft-bar-used = { $size }, σε χρήση { $used }
luft-resize-title = Αλλαγή του χώρου του Luft
luft-resize-description = Δώστε στο Luft περισσότερο από τον χώρο των Windows ή επιστρέψτε λίγο στα Windows.
luft-resize-encrypted = Ο δίσκος του Luft είναι κρυπτογραφημένος, οπότε η μετακίνησή του θα χρειαζόταν το κλειδί αποκατάστασης. Απενεργοποιήστε πρώτα την κρυπτογράφηση συσκευής στις Ρυθμίσεις του Luft και μετά επιστρέψτε.
luft-resize-apart = Ανάμεσα στα Windows και στο Luft υπάρχει άλλο διαμέρισμα, οπότε δεν μπορούν να μοιραστούν τον χώρο τους.
luft-resize-unreadable = Το Meet Luft δεν μπόρεσε να διαπιστώσει πόσο γεμάτο είναι το Luft.
luft-pending-grow = Το Luft μεγαλώνει την επόμενη φορά που θα ξεκινήσει
luft-pending-grow-description = Κάντε επανεκκίνηση στο Luft και αφήστε το ανοιχτό για μερικά λεπτά, όσο μεταφέρεται στον νέο χώρο. Στο μεταξύ μπορείτε να το χρησιμοποιείτε.
luft-pending-shrink = Το Luft κάνει χώρο την επόμενη φορά που θα ξεκινήσει
luft-pending-shrink-description = Κάντε επανεκκίνηση στο Luft και αφήστε το ανοιχτό για μερικά λεπτά, όσο μετακινεί τα αρχεία του. Μετά ανοίξτε ξανά το Meet Luft στα Windows για να δώσετε τον χώρο στα Windows.
luft-windows-free-title = Διάθεση του ελεύθερου χώρου στα Windows
luft-windows-free-description = Τα { $size } ακριβώς μετά τα Windows δεν χρησιμοποιούνται από τίποτα. Τα Windows μπορούν να τα πάρουν πίσω.
luft-leftovers-title = Καθαρισμός μετά τη δοκιμή του Luft
luft-leftovers-description = Τα διαμερίσματα που δημιούργησε το Meet Luft για να ξεκινήσει το Luft είναι ακόμη εδώ. Το Luft δεν τα χρειάζεται πια.
luft-start = Επανεκκίνηση στο Luft
luft-cancel = Ακύρωση της αλλαγής
luft-restart = Αποθηκεύστε πρώτα ό,τι κάνετε. Το Luft ξεκινά σε περίπου ένα λεπτό, και η επόμενη επανεκκίνηση σας επιστρέφει στα Windows.
luft-restart-pending = Αποθηκεύστε πρώτα ό,τι κάνετε. Το Luft ξεκινά σε περίπου ένα λεπτό και μετακινεί μόνο του τα αρχεία του, κάτι που παίρνει μερικά λεπτά. Στο μεταξύ μπορείτε να το χρησιμοποιείτε.
luft-remove = Αφαίρεση του Luft από αυτό το PC
luft-remove-title = Αφαίρεση του Luft από αυτό το PC;
luft-remove-description = Το Luft και ό,τι περιέχει διαγράφονται, { $size } συνολικά, και τα Windows παίρνουν πίσω τον χώρο. Το PC ξεκινά τα Windows όπως πριν. Δεν είναι δυνατή η αναίρεση.
luft-remove-drive-description = Το Luft και ό,τι περιέχει διαγράφονται από το { $drive }, { $size } συνολικά. Το PC ξεκινά τα Windows όπως πριν. Δεν είναι δυνατή η αναίρεση.
luft-remove-confirm = Αφαίρεση του Luft

## Changing how much space Luft has
## $size is a size, like "20 GB"

resize-title = Πόσος χώρος για το Luft;
resize-description = Σύρετε για να μοιράσετε τον δίσκο ανάμεσα στα Windows και στο Luft. Το Luft κάνει μόνο του την αλλαγή την επόμενη φορά που θα ξεκινήσει.
resize-measuring = Τα Windows υπολογίζουν πόσο χώρο μπορούν να διαθέσουν. Σε μεγάλο δίσκο αυτό μπορεί να πάρει μερικά λεπτά.
resize-full = Το Luft είναι πολύ γεμάτο για να μετακινηθεί και τα Windows δεν μπορούν να διαθέσουν αρκετό χώρο γι’ αυτό. Κάντε πρώτα λίγο χώρο στο Luft ή στα Windows.
resize-used = Τα αρχεία του Luft πιάνουν { $size }.
resize-least = Αλλάξτε το κατά τουλάχιστον { $size }.
resize-apply = Αλλαγή
resize-grow-title = Διάθεση ακόμη { $size } στο Luft;
resize-grow-description = Τα Windows μικραίνουν αμέσως. Το Luft μεταφέρεται στον νέο χώρο την επόμενη φορά που θα ξεκινήσει, κάτι που παίρνει μερικά λεπτά. Κρατήστε το PC στην πρίζα.
resize-shrink-title = Επιστροφή { $size } στα Windows;
resize-shrink-description = Το Luft μετακινεί τα αρχεία του την επόμενη φορά που θα ξεκινήσει, κάτι που παίρνει μερικά λεπτά. Μετά ανοίξτε ξανά το Meet Luft και τα Windows παίρνουν πίσω τον χώρο. Κρατήστε το PC στην πρίζα.

## Packing things to take along to Luft (the moving box)

box-title = Πάρτε μαζί τα πράγματά σας
box-description = Επιλέξτε τι θα πάρετε μαζί. Το Luft τα αποσυσκευάζει στον νέο σας λογαριασμό όταν εγκατασταθεί, και τίποτα δεν αφαιρείται από τα Windows.
box-looking = Εξέταση των φακέλων σας…
box-folder-desktop = Επιφάνεια εργασίας
box-folder-documents = Έγγραφα
box-folder-downloads = Λήψεις
box-folder-music = Μουσική
box-folder-pictures = Εικόνες
box-folder-videos = Βίντεο
box-folder-size = { $size }, { $files ->
    [one] { $files } αρχείο
   *[other] { $files } αρχεία
}
box-wifi-title = Δίκτυα Wi-Fi
box-wifi-description = Μαζί με τους κωδικούς τους, ώστε το Luft να συνδεθεί αμέσως
box-bluetooth-title = Συσκευές Bluetooth
box-bluetooth-description = { $devices ->
    [one] { $devices } συσκευή, έτοιμη χωρίς νέα σύζευξη
   *[other] { $devices } συσκευές, έτοιμες χωρίς νέα σύζευξη
}
box-wallpaper-title = Ταπετσαρία
box-wallpaper-description = Η εικόνα στην επιφάνεια εργασίας των Windows
box-account-title = Το όνομα και η εικόνα σας
box-total-slow = { $size }, το πακετάρισμα διαρκεί περίπου { $minutes ->
    [one] { $minutes } λεπτό
   *[other] { $minutes } λεπτά
}
box-pack = Πακετάρισμα

## Progress while Meet Luft works

working-shrinking = Δημιουργία χώρου
    .description = Τα Windows μετακινούν τα αρχεία τους για να ελευθερώσουν χώρο. Αυτό μπορεί να πάρει μερικά λεπτά.
working-erasing = Διαγραφή του δίσκου
    .description = Τα Windows τον αδειάζουν, ώστε το Luft να πάρει ολόκληρο τον δίσκο.
working-partitioning = Προετοιμασία του χώρου του Luft
    .description = Προετοιμάζονται τα διαμερίσματα από τα οποία ξεκινά το Luft.
working-downloading = Μεταφορά του Luft
    .description = Το Luft αντιγράφεται απευθείας στον δικό του χώρο και ελέγχεται στην πορεία.
working-packing = Πακετάρισμα των πραγμάτων σας
    .description = Αντιγράφονται όσα επιλέξατε στην κούτα μετακόμισης. Οι μεγάλοι φάκελοι θέλουν λίγο χρόνο.
working-removing = Αφαίρεση του Luft
    .description = Ο χώρος επιστρέφει στα Windows.
working-removing-linux = Αφαίρεση του Luft
    .description = Αφαιρούνται τα αρχεία του και η καταχώριση εκκίνησής του.
working-writing = Δημιουργία του στικ
    .description = Το Luft γράφεται σε ολόκληρο το στικ. Μην το αποσυνδέσετε.
working-copying = Προσθήκη του Luft στο Ventoy
    .description = Το Luft αντιγράφεται δίπλα στα άλλα ISO του στικ. Μην το αποσυνδέσετε.
working-verifying = Έλεγχος του στικ
    .description = Διαβάζεται ξανά ολόκληρο για να βεβαιωθεί ότι ξεκινά.
working-stick-downloading = Λήψη του Luft
    .description = Ελέγχεται στην πορεία και διατηρείται, ώστε το επόμενο στικ να γίνει πιο γρήγορα.
working-progress = { $done } από { $total }
working-keep-open = Κρατήστε αυτό το παράθυρο ανοιχτό.

## After Luft was removed

removed-title = Όλα όπως ήταν
removed-description = { $platform ->
    [linux] Τα αρχεία του Luft και η καταχώριση εκκίνησής του αφαιρέθηκαν, και ο υπολογιστής σας ξεκινά όπως πριν. Επιστρέψτε όποτε θέλετε.
   *[windows] Τα διαμερίσματα του Luft και η καταχώριση εκκίνησής του αφαιρέθηκαν, και τα Windows έχουν ξανά όλο τον χώρο τους. Επιστρέψτε όποτε θέλετε.
}

## Making a USB stick

stick-title = Δημιουργία στικ USB
stick-description = Το Luft ξεκινά από αυτό σε οποιονδήποτε υπολογιστή, για δοκιμή ή εγκατάσταση.
stick-looking = Αναζήτηση μονάδων USB…
stick-none = Συνδέστε ένα στικ USB των { $size } ή μεγαλύτερο. Θα εμφανιστεί εδώ.
stick-drives-label = Μονάδες USB
stick-offer = { $name }, { $size }
stick-make = Δημιουργία στικ
stick-drive-empty = Κενό
stick-drive-detail = { $size } · { $contents }
stick-drive-too-small = { $size } · Πολύ μικρό για το Luft
stick-ventoy-title = Αυτό το στικ χρησιμοποιεί Ventoy
stick-ventoy-description = Να προστεθεί το Luft σε αυτό ή να διαγραφεί όλο το στικ και να γίνει στικ του Luft;
stick-erase-it = Διαγραφή
stick-add = Προσθήκη Luft
stick-replace-title = Αντικατάσταση του Luft που υπάρχει;
stick-replace-description = { $count ->
    [one] Στο στικ υπάρχει ήδη: { $names }. Το νέο Luft μπορεί να πάρει τη θέση του.
   *[other] Στο στικ υπάρχουν ήδη: { $names }. Το νέο Luft μπορεί να πάρει τη θέση τους.
}
stick-keep = { $count ->
    [one] Διατήρηση και των δύο
   *[other] Διατήρηση όλων
}
stick-replace = Αντικατάσταση
stick-full-title = Δεν υπάρχει χώρος για το Luft
stick-full-description = Το Luft χρειάζεται { $needed } και στο στικ είναι ελεύθερα { $free }. Ελευθερώστε χώρο ή διαγράψτε το και κάντε το στικ του Luft.
stick-erase-title = Διαγραφή του στικ { $name };
stick-erase-description = Όλο το περιεχόμενο αυτού του στικ των { $size } διαγράφεται και αντικαθίσταται από το Luft. Δεν είναι δυνατή η αναίρεση.
stick-erase-confirm = Διαγραφή και δημιουργία στικ
stick-done-title = Το στικ του Luft είναι έτοιμο
stick-done-ventoy-title = Το Luft βρίσκεται στο στικ Ventoy σας
stick-done-take-out = Μπορείτε να το αφαιρέσετε τώρα.
stick-done-eject = Κάντε εξαγωγή πριν το αφαιρέσετε.
stick-done-start = Για να ξεκινήσετε από αυτό, συνδέστε το και επιλέξτε το στο μενού εκκίνησης του υπολογιστή, που ανοίγει με ένα πλήκτρο όπως F12, F8 ή Esc αμέσως μόλις τον ανοίξετε.
stick-done-ventoy-key = Με ενεργό το Secure Boot, το Ventoy ζητά μία φορά να καταχωρίσει το δικό του κλειδί την πρώτη φορά που ξεκινά.
stick-done = Τέλος
stick-done-another = Δημιουργία κι άλλου
