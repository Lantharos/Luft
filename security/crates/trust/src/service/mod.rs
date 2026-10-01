mod error;
mod interface;
mod properties;

use std::sync::Arc;
use std::time::Duration;

use access::Idle;

pub use interface::Trust;

pub const NAME: &str = "com.lantharos.Trust1";
pub const PATH: &str = "/com/lantharos/Trust1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

pub async fn serve() -> zbus::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()?
        .serve_at(PATH, Trust::new(idle.clone()))?
        .name(NAME)?
        .build()
        .await?;
    interface::continue_disk_work(&connection).await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
