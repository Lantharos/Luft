use std::fs::File;
use std::io;

use rustix::fs::{FlockOperation, flock};

const LOCK: &str = "/run/lock/luft-system-disk";

pub struct DiskChange {
    _held: File,
}

fn locked(operation: FlockOperation) -> io::Result<DiskChange> {
    let file = File::create(LOCK)?;
    flock(&file, operation)?;
    Ok(DiskChange { _held: file })
}

impl DiskChange {
    pub fn try_begin() -> io::Result<Option<Self>> {
        match locked(FlockOperation::NonBlockingLockExclusive) {
            Ok(change) => Ok(Some(change)),
            Err(error) if error.kind() == io::ErrorKind::WouldBlock => Ok(None),
            Err(error) => Err(error),
        }
    }

    pub fn wait() -> io::Result<Self> {
        locked(FlockOperation::LockExclusive)
    }
}
