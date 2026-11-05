use std::os::fd::OwnedFd;

use zbus::Signature;
use zbus::wire::Endian;
use zbus::wire::serialized::{Context, Data};

const FIXED_HEADER: usize = 16;
const MAXIMUM: usize = 128 << 20;
const PROTOCOL_VERSION: u8 = 1;
const NO_REPLY_EXPECTED: u8 = 0x1;

pub const METHOD_CALL: u8 = 1;
const METHOD_RETURN: u8 = 2;
const ERROR: u8 = 3;
const SIGNAL: u8 = 4;

const PATH: u8 = 1;
const INTERFACE: u8 = 2;
const MEMBER: u8 = 3;
const ERROR_NAME: u8 = 4;
const REPLY_SERIAL: u8 = 5;
const DESTINATION: u8 = 6;
const SENDER: u8 = 7;
const SIGNATURE: u8 = 8;
const UNIX_FDS: u8 = 9;

/// One whole message as it travels, with the file descriptors sent along.
pub struct Frame {
    pub bytes: Vec<u8>,
    pub fds: Vec<OwnedFd>,
}

/// What the relay needs to know about a message: where it goes and what it
/// calls.
#[derive(Default)]
pub struct Header {
    pub kind: u8,
    pub flags: u8,
    pub serial: u32,
    pub interface: String,
    pub member: String,
    pub destination: String,
    pub signature: String,
    pub unix_fds: u32,
    body: usize,
    little: bool,
}

fn padded(length: usize, alignment: usize) -> usize {
    length.div_ceil(alignment) * alignment
}

fn word(bytes: &[u8], at: usize, little: bool) -> Option<u32> {
    let raw: [u8; 4] = bytes.get(at..at + 4)?.try_into().ok()?;
    Some(if little {
        u32::from_le_bytes(raw)
    } else {
        u32::from_be_bytes(raw)
    })
}

fn endian(first: u8) -> Option<bool> {
    match first {
        b'l' => Some(true),
        b'B' => Some(false),
        _ => None,
    }
}

/// The length of the message `bytes` starts with, once its fixed header has
/// arrived, or `None` while it hasn't.
pub fn length(bytes: &[u8]) -> Option<Result<usize, String>> {
    if bytes.len() < FIXED_HEADER {
        return None;
    }
    let Some(little) = endian(bytes[0]) else {
        return Some(Err("not a D-Bus message".into()));
    };
    let body = word(bytes, 4, little)? as usize;
    let fields = word(bytes, 12, little)? as usize;
    let total = padded(FIXED_HEADER + fields, 8).saturating_add(body);
    Some(if total > MAXIMUM {
        Err("message too long".into())
    } else {
        Ok(total)
    })
}

struct Fields<'a> {
    bytes: &'a [u8],
    at: usize,
    end: usize,
    little: bool,
}

impl Fields<'_> {
    fn byte(&mut self) -> Option<u8> {
        let byte = *self.bytes.get(self.at)?;
        self.at += 1;
        Some(byte)
    }

    fn text(&mut self, length: usize) -> Option<String> {
        let text = std::str::from_utf8(self.bytes.get(self.at..self.at + length)?).ok()?;
        self.at += length + 1;
        Some(text.to_owned())
    }

    fn value(&mut self, signature: u8) -> Option<Value> {
        match signature {
            b's' | b'o' => {
                self.at = padded(self.at, 4);
                let length = word(self.bytes, self.at, self.little)? as usize;
                self.at += 4;
                self.text(length).map(Value::Text)
            }
            b'g' => {
                let length = self.byte()? as usize;
                self.text(length).map(Value::Text)
            }
            b'u' => {
                self.at = padded(self.at, 4);
                let number = word(self.bytes, self.at, self.little)?;
                self.at += 4;
                Some(Value::Number(number))
            }
            _ => None,
        }
    }

    fn next(&mut self) -> Option<Option<(u8, Value)>> {
        self.at = padded(self.at, 8);
        if self.at >= self.end {
            return Some(None);
        }
        let code = self.byte()?;
        let signature_length = self.byte()?;
        let signature = self.text(signature_length as usize)?;
        let [kind] = signature.as_bytes() else {
            return None;
        };
        Some(Some((code, self.value(*kind)?)))
    }
}

enum Value {
    Text(String),
    Number(u32),
}

pub fn header(bytes: &[u8]) -> Result<Header, String> {
    let malformed = || "malformed message header".to_owned();
    let little = endian(*bytes.first().ok_or_else(malformed)?).ok_or_else(malformed)?;
    let fields_length = word(bytes, 12, little).ok_or_else(malformed)? as usize;
    let mut header = Header {
        kind: bytes[1],
        flags: bytes[2],
        serial: word(bytes, 8, little).ok_or_else(malformed)?,
        body: padded(FIXED_HEADER + fields_length, 8),
        little,
        ..Header::default()
    };
    let mut fields = Fields {
        bytes,
        at: FIXED_HEADER,
        end: FIXED_HEADER + fields_length,
        little,
    };
    while let Some((code, value)) = fields.next().ok_or_else(malformed)? {
        match (code, value) {
            (INTERFACE, Value::Text(text)) => header.interface = text,
            (MEMBER, Value::Text(text)) => header.member = text,
            (DESTINATION, Value::Text(text)) => header.destination = text,
            (SIGNATURE, Value::Text(text)) => header.signature = text,
            (UNIX_FDS, Value::Number(count)) => header.unix_fds = count,
            _ => {}
        }
    }
    Ok(header)
}

impl Header {
    pub fn wants_reply(&self) -> bool {
        self.flags & NO_REPLY_EXPECTED == 0
    }

    /// The message's arguments, read as `signature`.
    pub fn body(&self, frame: Frame) -> Data<'static, 'static> {
        let endian = if self.little {
            Endian::Little
        } else {
            Endian::Big
        };
        let bytes = frame.bytes.get(self.body..).unwrap_or_default().to_vec();
        Data::new_fds(bytes, Context::new(endian, 0), frame.fds)
    }
}

/// A message the sandbox writes itself, always little-endian.
pub struct Outgoing<'a> {
    kind: u8,
    fields: Vec<(u8, &'a str, FieldValue<'a>)>,
    body: Vec<u8>,
}

enum FieldValue<'a> {
    Text(&'a str),
    Number(u32),
}

impl<'a> Outgoing<'a> {
    pub fn reply(to: &Header, sender: &'a str) -> Self {
        Self {
            kind: METHOD_RETURN,
            fields: vec![
                (REPLY_SERIAL, "u", FieldValue::Number(to.serial)),
                (SENDER, "s", FieldValue::Text(sender)),
            ],
            body: Vec::new(),
        }
    }

    pub fn error(to: &Header, sender: &'a str, name: &'a str, text: &str) -> Self {
        let mut error = Self {
            kind: ERROR,
            fields: vec![
                (REPLY_SERIAL, "u", FieldValue::Number(to.serial)),
                (SENDER, "s", FieldValue::Text(sender)),
                (ERROR_NAME, "s", FieldValue::Text(name)),
            ],
            body: Vec::new(),
        };
        error.set_body("s", &(text,));
        error
    }

    pub fn signal(sender: &'a str, path: &'a str, interface: &'a str, member: &'a str) -> Self {
        Self {
            kind: SIGNAL,
            fields: vec![
                (PATH, "o", FieldValue::Text(path)),
                (INTERFACE, "s", FieldValue::Text(interface)),
                (MEMBER, "s", FieldValue::Text(member)),
                (SENDER, "s", FieldValue::Text(sender)),
            ],
            body: Vec::new(),
        }
    }

    /// Sets the arguments, `value` written as the struct of `signature`.
    pub fn with_body(mut self, signature: &'a str, value: &impl serde::Serialize) -> Self {
        self.set_body(signature, value);
        self
    }

    fn set_body(&mut self, signature: &'a str, value: &impl serde::Serialize) {
        let whole = Signature::try_from(format!("({signature})").as_str())
            .expect("the sandbox's own signatures are valid");
        let context = Context::new(Endian::Little, 0);
        self.body = zbus::wire::to_bytes_for_signature(context, &whole, value)
            .expect("the sandbox's own replies serialize")
            .bytes()
            .to_vec();
        self.fields
            .push((SIGNATURE, "g", FieldValue::Text(signature)));
    }

    pub fn bytes(&self, serial: u32) -> Vec<u8> {
        let mut message = vec![b'l', self.kind, NO_REPLY_EXPECTED, PROTOCOL_VERSION];
        message.extend((self.body.len() as u32).to_le_bytes());
        message.extend(serial.to_le_bytes());
        message.extend([0; 4]);
        for (code, signature, value) in &self.fields {
            message.resize(padded(message.len(), 8), 0);
            message.push(*code);
            message.push(signature.len() as u8);
            message.extend(signature.as_bytes());
            message.push(0);
            match value {
                FieldValue::Text(text) if *signature == "g" => {
                    message.push(text.len() as u8);
                    message.extend(text.as_bytes());
                }
                FieldValue::Text(text) => {
                    message.resize(padded(message.len(), 4), 0);
                    message.extend((text.len() as u32).to_le_bytes());
                    message.extend(text.as_bytes());
                }
                FieldValue::Number(number) => {
                    message.resize(padded(message.len(), 4), 0);
                    message.extend(number.to_le_bytes());
                }
            }
            if matches!(value, FieldValue::Text(_)) {
                message.push(0);
            }
        }
        let fields = (message.len() - FIXED_HEADER) as u32;
        message[12..16].copy_from_slice(&fields.to_le_bytes());
        message.resize(padded(message.len(), 8), 0);
        message.extend(&self.body);
        message
    }
}
