mod office;
pub mod pdf;
mod sheet;
mod text;
mod typeset;

use std::fs;

use super::Progress;
use super::error::{Failure, Result};
use super::formats::{self, Family, Format};
use super::job::Job;

fn title(job: &Job, source: &Format) -> String {
    formats::file_stem(&job.inputs[0], Some(source))
}

fn markdown_source(job: &Job, source: &Format) -> Result<String> {
    let input = &job.inputs[0];
    match source.id {
        "md" => text::read(input),
        "txt" => Ok(text::escape_plain(&text::read(input)?)),
        "html" => text::html_to_markdown(&text::read(input)?),
        "docx" => office::docx_to_markdown(input),
        "odt" => office::odt_to_markdown(input),
        _ => Err(Failure::unsupported(source.label, &job.format)),
    }
}

fn written(job: &Job, source: &Format) -> Result<()> {
    let markdown = markdown_source(job, source)?;
    match job.format.as_str() {
        "md" => fs::write(&job.temp, markdown)?,
        "txt" => fs::write(&job.temp, text::to_plain(&markdown))?,
        "html" => fs::write(&job.temp, text::to_html(&markdown, &title(job, source)))?,
        "pdf" => typeset::to_pdf(&markdown, &job.temp)?,
        other => return Err(Failure::unsupported(source.label, other)),
    }
    Ok(())
}

fn from_pdf(job: &Job, progress: &Progress) -> Result<()> {
    match job.format.as_str() {
        "pdf" => pdf::split(job, progress),
        "txt" => pdf::to_text(job),
        _ => pdf::to_images(job, progress),
    }
}

pub fn convert(job: &Job, source: &Format, progress: &Progress) -> Result<()> {
    if job.format == "pdf" && job.inputs.len() > 1 {
        return pdf::merge(job, progress);
    }
    match source.family {
        Family::Image => pdf::from_images(job),
        Family::Sheet => sheet::convert(job, source.id, progress),
        _ if source.id == "pdf" => from_pdf(job, progress),
        _ => written(job, source),
    }
}
