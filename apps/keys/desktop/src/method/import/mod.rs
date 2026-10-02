mod mim;
mod sexp;
mod table;

use std::fs;
use std::path::Path;

use super::definition::Method;

pub fn read(path: &Path) -> Result<Method, String> {
    let source = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let fallback = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned())
        .unwrap_or_default();
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("mim") => mim::parse(&source, &fallback),
        Some("toml") => Method::parse(&source),
        _ if source.contains("BEGIN_TABLE") => table::parse(&source, &fallback),
        _ => Err(
            "Keys can open its own input methods, m17n .mim files and IBus table sources".into(),
        ),
    }
}
