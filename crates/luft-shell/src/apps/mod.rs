use crate::panel::PanelApp;

mod desktop_entry;
mod icon_theme;
mod xdg;

pub use desktop_entry::{AppEntry, discover_applications, discover_user_autostart, launch_desktop};
pub(crate) use icon_theme::resolve_icon_path;

use luft_config::{ConfigPaths, LuftConfig};
use std::{
    env,
    fs::OpenOptions,
    io,
    path::PathBuf,
    process::{Child, Command, Stdio},
};

pub fn shell_apps(config: &LuftConfig) -> (Vec<PanelApp>, Vec<AppEntry>) {
    let applications = discover_applications(config);
    let panel = panel_apps_from(config, &applications);
    let launcher = launcher_apps_from(applications, &panel);
    (panel, launcher)
}

pub fn panel_apps_from(config: &LuftConfig, applications: &[AppEntry]) -> Vec<PanelApp> {
    if config.panel.customized || !config.panel.pinned.is_empty() {
        return config
            .panel
            .pinned
            .iter()
            .map(|app| {
                let matched = applications
                    .iter()
                    .find(|entry| commands_match(&entry.command, &app.command));
                let icon_path = matched
                    .and_then(|entry| entry.icon_path.clone())
                    .or_else(|| resolve_icon_path(app.icon.as_deref()));
                PanelApp::new(
                    app.label.clone(),
                    normalize_launch_command(&app.command),
                    icon_path,
                )
            })
            .collect();
    }

    vec![
        default_panel_app(
            "Terminal",
            &config.default_apps.terminal,
            &[
                &config.default_apps.terminal,
                "com.mitchellh.ghostty",
                "ghostty",
                "utilities-terminal",
                "org.wezfurlong.wezterm",
                "Alacritty",
                "kitty",
                "Terminal",
            ],
            applications,
        ),
        default_panel_app(
            "Files",
            &config.default_apps.file_manager,
            &[
                &config.default_apps.file_manager,
                "system-file-manager",
                "org.kde.dolphin",
                "dolphin",
                "Thunar",
            ],
            applications,
        ),
        default_panel_app(
            "Browser",
            &config.default_apps.browser,
            &[
                &config.default_apps.browser,
                "web-browser",
                "google-chrome-stable",
                "google-chrome",
                "Google Chrome",
                "chromium",
                "firefox",
                "org.mozilla.firefox",
                "brave-browser",
            ],
            applications,
        ),
    ]
}

pub fn launcher_apps_from(applications: Vec<AppEntry>, fallback: &[PanelApp]) -> Vec<AppEntry> {
    if !applications.is_empty() {
        return applications;
    }

    fallback
        .iter()
        .map(|app| AppEntry {
            desktop_id: None,
            name: app.label.clone(),
            command: normalize_launch_command(&app.command),
            comment: None,
            icon: None,
            icon_path: None,
            startup_wm_class: None,
        })
        .collect()
}

pub fn spawn_command(command: &str, xwayland_display: Option<&str>) -> io::Result<Child> {
    let command = normalize_launch_command(command);
    log_app_launch(&command);
    let mut child = if let Some(path) = command.strip_prefix("desktop:") {
        let mut child = Command::new(env::current_exe()?);
        child.arg("--launch-desktop").arg(path);
        silence_stdio(&mut child);
        child
    } else {
        command_for_launch(&command)
    };
    apply_app_environment(&mut child, xwayland_display);
    child.spawn()
}

pub(crate) fn normalize_launch_command(command: &str) -> String {
    command.trim().to_owned()
}

fn command_for_launch(command: &str) -> Command {
    if let Some(argv) = shell_words(command) {
        let mut child = Command::new(&argv[0]);
        child.args(&argv[1..]);
        silence_stdio(&mut child);
        return child;
    }

    let mut child = Command::new("sh");
    child.arg("-lc").arg(command);
    silence_stdio(&mut child);
    child
}

fn silence_stdio(command: &mut Command) {
    command.stdin(Stdio::null());
    if let Some(log) = app_launch_log() {
        let stdout = log.try_clone().ok().map(Stdio::from);
        command.stdout(stdout.unwrap_or_else(Stdio::null));
        command.stderr(Stdio::from(log));
    } else {
        command.stdout(Stdio::null()).stderr(Stdio::null());
    }
}

fn shell_words(command: &str) -> Option<Vec<String>> {
    if command.contains([';', '&', '|', '<', '>', '$', '`', '(', ')', '{', '}']) {
        return None;
    }
    shell_words::split(command)
        .ok()
        .filter(|words| !words.is_empty())
}

fn apply_app_environment(command: &mut Command, xwayland_display: Option<&str>) {
    command.env_remove("DISPLAY");
    command.env("XDG_CURRENT_DESKTOP", "Luft");
    command.env("XDG_SESSION_DESKTOP", "luft");
    command.env("DESKTOP_SESSION", "luft");
    command.env("XDG_SESSION_TYPE", "wayland");
    command.env("UBUNTU_MENUPROXY", "0");
    command.env("GTK_OVERLAY_SCROLLING", "0");
    if let Some(address) = env::var_os("DBUS_SESSION_BUS_ADDRESS") {
        command.env("DBUS_SESSION_BUS_ADDRESS", address);
    }
    if let Some(runtime_dir) = env::var_os("XDG_RUNTIME_DIR") {
        command.env("XDG_RUNTIME_DIR", runtime_dir);
    }
    command.env_remove("WAYLAND_DISPLAY");
    command.env_remove("WAYLAND_SOCKET");
    command.env_remove("SABINE_WAYLAND_BROKER_FD");
    command.env_remove("SABINE_WAYLAND_BROKER_KEY");
    command.env_remove(luft_ipc::SHELL_CAPABILITY_ENV);
    command.env_remove(luft_ipc::PORTAL_CAPABILITY_ENV);
    if let Some(display) = luft_wayland_display() {
        command.env("WAYLAND_DISPLAY", display);
    }
    if let Some(display) = xwayland_display {
        command.env("DISPLAY", display);
        command.env("_JAVA_AWT_WM_NONREPARENTING", "1");
    }
}

fn app_launch_log() -> Option<std::fs::File> {
    let path = ConfigPaths::discover().ok()?.log_file("luft-apps");
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).ok()?;
    }
    OpenOptions::new().create(true).append(true).open(path).ok()
}

fn log_app_launch(command: &str) {
    use std::io::Write;

    if let Some(mut log) = app_launch_log() {
        let _ = writeln!(log, "\n--- luft launch: {command}");
    }
}

fn default_panel_app(
    label: &str,
    command: &str,
    fallback_icons: &[&str],
    applications: &[AppEntry],
) -> PanelApp {
    let matched = applications
        .iter()
        .find(|app| commands_match(&app.command, command));
    let icon_path = matched
        .and_then(|app| app.icon_path.clone())
        .or_else(|| resolve_first_icon_path(fallback_icons));
    let label = matched
        .map(|app| app.name.clone())
        .unwrap_or_else(|| label.to_string());

    PanelApp::new(label, normalize_launch_command(command), icon_path)
}

fn resolve_first_icon_path(icons: &[&str]) -> Option<PathBuf> {
    icons.iter().find_map(|icon| {
        let command = xdg::command_name(icon).unwrap_or(icon);
        resolve_icon_path(Some(command))
    })
}

fn commands_match(left: &str, right: &str) -> bool {
    let left = normalize_launch_command(left);
    let right = normalize_launch_command(right);
    xdg::command_name(&left).is_some_and(|left| xdg::command_name(&right) == Some(left))
}

fn luft_wayland_display() -> Option<std::ffi::OsString> {
    env::var_os("LUFT_WAYLAND_DISPLAY").or_else(|| env::var_os("WAYLAND_DISPLAY"))
}
