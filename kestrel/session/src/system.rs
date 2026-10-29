use std::collections::HashMap;

use luft_dbus_macros::introspect;
use zbus::OwnedObjectPath;
use zbus::fdo::DBusProxy;
use zbus::{Connection, proxy};

const SESSION_TARGET: &str = "kestrel-session.target";
const UNAVAILABLE: u32 = 0;
const CHALLENGE: u32 = 2;
const AVAILABLE: u32 = 3;

#[derive(Clone, Copy)]
pub enum Power {
    Off,
    Reboot,
    Suspend,
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Login {
    fn can_power_off(&self) -> zbus::Result<String>;
    fn can_reboot(&self) -> zbus::Result<String>;
    fn can_suspend(&self) -> zbus::Result<String>;
    fn power_off(&self, interactive: bool) -> zbus::Result<()>;
    fn reboot(&self, interactive: bool) -> zbus::Result<()>;
    fn suspend(&self, interactive: bool) -> zbus::Result<()>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.systemd1.Manager",
    default_service = "org.freedesktop.systemd1",
    default_path = "/org/freedesktop/systemd1"
)]
trait Systemd {
    fn stop_unit(&self, name: &str, mode: &str) -> zbus::Result<OwnedObjectPath>;

    #[zbus(no_autostart)]
    fn set_environment(&self, assignments: &[String]) -> zbus::Result<()>;
}

/// Whether logind lets you take a power action, in the session manager's
/// terms.
pub async fn availability(system: &Connection, action: Power) -> zbus::Result<u32> {
    let login = LoginProxy::new(system).await?;
    let answer = match action {
        Power::Off => login.can_power_off().await?,
        Power::Reboot => login.can_reboot().await?,
        Power::Suspend => login.can_suspend().await?,
    };
    Ok(match answer.as_str() {
        "yes" => AVAILABLE,
        "challenge" => CHALLENGE,
        _ => UNAVAILABLE,
    })
}

pub async fn perform(system: &Connection, action: Power) -> zbus::Result<()> {
    let login = LoginProxy::new(system).await?;
    match action {
        Power::Off => login.power_off(true).await,
        Power::Reboot => login.reboot(true).await,
        Power::Suspend => login.suspend(true).await,
    }
}

pub async fn stop_session(session: &Connection) -> zbus::Result<()> {
    SystemdProxy::new(session)
        .await?
        .stop_unit(SESSION_TARGET, "replace")
        .await
        .map(drop)
}

/// Shares a variable with everything the session starts from now on, through
/// D-Bus activation and systemd.
pub async fn export_environment(session: &Connection, name: &str, value: &str) {
    let shared = async {
        DBusProxy::new(session)
            .await?
            .update_activation_environment(HashMap::from([(name, value)]))
            .await?;
        SystemdProxy::new(session)
            .await?
            .set_environment(&[format!("{name}={value}")])
            .await
    };
    if let Err(error) = shared.await {
        eprintln!("Could not share {name} with the session: {error}");
    }
}
