use luft_app::dbus::{self, failed};
use luft_app::identity::caller;
use luft_dbus_macros::introspect;
use luft_software::progress::Progress;
use zbus::fdo::{self, RequestNameFlags};
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface, proxy};

use super::{Notice, OperationState, Queue, Request};

pub const NAME: &str = "com.lantharos.Schelf";
pub const PATH: &str = "/com/lantharos/Schelf";
pub const UNKNOWN_FRACTION: f64 = -1.0;

#[introspect]
#[proxy(
    interface = "com.lantharos.Schelf1",
    default_service = "com.lantharos.Schelf",
    default_path = "/com/lantharos/Schelf"
)]
pub trait Schelf {
    fn start(&self, request: &str) -> zbus::Result<u64>;

    fn cancel(&self, id: u64) -> zbus::Result<()>;

    #[zbus(signal)]
    fn changed(&self, id: u64, state: String, stage: String, fraction: f64) -> zbus::Result<()>;

    #[zbus(signal)]
    fn finished(&self, id: u64, error: String) -> zbus::Result<()>;
}

struct Operations {
    queue: Queue,
}

#[introspect]
#[interface(name = "com.lantharos.Schelf1")]
impl Operations {
    async fn start(
        &self,
        request: &str,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<u64> {
        caller::refuse_sandboxed(connection, &header).await?;
        let request: Request = serde_json::from_str(request)
            .map_err(|error| fdo::Error::InvalidArgs(error.to_string()))?;
        self.queue.enqueue(request).map_err(fdo::Error::Failed)
    }

    async fn cancel(
        &self,
        id: u64,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<()> {
        caller::refuse_sandboxed(connection, &header).await?;
        self.queue.stop(id);
        Ok(())
    }

    #[zbus(signal)]
    async fn changed(
        emitter: &SignalEmitter<'_>,
        id: u64,
        state: &str,
        stage: &str,
        fraction: f64,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn finished(emitter: &SignalEmitter<'_>, id: u64, error: &str) -> zbus::Result<()>;
}

async fn changed(
    emitter: &SignalEmitter<'_>,
    id: u64,
    state: OperationState,
    progress: Option<Progress>,
) -> zbus::Result<()> {
    let stage = progress.map_or("", |progress| progress.stage.name());
    let fraction = progress
        .and_then(|progress| progress.fraction)
        .map_or(UNKNOWN_FRACTION, f64::from);
    Operations::changed(emitter, id, state.name(), stage, fraction).await
}

pub async fn serve(queue: Queue) -> Result<(), String> {
    let mut notices = queue.notices();
    let connection = dbus::session().await?;
    connection
        .object_server()
        .at(
            PATH,
            Operations {
                queue: queue.clone(),
            },
        )
        .await
        .map_err(failed)?;
    connection
        .request_name_with_flags(NAME, RequestNameFlags::DO_NOT_QUEUE)
        .await
        .map_err(failed)?;
    let emitter = SignalEmitter::new(connection, PATH).map_err(failed)?;
    while let Some(notice) = notices.recv().await {
        let sent = match notice {
            Notice::Changed {
                id,
                state,
                progress,
            } => changed(&emitter, id, state, progress).await,
            Notice::Finished { id, error } => {
                Operations::finished(&emitter, id, error.as_deref().unwrap_or_default()).await
            }
        };
        sent.map_err(failed)?;
    }
    Ok(())
}
