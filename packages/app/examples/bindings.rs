use luft_app::Appearance;
use sabine::{SabineResult, SabineWindow};

fn main() -> SabineResult<()> {
    luft_app::declare_appearance(SabineWindow::new())
        .bridge_type::<Appearance>()
        .launch()
        .map(drop)
}
