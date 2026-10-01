use std::path::{Path, PathBuf};

pub const CONFIG: &str = "/etc/sushi/sushi.conf";

#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct Config {
    pub monitors: Option<PathBuf>,
}

impl Config {
    pub fn load() -> Self {
        std::fs::read_to_string(CONFIG)
            .map(|text| Self::parse(&text))
            .unwrap_or_default()
    }

    fn parse(text: &str) -> Self {
        let mut config = Self::default();
        for line in text
            .lines()
            .map(str::trim)
            .filter(|line| !line.starts_with('#'))
        {
            let Some((key, value)) = line.split_once('=') else {
                continue;
            };
            if key.trim() == "monitors" {
                config.monitors = Some(Path::new(value.trim()).to_owned());
            }
        }
        config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_monitor_arrangement_path() {
        let config =
            Config::parse("# Sushi\nmonitors = /var/lib/kestrel-greeter/display/monitors.xml\n");
        assert_eq!(
            config.monitors.as_deref(),
            Some(Path::new("/var/lib/kestrel-greeter/display/monitors.xml"))
        );
    }
}
