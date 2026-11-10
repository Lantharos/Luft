use std::collections::VecDeque;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Condvar, Mutex, OnceLock};

use image::GrayImage;
use serde::{Deserialize, Serialize};

use super::{Page, folder, page::png};
use crate::imaging;
use crate::settings;

const TESSERACT: &str = "tesseract";
const BACKGROUND_NICENESS: i32 = 15;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Word {
    pub text: String,
    pub left: u32,
    pub width: u32,
    pub line_top: u32,
    pub line_height: u32,
}

#[derive(Serialize, Deserialize)]
struct Reading {
    languages: Vec<String>,
    words: Vec<Word>,
}

pub fn languages() -> Option<&'static [String]> {
    static LANGUAGES: OnceLock<Option<Vec<String>>> = OnceLock::new();
    LANGUAGES
        .get_or_init(|| {
            let output = Command::new(TESSERACT)
                .arg("--list-langs")
                .stderr(Stdio::null())
                .output()
                .ok()?;
            let listed = String::from_utf8_lossy(&output.stdout);
            Some(
                listed
                    .lines()
                    .skip(1)
                    .map(str::trim)
                    .filter(|code| !code.is_empty() && *code != "osd" && *code != "equ")
                    .map(String::from)
                    .collect(),
            )
        })
        .as_deref()
}

fn reading_path(folder: &Path, page: &Page) -> PathBuf {
    folder.join(format!("{}-words-{}.json", page.id, page.shape))
}

fn chosen_languages() -> Vec<String> {
    let available = languages().unwrap_or_default();
    settings::current()
        .languages
        .into_iter()
        .filter(|code| available.contains(code))
        .collect()
}

fn cached(folder: &Path, page: &Page, languages: &[String]) -> Option<Vec<Word>> {
    let reading: Reading =
        serde_json::from_slice(&fs::read(reading_path(folder, page)).ok()?).ok()?;
    (reading.languages == languages).then_some(reading.words)
}

pub fn read(page: &Page) -> Result<Option<Vec<Word>>, String> {
    let languages = chosen_languages();
    if languages.is_empty() {
        return Ok(None);
    }
    let folder = folder();
    if let Some(words) = cached(&folder, page, &languages) {
        return Ok(Some(words));
    }
    let words = recognize(page, &languages, false)?;
    keep(&folder, page, &languages, &words);
    Ok(Some(words))
}

fn keep(folder: &Path, page: &Page, languages: &[String], words: &[Word]) {
    let reading = Reading {
        languages: languages.to_vec(),
        words: words.to_vec(),
    };
    if let Ok(bytes) = serde_json::to_vec(&reading) {
        let _ = fs::write(reading_path(folder, page), bytes);
    }
    let older = format!("{}-words-", page.id);
    let current = reading_path(folder, page);
    for entry in fs::read_dir(folder).into_iter().flatten().flatten() {
        let name = entry.file_name();
        if name.to_string_lossy().starts_with(&older) && entry.path() != current {
            let _ = fs::remove_file(entry.path());
        }
    }
}

static QUEUE: (Mutex<VecDeque<Page>>, Condvar) = (Mutex::new(VecDeque::new()), Condvar::new());

pub fn queue(page: &Page) {
    static WORKER: OnceLock<()> = OnceLock::new();
    if languages().is_none_or(<[String]>::is_empty) {
        return;
    }
    WORKER.get_or_init(|| {
        std::thread::Builder::new()
            .name("ocr".into())
            .spawn(read_queued)
            .expect("a thread for reading pages");
    });
    let mut queue = QUEUE.0.lock().expect("reading queue");
    queue.retain(|queued| queued.id != page.id);
    queue.push_back(page.clone());
    QUEUE.1.notify_one();
}

fn read_queued() {
    loop {
        let page = {
            let mut queue = QUEUE.0.lock().expect("reading queue");
            loop {
                match queue.pop_front() {
                    Some(page) => break page,
                    None => queue = QUEUE.1.wait(queue).expect("reading queue"),
                }
            }
        };
        let languages = chosen_languages();
        let folder = folder();
        if languages.is_empty() || cached(&folder, &page, &languages).is_some() {
            continue;
        }
        match recognize(&page, &languages, true) {
            Ok(words) => keep(&folder, &page, &languages, &words),
            Err(error) => eprintln!("flatbed: couldn't read page {}: {error}", page.id),
        }
    }
}

fn recognize(page: &Page, languages: &[String], background: bool) -> Result<Vec<Word>, String> {
    let source = super::source_of(page)?;
    let grey = imaging::for_reading(&source, &page.quad, page.turns, page.origin);
    let dpi = page
        .dpi
        .map_or_else(|| assumed_dpi(&grey), |dpi| dpi.round() as u32);
    let mut command = Command::new(TESSERACT);
    command
        .args(["stdin", "stdout", "--psm", "3", "--dpi"])
        .arg(dpi.to_string())
        .arg("-l")
        .arg(languages.join("+"))
        .arg("tsv")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null());
    if background {
        command.env("OMP_THREAD_LIMIT", "1");
    }
    let mut child = command.spawn().map_err(|error| error.to_string())?;
    if background {
        // SAFETY: setpriority only changes the scheduling priority of the child we just started.
        unsafe { libc::setpriority(libc::PRIO_PROCESS, child.id(), BACKGROUND_NICENESS) };
    }
    let input = png(&grey)?;
    let mut stdin = child.stdin.take().ok_or("Tesseract took no input")?;
    let writer = std::thread::spawn(move || stdin.write_all(&input));
    let output = child
        .wait_with_output()
        .map_err(|error| error.to_string())?;
    let _ = writer.join();
    if !output.status.success() {
        return Err(format!("Tesseract stopped with {}", output.status));
    }
    Ok(words(&String::from_utf8_lossy(&output.stdout)))
}

fn assumed_dpi(grey: &GrayImage) -> u32 {
    ((f64::from(grey.width().min(grey.height())) / 8.27).round() as u32).clamp(70, 1200)
}

fn words(tsv: &str) -> Vec<Word> {
    let mut words = Vec::new();
    let mut line = (0, 0);
    for row in tsv.lines().skip(1) {
        let fields: Vec<&str> = row.split('\t').collect();
        let [
            level,
            _,
            _,
            _,
            _,
            _,
            left,
            top,
            width,
            height,
            confidence,
            text,
        ] = fields[..]
        else {
            continue;
        };
        let number = |value: &str| value.parse::<u32>().unwrap_or(0);
        match level {
            "4" => line = (number(top), number(height)),
            "5" if !text.trim().is_empty()
                && confidence.parse::<f32>().is_ok_and(|value| value >= 0.0) =>
            {
                words.push(Word {
                    text: text.trim().to_owned(),
                    left: number(left),
                    width: number(width),
                    line_top: line.0,
                    line_height: line.1,
                })
            }
            _ => {}
        }
    }
    words
}
