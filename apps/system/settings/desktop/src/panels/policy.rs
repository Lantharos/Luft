use luft_app::{Commands, Empty};
use luft_policy::Policy;
use sabine::SabineWindow;

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("policy", |Empty {}| Ok::<_, String>(Policy::load()))
}
