## Window title and the line under it

mailman-header-search = Search
# Shown when the open folder isn't known yet
mailman-header-mail = Mail
mailman-header-selected = { $count ->
    [one] { $count } selected
   *[other] { $count } selected
}
mailman-header-results = { $count ->
    [one] { $count } result
   *[other] { $count } results
}
# Shown when there are more search results than Mailman counts
mailman-header-results-capped = { $count }+ results
mailman-header-unread = { $count ->
    [one] { $count } unread
   *[other] { $count } unread
}
mailman-header-conversations = { $count ->
    [one] { $count } conversation
   *[other] { $count } conversations
}
# Title above an email file opened on its own
mailman-header-message = Message
mailman-header-back-to-mail = Back to mail
mailman-header-back = Back
# Esc is the key
mailman-header-back-tooltip = Back (Esc)
mailman-check-mail = Check for new mail
# F5 is the key
mailman-check-mail-tooltip = Check for new mail (F5)

## Folders

mailman-view-inbox = Inbox
# The folder where mail from new senders waits until it's let in
mailman-view-screener = Screener
# Conversations set aside to come back later
mailman-view-later = Later
mailman-view-starred = Starred
mailman-view-drafts = Drafts
mailman-view-sent = Sent
mailman-view-archive = Archive
mailman-view-junk = Junk
mailman-view-trash = Trash
mailman-view-newsletters = Newsletters
mailman-view-receipts = Receipts
mailman-view-updates = Updates

## Sidebar

mailman-sidebar-write = Write
# C is the key
mailman-sidebar-write-tooltip = Write (C)
mailman-sidebar-settings = Settings
mailman-sidebar-search = Search mail
mailman-sidebar-bundles = Bundles
mailman-sidebar-folders = Folders
# More than 999 unread messages
mailman-sidebar-count-capped = 999+
# A folder in the narrow sidebar; $count is how many unread messages it has
mailman-sidebar-folder-count = { $folder }, { $count }
mailman-sidebar-folder-count-tooltip = { $folder } · { $count }
# $email is the account's address
mailman-status-cant-sync = { $email } can't sync
mailman-status-cant-sync-account = An account can't sync
# $failure is one of the two messages above, $reason why it failed
mailman-status-failure = { $failure }: { $reason }
mailman-status-sign-in-again = { $failure }, sign in again
mailman-status-try-again-label = { $failure }, try again
mailman-status-checking = Checking for mail
mailman-status-signed-out = Signed out
mailman-status-failed = Can't sync
mailman-status-sign-in = Sign in
mailman-status-try-again = Try again

## Welcome

mailman-welcome-title = Your mail, without the noise
mailman-welcome-body = Add an account to bring in your mail. New senders wait in the Screener, newsletters and receipts get bundled, and everything is a keystroke away.
mailman-welcome-add = Add an account

## Conversation list

mailman-list-label = Conversations
mailman-list-draft = Draft
mailman-list-no-subject = (no subject)
mailman-list-archive = Archive
# E is the key
mailman-list-archive-tooltip = Archive (E)
mailman-list-later = Later
# B is the key
mailman-list-later-tooltip = Later (B)
mailman-list-delete = Delete
# # is the key
mailman-list-delete-tooltip = Delete (#)
# Above the inbox, mail from senders who wrote for the first time
mailman-summary-new-senders = New senders
mailman-summary-waiting = { $count ->
    [one] { $count } waiting
   *[other] { $count } waiting
}
mailman-summary-new = { $count ->
    [one] { $count } new
   *[other] { $count } new
}

## When a folder is empty

mailman-empty-inbox-title = Inbox zero
mailman-empty-inbox = Everything is taken care of.
mailman-empty-screener-title = Nobody new
mailman-empty-screener = New senders wait here until you let them in.
mailman-empty-later-title = Nothing set aside
mailman-empty-later = Press B on a conversation to bring it back when it suits you.
mailman-empty-starred-title = No stars
mailman-empty-starred = Press S to star what matters.
mailman-empty-drafts-title = No drafts
mailman-empty-drafts = Unfinished messages are kept here.
mailman-empty-sent-title = Nothing sent yet
mailman-empty-sent = Messages you send show up here.
mailman-empty-archive-title = The archive is empty
mailman-empty-archive = Press E to archive a conversation.
mailman-empty-junk-title = No junk
mailman-empty-junk = Messages marked as junk end up here.
mailman-empty-trash-title = Trash is empty
mailman-empty-trash = Deleted messages stay here for a while.
mailman-empty-search-title = No matches
# $query is what was searched for
mailman-empty-search = Nothing found for “{ $query }”.
mailman-empty-folder-title = Nothing here
mailman-empty-folder = This folder is empty.

## Menu of a conversation

mailman-menu-move-to-inbox = Move to Inbox
mailman-menu-archive = Archive
mailman-menu-mark-read = Mark as read
mailman-menu-mark-unread = Mark as unread
mailman-menu-remove-star = Remove star
mailman-menu-star = Star
mailman-menu-back-now = Back to Inbox now
# $folder is the folder's name
mailman-menu-move-to = Move to { $folder }
mailman-menu-junk = Report junk
# $sender is a name or an email address
mailman-menu-screen-out = Screen out { $sender }
mailman-menu-delete = Delete
mailman-menu-delete-forever = Delete forever
mailman-menu-more = More
mailman-menu-expand-all = Expand all

## Later

mailman-later = Later
mailman-later-today = Later today
mailman-later-tomorrow = Tomorrow morning
mailman-later-weekend = This weekend
mailman-later-next-week = Next week
mailman-later-month = In a month
mailman-send-later-hour = In an hour
mailman-send-later-tomorrow = Tomorrow morning
mailman-send-later-monday = Monday morning
mailman-reminder-day = In a day
mailman-reminder-three-days = In 3 days
mailman-reminder-week = In a week
# Shown next to the Send button once a reminder is set
mailman-reminder-chip-day = Reminder in a day
mailman-reminder-chip-three-days = Reminder in 3 days
mailman-reminder-chip-week = Reminder in a week

## What happened, with a way to undo it

mailman-undo = Undo
mailman-done-archived = { $count ->
    [1] Archived
   *[other] Archived { $count } conversations
}
mailman-done-trashed = { $count ->
    [1] Moved to Trash
   *[other] Moved { $count } conversations to Trash
}
mailman-done-junk = { $count ->
    [1] Marked as junk
   *[other] Marked { $count } conversations as junk
}
mailman-done-inbox = { $count ->
    [1] Moved to Inbox
   *[other] Moved { $count } conversations to Inbox
}
mailman-done-deleted = { $count ->
    [1] Deleted forever
   *[other] Deleted { $count } conversations forever
}
# $folder is the folder's name
mailman-done-moved = Moved to { $folder }
# Used when the folder has no name
mailman-done-moved-folder = Moved to folder
# $when is how long until it comes back, such as "in 3 hours"
mailman-done-snoozed = Back { $when }
# $address is an email address
mailman-done-approved = { $address } can reach your inbox
mailman-done-screened-out = { $address } is screened out
mailman-unsubscribe-in-browser = Finish unsubscribing in your browser
# $sender is a name or an email address
mailman-unsubscribed = Unsubscribed from { $sender }

## Reading

mailman-reader-saved = Saved
mailman-reader-open = Open
mailman-reader-save = Save
# The recipients of a message, such as "to me, Anna"
mailman-reader-to = to { $recipients }
# Stands for your own address among the recipients
mailman-reader-me = me
mailman-reader-undisclosed = to undisclosed recipients
mailman-reader-continue = Continue writing
mailman-reader-reply = Reply
# R is the key
mailman-reader-reply-tooltip = Reply (R)
mailman-reader-reply-all = Reply all
mailman-reader-forward = Forward
mailman-reader-pictures-hidden = Pictures are hidden
mailman-reader-pictures-hidden-trackers = { $count ->
    [1] Pictures are hidden, a tracker blocked
   *[other] Pictures are hidden, { $count } trackers blocked
}
mailman-reader-trackers-blocked = { $count ->
    [1] A tracker was blocked
   *[other] { $count } trackers were blocked
}
mailman-reader-show = Show
# $sender is a name or an email address
mailman-reader-always = Always from { $sender }
mailman-reader-show-pictures = Show pictures
mailman-reader-show-quoted = Show quoted text
mailman-reader-hide-quoted = Hide quoted text
# Accessible name of the message's content
mailman-reader-body = Message
mailman-reader-messages = { $count ->
    [one] { $count } message
   *[other] { $count } messages
}
# $category is what kind of mail the conversation is
mailman-reader-messages-category = { $count ->
    [one] { $count } message
   *[other] { $count } messages
} · { $category ->
    [newsletter] Newsletter
    [receipt] Receipt
   *[notification] Update
}
mailman-reader-unsubscribe = Unsubscribe
# The sender's name is in bold
mailman-reader-first-time = <b>{ $sender }</b> is writing to you for the first time.
mailman-reader-screen-out = Screen out
mailman-reader-let-in = Let in
mailman-reader-earlier = { $count ->
    [one] { $count } earlier message
   *[other] { $count } earlier messages
}
mailman-reader-arriving = This message is still on its way
mailman-actions-move-to-inbox = Move to Inbox
mailman-actions-star = Star
mailman-actions-remove-star = Remove star
# S is the key
mailman-actions-star-tooltip = Star (S)
mailman-actions-mark-unread = Mark as unread
# Shift+U are the keys
mailman-actions-mark-unread-tooltip = Mark as unread (Shift+U)
mailman-empty-reader-unread = { $count ->
    [one] { $count } unread conversation
   *[other] { $count } unread conversations
}
mailman-empty-reader = Nothing selected
# The letters in <kbd> are keys on the keyboard
mailman-empty-reader-keys = <kbd>J</kbd> and <kbd>K</kbd> move through your mail, <kbd>E</kbd> archives, <kbd>Ctrl K</kbd> finds anything

## Commands, in the command palette and the list of keyboard shortcuts

mailman-command-compose = Write a message
mailman-command-search = Search mail
mailman-command-archive = Archive
mailman-command-delete = Delete
mailman-command-later = Later…
mailman-command-star = Star or unstar
mailman-command-unread = Mark as unread
mailman-command-read = Mark as read
mailman-command-reply = Reply
mailman-command-reply-all = Reply all
mailman-command-forward = Forward
mailman-command-junk = Report junk
mailman-command-inbox = Move to Inbox
mailman-command-choose = Select or unselect the conversation
mailman-command-choose-all = Select every conversation shown
mailman-command-next = Next conversation
mailman-command-previous = Previous conversation
mailman-command-open = Open conversation
mailman-command-close = Back to the list
mailman-command-expand = Expand all messages
# $folder is the name of a folder
mailman-command-go = Go to { $folder }
mailman-command-move = Move to { $folder }
mailman-command-sync = Check for new mail
mailman-command-settings = Settings
mailman-command-add-account = Add an account
mailman-command-screener-off = Turn off the Screener
mailman-command-screener-on = Turn on the Screener
mailman-command-bundles-off = Show bundled mail in the inbox
mailman-command-bundles-on = Bundle newsletters, receipts and updates
mailman-command-shortcuts = Keyboard shortcuts
mailman-command-quit = Quit Mailman
mailman-palette-commands = Type a command
mailman-palette-commands-search = Type a command or search
# $query is what was typed
mailman-palette-search = Search mail for “{ $query }”
mailman-shortcuts-title = Keyboard shortcuts
mailman-shortcuts-description = Press Ctrl+K anywhere to find any command.
mailman-shortcuts-done = Done

## Key names in shortcuts. Use the names printed on keyboards in your language.

mailman-key-shift = Shift
mailman-key-ctrl = Ctrl
mailman-key-enter = Enter
mailman-key-escape = Esc
