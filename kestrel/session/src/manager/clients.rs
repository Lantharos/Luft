use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use futures_util::future::join_all;
use luft_dbus_macros::introspect;
use tokio::sync::oneshot;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};
use zbus::{ObjectPath, OwnedObjectPath};

use super::{Manager, PATH};

const QUERY_TIMEOUT: Duration = Duration::from_secs(1);
const END_TIMEOUT: Duration = Duration::from_secs(5);

struct Registered {
    owner: String,
    answered: Option<oneshot::Sender<()>>,
}

#[derive(Default)]
struct Registry {
    next: u32,
    clients: HashMap<OwnedObjectPath, Registered>,
}

type Shared = Arc<Mutex<Registry>>;

struct Client {
    path: OwnedObjectPath,
    registry: Shared,
}

#[introspect]
#[interface(name = "org.gnome.SessionManager.ClientPrivate")]
impl Client {
    fn end_session_response(&self, _is_ok: bool, _reason: &str) {
        let mut registry = self.registry.lock().unwrap();
        if let Some(answered) = registry
            .clients
            .get_mut(&self.path)
            .and_then(|client| client.answered.take())
        {
            let _ = answered.send(());
        }
    }

    #[zbus(signal)]
    async fn stop(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn query_end_session(emitter: &SignalEmitter<'_>, flags: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn end_session(emitter: &SignalEmitter<'_>, flags: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn cancel_end_session(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}

#[derive(Clone, Copy)]
enum Ending {
    Query,
    End,
}

pub struct Clients {
    connection: Connection,
    registry: Shared,
}

impl Clients {
    pub fn new(connection: Connection) -> Self {
        Self {
            connection,
            registry: Shared::default(),
        }
    }

    pub async fn register(&self, owner: &str) -> zbus::Result<OwnedObjectPath> {
        let path = {
            let mut registry = self.registry.lock().unwrap();
            registry.next += 1;
            OwnedObjectPath::try_from(format!("{PATH}/Client{}", registry.next))?
        };
        let client = Client {
            path: path.clone(),
            registry: Arc::clone(&self.registry),
        };
        self.connection.object_server().at(&path, client).await?;
        let owner = owner.to_owned();
        let registered = Registered {
            owner,
            answered: None,
        };
        self.registry
            .lock()
            .unwrap()
            .clients
            .insert(path.clone(), registered);
        self.changed(true, &path).await?;
        Ok(path)
    }

    pub async fn unregister(&self, owner: &str, path: &ObjectPath<'_>) -> zbus::Result<()> {
        let removed = {
            let mut registry = self.registry.lock().unwrap();
            let path = OwnedObjectPath::from(path.to_owned());
            let owned = registry
                .clients
                .get(&path)
                .is_some_and(|client| client.owner == owner);
            owned && registry.clients.remove(&path).is_some()
        };
        if !removed {
            return Ok(());
        }
        self.connection
            .object_server()
            .remove::<Client, _>(path)
            .await?;
        self.changed(false, path).await
    }

    pub async fn remove_owner(&self, owner: &str) -> zbus::Result<()> {
        let paths: Vec<OwnedObjectPath> = {
            let registry = self.registry.lock().unwrap();
            registry
                .clients
                .iter()
                .filter(|(_, client)| client.owner == owner)
                .map(|(path, _)| path.clone())
                .collect()
        };
        for path in paths {
            self.unregister(owner, &path).await?;
        }
        Ok(())
    }

    pub async fn end(&self) {
        self.broadcast(Ending::Query, QUERY_TIMEOUT).await;
        self.broadcast(Ending::End, END_TIMEOUT).await;
    }

    async fn broadcast(&self, ending: Ending, timeout: Duration) {
        let asked: Vec<(OwnedObjectPath, oneshot::Receiver<()>)> = {
            let mut registry = self.registry.lock().unwrap();
            registry
                .clients
                .iter_mut()
                .map(|(path, client)| {
                    let (answered, answer) = oneshot::channel();
                    client.answered = Some(answered);
                    (path.clone(), answer)
                })
                .collect()
        };
        let mut answers = Vec::with_capacity(asked.len());
        for (path, answer) in asked {
            if let Err(error) = self.ask(ending, &path).await {
                eprintln!("Couldn't ask {path} to end: {error}");
            }
            answers.push(answer);
        }
        let _ = tokio::time::timeout(timeout, join_all(answers)).await;
        for client in self.registry.lock().unwrap().clients.values_mut() {
            client.answered = None;
        }
    }

    async fn ask(&self, ending: Ending, path: &ObjectPath<'_>) -> zbus::Result<()> {
        let emitter = SignalEmitter::new(&self.connection, path)?;
        match ending {
            Ending::Query => Client::query_end_session(&emitter, 0).await,
            Ending::End => Client::end_session(&emitter, 0).await,
        }
    }

    async fn changed(&self, added: bool, path: &ObjectPath<'_>) -> zbus::Result<()> {
        let emitter = SignalEmitter::new(&self.connection, PATH)?;
        if added {
            Manager::client_added(&emitter, path.clone()).await
        } else {
            Manager::client_removed(&emitter, path.clone()).await
        }
    }
}
