mod frame;
mod player;

use std::path::Path;

use frame::Frame;
use player::Player;

const POSITIONS_PERCENT: [u64; 4] = [10, 25, 40, 60];

pub fn write(input: &Path, size: u32, output: &Path) -> Result<(), String> {
    representative(&Player::open(input, size)?)?.save(output)
}

fn representative(player: &Player) -> Result<Frame, String> {
    let opening = player.preroll()?;
    let Some(duration) = player.duration() else {
        return Ok(opening);
    };
    let mut best = opening;
    let mut seen = vec![best.timestamp];
    for percent in POSITIONS_PERCENT {
        let frame = player.seek(duration * percent / 100)?;
        if seen.contains(&frame.timestamp) {
            continue;
        }
        if frame.has_content() {
            return Ok(frame);
        }
        seen.push(frame.timestamp);
        if frame.detail() > best.detail() {
            best = frame;
        }
    }
    Ok(best)
}
