use windows::Win32::System::Registry::{HKEY, RRF_RT_REG_SZ, RegGetValueW};
use windows::core::HSTRING;

pub fn text(units: &[u16]) -> String {
    let end = units
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(units.len());
    String::from_utf16_lossy(&units[..end])
}

pub fn string(root: HKEY, key: &str, value: &str) -> Option<String> {
    let mut buffer = vec![0u16; 1024];
    let mut size = (buffer.len() * 2) as u32;
    unsafe {
        RegGetValueW(
            root,
            &HSTRING::from(key),
            &HSTRING::from(value),
            RRF_RT_REG_SZ,
            None,
            Some(buffer.as_mut_ptr().cast()),
            Some(&mut size),
        )
    }
    .ok()
    .ok()?;
    Some(text(&buffer)).filter(|text| !text.is_empty())
}
