mod chooser;
mod drives;
mod file_actions;
mod fs_ops;
mod operations_queue;
mod platform;
mod portal_backend;
mod settings;
mod system_status;
mod trash_manager;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            #[cfg(target_os = "linux")]
            if let Some(window) = app.get_webview_window("main") {
                platform::linux::background_effect::install(&window);
            }

            // Initialize operation queue
            let queue = operations_queue::OperationsQueue::new();
            app.manage(queue);

            // Initialize settings
            let settings = settings::Settings::load_or_default();
            app.manage(parking_lot::RwLock::new(settings));

            let chooser_state =
                chooser::ChooserState::new(chooser::ChooserSession::from_environment());
            chooser::configure_window(app, &chooser_state);
            app.manage(chooser_state);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Debug)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // File system operations
            fs_ops::list_directory,
            fs_ops::get_file_info,
            fs_ops::create_file,
            fs_ops::create_directory,
            fs_ops::rename_item,
            file_actions::copy_items,
            file_actions::move_items,
            file_actions::delete_items,
            fs_ops::get_home_dir,
            fs_ops::get_user_dirs,
            fs_ops::read_text_file,
            fs_ops::open_with_default,
            fs_ops::get_thumbnail,
            // Drives
            drives::list_drives,
            drives::get_drive_info,
            // Trash
            trash_manager::list_trash,
            trash_manager::restore_from_trash,
            trash_manager::delete_permanently,
            trash_manager::empty_trash,
            trash_manager::move_to_trash,
            // Operations queue
            operations_queue::get_queue_status,
            operations_queue::cancel_operation,
            operations_queue::pause_operation,
            operations_queue::resume_operation,
            // Settings
            settings::get_settings,
            settings::update_settings,
            settings::add_favorite,
            settings::remove_favorite,
            settings::add_pinned_folder,
            settings::remove_pinned_folder,
            system_status::get_background_effect_status,
            chooser::get_chooser_config,
            chooser::accept_chooser,
            chooser::cancel_chooser,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn run_portal_backend() -> Result<(), String> {
    portal_backend::run()
}

pub fn install_file_chooser_portal() -> Result<(), String> {
    portal_backend::install_user_portal()
}
