use luft_app::dbus;
use luft_i18n::t;
use luft_software::progress::Change;

use super::super::state::{Activity, Elsewhere, UpdateKind};
use crate::L10N;

const SETTINGS: &str = "settings";

async fn process_of(sender: &str) -> Option<u32> {
    dbus::system()
        .await
        .ok()?
        .call_method(
            Some("org.freedesktop.DBus"),
            "/org/freedesktop/DBus",
            Some("org.freedesktop.DBus"),
            "GetConnectionUnixProcessID",
            &(sender,),
        )
        .await
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
        _ => return Some(t!(L10N, "desktop-updates-another-app")),
    };
    Some(name.into())
}

pub async fn sent_by(sender: &str) -> Option<String> {
    process_of(sender)
        .await
        .and_then(command)
        .and_then(|command| display_name(&command))
}

pub fn activity(by: Option<String>, change: Option<Change>) -> Activity {
    let kind = match (&by, change) {
        (None, Some(Change::Refresh)) => UpdateKind::Check,
        (None, Some(Change::Download)) => UpdateKind::Download,
        _ => UpdateKind::Elsewhere,
    };
    Activity {
        elsewhere: (kind == UpdateKind::Elsewhere).then_some(Elsewhere { by, change }),
        ..Activity::new(kind)
    }
}
