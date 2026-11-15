## File dialogs

mailman-dialog-attach = Attach Files
mailman-dialog-save-attachment = Save Attachment

## Notifications

# Title of a notification about several new messages
mailman-notify-new = { $count ->
    [one] { $count } new message
   *[other] { $count } new messages
}
# Button on a notification
mailman-notify-open = Open
# Title of a reminder about a sent message nobody answered
mailman-notify-no-reply = No reply yet

## The page the browser shows after signing in

mailman-signed-in-page = You're signed in. You can close this tab and go back to Mailman.

## Signing in

mailman-error-no-provider = This account has no sign-in provider
mailman-error-no-password = The keyring has no password for this account
mailman-error-provider-not-set-up = Signing in with this provider isn't set up
mailman-error-no-code = The sign-in page didn't return a code
mailman-error-sign-in-timeout = Signing in took too long
mailman-error-no-refresh = The provider didn't allow staying signed in
mailman-error-unencrypted = This server isn't encrypted, so the account wasn't added
mailman-error-redirect-unencrypted = The server sent the sign-in somewhere unencrypted
# $error says what went wrong
mailman-error-sign-in-failed = Signing in failed: { $error }
# $status is the server's answer, such as 401 Unauthorized
mailman-error-sign-in-status = Signing in failed ({ $status })
mailman-error-sign-in-cancelled = Signing in was cancelled ({ $error })
# $email is the account's address
mailman-error-sign-in-as = Sign in as { $email } to use this account

## Accounts, folders and messages

mailman-error-account-gone = This account is gone
mailman-error-that-account-gone = That account is gone
mailman-error-not-imap = This account doesn't use IMAP
mailman-error-no-mail = This server doesn't offer mail
mailman-error-no-drafts = This account has no Drafts folder
mailman-error-no-sent = This account has no Sent folder
mailman-error-folder-gone = This folder is gone
mailman-error-folder-missing = That folder no longer exists
mailman-error-message-gone = That message is gone
mailman-error-this-message-gone = This message is gone
mailman-error-message-unreadable = This message can't be read
mailman-error-message-not-arrived = This message hasn't arrived yet
mailman-error-attachment-gone = That attachment is gone
mailman-error-not-email = This file isn't an email
mailman-error-draft-gone = That draft is gone
mailman-error-draft-not-arrived = This draft hasn't arrived yet
mailman-error-draft-unreadable = That draft can't be read
# A conversation list Mailman doesn't know was asked for
mailman-error-unknown-view = Unknown view
# $role is the kind of folder
mailman-error-no-folder = { $role ->
    [inbox] This account has no inbox folder
    [sent] This account has no sent folder
    [drafts] This account has no drafts folder
    [archive] This account has no archive folder
    [all] This account has no all folder
    [trash] This account has no trash folder
   *[junk] This account has no junk folder
}

## Sending

mailman-error-no-recipients = Add someone to send this to
mailman-error-no-address = This account has no address to send from
mailman-error-pick-address = Pick the address to send from
mailman-error-address-not-allowed = That address can't send from this account
mailman-error-own-addresses-only = This account only sends from its own addresses
mailman-error-no-unsubscribe = This sender doesn't offer a way to unsubscribe
mailman-error-unsubscribe-failed = Unsubscribing failed: { $error }

## Talking to the mail server

mailman-error-refused = The server refused
mailman-error-refused-it = The server refused it
mailman-error-change-refused = The server refused the change
mailman-error-address-refused = The server refused this address
mailman-error-address-not-kept = The server didn't keep this address
mailman-error-message-not-kept = The server didn't keep the message
mailman-error-message-not-returned = The server didn't return this message
mailman-error-no-answer = The server didn't answer
mailman-error-no-changes = The server didn't say what changed
mailman-error-folder-not-listed = The server wouldn't list this folder
mailman-error-push-no-host = The push address has no host
mailman-error-push-no-port = The push address has no port
mailman-error-stream-closed = The server closed the event stream
mailman-error-stream-silent = The event stream went silent
# $status is the server's answer, such as 500 Internal Server Error
mailman-error-refused-status = The server refused ({ $status })
# $code is the server's answer, such as 403
mailman-error-push-refused = The server refused push ({ $code })
# $scheme is the start of a web address, such as http
mailman-error-push-scheme = Push over { $scheme } isn't supported

## Changes the server didn't take; $error says why

mailman-error-copy-not-saved = Sent, but couldn't save a copy to Sent: { $error }
mailman-error-move-failed = { $count ->
    [1] Couldn't move a message: { $error }
   *[other] Couldn't move { $count } messages: { $error }
}
mailman-error-delete-failed = { $count ->
    [1] Couldn't delete a message: { $error }
   *[other] Couldn't delete { $count } messages: { $error }
}
