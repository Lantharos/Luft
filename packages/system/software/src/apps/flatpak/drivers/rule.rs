use std::collections::BTreeSet;

use crate::system::image::Graphics;

const NVIDIA: &str = "nvidia-";

/// An app or runtime in an installation, as `id/arch/branch`.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Ref {
    pub id: String,
    pub arch: String,
    pub branch: String,
}

impl Ref {
    pub fn named(&self) -> String {
        format!("{}/{}/{}", self.id, self.arch, self.branch)
    }
}

/// What Flatpak looks at to decide whether an extension belongs on this computer.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Condition {
    ActiveGlDriver,
    NvidiaModule,
}

impl Condition {
    pub fn named(name: &str) -> Option<Self> {
        match name {
            "active-gl-driver" => Some(Self::ActiveGlDriver),
            "have-kernel-module-nvidia" => Some(Self::NvidiaModule),
            _ => None,
        }
    }
}

/// An extension point an app or runtime declares, such as `org.freedesktop.Platform.GL`.
#[derive(Clone, Debug)]
pub struct Point {
    pub owner: Ref,
    pub name: String,
    pub branches: Vec<String>,
    pub download_if: Option<Condition>,
    pub prune_unless: Option<Condition>,
}

/// The NVIDIA drivers that matter to an installation: the one running, as Flatpak names it
/// (`nvidia-620-70-06`), and those of the versions of Luft waiting for the next restart and kept
/// to go back to.
pub struct Drivers {
    pub running: Option<String>,
    pub staged: Option<Graphics>,
    pub rollback: Option<Graphics>,
}

/// An extension to install from the remote the app or runtime that wants it came from, on
/// whichever of its branches that remote has.
#[derive(Debug, PartialEq, Eq)]
pub struct Wanted {
    pub owner: Ref,
    pub id: String,
    pub arch: String,
    pub branches: Vec<String>,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Plan {
    pub install: Vec<Wanted>,
    pub remove: Vec<Ref>,
}

/// The name Flatpak gives an NVIDIA driver's extensions: `620.70.06` becomes `nvidia-620-70-06`.
pub fn driver_name(version: &str) -> String {
    format!("{NVIDIA}{}", version.trim().replace('.', "-"))
}

fn nvidia(graphics: Option<&Graphics>) -> Option<Option<String>> {
    match graphics? {
        Graphics::Nvidia(version) => Some(version.as_deref().map(driver_name)),
        Graphics::Standard => None,
    }
}

impl Drivers {
    fn fetched(&self) -> BTreeSet<String> {
        let staged = nvidia(self.staged.as_ref()).flatten();
        self.running.iter().cloned().chain(staged).collect()
    }

    fn kept(&self) -> Option<BTreeSet<String>> {
        let mut kept = self.fetched();
        for other in [&self.staged, &self.rollback] {
            if let Some(driver) = nvidia(other.as_ref()) {
                kept.insert(driver?);
            }
        }
        Some(kept)
    }

    fn nvidia_next(&self) -> bool {
        self.running.is_some() || nvidia(self.staged.as_ref()).is_some()
    }

    fn nvidia_kept(&self) -> bool {
        self.nvidia_next() || nvidia(self.rollback.as_ref()).is_some()
    }
}

impl Point {
    fn wanted(&self, id: String) -> Wanted {
        Wanted {
            owner: self.owner.clone(),
            id,
            arch: self.owner.arch.clone(),
            branches: self.branches.clone(),
        }
    }

    fn holds(&self, extension: &Ref) -> bool {
        extension.arch == self.owner.arch && self.branches.contains(&extension.branch)
    }

    fn driver_of<'a>(&self, extension: &'a Ref) -> Option<&'a str> {
        let driver = extension.id.strip_prefix(&self.name)?.strip_prefix('.')?;
        driver.starts_with(NVIDIA).then_some(driver)
    }
}

/// What an installation lacks for the NVIDIA drivers it can run with, and the extensions it
/// holds for drivers no version of Luft on the computer has. A driver's extensions stay while
/// any version on the computer might need them, so all of them stay when a version's driver
/// can't be told.
pub fn plan(points: &[Point], installed: &BTreeSet<Ref>, drivers: &Drivers) -> Plan {
    let fetched = drivers.fetched();
    let kept = drivers.kept();
    let has = |id: &str, point: &Point| {
        installed
            .iter()
            .any(|extension| extension.id == id && point.holds(extension))
    };
    let mut plan = Plan::default();
    for point in points {
        match point.download_if {
            Some(Condition::ActiveGlDriver) => plan.install.extend(
                fetched
                    .iter()
                    .map(|driver| format!("{}.{driver}", point.name))
                    .filter(|id| !has(id, point))
                    .map(|id| point.wanted(id)),
            ),
            Some(Condition::NvidiaModule) if drivers.nvidia_next() && !has(&point.name, point) => {
                plan.install.push(point.wanted(point.name.clone()));
            }
            _ => {}
        }
        let stale = |extension: &&Ref| match point.prune_unless {
            Some(Condition::ActiveGlDriver) => point
                .driver_of(extension)
                .zip(kept.as_ref())
                .is_some_and(|(driver, kept)| !kept.contains(driver)),
            Some(Condition::NvidiaModule) => extension.id == point.name && !drivers.nvidia_kept(),
            None => false,
        };
        plan.remove.extend(
            installed
                .iter()
                .filter(|extension| point.holds(extension))
                .filter(stale)
                .cloned(),
        );
    }
    plan.remove.sort();
    plan.remove.dedup();
    plan
}

#[cfg(test)]
mod tests;
