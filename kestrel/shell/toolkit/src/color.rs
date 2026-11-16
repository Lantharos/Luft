/// A colour with straight alpha, its channels in sRGB between 0 and 1.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl Color {
    pub const TRANSPARENT: Self = Self::rgba(0, 0, 0, 0.0);

    pub const fn rgba(r: u8, g: u8, b: u8, a: f32) -> Self {
        Self {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a,
        }
    }

    pub const fn alpha(self, a: f32) -> Self {
        Self {
            a: self.a * a,
            ..self
        }
    }

    pub fn mix(self, other: Self, amount: f32) -> Self {
        let lerp = |from: f32, to: f32| from + (to - from) * amount;
        let a = lerp(self.a, other.a);
        if a <= f32::EPSILON {
            return Self { a: 0.0, ..other };
        }
        let channel = |from: f32, to: f32| lerp(from * self.a, to * other.a) / a;
        Self {
            r: channel(self.r, other.r),
            g: channel(self.g, other.g),
            b: channel(self.b, other.b),
            a,
        }
    }

    pub(crate) const fn array(self) -> [f32; 4] {
        [self.r, self.g, self.b, self.a]
    }
}
