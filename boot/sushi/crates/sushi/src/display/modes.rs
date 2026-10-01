use std::path::Path;

use drm::control::{Mode, ModeFlags, ModeTypeFlags};

#[derive(Debug, Clone, PartialEq)]
struct Wanted {
    connector: String,
    width: u16,
    height: u16,
    rate: f64,
}

#[derive(Debug, Default)]
pub struct ModeHints {
    arrangements: Vec<Vec<Wanted>>,
}

fn tag<'a>(text: &'a str, name: &str) -> Option<&'a str> {
    let open = format!("<{name}>");
    let start = text.find(&open)? + open.len();
    let end = text[start..].find(&format!("</{name}>"))? + start;
    Some(text[start..end].trim())
}

fn blocks<'a>(text: &'a str, name: &str) -> Vec<&'a str> {
    let open = format!("<{name}>");
    let close = format!("</{name}>");
    text.split(open.as_str())
        .skip(1)
        .filter_map(|rest| rest.split(close.as_str()).next())
        .collect()
}

impl ModeHints {
    pub fn load(path: &Path) -> Self {
        std::fs::read_to_string(path)
            .map(|text| Self::parse(&text))
            .unwrap_or_default()
    }

    pub fn is_empty(&self) -> bool {
        self.arrangements.is_empty()
    }

    pub fn only_size(&self) -> Option<(u32, u32)> {
        let mut sizes = self
            .arrangements
            .iter()
            .flatten()
            .map(|wanted| (u32::from(wanted.width), u32::from(wanted.height)));
        let first = sizes.next()?;
        sizes.all(|size| size == first).then_some(first)
    }

    fn parse(text: &str) -> Self {
        let arrangements = blocks(text, "configuration")
            .into_iter()
            .map(|configuration| {
                blocks(configuration, "monitor")
                    .into_iter()
                    .filter_map(|monitor| {
                        let mode = tag(monitor, "mode")?;
                        Some(Wanted {
                            connector: tag(monitor, "connector")?.to_owned(),
                            width: tag(mode, "width")?.parse().ok()?,
                            height: tag(mode, "height")?.parse().ok()?,
                            rate: tag(mode, "rate")?.parse().ok()?,
                        })
                    })
                    .collect::<Vec<_>>()
            })
            .filter(|arrangement| !arrangement.is_empty())
            .collect();
        Self { arrangements }
    }

    fn wanted(&self, connector: &str, connected: &[String]) -> Option<&Wanted> {
        let matches_exactly = |arrangement: &&Vec<Wanted>| {
            arrangement.len() == connected.len()
                && arrangement
                    .iter()
                    .all(|wanted| connected.contains(&wanted.connector))
        };
        let arrangement = self.arrangements.iter().find(matches_exactly).or_else(|| {
            self.arrangements.iter().find(|arrangement| {
                arrangement
                    .iter()
                    .any(|wanted| wanted.connector == connector)
            })
        })?;
        arrangement
            .iter()
            .find(|wanted| wanted.connector == connector)
    }

    pub fn choose(&self, connector: &str, connected: &[String], modes: &[Mode]) -> Option<Mode> {
        let preferred = modes
            .iter()
            .find(|mode| mode.mode_type().contains(ModeTypeFlags::PREFERRED))
            .or_else(|| modes.first())
            .copied();
        let Some(wanted) = self.wanted(connector, connected) else {
            return preferred;
        };
        modes
            .iter()
            .filter(|mode| mode.size() == (wanted.width, wanted.height))
            .min_by(|a, b| {
                (refresh_rate(a) - wanted.rate)
                    .abs()
                    .total_cmp(&(refresh_rate(b) - wanted.rate).abs())
            })
            .copied()
            .or(preferred)
    }
}

pub fn refresh_rate(mode: &Mode) -> f64 {
    let (_, _, htotal) = mode.hsync();
    let (_, _, vtotal) = mode.vsync();
    let mut rate = mode.clock() as f64 * 1000.0 / (htotal as f64 * vtotal as f64);
    if mode.flags().contains(ModeFlags::INTERLACE) {
        rate *= 2.0;
    }
    if mode.flags().contains(ModeFlags::DBLSCAN) {
        rate /= 2.0;
    }
    if mode.vscan() > 1 {
        rate /= mode.vscan() as f64;
    }
    rate
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAVED: &str = r#"<monitors version="2">
  <configuration>
    <layoutmode>logical</layoutmode>
    <logicalmonitor><x>0</x><y>0</y><scale>1</scale><primary>yes</primary>
      <monitor>
        <monitorspec><connector>DP-1</connector><vendor>HKC</vendor><product>34GH949BW3</product><serial>1</serial></monitorspec>
        <mode><width>3440</width><height>1440</height><rate>165.001</rate></mode>
      </monitor>
    </logicalmonitor>
  </configuration>
  <configuration>
    <logicalmonitor><x>0</x><y>0</y><scale>1</scale><primary>yes</primary>
      <monitor>
        <monitorspec><connector>DP-1</connector><vendor>HKC</vendor><product>34GH949BW3</product><serial>1</serial></monitorspec>
        <mode><width>2560</width><height>1080</height><rate>60</rate></mode>
      </monitor>
    </logicalmonitor>
    <logicalmonitor><x>2560</x><y>0</y><scale>1</scale>
      <monitor>
        <monitorspec><connector>HDMI-A-1</connector><vendor>X</vendor><product>Y</product><serial>2</serial></monitorspec>
        <mode><width>1920</width><height>1080</height><rate>60</rate></mode>
      </monitor>
    </logicalmonitor>
  </configuration>
</monitors>"#;

    #[test]
    fn picks_the_arrangement_matching_the_connected_monitors() {
        let hints = ModeHints::parse(SAVED);
        let alone = hints.wanted("DP-1", &["DP-1".into()]).unwrap();
        assert_eq!(
            (alone.width, alone.height, alone.rate),
            (3440, 1440, 165.001)
        );
        let paired = hints
            .wanted("DP-1", &["DP-1".into(), "HDMI-A-1".into()])
            .unwrap();
        assert_eq!((paired.width, paired.height), (2560, 1080));
    }

    #[test]
    fn unknown_monitors_keep_their_preferred_mode() {
        let hints = ModeHints::parse(SAVED);
        assert!(hints.wanted("eDP-1", &["eDP-1".into()]).is_none());
    }
}
