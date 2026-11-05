const state = globalThis.shaders = { problems: [] };
const everyWindow = () => true;

export default function enable(api) {
  const { screenEffects } = api;
  const noted = label => (problem, detail) => state.problems.push({ label, problem, detail });
  state.check = source => screenEffects.check(source);
  state.windowShader = shader => screenEffects.addWindowShader({ label: 'Window', shader, match: everyWindow, onProblem: noted('Window') });
  state.overlay = shader => screenEffects.addWindowOverlay({ label: 'Overlay', shader, match: everyWindow, onProblem: noted('Overlay') });
  state.filter = (shader, options = {}) => screenEffects.addDesktopFilter({ label: 'Filter', passes: [{ shader }], onProblem: noted('Filter'), ...options });
  state.surfaces = (shader, surfaces) => screenEffects.addSurfaceOverlay({ label: 'Surfaces', surfaces, shader, onProblem: noted('Surfaces') });
  state.transition = (shader, kinds, duration) => screenEffects.addWindowTransition({ label: 'Transition', shader, kinds, duration, match: everyWindow, onProblem: noted('Transition') });
  state.turnBackOn = () => screenEffects.turnBackOn();
  state.off = () => screenEffects.off;
}
