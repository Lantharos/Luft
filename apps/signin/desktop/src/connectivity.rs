use luft_app::{Events, dbus};
use zbus::blocking::Proxy;

const SERVICE: &str = "org.freedesktop.NetworkManager";
const PATH: &str = "/org/freedesktop/NetworkManager";
const FULL: u32 = 4;
const ONLINE: &str = "signin.online";

fn network_manager() -> Option<Proxy<'static>> {
    let connection = dbus::system().ok()?;
    Proxy::new(connection, SERVICE, PATH, SERVICE).ok()
}

pub fn watch(events: Events) {
    std::thread::spawn(move || {
        let Some(manager) = network_manager() else {
            return;
        };
        let changes = manager.receive_property_changed::<u32>("Connectivity");
        if manager.get_property::<u32>("Connectivity") == Ok(FULL) {
            events.emit(ONLINE, ());
        }
        for change in changes {
            if change.get() == Ok(FULL) {
                events.emit(ONLINE, ());
            }
        }
    });
}

pub fn check(events: &Events) {
    let events = events.clone();
    std::thread::spawn(move || {
        let connectivity = network_manager()
            .and_then(|manager| manager.call::<_, _, u32>("CheckConnectivity", &()).ok());
        if connectivity == Some(FULL) {
            events.emit(ONLINE, ());
        }
    });
}
