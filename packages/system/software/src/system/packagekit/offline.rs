use luft_app::dbus::{self, failed};
use serde::Serialize;
use specta::Type;
use zbus::Proxy;

use super::package::PackageId;
use super::transaction::{PATH, SERVICE};

const INTERFACE: &str = "org.freedesktop.PackageKit.Offline";

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Results {
    pub success: bool,
    pub packages: usize,
    pub finished: u64,
    pub error: Option<String>,
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, SERVICE, PATH, INTERFACE)
        .await
        .map_err(failed)
}

pub async fn prepared() -> Result<Vec<PackageId>, String> {
    let ids: Vec<String> = proxy()
        .await?
        .call("GetPrepared", &())
        .await
        .map_err(failed)?;
    Ok(ids.iter().filter_map(|id| PackageId::parse(id)).collect())
}

pub async fn results() -> Option<Results> {
    let (success, ids, _role, finished, _code, description): (
        bool,
        Vec<String>,
        u32,
        u64,
        u32,
        String,
    ) = proxy().await.ok()?.call("GetResults", &()).await.ok()?;
    Some(Results {
        success,
        packages: ids.len(),
        finished,
        error: (!success && !description.is_empty()).then_some(description),
    })
}
