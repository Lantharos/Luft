mod error;
mod interface;

use std::sync::Arc;
use std::time::Duration;

use access::Idle;

use interface::Windows;

pub const NAME: &str = "com.lantharos.Windows1";
pub const PATH: &str = "/com/lantharos/Windows1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(30);

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
        .serve_at(PATH, Windows::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
