mod drives;
mod error;
mod interface;
mod properties;

use std::sync::Arc;
use std::time::Duration;

use access::Idle;

use crate::{boot, keys};

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
    if let Err(error) = tokio::task::spawn_blocking(keys::mok::follow_up)
        .await
        .expect("following up on the key enrollment doesn't panic")
    {
        eprintln!("Couldn't follow up on adding Luft's key: {error:#}");
    }
    if let Err(error) = tokio::task::spawn_blocking(boot::startup::follow_up)
        .await
        .expect("following up on the startup doesn't panic")
    {
        eprintln!("Couldn't follow up on Luft's startup: {error:#}");
    }
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()?
        .serve_at(PATH, Trust::new(idle.clone()))?
        .serve_at(PATH, drives::Drives::new(idle.clone()))?
        .name(NAME)?
        .build()
        .await?;
    interface::continue_disk_work(&connection).await?;
    drives::continue_work(&connection).await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
