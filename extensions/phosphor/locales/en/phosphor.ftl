# The name of the extension in Settings and the store
extension-name = Phosphor
extension-description = Rice the whole desktop with one look or your own: borders, glow, shadows, CRT and open and close effects on windows, CRT, VHS, palettes, grades and bloom over the screen, and lines across the taskbar and Luft's apps
off = Off
normal = Normal
accent = Accent
phosphor-green = Phosphor green
amber = Amber
neon-pink = Neon pink
ice = Ice
strength = Strength
# Section of the page about the shortcut that turns everything off
safety = If the screen becomes hard to read
safety-detail = Works even when nothing on the screen can be read, and turns off everything every extension draws until you turn it back on. Phosphor also turns off by itself if an effect fails or the desktop gets very slow.
safety-shortcut = Turn every effect off
safety-no-shortcut = Not set
safety-off = Effects are turned off
safety-turn-on = Turn back on
section-windows = Windows
border = Border
    .description = It doesn't touch what's in the window.
# Border style: one colour
border-color-style = One colour
border-gradient = Gradient
border-glow = Glow
border-first-color = Colour
border-second-color = Second colour
border-width = Width
border-motion = Movement
still = Still
flow = Flowing
pulse = Pulsing
border-focused = Only on the focused window
overlay = Overlay
    .description = It doesn't read what's in the window.
scanlines = Scanlines
tint = Tint
grain = Film grain
vignette = Vignette
crt-border = CRT border
window-crt = CRT in windows
    .description = For the apps you pick below. It costs some memory for each window.
window-aberration = Chromatic aberration in windows
    .description = Red and blue drift apart towards the edges, in the apps you pick below. It costs some memory for each window.
open-effect = When a window opens
close-effect = When a window closes
glitch = Glitch
fold = Fold
dissolve = Dissolve
burn = Burn
# A CRT screen powering on or off
crt-power = CRT power
windows-fullscreen = Keep on fullscreen windows
    .description = Slows down fullscreen games and videos.
section-rules = Apps
section-rules-detail = Pick what goes on every app, then make exceptions.
everywhere-border = Border on every app
everywhere-overlay = Overlay on every app
everywhere-crt = CRT on every app
everywhere-aberration = Chromatic aberration on every app
everywhere-motion = Open and close effects on every app
rules-empty = No exceptions yet
# Buttons on an app's exception; $part is the name of an effect, such as Border
rule-on = { $part }: on
rule-off = { $part }: off
rule-motion = Open and close effects
rule-remove = Remove
rule-add = Add an exception
rule-add-pick = Choose an app
section-desktop = Screen filters
section-desktop-detail = They stay off on the lock screen.
desktop-crt = CRT
crt-scanlines = Scanlines
crt-curvature = Curvature
    .description = Bends the picture like a tube. Moving the pointer redraws the screen.
crt-mask = Phosphor mask
crt-flicker = Flicker
    .description = Redraws the screen 30 times a second, resting after 30 seconds without input.
invert = Invert
invert-colors = Colours
invert-lightness = Lightness, keeping hues
grade = Colour grade
grade-warm = Warm
grade-cold = Cold
grade-teal-orange = Teal and orange
grade-noir = Noir
grade-sepia = Sepia
grade-vivid = Vivid
shadow-boost = Shadow boost
    .description = Lifts dark areas so you can see into them.
bloom = Bloom
    .description = Bright parts of the screen glow into what's around them.
chromatic-aberration = Chromatic aberration
    .description = Red and blue drift apart towards the edges, like a cheap lens.
filters-scope = Show on
    .description = The desktop is the wallpaper and the taskbar, without windows.
filters-scope-screen = The whole screen
filters-scope-desktop = The desktop only
filters-fullscreen = Keep on fullscreen windows
    .description = Slows down fullscreen games.
filters-captured = Show in screenshots and recordings
    .description = Borders and other window effects always show.
desktop-filters = Screen filter
section-surfaces = Luft's own surfaces
section-surfaces-detail = Lines across the taskbar, panels and Luft's apps. Other apps aren't touched.
surface-lines = Taskbar and panels
lines = Accent line
shimmer = Shimmering line
surface-places = Where
taskbar = Taskbar
quick-settings = Quick Settings
start = Start
notifications = Notifications
surface-color = Colour
app-lines = Luft's apps
# The picker of whole looks at the top of the page, each setting many effects at once
section-look = Look
look = Look
# A look with every effect off
look-plain = Plain
# The look people made themselves by changing any effect
look-custom = Custom
look-terminal = Terminal green
look-amber = Amber CRT
look-vaporwave = Vaporwave
look-noir = Noir film
look-vhs = VHS tape
look-neon = Clean neon
# Green dithered pixels, like an old handheld console
look-pocket = Pocket
looks-yours = Your looks
looks-empty = No saved looks yet
# Button that puts a saved look on
look-wear = Use
# Button that saves a look as a file to send to others
look-share = Share
look-share-current = Share this look as a file
look-save = Save this look
look-save-name = Name
look-import = Open a shared look
look-import-pick = Choose
look-import-failed = That file isn't a Phosphor look.
# File name for a shared look that has no name of its own
look-file-name = My look
border-double = Double line
# A dashed border, which marches around the window when it's set to flow
border-dashed = Dashed
# A glowing tube of light, bright in the middle
border-neon = Neon tube
border-rainbow = Rainbow
border-app-color = Each app's own colour
    .description = Taken from its icon. Apps without one use the colour above.
glow-size = Glow size
speed = Speed
overlay-tint-color = Colour
line-spacing = Line spacing
grain-size = Grain size
vignette-size = Size
unfocused = Windows in the background
    .description = Taking their colour costs some memory for each window.
unfocused-dim = Dim
# Turns the colours of background windows to grey
unfocused-desaturate = Take colour away
shadow = Shadow
# A solid shadow offset to the bottom right, like a print or a sticker
shadow-hard = Hard offset
shadow-soft = Soft glow
shadow-color = Colour
black = Black
shadow-size = Size
section-motion = Opening and closing
# How long opening or closing takes
effect-length = Length
pixelate = Pixelate
# A beam of light that widens into the window
beam = Beam
shatter = Shatter
# TV static
static = Static
crt-details = Tube
crt-line-count = Number of lines
crt-line-thickness = Line thickness
crt-mask-type = Mask
# Kinds of CRT phosphor masks
mask-aperture = Aperture grille
mask-shadow = Shadow mask
mask-slot = Slot mask
# A colour grade people make from sliders
grade-custom = Your own
# Two colours in place of all others, one for dark parts and one for light parts
grade-duotone = Duotone
grade-adjust = Adjust the grade
# From cooler and bluer to warmer and more orange
grade-temperature = Temperature
# From greener to more magenta
grade-tint = Tint
grade-saturation = Saturation
grade-contrast = Contrast
grade-brightness = Brightness
duotone-dark = Dark colour
duotone-light = Light colour
midnight = Midnight
# A limited set of colours, as on old computers and consoles
palette = Palette
palette-pocket = Pocket green
palette-one-bit = Black and white
palette-amber = Amber terminal
palette-sixteen = 16 colours
# Mixing two colours of the palette in a fine pattern to fake the ones between
palette-dither = Dithering
pixel-size = Pixel size
# Effects that make the screen look printed or drawn
stylize = Style
posterize = Posterize
halftone = Halftone
# How many shades of each colour posterizing leaves
posterize-levels = Shades
halftone-size = Dot size
bloom-threshold = Threshold
    .description = How bright something has to be to glow.
grain-moving = Moving grain
    .description = Redraws the screen 24 times a second, resting after 30 seconds without input.
vhs = VHS
    .description = Tracking lines, colour bleeding into its neighbours and noise. Redraws the screen 30 times a second, resting after 30 seconds without input.
glitch-bursts = Glitches now and then
    .description = The screen redraws while each one lasts.
glitch-gap = Time between glitches
section-color = Colour
section-filters-place = Where filters show
