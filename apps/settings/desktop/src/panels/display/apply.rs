use std::collections::HashMap;

use serde::Deserialize;
use zbus::zvariant::Value;

use super::state::{self, MonitorInfo};

const PERSISTENT: u32 = 2;
const PASSED_THROUGH: [&str; 2] = ["color-mode", "rgb-range"];

type MonitorConfig = (String, String, HashMap<&'static str, Value<'static>>);
type LogicalConfig = (i32, i32, f64, u32, bool, Vec<MonitorConfig>);

#[derive(Deserialize)]
pub struct Apply {
    serial: u32,
    logical: Vec<Logical>,
}

#[derive(Deserialize)]
struct Logical {
    x: i32,
    y: i32,
    scale: f64,
    transform: u32,
    primary: bool,
    monitors: Vec<Output>,
}

#[derive(Deserialize)]
struct Output {
    connector: String,
    mode: String,
}

fn monitor_properties(
    monitors: &[MonitorInfo],
    connector: &str,
) -> HashMap<&'static str, Value<'static>> {
    let Some((_, _, properties)) = monitors.iter().find(|((name, ..), ..)| name == connector)
    else {
        return HashMap::new();
    };
    let mut passed: HashMap<&'static str, Value<'static>> = PASSED_THROUGH
        .into_iter()
        .filter_map(|key| Some((key, Value::from(state::number(properties, key)?))))
        .collect();
    if properties.contains_key("is-underscanning") {
        passed.insert(
            "underscanning",
            Value::from(state::flag(properties, "is-underscanning")),
        );
    }
    passed
}

pub fn apply(Apply { serial, logical }: Apply) -> Result<(), String> {
    let proxy = state::proxy()?;
    let (_, monitors, _, properties) = state::read(&proxy)?;
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
    let mut options: HashMap<&str, Value> = HashMap::new();
    if state::flag(&properties, "supports-changing-layout-mode")
        && let Some(layout) = state::number(&properties, "layout-mode")
    {
        options.insert("layout-mode", Value::from(layout));
    }
    proxy
        .call_method(
            "ApplyMonitorsConfig",
            &(serial, PERSISTENT, config, options),
        )
        .map(|_| ())
        .map_err(|error| error.to_string())
}
