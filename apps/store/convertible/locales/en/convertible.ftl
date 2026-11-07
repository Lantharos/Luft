home-drop = Drop files here
home-title = Drop anything here
home-body = Pictures, videos, music, documents, archives and fonts. Everything happens on this computer, and nothing is uploaded.
home-choose-files = Choose files
home-choose-folder = Choose a folder

header-files = { $count ->
    [one] { $count } file
   *[other] { $count } files
}
header-add = Add files
header-clear = Start over
header-queue = { $count ->
    [0] Show the finished list
    [one] { $count } job running, show the queue
   *[other] { $count } jobs running, show the queue
}
mode-label = What to do
mode-convert = Convert
mode-edit = Edit

family-image = Pictures
family-video = Videos
family-audio = Music and sound
family-document = Documents
family-sheet = Spreadsheets
family-archive = Archives
family-font = Fonts

pick-format = Convert to
pick-format-family = { $family } to
pick-format-for = Format for { $family }
pick-more = More formats
pick-fewer = Fewer formats

missing-heic = HEIC needs an H.265 picture encoder, which isn't on this computer. Decoding still works.
missing-avif = AVIF needs an AV1 picture encoder, which isn't on this computer.
missing-jxl = JPEG XL needs the libjxl picture encoder, which isn't on this computer.
missing-mp3 = This computer has no MP3 encoder.
missing-aac = This computer has no AAC encoder.
missing-h264 = H.264 is patented, and this computer has no encoder for it. Try WebM, which needs none.
missing-other = This computer has no encoder for this format.

list-files = Files
list-no-format = Pick a format
list-unknown = Convertible can't read this kind of file
list-override = Format for { $name }
list-remove = Remove { $name }

panel-label = Conversion options
panel-unknown = { $count ->
    [one] One file can't be converted and will be left out.
   *[other] { $count } files can't be converted and will be left out.
}
pack-title = Or pack everything into
combine-pdf = Combine into one PDF

option-quality = Quality
option-first-frame = This picture moves. Only its first frame is kept, unless you convert it to GIF, MP4 or WebM.
option-lossless = Keep every detail
option-resize = Resize
option-width = Width
option-height = Height
option-keep-metadata = Keep camera details
option-keep-metadata-note = Cropped or marked-up pictures always lose them, because they can hold a copy of the original.
option-gif-note = Animated GIF size
option-size = Size
option-keep-size = Same size
option-keep-rate = Same as the original
option-rate = { $rate } frames a second
option-frame-rate = Frame rate
option-automatic = Automatic
option-codec = Codec
option-hardware = Use the graphics card
option-hardware-note = Much faster, with larger files.
option-copy = Don't encode again when possible
option-copy-note = Keeps the quality and takes seconds when the format already fits.
option-keep-sound = Keep the sound
option-kilobits = { $value } kbit/s
option-hertz = { $value } kHz
option-keep-channels = Same as the original
option-mono = Mono
option-stereo = Stereo
option-bitrate = Bitrate
option-keep-tags = Keep tags and cover art
option-sample-rate = Sample rate
option-channels = Channels
option-page-fit = Fit the picture
option-page-a4 = A4
option-page-letter = Letter
option-page-size = Page size
option-dpi = { $value } dpi
option-pages = Pages
option-pages-all = All, or 1-3, 7
option-resolution = Resolution
option-split = One file per page
option-split-note = Saves the pages into a folder.
option-level-fast = Fastest
option-level-balanced = Balanced
option-level-small = Smallest
option-compression = Compression
option-more = More options
option-target-size = Compress to a file size
option-target-none = No limit
option-target-unit = Unit
option-kilobytes = KB
option-megabytes = MB

preset-menu = Presets
preset-delete = Delete { $name }
preset-save = Save as a preset
preset-name = Preset name

output-where = Save to
output-beside = Same folder
output-folder = Another folder
output-keep-times = Keep original dates

action-cancel = Cancel
action-save = Save
action-close = Close
action-convert = Convert
action-convert-many = Convert { $count } files

adjust-title = Adjust
adjust-brightness = Brightness
adjust-contrast = Contrast
adjust-saturation = Colour

edit-area = Editor
edit-canvas = Picture being edited
edit-text-entry = Text to add
edit-tools = Editing tools
edit-color = Colour { $color }
edit-delete-mark = Delete this mark
edit-rotate = Rotate
edit-flip-horizontal = Flip left to right
edit-flip-vertical = Flip top to bottom
edit-undo = Undo
edit-redo = Redo
edit-play = Play the part you're keeping
edit-pause = Pause
edit-loading = Preparing a preview
edit-not-editable = This kind of file has no pixels to edit. Pick a format to convert it.
edit-trim-start = Start of the part to keep, { $time }
edit-trim-end = End of the part to keep, { $time }
edit-trim-length = { $time } kept

tool-move = Select
tool-crop = Crop
tool-arrow = Arrow
tool-line = Line
tool-box = Box
tool-ellipse = Ellipse
tool-highlight = Highlight
tool-text = Text
tool-blur = Blur
tool-redact = Redact

queue-title = Queue
queue-waiting = Waiting
queue-paused = Paused
queue-working = Working
queue-left = { $time } left
queue-total-left = About { $time } left
queue-done = Done
queue-canceled = Canceled
queue-failed = It didn't work
queue-all-done = All done
queue-resume-all = Resume all
queue-pause-all = Pause all
queue-clear = Clear finished
queue-more = Convert more
queue-back = Back to the files
queue-progress = Progress of { $name }
queue-pause = Pause { $name }
queue-resume = Resume { $name }
queue-retry = Try { $name } again
queue-show = Show { $name } in its folder
queue-cancel = Cancel { $name }

conflict-title = { $count ->
    [one] A file with this name already exists
   *[other] { $count } files with these names already exist
}
conflict-body = Nothing has been changed yet.
conflict-more = and { $count } more
conflict-skip = Skip them
conflict-replace = Replace
conflict-keep = Keep both

unsupported-open = What can't Convertible do?
unsupported-title = What Convertible can't do
unsupported-intro = Rather than offer a conversion that fails or quietly loses things, Convertible leaves these out.
unsupported-office-title = Word, Excel and PowerPoint to PDF
unsupported-office-body = Laying out an office file the way it was designed takes a full office suite. Convertible brings out the text and tables of Word and OpenDocument files as Markdown, HTML or plain text, without pictures or page layout.
unsupported-pdf-word-title = PDF to Word
unsupported-pdf-word-body = A PDF records where letters sit on a page, not paragraphs or tables. You can get its text, or each page as a picture.
unsupported-locked-title = Files locked with a password
unsupported-locked-body = Password-protected PDFs and archives can't be opened yet.
unsupported-alphabets-title = PDFs in other alphabets
unsupported-alphabets-body = Text becomes a PDF with one built-in font. Letters it doesn't have, such as Japanese, stop the job with a message; HTML works for those.
unsupported-rar-title = RAR archives
unsupported-rar-body = RAR's licence doesn't allow open source tools to write it, and Convertible doesn't include the proprietary decoder.
unsupported-subtitles-title = Subtitles and chapters
unsupported-subtitles-body = Video conversions keep the picture and every sound track, not subtitle tracks or chapters.
unsupported-drm-title = Copy-protected media
unsupported-drm-body = Media protected by DRM can't be read.
unsupported-fonts-title = TrueType to OpenType
unsupported-fonts-body = Web fonts convert freely, but turning one outline format into the other would redraw every glyph, so it isn't offered.

close-title = Stop the jobs still running?
close-body = Closing Convertible stops them, and nothing they were writing is kept.
close-action = Stop and close
