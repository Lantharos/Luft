use std::collections::HashSet;

use super::cgroup;

const ANCESTORS: usize = 16;

pub type Listed = (u32, String, String, String, bool, bool);

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Window {
    pub pid: u32,
    pub unit: String,
    pub app: String,
    pub name: String,
    pub focused: bool,
    pub fullscreen: bool,
}

impl From<Listed> for Window {
    fn from((pid, unit, app, name, focused, fullscreen): Listed) -> Self {
        Self {
            pid,
            unit,
            app,
            name,
            focused,
            fullscreen,
        }
    }
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Label {
    pub app: String,
    pub name: String,
}

pub fn foreground(windows: &[Window]) -> HashSet<&str> {
    windows
        .iter()
        .filter(|window| window.focused || window.fullscreen)
        .map(|window| window.unit.as_str())
        .collect()
}

pub fn protected(windows: &[Window]) -> Option<&str> {
    let first = |pick: fn(&Window) -> bool| windows.iter().find(|window| pick(window));
    first(|window| window.focused && window.fullscreen)
        .or_else(|| first(|window| window.fullscreen))
        .or_else(|| first(|window| window.focused))
        .map(|window| window.unit.as_str())
}

pub fn label(windows: &[Window], unit: &str, biggest: Option<u32>) -> Label {
    let owned: Vec<&Window> = windows
        .iter()
        .filter(|window| window.unit == unit)
        .collect();
    let by_process = std::iter::successors(biggest, |&pid| {
        cgroup::parent(pid).filter(|&parent| parent > 1)
    })
    .take(ANCESTORS)
    .find_map(|pid| owned.iter().find(|window| window.pid == pid));
    by_process
        .or_else(|| owned.first())
        .map(|window| Label {
            app: window.app.clone(),
            name: window.name.clone(),
        })
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn window(pid: u32, unit: &str, name: &str, focused: bool, fullscreen: bool) -> Window {
        Window {
            pid,
            unit: unit.to_owned(),
            app: String::new(),
            name: name.to_owned(),
            focused,
            fullscreen,
        }
    }

    #[test]
    fn a_fullscreen_game_is_protected_even_while_another_screen_has_focus() {
        let windows = [
            window(10, "chat.scope", "Chat", true, false),
            window(20, "steam.scope", "Cyberpunk 2077", false, true),
        ];
        assert_eq!(protected(&windows), Some("steam.scope"));
        assert_eq!(
            foreground(&windows),
            HashSet::from(["chat.scope", "steam.scope"])
        );
    }

    #[test]
    fn otherwise_the_focused_app_is() {
        let windows = [
            window(10, "editor.scope", "Editor", true, false),
            window(20, "browser.scope", "Browser", false, false),
        ];
        assert_eq!(protected(&windows), Some("editor.scope"));
        assert_eq!(
            protected(&[window(20, "browser.scope", "Browser", false, false)]),
            None
        );
    }

    #[test]
    fn names_the_window_of_the_process_using_the_most() {
        let own = std::process::id();
        let windows = [
            window(1, "steam.scope", "Steam", false, false),
            window(own, "steam.scope", "Cyberpunk 2077", true, true),
        ];
        assert_eq!(
            label(&windows, "steam.scope", Some(own)).name,
            "Cyberpunk 2077"
        );
        assert_eq!(label(&windows, "steam.scope", None).name, "Steam");
        assert_eq!(label(&windows, "other.scope", Some(own)), Label::default());
    }

    #[test]
    fn or_of_the_closest_process_above_it_with_a_window() {
        let parent = cgroup::parent(std::process::id()).unwrap();
        let windows = [
            window(1, "browser.scope", "Other window", false, false),
            window(parent, "browser.scope", "Browser", true, false),
        ];
        assert_eq!(
            label(&windows, "browser.scope", Some(std::process::id())).name,
            "Browser"
        );
    }
}
