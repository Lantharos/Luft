use std::cell::Cell;
use std::io::{self, Read, Seek, SeekFrom};
use std::path::Path;

use crate::files::operations::{OperationStatus, OperationsQueue};

pub(super) struct Progress<'a> {
    queue: &'a OperationsQueue,
    id: &'a str,
    bytes: Cell<u64>,
    items: Cell<usize>,
}

impl<'a> Progress<'a> {
    pub fn new(queue: &'a OperationsQueue, id: &'a str) -> Self {
        Self {
            queue,
            id,
            bytes: Cell::new(0),
            items: Cell::new(0),
        }
    }

    pub fn guard(&self) -> io::Result<()> {
        match self.queue.status_once_unpaused(self.id) {
            Some(OperationStatus::Cancelled) => Err(io::Error::other("Operation cancelled")),
            _ => Ok(()),
        }
    }

    pub fn item(&self, path: &Path) {
        self.items.set(self.items.get() + 1);
        self.report(Some(path));
    }

    fn add(&self, bytes: u64) {
        self.bytes.set(self.bytes.get() + bytes);
        self.report(None);
    }

    fn report(&self, path: Option<&Path>) {
        self.queue.update_progress(
            self.id,
            path.map(|path| path.to_string_lossy().into_owned()),
            self.bytes.get(),
            self.items.get(),
        );
    }
}

pub(super) struct Counted<'a, 'p, R> {
    inner: R,
    progress: &'a Progress<'p>,
}

impl<'a, 'p, R> Counted<'a, 'p, R> {
    pub fn new(inner: R, progress: &'a Progress<'p>) -> Self {
        Self { inner, progress }
    }
}

impl<R: Read> Read for Counted<'_, '_, R> {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        self.progress.guard()?;
        let read = self.inner.read(buffer)?;
        self.progress.add(read as u64);
        Ok(read)
    }
}

impl<R: Seek> Seek for Counted<'_, '_, R> {
    fn seek(&mut self, position: SeekFrom) -> io::Result<u64> {
        self.inner.seek(position)
    }
}
