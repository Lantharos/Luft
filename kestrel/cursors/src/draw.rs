use crate::palette::Palette;
use crate::shapes::{ARROW, ARROW_WAVE, DISC, DISC_WAVE, DOUBLE};

pub const ANGLE: &str = "{angle}";
const EDGE: f32 = 1.0;
const SOFTENED: f32 = 0.8;

pub struct Pen<'a> {
    pub palette: &'a Palette,
}

impl Pen<'_> {
    pub fn shape(&self, shape: &str) -> String {
        self.styled(shape, self.palette.body, 0.0, "")
    }

    pub fn softened(&self, shape: &str) -> String {
        self.styled(shape, self.palette.body, SOFTENED, "")
    }

    pub fn turned(&self, shape: &str, degrees: f32) -> String {
        self.styled(shape, self.palette.body, 0.0, &rotate(degrees))
    }

    pub fn filled(&self, shape: &str, fill: &str) -> String {
        self.styled(shape, fill, 0.0, "")
    }

    pub fn styled(&self, shape: &str, fill: &str, soft: f32, transform: &str) -> String {
        let edge = self.palette.edge;
        let rim = if soft > 0.0 {
            format!(r#" stroke="{fill}" stroke-width="{soft}" stroke-linejoin="round""#)
        } else {
            String::new()
        };
        let transform = if transform.is_empty() {
            String::new()
        } else {
            format!(r#" transform="{transform}""#)
        };
        format!(
            r#"<g{transform}><g fill="{edge}" stroke="{edge}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round">{shape}</g><g fill="{fill}"{rim}>{shape}</g></g>"#,
            width = EDGE * 2.0 + soft,
        )
    }

    pub fn arrow(&self) -> String {
        self.shape(ARROW)
    }

    pub fn waved_arrow(&self, id: &str) -> String {
        format!(
            r#"<clipPath id="{id}">{ARROW}</clipPath>{}<path clip-path="url(#{id})" d="{ARROW_WAVE}" fill="{}"/>"#,
            self.shape(ARROW),
            self.palette.wave,
        )
    }

    pub fn busy_disc(&self) -> String {
        format!(
            r#"<clipPath id="disc">{DISC}</clipPath>{}<g clip-path="url(#disc)"><g fill="{}" transform="rotate({ANGLE} 16 16)">{DISC_WAVE}</g></g>"#,
            self.filled(DISC, self.palette.disc),
            self.palette.disc_wave,
        )
    }

    pub fn badge(&self, glyph: &str) -> String {
        format!(
            r#"<circle cx="24.6" cy="24.6" r="6.4" fill="{}"/><circle cx="24.6" cy="24.6" r="5.4" fill="{}"/>{glyph}"#,
            self.palette.body, self.palette.badge,
        )
    }

    pub fn glyph(&self, path: &str, width: f32) -> String {
        line(path, self.palette.badge_glyph, width)
    }

    pub fn detail(&self, path: &str, width: f32) -> String {
        line(path, self.palette.edge, width)
    }

    pub fn double(&self, degrees: f32) -> String {
        let fit = if degrees % 90.0 == 0.0 {
            ""
        } else {
            " translate(16 16) scale(.92) translate(-16 -16)"
        };
        self.styled(
            DOUBLE,
            self.palette.body,
            SOFTENED,
            &format!("{}{fit}", rotate(degrees)),
        )
    }

    pub fn softened_turned(&self, shape: &str, degrees: f32) -> String {
        self.styled(shape, self.palette.body, SOFTENED, &rotate(degrees))
    }
}

pub fn rotate(degrees: f32) -> String {
    format!("rotate({degrees} 16 16)")
}

pub fn line(path: &str, color: &str, width: f32) -> String {
    format!(
        r#"<path d="{path}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>"#
    )
}
