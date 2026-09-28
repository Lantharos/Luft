mod copy;
mod moving;
mod resolve;
mod space;
mod tracker;

use std::collections::BTreeSet;
use std::fs::File;
use std::path::{Path, PathBuf};
use std::thread;

use super::operations::{OperationPhase, OperationType, OperationsQueue, Resolution};
use crate::history::{History, Step};
use crate::text::{quoted, subject};
use resolve::Resolver;
pub(crate) use resolve::available_destination;
pub(crate) use space::path_size;
use tracker::{Mode, Tracker};

type Plan = Vec<(PathBuf, PathBuf)>;

struct Labels {
    done: String,
    undone: String,
}

pub fn copy_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    let destination = PathBuf::from(destination);
    let labels = Labels {
        done: format!("Copied {} to {}", subject(&sources), quoted(&destination)),
        undone: format!("Removed {}", copies(&sources)),
    };
    let plan = sources
        .into_iter()
        .map(|source| (PathBuf::from(source), destination.clone()))
        .collect();
    start(
        Mode::Copy,
        plan,
        Resolver::default(),
        labels,
        queue,
        history,
    )
}

pub fn move_items(
    sources: Vec<String>,
    destination: String,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    let destination = PathBuf::from(destination);
    let sources: Vec<String> = sources
        .into_iter()
        .filter(|source| Path::new(source).parent() != Some(destination.as_path()))
        .collect();
    if sources.is_empty() {
        return Err("These items are already in this folder".to_string());
    }
    let labels = Labels {
        done: format!("Moved {} to {}", subject(&sources), quoted(&destination)),
        undone: format!("Moved {} back", subject(&sources)),
    };
    let plan = sources
        .into_iter()
        .map(|source| (PathBuf::from(source), destination.clone()))
        .collect();
    start(
        Mode::Move,
        plan,
        Resolver::default(),
        labels,
        queue,
        history,
    )
}

pub fn duplicate_items(
    paths: Vec<String>,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    let labels = Labels {
        done: format!("Duplicated {}", subject(&paths)),
        undone: format!("Removed {}", copies(&paths)),
    };
    let plan = paths
        .into_iter()
        .map(PathBuf::from)
        .map(|path| {
            let parent = copy::parent(&path).to_path_buf();
            (path, parent)
        })
        .collect();
    let resolver = Resolver::forced(Resolution::KeepBoth);
    start(Mode::Copy, plan, resolver, labels, queue, history)
}

pub(crate) fn relocate(
    from: &Path,
    to: &Path,
    queue: &OperationsQueue,
    id: &str,
) -> Result<(), String> {
    let mut tracker = Tracker::new(queue, id, Mode::Move, Resolver::default());
    tracker.prepare(&[(from.to_path_buf(), copy::parent(to).to_path_buf())]);
    copy::copy_to(from, to.to_path_buf(), true, &mut tracker)
}

fn start(
    mode: Mode,
    plan: Plan,
    resolver: Resolver,
    labels: Labels,
    queue: &OperationsQueue,
    history: &History,
) -> Result<String, String> {
    for (source, destination) in &plan {
        if !destination.is_dir() {
            return Err("Destination must be a folder".to_string());
        }
        if destination.starts_with(source) {
            return Err("A folder cannot be placed inside itself".to_string());
        }
    }
    let op_type = match mode {
        Mode::Copy => OperationType::Copy,
        Mode::Move => OperationType::Move,
    };
    let id = queue.start(op_type, OperationPhase::Preparing, plan.len());
    let queue = queue.clone();
    let history = history.clone();
    let operation_id = id.clone();
    thread::spawn(move || {
        let mut tracker = Tracker::new(&queue, &operation_id, mode, resolver);
        tracker.prepare(&plan);
        let result = match mode {
            Mode::Copy => copy_all(&plan, &mut tracker),
            Mode::Move => move_all(&plan, &mut tracker),
        };
        if mode == Mode::Copy && result.is_err() {
            tracker.roll_back();
        }
        let notify = mode == Mode::Move
            || tracker
                .steps
                .iter()
                .any(|step| matches!(step, Step::Trashed(_)));
        history.record(labels.done, labels.undone, tracker.steps, notify);
        let _ = queue.finish(&operation_id, result);
    });
    Ok(id)
}

fn copy_all(plan: &Plan, tracker: &mut Tracker) -> Result<(), String> {
    if let Some((_, destination)) = plan.first() {
        space::ensure_space(destination, tracker.total_bytes)?;
    }
    tracker.queue.set_phase(tracker.id, OperationPhase::Copying);
    for (source, destination) in plan {
        copy::copy_to(source, target(source, destination)?, true, tracker)?;
    }
    finalize(tracker)
}

fn move_all(plan: &Plan, tracker: &mut Tracker) -> Result<(), String> {
    let crossing = space::crosses_device(plan);
    if crossing && let Some((_, destination)) = plan.first() {
        space::ensure_space(destination, tracker.total_bytes)?;
    }
    tracker.queue.set_phase(tracker.id, OperationPhase::Moving);
    for (source, destination) in plan {
        moving::move_to(source, target(source, destination)?, tracker)?;
    }
    if crossing {
        finalize(tracker)?;
    }
    Ok(())
}

fn target(source: &Path, destination: &Path) -> Result<PathBuf, String> {
    source
        .file_name()
        .map(|name| destination.join(name))
        .ok_or_else(|| "Invalid source path".to_string())
}

fn finalize(tracker: &mut Tracker) -> Result<(), String> {
    tracker
        .queue
        .set_phase(tracker.id, OperationPhase::Finalizing);
    let targets: Vec<PathBuf> = tracker.created().map(Path::to_path_buf).collect();
    let parents: BTreeSet<&Path> = targets
        .iter()
        .filter_map(|target| target.parent())
        .collect();
    for target in &targets {
        for entry in walkdir::WalkDir::new(target).contents_first(true) {
            let entry = entry.map_err(|error| error.to_string())?;
            tracker.guard()?;
            if entry.file_type().is_file() {
                tracker.set_file(entry.path());
            }
            if !entry.path_is_symlink() {
                sync(entry.path())?;
            }
        }
    }
    parents.into_iter().try_for_each(sync)
}

fn sync(path: &Path) -> Result<(), String> {
    File::open(path)
        .and_then(|file| file.sync_all())
        .map_err(|error| error.to_string())
}

fn copies(paths: &[String]) -> String {
    match paths {
        [path] => format!("the copy of {}", quoted(Path::new(path))),
        _ => format!("{} copies", paths.len()),
    }
}
