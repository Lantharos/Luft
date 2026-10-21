use luft_app::Activation;

pub fn resolve(activation: &Activation) -> Vec<String> {
    let mut paths: Vec<String> = Vec::new();
    for path in activation.paths() {
        let path = path.to_string_lossy().into_owned();
        if !paths.contains(&path) {
            paths.push(path);
        }
    }
    paths
}
