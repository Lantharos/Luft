use std::path::PathBuf;

use luft_i18n::t;
use serde::Deserialize;
use zbus::{Connection, proxy};

use crate::L10N;
use crate::shared::notify::{Notification, URGENCY_NORMAL};

const TOLD: &str = "luft/windows-read-only";

#[proxy(
    interface = "com.lantharos.Windows1",
    default_service = "com.lantharos.Windows1",
    default_path = "/com/lantharos/Windows1"
)]
trait Windows {
    fn drives(&self) -> zbus::Result<String>;
}

#[derive(Deserialize)]
struct Drive {
    hibernated: bool,
}

pub async fn hibernated(system: &Connection) -> zbus::Result<bool> {
    let listed = WindowsProxy::new(system).await?.drives().await?;
    let drives: Vec<Drive> =
        serde_json::from_str(&listed).map_err(|error| zbus::Error::Failure(error.to_string()))?;
    Ok(drives.iter().any(|drive| drive.hibernated))
}

fn told() -> PathBuf {
    glib::user_state_dir().join(TOLD)
}

pub async fn tell_read_only(session: &Connection) {
    let told = told();
    if told.exists() {
        return;
    }
    let shown = Notification {
        app: "Windows",
        icon: "drive-harddisk-symbolic",
        summary: &t!(L10N, "drives-windows-read-only-title"),
        body: &t!(L10N, "drives-windows-read-only"),
        actions: &[],
        urgency: URGENCY_NORMAL,
        transient: false,
    }
    .show(session, 0)
    .await;
    let remembered = shown.map_err(|error| error.to_string()).and_then(|_| {
        std::fs::create_dir_all(told.parent().expect("state lives in a folder"))
            .and_then(|()| std::fs::write(&told, ""))
            .map_err(|error| error.to_string())
    });
    if let Err(error) = remembered {
        eprintln!("Couldn't tell that Windows' drive is read-only: {error}");
    }
}

pub fn forget_read_only() {
    let _ = std::fs::remove_file(told());
}
