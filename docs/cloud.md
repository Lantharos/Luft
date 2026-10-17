# Cloud drives

How `luft-accounts` turns online accounts into folders in `~/Cloud`. Using them is described in [Accounts and cloud drives](https://docs.luft.computer/files/cloud-drives/), and the service itself in [packages/accounts](../packages/accounts/README.md).

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
