mod error;
mod interface;
mod system_packages;

use std::sync::Arc;
use std::time::Duration;

use access::Idle;

use interface::Updater;
use system_packages::SystemPackages;

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
        .serve_at(PATH, SystemPackages::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
