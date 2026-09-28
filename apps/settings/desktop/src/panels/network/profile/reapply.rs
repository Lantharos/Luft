use std::collections::HashMap;

use luft_app::dbus;
use luft_app::dbus::objects::failed;
use zbus::blocking::Proxy;
use zbus::zvariant::{OwnedObjectPath, Value};

use super::super::actions::{self, Activate};
use super::super::{ACTIVE, DEVICE, SERVICE, objects};

type Applied<'a> = HashMap<&'a str, HashMap<&'a str, Value<'a>>>;

fn reapply_on(device: &str) -> Result<(), String> {
    Proxy::new(dbus::system()?, SERVICE, device, DEVICE)
        .map_err(failed)?
        .call_method("Reapply", &(Applied::new(), 0u64, 0u32))
        .map(drop)
        .map_err(failed)
}

pub fn reapply(path: &str) -> Result<(), String> {
    let objects = objects()?;
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
        && reapply_on(device).is_ok()
    {
        return Ok(());
    }
    actions::activate(Activate {
        connection: Some(path.to_owned()),
        device,
    })
}
