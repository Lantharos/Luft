export let device: GPUDevice;
export let canvasFormat: GPUTextureFormat;

export async function startGpu() {
	const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance', featureLevel: 'compatibility' });
	if (!adapter) throw new Error('No graphics adapter');
	device = await adapter.requestDevice({
		requiredLimits: {
			maxTextureDimension2D: adapter.limits.maxTextureDimension2D,
			maxBufferSize: adapter.limits.maxBufferSize
		}
	});
	canvasFormat = navigator.gpu.getPreferredCanvasFormat();
}
