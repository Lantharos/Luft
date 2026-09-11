use luft_config::{LuftConfig, load_config, save_config};
use luft_ipc::{
    ClientMessage, IpcRequest, IpcResponse, OutputSummary, ServerMessage, read_frame, socket_path,
    write_frame,
};
use sabine::{BridgeError, RuntimeConfig, RuntimeMode, SabineWindow};
use serde::{Deserialize, Serialize};
use std::{error::Error, os::unix::net::UnixStream, sync::Mutex, time::Duration};

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReadSettings {}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SaveSettings {
    original: LuftConfig,
    config: LuftConfig,
}

#[derive(Serialize)]
struct SettingsState {
    config: LuftConfig,
    outputs: Vec<OutputSummary>,
    outputs_error: Option<String>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct OpenTool {
    tool: SettingsTool,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
enum SettingsTool {
    Network,
    Audio,
    Bluetooth,
}

pub fn run(page: &str) -> Result<(), Box<dyn Error>> {
    let page = match page {
        "display" | "input" | "appearance" | "power" | "apps" | "network" | "audio" => page,
        _ => "appearance",
    };
    let save_guard = Mutex::new(());
    let entry = crate::web::resources::entrypoint()?;
    let window = SabineWindow::new()
        .app_id("net.aveid.luft.settings")
        .title("Luft Settings")
        .size(920, 700)
        .system_chrome()
        .opaque()
        .entry(format!("{}?surface=settings&page={page}", entry.display()))
        .runtime(RuntimeConfig {
            mode: RuntimeMode::SharedPreferred,
            allow_user_install: cfg!(debug_assertions),
            ..RuntimeConfig::default()
        })
        .bridge_typed("settings.read", |_: ReadSettings| read_settings())
        .bridge_typed("settings.save", move |request: SaveSettings| {
            let _guard = save_guard
                .lock()
                .map_err(|_| BridgeError::new("Settings could not be saved"))?;
            let current = load_config().map_err(bridge_error)?.config;
            if current != request.original {
                return Err(BridgeError::new(
                    "Settings changed elsewhere. Reload before saving your changes.",
                ));
            }
            save_config(&request.config).map_err(bridge_error)?;
            Ok(request.config)
        })
        .bridge_typed("settings.open-tool", |request: OpenTool| {
            let command = match request.tool {
                SettingsTool::Network => "nm-connection-editor",
                SettingsTool::Audio => "pavucontrol",
                SettingsTool::Bluetooth => "blueman-manager",
            };
            let mut child =
                crate::apps::spawn_command(command, std::env::var("DISPLAY").ok().as_deref())
                    .map_err(|error| {
                        BridgeError::new(format!("Could not open {command}: {error}"))
                    })?;
            std::thread::spawn(move || {
                let _ = child.wait();
            });
            Ok(())
        });
    let status = window.launch()?.wait()?;
    if !status.success() {
        return Err(format!("Luft Settings exited with {status}").into());
    }
    Ok(())
}

fn read_settings() -> Result<SettingsState, BridgeError> {
    let config = load_config().map_err(bridge_error)?.config;
    let (outputs, outputs_error) = match connected_outputs() {
        Ok(outputs) => (outputs, None),
        Err(error) => (Vec::new(), Some(error.to_string())),
    };
    Ok(SettingsState {
        config,
        outputs,
        outputs_error,
    })
}

fn connected_outputs() -> Result<Vec<OutputSummary>, Box<dyn Error>> {
    let mut stream = UnixStream::connect(socket_path())?;
    let timeout = Some(Duration::from_secs(1));
    stream.set_read_timeout(timeout)?;
    stream.set_write_timeout(timeout)?;
    write_frame(
        &mut stream,
        &ClientMessage::Request {
            id: 1,
            request: IpcRequest::ListOutputs,
        },
    )?;
    match read_frame::<ServerMessage>(&mut stream)? {
        ServerMessage::Response {
            response: IpcResponse::Outputs { outputs },
            ..
        } => Ok(outputs),
        ServerMessage::Response {
            response: IpcResponse::Error { message },
            ..
        } => Err(message.into()),
        _ => Err("Could not read the connected displays".into()),
    }
}

fn bridge_error(error: impl std::fmt::Display) -> BridgeError {
    BridgeError::new(error.to_string())
}
