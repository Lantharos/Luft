mod entries;
mod formats;

use std::fs;
use std::io::{self, Read};
use std::path::PathBuf;

use self::entries::{FolderSink, Sink, input_size, visit_paths};
use self::formats::{archive_sink, visit_archive};
use super::Progress;
use super::error::Result;
use super::formats::{self as table, Family};
use super::job::Job;

struct Counting<'a, 'b> {
    inner: &'a mut dyn Read,
    copied: &'a mut u64,
    total: u64,
    progress: &'b Progress<'b>,
}

impl Read for Counting<'_, '_> {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        let count = self.inner.read(buffer)?;
        *self.copied += count as u64;
        self.progress
            .report((*self.copied as f64 / self.total.max(1) as f64).min(0.99) as f32);
        Ok(count)
    }
}

fn archive_source(job: &Job) -> Option<(&PathBuf, &'static str)> {
    let [input] = job.inputs.as_slice() else {
        return None;
    };
    let format = table::detect(input)?;
    (input.is_file() && format.family == Family::Archive).then_some((input, format.id))
}

fn sink_for(job: &Job) -> Result<Box<dyn Sink>> {
    if job.format == "folder" {
        return Ok(Box::new(FolderSink::new(job.temp.clone())?));
    }
    archive_sink(&job.temp, &job.format, job.options.level)
}

pub fn convert(job: &Job, progress: &Progress) -> Result<()> {
    let mut sink = sink_for(job)?;
    let source = archive_source(job);
    let total = match source {
        Some((path, _)) => fs::metadata(path)?.len(),
        None => input_size(&job.inputs),
    };
    let mut copied = 0;
    let mut visit = |entry: &entries::Entry, content: &mut dyn Read| {
        let mut counted = Counting {
            inner: content,
            copied: &mut copied,
            total,
            progress,
        };
        sink.add(entry, &mut counted)
    };
    match source {
        Some((path, id)) => visit_archive(path, id, &mut visit)?,
        None => visit_paths(&job.inputs, &mut visit)?,
    }
    sink.finish()
}
