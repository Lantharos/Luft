use std::collections::HashSet;
use std::io;
use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::rename_no_replace;
use crate::history::{History, Step};
use crate::text::items;

#[derive(Deserialize)]
pub struct Renaming {
    pub path: String,
    pub name: String,
}

pub fn batch_rename(renamings: Vec<Renaming>, history: &History) -> Result<(), String> {
    let pairs = plan(renamings)?;
    if pairs.is_empty() {
        return Ok(());
    }
    let sources: HashSet<&Path> = pairs.iter().map(|(from, _)| from.as_path()).collect();
    for (_, to) in &pairs {
        if to.symlink_metadata().is_ok()
            && !sources.contains(to.as_path())
            && !same_file_case(to, &sources)
        {
            return Err(format!("{} already exists", display_name(to)));
        }
    }
    let staged = pairs.iter().any(|(_, to)| to.symlink_metadata().is_ok());
    let mut steps = Vec::with_capacity(pairs.len() * if staged { 2 } else { 1 });
    let result = if staged {
        stage(&pairs, &mut steps)
    } else {
        pairs
            .iter()
            .try_for_each(|(from, to)| apply(from, to, &mut steps))
    };
    if let Err(error) = result {
        undo(steps);
        return Err(error);
    }
    history.record(
        format!("Renamed {}", items(pairs.len())),
        format!("Restored the names of {}", items(pairs.len())),
        steps,
        true,
    );
    Ok(())
}

fn plan(renamings: Vec<Renaming>) -> Result<Vec<(PathBuf, PathBuf)>, String> {
    let mut targets = HashSet::new();
    let mut pairs = Vec::with_capacity(renamings.len());
    for Renaming { path, name } in renamings {
        let name = name.trim();
        if name.is_empty() || name == "." || name == ".." || name.contains('/') {
            return Err(format!("{name:?} isn't a valid name"));
        }
        let from = PathBuf::from(path);
        let to = from
            .parent()
            .ok_or("The root folder can't be renamed")?
            .join(name);
        if !targets.insert(to.clone()) {
            return Err(format!("More than one item would be named {name}"));
        }
        if from != to {
            pairs.push((from, to));
        }
    }
    Ok(pairs)
}

fn stage(pairs: &[(PathBuf, PathBuf)], steps: &mut Vec<Step>) -> Result<(), String> {
    let process = std::process::id();
    let staged: Vec<PathBuf> = pairs
        .iter()
        .enumerate()
        .map(|(index, (from, _))| from.with_file_name(format!(".rover-rename-{process}-{index}")))
        .collect();
    for ((from, _), temporary) in pairs.iter().zip(&staged) {
        apply(from, temporary, steps)?;
    }
    for ((_, to), temporary) in pairs.iter().zip(&staged) {
        apply(temporary, to, steps)?;
    }
    Ok(())
}

fn apply(from: &Path, to: &Path, steps: &mut Vec<Step>) -> Result<(), String> {
    rename_no_replace(from, to).map_err(|error| match error.kind() {
        io::ErrorKind::AlreadyExists => format!("{} already exists", display_name(to)),
        _ => format!("{}: {error}", display_name(from)),
    })?;
    steps.push(Step::Moved {
        from: from.to_path_buf(),
        to: to.to_path_buf(),
    });
    Ok(())
}

fn undo(steps: Vec<Step>) {
    for step in steps.into_iter().rev() {
        if let Step::Moved { from, to } = step {
            let _ = rename_no_replace(&to, &from);
        }
    }
}

fn same_file_case(target: &Path, sources: &HashSet<&Path>) -> bool {
    let lowered = target.to_string_lossy().to_lowercase();
    sources
        .iter()
        .any(|source| source.to_string_lossy().to_lowercase() == lowered)
}

fn display_name(path: &Path) -> String {
    path.file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default()
}
