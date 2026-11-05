pub mod archive;
pub mod capabilities;
pub mod document;
pub mod error;
pub mod font;
pub mod formats;
pub mod image;
pub mod inspect;
pub mod job;
pub mod media;
pub mod publish;

use std::path::PathBuf;

use self::error::{Failure, Result};
use self::formats::{Family, Format};
use self::job::Job;

pub struct Progress<'a> {
    report: &'a (dyn Fn(f32) + Sync),
}

impl<'a> Progress<'a> {
    pub fn new(report: &'a (dyn Fn(f32) + Sync)) -> Self {
        Self { report }
    }

    pub fn report(&self, fraction: f32) {
        (self.report)(fraction);
    }
}

fn source_format(job: &Job) -> Result<&'static Format> {
    let input = job
        .inputs
        .first()
        .ok_or_else(|| Failure::damaged("no input"))?;
    formats::detect(input)
        .ok_or_else(|| Failure::unsupported(&input.to_string_lossy(), &job.format))
}

fn dispatch(job: &Job, progress: &Progress) -> Result<()> {
    let target =
        formats::by_id(&job.format).ok_or_else(|| Failure::unsupported("", &job.format))?;
    if target.family == Family::Archive {
        return archive::convert(job, progress);
    }
    let source = source_format(job)?;
    match (source.family, target.family) {
        (Family::Font, _) => font::convert(job),
        (Family::Video | Family::Audio, _) => media::convert(job, progress),
        (Family::Image, Family::Video) => media::convert(job, progress),
        (Family::Image, Family::Image) => image::convert(job, source, progress),
        (_, Family::Document | Family::Sheet) => document::convert(job, source, progress),
        (Family::Document, Family::Image) => document::convert(job, source, progress),
        _ => Err(Failure::unsupported(source.label, target.label)),
    }
}

pub fn run(job: &Job, progress: &Progress) -> Result<PathBuf> {
    let outcome = dispatch(job, progress).and_then(|()| publish::publish(job));
    if outcome.is_err() {
        publish::discard(job);
    }
    outcome
}
