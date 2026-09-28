use std::ffi::CString;
use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::mem::MaybeUninit;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

use super::operations::{OperationPhase, OperationStatus, OperationType, OperationsQueue};
use super::privileged::{is_permission_error, os, remove_path, run_pkexec};
use super::rename_no_replace;
use crate::drives;

const COPY_BUFFER_SIZE: usize = 1024 * 1024;
const PAUSE_POLL_INTERVAL: Duration = Duration::from_millis(120);

type Transfer = fn(&[PathBuf], &Path, &mut Tracker) -> Result<(), String>;

pub fn copy_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
) -> Result<String, String> {
    start(OperationType::Copy, sources, destination, queue, copy_all)
}

pub fn move_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
) -> Result<String, String> {
    start(OperationType::Move, sources, destination, queue, move_all)
}

fn start(
    op_type: OperationType,
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    transfer: Transfer,
) -> Result<String, String> {
    let destination = PathBuf::from(destination);
    if !destination.is_dir() {
        return Err("Destination must be a directory".to_string());
    }
    let sources: Vec<PathBuf> = sources.into_iter().map(PathBuf::from).collect();
    if sources.iter().any(|source| destination.starts_with(source)) {
        return Err("A folder cannot be placed inside itself".to_string());
    }
    let id = queue.start(op_type, OperationPhase::Preparing, sources.len());
    let queue = queue.clone();
    let operation_id = id.clone();
    thread::spawn(move || {
        let mut tracker = Tracker::new(&queue, &operation_id);
        tracker.prepare(&sources, &destination);
        let result = transfer(&sources, &destination, &mut tracker);
        let _ = queue.finish(&operation_id, result);
    });
    Ok(id)
}

fn copy_all(sources: &[PathBuf], destination: &Path, tracker: &mut Tracker) -> Result<(), String> {
    ensure_space(destination, tracker.total_bytes)?;
    tracker.queue.set_phase(tracker.id, OperationPhase::Copying);
    let mut created = Vec::new();
    let result = sources
        .iter()
        .try_for_each(|source| copy_entry(source, destination, tracker, &mut created))
        .and_then(|()| finalize(destination, &created, tracker));
    if result.is_err() {
        roll_back(&created);
    }
    result
}

fn move_all(sources: &[PathBuf], destination: &Path, tracker: &mut Tracker) -> Result<(), String> {
    if crosses_device(sources, destination) {
        ensure_space(destination, tracker.total_bytes)?;
    }
    tracker.queue.set_phase(tracker.id, OperationPhase::Moving);
    for source in sources {
        tracker.guard()?;
        move_entry(source, destination, tracker)?;
    }
    Ok(())
}

fn move_entry(source: &Path, destination: &Path, tracker: &mut Tracker) -> Result<(), String> {
    let mut target = available_destination(source, destination)?;
    loop {
        match rename_no_replace(source, &target) {
            Ok(()) => return tracker.mark_done(&target),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
                target = available_destination(source, destination)?;
            }
            Err(error) if is_permission_error(&error) => {
                run_pkexec(
                    "mv",
                    &[
                        os("--no-clobber"),
                        os("--"),
                        source.as_os_str().into(),
                        target.as_os_str().into(),
                    ],
                )?;
                return tracker.mark_done(&target);
            }
            Err(error) if error.raw_os_error() == Some(libc::EXDEV) => {
                let mut created = Vec::new();
                if let Err(error) = copy_entry(source, destination, tracker, &mut created) {
                    roll_back(&created);
                    return Err(error);
                }
                return remove_path(source);
            }
            Err(error) => return Err(error.to_string()),
        }
    }
}

fn copy_entry(
    source: &Path,
    destination: &Path,
    tracker: &mut Tracker,
    created: &mut Vec<PathBuf>,
) -> Result<(), String> {
    tracker.guard()?;
    if source.is_dir() {
        let Some((target, ())) = claim(source, destination, |target| fs::create_dir(target))?
        else {
            return copy_elevated(source, destination, tracker, created);
        };
        created.push(target.clone());
        tracker.add_item(&target)?;
        return copy_tree(source, &target, tracker);
    }
    let input = match File::open(source) {
        Ok(input) => input,
        Err(error) if is_permission_error(&error) => {
            return copy_elevated(source, destination, tracker, created);
        }
        Err(error) => return Err(error.to_string()),
    };
    let Some((target, output)) = claim(source, destination, create_new_file)? else {
        return copy_elevated(source, destination, tracker, created);
    };
    created.push(target);
    stream(source, input, output, tracker)
}

fn copy_tree(source: &Path, target: &Path, tracker: &mut Tracker) -> Result<(), String> {
    for entry in walkdir::WalkDir::new(source).min_depth(1) {
        let entry = entry.map_err(|error| error.to_string())?;
        let relative = entry
            .path()
            .strip_prefix(source)
            .map_err(|error| error.to_string())?;
        let nested = target.join(relative);
        tracker.guard()?;
        if entry.file_type().is_dir() {
            fs::create_dir(&nested).map_err(|error| error.to_string())?;
            tracker.add_item(&nested)?;
            continue;
        }
        match File::open(entry.path()) {
            Ok(input) => {
                let output = create_new_file(&nested).map_err(|error| error.to_string())?;
                stream(entry.path(), input, output, tracker)?;
            }
            Err(error) if is_permission_error(&error) => {
                run_pkexec(
                    "cp",
                    &[
                        os("-a"),
                        os("--no-clobber"),
                        os("--"),
                        entry.path().as_os_str().into(),
                        nested.as_os_str().into(),
                    ],
                )?;
                tracker.mark_done(entry.path())?;
            }
            Err(error) => return Err(error.to_string()),
        }
    }
    Ok(())
}

fn claim<T>(
    source: &Path,
    destination: &Path,
    create: impl Fn(&Path) -> io::Result<T>,
) -> Result<Option<(PathBuf, T)>, String> {
    loop {
        let target = available_destination(source, destination)?;
        match create(&target) {
            Ok(value) => return Ok(Some((target, value))),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) if is_permission_error(&error) => return Ok(None),
            Err(error) => return Err(error.to_string()),
        }
    }
}

fn create_new_file(path: &Path) -> io::Result<File> {
    OpenOptions::new().write(true).create_new(true).open(path)
}

fn stream(
    source: &Path,
    mut input: File,
    mut output: File,
    tracker: &mut Tracker,
) -> Result<(), String> {
    tracker.set_file(source);
    let mut buffer = vec![0_u8; COPY_BUFFER_SIZE];
    loop {
        tracker.guard()?;
        let read = input.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        output
            .write_all(&buffer[..read])
            .map_err(|error| error.to_string())?;
        tracker.add_bytes(read as u64, source);
    }
    let permissions = input
        .metadata()
        .map_err(|error| error.to_string())?
        .permissions();
    output
        .set_permissions(permissions)
        .map_err(|error| error.to_string())?;
    tracker.add_item(source)
}

fn copy_elevated(
    source: &Path,
    destination: &Path,
    tracker: &mut Tracker,
    created: &mut Vec<PathBuf>,
) -> Result<(), String> {
    let target = available_destination(source, destination)?;
    run_pkexec(
        "cp",
        &[
            os("-a"),
            os("--no-clobber"),
            os("--"),
            source.as_os_str().into(),
            target.as_os_str().into(),
        ],
    )?;
    created.push(target);
    tracker.mark_done(source)
}

fn finalize(destination: &Path, targets: &[PathBuf], tracker: &mut Tracker) -> Result<(), String> {
    tracker
        .queue
        .set_phase(tracker.id, OperationPhase::Finalizing);
    for target in targets {
        for entry in walkdir::WalkDir::new(target).contents_first(true) {
            let entry = entry.map_err(|error| error.to_string())?;
            tracker.guard()?;
            if entry.file_type().is_file() {
                tracker.set_file(entry.path());
            }
            sync(entry.path())?;
        }
    }
    sync(destination)
}

fn sync(path: &Path) -> Result<(), String> {
    File::open(path)
        .and_then(|file| file.sync_all())
        .map_err(|error| error.to_string())
}

fn roll_back(created: &[PathBuf]) {
    for target in created {
        let _ = remove_path(target);
    }
}

fn ensure_space(destination: &Path, required_bytes: u64) -> Result<(), String> {
    if required_bytes == 0 {
        return Ok(());
    }
    let available = available_space(destination)?;
    if available >= required_bytes {
        return Ok(());
    }
    let label = drives::drive_for_path(destination)
        .map(|drive| drive.name)
        .or_else(|| file_name(destination))
        .unwrap_or_else(|| "destination".to_string());
    Err(format!(
        "Not enough space on {label}: need {}, available {}",
        format_bytes(required_bytes),
        format_bytes(available)
    ))
}

fn available_space(path: &Path) -> Result<u64, String> {
    let path = CString::new(path.as_os_str().as_bytes())
        .map_err(|_| "Destination path contains an invalid byte".to_string())?;
    let mut stat = MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return Err("Could not read destination free space".to_string());
    }
    let stat = unsafe { stat.assume_init() };
    Ok(stat.f_bavail * stat.f_frsize)
}

fn crosses_device(sources: &[PathBuf], destination: &Path) -> bool {
    let Ok(destination) = fs::metadata(destination) else {
        return true;
    };
    sources.iter().any(|source| {
        fs::symlink_metadata(source).map_or(true, |source| source.dev() != destination.dev())
    })
}

fn available_destination(source: &Path, destination: &Path) -> Result<PathBuf, String> {
    let name = source.file_name().ok_or("Invalid source path")?;
    let stem = source
        .file_stem()
        .unwrap_or(name)
        .to_string_lossy()
        .into_owned();
    let extension = source
        .extension()
        .map(|extension| format!(".{}", extension.to_string_lossy()))
        .unwrap_or_default();
    let mut target = destination.join(name);
    let mut counter = 1;
    while target.symlink_metadata().is_ok() {
        target = destination.join(format!("{stem} ({counter}){extension}"));
        counter += 1;
    }
    Ok(target)
}

fn path_size(path: &Path) -> u64 {
    walkdir::WalkDir::new(path)
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.metadata().ok())
        .filter(fs::Metadata::is_file)
        .map(|metadata| metadata.len())
        .sum()
}

fn path_items(path: &Path) -> usize {
    walkdir::WalkDir::new(path).into_iter().flatten().count()
}

fn file_name(path: &Path) -> Option<String> {
    path.file_name()
        .map(|name| name.to_string_lossy().into_owned())
}

fn format_bytes(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit = 0;
    while size >= 1024.0 && unit < UNITS.len() - 1 {
        size /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{bytes} B")
    } else {
        format!("{size:.1} {}", UNITS[unit])
    }
}

struct Tracker<'a> {
    queue: &'a OperationsQueue,
    id: &'a str,
    total_bytes: u64,
    bytes_processed: u64,
    items_processed: usize,
}

impl<'a> Tracker<'a> {
    fn new(queue: &'a OperationsQueue, id: &'a str) -> Self {
        Self {
            queue,
            id,
            total_bytes: 0,
            bytes_processed: 0,
            items_processed: 0,
        }
    }

    fn prepare(&mut self, sources: &[PathBuf], destination: &Path) {
        let drive = drives::drive_for_path(destination);
        let label = drive
            .as_ref()
            .map(|drive| drive.name.clone())
            .or_else(|| file_name(destination));
        self.queue.set_destination(
            self.id,
            label,
            drive.is_some_and(|drive| drive.is_removable),
        );
        self.total_bytes = sources.iter().map(|source| path_size(source)).sum();
        let total_items = sources.iter().map(|source| path_items(source)).sum();
        self.queue
            .set_totals(self.id, self.total_bytes, total_items);
    }

    fn guard(&self) -> Result<(), String> {
        loop {
            match self.queue.status(self.id) {
                Some(OperationStatus::Cancelled) => return Err("Operation cancelled".to_string()),
                Some(OperationStatus::Paused) => thread::sleep(PAUSE_POLL_INTERVAL),
                _ => return Ok(()),
            }
        }
    }

    fn set_file(&self, path: &Path) {
        self.queue.update_progress(
            self.id,
            Some(path.to_string_lossy().into_owned()),
            self.bytes_processed,
            self.items_processed,
        );
    }

    fn add_bytes(&mut self, bytes: u64, path: &Path) {
        self.bytes_processed = self.bytes_processed.saturating_add(bytes);
        self.set_file(path);
    }

    fn add_item(&mut self, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.items_processed += 1;
        self.set_file(path);
        Ok(())
    }

    fn mark_done(&mut self, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.bytes_processed = self.bytes_processed.saturating_add(path_size(path));
        self.items_processed += path_items(path);
        self.set_file(path);
        Ok(())
    }
}
