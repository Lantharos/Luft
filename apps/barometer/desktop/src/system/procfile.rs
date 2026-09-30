use std::fs::{self, File};
use std::io;
use std::os::unix::fs::FileExt;
use std::path::Path;
use std::str::FromStr;

const INITIAL_CAPACITY: usize = 512;

pub struct ProcFile {
    file: File,
    buffer: Vec<u8>,
}

impl ProcFile {
    pub fn open(path: impl AsRef<Path>) -> io::Result<Self> {
        Ok(Self {
            file: File::open(path)?,
            buffer: vec![0; INITIAL_CAPACITY],
        })
    }

    pub fn read(&mut self) -> io::Result<&[u8]> {
        loop {
            let read = self.file.read_at(&mut self.buffer, 0)?;
            if read < self.buffer.len() {
                return Ok(&self.buffer[..read]);
            }
            self.buffer.resize(self.buffer.len() * 2, 0);
        }
    }

    pub fn text(&mut self) -> io::Result<&str> {
        let bytes = self.read()?;
        std::str::from_utf8(bytes)
            .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))
    }

    pub fn number<T: FromStr>(&mut self) -> Option<T> {
        self.text().ok()?.trim().parse().ok()
    }
}

pub fn read_text(path: impl AsRef<Path>) -> Option<String> {
    let text = fs::read_to_string(path).ok()?;
    let trimmed = text.trim();
    (!trimmed.is_empty()).then(|| trimmed.to_owned())
}

pub fn read_number<T: FromStr>(path: impl AsRef<Path>) -> Option<T> {
    read_text(path)?.parse().ok()
}

pub fn link_name(path: impl AsRef<Path>) -> Option<String> {
    let target = fs::read_link(path).ok()?;
    Some(target.file_name()?.to_string_lossy().into_owned())
}

pub fn keyed<'a>(text: &'a str, key: &str) -> Option<&'a str> {
    text.lines().find_map(|line| {
        let (name, value) = line.split_once(':')?;
        (name == key).then(|| value.trim())
    })
}

pub fn udev_property(device: &str, key: &str) -> Option<String> {
    let text = fs::read_to_string(format!("/run/udev/data/{device}")).ok()?;
    let prefix = format!("E:{key}=");
    text.lines()
        .find_map(|line| line.strip_prefix(&prefix))
        .map(unescape_hex)
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

pub fn unescape_hex(value: &str) -> String {
    let mut output = Vec::with_capacity(value.len());
    let bytes = value.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'\\'
            && bytes.get(index + 1) == Some(&b'x')
            && let Some(byte) = value
                .get(index + 2..index + 4)
                .and_then(|hex| u8::from_str_radix(hex, 16).ok())
        {
            output.push(byte);
            index += 4;
        } else {
            output.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8_lossy(&output).into_owned()
}
