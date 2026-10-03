use std::collections::HashMap;
use std::io::{self, BufRead, Write};

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Connection {
    pub data: HashMap<String, String>,
    pub secrets: HashMap<String, String>,
}

#[derive(Serialize)]
pub struct Choice {
    pub name: String,
    pub label: String,
}

#[derive(Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Text,
    Password,
    Choice,
}

#[derive(Serialize)]
pub struct Field {
    pub name: String,
    pub label: String,
    pub kind: Kind,
    pub value: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub choices: Vec<Choice>,
}

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Message<'a> {
    Form {
        message: String,
        error: String,
        fields: &'a [Field],
    },
    Certificate {
        host: &'a str,
        reason: &'a str,
        fingerprint: &'a str,
    },
    Browse {
        uri: &'a str,
    },
    Done {
        secrets: &'a HashMap<String, String>,
    },
    Failed {
        message: &'a str,
    },
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum Answer {
    Values { values: HashMap<String, String> },
    Accept { accept: bool },
}

pub struct Kestrel<R, W> {
    input: R,
    output: W,
}

impl<R: BufRead, W: Write> Kestrel<R, W> {
    pub fn new(input: R, output: W) -> Self {
        Self { input, output }
    }

    pub fn send(&mut self, message: &Message) -> io::Result<()> {
        serde_json::to_writer(&mut self.output, message)?;
        self.output.write_all(b"\n")?;
        self.output.flush()
    }

    fn receive<T: for<'d> Deserialize<'d>>(&mut self) -> Option<T> {
        let mut line = String::new();
        self.input.read_line(&mut line).ok()?;
        serde_json::from_str(&line).ok()
    }

    pub fn connection(&mut self) -> Option<Connection> {
        self.receive()
    }

    pub fn ask(&mut self, message: &Message) -> Option<Answer> {
        self.send(message).ok()?;
        self.receive()
    }
}
