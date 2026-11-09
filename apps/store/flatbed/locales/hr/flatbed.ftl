## Starting up

start-failed = Flatbed se nije mogao pokrenuti: { $reason }

## Where pages come from

sources-title = Skeniraj s
sources-looking = Skeneri na mreži i oni priključeni na računalo pojavit će se ovdje čim budu pronađeni.
source-network = Na mreži
source-usb = Priključen
source-camera = Kamera
source-camera-detail = Fotografiraj stranicu
source-add = Dodaj skener…
settings-open = Postavke

## The document

document-title = Skenovi
document-empty = Još nema stranica
document-pages = { $count ->
    [one] { $count } stranica
    [few] { $count } stranice
   *[other] { $count } stranica
}
document-clear = Ukloni sve stranice
more = Više
mode-label = Izgled stranica
mode-colour = U boji
mode-grey = Sivo
mode-black-and-white = Crno-bijelo
save-open = Spremi…

welcome-glass = Stavi stranicu licem prema dolje na staklo skenera
welcome-feeder = Umetni stranice u ulagač skenera
welcome-camera = Položi stranicu ravno na dobro svjetlo i drži kameru iznad nje
welcome-drop = Flatbed ispravlja i čisti svaku stranicu. Možeš i ubaciti fotografije stranica koje si već snimio.

## Scanning

feed-label = Papir iz
feed-glass = Staklo
feed-feeder = Ulagač
feed-both-sides = Obje strane
scan-start = Skeniraj
camera-start = Snimi fotografiju
import-open = Otvori slike…
import-title = Otvori slike stranica
import-filter = Slike
import-unreadable = { $count ->
    [one] { $count } datoteka nije slika koju Flatbed može otvoriti
    [few] { $count } datoteke nisu slike koje Flatbed može otvoriti
   *[other] { $count } datoteka nisu slike koje Flatbed može otvoriti
}
scan-scanning = Skeniranje na uređaju { $name }
scan-cancel = Odustani
scan-incoming = Stranica koja se upravo skenira
scan-busy = Skener je zauzet nečim drugim. Pokušaj ponovno kad završi.
scan-feeder-empty = U ulagaču nema papira.
scan-gone = Skener više nije dostupan. Provjeri je li uključen.
scan-failed = Skeniranje je prekinuto: { $reason }

## Pages

page-adjust = Stranica { $number }, prilagodi kutove
page-turn-left = Okreni ulijevo
page-turn-right = Okreni udesno
page-corners = Prilagodi kutove
page-remove = Ukloni stranicu

corners-title = Prilagodi kutove
corners-description = Povuci svaki kut do ruba papira.
corners-whole = Upotrijebi cijelu sliku
corner-top-left = Gornji lijevi kut
corner-top-right = Gornji desni kut
corner-bottom-right = Donji desni kut
corner-bottom-left = Donji lijevi kut

clear-title = Ukloniti sve stranice?
clear-description = { $count ->
    [one] Skenirana stranica bit će uklonjena. Spremi je prije ako je želiš zadržati.
   *[other] Skenirane stranice ({ $count }) bit će uklonjene. Spremi ih prije ako ih želiš zadržati.
}
clear-confirm = Ukloni

## Camera

camera-title = Fotografiraj stranicu
camera-description = Kad obris legne na rubove papira, snimi fotografiju. Možeš snimiti koliko god stranica želiš.
camera-opening = Otvaranje kamere
camera-refused = Flatbed ne smije koristiti kameru. Možeš to dopustiti u Postavke → Privatnost.
camera-failed = Kamera se nije mogla pokrenuti: { $reason }
camera-take = Snimi
camera-taken = { $count ->
    [one] Dodana je { $count } stranica
    [few] Dodane su { $count } stranice
   *[other] Dodano je { $count } stranica
}

## Saving

save-dialog-title = Spremi
save-name = Naziv
save-default-name = Sken { $date }
save-fallback-name = Sken
save-format = Format
format-pdf = PDF
format-jpeg = JPG
format-png = PNG
save-searchable = Pretraživ tekst
save-searchable-detail = Čita tekst na svakoj stranici kako bi ga mogao pronaći i kopirati
save-searchable-missing = Prepoznavanje teksta nije instalirano na ovom računalu
save-paper = Veličina stranice
paper-automatic = Kao skenirano
paper-a4 = A4
paper-letter = Letter
save-pictures-one = Stranica se sprema kao slika
save-pictures-several = { $count ->
    [one] Stranica se sprema kao slika
   *[other] Svaka od stranica ({ $count }) sprema se kao zasebna, numerirana slika u mapu koju odabereš
}
save-choose-file = Spremi…
save-choose-folder = Odaberi mapu…
save-title = Spremi sken
save-folder-title = Odaberi mapu za stranice
save-filter-pdf = PDF dokumenti
save-filter-jpeg = JPG slike
save-filter-png = PNG slike
save-reading = Čitanje teksta na svakoj stranici
save-saving = Spremanje
save-failed = Nije se moglo spremiti: { $reason }
saved-title = Spremljeno
saved-one = Tvoj sken je spremljen.
saved-several = { $count ->
    [one] Stranica je spremljena.
   *[other] Sve stranice ({ $count }) su spremljene.
}
saved-show = Prikaži u mapi
saved-send = Pošalji…
send-failed = Nije se moglo poslati: { $reason }

## Adding a scanner

add-title = Dodaj skener
add-description = Skeneri se obično pojave sami. Ako se tvoj ne pojavi, upiši njegovu adresu na mreži.
add-address = Adresa
add-failed = Na adresi { $address } nije se javio nijedan skener.
add-looking = Traženje skenera
add-confirm = Dodaj

## Settings

settings-title = Postavke
settings-fine = Fino skeniranje
settings-fine-detail = Skenira sa 600 piksela po inču, za sitna slova i fotografije. Skeniranje traje dulje.
settings-languages = Jezici za čitanje
settings-languages-detail = Tekst na tvojim stranicama čita se na ovom računalu na ovim jezicima, kako bi se spremljeni PDF-ovi mogli pretraživati.
settings-languages-missing = Prepoznavanje teksta nije instalirano na ovom računalu, pa spremljeni PDF-ovi sadrže samo slike stranica.

## Dialogs

dialog-cancel = Odustani
dialog-done = Gotovo
