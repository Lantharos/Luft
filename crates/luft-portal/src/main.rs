mod capture;
mod consent;
mod pipewire_cast;
mod screencast;
mod screenshot;
mod settings;

use ashpd::backend::Builder;
use screencast::ScreencastPortal;
use screenshot::ScreenshotPortal;
use settings::PortalSettings;
use std::{env, fs, fs::OpenOptions, io};
use tracing::info;
use wayland_client::Connection;

const DBUS_NAME: &str = "org.freedesktop.impl.portal.desktop.luft";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_logging();
    let wayland = Connection::connect_to_env()?;
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?
        .block_on(run(wayland))
}

async fn run(wayland: Connection) -> Result<(), Box<dyn std::error::Error>> {
    Builder::new(DBUS_NAME)?
        .settings(PortalSettings::new())
        .screenshot(ScreenshotPortal::new(wayland.clone()))
        .screencast(ScreencastPortal::new(wayland))
        .build()
        .await?;
    info!(dbus_name = DBUS_NAME, "luft portal backend ready");
    std::future::pending::<()>().await;
    Ok(())
}

fn init_logging() {
    tracing_subscriber::fmt()
        .with_ansi(false)
        .with_writer(log_writer("luft-portal"))
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("luft_portal=info")),
        )
        .init();
}

fn log_writer(component: &'static str) -> impl Fn() -> Box<dyn io::Write + Send> + Clone {
    let path = env::var_os("XDG_STATE_HOME")
        .map(|dir| {
            std::path::PathBuf::from(dir)
                .join("luft")
                .join("logs")
                .join(format!("{component}.log"))
        })
        .or_else(|| {
            env::var_os("HOME").map(|home| {
                std::path::PathBuf::from(home)
                    .join(".local/state/luft/logs")
                    .join(format!("{component}.log"))
            })
        });

    move || -> Box<dyn io::Write + Send> {
        let Some(path) = &path else {
            return Box::new(io::stderr());
        };
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        match OpenOptions::new().create(true).append(true).open(path) {
            Ok(file) => Box::new(file),
            Err(_) => Box::new(io::stderr()),
        }
    }
}
