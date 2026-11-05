use std::sync::Arc;

use luft_app::shortcuts::{Bound, Event, GlobalShortcuts, Shortcut};
use parking_lot::Mutex;
use serde::Serialize;
use specta::Type;

use super::STOP_ALL;
use crate::APP_ID;
use crate::L10N;

#[derive(Clone, Serialize, Type)]
pub struct Hotkey {
    pub id: String,
    pub keys: Option<String>,
}

/// The app's session with the desktop's shortcuts. It stays empty where the desktop has none to offer.
#[derive(Clone, Default)]
pub struct Hotkeys {
    session: Arc<Mutex<Option<Arc<GlobalShortcuts>>>>,
}

fn triggers(bound: Vec<Bound>) -> Vec<Hotkey> {
    bound
        .into_iter()
        .map(|bound| Hotkey {
            id: bound.id,
            keys: bound.trigger,
        })
        .collect()
}

impl Hotkeys {
    pub async fn open(&self, handle: impl FnMut(Event) + Send + 'static) -> Result<(), String> {
        let session = Arc::new(GlobalShortcuts::open(APP_ID).await?);
        *self.session.lock() = Some(session.clone());
        luft_app::spawn(async move {
            let _ = session.listen(handle).await;
        });
        Ok(())
    }

    pub fn available(&self) -> bool {
        self.session.lock().is_some()
    }

    pub async fn bind(&self, sounds: &[(String, String)]) -> Result<Vec<Hotkey>, String> {
        let Some(session) = self.session.lock().clone() else {
            return Ok(Vec::new());
        };
        let stop_all = luft_i18n::t!(L10N, "stop-all");
        let shortcuts: Vec<Shortcut<'_>> = sounds
            .iter()
            .map(|(id, name)| Shortcut {
                id,
                description: name,
            })
            .chain([Shortcut {
                id: STOP_ALL,
                description: &stop_all,
            }])
            .collect();
        session.bind(&shortcuts).await.map(triggers)
    }

    pub async fn configure(&self) -> Result<(), String> {
        let session = self
            .session
            .lock()
            .clone()
            .ok_or_else(|| luft_i18n::t!(L10N, "error-no-hotkeys"))?;
        session.configure().await
    }
}

pub fn changed(bound: Vec<Bound>) -> Vec<Hotkey> {
    triggers(bound)
}
