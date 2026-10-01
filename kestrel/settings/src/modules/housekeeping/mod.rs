mod disk_space;
mod mounts;
mod temp;
mod thumbnails;
mod trash;

use std::path::{Path, PathBuf};
use std::time::Duration;

use futures_util::StreamExt;
use tokio::time::{Instant, interval, interval_at, sleep_until};
use zbus::Connection;

use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, URGENCY_CRITICAL};
use crate::shared::settings::Schemas;
use disk_space::{DiskSpace, Low};

const PRIVACY: &str = "org.gnome.desktop.privacy";
const THUMBNAILS: &str = "org.gnome.desktop.thumbnail-cache";
const SETTLE: Duration = Duration::from_secs(2 * 60);
const DAILY: Duration = Duration::from_secs(24 * 60 * 60);
const HOURLY: Duration = Duration::from_secs(60 * 60);
const DISK_CHECK: Duration = Duration::from_secs(60);
const DISK_ANALYZER: &str = "org.gnome.baobab.desktop";

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(mut settings) = context.settings.watch(&[PRIVACY, THUMBNAILS]).await else {
        return Ok(());
    };
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let session = context.session.clone();
    tokio::spawn(async move {
        let mut disk_space = DiskSpace::default();
        let mut warning = 0;
        let mut warned_path = PathBuf::new();
        let mut thumbnails_due = Some(Instant::now() + SETTLE);
        let mut temp_due = Some(Instant::now() + SETTLE);
        let mut daily = interval_at(Instant::now() + DAILY, DAILY);
        let mut hourly = interval_at(Instant::now() + HOURLY, HOURLY);
        let mut disk_check = interval(DISK_CHECK);
        loop {
            tokio::select! {
                (schema, _) = settings.changed() => {
                    let due = Some(Instant::now() + SETTLE);
                    if schema == THUMBNAILS {
                        thumbnails_due = due;
                    } else {
                        temp_due = due;
                    }
                }
                () = sleep_until(thumbnails_due.unwrap_or_else(Instant::now)), if thumbnails_due.is_some() => {
                    thumbnails_due = None;
                    purge_thumbnails(&settings).await;
                }
                () = sleep_until(temp_due.unwrap_or_else(Instant::now)), if temp_due.is_some() => {
                    temp_due = None;
                    purge_temp(&settings).await;
                }
                _ = daily.tick() => {
                    purge_thumbnails(&settings).await;
                    purge_temp(&settings).await;
                }
                _ = hourly.tick() => purge_trash(&settings).await,
                _ = disk_check.tick() => {
                    if let Some(low) = disk_space.check() {
                        warned_path = low.path.clone();
                        warning = warn(&session, &low, warning).await;
                    }
                }
                Some(action) = actions.next() => {
                    let Ok(args) = action.args() else { continue };
                    if args.id != warning {
                        continue;
                    }
                    match args.action_key.as_str() {
                        "examine" => {
                            let analyzer = analyzer_path();
                            notify::launch("org.gnome.baobab", &["gio", "launch", &analyzer.to_string_lossy(), &warned_path.to_string_lossy()]);
                        }
                        "empty-trash" => {
                            let _ = tokio::task::spawn_blocking(|| trash::empty(&trash::directories())).await;
                        }
                        _ => {}
                    }
                }
            }
        }
    });
    Ok(())
}

async fn purge_thumbnails(settings: &Schemas) {
    let (age, size) = (
        settings.get::<i32>(THUMBNAILS, "maximum-age"),
        settings.get::<i32>(THUMBNAILS, "maximum-size"),
    );
    let _ = tokio::task::spawn_blocking(move || thumbnails::purge(age, size)).await;
}

async fn purge_trash(settings: &Schemas) {
    if !settings.get::<bool>(PRIVACY, "remove-old-trash-files") {
        return;
    }
    let days = settings.get::<u32>(PRIVACY, "old-files-age");
    let Ok(cutoff) = glib::DateTime::now_local().and_then(|now| now.add_days(-(days as i32)))
    else {
        return;
    };
    let _ = tokio::task::spawn_blocking(move || trash::purge(&trash::directories(), &cutoff)).await;
}

async fn purge_temp(settings: &Schemas) {
    if !settings.get::<bool>(PRIVACY, "remove-old-temp-files") {
        return;
    }
    let days = settings.get::<u32>(PRIVACY, "old-files-age");
    let changed_before = glib::real_time() / 1_000_000 - i64::from(days) * 24 * 60 * 60;
    let _ = tokio::task::spawn_blocking(move || temp::purge(&temp::directories(), changed_before))
        .await;
}

fn analyzer_path() -> PathBuf {
    std::iter::once(glib::user_data_dir())
        .chain(glib::system_data_dirs())
        .map(|directory| directory.join("applications").join(DISK_ANALYZER))
        .find(|path| path.exists())
        .unwrap_or_default()
}

async fn warn(session: &Connection, low: &Low, replaces: u32) -> u32 {
    let free = disk_space::format_size(low.free_bytes);
    let has_trash = trash::directories()
        .iter()
        .any(|directory| trash::holds_items(directory));
    let (summary, mut body) = if low.among_several {
        let name = volume_name(&low.path);
        (
            format!("Low disk space on {name}"),
            format!("{name} has only {free} left."),
        )
    } else {
        (
            "Low disk space".to_owned(),
            format!("This computer has only {free} left."),
        )
    };
    let mut actions = Vec::new();
    if analyzer_path().exists() {
        actions.push(("examine", "Examine"));
    }
    if has_trash {
        body.push_str(" Emptying the trash can free some up.");
        actions.push(("empty-trash", "Empty Trash"));
    }
    let shown = Notification {
        app: "Disk Space",
        icon: "drive-harddisk-symbolic",
        summary: &summary,
        body: &body,
        actions: &actions,
        urgency: URGENCY_CRITICAL,
        transient: true,
    }
    .show(session, replaces)
    .await;
    shown.unwrap_or_else(|error| {
        eprintln!("Couldn't warn about low disk space: {error}");
        replaces
    })
}

fn volume_name(path: &Path) -> String {
    path.file_name().map_or_else(
        || "The system disk".to_owned(),
        |name| name.to_string_lossy().into_owned(),
    )
}
