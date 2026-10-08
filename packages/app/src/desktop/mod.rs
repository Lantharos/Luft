pub mod palette;
pub mod typography;

use zbus::blocking::Proxy;
use zbus::zvariant::OwnedValue;

use crate::bridge::events::Events;
use crate::dbus;

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
            let Ok((namespace, key, _)) =
                signal.body().deserialize::<(String, String, OwnedValue)>()
            else {
                continue;
            };
            if typography::changed(&namespace, &key) {
                events.emit(
                    typography::TYPOGRAPHY_CHANGED,
                    typography::Typography::read(&proxy),
                );
            }
        }
    });
}
