use std::fs;
use std::io::ErrorKind;
use std::path::Path;
use std::time::Duration;

use anyhow::Context;

const FILE: &str = "/var/lib/luft-sleep/sleep.conf";
const KEY: &str = "power-off-after";

pub fn power_off_after() -> Option<Duration> {
    read(Path::new(FILE))
}

pub fn set_power_off_after(after: Option<Duration>) -> anyhow::Result<()> {
    write(Path::new(FILE), after).context("The setting couldn't be saved. Try again.")
}

fn read(file: &Path) -> Option<Duration> {
    match fs::read_to_string(file) {
        Ok(text) => parse(&text),
        Err(error) => {
            if error.kind() != ErrorKind::NotFound {
                eprintln!("Couldn't read {}: {error}", file.display());
            }
            None
        }
    }
}

fn parse(text: &str) -> Option<Duration> {
    text.lines()
        .filter_map(|line| line.split_once('='))
        .find(|(key, _)| key.trim() == KEY)
        .and_then(|(_, value)| value.trim().parse::<u64>().ok())
        .filter(|seconds| *seconds > 0)
        .map(Duration::from_secs)
}

fn write(file: &Path, after: Option<Duration>) -> std::io::Result<()> {
    let seconds = after.map_or(0, |after| after.as_secs());
    if let Some(folder) = file.parent() {
        fs::create_dir_all(folder)?;
    }
    let staged = file.with_extension("conf.new");
    fs::write(&staged, format!("{KEY} = {seconds}\n"))?;
    fs::rename(staged, file)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn never_unless_chosen() {
        let folder = tempfile::tempdir().unwrap();
        let file = folder.path().join("luft/sleep.conf");
        assert_eq!(read(&file), None);
        write(&file, Some(Duration::from_secs(3 * 60 * 60))).unwrap();
        assert_eq!(read(&file), Some(Duration::from_secs(3 * 60 * 60)));
        write(&file, None).unwrap();
        assert_eq!(read(&file), None);
    }
}
