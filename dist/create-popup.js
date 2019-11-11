export function createPopup({ url, target, features, replace, windowOpen = window.open.bind(window) }) {
    const popup = windowOpen(url, target, features, replace);
    const postMessage = popup.postMessage.bind(popup);
    return { postMessage, popup };
}
//# sourceMappingURL=create-popup.js.map