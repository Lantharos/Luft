mod chooser;
mod drives;
mod file_actions;
mod file_manager_bus;
mod fs_ops;
mod launch_args;
mod operations_queue;
mod path_codec;
mod platform;
mod portal_backend;
mod settings;
mod state;
mod system_status;
mod trash_manager;
mod vcs;
mod web_entry;

use std::path::PathBuf;

use fenestra_cef::SingleInstancePolicy;
use fenestra_cef::{
    BridgeCommand, BridgeCommandDescriptor, BridgeError, BridgeResponse, BridgeResult,
    FenestraWindow, FenestraWindowControlAction, RuntimeConfig, RuntimeMode, WebViewSecurity,
    WindowRegion, WindowRegionRect,
};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use state::RoverState;

const APP_NAME: &str = "Rover";
const APP_ID: &str = "dev.kristof.rover";
const WINDOW_WIDTH: u32 = 1200;
const WINDOW_HEIGHT: u32 = 800;
const MIN_WINDOW_WIDTH: u32 = 800;
const MIN_WINDOW_HEIGHT: u32 = 600;
const SIDEBAR_WIDTH: i32 = 260;
const APP_HEADER_HEIGHT: i32 = 52;
const SIDEBAR_STATIC_CONTROLS_HEIGHT: i32 = 520;
const WINDOW_RADIUS: i32 = 16;

pub fn run(args: &[String]) -> Result<(), String> {
    let state = RoverState::new(args);
    let window = build_window(args, &state);
    let process = match window.launch_or_install() {
        Ok(process) => process,
        Err(error)
            if error
                .to_string()
                .contains("another instance is already running") =>
        {
            return Ok(());
        }
        Err(error) => return Err(error.to_string()),
    };
    let _ = process.wait();
    Ok(())
}

fn build_window(args: &[String], state: &RoverState) -> FenestraWindow {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let root_dir = manifest_dir
        .parent()
        .map(PathBuf::from)
        .unwrap_or_else(|| manifest_dir.clone());
    let runtime = RuntimeConfig {
        mode: RuntimeMode::SharedPreferred,
        allow_user_install: true,
        bundled_dir: Some(root_dir.clone()),
        ..RuntimeConfig::default()
    };
    let mut window = FenestraWindow::new()
        .title(state.title())
        .app_id(APP_ID)
        .size(WINDOW_WIDTH, WINDOW_HEIGHT)
        .min_size(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT)
        .frameless()
        .glass()
        .runtime(runtime)
        .blur_region(WindowRegion::adaptive_rounded_left(
            SIDEBAR_WIDTH,
            WINDOW_RADIUS,
        ))
        .opaque_region(WindowRegion::adaptive_content_after_sidebar(
            SIDEBAR_WIDTH,
            0,
        ))
        .input_region(WindowRegion::adaptive_rounded_rect(WINDOW_RADIUS))
        .drag_region(WindowRegionRect::new(0, 0, SIDEBAR_WIDTH, i32::MAX))
        .drag_exclusion_region(WindowRegionRect::new(
            0,
            0,
            SIDEBAR_WIDTH,
            SIDEBAR_STATIC_CONTROLS_HEIGHT,
        ))
        .drag_region(WindowRegionRect::new(
            SIDEBAR_WIDTH + 520,
            0,
            i32::MAX,
            APP_HEADER_HEIGHT,
        ))
        .control_region(
            FenestraWindowControlAction::Minimize,
            WindowRegionRect::new(-108, 12, 28, 28),
        )
        .control_region(
            FenestraWindowControlAction::Maximize,
            WindowRegionRect::new(-76, 12, 28, 28),
        )
        .control_region(
            FenestraWindowControlAction::Close,
            WindowRegionRect::new(-44, 12, 28, 28),
        );

    if !state.chooser.config().active {
        window = window
            .single_instance_id(APP_ID)
            .single_instance(SingleInstancePolicy::FocusExisting);
    }

    if args.iter().any(|arg| arg == "--dev") {
        window = window
            .security(WebViewSecurity {
                remote_content: true,
                allowed_origins: Vec::new(),
                allowed_bridge_permissions: Vec::new(),
            })
            .dev_url("http://localhost:5173?fenestra=1#/")
            .dev_command("bun run dev");
    } else {
        let entry = web_entry::resolve(&root_dir);
        window = window.entry(format!("{}?fenestra=1#/", entry.display()));
    }

    register_commands(window, state.clone())
}

fn register_commands(mut window: FenestraWindow, state: RoverState) -> FenestraWindow {
    macro_rules! command {
        ($name:literal, $handler:expr) => {{
            window = window.bridge_descriptor_handler(
                BridgeCommandDescriptor::new($name).target("desktop"),
                $handler,
            );
        }};
    }

    command!("list_directory", move |command| {
        let input: ListDirectoryParams = params(&command)?;
        json_result(fs_ops::list_directory(input.path, input.show_hidden))
    });

    command!("get_file_info", move |command| {
        let PathParams { path } = params(&command)?;
        json_result(fs_ops::get_file_info(path))
    });

    command!("create_file", move |command| {
        let input: PathNameParams = params(&command)?;
        json_result(fs_ops::create_file(input.path, input.name))
    });

    command!("create_directory", move |command| {
        let input: PathNameParams = params(&command)?;
        json_result(fs_ops::create_directory(input.path, input.name))
    });

    command!("rename_item", move |command| {
        let input: RenameParams = params(&command)?;
        json_result(fs_ops::rename_item(input.path, input.new_name))
    });

    let context = state.clone();
    command!("copy_items", move |command| {
        let input: TransferParams = params(&command)?;
        json_result(file_actions::copy_items(
            input.sources,
            input.destination,
            &context.queue,
        ))
    });

    let context = state.clone();
    command!("move_items", move |command| {
        let input: TransferParams = params(&command)?;
        json_result(file_actions::move_items(
            input.sources,
            input.destination,
            &context.queue,
        ))
    });

    let context = state.clone();
    command!("delete_items", move |command| {
        let PathsParams { paths } = params(&command)?;
        json_result(file_actions::delete_items(paths, &context.queue))
    });

    command!("get_home_dir", move |_| json_result(fs_ops::get_home_dir()));
    command!("get_user_dirs", move |_| json_result(
        fs_ops::get_user_dirs()
    ));

    let context = state.clone();
    command!("get_launch_paths", move |_| {
        json_ok(context.launch_paths.clone())
    });

    command!("read_text_file", move |command| {
        let input: ReadTextParams = params(&command)?;
        json_result(fs_ops::read_text_file(input.path, input.max_bytes))
    });

    command!("open_with_default", move |command| {
        let PathParams { path } = params(&command)?;
        json_result(fs_ops::open_with_default(path))
    });

    command!("get_thumbnail", move |command| {
        let PathParams { path } = params(&command)?;
        json_result(fs_ops::get_thumbnail(path))
    });

    command!("list_drives", move |_| json_result(drives::list_drives()));

    command!("get_drive_info", move |command| {
        let MountPointParams { mount_point } = params(&command)?;
        json_result(drives::get_drive_info(mount_point))
    });

    command!("eject_drive", move |command| {
        let MountPointParams { mount_point } = params(&command)?;
        json_result(drives::eject_drive(mount_point))
    });

    command!("list_trash", move |_| json_result(
        trash_manager::list_trash()
    ));

    let context = state.clone();
    command!("move_to_trash", move |command| {
        let PathsParams { paths } = params(&command)?;
        json_result(trash_manager::move_to_trash(paths, &context.queue))
    });

    let context = state.clone();
    command!("restore_from_trash", move |command| {
        let IdsParams { ids } = params(&command)?;
        json_result(trash_manager::restore_from_trash(ids, &context.queue))
    });

    let context = state.clone();
    command!("delete_permanently", move |command| {
        let IdsParams { ids } = params(&command)?;
        json_result(trash_manager::delete_permanently(ids, &context.queue))
    });

    command!("empty_trash", move |command| {
        let TrashPathParams { trash_path } = params(&command)?;
        json_result(trash_manager::empty_trash(trash_path))
    });

    let context = state.clone();
    command!("get_queue_status", move |_| {
        json_ok(operations_queue::get_queue_status(&context.queue))
    });

    let context = state.clone();
    command!("cancel_operation", move |command| {
        let IdParam { id } = params(&command)?;
        json_result(operations_queue::cancel_operation(id, &context.queue))
    });

    let context = state.clone();
    command!("pause_operation", move |command| {
        let IdParam { id } = params(&command)?;
        json_result(operations_queue::pause_operation(id, &context.queue))
    });

    let context = state.clone();
    command!("resume_operation", move |command| {
        let IdParam { id } = params(&command)?;
        json_result(operations_queue::resume_operation(id, &context.queue))
    });

    let context = state.clone();
    command!("get_settings", move |_| {
        json_ok(settings::get_settings(&context.settings))
    });

    let context = state.clone();
    command!("update_settings", move |command| {
        let input: UpdateSettingsParams = params(&command)?;
        json_result(settings::update_settings(
            input.new_settings,
            &context.settings,
        ))
    });

    let context = state.clone();
    command!("add_favorite", move |command| {
        let input: FavoriteParams = params(&command)?;
        json_result(settings::add_favorite(input.item, &context.settings))
    });

    let context = state.clone();
    command!("remove_favorite", move |command| {
        let PathParams { path } = params(&command)?;
        json_result(settings::remove_favorite(path, &context.settings))
    });

    let context = state.clone();
    command!("add_pinned_folder", move |command| {
        let input: PinnedFolderParams = params(&command)?;
        json_result(settings::add_pinned_folder(input.folder, &context.settings))
    });

    let context = state.clone();
    command!("remove_pinned_folder", move |command| {
        let PathParams { path } = params(&command)?;
        json_result(settings::remove_pinned_folder(path, &context.settings))
    });

    command!("get_background_effect_status", move |_| {
        json_ok(system_status::get_background_effect_status())
    });

    let context = state.clone();
    command!("vcs_start_status", move |command| {
        let vcs::VcsParams { path, .. } = params(&command)?;
        json_ok(context.vcs_jobs.start_status(path.unwrap_or_default()))
    });

    let context = state.clone();
    command!("vcs_status_result", move |command| {
        let vcs::VcsParams { job_id, .. } = params(&command)?;
        json_result(context.vcs_jobs.status_result(job_id.unwrap_or_default()))
    });

    command!("vcs_detect", move |command| {
        let vcs::VcsParams { path, .. } = params(&command)?;
        json_result(vcs::detect(path.unwrap_or_default()))
    });

    command!("vcs_project_status", move |command| {
        let vcs::VcsParams { root, .. } = params(&command)?;
        json_result(vcs::get_project_status(root.unwrap_or_default()))
    });

    command!("vcs_file_statuses", move |command| {
        let vcs::VcsParams { root, .. } = params(&command)?;
        json_result(vcs::get_file_statuses(root.unwrap_or_default()))
    });

    command!("vcs_diff", move |command| {
        let vcs::VcsParams {
            root, file_path, ..
        } = params(&command)?;
        json_result(vcs::get_diff(root.unwrap_or_default(), file_path))
    });

    command!("vcs_save", move |command| {
        let vcs::VcsParams {
            root,
            message,
            files,
            ..
        } = params(&command)?;
        json_result(vcs::save(
            root.unwrap_or_default(),
            message.unwrap_or_default(),
            files,
        ))
    });

    command!("vcs_sync", move |command| {
        let vcs::VcsParams { root, .. } = params(&command)?;
        json_result(vcs::sync(root.unwrap_or_default()))
    });

    let context = state.clone();
    command!("get_chooser_config", move |_| {
        json_ok(chooser::get_chooser_config(&context.chooser))
    });

    let context = state.clone();
    command!("accept_chooser", move |command| {
        let PathsParams { paths } = params(&command)?;
        json_result(chooser::accept_chooser(paths, &context.chooser))
    });

    let context = state;
    command!("cancel_chooser", move |_| {
        json_result(chooser::cancel_chooser(&context.chooser))
    });

    window
}

pub fn run_portal_backend() -> Result<(), String> {
    portal_backend::run()
}

pub fn install_file_chooser_portal() -> Result<(), String> {
    portal_backend::install_user_portal()
}

pub fn run_file_manager_bus() -> Result<(), String> {
    file_manager_bus::run()
}

pub fn install_file_manager_bus_service() -> Result<(), String> {
    file_manager_bus::install_user_service()
}

fn params<T: DeserializeOwned>(command: &BridgeCommand) -> Result<T, BridgeError> {
    let mut params = command.params.clone();
    path_codec::normalize_json_paths(&mut params);
    serde_json::from_value(params)
        .map_err(|error| BridgeError::new(format!("Invalid {} params: {error}", command.name)))
}

fn json_ok<T: Serialize>(value: T) -> BridgeResult {
    serde_json::to_value(value)
        .map(BridgeResponse::json)
        .map_err(|error| BridgeError::new(error.to_string()))
}

fn json_result<T: Serialize>(result: Result<T, String>) -> BridgeResult {
    result
        .and_then(|value| serde_json::to_value(value).map_err(|error| error.to_string()))
        .map(BridgeResponse::json)
        .map_err(BridgeError::new)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListDirectoryParams {
    path: String,
    show_hidden: bool,
}

#[derive(Deserialize)]
struct PathParams {
    path: String,
}

#[derive(Deserialize)]
struct PathsParams {
    paths: Vec<String>,
}

#[derive(Deserialize)]
struct PathNameParams {
    path: String,
    name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RenameParams {
    path: String,
    new_name: String,
}

#[derive(Deserialize)]
struct TransferParams {
    sources: Vec<String>,
    destination: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReadTextParams {
    path: String,
    max_bytes: Option<usize>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MountPointParams {
    mount_point: String,
}

#[derive(Deserialize)]
struct IdsParams {
    ids: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TrashPathParams {
    trash_path: Option<String>,
}

#[derive(Deserialize)]
struct IdParam {
    id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateSettingsParams {
    new_settings: settings::Settings,
}

#[derive(Deserialize)]
struct FavoriteParams {
    item: settings::FavoriteItem,
}

#[derive(Deserialize)]
struct PinnedFolderParams {
    folder: settings::PinnedFolder,
}
