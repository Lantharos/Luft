//! Which of Luft's own programs a process runs: a program installed with the
//! system, from the read-only image, with nothing of anyone else's slipped
//! into it. See [docs/security.md](../../../../docs/security.md#lufts-own-programs)
//! for what this does and doesn't tell apart.

mod development;
mod image;
mod injected;

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

/// The Luft program the process a pidfd pins runs, if it runs one.
pub fn of_process(pidfd: BorrowedFd<'_>) -> Option<Program> {
    let pid = pid_of(pidfd)?;
    let folder = open_folder(pid)?;
    let running = image::running(&folder)?;
    let program = if running.is_installed() {
        if injected::into(&folder, &running.path) {
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
