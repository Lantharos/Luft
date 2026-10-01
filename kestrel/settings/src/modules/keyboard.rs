use zbus::proxy;

use crate::context::Context;

const INPUT_SOURCES: &str = "org.gnome.desktop.input-sources";
const DEFAULT_LAYOUT: &str = "us";

#[proxy(
    interface = "org.freedesktop.locale1",
    default_service = "org.freedesktop.locale1",
    default_path = "/org/freedesktop/locale1"
)]
trait Locale {
    #[zbus(property, name = "X11Layout")]
    fn x11_layout(&self) -> zbus::Result<String>;

    #[zbus(property, name = "X11Variant")]
    fn x11_variant(&self) -> zbus::Result<String>;

    #[zbus(property, name = "X11Options")]
    fn x11_options(&self) -> zbus::Result<String>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(settings) = context.settings.watch(&[INPUT_SOURCES]).await else {
        return Ok(());
    };
    let sources: Vec<(String, String)> = settings.get(INPUT_SOURCES, "sources");
    let options_chosen = settings.is_user_set(INPUT_SOURCES, "xkb-options").await;
    if !sources.is_empty() && options_chosen {
        return Ok(());
    }
    let locale = LocaleProxy::new(&context.system).await?;
    if sources.is_empty() {
        let layouts = system_layouts(&locale.x11_layout().await?, &locale.x11_variant().await?);
        settings.set(INPUT_SOURCES, "sources", layouts);
    }
    if !options_chosen {
        let options = locale.x11_options().await?;
        if !options.is_empty() {
            settings.set(
                INPUT_SOURCES,
                "xkb-options",
                options.split(',').collect::<Vec<_>>(),
            );
        }
    }
    Ok(())
}

fn system_layouts(layouts: &str, variants: &str) -> Vec<(String, String)> {
    let mut variants = variants.split(',');
    let sources: Vec<_> = layouts
        .split(',')
        .take_while(|layout| !layout.is_empty())
        .map(
            |layout| match variants.next().filter(|variant| !variant.is_empty()) {
                Some(variant) => ("xkb".to_owned(), format!("{layout}+{variant}")),
                None => ("xkb".to_owned(), layout.to_owned()),
            },
        )
        .collect();
    if sources.is_empty() {
        return vec![("xkb".to_owned(), DEFAULT_LAYOUT.to_owned())];
    }
    sources
}
