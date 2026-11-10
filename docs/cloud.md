# Cloud drives

How `luft-accounts` turns online accounts into folders in `~/Cloud`. Using them is described in [Accounts and cloud drives](https://docs.luft.computer/files/cloud-drives/), the service itself in [services/accounts](../services/accounts/README.md), and the crate apps reach it through in [packages/system/accounts](../packages/system/accounts/README.md).

## Where things are

| Path | Holds |
| --- | --- |
| `~/Cloud/<name>` | Each account's drive; renaming the account in Settings renames it |
| `~/.config/luft/accounts.json` | The list of accounts and what's kept, without secrets |
| `~/.local/share/luft-accounts/kept` | Kept files |
| `~/.cache/luft-accounts` | Files downloaded on demand |

## App registrations

OneDrive and Dropbox sign in through an app registered with Microsoft and Dropbox. The client IDs and secrets of both are in `services/accounts/data/apps.json`, which is built into `luft-accounts`; it holds rclone's registrations until Luft's own are registered:

| Service | Where | Settings |
| --- | --- | --- |
| OneDrive | [Microsoft Entra admin center](https://entra.microsoft.com), App registrations | Accounts in any organizational directory and personal Microsoft accounts; a Web or Mobile and desktop redirect URI of `http://localhost:53682/`; a client secret; delegated Microsoft Graph permissions `Files.Read`, `Files.ReadWrite`, `Files.Read.All`, `Files.ReadWrite.All`, `Sites.Read.All`, `offline_access`, `openid`, `email` and `profile` |
| Dropbox | [Dropbox App Console](https://www.dropbox.com/developers/apps) | Scoped access, Full Dropbox; redirect URI `http://localhost:53682/`; permissions `account_info.read`, `files.metadata.write`, `files.content.write`, `files.content.read` and `sharing.write`; then apply for production so more than 500 people can sign in |

Put the new IDs and secrets in `apps.json`. OneDrive and Dropbox accounts signed in with other registrations have to sign in again. iCloud Drive, Nextcloud and WebDAV need no registration.

## Signing in and removing

A password typed in Settings reaches the service through a pipe handed over with `SignIn`, never in the message itself, so nothing watching the session bus sees it. Nextcloud and WebDAV servers have to use `https`; plain `http` is only taken for a server on the same computer, as the checks use.

`Free` and `Remove` first send up what changed on this computer and wait for it. When that can't be done (no connection, a drive that isn't connected, uploads still waiting or a failed sync), `Free` answers `Error.Offline` or `Error.Unsynced` and deletes nothing, and so does `Remove` unless it's called with `discard_unsynced`, which is for after the person confirmed losing those files.

## Testing

`cargo test` in `services/accounts` covers token exchange against a stand-in server, filters, conflict names and how errors read.

`kestrel/tools/session.sh capture --only apps:cloud`, with `rclone` installed and Settings and Rover built, signs in to a local WebDAV server from `rclone serve webdav` with a scratch keyring, keeps a folder, and captures Accounts in Settings and the drive in Rover.

Signing in to iCloud Drive, OneDrive and Dropbox needs real accounts, so check these by hand after changing sign-in:

- iCloud Drive: the code from a device, a texted code, a wrong code, signing in again after the monthly check, and an account with Advanced Data Protection.
- OneDrive and Dropbox: the browser sign-in, a share link and opening a file in the browser.
