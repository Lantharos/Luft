mod sheet;

use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{Seek, Write};
use std::os::fd::{AsFd, FromRawFd};
use std::os::unix::fs::OpenOptionsExt;

use zbus::{Fd, OwnedObjectPath, Proxy, Variant};

use crate::dbus::{self, failed};
use crate::portal::{FileChooser, uri_path};
use sheet::{Font, Line};

const GROUPS_PER_LINE: usize = 4;

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
    Sheet {
        key,
        name: computer(),
        explanation: &DISK_EXPLANATION,
    }
}

pub fn computer() -> String {
    std::fs::read_to_string("/proc/sys/kernel/hostname")
        .map(|name| name.trim().to_owned())
        .unwrap_or_else(|_| "this computer".into())
}

impl Sheet<'_> {
    fn text(&self) -> String {
        format!(
            "Recovery key for {}\n\n{}\n\n{}\n",
            self.name,
            self.key,
            self.explanation.join(" ")
        )
    }

    fn lines(&self) -> Vec<Line> {
        let groups: Vec<&str> = self.key.split('-').collect();
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
            groups
                .chunks(GROUPS_PER_LINE)
                .enumerate()
                .map(|(index, chunk)| Line {
                    font: Font::Key,
                    size: 22,
                    gap: if index == 0 { 60 } else { 32 },
                    text: chunk.join("-"),
                }),
        );
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

    pub async fn save(&self, file_name: &str) -> Result<bool, String> {
        let Some(uri) = FileChooser {
            title: "Save Recovery Key",
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

    pub async fn print(&self) -> Result<(), String> {
        let document = sealed_file(&sheet::pdf(&self.lines()))?;
        let printer = Proxy::new(
            dbus::session().await?,
            "org.freedesktop.portal.Desktop",
            "/org/freedesktop/portal/desktop",
            "org.freedesktop.portal.Print",
        )
        .await
        .map_err(failed)?;
        let options: HashMap<&str, Variant> = HashMap::new();
        let _: OwnedObjectPath = printer
            .call(
                "Print",
                &("", "Recovery key", Fd::from(document.as_fd()), options),
            )
            .await
            .map_err(failed)?;
        Ok(())
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
