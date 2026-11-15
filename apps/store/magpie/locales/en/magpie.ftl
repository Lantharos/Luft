## Window title and the line under it

# $count is how many files the folder shows
magpie-header-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
# Which song, photo or font of the folder this is; $position counts from 1
magpie-header-position = { $position } of { $count }
magpie-header-page = Page { $page } of { $pages }
magpie-header-show-sidebar = Show sidebar
magpie-header-hide-sidebar = Hide sidebar
magpie-header-back = Back to folder
magpie-header-enclosing = Enclosing folder

## Shared buttons and menus

magpie-more = More
# Menu item that opens the share dialog for the file
magpie-send = Send…
magpie-show-in-folder = Show in folder
magpie-open = Open…
magpie-open-with = Open with…
magpie-open-with-label = Open with another app
magpie-previous = Previous
magpie-next = Next
magpie-print = Print…
magpie-print-failed = This couldn't be printed
magpie-copied = Copied

## Panels next to what's open

magpie-panel-thumbnails = Thumbnails
magpie-panel-queue = Queue
magpie-panel-pages = Pages

## Welcome screen

magpie-welcome-title = Open something to look at
magpie-welcome-body = Photos, videos, music, PDFs and fonts. You can also drop a file here.
# $name is the file's name
magpie-unopenable-title = { $name } can't be opened here
magpie-unopenable-body = Magpie shows photos, videos, music, PDFs and fonts.

## Folders in the sidebar

magpie-place-pictures = Pictures
magpie-place-videos = Videos
magpie-place-music = Music
magpie-place-documents = Documents
magpie-open-folder = Open folder…
magpie-gallery-empty = There's nothing here to look at.
magpie-sidebar-songs = { $count ->
    [one] { $count } song
   *[other] { $count } songs
}
magpie-sidebar-pages = { $count ->
    [one] { $count } page
   *[other] { $count } pages
}
magpie-sidebar-fonts = { $count ->
    [one] { $count } font
   *[other] { $count } fonts
}
magpie-sidebar-photos = { $count ->
    [one] { $count } photo
   *[other] { $count } photos
}
magpie-sidebar-videos = { $count ->
    [one] { $count } video
   *[other] { $count } videos
}
magpie-sidebar-photos-videos = { $photos ->
    [one] { $photos } photo
   *[other] { $photos } photos
}, { $videos ->
    [one] { $videos } video
   *[other] { $videos } videos
}

## Photos

magpie-photo-rotate-left = Rotate left
magpie-photo-rotate-right = Rotate right
magpie-photo-details = Details
magpie-photo-slideshow = Slideshow
magpie-photo-copy = Copy
magpie-photo-copy-failed = This image couldn't be copied
magpie-photo-wallpaper = Set as wallpaper
magpie-photo-wallpaper-dark = Set as your dark style wallpaper
magpie-photo-wallpaper-light = Set as your light style wallpaper
magpie-photo-wallpaper-failed = The wallpaper couldn't be changed
magpie-photo-flip = Flip horizontally
magpie-photo-cant-show = This image can't be shown.
magpie-zoom-out = Zoom out
magpie-zoom-in = Zoom in
magpie-zoom-actual-size = Actual size
magpie-zoom-fit = Fit to window
# How far the photo is zoomed in; $percent is a number
magpie-zoom-percent = { $percent }%

## Photo details

magpie-details-dimensions = Dimensions
# $megapixels is the photo's size in millions of pixels
magpie-details-dimensions-value = { $width } × { $height } ({ $megapixels } MP)
magpie-details-size = Size
# The kind of file, such as JPEG
magpie-details-type = Type
# When the photo was taken
magpie-details-taken = Taken
magpie-details-modified = Modified
magpie-details-camera = Camera
magpie-details-lens = Lens
magpie-details-exposure = Exposure
# The aperture, such as ƒ/2.8
magpie-details-aperture = ƒ/{ $aperture }
# The shutter speed in seconds, such as 1.5 s
magpie-details-seconds = { $seconds } s
# The shutter speed as a fraction of a second, such as 1/250 s
magpie-details-fraction = 1/{ $denominator } s
magpie-details-iso = ISO { $iso }
magpie-details-focal-length = Focal length
magpie-details-millimetres = { $length } mm
magpie-details-location = Location
# $latitude and $longitude come from the four messages below
magpie-details-coordinates = { $latitude }, { $longitude }
# $degrees is a number of degrees
magpie-details-north = { $degrees }° N
magpie-details-south = { $degrees }° S
magpie-details-east = { $degrees }° E
magpie-details-west = { $degrees }° W
magpie-details-map = Show on map

## Music

magpie-music-shuffle = Shuffle
magpie-music-previous = Previous
magpie-music-next = Next
magpie-music-repeat = Repeat
magpie-music-repeat-one = Repeat one
magpie-music-stop-repeating = Stop repeating
magpie-music-play = Play
magpie-music-pause = Pause
magpie-music-visualizer = Visualizer
magpie-music-show = Show music
magpie-music-queued-one = Added to the queue
magpie-music-queued = { $count ->
    [one] Added { $count } song to the queue
   *[other] Added { $count } songs to the queue
}
magpie-visualizer-spectrum = Soft spectrum
magpie-visualizer-ring = Ring around the cover
magpie-visualizer-fields = Colour fields

## Videos

magpie-video-play = Play
magpie-video-subtitles = Subtitles
# The subtitles are turned off
magpie-video-subtitles-off = Off
# A subtitle track in a language, with the name the video gives it
magpie-video-subtitle-named = { $language } · { $label }
# A subtitle track with no name or language; $number counts from 1
magpie-video-subtitle-number = Track { $number }
magpie-video-speed = Speed
# Playback at the usual speed
magpie-video-speed-normal = Normal
# A playback speed, such as 1.5×
magpie-video-speed-rate = { $rate }×
magpie-video-picture-in-picture = Picture in picture
magpie-video-fullscreen = Fullscreen
magpie-video-leave-fullscreen = Leave fullscreen
magpie-video-cant-play = This video can't be played.
# $codecs names the formats, such as "HEVC and AAC"
magpie-video-unsupported = This video uses { $codecs }, which Magpie can't play.
magpie-video-another-app = It may still open in another app.

## PDFs

magpie-document-find = Find
magpie-document-find-label = Find in document
magpie-document-fit-width = Fit width
magpie-document-fit-page = Fit page
magpie-document-matches = { $current } of { $total }
magpie-document-no-matches = No matches
magpie-document-previous-match = Previous match
magpie-document-next-match = Next match
magpie-document-close-find = Close search
magpie-document-page = Page { $page }
magpie-document-cant-open = This document can't be opened.
magpie-document-damaged = It may be damaged or protected.

## Fonts

magpie-font-install = Install
magpie-font-installed = Installed
magpie-font-remove = Remove
magpie-font-use-system = Use as system font
magpie-font-use-monospace = Use as monospace font
# $family is the font's name
magpie-font-done-installed = { $family } is installed
magpie-font-done-system = { $family } is now the system font
magpie-font-done-monospace = { $family } is now the monospace font
magpie-font-done-removed = { $family } was moved to the trash
# $name is the font file's name
magpie-font-cant-show = { $name } can't be shown
magpie-font-view = View
magpie-font-preview = Preview
magpie-font-characters = Characters
magpie-font-details = Details
# A sentence to show the font with. Use one with every letter of your alphabet, or any short sentence.
magpie-font-pangram = The quick brown fox jumps over the lazy dog
magpie-font-sample = Sample text
magpie-font-face = Face
magpie-font-size = Size
magpie-font-pixels = { $size } px
magpie-font-named-style = Named style
# A font's named style when the sliders don't match any of them
magpie-font-custom = Custom
# $style is the font's style, such as Bold Italic
magpie-font-style-characters = { $style } · { $count ->
    [one] { $count } character
   *[other] { $count } characters
}
# $character is a single letter or symbol
magpie-font-copied = Copied { $character }
# $code is the character's Unicode number, such as U+0041
magpie-font-copy = Copy { $code }

## Font details

magpie-font-family = Family
magpie-font-style = Style
magpie-font-weight = Weight
# The font's weight can be changed with a slider
magpie-font-variable = Variable
magpie-font-version = Version
magpie-font-designer = Designer
magpie-font-made-by = Made by
magpie-font-character-count = { $characters ->
    [one] { $characters } character
   *[other] { $characters } characters
}, { $glyphs ->
    [one] { $glyphs } glyph
   *[other] { $glyphs } glyphs
}
magpie-font-format = Format
magpie-font-file = File
# $name is the file's name, $size how big it is
magpie-font-file-value = { $name }, { $size }
magpie-font-copyright = Copyright
magpie-font-license = License
magpie-font-read-license = Read the license
