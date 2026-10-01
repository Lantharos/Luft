use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use tokio::sync::Mutex;
use zbus::object_server::{ObjectServer, SignalEmitter};
use zbus::zvariant::{OwnedObjectPath, Value};
use zbus::{fdo, interface};

use super::{Target, parse};
use crate::daemon::Daemon;
use crate::identity::App;

static NEXT: AtomicU64 = AtomicU64::new(1);

pub enum Action {
    Unlock {
        app: App,
        objects: Vec<OwnedObjectPath>,
    },
}

pub struct PromptObject {
    daemon: Arc<Daemon>,
    path: OwnedObjectPath,
    action: Mutex<Option<Action>>,
}

impl PromptObject {
    pub async fn register(
        daemon: &Arc<Daemon>,
        server: &ObjectServer,
        action: Action,
    ) -> fdo::Result<OwnedObjectPath> {
        let path = format!(
            "/org/freedesktop/secrets/prompt/p{}",
            NEXT.fetch_add(1, Ordering::Relaxed)
        );
        let path = OwnedObjectPath::try_from(path).map_err(zbus::Error::from)?;
        let prompt = Self {
            daemon: daemon.clone(),
            path: path.clone(),
            action: Mutex::new(Some(action)),
        };
        server.at(&path, prompt).await?;
        Ok(path)
    }

    async fn finish(daemon: &Daemon, path: &OwnedObjectPath, dismissed: bool, result: Value<'_>) {
        if let Ok(emitter) = SignalEmitter::new(&daemon.connection, path.as_ref()) {
            let _ = Self::completed(&emitter, dismissed, result).await;
        }
        let _ = daemon
            .connection
            .object_server()
            .remove::<Self, _>(path)
            .await;
    }
}

async fn run(daemon: &Arc<Daemon>, action: Action) -> (bool, Value<'static>) {
    let Action::Unlock { app, objects } = action;
    if !daemon.ensure_unlocked(&app, true).await {
        return (true, Value::from(Vec::<OwnedObjectPath>::new()));
    }
    let keys = daemon.items_of(&objects).await;
    let allowed = daemon.authorize(&app, &keys, true).await;
    let unlocked: Vec<OwnedObjectPath> = objects
        .into_iter()
        .filter(|object| match parse(object) {
            Some(Target::Item(collection, item)) => allowed.contains(&(collection, item)),
            _ => true,
        })
        .collect();
    (unlocked.is_empty(), Value::from(unlocked))
}

#[interface(name = "org.freedesktop.Secret.Prompt")]
impl PromptObject {
    async fn prompt(&self, _window_id: &str) {
        let Some(action) = self.action.lock().await.take() else {
            return;
        };
        let daemon = self.daemon.clone();
        let path = self.path.clone();
        tokio::spawn(async move {
            let (dismissed, result) = run(&daemon, action).await;
            Self::finish(&daemon, &path, dismissed, result).await;
        });
    }

    async fn dismiss(&self) {
        if self.action.lock().await.take().is_some() {
            Self::finish(
                &self.daemon,
                &self.path,
                true,
                Value::from(Vec::<OwnedObjectPath>::new()),
            )
            .await;
        }
    }

    #[zbus(signal)]
    async fn completed(
        emitter: &SignalEmitter<'_>,
        dismissed: bool,
        result: Value<'_>,
    ) -> zbus::Result<()>;
}
