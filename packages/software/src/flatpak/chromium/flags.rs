use std::fs;
use std::path::{Path, PathBuf};

use crate::chromium::{self, ENABLE_FEATURES, FINGER_SCROLLING};

const COBALT_FEATURE: &str = "features+=";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Style {
    Cobalt,
    Arguments,
}

#[derive(PartialEq, Eq, Debug)]
pub struct FlagsFile {
    pub path: PathBuf,
    pub style: Style,
}

impl FlagsFile {
    pub fn enable_finger_scrolling(&self, config: &Path) -> std::io::Result<()> {
        let path = config.join(&self.path);
        let text = fs::read_to_string(&path).unwrap_or_default();
        let Some(text) = self.style.with_finger_scrolling(&text) else {
            return Ok(());
        };
        if let Some(folder) = path.parent() {
            fs::create_dir_all(folder)?;
        }
        fs::write(path, text)
    }
}

impl Style {
    fn with_finger_scrolling(self, text: &str) -> Option<String> {
        if chromium::mentions_finger_scrolling(text) {
            return None;
        }
        let mut lines: Vec<String> = text.lines().map(str::to_owned).collect();
        match self {
            Self::Cobalt => lines.push(format!("{COBALT_FEATURE}{FINGER_SCROLLING}")),
            Self::Arguments => match lines
                .iter_mut()
                .rfind(|line| line.trim_start().starts_with(ENABLE_FEATURES))
            {
                Some(features) => {
                    features.truncate(features.trim_end().len());
                    features.push(',');
                    features.push_str(FINGER_SCROLLING);
                }
                None => lines.push(format!("{ENABLE_FEATURES}{FINGER_SCROLLING}")),
            },
        }
        Some(lines.join("\n") + "\n")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cobalt_adds_the_feature_beside_the_persons_flags() {
        assert_eq!(
            Style::Cobalt
                .with_finger_scrolling("--ozone-platform=wayland\nfeatures+=VaapiVideoDecoder"),
            Some(format!(
                "--ozone-platform=wayland\nfeatures+=VaapiVideoDecoder\nfeatures+={FINGER_SCROLLING}\n"
            ))
        );
    }

    #[test]
    fn arguments_join_the_last_feature_list() {
        assert_eq!(
            Style::Arguments.with_finger_scrolling(
                "# screen sharing\n--enable-features=WebRTCPipeWireCapturer \n--ozone-platform-hint=auto"
            ),
            Some(format!(
                "# screen sharing\n--enable-features=WebRTCPipeWireCapturer,{FINGER_SCROLLING}\n--ozone-platform-hint=auto\n"
            ))
        );
    }

    #[test]
    fn arguments_start_a_feature_list() {
        assert_eq!(
            Style::Arguments.with_finger_scrolling(""),
            Some(format!("{ENABLE_FEATURES}{FINGER_SCROLLING}\n"))
        );
    }

    #[test]
    fn a_choice_about_the_feature_stays() {
        let chosen = "--disable-features=WaylandUnscaledTouchpadScrolling\n";
        assert_eq!(Style::Arguments.with_finger_scrolling(chosen), None);
        assert_eq!(Style::Cobalt.with_finger_scrolling(chosen), None);
    }
}
