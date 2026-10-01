use futures_util::StreamExt;
use tokio::sync::watch;
use zbus::fdo::{PropertiesChangedStream, PropertiesProxy};
use zbus::proxy::{CacheProperties, PropertyStream};
use zbus::zvariant::OwnedObjectPath;
use zbus::{Connection, proxy};

const UNLOCKED_CLASSES: [&str; 2] = ["user", "user-early"];
const NO_SESSION: &str = "/";

#[proxy(
    interface = "org.freedesktop.login1.Seat",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1/seat/seat0"
)]
trait Seat {
    #[zbus(property)]
    fn active_session(&self) -> zbus::Result<(String, OwnedObjectPath)>;
}

#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
trait Session {
    #[zbus(property)]
    fn class(&self) -> zbus::Result<String>;

    #[zbus(property)]
    fn locked_hint(&self) -> zbus::Result<bool>;

    #[zbus(property)]
    fn user(&self) -> zbus::Result<(u32, OwnedObjectPath)>;
}

struct ActiveSession {
    session: SessionProxy<'static>,
    changes: PropertiesChangedStream,
}

struct Seat0 {
    connection: Connection,
    switches: PropertyStream<'static, (String, OwnedObjectPath)>,
    active: Option<ActiveSession>,
}

impl ActiveSession {
    async fn watch(connection: &Connection, path: OwnedObjectPath) -> zbus::Result<Self> {
        let changes = PropertiesProxy::builder(connection)
            .destination("org.freedesktop.login1")?
            .path(path.clone())?
            .build()
            .await?
            .receive_properties_changed()
            .await?;
        let session = SessionProxy::builder(connection)
            .path(path)?
            .cache_properties(CacheProperties::No)
            .build()
            .await?;
        Ok(Self { session, changes })
    }

    async fn unlocked(&self) -> bool {
        let (class, locked) = tokio::join!(self.session.class(), self.session.locked_hint());
        matches!((class, locked), (Ok(class), Ok(false)) if UNLOCKED_CLASSES.contains(&class.as_str()))
    }
}

impl Seat0 {
    async fn new(connection: &Connection) -> zbus::Result<Self> {
        let seat = SeatProxy::new(connection).await?;
        let switches = seat.receive_active_session_changed().await;
        let (_, path) = seat.active_session().await?;
        let mut seat = Self {
            connection: connection.clone(),
            switches,
            active: None,
        };
        seat.follow(path).await;
        Ok(seat)
    }

    async fn follow(&mut self, path: OwnedObjectPath) {
        self.active = None;
        if path.as_str() == NO_SESSION {
            return;
        }
        match ActiveSession::watch(&self.connection, path).await {
            Ok(active) => self.active = Some(active),
            Err(error) => eprintln!("Couldn't follow the active session: {error}"),
        }
    }

    async fn unlocked(&self) -> bool {
        match &self.active {
            Some(active) => active.unlocked().await,
            None => false,
        }
    }

    async fn changed(&mut self) -> bool {
        let Self {
            switches, active, ..
        } = self;
        let switched = tokio::select! {
            Some(switch) = switches.next() => Some(switch.get().await),
            Some(_) = async {
                match active {
                    Some(active) => active.changes.next().await,
                    None => std::future::pending().await,
                }
            } => None,
        };
        match switched {
            Some(Ok((_, path))) => self.follow(path).await,
            Some(Err(error)) => {
                eprintln!("Couldn't read the active session: {error}");
                self.active = None;
            }
            None => {}
        }
        self.unlocked().await
    }
}

pub async fn watch_unlocked(connection: &Connection) -> zbus::Result<watch::Receiver<bool>> {
    let mut seat = Seat0::new(connection).await?;
    let (unlocked, receiver) = watch::channel(seat.unlocked().await);
    tokio::spawn(async move {
        loop {
            let now = seat.changed().await;
            unlocked.send_if_modified(|unlocked| std::mem::replace(unlocked, now) != now);
        }
    });
    Ok(receiver)
}

pub async fn active_user(connection: &Connection) -> zbus::Result<Option<u32>> {
    let (_, path) = SeatProxy::builder(connection)
        .cache_properties(CacheProperties::No)
        .build()
        .await?
        .active_session()
        .await?;
    if path.as_str() == NO_SESSION {
        return Ok(None);
    }
    let (uid, _) = SessionProxy::builder(connection)
        .path(path)?
        .cache_properties(CacheProperties::No)
        .build()
        .await?
        .user()
        .await?;
    Ok(Some(uid))
}
