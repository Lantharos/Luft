mod list;
mod udisks;
mod ventoy;
mod write;

use std::path::Path;
use std::process::Command;

use super::machine;
use crate::serving::Context;
use crate::stick::copy::Room;
use crate::stick::{Finished, Image, Sticks};

pub fn sticks(iso: Option<&Path>) -> Result<Sticks, String> {
    Ok(Sticks {
        sticks: list::sticks(iso)?,
        variant: machine::variant(),
    })
}

fn eject(path: &str) -> Finished {
    let _ = Command::new("udevadm").arg("settle").status();
    let released = list::fresh(path).and_then(|stick| udisks::release(&stick));
    if let Err(error) = &released {
        eprintln!("The stick couldn't be released: {error}");
    } else if let Err(error) = udisks::power_off(path) {
        eprintln!("The stick couldn't be switched off: {error}");
    }
    Finished {
        ejected: released.is_ok(),
    }
}

pub fn flash(context: &Context, stick: &str, image: &Image) -> Result<Finished, String> {
    let stick = list::find(stick, Some(&image.path))?;
    write::flash(context, &stick, image)?;
    Ok(eject(&stick.path))
}

pub fn room(stick: &str, needed: u64) -> Result<Room, String> {
    ventoy::room(&list::find(stick, None)?, needed)
}

pub fn add_to_ventoy(
    context: &Context,
    stick: &str,
    image: &Image,
    replace: bool,
) -> Result<Finished, String> {
    let found = list::find(stick, Some(&image.path))?;
    ventoy::add(context, &found, image, replace)?;
    Ok(eject(&found.path))
}
