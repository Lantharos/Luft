use std::io::Read;
use std::sync::OnceLock;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

use super::archive;

const API: &str = "https://api.gnome-look.org/ocs/v1/content";
const PRODUCT_PAGE: &str = "https://www.gnome-look.org/p";
const IMAGE_CACHE: &str = "https://images.pling.com/cache/320x224-2/img/";
const CURSOR_CATEGORY: u32 = 107;
const PAGE_SIZE: u32 = 20;
const USER_AGENT: &str = "Luft Settings";
const UNREACHABLE: &str =
    "GNOME-Look can't be reached right now. Check your connection and try again.";

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum Order {
    Popular,
    Rating,
    Newest,
}

impl Order {
    fn sortmode(self) -> &'static str {
        match self {
            Order::Popular => "down",
            Order::Rating => "high",
            Order::Newest => "new",
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Query {
    search: String,
    order: Order,
    page: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Download {
    pub index: u32,
    pub name: String,
    pub size: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    id: u64,
    name: String,
    author: String,
    rating: f64,
    downloads: u64,
    preview: Option<String>,
    files: Vec<Download>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    items: Vec<Item>,
    pages: u32,
}

pub fn agent() -> &'static Agent {
    static AGENT: OnceLock<Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        Agent::config_builder()
            .user_agent(USER_AGENT)
            .timeout_connect(Some(Duration::from_secs(15)))
            .timeout_recv_response(Some(Duration::from_secs(30)))
            .tls_config(
                TlsConfig::builder()
                    .root_certs(RootCerts::PlatformVerifier)
                    .build(),
            )
            .build()
            .into()
    })
}

fn text(item: &Map<String, Value>, key: &str) -> String {
    match item.get(key) {
        Some(Value::String(value)) => value.trim().to_string(),
        Some(Value::Number(value)) => value.to_string(),
        _ => String::new(),
    }
}

fn number(item: &Map<String, Value>, key: &str) -> u64 {
    text(item, key).parse().unwrap_or_default()
}

fn thumbnail(url: &str) -> Option<String> {
    let (_, image) = url.split_once("/img/")?;
    Some(format!("{IMAGE_CACHE}{image}"))
}

fn downloads(item: &Map<String, Value>) -> impl Iterator<Item = (u32, String)> + '_ {
    (1..)
        .map_while(move |index| {
            item.contains_key(&format!("downloadname{index}"))
                .then_some(index)
        })
        .map(move |index| (index, text(item, &format!("downloadname{index}"))))
        .filter(move |(index, name)| {
            archive::Format::of(name).is_some()
                && !text(item, &format!("downloadlink{index}")).is_empty()
        })
}

fn item(item: &Map<String, Value>) -> Item {
    Item {
        id: number(item, "id"),
        name: text(item, "name"),
        author: text(item, "personid"),
        rating: number(item, "score") as f64 / 10.0,
        downloads: number(item, "downloads"),
        preview: thumbnail(&text(item, "previewpic1")),
        files: downloads(item)
            .map(|(index, name)| Download {
                size: number(item, &format!("downloadsize{index}")) * 1024,
                index,
                name,
            })
            .collect(),
    }
}

fn get(url: &str, query: &[(&str, &str)]) -> Result<Map<String, Value>, String> {
    let mut request = agent().get(url).query("format", "json");
    for (key, value) in query {
        request = request.query(*key, *value);
    }
    let mut body = String::new();
    request
        .call()
        .map_err(|_| UNREACHABLE.to_string())?
        .into_body()
        .into_reader()
        .read_to_string(&mut body)
        .map_err(|_| UNREACHABLE.to_string())?;
    let response: Map<String, Value> =
        serde_json::from_str(&body).map_err(|_| UNREACHABLE.to_string())?;
    match response.get("status").and_then(Value::as_str) {
        Some("ok") => Ok(response),
        _ => Err(format!(
            "GNOME-Look couldn't answer: {}",
            text(&response, "message")
        )),
    }
}

fn entries(response: &Map<String, Value>) -> impl Iterator<Item = &Map<String, Value>> {
    response
        .get("data")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(Value::as_object)
}

pub fn browse(
    Query {
        search,
        order,
        page,
    }: Query,
) -> Result<Page, String> {
    let (category, size, page) = (
        CURSOR_CATEGORY.to_string(),
        PAGE_SIZE.to_string(),
        page.to_string(),
    );
    let mut query = vec![
        ("categories", category.as_str()),
        ("pagesize", size.as_str()),
        ("page", page.as_str()),
        ("sortmode", order.sortmode()),
    ];
    let search = search.trim();
    if !search.is_empty() {
        query.push(("search", search));
    }
    let response = get(&format!("{API}/data"), &query)?;
    Ok(Page {
        items: entries(&response).map(item).collect(),
        pages: number(&response, "totalitems").div_ceil(PAGE_SIZE as u64) as u32,
    })
}

pub fn download_link(id: u64, index: u32) -> Result<(String, String), String> {
    let response = get(&format!("{API}/data/{id}"), &[])?;
    let item = entries(&response)
        .next()
        .ok_or("This theme is no longer available")?;
    let link = text(item, &format!("downloadlink{index}"));
    let name = text(item, &format!("downloadname{index}"));
    if link.is_empty() || archive::Format::of(&name).is_none() {
        return Err("This download is no longer available".into());
    }
    Ok((link, name))
}

pub fn product_page(id: u64) -> String {
    format!("{PRODUCT_PAGE}/{id}")
}
