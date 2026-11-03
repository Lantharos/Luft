import type { VisualizerStyle } from './settings.svelte';
import { FRAGMENTS, VERTEX } from './shaders';
import { BAND_COUNT } from './spectrum';

export interface Scene {
	style: VisualizerStyle;
	time: number;
	center: [number, number];
	cover: [number, number];
	colors: Float32Array;
	energy: Float32Array;
	bands: Uint8Array;
	strength: number;
	scale: number;
}

const UNIFORMS = ['u_size', 'u_time', 'u_center', 'u_cover', 'u_colors', 'u_energy', 'u_strength', 'u_scale', 'u_bands'] as const;

type Uniform = (typeof UNIFORMS)[number];

interface Program {
	program: WebGLProgram;
	uniforms: Record<Uniform, WebGLUniformLocation | null>;
}

export class Renderer {
	#canvas: HTMLCanvasElement;
	#gl: WebGL2RenderingContext;
	#programs = new Map<VisualizerStyle, Program>();

	constructor(canvas: HTMLCanvasElement) {
		this.#canvas = canvas;
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: 'low-power'
		})!;
		gl.bindVertexArray(gl.createVertexArray());
		gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, BAND_COUNT, 1, 0, gl.RED, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		this.#gl = gl;
	}

	resize(width: number, height: number) {
		this.#canvas.width = width;
		this.#canvas.height = height;
		this.#gl.viewport(0, 0, width, height);
	}

	draw(scene: Scene) {
		const gl = this.#gl;
		const { program, uniforms } = this.#program(scene.style);
		gl.useProgram(program);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, BAND_COUNT, 1, gl.RED, gl.UNSIGNED_BYTE, scene.bands);
		gl.uniform2f(uniforms.u_size, this.#canvas.width, this.#canvas.height);
		gl.uniform1f(uniforms.u_time, scene.time);
		gl.uniform2f(uniforms.u_center, ...scene.center);
		gl.uniform2f(uniforms.u_cover, ...scene.cover);
		gl.uniform3fv(uniforms.u_colors, scene.colors);
		gl.uniform3fv(uniforms.u_energy, scene.energy);
		gl.uniform1f(uniforms.u_strength, scene.strength);
		gl.uniform1f(uniforms.u_scale, scene.scale);
		gl.uniform1i(uniforms.u_bands, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	destroy() {
		this.#gl.getExtension('WEBGL_lose_context')?.loseContext();
	}

	#program(style: VisualizerStyle) {
		const cached = this.#programs.get(style);
		if (cached) return cached;
		const gl = this.#gl;
		const program = gl.createProgram();
		gl.attachShader(program, this.#shader(gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(program, this.#shader(gl.FRAGMENT_SHADER, FRAGMENTS[style]));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Visualizer shader failed to link');
		const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Program['uniforms'];
		const built = { program, uniforms };
		this.#programs.set(style, built);
		return built;
	}

	#shader(type: GLenum, source: string) {
		const gl = this.#gl;
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Visualizer shader failed to compile');
		return shader;
	}
}
