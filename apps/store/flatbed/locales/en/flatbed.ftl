## Starting up

start-failed = Flatbed couldn't start: { $reason }

## Where pages come from

sources-title = Scan from
# Shown under the list while no scanner has been found yet.
sources-looking = Scanners show up here as soon as they're found.
source-network = On the network
source-usb = Plugged in
source-camera = Camera
source-camera-detail = Photograph a page
source-add = Add a scanner…
settings-open = Settings

## The document

document-title = Scans
document-empty = No pages yet
document-pages = { $count ->
    [one] { $count } page
   *[other] { $count } pages
}
document-clear = Remove all pages
more = More
mode-label = How pages look
mode-colour = Colour
mode-grey = Grey
mode-black-and-white = Black and white
save-open = Save…

welcome-glass = Put a page face down on the scanner's glass
welcome-feeder = Load the pages into the scanner's feeder
welcome-camera = Lay the page flat in good light and hold the camera over it
welcome-drop = Or drop in photos of pages you took before.

## Scanning

feed-label = Paper from
feed-glass = Glass
feed-feeder = Feeder
# The feeder scans both sides of each sheet.
feed-both-sides = Both sides
scan-start = Scan
camera-start = Take a photo
import-open = Open pictures…
import-title = Open pictures of pages
import-filter = Pictures
import-unreadable = { $count ->
    [one] One file isn't a picture Flatbed can open
   *[other] { $count } files aren't pictures Flatbed can open
}
# The variable is the scanner's name.
scan-scanning = Scanning on { $name }
scan-cancel = Cancel
scan-incoming = The page being scanned
scan-busy = The scanner is busy. Try again once it's done.
scan-feeder-empty = There's no paper in the feeder.
scan-gone = The scanner can't be reached anymore. Check that it's on.
scan-failed = The scan stopped: { $reason }

## Pages

# The variable is the page's number in the document.
page-adjust = Page { $number }, adjust its corners
page-turn-left = Turn left
page-turn-right = Turn right
page-corners = Adjust corners
page-remove = Remove page

corners-title = Adjust corners
corners-description = Drag each corner to the edge of the paper.
corners-whole = Use the whole picture
corner-top-left = Top left corner
corner-top-right = Top right corner
corner-bottom-right = Bottom right corner
corner-bottom-left = Bottom left corner

clear-title = Remove all pages?
clear-description = { $count ->
    [one] Save the page first if you want to keep it.
   *[other] Save the { $count } pages first if you want to keep them.
}
clear-confirm = Remove

## Camera

camera-title = Take a photo of a page
camera-description = Take the photo when the outline sits on the paper's edges.
camera-opening = Opening the camera
camera-refused = Flatbed isn't allowed to use the camera. Allow it in Settings → Privacy.
camera-failed = The camera couldn't start: { $reason }
camera-take = Take photo
camera-taken = { $count ->
    [one] { $count } page added
   *[other] { $count } pages added
}

## Saving

save-dialog-title = Save
save-name = Name
# The variable is today's date, written out.
save-default-name = Scan { $date }
save-fallback-name = Scan
save-format = Format
format-pdf = PDF
format-jpeg = JPG
format-png = PNG
save-searchable = Searchable text
save-searchable-detail = Lets you find and copy the text
save-searchable-missing = Text recognition isn't installed
save-paper = Page size
paper-automatic = As scanned
paper-a4 = A4
paper-letter = Letter
save-pictures-one = The page is saved as a picture
save-pictures-several = { $count ->
    [one] The page is saved as a picture
   *[other] The { $count } pages are saved as numbered pictures in the folder you choose
}
save-choose-file = Save…
save-choose-folder = Choose folder…
save-title = Save the scan
save-folder-title = Choose a folder for the pages
save-filter-pdf = PDF documents
save-filter-jpeg = JPG pictures
save-filter-png = PNG pictures
save-reading = Reading the text on each page
save-saving = Saving
save-failed = It couldn't be saved: { $reason }
saved-title = Saved
saved-one = Your scan is saved.
saved-several = { $count ->
    [one] The page is saved.
   *[other] All { $count } pages are saved.
}
saved-show = Show in folder
# Button that opens the system's Send sheet, to send the saved scan to a device nearby or an app
saved-send = Send…
# $reason comes from the system and may be in English
send-failed = It couldn't be sent: { $reason }

## Adding a scanner

add-title = Add a scanner
add-description = If your scanner doesn't show up by itself, type its network address.
add-address = Address
# The variable is what was typed.
add-failed = No scanner answered at { $address }.
add-looking = Looking for the scanner
add-confirm = Add

## A network scanner that no longer shows the certificate Flatbed remembered for it

identity-title = This scanner's identity changed
# $name is the scanner's name
identity-description = { $name } identifies itself differently now. A reset or replaced scanner does this, but so does something on the network posing as it. Nothing is sent to it unless you trust it again.
# Button that leaves the scanner alone
identity-leave = Don't use it
# Button that accepts the scanner as it is now
identity-trust = Trust this scanner

## Settings

settings-title = Settings
settings-fine = Fine scans
settings-fine-detail = For small print and photos. Scanning takes longer.
settings-languages = Languages to read
settings-languages-detail = Saved PDFs can be searched in these languages.
settings-languages-missing = Text recognition isn't installed, so saved PDFs can't be searched.

## Dialogs

dialog-cancel = Cancel
dialog-done = Done
