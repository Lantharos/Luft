use luft_app::Activation;
use serde::Serialize;
use url::Url;

pub const REVEAL: &str = "--reveal";

#[derive(Clone, Serialize)]
pub struct Launch {
    paths: Vec<String>,
    reveal: bool,
}

pub fn resolve(activation: &Activation) -> Launch {
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
    Launch {
        paths,
        reveal: activation.arguments().iter().any(|argument| argument == REVEAL),
    }
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
