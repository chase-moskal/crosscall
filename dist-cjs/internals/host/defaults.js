"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultShims = {
    postMessage: (() => {
        const { parent, opener } = window;
        if (parent && parent !== window)
            return parent.postMessage.bind(parent);
        else if (opener && opener !== window)
            return opener.postMessage.bind(opener);
        else
            return null;
    })(),
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window)
};
//# sourceMappingURL=defaults.js.map