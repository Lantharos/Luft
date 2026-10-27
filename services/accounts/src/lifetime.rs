use std::time::Duration;

use anyhow::Result;
use tokio::time::sleep;
use zbus::Connection;

use crate::hub::Hub;

const UNIT: &str = "luft-accounts.service";
const SYSTEMD: &str = "org.freedesktop.systemd1";
const SYSTEMD_PATH: &str = "/org/freedesktop/systemd1";
const MANAGER: &str = "org.freedesktop.systemd1.Manager";
const LINGER: Duration = Duration::from_secs(60);

async fn manager<B>(session: &Connection, method: &str, body: &B) -> Result<zbus::Message>
where
    B: serde::Serialize + zbus::DynamicType,
{
    Ok(session
        .call_method(Some(SYSTEMD), SYSTEMD_PATH, Some(MANAGER), method, body)
        .await?)
}

async fn start_at_sign_in(session: &Connection, wanted: bool) -> Result<()> {
    let state: String = manager(session, "GetUnitFileState", &(UNIT,))
        .await?
        .body()
        .deserialize()?;
    if (state == "enabled") == wanted {
        return Ok(());
    }
    if wanted {
        manager(session, "EnableUnitFiles", &(&[UNIT], false, false)).await?;
    } else {
        manager(session, "DisableUnitFiles", &(&[UNIT], false)).await?;
    }
    manager(session, "Reload", &()).await?;
    Ok(())
}

pub async fn follow_accounts(session: &Connection, any: bool) {
    if let Err(error) = start_at_sign_in(session, any).await {
        eprintln!("Couldn't change whether accounts start at sign-in: {error:#}");
    }
}

pub async fn until_unneeded(hub: &Hub) {
    loop {
        if hub.needed() {
            hub.demand.notified().await;
            continue;
        }
        tokio::select! {
            () = sleep(LINGER) => return,
            () = hub.demand.notified() => {}
        }
    }
}
