mod errors;
mod idle_delay;
mod manager;
mod presence;
mod properties;
mod screen_saver;
mod session_state;
mod system;

use std::process::ExitCode;
use std::sync::Arc;

use futures_util::StreamExt;
use tokio::signal::unix::{SignalKind, signal};
use zbus::Connection;
use zbus::fdo::{DBusProxy, RequestNameFlags, RequestNameReply};
use zbus::names::BusName;

use manager::{Manager, Session};
use presence::Presence;

const SHELL_READY: &str = "org.freedesktop.impl.portal.desktop.kestrel";

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    match run().await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {}: {error}", manager::NAME);
            ExitCode::FAILURE
        }
    }
}

async fn follow_shell(connection: Connection, session: Arc<Session>) -> zbus::Result<()> {
    let bus = DBusProxy::new(&connection).await?;
    let mut changes = bus
        .receive_name_owner_changed_with_args(&[(0, SHELL_READY)])
        .await?;
    let name = BusName::from_static_str(SHELL_READY)?;
    session.set_shell_running(bus.name_has_owner(name).await?);
    while let Some(change) = changes.next().await {
        session.set_shell_running(change.args()?.new_owner().is_some());
    }
    Ok(())
}

fn spawn_logged<F>(what: &'static str, task: F)
where
    F: Future<Output = zbus::Result<()>> + Send + 'static,
{
    tokio::spawn(async move {
        if let Err(error) = task.await {
            eprintln!("{what}: {error}");
        }
    });
}

async fn run() -> zbus::Result<()> {
    let connection = Connection::session().await?;
    let system = Connection::system().await?;
    let session = Session::new(connection.clone(), system.clone());
    let server = connection.object_server();

    let idle_monitor = presence::idle_monitor(&connection).await?;
    server.at(presence::PATH, Presence::default()).await?;
    let presence = server.interface::<_, Presence>(presence::PATH).await?;
    spawn_logged(
        "Couldn't follow whether the session is idle",
        presence::follow_idle(idle_monitor.clone(), presence, idle_delay::follow()),
    );

    screen_saver::serve(&connection, &session, &idle_monitor).await?;
    connection
        .request_name_with_flags(screen_saver::NAME, RequestNameFlags::empty())
        .await?;

    server
        .at(manager::PATH, Manager(Arc::clone(&session)))
        .await?;
    spawn_logged(
        "Session state is unavailable",
        session_state::follow(system, Arc::clone(&session)),
    );
    spawn_logged(
        "Couldn't follow Kestrel",
        follow_shell(connection.clone(), Arc::clone(&session)),
    );

    let mut lost = DBusProxy::new(&connection)
        .await?
        .receive_name_lost_with_args(&[(0, manager::NAME)])
        .await?;
    if connection
        .request_name_with_flags(manager::NAME, RequestNameFlags::REPLACE_EXISTING)
        .await?
        == RequestNameReply::PrimaryOwner
    {
        session.emit_running().await;
    }
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
        _ = lost.next() => {}
    }
    Ok(())
}
