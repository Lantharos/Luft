pub mod checks;
pub mod download;
pub mod rpm;

use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use std::path::Path;

use anyhow::{Result, bail};

use crate::state::requested::Requested;
use crate::state::sources::Sources;
use rpm::Rpm;

/// A package that can't be a system package, and why.
#[derive(Debug, Clone)]
pub struct Refused {
    pub package: String,
    pub reason: String,
}

impl fmt::Display for Refused {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str(&self.reason)
    }
}

impl std::error::Error for Refused {}

/// The change does more than install packages over the kept build root, so it's built over
/// the system alone.
#[derive(Debug)]
pub struct NotAdding;

impl fmt::Display for NotAdding {
    fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("The change replaces or removes packages of the kept build.")
    }
}

impl std::error::Error for NotAdding {}

/// What the build root has before anything is installed: Luft's own packages, and those of
/// the kept build it goes on from.
#[derive(Clone, Copy)]
pub struct Installed<'a> {
    pub base: &'a BTreeSet<String>,
    pub kept: &'a [Rpm],
}

/// What a build leaves out so the rest can be built: requested packages that can't be, with
/// why, and the dependencies dnf has to do without.
#[derive(Default)]
pub struct Choices {
    pub left_out: BTreeMap<String, String>,
    excluded: BTreeSet<String>,
    because: Option<String>,
    needed: Vec<String>,
}

impl Choices {
    /// Choices for a build that must have `needed`, the packages just asked for, and fails
    /// instead of leaving one of them out.
    pub fn needing(needed: &[String]) -> Self {
        Self {
            needed: needed.to_vec(),
            ..Self::default()
        }
    }

    fn leave_out(&mut self, name: &str, reason: String) -> Result<()> {
        if self.needed.iter().any(|needed| needed == name) {
            bail!(reason);
        }
        self.left_out.insert(name.to_owned(), reason);
        Ok(())
    }

    /// Leaves the package out of the build: a requested one by itself, a dependency with what
    /// needs it.
    pub fn refuse(&mut self, refused: &Refused, requested: &Requested) -> Result<()> {
        if requested.contains(&refused.package) && !self.left_out.contains_key(&refused.package) {
            return self.leave_out(&refused.package, refused.reason.clone());
        }
        if !self.excluded.insert(refused.package.clone()) {
            bail!(refused.reason.clone());
        }
        self.because = Some(refused.reason.clone());
        Ok(())
    }

    fn missing(&self, name: &str, unavailable: &BTreeSet<String>) -> String {
        if unavailable.contains(name) {
            return format!(
                "There's no package called {name} in Fedora or the software sources that were added."
            );
        }
        self.because.clone().unwrap_or_else(|| {
            format!("{name} needs packages that can't be installed with this version of Luft.")
        })
    }
}

/// Downloads the packages in `requested` and what they need, leaving out what can't be found
/// or would be refused, so one package doesn't keep the others from being built. The kept
/// build's packages are installed in the root already, and are part of what it returns.
pub fn resolve(
    root: &Path,
    release: &str,
    requested: &Requested,
    sources: &Sources,
    store: &Path,
    installed: &Installed,
    choices: &mut Choices,
) -> Result<Vec<Rpm>> {
    let Installed { base, kept } = *installed;
    for name in requested.iter().filter(|name| base.contains(*name)) {
        choices.leave_out(name, format!("{name} is already part of Luft."))?;
    }
    loop {
        let wanted: Requested = requested
            .iter()
            .filter(|name| !choices.left_out.contains_key(*name))
            .cloned()
            .collect();
        if wanted.is_empty() {
            return Ok(Vec::new());
        }
        let downloaded =
            download::download(root, release, &wanted, &choices.excluded, sources, store)?;
        if !kept.is_empty() && !downloaded.adding {
            return Err(NotAdding.into());
        }
        let (paths, origins): (Vec<_>, Vec<_>) = downloaded.origins.into_iter().unzip();
        let mut rpms: Vec<Rpm> = rpm::query(&paths)?
            .into_iter()
            .zip(origins)
            .map(|(rpm, origin)| Rpm { origin, ..rpm })
            .chain(kept.iter().cloned())
            .collect();
        rpms.sort_by(|left, right| left.name.cmp(&right.name));
        for name in &wanted {
            if !rpms.iter().any(|rpm| rpm.answers(name)) {
                let reason = choices.missing(name, &downloaded.unavailable);
                choices.leave_out(name, reason)?;
            }
        }
        let refusals = checks::check(&rpms, base);
        if refusals.is_empty() {
            return Ok(rpms);
        }
        for refused in &refusals {
            choices.refuse(refused, requested)?;
        }
    }
}
