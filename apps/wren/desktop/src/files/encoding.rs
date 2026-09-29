use std::fs::File;
use std::io::Read;

use chardetng::{EncodingDetector, Iso2022JpDetection, Utf8Detection};
use encoding_rs::Encoding;

use super::{Target, failed};

const SAMPLE: u64 = 1 << 20;
const UTF8_BOM: &[u8] = b"\xEF\xBB\xBF";

pub fn detect(Target { path }: Target) -> Result<String, String> {
    let mut sample = Vec::new();
    File::open(&path)
        .and_then(|file| file.take(SAMPLE).read_to_end(&mut sample))
        .map_err(failed)?;
    let mut detector = EncodingDetector::new(Iso2022JpDetection::Deny);
    detector.feed(&sample, true);
    Ok(detector
        .guess(None, Utf8Detection::Deny)
        .name()
        .to_lowercase())
}

pub fn encode(text: &str, label: &str, bom: bool) -> Result<Vec<u8>, String> {
    let units = |little: bool| {
        let marker: &[u8] = match (bom, little) {
            (false, _) => &[],
            (true, true) => &[0xFF, 0xFE],
            (true, false) => &[0xFE, 0xFF],
        };
        let mut bytes = marker.to_vec();
        bytes.reserve(text.len() * 2);
        for unit in text.encode_utf16() {
            bytes.extend(if little {
                unit.to_le_bytes()
            } else {
                unit.to_be_bytes()
            });
        }
        bytes
    };
    match label {
        "utf-16le" => Ok(units(true)),
        "utf-16be" => Ok(units(false)),
        "utf-8" => Ok([if bom { UTF8_BOM } else { &[] }, text.as_bytes()].concat()),
        _ => {
            let encoding = Encoding::for_label(label.as_bytes())
                .ok_or_else(|| format!("Unknown encoding {label}"))?;
            let (bytes, _, unmappable) = encoding.encode(text);
            if unmappable {
                return Err(format!(
                    "Some characters can't be saved as {}. Save with UTF-8 instead.",
                    encoding.name()
                ));
            }
            Ok(bytes.into_owned())
        }
    }
}
