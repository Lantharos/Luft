use std::io;

const VERSION: [u8; 2] = [2, 0];
const OPERATION: u8 = 0x01;
const END: u8 = 0x03;
pub const SUBSCRIPTION: u8 = 0x06;
const INTEGER: u8 = 0x21;
const BOOLEAN: u8 = 0x22;
const ENUM: u8 = 0x23;
const NAME: u8 = 0x42;
const KEYWORD: u8 = 0x44;
const URI: u8 = 0x45;
const CHARSET: u8 = 0x47;
const LANGUAGE: u8 = 0x48;

#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Integer(i32),
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

    pub fn keywords(&mut self, name: &str, values: &[&str]) -> &mut Self {
        let values: Vec<&[u8]> = values.iter().map(|value| value.as_bytes()).collect();
        self.attribute(KEYWORD, name, &values)
    }

    pub fn finish(mut self) -> Vec<u8> {
        self.body.push(END);
        self.body
    }
}

pub struct Response {
    pub status: u16,
    pub attributes: Vec<(String, Value)>,
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
        let mut attributes = Vec::new();
        let mut position = 8;
        let mut name = String::new();
        while let Some(&tag) = body.get(position) {
            position += 1;
            if tag == END {
                break;
            }
            if tag < 0x10 {
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
            let value = match tag {
                INTEGER | ENUM => {
                    Value::Integer(i32::from_be_bytes(value.try_into().map_err(|_| invalid())?))
                }
                BOOLEAN => Value::Integer(i32::from(value.first().copied().unwrap_or(0))),
                _ => Value::Text(String::from_utf8_lossy(value).into_owned()),
            };
            attributes.push((name.clone(), value));
        }
        Ok(Self { status, attributes })
    }

    pub fn successful(&self) -> bool {
        self.status < 0x0100
    }

    pub fn integer(&self, name: &str) -> Option<i32> {
        self.attributes.iter().find_map(|(key, value)| match value {
            Value::Integer(integer) if key == name => Some(*integer),
            _ => None,
        })
    }

    pub fn text(&self, name: &str) -> Option<&str> {
        self.attributes.iter().find_map(|(key, value)| match value {
            Value::Text(text) if key == name => Some(text.as_str()),
            _ => None,
        })
    }
}
