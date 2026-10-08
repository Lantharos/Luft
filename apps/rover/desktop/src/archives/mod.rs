mod compress;
mod extract;
mod progress;

use std::fs::{self, File};
use std::io;
use std::path::{Path, PathBuf};
use std::thread;

use crate::files::operations::{OperationPhase, OperationType, OperationsQueue};
use crate::files::privileged::remove_path;
use crate::files::text::{quoted, subject};
use crate::files::transfer::{available_destination, path_size};
use crate::history::{History, Step};
pub use compress::ArchiveFormat;
use progress::Progress;

pub fn compress(
    paths: Vec<String>,
    destination: String,
    name: String,
    format: ArchiveFormat,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    let name = name.trim();
    if name.is_empty() || name.contains('/') {
        return Err("Choose a name for the archive".to_string());
    }
    let destination = PathBuf::from(destination);
    let file_name = format!("{name}.{}", format.extension());
    let sources: Vec<PathBuf> = paths.iter().map(PathBuf::from).collect();
    let id = queue.start(
        OperationType::Compress,
        OperationPhase::Compressing,
        sources.len(),
    );
    let queue = queue.clone();
    let history = history.clone();
    let operation_id = id.clone();
    thread::spawn(move || {
        let total = sources.iter().map(|source| path_size(source)).sum();
        queue.set_totals(&operation_id, total, sources.len());
        let progress = Progress::new(&queue, &operation_id);
        let result = create_unique(&destination, &file_name).and_then(|(target, output)| {
            match compress::write(format, &sources, output, &progress) {
                Ok(()) => Ok(target),
                Err(error) => {
                    let _ = fs::remove_file(&target);
                    Err(error.to_string())
                }
            }
        });
        if let Ok(target) = &result {
            history.record(
                format!("Compressed {} into {}", subject(&paths), quoted(target)),
                format!("Moved {} to the trash", quoted(target)),
                vec![Step::Created(target.clone())],
                false,
            );
        }
        let _ = queue.finish(&operation_id, result);
    });
    Ok(id)
}

pub fn extract(
    paths: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    let destination = PathBuf::from(destination);
    let archives = paths
        .iter()
        .map(|path| {
            let path = PathBuf::from(path);
            extract::detect(&path)
                .map(|(format, stem)| (path.clone(), format, stem))
                .ok_or_else(|| format!("{} isn't an archive Rover can open", quoted(&path)))
        })
        .collect::<Result<Vec<_>, String>>()?;
    let id = queue.start(
        OperationType::Extract,
        OperationPhase::Extracting,
        archives.len(),
    );
    let queue = queue.clone();
    let history = history.clone();
    let operation_id = id.clone();
    thread::spawn(move || {
        let total = archives.iter().map(|(path, _, _)| path_size(path)).sum();
        queue.set_totals(&operation_id, total, 0);
        let progress = Progress::new(&queue, &operation_id);
        let mut steps = Vec::new();
        let result =
            archives
                .iter()
                .enumerate()
                .try_for_each(|(index, (archive, format, stem))| {
                    let staging =
                        destination.join(format!(".rover-extract-{}-{index}", std::process::id()));
                    fs::create_dir(&staging).map_err(|error| error.to_string())?;
                    let unpacked = extract::unpack(*format, archive, stem, &staging, &progress)
                        .map_err(|error| error.to_string())
                        .and_then(|()| settle(&staging, &destination, stem));
                    match unpacked {
                        Ok(target) => {
                            steps.push(Step::Created(target));
                            Ok(())
                        }
                        Err(error) => {
                            let _ = remove_path(&staging);
                            Err(error)
                        }
                    }
                });
        history.record(
            format!("Extracted {}", subject(&paths)),
            "Moved the extracted files to the trash".to_string(),
            steps,
            false,
        );
        let _ = queue.finish(&operation_id, result);
    });
    Ok(id)
}

fn settle(staging: &Path, destination: &Path, stem: &str) -> Result<PathBuf, String> {
    let children: Vec<PathBuf> = fs::read_dir(staging)
        .map_err(|error| error.to_string())?
        .map(|entry| entry.map(|entry| entry.path()))
        .collect::<io::Result<_>>()
        .map_err(|error| error.to_string())?;
    let (source, name) = match children.as_slice() {
        [only] => (
            only.clone(),
            only.file_name().unwrap_or_default().to_os_string(),
        ),
        _ => (staging.to_path_buf(), stem.into()),
    };
    let target = available_destination(Path::new(&name), destination)?;
    fs::rename(&source, &target).map_err(|error| error.to_string())?;
    if source != staging {
        let _ = fs::remove_dir(staging);
    }
    Ok(target)
}

fn create_unique(destination: &Path, file_name: &str) -> Result<(PathBuf, File), String> {
    loop {
        let target = available_destination(Path::new(file_name), destination)?;
        match File::create_new(&target) {
            Ok(file) => return Ok((target, file)),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error.to_string()),
        }
    }
}
