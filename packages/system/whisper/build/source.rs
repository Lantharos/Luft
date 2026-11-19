use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use std::time::Duration;

use flate2::read::GzDecoder;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

#[derive(Deserialize)]
pub struct Upstream {
    repository: String,
    version: String,
    sha256: String,
}

impl Upstream {
    pub fn read(path: &Path) -> Upstream {
        let text = fs::read_to_string(path).expect("upstream.json is readable");
        serde_json::from_str(&text).expect("upstream.json names a repository, version and sha256")
    }

    fn archive(&self) -> String {
        format!(
            "{}/archive/refs/tags/v{}.tar.gz",
            self.repository, self.version
        )
    }

    /// The release's sources unpacked under `out`, downloaded only once per build folder.
    pub fn unpacked(&self, out: &Path) -> PathBuf {
        let tree = out.join(format!("whisper.cpp-{}", self.version));
        let finished = out.join(format!("whisper.cpp-{}.sha256", self.version));
        if fs::read_to_string(&finished).is_ok_and(|sum| sum == self.sha256) {
            return tree;
        }
        if tree.exists() {
            fs::remove_dir_all(&tree).expect("an unfinished unpack can be removed");
        }
        let archive = out.join(format!("whisper.cpp-{}.tar.gz", self.version));
        self.download(&archive);
        tar::Archive::new(GzDecoder::new(
            File::open(&archive).expect("the archive was saved"),
        ))
        .unpack(out)
        .expect("the whisper.cpp archive unpacks");
        fs::remove_file(&archive).expect("the archive can be removed");
        fs::write(finished, &self.sha256).expect("the unpack can be recorded");
        tree
    }

    fn download(&self, to: &Path) {
        let agent: Agent = Agent::config_builder()
            .https_only(true)
            .timeout_connect(Some(Duration::from_secs(30)))
            .timeout_global(Some(Duration::from_secs(600)))
            .tls_config(
                TlsConfig::builder()
                    .root_certs(RootCerts::PlatformVerifier)
                    .build(),
            )
            .build()
            .into();
        let url = self.archive();
        let response = agent
            .get(&url)
            .call()
            .unwrap_or_else(|error| panic!("couldn't download {url}: {error}"));
        let mut reader = response.into_body().into_reader();
        let mut file = File::create(to).expect("the archive can be saved");
        let mut hash = Sha256::new();
        let mut buffer = vec![0; 1 << 16];
        loop {
            let read = match reader.read(&mut buffer) {
                Ok(0) => break,
                Ok(read) => read,
                Err(error) if error.kind() == io::ErrorKind::Interrupted => continue,
                Err(error) => panic!("couldn't download {url}: {error}"),
            };
            hash.update(&buffer[..read]);
            file.write_all(&buffer[..read])
                .expect("the archive can be saved");
        }
        let sum: String = hash
            .finalize()
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect();
        assert_eq!(
            sum, self.sha256,
            "{url} isn't the release upstream.json names"
        );
    }
}
