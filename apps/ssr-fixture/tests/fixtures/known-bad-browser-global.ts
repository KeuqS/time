// Intentionally invalid: the failure task proves module-scope browser access is rejected by SSR.
const viewportWidth = window.innerWidth;

console.log(viewportWidth);
