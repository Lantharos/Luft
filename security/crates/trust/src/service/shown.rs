use serde::{Serialize, Serializer};
use zbus::{Signature, Type};

use crate::system::secrets::secret::Secret;

pub struct Shown(pub Secret);

impl Type for Shown {
    const SIGNATURE: &'static Signature = &Signature::Str;
}

impl Serialize for Shown {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(self.0.text())
    }
}
