mod error;
mod interface;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;

use interface::Printers;

pub const NAME: &str = "com.lantharos.Printers1";
pub const PATH: &str = "/com/lantharos/Printers1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

pub async fn serve() -> anyhow::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, Printers::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
