## Starting up

start-failed = Flatbed nuk u nis dot: { $reason }

## Where pages come from

sources-title = Skano nga
sources-looking = Skanerët në rrjet dhe ata të lidhur me kompjuterin shfaqen këtu sapo gjenden.
source-network = Në rrjet
source-usb = I lidhur
source-camera = Kamera
source-camera-detail = Fotografo një faqe
source-add = Shto një skaner…
settings-open = Cilësimet

## The document

document-title = Skanimet
document-empty = Ende pa faqe
document-pages = { $count ->
    [one] { $count } faqe
   *[other] { $count } faqe
}
document-clear = Hiq të gjitha faqet
more = Më shumë
mode-label = Si duken faqet
mode-colour = Me ngjyra
mode-grey = Gri
mode-black-and-white = Bardhë e zi
save-open = Ruaj…

welcome-glass = Vendose faqen përmbys mbi xhamin e skanerit
welcome-feeder = Vendosi faqet në furnizuesin e skanerit
welcome-camera = Shtrije faqen në dritë të mirë dhe mbaje kamerën sipër saj
welcome-drop = Flatbed e drejton dhe e pastron çdo faqe. Mund të fusësh edhe fotografi faqesh që i ke bërë më parë.

## Scanning

feed-label = Letra nga
feed-glass = Xhami
feed-feeder = Furnizuesi
feed-both-sides = Të dyja anët
scan-start = Skano
camera-start = Bëj një foto
import-open = Hap fotografi…
import-title = Hap fotografi faqesh
import-filter = Fotografi
import-unreadable = { $count ->
    [one] Një skedar nuk është fotografi që Flatbed mund ta hapë
   *[other] { $count } skedarë nuk janë fotografi që Flatbed mund t’i hapë
}
scan-scanning = Po skanohet në { $name }
scan-cancel = Anulo
scan-incoming = Faqja që po skanohet
scan-busy = Skaneri është i zënë me diçka tjetër. Provo sërish kur të mbarojë.
scan-feeder-empty = Nuk ka letër në furnizues.
scan-gone = Skaneri nuk arrihet më. Kontrollo nëse është i ndezur.
scan-failed = Skanimi u ndal: { $reason }

## Pages

page-adjust = Faqja { $number }, rregullo qoshet
page-turn-left = Ktheje majtas
page-turn-right = Ktheje djathtas
page-corners = Rregullo qoshet
page-remove = Hiqe faqen

corners-title = Rregullo qoshet
corners-description = Tërhiqe çdo qoshe deri te skaji i letrës.
corners-whole = Përdor gjithë fotografinë
corner-top-left = Qoshja lart majtas
corner-top-right = Qoshja lart djathtas
corner-bottom-right = Qoshja poshtë djathtas
corner-bottom-left = Qoshja poshtë majtas

clear-title = T’i heqësh të gjitha faqet?
clear-description = { $count ->
    [one] Faqja që skanove do të hiqet. Ruaje më parë nëse do ta mbash.
   *[other] { $count } faqet që skanove do të hiqen. Ruaji më parë nëse do t’i mbash.
}
clear-confirm = Hiqi

## Camera

camera-title = Fotografo një faqe
camera-description = Kur vija të bjerë mbi skajet e letrës, bëje foton. Mund të fotografosh sa faqe të duash.
camera-opening = Po hapet kamera
camera-refused = Flatbed nuk lejohet ta përdorë kamerën. Mund ta lejosh te Cilësimet → Privatësia.
camera-failed = Kamera nuk u nis dot: { $reason }
camera-take = Bëj foton
camera-taken = { $count ->
    [one] U shtua { $count } faqe
   *[other] U shtuan { $count } faqe
}

## Saving

save-dialog-title = Ruaj
save-name = Emri
save-default-name = Skanim { $date }
save-fallback-name = Skanim
save-format = Formati
format-pdf = PDF
format-jpeg = JPG
format-png = PNG
save-searchable = Tekst i kërkueshëm
save-searchable-detail = Lexon tekstin në çdo faqe që ta gjesh dhe ta kopjosh
save-searchable-missing = Njohja e tekstit nuk është e instaluar në këtë kompjuter
save-paper = Madhësia e faqes
paper-automatic = Siç u skanua
paper-a4 = A4
paper-letter = Letter
save-pictures-one = Faqja ruhet si fotografi
save-pictures-several = { $count ->
    [one] Faqja ruhet si fotografi
   *[other] Secila nga { $count } faqet ruhet si fotografi më vete, e numëruar, në dosjen që zgjedh
}
save-choose-file = Ruaj…
save-choose-folder = Zgjidh dosjen…
save-title = Ruaje skanimin
save-folder-title = Zgjidh një dosje për faqet
save-filter-pdf = Dokumente PDF
save-filter-jpeg = Fotografi JPG
save-filter-png = Fotografi PNG
save-reading = Po lexohet teksti në çdo faqe
save-saving = Po ruhet
save-failed = Nuk u ruajt dot: { $reason }
saved-title = U ruajt
saved-one = Skanimi yt u ruajt.
saved-several = { $count ->
    [one] Faqja u ruajt.
   *[other] Të { $count } faqet u ruajtën.
}
saved-show = Shfaqe në dosje
saved-send = Dërgo…
send-failed = Nuk u dërgua dot: { $reason }

## Adding a scanner

add-title = Shto një skaner
add-description = Zakonisht skanerët shfaqen vetë. Nëse yti nuk shfaqet, shkruaj adresën që ka në rrjet.
add-address = Adresa
add-failed = Asnjë skaner nuk u përgjigj në { $address }.
add-looking = Po kërkohet skaneri
add-confirm = Shto

## Settings

settings-title = Cilësimet
settings-fine = Skanime të imëta
settings-fine-detail = Skanon me 600 piksela për inç, për shkrim të imët dhe fotografi. Skanimi zgjat më shumë.
settings-languages = Gjuhët për lexim
settings-languages-detail = Teksti në faqet e tua lexohet në këtë kompjuter në këto gjuhë, që PDF-të e ruajtura të mund të kërkohen.
settings-languages-missing = Njohja e tekstit nuk është e instaluar në këtë kompjuter, ndaj PDF-të e ruajtura mbajnë vetëm fotografi të faqeve.

## Dialogs

dialog-cancel = Anulo
dialog-done = U krye
