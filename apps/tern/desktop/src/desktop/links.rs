const OPENABLE_SCHEMES: [&str; 6] = ["http", "https", "file", "mailto", "ftp", "sftp"];

pub fn open(uri: &str) -> Result<(), String> {
    let scheme = uri
        .split_once(':')
        .map(|(scheme, _)| scheme.to_ascii_lowercase());
    if !scheme.is_some_and(|scheme| OPENABLE_SCHEMES.contains(&scheme.as_str())) {
        return Err("This kind of link can't be opened".to_string());
    }
    gio::AppInfo::launch_default_for_uri(uri, None::<&gio::AppLaunchContext>)
        .map_err(|error| error.to_string())
}
