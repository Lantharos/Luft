use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use futures_util::StreamExt;
use luft_app::dbus;
use luft_dbus_macros::introspect;
use parking_lot::{Mutex, MutexGuard};
use zbus::proxy;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.OpenWindows",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/OpenWindows"
)]
trait Kestrel {
    fn list(&self) -> zbus::Result<HashMap<String, Vec<u32>>>;

    #[zbus(signal)]
    fn changed(&self) -> zbus::Result<()>;
}

pub struct Windowed {
    apps: HashSet<String>,
    pids: HashSet<u32>,
}

impl Windowed {
    pub fn shows(&self, key: &str, members: &[u32]) -> bool {
        self.apps.contains(key) || members.iter().any(|pid| self.pids.contains(pid))
    }
}

impl From<HashMap<String, Vec<u32>>> for Windowed {
    fn from(apps: HashMap<String, Vec<u32>>) -> Self {
        Self {
            pids: apps.values().flatten().copied().collect(),
            apps: apps.into_keys().collect(),
        }
    }
}

/// The apps Kestrel shows a window for, kept current from its change signal.
/// Stays unknown when Kestrel can't tell.
#[derive(Clone, Default)]
pub struct OpenWindows(Arc<Mutex<Option<Windowed>>>);

impl OpenWindows {
    pub fn follow(&self) {
        let windows = self.clone();
        luft_app::spawn(async move { windows.listen().await });
    }

    pub fn current(&self) -> MutexGuard<'_, Option<Windowed>> {
        self.0.lock()
    }

    async fn listen(&self) -> Result<(), String> {
        let kestrel = KestrelProxy::new(dbus::session().await?)
            .await
            .map_err(dbus::failed)?;
        let mut changes = kestrel.receive_changed().await.map_err(dbus::failed)?;
        loop {
            let apps = kestrel.list().await.map_err(dbus::failed)?;
            *self.0.lock() = Some(apps.into());
            if changes.next().await.is_none() {
                return Ok(());
            }
        }
    }
}
