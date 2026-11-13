use std::sync::LazyLock;

use regex::Regex;
use toml::{Table, Value};

use super::ConfigIssue;
use super::check::{Checker, Text, Words, at};
use super::permissions::shown;

pub const PERMISSIONS: [(&str, &str); 19] = [
    ("wallpaper", "Draw over the wallpaper"),
    ("quick-settings", "Add tiles to quick settings"),
    ("taskbar", "Add buttons to the taskbar"),
    ("search", "Add results to search"),
    ("notifications", "Send notifications"),
    ("weather", "See the weather where you are"),
    ("location", "See roughly where you are"),
    ("media", "See and control what's playing"),
    ("popups", "Show panels and small windows"),
    ("typing", "Type into other apps"),
    ("sounds", "Play sounds"),
    ("audio-levels", "Follow the beat of what's playing"),
    ("calls", "Know when you're in a call"),
    (
        "locked-sounds",
        "Keep playing sounds while the screen is locked",
    ),
    (
        "input-sounds",
        "Play a sound when you type and click, without seeing your keys",
    ),
    ("do-not-disturb", "Hold back notifications for a while"),
    (
        "screen-effects",
        "Draw over and change how your windows and the whole screen look",
    ),
    ("clipboard", "Copy to your clipboard"),
    (
        "file-actions",
        "Add to the menu of files and folders in Rover",
    ),
];
const HELPER_LABEL: &str = "Runs its own program";

static HOST: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"^(localhost|127\.0\.0\.1|[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+)(:\d{1,5})?$",
    )
    .unwrap()
});

#[derive(Clone, Debug, PartialEq)]
pub struct ListenPort {
    pub port: i64,
    pub protocol: String,
}

/// What an extension's manifest asks for.
#[derive(Clone, Debug, PartialEq)]
pub struct ExtensionAccess {
    pub permissions: Vec<String>,
    pub helper: bool,
    pub network: Option<Vec<String>>,
    pub listen: Option<Vec<ListenPort>>,
}

/// Joins `items` the way English lists them: a, b, and c.
pub fn conjunction(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [only] => only.clone(),
        [first, second] => format!("{first} and {second}"),
        [rest @ .., last] => format!("{}, and {last}", rest.join(", ")),
    }
}

fn unique<T: PartialEq + Clone>(items: &[T], same: impl Fn(&T, &T) -> bool) -> Vec<T> {
    let mut kept: Vec<T> = Vec::new();
    for item in items {
        if !kept.iter().any(|other| same(other, item)) {
            kept.push(item.clone());
        }
    }
    kept
}

fn listen(checker: &mut Checker, path: &[String], value: &Value) -> Option<ListenPort> {
    let table = checker.table(path, Some(value))?;
    let port = checker.whole(&at(path, "port"), table.get("port"), Some(1), Some(65535));
    let protocol = checker.choice(
        &at(path, "protocol"),
        table.get("protocol"),
        &["tcp", "udp"],
        None,
    );
    Some(ListenPort {
        port: port?,
        protocol: protocol?,
    })
}

fn network(checker: &mut Checker, value: &Value) -> Option<(Vec<String>, Vec<ListenPort>)> {
    let path = vec!["network".to_owned()];
    let table = checker.table(&path, Some(value))?;
    let since = checker.issues.len();
    let hosts = match table.get("hosts") {
        None => Some(Vec::new()),
        value => checker.list(
            &at(&path, "hosts"),
            value,
            None,
            None,
            |checker, path, host| {
                checker.text(
                    path,
                    Some(host),
                    &[Text::Pattern(
                        &HOST,
                        "A host is a name such as api.example.com",
                    )],
                )
            },
        ),
    };
    let ports = match table.get("listen") {
        None => Some(Vec::new()),
        value => checker.list(&at(&path, "listen"), value, None, None, listen),
    };
    checker.clean(since).then_some(())?;
    let (hosts, ports) = (hosts?, ports?);
    if hosts.is_empty() && ports.is_empty() {
        checker.issue(
            &path,
            "[network] names hosts to connect to or ports to listen on",
        );
        return None;
    }
    Some((hosts, ports))
}

fn access(checker: &mut Checker, table: &Table) -> Option<ExtensionAccess> {
    let names: Vec<&str> = PERMISSIONS.iter().map(|(name, _)| *name).collect();
    let permissions = match table.get("permissions") {
        None => Some(Vec::new()),
        value => checker.list(
            &["permissions".to_owned()],
            value,
            None,
            None,
            |checker, path, value| {
                let refusal = |value: Option<&Value>| {
                    format!(
                        "{} isn't a permission an extension can ask for.",
                        shown(value)
                    )
                };
                checker.choice(path, Some(value), &names, Some(&refusal))
            },
        ),
    };
    let helper = match table.get("helper") {
        None => Some(false),
        value => checker.table(&["helper".to_owned()], value).map(|_| true),
    };
    let reached = match table.get("network") {
        None => Some((Vec::new(), Vec::new())),
        Some(value) => network(checker, value),
    };
    let (hosts, ports) = reached?;
    let hosts = unique(&hosts, |a, b| a == b);
    let ports = unique(&ports, |a, b| a.port == b.port && a.protocol == b.protocol);
    Some(ExtensionAccess {
        permissions: unique(&permissions?, |a, b| a == b),
        helper: helper?,
        network: (!hosts.is_empty()).then_some(hosts),
        listen: (!ports.is_empty()).then_some(ports),
    })
}

/// Reads what an extension's manifest asks for.
pub fn read(file: &str, text: &str) -> Result<ExtensionAccess, Vec<ConfigIssue>> {
    let table: Table = text.parse().map_err(|error: toml::de::Error| {
        vec![ConfigIssue {
            file: file.to_owned(),
            key: None,
            message: error.message().to_owned(),
            allowed: None,
        }]
    })?;
    let mut checker = Checker::new(file, Words::Schema);
    match access(&mut checker, &table) {
        Some(access) if checker.issues.is_empty() => Ok(access),
        _ => Err(checker.issues),
    }
}

/// What an extension can do, in words its store page shows.
pub fn labels(access: &ExtensionAccess) -> Vec<String> {
    let mut labels: Vec<String> = access
        .permissions
        .iter()
        .filter_map(|name| PERMISSIONS.iter().find(|(known, _)| known == name))
        .map(|(_, label)| (*label).to_owned())
        .collect();
    if let Some(hosts) = access.network.as_ref().filter(|hosts| !hosts.is_empty()) {
        labels.push(format!("Connect to {}", conjunction(hosts)));
    }
    if let Some(ports) = access.listen.as_ref().filter(|ports| !ports.is_empty()) {
        let numbers = unique(
            &ports
                .iter()
                .map(|port| port.port.to_string())
                .collect::<Vec<_>>(),
            |a, b| a == b,
        );
        labels.push(format!(
            "Take connections from devices on your network, on port {}",
            conjunction(&numbers)
        ));
    }
    if access.helper {
        labels.push(HELPER_LABEL.to_owned());
    }
    labels
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_what_a_manifest_asks_for_with_its_helper() {
        let access = read(
            "extension.toml",
            "id = \"io.github.alice.Clock\"\napi = 1\npermissions = [\"wallpaper\", \"weather\"]\n\n[helper]\npath = \"clock-helper\"\n",
        )
        .unwrap();
        assert!(access.helper && access.network.is_none());
        assert_eq!(
            labels(&access),
            [
                "Draw over the wallpaper",
                "See the weather where you are",
                "Runs its own program"
            ]
        );
    }

    #[test]
    fn reads_the_hosts_it_connects_to_and_the_ports_it_listens_on() {
        let hosts = read(
            "extension.toml",
            "permissions = [\"taskbar\"]\n\n[network]\nhosts = [\"app.pult.sh\"]\n",
        )
        .unwrap();
        assert_eq!(
            labels(&hosts),
            ["Add buttons to the taskbar", "Connect to app.pult.sh"]
        );
        let ports = read(
            "extension.toml",
            "permissions = [\"clipboard\"]\n\n[network]\nlisten = [{ port = 53317, protocol = \"tcp\" }, { port = 53317, protocol = \"udp\" }]\n",
        )
        .unwrap();
        assert_eq!(ports.listen.as_ref().map(Vec::len), Some(2));
        assert_eq!(
            labels(&ports),
            [
                "Copy to your clipboard",
                "Take connections from devices on your network, on port 53317"
            ]
        );
    }

    #[test]
    fn refuses_a_permission_the_extension_api_doesnt_have() {
        assert!(read("extension.toml", "permissions = [\"camera\"]\n").is_err());
    }
}
