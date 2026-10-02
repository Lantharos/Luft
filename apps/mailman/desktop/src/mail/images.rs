use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::Duration;

use sha2::{Digest, Sha256};

const MAX_IMAGE_BYTES: u64 = 8 * 1024 * 1024;
const TIMEOUT: Duration = Duration::from_secs(12);
const PARALLEL: usize = 6;
const USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_global(Some(TIMEOUT))
        .user_agent(USER_AGENT)
        .build()
        .into()
}

fn cached_path(folder: &Path, url: &str) -> PathBuf {
    let digest = Sha256::digest(url.as_bytes());
    folder.join(
        digest
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect::<String>(),
    )
}

fn download(agent: &ureq::Agent, url: &str, path: &Path) -> Option<()> {
    let response = agent.get(url).call().ok()?;
    let is_image = response
        .headers()
        .get("content-type")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|kind| kind.starts_with("image/"));
    if !is_image {
        return None;
    }
    let mut bytes = Vec::new();
    response
        .into_body()
        .into_reader()
        .take(MAX_IMAGE_BYTES)
        .read_to_end(&mut bytes)
        .ok()?;
    std::fs::write(path, bytes).ok()
}

pub fn fetch(urls: Vec<String>, folder: &Path) -> Vec<(String, Option<String>)> {
    std::fs::create_dir_all(folder).ok();
    let agent = agent();
    let chunk = urls.len().div_ceil(PARALLEL).max(1);
    std::thread::scope(|scope| {
        let workers: Vec<_> = urls
            .chunks(chunk)
            .map(|urls| {
                let agent = agent.clone();
                scope.spawn(move || {
                    urls.iter()
                        .map(|url| {
                            let path = cached_path(folder, url);
                            let ready = path.exists() || download(&agent, url, &path).is_some();
                            (
                                url.clone(),
                                ready.then(|| path.to_string_lossy().into_owned()),
                            )
                        })
                        .collect::<Vec<_>>()
                })
            })
            .collect();
        workers
            .into_iter()
            .flat_map(|worker| worker.join().unwrap_or_default())
            .collect()
    })
}
