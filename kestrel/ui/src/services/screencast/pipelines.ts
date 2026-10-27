import GLib from 'gi://GLib';
import Gst from 'gi://Gst';

export interface PipelineConfig {
  readonly id: string;
  readonly fileExtension: string;
  readonly pipelineString: string;
}

const FRAMERATE = 30;

const PIPELINES: readonly PipelineConfig[] = [
  {
    id: 'hwenc-dmabuf-h264-vaapi-lp',
    fileExtension: 'mp4',
    pipelineString:
      'capsfilter caps=video/x-raw(memory:DMABuf),format=DMA_DRM,max-framerate=%F/1 ! \
       vapostproc ! \
       vah264lpenc rate-control=vbr bitrate=2048 target-percentage=50 ! \
       queue ! \
       h264parse ! \
       mp4mux fragment-duration=500 fragment-mode=first-moov-then-finalise',
  },
  {
    id: 'hwenc-dmabuf-h264-vaapi',
    fileExtension: 'mp4',
    pipelineString:
      'capsfilter caps=video/x-raw(memory:DMABuf),format=DMA_DRM,max-framerate=%F/1 ! \
       vapostproc ! \
       vah264enc rate-control=vbr bitrate=2048 target-percentage=50 ! \
       queue ! \
       h264parse ! \
       mp4mux fragment-duration=500 fragment-mode=first-moov-then-finalise',
  },
  {
    id: 'swenc-dmabuf-h264-openh264',
    fileExtension: 'mp4',
    pipelineString:
      'capsfilter caps=video/x-raw(memory:DMABuf),max-framerate=%F/1 ! \
       glupload ! glcolorconvert ! gldownload ! \
       queue ! \
       openh264enc deblocking=off background-detection=false complexity=low adaptive-quantization=false qp-max=26 qp-min=26 multi-thread=%T slice-mode=auto ! \
       queue ! \
       h264parse ! \
       mp4mux fragment-duration=500 fragment-mode=first-moov-then-finalise',
  },
  {
    id: 'swenc-memfd-h264-openh264',
    fileExtension: 'mp4',
    pipelineString:
      'capsfilter caps=video/x-raw,max-framerate=%F/1 ! \
       videoconvert chroma-mode=none dither=none matrix-mode=output-only n-threads=%T ! \
       queue ! \
       openh264enc deblocking=off background-detection=false complexity=low adaptive-quantization=false qp-max=26 qp-min=26 multi-thread=%T slice-mode=auto ! \
       queue ! \
       h264parse ! \
       mp4mux fragment-duration=500 fragment-mode=first-moov-then-finalise',
  },
  {
    id: 'swenc-dmabuf-vp8-vp8enc',
    fileExtension: 'webm',
    pipelineString:
      'capsfilter caps=video/x-raw(memory:DMABuf),max-framerate=%F/1 ! \
       glupload ! glcolorconvert ! gldownload ! \
       queue ! \
       vp8enc cpu-used=16 max-quantizer=17 deadline=1 keyframe-mode=disabled threads=%T static-threshold=1000 buffer-size=20000 ! \
       queue ! \
       webmmux',
  },
  {
    id: 'swenc-memfd-vp8-vp8enc',
    fileExtension: 'webm',
    pipelineString:
      'capsfilter caps=video/x-raw,max-framerate=%F/1 ! \
       videoconvert chroma-mode=none dither=none matrix-mode=output-only n-threads=%T ! \
       queue ! \
       vp8enc cpu-used=16 max-quantizer=17 deadline=1 keyframe-mode=disabled threads=%T static-threshold=1000 buffer-size=20000 ! \
       queue ! \
       webmmux',
  },
];

const FALLBACK_PIPELINE = PIPELINES.at(-1)!;

export function canScreencast(): boolean {
  const [initialized] = Gst.init_check([]);
  if (!initialized) return false;
  if (['pipewiresrc', 'filesink'].some(e => Gst.ElementFactory.find(e) === null)) return false;

  const fallbackElements = FALLBACK_PIPELINE.pipelineString.split('!').map(e => e.trim().split(' ').at(0)!);
  return fallbackElements.every(e => Gst.ElementFactory.find(e) !== null);
}

export function* pipelineConfigs(): Generator<PipelineConfig, void> {
  if (Gst.Registry.get().check_feature_version('pipewiresrc', 0, 3, 67)) yield* PIPELINES;
  else yield FALLBACK_PIPELINE;
}

export function createPipeline(nodeId: number, { pipelineString }: PipelineConfig, filePath: string): Gst.Element {
  const numThreads = String(Math.min(Math.max(1, GLib.get_num_processors()), 64));
  const encoder = pipelineString.replaceAll('%T', numThreads).replaceAll('%F', String(FRAMERATE));

  return Gst.parse_launch_full(`
    pipewiresrc path=${nodeId}
                do-timestamp=true
                keepalive-time=1000
                resend-last=true !
    ${encoder} !
    filesink location="${filePath}"`, null, Gst.ParseFlags.FATAL_ERRORS);
}
