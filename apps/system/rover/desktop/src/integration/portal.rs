use std::collections::HashMap;
use std::path::Path;

use luft_dbus_macros::introspect;
use url::Url;
use zbus::interface;
use zbus::{OwnedObjectPath, OwnedVariant, Variant};

use super::chooser::{ChooserConfig, ChooserFilter, ChooserMode, ChooserResponse};
use super::{data_dir, install_dbus_service, serve, write_file};
use crate::app::state::RoverState;

const BUS_NAME: &str = "org.freedesktop.impl.portal.desktop.rover";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const FILE_CHOOSER_INTERFACE: &str = "org.freedesktop.impl.portal.FileChooser";
const RESPONSE_SUCCESS: u32 = 0;
const RESPONSE_CANCELLED: u32 = 1;

type Options = HashMap<String, OwnedVariant>;
type Results = HashMap<String, OwnedVariant>;
type Filter = (String, Vec<(u32, String)>);

const GLOB: u32 = 0;

struct FileChooser {
    state: RoverState,
}

#[introspect]
#[interface(interface = "org.freedesktop.impl.portal.FileChooser")]
impl FileChooser {
    #[zbus(out_args("response", "results"))]
    async fn open_file(
        &self,
        _handle: OwnedObjectPath,
        _app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(parent_window, title, &options, ChooserMode::Open)
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_file(
        &self,
        _handle: OwnedObjectPath,
        _app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(parent_window, title, &options, ChooserMode::Save)
            .await
    }

    #[zbus(out_args("response", "results"))]
    async fn save_files(
        &self,
        _handle: OwnedObjectPath,
        _app_id: String,
        parent_window: String,
        title: String,
        options: Options,
    ) -> zbus::fdo::Result<(u32, Results)> {
        self.choose(parent_window, title, &options, ChooserMode::SaveFiles)
            .await
    }
}

impl FileChooser {
    async fn choose(
        &self,
        parent_window: String,
        title: String,
        options: &Options,
        mode: ChooserMode,
    ) -> zbus::fdo::Result<(u32, Results)> {
        let filters = option_filters(options);
        let config = chooser_config(title, options, &filters, mode);
        let state = self.state.clone();
        let answered = tokio::task::spawn_blocking(move || {
            let closing = state.clone();
            state.choosers.open(config, &parent_window, move |request| {
                closing.finish_chooser(request, ChooserResponse::default());
            })
        })
        .await
        .map_err(|error| zbus::fdo::Error::Failed(error.to_string()))?
        .map_err(zbus::fdo::Error::Failed)?;
        let response = answered.await.unwrap_or_default();
        Ok(portal_results(response, filters))
    }
}

/// Answers the desktop portal's file chooser requests from one process that
/// stays without a window of its own and opens one for each chooser.
pub fn run() -> ! {
    let state = RoverState::new();
    let choosers = state.choosers.clone();
    let serving = state.clone();
    luft_app::run(
        &state.events,
        |window| {
            let window = crate::glass_window(window, crate::APP_NAME, None)
                .background()
                .on_launched(move |process| choosers.attach(process));
            crate::app::bridge::register(window, &state)
        },
        move |events| {
            crate::locations::drives::watch_mounts(events);
            luft_app::spawn(async move {
                let chooser = FileChooser { state: serving };
                if let Err(error) = serve(BUS_NAME, PORTAL_PATH, chooser).await {
                    eprintln!("Rover file chooser portal failed: {error}");
                    std::process::exit(1);
                }
            });
        },
    )
}

pub fn install() -> Result<(), String> {
    install_dbus_service(BUS_NAME, "--portal-backend")?;
    write_file(
        &data_dir()?.join("xdg-desktop-portal/portals/rover.portal"),
        &format!("[portal]\nDBusName={BUS_NAME}\nInterfaces={FILE_CHOOSER_INTERFACE};\nUseIn=*;\n"),
    )
}

fn chooser_config(
    title: String,
    options: &Options,
    filters: &[Filter],
    mode: ChooserMode,
) -> ChooserConfig {
    ChooserConfig {
        mode,
        title,
        accept_label: option_string(options, "accept_label").unwrap_or_default(),
        directory: option_bool(options, "directory").unwrap_or(mode == ChooserMode::SaveFiles),
        multiple: option_bool(options, "multiple").unwrap_or(false),
        current_folder: current_folder(options),
        current_name: option_string(options, "current_name").filter(|name| !name.is_empty()),
        files: option_files(options),
        filters: filters.iter().map(chooser_filter).collect(),
        filter: option::<Filter>(options, "current_filter")
            .and_then(|current| filters.iter().position(|filter| *filter == current))
            .map(|index| index as u32),
    }
}

fn portal_results(response: ChooserResponse, mut filters: Vec<Filter>) -> (u32, Results) {
    if !response.accepted {
        return (RESPONSE_CANCELLED, Results::new());
    }
    let uris: Vec<String> = response
        .paths
        .into_iter()
        .filter_map(|path| Url::from_file_path(path).ok())
        .map(String::from)
        .collect();
    let mut results = Results::new();
    results.insert("uris".to_string(), owned(uris));
    results.insert("writable".to_string(), OwnedVariant::from(true));
    if let Some(index) = response.filter.map(|index| index as usize)
        && index < filters.len()
    {
        results.insert(
            "current_filter".to_string(),
            owned(filters.swap_remove(index)),
        );
    }
    (RESPONSE_SUCCESS, results)
}

fn option_bool(options: &Options, key: &str) -> Option<bool> {
    options
        .get(key)
        .and_then(|value| bool::try_from(value).ok())
}

fn option_string(options: &Options, key: &str) -> Option<String> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| String::try_from(value).ok())
}

fn option<T: TryFrom<OwnedVariant>>(options: &Options, key: &str) -> Option<T> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}

fn option_filters(options: &Options) -> Vec<Filter> {
    option(options, "filters").unwrap_or_default()
}

fn chooser_filter((name, rules): &Filter) -> ChooserFilter {
    let (patterns, mime_types): (Vec<_>, Vec<_>) =
        rules.iter().partition(|(kind, _)| *kind == GLOB);
    let texts =
        |rules: Vec<&(u32, String)>| rules.into_iter().map(|(_, text)| text.clone()).collect();
    ChooserFilter {
        name: name.clone(),
        patterns: texts(patterns),
        mime_types: texts(mime_types),
    }
}

fn option_bytes(options: &Options, key: &str) -> Option<String> {
    options
        .get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<u8>::try_from(value).ok())
        .and_then(bytes_to_path)
}

fn current_folder(options: &Options) -> Option<String> {
    option_bytes(options, "current_folder").or_else(|| {
        option_bytes(options, "current_file").and_then(|path| {
            Path::new(&path)
                .parent()
                .map(|parent| parent.to_string_lossy().into_owned())
        })
    })
}

fn option_files(options: &Options) -> Vec<String> {
    options
        .get("files")
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| Vec::<Vec<u8>>::try_from(value).ok())
        .map(|files| files.into_iter().filter_map(bytes_to_path).collect())
        .unwrap_or_default()
}

fn bytes_to_path(mut bytes: Vec<u8>) -> Option<String> {
    while bytes.last() == Some(&0) {
        bytes.pop();
    }
    String::from_utf8(bytes)
        .ok()
        .filter(|value| !value.is_empty())
}

fn owned<T>(value: T) -> OwnedVariant
where
    Variant<'static>: From<T>,
{
    OwnedVariant::try_from(Variant::from(value))
        .expect("Chooser results always fit in a D-Bus variant")
}
