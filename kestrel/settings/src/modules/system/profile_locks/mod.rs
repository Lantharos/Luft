mod flatpak;
mod hostname;
mod lock;
mod profiles;

use crate::context::Context;
use hostname::HostnameWatch;

pub async fn start(_context: &Context) -> zbus::Result<()> {
    let watch = HostnameWatch::new()?;
    tokio::spawn(async move {
        loop {
            let _ = tokio::task::spawn_blocking(settle_all).await;
            if let Err(error) = watch.changed().await {
                eprintln!("Couldn't follow the host name: {error}");
                return;
            }
        }
    });
    Ok(())
}

fn settle_all() {
    let Ok(hostname) = hostname::current() else {
        return;
    };
    for profile in profiles::all() {
        lock::settle(&profile, &hostname);
    }
}
