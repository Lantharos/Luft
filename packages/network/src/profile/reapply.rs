use std::collections::HashMap;

use luft_app::dbus::{self, failed};
use zbus::{OwnedObjectPath, Proxy, Variant};

use super::super::actions::{self, Activate};
use super::super::{ACTIVE, DEVICE, SERVICE, objects};

type Applied<'a> = HashMap<&'a str, HashMap<&'a str, Variant<'a>>>;

async fn reapply_on(device: &str) -> Result<(), String> {
    Proxy::new(dbus::system().await?, SERVICE, device, DEVICE)
        .await
        .map_err(failed)?
        .call_method("Reapply", &(Applied::new(), 0u64, 0u32))
        .await
        .map(drop)
        .map_err(failed)
}

pub async fn reapply(path: &str) -> Result<(), String> {
    let objects = objects().await?;
    let Some(active) = objects
        .implementing(ACTIVE)
        .find(|active| active.link("Connection").as_deref() == Some(path))
    else {
        return Ok(());
    };
    let device = active
        .get::<Vec<OwnedObjectPath>>("Devices")
        .unwrap_or_default()
        .first()
        .map(ToString::to_string);
    if !active.flag("Vpn")
        && let Some(device) = &device
        && reapply_on(device).await.is_ok()
    {
        return Ok(());
    }
    actions::activate(Activate {
        connection: Some(path.to_owned()),
        device,
    })
    .await
}
