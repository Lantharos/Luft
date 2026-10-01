use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::Proxy;

use super::package::PackageId;
use super::transaction::{PATH, SERVICE};

const INTERFACE: &str = "org.freedesktop.PackageKit.Offline";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Results {
    pub success: bool,
    pub packages: usize,
    pub finished: u64,
    pub error: Option<String>,
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, SERVICE, PATH, INTERFACE).map_err(|error| error.to_string())
}

pub fn prepared() -> Result<Vec<PackageId>, String> {
    let ids: Vec<String> = proxy()?
        .call("GetPrepared", &())
        .map_err(|error| error.to_string())?;
    Ok(ids.iter().filter_map(|id| PackageId::parse(id)).collect())
}

pub fn results() -> Option<Results> {
    let (success, ids, _role, finished, _code, description): (
        bool,
        Vec<String>,
        u32,
        u64,
        u32,
        String,
    ) = proxy().ok()?.call("GetResults", &()).ok()?;
    Some(Results {
        success,
        packages: ids.len(),
        finished,
        error: (!success && !description.is_empty()).then_some(description),
    })
}
