#[derive(Debug, Clone)]
pub enum Value {
    Atom(String),
    Bytes(Vec<u8>),
    Nil,
    List(Vec<Value>),
}

impl Value {
    pub fn atom(&self) -> Option<&str> {
        match self {
            Value::Atom(atom) => Some(atom),
            _ => None,
        }
    }

    pub fn text(&self) -> Option<String> {
        match self {
            Value::Atom(atom) => Some(atom.clone()),
            Value::Bytes(bytes) => Some(String::from_utf8_lossy(bytes).into_owned()),
            _ => None,
        }
    }

    pub fn bytes(&self) -> Option<&[u8]> {
        match self {
            Value::Bytes(bytes) => Some(bytes),
            Value::Atom(atom) => Some(atom.as_bytes()),
            _ => None,
        }
    }

    pub fn number(&self) -> Option<u64> {
        self.atom()?.parse().ok()
    }

    pub fn list(&self) -> &[Value] {
        match self {
            Value::List(items) => items,
            _ => &[],
        }
    }
}

pub struct Parser<'a> {
    input: &'a [u8],
    position: usize,
}

impl<'a> Parser<'a> {
    pub fn new(input: &'a [u8]) -> Self {
        Self { input, position: 0 }
    }

    fn peek(&self) -> Option<u8> {
        self.input.get(self.position).copied()
    }

    fn skip_spaces(&mut self) {
        while self.peek() == Some(b' ') {
            self.position += 1;
        }
    }

    pub fn rest(&mut self) -> String {
        self.skip_spaces();
        let rest = &self.input[self.position..];
        self.position = self.input.len();
        String::from_utf8_lossy(rest).trim_end().to_owned()
    }

    pub fn code(&mut self) -> Option<String> {
        self.skip_spaces();
        if self.peek() != Some(b'[') {
            return None;
        }
        let start = self.position + 1;
        let end = start + self.input[start..].iter().position(|&byte| byte == b']')?;
        self.position = end + 1;
        Some(String::from_utf8_lossy(&self.input[start..end]).into_owned())
    }

    pub fn values(&mut self) -> Vec<Value> {
        let mut values = Vec::new();
        while let Some(value) = self.value() {
            values.push(value);
        }
        values
    }

    pub fn value(&mut self) -> Option<Value> {
        self.skip_spaces();
        match self.peek()? {
            b'\r' | b'\n' | b')' => None,
            b'(' => {
                self.position += 1;
                let items = self.values();
                if self.peek() == Some(b')') {
                    self.position += 1;
                }
                Some(Value::List(items))
            }
            b'"' => Some(Value::Bytes(self.quoted())),
            b'{' => self.literal().map(Value::Bytes),
            _ => {
                let atom = self.atom();
                Some(if atom.eq_ignore_ascii_case("NIL") {
                    Value::Nil
                } else {
                    Value::Atom(atom)
                })
            }
        }
    }

    fn quoted(&mut self) -> Vec<u8> {
        self.position += 1;
        let mut bytes = Vec::new();
        while let Some(byte) = self.peek() {
            self.position += 1;
            match byte {
                b'\\' => {
                    if let Some(escaped) = self.peek() {
                        bytes.push(escaped);
                        self.position += 1;
                    }
                }
                b'"' => break,
                _ => bytes.push(byte),
            }
        }
        bytes
    }

    fn literal(&mut self) -> Option<Vec<u8>> {
        let close = self.position
            + self.input[self.position..]
                .iter()
                .position(|&byte| byte == b'}')?;
        let length: usize = std::str::from_utf8(&self.input[self.position + 1..close])
            .ok()?
            .trim_end_matches('+')
            .parse()
            .ok()?;
        let start = close + 3;
        let end = (start + length).min(self.input.len());
        self.position = end;
        Some(self.input.get(start..end)?.to_vec())
    }

    fn atom(&mut self) -> String {
        let start = self.position;
        let mut depth = 0usize;
        while let Some(byte) = self.peek() {
            match byte {
                b'[' => depth += 1,
                b']' => depth = depth.saturating_sub(1),
                b' ' | b'(' | b')' | b'\r' | b'\n' if depth == 0 => break,
                _ => {}
            }
            self.position += 1;
        }
        String::from_utf8_lossy(&self.input[start..self.position]).into_owned()
    }
}

pub fn quote(text: &str) -> String {
    let mut quoted = String::with_capacity(text.len() + 2);
    quoted.push('"');
    for character in text.chars() {
        if matches!(character, '"' | '\\') {
            quoted.push('\\');
        }
        quoted.push(character);
    }
    quoted.push('"');
    quoted
}

pub fn uid_set(uids: &[u32]) -> String {
    let mut sorted = uids.to_vec();
    sorted.sort_unstable();
    sorted.dedup();
    let mut ranges: Vec<String> = Vec::new();
    let mut index = 0;
    while index < sorted.len() {
        let start = sorted[index];
        let mut end = start;
        while index + 1 < sorted.len() && sorted[index + 1] == end + 1 {
            index += 1;
            end = sorted[index];
        }
        ranges.push(if start == end {
            start.to_string()
        } else {
            format!("{start}:{end}")
        });
        index += 1;
    }
    ranges.join(",")
}

pub fn parse_uid_set(set: &str) -> Vec<u32> {
    set.split(',')
        .flat_map(|range| match range.split_once(':') {
            Some((start, end)) => {
                let (Ok(start), Ok(end)) = (start.parse::<u32>(), end.parse::<u32>()) else {
                    return Vec::new();
                };
                (start.min(end)..=start.max(end)).collect()
            }
            None => range.parse().into_iter().collect(),
        })
        .collect()
}
