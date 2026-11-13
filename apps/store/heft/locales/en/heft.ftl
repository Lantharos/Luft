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
toolbar-move = Move the tools

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
subject-new-body = Each subject starts with one notebook.
subject-edit-title = Subject
subject-name = Name
# An example subject name, shown in the empty name field.
subject-name-example = Mathematics
subject-color = Color
subject-create = Add subject
archive-title = Archive
archive-body = Subjects you're done with, kept out of the way.
archive-restore = Bring back
trash-title = Trash
trash-body = Everything here is deleted after 30 days.
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
notebook-typed-body = Typing carries on to a new page when one is full.
# The variable is the subject the notebook goes into.
notebook-new-title = New notebook in { $subject }
notebook-create = Create
# Where the notebook is scrolled to.
page-of = Page { $page } of { $pages }
deleted-pages-title = Deleted pages
deleted-pages-body = Restored pages go back to where they were.
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
format-label = Text formatting
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
settings-pressure-body = Up writes boldly with a light touch, down needs a firmer press.
settings-smoothing = Smoothing
settings-smoothing-value = { $percent }%
settings-smoothing-body = Evens out shaky lines. More smoothing trails the pen a little.
settings-buttons = Pen buttons
settings-buttons-body = Set for every app in Luft's pen settings. A button set to erase uses the eraser you chose here.
settings-buttons-open = Pen settings
settings-prediction = Draw slightly ahead of the pen
settings-prediction-body = Ink keeps up with fast writing.
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
beside-body = Both stay open side by side, and come back together next time.

# Shown when PDFs or pictures are opened with Heft or sent to it; the variables are how many there are, the first one's name, and $kind: "books" for PDFs, "pictures" for pictures, "files" for both.
import-title = { $count ->
    [one] Add { $name } to which subject?
   *[other] { $kind ->
        [books] Add { $count } textbooks to which subject?
        [pictures] Add { $count } pictures to which subject?
       *[files] Add { $count } files to which subject?
    }
}
import-body = { $kind ->
    [books] Each becomes a book you can write and highlight in. The PDF itself stays as it is.
    [pictures] They go into a new notebook, each on a page of its own.
   *[files] PDFs become books you can write and highlight in, and pictures go into a new notebook.
}

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
settings-toolbar-dock = Floating
settings-toolbar-tablet = In tablet mode or a tall window, the tools float over the page, away from your writing hand.
settings-toolbar-tablet-now = In tablet mode, the tools float over the page. Drag the handle on top to move them.
settings-pages = Pages
settings-pages-continuous = One after another
settings-pages-single = One at a time
settings-pages-body = Scroll past the end of a page or press Page Down to turn it.

settings-handwriting = Search handwriting
settings-handwriting-body = Search finds handwriting like typed text, and nothing leaves this computer. Works for Albanian, German, English and Serbian in Latin letters.
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
settings-convert-body = Lines become typed text when you pause. Write over a word to fix it, draw accents over letters, cross words out to delete them, and tap between words to add more.
settings-convert-after = Pause before it turns
settings-convert-seconds = { $value } s
settings-languages = Languages you use in class
settings-languages-body = For accents you draw and for telling speakers' languages apart in recordings. A subject can have its own.
settings-languages-choose = Choose
settings-keep-corrections = Keep my corrections
settings-keep-corrections-body = Kept on this computer to help reading improve later.
convert-download-title = Turn writing into text
convert-download-body = This needs a download first. Nothing you write leaves this computer.
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
camera-opening = Opening the camera
camera-refused = Heft isn't allowed to use the camera. Allow it in Settings, under Privacy.
camera-failed = The camera didn't open: { $error }
camera-take = Take photo

## Recording classes

record-start = Record the class
record-pause = Pause recording
record-resume = Go on recording
record-stop = Stop recording
# The variable is how long it's been recording, such as 12:04.
record-recording = Recording, { $time }
record-elsewhere = Recording in { $notebook }
record-failed = Recording stopped
recordings-open = Play a recording
recordings-title = Recordings

consent-title = Ask before you record
consent-ask = Recording people without asking is illegal in many places, and a crime in some. Ask your teacher, and the class if they can be heard, before you record.
consent-law = A red dot shows while Heft records. Recording goes on if you close Heft, until you stop it.
consent-local = The recording, its transcript and notes stay on this computer. Nothing is uploaded.
consent-record = They agreed, record

# The variable is how long the recording is, such as 45:12.
stopped-title = Recorded { $length }
stopped-body = Heft can write out what was said and make notes of it on this computer. It takes a while, and only runs while you aren't writing.
# The variable is the size of both downloads together, such as 3.1 GB.
stopped-download = This needs a { $size } download first.
stopped-on-battery = The computer is on battery, so it can wait for the charger.
stopped-charging = The computer is charging, so it can start right away.
stopped-keep = Close
stopped-charger = When charging
stopped-now = Now

player-label = Recording
player-play = Play
player-pause = Pause
player-back = Back 10 seconds
player-forward = Forward 10 seconds
player-seek = Where in the recording
player-rate = Playback speed
player-close = Close the recording
player-panel-hide = Hide notes and transcript
# The variable says how far the notes are, such as "Transcribing, 40%".
player-panel-show = Notes and transcript, { $stage }

panel-label = What was said
panel-notes = Notes
panel-said = Transcript
# The variable is the size of the downloads, such as 3.1 GB.
panel-download = Download ({ $size })
panel-process-now = Start now
panel-to-page = Put the notes on a page

stage-queued = Waiting its turn
stage-done = Notes ready
# The variable is how far it is, from 0 to 99.
stage-transcribing = Writing out what was said, { $percent }%
stage-writing-notes = Making notes, { $percent }%
stage-waiting-charger = Waits for the charger
stage-waiting-writing = Waits for a pause in your writing
stage-waiting-battery = Waits until the battery is fuller or charging
stage-waiting-models = Needs its downloads
stage-waiting-recording = Keeps up while you record
stage-unsupported = This computer's processor can't write out speech
stage-missing = This version of Luft can't write out speech yet
stage-failed = Something went wrong: { $error }

transcript-empty = Nothing written out yet.
notes-empty = No notes yet.
notes-nothing = Nothing in this class needed notes.
notes-points = Key points
notes-definitions = Definitions
notes-homework = Homework and tests
notes-questions = Questions
# The variable is a time in the recording, such as 12:04.
notes-play-from = Play from { $time }
notes-field-text = Point
notes-field-term = Term
notes-field-meaning = Meaning
notes-field-task = Task
notes-field-due = Due
notes-field-question = Question
notes-field-answer = Answer

# The variables name where something was said, the time is in the recording, such as 12:04.
palette-hit-said = { $subject } · { $notebook } · said at { $time }

settings-recording = Recording classes
settings-recording-body = Recordings, transcripts and notes stay on this computer.
settings-process = Heavy work in the background
settings-process-now = Right away
settings-process-charger = When charging
settings-process-body = For transcripts, notes and handwriting search. They only run while you aren't writing, and wait while the battery is below 30%.
settings-recording-whisper = writes out speech
settings-recording-writer = makes notes
# The variables: what the model does, its size and licence.
settings-recording-model = { $use }, { $size }, { $licence }

subject-languages = Languages spoken in this subject's classes
subject-languages-body = For recordings. Fewer are told apart more reliably, and Albanian works best on its own.
settings-handwriting-charger = Waits for the charger.
