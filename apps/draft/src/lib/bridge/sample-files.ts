export const SAMPLE_HOME = '/home/draft';
export const SAMPLE_FOLDER = `${SAMPLE_HOME}/projects/heron`;

const README = `# Heron

Heron keeps a small index of the places you visit and draws them on a map.

## Building

\`\`\`bash
cargo build --release
./target/release/heron --import places.csv
\`\`\`

## Configuration

| Key | Default | Meaning |
| --- | --- | --- |
| \`zoom\` | 12 | Starting zoom level |
| \`tiles\` | \`osm\` | Tile source |

The map is drawn with **vector tiles**, so it stays sharp when you zoom in. See [the tile guide](https://example.com/tiles) for more.

> Places sync between devices when \`sync = true\`.

- Import from CSV or GPX
- Search by name or tag
- Export to GeoJSON
`;

const MAIN_RS = `use std::collections::HashMap;
use std::path::PathBuf;

use serde::Deserialize;

/// A place someone has visited.
#[derive(Debug, Clone, Deserialize)]
pub struct Place {
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    tags: Vec<String>,
}

const DEFAULT_ZOOM: u8 = 12;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let path = std::env::args().nth(1).map(PathBuf::from).unwrap_or_default();
    let places: Vec<Place> = csv::Reader::from_path(&path)?
        .deserialize()
        .collect::<Result<_, _>>()?;
    let mut by_tag: HashMap<&str, usize> = HashMap::new();
    for place in &places {
        for tag in &place.tags {
            *by_tag.entry(tag.as_str()).or_default() += 1;
        }
    }
    println!("{} places, zoom {DEFAULT_ZOOM}", places.len());
    Ok(())
}
`;

const MAP_TS = `import { type Place, distance } from './geo';

export interface MapView {
	center: [number, number];
	zoom: number;
}

const EARTH_RADIUS_KM = 6371;

export class PlaceIndex {
	#places = new Map<string, Place>();

	constructor(private readonly view: MapView) {}

	add(place: Place) {
		this.#places.set(place.name.toLowerCase(), place);
		return this;
	}

	nearest(latitude: number, longitude: number, limit = 5): Place[] {
		return [...this.#places.values()]
			.map((place) => ({ place, km: distance(place, { latitude, longitude }) * EARTH_RADIUS_KM }))
			.sort((a, b) => a.km - b.km)
			.slice(0, limit)
			.map(({ place }) => place);
	}

	get size() {
		return this.#places.size;
	}
}

export const matches = (query: string) => /^[a-z\\s-]+$/i.test(query) ? query.trim() : null;
`;

const APP_SVELTE = `<script lang="ts">
	import { PlaceIndex } from './map';

	let { places = [] }: { places: string[] } = $props();
	let query = $state('');
	let visible = $derived(places.filter((place) => place.includes(query)));
</script>

<input bind:value={query} placeholder="Find a place" />

{#each visible as place (place)}
	<p class="place">{place}</p>
{/each}

<style>
	.place {
		color: var(--text-soft);
	}
</style>
`;

const CARGO = `[package]
name = "heron"
version = "0.3.0"
edition = "2024"

[dependencies]
csv = "1.3"
serde = { version = "1", features = ["derive"] }
`;

const PACKAGE = `{
	"name": "heron-web",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"build": "vite build"
	},
	"devDependencies": {
		"svelte": "^5.57.1",
		"vite": "^8.3.1"
	}
}
`;

const STYLES = `:root {
	--map-water: #9fb7c9;
	--map-land: #e8e4d8;
}

.map {
	position: relative;
	inset: 0;
	border-radius: 16px;
	background: var(--map-land);
}

@media (prefers-color-scheme: dark) {
	.map {
		filter: invert(0.9) hue-rotate(180deg);
	}
}
`;

const NOTES = `Things to look at next week

- tile cache grows without a limit
- GPX import drops the elevation
- ask about the offline maps
`;

const PLACES = `name,latitude,longitude,tags
Lake Bled,46.3625,14.0936,water;hike
Triglav,46.3783,13.8369,summit
Piran,45.5283,13.5681,sea;town
`;

const SERVER_PY = `import json
from http.server import BaseHTTPRequestHandler, HTTPServer


class PlaceHandler(BaseHTTPRequestHandler):
    """Serves the place index as JSON."""

    places: list[dict] = []

    def do_GET(self) -> None:
        body = json.dumps(self.places).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8080), PlaceHandler).serve_forever()
`;

export const SAMPLE_FILES: Record<string, string> = {
	[`${SAMPLE_FOLDER}/README.md`]: README,
	[`${SAMPLE_FOLDER}/Cargo.toml`]: CARGO,
	[`${SAMPLE_FOLDER}/src/main.rs`]: MAIN_RS,
	[`${SAMPLE_FOLDER}/web/package.json`]: PACKAGE,
	[`${SAMPLE_FOLDER}/web/src/map.ts`]: MAP_TS,
	[`${SAMPLE_FOLDER}/web/src/App.svelte`]: APP_SVELTE,
	[`${SAMPLE_FOLDER}/web/src/styles.css`]: STYLES,
	[`${SAMPLE_FOLDER}/tools/server.py`]: SERVER_PY,
	[`${SAMPLE_FOLDER}/data/places.csv`]: PLACES,
	[`${SAMPLE_FOLDER}/notes.txt`]: NOTES
};

export function sampleLog(megabytes: number) {
	const levels = ['INFO', 'DEBUG', 'WARN', 'INFO', 'ERROR'];
	const lines: string[] = [];
	let size = 0;
	for (let index = 0; size < megabytes * 1024 * 1024; index++) {
		const line = `2026-09-29T12:${String(Math.floor(index / 60) % 60).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}.${String(index % 1000).padStart(3, '0')}Z ${levels[index % 5]} heron::tiles request ${index} served tile z=12 x=${2200 + (index % 97)} y=${1400 + (index % 31)} in ${index % 17}ms`;
		lines.push(line);
		size += line.length + 1;
	}
	return lines.join('\n');
}
