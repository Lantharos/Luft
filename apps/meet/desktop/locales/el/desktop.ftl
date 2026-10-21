## What Meet Luft finds when it checks a computer

check-processor-x64 = Επεξεργαστής Intel ή AMD 64 bit
check-processor-x64-detail = Το Luft λειτουργεί σε αυτόν.
check-processor-arm = Επεξεργαστής Arm
check-processor-arm-detail = Προς το παρόν το Luft λειτουργεί μόνο σε επεξεργαστές Intel και AMD.
check-processor-32-bit-windows = Windows 32 bit
check-processor-32-bit-system = Σύστημα 32 bit
check-processor-32-bit-detail = Το Luft χρειάζεται επεξεργαστή Intel ή AMD 64 bit.
check-startup-uefi = Εκκίνηση με UEFI
check-startup-uefi-windows = Το Luft ξεκινά με τον ίδιο σύγχρονο τρόπο.
check-startup-uefi-linux = Το Luft προσθέτει δική του καταχώριση εκκίνησης και συνεχίζει να ξεκινά όπως τώρα { $system }.
check-startup-bios = Εκκίνηση σε παλαιά λειτουργία BIOS
check-startup-bios-windows = Το Luft χρειάζεται UEFI. Τα Windows μπορούν να μεταβούν με το MBR2GPT και μετά το UEFI ενεργοποιείται στις ρυθμίσεις υλικολογισμικού.
check-startup-bios-linux = Το Luft χρειάζεται UEFI. Ενεργοποιήστε το στις ρυθμίσεις υλικολογισμικού, μαζί με το σύστημα που υπάρχει ήδη, και ελέγξτε ξανά.
check-startup-mbr = Ο δίσκος χρησιμοποιεί παλιό πίνακα διαμερισμάτων
check-startup-mbr-windows = Το Luft χρειάζεται δίσκο GPT. Τα Windows μπορούν να τον μετατρέψουν με το MBR2GPT χωρίς απώλεια αρχείων.
check-startup-mbr-linux = Το Luft χρειάζεται δίσκο GPT για να ξεκινήσει.
check-startup-no-esp = Δεν υπάρχει διαμέρισμα συστήματος EFI
check-startup-no-esp-detail = Το Luft προσθέτει τα αρχεία εκκίνησής του δίπλα σε όσα υπάρχουν στο διαμέρισμα συστήματος EFI, και δεν υπάρχει τέτοιο.
check-startup-esp-full = Το διαμέρισμα συστήματος EFI είναι γεμάτο
check-startup-esp-full-detail = Το Luft χρειάζεται εκεί { $size } MB για τα αρχεία εκκίνησής του. Συνήθως τον χώρο τον πιάνουν παλιοί πυρήνες ή καταχωρίσεις εκκίνησης.
check-folder-fine = Δεν αλλάζει κανένα διαμέρισμα
check-folder-fine-detail = Το Luft φυλάσσεται ως αρχείο στον δίσκο σας { $filesystem } και ξεκινά από εκεί.
check-folder-encrypted = Τα αρχεία σας είναι σε κρυπτογραφημένο δίσκο
check-folder-encrypted-detail = Το Luft δεν μπορεί ακόμη να ξεκινήσει από κρυπτογραφημένο δίσκο. Χρησιμοποιήστε στικ USB για να το δοκιμάσετε.
check-folder-combined = Τα αρχεία σας εκτείνονται σε περισσότερα από ένα διαμερίσματα
check-folder-combined-detail = Το Luft δεν μπορεί ακόμη να ξεκινήσει από LVM ή RAID. Χρησιμοποιήστε στικ USB για να το δοκιμάσετε.
check-folder-filesystem = Το Luft δεν μπορεί να ξεκινήσει από { $filesystem }
check-folder-filesystem-detail = Ξεκινά από δίσκους ext4, btrfs και XFS. Χρησιμοποιήστε στικ USB για να το δοκιμάσετε.
check-space-free = { $size } GB ελεύθερα
check-space-free-linux = Το Luft πιάνει περίπου { $size } GB όσο το δοκιμάζετε.
check-space-up-to = Έως { $size } GB για το Luft
check-space-up-to-detail = Τα Windows κρατούν τα αρχεία τους και χώρο για να μεγαλώσουν.
check-space-free-already = Από αυτά, τα { $size } GB είναι ήδη ελεύθερα, οπότε τα Windows παραχωρούν λιγότερα.
check-space-other-drive = Υπάρχει χώρος γι’ αυτό στο { $drive }.
check-space-erase-drive = Υπάρχει χώρος γι’ αυτό στο { $drive }, αφού διαγραφεί αυτός ο δίσκος.
check-space-short = Δεν υπάρχει αρκετός ελεύθερος χώρος
check-space-short-windows = Το Luft χρειάζεται περίπου { $needed } GB που μπορούν να διαθέσουν τα Windows. Ελευθερώστε { $missing } GB στα Windows, για παράδειγμα με την Εκκαθάριση δίσκου, και ελέγξτε ξανά.
check-space-short-linux = Το Luft χρειάζεται περίπου { $needed } GB για να ξεκινήσει. Ελευθερώστε { $missing } GB και ελέγξτε ξανά.
check-system-replaceable = Το Luft μπορεί να πάρει τη θέση του και να κρατήσει τα αρχεία, τον λογαριασμό και τις ρυθμίσεις σας.
check-system-single = Τα αρχεία σας μοιράζονται ένα διαμέρισμα με το σύστημα, οπότε η αντικατάστασή του με διατήρηση των αρχείων δεν υποστηρίζεται ακόμη. Η δοκιμή και η εγκατάσταση του Luft λειτουργούν.
check-system-encrypted = Είναι κρυπτογραφημένο, οπότε η αντικατάστασή του με διατήρηση των αρχείων σας δεν υποστηρίζεται ακόμη.
check-system-unknown = Ο δίσκος του είναι οργανωμένος με τρόπο που το Luft δεν μπορεί ακόμη να αντικαταστήσει κρατώντας τα αρχεία σας.
check-encryption-off = Τα Windows δεν είναι κρυπτογραφημένα
check-encryption-off-detail = Η Εγκατάσταση Luft μπορεί να διαβάσει τις ρυθμίσεις τους και τις συσκευές Bluetooth σας.
check-encryption-on = Τα Windows είναι κρυπτογραφημένα με BitLocker
check-encryption-on-detail = Κανένα πρόβλημα. Τα Windows κάνουν μόνα τους τον χώρο, και το Meet Luft μεταφέρει ό,τι δεν μπορεί να διαβάσει το Luft από κλειδωμένο δίσκο. Κρατήστε κοντά σας το κλειδί αποκατάστασης, για κάθε ενδεχόμενο.
check-encryption-changing = Το BitLocker κρυπτογραφεί ή αποκρυπτογραφεί ακόμη
check-encryption-changing-detail = Περιμένετε να ολοκληρώσουν τα Windows και επιστρέψτε. Η πρόοδος φαίνεται στις Ρυθμίσεις, στην «Κρυπτογράφηση συσκευής».
check-fast-startup-on = Η γρήγορη εκκίνηση είναι ενεργή
check-fast-startup-on-detail = Τα Windows πέφτουν σε αδρανοποίηση αντί να τερματίζουν, κάτι που κρατά τον δίσκο τους κλειδωμένο. Το Meet Luft προτείνει να την απενεργοποιήσει πριν από την εγκατάσταση.
check-fast-startup-off = Η γρήγορη εκκίνηση είναι ανενεργή
check-fast-startup-off-detail = Τα Windows τερματίζουν πλήρως.
check-secure-boot-on = Το Secure Boot είναι ενεργό
check-secure-boot-on-detail = Μπορεί να μείνει ενεργό. Το Luft ζητά μία φορά, σε μια μπλε οθόνη, να προσθέσει το κλειδί του.
check-secure-boot-off = Το Secure Boot είναι ανενεργό
check-secure-boot-off-detail = Το Luft λειτουργεί και χωρίς αυτό, αλλά τα παιχνίδια με anti-cheat το χρειάζονται. { $turningOn }
check-secure-boot-restart-into = Το Meet Luft μπορεί να κάνει επανεκκίνηση στις ρυθμίσεις υλικολογισμικού, όπου βρίσκεται στο { $place }.
check-secure-boot-restart-into-anywhere = Το Meet Luft μπορεί να κάνει επανεκκίνηση στις ρυθμίσεις υλικολογισμικού, όπου συνήθως βρίσκεται στο Security ή στο Boot.
check-secure-boot-turn-on = Για να το ενεργοποιήσετε, κάντε επανεκκίνηση και πατήστε { $key } μόλις εμφανιστεί το λογότυπο της { $maker }, και μετά μεταβείτε στο { $place }.
check-secure-boot-turn-on-anywhere = Για να το ενεργοποιήσετε, ανοίξτε τις ρυθμίσεις υλικολογισμικού καθώς ξεκινά ο υπολογιστής και κοιτάξτε στο Security ή στο Boot.

## Where Secure Boot is in the firmware settings of each computer brand

check-firmware-place-security = Security › Secure Boot
check-firmware-place-boot-configuration = Boot Configuration › Secure Boot
check-firmware-place-security-or-advanced = Security ή Advanced › Secure Boot Configuration
check-firmware-place-security-or-boot = Security ή Boot › Secure Boot
check-firmware-place-boot = Boot › Secure Boot
check-firmware-place-settings = Settings › Security › Secure Boot

## Keys that open the firmware settings while a computer starts

check-firmware-key-lenovo = F2 (F1 σε ThinkPad)
check-firmware-key-f2 = F2
check-firmware-key-f10 = F10
check-firmware-key-f2-or-delete = F2 ή Delete
check-firmware-key-delete = Delete
check-firmware-key-volume-up = το κουμπί αύξησης έντασης

## More of the computer's hardware

check-tpm-detail = Ένα κρυπτογραφημένο Luft μπορεί να ξεκλειδώνει μόνο του όταν ξεκινά ο υπολογιστής.
check-tpm-missing = Δεν υπάρχει TPM 2.0
check-tpm-missing-detail = Αν κρυπτογραφήσετε το Luft, θα ζητά φράση πρόσβασης σε κάθε εκκίνηση.
check-graphics = Γραφικά
check-graphics-detail = Λειτουργούν αμέσως.
check-graphics-nvidia = Το Luft εγκαθίσταται με το πρόγραμμα οδήγησης της NVIDIA.
check-wifi-missing = Χωρίς Wi-Fi
check-wifi-missing-detail = Χρησιμοποιήστε καλώδιο δικτύου στο Luft ή καθόλου δίκτυο.
check-wifi-detail = Λειτουργεί στο Luft.
check-wifi-broadcom = Ορισμένα τσιπ Wi-Fi της Broadcom χρειάζονται πρόγραμμα οδήγησης που δεν περιλαμβάνει το Luft. Κρατήστε κοντά σας καλώδιο δικτύου ή κινητό για σύνδεση μέσω USB.
check-start-entries = { $count ->
    [one] Μια παλιά καταχώριση εκκίνησης
   *[other] { $count } παλιές καταχωρίσεις εκκίνησης
}
check-start-entries-detail = { $count ->
    [one] Η καταχώριση { $names } δείχνει σε σύστημα που δεν υπάρχει πια σε αυτό το PC. Μπορεί να αφαιρεθεί.
   *[other] Οι καταχωρίσεις { $names } δείχνουν σε συστήματα που δεν υπάρχουν πια σε αυτό το PC. Μπορούν να αφαιρεθούν.
}
check-download-unavailable = Δεν είναι δυνατή η λήψη του Luft αυτήν τη στιγμή
check-download-unavailable-detail = Το Meet Luft κατεβάζει περίπου 3 GB. Ελέγξτε ότι είστε συνδεδεμένοι και δοκιμάστε ξανά τον έλεγχο, ή χρησιμοποιήστε ένα ISO του Luft που ήδη έχετε.

## Choosing a Luft ISO file

iso-dialog-title = Επιλογή ISO του Luft
iso-dialog-filter = ISO του Luft

## Saving the logs from trying Luft

logs-file-name = Αρχεία καταγραφής Luft { $name }
logs-no-desktop = Το Meet Luft δεν βρήκε την επιφάνεια εργασίας σας
logs-not-saved = Το Meet Luft δεν μπόρεσε να αποθηκεύσει τα αρχεία καταγραφής της δοκιμής του Luft: { $error }

## Errors from the part of Meet Luft that works on the drive with your permission

helper-not-started = Η βοηθητική διεργασία του Meet Luft δεν ξεκίνησε: { $error }
helper-not-allowed = Το Meet Luft δεν έλαβε άδεια να εργαστεί στον δίσκο
helper-stopped = Η βοηθητική διεργασία του Meet Luft σταμάτησε
helper-stopped-because = Η βοηθητική διεργασία του Meet Luft σταμάτησε: { $error }
helper-pipe-failed = Το Meet Luft δεν μπόρεσε να επικοινωνήσει με τη βοηθητική διεργασία του: { $error }
helper-pipe-hijacked = Κάτι άλλο εκτός από τη βοηθητική διεργασία του Meet Luft άνοιξε το { $pipe }
helper-record-not-saved = Το Meet Luft δεν μπόρεσε να σημειώσει τι δημιούργησε: { $error }
helper-no-room-yet = Κάντε πρώτα χώρο για το Luft.
helper-not-ready-linux = Προετοιμάστε πρώτα το Luft.
helper-not-ready-to-start-windows = Το Luft δεν είναι ακόμη έτοιμο να ξεκινήσει. Κάντε πρώτα χώρο γι’ αυτό.
helper-not-ready-to-start-linux = Το Luft δεν είναι ακόμη έτοιμο να ξεκινήσει. Προετοιμάστε το πρώτα.
helper-update-unfinished = Η ενημέρωση του Luft δεν ολοκληρώθηκε. Ενημερώστε το ξανά πρώτα.
helper-room-too-small = Το Luft χρειάζεται περισσότερο χώρο.
helper-room-shortfall = Τα Windows μπορούν να διαθέσουν { $available } GB και το Luft χρειάζεται { $needed } GB.
helper-gap-shortfall = Αυτός ο χώρος έχει { $available } GB και το Luft χρειάζεται { $needed } GB.
helper-place-gone = Αυτός ο χώρος δεν είναι πια ελεύθερος. Ελέγξτε ξανά για να δείτε πού χωράει το Luft.
helper-box-shortfall = Τα Windows μπορούν να διαθέσουν ακόμη { $available } GB και αυτά χρειάζονται { $needed } GB.
helper-box-room-shortfall = Ο χώρος του Luft μπορεί να διαθέσει { $available } GB και αυτά χρειάζονται { $needed } GB.
helper-bluetooth-unreadable = Δεν ήταν δυνατό το άνοιγμα των ρυθμίσεων Bluetooth των Windows
helper-registry-not-opened = Δεν ήταν δυνατό το άνοιγμα του { $key }: { $error }
helper-registry-not-changed = Δεν ήταν δυνατή η αλλαγή του { $value }: { $error }
helper-registry-not-saved = Δεν ήταν δυνατή η αποθήκευση του { $file }: { $error }
helper-restart-failed = Ο υπολογιστής δεν έκανε επανεκκίνηση
helper-windows-restart-failed = Τα Windows δεν έκαναν επανεκκίνηση: { $error }

## Errors about the computer's firmware

firmware-not-uefi = Αυτό το PC δεν ξεκινά με UEFI
firmware-variable-unreadable = Δεν ήταν δυνατή η ανάγνωση του { $name } από το υλικολογισμικό: { $error }
firmware-variable-not-saved = Δεν ήταν δυνατή η αποθήκευση του { $name } στο υλικολογισμικό: { $error }
firmware-entries-full = Το υλικολογισμικό δεν έχει χώρο για άλλη καταχώριση εκκίνησης
firmware-entry-kept = Τα Windows κράτησαν την καταχώριση εκκίνησης { $entry }

## Errors about drives and partitions

drive-list-failed = Δεν ήταν δυνατή η εμφάνιση των δίσκων: { $error }
drive-of-path-unknown = Δεν ήταν δυνατό να βρεθεί ποιος δίσκος περιέχει τον φάκελο { $path }
drive-windows-folder-missing = Ο φάκελος των Windows δεν βρέθηκε
drive-windows-drive-missing = Ο δίσκος των Windows δεν βρέθηκε
drive-windows-drive-missing-because = Ο δίσκος των Windows δεν βρέθηκε: { $error }
drive-windows-partition-missing = Το διαμέρισμα των Windows δεν βρέθηκε
drive-volume-missing = Ο τόμος { $path } δεν βρέθηκε
drive-storage-error = { $what } (σφάλμα αποθήκευσης των Windows { $code })
drive-shrink-size-unknown = Τα Windows δεν μπόρεσαν να υπολογίσουν πόσο μπορεί να μικρύνει το διαμέρισμά τους
drive-resize-failed = Τα Windows δεν μπόρεσαν να αλλάξουν το μέγεθος του διαμερίσματός τους
drive-create-failed = Τα Windows δεν μπόρεσαν να δημιουργήσουν διαμέρισμα για το Luft
drive-hide-failed = Τα Windows δεν μπόρεσαν να κρύψουν το νέο διαμέρισμα από την Εξερεύνηση αρχείων
drive-format-failed = Τα Windows δεν μπόρεσαν να μορφοποιήσουν το νέο διαμέρισμα
drive-remove-failed = Τα Windows δεν μπόρεσαν να αφαιρέσουν ένα από τα διαμερίσματα του Luft
drive-new-partition-missing = Το νέο διαμέρισμα δεν βρέθηκε
drive-new-partition-no-volume = Το νέο διαμέρισμα δεν έχει τόμο
drive-start-no-guid = Το διαμέρισμα εκκίνησης δεν έχει GUID
drive-live-no-guid = Το διαμέρισμα live δεν έχει GUID
drive-box-no-guid = Η κούτα μετακόμισης δεν έχει GUID
drive-guid-unreadable = Το GUID του διαμερίσματος δεν είναι αναγνώσιμο
drive-not-gpt = Ο πίνακας διαμερισμάτων του δίσκου δεν είναι GPT
drive-start-no-volume = Το διαμέρισμα εκκίνησης δεν έχει τόμο
drive-live-no-volume = Το διαμέρισμα του Luft δεν έχει τόμο
drive-new-live-no-volume = Το νέο διαμέρισμα του Luft δεν έχει τόμο
drive-partitions-not-noted = Τα διαμερίσματα του Luft λείπουν από τις σημειώσεις του Meet Luft
drive-partitions-gone = Τα διαμερίσματα του Luft εξαφανίστηκαν
drive-partition-gone = Ένα διαμέρισμα εξαφανίστηκε
drive-gone = Ένας δίσκος εξαφανίστηκε
drive-erase-failed = Τα Windows δεν μπόρεσαν να διαγράψουν τον δίσκο
drive-erased-no-room = Ο δίσκος που διαγράφηκε δεν έχει χώρο για το Luft
drive-start-partition-foreign = Το διαμέρισμα εκκίνησης του Luft δεν το δημιούργησε το Meet Luft
drive-start-partition-gone = Το διαμέρισμα εκκίνησης του Luft δεν υπάρχει πια
drive-start-partition-not-listed = Το διαμέρισμα εκκίνησης του Luft δεν υπάρχει στον πίνακα διαμερισμάτων
drive-no-esp = Αυτός ο υπολογιστής δεν έχει διαμέρισμα συστήματος EFI
drive-esp-full = Το διαμέρισμα συστήματος EFI είναι πολύ γεμάτο για τα αρχεία εκκίνησης του Luft.
drive-esp-not-opened = Δεν ήταν δυνατό το άνοιγμα του διαμερίσματος συστήματος EFI
drive-esp-file-unreadable = Το αρχείο { $file } του διαμερίσματος συστήματος EFI δεν είναι αναγνώσιμο
drive-esp-no-drive = Το διαμέρισμα συστήματος EFI δεν έχει δίσκο
drive-esp-no-guid = Το διαμέρισμα συστήματος EFI δεν έχει GUID
drive-no-uuid = Ο δίσκος όπου φυλάσσεται το Luft δεν έχει UUID
drive-folder-unreadable = Το Luft δεν μπορεί να ξεκινήσει από τον δίσκο όπου βρίσκονται τα αρχεία σας.
drive-folder-not-startable = Δεν είναι δυνατή η εκκίνηση από τον φάκελο { $folder }

## Errors while changing Luft once it's installed

luft-gone = Το Luft δεν υπάρχει πια σε αυτό το PC
luft-not-resizable = Το μέγεθος του Luft δεν μπορεί να αλλάξει από τα Windows αυτήν τη στιγμή
luft-size-not-allowed = Το Luft δεν μπορεί να έχει αυτό το μέγεθος
luft-space-promised = Αυτός ο χώρος είναι δεσμευμένος για το Luft. Ακυρώστε πρώτα την αλλαγή.
luft-no-start-entry = Η καταχώριση εκκίνησης του Luft δεν βρέθηκε

## Errors while getting Luft

live-no-home-folder = Δεν υπάρχει προσωπικός φάκελος για να φυλαχτεί το Luft
live-no-app-data-folder = Δεν υπάρχει τοπικός φάκελος δεδομένων εφαρμογών για να φυλαχτεί το Luft
live-pointer-unreadable = Το νεότερο Luft δεν είναι αναγνώσιμο
live-not-published = Το Luft δεν έχει δημοσιευτεί εκεί
live-checksum-unreadable = Το αρχείο αθροίσματος ελέγχου δεν είναι αναγνώσιμο
live-checksum-not-read = Δεν ήταν δυνατή η ανάγνωση του αθροίσματος ελέγχου του Luft: { $error }
live-download-damaged = Η λήψη αλλοιώθηκε στην πορεία. Δοκιμάστε ξανά.
live-download-incomplete = Από το Luft που λήφθηκε λείπει το { $file }
live-download-not-resumable = Ο διακομιστής δεν μπορεί να συνεχίσει τη λήψη
live-not-signed = Το { $iso } δεν είναι υπογεγραμμένο
live-signature-unreadable = Η υπογραφή του { $iso } δεν είναι αναγνώσιμη
live-signature-wrong-key = Το { $iso } δεν είναι υπογεγραμμένο από τη Lantharos
live-signature-other-iso = Η υπογραφή αφορά το { $signed }, όχι το { $iso }
live-iso-out-of-order = Τα αρχεία του ISO δεν είναι σε σειρά που μπορεί να διαβάσει το Meet Luft
live-iso-not-iso = Αυτό δεν είναι εικόνα ISO
live-iso-no-root = Το ISO δεν έχει ριζικό φάκελο
live-iso-no-joliet = Το ISO δεν έχει ονόματα Joliet
live-not-removed = Δεν ήταν δυνατή η αφαίρεση του φακέλου { $path }: { $error }

## Errors while making a USB stick

stick-gone = Το στικ δεν υπάρχει πια. Συνδέστε το ξανά και επιλέξτε το πάλι.
stick-too-small = Το Luft δεν χωράει σε αυτό το στικ. Χρησιμοποιήστε ένα των 4 GB ή μεγαλύτερο.
stick-damaged = Το ISO δεν ταιριάζει με το άθροισμα ελέγχου του. Ίσως αλλοιώθηκε στην πορεία.
stick-read-back-differs = Το στικ δεν επέστρεψε κατά την ανάγνωση ό,τι γράφτηκε σε αυτό. Ίσως έχει φθαρεί, οπότε δοκιμάστε άλλο.
stick-download-unavailable = Δεν είναι δυνατή η λήψη του Luft αυτήν τη στιγμή: { $error }
stick-download-failed = Η λήψη του Luft απέτυχε: { $error }
stick-checksum-unreadable = Δεν είναι δυνατή η ανάγνωση του αθροίσματος ελέγχου του ISO: { $error }
stick-file-unreadable = Δεν είναι δυνατή η ανάγνωση του { $path }: { $error }
stick-iso-unreadable = Δεν είναι δυνατή η ανάγνωση του ISO: { $error }
stick-iso-no-name = Το ISO δεν έχει όνομα
stick-iso-ended-early = Το ISO τελείωσε πρόωρα
stick-iso-already-there = Το { $name } υπάρχει ήδη στο στικ.
stick-no-room = Δεν υπάρχει χώρος για το Luft στο στικ. Ελευθερώστε πρώτα { $size } MB σε αυτό.
stick-older-not-removed = Δεν ήταν δυνατή η αφαίρεση του παλαιότερου Luft: { $error }
stick-copy-stopped = Η αντιγραφή του Luft στο στικ σταμάτησε: { $error }
stick-not-opened = Δεν ήταν δυνατό το άνοιγμα του στικ: { $error }
stick-write-stopped = Η εγγραφή στο στικ σταμάτησε: { $error }
stick-not-synced = Το στικ δεν αποθήκευσε τα πάντα: { $error }
stick-read-back-failed = Δεν ήταν δυνατή η ανάγνωση του στικ για έλεγχο: { $error }
stick-in-use = Το στικ χρησιμοποιείται ακόμη: { $error }
stick-device-in-use = Το { $device } χρησιμοποιείται ακόμη: { $error }
stick-volume-not-opened = Δεν ήταν δυνατό το άνοιγμα του τόμου του στικ: { $error }
stick-volume-in-use = Το στικ χρησιμοποιείται ακόμη. Κλείστε ό,τι έχει ανοιχτά αρχεία σε αυτό και δοκιμάστε ξανά ({ $error })
stick-not-dismounted = Τα Windows δεν μπόρεσαν να αποδεσμεύσουν το στικ: { $error }
stick-not-cleared = Τα Windows δεν μπόρεσαν να καθαρίσουν το στικ: { $error }
stick-not-refreshed = Τα Windows δεν μπόρεσαν να ελέγξουν ξανά το στικ: { $error }
stick-not-ventoy = Αυτό το στικ δεν χρησιμοποιεί πια Ventoy.
stick-ventoy-not-opened = Δεν ήταν δυνατό το άνοιγμα του διαμερίσματος του Ventoy: { $error }
stick-ventoy-not-opened-windows = Τα Windows δεν μπορούν να ανοίξουν το διαμέρισμα του Ventoy
stick-udisks-missing = Το Meet Luft χρειάζεται το UDisks για να χρησιμοποιήσει το στικ: { $error }
