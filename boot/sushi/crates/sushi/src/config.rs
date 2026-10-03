use std::path::{Path, PathBuf};
use std::time::Duration;

pub const CONFIG: &str = "/etc/sushi/sushi.conf";
const MONITOR_RESYNC: Duration = Duration::from_millis(1000);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Config {
    pub monitors: Option<PathBuf>,
    pub monitor_resync: Duration,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            monitors: None,
            monitor_resync: MONITOR_RESYNC,
        }
    }
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
            match key.trim() {
                "monitors" => config.monitors = Some(Path::new(value.trim()).to_owned()),
                "monitor-resync" => {
                    if let Ok(seconds) = value.trim().parse::<f32>()
                        && (0.0..=10.0).contains(&seconds)
                    {
                        config.monitor_resync = Duration::from_secs_f32(seconds);
                    }
                }
                _ => {}
            }
        }
        config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_monitor_arrangement_and_resync_time() {
        let config = Config::parse(
            "# Sushi\nmonitors = /var/lib/kestrel-greeter/display/monitors.xml\nmonitor-resync = 1.5\n",
        );
        assert_eq!(
            config.monitors.as_deref(),
            Some(Path::new("/var/lib/kestrel-greeter/display/monitors.xml"))
        );
        assert_eq!(config.monitor_resync, Duration::from_millis(1500));
    }
}
