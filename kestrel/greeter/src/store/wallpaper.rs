use crate::error::Error;

#[derive(Clone, Copy, PartialEq)]
pub struct Focus {
    x: f64,
    y: f64,
}

impl Focus {
    pub fn new((x, y): (f64, f64)) -> Result<Self, Error> {
        let valid = |value: f64| (0.0..=1.0).contains(&value);
        if valid(x) && valid(y) {
            Ok(Self { x, y })
        } else {
            Err(Error::InvalidArgs(
                "The wallpaper focus must lie between 0 and 1".into(),
            ))
        }
    }

    pub fn details(self) -> Vec<u8> {
        serde_json::to_vec(&serde_json::json!({ "focus": [self.x, self.y] }))
            .expect("the focus serializes")
    }
}
