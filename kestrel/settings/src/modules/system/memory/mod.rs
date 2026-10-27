pub mod cgroup;
pub mod pressure;

use std::time::Duration;

use tokio::time::Instant;
use zbus::{Connection, proxy};

use crate::context::Context;
use cgroup::UserManager;
use pressure::Trigger;

const STALLED: Duration = Duration::from_millis(200);
const WINDOW: Duration = Duration::from_secs(2);
const BETWEEN_WARNINGS: Duration = Duration::from_secs(120);
const STARVED_SHARE: f64 = 10.0;
const SETTLE: Duration = Duration::from_secs(10);

#[proxy(
    interface = "com.lantharos.Kestrel.Memory",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Memory"
)]
trait KestrelMemory {
    #[zbus(no_reply)]
    fn running_low(&self, unit: &str, bytes: u64) -> zbus::Result<()>;

    #[zbus(no_reply)]
    fn closed(&self, unit: &str, bytes: u64) -> zbus::Result<()>;
}

pub fn own_manager() -> zbus::Result<UserManager> {
    UserManager::own().ok_or_else(|| zbus::Error::Failure("This isn't a user's session".into()))
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let manager = own_manager()?;
    let trigger = Trigger::system(STALLED, WINDOW)?;
    let kestrel = KestrelMemoryProxy::new(&context.session).await?;
    tokio::spawn(async move {
        let mut warned_at: Option<Instant> = None;
        while trigger.fired().await.is_ok() {
            if warned_at.is_some_and(|at| at.elapsed() < BETWEEN_WARNINGS)
                || !pressure::running_low()
            {
                continue;
            }
            let Some(unit) = manager.biggest_app() else {
                continue;
            };
            warned_at = Some(Instant::now());
            if let Err(error) = kestrel.running_low(&unit.name, unit.bytes).await {
                eprintln!("Couldn't warn that memory is running low: {error}");
            }
        }
    });
    Ok(())
}

pub struct Relief {
    manager: UserManager,
    kestrel: KestrelMemoryProxy<'static>,
    closed_at: Option<Instant>,
}

impl Relief {
    pub async fn new(session: &Connection) -> zbus::Result<Self> {
        Ok(Self {
            manager: own_manager()?,
            kestrel: KestrelMemoryProxy::new(session).await?,
            closed_at: None,
        })
    }

    pub fn compositor_starved(&self) -> bool {
        self.manager.compositor_stall_share() >= STARVED_SHARE && pressure::running_low()
    }

    pub async fn close_biggest_app(&mut self) {
        if self.closed_at.is_some_and(|at| at.elapsed() < SETTLE) {
            return;
        }
        let Some(unit) = self.manager.biggest_app() else {
            return;
        };
        if let Err(error) = unit.close() {
            eprintln!("Couldn't close {} to free memory: {error}", unit.name);
            return;
        }
        self.closed_at = Some(Instant::now());
        eprintln!("Kestrel was waiting on memory, so {} was closed", unit.name);
        if let Err(error) = self.kestrel.closed(&unit.name, unit.bytes).await {
            eprintln!("Couldn't tell Kestrel what was closed: {error}");
        }
    }
}
