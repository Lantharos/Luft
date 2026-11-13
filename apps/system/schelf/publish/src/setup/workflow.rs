use super::toml::{Toml, fields, stringify, table, texts};
use crate::api::STORE_ORIGIN;
use crate::schema::listing::{ListingToml, Screenshot};
use crate::schema::{LISTING_TOML, SCHELF_TOML};

pub const SCHELF_WORKFLOW: &str = ".github/workflows/schelf.yml";
pub const SABINE_REPOSITORY: &str = "Lantharos/Sabine";
pub const PUBLISH_ACTION: &str = "Lantharos/Store/publish@v1";
pub const SCHELF_SABINE_VERSION: &str = "v0.70";

/// What `schelf init` found out about a project, to write its files from.
#[derive(Default, Clone)]
pub struct SetupInput {
    pub id: String,
    pub project: Option<String>,
    pub kind: String,
    pub format: String,
    pub permissions: Option<String>,
    pub listing: Option<String>,
    pub sabine_version: Option<String>,
    pub sabine_inputs: Option<Vec<(String, String)>>,
    pub extension_api: Option<i64>,
    pub helper: Option<(String, String)>,
    pub branch: Option<String>,
    pub updater: Option<String>,
    pub distribution: Option<String>,
    pub licence: Option<String>,
    pub repository: Option<String>,
}

fn schema_directive(file: &str) -> String {
    format!("#:schema {STORE_ORIGIN}/schemas/{file}.json\n")
}

fn sabine_version_of(input: &SetupInput) -> Option<String> {
    (input.format == "sabine").then(|| {
        input
            .sabine_version
            .clone()
            .unwrap_or_else(|| SCHELF_SABINE_VERSION.to_owned())
    })
}

pub fn schelf_toml_for(input: &SetupInput) -> String {
    let permissions = input
        .permissions
        .clone()
        .or_else(|| (input.kind == "extension").then(|| "extension.toml".to_owned()));
    let requires = fields(vec![
        (
            "sabine",
            sabine_version_of(input).map(|version| version.trim_start_matches('v').into()),
        ),
        ("extension_api", input.extension_api.map(Toml::Number)),
    ]);
    let name = match &input.project {
        Some(project) => ("project", Some(project.as_str().into())),
        None => ("id", Some(input.id.as_str().into())),
    };
    let licence = input
        .licence
        .clone()
        .filter(|_| input.distribution.as_deref() != Some("proprietary"));
    let document = fields(vec![
        name,
        ("kind", Some(input.kind.as_str().into())),
        ("format", Some(input.format.as_str().into())),
        ("updater", input.updater.clone().map(Toml::Text)),
        ("permissions", permissions.map(Toml::Text)),
        ("listing", input.listing.clone().map(Toml::Text)),
        ("distribution", input.distribution.clone().map(Toml::Text)),
        ("licence", licence.map(Toml::Text)),
        ("repository", input.repository.clone().map(Toml::Text)),
        (
            "requires",
            (!requires.is_empty()).then_some(Toml::Table(requires)),
        ),
    ]);
    format!(
        "{}{}\n",
        schema_directive(SCHELF_TOML),
        stringify(&document)
    )
}

fn screenshot(entry: &Screenshot) -> Toml {
    match entry {
        Screenshot::File(file) => file.as_str().into(),
        Screenshot::Described {
            file,
            caption,
            platform,
        } => table(vec![
            ("file", Some(file.as_str().into())),
            ("caption", caption.clone().map(Toml::Text)),
            ("platform", platform.clone().map(Toml::Text)),
        ]),
    }
}

pub fn listing_toml_for(listing: &ListingToml) -> String {
    let translations = listing
        .translations
        .as_ref()
        .filter(|translations| !translations.is_empty())
        .map(|translations| {
            Toml::Table(
                translations
                    .iter()
                    .map(|(locale, words)| {
                        let entry = table(vec![
                            ("name", words.name.clone().map(Toml::Text)),
                            ("summary", words.summary.clone().map(Toml::Text)),
                            ("description", words.description.clone().map(Toml::Text)),
                            ("keywords", words.keywords.as_deref().map(texts)),
                        ]);
                        (locale.clone(), entry)
                    })
                    .collect(),
            )
        });
    let document = fields(vec![
        ("name", Some(listing.name.as_str().into())),
        ("summary", Some(listing.summary.as_str().into())),
        ("description", listing.description.clone().map(Toml::Text)),
        ("keywords", listing.keywords.as_deref().map(texts)),
        ("categories", listing.categories.as_deref().map(texts)),
        ("homepage", listing.homepage.clone().map(Toml::Text)),
        ("support", listing.support.clone().map(Toml::Text)),
        ("privacy_url", listing.privacy_url.clone().map(Toml::Text)),
        (
            "content_rating",
            listing.content_rating.clone().map(Toml::Text),
        ),
        ("brand_color", listing.brand_color.clone().map(Toml::Text)),
        ("icon", listing.icon.clone().map(Toml::Text)),
        (
            "screenshots",
            listing
                .screenshots
                .as_ref()
                .map(|shots| Toml::List(shots.iter().map(screenshot).collect())),
        ),
        ("listed", listing.listed.map(Toml::Truth)),
        ("indexed", listing.indexed.map(Toml::Truth)),
        ("translations", translations),
    ]);
    format!(
        "{}{}\n",
        schema_directive(LISTING_TOML),
        stringify(&document)
    )
}

const RELEASE_TRIGGER: &str = "on:\n  release:\n    types: [published]\n";
const PUBLISH_PERMISSIONS: [&str; 3] = ["contents: read", "id-token: write", "attestations: write"];
const CHANNEL_INPUT: &str = "          channel: ${{ inputs.channel }}\n";

fn version_file(format: &str) -> &'static str {
    if format == "sabine" {
        "Sabine.toml"
    } else {
        "extension.toml"
    }
}

fn dispatch_trigger(input: &SetupInput) -> String {
    let push = input.branch.as_ref().map_or_else(String::new, |branch| {
        format!(
            "  push:\n    branches: [{branch}]\n    paths: [{}]\n",
            version_file(&input.format)
        )
    });
    format!(
        "on:\n  workflow_dispatch:\n    inputs:\n      channel:\n        description: Channel\n        type: choice\n        options: [stable, beta, nightly]\n        default: stable\n{push}"
    )
}

fn header(trigger: &str, permissions: &[&str]) -> String {
    let permissions = permissions
        .iter()
        .map(|permission| format!("  {permission}"))
        .collect::<Vec<_>>()
        .join("\n");
    format!("name: Publish to Schelf\n\n{trigger}\npermissions:\n{permissions}\n\njobs:\n")
}

fn version_job(manifest: &str) -> String {
    format!(
        "  version:\n    runs-on: ubuntu-latest\n    outputs:\n      changed: ${{{{ github.event_name == 'workflow_dispatch' || steps.compare.outputs.changed == 'true' }}}}\n    steps:\n      - uses: actions/checkout@v7\n      - id: compare\n        if: github.event_name == 'push'\n        name: Check whether the version changed\n        run: |\n          git fetch --quiet --depth=1 origin \"${{{{ github.event.before }}}}\"\n          if git diff \"${{{{ github.event.before }}}}\" HEAD -- {manifest} | grep -q '^+version'; then echo changed=true >> \"$GITHUB_OUTPUT\"; fi\n"
    )
}

fn version_gate(input: &SetupInput) -> (String, &'static str) {
    if input.branch.is_some() {
        (
            version_job(version_file(&input.format)),
            "    needs: version\n    if: needs.version.outputs.changed == 'true'\n",
        )
    } else {
        (String::new(), "")
    }
}

const PUBLISH_JOB: &str = "  publish:\n    runs-on: ubuntu-latest\n";

fn sabine_workflow(input: &SetupInput) -> String {
    let version = sabine_version_of(input).unwrap_or_default();
    let (jobs, gate) = version_gate(input);
    let inputs: String = input
        .sabine_inputs
        .iter()
        .flatten()
        .map(|(name, value)| format!("      {name}: {value}\n"))
        .collect();
    let permissions = [
        "contents: write",
        PUBLISH_PERMISSIONS[1],
        PUBLISH_PERMISSIONS[2],
    ];
    format!(
        "{}{jobs}  build:\n{gate}    uses: {SABINE_REPOSITORY}/.github/workflows/release-app.yml@{version}\n    with:\n      sabine_version: {version}\n{inputs}      # Building the MSI package accepts the WiX 7 licence: https://docs.firegiant.com/wix/osmf/\n      accept_wix_eula: true\n    secrets: inherit\n{PUBLISH_JOB}    needs: build\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/download-artifact@v8\n        with:\n          pattern: release-*\n          path: dist\n          merge-multiple: true\n      - uses: {PUBLISH_ACTION}\n        with:\n          files: dist/**\n{CHANNEL_INPUT}",
        header(&dispatch_trigger(input), &permissions)
    )
}

fn release_assets_workflow(assets: &str) -> String {
    format!(
        "{}{PUBLISH_JOB}    steps:\n      - uses: actions/checkout@v7\n      - uses: {PUBLISH_ACTION}\n        with:\n          release-assets: \"{assets}\"\n",
        header(RELEASE_TRIGGER, &PUBLISH_PERMISSIONS)
    )
}

fn extension_with_helper_workflow(input: &SetupInput, path: &str, build: &str) -> String {
    let (jobs, gate) = version_gate(input);
    let id = &input.id;
    format!(
        "{}{jobs}  build:\n{gate}    strategy:\n      matrix:\n        runner: [ubuntu-24.04, ubuntu-24.04-arm]\n    runs-on: ${{{{ matrix.runner }}}}\n    steps:\n      - uses: actions/checkout@v7\n      - name: Build the helper\n        run: {build}\n      - name: Pack the extension with its helper\n        run: |\n          mkdir -p dist\n          git archive --format=tar --output=extension.tar HEAD\n          tar --append --file=extension.tar {path}\n          zstd -19 extension.tar -o \"dist/{id}-$(uname -m).tar.zst\"\n      - uses: actions/upload-artifact@v7\n        with:\n          name: extension-${{{{ matrix.runner }}}}\n          path: dist\n{PUBLISH_JOB}    needs: build\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/download-artifact@v8\n        with:\n          pattern: extension-*\n          path: dist\n          merge-multiple: true\n      - uses: {PUBLISH_ACTION}\n        with:\n          files: dist/*.tar.zst\n{CHANNEL_INPUT}",
        header(&dispatch_trigger(input), &PUBLISH_PERMISSIONS)
    )
}

fn extension_workflow(input: &SetupInput) -> String {
    let (jobs, gate) = version_gate(input);
    format!(
        "{}{jobs}{PUBLISH_JOB}{gate}    steps:\n      - uses: actions/checkout@v7\n      - run: mkdir -p dist && git archive --format=tar HEAD | zstd -19 -o dist/{}.tar.zst\n      - uses: {PUBLISH_ACTION}\n        with:\n          files: dist/*.tar.zst\n{CHANNEL_INPUT}",
        header(&dispatch_trigger(input), &PUBLISH_PERMISSIONS),
        input.id
    )
}

/// The workflow that publishes the project from GitHub Actions.
pub fn workflow_for(input: &SetupInput) -> String {
    match (input.format.as_str(), &input.helper) {
        ("sabine", _) => sabine_workflow(input),
        ("appimage", _) => release_assets_workflow("*.AppImage"),
        ("files", _) => release_assets_workflow("*"),
        (_, Some((path, build))) => extension_with_helper_workflow(input, path, build),
        _ => extension_workflow(input),
    }
}
