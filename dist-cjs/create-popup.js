"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createPopup({ url, target, features, replace, windowOpen = window.open.bind(window) }) {
    const popup = windowOpen(url, target, features, replace);
    const postMessage = popup.postMessage.bind(popup);
    return { postMessage, popup };
}
exports.createPopup = createPopup;
//# sourceMappingURL=create-popup.js.map