export default function enable(newer) {
  (globalThis.markers ??= []).push(newer.id);
}
