use luft_app::Events;
use sabine::{SabineResult, SabineWindow};

fn main() -> SabineResult<()> {
    luft_fingerprint::register(SabineWindow::new(), &Events::default())
        .launch()
        .map(drop)
}
