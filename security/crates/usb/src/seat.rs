use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use tokio::sync::watch;
use zbus::OwnedObjectPath;
use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};

const SIGNED_IN_CLASSES: [&str; 2] = ["user", "user-early"];
const TEXT_CONSOLE: &str = "tty";
const NO_SESSION: &str = "/";

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Seat",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1/seat/seat0"
)]
trait Seat {
    #[zbus(property)]
    fn active_session(&self) -> zbus::Result<(String, OwnedObjectPath)>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
trait Session {
    #[zbus(property)]
    fn class(&self) -> zbus::Result<String>;

    #[zbus(property, name = "Type")]
    fn kind(&self) -> zbus::Result<String>;

    #[zbus(property)]
    fn user(&self) -> zbus::Result<(u32, OwnedObjectPath)>;
}

/// Who is signed in at the computer's own screen and keyboard. A text
/// console has no lock screen, so whoever signed in there counts as
/// unlocked; a desktop is unlocked only while its shell says so.
#[derive(Clone, Copy, PartialEq, Eq)]
pub struct SignedIn {
    pub uid: u32,
    pub locks: bool,
}

async fn signed_in(
    connection: &Connection,
    path: OwnedObjectPath,
) -> zbus::Result<Option<SignedIn>> {
    if path.as_str() == NO_SESSION {
        return Ok(None);
    }
    let session = SessionProxy::builder(connection)
        .path(path)
        .cache_properties(CacheProperties::No)
        .build()
        .await?;
    let (class, kind, user) = tokio::join!(session.class(), session.kind(), session.user());
    Ok(SIGNED_IN_CLASSES
        .contains(&class?.as_str())
        .then_some(SignedIn {
            uid: user?.0,
            locks: kind? != TEXT_CONSOLE,
        }))
}

async fn read(connection: &Connection, path: zbus::Result<OwnedObjectPath>) -> Option<SignedIn> {
    let read = match path {
        Ok(path) => signed_in(connection, path).await,
        Err(error) => Err(error),
    };
    read.unwrap_or_else(|error| {
        eprintln!("Couldn't read the active session: {error}");
        None
    })
}

pub async fn watch_signed_in(
    connection: &Connection,
) -> zbus::Result<watch::Receiver<Option<SignedIn>>> {
    let seat = SeatProxy::new(connection).await?;
    let mut switches = seat.receive_active_session_changed().await;
    let now = read(
        connection,
        seat.active_session().await.map(|(_, path)| path),
    )
    .await;
    let (signed_in, receiver) = watch::channel(now);
    let connection = connection.clone();
    tokio::spawn(async move {
        while let Some(switch) = switches.next().await {
            let now = read(&connection, switch.get().await.map(|(_, path)| path)).await;
            signed_in.send_if_modified(|signed_in| std::mem::replace(signed_in, now) != now);
        }
    });
    Ok(receiver)
}
