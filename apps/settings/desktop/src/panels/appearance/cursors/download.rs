use std::fs::File;
use std::io::{BufWriter, Read, Write};
use std::path::Path;

use super::install::Progress;
use super::store;

const MAX_DOWNLOAD_BYTES: u64 = 128 * 1024 * 1024;
const REPORT_EVERY_BYTES: u64 = 256 * 1024;
const TOO_LARGE: &str = "This download is larger than a cursor theme should be";
const INTERRUPTED: &str = "The download stopped before it finished. Try again.";

pub fn download(url: &str, into: &Path, report: &impl Fn(Progress)) -> Result<(), String> {
    let response = store::agent()
        .get(url)
        .call()
        .map_err(|_| "GNOME-Look couldn't send this download. Try again later.".to_string())?;
    let total = response.body().content_length();
    if total.is_some_and(|total| total > MAX_DOWNLOAD_BYTES) {
        return Err(TOO_LARGE.into());
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
            .map_err(|_| INTERRUPTED.to_string())?;
        if read == 0 {
            break;
        }
        file.write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        received += read as u64;
        if received - reported >= REPORT_EVERY_BYTES {
            report(Progress::Downloading { received, total });
            reported = received;
        }
    }
    file.flush().map_err(|error| error.to_string())?;
    report(Progress::Downloading { received, total });
    Ok(())
}
