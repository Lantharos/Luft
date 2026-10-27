use luft_app::Events;
use sabine::{SabineResult, SabineWindow};

fn main() -> SabineResult<()> {
    luft_network::register(SabineWindow::new(), &Events::default())
        .launch()
        .map(drop)
}
