use serde_json::Value;

const FILE: &str = "barometer/settings.json";

pub fn read() -> Option<Value> {
    luft_app::settings::load(FILE)
}

pub fn write(settings: Value) -> Result<(), String> {
    luft_app::settings::save(FILE, &settings)
}
