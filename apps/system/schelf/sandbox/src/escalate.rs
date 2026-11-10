use std::collections::HashMap;
use std::process::Command;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use futures_util::StreamExt;
use luft_i18n::t;
use luft_identity::permissions::{self, CAMERA, MICROPHONE, Permission};
use zbus::{Connection, Proxy, Variant};

use crate::L10N;

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const SCHELF: &str = "com.lantharos.schelf";
const REVIEW: &str = "review";
const NEVER_EXPIRES: i32 = 0;
const ANSWER_WAIT: Duration = Duration::from_secs(10 * 60);

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum Reason {
    Closed,
    Device,
    Display,
    Microphone,
    Camera,
}

impl Reason {
    /// What you may have given the app since it started that settles this.
    fn settled_by(self) -> Option<&'static Permission> {
        match self {
            Self::Microphone => Some(&MICROPHONE),
            Self::Camera => Some(&CAMERA),
            Self::Closed | Self::Device | Self::Display => None,
        }
    }
}

/// Who is offered more access.
#[derive(Clone)]
pub struct Asking {
    pub id: String,
    pub name: String,
}

/// Tells you the app may need more than its sandbox allows, and opens
/// Schelf's full access confirmation for it when you ask, or its access
/// switches when all it looked for is one of them. Returns whether you
/// were told: not when you gave it what it looked for in the meantime.
pub async fn offer(connection: &Connection, app: &Asking, reason: Reason) -> bool {
    if let Some(permission) = reason.settled_by()
        && permissions::allowed(connection, permission, &app.id).await
    {
        return false;
    }
    match notify(connection, app, reason).await {
        Ok(()) => true,
        Err(error) => {
            eprintln!("Couldn't offer {} more access: {error}", app.id);
            false
        }
    }
}

/// The offers made while the app runs: one for each thing it looked for.
pub struct Offers {
    app: Asking,
    made: HashMap<Reason, Arc<AtomicBool>>,
}

impl Offers {
    pub fn new(app: Asking) -> Self {
        Self {
            app,
            made: HashMap::new(),
        }
    }

    /// Offers what `reason` needs, unless that was offered already.
    pub fn make(&mut self, reason: Reason) {
        let made = self.made.entry(reason).or_default().clone();
        if made.swap(true, Ordering::Relaxed) {
            return;
        }
        let app = self.app.clone();
        std::thread::spawn(move || {
            let told = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .is_ok_and(|runtime| {
                    runtime.block_on(async {
                        match Connection::session().await {
                            Ok(connection) => offer(&connection, &app, reason).await,
                            Err(_) => false,
                        }
                    })
                });
            made.store(told, Ordering::Relaxed);
        });
    }
}

async fn notify(connection: &Connection, app: &Asking, reason: Reason) -> zbus::Result<()> {
    let notifications = Proxy::new(connection, NOTIFICATIONS, PATH, NOTIFICATIONS).await?;
    let mut invoked = notifications.receive_signal("ActionInvoked").await?;
    let mut closed = notifications.receive_signal("NotificationClosed").await?;
    let body = match reason {
        Reason::Closed => t!(L10N, "sandbox-closed-body"),
        Reason::Device => t!(L10N, "sandbox-device-body"),
        Reason::Display => t!(L10N, "sandbox-display-body"),
        Reason::Microphone => t!(L10N, "sandbox-microphone-body"),
        Reason::Camera => t!(L10N, "sandbox-camera-body"),
    };
    let page = match reason {
        Reason::Closed | Reason::Device => "full-access",
        Reason::Display | Reason::Microphone | Reason::Camera => "access",
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
            .arg(format!("schelf:{page}?{}", app.id))
            .status();
    }
    Ok(())
}
