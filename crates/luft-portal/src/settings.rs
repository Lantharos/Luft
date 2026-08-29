use std::collections::HashMap;
use std::sync::Arc;

use ashpd::{
    PortalError,
    backend::settings::{SettingsImpl, SettingsSignalEmitter},
    desktop::settings::Namespace,
    zvariant::{OwnedValue, Value},
};

const APPEARANCE: &str = "org.freedesktop.appearance";
const GNOME_WM: &str = "org.gnome.desktop.wm.preferences";
const GNOME_INTERFACE: &str = "org.gnome.desktop.interface";

pub struct PortalSettings {
    values: HashMap<String, HashMap<String, OwnedValue>>,
    signal_emitter: Option<Arc<dyn SettingsSignalEmitter>>,
}

impl PortalSettings {
    pub fn new() -> Self {
        let mut appearance = HashMap::new();
        appearance.insert("color-scheme".to_string(), OwnedValue::from(1u32));
        appearance.insert("contrast".to_string(), OwnedValue::from(0u32));
        appearance.insert("reduced-motion".to_string(), OwnedValue::from(0u32));

        let mut wm_preferences = HashMap::new();
        wm_preferences.insert(
            "button-layout".to_string(),
            Value::from(":minimize,maximize,close")
                .try_into()
                .expect("portal string value"),
        );

        let mut interface = HashMap::new();
        interface.insert(
            "gtk-decoration-layout".to_string(),
            Value::from(":minimize,maximize,close")
                .try_into()
                .expect("portal string value"),
        );
        interface.insert("enable-animations".to_string(), OwnedValue::from(true));

        let mut values = HashMap::new();
        values.insert(APPEARANCE.to_string(), appearance);
        values.insert(GNOME_WM.to_string(), wm_preferences);
        values.insert(GNOME_INTERFACE.to_string(), interface);
        Self {
            values,
            signal_emitter: None,
        }
    }

    fn lookup(&self, namespace: &str, key: &str) -> Option<OwnedValue> {
        self.values.get(namespace)?.get(key).cloned()
    }

    fn namespace_matches(filter: &str, namespace: &str) -> bool {
        if filter.is_empty() {
            return true;
        }
        if let Some(prefix) = filter.strip_suffix(".*") {
            return namespace.starts_with(prefix);
        }
        filter == namespace
    }

    fn filtered(&self, namespaces: &[String]) -> HashMap<String, HashMap<String, OwnedValue>> {
        if namespaces.is_empty() || namespaces.iter().any(String::is_empty) {
            return self.values.clone();
        }

        self.values
            .iter()
            .filter(|(namespace, _)| {
                namespaces
                    .iter()
                    .any(|filter| Self::namespace_matches(filter, namespace))
            })
            .map(|(namespace, keys)| (namespace.clone(), keys.clone()))
            .collect()
    }
}

#[async_trait::async_trait]
impl SettingsImpl for PortalSettings {
    async fn read(&self, namespace: &str, key: &str) -> Result<OwnedValue, PortalError> {
        self.lookup(namespace, key)
            .ok_or_else(|| PortalError::NotFound(format!("unknown setting {namespace}::{key}")))
    }

    async fn read_all(
        &self,
        namespaces: Vec<String>,
    ) -> Result<HashMap<String, Namespace>, PortalError> {
        Ok(self.filtered(&namespaces))
    }

    fn set_signal_emitter(&mut self, signal_emitter: Arc<dyn SettingsSignalEmitter>) {
        self.signal_emitter = Some(signal_emitter);
    }
}
