mod copy;
mod moving;
mod resolve;
mod space;
mod tracker;

use std::collections::{BTreeSet, HashSet};
use std::fs::File;
use std::io;
use std::os::fd::AsRawFd;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::thread;

use luft_i18n::t;

use super::operations::{OperationPhase, OperationType, OperationsQueue, Resolution};
use crate::files::text::{first_name, name_of};
use crate::history::{History, Step};
use crate::l10n::L10N;
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
        done: t!(
            L10N,
            "rover-history-copied",
            count = sources.len(),
            name = first_name(&sources),
            folder = name_of(&destination)
        ),
        undone: copies_removed(&sources),
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
        return Err(t!(L10N, "rover-operations-already-here"));
    }
    let labels = Labels {
        done: t!(
            L10N,
            "rover-history-moved",
            count = sources.len(),
            name = first_name(&sources),
            folder = name_of(&destination)
        ),
        undone: t!(
            L10N,
            "rover-history-moved-back",
            count = sources.len(),
            name = first_name(&sources)
        ),
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
        done: t!(
            L10N,
            "rover-history-duplicated",
            count = paths.len(),
            name = first_name(&paths)
        ),
        undone: copies_removed(&paths),
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
    copy::copy_to(from, to.to_path_buf(), true, &mut tracker)?;
    tracker.settle()
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
            return Err(t!(L10N, "rover-operations-not-folder"));
        }
        if destination.starts_with(source) {
            return Err(t!(L10N, "rover-operations-inside-itself"));
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

fn make_sure_it_fits(destination: &Path, tracker: &Tracker) -> Result<(), String> {
    space::ensure_space(destination, tracker.total_bytes).inspect_err(|_| {
        tracker
            .queue
            .set_full(tracker.id, space::drive_folder(destination));
    })
}

fn copy_all(plan: &Plan, tracker: &mut Tracker) -> Result<(), String> {
    if let Some((_, destination)) = plan.first() {
        make_sure_it_fits(destination, tracker)?;
    }
    tracker.queue.set_phase(tracker.id, OperationPhase::Copying);
    for (source, destination) in plan {
        copy::copy_to(source, target(source, destination)?, true, tracker)?;
    }
    tracker.settle()?;
    finalize(tracker)
}

fn move_all(plan: &Plan, tracker: &mut Tracker) -> Result<(), String> {
    let crossing = space::crosses_device(plan);
    if crossing && let Some((_, destination)) = plan.first() {
        make_sure_it_fits(destination, tracker)?;
    }
    tracker.queue.set_phase(tracker.id, OperationPhase::Moving);
    for (source, destination) in plan {
        moving::move_to(source, target(source, destination)?, tracker)?;
    }
    tracker.settle()?;
    if crossing {
        finalize(tracker)?;
    }
    Ok(())
}

fn target(source: &Path, destination: &Path) -> Result<PathBuf, String> {
    source
        .file_name()
        .map(|name| destination.join(name))
        .ok_or_else(|| t!(L10N, "rover-files-invalid-source"))
}

fn finalize(tracker: &mut Tracker) -> Result<(), String> {
    tracker
        .queue
        .set_phase(tracker.id, OperationPhase::Finalizing);
    let parents: BTreeSet<&Path> = tracker
        .created()
        .filter_map(|target| target.parent())
        .collect();
    let mut flushed = HashSet::new();
    parents
        .into_iter()
        .try_for_each(|parent| {
            let directory = File::open(parent)?;
            if flushed.insert(directory.metadata()?.dev())
                && unsafe { libc::syncfs(directory.as_raw_fd()) } != 0
            {
                return Err(io::Error::last_os_error());
            }
            Ok(())
        })
        .map_err(|error| error.to_string())
}

fn copies_removed(paths: &[String]) -> String {
    t!(
        L10N,
        "rover-history-copies-removed",
        count = paths.len(),
        name = first_name(paths)
    )
}
