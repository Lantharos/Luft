use std::fs::File;
use std::io;

use rustix::fs::{FlockOperation, flock};

const LOCK: &str = "/run/lock/luft-system-disk";

pub struct DiskChange {
    _held: File,
}

impl DiskChange {
    pub fn begin(waiting: impl FnOnce()) -> io::Result<Self> {
        let file = File::create(LOCK)?;
        if flock(&file, FlockOperation::NonBlockingLockExclusive).is_err() {
            waiting();
            flock(&file, FlockOperation::LockExclusive)?;
        }
        Ok(Self { _held: file })
    }
}
