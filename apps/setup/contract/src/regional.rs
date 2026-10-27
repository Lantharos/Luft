use luft_meet::regional::Keyboard;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Type)]
pub struct Regional {
    pub locale: String,
    pub keyboard: Keyboard,
    pub timezone: String,
    pub hostname: String,
}
