# The name of the extension in Settings and the store
extension-name = Pult
extension-description = What's waiting in your Pult inboxes, in the taskbar, with urgent items as notifications and your items in search
pult = Pult

account = Account
signed-out = Not signed in
    .description = Sign in to see what's waiting in your inboxes. Pult opens in your browser to confirm
sign-in = Sign in
# $name is the person's name and $email their address
signed-in-as = { $name }
    .description = { $email }
sign-out = Sign out
# While signing in; $code is a code such as BCDF-GHJK
code = Confirm the code { $code } in your browser
    .description = The page opened in your browser. It's waiting for you there
page-closed = Closed the page?
open-again = Open it again
cancel = Cancel
sign-in-failed = Signing in didn't finish
    .description = The code wasn't confirmed in time. Sign in again and confirm it in your browser within 15 minutes

showing = In the taskbar
count = Count
    .description = What the number next to Pult counts
count-open = Everything waiting
count-unread = What you haven't read
urgent = Notify about urgent items
    .description = They show even during Do Not Disturb and focus sessions
hide-empty = Hide when nothing waits

# Screen-reader name of the taskbar element
waiting-in-pult = Waiting in Pult
# In the pop-up; $count is how many items wait
waiting = { $count ->
    [0] Nothing waiting
    [one] One item waiting
   *[other] { $count } items waiting
}
urgent-items = Urgent
inboxes = Inboxes
# Under an inbox's name: the project and environment, then how many wait, such as "Shop · production · 4"
inbox-detail = { $place } · { $count }
open-pult = Open Pult
not-connected = Can't reach Pult right now
    .description = Check your internet connection, then sign in again
try-again = Try again
# The notification for an urgent item; $inbox is where it is, such as Support
urgent-title = Urgent in { $inbox }
open = Open
search-title = Pult
