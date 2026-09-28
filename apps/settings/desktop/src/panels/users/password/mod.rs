mod crypt;
mod pam;

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Change {
    current: Option<String>,
    password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Outcome {
    Changed,
    WrongPassword,
}

pub fn change(Change { current, password }: Change) -> Result<Outcome, String> {
    let account = super::me()?;
    let user: String = account.get_property("UserName").map_err(super::failed)?;
    if super::has_password(&account)?
        && !current.is_some_and(|current| pam::verify(&user, &current))
    {
        return Ok(Outcome::WrongPassword);
    }
    let hashed = crypt::hash(&password)?;
    super::change("SetPassword", &(hashed.as_str(), ""))?;
    Ok(Outcome::Changed)
}
