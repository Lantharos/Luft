use alloc::string::String;
use alloc::vec::Vec;

pub const LUFT_VARIABLES: &str = "b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e";
pub const LOADER_VARIABLES: &str = "4a67b082-0a4c-41cf-b6c7-440b29bb8c4f";

pub fn u16_at(data: &[u8], at: usize) -> Option<u16> {
    Some(u16::from_le_bytes(*data.get(at..)?.first_chunk()?))
}

pub fn u32_at(data: &[u8], at: usize) -> Option<u32> {
    Some(u32::from_le_bytes(*data.get(at..)?.first_chunk()?))
}

pub fn utf16(text: &str) -> Vec<u8> {
    text.encode_utf16()
        .chain([0])
        .flat_map(u16::to_le_bytes)
        .collect()
}

pub fn text(utf16: &[u8]) -> String {
    let units = utf16
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0);
    char::decode_utf16(units)
        .map(|unit| unit.unwrap_or(char::REPLACEMENT_CHARACTER))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn text_survives_the_round_trip_and_stops_at_its_end() {
        let mut encoded = utf16("luft-ë.conf");
        encoded.extend(utf16("ignored"));
        assert_eq!(text(&encoded), "luft-ë.conf");
    }
}
