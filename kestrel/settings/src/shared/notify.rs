use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};

use futures_util::StreamExt;
use zbus::fdo::DBusProxy;
use zbus::zvariant::Value;
use zbus::{Connection, proxy};

pub const URGENCY_NORMAL: u8 = 1;
pub const URGENCY_CRITICAL: u8 = 2;
const SETTINGS_APP: &str = "com.lantharos.settings";

static LAUNCHES: AtomicU32 = AtomicU32::new(0);

#[proxy(
    interface = "org.freedesktop.Notifications",
    default_service = "org.freedesktop.Notifications",
    default_path = "/org/freedesktop/Notifications"
)]
pub trait Notifications {
    #[allow(clippy::too_many_arguments)]
    fn notify(
        &self,
        app_name: &str,
        replaces_id: u32,
        app_icon: &str,
        summary: &str,
        body: &str,
        actions: &[&str],
        hints: HashMap<&str, Value<'_>>,
        expire_timeout: i32,
    ) -> zbus::Result<u32>;

    fn close_notification(&self, id: u32) -> zbus::Result<()>;

    #[zbus(signal)]
    fn action_invoked(&self, id: u32, action_key: String) -> zbus::Result<()>;
}

pub struct Notification<'a> {
    pub app: &'a str,
    pub icon: &'a str,
    pub summary: &'a str,
    pub body: &'a str,
    pub actions: &'a [(&'a str, &'a str)],
    pub urgency: u8,
    pub transient: bool,
}

impl Notification<'_> {
    pub async fn show(&self, session: &Connection, replaces: u32) -> zbus::Result<u32> {
        let actions: Vec<&str> = self
            .actions
            .iter()
            .flat_map(|(key, label)| [*key, *label])
            .collect();
        let mut hints = HashMap::from([
            ("desktop-entry", Value::from(SETTINGS_APP)),
            ("urgency", Value::from(self.urgency)),
        ]);
        if self.transient {
            hints.insert("transient", Value::from(true));
        }
        NotificationsProxy::new(session)
            .await?
            .notify(
                self.app,
                replaces,
                self.icon,
                self.summary,
                self.body,
                &actions,
                hints,
                -1,
            )
            .await
    }
}

pub async fn server_ready(session: &Connection) -> zbus::Result<()> {
    let notifications = NotificationsProxy::new(session).await?;
    let mut owners = notifications.inner().receive_owner_changed().await?;
    let present = DBusProxy::new(session)
        .await?
        .name_has_owner(notifications.inner().destination().as_ref())
        .await?;
    if !present {
        while owners.next().await.is_some_and(|owner| owner.is_none()) {}
    }
    Ok(())
}

pub async fn close(session: &Connection, id: u32) {
    let closed = async {
        NotificationsProxy::new(session)
            .await?
            .close_notification(id)
            .await
    };
    if let Err(error) = closed.await {
        eprintln!("Couldn't withdraw a notification: {error}");
    }
}

pub fn open_settings(page: &str) {
    launch(
        SETTINGS_APP,
        &["gio", "open", &format!("kestrel-settings:{page}")],
    );
}

pub fn launch(app: &str, command: &[&str]) {
    let launch = LAUNCHES.fetch_add(1, Ordering::Relaxed);
    let unit = format!(
        "--unit=app-kestrel-{app}-{}{launch}.scope",
        std::process::id()
    );
    let launched = tokio::process::Command::new("systemd-run")
        .args([
            "--user",
            "--scope",
            "--collect",
            "--quiet",
            "--slice=app.slice",
            &unit,
            "--",
        ])
        .args(command)
        .spawn();
    if let Err(error) = launched {
        eprintln!("Couldn't start {app}: {error}");
    }
}
