use std::collections::HashMap;
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail};
use sha2::{Digest, Sha256};

use super::manifest::{Entry, File};
use super::verified::{self, Verified};

const ATTEMPTS: u32 = 4;
pub(super) const BUFFER: usize = 256 * 1024;
const REPORT_EVERY: Duration = Duration::from_millis(250);

#[derive(Clone)]
pub struct Progress {
    pub received: u64,
    pub total: u64,
    pub problem: Option<String>,
}

struct Job {
    progress: Arc<Mutex<Progress>>,
    cancel: Arc<AtomicBool>,
}

/// Models being downloaded. A download picks up where it stopped, checks
/// every file against the list in the image, and only then moves it in place.
#[derive(Clone, Default)]
pub struct Downloads {
    jobs: Arc<Mutex<HashMap<String, Job>>>,
}

#[derive(Debug)]
struct Cancelled;

impl std::fmt::Display for Cancelled {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str("The download was cancelled")
    }
}

impl std::error::Error for Cancelled {}

impl Downloads {
    pub fn progress(&self, id: &str) -> Option<Progress> {
        let jobs = self.jobs.lock().expect("downloads lock");
        jobs.get(id)
            .map(|job| job.progress.lock().expect("progress lock").clone())
    }

    pub fn active(&self) -> bool {
        let jobs = self.jobs.lock().expect("downloads lock");
        jobs.values().any(|job| {
            job.progress
                .lock()
                .expect("progress lock")
                .problem
                .is_none()
        })
    }

    pub fn start(
        &self,
        entry: &'static Entry,
        folder: PathBuf,
        received: u64,
        changed: impl Fn() + Send + 'static,
    ) -> bool {
        let mut jobs = self.jobs.lock().expect("downloads lock");
        if jobs.get(&entry.id).is_some_and(|job| {
            job.progress
                .lock()
                .expect("progress lock")
                .problem
                .is_none()
        }) {
            return false;
        }
        let progress = Arc::new(Mutex::new(Progress {
            received,
            total: entry.size(),
            problem: None,
        }));
        let cancel = Arc::new(AtomicBool::new(false));
        jobs.insert(
            entry.id.clone(),
            Job {
                progress: progress.clone(),
                cancel: cancel.clone(),
            },
        );
        let downloads = self.clone();
        std::thread::spawn(move || {
            let result = download(entry, &folder, &cancel, |received| {
                progress.lock().expect("progress lock").received = received;
                changed();
            });
            let mut jobs = downloads.jobs.lock().expect("downloads lock");
            let current = jobs
                .get(&entry.id)
                .is_some_and(|job| Arc::ptr_eq(&job.progress, &progress));
            match result {
                Err(error) if current && !error.is::<Cancelled>() => {
                    progress.lock().expect("progress lock").problem = Some(format!("{error:#}"));
                }
                _ if current => {
                    jobs.remove(&entry.id);
                }
                _ => {}
            }
            drop(jobs);
            changed();
        });
        true
    }

    pub fn cancel(&self, id: &str) -> bool {
        let job = self.jobs.lock().expect("downloads lock").remove(id);
        if let Some(job) = &job {
            job.cancel.store(true, Ordering::Relaxed);
        }
        job.is_some()
    }
}

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_connect(Some(Duration::from_secs(15)))
        .timeout_recv_response(Some(Duration::from_secs(30)))
        .build()
        .into()
}

fn download(
    entry: &Entry,
    folder: &Path,
    cancel: &AtomicBool,
    mut report: impl FnMut(u64),
) -> Result<()> {
    fs::create_dir_all(folder).with_context(|| format!("Couldn't make {}", folder.display()))?;
    let agent = agent();
    let mut done = 0;
    let mut last_report = Instant::now();
    let mut verified = Verified::load(folder);
    for file in &entry.files {
        let target = folder.join(&file.name);
        if verified.confirm(&target, file)? {
            done += file.size;
            continue;
        }
        let mut attempt = 0;
        loop {
            attempt += 1;
            let result = fetch(
                &agent,
                &entry.url(file),
                file,
                &target,
                cancel,
                |received| {
                    if last_report.elapsed() >= REPORT_EVERY {
                        last_report = Instant::now();
                        report(done + received);
                    }
                },
            );
            match result {
                Ok(()) => {
                    verified.record(&target, file)?;
                    break;
                }
                Err(error) if error.is::<Cancelled>() || attempt >= ATTEMPTS => return Err(error),
                Err(_) => std::thread::sleep(Duration::from_secs(2u64.pow(attempt))),
            }
        }
        done += file.size;
        report(done);
    }
    remove_other_files(entry, folder)
}

fn remove_other_files(entry: &Entry, folder: &Path) -> Result<()> {
    for file in fs::read_dir(folder)?.flatten() {
        let name = file.file_name();
        if name != verified::RECORD && !entry.files.iter().any(|kept| *kept.name == *name) {
            fs::remove_file(file.path())?;
        }
    }
    Ok(())
}

fn partial_path(target: &Path) -> PathBuf {
    let mut name = target.file_name().unwrap_or_default().to_os_string();
    name.push(".part");
    target.with_file_name(name)
}

fn resume(part: &Path, size: u64) -> Result<(Sha256, u64)> {
    let mut hasher = Sha256::new();
    let Ok(mut existing) = fs::File::open(part) else {
        return Ok((hasher, 0));
    };
    if existing.metadata()?.len() > size {
        drop(existing);
        fs::remove_file(part)?;
        return Ok((hasher, 0));
    }
    let mut buffer = vec![0; BUFFER];
    let mut length = 0;
    loop {
        let read = existing.read(&mut buffer)?;
        if read == 0 {
            return Ok((hasher, length));
        }
        hasher.update(&buffer[..read]);
        length += read as u64;
    }
}

fn fetch(
    agent: &ureq::Agent,
    url: &str,
    file: &File,
    target: &Path,
    cancel: &AtomicBool,
    mut report: impl FnMut(u64),
) -> Result<()> {
    let part = partial_path(target);
    let (mut hasher, mut received) = resume(&part, file.size)?;
    if received < file.size {
        let mut request = agent.get(url);
        if received > 0 {
            request = request.header("Range", format!("bytes={received}-"));
        }
        let response = request
            .call()
            .with_context(|| format!("Couldn't reach {url}"))?;
        let mut output = OpenOptions::new().create(true).append(true).open(&part)?;
        if response.status() != 206 {
            output.set_len(0)?;
            hasher = Sha256::new();
            received = 0;
        }
        let mut body = response.into_body().into_reader();
        let mut buffer = vec![0; BUFFER];
        loop {
            if cancel.load(Ordering::Relaxed) {
                return Err(Cancelled.into());
            }
            let read = body
                .read(&mut buffer)
                .context("The download was interrupted")?;
            if read == 0 {
                break;
            }
            output.write_all(&buffer[..read])?;
            hasher.update(&buffer[..read]);
            received += read as u64;
            report(received);
        }
        output.sync_all()?;
    }
    if received != file.size {
        bail!("{} ended early", file.name);
    }
    if verified::hex(hasher.finalize()) != file.sha256 {
        fs::remove_file(&part)?;
        bail!(
            "{} didn't match what was expected, so it was thrown away",
            file.name
        );
    }
    fs::rename(&part, target)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_partial_download_resumes_from_its_length_and_hash() {
        let folder =
            std::env::temp_dir().join(format!("luft-speech-resume-{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        let part = folder.join("model.bin.part");
        fs::write(&part, b"hello ").unwrap();
        let (mut hasher, length) = resume(&part, 11).unwrap();
        assert_eq!(length, 6);
        hasher.update(b"world");
        assert_eq!(hasher.finalize()[..], Sha256::digest(b"hello world")[..]);

        let (_, length) = resume(&part, 3).unwrap();
        assert_eq!(length, 0);
        assert!(!part.exists());
        fs::remove_dir_all(folder).unwrap();
    }
}
