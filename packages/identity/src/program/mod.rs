//! Which of Luft's own programs a process runs: a program installed with the
//! system, from the read-only image, with nothing of anyone else's slipped
//! into it. See [Luft's own programs](https://docs.luft.computer/security/identity/#lufts-own-programs)
//! for what this does and doesn't tell apart.

mod development;
mod image;
mod injected;
mod locations;

use std::os::fd::BorrowedFd;
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
    (locations::is_luft_location(path) && image::is_image_path(path)) || development::built(path)
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
    let program = if running.is_installed() {
        if injected::into(&folder, pid, &running.path) {
            return None;
        }
        Program {
            path: running.path,
            built: false,
        }
    } else if development::built(&running.path) {
        Program {
            path: running.path,
            built: true,
        }
    } else {
        return None;
    };
    (pid_of(pidfd) == Some(pid)).then_some(program)
}
