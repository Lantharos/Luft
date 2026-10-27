use luft_app::Commands;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

use crate::L10N;
use crate::panels::system::accounts::users;

#[derive(Deserialize, Type)]
struct LanguageChoice {
    language: String,
}

async fn set_language(LanguageChoice { language }: LanguageChoice) -> Result<(), String> {
    users::change("SetLanguage", &(language.as_str(),)).await?;
    if let Some(tag) = luft_i18n::bcp47(&language) {
        L10N.use_locale(&tag);
        luft_trust::L10N.use_locale(&tag);
    }
    Ok(())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command_async("region_set_language", set_language)
}
