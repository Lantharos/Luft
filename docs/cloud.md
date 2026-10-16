# Cloud drives

Sign in to a cloud service once in Settings, under Accounts, and its files appear as a folder in `~/Cloud`, next to your other drives in Rover. Every app and every file dialog sees it like any other folder.

| Service | How you sign in |
| --- | --- |
| OneDrive | In your browser, with your Microsoft account |
| Dropbox | In your browser |
| iCloud Drive | With your Apple Account email and password, then the code Apple shows on your iPhone, iPad or Mac |
| Nextcloud | In your browser, or with a user name and app password |
| WebDAV | With the server address, user name and password |

Passwords and sign-in tokens are kept in Luft Keyring and never written to a file. Removing an account in Settings removes its keyring entry and the copies on this computer; the files stay in the cloud.

## Files on demand

Nothing downloads until you open it. Opened files stay for a day and at most 5 GB, and are cleared sooner when the disk runs low on space, so a large cloud drive doesn't fill your disk.

Choose **Keep on this device** on a file or folder in Rover to keep it on your computer. Kept files open without a connection, and changes go both ways: what you change here reaches the cloud, and changes made elsewhere come down, within a few seconds of a change here and every five minutes otherwise. **Free up space** turns a kept file or folder back into one that downloads when opened; anything changed here is sent up first, so it needs a connection.

Rover marks each file in a cloud drive:

| Mark | Means |
| --- | --- |
| Cloud | Online only; it downloads when opened |
| Check | On this device |
| Arrows | Syncing |

If the computer starts without a connection, the drive shows only the kept files until it's back online. Files that are online only can't open without a connection.

## When the same file changes in two places

If a kept file changes on this computer and in the cloud before they meet, both versions are kept. The newer one keeps the name, and the other is renamed, for example to `Report (copy from OneDrive).docx` or `Report (copy from this device).docx`. A notification says so, and Rover shows a note in the drive until you dismiss it or remove the copy.

## Pausing

Syncing in the background pauses on a metered connection, such as a phone's hotspot, and when the battery is at 20% or lower and not charging. Opening a file still downloads it. Changes made meanwhile are kept on this computer and go up once the pause ends. Settings shows why a drive is paused.

## Sharing

Right-click a file or folder in a cloud drive:

- **Copy share link** makes a link anyone with it can open (OneDrive, Dropbox and Nextcloud).
- **Open in browser** shows it on the service's website (OneDrive, Dropbox and Nextcloud).

## iCloud Drive

- Apple asks you to confirm it's you about once a month. When that happens, a notification and Settings ask you to sign in again; it only takes the code from your Apple device.
- App-specific passwords don't work; use your Apple Account password.
- With Advanced Data Protection on, iCloud Drive only works outside Apple devices when **Access iCloud Data on the Web** is on. On an iPhone it's in Settings, your name, iCloud. After turning it on, sign in again and approve the request on your iPhone.

## Where things are

| Path | Holds |
| --- | --- |
| `~/Cloud/<name>` | Each account's drive; renaming the account in Settings renames it |
| `~/.config/luft/accounts.json` | The list of accounts and what's kept, without secrets |
| `~/.local/share/luft-accounts/kept` | Kept files |
| `~/.cache/luft-accounts` | Files downloaded on demand |

## App registrations

OneDrive and Dropbox sign in through an app registered with Microsoft and Dropbox. Luft uses rclone's registrations until it has its own. To use Luft's, register:

| Service | Where | Settings |
| --- | --- | --- |
| OneDrive | [Microsoft Entra admin center](https://entra.microsoft.com), App registrations | Accounts in any organizational directory and personal Microsoft accounts; a Web or Mobile and desktop redirect URI of `http://localhost:53682/`; a client secret; delegated Microsoft Graph permissions `Files.Read`, `Files.ReadWrite`, `Files.Read.All`, `Files.ReadWrite.All`, `Sites.Read.All`, `offline_access`, `openid`, `email` and `profile` |
| Dropbox | [Dropbox App Console](https://www.dropbox.com/developers/apps) | Scoped access, Full Dropbox; redirect URI `http://localhost:53682/`; permissions `account_info.read`, `files.metadata.write`, `files.content.write`, `files.content.read` and `sharing.write`; then apply for production so more than 500 people can sign in |

Then build `luft-accounts` with the IDs and secrets in the environment, as CI does for the image:

```sh
LUFT_ONEDRIVE_CLIENT_ID=… LUFT_ONEDRIVE_CLIENT_SECRET=… \
LUFT_DROPBOX_CLIENT_ID=… LUFT_DROPBOX_CLIENT_SECRET=… \
cargo build --release --manifest-path packages/accounts/service/Cargo.toml
```

Accounts signed in before the switch keep working with the registration they were made with until they sign in again. iCloud Drive, Nextcloud and WebDAV need no registration.

## Testing

`cargo test` in `packages/accounts/service` covers token exchange against a stand-in server, filters, conflict names and how errors read.

`kestrel/tools/session.sh capture --only apps:cloud`, with `rclone` installed and `KESTREL_DEV_APPS=settings,rover`, signs in to a local WebDAV server from `rclone serve webdav` with a scratch keyring, keeps a folder, and captures Accounts in Settings and the drive in Rover.

Signing in to iCloud Drive, OneDrive and Dropbox needs real accounts, so check these by hand after changing sign-in:

- iCloud Drive: the code from a device, a texted code, a wrong code, signing in again after the monthly check, and an account with Advanced Data Protection.
- OneDrive and Dropbox: the browser sign-in, a share link and opening a file in the browser.
