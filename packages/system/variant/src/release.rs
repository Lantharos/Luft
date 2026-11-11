const FACTS: &str = "/usr/share/luft/release";

/// What the image's build wrote about where Luft is: whether it's still early, which the
/// owner decides, and whether a stable version was out when the image was built.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct ReleaseFacts {
    pub early: bool,
    pub stable_released: bool,
}

impl ReleaseFacts {
    pub fn of_this_system() -> Self {
        Self::parse(&std::fs::read_to_string(FACTS).unwrap_or_default())
    }

    fn parse(text: &str) -> Self {
        let on = |key: &str| {
            text.lines()
                .any(|line| line.trim().split_once('=') == Some((key, "true")))
        };
        Self {
            early: on("early"),
            stable_released: on("stable-released"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::ReleaseFacts;

    #[test]
    fn reads_what_the_image_build_wrote() {
        assert_eq!(
            ReleaseFacts::parse("early=true\nstable-released=false\n"),
            ReleaseFacts {
                early: true,
                stable_released: false
            }
        );
        assert_eq!(ReleaseFacts::parse(""), ReleaseFacts::default());
    }
}
