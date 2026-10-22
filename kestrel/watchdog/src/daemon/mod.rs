mod judge;
mod restart;
mod threads;

use std::process::ExitCode;
use std::time::Duration;

use futures_util::StreamExt;
use luft_identity::caller::{self, Caller};
use tokio::process::Command;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::{Mutex, mpsc};
use zbus::fdo;
use zbus::message::Header;
use zbus::{Connection, interface};

use crate::incident::{self, collect, efi};
use crate::system::kmsg::KernelLog;
use crate::system::output_within;
use crate::system::proxies::{LoginProxy, SessionProxy, UserProxy};
use judge::{Hang, Judge};

const NAME: &str = "com.lantharos.Kestrel.Watchdog1";
const PATH: &str = "/com/lantharos/Kestrel/Watchdog1";
const JOURNAL_SYNC_LIMIT: Duration = Duration::from_secs(5);

struct Watchdog {
    judge: Mutex<Judge>,
    login: LoginProxy<'static>,
    hangs: mpsc::Sender<Hang>,
}

impl Watchdog {
    async fn verify(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        compositor: u32,
    ) -> fdo::Result<()> {
        let denied = |reason: &str| Err(fdo::Error::AccessDenied(reason.into()));
        if caller::of_sender(connection, header).await != Caller::You {
            return denied("Sandboxed apps can't report stalls");
        }
        let Some(uid) = caller::uid(connection, header).await? else {
            return denied("The caller can't be identified");
        };
        if threads::owner(compositor) != Some(uid) {
            return denied("That isn't the caller's Kestrel");
        }
        let user = self.login.get_user(uid).await?;
        let (_, session) = UserProxy::builder(connection)
            .path(user)
            .build()
            .await?
            .display()
            .await?;
        let session = SessionProxy::builder(connection)
            .path(session)
            .build()
            .await?;
        let (seat, _) = session.seat().await?;
        if !session.active().await? || seat.is_empty() {
            return denied("The caller's session isn't on screen");
        }
        Ok(())
    }

    async fn shutting_down_or_sleeping(&self) -> bool {
        let (sleeping, shutting_down) = tokio::join!(
            self.login.preparing_for_sleep(),
            self.login.preparing_for_shutdown()
        );
        sleeping.unwrap_or(false) || shutting_down.unwrap_or(false)
    }
}

#[interface(name = "com.lantharos.Kestrel.Watchdog1")]
impl Watchdog {
    async fn report(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        stalled_ms: u64,
        compositor: u32,
    ) -> fdo::Result<()> {
        self.verify(connection, &header, compositor).await?;
        if self.shutting_down_or_sleeping().await {
            return Ok(());
        }
        let stalled = Duration::from_millis(stalled_ms);
        if let Some(hang) = self.judge.lock().await.consider(stalled, compositor) {
            let _ = self.hangs.try_send(hang);
        }
        Ok(())
    }
}

async fn record(hang: Hang) -> incident::Incident {
    for line in &hang.evidence {
        eprintln!("{line}");
    }
    let mut incident = collect::build(hang.stalled.as_secs(), hang.evidence, hang.kernel_messages);
    if let Err(error) = incident.save() {
        eprintln!(
            "Couldn't write the incident to the disk, keeping it in the firmware instead: {error}"
        );
        if let Err(error) = efi::save(&incident) {
            eprintln!("Couldn't keep the incident in the firmware either: {error}");
        }
    }
    output_within(Command::new("journalctl").arg("--sync"), JOURNAL_SYNC_LIMIT).await;
    incident.nvidia_smi = collect::nvidia_smi().await;
    if incident.nvidia_smi.is_some() {
        let _ = incident.save();
    }
    eprintln!(
        "The graphics driver stopped responding. After the restart, `sudo nvidia-bug-report.sh` collects this boot's log for a driver bug report."
    );
    incident
}

async fn watch_sleep(
    login: LoginProxy<'static>,
    watchdog: zbus::object_server::InterfaceRef<Watchdog>,
) -> zbus::Result<()> {
    let mut sleeps = login.receive_prepare_for_sleep().await?;
    while let Some(signal) = sleeps.next().await {
        if signal.args().is_ok_and(|args| !args.start) {
            watchdog.get().await.judge.lock().await.resumed();
        }
    }
    Ok(())
}

pub async fn run() -> ExitCode {
    match serve().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't watch the compositor: {error}");
            ExitCode::FAILURE
        }
    }
}

async fn serve() -> zbus::Result<()> {
    let log = KernelLog::watch()?;
    let system = Connection::system().await?;
    let login = LoginProxy::new(&system).await?;
    let (hangs, mut hung) = mpsc::channel(1);
    let server = system.object_server();
    server
        .at(
            PATH,
            Watchdog {
                judge: Mutex::new(Judge::new(log)),
                login: login.clone(),
                hangs,
            },
        )
        .await?;
    let watchdog = server.interface::<_, Watchdog>(PATH).await?;
    system.request_name(NAME).await?;
    tokio::spawn(watch_sleep(login, watchdog));

    let mut terminate = signal(SignalKind::terminate())?;
    tokio::select! {
        _ = terminate.recv() => Ok(()),
        Some(hang) = hung.recv() => {
            let incident = record(hang).await;
            restart::restart(system, incident).await;
            Ok(())
        }
    }
}
