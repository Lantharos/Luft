mod locales;
mod pseudo;

use std::borrow::Cow;
use std::sync::{Arc, OnceLock, RwLock};

use fluent_bundle::concurrent::FluentBundle;
use fluent_bundle::{FluentMessage, FluentResource};
use unic_langid::LanguageIdentifier;

pub use fluent_bundle::{FluentArgs, FluentValue};
pub use locales::{LOCALES, PSEUDO_LOCALE, SOURCE_LOCALE, bcp47, formats, negotiate, overridden, requested};

type Bundle = FluentBundle<FluentResource>;

pub type Sources = [(&'static str, &'static str)];

struct Loaded {
    locale: &'static str,
    bundle: Bundle,
    fallback: OnceLock<Bundle>,
}

pub struct Localizer {
    sources: &'static Sources,
    loaded: RwLock<Option<Arc<Loaded>>>,
}

impl Localizer {
    pub const fn new(sources: &'static Sources) -> Self {
        Self {
            sources,
            loaded: RwLock::new(None),
        }
    }

    pub fn locale(&self) -> &'static str {
        self.current().locale
    }

    pub fn use_locale(&self, requested: &str) {
        if overridden() {
            return;
        }
        let locale = negotiate(&[requested]);
        let mut slot = self.loaded.write().unwrap_or_else(|e| e.into_inner());
        if slot.as_ref().is_none_or(|loaded| loaded.locale != locale) {
            *slot = Some(Arc::new(self.load(locale)));
        }
    }

    pub fn t(&self, id: &str) -> String {
        self.format(id, None)
    }

    pub fn format(&self, id: &str, args: Option<&FluentArgs>) -> String {
        let loaded = self.current();
        let (bundle, message) = match loaded.bundle.get_message(id) {
            Some(message) => (&loaded.bundle, message),
            None => {
                let fallback = loaded.fallback.get_or_init(|| self.bundle(SOURCE_LOCALE));
                match fallback.get_message(id) {
                    Some(message) => (fallback, message),
                    None => return id.to_owned(),
                }
            }
        };
        render(bundle, &message, args)
    }

    fn current(&self) -> Arc<Loaded> {
        if let Some(loaded) = &*self.loaded.read().unwrap_or_else(|e| e.into_inner()) {
            return loaded.clone();
        }
        let mut slot = self.loaded.write().unwrap_or_else(|e| e.into_inner());
        slot.get_or_insert_with(|| Arc::new(self.load(negotiate(&requested()))))
            .clone()
    }

    fn load(&self, locale: &'static str) -> Loaded {
        Loaded {
            locale,
            bundle: self.bundle(locale),
            fallback: OnceLock::new(),
        }
    }

    fn bundle(&self, locale: &str) -> Bundle {
        let pseudo = locale == PSEUDO_LOCALE;
        let file_locale = if pseudo { SOURCE_LOCALE } else { locale };
        let source = self
            .sources
            .iter()
            .find(|(name, _)| *name == file_locale)
            .map_or("", |(_, source)| source);
        let language: LanguageIdentifier = file_locale.parse().unwrap_or_default();
        let mut bundle = Bundle::new_concurrent(vec![language]);
        bundle.set_use_isolating(false);
        if pseudo {
            bundle.set_transform(Some(pseudo::pseudolocalize));
        }
        let resource =
            FluentResource::try_new(source.to_owned()).unwrap_or_else(|(resource, _)| resource);
        bundle.add_resource_overriding(resource);
        bundle
    }
}

fn render(bundle: &Bundle, message: &FluentMessage, args: Option<&FluentArgs>) -> String {
    let mut errors = Vec::new();
    message
        .value()
        .map(|pattern| bundle.format_pattern(pattern, args, &mut errors))
        .map_or_else(String::new, Cow::into_owned)
}

#[macro_export]
macro_rules! localizer {
    ($dir:literal, [$($file:literal),+ $(,)?]) => {
        $crate::Localizer::new(&[
            $crate::localizer!(@locale $dir, "en", [$($file),+]),
            $crate::localizer!(@locale $dir, "bs", [$($file),+]),
            $crate::localizer!(@locale $dir, "ca", [$($file),+]),
            $crate::localizer!(@locale $dir, "da", [$($file),+]),
            $crate::localizer!(@locale $dir, "de", [$($file),+]),
            $crate::localizer!(@locale $dir, "es", [$($file),+]),
            $crate::localizer!(@locale $dir, "fr", [$($file),+]),
            $crate::localizer!(@locale $dir, "hr", [$($file),+]),
            $crate::localizer!(@locale $dir, "is", [$($file),+]),
            $crate::localizer!(@locale $dir, "it", [$($file),+]),
            $crate::localizer!(@locale $dir, "nl", [$($file),+]),
            $crate::localizer!(@locale $dir, "nb", [$($file),+]),
            $crate::localizer!(@locale $dir, "nn", [$($file),+]),
            $crate::localizer!(@locale $dir, "pt-BR", [$($file),+]),
            $crate::localizer!(@locale $dir, "pt", [$($file),+]),
            $crate::localizer!(@locale $dir, "ro", [$($file),+]),
            $crate::localizer!(@locale $dir, "sq", [$($file),+]),
            $crate::localizer!(@locale $dir, "sr-Latn", [$($file),+]),
            $crate::localizer!(@locale $dir, "sv", [$($file),+]),
            $crate::localizer!(@locale $dir, "sr", [$($file),+]),
        ])
    };
    (@locale $dir:literal, $locale:literal, [$($file:literal),+]) => {
        ($locale, concat!($(include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/", $dir, "/", $locale, "/", $file, ".ftl")), "\n"),+))
    };
}

#[macro_export]
macro_rules! t {
    ($localizer:expr, $id:expr) => {
        $localizer.t($id)
    };
    ($localizer:expr, $id:expr, $($name:ident = $value:expr),+ $(,)?) => {{
        let mut args = $crate::FluentArgs::new();
        $(args.set(stringify!($name), $value);)+
        $localizer.format($id, Some(&args))
    }};
}

#[cfg(test)]
mod tests {
    use super::*;

    static SOURCES: [(&str, &str); 2] = [
        (
            "en",
            "greeting = Hello, { $name }\nfiles = { $count ->\n    [one] One file\n   *[other] { $count } files\n}\nonly-english = Only here\n",
        ),
        (
            "hr",
            "greeting = Bok, { $name }\nfiles = { $count ->\n    [one] { $count } datoteka\n    [few] { $count } datoteke\n   *[other] { $count } datoteka\n}\n",
        ),
    ];

    #[test]
    fn formats_plurals_and_falls_back() {
        let localizer = Localizer::new(&SOURCES);
        localizer.use_locale("hr-HR");
        assert_eq!(t!(localizer, "greeting", name = "Ana"), "Bok, Ana");
        assert_eq!(t!(localizer, "files", count = 3), "3 datoteke");
        assert_eq!(t!(localizer, "files", count = 5), "5 datoteka");
        assert_eq!(localizer.t("only-english"), "Only here");
    }

    #[test]
    fn pseudolocalizes_english() {
        let localizer = Localizer::new(&SOURCES);
        localizer.use_locale(PSEUDO_LOCALE);
        assert_eq!(localizer.t("only-english"), "ÖÖñļýý ĥééŕéé");
    }
}
