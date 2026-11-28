#[derive(Clone, Debug, PartialEq, Eq)]
pub struct App {
    pub unit: String,
    pub bytes: u64,
    pub foreground: bool,
    pub growing: bool,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Choice<'a> {
    Close(&'a App),
    Warn(&'a App),
    Nothing,
}

impl App {
    pub fn past_its_share(&self, budget: u64) -> bool {
        self.bytes > budget + budget / 4
    }

    pub fn blamed(&self, budget: u64) -> bool {
        self.growing && (!self.foreground || self.past_its_share(budget))
    }
}

pub fn next(apps: &[App], budget: u64) -> Option<&App> {
    let biggest = |pick: &dyn Fn(&App) -> bool| {
        apps.iter()
            .filter(|app| pick(app))
            .max_by_key(|app| app.bytes)
    };
    biggest(&|app| app.blamed(budget))
        .or_else(|| biggest(&|app| !app.foreground))
        .or_else(|| biggest(&|app| app.foreground))
}

pub fn choose<'a>(apps: &'a [App], budget: u64, warned: impl Fn(&str) -> bool) -> Choice<'a> {
    match next(apps, budget) {
        Some(app) if app.foreground && !warned(&app.unit) => Choice::Warn(app),
        Some(app) => Choice::Close(app),
        None => Choice::Nothing,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;
    const BUDGET: u64 = 8 * GIB;

    fn app(unit: &str, gigabytes: u64, foreground: bool, growing: bool) -> App {
        App {
            unit: unit.to_owned(),
            bytes: gigabytes * GIB,
            foreground,
            growing,
        }
    }

    fn unit(choice: Choice) -> String {
        match choice {
            Choice::Close(app) => format!("close {}", app.unit),
            Choice::Warn(app) => format!("warn {}", app.unit),
            Choice::Nothing => "nothing".to_owned(),
        }
    }

    #[test]
    fn closes_the_biggest_background_app_before_a_big_stable_game() {
        let apps = [
            app("game", 9, true, false),
            app("browser", 3, false, false),
            app("chat", 1, false, false),
        ];
        assert_eq!(unit(choose(&apps, BUDGET, |_| true)), "close browser");
        assert_eq!(unit(choose(&apps[..1], BUDGET, |_| true)), "close game");
    }

    #[test]
    fn closes_the_focused_app_only_once_warned_about_it() {
        let apps = [app("game", 9, true, false)];
        assert_eq!(unit(choose(&apps, BUDGET, |_| false)), "warn game");
        assert_eq!(
            unit(choose(&apps, BUDGET, |unit| unit == "game")),
            "close game"
        );
    }

    #[test]
    fn a_focused_app_that_keeps_growing_past_its_share_goes_first() {
        let apps = [app("leak", 11, true, true), app("browser", 3, false, false)];
        assert_eq!(unit(choose(&apps, BUDGET, |_| false)), "warn leak");
        assert_eq!(unit(choose(&apps, BUDGET, |_| true)), "close leak");
    }

    #[test]
    fn a_focused_app_growing_within_its_share_keeps_its_place() {
        let apps = [
            app("loading", 7, true, true),
            app("browser", 3, false, false),
        ];
        assert_eq!(unit(choose(&apps, BUDGET, |_| true)), "close browser");
    }

    #[test]
    fn a_growing_background_app_goes_before_bigger_ones() {
        let apps = [
            app("browser", 6, false, false),
            app("leak", 2, false, true),
            app("game", 9, true, false),
        ];
        assert_eq!(unit(choose(&apps, BUDGET, |_| false)), "close leak");
    }

    #[test]
    fn nothing_left_means_nothing_to_do() {
        assert_eq!(unit(choose(&[], BUDGET, |_| true)), "nothing");
    }
}
