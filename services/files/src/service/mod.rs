mod error;
mod interface;
mod prompt;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;
use luft_files::client::{NAME, PATH};

use interface::Files;

const IDLE_TIMEOUT: Duration = Duration::from_secs(30);

pub fn run() -> zbus::Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> zbus::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, Files::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
