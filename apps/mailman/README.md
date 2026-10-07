# Mailman

Mailman is the mail app of the Luft desktop. It keeps every account in one fast local copy, so opening, searching and sorting mail never waits on the network, and almost everything has a key. It is built with Sabine and Svelte and lives at `apps/mailman` in the Luft monorepo; run the commands below from that directory unless noted otherwise.

## Features

- IMAP and SMTP accounts, and JMAP accounts such as Fastmail. New mail arrives the moment the server has it, over IMAP IDLE or JMAP push, and only the new messages are fetched. Servers that support CONDSTORE and QRESYNC, and every JMAP server, only send what changed since last time. Servers without push are checked every two minutes, and every folder every five
- Connections that quietly die are noticed and reopened, and mail that came in meanwhile is fetched right away. Waking from sleep or joining a network reconnects at once, and `F5` or the button above the list checks every account on demand
- The newest mail of every folder arrives first and the rest of its history follows in the background, newest first, picking up where it left off if Mailman is closed halfway. Lists stay quick at hundreds of thousands of messages
- Adding an account needs just the address for most providers: Mailman looks up the servers in the address's own autoconfig file, Thunderbird's provider database, DNS service records and the provider behind the domain's mail servers. Server settings can still be entered by hand
- Gmail and Outlook can sign in through the provider's own page in the browser, and any account works with a password or an app password. Sign-ins are renewed before they expire, so new mail keeps arriving and sending keeps working
- Several addresses per account, each with its own name, reply address and signature, and a preview of how the signature looks. JMAP accounts bring their addresses and aliases from the server, Gmail brings its send-as addresses, and any address can be added by hand. Replies and forwards are sent from the address the message was written to, including plus addresses and catch-all domains
- Passwords and sign-in tokens are kept in Luft Keyring, readable only by Mailman, and never written anywhere else
- One inbox for all accounts. Conversations are grouped across folders, so replies you sent appear in the thread they belong to
- The Screener: when someone writes to you for the first time, their mail waits in the Screener until you let them in or screen them out. People you have written to, and everyone already in your mail when you added the account, go straight to the inbox
- Bundles keep newsletters, receipts and updates out of the inbox. They are summed up at its top with who sent them, and each has its own view
- Unsubscribe from a newsletter with one click, using the sender's one-click unsubscribe where it offers one
- Later sets a conversation aside until a time you pick, then puts it back at the top of the inbox, unread
- Select several conversations to archive, delete, move, star or set them aside together
- Undo for archiving, deleting, moving and setting aside, and for sending: messages wait a few seconds before they leave, long enough to take them back
- Send later, and a reminder that brings a sent message back to the inbox if nobody replies
- Conversation view that hides quoted history and signatures behind a small button, and collapses long threads
- Mail is cleaned before it is shown and displayed under a strict content policy, so no scripts run and nothing loads from the internet unless you ask. Pictures from senders stay hidden until you show them once or always for that sender, and they are then fetched by Mailman itself rather than by the message. Tracking pixels are removed
- Designed newsletters follow the dark style too
- Full-text search across every account, offline, with `from:`, `to:`, `subject:`, `is:unread`, `is:starred` and `has:attachment`
- A composer with formatting that follows what you type: `**bold**`, `*italic*`, `` `code` ``, `- ` and `1. ` lists, `> ` quotes and `# ` headings, links pasted or typed, pictures pasted inline and files attached from a picker or dropped on the window. A From picker when you have more than one address, templates for messages you write often, drafts saved to the server, and suggestions from the people you write to
- Quiet notifications for new mail from people you know, only while Mailman isn't in front, and clicking one opens the conversation
- Opens `mailto:` links and `.eml` files. A message file opened on its own shows just that message

## Keyboard shortcuts

`Ctrl+K` finds any command, and `?` lists the shortcuts.

| Shortcut | Action |
|----------|--------|
| `J` / `K` | Next and previous conversation |
| `Enter` / `O` | Open the conversation |
| `X` | Select the conversation, to act on several at once; `Shift`+click selects a range |
| `Esc` | Clear the selection, or go back to the list |
| `E` | Archive |
| `#` | Delete |
| `B` | Set aside for later |
| `S` | Star or unstar |
| `Shift+U` / `Shift+I` | Mark as unread or read |
| `!` | Report junk |
| `Shift+V` | Move to the inbox |
| `R` / `A` / `F` | Reply, reply all, forward |
| `C` | Write a message |
| `/` | Search |
| `;` | Expand every message in the conversation |
| `Z` | Undo |
| `G` then `I`, `K`, `L`, `S`, `D`, `T`, `A`, `J`, `X` | Inbox, Screener, Later, Starred, Drafts, Sent, Archive, Junk, Trash |
| `G` then `N`, `R`, `U` | Newsletters, Receipts, Updates |
| `F5` / `Ctrl+R` / `Shift+R` | Check for new mail |
| `Ctrl+Enter` | Send |
| `Ctrl+Shift+C` | Show Cc and Bcc while writing |
| `Ctrl+B` / `Ctrl+I` / `Ctrl+K` | Bold, italic and link while writing |
| `Ctrl+,` | Settings |

## Signing in with Google and Microsoft

The browser sign-in needs an OAuth client registered with each provider. Without one, those buttons are hidden and accounts sign in with a password or app password instead, which Gmail and Outlook both support.

- **Google**: create an OAuth client of type *Desktop app* in the Google Cloud console and enable the Gmail API. Mailman asks for the `https://mail.google.com/` scope, which Google treats as restricted: until the app passes Google's verification and security assessment, only the test users listed on the consent screen can sign in, and they see an unverified app warning. Mailman listens on `http://127.0.0.1` with a random port for the reply.
- **Microsoft**: register an application in Microsoft Entra for personal and work accounts, add the *Mobile and desktop applications* platform with the redirect address `http://localhost`, and grant the delegated `IMAP.AccessAsUser.All`, `SMTP.Send` and `offline_access` permissions. No client secret is needed.

Provide the client IDs when building, or in the environment when running:

```bash
MAILMAN_GOOGLE_CLIENT_ID=… MAILMAN_GOOGLE_CLIENT_SECRET=… MAILMAN_MICROSOFT_CLIENT_ID=… bun run desktop:build
```

Google's desktop clients come with a client secret that is not actually secret; Google still expects it when exchanging the code.

## Development

Mailman's controls, styles and native setup come from `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

Mail lives in `~/.local/share/mailman/mail.sqlite`; pictures fetched for messages and saved inline parts are cached in `~/.cache/mailman`.

## Install

```bash
sabine install --bundle .
xdg-mime default com.lantharos.mailman.desktop x-scheme-handler/mailto message/rfc822
```

## Project layout

```
mailman/
├── src/
│   ├── lib/
│   │   ├── api/              bridge commands, events and types
│   │   ├── app/              commands, shortcuts, navigation, dates and launch handling
│   │   ├── compose/          composer, editor, recipients and mailto links
│   │   ├── list/             conversation list, inbox summaries and row menu
│   │   ├── mail/             accounts, views, the list and actions with undo
│   │   ├── palette/          command palette
│   │   ├── reader/           conversation view, message bodies, attachments and message files
│   │   ├── settings/         settings, addresses with their signatures, and adding accounts
│   │   ├── shell/            header, toasts, later picker, shortcuts and welcome
│   │   └── sidebar/          views, bundles, folders and sync status
│   └── App.svelte            window layout
└── desktop/src/
    ├── accounts/             account settings, keyring credentials and token renewal, discovery and OAuth sign-in
    ├── bridge/               bridge command registration
    ├── mail/                 envelopes, categories, rendering, sanitizing, composing and pictures
    ├── protocols/            IMAP client, JMAP client and its event stream, SMTP and TLS connections
    ├── services/             actions, sending, launch arguments and notifications
    ├── store/                the local SQLite store and its migrations, accounts and addresses, full-text search and views
    └── sync/                 per-account sync, reconnecting after sleep and network changes, history, on-demand fetching, the outbox and reminders
        ├── imap/             IMAP sync, IDLE and Gmail send-as addresses
        └── jmap/             JMAP sync, push, history and addresses
```

## License

MIT. Open Runde is licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt`.
