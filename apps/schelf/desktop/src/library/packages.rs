use std::collections::HashMap;
use std::process::Command;

use gio::prelude::*;
use luft_app::apps::App;
use luft_software::classify::Classification;

use super::{InstalledApp, Source};
use crate::catalog::fedora_component;

struct Package {
    version: String,
    size: u64,
    vendor: String,
}

fn query(names: &[&str]) -> HashMap<String, Package> {
    let Ok(output) = Command::new("rpm")
        .args([
            "--query",
            "--queryformat",
            "%{NAME}\t%{VERSION}\t%{SIZE}\t%{VENDOR}\n",
        ])
        .args(names)
        .output()
    else {
        return HashMap::new();
    };
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(|line| {
            let [name, version, size, vendor] = line.split('\t').collect::<Vec<_>>()[..] else {
                return None;
            };
            Some((
                name.to_owned(),
                Package {
                    version: version.to_owned(),
                    size: size.parse().unwrap_or(0),
                    vendor: if vendor == "(none)" {
                        String::new()
                    } else {
                        vendor.to_owned()
                    },
                },
            ))
        })
        .collect()
}

pub fn installed() -> Vec<InstalledApp> {
    let classification = Classification::current();
    let names: Vec<&str> = classification.apps().map(|(name, _)| name).collect();
    let packages = query(&names);
    classification
        .apps()
        .filter_map(|(name, desktop_ids)| {
            let desktop = desktop_ids.first()?.clone();
            let info = gio_unix::DesktopAppInfo::new(&desktop)?;
            let app = App::new(desktop.clone(), &info);
            let package = packages.get(name);
            let component = fedora_component(name);
            Some(InstalledApp {
                key: format!("package/{name}"),
                source: Source::Package,
                id: component
                    .map(|component| component.id)
                    .unwrap_or_else(|| desktop.clone()),
                summary: info
                    .description()
                    .map(|description| description.to_string()),
                name: app.name,
                icon: app.icon,
                desktop: Some(desktop),
                version: package.map(|package| package.version.clone()),
                size: package.map_or(0, |package| package.size),
                origin: package
                    .map(|package| package.vendor.clone())
                    .unwrap_or_default(),
                installation: None,
                reference: None,
                package: Some(name.to_owned()),
                path: None,
            })
        })
        .collect()
}
