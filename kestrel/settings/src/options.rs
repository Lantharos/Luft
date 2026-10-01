use crate::modules::Module;

pub struct Options {
    pub modules: Vec<Module>,
}

impl Options {
    pub fn parse(mut args: impl Iterator<Item = String>) -> Result<Self, String> {
        let mut options = Self {
            modules: Module::ALL.to_vec(),
        };
        while let Some(arg) = args.next() {
            match arg.as_str() {
                "--modules" => {
                    let names = args.next().ok_or("--modules needs a list of modules")?;
                    options.modules = names
                        .split(',')
                        .map(|name| {
                            Module::named(name).ok_or(format!("There's no module called {name}"))
                        })
                        .collect::<Result<_, _>>()?;
                }
                _ => return Err(format!("Unknown argument {arg}")),
            }
        }
        Ok(options)
    }
}
