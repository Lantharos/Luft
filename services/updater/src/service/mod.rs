mod error;
mod interface;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;

use interface::Updater;

pub const NAME: &str = "com.lantharos.Updater1";
pub const PATH: &str = "/com/lantharos/Updater1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

pub fn run() -> anyhow::Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(serve())?;
    Ok(())
}

async fn serve() -> zbus::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, Updater::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    tokio::select! {
        () = idle.wait(IDLE_TIMEOUT) => {}
        followed = follow_policy(&connection) => followed?,
    }
    connection.release_name(NAME).await?;
    Ok(())
}

async fn follow_policy(connection: &zbus::Connection) -> zbus::Result<()> {
    let mut policy = luft_policy::Follow::start()?;
    let updater = connection
        .object_server()
        .interface::<_, Updater>(PATH)
        .await?;
    loop {
        policy.changed().await?;
        let emitter = updater.signal_emitter();
        updater.get().await.schedule_changed(emitter).await?;
        updater
            .get()
            .await
            .download_automatically_changed(emitter)
            .await?;
    }
}
