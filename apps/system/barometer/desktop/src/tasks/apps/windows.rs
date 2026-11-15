use std::collections::HashMap;
use std::sync::Arc;

use futures_util::StreamExt;
use luft_app::dbus;
use luft_dbus_macros::introspect;
use parking_lot::{Mutex, MutexGuard};
use serde::Serialize;
use specta::Type;
use zbus::proxy;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.OpenWindows",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/OpenWindows"
)]
trait Kestrel {
    fn list(&self) -> zbus::Result<HashMap<String, Vec<(u32, String, bool)>>>;

    #[zbus(signal)]
    fn changed(&self) -> zbus::Result<()>;
}

#[derive(Serialize, Clone, Type)]
pub struct Window {
    pub pid: u32,
    pub title: String,
    pub responding: bool,
}

pub struct Windowed(HashMap<String, Vec<Window>>);

impl Windowed {
    pub fn apps(&self) -> impl Iterator<Item = (&str, &[Window])> {
        self.0
            .iter()
            .map(|(app, windows)| (app.as_str(), windows.as_slice()))
    }
}

impl From<HashMap<String, Vec<(u32, String, bool)>>> for Windowed {
    fn from(listed: HashMap<String, Vec<(u32, String, bool)>>) -> Self {
        Self(
            listed
                .into_iter()
                .map(|(app, windows)| {
                    let windows = windows
                        .into_iter()
                        .map(|(pid, title, responding)| Window {
                            pid,
                            title,
                            responding,
                        })
                        .collect();
                    (app, windows)
                })
                .collect(),
        )
    }
}

/// The windows Kestrel shows, by app, kept current from its change signal.
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
