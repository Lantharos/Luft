use std::io;

const VERSION: [u8; 2] = [2, 0];
const OPERATION: u8 = 0x01;
pub const JOB: u8 = 0x02;
const END: u8 = 0x03;
const PRINTER: u8 = 0x04;
pub const SUBSCRIPTION: u8 = 0x06;
const INTEGER: u8 = 0x21;
const BOOLEAN: u8 = 0x22;
const ENUM: u8 = 0x23;
const RANGE: u8 = 0x33;
const NAME: u8 = 0x42;
const KEYWORD: u8 = 0x44;
const URI: u8 = 0x45;
const CHARSET: u8 = 0x47;
const LANGUAGE: u8 = 0x48;
const MIME_TYPE: u8 = 0x49;

#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Integer(i32),
    Range(i32, i32),
    Text(String),
}

pub struct Request {
    body: Vec<u8>,
    group: u8,
}

impl Request {
    pub fn new(operation: u16, id: u32) -> Self {
        let mut body = VERSION.to_vec();
        body.extend(operation.to_be_bytes());
        body.extend(id.to_be_bytes());
        let mut request = Self { body, group: 0 };
        request.group(OPERATION);
        request.attribute(CHARSET, "attributes-charset", &[b"utf-8"]);
        request.attribute(LANGUAGE, "attributes-natural-language", &[b"en"]);
        request
    }

    pub fn group(&mut self, group: u8) -> &mut Self {
        if self.group != group {
            self.body.push(group);
            self.group = group;
        }
        self
    }

    fn attribute(&mut self, tag: u8, name: &str, values: &[&[u8]]) -> &mut Self {
        for (index, value) in values.iter().enumerate() {
            let name = if index == 0 { name } else { "" };
            self.body.push(tag);
            self.body.extend((name.len() as u16).to_be_bytes());
            self.body.extend(name.as_bytes());
            self.body.extend((value.len() as u16).to_be_bytes());
            self.body.extend(*value);
        }
        self
    }

    pub fn uri(&mut self, name: &str, uri: &str) -> &mut Self {
        self.attribute(URI, name, &[uri.as_bytes()])
    }

    pub fn name(&mut self, name: &str, value: &str) -> &mut Self {
        self.attribute(NAME, name, &[value.as_bytes()])
    }

    pub fn integer(&mut self, name: &str, value: i32) -> &mut Self {
        self.attribute(INTEGER, name, &[&value.to_be_bytes()])
    }

    pub fn ranges(&mut self, name: &str, ranges: &[(i32, i32)]) -> &mut Self {
        let values: Vec<[u8; 8]> = ranges
            .iter()
            .map(|(lower, upper)| {
                let mut value = [0; 8];
                value[..4].copy_from_slice(&lower.to_be_bytes());
                value[4..].copy_from_slice(&upper.to_be_bytes());
                value
            })
            .collect();
        let values: Vec<&[u8]> = values.iter().map(<[u8; 8]>::as_slice).collect();
        self.attribute(RANGE, name, &values)
    }

    pub fn mime_type(&mut self, name: &str, value: &str) -> &mut Self {
        self.attribute(MIME_TYPE, name, &[value.as_bytes()])
    }

    pub fn keywords(&mut self, name: &str, values: &[&str]) -> &mut Self {
        let values: Vec<&[u8]> = values.iter().map(|value| value.as_bytes()).collect();
        self.attribute(KEYWORD, name, &values)
    }

    pub fn finish(mut self) -> Vec<u8> {
        self.body.push(END);
        self.body
    }
}

#[derive(Default)]
pub struct Attributes(Vec<(String, Value)>);

impl Attributes {
    fn find<'a, T>(&'a self, name: &str, pick: impl Fn(&'a Value) -> Option<T>) -> Option<T> {
        self.0
            .iter()
            .filter(|(key, _)| key == name)
            .find_map(|(_, value)| pick(value))
    }

    pub fn integer(&self, name: &str) -> Option<i32> {
        self.find(name, |value| match value {
            Value::Integer(integer) => Some(*integer),
            _ => None,
        })
    }

    pub fn range(&self, name: &str) -> Option<(i32, i32)> {
        self.find(name, |value| match value {
            Value::Range(lower, upper) => Some((*lower, *upper)),
            _ => None,
        })
    }

    pub fn text(&self, name: &str) -> Option<&str> {
        self.find(name, |value| match value {
            Value::Text(text) => Some(text.as_str()),
            _ => None,
        })
    }

    pub fn texts(&self, name: &str) -> Vec<String> {
        self.0
            .iter()
            .filter_map(|(key, value)| match value {
                Value::Text(text) if key == name => Some(text.clone()),
                _ => None,
            })
            .collect()
    }
}

pub struct Response {
    pub status: u16,
    groups: Vec<(u8, Attributes)>,
}

impl Response {
    pub fn parse(body: &[u8]) -> io::Result<Self> {
        let invalid = || {
            io::Error::new(
                io::ErrorKind::InvalidData,
                "The printing service sent a broken reply",
            )
        };
        let status = u16::from_be_bytes(
            body.get(2..4)
                .ok_or_else(invalid)?
                .try_into()
                .map_err(|_| invalid())?,
        );
        let mut groups: Vec<(u8, Attributes)> = Vec::new();
        let mut position = 8;
        let mut name = String::new();
        while let Some(&tag) = body.get(position) {
            position += 1;
            if tag == END {
                break;
            }
            if tag < 0x10 {
                groups.push((tag, Attributes::default()));
                continue;
            }
            let field = |at: usize| -> io::Result<(&[u8], usize)> {
                let length = usize::from(u16::from_be_bytes(
                    body.get(at..at + 2)
                        .ok_or_else(invalid)?
                        .try_into()
                        .map_err(|_| invalid())?,
                ));
                Ok((
                    body.get(at + 2..at + 2 + length).ok_or_else(invalid)?,
                    at + 2 + length,
                ))
            };
            let (key, next) = field(position)?;
            let (value, next) = field(next)?;
            position = next;
            if !key.is_empty() {
                name = String::from_utf8_lossy(key).into_owned();
            }
            let integer = |bytes: &[u8]| -> io::Result<i32> {
                Ok(i32::from_be_bytes(bytes.try_into().map_err(|_| invalid())?))
            };
            let value = match tag {
                INTEGER | ENUM => Value::Integer(integer(value)?),
                BOOLEAN => Value::Integer(i32::from(value.first().copied().unwrap_or(0))),
                RANGE if value.len() == 8 => {
                    Value::Range(integer(&value[..4])?, integer(&value[4..])?)
                }
                _ => Value::Text(String::from_utf8_lossy(value).into_owned()),
            };
            let (_, attributes) = groups.last_mut().ok_or_else(invalid)?;
            attributes.0.push((name.clone(), value));
        }
        Ok(Self { status, groups })
    }

    pub fn successful(&self) -> bool {
        self.status < 0x0100
    }

    pub fn integer(&self, name: &str) -> Option<i32> {
        self.groups
            .iter()
            .find_map(|(_, attributes)| attributes.integer(name))
    }

    pub fn text(&self, name: &str) -> Option<&str> {
        self.groups
            .iter()
            .find_map(|(_, attributes)| attributes.text(name))
    }

    pub fn into_printers(self) -> Vec<Attributes> {
        self.groups
            .into_iter()
            .filter(|(tag, _)| *tag == PRINTER)
            .map(|(_, attributes)| attributes)
            .collect()
    }
}
