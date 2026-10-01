use futures_util::StreamExt;
use tzf_rs::EmbeddedFinder;
use zbus::{Connection, proxy};

use crate::context::Context;
use crate::shared::location::{self, Coordinates};
use crate::shared::notify::{self, Notification, NotificationsProxy, URGENCY_NORMAL};
use crate::shared::settings::Schemas;
use crate::shared::system::LoginProxy;

const DATETIME: &str = "org.gnome.desktop.datetime";
const LOCATION: &str = "org.gnome.system.location";
const DESKTOP_ID: &str = "gnome-datetime-panel";
const SETTINGS_ACTION: &str = "settings";

#[proxy(
    interface = "org.freedesktop.timedate1",
    default_service = "org.freedesktop.timedate1",
    default_path = "/org/freedesktop/timedate1"
)]
trait Timedate {
    fn set_timezone(&self, timezone: &str, interactive: bool) -> zbus::Result<()>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(mut settings) = context.settings.watch(&[DATETIME, LOCATION]).await else {
        return Ok(());
    };
    let mut resumes = LoginProxy::new(&context.system)
        .await?
        .receive_prepare_for_sleep()
        .await?;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let (session, system) = (context.session.clone(), context.system.clone());
    tokio::spawn(async move {
        let mut notification = 0;
        let mut follow = true;
        loop {
            if follow && automatic(&settings) {
                notification = follow_location(&session, &system, &settings, notification).await;
            }
            follow = tokio::select! {
                (_, key) = settings.changed() => key == "automatic-timezone" || key == "enabled",
                Some(signal) = resumes.next() => signal.args().is_ok_and(|args| !args.start),
                Some(action) = actions.next() => {
                    if action.args().is_ok_and(|args| args.id == notification && args.action_key == SETTINGS_ACTION) {
                        notify::open_settings("datetime");
                    }
                    false
                }
            };
        }
    });
    Ok(())
}

fn automatic(settings: &Schemas) -> bool {
    settings.get(DATETIME, "automatic-timezone") && settings.get(LOCATION, "enabled")
}

async fn follow_location(
    session: &Connection,
    system: &Connection,
    settings: &Schemas,
    notification: u32,
) -> u32 {
    let coordinates = match location::locate(system, DESKTOP_ID).await {
        Ok(coordinates) => coordinates,
        Err(error) => {
            eprintln!("Couldn't find the location for the time zone: {error}");
            return notification;
        }
    };
    let Ok(Some(zone)) = tokio::task::spawn_blocking(move || zone_at(coordinates)).await else {
        return notification;
    };
    if location::timezone().as_deref() == Some(zone.as_str()) || !automatic(settings) {
        return notification;
    }
    let changed = async {
        TimedateProxy::new(system)
            .await?
            .set_timezone(&zone, false)
            .await
    };
    if let Err(error) = changed.await {
        eprintln!("Couldn't change the time zone to {zone}: {error}");
        return notification;
    }
    announce(session, &zone, notification).await
}

fn zone_at(at: Coordinates) -> Option<String> {
    let zone = EmbeddedFinder::new()
        .get_tz_name(at.longitude, at.latitude)
        .to_owned();
    std::path::Path::new("/usr/share/zoneinfo")
        .join(&zone)
        .is_file()
        .then_some(zone)
}

async fn announce(session: &Connection, zone: &str, replaces: u32) -> u32 {
    let city = zone.rsplit('/').next().unwrap_or(zone).replace('_', " ");
    let now = glib::TimeZone::from_identifier(Some(zone))
        .and_then(|zone| glib::DateTime::now(&zone).ok());
    let offset = now
        .and_then(|now| now.format("%Z, UTC%:::z").ok())
        .map(|offset| format!(" ({offset})"))
        .unwrap_or_default();
    let body = format!("Clocks now follow {city} time{offset}.");
    let shown = Notification {
        app: "Date & Time",
        icon: "preferences-system-time-symbolic",
        summary: "Time zone updated",
        body: &body,
        actions: &[(SETTINGS_ACTION, "Settings")],
        urgency: URGENCY_NORMAL,
        transient: false,
    }
    .show(session, replaces)
    .await;
    shown.unwrap_or_else(|error| {
        eprintln!("Couldn't announce the new time zone: {error}");
        replaces
    })
}
