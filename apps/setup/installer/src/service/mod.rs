mod error;
mod interface;
mod language;
mod setup;

use std::sync::Arc;
use std::time::Duration;

use luft_dbus::idle::Idle;

use crate::config::Config;
use crate::meet;
use crate::options::Options;
use interface::Installer;

pub const NAME: &str = "com.lantharos.Installer1";
pub const PATH: &str = "/com/lantharos/Installer1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

pub fn run(options: Options) -> anyhow::Result<()> {
    let config = Config::read(&options.config)?;
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(serve(options, config))?;
    Ok(())
}

async fn serve(options: Options, config: Config) -> zbus::Result<()> {
    language::restore();
    let handoff = meet::handoff(&options.live_medium);
    if let Some(handoff) = &handoff
        && let Err(error) = meet::start::restore(handoff).await
    {
        eprintln!("Meet Luft's start partition couldn't get its type back: {error:#}");
    }
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, Installer::new(options, config, handoff, idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
