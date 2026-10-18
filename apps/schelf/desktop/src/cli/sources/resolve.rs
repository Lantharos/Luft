use super::{Candidate, Catalog, Kind, fedora};

const SUGGESTIONS: usize = 2;

pub enum Resolved {
    One(Candidate),
    Several(Vec<Candidate>),
    Nothing { suggestions: Vec<Candidate> },
}

fn across<T: Send>(
    catalogs: &[Catalog],
    work: impl Fn(Catalog) -> Result<Vec<T>, String> + Sync,
) -> Vec<Result<Vec<T>, String>> {
    std::thread::scope(|scope| {
        let workers: Vec<_> = catalogs
            .iter()
            .map(|&catalog| {
                let work = &work;
                scope.spawn(move || work(catalog))
            })
            .collect();
        workers
            .into_iter()
            .map(|worker| {
                worker
                    .join()
                    .unwrap_or_else(|panic| std::panic::resume_unwind(panic))
            })
            .collect()
    })
}

pub fn catalogs(only: Option<Catalog>) -> Vec<Catalog> {
    only.map_or_else(|| Catalog::ALL.to_vec(), |catalog| vec![catalog])
}

fn by_kind(mut found: Vec<Candidate>) -> Resolved {
    let [first, second] = &mut found[..] else {
        return Resolved::Several(found);
    };
    let (app, tool) = match (first.catalog, second.catalog) {
        (Catalog::Flathub, Catalog::Fedora) => (first, second),
        (Catalog::Fedora, Catalog::Flathub) => (second, first),
        _ => return Resolved::Several(found),
    };
    if fedora::graphical(&tool.id) {
        tool.kind = Kind::Desktop;
    }
    match (app.kind, tool.kind) {
        (Kind::Desktop, Kind::Desktop) => Resolved::One(app.clone()),
        (Kind::Command, Kind::Command) => Resolved::One(tool.clone()),
        _ => Resolved::Several(found),
    }
}

pub fn resolve(name: &str, only: Option<Catalog>) -> Result<Resolved, String> {
    let catalogs = catalogs(only);
    let mut found: Vec<Candidate> = across(&catalogs, |catalog| catalog.find(name))
        .into_iter()
        .collect::<Result<Vec<_>, _>>()?
        .into_iter()
        .flatten()
        .collect();
    match found.len() {
        0 => {
            let suggestions = across(&catalogs, |catalog| {
                catalog.search(name).map(|mut found| {
                    found.truncate(SUGGESTIONS);
                    found
                })
            })
            .into_iter()
            .flatten()
            .flatten()
            .collect();
            Ok(Resolved::Nothing { suggestions })
        }
        1 => Ok(Resolved::One(found.remove(0))),
        _ => Ok(by_kind(found)),
    }
}

pub fn search(
    query: &str,
    only: Option<Catalog>,
) -> Vec<(Catalog, Result<Vec<Candidate>, String>)> {
    let catalogs = catalogs(only);
    let found = across(&catalogs, |catalog| catalog.search(query));
    catalogs.into_iter().zip(found).collect()
}
