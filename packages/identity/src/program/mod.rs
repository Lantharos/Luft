//! Which of Luft's own programs a process runs: a program installed with the
//! system, from the read-only image, with nothing of anyone else's slipped
//! into it. See [Luft's own programs](https://docs.luft.computer/security/identity/#lufts-own-programs)
//! for what this does and doesn't tell apart.

mod development;
mod image;
mod injected;
mod locations;
mod replaced;

use std::os::fd::{BorrowedFd, OwnedFd};
use std::path::{Path, PathBuf};

use crate::process::{open_folder, pid_of};

/// One of Luft's own programs, found running.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Program {
    path: PathBuf,
    built: bool,
}

impl Program {
    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Whether this is the program installed at `installed`, or, in a
    /// development build, the one of that name built in this tree.
    pub fn is(&self, installed: &str) -> bool {
        let installed = Path::new(installed);
        if self.built {
            installed.file_name() == self.path.file_name()
        } else {
            self.path == installed
        }
    }
}

/// Whether `path` is one of Luft's own programs as the read-only image
/// installs it, or, in a development build, one built in this tree. It
/// judges a program file alone, for programs that no longer run, such as
/// one that crashed.
pub fn is_installed_at(path: &Path) -> bool {
    image::image_path(path)
        .is_some_and(|path| locations::is_luft_location(&path) && image::is_image_path(&path))
        || development::built(path)
}

/// Whether `program`, the program file of a process opened through its
/// `exe`, is the one the read-only image installs at `installed`, for checks
/// that go by the program alone.
pub fn is_installed_file(program: &OwnedFd, installed: &Path) -> bool {
    image::is_installed_file(program, installed)
}

/// Whether the program asking runs from outside the image, so it counts the
/// programs built in this tree as Luft's.
pub fn is_development_build() -> bool {
    development::is_development_build()
}

/// The Luft program the process a pidfd pins runs, if it runs one.
pub fn of_process(pidfd: BorrowedFd<'_>) -> Option<Program> {
    let pid = pid_of(pidfd)?;
    let folder = open_folder(pid)?;
    let running = image::running(&folder)?;
    let program = match running.installed() {
        Some(path) if injected::into(&folder, pid, &path) => return None,
        Some(path) => Program { path, built: false },
        None if development::built(&running.path) => Program {
            path: running.path,
            built: true,
        },
        None => return None,
    };
    (pid_of(pidfd) == Some(pid)).then_some(program)
}
