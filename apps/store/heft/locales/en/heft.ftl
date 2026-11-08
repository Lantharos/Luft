## Starting up

# The subject and notebook Heft makes the first time it starts, so there is somewhere to write right away.
default-subject = Notes
default-notebook = Class notes
start-failed-title = Heft couldn't open your notebooks
start-failed-body = { $error }

## Toolbar

toolbar-label = Tools
toolbar-undo = Undo
toolbar-redo = Redo
toolbar-eraser = Eraser
toolbar-add-page = Add a page after this one
toolbar-paper = Paper
toolbar-zoom = Zoom
# A pen in the toolbar; the variable is its color's name or "Highlighter".
toolbar-pen = { $name }
toolbar-pen-options = Change this pen

## Pens

pen-fountain = Fountain pen
pen-ballpoint = Ballpoint
pen-highlighter = Highlighter
pen-kind = Kind of pen
pen-thickness = Thickness
pen-color = Color
pen-add = Keep as a new pen
pen-remove = Remove this pen
pen-color-black = Black
pen-color-gray = Gray
pen-color-blue = Blue
pen-color-sky = Sky blue
pen-color-red = Red
pen-color-orange = Orange
pen-color-green = Green
pen-color-purple = Purple
pen-color-yellow = Yellow
pen-color-lime = Lime
pen-color-pink = Pink
pen-color-cyan = Light blue
pen-color-other = Your color

## Eraser

eraser-mode = What it erases
eraser-strokes = Whole strokes
eraser-area = Only what it touches
eraser-size = Size
eraser-small = Small
eraser-medium = Medium
eraser-large = Large

## Zoom

zoom-fit-width = Fit width
zoom-fit-page = Whole page
zoom-actual = Actual size
zoom-in = Zoom in
zoom-out = Zoom out
# How far the notebook is zoomed in.
zoom-percent = { $percent }%

## Dialogs

dialog-cancel = Cancel
dialog-save = Save
dialog-done = Done

## Tabs

tabs-label = Open notebooks
tabs-home = All subjects
# The variable is the notebook's name.
tabs-close = Close { $name }

## Home

home-recent = Recently written
home-new-subject = New subject
home-archive = Archive
home-trash = Trash
home-pages = { $count ->
    [one] { $count } page
   *[other] { $count } pages
}
subject-options = More for { $name }
subject-edit = Rename or recolor
subject-archive = Archive
subject-unarchive = Bring back from the archive
subject-trash = Move to the trash
subject-trash-title = Move { $name } to the trash?
subject-trash-body = Its notebooks go with it. You can bring it back from the trash for 30 days.
subject-new-page = New page
subject-new-notebook = New notebook
subject-new-title = New subject
subject-new-body = Each subject gets a notebook to start with. Add a textbook or more notebooks whenever you like.
subject-edit-title = Subject
subject-name = Name
# An example subject name, shown in the empty name field.
subject-name-example = Mathematics
subject-color = Color
subject-create = Add subject
archive-title = Archive
archive-body = Subjects you're done with, such as last year's, kept out of the way.
archive-restore = Bring back
trash-title = Trash
trash-body = Subjects and notebooks stay here for 30 days before they're deleted.
trash-empty = The trash is empty
trash-restore = Restore
trash-delete = Delete now

## Notebooks

notebook-menu = Notebook options
notebook-open = Open
notebook-trash = Move to the trash
notebook-rename = Rename
notebook-rename-title = Rename notebook
notebook-paper = Paper
notebook-typed-start = Carry typing on to the next page
notebook-typed-stop = Stop carrying typing on to the next page
notebook-deleted-pages = Deleted pages
notebook-name = Name
# An example notebook name, shown in the empty name field.
notebook-name-example = Class notes
notebook-typed = Mostly typed
notebook-typed-body = Enter keeps going down the page, and typing carries on to a new page when one is full.
# The variable is the subject the notebook goes into.
notebook-new-title = New notebook in { $subject }
notebook-create = Create
# Where the notebook is scrolled to.
page-of = Page { $page } of { $pages }
deleted-pages-title = Deleted pages
deleted-pages-body = Pages deleted from this notebook. Bring one back and it returns to where it was.
deleted-pages-restore = Restore

## Paper

paper-title = Paper
paper-body = For every page in this notebook that hasn't been given its own.
paper-body-page = Only for this page; the others keep the notebook’s.
paper-scope = Paper for
paper-this-page = This page
paper-every-page = Every page
paper-template = Template
paper-blank = Blank
paper-lined = Lined
paper-grid = Squared
paper-dotted = Dotted
paper-cornell = Cornell
paper-staff = Music
paper-size = Size
paper-letter = Letter
paper-infinite = Endless
paper-color = Paper color
paper-white = White
paper-cream = Cream
paper-dark = Dark
paper-spacing = Spacing
paper-millimetres = { $value } mm
paper-landscape = Landscape

## Text and pictures

toolbar-type = Type
toolbar-picture = Add a picture
picture-choose-title = Add a picture
picture-choose-filter = Pictures
text-to-notes = Add to notes
format-heading = Heading
format-bold = Bold
format-list = List
format-numbered = Numbered list

## Search and the command palette

palette-placeholder = Find a subject, notebook, section or words
palette-empty = Nothing matches
palette-subject = Subject, start a new page
palette-new-page = New page in this subject
# Keys shown next to the command.
palette-new-page-keys = Ctrl N
palette-export-pdf = Save as PDF
palette-export-png = Save this page as a picture
# Where a search hit is; the variables are the subject, the notebook and the page number.
palette-hit = { $subject } · { $notebook } · page { $page }

## Exporting

notebook-export = Save as PDF or picture
export-title = Save a copy
export-format = Format
export-pdf = PDF
export-png = Picture
export-range = What to save
export-this-page = This page
export-this-section = This section
export-whole-notebook = Whole notebook
export-paper = Include the paper's lines
export-save = Save
export-pdf-filter = PDF documents
export-png-filter = PNG pictures
# The suggested file name for one page.
export-page-name = { $notebook }, page { $page }

## Settings

settings-title = Settings
settings-pressure = Pressure
settings-pressure-body = Drag the curve up for a light touch to write boldly, or down to need a firmer press.
settings-smoothing = Smoothing
settings-smoothing-value = { $percent }%
settings-smoothing-body = Evens out shaky lines. More smoothing trails the pen a little.
settings-buttons = Pen buttons
settings-buttons-body = What the side buttons do is set for every app in Luft's pen settings. A button set to erase erases here too, with the eraser you chose.
settings-buttons-open = Pen settings
settings-prediction = Draw slightly ahead of the pen
settings-prediction-body = Guesses where the pen is going for the next few milliseconds, so ink keeps up with fast writing.
settings-finger-pans = Scroll with one finger
settings-finger-pans-body = Two fingers always scroll and zoom.
settings-touch-draws = Draw with a finger
settings-touch-draws-body = Off, a hand resting on the screen never leaves marks.

## Focus

focus-enter = Write full screen
focus-leave = Leave full screen

## Lasso

toolbar-lasso = Lasso
selection-label = Picked ink
selection-actions = What to do with the picked ink
selection-copy = Copy
selection-cut = Cut
selection-duplicate = Duplicate
selection-delete = Delete
selection-convert = Turn into text

## Books

subject-add-book = Add a textbook
book-choose-title = Add a textbook
book-choose-filter = PDF documents
notebook-insert-pdf = Add pages from a PDF
toolbar-text = Pick text
text-actions = Picked text
text-highlight = Highlight
text-copy = Copy
notebook-split = Open another notebook beside this one
notebook-unsplit = Close the one beside
beside-title = Open beside
beside-body = Both stay open side by side, each on its own page, and come back together next time.

# Shown when PDFs are opened with Heft; the variables are how many there are and the first one's name.
import-title = { $count ->
    [one] Add { $name } to which subject?
   *[other] Add { $count } textbooks to which subject?
}
import-body = Each becomes a book you can write and highlight in. The PDF itself stays as it is.

## Page rail

rail-view = Show
rail-pages = Pages
rail-contents = Contents

rail-label = Pages
rail-show = Show pages
rail-hide = Hide pages
# The variable is the page's number in the notebook.
rail-page = Page { $number }
rail-page-options = More for page { $number }
rail-add-before = Add a page before
rail-add-after = Add a page after
rail-duplicate = Duplicate
rail-section = Start a section here
rail-paper = Paper
rail-delete = Delete page
section-new-title = New section
section-rename-title = Section
section-name = Section name
section-create = Add section

settings-toolbar = Tools
settings-toolbar-top = Along the top
settings-toolbar-side = Down the side
settings-toolbar-tablet = When the computer is folded into a tablet, the tools move to the side and get bigger.
settings-toolbar-tablet-now = Folded into a tablet, the tools are down the side.
settings-pages = Pages
settings-pages-continuous = One after another
settings-pages-single = One at a time
settings-pages-body = One at a time, scroll on past the end of a page or use Page Down to turn to the next.

settings-handwriting = Search handwriting
settings-handwriting-body = Heft reads what you write by hand on this computer, nothing leaves it, so search finds it like typed text. It reads in the background while you aren't writing, and waits while the battery is low. It knows Serbian, German, English and Albanian in Latin letters.
# The variable is the download's size, such as 1.5 GB.
settings-handwriting-download = Download ({ $size })
settings-handwriting-downloading = Downloading, { $percent }%
settings-handwriting-remove = Remove
settings-handwriting-reading = { $pages ->
    [one] Reading 1 page
   *[other] Reading { $pages } pages
}
settings-handwriting-done = Everything written is searchable.
settings-handwriting-waiting = Waits for a pause in your writing.
settings-handwriting-battery = Waits until the computer is charging or the battery is fuller.
settings-convert = Turn writing into text
settings-convert-body = When you pause after a line, it becomes typed text where you wrote it. Fix a word by writing over it, add an accent by drawing it over the letter, cross words out to delete them, and tap between words to write more there.
settings-convert-after = Pause before it turns
settings-convert-seconds = { $value } s
settings-convert-pause = Turns into text once the pen has rested for { $value } s.
settings-languages = Languages you write in
settings-languages-body = Accents you draw go on the letters these languages use, though any accent can be added.
settings-languages-choose = Choose
settings-keep-corrections = Keep my corrections
settings-keep-corrections-body = Saves what you correct on this computer, never anywhere else, so it can help reading improve later.
convert-download-title = Turn writing into text
convert-download-body = Heft reads handwriting on this computer, so it needs a model for reading first. Nothing you write leaves the computer.
settings-handwriting-missing = This version of Luft can't read handwriting yet.
settings-handwriting-failed = Couldn't download it: { $error }

## Ruler

toolbar-ruler = Ruler
ruler-label = Ruler
# The ruler's angle in degrees.
ruler-angle = { $degrees }°

## Pages one at a time

page-previous = Previous page
page-next = Next page

## Pictures

picture-choose = Choose pictures
picture-photo = Take a photo
picture-crop = Crop
crop-title = Crop
crop-reset = Show all of it
crop-done = Crop
camera-title = Take a photo
camera-opening = Opening the camera…
camera-refused = Heft may not use the camera. You can allow it in Settings, under Privacy.
camera-failed = The camera didn't open: { $error }
camera-take = Take photo
