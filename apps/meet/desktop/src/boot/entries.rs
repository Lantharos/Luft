use luft_i18n::t;

use super::load_option::{self, Partition};
use crate::L10N;

pub trait Variables {
    fn read(&self, name: &str) -> Result<Option<Vec<u8>>, String>;
    fn write(&self, name: &str, data: &[u8]) -> Result<(), String>;
}

pub fn entry(variables: &impl Variables, number: u16) -> Result<Option<Vec<u8>>, String> {
    variables.read(&load_option::variable(number))
}

pub fn order(variables: &impl Variables) -> Result<Vec<u8>, String> {
    Ok(variables.read("BootOrder")?.unwrap_or_default())
}

pub fn listed(variables: &impl Variables) -> Result<Vec<(u16, Vec<u8>)>, String> {
    let mut found = Vec::new();
    for number in load_option::numbers(&order(variables)?) {
        if let Some(option) = entry(variables, number)? {
            found.push((number, option));
        }
    }
    Ok(found)
}

fn free_number(variables: &impl Variables) -> Result<u16, String> {
    for number in 0..=u16::MAX {
        if entry(variables, number)?.is_none() {
            return Ok(number);
        }
    }
    Err(t!(L10N, "firmware-entries-full"))
}

fn set_entry(variables: &impl Variables, number: u16, option: &[u8]) -> Result<(), String> {
    variables.write(&load_option::variable(number), option)
}

fn set_order(variables: &impl Variables, order: &[u8]) -> Result<(), String> {
    variables.write("BootOrder", order)
}

pub fn add(variables: &impl Variables, partition: &Partition, loader: &str) -> Result<u16, String> {
    let number = match listed(variables)?
        .iter()
        .find(|(_, option)| load_option::starts(option, partition, loader))
    {
        Some((number, _)) => *number,
        None => free_number(variables)?,
    };
    set_entry(variables, number, &load_option::encode(partition, loader))?;
    set_order(
        variables,
        &load_option::appended(&order(variables)?, number),
    )?;
    Ok(number)
}

pub fn ensure(
    variables: &impl Variables,
    partition: &Partition,
    loader: &str,
    number: u16,
) -> Result<u16, String> {
    let wanted = load_option::encode(partition, loader);
    match entry(variables, number)? {
        Some(option) if option == wanted => {}
        Some(option) if load_option::starts(&option, partition, loader) => {
            set_entry(variables, number, &wanted)?
        }
        _ => return add(variables, partition, loader),
    }
    let order = order(variables)?;
    if !load_option::numbers(&order).any(|listed| listed == number) {
        set_order(variables, &load_option::appended(&order, number))?;
    }
    Ok(number)
}

pub fn remove(variables: &impl Variables, numbers: &[u16]) -> Result<(), String> {
    for number in numbers {
        if entry(variables, *number)?.is_some() {
            set_entry(variables, *number, &[])?;
        }
    }
    set_order(
        variables,
        &load_option::without(&order(variables)?, numbers),
    )
}

pub fn boot_next(variables: &impl Variables, number: u16) -> Result<(), String> {
    variables.write("BootNext", &number.to_le_bytes())
}
