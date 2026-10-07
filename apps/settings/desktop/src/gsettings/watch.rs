use std::cell::RefCell;
use std::collections::HashMap;

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
    static WATCHED: RefCell<HashMap<Location, gio::Settings>> = RefCell::default();
}

#[derive(Clone)]
pub struct Watcher {
    context: glib::MainContext,
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
        Self { context }
    }

    pub fn watch(&self, location: Location, events: Events) -> Result<(), String> {
        let (watching, watched) = std::sync::mpsc::sync_channel(1);
        self.context.invoke(move || {
            let _ = watching.send(WATCHED.with(|watched| {
                if watched.borrow().contains_key(&location) {
                    return Ok(());
                }
                let settings = open(&location)?;
                connect(&settings, location.clone(), events);
                watched.borrow_mut().insert(location, settings);
                Ok(())
            }));
        });
        watched
            .recv()
            .map_err(|_| "The settings watcher stopped".to_owned())?
    }
}

fn connect(settings: &gio::Settings, location: Location, events: Events) {
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
}
