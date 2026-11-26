import { lutOf, SHADER_MODE, shaderValues } from '#lib/adjust/adjustments.js';
import type { CompositeNode, LiveStroke } from '#lib/gpu/compositor.js';
import { device } from '#lib/gpu/device.js';
import type { Adjust } from '#lib/gpu/shaders/adjust.js';
import type { TileGrid } from '#lib/gpu/tiles.js';
import { parseColor } from '#lib/raster/color.js';
import { renderEffects, type EffectGrids } from '#lib/raster/effects.js';
import type { Layer } from './layers.svelte';

interface Cached<T> {
	key: string;
	value: T;
}

export interface Overrides {
	live: { layer: Layer; stroke: LiveStroke } | null;
	adjust: { layer: string; value: Adjust } | null;
	preview: { layer: string; grid: TileGrid } | null;
}

export class NodeBuilder {
	#luts = new Map<string, Cached<GPUTexture>>();
	#effects = new Map<string, Cached<EffectGrids>>();

	#lut(layer: Layer) {
		const key = JSON.stringify(layer.adjustment);
		const cached = this.#luts.get(layer.id);
		if (cached?.key === key) return cached.value;
		cached?.value.destroy();
		const texture = device.createTexture({ size: [256, 1], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
		device.queue.writeTexture({ texture }, lutOf(layer.adjustment!), { bytesPerRow: 256 * 4 }, [256, 1]);
		this.#luts.set(layer.id, { key, value: texture });
		return texture;
	}

	#effectGrids(layer: Layer) {
		const key = `${layer.version}|${JSON.stringify(layer.effects)}|${layer.pixels.tiles.size}`;
		const cached = this.#effects.get(layer.id);
		if (cached?.key === key) return cached.value;
		if (cached) for (const grid of Object.values(cached.value)) grid?.destroy();
		const value = renderEffects(layer, layer.effects!);
		this.#effects.set(layer.id, { key, value });
		return value;
	}

	effectsChanged(layers: Layer[]) {
		return layers.some((layer) => {
			if (!layer.effects || (!layer.effects.shadow.enabled && !layer.effects.stroke.enabled)) return this.#effects.has(layer.id);
			return this.#effects.get(layer.id)?.key !== `${layer.version}|${JSON.stringify(layer.effects)}|${layer.pixels.tiles.size}`;
		});
	}

	build(layers: Layer[], overrides: Overrides): CompositeNode[] {
		const children = new Map<string | null, Layer[]>();
		for (const layer of layers) {
			const parent = layer.parent && layers.some((other) => other.id === layer.parent) ? layer.parent : null;
			children.set(parent, [...(children.get(parent) ?? []), layer]);
		}
		const used = new Set<string>();
		const nodes = (parent: string | null): CompositeNode[] =>
			(children.get(parent) ?? []).flatMap((layer) => {
				used.add(layer.id);
				const shared = { mask: layer.maskEnabled ? layer.mask : null, opacity: layer.opacity, visible: layer.visible };
				if (layer.kind === 'group') return [{ ...shared, kind: 'group' as const, children: nodes(layer.id), blend: layer.blend }];
				if (layer.kind === 'adjustment' && layer.adjustment) {
					const tint = parseColor(layer.adjustment.mono.tint).slice(0, 3) as [number, number, number];
					return [{ ...shared, kind: 'adjustment' as const, lut: this.#lut(layer), mode: SHADER_MODE[layer.adjustment.type], values: shaderValues(layer.adjustment, tint) }];
				}
				const pixels = overrides.preview?.layer === layer.id ? overrides.preview.grid : layer.pixels;
				const own: CompositeNode = {
					...shared,
					kind: 'pixels',
					pixels,
					blend: layer.blend,
					stroke: overrides.live?.layer === layer ? overrides.live.stroke : null,
					adjust: overrides.adjust?.layer === layer.id ? overrides.adjust.value : null
				};
				const effects = layer.effects && (layer.effects.shadow.enabled || layer.effects.stroke.enabled) ? this.#effectGrids(layer) : null;
				const extra = (grid: TileGrid | null): CompositeNode[] => (grid && layer.visible ? [{ ...shared, mask: null, kind: 'pixels', pixels: grid, blend: 'normal', stroke: null, adjust: null }] : []);
				return [...extra(effects?.shadow ?? null), ...extra(effects?.stroke ?? null), own];
			});
		const built = nodes(null);
		for (const [id, cached] of this.#effects) {
			const layer = layers.find((candidate) => candidate.id === id);
			if (layer?.effects && (layer.effects.shadow.enabled || layer.effects.stroke.enabled)) continue;
			for (const grid of Object.values(cached.value)) grid?.destroy();
			this.#effects.delete(id);
		}
		for (const [id, cached] of this.#luts) if (!used.has(id)) (cached.value.destroy(), this.#luts.delete(id));
		return built;
	}

	destroy() {
		for (const cached of this.#luts.values()) cached.value.destroy();
		for (const cached of this.#effects.values()) for (const grid of Object.values(cached.value)) grid?.destroy();
	}
}
