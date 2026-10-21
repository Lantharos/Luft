use luft_app::Activation;

pub fn folders(activation: &Activation) -> Vec<String> {
    activation
        .paths()
        .filter(|path| path.is_dir())
        .filter_map(|path| path.canonicalize().ok())
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

pub fn activation_folders(activation: Activation) -> Result<Vec<String>, String> {
    Ok(folders(&activation))
}
