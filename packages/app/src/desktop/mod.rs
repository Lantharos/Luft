pub mod scheme;
pub mod typography;

use zbus::blocking::Proxy;
use zbus::zvariant::OwnedValue;

use crate::dbus;
use crate::events::Events;

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::session()?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.Settings",
    )
    .map_err(|error| error.to_string())
}

fn read(proxy: &Proxy, namespace: &str, key: &str) -> Option<OwnedValue> {
    proxy.call("ReadOne", &(namespace, key)).ok()
}

pub fn watch(events: Events) {
    std::thread::spawn(move || {
        let Ok(proxy) = proxy() else {
            return;
        };
        let Ok(signals) = proxy.receive_signal("SettingChanged") else {
            return;
        };
        for signal in signals {
            let Ok((namespace, key, value)) =
                signal.body().deserialize::<(String, String, OwnedValue)>()
            else {
                continue;
            };
            if scheme::changed(&namespace, &key) {
                if let Some(scheme) = scheme::Scheme::from_portal(value) {
                    events.emit(scheme::SCHEME_CHANGED, scheme);
                }
            } else if typography::changed(&namespace, &key) {
                events.emit(
                    typography::TYPOGRAPHY_CHANGED,
                    typography::Typography::read(&proxy),
                );
            }
        }
    });
}
