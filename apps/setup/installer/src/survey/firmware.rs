const PLATFORM_LANG: &str =
    "/sys/firmware/efi/efivars/PlatformLang-8be4df61-93ca-11d2-aa0d-00e098032b8c";
const ATTRIBUTES: usize = 4;

pub fn language() -> Option<String> {
    let bytes = std::fs::read(PLATFORM_LANG).ok()?;
    let text = bytes.get(ATTRIBUTES..)?;
    let end = text
        .iter()
        .position(|byte| *byte == 0)
        .unwrap_or(text.len());
    let language = std::str::from_utf8(&text[..end]).ok()?.trim();
    (!language.is_empty()).then(|| language.to_owned())
}
