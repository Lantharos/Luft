import type { PhotoSource } from '../source';
import { clipMatrix, type Placement } from './matrix';

const VERTEX = `#version 300 es
in vec2 corner;
uniform mat3 transform;
uniform vec4 tile;
out vec2 uv;
void main() {
	uv = corner;
	vec3 position = transform * vec3(tile.xy + corner * tile.zw, 1.0);
	gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D image;
uniform bool straight;
in vec2 uv;
out vec4 color;
void main() {
	vec4 texel = texture(image, uv);
	color = straight ? vec4(texel.rgb * texel.a, texel.a) : texel;
}`;

const PIXELATED_FROM = 3;

type Raster = Exclude<PhotoSource, { type: 'element' }>;

interface Tile {
	texture: WebGLTexture;
	x: number;
	y: number;
	width: number;
	height: number;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

export class PhotoRenderer {
	#gl: WebGL2RenderingContext;
	#program: WebGLProgram;
	#transform: WebGLUniformLocation;
	#tile: WebGLUniformLocation;
	#straight: WebGLUniformLocation;
	#tiles: Tile[] = [];
	#pixelated = false;

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' });
		if (!gl) throw new Error('WebGL 2 is unavailable');
		this.#gl = gl;
		const program = gl.createProgram();
		gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
		gl.linkProgram(program);
		gl.useProgram(program);
		this.#program = program;
		this.#transform = gl.getUniformLocation(program, 'transform')!;
		this.#tile = gl.getUniformLocation(program, 'tile')!;
		this.#straight = gl.getUniformLocation(program, 'straight')!;
		const corners = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, corners);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
		const location = gl.getAttribLocation(program, 'corner');
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}

	upload(source: Raster) {
		const gl = this.#gl;
		this.#release();
		const limit = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
		const channels = source.type === 'pixels' ? source.channels : 4;
		const format = channels === 3 ? gl.RGB : gl.RGBA;
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, source.type === 'bitmap');
		gl.uniform1i(this.#straight, source.type === 'pixels' ? 1 : 0);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.pixelStorei(gl.UNPACK_ROW_LENGTH, source.type === 'pixels' ? source.width : 0);
		for (let y = 0; y < source.height; y += limit) {
			for (let x = 0; x < source.width; x += limit) {
				const width = Math.min(limit, source.width - x);
				const height = Math.min(limit, source.height - y);
				const texture = gl.createTexture()!;
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x);
				gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y);
				if (source.type === 'pixels') {
					gl.texImage2D(gl.TEXTURE_2D, 0, channels === 3 ? gl.RGB8 : gl.RGBA8, width, height, 0, format, gl.UNSIGNED_BYTE, source.data);
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source.image);
				}
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				this.#tiles.push({ texture, x, y, width, height });
			}
		}
		gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
		gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
		gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
		this.#pixelated = false;
	}

	draw(placement: Placement) {
		const gl = this.#gl;
		const canvas = gl.canvas as HTMLCanvasElement;
		const width = Math.round(placement.stageWidth * placement.pixelRatio);
		const height = Math.round(placement.stageHeight * placement.pixelRatio);
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const pixelated = placement.scale * placement.pixelRatio >= PIXELATED_FROM;
		gl.uniformMatrix3fv(this.#transform, false, clipMatrix(placement));
		for (const tile of this.#tiles) {
			gl.bindTexture(gl.TEXTURE_2D, tile.texture);
			if (pixelated !== this.#pixelated) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, pixelated ? gl.NEAREST : gl.LINEAR);
			}
			gl.uniform4f(this.#tile, tile.x, tile.y, tile.width, tile.height);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
		this.#pixelated = pixelated;
	}

	destroy() {
		this.#release();
		this.#gl.deleteProgram(this.#program);
		this.#gl.getExtension('WEBGL_lose_context')?.loseContext();
	}

	#release() {
		for (const tile of this.#tiles) this.#gl.deleteTexture(tile.texture);
		this.#tiles = [];
	}
}
