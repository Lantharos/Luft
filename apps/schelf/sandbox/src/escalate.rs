use std::collections::HashMap;
use std::process::Command;
use std::time::Duration;

use futures_util::StreamExt;
use luft_i18n::t;
use zbus::{Connection, Proxy, Variant};

use crate::L10N;

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const SCHELF: &str = "com.lantharos.schelf";
const REVIEW: &str = "review";
const NEVER_EXPIRES: i32 = 0;
const ANSWER_WAIT: Duration = Duration::from_secs(10 * 60);

#[derive(Clone, Copy)]
pub enum Reason {
    Closed,
    Device,
}

/// Who is offered more access.
#[derive(Clone)]
pub struct Asking {
    pub id: String,
    pub name: String,
}

/// Tells you the app may need more than its sandbox allows, and opens
/// Schelf's full access confirmation for it when you ask.
pub async fn offer(connection: &Connection, app: &Asking, reason: Reason) {
    if let Err(error) = notify(connection, app, reason).await {
        eprintln!("Couldn't offer {} more access: {error}", app.id);
    }
}

pub fn offer_in_background(app: Asking, reason: Reason) {
    std::thread::spawn(move || {
        let Ok(runtime) = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        else {
            return;
        };
        runtime.block_on(async {
            if let Ok(connection) = Connection::session().await {
                offer(&connection, &app, reason).await;
            }
        });
    });
}

async fn notify(connection: &Connection, app: &Asking, reason: Reason) -> zbus::Result<()> {
    let notifications = Proxy::new(connection, NOTIFICATIONS, PATH, NOTIFICATIONS).await?;
    let mut invoked = notifications.receive_signal("ActionInvoked").await?;
    let mut closed = notifications.receive_signal("NotificationClosed").await?;
    let body = match reason {
        Reason::Closed => t!(L10N, "sandbox-closed-body"),
        Reason::Device => t!(L10N, "sandbox-device-body"),
    };
    let summary = t!(L10N, "sandbox-needs-more", app = app.name.as_str());
    let review = t!(L10N, "sandbox-review");
    let hints = HashMap::from([("desktop-entry", Variant::from(SCHELF))]);
    let id: u32 = notifications
        .call(
            "Notify",
            &(
                app.name.as_str(),
                0u32,
                app.id.as_str(),
                summary.as_str(),
                body.as_str(),
                vec![REVIEW, review.as_str()],
                hints,
                NEVER_EXPIRES,
            ),
        )
        .await?;
    let answer = async {
        loop {
            tokio::select! {
                Some(message) = invoked.next() => {
                    let (shown, action): (u32, String) = message.body().deserialize()?;
                    if shown == id {
                        return Ok::<bool, zbus::Error>(action == REVIEW);
                    }
                }
                Some(message) = closed.next() => {
                    let (shown, _): (u32, u32) = message.body().deserialize()?;
                    if shown == id {
                        return Ok(false);
                    }
                }
                else => return Ok(false),
            }
        }
    };
    if tokio::time::timeout(ANSWER_WAIT, answer)
        .await
        .unwrap_or(Ok(false))?
    {
        let _ = Command::new("gio")
            .arg("open")
            .arg(format!("schelf:full-access?{}", app.id))
            .status();
    }
    Ok(())
}
