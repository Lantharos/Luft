pub(crate) mod actions;
mod drives;
mod error;
mod interface;
mod properties;
mod shown;
pub(crate) mod status;
mod system_disk;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;

pub use interface::Trust;

pub const NAME: &str = "com.lantharos.Trust1";
pub const PATH: &str = "/com/lantharos/Trust1";
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
        .serve_at(PATH, Trust::new(idle.clone()))
        .serve_at(PATH, drives::Drives::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    drives::continue_work(&connection).await?;
    system_disk::continue_work(&connection).await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
