use luft_dbus_macros::introspect;
use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};

use super::Board;
use super::cgroup::Unit;
use super::windows::{Label, Listed, Window};
use crate::shared::remote::{Endpoint, RemoteProperty};

const KESTREL_MEMORY: Endpoint = Endpoint {
    service: "com.lantharos.Kestrel",
    path: "/com/lantharos/Kestrel/Memory",
    interface: "com.lantharos.Kestrel.Memory",
};

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Memory",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Memory"
)]
trait KestrelMemory {
    fn running_low(
        &self,
        unit: &str,
        app: &str,
        name: &str,
        bytes: u64,
        growing: bool,
    ) -> zbus::Result<()>;

    #[zbus(no_reply)]
    fn closed(&self, unit: &str, app: &str, name: &str, bytes: u64) -> zbus::Result<()>;

    #[zbus(property)]
    fn windows(&self) -> zbus::Result<Vec<Listed>>;
}

#[derive(Clone)]
pub struct Notices {
    kestrel: KestrelMemoryProxy<'static>,
    board: Board,
}

impl Notices {
    pub async fn new(session: &Connection, board: Board) -> zbus::Result<Self> {
        Ok(Self {
            kestrel: KestrelMemoryProxy::builder(session)
                .cache_properties(CacheProperties::No)
                .build()
                .await?,
            board,
        })
    }

    pub fn warn(&self, unit: &Unit, growing: bool) {
        if !self.board.ask(&unit.name) {
            return;
        }
        let label = self.board.label(unit);
        let because = if growing {
            "keeps using more memory"
        } else {
            "is next to be closed"
        };
        let (kestrel, board, name, bytes) = (
            self.kestrel.clone(),
            self.board.clone(),
            unit.name.clone(),
            unit.bytes,
        );
        tokio::spawn(async move {
            match kestrel
                .running_low(&name, &label.app, &label.name, bytes, growing)
                .await
            {
                Ok(()) => {
                    eprintln!("Warned that {name} {because}");
                    board.warned(&name);
                }
                Err(error) => eprintln!("Couldn't warn that memory is running low: {error}"),
            }
        });
    }

    pub async fn closed(&self, unit: &Unit, label: Label) {
        if let Err(error) = self
            .kestrel
            .closed(&unit.name, &label.app, &label.name, unit.bytes)
            .await
        {
            eprintln!("Couldn't tell Kestrel what was closed: {error}");
        }
    }
}

pub struct Listing(RemoteProperty<Vec<Listed>>);

impl Listing {
    pub async fn follow(session: &Connection) -> zbus::Result<Self> {
        Ok(Self(
            RemoteProperty::new(session, &KESTREL_MEMORY, "Windows").await?,
        ))
    }

    pub async fn current(&self) -> Vec<Window> {
        windows(self.0.get().await)
    }

    pub async fn next(&mut self) -> Vec<Window> {
        windows(self.0.changed().await)
    }
}

fn windows(listed: Option<Vec<Listed>>) -> Vec<Window> {
    listed.into_iter().flatten().map(Window::from).collect()
}
