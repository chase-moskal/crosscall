"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultShims = {
    createElement: document.createElement.bind(document),
    appendChild: document.body.appendChild.bind(document.body),
    removeChild: document.body.removeChild.bind(document.body),
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window)
};
exports.defaultPopupOptions = {
    target: undefined,
    features: undefined,
    replace: undefined
};
//# sourceMappingURL=defaults.js.map