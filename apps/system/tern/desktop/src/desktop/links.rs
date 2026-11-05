const OPENABLE_SCHEMES: [&str; 6] = ["http", "https", "file", "mailto", "ftp", "sftp"];

pub fn open(uri: &str, token: Option<&str>) -> Result<(), String> {
    let scheme = uri
        .split_once(':')
        .map(|(scheme, _)| scheme.to_ascii_lowercase());
    if !scheme.is_some_and(|scheme| OPENABLE_SCHEMES.contains(&scheme.as_str())) {
        return Err("This kind of link can't be opened".to_string());
    }
    luft_app::launch::open(uri, token).map_err(|error| error.to_string())
}
