use std::collections::HashMap;
use std::env;
use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, Instant};

use parking_lot::Mutex;

use super::cache::{Source, ThumbnailSize};

const POLL_INTERVAL: Duration = Duration::from_millis(25);
const TIMEOUT: Duration = Duration::from_secs(30);
const ENTRY_SECTION: &str = "[Thumbnailer Entry]";

pub enum Failure {
    Cancelled,
    Failed(String),
}

pub struct Thumbnailer {
    exec: Vec<String>,
}

#[derive(Default)]
pub struct Registry {
    by_type: HashMap<String, Arc<Thumbnailer>>,
    resolved: Mutex<HashMap<String, Option<Arc<Thumbnailer>>>>,
}

impl Registry {
    pub fn load() -> Self {
        let mut by_type = HashMap::new();
        for folder in folders() {
            let Ok(entries) = fs::read_dir(&folder) else {
                continue;
            };
            let mut files: Vec<PathBuf> = entries
                .flatten()
                .map(|entry| entry.path())
                .filter(|path| {
                    path.extension()
                        .is_some_and(|extension| extension == "thumbnailer")
                })
                .collect();
            files.sort();
            for file in files {
                let Some((thumbnailer, types)) = parse(&file) else {
                    continue;
                };
                let thumbnailer = Arc::new(thumbnailer);
                for kind in types {
                    by_type.entry(kind).or_insert_with(|| thumbnailer.clone());
                }
            }
        }
        Self {
            by_type,
            resolved: Mutex::default(),
        }
    }

    pub fn find(&self, mime: &str) -> Option<Arc<Thumbnailer>> {
        if let Some(thumbnailer) = self.by_type.get(mime) {
            return Some(thumbnailer.clone());
        }
        self.resolved
            .lock()
            .entry(mime.to_string())
            .or_insert_with(|| {
                self.by_type
                    .iter()
                    .find(|(declared, _)| gio::content_type_is_a(mime, declared))
                    .map(|(_, thumbnailer)| thumbnailer.clone())
            })
            .clone()
    }
}

impl Thumbnailer {
    pub fn run(
        &self,
        source: &Source,
        size: ThumbnailSize,
        cancelled: impl Fn() -> bool,
    ) -> Result<PathBuf, Failure> {
        let output = scratch_file();
        let arguments: Vec<String> = self
            .exec
            .iter()
            .map(|argument| expand(argument, source, size, &output))
            .collect();
        let (program, arguments) = arguments
            .split_first()
            .ok_or_else(|| Failure::Failed("Empty thumbnailer command".to_string()))?;
        let mut child = Command::new(program)
            .args(arguments)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|error| Failure::Failed(error.to_string()))?;
        let started = Instant::now();
        let status = loop {
            if let Some(status) = child
                .try_wait()
                .map_err(|error| Failure::Failed(error.to_string()))?
            {
                break status;
            }
            let expired = started.elapsed() >= TIMEOUT;
            if expired || cancelled() {
                let _ = child.kill();
                let _ = child.wait();
                let _ = fs::remove_file(&output);
                return Err(if expired {
                    Failure::Failed("The thumbnailer took too long".to_string())
                } else {
                    Failure::Cancelled
                });
            }
            thread::sleep(POLL_INTERVAL);
        };
        if status.success() && output.is_file() {
            Ok(output)
        } else {
            let _ = fs::remove_file(&output);
            Err(Failure::Failed(format!("{program} exited with {status}")))
        }
    }
}

fn parse(file: &Path) -> Option<(Thumbnailer, Vec<String>)> {
    let content = fs::read_to_string(file).ok()?;
    let mut in_entry = false;
    let mut values: HashMap<&str, &str> = HashMap::new();
    for line in content.lines().map(str::trim) {
        if line.starts_with('[') {
            in_entry = line == ENTRY_SECTION;
        } else if in_entry && let Some((key, value)) = line.split_once('=') {
            values.insert(key.trim(), value.trim());
        }
    }
    if let Some(try_exec) = values.get("TryExec")
        && !is_executable(try_exec)
    {
        return None;
    }
    let exec: Vec<String> = values
        .get("Exec")?
        .split_whitespace()
        .map(str::to_string)
        .collect();
    let types = values
        .get("MimeType")?
        .split(';')
        .filter(|kind| !kind.is_empty())
        .map(str::to_string)
        .collect();
    (!exec.is_empty()).then_some((Thumbnailer { exec }, types))
}

fn expand(argument: &str, source: &Source, size: ThumbnailSize, output: &Path) -> String {
    let mut expanded = String::with_capacity(argument.len());
    let mut characters = argument.chars();
    while let Some(character) = characters.next() {
        if character != '%' {
            expanded.push(character);
            continue;
        }
        match characters.next() {
            Some('u') => expanded.push_str(&source.uri),
            Some('i') => expanded.push_str(&source.path.to_string_lossy()),
            Some('o') => expanded.push_str(&output.to_string_lossy()),
            Some('s') => expanded.push_str(&size.pixels().to_string()),
            Some('%') => expanded.push('%'),
            Some(other) => {
                expanded.push('%');
                expanded.push(other);
            }
            None => expanded.push('%'),
        }
    }
    expanded
}

fn folders() -> Vec<PathBuf> {
    let mut folders: Vec<PathBuf> = dirs::data_dir().into_iter().collect();
    folders.extend(
        env::var("XDG_DATA_DIRS")
            .ok()
            .filter(|dirs| !dirs.is_empty())
            .unwrap_or_else(|| "/usr/local/share:/usr/share".to_string())
            .split(':')
            .filter(|folder| !folder.is_empty())
            .map(PathBuf::from),
    );
    let mut unique = Vec::with_capacity(folders.len());
    for folder in folders
        .into_iter()
        .map(|folder| folder.join("thumbnailers"))
    {
        if !unique.contains(&folder) {
            unique.push(folder);
        }
    }
    unique
}

fn is_executable(program: &str) -> bool {
    let runnable = |path: &Path| {
        fs::metadata(path)
            .is_ok_and(|metadata| metadata.is_file() && metadata.permissions().mode() & 0o111 != 0)
    };
    if program.contains('/') {
        return runnable(Path::new(program));
    }
    env::var_os("PATH")
        .is_some_and(|paths| env::split_paths(&paths).any(|folder| runnable(&folder.join(program))))
}

fn scratch_file() -> PathBuf {
    static NEXT: AtomicU64 = AtomicU64::new(0);
    let folder = dirs::runtime_dir().unwrap_or_else(env::temp_dir);
    folder.join(format!(
        "luft-thumbnail-{}-{}.png",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ))
}
