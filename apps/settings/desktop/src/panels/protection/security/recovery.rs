use luft_app::recovery::for_this_computer;
use luft_i18n::t;

use crate::L10N;

pub async fn save(key: &str) -> Result<bool, String> {
    for_this_computer(key)
        .save(&t!(L10N, "desktop-security-recovery-file-name"))
        .await
}

pub async fn print(key: &str) -> Result<bool, String> {
    for_this_computer(key).print().await
}
