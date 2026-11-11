use std::sync::{Arc, Mutex, MutexGuard};

use luft_dbus_macros::introspect;
use serde_json::json;
use tokio::sync::Notify;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, fdo, interface};

use crate::config;
use crate::image::Image;
use crate::state::{Choice, State};

pub const NAME: &str = "com.lantharos.CrashReports1";
pub const PATH: &str = "/com/lantharos/CrashReports1";

pub struct Service {
    state: Mutex<State>,
    pub image: Image,
    pub wake: Notify,
}

impl Service {
    pub fn new(state: State, image: Image) -> Self {
        Self {
            state: Mutex::new(state),
            image,
            wake: Notify::new(),
        }
    }

    pub fn state(&self) -> MutexGuard<'_, State> {
        self.state.lock().expect("the state is never left poisoned")
    }
}

pub struct Reports {
    pub service: Arc<Service>,
}

/// Tells Kestrel and Settings what changed.
pub async fn announce(connection: &Connection) -> zbus::Result<()> {
    let reports = connection
        .object_server()
        .interface::<_, Reports>(PATH)
        .await?;
    let emitter = reports.signal_emitter();
    let reports = reports.get().await;
    reports.waiting_changed(emitter).await?;
    reports.choice_changed(emitter).await?;
    reports.queued_changed(emitter).await?;
    reports.available_changed(emitter).await
}

async fn from_you(connection: &Connection, header: &Header<'_>) -> fdo::Result<()> {
    luft_identity::caller::refuse_sandboxed(connection, header).await
}

#[introspect]
#[interface(name = "com.lantharos.CrashReports1")]
impl Reports {
    /// Whether this version of Luft has somewhere to send reports.
    #[zbus(property)]
    fn available(&self) -> bool {
        config::inbox().is_some()
    }

    /// `ask`, `always` or `never`.
    #[zbus(property)]
    fn choice(&self) -> String {
        self.service.state().choice().name().into()
    }

    /// The crash to ask about next, as JSON with its `id`, `program`,
    /// `summary`, `kind` and the exact `body` that would be sent, or empty.
    #[zbus(property)]
    fn waiting(&self) -> String {
        let state = self.service.state();
        state.waiting().map_or_else(String::new, |crash| {
            let body = serde_json::to_string_pretty(&state.body(crash))
                .expect("a report always serializes");
            json!({
                "id": crash.report.signature,
                "program": crash.report.program,
                "summary": crash.report.summary,
                "kind": crash.report.kind,
                "body": body,
            })
            .to_string()
        })
    }

    #[zbus(property)]
    fn queued(&self) -> u32 {
        u32::try_from(self.service.state().queue().len()).unwrap_or(u32::MAX)
    }

    /// Sends the crash or doesn't, and with `remember` does the same for
    /// every crash from now on.
    async fn answer(
        &self,
        #[zbus(header)] header: Header<'_>,
        #[zbus(connection)] connection: &Connection,
        id: String,
        send: bool,
        remember: bool,
    ) -> fdo::Result<()> {
        from_you(connection, &header).await?;
        if !self.service.state().answer(&id, send, remember) {
            return Err(fdo::Error::InvalidArgs(
                "Nothing is waiting with that ID.".into(),
            ));
        }
        self.service.wake.notify_one();
        announce(connection).await?;
        Ok(())
    }

    async fn set_choice(
        &self,
        #[zbus(header)] header: Header<'_>,
        #[zbus(connection)] connection: &Connection,
        choice: String,
    ) -> fdo::Result<()> {
        from_you(connection, &header).await?;
        let choice = Choice::parse(&choice)
            .ok_or_else(|| fdo::Error::InvalidArgs("Choose ask, always or never.".into()))?;
        self.service.state().choose(choice);
        self.service.wake.notify_one();
        announce(connection).await?;
        Ok(())
    }

    /// Forgets the install's ID, so the next report sent starts a new one.
    async fn reset_install(
        &self,
        #[zbus(header)] header: Header<'_>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        from_you(connection, &header).await?;
        self.service.state().reset_install();
        self.waiting_changed(&emitter).await?;
        Ok(())
    }
}
