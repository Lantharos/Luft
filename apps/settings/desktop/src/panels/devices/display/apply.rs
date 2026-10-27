use std::collections::HashMap;

use serde::Deserialize;
use specta::Type;
use zbus::Variant;

use super::state::{self, MonitorInfo};

const PERSISTENT: u32 = 2;
const PASSED_THROUGH: [&str; 2] = ["color-mode", "rgb-range"];

type MonitorConfig = (String, String, HashMap<&'static str, Variant<'static>>);
type LogicalConfig = (i32, i32, f64, u32, bool, Vec<MonitorConfig>);

#[derive(Deserialize, Type)]
pub struct Apply {
    serial: u32,
    logical: Vec<Logical>,
}

#[derive(Deserialize, Type)]
struct Logical {
    x: i32,
    y: i32,
    scale: f64,
    transform: u32,
    primary: bool,
    monitors: Vec<Output>,
}

#[derive(Deserialize, Type)]
struct Output {
    connector: String,
    mode: String,
}

fn monitor_properties(
    monitors: &[MonitorInfo],
    connector: &str,
) -> HashMap<&'static str, Variant<'static>> {
    let Some((_, _, properties)) = monitors.iter().find(|((name, ..), ..)| name == connector)
    else {
        return HashMap::new();
    };
    let mut passed: HashMap<&'static str, Variant<'static>> = PASSED_THROUGH
        .into_iter()
        .filter_map(|key| Some((key, Variant::from(state::number(properties, key)?))))
        .collect();
    if properties.contains_key("is-underscanning") {
        passed.insert(
            "underscanning",
            Variant::from(state::flag(properties, "is-underscanning")),
        );
    }
    passed
}

pub async fn apply(Apply { serial, logical }: Apply) -> Result<(), String> {
    let proxy = state::proxy().await?;
    let (_, monitors, _, properties) = state::read(&proxy).await?;
    let config: Vec<LogicalConfig> = logical
        .into_iter()
        .map(|logical| {
            let outputs = logical
                .monitors
                .into_iter()
                .map(|output| {
                    let passed = monitor_properties(&monitors, &output.connector);
                    (output.connector, output.mode, passed)
                })
                .collect();
            (
                logical.x,
                logical.y,
                logical.scale,
                logical.transform,
                logical.primary,
                outputs,
            )
        })
        .collect();
    let mut options: HashMap<&str, Variant> = HashMap::new();
    if state::flag(&properties, "supports-changing-layout-mode")
        && let Some(layout) = state::number(&properties, "layout-mode")
    {
        options.insert("layout-mode", Variant::from(layout));
    }
    proxy
        .call_method(
            "ApplyMonitorsConfig",
            &(serial, PERSISTENT, config, options),
        )
        .await
        .map(|_| ())
        .map_err(|error| error.to_string())
}
