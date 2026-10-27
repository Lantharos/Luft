use luft_app::block_on;
use luft_software::system::system_packages::{self, SystemPackages};

use super::{InstalledApp, Source};

fn app(name: &str, packages: &SystemPackages) -> InstalledApp {
    let merged = packages
        .packages
        .iter()
        .find(|package| package.name == name);
    let services = merged
        .map(|package| {
            package
                .units
                .iter()
                .filter(|unit| packages.services.contains(unit))
                .cloned()
                .collect()
        })
        .unwrap_or_default();
    InstalledApp {
        key: format!("system/{name}"),
        source: Source::System,
        id: name.to_owned(),
        desktop: merged.and_then(|package| package.apps.first().cloned()),
        name: name.to_owned(),
        summary: merged.map(|package| package.summary.clone()),
        icon: None,
        version: merged.map(|package| package.version.clone()),
        size: 0,
        origin: merged.map_or_else(
            || "Fedora".to_owned(),
            |package| packages.origin_of(&package.origin),
        ),
        installation: None,
        reference: None,
        package: Some(name.to_owned()),
        path: None,
        commands: Vec::new(),
        services,
    }
}

pub fn installed() -> Vec<InstalledApp> {
    let packages = block_on(system_packages::list())
        .inspect_err(|error| eprintln!("Listing the system packages: {error}"))
        .unwrap_or_default();
    packages
        .requested
        .iter()
        .map(|name| app(name, &packages))
        .collect()
}
