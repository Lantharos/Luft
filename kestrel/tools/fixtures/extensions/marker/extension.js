export default function enable(marker) {
  (globalThis.markers ??= []).push(marker.id);
}
