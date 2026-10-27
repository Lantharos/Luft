use serde_json::{Map, Value};

const FILE: &str = "barometer/settings.json";

pub fn read() -> Option<Map<String, Value>> {
    luft_app::settings::load(FILE)
}

pub fn write(settings: Map<String, Value>) -> Result<(), String> {
    luft_app::settings::save(FILE, &settings)
}
