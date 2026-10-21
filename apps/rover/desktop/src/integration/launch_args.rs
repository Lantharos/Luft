use luft_app::Activation;
use url::Url;

pub fn resolve(activation: &Activation) -> Vec<String> {
    let mut paths: Vec<String> = Vec::new();
    for path in activation
        .arguments()
        .iter()
        .filter_map(|argument| target(activation, argument))
    {
        if !paths.contains(&path) {
            paths.push(path);
        }
    }
    paths
}

fn target(activation: &Activation, argument: &str) -> Option<String> {
    if let Ok(url) = Url::parse(argument)
        && url.scheme() != "file"
        && url.has_host()
    {
        return Some(argument.to_owned());
    }
    let path = activation.path(argument)?;
    let path = path.canonicalize().unwrap_or(path);
    Some(path.to_string_lossy().into_owned())
}
