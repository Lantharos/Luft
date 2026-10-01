mod error;
mod interface;
mod properties;

use std::sync::Arc;
use std::time::Duration;

use access::Idle;

use crate::keys;

pub use interface::Trust;

pub const NAME: &str = "com.lantharos.Trust1";
pub const PATH: &str = "/com/lantharos/Trust1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

pub async fn serve() -> zbus::Result<()> {
    if let Err(error) = tokio::task::spawn_blocking(keys::mok::follow_up)
        .await
        .expect("following up on the key enrollment doesn't panic")
    {
        eprintln!("Couldn't follow up on adding Luft's key: {error:#}");
    }
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
