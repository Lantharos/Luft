use serde::Serialize;

use super::{Installation, Installed, columns, installed, query, size};

const UPDATE_COLUMNS: &str = "--columns=ref:f,origin:f,version:f,download-size:f";

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    #[serde(flatten)]
    pub installed: Installed,
    pub new_version: String,
    pub download_size: u64,
}

pub fn updates() -> Result<Vec<Update>, String> {
    let current = installed()?;
    let listed: Vec<Result<String, String>> = std::thread::scope(|scope| {
        let workers: Vec<_> = Installation::ALL
            .map(|installation| {
                scope
                    .spawn(move || query(installation, &["remote-ls", "--updates", UPDATE_COLUMNS]))
            })
            .into_iter()
            .collect();
        workers
            .into_iter()
            .map(|worker| {
                worker
                    .join()
                    .unwrap_or_else(|_| Err("Flatpak stopped unexpectedly.".into()))
            })
            .collect()
    });
    if listed.iter().all(Result::is_err) {
        return Err(listed.into_iter().find_map(Result::err).unwrap_or_default());
    }
    let mut updates = Vec::new();
    for (installation, output) in Installation::ALL.into_iter().zip(listed) {
        let Ok(output) = output else { continue };
        for line in output.lines() {
            let [reference, origin, version, download] = columns(line)[..] else {
                continue;
            };
            let Some(installed) = current.iter().find(|item| {
                item.installation == installation
                    && item.reference == reference
                    && item.origin == origin
            }) else {
                continue;
            };
            updates.push(Update {
                installed: installed.clone(),
                new_version: version.to_owned(),
                download_size: size(download),
            });
        }
    }
    Ok(updates)
}
