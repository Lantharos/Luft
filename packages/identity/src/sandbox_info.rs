//! The app ID in a sandbox's `.flatpak-info`, read the way GLib's key files
//! are, which is how Flatpak, the desktop portal and Kestrel's compositor
//! read it. A file GLib would refuse names no app.

const APPLICATION: &[u8] = b"Application";
const NAME: &[u8] = b"name";

enum Line<'a> {
    Blank,
    Group(&'a [u8]),
    Entry(&'a [u8], &'a [u8]),
}

fn is_group_name(name: &[u8]) -> bool {
    !name.is_empty()
        && name
            .iter()
            .all(|&byte| byte != b'[' && byte != b']' && !byte.is_ascii_control())
}

fn is_key(key: &[u8]) -> bool {
    let base = key
        .iter()
        .position(|&byte| byte == b'[' || byte == b']')
        .unwrap_or(key.len());
    if base == 0 {
        return false;
    }
    match &key[base..] {
        [] => true,
        [b'[', locale @ .., b']'] => locale.iter().all(|&byte| {
            byte.is_ascii_alphanumeric() || b"-_.@".contains(&byte) || !byte.is_ascii()
        }),
        _ => false,
    }
}

fn parse(line: &[u8]) -> Option<Line<'_>> {
    let line = line.strip_suffix(b"\r").unwrap_or(line).trim_ascii_start();
    if line.is_empty() || line[0] == b'#' {
        return Some(Line::Blank);
    }
    if let Some(group) = line.strip_prefix(b"[") {
        let end = group.iter().position(|&byte| byte == b']')?;
        let after = &group[end + 1..];
        let name = &group[..end];
        return (after.iter().all(|&byte| byte == b' ' || byte == b'\t') && is_group_name(name))
            .then_some(Line::Group(name));
    }
    let equals = line.iter().position(|&byte| byte == b'=')?;
    let key = line[..equals].trim_ascii_end();
    is_key(key).then(|| Line::Entry(key, line[equals + 1..].trim_ascii_start()))
}

fn unescape(value: &[u8]) -> Option<String> {
    let mut text = Vec::with_capacity(value.len());
    let mut bytes = value.iter();
    while let Some(&byte) = bytes.next() {
        text.push(if byte == b'\\' {
            match bytes.next()? {
                b's' => b' ',
                b'n' => b'\n',
                b't' => b'\t',
                b'r' => b'\r',
                b'\\' => b'\\',
                _ => return None,
            }
        } else {
            byte
        });
    }
    String::from_utf8(text).ok()
}

/// The app a sandbox's `.flatpak-info` names, if it is a key file that names
/// one.
pub fn app_id(info: &[u8]) -> Option<String> {
    let mut group = None;
    let mut name = None;
    for line in info.split(|&byte| byte == b'\n') {
        match parse(line)? {
            Line::Blank => {}
            Line::Group(named) => group = Some(named),
            Line::Entry(key, value) => {
                if group? == APPLICATION && key == NAME {
                    name = Some(value);
                }
            }
        }
    }
    unescape(name?).filter(|name| !name.is_empty())
}
