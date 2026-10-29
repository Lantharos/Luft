use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use gio::prelude::*;
use luft_dbus_macros::introspect;
use tokio::sync::mpsc;
use zbus::Variant as Value;
use zbus::fdo::Properties;
use zbus::interface;
use zbus::names::InterfaceName;
use zbus::object_server::SignalEmitter;

use super::PATH;
use crate::context::Context;

struct Source {
    property: &'static str,
    schema: &'static str,
    key: &'static str,
    inverted: bool,
}

const SOURCES: [Source; 7] = [
    Source {
        property: "disable-printing",
        schema: "org.gnome.desktop.lockdown",
        key: "disable-printing",
        inverted: false,
    },
    Source {
        property: "disable-save-to-disk",
        schema: "org.gnome.desktop.lockdown",
        key: "disable-save-to-disk",
        inverted: false,
    },
    Source {
        property: "disable-application-handlers",
        schema: "org.gnome.desktop.lockdown",
        key: "disable-application-handlers",
        inverted: false,
    },
    Source {
        property: "disable-location",
        schema: "org.gnome.system.location",
        key: "enabled",
        inverted: true,
    },
    Source {
        property: "disable-camera",
        schema: "org.gnome.desktop.privacy",
        key: "disable-camera",
        inverted: false,
    },
    Source {
        property: "disable-microphone",
        schema: "org.gnome.desktop.privacy",
        key: "disable-microphone",
        inverted: false,
    },
    Source {
        property: "disable-sound-output",
        schema: "org.gnome.desktop.privacy",
        key: "disable-sound-output",
        inverted: false,
    },
];

const INTERFACE: InterfaceName<'static> =
    InterfaceName::from_static_str_unchecked("org.freedesktop.impl.portal.Lockdown");

type Values = Arc<Mutex<HashMap<&'static str, bool>>>;

thread_local! {
    static WATCHED: RefCell<Vec<gio::Settings>> = RefCell::default();
}

struct Lockdown {
    values: Values,
}

impl Lockdown {
    fn value(&self, property: &str) -> bool {
        self.values.lock().expect("lockdown values")[property]
    }
}

#[introspect]
#[interface(name = "org.freedesktop.impl.portal.Lockdown")]
impl Lockdown {
    #[zbus(property, name = "disable-printing")]
    fn disable_printing(&self) -> bool {
        self.value("disable-printing")
    }

    #[zbus(property, name = "disable-save-to-disk")]
    fn disable_save_to_disk(&self) -> bool {
        self.value("disable-save-to-disk")
    }

    #[zbus(property, name = "disable-application-handlers")]
    fn disable_application_handlers(&self) -> bool {
        self.value("disable-application-handlers")
    }

    #[zbus(property, name = "disable-location")]
    fn disable_location(&self) -> bool {
        self.value("disable-location")
    }

    #[zbus(property, name = "disable-camera")]
    fn disable_camera(&self) -> bool {
        self.value("disable-camera")
    }

    #[zbus(property, name = "disable-microphone")]
    fn disable_microphone(&self) -> bool {
        self.value("disable-microphone")
    }

    #[zbus(property, name = "disable-sound-output")]
    fn disable_sound_output(&self) -> bool {
        self.value("disable-sound-output")
    }
}

fn watch(changes: mpsc::UnboundedSender<(&'static str, bool)>) -> HashMap<&'static str, bool> {
    let mut opened: HashMap<&'static str, gio::Settings> = HashMap::new();
    let mut values = HashMap::new();
    for source in &SOURCES {
        let settings = opened
            .entry(source.schema)
            .or_insert_with(|| gio::Settings::new(source.schema))
            .clone();
        values.insert(
            source.property,
            settings.boolean(source.key) != source.inverted,
        );
        let changes = changes.clone();
        let (property, inverted) = (source.property, source.inverted);
        settings.connect_changed(Some(source.key), move |settings, key| {
            let _ = changes.send((property, settings.boolean(key) != inverted));
        });
    }
    WATCHED.with_borrow_mut(|watched| watched.extend(opened.into_values()));
    values
}

pub async fn serve(context: &Context) -> zbus::Result<()> {
    let (sender, mut changes) = mpsc::unbounded_channel();
    let values: Values = Arc::new(Mutex::new(context.gio.run(move || watch(sender)).await));
    let server = context.connection.object_server();
    server
        .at(
            PATH,
            Lockdown {
                values: values.clone(),
            },
        )
        .await?;
    let emitter = SignalEmitter::new(&context.connection, PATH)?.into_owned();
    tokio::spawn(async move {
        while let Some((property, value)) = changes.recv().await {
            values
                .lock()
                .expect("lockdown values")
                .insert(property, value);
            let changed = HashMap::from([(property, Value::from(value))]);
            let _ =
                Properties::properties_changed(&emitter, INTERFACE, changed, Cow::Borrowed(&[]))
                    .await;
        }
    });
    Ok(())
}
