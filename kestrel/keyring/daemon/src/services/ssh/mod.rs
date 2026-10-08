mod confirm;
mod keys;
mod wire;

use std::os::fd::{AsRawFd, FromRawFd};
use std::os::unix::fs::{DirBuilderExt, PermissionsExt};
use std::path::PathBuf;
use std::sync::Arc;

use luft_keyring_vault::{Action, SshKey};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{UnixListener, UnixStream};

pub use keys::{fingerprint, generate_in_chip, generate_software, kind, openssh_line};

use crate::daemon::Daemon;
use wire::{Reader, Writer};

const FAILURE: u8 = 5;
const SUCCESS: u8 = 6;
const REQUEST_IDENTITIES: u8 = 11;
const IDENTITIES_ANSWER: u8 = 12;
const SIGN_REQUEST: u8 = 13;
const SIGN_RESPONSE: u8 = 14;
const ADD_IDENTITY: u8 = 17;
const REMOVE_IDENTITY: u8 = 18;
const REMOVE_ALL: u8 = 19;
const ADD_CONSTRAINED: u8 = 25;
const CONFIRM_CONSTRAINT: u8 = 2;
const LIMIT: usize = 256 * 1024;
const LISTEN_FD: i32 = 3;

pub fn socket_path() -> PathBuf {
    let runtime =
        std::env::var_os("XDG_RUNTIME_DIR").map_or_else(std::env::temp_dir, PathBuf::from);
    runtime.join("luft-keyring/ssh")
}

pub fn start(daemon: &Arc<Daemon>) -> std::io::Result<()> {
    let listener = match activated() {
        Some(listener) => listener,
        None => bind()?,
    };
    listener.set_nonblocking(true)?;
    let listener = UnixListener::from_std(listener)?;
    let daemon = daemon.clone();
    tokio::spawn(async move {
        while let Ok((stream, _)) = listener.accept().await {
            tokio::spawn(serve(daemon.clone(), stream));
        }
    });
    Ok(())
}

fn activated() -> Option<std::os::unix::net::UnixListener> {
    let pid = std::env::var("LISTEN_PID").ok()?.parse::<u32>().ok()?;
    let count = std::env::var("LISTEN_FDS").ok()?.parse::<i32>().ok()?;
    (pid == std::process::id() && count == 1)
        .then(|| unsafe { std::os::unix::net::UnixListener::from_raw_fd(LISTEN_FD) })
}

fn bind() -> std::io::Result<std::os::unix::net::UnixListener> {
    let path = socket_path();
    if let Some(folder) = path.parent() {
        std::fs::DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(folder)?;
        std::fs::set_permissions(folder, std::fs::Permissions::from_mode(0o700))?;
    }
    if std::os::unix::net::UnixStream::connect(&path).is_ok() {
        return Err(std::io::ErrorKind::AddrInUse.into());
    }
    let _ = std::fs::remove_file(&path);
    std::os::unix::net::UnixListener::bind(path)
}

async fn serve(daemon: Arc<Daemon>, mut stream: UnixStream) {
    let requester = confirm::Requester::of(stream.as_raw_fd());
    loop {
        let mut header = [0; 4];
        if stream.read_exact(&mut header).await.is_err() {
            return;
        }
        let length = u32::from_be_bytes(header) as usize;
        if length == 0 || length > LIMIT {
            return;
        }
        let mut message = zeroize::Zeroizing::new(vec![0; length]);
        if stream.read_exact(&mut message).await.is_err() {
            return;
        }
        let reply = answer(&daemon, &requester, message[0], &message[1..]).await;
        let framed = Writer::default().string(&reply).bytes;
        if stream.write_all(&framed).await.is_err() {
            return;
        }
    }
}

async fn answer(
    daemon: &Arc<Daemon>,
    requester: &confirm::Requester,
    kind: u8,
    body: &[u8],
) -> Vec<u8> {
    let outcome = match kind {
        REQUEST_IDENTITIES => Some(identities(daemon, requester).await),
        SIGN_REQUEST => sign(daemon, requester, body).await,
        ADD_IDENTITY | ADD_CONSTRAINED => add(daemon, body).await,
        REMOVE_IDENTITY => remove(daemon, Reader::new(body).string()).await,
        REMOVE_ALL => remove(daemon, None).await,
        _ => None,
    };
    outcome.unwrap_or_else(|| vec![FAILURE])
}

async fn identities(daemon: &Arc<Daemon>, requester: &confirm::Requester) -> Vec<u8> {
    daemon.ensure_unlocked(&requester.app, false).await;
    let keyring = daemon.keyring.lock().await;
    let keys: &[SshKey] = keyring.view().map_or(&[], |view| &view.ssh);
    let mut reply = Writer::default()
        .u8(IDENTITIES_ANSWER)
        .u32(u32::try_from(keys.len()).unwrap_or(0));
    for key in keys {
        reply = reply.string(&key.public).string(key.comment.as_bytes());
    }
    reply.bytes
}

async fn sign(
    daemon: &Arc<Daemon>,
    requester: &confirm::Requester,
    body: &[u8],
) -> Option<Vec<u8>> {
    let mut reader = Reader::new(body);
    let public = reader.string()?;
    let data = reader.string()?;
    if !daemon.ensure_unlocked(&requester.app, true).await {
        return None;
    }
    let key = {
        let keyring = daemon.keyring.lock().await;
        keyring
            .contents()?
            .ssh
            .iter()
            .find(|key| key.public == public)?
            .clone()
    };
    if key.confirm && !requester.confirm(daemon, &key).await {
        return None;
    }
    let signature = keys::sign(&key, data).await?;
    daemon
        .keyring
        .lock()
        .await
        .record(&requester.app, Action::Signed, &key.comment);
    Some(Writer::default().u8(SIGN_RESPONSE).string(&signature).bytes)
}

async fn add(daemon: &Daemon, body: &[u8]) -> Option<Vec<u8>> {
    let (mut key, mut constraints) = keys::parse_added(body)?;
    while !constraints.is_empty() {
        match constraints.u8()? {
            CONFIRM_CONSTRAINT => key.confirm = true,
            _ => return None,
        }
    }
    let mut keyring = daemon.keyring.lock().await;
    keyring
        .edit(|contents| {
            contents
                .ssh
                .retain(|existing| existing.public != key.public);
            contents.ssh.push(key);
        })
        .ok()?;
    drop(keyring);
    daemon.ssh_changed().await;
    Some(vec![SUCCESS])
}

async fn remove(daemon: &Daemon, public: Option<&[u8]>) -> Option<Vec<u8>> {
    let mut keyring = daemon.keyring.lock().await;
    keyring
        .edit(|contents| {
            contents
                .ssh
                .retain(|key| public.is_some_and(|public| key.public != public))
        })
        .ok()?;
    drop(keyring);
    daemon.ssh_changed().await;
    Some(vec![SUCCESS])
}
