use std::fs::File;
use std::io::{BufWriter, Read, Write};
use std::path::Path;

use luft_i18n::t;

use super::install::InstallProgress;
use super::store;
use crate::L10N;

const MAX_DOWNLOAD_BYTES: u64 = 128 * 1024 * 1024;
const REPORT_EVERY_BYTES: u64 = 256 * 1024;

pub fn download(url: &str, into: &Path, report: &impl Fn(InstallProgress)) -> Result<(), String> {
    let response = store::agent()
        .get(url)
        .call()
        .map_err(|_| t!(L10N, "desktop-cursors-download-refused"))?;
    let total = response.body().content_length();
    if total.is_some_and(|total| total > MAX_DOWNLOAD_BYTES) {
        return Err(t!(L10N, "desktop-cursors-download-too-large"));
    }
    let mut body = response
        .into_body()
        .into_with_config()
        .limit(MAX_DOWNLOAD_BYTES)
        .reader();
    let mut file = BufWriter::new(File::create(into).map_err(|error| error.to_string())?);
    let mut buffer = vec![0; 64 * 1024];
    let (mut received, mut reported) = (0, 0);
    loop {
        let read = body
            .read(&mut buffer)
            .map_err(|_| t!(L10N, "desktop-cursors-download-interrupted"))?;
        if read == 0 {
            break;
        }
        file.write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        received += read as u64;
        if received - reported >= REPORT_EVERY_BYTES {
            report(InstallProgress::Downloading { received, total });
            reported = received;
        }
    }
    file.flush().map_err(|error| error.to_string())?;
    report(InstallProgress::Downloading { received, total });
    Ok(())
}
