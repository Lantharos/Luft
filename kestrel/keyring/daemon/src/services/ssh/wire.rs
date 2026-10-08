pub struct Reader<'a> {
    rest: &'a [u8],
}

impl<'a> Reader<'a> {
    pub fn new(bytes: &'a [u8]) -> Self {
        Self { rest: bytes }
    }

    pub fn u8(&mut self) -> Option<u8> {
        let (&first, rest) = self.rest.split_first()?;
        self.rest = rest;
        Some(first)
    }

    pub fn u32(&mut self) -> Option<u32> {
        let (bytes, rest) = self.rest.split_first_chunk::<4>()?;
        self.rest = rest;
        Some(u32::from_be_bytes(*bytes))
    }

    pub fn string(&mut self) -> Option<&'a [u8]> {
        let length = self.u32()? as usize;
        let (taken, rest) = self.rest.split_at_checked(length)?;
        self.rest = rest;
        Some(taken)
    }

    pub fn mpint(&mut self) -> Option<&'a [u8]> {
        let value = self.string()?;
        Some(value.strip_prefix(&[0]).unwrap_or(value))
    }

    pub fn is_empty(&self) -> bool {
        self.rest.is_empty()
    }
}

#[derive(Default)]
pub struct Writer {
    pub bytes: Vec<u8>,
}

impl Writer {
    pub fn u8(mut self, value: u8) -> Self {
        self.bytes.push(value);
        self
    }

    pub fn u32(mut self, value: u32) -> Self {
        self.bytes.extend_from_slice(&value.to_be_bytes());
        self
    }

    pub fn string(self, value: &[u8]) -> Self {
        let mut written = self.u32(u32::try_from(value.len()).expect("SSH strings are small"));
        written.bytes.extend_from_slice(value);
        written
    }

    pub fn mpint(self, value: &[u8]) -> Self {
        let trimmed = &value[value.iter().take_while(|byte| **byte == 0).count()..];
        if trimmed.first().is_some_and(|byte| byte & 0x80 != 0) {
            let mut padded = Vec::with_capacity(trimmed.len() + 1);
            padded.push(0);
            padded.extend_from_slice(trimmed);
            self.string(&padded)
        } else {
            self.string(trimmed)
        }
    }
}
