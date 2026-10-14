use luft_app::dbus;
use luft_software::progress::Change;

use super::backend;
use super::overview;
use super::state::{Activity, Elsewhere, Kind};

const SETTINGS: &str = "settings";

pub fn finished() {
    overview::reload();
    backend::current().scan();
}

fn process_of(sender: &str) -> Option<u32> {
    dbus::system()
        .ok()?
        .call_method(
            Some("org.freedesktop.DBus"),
            "/org/freedesktop/DBus",
            Some("org.freedesktop.DBus"),
            "GetConnectionUnixProcessID",
            &(sender,),
        )
        .and_then(|reply| reply.body().deserialize())
        .ok()
}

pub fn command(pid: u32) -> Option<String> {
    std::fs::read_to_string(format!("/proc/{pid}/comm"))
        .ok()
        .map(|command| command.trim().to_owned())
}

pub fn display_name(command: &str) -> Option<String> {
    let name = match command {
        SETTINGS => return None,
        "schelf" => "Schelf",
        "dnf" | "dnf5" => "dnf",
        "pkcon" => "pkcon",
        "gnome-software" => "GNOME Software",
        "plasma-discover" => "Discover",
        _ => "another app",
    };
    Some(name.into())
}

pub fn sent_by(sender: &str) -> Option<String> {
    process_of(sender)
        .and_then(command)
        .and_then(|command| display_name(&command))
}

pub fn activity(by: Option<String>, change: Option<Change>) -> Activity {
    let kind = match (&by, change) {
        (None, Some(Change::Refresh)) => Kind::Check,
        (None, Some(Change::Download)) => Kind::Download,
        _ => Kind::Elsewhere,
    };
    Activity {
        elsewhere: (kind == Kind::Elsewhere).then_some(Elsewhere { by, change }),
        ..Activity::new(kind)
    }
}
