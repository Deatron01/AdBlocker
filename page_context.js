// page_context.js
// Ez a script a MAIN world-ben fut, így közvetlenül hozzáfér a weboldal globális változóihoz.

const originalOpen = window.open;

window.open = function(url, windowName, windowFeatures) {
    console.warn("🚫 Az Adblocker megakadályozott egy automatikus felugró ablakot a weboldal saját scriptjéből:", url);
    // Ha nagyon akarod, itt visszatérhetsz originalOpen(...) hívással kivételek esetén,
    // de egyelőre mindent blokkolunk, és null-t adunk vissza.
    return null; 
};