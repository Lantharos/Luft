use std::os::fd::BorrowedFd;

use luft_dbus_macros::introspect;
use luft_i18n::t;
use luft_software::apps::places::{self, Access, Drive};
use zbus::{Connection, Fd, proxy};

use crate::L10N;
use crate::escalate::{Asking, offer_action};

/// Kestrel's prompt asking whether an app may use a drive. Kestrel names the
/// app by the sandbox of the process it's handed and the drive by what UDisks
/// says of it, never by anything the asker chooses.
#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.DriveAccess",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/DriveAccess"
)]
trait DriveAccess {
    fn ask(&self, app: Fd<'_>, drive: &str) -> zbus::Result<bool>;
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Asked {
    Allowed,
    Refused,
    /// Kestrel didn't ask: the app wasn't in front, the screen was locked or
    /// another prompt was open. A later look may ask again.
    NotNow,
}

/// Asks whether the app whose sandbox `process` is in may use `drive`, and
/// keeps the answer: given read and write, or refused so it's not asked again.
pub async fn ask(
    connection: &Connection,
    id: &str,
    process: BorrowedFd<'_>,
    drive: &Drive,
) -> Asked {
    let answer = match DriveAccessProxy::new(connection).await {
        Ok(prompt) => prompt.ask(Fd::from(process), &drive.uuid).await,
        Err(error) => Err(error),
    };
    let (asked, kept) = match answer {
        Ok(true) => (
            Asked::Allowed,
            places::give(connection, id, drive, Access::ReadWrite).await,
        ),
        Ok(false) => (Asked::Refused, places::refuse(connection, id, drive).await),
        Err(error) => {
            eprintln!("Couldn't ask whether {id} may use {}: {error}", drive.uuid);
            return Asked::NotNow;
        }
    };
    if let Err(error) = kept {
        eprintln!(
            "Couldn't keep what {id} may do with {}: {error}",
            drive.uuid
        );
    }
    asked
}

fn given(drive: &Drive, app: &str) -> String {
    if drive.label.is_empty() {
        t!(L10N, "sandbox-drive-given-unnamed", app = app)
    } else {
        t!(
            L10N,
            "sandbox-drive-given",
            app = app,
            drive = drive.label.as_str()
        )
    }
}

/// Offers to restart the app once it was given `drive`, since it sees the
/// drive only once it opens again, until `gone` says it closed some other
/// way. Says whether you asked for the restart.
pub async fn offer_restart(
    connection: &Connection,
    app: &Asking,
    drive: &Drive,
    gone: impl Future<Output = ()>,
) -> bool {
    let body = t!(L10N, "sandbox-drive-restart-body");
    let action = t!(L10N, "sandbox-restart");
    offer_action(
        connection,
        app,
        &given(drive, &app.name),
        &body,
        &action,
        gone,
    )
    .await
    .unwrap_or(false)
}
