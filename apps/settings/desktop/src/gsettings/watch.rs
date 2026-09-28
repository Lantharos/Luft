use std::cell::RefCell;
use std::collections::HashSet;
use std::sync::{Arc, Mutex};

use gio::glib;
use gio::prelude::*;
use luft_app::Events;
use serde::Serialize;

use super::{Location, open};

pub const SETTINGS_CHANGED: &str = "settings.changed";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Change {
    schema: String,
    path: Option<String>,
    key: String,
    value: serde_json::Value,
}

thread_local! {
    static WATCHED: RefCell<Vec<gio::Settings>> = const { RefCell::new(Vec::new()) };
}

#[derive(Clone)]
pub struct Watcher {
    context: glib::MainContext,
    watching: Arc<Mutex<HashSet<Location>>>,
}

impl Watcher {
    pub fn start() -> Self {
        let context = glib::MainContext::new();
        let thread_context = context.clone();
        std::thread::Builder::new()
            .name("settings-watch".into())
            .spawn(move || {
                thread_context
                    .with_thread_default(|| glib::MainLoop::new(Some(&thread_context), false).run())
                    .expect("the settings watcher owns its main context");
            })
            .expect("the settings watcher thread starts");
        Self {
            context,
            watching: Arc::default(),
        }
    }

    pub fn watch(&self, location: Location, events: Events) -> Result<(), String> {
        open(&location)?;
        if !self
            .watching
            .lock()
            .map_err(|error| error.to_string())?
            .insert(location.clone())
        {
            return Ok(());
        }
        self.context.invoke(move || {
            let Ok(settings) = open(&location) else {
                return;
            };
            settings.connect_changed(None, move |settings, key| {
                events.emit(
                    SETTINGS_CHANGED,
                    Change {
                        schema: location.schema.clone(),
                        path: location.path.clone(),
                        key: key.to_owned(),
                        value: super::value::to_json(&settings.value(key)),
                    },
                );
            });
            WATCHED.with(|watched| watched.borrow_mut().push(settings));
        });
        Ok(())
    }
}
