mod actions;
mod answer;
mod reads;
mod shapes;

use sabine::SabineWindow;

pub fn register(window: SabineWindow) -> SabineWindow {
    actions::register(reads::register(window))
}
