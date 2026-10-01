use std::collections::HashMap;
use std::os::fd::AsRawFd;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, MutexGuard, PoisonError};
use std::time::{Duration, Instant};

use luft_keyring_wire::{
    Event, Grant, GrantReason, Problem, Reply, Request, Seal, Secret, Status, Unlock, read_async,
    write_async,
};
use tokio::io::AsyncReadExt;
use tokio::net::UnixStream;
use tokio::sync::mpsc;

use crate::peer::{Peer, Verifier};
use crate::seals::Seals;
use crate::slot::ChipSlot;

const GRANT_LIFETIME: Duration = Duration::from_secs(120);
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
const CHIP_KEY_SIZE: usize = 32;

pub struct Service {
    verifier: Verifier,
    seals: Seals,
    chip: ChipSlot,
    users: Mutex<HashMap<u32, User>>,
    attachments: AtomicU64,
}

#[derive(Default)]
struct User {
    listener: Option<(u64, mpsc::UnboundedSender<Event>)>,
    pending: Option<(Grant, Instant)>,
}

impl Service {
    pub fn new(daemon: PathBuf, seals: PathBuf, tcti: String) -> Self {
        Self {
            verifier: Verifier::new(daemon),
            seals: Seals::new(seals),
            chip: ChipSlot::new(tcti),
            users: Mutex::default(),
            attachments: AtomicU64::new(0),
        }
    }

    pub fn is_idle(&self) -> bool {
        self.users()
            .values()
            .all(|user| !user.pending.as_ref().is_some_and(fresh))
    }

    fn users(&self) -> MutexGuard<'_, HashMap<u32, User>> {
        self.users.lock().unwrap_or_else(PoisonError::into_inner)
    }

    pub async fn serve(self: Arc<Self>, mut stream: UnixStream) {
        let peer = self.verifier.identify(stream.as_raw_fd());
        let Ok(Ok(request)) =
            tokio::time::timeout(REQUEST_TIMEOUT, read_async::<Request>(&mut stream)).await
        else {
            return;
        };
        let reply = match (request, peer) {
            (Request::Grant(grant), Peer::Root) => {
                self.grant(grant).await;
                Reply::Done
            }
            (Request::Attach, Peer::Keyring(user)) => return self.attach(user, stream).await,
            (request, Peer::Keyring(user)) => self.clone().answer(user, request).await,
            _ => Reply::Refused(Problem::NotAllowed),
        };
        let _ = write_async(&mut stream, &reply).await;
    }

    async fn answer(self: Arc<Self>, user: u32, request: Request) -> Reply {
        tokio::task::spawn_blocking(move || self.answer_blocking(user, request))
            .await
            .unwrap_or_else(|error| Reply::Refused(Problem::Failed(error.to_string())))
    }

    fn answer_blocking(&self, user: u32, request: Request) -> Reply {
        let outcome = match request {
            Request::Status => Ok(Reply::Status(self.status(user))),
            Request::Seal { pin } => self
                .seal(user, pin.as_ref())
                .map(|key| Reply::Sealed { key }),
            Request::Unseal { pin } => self
                .unseal(user, Some(&pin))
                .map(|key| Reply::Unsealed { key }),
            Request::Forget => self
                .seals
                .forget(user)
                .map(|()| Reply::Done)
                .map_err(|error| Problem::Failed(error.to_string())),
            Request::CreateKey { auth } => self
                .chip
                .with(|chip| chip.create_key(auth.expose()))
                .map(Reply::Key),
            Request::Sign { key, auth, digest } => self
                .chip
                .with(|chip| chip.sign(&key, auth.expose(), &digest))
                .map(|(r, s)| Reply::Signature { r, s }),
            Request::Grant(_) | Request::Attach => Err(Problem::NotAllowed),
        };
        outcome.unwrap_or_else(Reply::Refused)
    }

    fn status(&self, user: u32) -> Status {
        let seal = self.seals.load(user).map(|blob| Seal {
            pin: blob.pin,
            pcrs: blob.pcrs,
        });
        Status {
            chip: self.chip.state(),
            seal,
        }
    }

    fn seal(&self, user: u32, pin: Option<&Secret>) -> Result<Secret, Problem> {
        let mut key = vec![0; CHIP_KEY_SIZE];
        getrandom::fill(&mut key).map_err(|error| Problem::Failed(error.to_string()))?;
        let key = Secret::new(key);
        let blob = self
            .chip
            .with(|chip| chip.seal(key.expose(), pin.map(Secret::expose)))?;
        self.seals
            .store(user, &blob)
            .map_err(|error| Problem::Failed(error.to_string()))?;
        Ok(key)
    }

    fn unseal(&self, user: u32, pin: Option<&Secret>) -> Result<Secret, Problem> {
        let blob = self.seals.load(user).ok_or(Problem::NotSealed)?;
        if blob.pin && pin.is_none() {
            return Err(Problem::NeedsPin);
        }
        let key = self
            .chip
            .with(|chip| chip.unseal(&blob, pin.map(Secret::expose)))?;
        Ok(Secret::copy_of(&key))
    }

    async fn grant(self: &Arc<Self>, grant: Grant) {
        let user = grant.user;
        let listener = {
            let mut users = self.users();
            let entry = users.entry(user).or_default();
            match &entry.listener {
                Some((_, listener)) => Some(listener.clone()),
                None => {
                    entry.pending = Some((grant, Instant::now()));
                    return;
                }
            }
        };
        if let Some(listener) = listener {
            let _ = listener.send(self.clone().unlock(grant).await);
        }
    }

    async fn unlock(self: Arc<Self>, grant: Grant) -> Event {
        let Grant {
            user,
            password,
            reason,
        } = grant;
        if reason == GrantReason::PasswordChanged {
            return Event::Unlock(Unlock {
                reason,
                key: None,
                password,
                problem: None,
            });
        }
        let key = tokio::task::spawn_blocking(move || self.unseal(user, None))
            .await
            .unwrap_or_else(|error| Err(Problem::Failed(error.to_string())));
        let (key, problem) = match key {
            Ok(key) => (Some(key), None),
            Err(problem) => (None, Some(problem)),
        };
        Event::Unlock(Unlock {
            reason,
            key,
            password,
            problem,
        })
    }

    async fn attach(self: Arc<Self>, user: u32, stream: UnixStream) {
        let (mut reader, mut writer) = stream.into_split();
        if write_async(&mut writer, &Reply::Done).await.is_err() {
            return;
        }
        let id = self.attachments.fetch_add(1, Ordering::Relaxed);
        let (sender, mut events) = mpsc::unbounded_channel();
        let pending = {
            let mut users = self.users();
            let entry = users.entry(user).or_default();
            entry.listener = Some((id, sender.clone()));
            entry.pending.take().filter(fresh).map(|(grant, _)| grant)
        };
        if let Some(grant) = pending {
            let _ = sender.send(self.clone().unlock(grant).await);
        }
        let mut probe = [0; 1];
        loop {
            tokio::select! {
                Some(event) = events.recv() => if write_async(&mut writer, &event).await.is_err() { break },
                _ = reader.read(&mut probe) => break,
            }
        }
        let mut users = self.users();
        if let Some(entry) = users.get_mut(&user)
            && entry
                .listener
                .as_ref()
                .is_some_and(|(current, _)| *current == id)
        {
            entry.listener = None;
        }
    }
}

fn fresh((_, at): &(Grant, Instant)) -> bool {
    at.elapsed() < GRANT_LIFETIME
}
