use luft_app::{Commands, block_on};
use luft_software::system::repositories::{self, Described, Draft};
use luft_software::system::system_packages::{self, Origin};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;

/// A repository and what the system said about it, to be trusted before it's added.
#[derive(Serialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Bundled {
    pub draft: Draft,
    pub described: Described,
    pub added: bool,
}

impl Bundled {
    pub fn check(draft: Draft) -> Result<Self, String> {
        let described = block_on(system_packages::describe(&draft))?;
        Ok(Self {
            added: repositories::is_added(&draft),
            draft,
            described,
        })
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct Added {
    file: String,
    name: String,
    url: String,
    packages: Vec<String>,
}

fn list() -> Result<Vec<Added>, String> {
    let packages = block_on(system_packages::list())?;
    Ok(packages
        .repositories
        .iter()
        .map(|repository| {
            let origin = Origin::Repository(repository.file.clone());
            Added {
                file: repository.file.clone(),
                name: repository.name().to_owned(),
                url: repository
                    .sources
                    .first()
                    .map(|source| source.url.clone())
                    .unwrap_or_default(),
                packages: packages
                    .requested()
                    .filter(|package| package.origin == origin)
                    .map(|package| package.name.clone())
                    .collect(),
            }
        })
        .collect())
}

#[derive(Deserialize, Type)]
struct Fetch {
    source: String,
}

#[derive(Deserialize, Type)]
struct Add {
    draft: Draft,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("sources_list", |_: Value| list())
        .command("sources_fetch", |Fetch { source }| {
            Bundled::check(repositories::fetch(source.trim())?)
        })
        .command("sources_add", |Add { draft }| {
            block_on(system_packages::add_repository(&draft))
        })
}
