# The name of the extension in Settings and the store
extension-name = Pigeon
extension-description = Sends files and text to phones and computers nearby, and takes what they send, with LocalSend's apps
# Screen-reader name of the taskbar element and the panel
pigeon = Pigeon

receive = Let nearby devices send to this computer
    .description = Phones and computers with LocalSend on the same network can send files and text here. Luft lets them through on networks you've marked as home
copy-text = Put text from trusted devices on the clipboard
    .description = Text from anyone else waits in a window until you copy it
copy-picture = Put a single picture on the clipboard too
    .description = When someone sends one picture, it's saved and also ready to paste
taskbar = Show in the taskbar
    .description = Drop files on it to send them

# In the menu of files and folders in Rover
send-to-device = Send to device

# The panel
send-dropped = { $count ->
    [one] Send one file to
   *[other] Send { $count } files to
}
looking = Looking for devices
nobody = No devices nearby
nobody-hint = Open LocalSend on your phone or other computer, on the same Wi-Fi as this one.
look-again = Look again
port-taken = Another app is using LocalSend's port, so devices can't send here. Quit it to receive with Pigeon.
back = Back
gone = That device isn't nearby anymore
send-files = Files
send-folder = Folder
# Placeholder of the field for text to send
message = Text to send
message-placeholder = Text or a link
send-text = Send text
# A switch; $name is the name this computer shows on other devices, such as "Mara's Laptop"
receive-as = Let nearby devices send to { $name }
# Title of the file chooser; $device is where the files go
choose-for = Send to { $device }
# $count is how many files, $device the device's name
sending = { $count ->
    [one] Sending a file to { $device }
   *[other] Sending { $count } files to { $device }
}
sending-text = Sending text to { $device }
receiving = { $count ->
    [one] Receiving a file from { $device }
   *[other] Receiving { $count } files from { $device }
}
# $done and $size are amounts such as "4.2 MB"
progress = { $done } of { $size }
waiting-for = Waiting for { $device } to accept
asks-for-pin = { $device } asks for a PIN
cancel = Cancel

# A device offers files; $count is how many, $size their total, such as "12 MB"
offers = { $count ->
    [one] Wants to send you a file, { $size }
   *[other] Wants to send you { $count } files, { $size }
}
# Under the sender's name once the files are on their way
files-size = { $count ->
    [one] One file, { $size }
   *[other] { $count } files, { $size }
}
and-more = { $count ->
    [one] and one more
   *[other] and { $count } more
}
always-accept = Always accept from { $device }
decline = Decline
accept = Accept
# $folder is a folder's name, such as "Downloads"
saved-in = Saved in { $folder }
show-folder = Show in folder
# Opens a received file
open = Open
received = { $count ->
    [one] A file from { $device }
   *[other] { $count } files from { $device }
}
stopped-by = { $device } stopped the transfer
you-stopped = You stopped the transfer
some-arrived = { $count ->
    [one] Only one file arrived
   *[other] Only { $count } files arrived
}
nothing-arrived = The transfer from { $device } didn't finish

# Text someone sent
sent-text = { $device } sent you text
text-copied = Copied text from { $device }
copy = Copy
open-link = Open link

# Sending
pin-title = Enter the PIN { $device } shows
pin-wrong = That PIN wasn't right. Try again.
pin = PIN
send = Send
sent-text-to = Sent text to { $device }
sent = { $count ->
    [one] Sent a file to { $device }
   *[other] Sent { $count } files to { $device }
}
declined = { $device } declined
busy = { $device } is busy with another transfer
unreachable = Couldn't reach { $device }
send-failed = Sending to { $device } didn't finish

# Settings page
name = Name
    .description = What other devices call this computer
folder = Save received files in
choose-folder = Save received files in
folder-chosen = Received files go to the folder you chose
use-downloads = Use Downloads
require-pin = Ask for a PIN
    .description = Devices you haven't trusted have to enter it before they can send
trusted = Trusted devices
trusted-description = What they send arrives without asking first.
trusted-empty = No trusted devices yet. Choose "Always accept" when one sends you something.
forget = Forget
