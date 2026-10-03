use std::io::{self, BufRead, Write};

use zeroize::Zeroizing;

const SOURCE_PINENTRY: u32 = 5 << 24;
pub const TIMEOUT: u32 = SOURCE_PINENTRY | 62;
pub const CANCELLED: u32 = SOURCE_PINENTRY | 99;
pub const NOT_CONFIRMED: u32 = SOURCE_PINENTRY | 114;
pub const UNKNOWN_COMMAND: u32 = SOURCE_PINENTRY | 275;

const LINE_LENGTH: usize = 1000;
const DATA_PREFIX: &[u8] = b"D ";

pub struct Assuan<R, W> {
    input: R,
    output: W,
}

impl<R: BufRead, W: Write> Assuan<R, W> {
    pub fn new(input: R, output: W) -> Self {
        Self { input, output }
    }

    pub fn read_line(&mut self) -> io::Result<Option<Zeroizing<Vec<u8>>>> {
        let mut line = Zeroizing::new(Vec::with_capacity(LINE_LENGTH));
        if self.input.read_until(b'\n', &mut line)? == 0 {
            return Ok(None);
        }
        while line
            .last()
            .is_some_and(|byte| matches!(byte, b'\n' | b'\r'))
        {
            line.pop();
        }
        Ok(Some(line))
    }

    fn send(&mut self, line: &[u8]) -> io::Result<()> {
        self.output.write_all(line)?;
        self.output.write_all(b"\n")?;
        self.output.flush()
    }

    pub fn greet(&mut self) -> io::Result<()> {
        self.send(format!("OK Pleased to meet you, process {}", std::process::id()).as_bytes())
    }

    pub fn ok(&mut self) -> io::Result<()> {
        self.send(b"OK")
    }

    pub fn err(&mut self, code: u32, text: &str) -> io::Result<()> {
        self.send(format!("ERR {code} {text} <Pinentry>").as_bytes())
    }

    pub fn status(&mut self, keyword: &str) -> io::Result<()> {
        self.send(format!("S {keyword}").as_bytes())
    }

    pub fn data(&mut self, bytes: &[u8]) -> io::Result<()> {
        let mut line = Zeroizing::new(DATA_PREFIX.to_vec());
        for &byte in bytes {
            if line.len() + 3 > LINE_LENGTH - 1 {
                self.send(&line)?;
                line.truncate(DATA_PREFIX.len());
            }
            match byte {
                b'%' | b'\r' | b'\n' => line.extend_from_slice(format!("%{byte:02X}").as_bytes()),
                _ => line.push(byte),
            }
        }
        self.send(&line)
    }

    pub fn inquire(
        &mut self,
        keyword: &str,
        argument: &[u8],
    ) -> io::Result<Option<Zeroizing<Vec<u8>>>> {
        let mut line = Zeroizing::new(format!("INQUIRE {keyword} ").into_bytes());
        for &byte in argument {
            if byte.is_ascii_alphanumeric() {
                line.push(byte);
            } else {
                line.extend_from_slice(format!("%{byte:02X}").as_bytes());
            }
        }
        if line.len() >= LINE_LENGTH {
            return Ok(None);
        }
        self.send(&line)?;
        let mut answer = Zeroizing::new(Vec::new());
        while let Some(line) = self.read_line()? {
            match line.as_slice() {
                b"END" => return Ok(Some(answer)),
                b"CAN" => return Ok(None),
                data if data.starts_with(DATA_PREFIX) => {
                    answer.extend(unescape(&data[DATA_PREFIX.len()..]).iter())
                }
                _ => {}
            }
        }
        Ok(None)
    }
}

pub fn unescape(text: &[u8]) -> Zeroizing<Vec<u8>> {
    let mut bytes = Zeroizing::new(Vec::with_capacity(text.len()));
    let mut rest = text;
    while let Some((&byte, tail)) = rest.split_first() {
        let decoded = (byte == b'%')
            .then(|| tail.get(..2))
            .flatten()
            .and_then(|hex| std::str::from_utf8(hex).ok())
            .and_then(|hex| u8::from_str_radix(hex, 16).ok());
        match decoded {
            Some(value) => {
                bytes.push(value);
                rest = &tail[2..];
            }
            None => {
                bytes.push(byte);
                rest = tail;
            }
        }
    }
    bytes
}
