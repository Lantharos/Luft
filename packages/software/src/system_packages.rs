use futures_util::future::{Either, select};
use futures_util::{StreamExt, pin_mut};
use luft_app::dbus::{self, failed, service::Service};
use serde::{Deserialize, Serialize};

use crate::progress::Stage;
use crate::task::Task;

const SYSTEM_PACKAGES: Service = Service {
    name: "com.lantharos.Updater1",
    path: "/com/lantharos/Updater1",
    interface: "com.lantharos.Updater1.SystemPackages",
};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub arch: String,
    pub summary: String,
    pub requested: bool,
    pub units: Vec<String>,
}

/// The Fedora packages added to the system, merged over it as a system extension.
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SystemPackages {
    pub requested: Vec<String>,
    pub packages: Vec<Package>,
    pub services: Vec<String>,
    pub pending: bool,
}

impl SystemPackages {
    /// The packages asked for, without what they brought along.
    pub fn requested(&self) -> impl Iterator<Item = &Package> {
        self.packages.iter().filter(|package| package.requested)
    }
}

pub async fn list() -> Result<SystemPackages, String> {
    let text: String = SYSTEM_PACKAGES
        .proxy()
        .await?
        .call("List", &())
        .await
        .map_err(|error| dbus::explain(&error))?;
    serde_json::from_str(&text).map_err(failed)
}

fn stage(step: &str, method: &str) -> Stage {
    match (step, method) {
        ("downloading", _) => Stage::Downloading,
        ("building", "Remove") => Stage::Removing,
        ("building", _) => Stage::Installing,
        _ => Stage::Finishing,
    }
}

async fn change(method: &str, names: &[String], task: Task<'_>) -> Result<(), String> {
    let connection = dbus::system().await?;
    let signals =
        dbus::objects::signals(connection, SYSTEM_PACKAGES.name, SYSTEM_PACKAGES.path).await?;
    task.progress(Stage::Preparing, None);
    let body = (names,);
    let call = SYSTEM_PACKAGES.change::<_, ()>(method, &body);
    let steps = signals.for_each(|message| {
        if let Ok(message) = message
            && message
                .header()
                .member()
                .is_some_and(|member| member == "Step")
            && let Ok((step,)) = message.body().deserialize::<(String,)>()
        {
            task.progress(stage(&step, method), None);
        }
        async {}
    });
    pin_mut!(call, steps);
    match select(call, steps).await {
        Either::Left((result, _)) => result.map_err(|error| dbus::explain(&error)),
        Either::Right(_) => Err("The update service stopped unexpectedly.".to_owned()),
    }
}

/// Adds Fedora packages to the system. Returns once the running system has them, with their
/// services started.
pub async fn install(names: &[String], task: Task<'_>) -> Result<(), String> {
    change("Install", names, task).await
}

/// Removes system packages and everything they brought, leaving the system as it was before.
pub async fn remove(names: &[String], task: Task<'_>) -> Result<(), String> {
    change("Remove", names, task).await
}
