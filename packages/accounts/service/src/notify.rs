use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use futures_util::StreamExt;
use zbus::{Connection, Proxy, Variant};

const NAME: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const OPEN: &str = "default";
pub const SETTINGS: &str = "kestrel-settings:accounts";

#[derive(Clone)]
pub struct Notifier {
    session: Connection,
    targets: Arc<Mutex<HashMap<u32, String>>>,
}

impl Notifier {
    pub fn new(session: Connection) -> Self {
        Self {
            session,
            targets: Arc::default(),
        }
    }

    pub async fn send(&self, summary: &str, body: &str, target: &str) {
        let sent = async {
            let notifications = Proxy::new(&self.session, NAME, PATH, NAME).await?;
            let hints = HashMap::from([("desktop-entry", Variant::from("com.lantharos.settings"))]);
            notifications
                .call::<_, _, u32>("Notify", &("Cloud", 0u32, "folder-remote", summary, body, vec![OPEN, "Open"], hints, -1i32))
                .await
        };
        match sent.await {
            Ok(id) => {
                self.targets.lock().expect("never poisoned").insert(id, target.to_owned());
            }
            Err(error) => eprintln!("Couldn't show a notification: {error}"),
        }
    }

    pub async fn listen(self) {
        let listening = async {
            let notifications = Proxy::new(&self.session, NAME, PATH, NAME).await?;
            let mut invoked = notifications.receive_signal("ActionInvoked").await?;
            while let Some(signal) = invoked.next().await {
                let (id, action): (u32, String) = signal.body().deserialize()?;
                let target = self.targets.lock().expect("never poisoned").remove(&id);
                if let (OPEN, Some(target)) = (action.as_str(), target) {
                    open(&target);
                }
            }
            zbus::Result::Ok(())
        };
        if let Err(error) = listening.await {
            eprintln!("Not following notifications: {error}");
        }
    }
}

pub fn open(target: &str) {
    if let Err(error) = tokio::process::Command::new("gio").args(["open", target]).spawn() {
        eprintln!("Couldn't open {target}: {error}");
    }
}
