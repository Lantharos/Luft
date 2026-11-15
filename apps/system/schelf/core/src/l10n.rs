use luft_i18n::{Localizer, t};

pub static L10N: Localizer = luft_i18n::localizer!("locales", ["core"]);

pub fn list_of(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [only] => only.clone(),
        [rest @ .., last] => t!(
            L10N,
            "core-list-and",
            rest = rest.join(&t!(L10N, "core-list-separator")),
            last = last.as_str()
        ),
    }
}
