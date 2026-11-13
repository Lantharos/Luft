use luft_dbus::runtime::block_on;
use luft_software::apps::toolbox::{Available, Repositories};
use luft_software::system::system_packages;
use schelf_core::catalog::tools;
use schelf_core::operations::Job;

use super::{Candidate, Catalog, Kind};

pub const TITLE: &str = "your software sources";

fn candidates(found: Vec<Available>) -> Vec<Candidate> {
    if found.is_empty() {
        return Vec::new();
    }
    let installed = block_on(system_packages::list())
        .map(|packages| packages.requested)
        .unwrap_or_default();
    found
        .into_iter()
        .map(|package| Candidate {
            catalog: Catalog::System,
            installed: installed.contains(&package.package),
            kind: Kind::System,
            name: package.package.clone(),
            id: package.package,
            summary: package.summary,
        })
        .collect()
}

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    tools::search_in(Repositories::Added, query).map(candidates)
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    Ok(candidates(
        tools::find_in(Repositories::Added, name)?
            .into_iter()
            .collect(),
    ))
}

pub fn install(package: &str) -> (String, Job) {
    (
        format!("system/{package}"),
        Job::InstallSystemPackages {
            packages: vec![package.to_owned()],
        },
    )
}
