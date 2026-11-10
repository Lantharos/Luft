const OPENABLE_SCHEMES: [&str; 6] = ["http", "https", "file", "mailto", "ftp", "sftp"];

pub fn open(uri: &str, token: Option<&str>) -> Result<(), String> {
    let (scheme, location) = uri
        .split_once(':')
        .map(|(scheme, location)| (scheme.to_ascii_lowercase(), location))
        .filter(|(scheme, _)| OPENABLE_SCHEMES.contains(&scheme.as_str()))
        .ok_or("This kind of link can't be opened")?;
    if scheme == "file" && !on_this_computer(location) {
        return Err("This file is on another computer".to_string());
    }
    luft_app::launch::open(uri, token).map_err(|error| error.to_string())
}

fn on_this_computer(location: &str) -> bool {
    let host = location
        .strip_prefix("//")
        .and_then(|rest| rest.split('/').next())
        .unwrap_or_default();
    host.is_empty()
        || host.eq_ignore_ascii_case("localhost")
        || host
            .as_bytes()
            .eq_ignore_ascii_case(rustix::system::uname().nodename().to_bytes())
}
