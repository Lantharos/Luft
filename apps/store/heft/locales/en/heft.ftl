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
notebook-deleted-pages = Deleted pages
notebook-name = Name
# An example notebook name, shown in the empty name field.
notebook-name-example = Class notes
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

## Lasso

toolbar-lasso = Lasso
selection-label = Picked ink
selection-actions = What to do with the picked ink
selection-copy = Copy
selection-cut = Cut
selection-duplicate = Duplicate
selection-delete = Delete

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
rail-delete = Delete page
section-new-title = New section
section-rename-title = Section
section-name = Section name
section-create = Add section
