use std::fs::File;
use std::io::{BufWriter, Read, Write};
use std::path::Path;
use std::sync::OnceLock;
use std::time::Duration;

use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const USER_AGENT: &str = "Luft Software (https://github.com/Lantharos)";
pub const OFFLINE: &str = "You're offline, or the server couldn't be reached.";
pub const MISSING: &str = "That isn't available any more.";

pub fn failure(error: ureq::Error) -> String {
    match error {
        ureq::Error::StatusCode(404 | 410) => MISSING.into(),
        _ => OFFLINE.into(),
    }
}

pub fn agent() -> &'static Agent {
    static AGENT: OnceLock<Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        Agent::config_builder()
            .user_agent(USER_AGENT)
            .timeout_connect(Some(Duration::from_secs(15)))
            .timeout_recv_response(Some(Duration::from_secs(30)))
            .tls_config(
                TlsConfig::builder()
                    .root_certs(RootCerts::PlatformVerifier)
                    .build(),
            )
            .build()
            .into()
    })
}

pub fn text(url: &str) -> Result<String, String> {
    read(agent().get(url).call().map_err(failure)?)
}

pub fn read(response: ureq::http::Response<ureq::Body>) -> Result<String, String> {
    let mut body = String::new();
    response
        .into_body()
        .into_reader()
        .read_to_string(&mut body)
        .map_err(|_| OFFLINE.to_string())?;
    Ok(body)
}

pub fn download(url: &str, destination: &Path, task: Task) -> Result<(), String> {
    let response = agent().get(url).call().map_err(failure)?;
    let total = response.body().content_length();
    let mut body = response
        .into_body()
        .into_with_config()
        .limit(u64::MAX)
        .reader();
    let mut file = BufWriter::new(File::create(destination).map_err(|error| error.to_string())?);
    let mut buffer = vec![0u8; 256 * 1024];
    let mut received = 0u64;
    loop {
        if task.cancel.is_cancelled() {
            drop(file);
            let _ = std::fs::remove_file(destination);
            return Err(CANCELLED.into());
        }
        let read = body
            .read(&mut buffer)
            .map_err(|_| "The download stopped before it finished.".to_string())?;
        if read == 0 {
            break;
        }
        file.write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        received += read as u64;
        task.progress(
            Stage::Downloading,
            total.map(|total| received as f32 / total.max(1) as f32),
        );
    }
    file.flush().map_err(|error| error.to_string())
}
