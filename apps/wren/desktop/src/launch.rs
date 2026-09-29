use std::path::Path;

use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Activation {
    pub arguments: Vec<String>,
    pub working_directory: Option<String>,
}

pub fn folders(arguments: &[String], working_directory: Option<&Path>) -> Vec<String> {
    arguments
        .iter()
        .filter(|argument| !argument.starts_with('-'))
        .filter_map(|argument| {
            let path = Path::new(argument);
            let path = match working_directory {
                Some(directory) if path.is_relative() => directory.join(path),
                _ => path.to_path_buf(),
            };
            path.is_dir()
                .then(|| path.canonicalize().ok())
                .flatten()
                .map(|path| path.to_string_lossy().into_owned())
        })
        .collect()
}

pub fn activation_folders(activation: Activation) -> Result<Vec<String>, String> {
    Ok(folders(
        activation.arguments.get(1..).unwrap_or_default(),
        activation.working_directory.as_deref().map(Path::new),
    ))
}
