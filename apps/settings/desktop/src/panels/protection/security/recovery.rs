use luft_app::recovery::for_this_computer;

pub async fn save(key: &str) -> Result<bool, String> {
    for_this_computer(key).save("Recovery key.txt").await
}

pub async fn print(key: &str) -> Result<bool, String> {
    for_this_computer(key).print().await
}
