use anyhow::{Context, Result};
use luft_meet::resize::{Request, VARIABLE};

use super::variables;

pub fn read() -> Result<Option<Request>> {
    let Some(bytes) = variables::read(VARIABLE)? else {
        return Ok(None);
    };
    let request = Request::parse(&bytes)
        .map_err(anyhow::Error::msg)
        .context("Luft's resize request isn't readable")?;
    Ok(Some(request))
}

pub fn clear() -> Result<()> {
    variables::clear(VARIABLE)
}
