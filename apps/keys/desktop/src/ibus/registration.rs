use std::collections::HashMap;

use zbus::zvariant::{StructureBuilder, Value};

use crate::method::{Summary, engine_name};

pub const COMPONENT: &str = "com.lantharos.keys.InputMethods";

const VERSION: &str = env!("CARGO_PKG_VERSION");
const LICENSE: &str = "MIT";
const AUTHOR: &str = "Keys";
const HOMEPAGE: &str = "https://github.com/Lantharos/Luft";
const ICON: &str = "input-keyboard-symbolic";
const LAYOUT: &str = "default";
const LANGUAGE_NEUTRAL: &str = "other";

type Attachments = HashMap<String, Value<'static>>;

fn symbol(method: &Summary) -> String {
    let label = method.label.trim();
    if label.is_empty() {
        method.name.chars().take(2).collect()
    } else {
        label.to_owned()
    }
}

fn engine(method: &Summary) -> Result<Value<'static>, String> {
    let language = if method.language.is_empty() {
        LANGUAGE_NEUTRAL
    } else {
        &method.language
    };
    let mut builder = StructureBuilder::new()
        .add_field("IBusEngineDesc".to_owned())
        .add_field(Attachments::new());
    for text in [
        &engine_name(&method.id),
        &method.name,
        &method.name,
        language,
        LICENSE,
        AUTHOR,
        ICON,
        LAYOUT,
    ] {
        builder = builder.add_field(text.to_owned());
    }
    builder = builder.add_field(0u32);
    for text in ["", &symbol(method), "", "", "", VERSION, "", ""] {
        builder = builder.add_field(text.to_owned());
    }
    builder
        .build()
        .map(Value::from)
        .map_err(|error| error.to_string())
}

pub fn component(methods: &[Summary], exec: String) -> Result<Value<'static>, String> {
    let engines = methods.iter().map(engine).collect::<Result<Vec<_>, _>>()?;
    Ok(Value::from((
        "IBusComponent".to_owned(),
        Attachments::new(),
        COMPONENT.to_owned(),
        "Input methods made with Keys".to_owned(),
        VERSION.to_owned(),
        LICENSE.to_owned(),
        AUTHOR.to_owned(),
        HOMEPAGE.to_owned(),
        exec,
        String::new(),
        Vec::<Value<'static>>::new(),
        engines,
    )))
}
