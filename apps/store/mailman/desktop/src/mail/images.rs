use std::io::Read;
use std::net::IpAddr;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

use sha2::{Digest, Sha256};
use ureq::config::Config;
use ureq::http::Uri;
use ureq::unversioned::resolver::{DefaultResolver, ResolvedSocketAddrs, Resolver};
use ureq::unversioned::transport::{DefaultConnector, NextTimeout};

const MAX_IMAGE_BYTES: u64 = 8 * 1024 * 1024;
const TIMEOUT: Duration = Duration::from_secs(12);
const PARALLEL: usize = 6;
const USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

static DOWNLOADS: AtomicU64 = AtomicU64::new(0);

fn is_on_the_internet(address: IpAddr) -> bool {
    match address {
        IpAddr::V4(address) => {
            let [first, second, ..] = address.octets();
            !(address.is_loopback()
                || address.is_private()
                || address.is_link_local()
                || address.is_unspecified()
                || address.is_broadcast()
                || address.is_multicast()
                || first == 0
                || (first == 100 && second & 0xc0 == 64))
        }
        IpAddr::V6(address) => match address.to_ipv4_mapped() {
            Some(mapped) => is_on_the_internet(IpAddr::V4(mapped)),
            None => {
                !(address.is_loopback()
                    || address.is_unspecified()
                    || address.is_unique_local()
                    || address.is_unicast_link_local()
                    || address.is_multicast())
            }
        },
    }
}

#[derive(Debug)]
struct InternetOnly(DefaultResolver);

impl Resolver for InternetOnly {
    fn resolve(
        &self,
        uri: &Uri,
        config: &Config,
        timeout: NextTimeout,
    ) -> Result<ResolvedSocketAddrs, ureq::Error> {
        let found = self.0.resolve(uri, config, timeout)?;
        if config.proxy().is_some_and(|proxy| proxy.uri() == uri) {
            return Ok(found);
        }
        let mut allowed = self.empty();
        for address in found
            .iter()
            .filter(|address| is_on_the_internet(address.ip()))
        {
            allowed.push(*address);
        }
        if allowed.is_empty() {
            return Err(ureq::Error::HostNotFound);
        }
        Ok(allowed)
    }
}

fn agent() -> ureq::Agent {
    ureq::Agent::with_parts(
        ureq::Agent::config_builder()
            .timeout_global(Some(TIMEOUT))
            .user_agent(USER_AGENT)
            .build(),
        DefaultConnector::default(),
        InternetOnly(DefaultResolver::default()),
    )
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
    let partial = path.with_extension(DOWNLOADS.fetch_add(1, Ordering::Relaxed).to_string());
    std::fs::write(&partial, bytes)
        .and_then(|()| std::fs::rename(&partial, path))
        .ok()
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_addresses_on_the_internet_are_fetched() {
        for address in [
            "127.0.0.1",
            "10.0.0.1",
            "172.16.4.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "0.0.0.0",
            "::1",
            "::",
            "fe80::1",
            "fd00::1",
            "::ffff:192.168.1.1",
        ] {
            assert!(!is_on_the_internet(address.parse().unwrap()), "{address}");
        }
        for address in ["93.184.216.34", "100.128.0.1", "2606:4700::1111"] {
            assert!(is_on_the_internet(address.parse().unwrap()), "{address}");
        }
    }
}
