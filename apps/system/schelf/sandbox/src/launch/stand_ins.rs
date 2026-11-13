use std::os::fd::BorrowedFd;
use std::path::{Path, PathBuf};

use luft_software::apps::places::Drive;

use crate::app::Grants;
use crate::drives::Trips;

/// Empty folders where the drives the app was never asked about are
/// mounted, which tell the launcher when the app looks inside one.
pub struct StandIns {
    trips: Trips<Drive>,
    pub binds: Vec<(PathBuf, PathBuf)>,
}

/// Whether the sandbox shows `point` some other way: inside your home, which
/// the app either sees whole or has its own folder in place of, or inside a
/// folder it was given.
fn shown_otherwise(point: &Path, home: &Path, grants: &Grants) -> bool {
    point.starts_with(home)
        || grants
            .folders
            .iter()
            .chain(&grants.read_only_folders)
            .any(|folder| point.starts_with(folder))
}

impl StandIns {
    pub fn plant(root: &Path, home: &Path, grants: &Grants) -> Result<Self, String> {
        let mut stand_ins = Self {
            trips: Trips::new()?,
            binds: Vec::new(),
        };
        let points = grants.unasked.iter().flat_map(|drive| {
            drive
                .mount_points
                .iter()
                .filter(|point| !shown_otherwise(point, home, grants))
                .map(move |point| (drive, point))
        });
        for (index, (drive, point)) in points.enumerate() {
            let folder = root.join(index.to_string());
            std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
            stand_ins.trips.watch(&folder, drive.clone())?;
            stand_ins.binds.push((folder, point.clone()));
        }
        Ok(stand_ins)
    }

    pub fn fd(&self) -> BorrowedFd<'_> {
        self.trips.fd()
    }

    /// The drives the app looked inside since the last call.
    pub fn wanted(&self) -> Vec<Drive> {
        self.trips.tripped()
    }
}
