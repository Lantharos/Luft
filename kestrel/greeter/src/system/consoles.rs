use luft_dbus_macros::introspect;
use zbus::{Connection, OwnedObjectPath, proxy};

const TEXT_CONSOLES: [&str; 2] = ["getty@*.service", "kmsconvt@*.service"];
const RUNNING: [&str; 2] = ["active", "activating"];

type Unit = (
    String,
    String,
    String,
    String,
    String,
    String,
    OwnedObjectPath,
    u32,
    String,
    OwnedObjectPath,
);

#[introspect]
#[proxy(
    interface = "org.freedesktop.systemd1.Manager",
    default_service = "org.freedesktop.systemd1",
    default_path = "/org/freedesktop/systemd1"
)]
trait Systemd {
    fn list_units_by_patterns(&self, states: &[&str], patterns: &[&str])
    -> zbus::Result<Vec<Unit>>;

    fn stop_unit(&self, name: &str, mode: &str) -> zbus::Result<OwnedObjectPath>;
}

pub async fn close(connection: &Connection) -> zbus::Result<()> {
    let systemd = SystemdProxy::new(connection).await?;
    for (name, ..) in systemd
        .list_units_by_patterns(&RUNNING, &TEXT_CONSOLES)
        .await?
    {
        systemd.stop_unit(&name, "replace").await?;
    }
    Ok(())
}
