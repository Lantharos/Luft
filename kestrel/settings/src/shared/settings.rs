use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};

use gio::prelude::*;
use glib::Variant;
use glib::variant::{FromVariant, ToVariant};
use tokio::sync::{mpsc, oneshot};

thread_local! {
    static OPEN: RefCell<HashMap<u64, Vec<gio::Settings>>> = RefCell::default();
}

static NEXT_GROUP: AtomicU64 = AtomicU64::new(1);

type Change = (&'static str, String, Variant);
type Values = HashMap<(&'static str, String), Variant>;

#[derive(Clone)]
pub struct Settings {
    context: glib::MainContext,
}

pub struct Schemas {
    group: u64,
    context: glib::MainContext,
    values: Values,
    changes: mpsc::UnboundedReceiver<Change>,
}

impl Settings {
    pub fn start() -> Self {
        let context = glib::MainContext::new();
        let thread_context = context.clone();
        std::thread::Builder::new()
            .name("gsettings".into())
            .spawn(move || {
                thread_context
                    .with_thread_default(|| {
                        glib::MainLoop::new(Some(&thread_context), false).run();
                    })
                    .expect("the settings thread owns its main context");
            })
            .expect("the settings thread starts");
        Self { context }
    }

    pub async fn watch(&self, ids: &[&'static str]) -> Option<Schemas> {
        let group = NEXT_GROUP.fetch_add(1, Ordering::Relaxed);
        let ids = ids.to_vec();
        let (reply, opened) = oneshot::channel();
        let (sender, changes) = mpsc::unbounded_channel();
        self.context.invoke(move || {
            let _ = reply.send(open(group, &ids, &sender));
        });
        let values = match opened.await {
            Ok(Ok(values)) => values,
            Ok(Err(missing)) => {
                eprintln!("The settings schema {missing} isn't installed");
                return None;
            }
            Err(_) => return None,
        };
        Some(Schemas {
            group,
            context: self.context.clone(),
            values,
            changes,
        })
    }
}

fn open(
    group: u64,
    ids: &[&'static str],
    sender: &mpsc::UnboundedSender<Change>,
) -> Result<Values, &'static str> {
    let source = gio::SettingsSchemaSource::default().ok_or(ids[0])?;
    let mut values = Values::new();
    let mut opened = Vec::with_capacity(ids.len());
    for &id in ids {
        let schema = source.lookup(id, true).ok_or(id)?;
        let settings = gio::Settings::new_full(&schema, None::<&gio::SettingsBackend>, None);
        for key in schema.list_keys() {
            values.insert((id, key.to_string()), settings.value(&key));
        }
        let sender = sender.clone();
        settings.connect_changed(None, move |settings, key| {
            let _ = sender.send((id, key.to_owned(), settings.value(key)));
        });
        opened.push(settings);
    }
    OPEN.with_borrow_mut(|open| open.insert(group, opened));
    Ok(values)
}

impl Schemas {
    pub fn get<T: FromVariant + Default>(&self, schema: &'static str, key: &str) -> T {
        self.values
            .get(&(schema, key.to_owned()))
            .and_then(Variant::get)
            .unwrap_or_else(|| {
                eprintln!("{schema} has no {key} setting of the expected type");
                T::default()
            })
    }

    pub async fn changed(&mut self) -> (&'static str, String) {
        let Some((schema, key, value)) = self.changes.recv().await else {
            return std::future::pending().await;
        };
        self.values.insert((schema, key.clone()), value);
        (schema, key)
    }

    pub fn set(&self, schema: &'static str, key: &str, value: impl ToVariant) {
        let (group, key, value) = (self.group, key.to_owned(), value.to_variant());
        self.context.invoke(move || {
            OPEN.with_borrow(|open| {
                let settings = open[&group]
                    .iter()
                    .find(|settings| settings.schema_id().as_deref() == Some(schema));
                if let Some(Err(error)) = settings.map(|settings| settings.set_value(&key, &value))
                {
                    eprintln!("Couldn't change the {key} setting: {error}");
                }
            });
        });
    }

    pub async fn is_user_set(&self, schema: &'static str, key: &str) -> bool {
        let group = self.group;
        let key = key.to_owned();
        let (reply, answer) = oneshot::channel();
        self.context.invoke(move || {
            OPEN.with_borrow(|open| {
                let user_set = open[&group]
                    .iter()
                    .find(|settings| settings.schema_id().as_deref() == Some(schema))
                    .is_some_and(|settings| settings.user_value(&key).is_some());
                let _ = reply.send(user_set);
            });
        });
        answer.await.unwrap_or(false)
    }
}

impl Drop for Schemas {
    fn drop(&mut self) {
        let group = self.group;
        self.context.invoke(move || {
            OPEN.with_borrow_mut(|open| open.remove(&group));
        });
    }
}
