/// A colour from Steam's stylesheets.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Color {
    pub red: f64,
    pub green: f64,
    pub blue: f64,
    pub alpha: f64,
}

/// What a colour is used for, which decides its place in Luft's palette.
#[derive(Clone, Copy, PartialEq)]
pub enum Use {
    Text,
    Surface,
    Shadow,
}

pub const ACCENT: &str = "--luft-accent";
pub const ON_ACCENT: &str = "--luft-on-accent";

const FIRST_BLUE_HUE: f64 = 185.0;
const LAST_BLUE_HUE: f64 = 255.0;
const GREY_SATURATION: f64 = 0.25;
const BLUE_ACCENT_LIGHTNESS: f64 = 0.33;
const PALE_LIGHTNESS: f64 = 0.75;
const PALE_SATURATION: f64 = 0.5;
const BLACK: f64 = 8.0;
const WHITE: f64 = 250.0;

struct Shade {
    hue: f64,
    saturation: f64,
    lightness: f64,
}

impl Color {
    fn shade(self) -> Shade {
        let (red, green, blue) = (self.red / 255.0, self.green / 255.0, self.blue / 255.0);
        let (high, low) = (red.max(green).max(blue), red.min(green).min(blue));
        let (spread, lightness) = (high - low, f64::midpoint(high, low));
        if spread == 0.0 {
            return Shade {
                hue: 0.0,
                saturation: 0.0,
                lightness,
            };
        }
        let sector = if high == red {
            (green - blue) / spread + if green < blue { 6.0 } else { 0.0 }
        } else if high == green {
            (blue - red) / spread + 2.0
        } else {
            (red - green) / spread + 4.0
        };
        Shade {
            hue: sector * 60.0,
            saturation: spread / (1.0 - (2.0 * lightness - 1.0).abs()),
            lightness,
        }
    }

    fn is_black(self) -> bool {
        self.red.max(self.green).max(self.blue) <= BLACK
    }

    fn is_white(self) -> bool {
        self.red.min(self.green).min(self.blue) >= WHITE
    }
}

impl Shade {
    fn is_grey(&self) -> bool {
        self.saturation <= GREY_SATURATION
            || (self.lightness > PALE_LIGHTNESS && self.saturation < PALE_SATURATION)
    }

    fn is_blue(&self) -> bool {
        (FIRST_BLUE_HUE..=LAST_BLUE_HUE).contains(&self.hue)
    }
}

fn surface(lightness: f64) -> &'static str {
    match lightness {
        l if l < 0.10 => "--luft-page",
        l if l < 0.14 => "--luft-low",
        l if l < 0.19 => "--luft-mid",
        l if l < 0.26 => "--luft-high",
        l if l < 0.40 => "--luft-highest",
        l if l < 0.70 => "--luft-muted",
        _ => "--luft-ink",
    }
}

fn text(lightness: f64) -> &'static str {
    match lightness {
        l if l > 0.72 => "--luft-ink",
        l if l > 0.45 => "--luft-soft",
        l if l > 0.25 => "--luft-muted",
        _ => "--luft-page",
    }
}

/// The role in Luft's palette for one of Steam's colours. Steam's greys and blues all have one. Other colours mean
/// something, such as green for Play, so they stay, as do black shadows and the white behind a QR code.
pub fn role(color: Color, used: Use) -> Option<&'static str> {
    let shade = color.shade();
    let chosen = |lightness| match used {
        Use::Text => text(lightness),
        Use::Surface | Use::Shadow => surface(lightness),
    };
    if color.is_black() {
        return (used == Use::Text || (used == Use::Surface && color.alpha >= 1.0))
            .then(|| chosen(0.0));
    }
    if color.is_white() {
        return (used == Use::Text || (used == Use::Surface && color.alpha < 1.0))
            .then_some("--luft-ink");
    }
    if shade.is_grey() {
        return (used != Use::Shadow).then(|| chosen(shade.lightness));
    }
    if !shade.is_blue() {
        return None;
    }
    Some(if shade.lightness >= BLUE_ACCENT_LIGHTNESS {
        ACCENT
    } else {
        chosen(shade.lightness)
    })
}

/// A colour written with a role of Luft's palette, keeping how see-through it was.
pub fn written(role: &str, alpha: f64) -> String {
    if alpha >= 1.0 {
        format!("var({role})")
    } else {
        format!(
            "color-mix(in srgb, var({role}) {:.1}%, transparent)",
            alpha * 100.0
        )
    }
}

fn channel(text: &str) -> Option<f64> {
    let text = text.trim();
    match text.strip_suffix('%') {
        Some(percent) => percent.parse::<f64>().ok().map(|value| value * 2.55),
        None => text.parse().ok(),
    }
}

fn parts(arguments: &str) -> Vec<&str> {
    arguments
        .split(|letter: char| letter == ',' || letter == '/' || letter.is_whitespace())
        .filter(|part| !part.is_empty())
        .collect()
}

fn alpha(part: Option<&&str>) -> Option<f64> {
    let Some(part) = part else { return Some(1.0) };
    match part.strip_suffix('%') {
        Some(percent) => percent.parse::<f64>().ok().map(|value| value / 100.0),
        None => part.parse().ok(),
    }
}

pub fn from_rgb(arguments: &str) -> Option<Color> {
    let parts = parts(arguments);
    Some(Color {
        red: channel(parts.first()?)?,
        green: channel(parts.get(1)?)?,
        blue: channel(parts.get(2)?)?,
        alpha: alpha(parts.get(3))?,
    })
}

pub fn from_hsl(arguments: &str) -> Option<Color> {
    let parts = parts(arguments);
    let hue = parts.first()?.trim_end_matches("deg").parse::<f64>().ok()?;
    let percent = |part: &str| part.strip_suffix('%')?.parse::<f64>().ok();
    let (saturation, lightness) = (
        percent(parts.get(1)?)? / 100.0,
        percent(parts.get(2)?)? / 100.0,
    );
    let reach = saturation * lightness.min(1.0 - lightness);
    let channel = |offset: f64| {
        let turn = (offset + hue / 30.0) % 12.0;
        255.0 * (lightness - reach * (turn - 3.0).min(9.0 - turn).clamp(-1.0, 1.0))
    };
    Some(Color {
        red: channel(0.0),
        green: channel(8.0),
        blue: channel(4.0),
        alpha: alpha(parts.get(3))?,
    })
}

pub fn from_hex(digits: &str) -> Option<Color> {
    let doubled: String = match digits.len() {
        3 | 4 => digits.chars().flat_map(|digit| [digit, digit]).collect(),
        6 | 8 => digits.to_owned(),
        _ => return None,
    };
    let byte = |start: usize| {
        u8::from_str_radix(doubled.get(start..start + 2)?, 16)
            .ok()
            .map(f64::from)
    };
    Some(Color {
        red: byte(0)?,
        green: byte(2)?,
        blue: byte(4)?,
        alpha: if doubled.len() == 8 {
            byte(6)? / 255.0
        } else {
            1.0
        },
    })
}

#[cfg(test)]
mod tests {
    use super::{ACCENT, Use, from_hex, from_hsl, from_rgb, role, written};

    fn hex(digits: &str, used: Use) -> Option<&'static str> {
        role(from_hex(digits).unwrap(), used)
    }

    #[test]
    fn valve_s_blue_becomes_the_accent() {
        for blue in ["1a9fff", "47bfff", "1a44c2", "67c1f5", "0099d1"] {
            assert_eq!(hex(blue, Use::Surface), Some(ACCENT));
            assert_eq!(hex(blue, Use::Text), Some(ACCENT));
        }
    }

    #[test]
    fn valve_s_navy_and_greys_step_up_luft_s_surfaces() {
        assert_eq!(hex("0e141b", Use::Surface), Some("--luft-page"));
        assert_eq!(hex("171d25", Use::Surface), Some("--luft-low"));
        assert_eq!(hex("1b2838", Use::Surface), Some("--luft-mid"));
        assert_eq!(hex("23262e", Use::Surface), Some("--luft-mid"));
        assert_eq!(hex("3d4450", Use::Surface), Some("--luft-highest"));
    }

    #[test]
    fn valve_s_greys_as_text_step_down_luft_s_inks() {
        assert_eq!(hex("dfe3e6", Use::Text), Some("--luft-ink"));
        assert_eq!(hex("c6d4df", Use::Text), Some("--luft-ink"));
        assert_eq!(hex("8b929a", Use::Text), Some("--luft-soft"));
        assert_eq!(hex("3d4450", Use::Text), Some("--luft-muted"));
    }

    #[test]
    fn what_means_something_stays() {
        assert_eq!(hex("70d61d", Use::Surface), None);
        assert_eq!(hex("d94126", Use::Text), None);
        assert_eq!(hex("fff", Use::Surface), None);
        assert_eq!(role(from_rgb("0, 0, 0, 0.5").unwrap(), Use::Surface), None);
        assert_eq!(hex("000", Use::Shadow), None);
    }

    #[test]
    fn every_way_steam_writes_a_color_is_read() {
        let solid = from_hex("1a9fff").unwrap();
        assert_eq!(from_rgb("26, 159, 255").unwrap(), solid);
        assert_eq!(from_rgb("26 159 255 / 100%").unwrap(), solid);
        assert_eq!(from_hex("0bf").unwrap().red, 0.0);
        assert!((from_hex("1a9fff80").unwrap().alpha - 0.502).abs() < 0.001);
        assert_eq!(from_hsl("0,0%,100%,.8").unwrap().alpha, 0.8);
        assert_eq!(from_hsl("0,0%,100%,.8").unwrap().red, 255.0);
    }

    #[test]
    fn being_see_through_is_kept() {
        assert_eq!(written("--luft-ink", 1.0), "var(--luft-ink)");
        assert_eq!(
            written("--luft-ink", 0.5),
            "color-mix(in srgb, var(--luft-ink) 50.0%, transparent)"
        );
    }
}
