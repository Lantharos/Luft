mod parse;
mod scancodes;
mod write;

pub use parse::parse;
pub use write::{encode, write};

pub fn decode(bytes: &[u8]) -> String {
    match bytes {
        [0xff, 0xfe, rest @ ..] => {
            let units: Vec<u16> = rest
                .as_chunks::<2>()
                .0
                .iter()
                .map(|pair| u16::from_le_bytes(*pair))
                .collect();
            String::from_utf16_lossy(&units)
        }
        _ => String::from_utf8_lossy(bytes).into_owned(),
    }
}
