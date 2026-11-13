use std::collections::HashMap;
use std::path::Path;

use super::files::{digest, map_limit};
use super::{InferredArtifact, Shape, ignored_file, infer_artifact, split_platform};
use crate::schema::versions::locale_compare;

const CONCURRENCY: usize = 4;

/// A release's file with its digest.
#[derive(Clone, Debug)]
pub struct HashedArtifact {
    pub artifact: InferredArtifact,
    pub size: u64,
    pub sha256: String,
}

fn updater_signature(path: &str) -> bool {
    path.to_lowercase().ends_with(".sig")
}

/// The files `patterns` name, each with the system its pattern gave it.
pub fn expand_files(patterns: &[String]) -> Result<Vec<(String, Option<String>)>, String> {
    let mut paths: Vec<(String, Option<String>)> = Vec::new();
    for entry in patterns {
        let (pattern, platform) = split_platform(entry)?;
        let everything = pattern.ends_with("**").then(|| format!("{pattern}/*"));
        let mut found = Vec::new();
        for each in std::iter::once(pattern).chain(everything.as_deref()) {
            found.extend(
                glob::glob(each)
                    .map_err(|error| error.to_string())?
                    .flatten(),
            );
        }
        for path in found {
            let shown = path.to_string_lossy().into_owned();
            if !path.is_file() || ignored_file(&shown) {
                continue;
            }
            match paths.iter_mut().find(|(known, _)| *known == shown) {
                Some(known) => known.1 = platform.clone(),
                None => paths.push((shown, platform.clone())),
            }
        }
    }
    paths.sort_by(|(left, _), (right, _)| locale_compare(left, right));
    Ok(paths)
}

/// Reads every file `patterns` name as a file of the release.
pub fn collect_artifacts(
    patterns: &[String],
    shape: &Shape,
) -> Result<Vec<InferredArtifact>, String> {
    let found = expand_files(patterns)?;
    if found.is_empty() {
        return Err(format!("No files match {}", patterns.join(", ")));
    }
    let mut signatures = HashMap::new();
    for (path, _) in found.iter().filter(|(path, _)| updater_signature(path)) {
        let name = Path::new(path)
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default();
        let text = std::fs::read_to_string(path).map_err(|error| error.to_string())?;
        signatures.insert(name[..name.len() - 4].to_owned(), text.trim().to_owned());
    }
    let mut artifacts = Vec::new();
    for (path, platform) in found.iter().filter(|(path, _)| !updater_signature(path)) {
        let mut artifact = infer_artifact(path, shape)?;
        if let Some(platform) = platform {
            artifact.platform = platform.clone();
        }
        artifact.signature = signatures.get(&artifact.name).cloned();
        artifacts.push(artifact);
    }
    let mut seen: HashMap<&str, &str> = HashMap::new();
    for artifact in &artifacts {
        if let Some(previous) = seen.insert(&artifact.name, &artifact.path) {
            return Err(format!(
                "Two files are named {}: {previous} and {}",
                artifact.name, artifact.path
            ));
        }
    }
    Ok(artifacts)
}

pub fn hash_artifacts(artifacts: Vec<InferredArtifact>) -> std::io::Result<Vec<HashedArtifact>> {
    map_limit(&artifacts, CONCURRENCY, |artifact| {
        let (sha256, size) = digest(&artifact.path)?;
        Ok(HashedArtifact {
            artifact: artifact.clone(),
            size,
            sha256,
        })
    })
}
