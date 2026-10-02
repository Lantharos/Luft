use base64::Engine;
use base64::engine::general_purpose::STANDARD_NO_PAD;

pub fn decode(name: &str) -> String {
    let mut decoded = String::with_capacity(name.len());
    let mut rest = name;
    while let Some(start) = rest.find('&') {
        decoded.push_str(&rest[..start]);
        let after = &rest[start + 1..];
        let Some(end) = after.find('-') else {
            decoded.push_str(&rest[start..]);
            return decoded;
        };
        let encoded = &after[..end];
        if encoded.is_empty() {
            decoded.push('&');
        } else {
            let bytes = STANDARD_NO_PAD
                .decode(encoded.replace(',', "/"))
                .unwrap_or_default();
            let units: Vec<u16> = bytes
                .as_chunks::<2>()
                .0
                .iter()
                .map(|pair| u16::from_be_bytes([pair[0], pair[1]]))
                .collect();
            decoded.push_str(&String::from_utf16_lossy(&units));
        }
        rest = &after[end + 1..];
    }
    decoded.push_str(rest);
    decoded
}
