mod sheet;

use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{Seek, Write};
use std::os::fd::{AsFd, FromRawFd};
use std::os::unix::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use zbus::{Fd, Variant};

use crate::dbus::failed;
use crate::portal::{self, FileChooser, Response, uri_path};
use sheet::{Font, Line};

const GROUPS_PER_LINE: usize = 4;
const WORDS_PER_LINE: usize = 3;

pub struct Sheet<'a> {
    pub key: &'a str,
    pub name: String,
    pub explanation: &'a [&'a str],
}

const DISK_EXPLANATION: [&str; 3] = [
    "If your computer asks for a recovery key when it starts, type this key",
    "to unlock its disk. Keep it somewhere other than the computer itself,",
    "such as on paper or in a password manager.",
];

pub fn for_this_computer(key: &str) -> Sheet<'_> {
    for_computer(key, computer())
}

pub fn for_computer(key: &str, name: String) -> Sheet<'_> {
    Sheet {
        key,
        name,
        explanation: &DISK_EXPLANATION,
    }
}

pub fn computer() -> String {
    std::fs::read_to_string("/proc/sys/kernel/hostname")
        .map(|name| name.trim().to_owned())
        .unwrap_or_else(|_| "this computer".into())
}

impl Sheet<'_> {
    fn words(&self) -> Option<Vec<&str>> {
        let words: Vec<&str> = self.key.split(' ').collect();
        (words.len() > 1).then_some(words)
    }

    fn key_rows(&self) -> Vec<String> {
        match self.words() {
            Some(words) => words
                .chunks(WORDS_PER_LINE)
                .enumerate()
                .map(|(row, words)| {
                    let cells: Vec<String> = words
                        .iter()
                        .enumerate()
                        .map(|(column, word)| {
                            format!("{:>2} {word:<9}", row * WORDS_PER_LINE + column + 1)
                        })
                        .collect();
                    cells.join("  ").trim_end().to_owned()
                })
                .collect(),
            None => {
                let key = self.key.to_ascii_uppercase();
                let groups: Vec<&str> = key.split('-').collect();
                groups
                    .chunks(GROUPS_PER_LINE)
                    .map(|chunk| chunk.join("-"))
                    .collect()
            }
        }
    }

    fn text(&self) -> String {
        let mut text = format!(
            "Recovery key for {}\n\n{}\n\n",
            self.name,
            self.key_rows().join("\n")
        );
        if self.words().is_some() {
            text.push_str(self.key);
            text.push_str("\n\n");
        }
        text.push_str(&self.explanation.join(" "));
        text.push('\n');
        text
    }

    fn lines(&self) -> Vec<Line> {
        let mut lines = vec![
            Line {
                font: Font::Heading,
                size: 22,
                gap: 0,
                text: "Recovery key".into(),
            },
            Line {
                font: Font::Text,
                size: 12,
                gap: 26,
                text: format!("For {}", self.name),
            },
        ];
        lines.extend(
            self.key_rows()
                .into_iter()
                .enumerate()
                .map(|(index, row)| Line {
                    font: Font::Key,
                    size: 18,
                    gap: if index == 0 { 60 } else { 32 },
                    text: row,
                }),
        );
        if self.words().is_some() {
            lines.push(Line {
                font: Font::Text,
                size: 12,
                gap: 40,
                text: self.key.to_owned(),
            });
        }
        lines.extend(
            self.explanation
                .iter()
                .enumerate()
                .map(|(index, sentence)| Line {
                    font: Font::Text,
                    size: 12,
                    gap: if index == 0 { 52 } else { 18 },
                    text: (*sentence).into(),
                }),
        );
        lines
    }

    pub fn save_into(&self, folder: &Path, file_name: &str) -> Result<PathBuf, String> {
        let path = folder.join(file_name);
        let mut file = File::create(&path).map_err(failed)?;
        file.write_all(self.text().as_bytes()).map_err(failed)?;
        file.sync_all().map_err(failed)?;
        Ok(path)
    }

    pub async fn save(&self, file_name: &str) -> Result<bool, String> {
        let Some(uri) = FileChooser {
            title: "Save recovery key",
            current_name: Some(file_name),
            ..FileChooser::default()
        }
        .save()
        .await?
        else {
            return Ok(false);
        };
        let path = uri_path(&uri).ok_or("This place can't be saved to")?;
        OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .mode(0o600)
            .open(path)
            .and_then(|mut file| file.write_all(self.text().as_bytes()))
            .map_err(failed)?;
        Ok(true)
    }

    pub async fn print(&self) -> Result<bool, String> {
        let document = sealed_file(&sheet::pdf(&self.lines()))?;
        let (response, _) = portal::request("org.freedesktop.portal.Print", "Print", |token| {
            let options = HashMap::from([("handle_token", Variant::from(token))]);
            ("", "Recovery key", Fd::from(document.as_fd()), options)
        })
        .await?;
        match response {
            Response::Answered => Ok(true),
            Response::Cancelled => Ok(false),
            Response::Ended => Err("The recovery key couldn't be printed".into()),
        }
    }
}

fn sealed_file(bytes: &[u8]) -> Result<File, String> {
    let descriptor = unsafe { libc::memfd_create(c"recovery-key".as_ptr(), libc::MFD_CLOEXEC) };
    if descriptor < 0 {
        return Err(failed(std::io::Error::last_os_error()));
    }
    let mut file = unsafe { File::from_raw_fd(descriptor) };
    file.write_all(bytes).map_err(failed)?;
    file.rewind().map_err(failed)?;
    Ok(file)
}
