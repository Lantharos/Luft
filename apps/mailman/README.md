# Mailman

Mailman is the mail app of Luft. It keeps every account in one local copy, so opening, searching and sorting mail never waits on the network. Built with Sabine and Svelte.

## Features

- IMAP/SMTP and JMAP accounts, with push over IMAP IDLE or JMAP and only changes fetched
- Most accounts are set up from the address alone; Gmail and Outlook can sign in through the browser
- One inbox for every account, with conversations grouped across folders
- The Screener holds mail from first-time senders until you let them in
- Bundles for newsletters, receipts and updates, one-click unsubscribe, and Later to set conversations aside
- Several addresses per account with their own signatures; replies go out from the address they were written to
- Undo for archiving, moving, deleting and sending, plus send later and no-reply reminders
- Safe mail display: no scripts, no remote content until you allow it, tracking pixels removed
- Offline full-text search across every account
- A composer with Markdown-style formatting, inline pictures, templates and drafts saved to the server
- Opens `mailto:` links and `.eml` files

Passwords and sign-in tokens are kept in Luft Keyring, readable only by Mailman.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
```

## Install

```sh
sabine install --bundle .
xdg-mime default com.lantharos.mailman.desktop x-scheme-handler/mailto message/rfc822
```

The second line makes Mailman the default handler for `mailto:` links and message files.

## Configuration

Browser sign-in for Gmail and Outlook needs OAuth client IDs, read at build time or from the environment at run time. Without them those buttons are hidden and accounts use a password or app password.

| Variable | Purpose |
|----------|---------|
| `MAILMAN_GOOGLE_CLIENT_ID` | Google OAuth client (type Desktop app, Gmail API enabled) |
| `MAILMAN_GOOGLE_CLIENT_SECRET` | Google's desktop client secret, required by its token exchange |
| `MAILMAN_MICROSOFT_CLIENT_ID` | Microsoft Entra app for personal and work accounts |

```sh
MAILMAN_GOOGLE_CLIENT_ID=… MAILMAN_GOOGLE_CLIENT_SECRET=… MAILMAN_MICROSOFT_CLIENT_ID=… bun run desktop:build
```

- Google: Mailman requests the restricted `https://mail.google.com/` scope, so until the app is verified only test users on the consent screen can sign in. The redirect goes to `http://127.0.0.1` on a random port.
- Microsoft: add the Mobile and desktop applications platform with redirect `http://localhost`, and grant delegated `IMAP.AccessAsUser.All`, `SMTP.Send` and `offline_access`. No client secret is needed.

## Search

Search terms can be combined with these filters:

| Filter | Matches |
|--------|---------|
| `from:` / `to:` | Sender or recipient |
| `subject:` | Subject |
| `is:unread` / `is:starred` | Unread or starred mail |
| `has:attachment` | Mail with attachments |
| `in:anywhere` | Also search Trash and Junk |

## Keyboard shortcuts

`Ctrl+K` opens the command palette and `?` lists every shortcut.

| Shortcut | Action |
|----------|--------|
| `J` / `K`, `↓` / `↑` | Next and previous conversation |
| `Enter` / `O` | Open the conversation |
| `X` | Select; `Shift`+click selects a range |
| `Esc` | Clear the selection, or go back to the list |
| `E` | Archive |
| `#` / `Delete` | Delete |
| `B` | Set aside for later |
| `S` | Star or unstar |
| `Shift+U` / `Shift+I` | Mark as unread or read |
| `!` | Report junk |
| `Shift+V` | Move to the inbox |
| `R` / `A` / `F` | Reply, reply all, forward |
| `C` / `Ctrl+N` | Write a message |
| `/` | Search |
| `;` | Expand every message in the conversation |
| `Z` | Undo |
| `G` then `I` `K` `L` `S` `D` `T` `A` `J` `X` | Inbox, Screener, Later, Starred, Drafts, Sent, Archive, Junk, Trash |
| `G` then `N` `R` `U` | Newsletters, Receipts, Updates |
| `F5` / `Ctrl+R` / `Shift+R` | Check for new mail |
| `Ctrl+,` | Settings |
| `Ctrl+Enter` | Send (composer) |
| `Ctrl+Shift+C` | Show Cc and Bcc (composer) |
| `Ctrl+B` / `Ctrl+I` / `Ctrl+K` | Bold, italic, link (composer) |

## Files

| Path | Contents |
|------|----------|
| `~/.local/share/mailman/mail.sqlite` | Local mail store |
| `~/.cache/mailman/` | Fetched pictures and saved inline parts |

## License

MIT. Open Runde is licensed under the SIL Open Font License, included in [`packages/ui/fonts/OFL.txt`](../../packages/ui/fonts/OFL.txt).
