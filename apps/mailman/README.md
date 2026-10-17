# Mailman

Mailman is Luft's mail app. It keeps every account, IMAP/SMTP or JMAP, in one local copy, so opening, searching and sorting mail never waits on the network. Passwords and sign-in tokens stay in Luft Keyring, readable only by Mailman. Using it is described in [the docs](https://docs.luft.computer/apps/mailman/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
xdg-mime default com.lantharos.mailman.desktop x-scheme-handler/mailto message/rfc822
```

The last line makes Mailman the default for `mailto:` links and `.eml` files.

## Browser sign-in

Signing in to Gmail and Outlook through the browser needs OAuth client IDs, read at build time or from the environment at run time. Without them, those accounts use a password or app password.

| Variable | Purpose |
|----------|---------|
| `MAILMAN_GOOGLE_CLIENT_ID` | Google OAuth client (type Desktop app, Gmail API enabled) |
| `MAILMAN_GOOGLE_CLIENT_SECRET` | Google's desktop client secret, required by its token exchange |
| `MAILMAN_MICROSOFT_CLIENT_ID` | Microsoft Entra app for personal and work accounts |

- Google: Mailman requests the restricted `https://mail.google.com/` scope, so until the app is verified only test users on the consent screen can sign in. The redirect goes to `http://127.0.0.1` on a random port.
- Microsoft: add the Mobile and desktop applications platform with redirect `http://localhost`, and grant delegated `IMAP.AccessAsUser.All`, `SMTP.Send` and `offline_access`. No client secret is needed.

## Files

| Path | Contents |
|------|----------|
| `~/.local/share/mailman/mail.sqlite` | Local mail store |
| `~/.cache/mailman/` | Fetched pictures and saved inline parts |

## License

MIT. Open Runde is under the SIL Open Font License, in [`packages/ui/fonts/OFL.txt`](../../packages/ui/fonts/OFL.txt).
