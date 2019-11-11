export class CreateIframeError extends Error {
    constructor() {
        super(...arguments);
        this.name = this.constructor.name;
    }
}
const err = (message) => new CreateIframeError(message);
export async function createIframe({ url, documentCreateElement = document.createElement.bind(document), documentBodyAppendChild = document.body.appendChild.bind(document.body) }) {
    try {
        const precheck = await fetch(url);
        if (precheck.status !== 200)
            throw err(`createIframe failed to load "${url}"`);
    }
    catch (error) {
        throw err(`createIframe failed to load "${url}": ${error.message}`);
    }
    const iframe = documentCreateElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    documentBodyAppendChild(iframe);
    const postMessage = (message, targetOrigin, transfer) => iframe.contentWindow.postMessage(message, targetOrigin, transfer);
    return { postMessage, iframe };
}
//# sourceMappingURL=create-iframe.js.map