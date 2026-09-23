use std::path::{Path, PathBuf};

pub fn paths(args: &[String]) -> Vec<String> {
    let cwd = std::env::current_dir().ok();
    args.iter()
        .skip(1)
        .filter_map(|arg| path_arg(arg, cwd.as_deref()))
        .collect()
}

fn path_arg(arg: &str, cwd: Option<&Path>) -> Option<String> {
    let trimmed = arg.trim();
    if trimmed.is_empty() || trimmed.starts_with("--") {
        return None;
    }
    let path = if let Some(file_path) = file_url_path(trimmed) {
        PathBuf::from(file_path)
    } else {
        PathBuf::from(percent_decode(trimmed))
    };
    let absolute = if path.is_absolute() {
        path
    } else {
        cwd.unwrap_or_else(|| Path::new("/")).join(path)
    };
    Some(
        absolute
            .canonicalize()
            .unwrap_or(absolute)
            .display()
            .to_string(),
    )
}

fn file_url_path(value: &str) -> Option<String> {
    let rest = value.strip_prefix("file://")?;
    let path = rest.strip_prefix("localhost").unwrap_or(rest);
    path.starts_with('/').then(|| percent_decode(path))
}

fn percent_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            if let (Some(high), Some(low)) = (hex(bytes[index + 1]), hex(bytes[index + 2])) {
                output.push((high << 4) | low);
                index += 3;
                continue;
            }
        }
        output.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&output).into_owned()
}

fn hex(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}
