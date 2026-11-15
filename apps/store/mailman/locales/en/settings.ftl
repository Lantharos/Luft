## Settings

mailman-settings-title = Settings
mailman-settings-done = Done
mailman-settings-accounts = Accounts
mailman-settings-add-account = Add an account
mailman-settings-add-account-description = Gmail, Outlook, Fastmail, iCloud or any IMAP or JMAP server
mailman-settings-inbox = Inbox
mailman-settings-screener = Screener
mailman-settings-screener-description = New senders wait until you let them in
mailman-settings-bundles = Bundles
mailman-settings-bundles-description = Newsletters, receipts and updates, summed up above the inbox
mailman-settings-writing = Writing
mailman-settings-undo = Time to undo sending
# A number of seconds, such as 10 s
mailman-settings-seconds = { $seconds } s
mailman-settings-reading = Reading
mailman-settings-dark-mail = Darken bright messages
mailman-settings-dark-mail-description = Designed newsletters follow the dark style too
mailman-settings-notifications = Notifications
mailman-settings-notifications-description = For new mail from people you know
mailman-settings-templates = Templates
# $name is the template's name
mailman-settings-delete-template = Delete { $name }

## An account in Settings

mailman-account-name = Account name
# $provider is Google or Microsoft
mailman-account-oauth = Signed in with { $provider }
mailman-account-imap = IMAP and SMTP
mailman-account-keep = Keep
mailman-account-remove = Remove
mailman-account-remove-confirm = Remove and forget its mail
# $email is the account's address
mailman-account-removed = { $email } was removed from Mailman

## Addresses an account sends from

mailman-identities = Addresses you send from
mailman-identities-default = Used by default
mailman-identities-add = Add an address
mailman-identity-name = Name
mailman-identity-address = Address
mailman-identity-reply-to = Replies go to
mailman-identity-reply-to-placeholder = The same address
mailman-identity-signature = Signature
mailman-identity-signature-placeholder = Added below messages sent from this address
mailman-identity-preview = How the signature looks
# Stands for the message above the signature in its preview
mailman-identity-your-message = Your message
mailman-identity-save = Save
mailman-identity-cancel = Cancel
mailman-identity-make-default = Send from this by default
mailman-identity-remove = Remove

## Adding an account

mailman-add-title = Add an account
mailman-add-description = Mailman finds the right servers for most providers on its own.
mailman-add-your-name = Your name
# An example name
mailman-add-name-placeholder = Ada Lovelace
mailman-add-email = Email address
mailman-add-email-placeholder = you@example.com
mailman-add-invalid-email = Enter your full email address
mailman-add-password-missing = Enter the password or app password for this account
# $provider is Google or Microsoft
mailman-add-oauth = Your browser opens so you can sign in with { $provider }. Mailman never sees your password.
mailman-add-use-password = Use an app password instead
mailman-add-password = Password
mailman-add-password-placeholder = Password or app password
mailman-add-servers = Server settings
mailman-add-protocol = Protocol
mailman-add-imap = IMAP and SMTP
mailman-add-username = User name
mailman-add-session = Session address
mailman-add-back = Back
mailman-add-cancel = Cancel
mailman-add-looking-up = Looking up
mailman-add-waiting = Waiting for sign-in
mailman-add-connecting = Connecting
mailman-add-continue = Continue
mailman-add-continue-with = Continue with { $provider }
mailman-add-add = Add account
# $email is the new account's address
mailman-add-ready = { $email } is ready
mailman-add-unencrypted-title = Connect without encryption?
# $server is the server's address
mailman-add-unencrypted-description = Your password and messages would reach { $server } as plain text, readable by anyone on the network in between. Only continue with a server and network you trust.
mailman-add-unencrypted-action = Connect unencrypted

## Server fields; $kind is incoming or outgoing

mailman-server-title = { $kind ->
    [incoming] Incoming
   *[outgoing] Outgoing
}
mailman-server-host = { $kind ->
    [incoming] Incoming server
   *[outgoing] Outgoing server
}
mailman-server-port = { $kind ->
    [incoming] Incoming port
   *[outgoing] Outgoing port
}
mailman-server-security = { $kind ->
    [incoming] Incoming security
   *[outgoing] Outgoing security
}
mailman-server-unencrypted = Not encrypted

## Signing in again

mailman-sign-in-title = Sign in again
mailman-sign-in-cancel = Cancel
mailman-sign-in = Sign in
# $email is the account's address
mailman-sign-in-done = Signed in to { $email }
