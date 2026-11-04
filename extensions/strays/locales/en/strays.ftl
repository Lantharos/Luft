# The name of the extension in Settings and the store
extension-name = Strays
extension-description = A few small creatures who live on your desktop, walking along the taskbar and the tops of your windows, and mostly napping
# Quick settings tile title and the switch in Settings, keep short
strays = Strays
# Under the tile title
around = { $count ->
    [0] Nobody home
    [one] One around
   *[other] { $count } around
}
count = How many
size = How big
small = Small
medium = Medium
large = Large
# A section of the Settings page: which creatures come
who = Who comes by
# A ginger creature, a bit like a cat
tuft-description = Curious, jumps and climbs onto anything
# A small round blue bird
pip-description = Flies over to whatever looks like a good perch
# A soft green blob with a sprout on top
dollop-description = Slow, sleepy and very round
# What screen readers say a creature is doing, by its name
mood-stand = { $name }, standing
mood-sit = { $name }, sitting
mood-sleep = { $name }, sleeping
mood-hover = { $name }, hovering
mood-still = { $name }, looking around
mood-walk = { $name }, walking
mood-fall = { $name }, falling
mood-climb = { $name }, climbing
mood-leap = { $name }, jumping
mood-fly = { $name }, flying
mood-held = { $name }, being carried
make-your-own = Make your own
make-your-own-detail = A stray is a folder with a sprite sheet and a small pack.json that says which frames do what
add-pack = Add a stray
add-pack-detail = Pick the folder with its pack.json
add-pack-button = Pick a folder
remove-pack = Remove
template = Get the template
template-detail = Opens a folder with an empty sheet, a guide to what goes where and a finished example. Copy it somewhere of your own first
template-button = Open
guide = How to make one
guide-detail = Frame sizes, what each row is for, and a free editor to draw in
guide-button = Read the guide
# Why a folder can't be added. { $state } is a word from pack.json, such as walk, and stays in English
pack-no-manifest = There's no pack.json in that folder
pack-bad-manifest = pack.json isn't valid JSON. Look for a missing comma or quote
pack-no-name = pack.json needs a name
pack-bad-frame = pack.json needs a frame size between { $smallest } and { $largest } pixels
pack-bad-sheet-name = The sheet in pack.json has to be a file in the same folder
pack-missing-state = pack.json doesn't say which frames are { $state }, and every stray needs that
pack-bad-state = The { $state } entry in pack.json needs a row and a number of frames
pack-bad-jumps = jumps in pack.json has to be a number: how many of its own lengths it can jump
pack-cant-move = A stray that doesn't walk has to fly, or it can't go anywhere
pack-no-sheet = { $sheet } isn't in that folder
pack-wrong-size = { $sheet } can't be read, or its width and height aren't a whole number of { $frame } pixel frames
pack-row-outside = { $state } is on row { $row }, but the sheet only has { $rows } rows
pack-frames-outside = { $state } runs past the end of its row: the sheet is { $columns } frames wide
