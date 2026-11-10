pub fn name() -> Option<String> {
    ["/etc/os-release", "/usr/lib/os-release"]
        .iter()
        .find_map(|path| std::fs::read_to_string(path).ok())?
        .lines()
        .find_map(|line| line.strip_prefix("NAME="))
        .map(|name| name.trim_matches('"').to_owned())
        .filter(|name| !name.is_empty())
}
