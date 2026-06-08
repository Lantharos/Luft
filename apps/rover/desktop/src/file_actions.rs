use crate::drives;
use crate::operations_queue::{OperationPhase, OperationStatus, OperationType, OperationsQueue};
use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::Duration;

const COPY_BUFFER_SIZE: usize = 1024 * 1024;

struct OperationTracker<'a> {
    queue: &'a OperationsQueue,
    id: String,
    bytes_processed: u64,
    items_processed: usize,
}

impl<'a> OperationTracker<'a> {
    fn new(queue: &'a OperationsQueue, id: String) -> Self {
        Self {
            queue,
            id,
            bytes_processed: 0,
            items_processed: 0,
        }
    }

    fn guard(&self) -> Result<(), String> {
        loop {
            match self.queue.status(&self.id) {
                Some(OperationStatus::Cancelled) => return Err("Operation cancelled".to_string()),
                Some(OperationStatus::Paused) => thread::sleep(Duration::from_millis(120)),
                _ => return Ok(()),
            }
        }
    }

    fn set_file(&self, path: &Path) {
        self.queue.update_progress(
            &self.id,
            Some(path.to_string_lossy().to_string()),
            self.bytes_processed,
            self.items_processed,
        );
    }

    fn add_bytes(&mut self, bytes: u64, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.bytes_processed = self.bytes_processed.saturating_add(bytes);
        self.set_file(path);
        Ok(())
    }

    fn add_item(&mut self, path: &Path) -> Result<(), String> {
        self.guard()?;
        self.items_processed = self.items_processed.saturating_add(1);
        self.set_file(path);
        Ok(())
    }
}

pub fn copy_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
) -> Result<String, String> {
    ensure_destination_directory(&destination)?;
    let id = queue.add_operation(
        OperationType::Copy,
        sources.clone(),
        Some(destination.clone()),
        0,
        sources.len(),
    );
    spawn_operation(queue.clone(), id.clone(), move |queue, id| {
        copy_items_impl(sources, destination, queue, id)
    });
    Ok(id)
}

pub fn move_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
) -> Result<String, String> {
    ensure_destination_directory(&destination)?;
    let id = queue.add_operation(
        OperationType::Move,
        sources.clone(),
        Some(destination.clone()),
        0,
        sources.len(),
    );
    spawn_operation(queue.clone(), id.clone(), move |queue, id| {
        move_items_impl(sources, destination, queue, id)
    });
    Ok(id)
}

pub fn delete_items(paths: Vec<String>, queue: &OperationsQueue) -> Result<String, String> {
    let id = queue.add_operation(OperationType::Delete, paths.clone(), None, 0, paths.len());
    spawn_operation(queue.clone(), id.clone(), move |queue, id| {
        delete_items_impl(paths, queue, id)
    });
    Ok(id)
}

fn spawn_operation<T, F>(queue: OperationsQueue, id: String, operation: F)
where
    T: Send + 'static,
    F: FnOnce(&OperationsQueue, &str) -> Result<T, String> + Send + 'static,
{
    let _ = thread::spawn(move || {
        let result = operation(&queue, &id);
        let _ = finish_operation(&queue, &id, result);
    });
}

fn finish_operation<T>(
    queue: &OperationsQueue,
    id: &str,
    result: Result<T, String>,
) -> Result<T, String> {
    match result {
        Ok(value) => {
            queue.complete(id);
            Ok(value)
        }
        Err(error) => {
            queue.fail(id, error.clone());
            Err(error)
        }
    }
}

fn copy_items_impl(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    id: &str,
) -> Result<Vec<String>, String> {
    let dest_path = PathBuf::from(&destination);
    if !dest_path.is_dir() {
        return Err("Destination must be a directory".to_string());
    }

    set_destination_context(queue, id, &dest_path);
    let plans = operation_plans(&sources, &dest_path)?;
    let (total_bytes, total_items) = operation_totals(&plans);
    queue.set_totals(id, total_bytes, total_items);
    ensure_destination_space(&dest_path, total_bytes)?;
    queue.set_phase(id, OperationPhase::Copying);
    let mut tracker = OperationTracker::new(queue, id.to_string());
    let mut copied = Vec::new();
    let destinations: Vec<PathBuf> = plans
        .iter()
        .map(|(_, destination)| destination.clone())
        .collect();

    for (source, destination) in &plans {
        if let Err(error) = copy_path(source, destination, &mut tracker) {
            cleanup_destinations(&destinations);
            return Err(error);
        }
        copied.push(destination.to_string_lossy().to_string());
    }

    if let Err(error) = finalize_destinations(queue, id, &dest_path, &destinations, &mut tracker) {
        if is_cancelled(&error) {
            cleanup_destinations(&destinations);
        }
        return Err(error);
    }

    Ok(copied)
}

fn ensure_destination_directory(destination: &str) -> Result<(), String> {
    if Path::new(destination).is_dir() {
        return Ok(());
    }
    Err("Destination must be a directory".to_string())
}

fn move_items_impl(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    id: &str,
) -> Result<Vec<String>, String> {
    let dest_path = PathBuf::from(&destination);
    if !dest_path.is_dir() {
        return Err("Destination must be a directory".to_string());
    }

    set_destination_context(queue, id, &dest_path);
    let plans = operation_plans(&sources, &dest_path)?;
    let (total_bytes, total_items) = operation_totals(&plans);
    queue.set_totals(id, total_bytes, total_items);
    if move_requires_copy_space(&plans, &dest_path) {
        ensure_destination_space(&dest_path, total_bytes)?;
    }
    queue.set_phase(id, OperationPhase::Moving);
    let mut tracker = OperationTracker::new(queue, id.to_string());
    let mut moved = Vec::new();

    for (source, destination) in plans {
        tracker.guard()?;
        match fs::rename(&source, &destination) {
            Ok(_) => mark_path_done(&source, &mut tracker)?,
            Err(error) if is_permission_error(&error) => {
                run_pkexec(
                    "mv",
                    &[
                        os("--"),
                        source.as_os_str().into(),
                        destination.as_os_str().into(),
                    ],
                )?;
                mark_path_done(&destination, &mut tracker)?;
            }
            Err(_) => {
                if let Err(error) = copy_path(&source, &destination, &mut tracker) {
                    cleanup_destinations(&[destination.clone()]);
                    return Err(error);
                }
                remove_path(&source)?;
            }
        }
        moved.push(destination.to_string_lossy().to_string());
    }

    Ok(moved)
}

fn delete_items_impl(paths: Vec<String>, queue: &OperationsQueue, id: &str) -> Result<(), String> {
    let plans: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();
    let total_bytes = plans.iter().map(|path| path_size(path)).sum();
    let total_items: usize = plans.iter().map(|path| path_items(path)).sum();
    queue.set_totals(id, total_bytes, total_items.max(1));
    queue.set_phase(id, OperationPhase::Deleting);
    let mut tracker = OperationTracker::new(queue, id.to_string());

    for path in plans {
        tracker.guard()?;
        mark_path_done(&path, &mut tracker)?;
        remove_path(&path)?;
    }

    Ok(())
}

fn operation_plans(
    sources: &[String],
    destination: &Path,
) -> Result<Vec<(PathBuf, PathBuf)>, String> {
    sources
        .iter()
        .map(|source| {
            let src_path = PathBuf::from(source);
            Ok((src_path.clone(), destination_path(&src_path, destination)?))
        })
        .collect()
}

fn operation_totals(plans: &[(PathBuf, PathBuf)]) -> (u64, usize) {
    (
        plans.iter().map(|(source, _)| path_size(source)).sum(),
        plans
            .iter()
            .map(|(source, _)| path_items(source))
            .sum::<usize>()
            .max(1),
    )
}

fn set_destination_context(queue: &OperationsQueue, id: &str, destination: &Path) {
    let drive = drives::drive_for_path(destination);
    let label = drive.as_ref().map(|drive| drive.name.clone()).or_else(|| {
        destination
            .file_name()
            .map(|name| name.to_string_lossy().to_string())
    });
    queue.set_destination_context(
        id,
        label,
        drive.map(|drive| drive.is_removable).unwrap_or(false),
    );
}

fn ensure_destination_space(destination: &Path, required_bytes: u64) -> Result<(), String> {
    if required_bytes == 0 {
        return Ok(());
    }
    let available = available_space(destination)?;
    if available >= required_bytes {
        return Ok(());
    }
    let label = drives::drive_for_path(destination)
        .map(|drive| drive.name)
        .or_else(|| {
            destination
                .file_name()
                .map(|name| name.to_string_lossy().to_string())
        })
        .unwrap_or_else(|| "destination".to_string());
    Err(format!(
        "Not enough space on {label}: need {}, available {}",
        format_bytes(required_bytes),
        format_bytes(available)
    ))
}

fn available_space(path: &Path) -> Result<u64, String> {
    use std::ffi::CString;
    use std::mem::MaybeUninit;

    let path = CString::new(path.to_string_lossy().as_bytes())
        .map_err(|_| "Destination path contains an invalid byte".to_string())?;

    unsafe {
        let mut stat: MaybeUninit<libc::statvfs> = MaybeUninit::uninit();
        if libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) == 0 {
            let stat = stat.assume_init();
            return Ok(stat.f_bavail as u64 * stat.f_frsize as u64);
        }
    }

    Err("Could not read destination free space".to_string())
}

fn move_requires_copy_space(plans: &[(PathBuf, PathBuf)], destination: &Path) -> bool {
    let Ok(destination_metadata) = fs::metadata(destination) else {
        return true;
    };
    let destination_device = destination_metadata.dev();

    plans.iter().any(|(source, _)| {
        fs::metadata(source)
            .map(|metadata| metadata.dev() != destination_device)
            .unwrap_or(true)
    })
}

fn finalize_destinations(
    queue: &OperationsQueue,
    id: &str,
    destination: &Path,
    paths: &[PathBuf],
    tracker: &mut OperationTracker,
) -> Result<(), String> {
    queue.set_phase(id, OperationPhase::Finalizing);
    queue.update_progress(id, None, tracker.bytes_processed, tracker.items_processed);

    for path in paths {
        sync_path(path, tracker)?;
    }
    sync_directory(destination, tracker)?;
    Ok(())
}

fn sync_path(path: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.guard()?;
    if path.is_dir() {
        for entry in walkdir::WalkDir::new(path).contents_first(true) {
            let entry = entry.map_err(|error| error.to_string())?;
            if entry.file_type().is_file() {
                sync_file(entry.path(), tracker)?;
            } else if entry.file_type().is_dir() {
                sync_directory(entry.path(), tracker)?;
            }
        }
        sync_directory(path, tracker)?;
        return Ok(());
    }
    sync_file(path, tracker)
}

fn sync_file(path: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.guard()?;
    tracker.set_file(path);
    OpenOptions::new()
        .read(true)
        .open(path)
        .and_then(|file| file.sync_all())
        .map_err(|error| error.to_string())
}

fn sync_directory(path: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.guard()?;
    OpenOptions::new()
        .read(true)
        .open(path)
        .and_then(|directory| directory.sync_all())
        .map_err(|error| error.to_string())
}

fn cleanup_destinations(destinations: &[PathBuf]) {
    for destination in destinations {
        let _ = remove_path(destination);
    }
}

fn is_cancelled(error: &str) -> bool {
    error == "Operation cancelled"
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

fn destination_path(src_path: &Path, destination: &Path) -> Result<PathBuf, String> {
    let name = src_path.file_name().ok_or("Invalid source path")?;
    let mut target = destination.join(name);
    let stem = src_path
        .file_stem()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| name.to_string_lossy().to_string());
    let ext = src_path
        .extension()
        .map(|value| format!(".{}", value.to_string_lossy()))
        .unwrap_or_default();
    let mut counter = 1;

    while target.exists() {
        target = destination.join(format!("{stem} ({counter}){ext}"));
        counter += 1;
    }

    Ok(target)
}

fn copy_path(src: &Path, dst: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.guard()?;
    if src.is_dir() {
        match fs::create_dir(dst) {
            Ok(_) => tracker.add_item(dst)?,
            Err(error) if is_permission_error(&error) => {
                run_pkexec(
                    "cp",
                    &[
                        os("-a"),
                        os("--"),
                        src.as_os_str().into(),
                        dst.as_os_str().into(),
                    ],
                )?;
                mark_path_done(src, tracker)?;
                return Ok(());
            }
            Err(error) => return Err(error.to_string()),
        }
        for entry in walkdir::WalkDir::new(src).min_depth(1) {
            let entry = entry.map_err(|error| error.to_string())?;
            let relative = entry
                .path()
                .strip_prefix(src)
                .map_err(|error| error.to_string())?;
            let target = dst.join(relative);
            if entry.file_type().is_dir() {
                fs::create_dir_all(&target).map_err(|error| error.to_string())?;
                tracker.add_item(&target)?;
            } else {
                copy_file(entry.path(), &target, tracker)?;
            }
        }
        return Ok(());
    }

    copy_file(src, dst, tracker)
}

fn copy_file(src: &Path, dst: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.guard()?;
    if let Some(parent) = dst.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    tracker.set_file(src);

    match copy_file_inner(src, dst, tracker) {
        Ok(_) => Ok(()),
        Err(error) if is_permission_error(&error) => {
            run_pkexec(
                "cp",
                &[
                    os("-a"),
                    os("--"),
                    src.as_os_str().into(),
                    dst.as_os_str().into(),
                ],
            )?;
            tracker.add_bytes(path_size(src), src)?;
            tracker.add_item(src)
        }
        Err(error) => Err(error.to_string()),
    }
}

fn copy_file_inner(src: &Path, dst: &Path, tracker: &mut OperationTracker) -> std::io::Result<()> {
    let mut source = fs::File::open(src)?;
    let mut target = fs::File::create(dst)?;
    let mut buffer = vec![0_u8; COPY_BUFFER_SIZE];

    loop {
        tracker.guard().map_err(std::io::Error::other)?;
        let bytes = source.read(&mut buffer)?;
        if bytes == 0 {
            break;
        }
        target.write_all(&buffer[..bytes])?;
        tracker
            .add_bytes(bytes as u64, src)
            .map_err(std::io::Error::other)?;
    }

    tracker.add_item(src).map_err(std::io::Error::other)?;
    Ok(())
}

fn mark_path_done(path: &Path, tracker: &mut OperationTracker) -> Result<(), String> {
    tracker.add_bytes(path_size(path), path)?;
    for _ in 0..path_items(path) {
        tracker.add_item(path)?;
    }
    Ok(())
}

fn remove_path(path: &Path) -> Result<(), String> {
    let result = if path.is_dir() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    };

    match result {
        Ok(_) => Ok(()),
        Err(error) if is_permission_error(&error) => {
            run_pkexec("rm", &[os("-rf"), os("--"), path.as_os_str().into()])
        }
        Err(error) => Err(error.to_string()),
    }
}

fn path_size(path: &Path) -> u64 {
    if path.is_dir() {
        return walkdir::WalkDir::new(path)
            .into_iter()
            .flatten()
            .filter_map(|entry| entry.metadata().ok())
            .filter(|metadata| metadata.is_file())
            .map(|metadata| metadata.len())
            .sum();
    }
    path.metadata().map(|metadata| metadata.len()).unwrap_or(0)
}

fn path_items(path: &Path) -> usize {
    if path.is_dir() {
        return walkdir::WalkDir::new(path).into_iter().flatten().count();
    }
    1
}

fn is_permission_error(error: &std::io::Error) -> bool {
    error.kind() == std::io::ErrorKind::PermissionDenied
}

pub(crate) fn run_pkexec(program: &str, args: &[OsString]) -> Result<(), String> {
    let program_path = program_path(program)?;
    let status = Command::new("pkexec")
        .arg("--keep-cwd")
        .arg(program_path)
        .args(args)
        .status()
        .map_err(|error| format!("Could not start privilege prompt: {error}"))?;

    match status.code() {
        Some(0) => Ok(()),
        Some(126) => Err("Authentication cancelled".to_string()),
        Some(127) => Err("Authentication failed or unavailable".to_string()),
        Some(code) => Err(format!("Elevated operation failed with exit code {code}")),
        None => Err("Elevated operation was interrupted".to_string()),
    }
}

fn program_path(program: &str) -> Result<&'static str, String> {
    match program {
        "cp" if Path::new("/usr/bin/cp").exists() => Ok("/usr/bin/cp"),
        "cp" if Path::new("/bin/cp").exists() => Ok("/bin/cp"),
        "mv" if Path::new("/usr/bin/mv").exists() => Ok("/usr/bin/mv"),
        "mv" if Path::new("/bin/mv").exists() => Ok("/bin/mv"),
        "rm" if Path::new("/usr/bin/rm").exists() => Ok("/usr/bin/rm"),
        "rm" if Path::new("/bin/rm").exists() => Ok("/bin/rm"),
        "touch" if Path::new("/usr/bin/touch").exists() => Ok("/usr/bin/touch"),
        "touch" if Path::new("/bin/touch").exists() => Ok("/bin/touch"),
        "mkdir" if Path::new("/usr/bin/mkdir").exists() => Ok("/usr/bin/mkdir"),
        "mkdir" if Path::new("/bin/mkdir").exists() => Ok("/bin/mkdir"),
        "gio" if Path::new("/usr/bin/gio").exists() => Ok("/usr/bin/gio"),
        "gio" if Path::new("/bin/gio").exists() => Ok("/bin/gio"),
        _ => Err(format!("Required system tool is missing: {program}")),
    }
}

pub(crate) fn os(value: &str) -> OsString {
    OsString::from(value)
}
