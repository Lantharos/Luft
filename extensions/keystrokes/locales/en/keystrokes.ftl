# The name of the extension in Settings and the store
extension-name = Keystrokes
extension-description = Soft sounds as you type and click, like a mechanical keyboard, a typewriter or a quiet membrane, without seeing what you type
keys = Typing sounds
key-volume = Typing volume
clicks = Mouse clicks
click-volume = Click volume
# A section of the Settings page: the sets of sounds to pick from
sounds = Sounds
mechanical-name = Mechanical
mechanical-description = Crisp switches on a metal plate
membrane-name = Soft membrane
membrane-description = A quiet office keyboard, round and muted
typewriter-name = Typewriter
typewriter-description = Metal on paper, with a bell and a carriage return on Enter
thock-name = Thock
thock-description = A deep, padded keyboard
in-use = In use
use = Use
listen = Listen
privacy = What Keystrokes can see
privacy-detail = Nothing you type. Luft plays the sounds itself and only tells a letter apart from Space, Enter and Backspace, and the extension never hears a press at all: not which key, not how many, not when. Everything stays silent on the lock screen and in password fields
# An honest limit of the extension, shown under what it can see
privacy-limit = Terminals and some older apps don't mark their password fields, so you'll hear keys there, such as when a command asks for your password. Keystrokes still doesn't learn what you typed
make-your-own = Make your own
make-your-own-detail = A folder of sound files and a pack.json that says what each is for
add-pack = Add sounds
add-pack-detail = Pick the folder with its pack.json
add-pack-button = Pick a folder
remove-pack = Remove
template = Get the template
template-detail = A pack.json and plain sounds to replace. Copy it somewhere of your own first
template-button = Open
guide = How to make one
guide-button = Read the guide
# Why a folder can't be added. { $kind } is a word from pack.json, such as space, and stays in English
pack-no-manifest = There's no pack.json in that folder
pack-bad-manifest = pack.json isn't valid JSON. Look for a missing comma or quote
pack-no-name = pack.json needs a name
pack-no-key-sound = pack.json needs at least one key sound
pack-unknown-kind = pack.json has { $kind } under sounds, but the only kinds are key, space, enter, backspace and click
pack-bad-sounds = The { $kind } entry in pack.json has to be a file in the same folder, or a list of them
pack-too-many-sounds = The { $kind } entry in pack.json lists more than { $most } sounds
pack-unplayable = { $file } isn't in that folder, can't be played, or is longer than a second
