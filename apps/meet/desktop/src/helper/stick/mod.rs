mod disk;
mod eject;
mod list;
mod ventoy;
mod write;

use std::path::Path;

use super::Context;
use super::system::facts;
use crate::check::facts::variant_for;
use crate::stick::copy::Room;
use crate::stick::drives::windows::Disk;
use crate::stick::{Finished, Image, Sticks};

pub fn sticks(iso: Option<&Path>) -> Result<Sticks, String> {
    Ok(Sticks {
        sticks: list::sticks(iso)?,
        variant: variant_for(&facts::graphics()),
    })
}

fn ejected(stick: &Disk) -> Finished {
    Finished {
        ejected: stick.Path.as_deref().is_some_and(eject::eject),
    }
}

pub fn flash(context: &Context, stick: &str, image: &Image) -> Result<Finished, String> {
    let (storage, stick) = list::find(stick, Some(&image.path))?;
    write::flash(context, &storage, &stick, image)?;
    Ok(ejected(&stick))
}

pub fn room(stick: &str, needed: u64) -> Result<Room, String> {
    let (storage, stick) = list::find(stick, None)?;
    ventoy::room(&storage, &stick, needed)
}

pub fn add_to_ventoy(
    context: &Context,
    stick: &str,
    image: &Image,
    replace: bool,
) -> Result<Finished, String> {
    let (storage, stick) = list::find(stick, Some(&image.path))?;
    ventoy::add(context, &storage, &stick, image, replace)?;
    Ok(ejected(&stick))
}
