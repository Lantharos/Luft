## Writing a message

mailman-compose-new = New message
mailman-compose-reply = Reply
mailman-compose-enlarge = Enlarge
mailman-compose-shrink = Shrink
mailman-compose-close = Close
mailman-compose-close-tooltip = Close and keep as draft
mailman-compose-from = From
mailman-compose-to = To
mailman-compose-cc = Cc
mailman-compose-bcc = Bcc
# Button that shows the Cc and Bcc fields
mailman-compose-copies = Cc Bcc
# Ctrl+Shift+C are the keys
mailman-compose-copies-tooltip = Ctrl+Shift+C
mailman-compose-subject = Subject
# Accessible name of the field where the message is written
mailman-compose-message = Message
# Asterisks, a dash and > are typed as they are
mailman-compose-placeholder = Write something. **bold**, *italic*, - lists and > quotes work as you type.
mailman-compose-show-quoted = Show quoted text
mailman-compose-hide-quoted = Hide quoted text
# Accessible name of the quoted message
mailman-compose-quoted-frame = Quoted text
# $name is a file's name or an email address
mailman-compose-remove = Remove { $name }
mailman-compose-suggestions = Suggestions

## Sender

mailman-compose-send-from = Send from
mailman-compose-address-placeholder = Address to send from
# Placeholder for an address of a domain that takes any name; $domain is the part from the @ on, such as @example.com
mailman-compose-wildcard-placeholder = name{ $domain }
# $domain is a domain, such as example.com
mailman-compose-any-address = Any address at { $domain }
mailman-compose-another-address = Another address…
mailman-compose-may-be-refused = Your mail server may not let you send as this address

## Formatting and links

mailman-compose-link-placeholder = Paste or type a link, then press Enter
mailman-compose-link-label = Link
mailman-compose-bold = Bold
# Ctrl+B are the keys
mailman-compose-bold-tooltip = Bold (Ctrl+B)
mailman-compose-italic = Italic
# Ctrl+I are the keys
mailman-compose-italic-tooltip = Italic (Ctrl+I)
mailman-compose-list = List
mailman-compose-link = Link
# Ctrl+K are the keys
mailman-compose-link-tooltip = Link (Ctrl+K)

## Sending

mailman-compose-send = Send
# Ctrl+Enter are the keys
mailman-compose-send-tooltip = Send (Ctrl+Enter)
mailman-compose-send-later = Send later
mailman-compose-remind = Remind me
mailman-compose-remind-hint = Bring this back if nobody replies
mailman-compose-attach = Attach files
mailman-compose-discard = Discard
mailman-compose-templates = Templates
mailman-compose-templates-empty = Save a message you write often and insert it here.
mailman-compose-save-template = Save this as a template
mailman-compose-write-first = Write something first
# $name is the template's name
mailman-compose-template-saved = Saved “{ $name }” as a template
mailman-compose-no-account = Add an account to write mail
mailman-compose-scheduled = Scheduled to send
mailman-compose-undo = Undo
mailman-compose-sent = Sent
mailman-compose-sending = Sending
mailman-compose-sending-many = { $count ->
    [one] Sending { $count } message
   *[other] Sending { $count } messages
}
mailman-compose-refused = Not sent. Saved to Drafts.
mailman-compose-retrying = Not sent yet. Trying again in a minute.
mailman-compose-open-draft = Open draft
mailman-compose-why = Why it wasn't sent
mailman-compose-saved = Saved to Drafts

## Quoted and forwarded mail, written into the message itself

# $date is when the quoted message was sent, $name who sent it
mailman-compose-quote-header = On { $date }, { $name } wrote:
mailman-compose-forwarded = ---------- Forwarded message ----------
# $sender is a name followed by an address in angle brackets
mailman-compose-forwarded-from = From: { $sender }
mailman-compose-forwarded-date = Date: { $date }
mailman-compose-forwarded-subject = Subject: { $subject }
