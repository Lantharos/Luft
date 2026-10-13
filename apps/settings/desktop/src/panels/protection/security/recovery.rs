use luft_app::recovery::for_this_computer;

pub fn save(key: &str) -> Result<bool, String> {
    for_this_computer(key).save("Recovery key.txt")
}

pub fn print(key: &str) -> Result<(), String> {
    for_this_computer(key).print()
}
