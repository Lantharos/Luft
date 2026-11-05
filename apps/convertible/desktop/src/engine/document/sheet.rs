use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Write};
use std::path::Path;

use calamine::{Data, Reader, Sheets, open_workbook_auto};
use csv::{ReaderBuilder, WriterBuilder};
use rust_xlsxwriter::Workbook;

use crate::engine::Progress;
use crate::engine::error::{Failure, Result};
use crate::engine::formats;
use crate::engine::job::Job;

fn delimiter(id: &str) -> u8 {
    if id == "tsv" { b'\t' } else { b',' }
}

fn delimited(path: &Path, id: &str) -> Result<csv::Reader<BufReader<File>>> {
    Ok(ReaderBuilder::new()
        .delimiter(delimiter(id))
        .has_headers(false)
        .flexible(true)
        .from_reader(BufReader::new(File::open(path)?)))
}

fn cell_text(cell: &Data) -> String {
    match cell {
        Data::Empty => String::new(),
        Data::Float(value) if value.fract() == 0.0 && value.abs() < 1e15 => format!("{value:.0}"),
        other => other.to_string(),
    }
}

fn write_rows<'a>(path: &Path, id: &str, rows: impl Iterator<Item = &'a [Data]>) -> Result<()> {
    let mut out = WriterBuilder::new()
        .delimiter(delimiter(id))
        .flexible(true)
        .from_writer(BufWriter::new(File::create(path)?));
    for row in rows {
        out.write_record(row.iter().map(cell_text))
            .map_err(Failure::damaged)?;
    }
    out.flush()?;
    Ok(())
}

fn from_workbook(job: &Job, progress: &Progress) -> Result<()> {
    let mut book: Sheets<_> = open_workbook_auto(&job.inputs[0]).map_err(Failure::damaged)?;
    let names = book.sheet_names();
    if job.format == "xlsx" {
        return Err(Failure::unsupported("", "xlsx"));
    }
    let extension = formats::extension_for(&job.format);
    if let [name] = names.as_slice() {
        let range = book.worksheet_range(name).map_err(Failure::damaged)?;
        return write_rows(&job.temp, &job.format, range.rows());
    }
    fs::create_dir_all(&job.temp)?;
    for (index, name) in names.iter().enumerate() {
        let range = book.worksheet_range(name).map_err(Failure::damaged)?;
        let safe = name.replace('/', "-");
        write_rows(
            &job.temp.join(format!("{safe}.{extension}")),
            &job.format,
            range.rows(),
        )?;
        progress.report((index + 1) as f32 / names.len() as f32);
    }
    Ok(())
}

fn from_delimited(job: &Job, source: &str) -> Result<()> {
    let mut reader = delimited(&job.inputs[0], source)?;
    if job.format == "xlsx" {
        let mut book = Workbook::new();
        let sheet = book
            .add_worksheet_with_constant_memory()
            .map_err(Failure::damaged)?;
        for (row, record) in reader.records().enumerate() {
            let record = record.map_err(Failure::damaged)?;
            for (column, value) in record.iter().enumerate() {
                let (row, column) = (row as u32, column as u16);
                match value.parse::<f64>() {
                    Ok(number) => sheet.write_number(row, column, number).map(|_| ()),
                    Err(_) => sheet.write_string(row, column, value).map(|_| ()),
                }
                .map_err(Failure::damaged)?;
            }
        }
        return book.save(&job.temp).map_err(Failure::damaged);
    }
    let mut out = WriterBuilder::new()
        .delimiter(delimiter(&job.format))
        .flexible(true)
        .from_writer(BufWriter::new(File::create(&job.temp)?));
    for record in reader.records() {
        out.write_record(&record.map_err(Failure::damaged)?)
            .map_err(Failure::damaged)?;
    }
    let mut inner = out
        .into_inner()
        .map_err(|error| Failure::damaged(error.to_string()))?;
    inner.flush()?;
    Ok(())
}

pub fn convert(job: &Job, source: &str, progress: &Progress) -> Result<()> {
    match source {
        "csv" | "tsv" => from_delimited(job, source),
        _ => from_workbook(job, progress),
    }
}
