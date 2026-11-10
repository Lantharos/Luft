mod confirm;
mod keys;
mod session;
mod wire;

use std::os::fd::{AsRawFd, FromRawFd};
use std::os::unix::fs::{DirBuilderExt, PermissionsExt};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use luft_keyring_vault::{Action, SshKey};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{UnixListener, UnixStream};

pub use keys::{fingerprint, generate_in_chip, generate_software, kind, openssh_line};
pub use session::Session;

use crate::daemon::Daemon;
use crate::requester::Requester;
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
const LIFETIME_CONSTRAINT: u8 = 1;
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
    let requester = confirm::requester(&daemon, stream.as_raw_fd()).await;
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

async fn answer(daemon: &Arc<Daemon>, requester: &Requester, kind: u8, body: &[u8]) -> Vec<u8> {
    let outcome = match kind {
        REQUEST_IDENTITIES => Some(identities(daemon, requester).await),
        SIGN_REQUEST => sign(daemon, requester, body).await,
        ADD_IDENTITY | ADD_CONSTRAINED if requester.is_you() => add(daemon, body).await,
        REMOVE_IDENTITY if requester.is_you() => unload(daemon, body).await,
        REMOVE_ALL if requester.is_you() => Some(unload_all(daemon).await),
        _ => None,
    };
    outcome.unwrap_or_else(|| vec![FAILURE])
}

async fn identities(daemon: &Arc<Daemon>, requester: &Requester) -> Vec<u8> {
    daemon.ensure_unlocked(requester, false).await;
    let keys = loaded(daemon).await;
    let mut reply = Writer::default()
        .u8(IDENTITIES_ANSWER)
        .u32(u32::try_from(keys.len()).unwrap_or(0));
    for key in keys {
        reply = reply.string(&key.public).string(key.comment.as_bytes());
    }
    reply.bytes
}

async fn loaded(daemon: &Daemon) -> Vec<SshKey> {
    let mut keys = daemon.ssh.timed();
    let keyring = daemon.keyring.lock().await;
    let stored = keyring.view().map_or(&[][..], |view| &view.ssh);
    let kept: Vec<SshKey> = stored
        .iter()
        .filter(|key| {
            daemon.ssh.is_loaded(&key.public) && keys.iter().all(|timed| timed.public != key.public)
        })
        .cloned()
        .collect();
    keys.extend(kept);
    keys
}

async fn sign(daemon: &Arc<Daemon>, requester: &Requester, body: &[u8]) -> Option<Vec<u8>> {
    let mut reader = Reader::new(body);
    let public = reader.string()?;
    let data = reader.string()?;
    let timed = daemon
        .ssh
        .timed()
        .into_iter()
        .find(|key| key.public == public);
    let key = match timed {
        Some(key) => key,
        None => {
            if !daemon.ssh.is_loaded(public) || !daemon.ensure_unlocked(requester, true).await {
                return None;
            }
            let keyring = daemon.keyring.lock().await;
            keyring
                .contents()?
                .ssh
                .iter()
                .find(|key| key.public == public)?
                .clone()
        }
    };
    if (key.confirm || !requester.is_you()) && !confirm::confirm(daemon, requester, &key).await {
        return None;
    }
    let signature = keys::sign(&key, data).await?;
    daemon
        .keyring
        .lock()
        .await
        .record(requester, Action::Signed, &key.comment);
    Some(Writer::default().u8(SIGN_RESPONSE).string(&signature).bytes)
}

async fn add(daemon: &Arc<Daemon>, body: &[u8]) -> Option<Vec<u8>> {
    let (mut key, mut constraints) = keys::parse_added(body)?;
    let mut lifetime = None;
    while !constraints.is_empty() {
        match constraints.u8()? {
            LIFETIME_CONSTRAINT => {
                lifetime = Some(Duration::from_secs(constraints.u32()?.into()));
            }
            CONFIRM_CONSTRAINT => key.confirm = true,
            _ => return None,
        }
    }
    match lifetime {
        Some(lifetime) => {
            daemon.ssh.keep(key, lifetime);
            let daemon = daemon.clone();
            tokio::spawn(async move {
                tokio::time::sleep(lifetime).await;
                daemon.ssh.expire();
            });
        }
        None => {
            daemon.ssh.forget(&key.public);
            daemon.ssh.set_loaded(&key.public, true);
            daemon
                .keyring
                .lock()
                .await
                .edit(|contents| {
                    contents
                        .ssh
                        .retain(|existing| existing.public != key.public);
                    contents.ssh.push(key);
                })
                .ok()?;
        }
    }
    daemon.ssh_changed().await;
    Some(vec![SUCCESS])
}

async fn unload(daemon: &Daemon, body: &[u8]) -> Option<Vec<u8>> {
    let public = Reader::new(body).string()?;
    let timed = daemon.ssh.forget(public);
    let stored = {
        let keyring = daemon.keyring.lock().await;
        keyring
            .view()
            .is_some_and(|view| view.ssh.iter().any(|key| key.public == public))
    };
    if stored {
        daemon.ssh.set_loaded(public, false);
    }
    (timed || stored).then_some(())?;
    daemon.ssh_changed().await;
    Some(vec![SUCCESS])
}

async fn unload_all(daemon: &Daemon) -> Vec<u8> {
    daemon.ssh.forget_all();
    {
        let keyring = daemon.keyring.lock().await;
        for key in keyring.view().map_or(&[][..], |view| &view.ssh) {
            daemon.ssh.set_loaded(&key.public, false);
        }
    }
    daemon.ssh_changed().await;
    vec![SUCCESS]
}
