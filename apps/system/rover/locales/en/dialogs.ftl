## Closing while files are still moving

rover-closing-title = Rover is still working
rover-closing-description = Files are still being copied, moved or deleted. Closing now stops that partway.
rover-closing-close = Close anyway
rover-closing-keep = Keep open

## Compress

# The variable is the name of the one file or folder being compressed.
rover-compress-title-one = Compress “{ $name }”
rover-compress-title = { $count ->
    [one] Compress { $count } item
   *[other] Compress { $count } items
}
rover-compress-name = Archive name
rover-compress-format = Format
rover-compress-zip-hint = Opens on any computer.
rover-compress-tar-hint = Smaller and faster, for Linux and other Unix systems.
# A button that makes the archive.
rover-compress-confirm = Compress

## Name conflicts while copying or moving

# $kind is "folder" when both are folders, otherwise "item".
rover-conflict-title = { $kind ->
    [folder] A folder named “{ $name }” is already here
   *[other] An item named “{ $name }” is already here
}
rover-conflict-merge-description = Merging keeps both and asks again about files with the same name.
rover-conflict-replace-description = Replacing moves the existing one to the trash.
# Heading over the item that is already in the destination.
rover-conflict-existing = Already here
# Heading over the item being moved in.
rover-conflict-moving = Being moved
# Heading over the item being copied in.
rover-conflict-copying = Being copied
# The variable is the name of the folder the item is in.
rover-conflict-in = In { $folder }
rover-conflict-size = Size
# Label for when the item was last changed.
rover-conflict-modified = Modified
rover-conflict-modified-unknown = Unknown
rover-conflict-apply-to-all = Do this for every conflict
# Stops the whole copy or move.
rover-conflict-stop = Stop
rover-conflict-skip = Skip
rover-conflict-keep-both = Keep both
rover-conflict-merge = Merge
rover-conflict-replace = Replace

## Folder icon and color

# The variable is the folder's name.
rover-look-title-one = Icon for “{ $name }”
rover-look-title = { $count ->
    [one] Icon for { $count } folder
   *[other] Icon for { $count } folders
}
rover-look-color = Color
# The folder's usual color, with no color chosen.
rover-look-color-default = Default
rover-look-icon = Icon
rover-look-reset = Reset
rover-look-save = Save

## Signing in to a server

rover-ask-title = Sign in
rover-ask-as = Sign in as
rover-ask-as-user = Registered user
rover-ask-as-guest = Guest
rover-ask-username = Username
# The Windows network domain to sign in to.
rover-ask-domain = Domain
rover-ask-password = Password
rover-ask-remember = Remember password

## Connect to server

rover-connect-title = Connect to server
rover-connect-address = Server address
rover-connect-address-example = sftp://example.com or smb://server/share
# The variable is the name of a protocol, such as "SFTP".
rover-connect-protocol = Connects with { $protocol }
rover-connect-protocols = SFTP, Windows shares (SMB), FTP, WebDAV or NFS
rover-connect-keep = Keep in sidebar
# Servers connected to before.
rover-connect-recent = Recent
rover-connect-nearby = On this network
rover-connect-looking = Looking for servers
# The variable is a server's address.
rover-connect-forget = Forget { $address }
rover-connect = Connect

## Deleting for good

rover-delete-forever-title = { $count ->
    [1] Delete this item for good?
   *[other] Delete { $count } items for good?
}
rover-delete-forever-description = This can't be undone.
rover-delete-forever-confirm = Delete
rover-empty-trash-title = Empty the trash?
rover-empty-trash-description = Everything in it is deleted for good.

## Properties

rover-properties-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
rover-properties-kind = Kind
rover-properties-kind-drive = Drive
rover-properties-kind-folders = { $folders ->
    [one] { $folders } folder
   *[other] { $folders } folders
}
rover-properties-kind-files = { $files ->
    [one] { $files } file
   *[other] { $files } files
}
rover-properties-kind-mixed = { $folders ->
    [one] { $folders } folder
   *[other] { $folders } folders
} and { $files ->
    [one] { $files } file
   *[other] { $files } files
}
rover-properties-size = Size
# $used and $total are sizes, such as "12 GB".
rover-properties-drive-size = { $used } used of { $total }
# $size is a rounded size, such as "1.2 MB"; $bytes is the exact number of bytes.
rover-properties-file-size = { $size } ({ $bytes ->
    [one] { $bytes } byte
   *[other] { $bytes } bytes
})
rover-properties-measuring = Measuring
# $size is the total size, such as "1.2 GB".
rover-properties-contents = { $size } · { $files ->
    [one] { $files } file
   *[other] { $files } files
}
rover-properties-contents-folders = { $size } · { $files ->
    [one] { $files } file
   *[other] { $files } files
}, { $folders ->
    [one] { $folders } folder
   *[other] { $folders } folders
}
# Free space on a drive.
rover-properties-free = Free
rover-properties-location = Location
rover-properties-several-folders = Several folders
# Where a link leads.
rover-properties-points-to = Points to
rover-properties-dimensions = Dimensions
rover-properties-pixels = { $width } × { $height } pixels
rover-properties-created = Created
rover-properties-modified = Modified
# When the file was last opened.
rover-properties-opened = Opened
rover-properties-owner = Owner
# $owner is a user name, $group a group name.
rover-properties-owner-value = { $owner } · group { $group }
rover-properties-permissions = Permissions
# $owner is the user name of the file's owner.
rover-properties-owner-only = Only { $owner } can change these.
rover-properties-opens-with = Opens with
rover-properties-choose-app = Choose an app
rover-properties-no-app = No installed app opens this kind of file
rover-properties-done = Done

## Permissions

rover-permissions-owner = Owner
rover-permissions-group = Group
rover-permissions-everyone = Everyone
rover-permissions-read = Read
rover-permissions-write = Write
# Permission to open a folder and see inside it.
rover-permissions-open = Open
# Permission to run a file as a program.
rover-permissions-run = Run
# The name of one checkbox in the permissions grid.
rover-permissions-can = { $who ->
    [owner] { $right ->
        [read] Owner can read
        [write] Owner can write
        [open] Owner can open
       *[run] Owner can run
    }
    [group] { $right ->
        [read] Group can read
        [write] Group can write
        [open] Group can open
       *[run] Group can run
    }
   *[everyone] { $right ->
        [read] Everyone can read
        [write] Everyone can write
        [open] Everyone can open
       *[run] Everyone can run
    }
}

## Renaming several items

rover-rename-title = { $count ->
    [one] Rename { $count } item
   *[other] Rename { $count } items
}
rover-rename-how = How to rename
rover-rename-mode-replace = Replace text
rover-rename-mode-number = Number
rover-rename-mode-case = Change case
rover-rename-find = Find
rover-rename-replacement = Replace with
rover-rename-match-case = Match case
rover-rename-base = Name
rover-rename-base-placeholder = Name before the number
rover-rename-start = Start at
# How many digits each number has, such as 01 or 001.
rover-rename-digits = Digits
# Upper and lower case of letters.
rover-rename-case = Case
# Each option is written in the case it applies.
rover-rename-case-lower = lowercase
rover-rename-case-upper = UPPERCASE
rover-rename-case-title = Title Case
rover-rename-case-sentence = Sentence case
rover-rename-confirm = Rename
rover-rename-confirm-count = { $count ->
    [one] Rename { $count } item
   *[other] Rename { $count } items
}

## Search

# The variable is the name of the folder searched.
rover-search-title = Search in { $folder }
rover-search-field = Name or text
rover-search-start = Type to search this folder and everything inside it
rover-search-searching = Searching
rover-search-so-far = { $count ->
    [one] { $count } result so far
   *[other] { $count } results so far
}
rover-search-nothing = Nothing matches
rover-search-results = { $count ->
    [one] { $count } result
   *[other] { $count } results
}
rover-search-truncated = { $count ->
    [one] Showing the first { $shown } of { $count } result, refine to narrow it down
   *[other] Showing the first { $shown } of { $count } results, refine to narrow it down
}
rover-search-results-label = Results
rover-search-kind = Kind
rover-search-kind-any = Any kind
rover-search-kind-folder = Folders
rover-search-kind-document = Documents
rover-search-kind-image = Images
rover-search-kind-video = Videos
rover-search-kind-audio = Audio
rover-search-kind-archive = Archives
rover-search-kind-code = Code
# When the file was last changed.
rover-search-modified = Modified
rover-search-modified-any = Any time
rover-search-modified-day = Past day
rover-search-modified-week = Past week
rover-search-modified-month = Past month
rover-search-modified-year = Past year
rover-search-size = Size
rover-search-size-any = Any size
rover-search-size-small = Under 1 MB
rover-search-size-medium = 1 to 100 MB
rover-search-size-large = Over 100 MB
rover-search-contents = Look inside files
rover-rename-problem-empty = Empty name
rover-rename-problem-slash = Names can’t contain /
# Two of the new names are the same.
rover-rename-problem-repeated = Used more than once
rover-rename-problem-taken = Already in this folder
# The name an archive of several items gets.
rover-compress-default-name = Archive

## Folder icons, as named in the folder icon picker

rover-look-icon-folder = Folder
rover-look-icon-star = Star
rover-look-icon-heart = Heart
rover-look-icon-bookmark = Bookmark
rover-look-icon-file-text = Documents
rover-look-icon-download = Downloads
rover-look-icon-image = Pictures
rover-look-icon-video = Videos
rover-look-icon-music = Music
rover-look-icon-monitor = Desktop
rover-look-icon-briefcase = Work
rover-look-icon-graduation-cap = School
rover-look-icon-book-open = Reading
rover-look-icon-code = Code
rover-look-icon-terminal = Terminal
rover-look-icon-flask-conical = Science
rover-look-icon-lightbulb = Ideas
rover-look-icon-palette = Art
rover-look-icon-pen-tool = Design
rover-look-icon-camera = Photos
rover-look-icon-film = Films
rover-look-icon-headphones = Podcasts
rover-look-icon-gamepad-2 = Games
rover-look-icon-trophy = Trophy
rover-look-icon-dumbbell = Fitness
rover-look-icon-plane = Travel
rover-look-icon-map = Maps
rover-look-icon-mountain = Outdoors
rover-look-icon-car = Car
rover-look-icon-house = Home
rover-look-icon-building-2 = Office
rover-look-icon-wallet = Money
rover-look-icon-receipt = Receipts
rover-look-icon-shopping-bag = Shopping
rover-look-icon-gift = Gifts
rover-look-icon-calendar = Plans
rover-look-icon-users = Family
rover-look-icon-baby = Kids
rover-look-icon-dog = Dog
rover-look-icon-cat = Cat
rover-look-icon-leaf = Garden
rover-look-icon-sun = Summer
rover-look-icon-coffee = Coffee
rover-look-icon-utensils = Recipes
rover-look-icon-rocket = Projects
rover-look-icon-cloud = Cloud
rover-look-icon-archive = Archive
rover-look-icon-lock = Private

## Folder colors

rover-look-color-red = Red
rover-look-color-orange = Orange
rover-look-color-yellow = Yellow
rover-look-color-green = Green
rover-look-color-teal = Teal
rover-look-color-blue = Blue
rover-look-color-purple = Purple
rover-look-color-pink = Pink
