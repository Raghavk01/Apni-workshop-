import L from "leaflet";

// Safeguard Leaflet against asynchronous React unmount DOM crashes
// Prevents "Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')"
if (typeof window !== "undefined" && L && L.DomUtil) {
  const originalGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: HTMLElement) {
    if (!el) {
      return new L.Point(0, 0);
    }
    try {
      return originalGetPosition.call(L.DomUtil, el) || new L.Point(0, 0);
    } catch {
      return new L.Point(0, 0);
    }
  };

  const originalSetPosition = L.DomUtil.setPosition;
  L.DomUtil.setPosition = function (el: HTMLElement, point: L.Point) {
    if (!el) return;
    try {
      originalSetPosition.call(L.DomUtil, el, point);
    } catch (e) {
      // Silently ignore DOM positioning on detached elements
    }
  };
}

export function safeMapRemove(map: L.Map | null) {
  if (!map) return;
  try {
    map.stop(); // Stop all running pan/zoom animations
    map.off();  // Unbind all event listeners
    map.remove(); // Remove map and layers
  } catch (e) {
    console.warn("Safe map removal warning:", e);
  }
}
